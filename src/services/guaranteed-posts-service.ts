'use client';

import { collection, getDocs, addDoc, orderBy, query, where } from 'firebase/firestore';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getUserById } from '@/services/talent-space'; // Corrected import
import type { Post as BasePost, User } from '@/types/talent-space';
import { posts as mockPosts, users as mockUsers } from '@/data/talent-space'; // Import mock data

/**
 * Safely converts a timestamp field to a Date object.
 * Handles Firebase Timestamps, Date objects, ISO strings, and undefined/null values.
 */
function toDate(timestamp: any): Date {
  if (!timestamp) {
    return new Date();
  }
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a Firebase Timestamp with toDate method
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // If it's a string (ISO date string)
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  // If it has seconds property (Timestamp-like object)
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  // Fallback
  return new Date();
}

// TODO: tighten this type to a proper User shape
export interface GuaranteedPost extends BasePost {
  author: any;
}

export class GuaranteedPostsService {
  private static cache: GuaranteedPost[] = [];
  private static lastFetch: number = 0;
  private static readonly CACHE_TIME = 30000; // 30 seconds

  private static async fetchAuthors(postsData: any[]): Promise<Map<string, User>> {
    const authorIds = [...new Set(postsData.map(p => p.author?.id || p.userId).filter(Boolean))];
    const authorPromises = authorIds.map(id => getUserById(id));
    const authors = await Promise.all(authorPromises);
    const authorsMap = new Map<string, User>();
    authors.forEach(author => {
      if (author) {
        authorsMap.set(author.id, author);
      }
    });
    return authorsMap;
  }

  static async fetchPosts(forceRefresh = false): Promise<{
    success: boolean;
    data: GuaranteedPost[];
    error?: string;
    fromCache: boolean;
  }> {
    try {
      const now = Date.now();
      if (!forceRefresh && this.cache.length > 0 && (now - this.lastFetch) < this.CACHE_TIME) {
        return { success: true, data: this.cache, fromCache: true };
      }

      const postsRef = collection(db, 'posts');
      const postsQuery = query(postsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(postsQuery);

      if (querySnapshot.empty) {
        const mockAuthorsMap = new Map(mockUsers.map(u => [u.id, u]));
        const enrichedMockPosts: GuaranteedPost[] = mockPosts.map(post => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.createdAt),
          author: mockAuthorsMap.get((post as any).userId) || mockUsers[0],
        }));
        this.cache = enrichedMockPosts;
        this.lastFetch = now;
        return { success: true, data: this.cache, fromCache: false };
      }
      
      // TODO: replace `any` with Firestore types (QueryDocumentSnapshot<DocumentData>)
      const postsData = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      const authorsMap = await this.fetchAuthors(postsData);

      // TODO: replace `any` with proper data type
      const posts: GuaranteedPost[] = postsData.map((data: any) => {
        const author = authorsMap.get(data.author?.id) || authorsMap.get(data.userId) || { id: data.author?.id || data.userId || 'unknown', name: data.author?.name || 'Unknown User', headline: '', avatarUrl: data.author?.avatar || '' };
        return {
          id: data.id,
          content: data.content || '',
          author,
          media: data.media || [],
          tags: data.tags || [],
          likes: data.likes || [],
          comments: data.comments || [],
          shares: data.shares || 0,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
          isEdited: data.isEdited || false,
        } as GuaranteedPost;
      });

      this.cache = posts;
      this.lastFetch = now;

      return { success: true, data: posts, fromCache: false };

    } catch (error: any) {
      const mockAuthorsMap = new Map(mockUsers.map(u => [u.id, u]));
      const enrichedMockPosts: GuaranteedPost[] = mockPosts.map(post => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.createdAt),
        author: mockAuthorsMap.get((post as any).userId) || mockUsers[0],
      }));
      this.cache = enrichedMockPosts;
      this.lastFetch = Date.now();
      return { success: true, data: this.cache, fromCache: false, error: error.message };
    }
  }
}

export default GuaranteedPostsService;

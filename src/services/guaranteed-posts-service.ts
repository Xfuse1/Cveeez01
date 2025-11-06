
'use client';

import { collection, getDocs, addDoc, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getUserById } from './talent-space'; // Make sure this function is robust
import type { Post, User } from '@/types/talent-space';
import { posts as mockPosts, users as mockUsers } from '@/data/talent-space'; // Import mock data

export interface GuaranteedPost extends Post {
  author: User;
}

export class GuaranteedPostsService {
  private static cache: GuaranteedPost[] = [];
  private static lastFetch: number = 0;
  private static readonly CACHE_TIME = 30000; // 30 seconds

  private static async fetchAuthors(postsData: any[]): Promise<Map<string, User>> {
    const authorIds = [...new Set(postsData.map(p => p.userId).filter(Boolean))];
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
      console.log('🔄 [Guaranteed] Fetching posts...');

      const now = Date.now();
      if (!forceRefresh && this.cache.length > 0 && (now - this.lastFetch) < this.CACHE_TIME) {
        console.log('📦 [Guaranteed] Returning data from cache');
        return { success: true, data: this.cache, fromCache: true };
      }

      const postsRef = collection(db, 'posts');
      const postsQuery = query(postsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(postsQuery);

      if (querySnapshot.empty) {
        console.log('🟡 [Guaranteed] No posts in Firestore, using mock data.');
        const mockAuthorsMap = new Map(mockUsers.map(u => [u.id, u]));
        const enrichedMockPosts: GuaranteedPost[] = mockPosts.map(post => ({
          ...post,
          author: mockAuthorsMap.get(post.userId) || mockUsers[0],
        }));
        this.cache = enrichedMockPosts;
        this.lastFetch = now;
        return { success: true, data: this.cache, fromCache: false };
      }
      
      const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const authorsMap = await this.fetchAuthors(postsData);

      const posts: GuaranteedPost[] = postsData.map(data => {
        const author = authorsMap.get(data.userId) || { id: data.userId, name: 'مستخدم غير معروف', headline: '', avatarUrl: '' };
        return {
          id: data.id,
          userId: data.userId,
          content: data.content || '',
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          linkUrl: data.linkUrl,
          likes: data.likes || 0,
          likedBy: data.likedBy || [],
          comments: data.comments || 0,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          author: author
        };
      });

      console.log(`✅ [Guaranteed] Fetched ${posts.length} posts successfully`);
      this.cache = posts;
      this.lastFetch = now;

      return { success: true, data: posts, fromCache: false };

    } catch (error: any) {
      console.error('❌ [Guaranteed] Failed to fetch posts:', error);
      console.log('🔄 [Guaranteed] Using mock data due to error.');
      const mockAuthorsMap = new Map(mockUsers.map(u => [u.id, u]));
      const enrichedMockPosts: GuaranteedPost[] = mockPosts.map(post => ({
        ...post,
        author: mockAuthorsMap.get(post.userId) || mockUsers[0],
      }));
      this.cache = enrichedMockPosts; // Cache mock data on error
      this.lastFetch = Date.now();
      return { success: true, data: this.cache, fromCache: false, error: error.message };
    }
  }
}

export default GuaranteedPostsService;

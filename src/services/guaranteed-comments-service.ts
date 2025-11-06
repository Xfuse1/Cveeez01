'use client';

import { 
  collection, 
  getDocs, 
  addDoc, 
  orderBy, 
  query, 
  where, 
  Timestamp,
  doc,
  getDoc 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getUserById } from '@/services/talent-space';
import type { User } from '@/types/talent-space';
import { users as mockUsers } from '@/data/talent-space';

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

export interface GuaranteedComment {
  id: string;
  postId: string;
  content: string;
  author: User; // Changed to full User object
  createdAt: Date;
  likes: number;
  parentId?: string;
  status: 'published' | 'deleted';
}

export class GuaranteedCommentsService {
  private static userCache: Map<string, User> = new Map();

  private static async getCachedUser(userId: string): Promise<User> {
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)!;
    }
    // Try fetching from mock data first for consistency in fallback scenarios
    const mockUser = mockUsers.find(u => u.id === userId);
    if (mockUser) {
      this.userCache.set(userId, mockUser);
      return mockUser;
    }
    const user = await getUserById(userId);
    if (user) {
      this.userCache.set(userId, user);
      return user;
    }
    const defaultUser = { id: userId, name: 'User', headline: '', avatarUrl: '' };
    this.userCache.set(userId, defaultUser);
    return defaultUser;
  }

  static async getCommentsByPostId(postId: string): Promise<{
    success: boolean;
    data: GuaranteedComment[];
    error?: string;
  }> {
    try {
      const commentsRef = collection(db, 'comments');
      const commentsQuery = query(
        commentsRef,
        where('postId', '==', postId),
        where('status', '==', 'published'),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(commentsQuery);

      if (snapshot.empty) {
        return { success: true, data: [] };
      }

      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const authorIds = [...new Set(commentsData.map(c => c.authorId).filter(Boolean))];
      await Promise.all(authorIds.map(id => this.getCachedUser(id))); // Pre-warm cache

      const comments: GuaranteedComment[] = await Promise.all(
        commentsData.map(async (data) => {
          const author = await this.getCachedUser(data.authorId);
          return {
            id: data.id,
            postId: data.postId,
            content: data.content,
            author,
            createdAt: toDate(data.createdAt),
            likes: data.likes || 0,
            parentId: data.parentId,
            status: 'published',
          };
        })
      );
      
      return { success: true, data: comments };
    } catch (error: any) {
      console.error(`❌ [Comments] Failed to fetch comments: ${error.message}`);
      return { success: false, data: [], error: error.message };
    }
  }

  static async addComment(postId: string, commentData: {
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    parentId?: string;
  }): Promise<{
    success: boolean;
    commentId?: string;
    error?: string;
  }> {
    try {
      if (!commentData.content.trim()) {
        throw new Error('Comment content is required');
      }

      console.log(`📝 [Firestore] Attempting to add a document to the 'comments' collection.`);
      const commentsRef = collection(db, 'comments');
      const newComment = {
        postId: postId,
        content: commentData.content.trim(),
        authorId: commentData.authorId, // Important: Store only the ID
        parentId: commentData.parentId || null,
        createdAt: Timestamp.now(),
        likes: 0,
        status: 'published'
      };

      const docRef = await addDoc(commentsRef, newComment);
      console.log(`✅ [Firestore] Successfully added document to 'comments' with ID: ${docRef.id}`);
      return { success: true, commentId: docRef.id };
    } catch (error: any) {
      console.error(`❌ [Comments] Failed to add comment: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  static async likeComment(commentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock implementation
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default GuaranteedCommentsService;

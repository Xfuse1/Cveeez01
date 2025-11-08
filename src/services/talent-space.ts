'use client';

import { db } from '@/firebase/config';
import type { Post, Comment, User, Job, Message } from '@/types/talent-space';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment,
  Timestamp,
  writeBatch,
  deleteDoc,
  limit,
  onSnapshot,
  Unsubscribe,
  collectionGroup,
} from 'firebase/firestore';
import { posts as mockPosts, users as mockUsers } from '@/data/talent-space';

interface CreatePostData {
  userId: string;
  content: string;
  mediaUrl?: string; // Expect a URL now
}

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

export async function getUserById(userId: string): Promise<User | null> {
    if (!userId) return null;
    const mockUser = mockUsers.find(u => u.id === userId);
    if(mockUser) return mockUser;

    const defaultUser = {
        id: userId,
        name: 'User ' + userId.substring(0, 5),
        headline: 'Professional Headline',
        avatarUrl: `https://i.pravatar.cc/150?u=${userId}`
    };
    return defaultUser;
}

export class TalentSpaceService {
  
  private static sanitizePostData(data: any): Post {
    return {
      id: data.id || '',
      content: data.content || '',
      author: {
        id: data.author?.id || 'unknown',
        name: data.author?.name || 'مستخدم',
        avatar: data.author?.avatar || ''
      },
      media: Array.isArray(data.media) ? data.media : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      likes: Array.isArray(data.likes) ? data.likes : [],
      comments: Array.isArray(data.comments) ? data.comments.map((comment: any) => ({
        id: comment.id || Date.now().toString(),
        content: comment.content || '',
        author: {
          id: comment.author?.id || 'unknown',
          name: comment.author?.name || 'مستخدم',
          avatar: comment.author?.avatar || ''
        },
        createdAt: toDate(comment.createdAt),
        likes: Array.isArray(comment.likes) ? comment.likes : []
      })) : [],
      shares: typeof data.shares === 'number' ? data.shares : 0,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      isEdited: Boolean(data.isEdited)
    };
  }

  static async createPost(postData: {
    content: string;
    mediaUrl?: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
    tags?: string[];
  }): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      const postsRef = collection(db, 'posts');
      const newPost = {
        content: postData.content.trim(),
        author: postData.author,
        media: postData.mediaUrl ? [postData.mediaUrl] : [],
        tags: postData.tags || [],
        likes: [],
        comments: [],
        shares: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isEdited: false
      };

      const docRef = await addDoc(postsRef, newPost);
      
      return {
        success: true,
        postId: docRef.id
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async updatePost(
    postId: string, 
    userId: string,
    updates: {
      content?: string;
      media?: string[];
      tags?: string[];
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('المنشور غير موجود');
      }

      const postData = postDoc.data();
      
      if (postData.author.id !== userId) {
        throw new Error('غير مصرح بتعديل هذا المنشور');
      }

      await updateDoc(postRef, {
        ...updates,
        updatedAt: Timestamp.now(),
        isEdited: true
      });

      return { success: true };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async deletePost(postId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('المنشور غير موجود');
      }

      const postData = postDoc.data();
      
      if (postData.author.id !== userId) {
        throw new Error('غير مصرح بحذف هذا المنشور');
      }

      await deleteDoc(postRef);

      return { success: true };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getRecommendedJobs(limitCount: number = 4): Promise<{ success: boolean; data: Job[]; error?: string }> {
    try {
      const jobsRef = collection(db, 'jobs');
      const jobsQuery = query(
        jobsRef,
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(jobsQuery);
      
      const jobs: Job[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        jobs.push({
          id: doc.id,
          ...data,
          createdAt: toDate(data.createdAt)
        } as Job);
      });

      return {
        success: true,
        data: jobs
      };

    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  static async getAllPosts(limitCount: number = 20): Promise<{ success: boolean; data: Post[]; error?: string }> {
    try {
      const postsRef = collection(db, 'posts');
      const postsQuery = query(
        postsRef, 
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(postsQuery);
      
      if (snapshot.empty && mockPosts.length > 0) {
        console.log('📦 Database is empty, using mock posts data');
        const mockAuthorsMap = new Map(mockUsers.map(u => [u.id, u]));
        const enrichedMockPosts: Post[] = mockPosts.map(post => this.sanitizePostData({
          ...post,
          id: post.id,
          author: { id: post.userId, name: mockAuthorsMap.get(post.userId)?.name, avatar: mockAuthorsMap.get(post.userId)?.avatarUrl },
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.createdAt)
        }));
        return { success: true, data: enrichedMockPosts };
      }
      
      const posts: Post[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const sanitizedPost = this.sanitizePostData({ id: doc.id, ...data });
        posts.push(sanitizedPost);
      });

      return {
        success: true,
        data: posts
      };

    } catch (error: any) {
      console.error('❌ Error fetching posts:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  static subscribeToPosts(callback: (posts: Post[]) => void): Unsubscribe {
    const postsRef = collection(db, 'posts');
    const postsQuery = query(
      postsRef, 
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(postsQuery, (snapshot) => {
      const posts: Post[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const sanitizedPost = this.sanitizePostData({ id: doc.id, ...data });
        posts.push(sanitizedPost);
      });
      callback(posts);
    });
  }

  static async likePost(postId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async unlikePost(postId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async addComment(commentData: {
    postId: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
  }): Promise<{ success: boolean; commentId?: string; error?: string }> {
    try {
      const postRef = doc(db, 'posts', commentData.postId);
      
      const newComment = {
        id: Date.now().toString(),
        content: commentData.content.trim(),
        author: commentData.author,
        createdAt: Timestamp.now(),
        likes: []
      };

      await updateDoc(postRef, {
        comments: arrayUnion(newComment),
        updatedAt: Timestamp.now()
      });

      return { success: true, commentId: newComment.id };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'seekers', userId));
      if (!userDoc.exists()) {
        const employerDoc = await getDoc(doc(db, 'employers', userId));
        if (!employerDoc.exists()) {
          return null;
        }
        const data = employerDoc.data();
        return {
          id: employerDoc.id,
          name: data.companyNameEn || data.companyNameAr || 'Company',
          headline: data.industry || '',
          avatarUrl: data.logoUrl || ''
        };
      }
      const data = userDoc.data();
      return {
        id: userDoc.id,
        name: data.fullName || 'User',
        headline: data.title || '',
        avatarUrl: data.photoURL || ''
      };
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}

export async function getMessages(groupId?: string): Promise<Message[]> {
  return [];
}

export async function sendMessage(userId: string, content: string, groupId?: string): Promise<boolean> {
  console.log('Sending message:', { userId, content, groupId });
  return true;
}

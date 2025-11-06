
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
    // This is a simplified example. In a real app, you'd fetch this from a 'users' collection.
    // Returning a mock user for now.
    const mockUser = {
        id: userId,
        name: 'User ' + userId.substring(0, 5),
        headline: 'Professional Headline',
        avatarUrl: `https://i.pravatar.cc/150?u=${userId}`
    };
    return mockUser;
}


export class TalentSpaceService {
  
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
      
      // If database is empty, return mock data
      if (snapshot.empty) {
        console.log('📦 Database is empty, using mock posts data');
        const mockAuthorsMap = new Map(mockUsers.map(u => [u.id, u]));
        const enrichedMockPosts: Post[] = mockPosts.map(post => ({
          id: post.id,
          content: post.content,
          author: {
            id: post.userId,
            name: mockAuthorsMap.get(post.userId)?.name || 'Unknown User',
            avatar: mockAuthorsMap.get(post.userId)?.avatarUrl || ''
          },
          media: post.imageUrl ? [post.imageUrl] : [],
          tags: [],
          likes: post.likedBy || [],
          comments: [],
          shares: 0,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.createdAt),
          isEdited: false
        }));
        
        return {
          success: true,
          data: enrichedMockPosts
        };
      }
      
      const posts: Post[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt)
        } as Post);
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
        posts.push({
          id: doc.id,
          ...data,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt)
        } as Post);
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
}
export async function getMessages(groupId?: string): Promise<Message[]> {
  // Mock implementation, replace with Firestore call
  return [];
}

export async function sendMessage(userId: string, content: string, groupId?: string): Promise<boolean> {
  // Mock implementation, replace with Firestore call
  console.log('Sending message:', { userId, content, groupId });
  return true;
}


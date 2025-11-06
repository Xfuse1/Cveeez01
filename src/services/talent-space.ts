
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

interface CreatePostData {
  userId: string;
  content: string;
  mediaUrl?: string; // Expect a URL now
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
          createdAt: data.createdAt.toDate()
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
      
      const posts: Post[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Post);
      });

      return {
        success: true,
        data: posts
      };

    } catch (error: any) {
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
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
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

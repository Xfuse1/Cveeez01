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
import { GroupChatService } from './group-chat-service';
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
    return TalentSpaceService.getUserById(userId);
}

export class TalentSpaceService {
  private static fallbackRecommendedJobs: Job[] = [
    {
      id: 'ts-job-1',
      title: 'Senior Frontend Developer',
      company: 'Cveeez',
      location: 'Remote',
      type: 'Full-time',
      category: 'Engineering',
      description: 'Build and ship rich React/Next.js experiences with a focus on performance and UX.',
      requirements: ['React', 'TypeScript', 'Next.js'],
      salary: 'Negotiable',
      tags: ['frontend', 'react', 'typescript'],
      applications: 0,
      createdAt: new Date(),
      isActive: true,
    },
    {
      id: 'ts-job-2',
      title: 'Product Designer',
      company: 'Cveeez',
      location: 'Cairo, Egypt',
      type: 'Full-time',
      category: 'Design',
      description: 'Design end-to-end flows for talent and employer journeys across web and mobile.',
      requirements: ['Figma', 'Design Systems', 'Prototyping'],
      salary: 'Competitive',
      tags: ['design', 'ux', 'ui'],
      applications: 0,
      createdAt: new Date(),
      isActive: true,
    },
    {
      id: 'ts-job-3',
      title: 'DevOps Engineer',
      company: 'Cveeez',
      location: 'Hybrid',
      type: 'Full-time',
      category: 'Engineering',
      description: 'Own CI/CD, observability, and cloud reliability for talent-space workloads.',
      requirements: ['AWS', 'CI/CD', 'Monitoring'],
      salary: 'Negotiable',
      tags: ['devops', 'aws', 'ci/cd'],
      applications: 0,
      createdAt: new Date(),
      isActive: true,
    },
  ];
  
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
      shareCount: typeof data.shareCount === 'number' ? data.shareCount : (typeof data.shares === 'number' ? data.shares : 0),
      sharedFrom: data.sharedFrom || null,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      isEdited: Boolean(data.isEdited)
    };
  }

  private static sanitizeJobData(data: any, id: string): Job {
    return {
        id: id,
        title: data.title || 'Untitled Job',
        company: data.company || 'Unknown Company',
        location: data.location || 'Remote',
        type: data.type || 'Full-time',
        category: data.category || 'General',
        description: data.description || '',
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        salary: data.salary || 'Negotiable',
        tags: Array.isArray(data.tags) ? data.tags : [],
        applications: typeof data.applications === 'number' ? data.applications : 0,
        createdAt: toDate(data.createdAt),
        isActive: data.isActive ?? true
    };
  }

  static async sharePost(postId: string, currentUser: User): Promise<{ success: boolean; error?: string }> {
    try {
      const originalPostRef = doc(db, 'posts', postId);
      const originalPostDoc = await getDoc(originalPostRef);
      
      if (!originalPostDoc.exists()) {
        return { success: false, error: 'Post not found' };
      }

      const originalPostData = originalPostDoc.data();
      
      const newPost = {
        content: originalPostData.content || '',
        author: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatarUrl || ''
        },
        media: originalPostData.media || [],
        tags: originalPostData.tags || [],
        likes: [],
        comments: [],
        shares: 0,
        shareCount: 0,
        sharedFrom: {
          postId: originalPostDoc.id,
          authorId: originalPostData.author.id || '',
          authorName: originalPostData.author.name || 'Unknown',
          authorAvatarUrl: originalPostData.author.avatar || ''
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isEdited: false
      };

      const postsRef = collection(db, 'posts');
      await addDoc(postsRef, newPost);

      await updateDoc(originalPostRef, {
        shareCount: increment(1),
        shares: increment(1)
      });

      return { success: true };

    } catch (error: any) {
      console.error('Error sharing post:', error);
      return { success: false, error: error.message };
    }
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

  static async updatePost(postId: string, updates: Partial<Post>): Promise<void> {
    if (!postId) throw new Error('Missing postId');

    const postRef = doc(db, 'posts', postId);
    const payload: any = {
      ...updates,
      updatedAt: serverTimestamp(),
      isEdited: true
    };

    await updateDoc(postRef, payload);
  }

  static async updateComment(postId: string, commentId: string, content: string): Promise<void> {
    if (!postId || !commentId) throw new Error('Missing postId or commentId');
  
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
  
    const payload = {
      content,
      updatedAt: serverTimestamp(),
    };
  
    await updateDoc(commentRef, payload);
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
        jobs.push(this.sanitizeJobData(doc.data(), doc.id));
      });

      if (jobs.length === 0) {
        return {
          success: true,
          data: this.fallbackRecommendedJobs.slice(0, limitCount),
        };
      }

      return {
        success: true,
        data: jobs
      };

    } catch (error: any) {
      console.error('Error fetching recommended jobs, using fallback:', error);
      return {
        success: true,
        data: this.fallbackRecommendedJobs.slice(0, limitCount),
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

  static subscribeToPosts(
    callback: (posts: Post[]) => void,
    limitCount: number = 20,
    filter: 'latest' | 'popular' | 'following' = 'latest'
  ): Unsubscribe {
    const postsRef = collection(db, 'posts');
    let postsQuery;

    if (filter === 'popular') {
      // Prefer server-side ordering by a precomputed engagement score.
      // Make sure your documents have `engagementScore` indexed for this to work at scale.
      postsQuery = query(postsRef, orderBy('engagementScore', 'desc'), limit(limitCount));
    } else {
      // For 'latest' and 'following' fall back to createdAt ordering.
      // 'following' behavior (filtering to only followed users) is handled at a higher layer where user context is available.
      postsQuery = query(postsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    }

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

  static async createComment(commentData: {
    postId: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
  }): Promise<{ success: boolean; commentId?: string; error?: string }> {
    try {
      const commentsRef = collection(db, 'posts', commentData.postId, 'comments');
      
      const newComment = {
        content: commentData.content.trim(),
        author: commentData.author,
        createdAt: Timestamp.now(),
        likes: []
      };

      const docRef = await addDoc(commentsRef, newComment);

      // Optionally update comment count on post if needed, but keeping it simple for now.
      
      return { success: true, commentId: docRef.id };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static subscribeToComments(postId: string, callback: (comments: Comment[]) => void): Unsubscribe {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const comments: Comment[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          content: data.content || '',
          author: {
            id: data.author?.id || 'unknown',
            name: data.author?.name || 'User',
            avatar: data.author?.avatar || ''
          },
          createdAt: toDate(data.createdAt),
          likes: Array.isArray(data.likes) ? data.likes : []
        });
      });
      callback(comments);
    });
  }

  static async deleteComment(postId: string, commentId: string): Promise<void> {
    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
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
  try {
    const result = await GroupChatService.getMessages(groupId);
    if (!result.success) {
      return [];
    }

    return result.data.map((msg) => ({
      id: msg.id,
      userId: msg.sender.id,
      groupId: msg.groupId,
      content: msg.content,
      createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : new Date(msg.createdAt).toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
}

export async function sendMessage(userId: string, content: string, groupId?: string): Promise<boolean> {
  if (!content.trim()) return false;

  try {
    const sender = await getUserById(userId);
    const senderPayload = {
      id: userId,
      name: sender?.name || 'User',
      avatar: sender?.avatarUrl || '',
    };

    const result = await GroupChatService.sendMessage({
      content: content.trim(),
      sender: senderPayload,
      groupId,
    });

    return result.success;
  } catch (error) {
    console.error('Error sending chat message:', error);
    return false;
  }
}

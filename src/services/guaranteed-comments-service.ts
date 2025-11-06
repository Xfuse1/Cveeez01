
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
import { getUserById } from './talent-space'; // Import the user fetching function
import type { User } from '@/types/talent-space'; // Import User type

export interface GuaranteedComment {
  id: string;
  postId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  likes: number;
  parentId?: string; // للردود
  status: 'published' | 'deleted';
}

export class GuaranteedCommentsService {
  private static cache: Map<string, GuaranteedComment[]> = new Map();
  private static userCache: Map<string, User> = new Map();

  // Helper to get user from cache or fetch
  private static async getCachedUser(userId: string): Promise<User> {
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)!;
    }
    const user = await getUserById(userId);
    if (user) {
      this.userCache.set(userId, user);
      return user;
    }
    return { id: userId, name: 'User', headline: '', avatarUrl: '' };
  }

  // ✅ جلب جميع التعليقات الخاصة ببوست معين
  static async getCommentsByPostId(postId: string): Promise<{
    success: boolean;
    data: GuaranteedComment[];
    error?: string;
  }> {
    try {
      console.log(`🔄 [Comments] جاري جلب التعليقات للبوست: ${postId}`);

      // No caching for now to ensure fresh data
      // if (this.cache.has(postId)) { ... }

      const commentsRef = collection(db, 'comments');
      
      const commentsQuery = query(
        commentsRef,
        where('postId', '==', postId),
        where('status', '==', 'published'),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(commentsQuery);
      
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Batch fetch author details
      const authorIds = [...new Set(commentsData.map(c => c.authorId || c.author?.id).filter(Boolean))];
      const authorPromises = authorIds.map(id => this.getCachedUser(id));
      const authors = await Promise.all(authorPromises);
      const authorsMap = new Map(authors.map(author => [author.id, author]));

      const comments: GuaranteedComment[] = commentsData.map(data => {
        const authorId = data.authorId || data.author?.id;
        const authorInfoFromDB = authorsMap.get(authorId);
        
        const author = {
          id: authorId,
          name: data.authorName || authorInfoFromDB?.name || 'مستخدم',
          avatar: data.authorAvatar || authorInfoFromDB?.avatarUrl || ''
        }

        return {
          id: data.id,
          postId: data.postId || postId,
          content: data.content || 'No content',
          author: author,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          likes: data.likes || 0,
          parentId: data.parentId || undefined,
          status: data.status || 'published'
        };
      });

      console.log(`✅ [Comments] تم جلب ${comments.length} تعليق للبوست: ${postId}`);

      // Update cache
      this.cache.set(postId, comments);

      return {
        success: true,
        data: comments
      };

    } catch (error: any) {
      console.error(`❌ [Comments] فشل في جلب التعليقات: ${error.message}`);
      
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // ✅ إضافة تعليق جديد
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
      console.log(`🆕 [Comments] جاري إضافة تعليق جديد للبوست: ${postId}`);

      if (!commentData.content.trim()) {
        throw new Error('محتوى التعليق مطلوب');
      }

      const commentsRef = collection(db, 'comments');
      
      const newComment = {
        postId: postId,
        content: commentData.content.trim(),
        authorId: commentData.authorId,
        authorName: commentData.authorName,
        authorAvatar: commentData.authorAvatar,
        parentId: commentData.parentId || null,
        createdAt: Timestamp.now(),
        likes: 0,
        status: 'published'
      };

      const docRef = await addDoc(commentsRef, newComment);

      console.log(`✅ [Comments] تم إضافة التعليق بنجاح: ${docRef.id}`);

      // Clear cache for this post to force a reload
      this.cache.delete(postId);

      return {
        success: true,
        commentId: docRef.id
      };

    } catch (error: any) {
      console.error(`❌ [Comments] فشل في إضافة التعليق: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ زيادة عدد الإعجابات على تعليق
  static async likeComment(commentId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log(`👍 [Comments] إعجاب بالتعليق: ${commentId}`);
      // This is a mock. In production, you would use updateDoc with increment.
      return {
        success: true
      };

    } catch (error: any) {
      console.error(`❌ [Comments] فشل في الإعجاب: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ مسح الكاش
  static clearCache(postId?: string) {
    if (postId) {
      this.cache.delete(postId);
      console.log(`🧹 [Comments] تم مسح كاش التعليقات للبوست: ${postId}`);
    } else {
      this.cache.clear();
      console.log('🧹 [Comments] تم مسح كل كاش التعليقات');
    }
  }

  // ✅ فحص نظام التعليقات
  static async healthCheck(postId: string): Promise<{
    connected: boolean;
    commentsCount: number;
    error?: string;
  }> {
    try {
      const commentsRef = collection(db, 'comments');
      const commentsQuery = query(
        commentsRef,
        where('postId', '==', postId)
      );

      const snapshot = await getDocs(commentsQuery);
      
      return {
        connected: true,
        commentsCount: snapshot.docs.length
      };

    } catch (error: any) {
      return {
        connected: false,
        commentsCount: 0,
        error: error.message
      };
    }
  }
}

export default GuaranteedCommentsService;

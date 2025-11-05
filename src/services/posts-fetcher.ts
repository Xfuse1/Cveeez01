// 📍 ملف: src/services/posts-fetcher.ts

import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  media: {
    type: string;
    url: string;
  };
  createdAt: any;
  likes: number;
  comments: number;
  visibility: string;
  status: string;
}

export class PostsFetcher {
  // ✅ جلب جميع البوستات النشطة
  static async fetchAllPosts(): Promise<{
    success: boolean;
    data: Post[];
    error?: string;
    count: number;
  }> {
    try {
      console.log('🔄 Fetching posts from Firestore...');
      
      if (!db) {
        throw new Error("Firestore is not initialized. Check your firebase/config.ts file.");
      }
      
      const postsRef = collection(db, 'posts');
      
      // استعلام للحصول على البوستات النشطة فقط
      const postsQuery = query(
        postsRef, 
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(postsQuery);
      
      const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // ✅ معالجة آمنة للبيانات
        return {
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          author: {
            id: data.author?.id || 'unknown',
            name: data.author?.name || 'Anonymous',
            avatar: data.author?.avatar || ''
          },
          media: {
            type: data.media?.type || 'none',
            url: data.media?.url || ''
          },
          createdAt: data.createdAt?.toDate?.() || new Date(),
          likes: data.likes || 0,
          comments: data.comments || 0,
          visibility: data.visibility || 'public',
          status: data.status || 'published'
        };
      });

      console.log(`✅ Successfully fetched ${posts.length} posts`);
      if (posts.length > 0) {
        console.log('📦 Sample post:', posts[0]);
      }
      
      return {
        success: true,
        data: posts,
        count: posts.length
      };
      
    } catch (error: any) {
      console.error('❌ Error fetching posts:', error);
      
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0
      };
    }
  }

  // ✅ جلب بوستات المستخدم
  static async fetchUserPosts(userId: string): Promise<Post[]> {
    try {
      if (!db) throw new Error("Firestore is not initialized.");
      const postsRef = collection(db, 'posts');
      const userPostsQuery = query(
        postsRef,
        where('author.id', '==', userId),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(userPostsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  }

  // ✅ بحث في البوستات
  static async searchPosts(searchTerm: string): Promise<Post[]> {
    const result = await this.fetchAllPosts();
    
    if (!result.success) return [];
    
    return result.data.filter(post => 
      (post.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

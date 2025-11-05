import { collection, getDocs, addDoc, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface GuaranteedPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  media: {
    type: 'image' | 'video' | 'none';
    url: string;
  };
  createdAt: Date;
  likes: number;
  comments: number;
  shares: number;
  status: 'published' | 'draft';
  visibility: 'public' | 'private';
}

export class GuaranteedPostsService {
  private static cache: GuaranteedPost[] = [];
  private static lastFetch: number = 0;
  private static readonly CACHE_TIME = 60000; // 1 دقيقة

  // ✅ 1. جلب البوستات - نسخة مضمونة
  static async fetchPosts(forceRefresh = false): Promise<{
    success: boolean;
    data: GuaranteedPost[];
    error?: string;
    fromCache: boolean;
  }> {
    try {
      console.log('🔄 [Guaranteed] جاري جلب البوستات...');

      // التحقق من الكاش أولاً
      const now = Date.now();
      if (!forceRefresh && this.cache.length > 0 && (now - this.lastFetch) < this.CACHE_TIME) {
        console.log('📦 [Guaranteed] جلب البيانات من الكاش');
        return {
          success: true,
          data: this.cache,
          fromCache: true
        };
      }

      // جلب البيانات من Firestore
      const postsRef = collection(db, 'posts');
      
      // استعلام بسيط ومضمون
      const postsQuery = query(
        postsRef,
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(postsQuery);
      
      const posts: GuaranteedPost[] = [];
      
      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          
          // ✅ معالجة مضمونة للبيانات - بدون أخطاء
          const post: GuaranteedPost = {
            id: doc.id,
            title: data.title || 'بدون عنوان',
            content: data.content || 'لا يوجد محتوى',
            author: {
              id: data.author?.id || 'unknown',
              name: data.author?.name || 'مستخدم',
              avatar: data.author?.avatar || ''
            },
            media: {
              type: data.media?.type || 'none',
              url: data.media?.url || ''
            },
            createdAt: data.createdAt?.toDate?.() || new Date(),
            likes: data.likes || 0,
            comments: data.comments || 0,
            shares: data.shares || 0,
            status: data.status || 'published',
            visibility: data.visibility || 'public'
          };
          
          posts.push(post);
          
        } catch (error) {
          console.warn(`⚠️ [Guaranteed] تخطي بوست تالف: ${doc.id}`, error);
        }
      });

      console.log(`✅ [Guaranteed] تم جلب ${posts.length} بوست بنجاح`);

      // تحديث الكاش
      this.cache = posts;
      this.lastFetch = now;

      return {
        success: true,
        data: posts,
        fromCache: false
      };

    } catch (error: any) {
      console.error('❌ [Guaranteed] فشل في جلب البوستات:', error);
      
      // إذا فشل الاتصال، نعيد الكاش الموجود
      if (this.cache.length > 0) {
        console.log('🔄 [Guaranteed] استخدام البيانات المخزنة بسبب الخطأ');
        return {
          success: true,
          data: this.cache,
          fromCache: true,
          error: error.message
        };
      }

      return {
        success: false,
        data: [],
        fromCache: false,
        error: error.message
      };
    }
  }

  // ✅ 2. إنشاء بوست جديد - نسخة مضمونة
  static async createPost(postData: {
    title?: string;
    content: string;
    authorId: string;
    authorName: string;
    media?: {
      type: 'image' | 'video' | 'none';
      url: string;
    };
  }): Promise<{
    success: boolean;
    postId?: string;
    error?: string;
  }> {
    try {
      console.log('🆕 [Guaranteed] جاري إنشاء بوست جديد...');

      // تنظيف البيانات قبل الحفظ
      const cleanData = {
        title: postData.title?.trim() || '',
        content: postData.content.trim(),
        author: {
          id: postData.authorId,
          name: postData.authorName,
          avatar: ''
        },
        media: postData.media || { type: 'none', url: '' },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        likes: 0,
        comments: 0,
        shares: 0,
        status: 'published',
        visibility: 'public'
      };

      const postsRef = collection(db, 'posts');
      const docRef = await addDoc(postsRef, cleanData);

      console.log('✅ [Guaranteed] تم إنشاء البوست بنجاح:', docRef.id);

      // مسح الكاش لإجبار إعادة التحميل
      this.cache = [];

      return {
        success: true,
        postId: docRef.id
      };

    } catch (error: any) {
      console.error('❌ [Guaranteed] فشل في إنشاء البوست:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ 3. فحص صحة النظام
  static async healthCheck(): Promise<{
    firestore: boolean;
    postsCount: number;
    lastPost: any;
    error?: string;
  }> {
    try {
      const postsRef = collection(db, 'posts');
      const snapshot = await getDocs(postsRef);
      
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        firestore: true,
        postsCount: posts.length,
        lastPost: posts[0] || null
      };

    } catch (error: any) {
      return {
        firestore: false,
        postsCount: 0,
        lastPost: null,
        error: error.message
      };
    }
  }

  // ✅ 4. مسح الكاش
  static clearCache() {
    this.cache = [];
    this.lastFetch = 0;
    console.log('🧹 [Guaranteed] تم مسح الكاش');
  }
}

export default GuaranteedPostsService;

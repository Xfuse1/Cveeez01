'use client';

import { useState, useEffect } from 'react';

export default function SimplePostsFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 جاري تحميل البوستات...');
      
      const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
      const { db } = await import('@/firebase/config');
      
      const postsRef = collection(db, 'posts');
      const postsQuery = query(postsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(postsQuery);
      
      const postsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'بدون عنوان',
          content: data.content || 'لا يوجد محتوى',
          author: data.author || { name: 'مستخدم' },
          createdAt: data.createdAt?.toDate?.() || new Date(),
          likes: data.likes || 0,
          comments: data.comments || 0
        };
      });
      
      console.log(`✅ تم تحميل ${postsData.length} بوست`);
      setPosts(postsData);
      
    } catch (err: any) {
      console.error('❌ خطأ في تحميل البوستات:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p>جاري تحميل البوستات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-center">
        <p className="text-red-600">❌ {error}</p>
        <button 
          onClick={loadPosts}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded">
          <p className="text-gray-500">لا توجد بوستات لعرضها</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="border border-gray-200 rounded p-4 bg-white">
            <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
            <p className="text-gray-700 mb-3">{post.content}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>بواسطة {post.author.name}</span>
              <span>{post.createdAt.toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

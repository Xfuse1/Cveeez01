'use client';

import { useState, useEffect, useCallback } from 'react';
import GuaranteedPostsService, { type GuaranteedPost } from '@/services/guaranteed-posts-service';

export default function GuaranteedPostsFeed() {
  const [posts, setPosts] = useState<GuaranteedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // ✅ دالة مضمونة لجلب البوستات
  const loadPosts = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      console.log('🔄 [Component] جاري تحميل البوستات...');

      const result = await GuaranteedPostsService.fetchPosts(isRefreshing);

      if (result.success) {
        setPosts(result.data);
        setLastUpdate(new Date());
        console.log(`✅ [Component] تم تحميل ${result.data.length} بوست`);
        
        if (result.fromCache) {
          console.log('📦 [Component] تم استخدام البيانات المخزنة');
        }
      } else {
        throw new Error(result.error || 'فشل في جلب البوستات');
      }

    } catch (err: any) {
      console.error('❌ [Component] خطأ في تحميل البوستات:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ✅ التحميل التلقائي
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // ✅ التحديث التلقائي كل 30 ثانية
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🕒 [Component] تحديث تلقائي للبيانات...');
      loadPosts(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadPosts]);

  // ✅ إنشاء بوست تجريبي
  const createTestPost = async () => {
    try {
      const result = await GuaranteedPostsService.createPost({
        title: 'بوست تجريبي من النظام الجديد',
        content: 'هذا بوست تجريبي للتأكد من أن النظام يعمل بشكل صحيح. تم إنشاؤه في: ' + new Date().toLocaleString('ar-EG'),
        authorId: 'test-user',
        authorName: 'النظام التجريبي'
      });

      if (result.success) {
        alert('✅ تم إنشاء البوست التجريبي بنجاح!');
        loadPosts(true);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      alert('❌ فشل في إنشاء البوست التجريبي: ' + err.message);
    }
  };

  // ✅ فحص النظام
  const checkSystem = async () => {
    const health = await GuaranteedPostsService.healthCheck();
    
    console.log('🩺 [Component] فحص النظام:', health);
    
    if (health.firestore) {
      alert(`✅ النظام يعمل بشكل صحيح\nعدد البوستات: ${health.postsCount}`);
    } else {
      alert(`❌ مشكلة في النظام: ${health.error}`);
    }
  };

  // ✅ واجهة التحميل
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-700">جاري تحميل البوستات...</p>
        <p className="text-sm text-gray-500">برجاء الانتظار</p>
      </div>
    );
  }

  // ✅ واجهة الخطأ
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-2xl mb-2">⚠️</div>
        <h3 className="text-red-800 font-semibold mb-2">فشل في تحميل البوستات</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="space-x-3">
          <button 
            onClick={() => loadPosts()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            إعادة المحاولة
          </button>
          <button 
            onClick={checkSystem}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            فحص النظام
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="guaranteed-posts-feed bg-white rounded-xl shadow-lg">
      {/* الهيدر */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">البوستات</h2>
            <p className="text-gray-600">
              {posts.length} بوست • آخر تحديث: {lastUpdate.toLocaleTimeString('ar-EG')}
            </p>
          </div>
          
          <div className="flex space-x-2 mt-3 sm:mt-0">
            <button
              onClick={() => loadPosts(true)}
              disabled={refreshing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {refreshing ? '🔄...' : '🔄 تحديث'}
            </button>
            <button
              onClick={createTestPost}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              ➕ تجريبي
            </button>
            <button
              onClick={checkSystem}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
            >
              🩺 فحص
            </button>
          </div>
        </div>
      </div>

      {/* قائمة البوستات */}
      <div className="p-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد بوستات</h3>
            <p className="text-gray-500 mb-4">كن أول من ينشر بوست في المجتمع!</p>
            <button 
              onClick={createTestPost}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              إنشاء بوست تجريبي
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* رأس البوست */}
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {post.author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{post.author.name}</div>
                    <div className="text-sm text-gray-500">
                      {post.createdAt.toLocaleDateString('ar-EG')} • {post.createdAt.toLocaleTimeString('ar-EG')}
                    </div>
                  </div>
                </div>

                {/* محتوى البوست */}
                {post.title && (
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
                )}
                
                <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* الوسائط */}
                {post.media.type !== 'none' && post.media.url && (
                  <div className="mb-4">
                    {post.media.type === 'image' ? (
                      <img
                        src={post.media.url}
                        alt="صورة البوست"
                        className="rounded-lg max-w-full h-auto max-h-96 object-cover"
                      />
                    ) : (
                      <video
                        controls
                        className="rounded-lg max-w-full h-auto max-h-96"
                        src={post.media.url}
                      />
                    )}
                  </div>
                )}

                {/* التفاعلات */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-6">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <span>👍</span>
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <span>💬</span>
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <span>🔄</span>
                      <span>{post.shares}</span>
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    ID: {post.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* معلومات التصحيح */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
        <details>
          <summary className="cursor-pointer text-sm text-gray-600 font-medium">
            🔧 معلومات التصحيح (انقر للعرض)
          </summary>
          <div className="mt-2 p-3 bg-white rounded border text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>الحالة:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• البوستات: {posts.length}</li>
                  <li>• التحميل: {loading ? 'نعم' : 'لا'}</li>
                  <li>• التحديث: {refreshing ? 'نعم' : 'لا'}</li>
                  <li>• الخطأ: {error || 'لا'}</li>
                </ul>
              </div>
              <div>
                <strong>الإجراءات:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• فتح Console (F12)</li>
                  <li>• التحقق من السجلات</li>
                  <li>• استخدام أزرار الفحص</li>
                </ul>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

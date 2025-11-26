'use client';

import { useState, useEffect, useCallback } from 'react';
import GuaranteedPostsService, { type GuaranteedPost } from '@/services/guaranteed-posts-service';

export default function GuaranteedPostsFeed() {
  const [posts, setPosts] = useState<GuaranteedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadPosts = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const result = await GuaranteedPostsService.fetchPosts(isRefreshing);

      if (result.success) {
        setPosts(result.data);
        setLastUpdate(new Date());
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

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadPosts(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadPosts]);

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-700">جاري تحميل البوستات...</p>
        <p className="text-sm text-gray-500">برجاء الانتظار</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-2xl mb-2">⚠️</div>
        <h3 className="text-red-800 font-semibold mb-2">فشل في تحميل البوستات</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => loadPosts()} 
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="guaranteed-posts-feed bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">البوستات</h2>
            <p className="text-gray-600">
              {posts.length} بوست • آخر تحديث: {lastUpdate.toLocaleTimeString('ar-EG')}
            </p>
          </div>
          <button
            onClick={() => loadPosts(true)}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center mt-3 sm:mt-0"
          >
            {refreshing ? '🔄...' : '🔄 تحديث'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد بوستات</h3>
            <p className="text-gray-500 mb-4">كن أول من ينشر بوست في المجتمع!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
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

                {('title' in post) && (post as any).title && (
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{(post as any).title}</h3>
                )}
                
                <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {Array.isArray(post.media) && post.media.length > 0 && (
                  <div className="mb-4">
                    {(() => {
                      const url = post.media[0];
                      const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(url || '');
                      if (isImage) {
                        return (
                          <img
                            src={url}
                            alt="صورة البوست"
                            className="rounded-lg max-w-full h-auto max-h-96 object-cover"
                          />
                        );
                      }

                      return (
                        <video
                          controls
                          className="rounded-lg max-w-full h-auto max-h-96"
                          src={url}
                        />
                      );
                    })()}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-6">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <span>👍</span>
                      <span>{Array.isArray(post.likes) ? post.likes.length : 0}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <span>💬</span>
                      <span>{Array.isArray(post.comments) ? post.comments.length : 0}</span>
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
    </div>
  );
}

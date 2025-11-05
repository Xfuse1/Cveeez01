// 📍 ملف: src/components/EmergencyPostsFeed.tsx

import React, { useState, useEffect } from 'react';
import { PostsFetcher, type Post } from '@/services/posts-fetcher';

const EmergencyPostsFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ جلب البوستات
  const loadPosts = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      console.log('🔄 Loading posts...');
      const result = await PostsFetcher.fetchAllPosts();
      
      if (result.success) {
        setPosts(result.data);
        console.log(`✅ Loaded ${result.data.length} posts successfully`);
        
        // ✅ DEBUG: عرض البيانات في الكونسول
        console.log('📊 Posts data:', result.data);
        
      } else {
        throw new Error(result.error);
      }
      
    } catch (err: any) {
      console.error('❌ Failed to load posts:', err);
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ التحميل التلقائي
  useEffect(() => {
    loadPosts();
  }, []);

  // ✅ DEBUG: مراقبة تغييرات الـ state
  useEffect(() => {
    console.log('🔄 Posts state updated:', {
      postsCount: posts.length,
      loading,
      error,
      refreshing
    });
  }, [posts, loading, error, refreshing]);

  // ✅ واجهة التحميل
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-600">Loading posts...</p>
        <p className="text-sm text-gray-500">Please wait</p>
      </div>
    );
  }

  // ✅ واجهة الخطأ
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-2xl mb-2">⚠️</div>
        <h3 className="text-red-800 font-semibold mb-2">Failed to Load Posts</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="space-x-3">
          <button 
            onClick={() => loadPosts()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Reload Page
          </button>
        </div>
        
        {/* ✅ DEBUG معلومات */}
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-red-700">Debug Info</summary>
          <div className="mt-2 p-3 bg-red-100 rounded text-xs">
            <p>Posts in state: {posts.length}</p>
            <p>Loading: {loading.toString()}</p>
            <p>Error: {error}</p>
          </div>
        </details>
      </div>
    );
  }

  // ✅ لا يوجد بوستات
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Posts Yet</h3>
        <p className="text-gray-500 mb-4">Be the first to share something with the community!</p>
        <button 
          onClick={() => loadPosts(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Check for New Posts
        </button>
      </div>
    );
  }

  return (
    <div className="emergency-posts-feed">
      {/* ✅ Header مع تحديث */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800">
          Community Posts ({posts.length})
        </h2>
        <button
          onClick={() => loadPosts(true)}
          disabled={refreshing}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* ✅ DEBUG Panel */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <details>
          <summary className="cursor-pointer font-semibold">
            🔧 Debug Information ({posts.length} posts loaded)
          </summary>
          <div className="mt-2 p-3 bg-white rounded">
            <pre className="text-xs overflow-auto max-h-60">
              {JSON.stringify(posts, null, 2)}
            </pre>
          </div>
        </details>
      </div>

      {/* ✅ قائمة البوستات */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

// ✅ كومبوننت البوست الفردي
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  if (!post) return null;

  return (
    <div className="post-card bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      
      {/* ✅ رأس البوست */}
      <div className="post-header flex items-center mb-4">
        <img
          src={post.author.avatar || '/default-avatar.png'}
          alt={post.author.name}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div className="flex-1">
          <div className="author-name font-semibold text-gray-800">
            {post.author.name}
          </div>
          <div className="post-date text-sm text-gray-500">
            {post.createdAt?.toLocaleDateString?.() || 'Recently'}
          </div>
        </div>
      </div>

      {/* ✅ محتوى البوست */}
      <div className="post-content mb-4">
        {post.title && (
          <h3 className="post-title text-xl font-bold text-gray-900 mb-2">
            {post.title}
          </h3>
        )}
        <p className="post-text text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* ✅ الوسائط */}
      {post.media.type !== 'none' && post.media.url && (
        <div className="post-media mb-4">
          {post.media.type === 'image' && (
            <img
              src={post.media.url}
              alt="Post media"
              className="rounded-lg max-w-full h-auto max-h-96 object-cover"
            />
          )}
          {post.media.type === 'video' && (
            <video
              controls
              className="rounded-lg max-w-full h-auto max-h-96"
              src={post.media.url}
            />
          )}
        </div>
      )}

      {/* ✅ الإجراءات */}
      <div className="post-actions flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-4">
          <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
            <span>👍</span>
            <span>{post.likes || 0}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
            <span>💬</span>
            <span>{post.comments || 0}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
            <span>🔄</span>
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ✅ DEBUG معلومات */}
      <div className="post-debug mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600">
        <strong>DEBUG:</strong> ID: {post.id} | Type: {post.media.type} | 
        Status: {post.status} | Created: {post.createdAt?.toString?.()}
      </div>
    </div>
  );
};

export default EmergencyPostsFeed;

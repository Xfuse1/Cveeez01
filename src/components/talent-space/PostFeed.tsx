'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TalentSpaceService, type Post } from '@/services/talent-space';
import { PostCard } from '@/components/talent-space/PostCard';
import { useAuth } from '@/contexts/auth-provider';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

export function PostFeed({ posts: initialPosts, currentUserId, onUpdate }: { posts: Post[], currentUserId: string, onUpdate: () => void }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(!initialPosts || initialPosts.length === 0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  
  const loadPosts = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    setLoading(true);
    try {
      const result = await TalentSpaceService.getAllPosts(10);
      if (result.success) {
        if (reset) {
          setPosts(result.data);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setPosts(prev => [...prev, ...result.data]);
        }
        setHasMore(result.data.length === 10);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = TalentSpaceService.subscribeToPosts((newPosts) => {
      setPosts(newPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage, false);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadPosts(1, true);
  };
  
  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-3 text-gray-600">جاري تحميل المنشورات...</span>
      </div>
    );
  }

  return (
    <div className="post-feed-container">
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={handleRefresh}
          disabled={loading}
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5" /></svg>
          <span>تحديث</span>
        </Button>
        <span className="text-sm text-gray-500">{posts.length} منشور</span>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-600 mb-2">لا توجد منشورات بعد</p>
            <p className="text-sm text-gray-500">كن أول من ينشر في Talent Space!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUserId={user?.uid || ''}
              onUpdate={handleRefresh}
            />
          ))
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>جاري التحميل...</span>
              </>
            ) : (
              <span>تحميل المزيد</span>
            )}
          </Button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          <p>وصلت إلى نهاية المنشورات</p>
        </div>
      )}
    </div>
  );
}

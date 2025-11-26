'use client';

import type { Post } from '@/types/talent-space';
import { PostCard } from '@/components/talent-space/PostCard';
import { Button } from '../ui/button';
import { PostSkeleton } from './PostSkeleton';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

interface PostFeedProps {
  posts: Post[];
  currentUserId: string;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
}

export function PostFeed({ posts, currentUserId, onLoadMore, hasMore, isLoading = false }: PostFeedProps) {
  const { language } = useLanguage();
  const t = translations[language].talentSpace;

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-6">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-lg border border-border shadow-sm">
        <div className="text-5xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{t.feed.empty.title}</h3>
        <p className="text-muted-foreground">{t.feed.empty.description}</p>
      </div>
    );
  }

  return (
    <div className="post-feed-container">
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUserId={currentUserId}
            onUpdate={() => {}} // Subscription handles updates automatically
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={onLoadMore}
            variant="outline"
          >
            <span>تحميل المزيد</span>
          </Button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p>وصلت إلى نهاية المنشورات</p>
        </div>
      )}
    </div>
  );
}


'use client';

import { PostCard } from '@/components/talent-space/PostCard';
import { useLanguage } from '@/contexts/language-provider';
import type { GuaranteedPost } from '@/services/guaranteed-posts-service';

interface PostFeedProps {
    posts: GuaranteedPost[];
    onPostUpdate?: () => void;
}

export function PostFeed({ posts, onPostUpdate }: PostFeedProps) {
  const { language } = useLanguage();
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-card rounded-lg">
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-2">
            {language === 'ar' ? 'لا توجد منشورات بعد' : 'No posts yet'}
          </h3>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'كن أول من ينشر! شارك أفكارك ومهاراتك مع المجتمع.'
              : 'Be the first to post! Share your thoughts and skills with the community.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post}
          onPostUpdate={onPostUpdate}
        />
      ))}
    </div>
  );
}

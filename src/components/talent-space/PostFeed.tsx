'use client';

import { PostCard } from '@/components/talent-space/PostCard';
import type { Post, User } from '@/types/talent-space';

interface PostFeedProps {
    posts: Post[];
    users: User[];
    onPostUpdate?: () => void;
}

export function PostFeed({ posts, users, onPostUpdate }: PostFeedProps) {
  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const author = users.find((user) => user.id === post.userId);
        return author ? (
          <PostCard 
            key={post.id} 
            post={post} 
            author={author} 
            onPostUpdate={onPostUpdate}
          />
        ) : null;
      })}
    </div>
  );
}

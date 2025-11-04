'use client';

import { PostCard } from '@/components/talent-space/PostCard';
import type { Post, User } from '@/types/talent-space';

interface PostFeedProps {
    posts: Post[];
    users: User[];
}

export function PostFeed({ posts, users }: PostFeedProps) {
  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const author = users.find((user) => user.id === post.userId);
        return author ? <PostCard key={post.id} post={post} author={author} /> : null;
      })}
    </div>
  );
}

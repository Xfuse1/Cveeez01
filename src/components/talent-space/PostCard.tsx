'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { Post, User } from '@/types/talent-space';
import { Heart, MessageCircle, MoreHorizontal, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  author: User;
}

export function PostCard({ post, author }: PostCardProps) {
  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={author.avatarUrl} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{author.name}</p>
              <p className="text-xs text-muted-foreground">
                {author.headline} &middot;{' '}
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.imageUrl && (
          <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-lg">
            <Image src={post.imageUrl} alt="Post image" fill className="object-cover" />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between border-t mt-2 mx-4 py-2">
        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground">
          <Heart className="w-5 h-5" />
          <span>{post.likes}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground">
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

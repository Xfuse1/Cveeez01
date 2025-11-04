'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/types/talent-space';
import { Image, Link, Video } from 'lucide-react';

interface CreatePostProps {
  user: User;
}

export function CreatePost({ user }: CreatePostProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-full">
            <Textarea
              placeholder="What's on your mind?"
              className="mb-2 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-secondary/50"
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Image className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Link className="w-5 h-5" />
                </Button>
              </div>
              <Button>Post</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

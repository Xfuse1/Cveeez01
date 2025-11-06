
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, MoreHorizontal, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { likePost, unlikePost } from '@/services/talent-space';
import { useAuth } from '@/contexts/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import GuaranteedComments from '@/components/GuaranteedComments';
import type { GuaranteedPost } from '@/services/guaranteed-posts-service';

interface PostCardProps {
  post: GuaranteedPost;
  onPostUpdate?: () => void;
}

export function PostCard({ post, onPostUpdate }: PostCardProps) {
  const { language } = useLanguage();
  const t = translations[language].talentSpace;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLiked, setIsLiked] = useState(post.likedBy?.includes(user?.uid || '') || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const author = post.author;

  const handleLike = async () => {
    if (!user) {
      toast({
        title: language === 'ar' ? 'مطلوب تسجيل الدخول' : 'Login Required',
        description: language === 'ar' ? 'يجب عليك تسجيل الدخول للإعجاب بالمنشورات.' : 'You must be logged in to like posts.',
        variant: 'destructive',
      });
      return;
    }

    const previousLiked = isLiked;
    const previousCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      const success = isLiked 
        ? await unlikePost(post.id, user.uid)
        : await likePost(post.id, user.uid);

      if (!success) {
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
         toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'فشل تحديث الإعجاب.' : 'Failed to update like status.',
          variant: 'destructive',
        });
      } else {
        onPostUpdate?.(); // Notify parent to refetch if needed
      }
    } catch (error) {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${author.name}`,
        text: post.content,
        url: window.location.href,
      }).catch(err => console.log("Share failed:", err));
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: language === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!',
          description: language === 'ar' ? 'تم نسخ رابط المنشور إلى الحافظة.' : 'Post link copied to clipboard.',
        });
      });
    }
  };
  
  const getPostTimestamp = () => {
    try {
      const date = new Date(post.createdAt);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  }

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
                {getPostTimestamp()}
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
        {post.videoUrl && (
          <div className="mt-4 relative w-full overflow-hidden rounded-lg">
            <video src={post.videoUrl} controls className="w-full" />
          </div>
        )}
        {post.linkUrl && (
          <div className="mt-4 p-3 border rounded-lg bg-secondary/50">
            <a 
              href={post.linkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {post.linkUrl}
            </a>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <div className="flex justify-between border-t w-full pt-2">
          <Button 
            variant="ghost" 
            className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            onClick={handleLike}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount} {t.post.likes}</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-muted-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments} {t.post.comments}</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-muted-foreground"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
            <span>{t.post.share}</span>
          </Button>
        </div>
        
        {showComments && (
            <div className="w-full pt-2 border-t">
                 <GuaranteedComments 
                    postId={post.id} 
                    postAuthorId={author.id}
                 />
            </div>
        )}
      </CardFooter>
    </Card>
  );
}

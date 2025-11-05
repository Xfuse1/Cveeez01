'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Post, User, Comment } from '@/types/talent-space';
import { Heart, MessageCircle, MoreHorizontal, Share2, Send, Loader } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { likePost, unlikePost, addComment, getComments } from '@/services/talent-space';
import { useAuth } from '@/contexts/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { users as mockUsers } from '@/data/talent-space';
import { Timestamp } from 'firebase/firestore';


interface PostCardProps {
  post: Post;
  author: User;
  onPostUpdate?: () => void;
}

export function PostCard({ post, author, onPostUpdate }: PostCardProps) {
  const { language } = useLanguage();
  const t = translations[language].talentSpace;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLiked, setIsLiked] = useState(post.likedBy?.includes(user?.uid || '') || false);
  const [likesCount, setLikesCount] = useState(post.likedBy?.length || post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments || 0);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
        const fetchedComments = await getComments(post.id);
        setComments(fetchedComments);
    } catch(error) {
        console.error("Error fetching comments: ", error);
        toast({
            title: language === 'ar' ? 'خطأ' : 'Error',
            description: language === 'ar' ? 'فشل في جلب التعليقات.' : 'Failed to fetch comments.',
            variant: 'destructive'
        });
    } finally {
        setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    const newShowComments = !showComments;
    setShowComments(newShowComments);
    
    if (newShowComments) {
      fetchComments();
    }
  };

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
      }
    } catch (error) {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast({
        title: language === 'ar' ? 'مطلوب تسجيل الدخول' : 'Login Required',
        description: language === 'ar' ? 'يجب عليك تسجيل الدخول للتعليق.' : 'You must be logged in to comment.',
        variant: 'destructive',
      });
      return;
    }

    if (!commentText.trim()) return;

    setIsCommenting(true);
    try {
      const success = await addComment(post.id, user.uid, commentText);
      if (success) {
        toast({
          title: t.toast.commentAdded,
        });
        setCommentText('');
        setCommentsCount(prev => prev + 1);
        await fetchComments();
        if (onPostUpdate) onPostUpdate();
      } else {
        toast({
          title: t.toast.commentError,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: t.toast.commentError,
        variant: 'destructive',
      });
    } finally {
      setIsCommenting(false);
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
  
  const getCommentAuthor = (userId: string) => {
    const foundUser = mockUsers.find(u => u.id === userId);
    return foundUser || { id: userId, name: 'Anonymous', headline: '', avatarUrl: '' };
  }
  
  const getPostTimestamp = () => {
    if (post.createdAt instanceof Timestamp) {
      return formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true });
    }
    if (typeof post.createdAt === 'string') {
      return formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
    }
    return 'just now';
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
            onClick={toggleComments}
          >
            <MessageCircle className="w-5 h-5" />
            <span>{commentsCount} {t.post.comments}</span>
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
          <div className="w-full pt-2 border-t space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder={t.post.writeComment}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                disabled={isCommenting || !user}
              />
              <Button 
                size="icon" 
                onClick={handleComment}
                disabled={isCommenting || !commentText.trim() || !user}
              >
                {isCommenting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            
            {loadingComments ? (
              <div className="flex justify-center py-4">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.map((comment) => {
                  const commentAuthor = getCommentAuthor(comment.userId);
                  return (
                    <div key={comment.id} className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={commentAuthor.avatarUrl} alt={commentAuthor.name} />
                        <AvatarFallback>{commentAuthor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{commentAuthor.name}</p>
                          <span className="text-xs text-muted-foreground">
                            {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'just now'}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                {language === 'ar' ? 'لا توجد تعليقات بعد. كن أول من يعلق!' : 'No comments yet. Be the first to comment!'}
              </p>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

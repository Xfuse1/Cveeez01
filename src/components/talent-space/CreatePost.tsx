'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import type { User } from '@/types/talent-space';
import { Image, Link as LinkIcon, Video, X } from 'lucide-react';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { createPost } from '@/services/talent-space';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-provider';

interface CreatePostProps {
  user: User;
  onPostCreated?: () => void;
}

export function CreatePost({ user, onPostCreated }: CreatePostProps) {
  const { language } = useLanguage();
  const t = translations[language].talentSpace;
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleMediaSelect = (file: File, type: 'image' | 'video') => {
    setMediaFile(file);
    setMediaType(type);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaType(null);
    setMediaPreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!content.trim() && !mediaFile && !linkUrl) {
      toast({
        title: language === 'ar' ? 'محتوى مطلوب' : 'Content Required',
        description: language === 'ar' 
          ? 'الرجاء إضافة محتوى أو صورة أو رابط للمنشور.'
          : 'Please add content, image, or link to your post.',
        variant: 'destructive',
      });
      return;
    }

    if (!authUser) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar'
          ? 'يجب تسجيل الدخول للنشر.'
          : 'You must be logged in to post.',
        variant: 'destructive',
      });
      return;
    }

    setIsPosting(true);

    try {
      console.log('Creating post with user:', authUser.uid);
      const postId = await createPost(
        authUser.uid,
        content,
        mediaFile || undefined,
        mediaType || undefined,
        linkUrl || undefined
      );

      if (postId) {
        console.log('Post created successfully with ID:', postId);
        toast({
          title: t.toast.postCreated,
          description: language === 'ar' 
            ? 'تم نشر منشورك بنجاح!'
            : 'Your post has been published successfully!',
        });
        
        // Clear form
        setContent('');
        clearMedia();
        setLinkUrl('');
        setShowLinkInput(false);
        
        // Notify parent to refresh posts
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        console.error('Post creation returned null');
        toast({
          title: t.toast.postError,
          description: language === 'ar'
            ? 'حدث خطأ أثناء إنشاء المنشور. الرجاء المحاولة مرة أخرى.'
            : 'An error occurred while creating the post. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: t.toast.postError,
        description: language === 'ar'
          ? 'حدث خطأ غير متوقع. الرجاء التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.'
          : 'An unexpected error occurred. Please check your internet connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-full space-y-3">
            <Textarea
              placeholder={t.createPost.placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mb-2 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-secondary/50 min-h-[80px]"
            />
            
            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative rounded-lg overflow-hidden border">
                {mediaType === 'image' && (
                  <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-cover" />
                )}
                {mediaType === 'video' && (
                  <video src={mediaPreview} controls className="w-full max-h-64" />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearMedia}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {/* Link Input */}
            {showLinkInput && (
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowLinkInput(false);
                    setLinkUrl('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMediaSelect(file, 'image');
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isPosting || !!mediaFile}
                  title={t.createPost.uploadImage}
                >
                  <Image className="w-5 h-5" />
                </Button>
                
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMediaSelect(file, 'video');
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isPosting || !!mediaFile}
                  title={t.createPost.uploadVideo}
                >
                  <Video className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  disabled={isPosting}
                  title={t.createPost.addLink}
                >
                  <LinkIcon className="w-5 h-5" />
                </Button>
              </div>
              <Button onClick={handlePost} disabled={isPosting || (!content.trim() && !mediaFile && !linkUrl)}>
                {isPosting ? t.createPost.posting : t.createPost.postButton}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

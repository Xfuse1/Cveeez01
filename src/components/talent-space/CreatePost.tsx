
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/types/talent-space';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { TalentSpaceService } from '@/services/talent-space';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-provider';
import { CloudinaryService } from '@/lib/cloudinary-client';

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
  const [isUploading, setIsUploading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [error, setError] = useState('');

  const handleUploadMedia = async () => {
    try {
      setIsUploading(true);
      setError('');
      const imageUrl = await CloudinaryService.openUploadWidget();
      
      // If imageUrl is null, it means the user closed the widget. Do nothing.
      if (imageUrl) {
        setMediaUrl(imageUrl);
        // Simple check for image/video
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(imageUrl)) {
          setMediaType('image');
        } else {
          setMediaType('video');
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
  };

  const handlePost = async () => {
    if (!content.trim() && !mediaUrl) {
      setError('Please add content or media to post');
      return;
    }

    if (!authUser) {
      setError('You must be logged in to post.');
      return;
    }

    setIsPosting(true);
    setError('');

    try {
      const result = await TalentSpaceService.createPost({
        content,
        mediaUrl: mediaUrl || undefined,
        author: {
            id: user.id,
            name: user.name,
            avatar: user.avatarUrl
        }
      });

      if (result.success) {
        setContent('');
        setMediaUrl(null);
        setMediaType(null);
        toast({
          title: "🎉 Post created successfully!",
        });
        onPostCreated?.();
      } else {
        setError(result.error || 'Failed to create post');
      }

    } catch (err: any) {
      console.error('Post creation error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <div className="px-4 py-3 border-b bg-card">
        <h3 className="font-medium text-foreground">{t.createPost.title}</h3>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link href="/profile" passHref>
            <Avatar className="cursor-pointer h-10 w-10">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="w-full space-y-4">
            <Textarea
              placeholder={t.createPost.placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-border focus:border-primary focus:ring-1 focus:ring-primary bg-card text-foreground"
              disabled={isPosting}
            />
            
            {mediaUrl && (
              <div className="relative inline-block rounded-lg overflow-hidden border border-border bg-muted/20">
                {mediaType === 'image' ? (
                  <div className="relative h-32 w-32">
                    <Image 
                      src={mediaUrl} 
                      alt="Preview" 
                      fill
                      className="object-cover" 
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 flex items-center justify-center bg-black">
                    <video src={mediaUrl} className="h-full w-full object-contain" />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                  onClick={clearMedia}
                  disabled={isPosting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </Button>
              </div>
            )}
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-foreground gap-2 min-h-[44px]"
                  onClick={handleUploadMedia}
                  disabled={isPosting || isUploading || !!mediaUrl}
                >
                  {isUploading ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>}
                  <span className="hidden sm:inline">{t.createPost.uploadImage}</span>
                </Button>
              </div>
              <Button 
                onClick={handlePost} 
                disabled={isPosting || (!content.trim() && !mediaUrl)}
                className="min-w-[100px] min-h-[44px]"
              >
                {isPosting ? (
                    <>
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                     {t.createPost.posting}
                    </>
                ) : (
                    t.createPost.postButton
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/types/talent-space';
import { Image as ImageIcon, Video, X, Loader2 } from 'lucide-react';
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
          id: authUser.uid,
          name: authUser.displayName || 'User',
          avatar: authUser.photoURL || ''
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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link href="/profile" passHref>
            <Avatar className="cursor-pointer">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="w-full space-y-3">
            <Textarea
              placeholder={t.createPost.placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mb-2 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-secondary/50 min-h-[80px]"
              disabled={isPosting}
            />
            
            {mediaUrl && (
              <div className="relative rounded-lg overflow-hidden border">
                {mediaType === 'image' ? (
                  <Image src={mediaUrl} alt="Preview" width={500} height={300} className="w-full max-h-64 object-cover" />
                ) : (
                  <video src={mediaUrl} controls className="w-full max-h-64" />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={clearMedia}
                  disabled={isPosting}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <strong>⚠️ Error:</strong> {error}
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={handleUploadMedia}
                  disabled={isPosting || isUploading || !!mediaUrl}
                  title={t.createPost.uploadImage}
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                </Button>
              </div>
              <Button onClick={handlePost} disabled={isPosting || (!content.trim() && !mediaUrl)}>
                {isPosting ? (
                    <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import type { User } from '@/types/talent-space';
import { Image as ImageIcon, Link as LinkIcon, Video, X, Loader2 } from 'lucide-react';
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
  const [linkUrl, setLinkUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleMediaSelect = (file: File, type: 'image' | 'video') => {
    // ✅ التحقق من صحة الملفات قبل الرفع
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const isValidType = type === 'image' 
        ? validImageTypes.includes(file.type) 
        : validVideoTypes.includes(file.type);

    if (!isValidType) {
      setError(`Invalid file type: ${file.name}.`);
      return;
    }

    if (file.size > maxSize) {
      setError(`File too large: ${file.name}. Maximum size is 10MB.`);
      return;
    }

    setError('');
    setMediaFile(file);
    setMediaType(type);
    
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
    if (!content.trim() && !mediaFile && !linkUrl.trim()) {
      setError('Please add content, media or a link to post');
      return;
    }

    if (!authUser) {
      setError('You must be logged in to post.');
      return;
    }

    setIsPosting(true);
    setError('');

    try {
      const result = await createPost({
        userId: authUser.uid,
        content,
        linkUrl: linkUrl || null,
        mediaFile: mediaFile || undefined,
        mediaType: mediaType || undefined
      });

      if (result.success) {
        // ✅ Reset form on success
        setContent('');
        setLinkUrl('');
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';

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
              disabled={isPosting}
            />
            
            {mediaPreview && (
              <div className="relative rounded-lg overflow-hidden border">
                {mediaType === 'image' ? (
                  <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-cover" />
                ) : (
                  <video src={mediaPreview} controls className="w-full max-h-64" />
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
            
            <div className="flex gap-2">
                <Input
                  placeholder={t.createPost.addLink}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-1"
                  disabled={isPosting}
                />
            </div>
            
            {error && (
              <div className="error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <strong>⚠️ Error:</strong> {error}
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
                  disabled={isPosting}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isPosting || !!mediaFile}
                  title={t.createPost.uploadImage}
                >
                  <ImageIcon className="w-5 h-5" />
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
                  disabled={isPosting}
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
              </div>
              <Button onClick={handlePost} disabled={isPosting || (!content.trim() && !mediaFile && !linkUrl.trim())}>
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

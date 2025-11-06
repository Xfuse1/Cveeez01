'use client';

import { useState } from 'react';
import { TalentSpaceService, type Post } from '@/services/talent-space';
import { useAuth } from '@/contexts/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Heart, MessageCircle, MoreHorizontal, Share2, X, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onUpdate: () => void;
}

export function PostCard({ post, currentUserId, onUpdate }: PostCardProps) {
  const safeLikes = Array.isArray(post.likes) ? post.likes : [];
  const [isLiked, setIsLiked] = useState(safeLikes.includes(currentUserId));
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showMenu, setShowMenu] = useState(false);
  const { toast } = useToast();

  const safeComments = Array.isArray(post.comments) ? post.comments : [];
  const safeMedia = Array.isArray(post.media) ? post.media : [];
  const safeTags = Array.isArray(post.tags) ? post.tags : [];

  const isAuthor = post.author.id === currentUserId;

  const handleLike = async () => {
    try {
      const result = isLiked
        ? await TalentSpaceService.unlikePost(post.id, currentUserId)
        : await TalentSpaceService.likePost(post.id, currentUserId);
      
      if (result.success) {
        setIsLiked(!isLiked);
        onUpdate(); 
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
      try {
        const result = await TalentSpaceService.deletePost(post.id, currentUserId);
        if (result.success) {
          onUpdate();
          toast({ title: "Success", description: "Post deleted successfully." });
        } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      const result = await TalentSpaceService.updatePost(post.id, currentUserId, { content: editContent });
      if (result.success) {
        setIsEditing(false);
        onUpdate();
        toast({ title: "Success", description: "Post updated successfully." });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(post.content);
    setIsEditing(false);
  };
  
  const getPostTimestamp = () => {
    try {
      if (!post.createdAt) return 'just now';
      return formatDistanceToNow(post.createdAt, { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-800">{post.author.name || 'مستخدم'}</h3>
            <p className="text-sm text-gray-500">
              {getPostTimestamp()}
              {post.isEdited && <span className="text-gray-400"> • تم التعديل</span>}
            </p>
          </div>
        </div>
        
        {isAuthor && (
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            
            {showMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full justify-start text-sm text-gray-700"
                >
                  <Edit className="h-4 w-4 mr-2" /> تعديل المنشور
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> حذف المنشور
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <div className="flex space-x-2 justify-end">
              <Button onClick={handleCancelEdit} variant="ghost">إلغاء</Button>
              <Button onClick={handleSaveEdit}>حفظ</Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        )}
      </div>

      {safeMedia.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {safeMedia.map((media, index) => (
            <div key={index} className="relative w-full aspect-video">
              <Image
                src={media}
                alt={`صورة المنشور ${index + 1}`}
                fill
                className="w-full h-auto object-cover rounded-lg border border-gray-200"
              />
            </div>
          ))}
        </div>
      )}

      {safeTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {safeTags.map((tag, index) => (
            <span 
              key={index}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>{safeLikes.length} إعجاب</span>
        <span>{safeComments.length} تعليق</span>
        <span>{post.shares || 0} مشاركة</span>
      </div>

      <div className="flex border-t border-gray-200 pt-3">
        <Button
          onClick={handleLike}
          variant="ghost"
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-colors ${
            isLiked ? 'text-red-600' : 'text-gray-600'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>إعجاب</span>
        </Button>
        
        <Button
          onClick={() => setShowComments(!showComments)}
          variant="ghost"
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-gray-600"
        >
          <MessageCircle className="w-5 h-5" />
          <span>تعليق</span>
        </Button>
        
        <Button variant="ghost" className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-gray-600">
          <Share2 className="w-5 h-5" />
          <span>مشاركة</span>
        </Button>
      </div>
      
       {showComments && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="space-y-3">
            {safeComments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">لا توجد تعليقات بعد</p>
            ) : (
              safeComments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {comment.author?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-800 text-sm">
                        {comment.author?.name || 'مستخدم'}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('ar-EG') : ''}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

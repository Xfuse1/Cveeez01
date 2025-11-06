
'use client';

import { useState, useEffect, useRef } from 'react';
import GuaranteedCommentsService, { type GuaranteedComment } from '@/services/guaranteed-comments-service';
import { useAuth } from '@/contexts/auth-provider'; // Import useAuth
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface CommentsProps {
  postId: string;
  postAuthorId?: string;
}

export default function GuaranteedComments({ postId, postAuthorId }: CommentsProps) {
  const { user } = useAuth(); // Get current user
  const { toast } = useToast(); // Use toast for notifications
  const [comments, setComments] = useState<GuaranteedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingComment, setAddingComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 جاري تحميل التعليقات للبوست: ${postId}`);
      
      const result = await GuaranteedCommentsService.getCommentsByPostId(postId);
      
      if (result.success) {
        setComments(result.data);
        console.log(`✅ تم تحميل ${result.data.length} تعليق`);
      } else {
        throw new Error(result.error);
      }
      
    } catch (err: any) {
      console.error('❌ فشل في تحميل التعليقات:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadComments();
  }, [postId]);


  const handleAddComment = async () => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please log in to add a comment.', variant: 'destructive'});
      return;
    }
    if (!newComment.trim()) {
      toast({ title: 'Error', description: 'Comment cannot be empty.', variant: 'destructive'});
      return;
    }

    try {
      setAddingComment(true);
      
      const result = await GuaranteedCommentsService.addComment(postId, {
        content: newComment,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous User',
        authorAvatar: user.photoURL || '',
        parentId: replyingTo || undefined
      });

      if (result.success) {
        setNewComment('');
        setReplyingTo(null);
        await loadComments();
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
        toast({ title: 'Comment Added!', description: 'Your comment has been posted.' });
      } else {
        throw new Error(result.error);
      }
      
    } catch (err: any) {
      console.error('❌ فشل في إضافة التعليق:', err);
      toast({ title: 'Error', description: `Failed to add comment: ${err.message}`, variant: 'destructive' });
    } finally {
      setAddingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const result = await GuaranteedCommentsService.likeComment(commentId);
      
      if (result.success) {
        // Optimistically update UI
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: comment.likes + 1 }
            : comment
        ));
      }
      
    } catch (err: any) {
      console.error('❌ فشل في الإعجاب:', err);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const mainComments = comments.filter(comment => !comment.parentId);
  const getReplies = (commentId: string) => 
    comments.filter(comment => comment.parentId === commentId);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">جاري تحميل التعليقات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="guaranteed-comments bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">التعليقات</h3>
            <p className="text-gray-600 text-sm mt-1">
              {comments.length} تعليق • شارك برأيك
            </p>
          </div>
          <button
            onClick={loadComments}
            disabled={loading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            🔄 تحديث
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700">{error}</span>
          </div>
          <button 
            onClick={loadComments}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      <div className="p-6 border-b border-gray-200 bg-gray-50">
        {replyingTo && (
          <div className="flex items-center justify-between mb-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-700 text-sm">
              💬 جاري الرد على تعليق...
            </span>
            <button 
              onClick={cancelReply}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              إلغاء
            </button>
          </div>
        )}
        
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "اكتب ردك..." : "شارك برأيك في هذا البوست..."}
              rows={3}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleAddComment}
              disabled={addingComment || !newComment.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {addingComment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  جاري النشر...
                </>
              ) : (
                'نشر التعليق'
              )}
            </button>
            {newComment.trim() && (
              <button
                onClick={() => setNewComment('')}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors text-sm"
              >
                إلغاء
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {comments.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">لا توجد تعليقات بعد</h4>
            <p className="text-gray-500">كن أول من يعلق على هذا البوست</p>
          </div>
        ) : (
          <div className="space-y-6">
            {mainComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={getReplies(comment.id)}
                onLike={handleLikeComment}
                onReply={handleReply}
                onReload={loadComments}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: GuaranteedComment;
  replies: GuaranteedComment[];
  onLike: (commentId: string) => void;
  onReply: (commentId: string) => void;
  onReload: () => void;
}

function CommentItem({ comment, replies, onLike, onReply, onReload }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="comment-item border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-800">{comment.author.name}</div>
            <div className="text-gray-500 text-xs">
              {comment.createdAt.toLocaleDateString('ar-EG')} • {comment.createdAt.toLocaleTimeString('ar-EG')}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onLike(comment.id)}
            className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">👍</span>
            <span className="text-sm font-medium">{comment.likes}</span>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>

      <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => onReply(comment.id)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          💬 رد
        </button>
        
        {replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            {showReplies ? '👁️ إخفاء الردود' : `👁️ عرض ${replies.length} رد`}
          </button>
        )}
      </div>

      {showReplies && replies.length > 0 && (
        <div className="mt-4 ml-8 space-y-4 border-l-2 border-gray-200 pl-4">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <Avatar className="w-8 h-8 mr-2">
                     <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                     <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{reply.author.name}</div>
                    <div className="text-gray-500 text-xs">
                      {reply.createdAt.toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onLike(reply.id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors text-xs"
                >
                  <span>👍</span>
                  <span>{reply.likes}</span>
                </button>
              </div>
              
              <p className="text-gray-700 text-sm leading-relaxed">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

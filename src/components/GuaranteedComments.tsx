
'use client';

import { useState, useEffect, useCallback } from 'react';
import GuaranteedCommentsService, { type GuaranteedComment } from '@/services/guaranteed-comments-service';
import { useAuth } from '@/contexts/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface CommentsProps {
  postId: string;
  postAuthorId?: string;
}

export default function GuaranteedComments({ postId, postAuthorId }: CommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<GuaranteedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingComment, setAddingComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await GuaranteedCommentsService.getCommentsByPostId(postId);
      
      if (result.success) {
        setComments(result.data);
      } else {
        throw new Error(result.error);
      }
      
    } catch (err: any) {
      console.error('❌ فشل في تحميل التعليقات:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);
  
  useEffect(() => {
    loadComments();
  }, [loadComments]);


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
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: (comment.likes || 0) + 1 }
            : comment
        ));
      }
      
    } catch (err: any) {
      console.error('❌ فشل في الإعجاب:', err);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const mainComments = comments.filter(comment => !comment.parentId);
  const getReplies = (commentId: string) => 
    comments.filter(comment => comment.parentId === commentId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin h-6 w-6 text-gray-400 mr-3" />
          <span className="text-gray-500">Loading comments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="guaranteed-comments bg-background rounded-b-xl">
      <div className="p-4 border-b border-t border-gray-200 bg-gray-50/50">
        {replyingTo && (
          <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 rounded-lg">
            <span className="text-blue-700 text-sm">
              💬 Replying to a comment...
            </span>
            <Button 
              onClick={cancelReply}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800"
            >
              Cancel
            </Button>
          </div>
        )}
        
        <div className="flex space-x-3">
          {user && (
            <Avatar className="w-9 h-9">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "Write your reply..." : "Add a comment..."}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
            />
            <div className="flex justify-end mt-2">
                <Button
                    onClick={handleAddComment}
                    disabled={addingComment || !newComment.trim()}
                    size="sm"
                >
                    {addingComment ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</>
                    ) : (
                        'Post Comment'
                    )}
                </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {error && (
            <div className="text-center text-red-500 my-4">{error}</div>
        )}
        {comments.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            <p className="font-semibold">No comments yet.</p>
            <p className="text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mainComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={getReplies(comment.id)}
                onLike={handleLikeComment}
                onReply={handleReply}
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
}

function CommentItem({ comment, replies, onLike, onReply }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="comment-item flex items-start space-x-3">
        <Avatar className="w-9 h-9">
            <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
            <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800 text-sm">{comment.author.name}</span>
                    <span className="text-gray-500 text-xs">{comment.createdAt.toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mt-1">{comment.content}</p>
            </div>
            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                <button onClick={() => onLike(comment.id)} className="hover:text-red-600">Like ({comment.likes || 0})</button>
                <button onClick={() => onReply(comment.id)} className="hover:text-blue-600">Reply</button>
            </div>

            {replies.length > 0 && (
                <div className="mt-3 space-y-3">
                    {replies.map((reply) => (
                        <div key={reply.id} className="flex items-start space-x-3">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} />
                                <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-800 text-xs">{reply.author.name}</span>
                                    <span className="text-gray-500 text-xs">{reply.createdAt.toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 text-sm mt-1">{reply.content}</p>
                                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                    <button onClick={() => onLike(reply.id)} className="hover:text-red-600">Like ({reply.likes || 0})</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { TalentSpaceService } from '@/services/talent-space';
import type { Post, Comment } from '@/types/talent-space';
import { useAuth } from '@/contexts/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import * as Icons from 'lucide-react'; // use namespace import to avoid missing named exports
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

interface PostCardProps {
    post: Post;
    currentUserId: string;
    onUpdate: () => void;
}

export function PostCard({ post, currentUserId, onUpdate }: PostCardProps) {
    const { language } = useLanguage();
    const t = translations[language].talentSpace;

    const safeLikes = Array.isArray(post.likes) ? post.likes : [];
    const isLiked = safeLikes.includes(currentUserId);
    const [showComments, setShowComments] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [isSavingPost, setIsSavingPost] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isDeletingCommentId, setIsDeletingCommentId] = useState<string | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [isSavingComment, setIsSavingComment] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const { toast } = useToast();
    const { user } = useAuth();

    const safeMedia = Array.isArray(post.media) ? post.media : [];
    const safeTags = Array.isArray(post.tags) ? post.tags : [];
    const isAuthor = post.author.id === currentUserId;

    // Subscribe to comments
    useEffect(() => {
        if (!post.id) return;
        const unsubscribe = TalentSpaceService.subscribeToComments(post.id, (fetchedComments) => {
            setComments(fetchedComments);
        });
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [post.id]);

    const handleLike = async () => {
        try {
            const result = isLiked
                ? await TalentSpaceService.unlikePost(post.id, currentUserId)
                : await TalentSpaceService.likePost(post.id, currentUserId);
            if (!result.success) {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim() || !user) return;
        setIsSubmittingComment(true);
        try {
            const result = await TalentSpaceService.createComment({
                postId: post.id,
                content: newComment,
                author: { id: user.uid, name: user.displayName || 'User', avatar: user.photoURL || '' },
            });
            if (result.success) {
                setNewComment('');
                toast({ title: 'Success', description: t.toast?.commentAdded || 'Comment added' });
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(t.post.confirmDelete)) {
            try {
                const result = await TalentSpaceService.deletePost(post.id, currentUserId);
                if (result.success) {
                    onUpdate();
                    toast({ title: 'Success', description: 'Post deleted successfully.' });
                } else {
                    toast({ title: 'Error', description: result.error, variant: 'destructive' });
                }
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!currentUserId) return;
        try {
            setIsDeletingCommentId(commentId);
            await TalentSpaceService.deleteComment(post.id, commentId);
            setIsDeletingCommentId(null);
            toast({ title: 'تم حذف التعليق', description: 'تم حذف تعليقك بنجاح.' });
        } catch (error) {
            console.error('Error deleting comment:', error);
            setIsDeletingCommentId(null);
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر حذف التعليق. حاول مرة أخرى.' });
        }
    };

    const startEditingComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.content);
    };

    const cancelEditingComment = () => {
        setEditingCommentId(null);
        setEditingCommentContent('');
    };

    const saveEditingComment = async (commentId: string) => {
        if (!editingCommentContent.trim()) return;
        try {
            setIsSavingComment(true);
            await TalentSpaceService.updateComment(post.id, commentId, editingCommentContent.trim());
            setIsSavingComment(false);
            setEditingCommentId(null);
            setEditingCommentContent('');
            toast({ title: t.post.save || 'تم التعديل', description: 'تم حفظ التعديلات بنجاح.' });
        } catch (error) {
            console.error('Error updating comment:', error);
            setIsSavingComment(false);
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر تعديل التعليق. حاول مرة أخرى.' });
        }
    };

    const handleSaveEdit = async () => {
        if (!isAuthor || !editContent.trim()) return;
        try {
            setIsSavingPost(true);
            await TalentSpaceService.updatePost(post.id, { content: editContent.trim() });
            setIsSavingPost(false);
            setIsEditing(false);
            toast({ title: 'Success', description: 'Post updated successfully.' });
        } catch (error) {
            console.error('Error updating post:', error);
            setIsSavingPost(false);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update post.' });
        }
    };

    const handleCancelEdit = () => {
        setEditContent(post.content);
        setIsEditing(false);
    };

    const handleShare = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to share.' });
            return;
        }
        try {
            setIsSharing(true);
            const currentUserForService = {
                id: user.uid,
                name: user.displayName || 'User',
                headline: '',
                avatarUrl: user.photoURL || '',
            };
            const result = await TalentSpaceService.sharePost(post.id, currentUserForService);
            if (!result.success) {
                toast({ variant: 'destructive', title: 'Error', description: result.error ?? 'Failed to share post.' });
                return;
            }
            toast({ variant: 'default', title: 'Shared', description: 'Post shared successfully to your feed.' });
        } catch (error) {
            console.error('Error sharing post:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong while sharing this post.' });
        } finally {
            setIsSharing(false);
        }
    };

    const getPostTimestamp = () => {
        try {
            if (!post.createdAt) return 'just now';
            return formatDistanceToNow(post.createdAt, { addSuffix: true });
        } catch {
            return 'just now';
        }
    };

    const shareCount = post.shareCount ?? (post.shares || 0);

    return (
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 ring-2 ring-gray-100 ring-offset-2">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {post.author.name?.charAt(0) || '?'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-gray-900 text-base">{post.author.name || t.post.unknownUser}</h3>
                        {post.sharedFrom ? (
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">
                                    shared a post from <span className="font-medium text-foreground">{post.sharedFrom.authorName}</span>
                                </span>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {getPostTimestamp()}
                                    {post.isEdited && <span className="text-gray-400"> • {t.post.edited}</span>}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                {getPostTimestamp()}
                                {post.isEdited && <span className="text-gray-400"> • {t.post.edited}</span>}
                            </p>
                        )}
                    </div>
                </div>
                {isAuthor && (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50" title={t.post.edit}>
                            <Icons.Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50" title={t.post.delete}>
                            <Icons.Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Content / Edit */}
            <div className="mb-4">
                {isEditing ? (
                    <div className="space-y-3">
                        <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" rows={4} />
                        <div className="flex space-x-2 justify-end">
                            <Button onClick={handleCancelEdit} variant="ghost" disabled={isSavingPost}>{t.post.cancel}</Button>
                            <Button onClick={handleSaveEdit} disabled={isSavingPost || !editContent.trim()}>{isSavingPost ? 'Saving...' : t.post.save}</Button>
                        </div>
                    </div>
                ) : (
                    <div className={post.sharedFrom ? 'mt-2 border border-gray-200 rounded-lg p-4 bg-gray-50/50' : ''}>
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">{post.content}</p>
                        {safeMedia.length > 0 && (
                            <div className={`mt-4 grid gap-3 ${safeMedia.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {safeMedia.map((media: string, index: number) => (
                                    <div key={index} className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group cursor-pointer" onClick={() => setSelectedImage(media)}>
                                        <Image src={media} alt={`${t.post.postImage} ${index + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {safeTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {safeTags.map((tag: string, index: number) => (
                                    <span key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3 px-1">
                <span className="font-medium hover:text-blue-600 cursor-pointer">
                    {safeLikes.length > 0 && <span className="text-red-500">❤️</span>} {safeLikes.length} {t.post.likes}
                </span>
                <div className="flex items-center gap-4">
                    <span className="font-medium hover:text-blue-600 cursor-pointer">{comments.length} {t.post.comments}</span>
                    <span className="font-medium hover:text-blue-600 cursor-pointer">{shareCount} {shareCount === 1 ? 'Share' : 'Shares'}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex border-t border-gray-100 pt-2 gap-1">
                <Button onClick={handleLike} variant="ghost" className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${isLiked ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <Icons.Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-current scale-110' : 'hover:scale-110'}`} />
                    <span className="text-sm">{t.post.like}</span>
                </Button>
                <Button onClick={() => setShowComments(!showComments)} variant="ghost" className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${showComments ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <Icons.MessageCircle className="w-5 h-5 transition-transform hover:scale-110" />
                    <span className="text-sm">{t.post.comment}</span>
                </Button>
                <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50" onClick={handleShare} disabled={isSharing}>
                    <Icons.Share2 className={`w-5 h-5 transition-transform ${isSharing ? 'animate-pulse' : 'hover:scale-110'}`} />
                    <span className="text-sm">{isSharing ? 'Sharing...' : t.post.share}</span>
                </Button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="mb-4 flex gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL || ''} />
                            <AvatarFallback>{user?.displayName?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                            <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={t.post.writeComment} className="min-h-[40px] h-[40px] py-2 resize-none text-sm" />
                            <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim() || isSubmittingComment}>{t.post.sendComment}</Button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {comments.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center">{t.post.noComments}</p>
                        ) : (
                            comments.map((comment: Comment) => {
                                const isCommentOwner = !!currentUserId && currentUserId === comment.author.id;
                                const isEditingThis = editingCommentId === comment.id;
                                return (
                                    <div key={comment.id} className="flex items-start justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2">
                                        <div className="flex items-start gap-3 flex-1">
                                            <Avatar className="h-8 w-8 mt-1">
                                                <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                                                <AvatarFallback>{comment.author.name?.charAt(0) || '?'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-800 text-sm">{comment.author?.name || t.post.unknownUser}</span>
                                                    <span className="text-gray-400 text-xs">{comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ''}</span>
                                                </div>
                                                {isEditingThis ? (
                                                    <div className="space-y-2 mt-1">
                                                        <Textarea value={editingCommentContent} onChange={(e) => setEditingCommentContent(e.target.value)} className="min-h-[60px] text-sm bg-white" />
                                                        <div className="flex justify-end space-x-2">
                                                            <Button size="sm" variant="ghost" onClick={cancelEditingComment} className="h-7 text-xs" disabled={isSavingComment}>{t.post.cancel}</Button>
                                                            <Button size="sm" onClick={() => saveEditingComment(comment.id)} className="h-7 text-xs" disabled={isSavingComment || !editingCommentContent.trim()}>{isSavingComment ? 'Saving...' : t.post.save}</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                                                )}
                                            </div>
                                        </div>
                                        {isCommentOwner && !isEditingThis && (
                                            <div className="flex items-center gap-1 self-start mt-1">
                                                <button type="button" onClick={() => startEditingComment(comment)} className="text-gray-400 hover:text-blue-600 transition-colors p-1" title={t.post.edit}>
                                                    <Icons.Edit className="h-3 w-3" />
                                                </button>
                                                <button type="button" onClick={() => handleDeleteComment(comment.id)} disabled={isDeletingCommentId === comment.id} className="text-gray-400 hover:text-destructive transition-colors p-1 disabled:opacity-50" title={t.post.delete}>
                                                    {isDeletingCommentId === comment.id ? <span className="text-[10px]">...</span> : <Icons.Trash2 className="h-3 w-3" />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-3xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <img src={selectedImage} alt="Full view" className="object-contain w-full h-full" />
                        <button className="absolute top-2 right-2 text-white text-2xl" onClick={() => setSelectedImage(null)}>✕</button>
                    </div>
                </div>
            )}
        </div>
    );
}

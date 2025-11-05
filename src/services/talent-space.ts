'use client';

import { db } from '@/firebase/config';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Post, Comment, User, Message } from '@/types/talent-space';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { GuaranteedPostsService } from './guaranteed-posts-service';


const storage = getStorage();

interface CreatePostData {
  userId: string;
  content: string;
  linkUrl?: string | null;
  mediaFile?: File;
  mediaType?: 'image' | 'video';
}

// Rewritten createPost function for robustness
export async function createPost(data: CreatePostData): Promise<string | null> {
  try {
    const postData = {
        title: '',
        content: data.content,
        authorId: data.userId,
        authorName: 'User', // This should be fetched from user profile
        media: data.mediaFile ? { type: data.mediaType!, url: '' } : undefined,
    }
    
    // Handle media upload if a file is provided
    if (data.mediaFile && data.mediaType) {
      const storageRef = ref(storage, `posts/${data.userId}/${Date.now()}_${data.mediaFile.name}`);
      await uploadBytes(storageRef, data.mediaFile);
      const mediaUrl = await getDownloadURL(storageRef);
      if (postData.media) {
          postData.media.url = mediaUrl;
      }
    }
    
    const result = await GuaranteedPostsService.createPost(postData);

    return result.postId || null;

  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

export async function likePost(postId: string, userId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId),
    });
    return true;
  } catch (error) {
    console.error('Error liking post:', error);
    return false;
  }
}

export async function unlikePost(postId: string, userId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId),
    });
    return true;
  } catch (error) {
    console.error('Error unliking post:', error);
    return false;
  }
}

// Rewritten getPosts to be more stable
export async function getPosts(): Promise<Post[]> {
    const result = await GuaranteedPostsService.fetchPosts();
    if (result.success) {
        return result.data.map(p => ({
            id: p.id,
            userId: p.author.id,
            content: p.content,
            imageUrl: p.media.type === 'image' ? p.media.url : undefined,
            videoUrl: p.media.type === 'video' ? p.media.url : undefined,
            likes: p.likes,
            likedBy: [],
            comments: p.comments,
            createdAt: p.createdAt.toISOString(),
        }));
    }
    return [];
}


export async function addComment(
  postId: string,
  userId: string,
  content: string
): Promise<boolean> {
  try {
    const commentData = {
      postId,
      userId,
      content,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'comments'), commentData);

    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: increment(1),
    });

    return true;
  } catch (error) {
    console.error('Error adding comment:', error);
    return false;
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(commentsQuery);
    const comments: Comment[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAtDate = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        return {
            id: doc.id,
            postId: data.postId,
            userId: data.userId,
            content: data.content,
            createdAt: createdAtDate.toISOString(),
        } as Comment;
    });
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

// Expanded getUserById to be more robust
export async function getUserById(userId: string): Promise<User | null> {
    if (!userId) return null;
    try {
      // Check seekers collection
      let userRef = doc(db, 'seekers', userId);
      let userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
         const data = userSnap.data();
         return { 
             id: userSnap.id,
             name: data.fullName || 'Seeker',
             headline: data.jobTitle || 'Job Seeker',
             avatarUrl: data.photoURL || ''
         } as User;
      }
      
      // Fallback to employers collection
      userRef = doc(db, 'employers', userId);
      userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
         const data = userSnap.data();
         return { 
             id: userSnap.id,
             name: data.companyNameEn || 'Employer',
             headline: data.industry || 'Company',
             avatarUrl: data.photoURL || ''
         } as User;
      }

      // Fallback to a general users collection if it exists
      userRef = doc(db, 'users', userId);
      userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        return { 
            id: userSnap.id,
            name: data.displayName || 'User',
            headline: data.headline || 'Member',
            avatarUrl: data.photoURL || ''
        } as User;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
}
  

export async function sendMessage(
  userId: string,
  content: string,
  groupId?: string
): Promise<boolean> {
  try {
    const messageData = {
      userId,
      content,
      groupId: groupId || null, 
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'messages'), messageData);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

export async function getMessages(groupId?: string): Promise<Message[]> {
  try {
    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(messagesQuery);
    
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.groupId === (groupId || null)) {
            const createdAtDate = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
            messages.push({
                id: doc.id,
                userId: data.userId,
                groupId: data.groupId,
                content: data.content,
                createdAt: createdAtDate.toISOString(),
            } as Message);
        }
    });

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

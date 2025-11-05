'use client';

import { db } from '@/firebase/config';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Post, Comment, User } from '@/types/talent-space';
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
} from 'firebase/firestore';

const storage = getStorage();

/**
 * Sanitizes data by removing undefined fields, which are not supported by Firestore.
 * @param data The object to sanitize.
 * @returns A new object with undefined fields removed.
 */
function sanitizeForFirestore(data: Record<string, any>): Record<string, any> {
  const sanitizedData: Record<string, any> = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (value !== undefined) {
        sanitizedData[key] = value;
      }
    }
  }
  return sanitizedData;
}


interface CreatePostData {
  userId: string;
  content: string;
  linkUrl?: string | null;
  mediaFile?: File;
  mediaType?: 'image' | 'video';
}

export async function createPost(data: CreatePostData): Promise<string | null> {
  try {
    let mediaUrl: string | undefined;

    if (data.mediaFile && data.mediaType) {
      const storageRef = ref(storage, `posts/${data.userId}/${Date.now()}_${data.mediaFile.name}`);
      await uploadBytes(storageRef, data.mediaFile);
      mediaUrl = await getDownloadURL(storageRef);
    }
    
    const postData = {
      userId: data.userId,
      content: data.content,
      imageUrl: data.mediaType === 'image' && mediaUrl ? mediaUrl : null,
      videoUrl: data.mediaType === 'video' && mediaUrl ? mediaUrl : null,
      linkUrl: data.linkUrl || null,
      likes: 0,
      likedBy: [],
      comments: 0,
      createdAt: serverTimestamp(),
    };
    
    // This is the critical part: ensure no `undefined` values are sent.
    const sanitizedPostData = Object.fromEntries(
        Object.entries(postData).filter(([_, v]) => v !== undefined)
    );

    const docRef = await addDoc(collection(db, 'posts'), sanitizedPostData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    if (error instanceof Error && error.message.includes('invalid data')) {
        console.error('Firestore data error:', error.message);
    }
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

export async function getPosts(): Promise<Post[]> {
  try {
    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(postsQuery);
    
    if (querySnapshot.empty) {
        console.log('No posts found in Firestore.');
        return [];
    }

    const posts: Post[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId || '',
            content: data.content || '',
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl,
            linkUrl: data.linkUrl,
            likes: data.likes || 0,
            likedBy: data.likedBy || [],
            comments: data.comments || 0,
            createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        } as Post;
    });
    return posts;
  } catch (error) {
    console.error('Error fetching posts from Firestore:', error);
    return []; // Return empty array on error, don't fallback to mocks
  }
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
        return {
            id: doc.id,
            postId: data.postId,
            userId: data.userId,
            content: data.content,
            createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        } as Comment;
    });
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function getUserById(userId: string): Promise<User | null> {
    try {
      // First, try to get from 'users' collection (if you have one)
      let userRef = doc(db, 'users', userId);
      let userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as User;
      }
      
      // Fallback to 'seekers' collection
      userRef = doc(db, 'seekers', userId);
      userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
         const data = userSnap.data();
         return { 
             id: userSnap.id,
             name: data.fullName,
             headline: data.jobTitle,
             avatarUrl: data.photoURL || ''
         } as User;
      }
      
      // Fallback to 'employers' collection
      userRef = doc(db, 'employers', userId);
      userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
         const data = userSnap.data();
         return { 
             id: userSnap.id,
             name: data.companyNameEn,
             headline: data.industry,
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
      where('groupId', '==', groupId || null),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(messagesQuery);
    const messages: Message[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            groupId: data.groupId,
            content: data.content,
            createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        } as Message;
    });

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

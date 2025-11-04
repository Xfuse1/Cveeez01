'use client';

import { db } from '@/firebase/config';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Post, Comment, Message } from '@/types/talent-space';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// Initialize Firebase Storage
const storage = getStorage();

// --- Post Service Functions ---

export async function createPost(
  userId: string,
  content: string,
  mediaFile?: File,
  mediaType?: 'image' | 'video',
  linkUrl?: string
): Promise<string | null> {
  try {
    let mediaUrl: string | undefined;

    // Upload media file if provided
    if (mediaFile && mediaType) {
      const storageRef = ref(storage, `posts/${userId}/${Date.now()}_${mediaFile.name}`);
      await uploadBytes(storageRef, mediaFile);
      mediaUrl = await getDownloadURL(storageRef);
    }

    const postData: Partial<Post> = {
      userId,
      content,
      likes: 0,
      likedBy: [],
      comments: 0,
      createdAt: new Date().toISOString(),
    };

    if (mediaType === 'image' && mediaUrl) {
      postData.imageUrl = mediaUrl;
    } else if (mediaType === 'video' && mediaUrl) {
      postData.videoUrl = mediaUrl;
    }

    if (linkUrl) {
      postData.linkUrl = linkUrl;
    }

    const docRef = await addDoc(collection(db, 'posts'), postData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

export async function likePost(postId: string, userId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayUnion(userId),
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
      likes: arrayRemove(userId),
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
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

// --- Comment Service Functions ---

export async function addComment(
  postId: string,
  userId: string,
  content: string
): Promise<boolean> {
  try {
    const commentData: Partial<Comment> = {
      postId,
      userId,
      content,
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, 'comments'), commentData);

    // Increment comment count on post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion(Date.now()), // Using timestamp as a way to increment
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
    const comments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() } as Comment);
    });
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

// --- Message Service Functions ---

export async function sendMessage(
  userId: string,
  content: string,
  groupId?: string
): Promise<boolean> {
  try {
    const messageData: Partial<Message> = {
      userId,
      content,
      groupId,
      createdAt: new Date().toISOString(),
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
    let messagesQuery;
    
    if (groupId) {
      messagesQuery = query(
        collection(db, 'messages'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'asc')
      );
    } else {
      messagesQuery = query(
        collection(db, 'messages'),
        where('groupId', '==', null),
        orderBy('createdAt', 'asc')
      );
    }

    const querySnapshot = await getDocs(messagesQuery);
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

// --- File Upload Helper ---

export async function uploadFile(
  file: File,
  path: string
): Promise<string | null> {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

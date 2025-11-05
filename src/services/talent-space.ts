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
    const postPayload: any = {
      userId: data.userId,
      content: data.content,
      likes: 0,
      comments: 0,
      likedBy: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Handle media upload if a file is provided
    if (data.mediaFile && data.mediaType) {
      const storageRef = ref(storage, `posts/${data.userId}/${Date.now()}_${data.mediaFile.name}`);
      await uploadBytes(storageRef, data.mediaFile);
      const mediaUrl = await getDownloadURL(storageRef);
      
      if (data.mediaType === 'image') {
        postPayload.imageUrl = mediaUrl;
      } else if (data.mediaType === 'video') {
        postPayload.videoUrl = mediaUrl;
      }
    }

    // Add linkUrl if it exists
    if (data.linkUrl) {
      postPayload.linkUrl = data.linkUrl;
    }
    
    const docRef = await addDoc(collection(db, 'posts'), postPayload);
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
  try {
    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(postsQuery);
    
    if (querySnapshot.empty) {
        console.log('No posts found in Firestore. Returning empty array.');
        return [];
    }

    const posts: Post[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Keep createdAt as a Timestamp object from Firestore
        const createdAtTimestamp = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
        
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
            createdAt: createdAtTimestamp, // Store as ISO string for consistency
        } as Post;
    });
    return posts;
  } catch (error) {
    console.error('Error fetching posts from Firestore:', error);
    return []; // Return empty array on error
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

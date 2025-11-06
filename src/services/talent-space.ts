'use client';

import { db } from '@/firebase/config';
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
  writeBatch,
  collectionGroup,
} from 'firebase/firestore';

interface CreatePostData {
  userId: string;
  content: string;
  mediaUrl?: string; // Expect a URL now
}

export async function createPost(data: CreatePostData): Promise<{success: boolean, postId?: string, error?: string}> {
  try {
    console.log('🔄 [Post] Starting post creation...');
    
    console.log(`👤 [Post] Fetching author details for userId: ${data.userId}`);
    const authorDetails = await getUserById(data.userId);
    if (!authorDetails) {
        throw new Error('Could not find author details for the post.');
    }
    console.log(`✅ [Post] Author details found: ${authorDetails.name}`);

    const newPostData: any = {
      userId: data.userId,
      author: {
        id: authorDetails.id,
        name: authorDetails.name,
        avatarUrl: authorDetails.avatarUrl
      },
      content: data.content,
      likes: 0,
      comments: 0,
      createdAt: serverTimestamp(),
      likedBy: [],
      status: 'published'
    };

    if (data.mediaUrl) {
      // Simple check for image/video based on common extensions
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(data.mediaUrl)) {
        newPostData.imageUrl = data.mediaUrl;
      } else {
        newPostData.videoUrl = data.mediaUrl;
      }
    }

    console.log('📝 [Post] Adding post document to Firestore...');
    const docRef = await addDoc(collection(db, 'posts'), newPostData);
    console.log('✅ [Post] Post created successfully with ID:', docRef.id);
    
    return {
      success: true,
      postId: docRef.id
    };
  } catch (error: any) {
    console.error('❌ [Post] Error creating post:', error);
    return {
      success: false,
      error: error.message || 'Failed to create post'
    };
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
    const posts: Post[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        return {
          id: doc.id,
          userId: data.userId,
          content: data.content,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          linkUrl: data.linkUrl,
          likes: data.likes || 0,
          likedBy: data.likedBy || [],
          comments: data.comments || 0,
          createdAt: createdAt.toISOString(),
        } as Post;
    });
    return posts;
  } catch(error) {
      console.error("Error fetching posts:", error);
      return [];
  }
}


export async function addComment(
  postId: string,
  userId: string,
  content: string
): Promise<boolean> {
  try {
    const batch = writeBatch(db);

    const commentsRef = collection(db, 'comments');
    const newCommentRef = doc(commentsRef);
    batch.set(newCommentRef, {
      postId,
      userId,
      content,
      createdAt: serverTimestamp(),
    });

    const postRef = doc(db, 'posts', postId);
    batch.update(postRef, {
      comments: increment(1),
    });

    await batch.commit();
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
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        return {
            id: doc.id,
            postId: data.postId,
            userId: data.userId,
            content: data.content,
            createdAt: createdAt.toISOString(),
        } as Comment;
    });
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function getUserById(userId: string): Promise<User | null> {
    if (!userId) return null;
    try {
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

      return { id: userId, name: 'Anonymous', headline: 'User', avatarUrl: '' };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { id: userId, name: 'Error User', headline: 'Error', avatarUrl: '' };
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
    // Avoid composite index requirement by fetching all messages and
    // performing filtering/sorting in-memory. This is acceptable for
    // moderate volumes; if messages grow large consider server-side
    // paging or creating the recommended composite index in Firebase.
    const querySnapshot = await getDocs(collection(db, 'messages'));

    let messages: Message[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
      return {
        id: doc.id,
        userId: data.userId,
        groupId: data.groupId,
        content: data.content,
        createdAt: createdAt.toISOString(),
      } as Message;
    });

    // If a groupId was provided, filter client-side
    if (groupId) {
      messages = messages.filter((m) => m.groupId === groupId);
    }

    // Sort by createdAt ascending
    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

'use client';

import { db } from '@/firebase/config';
import { uploadToCloudinary, validateCloudinaryConfig } from '@/lib/cloudinary';
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
  user: User;
  content: string;
  linkUrl?: string | null;
  mediaFile?: File;
  mediaType?: 'image' | 'video';
}

export async function createPost(data: CreatePostData): Promise<{success: boolean, postId?: string, error?: string}> {
  try {
    // ✅ التحقق من تكوين Cloudinary أولاً
    if (data.mediaFile && !validateCloudinaryConfig()) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    const postCollection = collection(db, 'posts');
    let mediaUrl: string | undefined = undefined;
    
    // Upload media to Cloudinary if provided
    if (data.mediaFile && data.mediaType) {
      try {
        console.log('📤 Uploading media file...');
        mediaUrl = await uploadToCloudinary(data.mediaFile);
        console.log(`✅ Successfully uploaded file`);
      } catch (uploadError) {
        console.error('Error uploading media to Cloudinary:', uploadError);
        throw new Error('Failed to upload media');
      }
    }

    const newPostData: any = {
      userId: data.user.id,
      author: {
        id: data.user.id,
        name: data.user.name,
        avatar: data.user.avatarUrl
      },
      content: data.content,
      likes: 0,
      comments: 0,
      createdAt: serverTimestamp(),
      likedBy: [],
      status: 'published' // Ensure status is set
    };

    if (data.linkUrl) {
      newPostData.linkUrl = data.linkUrl;
    }

    if (mediaUrl) {
        if (data.mediaType === 'image') {
          newPostData.imageUrl = mediaUrl;
        } else {
          newPostData.videoUrl = mediaUrl;
        }
    }


    const docRef = await addDoc(postCollection, newPostData);
    console.log('✅ Post created successfully:', docRef.id);
    
    return {
      success: true,
      postId: docRef.id
    };
  } catch (error: any) {
    console.error('❌ Error creating post:', error);
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

export async function uploadFile(userId: string, file: File): Promise<string> {
    try {
        // Upload to Cloudinary and return the URL
        const downloadURL = await uploadToCloudinary(file);
        return downloadURL;
    } catch (error) {
        console.error("File upload error: ", error);
        throw new Error("Failed to upload file.");
    }
}


'use client';
import { 
  collection, getDocs, addDoc, orderBy, query, limit,
  Timestamp, onSnapshot, type Unsubscribe, updateDoc, doc,
  arrayUnion, arrayRemove
} from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface GroupChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  type: 'text' | 'image' | 'file';
  replyTo?: string;
  reactions?: { [key: string]: string[] };
}

export class GroupChatService {
  private static messages: GroupChatMessage[] = [];
  private static unsubscribe: Unsubscribe | null = null;

  // ✅ إرسال رسالة في الشات الجماعي
  static async sendMessage(messageData: {
    content: string;
    sender: { id: string; name: string; avatar: string };
    type?: 'text' | 'image' | 'file';
    replyTo?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const messagesRef = collection(db, 'group_chat');
      
      const newMessage = {
        content: messageData.content.trim(),
        sender: messageData.sender,
        type: messageData.type || 'text',
        replyTo: messageData.replyTo || null,
        reactions: {},
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(messagesRef, newMessage);

      console.log('✅ تم إرسال رسالة في الشات الجماعي');
      
      return {
        success: true,
        messageId: docRef.id
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ جلب رسائل الشات الجماعي
  static async getMessages(limitCount: number = 100): Promise<{ 
    success: boolean; 
    data: GroupChatMessage[]; 
    error?: string 
  }> {
    try {
      const messagesRef = collection(db, 'group_chat');
      const messagesQuery = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(messagesQuery);
      
      const messages: GroupChatMessage[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate()
        } as GroupChatMessage);
      });

      // عكس الترتيب ليصبح من الأقدم للأحدث
      const sortedMessages = messages.reverse();
      this.messages = sortedMessages;

      return {
        success: true,
        data: sortedMessages
      };

    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // ✅ الاشتراك في تحديثات الشات الجماعي (Real-time)
  static subscribeToMessages(
    callback: (messages: GroupChatMessage[]) => void
  ): Unsubscribe {
    const messagesRef = collection(db, 'group_chat');
    const messagesQuery = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    this.unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages: GroupChatMessage[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate()
        } as GroupChatMessage);
      });

      const sortedMessages = messages.reverse();
      this.messages = sortedMessages;
      callback(sortedMessages);
    });

    return this.unsubscribe;
  }

  // ✅ إضافة تفاعل على الرسالة
  static async addReaction(messageId: string, reaction: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const messageRef = doc(db, 'group_chat', messageId);
      await updateDoc(messageRef, {
        [`reactions.${reaction}`]: arrayUnion(userId)
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ إلغاء الاشتراك
  static unsubscribeFromMessages() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // ✅ جلب آخر الرسائل (للعرض السريع)
  static getCachedMessages(): GroupChatMessage[] {
    return this.messages;
  }
}

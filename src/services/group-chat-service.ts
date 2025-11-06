
'use client';
import { 
  collection, getDocs, addDoc, orderBy, query, limit,
  Timestamp, onSnapshot, type Unsubscribe, updateDoc, doc,
  arrayUnion, arrayRemove, where
} from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface GroupChatMessage {
  id: string;
  content: string;
  groupId?: string; // Optional for global chat
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
    groupId?: string; // Add groupId
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const collectionName = messageData.groupId ? 'group_messages' : 'group_chat';
      const messagesRef = collection(db, collectionName);
      
      const newMessage: any = {
        content: messageData.content.trim(),
        sender: messageData.sender,
        type: messageData.type || 'text',
        replyTo: messageData.replyTo || null,
        reactions: {},
        createdAt: Timestamp.now()
      };
      
      if (messageData.groupId) {
        newMessage.groupId = messageData.groupId;
      }

      const docRef = await addDoc(messagesRef, newMessage);

      console.log(`✅ تم إرسال رسالة في ${collectionName}`);
      
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

  // ✅ جلب رسائل الشات الجماعي والجروبات
  static async getMessages(groupId?: string): Promise<{ 
    success: boolean; 
    data: GroupChatMessage[]; 
    error?: string 
  }> {
    try {
      const collectionName = groupId ? 'group_messages' : 'group_chat';
      const messagesRef = collection(db, collectionName);
      
      const constraints = [
        orderBy('createdAt', 'desc'),
        limit(100)
      ];
      if (groupId) {
        constraints.unshift(where('groupId', '==', groupId));
      }
      
      const messagesQuery = query(messagesRef, ...constraints);
      
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

  // ✅ الاشتراك في تحديثات الشات (عام أو خاص بجروب)
  static subscribeToMessages(
    callback: (messages: GroupChatMessage[]) => void,
    groupId?: string
  ): Unsubscribe {
    const collectionName = groupId ? 'group_messages' : 'group_chat';
    const messagesRef = collection(db, collectionName);
    
    const constraints = [
        orderBy('createdAt', 'desc'),
        limit(100)
    ];
    if (groupId) {
        constraints.unshift(where('groupId', '==', groupId));
    }
    
    const messagesQuery = query(messagesRef, ...constraints);

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
  static async addReaction(messageId: string, reaction: string, userId: string, isGroupMessage: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const collectionName = isGroupMessage ? 'group_messages' : 'group_chat';
      const messageRef = doc(db, collectionName, messageId);
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

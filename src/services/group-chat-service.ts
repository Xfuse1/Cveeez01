'use client';
import { 
  collection, getDocs, addDoc, orderBy, query, limit,
  Timestamp, onSnapshot, updateDoc, doc,
  arrayUnion, arrayRemove, where,
} from 'firebase/firestore';
import type { Unsubscribe, QueryDocumentSnapshot, DocumentData, QuerySnapshot, QueryConstraint } from 'firebase/firestore';
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
  
  // ✅ إرسال رسالة في الشات الجماعي
  static async sendMessage(messageData: {
    content: string;
    sender: { id: string; name: string; avatar: string };
    type?: 'text' | 'image' | 'file';
    replyTo?: string;
    groupId?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Use 'group_chat_messages' for group chats, 'group_chat' for global chat
      const collectionName = messageData.groupId ? 'group_chat_messages' : 'group_chat';
      const messagesRef = collection(db, collectionName);
      
      const newMessage = {
        content: messageData.content.trim(),
        sender: messageData.sender,
        type: messageData.type || 'text',
        replyTo: messageData.replyTo || null,
        reactions: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...(messageData.groupId && { groupId: messageData.groupId })
      };

      const docRef = await addDoc(messagesRef, newMessage);

      // Update group's lastActivity if this is a group message
      if (messageData.groupId) {
        const groupRef = doc(db, 'professional_groups', messageData.groupId);
        await updateDoc(groupRef, {
          lastActivity: Timestamp.now()
        });
      }

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
      // Use 'group_chat_messages' for group chats, 'group_chat' for global chat
      const collectionName = groupId ? 'group_chat_messages' : 'group_chat';
      const messagesRef = collection(db, collectionName);
      
      // TODO: replace `any` with Firestore QueryConstraint type
      const constraints: any[] = [
        orderBy('createdAt', 'desc'),
        limit(100)
      ];
      if (groupId) {
        constraints.unshift(where('groupId', '==', groupId));
      }
      
      const messagesQuery = query(messagesRef, ...constraints);
      
      const snapshot = await getDocs(messagesQuery);
      
      const messages: GroupChatMessage[] = [];
      // TODO: replace `any` with Firestore types (QueryDocumentSnapshot<DocumentData>)
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate() : data.createdAt
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


  // ✅ إضافة تفاعل على الرسالة
  static async addReaction(messageId: string, reaction: string, userId: string, isGroupMessage: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      // Use 'group_chat_messages' for group messages, 'group_chat' for global chat
      const collectionName = isGroupMessage ? 'group_chat_messages' : 'group_chat';
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

  // ✅ جلب آخر الرسائل (للعرض السريع)
  static getCachedMessages(): GroupChatMessage[] {
    return this.messages;
  }
}

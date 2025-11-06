'use client';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, limit, arrayUnion, arrayRemove,
  Timestamp, getDoc, onSnapshot, Unsubscribe
} from 'firebase/firestore';
import { db } from '@/firebase/config';

/**
 * Safely converts a timestamp field to a Date object.
 * Handles Firebase Timestamps, Date objects, ISO strings, and undefined/null values.
 */
function toDate(timestamp: any): Date {
  if (!timestamp) {
    return new Date();
  }
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a Firebase Timestamp with toDate method
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // If it's a string (ISO date string)
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  // If it has seconds property (Timestamp-like object)
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  // Fallback
  return new Date();
}

export interface ProfessionalGroup {
  id: string;
  name: string;
  description: string;
  category: 'tech' | 'design' | 'marketing' | 'management' | 'finance' | 'healthcare' | 'education' | 'other';
  memberCount: number;
  members: string[];
  createdAt: Date;
  createdBy: string;
  isPublic: boolean;
  tags: string[];
  rules?: string;
  avatar?: string;
  lastActivity: Date;
}

export interface GroupChatMessage {
  id: string;
  groupId: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  type: 'text' | 'image' | 'file';
  replyTo?: string;
  reactions: { [key: string]: string[] };
}

export class ProfessionalGroupsService {
  
  static async sendGroupMessage(messageData: {
    groupId: string;
    content: string;
    sender: { id: string; name: string; avatar: string };
    type?: 'text' | 'image' | 'file';
    replyTo?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const messagesRef = collection(db, 'group_chat_messages');
      
      const newMessage = {
        groupId: messageData.groupId,
        content: messageData.content.trim(),
        sender: messageData.sender,
        type: messageData.type || 'text',
        replyTo: messageData.replyTo || null,
        reactions: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(messagesRef, newMessage);

      const groupRef = doc(db, 'professional_groups', messageData.groupId);
      await updateDoc(groupRef, {
        lastActivity: Timestamp.now()
      });

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

  static async getGroupMessages(groupId: string, limitCount: number = 50): Promise<{ 
    success: boolean; 
    data: GroupChatMessage[]; 
    error?: string 
  }> {
    try {
      const messagesRef = collection(db, 'group_chat_messages');
      const messagesQuery = query(
        messagesRef,
        where('groupId', '==', groupId),
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
          createdAt: toDate(data.createdAt)
        } as GroupChatMessage);
      });

      const sortedMessages = messages.reverse();
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

  static subscribeToGroupMessages(
    groupId: string,
    callback: (messages: GroupChatMessage[]) => void
  ): Unsubscribe {
    const messagesRef = collection(db, 'group_chat_messages');
    const messagesQuery = query(
      messagesRef,
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      const messages: GroupChatMessage[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          createdAt: toDate(data.createdAt)
        } as GroupChatMessage);
      });
      const sortedMessages = messages.reverse();
      callback(sortedMessages);
    });
  }

  static async createGroup(groupData: {
    name: string;
    description: string;
    category: ProfessionalGroup['category'];
    createdBy: string;
    isPublic?: boolean;
    tags?: string[];
    rules?: string;
  }): Promise<{ success: boolean; groupId?: string; error?: string }> {
    try {
      const groupsRef = collection(db, 'professional_groups');
      const newGroup = {
        name: groupData.name.trim(),
        description: groupData.description.trim(),
        category: groupData.category,
        memberCount: 1,
        members: [groupData.createdBy],
        createdBy: groupData.createdBy,
        createdAt: Timestamp.now(),
        isPublic: groupData.isPublic ?? true,
        tags: groupData.tags || [],
        rules: groupData.rules || '',
        lastActivity: Timestamp.now()
      };

      const docRef = await addDoc(groupsRef, newGroup);
      return { success: true, groupId: docRef.id };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getAllGroups(): Promise<{ success: boolean; data: ProfessionalGroup[]; error?: string }> {
    try {
      const groupsRef = collection(db, 'professional_groups');
      const groupsQuery = query(groupsRef, orderBy('lastActivity', 'desc'));
      const snapshot = await getDocs(groupsQuery);
      
      const groups: ProfessionalGroup[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        groups.push({
          id: doc.id,
          ...data,
          createdAt: toDate(data.createdAt),
          lastActivity: toDate(data.lastActivity)
        } as ProfessionalGroup);
      });

      return { success: true, data: groups };

    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  }

  static async joinGroup(groupId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const groupRef = doc(db, 'professional_groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        throw new Error('الجروب غير موجود');
      }

      const groupData = groupDoc.data();
      if (groupData.members.includes(userId)) {
        return { success: true };
      }

      await updateDoc(groupRef, {
        members: arrayUnion(userId),
        memberCount: (groupData.memberCount || 0) + 1,
        lastActivity: Timestamp.now()
      });

      return { success: true };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

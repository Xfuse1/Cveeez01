
'use client';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, limit, arrayUnion, arrayRemove,
  Timestamp, getDoc, onSnapshot, type Unsubscribe, writeBatch
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getAuth } from 'firebase/auth';


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

export interface GroupMessage {
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
  private static groupsCache: Map<string, ProfessionalGroup> = new Map();
  private static messagesCache: Map<string, GroupMessage[]> = new Map();

  // ✅ إنشاء جروب مهني جديد
  static async createGroup(groupData: {
    name: string;
    description: string;
    category: ProfessionalGroup['category'];
    createdBy: string;
    isPublic?: boolean;
    tags?: string[];
    rules?: string;
    avatar?: string;
  }): Promise<{ success: boolean; groupId?: string; error?: string }> {
    try {
      // التحقق من المصادقة
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

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
        avatar: groupData.avatar || '',
        lastActivity: Timestamp.now()
      };

      const docRef = await addDoc(groupsRef, newGroup);
      
      console.log(`✅ تم إنشاء الجروب: ${groupData.name}`);
      
      // تحديث الكاش
      this.groupsCache.set(docRef.id, {
        id: docRef.id,
        ...newGroup,
        createdAt: new Date(),
        lastActivity: new Date()
      });

      return {
        success: true,
        groupId: docRef.id
      };

    } catch (error: any) {
      console.error('❌ فشل في إنشاء الجروب:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ جلب جميع الجروبات
  static async getAllGroups(): Promise<{ success: boolean; data: ProfessionalGroup[]; error?: string }> {
    try {
      const groupsRef = collection(db, 'professional_groups');
      const groupsQuery = query(
        groupsRef, 
        where('isPublic', '==', true)
      );
      
      const snapshot = await getDocs(groupsQuery);
      
      const groups: ProfessionalGroup[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Safety checks for timestamps
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        const lastActivity = data.lastActivity instanceof Timestamp ? data.lastActivity.toDate() : new Date();

        const group = {
          id: doc.id,
          ...data,
          createdAt,
          lastActivity,
        } as ProfessionalGroup;
        
        groups.push(group);
        this.groupsCache.set(doc.id, group);
      });
      
      // Sort in-memory
      groups.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

      return {
        success: true,
        data: groups
      };

    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // ✅ جلب جروبات المستخدم
  static async getUserGroups(userId: string): Promise<ProfessionalGroup[]> {
    try {
      const groupsRef = collection(db, 'professional_groups');
      const userGroupsQuery = query(
        groupsRef,
        where('members', 'array-contains', userId),
        orderBy('lastActivity', 'desc')
      );
      
      const snapshot = await getDocs(userGroupsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        // Safety checks for timestamps
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        const lastActivity = data.lastActivity instanceof Timestamp ? data.lastActivity.toDate() : new Date();
        return {
          id: doc.id,
          ...data,
          createdAt,
          lastActivity,
        } as ProfessionalGroup;
      });

    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  }

  // ✅ الانضمام للجروب
  static async joinGroup(groupId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const groupRef = doc(db, 'professional_groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        throw new Error('الجروب غير موجود');
      }

      const groupData = groupDoc.data();
      
      // التحقق إذا المستخدم موجود بالفعل
      if (groupData.members.includes(userId)) {
        return { success: true }; // موجود مسبقاً
      }

      await updateDoc(groupRef, {
        members: arrayUnion(userId),
        memberCount: (groupData.memberCount || 0) + 1,
        lastActivity: Timestamp.now()
      });

      console.log(`✅ انضم المستخدم ${userId} للجروب ${groupId}`);
      
      return { success: true };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ مغادرة الجروب
  static async leaveGroup(groupId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const groupRef = doc(db, 'professional_groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        throw new Error('الجروب غير موجود');
      }

      const groupData = groupDoc.data();
      
      // لا يمكن للمنشئ مغادرة الجروب
      if (groupData.createdBy === userId) {
        throw new Error('لا يمكن لمنشئ الجروب مغادرته');
      }

      await updateDoc(groupRef, {
        members: arrayRemove(userId),
        memberCount: Math.max(0, (groupData.memberCount || 1) - 1),
        lastActivity: Timestamp.now()
      });

      console.log(`✅ غادر المستخدم ${userId} الجروب ${groupId}`);
      
      return { success: true };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ إرسال رسالة في الجروب
  static async sendGroupMessage(messageData: {
    groupId: string;
    content: string;
    sender: { id: string; name: string; avatar: string };
    type?: 'text' | 'image' | 'file';
    replyTo?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const messagesRef = collection(db, 'group_messages');
      
      const newMessage = {
        groupId: messageData.groupId,
        content: messageData.content.trim(),
        sender: messageData.sender,
        type: messageData.type || 'text',
        replyTo: messageData.replyTo || null,
        reactions: {},
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(messagesRef, newMessage);

      // تحديث lastActivity للجروب
      const groupRef = doc(db, 'professional_groups', messageData.groupId);
      await updateDoc(groupRef, {
        lastActivity: Timestamp.now()
      });

      console.log(`✅ تم إرسال رسالة في الجروب: ${messageData.groupId}`);
      
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

  // ✅ جلب رسائل الجروب
  static async getGroupMessages(groupId: string, limitCount: number = 50): Promise<{ 
    success: boolean; 
    data: GroupMessage[]; 
    error?: string 
  }> {
    try {
      const messagesRef = collection(db, 'group_messages');
      const messagesQuery = query(
        messagesRef,
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(messagesQuery);
      
      const messages: GroupMessage[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        messages.push({
          id: doc.id,
          ...data,
          createdAt,
        } as GroupMessage);
      });

      // عكس الترتيب ليصبح من الأقدم للأحدث
      const sortedMessages = messages.reverse();
      this.messagesCache.set(groupId, sortedMessages);

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

  // ✅ الاشتراك في تحديثات رسائل الجروب (Real-time)
  static subscribeToGroupMessages(
    groupId: string,
    callback: (messages: GroupMessage[]) => void
  ): Unsubscribe {
    const messagesRef = collection(db, 'group_messages');
    const messagesQuery = query(
      messagesRef,
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      const messages: GroupMessage[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        messages.push({
          id: doc.id,
          ...data,
          createdAt,
        } as GroupMessage);
      });

      const sortedMessages = messages.reverse();
      this.messagesCache.set(groupId, sortedMessages);
      callback(sortedMessages);
    });
  }

  // ✅ إضافة تفاعل على الرسالة
  static async addReaction(messageId: string, reaction: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const messageRef = doc(db, 'group_messages', messageId);
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

  // ✅ دالة مساعدة للحصول على المستخدم الحالي
  private static async getCurrentUser() {
    return new Promise<{uid: string, displayName: string | null} | null>(resolve => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user ? { uid: user.uid, displayName: user.displayName } : null);
        });
    });
  }
}

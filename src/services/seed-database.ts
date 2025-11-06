
'use client';

import { db } from '@/firebase/config';
import {
  collection,
  writeBatch,
  Timestamp,
  doc,
} from 'firebase/firestore';

export async function seedTalentSpaceData() {
  const batch = writeBatch(db);
  const results = {
    groups: [] as string[],
    groupMessages: 0,
    globalMessages: 0,
  };

  try {
    console.log('🌱 Starting database seeding...');

    // --- Step 1: Create Professional Groups ---
    const groupsRef = collection(db, 'professional_groups');

    const group1Data = {
      name: 'جروب المطورين والمبرمجين',
      description: 'مجتمع عربي للمطورين والمبرمجين لتبادل الخبرات والأفكار في مجال البرمجة والتطوير',
      category: 'tech',
      memberCount: 3,
      members: ['user1', 'user2', 'user3'],
      createdBy: 'user1',
      createdAt: Timestamp.now(),
      isPublic: true,
      tags: ['برمجة', 'تطوير', 'سوفتوير', 'ويب', 'موبايل', 'جافاسكريبت'],
      rules: 'الالتزام بآداب الحوار، منع الإعلانات، احترام آراء الآخرين، مشاركة المعرفة بشكل بناء',
      avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&h=150&fit=crop',
      lastActivity: Timestamp.now(),
    };
    const group1Ref = doc(groupsRef);
    batch.set(group1Ref, group1Data);
    results.groups.push(group1Ref.id);

    const group2Data = {
      name: 'مجتمع المصممين العرب',
      description: 'منصة للتصميم الجرافيكي وتجربة المستخدم UI/UX، نتبادل الأعمال والخبرات',
      category: 'design',
      memberCount: 2,
      members: ['user4', 'user5'],
      createdBy: 'user4',
      createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
      isPublic: true,
      tags: ['تصميم', 'جرافيك', 'UI', 'UX', 'فوتوشوب', 'figma'],
      rules: 'مشاركة الأعمال الإبداعية، تقديم ملاحظات بناءة، احترام حقوق الملكية',
      avatar: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=150&h=150&fit=crop',
      lastActivity: Timestamp.now(),
    };
    const group2Ref = doc(groupsRef);
    batch.set(group2Ref, group2Data);
    results.groups.push(group2Ref.id);
    
    // Add other groups here...

    console.log(`Created ${results.groups.length} groups.`);

    // --- Step 2: Create Group Messages ---
    const groupMessagesRef = collection(db, 'group_messages');
    
    // Messages for Group 1 (Tech)
    const msg1Ref = doc(groupMessagesRef);
    batch.set(msg1Ref, {
      groupId: group1Ref.id,
      content: 'مرحباً بالجميع في جروب المبرمجين! 🚀',
      sender: { id: 'user1', name: 'أحمد محمد', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
      type: 'text',
      replyTo: null,
      reactions: { '👋': ['user2', 'user3'], '🎉': ['user2'] },
      createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 60 * 60 * 1000)),
    });
    results.groupMessages++;

    // Add other group messages here...
    
    console.log(`Created ${results.groupMessages} group messages.`);


    // --- Step 3: Create Global Chat Messages ---
    const globalChatRef = collection(db, 'group_chat');
    
    const globalMsg1Data = {
      content: "مرحباً بالجميع في الشات الجماعي! 🎉",
      sender: { id: "system", name: "النظام", avatar: "" },
      type: "text",
      replyTo: null,
      reactions: { "👋": ["user1", "user2", "user3"], "🎉": ["user4", "user5"] },
      createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 60 * 1000)),
    };
    batch.set(doc(globalChatRef), globalMsg1Data);
    results.globalMessages++;

    // Add other global messages here...
    
    console.log(`Created ${results.globalMessages} global chat messages.`);

    // Commit all changes to Firestore
    await batch.commit();
    console.log('✅ Database seeding completed successfully!');
    return { success: true, results };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return { success: false, error: (error as Error).message };
  }
}

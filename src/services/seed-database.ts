
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
      createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // قبل يومين
      isPublic: true,
      tags: ['تصميم', 'جرافيك', 'UI', 'UX', 'فوتوشوب', 'figma'],
      rules: 'مشاركة الأعمال الإبداعية، تقديم ملاحظات بناءة، احترام حقوق الملكية',
      avatar: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=150&h=150&fit=crop',
      lastActivity: Timestamp.now(),
    };
    const group2Ref = doc(groupsRef);
    batch.set(group2Ref, group2Data);
    results.groups.push(group2Ref.id);
    
    const group3Data = {
        name: "خبراء التسويق الرقمي",
        description: "مجتمع متخصص في التسويق الرقمي، تحليل البيانات، استراتيجيات النمو",
        category: "marketing",
        memberCount: 4,
        members: ["user6", "user7", "user8", "user9"],
        createdBy: "user6",
        createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), // قبل 5 أيام
        isPublic: true,
        tags: ["تسويق", "رقمي", "سوشيال ميديا", "SEO", "تحليل بيانات"],
        rules: "مشاركة case studies، مناقشة استراتيجيات التسويق، احترام الخبرات",
        avatar: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=150&fit=crop",
        lastActivity: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)) // قبل ساعتين
    };
    const group3Ref = doc(groupsRef);
    batch.set(group3Ref, group3Data);
    results.groups.push(group3Ref.id);

    const group4Data = {
        name: "قادة الأعمال والإدارة",
        description: "مجتمع لقادة الأعمال ومديري المشاريع لتبادل خبرات الإدارة والقيادة",
        category: "management",
        memberCount: 3,
        members: ["user10", "user11", "user12"],
        createdBy: "user10",
        createdAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // قبل أسبوع
        isPublic: false,
        tags: ["إدارة", "قيادة", "مشاريع", "تخطيط", "استراتيجية"],
        rules: "سرية المناقشات، احترافية الحوار، مشاركة تجارب حقيقية",
        avatar: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=150&h=150&fit=crop",
        lastActivity: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)) // قبل يوم
    };
    const group4Ref = doc(groupsRef);
    batch.set(group4Ref, group4Data);
    results.groups.push(group4Ref.id);


    console.log(`Created ${results.groups.length} groups.`);

    // --- Step 2: Create Group Messages ---
    const groupMessagesRef = collection(db, 'group_messages');
    
    // Messages for Group 1 (Tech)
    const msg1Ref = doc(groupMessagesRef);
    const msg1Data = {
      groupId: group1Ref.id,
      content: 'مرحباً بالجميع في جروب المبرمجين! 🚀',
      sender: { id: 'user1', name: 'أحمد محمد', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
      type: 'text',
      replyTo: null,
      reactions: { '👋': ['user2', 'user3'], '🎉': ['user2'] },
      createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 60 * 60 * 1000)),
    };
    batch.set(msg1Ref, msg1Data);
    results.groupMessages++;

    const msg2Ref = doc(groupMessagesRef);
    batch.set(msg2Ref, {
      groupId: group1Ref.id,
      content: "أهلاً وسهلاً! شكراً على إنشاء هذا الجروب، كنت أبحث عن مجتمع برمجي عربي 👨‍💻",
      sender: { id: "user2", name: "سارة عبدالله", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" },
      type: "text",
      replyTo: null,
      reactions: { "👍": ["user1"] },
      createdAt: Timestamp.fromDate(new Date(Date.now() - 2.5 * 60 * 60 * 1000)),
    });
    results.groupMessages++;

    const msg3Ref = doc(groupMessagesRef);
    batch.set(msg3Ref, {
      groupId: group1Ref.id,
      content: "هل لدى أحدكم خبرة في React Native؟ أحتاج مساعدة في مشروعي",
      sender: { id: "user3", name: "خالد أحمد", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
      type: "text",
      replyTo: null,
      reactions: {},
      createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
    });
    results.groupMessages++;
    
    batch.set(doc(groupMessagesRef), {
      groupId: group1Ref.id,
      content: "أنا أعمل بـ React Native من سنتين، تقدر تسألني أي سؤال @خالد أحمد",
      sender: { id: "user1", name: "أحمد محمد", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
      type: "text",
      replyTo: msg3Ref.id,
      reactions: { "🙏": ["user3"] },
      createdAt: Timestamp.fromDate(new Date(Date.now() - 1.5 * 60 * 60 * 1000)),
    });
    results.groupMessages++;

    // Messages for Group 2 (Design)
    batch.set(doc(groupMessagesRef), {
      groupId: group2Ref.id,
      content: "مرحباً في مجتمع المصممين! 🎨 شاركونا أعمالكم الإبداعية",
      sender: { id: "user4", name: "فاطمة علي", avatar: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=100&h=100&fit=crop&crop=face" },
      type: "text",
      replyTo: null,
      reactions: { "🎨": ["user5"], "👏": ["user5"] },
      createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000)),
    });
    results.groupMessages++;
    
    batch.set(doc(groupMessagesRef), {
      groupId: group2Ref.id,
      content: "عملت تصميم جديد لتطبيق طبي، بدي آرائكم 👇",
      sender: { id: "user5", name: "ياسمين كمال", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face" },
      type: "text",
      replyTo: null,
      reactions: { "👀": ["user4"] },
      createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 60 * 60 * 1000)),
    });
    results.groupMessages++;
    
    console.log(`Created ${results.groupMessages} group messages.`);


    // --- Step 3: Create Global Chat Messages ---
    const globalChatRef = collection(db, 'group_chat');
    
    const globalMessages = [
        {
            content: "مرحباً بالجميع في الشات الجماعي! 🎉",
            sender: { id: "system", name: "النظام", avatar: "" },
            type: "text",
            replyTo: null,
            reactions: { "👋": ["user1", "user2", "user3"], "🎉": ["user4", "user5"] },
            createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 60 * 1000)),
        },
        {
            content: "أهلاً وسهلاً! شكراً لإطلاق هذه المنصة الرائعة 👏",
            sender: { id: "user1", name: "أحمد محمد", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
            type: "text",
            replyTo: null,
            reactions: { "👍": ["user2", "user3"] },
            createdAt: Timestamp.fromDate(new Date(Date.now() - 9 * 60 * 60 * 1000)),
        },
        {
            content: "من هنا ممكن نتعرف على بعض ونتناقش في مواضيع عامة؟",
            sender: { id: "user2", name: "سارة عبدالله", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" },
            type: "text",
            replyTo: null,
            reactions: {},
            createdAt: Timestamp.fromDate(new Date(Date.now() - 8 * 60 * 60 * 1000)),
        },
        {
            content: "أكيد! أنا مهتم بالتقنية والبرمجة، وعندي خبرة في تطوير الويب",
            sender: { id: "user3", name: "خالد أحمد", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
            type: "text",
            replyTo: null,
            reactions: { "💻": ["user1"] },
            createdAt: Timestamp.fromDate(new Date(Date.now() - 7 * 60 * 60 * 1000)),
        },
        {
            content: "أنا مصممة UI/UX، إذا أحد محتاج مساعدة في التصميم أنا موجودة 🎨",
            sender: { id: "user4", name: "فاطمة علي", avatar: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=100&h=100&fit=crop&crop=face" },
            type: "text",
            replyTo: null,
            reactions: { "🎨": ["user5", "user2"], "🙏": ["user3"] },
            createdAt: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)),
        }
    ];

    globalMessages.forEach(msg => {
        batch.set(doc(globalChatRef), msg);
        results.globalMessages++;
    });
    
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

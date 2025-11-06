# دليل إعداد Firestore - Talent Space

## 🎯 نظرة عامة

هذا الدليل يشرح كيفية إعداد قاعدة بيانات Firestore للتطبيق بشكل كامل.

---

## 📊 الخطوة 1: إنشاء الكوليكشنات (Collections)

### 1. كوليكشن `posts` - المنشورات

انسخ والصق هذا المثال في Firebase Console:

```json
{
  "content": "مرحباً بكم في Talent Space! منصة التواصل المهني الجديدة.",
  "author": {
    "id": "user123",
    "name": "أحمد محمد",
    "avatar": "https://via.placeholder.com/150"
  },
  "media": [],
  "tags": ["welcome", "networking"],
  "likes": [],
  "comments": [],
  "shares": 0,
  "isEdited": false
}
```

**ملاحظة:** سيتم إضافة `createdAt` و `updatedAt` تلقائياً من الكود.

---

### 2. كوليكشن `jobs` - الوظائف

```json
{
  "title": "مطور واجهات أمامية - React",
  "company": "شركة التقنية المتقدمة",
  "location": "القاهرة، مصر",
  "type": "دوام كامل",
  "category": "تكنولوجيا",
  "description": "نبحث عن مطور واجهات أمامية محترف للانضمام لفريقنا المتنامي.",
  "requirements": [
    "خبرة 3+ سنوات في React",
    "إتقان TypeScript",
    "معرفة بـ Next.js"
  ],
  "salary": "تنافسي",
  "tags": ["React", "TypeScript", "Next.js"],
  "applications": 12,
  "isActive": true
}
```

**ملاحظة:** أضف `createdAt` يدوياً من نوع Timestamp في Firebase Console.

**كرر هذه الخطوة** لإضافة 3-4 وظائف مختلفة.

---

### 3. كوليكشن `professional_groups` - الجروبات المهنية

```json
{
  "name": "محترفو التقنية في مصر",
  "description": "مجتمع للمحترفين في مجال التكنولوجيا",
  "category": "tech",
  "memberCount": 1,
  "members": ["user123"],
  "createdBy": "user123",
  "isPublic": true,
  "tags": ["تكنولوجيا", "برمجة", "مصر"],
  "rules": "الاحترام المتبادل والنقاش البناء"
}
```

**أضف يدوياً:**
- `createdAt` (Timestamp)
- `lastActivity` (Timestamp)

**كرر هذه الخطوة** لإضافة 3-4 جروبات بفئات مختلفة:
- `tech` - تكنولوجيا
- `design` - تصميم
- `marketing` - تسويق
- `management` - إدارة
- `finance` - مالية
- `healthcare` - صحة
- `education` - تعليم
- `other` - أخرى

---

### 4. كوليكشن `group_chat_messages` - رسائل الجروبات

**لا تحتاج لإضافة بيانات يدوياً** - سيتم إنشاء الرسائل تلقائياً عندما يرسل المستخدمون رسائل.

**هيكل البيانات للرجوع:**
```json
{
  "groupId": "group-id-here",
  "content": "مرحباً بالجميع!",
  "sender": {
    "id": "user123",
    "name": "أحمد محمد",
    "avatar": "https://via.placeholder.com/150"
  },
  "type": "text",
  "replyTo": null,
  "reactions": {}
}
```

---

### 5. كوليكشن `group_chat` - الشات العام

**لا تحتاج لإضافة بيانات يدوياً** - سيتم إنشاء الرسائل تلقائياً.

---

## 🔐 الخطوة 2: قواعد الأمان (Security Rules)

1. اذهب إلى **Firestore Database** → **Rules**
2. احذف القواعد الموجودة
3. انسخ والصق هذه القواعد:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // قواعد المنشورات
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.author.id;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.author.id;
    }
    
    // قواعد رسائل الجروبات
    match /group_chat_messages/{messageId} {
      allow read: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/professional_groups/$(resource.data.groupId)).data.members;
      allow create: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/professional_groups/$(request.resource.data.groupId)).data.members;
    }
    
    // قواعد الشات العام
    match /group_chat/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // قواعد الجروبات المهنية
    match /professional_groups/{groupId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.createdBy || 
         request.auth.uid in resource.data.members);
    }
    
    // قواعد الوظائف (قراءة فقط للمستخدمين)
    match /jobs/{jobId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

4. اضغط **Publish** لنشر القواعد

---

## 📇 الخطوة 3: إنشاء الفهارس (Indexes)

### الطريقة الأولى: الإنشاء التلقائي (موصى به)

1. شغّل التطبيق
2. انتقل إلى صفحة Talent Space
3. جرب إرسال رسائل والتفاعل مع المنشورات
4. Firebase سيعرض رسائل خطأ مع روابط لإنشاء الفهارس المطلوبة
5. اضغط على الروابط لإنشاء الفهارس تلقائياً

### الطريقة الثانية: الإنشاء اليدوي

اذهب إلى **Firestore Database** → **Indexes** → **Composite** → **Create Index**

#### فهرس 1: `group_chat_messages`
- **Collection ID**: `group_chat_messages`
- **Fields**:
  - `groupId` → Ascending
  - `createdAt` → Descending
- **Query scope**: Collection

#### فهرس 2: `posts`
- **Collection ID**: `posts`
- **Fields**:
  - `createdAt` → Descending
- **Query scope**: Collection

#### فهرس 3: `professional_groups`
- **Collection ID**: `professional_groups`
- **Fields**:
  - `lastActivity` → Descending
- **Query scope**: Collection

#### فهرس 4: `jobs`
- **Collection ID**: `jobs`
- **Fields**:
  - `isActive` → Ascending
  - `createdAt` → Descending
- **Query scope**: Collection

**ملاحظة:** بناء الفهارس قد يستغرق بضع دقائق.

---

## ✅ الخطوة 4: التحقق من الإعداد

### قائمة التحقق:

- [ ] تم إنشاء كوليكشن `posts` مع بيانات تجريبية
- [ ] تم إنشاء كوليكشن `jobs` مع 3-4 وظائف على الأقل
- [ ] تم إنشاء كوليكشن `professional_groups` مع 3-4 جروبات
- [ ] تم إنشاء كوليكشن `group_chat_messages` (فارغ - OK)
- [ ] تم إنشاء كوليكشن `group_chat` (فارغ - OK)
- [ ] تم نشر قواعد الأمان
- [ ] تم إنشاء جميع الفهارس المطلوبة (4 فهارس)

---

## 🧪 اختبار سريع

1. **افتح التطبيق** وسجل دخول
2. **انتقل إلى Talent Space**
3. **تحقق من:**
   - ظهور المنشورات ✓
   - ظهور الوظائف المقترحة ✓
   - ظهور قائمة الجروبات ✓
   - إمكانية إرسال رسالة في الشات العام ✓
   - إمكانية الانضمام لجروب وإرسال رسالة ✓

---

## 🔍 استكشاف الأخطاء

### خطأ: "Missing or insufficient permissions"
**الحل:** تأكد من نشر قواعد الأمان الجديدة

### خطأ: "The query requires an index"
**الحل:** اضغط على الرابط في رسالة الخطأ لإنشاء الفهرس

### خطأ: "Document not found"
**الحل:** تأكد من إضافة البيانات التجريبية للكوليكشنات

### لا تظهر الوظائف
**الحل:** تأكد من:
- وجود وظائف في كوليكشن `jobs`
- الحقل `isActive` = `true`
- وجود حقل `createdAt` من نوع Timestamp

---

## 📊 ملخص الكوليكشنات

| الكوليكشن | الاستخدام | بيانات تجريبية مطلوبة؟ |
|-----------|-----------|----------------------|
| `posts` | المنشورات | نعم (منشور واحد على الأقل) |
| `jobs` | الوظائف المقترحة | نعم (3-4 وظائف) |
| `professional_groups` | الجروبات المهنية | نعم (3-4 جروبات) |
| `group_chat_messages` | رسائل الجروبات | لا (يتم إنشاؤها تلقائياً) |
| `group_chat` | الشات العام | لا (يتم إنشاؤها تلقائياً) |

---

## 🎉 تم الإعداد!

بعد إتمام جميع الخطوات، التطبيق جاهز للاستخدام الكامل.

للمزيد من التفاصيل التقنية، راجع:
- `docs/talent-space-implementation-summary.md`

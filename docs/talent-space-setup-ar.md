# مساحة المواهب (Talent Space) - دليل الإعداد والاستخدام

## نظرة عامة

مساحة المواهب هي ميزة للتواصل المهني تتيح للمستخدمين:
- إنشاء ومشاركة المنشورات مع نصوص وصور وفيديوهات وروابط
- الإعجاب بالمنشورات والتعليق عليها
- الانضمام إلى المجموعات والمشاركة في النقاشات
- إرسال الرسائل في الدردشة العامة ودردشات المجموعات
- عرض الوظائف الموصى بها

## البنية المعمارية

يستخدم النظام **آلية احتياطية (Fallback)** لضمان توفر المحتوى دائماً:

1. **مصدر البيانات الأساسي**: Firebase Firestore
2. **مصدر البيانات الاحتياطي**: البيانات الوهمية من `src/data/talent-space.ts`

### كيف تعمل الآلية الاحتياطية

عندما يحاول التطبيق جلب البيانات من Firestore:
- إذا أرجعت Firestore بيانات ← استخدام بيانات Firestore
- إذا كانت Firestore فارغة ← استخدام البيانات الوهمية
- إذا فشل الاتصال بـ Firestore ← استخدام البيانات الوهمية

هذا يضمن أن المستخدمين يرون المحتوى دائماً، حتى لو:
- لم يتم تكوين Firebase
- لا يوجد اتصال بالإنترنت
- قاعدة البيانات فارغة (الإعداد الأول)

## إعداد Firebase

### متغيرات البيئة المطلوبة

أنشئ ملف `.env.local` في المجلد الجذر مع:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### بنية مجموعات Firestore

يستخدم التطبيق مجموعات Firestore التالية:

#### 1. مجموعة `posts` (المنشورات)
```typescript
{
  id: string (يتم إنشاؤه تلقائياً)
  userId: string
  content: string
  imageUrl?: string
  videoUrl?: string
  linkUrl?: string
  likes: number
  likedBy: string[] // مصفوفة معرفات المستخدمين
  comments: number
  createdAt: string (بصيغة ISO)
}
```

#### 2. مجموعة `comments` (التعليقات)
```typescript
{
  id: string (يتم إنشاؤه تلقائياً)
  postId: string
  userId: string
  content: string
  createdAt: string (بصيغة ISO)
}
```

#### 3. مجموعة `messages` (الرسائل)
```typescript
{
  id: string (يتم إنشاؤه تلقائياً)
  userId: string
  groupId?: string // اختياري، لدردشات المجموعات
  content: string
  createdAt: string (بصيغة ISO)
}
```

#### 4. مجموعة `users` (المستخدمين - اختياري)
```typescript
{
  id: string (يطابق معرف المصادقة)
  name: string
  headline: string
  avatarUrl: string
}
```

### قواعد أمان Firestore

أضف هذه القواعد إلى Firestore الخاص بك:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // المنشورات
    match /posts/{postId} {
      allow read: if true; // يمكن لأي شخص قراءة المنشورات
      allow create: if request.auth != null; // المستخدمون المصادق عليهم فقط يمكنهم الإنشاء
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // التعليقات
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // الرسائل
    match /messages/{messageId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // المستخدمون
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### قواعد Firebase Storage

لرفع الصور والفيديوهات:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /posts/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## الميزات

### 1. إنشاء المنشورات

يمكن للمستخدمين إنشاء منشورات تحتوي على:
- محتوى نصي
- صور (يتم رفعها إلى Firebase Storage)
- فيديوهات (يتم رفعها إلى Firebase Storage)
- روابط (مع معاينة)

**التنفيذ**: `src/components/talent-space/CreatePost.tsx`

### 2. الإعجاب بالمنشورات

يمكن للمستخدمين الإعجاب/إلغاء الإعجاب بالمنشورات. يستخدم النظام تحديثات متفائلة (Optimistic Updates) لتجربة مستخدم أفضل:
- تحديث الواجهة فوراً
- إذا فشلت العملية، تعود الواجهة للحالة السابقة
- يتم تخزين عدد الإعجابات في Firestore

**التنفيذ**: `src/components/talent-space/PostCard.tsx`

### 3. التعليق على المنشورات

يمكن للمستخدمين إضافة تعليقات على المنشورات. التعليقات:
- تُخزن في مجموعة `comments` منفصلة
- مرتبطة بالمنشورات عبر `postId`
- تُعرض بترتيب زمني

**التنفيذ**: `src/components/talent-space/PostCard.tsx`

### 4. نظام الدردشة

نوعان من الدردشة:
- **الدردشة العامة**: متاحة لجميع المستخدمين
- **دردشة المجموعة**: خاصة بكل مجموعة

**التنفيذ**: `src/components/talent-space/ChatInterface.tsx`

### 5. البحث

يمكن للمستخدمين البحث عن:
- محتوى المنشورات
- أسماء المؤلفين
- عناوين المؤلفين

**التنفيذ**: `src/components/talent-space/SearchBar.tsx`

## البيانات الوهمية

توجد البيانات الوهمية في `src/data/talent-space.ts` وتشمل:

- **3 مستخدمين**: ملفات تعريف نموذجية مع صور
- **3 منشورات**: منشورات مثالية مع إعجابات وتعليقات
- **3 مجموعات**: مجموعات مهنية
- **4 وظائف**: قوائم وظائف
- **5 رسائل**: رسائل دردشة نموذجية (عامة ومجموعات)

يتم استخدام هذه البيانات تلقائياً عندما تكون Firestore فارغة أو غير متاحة.

## استكشاف الأخطاء وإصلاحها

### المنشورات لا تظهر

**العرض**: لا تظهر أي منشورات على الصفحة

**الحلول**:
1. تحقق من وحدة تحكم المتصفح بحثاً عن أخطاء
2. تحقق من تكوين Firebase في `.env.local`
3. تحقق من قواعد أمان Firestore
4. تأكد من استخدام البيانات الوهمية (تحقق من سجلات وحدة التحكم)

### لا يمكن إنشاء منشورات

**العرض**: فشل إنشاء المنشورات مع رسالة خطأ

**الحلول**:
1. تحقق من مصادقة المستخدم
2. تحقق من أن قواعد أمان Firestore تسمح بالإنشاء
3. تحقق من قواعد Firebase Storage لرفع الوسائط
4. تحقق من اتصال الإنترنت

### الصور لا يتم رفعها

**العرض**: فشل رفع الصورة

**الحلول**:
1. تحقق من تكوين Firebase Storage
2. تحقق من أن قواعد التخزين تسمح بالرفع
3. تحقق من حجم الملف (Firebase لديه حدود)
4. تأكد من تعيين `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` بشكل صحيح

### رسائل الدردشة لا تُرسل

**العرض**: الرسائل لا تظهر بعد الإرسال

**الحلول**:
1. تحقق من قواعد Firestore لمجموعة الرسائل
2. تحقق من مصادقة المستخدم
3. تحقق من وحدة التحكم بحثاً عن رسائل خطأ

## نصائح التطوير

### الاختبار مع البيانات الوهمية

لاختبار نظام الاحتياطي:
1. عطّل اتصال الإنترنت
2. امسح مجموعات Firestore
3. يجب أن يستخدم التطبيق البيانات الوهمية تلقائياً

### إضافة بيانات وهمية جديدة

عدّل `src/data/talent-space.ts`:

```typescript
export const posts: Post[] = [
  // أضف منشوراتك الوهمية هنا
  {
    id: 'p4',
    userId: 'u1',
    content: 'منشور تجريبي جديد',
    likes: 0,
    comments: 0,
    createdAt: new Date().toISOString(),
  }
];
```

### سجلات وحدة التحكم

يسجل التطبيق الأحداث المهمة:
- `Fetched X posts from Firestore` - جلب ناجح
- `No posts in Firestore, using mock data` - تم تفعيل الاحتياطي
- `Error fetching posts, using mock data:` - حدث خطأ
- `Creating post with user:` - بدأ إنشاء المنشور
- `Post created successfully with ID:` - تم إنشاء المنشور

## اعتبارات الأداء

1. **التحديثات المتفائلة**: تحديث الإعجابات فوراً في الواجهة لتجربة أفضل
2. **التحميل الكسول**: المكونات تجلب البيانات فقط عند الحاجة
3. **التخزين المؤقت**: يتم تخزين المنشورات في الحالة حتى التحديث
4. **البيانات الوهمية**: تحميل فوري عندما تكون Firestore غير متاحة

## ملاحظات الأمان

1. **المصادقة مطلوبة**: يجب على المستخدمين تسجيل الدخول من أجل:
   - إنشاء منشورات
   - الإعجاب بالمنشورات
   - التعليق على المنشورات
   - إرسال الرسائل

2. **التفويض**: يمكن للمستخدمين فقط:
   - تعديل/حذف منشوراتهم الخاصة
   - تعديل/حذف تعليقاتهم الخاصة
   - تعديل/حذف رسائلهم الخاصة

3. **رفع الملفات**: 
   - المستخدمون المصادق عليهم فقط يمكنهم الرفع
   - تُخزن الملفات في مسارات خاصة بالمستخدم
   - ضع في اعتبارك إضافة التحقق من حجم ونوع الملف

## التحسينات المستقبلية

التحسينات المحتملة:
1. التحديثات الفورية باستخدام مستمعات Firestore
2. ترقيم الصفحات للمنشورات والتعليقات
3. ملفات تعريف المستخدمين ونظام المتابعة
4. إشعارات للإعجابات والتعليقات
5. بحث متقدم مع مرشحات
6. تعديل وحذف المنشورات
7. محرر نصوص غني للمنشورات
8. ضغط الصور قبل الرفع
9. صور مصغرة للفيديوهات
10. مراسلة مباشرة بين المستخدمين

## الدعم

للمشاكل أو الأسئلة:
1. تحقق من سجلات وحدة التحكم بحثاً عن رسائل خطأ
2. راجع قواعد أمان Firestore
3. تحقق من تكوين Firebase
4. راجع هذا التوثيق

---

آخر تحديث: 2024

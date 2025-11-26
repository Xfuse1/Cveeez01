# 📚 دليل استخدام AI CV Builder

## نظرة عامة

**AI CV Builder** هو نظام ذكي لإنشاء السير الذاتية المحسّنة للـ ATS (Applicant Tracking System) باستخدام الذكاء الاصطناعي.

**الميزات الرئيسية**:
- ✅ تحسين سيرة ذاتية تلقائي للـ ATS
- ✅ تخصيص CV حسب الوظيفة والصناعة
- ✅ البحث عن وإضافة مقاييس كمية
- ✅ دعم متعدد اللغات (EN/AR)
- ✅ إدارة السير الذاتية المحفوظة
- ✅ تحميل PDF

---

## 🚀 البدء السريع

### 1. الوصول إلى الصفحة

```
URL: http://localhost:9004/professional-service/cv-generator
أو من القائمة الرئيسية: Services → AI CV Generator
```

### 2. ملء النموذج

#### الحقول المطلوبة:

**Target Job Title**
```
أمثلة:
- Senior React Developer
- Product Manager
- Data Scientist
- UX Researcher
```

**Target Industry**
```
أمثلة:
- Fintech
- E-commerce
- Healthcare
- Tech Startups
- SaaS
```

**Your current resume / notes**
```
أدخل:
- خبرتك المهنية (الشركات والوظائف)
- المهارات التقنية
- التعليم والشهادات
- المشاريع البارزة
- الإنجازات والأرقام (إن وجدت)

مثال:
"I worked at TechCorp for 3 years as a Senior React Developer.
Built several high-performance e-commerce platforms using Next.js and TypeScript.
Reduced page load time by 40% through code optimization.
Implemented real-time features using WebSockets.
Skills: React, TypeScript, Node.js, PostgreSQL, GraphQL"
```

### 3. اختيار اللغة

```
EN → للإنجليزية
AR → للعربية
```

### 4. إنشاء السيرة الذاتية

```
اضغط: "Generate CV"
انتظر: 5-15 ثانية
```

---

## 📋 ماذا يحدث أثناء الإنشاء؟

### المرحلة 1️⃣: المعالجة الأولية

```
✓ يتم استقبال بياناتك
✓ تحقق من صلاحيات الحصة
✓ إرسال إلى Genkit/Groq AI
```

### المرحلة 2️⃣: تحسين الـ ATS

```
AI يقوم بـ:
✓ إعادة صياغة الملخص (professional summary)
✓ تحسين الكلمات المفتاحية
✓ إعادة ترتيب الخبرات بترتيب تنازلي
✓ البحث عن وإضافة الأرقام (metrics)
```

### المرحلة 3️⃣: المراجعة

```
إذا لم يجد أرقام كافية:
→ يظهر نافذة "Suggested Metrics"
→ أدخل الأرقام المتاحة
→ اضغط "Submit Metrics"
→ يعاد الإنشاء بـ البيانات الجديدة
```

---

## 📊 مثال على الإدخال والإخراج

### المدخل (Input)

```json
{
  "prompt": "React developer with 5 years experience. Built e-commerce platforms.",
  "language": "en",
  "targetJobTitle": "Senior React Developer",
  "targetIndustry": "Fintech",
  "preferQuantified": true
}
```

### المخرج (Output)

```json
{
  "fullName": "Your Name",
  "jobTitle": "Senior React Developer",
  "summary": "Results-driven Senior React Developer with 5+ years of expertise...",
  "experiences": [
    {
      "jobTitle": "Senior React Developer",
      "company": "TechCorp",
      "responsibilities": [
        "Led development of 3 high-performance e-commerce platforms, serving 50K+ daily users",
        "Optimized React components reducing bundle size by 35% and improving load time",
        "Implemented real-time features using WebSockets, enhancing user engagement by 28%"
      ]
    }
  ],
  "coreSkills": ["React", "TypeScript", "Next.js"],
  "technicalSkills": ["Node.js", "PostgreSQL", "GraphQL"],
  "additionalSections": [
    {
      "title": "Suggested Metrics",
      "items": [
        "What was the revenue impact of the e-commerce platforms?",
        "How many team members did you lead?"
      ]
    }
  ]
}
```

---

## 💡 نصائح للنتائج الأفضل

### 1. استخدم الأرقام (Numbers)

**❌ سيء**:
```
"Led a large team and improved performance"
```

**✅ جيد**:
```
"Led a team of 8 developers and improved API response time by 45%"
```

### 2. استخدم أفعال قوية (Action Verbs)

```
قوي:
- Developed
- Implemented
- Optimized
- Scaled
- Led
- Achieved
- Increased
- Reduced

ضعيف:
- Did
- Made
- Worked on
- Helped
```

### 3. ركز على النتائج (Results)

**❌ سيء**:
```
"Responsible for backend development"
```

**✅ جيد**:
```
"Architected microservices architecture reducing system latency by 60%, enabling 10x user growth"
```

### 4. استخدم كلمات مفتاحية (Keywords)

ركز على الكلمات المفتاحية في الوظيفة المستهدفة:
- إذا كنت تستهدف "Senior React Developer"، اذكر: React, TypeScript, Next.js, Performance Optimization
- إذا كنت تستهدف "Product Manager"، اذكر: Product Strategy, Roadmapping, Cross-functional Leadership

---

## 🎯 الحصص والدفع

### نموذج الحصص

```
CV Generation Plans:
- One-time: 5 CVs = $5
- Monthly: 20 CVs = $10
- Unlimited: $29/month
```

### تتبع الحصة

```
في صفحة Wallet:
1. انظر إلى "Current Balance"
2. اضغط "Add Funds" إذا انتهت الحصة
3. اختر الخطة المناسبة
4. اكمل الدفع عبر Kashier
```

### كيفية الدفع

```
1. اضغط "Add Funds" في Wallet
2. اختر المبلغ أو الخطة
3. سيتم توجيهك إلى Kashier
4. أدخل بيانات البطاقة
5. اكمل الدفع
6. ستتلقى تأكيد البريد الإلكتروني
7. الحصة تُضاف تلقائياً
```

---

## 💾 إدارة السير الذاتية

### حفظ CV

```
بعد الإنشاء:
1. سيُطلب منك حفظ CV
2. أدخل اسم CV (اختياري)
3. اضغط "Save"
4. سيتم خفض الحصة بـ 1
```

### عرض السير المحفوظة

```
URL: من صفحة Dashboard أو Wallet
1. اذهب إلى "My CVs"
2. شاهد قائمة السير المحفوظة
3. يمكنك:
   - Download PDF
   - Edit
   - Delete
```

### تحميل PDF

```
من قائمة السير:
1. اضغط "Download" على CV
2. سيتم إنشاء PDF وتحميله
3. اسم الملف: "CVeeez-CV.pdf"
```

---

## 🛠️ الإعدادات المتقدمة

### Server-side API

```typescript
// POST /api/cv/generate

Request:
{
  "prompt": "string (required)",
  "language": "en" | "ar" (required),
  "targetJobTitle": "string (required)",
  "targetIndustry": "string (required)",
  "preferQuantified": boolean (optional)
}

Response:
{
  "success": true,
  "data": {
    "fullName": "string",
    "jobTitle": "string",
    "summary": "string",
    "experiences": [],
    "education": [],
    "skills": [],
    "additionalSections": []
  }
}
```

### Environment Variables

```env
# Required
GEMINI_API_KEY=your_api_key_here
GROQ_API_KEY=your_groq_api_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Kashier (للدفع)
KASHIER_API_KEY=...
KASHIER_MERCHANT_ID=...
```

---

## ⚠️ الأخطاء الشائعة وحلولها

### خطأ: "CV creation quota exceeded"

```
السبب: انتهت حصتك من السير الذاتية
الحل:
1. اذهب إلى Wallet
2. أضف أموال
3. اختر الخطة المناسبة
4. أكمل الدفع
```

### خطأ: "Generation failed"

```
السبب: خطأ في معالجة AI
الحل:
1. تأكد من صحة الإدخال
2. أدخل نص أطول وأكثر تفصيلاً
3. اعد المحاولة
```

### خطأ: "Invalid language"

```
السبب: اللغة المختارة غير صحيحة
الحل: اختر "en" أو "ar" فقط
```

---

## 🔒 الأمان والخصوصية

```
✅ بيانات الـ CV محفوظة في Firestore
✅ الوصول محدود لمالك الحساب فقط
✅ الحسابات محمية بـ Authentication
✅ لا نشارك بيانات مع أطراف ثالثة
✅ جميع الاتصالات مشفرة (HTTPS)
```

---

## 📞 الدعم

### الأسئلة الشائعة

**س: هل يمكن تحديث السيرة بعد الإنشاء؟**
```
نعم! اضغط "Edit" على السيرة المحفوظة
```

**س: هل يمكن حذف السيرة؟**
```
نعم، اضغط Delete (لكن لن تستعيد الحصة)
```

**س: هل تدعم لغات أخرى؟**
```
حالياً تدعم الإنجليزية والعربية فقط
```

**س: هل يمكن الحصول على ملف Word؟**
```
حالياً PDF فقط، لكن يمكنك نسخ النص
```

### تواصل معنا

```
Email: support@cveeez.com
Chat: في أسفل يمين الصفحة
WhatsApp: +20 xxx-xxx-xxxx (من صفحة الدعم)
```

---

## 📈 نصائح لتحسين معدل القبول

### 1. استهدف بدقة
```
✅ اختر وظيفة وصناعة محددة
✅ لا تحاول جعل السيرة عامة
```

### 2. استخدم كلمات مفتاحية من الإعلان
```
✅ انسخ الكلمات المفتاحية من الإعلان
✅ أدرجها في السيرة بشكل طبيعي
```

### 3. ركز على الإنجازات
```
✅ 80% إنجازات
✅ 20% مسؤوليات عامة
```

### 4. استخدم الأرقام
```
CVs مع أرقام → 40% معدل نجاح أعلى
```

### 5. تحسين الملخص
```
الملخص يجب أن يحتوي على:
- سنوات الخبرة
- الكلمات المفتاحية الرئيسية
- أكبر إنجاز
- الفائدة للشركة
```

---

## 🎓 أمثلة إنجازات محسّنة

### مثال 1: Frontend Developer

**قبل**:
```
"Developed React components for the platform"
```

**بعد**:
```
"Built 25+ reusable React components with 99.2% code coverage, reducing development time by 30% and improving platform stability"
```

### مثال 2: Product Manager

**قبل**:
```
"Managed product roadmap"
```

**بعد**:
```
"Led product strategy for 5 major feature releases, driving 150% YoY growth and $2M additional revenue through data-driven prioritization"
```

### مثال 3: Data Analyst

**قبل**:
```
"Analyzed data and created dashboards"
```

**بعد**:
```
"Designed and deployed 12 Tableau dashboards processing 5M+ daily records, enabling C-level decision-making that increased campaign ROI by 35%"
```

---

## 🚀 النسخة التالية

```
Soon:
□ دعم المزيد من اللغات
□ نماذج CV محسّنة
□ ATS score checker
□ Cover letter generation
□ Interview prep
```

---

*آخر تحديث: 26 نوفمبر 2025*  
*الإصدار: 1.0*

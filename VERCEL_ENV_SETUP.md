# 🚀 Vercel Deployment Guide - CVEEEZ

## المتغيرات البيئية المطلوبة لـ Vercel

عند النشر على Vercel، يجب إضافة جميع المتغيرات البيئية التالية في لوحة تحكم Vercel:

---

## 🔑 AI Services (ضروري)

### Google Gemini API (مطلوب)
```
GEMINI_API_KEY=your_gemini_api_key_here
```
> احصل على المفتاح من: https://makersuite.google.com/app/apikey

### Groq API (اختياري - لاستخدام Groq/Llama)
```
GROQ_API_KEY=your_groq_api_key_here
```
> احصل على المفتاح من: https://console.groq.com

### HuggingFace (اختياري - يحسن الأداء)
```
HUGGINGFACE_API_KEY=
```

---

## 🔥 Firebase Configuration (مطلوب)

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
> احصل على هذه القيم من: Firebase Console → Project Settings

---

## 💳 Kashier Payment Gateway (مطلوب)

```
NEXT_PUBLIC_KASHIER_MERCHANT_ID=your_merchant_id
NEXT_PUBLIC_KASHIER_API_KEY=your_kashier_api_key
KASHIER_SECRET_KEY=your_kashier_secret_key
NEXT_PUBLIC_KASHIER_CURRENCY=EGP
NEXT_PUBLIC_KASHIER_MODE=live
NEXT_PUBLIC_KASHIER_BASE_URL=https://payments.kashier.io
```
> احصل على هذه القيم من: Kashier Dashboard

---

## 🖼️ Cloudinary Configuration (مطلوب)

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
> احصل على هذه القيم من: Cloudinary Dashboard

---

## 📱 WhatsApp Integration (اختياري)

```
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_AGENT_PHONE=your_agent_phone
WHATSAPP_VERIFY_TOKEN=your_verify_token
```
> احصل على هذه القيم من: Meta Business Suite

---

## 📋 خطوات النشر على Vercel

### الطريقة 1: عبر Vercel Dashboard (موصى بها)

#### 1. تسجيل الدخول إلى Vercel
```
https://vercel.com
```

#### 2. ربط Repository
- اضغط "Add New" → "Project"
- اختر GitHub/GitLab/Bitbucket
- ابحث عن repository الخاص بك
- اضغط "Import"

#### 3. إضافة المتغيرات البيئية
- في صفحة الإعدادات، اذهب إلى "Environment Variables"
- انسخ جميع المتغيرات من الأعلى
- أضف كل متغير بشكل منفصل:
  - **Key**: اسم المتغير (مثل `GEMINI_API_KEY`)
  - **Value**: القيمة (مثل `AIzaSy...`)
  - **Environment**: اختر `Production`, `Preview`, `Development`

#### 4. Deploy
- اضغط "Deploy"
- انتظر حتى ينتهي البناء
- سيكون التطبيق جاهزاً على: `your-project.vercel.app`

---

### الطريقة 2: عبر Vercel CLI

#### 1. تثبيت Vercel CLI
```bash
npm install -g vercel
```

#### 2. تسجيل الدخول
```bash
vercel login
```

#### 3. Deploy
```bash
vercel
```

#### 4. إضافة المتغيرات البيئية عبر CLI
```bash
# مثال
vercel env add GEMINI_API_KEY
# ثم أدخل القيمة عندما يُطلب منك
```

أو استخدم ملف:
```bash
vercel env pull .env.production
```

---

## ⚙️ إعدادات Build

تأكد من أن إعدادات Build في Vercel كالتالي:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node Version: 18.x أو 20.x
```

---

## 🔍 التحقق بعد النشر

بعد النشر الناجح، تحقق من:

1. ✅ **الصفحة الرئيسية تعمل**
   ```
   https://your-project.vercel.app
   ```

2. ✅ **CV Builder يعمل**
   ```
   https://your-project.vercel.app/services/ai-cv-builder
   ```

3. ✅ **API Endpoints تعمل**
   ```
   https://your-project.vercel.app/api/cv/generate
   ```

4. ✅ **تحقق من Logs**
   - اذهب إلى Vercel Dashboard
   - افتح مشروعك → Deployments → Runtime Logs
   - تأكد من عدم وجود أخطاء

---

## 🐛 استكشاف الأخطاء

### خطأ: "Missing environment variables"
**الحل**: تأكد من إضافة جميع المتغيرات المطلوبة في Vercel Dashboard

### خطأ: Build Failed
**الحل**:
1. راجع build logs في Vercel
2. تأكد من أن `npm run build` يعمل محلياً
3. تأكد من وجود جميع dependencies

### خطأ: API Routes لا تعمل
**الحل**:
1. تحقق من أن المتغيرات البيئية موجودة في Production
2. راجع Function Logs في Vercel
3. تأكد من أن API keys صحيحة

### خطأ: "GEMINI_API_KEY expired"
**الحل**:
1. احصل على مفتاح جديد من https://makersuite.google.com/app/apikey
2. حدّث المتغير في Vercel
3. Redeploy

---

## 📊 Domain Configuration

### إضافة Domain مخصص

1. اذهب إلى Project Settings → Domains
2. اضغط "Add Domain"
3. أدخل domain الخاص بك
4. اتبع التعليمات لتكوين DNS

---

## 🔄 Auto Deployment

Vercel يدعم Auto Deployment:

- ✅ كل push إلى `main` → Production deployment
- ✅ كل push إلى فرع آخر → Preview deployment
- ✅ كل Pull Request → Preview deployment

---

## 💡 نصائح مهمة

1. **لا تضع Secrets في الكود**
   - استخدم Environment Variables دائماً
   - لا تضع API keys في الملفات

2. **استخدم Preview Deployments**
   - اختبر التغييرات في preview قبل production

3. **راقب Performance**
   - استخدم Vercel Analytics
   - راجع Function Execution times

4. **Backup Environment Variables**
   - احتفظ بنسخة آمنة من المتغيرات
   - استخدم password manager

---

## 📞 روابط مفيدة

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables Guide](https://vercel.com/docs/environment-variables)

---

## ✅ Checklist قبل النشر

- [ ] جميع المتغيرات البيئية مضافة في Vercel
- [ ] `npm run build` يعمل بدون أخطاء محلياً
- [ ] جميع التغييرات committed و pushed إلى Git
- [ ] `.gitignore` يحتوي على `.env*`
- [ ] تم اختبار التطبيق محلياً
- [ ] تم مراجعة API keys وتأكد أنها صحيحة
- [ ] تم تحديث GEMINI_API_KEY (المفتاح الجديد)

---

🎉 **الآن جاهز للنشر على Vercel!**

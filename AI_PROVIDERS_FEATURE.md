# 🤖 Multi-AI Provider Feature

## نظرة عامة

تم إضافة دعم لاستخدام نماذج ذكاء اصطناعي متعددة في خدمة إنشاء السيرة الذاتية بالذكاء الاصطناعي. الآن يمكن للمستخدمين اختيار المزود الذي يناسبهم.

---

## ✨ الميزات الجديدة

### 1. دعم 3 مزودي ذكاء اصطناعي

#### 🔮 **Google Gemini** (افتراضي)
- **المميزات**: سريع، قوي، دقيق
- **المتطلبات**: `GEMINI_API_KEY`
- **النماذج المتاحة**:
  - `gemini-1.5-flash-latest` - سريع وفعال
  - `gemini-1.5-pro-latest` - الأكثر قدرة

#### ⚡ **Groq (Llama)**
- **المميزات**: استنتاج فائق السرعة، مجاني
- **المتطلبات**: `GROQ_API_KEY`
- **النماذج المتاحة**:
  - `llama-3.3-70b-versatile` - أحدث إصدار
  - `llama-3.1-8b-instant` - سريع جداً
  - `mixtral-8x7b-32768` - نموذج متقدم

#### 🤗 **HuggingFace**
- **المميزات**: نماذج مفتوحة المصدر، مجانية تماماً
- **المتطلبات**: `HUGGINGFACE_API_KEY` (اختياري)
- **النماذج المتاحة**:
  - `mistralai/Mistral-7B-Instruct-v0.2` - قوي ومجاني
  - `meta-llama/Llama-2-7b-chat-hf` - من Meta
  - `google/flan-t5-xxl` - من Google

### 2. واجهة مستخدم محسّنة
- قائمة منسدلة لاختيار المزود
- قائمة منسدلة لاختيار النموذج (اختياري)
- معلومات توضيحية عن كل مزود ونموذج

---

## 🚀 كيفية الاستخدام

### 1. إعداد المفاتيح

أضف المفاتيح في ملف `.env`:

```bash
# Gemini (مطلوب إذا كنت تريد استخدام Gemini)
GEMINI_API_KEY=AIzaSyD1rUVKvuTqOolhZGqeQAwUUews1hV4F9Q

# Groq (مطلوب إذا كنت تريد استخدام Groq)
GROQ_API_KEY=gsk_...

# HuggingFace (اختياري - يحسن معدل الطلبات)
HUGGINGFACE_API_KEY=hf_...
```

### 2. الحصول على المفاتيح

#### Gemini API Key
1. اذهب إلى: https://makersuite.google.com/app/apikey
2. سجل الدخول بحساب Google
3. اضغط "Create API Key"
4. انسخ المفتاح

#### Groq API Key
1. اذهب إلى: https://console.groq.com
2. سجل حساب مجاني
3. اذهب إلى API Keys
4. أنشئ مفتاح جديد

#### HuggingFace API Key (اختياري)
1. اذهب إلى: https://huggingface.co/settings/tokens
2. سجل الدخول أو أنشئ حساب
3. اضغط "New token"
4. انسخ المفتاح

### 3. استخدام الميزة

1. افتح صفحة CV Builder
2. اختر المزود من القائمة المنسدلة الأولى
3. (اختياري) اختر نموذج محدد من القائمة الثانية
4. أدخل بياناتك واضغط "Generate"

---

## 📁 البنية التقنية

### الملفات الجديدة

```
src/ai/providers/
├── types.ts                  # تعريف الأنواع المشتركة
├── gemini-provider.ts        # مزود Gemini
├── groq-provider.ts          # مزود Groq
├── huggingface-provider.ts   # مزود HuggingFace
└── index.ts                  # Factory pattern
```

### الملفات المعدلة

1. **`.env`** - تحديث مفتاح Gemini + إضافة مفاتيح جديدة
2. **`src/ai/flows/ai-cv-builder-from-prompt.ts`** - دعم اختيار المزود
3. **`src/app/api/cv/generate/route.ts`** - validation حسب المزود
4. **`src/app/services/ai-cv-builder/page.tsx`** - واجهة المستخدم

---

## 🔧 API Reference

### Input Schema

```typescript
{
  prompt: string;
  language: 'en' | 'ar';
  targetJobTitle: string;
  targetIndustry: string;
  preferQuantified?: boolean;
  aiProvider?: 'gemini' | 'huggingface' | 'groq';  // جديد
  aiModel?: string;                                 // جديد
}
```

### Provider Interface

```typescript
interface AIProviderInterface {
  generate(request: {
    prompt: string;
    model?: string;
    config?: AIGenerateConfig;
  }): Promise<AIGenerateResponse>;

  isAvailable(): boolean;
  getDefaultModel(): string;
}
```

---

## ⚙️ التكوين والإعدادات

### Gemini Configuration

```bash
# Default model
GEMINI_MODEL_ID=gemini-1.5-flash-latest

# API Key (required)
GEMINI_API_KEY=AIza...
```

### Groq Configuration

```bash
# API Key (required)
GROQ_API_KEY=gsk_...
```

### HuggingFace Configuration

```bash
# API Key (optional - improves rate limits)
HUGGINGFACE_API_KEY=hf_...
```

---

## 💡 أمثلة الاستخدام

### مثال 1: استخدام Gemini (افتراضي)

```typescript
const result = await aiCvBuilderFromPrompt({
  prompt: "Software Engineer with 5 years experience...",
  language: 'en',
  targetJobTitle: 'Senior Developer',
  targetIndustry: 'Tech',
  aiProvider: 'gemini',
  aiModel: 'gemini-1.5-flash-latest'
});
```

### مثال 2: استخدام Groq

```typescript
const result = await aiCvBuilderFromPrompt({
  prompt: "...",
  language: 'en',
  targetJobTitle: 'Senior Developer',
  targetIndustry: 'Tech',
  aiProvider: 'groq',
  aiModel: 'llama-3.3-70b-versatile'
});
```

### مثال 3: استخدام HuggingFace (مجاني)

```typescript
const result = await aiCvBuilderFromPrompt({
  prompt: "...",
  language: 'en',
  targetJobTitle: 'Senior Developer',
  targetIndustry: 'Tech',
  aiProvider: 'huggingface',
  aiModel: 'mistralai/Mistral-7B-Instruct-v0.2'
});
```

---

## 🐛 استكشاف الأخطاء

### خطأ: "AI provider is not available"

**السبب**: المفتاح المطلوب غير موجود في `.env`

**الحل**:
1. تأكد من وجود المفتاح في `.env`
2. أعد تشغيل السيرفر
3. أو اختر مزود آخر متاح

### خطأ: HuggingFace slow or rate limited

**السبب**: استخدام API بدون مفتاح

**الحل**:
1. أضف `HUGGINGFACE_API_KEY` في `.env`
2. أو استخدم Gemini/Groq

### خطأ: Model not found

**السبب**: اسم النموذج غير صحيح

**الحل**:
1. اترك حقل النموذج فارغاً لاستخدام الافتراضي
2. أو راجع قائمة النماذج المتاحة

---

## 📊 مقارنة المزودين

| الميزة | Gemini | Groq | HuggingFace |
|-------|--------|------|-------------|
| **السرعة** | ⚡⚡⚡ سريع جداً | ⚡⚡⚡⚡ فائق السرعة | ⚡⚡ متوسط |
| **الجودة** | ⭐⭐⭐⭐⭐ ممتاز | ⭐⭐⭐⭐ جيد جداً | ⭐⭐⭐ جيد |
| **التكلفة** | 💰 مدفوع (حصة مجانية) | 🆓 مجاني تماماً | 🆓 مجاني تماماً |
| **API Key** | ✅ مطلوب | ✅ مطلوب | ⚠️ اختياري |
| **معدل الطلبات** | 🔄 عالي | 🔄 عالي جداً | 🔄 محدود بدون key |
| **دعم اللغة العربية** | ✅ ممتاز | ✅ جيد | ⚠️ محدود |

---

## 🎯 التوصيات

### للاستخدام اليومي
- **الأفضل**: Gemini 1.5 Flash
- **البديل**: Groq Llama 3.3

### للمهام المعقدة
- **الأفضل**: Gemini 1.5 Pro
- **البديل**: Groq Llama 3.3 70B

### للاستخدام المجاني 100%
- **الأفضل**: Groq (مع API key مجاني)
- **البديل**: HuggingFace

### للغة العربية
- **الأفضل**: Gemini (دعم ممتاز للعربية)
- **البديل**: Groq Llama 3.3

---

## 🔐 ملاحظات الأمان

1. ✅ لا تشارك مفاتيح API علناً
2. ✅ أضف `.env` إلى `.gitignore`
3. ✅ استخدم متغيرات البيئة في Vercel للنشر
4. ✅ جدد المفاتيح دورياً
5. ✅ راقب استهلاك API quota

---

## 📚 موارد إضافية

- [Gemini API Docs](https://ai.google.dev/docs)
- [Groq Documentation](https://console.groq.com/docs)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference)

---

## ✅ الخلاصة

تم إضافة نظام مرن لدعم نماذج ذكاء اصطناعي متعددة:

✅ 3 مزودين مدعومين (Gemini, Groq, HuggingFace)
✅ 8+ نماذج للاختيار
✅ واجهة مستخدم سهلة
✅ نظام validation ذكي
✅ رسائل خطأ واضحة
✅ دعم كامل للعربية

🎉 **الآن يمكن للمستخدمين اختيار المزود والنموذج الأنسب لاحتياجاتهم!**

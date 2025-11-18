# AI Chatbot - Project Documentation

## 🤖 Overview
تم إنشاء Chatbot احترافي يعمل بتقنية Google Gemini AI ويظهر في جميع الـ Dashboards (Seeker, Employer, Admin).

## ✨ Features

### 1. **Intelligent Responses**
- يفهم الأسئلة بالعربية والإنجليزية
- يجيب على أسئلة حول المنصة والخدمات
- يعطي توجيهات خطوة بخطوة
- يقترح إجراءات مفيدة (Suggested Actions)

### 2. **Role-Based Context**
- **Seeker**: يساعد في بناء السيرة الذاتية، التقديم على الوظائف، تتبع الطلبات
- **Employer**: يساعد في نشر الوظائف، مراجعة المتقدمين، إدارة الشركة
- **Admin**: يساعد في إدارة المستخدمين، الإحصائيات، إدارة النظام

### 3. **Professional UI**
- تصميم عصري وجذاب
- زر عائم في أسفل يمين الشاشة
- يمكن تصغير/تكبير النافذة
- سجل المحادثات يحفظ تلقائياً
- رسائل مع timestamps
- أيقونات مميزة للمستخدم والـ Bot

### 4. **Smart Features**
- كشف تلقائي لطلبات التواصل مع خدمة العملاء
- اقتراحات تلقائية للإجراءات المفيدة
- تخصيص الترحيب باسم المستخدم
- دعم متعدد اللغات (عربي/إنجليزي)

## 📁 Files Created

### 1. AI Flow
**Path**: `src/ai/flows/project-chatbot.ts`
- Genkit flow يتعامل مع الذكاء الاصطناعي
- يحتوي على معلومات شاملة عن المنصة
- يحلل السياق ويعطي إجابات ذكية

### 2. API Route
**Path**: `src/app/api/chatbot/route.ts`
- Next.js API endpoint
- يستقبل الرسائل من الـ frontend
- يستدعي الـ AI flow ويرجع النتيجة

### 3. UI Component
**Path**: `src/components/chatbot/FloatingChatbot.tsx`
- React component احترافي
- تصميم responsive
- انيميشنز سلسة
- إدارة حالة المحادثة

### 4. Integration
تم إضافة الـ Chatbot في:
- ✅ `src/app/services/user-dashboard/page.tsx` (Seeker)
- ✅ `src/app/employer/page.tsx` (Employer)
- ✅ `src/app/admin/page.tsx` (Admin)

## 🚀 How to Use

### For Users
1. افتح أي Dashboard (Seeker/Employer/Admin)
2. اضغط على الزر العائم الأزرق في أسفل اليمين
3. اكتب سؤالك بالعربية أو الإنجليزية
4. اضغط Enter أو اضغط زر الإرسال
5. الـ Bot سيرد عليك فوراً

### Example Questions

**For Seekers:**
- "كيف أبني سيرتي الذاتية؟"
- "How do I apply for a job?"
- "ما هي خدماتكم المتاحة؟"
- "How can I track my applications?"
- "كيف أضيف رصيد للمحفظة؟"

**For Employers:**
- "How do I post a new job?"
- "كيف أراجع المتقدمين؟"
- "What are the pricing plans?"
- "How to manage my company profile?"

**For Admins:**
- "How do I manage users?"
- "كيف أحذف مستخدم؟"
- "Show me platform analytics"
- "How to review job postings?"

## 🔮 Future Features (Next Step)

### WhatsApp Integration
عند كتابة "تواصل مع خدمة العملاء" أو "Contact customer service":
- سيتم تحويل المحادثة تلقائياً إلى WhatsApp
- نفس الـ chat سيستمر في WhatsApp
- إرسال واستقبال الرسائل في نفس الواجهة
- اتصال مباشر مع فريق الدعم

## 🛠️ Technical Details

### Technologies Used
- **Google Gemini 2.0 Flash**: AI Model
- **Genkit**: AI framework
- **Next.js 15**: Framework
- **TypeScript**: Type safety
- **React Hooks**: State management
- **Tailwind CSS**: Styling
- **Lucide Icons**: Icons

### API Endpoint
```
POST /api/chatbot
```

**Request Body:**
```json
{
  "message": "User question",
  "userRole": "seeker|employer|admin",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "userName": "Optional user name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "AI response text",
    "suggestedActions": ["Action 1", "Action 2"],
    "requiresEscalation": false
  }
}
```

## 💡 Tips

1. **الـ Bot ذكي**: يفهم السياق من المحادثة السابقة
2. **Suggested Actions**: استخدمها للوصول السريع للمعلومات
3. **متعدد اللغات**: اكتب بأي لغة، سيرد بنفس اللغة
4. **متاح 24/7**: لا يحتاج انتظار موظف

## 🎨 Customization

يمكن تعديل:
- ألوان الـ Chatbot في الـ component
- محتوى الـ knowledge base في الـ AI flow
- الـ suggested actions حسب الـ context
- مكان ظهور الزر (حالياً أسفل اليمين)

## ✅ Status
- ✅ AI Flow Created
- ✅ API Route Working
- ✅ UI Component Ready
- ✅ Integrated in All Dashboards
- ✅ No Errors
- ⏳ WhatsApp Integration (Future)

---

Made with ❤️ using AI Technology

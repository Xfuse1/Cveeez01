import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple rule-based chatbot responses
function generateResponse(message: string, userRole: string, language: 'ar' | 'en'): string {
  const msgLower = message.toLowerCase();
  
  // Detect language
  const isArabic = /[\u0600-\u06FF]/.test(message) || language === 'ar';
  
  // Greetings - Check first for better UX
  if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('مرحبا') || msgLower.includes('السلام') || msgLower.includes('هاي') || msgLower.includes('اهلا')) {
    if (isArabic) {
      return '👋 أهلاً وسهلاً بك! أنا مساعدك الافتراضي في Cveeez.\n\nيمكنني مساعدتك في:\n\n✅ بناء السيرة الذاتية الاحترافية\n✅ البحث عن وظائف مناسبة\n✅ خدمات المحفظة والدفع\n✅ معلومات عن الموقع\n✅ الأسعار والباقات\n\nاكتب سؤالك وسأساعدك فوراً! 😊';
    }
    return '👋 Welcome! I\'m your virtual assistant at Cveeez.\n\nI can help you with:\n\n✅ Professional CV Building\n✅ Job Search\n✅ Wallet & Payments\n✅ Platform Information\n✅ Pricing & Packages\n\nAsk me anything! 😊';
  }
  
  // CV Building responses
  if (msgLower.includes('cv') || msgLower.includes('سيرة') || msgLower.includes('resume') || msgLower.includes('ريزيومي')) {
    if (isArabic) {
      return '📄 **خدمات بناء السيرة الذاتية:**\n\n✨ **بواسطة مصمم محترف**:\n• تصميم احترافي ومخصص\n• مراجعة شخصية\n• 3 تعديلات مجانية\n• التسليم خلال 48 ساعة\n• السعر: من 299 جنيه\n\n🤖 **بالذكاء الاصطناعي**:\n• إنشاء سريع وآلي\n• قوالب احترافية جاهزة\n• إمكانية التعديل الفوري\n• السعر: من 149 جنيه\n\nتفضل بزيارة صفحة الخدمات للمزيد!';
    }
    return '📄 **CV Building Services:**\n\n✨ **Professional Designer**:\n• Custom professional design\n• Personal review session\n• 3 free revisions\n• 48-hour delivery\n• Price: From 299 EGP\n\n🤖 **AI Builder**:\n• Fast automated generation\n• Professional templates\n• Instant editing\n• Price: From 149 EGP\n\nVisit our services page for more!';
  }
  
  // Job search responses
  if (msgLower.includes('job') || msgLower.includes('وظيفة') || msgLower.includes('وظائف') || msgLower.includes('شغل')) {
    if (userRole === 'seeker') {
      if (isArabic) {
        return '💼 **البحث عن وظائف:**\n\nيمكنك:\n• 🔍 تصفح آلاف الوظائف المتاحة\n• 📋 التقديم بضغطة واحدة\n• ⭐ حفظ الوظائف المفضلة\n• 📊 متابعة حالة طلباتك\n• 🔔 تلقي إشعارات بالوظائف الجديدة\n\nابدأ البحث الآن من قسم الوظائف!';
      }
      return '💼 **Job Search:**\n\nYou can:\n• 🔍 Browse thousands of jobs\n• 📋 Apply with one click\n• ⭐ Save favorite jobs\n• 📊 Track your applications\n• 🔔 Get job alerts\n\nStart searching from the Jobs section!';
    } else if (userRole === 'employer') {
      if (isArabic) {
        return '👔 **نشر الوظائف:**\n\nكمشغّل، يمكنك:\n• ➕ نشر وظيفة جديدة بسهولة\n• 👥 استقبال طلبات المتقدمين\n• 📊 إدارة إعلاناتك\n• 🔍 البحث عن المرشحين المناسبين\n• ⭐ مراجعة السير الذاتية\n\nانشر وظيفتك الآن وابحث عن أفضل المواهب!';
      }
      return '👔 **Post Jobs:**\n\nAs an employer, you can:\n• ➕ Post jobs easily\n• 👥 Receive applications\n• 📊 Manage your listings\n• 🔍 Search for candidates\n• ⭐ Review CVs\n\nPost your job now and find top talent!';
    }
  }
  
  // Wallet/Payment responses
  if (msgLower.includes('wallet') || msgLower.includes('محفظة') || msgLower.includes('دفع') || msgLower.includes('payment') || msgLower.includes('رصيد') || msgLower.includes('فلوس')) {
    if (isArabic) {
      return '💰 **المحفظة الإلكترونية:**\n\n✅ إضافة رصيد بسهولة وأمان\n💳 طرق دفع متعددة (فيزا، ماستركارد، فوري)\n📜 متابعة جميع معاملاتك\n🔒 حماية كاملة لبياناتك\n📊 سجل مفصل للمشتريات\n\nيمكنك إدارة محفظتك من لوحة التحكم!';
    }
    return '💰 **Digital Wallet:**\n\n✅ Easy & secure balance top-up\n💳 Multiple payment methods\n📜 Track all transactions\n🔒 Full data protection\n📊 Detailed purchase history\n\nManage your wallet from the dashboard!';
  }
  
  // Pricing responses
  if (msgLower.includes('price') || msgLower.includes('سعر') || msgLower.includes('cost') || msgLower.includes('كم') || msgLower.includes('اسعار') || msgLower.includes('تكلفة')) {
    if (isArabic) {
      return '💵 **الأسعار والباقات:**\n\n📄 **السيرة الذاتية:**\n• مصمم محترف: من 299 جنيه\n• ذكاء اصطناعي: من 149 جنيه\n\n💼 **خدمات أخرى:**\n• نشر وظيفة للمشغلين\n• عرض تفاصيل المتقدمين\n• خدمات تطوير المهارات\n\n🎁 عروض وخصومات متجددة!\n\nزر صفحة الخدمات لمعرفة كل التفاصيل والأسعار.';
    }
    return '💵 **Pricing & Packages:**\n\n📄 **CV Services:**\n• Professional Designer: From 299 EGP\n• AI Builder: From 149 EGP\n\n💼 **Other Services:**\n• Job posting for employers\n• View applicant details\n• Skill development services\n\n🎁 Regular offers & discounts!\n\nVisit services page for full details.';
  }
  
  // Talent Space responses
  if (msgLower.includes('talent') || msgLower.includes('مواهب') || msgLower.includes('community') || msgLower.includes('مجتمع') || msgLower.includes('تواصل')) {
    if (isArabic) {
      return '🌟 **مساحة المواهب:**\n\n🤝 تواصل مع محترفين في مجالك\n📢 شارك إنجازاتك ومشاريعك\n💬 انضم لمجموعات مهنية\n👥 بناء شبكة علاقات قوية\n📚 تبادل الخبرات والمعرفة\n⭐ زيادة ظهورك المهني\n\nانضم لمجتمع المحترفين واصنع فرقاً!';
    }
    return '🌟 **Talent Space:**\n\n🤝 Connect with professionals\n📢 Share your achievements\n💬 Join professional groups\n👥 Build strong network\n📚 Exchange knowledge\n⭐ Boost your visibility\n\nJoin our professional community!';
  }
  
  // Application/Apply responses
  if (msgLower.includes('apply') || msgLower.includes('تقديم') || msgLower.includes('application') || msgLower.includes('طلب')) {
    if (isArabic) {
      return '📝 **التقديم على الوظائف:**\n\n1️⃣ ابحث عن الوظيفة المناسبة\n2️⃣ اضغط "تقديم الآن"\n3️⃣ أرفق سيرتك الذاتية\n4️⃣ أكمل البيانات المطلوبة\n5️⃣ راجع وأرسل طلبك\n\n✅ ستصلك رسالة تأكيد فوراً\n📊 تابع حالة طلبك من لوحة التحكم\n\nبالتوفيق! 🍀';
    }
    return '📝 **Job Application:**\n\n1️⃣ Find the right job\n2️⃣ Click "Apply Now"\n3️⃣ Attach your CV\n4️⃣ Complete required info\n5️⃣ Review and submit\n\n✅ Instant confirmation\n📊 Track from dashboard\n\nGood luck! 🍀';
  }
  
  // Account/Profile responses
  if (msgLower.includes('account') || msgLower.includes('profile') || msgLower.includes('حساب') || msgLower.includes('ملف')) {
    if (isArabic) {
      return '👤 **الحساب والملف الشخصي:**\n\n✏️ تعديل معلوماتك الشخصية\n📸 إضافة صورة احترافية\n📄 تحديث سيرتك الذاتية\n🔐 تغيير كلمة المرور\n📧 إدارة الإشعارات\n⚙️ إعدادات الخصوصية\n\nيمكنك إدارة كل شيء من الإعدادات!';
    }
    return '👤 **Account & Profile:**\n\n✏️ Edit personal info\n📸 Add professional photo\n📄 Update your CV\n🔐 Change password\n📧 Manage notifications\n⚙️ Privacy settings\n\nManage everything from Settings!';
  }
  
  // Customer service/Support
  if (msgLower.includes('support') || msgLower.includes('help') || msgLower.includes('مساعدة') || msgLower.includes('خدمة العملاء') || msgLower.includes('مشكلة') || msgLower.includes('problem')) {
    if (isArabic) {
      return '🆘 **خدمة العملاء:**\n\nنحن هنا لمساعدتك دائماً!\n\n📧 **البريد الإلكتروني:**\nsupport@cveeez.com\n\n💬 **واتساب:**\n+20 106 523 6963\n\n⏰ **مواعيد العمل:**\nمن السبت إلى الخميس\n9 صباحاً - 6 مساءً\n\nنرد على استفساراتك في أقرب وقت ممكن! 😊';
    }
    return '🆘 **Customer Support:**\n\nWe\'re always here to help!\n\n📧 **Email:**\nsupport@cveeez.com\n\n💬 **WhatsApp:**\n+20 106 523 6963\n\n⏰ **Working Hours:**\nSat - Thu\n9 AM - 6 PM\n\nQuick response guaranteed! 😊';
  }
  
  // How it works / كيف يعمل
  if (msgLower.includes('how') || msgLower.includes('كيف') || msgLower.includes('ازاي') || msgLower.includes('طريقة')) {
    if (isArabic) {
      return '📚 **كيف يعمل الموقع:**\n\n**للباحثين عن عمل:**\n1️⃣ سجل حساب جديد\n2️⃣ أنشئ سيرتك الذاتية\n3️⃣ تصفح الوظائف المتاحة\n4️⃣ قدم على الوظائف المناسبة\n5️⃣ تابع طلباتك\n\n**للمشغلين:**\n1️⃣ سجل كمشغل\n2️⃣ انشر وظيفة جديدة\n3️⃣ استقبل الطلبات\n4️⃣ راجع السير الذاتية\n5️⃣ تواصل مع المرشحين\n\nسهل وسريع! 🚀';
    }
    return '📚 **How It Works:**\n\n**For Job Seekers:**\n1️⃣ Create account\n2️⃣ Build your CV\n3️⃣ Browse jobs\n4️⃣ Apply to positions\n5️⃣ Track applications\n\n**For Employers:**\n1️⃣ Register as employer\n2️⃣ Post a job\n3️⃣ Receive applications\n4️⃣ Review CVs\n5️⃣ Contact candidates\n\nEasy & Fast! 🚀';
  }
  
  // Registration / تسجيل
  if (msgLower.includes('register') || msgLower.includes('signup') || msgLower.includes('تسجيل') || msgLower.includes('اشتراك')) {
    if (isArabic) {
      return '✍️ **التسجيل في الموقع:**\n\n📝 خطوات بسيطة:\n1️⃣ اضغط "تسجيل جديد"\n2️⃣ اختر نوع الحساب (باحث عن عمل / مشغل)\n3️⃣ أدخل بياناتك الأساسية\n4️⃣ فعّل حسابك عبر البريد\n5️⃣ أكمل ملفك الشخصي\n\n🎉 مجاناً تماماً!\n🔒 بياناتك آمنة ومحمية\n\nابدأ الآن واستمتع بجميع المميزات!';
    }
    return '✍️ **Registration:**\n\n📝 Easy steps:\n1️⃣ Click "Sign Up"\n2️⃣ Choose account type (Seeker/Employer)\n3️⃣ Enter your details\n4️⃣ Verify via email\n5️⃣ Complete your profile\n\n🎉 Completely FREE!\n🔒 Your data is secure\n\nStart now and enjoy all features!';
  }
  
  // Thank you responses
  if (msgLower.includes('thank') || msgLower.includes('شكرا') || msgLower.includes('شكراً')) {
    if (isArabic) {
      return '😊 العفو! سعداء بخدمتك دائماً.\n\nإذا كان لديك أي سؤال آخر، لا تتردد في السؤال!\n\nنتمنى لك تجربة موفقة في Cveeez! 🌟';
    }
    return '😊 You\'re welcome! Happy to help anytime.\n\nIf you have any other questions, feel free to ask!\n\nWishing you a great experience at Cveeez! 🌟';
  }
  
  // Default response
  if (isArabic) {
    return '🤖 أهلاً بك في Cveeez!\n\nيمكنني مساعدتك في:\n\n📄 **بناء السيرة الذاتية** - احترافية أو بالذكاء الاصطناعي\n💼 **البحث عن وظائف** - آلاف الفرص المتاحة\n💰 **المحفظة والمدفوعات** - طرق دفع آمنة\n🌟 **مساحة المواهب** - تواصل مع المحترفين\n💵 **الأسعار** - باقات مناسبة للجميع\n🆘 **الدعم الفني** - نحن هنا لمساعدتك\n\nاكتب سؤالك وسأجيبك فوراً! 😊';
  }
  return '🤖 Welcome to Cveeez!\n\nI can help you with:\n\n📄 **CV Building** - Professional or AI-powered\n💼 **Job Search** - Thousands of opportunities\n💰 **Wallet & Payments** - Secure payment methods\n🌟 **Talent Space** - Connect with professionals\n💵 **Pricing** - Affordable packages\n🆘 **Support** - We\'re here to help\n\nAsk me anything! 😊';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userRole, userName } = body;

    console.log('Chatbot API called with:', { message, userRole, userName });

    // Validate required fields
    if (!message || !userRole) {
      return NextResponse.json(
        { error: 'Message and userRole are required' },
        { status: 400 }
      );
    }

    // Validate userRole
    if (!['seeker', 'employer', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Invalid userRole. Must be seeker, employer, or admin' },
        { status: 400 }
      );
    }

    // Detect language from message
    const isArabic = /[\u0600-\u06FF]/.test(message);
    const language = isArabic ? 'ar' : 'en';

    // Generate response using rule-based system
    const responseText = generateResponse(message, userRole, language);

    console.log('Bot Response:', responseText);

    // Generate suggested actions based on message content
    const suggestedActions: string[] = [];
    const msgLower = message.toLowerCase();
    
    if (userRole === 'seeker') {
      if (msgLower.includes('cv') || msgLower.includes('سيرة')) {
        suggestedActions.push(
          isArabic ? 'بناء سيرة ذاتية' : 'Build CV',
          isArabic ? 'عرض القوالب' : 'View Templates'
        );
      }
      if (msgLower.includes('job') || msgLower.includes('وظيفة')) {
        suggestedActions.push(
          isArabic ? 'تصفح الوظائف' : 'Browse Jobs',
          isArabic ? 'طلباتي' : 'My Applications'
        );
      }
      if (msgLower.includes('wallet') || msgLower.includes('محفظة')) {
        suggestedActions.push(
          isArabic ? 'إضافة رصيد' : 'Add Funds',
          isArabic ? 'المعاملات' : 'Transactions'
        );
      }
    } else if (userRole === 'employer') {
      if (msgLower.includes('job') || msgLower.includes('وظيفة')) {
        suggestedActions.push(
          isArabic ? 'نشر وظيفة' : 'Post Job',
          isArabic ? 'وظائفي' : 'My Jobs'
        );
      }
      if (msgLower.includes('applicant') || msgLower.includes('متقدم')) {
        suggestedActions.push(isArabic ? 'مراجعة المتقدمين' : 'Review Applications');
      }
    }

    // Check if escalation is needed
    const escalationKeywords = [
      'تواصل مع', 'talk to human', 'speak to agent', 
      'customer service', 'support', 'مشكلة', 'problem'
    ];
    const requiresEscalation = escalationKeywords.some(keyword => 
      msgLower.includes(keyword.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      data: {
        response: responseText,
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
        requiresEscalation,
      },
    });
  } catch (error) {
    console.error('Chatbot API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process chatbot request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

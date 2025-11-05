/**
 * Migration Script: Migrate Static Services to Firestore
 * 
 * This script helps migrate services from the static data file to Firestore.
 * Run this once to populate your database with initial services.
 * 
 * To use this script:
 * 1. Go to your admin dashboard
 * 2. Navigate to Manage Services page
 * 3. Use the "Add Service" button to manually add services
 * 
 * OR
 * 
 * 1. Create a temporary page that calls this function
 * 2. Visit that page once while logged in as admin
 * 3. Delete the temporary page after migration
 */

import { createService, type EcommerceService } from '@/services/ecommerce-services';
import { services } from '@/data/services';

// Static service translations (from translations.ts)
const serviceTranslations = {
  'ats-cv': {
    titleEn: 'ATS-Optimized CV',
    titleAr: 'سيرة ذاتية محسّنة لأنظمة التتبع',
    descriptionEn: 'Create a professional CV optimized for Applicant Tracking Systems to pass automated screening and reach recruiters.',
    descriptionAr: 'أنشئ سيرة ذاتية احترافية محسّنة لأنظمة تتبع المتقدمين لتجاوز الفحص الآلي والوصول إلى مسؤولي التوظيف.',
    featuresEn: [
      'ATS-friendly format and keywords',
      'Professional design',
      'Optimized for automated screening',
      'Increases interview chances'
    ],
    featuresAr: [
      'تنسيق وكلمات مفتاحية متوافقة مع ATS',
      'تصميم احترافي',
      'محسّن للفحص الآلي',
      'يزيد فرص الحصول على مقابلات'
    ],
    ctaEn: 'Create ATS CV',
    ctaAr: 'أنشئ سيرة ذاتية ATS'
  },
  'standard-cv': {
    titleEn: 'Standard CV',
    titleAr: 'سيرة ذاتية قياسية',
    descriptionEn: 'A clean, professional CV template suitable for most industries and job applications.',
    descriptionAr: 'قالب سيرة ذاتية نظيف واحترافي مناسب لمعظم الصناعات وطلبات التوظيف.',
    featuresEn: [
      'Clean and professional design',
      'Suitable for all industries',
      'Easy to customize',
      'Quick delivery'
    ],
    featuresAr: [
      'تصميم نظيف واحترافي',
      'مناسب لجميع الصناعات',
      'سهل التخصيص',
      'تسليم سريع'
    ],
    ctaEn: 'Create Standard CV',
    ctaAr: 'أنشئ سيرة ذاتية قياسية'
  },
  'europass-cv': {
    titleEn: 'Europass CV',
    titleAr: 'سيرة ذاتية يوروباس',
    descriptionEn: 'EU-standard CV format perfect for applications to European institutions and companies.',
    descriptionAr: 'تنسيق سيرة ذاتية معياري أوروبي مثالي للتقديم على المؤسسات والشركات الأوروبية.',
    featuresEn: [
      'EU-standard Europass format',
      'Recognized across Europe',
      'Detailed skill sections',
      'Multilingual support'
    ],
    featuresAr: [
      'تنسيق يوروباس المعياري الأوروبي',
      'معترف به في جميع أنحاء أوروبا',
      'أقسام مهارات مفصلة',
      'دعم متعدد اللغات'
    ],
    ctaEn: 'Create Europass CV',
    ctaAr: 'أنشئ سيرة ذاتية يوروباس'
  },
  'canadian-cv': {
    titleEn: 'Canadian CV',
    titleAr: 'سيرة ذاتية كندية',
    descriptionEn: 'Specialized CV format designed for Canadian job market standards and employer expectations.',
    descriptionAr: 'تنسيق سيرة ذاتية متخصص مصمم لمعايير سوق العمل الكندي وتوقعات أصحاب العمل.',
    featuresEn: [
      'Canadian job market format',
      'Includes relevant sections',
      'Professional Canadian style',
      'Immigration-friendly'
    ],
    featuresAr: [
      'تنسيق سوق العمل الكندي',
      'يتضمن الأقسام ذات الصلة',
      'أسلوب كندي احترافي',
      'مناسب للهجرة'
    ],
    ctaEn: 'Create Canadian CV',
    ctaAr: 'أنشئ سيرة ذاتية كندية'
  },
  'cover-letter': {
    titleEn: 'Cover Letter',
    titleAr: 'خطاب تقديم',
    descriptionEn: 'Professional cover letter tailored to highlight your qualifications and match the job requirements.',
    descriptionAr: 'خطاب تقديم احترافي مصمم لإبراز مؤهلاتك ومطابقة متطلبات الوظيفة.',
    featuresEn: [
      'Customized to job posting',
      'Professional tone',
      'Highlights key achievements',
      'Complements your CV'
    ],
    featuresAr: [
      'مخصص لإعلان الوظيفة',
      'لهجة احترافية',
      'يبرز الإنجازات الرئيسية',
      'يكمل سيرتك الذاتية'
    ],
    ctaEn: 'Create Cover Letter',
    ctaAr: 'أنشئ خطاب تقديم'
  },
  'portfolio': {
    titleEn: 'Portfolio Development',
    titleAr: 'تطوير الحافظة',
    descriptionEn: 'Build an impressive online portfolio to showcase your work, projects, and achievements.',
    descriptionAr: 'أنشئ حافظة أعمال مذهلة عبر الإنترنت لعرض أعمالك ومشاريعك وإنجازاتك.',
    featuresEn: [
      'Custom portfolio website',
      'Project showcase',
      'Professional presentation',
      'SEO optimized'
    ],
    featuresAr: [
      'موقع حافظة مخصص',
      'عرض المشاريع',
      'عرض احترافي',
      'محسّن لمحركات البحث'
    ],
    ctaEn: 'Build Portfolio',
    ctaAr: 'أنشئ حافظة'
  },
  'linkedin-professional': {
    titleEn: 'LinkedIn Profile Optimization',
    titleAr: 'تحسين ملف لينكدإن',
    descriptionEn: 'Optimize your LinkedIn profile to attract recruiters and expand your professional network.',
    descriptionAr: 'حسّن ملفك الشخصي على لينكدإن لجذب مسؤولي التوظيف وتوسيع شبكتك المهنية.',
    featuresEn: [
      'Professional headline',
      'Keyword optimization',
      'Engaging summary',
      'Recruiter-friendly'
    ],
    featuresAr: [
      'عنوان احترافي',
      'تحسين الكلمات المفتاحية',
      'ملخص جذاب',
      'سهل للموظفين'
    ],
    ctaEn: 'Optimize LinkedIn',
    ctaAr: 'حسّن لينكدإن'
  },
  'training-workshops': {
    titleEn: 'Career Workshops & Training',
    titleAr: 'ورش العمل والتدريب المهني',
    descriptionEn: 'Join expert-led workshops to enhance your job search skills, interview techniques, and career development.',
    descriptionAr: 'انضم إلى ورش عمل يقودها خبراء لتعزيز مهارات البحث عن وظيفة وتقنيات المقابلات والتطوير المهني.',
    featuresEn: [
      'Expert-led sessions',
      'Interactive learning',
      'Practical skills',
      'Certification available'
    ],
    featuresAr: [
      'جلسات يقودها خبراء',
      'تعلم تفاعلي',
      'مهارات عملية',
      'شهادة متاحة'
    ],
    ctaEn: 'Join Workshop',
    ctaAr: 'انضم لورشة عمل'
  },
  'job-listings': {
    titleEn: 'Job Board Access',
    titleAr: 'الوصول إلى لوحة الوظائف',
    descriptionEn: 'Access our curated job board with exclusive listings from top employers in various industries.',
    descriptionAr: 'احصل على لوحة الوظائف المنسقة مع قوائم حصرية من أفضل أصحاب العمل في مختلف الصناعات.',
    featuresEn: [
      'Exclusive job listings',
      'Top employers',
      'Multiple industries',
      'Daily updates'
    ],
    featuresAr: [
      'قوائم وظائف حصرية',
      'أفضل أصحاب العمل',
      'صناعات متعددة',
      'تحديثات يومية'
    ],
    ctaEn: 'Browse Jobs',
    ctaAr: 'تصفح الوظائف'
  },
  'translator': {
    titleEn: 'CV Translator',
    titleAr: 'مترجم السيرة الذاتية',
    descriptionEn: 'Translate your CV between English and Arabic with professional accuracy and formatting.',
    descriptionAr: 'ترجم سيرتك الذاتية بين الإنجليزية والعربية بدقة احترافية وتنسيق مناسب.',
    featuresEn: [
      'Professional translation',
      'Format preservation',
      'Quick turnaround',
      'Free service'
    ],
    featuresAr: [
      'ترجمة احترافية',
      'الحفاظ على التنسيق',
      'تسليم سريع',
      'خدمة مجانية'
    ],
    ctaEn: 'Translate Now',
    ctaAr: 'ترجم الآن'
  },
};

/**
 * Migrate all static services to Firestore
 * Call this function from a temporary admin page
 */
export async function migrateStaticServicesToFirestore(userId: string) {
  const results = {
    success: [] as string[],
    failed: [] as { id: string; error: string }[],
  };

  for (const service of services) {
    const translation = serviceTranslations[service.id as keyof typeof serviceTranslations];
    
    if (!translation) {
      results.failed.push({
        id: service.id,
        error: 'Translation not found',
      });
      continue;
    }

    const newService: Omit<EcommerceService, 'id' | 'createdAt' | 'updatedAt'> = {
      category: service.category,
      titleEn: translation.titleEn,
      titleAr: translation.titleAr,
      descriptionEn: translation.descriptionEn,
      descriptionAr: translation.descriptionAr,
      featuresEn: translation.featuresEn,
      featuresAr: translation.featuresAr,
      ctaTextEn: translation.ctaEn,
      ctaTextAr: translation.ctaAr,
      priceDesigner: service.prices.designer,
      priceAI: service.prices.ai,
      imageId: service.imageId,
      ctaType: service.ctaType || 'link',
      href: service.href || '',
      isActive: true,
      order: services.indexOf(service),
    };

    try {
      const result = await createService(newService, userId);
      if (result.success) {
        results.success.push(service.id);
      } else {
        results.failed.push({
          id: service.id,
          error: result.error || 'Unknown error',
        });
      }
    } catch (error: any) {
      results.failed.push({
        id: service.id,
        error: error.message || 'Unknown error',
      });
    }
  }

  return results;
}

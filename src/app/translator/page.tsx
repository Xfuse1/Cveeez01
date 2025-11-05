"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Translator } from '@/components/translator/Translator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/language-provider';

export default function TranslatorPage() {
  const { language } = useLanguage();
  const BackIcon = language === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="mb-8 flex w-full items-start justify-between gap-4">
            <Button asChild variant="outline" className="text-primary border-primary hover:bg-primary/10 hover:text-primary" dir="ltr">
              <Link href="/#services">
                <BackIcon className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'العودة' : 'Back'}
              </Link>
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary">
              {language === 'ar' ? 'مترجم النصوص' : 'Text Translator'}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
              {language === 'ar' 
                ? 'ترجم النصوص بين العربية والإنجليزية بشكل فوري ومجاني'
                : 'Translate text between Arabic and English instantly and for free'
              }
            </p>
          </div>

          <Translator showCard={true} />

          {/* Features Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg bg-card">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'ar' ? 'سريع وفوري' : 'Fast & Instant'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'احصل على ترجمات فورية في ثوانٍ معدودة'
                  : 'Get instant translations in seconds'
                }
              </p>
            </div>

            <div className="text-center p-6 border rounded-lg bg-card">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'ar' ? 'دقيق وموثوق' : 'Accurate & Reliable'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'ترجمات عالية الجودة باستخدام تقنيات متقدمة'
                  : 'High-quality translations using advanced technology'
                }
              </p>
            </div>

            <div className="text-center p-6 border rounded-lg bg-card">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'ar' ? 'مجاني تماماً' : '100% Free'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'استخدم المترجم بدون قيود أو رسوم'
                  : 'Use the translator without limits or fees'
                }
              </p>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-12 p-6 border rounded-lg bg-muted/30">
            <h3 className="font-semibold text-lg mb-4">
              {language === 'ar' ? '💡 نصائح للحصول على أفضل النتائج' : '💡 Tips for Best Results'}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  {language === 'ar' 
                    ? 'استخدم جمل واضحة ومباشرة للحصول على ترجمة أفضل'
                    : 'Use clear and direct sentences for better translation'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  {language === 'ar' 
                    ? 'تجنب استخدام العامية أو المصطلحات المحلية للحصول على ترجمة أدق'
                    : 'Avoid slang or local terms for more accurate translation'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  {language === 'ar' 
                    ? 'راجع الترجمة دائماً للتأكد من المعنى المقصود'
                    : 'Always review the translation to ensure intended meaning'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  {language === 'ar' 
                    ? 'استخدم زر "الترجمة التلقائية" للكشف التلقائي عن اللغة'
                    : 'Use "Auto Translate" button for automatic language detection'
                  }
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

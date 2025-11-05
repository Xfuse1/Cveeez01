"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { translateText, autoTranslate } from '@/services/translation';
import { togglePageTranslation, isPageTranslated } from '@/services/pageTranslator';
import { useLanguage } from '@/contexts/language-provider';
import { Loader2, Languages, Copy, CheckCircle2, ArrowLeftRight, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FloatingTranslator() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPageTranslating, setIsPageTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'الرجاء إدخال نص للترجمة' : 'Please enter text to translate',
      });
      return;
    }

    setIsTranslating(true);
    
    try {
      const result = await autoTranslate(sourceText);
      
      if (result.success && result.translatedText) {
        setTranslatedText(result.translatedText);
        toast({
          title: language === 'ar' ? '✅ تمت الترجمة' : '✅ Translated',
          description: language === 'ar' ? 'تم ترجمة النص بنجاح' : 'Text translated successfully',
        });
      } else {
        toast({
          variant: 'destructive',
          title: language === 'ar' ? 'فشلت الترجمة' : 'Translation Failed',
          description: result.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'),
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء الترجمة' : 'An error occurred during translation',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwap = () => {
    const temp = sourceText;
    setSourceText(translatedText);
    setTranslatedText(temp);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: language === 'ar' ? '📋 تم النسخ' : '📋 Copied',
      description: language === 'ar' ? 'تم نسخ النص' : 'Text copied',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
  };

  return (
    <>
      {/* Floating Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 p-0"
            title={language === 'ar' ? 'مترجم سريع' : 'Quick Translator'}
          >
            <Languages className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              {language === 'ar' ? 'مترجم سريع' : 'Quick Translator'}
            </SheetTitle>
            <SheetDescription>
              {language === 'ar' 
                ? 'ترجم بين العربية والإنجليزية فوراً'
                : 'Translate between Arabic and English instantly'
              }
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            {/* Source Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {language === 'ar' ? 'النص الأصلي' : 'Source Text'}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(sourceText)}
                  disabled={!sourceText}
                  className="h-7 text-xs"
                >
                  {copied ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {language === 'ar' ? 'نسخ' : 'Copy'}
                </Button>
              </div>
              <Textarea
                placeholder={language === 'ar' ? 'اكتب أو الصق النص هنا...' : 'Type or paste text here...'}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[150px] resize-y"
              />
              <div className="text-xs text-muted-foreground text-right">
                {sourceText.length} {language === 'ar' ? 'حرف' : 'chars'}
              </div>
            </div>

            {/* Translate Button */}
            <Button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="w-full"
              size="lg"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'ar' ? 'جاري الترجمة...' : 'Translating...'}
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  {language === 'ar' ? 'ترجمة الآن' : 'Translate Now'}
                </>
              )}
            </Button>

            {/* Translated Text */}
            {translatedText && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-primary">
                    {language === 'ar' ? '✨ الترجمة' : '✨ Translation'}
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(translatedText)}
                    className="h-7 text-xs"
                  >
                    {copied ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {language === 'ar' ? 'نسخ' : 'Copy'}
                  </Button>
                </div>
                <Textarea
                  value={translatedText}
                  readOnly
                  className="min-h-[150px] resize-y bg-primary/5 border-primary/20"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {translatedText.length} {language === 'ar' ? 'حرف' : 'chars'}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSwap}
                disabled={isTranslating || !translatedText}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'تبديل' : 'Swap'}
              </Button>

              <Button
                onClick={handleClear}
                disabled={isTranslating}
                variant="outline"
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'مسح' : 'Clear'}
              </Button>
              
              <Button
          onClick={async () => {
            setIsPageTranslating(true);
            const res = await togglePageTranslation(language === 'ar' ? 'ar' : 'en');
            setIsPageTranslating(false);
                  if (res.success) {
                    toast({ title: language === 'ar' ? 'تم' : 'Done', description: res.message || (language === 'ar' ? 'تمت ترجمة الصفحة' : 'Page translated') });
                  } else {
                    toast({ variant: 'destructive', title: language === 'ar' ? 'فشل' : 'Failed', description: res.message || (language === 'ar' ? 'فشل في الترجمة' : 'Failed to translate page') });
                  }
                }}
                disabled={isPageTranslating}
                variant="secondary"
                className="flex-1"
              >
                {isPageTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'ar' ? 'جاري ترجمة الصفحة...' : 'Translating Page...'}
                  </>
                ) : (
                  <>
                    <Languages className="mr-2 h-4 w-4" />
                    {isPageTranslated() ? (language === 'ar' ? 'استعادة الصفحة' : 'Revert Page') : (language === 'ar' ? 'ترجمة الصفحة' : 'Translate Page')}
                  </>
                )}
              </Button>
            </div>

            {/* Pro Tip */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
              <p className="font-semibold text-primary mb-1">
                {language === 'ar' ? '💡 نصيحة احترافية' : '💡 Pro Tip'}
              </p>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'الترجمة تكتشف اللغة تلقائياً! فقط اكتب وانقر "ترجمة الآن"'
                  : 'Auto-detection enabled! Just type and click "Translate Now"'
                }
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

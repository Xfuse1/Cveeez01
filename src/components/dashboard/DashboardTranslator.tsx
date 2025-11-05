"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { translateText, autoTranslate, isArabicText } from '@/services/translation';
import { useLanguage } from '@/contexts/language-provider';
import { Loader2, Languages, Copy, CheckCircle2, ArrowLeftRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function DashboardTranslator() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

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
          title: language === 'ar' ? 'تمت الترجمة بنجاح' : 'Translation Successful',
          description: language === 'ar' ? 'تم ترجمة النص بنجاح' : 'Text translated successfully',
        });
      } else {
        toast({
          variant: 'destructive',
          title: language === 'ar' ? 'فشلت الترجمة' : 'Translation Failed',
          description: result.error || (language === 'ar' ? 'حدث خطأ أثناء الترجمة' : 'An error occurred during translation'),
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
      title: language === 'ar' ? 'تم النسخ' : 'Copied',
      description: language === 'ar' ? 'تم نسخ النص إلى الحافظة' : 'Text copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {language === 'ar' ? 'مترجم' : 'Translator'}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {language === 'ar' ? 'مترجم سريع' : 'Quick Translator'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' 
              ? 'ترجم النصوص بين العربية والإنجليزية بسرعة'
              : 'Translate text between Arabic and English quickly'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {copied ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {language === 'ar' ? 'نسخ' : 'Copy'}
                </Button>
              </div>
              <Textarea
                placeholder={language === 'ar' ? 'أدخل النص هنا...' : 'Enter text here...'}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[200px] resize-y"
              />
              <div className="text-xs text-muted-foreground">
                {sourceText.length} {language === 'ar' ? 'حرف' : 'characters'}
              </div>
            </div>

            {/* Translated Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {language === 'ar' ? 'الترجمة' : 'Translation'}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(translatedText)}
                  disabled={!translatedText}
                  className="h-7 text-xs"
                >
                  {copied ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {language === 'ar' ? 'نسخ' : 'Copy'}
                </Button>
              </div>
              <Textarea
                placeholder={language === 'ar' ? 'الترجمة ستظهر هنا...' : 'Translation will appear here...'}
                value={translatedText}
                readOnly
                className="min-h-[200px] resize-y bg-muted/50"
              />
              <div className="text-xs text-muted-foreground">
                {translatedText.length} {language === 'ar' ? 'حرف' : 'characters'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="flex-1 min-w-[120px]"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'ar' ? 'جاري الترجمة...' : 'Translating...'}
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  {language === 'ar' ? 'ترجمة' : 'Translate'}
                </>
              )}
            </Button>

            <Button
              onClick={handleSwap}
              disabled={isTranslating || !translatedText}
              variant="outline"
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              {language === 'ar' ? 'تبديل' : 'Swap'}
            </Button>

            <Button
              onClick={handleClear}
              disabled={isTranslating}
              variant="outline"
            >
              {language === 'ar' ? 'مسح' : 'Clear'}
            </Button>
          </div>

          {/* Quick Tips */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p className="font-medium mb-1">
              {language === 'ar' ? '💡 نصيحة سريعة:' : '💡 Quick Tip:'}
            </p>
            <p>
              {language === 'ar' 
                ? 'الترجمة تلقائية - فقط أدخل النص وانقر على "ترجمة" للحصول على النتيجة الفورية!'
                : 'Auto-detection enabled - just enter text and click "Translate" for instant results!'
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

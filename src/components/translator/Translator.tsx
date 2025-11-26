"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { translateText, autoTranslate, isArabicText, type TranslationLanguage } from '@/services/translation';
import { useLanguage } from '@/contexts/language-provider';
import { Loader2, ArrowLeftRight, Copy, CheckCircle2, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranslatorProps {
  initialText?: string;
  onTranslate?: (translatedText: string) => void;
  showCard?: boolean;
  className?: string;
}

export function Translator({ initialText = '', onTranslate, showCard = true, className = '' }: TranslatorProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [sourceText, setSourceText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<TranslationLanguage>('en');
  const [targetLanguage, setTargetLanguage] = useState<TranslationLanguage>('ar');
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
      const result = await translateText(sourceText, targetLanguage, sourceLanguage);
      
      if (result.success && result.translatedText) {
        setTranslatedText(result.translatedText);
        if (onTranslate) {
          onTranslate(result.translatedText);
        }
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

  const handleAutoTranslate = async () => {
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
        // Update source and target languages based on detection
        const hasArabic = isArabicText(sourceText);
        setSourceLanguage(hasArabic ? 'ar' : 'en');
        setTargetLanguage(hasArabic ? 'en' : 'ar');
        
        if (onTranslate) {
          onTranslate(result.translatedText);
        }
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

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = async () => {
    if (translatedText) {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      toast({
        title: language === 'ar' ? 'تم النسخ' : 'Copied',
        description: language === 'ar' ? 'تم نسخ الترجمة إلى الحافظة' : 'Translation copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const content = (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'من' : 'From'}
            </label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value as TranslationLanguage)}
              className="text-sm border rounded px-2 py-1 bg-background"
            >
              <option value="en">{language === 'ar' ? 'الإنجليزية' : 'English'}</option>
              <option value="ar">{language === 'ar' ? 'العربية' : 'Arabic'}</option>
            </select>
          </div>
          <Textarea
            placeholder={language === 'ar' ? 'أدخل النص للترجمة...' : 'Enter text to translate...'}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            onPaste={(e: React.ClipboardEvent<HTMLTextAreaElement>) => {
              try {
                const pasted = e.clipboardData.getData('text/plain');
                if (pasted) {
                  // Prevent default to control insertion and update React state
                  e.preventDefault();
                  // Append pasted text at the end; keep simple and robust across browsers
                  setSourceText((prev) => (prev ? prev + '\n' + pasted : pasted));
                }
              } catch (err) {
                // Fallback: allow default paste if something goes wrong
                console.error('Paste handling error:', err);
              }
            }}
            className="min-h-[200px] resize-y"
          />
          <div className="text-xs text-muted-foreground">
            {sourceText.length} {language === 'ar' ? 'حرف' : 'characters'}
          </div>
        </div>

        {/* Target Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'إلى' : 'To'}
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as TranslationLanguage)}
              className="text-sm border rounded px-2 py-1 bg-background"
            >
              <option value="en">{language === 'ar' ? 'الإنجليزية' : 'English'}</option>
              <option value="ar">{language === 'ar' ? 'العربية' : 'Arabic'}</option>
            </select>
          </div>
          <Textarea
            placeholder={language === 'ar' ? 'الترجمة ستظهر هنا...' : 'Translation will appear here...'}
            value={translatedText}
            readOnly
            className="min-h-[200px] resize-y bg-muted/50"
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {translatedText.length} {language === 'ar' ? 'حرف' : 'characters'}
            </div>
            {translatedText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {language === 'ar' ? 'تم النسخ' : 'Copied'}
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    {language === 'ar' ? 'نسخ' : 'Copy'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Button
          onClick={handleTranslate}
          disabled={isTranslating || !sourceText.trim()}
          className="flex-1 min-w-[150px]"
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
          onClick={handleAutoTranslate}
          disabled={isTranslating || !sourceText.trim()}
          variant="secondary"
          className="flex-1 min-w-[150px]"
        >
          {isTranslating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'ar' ? 'جاري الترجمة...' : 'Translating...'}
            </>
          ) : (
            <>
              <Languages className="mr-2 h-4 w-4" />
              {language === 'ar' ? 'ترجمة تلقائية' : 'Auto Translate'}
            </>
          )}
        </Button>

        <Button
          onClick={handleSwapLanguages}
          disabled={isTranslating || !translatedText}
          variant="outline"
          size="icon"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          {language === 'ar' ? 'مترجم النصوص' : 'Text Translator'}
        </CardTitle>
        <CardDescription>
          {language === 'ar' 
            ? 'ترجم النصوص بين العربية والإنجليزية بسهولة'
            : 'Translate text between Arabic and English easily'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}

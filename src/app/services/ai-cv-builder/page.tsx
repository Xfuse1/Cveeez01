
"use client";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Sparkles, ArrowLeft, ArrowRight, Upload, XCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cvTemplatesRegistry } from '@/lib/cv-templates';
import { isArabicText } from '@/services/translation';
import { useLanguage } from '@/contexts/language-provider';
import { useAuth } from '@/contexts/auth-provider';
import { translations } from '@/lib/translations';
import { deductFromWallet, getWalletBalance } from '@/services/wallet';
import { getEffectivePrice } from '@/services/pricing';
import { autoTranslate } from '@/services/translation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


type Language = 'en' | 'ar';

export default function AiCvBuilderPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language].aiCvBuilderPage;

  const templates = cvTemplatesRegistry.map(template => ({
    id: template.id,
    component: template.component,
    name: t.templates[template.id as keyof typeof t.templates]?.name ?? template.id,
    description: t.templates[template.id as keyof typeof t.templates]?.description ?? '',
  }));

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [cvData, setCvData] = useState<AICVBuilderFromPromptOutput | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('ats-ordered');
  const [renderLanguage, setRenderLanguage] = useState<Language>(language);
  const [isEditing, setIsEditing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [priceInfo, setPriceInfo] = useState<{
    price: number;
    hasOffer: boolean;
    originalPrice?: number;
    currency: string;
  } | null>(null);
  const { toast } = useToast();
  const cvContainerRef = useRef<HTMLDivElement>(null);

  // Fetch wallet balance and pricing when user is available
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const balance = await getWalletBalance(user.uid);
        setWalletBalance(balance?.balance ?? 0);
      } else {
        setWalletBalance(null);
      }

      // Fetch current pricing for AI CV Builder
      const pricing = await getEffectivePrice('ai-cv-builder');
      setPriceInfo(pricing);
    };
    fetchData();
  }, [user]);

  // Offline language guard: rely on model prompt; no external translation calls (network restricted)
  const normalizeLanguage = async (data: AICVBuilderFromPromptOutput) => data;


  const handleGenerateCv = async (outputLanguage: Language) => {
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: t.toastInputRequiredTitle,
        description: t.toastInputRequiredDescription,
      });
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to generate a CV.',
      });
      return;
    }

    // Get current price (should already be loaded, but fetch again to be sure)
    const currentPricing = priceInfo || await getEffectivePrice('ai-cv-builder');
    const CV_GENERATION_COST = currentPricing.price;

    // Check balance before attempting deduction
    if (walletBalance !== null && walletBalance < CV_GENERATION_COST) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: `You need ${CV_GENERATION_COST} ${currentPricing.currency} to generate a CV. Your current balance is ${walletBalance} ${currentPricing.currency}. Please add funds to your wallet.`,
      });
      return;
    }

    setIsLoading(true);
    setCvData(null);
    setIsEditing(false);

    try {
      // Step 1: Generate CV first (no payment yet!)
      console.log('🚀 Step 1: Starting CV generation...');
      console.log('📤 Calling AI CV Builder with params:', {
        promptLength: prompt.length,
        language: outputLanguage,
        targetJobTitle: 'Professional',
        targetIndustry: 'General'
      });

      let result: AICVBuilderFromPromptOutput;
      try {
        console.log('🌐 Calling /api/cv/generate...');

        const res = await fetch('/api/cv/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            language: outputLanguage,
            targetJobTitle: 'Professional',
            targetIndustry: 'General',
            preferQuantified: true,
          }),
        });

        if (!res.ok) {
          let errorMsg = `API error ${res.status}`;
          try {
            const data = await res.json();
            if ((data as any)?.error) {
              errorMsg = (data as any).error;
            }
          } catch (e) {
            // ignore JSON parse failures
          }

          console.error('❌ Step 1 Failed: CV generation API error:', errorMsg);
          toast({
            variant: 'destructive',
            title: t.toastErrorTitle,
            description: t.toastErrorDescription,
          });
          setIsLoading(false);
          return; // Exit without charging
        }

        const data = await res.json();
        result = (data as any).data as AICVBuilderFromPromptOutput;
        console.log('✅ Step 1 Success: CV generated successfully via API');
      } catch (genError) {
        console.error('❌ Step 1 Failed: CV generation network error:', genError);
        toast({
          variant: 'destructive',
          title: t.toastErrorTitle,
          description: t.toastErrorDescription,
        });
        setIsLoading(false);
        return; // Exit without charging
      }

      // Step 2: Only if CV generation succeeded, deduct from wallet
      console.log('💳 Step 2: Deducting payment from wallet...');
      let deductResult;
      try {
        deductResult = await deductFromWallet(
          user.uid,
          CV_GENERATION_COST,
          'AI CV Generation',
          `cv-gen-${Date.now()}`
        );

        if (!deductResult.success) {
          console.error('❌ Step 2 Failed: Wallet deduction failed:', deductResult.message);
          // Payment failed but CV was generated - show error
          toast({
            variant: 'destructive',
            title: 'Payment Failed',
            description: deductResult.message,
          });
          setIsLoading(false);
          return; // Don't show CV if payment failed
        }
        console.log('✅ Step 2 Success: Payment deducted');
      } catch (paymentError) {
        console.error('❌ Step 2 Failed: Payment processing error:', paymentError);
        toast({
          variant: 'destructive',
          title: 'Payment Error',
          description: 'Failed to process payment. Please try again.',
        });
        setIsLoading(false);
        return; // Exit without displaying CV
      }

      // Step 3: Only if BOTH generation and payment succeeded, display CV
      console.log('📊 Step 3: Displaying CV and updating UI...');
      
      // Update local balance after successful deduction
      if (deductResult.newBalance !== undefined) {
        setWalletBalance(deductResult.newBalance);
      }

      const sanitized = await normalizeLanguage(result);
      setCvData(sanitized);
      setRenderLanguage(outputLanguage);

      // Show success message with pricing details
      let successMessage = `${t.toastSuccessDescription} ${CV_GENERATION_COST} ${currentPricing.currency} deducted from your wallet.`;
      if (currentPricing.hasOffer && currentPricing.originalPrice) {
        successMessage += ` (Save ${((currentPricing.originalPrice - CV_GENERATION_COST) / currentPricing.originalPrice * 100).toFixed(0)}%!)`;
      }
      successMessage += ` New balance: ${deductResult.newBalance} ${currentPricing.currency}`;

      toast({
        title: t.toastSuccessTitle,
        description: successMessage,
      });
      console.log('✅ Step 3 Success: CV displayed to user');

    } catch (error) {
      console.error('❌ Unexpected error in CV generation flow:', error);
      toast({
        variant: 'destructive',
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslatePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'الرجاء إدخال نص للترجمة' : 'Please enter text to translate',
      });
      return;
    }

    setIsTranslating(true);

    try {
      const result = await autoTranslate(prompt);

      if (result.success && result.translatedText) {
        setPrompt(result.translatedText);
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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        toast({
          title: t.toastPhotoUploaded,
          description: t.toastPhotoUploadedDesc,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPdf = async () => {
    const cvElement = cvContainerRef.current;
    if (!cvElement) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not find CV element to download.",
      });
      return;
    }

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(cvElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: cvElement.scrollWidth,
        windowHeight: cvElement.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('CVeeez-CV.pdf');

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "PDF Download Failed",
        description: "An error occurred while generating the PDF.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const updateCvData = (updater: (prev: AICVBuilderFromPromptOutput) => AICVBuilderFromPromptOutput) => {
    setCvData(prev => (prev ? updater(prev) : prev));
  };

  const handleSummaryChange = (value: string) => {
    updateCvData(prev => ({ ...prev, summary: value }));
  };

  const handleSkillsChange = (value: string) => {
    const items = value
      .split(/[,\\n]/)
      .map(s => s.trim())
      .filter(Boolean);
    updateCvData(prev => ({ ...prev, skills: items }));
  };

  const handleContactChange = (field: 'email' | 'phone' | 'location' | 'linkedin' | 'github' | 'website', value: string) => {
    updateCvData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value,
      },
    }));
  };

  const handleExperienceChange = (
    index: number,
    field: 'jobTitle' | 'company' | 'location' | 'startDate' | 'endDate' | 'responsibilities',
    value: string
  ) => {
    updateCvData(prev => {
      const experiences = [...prev.experiences];
      const current = { ...experiences[index] };
      if (field === 'responsibilities') {
        current.responsibilities = value
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean);
      } else {
        (current as any)[field] = value;
      }
      experiences[index] = current;
      return { ...prev, experiences };
    });
  };

  const handleEducationChange = (
    index: number,
    field: 'degree' | 'fieldOfStudy' | 'institution' | 'graduationYear',
    value: string
  ) => {
    updateCvData(prev => {
      const education = [...prev.education];
      education[index] = { ...education[index], [field]: value };
      return { ...prev, education };
    });
  };

  const ActiveTemplate = templates.find(t => t.id === selectedTemplate)?.component;
  const activeTemplateDescription = templates.find(t => t.id === selectedTemplate)?.description;
  const BackIcon = language === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
          <div className="mb-8 flex w-full items-start justify-between gap-4">
            <Button asChild variant="outline" className="text-primary border-primary hover:bg-primary/10 hover:text-primary" dir="ltr">
              <Link href="/#services">
                <BackIcon className="mr-2 h-4 w-4" />
                {t.backButton}
              </Link>
            </Button>
          </div>
          <div className="text-center -mt-8 mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary">
              {t.title}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.subtitle}
            </p>
          </div>


          <Card className="mb-8 overflow-hidden border-2 border-primary/20 shadow-lg">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2"><Sparkles /> {t.inputCardTitle}</CardTitle>
                <CardDescription>
                  {t.inputCardDescription}
                </CardDescription>
              </CardHeader>
            </div>
            <CardContent className="p-6 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-4">
                  <div className="relative">
                    <Textarea
                      placeholder={t.inputPlaceholder}
                      rows={15}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="text-sm h-full focus:border-primary transition-colors"
                    />
                    <Button
                      onClick={handleTranslatePrompt}
                      disabled={isTranslating || !prompt.trim()}
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2 text-xs"
                    >
                      {isTranslating ? (
                        <Loader className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      )}
                      {isTranslating ? (language === 'ar' ? 'جاري الترجمة...' : 'Translating...') : (language === 'ar' ? 'ترجمة' : 'Translate')}
                    </Button>
                  </div>
                </div>
                <div className="space-y-4 flex flex-col">
                  <div className="relative border-dashed border-2 border-primary/30 rounded-lg flex-1 flex flex-col items-center justify-center p-4 bg-primary/5 hover:bg-primary/10 transition-colors">
                    {photo ? (
                      <>
                        <Image src={photo} alt="User photo" width={100} height={100} className="rounded-full object-cover w-24 h-24 border-4 border-background shadow-md" />
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 bg-background/50 rounded-full" onClick={() => setPhoto(null)}>
                          <XCircle className="w-5 h-5 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="mx-auto h-8 w-8 text-primary/80" />
                        <p className="mt-2 text-sm">{t.uploadPhoto}</p>
                      </div>
                    )}
                  </div>
                  <Button asChild variant="outline">
                    <label className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      {t.chooseFile}
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </Button>
                </div>
              </div>

              {user && walletBalance !== null && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span className="text-sm font-medium">Wallet Balance:</span>
                  </div>
                  <span className="text-lg font-bold text-primary">{walletBalance} {priceInfo?.currency || 'EGP'}</span>
                </div>
              )}

              <div className="mt-4 flex flex-col sm:flex-row gap-2 w-full">
                <Button onClick={() => handleGenerateCv('en')} disabled={isLoading} className="flex-1" size="lg">
                  {isLoading ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? t.loadingButton : t.generateButtonEn}
                </Button>
                <Button onClick={() => handleGenerateCv('ar')} disabled={isLoading} className="flex-1" variant="secondary" size="lg">
                  {isLoading ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? t.loadingButton : t.generateButtonAr}
                </Button>
              </div>
              <p className="mt-2 text-xs text-center text-muted-foreground">
                💰 Cost: {priceInfo ? (
                  priceInfo.hasOffer && priceInfo.originalPrice ? (
                    <>
                      <span className="line-through text-muted-foreground/60">{priceInfo.originalPrice} {priceInfo.currency}</span>
                      {' '}
                      <span className="font-bold text-green-600">{priceInfo.price} {priceInfo.currency}</span>
                      {' '}
                      <span className="text-green-600">({((priceInfo.originalPrice - priceInfo.price) / priceInfo.originalPrice * 100).toFixed(0)}% OFF! 🎉)</span>
                    </>
                  ) : (
                    `${priceInfo.price} ${priceInfo.currency}`
                  )
                ) : (
                  '10 EGP'
                )} per CV generation
              </p>
            </CardContent>
          </Card>


          <div className="space-y-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">{t.loadingText}</p>
              </div>
            )}

            {cvData && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                  <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 md:grid-cols-9 h-auto p-2 gap-1 bg-muted/50">
                      {templates.map(template => (
                        <TabsTrigger key={template.id} value={template.id} className="text-xs h-auto py-2 data-[state=active]:shadow-md">{template.name}</TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  <div className="flex items-center gap-2">
                    <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(prev => !prev)} size="sm">
                      {isEditing ? (language === 'ar' ? 'إغلاق وضع التعديل' : 'Exit Edit Mode') : (language === 'ar' ? 'تفعيل وضع التعديل' : 'Edit Mode')}
                    </Button>
                  </div>
                </div>
                <Card className="mt-4 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle>{templates.find(t => t.id === selectedTemplate)?.name} {t.templateCardTitle}</CardTitle>
                    <CardDescription>{activeTemplateDescription}</CardDescription>
                  </CardHeader>
                </Card>
                {isEditing && cvData && (
                  <Card className="mt-4 border-primary/30">
                    <CardHeader>
                      <CardTitle>{language === 'ar' ? 'تحرير البيانات' : 'Edit CV Data'}</CardTitle>
                      <CardDescription>{language === 'ar' ? 'قم بتعديل الحقول مباشرة وسيتم تحديث المعاينة فوراً.' : 'Adjust fields and the preview will update immediately.'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{language === 'ar' ? 'الاسم' : 'Full Name'}</label>
                          <Textarea value={cvData.fullName} onChange={e => setCvData(prev => prev ? { ...prev, fullName: e.target.value } : prev)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{language === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}</label>
                          <Textarea value={cvData.jobTitle} onChange={e => setCvData(prev => prev ? { ...prev, jobTitle: e.target.value } : prev)} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Textarea value={cvData.contactInfo.email || ''} onChange={e => handleContactChange('email', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{language === 'ar' ? 'الهاتف' : 'Phone'}</label>
                          <Textarea value={cvData.contactInfo.phone || ''} onChange={e => handleContactChange('phone', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{language === 'ar' ? 'الموقع' : 'Location'}</label>
                          <Textarea value={cvData.contactInfo.location || ''} onChange={e => handleContactChange('location', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">LinkedIn</label>
                          <Textarea value={cvData.contactInfo.linkedin || ''} onChange={e => handleContactChange('linkedin', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">GitHub</label>
                          <Textarea value={cvData.contactInfo.github || ''} onChange={e => handleContactChange('github', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{language === 'ar' ? 'الموقع الشخصي' : 'Website'}</label>
                          <Textarea value={cvData.contactInfo.website || ''} onChange={e => handleContactChange('website', e.target.value)} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{language === 'ar' ? 'الملخص المهني' : 'Professional Summary'}</label>
                        <Textarea rows={4} value={cvData.summary} onChange={e => handleSummaryChange(e.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{language === 'ar' ? 'المهارات (مفصولة بفواصل أو أسطر)' : 'Skills (comma or newline separated)'}</label>
                        <Textarea
                          rows={3}
                          value={(cvData.skills || []).join(', ')}
                          onChange={e => handleSkillsChange(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold">{language === 'ar' ? 'الخبرات' : 'Experience'}</h4>
                        {cvData.experiences.map((exp, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 border p-3 rounded">
                            <div className="space-y-1">
                              <label className="text-xs font-medium">{language === 'ar' ? 'المسمى' : 'Title'}</label>
                              <Textarea value={exp.jobTitle} onChange={e => handleExperienceChange(idx, 'jobTitle', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium">{language === 'ar' ? 'الشركة' : 'Company'}</label>
                              <Textarea value={exp.company} onChange={e => handleExperienceChange(idx, 'company', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium">{language === 'ar' ? 'الموقع' : 'Location'}</label>
                              <Textarea value={exp.location} onChange={e => handleExperienceChange(idx, 'location', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium">{language === 'ar' ? 'التواريخ (بداية)' : 'Start Date'}</label>
                              <Textarea value={exp.startDate} onChange={e => handleExperienceChange(idx, 'startDate', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium">{language === 'ar' ? 'التواريخ (نهاية/حالي)' : 'End Date / Present'}</label>
                              <Textarea value={exp.endDate} onChange={e => handleExperienceChange(idx, 'endDate', e.target.value)} />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-xs font-medium">{language === 'ar' ? 'المسؤوليات (سطر لكل نقطة)' : 'Responsibilities (one per line)'}</label>
                              <Textarea
                                rows={3}
                                value={exp.responsibilities.join('\n')}
                                onChange={e => handleExperienceChange(idx, 'responsibilities', e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold">{language === 'ar' ? 'التعليم / الدورات' : 'Education / Courses'}</h4>
                        {cvData.education.map((edu, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 border p-3 rounded">
                            <div className="space-y-1">
                              <label className="text-xs font-medium">{language === 'ar' ? 'الدرجة/الشهادة' : 'Degree/Certificate'}</label>
                              <Textarea value={edu.degree} onChange={e => handleEducationChange(idx, 'degree', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium">{language === 'ar' ? 'التخصص' : 'Field of Study'}</label>
                              <Textarea value={edu.fieldOfStudy} onChange={e => handleEducationChange(idx, 'fieldOfStudy', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium">{language === 'ar' ? 'الجهة' : 'Institution'}</label>
                              <Textarea value={edu.institution} onChange={e => handleEducationChange(idx, 'institution', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium">{language === 'ar' ? 'سنة التخرج' : 'Graduation Year'}</label>
                              <Textarea value={edu.graduationYear} onChange={e => handleEducationChange(idx, 'graduationYear', e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div ref={cvContainerRef} className="bg-white rounded-md border shadow-lg p-4 md:p-8 min-h-[800px] mt-4">
                  {ActiveTemplate && <ActiveTemplate cvData={cvData} photo={photo} renderLanguage={renderLanguage} />}
                </div>
                <div className="mt-6 flex justify-center">
                  <Button onClick={handleDownloadPdf} disabled={isDownloading} size="lg">
                    {isDownloading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                  </Button>
                </div>
              </div>
            )}

            {!isLoading && !cvData && (
              <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-card rounded-xl border-2 border-dashed">
                <Sparkles className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">{t.placeholderTitle}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}



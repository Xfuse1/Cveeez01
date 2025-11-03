
"use client";
import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Sparkles, ArrowLeft, ArrowRight, Upload, XCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiCvBuilderFromPrompt, type AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AtsCvTemplate } from '@/components/cv-templates/AtsCvTemplate';
import { StandardCvTemplate } from '@/components/cv-templates/StandardCvTemplate';
import { BilingualCvTemplate } from '@/components/cv-templates/BilingualCvTemplate';
import { CanadianCvTemplate } from '@/components/cv-templates/CanadianCvTemplate';
import { EuropassCvTemplate } from '@/components/cv-templates/EuropassCvTemplate';
import { ProfessionalClassicTemplate } from '@/components/cv-templates/ProfessionalClassicTemplate';
import { CompactWithLinesTemplate } from '@/components/cv-templates/CompactWithLinesTemplate';
import { DetailedTimelineTemplate } from '@/components/cv-templates/DetailedTimelineTemplate';
import { ModernCategorizedTemplate } from '@/components/cv-templates/ModernCategorizedTemplate';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


type Language = 'en' | 'ar';

export default function AiCvBuilderPage() {
  const { language } = useLanguage();
  const t = translations[language].aiCvBuilderPage;

  const templates = [
    { id: 'ats', name: t.templates.ats.name, component: AtsCvTemplate, description: t.templates.ats.description },
    { id: 'standard', name: t.templates.standard.name, component: StandardCvTemplate, description: t.templates.standard.description },
    { id: 'bilingual', name: t.templates.bilingual.name, component: BilingualCvTemplate, description: t.templates.bilingual.description },
    { id: 'canadian', name: t.templates.canadian.name, component: CanadianCvTemplate, description: t.templates.canadian.description },
    { id: 'europass', name: t.templates.europass.name, component: EuropassCvTemplate, description: t.templates.europass.description },
    { id: 'classic', name: t.templates.classic.name, component: ProfessionalClassicTemplate, description: t.templates.classic.description },
    { id: 'compact', name: t.templates.compact.name, component: CompactWithLinesTemplate, description: t.templates.compact.description },
    { id: 'timeline', name: t.templates.timeline.name, component: DetailedTimelineTemplate, description: t.templates.timeline.description },
    { id: 'modern', name: t.templates.modern.name, component: ModernCategorizedTemplate, description: t.templates.modern.description },
  ];

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cvData, setCvData] = useState<AICVBuilderFromPromptOutput | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [photo, setPhoto] = useState<string | null>(null);
  const { toast } = useToast();
  const cvContainerRef = useRef<HTMLDivElement>(null);


  const handleGenerateCv = async (outputLanguage: Language) => {
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: t.toastInputRequiredTitle,
        description: t.toastInputRequiredDescription,
      });
      return;
    }
    setIsLoading(true);
    setCvData(null);
    try {
      const result = await aiCvBuilderFromPrompt({ prompt, language: outputLanguage });
      setCvData(result);
      toast({
        title: t.toastSuccessTitle,
        description: t.toastSuccessDescription,
      });
    } catch (error) {
      console.error('Error generating CV:', error);
      toast({
        variant: 'destructive',
        title: t.toastErrorTitle,
        description: t.toastErrorDescription,
      });
    }
    setIsLoading(false);
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
                            <Textarea
                                placeholder={t.inputPlaceholder}
                                rows={15}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="text-sm h-full focus:border-primary transition-colors"
                            />
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
                   </div>
                    <Card className="mt-4 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle>{templates.find(t => t.id === selectedTemplate)?.name} {t.templateCardTitle}</CardTitle>
                            <CardDescription>{activeTemplateDescription}</CardDescription>
                        </CardHeader>
                    </Card>
                  <div ref={cvContainerRef} className="bg-white rounded-md border shadow-lg p-4 md:p-8 min-h-[800px] mt-4">
                      {ActiveTemplate && <ActiveTemplate cvData={cvData} photo={photo} />}
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

    
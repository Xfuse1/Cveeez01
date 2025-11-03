
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Sparkles, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiCvBuilderFromPrompt, type AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AtsCvTemplate } from '@/components/cv-templates/AtsCvTemplate';
import { StandardCvTemplate } from '@/components/cv-templates/StandardCvTemplate';
import { BilingualCvTemplate } from '@/components/cv-templates/BilingualCvTemplate';
import { CanadianCvTemplate } from '@/components/cv-templates/CanadianCvTemplate';
import { EuropassCvTemplate } from '@/components/cv-templates/EuropassCvTemplate';

const templates = [
  { id: 'ats', name: 'ATS', component: AtsCvTemplate, description: "CV compatible with international company filtering systems." },
  { id: 'standard', name: 'Standard', component: StandardCvTemplate, description: "Simple format with image and colors to attract attention." },
  { id: 'bilingual', name: 'Bilingual', component: BilingualCvTemplate, description: "CV containing information in both Arabic and English." },
  { id: 'canadian', name: 'Canadian', component: CanadianCvTemplate, description: "Canadian format focusing on skills and experience in an organized way." },
  { id: 'europass', name: 'Europass', component: EuropassCvTemplate, description: "A format approved in Europe with a unified structure." },
];

export default function AiCvBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cvData, setCvData] = useState<AICVBuilderFromPromptOutput | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const { toast } = useToast();

  const handleGenerateCv = async () => {
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please enter your professional summary or CV details.',
      });
      return;
    }
    setIsLoading(true);
    setCvData(null);
    try {
      const result = await aiCvBuilderFromPrompt({ prompt });
      setCvData(result);
      toast({
        title: 'CV Generated!',
        description: 'Your CV has been structured by the AI.',
      });
    } catch (error) {
      console.error('Error generating CV:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate CV. Please try again.',
      });
    }
    setIsLoading(false);
  };
  
  const ActiveTemplate = templates.find(t => t.id === selectedTemplate)?.component;
  const activeTemplateDescription = templates.find(t => t.id === selectedTemplate)?.description;

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary">
              AI CV Builder
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Paste your career summary, job descriptions, or existing CV content below. Our AI will analyze, structure, and optimize it for you.
            </p>
          </div>

           <div className="text-center mb-12">
              <Button asChild variant="outline">
                <Link href="/#services">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to All Services
                </Link>
              </Button>
            </div>

            <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Your Professional Details</CardTitle>
                  <CardDescription>
                    Provide your details in one block of text. The more detail, the better the result.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="e.g., John Doe, a software engineer with 5 years of experience specializing in React... I worked at TechCorp from 2018 to 2022 where I developed..."
                    rows={15}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="text-sm"
                  />
                  <Button onClick={handleGenerateCv} disabled={isLoading} className="mt-4 w-full md:w-auto">
                    {isLoading ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? 'Analyzing...' : 'Generate with AI'}
                  </Button>
                </CardContent>
              </Card>
            
            
            <div className="space-y-8">
               {isLoading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
                  <Loader className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">AI is crafting your CV, please wait...</p>
                </div>
              )}
              
              {cvData && (
                <div>
                   <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate} className="w-full mb-4">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
                        {templates.map(template => (
                           <TabsTrigger key={template.id} value={template.id}>{template.name}</TabsTrigger>
                        ))}
                    </TabsList>
                    <Card className="mt-2">
                        <CardHeader>
                            <CardTitle>{templates.find(t => t.id === selectedTemplate)?.name} Template</CardTitle>
                            <CardDescription>{activeTemplateDescription}</CardDescription>
                        </CardHeader>
                    </Card>
                  </Tabs>
                  <div className="bg-card rounded-md border shadow-sm p-4 md:p-8 min-h-[800px] mt-4">
                      {ActiveTemplate && <ActiveTemplate cvData={cvData} />}
                  </div>
                </div>
              )}

              {!isLoading && !cvData && (
                 <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-card rounded-md border border-dashed">
                  <Sparkles className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">Your generated CV will appear here</p>
                </div>
              )}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

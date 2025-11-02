
"use client";
import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiCvBuilderFromPrompt, type AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';

export default function AiCvBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cvData, setCvData] = useState<AICVBuilderFromPromptOutput | null>(null);
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

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary">
              AI CV Builder
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Paste your career summary, job descriptions, or existing CV content below. Our AI will analyze, structure, and optimize it for you.
            </p>
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
                rows={10}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-base"
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
          
          {isLoading && (
            <div className="text-center">
              <Loader className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">AI is crafting your CV, please wait...</p>
            </div>
          )}

          {cvData && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p>{cvData.summary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cvData.experiences.map((exp, index) => (
                    <div key={index} className="prose dark:prose-invert max-w-none border-b pb-4 last:border-b-0">
                      <h3 className="font-semibold">{exp.jobTitle} at {exp.company}</h3>
                      <p className="text-sm text-muted-foreground">{exp.location} | {exp.startDate} - {exp.endDate}</p>
                      <ul className="mt-2">
                        {exp.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cvData.education.map((edu, index) => (
                    <div key={index} className="prose dark:prose-invert max-w-none">
                       <h3 className="font-semibold">{edu.degree} in {edu.fieldOfStudy}</h3>
                       <p className="text-sm text-muted-foreground">{edu.institution} | {edu.graduationYear}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {cvData.skills.map((skill, index) => (
                     <div key={index} className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-sm">
                        {skill}
                     </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

    
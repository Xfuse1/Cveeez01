
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';

interface TemplateProps {
  cvData: AICVBuilderFromPromptOutput;
}

export function BilingualCvTemplate({ cvData }: TemplateProps) {
  return (
    <div className="p-4 bg-white text-black font-sans text-sm">
        <div className="text-center p-8">
            <h2 className="text-xl font-bold">Bilingual CV Template</h2>
            <p className="text-muted-foreground">This template is under construction.</p>
        </div>
    </div>
  );
}

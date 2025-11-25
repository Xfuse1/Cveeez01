import { AtsCvTemplate } from '@/components/cv-templates/AtsCvTemplate';
import { BilingualCvTemplate } from '@/components/cv-templates/BilingualCvTemplate';
import { CanadianCvTemplate } from '@/components/cv-templates/CanadianCvTemplate';
import { CompactWithLinesTemplate } from '@/components/cv-templates/CompactWithLinesTemplate';
import { DetailedTimelineTemplate } from '@/components/cv-templates/DetailedTimelineTemplate';
import { EuropassCvTemplate } from '@/components/cv-templates/EuropassCvTemplate';
import { ModernCategorizedTemplate } from '@/components/cv-templates/ModernCategorizedTemplate';
import { ProfessionalClassicTemplate } from '@/components/cv-templates/ProfessionalClassicTemplate';
import { StandardCvTemplate } from '@/components/cv-templates/StandardCvTemplate';
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { AtsOrderedTemplate } from '@/components/cv-templates/AtsOrderedTemplate';

import { StrictAtsTemplate } from '@/components/cv-templates/StrictAtsTemplate';

export interface CvTemplateProps {
  cvData: AICVBuilderFromPromptOutput;
  photo: string | null;
  isEditing?: boolean;
  onCvDataChange?: (next: AICVBuilderFromPromptOutput) => void;
  renderLanguage?: 'en' | 'ar';
}

export interface CvTemplateDefinition {
  id:
  | 'ats'
  | 'ats-ordered'
  | 'strict-ats'
  | 'standard'
  | 'bilingual'
  | 'canadian'
  | 'europass'
  | 'classic'
  | 'compact'
  | 'timeline'
  | 'modern';
  component: (props: CvTemplateProps) => JSX.Element;
}

export const cvTemplatesRegistry: CvTemplateDefinition[] = [
  { id: 'strict-ats', component: StrictAtsTemplate }, // Best for parsing
  { id: 'ats-ordered', component: AtsOrderedTemplate }, // Good visual hierarchy
  { id: 'modern', component: ModernCategorizedTemplate }, // For creative roles
  { id: 'standard', component: StandardCvTemplate }, // Clean standard look
  // { id: 'ats', component: AtsCvTemplate }, // Redundant
  // { id: 'bilingual', component: BilingualCvTemplate }, // Specialized
  // { id: 'canadian', component: CanadianCvTemplate }, // Country specific
  // { id: 'europass', component: EuropassCvTemplate }, // Region specific
  // { id: 'classic', component: ProfessionalClassicTemplate }, // Old style
  // { id: 'compact', component: CompactWithLinesTemplate }, // Dense
  // { id: 'timeline', component: DetailedTimelineTemplate }, // Visual heavy
];

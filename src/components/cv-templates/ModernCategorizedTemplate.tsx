
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { useLanguage } from '@/contexts/language-provider';
import { Briefcase, GraduationCap, Star, Award } from 'lucide-react';

interface TemplateProps {
  cvData: AICVBuilderFromPromptOutput;
  photo: string | null;
}

const Section: React.FC<{icon: React.ElementType, title: string, children: React.ReactNode, className?: string}> = ({ icon: Icon, title, children, className }) => (
  <div className={className}>
    <div className="flex items-center gap-3 mb-3">
      <Icon className="w-5 h-5 text-primary" />
      <h2 className="text-xl font-bold uppercase tracking-wider">{title}</h2>
    </div>
    <div className="pl-8">{children}</div>
  </div>
);


export function ModernCategorizedTemplate({ cvData }: TemplateProps) {
  const { language } = useLanguage();
  const t = cvData.headings;

  const coreCompetencies = cvData.skills.slice(0, 4);
  const otherSkills = {
    "Technical": cvData.skills.filter(s => !coreCompetencies.includes(s) && ["JavaScript", "React", "Python", "SQL", "Node.js", "TypeScript"].includes(s)),
    "Soft Skills": cvData.skills.filter(s => !coreCompetencies.includes(s) && ["Leadership", "Communication", "Teamwork", "Problem Solving"].includes(s)),
  }
  const remainingSkills = cvData.skills.filter(s => !coreCompetencies.includes(s) && !otherSkills.Technical.includes(s) && !otherSkills["Soft Skills"].includes(s));
  if (remainingSkills.length > 0) {
      otherSkills.Technical = otherSkills.Technical.concat(remainingSkills);
  }


  return (
    <div className="p-8 bg-white text-gray-800 font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold">{cvData.fullName}</h1>
        <p className="text-lg text-primary mt-1">{cvData.jobTitle}</p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg text-center mb-8">
        <h2 className="font-bold text-lg mb-2">{t.summary}</h2>
        <p className="text-sm leading-relaxed max-w-3xl mx-auto">{cvData.summary}</p>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Section icon={Briefcase} title={t.experience}>
            {cvData.experiences.map((exp, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-bold text-lg">{exp.jobTitle}</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{exp.company}, {exp.location}</span>
                  <span>{exp.startDate} - {exp.endDate}</span>
                </div>
                <ul className="list-disc list-outside text-sm ml-4 space-y-1">
                  {exp.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            ))}
          </Section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Section icon={Star} title="Core Competencies">
            <div className="space-y-2">
              {coreCompetencies.map((skill, i) => (
                <p key={i} className="text-sm font-medium">{skill}</p>
              ))}
            </div>
          </Section>
          <Section icon={Award} title={t.skills}>
             {Object.entries(otherSkills).map(([category, skills]) => (
               skills.length > 0 && <div key={category} className="mb-3">
                 <h4 className="font-semibold mb-1">{category}</h4>
                 <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span key={i} className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">{skill}</span>
                    ))}
                 </div>
               </div>
             ))}
          </Section>
          <Section icon={GraduationCap} title={t.education}>
            {cvData.education.map((edu, index) => (
              <div key={index} className="text-sm">
                <h3 className="font-bold">{edu.degree}</h3>
                <p>{edu.institution}</p>
                <p className="text-gray-500">{edu.graduationYear}</p>
              </div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

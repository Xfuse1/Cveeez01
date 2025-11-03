
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

interface TemplateProps {
  cvData: AICVBuilderFromPromptOutput;
}

export function AtsCvTemplate({ cvData }: TemplateProps) {
  const { language } = useLanguage();
  const t = translations[language].cvTemplate;

  return (
    <div className="p-4 bg-white text-black font-sans text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header - No name to be more ATS friendly */}
      <div className="text-center border-b-2 border-black pb-2 mb-4">
         {/* Personal info can be added here if needed */}
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600 mb-2">{t.professionalSummary}</h2>
        <p className="text-sm leading-relaxed text-gray-800">{cvData.summary}</p>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600 mb-2">{t.skills}</h2>
        <p className="text-sm leading-relaxed text-gray-800">{cvData.skills.join(' • ')}</p>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600 mb-2">{t.workExperience}</h2>
        {cvData.experiences.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold text-base text-black">{exp.jobTitle}</h3>
              <p className="text-xs font-mono text-gray-500">{exp.startDate} - {exp.endDate}</p>
            </div>
            <p className="font-semibold text-sm text-gray-700">{exp.company} — {exp.location}</p>
            <ul className="list-disc list-outside mt-2 ml-4 space-y-1">
              {exp.responsibilities.map((resp, i) => (
                <li key={i} className="text-sm text-gray-800 leading-relaxed">{resp}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Education */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600 mb-2">{t.education}</h2>
        {cvData.education.map((edu, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-base text-black">{edu.degree}, {edu.fieldOfStudy}</h3>
                <p className="text-xs font-mono text-gray-500">{edu.graduationYear}</p>
            </div>
            <p className="font-semibold text-sm text-gray-700">{edu.institution}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

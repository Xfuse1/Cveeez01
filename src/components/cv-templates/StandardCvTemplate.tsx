
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

interface TemplateProps {
  cvData: AICVBuilderFromPromptOutput;
}

export function StandardCvTemplate({ cvData }: TemplateProps) {
  const { language } = useLanguage();
  const t = translations[language].cvTemplate;

  return (
    <div className="p-4 bg-gray-50 text-gray-800 font-serif flex gap-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-2/3">
        {/* Summary */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary border-b-2 border-primary pb-2 mb-3">{t.professionalSummary}</h2>
          <p className="text-base">{cvData.summary}</p>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary border-b-2 border-primary pb-2 mb-3">{t.workExperience}</h2>
          {cvData.experiences.map((exp, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-semibold text-lg">{exp.jobTitle}</h3>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{exp.company}, {exp.location}</span>
                <span>{exp.startDate} - {exp.endDate}</span>
              </div>
              <ul className="list-disc list-outside ml-5 space-y-1 text-sm">
                {exp.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="w-1/3 pl-6 border-l-2">
        {/* Skills */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-3">{t.skills}</h2>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, index) => (
              <span key={index} className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-xl font-bold text-primary mb-3">{t.education}</h2>
          {cvData.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-semibold text-base">{edu.degree}</h3>
              <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
              <p className="text-sm text-gray-500">{edu.institution} - {edu.graduationYear}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

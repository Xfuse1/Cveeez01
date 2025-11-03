
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

interface TemplateProps {
  cvData: AICVBuilderFromPromptOutput;
}

export function BilingualCvTemplate({ cvData }: TemplateProps) {
  const { language } = useLanguage();
  const t = translations[language].cvTemplate;

  return (
    <div className="p-8 bg-white text-gray-800 font-sans leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row gap-8">

        {/* Main Content */}
        <div className="w-full md:w-2/3">
          {/* Summary */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">{t.professionalSummary}</h2>
            <p className="text-sm">{cvData.summary}</p>
          </div>

          {/* Experience */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">{t.workExperience}</h2>
            {cvData.experiences.map((exp, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-semibold text-md text-teal-700">{exp.jobTitle}</h3>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{exp.company}, {exp.location}</span>
                  <span>{exp.startDate} - {exp.endDate}</span>
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-sm">
                  {exp.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

           {/* Education */}
          <div>
            <h2 className="text-xl font-bold text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">{t.education}</h2>
            {cvData.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <h3 className="font-semibold text-md">{edu.degree}</h3>
                 <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                <p className="text-xs text-gray-500">{edu.institution} | {edu.graduationYear}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-1/3">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-gray-700 mb-3">{t.skills}</h2>
            <div className="flex flex-col gap-2">
              {cvData.skills.map((skill, index) => (
                <div key={index} className="bg-white p-2 rounded-md text-sm shadow-sm">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

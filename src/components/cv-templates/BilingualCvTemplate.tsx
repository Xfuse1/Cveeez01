
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import Image from 'next/image';

interface TemplateProps {
  cvData: AICVBuilderFromPromptOutput;
  photo: string | null;
}

export function BilingualCvTemplate({ cvData, photo }: TemplateProps) {
  const { language } = useLanguage();
  const t = translations[language].cvTemplate;

  return (
    <div className="p-8 bg-white text-gray-800 font-sans leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
        {/* Sidebar */}
        <div className="md:col-span-1 border-r-2 border-gray-100 pr-8">
           <div className="sticky top-8">
                <div className="mb-8">
                    {photo && (
                        <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                            <Image src={photo} alt="User photo" width={128} height={128} className="object-cover w-full h-full" />
                        </div>
                    )}
                </div>
                <div className="mb-8">
                    <h3 className="text-lg font-bold uppercase text-teal-700 tracking-wider mb-3">{t.skills}</h3>
                    <div className="flex flex-col gap-2">
                    {cvData.skills.map((skill, index) => (
                        <div key={index} className="text-sm">
                        {skill}
                        </div>
                    ))}
                    </div>
                </div>
                 <div className="mb-8">
                    <h3 className="text-lg font-bold uppercase text-teal-700 tracking-wider mb-3">{t.education}</h3>
                    {cvData.education.map((edu, index) => (
                    <div key={index} className="mb-3">
                        <h4 className="font-semibold text-md">{edu.degree}</h4>
                        <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                        <p className="text-xs text-gray-500">{edu.institution} | {edu.graduationYear}</p>
                    </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          {/* Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-200 pb-2 mb-4">{t.professionalSummary}</h2>
            <p className="text-sm">{cvData.summary}</p>
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-200 pb-2 mb-4">{t.workExperience}</h2>
            {cvData.experiences.map((exp, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-lg text-teal-700">{exp.jobTitle}</h3>
                    <div className="text-xs text-gray-500 font-mono">{exp.startDate} - {exp.endDate}</div>
                </div>
                <p className="text-md text-gray-600">{exp.company}, {exp.location}</p>
                <ul className="list-disc list-outside ml-5 mt-2 space-y-1 text-sm">
                  {exp.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

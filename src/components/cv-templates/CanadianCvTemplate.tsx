
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

interface TemplateProps {
  cvData: AICVBuilderFromPromptOutput;
}

export function CanadianCvTemplate({ cvData }: TemplateProps) {
    const { language } = useLanguage();
    const t = translations[language].cvTemplate;

  return (
    <div className="p-6 bg-white text-black font-serif" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header - No name to be more ATS friendly, but can be added */}
        <div className="text-center pb-4 mb-4">
             {/* Contact info can go here */}
        </div>
      
        {/* Summary */}
        <div className="mb-6">
            <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-3 uppercase tracking-widest">{t.professionalSummary}</h2>
            <p className="text-base">{cvData.summary}</p>
        </div>

        {/* Skills */}
        <div className="mb-6">
            <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-3 uppercase tracking-widest">{t.skills}</h2>
             <ul className="columns-2 space-y-1 text-base">
                {cvData.skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                ))}
            </ul>
        </div>
      
        {/* Experience */}
        <div className="mb-6">
            <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-3 uppercase tracking-widest">{t.workExperience}</h2>
            {cvData.experiences.map((exp, index) => (
                <div key={index} className="mb-4 break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-lg">{exp.jobTitle}</h3>
                        <p className="text-base font-medium text-gray-600">{exp.startDate} – {exp.endDate}</p>
                    </div>
                    <p className="font-medium text-md text-gray-700">{exp.company}, {exp.location}</p>
                    <ul className="list-disc list-outside mt-2 ml-5 space-y-1 text-base">
                        {exp.responsibilities.map((resp, i) => (
                            <li key={i}>{resp}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
      
        {/* Education */}
        <div>
            <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-3 uppercase tracking-widest">{t.education}</h2>
            {cvData.education.map((edu, index) => (
                <div key={index} className="mb-3">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-lg">{edu.degree}, {edu.fieldOfStudy}</h3>
                        <p className="text-base font-medium text-gray-600">{edu.graduationYear}</p>
                    </div>
                    <p className="font-medium text-md text-gray-700">{edu.institution}</p>
                </div>
            ))}
        </div>
    </div>
  );
}

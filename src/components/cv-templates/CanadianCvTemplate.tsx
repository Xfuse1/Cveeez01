
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
    <div className="p-8 bg-white text-black font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header - Contact info can go here */}
        <div className="text-left pb-4 mb-4 border-b-2 border-gray-200">
            {/* <h1 className="text-4xl font-bold">Your Name</h1> */}
            {/* <p className="text-sm text-gray-600">City, Province | Phone | Email | LinkedIn</p> */}
        </div>
      
        {/* Summary */}
        <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700 mb-3">{t.professionalSummary}</h2>
            <p className="text-base leading-relaxed">{cvData.summary}</p>
        </div>

        {/* Skills */}
        <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700 mb-3">{t.skills}</h2>
             <ul className="columns-2 sm:columns-3 space-y-1 text-base">
                {cvData.skills.map((skill, index) => (
                    <li key={index} className='before:content-["•"] before:mr-2'>{skill}</li>
                ))}
            </ul>
        </div>
      
        {/* Experience */}
        <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700 mb-3">{t.workExperience}</h2>
            {cvData.experiences.map((exp, index) => (
                <div key={index} className="mb-5">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-lg">{exp.jobTitle}</h3>
                        <p className="text-sm font-medium text-gray-600">{exp.startDate} – {exp.endDate}</p>
                    </div>
                    <p className="font-medium text-md text-gray-700 italic">{exp.company}, {exp.location}</p>
                    <ul className="list-disc list-outside mt-2 ml-5 space-y-1.5 text-base leading-relaxed">
                        {exp.responsibilities.map((resp, i) => (
                            <li key={i}>{resp}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
      
        {/* Education */}
        <div>
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700 mb-3">{t.education}</h2>
            {cvData.education.map((edu, index) => (
                <div key={index} className="mb-3">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-lg">{edu.degree}, {edu.fieldOfStudy}</h3>
                        <p className="text-sm font-medium text-gray-600">{edu.graduationYear}</p>
                    </div>
                    <p className="font-medium text-md text-gray-700 italic">{edu.institution}</p>
                </div>
            ))}
        </div>
    </div>
  );
}


import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { useLanguage } from '@/contexts/language-provider';
import Image from 'next/image';

interface TemplateProps {
  cvData: AICVBuilderFromPromptOutput;
  photo: string | null;
}

export function StandardCvTemplate({ cvData, photo }: TemplateProps) {
  const { language } = useLanguage();
  const t = cvData.headings;

  return (
    <div className="p-8 bg-white text-gray-800 font-serif" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">{cvData.fullName}</h1>
            <p className="text-lg text-gray-600">{cvData.jobTitle}</p>
        </div>
      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2">
          {/* Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">{t.summary}</h2>
            <p className="text-base leading-relaxed">{cvData.summary}</p>
          </div>

          {/* Experience */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">{t.experience}</h2>
            {cvData.experiences.map((exp, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-lg text-teal-800">{exp.jobTitle}</h3>
                   <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                </div>
                <p className="font-semibold text-md text-gray-700">{exp.company}, {exp.location}</p>
                <ul className="list-disc list-outside mt-2 ml-5 space-y-1 text-base leading-relaxed">
                  {exp.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-1">
           <div className="bg-teal-50/50 p-6 rounded-lg">
                {photo && (
                    <div className="mb-6">
                        <Image src={photo} alt="User photo" width={128} height={128} className="rounded-full object-cover w-32 h-32 mx-auto" />
                    </div>
                )}
              {/* Education */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-teal-900 mb-4">{t.education}</h2>
                {cvData.education.map((edu, index) => (
                  <div key={index} className="mb-4">
                    <h3 className="font-semibold text-lg">{edu.degree}</h3>
                    <p className="text-md text-gray-700">{edu.fieldOfStudy}</p>
                    <p className="text-sm text-gray-600">{edu.institution} - {edu.graduationYear}</p>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xl font-bold text-teal-900 mb-4">{t.skills}</h2>
                <div className="flex flex-wrap gap-2">
                  {cvData.skills.map((skill, index) => (
                    <span key={index} className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

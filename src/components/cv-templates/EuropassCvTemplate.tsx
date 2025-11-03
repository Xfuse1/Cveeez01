
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { User, Briefcase, GraduationCap, Star } from 'lucide-react';

interface TemplateProps {
  cvData: AICVBuilderFromPromptOutput;
}

export function EuropassCvTemplate({ cvData }: TemplateProps) {
  const { language } = useLanguage();
  const t = translations[language].cvTemplate;

  return (
    <div className="bg-white text-black font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="border-2 border-blue-800">
            <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
                <h1 className="text-3xl font-light uppercase tracking-wider">Europass</h1>
                <div className="w-16 h-16 bg-white flex items-center justify-center">
                    <Star className="w-12 h-12 text-blue-500" />
                </div>
            </header>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-1 space-y-6 text-sm">
                   {/* Personal info placeholder */}
                    <div>
                        <h2 className="font-bold text-blue-800 uppercase mb-2">{t.professionalSummary}</h2>
                        <p className="text-gray-700">{cvData.summary}</p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="md:col-span-2 space-y-8">
                    {/* Work Experience */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Briefcase className="w-6 h-6 text-blue-800" />
                            <h2 className="text-xl font-semibold text-blue-800 uppercase tracking-wide">{t.workExperience}</h2>
                        </div>
                        {cvData.experiences.map((exp, index) => (
                            <div key={index} className="mb-4 border-l-2 border-gray-200 pl-4">
                                <p className="text-gray-500 text-xs">{exp.startDate} - {exp.endDate}</p>
                                <h3 className="font-bold">{exp.jobTitle}</h3>
                                <p className="text-gray-700">{exp.company}, {exp.location}</p>
                                <ul className="list-disc list-outside mt-1 ml-4 text-sm text-gray-600">
                                    {exp.responsibilities.map((resp, i) => (
                                        <li key={i}>{resp}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Education */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <GraduationCap className="w-6 h-6 text-blue-800" />
                            <h2 className="text-xl font-semibold text-blue-800 uppercase tracking-wide">{t.education}</h2>
                        </div>
                         {cvData.education.map((edu, index) => (
                            <div key={index} className="mb-3 border-l-2 border-gray-200 pl-4">
                                <p className="text-gray-500 text-xs">{edu.graduationYear}</p>
                                <h3 className="font-bold">{edu.degree} - {edu.fieldOfStudy}</h3>
                                <p className="text-gray-700">{edu.institution}</p>
                            </div>
                        ))}
                    </div>
                     {/* Skills */}
                    <div>
                        <h2 className="text-xl font-semibold text-blue-800 uppercase tracking-wide mb-2">{t.skills}</h2>
                        <div className="flex flex-wrap gap-2 text-sm">
                            {cvData.skills.map((skill, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
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

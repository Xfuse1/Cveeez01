
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { useLanguage } from '@/contexts/language-provider';
import { User, Briefcase, GraduationCap, Award } from 'lucide-react';
import Image from 'next/image';

interface TemplateProps {
  cvData: AICVBuilderFromPromptOutput;
  photo: string | null;
}

export function EuropassCvTemplate({ cvData, photo }: TemplateProps) {
  const { language } = useLanguage();
  const t = cvData.headings;

  const Section: React.FC<{icon: React.ElementType, title: string, children: React.ReactNode}> = ({ icon: Icon, title, children }) => (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Icon className="w-7 h-7 text-blue-700" strokeWidth={1.5}/>
        <h2 className="text-2xl font-light text-blue-700 uppercase tracking-wider border-b-2 border-blue-200 w-full pb-1">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="bg-white text-black font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="border-2 border-blue-700">
            <header className="bg-blue-700 text-white p-4 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-16 h-16 bg-white flex items-center justify-center mr-4">
                        {/* EU logo placeholder */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2.5a.5.5 0 00-1 0V4h1V2.5zM10 16a.5.5 0 00-1 0v1.5h1V16zM5.293 4.293a.5.5 0 00-.707.707L5.5 6.5l-.914-.914a.5.5 0 00-.707.707L5.5 7.914l-.914.914a.5.5 0 10.707.707L6.207 8.5l.914.914a.5.5 0 00.707-.707L6.207 7.5l.914-.914a.5.5 0 00-.707-.707L5.5 5.5l.914-.914a.5.5 0 00-.707-.707L5.293 4.293zM10 5a.5.5 0 00-1 0v1.5h1V5zm-2.086 4.414a.5.5 0 00.707-.707L6.914 7.5l.914.914a.5.5中毒-.707.707L6.914 8.5l.914.914a.5.5 0 00.707-.707L7.621 8.5l.914-.914a.5.5 0 10-.707-.707L6.914 6.793l-.914.914a.5.5 0 00.707.707zm4.172 0a.5.5 0 00-.707-.707L13.086 7.5l-.914.914a.5.5 0 00.707.707L13.086 8.5l-.914.914a.5.5中毒.707.707L13.086 9.914l.914-.914a.5.5 0 10.707.707l-.914.914.914.914a.5.5 0 00.707-.707L14.493 8.5l-.914-.914zM10 10.5a.5.5 0 00-1 0V12h1v-1.5a.5.5 0 00-1 0zM14.707 15.707a.5.5 0 00.707-.707L14.5 13.5l.914-.914a.5.5 0 00-.707-.707L13.793 13.5l-.914.914a.5.5 0 10.707.707L14.793 14.5l-.914.914a.5.5 0 00.707.707l.914-.914-.914-.914a.5.5 0 00-.707.707z"/></svg>
                    </div>
                    <h1 className="text-4xl font-light tracking-wider">Europass</h1>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-semibold">{cvData.fullName}</h2>
                    <p className="text-md">{cvData.jobTitle}</p>
                </div>
            </header>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="md:col-span-1 space-y-6 text-sm">
                   {photo && (
                       <div className='mb-4'>
                        <Image src={photo} alt="User photo" width={128} height={128} className="w-32 h-32 object-cover" />
                       </div>
                   )}
                    <Section icon={User} title={t.summary}>
                        <p className="text-gray-700 leading-relaxed">{cvData.summary}</p>
                    </Section>
                </div>

                {/* Right Column */}
                <div className="md:col-span-2">
                    <Section icon={Briefcase} title={t.experience}>
                        {cvData.experiences.map((exp, index) => (
                            <div key={index} className="mb-5 border-l-2 border-gray-200 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-1 before:w-2 before:h-2 before:bg-blue-700 before:rounded-full before:-translate-x-[5px]">
                                <p className="text-gray-500 text-xs font-medium uppercase">{exp.startDate} - {exp.endDate}</p>
                                <h3 className="font-bold text-lg">{exp.jobTitle}</h3>
                                <p className="text-gray-700 font-semibold">{exp.company}, {exp.location}</p>
                                <ul className="list-disc list-outside mt-2 ml-4 text-sm text-gray-600 space-y-1">
                                    {exp.responsibilities.map((resp, i) => (
                                        <li key={i}>{resp}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </Section>

                    <Section icon={GraduationCap} title={t.education}>
                         {cvData.education.map((edu, index) => (
                            <div key={index} className="mb-4 border-l-2 border-gray-200 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-1 before:w-2 before:h-2 before:bg-blue-700 before:rounded-full before:-translate-x-[5px]">
                                <p className="text-gray-500 text-xs font-medium uppercase">{edu.graduationYear}</p>
                                <h3 className="font-bold text-lg">{edu.degree} - {edu.fieldOfStudy}</h3>
                                <p className="text-gray-700 font-semibold">{edu.institution}</p>
                            </div>
                        ))}
                    </Section>
                    
                    <Section icon={Award} title={t.skills}>
                        <div className="flex flex-wrap gap-2 text-sm">
                            {cvData.skills.map((skill, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md shadow-sm">
                                {skill}
                              </span>
                            ))}
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    </div>
  );
}

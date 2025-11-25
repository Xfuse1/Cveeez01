
import type { CvTemplateProps } from '@/lib/cv-templates';
import { useLanguage } from '@/contexts/language-provider';

export function DetailedTimelineTemplate({ cvData }: CvTemplateProps) {
  const { language } = useLanguage();
  const t = cvData.headings;

  const technicalSkills = {
    "Languages": "JavaScript, Python, SQL",
    "Frameworks": "React, Node.js, Django",
    "Databases": "PostgreSQL, MongoDB, Redis",
    "Tools": "Docker, Git, Jenkins, AWS"
  };

  return (
    <div className="p-6 bg-white text-black font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="col-span-4 space-y-6">
          <div>
            <h2 className="font-bold text-xl mb-2">Contact</h2>
            <div className="text-sm space-y-1 text-gray-700">
                {cvData.contactInfo.email && <p>{cvData.contactInfo.email}</p>}
                {cvData.contactInfo.phone && <p>{cvData.contactInfo.phone}</p>}
                {cvData.contactInfo.linkedin && <p>{cvData.contactInfo.linkedin}</p>}
                {cvData.contactInfo.location && <p>{cvData.contactInfo.location}</p>}
            </div>
          </div>
          <div>
            <h2 className="font-bold text-xl mb-2">{t.education}</h2>
            {cvData.education.map((edu, index) => (
              <div key={index} className="text-sm mb-3">
                <p className="font-bold">{edu.degree}</p>
                <p className="text-gray-700">{edu.institution}</p>
                <p className="text-xs text-gray-500">{edu.graduationYear}</p>
              </div>
            ))}
          </div>
          <div>
            <h2 className="font-bold text-xl mb-3">{t.skills}</h2>
            <div className="space-y-3">
              {Object.entries(technicalSkills).map(([category, skills]) => (
                <div key={category} className="text-sm">
                  <p className="font-bold text-gray-800">{category}</p>
                  <p className="text-xs text-gray-600">{skills}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-8">
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold mb-1">{cvData.fullName}</h1>
            <p className="text-lg text-primary font-medium">{cvData.jobTitle}</p>
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-xl border-b-2 border-gray-200 pb-1 mb-3">{t.summary}</h2>
            <p className="text-sm leading-relaxed">{cvData.summary}</p>
          </div>

          <div>
            <h2 className="font-bold text-xl border-b-2 border-gray-200 pb-1 mb-4">{t.experience}</h2>
            <div className="relative border-l-2 border-gray-200 pl-6 space-y-8">
              {cvData.experiences.map((exp, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[34px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-white"></div>
                  <p className="text-xs font-mono text-gray-500 -mt-1 mb-1">{exp.startDate} - {exp.endDate}</p>
                  <h3 className="font-bold text-lg">{exp.jobTitle}</h3>
                  <p className="text-md text-gray-600">{exp.company}, {exp.location}</p>
                  <ul className="list-disc list-outside mt-2 ml-4 space-y-1 text-sm">
                    {exp.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

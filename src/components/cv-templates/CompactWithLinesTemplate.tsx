
import type { CvTemplateProps } from '@/lib/cv-templates';
import { useLanguage } from '@/contexts/language-provider';

const Separator = () => <hr className="my-3 border-gray-200" />;

export function CompactWithLinesTemplate({ cvData }: CvTemplateProps) {
  const { language } = useLanguage();
  const t = cvData.headings;

  // Mock projects data
  const projects = [
    { name: "AI-Powered Analytics Dashboard", description: "Developed a dashboard that reduced data processing time by 40%." },
    { name: "E-commerce Platform Migration", description: "Led the migration of a major e-commerce site, resulting in a 25% increase in conversion rates." },
  ];

  return (
    <div className="p-6 bg-white text-gray-800 font-sans text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold">{cvData.fullName}</h1>
        <p className="text-xs text-gray-500">
            {cvData.contactInfo.location}
            {cvData.contactInfo.phone && ` | ${cvData.contactInfo.phone}`}
            {cvData.contactInfo.email && ` | ${cvData.contactInfo.email}`}
        </p>
      </div>
      <Separator />

      {/* Summary */}
      <p className="text-center text-xs leading-relaxed mb-3">{cvData.summary}</p>
      <Separator />

      {/* Skills */}
      <div>
        <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-600 mb-2">{t.skills}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs">
          {(cvData.skills || []).map((skill, index) => (
            <p key={index}><span className="font-bold mr-1 text-primary">•</span>{skill}</p>
          ))}
        </div>
      </div>
      <Separator />

      {/* Work Experience */}
      <div>
        <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-600 mb-2">{t.experience}</h2>
        {cvData.experiences.map((exp, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold text-base">{exp.jobTitle} <span className="font-normal text-gray-600">at {exp.company}</span></h3>
              <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</p>
            </div>
            <ul className="list-disc list-outside mt-1 ml-4 space-y-1 text-xs">
              {exp.responsibilities.map((resp, i) => (
                <li key={i}>{resp}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Separator />

      {/* Projects */}
      <div>
        <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-600 mb-2">Projects</h2>
        {projects.map((proj, index) => (
          <div key={index} className="mb-3">
             <h3 className="font-bold text-base">{proj.name}</h3>
             <p className="text-xs">{proj.description}</p>
          </div>
        ))}
      </div>
      <Separator />

      {/* Education */}
      <div>
        <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-600 mb-2">{t.education}</h2>
        {cvData.education.map((edu, index) => (
          <div key={index} className="text-center text-xs">
            <span className="font-bold">{edu.degree}, {edu.fieldOfStudy}</span> - {edu.institution} ({edu.graduationYear})
          </div>
        ))}
      </div>
    </div>
  );
}

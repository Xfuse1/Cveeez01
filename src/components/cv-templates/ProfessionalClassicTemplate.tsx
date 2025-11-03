
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';
import { useLanguage } from '@/contexts/language-provider';

interface TemplateProps {
  cvData: AICVBuilderFromPromptOutput;
  photo: string | null;
}

export function ProfessionalClassicTemplate({ cvData }: TemplateProps) {
  const { language } = useLanguage();
  const t = cvData.headings;

  const areasOfExpertise = cvData.skills.slice(0, 6);

  return (
    <div className="p-8 bg-white text-gray-900 font-serif" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header with contact info placeholder */}
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-4xl font-bold">{cvData.fullName}</h1>
        <p className="text-sm text-gray-600 mt-2">
            {cvData.contactInfo.location}
            {cvData.contactInfo.phone && ` | ${cvData.contactInfo.phone}`}
            {cvData.contactInfo.email && ` | ${cvData.contactInfo.email}`}
            {cvData.contactInfo.linkedin && ` | ${cvData.contactInfo.linkedin}`}
        </p>
      </div>

      {/* Professional Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 mb-3">{t.summary}</h2>
        <p className="text-base leading-relaxed">{cvData.summary}</p>
      </div>

      {/* Areas of Expertise */}
      <div className="mb-6">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 mb-3">Areas of Expertise</h2>
        <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
          {areasOfExpertise.map((expertise, index) => (
            <div key={index} className="flex items-center">
              <span className="text-teal-700 mr-2">◆</span>
              <span>{expertise}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Work Experience */}
      <div className="mb-6">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 mb-3">{t.experience}</h2>
        {cvData.experiences.map((exp, index) => (
          <div key={index} className="mb-5">
            <div className="flex justify-between items-baseline">
              <h3 className="font-semibold text-xl">{exp.jobTitle}</h3>
              <p className="text-sm font-medium text-gray-600">{exp.startDate} – {exp.endDate}</p>
            </div>
            <p className="font-medium text-md text-gray-700 italic">{exp.company}, {exp.location}</p>
            <ul className="list-disc list-outside mt-2 ml-5 space-y-1.5 text-base leading-relaxed">
              {exp.responsibilities.map((resp, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: resp.replace(/(\d+%?|\$\d+k?)/g, '<strong class="font-bold text-teal-800">$1</strong>') }} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Education */}
      <div>
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 mb-3">{t.education}</h2>
        {cvData.education.map((edu, index) => (
          <div key={index} className="flex justify-between items-baseline">
            <div>
                <h3 className="font-semibold text-xl">{edu.degree}, {edu.fieldOfStudy}</h3>
                <p className="font-medium text-md text-gray-700 italic">{edu.institution}</p>
            </div>
            <p className="text-sm font-medium text-gray-600">{edu.graduationYear}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

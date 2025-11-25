
import type { CvTemplateProps } from '@/lib/cv-templates';
import { useLanguage } from '@/contexts/language-provider';
import Image from 'next/image';

export function StandardCvTemplate({ cvData, photo, renderLanguage }: CvTemplateProps) {
  const { language: ctxLang } = useLanguage();
  const language = renderLanguage || ctxLang;

  const labels =
    language === 'ar'
      ? {
        summary: 'الملخص المهني',
        coreSkills: 'المهارات الأساسية',
        experience: 'الخبرة',
        education: 'التعليم',
        certifications: 'الشهادات',
        technicalSkills: 'المهارات التقنية',
        softSkills: 'المهارات الشخصية',
        languages: 'اللغات',
        projects: 'المشاريع',
      }
      : {
        summary: 'PROFESSIONAL SUMMARY',
        coreSkills: 'CORE SKILLS',
        experience: 'EXPERIENCE',
        education: 'EDUCATION',
        certifications: 'CERTIFICATIONS',
        technicalSkills: 'TECHNICAL SKILLS',
        softSkills: 'SOFT SKILLS',
        languages: 'LANGUAGES',
        projects: 'PROJECTS',
      };

  const formatDateRange = (start?: string, end?: string) => {
    const s = start?.trim();
    const e = end?.trim();
    if (!s && !e) return '';
    if (s && e) return `${s} - ${e}`;
    return s || e || '';
  };

  const allSkills = [
    ...(cvData.coreSkills || []),
    ...(cvData.technicalSkills || []),
    ...(cvData.softSkills || []),
    ...(cvData.skills || [])
  ];

  const languageSkills = (cvData.languages || [])
    .map(l => l.name)
    .concat(
      allSkills
        .filter(skill => skill.toLowerCase().startsWith('languages:'))
        .flatMap(skill => skill.replace(/languages:/i, '').split(','))
        .map(item => item.trim())
    )
    .filter(Boolean);

  const nonLanguageSkills = allSkills.filter(skill => !skill.toLowerCase().startsWith('languages:'));

  return (
    <div className="p-8 bg-white text-gray-800 font-serif" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* 1. Full Name & 2. Job Title + Contact */}
      <header className="text-center mb-8">
        {photo && (
          <div className="mb-4 flex justify-center">
            <Image src={photo} alt="User photo" width={104} height={104} className="rounded-full object-cover w-26 h-26" />
          </div>
        )}
        <h1 className="text-4xl font-bold">{cvData.fullName}</h1>
        <p className="text-lg text-gray-600">{cvData.jobTitle}</p>
        <p className="text-sm text-gray-600 mt-2" dir="ltr">
          {[cvData.contactInfo.email, cvData.contactInfo.phone, cvData.contactInfo.location, cvData.contactInfo.linkedin, cvData.contactInfo.github, cvData.contactInfo.website]
            .filter(Boolean)
            .join(' | ')}
        </p>
      </header>

      {/* 3. Professional Summary */}
      <section className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3">{labels.summary}</h2>
        <p className="text-base leading-relaxed">{cvData.summary}</p>
      </section>

      {/* 4. Core Skills */}
      {nonLanguageSkills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3">{labels.coreSkills}</h2>
          <div className="flex flex-wrap gap-2">
            {nonLanguageSkills.map((skill, index) => (
              <span key={index} className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 5. Experience */}
      {cvData.experiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3">{labels.experience}</h2>
          {cvData.experiences.map((exp, index) => (
            <div key={index} className="mb-5">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-lg text-teal-800">{exp.jobTitle}</h3>
                {formatDateRange(exp.startDate, exp.endDate) && (
                  <p className="text-sm text-gray-500">{formatDateRange(exp.startDate, exp.endDate)}</p>
                )}
              </div>
              <p className="font-semibold text-md text-gray-700">
                {exp.company}
                {exp.location ? ` — ${exp.location}` : ''}
              </p>
              <ul className="list-disc list-outside mt-2 ml-5 space-y-1 text-base leading-relaxed">
                {exp.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* 6. Education */}
      {cvData.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3">{labels.education}</h2>
          {cvData.education.map((edu, index) => (
            <div key={index} className="mb-4 flex justify-between items-baseline">
              <div>
                <h3 className="font-semibold text-lg">{edu.degree}</h3>
                <p className="text-md text-gray-700">{edu.fieldOfStudy}</p>
                <p className="text-sm text-gray-600">{edu.institution}</p>
              </div>
              {edu.graduationYear && <p className="text-sm text-gray-500">{edu.graduationYear}</p>}
            </div>
          ))}
        </section>
      )}

      {/* 7. Certifications (none in current data model; rendered if encoded in education entries labelled as certificate) */}
      {/* 8 & 9. Technical Skills / Soft Skills (not separately provided; using core skills above per data model) */}

      {/* 10. Languages */}
      {languageSkills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3">{labels.languages}</h2>
          <ul className="list-disc list-outside ml-5 space-y-1 text-base leading-relaxed">
            {languageSkills.map((lang, idx) => (
              <li key={idx}>{lang}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 11. Projects (not provided in current data) */}
      {/* 12. Additional Sections (only if provided; none in current data) */}
    </div>
  );
}

import type { CvTemplateProps } from '@/lib/cv-templates';
import { useLanguage } from '@/contexts/language-provider';
import Link from 'next/link';
import { Mail, Phone, Linkedin, MapPin, Globe, Github } from 'lucide-react';

export function AtsOrderedTemplate({ cvData, photo, renderLanguage }: CvTemplateProps) {
  const { language: ctxLang } = useLanguage();
  const language = renderLanguage || ctxLang;
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const isArabic = (text: string | undefined) => !!text && /[\u0600-\u06FF]/.test(text);
  const isLatin = (text: string | undefined) => !!text && /[A-Za-z]/.test(text);
  const matchesTarget = (text: string | undefined) => {
    if (!text) return false;
    return language === 'en' ? !isArabic(text) : !isLatin(text);
  };
  const filterList = (items: string[]) => items.filter(matchesTarget);

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

  const skillsSource = (cvData.coreSkills?.length ? cvData.coreSkills : cvData.skills || []).map(s => s || '');
  const languageSkills = filterList(
    cvData.languages?.map(lang => `${lang.name}${lang.proficiency ? ` (${lang.proficiency})` : ''}`) || []
  );
  const coreSkills = filterList(skillsSource);
  const technicalSkills = filterList(cvData.technicalSkills || []);
  const softSkills = filterList(cvData.softSkills || []);

  // Split education into education vs certifications if labeled as certificate/course
  const educations = cvData.education.filter(
    edu => !/^certificate|course/i.test(edu.degree || '')
  );

  const educationCerts = cvData.education
    .filter(edu => /^certificate|course/i.test(edu.degree || ''))
    .map(edu => ({
      name: edu.degree,
      issuer: edu.institution,
      year: edu.graduationYear
    }));

  const certifications = [...(cvData.certifications || []), ...educationCerts];

  return (
    <div className="p-8 bg-white text-gray-900 font-sans text-base" dir={dir}>
      {/* 1-2: Name & Title + Contact */}
      <header className="mb-8 border-b-2 border-gray-800 pb-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold uppercase tracking-wide mb-2">{cvData.fullName}</h1>
          <p className="text-xl text-gray-700 font-medium mb-4">{cvData.jobTitle}</p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600" dir="ltr">
            {cvData.contactInfo.location && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{cvData.contactInfo.location}</span>
              </div>
            )}
            {cvData.contactInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone size={14} />
                <span>{cvData.contactInfo.phone}</span>
              </div>
            )}
            {cvData.contactInfo.email && (
              <div className="flex items-center gap-1">
                <Mail size={14} />
                <span>{cvData.contactInfo.email}</span>
              </div>
            )}
            {cvData.contactInfo.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin size={14} />
                <Link href={cvData.contactInfo.linkedin} className="hover:text-primary hover:underline" target="_blank">
                  LinkedIn
                </Link>
              </div>
            )}
            {cvData.contactInfo.github && (
              <div className="flex items-center gap-1">
                <Github size={14} />
                <Link href={cvData.contactInfo.github} className="hover:text-primary hover:underline" target="_blank">
                  GitHub
                </Link>
              </div>
            )}
            {cvData.contactInfo.website && (
              <div className="flex items-center gap-1">
                <Globe size={14} />
                <Link href={cvData.contactInfo.website} className="hover:text-primary hover:underline" target="_blank">
                  Portfolio
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3: Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 tracking-wider">{labels.summary}</h2>
        {matchesTarget(cvData.summary) && <p className="leading-relaxed text-justify">{cvData.summary}</p>}
      </section>

      {/* 5: Experience */}
      {cvData.experiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-1 mb-4 tracking-wider">{labels.experience}</h2>
          {cvData.experiences.map((exp, idx) => (
            <div key={idx} className="mb-5 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-lg">{matchesTarget(exp.jobTitle) ? exp.jobTitle : ''}</h3>
                {formatDateRange(exp.startDate, exp.endDate) && (
                  <span className="text-sm font-medium text-gray-600 whitespace-nowrap ml-4">
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </span>
                )}
              </div>
              <div className="text-gray-700 font-medium mb-2">
                {matchesTarget(exp.company) ? exp.company : ''}
                {matchesTarget(exp.location) && exp.location ? ` — ${exp.location}` : ''}
              </div>
              <ul className="list-disc list-outside ml-5 space-y-1.5 text-sm leading-relaxed text-gray-800">
                {filterList(exp.responsibilities).map((resp, i) => (
                  <li key={i} className="pl-1">{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* 4: Education */}
      {educations.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 tracking-wider">{labels.education}</h2>
          {educations.map((edu, idx) => (
            <div key={idx} className="mb-3 flex justify-between items-baseline">
              <div>
                <p className="font-bold text-base">{matchesTarget(edu.degree) ? edu.degree : edu.degree}</p>
                <p className="text-sm text-gray-700 font-medium">{matchesTarget(edu.institution) ? edu.institution : edu.institution}</p>
                <p className="text-sm text-gray-600">{matchesTarget(edu.fieldOfStudy) ? edu.fieldOfStudy : edu.fieldOfStudy}</p>
              </div>
              {edu.graduationYear && <span className="text-sm font-medium text-gray-600">{edu.graduationYear}</span>}
            </div>
          ))}
        </section>
      )}

      {/* 11: Projects */}
      {cvData.projects?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-1 mb-4 tracking-wider">{labels.projects}</h2>
          {cvData.projects.map((proj, idx) => (
            <div key={idx} className="mb-4 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-base">{proj.name}</h3>
                {proj.link && (
                  <Link href={proj.link} target="_blank" className="text-sm text-primary hover:underline flex items-center gap-1">
                    <Globe size={12} />
                    Link
                  </Link>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* 7: Core Skills - Grid Layout */}
      {coreSkills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 tracking-wider">{labels.coreSkills}</h2>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
            {coreSkills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-800 rounded-full flex-shrink-0"></span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8: Technical Skills - Grid Layout */}
      {technicalSkills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 tracking-wider">{labels.technicalSkills}</h2>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
            {technicalSkills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-800 rounded-full flex-shrink-0"></span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4: Education */}
      {educations.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 tracking-wider">{labels.education}</h2>
          {educations.map((edu, idx) => (
            <div key={idx} className="mb-3 flex justify-between items-baseline">
              <div>
                <p className="font-bold text-base">{matchesTarget(edu.degree) ? edu.degree : edu.degree}</p>
                <p className="text-sm text-gray-700 font-medium">{matchesTarget(edu.institution) ? edu.institution : edu.institution}</p>
                <p className="text-sm text-gray-600">{matchesTarget(edu.fieldOfStudy) ? edu.fieldOfStudy : edu.fieldOfStudy}</p>
              </div>
              {edu.graduationYear && <span className="text-sm font-medium text-gray-600">{edu.graduationYear}</span>}
            </div>
          ))}
        </section>
      )}

      {/* 6: Certifications */}
      {certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 tracking-wider">{labels.certifications}</h2>
          {certifications.map((cert, idx) => (
            <div key={idx} className="mb-2 flex justify-between items-baseline">
              <p className="font-semibold text-sm">{cert.name}</p>
              <p className="text-sm text-gray-600">{[cert.issuer, cert.year].filter(Boolean).join(' • ')}</p>
            </div>
          ))}
        </section>
      )}

      {/* 10: Languages */}
      {languageSkills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 tracking-wider">{labels.languages}</h2>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
            {languageSkills.map((lang, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-800 rounded-full flex-shrink-0"></span>
                <span>{lang}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9: Soft Skills */}
      {softSkills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 tracking-wider">{labels.softSkills}</h2>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
            {softSkills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-800 rounded-full flex-shrink-0"></span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 12: Additional Sections */}
      {cvData.additionalSections?.length ? (
        cvData.additionalSections.map((section, idx) => (
          <section key={idx} className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 pb-1 mb-3 tracking-wider">{section.title}</h2>
            <ul className="list-disc list-outside ml-5 space-y-1 text-sm leading-relaxed">
              {section.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        ))
      ) : null}
    </div>
  );
}

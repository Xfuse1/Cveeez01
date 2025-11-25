import type { CvTemplateProps } from '@/lib/cv-templates';
import { useLanguage } from '@/contexts/language-provider';

export function StrictAtsTemplate({ cvData, renderLanguage }: CvTemplateProps) {
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
        <div className="p-8 bg-white text-black font-sans text-base leading-normal" dir={dir}>
            {/* Header: Name & Contact Info - Plain Text, Centered */}
            <header className="text-center mb-6">
                <h1 className="text-2xl font-bold uppercase mb-2">{cvData.fullName}</h1>
                <div className="text-sm text-gray-800">
                    {[
                        cvData.contactInfo.location,
                        cvData.contactInfo.phone,
                        cvData.contactInfo.email,
                        cvData.contactInfo.linkedin,
                        cvData.contactInfo.github,
                        cvData.contactInfo.website
                    ].filter(Boolean).join(' | ')}
                </div>
            </header>

            {/* Summary */}
            <section className="mb-6">
                <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">{labels.summary}</h2>
                {matchesTarget(cvData.summary) && <p className="text-sm text-justify">{cvData.summary}</p>}
            </section>

            {/* Experience */}
            {cvData.experiences.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">{labels.experience}</h2>
                    {cvData.experiences.map((exp, idx) => (
                        <div key={idx} className="mb-4 last:mb-0">
                            <div className="flex justify-between items-baseline font-bold text-sm">
                                <span>{matchesTarget(exp.jobTitle) ? exp.jobTitle : ''}</span>
                                <span>{formatDateRange(exp.startDate, exp.endDate)}</span>
                            </div>
                            <div className="text-sm italic mb-1">
                                {matchesTarget(exp.company) ? exp.company : ''}
                                {matchesTarget(exp.location) && exp.location ? `, ${exp.location}` : ''}
                            </div>
                            <ul className="list-disc list-outside ml-5 space-y-1 text-sm">
                                {filterList(exp.responsibilities).map((resp, i) => (
                                    <li key={i}>{resp}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            )}

            {/* Projects */}
            {cvData.projects?.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">{labels.projects}</h2>
                    {cvData.projects.map((proj, idx) => (
                        <div key={idx} className="mb-3 last:mb-0">
                            <div className="flex justify-between items-baseline font-bold text-sm">
                                <span>{proj.name}</span>
                                {proj.link && <span className="font-normal text-xs">{proj.link}</span>}
                            </div>
                            <p className="text-sm">{proj.description}</p>
                        </div>
                    ))}
                </section>
            )}

            {/* Education */}
            {educations.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">{labels.education}</h2>
                    {educations.map((edu, idx) => (
                        <div key={idx} className="mb-2 flex justify-between items-baseline text-sm">
                            <div>
                                <span className="font-bold">{matchesTarget(edu.institution) ? edu.institution : edu.institution}</span>
                                <span> — </span>
                                <span className="italic">{matchesTarget(edu.degree) ? edu.degree : edu.degree}</span>
                                {edu.fieldOfStudy && <span>, {matchesTarget(edu.fieldOfStudy) ? edu.fieldOfStudy : edu.fieldOfStudy}</span>}
                            </div>
                            {edu.graduationYear && <span>{edu.graduationYear}</span>}
                        </div>
                    ))}
                </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">{labels.certifications}</h2>
                    {certifications.map((cert, idx) => (
                        <div key={idx} className="mb-1 flex justify-between items-baseline text-sm">
                            <span className="font-bold">{cert.name}</span>
                            <span>{[cert.issuer, cert.year].filter(Boolean).join(', ')}</span>
                        </div>
                    ))}
                </section>
            )}

            {/* Skills - Categorized, Comma Separated */}
            {(coreSkills.length > 0 || technicalSkills.length > 0 || softSkills.length > 0) && (
                <section className="mb-6">
                    <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">{labels.coreSkills}</h2>
                    <div className="text-sm space-y-2">
                        {technicalSkills.length > 0 && (
                            <div>
                                <span className="font-bold">{labels.technicalSkills}: </span>
                                <span>{technicalSkills.join(', ')}</span>
                            </div>
                        )}
                        {coreSkills.length > 0 && (
                            <div>
                                <span className="font-bold">{labels.coreSkills}: </span>
                                <span>{coreSkills.join(', ')}</span>
                            </div>
                        )}
                        {softSkills.length > 0 && (
                            <div>
                                <span className="font-bold">{labels.softSkills}: </span>
                                <span>{softSkills.join(', ')}</span>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Languages */}
            {languageSkills.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">{labels.languages}</h2>
                    <p className="text-sm">{languageSkills.join(', ')}</p>
                </section>
            )}

            {/* Additional Sections */}
            {cvData.additionalSections?.length ? (
                cvData.additionalSections.map((section, idx) => (
                    <section key={idx} className="mb-6">
                        <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">{section.title}</h2>
                        <ul className="list-disc list-outside ml-5 space-y-1 text-sm">
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

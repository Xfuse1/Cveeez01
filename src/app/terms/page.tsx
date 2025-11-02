"use client";
import { PolicyLayout } from '@/components/layout/policy-layout';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

export default function TermsAndConditionsPage() {
  const { language } = useLanguage();
  const t = translations[language].termsPage;

  const sections = Object.values(t.sections).map(section => ({
    title: section.title,
    content: section.content,
  }));

  return <PolicyLayout title={t.title} sections={sections} />;
}

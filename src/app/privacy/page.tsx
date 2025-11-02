"use client";
import { PolicyLayout } from '@/components/layout/policy-layout';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const t = translations[language].privacyPage;

  const sections = Object.values(t.sections).map(section => ({
    title: section.title,
    content: section.content,
  }));

  return <PolicyLayout title={t.title} sections={sections} />;
}

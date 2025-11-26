import { useCallback } from 'react';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

type Lang = 'en' | 'ar';

function getNested(obj: any, path: string) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export default function useTranslations() {
  const { language, setLanguage } = useLanguage();

  const t = useCallback(
    (key: string, fallback?: string) => {
      const lang = (language as Lang) || 'en';
      const value = getNested((translations as any)[lang], key);
      if (value === undefined || value === null) return fallback ?? key;
      return value;
    },
    [language]
  );

  return { t, language, setLanguage };
}

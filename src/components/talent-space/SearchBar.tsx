'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

interface SearchBarProps {
  onSearch: (query: string) => void;
  value: string;
}

export function SearchBar({ onSearch, value }: SearchBarProps) {
  const { language } = useLanguage();
  const t = translations[language].talentSpace;

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={t.search.placeholder}
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

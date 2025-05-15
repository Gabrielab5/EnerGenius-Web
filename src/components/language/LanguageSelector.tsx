
import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage, Language } from '@/contexts/LanguageContext';

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { label: string, value: Language }[] = [
    { label: t('language.english'), value: 'en' },
    { label: t('language.hebrew'), value: 'he' },
    { label: t('language.russian'), value: 'ru' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex gap-2 items-center">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline">{t('language.select')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => setLanguage(lang.value)}
            className={language === lang.value ? 'bg-accent/50' : ''}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

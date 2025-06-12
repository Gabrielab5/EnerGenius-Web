import { Language, LanguageConfig } from '@/types/language';

export const languageConfigs: Record<Language, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
  },
  he: {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
    direction: 'rtl',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    direction: 'ltr',
  },
};

export const getInitialLanguage = (): Language => {
  // Check stored preference first
  const stored = localStorage.getItem('preferred-language') as Language;
  if (stored && languageConfigs[stored]) {
    console.log(`Found stored language preference: ${stored}`);
    return stored;
  }

  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  console.log(`Browser language detected: ${browserLang}`);
  
  if (browserLang.startsWith('he')) {
    console.log('Setting language to Hebrew based on browser locale');
    return 'he';
  }
  
  if (browserLang.startsWith('ru')) {
    console.log('Setting language to Russian based on browser locale');
    return 'ru';
  }
  
  console.log('Defaulting to English');
  return 'en';
};

export const storeLanguagePreference = (language: Language): void => {
  localStorage.setItem('preferred-language', language);
  console.log(`Stored language preference: ${language}`);
};

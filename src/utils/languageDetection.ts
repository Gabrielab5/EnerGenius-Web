import { Language } from '@/types/language';

export const languageConfigs = {
  en: {
    code: 'en' as Language,
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr' as const,
  },
  he: {
    code: 'he' as Language,
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
    direction: 'rtl' as const,
  },
  ru: {
    code: 'ru' as Language,
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    direction: 'ltr' as const,
  },
};

export const getInitialLanguage = (): Language => {
  // Check localStorage first
  const stored = localStorage.getItem('preferred-language') as Language;
  if (stored && Object.keys(languageConfigs).includes(stored)) {
    console.log(`Using stored language preference: ${stored}`);
    return stored;
  }

  // Detect from browser
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
};


export const languageConfigs: Record<Language, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    flag: '🇺🇸'
  },
  he: {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    direction: 'rtl',
    flag: '🇮🇱'
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    flag: '🇷🇺'
  }
};

export const getInitialLanguage = (): Language => {
  // Check for stored preference first
  const stored = localStorage.getItem('energenius-language') as Language;
  if (stored && Object.keys(languageConfigs).includes(stored)) {
    console.log(`Using stored language: ${stored}`);
    return stored;
  }

  // Fall back to browser language detection
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('he')) {
    console.log('Detected Hebrew browser language');
    return 'he';
  }
  
  if (browserLang.startsWith('ru')) {
    console.log('Detected Russian browser language');
    return 'ru';
  }
  
  console.log('Defaulting to English');
  return 'en';
};

export const storeLanguagePreference = (language: Language): void => {
  localStorage.setItem('energenius-language', language);
  console.log(`Stored language preference: ${language}`);
};

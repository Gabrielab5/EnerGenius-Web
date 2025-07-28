import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';

// Define available languages
export type Language = 'en' | 'he' | 'ru';

// Define language direction
export type Direction = 'ltr' | 'rtl';

// Language metadata
export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  direction: Direction;
}

// Context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, any>) => string;
  direction: Direction;
  isRTL: boolean;
  availableLanguages: LanguageInfo[];
  isLoading: boolean;
}

// Language configurations
const languageConfigs: Record<Language, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
  },
  he: {
    code: 'he', 
    name: 'Hebrew',
    nativeName: 'עברית',
    direction: 'rtl',
  },
  ru: {
    code: 'ru',
    name: 'Russian', 
    nativeName: 'Русский',
    direction: 'ltr',
  },
};

// Storage keys
const LANGUAGE_STORAGE_KEY = 'energenius_language';
const LANGUAGE_PREFERENCE_KEY = 'energenius_language_preference';

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n, t } = useTranslation();
  
  // Initialize language immediately from localStorage
  const getInitialLanguage = (): Language => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    return (storedLanguage && Object.keys(languageConfigs).includes(storedLanguage)) 
      ? storedLanguage 
      : (i18n.language as Language || 'en');
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize language on mount if different from stored
  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (storedLanguage && storedLanguage !== language && Object.keys(languageConfigs).includes(storedLanguage)) {
      handleSetLanguage(storedLanguage);
    }
  }, []);

  // Update document and body classes for language/direction
  const updateDocumentLanguage = (lang: Language) => {
    const config = languageConfigs[lang];
    document.documentElement.dir = config.direction;
    document.documentElement.lang = lang;
    document.body.classList.remove('rtl', 'ltr');
    document.body.classList.add(config.direction);
  };

  // Update language and store preference
  const handleSetLanguage = async (lang: Language) => {
    if (lang === language) return;
    
    setLanguageState(lang);
    await i18n.changeLanguage(lang);
    updateDocumentLanguage(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, lang);
  };

  const currentConfig = languageConfigs[language];

  const contextValue = {
    language,
    setLanguage: handleSetLanguage,
    t,
    direction: currentConfig.direction,
    isRTL: currentConfig.direction === 'rtl',
    availableLanguages: Object.values(languageConfigs),
    isLoading
  };

  // Remove loading screen - language loads instantly now

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Hook for RTL-aware styles
export const useRTLStyles = () => {
  const { isRTL } = useLanguage();
  
  return {
    textAlign: isRTL ? 'right' : 'left',
    direction: isRTL ? 'rtl' : 'ltr',
    marginLeft: (value: string) => isRTL ? undefined : value,
    marginRight: (value: string) => isRTL ? value : undefined,
    paddingLeft: (value: string) => isRTL ? undefined : value,
    paddingRight: (value: string) => isRTL ? value : undefined,
  };
};

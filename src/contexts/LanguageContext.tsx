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

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
// Centralized language detection logic - single source of truth
export const getInitialLanguage = (): Language => {
  try {
    // Check localStorage first
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
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
  } catch (error) {
    console.error('Error detecting language, defaulting to English:', error);
    return 'en';
  }
};

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n, t } = useTranslation();

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize language on mount if different from stored
  useEffect(() => {
      const initialLang = getInitialLanguage();
    if (initialLang !== language) {
      handleSetLanguage(initialLang);
    } else {
      // Ensure document properties are set correctly even if language doesn't change
      updateDocumentLanguage(language);
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

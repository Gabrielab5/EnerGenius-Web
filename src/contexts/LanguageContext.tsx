
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { enTranslations } from '@/translations/en';
import { heTranslations } from '@/translations/he';
import { ruTranslations } from '@/translations/ru';

// Define available languages
export type Language = 'en' | 'he' | 'ru';

// Define language direction
export type Direction = 'ltr' | 'rtl';

// Language metadata
interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  direction: Direction;
}

// Context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  direction: Direction;
  isRTL: boolean;
  availableLanguages: LanguageInfo[];
  isLoading: boolean;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations object
const translations: Record<Language, Record<string, string>> = {
  en: enTranslations,
  he: heTranslations,
  ru: ruTranslations,
};

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

// Detect browser language
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  return (Object.keys(languageConfigs) as Language[]).includes(browserLang as Language) 
    ? (browserLang as Language) 
    : 'en';
};

// Get initial language
const getInitialLanguage = (): Language => {
  // First check localStorage
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (storedLanguage && Object.keys(languageConfigs).includes(storedLanguage)) {
    return storedLanguage as Language;
  }
  
  // Then check user preference (could be from backend/profile)
  const userPreference = localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
  if (userPreference && Object.keys(languageConfigs).includes(userPreference)) {
    return userPreference as Language;
  }
  
  // Finally fallback to browser detection or English
  return detectBrowserLanguage();
};

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language on mount
  useEffect(() => {
    const initialLanguage = getInitialLanguage();
    setLanguage(initialLanguage);
    updateDocumentLanguage(initialLanguage);
    setIsLoading(false);
  }, []);

  // Update document and body classes for language/direction
  const updateDocumentLanguage = (lang: Language) => {
    const config = languageConfigs[lang];
    
    // Update document attributes
    document.documentElement.dir = config.direction;
    document.documentElement.lang = lang;
    
    // Update body classes for styling
    document.body.classList.remove('rtl', 'ltr');
    document.body.classList.add(config.direction);
    
    // Store language preference
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    
    console.log(`Language set to: ${config.nativeName} (${lang}) - Direction: ${config.direction}`);
  };

  // Update language and store preference
  const handleSetLanguage = (lang: Language) => {
    if (lang === language) return;
    
    setLanguage(lang);
    updateDocumentLanguage(lang);
    
    // Also store as user preference
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, lang);
  };

  // Enhanced translation function with fallback
  const t = (key: string, fallback?: string): string => {
    const translation = translations[language]?.[key];
    
    if (translation) {
      return translation;
    }
    
    // Fallback to English
    const englishFallback = translations.en[key];
    if (englishFallback) {
      console.warn(`Translation missing for key "${key}" in language "${language}", using English fallback`);
      return englishFallback;
    }
    
    // Use provided fallback or return the key itself
    if (fallback) {
      console.warn(`Translation missing for key "${key}", using provided fallback: "${fallback}"`);
      return fallback;
    }
    
    console.error(`Translation missing for key "${key}" in all languages`);
    return key;
  };

  const currentConfig = languageConfigs[language];

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: handleSetLanguage, 
        t,
        direction: currentConfig.direction,
        isRTL: currentConfig.direction === 'rtl',
        availableLanguages: Object.values(languageConfigs),
        isLoading
      }}
    >
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
    left: (value: string) => isRTL ? undefined : value,
    right: (value: string) => isRTL ? value : undefined,
  };
};
export type Language = 'en' | 'he' | 'ru';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => string;
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
  availableLanguages: LanguageConfig[];
  isLoading: boolean;
}
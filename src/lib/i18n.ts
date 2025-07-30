import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { enTranslations } from '@/translations/en';
import { heTranslations } from '@/translations/he';
import { ruTranslations } from '@/translations/ru';
import { getInitialLanguage } from '@/contexts/LanguageContext';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      he: {
        translation: heTranslations,
      },
      ru: {
        translation: ruTranslations,
      },
    },
    lng: getInitialLanguage(), 
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 
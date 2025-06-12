import { Language } from '@/types/language';
import { languageConfigs } from './languageDetection';

export const updateDocumentLanguage = (language: Language): void => {
  const config = languageConfigs[language];
  
  // Update document direction
  document.documentElement.dir = config.direction;
  console.log(`Document direction: ${config.direction}`);
  
  // Update document language
  document.documentElement.lang = language;
  console.log(`Document language: ${language}`);
  
  // Update language in the body class for CSS targeting
  document.body.className = document.body.className.replace(/lang-\w+/, '');
  document.body.classList.add(`lang-${language}`);
  
  console.log(`Language set to: ${config.nativeName} (${language}) - Direction: ${config.direction}`);
};

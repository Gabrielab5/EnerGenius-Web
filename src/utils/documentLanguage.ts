
import { Language } from '@/types/language';

export const updateDocumentLanguage = (language: Language): void => {
  const direction = language === 'he' ? 'rtl' : 'ltr';
  
  // Update document attributes
  document.documentElement.lang = language;
  document.documentElement.dir = direction;
  
  // Update body class for any language-specific styling
  document.body.className = document.body.className
    .replace(/\blang-\w+\b/g, '')
    .replace(/\bdir-\w+\b/g, '');
  
  document.body.classList.add(`lang-${language}`, `dir-${direction}`);
  
  console.log(`Updated document language to ${language} with direction ${direction}`);
};

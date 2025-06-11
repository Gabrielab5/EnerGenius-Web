
import { describe, it, expect } from 'vitest';
import { enTranslations } from '@/translations/en';
import { heTranslations } from '@/translations/he';
import { ruTranslations } from '@/translations/ru';

describe('Translation Coverage', () => {
  const enKeys = Object.keys(enTranslations);
  const heKeys = Object.keys(heTranslations);
  const ruKeys = Object.keys(ruTranslations);

  it('should have same number of keys in all languages', () => {
    expect(heKeys.length).toBe(enKeys.length);
    expect(ruKeys.length).toBe(enKeys.length);
  });

  it('should have all English keys in Hebrew translations', () => {
    const missingHeKeys = enKeys.filter(key => !heKeys.includes(key));
    expect(missingHeKeys).toEqual([]);
  });

  it('should have all English keys in Russian translations', () => {
    const missingRuKeys = enKeys.filter(key => !ruKeys.includes(key));
    expect(missingRuKeys).toEqual([]);
  });

  it('should not have extra keys in Hebrew translations', () => {
    const extraHeKeys = heKeys.filter(key => !enKeys.includes(key));
    expect(extraHeKeys).toEqual([]);
  });

  it('should not have extra keys in Russian translations', () => {
    const extraRuKeys = ruKeys.filter(key => !enKeys.includes(key));
    expect(extraRuKeys).toEqual([]);
  });

  it('should have no empty translation values in any language', () => {
    Object.values(enTranslations).forEach(value => {
      expect(value.trim()).not.toBe('');
    });
    
    Object.values(heTranslations).forEach(value => {
      expect(value.trim()).not.toBe('');
    });
    
    Object.values(ruTranslations).forEach(value => {
      expect(value.trim()).not.toBe('');
    });
  });

  it('should contain required namespaces', () => {
    const requiredNamespaces = [
      'settings.',
      'upload.',
      'analytics.',
      'dashboard.',
      'common.',
      'auth.',
      'home.',
      'navigation.'
    ];

    requiredNamespaces.forEach(namespace => {
      const hasNamespace = enKeys.some(key => key.startsWith(namespace));
      expect(hasNamespace).toBe(true);
    });
  });
});

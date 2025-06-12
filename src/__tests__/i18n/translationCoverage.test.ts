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
      'navigation.',
      'onboarding.',
      'devices.',
      'loading.',
      'notifications.',
      'charts.',
      'forecast.',
      'legal.',
      'language.'
    ];

    requiredNamespaces.forEach(namespace => {
      const hasNamespace = enKeys.some(key => key.startsWith(namespace));
      expect(hasNamespace).toBe(true);
    });
  });

  it('should have consistent translation structure across languages', () => {
    // Check that all translation objects have the same structure
    const enStructure = JSON.stringify(Object.keys(enTranslations).sort());
    const heStructure = JSON.stringify(Object.keys(heTranslations).sort());
    const ruStructure = JSON.stringify(Object.keys(ruTranslations).sort());

    expect(heStructure).toBe(enStructure);
    expect(ruStructure).toBe(enStructure);
  });

  it('should have proper device-related translations', () => {
    const deviceKeys = enKeys.filter(key => key.includes('device'));
    expect(deviceKeys.length).toBeGreaterThan(0);
    
    // Ensure all device keys exist in all languages
    deviceKeys.forEach(key => {
      expect(heTranslations[key]).toBeDefined();
      expect(ruTranslations[key]).toBeDefined();
    });
  });

  it('should have proper settings-related translations', () => {
    const settingsKeys = enKeys.filter(key => key.startsWith('settings.'));
    expect(settingsKeys.length).toBeGreaterThan(0);
    
    // Ensure all settings keys exist in all languages
    settingsKeys.forEach(key => {
      expect(heTranslations[key]).toBeDefined();
      expect(ruTranslations[key]).toBeDefined();
    });
  });
});

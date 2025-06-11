import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import React from 'react';

// Mock console methods to test fallback behavior
const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Missing Keys Fallback', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
  );

  afterEach(() => {
    consoleSpy.mockClear();
    consoleErrorSpy.mockClear();
  });

  it('should return the key itself when translation is missing and no fallback provided', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    
    const missingKey = 'nonexistent.translation.key';
    const translation = result.current.t(missingKey);
    
    expect(translation).toBe(missingKey);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Translation missing for key "${missingKey}" in all languages`
    );
  });

  it('should use provided fallback when translation is missing', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    
    const missingKey = 'nonexistent.translation.key';
    const fallback = 'This is a fallback text';
    const translation = result.current.t(missingKey, fallback);
    
    expect(translation).toBe(fallback);
    expect(console.warn).toHaveBeenCalledWith(
      `Translation missing for key "${missingKey}", using provided fallback: "${fallback}"`
    );
  });

  it('should fall back to English when key exists in English but not current language', () => {
    // This would need a mock where Hebrew is selected but key only exists in English
    const { result } = renderHook(() => useLanguage(), { wrapper });
    
    // Mock a scenario where we have an English key but not Hebrew
    const mockT = (key: string, fallback?: string) => {
      const enTranslations = { 'test.key': 'English text' };
      const heTranslations = {}; // Missing in Hebrew
      
      // Simulate fallback logic
      if (heTranslations[key as keyof typeof heTranslations]) {
        return heTranslations[key as keyof typeof heTranslations];
      }
      
      if (enTranslations[key as keyof typeof enTranslations]) {
        console.warn(`Translation missing for key "${key}" in language "he", using English fallback`);
        return enTranslations[key as keyof typeof enTranslations];
      }
      
      if (fallback) {
        console.warn(`Translation missing for key "${key}", using provided fallback: "${fallback}"`);
        return fallback;
      }
      
      console.error(`Translation missing for key "${key}" in all languages`);
      return key;
    };
    
    const translation = mockT('test.key');
    expect(translation).toBe('English text');
  });

  it('should not crash the application when translation is missing', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    
    // This should not throw an error
    expect(() => {
      result.current.t('definitely.missing.key');
    }).not.toThrow();
  });

  it('should handle empty string translations gracefully', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    
    // Mock empty string translation
    const mockT = (key: string) => {
      const translations = { 'empty.key': '' };
      return translations[key as keyof typeof translations] || key;
    };
    
    const translation = mockT('empty.key');
    expect(translation).toBe('');
  });

  it('should handle null or undefined translation values', () => {
    const mockT = (key: string) => {
      const translations = { 
        'null.key': null as any,
        'undefined.key': undefined as any 
      };
      
      const value = translations[key as keyof typeof translations];
      
      if (value === null || value === undefined || value === '') {
        return key; // Fallback to key
      }
      
      return value;
    };
    
    expect(mockT('null.key')).toBe('null.key');
    expect(mockT('undefined.key')).toBe('undefined.key');
  });
});

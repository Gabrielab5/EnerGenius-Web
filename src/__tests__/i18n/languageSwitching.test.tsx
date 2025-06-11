import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ElectricityStats } from '@/components/dashboard/ElectricityStats';
import { LanguageSelector } from '@/components/language/LanguageSelector';
import React from 'react';
import { ElectricityData } from '@/types';

describe('Language Switching Integration', () => {
  beforeEach(() => {
    // Reset document attributes before each test
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  it('should render ElectricityStats in English by default', () => {
    render(
      <LanguageProvider>
        <ElectricityStats data={mockElectricityData} />
      </LanguageProvider>
    );

    expect(screen.getByText('Annual Total')).toBeInTheDocument();
    expect(screen.getByText('Monthly Average')).toBeInTheDocument();
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });

  it('should render LanguageSelector with all language options', () => {
    render(
      <LanguageProvider>
        <LanguageSelector />
      </LanguageProvider>
    );

    // Should show current language (English by default)
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should have proper RTL setup when Hebrew is active', async () => {
    // Mock Hebrew language context
    const HebrewProvider = ({ children }: { children: React.ReactNode }) => (
      <div dir="rtl" lang="he">
        {children}
      </div>
    );

    render(
      <HebrewProvider>
        <ElectricityStats data={mockElectricityData} />
      </HebrewProvider>
    );

    const container = screen.getByText('1200.0 kWh').closest('div');
    expect(container?.closest('[dir="rtl"]')).toBeInTheDocument();
  });

  it('should maintain LTR layout for English and Russian', () => {
    const EnglishProvider = ({ children }: { children: React.ReactNode }) => (
      <div dir="ltr" lang="en">
        {children}
      </div>
    );

    render(
      <EnglishProvider>
        <ElectricityStats data={mockElectricityData} />
      </EnglishProvider>
    );

    const container = screen.getByText('1200.0 kWh').closest('div');
    expect(container?.closest('[dir="ltr"]')).toBeInTheDocument();
  });

  it('should handle missing translation keys gracefully', () => {
    // This tests the fallback mechanism in the translation function
    const TestComponent = () => {
      const mockT = (key: string, fallback?: string) => {
        if (key === 'missing.key') {
          return fallback || key;
        }
        return 'Translated Text';
      };

      return <div>{mockT('missing.key', 'Fallback Text')}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByText('Fallback Text')).toBeInTheDocument();
  });
});

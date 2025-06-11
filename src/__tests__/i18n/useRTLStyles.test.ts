
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRTLStyles } from '@/hooks/useRTLStyles';
import { LanguageProvider } from '@/contexts/LanguageContext';
import React from 'react';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('useRTLStyles Hook', () => {
  it('should return LTR styles for English by default', () => {
    const { result } = renderHook(() => useRTLStyles(), {
      wrapper: TestWrapper
    });

    expect(result.current.textAlign).toBe('text-left');
    expect(result.current.flexDirection).toBe('flex-row');
    expect(result.current.iconSpacing).toBe('mr-2');
    expect(result.current.isRTL).toBe(false);
  });

  it('should return correct margin utilities for LTR', () => {
    const { result } = renderHook(() => useRTLStyles(), {
      wrapper: TestWrapper
    });

    expect(result.current.marginLeft('4')).toBe('ml-4');
    expect(result.current.marginRight('4')).toBe('mr-4');
    expect(result.current.marginStart('4')).toBe('ml-4');
    expect(result.current.marginEnd('4')).toBe('mr-4');
  });

  it('should return correct padding utilities for LTR', () => {
    const { result } = renderHook(() => useRTLStyles(), {
      wrapper: TestWrapper
    });

    expect(result.current.paddingLeft('4')).toBe('pl-4');
    expect(result.current.paddingRight('4')).toBe('pr-4');
    expect(result.current.paddingStart('4')).toBe('pl-4');
    expect(result.current.paddingEnd('4')).toBe('pr-4');
  });

  it('should return correct border utilities for LTR', () => {
    const { result } = renderHook(() => useRTLStyles(), {
      wrapper: TestWrapper
    });

    expect(result.current.borderLeft('2')).toBe('border-l-2');
    expect(result.current.borderRight('2')).toBe('border-r-2');
    expect(result.current.borderStart('2')).toBe('border-l-2');
    expect(result.current.borderEnd('2')).toBe('border-r-2');
  });

  it('should return correct flex classes', () => {
    const { result } = renderHook(() => useRTLStyles(), {
      wrapper: TestWrapper
    });

    expect(result.current.getFlexClasses()).toBe('flex-row');
    expect(result.current.getFlexClasses(true)).toBe('flex-row-reverse');
  });

  it('should return correct spacing classes', () => {
    const { result } = renderHook(() => useRTLStyles(), {
      wrapper: TestWrapper
    });

    expect(result.current.getSpacingClasses('start', '4')).toBe('ml-4');
    expect(result.current.getSpacingClasses('end', '4')).toBe('mr-4');
    expect(result.current.getSpacingClasses('start', '4', 'padding')).toBe('pl-4');
    expect(result.current.getSpacingClasses('end', '4', 'padding')).toBe('pr-4');
  });

  it('should return correct conditional classes', () => {
    const { result } = renderHook(() => useRTLStyles(), {
      wrapper: TestWrapper
    });

    expect(result.current.conditionalClass('rtl-class', 'ltr-class')).toBe('ltr-class');
  });

  it('should return correct style object', () => {
    const { result } = renderHook(() => useRTLStyles(), {
      wrapper: TestWrapper
    });

    const styleObj = result.current.getStyleObject();
    expect(styleObj.direction).toBe('ltr');
    expect(styleObj.textAlign).toBe('left');
  });
});


import React from 'react';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LanguageLoader = ({ children, fallback }: LanguageLoaderProps) => {
  const { isLoading, t } = useLanguage();

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          message={t('loading.initializing')} 
        />
      </div>
    );
  }
  return <>{children}</>;
};
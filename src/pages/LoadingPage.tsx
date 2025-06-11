
import React from 'react';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';

const LoadingPage = () => {
  const { t, direction } = useLanguage();
  return (
   <div className="min-h-screen flex flex-col items-center justify-center p-4" dir={direction}>
      <LoadingSpinner size="lg" message={t('loading.pleaseWait')} />
      <p className="mt-4 text-app-gray-600 text-center">
        {t('loading.preparingApp')}
      </p>
    </div>
  );
};

export default LoadingPage;

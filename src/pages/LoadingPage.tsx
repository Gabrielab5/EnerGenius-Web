
import React from 'react';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';

const LoadingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <LoadingSpinner size="lg" message="Please wait..." />
      <p className="mt-4 text-app-gray-600 text-center">
        We're preparing your electricity consumption forecast app
      </p>
    </div>
  );
};

export default LoadingPage;

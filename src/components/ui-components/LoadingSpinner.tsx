
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner = ({ size = 'md', message = 'Loading...' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <div className={`animate-spin rounded-full border-4 border-app-gray-200 border-t-primary ${sizeClasses[size]}`} role="status"></div>
      {message && <p className="text-app-gray-600">{message}</p>}
    </div>
  );
};

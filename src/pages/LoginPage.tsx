
import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { LanguageSelector } from '@/components/language/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

const LoginPage = () => {
  const { direction } = useLanguage();
  
  return (
    <div 
      className="min-h-screen flex flex-col justify-center p-4" 
      style={{ 
        backgroundColor: 'hsl(43, 26%, 86%)',
        direction: direction
      }}
    >
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-md mx-auto mb-6 flex justify-center">
        <img src="/logo.png" alt="EnerGenius Logo" className="h-28" />
      </div>
      <LoginForm />
    </div>
  );
};

export default LoginPage;

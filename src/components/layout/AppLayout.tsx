
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const AppLayout = () => {
  const { status, user } = useAuth();
  const location = useLocation();
  const [showNav, setShowNav] = useState(false);
  const { direction } = useLanguage();

  useEffect(() => {
    // Only show navigation when authenticated
    if (status === 'authenticated') {
      // Check if user is in onboarding flow
      const isOnboarding = location.pathname === '/onboarding';
      
      // Check if this is the upload page accessed during onboarding
      const isOnboardingCompleted = localStorage.getItem(`onboarding-${user?.id || ''}`) === 'completed';
      const isOnboardingUpload = location.pathname === '/upload' && !isOnboardingCompleted;
      
      // Show nav only if not in onboarding or onboarding upload
      setShowNav(!isOnboarding && !isOnboardingUpload);
    } else {
      setShowNav(false);
    }
  }, [status, location.pathname, user]);
  
  return (
    <div className="app-container" dir={direction}>
      <main>
        <Outlet />
      </main>
      
      {showNav && <BottomNavigation />}
    </div>
  );
};

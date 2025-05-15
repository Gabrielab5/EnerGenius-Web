import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from '@/pages/LoadingPage';

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { status, user } = useAuth();
  const location = useLocation();
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [checkingFirstLogin, setCheckingFirstLogin] = useState(true);

  // Check if this is the user's first login
  useEffect(() => {
    if (status === 'authenticated' && user) {
      const hasCompletedOnboarding = localStorage.getItem(`onboarding-${user.id}`);
      setIsFirstLogin(!hasCompletedOnboarding);
      setCheckingFirstLogin(false);
    } else if (status === 'unauthenticated') {
      setCheckingFirstLogin(false);
    }
  }, [status, user]);

  // Show loading while checking auth status
  if (status === 'loading' || checkingFirstLogin) {
    return <LoadingPage />;
  }

  // If not authenticated, redirect to login
  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If first login and not already on onboarding page, redirect to onboarding
  if (isFirstLogin && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Otherwise, render the protected route
  return <>{children}</>;
};

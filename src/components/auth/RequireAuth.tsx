import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingPage from '@/pages/LoadingPage';

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { status, user } = useAuth();
  const location = useLocation();

  // Early return for loading state
  if (status === 'loading') {
    return <LoadingPage />;
  }

  // Early return for unauthenticated
  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check onboarding status once we have a user
  if (user) {
    const onboardingStatus = localStorage.getItem(`onboarding-${user.id}`);
    const hasCompletedOnboarding = onboardingStatus === 'completed' || onboardingStatus === 'skipped';
    const isOnOnboardingPage = location.pathname === '/onboarding';

    // Redirect to onboarding if first login and not already there
    if (!hasCompletedOnboarding && !isOnOnboardingPage) {
      return <Navigate to="/onboarding" replace />;
    }

    // Redirect to home if completed onboarding but on onboarding page
    if (hasCompletedOnboarding && isOnOnboardingPage) {
      return <Navigate to="/" replace />;
    }
  }

  // Render protected route
  return <>{children}</>;
};


import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui-components/LoadingSpinner';

// This is just a redirect page that will send users to the appropriate place
const Index = () => {
  const { status } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/');
    } else if (status === 'unauthenticated') {
      navigate('/login');
    }
    // Don't redirect if status is 'loading'
  }, [status, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" message="Starting application..." />
    </div>
  );
};

export default Index;

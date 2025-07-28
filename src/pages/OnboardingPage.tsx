
import React, { useState, useEffect } from 'react';
import { DeviceSelectionForm } from '@/components/devices/DeviceSelectionForm';
import { FileUpload } from '@/components/upload/FileUpload';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDevices } from '@/contexts/DeviceContext';
import { useLanguage } from '@/contexts/LanguageContext';

const OnboardingPage = () => {
  const [step, setStep] = useState<'devices' | 'upload'>('devices');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshDevices } = useDevices();
  const { direction } = useLanguage();

  // Use useEffect to handle the case when user is null initially
  useEffect(() => {
    // Make sure we have a user before we try to access their ID
    if (!user && localStorage.getItem('user')) {
      // If we have a user in localStorage but not in context, 
      // wait for the auth state to update
      return;
    }
  }, [user]);

  const handleDeviceStepComplete = () => {
    // Refresh devices to ensure we have the latest data
    refreshDevices();
    setStep('upload');
  };

  const handleUploadStepComplete = () => {
    console.log("OnboardingPage: handleUploadStepComplete called");
    // Mark onboarding as completed for this user
    if (user) {
      localStorage.setItem(`onboarding-${user.id}`, 'completed');
    }
    
    // Navigate immediately without delay using React Router
    navigate('/', { replace: true });
  };

  return (
    <div className="mobile-page" dir={direction}>
      {step === 'devices' ? (
        <DeviceSelectionForm onComplete={handleDeviceStepComplete} />
      ) : (
        <FileUpload onComplete={handleUploadStepComplete} />
      )}
    </div>
  );
};

export default OnboardingPage;

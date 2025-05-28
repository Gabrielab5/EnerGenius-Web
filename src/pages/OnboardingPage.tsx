
import React, { useState, useEffect } from 'react';
import { DeviceSelectionForm } from '@/components/devices/DeviceSelectionForm';
import { FileUpload } from '@/components/upload/FileUpload';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDevices } from '@/contexts/DeviceContext';

const OnboardingPage = () => {
  const [step, setStep] = useState<'devices' | 'upload'>('devices');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshDevices } = useDevices();

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
    
    // Add a delay of 2 seconds and then refresh the page
    // This will force a complete reload and the RequireAuth component will handle redirection
    setTimeout(() => {
      console.log("Refreshing page after 2-second timeout");
      window.location.href = '/'; // Force a full page refresh to the root route
    }, 2000);
  };

  return (
    <div className="mobile-page">
      {step === 'devices' ? (
        <DeviceSelectionForm onComplete={handleDeviceStepComplete} />
      ) : (
        <FileUpload onComplete={handleUploadStepComplete} />
      )}
    </div>
  );
};

export default OnboardingPage;

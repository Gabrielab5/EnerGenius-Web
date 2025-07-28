
import React from 'react';
import { FileUpload } from '@/components/upload/FileUpload';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const UploadPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const handleUploadComplete = () => {
    console.log("UploadPage: handleUploadComplete called");
    toast({
      description: t('upload.success', { defaultValue: 'Your data has been processed successfully.' }),
      duration: 3000,
    });
    
    // Navigate immediately using React Router
    navigate('/', { replace: true });
  };
  
  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    toast({
      description: error.message || t('upload.error', { defaultValue: 'There was an error processing your file. Please try a smaller file or contact support.' }),
      variant: "destructive",
      duration: 5000,
    });
  };
  
  return (
    <div className="mobile-page pb-20">
      <FileUpload 
        onComplete={handleUploadComplete} 
        onError={handleUploadError}
      />
    </div>
  );
};

export default UploadPage;

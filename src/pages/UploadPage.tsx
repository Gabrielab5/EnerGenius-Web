
import React from 'react';
import { FileUpload } from '@/components/upload/FileUpload';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const UploadPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleUploadComplete = () => {
    console.log("UploadPage: handleUploadComplete called");
    toast({
      title: "Upload completed",
      description: "Your data has been processed successfully.",
      duration: 3000,
    });
    
    // Add a delay of 2 seconds and then refresh the page
    setTimeout(() => {
      window.location.href = '/'; // Force a full page refresh
    }, 2000);
  };
  
  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    toast({
      title: "Upload failed",
      description: error.message || "There was an error processing your file. Please try a smaller file or contact support.",
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

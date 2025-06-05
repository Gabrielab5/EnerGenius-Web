
import React, { useRef } from 'react';
import { FileText, Upload } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FileUploadAreaProps {
  fileName: string | null;
  isUploading: boolean;
  selectedYear: string;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMultipleMode?: boolean;
}

export const FileUploadArea = ({ 
  fileName, 
  isUploading, 
  selectedYear, 
  onFileSelected,
  isMultipleMode = false
}: FileUploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useLanguage();

  const handleButtonClick = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="border-2 border-dashed border-app-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer mt-4"
      onClick={handleButtonClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelected}
        accept=".csv"
        className="hidden"
      />
      
      {isMultipleMode ? (
        <Upload className="mx-auto h-12 w-12 text-app-gray-400" />
      ) : (
        <FileText className="mx-auto h-12 w-12 text-app-gray-400" />
      )}
      
      {fileName && !isMultipleMode ? (
        <>
          <p className="mt-2 text-sm font-medium text-app-gray-900">{t('onboarding.upload.fileName').replace('{fileName}', fileName)}</p>
          <p className="mt-1 text-xs text-app-gray-500">
            {isUploading ? t('onboarding.upload.processing') : t('onboarding.upload.fileReady')}
          </p>
          <p className="mt-1 text-xs text-app-gray-500">
            {t('onboarding.upload.year').replace('{year}', selectedYear)}
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-base font-medium text-app-gray-900">
            {isMultipleMode ? t('onboarding.upload.dragDropMultiple') : t('onboarding.upload.dragDropSingle')}
          </p>
          <p className="mt-1 text-sm text-app-gray-500">
            {t('onboarding.upload.supportedFormats')}
          </p>
          {isMultipleMode && (
            <p className="mt-1 text-xs text-app-gray-500">
              {t('onboarding.upload.selectedYear').replace('{year}', selectedYear)}
            </p>
          )}
        </>
      )}
    </div>
  );
};

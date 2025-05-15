
import React, { useRef } from 'react';
import { FileText } from 'lucide-react';

interface FileUploadAreaProps {
  fileName: string | null;
  isUploading: boolean;
  selectedYear: string;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadArea = ({ 
  fileName, 
  isUploading, 
  selectedYear, 
  onFileSelected 
}: FileUploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      
      <FileText className="mx-auto h-12 w-12 text-app-gray-400" />
      
      {fileName ? (
        <>
          <p className="mt-2 text-sm font-medium text-app-gray-900">{fileName}</p>
          <p className="mt-1 text-xs text-app-gray-500">
            {isUploading ? 'Processing...' : 'File ready'}
          </p>
          <p className="mt-1 text-xs text-app-gray-500">
            Year: {selectedYear}
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-base font-medium text-app-gray-900">
            Drag and drop or click to select
          </p>
          <p className="mt-1 text-sm text-app-gray-500">
            Support for CSV files
          </p>
        </>
      )}
    </div>
  );
};

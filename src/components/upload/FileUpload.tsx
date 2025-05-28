import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useConsumption } from '@/contexts/ConsumptionContext';
import { PageHeader } from '@/components/ui-components/PageHeader';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { FileUploadArea } from './FileUploadArea';
import { CSVPreview } from './CSVPreview';
import { MultipleFilesList } from './MultipleFilesList';
import { VideoModal } from './VideoModal';
import { Play } from 'lucide-react';
import { 
  extractCsvData, 
  storeFileAsBase64, 
  storeExtractedData,
  storeMultipleFilesData,
  generateConsumptionData 
} from '@/utils/fileProcessing';

interface FileUploadProps {
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

interface UploadedFile {
  file: File;
  year: string;
  extractedData: Array<string[]>;
  preview: Array<string[]>;
}

export const FileUpload = ({ onComplete, onError }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>((new Date().getFullYear()).toString());
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<Array<string[]>>([]);
  const [dataPreview, setDataPreview] = useState<Array<string[]>>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isMultipleFilesMode, setIsMultipleFilesMode] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { uploadData, lastUploadDate } = useConsumption();
  const { toast } = useToast();
  const { user } = useAuth();

  // Generate year options (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (isMultipleFilesMode) {
      await handleMultipleFileAdd(file);
    } else {
      await handleSingleFileUpload(file);
    }
  };

  const handleSingleFileUpload = async (file: File) => {
    setFileName(file.name);
    setIsUploading(true);
    
    try {
      // Extract data from CSV file
      const data = await extractCsvData(file);
      setExtractedData(data);
      
      // Show first 5 rows as preview
      setDataPreview(data.slice(0, 5));
      
      // Generate consumption data for the chart
      const mockData = generateConsumptionData(data, selectedYear);
      uploadData(mockData);
      
      // Store the extracted data in Firestore if user is logged in
      if (user) {
        const fileInfo = {
          fileName: file.name,
          fileType: file.type,
          year: selectedYear,
          uploadDate: new Date().toISOString()
        };
        
        // Store the file as base64
        const fileBase64 = await storeFileAsBase64(file);
        
        await storeExtractedData(data, fileInfo, fileBase64, user.id);
      }
      
      // Show toast notification
      toast({
        title: "Upload successful",
        description: `Extracted ${data.length} rows from ${file.name} for year ${selectedYear}.`,
        duration: 3000,
      });
      
      setIsUploading(false);
      setIsUploadComplete(true);
      
    } catch (error: any) {
      console.error("Error processing file:", error);
      setIsUploading(false);
      
      // Call the onError callback if provided
      if (onError) {
        onError(error);
      } else {
        // Show toast notification for error
        toast({
          title: "Upload failed",
          description: error.message || "There was an error processing your file. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  const handleMultipleFileAdd = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Extract data from CSV file
      const data = await extractCsvData(file);
      
      // Create new uploaded file entry
      const newUploadedFile: UploadedFile = {
        file,
        year: selectedYear,
        extractedData: data,
        preview: data.slice(0, 5)
      };
      
      setUploadedFiles(prev => [...prev, newUploadedFile]);
      
      // Show toast notification
      toast({
        title: "File added",
        description: `Added ${file.name} for year ${selectedYear}. ${data.length} rows extracted.`,
        duration: 3000,
      });
      
      setIsUploading(false);
      
    } catch (error: any) {
      console.error("Error processing file:", error);
      setIsUploading(false);
      
      toast({
        title: "File processing failed",
        description: error.message || "There was an error processing your file. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadMultipleFiles = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      if (user) {
        // Check if multiple years are selected
        const selectedYears = [...new Set(uploadedFiles.map(f => f.year))];
        const useMultipleYearChunking = selectedYears.length > 1;
        
        await storeMultipleFilesData(uploadedFiles, user.id, useMultipleYearChunking);
        
        // Generate consumption data from the first file for the chart
        const firstFile = uploadedFiles[0];
        const mockData = generateConsumptionData(firstFile.extractedData, firstFile.year);
        uploadData(mockData);
      }
      
      // Show toast notification
      toast({
        title: "Multiple files uploaded",
        description: `Successfully uploaded ${uploadedFiles.length} files.`,
        duration: 3000,
      });
      
      setIsUploading(false);
      setIsUploadComplete(true);
      
    } catch (error: any) {
      console.error("Error uploading multiple files:", error);
      setIsUploading(false);
      
      if (onError) {
        onError(error);
      } else {
        toast({
          title: "Upload failed",
          description: error.message || "There was an error uploading your files. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  const handleContinue = () => {
    // Only call onComplete when continue button is clicked
    if (isUploadComplete && onComplete) {
      console.log("Continue button clicked, calling onComplete");
      onComplete();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  const toggleMode = () => {
    setIsMultipleFilesMode(!isMultipleFilesMode);
    // Reset state when switching modes
    setFileName(null);
    setExtractedData([]);
    setDataPreview([]);
    setUploadedFiles([]);
    setIsUploadComplete(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Upload Your Electricity Data" 
        description="Upload your electricity bill summary to see detailed consumption analysis and forecasts."
        helpText="We accept CSV files with columns for date, kWh usage, and cost. Your data remains private and is only used for generating your forecasts."
      />
      
      <div className="flex justify-center mb-4">
        <Button
          variant="outline"
          onClick={() => setShowVideoModal(true)}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Show me how
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Upload File</CardTitle>
          <CardDescription>
            Select CSV files from your electricity provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="multiple-files"
                checked={isMultipleFilesMode}
                onChange={toggleMode}
                className="rounded"
              />
              <Label htmlFor="multiple-files" className="text-sm">
                Upload multiple files
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Select Year for this Upload</Label>
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
              disabled={isUploading}
            >
              <SelectTrigger id="year" className="h-12">
                <SelectValue placeholder="Select a year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <FileUploadArea
            fileName={fileName}
            isUploading={isUploading}
            selectedYear={selectedYear}
            onFileSelected={handleFileChange}
            isMultipleMode={isMultipleFilesMode}
          />

          {isMultipleFilesMode && uploadedFiles.length > 0 && (
            <MultipleFilesList 
              files={uploadedFiles}
              onRemoveFile={handleRemoveFile}
            />
          )}
          
          {!isMultipleFilesMode && dataPreview.length > 0 && (
            <CSVPreview 
              data={dataPreview} 
              totalRows={extractedData.length} 
            />
          )}
          
          {lastUploadDate && (
            <p className="text-sm text-app-gray-500 text-center">
              Last upload: {formatDate(lastUploadDate)}
            </p>
          )}
        </CardContent>
        <CardFooter>
          {isMultipleFilesMode ? (
            <Button
              disabled={uploadedFiles.length === 0 || isUploading}
              className="w-full h-12"
              variant="default"
              onClick={handleUploadMultipleFiles}
            >
              {isUploading ? 'Processing...' : `Upload ${uploadedFiles.length} Files`}
            </Button>
          ) : (
            <Button
              disabled={!isUploadComplete || isUploading}
              className="w-full h-12"
              variant="default"
              onClick={handleContinue}
            >
              {isUploading ? 'Processing...' : 'Continue'}
            </Button>
          )}
        </CardFooter>
      </Card>

      <VideoModal 
        open={showVideoModal} 
        onOpenChange={setShowVideoModal} 
      />
    </div>
  );
};

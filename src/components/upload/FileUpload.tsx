
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
import { 
  extractCsvData, 
  storeFileAsBase64, 
  storeExtractedData, 
  generateConsumptionData 
} from '@/utils/fileProcessing';

interface FileUploadProps {
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export const FileUpload = ({ onComplete, onError }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>((new Date().getFullYear()).toString());
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<Array<string[]>>([]);
  const [dataPreview, setDataPreview] = useState<Array<string[]>>([]);
  const { uploadData, lastUploadDate } = useConsumption();
  const { toast } = useToast();
  const { user } = useAuth();

  // Generate year options (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Upload Your Electricity Data" 
        description="Upload your electricity bill summary to see detailed consumption analysis and forecasts."
        helpText="We accept CSV files with columns for date, kWh usage, and cost. Your data remains private and is only used for generating your forecasts."
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Upload File</CardTitle>
          <CardDescription>
            Select a CSV file from your electricity provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          />
          
          {dataPreview.length > 0 && (
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
          <Button
            disabled={!isUploadComplete || isUploading}
            className="w-full h-12"
            variant="default"
            onClick={handleContinue}
          >
            {isUploading ? 'Processing...' : 'Continue'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, X } from 'lucide-react';

interface UploadedFile {
  file: File;
  year: string;
  extractedData: Array<string[]>;
  preview: Array<string[]>;
}

interface MultipleFilesListProps {
  files: UploadedFile[];
  onRemoveFile: (index: number) => void;
}

export const MultipleFilesList = ({ files, onRemoveFile }: MultipleFilesListProps) => {
  const groupedFiles = files.reduce((acc, file, index) => {
    const year = file.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push({ ...file, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<UploadedFile & { originalIndex: number }>>);

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Uploaded Files ({files.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedFiles).map(([year, yearFiles]) => (
          <div key={year} className="space-y-2">
            <h4 className="font-medium text-sm text-app-gray-700">Year {year}</h4>
            <div className="space-y-2">
              {yearFiles.map((file) => (
                <div key={file.originalIndex} className="flex items-center justify-between p-3 bg-app-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-app-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-app-gray-900">{file.file.name}</p>
                      <p className="text-xs text-app-gray-500">
                        {formatFileSize(file.file.size)} • {file.extractedData.length} rows
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFile(file.originalIndex)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {files.length > 1 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-app-gray-500">
              {files.length > 1 && new Set(files.map(f => f.year)).size > 1 
                ? "Multiple years detected - files will be split into 36 chunks"
                : "Single year - using standard chunking"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

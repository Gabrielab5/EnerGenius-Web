
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface CSVPreviewProps {
  data: Array<string[]>;
  totalRows: number;
}

export const CSVPreview = ({ data, totalRows }: CSVPreviewProps) => {
  const { t } = useLanguage();

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">CSV Preview</CardTitle>
        <CardDescription>
          {t('onboarding.upload.csvPreviewShowing', { shown: 4, total: totalRows })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  {t('onboarding.upload.csvPreviewColumnA')}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  {t('onboarding.upload.csvPreviewColumnB')}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  {t('onboarding.upload.csvPreviewColumnC')}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2">{row[0] || ''}</td>
                  <td className="border border-gray-300 px-4 py-2">{row[1] || ''}</td>
                  <td className="border border-gray-300 px-4 py-2">{row[2] || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

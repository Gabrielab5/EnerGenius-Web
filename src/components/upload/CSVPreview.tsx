
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';

interface CSVPreviewProps {
  data: Array<string[]>;
  totalRows: number;
}

export const CSVPreview = ({ data, totalRows }: CSVPreviewProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="mt-4 border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('onboarding.upload.csvPreviewColumnA')}</TableHead>
            <TableHead>{t('onboarding.upload.csvPreviewColumnB')}</TableHead>
            <TableHead>{t('onboarding.upload.csvPreviewColumnC')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row[0]}</TableCell>
              <TableCell>{row[1]}</TableCell>
              <TableCell>{row[2]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="px-4 py-2 bg-muted text-sm">
        {t('onboarding.upload.csvPreviewShowing').replace('{shown}', data.length.toString()).replace('{total}', totalRows.toString())}
      </div>
    </div>
  );
};

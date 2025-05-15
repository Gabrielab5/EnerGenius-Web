
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CSVPreviewProps {
  data: Array<string[]>;
  totalRows: number;
}

export const CSVPreview = ({ data, totalRows }: CSVPreviewProps) => {
  return (
    <div className="mt-4 border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Column A</TableHead>
            <TableHead>Column B</TableHead>
            <TableHead>Column C</TableHead>
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
        Showing {data.length} of {totalRows} rows
      </div>
    </div>
  );
};

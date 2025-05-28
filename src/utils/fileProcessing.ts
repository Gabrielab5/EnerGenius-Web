
import Papa from 'papaparse';
import { ConsumptionData } from '@/types';
import { doc, setDoc, collection, writeBatch, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Maximum batch size for Firestore (reduced to be safer)
const MAX_BATCH_SIZE = 250;
// Number of rows to store per document (reduced from 3000 to 1000)
const ROWS_PER_DOCUMENT = 1000;
// Number of rows per document when using 36 chunks for multiple years
const ROWS_PER_DOCUMENT_MULTIPLE_YEARS = 36;
// Maximum size for raw file chunks in bytes (reduced from 700KB to 300KB)
const MAX_CHUNK_SIZE = 300 * 1024;
// Maximum number of operations to commit in a single transaction
const MAX_OPS_PER_TRANSACTION = 20;

// Function to convert file to base64 for storage
export const storeFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Function to extract data from CSV file
export const extractCsvData = (file: File): Promise<Array<string[]>> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          const data = results.data as string[][];
          // Filter out empty rows
          const filteredData = data.filter(row => row.length > 0 && row.some(cell => cell.trim() !== ''));
          
          // Take only the first 3 columns if there are more
          const extractedColumns = filteredData.map(row => row.slice(0, 3));
          
          resolve(extractedColumns);
        } catch (error) {
          console.error("Error processing CSV file:", error);
          reject(error);
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        reject(error);
      }
    });
  });
};

// Split a base64 string into chunks of specified size
const splitBase64IntoChunks = (base64String: string): string[] => {
  const chunks: string[] = [];
  let i = 0;
  while (i < base64String.length) {
    chunks.push(base64String.slice(i, i + MAX_CHUNK_SIZE));
    i += MAX_CHUNK_SIZE;
  }
  return chunks;
};

// Store a single file chunk as a separate document
const storeFileChunk = async (
  chunkRef: any, 
  chunkData: { chunkIndex: number; data: string }
): Promise<void> => {
  await setDoc(chunkRef, chunkData);
};

// Store a single data chunk as a separate document
const storeDataChunk = async (
  chunkRef: any,
  chunkData: { startRow: number; endRow: number; rows: Record<string, any>; totalRows: number }
): Promise<void> => {
  await setDoc(chunkRef, chunkData);
};

// Store multiple files data with conditional chunking
export const storeMultipleFilesData = async (
  uploadedFiles: Array<{
    file: File;
    year: string;
    extractedData: Array<string[]>;
    preview: Array<string[]>;
  }>,
  userId: string,
  useMultipleYearChunking: boolean = false
) => {
  try {
    if (!userId) return;
    
    const userRef = doc(db, "users", userId);
    const csvDataCollection = collection(userRef, "csvData");
    
    // Create a batch upload document to group all files
    const batchRef = doc(csvDataCollection, `batch_${Date.now()}`);
    
    await setDoc(batchRef, {
      uploadDate: new Date().toISOString(),
      fileCount: uploadedFiles.length,
      useMultipleYearChunking,
      years: [...new Set(uploadedFiles.map(f => f.year))],
      totalRows: uploadedFiles.reduce((sum, f) => sum + f.extractedData.length, 0)
    });
    
    // Process each file
    for (let fileIndex = 0; fileIndex < uploadedFiles.length; fileIndex++) {
      const uploadedFile = uploadedFiles[fileIndex];
      const { file, year, extractedData } = uploadedFile;
      
      const fileRef = doc(collection(batchRef, "files"), `file_${fileIndex}`);
      
      // Split the raw file content into chunks
      const fileBase64 = await storeFileAsBase64(file);
      const fileChunks = splitBase64IntoChunks(fileBase64);
      console.log(`File ${file.name} split into ${fileChunks.length} chunks`);
      
      // Store file metadata
      await setDoc(fileRef, {
        fileName: file.name,
        fileType: file.type,
        year: year,
        uploadDate: new Date().toISOString(),
        rowCount: extractedData.length,
        fileChunksCount: fileChunks.length
      });
      
      // Store the file chunks
      const fileChunksCollection = collection(fileRef, "fileChunks");
      
      for (let i = 0; i < fileChunks.length; i += MAX_OPS_PER_TRANSACTION) {
        const chunkPromises = [];
        
        for (let j = i; j < Math.min(i + MAX_OPS_PER_TRANSACTION, fileChunks.length); j++) {
          const chunkRef = doc(fileChunksCollection, `chunk_${j}`);
          chunkPromises.push(storeFileChunk(chunkRef, {
            chunkIndex: j,
            data: fileChunks[j]
          }));
        }
        
        await Promise.all(chunkPromises);
        console.log(`Stored file chunks ${i} to ${i + chunkPromises.length - 1} for ${file.name}`);
      }
      
      // Determine chunking strategy based on multiple year selection
      const rowsPerDoc = useMultipleYearChunking ? ROWS_PER_DOCUMENT_MULTIPLE_YEARS : ROWS_PER_DOCUMENT;
      const totalDataChunks = Math.ceil(extractedData.length / rowsPerDoc);
      
      console.log(`Storing ${extractedData.length} data rows in ${totalDataChunks} chunks (${rowsPerDoc} rows per chunk) for ${file.name}`);
      
      // Store data chunks
      const dataChunksCollection = collection(fileRef, "dataChunks");
      
      for (let chunkIndex = 0; chunkIndex < totalDataChunks; chunkIndex += MAX_OPS_PER_TRANSACTION) {
        const dataChunkPromises = [];
        
        for (let j = chunkIndex; j < Math.min(chunkIndex + MAX_OPS_PER_TRANSACTION, totalDataChunks); j++) {
          const start = j * rowsPerDoc;
          const end = Math.min(start + rowsPerDoc, extractedData.length);
          const chunkData = extractedData.slice(start, end);
          
          const rowsObject: Record<string, { colA: string; colB: string; colC: string }> = {};
          chunkData.forEach((row, rowIndex) => {
            rowsObject[`row_${start + rowIndex}`] = {
              colA: row[0] || '',
              colB: row[1] || '',
              colC: row[2] || ''
            };
          });
          
          const chunkRef = doc(dataChunksCollection, `chunk_${j}`);
          
          dataChunkPromises.push(storeDataChunk(chunkRef, {
            startRow: start,
            endRow: end - 1,
            rows: rowsObject,
            totalRows: chunkData.length
          }));
        }
        
        await Promise.all(dataChunkPromises);
        console.log(`Stored data chunks ${chunkIndex} to ${chunkIndex + dataChunkPromises.length - 1} for ${file.name}`);
      }
      
      console.log(`Completed processing file ${file.name} with ${useMultipleYearChunking ? '36-row' : 'standard'} chunking`);
    }
    
    console.log(`Successfully stored ${uploadedFiles.length} files with ${useMultipleYearChunking ? 'multiple year' : 'single year'} chunking`);
    return true;
  } catch (error) {
    console.error("Error storing multiple files data:", error);
    throw error;
  }
};

// Store extracted data in smaller chunks with individual transactions
export const storeExtractedData = async (
  data: Array<string[]>, 
  fileInfo: {
    fileName: string;
    fileType: string;
    year: string;
    uploadDate: string;
  }, 
  fileBase64: string,
  userId: string
) => {
  try {
    if (!userId) return;
    
    const userRef = doc(db, "users", userId);
    const csvDataCollection = collection(userRef, "csvData");
    const fileRef = doc(csvDataCollection, `file_${fileInfo.year}_${Date.now()}`);
    
    // Split the raw file content into chunks
    const fileChunks = splitBase64IntoChunks(fileBase64);
    console.log(`File split into ${fileChunks.length} chunks of ${MAX_CHUNK_SIZE} bytes max`);
    
    // Calculate how many data chunks we need
    const totalDataChunks = Math.ceil(data.length / ROWS_PER_DOCUMENT);
    
    // Store file metadata with correct chunk counts
    await setDoc(fileRef, {
      fileName: fileInfo.fileName,
      fileType: fileInfo.fileType,
      year: fileInfo.year,
      uploadDate: fileInfo.uploadDate,
      rowCount: data.length,
      fileChunksCount: fileChunks.length,
      dataChunksCount: totalDataChunks
    });
    
    // Store the file chunks in separate documents with individual transactions
    const fileChunksCollection = collection(fileRef, "fileChunks");
    let completedChunks = 0;
    
    // Process file chunks in small groups to avoid large transactions
    for (let i = 0; i < fileChunks.length; i += MAX_OPS_PER_TRANSACTION) {
      const chunkPromises = [];
      
      // Process a small batch of chunks at a time
      for (let j = i; j < Math.min(i + MAX_OPS_PER_TRANSACTION, fileChunks.length); j++) {
        const chunkRef = doc(fileChunksCollection, `chunk_${j}`);
        chunkPromises.push(storeFileChunk(chunkRef, {
          chunkIndex: j,
          data: fileChunks[j]
        }));
      }
      
      // Wait for this small batch to complete
      await Promise.all(chunkPromises);
      completedChunks += chunkPromises.length;
      console.log(`Stored file chunks ${i} to ${i + chunkPromises.length - 1}`);
    }
    
    console.log(`Completed storing ${completedChunks} file chunks`);
    
    // Calculate how many chunk documents we need for the data rows
    console.log(`Storing ${data.length} data rows in ${totalDataChunks} chunk documents`);
    
    // Store data chunks with individual transactions
    const dataChunksCollection = collection(fileRef, "dataChunks");
    let completedDataChunks = 0;
    
    // Process data chunks in small groups
    for (let chunkIndex = 0; chunkIndex < totalDataChunks; chunkIndex += MAX_OPS_PER_TRANSACTION) {
      const dataChunkPromises = [];
      
      // Process a small batch of data chunks at a time
      for (let j = chunkIndex; j < Math.min(chunkIndex + MAX_OPS_PER_TRANSACTION, totalDataChunks); j++) {
        const start = j * ROWS_PER_DOCUMENT;
        const end = Math.min(start + ROWS_PER_DOCUMENT, data.length);
        const chunkData = data.slice(start, end);
        
        // Convert chunk data to an object for storage
        const rowsObject: Record<string, { colA: string; colB: string; colC: string }> = {};
        chunkData.forEach((row, rowIndex) => {
          rowsObject[`row_${start + rowIndex}`] = {
            colA: row[0] || '',
            colB: row[1] || '',
            colC: row[2] || ''
          };
        });
        
        // Create a document for this chunk
        const chunkRef = doc(dataChunksCollection, `chunk_${j}`);
        
        dataChunkPromises.push(storeDataChunk(chunkRef, {
          startRow: start,
          endRow: end - 1,
          rows: rowsObject,
          totalRows: chunkData.length
        }));
      }
      
      // Wait for this small batch of data chunks to complete
      await Promise.all(dataChunkPromises);
      completedDataChunks += dataChunkPromises.length;
      console.log(`Stored data chunks ${chunkIndex} to ${chunkIndex + dataChunkPromises.length - 1}`);
    }
    
    console.log(`Completed storing ${completedDataChunks} data chunks`);
    return true;
  } catch (error) {
    console.error("Error storing extracted data:", error);
    throw error;
  }
};

// Generate comprehensive consumption data based on the extracted data
export const generateConsumptionData = (data: Array<string[]>, selectedYear: string): ConsumptionData[] => {
  // Skip the header row if present
  const dataRows = data.length > 1 ? data.slice(1) : data;
  
  // Parse the actual data to extract monthly consumption
  const monthlyData: Record<string, { kwh: number; cost: number; count: number }> = {};
  
  // Initialize all 12 months
  for (let i = 0; i < 12; i++) {
    const monthKey = `${selectedYear}-${(i + 1).toString().padStart(2, '0')}`;
    monthlyData[monthKey] = { kwh: 0, cost: 0, count: 0 };
  }
  
  // Process each row to extract actual consumption data
  dataRows.forEach(row => {
    if (row.length >= 3) {
      const dateStr = row[0]?.trim();
      const kwhStr = row[1]?.trim();
      const costStr = row[2]?.trim();
      
      // Try to parse date in various formats
      let month = '';
      if (dateStr) {
        // Try different date formats
        const dateFormats = [
          /(\d{4})-(\d{1,2})/,  // YYYY-MM
          /(\d{1,2})\/(\d{4})/,  // MM/YYYY
          /(\d{1,2})-(\d{4})/,   // MM-YYYY
          /(\d{4})(\d{2})/       // YYYYMM
        ];
        
        for (const format of dateFormats) {
          const match = dateStr.match(format);
          if (match) {
            if (format === dateFormats[0] || format === dateFormats[3]) {
              // YYYY-MM or YYYYMM format
              const year = format === dateFormats[3] ? match[1] : match[1];
              const monthNum = format === dateFormats[3] ? match[2] : match[2];
              if (year === selectedYear) {
                month = `${year}-${monthNum.padStart(2, '0')}`;
              }
            } else {
              // MM/YYYY or MM-YYYY format
              const monthNum = match[1];
              const year = match[2];
              if (year === selectedYear) {
                month = `${year}-${monthNum.padStart(2, '0')}`;
              }
            }
            break;
          }
        }
      }
      
      if (month && monthlyData[month]) {
        // Parse kWh value
        const kwh = parseFloat(kwhStr?.replace(/[^\d.-]/g, '') || '0');
        if (!isNaN(kwh) && kwh > 0) {
          monthlyData[month].kwh += kwh;
          monthlyData[month].count++;
        }
        
        // Parse cost value
        const cost = parseFloat(costStr?.replace(/[^\d.-]/g, '') || '0');
        if (!isNaN(cost) && cost > 0) {
          monthlyData[month].cost += cost;
        }
      }
    }
  });
  
  // Convert to array format, filling in missing data with estimates
  const result: ConsumptionData[] = [];
  
  for (let i = 0; i < 12; i++) {
    const monthKey = `${selectedYear}-${(i + 1).toString().padStart(2, '0')}`;
    const monthData = monthlyData[monthKey];
    
    let kwh = monthData.kwh;
    let cost = monthData.cost;
    
    // If no data for this month, estimate based on available data or use defaults
    if (kwh === 0) {
      // Calculate average from other months that have data
      const monthsWithData = Object.values(monthlyData).filter(m => m.kwh > 0);
      if (monthsWithData.length > 0) {
        const avgKwh = monthsWithData.reduce((sum, m) => sum + m.kwh, 0) / monthsWithData.length;
        kwh = Math.round(avgKwh * (0.8 + Math.random() * 0.4)); // Add some variation
      } else {
        // Fallback to seasonal estimates
        const baseAmount = 300;
        const seasonalMultiplier = [1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3][i];
        kwh = Math.round(baseAmount * seasonalMultiplier);
      }
    }
    
    if (cost === 0) {
      // Estimate cost based on kWh if not provided
      cost = kwh * 0.15; // Approximate rate
    }
    
    result.push({
      date: monthKey,
      kwh: Math.round(kwh),
      cost: Math.round(cost * 100) / 100 // Round to 2 decimal places
    });
  }
  
  return result;
};

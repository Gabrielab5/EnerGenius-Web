import Papa from 'papaparse';
import { ConsumptionData } from '@/types';
import { doc, setDoc, collection, writeBatch, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Maximum batch size for Firestore (reduced to be safer)
const MAX_BATCH_SIZE = 250;
// Number of rows to store per document (reduced from 3000 to 1000)
const ROWS_PER_DOCUMENT = 1000;
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
    
    // Split the raw file content into even smaller chunks
    const fileChunks = splitBase64IntoChunks(fileBase64);
    console.log(`File split into ${fileChunks.length} chunks of ${MAX_CHUNK_SIZE} bytes max`);
    
    // Store file metadata without the raw file content
    await setDoc(fileRef, {
      fileName: fileInfo.fileName,
      fileType: fileInfo.fileType,
      year: fileInfo.year,
      uploadDate: fileInfo.uploadDate,
      rowCount: data.length,
      fileChunksCount: fileChunks.length
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
    // Reduced rows per document from 3000 to 1000
    const totalDataChunks = Math.ceil(data.length / ROWS_PER_DOCUMENT);
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

// Generate mock consumption data based on the extracted data
export const generateConsumptionData = (data: Array<string[]>, selectedYear: string): ConsumptionData[] => {
  // Skip the header row if present
  const dataRows = data.length > 1 ? data.slice(1) : data;
  
  // Create mock data based on the file content
  // This is a simplified example - you would replace this with actual parsing logic
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(parseInt(selectedYear), i, 1);
    
    // Try to find a row for this month in the data
    const monthRow = dataRows.find(row => {
      const rowDate = row[0]; // Assuming first column might contain date info
      return rowDate && rowDate.includes((i + 1).toString().padStart(2, '0')); 
    });
    
    // Use data from the file if found, otherwise generate mock data
    const baseAmount = 300;
    const variation = Math.random() * 100 - 50; // -50 to +50
    
    // Try to extract numeric value from column B if it exists
    let kwh = Math.round(baseAmount + variation);
    if (monthRow && monthRow[1]) {
      const parsedKwh = parseFloat(monthRow[1]);
      if (!isNaN(parsedKwh)) {
        kwh = parsedKwh;
      }
    }
    
    return {
      date: date.toISOString().slice(0, 7), // YYYY-MM format
      kwh,
      cost: kwh * 0.15 // Assuming $0.15 per kWh
    };
  });
};

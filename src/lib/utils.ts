
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Send a request to the XLSX to text conversion service
 * @param userId The Firebase user ID to send in the request
 * @returns Promise with the response data
 */
export async function convertXlsxToText(userId: string): Promise<any> {
  try {
    const response = await fetch('https://xlsxtotext-160356915851.us-central1.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error converting XLSX to text:', error);
    throw error;
  }
}

/**
 * Send a request to create an AI forecast
 * @param userId The Firebase user ID to send in the request
 * @returns Promise with the forecast response data
 */
export async function createAIForecast(userId: string): Promise<any> {
  try {
    const response = await fetch('https://electricforcastai-160356915851.us-central1.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating AI forecast:', error);
    throw error;
  }
}

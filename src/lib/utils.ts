
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "./firebase"
import { API_ENDPOINTS } from "@/config/api"

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
    console.log('Starting XLSX to text conversion...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    const response = await fetch(API_ENDPOINTS.XLSX_TO_TEXT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId); 
    console.log('XLSX Conversion API Response Status:', response.status);
    if (!response.ok) {
      throw new Error(`XLSX Conversion API Error: ${response.status} ${response.statusText}`);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.warn('XLSX Conversion API returned non-JSON response:', responseText.substring(0, 200));
      throw new Error('XLSX conversion service returned HTML instead of JSON - service may be down');
    }
    
    const data = await response.json();
    console.log('XLSX conversion completed successfully');
    return data;

  } catch (error) {
    console.error('Error converting XLSX to text:', error);
    throw error;
  }
}

/**
 * Send a request to analyze electricity data
 * @param userId The Firebase user ID to send in the request
 * @returns Promise with the analysis response data
 */
export async function analyzeElectricityData(userId: string): Promise<any> {
  try {
    console.log('Starting electricity data analysis...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for analysis

    const response = await fetch(API_ENDPOINTS.ELECTRICITY_ANALYSIS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    console.log('Analysis API Response Status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Analysis API Error: ${response.status} ${response.statusText}`);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.warn('Analysis API returned non-JSON response:', responseText.substring(0, 200));
      throw new Error('Analysis service returned HTML instead of JSON - service may be down');
    }
    
    const data = await response.json();
    console.log('Analysis completed successfully');
    return data;
  } catch (error) {
    console.error('Error analyzing electricity data:', error);
    throw error;
  }
}

/**
 * Send a request to get electricity forecast AI tips
 * @param userId The Firebase user ID to send in the request
 * @param language The language code (en, he, ru)
 * @returns Promise with the tips response data
 */
export async function getElectricityTips(userId: string, language: string): Promise<any> {
  const maxRetries = 2;
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to fetch tips from API (attempt ${attempt + 1}/${maxRetries + 1})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(API_ENDPOINTS.ELECTRICITY_FORECAST_AI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, language }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Log response details for debugging
      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.warn('API returned non-JSON response:', {
          contentType,
          responsePreview: responseText.substring(0, 200)
        });
        throw new Error('API returned HTML instead of JSON - service may be down');
      }
      
      const responseText = await response.text();
      
      // Validate JSON structure before parsing
      if (!responseText.trim().startsWith('{') && !responseText.trim().startsWith('[')) {
        console.warn('Response does not look like JSON:', responseText.substring(0, 100));
        throw new Error('Invalid JSON response from API');
      }
      
      const data = JSON.parse(responseText);
      console.log('Successfully received tips from API');
      return data;
      
    } catch (error) {
      lastError = error;
      console.error(`Error getting electricity tips (attempt ${attempt + 1}):`, error);
      
      // Don't retry on JSON parsing errors or abort errors
      if (error.name === 'AbortError' || error.message.includes('JSON')) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('All API attempts failed, will try Firestore fallback');
  throw lastError || new Error('Failed to fetch tips from API');
}

/**
 * Fetch electricity tips from Firestore
 * @param userId The Firebase user ID
 * @returns Promise with the tips data or null if none exists
 */
export async function fetchElectricityTipsFromFirestore(userId: string): Promise<any> {
  try {
    const tipsRef = doc(db, "users", userId, "results", "electricity_tips");
    const tipsDoc = await getDoc(tipsRef);
    
    if (tipsDoc.exists()) {
      const tipsData = tipsDoc.data();
      console.log("Retrieved electricity tips from Firestore:", tipsData);
      return tipsData;
    } else {
      console.log("No electricity tips found in Firestore");
      return null;
    }
  } catch (error) {
    console.error('Error fetching electricity tips from Firestore:', error);
    return null;
  }
}

/**
 * Fetch the most recent electricity data from Firestore
 * @param userId The Firebase user ID
 * @returns Promise with the electricity data or null if none exists
 */
export async function fetchExistingElectricityData(userId: string): Promise<any> {
  try {
    // Get the user document reference
    const userRef = doc(db, "users", userId);
    
    // Get the results collection reference
    const resultsCollectionRef = collection(userRef, "results");
    
    // Create a query to get the most recent electricity data document
    const dataQuery = query(
      resultsCollectionRef,
      orderBy("createdAt", "desc"),
      limit(1)
    );
    
    // Execute the query
    const querySnapshot = await getDocs(dataQuery);
    
    // Check if we have any results
    if (querySnapshot.empty) {
      console.log("No electricity data documents found for user");
      return null;
    }
    
    // Get the first (most recent) document
    const dataDoc = querySnapshot.docs[0];
    const electricityData = dataDoc.data();
    
    console.log("Retrieved electricity data:", electricityData);
    
    return electricityData;
  } catch (error) {
    console.error('Error fetching electricity data from Firestore:', error);
    return null;
  }
}


import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

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
 * Send a request to analyze electricity data
 * @param userId The Firebase user ID to send in the request
 * @returns Promise with the analysis response data
 */
export async function analyzeElectricityData(userId: string): Promise<any> {
  try {
    const response = await fetch('https://electricalculation-160356915851.europe-west1.run.app', {
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
  try {
    const response = await fetch('https://electricforcastai-160356915851.us-central1.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, language }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting electricity tips:', error);
    throw error;
  }
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

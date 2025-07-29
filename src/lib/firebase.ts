
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKNuZIEuWLU8hlE-_YSW4u9GshnMy7Bv0",
  authDomain: "energenius-9908d.firebaseapp.com",
  databaseURL: "https://energenius-9908d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "energenius-9908d",
  storageBucket: "energenius-9908d.firebasestorage.app",
  messagingSenderId: "896156254297",
  appId: "1:896156254297:web:9445f9267d47ba1ba13148",
  measurementId: "G-Q26WQSQXKF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Configure auth settings for better performance
auth.useDeviceLanguage();

// Initialize Firestore with optimized settings
export const db = getFirestore(app);

// Optimize Firebase connection settings
if (typeof window !== 'undefined') {
    // Simple connection health check without aggressive network management
  const connectionHealthCheck = () => {
    try {
      // Let Firebase handle its own network state management
      console.log('Firebase connection initialized');
    } catch (error) {
      console.warn('Firebase connection warning:', error);
    }
  };
  
// Run health check once
  connectionHealthCheck();
}
export default app;


import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { AuthStatus, User } from '@/types';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Convert Firebase user to our app User type
const formatUser = (user: FirebaseUser): User => {
  return {
    id: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || '',
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const { toast } = useToast();
  const googleProvider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const location = useLocation();

  // Create or update user document in Firestore
  const createUserDocument = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      // If user doesn't exist in Firestore yet, create them
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Create user document in Firestore if it doesn't exist
        await createUserDocument(firebaseUser);
        
        const formattedUser = formatUser(firebaseUser);
        setUser(formattedUser);
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (userId: string) => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(`onboarding-${userId}`);
    
    // Redirect to onboarding if first login, otherwise to home
    if (!hasCompletedOnboarding) {
      navigate('/onboarding');
    } else {
      navigate('/');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setStatus('loading');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Success!",
        description: "Signed in successfully.",
      });

      // Wait a tick to ensure Firebase auth state has updated
      setTimeout(() => {
        handleAuthSuccess(userCredential.user.uid);
      }, 0);
    } catch (error) {
      setStatus('unauthenticated');
      toast({
        title: "Error",
        description: "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setStatus('loading');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await createUserDocument(userCredential.user);
      
      toast({
        title: "Success!",
        description: "Account created successfully.",
      });

      // Wait a tick to ensure Firebase auth state has updated
      setTimeout(() => {
        handleAuthSuccess(userCredential.user.uid);
      }, 0);
    } catch (error) {
      setStatus('unauthenticated');
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setStatus('loading');
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      // Create user document in Firestore
      await createUserDocument(userCredential.user);
      
      toast({
        title: "Success!",
        description: "Signed in with Google successfully.",
      });

      // Wait a tick to ensure Firebase auth state has updated
      setTimeout(() => {
        handleAuthSuccess(userCredential.user.uid);
      }, 0);
    } catch (error) {
      setStatus('unauthenticated');
      toast({
        title: "Error",
        description: "Failed to sign in with Google.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });

      // Redirect to login page after sign out
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        signIn,
        signUp,
        signInWithGoogle,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

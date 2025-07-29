import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { AuthStatus, User } from '@/types';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
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
  const { t } = useLanguage();
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
    let isMounted = true;
    let authTimeout: NodeJS.Timeout;
    
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clear any pending timeout
      if (authTimeout) clearTimeout(authTimeout);
      
      // Set a timeout for auth state updates to prevent hanging
      authTimeout = setTimeout(() => {
        if (isMounted && !firebaseUser) {
          setStatus('unauthenticated');
        }
      }, 5000);

      try {
        if (!isMounted) return;

        if (firebaseUser) {
          clearTimeout(authTimeout);
          // Format user immediately for faster UI updates
          const formattedUser = formatUser(firebaseUser);
          if (isMounted) {
            setUser(formattedUser);
            setStatus('authenticated');
          }

          // Create user document asynchronously without blocking auth state
          createUserDocument(firebaseUser).catch(error => {
            // Silently handle user document creation errors to avoid console spam
            if (error.code !== 'permission-denied') {
              console.warn("User document creation delayed:", error.code);
            }
          });
        } else {
          if (isMounted) {
            setUser(null);
            setStatus('unauthenticated');
          }
        }
      } catch (error) {
        if (error.code !== 'auth/network-request-failed') {
          console.error("Auth state change error:", error);
        }
        if (isMounted) {
          setStatus('unauthenticated');
        }
      }
    });

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      if (authTimeout) clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (userId: string) => {
    // Check if user has completed onboarding from cache
    const hasCompletedOnboarding = localStorage.getItem(`onboarding-${userId}`) === 'completed';
    
    // Use immediate navigation without awaiting
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
        description: t('notifications.auth.signInSuccessDescription'),
      });

      handleAuthSuccess(userCredential.user.uid);
    } catch (error) {
      setStatus('unauthenticated');
      toast({
        description: t('notifications.auth.signInError'),
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setStatus('loading');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document asynchronously
      createUserDocument(userCredential.user).catch(console.error);
      
      toast({
        description: t('notifications.auth.signUpSuccessDescription'),
      });

      handleAuthSuccess(userCredential.user.uid);
    } catch (error) {
      setStatus('unauthenticated');
      toast({
        description: t('notifications.auth.signUpError'),
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setStatus('loading');
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      // Create user document asynchronously
      createUserDocument(userCredential.user).catch(console.error);
      
      toast({
        description: t('notifications.auth.googleSignInSuccessDescription'),
      });

      handleAuthSuccess(userCredential.user.uid);
    } catch (error) {
      setStatus('unauthenticated');
      toast({
        description: t('notifications.auth.googleSignInError'),
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      
      toast({
        description: t('notifications.auth.signOutSuccessDescription'),
      });

      // Ensure state updates are processed before navigation
      await Promise.resolve();
      navigate('/login');
    } catch (error) {
      toast({
        description: t('notifications.auth.signOutError'),
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string, retryCount = 0): Promise<boolean> => {
    const maxRetries = 2;
    
    try {
      console.log('Attempting to send password reset email to:', email, `(attempt ${retryCount + 1})`);
      
      // Remove the actionCodeSettings to avoid domain whitelisting issues
      await sendPasswordResetEmail(auth, email);
      
      console.log('Password reset email sent successfully');
      toast({
        description: `${t('notifications.auth.resetPasswordSuccessDescription')} Please check your spam folder if you don't see it in your inbox.`,
        duration: 8000,
      });
      
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Retry logic for network errors
      if (retryCount < maxRetries && (error.code === 'auth/network-request-failed' || !error.code)) {
        console.log(`Retrying password reset... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return resetPassword(email, retryCount + 1);
      }
      
      let errorMessage = t('notifications.auth.resetPasswordError');
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        errorMessage = `${t('notifications.auth.userNotFoundError')} Please check your email address or create a new account.`;
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t('notifications.auth.invalidEmailError');
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many reset attempts. Please wait 15 minutes before trying again.';
      } else if (error.code === 'auth/unauthorized-continue-uri') {
        errorMessage = 'Email service configuration issue. Please contact support.';
      }
      
      toast({
        description: errorMessage,
        variant: 'destructive',
        duration: 6000,
      });
      
      return false;
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
        signOut,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

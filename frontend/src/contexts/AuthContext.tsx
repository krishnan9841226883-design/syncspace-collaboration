/**
 * SyncSpace Frontend — Auth Context
 * Manages Firebase Authentication state and Google Sign-In
 * Supports Demo Mode when Firebase is not configured
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Demo user for testing without Firebase */
const DEMO_USER: AuthUser = {
  uid: 'demo-user-001',
  email: 'demo@syncspace.app',
  displayName: 'Demo User',
  photoURL: null,
};

/** Check if Firebase is properly configured (not using placeholder keys) */
function isFirebaseConfigured(): boolean {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return Boolean(apiKey && apiKey !== 'demo-api-key' && apiKey.length > 10);
}

/** Map Firebase User to simplified AuthUser */
function mapUser(firebaseUser: FirebaseUser): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
}

/**
 * Authentication Provider
 * Wraps the app with Firebase auth state management.
 * Falls back to demo mode when Firebase is not configured.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const firebaseReady = isFirebaseConfigured();

  // Listen for Firebase auth state changes (only if configured)
  useEffect(() => {
    if (!firebaseReady) {
      // Check if demo session exists in localStorage
      const demoSession = localStorage.getItem('syncspace-demo-session');
      if (demoSession) {
        setUser(JSON.parse(demoSession));
        setIsDemoMode(true);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapUser(firebaseUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseReady]);

  /** Sign in with Google (Firebase) */
  const signInWithGoogle = useCallback(async () => {
    if (!firebaseReady) {
      setError('Firebase is not configured. Use Demo Mode or add your Firebase config to .env');
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      console.error('Sign-in error:', err);
    } finally {
      setLoading(false);
    }
  }, [firebaseReady]);

  /** Sign in as demo user (no Firebase needed) */
  const signInAsDemo = useCallback(() => {
    setUser(DEMO_USER);
    setIsDemoMode(true);
    setError(null);
    localStorage.setItem('syncspace-demo-session', JSON.stringify(DEMO_USER));
  }, []);

  /** Sign out */
  const signOut = useCallback(async () => {
    try {
      if (isDemoMode) {
        localStorage.removeItem('syncspace-demo-session');
      } else {
        await firebaseSignOut(auth);
      }
      setUser(null);
      setIsDemoMode(false);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  }, [isDemoMode]);

  const value = { user, loading, error, isDemoMode, signInWithGoogle, signInAsDemo, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access auth context */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

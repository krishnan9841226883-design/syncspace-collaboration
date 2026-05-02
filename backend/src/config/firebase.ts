/**
 * SyncSpace Backend — Firebase Admin Configuration
 * Initializes Firebase Admin SDK for server-side operations
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials in production,
 * or emulator configuration in development
 */
/**
 * Initialize Firebase Admin SDK
 * On Cloud Run: uses default service account via applicationDefault()
 * On local dev: uses project config without credentials
 */
function initializeFirebase(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  try {
    // Production (Cloud Run): use Application Default Credentials
    if (process.env.NODE_ENV === 'production') {
      return admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }

    // Check for explicit service account
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }

    // Development: use demo project
    return admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'syncspace-demo',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'syncspace-demo.appspot.com',
    });
  } catch (error) {
    console.error('Firebase Admin init error:', error);
    return admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'syncspace-demo',
    });
  }
}

const app = initializeFirebase();

/** Firestore database instance */
export const db = admin.firestore();

/** Firebase Auth instance */
export const auth = admin.auth();

/** Firebase Storage bucket */
export const storage = admin.storage();

/** Firebase messaging - may not be available in all environments */
let messagingInstance: admin.messaging.Messaging | null = null;
try {
  messagingInstance = admin.messaging();
} catch {
  console.warn('Firebase Messaging not available');
}
export const messaging = messagingInstance;

export default app;


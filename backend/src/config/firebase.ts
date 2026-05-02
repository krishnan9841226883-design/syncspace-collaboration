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
function initializeFirebase(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  // Check if service account credentials are provided
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (serviceAccountPath) {
    // Production: use service account
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
}

const app = initializeFirebase();

/** Firestore database instance */
export const db = admin.firestore();

/** Firebase Auth instance */
export const auth = admin.auth();

/** Firebase Storage bucket */
export const storage = admin.storage();

/** Firebase messaging (for push notifications) */
export const messaging = admin.messaging();

export default app;

// Firebase Configuration
// ⚠️ SECURITY: Using environment variables to keep config private
// 
// Setup Instructions:
// 1. Copy .env.example to .env in the react-app folder
// 2. Fill in your Firebase values in .env file
// 3. NEVER commit .env file to git (it's in .gitignore)
// 
// To get your Firebase config:
// 1. Go to Firebase Console: https://console.firebase.google.com/
// 2. Select your project → Project Settings (⚙️)
// 3. Scroll to "Your apps" → Copy config values
// 4. Paste each value into your .env file

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase config from environment variables (secure approach)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate that all required config values are present
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:', missingVars);
  console.error('📝 Please create .env file from .env.example and fill in your Firebase config');
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and db instances
export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;

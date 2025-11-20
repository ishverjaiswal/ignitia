// firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Load config from environment variables (IMPORTANT for Vercel)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase ONLY on the client to avoid server-side auth initialization
let app = null
let auth = null
let db = null

if (typeof window !== 'undefined') {
  // Avoid re-initializing if HMR or multiple bundles load this file
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }

  try {
    auth = getAuth(app)
  } catch (e) {
    // If auth initialization fails on client, log and continue (guarded usage expected)
    // eslint-disable-next-line no-console
    console.warn('Firebase auth init warning:', e)
    auth = null
  }

  try {
    db = getFirestore(app)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Firestore init warning:', e)
    db = null
  }
}

export { auth, db }
export const googleProvider = new GoogleAuthProvider()

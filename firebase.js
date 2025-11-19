// Firebase initialization (v10 modular SDK)
// IMPORTANT: Replace the config object values with your Firebase project config
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCDryGZCl4F3QmRzgNcJW0H6Xn1OAD_7eQ",
  authDomain: "jeevansetu-8e61f.firebaseapp.com",
  projectId: "jeevansetu-8e61f",
  storageBucket: "jeevansetu-8e61f.firebasestorage.app",
  messagingSenderId: "975736397759",
  appId: "1:975736397759:web:34c130a6e8e8378d9d8b0a",
  measurementId: "G-RPTCM295NR"
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Export auth, provider and firestore instances for use across the app
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)

// You can import { auth, db, googleProvider } from './firebase' in other files

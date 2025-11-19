// AuthContext.js - provides auth state and methods to the app
import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db, googleProvider } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'

const AuthContext = createContext()

// Hook to use auth context
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Signup with email & password, then store user in Firestore
  const signup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      const userDoc = {
        uid,
        name: name || '',
        email,
        role: 'user',
        createdAt: serverTimestamp(),
      }

      // Save user document in 'users' collection
      await setDoc(doc(db, 'users', uid), userDoc)

      // Fetch the saved document so we can set the context immediately
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        // Normalize and set user with profile
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || null,
          profile: docSnap.data(),
        })
      } else {
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || null,
          profile: null,
        })
      }

      return userCredential
    } catch (err) {
      throw err
    }
  }

  // Login with email & password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      // After login, fetch user doc and set it on context so redirects work immediately
      const uid = userCredential.user.uid
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        console.log('User doc:', userSnap.data())
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || null,
          profile: userSnap.data(),
        })
      } else {
        console.log('No user document found for uid:', uid)
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || null,
          profile: null,
        })
      }
      return userCredential
    } catch (err) {
      throw err
    }
  }

  // Logout
  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  // Send password reset email
  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email)
  }

  // Sign in with Google; if new user, create Firestore doc
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user
      const uid = firebaseUser.uid

      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        // Save new user data
        const userDoc = {
          uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          role: 'user',
          createdAt: serverTimestamp(),
        }
        await setDoc(userRef, userDoc)
      }

      // Fetch (or re-fetch) the document to get the stored profile
      const finalSnap = await getDoc(userRef)
      if (finalSnap.exists()) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || null,
          profile: finalSnap.data(),
        })
      } else {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || null,
          profile: null,
        })
      }

      return result
    } catch (err) {
      throw err
    }
  }

  // Listen for auth state changes and persist user across reloads
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Optionally fetch Firestore user doc and merge additional data
        try {
          const docRef = doc(db, 'users', currentUser.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const normalized = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || null,
              profile: docSnap.data(),
            }
            setUser(normalized)
          } else {
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || null,
              profile: null,
            })
          }
        } catch (err) {
          console.error('Failed to fetch user doc on auth change:', err)
          setUser(currentUser)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    signInWithGoogle,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

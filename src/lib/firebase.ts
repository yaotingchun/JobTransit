import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Clean Firebase configuration with safe project fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBashU8JtBdXPZRiAGBh1CLOQM5k2n2Y-o',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'jobtransit.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'jobtransit',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'jobtransit.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '997674712625',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:997674712625:web:1461b8d6cb6b11fc551f10',
}

// Safely initialize Firebase app without crashing
let app: any = null
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
} catch (e) {
  console.warn('Firebase initializeApp warning:', e)
}

// Safely initialize Auth
let authInstance: Auth = null as any
try {
  if (app && firebaseConfig.apiKey) {
    authInstance = getAuth(app)
  }
} catch (e) {
  console.warn('Firebase getAuth warning:', e)
}

// Safely initialize Firestore
let dbInstance: Firestore = null as any
try {
  if (app) {
    dbInstance = getFirestore(app)
  }
} catch (e) {
  console.warn('Firebase getFirestore warning:', e)
}

export const auth = authInstance
export const db = dbInstance



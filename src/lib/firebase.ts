import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBashU8JtBdXPZRiAGBh1CLOQM5k2n2Y-o",
  authDomain: "jobtransit.firebaseapp.com",
  projectId: "jobtransit",
  storageBucket: "jobtransit.firebasestorage.app",
  messagingSenderId: "997674712625",
  appId: "1:997674712625:web:1461b8d6cb6b11fc551f10"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)


import { initializeApp } from "firebase/app"
import { getAuth, updateProfile } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCO3EIFvV0lQDG4FmEyjkdbRD_apjAmMyg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dev-app-1c126.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dev-app-1c126",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dev-app-1c126.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "829922286793",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:829922286793:web:70c1174cb8ee86baac8118",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-LYZSGMBJ0Q"
}
// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Helper function to update user profile
const updateUserProfile = async (user, profileData) => {
  try {
    await updateProfile(user, profileData)
    return user
  } catch (error) {
    throw error
  }
}

export { app, auth, db, storage, updateProfile, updateUserProfile }

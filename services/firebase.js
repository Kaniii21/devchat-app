import { initializeApp } from "firebase/app"
import { getAuth, updateProfile } from "firebase/auth"
import { getFirestore, doc, updateDoc } from "firebase/firestore"
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

console.log("Initializing Firebase with config:", {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? "present" : "missing",
});

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

console.log("Firebase initialized successfully");
console.log("Project ID:", firebaseConfig.projectId);

// Helper function to update user profile
const updateUserProfile = async (user, profileData) => {
  try {
    console.log("Updating user profile with data:", profileData);
    
    // Check if user is a valid Firebase auth user object
    if (!user || typeof user.getIdToken !== 'function') {
      console.error("Invalid user object provided to updateUserProfile");
      throw new Error("Invalid user object. Please re-authenticate and try again.");
    }
    
    // Only update auth profile with safe data (no large base64 strings)
    const authUpdateData = {};
    if (profileData.displayName !== undefined) {
      authUpdateData.displayName = profileData.displayName;
    }
    
    // Only set photoURL on auth if it's a regular URL (not base64) and not too long
    if (profileData.photoURL && 
        profileData.photoURL.startsWith('http') && 
        profileData.photoURL.length < 500) {
      authUpdateData.photoURL = profileData.photoURL;
    }
    
    // Update Firebase Auth profile
    await updateProfile(user, authUpdateData);
    
    // Also update the user document in Firestore
    const userDocRef = doc(db, "users", user.uid);
    
    // Only include fields that we want to update
    const firestoreUpdate = {};
    if (profileData.displayName !== undefined) {
      firestoreUpdate.displayName = profileData.displayName;
    }
    if (profileData.photoURL !== undefined) {
      firestoreUpdate.photoURL = profileData.photoURL;
    }
    
    firestoreUpdate.updatedAt = new Date();
    
    await updateDoc(userDocRef, firestoreUpdate);
    console.log("User profile updated successfully in both Auth and Firestore");
    
    return user;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export { app, auth, db, storage, updateProfile, updateUserProfile }

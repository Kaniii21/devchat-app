"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { doc, setDoc, getDoc, getFirestore } from "firebase/firestore";
import { GithubAuthProvider } from "firebase/auth"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth"
import { auth,app } from "@/services/firebase"

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const db = getFirestore(app);
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const getUserData = async (uid) => {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  };

  // Google Login
  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const userData = userCredential.user;
      const userDocRef = doc(db, "users", userData.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          isAdmin: false,
        });
      }
        const userDataFromDb = await getUserData(userData.uid)
        setUser(userDataFromDb)
      }
     catch (error) {
      throw error
    }
  }

  // Github Login

  const githubLogin = async () => {
    try {
        const provider = new GithubAuthProvider()
        const userCredential = await signInWithPopup(auth, provider);
        const userData = userCredential.user;
        const userDocRef = doc(db, "users", userData.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            uid: userData.uid,
            email: userData.email,
            displayName: userData.displayName,
            isAdmin: false,
          });
        }
        setUser(await getUserData(userData.uid))
    } catch (error) {
        throw error
    }
  }

  // Register a new user
  const register = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update the user profile with display name
      if (userCredential.user) {
        displayName && await firebaseUpdateProfile(userCredential.user, {
          displayName: displayName,
        })
      }
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        isAdmin: false,
      });

      return userCredential.user
    } catch (error) {
      throw error
    }
  }

  // Login existing user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDataFromDb = await getUserData(userCredential.user.uid);
      setUser({
        ...userDataFromDb,
        uid: userCredential.user.uid
      });
      return userCredential.user
    } catch (error) {
      throw error
    }
  }

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      throw error
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        getUserData(currentUser.uid).then((userData) => {
          setUser(userData);
        });
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    isAdmin: user?.isAdmin,
    register,
    login,
    googleLogin,
    githubLogin,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

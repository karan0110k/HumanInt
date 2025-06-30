// Import the functions you need from the SDKs you need

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyCVPRqyettf4Olm4Ic7zzihssxe1wk5jY4",
  authDomain: "humint-chat-app.firebaseapp.com",
  projectId: "humint-chat-app",
  storageBucket: "humint-chat-app.firebasestorage.app",
  messagingSenderId: "354798216077",
  appId: "1:354798216077:web:6a08faf62cb5dbe3c913c4",
  measurementId: "G-2DQ5FY0XVE"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export its functions
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Function to sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    alert(error.message);
    return null;
  }
};
 
// Function to register a new user with email and password
export const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    // Update the new user's profile with their name
    await updateProfile(res.user, {
      displayName: name,
    });
    return res.user;
  } catch (err) {
    console.error(err);
    alert(err.message);
    return null;
  }
};

// Function to sign in a user with email and password
export const signInWithEmailAndPassword_ = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  } catch (err) {
    console.error(err);
    alert(err.message);
    return null;
  }
};

// Function to sign out
export const signOut = () => {
  return auth.signOut();
};

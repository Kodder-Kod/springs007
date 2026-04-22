import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; 
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyDJRPtz9mx_bLqLAOhp-yDX9Pb-81dyxec",
  authDomain: "chisendposproduction005.firebaseapp.com",
  databaseURL: "https://chisendposproduction005-default-rtdb.firebaseio.com",
  projectId: "chisendposproduction005",
  storageBucket: "chisendposproduction005.firebasestorage.app",
  messagingSenderId: "516448594345",
  appId: "1:516448594345:web:1be158398a662005e4fcb8",
  measurementId: "G-0FW0W4V7Q1"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase services using the modular SDK
const db = getDatabase(app);

// Initialize Firebase Auth with React Native persistence
const auth = getAuth(app);

export { db, auth };



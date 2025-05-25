// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3jCeB9tFUGAbj1XSrjkRkSme98C4fGqc",
  authDomain: "webprojem-6fb9a.firebaseapp.com",
  projectId: "webprojem-6fb9a",
  storageBucket: "webprojem-6fb9a.firebasestorage.app",
  messagingSenderId: "571224024778",
  appId: "1:571224024778:web:77ab0b61a0a97e219f7633",
  measurementId: "G-M2JJY0MR0Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, collection, getDocs, addDoc };

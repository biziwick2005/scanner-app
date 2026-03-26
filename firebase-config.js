// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc, 
  orderBy, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCV14myKfUZm0JEym8dB6879ywbGrCO0sE",
  authDomain: "edureg-web.firebaseapp.com",
  projectId: "edureg-web",
  storageBucket: "edureg-web.firebasestorage.app",
  messagingSenderId: "868892427867",
  appId: "1:868892427867:web:619d6a6591f003d0e6217e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { 
  db, 
  auth, 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc, 
  orderBy, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
};
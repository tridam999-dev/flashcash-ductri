import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyAsO5K2SO1hsHc-ewi7ICO1uzDwNoVrxE4",
  authDomain: "flashcash-754b6.firebaseapp.com",
  projectId: "flashcash-754b6",
  storageBucket: "flashcash-754b6.firebasestorage.app",
  messagingSenderId: "355063345257",
  appId: "1:355063345257:web:da69a6b878d6ad2aea72f8",
  measurementId: "G-YZFSKSPXEB"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();


export {
  app,
  auth,
  db,
  storage,
  googleProvider
};
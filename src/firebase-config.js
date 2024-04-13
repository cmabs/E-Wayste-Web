import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCCKJQavilVTZguPP8Bxy0GCPVasd3Ravg",
    authDomain: "e-wayste.firebaseapp.com",
    databaseURL: "https://e-wayste-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "e-wayste",
    storageBucket: "e-wayste.appspot.com",
    messagingSenderId: "464525300272",
    appId: "1:464525300272:web:14d2cfb426fef7171f13f5",
    measurementId: "G-RW2FVF8VVL"
  };

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth, storage, firebase };
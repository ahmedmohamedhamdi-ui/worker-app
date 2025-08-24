// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDAJNO0d7YM7E6g8TQozO3oNS5QWxEkU6k",
  authDomain: "workers-30537.firebaseapp.com",
  projectId: "workers-30537",
  storageBucket: "workers-30537.firebasestorage.app",
  messagingSenderId: "480436959088",
  appId: "1:480436959088:web:bd918eab777167267541b5",
  measurementId: "G-3RZBHQLJM1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// تصدير الخدمات اللي هتستخدمها في المشروع
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

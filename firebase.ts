
// // firebase.ts
// import { getApp, getApps, initializeApp } from "firebase/app";
// import {
//     browserLocalPersistence,
//     getAuth,
//     initializeAuth,
//     type Auth, // 👈 import the type
// } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// // Your Firebase config
// const firebaseConfig = {
//   apiKey: "AIzaSyB01UkGcMTE1C5kP165UL5KYe0hGe9F-LA",
//   authDomain: "properties-1938e.firebaseapp.com",
//   projectId: "properties-1938e",
//   storageBucket: "properties-1938e.firebasestorage.app",
//   messagingSenderId: "17595301841",
//   appId: "1:17595301841:web:417f226ec368a15eb1aaf0",
//   measurementId: "G-KVE1659DRS",
// };

// // ✅ Initialize app once
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// // ✅ Firestore
// const db = getFirestore(app);

// // ✅ Auth with proper typing
// let auth: Auth;
// try {
//   auth = initializeAuth(app, {
//     persistence: browserLocalPersistence,
//   });
// } catch {
//   auth = getAuth(app);
// }

// export { app, auth, db };


import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 👈 add this

const firebaseConfig = {
  apiKey: "AIzaSyB01UkGcMTE1C5kP165UL5KYe0hGe9F-LA",
  authDomain: "properties-1938e.firebaseapp.com",
  projectId: "properties-1938e",
  storageBucket: "properties-1938e.firebasestorage.app", // 👈 fix ".app" to ".appspot.com"
  messagingSenderId: "17595301841",
  appId: "1:17595301841:web:417f226ec368a15eb1aaf0",
  measurementId: "G-KVE1659DRS",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app); // 👈 add storage

let auth: Auth;
try {
  auth = initializeAuth(app, { persistence: browserLocalPersistence });
} catch {
  auth = getAuth(app);
}

export { app, auth, db, storage };


// firebase.ts
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  // 💡  IDE/TypeScript is complaining about this import:
  // @ts-ignore
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // ... your config details
  apiKey: "AIzaSyB01UkGcMTE1C5kP165UL5KYe0hGe9F-LA",
  authDomain: "properties-1938e.firebaseapp.com",
  projectId: "properties-1938e",
  // FIX: corrected storage bucket domain
  storageBucket: "properties-1938e.firebasestorage.app", 
  messagingSenderId: "17595301841",
  appId: "1:17595301841:web:417f226ec368a15eb1aaf0",
  measurementId: "G-KVE1659DRS",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);

let auth: Auth;
try {
  // 💡 CRUCIAL CHANGE: Use getReactNativePersistence with AsyncStorage
  // The @ts-ignore handles the compile-time error.
  auth = initializeAuth(app, { 
    persistence: getReactNativePersistence(ReactNativeAsyncStorage), 
  });
} catch {
  auth = getAuth(app);
}

export { app, auth, db, storage };

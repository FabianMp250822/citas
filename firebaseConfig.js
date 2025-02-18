// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

let app, db, functions, auth, storage, analytics;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicializamos Firebase **solo** en el cliente.
if (typeof window !== "undefined" && !app) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  functions = getFunctions(app);
  auth = getAuth(app);
  storage = getStorage(app);

  // Inicialización condicional de Analytics
  (async () => {
    const analyticsIsSupported = await isSupported();
    if (analyticsIsSupported) {
      analytics = getAnalytics(app);
      console.log("Firebase Analytics inicializado.");
    } else {
      console.warn("Firebase Analytics no está disponible en este entorno.");
      analytics = null;
    }
  })();
}

export { app, db, functions, auth, storage, analytics };

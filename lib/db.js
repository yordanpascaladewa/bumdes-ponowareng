import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  // ⚠️ PASTE CONFIG FIREBASE KAMU DI SINI ⚠️
  apiKey: "AIzaSy...",
  authDomain: "bumdes-ponowareng...",
  databaseURL: "https://bumdes-ponowareng-default-rtdb.firebaseio.com",
  projectId: "bumdes-ponowareng",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

// Mencegah error "Firebase App already initialized"
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// INI YANG BIKIN ERROR TADI (Lupa di-export)
export const database = getDatabase(app);
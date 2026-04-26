// src/firebase.js
// 🔥 Firebase setup with Anonymous Authentication

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, remove } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDg-duYytMJito9hY9cDqZavBztPjqeVGI",
  authDomain: "mylicense-app.firebaseapp.com",
  databaseURL: "https://mylicense-app-default-rtdb.firebaseio.com",
  projectId: "mylicense-app",
  storageBucket: "mylicense-app.firebasestorage.app",
  messagingSenderId: "691283527272",
  appId: "1:691283527272:web:7a2a52a43d3d470e565ddd",
  measurementId: "G-0CWSSH66HZ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// ============ Anonymous Sign-In ============
// Every user gets a unique uid automatically
signInAnonymously(auth).catch((error) => {
  console.error("Auth error:", error);
});

// ============ window.storage API ============
// Save, read, delete, list in user's private path

window.storage = {
  set: async (key, value, shared = false) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      const userId = user.uid;
      const path = shared
        ? `shared/${key.replace(/:/g, "__")}`
        : `private/${userId}/${key.replace(/:/g, "__")}`;
      
      await set(ref(db, path), value);
      return { key, value, shared };
    } catch (err) {
      console.error("Storage.set error:", err);
      throw err;
    }
  },

  get: async (key, shared = false) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      const userId = user.uid;
      const path = shared
        ? `shared/${key.replace(/:/g, "__")}`
        : `private/${userId}/${key.replace(/:/g, "__")}`;
      
      const snapshot = await get(ref(db, path));
      if (!snapshot.exists()) throw new Error("Key not found");
      return { key, value: snapshot.val(), shared };
    } catch (err) {
      console.error("Storage.get error:", err);
      throw err;
    }
  },

  delete: async (key, shared = false) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      const userId = user.uid;
      const path = shared
        ? `shared/${key.replace(/:/g, "__")}`
        : `private/${userId}/${key.replace(/:/g, "__")}`;
      
      await remove(ref(db, path));
      return { key, deleted: true, shared };
    } catch (err) {
      console.error("Storage.delete error:", err);
      throw err;
    }
  },

  list: async (prefix, shared = false) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      const userId = user.uid;
      const basePath = shared
        ? `shared`
        : `private/${userId}`;
      
      const snapshot = await get(ref(db, basePath));
      if (!snapshot.exists()) return { keys: [] };
      
      const safePrefix = prefix.replace(/:/g, "__");
      const allKeys = Object.keys(snapshot.val() || {});
      const filtered = allKeys.filter(k => k.startsWith(safePrefix));
      
      return { keys: filtered };
    } catch (err) {
      console.error("Storage.list error:", err);
      throw err;
    }
  }
};

// ============ Helper: Get current user ID ============
export function getCurrentUserId() {
  const user = auth.currentUser;
  return user ? user.uid : null;
}
window.auth = auth;
export { auth, db, app };

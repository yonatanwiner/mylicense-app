// src/firebase.js
// 🔥 החלף את הערכים האלה בערכים מ-Firebase Console שלך!
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, remove, query, orderByKey, startAt } from "firebase/database";

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

// ============================================================
// window.storage - אותו API שהאפליקציה כבר משתמשת בו!
// פשוט עכשיו זה הולך ל-Firebase במקום לדפדפן
// ============================================================

const PRIVATE_PREFIX = "private";
const SHARED_PREFIX = "shared";

window.storage = {
  // שמירה
  set: async (key, value, shared = false) => {
    const path = shared
      ? `${SHARED_PREFIX}/${key.replace(/:/g, "__")}`
      : `${PRIVATE_PREFIX}/${getUserId()}/${key.replace(/:/g, "__")}`;
    await set(ref(db, path), value);
    return { key, value, shared };
  },

  // קריאה
  get: async (key, shared = false) => {
    const path = shared
      ? `${SHARED_PREFIX}/${key.replace(/:/g, "__")}`
      : `${PRIVATE_PREFIX}/${getUserId()}/${key.replace(/:/g, "__")}`;
    const snapshot = await get(ref(db, path));
    if (!snapshot.exists()) throw new Error("Key not found");
    return { key, value: snapshot.val(), shared };
  },

  // מחיקה
  delete: async (key, shared = false) => {
    const path = shared
      ? `${SHARED_PREFIX}/${key.replace(/:/g, "__")}`
      : `${PRIVATE_PREFIX}/${getUserId()}/${key.replace(/:/g, "__")}`;
    await remove(ref(db, path));
    return { key, deleted: true, shared };
  },

  // רשימה לפי prefix
  list: async (prefix, shared = false) => {
    const basePath = shared
      ? `${SHARED_PREFIX}`
      : `${PRIVATE_PREFIX}/${getUserId()}`;
    const snapshot = await get(ref(db, basePath));
    if (!snapshot.exists()) return { keys: [] };
    const safePrefix = prefix.replace(/:/g, "__");
    const allKeys = Object.keys(snapshot.val() || {});
    const filtered = allKeys
      .filter(k => k.startsWith(safePrefix))
      .map(k => (shared ? `${SHARED_PREFIX}/${k}` : `${PRIVATE_PREFIX}/${getUserId()}/${k}`));
    return { keys: filtered };
  }
};

// עוזר לזהות משתמש נוכחי (מ-localStorage)
function getUserId() {
  try {
    const u = localStorage.getItem("current_user_id");
    return u || "anonymous";
  } catch {
    return "anonymous";
  }
}

// שמירת userId ב-localStorage בעת לוגין
export function setCurrentUserId(id) {
  localStorage.setItem("current_user_id", id);
}

export { db };

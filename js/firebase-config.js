// Firebase Configuration — Realtime Database + Auth
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyClS4GmdFnhfaDHP3wfkIBYoMkK_dQ5I8g",
  authDomain: "alquiler-de-lavadora-1.firebaseapp.com",
  databaseURL: "https://alquiler-de-lavadora-1-default-rtdb.firebaseio.com",
  projectId: "alquiler-de-lavadora-1",
  storageBucket: "alquiler-de-lavadora-1.firebasestorage.app",
  messagingSenderId: "823866528549",
  appId: "1:823866528549:web:15a8e587e8d2325a4300cc",
  measurementId: "G-49D42Y9W03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// Auth helper functions
export const authService = {
  /** Login with email and password */
  async login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  /** Register new user */
  async register(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred;
  },

  /** Logout */
  async logout() {
    return signOut(auth);
  },

  /** Get current user (or null) */
  getCurrentUser() {
    return auth.currentUser;
  },

  /** Get current user UID */
  getUid() {
    return auth.currentUser ? auth.currentUser.uid : null;
  },

  /** Subscribe to auth state changes */
  onAuthChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

// Firebase Configuration — Realtime Database
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js';

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

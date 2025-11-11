// --- 1. අවශ්‍ය Libraries Import කිරීම (V9/V10 Style) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// --- 2. Firebase Config (ඔබගේ Keys) ---
const firebaseConfig = {
  apiKey: "AIzaSyBtQpkSjQd34usmWC9RZMiIr30J8RAjlMg",
  authDomain: "ai-business-app-6f699.firebaseapp.com",
  projectId: "ai-business-app-6f699",
  storageBucket: "ai-business-app-6f699.firebasestorage.app",
  messagingSenderId: "364582897137",
  appId: "1:364582897137:web:3c0c89f27cb35b0da4b050"
};


// --- 3. Firebase App එක ආරම්භ කිරීම ---
const app = initializeApp(firebaseConfig);

// --- 4. සේවාවන් Export කිරීම (නිවැරදි V9/V10 ක්‍රමවේදය) ---
// 🚨 getAuth/getFirestore භාවිතයෙන් සේවාවන් ලබාගැනීම
export const auth = getAuth(app);
export const db = getFirestore(app);

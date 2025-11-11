// --- 1. Firebase Compat Libraries Import කිරීම ---
// අපි compat.js versions භාවිත කරමු.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";


// --- 2. Firebase Config (ඔබගේම Keys) ---
const firebaseConfig = {
  apiKey: "AIzaSyBtQpkSjQd34usmWC9RZMiIr30J8RAjlMg",
  authDomain: "ai-business-app-6f699.firebaseapp.com",
  projectId: "ai-business-app-6f699",
  storageBucket: "ai-business-app-6f699.firebasestorage.app",
  messagingSenderId: "364582897137",
  appId: "1:364582897137:web:3c0c89f27cb35b0da4b050"
};

// --- 3. Firebase App එක ආරම්භ කිරීම (initialize) ---
// මෙය app එක ආරම්භ කරන අතර, අනෙක් modules වලට සේවාවන් ලබාදේ.
const app = firebase.initializeApp(firebaseConfig);

// --- 4. සේවාවන් Export කිරීම (V8/V9 Compat Style) ---
export const auth = app.auth();
export const db = app.firestore();

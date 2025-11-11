// --- 1. Firebase Compat Libraries Import කිරීම (මෙහිදී පමණයි) ---
// Note: අපි auth.js/ai.js වලට V9 module imports භාවිත කළ නිසා, config ගොනුවටත් V9 style එක ගෙනෙමු.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// --- 2. Firebase Config (ඔබගේම Keys) ---
const firebaseConfig = {
  apiKey: "AIzaSyBtQpkSjQd34usmWC9RZMiIr30J8RAjlMg", // <--- ඔබේ API Key
  authDomain: "ai-business-app-6f699.firebaseapp.com",
  projectId: "ai-business-app-6f699",
  storageBucket: "ai-business-app-6f699.firebasestorage.app",
  messagingSenderId: "364582897137",
  appId: "1:364582897137:web:3c0c89f27cb35b0da4b050"
};

// --- 3. Firebase App එක ආරම්භ කිරීම (initialize) ---
const app = initializeApp(firebaseConfig);

// --- 4. සේවාවන් Export කිරීම (V9/V10 Standard) ---
// මෙම auth සහ db instances අනෙක් JS modules වලට අවශ්‍ය වේ.
export const auth = getAuth(app);
export const db = getFirestore(app);

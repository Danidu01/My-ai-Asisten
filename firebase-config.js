// --- Firebase Config (auth.js වෙතින් ගනු ලැබේ) ---
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_KEY...w1Y", // <--- ඔබේ API Key එක
  authDomain: "ai-business-app-6f699.firebaseapp.com", // <--- ඔබේ Auth Domain එක
  projectId: "ai-business-app-6f699", // <--- ඔබේ Project ID එක
  storageBucket: "ai-business-app-6f699.firebasestorage.app",
  messagingSenderId: "364582897137",
  appId: "1:364582897137:web:3c0c89f27cb35b0da4b050"
};

// --- Firebase App එක ආරම්භ කිරීම ---
// මෙහිදී App එක initialize කර, එය export කරමු.
const app = firebase.initializeApp(firebaseConfig);

// --- සේවාවන් Export කිරීම ---
export const auth = app.auth();
export const db = app.firestore();

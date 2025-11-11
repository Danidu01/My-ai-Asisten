// --- 1. Firebase Config (ඔබගේම Keys) ---
const firebaseConfig = {
  apiKey: "AIzaSyBtQpkSjQd34usmWC9RZMiIr30J8RAjlMg", // <--- ඔබේ API Key
  authDomain: "ai-business-app-6f699.firebaseapp.com",
  projectId: "ai-business-app-6f699",
  storageBucket: "ai-business-app-6f699.firebasestorage.app",
  messagingSenderId: "364582897137",
  appId: "1:364582897137:web:3c0c89f27cb35b0da4b050"
};

// --- 2. Firebase App එක ආරම්භ කිරීම (initialize) ---
// මෙය app එක ආරම්භ කරන අතර, අනෙක් modules වලට සේවාවන් ලබාදේ.
const app = firebase.initializeApp(firebaseConfig);

// V8 Compat Global Access සඳහා:
const auth = app.auth();
const db = app.firestore();

export { auth, db, app };

/* ---
   AI ව්‍යාපාරික සහයකයා - Authentication Logic (auth.js)
--- */

// --- 1. Firebase සේවාවන් Import කිරීම ---
// (මෙම functions අපිට Firebase CDN එකෙන් ලැබේ)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- 2. Firebase Config (ඔබගේම API Keys) ---
// ඔබ ලබාදුන් config තොරතුරු මෙහි ඇතුළත් කර ඇත
const firebaseConfig = {
  apiKey: "AIzaSyBtQpkSjQd34usmWC9RZMiIr30J8RAjlMg",
  authDomain: "ai-business-app-6f699.firebaseapp.com",
  projectId: "ai-business-app-6f699",
  storageBucket: "ai-business-app-6f699.firebasestorage.app",
  messagingSenderId: "364582897137",
  appId: "1:364582897137:web:3c0c89f27cb35b0da4b050"
};

// --- 3. Firebase App එක Initialize කිරීම ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Authentication සේවාව ලබාගැනීම

// --- 4. Session Management (Security Guard) ---
// මෙම function එක පරිශීලකයා login ද, logout ද කියා නිරන්තරයෙන් පරීක්ෂා කරයි
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname; // දැනට සිටින පිටුව

    if (user) {
        // User ලොග් වී ඇත්නම් (Authenticated)
        console.log("User is logged in:", user.email);
        
        // User login වී, සිටින්නේ login හෝ register පිටුවේ නම්, app.html වෙත යොමු කරන්න
        if (currentPage.endsWith("index.html") || currentPage.endsWith("register.html") || currentPage === "/") {
            window.location.href = "app.html";
        }
    } else {
        // User ලොග් වී නැත්නම් (Logged out)
        console.log("User is logged out");

        // User login වී නැත්නම්, සහ app.html (ප්‍රධාන පිටුවේ) සිටීනම්, login පිටුවට යොමු කරන්න
        if (currentPage.endsWith("app.html")) {
            window.location.href = "index.html";
        }
    }
});

// --- 5. Register පිටුව (`register.html`) සඳහා Logic ---
// 'registerForm' එකක් ඇත්නම් පමණක් මෙම කේතය ක්‍රියාත්මක වේ
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Form එක submit වීම නැවැත්වීම
        
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            // Firebase මගින් අලුත් user කෙනෙක් නිර්මාණය කිරීම
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User registered:", userCredential.user);
            // සාර්ථකව register වූ වහාම app.html වෙත යොමු වේ (මෙය ඉහත 'onAuthStateChanged' මගින් සිදුවේ)
        } catch (error) {
            console.error("Register Error:", error.message);
            alert("Register වීමේ දෝෂයක්: " + error.message);
        }
    });
}

// --- 6. Login පිටුව (`index.html`) සඳහා Logic ---
// 'loginForm' එකක් ඇත්නම් පමණක් මෙම කේතය ක්‍රියාත්මක වේ
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            // Firebase මගින් user කෙනෙක්ව login කිරීම
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in:", userCredential.user);
            // සාර්ථකව login වූ වහාම app.html වෙත යොමු වේ
        } catch (error) {
            console.error("Login Error:", error.message);
            alert("Login වීමේ දෝෂයක්: " + error.message);
        }
    });
}

// --- 7. Logout බොත්තම (`app.html`) සඳහා Logic ---
// 'logout-btn' එකක් ඇත්නම් පමණක් මෙම කේතය ක්‍රියාත්මක වේ
const logoutButton = document.getElementById("logout-btn");

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            // Firebase මගින් user ව logout කිරීම
            await signOut(auth);
            console.log("User logged out");
            // සාර්ථකව logout වූ වහාම index.html වෙත යොමු වේ (මෙය 'onAuthStateChanged' මගින් සිදුවේ)
        } catch (error) {
            console.error("Logout Error:", error.message);
            alert("Logout වීමේ දෝෂයක්: " + error.message);
        }
    });
}
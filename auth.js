// --- Firebase Config ගොනුවෙන් Auth සේවාව Import කරයි ---
import { auth } from "./firebase-config.js"; 

// --- 1. Session Management (Redirects) ---
auth.onAuthStateChanged((user) => {
    const currentPage = window.location.pathname;

    if (user) {
        // User ලොග් වී ඇත්නම්, app.html වෙත යොමු කරන්න
        if (currentPage.endsWith("index.html") || currentPage.endsWith("register.html") || currentPage === "/") {
            window.location.href = "app.html";
        }
    } else {
        // User ලොග් වී නැත්නම්, index.html වෙත යොමු කරන්න
        if (currentPage.endsWith("app.html") || currentPage.endsWith("my-posts.html")) {
            window.location.href = "index.html";
        }
    }
});

// --- 2. Register පිටුව (`register.html`) සඳහා Logic ---
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // 🚨🚨 Refresh වීම වළක්වයි
        
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        try {
            await auth.createUserWithEmailAndPassword(email, password);
        } catch (error) {
            alert("Register වීමේ දෝෂයක්: " + error.message);
        }
    });
}

// --- 3. Login පිටුව (`index.html`) සඳහා Logic ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // 🚨🚨 Refresh වීම වළක්වයි
        
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            alert("Login වීමේ දෝෂයක්: " + error.message);
        }
    });
}

// --- 4. Logout බොත්තම සඳහා Logic ---
const logoutButton = document.getElementById("logout-btn");
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await auth.signOut();
        } catch (error) {
            alert("Logout වීමේ දෝෂයක්: " + error.message);
        }
    });
}

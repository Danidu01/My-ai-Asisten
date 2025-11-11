// --- 1. අවශ්‍ය Libraries Import කිරීම ---
// 🚨🚨 config.js ගොනුවෙන් Auth සේවාව Import කරනු ලැබේ
import { auth } from "./firebase-config.js"; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// --- 2. Session Management (Security Guard) ---
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname;

    if (user) {
        // User ලොග් වී ඇත්නම්
        if (currentPage.endsWith("index.html") || currentPage.endsWith("register.html") || currentPage === "/") {
            window.location.href = "app.html";
        }
    } else {
        // User ලොග් වී නැත්නම්
        if (currentPage.endsWith("app.html") || currentPage.endsWith("my-posts.html")) {
            window.location.href = "index.html";
        }
    }
});

// --- 3. Register පිටුව (`register.html`) සඳහා Logic ---
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert("Register වීමේ දෝෂයක්: " + error.message);
        }
    });
}

// --- 4. Login පිටුව (`index.html`) සඳහා Logic ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert("Login වීමේ දෝෂයක්: " + error.message);
        }
    });
}

// --- 5. Logout බොත්තම සඳහා Logic ---
const logoutButton = document.getElementById("logout-btn");
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await signOut(auth);
        } catch (error) {
            alert("Logout වීමේ දෝෂයක්: " + error.message);
        }
    });
}

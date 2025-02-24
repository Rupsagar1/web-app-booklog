import { auth, googleProvider } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const registerForm = document.getElementById("register-form");
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Registered:", userCredential.user);
                alert("Account created successfully! Please log in.");
                window.location.href = "login.html";
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Logged in:", userCredential.user);
                
                localStorage.setItem("email", email);
                localStorage.setItem("password", password);

                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

const googleLogin = document.getElementById("google-login");
if (googleLogin) {
    googleLogin.addEventListener("click", () => {
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                console.log("Google sign-in successful:", result.user);
                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

const logoutButton = document.getElementById("logout");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        signOut(auth).then(() => {
            localStorage.removeItem("email");
            localStorage.removeItem("password");

            window.location.href = "login.html";
        }).catch((error) => {
            alert(error.message);
        });
    });
}

onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.includes("login.html")) {
        window.location.href = "dashboard.html";
    }
});

window.onload = () => {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    emailInput.value = "";
    passwordInput.value = "";

    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");

    if (savedEmail && savedPassword) {
        emailInput.value = savedEmail;
        passwordInput.value = savedPassword;
    }
};

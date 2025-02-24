import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDwmxIAm-XsUmZy1iTMQfYeFuWPMP5NdAo",
    authDomain: "book-log-c0eed.firebaseapp.com",
    projectId: "book-log-c0eed",
    storageBucket: "book-log-c0eed.appspot.com",  
    messagingSenderId: "200082359852",
    appId: "1:200082359852:web:0efd105e30db679f1a3389",
    measurementId: "G-B3RW6VMQZ6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

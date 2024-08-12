import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCCxm-GqUVd5xM9qAcFbKwYlMwkUIOLSnU",
    authDomain: "login-79163.firebaseapp.com",
    projectId: "login-79163",
    storageBucket: "login-79163.appspot.com",
    messagingSenderId: "527803141345",
    appId: "1:527803141345:web:054b8b61a51f9226a7bba0",
    measurementId: "G-M7GGCZ7H6X"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig, 'myApp');
const auth = getAuth(app);

function updateUserProfile(user) {
    // const userName = user ? user.displayName : "Guest";
    const userEmail = user.email != null ? user.email : "Guest";
    console.log(userEmail)

    document.getElementById("userEmail").textContent = userEmail;
}

// Listen for changes in the authentication state
var user = JSON.parse(localStorage.getItem("user"))
if (user) {
    updateUserProfile(user);
} else {
    alert("Create Account & login");
}

// Optionally, you can use updateUserProfile() to update the user's profile immediately after the page loads
document.addEventListener("DOMContentLoaded", function() {
    updateUserProfile(auth.currentUser);
});
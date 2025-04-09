import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { debug, debugError, debugInfo } from './debug.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCch3wlj9ft1psd8yEypdNA33C-7qCI4e0",
    authDomain: "test-a382b.firebaseapp.com",
    projectId: "test-a382b",
    storageBucket: "test-a382b.firebasestorage.app",
    messagingSenderId: "763775183510",
    appId: "1:763775183510:web:110e3b3a6c1c66ef6270b7",
    measurementId: "G-9N3C5LP43H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

debug('Coffee shop login script loaded');

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        debugInfo('User already logged in, redirecting to dashboard');
        window.location.href = 'coffee-shop-dashboard.html';
    }
});

// Handle form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    debug('Login form submitted');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const messageDiv = document.getElementById('message');

    try {
        debug('Attempting to sign in with email:', email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store session based on remember me preference
        if (remember) {
            localStorage.setItem('userSession', user.uid);
        } else {
            sessionStorage.setItem('userSession', user.uid);
        }

        debugInfo('Login successful, redirecting to dashboard');
        window.location.href = 'coffee-shop-dashboard.html';
    } catch (error) {
        debugError('Login error:', error);
        let errorMessage = 'An error occurred during login.';
        
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = 'Invalid email or password.';
                break;
        }
        
        messageDiv.textContent = errorMessage;
        messageDiv.style.display = 'block';
    }
}); 
import { auth, db } from './firebase-config.js';
import { debug, debugError, debugInfo } from './debug.js';

debug('Login script loaded');

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            debugInfo('User already logged in, redirecting to dashboard');
            
            // Check if user is a coffee shop
            const shopSnapshot = await db.collection('coffee_shops')
                .where('userId', '==', user.uid)
                .get();
                
            if (!shopSnapshot.empty) {
                window.location.href = '/coffee-shop-dashboard.html';
            } else {
                window.location.href = '/dashboard.html';
            }
        }
    });

    // Handle form submission
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            debugInfo('Form submitted');

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember')?.checked || false;

            try {
                debugInfo('Attempting to sign in');
                
                // Sign in with Firebase
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                
                // Check if user is a coffee shop
                const shopSnapshot = await db.collection('coffee_shops')
                    .where('userId', '==', userCredential.user.uid)
                    .get();
                
                debugInfo('Login successful');
                
                // Redirect based on user type
                if (!shopSnapshot.empty) {
                    window.location.href = '/coffee-shop-dashboard.html';
                } else {
                    window.location.href = '/dashboard.html';
                }
            } catch (error) {
                debugError('Login error', error);
                let errorMessage = 'Error during login. Please try again.';
                
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    errorMessage = 'Invalid email or password.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email address.';
                } else if (error.code === 'auth/user-disabled') {
                    errorMessage = 'This account has been disabled.';
                }
                
                alert(errorMessage);
            }
        });
    }
});
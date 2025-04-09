import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { debug, debugError, debugInfo } from './debug.js';

debug('Login script loaded');

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            debugInfo('User already logged in, redirecting to dashboard');
            
            try {
                // Check if user is a coffee shop
                const shopQuery = query(
                    collection(db, 'coffee_shops'),
                    where('userId', '==', user.uid)
                );
                const shopSnapshot = await getDocs(shopQuery);
                
                if (!shopSnapshot.empty) {
                    window.location.href = '/coffee-shop-dashboard.html';
                } else {
                    window.location.href = '/dashboard.html';
                }
            } catch (error) {
                debugError('Error checking user type:', error);
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
                
                // Sign in with Firebase using the imported method
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                
                // Check if user is a coffee shop
                const shopQuery = query(
                    collection(db, 'coffee_shops'),
                    where('userId', '==', userCredential.user.uid)
                );
                const shopSnapshot = await getDocs(shopQuery);
                
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
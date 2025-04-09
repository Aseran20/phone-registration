import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const businessName = document.getElementById('businessName').value;

            // Clear previous messages
            if (messageDiv) {
                messageDiv.textContent = '';
                messageDiv.className = '';
            }

            // Validate passwords match
            if (password !== confirmPassword) {
                if (messageDiv) {
                    messageDiv.textContent = 'Passwords do not match';
                    messageDiv.className = 'error';
                }
                return;
            }

            try {
                // Create user with email and password
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Send email verification
                await sendEmailVerification(user);
                
                // Create a coffee shop document
                const coffeeShopRef = doc(db, 'coffee_shops', user.uid);
                await setDoc(coffeeShopRef, {
                    userId: user.uid,
                    businessName: businessName,
                    email: email,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                
                // Update user profile
                await user.updateProfile({
                    displayName: businessName
                });
                
                // Show success message
                if (messageDiv) {
                    messageDiv.textContent = 'Registration successful! Please check your email to verify your account.';
                    messageDiv.className = 'success';
                }
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'coffee-shop-dashboard.html';
                }, 3000);
                
            } catch (error) {
                console.error('Registration error:', error);
                
                // Show error message
                if (messageDiv) {
                    let errorMessage = 'Registration failed. Please try again.';
                    
                    if (error.code === 'auth/email-already-in-use') {
                        errorMessage = 'This email is already registered. Please use a different email or login.';
                    } else if (error.code === 'auth/weak-password') {
                        errorMessage = 'Password is too weak. Please use a stronger password.';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Invalid email address. Please check and try again.';
                    }
                    
                    messageDiv.textContent = errorMessage;
                    messageDiv.className = 'error';
                }
            }
        });
    }
    
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strengthText');
    
    if (passwordInput && strengthBar && strengthText) {
        passwordInput.addEventListener('input', () => {
            const strength = checkPasswordStrength(passwordInput.value);
            updateStrengthIndicator(strength, strengthBar, strengthText);
        });
    }
});

// Check password strength
function checkPasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character type checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 5);
}

// Update strength indicator
function updateStrengthIndicator(strength, bar, text) {
    const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    const strengthColors = ['#ff4d4d', '#ffa64d', '#ffff4d', '#4dff4d', '#4d4dff'];
    
    bar.style.width = `${(strength / 5) * 100}%`;
    bar.style.backgroundColor = strengthColors[strength - 1];
    text.textContent = strengthLabels[strength - 1];
}
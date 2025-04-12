import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, sendEmailVerification, fetchSignInMethodsForEmail, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { debug, debugError } from './debug.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');
    const emailInput = document.getElementById('email');
    const businessNameInput = document.getElementById('businessName');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Function to show error message
    const showError = (message) => {
        debugError('Registration error:', message);
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = 'message-container error';
            messageDiv.style.display = 'block';
        }
    };

    // Function to show success message
    const showSuccess = (message) => {
        debug('Registration success:', message);
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = 'message-container success';
            messageDiv.style.display = 'block';
        }
    };

    // Function to validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Function to validate business name
    const isValidBusinessName = (name) => {
        return name.length >= 2 && name.length <= 50;
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput?.value.trim();
            const password = passwordInput?.value;
            const confirmPassword = confirmPasswordInput?.value;
            const businessName = businessNameInput?.value.trim();

            // Clear previous messages
            if (messageDiv) {
                messageDiv.textContent = '';
                messageDiv.className = '';
                messageDiv.style.display = 'none';
            }

            // Validate all fields are present
            if (!email || !password || !confirmPassword || !businessName) {
                showError('Please fill in all fields');
                return;
            }

            // Validate email format
            if (!isValidEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }

            // Validate business name
            if (!isValidBusinessName(businessName)) {
                showError('Business name must be between 2 and 50 characters');
                return;
            }

            // Validate password length
            if (password.length < 8) {
                showError('Password must be at least 8 characters long');
                return;
            }

            // Validate passwords match
            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }

            try {
                // Check if email is already in use
                const signInMethods = await fetchSignInMethodsForEmail(auth, email);
                if (signInMethods.length > 0) {
                    showError('This email is already registered. Please use a different email or login.');
                    return;
                }

                // Create user with email and password
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Update user profile first
                try {
                    await updateProfile(user, {
                        displayName: businessName
                    });
                    debug('Profile updated successfully');
                } catch (profileError) {
                    debugError('Error updating profile:', profileError);
                }
                
                // Send email verification
                await sendEmailVerification(user);
                
                // Create a coffee shop document with consistent structure
                const coffeeShopRef = doc(db, 'coffee_shops', user.uid);
                await setDoc(coffeeShopRef, {
                    userId: user.uid,
                    businessName: businessName,
                    email: email,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    active: true,
                    shopId: user.uid
                });
                
                // Show success message
                showSuccess('Registration successful! Please check your email to verify your account.');
                
                // Disable form inputs
                emailInput.disabled = true;
                businessNameInput.disabled = true;
                passwordInput.disabled = true;
                confirmPasswordInput.disabled = true;
                form.querySelector('button[type="submit"]').disabled = true;
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '/coffee-shop-dashboard.html';
                }, 3000);
                
            } catch (error) {
                debugError('Registration error:', error);
                
                let errorMessage = 'Registration failed. Please try again.';
                
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'This email is already registered. Please use a different email or login.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak. Please use a stronger password.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address. Please check and try again.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your internet connection and try again.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many attempts. Please try again later.';
                        break;
                }
                
                showError(errorMessage);
            }
        });
    }
    
    // Password strength indicator
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
    
    if (strength > 0) {
        bar.style.width = `${(strength / 5) * 100}%`;
        bar.style.backgroundColor = strengthColors[strength - 1];
        text.textContent = strengthLabels[strength - 1];
    } else {
        bar.style.width = '0';
        bar.style.backgroundColor = '#e5e7eb';
        text.textContent = '';
    }
}
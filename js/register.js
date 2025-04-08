import { auth } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

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
                console.log('Attempting to create account with email:', email);
                
                // Create user with email and password
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                
                // Send email verification
                await userCredential.user.sendEmailVerification();
                
                console.log('Account created successfully:', userCredential.user);

                if (messageDiv) {
                    messageDiv.textContent = 'Registration successful! Please check your email to verify your account.';
                    messageDiv.className = 'success';
                }

                // Clear the form
                form.reset();

                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 3000);

            } catch (error) {
                console.error('Registration error:', error);
                if (messageDiv) {
                    let errorMessage = 'Error during registration. Please try again.';
                    
                    // Handle specific Firebase error codes
                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            errorMessage = 'This email is already registered. Please login instead.';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = 'Please enter a valid email address.';
                            break;
                        case 'auth/operation-not-allowed':
                            errorMessage = 'Email/password accounts are not enabled. Please contact support.';
                            break;
                        case 'auth/weak-password':
                            errorMessage = 'Please choose a stronger password.';
                            break;
                    }
                    
                    messageDiv.textContent = errorMessage;
                    messageDiv.className = 'error';
                }
            }
        });
    }
});
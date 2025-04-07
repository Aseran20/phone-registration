import { supabase } from './supabase.js';

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
                console.log('Attempting to sign up with email:', email);
                
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin + '/login.html',
                        data: {
                            email: email,
                        }
                    }
                });

                if (error) {
                    console.error('Signup error:', error);
                    throw error;
                }

                console.log('Signup successful:', data);

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
                    messageDiv.textContent = error.message || 'Error during registration. Please try again.';
                    messageDiv.className = 'error';
                }
            }
        });
    }
}); 
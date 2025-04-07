import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const rememberCheckbox = document.getElementById('remember');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = rememberCheckbox.checked;

        try {
            // Attempt to sign in with Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Store the session
            if (remember) {
                localStorage.setItem('supabase.auth.token', data.session.access_token);
            } else {
                sessionStorage.setItem('supabase.auth.token', data.session.access_token);
            }

            // Show success message
            messageDiv.textContent = 'Login successful! Redirecting to dashboard...';
            messageDiv.className = 'success';

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            console.error('Error:', error.message);
            messageDiv.textContent = error.message;
            messageDiv.className = 'error';
        }
    });
}); 
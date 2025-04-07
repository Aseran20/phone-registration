import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('acceptInviteForm');
    const messageDiv = document.getElementById('message');

    // Get the token from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        messageDiv.textContent = 'Invalid invitation link. Please contact support.';
        messageDiv.className = 'error';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            messageDiv.textContent = 'Passwords do not match';
            messageDiv.className = 'error';
            return;
        }

        try {
            // Update the user's password using the invitation token
            const { data, error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            messageDiv.textContent = 'Password set successfully! Redirecting to login...';
            messageDiv.className = 'success';

            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Error:', error.message);
            messageDiv.textContent = error.message;
            messageDiv.className = 'error';
        }
    });
}); 
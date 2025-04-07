import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('acceptInviteForm');
    const messageDiv = document.getElementById('message');

    // Get the stored token
    const token = localStorage.getItem('supabase.auth.token');

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
            // Set the session with the token
            const { data: { session }, error: sessionError } = await supabase.auth.setSession({
                access_token: token,
                refresh_token: localStorage.getItem('supabase.auth.refresh_token')
            });

            if (sessionError) throw sessionError;

            // Update the user's password
            const { data, error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            // Clear the stored token
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('supabase.auth.refresh_token');

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
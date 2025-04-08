import { supabase } from './supabase.js';
import debug from './debug.js';

debug.info('Accept invite script loaded');

// Check if we have an access token
const access_token = localStorage.getItem('access_token');
if (!access_token) {
    debug.warn('No access token found, redirecting to login');
    window.location.href = '/login.html';
}

// Handle form submission
const form = document.getElementById('accept-invite-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    debug.info('Form submitted');

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        debug.warn('Passwords do not match');
        alert('Passwords do not match');
        return;
    }

    try {
        debug.info('Updating user password');
        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            debug.error('Error updating password:', error);
            alert(error.message);
            return;
        }

        debug.info('Password updated successfully');
        alert('Password set successfully! You can now log in.');
        window.location.href = '/login.html';
    } catch (error) {
        debug.error('Unexpected error:', error);
        alert('An unexpected error occurred. Please try again.');
    }
}); 
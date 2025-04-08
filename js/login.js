import { supabase } from './supabase.js';
import debug from './debug.js';

debug.info('Login script loaded');

// Check if user is already logged in
const { data: { session } } = await supabase.auth.getSession();
if (session) {
    debug.info('User already logged in, redirecting to dashboard');
    window.location.href = '/dashboard.html';
}

// Handle form submission
const form = document.getElementById('login-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    debug.info('Form submitted');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;

    try {
        debug.info('Attempting to sign in');
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            debug.error('Login error:', error);
            alert(error.message);
            return;
        }

        debug.info('Login successful');
        
        // Store session based on remember me preference
        if (rememberMe) {
            debug.info('Storing session in localStorage');
            localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
        } else {
            debug.info('Storing session in sessionStorage');
            sessionStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
        }

        // Redirect to dashboard
        window.location.href = '/dashboard.html';
    } catch (error) {
        debug.error('Unexpected error:', error);
        alert('An unexpected error occurred. Please try again.');
    }
});
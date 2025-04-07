import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get the hash from the URL
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const type = params.get('type');

    if (accessToken && type === 'invite') {
        // Store the token
        localStorage.setItem('supabase.auth.token', accessToken);
        
        // Redirect to the accept-invite page
        window.location.href = '/accept-invite.html';
    }
}); 
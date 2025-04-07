import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Handle invite script loaded');
    
    // Get the hash from the URL
    const hash = window.location.hash.substring(1);
    console.log('URL hash:', hash);
    
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const type = params.get('type');
    
    console.log('Token type:', type);
    console.log('Has access token:', !!accessToken);

    if (accessToken && type === 'invite') {
        console.log('Processing invitation...');
        // Store the token and refresh token
        localStorage.setItem('supabase.auth.token', accessToken);
        localStorage.setItem('supabase.auth.refresh_token', params.get('refresh_token'));
        
        console.log('Redirecting to accept-invite page...');
        // Redirect to the accept-invite page
        window.location.replace('/accept-invite.html');
    } else {
        console.log('No valid invitation token found');
    }
}); 
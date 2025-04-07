import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Handle invite script loaded');
    
    try {
        // Get the hash from the URL
        const hash = window.location.hash.substring(1);
        console.log('URL hash:', hash);
        
        if (!hash) {
            console.log('No hash found in URL');
            return;
        }

        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const type = params.get('type');
        const refreshToken = params.get('refresh_token');
        
        console.log('Token type:', type);
        console.log('Has access token:', !!accessToken);

        if (accessToken && type === 'invite') {
            console.log('Processing invitation...');
            // Store the tokens
            localStorage.setItem('supabase.auth.token', accessToken);
            if (refreshToken) {
                localStorage.setItem('supabase.auth.refresh_token', refreshToken);
            }
            
            console.log('Redirecting to accept-invite page...');
            // Redirect to the accept-invite page
            window.location.href = '/accept-invite.html';
        } else {
            console.log('No valid invitation token found');
        }
    } catch (error) {
        console.error('Error processing invitation:', error);
    }
}); 
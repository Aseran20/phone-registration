import { debug, debugInfo, debugError, debugWarn } from './debug.js';

(function handleInvite() {
    debugInfo('Handle invite script loaded');

    // Extract hash from URL
    const hash = window.location.hash.substring(1);
    
    // Only process if there's a hash
    if (!hash) {
        debugInfo('No hash found in URL, skipping invite processing');
        return;
    }

    const params = new URLSearchParams(hash);

    debugInfo('URL hash:', hash);
    debugInfo('Parsed params:', Object.fromEntries(params));

    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const type = params.get('type');

    debugInfo('Access token:', access_token ? 'Present' : 'Not found');
    debugInfo('Refresh token:', refresh_token ? 'Present' : 'Not found');
    debugInfo('Type:', type);

    // Check if we have an access token
    if (!access_token) {
        debugError('No access token found');
        return;
    }

    // Check if we have a refresh token
    if (!refresh_token) {
        debugError('No refresh token found');
        return;
    }

    // Check if we have a type
    if (!type) {
        debugError('No type found');
        return;
    }

    if (access_token && type === 'invite') {
        debugInfo('Valid invitation token found, processing...');
        
        // Store tokens
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token);
        }
        
        debugInfo('Tokens stored in localStorage');
        
        // Redirect to accept-invite page
        debugInfo('Redirecting to accept-invite page');
        window.location.href = '/accept-invite.html';
    } else {
        debugWarn('No valid invitation token found');
    }
})(); 
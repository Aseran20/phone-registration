import debug from './debug.js';

debug.info('Handle invite script loaded');

// Extract hash from URL
const hash = window.location.hash.substring(1);
const params = new URLSearchParams(hash);

debug.info('URL hash:', hash);
debug.info('Parsed params:', Object.fromEntries(params));

const access_token = params.get('access_token');
const refresh_token = params.get('refresh_token');
const type = params.get('type');

debug.info('Access token:', access_token ? 'Present' : 'Not found');
debug.info('Refresh token:', refresh_token ? 'Present' : 'Not found');
debug.info('Type:', type);

if (access_token && type === 'invite') {
    debug.info('Valid invitation token found, processing...');
    
    // Store tokens
    localStorage.setItem('access_token', access_token);
    if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
    }
    
    debug.info('Tokens stored in localStorage');
    
    // Redirect to accept-invite page
    debug.info('Redirecting to accept-invite page');
    window.location.href = '/accept-invite.html';
} else {
    debug.warn('No valid invitation token found');
} 
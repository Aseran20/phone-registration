import { debug, debugError, debugInfo } from './debug.js';
import { auth } from './firebase-config.js';

debug('Accept invite script loaded');

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('access_token');
    const messageDiv = document.getElementById('message');
    
    if (!token) {
        debugError('No access token found');
        if (messageDiv) {
            messageDiv.textContent = 'No invitation token found. Please use a valid invitation link.';
            messageDiv.className = 'error';
        }
        return;
    }
    
    try {
        debugInfo('Processing invitation with token');
        
        // Verify the token with Firebase
        const userCredential = await auth.signInWithCustomToken(token);
        debugInfo('User authenticated with custom token');
        
        // Update user profile or perform other actions
        // This would depend on your specific requirements
        
        if (messageDiv) {
            messageDiv.textContent = 'Invitation accepted successfully!';
            messageDiv.className = 'success';
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
        
    } catch (error) {
        debugError('Error processing invitation', error);
        if (messageDiv) {
            messageDiv.textContent = 'Error processing invitation. Please try again or contact support.';
            messageDiv.className = 'error';
        }
    }
}); 
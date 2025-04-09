import { debug, debugError, debugInfo } from './debug.js';
import { auth } from './firebase-config.js';

debug('Dashboard script loaded');

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            debugInfo('User is logged in', user);
            
            // Display user email
            const userEmailElement = document.getElementById('userEmail');
            if (userEmailElement) {
                userEmailElement.textContent = user.email;
            }
            
            // Load user data or perform other actions
            // This would depend on your specific requirements
            
        } else {
            debugWarn('No user is logged in, redirecting to login');
            window.location.href = '/login.html';
        }
    });
    
    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
                debugInfo('User logged out successfully');
                window.location.href = '/login.html';
            } catch (error) {
                debugError('Error logging out', error);
                alert('Error logging out. Please try again.');
            }
        });
    }
});

// Handle sidebar navigation
const sidebarLinks = document.querySelectorAll('.sidebar-link');
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        debug.info('Navigating to section:', section);
        
        // Update active link
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show section content (placeholder for now)
        alert(`Navigating to ${section} section`);
    });
});

function updateDashboardContent(section) {
    const contentArea = document.querySelector('.dashboard-content');
    contentArea.innerHTML = `<h2>${section.charAt(0).toUpperCase() + section.slice(1)}</h2>
                            <p>This section is under development.</p>`;
} 
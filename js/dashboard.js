import { supabase } from './supabase.js';
import debug from './debug.js';

debug.info('Dashboard script loaded');

// Check if user is logged in
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
    debug.warn('No active session found, redirecting to login');
    window.location.href = '/login.html';
}

// Set user email and avatar
const userEmail = session.user.email;
debug.info('Setting user email:', userEmail);
document.getElementById('user-email').textContent = userEmail;
document.getElementById('user-avatar').textContent = userEmail[0].toUpperCase();

// Handle logout
const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', async () => {
    debug.info('Logout initiated');
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            debug.error('Logout error:', error);
            alert('Error logging out. Please try again.');
            return;
        }
        debug.info('Logout successful');
        window.location.href = '/login.html';
    } catch (error) {
        debug.error('Unexpected error during logout:', error);
        alert('An unexpected error occurred during logout.');
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
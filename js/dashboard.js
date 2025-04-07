import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // Set user email in the dashboard
    const userEmail = session.user.email;
    document.querySelector('.user-profile span').textContent = userEmail;
    document.querySelector('.avatar').textContent = userEmail.charAt(0).toUpperCase();

    // Handle logout
    document.querySelector('.sidebar-footer a').addEventListener('click', async (e) => {
        e.preventDefault();
        
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
            return;
        }

        // Clear stored session
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
        
        // Redirect to login page
        window.location.href = 'login.html';
    });

    // Handle sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
            
            // Add active class to clicked link
            link.parentElement.classList.add('active');
            
            // Update content based on selected section
            const section = link.getAttribute('href').replace('#', '');
            updateDashboardContent(section);
        });
    });
});

function updateDashboardContent(section) {
    const contentArea = document.querySelector('.dashboard-content');
    contentArea.innerHTML = `<h2>${section.charAt(0).toUpperCase() + section.slice(1)}</h2>
                            <p>This section is under development.</p>`;
} 
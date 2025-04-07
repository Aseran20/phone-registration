// Check if user is logged in
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('sendoSwissLoggedIn') || sessionStorage.getItem('sendoSwissLoggedIn');
    const userEmail = localStorage.getItem('sendoSwissEmail') || sessionStorage.getItem('sendoSwissEmail');
    
    if (!isLoggedIn) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Set user email in the dashboard
    if (userEmail) {
        document.getElementById('userEmail').textContent = userEmail;
        document.querySelector('.avatar').textContent = userEmail.charAt(0).toUpperCase();
    }
    
    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        
        // Clear login state
        localStorage.removeItem('sendoSwissLoggedIn');
        localStorage.removeItem('sendoSwissEmail');
        sessionStorage.removeItem('sendoSwissLoggedIn');
        sessionStorage.removeItem('sendoSwissEmail');
        
        // Redirect to login page
        window.location.href = 'login.html';
    });
    
    // Handle sidebar navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.sidebar-nav li').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked link's parent
            link.parentElement.classList.add('active');
            
            // In a real application, this would load the appropriate content
            // For now, we'll just show a message
            const section = link.getAttribute('href').substring(1);
            document.querySelector('.dashboard-welcome h1').textContent = `${section.charAt(0).toUpperCase() + section.slice(1)} Section`;
            document.querySelector('.dashboard-welcome p').textContent = `This is the ${section} section of your dashboard.`;
        });
    });
}); 
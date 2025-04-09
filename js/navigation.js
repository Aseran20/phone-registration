/**
 * Navigation Component
 * 
 * This script creates a reusable navigation menu that can be included in all dashboard pages.
 * It ensures consistent styling and behavior across the application.
 */

// Function to create the navigation menu
function createNavigation(activePage) {
    // Create the sidebar container
    const sidebar = document.createElement('nav');
    sidebar.className = 'sidebar';
    
    // Create the sidebar header with logo
    const sidebarHeader = document.createElement('div');
    sidebarHeader.className = 'sidebar-header';
    
    const logoImg = document.createElement('img');
    logoImg.src = 'assets/images/Sendo_logo.svg';
    logoImg.alt = 'Sendo Swiss Logo';
    logoImg.className = 'logo-img';
    
    sidebarHeader.appendChild(logoImg);
    
    // Create the navigation links container
    const sidebarNav = document.createElement('div');
    sidebarNav.className = 'sidebar-nav';
    
    // Define navigation items
    const navItems = [
        { href: 'coffee-shop-dashboard.html', icon: 'fas fa-home', text: 'Dashboard' },
        { href: 'coffee-shop-phones.html', icon: 'fas fa-phone', text: 'Phone Numbers' },
        { href: 'coffee-shop-messages.html', icon: 'fas fa-envelope', text: 'Messages' }
    ];
    
    // Create navigation links
    navItems.forEach(item => {
        const link = document.createElement('a');
        link.href = item.href;
        link.className = 'sidebar-nav-link';
        
        // Add active class if this is the current page
        if (item.href === activePage) {
            link.classList.add('active');
        }
        
        // Create icon
        const icon = document.createElement('i');
        icon.className = item.icon;
        
        // Create text span
        const text = document.createElement('span');
        text.textContent = item.text;
        
        // Append icon and text to link
        link.appendChild(icon);
        link.appendChild(text);
        
        // Append link to navigation
        sidebarNav.appendChild(link);
    });
    
    // Assemble the sidebar
    sidebar.appendChild(sidebarHeader);
    sidebar.appendChild(sidebarNav);
    
    return sidebar;
}

// Function to initialize the navigation
function initNavigation() {
    // Get the current page URL
    const currentPage = window.location.pathname.split('/').pop();
    
    // Find the dashboard container
    const dashboardContainer = document.querySelector('.dashboard-container');
    
    if (dashboardContainer) {
        // Create the navigation
        const navigation = createNavigation(currentPage);
        
        // Insert the navigation at the beginning of the dashboard container
        dashboardContainer.insertBefore(navigation, dashboardContainer.firstChild);
    }
}

// Initialize the navigation when the DOM is loaded
document.addEventListener('DOMContentLoaded', initNavigation);

// Export the functions for use in other modules
export { createNavigation, initNavigation }; 
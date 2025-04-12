// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const navLinks = document.querySelector('.nav-links');

    if (menuButton && navLinks) {
        // Toggle menu on button click
        menuButton.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuButton.setAttribute('aria-expanded', 
                navLinks.classList.contains('active'));
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.nav-right') && 
                !event.target.closest('.menu-button')) {
                navLinks.classList.remove('active');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
}); 
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const navLinks = document.querySelector('.nav-links');

    if (menuButton && navLinks) {
        // Ensure menu is hidden by default on mobile
        if (window.innerWidth <= 768) {
            navLinks.classList.remove('active');
        }
        
        menuButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent event from bubbling to document
            navLinks.classList.toggle('active');
            const isOpen = navLinks.classList.contains('active');
            menuButton.innerHTML = isOpen ? 
                '<i class="fas fa-times"></i>' : 
                '<i class="fas fa-bars"></i>';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.navbar')) {
                navLinks.classList.remove('active');
                menuButton.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
        
        // Close menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuButton.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
}); 
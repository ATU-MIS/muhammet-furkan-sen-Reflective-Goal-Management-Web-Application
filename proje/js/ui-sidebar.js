/**
 * Sidebar Active State Manager
 * Automatically highlights the sidebar link corresponding to the current page.
 */
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    sidebarLinks.forEach(link => {
        // Remove hardcoded active classes
        link.classList.remove('active');
        
        const linkHref = link.getAttribute('href');
        
        // Exact match
        if (linkHref === currentPage) {
            link.classList.add('active');
        } 
        
        // Handle root index.html mapping to Dashboard if desired
        // If we are on index.html (or empty path), highlight dashboard if dashboard is default
        if ((currentPage === 'index.html' || currentPage === '') && linkHref === 'dashboard.html') {
            link.classList.add('active');
        }
    });

    // Mobile Toggle Logic
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }
});

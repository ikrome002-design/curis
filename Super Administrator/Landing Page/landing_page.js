// ==========================================================
// CURIS LANDING PAGE JAVASCRIPT
// Modern, Professional & Vibrant Healthcare Platform Implementation
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {
    // ----------------
    // INITIALIZATION
    // ----------------
    initializeHeader();
    initializeSearch();
    initializeSmoothScroll();
    initializeBackToTop();
    initializeDarkMode();
    initializeAnimations();
    initializeFeatureInteractions();
    
    // ----------------
    // HEADER FUNCTIONALITY
    // ----------------
    function initializeHeader() {
        const header = document.querySelector('.main-header');
        let lastScrollPosition = 0;
        
        // Handle scroll effects on header
        window.addEventListener('scroll', function() {
            const currentScrollPosition = window.pageYOffset;
            
            // Add scrolled class for header styling
            if (currentScrollPosition > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Show/hide header based on scroll direction (optional)
            // You can uncomment this if you want the header to hide when scrolling down
            /*
            if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            lastScrollPosition = currentScrollPosition;
            */
        });
    }
    
    // ----------------
    // SEARCH FUNCTIONALITY
    // ----------------
    function initializeSearch() {
        const searchInput = document.querySelector('.search-input');
        const searchButton = document.querySelector('.search-button');
        
        // Handle search on button click
        searchButton.addEventListener('click', performSearch);
        
        // Handle search on Enter key
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        function performSearch() {
            const searchTerm = searchInput.value.trim();
            
            if (!searchTerm) {
                alert('Please enter a search term');
                return;
            }
            
            // In a real application, you would implement actual search functionality
            // For now, we'll just show a message
            alert('Searching for: ' + searchTerm);
            
            // Clear the search input
            searchInput.value = '';
        }
    }
    
    // ----------------
    // SMOOTH SCROLLING
    // ----------------
    function initializeSmoothScroll() {
        // Handle clicking on navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerOffset = 80; // Account for fixed header height
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active navigation state
                    updateActiveNavItem(targetId);
                }
            });
        });
        
        // Update active navigation item based on scroll position
        window.addEventListener('scroll', function() {
            const sections = document.querySelectorAll('section[id]');
            let currentSection = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;
                
                if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                    currentSection = '#' + section.getAttribute('id');
                }
            });
            
            if (currentSection) {
                updateActiveNavItem(currentSection);
            }
        });
        
        function updateActiveNavItem(targetId) {
            const navLinks = document.querySelectorAll('.nav-list a');
            navLinks.forEach(link => {
                if (link.getAttribute('href') === targetId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }
    
    // ----------------
    // BACK TO TOP BUTTON
    // ----------------
    function initializeBackToTop() {
        const backToTopBtn = document.getElementById('backToTopBtn');
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top when button is clicked
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ----------------
    // DARK MODE TOGGLE
    // ----------------
    function initializeDarkMode() {
        const darkModeButton = document.querySelector('.dark-mode-button');
        
        // Check for saved dark mode preference
        const darkModePreference = localStorage.getItem('darkMode');
        if (darkModePreference === 'true') {
            document.body.classList.add('dark-mode');
            updateDarkModeButtonText(true);
        }
        
        // Toggle dark mode
        darkModeButton.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            updateDarkModeButtonText(isDarkMode);
        });
        
        function updateDarkModeButtonText(isDarkMode) {
            darkModeButton.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
        }
    }
    
    // ----------------
    // SCROLL ANIMATIONS
    // ----------------
    function initializeAnimations() {
        // Add animation class to elements that should animate on scroll
        const animatedElements = document.querySelectorAll('.feature-item, .mission-statement, .vision-statement, .team-info');
        animatedElements.forEach(element => {
            element.classList.add('animate-on-scroll');
        });
        
        // Intersection Observer options
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        // Create the observer
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, observerOptions);
        
        // Observe all animated elements
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // ----------------
    // FEATURE INTERACTIONS
    // ----------------
    function initializeFeatureInteractions() {
        const featureItems = document.querySelectorAll('.feature-item');
        
        featureItems.forEach(item => {
            // Add hover effect animations
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
                this.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.08)';
            });
        });
    }
    
    // ----------------
    // UTILITY FUNCTIONS
    // ----------------
    
    // Debounce function for better scroll performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Handle window resize events with debouncing
    const handleResize = debounce(() => {
        // Add any resize handling logic here
        // For example, recalculate positions or update layouts
    }, 250);
    
    window.addEventListener('resize', handleResize);
    
    // ----------------
    // ERROR HANDLING
    // ----------------
    
    // Global error handler
    window.addEventListener('error', function(event) {
        console.error('An error occurred:', event.error);
        // In production, you might want to send this to an error tracking service
    });
    
    // ----------------
    // PERFORMANCE MONITORING
    // ----------------
    
    // Monitor page performance
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log('Page load time:', pageLoadTime + 'ms');
        }
    });
});

// ----------------
// ADDITIONAL CSS FOR INTERACTIVE ELEMENTS
// ----------------

// Add dynamic styles for active navigation items
const style = document.createElement('style');
style.textContent = `
    .nav-list a.active {
        color: var(--accent-color);
        font-weight: 600;
    }
    
    .nav-list a.active::after {
        transform: scaleX(1);
    }
    
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease-out;
    }
    
    .animate-on-scroll.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .main-header {
        transition: all 0.3s ease;
    }
    
    .main-header.scrolled {
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }
    
    body.dark-mode .main-header.scrolled {
        background: rgba(18, 18, 18, 0.98);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    }
`;

document.head.appendChild(style);

// ----------------
// BROWSER COMPATIBILITY
// ----------------

// Polyfill for smooth scroll in older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    // Add smooth scroll polyfill here if needed
    // This is a simplified example - in production, use a proper polyfill
    window.scroll = function(options) {
        const start = window.pageYOffset;
        const startTime = performance.now();
        const duration = 500;
        
        function scrollAnimation(currentTime) {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = progress * (2 - progress); // easeOutQuad
            
            window.scrollTo(0, start + (options.top - start) * ease);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(scrollAnimation);
            }
        }
        
        requestAnimationFrame(scrollAnimation);
    };
}

// ----------------
// INITIALIZE ON ALL PAGES
// ----------------

// Check for page-specific initialization
const pageSpecificInit = {
    'search': initSearchPage,
    'features': initFeaturesPage,
    // Add more page-specific functions as needed
};

// Run page-specific initialization if needed
function initPageSpecific() {
    const currentPage = document.body.getAttribute('data-page');
    if (currentPage && pageSpecificInit[currentPage]) {
        pageSpecificInit[currentPage]();
    }
}

// Page-specific functions
function initSearchPage() {
    // Add search page specific functionality
}

function initFeaturesPage() {
    // Add features page specific functionality
}

// Initialize page-specific functionality
// initPageSpecific(); // Uncomment when needed
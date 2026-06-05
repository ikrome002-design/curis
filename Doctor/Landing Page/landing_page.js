/**
 * Curis Landing Page JavaScript
 * Created: April 18, 2025
 * 
 * This file contains the JavaScript functionality for the Curis Landing Page,
 * including smooth scrolling, animations, dark mode toggle, form validation,
 * and interactive elements.
 */

// Wait for the DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', function () {
    // ---------- GLOBAL VARIABLES ----------
    let isVideoPlaying = false;
    let lastScrollTop = 0;

    // ---------- DOM ELEMENTS ----------
    // Navigation
    const navLinks = document.querySelectorAll('.nav-list a');
    const sections = document.querySelectorAll('section[id]');

    // CTA Buttons
    const ctaButtons = document.querySelectorAll('.cta-button');

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const submitButton = document.querySelector('.submit-button');

    // Video Player
    const videoPlaceholder = document.querySelector('.video-placeholder');

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // ---------- INITIAL SETUP ----------
    // Load Font Awesome if not already loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);
    }

    // Check for dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
    }

    // Set up intersection observer for animations
    setupScrollAnimations();

    // Set active nav link based on current URL hash
    if (window.location.hash) {
        setActiveNavLink(window.location.hash);
    } else {
        // Set first nav link as active if no hash
        navLinks[0].classList.add('active');
    }

    // ---------- EVENT LISTENERS ----------
    // Navigation smooth scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL hash without causing page jump
                history.pushState(null, null, targetId);

                // Update active nav link
                setActiveNavLink(targetId);
            }
        });
    });

    // CTA buttons click tracking
    ctaButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            // Track which CTA was clicked (for analytics in a real implementation)
            const ctaId = this.id;
            trackCTAClick(ctaId);
        });
    });

    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (validateContactForm()) {
                submitContactForm();
            }
        });
    }

    // Video player placeholder click
    if (videoPlaceholder) {
        videoPlaceholder.addEventListener('click', function () {
            toggleVideoPlayer();
        });
    }

    // Dark mode toggle
    darkModeToggle.addEventListener('click', function () {
        if (document.body.classList.contains('dark-mode')) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });

    // Scroll event for navigation highlighting
    window.addEventListener('scroll', throttle(function () {
        highlightNavOnScroll();
        showScrollProgress();
    }, 100));

    // Resize event for layout adjustments
    window.addEventListener('resize', throttle(function () {
        if (window.innerWidth <= 768) {
            setupMobileNavigation();
        }
    }, 200));

    // Check if mobile navigation is needed on page load
    if (window.innerWidth <= 768) {
        setupMobileNavigation();
    }

    // ---------- NAVIGATION FUNCTIONS ----------
    // Set active navigation link
    function setActiveNavLink(targetId) {
        // Remove active class from all links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to corresponding link
        const correspondingLink = document.querySelector(`.nav-list a[href="${targetId}"]`);
        if (correspondingLink) {
            correspondingLink.classList.add('active');
        }
    }

    // Highlight navigation based on scroll position
    function highlightNavOnScroll() {
        const scrollPosition = window.scrollY + 150; // Offset for better UX

        // Find the section that is currently in view
        let currentSection = null;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section;
            }
        });

        // Update active navigation link
        if (currentSection) {
            setActiveNavLink(`#${currentSection.id}`);
        }
    }

    // Set up mobile navigation
    function setupMobileNavigation() {
        if (!document.querySelector('.mobile-nav-toggle')) {
            const header = document.querySelector('.header');
            const nav = document.querySelector('.main-nav');

            // Create mobile menu toggle
            const mobileNavToggle = document.createElement('button');
            mobileNavToggle.className = 'mobile-nav-toggle';
            mobileNavToggle.setAttribute('aria-label', 'Toggle navigation menu');
            mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';

            // Insert toggle before nav
            header.insertBefore(mobileNavToggle, nav);

            // Add mobile nav styles
            const mobileNavStyles = document.createElement('style');
            mobileNavStyles.textContent = `
                .mobile-nav-toggle {
                    display: block;
                    font-size: 1.5rem;
                    color: var(--primary-color);
                    cursor: pointer;
                    background: none;
                    border: none;
                    transition: color var(--transition-fast);
                }
                
                .mobile-nav-toggle:hover {
                    color: var(--accent-color);
                }
                
                @media (max-width: 768px) {
                    .header {
                        padding: var(--spacing-md);
                        flex-wrap: wrap;
                    }
                    
                    .logo-container {
                        flex: 1;
                    }
                    
                    .main-nav {
                        flex-basis: 100%;
                        overflow: hidden;
                        max-height: 0;
                        transition: max-height var(--transition-normal);
                    }
                    
                    .main-nav.active {
                        max-height: 300px;
                    }
                    
                    .nav-list {
                        flex-direction: column;
                        padding: var(--spacing-md) 0;
                    }
                }
            `;
            document.head.appendChild(mobileNavStyles);

            // Add toggle functionality
            mobileNavToggle.addEventListener('click', function () {
                nav.classList.toggle('active');

                if (nav.classList.contains('active')) {
                    this.innerHTML = '<i class="fas fa-times"></i>';
                } else {
                    this.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });

            // Close mobile nav when a link is clicked
            navLinks.forEach(link => {
                link.addEventListener('click', function () {
                    if (window.innerWidth <= 768 && nav.classList.contains('active')) {
                        nav.classList.remove('active');
                        mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                });
            });
        }
    }

    // Show scroll progress on page
    function showScrollProgress() {
        // Create scroll progress indicator if it doesn't exist
        if (!document.querySelector('.scroll-progress')) {
            const progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';

            const progressStyles = document.createElement('style');
            progressStyles.textContent = `
                .scroll-progress {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 0%;
                    height: 3px;
                    background-color: var(--accent-color);
                    z-index: 1000;
                    transition: width 0.1s;
                }
            `;
            document.head.appendChild(progressStyles);
            document.body.appendChild(progressBar);
        }

        // Calculate scroll progress
        const scrollProgress = document.querySelector('.scroll-progress');
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / scrollTotal) * 100;

        scrollProgress.style.width = `${progress}%`;
    }

    // ---------- CTA TRACKING FUNCTIONS ----------
    // Track CTA button clicks (for analytics in a real implementation)
    function trackCTAClick(ctaId) {
        // In a real implementation, this would send data to an analytics service
        console.log(`CTA clicked: ${ctaId}`);

        // For now, we'll just add a pulse animation to the button
        const button = document.getElementById(ctaId);
        button.classList.add('pulse');

        // Remove animation after it completes
        setTimeout(() => {
            button.classList.remove('pulse');
        }, 2000);
    }

    // ---------- CONTACT FORM FUNCTIONS ----------
    // Validate contact form inputs
    function validateContactForm() {
        let isValid = true;

        // Reset previous error messages
        document.querySelectorAll('.error-message').forEach(el => el.remove());

        // Validate name
        if (nameInput.value.trim() === '') {
            showInputError(nameInput, 'Please enter your name');
            isValid = false;
        }

        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value)) {
            showInputError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate message
        if (messageInput.value.trim() === '') {
            showInputError(messageInput, 'Please enter your message');
            isValid = false;
        }

        return isValid;
    }

    // Show input error message
    function showInputError(input, message) {
        // Create error message element
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;

        // Add error styles
        const errorStyles = document.createElement('style');
        errorStyles.textContent = `
            .error-message {
                color: var(--error-color);
                font-size: 0.85rem;
                margin-top: 5px;
            }
            
            input.error, textarea.error {
                border-color: var(--error-color);
            }
        `;

        // Add to DOM if not already present
        if (!document.querySelector('style[data-error-styles]')) {
            errorStyles.setAttribute('data-error-styles', 'true');
            document.head.appendChild(errorStyles);
        }

        // Add error class to input
        input.classList.add('error');

        // Insert error message after input
        input.parentNode.appendChild(errorMessage);
    }

    // Submit the contact form
    function submitContactForm() {
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        // In a real implementation, this would send data to a server
        // For this demo, we'll simulate a response after a delay
        setTimeout(() => {
            // Simulate successful submission
            submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            submitButton.style.backgroundColor = 'var(--success-color)';

            // Reset form
            contactForm.reset();

            // Reset button after delay
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Send Message';
                submitButton.style.backgroundColor = '';
            }, 3000);

            // Show success message
            showFormSuccess();
        }, 1500);
    }

    // Show form success message
    function showFormSuccess() {
        // Create success message if it doesn't exist
        if (!document.querySelector('.form-success')) {
            const successMessage = document.createElement('div');
            successMessage.className = 'form-success';
            successMessage.innerHTML = `
                <div class="success-content">
                    <i class="fas fa-check-circle"></i>
                    <p>Thank you for your message! Our team will get back to you soon.</p>
                </div>
            `;

            // Add success styles
            const successStyles = document.createElement('style');
            successStyles.textContent = `
                .form-success {
                    background-color: rgba(76, 175, 80, 0.1);
                    border-left: 4px solid var(--success-color);
                    padding: var(--spacing-md);
                    border-radius: var(--border-radius-md);
                    margin-top: var(--spacing-md);
                    animation: fadeIn 0.5s ease-out;
                }
                
                .success-content {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }
                
                .success-content i {
                    color: var(--success-color);
                    font-size: 1.5rem;
                }
                
                .success-content p {
                    margin: 0;
                }
            `;
            document.head.appendChild(successStyles);

            // Insert success message after form
            contactForm.parentNode.appendChild(successMessage);

            // Remove success message after delay
            setTimeout(() => {
                const message = document.querySelector('.form-success');
                if (message) {
                    message.remove();
                }
            }, 5000);
        }
    }

    // ---------- VIDEO PLAYER FUNCTIONS ----------
    // Toggle video player (play/pause)
    function toggleVideoPlayer() {
        if (!isVideoPlaying) {
            // In a real implementation, this would replace the placeholder with an actual video player
            // For this demo, we'll just change the placeholder appearance
            videoPlaceholder.innerHTML = `
                <div class="video-controls">
                    <i class="fas fa-pause"></i>
                </div>
                <p>🎬 [Video Playing Simulation]</p>
            `;
            videoPlaceholder.style.backgroundColor = '#000';

            // Add video controls styles
            const videoStyles = document.createElement('style');
            videoStyles.textContent = `
                .video-controls {
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    background-color: rgba(0, 0, 0, 0.5);
                    color: white;
                    padding: 10px;
                    border-radius: 50%;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(videoStyles);

            isVideoPlaying = true;
        } else {
            // Reset to placeholder
            videoPlaceholder.innerHTML = '<p>🖼️ [Embedded Video Thumbnail]</p>';
            videoPlaceholder.style.backgroundColor = 'var(--primary-color)';
            isVideoPlaying = false;
        }
    }

    // ---------- ANIMATION FUNCTIONS ----------
    // Set up intersection observer for scroll animations
    function setupScrollAnimations() {
        // Get all sections
        const allSections = document.querySelectorAll('section');

        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fadeIn');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '0px'
        });

        // Observe each section
        allSections.forEach(section => {
            section.style.opacity = '0';
            observer.observe(section);
        });

        // Add CSS for animations if not already present
        if (!document.querySelector('style[data-animation-styles]')) {
            const animationStyles = document.createElement('style');
            animationStyles.setAttribute('data-animation-styles', 'true');
            animationStyles.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .fadeIn {
                    animation: fadeIn 0.8s ease-out forwards;
                }
            `;
            document.head.appendChild(animationStyles);
        }
    }

    // ---------- DARK MODE FUNCTIONS ----------
    // Enable dark mode
    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        updateDarkModeIcon(true);
    }

    // Disable dark mode
    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        updateDarkModeIcon(false);
    }

    // Update dark mode icon
    function updateDarkModeIcon(isDarkMode) {
        const icon = darkModeToggle.querySelector('i');
        if (isDarkMode) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // ---------- UTILITY FUNCTIONS ----------
    // Throttle function to limit execution rate
    function throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall < delay) {
                return;
            }
            lastCall = now;
            return func(...args);
        };
    }

    // ---------- BACK TO TOP BUTTON ----------
    // Create back to top button
    function createBackToTopButton() {
        const backToTopButton = document.createElement('button');
        backToTopButton.className = 'back-to-top';
        backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopButton.setAttribute('aria-label', 'Back to top');

        // Add styles
        const backToTopStyles = document.createElement('style');
        backToTopStyles.textContent = `
            .back-to-top {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: var(--accent-color);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s, visibility 0.3s, background-color 0.3s;
                z-index: 1000;
                border: none;
                box-shadow: var(--shadow-md);
            }
            
            .back-to-top:hover {
                background-color: var(--secondary-color);
            }
            
            .back-to-top.visible {
                opacity: 1;
                visibility: visible;
            }
        `;
        document.head.appendChild(backToTopStyles);
        document.body.appendChild(backToTopButton);

        // Show/hide based on scroll position
        window.addEventListener('scroll', throttle(function () {
            if (window.pageYOffset > 500) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }, 100));

        // Scroll to top when clicked
        backToTopButton.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ---------- ACCESSIBILITY ENHANCEMENTS ----------
    // Improve accessibility features
    function enhanceAccessibility() {
        // Add proper ARIA roles to sections
        document.querySelectorAll('section').forEach(section => {
            section.setAttribute('role', 'region');
            if (section.id) {
                section.setAttribute('aria-labelledby', `${section.id}-heading`);

                // Find and set ID for the section heading if it exists
                const heading = section.querySelector('h2');
                if (heading) {
                    heading.id = `${section.id}-heading`;
                }
            }
        });

        // Make video placeholder keyboard accessible
        if (videoPlaceholder) {
            videoPlaceholder.setAttribute('role', 'button');
            videoPlaceholder.setAttribute('tabindex', '0');
            videoPlaceholder.setAttribute('aria-label', 'Play demo video');

            videoPlaceholder.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleVideoPlayer();
                }
            });
        }

        // Add skip link for keyboard users
        const skipLink = document.createElement('a');
        skipLink.href = '#hero';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';

        const skipLinkStyles = document.createElement('style');
        skipLinkStyles.textContent = `
            .skip-link {
                position: absolute;
                top: -40px;
                left: 0;
                background: var(--accent-color);
                color: white;
                padding: 8px;
                z-index: 100;
                transition: top 0.3s;
            }
            
            .skip-link:focus {
                top: 0;
            }
        `;
        document.head.appendChild(skipLinkStyles);
        document.body.prepend(skipLink);
    }

    // ---------- INITIALIZE ADDITIONAL FEATURES ----------
    createBackToTopButton();
    enhanceAccessibility();
});
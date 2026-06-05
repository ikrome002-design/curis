/**
 * Curis by Citrus - Landing Page JavaScript
 * This script handles all interactive elements of the Curis landing page
 * including smooth scrolling, animations, dark mode toggle, and dynamic content.
 */

// Wait for the DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all functionalities
    initializeSmoothScrolling();
    initializeScrollAnimations();
    generateStarRatings();
    initializeDarkModeToggle();
    initializeResponsiveNavigation();
    initializeParallaxEffect();
    preloadImages();
    initializeFormHandling();
    initializeAnalyticsTracking();
    initializeKeyboardNavigation();
    initializeLazyLoading();
});

/**
 * Handles smooth scrolling for navigation links pointing to page sections
 */
function initializeSmoothScrolling() {
    // Get all navigation links that point to internal sections
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Prevent default anchor click behavior
            e.preventDefault();

            // Get the target section id from the href attribute
            const targetId = this.getAttribute('href');

            // Skip if href is just "#" (empty anchor)
            if (targetId === '#') return;

            // Get the target element
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Scroll to the target element smoothly
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initializes animations that trigger when elements come into view while scrolling
 */
function initializeScrollAnimations() {
    // Get all elements with scroll-trigger class or sections to animate
    const animatedSections = [
        document.querySelector('.about-section'),
        document.querySelector('.features-section'),
        document.querySelector('.how-it-works-section'),
        document.querySelector('.testimonials-section'),
        document.querySelector('.secondary-cta-section')
    ];

    // Additional elements with scroll-trigger class
    const scrollTriggerElements = document.querySelectorAll('.scroll-trigger');

    // Feature cards and step elements for staggered animations
    const featureCards = document.querySelectorAll('.feature-card');
    const stepElements = document.querySelectorAll('.step');

    // Function to check if an element is in viewport
    function isElementInViewport(el) {
        if (!el) return false;

        const rect = el.getBoundingClientRect();

        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }

    // Function to handle scroll event
    function handleScroll() {
        // Animate sections
        animatedSections.forEach(section => {
            if (section && isElementInViewport(section)) {
                section.style.opacity = '1';
            }
        });

        // Animate scroll trigger elements
        scrollTriggerElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('animated');
            }
        });

        // Animate feature cards with staggered delay
        featureCards.forEach((card, index) => {
            if (isElementInViewport(card)) {
                setTimeout(() => {
                    card.style.opacity = '1';
                }, index * 100);
            }
        });

        // Animate steps with staggered delay
        stepElements.forEach((step, index) => {
            if (isElementInViewport(step)) {
                setTimeout(() => {
                    step.style.opacity = '1';
                }, index * 200);
            }
        });
    }

    // Initial check on page load
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
}

/**
 * Generates star ratings dynamically in the testimonials section
 */
function generateStarRatings() {
    // Get the stars container
    const starsContainer = document.getElementById('stars-container');

    if (!starsContainer) return;

    // Define the rating (out of 5) - this could be dynamic from a backend
    const rating = 4.7;

    // Clear existing content
    starsContainer.innerHTML = '';

    // Generate 5 stars
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // If the current index is less than or equal to the full rating number
        if (i <= Math.floor(rating)) {
            // Full star - already has the full star style from the star class
        }
        // If the current index is the ceiling of the rating and there's a decimal part
        else if (i === Math.ceil(rating) && rating % 1 !== 0) {
            // Half star
            star.classList.add('half');
        }
        // Otherwise, it's an empty star
        else {
            star.style.opacity = '0.3';
        }

        starsContainer.appendChild(star);
    }

    // Add the numeric rating next to stars
    const ratingText = document.createElement('span');
    ratingText.textContent = ` ${rating.toFixed(1)}`;
    ratingText.style.marginLeft = '10px';
    ratingText.style.fontWeight = 'bold';
    starsContainer.appendChild(ratingText);
}

/**
 * Initializes the dark mode toggle functionality
 */
function initializeDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Check if user previously enabled dark mode
    const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';

    // Initialize dark mode based on user preference
    if (darkModeEnabled) {
        body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }

    if (!darkModeToggle) return;

    // Toggle dark mode on button click
    darkModeToggle.addEventListener('click', function () {
        // Toggle dark mode class on body
        body.classList.toggle('dark-mode');

        // Check if dark mode is currently enabled
        const isDarkMode = body.classList.contains('dark-mode');

        // Update the icon
        updateDarkModeIcon(isDarkMode);

        // Save user preference
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    });
}

/**
 * Updates the dark mode toggle icon based on current mode
 * @param {boolean} isDarkMode - Whether dark mode is currently enabled
 */
function updateDarkModeIcon(isDarkMode) {
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    if (!darkModeToggle) return;

    // Clear existing icon
    darkModeToggle.innerHTML = '';

    // Create new icon element
    const icon = document.createElement('i');

    // Set appropriate icon class
    if (isDarkMode) {
        icon.className = 'fas fa-sun';
        darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
        icon.className = 'fas fa-moon';
        darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }

    // Add icon to button
    darkModeToggle.appendChild(icon);
}

/**
 * Initializes responsive navigation for mobile devices
 */
function initializeResponsiveNavigation() {
    const header = document.querySelector('header');

    if (!header) return;

    // Create mobile menu toggle button
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'mobile-menu-toggle';
    mobileMenuButton.setAttribute('aria-label', 'Toggle navigation menu');
    mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuButton.style.display = 'none'; // Hide by default

    // Add mobile menu button styles
    mobileMenuButton.style.background = 'none';
    mobileMenuButton.style.border = 'none';
    mobileMenuButton.style.color = 'var(--light-text)';
    mobileMenuButton.style.fontSize = '1.5rem';
    mobileMenuButton.style.cursor = 'pointer';
    mobileMenuButton.style.padding = '0.5rem';

    // Get navigation
    const nav = header.querySelector('nav');

    if (!nav) return;

    // Add mobile menu button to header
    header.insertBefore(mobileMenuButton, nav);

    // Function to handle responsive behavior
    function handleResponsive() {
        if (window.innerWidth <= 768) {
            // Show mobile menu button
            mobileMenuButton.style.display = 'block';

            // Add mobile class to nav
            nav.classList.add('mobile-nav');

            // Add mobile nav styles
            nav.style.position = 'absolute';
            nav.style.top = '100%';
            nav.style.left = '0';
            nav.style.width = '100%';
            nav.style.backgroundColor = 'var(--primary-color)';
            nav.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.2)';
            nav.style.zIndex = '99';
            nav.style.padding = '1rem';

            // Style the nav ul for mobile
            const navUl = nav.querySelector('ul');
            if (navUl) {
                navUl.style.flexDirection = 'column';
                navUl.style.alignItems = 'flex-start';

                // Style all list items
                const navItems = navUl.querySelectorAll('li');
                navItems.forEach(item => {
                    item.style.margin = '0.5rem 0';
                    item.style.width = '100%';
                });
            }

            // Initially hide nav
            nav.style.display = 'none';
        } else {
            // Hide mobile menu button
            mobileMenuButton.style.display = 'none';

            // Remove mobile class from nav
            nav.classList.remove('mobile-nav');

            // Reset nav styles
            nav.style.position = '';
            nav.style.top = '';
            nav.style.left = '';
            nav.style.width = '';
            nav.style.backgroundColor = '';
            nav.style.boxShadow = '';
            nav.style.zIndex = '';
            nav.style.padding = '';

            // Reset nav ul styles
            const navUl = nav.querySelector('ul');
            if (navUl) {
                navUl.style.flexDirection = '';
                navUl.style.alignItems = '';

                // Reset list item styles
                const navItems = navUl.querySelectorAll('li');
                navItems.forEach(item => {
                    item.style.margin = '';
                    item.style.width = '';
                });
            }

            // Always show nav on larger screens
            nav.style.display = 'block';
        }
    }

    // Initial call
    handleResponsive();

    // Add resize event listener
    window.addEventListener('resize', handleResponsive);

    // Toggle mobile menu when button is clicked
    mobileMenuButton.addEventListener('click', function () {
        if (nav.style.display === 'none' || nav.style.display === '') {
            nav.style.display = 'block';
            mobileMenuButton.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            nav.style.display = 'none';
            mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Hide menu when link is clicked on mobile
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                nav.style.display = 'none';
                mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
}

/**
 * Adds parallax effect to the hero section
 */
function initializeParallaxEffect() {
    const heroSection = document.querySelector('.hero-section');
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');

    if (!heroSection) return;

    window.addEventListener('scroll', function () {
        // Get the scroll position
        const scrollPosition = window.scrollY;

        // Only apply effect if we're at or near the hero section
        if (scrollPosition < window.innerHeight) {
            // Apply subtle translation effects to create parallax
            if (heroContent) {
                heroContent.style.transform = `translateY(${scrollPosition * 0.2}px)`;
            }

            if (heroImage) {
                heroImage.style.transform = `translateY(${scrollPosition * 0.1}px)`;
            }
        }
    });
}

/**
 * Handles form submissions if any forms are present
 */
function initializeFormHandling() {
    // Get all forms on the page
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            // Prevent default form submission
            e.preventDefault();

            // Handle form validation
            if (validateForm(form)) {
                // Show success message
                showFormSubmissionMessage(form, 'Form submitted successfully!', 'success');

                // In a real application, you would send the form data to a server
                // For now, just reset the form
                form.reset();
            }
        });
    });
}

/**
 * Validates a form
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateForm(form) {
    // Get all required inputs
    const requiredInputs = form.querySelectorAll('[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
        // Remove any existing error message
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Check if input is empty
        if (!input.value.trim()) {
            isValid = false;

            // Create error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'This field is required';
            errorMessage.style.color = 'var(--danger-color)';
            errorMessage.style.fontSize = '0.8rem';
            errorMessage.style.marginTop = '5px';

            // Add error message after input
            input.parentElement.appendChild(errorMessage);
        }
    });

    return isValid;
}

/**
 * Shows a message after form submission
 * @param {HTMLFormElement} form - The form
 * @param {string} message - The message to show
 * @param {string} type - The type of message ('success' or 'error')
 */
function showFormSubmissionMessage(form, message, type) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;

    // Style the message
    messageElement.style.padding = '10px';
    messageElement.style.borderRadius = 'var(--border-radius-sm)';
    messageElement.style.marginTop = '10px';

    if (type === 'success') {
        messageElement.style.backgroundColor = 'rgba(67, 160, 71, 0.1)';
        messageElement.style.color = 'var(--success-color)';
        messageElement.style.border = '1px solid var(--success-color)';
    } else {
        messageElement.style.backgroundColor = 'rgba(229, 57, 53, 0.1)';
        messageElement.style.color = 'var(--danger-color)';
        messageElement.style.border = '1px solid var(--danger-color)';
    }

    // Add message to the form
    form.appendChild(messageElement);

    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

/**
 * Preloads images for better performance
 */
function preloadImages() {
    // Get all image elements
    const images = document.querySelectorAll('img');

    // Create an array of image URLs to preload
    const imageUrls = Array.from(images).map(img => img.src);

    // Preload images
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

/**
 * Adds basic analytics tracking
 */
function initializeAnalyticsTracking() {
    // Track page view
    trackEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href
    });

    // Track clicks on CTA buttons
    const ctaButtons = document.querySelectorAll('.primary-cta, .cta-button');

    ctaButtons.forEach(button => {
        button.addEventListener('click', function () {
            trackEvent('cta_click', {
                button_text: this.textContent.trim(),
                button_location: getElementPath(this)
            });
        });
    });

    // Track section visibility
    const sections = document.querySelectorAll('section[id]');
    let visibleSections = new Set();

    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Check which sections are visible on scroll
    window.addEventListener('scroll', function () {
        sections.forEach(section => {
            if (isInViewport(section)) {
                // If not already tracked as visible
                if (!visibleSections.has(section.id)) {
                    visibleSections.add(section.id);
                    // Track section view
                    trackEvent('section_view', {
                        section_id: section.id,
                        section_title: section.querySelector('h2')?.textContent || section.id
                    });
                }
            }
        });
    });
}

/**
 * Tracks an event (placeholder function)
 * @param {string} eventName - The name of the event to track
 * @param {Object} eventParams - The parameters of the event
 */
function trackEvent(eventName, eventParams) {
    // This would normally send data to an analytics service
    // For now, just log to console
    console.log('Event tracked:', eventName, eventParams);

    // In a real application, you might use something like:
    // if (window.gtag) {
    //     gtag('event', eventName, eventParams);
    // }
}

/**
 * Gets the path to an element for analytics purposes
 * @param {HTMLElement} element - The element to get the path for
 * @returns {string} - The element path
 */
function getElementPath(element) {
    let path = element.tagName.toLowerCase();

    if (element.id) {
        path += `#${element.id}`;
    }

    if (element.className) {
        const classes = element.className.split(' ');
        classes.forEach(className => {
            if (className) {
                path += `.${className}`;
            }
        });
    }

    return path;
}

/**
 * Adds keyboard navigation for accessibility
 */
function initializeKeyboardNavigation() {
    // Add focus styles and keyboard navigation for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex="0"]');

    interactiveElements.forEach(element => {
        element.addEventListener('keydown', function (e) {
            // If Enter key is pressed on a non-button element that should act like a button
            if (e.key === 'Enter' &&
                (this.tagName.toLowerCase() !== 'button' &&
                    this.tagName.toLowerCase() !== 'a' &&
                    this.tagName.toLowerCase() !== 'input')) {
                e.preventDefault();
                this.click();
            }
        });
    });
}

/**
 * Initializes lazy loading for images
 */
function initializeLazyLoading() {
    // Check if the browser supports the Intersection Observer API
    if ('IntersectionObserver' in window) {
        // Mark images for lazy loading
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            // Don't modify images that are in the viewport initially
            const rect = img.getBoundingClientRect();
            if (rect.top > window.innerHeight) {
                img.setAttribute('loading', 'lazy');

                // If src is already set, move it to data-src for images below fold
                if (img.src && !img.closest('.hero-section')) {
                    img.dataset.src = img.src;
                    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
                }
            }
        });

        // Get all images to lazy load
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');

        // Create an observer
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // If the image is in the viewport
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Set the src attribute to the value of data-src
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }

                    // Stop observing the image
                    observer.unobserve(img);
                }
            });
        });

        // Observe each image
        lazyImages.forEach(img => {
            observer.observe(img);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        // Load all images immediately
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');

        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    }
}

/**
 * Add interactive hover effects to features
 */
function initializeInteractiveEffects() {
    // Feature cards hover effect
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px var(--shadow-color)';

            // Find and animate the icon
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.backgroundColor = 'var(--accent-color)';
                icon.style.color = 'var(--light-text)';
                icon.style.transform = 'scale(1.1)';
            }
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
            this.style.boxShadow = '';

            // Reset icon styling
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.backgroundColor = '';
                icon.style.color = '';
                icon.style.transform = '';
            }
        });
    });

    // Step hover effect
    const steps = document.querySelectorAll('.step');

    steps.forEach(step => {
        step.addEventListener('mouseenter', function () {
            const stepNumber = this.querySelector('.step-number');
            if (stepNumber) {
                stepNumber.style.transform = 'scale(1.1)';
            }
        });

        step.addEventListener('mouseleave', function () {
            const stepNumber = this.querySelector('.step-number');
            if (stepNumber) {
                stepNumber.style.transform = '';
            }
        });
    });
}

// Call the function to initialize interactive effects
document.addEventListener('DOMContentLoaded', initializeInteractiveEffects);
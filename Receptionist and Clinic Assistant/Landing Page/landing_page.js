/**
 * Curis by Citrus - Landing Page JavaScript
 * 
 * This script handles all interactive functionality for the landing page:
 * - Smooth scrolling for navigation
 * - Animated elements on scroll
 * - Contact form validation and submission
 * - Dark mode toggle with persistent user preference
 * - Responsive behavior
 * - Accessibility enhancements
 */


// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Initialize all functionality
    initSmoothScrolling();
    initScrollAnimations();
    initContactForm();
    initDarkMode();
    initAccessibility();
    initTestimonialRotation();
    initFeatureInteraction();
    initCtaEffects();
    initPartnersLogosAnimation();
});

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    // Get all anchor links that have a hash
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    // Add click event to each anchor link
    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Prevent default behavior
            e.preventDefault();

            // Get the target element
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            // If target exists, scroll to it
            if (targetElement) {
                // Calculate header height for offset
                const headerHeight = document.querySelector('.main-header').offsetHeight;

                // Get the target's position relative to the viewport
                const targetPosition = targetElement.getBoundingClientRect().top;

                // Calculate the final position considering the header height
                const offsetPosition = targetPosition + window.pageYOffset - headerHeight - 20;

                // Smooth scroll to target
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize scroll animations using Intersection Observer
 */
function initScrollAnimations() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        // Array of sections to animate
        const sections = [
            '.hero-section',
            '.features-section',
            '.testimonials-section',
            '.benefits-section',
            '.trust-section',
            '.contact-section',
            '.final-cta-section'
        ];

        // Create observer options
        const observerOptions = {
            root: null, // viewport is the root
            rootMargin: '0px',
            threshold: 0.1 // trigger when 10% of the element is visible
        };

        // Create observer
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class when element is visible
                    entry.target.classList.add('animated', 'fade-in-up');

                    // Animate children elements with staggered delay
                    const children = entry.target.querySelectorAll('.feature-card, .testimonial-card, .benefit-item, .trust-badge');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('animated', 'fade-in-up');
                        }, 150 * index); // Stagger the animations
                    });

                    // Stop observing once animated
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Start observing each section
        sections.forEach(selector => {
            const section = document.querySelector(selector);
            if (section) {
                observer.observe(section);
            }
        });

        // Add animation CSS
        addAnimationStyles();
    }
}

/**
 * Add animation styles to the document
 */
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .feature-card, .testimonial-card, .benefit-item, .trust-badge {
            opacity: 0;
        }
        
        .feature-card.animated, .testimonial-card.animated, .benefit-item.animated, .trust-badge.animated {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize contact form validation and submission
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        // Add submit event listener
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form fields
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            // Simple validation
            if (validateForm(nameInput, emailInput, messageInput)) {
                // Show loading state
                const submitButton = contactForm.querySelector('button[type="submit"]');
                submitButton.innerHTML = 'Sending...';
                submitButton.disabled = true;

                // Simulate form submission (replace with actual API call)
                setTimeout(() => {
                    // Show success message
                    showFormMessage('Thank you! Your message has been sent.', 'success');

                    // Reset form
                    contactForm.reset();

                    // Reset button
                    submitButton.innerHTML = 'Send Message';
                    submitButton.disabled = false;

                    // Clear success message after delay
                    setTimeout(() => {
                        clearFormMessage();
                    }, 5000);
                }, 1500);
            }
        });

        // Add input event listeners for real-time validation
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        nameInput.addEventListener('input', () => validateInput(nameInput, 'Please enter your name'));
        emailInput.addEventListener('input', () => validateEmail(emailInput));
        messageInput.addEventListener('input', () => validateInput(messageInput, 'Please enter your message'));
    }
}

/**
 * Validate the contact form
 * @param {HTMLElement} nameInput - The name input element
 * @param {HTMLElement} emailInput - The email input element
 * @param {HTMLElement} messageInput - The message input element
 * @returns {boolean} - Whether the form is valid
 */
function validateForm(nameInput, emailInput, messageInput) {
    let isValid = true;

    // Validate name
    if (!validateInput(nameInput, 'Please enter your name')) {
        isValid = false;
    }

    // Validate email
    if (!validateEmail(emailInput)) {
        isValid = false;
    }

    // Validate message
    if (!validateInput(messageInput, 'Please enter your message')) {
        isValid = false;
    }

    return isValid;
}

/**
 * Validate an input field
 * @param {HTMLElement} input - The input element to validate
 * @param {string} errorMessage - The error message to display
 * @returns {boolean} - Whether the input is valid
 */
function validateInput(input, errorMessage) {
    // Remove any existing error message
    removeInputError(input);

    // Check if input is empty
    if (!input.value.trim()) {
        addInputError(input, errorMessage);
        return false;
    }

    return true;
}

/**
 * Validate an email field
 * @param {HTMLElement} input - The email input element
 * @returns {boolean} - Whether the email is valid
 */
function validateEmail(input) {
    // Remove any existing error message
    removeInputError(input);

    // Check if input is empty
    if (!input.value.trim()) {
        addInputError(input, 'Please enter your email address');
        return false;
    }

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value.trim())) {
        addInputError(input, 'Please enter a valid email address');
        return false;
    }

    return true;
}

/**
 * Add an error message to an input field
 * @param {HTMLElement} input - The input element
 * @param {string} message - The error message
 */
function addInputError(input, message) {
    // Add error class to input
    input.classList.add('error');

    // Create error message element if it doesn't exist
    let errorElement = input.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        input.parentNode.insertBefore(errorElement, input.nextSibling);
    }

    // Set error message
    errorElement.textContent = message;

    // Add error styles if not already in the document
    if (!document.getElementById('error-styles')) {
        const style = document.createElement('style');
        style.id = 'error-styles';
        style.textContent = `
            .error {
                border-color: #FF3B5C !important;
            }
            
            .error-message {
                color: #FF3B5C;
                font-size: 1.4rem;
                margin-top: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Remove an error message from an input field
 * @param {HTMLElement} input - The input element
 */
function removeInputError(input) {
    // Remove error class from input
    input.classList.remove('error');

    // Remove error message element if it exists
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = '';
    }
}

/**
 * Show a form message
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success or error)
 */
function showFormMessage(message, type) {
    const contactForm = document.getElementById('contact-form');

    // Create message element if it doesn't exist
    let messageElement = document.getElementById('form-message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'form-message';
        contactForm.appendChild(messageElement);
    }

    // Set message text and class
    messageElement.textContent = message;
    messageElement.className = `form-message ${type}`;

    // Add message styles if not already in the document
    if (!document.getElementById('message-styles')) {
        const style = document.createElement('style');
        style.id = 'message-styles';
        style.textContent = `
            .form-message {
                padding: 1.5rem;
                border-radius: 8px;
                margin-top: 2rem;
                text-align: center;
            }
            
            .form-message.success {
                background-color: rgba(0, 191, 165, 0.1);
                color: #00BFA5;
                border: 1px solid rgba(0, 191, 165, 0.2);
            }
            
            .form-message.error {
                background-color: rgba(255, 59, 92, 0.1);
                color: #FF3B5C;
                border: 1px solid rgba(255, 59, 92, 0.2);
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Clear the form message
 */
function clearFormMessage() {
    const messageElement = document.getElementById('form-message');
    if (messageElement) {
        messageElement.textContent = '';
        messageElement.className = 'form-message';
    }
}

/**
 * Initialize dark mode toggle
 */
function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    if (darkModeToggle) {
        // Check for saved user preference
        const darkMode = localStorage.getItem('darkMode');

        // If dark mode was previously enabled, turn it on
        if (darkMode === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
        }

        // Add click event to toggle
        darkModeToggle.addEventListener('click', () => {
            // Toggle dark mode class on body
            document.body.classList.toggle('dark-mode');

            // Update localStorage based on current state
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
                darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
            } else {
                localStorage.setItem('darkMode', 'disabled');
                darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
            }
        });
    }
}

/**
 * Initialize accessibility features
 */
function initAccessibility() {
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#hero-section';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Ensure all interactive elements have appropriate ARIA attributes
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.getAttribute('aria-label')) {
            button.setAttribute('aria-label', button.textContent.trim());
        }
    });

    // Add focus styles
    const focusStyles = document.createElement('style');
    focusStyles.textContent = `
        :focus-visible {
            outline: 3px solid var(--teal);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(focusStyles);
}

/**
 * Initialize testimonial rotation
 */
function initTestimonialRotation() {
    const testimonials = document.querySelectorAll('.testimonial-card');

    if (testimonials.length > 2) {
        // Only apply rotation if there are more than 2 testimonials
        let currentIndex = 0;

        // Hide all testimonials except the first two
        for (let i = 2; i < testimonials.length; i++) {
            testimonials[i].style.display = 'none';
        }

        // Rotate testimonials every 5 seconds
        setInterval(() => {
            // Hide current testimonial
            testimonials[currentIndex].style.display = 'none';

            // Calculate next index
            currentIndex = (currentIndex + 1) % testimonials.length;

            // Show next testimonial with fade-in effect
            testimonials[currentIndex].style.opacity = 0;
            testimonials[currentIndex].style.display = 'flex';

            // Trigger reflow
            void testimonials[currentIndex].offsetWidth;

            // Apply fade-in
            testimonials[currentIndex].style.transition = 'opacity 0.5s ease';
            testimonials[currentIndex].style.opacity = 1;
        }, 5000);
    }
}

/**
 * Initialize feature card interactions
 */
function initFeatureInteraction() {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        // Add hover effect
        card.addEventListener('mouseenter', () => {
            // Add subtle movement with CSS transform
            card.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', () => {
            // Reset transform
            card.style.transform = '';
        });

        // Add focus effect for accessibility
        card.addEventListener('focus', () => {
            card.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('blur', () => {
            card.style.transform = '';
        });
    });
}

/**
 * Initialize CTA button effects
 */
function initCtaEffects() {
    const ctaButtons = document.querySelectorAll('.primary-button');

    ctaButtons.forEach(button => {
        // Add ripple effect on click
        button.addEventListener('click', (e) => {
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            button.appendChild(ripple);

            // Position ripple
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });

        // Add pulsing effect to main CTA
        if (button.classList.contains('cta-main-button')) {
            // Add pulsing animation
            button.classList.add('pulse-animation');
        }
    });

    // Add ripple and pulse styles
    const ctaStyles = document.createElement('style');
    ctaStyles.textContent = `
        .primary-button {
            position: relative;
            overflow: hidden;
        }
        
        .ripple-effect {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.7);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .pulse-animation {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(0, 191, 165, 0.7);
            }
            70% {
                box-shadow: 0 0 0 15px rgba(0, 191, 165, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(0, 191, 165, 0);
            }
        }
    `;
    document.head.appendChild(ctaStyles);
}

/**
 * Initialize partners logos animation
 */
function initPartnersLogosAnimation() {
    const logos = document.querySelectorAll('.partner-logo');

    // Stop animation if there are no logos
    if (logos.length === 0) return;

    // Simple animation for 3 logos
    if (logos.length === 3) {
        setInterval(() => {
            // Shuffle the logos
            for (let i = 0; i < logos.length; i++) {
                setTimeout(() => {
                    logos[i].style.transform = 'scale(1.1)';

                    setTimeout(() => {
                        logos[i].style.transform = '';
                    }, 500);
                }, i * 500);
            }
        }, 5000);
    }
    // If there are more logos, create a carousel effect
    else if (logos.length > 3) {
        // Get the logo container
        const logoContainer = document.querySelector('.logo-container');

        // Clone logos for infinite loop
        logos.forEach(logo => {
            const clone = logo.cloneNode(true);
            logoContainer.appendChild(clone);
        });

        // Add animation
        logoContainer.style.animation = 'scrollLogos 20s linear infinite';
        logoContainer.style.display = 'flex';
        logoContainer.style.overflow = 'hidden';
        logoContainer.style.width = '100%';

        // Add animation styles
        const logoStyles = document.createElement('style');
        logoStyles.textContent = `
            @keyframes scrollLogos {
                0% {
                    transform: translateX(0);
                }
                100% {
                    transform: translateX(-${logos.length * 100}%);
                }
            }
            
            .logo-container {
                display: flex !important;
                gap: 50px;
                width: fit-content;
            }
            
            .partner-logo {
                flex-shrink: 0;
            }
        `;
        document.head.appendChild(logoStyles);
    }
}
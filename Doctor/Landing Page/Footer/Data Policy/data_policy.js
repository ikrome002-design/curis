/**
 * Curis Doctor Data Policy JavaScript
 * Created: April 17, 2025
 * 
 * This file contains the JavaScript functionality for the Curis Doctor Data Policy page,
 * including dark mode toggle, smooth scrolling, active section highlighting,
 * and responsive navigation handling.
 */

// Wait for the DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', function () {
    // ---------- DARK MODE FUNCTIONALITY ----------
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Check if user preference is stored in localStorage
    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
    }

    // Toggle dark mode when button is clicked
    darkModeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });

    // Function to enable dark mode
    function enableDarkMode() {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        updateDarkModeIcon(true);
    }

    // Function to disable dark mode
    function disableDarkMode() {
        body.classList.remove('dark-mode');
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

    // ---------- SMOOTH SCROLLING ----------
    // Get all navigation links that point to sections on the page
    const navLinks = document.querySelectorAll('a[href^="#"]');

    // Add click event listener to each navigation link
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Prevent default anchor behavior
            e.preventDefault();

            // Get the target section ID from the href attribute
            const targetId = this.getAttribute('href');

            // Handle special case for the page top
            if (targetId === '#') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            // Get the target element
            const targetSection = document.querySelector(targetId);

            // If target exists, scroll to it
            if (targetSection) {
                // Calculate position with offset for fixed header
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                // Scroll to the target section
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without refreshing the page
                history.pushState(null, null, targetId);
            }
        });
    });

    // ---------- ACTIVE SECTION HIGHLIGHTING ----------
    // Get all policy sections
    const policySections = document.querySelectorAll('.policy-section');

    // Function to check which section is in view and update navigation
    function highlightActiveSection() {
        const scrollPosition = window.scrollY;
        const headerHeight = document.querySelector('header').offsetHeight;

        // Check each section
        policySections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100; // Offset for better UX
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all navigation links
                document.querySelectorAll('nav ul li a').forEach(link => {
                    link.classList.remove('active');
                });

                // Add active class to corresponding navigation link
                const correspondingLink = document.querySelector(`a[href="#${sectionId}"]`);
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    // Add scroll event listener to highlight active section
    window.addEventListener('scroll', throttle(highlightActiveSection, 100));

    // Initial call to highlight the correct section on page load
    highlightActiveSection();

    // ---------- RESPONSIVE NAVIGATION ----------
    // Variables for responsive menu
    let isMenuOpen = false;

    // Create mobile menu toggle button if it doesn't exist yet
    if (!document.querySelector('.mobile-menu-toggle')) {
        const header = document.querySelector('header');
        const nav = document.querySelector('nav');

        // Create mobile menu toggle button
        const mobileMenuToggle = document.createElement('button');
        mobileMenuToggle.className = 'mobile-menu-toggle';
        mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';

        // Insert toggle button after logo container
        const logoContainer = document.querySelector('.logo-container');
        if (logoContainer && logoContainer.nextElementSibling) {
            header.insertBefore(mobileMenuToggle, logoContainer.nextElementSibling);
        }

        // Toggle mobile menu on button click
        mobileMenuToggle.addEventListener('click', function () {
            isMenuOpen = !isMenuOpen;

            if (isMenuOpen) {
                this.innerHTML = '<i class="fas fa-times"></i>';
                nav.classList.add('active');
            } else {
                this.innerHTML = '<i class="fas fa-bars"></i>';
                nav.classList.remove('active');
            }
        });

        // Close mobile menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (isMenuOpen && window.innerWidth <= 768) {
                    mobileMenuToggle.click();
                }
            });
        });

        // Add CSS for mobile menu if not in original CSS
        if (!document.getElementById('mobile-menu-styles')) {
            const mobileStyles = document.createElement('style');
            mobileStyles.id = 'mobile-menu-styles';
            mobileStyles.textContent = `
                @media (max-width: 768px) {
                    header {
                        flex-wrap: wrap;
                    }
                    .mobile-menu-toggle {
                        display: block;
                        background: transparent;
                        border: none;
                        color: var(--light-text);
                        font-size: 1.5rem;
                        cursor: pointer;
                        margin-left: auto;
                    }
                    nav {
                        width: 100%;
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.3s ease;
                    }
                    nav.active {
                        max-height: 300px;
                    }
                    nav ul {
                        flex-direction: column;
                        align-items: center;
                        padding: var(--space-md) 0;
                    }
                }
                @media (min-width: 769px) {
                    .mobile-menu-toggle {
                        display: none;
                    }
                    nav {
                        max-height: none !important;
                    }
                }
            `;
            document.head.appendChild(mobileStyles);
        }
    }

    // ---------- SECTION ANIMATIONS ----------
    // Add fade-in animation to sections as they enter the viewport
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    // Create intersection observer
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add animation classes and observe sections
    policySections.forEach(section => {
        section.classList.add('fade-animation');
        sectionObserver.observe(section);
    });

    // Add CSS for animations if not already in original CSS
    if (!document.getElementById('animation-styles')) {
        const animationStyles = document.createElement('style');
        animationStyles.id = 'animation-styles';
        animationStyles.textContent = `
            .fade-animation {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.5s ease, transform 0.5s ease;
            }
            .fade-animation.animated {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(animationStyles);
    }

    // ---------- UTILITY FUNCTIONS ----------
    // Throttle function to limit execution rate of event handlers
    function throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = new Date().getTime();
            if (now - lastCall < delay) {
                return;
            }
            lastCall = now;
            return func(...args);
        };
    }

    // ---------- PRINT FUNCTIONALITY ----------
    // Add print button to policy header
    const policyHeader = document.querySelector('.policy-header');

    if (policyHeader) {
        const printButton = document.createElement('button');
        printButton.className = 'print-button';
        printButton.innerHTML = '<i class="fas fa-print"></i> Print Policy';

        // Add CSS for print button
        if (!document.getElementById('print-button-styles')) {
            const printButtonStyles = document.createElement('style');
            printButtonStyles.id = 'print-button-styles';
            printButtonStyles.textContent = `
                .print-button {
                    background-color: var(--primary-color);
                    color: var(--light-text);
                    border: none;
                    padding: var(--space-sm) var(--space-md);
                    border-radius: var(--border-radius-sm);
                    cursor: pointer;
                    font-family: var(--font-family);
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: background-color var(--transition-speed);
                    margin-top: var(--space-md);
                }
                .print-button:hover {
                    background-color: var(--accent-color);
                }
                @media print {
                    header, footer, .print-button {
                        display: none !important;
                    }
                    body {
                        background-color: white;
                    }
                    main {
                        box-shadow: none;
                        padding: 0;
                        margin: 0;
                        max-width: 100%;
                    }
                }
            `;
            document.head.appendChild(printButtonStyles);
        }

        // Add print functionality
        printButton.addEventListener('click', function () {
            window.print();
        });

        policyHeader.appendChild(printButton);
    }

    // ---------- BACK TO TOP BUTTON ----------
    // Create back-to-top button
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTopButton);

    // Add CSS for back to top button
    if (!document.getElementById('back-to-top-styles')) {
        const backToTopStyles = document.createElement('style');
        backToTopStyles.id = 'back-to-top-styles';
        backToTopStyles.textContent = `
            .back-to-top {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: var(--accent-color);
                color: var(--light-text);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                box-shadow: var(--shadow-md);
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s, transform 0.3s, background-color 0.3s;
                z-index: 99;
            }
            .back-to-top.visible {
                opacity: 1;
                transform: translateY(0);
            }
            .back-to-top:hover {
                background-color: var(--secondary-color);
            }
            @media (max-width: 576px) {
                .back-to-top {
                    bottom: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                }
            }
        `;
        document.head.appendChild(backToTopStyles);
    }

    // Show/hide back-to-top button based on scroll position
    window.addEventListener('scroll', throttle(function () {
        if (window.pageYOffset > 500) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }, 100));

    // Scroll to top when button is clicked
    backToTopButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ---------- TABLE OF CONTENTS GENERATION ----------
    // Create table of contents for better navigation
    const mainContent = document.querySelector('main');

    if (mainContent) {
        // Create table of contents container
        const tocContainer = document.createElement('div');
        tocContainer.className = 'table-of-contents';
        tocContainer.innerHTML = '<h3>Table of Contents</h3>';

        // Create list for TOC items
        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';

        // Add each policy section to the TOC
        policySections.forEach(section => {
            const sectionId = section.getAttribute('id');
            const sectionTitle = section.querySelector('h2').textContent;

            const tocItem = document.createElement('li');
            const tocLink = document.createElement('a');
            tocLink.href = `#${sectionId}`;
            tocLink.textContent = sectionTitle;

            tocItem.appendChild(tocLink);
            tocList.appendChild(tocItem);

            // Add subsections if needed
            const subsections = section.querySelectorAll('.subsection h3');
            if (subsections.length > 0) {
                const subList = document.createElement('ul');
                subList.className = 'toc-sublist';

                subsections.forEach((subsection, index) => {
                    // Create an ID if subsection doesn't have one
                    let subsectionId = subsection.id;
                    if (!subsectionId) {
                        subsectionId = `${sectionId}-sub-${index}`;
                        subsection.id = subsectionId;
                    }

                    const subItem = document.createElement('li');
                    const subLink = document.createElement('a');
                    subLink.href = `#${subsectionId}`;
                    subLink.textContent = subsection.textContent;

                    subItem.appendChild(subLink);
                    subList.appendChild(subItem);
                });

                tocItem.appendChild(subList);
            }
        });

        tocContainer.appendChild(tocList);

        // Add TOC after policy header
        const policyHeader = document.querySelector('.policy-header');
        if (policyHeader && policyHeader.nextElementSibling) {
            mainContent.insertBefore(tocContainer, policyHeader.nextElementSibling);
        }

        // Add CSS for table of contents
        if (!document.getElementById('toc-styles')) {
            const tocStyles = document.createElement('style');
            tocStyles.id = 'toc-styles';
            tocStyles.textContent = `
                .table-of-contents {
                    background-color: var(--bg-color);
                    padding: var(--space-lg);
                    border-radius: var(--border-radius-md);
                    margin-bottom: var(--space-xxl);
                }
                .table-of-contents h3 {
                    margin-top: 0;
                    color: var(--primary-color);
                }
                .toc-list {
                    list-style-type: none;
                    padding-left: 0;
                }
                .toc-list li {
                    margin-bottom: var(--space-md);
                }
                .toc-list a {
                    color: var(--primary-color);
                    font-weight: 500;
                    text-decoration: none;
                    transition: color var(--transition-speed);
                }
                .toc-list a:hover {
                    color: var(--accent-color);
                }
                .toc-sublist {
                    list-style-type: none;
                    padding-left: var(--space-lg);
                    margin-top: var(--space-sm);
                }
                .toc-sublist li {
                    margin-bottom: var(--space-sm);
                }
                .toc-sublist a {
                    font-weight: 400;
                    font-size: 0.95em;
                }
                @media (max-width: 768px) {
                    .table-of-contents {
                        padding: var(--space-md);
                    }
                }
            `;
            document.head.appendChild(tocStyles);
        }

        // Add click handler for TOC links
        tocContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    // Calculate position with offset for fixed header
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                    // Scroll to the target section
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without refreshing the page
                    history.pushState(null, null, targetId);
                }
            });
        });
    }

    // ---------- VERSION TRACKING ----------
    // Track when the page was last viewed
    const lastViewed = new Date().toISOString();
    localStorage.setItem('dataPolicy_lastViewed', lastViewed);

    // Check if policy has been updated since last viewed
    const lastUpdatedText = document.querySelector('.policy-meta p:nth-child(2)').textContent;
    const lastUpdatedDate = lastUpdatedText.match(/Last Updated:\s*(.+)/)[1];

    const storedLastViewed = localStorage.getItem('dataPolicy_lastViewedVersion');

    if (storedLastViewed && storedLastViewed !== lastUpdatedDate) {
        // Create update notification
        const updateNotification = document.createElement('div');
        updateNotification.className = 'update-notification';
        updateNotification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-info-circle"></i>
                <p>This policy has been updated since you last viewed it on ${new Date(storedLastViewed).toLocaleDateString()}.</p>
                <button class="close-notification" aria-label="Close notification"><i class="fas fa-times"></i></button>
            </div>
        `;

        // Add notification to page
        document.body.appendChild(updateNotification);

        // Add CSS for notification
        if (!document.getElementById('notification-styles')) {
            const notificationStyles = document.createElement('style');
            notificationStyles.id = 'notification-styles';
            notificationStyles.textContent = `
                .update-notification {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    z-index: 1000;
                    max-width: 400px;
                    animation: slideIn 0.5s forwards;
                }
                .notification-content {
                    background-color: var(--accent-color);
                    color: var(--light-text);
                    padding: var(--space-md);
                    border-radius: var(--border-radius-md);
                    box-shadow: var(--shadow-md);
                    display: flex;
                    align-items: flex-start;
                    gap: var(--space-sm);
                }
                .notification-content i {
                    font-size: 1.2rem;
                    margin-top: 3px;
                }
                .notification-content p {
                    margin: 0;
                    flex: 1;
                }
                .close-notification {
                    background: transparent;
                    border: none;
                    color: var(--light-text);
                    cursor: pointer;
                    padding: 0;
                    margin-left: var(--space-sm);
                }
                @keyframes slideIn {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @media (max-width: 576px) {
                    .update-notification {
                        left: 10px;
                        right: 10px;
                        max-width: calc(100% - 20px);
                    }
                }
            `;
            document.head.appendChild(notificationStyles);
        }

        // Add close functionality
        const closeButton = updateNotification.querySelector('.close-notification');
        closeButton.addEventListener('click', function () {
            updateNotification.remove();
        });
    }

    // Update last viewed version
    localStorage.setItem('dataPolicy_lastViewedVersion', lastUpdatedDate);

    // ---------- POLICY ACCEPTANCE ----------
    // Check if user has already accepted policy
    const policyAccepted = localStorage.getItem('dataPolicy_accepted');

    if (!policyAccepted) {
        // Create acceptance modal
        const acceptanceModal = document.createElement('div');
        acceptanceModal.className = 'acceptance-modal';
        acceptanceModal.innerHTML = `
            <div class="modal-content">
                <h3>Data Policy Acknowledgment</h3>
                <p>Please take a moment to review our Data Policy. This policy outlines how we collect, use, and protect your data as a doctor using our platform.</p>
                <div class="modal-actions">
                    <button class="accept-button">I Acknowledge</button>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.appendChild(acceptanceModal);

        // Add CSS for modal
        if (!document.getElementById('modal-styles')) {
            const modalStyles = document.createElement('style');
            modalStyles.id = 'modal-styles';
            modalStyles.textContent = `
                .acceptance-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: var(--space-md);
                }
                .modal-content {
                    background-color: var(--card-bg);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-xl);
                    max-width: 500px;
                    width: 100%;
                    box-shadow: var(--shadow-lg);
                }
                .modal-content h3 {
                    margin-top: 0;
                    color: var(--primary-color);
                }
                .modal-actions {
                    margin-top: var(--space-xl);
                    display: flex;
                    justify-content: flex-end;
                }
                .accept-button {
                    background-color: var(--accent-color);
                    color: var(--light-text);
                    border: none;
                    padding: var(--space-sm) var(--space-lg);
                    border-radius: var(--border-radius-sm);
                    cursor: pointer;
                    font-family: var(--font-family);
                    font-weight: 500;
                    transition: background-color var(--transition-speed);
                }
                .accept-button:hover {
                    background-color: var(--secondary-color);
                }
            `;
            document.head.appendChild(modalStyles);
        }

        // Add acceptance functionality
        const acceptButton = acceptanceModal.querySelector('.accept-button');
        acceptButton.addEventListener('click', function () {
            localStorage.setItem('dataPolicy_accepted', new Date().toISOString());
            acceptanceModal.remove();
        });
    }

    // ---------- KEYBOARD NAVIGATION ----------
    // Enhance keyboard navigation for accessibility
    document.addEventListener('keydown', function (e) {
        // ESC key to close modal if open
        if (e.key === 'Escape') {
            const modal = document.querySelector('.acceptance-modal');
            if (modal) {
                const acceptButton = modal.querySelector('.accept-button');
                if (acceptButton) {
                    acceptButton.click();
                }
            }
        }

        // Home key to go to top
        if (e.key === 'Home') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // End key to go to bottom
        if (e.key === 'End') {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }
    });

    // ---------- INITIAL STARTUP CHECKS ----------
    // Check for URL hash and scroll to section if present
    if (window.location.hash) {
        const targetId = window.location.hash;
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            // Delay to ensure page is fully loaded
            setTimeout(() => {
                // Calculate position with offset for fixed header
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                // Scroll to the target section
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
});
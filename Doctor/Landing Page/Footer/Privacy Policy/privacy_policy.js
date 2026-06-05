/**
 * Curis Privacy Policy JavaScript
 * Created: April 18, 2025
 * 
 * This file contains the JavaScript functionality for the Curis Privacy Policy page,
 * including dark mode toggle, smooth scrolling, active section highlighting,
 * table of contents, and other interactive elements.
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
        if (body.hasAttribute('data-theme') && body.getAttribute('data-theme') === 'dark') {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });

    // Function to enable dark mode
    function enableDarkMode() {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('darkMode', 'enabled');
        updateDarkModeIcon(true);
    }

    // Function to disable dark mode
    function disableDarkMode() {
        body.removeAttribute('data-theme');
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
    const allLinks = document.querySelectorAll('a[href^="#"]');

    // Add click event listener to each navigation link
    allLinks.forEach(link => {
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
                // Highlight this section in the table of contents if it exists
                const correspondingTocLink = document.querySelector(`.toc-list a[href="#${sectionId}"]`);
                if (correspondingTocLink) {
                    // Remove active class from all navigation links
                    document.querySelectorAll('.toc-list a').forEach(link => {
                        link.classList.remove('active-section');
                    });

                    // Add active class to corresponding link
                    correspondingTocLink.classList.add('active-section');
                }
            }
        });
    }

    // Add scroll event listener to highlight active section
    window.addEventListener('scroll', throttle(highlightActiveSection, 100));

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
                    background-color: var(--color-neutral-light);
                    padding: var(--spacing-md);
                    border-radius: var(--border-radius-md);
                    margin-bottom: var(--spacing-xl);
                    border-left: 4px solid var(--color-accent);
                }
                [data-theme="dark"] .table-of-contents {
                    background-color: rgba(0, 191, 165, 0.1);
                }
                .table-of-contents h3 {
                    margin-top: 0;
                    color: var(--color-primary);
                }
                [data-theme="dark"] .table-of-contents h3 {
                    color: var(--color-accent);
                }
                .toc-list {
                    list-style-type: none !important;
                    padding-left: 0 !important;
                    margin-bottom: 0;
                }
                .toc-list li {
                    margin-bottom: var(--spacing-sm);
                    padding-left: 0 !important;
                }
                .toc-list li::before {
                    display: none;
                }
                .toc-list a {
                    color: var(--color-primary);
                    font-weight: 500;
                    transition: color var(--transition-fast);
                    text-decoration: none;
                    display: block;
                    padding: var(--spacing-xs) 0;
                }
                [data-theme="dark"] .toc-list a {
                    color: var(--color-text);
                }
                .toc-list a:hover, .toc-list a.active-section {
                    color: var(--color-accent);
                }
                .toc-sublist {
                    list-style-type: none !important;
                    padding-left: var(--spacing-md) !important;
                    margin-top: var(--spacing-xs);
                    margin-bottom: 0 !important;
                }
                .toc-sublist li {
                    margin-bottom: var(--spacing-xs);
                }
                .toc-sublist li::before {
                    display: none;
                }
                .toc-sublist a {
                    font-weight: 400;
                    font-size: 0.95em;
                }
                @media (max-width: 768px) {
                    .table-of-contents {
                        padding: var(--spacing-sm);
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

    // Initial call to highlight the correct section on page load
    setTimeout(highlightActiveSection, 100);

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
                background-color: var(--color-accent);
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                box-shadow: 0 4px 8px var(--color-shadow);
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
                background-color: var(--color-secondary);
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
                    background-color: var(--color-primary);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--border-radius-md);
                    cursor: pointer;
                    font-family: var(--font-primary);
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: background-color var(--transition-fast);
                    margin-top: var(--spacing-sm);
                }
                .print-button:hover {
                    background-color: var(--color-accent);
                }
                @media print {
                    header, footer, .print-button, .back-to-top, .table-of-contents {
                        display: none !important;
                    }
                    body {
                        background-color: white !important;
                        color: black !important;
                    }
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                    h1, h2, h3, h4, h5, h6, strong {
                        color: black !important;
                    }
                    .policy-note {
                        border: 1px solid #ccc !important;
                        background-color: white !important;
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

    // Add CSS for animations
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

    // ---------- PRIVACY POLICY ACCEPTANCE ----------
    // Check if user has already accepted policy
    const policyAccepted = localStorage.getItem('privacyPolicy_accepted');

    if (!policyAccepted) {
        // Create acceptance modal
        const acceptanceModal = document.createElement('div');
        acceptanceModal.className = 'acceptance-modal';
        acceptanceModal.innerHTML = `
            <div class="modal-content">
                <h3>Privacy Policy Acknowledgment</h3>
                <p>Please take a moment to review our Privacy Policy. This policy outlines how we collect, use, and protect your personal data as a doctor using our platform.</p>
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
                    padding: var(--spacing-md);
                }
                .modal-content {
                    background-color: var(--color-background);
                    border-radius: var(--border-radius-lg);
                    padding: var(--spacing-xl);
                    max-width: 500px;
                    width: 100%;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }
                .modal-content h3 {
                    margin-top: 0;
                    color: var(--color-primary);
                }
                [data-theme="dark"] .modal-content h3 {
                    color: var(--color-accent);
                }
                .modal-actions {
                    margin-top: var(--spacing-lg);
                    display: flex;
                    justify-content: flex-end;
                }
                .accept-button {
                    background-color: var(--color-accent);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--border-radius-md);
                    cursor: pointer;
                    font-family: var(--font-primary);
                    font-weight: 500;
                    transition: background-color var(--transition-fast);
                }
                .accept-button:hover {
                    background-color: var(--color-secondary);
                }
            `;
            document.head.appendChild(modalStyles);
        }

        // Add acceptance functionality
        const acceptButton = acceptanceModal.querySelector('.accept-button');
        acceptButton.addEventListener('click', function () {
            localStorage.setItem('privacyPolicy_accepted', new Date().toISOString());
            acceptanceModal.remove();
        });
    }

    // ---------- VERSION TRACKING ----------
    // Track when the page was last viewed
    const lastViewed = new Date().toISOString();
    localStorage.setItem('privacyPolicy_lastViewed', lastViewed);

    // Check if policy has been updated since last viewed
    const lastUpdatedText = document.querySelector('.policy-meta p:nth-child(2)').textContent;
    const lastUpdatedDate = lastUpdatedText.match(/Last Updated:\s*(.+)/)[1];

    const storedLastViewed = localStorage.getItem('privacyPolicy_lastViewedVersion');

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
                    background-color: var(--color-accent);
                    color: white;
                    padding: var(--spacing-sm);
                    border-radius: var(--border-radius-md);
                    box-shadow: 0 4px 10px var(--color-shadow);
                    display: flex;
                    align-items: flex-start;
                    gap: var(--spacing-xs);
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
                    color: white;
                    cursor: pointer;
                    padding: 0;
                    margin-left: var(--spacing-xs);
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
    localStorage.setItem('privacyPolicy_lastViewedVersion', lastUpdatedDate);

    // ---------- MOBILE-FRIENDLY NAVIGATION ----------
    // Create a mobile-friendly menu button if the screen is small
    function setupMobileNavigation() {
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-toggle')) {
            const header = document.querySelector('header');
            const nav = document.querySelector('nav');

            // Create mobile menu toggle button
            const mobileMenuToggle = document.createElement('button');
            mobileMenuToggle.className = 'mobile-menu-toggle';
            mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';

            // Insert toggle button before nav
            header.insertBefore(mobileMenuToggle, nav);

            // Add CSS for mobile navigation
            if (!document.getElementById('mobile-nav-styles')) {
                const mobileNavStyles = document.createElement('style');
                mobileNavStyles.id = 'mobile-nav-styles';
                mobileNavStyles.textContent = `
                    @media (max-width: 768px) {
                        .mobile-menu-toggle {
                            display: block;
                            background: transparent;
                            border: none;
                            color: white;
                            font-size: 1.5rem;
                            cursor: pointer;
                            margin-left: auto;
                            margin-right: var(--spacing-sm);
                        }
                        nav {
                            position: absolute;
                            top: 100%;
                            left: 0;
                            right: 0;
                            background-color: var(--color-primary);
                            max-height: 0;
                            overflow: hidden;
                            transition: max-height 0.3s ease;
                        }
                        nav.mobile-active {
                            max-height: 300px;
                        }
                        nav ul {
                            flex-direction: column;
                            padding: var(--spacing-sm);
                        }
                        nav ul li {
                            margin-bottom: var(--spacing-sm);
                        }
                    }
                    @media (min-width: 769px) {
                        .mobile-menu-toggle {
                            display: none;
                        }
                    }
                `;
                document.head.appendChild(mobileNavStyles);
            }

            // Toggle mobile menu on button click
            mobileMenuToggle.addEventListener('click', function () {
                nav.classList.toggle('mobile-active');

                if (nav.classList.contains('mobile-active')) {
                    this.innerHTML = '<i class="fas fa-times"></i>';
                } else {
                    this.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }
    }

    // Call on load and when window resizes
    setupMobileNavigation();
    window.addEventListener('resize', throttle(setupMobileNavigation, 200));

    // ---------- RESPONSIVE TEXT ADJUSTMENTS ----------
    // Automatically adjust font sizes for better mobile readability
    function adjustTextSizes() {
        if (window.innerWidth <= 576) {
            document.querySelectorAll('.policy-section ul li').forEach(item => {
                item.style.marginBottom = 'var(--spacing-xs)';
            });
        } else {
            document.querySelectorAll('.policy-section ul li').forEach(item => {
                item.style.marginBottom = '';
            });
        }
    }

    // Call on load and when window resizes
    adjustTextSizes();
    window.addEventListener('resize', throttle(adjustTextSizes, 200));

    // ---------- KEYBOARD NAVIGATION ENHANCEMENTS ----------
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

    // ---------- ACCESSIBILITY IMPROVEMENTS ----------
    // Add proper ARIA attributes for screen readers
    document.querySelectorAll('.policy-section').forEach(section => {
        section.setAttribute('role', 'region');
        const heading = section.querySelector('h2');
        if (heading) {
            section.setAttribute('aria-labelledby', heading.id || heading.textContent.replace(/\s+/g, '-').toLowerCase());
        }
    });

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
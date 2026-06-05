/**
 * Curis Terms and Conditions JavaScript
 * Created: April 18, 2025
 * 
 * This file contains the JavaScript functionality for the Curis Terms and Conditions page,
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
    // Get all terms sections
    const termsSections = document.querySelectorAll('.terms-section');

    // Function to check which section is in view and update navigation
    function highlightActiveSection() {
        const scrollPosition = window.scrollY;
        const headerHeight = document.querySelector('header').offsetHeight;

        // Check each section
        termsSections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100; // Offset for better UX
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all navigation links in the header
                document.querySelectorAll('nav ul li a').forEach(link => {
                    if (link.getAttribute('href') === '#') {
                        link.classList.remove('active');
                    }
                });

                // Highlight this section in the table of contents if it exists
                const correspondingTocLink = document.querySelector(`.toc-list a[href="#${sectionId}"]`);
                if (correspondingTocLink) {
                    // Remove active class from all TOC links
                    document.querySelectorAll('.toc-list a').forEach(link => {
                        link.classList.remove('active-section');
                    });

                    // Add active class to corresponding TOC link
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

        // Add each terms section to the TOC
        termsSections.forEach(section => {
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

        // Add TOC after terms header
        const termsHeader = document.querySelector('.terms-header');
        if (termsHeader && termsHeader.nextElementSibling) {
            mainContent.insertBefore(tocContainer, termsHeader.nextElementSibling);
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
    // Add print button to terms header
    const termsHeader = document.querySelector('.terms-header');

    if (termsHeader) {
        const printButton = document.createElement('button');
        printButton.className = 'print-button';
        printButton.innerHTML = '<i class="fas fa-print"></i> Print Terms';

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
                    .terms-note {
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

        termsHeader.appendChild(printButton);
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
    termsSections.forEach(section => {
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

    // ---------- TERMS ACCEPTANCE ----------
    // Check if user has already accepted terms
    const termsAccepted = localStorage.getItem('termsAndConditions_accepted');

    if (!termsAccepted) {
        // Create acceptance modal
        const acceptanceModal = document.createElement('div');
        acceptanceModal.className = 'acceptance-modal';
        acceptanceModal.innerHTML = `
            <div class="modal-content">
                <h3>Terms and Conditions Acknowledgment</h3>
                <p>Please review our Terms and Conditions carefully. By clicking "I Accept" below, you acknowledge that you have read, understood, and agree to be bound by these terms.</p>
                <div class="modal-actions">
                    <button class="accept-button">I Accept</button>
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
            localStorage.setItem('termsAndConditions_accepted', new Date().toISOString());
            acceptanceModal.remove();
        });
    }

    // ---------- VERSION TRACKING ----------
    // Track when the page was last viewed
    const lastViewed = new Date().toISOString();
    localStorage.setItem('termsAndConditions_lastViewed', lastViewed);

    // Check if terms have been updated since last viewed
    const lastUpdatedText = document.querySelector('.terms-meta p:nth-child(2)').textContent;
    const lastUpdatedDate = lastUpdatedText.match(/Last Updated:\s*(.+)/)[1];

    const storedLastViewed = localStorage.getItem('termsAndConditions_lastViewedVersion');

    if (storedLastViewed && storedLastViewed !== lastUpdatedDate) {
        // Create update notification
        const updateNotification = document.createElement('div');
        updateNotification.className = 'update-notification';
        updateNotification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-circle"></i>
                <p>These Terms and Conditions have been updated since you last viewed them on ${new Date(storedLastViewed).toLocaleDateString()}. Please review the changes.</p>
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
                    background-color: var(--color-secondary);
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
    localStorage.setItem('termsAndConditions_lastViewedVersion', lastUpdatedDate);

    // ---------- RESPONSIVE NAVIGATION ----------
    // Add responsive navigation for mobile devices
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
                        header {
                            flex-wrap: wrap;
                            justify-content: space-between;
                        }
                        .mobile-menu-toggle {
                            display: block;
                            background: transparent;
                            border: none;
                            color: white;
                            font-size: 1.5rem;
                            cursor: pointer;
                        }
                        nav {
                            flex-basis: 100%;
                            max-height: 0;
                            overflow: hidden;
                            transition: max-height 0.3s ease;
                        }
                        nav.mobile-active {
                            max-height: 300px;
                        }
                        nav ul {
                            flex-direction: column;
                            align-items: flex-start;
                            padding: var(--spacing-sm) 0;
                        }
                        nav ul li {
                            width: 100%;
                        }
                        nav ul li a {
                            display: block;
                            padding: var(--spacing-xs) 0;
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

            // Close mobile menu when clicking a link
            nav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', function () {
                    if (nav.classList.contains('mobile-active')) {
                        nav.classList.remove('mobile-active');
                        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                });
            });
        }
    }

    // Call on load and when window resizes
    setupMobileNavigation();
    window.addEventListener('resize', throttle(setupMobileNavigation, 200));

    // ---------- SECTION HIGHLIGHTING ----------
    // Add visual indicators for important sections
    document.querySelectorAll('.terms-section').forEach(section => {
        // Highlight sections about user responsibilities and limitations
        if (section.id === 'user-responsibilities' || section.id === 'limitations') {
            section.classList.add('important-section');
        }
    });

    // Add CSS for highlighted sections
    if (!document.getElementById('highlight-styles')) {
        const highlightStyles = document.createElement('style');
        highlightStyles.id = 'highlight-styles';
        highlightStyles.textContent = `
            .important-section {
                position: relative;
            }
            .important-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: -20px;
                height: 100%;
                width: 4px;
                background-color: var(--color-secondary);
                border-radius: 2px;
            }
            @media (max-width: 768px) {
                .important-section::before {
                    left: -10px;
                }
            }
        `;
        document.head.appendChild(highlightStyles);
    }

    // ---------- TERM DEFINITION TOOLTIPS ----------
    // Add tooltips for defined terms
    const definedTerms = {
        'Curis Platform': 'The digital service owned and operated by Citrus Labs Limited.',
        'User': 'Any registered individual including Doctors, Patients, and Clinics.',
        'Doctor (Specialist)': 'A licensed medical professional offering services on Curis.'
    };

    // Find and enhance defined terms in the content
    document.querySelectorAll('.terms-section p, .terms-section li').forEach(element => {
        let html = element.innerHTML;

        // Replace defined terms with enhanced versions
        Object.keys(definedTerms).forEach(term => {
            // Use regex to find the term but not if it's already in a span
            const regex = new RegExp(`(?<!<[^>]*)(${term})(?![^<]*>)`, 'g');
            html = html.replace(regex, `<span class="defined-term" data-term="${term}">${term}</span>`);
        });

        element.innerHTML = html;
    });

    // Add tooltip functionality
    document.addEventListener('mouseover', function (e) {
        if (e.target.classList.contains('defined-term')) {
            const term = e.target.getAttribute('data-term');
            const definition = definedTerms[term];

            // Create tooltip if it doesn't exist
            let tooltip = document.getElementById('term-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.id = 'term-tooltip';
                document.body.appendChild(tooltip);
            }

            // Position and show tooltip
            tooltip.textContent = definition;
            tooltip.style.top = `${e.pageY + 15}px`;
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.classList.add('visible');
        }
    });

    document.addEventListener('mouseout', function (e) {
        if (e.target.classList.contains('defined-term')) {
            const tooltip = document.getElementById('term-tooltip');
            if (tooltip) {
                tooltip.classList.remove('visible');
            }
        }
    });

    // Add CSS for tooltips
    if (!document.getElementById('tooltip-styles')) {
        const tooltipStyles = document.createElement('style');
        tooltipStyles.id = 'tooltip-styles';
        tooltipStyles.textContent = `
            .defined-term {
                text-decoration: underline dotted var(--color-accent);
                cursor: help;
            }
            #term-tooltip {
                position: absolute;
                background-color: var(--color-primary);
                color: white;
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--border-radius-sm);
                font-size: var(--font-size-sm);
                max-width: 300px;
                box-shadow: 0 2px 8px var(--color-shadow);
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s;
            }
            #term-tooltip.visible {
                opacity: 1;
                visibility: visible;
            }
            [data-theme="dark"] #term-tooltip {
                background-color: var(--color-accent);
                color: black;
            }
        `;
        document.head.appendChild(tooltipStyles);
    }

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

            // Close any tooltip
            const tooltip = document.getElementById('term-tooltip');
            if (tooltip) {
                tooltip.classList.remove('visible');
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
    document.querySelectorAll('.terms-section').forEach(section => {
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
/**
 * Curis by Citrus - Patient Privacy Policy JavaScript
 * Provides interactive functionality and enhanced user experience
 * for the Privacy Policy page in the Curis platform.
 * 
 * Author: Citrus Labs Limited
 * Last Updated: March 2025
 */

// Wait for DOM to be fully loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all core functions
    initializeDarkMode();
    initializeSmoothScrolling();
    setupTableOfContents();
    handleResponsiveNavigation();
    highlightCurrentSection();
    setupAccessibilityFeatures();
    setupPrintFunctionality();
    setupCopyLinkFeature();
});

/**
 * Dark Mode Functionality
 * Toggles between light and dark theme based on user preference
 */
function initializeDarkMode() {
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Check for saved theme preference or use the system preference
    const currentTheme = localStorage.getItem('theme') ||
        (prefersDarkScheme.matches ? 'dark' : 'light');

    // Apply the saved theme or system preference
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    // Toggle theme when dark mode button is clicked
    darkModeBtn.addEventListener('click', function () {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Announce theme change for screen readers
        announceThemeChange(newTheme);
    });

    // Listen for system preference changes
    prefersDarkScheme.addEventListener('change', function (e) {
        if (!localStorage.getItem('theme')) {
            // Only update if user hasn't set a preference
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
        }
    });
}

/**
 * Announce theme change for screen readers
 * @param {string} theme - The current theme (dark or light)
 */
function announceThemeChange(theme) {
    const announcement = document.createElement('div');
    announcement.className = 'visually-hidden';
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = `Switched to ${theme} mode`;

    document.body.appendChild(announcement);

    // Remove the announcement after it's been read
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 3000);
}

/**
 * Smooth Scrolling
 * Enables smooth scrolling to section anchors
 */
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Only scroll if the target exists
            if (document.querySelector(targetId)) {
                e.preventDefault();

                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update URL without page reload
                window.history.pushState(null, null, targetId);
            }
        });
    });

    // Handle initial hash in URL
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            // Slight delay to ensure page is fully loaded
            setTimeout(() => {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }
}

/**
 * Dynamic Table of Contents
 * Creates an interactive TOC based on the page structure
 */
function setupTableOfContents() {
    // Check if we need to create a TOC - only create if there are enough sections
    const mainSections = document.querySelectorAll('main > article > section[id]');

    if (mainSections.length >= 3) {
        // Create TOC container
        const tocContainer = document.createElement('div');
        tocContainer.className = 'toc';
        tocContainer.setAttribute('aria-labelledby', 'toc-title');

        const tocTitle = document.createElement('div');
        tocTitle.id = 'toc-title';
        tocTitle.className = 'toc-title';
        tocTitle.textContent = 'Table of Contents';

        // Create the list
        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';

        // Add each main section to the TOC
        mainSections.forEach(section => {
            const sectionHeading = section.querySelector('h2');
            if (!sectionHeading) return;

            const sectionTitle = sectionHeading.textContent;
            const sectionId = section.id;

            const listItem = document.createElement('li');
            const link = document.createElement('a');

            link.href = `#${sectionId}`;
            link.textContent = sectionTitle;
            link.classList.add('toc-h2');

            listItem.appendChild(link);

            tocList.appendChild(listItem);

            // Check for subsections and add them if they exist
            const subSections = section.querySelectorAll('section[id]');

            if (subSections.length > 0) {
                subSections.forEach(subSection => {
                    const subSectionHeading = subSection.querySelector('h3');
                    if (!subSectionHeading) return;

                    const subSectionTitle = subSectionHeading.textContent;
                    const subSectionId = subSection.id;

                    const subListItem = document.createElement('li');
                    const subLink = document.createElement('a');

                    subLink.href = `#${subSectionId}`;
                    subLink.textContent = subSectionTitle;
                    subLink.classList.add('toc-h3');

                    subListItem.appendChild(subLink);
                    tocList.appendChild(subListItem);
                });
            }
        });

        // Add toggle functionality for mobile
        const tocToggle = document.createElement('button');
        tocToggle.className = 'toc-toggle';
        tocToggle.textContent = 'Show Table of Contents';
        tocToggle.setAttribute('aria-expanded', 'false');
        tocToggle.setAttribute('aria-controls', 'toc-list');

        tocToggle.addEventListener('click', function () {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            this.textContent = isExpanded ? 'Show Table of Contents' : 'Hide Table of Contents';

            tocList.classList.toggle('toc-expanded');
        });

        tocContainer.appendChild(tocTitle);
        tocContainer.appendChild(tocToggle);
        tocContainer.appendChild(tocList);

        // Insert TOC after the policy header
        const article = document.querySelector('main > article');
        const policyHeader = article.querySelector('.policy-header');

        if (policyHeader) {
            article.insertBefore(tocContainer, policyHeader.nextSibling);
        } else {
            article.insertBefore(tocContainer, article.firstChild);
        }

        // Add responsive behavior
        handleTocResponsiveness();
        window.addEventListener('resize', handleTocResponsiveness);
    }

    // Add anchor links to headings
    document.querySelectorAll('main > article > section > h2, main > article > section > section > h3').forEach(heading => {
        const id = heading.parentElement.id;
        if (!id) return;

        const anchorLink = document.createElement('a');
        anchorLink.className = 'anchor-link';
        anchorLink.href = `#${id}`;
        anchorLink.innerHTML = '#';
        anchorLink.title = 'Link to this section';
        anchorLink.setAttribute('aria-label', `Link to ${heading.textContent} section`);

        heading.appendChild(anchorLink);
    });
}

/**
 * Handle TOC responsiveness
 * Controls TOC display based on screen width
 */
function handleTocResponsiveness() {
    const tocList = document.querySelector('.toc-list');
    const tocToggle = document.querySelector('.toc-toggle');

    if (tocList && tocToggle) {
        if (window.innerWidth < 768) {
            tocList.classList.remove('toc-expanded');
            tocToggle.setAttribute('aria-expanded', 'false');
            tocToggle.textContent = 'Show Table of Contents';
            tocToggle.style.display = 'block';
        } else {
            tocList.classList.add('toc-expanded');
            tocToggle.setAttribute('aria-expanded', 'true');
            tocToggle.style.display = 'none';
        }
    }
}

/**
 * Responsive Navigation
 * Handles mobile navigation menu
 */
function handleResponsiveNavigation() {
    // Check if we need a mobile menu toggle
    if (window.innerWidth < 768) {
        const nav = document.querySelector('.main-navigation');

        if (nav && !document.querySelector('.mobile-nav-toggle')) {
            const navToggle = document.createElement('button');
            navToggle.className = 'mobile-nav-toggle';
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-controls', 'main-nav');
            navToggle.innerHTML = '<span class="hamburger-icon"></span><span class="visually-hidden">Menu</span>';

            // Add ID to navigation for aria-controls
            const navList = nav.querySelector('ul');
            if (navList) {
                navList.id = 'main-nav';

                // Insert toggle before navigation
                nav.parentNode.insertBefore(navToggle, nav);

                // Toggle navigation when button is clicked
                navToggle.addEventListener('click', function () {
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    this.setAttribute('aria-expanded', !isExpanded);

                    nav.classList.toggle('nav-expanded');
                    navList.classList.toggle('nav-visible');
                });
            }
        }
    }

    // Handle resize events
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 768) {
            // Reset mobile navigation if screen is resized to desktop
            const nav = document.querySelector('.main-navigation');
            const navList = document.getElementById('main-nav');

            if (nav && navList) {
                nav.classList.remove('nav-expanded');
                navList.classList.remove('nav-visible');

                const navToggle = document.querySelector('.mobile-nav-toggle');
                if (navToggle) {
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            }
        } else {
            // Initialize mobile navigation if needed
            handleResponsiveNavigation();
        }
    });
}

/**
 * Section Highlighting
 * Highlights the current section in view
 */
function highlightCurrentSection() {
    // All section elements that need to be observed
    const sections = document.querySelectorAll('section[id]');

    // Setup Intersection Observer
    const observerOptions = {
        root: null, // use the viewport
        rootMargin: '0px 0px -50% 0px', // consider section in view when it's 50% visible
        threshold: 0 // trigger as soon as any part is visible
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            // Get corresponding TOC link
            const id = entry.target.getAttribute('id');
            const tocLink = document.querySelector(`.toc-list a[href="#${id}"]`);

            if (tocLink) {
                if (entry.isIntersecting) {
                    // Remove active class from all links
                    document.querySelectorAll('.toc-list a').forEach(link => {
                        link.classList.remove('active');
                    });

                    // Add active class to the TOC link
                    tocLink.classList.add('active');

                    // Update URL without scrolling (only for main sections)
                    if (entry.target.parentElement.classList.contains('privacy-policy')) {
                        const newUrl = `${window.location.pathname}#${id}`;
                        history.replaceState(null, null, newUrl);
                    }
                }
            }
        });
    }, observerOptions);

    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * Accessibility Features
 * Enhances accessibility of the page
 */
function setupAccessibilityFeatures() {
    // Add skip to content link for keyboard users
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-to-content';
    skipLink.href = '#introduction';
    skipLink.textContent = 'Skip to Content';

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Enhance focus visibility
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-user');
        }
    });

    document.addEventListener('mousedown', function () {
        document.body.classList.remove('keyboard-user');
    });

    // Add ARIA landmarks
    document.querySelector('header').setAttribute('role', 'banner');
    document.querySelector('main').setAttribute('role', 'main');
    document.querySelector('footer').setAttribute('role', 'contentinfo');
    document.querySelector('.main-navigation').setAttribute('role', 'navigation');

    if (document.querySelector('.toc')) {
        document.querySelector('.toc').setAttribute('role', 'navigation');
        document.querySelector('.toc').setAttribute('aria-label', 'Table of Contents');
    }

    // Add button for printing the policy
    const printButton = document.createElement('button');
    printButton.className = 'print-policy';
    printButton.innerHTML = '<i class="fas fa-print"></i> Print Privacy Policy';
    printButton.addEventListener('click', function () {
        window.print();
    });

    // Add to end of policy
    document.querySelector('main > article').appendChild(printButton);

    // Add reading time estimate
    addReadingTimeEstimate();
}

/**
 * Add reading time estimate
 * Calculates and displays an estimated reading time for the policy
 */
function addReadingTimeEstimate() {
    // Get all text content from the privacy policy
    const policyContent = document.querySelector('.privacy-policy').textContent;

    // Count words (rough approximation: split by spaces)
    const wordCount = policyContent.split(/\s+/).length;

    // Calculate reading time (average reading speed: 200-250 words per minute)
    const readingTimeMinutes = Math.ceil(wordCount / 225);

    // Create reading time element
    const readingTime = document.createElement('div');
    readingTime.className = 'reading-time';
    readingTime.innerHTML = `<i class="fas fa-clock"></i> Estimated reading time: ${readingTimeMinutes} minute${readingTimeMinutes !== 1 ? 's' : ''}`;

    // Add to the top of the policy, after the policy metadata
    const policyMetadata = document.querySelector('.policy-metadata');
    if (policyMetadata) {
        policyMetadata.parentNode.insertBefore(readingTime, policyMetadata.nextSibling);
    }
}

/**
 * Copy Link Feature
 * Allows users to copy direct links to sections
 */
function setupCopyLinkFeature() {
    document.querySelectorAll('.anchor-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Get the full URL with the section hash
            const url = window.location.origin +
                window.location.pathname +
                this.getAttribute('href');

            // Copy to clipboard
            navigator.clipboard.writeText(url).then(
                function () {
                    // Show success message
                    showCopyNotification('Link copied to clipboard!');

                    // Still update the URL in the browser
                    window.history.pushState(null, null, anchor.getAttribute('href'));
                },
                function () {
                    // Fallback for browsers that don't support clipboard API
                    showCopyNotification('Copy failed. Please copy the URL manually.', true);
                }
            );
        });
    });
}

/**
 * Show copy notification
 * Displays a temporary notification when a link is copied
 * @param {string} message - The notification message
 * @param {boolean} isError - Whether this is an error notification
 */
function showCopyNotification(message, isError = false) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    if (isError) notification.classList.add('error');
    notification.textContent = message;

    // Add to document
    document.body.appendChild(notification);

    // Remove after a delay
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

/**
 * Print Functionality
 * Enhances the print experience
 */
function setupPrintFunctionality() {
    // Add event listener for before print
    window.addEventListener('beforeprint', function () {
        // Hide table of contents
        const toc = document.querySelector('.toc');
        if (toc) toc.style.display = 'none';

        // Hide reading time
        const readingTime = document.querySelector('.reading-time');
        if (readingTime) readingTime.style.display = 'none';

        // Hide print button
        const printButton = document.querySelector('.print-policy');
        if (printButton) printButton.style.display = 'none';

        // Add print-specific class to body
        document.body.classList.add('printing');

        // Hide anchor links
        document.querySelectorAll('.anchor-link').forEach(link => {
            link.style.display = 'none';
        });
    });

    // Add event listener for after print
    window.addEventListener('afterprint', function () {
        // Restore previous state
        document.body.classList.remove('printing');

        // Show table of contents
        const toc = document.querySelector('.toc');
        if (toc) toc.style.display = '';

        // Show reading time
        const readingTime = document.querySelector('.reading-time');
        if (readingTime) readingTime.style.display = '';

        // Show print button
        const printButton = document.querySelector('.print-policy');
        if (printButton) printButton.style.display = '';

        // Show anchor links
        document.querySelectorAll('.anchor-link').forEach(link => {
            link.style.display = '';
        });
    });
}

// Add CSS for new elements created by JavaScript
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    /* Skip to content link */
    .skip-to-content {
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--accent-teal);
        color: white;
        padding: 8px;
        z-index: 100;
        transition: top 0.3s;
    }
    
    .skip-to-content:focus {
        top: 0;
    }
    
    /* Reading time */
    .reading-time {
        text-align: center;
        color: var(--medium-gray);
        margin-bottom: var(--spacing-lg);
        font-size: 0.9rem;
    }
    
    .reading-time i {
        margin-right: var(--spacing-xs);
    }
    
    /* Table of contents toggle */
    .toc-toggle {
        display: none;
        background: var(--accent-teal);
        color: white;
        border: none;
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        margin-bottom: var(--spacing-md);
    }
    
    /* Copy notification */
    .copy-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--accent-teal);
        color: white;
        padding: 10px 20px;
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-md);
        z-index: 1000;
        animation: fadeInUp 0.3s ease;
    }
    
    .copy-notification.error {
        background-color: #ff4747;
    }
    
    .copy-notification.hide {
        animation: fadeOutDown 0.3s ease forwards;
    }
    
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOutDown {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
    }
    
    /* Mobile navigation styles */
    .mobile-nav-toggle {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: var(--spacing-sm);
        margin-right: var(--spacing-md);
    }
    
    .hamburger-icon {
        display: block;
        width: 24px;
        height: 3px;
        background-color: var(--primary-navy);
        position: relative;
        transition: background-color 0.3s;
    }
    
    .hamburger-icon:before,
    .hamburger-icon:after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: var(--primary-navy);
        transition: transform 0.3s;
    }
    
    .hamburger-icon:before {
        transform: translateY(-8px);
    }
    
    .hamburger-icon:after {
        transform: translateY(8px);
    }
    
    [data-theme="dark"] .hamburger-icon,
    [data-theme="dark"] .hamburger-icon:before,
    [data-theme="dark"] .hamburger-icon:after {
        background-color: var(--white);
    }
    
    .mobile-nav-toggle[aria-expanded="true"] .hamburger-icon {
        background-color: transparent;
    }
    
    .mobile-nav-toggle[aria-expanded="true"] .hamburger-icon:before {
        transform: rotate(45deg);
    }
    
    .mobile-nav-toggle[aria-expanded="true"] .hamburger-icon:after {
        transform: rotate(-45deg);
    }
    
    /* Print policy button */
    .print-policy {
        display: block;
        margin: var(--spacing-xl) auto var(--spacing-md);
        background-color: var(--accent-teal);
        color: white;
        border: none;
        border-radius: var(--border-radius-sm);
        padding: var(--spacing-sm) var(--spacing-lg);
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }
    
    .print-policy:hover, .print-policy:focus {
        background-color: var(--primary-navy);
    }
    
    .print-policy i {
        margin-right: var(--spacing-xs);
    }
    
    /* Keyboard navigation */
    .keyboard-user *:focus {
        outline: 2px solid var(--accent-teal);
        outline-offset: 2px;
    }
    
    /* Responsive styles */
    @media (max-width: 768px) {
        .mobile-nav-toggle {
            display: block;
        }
        
        .main-navigation ul {
            display: none;
        }
        
        .main-navigation ul.nav-visible {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: var(--background-primary);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 100;
            padding: var(--spacing-md);
        }
        
        .toc-toggle {
            display: block;
        }
        
        .toc-list:not(.toc-expanded) {
            display: none;
        }
    }
`;

// Add the styles to the document
document.head.appendChild(dynamicStyles);
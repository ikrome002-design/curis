/**
 * Curis Data Policy JavaScript
 * This script handles the functionality for the Curis Data Policy page including:
 * - Dark mode toggle and persistence
 * - Navigation enhancement with smooth scrolling
 * - Table of contents generation
 * - Interactive section navigation
 * - Mobile responsiveness
 * - Scroll tracking for active section highlighting
 */

document.addEventListener('DOMContentLoaded', function () {
    // ===== ELEMENT REFERENCES =====
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const darkModeIcon = document.querySelector('.dark-mode-icon');
    const mainSections = document.querySelectorAll('main > section');
    const subsections = document.querySelectorAll('.subsection');
    const nestedSubsections = document.querySelectorAll('.nested-subsection');
    const deepNestedSubsections = document.querySelectorAll('.deep-nested-subsection');

    // ===== INITIALIZATION =====
    initDarkMode();
    createTableOfContents();
    enableSmoothScrolling();
    setupScrollSpy();
    createBackToTopButton();

    // ===== DARK MODE FUNCTIONALITY =====

    /**
     * Initializes dark mode based on user preference or system settings
     */
    function initDarkMode() {
        // Check for saved dark mode preference
        const savedDarkMode = localStorage.getItem('darkMode');

        // If preference exists, apply it
        if (savedDarkMode === 'enabled') {
            document.body.classList.add('dark-mode');
            updateDarkModeIcon(true);
        } else if (savedDarkMode === null) {
            // If no preference, check system preference
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDarkMode) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
                updateDarkModeIcon(true);
            }
        }

        // Add event listener for dark mode toggle
        darkModeBtn.addEventListener('click', toggleDarkMode);
    }

    /**
     * Toggles dark mode and saves preference
     */
    function toggleDarkMode() {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            updateDarkModeIcon(false);
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            updateDarkModeIcon(true);
        }
    }

    /**
     * Updates the dark mode icon based on current state
     * @param {boolean} isDarkMode - Whether dark mode is active
     */
    function updateDarkModeIcon(isDarkMode) {
        // For SVG-based icons, we can change the entire background image
        // If using icon fonts, we would change classes instead
        // In this implementation, the CSS handles the icon change via the dark-mode class
    }

    // ===== TABLE OF CONTENTS FUNCTIONALITY =====

    /**
     * Creates a floating table of contents for easy navigation
     */
    function createTableOfContents() {
        // Create the TOC container
        const tocContainer = document.createElement('div');
        tocContainer.className = 'toc-container';
        tocContainer.innerHTML = `
            <div class="toc-header">
                <h3>Policy Contents</h3>
                <button class="toc-toggle" aria-label="Toggle table of contents">
                    <span class="toc-toggle-icon"></span>
                </button>
            </div>
            <div class="toc-body">
                <ul class="toc-list"></ul>
            </div>
        `;

        // Add TOC container to the document
        document.querySelector('main').prepend(tocContainer);

        // Get reference to the TOC list
        const tocList = document.querySelector('.toc-list');

        // Add main sections to TOC
        mainSections.forEach((section, index) => {
            // Skip the hero section for the TOC
            if (section.id === 'data-policy-hero') return;

            const sectionTitle = section.querySelector('h2').textContent;
            const sectionId = section.id;

            const tocItem = document.createElement('li');
            tocItem.className = 'toc-item';
            tocItem.innerHTML = `<a href="#${sectionId}" data-section-id="${sectionId}">${sectionTitle}</a>`;

            // If the section has subsections, create a nested list
            const sectionSubsections = section.querySelectorAll('.subsection');
            if (sectionSubsections.length > 0) {
                const subList = document.createElement('ul');
                subList.className = 'toc-sublist';

                sectionSubsections.forEach((subsection) => {
                    const subsectionTitle = subsection.querySelector('h3').textContent;
                    const subsectionId = subsection.id;

                    const subItem = document.createElement('li');
                    subItem.className = 'toc-subitem';
                    subItem.innerHTML = `<a href="#${subsectionId}" data-section-id="${subsectionId}">${subsectionTitle}</a>`;

                    subList.appendChild(subItem);
                });

                tocItem.appendChild(subList);
            }

            tocList.appendChild(tocItem);
        });

        // Add toggle functionality for TOC
        const tocToggle = document.querySelector('.toc-toggle');
        tocToggle.addEventListener('click', function () {
            tocContainer.classList.toggle('toc-collapsed');

            // Save TOC state to session storage
            const isCollapsed = tocContainer.classList.contains('toc-collapsed');
            sessionStorage.setItem('tocCollapsed', isCollapsed ? 'true' : 'false');
        });

        // Check for saved TOC state
        if (sessionStorage.getItem('tocCollapsed') === 'true') {
            tocContainer.classList.add('toc-collapsed');
        }

        // Add TOC styles if they don't exist
        if (!document.getElementById('toc-styles')) {
            const tocStyles = document.createElement('style');
            tocStyles.id = 'toc-styles';
            tocStyles.textContent = `
                .toc-container {
                    position: fixed;
                    top: 120px;
                    right: 20px;
                    width: 280px;
                    background-color: var(--bg-primary);
                    border-radius: var(--border-radius-md);
                    box-shadow: var(--shadow-md);
                    z-index: 100;
                    transition: transform var(--transition-medium);
                    max-height: calc(100vh - 180px);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .toc-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-md);
                    border-bottom: 1px solid var(--light-gray);
                }
                
                .toc-header h3 {
                    margin: 0;
                    font-size: var(--font-size-md);
                }
                
                .toc-toggle {
                    background: none;
                    border: none;
                    cursor: pointer;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color var(--transition-quick);
                }
                
                .toc-toggle:hover {
                    background-color: var(--light-gray);
                }
                
                .toc-toggle-icon {
                    width: 12px;
                    height: 12px;
                    border-right: 2px solid var(--text-primary);
                    border-bottom: 2px solid var(--text-primary);
                    transform: rotate(-45deg);
                    transition: transform var(--transition-quick);
                }
                
                .toc-collapsed .toc-toggle-icon {
                    transform: rotate(45deg);
                }
                
                .toc-collapsed .toc-body {
                    display: none;
                }
                
                .toc-body {
                    padding: var(--spacing-md);
                    overflow-y: auto;
                }
                
                .toc-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }
                
                .toc-item {
                    margin-bottom: var(--spacing-sm);
                }
                
                .toc-item > a {
                    font-weight: 600;
                    color: var(--primary-color);
                    display: block;
                    padding: var(--spacing-xs) 0;
                }
                
                .toc-item > a:hover {
                    color: var(--accent-color);
                }
                
                .toc-item > a.active {
                    color: var(--accent-color);
                }
                
                .toc-sublist {
                    list-style: none;
                    margin: 0 0 0 var(--spacing-md);
                    padding: 0;
                }
                
                .toc-subitem {
                    margin-bottom: var(--spacing-xs);
                }
                
                .toc-subitem > a {
                    font-size: var(--font-size-sm);
                    color: var(--text-primary);
                    display: block;
                    padding: var(--spacing-xs) 0;
                }
                
                .toc-subitem > a:hover {
                    color: var(--accent-color);
                }
                
                .toc-subitem > a.active {
                    color: var(--accent-color);
                }
                
                @media (max-width: 992px) {
                    .toc-container {
                        top: auto;
                        bottom: 20px;
                        right: 20px;
                        width: 240px;
                        max-height: 400px;
                    }
                }
                
                @media (max-width: 768px) {
                    .toc-container {
                        bottom: 20px;
                        right: 20px;
                        width: 220px;
                        max-height: 300px;
                    }
                }
                
                @media (max-width: 576px) {
                    .toc-container {
                        width: calc(100% - 40px);
                        left: 20px;
                        right: 20px;
                        max-height: 250px;
                    }
                }
            `;
            document.head.appendChild(tocStyles);
        }
    }

    // ===== SMOOTH SCROLLING FUNCTIONALITY =====

    /**
     * Enables smooth scrolling to sections when clicking on links
     */
    function enableSmoothScrolling() {
        // Get all links that point to a section
        const sectionLinks = document.querySelectorAll('a[href^="#"]');

        // Add click event listener to each link
        sectionLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();

                // Get the target section
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    // Calculate offset based on fixed header height
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                    // Scroll to target section smoothly
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL hash without triggering scroll
                    history.pushState(null, null, `#${targetId}`);

                    // Update active link in TOC
                    updateActiveTocLink(targetId);
                }
            });
        });
    }

    /**
     * Updates the active link in the table of contents
     * @param {string} targetId - The ID of the active section
     */
    function updateActiveTocLink(targetId) {
        // Remove active class from all links
        document.querySelectorAll('.toc-list a').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to the link for the current section
        const activeLink = document.querySelector(`.toc-list a[data-section-id="${targetId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // ===== SCROLL SPY FUNCTIONALITY =====

    /**
     * Sets up scroll spy to highlight current section in TOC
     */
    function setupScrollSpy() {
        // Create an IntersectionObserver to watch sections
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3 // Section is considered visible when 30% is in view
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateActiveTocLink(entry.target.id);
                }
            });
        }, options);

        // Observe all sections and subsections
        document.querySelectorAll('section').forEach(section => {
            if (section.id) {
                observer.observe(section);
            }
        });

        document.querySelectorAll('.subsection').forEach(subsection => {
            if (subsection.id) {
                observer.observe(subsection);
            }
        });
    }

    // ===== BACK TO TOP FUNCTIONALITY =====

    /**
     * Creates a back to top button
     */
    function createBackToTopButton() {
        // Create the button
        const backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.setAttribute('aria-label', 'Back to top');
        backToTopBtn.innerHTML = `<span class="back-to-top-icon"></span>`;

        // Add the button to the document
        document.body.appendChild(backToTopBtn);

        // Show/hide the button based on scroll position
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // Add click event listener
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Add button styles if they don't exist
        if (!document.getElementById('back-to-top-styles')) {
            const btnStyles = document.createElement('style');
            btnStyles.id = 'back-to-top-styles';
            btnStyles.textContent = `
                .back-to-top {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: var(--primary-color);
                    color: var(--white);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 100;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity var(--transition-medium), visibility var(--transition-medium);
                    border: none;
                    box-shadow: var(--shadow-md);
                }
                
                .back-to-top.visible {
                    opacity: 1;
                    visibility: visible;
                }
                
                .back-to-top:hover {
                    background-color: var(--accent-color);
                }
                
                .back-to-top-icon {
                    width: 10px;
                    height: 10px;
                    border-left: 2px solid var(--white);
                    border-top: 2px solid var(--white);
                    transform: rotate(45deg);
                    margin-top: 4px;
                }
            `;
            document.head.appendChild(btnStyles);
        }
    }

    // ===== SECTION EXPANSION FUNCTIONALITY =====

    /**
     * Adds expandable/collapsible functionality to nested sections for mobile view
     */
    function initMobileCollapsibleSections() {
        // Only apply on mobile viewport
        if (window.innerWidth <= 768) {
            // Add collapsible functionality to subsections
            subsections.forEach(subsection => {
                const heading = subsection.querySelector('h3');
                const content = document.createElement('div');

                // Move all content after the heading into the content div
                let nextElement = heading.nextElementSibling;
                while (nextElement) {
                    const temp = nextElement.nextElementSibling;
                    content.appendChild(nextElement);
                    nextElement = temp;
                }

                content.className = 'collapsible-content';
                subsection.appendChild(content);

                // Add toggle icon to heading
                const toggleIcon = document.createElement('span');
                toggleIcon.className = 'toggle-icon';
                heading.appendChild(toggleIcon);

                // Add click event to heading
                heading.classList.add('collapsible-heading');
                heading.addEventListener('click', function () {
                    this.classList.toggle('expanded');
                    const contentEl = this.parentElement.querySelector('.collapsible-content');
                    if (contentEl.style.maxHeight) {
                        contentEl.style.maxHeight = null;
                    } else {
                        contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
                    }
                });
            });

            // Add collapsible styles
            if (!document.getElementById('collapsible-styles')) {
                const collapsibleStyles = document.createElement('style');
                collapsibleStyles.id = 'collapsible-styles';
                collapsibleStyles.textContent = `
                    .collapsible-heading {
                        cursor: pointer;
                        position: relative;
                        padding-right: 30px;
                    }
                    
                    .toggle-icon {
                        position: absolute;
                        right: 0;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 16px;
                        height: 16px;
                    }
                    
                    .toggle-icon:before,
                    .toggle-icon:after {
                        content: '';
                        position: absolute;
                        background-color: var(--accent-color);
                        transition: transform var(--transition-quick);
                    }
                    
                    .toggle-icon:before {
                        width: 16px;
                        height: 2px;
                        top: 7px;
                        left: 0;
                    }
                    
                    .toggle-icon:after {
                        width: 2px;
                        height: 16px;
                        top: 0;
                        left: 7px;
                    }
                    
                    .collapsible-heading.expanded .toggle-icon:after {
                        transform: rotate(90deg);
                    }
                    
                    .collapsible-content {
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height var(--transition-medium);
                    }
                `;
                document.head.appendChild(collapsibleStyles);
            }
        }
    }

    // Call mobile section initialization on window resize
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            // Reinitialize mobile sections if needed
            if (window.innerWidth <= 768 && !document.querySelector('.collapsible-heading')) {
                initMobileCollapsibleSections();
            }
        }, 250);
    });

    // Check for mobile view on initial load
    if (window.innerWidth <= 768) {
        initMobileCollapsibleSections();
    }

    // ===== SECTION HIGHLIGHTING =====

    /**
     * Adds visual highlighting to sections when they're hovered or activated
     */
    function setupSectionHighlighting() {
        // Add hover effect for all sections
        const allSections = [...document.querySelectorAll('.subsection'),
        ...document.querySelectorAll('.nested-subsection'),
        ...document.querySelectorAll('.deep-nested-subsection')];

        allSections.forEach(section => {
            section.addEventListener('mouseenter', function () {
                this.classList.add('section-hover');
            });

            section.addEventListener('mouseleave', function () {
                this.classList.remove('section-hover');
            });
        });

        // Add section highlighting styles
        if (!document.getElementById('section-highlight-styles')) {
            const highlightStyles = document.createElement('style');
            highlightStyles.id = 'section-highlight-styles';
            highlightStyles.textContent = `
                .section-hover {
                    box-shadow: var(--shadow-md);
                    transition: box-shadow var(--transition-quick);
                }
            `;
            document.head.appendChild(highlightStyles);
        }
    }

    // Initialize section highlighting
    setupSectionHighlighting();

    // ===== HASH NAVIGATION =====

    /**
     * Handles initial hash navigation when page loads
     */
    function handleInitialHash() {
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Wait for page to fully load before scrolling
                setTimeout(() => {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update active TOC link
                    updateActiveTocLink(targetId);
                }, 300);
            }
        }
    }

    // Handle initial hash navigation
    handleInitialHash();

    // ===== UTILITY FUNCTIONS =====

    /**
     * Adds copy link functionality to section headings
     */
    function addCopyLinkFeature() {
        // Get all headings in sections
        const headings = document.querySelectorAll('section h2, .subsection h3');

        headings.forEach(heading => {
            if (heading.parentNode.id) {
                // Create copy link button
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-link-btn';
                copyButton.setAttribute('aria-label', 'Copy link to section');
                copyButton.innerHTML = `<span class="copy-icon"></span>`;

                // Add button to heading
                heading.appendChild(copyButton);

                // Add click event
                copyButton.addEventListener('click', function (e) {
                    e.stopPropagation(); // Prevent click from propagating to parent elements

                    const sectionId = heading.parentNode.id;
                    const fullUrl = `${window.location.origin}${window.location.pathname}#${sectionId}`;

                    // Copy to clipboard
                    navigator.clipboard.writeText(fullUrl).then(() => {
                        // Show temporary success message
                        const notification = document.createElement('div');
                        notification.className = 'copy-notification';
                        notification.textContent = 'Link copied to clipboard!';
                        document.body.appendChild(notification);

                        // Remove notification after 2 seconds
                        setTimeout(() => {
                            notification.classList.add('fade-out');
                            setTimeout(() => {
                                document.body.removeChild(notification);
                            }, 300);
                        }, 2000);
                    });
                });
            }
        });

        // Add copy link styles
        if (!document.getElementById('copy-link-styles')) {
            const copyStyles = document.createElement('style');
            copyStyles.id = 'copy-link-styles';
            copyStyles.textContent = `
                .copy-link-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    opacity: 0;
                    margin-left: var(--spacing-sm);
                    vertical-align: middle;
                    transition: opacity var(--transition-quick);
                }
                
                h2:hover .copy-link-btn,
                h3:hover .copy-link-btn {
                    opacity: 0.5;
                }
                
                .copy-link-btn:hover {
                    opacity: 1 !important;
                }
                
                .copy-icon {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                }
                
                .copy-notification {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: var(--primary-color);
                    color: var(--white);
                    padding: var(--spacing-sm) var(--spacing-md);
                    border-radius: var(--border-radius-md);
                    z-index: 1000;
                    box-shadow: var(--shadow-md);
                    transition: opacity var(--transition-quick);
                }
                
                .copy-notification.fade-out {
                    opacity: 0;
                }
            `;
            document.head.appendChild(copyStyles);
        }
    }

    // Add copy link feature
    addCopyLinkFeature();

    /**
     * Initialize animations for page elements
     */
    function initializeAnimations() {
        // Add a class to animate elements as they come into view
        const elementsToAnimate = [
            ...document.querySelectorAll('section > .container > h2'),
            ...document.querySelectorAll('.subsection'),
            ...document.querySelectorAll('.contact-details'),
            ...document.querySelectorAll('.final-cta')
        ];

        // Create IntersectionObserver to detect when elements enter viewport
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // Stop observing after animation is triggered
                    animationObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Observe all elements
        elementsToAnimate.forEach(element => {
            // Add animation-ready class
            element.classList.add('animation-ready');
            // Observe element
            animationObserver.observe(element);
        });

        // Add animation styles
        if (!document.getElementById('animation-styles')) {
            const animationStyles = document.createElement('style');
            animationStyles.id = 'animation-styles';
            animationStyles.textContent = `
                .animation-ready {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                }
                
                .animate-in {
                    opacity: 1;
                    transform: translateY(0);
                }
            `;
            document.head.appendChild(animationStyles);
        }
    }

    // Initialize animations
    initializeAnimations();
});
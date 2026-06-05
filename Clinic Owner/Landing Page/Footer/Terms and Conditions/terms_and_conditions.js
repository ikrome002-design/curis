/**
 * Curis Terms and Conditions JavaScript
 * This script handles the functionality for the Curis Terms and Conditions page including:
 * - Dark mode toggle and persistence
 * - Navigation enhancement with smooth scrolling
 * - Table of contents generation
 * - Interactive section navigation
 * - Mobile-friendly section collapsing
 * - Scroll tracking for active section highlighting
 * - Section link copying
 * - Print optimization
 */

document.addEventListener('DOMContentLoaded', function () {
    // ===== ELEMENT REFERENCES =====
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const darkModeIcon = document.querySelector('.dark-mode-icon');
    const mainSections = document.querySelectorAll('main > section');
    const subsections = document.querySelectorAll('.subsection');
    const nestedSubsections = document.querySelectorAll('.nested-subsection');

    // ===== INITIALIZATION =====
    initDarkMode();
    createTableOfContents();
    enableSmoothScrolling();
    setupScrollSpy();
    createBackToTopButton();
    addCopyLinkFeature();
    initializeAnimations();
    addPrintStyles();

    // For mobile devices, initialize collapsible sections
    if (window.innerWidth <= 768) {
        initMobileCollapsibleSections();
    }

    // Handle initial hash navigation
    handleInitialHash();

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
        // The CSS handles the icon change via the dark-mode class
    }

    // ===== TABLE OF CONTENTS FUNCTIONALITY =====

    /**
     * Creates a floating table of contents for easy navigation
     */
    function createTableOfContents() {
        // Create the TOC container
        const tocContainer = document.createElement('div');
        tocContainer.className = 'toc-container';
        tocContainer.setAttribute('aria-label', 'Table of contents');
        tocContainer.innerHTML = `
            <div class="toc-header">
                <h3>Terms & Conditions Contents</h3>
                <button class="toc-toggle" aria-label="Toggle table of contents visibility">
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
        mainSections.forEach((section) => {
            // Skip the hero section for the TOC
            if (section.id === 'terms-hero') return;

            const sectionHeading = section.querySelector('h2');
            if (!sectionHeading) return;

            const sectionTitle = sectionHeading.textContent;
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
                    const subsectionHeading = subsection.querySelector('h3');
                    if (!subsectionHeading) return;

                    const subsectionTitle = subsectionHeading.textContent;
                    const subsectionId = subsection.id;

                    if (subsectionId) {
                        const subItem = document.createElement('li');
                        subItem.className = 'toc-subitem';
                        subItem.innerHTML = `<a href="#${subsectionId}" data-section-id="${subsectionId}">${subsectionTitle}</a>`;

                        // If this subsection has nested subsections, add them too
                        const nestedSubs = subsection.querySelectorAll('.nested-subsection');
                        if (nestedSubs.length > 0 && window.innerWidth > 768) { // Only show nested items on larger screens
                            const nestedList = document.createElement('ul');
                            nestedList.className = 'toc-nested-sublist';

                            nestedSubs.forEach(nestedSub => {
                                const nestedHeading = nestedSub.querySelector('h4');
                                if (!nestedHeading) return;

                                const nestedTitle = nestedHeading.textContent;
                                const nestedId = nestedSub.id;

                                if (nestedId) {
                                    const nestedItem = document.createElement('li');
                                    nestedItem.className = 'toc-nested-item';
                                    nestedItem.innerHTML = `<a href="#${nestedId}" data-section-id="${nestedId}">${nestedTitle}</a>`;

                                    nestedList.appendChild(nestedItem);
                                }
                            });

                            if (nestedList.children.length > 0) {
                                subItem.appendChild(nestedList);
                            }
                        }

                        subList.appendChild(subItem);
                    }
                });

                if (subList.children.length > 0) {
                    tocItem.appendChild(subList);
                }
            }

            tocList.appendChild(tocItem);
        });

        // Add toggle functionality for TOC
        const tocToggle = document.querySelector('.toc-toggle');
        tocToggle.addEventListener('click', function () {
            tocContainer.classList.toggle('toc-collapsed');

            // Update aria-expanded attribute
            const isCollapsed = tocContainer.classList.contains('toc-collapsed');
            this.setAttribute('aria-expanded', !isCollapsed);

            // Save TOC state to session storage
            sessionStorage.setItem('tocCollapsed', isCollapsed ? 'true' : 'false');
        });

        // Check for saved TOC state
        if (sessionStorage.getItem('tocCollapsed') === 'true') {
            tocContainer.classList.add('toc-collapsed');
            tocToggle.setAttribute('aria-expanded', 'false');
        } else {
            tocToggle.setAttribute('aria-expanded', 'true');
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
                    transition: transform var(--transition-medium), opacity var(--transition-medium);
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
                    background-color: var(--primary-color);
                    color: var(--white);
                }
                
                .toc-header h3 {
                    margin: 0;
                    font-size: var(--font-size-md);
                    color: var(--white);
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
                    color: var(--white);
                }
                
                .toc-toggle:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }
                
                .toc-toggle-icon {
                    width: 12px;
                    height: 12px;
                    border-right: 2px solid var(--white);
                    border-bottom: 2px solid var(--white);
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
                    transition: color var(--transition-quick);
                    text-decoration: none;
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
                    transition: color var(--transition-quick);
                    text-decoration: none;
                }
                
                .toc-subitem > a:hover {
                    color: var(--accent-color);
                }
                
                .toc-subitem > a.active {
                    color: var(--accent-color);
                }
                
                .toc-nested-sublist {
                    list-style: none;
                    margin: 0 0 0 var(--spacing-md);
                    padding: 0;
                    font-size: 0.9em;
                }
                
                .toc-nested-item {
                    margin-bottom: calc(var(--spacing-xs) / 2);
                }
                
                .toc-nested-item > a {
                    color: var(--text-primary);
                    opacity: 0.8;
                    display: block;
                    padding: calc(var(--spacing-xs) / 2) 0;
                    transition: all var(--transition-quick);
                    text-decoration: none;
                }
                
                .toc-nested-item > a:hover {
                    color: var(--accent-color);
                    opacity: 1;
                }
                
                .toc-nested-item > a.active {
                    color: var(--accent-color);
                    opacity: 1;
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
                
                /* Fix for dark mode */
                .dark-mode .toc-container {
                    background-color: var(--primary-color);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .dark-mode .toc-header {
                    border-bottom-color: rgba(255, 255, 255, 0.1);
                }
                
                .dark-mode .toc-item > a {
                    color: var(--white);
                }
                
                .dark-mode .toc-subitem > a,
                .dark-mode .toc-nested-item > a {
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .dark-mode .toc-item > a.active,
                .dark-mode .toc-subitem > a.active,
                .dark-mode .toc-nested-item > a.active,
                .dark-mode .toc-item > a:hover,
                .dark-mode .toc-subitem > a:hover,
                .dark-mode .toc-nested-item > a:hover {
                    color: var(--accent-color);
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
                // Get the target ID from the href attribute
                const targetId = this.getAttribute('href').substring(1);

                // If the ID is empty, it's a top of page link
                if (!targetId) return;

                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    e.preventDefault();

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

                    // If on mobile, expand the section
                    if (window.innerWidth <= 768) {
                        const heading = targetSection.querySelector('.collapsible-heading');
                        if (heading && !heading.classList.contains('expanded')) {
                            heading.click();
                        }
                    }
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

            // Expand parent lists if necessary (for mobile)
            let parent = activeLink.parentElement;
            while (parent) {
                if (parent.classList.contains('toc-subitem') || parent.classList.contains('toc-item')) {
                    const parentLink = parent.querySelector(':scope > a');
                    if (parentLink) {
                        parentLink.classList.add('active');
                    }
                }
                parent = parent.parentElement;
            }

            // Ensure the active item is visible in the scrollable container
            const tocBody = document.querySelector('.toc-body');
            if (tocBody) {
                const linkRect = activeLink.getBoundingClientRect();
                const tocRect = tocBody.getBoundingClientRect();

                if (linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom) {
                    activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
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
            threshold: 0.2 // Section is considered visible when 20% is in view
        };

        const observer = new IntersectionObserver((entries) => {
            // Sort entries by their position on the page (top to bottom)
            entries.sort((a, b) => {
                return a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top;
            });

            // Find the first visible entry
            const visibleEntry = entries.find(entry => entry.isIntersecting);

            if (visibleEntry) {
                updateActiveTocLink(visibleEntry.target.id);
            }
        }, options);

        // Observe all sections and subsections with IDs
        document.querySelectorAll('section[id], .subsection[id], .nested-subsection[id]').forEach(section => {
            observer.observe(section);
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
            // Scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Move focus to the top of the page
            document.querySelector('h1').focus();
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
                    background-color: var(--accent-color);
                    color: var(--white);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 100;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity var(--transition-medium), visibility var(--transition-medium), background-color var(--transition-quick);
                    border: none;
                    box-shadow: var(--shadow-md);
                }
                
                .back-to-top.visible {
                    opacity: 1;
                    visibility: visible;
                }
                
                .back-to-top:hover {
                    background-color: var(--secondary-color);
                }
                
                .back-to-top-icon {
                    width: 10px;
                    height: 10px;
                    border-left: 2px solid var(--white);
                    border-top: 2px solid var(--white);
                    transform: rotate(45deg);
                    margin-top: 4px;
                }
                
                @media (max-width: 768px) {
                    .back-to-top {
                        bottom: 80px; /* Avoid overlap with TOC on mobile */
                    }
                }
            `;
            document.head.appendChild(btnStyles);
        }
    }

    // ===== MOBILE COLLAPSIBLE SECTIONS =====

    /**
     * Adds expandable/collapsible functionality to sections for mobile view
     */
    function initMobileCollapsibleSections() {
        // Add collapsible functionality to subsections
        subsections.forEach(subsection => {
            const heading = subsection.querySelector('h3');
            if (!heading) return;

            // Don't apply to contact details subsections
            if (subsection.closest('.contact-details')) return;

            const content = document.createElement('div');
            content.className = 'collapsible-content';

            // Move all content after the heading into the content div
            let nextElement = heading.nextElementSibling;
            while (nextElement) {
                const temp = nextElement.nextElementSibling;
                content.appendChild(nextElement);
                nextElement = temp;
            }

            subsection.appendChild(content);

            // Add toggle icon to heading
            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'toggle-icon';
            toggleIcon.setAttribute('aria-hidden', 'true');
            heading.appendChild(toggleIcon);

            // Add click event to heading
            heading.classList.add('collapsible-heading');
            heading.setAttribute('tabindex', '0');
            heading.setAttribute('role', 'button');
            heading.setAttribute('aria-expanded', 'false');
            heading.setAttribute('aria-controls', `content-${subsection.id}`);
            content.id = `content-${subsection.id}`;

            heading.addEventListener('click', toggleSection);
            heading.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSection.call(this);
                }
            });

            function toggleSection() {
                this.classList.toggle('expanded');
                const isExpanded = this.classList.contains('expanded');
                this.setAttribute('aria-expanded', isExpanded);
                const contentEl = this.parentElement.querySelector('.collapsible-content');

                if (isExpanded) {
                    contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
                } else {
                    contentEl.style.maxHeight = null;
                }
            }
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
                    user-select: none;
                }
                
                .collapsible-heading:focus {
                    outline: 2px solid var(--accent-color);
                    outline-offset: 2px;
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
                    transition: max-height 0.4s ease-out;
                }
                
                /* Dark mode styles */
                .dark-mode .toggle-icon:before,
                .dark-mode .toggle-icon:after {
                    background-color: var(--accent-color);
                }
            `;
            document.head.appendChild(collapsibleStyles);
        }
    }

    // ===== SECTION HIGHLIGHTING =====

    /**
     * Adds visual highlighting to sections when they're hovered or focused
     */
    function setupSectionHighlighting() {
        // Add hover effect for all sections
        const allSections = [...document.querySelectorAll('.subsection'),
        ...document.querySelectorAll('.nested-subsection')];

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
                
                .subsection:target,
                .nested-subsection:target {
                    animation: highlight-pulse 2s ease-out;
                }
                
                @keyframes highlight-pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(0, 191, 165, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(0, 191, 165, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(0, 191, 165, 0);
                    }
                }
            `;
            document.head.appendChild(highlightStyles);
        }
    }

    // Initialize section highlighting
    setupSectionHighlighting();

    // ===== COPY LINK FEATURE =====

    /**
     * Adds copy link functionality to section headings
     */
    function addCopyLinkFeature() {
        // Get all headings in sections with IDs
        const headings = document.querySelectorAll('section h2, .subsection h3');

        headings.forEach(heading => {
            const parentSection = heading.closest('section, .subsection');
            if (parentSection && parentSection.id) {
                // Create copy link button
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-link-btn';
                copyButton.setAttribute('aria-label', 'Copy link to section');
                copyButton.innerHTML = `<span class="copy-icon"></span>`;

                // Add button to heading
                heading.appendChild(copyButton);

                // Add click event
                copyButton.addEventListener('click', function (e) {
                    e.stopPropagation(); // Prevent click from bubbling to collapsible headings

                    const sectionId = parentSection.id;
                    const fullUrl = `${window.location.origin}${window.location.pathname}#${sectionId}`;

                    // Copy to clipboard
                    navigator.clipboard.writeText(fullUrl).then(() => {
                        // Show temporary success message
                        const notification = document.createElement('div');
                        notification.className = 'copy-notification';
                        notification.textContent = 'Link copied to clipboard!';
                        notification.setAttribute('role', 'alert');
                        document.body.appendChild(notification);

                        // Remove notification after 2 seconds
                        setTimeout(() => {
                            notification.classList.add('fade-out');
                            setTimeout(() => {
                                notification.remove();
                            }, 300);
                        }, 2000);
                    }).catch(() => {
                        // Show error message if copy failed
                        const notification = document.createElement('div');
                        notification.className = 'copy-notification error';
                        notification.textContent = 'Could not copy link. Please try again.';
                        notification.setAttribute('role', 'alert');
                        document.body.appendChild(notification);

                        setTimeout(() => {
                            notification.classList.add('fade-out');
                            setTimeout(() => {
                                notification.remove();
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
                    width: 24px;
                    height: 24px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                
                h2:hover .copy-link-btn,
                h3:hover .copy-link-btn,
                .copy-link-btn:focus {
                    opacity: 0.7;
                }
                
                .copy-link-btn:hover {
                    opacity: 1 !important;
                }
                
                .copy-link-btn:focus {
                    outline: 2px solid var(--accent-color);
                    outline-offset: 2px;
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
                
                .copy-notification.error {
                    background-color: var(--secondary-color);
                }
                
                .copy-notification.fade-out {
                    opacity: 0;
                }
            `;
            document.head.appendChild(copyStyles);
        }
    }

    // ===== ANIMATIONS =====

    /**
     * Initialize animations for page elements
     */
    function initializeAnimations() {
        // Add a class to animate elements as they come into view
        const elementsToAnimate = [
            ...document.querySelectorAll('section > .container > h2'),
            ...document.querySelectorAll('.subsection'),
            ...document.querySelectorAll('.contact-details'),
            ...document.querySelectorAll('.final-statement')
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
                
                /* Respect reduced motion preference */
                @media (prefers-reduced-motion: reduce) {
                    .animation-ready {
                        opacity: 1;
                        transform: none;
                        transition: none;
                    }
                }
            `;
            document.head.appendChild(animationStyles);
        }
    }

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

                    // If on mobile, expand the section
                    if (window.innerWidth <= 768) {
                        const heading = targetElement.querySelector('.collapsible-heading');
                        if (heading && !heading.classList.contains('expanded')) {
                            heading.click();
                        }

                        // If it's a nested section, ensure parent is expanded too
                        if (targetElement.classList.contains('nested-subsection')) {
                            const parentSubsection = targetElement.closest('.subsection');
                            if (parentSubsection) {
                                const parentHeading = parentSubsection.querySelector('.collapsible-heading');
                                if (parentHeading && !parentHeading.classList.contains('expanded')) {
                                    parentHeading.click();
                                }
                            }
                        }
                    }

                    // Add focus to the element for accessibility
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                    targetElement.addEventListener('blur', function onBlur() {
                        targetElement.removeAttribute('tabindex');
                        targetElement.removeEventListener('blur', onBlur);
                    });
                }, 300);
            }
        }
    }

    // ===== WINDOW RESIZE HANDLER =====

    /**
     * Handle responsive adjustments on window resize
     */
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            // Reinitialize mobile sections if needed
            if (window.innerWidth <= 768 && !document.querySelector('.collapsible-heading')) {
                initMobileCollapsibleSections();
            }

            // Update any open collapsible content sections to ensure proper height
            const expandedHeadings = document.querySelectorAll('.collapsible-heading.expanded');
            expandedHeadings.forEach(heading => {
                const content = heading.nextElementSibling;
                if (content && content.classList.contains('collapsible-content')) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        }, 250);
    });

    // ===== PRINT STYLES =====

    /**
     * Add print-specific styles for better printed output
     */
    function addPrintStyles() {
        if (!document.getElementById('print-styles')) {
            const printStyles = document.createElement('style');
            printStyles.id = 'print-styles';
            printStyles.textContent = `
                @media print {
                    .toc-container, 
                    .back-to-top, 
                    .copy-link-btn,
                    header .cta-button,
                    footer {
                        display: none !important;
                    }
                    
                    body {
                        background: white;
                        color: black;
                        font-size: 12pt;
                    }
                    
                    main {
                        padding: 0;
                    }
                    
                    .collapsible-content {
                        max-height: none !important;
                        overflow: visible !important;
                    }
                    
                    .toggle-icon {
                        display: none;
                    }
                    
                    section, .subsection, .nested-subsection {
                        break-inside: avoid;
                        page-break-inside: avoid;
                        background-color: transparent !important;
                    }
                    
                    h1, h2, h3, h4 {
                        break-after: avoid;
                        page-break-after: avoid;
                        color: black !important;
                    }
                    
                    a {
                        text-decoration: underline;
                        color: black;
                    }
                    
                    #terms-hero {
                        background-color: white;
                        color: black;
                        padding: 0;
                        margin-bottom: 1cm;
                    }
                    
                    #terms-hero h1 {
                        color: black;
                    }
                    
                    /* Add page breaks before major sections */
                    #introduction, #definitions, #account-terms, #service-terms, 
                    #billing-terms, #user-responsibilities, #limitations, 
                    #intellectual-property, #termination-rights, 
                    #dispute-resolution, #change-terms, #contact {
                        page-break-before: always;
                    }
                    
                    /* Print URLs for external links */
                    a[href^="http"]:after {
                        content: " (" attr(href) ")";
                        font-size: 90%;
                        font-style: italic;
                    }
                    
                    /* Don't print URLs for internal links */
                    a[href^="#"]:after {
                        content: "";
                    }
                    
                    /* Make sure print is optimized */
                    @page {
                        margin: 1.5cm;
                    }
                }
            `;
            document.head.appendChild(printStyles);
        }
    }

    // ===== ACCESSIBILITY HELPERS =====

    /**
     * Enhance keyboard navigation for the page
     */
    function enhanceKeyboardNavigation() {
        // Add a "skip to content" link
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.href = '#introduction';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Style for the skip link
        const skipLinkStyle = document.createElement('style');
        skipLinkStyle.id = 'skip-link-style';
        skipLinkStyle.textContent = `
            .skip-link {
                position: absolute;
                top: -40px;
                left: 0;
                background: var(--accent-color);
                color: white;
                padding: 8px;
                z-index: 1001;
                transition: top 0.3s;
            }
            
            .skip-link:focus {
                top: 0;
            }
        `;
        document.head.appendChild(skipLinkStyle);

        // Enhance anchor focus styles
        const anchorFocusStyle = document.createElement('style');
        anchorFocusStyle.id = 'anchor-focus-style';
        anchorFocusStyle.textContent = `
            a:focus {
                outline: 2px solid var(--accent-color);
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(anchorFocusStyle);
    }

    // Initialize accessibility enhancements
    enhanceKeyboardNavigation();
});
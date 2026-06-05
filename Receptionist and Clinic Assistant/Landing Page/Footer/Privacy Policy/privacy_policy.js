/**
 * Curis by Citrus - Privacy Policy Page JavaScript
 * 
 * This script handles all interactive functionality for the Privacy Policy page:
 * - Dynamic navigation generation based on page sections
 * - Smooth scrolling to page sections
 * - Dark mode toggle with persistent user preference
 * - Responsive behavior for mobile devices
 * - Subsection interactivity and expansion on mobile
 * - Active section tracking during page scroll
 */

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Create main navigation element if it doesn't exist
    createMainNav();

    // Initialize Navigation
    initNavigation();

    // Initialize Dark Mode
    initDarkMode();

    // Initialize Smooth Scrolling
    initSmoothScrolling();

    // Make Policy Subsections Interactive
    initSubsectionInteractivity();

    // Check URL hash for direct section navigation
    checkUrlHash();

    // Add dynamic styles
    addDynamicStyles();

    // Track active section during scrolling
    trackActiveSection();

    // Initialize secondary navigation for deeper page navigation
    initSecondaryNavigation();

    // Add accessibility improvements
    enhanceAccessibility();

    // Initialize animated scroll indicators
    initScrollIndicators();
});

/**
 * Function to create main navigation element if it doesn't exist
 */
function createMainNav() {
    // Check if main-nav exists
    if (!document.querySelector('.main-nav')) {
        const headerContainer = document.querySelector('.main-header .container');
        const ctaContainer = document.querySelector('.cta-container');

        // Create main nav element
        const mainNav = document.createElement('nav');
        mainNav.className = 'main-nav';

        // Insert before the CTA container
        headerContainer.insertBefore(mainNav, ctaContainer);
    }
}

/**
 * Function to initialize the main navigation
 * Populates the nav element with items based on the navigation map
 */
function initNavigation() {
    const mainNav = document.querySelector('.main-nav');

    // Create navigation list
    const navList = document.createElement('ul');
    navList.className = 'nav-list';

    // Navigation items based on the navigation map
    const navItems = [
        { title: 'Introduction', link: '#introduction' },
        { title: 'Information We Collect', link: '#info-collect' },
        { title: 'How We Use Information', link: '#info-use' },
        { title: 'Data Protection', link: '#data-security' },
        { title: 'Your Rights & Choices', link: '#user-rights' },
        { title: 'Policy Updates', link: '#updates' },
        { title: 'Contact & Support', link: '#contact' }
    ];

    // Create and append nav items
    navItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'nav-item';

        const a = document.createElement('a');
        a.href = item.link;
        a.textContent = item.title;

        // Check if the current section is active
        if (window.location.hash === item.link) {
            a.classList.add('active');
        }

        li.appendChild(a);
        navList.appendChild(li);
    });

    mainNav.appendChild(navList);

    // Handle responsive navigation
    initResponsiveNav();
}

/**
 * Function to initialize responsive navigation
 * Creates hamburger menu for mobile screens
 */
function initResponsiveNav() {
    const mainNav = document.querySelector('.main-nav');
    const container = document.querySelector('.main-header .container');

    // Check if we need to add a hamburger menu
    if (window.innerWidth <= 992) {
        // Create a hamburger button if it doesn't exist
        if (!document.querySelector('.hamburger-menu')) {
            const hamburger = document.createElement('button');
            hamburger.className = 'hamburger-menu';
            hamburger.setAttribute('aria-label', 'Toggle navigation menu');

            // Create hamburger icon
            for (let i = 0; i < 3; i++) {
                const bar = document.createElement('span');
                bar.className = 'bar';
                hamburger.appendChild(bar);
            }

            // Add click event to toggle navigation
            hamburger.addEventListener('click', () => {
                mainNav.classList.toggle('nav-active');
                hamburger.classList.toggle('active');

                // Toggle aria-expanded attribute for accessibility
                const isExpanded = mainNav.classList.contains('nav-active');
                hamburger.setAttribute('aria-expanded', isExpanded);

                // Prevent body scrolling when menu is open
                document.body.style.overflow = isExpanded ? 'hidden' : '';
            });

            // Insert before the main navigation
            container.insertBefore(hamburger, mainNav);
        }

        // Make sure the nav list is initially hidden
        mainNav.classList.remove('nav-active');
    } else {
        // Remove hamburger on larger screens
        const hamburger = document.querySelector('.hamburger-menu');
        if (hamburger) {
            hamburger.remove();
        }

        // Make sure navigation is visible
        mainNav.classList.remove('nav-active');

        // Ensure body scrolling is enabled
        document.body.style.overflow = '';
    }
}

/**
 * Function to initialize dark mode toggle
 * Saves user preference to localStorage
 */
function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Check for saved user preference
    const savedDarkMode = localStorage.getItem('darkMode');

    // Apply dark mode if it was previously set
    if (savedDarkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    // Add click event to toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        // Toggle dark mode class on body
        document.body.classList.toggle('dark-mode');

        // Save preference to localStorage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    });
}

/**
 * Function to initialize smooth scrolling for navigation links
 * Scrolls to sections with header offset
 */
function initSmoothScrolling() {
    // Get all links that have a hash
    const anchors = document.querySelectorAll('a[href*="#"]:not([href="#"])');

    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Only apply to same-page links
            if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') &&
                location.hostname === this.hostname) {

                // Get the target element
                const target = document.querySelector(this.hash);

                if (target) {
                    e.preventDefault();

                    // Close mobile menu if open
                    const mainNav = document.querySelector('.main-nav');
                    const hamburger = document.querySelector('.hamburger-menu');

                    if (mainNav.classList.contains('nav-active')) {
                        mainNav.classList.remove('nav-active');
                        hamburger.classList.remove('active');
                        document.body.style.overflow = '';
                    }

                    // Remove active class from all navigation links
                    document.querySelectorAll('.nav-item a').forEach(a => {
                        a.classList.remove('active');
                    });

                    // Add active class to current link
                    this.classList.add('active');

                    // Calculate header height for offset
                    const headerHeight = document.querySelector('.main-header').offsetHeight;

                    // Scroll to target with offset for header
                    window.scrollTo({
                        top: target.offsetTop - headerHeight - 20, // Additional 20px for spacing
                        behavior: 'smooth'
                    });

                    // Update URL hash
                    history.pushState(null, null, this.hash);
                }
            }
        });
    });
}

/**
 * Function to make policy subsections interactive
 * On mobile, makes subsections expandable
 */
function initSubsectionInteractivity() {
    const subsections = document.querySelectorAll('.policy-subsection');

    subsections.forEach(subsection => {
        // Add hover effect class
        subsection.classList.add('interactive');

        // Create a subsection expander for mobile
        if (window.innerWidth <= 768) {
            const heading = subsection.querySelector('h3');

            if (heading) {
                // Make the heading clickable to expand/collapse on mobile
                heading.classList.add('expandable');

                // Add click event
                heading.addEventListener('click', () => {
                    subsection.classList.toggle('expanded');

                    // Update aria-expanded attribute
                    const isExpanded = subsection.classList.contains('expanded');
                    heading.setAttribute('aria-expanded', isExpanded);
                });

                // Create indicator icon
                const indicator = document.createElement('span');
                indicator.className = 'expand-indicator';
                indicator.setAttribute('aria-hidden', 'true');
                heading.appendChild(indicator);

                // Set initial aria attributes
                heading.setAttribute('aria-expanded', 'false');
                heading.setAttribute('role', 'button');
                heading.setAttribute('tabindex', '0');

                // Add keyboard support
                heading.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        heading.click();
                    }
                });
            }
        }
    });
}

/**
 * Function to check URL hash on page load and scroll to the section
 */
function checkUrlHash() {
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);

        if (target) {
            // Wait a moment for page to settle
            setTimeout(() => {
                // Calculate header height for offset
                const headerHeight = document.querySelector('.main-header').offsetHeight;

                // Scroll to target with offset for header
                window.scrollTo({
                    top: target.offsetTop - headerHeight - 20,
                    behavior: 'smooth'
                });

                // Highlight the active navigation item
                const activeNavLink = document.querySelector(`.nav-item a[href="${window.location.hash}"]`);
                if (activeNavLink) {
                    document.querySelectorAll('.nav-item a').forEach(a => {
                        a.classList.remove('active');
                    });
                    activeNavLink.classList.add('active');
                }
            }, 300);
        }
    }
}

/**
 * Function to add dynamic styles needed for JavaScript functionality
 */
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Active navigation link */
        .nav-item a.active {
            background-color: var(--light-teal);
            color: var(--teal);
            font-weight: 600;
        }
        
        /* Hamburger menu styles */
        .hamburger-menu {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            position: relative;
            z-index: 101;
        }
        
        @media (max-width: 992px) {
            .hamburger-menu {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 24px;
            }
            
            .hamburger-menu .bar {
                display: block;
                width: 100%;
                height: 3px;
                background-color: var(--navy);
                border-radius: 3px;
                transition: all 0.3s ease;
            }
            
            .hamburger-menu.active .bar:nth-child(1) {
                transform: translateY(10px) rotate(45deg);
            }
            
            .hamburger-menu.active .bar:nth-child(2) {
                opacity: 0;
            }
            
            .hamburger-menu.active .bar:nth-child(3) {
                transform: translateY(-10px) rotate(-45deg);
            }
            
            .main-nav {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: var(--white);
                display: flex;
                justify-content: center;
                align-items: center;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                z-index: 100;
            }
            
            .main-nav.nav-active {
                transform: translateX(0);
            }
            
            .nav-list {
                flex-direction: column;
                text-align: center;
            }
            
            .nav-item {
                margin: 1.5rem 0;
            }
            
            .nav-item a {
                font-size: 2rem;
                padding: 1rem 2rem;
            }
        }
        
        /* Dark mode adjustments for hamburger */
        .dark-mode .hamburger-menu .bar {
            background-color: var(--white);
        }
        
        /* Expanded subsections on mobile */
        @media (max-width: 768px) {
            .policy-subsection:not(.expanded) > *:not(h3) {
                display: none;
            }
            
            .policy-subsection.expanded > *:not(h3) {
                display: block;
                animation: fadeIn 0.3s ease-out forwards;
            }
            
            .expandable {
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-right: 30px;
                position: relative;
            }
            
            .expand-indicator {
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
            }
            
            .expand-indicator::before,
            .expand-indicator::after {
                content: '';
                position: absolute;
                background-color: var(--teal);
                transition: all 0.3s ease;
            }
            
            .expand-indicator::before {
                width: 2px;
                height: 16px;
                top: 2px;
                left: 9px;
            }
            
            .expand-indicator::after {
                width: 16px;
                height: 2px;
                top: 9px;
                left: 2px;
            }
            
            .expanded .expand-indicator::before {
                opacity: 0;
            }
        }
        
        /* Interactive subsections */
        .policy-subsection.interactive {
            cursor: pointer;
        }
        
        /* Print styles for the navigation */
        @media print {
            .nav-list, .hamburger-menu {
                display: none !important;
            }
        }
        
        /* Ensure navigation is visible on larger screens */
        @media (min-width: 993px) {
            .main-nav {
                display: flex;
                justify-content: center;
                flex: 1 1 auto;
            }
            
            .nav-list {
                display: flex;
                gap: var(--spacing-md);
                list-style: none;
                margin-bottom: 0;
            }
            
            .nav-item a {
                font-weight: 500;
                color: var(--navy);
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--radius-sm);
                transition: all var(--transition-fast);
            }
            
            .nav-item a:hover {
                background-color: var(--light-teal);
                color: var(--teal);
            }
        }
    `;

    document.head.appendChild(style);
}

/**
 * Function to track active section during scrolling
 * Highlights the corresponding navigation item
 */
function trackActiveSection() {
    const sections = document.querySelectorAll('.policy-section');
    const navLinks = document.querySelectorAll('.nav-item a');

    // Add scroll event listener with throttling for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }

        scrollTimeout = window.requestAnimationFrame(() => {
            let current = '';
            const headerHeight = document.querySelector('.main-header').offsetHeight;

            sections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeight - 100;
                const sectionHeight = section.offsetHeight;

                if (window.pageYOffset >= sectionTop &&
                    window.pageYOffset < sectionTop + sectionHeight) {
                    current = '#' + section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === current) {
                    link.classList.add('active');
                }
            });
        });
    });
}

/**
 * Handle window resize events for responsive behavior
 */
window.addEventListener('resize', function () {
    // Debounce resize event
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(function () {
        // Reinitialize responsive navigation
        initResponsiveNav();

        // Reset subsection interactivity on screen size change
        const subsections = document.querySelectorAll('.policy-subsection');

        subsections.forEach(subsection => {
            if (window.innerWidth > 768) {
                // Remove expanded class and events on larger screens
                subsection.classList.remove('expanded');

                // Remove click event from headings
                const heading = subsection.querySelector('h3.expandable');
                if (heading) {
                    heading.classList.remove('expandable');
                    heading.removeAttribute('aria-expanded');
                    heading.removeAttribute('role');
                    heading.removeAttribute('tabindex');

                    const indicator = heading.querySelector('.expand-indicator');
                    if (indicator) {
                        indicator.remove();
                    }

                    // Clone the heading to remove event listeners
                    const newHeading = heading.cloneNode(true);
                    heading.parentNode.replaceChild(newHeading, heading);
                }
            } else {
                // Reinitialize mobile behavior
                const heading = subsection.querySelector('h3');
                if (heading && !heading.classList.contains('expandable')) {
                    // Make the heading clickable to expand/collapse on mobile
                    heading.classList.add('expandable');

                    // Add click event
                    heading.addEventListener('click', () => {
                        subsection.classList.toggle('expanded');

                        // Update aria-expanded attribute
                        const isExpanded = subsection.classList.contains('expanded');
                        heading.setAttribute('aria-expanded', isExpanded);
                    });

                    // Create indicator icon
                    const indicator = document.createElement('span');
                    indicator.className = 'expand-indicator';
                    indicator.setAttribute('aria-hidden', 'true');
                    heading.appendChild(indicator);

                    // Set initial aria attributes
                    heading.setAttribute('aria-expanded', 'false');
                    heading.setAttribute('role', 'button');
                    heading.setAttribute('tabindex', '0');

                    // Add keyboard support
                    heading.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            heading.click();
                        }
                    });
                }
            }
        });
    }, 250);
});

/**
 * Initialize secondary navigation for subsections
 * Creates a floating secondary nav for deeper navigation
 */
function initSecondaryNavigation() {
    // Create floating secondary navigation element
    const secondaryNav = document.createElement('div');
    secondaryNav.className = 'secondary-nav';
    secondaryNav.innerHTML = `
        <button class="nav-toggle" aria-label="Toggle section navigation">
            <span class="toggle-icon"></span>
        </button>
        <div class="secondary-nav-content">
            <h4>On This Page</h4>
            <ul class="secondary-nav-list"></ul>
        </div>
    `;

    // Add to the document
    document.querySelector('.main-content .container').appendChild(secondaryNav);

    // Populate with subsections
    const navList = secondaryNav.querySelector('.secondary-nav-list');
    const sections = document.querySelectorAll('.policy-section');

    sections.forEach(section => {
        const sectionId = section.getAttribute('id');
        const sectionTitle = section.querySelector('h2').textContent;

        // Create main section item
        const sectionItem = document.createElement('li');
        sectionItem.className = 'secondary-nav-item';

        const sectionLink = document.createElement('a');
        sectionLink.href = `#${sectionId}`;
        sectionLink.textContent = sectionTitle;
        sectionItem.appendChild(sectionLink);

        // Get subsections if any
        const subsections = section.querySelectorAll('.policy-subsection');
        if (subsections.length > 0) {
            const subList = document.createElement('ul');
            subList.className = 'sub-nav-list';

            subsections.forEach(subsection => {
                // Get subsection ID if exists
                let subsectionId = subsection.getAttribute('id');
                const subsectionTitle = subsection.querySelector('h3').textContent;

                const subItem = document.createElement('li');
                subItem.className = 'sub-nav-item';

                const subLink = document.createElement('a');
                subLink.href = `#${subsectionId}`;
                subLink.textContent = subsectionTitle;
                subItem.appendChild(subLink);

                subList.appendChild(subItem);
            });

            sectionItem.appendChild(subList);
        }

        navList.appendChild(sectionItem);
    });

    // Toggle secondary navigation
    const navToggle = secondaryNav.querySelector('.nav-toggle');
    navToggle.addEventListener('click', () => {
        secondaryNav.classList.toggle('active');
        const isExpanded = secondaryNav.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Initialize secondary nav links with smooth scrolling
    const secondaryLinks = secondaryNav.querySelectorAll('a');
    secondaryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                // Calculate header height for offset
                const headerHeight = document.querySelector('.main-header').offsetHeight;

                // Scroll to target
                window.scrollTo({
                    top: target.offsetTop - headerHeight - 20,
                    behavior: 'smooth'
                });

                // Update URL
                history.pushState(null, null, link.getAttribute('href'));

                // Close secondary nav on mobile
                if (window.innerWidth <= 992) {
                    secondaryNav.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Show/hide based on scroll position
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Show after scrolling past header
        if (scrollTop > document.querySelector('.policy-header').offsetHeight) {
            secondaryNav.classList.add('visible');
        } else {
            secondaryNav.classList.remove('visible');
        }

        // Hide when scrolling down rapidly
        if (scrollTop > lastScrollTop && scrollTop > 300) {
            secondaryNav.classList.add('hidden');
        } else {
            secondaryNav.classList.remove('hidden');
        }

        lastScrollTop = scrollTop;
    });

    // Add styles for secondary navigation
    const secondaryNavStyles = document.createElement('style');
    secondaryNavStyles.textContent = `
        .secondary-nav {
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            background-color: var(--white);
            border-radius: var(--radius-md);
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
            z-index: 90;
            transition: all 0.3s ease;
            opacity: 0;
            visibility: hidden;
            max-width: 250px;
        }
        
        .secondary-nav.visible {
            opacity: 1;
            visibility: visible;
        }
        
        .secondary-nav.hidden {
            transform: translateY(-50%) translateX(100%);
        }
        
        .nav-toggle {
            position: absolute;
            left: -40px;
            top: 50%;
            transform: translateY(-50%);
            width: 40px;
            height: 40px;
            background-color: var(--teal);
            border: none;
            border-radius: var(--radius-sm) 0 0 var(--radius-sm);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .toggle-icon {
            position: relative;
            width: 20px;
            height: 20px;
        }
        
        .toggle-icon::before {
            content: '\\f0ca'; /* List icon */
            font-family: 'Font Awesome 6 Free';
            font-weight: 900;
            color: var(--white);
        }
        
        .secondary-nav-content {
            padding: 15px;
            display: none;
        }
        
        .secondary-nav.active .secondary-nav-content {
            display: block;
        }
        
        .secondary-nav h4 {
            margin-top: 0;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--divider);
        }
        
        .secondary-nav-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        
        .secondary-nav-item {
            margin-bottom: 10px;
        }
        
        .secondary-nav-item > a {
            font-weight: 500;
            display: block;
            padding: 4px 0;
        }
        
        .sub-nav-list {
            list-style: none;
            margin: 5px 0 10px 15px;
            padding: 0;
            font-size: 0.9em;
        }
        
        .sub-nav-item {
            margin-bottom: 5px;
        }
        
        .sub-nav-item a {
            display: block;
            padding: 2px 0;
            color: var(--navy-80);
        }
        
        @media (max-width: 992px) {
            .secondary-nav {
                bottom: 20px;
                right: 20px;
                top: auto;
                transform: none;
                max-width: 300px;
            }
            
            .secondary-nav.hidden {
                transform: translateX(100%);
            }
            
            .nav-toggle {
                left: auto;
                right: 0;
                top: -40px;
                transform: none;
                border-radius: var(--radius-sm) var(--radius-sm) 0 0;
            }
        }
        
        @media (max-width: 576px) {
            .secondary-nav {
                max-width: 80%;
            }
        }
        
        /* Dark mode adjustments */
        .dark-mode .secondary-nav {
            background-color: var(--navy);
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
        }
        
        .dark-mode .sub-nav-item a {
            color: rgba(255, 255, 255, 0.7);
        }
        
        @media print {
            .secondary-nav {
                display: none !important;
            }
        }
    `;

    document.head.appendChild(secondaryNavStyles);
}

/**
 * Add accessibility improvements to the page
 */
function enhanceAccessibility() {
    // Add skip to content link for keyboard users
    const skipLink = document.createElement('a');
    skipLink.href = '#introduction';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add ARIA labels to sections
    document.querySelectorAll('.policy-section').forEach(section => {
        const sectionId = section.getAttribute('id');
        const headingText = section.querySelector('h2').textContent;
        section.setAttribute('aria-labelledby', `heading-${sectionId}`);
        section.querySelector('h2').setAttribute('id', `heading-${sectionId}`);
    });

    // Improve focus visibility
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `
        :focus-visible {
            outline: 3px solid var(--teal);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(focusStyle);
}

/**
 * Initialize animated scrolling indicators
 * Adds subtle animation to guide users through the page
 */
function initScrollIndicators() {
    // Create scroll indicator element
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.innerHTML = `
        <span class="indicator-icon"></span>
        <span class="indicator-text">Scroll to explore</span>
    `;

    // Add to the document after policy header
    const policyHeader = document.querySelector('.policy-header');
    policyHeader.after(scrollIndicator);

    // Add styles for scroll indicator
    const indicatorStyles = document.createElement('style');
    indicatorStyles.textContent = `
        .scroll-indicator {
            text-align: center;
            margin: -2rem 0 3rem;
            opacity: 0.8;
            animation: fadeInOut 2s infinite;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .indicator-icon {
            width: 30px;
            height: 50px;
            border: 2px solid var(--navy);
            border-radius: 15px;
            position: relative;
            margin-bottom: 8px;
        }
        
        .indicator-icon::before {
            content: '';
            position: absolute;
            width: 6px;
            height: 6px;
            background: var(--teal);
            border-radius: 50%;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            animation: scrollDown 2s infinite;
        }
        
        .indicator-text {
            font-size: 1.2rem;
            color: var(--navy-80);
            font-weight: 500;
        }
        
        @keyframes scrollDown {
            0% {
                opacity: 0;
                top: 10px;
            }
            30% {
                opacity: 1;
            }
            60% {
                opacity: 1;
            }
            100% {
                opacity: 0;
                top: 30px;
            }
        }
        
        @keyframes fadeInOut {
            0%, 100% {
                opacity: 0.5;
            }
            50% {
                opacity: 1;
            }
        }
        
        /* Hide on smaller screens or when user has scrolled */
        @media (max-width: 768px) {
            .scroll-indicator {
                display: none;
            }
        }
        
        body.scrolled .scroll-indicator {
            display: none;
        }
    `;

    document.head.appendChild(indicatorStyles);

    // Hide indicator once user scrolls
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            document.body.classList.add('scrolled');
        }
    });
}
/**
 * Curis by Citrus - Patient FAQ JavaScript
 * Provides interactive functionality and enhanced user experience
 * for the FAQ page in the Curis platform.
 * 
 * Author: Citrus Labs Limited
 * Last Updated: March 2025
 */

// Wait for DOM to be fully loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all core functions
    initializeDarkMode();
    initializeFAQAccordion();
    initializeSearch();
    setupSmoothScrolling();
    setupCategoryHighlighting();
    setupAccessibilityFeatures();
    handleURLParameters();
    initializeResponsiveNavigation();
    setupAnalytics();
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
    announcement.className = 'sr-only';
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = `Switched to ${theme} mode`;

    document.body.appendChild(announcement);

    // Remove the announcement after it's been read
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 3000);
}

/**
 * FAQ Accordion Functionality
 * Allows expanding/collapsing of FAQ items
 */
function initializeFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('h4');
        const answer = item.querySelector('.faq-answer');

        // Set initial ARIA attributes
        question.setAttribute('aria-expanded', 'false');
        question.setAttribute('aria-controls', item.id + '-answer');
        answer.id = item.id + '-answer';
        answer.setAttribute('aria-hidden', 'true');

        // Add click event listener to question
        question.addEventListener('click', function () {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            // Close all other FAQ items if this one is being opened
            if (!isExpanded) {
                closeAllFAQItems();
            }

            // Toggle this FAQ item
            toggleFAQItem(item, !isExpanded);
        });

        // Add keyboard event listener
        question.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    /**
     * Close all FAQ items
     */
    function closeAllFAQItems() {
        faqItems.forEach(item => {
            toggleFAQItem(item, false);
        });
    }

    /**
     * Toggle a specific FAQ item
     * @param {Element} item - The FAQ item element
     * @param {boolean} expand - Whether to expand or collapse
     */
    function toggleFAQItem(item, expand) {
        const question = item.querySelector('h4');
        const answer = item.querySelector('.faq-answer');

        if (expand) {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
            answer.setAttribute('aria-hidden', 'false');
        } else {
            item.classList.remove('active');
            question.setAttribute('aria-expanded', 'false');
            answer.setAttribute('aria-hidden', 'true');
        }
    }
}

/**
 * Search Functionality
 * Allows searching through FAQ content
 */
function initializeSearch() {
    const searchForm = document.querySelector('.search-bar form');
    const searchInput = document.getElementById('faq-search');
    const faqItems = document.querySelectorAll('.faq-item');

    // Create search results element
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.setAttribute('aria-live', 'polite');
    document.querySelector('.search-bar').appendChild(searchResults);

    // Add event listener for form submission
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        performSearch();
    });

    // Add event listener for input changes (for real-time search)
    searchInput.addEventListener('input', debounce(function () {
        if (searchInput.value.length >= 3) {
            performSearch();
        } else {
            clearSearchResults();
        }
    }, 300));

    /**
     * Perform search and display results
     */
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        if (searchTerm.length < 2) {
            clearSearchResults();
            return;
        }

        // Track search analytics
        trackSearchEvent(searchTerm);

        // Find matching FAQ items
        let results = [];
        faqItems.forEach(item => {
            const question = item.querySelector('h4').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            const categoryTitle = item.closest('.faq-category').querySelector('h3').textContent;

            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                results.push({
                    item: item,
                    question: item.querySelector('h4').textContent,
                    category: categoryTitle,
                    relevance: calculateRelevance(question, answer, searchTerm)
                });
            }
        });

        // Sort results by relevance
        results.sort((a, b) => b.relevance - a.relevance);

        // Display results
        displaySearchResults(results, searchTerm);
    }

    /**
     * Calculate search result relevance
     * @param {string} question - The FAQ question text
     * @param {string} answer - The FAQ answer text
     * @param {string} searchTerm - The search term
     * @returns {number} - Relevance score
     */
    function calculateRelevance(question, answer, searchTerm) {
        let score = 0;

        // Question matches are more relevant than answer matches
        if (question.includes(searchTerm)) {
            score += 10;
            // Exact match in question is even more relevant
            if (question === searchTerm) {
                score += 5;
            }
            // Match at beginning of question is more relevant
            if (question.startsWith(searchTerm)) {
                score += 3;
            }
        }

        // Answer matches
        if (answer.includes(searchTerm)) {
            score += 5;
        }

        return score;
    }

    /**
     * Display search results
     * @param {Array} results - Array of search result objects
     * @param {string} searchTerm - The search term
     */
    function displaySearchResults(results, searchTerm) {
        searchResults.innerHTML = '';

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <p>No results found for "${escapeHTML(searchTerm)}"</p>
                    <p>Try different keywords or browse the categories below.</p>
                </div>
            `;
            searchResults.style.display = 'block';
            return;
        }

        // Create results list
        const resultsList = document.createElement('ul');
        resultsList.className = 'results-list';

        results.forEach(result => {
            const listItem = document.createElement('li');

            // Highlight the search term in the question
            const highlightedQuestion = highlightText(result.question, searchTerm);

            listItem.innerHTML = `
                <a href="#${result.item.id}" class="result-link">
                    <span class="result-question">${highlightedQuestion}</span>
                    <span class="result-category">in ${result.category}</span>
                </a>
            `;

            listItem.querySelector('a').addEventListener('click', function (e) {
                e.preventDefault();

                // Close search results
                clearSearchResults();

                // Navigate to the FAQ item
                navigateToFAQItem(result.item);
            });

            resultsList.appendChild(listItem);
        });

        // Add results to container
        searchResults.appendChild(resultsList);

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-results';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close search results');
        closeButton.addEventListener('click', clearSearchResults);

        searchResults.appendChild(closeButton);

        // Show results
        searchResults.style.display = 'block';

        // Add event listener to close results when clicking outside
        document.addEventListener('click', handleOutsideClick);
    }

    /**
     * Navigate to an FAQ item
     * @param {Element} item - The FAQ item element
     */
    function navigateToFAQItem(item) {
        // Expand the FAQ item
        const question = item.querySelector('h4');
        question.setAttribute('aria-expanded', 'true');
        item.classList.add('active');
        item.querySelector('.faq-answer').setAttribute('aria-hidden', 'false');

        // Scroll to the item
        item.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update URL
        window.history.pushState(null, null, `#${item.id}`);

        // Set focus to the question
        question.focus();

        // Add highlight effect
        item.classList.add('highlight-item');
        setTimeout(() => {
            item.classList.remove('highlight-item');
        }, 2000);
    }

    /**
     * Clear search results
     */
    function clearSearchResults() {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        document.removeEventListener('click', handleOutsideClick);
    }

    /**
     * Handle clicks outside the search results
     * @param {Event} e - The click event
     */
    function handleOutsideClick(e) {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            clearSearchResults();
        }
    }

    /**
     * Highlight text with given search term
     * @param {string} text - The text to highlight
     * @param {string} term - The term to highlight
     * @returns {string} - HTML with highlighted term
     */
    function highlightText(text, term) {
        const escText = escapeHTML(text);
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        return escText.replace(regex, '<mark>$1</mark>');
    }
}

/**
 * Smooth Scrolling
 * Enables smooth scrolling to section anchors
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Only scroll if the target exists
            if (document.querySelector(targetId)) {
                e.preventDefault();

                const targetElement = document.querySelector(targetId);
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update URL without page reload
                window.history.pushState(null, null, targetId);

                // Set focus to the target element
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
                targetElement.removeAttribute('tabindex');
            }
        });
    });

    // Add scroll margin to all sections
    document.querySelectorAll('section[id], .faq-item[id]').forEach(section => {
        section.classList.add('scroll-margin');
    });
}

/**
 * Category Highlighting
 * Highlights the current category based on scroll position
 */
function setupCategoryHighlighting() {
    const categories = document.querySelectorAll('.faq-category');
    const categoryLinks = createCategoryNavigationLinks(categories);

    // Setup Intersection Observer
    const observerOptions = {
        root: null, // use the viewport
        rootMargin: '-100px 0px -50% 0px', // consider section in view when it's 50% visible
        threshold: 0 // trigger as soon as any part is visible
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            const categoryId = entry.target.id;
            const correspondingLink = document.querySelector(`.category-nav a[href="#${categoryId}"]`);

            if (correspondingLink) {
                if (entry.isIntersecting) {
                    // Remove active class from all links
                    document.querySelectorAll('.category-nav a').forEach(link => {
                        link.classList.remove('active');
                    });

                    // Add active class to the corresponding link
                    correspondingLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    // Observe all categories
    categories.forEach(category => {
        observer.observe(category);
    });
}

/**
 * Create category navigation links
 * @param {NodeList} categories - The category elements
 * @returns {Element} - The navigation element
 */
function createCategoryNavigationLinks(categories) {
    // Create the navigation container
    const categoryNav = document.createElement('nav');
    categoryNav.className = 'category-nav';
    categoryNav.setAttribute('aria-label', 'FAQ Categories');

    // Create the list
    const navList = document.createElement('ul');

    // Add items for each category
    categories.forEach(category => {
        const categoryId = category.id;
        const categoryTitle = category.querySelector('h3').textContent;

        const listItem = document.createElement('li');
        const link = document.createElement('a');

        link.href = `#${categoryId}`;
        link.textContent = categoryTitle;

        listItem.appendChild(link);
        navList.appendChild(listItem);
    });

    categoryNav.appendChild(navList);

    // Insert after the search section
    const searchSection = document.getElementById('search');
    if (searchSection) {
        searchSection.parentNode.insertBefore(categoryNav, searchSection.nextSibling);
    }

    return categoryNav;
}

/**
 * Accessibility Enhancements
 * Improves accessibility of the page
 */
function setupAccessibilityFeatures() {
    // Add skip to content link
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-to-content';
    skipLink.href = '#categories';
    skipLink.textContent = 'Skip to FAQ Content';

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add ARIA roles to sections
    document.querySelector('.search-section').setAttribute('role', 'search');
    document.querySelector('.categories-section').setAttribute('role', 'region');
    document.querySelector('.support-section').setAttribute('role', 'complementary');

    // Add role to FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.setAttribute('role', 'group');
    });

    // Enhanced keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-user');
        }
    });

    document.addEventListener('mousedown', function () {
        document.body.classList.remove('keyboard-user');
    });

    // Ensure all interactive elements have appropriate focus states
    document.querySelectorAll('a, button, input, [tabindex]').forEach(el => {
        if (!el.classList.contains('skip-to-content')) {
            el.addEventListener('focus', function () {
                this.classList.add('focus-visible');
            });

            el.addEventListener('blur', function () {
                this.classList.remove('focus-visible');
            });
        }
    });

    // Add print button
    const printButton = document.createElement('button');
    printButton.className = 'print-button';
    printButton.innerHTML = '<i class="fas fa-print"></i> Print FAQ';
    printButton.addEventListener('click', function () {
        window.print();
    });

    document.querySelector('.faq-container').appendChild(printButton);
}

/**
 * URL Parameter Handling
 * Opens the appropriate FAQ item based on URL hash
 */
function handleURLParameters() {
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // If it's an FAQ item
            if (targetElement.classList.contains('faq-item')) {
                setTimeout(() => {
                    // Expand the FAQ item
                    targetElement.classList.add('active');
                    const question = targetElement.querySelector('h4');
                    question.setAttribute('aria-expanded', 'true');
                    targetElement.querySelector('.faq-answer').setAttribute('aria-hidden', 'false');

                    // Scroll to the item
                    targetElement.scrollIntoView();

                    // Add highlight effect
                    targetElement.classList.add('highlight-item');
                    setTimeout(() => {
                        targetElement.classList.remove('highlight-item');
                    }, 2000);
                }, 300);
            } else {
                // For other elements, just scroll to them
                setTimeout(() => {
                    targetElement.scrollIntoView();
                }, 300);
            }
        }
    }
}

/**
 * Responsive Navigation
 * Handles mobile navigation menu
 */
function initializeResponsiveNavigation() {
    // Check if we need a mobile menu toggle
    if (window.innerWidth < 768) {
        const nav = document.querySelector('.main-navigation');

        if (nav && !document.querySelector('.mobile-nav-toggle')) {
            const navToggle = document.createElement('button');
            navToggle.className = 'mobile-nav-toggle';
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-controls', 'main-nav');
            navToggle.innerHTML = '<span class="hamburger-icon"></span><span class="screen-reader-text">Menu</span>';

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
            initializeResponsiveNavigation();
        }
    });
}

/**
 * Analytics Setup
 * Tracks user interactions with the FAQ
 */
function setupAnalytics() {
    // Track FAQ item opens
    document.querySelectorAll('.faq-item h4').forEach(question => {
        question.addEventListener('click', function () {
            const faqId = this.parentElement.id;
            const faqQuestion = this.textContent;
            const isExpanding = this.getAttribute('aria-expanded') === 'false';

            if (isExpanding) {
                trackFAQEvent('open', faqId, faqQuestion);
            }
        });
    });

    // Track external link clicks
    document.querySelectorAll('a[href^="http"], a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function () {
            const href = this.getAttribute('href');
            const linkText = this.textContent;

            trackLinkEvent(href, linkText);
        });
    });
}

/**
 * Track FAQ interaction event
 * @param {string} action - The action (e.g., 'open', 'search')
 * @param {string} faqId - The FAQ item ID
 * @param {string} faqQuestion - The FAQ question text
 */
function trackFAQEvent(action, faqId, faqQuestion) {
    // If Google Analytics is available
    if (typeof ga !== 'undefined') {
        ga('send', 'event', {
            eventCategory: 'FAQ',
            eventAction: action,
            eventLabel: faqQuestion,
            eventValue: 1
        });
    }

    // Custom analytics logging (can be replaced with your own system)
    console.log(`FAQ Event: ${action} - ${faqId} - ${faqQuestion}`);
}

/**
 * Track search event
 * @param {string} searchTerm - The search term
 */
function trackSearchEvent(searchTerm) {
    // If Google Analytics is available
    if (typeof ga !== 'undefined') {
        ga('send', 'event', {
            eventCategory: 'FAQ',
            eventAction: 'search',
            eventLabel: searchTerm,
            eventValue: 1
        });
    }

    // Custom analytics logging (can be replaced with your own system)
    console.log(`Search Event: ${searchTerm}`);
}

/**
 * Track link click event
 * @param {string} href - The link URL
 * @param {string} linkText - The link text
 */
function trackLinkEvent(href, linkText) {
    // If Google Analytics is available
    if (typeof ga !== 'undefined') {
        ga('send', 'event', {
            eventCategory: 'Outbound Link',
            eventAction: 'click',
            eventLabel: href,
            eventValue: 1
        });
    }

    // Custom analytics logging (can be replaced with your own system)
    console.log(`Link Event: ${href} - ${linkText}`);
}

/**
 * Utility Functions
 */

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce delay in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Escape HTML special characters
 * @param {string} html - The string to escape
 * @returns {string} - Escaped string
 */
function escapeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

/**
 * Escape special characters in a string for use in a regular expression
 * @param {string} string - The string to escape
 * @returns {string} - Escaped string safe for regex
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Add dynamic styles for newly created elements
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
    
    /* Search results styling */
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: var(--background-primary);
        border: 1px solid var(--light-gray);
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-md);
        margin-top: var(--spacing-sm);
        z-index: 100;
        max-height: 400px;
        overflow-y: auto;
        display: none;
    }
    
    .results-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .results-list li {
        border-bottom: 1px solid var(--light-gray);
        margin: 0;
    }
    
    .results-list li:last-child {
        border-bottom: none;
    }
    
    .result-link {
        display: block;
        padding: var(--spacing-md);
        color: var(--text-primary);
        transition: background-color var(--transition-fast);
    }
    
    .result-link:hover, .result-link:focus {
        background-color: var(--background-secondary);
        text-decoration: none;
    }
    
    .result-question {
        display: block;
        font-weight: 500;
    }
    
    .result-category {
        display: block;
        font-size: 0.85em;
        color: var(--medium-gray);
        margin-top: var(--spacing-xs);
    }
    
    .close-results {
        position: absolute;
        top: var(--spacing-xs);
        right: var(--spacing-xs);
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--medium-gray);
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    
    .close-results:hover, .close-results:focus {
        background-color: rgba(0, 0, 0, 0.05);
        color: var(--text-primary);
    }
    
    .no-results {
        padding: var(--spacing-lg);
        text-align: center;
    }
    
    /* Category navigation */
    .category-nav {
        margin: var(--spacing-xl) 0;
        padding: var(--spacing-md);
        background-color: var(--background-secondary);
        border-radius: var(--border-radius-md);
    }
    
    .category-nav ul {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        list-style: none;
        padding: 0;
        margin: 0;
        justify-content: center;
    }
    
    .category-nav a {
        display: block;
        padding: var(--spacing-sm) var(--spacing-md);
        background-color: var(--background-primary);
        border-radius: var(--border-radius-sm);
        transition: all var(--transition-fast);
        color: var(--text-primary);
        font-weight: 500;
    }
    
    .category-nav a:hover, .category-nav a:focus, .category-nav a.active {
        background-color: var(--accent-teal);
        color: white;
        text-decoration: none;
    }
    
    /* Print button */
    .print-button {
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
    
    .print-button:hover, .print-button:focus {
        background-color: var(--primary-navy);
    }
    
    /* Mobile navigation toggle */
    .mobile-nav-toggle {
        display: none;
    }
    
    @media (max-width: 768px) {
        .mobile-nav-toggle {
            display: block;
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
            box-shadow: var(--shadow-md);
            z-index: 100;
            padding: var(--spacing-md);
        }
        
        .category-nav ul {
            flex-direction: column;
        }
        
        .category-nav a {
            text-align: center;
        }
    }
    
    /* Highlight effect for FAQ items */
    .highlight-item {
        animation: highlight 2s ease-out;
    }
    
    @keyframes highlight {
        0% { background-color: rgba(0, 191, 165, 0.2); }
        100% { background-color: transparent; }
    }
    
    /* Focus states for keyboard navigation */
    .keyboard-user :focus {
        outline: 2px solid var(--accent-teal);
        outline-offset: 2px;
    }
    
    /* Mark styling */
    mark {
        background-color: rgba(255, 107, 53, 0.2);
        color: inherit;
        padding: 0 2px;
        border-radius: 2px;
    }
    
    /* Screen reader text */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
`;

document.head.appendChild(dynamicStyles);
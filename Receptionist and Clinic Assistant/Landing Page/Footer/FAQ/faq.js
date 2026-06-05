/**
 * Curis by Citrus - FAQ Page JavaScript
 * 
 * This script handles all interactive functionality for the FAQ page:
 * - Dynamic navigation generation based on page sections
 * - Accordion functionality for FAQ items
 * - Search functionality to filter FAQ items
 * - Smooth scrolling to sections
 * - Dark mode toggle with persistent user preference
 * - Responsive behavior for mobile devices
 * - Accessibility enhancements
 */

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Create main navigation element if it doesn't exist
    createMainNav();

    // Initialize Navigation
    initNavigation();

    // Initialize Accordion functionality
    initAccordion();

    // Initialize Search functionality
    initSearch();

    // Initialize Dark Mode
    initDarkMode();

    // Initialize Smooth Scrolling
    initSmoothScrolling();

    // Track active section during scrolling
    trackActiveSection();

    // Add accessibility improvements
    enhanceAccessibility();

    // Add category filtering
    initCategoryFilters();

    // Initialize FAQ counter
    updateFaqCounter();
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
        { title: 'Search', link: '#search' },
        { title: 'General Info', link: '#general' },
        { title: 'Account Management', link: '#acct-mgmt' },
        { title: 'Appointments', link: '#appointments' },
        { title: 'Billing', link: '#billing' },
        { title: 'Communication', link: '#notifications' },
        { title: 'Support', link: '#support-resources' }
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
 * Function to initialize accordion functionality for FAQ items
 */
function initAccordion() {
    const accordionToggles = document.querySelectorAll('.accordion-toggle');

    accordionToggles.forEach(toggle => {
        // Set initial aria attributes
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        const answerId = toggle.getAttribute('aria-controls');
        const answerElement = document.getElementById(answerId);

        if (isExpanded) {
            answerElement.style.maxHeight = answerElement.scrollHeight + 'px';
        }

        // Add click event
        toggle.addEventListener('click', () => {
            // Toggle expanded state
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !expanded);

            // Get corresponding answer element
            const answerId = toggle.getAttribute('aria-controls');
            const answerElement = document.getElementById(answerId);

            // Toggle answer visibility
            if (!expanded) {
                // Open the accordion
                answerElement.style.maxHeight = answerElement.scrollHeight + 'px';
            } else {
                // Close the accordion
                answerElement.style.maxHeight = '0';
            }

            // Close other accordion items in the same category (optional)
            const categoryItems = toggle.closest('.faq-items').querySelectorAll('.accordion-toggle');
            categoryItems.forEach(item => {
                if (item !== toggle && item.getAttribute('aria-expanded') === 'true') {
                    item.setAttribute('aria-expanded', 'false');
                    const itemAnswerId = item.getAttribute('aria-controls');
                    const itemAnswerElement = document.getElementById(itemAnswerId);
                    itemAnswerElement.style.maxHeight = '0';
                }
            });
        });

        // Add keyboard support
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle.click();
            }
        });
    });
}

/**
 * Function to initialize search functionality
 */
function initSearch() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.getElementById('faq-search');
    const faqItems = document.querySelectorAll('.faq-item');
    const faqCategories = document.querySelectorAll('.faq-category');

    if (searchForm && searchInput) {
        // Create search results container
        const searchResultsContainer = document.createElement('div');
        searchResultsContainer.className = 'search-results';
        searchResultsContainer.innerHTML = '<h3>Search Results</h3><div class="search-results-list"></div>';
        searchResultsContainer.style.display = 'none';

        // Insert after search section
        const searchSection = document.querySelector('.search-section');
        searchSection.after(searchResultsContainer);

        // Add search functionality
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const searchTerm = searchInput.value.trim().toLowerCase();

            if (searchTerm.length < 2) {
                // Show error for short search terms
                showSearchError('Please enter at least 2 characters for search');
                return;
            }

            performSearch(searchTerm);
        });

        // Add live search as user types (optional)
        let debounceTimer;
        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const searchTerm = searchInput.value.trim().toLowerCase();
                if (searchTerm.length >= 2) {
                    performSearch(searchTerm);
                } else {
                    // Hide search results if search term is cleared
                    searchResultsContainer.style.display = 'none';

                    // Show all FAQ items again
                    faqCategories.forEach(category => {
                        category.style.display = 'block';
                    });
                }
            }, 300); // Debounce for 300ms
        });

        // Function to perform search
        function performSearch(searchTerm) {
            const searchResultsList = searchResultsContainer.querySelector('.search-results-list');
            searchResultsList.innerHTML = '';

            let results = [];
            let matchCount = 0;

            // Search in all FAQ items
            faqItems.forEach(item => {
                const questionText = item.querySelector('.accordion-toggle span:first-child').textContent.toLowerCase();
                const answerText = item.querySelector('.faq-answer p').textContent.toLowerCase();
                const itemId = item.id;
                const category = item.closest('.faq-category').querySelector('h3').textContent;

                // Check if question or answer contains search term
                if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
                    matchCount++;

                    // Create a result item
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';

                    const question = item.querySelector('.accordion-toggle span:first-child').textContent;

                    resultItem.innerHTML = `
                        <div class="result-category">${category}</div>
                        <h4>${question}</h4>
                        <a href="#${itemId}" class="view-result-btn">View Answer</a>
                    `;

                    // Add click event to view result
                    resultItem.querySelector('.view-result-btn').addEventListener('click', (e) => {
                        e.preventDefault();

                        // Clear search results display
                        searchResultsContainer.style.display = 'none';

                        // Show all categories again
                        faqCategories.forEach(category => {
                            category.style.display = 'block';
                        });

                        // Scroll to the item
                        const targetItem = document.getElementById(itemId);
                        const targetToggle = targetItem.querySelector('.accordion-toggle');

                        // Open the accordion if it's closed
                        if (targetToggle.getAttribute('aria-expanded') !== 'true') {
                            targetToggle.click();
                        }

                        // Scroll to the item
                        setTimeout(() => {
                            const headerHeight = document.querySelector('.main-header').offsetHeight;
                            window.scrollTo({
                                top: targetItem.offsetTop - headerHeight - 20,
                                behavior: 'smooth'
                            });

                            // Highlight the result temporarily
                            targetItem.classList.add('search-highlight');
                            setTimeout(() => {
                                targetItem.classList.remove('search-highlight');
                            }, 2000);
                        }, 100);
                    });

                    searchResultsList.appendChild(resultItem);
                    results.push(item);
                }
            });

            // Show or hide search results based on matches
            if (matchCount > 0) {
                // Show search results
                searchResultsContainer.style.display = 'block';

                // Add results counter
                const resultsCount = document.createElement('div');
                resultsCount.className = 'results-count';
                resultsCount.textContent = `Found ${matchCount} result${matchCount > 1 ? 's' : ''}`;
                searchResultsList.prepend(resultsCount);

                // Hide all categories first
                faqCategories.forEach(category => {
                    category.style.display = 'none';
                });

                // Create "Back to all FAQs" button
                if (!searchResultsContainer.querySelector('.back-to-faqs')) {
                    const backButton = document.createElement('button');
                    backButton.className = 'back-to-faqs';
                    backButton.textContent = 'Back to All FAQs';
                    backButton.addEventListener('click', () => {
                        // Hide search results
                        searchResultsContainer.style.display = 'none';

                        // Show all categories again
                        faqCategories.forEach(category => {
                            category.style.display = 'block';
                        });

                        // Clear search input
                        searchInput.value = '';
                    });

                    searchResultsContainer.appendChild(backButton);
                }
            } else {
                // Show no results message
                searchResultsContainer.style.display = 'block';
                searchResultsList.innerHTML = `
                    <div class="no-results">
                        <p>No results found for "${searchTerm}"</p>
                        <p>Try different keywords or check out the categories below</p>
                    </div>
                `;

                // Show all categories again
                faqCategories.forEach(category => {
                    category.style.display = 'block';
                });
            }
        }

        // Function to show search error
        function showSearchError(message) {
            const searchResultsList = searchResultsContainer.querySelector('.search-results-list');
            searchResultsContainer.style.display = 'block';
            searchResultsList.innerHTML = `
                <div class="search-error">
                    <p>${message}</p>
                </div>
            `;

            // Hide after 3 seconds
            setTimeout(() => {
                searchResultsContainer.style.display = 'none';
            }, 3000);
        }
    }

    // Add search result styles
    const searchStyles = document.createElement('style');
    searchStyles.textContent = `
        .search-results {
            background-color: var(--light-navy);
            border-radius: var(--radius-lg);
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            animation: fadeIn 0.3s ease-out forwards;
        }
        
        .search-results h3 {
            color: var(--navy);
            margin-bottom: var(--spacing-md);
            padding-bottom: var(--spacing-xs);
            border-bottom: 2px solid var(--light-teal);
        }
        
        .results-count {
            font-size: 1.4rem;
            color: var(--navy-80);
            margin-bottom: var(--spacing-md);
            padding-bottom: var(--spacing-xs);
            border-bottom: 1px solid var(--divider);
        }
        
        .search-result-item {
            padding: var(--spacing-md);
            background-color: var(--white);
            border-radius: var(--radius-md);
            margin-bottom: var(--spacing-sm);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            transition: transform var(--transition-normal);
        }
        
        .search-result-item:hover {
            transform: translateY(-2px);
        }
        
        .result-category {
            font-size: 1.2rem;
            color: var(--teal);
            margin-bottom: var(--spacing-xs);
            font-weight: 500;
        }
        
        .search-result-item h4 {
            font-size: 1.6rem;
            margin-bottom: var(--spacing-sm);
        }
        
        .view-result-btn {
            display: inline-block;
            padding: 0.8rem 1.5rem;
            background-color: var(--light-teal);
            color: var(--teal);
            border-radius: var(--radius-sm);
            font-weight: 500;
            transition: all var(--transition-normal);
        }
        
        .view-result-btn:hover {
            background-color: var(--teal);
            color: var(--white);
        }
        
        .no-results, .search-error {
            padding: var(--spacing-md);
            text-align: center;
            background-color: var(--white);
            border-radius: var(--radius-md);
        }
        
        .no-results p:first-child, .search-error p {
            font-weight: 500;
            color: var(--navy);
        }
        
        .search-error p {
            color: #e74c3c;
        }
        
        .back-to-faqs {
            display: block;
            margin: var(--spacing-md) auto 0;
            padding: 1rem 2rem;
            background-color: var(--navy);
            color: var(--white);
            border: none;
            border-radius: var(--radius-md);
            font-family: var(--body-font);
            font-weight: 500;
            cursor: pointer;
            transition: all var(--transition-normal);
        }
        
        .back-to-faqs:hover {
            background-color: var(--teal);
            transform: translateY(-2px);
        }
        
        .search-highlight {
            animation: highlight 2s ease-out;
        }
        
        @keyframes highlight {
            0%, 100% {
                background-color: transparent;
            }
            50% {
                background-color: var(--light-teal);
            }
        }
        
        .dark-mode .search-result-item,
        .dark-mode .no-results,
        .dark-mode .search-error {
            background-color: rgba(42, 63, 88, 0.2);
        }
    `;
    document.head.appendChild(searchStyles);
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

                    if (mainNav && mainNav.classList.contains('nav-active')) {
                        mainNav.classList.remove('nav-active');
                        if (hamburger) hamburger.classList.remove('active');
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
 * Function to track active section during scrolling
 */
function trackActiveSection() {
    const sections = document.querySelectorAll('.faq-category, .search-section, .support-section');
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
 * Add accessibility improvements to the page
 */
function enhanceAccessibility() {
    // Add skip to content link for keyboard users
    const skipLink = document.createElement('a');
    skipLink.href = '#search';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add ARIA roles to sections
    document.querySelectorAll('.faq-category').forEach(category => {
        category.setAttribute('role', 'region');
        const categoryId = category.getAttribute('id');
        const headingText = category.querySelector('h3').textContent;
        category.setAttribute('aria-labelledby', `heading-${categoryId}`);
        category.querySelector('h3').setAttribute('id', `heading-${categoryId}`);
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
 * Function to initialize category filters
 * Adds filter buttons to quickly navigate between categories
 */
function initCategoryFilters() {
    // Create filter bar
    const filterBar = document.createElement('div');
    filterBar.className = 'category-filters';
    filterBar.innerHTML = `
        <div class="filter-title">Filter by Category:</div>
        <div class="filter-buttons"></div>
    `;

    // Get categories
    const categories = document.querySelectorAll('.faq-category');
    const filterButtons = filterBar.querySelector('.filter-buttons');

    // Add "All" button
    const allButton = document.createElement('button');
    allButton.className = 'filter-btn active';
    allButton.textContent = 'All';
    allButton.setAttribute('data-filter', 'all');
    filterButtons.appendChild(allButton);

    // Add button for each category
    categories.forEach(category => {
        const categoryId = category.getAttribute('id');
        const categoryName = category.querySelector('h3').textContent;

        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = categoryName;
        button.setAttribute('data-filter', categoryId);

        filterButtons.appendChild(button);
    });

    // Add event listeners to filter buttons
    const filterBtns = filterBar.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            if (filter === 'all') {
                // Show all categories
                categories.forEach(cat => {
                    cat.style.display = 'block';
                });
            } else {
                // Hide all categories
                categories.forEach(cat => {
                    cat.style.display = 'none';
                });

                // Show selected category
                document.getElementById(filter).style.display = 'block';

                // Scroll to the category
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                window.scrollTo({
                    top: document.getElementById(filter).offsetTop - headerHeight - 20,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Insert filter bar after search section
    const searchSection = document.querySelector('.search-section');
    searchSection.after(filterBar);

    // Add filter bar styles
    const filterStyles = document.createElement('style');
    filterStyles.textContent = `
        .category-filters {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-lg);
            padding: var(--spacing-md);
            background-color: var(--light-navy);
            border-radius: var(--radius-md);
        }
        
        .filter-title {
            font-weight: 500;
            color: var(--navy);
            margin-right: var(--spacing-sm);
        }
        
        .filter-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-xs);
        }
        
        .filter-btn {
            border: none;
            background-color: var(--white);
            color: var(--navy);
            padding: 0.8rem 1.5rem;
            border-radius: var(--radius-md);
            font-family: var(--body-font);
            font-size: 1.4rem;
            cursor: pointer;
            transition: all var(--transition-normal);
        }
        
        .filter-btn:hover {
            background-color: var(--light-teal);
            color: var(--teal);
        }
        
        .filter-btn.active {
            background-color: var(--teal);
            color: var(--white);
        }
        
        .dark-mode .filter-btn {
            background-color: rgba(42, 63, 88, 0.3);
            color: var(--white);
        }
        
        .dark-mode .filter-btn:hover {
            background-color: var(--light-teal);
            color: var(--navy);
        }
        
        .dark-mode .filter-btn.active {
            background-color: var(--teal);
            color: var(--white);
        }
        
        @media (max-width: 768px) {
            .category-filters {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .filter-buttons {
                width: 100%;
                overflow-x: auto;
                padding-bottom: var(--spacing-xs);
                flex-wrap: nowrap;
            }
            
            .filter-btn {
                white-space: nowrap;
            }
        }
    `;
    document.head.appendChild(filterStyles);
}

/**
 * Function to update FAQ counter
 * Shows the total number of FAQ items
 */
function updateFaqCounter() {
    const faqItems = document.querySelectorAll('.faq-item');
    const totalItems = faqItems.length;

    const counterContainer = document.createElement('div');
    counterContainer.className = 'faq-counter';
    counterContainer.innerHTML = `<span>${totalItems}</span> Frequently Asked Questions`;

    // Insert after FAQ categories heading
    const faqCategoriesHeading = document.querySelector('.faq-categories > h2');
    faqCategoriesHeading.after(counterContainer);

    // Add counter styles
    const counterStyles = document.createElement('style');
    counterStyles.textContent = `
        .faq-counter {
            text-align: center;
            margin-bottom: var(--spacing-md);
            color: var(--navy-80);
            font-size: 1.6rem;
        }
        
        .faq-counter span {
            color: var(--teal);
            font-weight: 600;
            font-size: 1.8rem;
        }
    `;
    document.head.appendChild(counterStyles);
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

        // Update accordion answer heights
        const expandedAccordions = document.querySelectorAll('.accordion-toggle[aria-expanded="true"]');
        expandedAccordions.forEach(toggle => {
            const answerId = toggle.getAttribute('aria-controls');
            const answerElement = document.getElementById(answerId);
            answerElement.style.maxHeight = answerElement.scrollHeight + 'px';
        });
    }, 250);
});
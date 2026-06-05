/**
 * Curis by Citrus - Patient Data Policy JavaScript
 * Provides interactive functionality and enhanced user experience
 * for the Data Policy page in the Curis platform.
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
    setupSearchFunctionality();
    setupPrintFunctionality();
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
        const tocContainer = document.createElement('nav');
        tocContainer.className = 'table-of-contents';
        tocContainer.setAttribute('aria-labelledby', 'toc-heading');

        const tocHeading = document.createElement('h2');
        tocHeading.id = 'toc-heading';
        tocHeading.textContent = 'Table of Contents';

        // Create the list
        const tocList = document.createElement('ul');
        tocList.id = 'toc-list';

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
            link.classList.add('toc-link');

            listItem.appendChild(link);

            // Check for subsections and add them if they exist
            const subSections = section.querySelectorAll('section[id]');

            if (subSections.length > 0) {
                const subList = document.createElement('ul');
                subList.classList.add('toc-sublist');

                subSections.forEach(subSection => {
                    const subSectionHeading = subSection.querySelector('h3');
                    if (!subSectionHeading) return;

                    const subSectionTitle = subSectionHeading.textContent;
                    const subSectionId = subSection.id;

                    const subListItem = document.createElement('li');
                    const subLink = document.createElement('a');

                    subLink.href = `#${subSectionId}`;
                    subLink.textContent = subSectionTitle;
                    subLink.classList.add('toc-sublink');

                    subListItem.appendChild(subLink);
                    subList.appendChild(subListItem);
                });

                listItem.appendChild(subList);
            }

            tocList.appendChild(listItem);
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

        tocContainer.appendChild(tocHeading);
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
}

/**
 * Handle TOC responsiveness
 * Controls TOC display based on screen width
 */
function handleTocResponsiveness() {
    const tocList = document.getElementById('toc-list');
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
            const tocLink = document.querySelector(`.table-of-contents a[href="#${id}"]`);

            if (tocLink) {
                if (entry.isIntersecting) {
                    // Remove active class from all links
                    document.querySelectorAll('.table-of-contents a').forEach(link => {
                        link.classList.remove('active');
                    });

                    // Add active class to the TOC link
                    tocLink.classList.add('active');

                    // Update URL without scrolling (only for main sections)
                    if (entry.target.parentElement.classList.contains('data-policy')) {
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

    // Make policy sections expandable/collapsible on mobile
    if (window.innerWidth < 768) {
        const sectionHeadings = document.querySelectorAll('main > article > section > h2');

        sectionHeadings.forEach(heading => {
            const section = heading.parentElement;

            if (!section) return;

            heading.classList.add('collapsible');
            heading.setAttribute('tabindex', '0');
            heading.setAttribute('role', 'button');
            heading.setAttribute('aria-expanded', 'true'); // Start expanded

            // Mark the section as having collapsible content
            section.classList.add('has-collapsible-content');

            // Add click handler
            heading.addEventListener('click', function () {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);

                section.classList.toggle('collapsed');
            });

            // Add keyboard handler
            heading.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }

    // Add button for printing the policy
    const printButton = document.createElement('button');
    printButton.className = 'print-policy';
    printButton.innerHTML = '<i class="fas fa-print"></i> Print Data Policy';
    printButton.addEventListener('click', function () {
        window.print();
    });

    // Add to end of policy
    document.querySelector('main > article').appendChild(printButton);
}

/**
 * Search Functionality
 * Allows users to search within the policy
 */
function setupSearchFunctionality() {
    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'policy-search';

    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.id = 'policy-search-input';
    searchInput.placeholder = 'Search in Data Policy...';
    searchInput.setAttribute('aria-label', 'Search in Data Policy');

    // Create search button
    const searchButton = document.createElement('button');
    searchButton.className = 'search-button';
    searchButton.innerHTML = '<i class="fas fa-search"></i>';
    searchButton.setAttribute('aria-label', 'Search');

    // Create search results area
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.id = 'search-results';
    searchResults.setAttribute('aria-live', 'polite');

    // Append elements to container
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);
    searchContainer.appendChild(searchResults);

    // Add to page - after policy header
    const article = document.querySelector('main > article');
    const policyHeader = article.querySelector('.policy-header');

    if (policyHeader) {
        article.insertBefore(searchContainer, policyHeader.nextSibling);
    }

    // Setup search functionality
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm.length < 2) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            clearHighlights();
            return;
        }

        // Search in policy text
        const policyText = document.querySelector('.data-policy');
        const allElements = policyText.querySelectorAll('p, li, h2, h3, h4');

        let results = [];

        allElements.forEach(element => {
            const text = element.textContent.toLowerCase();

            if (text.includes(searchTerm)) {
                // Create a result item
                const resultItem = {
                    text: element.textContent,
                    element: element
                };

                // If it's within a section, note that
                let section = element.closest('section[id]');
                if (section) {
                    const heading = section.querySelector('h2, h3, h4');
                    if (heading) {
                        resultItem.section = heading.textContent;
                        resultItem.sectionId = section.id;
                    }
                }

                results.push(resultItem);
            }
        });

        // Display results
        displaySearchResults(results, searchTerm);
    }

    // Use debounce to limit how often search is triggered when typing
    const debounce = (func, delay) => {
        let timeoutId;
        return function (...args) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    // Attach event listeners
    searchInput.addEventListener('input', debounce(performSearch, 300));
    searchButton.addEventListener('click', performSearch);

    // Search on Enter key
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // Handle search result clicks
    searchResults.addEventListener('click', function (e) {
        if (e.target.tagName === 'A' || e.target.parentElement.tagName === 'A') {
            e.preventDefault();

            // Get the target link
            const targetLink = e.target.tagName === 'A' ? e.target : e.target.parentElement;

            // Get the target element
            const targetId = targetLink.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Clear previous highlights
                clearHighlights();

                // Highlight the search term in the target element and its children
                highlightSearchTerm(searchInput.value, targetElement);

                // Expand the section if it's collapsed
                const parentSection = targetElement.closest('.has-collapsible-content');
                if (parentSection && parentSection.classList.contains('collapsed')) {
                    const heading = parentSection.querySelector('.collapsible');
                    if (heading) {
                        heading.setAttribute('aria-expanded', 'true');
                        parentSection.classList.remove('collapsed');
                    }
                }

                // Scroll to the element
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Add focus to the element
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();

                // Close search results
                searchResults.style.display = 'none';
            }
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', function (e) {
        if (!searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

/**
 * Display search results
 * @param {Array} results - Array of search result objects
 * @param {string} searchTerm - The search term
 */
function displaySearchResults(results, searchTerm) {
    const searchResults = document.getElementById('search-results');

    // Clear previous results
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.innerHTML = '<p>No results found for "' + searchTerm + '"</p>';
        searchResults.style.display = 'block';
        return;
    }

    // Create results list
    const resultsList = document.createElement('ul');

    // Limit to first 10 results to prevent overwhelming
    const limitedResults = results.slice(0, 10);

    limitedResults.forEach((result, index) => {
        const item = document.createElement('li');

        const link = document.createElement('a');
        link.href = '#';
        link.setAttribute('data-target', result.sectionId || result.element.id || '');

        // Create highlighted text
        const text = result.text;
        const highlightedText = text.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<mark>${match}</mark>`
        );

        // Trim long results
        const maxLength = 100;
        let displayText = highlightedText;

        if (text.length > maxLength) {
            // Find the position of the first match
            const lowerText = text.toLowerCase();
            const matchPos = lowerText.indexOf(searchTerm.toLowerCase());

            // Calculate start position for the excerpt
            let startPos = Math.max(0, matchPos - 40);

            // Adjust to not break words
            if (startPos > 0) {
                while (startPos > 0 && text[startPos] !== ' ') {
                    startPos--;
                }
            }

            // Calculate end position
            const endPos = Math.min(text.length, startPos + maxLength);

            // Create excerpt
            let excerpt = text.substring(startPos, endPos);

            // Add ellipsis if needed
            if (startPos > 0) {
                excerpt = '...' + excerpt;
            }

            if (endPos < text.length) {
                excerpt = excerpt + '...';
            }

            // Highlight the search term in the excerpt
            displayText = excerpt.replace(
                new RegExp(searchTerm, 'gi'),
                match => `<mark>${match}</mark>`
            );
        }

        link.innerHTML = displayText;

        if (result.section) {
            const sectionSpan = document.createElement('span');
            sectionSpan.className = 'result-section';
            sectionSpan.textContent = 'in ' + result.section;
            link.appendChild(sectionSpan);
        }

        item.appendChild(link);
        resultsList.appendChild(item);
    });

    // Show total count if there are more results
    if (results.length > 10) {
        const countItem = document.createElement('li');
        countItem.className = 'results-count';
        countItem.textContent = `Showing 10 of ${results.length} results`;
        resultsList.appendChild(countItem);
    }

    // Add to container
    searchResults.appendChild(resultsList);
    searchResults.style.display = 'block';
}

/**
 * Highlight search term in element and its children
 * @param {string} searchTerm - The search term
 * @param {Element} element - The element to highlight in
 */
function highlightSearchTerm(searchTerm, element) {
    // Don't search in child elements that are already processed
    if (element.getAttribute('data-highlighted') === 'true') {
        return;
    }

    // Process this element's text nodes
    highlightTextInElement(searchTerm, element);

    // Mark as processed
    element.setAttribute('data-highlighted', 'true');

    // Process child elements
    Array.from(element.children).forEach(child => {
        highlightSearchTerm(searchTerm, child);
    });
}

/**
 * Highlight text in a specific element
 * @param {string} searchTerm - The search term
 * @param {Element} element - The element to highlight in
 */
function highlightTextInElement(searchTerm, element) {
    // Only process elements that can contain text nodes directly
    if (element.nodeType !== Node.ELEMENT_NODE) {
        return;
    }

    // Skip certain elements
    const skipTags = ['SCRIPT', 'STYLE', 'MARK', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    if (skipTags.includes(element.tagName)) {
        return;
    }

    // Only highlight text nodes
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function (node) {
                // Skip empty text nodes and nodes in skipped elements
                if (node.nodeValue.trim() === '' || skipTags.includes(node.parentElement.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        },
        false
    );

    const regex = new RegExp(searchTerm, 'gi');

    let node;
    let textNodes = [];

    // Collect all text nodes
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }

    // Process each text node
    textNodes.forEach(textNode => {
        const text = textNode.nodeValue;

        // Reset regex state
        regex.lastIndex = 0;

        if (regex.test(text)) {
            // Reset regex for the replacement
            regex.lastIndex = 0;

            // Create a document fragment
            const fragment = document.createDocumentFragment();

            let lastIndex = 0;
            let match;

            // Find all matches
            while ((match = regex.exec(text)) !== null) {
                // Add text before match
                if (match.index > lastIndex) {
                    fragment.appendChild(document.createTextNode(
                        text.slice(lastIndex, match.index)
                    ));
                }

                // Add highlighted match
                const mark = document.createElement('mark');
                mark.textContent = match[0];
                mark.className = 'search-highlight';
                fragment.appendChild(mark);

                lastIndex = regex.lastIndex;
            }

            // Add remaining text
            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(
                    text.slice(lastIndex)
                ));
            }

            // Replace the text node with the fragment
            textNode.parentNode.replaceChild(fragment, textNode);
        }
    });
}

/**
 * Clear search highlights
 */
function clearHighlights() {
    // Remove data-highlighted attributes
    document.querySelectorAll('[data-highlighted="true"]').forEach(el => {
        el.removeAttribute('data-highlighted');
    });

    // Replace marks with their text content
    document.querySelectorAll('mark.search-highlight').forEach(mark => {
        const textNode = document.createTextNode(mark.textContent);
        mark.parentNode.replaceChild(textNode, mark);
    });
}

/**
 * Print Functionality
 * Enhances the print experience
 */
function setupPrintFunctionality() {
    // Add event listener for before print
    window.addEventListener('beforeprint', function () {
        // Expand all collapsible sections
        document.querySelectorAll('.has-collapsible-content').forEach(section => {
            section.classList.remove('collapsed');
        });

        document.querySelectorAll('.collapsible').forEach(heading => {
            heading.setAttribute('aria-expanded', 'true');
        });

        // Hide table of contents and search
        const toc = document.querySelector('.table-of-contents');
        if (toc) toc.style.display = 'none';

        const search = document.querySelector('.policy-search');
        if (search) search.style.display = 'none';

        // Hide print button
        const printButton = document.querySelector('.print-policy');
        if (printButton) printButton.style.display = 'none';

        // Add print-specific class to body
        document.body.classList.add('printing');
    });

    // Add event listener for after print
    window.addEventListener('afterprint', function () {
        // Restore previous state
        document.body.classList.remove('printing');

        // Show table of contents and search
        const toc = document.querySelector('.table-of-contents');
        if (toc) toc.style.display = '';

        const search = document.querySelector('.policy-search');
        if (search) search.style.display = '';

        // Show print button
        const printButton = document.querySelector('.print-policy');
        if (printButton) printButton.style.display = '';

        // Reset collapsible sections on mobile
        if (window.innerWidth < 768) {
            document.querySelectorAll('.collapsible').forEach(heading => {
                // Keep expanded state as it was before printing
            });
        }
    });
}

// Add CSS for new elements created by JavaScript
function addDynamicStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
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
        
        /* Table of Contents styles */
        .table-of-contents {
            margin: var(--spacing-xl) 0;
            padding: var(--spacing-md);
            background-color: var(--background-secondary);
            border-radius: var(--border-radius-md);
            border-left: 4px solid var(--accent-teal);
        }
        
        .table-of-contents h2 {
            margin-top: 0;
            border-bottom: none;
            font-size: 1.3rem;
        }
        
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
        
        #toc-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        #toc-list li {
            margin-bottom: var(--spacing-sm);
        }
        
        .toc-link {
            font-weight: 500;
        }
        
        .toc-sublist {
            list-style: none;
            padding-left: var(--spacing-lg);
            margin-top: var(--spacing-sm);
        }
        
        .toc-sublink {
            font-weight: normal;
            font-size: 0.9em;
        }
        
        .table-of-contents a.active {
            color: var(--secondary-orange);
            font-weight: bold;
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
        
        /* Search functionality styles */
        .policy-search {
            margin: var(--spacing-lg) 0;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            position: relative;
        }
        
        #policy-search-input {
            flex: 1;
            padding: var(--spacing-sm) var(--spacing-md);
            border: 1px solid var(--light-gray);
            border-radius: var(--border-radius-sm);
            font-size: 1rem;
            min-width: 200px;
        }
        
        .search-button {
            background-color: var(--accent-teal);
            color: white;
            border: none;
            border-radius: var(--border-radius-sm);
            padding: var(--spacing-sm) var(--spacing-md);
            margin-left: var(--spacing-sm);
            cursor: pointer;
        }
        
        .search-results {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: var(--background-primary);
            border: 1px solid var(--light-gray);
            border-radius: var(--border-radius-sm);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-top: var(--spacing-sm);
            z-index: 10;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .search-results ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .search-results li {
            padding: var(--spacing-sm) var(--spacing-md);
            border-bottom: 1px solid var(--light-gray);
        }
        
        .search-results li:last-child {
            border-bottom: none;
        }
        
        .search-results a {
            display: block;
            color: var(--text-primary);
            text-decoration: none;
        }
        
        .search-results a:hover {
            color: var(--accent-teal);
        }
        
        .search-results mark {
            background-color: rgba(0, 191, 165, 0.2);
            color: inherit;
            padding: 0 2px;
        }
        
        .result-section {
            display: block;
            font-size: 0.8em;
            color: var(--medium-gray);
            margin-top: var(--spacing-xs);
        }
        
        .results-count {
            text-align: center;
            font-style: italic;
            color: var(--medium-gray);
        }
        
        /* Collapsible section styles */
        .collapsible {
            cursor: pointer;
            position: relative;
        }
        
        .collapsible:after {
            content: '−';
            position: absolute;
            right: 0;
            transition: transform 0.3s;
        }
        
        .collapsible[aria-expanded="false"]:after {
            content: '+';
        }
        
        .has-collapsible-content.collapsed > *:not(h2) {
            display: none;
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
        
        .print-policy:hover {
            background-color: var(--primary-navy);
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
            
            #toc-list {
                display: none;
            }
            
            #toc-list.toc-expanded {
                display: block;
            }
            
            .policy-search {
                flex-direction: column;
                align-items: stretch;
            }
            
            #policy-search-input {
                margin-bottom: var(--spacing-sm);
            }
            
            .search-button {
                margin-left: 0;
                margin-bottom: var(--spacing-md);
            }
        }
    `;

    document.head.appendChild(styleElement);
}

// Call this function on DOMContentLoaded
document.addEventListener('DOMContentLoaded', addDynamicStyles);
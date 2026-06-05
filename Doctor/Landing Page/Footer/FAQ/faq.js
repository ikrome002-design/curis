/**
 * Curis FAQ JavaScript
 * Created: April 18, 2025
 * 
 * This file contains the JavaScript functionality for the Curis FAQ page,
 * including dark mode toggle, search functionality, FAQ item toggling,
 * and category navigation.
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

    // ---------- FAQ ITEM TOGGLING ----------
    const faqQuestions = document.querySelectorAll('.faq-question');

    // Add click event listener to each FAQ question
    faqQuestions.forEach(question => {
        question.addEventListener('click', function () {
            const parent = this.parentElement;

            // Check if this item is already active
            const isActive = parent.classList.contains('active');

            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = '0';
            });

            // If the clicked item wasn't active, open it
            if (!isActive) {
                parent.classList.add('active');
                const answer = parent.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + 'px';

                // Add this to the URL for direct linking
                const sectionId = parent.closest('.faq-section').id;
                const questionIndex = Array.from(parent.parentNode.children).indexOf(parent);
                history.replaceState(null, null, `#${sectionId}-q${questionIndex}`);
            }
        });
    });

    // Initial state - open the first FAQ item in each section by default if no hash
    if (!window.location.hash) {
        document.querySelectorAll('.faq-section').forEach(section => {
            const firstItem = section.querySelector('.faq-item');
            if (firstItem) {
                const question = firstItem.querySelector('.faq-question');
                const answer = firstItem.querySelector('.faq-answer');

                firstItem.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                question.classList.add('active');
            }
        });
    }

    // ---------- SEARCH FUNCTIONALITY ----------
    const searchInput = document.getElementById('faq-search');
    const searchButton = document.getElementById('search-button');

    // Function to handle search
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        // If search term is empty, show all items and sections
        if (searchTerm === '') {
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('hidden');
                item.classList.remove('search-result');
            });

            document.querySelectorAll('.faq-section').forEach(section => {
                section.style.display = 'block';
            });

            // Remove any highlighting
            removeHighlighting();
            return;
        }

        // Otherwise, filter items based on search term
        let hasResults = false;

        document.querySelectorAll('.faq-section').forEach(section => {
            let sectionHasMatch = false;

            section.querySelectorAll('.faq-item').forEach(item => {
                const question = item.querySelector('.faq-question').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();

                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    // Show this item
                    item.classList.remove('hidden');
                    item.classList.add('search-result');
                    sectionHasMatch = true;
                    hasResults = true;

                    // Expand this item
                    item.classList.add('active');
                    const answerElement = item.querySelector('.faq-answer');
                    answerElement.style.maxHeight = answerElement.scrollHeight + 'px';

                    // Highlight the search term
                    highlightSearchTerm(item, searchTerm);
                } else {
                    // Hide this item
                    item.classList.add('hidden');
                    item.classList.remove('search-result');
                    item.classList.remove('active');
                    const answerElement = item.querySelector('.faq-answer');
                    answerElement.style.maxHeight = '0';
                }
            });

            // Show/hide the entire section based on whether it has any matching items
            section.style.display = sectionHasMatch ? 'block' : 'none';
        });

        // If no results found, show a message
        const noResultsMessage = document.getElementById('no-results-message');
        if (!hasResults) {
            if (!noResultsMessage) {
                const messageElement = document.createElement('div');
                messageElement.id = 'no-results-message';
                messageElement.className = 'no-results';
                messageElement.innerHTML = `
                    <p>No results found for "${searchTerm}". Please try a different search term.</p>
                    <button id="clear-search" class="clear-search-button">Clear Search</button>
                `;

                // Add the message after the search bar
                const searchSection = document.querySelector('.search-section');
                searchSection.appendChild(messageElement);

                // Add click event to the clear button
                document.getElementById('clear-search').addEventListener('click', function () {
                    searchInput.value = '';
                    performSearch();
                });

                // Add CSS for no results message
                if (!document.getElementById('no-results-styles')) {
                    const noResultsStyles = document.createElement('style');
                    noResultsStyles.id = 'no-results-styles';
                    noResultsStyles.textContent = `
                        .no-results {
                            background-color: var(--white);
                            padding: var(--spacing-md);
                            border-radius: var(--border-radius-md);
                            margin-top: var(--spacing-md);
                            text-align: center;
                            box-shadow: var(--shadow-md);
                            animation: fadeIn 0.3s ease forwards;
                        }
                        .clear-search-button {
                            background-color: var(--accent-color);
                            color: white;
                            padding: var(--spacing-xs) var(--spacing-md);
                            border-radius: var(--border-radius-sm);
                            margin-top: var(--spacing-sm);
                            transition: background-color var(--transition-fast);
                        }
                        .clear-search-button:hover {
                            background-color: var(--secondary-color);
                        }
                    `;
                    document.head.appendChild(noResultsStyles);
                }
            }
        } else if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }

    // Function to highlight search terms in content
    function highlightSearchTerm(item, searchTerm) {
        // Remove any existing highlights
        item.querySelectorAll('.highlight').forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        });

        // Highlight in question
        const question = item.querySelector('.faq-question');
        highlightTextInElement(question, searchTerm);

        // Highlight in answer
        const answerContainer = item.querySelector('.faq-answer');
        const paragraphs = answerContainer.querySelectorAll('p, li');

        paragraphs.forEach(paragraph => {
            highlightTextInElement(paragraph, searchTerm);
        });
    }

    // Helper function to highlight search term in an element
    function highlightTextInElement(element, searchTerm) {
        const html = element.innerHTML;
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        element.innerHTML = html.replace(regex, '<span class="highlight">$1</span>');
    }

    // Helper function to escape regex special characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Function to remove all highlighting
    function removeHighlighting() {
        document.querySelectorAll('.highlight').forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        });
    }

    // Event listeners for search
    searchInput.addEventListener('input', throttle(performSearch, 300));

    searchButton.addEventListener('click', function () {
        performSearch();
    });

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // ---------- CATEGORY NAVIGATION ----------
    const categoryLinks = document.querySelectorAll('.faq-categories a');

    // Add smooth scroll to category links
    categoryLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Calculate position with offset for fixed header
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                // Scroll to the target section
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without refreshing the page
                history.pushState(null, null, targetId);

                // Update active link
                categoryLinks.forEach(link => link.classList.remove('active-category'));
                this.classList.add('active-category');
            }
        });
    });

    // Highlight active category based on scroll position
    function updateActiveCategory() {
        const scrollPosition = window.scrollY;
        const headerHeight = document.querySelector('header').offsetHeight;

        // Get all sections
        const sections = document.querySelectorAll('.faq-section');

        // Find the current section based on scroll position
        let currentSection = null;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSection = section;
            }
        });

        // If a current section is found, update the active category link
        if (currentSection) {
            const sectionId = currentSection.getAttribute('id');
            const correspondingLink = document.querySelector(`.faq-categories a[href="#${sectionId}"]`);

            if (correspondingLink) {
                // Remove active class from all links
                categoryLinks.forEach(link => link.classList.remove('active-category'));

                // Add active class to current link
                correspondingLink.classList.add('active-category');
            }
        }
    }

    // Add CSS for active category
    if (!document.getElementById('category-active-styles')) {
        const categoryActiveStyles = document.createElement('style');
        categoryActiveStyles.id = 'category-active-styles';
        categoryActiveStyles.textContent = `
            .faq-categories a.active-category {
                background-color: var(--accent-color);
                color: white;
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(categoryActiveStyles);
    }

    // Add scroll event listener to update active category
    window.addEventListener('scroll', throttle(updateActiveCategory, 100));

    // Initial call to highlight the correct category on page load
    setTimeout(updateActiveCategory, 100);

    // ---------- MOBILE NAVIGATION ----------
    function setupMobileNavigation() {
        // Only add mobile navigation if it doesn't already exist and window width is small
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-toggle')) {
            const header = document.querySelector('header');
            const nav = document.querySelector('nav');

            // Create mobile menu toggle button
            const mobileMenuToggle = document.createElement('button');
            mobileMenuToggle.className = 'mobile-menu-toggle';
            mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';

            // Insert mobile toggle button after logo
            const logoContainer = document.querySelector('.logo-container');
            header.insertBefore(mobileMenuToggle, logoContainer.nextSibling);

            // Add CSS for mobile menu
            if (!document.getElementById('mobile-menu-styles')) {
                const mobileMenuStyles = document.createElement('style');
                mobileMenuStyles.id = 'mobile-menu-styles';
                mobileMenuStyles.textContent = `
                    @media (max-width: 768px) {
                        header {
                            flex-wrap: wrap;
                            justify-content: space-between;
                        }
                        
                        .mobile-menu-toggle {
                            display: block;
                            font-size: 1.5rem;
                            color: var(--primary-color);
                            padding: var(--spacing-xs);
                            transition: color var(--transition-fast);
                        }
                        
                        .mobile-menu-toggle:hover {
                            color: var(--accent-color);
                        }
                        
                        nav {
                            flex-basis: 100%;
                            max-height: 0;
                            overflow: hidden;
                            transition: max-height var(--transition-normal);
                        }
                        
                        nav.mobile-active {
                            max-height: 300px;
                        }
                        
                        nav ul {
                            flex-direction: column;
                            align-items: flex-start;
                            width: 100%;
                        }
                        
                        nav ul li {
                            width: 100%;
                        }
                        
                        nav ul li a {
                            display: block;
                            width: 100%;
                            padding: var(--spacing-xs) 0;
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
                document.head.appendChild(mobileMenuStyles);
            }

            // Toggle mobile menu
            mobileMenuToggle.addEventListener('click', function () {
                nav.classList.toggle('mobile-active');

                if (nav.classList.contains('mobile-active')) {
                    this.innerHTML = '<i class="fas fa-times"></i>';
                } else {
                    this.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });

            // Close mobile menu when a link is clicked
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

    // Call on page load and when window is resized
    setupMobileNavigation();
    window.addEventListener('resize', throttle(setupMobileNavigation, 200));

    // ---------- STICKY CATEGORY NAV ----------
    // Function to make category nav sticky on scroll
    function setupStickyCategoryNav() {
        const categoryNav = document.querySelector('.category-nav');
        const categoryNavTop = categoryNav.offsetTop;
        const headerHeight = document.querySelector('header').offsetHeight;

        // Add CSS for sticky category nav
        if (!document.getElementById('sticky-nav-styles')) {
            const stickyNavStyles = document.createElement('style');
            stickyNavStyles.id = 'sticky-nav-styles';
            stickyNavStyles.textContent = `
                .category-nav.sticky {
                    position: sticky;
                    top: ${headerHeight + 10}px;
                    z-index: 90;
                    transition: top var(--transition-normal);
                }
            `;
            document.head.appendChild(stickyNavStyles);
        }

        // Check on scroll if we should make the nav sticky
        function checkStickyNav() {
            if (window.pageYOffset > categoryNavTop - headerHeight - 10) {
                categoryNav.classList.add('sticky');
            } else {
                categoryNav.classList.remove('sticky');
            }
        }

        window.addEventListener('scroll', throttle(checkStickyNav, 100));

        // Initial check
        checkStickyNav();
    }

    // Call after a slight delay to ensure layout is stabilized
    setTimeout(setupStickyCategoryNav, 200);

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
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                box-shadow: var(--shadow-md);
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px);
                transition: opacity 0.3s, transform 0.3s, background-color 0.3s, visibility 0.3s;
                z-index: 99;
            }
            .back-to-top.visible {
                opacity: 1;
                visibility: visible;
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
    function toggleBackToTop() {
        if (window.pageYOffset > 500) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', throttle(toggleBackToTop, 100));

    // Scroll to top when button is clicked
    backToTopButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ---------- KEYBOARD NAVIGATION ----------
    // Add keyboard navigation for accessibility
    document.addEventListener('keydown', function (e) {
        // Home key to scroll to top
        if (e.key === 'Home') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // End key to scroll to bottom
        if (e.key === 'End') {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }

        // Escape key to clear search
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            performSearch();
            searchInput.blur();
        }
    });

    // Add keyboard support for FAQ questions
    faqQuestions.forEach(question => {
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', question.parentElement.classList.contains('active') ? 'true' : 'false');

        question.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
                this.setAttribute('aria-expanded', this.parentElement.classList.contains('active') ? 'true' : 'false');
            }
        });
    });

    // ---------- ACCESSIBILITY IMPROVEMENTS ----------
    // Add proper ARIA attributes and roles
    document.querySelectorAll('.faq-section').forEach((section, index) => {
        section.setAttribute('role', 'region');
        section.setAttribute('aria-labelledby', `section-heading-${index}`);

        const heading = section.querySelector('h2');
        if (heading) {
            heading.id = `section-heading-${index}`;
        }
    });

    // Make FAQ answers have proper ARIA relationships
    document.querySelectorAll('.faq-item').forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        const questionId = `question-${index}`;
        const answerId = `answer-${index}`;

        question.id = questionId;
        answer.id = answerId;

        question.setAttribute('aria-controls', answerId);
        answer.setAttribute('aria-labelledby', questionId);
        answer.setAttribute('role', 'region');
    });

    // ---------- URL HASH HANDLING ----------
    // Handle direct linking to sections or questions
    function handleUrlHash() {
        if (window.location.hash) {
            const hash = window.location.hash.substring(1);

            // Check if it's a section
            const section = document.getElementById(hash);
            if (section && section.classList.contains('faq-section')) {
                setTimeout(() => {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = section.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update active category
                    const correspondingLink = document.querySelector(`.faq-categories a[href="#${hash}"]`);
                    if (correspondingLink) {
                        categoryLinks.forEach(link => link.classList.remove('active-category'));
                        correspondingLink.classList.add('active-category');
                    }
                }, 100);
            }

            // Check if it's a question (format: sectionId-qX)
            if (hash.includes('-q')) {
                const parts = hash.split('-q');
                if (parts.length === 2) {
                    const sectionId = parts[0];
                    const questionIndex = parseInt(parts[1]);

                    const section = document.getElementById(sectionId);
                    if (section) {
                        const question = section.querySelectorAll('.faq-item')[questionIndex];

                        if (question) {
                            setTimeout(() => {
                                // Scroll to the section
                                const headerHeight = document.querySelector('header').offsetHeight;
                                const targetPosition = question.offsetTop - headerHeight - 100;

                                window.scrollTo({
                                    top: targetPosition,
                                    behavior: 'smooth'
                                });

                                // Open the question
                                const questionElement = question.querySelector('.faq-question');
                                if (questionElement && !question.classList.contains('active')) {
                                    questionElement.click();
                                }

                                // Update active category
                                const correspondingLink = document.querySelector(`.faq-categories a[href="#${sectionId}"]`);
                                if (correspondingLink) {
                                    categoryLinks.forEach(link => link.classList.remove('active-category'));
                                    correspondingLink.classList.add('active-category');
                                }
                            }, 100);
                        }
                    }
                }
            }
        }
    }

    // Call on page load
    handleUrlHash();

    // Call when hash changes
    window.addEventListener('hashchange', handleUrlHash);

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
});
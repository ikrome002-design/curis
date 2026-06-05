/**
 * Curis FAQ Page JavaScript
 * This script handles all dynamic functionality for the FAQ page including:
 * - FAQ accordion toggle
 * - Search functionality
 * - Smooth scrolling to sections
 * - Dark mode toggle
 * - DOM-ready checks
 */

// Wait for DOM to be fully loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all main functionalities
    initFaqAccordion();
    initSearchFunctionality();
    initSmoothScrolling();
    initDarkModeToggle();
    handleContactSupportButton();
});

/**
 * Initialize FAQ Accordion functionality
 * Makes questions clickable to show/hide answers
 */
function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    // Add click event to each question
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            // Toggle active class on the parent faq-item
            const faqItem = question.parentElement;

            // Check if this item is already active
            const isActive = faqItem.classList.contains('active');

            // Close all other items first (optional - for accordion style)
            // document.querySelectorAll('.faq-item').forEach(item => {
            //     item.classList.remove('active');
            // });

            // Toggle active class on the clicked item
            if (isActive) {
                faqItem.classList.remove('active');
            } else {
                faqItem.classList.add('active');
            }

            // Toggle visibility of the answer
            const answer = faqItem.querySelector('.faq-answer');

            if (isActive) {
                // If it was active, hide the answer with a slide-up animation
                slideUp(answer);
            } else {
                // If it wasn't active, show the answer with a slide-down animation
                slideDown(answer);
            }
        });

        // Add accessibility attributes
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');
        question.setAttribute('tabindex', '0');

        // Add keyboard support for accessibility
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });

    // Initialize all answers as hidden
    document.querySelectorAll('.faq-answer').forEach(answer => {
        answer.style.display = 'none';
    });
}

/**
 * Slide down animation utility
 * @param {HTMLElement} element - The element to slide down
 * @param {number} duration - Animation duration in ms
 */
function slideDown(element, duration = 300) {
    // First set display to block but height to 0
    element.style.display = 'block';
    element.style.overflow = 'hidden';
    element.style.height = '0';
    element.style.paddingTop = '0';
    element.style.paddingBottom = '0';
    element.style.marginTop = '0';
    element.style.marginBottom = '0';
    element.style.transition = `height ${duration}ms ease-in-out, padding ${duration}ms ease-in-out, margin ${duration}ms ease-in-out`;

    // Get the height of the element's inner content
    const height = element.scrollHeight;

    // Set the element's height to the height of its inner content
    requestAnimationFrame(() => {
        element.style.height = `${height}px`;
        element.style.paddingTop = '';
        element.style.paddingBottom = '';
        element.style.marginTop = '';
        element.style.marginBottom = '';
    });

    // Remove the height property after the transition
    window.setTimeout(() => {
        element.style.height = '';
        element.style.overflow = '';
        element.style.transition = '';

        // Update ARIA attributes
        const question = element.parentElement.querySelector('.faq-question');
        if (question) {
            question.setAttribute('aria-expanded', 'true');
        }
    }, duration);
}

/**
 * Slide up animation utility
 * @param {HTMLElement} element - The element to slide up
 * @param {number} duration - Animation duration in ms
 */
function slideUp(element, duration = 300) {
    // Set the element's height to its current pixel height
    element.style.overflow = 'hidden';
    element.style.height = `${element.offsetHeight}px`;
    element.style.transition = `height ${duration}ms ease-in-out, padding ${duration}ms ease-in-out, margin ${duration}ms ease-in-out`;

    // On the next frame, set the height to 0
    requestAnimationFrame(() => {
        element.style.height = '0';
        element.style.paddingTop = '0';
        element.style.paddingBottom = '0';
        element.style.marginTop = '0';
        element.style.marginBottom = '0';
    });

    // Hide the element after the transition
    window.setTimeout(() => {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
        element.style.transition = '';
        element.style.paddingTop = '';
        element.style.paddingBottom = '';
        element.style.marginTop = '';
        element.style.marginBottom = '';

        // Update ARIA attributes
        const question = element.parentElement.querySelector('.faq-question');
        if (question) {
            question.setAttribute('aria-expanded', 'false');
        }
    }, duration);
}

/**
 * Initialize search functionality
 * Filters FAQ items based on user search
 */
function initSearchFunctionality() {
    const searchInput = document.getElementById('faq-search');
    const searchForm = searchInput.closest('form');

    // Handle form submission (prevent default and perform search)
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch(searchInput.value);
    });

    // Also search as typing (debounced)
    let debounceTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            performSearch(searchInput.value);
        }, 300); // Wait 300ms after typing stops before searching
    });
}

/**
 * Perform search on FAQ items
 * @param {string} query - The search query
 */
function performSearch(query) {
    // Normalize the query (lowercase, trim whitespace)
    query = query.toLowerCase().trim();

    // If query is empty, show all FAQs and categories
    if (!query) {
        resetSearch();
        return;
    }

    // Get all FAQ items and categories
    const faqItems = document.querySelectorAll('.faq-item');
    const faqCategories = document.querySelectorAll('.faq-category');

    // Track which categories have matching items
    const categoriesWithMatches = new Set();

    // Count total matches for summary
    let matchCount = 0;

    // Check each FAQ item for match
    faqItems.forEach(item => {
        const questionText = item.querySelector('.faq-question').textContent.toLowerCase();
        const answerText = item.querySelector('.faq-answer').textContent.toLowerCase();

        // Check if the query is found in the question or answer
        if (questionText.includes(query) || answerText.includes(query)) {
            // Show this item
            item.style.display = 'block';

            // If not already active, activate it to show the answer
            if (!item.classList.contains('active')) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.display = 'block';
                answer.style.height = '';

                // Highlight matching text
                highlightMatches(item, query);
            }

            // Track that this category has a match
            const parentCategory = item.closest('.faq-category');
            if (parentCategory) {
                categoriesWithMatches.add(parentCategory.id);
            }

            matchCount++;
        } else {
            // Hide this item
            item.style.display = 'none';
        }
    });

    // Hide categories with no matches
    faqCategories.forEach(category => {
        if (categoriesWithMatches.has(category.id)) {
            category.style.display = 'block';

            // Update heading to show search context
            const heading = category.querySelector('h2');
            if (heading && !heading.querySelector('.search-context')) {
                const originalText = heading.textContent;
                heading.innerHTML = `${originalText} <span class="search-context">(${matchCount} result${matchCount !== 1 ? 's' : ''})</span>`;
            }
        } else {
            category.style.display = 'none';
        }
    });

    // Show search notification
    showSearchNotification(matchCount, query);
}

/**
 * Highlight matching text in FAQ items
 * @param {HTMLElement} faqItem - The FAQ item element
 * @param {string} query - The search query to highlight
 */
function highlightMatches(faqItem, query) {
    // Remove any existing highlights first
    removeHighlights(faqItem);

    // Helper function to wrap matches in highlight span
    const highlightText = (node, regex) => {
        if (node.nodeType === 3) { // Text node
            const match = node.nodeValue.match(regex);
            if (match) {
                const span = document.createElement('span');
                span.className = 'highlight';

                // Split on the match and create highlighted version
                const parts = node.nodeValue.split(regex);

                // Create a document fragment to hold the new nodes
                const fragment = document.createDocumentFragment();

                // Add each part with highlights for matches
                for (let i = 0; i < parts.length; i++) {
                    if (parts[i]) {
                        fragment.appendChild(document.createTextNode(parts[i]));
                    }

                    // If not the last part, add a highlight
                    if (i < parts.length - 1) {
                        const highlight = document.createElement('span');
                        highlight.className = 'highlight';
                        highlight.textContent = match[0];
                        fragment.appendChild(highlight);
                    }
                }

                // Replace the original node with the fragment
                node.parentNode.replaceChild(fragment, node);
                return true;
            }
        } else if (node.nodeType === 1 && !node.classList.contains('highlight')) { // Element node
            // Skip script and style elements
            if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'].includes(node.tagName)) {
                return false;
            }

            // Process child nodes
            Array.from(node.childNodes).forEach(child => {
                highlightText(child, regex);
            });
        }
        return false;
    };

    // Create a regex that's case insensitive
    const regex = new RegExp(query, 'gi');

    // Apply highlighting to question and answer
    highlightText(faqItem.querySelector('.faq-question'), regex);
    highlightText(faqItem.querySelector('.faq-answer'), regex);
}

/**
 * Remove highlights from FAQ item
 * @param {HTMLElement} element - The element to remove highlights from
 */
function removeHighlights(element) {
    // Find all highlight spans
    const highlights = element.querySelectorAll('.highlight');

    // Replace each with its text content
    highlights.forEach(highlight => {
        const textNode = document.createTextNode(highlight.textContent);
        highlight.parentNode.replaceChild(textNode, highlight);
    });
}

/**
 * Show search notification with result count
 * @param {number} count - Number of results found
 * @param {string} query - The search query
 */
function showSearchNotification(count, query) {
    // Check if notification already exists, remove if it does
    const existingNotification = document.querySelector('.search-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'search-notification';

    // Set notification message based on results
    if (count > 0) {
        notification.textContent = `Found ${count} result${count !== 1 ? 's' : ''} for "${query}"`;
        notification.classList.add('success');
    } else {
        notification.textContent = `No results found for "${query}". Try a different search term.`;
        notification.classList.add('error');
    }

    // Add to page
    const searchSection = document.getElementById('search');
    searchSection.querySelector('.container').appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

/**
 * Reset search to show all FAQ items
 */
function resetSearch() {
    // Show all FAQ items and categories
    document.querySelectorAll('.faq-item').forEach(item => {
        item.style.display = 'block';
        item.classList.remove('active');

        // Hide answers
        const answer = item.querySelector('.faq-answer');
        answer.style.display = 'none';

        // Remove any highlights
        removeHighlights(item);
    });

    // Show all categories
    document.querySelectorAll('.faq-category').forEach(category => {
        category.style.display = 'block';

        // Reset headings (remove search context)
        const heading = category.querySelector('h2');
        const searchContext = heading.querySelector('.search-context');
        if (searchContext) {
            searchContext.remove();
        }
    });

    // Remove search notification if it exists
    const notification = document.querySelector('.search-notification');
    if (notification) {
        notification.remove();
    }
}

/**
 * Initialize smooth scrolling for navigation links
 */
function initSmoothScrolling() {
    // Get all navigation links that point to section IDs
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Get the target element
            const targetId = link.getAttribute('href');

            // Skip if it's just "#" (to avoid scrolling to top)
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            // If target element exists, scroll to it
            if (targetElement) {
                e.preventDefault();

                // Get the offset position of the target
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;

                // Get header height for offset
                const headerHeight = document.querySelector('header').offsetHeight;

                // Scroll with smooth behavior
                window.scrollTo({
                    top: offsetTop - headerHeight - 20, // Subtract header height plus a little extra space
                    behavior: 'smooth'
                });

                // Update URL without page jump
                history.pushState(null, null, targetId);

                // If in mobile view, close the categories navigation
                const categoriesNav = document.querySelector('.categories-navigation');
                if (window.innerWidth < 768 && categoriesNav.classList.contains('active')) {
                    categoriesNav.classList.remove('active');
                }
            }
        });
    });

    // Check for hash in URL on page load and scroll to it
    if (window.location.hash) {
        setTimeout(() => {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;

                window.scrollTo({
                    top: offsetTop - headerHeight - 20,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
}

/**
 * Initialize dark mode toggle functionality
 */
function initDarkModeToggle() {
    const darkModeBtn = document.getElementById('dark-mode-btn');

    // Check for saved preference in localStorage
    const savedDarkMode = localStorage.getItem('darkMode');

    // If a preference is saved, apply it
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Add click event to toggle dark mode
    darkModeBtn.addEventListener('click', () => {
        // Toggle dark mode class on body
        document.body.classList.toggle('dark-mode');

        // Save preference to localStorage
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    });
}

/**
 * Handle "Contact Support" button click
 */
function handleContactSupportButton() {
    const contactBtn = document.querySelector('.btn-contact-support');

    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Could open a modal, redirect, or perform another action
            // For now, we'll show an alert
            alert('Support contact functionality will be implemented in the future. Please email support@citruslabs.co.ke for assistance.');

            // In a real implementation, you might show a contact form modal:
            // showContactModal();
        });
    }
}

/**
 * Handle window resize events for responsive behavior
 */
window.addEventListener('resize', () => {
    // Any resize-specific logic can go here
    // For example, collapsing navigation on mobile
});

/**
 * Handle scroll events for sticky header and scroll-to-top functionality
 */
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add 'sticky' class to header when scrolled
    if (scrollTop > 100) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
});

/**
 * Auto-expand FAQ item based on URL hash
 * This helps when someone shares a direct link to a specific FAQ
 */
function handleUrlHash() {
    if (window.location.hash) {
        const faqItem = document.querySelector(window.location.hash);
        if (faqItem && faqItem.classList.contains('faq-item')) {
            // Expand this FAQ item
            faqItem.classList.add('active');
            const answer = faqItem.querySelector('.faq-answer');
            if (answer) {
                answer.style.display = 'block';
            }

            // Update ARIA attribute
            const question = faqItem.querySelector('.faq-question');
            if (question) {
                question.setAttribute('aria-expanded', 'true');
            }
        }
    }
}

// Call the URL hash handler once DOM is loaded
document.addEventListener('DOMContentLoaded', handleUrlHash);
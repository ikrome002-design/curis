// FAQ Page JavaScript
// Curis by Citrus Labs - Super Administrator FAQ Hub

document.addEventListener('DOMContentLoaded', function() {
    // Element References
    const faqCategories = document.querySelectorAll('.faq-category');
    const categoryToggles = document.querySelectorAll('.category-toggle');
    const popularQuestions = document.querySelectorAll('.popular-question-item');
    const questionToggles = document.querySelectorAll('.question-toggle');
    const feedbackButtons = document.querySelectorAll('.feedback-btn');
    const interactiveIcons = document.querySelectorAll('.icon-item');
    const searchInput = document.getElementById('faqSearch');
    const clearSearchBtn = document.getElementById('clearSearch');
    const searchForm = document.getElementById('faqSearchForm');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const ticketModal = document.getElementById('submitTicketModal');
    const ticketForm = document.getElementById('ticketForm');
    const ticketModalClose = ticketModal.querySelector('.close-modal');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Search functionality configuration
    let searchTimeout;
    const SEARCH_DELAY = 300; // milliseconds

    // Initialize the page
    function init() {
        setupEventListeners();
        checkDarkModePreference();
        setupSearchFunctionality();
        setupModalFunctionality();
        setupFeedbackHandling();
        setupInteractiveIcons();
        setupBackToTopButton();
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Category toggle buttons
        categoryToggles.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                toggleCategory(this.parentElement);
            });
        });

        // Popular question toggles
        popularQuestions.forEach(item => {
            const questionBtn = item.querySelector('.question-toggle');
            if (questionBtn) {
                questionBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    togglePopularQuestion(item);
                });
            }
        });

        // FAQ question toggles inside categories
        faqCategories.forEach(category => {
            const questions = category.querySelectorAll('.faq-question');
            questions.forEach(question => {
                const questionBtn = question.querySelector('.question-toggle');
                if (questionBtn) {
                    questionBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        toggleQuestion(question);
                    });
                }
            });
        });

        // Dark mode toggle
        darkModeToggle.addEventListener('click', toggleDarkMode);

        // Back to top button
        backToTopBtn.addEventListener('click', scrollToTop);
        window.addEventListener('scroll', handleScroll);

        // Form submissions
        if (ticketForm) {
            ticketForm.addEventListener('submit', handleTicketSubmit);
        }

        // Quick links that open ticket modal
        const ticketLinks = document.querySelectorAll('[href="#submit-ticket"]');
        ticketLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                openTicketModal();
            });
        });
    }

    // Toggle category expansion
    function toggleCategory(category) {
        const isActive = category.classList.contains('active');
        
        // If clicking on already active category, collapse it
        if (isActive) {
            category.classList.remove('active');
            return;
        }

        // Collapse all categories first (optional behavior - remove if you want multiple open)
        // faqCategories.forEach(cat => cat.classList.remove('active'));
        
        // Expand clicked category
        category.classList.add('active');
        
        // Scroll to category if needed
        const offset = 100; // Header height
        const elementPosition = category.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Toggle popular question answer visibility
    function togglePopularQuestion(questionItem) {
        const isActive = questionItem.classList.contains('active');
        
        // Toggle current item
        questionItem.classList.toggle('active');
        
        // Optionally close other questions (uncomment if desired)
        /*
        if (!isActive) {
            popularQuestions.forEach(item => {
                if (item !== questionItem) {
                    item.classList.remove('active');
                }
            });
        }
        */
    }

    // Toggle individual question within categories
    function toggleQuestion(question) {
        const questionItem = question.closest('.faq-question');
        const answer = question.querySelector('.answer');
        const isActive = questionItem.classList.contains('active');
        
        questionItem.classList.toggle('active');
        
        // Add/remove answer visibility
        if (!isActive) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
            answer.style.maxHeight = 0;
        }
    }

    // Handle feedback button clicks
    function setupFeedbackHandling() {
        feedbackButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                handleFeedback(this);
            });
        });
    }

    function handleFeedback(button) {
        const feedbackType = button.dataset.feedback;
        const answerContainer = button.closest('.answer');
        const feedbackContainer = button.closest('.answer-feedback');
        
        // Create feedback message
        const message = document.createElement('div');
        message.className = 'feedback-message';
        
        if (feedbackType === 'yes') {
            message.innerHTML = '<i class="fas fa-check-circle"></i> Thank you for your feedback!';
            message.style.color = 'var(--success-color)';
        } else {
            message.innerHTML = '<i class="fas fa-exclamation-circle"></i> We\'re sorry this wasn\'t helpful. Please <a href="#submit-ticket">contact support</a> for further assistance.';

            message.style.color = 'var(--error-color)';
        }
        
        // Replace feedback buttons with message
        feedbackContainer.innerHTML = '';
        feedbackContainer.appendChild(message);
        
        // Simulate sending feedback to server
        console.log(`Feedback submitted: ${feedbackType} for question in:`, answerContainer);
    }

    // Setup search functionality
    function setupSearchFunctionality() {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });

        searchInput.addEventListener('input', function() {
            // Show/hide clear button
            if (this.value.trim()) {
                clearSearchBtn.classList.add('show');
            } else {
                clearSearchBtn.classList.remove('show');
                clearSearch();
            }

            // Debounce search
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, SEARCH_DELAY);
        });

        clearSearchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            clearSearch();
        });
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (!searchTerm) {
            clearSearch();
            return;
        }

        let hasResults = false;

        // Search through all categories and questions
        faqCategories.forEach(category => {
            let categoryHasMatch = false;
            const questions = category.querySelectorAll('.faq-question');
            
            questions.forEach(question => {
                const questionText = question.querySelector('.question-toggle').textContent.toLowerCase();
                const answerText = question.querySelector('.answer').textContent.toLowerCase();
                
                if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
                    question.style.display = 'block';
                    categoryHasMatch = true;
                    hasResults = true;
                    
                    // Highlight search term
                    highlightSearchTerm(question, searchTerm);
                } else {
                    question.style.display = 'none';
                }
            });
            
            // Show category if it has matching questions
            if (categoryHasMatch) {
                category.style.display = 'block';
                if (!category.classList.contains('active')) {
                    category.classList.add('active');
                }
            } else {
                category.style.display = 'none';
            }
        });

        // Show no results message if needed
        if (!hasResults) {
            showNoResultsMessage();
        } else {
            removeNoResultsMessage();
        }
    }

    function clearSearch() {
        searchInput.value = '';
        clearSearchBtn.classList.remove('show');
        
        // Reset all questions and categories
        faqCategories.forEach(category => {
            category.style.display = 'block';
            const questions = category.querySelectorAll('.faq-question');
            questions.forEach(question => {
                question.style.display = 'block';
                // Remove highlighting
                removeHighlights(question);
            });
        });
        
        removeNoResultsMessage();
    }

    function highlightSearchTerm(element, term) {
        // Remove existing highlights
        removeHighlights(element);
        
        const textNodes = getTextNodes(element);
        const regex = new RegExp(escapeRegExp(term), 'gi');
        
        textNodes.forEach(node => {
            const matches = [...node.textContent.matchAll(regex)];
            
            if (matches.length > 0) {
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                
                matches.forEach(match => {
                    const startIndex = match.index;
                    const endIndex = startIndex + match[0].length;
                    
                    // Add text before the match
                    if (startIndex > lastIndex) {
                        fragment.appendChild(document.createTextNode(node.textContent.slice(lastIndex, startIndex)));
                    }
                    
                    // Add highlighted match
                    const highlight = document.createElement('span');
                    highlight.className = 'search-highlight';
                    highlight.textContent = node.textContent.slice(startIndex, endIndex);
                    fragment.appendChild(highlight);
                    
                    lastIndex = endIndex;
                });
                
                // Add remaining text
                if (lastIndex < node.textContent.length) {
                    fragment.appendChild(document.createTextNode(node.textContent.slice(lastIndex)));
                }
                
                node.parentNode.replaceChild(fragment, node);
            }
        });
    }

    function removeHighlights(element) {
        const highlights = element.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }

    function getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim().length > 0 && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE') {
                textNodes.push(node);
            }
        }
        
        return textNodes;
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function showNoResultsMessage() {
        removeNoResultsMessage();
        
        const message = document.createElement('div');
        message.className = 'no-results-message';
        message.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No results found</h3>
            <p>We couldn't find any questions matching "${searchInput.value}".</p>
            <p>Try using different keywords or browse the categories below.</p>
        `;
        
        const searchSection = document.querySelector('.faq-search-section');
        searchSection.appendChild(message);
    }

    function removeNoResultsMessage() {
        const message = document.querySelector('.no-results-message');
        if (message) {
            message.remove();
        }
    }

    // Setup interactive icons
    function setupInteractiveIcons() {
        interactiveIcons.forEach(icon => {
            icon.addEventListener('click', function() {
                const categoryId = this.dataset.category;
                const category = document.getElementById(`${categoryId}-${categoryId === 'general' ? 'information' : categoryId}`);
                
                if (category) {
                    // Expand category
                    category.classList.add('active');
                    
                    // Scroll to category
                    const offset = 100; // Header height
                    const elementPosition = category.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Highlight active icon
                    interactiveIcons.forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                }
            });
        });
    }

    // Setup back to top button
    function setupBackToTopButton() {
        window.addEventListener('scroll', handleScroll);
    }

    function handleScroll() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Setup modal functionality
    function setupModalFunctionality() {
        // Ticket modal close button
        if (ticketModalClose) {
            ticketModalClose.addEventListener('click', closeTicketModal);
        }

        // Close modal on outside click
        ticketModal.addEventListener('click', function(e) {
            if (e.target === ticketModal) {
                closeTicketModal();
            }
        });

        // ESC key to close modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && ticketModal.classList.contains('show')) {
                closeTicketModal();
            }
        });
    }

    function openTicketModal() {
        ticketModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeTicketModal() {
        ticketModal.classList.remove('show');
        document.body.style.overflow = '';
        ticketForm.reset();
    }

    function handleTicketSubmit(e) {
        e.preventDefault();
        
        // Basic form validation
        const name = document.getElementById('ticketName').value.trim();
        const email = document.getElementById('ticketEmail').value.trim();
        const subject = document.getElementById('ticketSubject').value.trim();
        const category = document.getElementById('ticketCategory').value;
        const priority = document.getElementById('ticketPriority').value;
        const description = document.getElementById('ticketDescription').value.trim();
        
        if (!name || !email || !subject || !category || !description) {
            showErrorMessage('Please fill in all required fields.');
            return;
        }
        
        // Simulate ticket submission
        showLoadingMessage();
        
        setTimeout(() => {
            showSuccessMessage();
            setTimeout(closeTicketModal, 2000);
        }, 1500);
    }

    function showErrorMessage(message) {
        removeMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-message error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        ticketForm.insertBefore(errorDiv, ticketForm.firstChild);
    }

    function showLoadingMessage() {
        removeMessages();
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'form-message loading';
        loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting ticket...';
        ticketForm.insertBefore(loadingDiv, ticketForm.firstChild);
        
        // Disable form
        const submitButton = ticketForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
    }

    function showSuccessMessage() {
        removeMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'form-message success';
        successDiv.innerHTML = '<i class="fas fa-check-circle"></i> Ticket submitted successfully!';
        ticketForm.insertBefore(successDiv, ticketForm.firstChild);
    }

    function removeMessages() {
        const messages = ticketForm.querySelectorAll('.form-message');
        messages.forEach(msg => msg.remove());
        
        // Re-enable submit button
        const submitButton = ticketForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
    }

    // Dark mode functionality
    function checkDarkModePreference() {
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    // Initialize everything
    init();
});

// Additional styles for dynamic elements (added via JS)
const dynamicStyles = `
    .search-highlight {
        background-color: rgba(0, 191, 165, 0.2);
        padding: 2px 4px;
        border-radius: 2px;
    }
    
    .no-results-message {
        text-align: center;
        padding: var(--space-xxl);
        margin: var(--space-xl) 0;
        background: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
    }
    
    .no-results-message i {
        font-size: 3rem;
        color: var(--accent-color);
        margin-bottom: var(--space-md);
    }
    
    .no-results-message h3 {
        margin-bottom: var(--space-sm);
    }
    
    .feedback-message {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        background-color: var(--neutral-light);
    }
    
    .feedback-message i {
        font-size: 1.2rem;
    }
    
    .form-message {
        padding: var(--space-md);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-md);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    }
    
    .form-message.error {
        background-color: rgba(255, 59, 48, 0.1);
        color: var(--error-color);
    }
    
    .form-message.success {
        background-color: rgba(52, 199, 89, 0.1);
        color: var(--success-color);
    }
    
    .form-message.loading {
        background-color: var(--neutral-light);
        color: var(--neutral-dark);
    }
    
    /* Dark mode styles for dynamic elements */
    .dark-mode .no-results-message {
        background: #1E1E1E;
        color: rgba(255, 255, 255, 0.87);
    }
    
    .dark-mode .feedback-message {
        background-color: #252525;
    }
`;

// Add dynamic styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = dynamicStyles;
document.head.appendChild(styleElement);
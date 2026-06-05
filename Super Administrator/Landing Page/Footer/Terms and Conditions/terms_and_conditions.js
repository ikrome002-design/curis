// ==========================================================
// CURIS TERMS AND CONDITIONS JAVASCRIPT
// Modern, Professional, Vibrant & User-Friendly Implementation
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {
    // ----------------
    // INITIALIZATION
    // ----------------
    initializeTableOfContents();
    initializeExpandableSections();
    initializeSearchFunctionality();
    initializeUpdateIndicator();
    initializeContactForm();
    initializeRemovalRequestButton();
    initializeVersionHistoryButton();
    initializeExportRequestButton();
    initializeEmailLegalButton();
    initializeBackToTopButton();
    initializeDarkMode();
    initializePopupHandlers();
    initializePrintFunctionality();
    
    // ----------------
    // TABLE OF CONTENTS NAVIGATION
    // ----------------
    function initializeTableOfContents() {
        const tocLinks = document.querySelectorAll('.table-of-contents a');
        
        tocLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // Account for fixed header height
                    const headerOffset = 80;
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Highlight the target section
                    targetSection.classList.add('highlighted');
                    setTimeout(() => {
                        targetSection.classList.remove('highlighted');
                    }, 2000);
                }
            });
        });
    }
    
    // ----------------
    // EXPANDABLE SECTIONS
    // ----------------
    function initializeExpandableSections() {
        const sectionHeaders = document.querySelectorAll('.section-header');
        
        sectionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const section = this.parentElement;
                section.classList.toggle('collapsed');
                
                // Update aria-expanded attribute for accessibility
                const isExpanded = !section.classList.contains('collapsed');
                this.setAttribute('aria-expanded', isExpanded);
            });
            
            // Initialize with all sections expanded
            header.setAttribute('aria-expanded', 'true');
        });
    }
    
    // ----------------
    // SEARCH FUNCTIONALITY
    // ----------------
    function initializeSearchFunctionality() {
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        
        // Handle search on button click
        searchButton.addEventListener('click', performSearch);
        
        // Handle search on Enter key
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        function performSearch() {
            const searchTerm = searchInput.value.trim().toLowerCase();
            
            if (!searchTerm) {
                alert('Please enter a search term');
                return;
            }
            
            // Clear previous highlights
            clearHighlights();
            
            let found = false;
            const sections = document.querySelectorAll('.expandable-section');
            
            sections.forEach(section => {
                const content = section.querySelector('.section-content');
                const text = content.textContent.toLowerCase();
                
                if (text.includes(searchTerm)) {
                    found = true;
                    
                    // Expand the section if collapsed
                    if (section.classList.contains('collapsed')) {
                        section.classList.remove('collapsed');
                        section.querySelector('.section-header').setAttribute('aria-expanded', 'true');
                    }
                    
                    // Highlight the search term within the content
                    highlightSearchTerm(content, searchTerm);
                    
                    // Scroll to the first match
                    if (!found || section === sections[0]) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            });
            
            if (!found) {
                alert('No results found for: ' + searchTerm);
            }
        }
        
        function highlightSearchTerm(element, term) {
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            let node;
            
            while (node = walker.nextNode()) {
                const text = node.textContent;
                const lowerText = text.toLowerCase();
                const index = lowerText.indexOf(term);
                
                if (index !== -1) {
                    const span = document.createElement('span');
                    span.className = 'search-highlight';
                    span.textContent = text.substring(index, index + term.length);
                    
                    const afterText = node.splitText(index);
                    afterText.textContent = afterText.textContent.substring(term.length);
                    node.parentNode.insertBefore(span, afterText);
                    walker.nextNode(); // Skip the span we just added
                }
            }
        }
        
        function clearHighlights() {
            const highlights = document.querySelectorAll('.search-highlight');
            highlights.forEach(highlight => {
                const parent = highlight.parentNode;
                parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                parent.normalize(); // Merge adjacent text nodes
            });
        }
    }
    
    // ----------------
    // UPDATE INDICATOR
    // ----------------
    function initializeUpdateIndicator() {
        const updateIndicator = document.getElementById('updated-indicator');
        
        updateIndicator.addEventListener('click', function() {
            showVersionHistoryPopup(true); // Show changes summary
        });
    }
    
    // ----------------
    // CONTACT FORM
    // ----------------
    function initializeContactForm() {
        const contactButton = document.getElementById('contact-us-button');
        const contactPopup = document.getElementById('contact-form-popup');
        const closeButton = document.getElementById('close-contact-form');
        const contactForm = document.getElementById('contact-form');
        
        contactButton.addEventListener('click', function() {
            contactPopup.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
        
        closeButton.addEventListener('click', function() {
            contactPopup.classList.add('hidden');
            document.body.style.overflow = '';
        });
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate form submission
            const formData = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                subject: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value
            };
            
            // In a real application, you would send this data to a server
            console.log('Form submitted:', formData);
            
            // Show success message (you could create a dedicated success popup)
            alert('Thank you for your message. We will get back to you soon!');
            
            // Close the popup and reset the form
            contactPopup.classList.add('hidden');
            document.body.style.overflow = '';
            contactForm.reset();
        });
    }
    
    // ----------------
    // CONTENT REMOVAL REQUEST
    // ----------------
    function initializeRemovalRequestButton() {
        const removalButton = document.getElementById('removal-request-button');
        
        if (removalButton) {
            removalButton.addEventListener('click', function() {
                // Create and show removal request popup (similar to contact form)
                showRemovalRequestPopup();
            });
        }
    }
    
    function showRemovalRequestPopup() {
        // For demonstration, we'll use the contact form popup structure
        const contactPopup = document.getElementById('contact-form-popup');
        const formTitle = contactPopup.querySelector('h2');
        const subjectField = document.getElementById('contact-subject');
        
        // Modify form for removal request
        formTitle.textContent = 'Content Removal Request';
        subjectField.value = 'content-removal';
        subjectField.disabled = true;
        
        contactPopup.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    // ----------------
    // VERSION HISTORY
    // ----------------
    function initializeVersionHistoryButton() {
        const versionButton = document.getElementById('version-history-button');
        
        if (versionButton) {
            versionButton.addEventListener('click', function() {
                showVersionHistoryPopup();
            });
        }
    }
    
    function showVersionHistoryPopup(showChanges = false) {
        const versionPopup = document.getElementById('version-history-popup');
        const versionList = document.getElementById('version-list');
        const closeButton = document.getElementById('close-version-history');
        
        // Mock version history data
        const versions = [
            {
                date: 'April 19, 2025',
                changes: [
                    'Updated privacy requirements',
                    'Added data export options',
                    'Clarified termination procedures'
                ],
                current: true
            },
            {
                date: 'March 1, 2025',
                changes: [
                    'Initial release',
                    'Established terms and conditions',
                    'Defined user responsibilities'
                ],
                current: false
            }
        ];
        
        // Clear previous content
        versionList.innerHTML = '';
        
        // If showing changes, display the latest changes
        if (showChanges) {
            const title = versionPopup.querySelector('h2');
            title.textContent = 'Recent Changes';
            
            const currentVersion = versions[0];
            const changesList = document.createElement('ul');
            currentVersion.changes.forEach(change => {
                const li = document.createElement('li');
                li.textContent = change;
                changesList.appendChild(li);
            });
            
            versionList.appendChild(changesList);
        } else {
            // Show full version history
            versions.forEach(version => {
                const versionDiv = document.createElement('div');
                versionDiv.className = 'version-item';
                
                const dateElement = document.createElement('h3');
                dateElement.textContent = version.date;
                if (version.current) {
                    dateElement.innerHTML += ' <span class="current-version">(Current)</span>';
                }
                
                const changesList = document.createElement('ul');
                version.changes.forEach(change => {
                    const li = document.createElement('li');
                    li.textContent = change;
                    changesList.appendChild(li);
                });
                
                if (!version.current) {
                    const viewButton = document.createElement('button');
                    viewButton.textContent = 'View This Version';
                    viewButton.className = 'view-version-button';
                    viewButton.addEventListener('click', function() {
                        // In a real application, this would load the historical version
                        alert('Loading version from ' + version.date);
                    });
                    versionDiv.appendChild(viewButton);
                }
                
                versionDiv.appendChild(dateElement);
                versionDiv.appendChild(changesList);
                versionList.appendChild(versionDiv);
            });
        }
        
        versionPopup.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        closeButton.addEventListener('click', function() {
            versionPopup.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }
    
    // ----------------
    // DATA EXPORT REQUEST
    // ----------------
    function initializeExportRequestButton() {
        const exportButton = document.getElementById('export-request-button');
        
        if (exportButton) {
            exportButton.addEventListener('click', function() {
                showExportRequestPopup();
            });
        }
    }
    
    function showExportRequestPopup() {
        // Create a custom popup for export request
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h2>Data Export Request</h2>
                <form id="export-request-form">
                    <div class="form-field">
                        <label for="export-format">Select Export Format:</label>
                        <select id="export-format" required>
                            <option value="">Choose format...</option>
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                    <div class="form-field">
                        <label for="export-date-range">Date Range:</label>
                        <select id="export-date-range" required>
                            <option value="">Select range...</option>
                            <option value="all">All data</option>
                            <option value="last30">Last 30 days</option>
                            <option value="last90">Last 90 days</option>
                            <option value="lastyear">Last year</option>
                        </select>
                    </div>
                    <button type="submit" class="submit-button">Generate Export</button>
                </form>
                <button class="close-button">Close</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        document.body.style.overflow = 'hidden';
        
        // Handle form submission
        const form = popup.querySelector('#export-request-form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const format = document.getElementById('export-format').value;
            const dateRange = document.getElementById('export-date-range').value;
            
            // Simulate export generation
            alert(`Generating ${format.toUpperCase()} export for ${dateRange === 'all' ? 'all data' : dateRange}. You will receive an email with the download link.`);
            
            popup.remove();
            document.body.style.overflow = '';
        });
        
        // Handle close button
        const closeButton = popup.querySelector('.close-button');
        closeButton.addEventListener('click', function() {
            popup.remove();
            document.body.style.overflow = '';
        });
    }
    
    // ----------------
    // EMAIL LEGAL TEAM
    // ----------------
    function initializeEmailLegalButton() {
        const emailButton = document.getElementById('email-legal-team-button');
        
        if (emailButton) {
            emailButton.addEventListener('click', function() {
                // Show the contact form with pre-selected legal inquiry
                const contactPopup = document.getElementById('contact-form-popup');
                const formTitle = contactPopup.querySelector('h2');
                const subjectField = document.getElementById('contact-subject');
                
                formTitle.textContent = 'Contact Legal Team';
                subjectField.value = 'terms-clarification';
                subjectField.disabled = true;
                
                contactPopup.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            });
        }
    }
    
    // ----------------
    // BACK TO TOP BUTTON
    // ----------------
    function initializeBackToTopButton() {
        const backToTopBtn = document.getElementById('backToTopBtn');
        
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ----------------
    // DARK MODE TOGGLE
    // ----------------
    function initializeDarkMode() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        
        // Check for saved preference
        const darkModePreference = localStorage.getItem('darkMode');
        if (darkModePreference === 'true') {
            document.body.classList.add('dark-mode');
            updateDarkModeButtonText(true);
        }
        
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            updateDarkModeButtonText(isDarkMode);
        });
        
        function updateDarkModeButtonText(isDarkMode) {
            const label = darkModeToggle.querySelector('.dark-mode-label');
            label.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
        }
    }
    
    // ----------------
    // POPUP HANDLERS
    // ----------------
    function initializePopupHandlers() {
        // Close popup when clicking outside
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('popup')) {
                const popup = e.target;
                popup.classList.add('hidden');
                document.body.style.overflow = '';
                
                // Reset form if it's a form popup
                const form = popup.querySelector('form');
                if (form) {
                    form.reset();
                }
            }
        });
        
        // Handle escape key to close popups
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const activePopup = document.querySelector('.popup:not(.hidden)');
                if (activePopup) {
                    activePopup.classList.add('hidden');
                    document.body.style.overflow = '';
                }
            }
        });
    }
    
    // ----------------
    // PRINT FUNCTIONALITY
    // ----------------
    function initializePrintFunctionality() {
        // Add a print button if desired
        const printButton = document.createElement('button');
        printButton.id = 'print-button';
        printButton.textContent = 'Print Version';
        printButton.className = 'content-button';
        
        // Insert after contact button
        const contactButton = document.getElementById('contact-us-button');
        contactButton.parentNode.insertBefore(printButton, contactButton.nextSibling);
        
        printButton.addEventListener('click', function() {
            window.print();
        });
        
        // Add PDF download button
        const pdfButton = document.createElement('button');
        pdfButton.id = 'pdf-button';
        pdfButton.textContent = 'Download PDF';
        pdfButton.className = 'content-button';
        
        printButton.parentNode.insertBefore(pdfButton, printButton.nextSibling);
        
        pdfButton.addEventListener('click', function() {
            // In a real application, this would generate a PDF
            alert('PDF download would be available in a production environment');
        });
    }
});

// Add CSS for search highlights
const style = document.createElement('style');
style.textContent = `
    .search-highlight {
        background-color: #ffeb3b;
        padding: 2px 0;
        border-radius: 3px;
    }
    
    .dark-mode .search-highlight {
        background-color: #544d00;
        color: white;
    }
    
    .current-version {
        font-size: 0.8em;
        color: var(--success-color);
        margin-left: 8px;
    }
    
    .version-item {
        margin-bottom: 20px;
        padding: 15px;
        background: var(--neutral-light);
        border-radius: var(--radius-md);
    }
    
    .version-item h3 {
        margin-top: 0;
    }
    
    .view-version-button {
        margin-top: 10px;
        background: var(--primary-gradient);
    }
    
    .highlighted {
        animation: highlightFlash 2s ease-out;
    }
    
    @keyframes highlightFlash {
        0% { background-color: transparent; }
        20% { background-color: var(--accent-gradient); }
        100% { background-color: transparent; }
    }
    
    #print-button, #pdf-button {
        margin-left: 10px;
        background: var(--secondary-gradient);
    }
`;
document.head.appendChild(style);
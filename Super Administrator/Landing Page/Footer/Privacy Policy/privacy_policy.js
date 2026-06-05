// ================================================
// CURIS PRIVACY POLICY - SUPER ADMINISTRATOR
// Dynamic JavaScript Functionality
// ================================================

// ----------------
// UTILITY FUNCTIONS & STATE MANAGEMENT
// ----------------
class PrivacyPolicyManager {
    constructor() {
        this.initDOMElements();
        this.initEventListeners();
        this.initIntersectionObserver();
        this.initCurrentState();
    }

    // Initialize DOM element references
    initDOMElements() {
        // Main containers
        this.container = document.querySelector('.privacy-policy-container');

        // Side menu elements
        this.sideMenu = document.querySelector('.side-menu');
        this.menuItems = document.querySelectorAll('.menu-item');

        // Search elements
        this.searchInput = document.getElementById('policySearch');
        this.searchButton = document.getElementById('searchBtn');

        // Update notifications
        this.updateBanner = document.querySelector('.update-banner');
        this.viewChangesBtn = document.getElementById('viewChangesBtn');

        // Quick access buttons
        this.privacyRightsBtn = document.getElementById('privacyRightsBtn');
        this.consentManagementBtn = document.getElementById('consentManagementBtn');
        this.dataAccessRequestBtn = document.getElementById('dataAccessRequestBtn');
        this.cookiePreferencesBtn = document.getElementById('cookiePreferencesBtn');

        // Popup panels
        this.panels = {
            privacyRights: document.getElementById('privacyRightsPanel'),
            consentManagement: document.getElementById('consentManagementPanel'),
            dataAccessRequest: document.getElementById('dataAccessRequestPanel'),
            cookiePreferences: document.getElementById('cookiePreferencesPanel'),
            changeSummary: document.getElementById('changeSummaryPopup'),
            versionHistory: document.getElementById('versionHistoryPanel'),
            withdrawConsent: document.getElementById('withdrawConsentDialog'),
            requestConfirmation: document.getElementById('requestConfirmation')
        };

        // Form elements
        this.consentSettingsForm = document.getElementById('consentSettingsForm');
        this.withdrawAllConsentBtn = document.getElementById('withdrawAllConsent');
        this.dataAccessRequestForm = document.getElementById('dataAccessRequestForm');
        this.saveCookiePreferencesBtn = document.getElementById('saveCookiePreferences');

        // Messages
        this.successMessage = document.getElementById('successMessage');
        this.errorMessage = document.getElementById('errorMessage');

        // Footer elements
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.backToTopBtn = document.getElementById('backToTopBtn');

        // Close buttons
        this.closePanelButtons = document.querySelectorAll('.close-panel');

        // Policy sections
        this.policySections = document.querySelectorAll('.policy-section');
    }

    // Initialize current state
    initCurrentState() {
        // Check for saved dark mode preference
        const darkModeStored = localStorage.getItem('darkMode');
        if (darkModeStored === 'true') {
            document.body.classList.add('dark-mode');
            this.updateDarkModeIcon();
        }

        // Initialize consent status
        this.consentStatus = {
            dataProcessing: true,
            marketing: true,
            analytics: true
        };

        // Initialize cookie preferences
        this.cookiePreferences = {
            necessary: true,
            analytics: true,
            marketing: false,
            thirdParty: false
        };

        // Load saved preferences if available
        this.loadSavedPreferences();
    }

    // Event Listeners
    initEventListeners() {
        // Side menu navigation
        this.menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleMenuNavigation(item);
            });
        });

        // Search functionality
        this.searchButton.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Quick access buttons
        this.privacyRightsBtn.addEventListener('click', () => this.openPanel('privacyRights'));
        this.consentManagementBtn.addEventListener('click', () => this.openPanel('consentManagement'));
        this.dataAccessRequestBtn.addEventListener('click', () => this.openPanel('dataAccessRequest'));
        this.cookiePreferencesBtn.addEventListener('click', () => this.openPanel('cookiePreferences'));

        // Update notifications
        this.viewChangesBtn.addEventListener('click', () => {
            this.openPanel('changeSummary');
        });

        // View previous version button
        document.getElementById('viewPreviousVersion')?.addEventListener('click', () => {
            this.closePanel('changeSummary');
            this.openPanel('versionHistory');
        });

        // Version history links
        document.querySelectorAll('.view-version').forEach(button => {
            button.addEventListener('click', () => {
                const version = button.dataset.version;
                this.displayHistoricalPolicy(version);
            });
        });

        // Forms
        this.consentSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleConsentSettings();
        });

        this.dataAccessRequestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDataAccessRequest();
        });

        // Consent withdrawal
        this.withdrawAllConsentBtn.addEventListener('click', () => {
            this.openPanel('withdrawConsent');
        });

        document.getElementById('confirmWithdrawConsent')?.addEventListener('click', () => {
            this.handleWithdrawAllConsent();
            this.closePanel('withdrawConsent');
        });

        document.getElementById('cancelWithdrawConsent')?.addEventListener('click', () => {
            this.closePanel('withdrawConsent');
        });

        // Cookie preferences
        this.saveCookiePreferencesBtn.addEventListener('click', () => {
            this.saveCookiePreferences();
        });

        // Dark mode toggle
        this.darkModeToggle.addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Back to top button
        window.addEventListener('scroll', () => {
            this.toggleBackToTopButton();
        });

        this.backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Close panel buttons
        this.closePanelButtons.forEach(button => {
            button.addEventListener('click', () => {
                const panel = button.closest('.popup-panel');
                this.closePanel(panel.id.replace('Panel', ''));
            });
        });

        // Close panel on outside click
        Object.values(this.panels).forEach(panel => {
            panel.addEventListener('click', (e) => {
                if (e.target === panel) {
                    this.closePanel(panel.id.replace('Panel', ''));
                }
            });
        });

        // Handle escape key to close panels
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activePanel = document.querySelector('.popup-panel.active');
                if (activePanel) {
                    this.closePanel(activePanel.id.replace('Panel', ''));
                }
            }
        });
    }

    // Intersection Observer for section highlighting
    initIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '-60px 0px 0px 0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.highlightActiveMenuItem(sectionId);
                }
            });
        }, options);

        this.policySections.forEach(section => {
            observer.observe(section);
        });
    }

    // --------------------
    // NAVIGATION METHODS
    // --------------------
    handleMenuNavigation(item) {
        // Remove active class from all items
        this.menuItems.forEach(menuItem => menuItem.classList.remove('active'));

        // Add active class to clicked item
        item.classList.add('active');

        // Smooth scroll to section
        const targetId = item.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            const offset = 80; // Account for sticky header
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    highlightActiveMenuItem(sectionId) {
        this.menuItems.forEach(item => {
            const href = item.getAttribute('href').substring(1);
            item.classList.toggle('active', href === sectionId);
        });
    }

    // --------------------
    // SEARCH FUNCTIONALITY
    // --------------------
    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase();

        if (!searchTerm) {
            this.showMessage('error', 'Please enter a search term');
            return;
        }

        let found = false;
        this.policySections.forEach(section => {
            const content = section.textContent.toLowerCase();

            if (content.includes(searchTerm)) {
                found = true;
                this.highlightAndScrollToSection(section);
                return;
            }
        });

        if (!found) {
            this.showMessage('error', 'No results found for your search');
        }
    }

    highlightAndScrollToSection(section) {
        // Highlight the section temporarily
        section.style.transition = 'background-color 0.3s ease';
        section.style.backgroundColor = 'rgba(0, 191, 165, 0.1)';

        // Scroll to section
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Remove highlight after a delay
        setTimeout(() => {
            section.style.backgroundColor = '';
        }, 2000);

        // Update menu active state
        const sectionId = section.id;
        this.highlightActiveMenuItem(sectionId);
    }

    // --------------------
    // PANEL MANAGEMENT
    // --------------------
    openPanel(panelName) {
        const panel = this.panels[panelName];
        if (panel) {
            panel.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    closePanel(panelName) {
        const panel = this.panels[panelName];
        if (panel) {
            panel.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    // --------------------
    // CONSENT MANAGEMENT
    // --------------------
    handleConsentSettings() {
        const form = this.consentSettingsForm;
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');

        let changes = [];
        checkboxes.forEach((checkbox, index) => {
            const consentType = ['dataProcessing', 'marketing', 'analytics'][index];
            const previousState = this.consentStatus[consentType];
            const newState = checkbox.checked;

            if (previousState !== newState) {
                changes.push(consentType);
                this.consentStatus[consentType] = newState;
            }
        });

        if (changes.length > 0) {
            this.saveConsentSettings();
            this.updateConsentUI();
            this.showMessage('success', 'Consent settings updated successfully');
        } else {
            this.showMessage('info', 'No changes were made to your consent settings');
        }

        this.closePanel('consentManagement');
    }

    saveConsentSettings() {
        localStorage.setItem('consentStatus', JSON.stringify(this.consentStatus));
    }

    updateConsentUI() {
        const consentItems = this.panels.consentManagement.querySelectorAll('.consent-status');
        consentItems.forEach((item, index) => {
            const consentType = ['dataProcessing', 'marketing', 'analytics'][index];
            const isActive = this.consentStatus[consentType];

            item.classList.toggle('active', isActive);
            item.textContent = isActive ? 'Active' : 'Inactive';
        });
    }

    handleWithdrawAllConsent() {
        // Set all consent to false
        Object.keys(this.consentStatus).forEach(key => {
            this.consentStatus[key] = false;
        });

        this.saveConsentSettings();
        this.updateConsentUI();
        this.updateConsentFormCheckboxes();

        this.showMessage('success', 'All consent has been withdrawn');
        this.closePanel('consentManagement');
    }

    updateConsentFormCheckboxes() {
        const form = this.consentSettingsForm;
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            const consentType = ['dataProcessing', 'marketing', 'analytics'][index];
            checkbox.checked = this.consentStatus[consentType];
        });
    }

    // --------------------
    // DATA ACCESS REQUEST
    // --------------------
    handleDataAccessRequest() {
        const form = this.dataAccessRequestForm;
        const formData = {
            name: form.requesterName.value,
            email: form.requesterEmail.value,
            requestType: form.requestType.value,
            verificationMethod: form.verificationMethod.value
        };

        // Validate form data
        if (!formData.name || !formData.email || !formData.requestType || !formData.verificationMethod) {
            this.showMessage('error', 'Please fill in all required fields');
            return;
        }

        // Generate reference number
        const referenceNumber = this.generateReferenceNumber();

        // Display confirmation
        this.showRequestConfirmation(referenceNumber);

        // Reset form
        form.reset();

        // Close request form panel
        this.closePanel('dataAccessRequest');
    }

    generateReferenceNumber() {
        const prefix = 'DAR';
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${prefix}-${timestamp}-${random}`;
    }

    showRequestConfirmation(referenceNumber) {
        const referenceElement = document.getElementById('referenceNumber');
        referenceElement.textContent = referenceNumber;
        this.openPanel('requestConfirmation');
    }

    // --------------------
    // COOKIE PREFERENCES
    // --------------------
    saveCookiePreferences() {
        const panel = this.panels.cookiePreferences;

        this.cookiePreferences = {
            necessary: true, // Always true and disabled
            analytics: panel.querySelector('.analytics-cookies input').checked,
            marketing: panel.querySelector('.marketing-cookies input').checked,
            thirdParty: panel.querySelector('.third-party-cookies input').checked
        };

        localStorage.setItem('cookiePreferences', JSON.stringify(this.cookiePreferences));
        this.showMessage('success', 'Cookie preferences saved successfully');
        this.closePanel('cookiePreferences');
    }

    // --------------------
    // VERSION HISTORY
    // --------------------
    displayHistoricalPolicy(version) {
        // In a real implementation, this would fetch the historical version
        // For demo purposes, we'll just show a message
        this.showMessage('info', `Viewing policy version: ${version}`);
        this.closePanel('versionHistory');
    }

    // --------------------
    // UTILITY METHODS
    // --------------------
    showMessage(type, message) {
        const messageElement = type === 'error' ? this.errorMessage : this.successMessage;
        const messageText = messageElement.querySelector('p');
        messageText.textContent = message;

        messageElement.style.display = 'block';
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        this.updateDarkModeIcon();
    }

    updateDarkModeIcon() {
        const icon = this.darkModeToggle.querySelector('i');
        const isDarkMode = document.body.classList.contains('dark-mode');
        icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }

    toggleBackToTopButton() {
        if (window.pageYOffset > 300) {
            this.backToTopBtn.classList.add('visible');
        } else {
            this.backToTopBtn.classList.remove('visible');
        }
    }

    loadSavedPreferences() {
        // Load consent settings
        const savedConsent = localStorage.getItem('consentStatus');
        if (savedConsent) {
            this.consentStatus = JSON.parse(savedConsent);
            this.updateConsentUI();
            this.updateConsentFormCheckboxes();
        }

        // Load cookie preferences
        const savedCookiePrefs = localStorage.getItem('cookiePreferences');
        if (savedCookiePrefs) {
            this.cookiePreferences = JSON.parse(savedCookiePrefs);
            this.updateCookiePreferencesUI();
        }
    }

    updateCookiePreferencesUI() {
        const panel = this.panels.cookiePreferences;

        Object.keys(this.cookiePreferences).forEach(cookieType => {
            if (cookieType !== 'necessary') { // Necessary cookies are always enabled
                const input = panel.querySelector(`.${cookieType}-cookies input`);
                if (input) {
                    input.checked = this.cookiePreferences[cookieType];
                }
            }
        });
    }
}

// Initialize the Privacy Policy Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.privacyPolicyManager = new PrivacyPolicyManager();
});

// Handle browser back button for popup panels
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.panelOpen) {
        window.privacyPolicyManager.openPanel(event.state.panelName);
    } else {
        const activePanel = document.querySelector('.popup-panel.active');
        if (activePanel) {
            const panelName = activePanel.id.replace('Panel', '');
            window.privacyPolicyManager.closePanel(panelName);
        }
    }
});

// Smooth scroll behavior for anchor links (fallback)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Handle resize events to adjust layout if needed
window.addEventListener('resize', debounce(() => {
    if (window.privacyPolicyManager) {
        // Recalculate layouts if needed
    }
}, 250));

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize dark mode preference from system settings if not set
if (!localStorage.getItem('darkMode')) {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemPrefersDark) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    }
}
/**
 * CURIS BY CITRUS - MY PROFILE PAGE
 * Complete JavaScript Implementation
 * Doctor (Specialist) Profile Management System
 */

// ========================================
// 1. GLOBAL VARIABLES & STATE MANAGEMENT
// ========================================
const ProfileManager = {
    state: {
        profileData: {
            title: 'Dr.',
            firstName: 'Sarah',
            lastName: 'Wanjiru',
            specialization: {
                primary: 'Cardiology',
                secondary: 'Internal Medicine',
                yearsExperience: 10,
                certification: 'Board Certified in Cardiology, MBBS, MD'
            },
            contact: {
                phone: '+254 712 345678',
                email: 'dr.sarah.wanjiru@curis.co.ke'
            },
            clinic: {
                name: 'Curis Medical Center',
                address: '123 Healthcare Avenue, Nairobi, Kenya',
                owner: 'Dr. James Mwangi',
                assignmentDate: 'January 15, 2025'
            },
            notifications: {
                appointments: true,
                patientRecords: true,
                systemUpdates: false,
                emailEnabled: false,
                quietHours: false,
                quietStart: '22:00',
                quietEnd: '07:00',
                notificationSound: 'default'
            },
            privacy: {
                showName: true,
                showPhoto: true,
                showSpecialization: true,
                anonymousAnalytics: false,
                researchParticipation: false
            }
        },
        unsavedChanges: false,
        activeModals: [],
        darkMode: localStorage.getItem('darkMode') === 'true'
    }
};

// ========================================
// 2. DOM ELEMENT REFERENCES
// ========================================
const DOM = {
    // Profile Elements
    userProfile: document.getElementById('userProfile'),
    profileDropdown: document.getElementById('profileDropdown'),

    // Buttons
    photoUploadBtn: document.getElementById('photoUploadBtn'),
    editNameBtn: document.getElementById('editNameBtn'),
    editSpecializationBtn: document.getElementById('editSpecializationBtn'),
    requestContactChangeBtn: document.getElementById('requestContactChangeBtn'),
    contactOwnerBtn: document.getElementById('contactOwnerBtn'),
    changePasswordBtn: document.getElementById('changePasswordBtn'),
    logoutOtherSessionsBtn: document.getElementById('logoutOtherSessionsBtn'),
    saveAllChangesBtn: document.getElementById('saveAllChangesBtn'),
    resetChangesBtn: document.getElementById('resetChangesBtn'),
    exportProfileBtn: document.getElementById('exportProfileBtn'),
    darkModeBtn: document.getElementById('darkModeBtn'),

    // Modals
    photoUploadModal: document.getElementById('photoUploadModal'),
    nameEditModal: document.getElementById('nameEditModal'),
    specializationModal: document.getElementById('specializationModal'),
    contactRequestModal: document.getElementById('contactRequestModal'),
    contactOwnerModal: document.getElementById('contactOwnerModal'),
    passwordChangeModal: document.getElementById('passwordChangeModal'),
    logoutSessionsModal: document.getElementById('logoutSessionsModal'),
    exportProfileModal: document.getElementById('exportProfileModal'),
    soundSettingsModal: document.getElementById('soundSettingsModal'),
    resetConfirmationModal: document.getElementById('resetConfirmationModal'),

    // Toggle Elements
    quietHoursToggle: document.getElementById('quietHoursToggle')
};

// ========================================
// 3. INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    initializeProfile();
    setupEventListeners();
    loadProfileData();
    applyDarkMode();
    startAutoSave();
    updateIntegrationStatus();
});

function initializeProfile() {
    // Load saved profile data from localStorage
    const savedProfile = localStorage.getItem('doctorProfile');
    if (savedProfile) {
        try {
            ProfileManager.state.profileData = JSON.parse(savedProfile);
            updateUIWithProfileData();
        } catch (e) {
            console.error('Error loading profile data:', e);
        }
    }

    // Initialize notification count
    updateNotificationBadge();
}

// ========================================
// 4. EVENT LISTENERS SETUP
// ========================================
function setupEventListeners() {
    // Profile Dropdown
    DOM.userProfile?.addEventListener('click', toggleProfileDropdown);

    // Quick Settings
    document.querySelector('.quick-settings-btn')?.addEventListener('click', openQuickSettings);

    // Profile Actions
    DOM.photoUploadBtn?.addEventListener('click', () => openModal(DOM.photoUploadModal));
    DOM.editNameBtn?.addEventListener('click', () => openModal(DOM.nameEditModal));
    DOM.editSpecializationBtn?.addEventListener('click', () => openModal(DOM.specializationModal));
    DOM.requestContactChangeBtn?.addEventListener('click', () => openModal(DOM.contactRequestModal));
    DOM.contactOwnerBtn?.addEventListener('click', () => openModal(DOM.contactOwnerModal));
    DOM.changePasswordBtn?.addEventListener('click', () => openModal(DOM.passwordChangeModal));
    DOM.logoutOtherSessionsBtn?.addEventListener('click', () => openModal(DOM.logoutSessionsModal));
    DOM.exportProfileBtn?.addEventListener('click', () => openModal(DOM.exportProfileModal));
    DOM.resetChangesBtn?.addEventListener('click', () => openModal(DOM.resetConfirmationModal));

    // Save Actions
    DOM.saveAllChangesBtn?.addEventListener('click', saveAllChanges);

    // Dark Mode
    DOM.darkModeBtn?.addEventListener('click', toggleDarkMode);

    // Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function () {
            closeModal(this.closest('.modal'));
        });
    });

    // Modal Background Click Close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    // Dismiss Modal Buttons
    document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
        btn.addEventListener('click', function () {
            closeModal(this.closest('.modal'));
        });
    });

    // Form Submissions
    setupFormListeners();

    // Notification Settings
    setupNotificationListeners();

    // Sound Settings
    setupSoundSettings();

    // Export Options
    setupExportOptions();

    // Quiet Hours
    setupQuietHours();

    // Session Management
    setupSessionManagement();
}

// ========================================
// 5. MODAL MANAGEMENT
// ========================================
function openModal(modal) {
    if (!modal) return;

    modal.classList.add('active');
    ProfileManager.state.activeModals.push(modal);
    document.body.style.overflow = 'hidden';

    // Populate modal data if needed
    populateModalData(modal);

    // Focus management for accessibility
    const firstInput = modal.querySelector('input, select, textarea, button');
    if (firstInput) {
        firstInput.focus();
    }
}

function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove('active');
    ProfileManager.state.activeModals = ProfileManager.state.activeModals.filter(m => m !== modal);

    if (ProfileManager.state.activeModals.length === 0) {
        document.body.style.overflow = '';
    }
}

function populateModalData(modal) {
    const modalId = modal.id;

    switch (modalId) {
        case 'nameEditModal':
            populateNameEditModal();
            break;
        case 'specializationModal':
            populateSpecializationModal();
            break;
        case 'passwordChangeModal':
            setupPasswordStrengthMeter();
            break;
    }
}

// ========================================
// 6. FORM HANDLERS
// ========================================
function setupFormListeners() {
    // Name Edit Form
    const nameEditForm = document.querySelector('.name-edit-form');
    if (nameEditForm) {
        const saveBtn = nameEditForm.closest('.modal').querySelector('.save-name-btn');
        saveBtn?.addEventListener('click', saveNameChanges);
    }

    // Specialization Form
    const specializationForm = document.querySelector('.specialization-form');
    if (specializationForm) {
        const saveBtn = specializationForm.closest('.modal').querySelector('.save-specialization-btn');
        saveBtn?.addEventListener('click', saveSpecialization);
    }

    // Contact Request Form
    const contactRequestForm = document.querySelector('.contact-request-form');
    if (contactRequestForm) {
        const submitBtn = contactRequestForm.closest('.modal').querySelector('.submit-request-btn');
        submitBtn?.addEventListener('click', submitContactRequest);
    }

    // Contact Owner Form
    const ownerMessageForm = document.querySelector('.owner-message-form');
    if (ownerMessageForm) {
        const sendBtn = ownerMessageForm.closest('.modal').querySelector('.send-message-btn');
        sendBtn?.addEventListener('click', sendOwnerMessage);
    }

    // Password Change Form
    const passwordChangeForm = document.querySelector('.password-change-form');
    if (passwordChangeForm) {
        const saveBtn = passwordChangeForm.closest('.modal').querySelector('.save-password-btn');
        saveBtn?.addEventListener('click', changePassword);

        // Password validation
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmPassword');

        newPassword?.addEventListener('input', validatePasswordStrength);
        confirmPassword?.addEventListener('input', validatePasswordMatch);
    }
}

// ========================================
// 7. PROFILE UPDATE FUNCTIONS
// ========================================
function populateNameEditModal() {
    document.getElementById('doctorTitle').value = ProfileManager.state.profileData.title;
    document.getElementById('firstName').value = ProfileManager.state.profileData.firstName;
    document.getElementById('lastName').value = ProfileManager.state.profileData.lastName;
}

function saveNameChanges() {
    const title = document.getElementById('doctorTitle').value;
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();

    if (!firstName || !lastName) {
        showValidationError('Please enter both first and last name');
        return;
    }

    ProfileManager.state.profileData.title = title;
    ProfileManager.state.profileData.firstName = firstName;
    ProfileManager.state.profileData.lastName = lastName;
    ProfileManager.state.unsavedChanges = true;

    // Update UI
    updateDoctorName();

    // Show success notification
    showNotification('Name updated successfully', 'success');

    // Close modal
    closeModal(DOM.nameEditModal);
}

function updateDoctorName() {
    const fullName = `${ProfileManager.state.profileData.title} ${ProfileManager.state.profileData.firstName} ${ProfileManager.state.profileData.lastName}`;

    document.querySelector('.doctor-name').textContent = fullName;
    document.querySelector('.profile-name').textContent = fullName;
}

function populateSpecializationModal() {
    const data = ProfileManager.state.profileData.specialization;

    document.getElementById('primarySpecialty').value = data.primary.toLowerCase().replace(' ', '');
    document.getElementById('secondarySpecialty').value = data.secondary ? 'internal' : '';
    document.getElementById('yearsExperience').value = data.yearsExperience;
    document.getElementById('certificationInfo').value = data.certification;
}

function saveSpecialization() {
    const primary = document.getElementById('primarySpecialty').options[document.getElementById('primarySpecialty').selectedIndex].text;
    const secondary = document.getElementById('secondarySpecialty').options[document.getElementById('secondarySpecialty').selectedIndex].text;
    const years = document.getElementById('yearsExperience').value;
    const certification = document.getElementById('certificationInfo').value;

    ProfileManager.state.profileData.specialization = {
        primary: primary,
        secondary: secondary === 'None' ? '' : secondary,
        yearsExperience: parseInt(years),
        certification: certification
    };

    ProfileManager.state.unsavedChanges = true;

    // Update UI
    updateSpecializationDisplay();

    showNotification('Specialization updated successfully', 'success');
    closeModal(DOM.specializationModal);
}

function updateSpecializationDisplay() {
    const spec = ProfileManager.state.profileData.specialization;

    document.querySelectorAll('.info-value')[0].textContent = spec.primary;
    document.querySelectorAll('.info-value')[1].textContent = spec.secondary || 'None';
    document.querySelectorAll('.info-value')[2].textContent = `${spec.yearsExperience} years`;
}

// ========================================
// 8. CONTACT & MESSAGING FUNCTIONS
// ========================================
function submitContactRequest() {
    const requestType = document.getElementById('requestType').value;
    const newInfo = document.getElementById('newContactInfo').value.trim();
    const reason = document.getElementById('changeReason').value.trim();

    if (!newInfo || !reason) {
        showValidationError('Please fill in all required fields');
        return;
    }

    // Simulate sending request
    const request = {
        type: requestType,
        newInfo: newInfo,
        reason: reason,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };

    // Save to localStorage (in real app, send to server)
    const requests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
    requests.push(request);
    localStorage.setItem('contactRequests', JSON.stringify(requests));

    showNotification('Contact change request submitted successfully', 'success');
    closeModal(DOM.contactRequestModal);

    // Reset form
    document.getElementById('newContactInfo').value = '';
    document.getElementById('changeReason').value = '';
}

function sendOwnerMessage() {
    const subject = document.getElementById('messageSubject').value.trim();
    const body = document.getElementById('messageBody').value.trim();
    const priority = document.getElementById('messagePriority').value;

    if (!subject || !body) {
        showValidationError('Please enter both subject and message');
        return;
    }

    // Simulate sending message
    const message = {
        to: ProfileManager.state.profileData.clinic.owner,
        from: `${ProfileManager.state.profileData.firstName} ${ProfileManager.state.profileData.lastName}`,
        subject: subject,
        body: body,
        priority: priority,
        timestamp: new Date().toISOString(),
        status: 'sent'
    };

    // Save to localStorage (in real app, send to server)
    const messages = JSON.parse(localStorage.getItem('ownerMessages') || '[]');
    messages.push(message);
    localStorage.setItem('ownerMessages', JSON.stringify(messages));

    showNotification('Message sent to clinic owner', 'success');
    closeModal(DOM.contactOwnerModal);

    // Reset form
    document.getElementById('messageSubject').value = '';
    document.getElementById('messageBody').value = '';
    document.getElementById('messagePriority').value = 'normal';
}

// ========================================
// 9. PASSWORD MANAGEMENT
// ========================================
function setupPasswordStrengthMeter() {
    const passwordInput = document.getElementById('newPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            const strength = calculatePasswordStrength(this.value);
            updatePasswordStrengthDisplay(strength);
        });
    }
}

function calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;

    return strength;
}

function updatePasswordStrengthDisplay(strength) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    if (!strengthBar || !strengthText) return;

    strengthBar.style.width = strength + '%';

    if (strength < 30) {
        strengthBar.style.background = '#F44336';
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#F44336';
    } else if (strength < 60) {
        strengthBar.style.background = '#FFC107';
        strengthText.textContent = 'Fair';
        strengthText.style.color = '#FFC107';
    } else if (strength < 80) {
        strengthBar.style.background = '#2196F3';
        strengthText.textContent = 'Good';
        strengthText.style.color = '#2196F3';
    } else {
        strengthBar.style.background = '#4CAF50';
        strengthText.textContent = 'Strong';
        strengthText.style.color = '#4CAF50';
    }
}

function validatePasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const validationMessage = confirmPassword.parentElement.querySelector('.validation-message');

    if (confirmPassword && newPassword !== confirmPassword) {
        validationMessage.textContent = 'Passwords do not match';
    } else {
        validationMessage.textContent = '';
    }
}

function validatePasswordStrength(e) {
    const password = e.target.value;
    const strength = calculatePasswordStrength(password);
    updatePasswordStrengthDisplay(strength);
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showValidationError('Please fill in all password fields');
        return;
    }

    if (newPassword !== confirmPassword) {
        showValidationError('Passwords do not match');
        return;
    }

    if (calculatePasswordStrength(newPassword) < 60) {
        showValidationError('Please choose a stronger password');
        return;
    }

    // Simulate password change (in real app, send to server)
    localStorage.setItem('passwordLastChanged', new Date().toISOString());

    showNotification('Password updated successfully', 'success');
    closeModal(DOM.passwordChangeModal);

    // Reset form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';

    // Send security email notification
    sendSecurityEmail();
}

function sendSecurityEmail() {
    // Simulate sending security email
    console.log('Security email sent to:', ProfileManager.state.profileData.contact.email);
}

// ========================================
// 10. SESSION MANAGEMENT
// ========================================
function setupSessionManagement() {
    const confirmLogoutBtn = document.querySelector('.confirm-logout-btn');
    confirmLogoutBtn?.addEventListener('click', logoutOtherSessions);
}

function logoutOtherSessions() {
    // Simulate logging out other sessions
    const sessions = [
        { device: 'iPhone - Safari', location: 'Nairobi, Kenya', time: 'Yesterday at 6:00 PM' }
    ];

    // Clear other sessions (in real app, send to server)
    localStorage.setItem('activeSessions', JSON.stringify([{
        device: 'Windows PC - Chrome',
        location: 'Nairobi, Kenya',
        time: 'Current session'
    }]));

    showNotification('All other sessions have been logged out', 'success');
    closeModal(DOM.logoutSessionsModal);

    // Update sessions display
    updateSessionsDisplay();
}

function updateSessionsDisplay() {
    const sessionsList = document.querySelector('.sessions-list');
    if (!sessionsList) return;

    const sessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');

    // Keep only current session in display
    const otherSessions = sessionsList.querySelectorAll('.session-item:not(.current)');
    otherSessions.forEach(session => session.remove());
}

// ========================================
// 11. NOTIFICATION MANAGEMENT
// ========================================
function setupNotificationListeners() {
    // Notification toggles
    document.querySelectorAll('.notification-category .toggle-switch input').forEach(toggle => {
        toggle.addEventListener('change', function () {
            const category = this.closest('.notification-category').querySelector('h5').textContent;
            updateNotificationPreference(category, this.checked);
        });
    });

    // Delivery method toggles
    document.querySelectorAll('.delivery-method .toggle-switch input').forEach(toggle => {
        toggle.addEventListener('change', function () {
            const method = this.closest('.delivery-method').querySelector('span').textContent;
            updateDeliveryMethod(method, this.checked);
        });
    });

    // Sound settings button
    document.querySelector('.sound-settings-btn')?.addEventListener('click', () => {
        openModal(DOM.soundSettingsModal);
    });
}

function updateNotificationPreference(category, enabled) {
    // Update state
    const categoryMap = {
        'Appointment Notifications': 'appointments',
        'Patient Record Updates': 'patientRecords',
        'System Notifications': 'systemUpdates'
    };

    const key = categoryMap[category];
    if (key) {
        ProfileManager.state.profileData.notifications[key] = enabled;
        ProfileManager.state.unsavedChanges = true;
    }
}

function updateDeliveryMethod(method, enabled) {
    if (method.includes('Email')) {
        ProfileManager.state.profileData.notifications.emailEnabled = enabled;
    }
    ProfileManager.state.unsavedChanges = true;
}

function setupSoundSettings() {
    // Test sound buttons
    document.querySelectorAll('.test-sound-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            playNotificationSound(this.dataset.sound);
        });
    });

    // Save sound settings
    document.querySelector('.save-sound-btn')?.addEventListener('click', saveSoundSettings);
}

function playNotificationSound(sound) {
    // Simulate playing sound
    console.log('Playing sound:', sound);

    // In real app, play actual audio file
    const audio = new Audio();
    switch (sound) {
        case 'default':
            // audio.src = '/sounds/default.mp3';
            break;
        case 'chime':
            // audio.src = '/sounds/chime.mp3';
            break;
        case 'bell':
            // audio.src = '/sounds/bell.mp3';
            break;
    }
    // audio.play();
}

function saveSoundSettings() {
    const selectedSound = document.querySelector('input[name="notificationSound"]:checked')?.value;
    if (selectedSound) {
        ProfileManager.state.profileData.notifications.notificationSound = selectedSound;
        ProfileManager.state.unsavedChanges = true;
        showNotification('Sound settings saved', 'success');
    }
    closeModal(DOM.soundSettingsModal);
}

// ========================================
// 12. QUIET HOURS MANAGEMENT
// ========================================
function setupQuietHours() {
    DOM.quietHoursToggle?.addEventListener('change', function () {
        const timeSelection = document.querySelector('.time-selection');
        if (this.checked) {
            timeSelection.style.display = 'flex';
            ProfileManager.state.profileData.notifications.quietHours = true;
        } else {
            timeSelection.style.display = 'none';
            ProfileManager.state.profileData.notifications.quietHours = false;
        }
        ProfileManager.state.unsavedChanges = true;
    });

    // Time inputs
    document.querySelectorAll('.time-selection input[type="time"]').forEach(input => {
        input.addEventListener('change', function () {
            if (this.closest('.time-input-group').querySelector('label').textContent.includes('Start')) {
                ProfileManager.state.profileData.notifications.quietStart = this.value;
            } else {
                ProfileManager.state.profileData.notifications.quietEnd = this.value;
            }
            ProfileManager.state.unsavedChanges = true;
        });
    });
}

// ========================================
// 13. PROFILE EXPORT
// ========================================
function setupExportOptions() {
    document.querySelectorAll('.export-option-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const format = this.dataset.format;
            exportProfile(format);
        });
    });
}

function exportProfile(format) {
    if (format === 'pdf') {
        exportAsPDF();
    } else if (format === 'json') {
        exportAsJSON();
    }
    closeModal(DOM.exportProfileModal);
}

function exportAsPDF() {
    // Simulate PDF generation
    console.log('Generating PDF...');

    // In real app, use library like jsPDF
    const profileContent = `
        Doctor Profile
        ==============
        Name: ${ProfileManager.state.profileData.title} ${ProfileManager.state.profileData.firstName} ${ProfileManager.state.profileData.lastName}
        Specialization: ${ProfileManager.state.profileData.specialization.primary}
        Experience: ${ProfileManager.state.profileData.specialization.yearsExperience} years
        Clinic: ${ProfileManager.state.profileData.clinic.name}
    `;

    // Create download
    downloadFile('doctor-profile.txt', profileContent, 'text/plain');
    showNotification('Profile exported as PDF', 'success');
}

function exportAsJSON() {
    const jsonContent = JSON.stringify(ProfileManager.state.profileData, null, 2);
    downloadFile('doctor-profile.json', jsonContent, 'application/json');
    showNotification('Profile exported as JSON', 'success');
}

function downloadFile(filename, content, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// ========================================
// 14. SAVE & RESET FUNCTIONS
// ========================================
function saveAllChanges() {
    if (!ProfileManager.state.unsavedChanges) {
        showNotification('No changes to save', 'info');
        return;
    }

    // Validate data
    if (!validateProfileData()) {
        return;
    }

    // Save to localStorage (in real app, send to server)
    localStorage.setItem('doctorProfile', JSON.stringify(ProfileManager.state.profileData));
    ProfileManager.state.unsavedChanges = false;

    // Update sync status
    updateIntegrationStatus();

    // Show success message
    showNotification('All changes saved successfully', 'success');

    // Trigger system-wide sync
    syncAcrossPlatform();
}

function validateProfileData() {
    const data = ProfileManager.state.profileData;

    if (!data.firstName || !data.lastName) {
        showValidationError('Name fields cannot be empty');
        return false;
    }

    if (!data.specialization.primary) {
        showValidationError('Primary specialization is required');
        return false;
    }

    return true;
}

function resetChanges() {
    // Reload original data
    const savedProfile = localStorage.getItem('doctorProfile');
    if (savedProfile) {
        ProfileManager.state.profileData = JSON.parse(savedProfile);
        updateUIWithProfileData();
        ProfileManager.state.unsavedChanges = false;
        showNotification('Changes have been reset', 'info');
    }
    closeModal(DOM.resetConfirmationModal);
}

// Setup reset confirmation
document.querySelector('.confirm-reset-btn')?.addEventListener('click', resetChanges);

// ========================================
// 15. AUTO-SAVE FUNCTIONALITY
// ========================================
function startAutoSave() {
    setInterval(() => {
        if (ProfileManager.state.unsavedChanges) {
            saveAllChanges();
            console.log('Auto-saved profile changes');
        }
    }, 300000); // Auto-save every 5 minutes
}

// ========================================
// 16. INTEGRATION STATUS
// ========================================
function updateIntegrationStatus() {
    const integrations = document.querySelectorAll('.integration-item');

    // Simulate sync status update
    setTimeout(() => {
        integrations.forEach(item => {
            if (item.classList.contains('syncing')) {
                item.classList.remove('syncing');
                item.classList.add('synced');
                item.querySelector('i').className = 'fas fa-check-circle';
                item.querySelector('.integration-status').textContent = 'Synced';
            }
        });
    }, 2000);
}

function syncAcrossPlatform() {
    // Simulate platform sync
    const syncData = {
        profile: ProfileManager.state.profileData,
        timestamp: new Date().toISOString(),
        modules: ['Dashboard', 'Patient Records', 'Consultations', 'Appointments', 'Prescriptions']
    };

    // In real app, send to server for platform-wide sync
    console.log('Syncing across platform:', syncData);
}

// ========================================
// 17. DARK MODE FUNCTIONALITY
// ========================================
function toggleDarkMode() {
    ProfileManager.state.darkMode = !ProfileManager.state.darkMode;
    localStorage.setItem('darkMode', ProfileManager.state.darkMode);
    applyDarkMode();
}

function applyDarkMode() {
    if (ProfileManager.state.darkMode) {
        document.body.classList.add('dark-mode');
        DOM.darkModeBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    } else {
        document.body.classList.remove('dark-mode');
        DOM.darkModeBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
    }
}

// Dark mode CSS injection
function injectDarkModeStyles() {
    const darkModeStyles = `
        body.dark-mode {
            --primary-navy: #0F1823;
            --accent-teal: #00D9BC;
            --secondary-orange: #FF8A65;
            --soft-gray: #1A1A1A;
            --charcoal-gray: #E0E0E0;
            --white: #121212;
            --light-gray: #0A0A0A;
            --medium-gray: #2A2A2A;
        }
        
        body.dark-mode .sidebar {
            background: #1A1A1A;
        }
        
        body.dark-mode .top-header {
            background: rgba(26, 26, 26, 0.95);
        }
        
        body.dark-mode .profile-panel {
            background: #1A1A1A;
            color: #E0E0E0;
        }
        
        body.dark-mode .modal-content {
            background: #1A1A1A;
            color: #E0E0E0;
        }
        
        body.dark-mode .form-control,
        body.dark-mode .form-control-sm {
            background: #2A2A2A;
            color: #E0E0E0;
            border-color: #3A3A3A;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'dark-mode-styles';
    styleElement.textContent = darkModeStyles;
    document.head.appendChild(styleElement);
}

// Inject dark mode styles on load
injectDarkModeStyles();

// ========================================
// 18. UTILITY FUNCTIONS
// ========================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${getNotificationColor(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FFC107',
        info: '#2196F3'
    };
    return colors[type] || '#2196F3';
}

function showValidationError(message) {
    showNotification(message, 'error');
}

function toggleProfileDropdown(e) {
    e.stopPropagation();
    DOM.profileDropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
    if (!DOM.userProfile.contains(e.target) && !DOM.profileDropdown.contains(e.target)) {
        DOM.profileDropdown.classList.remove('active');
    }
});

function openQuickSettings() {
    // Create quick settings modal
    const quickSettingsContent = `
        <div class="quick-settings-panel">
            <h3>Quick Settings</h3>
            <div class="setting-item">
                <label>Notifications</label>
                <label class="toggle-switch">
                    <input type="checkbox" ${ProfileManager.state.profileData.notifications.appointments ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
            <div class="setting-item">
                <label>Language</label>
                <select class="form-control-sm">
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                </select>
            </div>
        </div>
    `;

    // Show in a simple modal or dropdown
    console.log('Quick Settings opened');
}

function loadProfileData() {
    // Load additional profile data from server (simulated)
    setTimeout(() => {
        updateUIWithProfileData();
        console.log('Profile data loaded');
    }, 500);
}

function updateUIWithProfileData() {
    const data = ProfileManager.state.profileData;

    // Update name displays
    updateDoctorName();

    // Update specialization
    updateSpecializationDisplay();

    // Update notification settings
    document.querySelectorAll('.notification-category .toggle-switch input').forEach(toggle => {
        const category = toggle.closest('.notification-category').querySelector('h5').textContent;
        const categoryMap = {
            'Appointment Notifications': 'appointments',
            'Patient Record Updates': 'patientRecords',
            'System Notifications': 'systemUpdates'
        };
        const key = categoryMap[category];
        if (key && data.notifications[key] !== undefined) {
            toggle.checked = data.notifications[key];
        }
    });

    // Update privacy settings
    document.querySelectorAll('.privacy-options input[type="checkbox"]').forEach(checkbox => {
        const label = checkbox.nextElementSibling.textContent;
        if (label.includes('name') && data.privacy.showName !== undefined) {
            checkbox.checked = data.privacy.showName;
        } else if (label.includes('photo') && data.privacy.showPhoto !== undefined) {
            checkbox.checked = data.privacy.showPhoto;
        } else if (label.includes('specialization') && data.privacy.showSpecialization !== undefined) {
            checkbox.checked = data.privacy.showSpecialization;
        }
    });
}

function updateNotificationBadge() {
    // Update notification count (simulated)
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
        const count = Math.floor(Math.random() * 10) + 1;
        notificationBadge.textContent = count;
    }
}

// ========================================
// 19. PHOTO UPLOAD FUNCTIONALITY
// ========================================
function setupPhotoUpload() {
    const uploadButtons = document.querySelectorAll('.upload-option-btn');

    uploadButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            if (this.textContent.includes('Browse')) {
                triggerFileUpload();
            } else if (this.textContent.includes('Take')) {
                openCamera();
            }
        });
    });

    // Save photo button
    document.querySelector('.save-photo-btn')?.addEventListener('click', saveProfilePhoto);

    // Crop controls
    document.querySelectorAll('.crop-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            if (this.textContent.includes('Crop')) {
                cropPhoto();
            } else if (this.textContent.includes('Rotate')) {
                rotatePhoto();
            }
        });
    });
}

function triggerFileUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                updatePhotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    input.click();
}

function openCamera() {
    // Request camera access (requires HTTPS)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                console.log('Camera access granted');
                // Implementation would include video element and capture functionality
            })
            .catch(function (err) {
                console.error('Camera access denied:', err);
                showNotification('Camera access denied', 'error');
            });
    } else {
        showNotification('Camera not supported on this device', 'error');
    }
}

function updatePhotoPreview(imageSrc) {
    const preview = document.querySelector('.photo-preview');
    if (preview) {
        preview.src = imageSrc;
        ProfileManager.state.tempPhoto = imageSrc;
    }
}

function cropPhoto() {
    // Implement photo cropping (would use library like Cropper.js)
    console.log('Cropping photo...');
    showNotification('Photo cropped', 'success');
}

function rotatePhoto() {
    // Implement photo rotation
    console.log('Rotating photo...');
    showNotification('Photo rotated', 'success');
}

function saveProfilePhoto() {
    if (ProfileManager.state.tempPhoto) {
        // Update profile photos
        document.querySelectorAll('.profile-photo-large, .profile-pic').forEach(img => {
            img.src = ProfileManager.state.tempPhoto;
        });

        // Save to profile data
        ProfileManager.state.profileData.photo = ProfileManager.state.tempPhoto;
        ProfileManager.state.unsavedChanges = true;

        showNotification('Profile photo updated', 'success');
        closeModal(DOM.photoUploadModal);
    } else {
        showValidationError('Please select a photo first');
    }
}

// Initialize photo upload functionality
setupPhotoUpload();

// ========================================
// 20. KEYBOARD NAVIGATION
// ========================================
document.addEventListener('keydown', function (e) {
    // ESC to close modals
    if (e.key === 'Escape' && ProfileManager.state.activeModals.length > 0) {
        const topModal = ProfileManager.state.activeModals[ProfileManager.state.activeModals.length - 1];
        closeModal(topModal);
    }

    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveAllChanges();
    }
});

// ========================================
// 21. ANIMATION INJECTION
// ========================================
function injectAnimations() {
    const animations = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'custom-animations';
    styleElement.textContent = animations;
    document.head.appendChild(styleElement);
}

// Inject animations on load
injectAnimations();

// ========================================
// 22. RESPONSIVE MENU TOGGLE
// ========================================
function setupMobileMenu() {
    // Create mobile menu toggle if on mobile
    if (window.innerWidth <= 768) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        menuToggle.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1100;
            background: var(--accent-teal);
            color: white;
            border: none;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
        `;

        menuToggle.addEventListener('click', function () {
            document.querySelector('.sidebar').classList.toggle('active');
        });

        document.body.appendChild(menuToggle);
    }
}

// Setup mobile menu on load
setupMobileMenu();

// Handle window resize
window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
        document.querySelector('.mobile-menu-toggle')?.remove();
        document.querySelector('.sidebar')?.classList.remove('active');
    } else if (!document.querySelector('.mobile-menu-toggle')) {
        setupMobileMenu();
    }
});

// ========================================
// 23. PERFORMANCE MONITORING
// ========================================
function monitorPerformance() {
    // Log page load time
    window.addEventListener('load', function () {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
    });

    // Monitor unsaved changes warning
    window.addEventListener('beforeunload', function (e) {
        if (ProfileManager.state.unsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
}

// Start performance monitoring
monitorPerformance();

// ========================================
// INITIALIZATION COMPLETE
// ========================================
console.log('My Profile JavaScript initialized successfully');
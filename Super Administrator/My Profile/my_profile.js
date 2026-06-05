// ===================================
// CURIS MY PROFILE JAVASCRIPT
// Complete Profile Management System
// ===================================

// Global state management
const profileState = {
    user: {
        id: 'SA001',
        name: 'Super Administrator',
        email: 'admin@citruslabs.co.ke',
        phone: '+254 712 345 678',
        role: 'Super Administrator',
        department: 'Platform Administration',
        office: 'HQ Nairobi',
        extension: '1001',
        profilePicture: 'icons8-profile-picture-100-2.png',
        emergencyContact: null
    },
    settings: {
        language: 'en',
        timezone: 'GMT+3',
        dateFormat: 'DD/MM/YYYY',
        currency: 'KES',
        theme: 'dark',
        expandedSidebar: true,
        showNotificationBadge: true,
        density: 'normal',
        enableQuickActions: true
    },
    security: {
        twoFactorEnabled: true,
        twoFactorMethod: 'email',
        securityQuestionsSet: 3,
        alertsEnabled: {
            newDevice: true,
            suspiciousActivity: true,
            passwordChanges: false
        }
    },
    notifications: {
        email: {
            securityAlerts: true,
            systemUpdates: true,
            userChanges: true,
            financialReports: true,
            marketing: false
        },
        sms: {
            criticalAlerts: true,
            loginAttempts: true,
            dailySummaries: false
        },
        inApp: {
            allActivities: true,
            realtimeUpdates: true,
            soundAlerts: true
        },
        schedule: {
            dailySummary: '6:00',
            weeklyReport: 'monday',
            monthlyReport: '1'
        }
    },
    sessions: {
        timeout: 2,
        maxSessions: 3,
        rememberMe: false,
        activeSessions: []
    },
    activity: [],
    profileCompletion: 95,
    dataExport: {
        includeProfile: true,
        includeActivity: true,
        includeSettings: true,
        includeSessions: true,
        includeAudits: false,
        format: 'pdf',
        encrypt: true
    }
};

// WebSocket connection for real-time updates
let websocket = null;

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('My Profile page initialized');
    
    // Initialize all components
    initializeProfile();
    initializeEventListeners();
    initializeWebSocket();
    loadUserData();
    updateProfileCompletion();
    loadActivityLog();
    loadActiveSessions();
    
    // Apply saved theme
    applyTheme();
    
    // Start real-time updates
    startRealtimeUpdates();
});

// Initialize profile components
function initializeProfile() {
    // Set initial values from state
    updateProfileDisplay();
    updateSettingsDisplay();
    updateSecurityDisplay();
    updateNotificationDisplay();
    updateSessionDisplay();
}

// Initialize all event listeners
function initializeEventListeners() {
    // Navigation dropdowns
    window.toggleNotifications = toggleNotifications;
    window.toggleUserDropdown = toggleUserDropdown;
    
    // Profile actions
    window.openEditProfileModal = openEditProfileModal;
    window.changeProfilePhoto = changeProfilePhoto;
    window.removeProfilePhoto = removeProfilePhoto;
    window.saveProfileChanges = saveProfileChanges;
    
    // Account settings
    window.saveAccountSettings = saveAccountSettings;
    window.viewKeyboardShortcuts = viewKeyboardShortcuts;
    
    // Security settings
    window.configure2FA = configure2FA;
    window.updateSecurityQuestions = updateSecurityQuestions;
    window.removeDevice = removeDevice;
    window.manageDevices = manageDevices;
    window.enable2FA = enable2FA;
    window.generateBackupCodes = generateBackupCodes;
    window.downloadBackupCodes = downloadBackupCodes;
    
    // Activity log
    window.exportActivityLog = exportActivityLog;
    
    // Notification preferences
    window.saveNotificationPreferences = saveNotificationPreferences;
    
    // Session management
    window.endSession = endSession;
    window.endAllSessions = endAllSessions;
    window.refreshCurrentSession = refreshCurrentSession;
    window.viewSessionDetails = viewSessionDetails;
    
    // Quick actions
    window.downloadMyData = downloadMyData;
    window.printProfile = printProfile;
    window.exportActivity = exportActivity;
    window.logoutAllDevices = logoutAllDevices;
    window.processDataDownload = processDataDownload;
    
    // Modal controls
    window.closeModal = closeModal;
    
    // Dark mode
    window.toggleDarkMode = toggleDarkMode;
    
    // Form listeners
    initializeFormListeners();
    
    // Close dropdowns on outside click
    document.addEventListener('click', handleOutsideClick);
}

// ===================================
// NAVIGATION & DROPDOWNS
// ===================================

function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.toggle('hidden');
    
    // Close user dropdown if open
    const userDropdown = document.getElementById('userDropdown');
    if (!userDropdown.classList.contains('hidden')) {
        userDropdown.classList.add('hidden');
    }
    
    // Mark notifications as read when opened
    if (!panel.classList.contains('hidden')) {
        markNotificationsAsRead();
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
    
    // Close notification panel if open
    const notificationPanel = document.getElementById('notificationPanel');
    if (!notificationPanel.classList.contains('hidden')) {
        notificationPanel.classList.add('hidden');
    }
}

function handleOutsideClick(event) {
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPanel = document.getElementById('notificationPanel');
    const userProfileBtn = document.querySelector('.user-profile-btn');
    const userDropdown = document.getElementById('userDropdown');
    
    // Close notification panel if clicked outside
    if (!notificationBtn.contains(event.target) && !notificationPanel.contains(event.target)) {
        notificationPanel.classList.add('hidden');
    }
    
    // Close user dropdown if clicked outside
    if (!userProfileBtn.contains(event.target) && !userDropdown.contains(event.target)) {
        userDropdown.classList.add('hidden');
    }
}

// ===================================
// PROFILE MANAGEMENT
// ===================================

function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    modal.classList.remove('hidden');
    
    // Populate form with current data
    document.getElementById('fullName').value = profileState.user.name;
    document.getElementById('email').value = profileState.user.email;
    document.getElementById('phone').value = profileState.user.phone;
    document.getElementById('altEmail').value = profileState.user.altEmail || '';
    document.getElementById('emergencyContact').value = profileState.user.emergencyContact || '';
}

function changeProfilePhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showNotification('error', 'File size must be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                updateProfilePhoto(event.target.result);
                showNotification('success', 'Profile photo updated successfully');
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

function removeProfilePhoto() {
    if (confirm('Are you sure you want to remove your profile photo?')) {
        updateProfilePhoto('icons8-profile-picture-48.png');
        showNotification('success', 'Profile photo removed');
        logActivity('Profile Photo Removed', 'Removed profile picture');
    }
}

function updateProfilePhoto(imageSrc) {
    // Update all profile images
    const profileImages = document.querySelectorAll('.profile-photo, .profile-image');
    profileImages.forEach(img => {
        img.src = imageSrc;
    });
    
    profileState.user.profilePicture = imageSrc;
    saveToLocalStorage();
    logActivity('Profile Photo Updated', 'Changed profile picture');
}

function saveProfileChanges() {
    // Get form values
    const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        altEmail: document.getElementById('altEmail').value,
        emergencyContact: document.getElementById('emergencyContact').value
    };
    
    // Validate form
    if (!validateProfileForm(formData)) {
        return;
    }
    
    // Show loading state
    showLoadingState('saveProfileBtn');
    
    // Simulate API call
    setTimeout(() => {
        // Update state
        Object.assign(profileState.user, formData);
        
        // Update display
        updateProfileDisplay();
        updateProfileCompletion();
        
        // Close modal
        closeModal('editProfileModal');
        
        // Show success message
        showNotification('success', 'Profile information updated successfully');
        
        // Log activity
        logActivity('Profile Updated', 'Updated personal information');
        
        // Hide loading state
        hideLoadingState('saveProfileBtn');
        
        // Save to local storage
        saveToLocalStorage();
    }, 1500);
}

function validateProfileForm(data) {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('error', 'Please enter a valid email address');
        return false;
    }
    
    // Phone validation
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
        showNotification('error', 'Please enter a valid phone number');
        return false;
    }
    
    // Name validation
    if (data.name.trim().length < 3) {
        showNotification('error', 'Name must be at least 3 characters long');
        return false;
    }
    
    return true;
}

// ===================================
// ACCOUNT SETTINGS
// ===================================

function saveAccountSettings() {
    // Get settings values
    const settings = {
        language: document.getElementById('languageSelect').value,
        timezone: document.getElementById('timezoneSelect').value,
        dateFormat: document.getElementById('dateFormatSelect').value,
        currency: document.getElementById('currencySelect').value,
        theme: document.querySelector('input[name="theme"]:checked').value,
        expandedSidebar: document.querySelector('input[type="checkbox"][checked]').checked,
        showNotificationBadge: document.querySelectorAll('input[type="checkbox"]')[1].checked,
        density: document.querySelector('input[name="density"]:checked').value,
        enableQuickActions: document.querySelectorAll('input[type="checkbox"]')[2].checked
    };
    
    // Update state
    Object.assign(profileState.settings, settings);
    
    // Apply theme immediately
    applyTheme();
    
    // Show success message
    showNotification('success', 'Account settings saved successfully');
    
    // Log activity
    logActivity('Settings Changed', 'Updated account preferences');
    
    // Save to local storage
    saveToLocalStorage();
}

function viewKeyboardShortcuts() {
    // Create shortcuts modal
    const shortcuts = [
        { key: 'Ctrl + S', action: 'Save changes' },
        { key: 'Ctrl + E', action: 'Edit profile' },
        { key: 'Ctrl + D', action: 'Download data' },
        { key: 'Ctrl + P', action: 'Print profile' },
        { key: 'Ctrl + L', action: 'Logout all devices' },
        { key: 'Esc', action: 'Close modal' },
        { key: 'Alt + N', action: 'Toggle notifications' },
        { key: 'Alt + U', action: 'Toggle user menu' },
        { key: 'Alt + T', action: 'Toggle theme' }
    ];
    
    showKeyboardShortcutsModal(shortcuts);
}

// ===================================
// SECURITY SETTINGS
// ===================================

function configure2FA() {
    const modal = document.getElementById('twoFactorModal');
    modal.classList.remove('hidden');
    
    // Send verification code
    sendVerificationCode();
}

function sendVerificationCode() {
    // Simulate sending code
    showNotification('info', 'Verification code sent to admin@citruslabs.co.ke');
    
    // In real implementation, this would call an API
    console.log('Sending verification code...');
}

function enable2FA() {
    const code = document.getElementById('verificationCode').value;
    
    if (code.length !== 6) {
        showNotification('error', 'Please enter a 6-digit verification code');
        return;
    }
    
    // Show loading state
    showLoadingState('enable2FABtn');
    
    // Simulate verification
    setTimeout(() => {
        if (code === '123456') { // Demo code
            profileState.security.twoFactorEnabled = true;
            updateSecurityDisplay();
            closeModal('twoFactorModal');
            showNotification('success', '2FA enabled successfully');
            logActivity('Security Changed', '2FA Enabled');
        } else {
            showNotification('error', 'Invalid verification code');
        }
        
        hideLoadingState('enable2FABtn');
    }, 1500);
}

function generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
        codes.push(generateRandomCode());
    }
    
    // Display codes
    showBackupCodesModal(codes);
    
    // Log activity
    logActivity('Security', 'Generated backup codes');
}

function downloadBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
        codes.push(generateRandomCode());
    }
    
    const content = `Curis 2FA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${codes.join('\n')}\n\nKeep these codes safe!`;
    
    downloadFile('curis-backup-codes.txt', content);
    
    showNotification('success', 'Backup codes downloaded');
    logActivity('Security', 'Downloaded backup codes');
}

function updateSecurityQuestions() {
    // Show security questions modal
    showSecurityQuestionsModal();
}

function removeDevice(deviceId) {
    if (confirm('Are you sure you want to remove this device?')) {
        // Remove device logic
        showNotification('success', 'Device removed successfully');
        logActivity('Security', `Removed device: ${deviceId}`);
        
        // Update display
        updateTrustedDevicesDisplay();
    }
}

function manageDevices() {
    // Show device management modal
    showDeviceManagementModal();
}

// ===================================
// ACTIVITY LOG
// ===================================

function loadActivityLog() {
    // Generate sample activity data
    const activities = [
        { time: '10:45', action: 'Login', description: 'Dashboard Access', ip: '192.168.1.100', location: 'Nairobi', type: 'login' },
        { time: '10:30', action: 'User Created', description: 'Added Dr. Smith to the platform', ip: '192.168.1.100', location: 'Nairobi', type: 'user' },
        { time: '09:15', action: 'Settings Changed', description: '2FA Enabled for account security', ip: '192.168.1.100', location: 'Nairobi', type: 'security' },
        { time: 'Yesterday', action: 'Report Generated', description: 'Financial Report for Q4 2024', ip: '192.168.1.100', location: 'Nairobi', type: 'report' },
        { time: '2 days ago', action: 'Profile Updated', description: 'Changed notification preferences', ip: '192.168.1.100', location: 'Nairobi', type: 'settings' }
    ];
    
    profileState.activity = activities;
    
    // Apply filters
    applyActivityFilters();
}

function applyActivityFilters() {
    const dateRange = document.getElementById('dateRange').value;
    const actionType = document.getElementById('actionType').value;
    const showPerPage = document.getElementById('showPerPage').value;
    
    let filteredActivities = [...profileState.activity];
    
    // Filter by action type
    if (actionType !== 'all') {
        filteredActivities = filteredActivities.filter(activity => activity.type === actionType);
    }
    
    // Update display
    updateActivityDisplay(filteredActivities);
}

function exportActivityLog() {
    const activities = profileState.activity;
    
    // Generate CSV content
    let csvContent = 'Time,Action,Description,IP,Location\n';
    activities.forEach(activity => {
        csvContent += `"${activity.time}","${activity.action}","${activity.description}","${activity.ip}","${activity.location}"\n`;
    });
    
    downloadFile('activity-log.csv', csvContent);
    
    showNotification('success', 'Activity log exported successfully');
    logActivity('Export', 'Exported activity log');
}

function logActivity(action, description) {
    const activity = {
        time: new Date().toLocaleTimeString(),
        action: action,
        description: description,
        ip: '192.168.1.100',
        location: 'Nairobi',
        type: getActivityType(action)
    };
    
    profileState.activity.unshift(activity);
    
    // Update display if on activity tab
    updateActivityDisplay(profileState.activity);
    
    // Send to server via WebSocket
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
            type: 'activity',
            data: activity
        }));
    }
}

function getActivityType(action) {
    const actionTypes = {
        'Login': 'login',
        'Logout': 'login',
        'Profile': 'settings',
        'Settings': 'settings',
        'Security': 'security',
        'User': 'user',
        'Report': 'report',
        'Export': 'report'
    };
    
    for (const [key, value] of Object.entries(actionTypes)) {
        if (action.includes(key)) {
            return value;
        }
    }
    
    return 'other';
}

// ===================================
// NOTIFICATION PREFERENCES
// ===================================

function saveNotificationPreferences() {
    // Get all notification settings
    const emailCheckboxes = document.querySelectorAll('.notifications-section .notification-group:nth-child(1) input[type="checkbox"]');
    const smsCheckboxes = document.querySelectorAll('.notifications-section .notification-group:nth-child(2) input[type="checkbox"]');
    const inAppCheckboxes = document.querySelectorAll('.notifications-section .notification-group:nth-child(3) input[type="checkbox"]');
    
    // Update state
    profileState.notifications.email.securityAlerts = emailCheckboxes[0].checked;
    profileState.notifications.email.systemUpdates = emailCheckboxes[1].checked;
    profileState.notifications.email.userChanges = emailCheckboxes[2].checked;
    profileState.notifications.email.financialReports = emailCheckboxes[3].checked;
    profileState.notifications.email.marketing = emailCheckboxes[4].checked;
    
    profileState.notifications.sms.criticalAlerts = smsCheckboxes[0].checked;
    profileState.notifications.sms.loginAttempts = smsCheckboxes[1].checked;
    profileState.notifications.sms.dailySummaries = smsCheckboxes[2].checked;
    
    profileState.notifications.inApp.allActivities = inAppCheckboxes[0].checked;
    profileState.notifications.inApp.realtimeUpdates = inAppCheckboxes[1].checked;
    profileState.notifications.inApp.soundAlerts = inAppCheckboxes[2].checked;
    
    // Get schedule settings
    const scheduleSelects = document.querySelectorAll('.schedule-settings select');
    profileState.notifications.schedule.dailySummary = scheduleSelects[0].value;
    profileState.notifications.schedule.weeklyReport = scheduleSelects[1].value;
    profileState.notifications.schedule.monthlyReport = scheduleSelects[2].value;
    
    // Show success message
    showNotification('success', 'Notification preferences saved successfully');
    
    // Log activity
    logActivity('Settings Changed', 'Updated notification preferences');
    
    // Save to local storage
    saveToLocalStorage();
}

// ===================================
// SESSION MANAGEMENT
// ===================================

function loadActiveSessions() {
    // Generate sample session data
    const sessions = [
        {
            id: 'chrome-windows',
            device: 'Chrome/Windows',
            location: 'Nairobi, Kenya',
            loginTime: '2 hours ago',
            status: 'current',
            icon: 'desktop'
        },
        {
            id: 'safari-mac',
            device: 'Safari/Mac',
            location: 'Mombasa, Kenya',
            loginTime: 'Yesterday',
            status: 'active',
            icon: 'laptop'
        },
        {
            id: 'mobile-app',
            device: 'Mobile App',
            location: 'Kisumu, Kenya',
            loginTime: '3 days ago',
            status: 'idle',
            icon: 'mobile-alt'
        }
    ];
    
    profileState.sessions.activeSessions = sessions;
    updateSessionDisplay();
}

function endSession(sessionId) {
    if (confirm('Are you sure you want to end this session?')) {
        // Remove session from state
        profileState.sessions.activeSessions = profileState.sessions.activeSessions.filter(
            session => session.id !== sessionId
        );
        
        // Update display
        updateSessionDisplay();
        
        // Show success message
        showNotification('success', 'Session ended successfully');
        
        // Log activity
        logActivity('Session Management', `Ended session: ${sessionId}`);
    }
}

function endAllSessions() {
    if (confirm('Are you sure you want to end all other sessions? You will remain logged in on this device.')) {
        // Keep only current session
        profileState.sessions.activeSessions = profileState.sessions.activeSessions.filter(
            session => session.status === 'current'
        );
        
        // Update display
        updateSessionDisplay();
        
        // Show success message
        showNotification('success', 'All other sessions ended successfully');
        
        // Log activity
        logActivity('Session Management', 'Ended all other sessions');
    }
}

function refreshCurrentSession() {
    showNotification('info', 'Session refreshed successfully');
    
    // Reset session timeout
    resetSessionTimeout();
    
    // Log activity
    logActivity('Session Management', 'Refreshed current session');
}

function viewSessionDetails() {
    // Show session details modal
    showSessionDetailsModal();
}

// ===================================
// QUICK ACTIONS
// ===================================

function downloadMyData() {
    const modal = document.getElementById('downloadDataModal');
    modal.classList.remove('hidden');
}

function processDataDownload() {
    // Get selected options
    const checkboxes = document.querySelectorAll('#downloadDataModal input[type="checkbox"]');
    const format = document.querySelector('input[name="downloadFormat"]:checked').value;
    const encrypt = checkboxes[checkboxes.length - 1].checked;
    
    // Update state
    profileState.dataExport.includeProfile = checkboxes[0].checked;
    profileState.dataExport.includeActivity = checkboxes[1].checked;
    profileState.dataExport.includeSettings = checkboxes[2].checked;
    profileState.dataExport.includeSessions = checkboxes[3].checked;
    profileState.dataExport.includeAudits = checkboxes[4].checked;
    profileState.dataExport.format = format;
    profileState.dataExport.encrypt = encrypt;
    
    // Show loading state
    showLoadingState('downloadBtn');
    
    // Simulate download preparation
    setTimeout(() => {
        // Generate data package
        const dataPackage = generateDataPackage();
        
        // Download file
        const filename = `curis-profile-data-${new Date().toISOString().split('T')[0]}.${format}`;
        downloadFile(filename, dataPackage);
        
        // Close modal
        closeModal('downloadDataModal');
        
        // Show success message
        showNotification('success', 'Your data has been downloaded successfully');
        
        // Log activity
        logActivity('Data Export', `Downloaded profile data in ${format.toUpperCase()} format`);
        
        hideLoadingState('downloadBtn');
    }, 2000);
}

function printProfile() {
    window.print();
    
    // Log activity
    logActivity('Print', 'Printed profile information');
}

function exportActivity() {
    exportActivityLog();
}

function logoutAllDevices() {
    if (confirm('Are you sure you want to logout from all devices? You will need to login again.')) {
        // Clear all sessions
        profileState.sessions.activeSessions = [];
        
        // Clear local storage
        localStorage.clear();
        
        // Redirect to login page
        showNotification('info', 'Logging out from all devices...');
        
        setTimeout(() => {
            window.location.href = 'landing_page.html';
        }, 1500);
    }
}

// ===================================
// WEBSOCKET & REAL-TIME UPDATES
// ===================================

function initializeWebSocket() {
    // In production, use actual WebSocket server URL
    const wsUrl = 'wss://curis-api.citruslabs.co.ke/ws';
    
    try {
        // For demo purposes, we'll simulate WebSocket behavior
        console.log('Initializing WebSocket connection...');
        
        // Simulate connection
        setTimeout(() => {
            console.log('WebSocket connected');
            simulateRealtimeUpdates();
        }, 1000);
        
    } catch (error) {
        console.error('WebSocket connection failed:', error);
    }
}

function simulateRealtimeUpdates() {
    // Simulate real-time notifications
    setInterval(() => {
        const notifications = [
            { title: 'Login Alert', desc: 'New login from Chrome/Mac', time: 'Just now' },
            { title: 'System Update', desc: 'Platform maintenance scheduled', time: '2 minutes ago' },
            { title: 'User Activity', desc: 'Dr. Smith updated profile', time: '5 minutes ago' }
        ];
        
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        
        // Add to notification panel
        if (Math.random() > 0.7) { // 30% chance
            addNotification(randomNotification);
        }
    }, 30000); // Every 30 seconds
}

function addNotification(notification) {
    const notificationList = document.querySelector('.notification-list');
    
    const notificationHTML = `
        <div class="notification-item unread">
            <div class="notification-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-desc">${notification.desc}</div>
                <div class="notification-time">${notification.time}</div>
            </div>
        </div>
    `;
    
    notificationList.insertAdjacentHTML('afterbegin', notificationHTML);
    
    // Update badge count
    updateNotificationBadge();
    
    // Play sound if enabled
    if (profileState.notifications.inApp.soundAlerts) {
        playNotificationSound();
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function updateProfileDisplay() {
    // Update personal information display
    const infoGroups = document.querySelectorAll('.profile-info-grid .info-value');
    infoGroups[0].textContent = profileState.user.name;
    infoGroups[1].textContent = profileState.user.email;
    infoGroups[2].textContent = profileState.user.phone;
    infoGroups[3].textContent = profileState.user.role;
    infoGroups[4].textContent = profileState.user.id;
    infoGroups[5].textContent = profileState.user.department;
    infoGroups[6].textContent = profileState.user.office;
    infoGroups[7].textContent = profileState.user.extension;
}

function updateSettingsDisplay() {
    // Update settings display
    document.getElementById('languageSelect').value = profileState.settings.language;
    document.getElementById('timezoneSelect').value = profileState.settings.timezone;
    document.getElementById('dateFormatSelect').value = profileState.settings.dateFormat;
    document.getElementById('currencySelect').value = profileState.settings.currency;
    
    // Theme
    document.querySelector(`input[name="theme"][value="${profileState.settings.theme}"]`).checked = true;
    
    // Density
    document.querySelector(`input[name="density"][value="${profileState.settings.density}"]`).checked = true;
}

function updateSecurityDisplay() {
    // Update 2FA status
    const securityValue = document.querySelector('.security-value.enabled');
    if (profileState.security.twoFactorEnabled) {
        securityValue.innerHTML = '<i class="fas fa-check-circle"></i> Enabled';
        securityValue.classList.add('enabled');
    } else {
        securityValue.innerHTML = 'Disabled';
        securityValue.classList.remove('enabled');
    }
}

function updateNotificationDisplay() {
    // Update notification checkboxes based on state
    const emailCheckboxes = document.querySelectorAll('.notifications-section .notification-group:nth-child(1) input[type="checkbox"]');
    emailCheckboxes[0].checked = profileState.notifications.email.securityAlerts;
    emailCheckboxes[1].checked = profileState.notifications.email.systemUpdates;
    emailCheckboxes[2].checked = profileState.notifications.email.userChanges;
    emailCheckboxes[3].checked = profileState.notifications.email.financialReports;
    emailCheckboxes[4].checked = profileState.notifications.email.marketing;
}

function updateSessionDisplay() {
    // Session display is handled by loadActiveSessions
}

function updateActivityDisplay(activities) {
    const timeline = document.querySelector('.activity-timeline');
    timeline.innerHTML = '';
    
    activities.forEach(activity => {
        const activityHTML = `
            <div class="activity-item">
                <div class="activity-time">${activity.time}</div>
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.action}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-meta">
                        <span class="activity-ip">IP: ${activity.ip}</span>
                        <span class="activity-location">Location: ${activity.location}</span>
                    </div>
                </div>
            </div>
        `;
        
        timeline.insertAdjacentHTML('beforeend', activityHTML);
    });
}

function getActivityIcon(type) {
    const icons = {
        'login': 'sign-in-alt',
        'user': 'user-plus',
        'security': 'shield-alt',
        'report': 'chart-bar',
        'settings': 'cog',
        'other': 'circle'
    };
    
    return icons[type] || icons.other;
}

function updateProfileCompletion() {
    let completionScore = 0;
    const completionItems = [];
    
    // Check basic information
    if (profileState.user.name && profileState.user.email && profileState.user.phone) {
        completionScore += 25;
        completionItems.push({ completed: true, text: 'Basic Information' });
    } else {
        completionItems.push({ completed: false, text: 'Basic Information' });
    }
    
    // Check security settings
    if (profileState.security.twoFactorEnabled && profileState.security.securityQuestionsSet === 3) {
        completionScore += 25;
        completionItems.push({ completed: true, text: 'Security Settings' });
    } else {
        completionItems.push({ completed: false, text: 'Security Settings' });
    }
    
    // Check 2FA
    if (profileState.security.twoFactorEnabled) {
        completionScore += 25;
        completionItems.push({ completed: true, text: '2FA Enabled' });
    } else {
        completionItems.push({ completed: false, text: '2FA Enabled' });
    }
    
    // Check emergency contact
    if (profileState.user.emergencyContact) {
        completionScore += 20;
        completionItems.push({ completed: true, text: 'Emergency Contact' });
    } else {
        completionItems.push({ completed: false, text: 'Emergency Contact Missing' });
    }
    
    // Check notification preferences
    completionScore += 5; // Always give 5% for having some preferences
    completionItems.push({ completed: true, text: 'Notification Preferences' });
    
    // Update display
    document.querySelector('.completion-percentage').textContent = completionScore + '%';
    document.querySelector('.completion-progress').style.width = completionScore + '%';
    
    // Update completion items
    const completionDetails = document.querySelector('.completion-details');
    completionDetails.innerHTML = '';
    
    completionItems.forEach(item => {
        const itemHTML = `
            <div class="completion-item ${item.completed ? 'completed' : 'incomplete'}">
                <i class="fas fa-${item.completed ? 'check-circle' : 'exclamation-triangle'}"></i>
                <span>${item.text}</span>
            </div>
        `;
        completionDetails.insertAdjacentHTML('beforeend', itemHTML);
    });
    
    profileState.profileCompletion = completionScore;
}

function showNotification(type, message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 16px 24px;
        background: ${getNotificationColor(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'info': 'info-circle',
        'warning': 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#10B981',
        'error': '#EF4444',
        'info': '#3B82F6',
        'warning': '#F59E0B'
    };
    return colors[type] || '#3B82F6';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
}

function showLoadingState(buttonId) {
    const button = document.getElementById(buttonId) || document.querySelector(`[onclick*="${buttonId}"]`);
    if (button) {
        button.disabled = true;
        button.classList.add('loading');
        button.innerHTML += ' <i class="fas fa-spinner fa-spin"></i>';
    }
}

function hideLoadingState(buttonId) {
    const button = document.getElementById(buttonId) || document.querySelector(`[onclick*="${buttonId}"]`);
    if (button) {
        button.disabled = false;
        button.classList.remove('loading');
        button.innerHTML = button.innerHTML.replace(' <i class="fas fa-spinner fa-spin"></i>', '');
    }
}

function applyTheme() {
    const theme = profileState.settings.theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update dark mode button
    const darkModeBtn = document.querySelector('.dark-mode-btn');
    if (darkModeBtn) {
        darkModeBtn.innerHTML = `
            <i class="fas fa-${theme === 'dark' ? 'sun' : 'moon'}"></i>
            <span>${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        `;
    }
}

function toggleDarkMode() {
    profileState.settings.theme = profileState.settings.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveToLocalStorage();
    
    // Update theme radio button
    document.querySelector(`input[name="theme"][value="${profileState.settings.theme}"]`).checked = true;
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function generateDataPackage() {
    const data = {
        profile: profileState.dataExport.includeProfile ? profileState.user : null,
        activity: profileState.dataExport.includeActivity ? profileState.activity : null,
        settings: profileState.dataExport.includeSettings ? profileState.settings : null,
        sessions: profileState.dataExport.includeSessions ? profileState.sessions.activeSessions : null,
        exportDate: new Date().toISOString()
    };
    
    if (profileState.dataExport.format === 'json') {
        return JSON.stringify(data, null, 2);
    } else if (profileState.dataExport.format === 'csv') {
        return convertToCSV(data);
    } else {
        return generatePDFContent(data);
    }
}

function convertToCSV(data) {
    let csv = 'Curis Profile Data Export\n\n';
    
    if (data.profile) {
        csv += 'PROFILE INFORMATION\n';
        csv += 'Field,Value\n';
        Object.entries(data.profile).forEach(([key, value]) => {
            csv += `"${key}","${value}"\n`;
        });
        csv += '\n';
    }
    
    if (data.activity) {
        csv += 'ACTIVITY LOG\n';
        csv += 'Time,Action,Description,IP,Location\n';
        data.activity.forEach(activity => {
            csv += `"${activity.time}","${activity.action}","${activity.description}","${activity.ip}","${activity.location}"\n`;
        });
    }
    
    return csv;
}

function generatePDFContent(data) {
    // In real implementation, use a PDF library
    return `Curis Profile Data Export\n\nGenerated: ${data.exportDate}\n\n${JSON.stringify(data, null, 2)}`;
}

function generateRandomCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function markNotificationsAsRead() {
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    unreadItems.forEach(item => {
        setTimeout(() => {
            item.classList.remove('unread');
        }, 1000);
    });
    
    // Update badge
    setTimeout(() => {
        updateNotificationBadge();
    }, 1500);
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

function playNotificationSound() {
    // In real implementation, play a notification sound
    console.log('Playing notification sound');
}

function resetSessionTimeout() {
    // Reset session timeout logic
    console.log('Session timeout reset');
}

function showKeyboardShortcutsModal(shortcuts) {
    // Create and show keyboard shortcuts modal
    alert('Keyboard Shortcuts:\n\n' + shortcuts.map(s => `${s.key} - ${s.action}`).join('\n'));
}

function showBackupCodesModal(codes) {
    alert('Backup Codes:\n\n' + codes.join('\n') + '\n\nKeep these codes safe!');
}

function showSecurityQuestionsModal() {
    alert('Security Questions configuration would open here');
}

function showDeviceManagementModal() {
    alert('Device Management would open here');
}

function showSessionDetailsModal() {
    alert('Session Details would open here');
}

function updateTrustedDevicesDisplay() {
    // Update trusted devices display
    console.log('Updating trusted devices display');
}

function initializeFormListeners() {
    // Add event listeners for form changes
    const dateRangeSelect = document.getElementById('dateRange');
    const actionTypeSelect = document.getElementById('actionType');
    const showPerPageSelect = document.getElementById('showPerPage');
    
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', applyActivityFilters);
    }
    
    if (actionTypeSelect) {
        actionTypeSelect.addEventListener('change', applyActivityFilters);
    }
    
    if (showPerPageSelect) {
        showPerPageSelect.addEventListener('change', applyActivityFilters);
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
    // Ctrl + S - Save changes
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveAccountSettings();
    }
    
    // Ctrl + E - Edit profile
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        openEditProfileModal();
    }
    
    // Ctrl + D - Download data
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        downloadMyData();
    }
    
    // Ctrl + P - Print profile
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        printProfile();
    }
    
    // Esc - Close modal
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay:not(.hidden)');
        modals.forEach(modal => {
            modal.classList.add('hidden');
        });
    }
    
    // Alt + N - Toggle notifications
    if (e.altKey && e.key === 'n') {
        e.preventDefault();
        toggleNotifications();
    }
    
    // Alt + U - Toggle user menu
    if (e.altKey && e.key === 'u') {
        e.preventDefault();
        toggleUserDropdown();
    }
    
    // Alt + T - Toggle theme
    if (e.altKey && e.key === 't') {
        e.preventDefault();
        toggleDarkMode();
    }
}

function loadUserData() {
    // Load user data from local storage
    const savedData = localStorage.getItem('curisProfileData');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.assign(profileState, data);
    }
}

function saveToLocalStorage() {
    localStorage.setItem('curisProfileData', JSON.stringify(profileState));
}

function startRealtimeUpdates() {
    // Update session times every minute
    setInterval(() => {
        updateSessionTimes();
    }, 60000);
    
    // Check for profile updates every 5 minutes
    setInterval(() => {
        checkForProfileUpdates();
    }, 300000);
}

function updateSessionTimes() {
    // Update relative times in sessions display
    console.log('Updating session times');
}

function checkForProfileUpdates() {
    // Check for any profile updates from server
    console.log('Checking for profile updates');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);

// ===================================
// END OF MY PROFILE JAVASCRIPT
// ===================================
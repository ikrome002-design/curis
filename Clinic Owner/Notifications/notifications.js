/**
 * ====================================
 * CURIS NOTIFICATIONS CENTER - COMPLETE JAVASCRIPT
 * Real-time Command Center Implementation
 * Comprehensive Notification Management System
 * ====================================
 */

// ====================================
// GLOBAL VARIABLES & CONFIGURATION
// ====================================
const NotificationsApp = {
    // Application state
    state: {
        isConnected: true,
        notifications: [],
        filters: {
            priority: 'all',
            status: 'all',
            type: 'all'
        },
        settings: {
            realTimeUpdates: true,
            soundEnabled: true,
            emailNotifications: true,
            smsNotifications: true
        },
        currentUser: {
            name: 'Dr. Sarah Wilson',
            role: 'Clinic Owner',
            email: 'owner@clinic.com',
            phone: '+254 700 123 456'
        }
    },

    // WebSocket connection
    websocket: null,

    // Update intervals
    intervals: {
        connectionCheck: null,
        dataRefresh: null
    },

    // Notification counters
    counters: {
        unread: 23,
        actionRequired: 8,
        high: 3,
        medium: 8,
        low: 12
    }
};

// ====================================
// INITIALIZATION & SETUP
// ====================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🔔 Notifications Center Initializing...');

    initializeApp();
    setupEventListeners();
    loadInitialData();
    establishWebSocketConnection();
    startRealTimeUpdates();

    console.log('✅ Notifications Center Ready');
});

function initializeApp() {
    // Initialize sidebar navigation
    initializeSidebar();

    // Setup user profile
    setupUserProfile();

    // Initialize notification counters
    updateNotificationCounters();

    // Setup connection status
    updateConnectionStatus(true);

    // Initialize real-time indicator
    showRealTimeIndicator();

    // Load saved settings
    loadUserSettings();

    // Initialize toast container
    initializeToastContainer();
}

function initializeSidebar() {
    // Mark notifications page as active in sidebar
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        if (link && link.textContent.includes('Notifications')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function setupUserProfile() {
    const profileName = document.querySelector('.profile-name');
    if (profileName) {
        profileName.textContent = NotificationsApp.state.currentUser.name;
    }
}

// ====================================
// EVENT LISTENERS SETUP
// ====================================
function setupEventListeners() {
    // Quick Actions
    setupQuickActionsListeners();

    // Alert Panels
    setupAlertPanelListeners();

    // Internal Notifications
    setupInternalNotificationsListeners();

    // Modal Management
    setupModalListeners();

    // Notification History
    setupHistoryListeners();

    // Settings
    setupSettingsListeners();

    // User Interface
    setupUIListeners();

    // Form Handlers
    setupFormListeners();

    // Keyboard Shortcuts
    setupKeyboardShortcuts();
}

function setupQuickActionsListeners() {
    // Mark All Read
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', handleMarkAllRead);
    }

    // Create Announcement
    const createAnnouncementBtn = document.getElementById('createAnnouncementBtn');
    if (createAnnouncementBtn) {
        createAnnouncementBtn.addEventListener('click', () => {
            showModal('staffAnnouncementModal');
        });
    }

    // Refresh All
    const refreshAllBtn = document.getElementById('refreshAllBtn');
    if (refreshAllBtn) {
        refreshAllBtn.addEventListener('click', handleRefreshAll);
    }

    // Export History
    const exportHistoryBtn = document.getElementById('exportHistoryBtn');
    if (exportHistoryBtn) {
        exportHistoryBtn.addEventListener('click', handleExportHistory);
    }

    // Emergency Alert
    const emergencyAlertBtn = document.getElementById('emergencyAlertBtn');
    if (emergencyAlertBtn) {
        emergencyAlertBtn.addEventListener('click', () => {
            showModal('emergencyAlertModal');
        });
    }

    // Settings Button
    const notificationSettingsBtn = document.getElementById('notificationSettingsBtn');
    if (notificationSettingsBtn) {
        notificationSettingsBtn.addEventListener('click', () => {
            showModal('notificationSettingsModal');
        });
    }

    // Filter Controls
    const priorityFilter = document.getElementById('priorityFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (priorityFilter) {
        priorityFilter.addEventListener('change', handleFilterChange);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilterChange);
    }
}

function setupAlertPanelListeners() {
    // View All Buttons
    const viewAllBtns = document.querySelectorAll('.view-all-btn');
    viewAllBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            handleViewAllAlerts(type);
        });
    });

    // Alert Items
    const alertItems = document.querySelectorAll('.alert-item');
    alertItems.forEach(item => {
        // Click to view details
        item.addEventListener('click', function (e) {
            if (!e.target.closest('.alert-actions')) {
                const alertId = this.getAttribute('data-alert');
                handleViewAlertDetails(alertId);
            }
        });

        // Action buttons
        const actionBtns = item.querySelectorAll('.alert-action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const action = this.textContent.trim().toLowerCase();
                const alertId = item.getAttribute('data-alert');
                handleAlertAction(alertId, action);
            });
        });
    });
}

function setupInternalNotificationsListeners() {
    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');
            switchNotificationTab(tabName);
        });
    });

    // Staff Announcement Creation
    const createStaffAnnouncementBtn = document.getElementById('createStaffAnnouncementBtn');
    if (createStaffAnnouncementBtn) {
        createStaffAnnouncementBtn.addEventListener('click', () => {
            showModal('staffAnnouncementModal');
        });
    }

    // Notification Action Buttons
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const action = this.querySelector('i').className;
            const notificationItem = this.closest('.notification-item');
            handleNotificationAction(notificationItem, action);
        });
    });

    // Send Reminder Buttons
    const sendReminderBtns = document.querySelectorAll('.send-reminder-btn');
    sendReminderBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const staffSchedule = this.closest('.staff-schedule');
            handleSendReminder(staffSchedule);
        });
    });
}

function setupModalListeners() {
    // Modal Close Buttons
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            hideModal(modal.id);
        });
    });

    // Modal Background Click
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                hideModal(this.id);
            }
        });
    });

    // Specific Modal Buttons
    setupPaymentAlertModalListeners();
    setupAnnouncementModalListeners();
    setupSettingsModalListeners();
    setupEmergencyModalListeners();
    setupHistorySearchModalListeners();
    setupThresholdModalListeners();
}

function setupHistoryListeners() {
    // Search History Button
    const searchHistoryBtn = document.getElementById('searchHistoryBtn');
    if (searchHistoryBtn) {
        searchHistoryBtn.addEventListener('click', () => {
            showModal('historySearchModal');
        });
    }

    // Manage Status Button
    const manageStatusBtn = document.getElementById('manageStatusBtn');
    if (manageStatusBtn) {
        manageStatusBtn.addEventListener('click', handleManageStatus);
    }

    // History Item Actions
    const historyItems = document.querySelectorAll('.history-item');
    historyItems.forEach(item => {
        item.addEventListener('click', function (e) {
            if (!e.target.closest('.item-actions')) {
                handleViewHistoryItem(this);
            }
        });

        const actionBtns = item.querySelectorAll('.item-action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const action = this.textContent.trim();
                handleHistoryAction(item, action);
            });
        });
    });

    // Pagination
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            if (!this.disabled) {
                const direction = this.textContent.includes('Previous') ? 'prev' : 'next';
                handlePagination(direction);
            }
        });
    });
}

function setupSettingsListeners() {
    // Threshold Settings Button
    const thresholdSettingsBtn = document.getElementById('thresholdSettingsBtn');
    if (thresholdSettingsBtn) {
        thresholdSettingsBtn.addEventListener('click', () => {
            showModal('thresholdSettingsModal');
        });
    }

    // System Alert Actions
    const alertBtns = document.querySelectorAll('.alert-btn');
    alertBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const action = this.textContent.trim();
            const alertElement = this.closest('.system-alert');
            handleSystemAlertAction(alertElement, action);
        });
    });
}

function setupUIListeners() {
    // User Profile Dropdown
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (userProfileBtn && userDropdown) {
        userProfileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        document.addEventListener('click', function () {
            userDropdown.classList.remove('show');
        });
    }

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // Connection Status Click
    const connectionStatus = document.getElementById('connectionStatus');
    if (connectionStatus) {
        connectionStatus.addEventListener('click', handleConnectionStatusClick);
    }
}

function setupFormListeners() {
    // Announcement Form
    const announcementForm = document.getElementById('announcementForm');
    if (announcementForm) {
        announcementForm.addEventListener('submit', handleAnnouncementSubmit);

        // Real-time preview updates
        const titleInput = document.getElementById('announcementTitle');
        const messageInput = document.getElementById('announcementMessage');

        if (titleInput) {
            titleInput.addEventListener('input', updateAnnouncementPreview);
        }

        if (messageInput) {
            messageInput.addEventListener('input', updateAnnouncementPreview);
        }
    }

    // Emergency Alert Form
    const emergencyForm = document.getElementById('emergencyAlertForm');
    if (emergencyForm) {
        emergencyForm.addEventListener('submit', handleEmergencySubmit);
    }

    // Settings Forms
    setupSettingsFormListeners();
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        // Ctrl/Cmd + R: Refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            handleRefreshAll();
        }

        // Ctrl/Cmd + M: Mark all read
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            handleMarkAllRead();
        }

        // Ctrl/Cmd + N: New announcement
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            showModal('staffAnnouncementModal');
        }

        // Ctrl/Cmd + F: Search history
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            showModal('historySearchModal');
        }

        // Escape: Close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// ====================================
// REAL-TIME DATA & WEBSOCKET
// ====================================
function establishWebSocketConnection() {
    // Simulate WebSocket connection for demo
    console.log('🔗 Establishing WebSocket connection...');

    // In a real implementation, this would be:
    // NotificationsApp.websocket = new WebSocket('wss://your-websocket-url');

    // Simulate connection events
    setTimeout(() => {
        updateConnectionStatus(true);
        showToast('success', 'Real-time Connection Established', 'Live notifications are now active');

        // Start receiving simulated real-time updates
        startSimulatedUpdates();
    }, 1000);
}

function startSimulatedUpdates() {
    // Simulate periodic notification updates
    setInterval(() => {
        if (NotificationsApp.state.settings.realTimeUpdates) {
            // Simulate random notifications
            const notifications = [
                {
                    type: 'payment',
                    priority: 'high',
                    title: 'Payment Failure Alert',
                    message: 'Failed payment from ' + generateRandomPatientName(),
                    timestamp: new Date()
                },
                {
                    type: 'appointment',
                    priority: 'medium',
                    title: 'New Appointment Request',
                    message: 'Booking request for tomorrow morning',
                    timestamp: new Date()
                },
                {
                    type: 'system',
                    priority: 'low',
                    title: 'System Update',
                    message: 'Backup completed successfully',
                    timestamp: new Date()
                }
            ];

            // Randomly add a notification
            if (Math.random() < 0.3) { // 30% chance every interval
                const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
                addRealTimeNotification(randomNotification);
            }
        }
    }, 15000); // Every 15 seconds
}

function addRealTimeNotification(notification) {
    // Update counters
    NotificationsApp.counters.unread++;
    NotificationsApp.counters[notification.priority]++;

    // Update UI
    updateNotificationCounters();

    // Show toast notification
    if (NotificationsApp.state.settings.soundEnabled) {
        playNotificationSound();
    }

    showToast(notification.priority === 'high' ? 'error' : 'info',
        notification.title,
        notification.message);

    // Add visual indicator
    addNotificationToPanel(notification);

    console.log('📨 New real-time notification:', notification);
}

function updateConnectionStatus(isConnected) {
    NotificationsApp.state.isConnected = isConnected;
    const statusIndicator = document.getElementById('connectionStatus');

    if (statusIndicator) {
        if (isConnected) {
            statusIndicator.classList.add('active');
            statusIndicator.innerHTML = '<i class="fas fa-circle"></i><span>Live</span>';
        } else {
            statusIndicator.classList.remove('active');
            statusIndicator.innerHTML = '<i class="fas fa-circle"></i><span>Offline</span>';
        }
    }
}

function startRealTimeUpdates() {
    // Update connection check
    NotificationsApp.intervals.connectionCheck = setInterval(() => {
        // Simulate occasional connection issues
        if (Math.random() < 0.05) { // 5% chance of connection issue
            updateConnectionStatus(false);
            setTimeout(() => {
                updateConnectionStatus(true);
                showToast('success', 'Connection Restored', 'Real-time updates resumed');
            }, 3000);
        }
    }, 30000); // Check every 30 seconds

    // Data refresh interval
    NotificationsApp.intervals.dataRefresh = setInterval(() => {
        refreshNotificationData();
    }, 60000); // Refresh every minute
}

// ====================================
// NOTIFICATION MANAGEMENT
// ====================================
function loadInitialData() {
    // Load sample notification data
    const sampleNotifications = generateSampleNotifications();
    NotificationsApp.state.notifications = sampleNotifications;

    // Update counters based on loaded data
    updateCountersFromData();

    // Populate UI elements
    populateNotificationPanels();
    populateNotificationHistory();
    populateSystemAlerts();

    console.log('📊 Initial data loaded:', sampleNotifications.length, 'notifications');
}

function generateSampleNotifications() {
    const notifications = [];
    const types = ['payment', 'appointment', 'staff', 'system', 'billing'];
    const priorities = ['high', 'medium', 'low'];
    const statuses = ['unread', 'read', 'action-required', 'resolved'];

    for (let i = 0; i < 50; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        notifications.push({
            id: `notif-${Date.now()}-${i}`,
            type: type,
            priority: priority,
            status: status,
            title: generateNotificationTitle(type, priority),
            message: generateNotificationMessage(type),
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
            source: type === 'staff' ? 'Dr. Sarah Wilson' : 'System',
            actionRequired: status === 'action-required'
        });
    }

    return notifications.sort((a, b) => b.timestamp - a.timestamp);
}

function generateNotificationTitle(type, priority) {
    const titles = {
        payment: ['Payment Failure Alert', 'Payment Successful', 'Overdue Invoice Reminder'],
        appointment: ['New Appointment Request', 'Appointment Cancelled', 'No-show Alert'],
        staff: ['Schedule Change Notice', 'Staff Performance Alert', 'Leave Request'],
        system: ['System Maintenance', 'Backup Complete', 'Update Available'],
        billing: ['Service Charge Due', 'Revenue Summary', 'Billing Cycle Complete']
    };

    const typeList = titles[type] || ['General Notification'];
    return typeList[Math.floor(Math.random() * typeList.length)];
}

function generateNotificationMessage(type) {
    const messages = {
        payment: 'Payment processing issue requires attention',
        appointment: 'New patient booking requires confirmation',
        staff: 'Staff schedule update notification',
        system: 'System status update notification',
        billing: 'Billing cycle information update'
    };

    return messages[type] || 'General notification message';
}

function generateRandomPatientName() {
    const firstNames = ['Sarah', 'Michael', 'Lisa', 'David', 'Emily', 'James', 'Maria', 'Robert'];
    const lastNames = ['Johnson', 'Smith', 'Brown', 'Wilson', 'Davis', 'Miller', 'Garcia', 'Martinez'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
}

function updateNotificationCounters() {
    // Update header badge
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
        notificationBadge.textContent = NotificationsApp.counters.unread;
    }

    // Update alert summary
    const alertSummary = document.querySelector('.alert-summary');
    if (alertSummary) {
        const highCount = alertSummary.querySelector('.alert-count.high');
        const mediumCount = alertSummary.querySelector('.alert-count.medium');
        const lowCount = alertSummary.querySelector('.alert-count.low');

        if (highCount) highCount.textContent = `${NotificationsApp.counters.high} Critical`;
        if (mediumCount) mediumCount.textContent = `${NotificationsApp.counters.medium} Important`;
        if (lowCount) lowCount.textContent = `${NotificationsApp.counters.low} Info`;
    }

    // Update history summary
    const summaryStats = document.querySelector('.summary-stats');
    if (summaryStats) {
        const stats = summaryStats.querySelectorAll('.stat-value');
        if (stats.length >= 4) {
            stats[0].textContent = '1,247'; // Total
            stats[1].textContent = NotificationsApp.counters.unread;
            stats[2].textContent = NotificationsApp.counters.actionRequired;
            stats[3].textContent = '2.3h'; // Avg response time
        }
    }
}

function updateCountersFromData() {
    const notifications = NotificationsApp.state.notifications;

    NotificationsApp.counters = {
        unread: notifications.filter(n => n.status === 'unread').length,
        actionRequired: notifications.filter(n => n.actionRequired).length,
        high: notifications.filter(n => n.priority === 'high').length,
        medium: notifications.filter(n => n.priority === 'medium').length,
        low: notifications.filter(n => n.priority === 'low').length
    };
}

// ====================================
// QUICK ACTIONS HANDLERS
// ====================================
function handleMarkAllRead() {
    showLoadingSpinner();

    setTimeout(() => {
        // Update all notifications to read
        NotificationsApp.state.notifications.forEach(notification => {
            if (notification.status === 'unread') {
                notification.status = 'read';
            }
        });

        // Update counters
        NotificationsApp.counters.unread = 0;
        updateNotificationCounters();

        // Update UI elements
        const unreadItems = document.querySelectorAll('.history-item.unread');
        unreadItems.forEach(item => {
            item.classList.remove('unread');
            item.classList.add('read');
        });

        const alertItems = document.querySelectorAll('.alert-item');
        alertItems.forEach(item => {
            item.style.opacity = '0.7';
        });

        hideLoadingSpinner();
        showToast('success', 'All Notifications Marked as Read', 'All unread notifications have been marked as read');

        console.log('✅ All notifications marked as read');
    }, 1000);
}

function handleRefreshAll() {
    showLoadingSpinner();

    // Animate refresh button
    const refreshBtn = document.getElementById('refreshAllBtn');
    if (refreshBtn) {
        const icon = refreshBtn.querySelector('i');
        if (icon) {
            icon.style.animation = 'spin 1s linear infinite';
        }
    }

    setTimeout(() => {
        // Simulate data refresh
        refreshNotificationData();

        // Reset animation
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            if (icon) {
                icon.style.animation = '';
            }
        }

        hideLoadingSpinner();
        showToast('success', 'Data Refreshed', 'All notification data has been updated');

        console.log('🔄 All data refreshed');
    }, 1500);
}

function handleExportHistory() {
    showLoadingSpinner();

    setTimeout(() => {
        // Generate export data
        const exportData = generateExportData();

        // Create and download file
        downloadFile('notification-history.csv', exportData, 'text/csv');

        hideLoadingSpinner();
        showToast('success', 'Export Complete', 'Notification history has been exported to CSV');

        console.log('📤 History exported');
    }, 2000);
}

function refreshNotificationData() {
    // Simulate server data fetch
    const newNotifications = Math.floor(Math.random() * 5); // 0-4 new notifications

    for (let i = 0; i < newNotifications; i++) {
        const notification = {
            id: `notif-${Date.now()}-${i}`,
            type: ['payment', 'appointment', 'system'][Math.floor(Math.random() * 3)],
            priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
            status: 'unread',
            title: 'New Update Available',
            message: 'Recent system update notification',
            timestamp: new Date(),
            source: 'System'
        };

        NotificationsApp.state.notifications.unshift(notification);
    }

    // Update counters and UI
    updateCountersFromData();
    updateNotificationCounters();

    // Update visual elements
    populateNotificationPanels();

    if (newNotifications > 0) {
        showToast('info', 'New Notifications', `${newNotifications} new notifications received`);
    }
}

function generateExportData() {
    const notifications = NotificationsApp.state.notifications;
    let csv = 'Date,Time,Type,Priority,Status,Title,Message,Source\n';

    notifications.forEach(notification => {
        const date = notification.timestamp.toLocaleDateString();
        const time = notification.timestamp.toLocaleTimeString();
        const row = [
            date,
            time,
            notification.type,
            notification.priority,
            notification.status,
            `"${notification.title}"`,
            `"${notification.message}"`,
            notification.source
        ].join(',');

        csv += row + '\n';
    });

    return csv;
}

function downloadFile(filename, content, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

// ====================================
// ALERT PANEL HANDLERS
// ====================================
function handleViewAllAlerts(type) {
    console.log(`👁️ Viewing all ${type} alerts`);

    // Filter notifications by type
    const filteredNotifications = NotificationsApp.state.notifications.filter(n => n.type === type);

    // Show detailed view modal or navigate to dedicated page
    showDetailedAlertsView(type, filteredNotifications);
}

function handleViewAlertDetails(alertId) {
    console.log(`👁️ Viewing alert details: ${alertId}`);

    // Find the alert
    const alert = NotificationsApp.state.notifications.find(n => n.id === alertId);

    if (alert) {
        // Show appropriate modal based on alert type
        if (alertId.includes('payment')) {
            showModal('paymentAlertModal');
            populatePaymentAlertModal(alert);
        } else {
            showAlertDetailsModal(alert);
        }
    }
}

function handleAlertAction(alertId, action) {
    console.log(`⚡ Performing action: ${action} on alert: ${alertId}`);

    const alert = NotificationsApp.state.notifications.find(n => n.id === alertId);

    if (!alert) return;

    switch (action) {
        case 'contact':
            handleContactPatient(alert);
            break;
        case 'retry':
            handleRetryPayment(alert);
            break;
        case 'confirm':
            handleConfirmAppointment(alert);
            break;
        case 'reschedule':
            handleRescheduleAppointment(alert);
            break;
        case 'view details':
            handleViewAlertDetails(alertId);
            break;
        default:
            console.log(`Unknown action: ${action}`);
    }
}

function handleContactPatient(alert) {
    showToast('info', 'Contacting Patient', 'Opening communication options...');

    // Simulate contact options
    setTimeout(() => {
        const contactOptions = [
            { method: 'Call', icon: 'fas fa-phone', action: () => console.log('📞 Calling patient') },
            { method: 'SMS', icon: 'fas fa-sms', action: () => console.log('💬 Sending SMS') },
            { method: 'Email', icon: 'fas fa-envelope', action: () => console.log('📧 Sending email') }
        ];

        showContactOptionsModal(alert, contactOptions);
    }, 500);
}

function handleRetryPayment(alert) {
    showLoadingSpinner();

    setTimeout(() => {
        // Simulate payment retry
        const success = Math.random() > 0.5; // 50% success rate

        if (success) {
            alert.status = 'resolved';
            updateAlertInUI(alert);
            showToast('success', 'Payment Successful', 'Payment has been processed successfully');
        } else {
            showToast('error', 'Payment Failed Again', 'Please try alternative payment method');
        }

        hideLoadingSpinner();
    }, 2000);
}

function handleConfirmAppointment(alert) {
    showLoadingSpinner();

    setTimeout(() => {
        alert.status = 'resolved';
        updateAlertInUI(alert);
        showToast('success', 'Appointment Confirmed', 'Patient has been notified');
        hideLoadingSpinner();
    }, 1000);
}

function handleRescheduleAppointment(alert) {
    showToast('info', 'Opening Calendar', 'Loading available appointment slots...');

    setTimeout(() => {
        // Simulate calendar integration
        showRescheduleModal(alert);
    }, 1000);
}

function updateAlertInUI(alert) {
    const alertElement = document.querySelector(`[data-alert="${alert.id}"]`);
    if (alertElement) {
        if (alert.status === 'resolved') {
            alertElement.style.opacity = '0.6';
            alertElement.style.backgroundColor = '#F0FDF4';

            // Add resolved indicator
            const resolvedBadge = document.createElement('span');
            resolvedBadge.className = 'status-badge resolved';
            resolvedBadge.innerHTML = '<i class="fas fa-check"></i> Resolved';

            const alertDetails = alertElement.querySelector('.alert-details');
            if (alertDetails) {
                alertDetails.appendChild(resolvedBadge);
            }
        }
    }
}

function addNotificationToPanel(notification) {
    const panel = document.querySelector(`.${notification.type}-alerts .panel-content`);
    if (!panel) return;

    const alertElement = createAlertElement(notification);
    panel.insertBefore(alertElement, panel.firstChild);

    // Animate appearance
    alertElement.style.opacity = '0';
    alertElement.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        alertElement.style.transition = 'all 0.3s ease-out';
        alertElement.style.opacity = '1';
        alertElement.style.transform = 'translateY(0)';
    }, 100);
}

function createAlertElement(notification) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-item ${notification.priority}-priority`;
    alertDiv.setAttribute('data-alert', notification.id);

    alertDiv.innerHTML = `
        <div class="alert-indicator"></div>
        <div class="alert-details">
            <h5>${notification.title}</h5>
            <p>${notification.message}</p>
            <span class="alert-time">Just now</span>
        </div>
        <div class="alert-actions">
            <button class="alert-action-btn primary">
                <i class="fas fa-eye"></i>
                View
            </button>
            <button class="alert-action-btn secondary">
                <i class="fas fa-check"></i>
                Resolve
            </button>
        </div>
    `;

    // Add event listeners
    const actionBtns = alertDiv.querySelectorAll('.alert-action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const action = this.textContent.trim().toLowerCase();
            handleAlertAction(notification.id, action);
        });
    });

    return alertDiv;
}

// ====================================
// INTERNAL NOTIFICATIONS HANDLERS
// ====================================
function switchNotificationTab(tabName) {
    // Remove active class from all tabs and content
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const activeTabContent = document.querySelector(`.${tabName}-tab`);

    if (activeTabBtn) activeTabBtn.classList.add('active');
    if (activeTabContent) activeTabContent.classList.add('active');

    console.log(`📋 Switched to ${tabName} tab`);
}

function handleNotificationAction(notificationItem, action) {
    const notificationId = notificationItem.getAttribute('data-notification-id') ||
        'notif-' + Date.now();

    console.log(`🔔 Notification action: ${action} on ${notificationId}`);

    if (action.includes('fa-eye')) {
        // View notification details
        showNotificationDetailsModal(notificationItem);
    } else if (action.includes('fa-reply')) {
        // Reply to notification
        showReplyModal(notificationItem);
    } else if (action.includes('fa-check')) {
        // Mark as acknowledged
        markNotificationAsAcknowledged(notificationItem);
    } else if (action.includes('fa-archive')) {
        // Archive notification
        archiveNotification(notificationItem);
    }
}

function handleSendReminder(staffSchedule) {
    const staffName = staffSchedule.querySelector('h5').textContent;

    showLoadingSpinner();

    setTimeout(() => {
        showToast('success', 'Reminder Sent', `Appointment reminder sent to ${staffName}`);

        // Update status indicator
        const statusIndicator = staffSchedule.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.classList.remove('pending');
            statusIndicator.classList.add('confirmed');
            statusIndicator.textContent = 'Reminder Sent';
        }

        hideLoadingSpinner();
    }, 1500);
}

function markNotificationAsAcknowledged(notificationItem) {
    notificationItem.style.opacity = '0.7';

    // Add acknowledged badge
    const acknowledgedBadge = document.createElement('span');
    acknowledgedBadge.className = 'status-badge acknowledged';
    acknowledgedBadge.innerHTML = '<i class="fas fa-check"></i> Acknowledged';

    const readStatus = notificationItem.querySelector('.read-status');
    if (readStatus) {
        readStatus.appendChild(acknowledgedBadge);
    }

    showToast('success', 'Acknowledged', 'Notification marked as acknowledged');
}

function archiveNotification(notificationItem) {
    notificationItem.style.transition = 'all 0.3s ease-out';
    notificationItem.style.transform = 'translateX(-100%)';
    notificationItem.style.opacity = '0';

    setTimeout(() => {
        notificationItem.remove();
        showToast('info', 'Archived', 'Notification moved to archive');
    }, 300);
}

// ====================================
// MODAL MANAGEMENT
// ====================================
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';

        // Focus management
        const firstFocusable = modal.querySelector('input, button, select, textarea');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        console.log(`📱 Modal opened: ${modalId}`);
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);

        // Restore body scroll
        document.body.style.overflow = '';

        console.log(`📱 Modal closed: ${modalId}`);
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        hideModal(modal.id);
    });
}

// ====================================
// SPECIFIC MODAL HANDLERS
// ====================================
function setupPaymentAlertModalListeners() {
    // Contact Patient button
    const contactPatientBtn = document.querySelector('#paymentAlertModal .btn-primary');
    if (contactPatientBtn) {
        contactPatientBtn.addEventListener('click', function () {
            showToast('info', 'Initiating Contact', 'Opening patient communication...');
            hideModal('paymentAlertModal');
        });
    }

    // Retry Payment button
    const retryPaymentBtn = document.querySelector('#paymentAlertModal .btn-secondary');
    if (retryPaymentBtn) {
        retryPaymentBtn.addEventListener('click', function () {
            showToast('info', 'Retrying Payment', 'Processing payment retry...');
            hideModal('paymentAlertModal');
        });
    }

    // Contact buttons in modal
    const contactBtns = document.querySelectorAll('#paymentAlertModal .contact-btn');
    contactBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const method = this.textContent.trim();
            showToast('info', `${method} Initiated`, `Opening ${method.toLowerCase()} application...`);
        });
    });

    // Retry options
    const retryOptions = document.querySelectorAll('#paymentAlertModal .retry-option');
    retryOptions.forEach(option => {
        option.addEventListener('click', function () {
            const method = this.querySelector('span').textContent;
            showToast('info', 'Alternative Selected', `${method} option selected`);
        });
    });
}

function setupAnnouncementModalListeners() {
    // Save Draft button
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', handleSaveDraft);
    }

    // Preview button
    const previewBtn = document.getElementById('previewAnnouncementBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', handlePreviewAnnouncement);
    }

    // Recipient selection changes
    const recipientCheckboxes = document.querySelectorAll('input[name="recipients"]');
    recipientCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateRecipientSelection);
    });

    // Priority selection changes
    const priorityRadios = document.querySelectorAll('input[name="priority"]');
    priorityRadios.forEach(radio => {
        radio.addEventListener('change', updateAnnouncementPreview);
    });

    // Rich text editor buttons
    const editorBtns = document.querySelectorAll('.editor-btn');
    editorBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const action = this.getAttribute('data-action');
            executeEditorAction(action);
        });
    });
}

function setupSettingsModalListeners() {
    // Settings tabs
    const settingsTabBtns = document.querySelectorAll('.settings-tab-btn');
    settingsTabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');
            switchSettingsTab(tabName);
        });
    });

    // Save Settings button
    const saveSettingsBtn = document.getElementById('saveNotificationSettings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', handleSaveSettings);
    }

    // Reset Settings button
    const resetSettingsBtn = document.getElementById('resetNotificationSettings');
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', handleResetSettings);
    }

    // Test Notifications button
    const testNotificationsBtn = document.getElementById('testNotifications');
    if (testNotificationsBtn) {
        testNotificationsBtn.addEventListener('click', handleTestNotifications);
    }

    // Toggle switches
    const toggleSwitches = document.querySelectorAll('.toggle-slider');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const checkbox = this.previousElementSibling;
            if (checkbox && checkbox.type === 'checkbox') {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    });
}

function setupEmergencyModalListeners() {
    // Send Emergency Alert button
    const sendEmergencyBtn = document.getElementById('sendEmergencyAlert');
    if (sendEmergencyBtn) {
        sendEmergencyBtn.addEventListener('click', handleSendEmergencyAlert);
    }

    // Call Emergency Services button
    const callEmergencyBtn = document.getElementById('callEmergencyServices');
    if (callEmergencyBtn) {
        callEmergencyBtn.addEventListener('click', handleCallEmergencyServices);
    }

    // Contact Owner button
    const contactOwnerBtn = document.getElementById('contactOwner');
    if (contactOwnerBtn) {
        contactOwnerBtn.addEventListener('click', handleContactOwner);
    }

    // Cancel button
    const cancelEmergencyBtn = document.getElementById('cancelEmergency');
    if (cancelEmergencyBtn) {
        cancelEmergencyBtn.addEventListener('click', function () {
            hideModal('emergencyAlertModal');
        });
    }

    // Emergency type selection
    const emergencyTypeSelect = document.getElementById('emergencyType');
    if (emergencyTypeSelect) {
        emergencyTypeSelect.addEventListener('change', updateEmergencyForm);
    }
}

function setupHistorySearchModalListeners() {
    // Quick filter buttons
    const quickFilterBtns = document.querySelectorAll('.quick-filter-btn');
    quickFilterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const range = this.getAttribute('data-range');
            applyQuickDateFilter(range);
        });
    });

    // Export Results button
    const exportResultsBtn = document.getElementById('exportSearchResults');
    if (exportResultsBtn) {
        exportResultsBtn.addEventListener('click', handleExportSearchResults);
    }

    // Bulk Actions button
    const bulkActionsBtn = document.getElementById('bulkActions');
    if (bulkActionsBtn) {
        bulkActionsBtn.addEventListener('click', handleBulkActions);
    }

    // Clear Filters button
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', handleClearFilters);
    }

    // Advanced Search button
    const advancedSearchBtn = document.getElementById('advancedSearch');
    if (advancedSearchBtn) {
        advancedSearchBtn.addEventListener('click', handleAdvancedSearch);
    }

    // Search input
    const searchInput = document.getElementById('historySearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearchInput, 300));
    }

    // Result action buttons
    const resultActionBtns = document.querySelectorAll('.result-action-btn');
    resultActionBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const action = this.textContent.trim();
            const resultItem = this.closest('.search-result-item');
            handleSearchResultAction(resultItem, action);
        });
    });
}

function setupThresholdModalListeners() {
    // Save Thresholds button
    const saveThresholdsBtn = document.getElementById('saveThresholds');
    if (saveThresholdsBtn) {
        saveThresholdsBtn.addEventListener('click', handleSaveThresholds);
    }

    // Reset Thresholds button
    const resetThresholdsBtn = document.getElementById('resetThresholds');
    if (resetThresholdsBtn) {
        resetThresholdsBtn.addEventListener('click', handleResetThresholds);
    }

    // Test Alerts button
    const testAlertsBtn = document.getElementById('testAlerts');
    if (testAlertsBtn) {
        testAlertsBtn.addEventListener('click', handleTestAlerts);
    }

    // Import Config button
    const importConfigBtn = document.getElementById('importConfig');
    if (importConfigBtn) {
        importConfigBtn.addEventListener('click', handleImportConfig);
    }

    // Export Settings button
    const exportSettingsBtn = document.getElementById('exportSettings');
    if (exportSettingsBtn) {
        exportSettingsBtn.addEventListener('click', handleExportThresholdSettings);
    }

    // Threshold input changes
    const thresholdInputs = document.querySelectorAll('.threshold-input');
    thresholdInputs.forEach(input => {
        input.addEventListener('change', validateThresholdInput);
    });
}

// ====================================
// FORM HANDLERS
// ====================================
function handleAnnouncementSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const announcementData = {
        title: formData.get('announcementTitle'),
        message: formData.get('announcementMessage'),
        priority: formData.get('priority'),
        recipients: formData.getAll('recipients'),
        scheduling: formData.get('scheduling'),
        delivery: formData.getAll('delivery'),
        options: formData.getAll('options')
    };

    // Validate required fields
    if (!announcementData.title || !announcementData.message) {
        showToast('error', 'Validation Error', 'Please fill in all required fields');
        return;
    }

    showLoadingSpinner();

    setTimeout(() => {
        // Simulate sending announcement
        console.log('📢 Sending announcement:', announcementData);

        // Add to notifications
        const notification = {
            id: `announcement-${Date.now()}`,
            type: 'staff',
            priority: announcementData.priority,
            status: 'sent',
            title: announcementData.title,
            message: announcementData.message,
            timestamp: new Date(),
            source: NotificationsApp.state.currentUser.name,
            recipients: announcementData.recipients
        };

        NotificationsApp.state.notifications.unshift(notification);

        // Update UI
        addAnnouncementToUI(notification);

        hideLoadingSpinner();
        hideModal('staffAnnouncementModal');

        showToast('success', 'Announcement Sent',
            `Announcement sent to ${announcementData.recipients.length} recipient groups`);

        // Reset form
        e.target.reset();
        updateAnnouncementPreview();
    }, 2000);
}

function handleEmergencySubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const emergencyData = {
        type: formData.get('emergencyType'),
        location: formData.get('emergencyLocation'),
        severity: formData.get('severity'),
        description: formData.get('emergencyDescription'),
        notifyStaff: formData.getAll('notifyStaff'),
        notificationMethod: formData.getAll('notificationMethod'),
        escalation: formData.getAll('escalation')
    };

    // Validate required fields
    if (!emergencyData.type || !emergencyData.location || !emergencyData.severity || !emergencyData.description) {
        showToast('error', 'Validation Error', 'Please fill in all required fields');
        return;
    }

    showLoadingSpinner();

    setTimeout(() => {
        console.log('🚨 Emergency alert sent:', emergencyData);

        // Create emergency notification
        const emergencyNotification = {
            id: `emergency-${Date.now()}`,
            type: 'emergency',
            priority: 'critical',
            status: 'active',
            title: `${emergencyData.type} Emergency`,
            message: `${emergencyData.location}: ${emergencyData.description}`,
            timestamp: new Date(),
            source: 'Emergency System',
            severity: emergencyData.severity
        };

        // Add to notifications with highest priority
        NotificationsApp.state.notifications.unshift(emergencyNotification);

        // Send immediate notifications to all specified channels
        emergencyData.notificationMethod.forEach(method => {
            sendEmergencyNotification(method, emergencyNotification);
        });

        hideLoadingSpinner();
        hideModal('emergencyAlertModal');

        showToast('error', 'Emergency Alert Sent',
            'Emergency notification sent to all selected staff members');

        // Reset form
        e.target.reset();
    }, 1500);
}

function sendEmergencyNotification(method, notification) {
    console.log(`🚨 Sending emergency via ${method}:`, notification.title);

    // Simulate different notification methods
    switch (method) {
        case 'inapp':
            showToast('error', 'EMERGENCY ALERT', notification.message);
            break;
        case 'sms':
            console.log('📱 SMS sent to all staff');
            break;
        case 'call':
            console.log('📞 Emergency calls initiated');
            break;
        case 'email':
            console.log('📧 Emergency emails sent');
            break;
    }
}

function setupSettingsFormListeners() {
    // Notification preferences checkboxes
    const prefCheckboxes = document.querySelectorAll('#preferencesTab input[type="checkbox"]');
    prefCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            updateSettingsPreview();
        });
    });

    // Channel settings
    const channelInputs = document.querySelectorAll('#channelsTab input');
    channelInputs.forEach(input => {
        input.addEventListener('change', function () {
            updateChannelSettings();
        });
    });

    // Priority settings
    const priorityInputs = document.querySelectorAll('#prioritiesTab input');
    priorityInputs.forEach(input => {
        input.addEventListener('change', function () {
            updatePrioritySettings();
        });
    });
}

// ====================================
// HISTORY & SEARCH HANDLERS
// ====================================
function handleManageStatus() {
    console.log('📋 Opening status management');

    // Show status management interface
    const statusModal = createStatusManagementModal();
    document.body.appendChild(statusModal);
    showModal(statusModal.id);
}

function handleViewHistoryItem(historyItem) {
    const notificationId = historyItem.getAttribute('data-notification-id');
    console.log(`👁️ Viewing history item: ${notificationId}`);

    // Show detailed view of the notification
    showNotificationDetailsModal(historyItem);
}

function handleHistoryAction(historyItem, action) {
    const notificationId = historyItem.getAttribute('data-notification-id') || 'hist-' + Date.now();

    console.log(`⚡ History action: ${action} on ${notificationId}`);

    switch (action.toLowerCase()) {
        case 'view details':
            handleViewHistoryItem(historyItem);
            break;
        case 'mark resolved':
            markHistoryItemResolved(historyItem);
            break;
        case 'reopen':
            reopenHistoryItem(historyItem);
            break;
        case 'archive':
            archiveHistoryItem(historyItem);
            break;
        default:
            console.log(`Unknown history action: ${action}`);
    }
}

function handlePagination(direction) {
    console.log(`📄 Pagination: ${direction}`);

    // Simulate loading new page
    showLoadingSpinner();

    setTimeout(() => {
        // Update pagination info
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            const currentText = paginationInfo.textContent;
            // Update pagination text (simplified for demo)
            if (direction === 'next') {
                paginationInfo.textContent = 'Showing 21-40 of 147';
            } else {
                paginationInfo.textContent = 'Showing 1-20 of 147';
            }
        }

        hideLoadingSpinner();
        showToast('info', 'Page Updated', `Loaded ${direction} page of results`);
    }, 1000);
}

function markHistoryItemResolved(historyItem) {
    historyItem.classList.remove('unread');
    historyItem.classList.add('resolved');

    // Update status in item
    const statusElement = historyItem.querySelector('.item-status');
    if (statusElement) {
        statusElement.innerHTML = '<span class="status-badge resolved">Resolved</span>';
    }

    showToast('success', 'Item Resolved', 'Notification marked as resolved');
}

function reopenHistoryItem(historyItem) {
    historyItem.classList.remove('resolved');
    historyItem.classList.add('unread');

    // Update status in item
    const statusElement = historyItem.querySelector('.item-status');
    if (statusElement) {
        statusElement.innerHTML = '<span class="status-badge action-required">Action Required</span>';
    }

    showToast('info', 'Item Reopened', 'Notification reopened for action');
}

function archiveHistoryItem(historyItem) {
    historyItem.style.transition = 'all 0.3s ease-out';
    historyItem.style.transform = 'translateX(-100%)';
    historyItem.style.opacity = '0';

    setTimeout(() => {
        historyItem.remove();
        showToast('info', 'Item Archived', 'Notification moved to archive');
    }, 300);
}

// ====================================
// SEARCH FUNCTIONALITY
// ====================================
function handleSearchInput(e) {
    const searchTerm = e.target.value.toLowerCase();
    console.log(`🔍 Searching for: ${searchTerm}`);

    if (searchTerm.length < 2) {
        resetSearchResults();
        return;
    }

    // Filter notifications based on search term
    const filteredNotifications = NotificationsApp.state.notifications.filter(notification => {
        return notification.title.toLowerCase().includes(searchTerm) ||
            notification.message.toLowerCase().includes(searchTerm) ||
            notification.type.toLowerCase().includes(searchTerm);
    });

    displaySearchResults(filteredNotifications);
}

function displaySearchResults(results) {
    const resultsContainer = document.querySelector('.search-results-list');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No notifications found matching your search criteria.</p>';
        return;
    }

    results.slice(0, 10).forEach(notification => { // Show first 10 results
        const resultElement = createSearchResultElement(notification);
        resultsContainer.appendChild(resultElement);
    });

    // Update summary
    const summaryStats = document.querySelector('#historySearchModal .summary-stats');
    if (summaryStats) {
        const totalStat = summaryStats.querySelector('.summary-stat .stat-value');
        if (totalStat) {
            totalStat.textContent = results.length;
        }
    }
}

function createSearchResultElement(notification) {
    const resultDiv = document.createElement('div');
    resultDiv.className = `search-result-item ${notification.priority}-priority`;

    resultDiv.innerHTML = `
        <div class="result-header">
            <span class="result-date">${notification.timestamp.toLocaleDateString()}</span>
            <span class="result-type">${notification.type}</span>
            <span class="priority-badge ${notification.priority}">${notification.priority}</span>
        </div>
        <div class="result-content">
            <h5>${notification.title}</h5>
            <p>${notification.message}</p>
        </div>
        <div class="result-status">
            <span class="status-badge ${notification.status}">${notification.status}</span>
        </div>
        <div class="result-actions">
            <button class="result-action-btn">View Details</button>
            <button class="result-action-btn">Mark Resolved</button>
        </div>
    `;

    return resultDiv;
}

function applyQuickDateFilter(range) {
    const fromDate = document.getElementById('searchFromDate');
    const toDate = document.getElementById('searchToDate');

    if (!fromDate || !toDate) return;

    const today = new Date();
    let startDate = new Date();

    switch (range) {
        case 'today':
            startDate = new Date(today);
            break;
        case 'week':
            startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case '30days':
            startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
    }

    fromDate.value = startDate.toISOString().split('T')[0];
    toDate.value = today.toISOString().split('T')[0];

    // Apply filter
    handleSearchInput({ target: { value: '' } }); // Reset search and apply date filter

    console.log(`📅 Applied ${range} date filter`);
}

function handleFilterChange(e) {
    const filterType = e.target.id.replace('Filter', '');
    const filterValue = e.target.value;

    NotificationsApp.state.filters[filterType] = filterValue;

    console.log(`🔧 Filter changed: ${filterType} = ${filterValue}`);

    // Apply filters to current view
    applyFilters();
}

function applyFilters() {
    const filters = NotificationsApp.state.filters;

    // Filter notifications
    let filteredNotifications = NotificationsApp.state.notifications;

    if (filters.priority !== 'all') {
        filteredNotifications = filteredNotifications.filter(n => n.priority === filters.priority);
    }

    if (filters.status !== 'all') {
        filteredNotifications = filteredNotifications.filter(n => n.status === filters.status);
    }

    if (filters.type !== 'all') {
        filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
    }

    // Update UI with filtered results
    updateUIWithFilteredNotifications(filteredNotifications);

    showToast('info', 'Filters Applied', `Showing ${filteredNotifications.length} notifications`);
}

function resetSearchResults() {
    const resultsContainer = document.querySelector('.search-results-list');
    if (resultsContainer) {
        resultsContainer.innerHTML = '<p class="no-search">Enter search terms to find notifications</p>';
    }
}

// ====================================
// SYSTEM ALERTS & MONITORING
// ====================================
function populateSystemAlerts() {
    const systemAlerts = [
        {
            id: 'system-alert-1',
            type: 'critical',
            title: 'Server Response Time High',
            description: 'Response time: 5.2s (Threshold: 3s)',
            impact: 'Slow patient booking system',
            autoAction: 'IT support contacted',
            timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
        },
        {
            id: 'system-alert-2',
            type: 'warning',
            title: 'Storage Space Warning',
            description: 'Storage: 87% full (Threshold: 85%)',
            impact: 'Limited file uploads',
            autoAction: 'Cleanup scheduled',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
            id: 'system-alert-3',
            type: 'info',
            title: 'Software Update Available',
            description: 'Version 2.4.1 → 2.4.2',
            impact: 'Bug fixes, performance improvements',
            autoAction: 'Scheduled for weekend',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }
    ];

    const alertsList = document.querySelector('.system-alerts-list');
    if (alertsList) {
        alertsList.innerHTML = '';

        systemAlerts.forEach(alert => {
            const alertElement = createSystemAlertElement(alert);
            alertsList.appendChild(alertElement);
        });
    }
}

function createSystemAlertElement(alert) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `system-alert ${alert.type}`;
    alertDiv.setAttribute('data-alert-id', alert.id);

    const timeAgo = getTimeAgo(alert.timestamp);

    alertDiv.innerHTML = `
        <div class="alert-header">
            <div class="alert-icon">
                <i class="fas ${getAlertIcon(alert.type)}"></i>
            </div>
            <div class="alert-info">
                <h5>${alert.title}</h5>
                <p>${alert.description}</p>
            </div>
            <div class="alert-timestamp">
                <span>${timeAgo}</span>
            </div>
        </div>
        <div class="alert-details">
            <p><strong>Impact:</strong> ${alert.impact}</p>
            <p><strong>Auto-Action:</strong> ${alert.autoAction}</p>
        </div>
        <div class="alert-actions">
            <button class="alert-btn primary">View Details</button>
            <button class="alert-btn secondary">${getAlertAction(alert.type)}</button>
        </div>
    `;

    return alertDiv;
}

function getAlertIcon(type) {
    switch (type) {
        case 'critical': return 'fa-exclamation-circle';
        case 'warning': return 'fa-hdd';
        case 'info': return 'fa-download';
        default: return 'fa-info-circle';
    }
}

function getAlertAction(type) {
    switch (type) {
        case 'critical': return 'Escalate';
        case 'warning': return 'Free Space Now';
        case 'info': return 'Schedule Now';
        default: return 'View Details';
    }
}

function handleSystemAlertAction(alertElement, action) {
    const alertId = alertElement.getAttribute('data-alert-id');
    console.log(`🚨 System alert action: ${action} on ${alertId}`);

    showLoadingSpinner();

    setTimeout(() => {
        switch (action.toLowerCase()) {
            case 'view details':
                showSystemAlertDetailsModal(alertElement);
                break;
            case 'escalate':
                handleEscalateAlert(alertElement);
                break;
            case 'free space now':
                handleFreeSpace(alertElement);
                break;
            case 'schedule now':
                handleScheduleUpdate(alertElement);
                break;
            default:
                console.log(`Unknown system alert action: ${action}`);
        }

        hideLoadingSpinner();
    }, 1000);
}

function handleEscalateAlert(alertElement) {
    alertElement.style.backgroundColor = '#FEF2F2';
    alertElement.style.borderLeftColor = '#DC2626';

    showToast('warning', 'Alert Escalated', 'System administrator has been notified');
}

function handleFreeSpace(alertElement) {
    // Simulate storage cleanup
    const alertInfo = alertElement.querySelector('.alert-info p');
    if (alertInfo) {
        alertInfo.textContent = 'Storage: 72% full (After cleanup)';
    }

    alertElement.classList.remove('warning');
    alertElement.classList.add('info');

    showToast('success', 'Storage Cleaned', 'Storage space has been freed up');
}

function handleScheduleUpdate(alertElement) {
    const alertDetails = alertElement.querySelector('.alert-details');
    if (alertDetails) {
        const autoActionP = alertDetails.querySelector('p:last-child');
        if (autoActionP) {
            autoActionP.innerHTML = '<strong>Auto-Action:</strong> Update scheduled for tonight 2:00 AM';
        }
    }

    showToast('success', 'Update Scheduled', 'Software update scheduled for tonight');
}

// ====================================
// SETTINGS MANAGEMENT
// ====================================
function switchSettingsTab(tabName) {
    // Remove active class from all tabs and content
    const tabBtns = document.querySelectorAll('.settings-tab-btn');
    const tabContents = document.querySelectorAll('.settings-tab-content');

    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const activeTabContent = document.querySelector(`.${tabName}-tab`);

    if (activeTabBtn) activeTabBtn.classList.add('active');
    if (activeTabContent) activeTabContent.classList.add('active');

    console.log(`⚙️ Switched to ${tabName} settings tab`);
}

function handleSaveSettings() {
    showLoadingSpinner();

    // Collect all settings data
    const settingsData = collectSettingsData();

    setTimeout(() => {
        // Save settings (in real app, this would be an API call)
        NotificationsApp.state.settings = { ...NotificationsApp.state.settings, ...settingsData };

        // Store in localStorage for persistence
        localStorage.setItem('curisNotificationSettings', JSON.stringify(NotificationsApp.state.settings));

        hideLoadingSpinner();
        hideModal('notificationSettingsModal');

        showToast('success', 'Settings Saved', 'Your notification preferences have been updated');

        console.log('💾 Settings saved:', settingsData);
    }, 1500);
}

function handleResetSettings() {
    if (confirm('Are you sure you want to reset all notification settings to default values?')) {
        // Reset to default settings
        const defaultSettings = {
            realTimeUpdates: true,
            soundEnabled: true,
            emailNotifications: true,
            smsNotifications: false,
            inAppNotifications: true,
            priority: 'all',
            frequency: 'realtime'
        };

        NotificationsApp.state.settings = defaultSettings;

        // Update UI with default values
        populateSettingsForm(defaultSettings);

        showToast('info', 'Settings Reset', 'All settings have been reset to default values');

        console.log('🔄 Settings reset to defaults');
    }
}

function handleTestNotifications() {
    showLoadingSpinner();

    setTimeout(() => {
        // Send test notifications through all enabled channels
        const testNotification = {
            title: 'Test Notification',
            message: 'This is a test notification to verify your settings',
            priority: 'medium',
            timestamp: new Date()
        };

        // Test in-app notification
        showToast('info', testNotification.title, testNotification.message);

        // Test sound (if enabled)
        if (NotificationsApp.state.settings.soundEnabled) {
            playNotificationSound();
        }

        // Simulate email test
        if (NotificationsApp.state.settings.emailNotifications) {
            console.log('📧 Test email sent');
        }

        // Simulate SMS test
        if (NotificationsApp.state.settings.smsNotifications) {
            console.log('📱 Test SMS sent');
        }

        hideLoadingSpinner();

        showToast('success', 'Test Complete', 'Test notifications sent through all enabled channels');
    }, 2000);
}

function collectSettingsData() {
    const settingsData = {};

    // Collect preferences
    const prefCheckboxes = document.querySelectorAll('#preferencesTab input[type="checkbox"]');
    prefCheckboxes.forEach(checkbox => {
        settingsData[checkbox.name] = checkbox.checked;
    });

    // Collect radio selections
    const radioButtons = document.querySelectorAll('#preferencesTab input[type="radio"]:checked');
    radioButtons.forEach(radio => {
        settingsData[radio.name] = radio.value;
    });

    // Collect channel settings
    const channelInputs = document.querySelectorAll('#channelsTab input');
    channelInputs.forEach(input => {
        if (input.type === 'checkbox') {
            settingsData[input.name] = input.checked;
        } else {
            settingsData[input.name] = input.value;
        }
    });

    return settingsData;
}

function populateSettingsForm(settings) {
    // Populate checkboxes
    Object.keys(settings).forEach(key => {
        const checkbox = document.querySelector(`input[name="${key}"][type="checkbox"]`);
        if (checkbox) {
            checkbox.checked = settings[key];
        }

        const radio = document.querySelector(`input[name="${key}"][value="${settings[key]}"]`);
        if (radio) {
            radio.checked = true;
        }
    });
}

function loadUserSettings() {
    const savedSettings = localStorage.getItem('curisNotificationSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            NotificationsApp.state.settings = { ...NotificationsApp.state.settings, ...settings };
            console.log('📥 User settings loaded from storage');
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
}

// ====================================
// THRESHOLD MANAGEMENT
// ====================================
function handleSaveThresholds() {
    showLoadingSpinner();

    setTimeout(() => {
        const thresholdData = collectThresholdData();

        // Save thresholds
        localStorage.setItem('curisThresholdSettings', JSON.stringify(thresholdData));

        hideLoadingSpinner();
        hideModal('thresholdSettingsModal');

        showToast('success', 'Thresholds Saved', 'Alert threshold settings have been updated');

        console.log('💾 Thresholds saved:', thresholdData);
    }, 1500);
}

function handleResetThresholds() {
    if (confirm('Reset all threshold settings to default values?')) {
        // Reset all threshold inputs to default values
        const thresholdInputs = document.querySelectorAll('.threshold-input');
        const defaults = {
            'paymentAmount': 5000,
            'paymentAttempts': 2,
            'revenueDropPercent': 20,
            'revenueDropDays': 30,
            'outstandingAmount': 10000,
            'outstandingDays': 7,
            'noshowPercent': 15,
            'bookingDropPercent': 30,
            'cancellationPercent': 25,
            'inactivityDays': 3,
            'ratingThreshold': 4.0,
            'reviewCount': 5,
            'responseTime': 3,
            'storageWarning': 85,
            'storageCritical': 95
        };

        thresholdInputs.forEach(input => {
            const key = input.name || input.id;
            if (defaults[key]) {
                input.value = defaults[key];
            }
        });

        showToast('info', 'Thresholds Reset', 'All thresholds reset to default values');
    }
}

function handleTestAlerts() {
    showLoadingSpinner();

    setTimeout(() => {
        // Generate test alerts based on current thresholds
        const testAlerts = [
            {
                type: 'payment',
                message: 'Test payment failure alert triggered'
            },
            {
                type: 'system',
                message: 'Test system performance alert triggered'
            },
            {
                type: 'appointment',
                message: 'Test appointment alert triggered'
            }
        ];

        testAlerts.forEach((alert, index) => {
            setTimeout(() => {
                showToast('warning', 'Test Alert', alert.message);
            }, index * 500);
        });

        hideLoadingSpinner();

        showToast('success', 'Test Complete', 'Test alerts generated based on current thresholds');
    }, 2000);
}

function collectThresholdData() {
    const thresholdData = {};

    const thresholdInputs = document.querySelectorAll('.threshold-input');
    thresholdInputs.forEach(input => {
        const key = input.name || input.id;
        thresholdData[key] = input.type === 'number' ? parseFloat(input.value) : input.value;
    });

    const thresholdSelects = document.querySelectorAll('.threshold-select');
    thresholdSelects.forEach(select => {
        const key = select.name || select.id;
        thresholdData[key] = select.value;
    });

    return thresholdData;
}

function validateThresholdInput(e) {
    const input = e.target;
    const value = parseFloat(input.value);
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || Infinity;

    if (value < min) {
        input.value = min;
        showToast('warning', 'Invalid Value', `Minimum value is ${min}`);
    } else if (value > max) {
        input.value = max;
        showToast('warning', 'Invalid Value', `Maximum value is ${max}`);
    }
}

// ====================================
// MODAL CONTENT POPULATORS
// ====================================
function populatePaymentAlertModal(alert) {
    // Update patient information
    const patientInfo = {
        name: 'Sarah Johnson',
        amount: 'KES. 2,500',
        service: 'General Consultation',
        paymentMethod: 'M-Pesa',
        failureReason: 'Insufficient Funds',
        attemptTime: '14:32 Today',
        invoiceId: 'INV-2024-001247',
        phone: '+254 700 123 456',
        email: 'sarah.j@email.com'
    };

    // Update modal content with actual data
    const modal = document.getElementById('paymentAlertModal');
    if (modal) {
        // Update transaction info
        const infoItems = modal.querySelectorAll('.info-item span');
        if (infoItems.length >= 7) {
            infoItems[0].textContent = patientInfo.name;
            infoItems[1].textContent = patientInfo.amount;
            infoItems[2].textContent = patientInfo.service;
            infoItems[3].textContent = patientInfo.paymentMethod;
            infoItems[4].textContent = patientInfo.failureReason;
            infoItems[5].textContent = patientInfo.attemptTime;
            infoItems[6].textContent = patientInfo.invoiceId;
        }

        // Update contact information
        const contactDetails = modal.querySelectorAll('.contact-item span');
        if (contactDetails.length >= 2) {
            contactDetails[0].textContent = patientInfo.phone;
            contactDetails[1].textContent = patientInfo.email;
        }
    }
}

function updateAnnouncementPreview() {
    const title = document.getElementById('announcementTitle')?.value || 'Announcement Title';
    const message = document.getElementById('announcementMessage')?.value || 'Your announcement message will appear here...';
    const priority = document.querySelector('input[name="priority"]:checked')?.value || 'medium';

    // Update preview elements
    const previewTitle = document.getElementById('previewTitle');
    const previewMessage = document.getElementById('previewMessage');
    const previewPriority = document.querySelector('.preview-priority');

    if (previewTitle) previewTitle.textContent = title;
    if (previewMessage) previewMessage.textContent = message;
    if (previewPriority) {
        previewPriority.className = `preview-priority ${priority}`;
        previewPriority.textContent = `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`;
    }
}

function handleSaveDraft() {
    const formData = new FormData(document.getElementById('announcementForm'));
    const draftData = {
        title: formData.get('announcementTitle'),
        message: formData.get('announcementMessage'),
        priority: formData.get('priority'),
        recipients: formData.getAll('recipients'),
        savedAt: new Date()
    };

    // Save to localStorage
    localStorage.setItem('curisAnnouncementDraft', JSON.stringify(draftData));

    showToast('success', 'Draft Saved', 'Announcement saved as draft');

    console.log('📝 Draft saved:', draftData);
}

function handlePreviewAnnouncement() {
    const previewModal = createAnnouncementPreviewModal();
    document.body.appendChild(previewModal);
    showModal(previewModal.id);
}

// ====================================
// UI HELPERS & UTILITIES
// ====================================
function showLoadingSpinner() {
    let spinner = document.getElementById('loadingSpinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loadingSpinner';
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-overlay">
                <div class="spinner-content">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Processing...</span>
                </div>
            </div>
        `;
        document.body.appendChild(spinner);
    }
    spinner.style.display = 'flex';
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

function showRealTimeIndicator() {
    const indicator = document.getElementById('realTimeIndicator');
    if (indicator) {
        indicator.style.opacity = '1';
        indicator.style.visibility = 'visible';
    }
}

function initializeToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

function showToast(type, title, message, actions = []) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const toastId = 'toast-' + Date.now();
    toast.id = toastId;

    const iconMap = {
        success: 'fa-check',
        error: 'fa-exclamation-triangle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    let actionsHTML = '';
    if (actions.length > 0) {
        actionsHTML = '<div class="toast-actions">';
        actions.forEach(action => {
            actionsHTML += `<button class="toast-action" onclick="${action.handler}">${action.label}</button>`;
        });
        actionsHTML += '</div>';
    }

    toast.innerHTML = `
        <div class="toast-header">
            <div class="toast-icon">
                <i class="fas ${iconMap[type]}"></i>
            </div>
            <h5 class="toast-title">${title}</h5>
            <button class="toast-close" onclick="hideToast('${toastId}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <p class="toast-message">${message}</p>
        ${actionsHTML}
    `;

    container.appendChild(toast);

    // Auto-hide after delay
    setTimeout(() => {
        hideToast(toastId);
    }, type === 'error' ? 8000 : 5000);

    // Sound notification
    if (NotificationsApp.state.settings.soundEnabled && (type === 'error' || type === 'warning')) {
        playNotificationSound();
    }
}

function hideToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

function playNotificationSound() {
    // Create audio context for notification sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        console.log('Audio notification not available');
    }
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

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

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');

    localStorage.setItem('curisDarkMode', isDarkMode);

    showToast('info', 'Theme Changed', `Switched to ${isDarkMode ? 'dark' : 'light'} mode`);
}

function handleConnectionStatusClick() {
    if (NotificationsApp.state.isConnected) {
        showToast('success', 'Connection Status', 'Real-time connection is active and healthy');
    } else {
        showToast('warning', 'Connection Status', 'Attempting to reconnect...');
        // Attempt reconnection
        setTimeout(() => {
            updateConnectionStatus(true);
            showToast('success', 'Reconnected', 'Real-time connection restored');
        }, 2000);
    }
}

// ====================================
// ADDITIONAL MODAL CREATORS
// ====================================
function createAnnouncementPreviewModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'announcementPreviewModal';

    const formData = new FormData(document.getElementById('announcementForm'));
    const title = formData.get('announcementTitle') || 'Preview Announcement';
    const message = formData.get('announcementMessage') || 'No message content';
    const priority = formData.get('priority') || 'medium';
    const recipients = formData.getAll('recipients');

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Announcement Preview</h3>
                <button class="modal-close" onclick="hideToast('announcementPreviewModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="announcement-preview">
                    <div class="preview-header">
                        <div class="preview-icon">
                            <i class="fas fa-bullhorn"></i>
                        </div>
                        <div class="preview-meta">
                            <h5>${title}</h5>
                            <div class="preview-details">
                                <span class="preview-sender">${NotificationsApp.state.currentUser.name}</span>
                                <span class="preview-time">Now</span>
                                <span class="preview-priority ${priority}">${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority</span>
                            </div>
                        </div>
                    </div>
                    <div class="preview-content">
                        <p>${message}</p>
                    </div>
                    <div class="preview-recipients">
                        <h5>Recipients:</h5>
                        <p>${recipients.length > 0 ? recipients.join(', ') : 'No recipients selected'}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="hideModal('announcementPreviewModal')">
                    Close Preview
                </button>
                <button type="button" class="btn-primary" onclick="sendAnnouncementFromPreview()">
                    Send Announcement
                </button>
            </div>
        </div>
    `;

    return modal;
}

function createStatusManagementModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'statusManagementModal';

    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3 class="modal-title">Notification Status Management</h3>
                <button class="modal-close" onclick="hideModal('statusManagementModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="status-overview">
                    <h4>Status Categories</h4>
                    <div class="status-grid">
                        <div class="status-card unread">
                            <div class="status-icon"><i class="fas fa-envelope"></i></div>
                            <div class="status-info">
                                <h5>Unread (${NotificationsApp.counters.unread})</h5>
                                <p>Recent unread items that need attention</p>
                            </div>
                            <button class="bulk-action-btn" onclick="markAllAsRead()">Mark All Read</button>
                        </div>
                        <div class="status-card action-required">
                            <div class="status-icon"><i class="fas fa-exclamation-triangle"></i></div>
                            <div class="status-info">
                                <h5>Action Required (${NotificationsApp.counters.actionRequired})</h5>
                                <p>Critical items needing immediate response</p>
                            </div>
                            <button class="bulk-action-btn" onclick="resolveAllActionItems()">Resolve All</button>
                        </div>
                        <div class="status-card resolved">
                            <div class="status-icon"><i class="fas fa-check-circle"></i></div>
                            <div class="status-info">
                                <h5>Resolved (89)</h5>
                                <p>Completed actions and responses</p>
                            </div>
                            <button class="bulk-action-btn" onclick="archiveResolved()">Archive All</button>
                        </div>
                        <div class="status-card archived">
                            <div class="status-icon"><i class="fas fa-archive"></i></div>
                            <div class="status-info">
                                <h5>Archived (865)</h5>
                                <p>Historical records for reference</p>
                            </div>
                            <button class="bulk-action-btn" onclick="manageArchive()">Manage Archive</button>
                        </div>
                    </div>
                </div>
                <div class="bulk-operations">
                    <h4>Bulk Operations</h4>
                    <div class="bulk-controls">
                        <div class="selection-controls">
                            <label class="checkbox-option">
                                <input type="checkbox" id="selectAllNotifications">
                                <span>Select All Visible Notifications</span>
                            </label>
                            <span class="selected-count">0 notifications selected</span>
                        </div>
                        <div class="bulk-actions">
                            <button class="bulk-btn" onclick="bulkMarkAsRead()">
                                <i class="fas fa-eye"></i> Mark as Read
                            </button>
                            <button class="bulk-btn" onclick="bulkMarkAsResolved()">
                                <i class="fas fa-check"></i> Mark as Resolved
                            </button>
                            <button class="bulk-btn" onclick="bulkArchive()">
                                <i class="fas fa-archive"></i> Archive
                            </button>
                            <button class="bulk-btn danger" onclick="bulkDelete()">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
                <div class="auto-rules">
                    <h4>Auto-Status Rules</h4>
                    <div class="rules-list">
                        <label class="rule-option">
                            <input type="checkbox" checked>
                            <span>Auto-mark payment confirmations as resolved</span>
                        </label>
                        <label class="rule-option">
                            <input type="checkbox" checked>
                            <span>Auto-archive read items after 30 days</span>
                        </label>
                        <label class="rule-option">
                            <input type="checkbox" checked>
                            <span>Flag overdue actions after 6 hours</span>
                        </label>
                        <label class="rule-option">
                            <input type="checkbox">
                            <span>Auto-resolve system maintenance notifications</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="hideModal('statusManagementModal')">
                    Close
                </button>
                <button type="button" class="btn-primary" onclick="saveStatusRules()">
                    Save Rules
                </button>
            </div>
        </div>
    `;

    return modal;
}

function createContactOptionsModal(alert, contactOptions) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'contactOptionsModal';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Contact Patient</h3>
                <button class="modal-close" onclick="hideModal('contactOptionsModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="patient-info">
                    <h4>Patient Information</h4>
                    <p><strong>Name:</strong> Sarah Johnson</p>
                    <p><strong>Phone:</strong> +254 700 123 456</p>
                    <p><strong>Email:</strong> sarah.j@email.com</p>
                    <p><strong>Issue:</strong> ${alert.title}</p>
                </div>
                <div class="contact-methods">
                    <h4>Select Contact Method</h4>
                    <div class="contact-options">
                        ${contactOptions.map(option => `
                            <button class="contact-method-btn" onclick="initiateContact('${option.method}')">
                                <i class="${option.icon}"></i>
                                <span>${option.method}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="quick-templates">
                    <h4>Quick Message Templates</h4>
                    <div class="template-options">
                        <button class="template-btn" onclick="useTemplate('payment_reminder')">
                            Payment Reminder
                        </button>
                        <button class="template-btn" onclick="useTemplate('alternative_payment')">
                            Alternative Payment Options
                        </button>
                        <button class="template-btn" onclick="useTemplate('payment_plan')">
                            Payment Plan Offer
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="hideModal('contactOptionsModal')">
                    Cancel
                </button>
            </div>
        </div>
    `;

    return modal;
}

function createRescheduleModal(alert) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'rescheduleModal';

    // Generate some available time slots
    const availableSlots = generateAvailableTimeSlots();

    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3 class="modal-title">Reschedule Appointment</h3>
                <button class="modal-close" onclick="hideModal('rescheduleModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="appointment-info">
                    <h4>Current Appointment</h4>
                    <p><strong>Patient:</strong> Michael Chen</p>
                    <p><strong>Service:</strong> General Consultation</p>
                    <p><strong>Original Time:</strong> Tomorrow 10:00 AM</p>
                    <p><strong>Doctor:</strong> Dr. Sarah Johnson</p>
                </div>
                <div class="available-slots">
                    <h4>Available Time Slots</h4>
                    <div class="slots-grid">
                        ${availableSlots.map(slot => `
                            <button class="time-slot-btn" onclick="selectTimeSlot('${slot.datetime}')">
                                <div class="slot-date">${slot.date}</div>
                                <div class="slot-time">${slot.time}</div>
                                <div class="slot-doctor">${slot.doctor}</div>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="reschedule-reason">
                    <h4>Reason for Reschedule</h4>
                    <textarea class="form-control" rows="3" placeholder="Enter reason for rescheduling (optional)"></textarea>
                </div>
                <div class="notification-options">
                    <h4>Notify Patient</h4>
                    <label class="checkbox-option">
                        <input type="checkbox" checked>
                        <span>Send SMS notification</span>
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox" checked>
                        <span>Send email confirmation</span>
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox">
                        <span>Call patient to confirm</span>
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="hideModal('rescheduleModal')">
                    Cancel
                </button>
                <button type="button" class="btn-primary" onclick="confirmReschedule()">
                    Confirm Reschedule
                </button>
            </div>
        </div>
    `;

    return modal;
}

// ====================================
// ADDITIONAL EVENT HANDLERS
// ====================================
function sendAnnouncementFromPreview() {
    hideModal('announcementPreviewModal');

    // Trigger the main form submission
    const announcementForm = document.getElementById('announcementForm');
    if (announcementForm) {
        announcementForm.dispatchEvent(new Event('submit'));
    }
}

function initiateContact(method) {
    hideModal('contactOptionsModal');

    switch (method) {
        case 'Call':
            showToast('info', 'Initiating Call', 'Opening phone application...');
            // In a real app, this would integrate with the phone system
            setTimeout(() => {
                showToast('success', 'Call Connected', 'Phone call in progress');
            }, 2000);
            break;
        case 'SMS':
            showSMSComposer();
            break;
        case 'Email':
            showEmailComposer();
            break;
    }
}

function useTemplate(templateType) {
    const templates = {
        payment_reminder: 'Dear Patient, this is a reminder about your outstanding payment of KES 2,500. Please contact us to arrange payment.',
        alternative_payment: 'We understand payment difficulties. We offer alternative payment methods including installment plans. Please contact us to discuss options.',
        payment_plan: 'We can arrange a flexible payment plan for your outstanding balance. Please call us to discuss terms that work for you.'
    };

    const message = templates[templateType];
    showToast('success', 'Template Applied', 'Message template has been applied');

    // In a real implementation, this would populate the message composer
    console.log('📝 Template applied:', message);
}

function generateAvailableTimeSlots() {
    const slots = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
        const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        // Generate 2-3 slots per day
        const times = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];
        const doctors = ['Dr. Sarah Johnson', 'Dr. Michael Wilson'];

        for (let j = 0; j < Math.min(3, times.length); j++) {
            if (Math.random() > 0.3) { // 70% chance of slot being available
                slots.push({
                    datetime: `${date.toISOString().split('T')[0]} ${times[j]}`,
                    date: dateStr,
                    time: times[j],
                    doctor: doctors[Math.floor(Math.random() * doctors.length)]
                });
            }
        }
    }

    return slots.slice(0, 12); // Return first 12 available slots
}

function selectTimeSlot(datetime) {
    // Remove selection from other slots
    const slotBtns = document.querySelectorAll('.time-slot-btn');
    slotBtns.forEach(btn => btn.classList.remove('selected'));

    // Add selection to clicked slot
    event.target.classList.add('selected');

    console.log('📅 Time slot selected:', datetime);
}

function confirmReschedule() {
    const selectedSlot = document.querySelector('.time-slot-btn.selected');
    if (!selectedSlot) {
        showToast('warning', 'No Slot Selected', 'Please select an available time slot');
        return;
    }

    showLoadingSpinner();

    setTimeout(() => {
        hideModal('rescheduleModal');
        hideLoadingSpinner();

        showToast('success', 'Appointment Rescheduled', 'Patient has been notified of the new appointment time');

        // Update the original alert status
        const originalAlert = document.querySelector('[data-alert="appointment-new-002"]');
        if (originalAlert) {
            updateAlertInUI({ id: 'appointment-new-002', status: 'resolved' });
        }
    }, 2000);
}

// ====================================
// BULK OPERATIONS
// ====================================
function markAllAsRead() {
    showLoadingSpinner();

    setTimeout(() => {
        NotificationsApp.counters.unread = 0;
        updateNotificationCounters();
        hideLoadingSpinner();
        showToast('success', 'All Marked as Read', 'All unread notifications have been marked as read');
    }, 1500);
}

function resolveAllActionItems() {
    showLoadingSpinner();

    setTimeout(() => {
        NotificationsApp.counters.actionRequired = 0;
        updateNotificationCounters();
        hideLoadingSpinner();
        showToast('success', 'All Items Resolved', 'All action required items have been marked as resolved');
    }, 1500);
}

function archiveResolved() {
    showLoadingSpinner();

    setTimeout(() => {
        hideLoadingSpinner();
        showToast('success', 'Resolved Items Archived', 'All resolved notifications have been moved to archive');
    }, 1500);
}

function manageArchive() {
    showToast('info', 'Archive Management', 'Opening archive management interface...');
    hideModal('statusManagementModal');
}

function bulkMarkAsRead() {
    const selectedCount = getSelectedNotificationsCount();
    if (selectedCount === 0) {
        showToast('warning', 'No Selection', 'Please select notifications to mark as read');
        return;
    }

    showLoadingSpinner();

    setTimeout(() => {
        hideLoadingSpinner();
        showToast('success', 'Bulk Update Complete', `${selectedCount} notifications marked as read`);
        clearNotificationSelection();
    }, 1000);
}

function bulkMarkAsResolved() {
    const selectedCount = getSelectedNotificationsCount();
    if (selectedCount === 0) {
        showToast('warning', 'No Selection', 'Please select notifications to mark as resolved');
        return;
    }

    showLoadingSpinner();

    setTimeout(() => {
        hideLoadingSpinner();
        showToast('success', 'Bulk Update Complete', `${selectedCount} notifications marked as resolved`);
        clearNotificationSelection();
    }, 1000);
}

function bulkArchive() {
    const selectedCount = getSelectedNotificationsCount();
    if (selectedCount === 0) {
        showToast('warning', 'No Selection', 'Please select notifications to archive');
        return;
    }

    if (confirm(`Archive ${selectedCount} selected notifications?`)) {
        showLoadingSpinner();

        setTimeout(() => {
            hideLoadingSpinner();
            showToast('success', 'Bulk Archive Complete', `${selectedCount} notifications archived`);
            clearNotificationSelection();
        }, 1000);
    }
}

function bulkDelete() {
    const selectedCount = getSelectedNotificationsCount();
    if (selectedCount === 0) {
        showToast('warning', 'No Selection', 'Please select notifications to delete');
        return;
    }

    if (confirm(`Permanently delete ${selectedCount} selected notifications? This action cannot be undone.`)) {
        showLoadingSpinner();

        setTimeout(() => {
            hideLoadingSpinner();
            showToast('warning', 'Bulk Delete Complete', `${selectedCount} notifications deleted permanently`);
            clearNotificationSelection();
        }, 1000);
    }
}

function getSelectedNotificationsCount() {
    // In a real implementation, this would count actually selected notifications
    return Math.floor(Math.random() * 10) + 1; // Simulate 1-10 selected items
}

function clearNotificationSelection() {
    const selectAllCheckbox = document.getElementById('selectAllNotifications');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }

    const selectedCount = document.querySelector('.selected-count');
    if (selectedCount) {
        selectedCount.textContent = '0 notifications selected';
    }
}

function saveStatusRules() {
    const rules = {};
    const ruleCheckboxes = document.querySelectorAll('.rule-option input[type="checkbox"]');

    ruleCheckboxes.forEach((checkbox, index) => {
        const ruleText = checkbox.nextElementSibling.textContent;
        rules[`rule_${index}`] = {
            enabled: checkbox.checked,
            description: ruleText
        };
    });

    localStorage.setItem('curisStatusRules', JSON.stringify(rules));

    hideModal('statusManagementModal');
    showToast('success', 'Rules Saved', 'Auto-status rules have been updated');

    console.log('💾 Status rules saved:', rules);
}

// ====================================
// SEARCH RESULT HANDLERS
// ====================================
function handleSearchResultAction(resultItem, action) {
    console.log(`🔍 Search result action: ${action}`);

    switch (action.toLowerCase()) {
        case 'view details':
            showNotificationDetailsModal(resultItem);
            break;
        case 'mark resolved':
            markSearchResultResolved(resultItem);
            break;
        case 'reopen':
            reopenSearchResult(resultItem);
            break;
    }
}

function markSearchResultResolved(resultItem) {
    const statusBadge = resultItem.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.className = 'status-badge resolved';
        statusBadge.textContent = 'resolved';
    }

    resultItem.style.opacity = '0.7';
    showToast('success', 'Item Resolved', 'Search result marked as resolved');
}

function reopenSearchResult(resultItem) {
    const statusBadge = resultItem.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.className = 'status-badge action-required';
        statusBadge.textContent = 'action-required';
    }

    resultItem.style.opacity = '1';
    showToast('info', 'Item Reopened', 'Search result reopened for action');
}

function handleExportSearchResults() {
    showLoadingSpinner();

    setTimeout(() => {
        const exportData = generateSearchExportData();
        downloadFile('search-results.csv', exportData, 'text/csv');

        hideLoadingSpinner();
        showToast('success', 'Export Complete', 'Search results exported to CSV file');
    }, 2000);
}

function handleBulkActions() {
    showToast('info', 'Bulk Actions', 'Opening bulk actions panel...');
    // In a real implementation, this would show bulk action options
}

function handleClearFilters() {
    // Reset all filter inputs
    const filterInputs = document.querySelectorAll('#historySearchModal input, #historySearchModal select');
    filterInputs.forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = input.value === 'all';
        } else if (input.type === 'radio') {
            input.checked = input.value === 'all';
        } else {
            input.value = '';
        }
    });

    // Reset search results
    resetSearchResults();

    showToast('info', 'Filters Cleared', 'All search filters have been reset');
}

function handleAdvancedSearch() {
    showToast('info', 'Advanced Search', 'Opening advanced search options...');
    // In a real implementation, this would expand search capabilities
}

function generateSearchExportData() {
    // Simulate search results export
    let csv = 'Date,Time,Type,Priority,Status,Title,Message\n';

    for (let i = 0; i < 10; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const row = [
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            'payment',
            'high',
            'unread',
            '"Payment Alert"',
            '"Sample search result notification"'
        ].join(',');

        csv += row + '\n';
    }

    return csv;
}

// ====================================
// IMPORT/EXPORT HANDLERS
// ====================================
function handleImportConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const config = JSON.parse(event.target.result);
                    applyImportedConfig(config);
                    showToast('success', 'Config Imported', 'Configuration settings have been imported');
                } catch (error) {
                    showToast('error', 'Import Failed', 'Invalid configuration file format');
                }
            };
            reader.readAsText(file);
        }
    };

    input.click();
}

function handleExportThresholdSettings() {
    const thresholdData = collectThresholdData();
    const exportData = JSON.stringify(thresholdData, null, 2);

    downloadFile('curis-threshold-settings.json', exportData, 'application/json');

    showToast('success', 'Settings Exported', 'Threshold settings exported to JSON file');
}

function applyImportedConfig(config) {
    // Apply imported configuration to form inputs
    Object.keys(config).forEach(key => {
        const input = document.querySelector(`[name="${key}"], #${key}`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = config[key];
            } else {
                input.value = config[key];
            }
        }
    });

    console.log('📥 Configuration imported:', config);
}

// ====================================
// ADDITIONAL UI POPULATION
// ====================================
function populateNotificationPanels() {
    // Populate payment alerts
    populatePaymentAlerts();

    // Populate appointment alerts
    populateAppointmentAlerts();

    // Populate billing alerts
    populateBillingAlerts();
}

function populatePaymentAlerts() {
    const paymentAlerts = NotificationsApp.state.notifications.filter(n => n.type === 'payment');
    const panel = document.querySelector('.payment-alerts .panel-content');

    if (panel && paymentAlerts.length > 0) {
        // Update panel header badge
        const badge = document.querySelector('.payment-alerts .alert-badge');
        if (badge) {
            badge.textContent = `${paymentAlerts.length} Failed Payments`;
        }

        // Show recent payment alerts
        const recentAlerts = paymentAlerts.slice(0, 3);
        // Update existing alert items with real data
        const alertItems = panel.querySelectorAll('.alert-item');

        recentAlerts.forEach((alert, index) => {
            if (alertItems[index]) {
                const details = alertItems[index].querySelector('.alert-details');
                if (details) {
                    const title = details.querySelector('h5');
                    const message = details.querySelector('p');
                    const time = details.querySelector('.alert-time');

                    if (title) title.textContent = alert.title;
                    if (message) message.textContent = alert.message;
                    if (time) time.textContent = getTimeAgo(alert.timestamp);
                }
            }
        });
    }
}

function populateAppointmentAlerts() {
    const appointmentAlerts = NotificationsApp.state.notifications.filter(n => n.type === 'appointment');
    const panel = document.querySelector('.appointment-alerts .panel-content');

    if (panel && appointmentAlerts.length > 0) {
        // Update panel header badge
        const badge = document.querySelector('.appointment-alerts .alert-badge');
        if (badge) {
            badge.textContent = `${appointmentAlerts.length} New Bookings`;
        }

        // Update existing alert items
        const alertItems = panel.querySelectorAll('.alert-item');
        const recentAlerts = appointmentAlerts.slice(0, 3);

        recentAlerts.forEach((alert, index) => {
            if (alertItems[index]) {
                const details = alertItems[index].querySelector('.alert-details');
                if (details) {
                    const title = details.querySelector('h5');
                    const message = details.querySelector('p');
                    const time = details.querySelector('.alert-time');

                    if (title) title.textContent = alert.title;
                    if (message) message.textContent = alert.message;
                    if (time) time.textContent = getTimeAgo(alert.timestamp);
                }
            }
        });
    }
}

function populateBillingAlerts() {
    const billingAlerts = NotificationsApp.state.notifications.filter(n => n.type === 'billing');
    const panel = document.querySelector('.billing-alerts .panel-content');

    if (panel && billingAlerts.length > 0) {
        // Update panel header badge
        const badge = document.querySelector('.billing-alerts .alert-badge');
        if (badge) {
            badge.textContent = `Service Charge Due`;
        }
    }
}

function populateNotificationHistory() {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;

    // Get recent notifications for history display
    const recentNotifications = NotificationsApp.state.notifications.slice(0, 10);

    // Update existing history items with real data
    const historyItems = historyList.querySelectorAll('.history-item');

    recentNotifications.forEach((notification, index) => {
        if (historyItems[index]) {
            const item = historyItems[index];

            // Update classes based on notification data
            item.className = `history-item ${notification.status} ${notification.priority}-priority`;

            // Update content
            const title = item.querySelector('.item-header h5');
            const message = item.querySelector('.item-content p');
            const type = item.querySelector('.item-type');
            const time = item.querySelector('.item-time');
            const priorityBadge = item.querySelector('.priority-badge');

            if (title) title.textContent = notification.title;
            if (message) message.textContent = notification.message;
            if (type) type.textContent = notification.type;
            if (time) time.textContent = getTimeAgo(notification.timestamp);
            if (priorityBadge) {
                priorityBadge.className = `priority-badge ${notification.priority}`;
                priorityBadge.textContent = notification.priority;
            }
        }
    });
}

function addAnnouncementToUI(notification) {
    // Add announcement to the announcements tab
    const notificationsList = document.querySelector('.announcements-tab .notification-list');
    if (notificationsList) {
        const announcementElement = createAnnouncementElement(notification);
        notificationsList.insertBefore(announcementElement, notificationsList.firstChild);

        // Animate appearance
        announcementElement.style.opacity = '0';
        announcementElement.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            announcementElement.style.transition = 'all 0.3s ease-out';
            announcementElement.style.opacity = '1';
            announcementElement.style.transform = 'translateY(0)';
        }, 100);
    }
}

function createAnnouncementElement(notification) {
    const announcementDiv = document.createElement('div');
    announcementDiv.className = `notification-item ${notification.priority}-priority`;

    const recipientText = Array.isArray(notification.recipients) ?
        notification.recipients.join(', ') : 'All Staff';

    announcementDiv.innerHTML = `
        <div class="notification-header">
            <div class="notification-icon">
                <i class="fas fa-bullhorn"></i>
            </div>
            <div class="notification-meta">
                <h5>${notification.title}</h5>
                <div class="notification-details">
                    <span class="sender">${notification.source}</span>
                    <span class="timestamp">Just now</span>
                    <span class="priority-badge ${notification.priority}">${notification.priority} Priority</span>
                </div>
            </div>
            <div class="notification-actions">
                <button class="action-btn">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        </div>
        <div class="notification-content">
            <p>${notification.message}</p>
            <div class="read-status">
                <span class="read-count">Sent to: ${recipientText}</span>
                <span class="status-badge sent">Sent</span>
            </div>
        </div>
    `;

    return announcementDiv;
}

// ====================================
// NOTIFICATION DETAILS MODAL
// ====================================
function showNotificationDetailsModal(notificationElement) {
    const modal = createNotificationDetailsModal(notificationElement);
    document.body.appendChild(modal);
    showModal(modal.id);
}

function createNotificationDetailsModal(notificationElement) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'notificationDetailsModal';

    // Extract notification data from element
    const title = notificationElement.querySelector('h5')?.textContent || 'Notification Details';
    const message = notificationElement.querySelector('p')?.textContent || 'No additional details available';
    const timestamp = notificationElement.querySelector('.timestamp, .item-time')?.textContent || 'Unknown time';
    const priority = notificationElement.className.includes('high-priority') ? 'high' :
        notificationElement.className.includes('medium-priority') ? 'medium' : 'low';

    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3 class="modal-title">Notification Details</h3>
                <span class="priority-indicator ${priority}">${priority.toUpperCase()} PRIORITY</span>
                <button class="modal-close" onclick="hideModal('notificationDetailsModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="notification-details-content">
                    <div class="detail-section">
                        <h4>Notification Information</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Title:</label>
                                <span>${title}</span>
                            </div>
                            <div class="detail-item">
                                <label>Timestamp:</label>
                                <span>${timestamp}</span>
                            </div>
                            <div class="detail-item">
                                <label>Priority:</label>
                                <span class="priority-badge ${priority}">${priority}</span>
                            </div>
                            <div class="detail-item">
                                <label>Status:</label>
                                <span class="status-badge">Active</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4>Message Content</h4>
                        <div class="message-content">
                            <p>${message}</p>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4>Actions Available</h4>
                        <div class="action-list">
                            <button class="detail-action-btn primary">
                                <i class="fas fa-check"></i>
                                Mark as Resolved
                            </button>
                            <button class="detail-action-btn secondary">
                                <i class="fas fa-reply"></i>
                                Respond
                            </button>
                            <button class="detail-action-btn secondary">
                                <i class="fas fa-forward"></i>
                                Forward
                            </button>
                            <button class="detail-action-btn secondary">
                                <i class="fas fa-archive"></i>
                                Archive
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="hideModal('notificationDetailsModal')">
                    Close
                </button>
                <button type="button" class="btn-primary" onclick="resolveNotificationFromDetails()">
                    Mark as Resolved
                </button>
            </div>
        </div>
    `;

    return modal;
}

function resolveNotificationFromDetails() {
    hideModal('notificationDetailsModal');
    showToast('success', 'Notification Resolved', 'Notification has been marked as resolved');
}

// ====================================
// COMPOSER MODALS
// ====================================
function showSMSComposer() {
    const modal = createSMSComposerModal();
    document.body.appendChild(modal);
    showModal(modal.id);
}

function showEmailComposer() {
    const modal = createEmailComposerModal();
    document.body.appendChild(modal);
    showModal(modal.id);
}

function createSMSComposerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'smsComposerModal';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Send SMS</h3>
                <button class="modal-close" onclick="hideModal('smsComposerModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="sms-composer">
                    <div class="recipient-info">
                        <h4>Recipient</h4>
                        <p><strong>Name:</strong> Sarah Johnson</p>
                        <p><strong>Phone:</strong> +254 700 123 456</p>
                    </div>
                    <div class="message-composer">
                        <h4>Message</h4>
                        <textarea class="form-control" rows="4" placeholder="Type your SMS message here..." maxlength="160"></textarea>
                        <div class="character-count">
                            <span class="count">0</span>/160 characters
                        </div>
                    </div>
                    <div class="quick-responses">
                        <h4>Quick Responses</h4>
                        <div class="response-buttons">
                            <button class="response-btn" onclick="insertSMSTemplate('payment')">
                                Payment Reminder
                            </button>
                            <button class="response-btn" onclick="insertSMSTemplate('appointment')">
                                Appointment Confirmation
                            </button>
                            <button class="response-btn" onclick="insertSMSTemplate('followup')">
                                Follow-up Required
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="hideModal('smsComposerModal')">
                    Cancel
                </button>
                <button type="button" class="btn-primary" onclick="sendSMS()">
                    Send SMS
                </button>
            </div>
        </div>
    `;

    return modal;
}

function createEmailComposerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'emailComposerModal';

    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3 class="modal-title">Send Email</h3>
                <button class="modal-close" onclick="hideModal('emailComposerModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="email-composer">
                    <div class="email-fields">
                        <div class="form-group">
                            <label>To:</label>
                            <input type="email" class="form-control" value="sarah.j@email.com" readonly>
                        </div>
                        <div class="form-group">
                            <label>Subject:</label>
                            <input type="text" class="form-control" placeholder="Enter email subject">
                        </div>
                    </div>
                    <div class="email-content">
                        <label>Message:</label>
                        <div class="rich-text-editor">
                            <div class="editor-toolbar">
                                <button type="button" class="editor-btn" data-action="bold">
                                    <i class="fas fa-bold"></i>
                                </button>
                                <button type="button" class="editor-btn" data-action="italic">
                                    <i class="fas fa-italic"></i>
                                </button>
                                <button type="button" class="editor-btn" data-action="underline">
                                    <i class="fas fa-underline"></i>
                                </button>
                                <button type="button" class="editor-btn" data-action="insertUnorderedList">
                                    <i class="fas fa-list-ul"></i>
                                </button>
                            </div>
                            <textarea class="form-control" rows="8" placeholder="Type your email message here..."></textarea>
                        </div>
                    </div>
                    <div class="email-templates">
                        <h4>Email Templates</h4>
                        <div class="template-buttons">
                            <button class="template-btn" onclick="insertEmailTemplate('payment_reminder')">
                                Payment Reminder
                            </button>
                            <button class="template-btn" onclick="insertEmailTemplate('appointment_confirm')">
                                Appointment Confirmation
                            </button>
                            <button class="template-btn" onclick="insertEmailTemplate('general_inquiry')">
                                General Inquiry Response
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="hideModal('emailComposerModal')">
                    Cancel
                </button>
                <button type="button" class="btn-secondary" onclick="saveEmailDraft()">
                    Save Draft
                </button>
                <button type="button" class="btn-primary" onclick="sendEmail()">
                    Send Email
                </button>
            </div>
        </div>
    `;

    return modal;
}

function insertSMSTemplate(templateType) {
    const templates = {
        payment: 'Hi! This is a reminder about your pending payment of KES 2,500. Please contact us at 0700123456 to arrange payment. Thank you.',
        appointment: 'Your appointment has been confirmed for tomorrow at 10:00 AM with Dr. Sarah Johnson. Please arrive 15 minutes early.',
        followup: 'Please contact the clinic at your earliest convenience regarding your recent visit. Call 0700123456. Thank you.'
    };

    const textarea = document.querySelector('#smsComposerModal textarea');
    if (textarea && templates[templateType]) {
        textarea.value = templates[templateType];
        updateCharacterCount(textarea);
    }
}

function insertEmailTemplate(templateType) {
    const templates = {
        payment_reminder: {
            subject: 'Payment Reminder - Clinic Visit',
            body: 'Dear Patient,\n\nThis is a friendly reminder about your outstanding payment of KES 2,500 for your recent clinic visit.\n\nPayment Details:\n- Service: General Consultation\n- Date: [Date]\n- Amount: KES 2,500\n\nPlease contact us to arrange payment or discuss payment options.\n\nThank you,\nCuris Clinic'
        },
        appointment_confirm: {
            subject: 'Appointment Confirmation',
            body: 'Dear Patient,\n\nYour appointment has been confirmed:\n\n- Date: Tomorrow\n- Time: 10:00 AM\n- Doctor: Dr. Sarah Johnson\n- Service: General Consultation\n\nPlease arrive 15 minutes early and bring a valid ID.\n\nBest regards,\nCuris Clinic'
        },
        general_inquiry: {
            subject: 'Response to Your Inquiry',
            body: 'Dear Patient,\n\nThank you for contacting Curis Clinic. We have received your inquiry and will respond within 24 hours.\n\nIf this is urgent, please call us at +254 700 123 456.\n\nBest regards,\nCuris Clinic Team'
        }
    };

    const subjectInput = document.querySelector('#emailComposerModal input[placeholder*="subject"]');
    const messageTextarea = document.querySelector('#emailComposerModal textarea');

    if (templates[templateType]) {
        if (subjectInput) subjectInput.value = templates[templateType].subject;
        if (messageTextarea) messageTextarea.value = templates[templateType].body;
    }
}

function sendSMS() {
    const message = document.querySelector('#smsComposerModal textarea')?.value;

    if (!message || message.trim().length === 0) {
        showToast('warning', 'Empty Message', 'Please enter a message to send');
        return;
    }

    showLoadingSpinner();

    setTimeout(() => {
        hideModal('smsComposerModal');
        hideLoadingSpinner();
        showToast('success', 'SMS Sent', 'SMS message has been sent to the patient');
    }, 2000);
}

function sendEmail() {
    const subject = document.querySelector('#emailComposerModal input[placeholder*="subject"]')?.value;
    const message = document.querySelector('#emailComposerModal textarea')?.value;

    if (!subject || !message) {
        showToast('warning', 'Incomplete Email', 'Please enter both subject and message');
        return;
    }

    showLoadingSpinner();

    setTimeout(() => {
        hideModal('emailComposerModal');
        hideLoadingSpinner();
        showToast('success', 'Email Sent', 'Email has been sent to the patient');
    }, 3000);
}

function saveEmailDraft() {
    const subject = document.querySelector('#emailComposerModal input[placeholder*="subject"]')?.value;
    const message = document.querySelector('#emailComposerModal textarea')?.value;

    const draft = {
        subject: subject,
        message: message,
        to: 'sarah.j@email.com',
        savedAt: new Date()
    };

    localStorage.setItem('curisEmailDraft', JSON.stringify(draft));
    showToast('success', 'Draft Saved', 'Email draft has been saved');
}

function updateCharacterCount(textarea) {
    const count = textarea.value.length;
    const countElement = textarea.closest('.modal').querySelector('.count');
    if (countElement) {
        countElement.textContent = count;

        // Change color if approaching limit
        if (count > 140) {
            countElement.style.color = '#EF4444';
        } else if (count > 120) {
            countElement.style.color = '#F59E0B';
        } else {
            countElement.style.color = '#6B7280';
        }
    }
}

// ====================================
// RICH TEXT EDITOR FUNCTIONS
// ====================================
function executeEditorAction(action) {
    const textarea = document.querySelector('#announcementMessage');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let replacement = '';

    switch (action) {
        case 'bold':
            replacement = `**${selectedText || 'bold text'}**`;
            break;
        case 'italic':
            replacement = `*${selectedText || 'italic text'}*`;
            break;
        case 'underline':
            replacement = `<u>${selectedText || 'underlined text'}</u>`;
            break;
        case 'insertUnorderedList':
            replacement = `\n• ${selectedText || 'list item'}\n`;
            break;
        case 'insertOrderedList':
            replacement = `\n1. ${selectedText || 'list item'}\n`;
            break;
    }

    // Replace selected text with formatted text
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    // Update cursor position
    const newPosition = start + replacement.length;
    textarea.setSelectionRange(newPosition, newPosition);

    // Update preview
    updateAnnouncementPreview();

    // Focus back to textarea
    textarea.focus();
}

function updateRecipientSelection() {
    const allStaffCheckbox = document.querySelector('input[name="recipients"][value="all"]');
    const otherCheckboxes = document.querySelectorAll('input[name="recipients"]:not([value="all"])');

    if (allStaffCheckbox && allStaffCheckbox.checked) {
        // If "All Staff" is checked, uncheck others
        otherCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    } else {
        // If any specific group is checked, uncheck "All Staff"
        const anySpecificChecked = Array.from(otherCheckboxes).some(cb => cb.checked);
        if (anySpecificChecked && allStaffCheckbox) {
            allStaffCheckbox.checked = false;
        }
    }
}

function updateEmergencyForm() {
    const emergencyType = document.getElementById('emergencyType')?.value;
    const descriptionTextarea = document.getElementById('emergencyDescription');

    if (emergencyType && descriptionTextarea) {
        // Auto-populate description based on emergency type
        const templates = {
            medical: 'Medical emergency requiring immediate attention. Please provide specific details about the situation.',
            security: 'Security incident requiring immediate response. Describe the nature of the threat or concern.',
            equipment: 'Equipment failure affecting clinic operations. Specify which equipment and impact on services.',
            fire: 'Fire emergency - immediate evacuation may be required. Describe location and severity.',
            other: 'Please provide detailed description of the emergency situation.'
        };

        if (templates[emergencyType] && !descriptionTextarea.value) {
            descriptionTextarea.placeholder = templates[emergencyType];
        }
    }
}

function handleSendEmergencyAlert() {
    const form = document.getElementById('emergencyAlertForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
}

function handleCallEmergencyServices() {
    if (confirm('This will immediately contact emergency services (999). Continue?')) {
        showToast('error', 'Emergency Services Contacted', 'Emergency services have been notified');
        hideModal('emergencyAlertModal');

        // Log emergency services contact
        console.log('🚨 Emergency services contacted at', new Date());
    }
}

function handleContactOwner() {
    showToast('info', 'Contacting Owner', 'Clinic owner has been notified immediately');

    // Simulate owner contact
    setTimeout(() => {
        showToast('success', 'Owner Contacted', 'Clinic owner acknowledged emergency alert');
    }, 3000);
}

// ====================================
// CLEANUP AND ERROR HANDLING
// ====================================
window.addEventListener('beforeunload', function () {
    // Cleanup intervals
    if (NotificationsApp.intervals.connectionCheck) {
        clearInterval(NotificationsApp.intervals.connectionCheck);
    }

    if (NotificationsApp.intervals.dataRefresh) {
        clearInterval(NotificationsApp.intervals.dataRefresh);
    }

    // Close WebSocket connection
    if (NotificationsApp.websocket) {
        NotificationsApp.websocket.close();
    }
});

// Global error handler
window.addEventListener('error', function (e) {
    console.error('Notifications app error:', e.error);
    showToast('error', 'Application Error', 'An unexpected error occurred. Please refresh the page.');
});

// ====================================
// UTILITY FUNCTIONS FOR UI UPDATES
// ====================================
function updateUIWithFilteredNotifications(filteredNotifications) {
    // Update history list with filtered results
    const historyList = document.querySelector('.history-list');
    if (historyList) {
        // Clear current items
        historyList.innerHTML = '';

        // Add filtered items
        filteredNotifications.slice(0, 20).forEach(notification => {
            const historyItem = createHistoryItemElement(notification);
            historyList.appendChild(historyItem);
        });

        // Update pagination info
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            const total = filteredNotifications.length;
            const showing = Math.min(20, total);
            paginationInfo.textContent = `Showing 1-${showing} of ${total}`;
        }
    }
}

function createHistoryItemElement(notification) {
    const historyDiv = document.createElement('div');
    historyDiv.className = `history-item ${notification.status} ${notification.priority}-priority`;
    historyDiv.setAttribute('data-notification-id', notification.id);

    historyDiv.innerHTML = `
        <div class="item-indicator"></div>
        <div class="item-content">
            <div class="item-header">
                <h5>${notification.title}</h5>
                <div class="item-meta">
                    <span class="item-type">${notification.type}</span>
                    <span class="item-time">${getTimeAgo(notification.timestamp)}</span>
                    <span class="priority-badge ${notification.priority}">${notification.priority}</span>
                </div>
            </div>
            <p>${notification.message}</p>
            <div class="item-actions">
                <button class="item-action-btn">View Details</button>
                <button class="item-action-btn">Mark Resolved</button>
            </div>
        </div>
    `;

    // Add event listeners
    const actionBtns = historyDiv.querySelectorAll('.item-action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const action = this.textContent.trim();
            handleHistoryAction(historyDiv, action);
        });
    });

    historyDiv.addEventListener('click', function (e) {
        if (!e.target.closest('.item-actions')) {
            handleViewHistoryItem(this);
        }
    });

    return historyDiv;
}

// ====================================
// PERFORMANCE MONITORING
// ====================================
function monitorPerformance() {
    // Monitor notification processing performance
    const performanceMetrics = {
        notificationLoadTime: 0,
        averageResponseTime: 0,
        memoryUsage: 0
    };

    // Simulate performance monitoring
    setInterval(() => {
        performanceMetrics.notificationLoadTime = Math.random() * 1000 + 500; // 500-1500ms
        performanceMetrics.averageResponseTime = Math.random() * 200 + 100; // 100-300ms

        if (performance.memory) {
            performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }

        // Log performance metrics periodically
        console.log('📊 Performance metrics:', performanceMetrics);

        // Show warning if performance degrades
        if (performanceMetrics.notificationLoadTime > 2000) {
            console.warn('⚠️ Slow notification loading detected');
        }
    }, 30000); // Every 30 seconds
}

// Start performance monitoring
monitorPerformance();

// ====================================
// EXPORT GLOBAL FUNCTIONS
// ====================================
// Make some functions globally available for HTML onclick handlers
window.hideModal = hideModal;
window.hideToast = hideToast;
window.initiateContact = initiateContact;
window.useTemplate = useTemplate;
window.selectTimeSlot = selectTimeSlot;
window.confirmReschedule = confirmReschedule;
window.sendAnnouncementFromPreview = sendAnnouncementFromPreview;
window.insertSMSTemplate = insertSMSTemplate;
window.insertEmailTemplate = insertEmailTemplate;
window.sendSMS = sendSMS;
window.sendEmail = sendEmail;
window.saveEmailDraft = saveEmailDraft;
window.markAllAsRead = markAllAsRead;
window.resolveAllActionItems = resolveAllActionItems;
window.archiveResolved = archiveResolved;
window.manageArchive = manageArchive;
window.bulkMarkAsRead = bulkMarkAsRead;
window.bulkMarkAsResolved = bulkMarkAsResolved;
window.bulkArchive = bulkArchive;
window.bulkDelete = bulkDelete;
window.saveStatusRules = saveStatusRules;
window.resolveNotificationFromDetails = resolveNotificationFromDetails;

console.log('🎉 Curis Notifications Center JavaScript Loaded Successfully!');
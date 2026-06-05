// ===================================
// CURIS SUPER ADMIN DASHBOARD JS
// ===================================

// Global state management
const DashboardState = {
    notifications: [],
    realTimeInterval: null,
    websocket: null,
    currentTheme: localStorage.getItem('theme') || 'light',
    userData: {
        totalUsers: 1247,
        patients: 856,
        doctors: 142,
        receptionists: 124,
        clinicOwners: 125,
        activeUsers: 1198,
        suspendedUsers: 32,
        pendingUsers: 17
    },
    appointmentData: {
        todayTotal: 234,
        upcoming: 89,
        completed: 127,
        canceled: 18,
        forceCanceled: 2
    },
    financialData: {
        monthlyRevenue: 2847500,
        weeklyRevenue: 712400,
        biweeklyRevenue: 1424800,
        outstandingBalance: 324150
    },
    systemStatus: {
        appRunning: true,
        maintenanceMode: false,
        smsGateway: true,
        emailGateway: true,
        whatsappAPI: true
    },
    securityData: {
        successfulLogins: 1247,
        failedAttempts: 23,
        securityAlerts: 2
    },
    supportData: {
        openTickets: 47,
        highPriority: 8,
        mediumPriority: 24,
        lowPriority: 15
    }
};

// Initialize dashboard on DOM load
document.addEventListener('DOMContentLoaded', function () {
    initializeDashboard();
    initializeEventListeners();
    initializeRealTimeUpdates();
    applyTheme(DashboardState.currentTheme);
});

// ===================================
// INITIALIZATION FUNCTIONS
// ===================================

function initializeDashboard() {
    // Update all widget displays with initial data
    updateUserWidget();
    updateAppointmentWidget();
    updateFinancialWidget();
    updateHealthWidget();
    updateSecurityWidget();
    updateSupportWidget();

    // Check for any system alerts
    checkSystemAlerts();

    // Initialize tooltips if needed
    initializeTooltips();
}

function initializeEventListeners() {
    // Header event listeners
    const notificationBtn = document.getElementById('notificationBtn');
    const userProfileBtn = document.getElementById('userProfileBtn');
    const closeNotifications = document.getElementById('closeNotifications');
    const closeAlert = document.getElementById('closeAlert');

    // Header interactions
    notificationBtn?.addEventListener('click', toggleNotificationPanel);
    userProfileBtn?.addEventListener('click', toggleUserDropdown);
    closeNotifications?.addEventListener('click', hideNotificationPanel);
    closeAlert?.addEventListener('click', hideAlertBanner);

    // Widget click handlers
    document.getElementById('userWidget')?.addEventListener('click', () => showModal('userPopup'));
    document.getElementById('appointmentWidget')?.addEventListener('click', () => showModal('appointmentPopup'));
    document.getElementById('financialWidget')?.addEventListener('click', () => showModal('financialPopup'));
    document.getElementById('healthWidget')?.addEventListener('click', () => showModal('healthPopup'));
    document.getElementById('securityWidget')?.addEventListener('click', () => showModal('securityPopup'));
    document.getElementById('supportWidget')?.addEventListener('click', () => showModal('supportPopup'));

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.currentTarget.getAttribute('data-modal');
            hideModal(modalId);
        });
    });

    // Modal overlay click to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideModal(overlay.id);
            }
        });
    });

    // Quick action buttons
    document.getElementById('quickAddUser')?.addEventListener('click', handleQuickAddUser);
    document.getElementById('quickViewAppointments')?.addEventListener('click', handleQuickViewAppointments);
    document.getElementById('quickAdjustCharges')?.addEventListener('click', handleQuickAdjustCharges);
    document.getElementById('quickViewTickets')?.addEventListener('click', handleQuickViewTickets);
    document.getElementById('quickMaintenance')?.addEventListener('click', handleQuickMaintenance);

    // Modal action buttons
    document.getElementById('addNewUserBtn')?.addEventListener('click', handleAddNewUser);
    document.getElementById('manageRolesBtn')?.addEventListener('click', handleManageRoles);
    document.getElementById('viewAppointmentDetails')?.addEventListener('click', handleViewAppointmentDetails);
    document.getElementById('viewFullReportBtn')?.addEventListener('click', handleViewFullReport);
    document.getElementById('configureChargesBtn')?.addEventListener('click', handleConfigureCharges);
    document.getElementById('systemSettingsBtn')?.addEventListener('click', handleSystemSettings);
    document.getElementById('toggleMaintenanceBtn')?.addEventListener('click', handleToggleMaintenance);
    document.getElementById('viewFullLogsBtn')?.addEventListener('click', handleViewFullLogs);
    document.getElementById('viewAllTicketsBtn')?.addEventListener('click', handleViewAllTickets);

    // Maintenance mode toggle
    document.getElementById('maintenanceToggle')?.addEventListener('change', handleMaintenanceToggle);

    // Dark mode toggle
    document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);

    // Click outside handlers
    document.addEventListener('click', handleOutsideClick);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ===================================
// REAL-TIME UPDATE FUNCTIONS
// ===================================

function initializeRealTimeUpdates() {
    // Simulate real-time updates with intervals
    // In production, replace with WebSocket connections

    DashboardState.realTimeInterval = setInterval(() => {
        // Simulate random updates
        simulateDataUpdates();
        updateWidgets();
    }, 5000); // Update every 5 seconds

    // Optional: Initialize WebSocket for real updates
    // initializeWebSocket();
}

function simulateDataUpdates() {
    // Simulate user count changes
    const userChange = Math.floor(Math.random() * 5) - 2;
    DashboardState.userData.totalUsers += userChange;
    DashboardState.userData.activeUsers += userChange;

    // Simulate appointment changes
    const apptChange = Math.floor(Math.random() * 3) - 1;
    DashboardState.appointmentData.todayTotal += apptChange;

    // Simulate financial changes
    const finChange = Math.floor(Math.random() * 10000) - 5000;
    DashboardState.financialData.monthlyRevenue += finChange;

    // Simulate ticket changes
    const ticketChange = Math.floor(Math.random() * 3) - 1;
    DashboardState.supportData.openTickets += ticketChange;
}

function updateWidgets() {
    updateUserWidget();
    updateAppointmentWidget();
    updateFinancialWidget();
    updateSupportWidget();

    // Update live status indicator
    const statusIndicator = document.querySelector('.status-indicator i');
    if (statusIndicator) {
        statusIndicator.style.animation = 'pulse 0.5s';
        setTimeout(() => {
            statusIndicator.style.animation = 'pulse 2s infinite';
        }, 500);
    }
}

// ===================================
// WIDGET UPDATE FUNCTIONS
// ===================================

function updateUserWidget() {
    const widget = document.getElementById('userWidget');
    if (!widget) return;

    // Update total users
    const totalUsersEl = widget.querySelector('.stat-number');
    if (totalUsersEl) {
        animateNumber(totalUsersEl, DashboardState.userData.totalUsers);
    }

    // Update role breakdown
    const breakdownItems = widget.querySelectorAll('.breakdown-item strong');
    if (breakdownItems.length >= 4) {
        animateNumber(breakdownItems[0], DashboardState.userData.patients);
        animateNumber(breakdownItems[1], DashboardState.userData.doctors);
        animateNumber(breakdownItems[2], DashboardState.userData.receptionists);
        animateNumber(breakdownItems[3], DashboardState.userData.clinicOwners);
    }
}

function updateAppointmentWidget() {
    const widget = document.getElementById('appointmentWidget');
    if (!widget) return;

    const statNumber = widget.querySelector('.stat-number');
    if (statNumber) {
        animateNumber(statNumber, DashboardState.appointmentData.todayTotal);
    }

    const statusItems = widget.querySelectorAll('.status-item strong');
    if (statusItems.length >= 3) {
        animateNumber(statusItems[0], DashboardState.appointmentData.upcoming);
        animateNumber(statusItems[1], DashboardState.appointmentData.completed);
        animateNumber(statusItems[2], DashboardState.appointmentData.canceled);
    }
}

function updateFinancialWidget() {
    const widget = document.getElementById('financialWidget');
    if (!widget) return;

    const revenueAmount = widget.querySelector('.revenue-amount');
    if (revenueAmount) {
        revenueAmount.textContent = `KES. ${formatNumber(DashboardState.financialData.monthlyRevenue)}`;
    }

    const breakdownRows = widget.querySelectorAll('.breakdown-row strong');
    if (breakdownRows.length >= 2) {
        breakdownRows[0].textContent = `KES. ${formatNumber(DashboardState.financialData.weeklyRevenue)}`;
        breakdownRows[1].textContent = `KES. ${formatNumber(DashboardState.financialData.biweeklyRevenue)}`;
    }

    const outstandingSpan = widget.querySelector('.outstanding-balance span:last-child');
    if (outstandingSpan) {
        outstandingSpan.textContent = `Outstanding: KES. ${formatNumber(DashboardState.financialData.outstandingBalance)}`;
    }
}

function updateHealthWidget() {
    const widget = document.getElementById('healthWidget');
    if (!widget) return;

    // Update system status
    const statusItems = widget.querySelectorAll('.status-item');
    if (statusItems.length >= 2) {
        const appStatus = statusItems[0].querySelector('span');
        if (appStatus) {
            appStatus.textContent = DashboardState.systemStatus.appRunning ? 'App Status: Running' : 'App Status: Stopped';
        }

        const maintenanceStatus = statusItems[1].querySelector('span');
        if (maintenanceStatus) {
            maintenanceStatus.textContent = `Maintenance: ${DashboardState.systemStatus.maintenanceMode ? 'ON' : 'OFF'}`;
        }
    }
}

function updateSecurityWidget() {
    const widget = document.getElementById('securityWidget');
    if (!widget) return;

    const loginItems = widget.querySelectorAll('.login-item strong');
    if (loginItems.length >= 2) {
        animateNumber(loginItems[0], DashboardState.securityData.successfulLogins);
        animateNumber(loginItems[1], DashboardState.securityData.failedAttempts);
    }

    const alertsSpan = widget.querySelector('.security-alerts span:last-child');
    if (alertsSpan) {
        alertsSpan.textContent = `${DashboardState.securityData.securityAlerts} Security Alerts`;
    }
}

function updateSupportWidget() {
    const widget = document.getElementById('supportWidget');
    if (!widget) return;

    const countNumber = widget.querySelector('.count-number');
    if (countNumber) {
        animateNumber(countNumber, DashboardState.supportData.openTickets);
    }

    const priorityItems = widget.querySelectorAll('.priority-item strong');
    if (priorityItems.length >= 3) {
        animateNumber(priorityItems[0], DashboardState.supportData.highPriority);
        animateNumber(priorityItems[1], DashboardState.supportData.mediumPriority);
        animateNumber(priorityItems[2], DashboardState.supportData.lowPriority);
    }
}

// ===================================
// MODAL MANAGEMENT
// ===================================

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Hide any open modals first
    document.querySelectorAll('.modal-overlay').forEach(m => {
        m.classList.add('hidden');
    });

    // Update modal content based on current state
    updateModalContent(modalId);

    // Show the modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Trap focus in modal
    trapFocus(modal);
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function updateModalContent(modalId) {
    switch (modalId) {
        case 'userPopup':
            updateUserPopupContent();
            break;
        case 'appointmentPopup':
            updateAppointmentPopupContent();
            break;
        case 'financialPopup':
            updateFinancialPopupContent();
            break;
        case 'healthPopup':
            updateHealthPopupContent();
            break;
        case 'securityPopup':
            updateSecurityPopupContent();
            break;
        case 'supportPopup':
            updateSupportPopupContent();
            break;
    }
}

function updateUserPopupContent() {
    const popup = document.getElementById('userPopup');
    if (!popup) return;

    // Update role statistics
    const roleItems = popup.querySelectorAll('.role-item strong');
    if (roleItems.length >= 4) {
        roleItems[0].textContent = DashboardState.userData.patients;
        roleItems[1].textContent = DashboardState.userData.doctors;
        roleItems[2].textContent = DashboardState.userData.receptionists;
        roleItems[3].textContent = DashboardState.userData.clinicOwners;
    }

    // Update status indicators
    const statusItems = popup.querySelectorAll('.status-item strong');
    if (statusItems.length >= 3) {
        statusItems[0].textContent = DashboardState.userData.activeUsers;
        statusItems[1].textContent = DashboardState.userData.suspendedUsers;
        statusItems[2].textContent = DashboardState.userData.pendingUsers;
    }
}

function updateAppointmentPopupContent() {
    const popup = document.getElementById('appointmentPopup');
    if (!popup) return;

    const totalSpan = popup.querySelector('.highlight');
    if (totalSpan) {
        totalSpan.textContent = DashboardState.appointmentData.todayTotal;
    }

    const statusCounts = popup.querySelectorAll('.status-count');
    if (statusCounts.length >= 3) {
        statusCounts[0].textContent = DashboardState.appointmentData.upcoming;
        statusCounts[1].textContent = DashboardState.appointmentData.canceled;
        statusCounts[2].textContent = DashboardState.appointmentData.completed;
    }
}

function updateFinancialPopupContent() {
    const popup = document.getElementById('financialPopup');
    if (!popup) return;

    const amounts = popup.querySelectorAll('.revenue-item .amount');
    if (amounts.length >= 3) {
        amounts[0].textContent = `KES. ${formatNumber(DashboardState.financialData.weeklyRevenue)}`;
        amounts[1].textContent = `KES. ${formatNumber(DashboardState.financialData.biweeklyRevenue)}`;
        amounts[2].textContent = `KES. ${formatNumber(DashboardState.financialData.monthlyRevenue)}`;
    }

    const outstandingSpan = popup.querySelector('.outstanding-balances .warning');
    if (outstandingSpan) {
        outstandingSpan.textContent = `KES. ${formatNumber(DashboardState.financialData.outstandingBalance)}`;
    }
}

function updateHealthPopupContent() {
    const popup = document.getElementById('healthPopup');
    if (!popup) return;

    const maintenanceToggle = popup.querySelector('#maintenanceToggle');
    if (maintenanceToggle) {
        maintenanceToggle.checked = DashboardState.systemStatus.maintenanceMode;
    }
}

function updateSecurityPopupContent() {
    const popup = document.getElementById('securityPopup');
    if (!popup) return;

    const attemptItems = popup.querySelectorAll('.attempt-item strong');
    if (attemptItems.length >= 2) {
        attemptItems[0].textContent = DashboardState.securityData.successfulLogins;
        attemptItems[1].textContent = DashboardState.securityData.failedAttempts;
    }
}

function updateSupportPopupContent() {
    const popup = document.getElementById('supportPopup');
    if (!popup) return;

    const highlightSpan = popup.querySelector('.highlight');
    if (highlightSpan) {
        highlightSpan.textContent = DashboardState.supportData.openTickets;
    }

    const priorityCounts = popup.querySelectorAll('.priority-count');
    if (priorityCounts.length >= 3) {
        priorityCounts[0].textContent = DashboardState.supportData.highPriority;
        priorityCounts[1].textContent = DashboardState.supportData.mediumPriority;
        priorityCounts[2].textContent = DashboardState.supportData.lowPriority;
    }
}

// ===================================
// HEADER INTERACTIONS
// ===================================

function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    const dropdown = document.getElementById('userProfileDropdown');

    if (!panel) return;

    // Close user dropdown if open
    dropdown?.classList.add('hidden');

    panel.classList.toggle('hidden');
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userProfileDropdown');
    const panel = document.getElementById('notificationPanel');

    if (!dropdown) return;

    // Close notification panel if open
    panel?.classList.add('hidden');

    dropdown.classList.toggle('hidden');
}

function hideNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.add('hidden');
    }
}

function hideAlertBanner() {
    const banner = document.getElementById('alertBanner');
    if (banner) {
        banner.classList.add('hidden');
        // Store dismissal in session
        sessionStorage.setItem('alertDismissed', 'true');
    }
}

function handleOutsideClick(e) {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdown = document.getElementById('userProfileDropdown');

    // Close notification panel if clicked outside
    if (notificationPanel && !notificationPanel.contains(e.target) &&
        !notificationBtn.contains(e.target)) {
        notificationPanel.classList.add('hidden');
    }

    // Close user dropdown if clicked outside
    if (userDropdown && !userDropdown.contains(e.target) &&
        !userProfileBtn.contains(e.target)) {
        userDropdown.classList.add('hidden');
    }
}

// ===================================
// QUICK ACTION HANDLERS
// ===================================

function handleQuickAddUser() {
    // Show add user form or navigate to user creation
    showModal('userPopup');
    setTimeout(() => {
        document.getElementById('addNewUserBtn')?.click();
    }, 300);
}

function handleQuickViewAppointments() {
    // Navigate to appointments page
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Super Administrator\\Appointments\\appointments.html';
}

function handleQuickAdjustCharges() {
    // Show charge configuration modal
    showModal('financialPopup');
    setTimeout(() => {
        document.getElementById('configureChargesBtn')?.click();
    }, 300);
}

function handleQuickViewTickets() {
    // Show support tickets
    showModal('supportPopup');
}

function handleQuickMaintenance() {
    // Toggle maintenance mode
    handleToggleMaintenance();
}

// ===================================
// MODAL ACTION HANDLERS
// ===================================

function handleAddNewUser() {
    // Navigate to add user page or show add user form
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Super Administrator\\Curis Users\\curis_users.html#add-user';
}

function handleManageRoles() {
    // Navigate to users page with roles section
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Super Administrator\\Curis Users\\curis_users.html#manage-roles';
}

function handleViewAppointmentDetails() {
    // Navigate to appointments page
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Super Administrator\\Appointments\\appointments.html';
}

function handleViewFullReport() {
    // Navigate to billing page
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Super Administrator\\Billings and Payments\\billings_and_payments.html';
}

function handleConfigureCharges() {
    // Show charge configuration interface
    alert('Opening charge configuration interface...');
    // In production, this would open a configuration modal or navigate to settings
}

function handleSystemSettings() {
    // Navigate to settings page
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Super Administrator\\Settings\\settings.html';
}

function handleToggleMaintenance() {
    const confirmToggle = confirm(
        DashboardState.systemStatus.maintenanceMode
            ? 'Are you sure you want to disable maintenance mode?'
            : 'Are you sure you want to enable maintenance mode? This will affect all users.'
    );

    if (confirmToggle) {
        DashboardState.systemStatus.maintenanceMode = !DashboardState.systemStatus.maintenanceMode;
        const toggle = document.getElementById('maintenanceToggle');
        if (toggle) {
            toggle.checked = DashboardState.systemStatus.maintenanceMode;
        }

        // Update UI
        updateHealthWidget();

        // Show notification
        showNotification(
            DashboardState.systemStatus.maintenanceMode
                ? 'Maintenance mode enabled'
                : 'Maintenance mode disabled',
            'success'
        );

        // In production, send API request to update server
        // updateMaintenanceMode(DashboardState.systemStatus.maintenanceMode);
    }
}

function handleMaintenanceToggle(e) {
    DashboardState.systemStatus.maintenanceMode = e.target.checked;
    updateHealthWidget();
}

function handleViewFullLogs() {
    // Navigate to compliance hub
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Super Administrator\\Compliance Hub\\compliance_hub.html';
}

function handleViewAllTickets() {
    // Navigate to support ticket system
    alert('Navigating to support ticket system...');
    // In production, navigate to ticket management system
}

// ===================================
// THEME MANAGEMENT
// ===================================

function toggleDarkMode() {
    const newTheme = DashboardState.currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    DashboardState.currentTheme = newTheme;
    localStorage.setItem('theme', newTheme);

    // Update button text
    const darkModeBtn = document.getElementById('darkModeToggle');
    if (darkModeBtn) {
        const icon = darkModeBtn.querySelector('i');
        const text = darkModeBtn.querySelector('span');

        if (newTheme === 'dark') {
            icon.className = 'fas fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Dark Mode';
        }
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function animateNumber(element, targetNumber) {
    if (!element) return;

    const currentNumber = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const increment = (targetNumber - currentNumber) / 20;
    let current = currentNumber;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= targetNumber) ||
            (increment < 0 && current <= targetNumber)) {
            current = targetNumber;
            clearInterval(timer);
        }
        element.textContent = Math.round(current).toLocaleString();
    }, 50);
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Add animation class
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function checkSystemAlerts() {
    // Check for critical system issues
    if (!DashboardState.systemStatus.emailGateway ||
        !DashboardState.systemStatus.smsGateway) {
        showAlertBanner('Critical: Communication gateway issues detected');
    }

    if (DashboardState.securityData.failedAttempts > 50) {
        showAlertBanner('Security Alert: High number of failed login attempts');
    }
}

function showAlertBanner(message) {
    // Check if already dismissed in session
    if (sessionStorage.getItem('alertDismissed') === 'true') return;

    const banner = document.getElementById('alertBanner');
    const messageEl = document.getElementById('alertMessage');

    if (banner && messageEl) {
        messageEl.textContent = message;
        banner.classList.remove('hidden');
    }
}

function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }

        if (e.key === 'Escape') {
            const modalId = element.id;
            hideModal(modalId);
        }
    });
}

function initializeTooltips() {
    // Initialize any tooltips for enhanced UX
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', showTooltip);
        el.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('data-tooltip');

    document.body.appendChild(tooltip);

    const rect = e.target.getBoundingClientRect();
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';
}

function hideTooltip() {
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
}

// ===================================
// KEYBOARD SHORTCUTS
// ===================================

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K: Quick search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Open quick search modal
        console.log('Quick search activated');
    }

    // Ctrl/Cmd + N: Add new user
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleQuickAddUser();
    }

    // Ctrl/Cmd + /: Show keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        showKeyboardShortcuts();
    }
}

function showKeyboardShortcuts() {
    alert(`Keyboard Shortcuts:
    
Ctrl/Cmd + K: Quick Search
Ctrl/Cmd + N: Add New User
Ctrl/Cmd + /: Show Shortcuts
Esc: Close Modal`);
}

// ===================================
// CLEANUP FUNCTIONS
// ===================================

window.addEventListener('beforeunload', function () {
    // Clean up intervals
    if (DashboardState.realTimeInterval) {
        clearInterval(DashboardState.realTimeInterval);
    }

    // Close WebSocket if connected
    if (DashboardState.websocket) {
        DashboardState.websocket.close();
    }
});

// ===================================
// NOTIFICATION TOAST STYLES
// ===================================

// Add dynamic styles for notification toasts
const style = document.createElement('style');
style.textContent = `
.notification-toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--white);
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(400px);
    transition: transform 0.3s ease-out;
    z-index: 1100;
}

.notification-toast.show {
    transform: translateX(0);
}

.notification-toast.success {
    border-left: 4px solid var(--success-green);
}

.notification-toast.error {
    border-left: 4px solid var(--error-red);
}

.notification-toast.info {
    border-left: 4px solid var(--info-blue);
}

.notification-toast i {
    font-size: 20px;
}

.notification-toast.success i {
    color: var(--success-green);
}

.notification-toast.error i {
    color: var(--error-red);
}

.notification-toast.info i {
    color: var(--info-blue);
}

.tooltip {
    position: absolute;
    background: var(--charcoal-gray);
    color: var(--white);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    z-index: 1200;
    pointer-events: none;
}

.tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: var(--charcoal-gray);
}
`;
document.head.appendChild(style);

// ===================================
// API INTEGRATION FUNCTIONS (PRODUCTION)
// ===================================

// These functions would be used in production to connect to backend APIs

async function fetchDashboardData() {
    try {
        const response = await fetch('/api/dashboard/data', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch dashboard data');

        const data = await response.json();
        updateDashboardState(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

async function updateMaintenanceMode(enabled) {
    try {
        const response = await fetch('/api/system/maintenance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ enabled })
        });

        if (!response.ok) throw new Error('Failed to update maintenance mode');

        showNotification(
            `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
            'success'
        );
    } catch (error) {
        console.error('Error updating maintenance mode:', error);
        showNotification('Error updating maintenance mode', 'error');
    }
}

function getAuthToken() {
    // In production, retrieve from secure storage
    return localStorage.getItem('authToken') || '';
}

function updateDashboardState(data) {
    // Update state with fetched data
    Object.assign(DashboardState, data);
    updateWidgets();
}

// ===================================
// WebSocket Connection (PRODUCTION)
// ===================================

function initializeWebSocket() {
    const wsUrl = 'wss://api.curis.citrus.com/dashboard';

    try {
        DashboardState.websocket = new WebSocket(wsUrl);

        DashboardState.websocket.onopen = () => {
            console.log('WebSocket connected');
            showNotification('Real-time updates connected', 'success');
        };

        DashboardState.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };

        DashboardState.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            showNotification('Real-time connection error', 'error');
        };

        DashboardState.websocket.onclose = () => {
            console.log('WebSocket disconnected');
            // Attempt reconnection after 5 seconds
            setTimeout(initializeWebSocket, 5000);
        };
    } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
    }
}

function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'userUpdate':
            DashboardState.userData = { ...DashboardState.userData, ...data.payload };
            updateUserWidget();
            break;
        case 'appointmentUpdate':
            DashboardState.appointmentData = { ...DashboardState.appointmentData, ...data.payload };
            updateAppointmentWidget();
            break;
        case 'financialUpdate':
            DashboardState.financialData = { ...DashboardState.financialData, ...data.payload };
            updateFinancialWidget();
            break;
        case 'systemAlert':
            showAlertBanner(data.payload.message);
            break;
        case 'notification':
            showNotification(data.payload.message, data.payload.type);
            break;
        default:
            console.log('Unknown WebSocket message type:', data.type);
    }
}

// ===================================
// EXPORT FOR TESTING
// ===================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DashboardState,
        initializeDashboard,
        updateWidgets,
        showModal,
        hideModal
    };
}
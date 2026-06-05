/**
 * CURIS BY CITRUS - DASHBOARD JAVASCRIPT
 * Comprehensive Dashboard Functionality for Clinic Owner Account
 * Fully Dynamic and Interactive Implementation
 */

// ====================================
// GLOBAL VARIABLES & CONFIGURATION
// ====================================
const DashboardConfig = {
    autoRefreshInterval: 30000, // 30 seconds
    animationDuration: 300,
    dataUpdateInterval: 5000, // 5 seconds for real-time updates
    notificationCheckInterval: 60000 // 1 minute
};

// Global state management
const DashboardState = {
    currentTimeFilter: 'weekly',
    widgets: {
        performance: true,
        financial: true,
        appointments: true,
        staff: true,
        patient: true,
        alerts: true,
        customizable: true
    },
    darkMode: false,
    notifications: [],
    autoRefreshTimer: null,
    currentUser: {
        name: 'Dr. Sarah Kimani',
        role: 'Clinic Owner',
        clinicId: 'CLN001'
    }
};

// ====================================
// INITIALIZATION
// ====================================
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Core initializations
    initializeEventListeners();
    initializeModals();
    initializeDropdowns();
    initializeNotifications();
    initializeAutoRefresh();
    initializeWidgetCustomization();
    
    // Load initial data
    loadDashboardData();
    checkUserSession();
    
    // Start real-time updates
    startRealTimeUpdates();
    
    console.log('Dashboard initialized successfully');
}

// ====================================
// EVENT LISTENERS
// ====================================
function initializeEventListeners() {
    // Time filter dropdown
    const timeFilter = document.getElementById('timeFilter');
    if (timeFilter) {
        timeFilter.addEventListener('change', handleTimeFilterChange);
    }
    
    // User profile dropdown
    const userProfileBtn = document.getElementById('userProfileBtn');
    if (userProfileBtn) {
        userProfileBtn.addEventListener('click', toggleUserDropdown);
    }
    
    // Notification button
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotificationsPanel);
    }
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Metric cards click handlers
    initializeMetricCardListeners();
    
    // Button click handlers
    initializeButtonListeners();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', handleOutsideClick);
}

function initializeMetricCardListeners() {
    // Revenue card
    const revenueCard = document.getElementById('revenueCard');
    if (revenueCard) {
        revenueCard.addEventListener('click', () => openModal('revenueModal'));
    }
    
    // Outstanding payments card
    const outstandingCard = document.getElementById('outstandingCard');
    if (outstandingCard) {
        outstandingCard.addEventListener('click', () => openModal('outstandingModal'));
    }
}

function initializeButtonListeners() {
    // View trends button
    const viewTrendsBtn = document.getElementById('viewTrendsBtn');
    if (viewTrendsBtn) {
        viewTrendsBtn.addEventListener('click', () => {
            openModal('trendsModal');
            initializeTrendsChart();
        });
    }
    
    // Status legend button
    const statusLegendBtn = document.getElementById('statusLegendBtn');
    if (statusLegendBtn) {
        statusLegendBtn.addEventListener('click', () => openModal('statusLegendModal'));
    }
    
    // Top performers button
    const topPerformersBtn = document.getElementById('topPerformersBtn');
    if (topPerformersBtn) {
        topPerformersBtn.addEventListener('click', () => openModal('topPerformersModal'));
    }
    
    // Quick add staff button
    const quickAddStaffBtn = document.getElementById('quickAddStaffBtn');
    if (quickAddStaffBtn) {
        quickAddStaffBtn.addEventListener('click', () => openModal('staffCreationModal'));
    }
    
    // View full log button
    const viewFullLogBtn = document.getElementById('viewFullLogBtn');
    if (viewFullLogBtn) {
        viewFullLogBtn.addEventListener('click', viewFullActivityLog);
    }
    
    // Widget settings button
    const widgetSettingsBtn = document.getElementById('widgetSettingsBtn');
    if (widgetSettingsBtn) {
        widgetSettingsBtn.addEventListener('click', () => openModal('widgetSettingsModal'));
    }
    
    // Alert detail buttons
    document.querySelectorAll('.alert-details-btn').forEach(btn => {
        btn.addEventListener('click', handleAlertDetails);
    });
    
    // Service item clicks
    document.querySelectorAll('.service-item').forEach(item => {
        item.addEventListener('click', handleServiceItemClick);
    });
}

// ====================================
// TIME FILTER FUNCTIONALITY
// ====================================
function handleTimeFilterChange(event) {
    const selectedFilter = event.target.value;
    DashboardState.currentTimeFilter = selectedFilter;
    
    if (selectedFilter === 'custom') {
        openModal('customDateModal');
    } else {
        updateDashboardData(selectedFilter);
    }
}

function applyCustomDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
            showNotification('Start date must be before end date', 'error');
            return;
        }
        
        // Update dashboard with custom range
        updateDashboardData('custom', { startDate, endDate });
        closeModal('customDateModal');
    }
}

// ====================================
// MODAL FUNCTIONALITY
// ====================================
function initializeModals() {
    // Close button handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            closeModal(modalId);
        });
    });
    
    // Close on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Tab functionality in modals
    initializeModalTabs();
    
    // Form submissions in modals
    initializeModalForms();
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Load modal-specific data
        loadModalData(modalId);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function initializeModalTabs() {
    // Revenue modal tabs
    const revenueTabs = document.querySelectorAll('#revenueModal .tab-btn');
    revenueTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this, 'revenueModal');
        });
    });
    
    // Widget settings modal tabs
    const settingsTabs = document.querySelectorAll('#widgetSettingsModal .tab-btn');
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this, 'widgetSettingsModal');
        });
    });
}

function switchTab(tabBtn, modalId) {
    const modal = document.getElementById(modalId);
    const tabs = modal.querySelectorAll('.tab-btn');
    const contents = modal.querySelectorAll('.tab-content');
    
    // Remove active class from all tabs
    tabs.forEach(t => t.classList.remove('active'));
    
    // Add active class to clicked tab
    tabBtn.classList.add('active');
    
    // Hide all tab contents
    contents.forEach(c => c.style.display = 'none');
    
    // Show selected tab content
    const tabName = tabBtn.getAttribute('data-tab');
    const content = modal.querySelector(`#${tabName}Tab`);
    if (content) {
        content.style.display = 'block';
    }
}

function initializeModalForms() {
    // Staff creation form
    const staffForm = document.querySelector('.staff-form');
    if (staffForm) {
        staffForm.addEventListener('submit', handleStaffCreation);
    }
    
    // Custom date range form
    const applyDateBtn = document.getElementById('applyDateRange');
    if (applyDateBtn) {
        applyDateBtn.addEventListener('click', applyCustomDateRange);
    }
    
    // Close buttons with data-action="close"
    document.querySelectorAll('[data-action="close"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
}

// ====================================
// DROPDOWN FUNCTIONALITY
// ====================================
function initializeDropdowns() {
    // User dropdown is handled by event listener
}

function toggleUserDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
    
    // Close notifications panel if open
    const notificationsPanel = document.getElementById('notificationsPanel');
    if (notificationsPanel.classList.contains('show')) {
        notificationsPanel.classList.remove('show');
    }
}

function handleOutsideClick(event) {
    // Close user dropdown
    if (!event.target.closest('.user-profile-container')) {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown && userDropdown.classList.contains('show')) {
            userDropdown.classList.remove('show');
        }
    }
    
    // Close notifications panel
    if (!event.target.closest('.notification-container') && !event.target.closest('.notifications-panel')) {
        const notificationsPanel = document.getElementById('notificationsPanel');
        if (notificationsPanel && notificationsPanel.classList.contains('show')) {
            notificationsPanel.classList.remove('show');
        }
    }
}

// ====================================
// NOTIFICATIONS FUNCTIONALITY
// ====================================
function initializeNotifications() {
    loadNotifications();
    setInterval(checkNewNotifications, DashboardConfig.notificationCheckInterval);
}

function toggleNotificationsPanel(event) {
    event.stopPropagation();
    const panel = document.getElementById('notificationsPanel');
    panel.classList.toggle('show');
    
    // Close user dropdown if open
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown.classList.contains('show')) {
        userDropdown.classList.remove('show');
    }
    
    // Mark notifications as read
    if (panel.classList.contains('show')) {
        markNotificationsAsRead();
    }
}

function loadNotifications() {
    // Simulate loading notifications
    DashboardState.notifications = [
        {
            id: 1,
            type: 'payment',
            title: 'Payment Confirmation Required',
            message: 'Payment from John Mwangi needs confirmation',
            time: '5 minutes ago',
            read: false
        },
        {
            id: 2,
            type: 'appointment',
            title: 'Appointment Rescheduled',
            message: 'Patient Grace Wanjiku rescheduled for tomorrow',
            time: '12 minutes ago',
            read: false
        },
        {
            id: 3,
            type: 'registration',
            title: 'New Patient Registration',
            message: 'David Kiprotich has registered as a new patient',
            time: '1 hour ago',
            read: true
        }
    ];
    
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const unreadCount = DashboardState.notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

function markNotificationsAsRead() {
    DashboardState.notifications.forEach(n => n.read = true);
    updateNotificationBadge();
}

function checkNewNotifications() {
    // Simulate checking for new notifications
    console.log('Checking for new notifications...');
    // In real implementation, this would make an API call
}

// ====================================
// AUTO-REFRESH FUNCTIONALITY
// ====================================
function initializeAutoRefresh() {
    startAutoRefresh();
}

function startAutoRefresh() {
    DashboardState.autoRefreshTimer = setInterval(() => {
        showRefreshIndicator();
        refreshDashboardData();
    }, DashboardConfig.autoRefreshInterval);
}

function stopAutoRefresh() {
    if (DashboardState.autoRefreshTimer) {
        clearInterval(DashboardState.autoRefreshTimer);
        DashboardState.autoRefreshTimer = null;
    }
}

function showRefreshIndicator() {
    const indicator = document.getElementById('autoRefreshIndicator');
    if (indicator) {
        indicator.classList.add('show');
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }
}

function refreshDashboardData() {
    // Simulate data refresh
    updateMetrics();
    updateActivityFeed();
    updateAlerts();
    console.log('Dashboard data refreshed');
}

// ====================================
// DATA LOADING & UPDATES
// ====================================
function loadDashboardData() {
    showLoadingState();
    
    // Simulate API call
    setTimeout(() => {
        updateMetrics();
        updateFinancialData();
        updateAppointmentData();
        updateStaffActivity();
        updatePatientEngagement();
        updateAlerts();
        hideLoadingState();
    }, 1000);
}

function updateDashboardData(filter, customRange = null) {
    showLoadingState();
    
    // Simulate API call with filter
    setTimeout(() => {
        const data = fetchDataForPeriod(filter, customRange);
        updateAllWidgets(data);
        hideLoadingState();
    }, 500);
}

function updateMetrics() {
    // Update appointment counter
    const todayAppts = document.getElementById('todayAppts');
    if (todayAppts) {
        animateValue(todayAppts, parseInt(todayAppts.textContent), 24 + Math.floor(Math.random() * 10), 1000);
    }
    
    // Update revenue
    const revenueElement = document.querySelector('.metric-value');
    if (revenueElement && revenueElement.textContent.includes('KES')) {
        const currentValue = parseInt(revenueElement.textContent.replace(/[^0-9]/g, ''));
        const newValue = 45600 + Math.floor(Math.random() * 5000);
        animateValue(revenueElement, currentValue, newValue, 1000, 'KES');
    }
}

function updateFinancialData() {
    // Update category revenues
    const categories = {
        consultation: 28500 + Math.floor(Math.random() * 2000),
        prescription: 12600 + Math.floor(Math.random() * 1000),
        procedure: 4500 + Math.floor(Math.random() * 500)
    };
    
    // Update UI
    document.querySelectorAll('.category-revenue').forEach((elem, index) => {
        const values = Object.values(categories);
        if (values[index]) {
            elem.textContent = `KES. ${values[index].toLocaleString()}`;
        }
    });
}

function updateAppointmentData() {
    // Update appointment trackers
    const scheduled = document.getElementById('scheduledToday');
    const cancelled = document.getElementById('cancelledToday');
    const noShow = document.getElementById('noShowRate');
    
    if (scheduled) scheduled.textContent = 24 + Math.floor(Math.random() * 5);
    if (cancelled) cancelled.textContent = 3 + Math.floor(Math.random() * 2);
    if (noShow) noShow.textContent = (8 + Math.random() * 2).toFixed(1) + '%';
}

function updateStaffActivity() {
    // Add new activity to feed
    const feed = document.querySelector('.activity-feed');
    if (feed) {
        const activities = [
            'Dr. Kamau completed consultation with Patient #1250',
            'Receptionist Mary confirmed 2 appointments for tomorrow',
            'Dr. Wanjiru started procedure for Patient #1205',
            'Nurse John updated patient records',
            'Dr. Sarah reviewed lab results for Patient #1189'
        ];
        
        // Randomly add a new activity
        if (Math.random() > 0.7) {
            const newActivity = createActivityItem(
                activities[Math.floor(Math.random() * activities.length)],
                'Just now'
            );
            
            // Add to top of feed
            feed.insertBefore(newActivity, feed.firstChild);
            
            // Remove last item if more than 3
            if (feed.children.length > 3) {
                feed.removeChild(feed.lastChild);
            }
        }
    }
}

function createActivityItem(text, time) {
    const div = document.createElement('div');
    div.className = 'activity-item';
    div.innerHTML = `
        <div class="activity-avatar">
            <img src="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-30.png" alt="Staff">
        </div>
        <div class="activity-content">
            <p class="activity-text">${text}</p>
            <span class="activity-time">${time}</span>
        </div>
    `;
    return div;
}

function updatePatientEngagement() {
    // Update registration metrics
    const metrics = document.querySelectorAll('.metric-number');
    metrics.forEach((metric, index) => {
        const current = parseInt(metric.textContent);
        const change = Math.floor(Math.random() * 2);
        if (Math.random() > 0.5) {
            metric.textContent = current + change;
        }
    });
}

function updateAlerts() {
    // Update alert counter
    const alertBadge = document.getElementById('alertCounterBadge');
    if (alertBadge) {
        const count = document.querySelectorAll('.alerts-list .alert-item').length;
        alertBadge.textContent = count;
    }
}

// ====================================
// WIDGET CUSTOMIZATION
// ====================================
function initializeWidgetCustomization() {
    // Add widget button
    const addWidgetBtn = document.getElementById('addWidgetBtn');
    if (addWidgetBtn) {
        addWidgetBtn.addEventListener('click', showAddWidgetOptions);
    }
    
    // Edit layout button
    const layoutBtn = document.getElementById('layoutBtn');
    if (layoutBtn) {
        layoutBtn.addEventListener('click', enableLayoutEdit);
    }
    
    // Reset layout button
    const resetLayoutBtn = document.getElementById('resetLayoutBtn');
    if (resetLayoutBtn) {
        resetLayoutBtn.addEventListener('click', resetLayout);
    }
    
    // Save layout button
    const saveLayoutBtn = document.getElementById('saveLayoutBtn');
    if (saveLayoutBtn) {
        saveLayoutBtn.addEventListener('click', saveLayout);
    }
    
    // Widget toggles
    initializeWidgetToggles();
}

function initializeWidgetToggles() {
    const toggles = document.querySelectorAll('.widget-toggles input[type="checkbox"]');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', handleWidgetToggle);
    });
}

function handleWidgetToggle(event) {
    const widgetName = event.target.parentElement.textContent.trim().toLowerCase();
    const isEnabled = event.target.checked;
    
    // Update state
    DashboardState.widgets[widgetName] = isEnabled;
    
    // Show/hide widget
    const widgetMap = {
        'revenue widget': 'financial-snapshot',
        'appointment widget': 'appointments-summary',
        'staff activity widget': 'staff-activity',
        'patient engagement widget': 'patient-engagement'
    };
    
    const widgetClass = widgetMap[widgetName];
    if (widgetClass) {
        const widget = document.querySelector(`.${widgetClass}`);
        if (widget) {
            widget.style.display = isEnabled ? 'block' : 'none';
        }
    }
}

function enableLayoutEdit() {
    const container = document.querySelector('.dashboard-container');
    const widgets = container.querySelectorAll('.widget');
    
    widgets.forEach(widget => {
        widget.draggable = true;
        widget.classList.add('draggable');
        
        widget.addEventListener('dragstart', handleDragStart);
        widget.addEventListener('dragover', handleDragOver);
        widget.addEventListener('drop', handleDrop);
        widget.addEventListener('dragend', handleDragEnd);
    });
    
    showNotification('Layout edit mode enabled. Drag widgets to rearrange.', 'info');
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    const afterElement = getDragAfterElement(e.currentTarget.parentElement, e.clientY);
    const container = e.currentTarget.parentElement;
    
    if (afterElement == null) {
        container.appendChild(draggedElement);
    } else {
        container.insertBefore(draggedElement, afterElement);
    }
    
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    return false;
}

function handleDragEnd(e) {
    const widgets = document.querySelectorAll('.widget');
    widgets.forEach(widget => {
        widget.classList.remove('dragging');
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.widget:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveLayout() {
    // Save current layout to localStorage
    const container = document.querySelector('.dashboard-container');
    const widgets = container.querySelectorAll('.widget');
    const layout = [];
    
    widgets.forEach(widget => {
        layout.push(widget.className);
    });
    
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    showNotification('Layout saved successfully!', 'success');
    
    // Disable drag mode
    disableLayoutEdit();
}

function disableLayoutEdit() {
    const widgets = document.querySelectorAll('.widget');
    widgets.forEach(widget => {
        widget.draggable = false;
        widget.classList.remove('draggable');
        widget.removeEventListener('dragstart', handleDragStart);
        widget.removeEventListener('dragover', handleDragOver);
        widget.removeEventListener('drop', handleDrop);
        widget.removeEventListener('dragend', handleDragEnd);
    });
}

function resetLayout() {
    localStorage.removeItem('dashboardLayout');
    location.reload();
}

// ====================================
// DARK MODE FUNCTIONALITY
// ====================================
function toggleDarkMode() {
    DashboardState.darkMode = !DashboardState.darkMode;
    document.body.classList.toggle('dark-mode');
    
    // Update icon
    const icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        icon.className = DashboardState.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Save preference
    localStorage.setItem('darkMode', DashboardState.darkMode);
}

// ====================================
// CHART INITIALIZATION
// ====================================
function initializeTrendsChart() {
    const canvas = document.getElementById('trendsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Simple chart implementation (in production, use Chart.js)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, 220);
    ctx.lineTo(460, 220);
    ctx.stroke();
    
    // Draw sample data
    const data = [30, 45, 35, 50, 40, 60, 55];
    const spacing = 60;
    
    ctx.strokeStyle = '#00BFA5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = 40 + (index * spacing);
        const y = 220 - (value * 3);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw point
        ctx.fillStyle = '#00BFA5';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.stroke();
}

// ====================================
// SPECIFIC FUNCTIONALITY HANDLERS
// ====================================
function handleAlertDetails(event) {
    const alertType = event.currentTarget.getAttribute('data-alert');
    const modal = document.getElementById('alertDetailsModal');
    const modalTitle = document.getElementById('alertModalTitle');
    const modalBody = document.getElementById('alertModalBody');
    
    // Update modal content based on alert type
    const alertContent = {
        'low-bookings': {
            title: 'Low Appointment Bookings Alert',
            body: `
                <div class="alert-detail-content">
                    <h4>Issue Analysis</h4>
                    <p>Tomorrow's appointment bookings are currently at 60% capacity, which is 40% below the weekly average.</p>
                    
                    <h4>Affected Time Slots</h4>
                    <ul>
                        <li>Morning (9:00 AM - 12:00 PM): 3/8 slots filled</li>
                        <li>Afternoon (2:00 PM - 5:00 PM): 2/6 slots filled</li>
                    </ul>
                    
                    <h4>Suggested Actions</h4>
                    <ol>
                        <li>Send reminder messages to patients about available slots</li>
                        <li>Enable same-day booking for tomorrow</li>
                        <li>Contact patients on the waiting list</li>
                    </ol>
                    
                    <div class="modal-actions">
                        <button class="btn-primary" onclick="sendBookingReminders()">Send Reminders</button>
                        <button class="btn-secondary" onclick="navigateToAppointments()">Go to Appointments</button>
                    </div>
                </div>
            `
        },
        'pending-payments': {
            title: 'Pending Payment Confirmations',
            body: `
                <div class="alert-detail-content">
                    <h4>Payment Summary</h4>
                    <p>8 payments totaling KES. 24,500 are awaiting confirmation.</p>
                    
                    <h4>Payment Breakdown</h4>
                    <table class="payment-table">
                        <tr>
                            <th>Patient</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                        </tr>
                        <tr>
                            <td>John Mwangi</td>
                            <td>KES. 2,500</td>
                            <td>M-Pesa</td>
                            <td>Pending</td>
                        </tr>
                        <tr>
                            <td>Grace Wanjiku</td>
                            <td>KES. 1,800</td>
                            <td>Bank Transfer</td>
                            <td>Pending</td>
                        </tr>
                    </table>
                    
                    <div class="modal-actions">
                        <button class="btn-primary" onclick="confirmAllPayments()">Confirm All</button>
                        <button class="btn-secondary" onclick="navigateToBilling()">Go to Billing</button>
                    </div>
                </div>
            `
        },
        'staff-inactivity': {
            title: 'Staff Inactivity Alert',
            body: `
                <div class="alert-detail-content">
                    <h4>Staff Member Details</h4>
                    <p><strong>Name:</strong> Dr. Johnson</p>
                    <p><strong>Last Activity:</strong> 2 hours ago</p>
                    <p><strong>Scheduled Appointments:</strong> 3 remaining today</p>
                    
                    <h4>Possible Reasons</h4>
                    <ul>
                        <li>Extended consultation with patient</li>
                        <li>System login issues</li>
                        <li>Emergency situation</li>
                    </ul>
                    
                    <h4>Recommended Actions</h4>
                    <ol>
                        <li>Contact staff member via phone</li>
                        <li>Check system access logs</li>
                        <li>Reassign appointments if necessary</li>
                    </ol>
                    
                    <div class="modal-actions">
                        <button class="btn-primary" onclick="contactStaff('johnson')">Contact Dr. Johnson</button>
                        <button class="btn-secondary" onclick="dismissAlert('staff-inactivity')">Dismiss Alert</button>
                    </div>
                </div>
            `
        }
    };
    
    if (alertContent[alertType]) {
        modalTitle.textContent = alertContent[alertType].title;
        modalBody.innerHTML = alertContent[alertType].body;
        openModal('alertDetailsModal');
    }
}

function handleServiceItemClick(event) {
    const serviceType = event.currentTarget.getAttribute('data-service');
    
    // Create service details modal content
    const modalBody = `
        <div class="service-detail-content">
            <h4>Service Usage Analytics</h4>
            <p>Detailed analytics for ${event.currentTarget.querySelector('.service-name').textContent}</p>
            
            <div class="service-stats">
                <div class="stat-item">
                    <span class="stat-label">This Week:</span>
                    <span class="stat-value">${event.currentTarget.querySelector('.service-count').textContent}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Trend:</span>
                    <span class="stat-value">↑ 15% from last week</span>
                </div>
            </div>
            
            <h4>Peak Times</h4>
            <ul>
                <li>Monday: 10:00 AM - 12:00 PM</li>
                <li>Wednesday: 2:00 PM - 4:00 PM</li>
                <li>Friday: 9:00 AM - 11:00 AM</li>
            </ul>
            
            <button class="btn-primary" onclick="navigateToServices()">View in Services Hub</button>
        </div>
    `;
    
    // Show in a generic modal
    showServiceModal(event.currentTarget.querySelector('.service-name').textContent, modalBody);
}

function showServiceModal(title, body) {
    // Create a temporary modal for service details
    const modal = document.getElementById('alertDetailsModal');
    const modalTitle = document.getElementById('alertModalTitle');
    const modalBody = document.getElementById('alertModalBody');
    
    modalTitle.textContent = title + ' - Analytics';
    modalBody.innerHTML = body;
    openModal('alertDetailsModal');
}

function handleStaffCreation(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const staffData = {
        type: formData.get('staffType'),
        name: formData.get('fullName'),
        email: formData.get('email')
    };
    
    // Simulate staff creation
    showNotification(`Creating ${staffData.type} account for ${staffData.name}...`, 'info');
    
    setTimeout(() => {
        showNotification(`Staff member ${staffData.name} added successfully!`, 'success');
        closeModal('staffCreationModal');
        event.target.reset();
        
        // Update staff activity feed
        updateStaffActivity();
    }, 1500);
}

// ====================================
// UTILITY FUNCTIONS
// ====================================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
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

function animateValue(element, start, end, duration, prefix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        if (prefix) {
            element.textContent = `${prefix}. ${Math.floor(current).toLocaleString()}`;
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

function showLoadingState() {
    document.querySelectorAll('.widget').forEach(widget => {
        widget.style.opacity = '0.7';
        widget.style.pointerEvents = 'none';
    });
}

function hideLoadingState() {
    document.querySelectorAll('.widget').forEach(widget => {
        widget.style.opacity = '1';
        widget.style.pointerEvents = '';
    });
}

function fetchDataForPeriod(period, customRange) {
    // Simulate API call
    return {
        appointments: Math.floor(Math.random() * 100) + 50,
        revenue: Math.floor(Math.random() * 50000) + 30000,
        newPatients: Math.floor(Math.random() * 20) + 5,
        period: period
    };
}

function updateAllWidgets(data) {
    // Update all widgets with new data
    console.log('Updating widgets with data:', data);
    updateMetrics();
    updateFinancialData();
    updateAppointmentData();
}

function checkUserSession() {
    // Check if user is still logged in
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
        // Redirect to login if needed
        console.log('User session valid');
    }
}

function startRealTimeUpdates() {
    // Start real-time data updates
    setInterval(() => {
        // Update specific metrics that change frequently
        updateActivityFeed();
        updateNotificationBadge();
    }, DashboardConfig.dataUpdateInterval);
}

function viewFullActivityLog() {
    // Navigate to full activity log or show in modal
    showNotification('Navigating to full activity log...', 'info');
    // In real implementation, this would navigate or open a detailed view
}

// ====================================
// NAVIGATION FUNCTIONS
// ====================================
function navigateToAppointments() {
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Clinic Owner\\Appointments\\appointments.html';
}

function navigateToBilling() {
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Clinic Owner\\Billings and Payments\\billings_and_payments.html';
}

function navigateToServices() {
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Clinic Owner\\Clinic Services Hub\\clinic_services_hub.html';
}

// ====================================
// ACTION FUNCTIONS (Called from modals)
// ====================================
window.sendBookingReminders = function() {
    showNotification('Sending booking reminders to patients...', 'info');
    setTimeout(() => {
        showNotification('Reminders sent successfully to 15 patients!', 'success');
        closeModal('alertDetailsModal');
    }, 2000);
};

window.confirmAllPayments = function() {
    showNotification('Processing payment confirmations...', 'info');
    setTimeout(() => {
        showNotification('All payments confirmed successfully!', 'success');
        closeModal('alertDetailsModal');
        updateMetrics();
    }, 1500);
};

window.contactStaff = function(staffId) {
    showNotification(`Initiating contact with Dr. ${staffId}...`, 'info');
    // In real implementation, this would trigger communication
};

window.dismissAlert = function(alertType) {
    const alertElement = document.querySelector(`[data-alert-type="${alertType}"]`);
    if (alertElement) {
        alertElement.style.transition = 'opacity 0.3s';
        alertElement.style.opacity = '0';
        setTimeout(() => {
            alertElement.remove();
            updateAlerts();
        }, 300);
    }
    closeModal('alertDetailsModal');
};

window.showAddWidgetOptions = function() {
    showNotification('Widget library coming soon!', 'info');
};

// ====================================
// ERROR HANDLING
// ====================================
window.addEventListener('error', function(event) {
    console.error('Dashboard error:', event.error);
    showNotification('An error occurred. Please refresh the page.', 'error');
});

// ====================================
// PERFORMANCE OPTIMIZATION
// ====================================
// Debounce function for resize events
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

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Redraw charts if needed
    const canvas = document.getElementById('trendsChart');
    if (canvas && canvas.style.display !== 'none') {
        initializeTrendsChart();
    }
}, 250));

// ====================================
// CLEANUP ON PAGE UNLOAD
// ====================================
window.addEventListener('beforeunload', function() {
    stopAutoRefresh();
    // Save any pending data
    if (DashboardState.widgets) {
        localStorage.setItem('widgetPreferences', JSON.stringify(DashboardState.widgets));
    }
});

// ====================================
// INITIALIZE DARK MODE FROM STORAGE
// ====================================
(function initializeDarkModeFromStorage() {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        DashboardState.darkMode = true;
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('#darkModeToggle i');
        if (icon) {
            icon.className = 'fas fa-sun';
        }
    }
})();

// ====================================
// CSS FOR NOTIFICATIONS (Should be in CSS file)
// ====================================
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 10000;
    max-width: 400px;
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    border-left: 4px solid #10B981;
    color: #10B981;
}

.notification.error {
    border-left: 4px solid #EF4444;
    color: #EF4444;
}

.notification.warning {
    border-left: 4px solid #F59E0B;
    color: #F59E0B;
}

.notification.info {
    border-left: 4px solid #00BFA5;
    color: #00BFA5;
}

.notification span {
    color: #333333;
}

.widget.draggable {
    cursor: move;
    border: 2px dashed #00BFA5;
}

.widget.dragging {
    opacity: 0.5;
}

.payment-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
}

.payment-table th,
.payment-table td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
}

.payment-table th {
    background: #f8fafc;
    font-weight: 600;
}

.modal-actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.service-detail-content,
.alert-detail-content {
    line-height: 1.6;
}

.service-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin: 16px 0;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
}

.stat-label {
    color: #6b7280;
    font-weight: 500;
}

.stat-value {
    color: #00BFA5;
    font-weight: 600;
}

body.dark-mode {
    background: #1a202c;
    color: #e5e7eb;
}

body.dark-mode .widget {
    background: #2d3748;
    border-color: #4a5568;
}

body.dark-mode .modal-content {
    background: #2d3748;
    color: #e5e7eb;
}
</style>
`;

// Inject notification styles
document.head.insertAdjacentHTML('beforeend', notificationStyles);

console.log('Curis Dashboard JavaScript loaded successfully!');
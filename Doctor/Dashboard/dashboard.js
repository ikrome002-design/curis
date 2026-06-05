/**
 * CURIS DASHBOARD - UI-ALIGNED JAVASCRIPT IMPLEMENTATION
 * Doctor (Specialist) Account Dashboard Functionality
 * Designed to work with existing HTML/CSS structure
 */

// ========================================
// 1. GLOBAL CONFIGURATION & STATE
// ========================================
const DashboardConfig = {
    apiBaseUrl: '/api/v1',
    refreshInterval: 30000, // 30 seconds auto-refresh
    notificationCheckInterval: 15000, // 15 seconds
    googleMeetBaseUrl: 'https://meet.google.com/',
    chartUpdateInterval: 60000, // 1 minute
};

// Global State Management
const DashboardState = {
    currentDoctor: {
        id: 'DOC001',
        name: 'Dr. Sarah Wanjiru',
        specialization: 'Cardiology',
        clinicId: 'CLINIC001'
    },
    appointments: [],
    notifications: [],
    tasks: [],
    isDarkMode: false,
    activeModals: new Set(),
    chartInstance: null,
    realTimeSync: null
};

// ========================================
// 2. INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    initializeChart();
    startRealTimeUpdates();
    setupTaskManagement();
    checkAuthentication();
});

function initializeDashboard() {
    // Load saved preferences
    loadUserPreferences();
    
    // Update any dynamic content
    updateDateTime();
    setInterval(updateDateTime, 60000);
    
    // Initialize tooltips for existing elements
    initializeTooltips();
    
    // Setup mobile responsiveness
    handleResponsiveDesign();
}

// ========================================
// 3. EVENT LISTENERS FOR EXISTING ELEMENTS
// ========================================
function setupEventListeners() {
    // Profile dropdown functionality
    const userProfile = document.getElementById('userProfile');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (userProfile) {
        userProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-profile') && !e.target.closest('.profile-dropdown')) {
            userProfile?.classList.remove('active');
        }
    });
    
    // Dark mode toggle
    const darkModeBtn = document.getElementById('darkModeBtn');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', toggleDarkMode);
    }
    
    // Appointment items - add interaction without disrupting CSS
    document.querySelectorAll('.appointment-item').forEach(item => {
        item.addEventListener('click', handleAppointmentClick);
    });
    
    // Activity items
    document.querySelectorAll('.activity-item').forEach(item => {
        item.addEventListener('click', handleActivityClick);
    });
    
    // Quick action buttons are already linked via href
    // Just add tracking
    document.querySelectorAll('.action-button').forEach(button => {
        button.addEventListener('click', trackQuickAction);
    });
    
    // Period selector for chart
    const periodSelector = document.querySelector('.period-selector');
    if (periodSelector) {
        periodSelector.addEventListener('change', updateChartPeriod);
    }
    
    // Notification icon
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function(e) {
            e.preventDefault();
            showNotificationPanel();
        });
    }
}

// ========================================
// 4. APPOINTMENT INTERACTIONS
// ========================================
function handleAppointmentClick(e) {
    // Don't interfere with status badge clicks
    if (e.target.closest('.appointment-status')) {
        return;
    }
    
    const appointmentItem = e.currentTarget;
    const patientName = appointmentItem.querySelector('.patient-name')?.textContent;
    const appointmentTime = appointmentItem.querySelector('.appointment-time')?.textContent;
    const status = appointmentItem.querySelector('.appointment-status')?.textContent;
    
    showAppointmentModal({
        patientName,
        appointmentTime,
        status,
        element: appointmentItem
    });
}

function showAppointmentModal(appointment) {
    const modal = createModal('appointment-detail-modal', 'Appointment Details');
    
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <div class="appointment-modal-content">
            <div class="patient-section">
                <h3>Patient Information</h3>
                <p><strong>Name:</strong> ${appointment.patientName}</p>
                <p><strong>Appointment:</strong> ${appointment.appointmentTime}</p>
                <p><strong>Status:</strong> <span class="appointment-status ${appointment.status.toLowerCase()}">${appointment.status}</span></p>
            </div>
            
            <div class="actions-section">
                <button class="btn btn-primary" onclick="startConsultation('${appointment.patientName}')">
                    <i class="fas fa-video"></i> Start Consultation
                </button>
                <button class="btn btn-secondary" onclick="viewPatientRecord('${appointment.patientName}')">
                    <i class="fas fa-folder-open"></i> View Full Record
                </button>
                <button class="btn btn-accent" onclick="addPreConsultNotes('${appointment.patientName}')">
                    <i class="fas fa-notes-medical"></i> Add Notes
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

// ========================================
// 5. ACTIVITY INTERACTIONS
// ========================================
function handleActivityClick(e) {
    const activityItem = e.currentTarget;
    const activityText = activityItem.querySelector('.activity-text')?.textContent;
    const activityTime = activityItem.querySelector('.activity-time')?.textContent;
    
    // Determine activity type based on icon class
    const iconElement = activityItem.querySelector('.activity-icon');
    let activityType = 'general';
    
    if (iconElement.classList.contains('lab-icon')) {
        activityType = 'lab';
        showLabResultsModal(activityText);
    } else if (iconElement.classList.contains('prescription-icon')) {
        activityType = 'prescription';
        showPrescriptionModal(activityText);
    } else if (iconElement.classList.contains('message-icon')) {
        activityType = 'message';
        showMessageModal(activityText);
    } else if (iconElement.classList.contains('appointment-icon')) {
        activityType = 'appointment';
        showNewAppointmentModal(activityText);
    }
    
    // Add subtle animation feedback
    activityItem.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        activityItem.style.animation = '';
    }, 500);
}

// ========================================
// 6. CHART INITIALIZATION & UPDATES
// ========================================
function initializeChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas || typeof Chart === 'undefined') {
        console.log('Chart.js not loaded or canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Create gradient that matches CSS theme
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 191, 165, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 191, 165, 0.05)');
    
    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Revenue',
            data: [45000, 52000, 48000, 65000, 72000, 58000, 45000],
            borderColor: '#00BFA5',
            backgroundColor: gradient,
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#00BFA5',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };
    
    DashboardState.chartInstance = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(29, 42, 59, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'KES ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            family: 'Poppins'
                        }
                    }
                },
                y: {
                    grid: {
                        borderDash: [5, 5],
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            family: 'Poppins'
                        },
                        callback: function(value) {
                            return 'KES ' + (value / 1000) + 'k';
                        }
                    }
                }
            }
        }
    });
}

function updateChartPeriod(e) {
    const period = e.target.value;
    if (!DashboardState.chartInstance) return;
    
    let newLabels, newData;
    
    switch(period) {
        case 'week':
            newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            newData = [45000, 52000, 48000, 65000, 72000, 58000, 45000];
            break;
        case 'month':
            newLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            newData = [320000, 385000, 425000, 485000];
            break;
        case 'year':
            newLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            newData = [420000, 380000, 450000, 480000, 520000, 485000, 490000, 510000, 475000, 495000, 520000, 485000];
            break;
    }
    
    DashboardState.chartInstance.data.labels = newLabels;
    DashboardState.chartInstance.data.datasets[0].data = newData;
    DashboardState.chartInstance.update('active');
}

// ========================================
// 7. TASK MANAGEMENT
// ========================================
function setupTaskManagement() {
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleTaskToggle);
    });
}

function handleTaskToggle(e) {
    const checkbox = e.target;
    const taskLabel = checkbox.nextElementSibling;
    const taskText = taskLabel.querySelector('.task-text');
    
    if (checkbox.checked) {
        // Add completion animation
        taskText.style.transition = 'all 0.3s ease';
        taskText.style.textDecoration = 'line-through';
        taskText.style.opacity = '0.6';
        
        // Show completion toast
        showToast('Task completed!', 'success');
        
        // Update task count
        updateTaskCount();
    } else {
        taskText.style.textDecoration = 'none';
        taskText.style.opacity = '1';
    }
}

function updateTaskCount() {
    const taskCount = document.querySelector('.task-count');
    if (taskCount) {
        const uncheckedTasks = document.querySelectorAll('.task-checkbox:not(:checked)').length;
        taskCount.textContent = `${uncheckedTasks} tasks`;
    }
}

// ========================================
// 8. REAL-TIME UPDATES
// ========================================
function startRealTimeUpdates() {
    // Simulate real-time updates
    DashboardState.realTimeSync = setInterval(() => {
        updateNotificationBadge();
        updateStatCards();
    }, DashboardConfig.refreshInterval);
    
    // Initial update
    updateNotificationBadge();
    updateStatCards();
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        // Simulate changing notification count
        const currentCount = parseInt(badge.textContent) || 0;
        if (Math.random() > 0.7) {
            badge.textContent = currentCount + 1;
            badge.style.animation = 'bounce 0.5s ease';
            setTimeout(() => {
                badge.style.animation = 'bounce 2s infinite';
            }, 500);
        }
    }
}

function updateStatCards() {
    // Add subtle pulse animation to stat values when they update
    document.querySelectorAll('.stat-value').forEach(statValue => {
        if (Math.random() > 0.8) {
            statValue.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                statValue.style.animation = '';
            }, 500);
        }
    });
}

// ========================================
// 9. DARK MODE FUNCTIONALITY
// ========================================
function toggleDarkMode() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    DashboardState.isDarkMode = newTheme === 'dark';
    
    // Update button icon
    const darkModeBtn = document.getElementById('darkModeBtn');
    if (darkModeBtn) {
        const icon = darkModeBtn.querySelector('i');
        if (icon) {
            icon.className = DashboardState.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    // Save preference
    localStorage.setItem('curisDarkMode', newTheme);
    
    // Show feedback
    showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'info');
}

function loadUserPreferences() {
    const savedTheme = localStorage.getItem('curisDarkMode');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        DashboardState.isDarkMode = true;
        
        const icon = document.querySelector('#darkModeBtn i');
        if (icon) {
            icon.className = 'fas fa-sun';
        }
    }
}

// ========================================
// 10. MODAL SYSTEM
// ========================================
function createModal(id, title) {
    // Check if modal already exists
    let modal = document.getElementById(id);
    if (modal) {
        return modal;
    }
    
    modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="closeModal('${id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body"></div>
        </div>
    `;
    
    // Add CSS if not present
    if (!document.getElementById('modal-styles')) {
        addModalStyles();
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(id);
        }
    });
    
    DashboardState.activeModals.add(id);
    return modal;
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            DashboardState.activeModals.delete(id);
        }, 300);
    }
}

function addModalStyles() {
    const styles = document.createElement('style');
    styles.id = 'modal-styles';
    styles.textContent = `
        .modal {
            display: flex;
            position: fixed;
            z-index: var(--z-modal);
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity var(--transition-medium), visibility var(--transition-medium);
        }
        
        .modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-content {
            background: var(--white);
            border-radius: var(--radius-lg);
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: var(--shadow-xl);
            transform: translateY(-20px);
            transition: transform var(--transition-medium);
        }
        
        .modal.show .modal-content {
            transform: translateY(0);
        }
        
        .modal-header {
            padding: var(--spacing-lg);
            border-bottom: 1px solid var(--medium-gray);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, var(--soft-gray) 0%, transparent 100%);
        }
        
        .modal-header h2 {
            margin: 0;
            font-size: 1.5rem;
            color: var(--primary-navy);
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--charcoal-gray);
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-sm);
            transition: var(--transition-fast);
        }
        
        .modal-close:hover {
            background: var(--light-orange);
            color: var(--secondary-orange);
        }
        
        .modal-body {
            padding: var(--spacing-lg);
            overflow-y: auto;
            max-height: calc(80vh - 80px);
        }
        
        .btn {
            padding: var(--spacing-sm) var(--spacing-lg);
            border-radius: var(--radius-md);
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition-fast);
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-size: 0.95rem;
        }
        
        .btn-primary {
            background: var(--accent-teal);
            color: var(--white);
        }
        
        .btn-primary:hover {
            background: #00A693;
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }
        
        .btn-secondary {
            background: var(--soft-gray);
            color: var(--charcoal-gray);
        }
        
        .btn-secondary:hover {
            background: var(--medium-gray);
        }
        
        .btn-accent {
            background: var(--secondary-orange);
            color: var(--white);
        }
        
        .btn-accent:hover {
            background: #E65100;
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(styles);
}

// ========================================
// 11. TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    // Add toast styles if not present
    if (!document.getElementById('toast-styles')) {
        addToastStyles();
    }
    
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function addToastStyles() {
    const styles = document.createElement('style');
    styles.id = 'toast-styles';
    styles.textContent = `
        .toast {
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: var(--white);
            padding: var(--spacing-md) var(--spacing-lg);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-xl);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            z-index: 2000;
            transform: translateX(400px);
            transition: transform var(--transition-medium);
            border-left: 4px solid;
        }
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast i {
            font-size: 1.25rem;
        }
        
        .toast-success {
            border-left-color: var(--success-green);
        }
        
        .toast-success i {
            color: var(--success-green);
        }
        
        .toast-error {
            border-left-color: var(--danger-red);
        }
        
        .toast-error i {
            color: var(--danger-red);
        }
        
        .toast-warning {
            border-left-color: var(--warning-yellow);
        }
        
        .toast-warning i {
            color: var(--warning-yellow);
        }
        
        .toast-info {
            border-left-color: var(--info-blue);
        }
        
        .toast-info i {
            color: var(--info-blue);
        }
    `;
    document.head.appendChild(styles);
}

// ========================================
// 12. SPECIFIC MODAL HANDLERS
// ========================================
function showLabResultsModal(activityText) {
    const modal = createModal('lab-results-modal', 'Lab Results');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="lab-results-content">
            <p>${activityText}</p>
            <div class="document-preview">
                <i class="fas fa-file-medical fa-3x"></i>
                <p>Click to view full document</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="viewDocument()">
                    <i class="fas fa-eye"></i> View Document
                </button>
                <button class="btn btn-secondary" onclick="downloadDocument()">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('show'));
}

function showPrescriptionModal(activityText) {
    const modal = createModal('prescription-modal', 'Prescription Details');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="prescription-content">
            <p>${activityText}</p>
            <div class="prescription-details">
                <h4>Prescription Information</h4>
                <p>View and manage prescription details</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="viewPrescription()">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn btn-accent" onclick="duplicatePrescription()">
                    <i class="fas fa-copy"></i> Duplicate
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('show'));
}

function showMessageModal(activityText) {
    const modal = createModal('message-modal', 'New Message');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="message-content">
            <p>${activityText}</p>
            <div class="message-preview">
                <p>View the full message and respond</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="viewMessage()">
                    <i class="fas fa-envelope-open"></i> Read Message
                </button>
                <button class="btn btn-secondary" onclick="replyMessage()">
                    <i class="fas fa-reply"></i> Reply
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('show'));
}

function showNewAppointmentModal(activityText) {
    const modal = createModal('new-appointment-modal', 'New Appointment');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="appointment-content">
            <p>${activityText}</p>
            <div class="appointment-preview">
                <p>Review appointment details</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="confirmAppointment()">
                    <i class="fas fa-check"></i> Confirm
                </button>
                <button class="btn btn-secondary" onclick="rescheduleAppointment()">
                    <i class="fas fa-calendar-alt"></i> Reschedule
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('show'));
}

function showNotificationPanel() {
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Doctor\\Notifications\\notifications.html';
}

// ========================================
// 13. NAVIGATION FUNCTIONS
// ========================================
function startConsultation(patientName) {
    showToast(`Starting consultation with ${patientName}...`, 'info');
    setTimeout(() => {
        window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Doctor\\Consultations\\consultations.html';
    }, 1000);
}

function viewPatientRecord(patientName) {
    showToast(`Opening patient record for ${patientName}...`, 'info');
    setTimeout(() => {
        window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Doctor\\Patient Records\\patient_records.html';
    }, 1000);
}

function addPreConsultNotes(patientName) {
    const modal = createModal('notes-modal', 'Pre-Consultation Notes');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="notes-form">
            <h3>Add notes for ${patientName}</h3>
            <textarea placeholder="Enter consultation notes..." rows="5" style="width: 100%; padding: var(--spacing-sm); border-radius: var(--radius-sm); border: 1px solid var(--medium-gray);"></textarea>
            <div class="modal-actions" style="margin-top: var(--spacing-md);">
                <button class="btn btn-primary" onclick="saveNotes()">
                    <i class="fas fa-save"></i> Save Notes
                </button>
                <button class="btn btn-secondary" onclick="closeModal('notes-modal')">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('show'));
}

function saveNotes() {
    showToast('Notes saved successfully!', 'success');
    closeModal('notes-modal');
}

// ========================================
// 14. UTILITY FUNCTIONS
// ========================================
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    // You could add a datetime display element if needed
    console.log('Current time:', now.toLocaleString('en-US', options));
}

function initializeTooltips() {
    // Add tooltip functionality to elements with title attribute
    document.querySelectorAll('[title]').forEach(element => {
        const originalTitle = element.getAttribute('title');
        element.removeAttribute('title');
        
        element.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = originalTitle;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(29, 42, 59, 0.95);
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.875rem;
                z-index: 9999;
                pointer-events: none;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            
            element.addEventListener('mouseleave', function() {
                tooltip.remove();
            }, { once: true });
        });
    });
}

function handleResponsiveDesign() {
    // Mobile menu toggle
    if (window.innerWidth <= 768) {
        const header = document.querySelector('.top-header');
        if (header && !document.querySelector('.mobile-menu-toggle')) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'mobile-menu-toggle';
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            menuBtn.style.cssText = `
                position: absolute;
                left: var(--spacing-md);
                background: none;
                border: none;
                font-size: 1.25rem;
                color: var(--primary-navy);
                cursor: pointer;
            `;
            
            menuBtn.addEventListener('click', function() {
                const sidebar = document.querySelector('.sidebar');
                sidebar?.classList.toggle('active');
            });
            
            header.insertBefore(menuBtn, header.firstChild);
        }
    }
}

function trackQuickAction(e) {
    const action = e.currentTarget.querySelector('span')?.textContent;
    console.log('Quick action clicked:', action);
    // Analytics tracking could go here
}

function checkAuthentication() {
    // Check if user is authenticated
    const authToken = localStorage.getItem('curisAuthToken');
    if (!authToken) {
        console.log('Demo mode - no authentication required');
        // In production: window.location.href = '/login';
    }
}

// ========================================
// 15. MOCK ACTION HANDLERS
// ========================================
// These would connect to real APIs in production
function viewDocument() {
    showToast('Opening document viewer...', 'info');
}

function downloadDocument() {
    showToast('Downloading document...', 'success');
}

function viewPrescription() {
    showToast('Loading prescription details...', 'info');
}

function duplicatePrescription() {
    showToast('Creating prescription duplicate...', 'success');
}

function viewMessage() {
    showToast('Opening message...', 'info');
}

function replyMessage() {
    showToast('Opening message composer...', 'info');
}

function confirmAppointment() {
    showToast('Appointment confirmed!', 'success');
    closeModal('new-appointment-modal');
}

function rescheduleAppointment() {
    showToast('Opening calendar...', 'info');
}

// ========================================
// 16. CLEANUP ON PAGE UNLOAD
// ========================================
window.addEventListener('beforeunload', function() {
    // Clear intervals
    if (DashboardState.realTimeSync) {
        clearInterval(DashboardState.realTimeSync);
    }
    
    // Save any pending state
    localStorage.setItem('dashboardState', JSON.stringify({
        lastVisit: new Date().toISOString()
    }));
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DashboardConfig,
        DashboardState,
        showToast,
        createModal,
        closeModal
    };
}
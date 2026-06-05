/**
 * CURIS BY CITRUS - WORKFORCE HUB JAVASCRIPT
 * Comprehensive Staff Management & Control Center
 * Fully Dynamic and Interactive Implementation
 */

// ====================================
// GLOBAL VARIABLES & CONFIGURATION
// ====================================
const WorkforceConfig = {
    refreshInterval: 30000, // 30 seconds
    activityUpdateInterval: 5000, // 5 seconds
    searchDebounceDelay: 300,
    animationDuration: 300,
    maxLoginAttempts: 3,
    inactivityThreshold: 7 // days
};

// Global state management
const WorkforceState = {
    staffMembers: [],
    filteredStaff: [],
    currentFilter: {
        roles: ['doctor', 'receptionist', 'technician'],
        departments: [],
        performance: { min: 1, max: 5 },
        status: 'all'
    },
    currentSort: 'active',
    selectedStaff: null,
    activityFeed: [],
    systemAlerts: [],
    permissions: {
        doctor: {},
        receptionist: {},
        sensitive: {}
    },
    currentUser: {
        name: 'Dr. Sarah Kimani',
        role: 'Clinic Owner',
        clinicId: 'CLN001'
    }
};

// ====================================
// INITIALIZATION
// ====================================
document.addEventListener('DOMContentLoaded', function () {
    initializeWorkforceHub();
});

function initializeWorkforceHub() {
    // Core initializations
    initializeEventListeners();
    initializeModals();
    initializeSearch();
    initializeFilters();
    initializeActivityFeed();
    initializeSystemAlerts();
    initializePermissions();

    // Load initial data
    loadStaffData();
    loadActivityLogs();
    loadSystemAlerts();
    loadPermissionMatrix();

    // Start real-time updates
    startRealTimeUpdates();

    console.log('Workforce Hub initialized successfully');
}

// ====================================
// EVENT LISTENERS
// ====================================
function initializeEventListeners() {
    // Quick Actions Bar
    document.getElementById('createStaffBtn')?.addEventListener('click', openRoleSelectionModal);
    document.getElementById('permissionMatrixBtn')?.addEventListener('click', openPermissionMatrix);
    document.getElementById('activityLogsBtn')?.addEventListener('click', toggleActivityLogs);
    document.getElementById('performanceBtn')?.addEventListener('click', openPerformanceDashboard);

    // User Profile & Notifications
    document.getElementById('userProfileBtn')?.addEventListener('click', toggleUserDropdown);
    document.getElementById('notificationBtn')?.addEventListener('click', toggleNotificationsPanel);

    // Dark Mode
    document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);

    // Staff Card Actions
    initializeStaffCardActions();

    // Activity Feed Controls
    document.getElementById('activityFilterBtn')?.addEventListener('click', openActivityFilterModal);
    document.getElementById('refreshFeedBtn')?.addEventListener('click', refreshActivityFeed);

    // Alert Actions
    initializeAlertActions();

    // Close dropdowns on outside click
    document.addEventListener('click', handleOutsideClick);
}

function initializeStaffCardActions() {
    // Action buttons for each staff card
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleStaffAction);
    });
}

function initializeAlertActions() {
    document.querySelectorAll('.alert-action-btn').forEach(btn => {
        btn.addEventListener('click', handleAlertAction);
    });
}

// ====================================
// MODAL MANAGEMENT
// ====================================
function initializeModals() {
    // Close button handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function () {
            const modalId = this.getAttribute('data-modal');
            closeModal(modalId);
        });
    });

    // Close on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Close buttons with data-action="close"
    document.querySelectorAll('[data-action="close"]').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Modal-specific initializations
    initializeRoleSelection();
    initializeStaffForms();
    initializePermissionTabs();
    initializeFilterControls();
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

// ====================================
// ROLE SELECTION & STAFF CREATION
// ====================================
function openRoleSelectionModal() {
    openModal('roleSelectionModal');
}

function initializeRoleSelection() {
    document.querySelectorAll('.select-role-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const role = this.getAttribute('data-role');
            closeModal('roleSelectionModal');

            if (role === 'doctor') {
                openDoctorRegistrationForm();
            } else if (role === 'receptionist') {
                openReceptionistRegistrationForm();
            }
        });
    });
}

function openDoctorRegistrationForm() {
    openModal('doctorFormModal');
    generateStaffId('doctor');
    generateUsername('doctor');
    generateTempPassword();
}

function openReceptionistRegistrationForm() {
    openModal('receptionistFormModal');
    generateStaffId('receptionist');
    generateUsername('receptionist');
    generateTempPassword();
}

function generateStaffId(role) {
    const prefix = role === 'doctor' ? 'DOC' : 'REC';
    const nextId = getNextStaffId(role);
    const staffIdField = document.querySelector(`#${role}FormModal input[name="staffId"]`);
    if (staffIdField) {
        staffIdField.value = `${prefix}${String(nextId).padStart(3, '0')}`;
    }
}

function generateUsername(role) {
    const rolePrefix = role === 'doctor' ? 'dr.' : 'rec.';
    const usernameField = document.querySelector(`#${role}FormModal input[name="username"]`);
    if (usernameField) {
        usernameField.value = `${rolePrefix}newstaff${Date.now().toString().slice(-4)}`;
    }
}

function generateTempPassword() {
    const password = `Curis${Math.random().toString(36).slice(-4).toUpperCase()}${Date.now().toString().slice(-4)}!`;
    document.querySelectorAll('input[name="tempPassword"]').forEach(field => {
        field.value = password;
    });
}

function initializeStaffForms() {
    // Doctor Registration Form
    const doctorForm = document.getElementById('doctorRegistrationForm');
    if (doctorForm) {
        doctorForm.addEventListener('submit', handleDoctorRegistration);

        // Auto-generate username on name change
        const nameField = doctorForm.querySelector('input[name="fullName"]');
        nameField?.addEventListener('input', function () {
            updateUsernameFromName(this.value, 'doctor');
        });
    }

    // Receptionist Registration Form
    const receptionistForm = document.getElementById('receptionistRegistrationForm');
    if (receptionistForm) {
        receptionistForm.addEventListener('submit', handleReceptionistRegistration);

        // Auto-generate username on name change
        const nameField = receptionistForm.querySelector('input[name="fullName"]');
        nameField?.addEventListener('input', function () {
            updateUsernameFromName(this.value, 'receptionist');
        });
    }
}

function updateUsernameFromName(fullName, role) {
    if (!fullName) return;

    const names = fullName.toLowerCase().split(' ');
    const rolePrefix = role === 'doctor' ? 'dr.' : 'rec.';
    const username = `${rolePrefix}${names[0]}${names[names.length - 1] || ''}`;

    const usernameField = document.querySelector(`#${role}FormModal input[name="username"]`);
    if (usernameField) {
        usernameField.value = username.replace(/[^a-z0-9.]/g, '');
    }
}

function handleDoctorRegistration(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const doctorData = {
        fullName: formData.get('fullName'),
        staffId: formData.get('staffId'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        department: formData.get('department'),
        accessLevel: formData.get('accessLevel'),
        username: formData.get('username'),
        tempPassword: formData.get('tempPassword'),
        sendEmail: formData.get('sendEmail'),
        sendSMS: formData.get('sendSMS')
    };

    // Validate form
    if (!validateStaffForm(doctorData)) {
        return;
    }

    // Show loading state
    showLoadingState(event.target);

    // Simulate API call
    setTimeout(() => {
        // Add to staff list
        addStaffMember({
            ...doctorData,
            role: 'doctor',
            status: 'active',
            metrics: {
                appointments: 0,
                rating: 0,
                punctuality: 100
            }
        });

        // Send invitations
        if (doctorData.sendEmail || doctorData.sendSMS) {
            sendStaffInvitation(doctorData);
        }

        // Show success message
        showToast('Doctor account created successfully!', 'success');

        // Close modal and reset form
        closeModal('doctorFormModal');
        event.target.reset();

        // Refresh staff grid
        refreshStaffGrid();

        hideLoadingState(event.target);
    }, 1500);
}

function handleReceptionistRegistration(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const receptionistData = {
        fullName: formData.get('fullName'),
        staffId: formData.get('staffId'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        position: formData.get('position'),
        department: formData.get('department'),
        username: formData.get('username'),
        tempPassword: formData.get('tempPassword'),
        sendEmail: formData.get('sendEmail'),
        sendSMS: formData.get('sendSMS')
    };

    // Validate form
    if (!validateStaffForm(receptionistData)) {
        return;
    }

    // Show loading state
    showLoadingState(event.target);

    // Simulate API call
    setTimeout(() => {
        // Add to staff list
        addStaffMember({
            ...receptionistData,
            role: 'receptionist',
            status: 'active',
            metrics: {
                registrations: 0,
                rating: 0,
                efficiency: 100
            }
        });

        // Send invitations
        if (receptionistData.sendEmail || receptionistData.sendSMS) {
            sendStaffInvitation(receptionistData);
        }

        // Show success message
        showToast('Receptionist account created successfully!', 'success');

        // Close modal and reset form
        closeModal('receptionistFormModal');
        event.target.reset();

        // Refresh staff grid
        refreshStaffGrid();

        hideLoadingState(event.target);
    }, 1500);
}

function validateStaffForm(data) {
    // Basic validation
    if (!data.fullName || !data.email || !data.phone) {
        showToast('Please fill in all required fields', 'error');
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(data.phone)) {
        showToast('Please enter a valid phone number', 'error');
        return false;
    }

    return true;
}

function sendStaffInvitation(staffData) {
    // Simulate sending invitation
    const methods = [];
    if (staffData.sendEmail) methods.push('email');
    if (staffData.sendSMS) methods.push('SMS');

    console.log(`Sending invitation via ${methods.join(' and ')} to ${staffData.fullName}`);

    // Add to activity feed
    addActivityItem({
        type: 'invitation',
        user: WorkforceState.currentUser.name,
        action: `sent login credentials to ${staffData.fullName}`,
        timestamp: new Date()
    });
}

// ====================================
// PERMISSION MATRIX (RBAC)
// ====================================
function openPermissionMatrix() {
    openModal('rbacModal');
    loadPermissionSettings();
}

function initializePermissionTabs() {
    const tabs = document.querySelectorAll('#rbacModal .tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            switchPermissionTab(this);
        });
    });

    // Save permissions button
    document.getElementById('savePermissionsBtn')?.addEventListener('click', savePermissions);

    // Toggle switches
    document.querySelectorAll('.toggle-switch input').forEach(toggle => {
        toggle.addEventListener('change', handlePermissionToggle);
    });

    // Restriction selects
    document.querySelectorAll('.restriction-select').forEach(select => {
        select.addEventListener('change', handleRestrictionChange);
    });
}

function switchPermissionTab(tabBtn) {
    // Remove active class from all tabs
    document.querySelectorAll('#rbacModal .tab-btn').forEach(t => {
        t.classList.remove('active');
    });

    // Add active class to clicked tab
    tabBtn.classList.add('active');

    // Hide all tab contents
    document.querySelectorAll('#rbacModal .tab-content').forEach(content => {
        content.style.display = 'none';
    });

    // Show selected tab content
    const tabName = tabBtn.getAttribute('data-tab');
    const tabContent = document.getElementById(`${tabName}PermTab`);
    if (tabContent) {
        tabContent.style.display = 'block';
    } else if (tabName === 'sensitive') {
        document.getElementById('sensitiveDataTab').style.display = 'block';
    }
}

function loadPermissionSettings() {
    // Load current permission settings
    // This would typically come from the server
    WorkforceState.permissions = {
        doctor: {
            medicalRecords: true,
            appointmentHandling: true,
            limitedBilling: false,
            prescriptionManagement: true
        },
        receptionist: {
            appointmentScheduling: true,
            patientRegistration: true,
            invoicingAccess: true,
            basicPatientData: true
        },
        sensitive: {
            billingHistory: 'restrict',
            financialReports: 'restrict',
            fullPatientMedicalData: 'limited'
        }
    };

    // Update UI
    updatePermissionUI();
}

function updatePermissionUI() {
    // Update doctor permissions
    Object.entries(WorkforceState.permissions.doctor).forEach(([key, value]) => {
        const toggle = document.querySelector(`#doctorPermTab input[data-permission="${key}"]`);
        if (toggle) {
            toggle.checked = value;
        }
    });

    // Update receptionist permissions
    Object.entries(WorkforceState.permissions.receptionist).forEach(([key, value]) => {
        const toggle = document.querySelector(`#receptionistPermTab input[data-permission="${key}"]`);
        if (toggle) {
            toggle.checked = value;
        }
    });

    // Update sensitive data restrictions
    Object.entries(WorkforceState.permissions.sensitive).forEach(([key, value]) => {
        const select = document.querySelector(`#sensitiveDataTab select[data-restriction="${key}"]`);
        if (select) {
            select.value = value;
        }
    });
}

function handlePermissionToggle(event) {
    const permission = event.target.getAttribute('data-permission');
    const role = event.target.closest('.tab-content').id.includes('doctor') ? 'doctor' : 'receptionist';

    WorkforceState.permissions[role][permission] = event.target.checked;

    console.log(`Updated ${role} permission: ${permission} = ${event.target.checked}`);
}

function handleRestrictionChange(event) {
    const restriction = event.target.getAttribute('data-restriction');
    const value = event.target.value;

    WorkforceState.permissions.sensitive[restriction] = value;

    console.log(`Updated sensitive data restriction: ${restriction} = ${value}`);
}

function savePermissions() {
    showLoadingState(document.getElementById('savePermissionsBtn'));

    // Simulate API call
    setTimeout(() => {
        showToast('Permissions saved successfully!', 'success');
        closeModal('rbacModal');

        // Update staff access based on new permissions
        updateStaffAccess();

        hideLoadingState(document.getElementById('savePermissionsBtn'));
    }, 1000);
}

// ====================================
// ACTIVITY LOGS
// ====================================
function toggleActivityLogs() {
    const section = document.getElementById('activityFeedSection');
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';

        if (section.style.display === 'block') {
            refreshActivityFeed();
        }
    }
}

function initializeActivityFeed() {
    // Initialize with sample data
    WorkforceState.activityFeed = [
        {
            id: 1,
            user: 'Dr. Grace Wanjiru',
            action: 'completed consultation with Patient #1458',
            type: 'consultation',
            timestamp: new Date(Date.now() - 2 * 60000),
            ip: '192.168.1.45'
        },
        {
            id: 2,
            user: 'Receptionist John',
            action: 'rescheduled appointment for Patient #452',
            type: 'appointment',
            timestamp: new Date(Date.now() - 5 * 60000),
            ip: '192.168.1.23'
        },
        {
            id: 3,
            user: 'Dr. James Kamau',
            action: 'updated medical record for Patient #789',
            type: 'medical_record',
            timestamp: new Date(Date.now() - 12 * 60000),
            ip: '192.168.1.67'
        }
    ];

    renderActivityFeed();
}

function renderActivityFeed() {
    const feedContainer = document.getElementById('activityFeed');
    if (!feedContainer) return;

    feedContainer.innerHTML = WorkforceState.activityFeed.map(activity => `
        <div class="activity-item" data-activity-id="${activity.id}">
            <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
            <div class="activity-avatar">
                <img src="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-30.png" 
                     alt="${activity.user}">
            </div>
            <div class="activity-content">
                <p class="activity-text">
                    <strong>${activity.user}</strong> ${activity.action}
                </p>
                <span class="activity-details">Action: ${formatActionType(activity.type)} | IP: ${activity.ip}</span>
            </div>
            <button class="activity-details-btn" data-activity="${activity.id}">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `).join('');

    // Add event listeners to detail buttons
    document.querySelectorAll('.activity-details-btn').forEach(btn => {
        btn.addEventListener('click', showActivityDetails);
    });
}

function refreshActivityFeed() {
    const refreshBtn = document.getElementById('refreshFeedBtn');
    if (refreshBtn) {
        refreshBtn.querySelector('i').classList.add('fa-spin');
    }

    // Simulate API call
    setTimeout(() => {
        // Add new activity
        const newActivity = {
            id: Date.now(),
            user: 'Dr. Peterson',
            action: 'prescribed medication for Patient #1502',
            type: 'prescription',
            timestamp: new Date(),
            ip: '192.168.1.89'
        };

        WorkforceState.activityFeed.unshift(newActivity);

        // Keep only last 20 activities
        WorkforceState.activityFeed = WorkforceState.activityFeed.slice(0, 20);

        renderActivityFeed();

        if (refreshBtn) {
            refreshBtn.querySelector('i').classList.remove('fa-spin');
        }

        showToast('Activity feed refreshed', 'success');
    }, 1000);
}

function showActivityDetails(event) {
    const activityId = event.currentTarget.getAttribute('data-activity');
    const activity = WorkforceState.activityFeed.find(a => a.id == activityId);

    if (!activity) return;

    const modalContent = document.getElementById('activityDetailsContent');
    modalContent.innerHTML = `
        <div class="activity-detail-view">
            <h4>Activity Details</h4>
            <div class="detail-row">
                <span class="detail-label">User:</span>
                <span class="detail-value">${activity.user}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Action:</span>
                <span class="detail-value">${activity.action}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Type:</span>
                <span class="detail-value">${formatActionType(activity.type)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Timestamp:</span>
                <span class="detail-value">${formatDateTime(activity.timestamp)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">IP Address:</span>
                <span class="detail-value">${activity.ip}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">Main Clinic - Consultation Room 3</span>
            </div>
        </div>
    `;

    openModal('activityDetailsModal');
}

function openActivityFilterModal() {
    openModal('activityFilterModal');

    // Initialize filter controls
    document.querySelectorAll('input[name="timeFilter"]').forEach(radio => {
        radio.addEventListener('change', handleTimeFilterChange);
    });

    document.getElementById('applyActivityFilterBtn')?.addEventListener('click', applyActivityFilters);
}

function handleTimeFilterChange(event) {
    const customRange = document.getElementById('customDateRange');
    if (event.target.value === 'custom') {
        customRange.style.display = 'block';
    } else {
        customRange.style.display = 'none';
    }
}

function applyActivityFilters() {
    // Get filter values
    const filters = {
        staff: Array.from(document.querySelectorAll('select[name="staffFilter"] option:checked')).map(opt => opt.value),
        actions: Array.from(document.querySelectorAll('input[name="actionFilter"]:checked')).map(inp => inp.value),
        timeFilter: document.querySelector('input[name="timeFilter"]:checked')?.value
    };

    console.log('Applying activity filters:', filters);

    // Filter activity feed
    filterActivityFeed(filters);

    closeModal('activityFilterModal');
    showToast('Filters applied successfully', 'success');
}

// ====================================
// PERFORMANCE DASHBOARD
// ====================================
function openPerformanceDashboard() {
    openModal('staffPerformanceModal');
    loadStaffPerformance();
}

function loadStaffPerformance() {
    const selector = document.getElementById('staffMemberSelector');
    if (selector) {
        selector.addEventListener('change', updatePerformanceDisplay);

        // Load initial performance data
        updatePerformanceDisplay();
    }
}

function updatePerformanceDisplay() {
    const staffId = document.getElementById('staffMemberSelector').value;
    const staff = WorkforceState.staffMembers.find(s => s.staffId === staffId);

    if (!staff) return;

    const content = document.getElementById('performanceContent');
    content.innerHTML = `
        <div class="performance-overview">
            <h4>${staff.fullName} - Performance Metrics</h4>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <h5>Service Efficiency</h5>
                    <div class="metric-value">${staff.metrics.efficiency || '95'}%</div>
                    <div class="metric-chart">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${staff.metrics.efficiency || 95}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="metric-card">
                    <h5>Patient Satisfaction</h5>
                    <div class="metric-value">${staff.metrics.rating || '4.8'}/5</div>
                    <div class="rating-stars">
                        ${generateStarRating(staff.metrics.rating || 4.8)}
                    </div>
                </div>
                
                <div class="metric-card">
                    <h5>Attendance Record</h5>
                    <div class="metric-value">${staff.metrics.attendance || '98'}%</div>
                    <div class="attendance-summary">
                        Present: ${staff.metrics.presentDays || 245} days
                    </div>
                </div>
            </div>
            
            <div class="feedback-section">
                <h5>Recent Patient Feedback</h5>
                <div class="feedback-list">
                    <div class="feedback-item">
                        <div class="feedback-rating">${generateStarRating(5)}</div>
                        <p>"Excellent service and very professional"</p>
                        <span class="feedback-date">2 days ago</span>
                    </div>
                    <div class="feedback-item">
                        <div class="feedback-rating">${generateStarRating(4)}</div>
                        <p>"Good consultation, but had to wait a bit"</p>
                        <span class="feedback-date">5 days ago</span>
                    </div>
                </div>
            </div>
            
            <div class="trend-analysis">
                <h5>Performance Trend</h5>
                <canvas id="performanceTrendChart" width="400" height="200"></canvas>
            </div>
        </div>
    `;

    // Draw performance trend chart
    drawPerformanceTrend(staffId);
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }

    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

function drawPerformanceTrend(staffId) {
    const canvas = document.getElementById('performanceTrendChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Simple line chart
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, 180);
    ctx.lineTo(380, 180);
    ctx.stroke();

    // Sample performance data
    const data = [85, 88, 87, 90, 92, 91, 93];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Draw data points and lines
    ctx.strokeStyle = '#00BFA5';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((value, index) => {
        const x = 40 + (index * 50);
        const y = 180 - (value * 1.6);

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

        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(labels[index], x - 15, 195);
    });

    ctx.stroke();
}

// ====================================
// STAFF MANAGEMENT ACTIONS
// ====================================
function handleStaffAction(event) {
    event.stopPropagation();

    const action = event.currentTarget.getAttribute('data-action');
    const staffId = event.currentTarget.getAttribute('data-staff');

    WorkforceState.selectedStaff = staffId;

    switch (action) {
        case 'edit':
            openQuickEditModal(staffId);
            break;
        case 'view':
            viewStaffDetails(staffId);
            break;
        case 'suspend':
            openSuspensionModal(staffId);
            break;
        case 'contact':
            contactStaffMember(staffId);
            break;
        case 'more':
            showMoreOptions(staffId);
            break;
    }
}

function openQuickEditModal(staffId) {
    const staff = getStaffById(staffId);
    if (!staff) return;

    // Populate form with current data
    const form = document.getElementById('quickEditForm');
    if (form) {
        form.querySelector('select[name="role"]').value = staff.role;
        form.querySelector('input[name="email"]').value = staff.email;
        form.querySelector('input[name="phone"]').value = staff.phone;
        form.querySelector('select[name="department"]').value = staff.department;
    }

    // Add submit handler
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        updateStaffMember(staffId, new FormData(e.target));
    });

    openModal('quickEditModal');
}

function updateStaffMember(staffId, formData) {
    showLoadingState(document.getElementById('quickEditForm'));

    // Simulate API call
    setTimeout(() => {
        const updates = {
            role: formData.get('role'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            department: formData.get('department')
        };

        // Update staff member
        const staffIndex = WorkforceState.staffMembers.findIndex(s => s.staffId === staffId);
        if (staffIndex !== -1) {
            WorkforceState.staffMembers[staffIndex] = {
                ...WorkforceState.staffMembers[staffIndex],
                ...updates
            };
        }

        showToast('Staff member updated successfully!', 'success');
        closeModal('quickEditModal');
        refreshStaffGrid();

        hideLoadingState(document.getElementById('quickEditForm'));
    }, 1000);
}

function openSuspensionModal(staffId) {
    const staff = getStaffById(staffId);
    if (!staff) return;

    WorkforceState.selectedStaff = staffId;

    document.getElementById('confirmSuspendBtn')?.addEventListener('click', confirmSuspension);

    openModal('suspensionModal');
}

function confirmSuspension() {
    const reason = document.querySelector('select[name="reason"]').value;
    const startDate = document.querySelector('input[name="startDate"]').value;
    const endDate = document.querySelector('input[name="endDate"]').value;
    const notes = document.querySelector('textarea[name="notes"]').value;

    if (!reason || !startDate || !endDate) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    showLoadingState(document.getElementById('confirmSuspendBtn'));

    // Simulate API call
    setTimeout(() => {
        // Update staff status
        const staffIndex = WorkforceState.staffMembers.findIndex(s => s.staffId === WorkforceState.selectedStaff);
        if (staffIndex !== -1) {
            WorkforceState.staffMembers[staffIndex].status = 'suspended';
            WorkforceState.staffMembers[staffIndex].suspension = {
                reason,
                startDate,
                endDate,
                notes
            };
        }

        showToast('Staff member suspended successfully', 'success');
        closeModal('suspensionModal');
        refreshStaffGrid();

        // Add to activity log
        addActivityItem({
            type: 'suspension',
            user: WorkforceState.currentUser.name,
            action: `suspended staff member ${WorkforceState.selectedStaff}`,
            timestamp: new Date()
        });

        hideLoadingState(document.getElementById('confirmSuspendBtn'));
    }, 1000);
}

function showRemovalConfirmation(staffId) {
    const staff = getStaffById(staffId);
    if (!staff) return;

    WorkforceState.selectedStaff = staffId;

    // Enable remove button only when name matches
    const confirmInput = document.getElementById('confirmationName');
    const removeBtn = document.getElementById('finalRemoveBtn');

    confirmInput.addEventListener('input', function () {
        removeBtn.disabled = this.value.toLowerCase() !== staff.fullName.toLowerCase();
    });

    removeBtn.addEventListener('click', removeStaffMember);

    openModal('removalConfirmModal');
}

function removeStaffMember() {
    const reassignPatients = document.querySelector('input[name="reassignPatients"]').checked;

    showLoadingState(document.getElementById('finalRemoveBtn'));

    // Simulate API call
    setTimeout(() => {
        // Remove staff member
        WorkforceState.staffMembers = WorkforceState.staffMembers.filter(
            s => s.staffId !== WorkforceState.selectedStaff
        );

        if (reassignPatients) {
            // Handle patient reassignment
            console.log('Reassigning patients to other staff members...');
        }

        showToast('Staff member removed successfully', 'success');
        closeModal('removalConfirmModal');
        refreshStaffGrid();

        hideLoadingState(document.getElementById('finalRemoveBtn'));
    }, 1500);
}

// ====================================
// SEARCH & FILTER FUNCTIONALITY
// ====================================
function initializeSearch() {
    const searchInput = document.getElementById('staffSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, WorkforceConfig.searchDebounceDelay));
    }

    // Advanced filter button
    document.getElementById('advancedFilterBtn')?.addEventListener('click', openAdvancedFilter);

    // Sort dropdown
    document.getElementById('sortOptions')?.addEventListener('change', handleSort);
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();

    if (!searchTerm) {
        WorkforceState.filteredStaff = [...WorkforceState.staffMembers];
    } else {
        WorkforceState.filteredStaff = WorkforceState.staffMembers.filter(staff => {
            return staff.fullName.toLowerCase().includes(searchTerm) ||
                staff.staffId.toLowerCase().includes(searchTerm) ||
                staff.department.toLowerCase().includes(searchTerm) ||
                staff.role.toLowerCase().includes(searchTerm);
        });
    }

    renderStaffGrid();
}

function openAdvancedFilter() {
    openModal('advancedFilterModal');

    // Apply filters button
    document.getElementById('applyFiltersBtn')?.addEventListener('click', applyAdvancedFilters);

    // Clear filters button
    document.getElementById('clearFiltersBtn')?.addEventListener('click', clearFilters);

    // Rating range sliders
    initializeRangeSliders();
}

function initializeRangeSliders() {
    const minSlider = document.getElementById('minRating');
    const maxSlider = document.getElementById('maxRating');
    const minValue = document.getElementById('minValue');
    const maxValue = document.getElementById('maxValue');

    function updateRangeValues() {
        minValue.textContent = minSlider.value;
        maxValue.textContent = maxSlider.value;

        // Ensure min doesn't exceed max
        if (parseFloat(minSlider.value) > parseFloat(maxSlider.value)) {
            minSlider.value = maxSlider.value;
            minValue.textContent = maxSlider.value;
        }
    }

    minSlider?.addEventListener('input', updateRangeValues);
    maxSlider?.addEventListener('input', updateRangeValues);
}

function applyAdvancedFilters() {
    // Get filter values
    const filters = {
        roles: Array.from(document.querySelectorAll('input[name="roleFilter"]:checked')).map(inp => inp.value),
        minRating: parseFloat(document.getElementById('minRating').value),
        maxRating: parseFloat(document.getElementById('maxRating').value),
        activity: document.querySelector('select[name="activityFilter"]').value,
        departments: Array.from(document.querySelectorAll('input[name="deptFilter"]:checked')).map(inp => inp.value)
    };

    // Apply filters
    WorkforceState.filteredStaff = WorkforceState.staffMembers.filter(staff => {
        // Role filter
        if (filters.roles.length > 0 && !filters.roles.includes(staff.role)) {
            return false;
        }

        // Rating filter
        const rating = staff.metrics.rating || 0;
        if (rating < filters.minRating || rating > filters.maxRating) {
            return false;
        }

        // Activity filter
        if (filters.activity === 'active' && staff.status !== 'active') {
            return false;
        } else if (filters.activity === 'inactive' && staff.status !== 'inactive') {
            return false;
        } else if (filters.activity === 'suspended' && staff.status !== 'suspended') {
            return false;
        }

        // Department filter
        if (filters.departments.length > 0 && !filters.departments.includes(staff.department)) {
            return false;
        }

        return true;
    });

    renderStaffGrid();
    closeModal('advancedFilterModal');
    showToast(`Showing ${WorkforceState.filteredStaff.length} staff members`, 'success');
}

function clearFilters() {
    // Reset all filter controls
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    document.getElementById('minRating').value = 1;
    document.getElementById('maxRating').value = 5;
    document.querySelector('select[name="activityFilter"]').value = 'all';

    // Update display
    document.getElementById('minValue').textContent = '1.0';
    document.getElementById('maxValue').textContent = '5.0';

    // Reset filtered staff
    WorkforceState.filteredStaff = [...WorkforceState.staffMembers];

    renderStaffGrid();
    showToast('Filters cleared', 'success');
}

function handleSort(event) {
    const sortBy = event.target.value;
    WorkforceState.currentSort = sortBy;

    switch (sortBy) {
        case 'active':
            WorkforceState.filteredStaff.sort((a, b) => {
                // Active staff first, then by last activity
                if (a.status === 'active' && b.status !== 'active') return -1;
                if (a.status !== 'active' && b.status === 'active') return 1;
                return b.lastActivity - a.lastActivity;
            });
            break;

        case 'rating':
            WorkforceState.filteredStaff.sort((a, b) => (b.metrics.rating || 0) - (a.metrics.rating || 0));
            break;

        case 'recent':
            WorkforceState.filteredStaff.sort((a, b) => b.joinDate - a.joinDate);
            break;

        case 'name':
            WorkforceState.filteredStaff.sort((a, b) => a.fullName.localeCompare(b.fullName));
            break;
    }

    renderStaffGrid();
}

// ====================================
// SYSTEM ALERTS
// ====================================
function initializeSystemAlerts() {
    // Load initial alerts
    WorkforceState.systemAlerts = [
        {
            id: 1,
            type: 'inactive',
            priority: 'high',
            title: 'Staff Inactive Alert',
            description: "John Mwangi (Lab Technician) hasn't logged in for 7 days",
            staffId: 'LAB001'
        },
        {
            id: 2,
            type: 'cancellations',
            priority: 'medium',
            title: 'Excessive Cancellations',
            description: 'Dr. Johnson has 15% cancellation rate this week (threshold: 10%)',
            staffId: 'DOC003'
        },
        {
            id: 3,
            type: 'feedback',
            priority: 'low',
            title: 'Declining Feedback Score',
            description: "Dr. Peterson's rating dropped from 4.8 to 4.2 this month",
            staffId: 'DOC004'
        }
    ];

    updateAlertCount();
}

function handleAlertAction(event) {
    const action = event.currentTarget.getAttribute('data-action');
    const alertElement = event.currentTarget.closest('.alert-item');
    const alertType = alertElement.getAttribute('data-alert-type');

    switch (action) {
        case 'contact':
            contactStaffFromAlert(alertType);
            break;
        case 'details':
            showAlertDetails(alertType);
            break;
        case 'meeting':
            scheduleMeeting(alertType);
            break;
        case 'review':
            reviewFeedback(alertType);
            break;
        case 'dismiss':
            dismissAlert(alertType);
            break;
    }
}

function showAlertDetails(alertType) {
    const alert = WorkforceState.systemAlerts.find(a => a.type === alertType);
    if (!alert) return;

    const modalTitle = document.getElementById('alertActionTitle');
    const modalContent = document.getElementById('alertActionContent');

    modalTitle.textContent = alert.title;

    let content = '';

    switch (alertType) {
        case 'inactive':
            content = `
                <div class="alert-detail-content">
                    <h4>Staff Member Details</h4>
                    <p><strong>Name:</strong> John Mwangi</p>
                    <p><strong>Role:</strong> Lab Technician</p>
                    <p><strong>Last Activity:</strong> 7 days ago</p>
                    <p><strong>Department:</strong> Laboratory</p>
                    
                    <h4>Possible Reasons</h4>
                    <ul>
                        <li>Extended leave not recorded in system</li>
                        <li>System access issues</li>
                        <li>Personal emergency</li>
                    </ul>
                    
                    <h4>Resolution Options</h4>
                    <div class="resolution-actions">
                        <button class="btn-primary" onclick="contactStaff('LAB001')">
                            <i class="fas fa-phone"></i> Contact Staff
                        </button>
                        <button class="btn-secondary" onclick="checkAccessLogs('LAB001')">
                            <i class="fas fa-search"></i> Check Access Logs
                        </button>
                        <button class="btn-danger" onclick="suspendAccess('LAB001')">
                            <i class="fas fa-ban"></i> Suspend Access
                        </button>
                    </div>
                </div>
            `;
            break;

        case 'cancellations':
            content = `
                <div class="alert-detail-content">
                    <h4>Cancellation Analysis</h4>
                    <p><strong>Staff:</strong> Dr. Johnson</p>
                    <p><strong>Current Rate:</strong> 15%</p>
                    <p><strong>Threshold:</strong> 10%</p>
                    <p><strong>Period:</strong> This Week</p>
                    
                    <h4>Cancellation Breakdown</h4>
                    <ul>
                        <li>Patient-initiated: 8 cancellations</li>
                        <li>Doctor-initiated: 3 cancellations</li>
                        <li>System/Emergency: 1 cancellation</li>
                    </ul>
                    
                    <h4>Recommended Actions</h4>
                    <div class="resolution-actions">
                        <button class="btn-primary" onclick="scheduleMeeting('DOC003')">
                            <i class="fas fa-calendar"></i> Schedule Meeting
                        </button>
                        <button class="btn-secondary" onclick="reviewSchedule('DOC003')">
                            <i class="fas fa-clock"></i> Review Schedule
                        </button>
                    </div>
                </div>
            `;
            break;

        case 'feedback':
            content = `
                <div class="alert-detail-content">
                    <h4>Feedback Analysis</h4>
                    <p><strong>Staff:</strong> Dr. Peterson</p>
                    <p><strong>Previous Rating:</strong> 4.8/5</p>
                    <p><strong>Current Rating:</strong> 4.2/5</p>
                    <p><strong>Change:</strong> -0.6 points</p>
                    
                    <h4>Recent Feedback Comments</h4>
                    <div class="feedback-comments">
                        <div class="comment negative">
                            <p>"Doctor seemed rushed during consultation"</p>
                            <span>3 days ago</span>
                        </div>
                        <div class="comment negative">
                            <p>"Had to wait longer than usual"</p>
                            <span>5 days ago</span>
                        </div>
                    </div>
                    
                    <h4>Action Items</h4>
                    <div class="resolution-actions">
                        <button class="btn-primary" onclick="reviewFeedback('DOC004')">
                            <i class="fas fa-comments"></i> Review All Feedback
                        </button>
                        <button class="btn-secondary" onclick="provideFeedback('DOC004')">
                            <i class="fas fa-user-check"></i> Provide Coaching
                        </button>
                    </div>
                </div>
            `;
            break;
    }

    modalContent.innerHTML = content;
    openModal('alertActionModal');
}

function dismissAlert(alertType) {
    const alertElement = document.querySelector(`[data-alert-type="${alertType}"]`);
    if (alertElement) {
        alertElement.style.transition = 'opacity 0.3s, transform 0.3s';
        alertElement.style.opacity = '0';
        alertElement.style.transform = 'translateX(100%)';

        setTimeout(() => {
            alertElement.remove();

            // Remove from state
            WorkforceState.systemAlerts = WorkforceState.systemAlerts.filter(a => a.type !== alertType);
            updateAlertCount();

            showToast('Alert dismissed', 'success');
        }, 300);
    }
}

function updateAlertCount() {
    const alertCount = document.querySelector('.alert-count');
    if (alertCount) {
        alertCount.textContent = `${WorkforceState.systemAlerts.length} Active Alerts`;
    }
}

// ====================================
// DATA MANAGEMENT
// ====================================
function loadStaffData() {
    // Initialize with sample staff data
    WorkforceState.staffMembers = [
        {
            staffId: 'DOC001',
            fullName: 'Dr. James Kamau',
            role: 'doctor',
            position: 'Senior Doctor',
            department: 'general',
            email: 'dr.kamau@clinic.com',
            phone: '+254 700 123 456',
            status: 'active',
            joinDate: new Date('2023-01-15'),
            lastActivity: new Date(),
            metrics: {
                appointments: 89,
                rating: 4.9,
                punctuality: 95,
                efficiency: 92,
                attendance: 98,
                presentDays: 245
            }
        },
        {
            staffId: 'REC001',
            fullName: 'Mary Wanjiku',
            role: 'receptionist',
            position: 'Senior Receptionist',
            department: 'frontdesk',
            email: 'mary.wanjiku@clinic.com',
            phone: '+254 700 234 567',
            status: 'active',
            joinDate: new Date('2022-06-20'),
            lastActivity: new Date(),
            metrics: {
                registrations: 156,
                rating: 4.7,
                efficiency: 92
            }
        },
        {
            staffId: 'DOC002',
            fullName: 'Dr. Grace Wanjiru',
            role: 'doctor',
            position: 'General Practitioner',
            department: 'pediatrics',
            email: 'dr.wanjiru@clinic.com',
            phone: '+254 700 345 678',
            status: 'active',
            joinDate: new Date('2023-03-10'),
            lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
            metrics: {
                appointments: 76,
                rating: 4.8,
                punctuality: 92
            }
        },
        {
            staffId: 'LAB001',
            fullName: 'John Mwangi',
            role: 'technician',
            position: 'Lab Technician',
            department: 'lab',
            email: 'john.mwangi@clinic.com',
            phone: '+254 700 456 789',
            status: 'inactive',
            joinDate: new Date('2022-11-05'),
            lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            metrics: {
                tests: 45,
                rating: 4.6,
                accuracy: 98
            }
        }
    ];

    WorkforceState.filteredStaff = [...WorkforceState.staffMembers];
    renderStaffGrid();
}

function renderStaffGrid() {
    const gridContainer = document.getElementById('staffGrid');
    if (!gridContainer) return;

    gridContainer.innerHTML = WorkforceState.filteredStaff.map(staff => {
        const roleClass = `${staff.role}-card`;
        const statusClass = staff.status === 'active' ? 'active' : 'inactive';
        const statusText = staff.status === 'active' ? 'Active' : `Inactive (${getDaysSinceActivity(staff.lastActivity)} days)`;

        // Get appropriate metrics based on role
        let metricsHtml = '';
        if (staff.role === 'doctor') {
            metricsHtml = `
                <div class="metric-item">
                    <span class="metric-label">Appointments</span>
                    <span class="metric-value">${staff.metrics.appointments}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Rating</span>
                    <span class="metric-value">${staff.metrics.rating}/5</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Punctuality</span>
                    <span class="metric-value">${staff.metrics.punctuality}%</span>
                </div>
            `;
        } else if (staff.role === 'receptionist') {
            metricsHtml = `
                <div class="metric-item">
                    <span class="metric-label">Registrations</span>
                    <span class="metric-value">${staff.metrics.registrations}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Rating</span>
                    <span class="metric-value">${staff.metrics.rating}/5</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Efficiency</span>
                    <span class="metric-value">${staff.metrics.efficiency}%</span>
                </div>
            `;
        } else if (staff.role === 'technician') {
            metricsHtml = `
                <div class="metric-item">
                    <span class="metric-label">Tests</span>
                    <span class="metric-value">${staff.metrics.tests}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Rating</span>
                    <span class="metric-value">${staff.metrics.rating}/5</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Accuracy</span>
                    <span class="metric-value">${staff.metrics.accuracy}%</span>
                </div>
            `;
        }

        return `
            <div class="staff-card ${roleClass}" data-staff-id="${staff.staffId}" data-role="${staff.role}">
                <div class="staff-header">
                    <div class="staff-avatar">
                        <img src="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png" 
                             alt="${staff.fullName}">
                    </div>
                    <div class="staff-info">
                        <h3 class="staff-name">${staff.fullName}</h3>
                        <span class="staff-role">${staff.position}</span>
                        <span class="staff-id">ID: ${staff.staffId}</span>
                        <span class="staff-department">${formatDepartment(staff.department)}</span>
                    </div>
                    <div class="staff-status">
                        <span class="status-badge ${statusClass}">
                            <i class="fas fa-circle"></i>
                            ${statusText}
                        </span>
                    </div>
                </div>
                
                <div class="staff-metrics">
                    ${metricsHtml}
                </div>
                
                <div class="staff-actions">
                    <button class="action-btn edit-btn" data-action="edit" data-staff="${staff.staffId}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn view-btn" data-action="view" data-staff="${staff.staffId}">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${staff.status === 'inactive' ?
                `<button class="action-btn contact-btn" data-action="contact" data-staff="${staff.staffId}">
                            <i class="fas fa-phone"></i>
                        </button>` :
                `<button class="action-btn suspend-btn" data-action="suspend" data-staff="${staff.staffId}">
                            <i class="fas fa-pause"></i>
                        </button>`
            }
                    <button class="action-btn more-btn" data-action="more" data-staff="${staff.staffId}">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Re-initialize action buttons
    initializeStaffCardActions();
}

function addStaffMember(staffData) {
    const newStaff = {
        ...staffData,
        staffId: staffData.staffId,
        joinDate: new Date(),
        lastActivity: new Date(),
        status: 'active'
    };

    WorkforceState.staffMembers.push(newStaff);
    WorkforceState.filteredStaff = [...WorkforceState.staffMembers];

    // Add to activity log
    addActivityItem({
        type: 'staff_creation',
        user: WorkforceState.currentUser.name,
        action: `created new ${staffData.role} account for ${staffData.fullName}`,
        timestamp: new Date()
    });
}

function addActivityItem(activity) {
    const newActivity = {
        id: Date.now(),
        ...activity,
        ip: generateRandomIP()
    };

    WorkforceState.activityFeed.unshift(newActivity);

    // Keep only last 50 activities
    WorkforceState.activityFeed = WorkforceState.activityFeed.slice(0, 50);

    // Update UI if activity feed is visible
    if (document.getElementById('activityFeedSection')?.style.display === 'block') {
        renderActivityFeed();
    }
}

// ====================================
// UTILITY FUNCTIONS
// ====================================
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

function formatTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
}

function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatActionType(type) {
    const types = {
        consultation: 'Consultation Completed',
        appointment: 'Appointment Action',
        medical_record: 'Medical Record Update',
        prescription: 'Prescription Created',
        staff_creation: 'Staff Account Created',
        suspension: 'Staff Suspension',
        invitation: 'Invitation Sent'
    };
    return types[type] || type;
}

function formatDepartment(dept) {
    const departments = {
        general: 'General Consultation',
        pediatrics: 'Pediatrics',
        lab: 'Laboratory',
        frontdesk: 'Front Desk',
        billing: 'Billing Department',
        records: 'Records Management'
    };
    return departments[dept] || dept;
}

function getDaysSinceActivity(lastActivity) {
    const now = new Date();
    const diffInDays = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    return diffInDays;
}

function generateRandomIP() {
    return `192.168.1.${Math.floor(Math.random() * 255)}`;
}

function getNextStaffId(role) {
    const prefix = role === 'doctor' ? 'DOC' : role === 'receptionist' ? 'REC' : 'LAB';
    const existingIds = WorkforceState.staffMembers
        .filter(s => s.staffId.startsWith(prefix))
        .map(s => parseInt(s.staffId.slice(3)));

    return Math.max(...existingIds, 0) + 1;
}

function getStaffById(staffId) {
    return WorkforceState.staffMembers.find(s => s.staffId === staffId);
}

function refreshStaffGrid() {
    // Re-apply current filters and sort
    const searchTerm = document.getElementById('staffSearchInput')?.value;
    if (searchTerm) {
        handleSearch({ target: { value: searchTerm } });
    } else {
        renderStaffGrid();
    }
}

function updateStaffAccess() {
    // Update staff access based on new permissions
    console.log('Updating staff access based on new permissions...');

    // In a real implementation, this would update the backend
    // and notify affected staff members
}

function filterActivityFeed(filters) {
    // Apply filters to activity feed
    console.log('Filtering activity feed with:', filters);

    // In a real implementation, this would filter the displayed activities
}

function loadActivityLogs() {
    // Load activity logs from server
    console.log('Loading activity logs...');
}

function loadSystemAlerts() {
    // Load system alerts from server
    console.log('Loading system alerts...');
}

function loadPermissionMatrix() {
    // Load permission settings from server
    console.log('Loading permission matrix...');
}

function viewStaffDetails(staffId) {
    // Navigate to detailed staff view or open modal
    console.log('Viewing details for staff:', staffId);
    openPerformanceDashboard();
    document.getElementById('staffMemberSelector').value = staffId;
    updatePerformanceDisplay();
}

function contactStaffMember(staffId) {
    const staff = getStaffById(staffId);
    if (staff) {
        showToast(`Initiating contact with ${staff.fullName}...`, 'info');
        // In real implementation, this would open communication channel
    }
}

function showMoreOptions(staffId) {
    // Show additional options menu
    console.log('Showing more options for staff:', staffId);

    // Create a context menu or action sheet
    const options = [
        { label: 'View Full Profile', action: () => viewStaffDetails(staffId) },
        { label: 'Performance Report', action: () => generatePerformanceReport(staffId) },
        { label: 'Schedule Review', action: () => scheduleReview(staffId) },
        { label: 'Remove Staff', action: () => showRemovalConfirmation(staffId) }
    ];

    // In real implementation, show a context menu
    console.log('Available options:', options);
}

function generatePerformanceReport(staffId) {
    showToast('Generating performance report...', 'info');

    setTimeout(() => {
        showToast('Performance report generated and sent to your email', 'success');
    }, 2000);
}

function scheduleReview(staffId) {
    const staff = getStaffById(staffId);
    if (staff) {
        showToast(`Scheduling performance review for ${staff.fullName}...`, 'info');
    }
}

function toggleUserDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');

    // Close notifications panel if open
    document.getElementById('notificationsPanel')?.classList.remove('show');
}

function toggleNotificationsPanel(event) {
    event.stopPropagation();
    const panel = document.getElementById('notificationsPanel');
    panel.classList.toggle('show');

    // Close user dropdown if open
    document.getElementById('userDropdown')?.classList.remove('show');
}

function handleOutsideClick(event) {
    // Close dropdowns when clicking outside
    if (!event.target.closest('.user-profile-container')) {
        document.getElementById('userDropdown')?.classList.remove('show');
    }

    if (!event.target.closest('.notification-container') && !event.target.closest('.notifications-panel')) {
        document.getElementById('notificationsPanel')?.classList.remove('show');
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');

    // Update icon
    const icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Save preference
    localStorage.setItem('darkMode', isDarkMode);
}

// ====================================
// TOAST NOTIFICATIONS
// ====================================
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <h5 class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</h5>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <p class="toast-message">${message}</p>
    `;

    toastContainer.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// ====================================
// LOADING STATES
// ====================================
function showLoadingState(element) {
    element.classList.add('loading');
    element.disabled = true;

    // Add spinner if button
    if (element.tagName === 'BUTTON') {
        const originalContent = element.innerHTML;
        element.setAttribute('data-original-content', originalContent);
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
}

function hideLoadingState(element) {
    element.classList.remove('loading');
    element.disabled = false;

    // Restore original content if button
    if (element.tagName === 'BUTTON') {
        const originalContent = element.getAttribute('data-original-content');
        if (originalContent) {
            element.innerHTML = originalContent;
            element.removeAttribute('data-original-content');
        }
    }
}

// ====================================
// REAL-TIME UPDATES
// ====================================
function startRealTimeUpdates() {
    // Update activity feed periodically
    setInterval(() => {
        if (document.getElementById('activityFeedSection')?.style.display === 'block') {
            // Simulate new activity
            if (Math.random() > 0.7) {
                const activities = [
                    { user: 'Dr. Kamau', action: 'completed consultation with Patient #' + Math.floor(Math.random() * 2000) },
                    { user: 'Mary Wanjiku', action: 'registered new patient #' + Math.floor(Math.random() * 2000) },
                    { user: 'Dr. Wanjiru', action: 'updated prescription for Patient #' + Math.floor(Math.random() * 2000) }
                ];

                const randomActivity = activities[Math.floor(Math.random() * activities.length)];
                addActivityItem({
                    type: 'general',
                    user: randomActivity.user,
                    action: randomActivity.action,
                    timestamp: new Date()
                });
            }
        }
    }, WorkforceConfig.activityUpdateInterval);

    // Check for new alerts
    setInterval(() => {
        checkForNewAlerts();
    }, WorkforceConfig.refreshInterval);
}

function checkForNewAlerts() {
    // Simulate checking for new alerts
    console.log('Checking for new system alerts...');

    // In real implementation, this would check the server
}

// ====================================
// MODAL DATA LOADING
// ====================================
function loadModalData(modalId) {
    switch (modalId) {
        case 'rbacModal':
            loadPermissionSettings();
            break;
        case 'staffPerformanceModal':
            loadStaffPerformance();
            break;
        case 'advancedFilterModal':
            // Filter modal doesn't need data loading
            break;
    }
}

// ====================================
// GLOBAL ACTION HANDLERS
// ====================================
// These functions are called from modal buttons
window.contactStaff = function (staffId) {
    contactStaffMember(staffId);
};

window.checkAccessLogs = function (staffId) {
    showToast(`Checking access logs for ${staffId}...`, 'info');

    setTimeout(() => {
        showToast('No login attempts found in the last 7 days', 'warning');
    }, 1500);
};

window.suspendAccess = function (staffId) {
    openSuspensionModal(staffId);
    closeModal('alertActionModal');
};

window.scheduleMeeting = function (staffId) {
    showToast(`Opening calendar to schedule meeting with ${staffId}...`, 'info');
};

window.reviewSchedule = function (staffId) {
    showToast(`Loading schedule for ${staffId}...`, 'info');
};

window.reviewFeedback = function (staffId) {
    showToast(`Loading all feedback for ${staffId}...`, 'info');
};

window.provideFeedback = function (staffId) {
    showToast(`Opening coaching module for ${staffId}...`, 'info');
};

// ====================================
// INITIALIZATION CHECK
// ====================================
// Initialize dark mode from storage
(function initializeDarkModeFromStorage() {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('#darkModeToggle i');
        if (icon) {
            icon.className = 'fas fa-sun';
        }
    }
})();

// ====================================
// ERROR HANDLING
// ====================================
window.addEventListener('error', function (event) {
    console.error('Workforce Hub error:', event.error);
    showToast('An error occurred. Please refresh the page.', 'error');
});

// ====================================
// CLEANUP ON PAGE UNLOAD
// ====================================
window.addEventListener('beforeunload', function () {
    // Save any pending data
    console.log('Saving workforce hub state...');
});

console.log('Curis Workforce Hub JavaScript loaded successfully!');
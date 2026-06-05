// ====================================
// CURIS HEALTH DATA & RECORDS - COMPREHENSIVE JAVASCRIPT
// Modern Healthcare Data Management System
// Complete Implementation with All Features
// ====================================

// Global state management
const HealthDataState = {
    patients: [],
    filteredPatients: [],
    selectedPatient: null,
    currentView: 'overview',
    activeTab: 'appointments',
    searchQuery: '',
    filters: {
        date: 'all',
        gender: 'all',
        doctor: 'all',
        sort: 'name'
    },
    auditLog: [],
    permissions: {
        contactUpdate: true,
        recordView: true,
        billingDownload: false
    },
    portalAccess: true,
    notificationCount: 3
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
    initializeHealthDataSystem();
    setupEventListeners();
    loadPatientData();
    initializeModals();
    setupRealtimeSync();
    initializeAuditSystem();
});

// ====================================
// INITIALIZATION FUNCTIONS
// ====================================

function initializeHealthDataSystem() {
    console.log('Initializing Health Data & Records System...');

    // Initialize components
    initializePatientDirectory();
    initializeMedicalHistory();
    initializeActivityMonitoring();
    initializePermissions();
    initializeExportSystem();

    // Load saved preferences
    loadUserPreferences();

    // Set up tooltips
    initializeTooltips();

    // Initialize charts
    initializeWorkloadChart();
}

function setupEventListeners() {
    // User profile dropdown
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdown = document.getElementById('userDropdown');

    userProfileBtn?.addEventListener('click', function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    // Notifications
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationsPanel = document.getElementById('notificationsPanel');

    notificationBtn?.addEventListener('click', function (e) {
        e.stopPropagation();
        notificationsPanel.classList.toggle('show');
        markNotificationsAsRead();
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function () {
        userDropdown?.classList.remove('show');
        notificationsPanel?.classList.remove('show');
    });

    // Main button listeners
    setupMainButtonListeners();

    // Form listeners
    setupFormListeners();

    // Filter listeners
    setupFilterListeners();

    // Tab listeners
    setupTabListeners();

    // View toggle listeners
    setupViewToggleListeners();

    // Search functionality
    setupSearchFunctionality();

    // Permission toggles
    setupPermissionToggles();
}

function setupMainButtonListeners() {
    // Manual Registration
    const manualRegBtn = document.getElementById('manualRegBtn');
    manualRegBtn?.addEventListener('click', () => openModal('registrationModal'));

    // Filter Toggle
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    filterToggleBtn?.addEventListener('click', toggleFilterPanel);

    // View Appointments
    const viewAppointmentsBtn = document.getElementById('viewAppointmentsBtn');
    viewAppointmentsBtn?.addEventListener('click', viewAllAppointments);

    // Activity Details
    const activityDetailsBtn = document.getElementById('activityDetailsBtn');
    activityDetailsBtn?.addEventListener('click', showActivityDetails);

    // Sync Settings
    const syncSettingsBtn = document.getElementById('syncSettingsBtn');
    syncSettingsBtn?.addEventListener('click', openSyncSettings);

    // Reassign Patients
    const reassignBtn = document.getElementById('reassignBtn');
    reassignBtn?.addEventListener('click', openReassignModal);

    // Export Records
    const exportBtn = document.getElementById('exportBtn');
    exportBtn?.addEventListener('click', openExportModal);

    // RBAC Settings
    const auditSettingsBtn = document.getElementById('auditSettingsBtn');
    auditSettingsBtn?.addEventListener('click', openRBACSettings);

    // Quick Export Options
    document.querySelectorAll('.export-option-btn').forEach(btn => {
        btn.addEventListener('click', handleQuickExport);
    });

    // Modal close buttons
    const closeRegModal = document.getElementById('closeRegModal');
    closeRegModal?.addEventListener('click', () => closeModal('registrationModal'));

    const cancelRegBtn = document.getElementById('cancelRegBtn');
    cancelRegBtn?.addEventListener('click', () => closeModal('registrationModal'));
}

function setupFormListeners() {
    // Patient Registration Form
    const registrationForm = document.getElementById('patientRegistrationForm');
    registrationForm?.addEventListener('submit', handlePatientRegistration);

    // Real-time validation
    setupFormValidation();
}

function setupFilterListeners() {
    // Date Filter
    const dateFilter = document.getElementById('dateFilter');
    dateFilter?.addEventListener('change', handleFilterChange);

    // Gender Filter
    const genderFilter = document.getElementById('genderFilter');
    genderFilter?.addEventListener('change', handleFilterChange);

    // Doctor Filter
    const doctorFilter = document.getElementById('doctorFilter');
    doctorFilter?.addEventListener('change', handleFilterChange);

    // Sort Filter
    const sortFilter = document.getElementById('sortFilter');
    sortFilter?.addEventListener('change', handleSortChange);

    // Timeline Filters
    const timelineStart = document.getElementById('timelineStart');
    const timelineEnd = document.getElementById('timelineEnd');
    const eventTypeFilter = document.getElementById('eventTypeFilter');

    timelineStart?.addEventListener('change', filterTimeline);
    timelineEnd?.addEventListener('change', filterTimeline);
    eventTypeFilter?.addEventListener('change', filterTimeline);

    // Audit Filters
    const auditUserFilter = document.getElementById('auditUserFilter');
    const auditActionFilter = document.getElementById('auditActionFilter');

    auditUserFilter?.addEventListener('change', filterAuditLog);
    auditActionFilter?.addEventListener('change', filterAuditLog);
}

function setupTabListeners() {
    // Appointment & Billing Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleTabSwitch);
    });
}

function setupViewToggleListeners() {
    // Medical History View Toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', handleViewToggle);
    });
}

function setupSearchFunctionality() {
    const searchInput = document.getElementById('patientSearchInput');
    const searchResults = document.getElementById('searchResults');

    searchInput?.addEventListener('input', debounce(handlePatientSearch, 300));
    searchInput?.addEventListener('focus', () => {
        if (searchInput.value.trim()) {
            searchResults.style.display = 'block';
        }
    });

    // Close search results on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });
}

function setupPermissionToggles() {
    // Portal Access Toggle
    const portalAccess = document.getElementById('portalAccess');
    portalAccess?.addEventListener('change', handlePortalAccessToggle);

    // Permission Checkboxes
    const contactUpdate = document.getElementById('contactUpdate');
    const recordView = document.getElementById('recordView');
    const billingDownload = document.getElementById('billingDownload');

    contactUpdate?.addEventListener('change', (e) => updatePermission('contactUpdate', e.target.checked));
    recordView?.addEventListener('change', (e) => updatePermission('recordView', e.target.checked));
    billingDownload?.addEventListener('change', (e) => updatePermission('billingDownload', e.target.checked));
}

// ====================================
// PATIENT REGISTRATION
// ====================================

function handlePatientRegistration(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const patientData = {
        id: generatePatientId(),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        gender: formData.get('gender'),
        dob: formData.get('dob'),
        idType: formData.get('idType'),
        idNumber: formData.get('idNumber'),
        emergencyName: formData.get('emergencyName'),
        emergencyPhone: formData.get('emergencyPhone'),
        relationship: formData.get('relationship'),
        insuranceProvider: formData.get('insuranceProvider'),
        policyNumber: formData.get('policyNumber'),
        registrationDate: new Date().toISOString(),
        status: 'pending-verification'
    };

    // Validate required fields
    if (!validatePatientData(patientData)) {
        return;
    }

    // Save patient
    savePatient(patientData);

    // Log audit entry
    logAuditEntry('CREATE', 'Patient Registration', `Patient ID: ${patientData.id}`);

    // Close modal and reset form
    closeModal('registrationModal');
    e.target.reset();

    // Show success notification
    showNotification('success', `Patient ${patientData.firstName} ${patientData.lastName} registered successfully`);

    // Update metrics
    updateRegistrationMetrics();

    // Refresh patient list
    loadPatientData();
}

function validatePatientData(data) {
    const requiredFields = ['firstName', 'lastName', 'phone', 'gender', 'dob'];

    for (const field of requiredFields) {
        if (!data[field]) {
            showNotification('error', `Please fill in all required fields`);
            return false;
        }
    }

    // Validate phone number format
    const phoneRegex = /^\+?254\s?7\d{2}\s?\d{3}\s?\d{3}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
        showNotification('error', 'Please enter a valid phone number');
        return false;
    }

    // Validate email if provided
    if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('error', 'Please enter a valid email address');
            return false;
        }
    }

    return true;
}

function savePatient(patientData) {
    // Add to state
    HealthDataState.patients.push(patientData);

    // Save to localStorage (in production, this would be an API call)
    localStorage.setItem('patients', JSON.stringify(HealthDataState.patients));

    // Send notification to relevant parties
    sendNewPatientNotification(patientData);
}

function generatePatientId() {
    return 'PAT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function setupFormValidation() {
    // Real-time phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', formatPhoneNumber);
    });

    // Date of birth validation (not future dates)
    const dobInput = document.getElementById('dob');
    dobInput?.setAttribute('max', new Date().toISOString().split('T')[0]);
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.startsWith('254')) {
        value = value.substring(3);
    } else if (value.startsWith('0')) {
        value = value.substring(1);
    }

    if (value.length > 0) {
        value = '+254 ' + value;
    }

    // Format as +254 7XX XXX XXX
    if (value.length > 7) {
        value = value.substring(0, 7) + ' ' + value.substring(7);
    }
    if (value.length > 11) {
        value = value.substring(0, 11) + ' ' + value.substring(11);
    }
    if (value.length > 15) {
        value = value.substring(0, 15);
    }

    e.target.value = value;
}

// ====================================
// PATIENT DIRECTORY
// ====================================

function initializePatientDirectory() {
    // Load initial patient data
    loadPatientData();
}

function loadPatientData() {
    // Load from localStorage (in production, this would be an API call)
    const savedPatients = localStorage.getItem('patients');
    if (savedPatients) {
        HealthDataState.patients = JSON.parse(savedPatients);
    } else {
        // Load sample data
        HealthDataState.patients = generateSamplePatients();
    }

    // Apply filters and display
    applyFilters();
}

function generateSamplePatients() {
    return [
        {
            id: 'PAT-001',
            firstName: 'John',
            lastName: 'Kamau',
            phone: '+254 712 345 678',
            email: 'john.kamau@email.com',
            gender: 'male',
            dob: '1985-03-15',
            lastVisit: '2024-01-15',
            visits: 28,
            assignedDoctor: 'Dr. Johnson',
            status: 'active'
        },
        {
            id: 'PAT-002',
            firstName: 'Mary',
            lastName: 'Wanjiru',
            phone: '+254 723 456 789',
            email: 'mary.wanjiru@email.com',
            gender: 'female',
            dob: '1990-07-22',
            lastVisit: '2024-01-10',
            visits: 15,
            assignedDoctor: 'Dr. Smith',
            status: 'active'
        },
        {
            id: 'PAT-003',
            firstName: 'Peter',
            lastName: 'Ochieng',
            phone: '+254 734 567 890',
            email: 'peter.ochieng@email.com',
            gender: 'male',
            dob: '1978-11-30',
            lastVisit: '2023-12-20',
            visits: 42,
            assignedDoctor: 'Dr. Brown',
            status: 'active'
        }
    ];
}

function handlePatientSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    HealthDataState.searchQuery = query;

    if (!query) {
        document.getElementById('searchResults').style.display = 'none';
        applyFilters();
        return;
    }

    // Search patients by name, phone, or ID
    const searchResults = HealthDataState.patients.filter(patient => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const phone = patient.phone.replace(/\s/g, '');
        const id = patient.id.toLowerCase();

        return fullName.includes(query) ||
            phone.includes(query) ||
            id.includes(query);
    });

    displaySearchResults(searchResults);
}

function displaySearchResults(results) {
    const searchResultsContainer = document.getElementById('searchResults');

    if (results.length === 0) {
        searchResultsContainer.innerHTML = '<div class="no-results">No patients found</div>';
    } else {
        searchResultsContainer.innerHTML = results.map(patient => `
            <div class="search-result-item" onclick="selectPatient('${patient.id}')">
                <div class="patient-info">
                    <strong>${patient.firstName} ${patient.lastName}</strong>
                    <span>${patient.phone}</span>
                </div>
                <span class="patient-id">${patient.id}</span>
            </div>
        `).join('');
    }

    searchResultsContainer.style.display = 'block';
}

function selectPatient(patientId) {
    const patient = HealthDataState.patients.find(p => p.id === patientId);
    if (patient) {
        HealthDataState.selectedPatient = patient;
        displayPatientDetails(patient);
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('patientSearchInput').value = `${patient.firstName} ${patient.lastName}`;
    }
}

function toggleFilterPanel() {
    const filterPanel = document.getElementById('filterPanel');
    filterPanel?.classList.toggle('show');
}

function handleFilterChange(e) {
    const filterType = e.target.id.replace('Filter', '');
    HealthDataState.filters[filterType] = e.target.value;
    applyFilters();
}

function handleSortChange(e) {
    HealthDataState.filters.sort = e.target.value;
    applyFilters();
}

function applyFilters() {
    let filtered = [...HealthDataState.patients];

    // Apply search query
    if (HealthDataState.searchQuery) {
        const query = HealthDataState.searchQuery.toLowerCase();
        filtered = filtered.filter(patient => {
            const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
            return fullName.includes(query);
        });
    }

    // Apply date filter
    if (HealthDataState.filters.date !== 'all') {
        filtered = filterByDate(filtered, HealthDataState.filters.date);
    }

    // Apply gender filter
    if (HealthDataState.filters.gender !== 'all') {
        filtered = filtered.filter(p => p.gender === HealthDataState.filters.gender);
    }

    // Apply doctor filter
    if (HealthDataState.filters.doctor !== 'all') {
        filtered = filtered.filter(p => p.assignedDoctor === HealthDataState.filters.doctor);
    }

    // Apply sorting
    filtered = sortPatients(filtered, HealthDataState.filters.sort);

    HealthDataState.filteredPatients = filtered;
    displayPatientList(filtered);
}

function filterByDate(patients, dateFilter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return patients.filter(patient => {
        const registrationDate = new Date(patient.registrationDate || patient.lastVisit);

        switch (dateFilter) {
            case 'today':
                return registrationDate >= today;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return registrationDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return registrationDate >= monthAgo;
            default:
                return true;
        }
    });
}

function sortPatients(patients, sortBy) {
    return patients.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            case 'date':
                return new Date(b.registrationDate || b.lastVisit) - new Date(a.registrationDate || a.lastVisit);
            case 'visits':
                return (b.visits || 0) - (a.visits || 0);
            default:
                return 0;
        }
    });
}

function displayPatientList(patients) {
    const patientListContainer = document.getElementById('patientList');

    if (!patientListContainer) return;

    if (patients.length === 0) {
        patientListContainer.innerHTML = '<div class="no-patients">No patients found matching the criteria</div>';
        return;
    }

    patientListContainer.innerHTML = patients.map(patient => `
        <div class="patient-card" data-patient-id="${patient.id}">
            <div class="patient-card-header">
                <div class="patient-basic-info">
                    <h4>${patient.firstName} ${patient.lastName}</h4>
                    <p class="patient-id">${patient.id}</p>
                </div>
                <span class="patient-status ${patient.status}">${patient.status}</span>
            </div>
            <div class="patient-card-body">
                <div class="patient-detail">
                    <i class="fas fa-phone"></i>
                    <span>${patient.phone}</span>
                </div>
                <div class="patient-detail">
                    <i class="fas fa-calendar"></i>
                    <span>Last visit: ${formatDate(patient.lastVisit)}</span>
                </div>
                <div class="patient-detail">
                    <i class="fas fa-user-md"></i>
                    <span>${patient.assignedDoctor || 'Unassigned'}</span>
                </div>
            </div>
            <div class="patient-card-actions">
                <button class="action-btn" onclick="viewPatientProfile('${patient.id}')" title="View Profile">
                    <i class="fas fa-user"></i>
                </button>
                <button class="action-btn" onclick="viewPatientAppointments('${patient.id}')" title="View Appointments">
                    <i class="fas fa-calendar-check"></i>
                </button>
                <button class="action-btn" onclick="viewPatientBilling('${patient.id}')" title="View Billing">
                    <i class="fas fa-file-invoice"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ====================================
// MEDICAL HISTORY ACCESS
// ====================================

function initializeMedicalHistory() {
    // Set initial view
    HealthDataState.currentView = 'overview';
}

function handleViewToggle(e) {
    const view = e.target.dataset.view;

    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');

    // Hide all views
    document.querySelectorAll('.history-view').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    document.getElementById(`${view}View`)?.classList.add('active');

    HealthDataState.currentView = view;

    // Load view-specific data
    if (view === 'timeline') {
        loadTimelineData();
    }
}

function loadTimelineData() {
    // Load timeline events (in production, this would be an API call)
    const timelineContainer = document.querySelector('.timeline-container');
    if (!timelineContainer) return;

    const events = generateTimelineEvents();
    displayTimelineEvents(events);
}

function generateTimelineEvents() {
    return [
        {
            date: '2024-01-15',
            title: 'Annual Health Checkup',
            description: 'Routine examination completed',
            type: 'appointments'
        },
        {
            date: '2024-01-10',
            title: 'Blood Test Results',
            description: 'All parameters within normal range',
            type: 'procedures'
        },
        {
            date: '2023-12-10',
            title: 'Flu Treatment',
            description: 'Medication prescribed and follow-up scheduled',
            type: 'appointments'
        },
        {
            date: '2023-11-22',
            title: 'Follow-up Appointment',
            description: 'Recovery confirmed, treatment concluded',
            type: 'appointments'
        },
        {
            date: '2023-11-15',
            title: 'Prescription Issued',
            description: 'Antibiotics and pain relief medication',
            type: 'prescriptions'
        }
    ];
}

function displayTimelineEvents(events) {
    const timelineContainer = document.querySelector('.timeline-container');
    if (!timelineContainer) return;

    timelineContainer.innerHTML = events.map(event => `
        <div class="timeline-item" data-event-type="${event.type}">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="timeline-date">${formatDate(event.date)}</div>
                <div class="timeline-title">${event.title}</div>
                <div class="timeline-description">${event.description}</div>
            </div>
        </div>
    `).join('');
}

function filterTimeline() {
    const startDate = document.getElementById('timelineStart')?.value;
    const endDate = document.getElementById('timelineEnd')?.value;
    const eventType = document.getElementById('eventTypeFilter')?.value;

    const timelineItems = document.querySelectorAll('.timeline-item');

    timelineItems.forEach(item => {
        let show = true;

        // Filter by event type
        if (eventType !== 'all' && item.dataset.eventType !== eventType) {
            show = false;
        }

        // Filter by date range (if implemented)
        // Add date filtering logic here

        item.style.display = show ? 'block' : 'none';
    });
}

// ====================================
// APPOINTMENT & BILLING LINKAGE
// ====================================

function handleTabSwitch(e) {
    const tab = e.target.dataset.tab;

    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(`${tab}Tab`)?.classList.add('active');

    HealthDataState.activeTab = tab;
}

function viewAllAppointments() {
    // Navigate to appointments module
    window.location.href = '../Appointments/appointments.html';
}

function viewPatientAppointments(patientId) {
    // Navigate to appointments with patient filter
    window.location.href = `../Appointments/appointments.html?patient=${patientId}`;
}

function viewPatientBilling(patientId) {
    // Navigate to billing with patient filter
    window.location.href = `../Billings and Payments/billings_and_payments.html?patient=${patientId}`;
}

function viewPatientProfile(patientId) {
    const patient = HealthDataState.patients.find(p => p.id === patientId);
    if (patient) {
        displayPatientDetails(patient);
        logAuditEntry('VIEW', 'Patient Profile', `Patient ID: ${patientId}`);
    }
}

function displayPatientDetails(patient) {
    // Create and show patient details modal
    const modal = createPatientDetailsModal(patient);
    document.body.appendChild(modal);
    modal.classList.add('show');
}

// ====================================
// PATIENT ACTIVITY MONITORING
// ====================================

function showActivityDetails() {
    // Create and show activity details modal
    const modal = createActivityDetailsModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createActivityDetailsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Patient Activity Details</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="activity-stats-grid">
                    <div class="activity-stat-card">
                        <h4>Portal Access Frequency</h4>
                        <div class="stat-chart">
                            <canvas id="accessChart"></canvas>
                        </div>
                    </div>
                    <div class="activity-stat-card">
                        <h4>Appointment Compliance</h4>
                        <div class="compliance-metrics">
                            <div class="metric">
                                <span class="metric-label">Attended:</span>
                                <span class="metric-value">92%</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Cancelled:</span>
                                <span class="metric-value">5%</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">No-show:</span>
                                <span class="metric-value">3%</span>
                            </div>
                        </div>
                    </div>
                    <div class="activity-stat-card">
                        <h4>Feedback Trends</h4>
                        <div class="feedback-trend">
                            <div class="trend-item">
                                <span>Service Quality</span>
                                <div class="rating-bar">
                                    <div class="rating-fill" style="width: 88%"></div>
                                </div>
                            </div>
                            <div class="trend-item">
                                <span>Wait Time</span>
                                <div class="rating-bar">
                                    <div class="rating-fill" style="width: 75%"></div>
                                </div>
                            </div>
                            <div class="trend-item">
                                <span>Staff Behavior</span>
                                <div class="rating-bar">
                                    <div class="rating-fill" style="width: 95%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize chart after modal is added to DOM
    setTimeout(() => {
        initializeAccessChart();
    }, 100);

    return modal;
}

// ====================================
// PATIENT SELF-SERVICE SYNC
// ====================================

function handlePortalAccessToggle(e) {
    HealthDataState.portalAccess = e.target.checked;

    if (e.target.checked) {
        showNotification('success', 'Patient portal access enabled');
    } else {
        showNotification('warning', 'Patient portal access disabled');
    }

    // Update patient record
    if (HealthDataState.selectedPatient) {
        updatePatientPortalAccess(HealthDataState.selectedPatient.id, e.target.checked);
    }
}

function updatePermission(permission, value) {
    HealthDataState.permissions[permission] = value;

    // Log permission change
    logAuditEntry('UPDATE', 'Portal Permission', `${permission}: ${value}`);

    // Save to backend (in production)
    savePermissions();
}

function openSyncSettings() {
    // Create and show sync settings modal
    const modal = createSyncSettingsModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createSyncSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Patient Portal Sync Settings</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="sync-settings-content">
                    <div class="setting-section">
                        <h4>Sync Frequency</h4>
                        <select class="form-control">
                            <option value="realtime">Real-time</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                        </select>
                    </div>
                    <div class="setting-section">
                        <h4>Data Sync Options</h4>
                        <div class="sync-options">
                            <label class="checkbox-option">
                                <input type="checkbox" checked>
                                <span>Contact Information</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" checked>
                                <span>Appointment Requests</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox">
                                <span>Medical History Updates</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" checked>
                                <span>Feedback & Ratings</span>
                            </label>
                        </div>
                    </div>
                    <div class="setting-section">
                        <h4>Security Settings</h4>
                        <div class="security-options">
                            <label class="checkbox-option">
                                <input type="checkbox" checked>
                                <span>Require 2FA for sensitive data</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" checked>
                                <span>Log all access attempts</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox">
                                <span>Auto-logout after inactivity</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button type="button" class="btn-primary" onclick="saveSyncSettings()">Save Settings</button>
            </div>
        </div>
    `;
    return modal;
}

// ====================================
// STAFF-PATIENT RELATIONSHIP
// ====================================

function openReassignModal() {
    // Create and show reassignment modal
    const modal = createReassignModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createReassignModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Reassign Patients</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="reassign-form">
                    <div class="form-group">
                        <label>From Doctor</label>
                        <select class="form-control" id="fromDoctor">
                            <option value="">Select Doctor</option>
                            <option value="dr-johnson">Dr. Johnson (234 patients)</option>
                            <option value="dr-smith">Dr. Smith (156 patients)</option>
                            <option value="dr-brown">Dr. Brown (198 patients)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>To Doctor</label>
                        <select class="form-control" id="toDoctor">
                            <option value="">Select Doctor</option>
                            <option value="dr-johnson">Dr. Johnson</option>
                            <option value="dr-smith">Dr. Smith</option>
                            <option value="dr-brown">Dr. Brown</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Patient Selection</label>
                        <div class="patient-selection-options">
                            <label class="radio-option">
                                <input type="radio" name="patientSelection" value="all" checked>
                                <span>All Patients</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="patientSelection" value="specific">
                                <span>Specific Patients</span>
                            </label>
                        </div>
                    </div>
                    <div class="form-group" id="patientListSection" style="display: none;">
                        <label>Select Patients</label>
                        <div class="patient-checklist">
                            <!-- Patient list will be populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button type="button" class="btn-primary" onclick="performReassignment()">Reassign Patients</button>
            </div>
        </div>
    `;

    // Add event listeners
    const radios = modal.querySelectorAll('input[name="patientSelection"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const patientListSection = modal.querySelector('#patientListSection');
            patientListSection.style.display = e.target.value === 'specific' ? 'block' : 'none';
        });
    });

    return modal;
}

function initializeWorkloadChart() {
    // Initialize workload distribution chart
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach(bar => {
        bar.addEventListener('click', () => {
            const doctorName = bar.querySelector('.bar-label').textContent;
            showDoctorPatientList(doctorName);
        });
    });
}

// ====================================
// DATA EXPORT & PORTABILITY
// ====================================

function openExportModal() {
    // Create and show export modal
    const modal = createExportModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createExportModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Export Patient Records</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="export-configuration">
                    <div class="form-section">
                        <h4>Data Selection</h4>
                        <div class="form-group">
                            <label>Patient Group</label>
                            <select class="form-control" id="patientGroup">
                                <option value="all">All Patients</option>
                                <option value="active">Active Patients Only</option>
                                <option value="dateRange">By Date Range</option>
                                <option value="specific">Specific Patients</option>
                            </select>
                        </div>
                        <div class="form-group" id="dateRangeSection" style="display: none;">
                            <label>Date Range</label>
                            <div class="date-range-inputs">
                                <input type="date" class="form-control" id="exportStartDate">
                                <span>to</span>
                                <input type="date" class="form-control" id="exportEndDate">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Field Selection</h4>
                        <div class="field-selection">
                            <label class="checkbox-option">
                                <input type="checkbox" checked>
                                <span>Basic Information</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" checked>
                                <span>Contact Details</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox">
                                <span>Medical History (Metadata Only)</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" checked>
                                <span>Appointment History</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox">
                                <span>Billing Summary</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Export Format</h4>
                        <div class="format-options">
                            <label class="radio-option">
                                <input type="radio" name="exportFormat" value="csv" checked>
                                <span>CSV (Spreadsheet)</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="exportFormat" value="pdf">
                                <span>PDF (Report)</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="exportFormat" value="json">
                                <span>JSON (Data Transfer)</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="export-notice">
                        <i class="fas fa-info-circle"></i>
                        <p>Exported files will be encrypted and watermarked for security. An audit log entry will be created for this export.</p>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button type="button" class="btn-primary" onclick="performDataExport()">Generate Export</button>
            </div>
        </div>
    `;

    // Add event listener for patient group selection
    const patientGroup = modal.querySelector('#patientGroup');
    patientGroup.addEventListener('change', (e) => {
        const dateRangeSection = modal.querySelector('#dateRangeSection');
        dateRangeSection.style.display = e.target.value === 'dateRange' ? 'block' : 'none';
    });

    return modal;
}

function handleQuickExport(e) {
    const exportType = e.currentTarget.dataset.export;

    switch (exportType) {
        case 'all-patients':
            exportAllPatients();
            break;
        case 'recent-activity':
            exportRecentActivity();
            break;
        case 'billing-summary':
            exportBillingSummary();
            break;
    }
}

function performDataExport() {
    showNotification('info', 'Preparing export...');

    // Simulate export process
    setTimeout(() => {
        // Generate export file
        const exportData = prepareExportData();
        const format = document.querySelector('input[name="exportFormat"]:checked').value;

        // Log audit entry
        logAuditEntry('EXPORT', 'Patient Data Export', `Format: ${format}, Records: ${exportData.length}`);

        // Trigger download
        downloadExportFile(exportData, format);

        showNotification('success', 'Export completed successfully');

        // Close modal
        document.querySelector('.modal')?.remove();
    }, 2000);
}

// ====================================
// AUDIT TRAIL & COMPLIANCE
// ====================================

function initializeAuditSystem() {
    // Load audit log
    loadAuditLog();

    // Start audit monitoring
    startAuditMonitoring();
}

function logAuditEntry(action, target, details) {
    const entry = {
        id: generateAuditId(),
        user: 'Dr. Sarah Wilson', // In production, get from auth
        action: action,
        target: target,
        details: details,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.1' // In production, get actual IP
    };

    HealthDataState.auditLog.push(entry);

    // Save to backend (in production)
    saveAuditEntry(entry);

    // Update audit display if visible
    updateAuditDisplay();
}

function generateAuditId() {
    return 'AUD-' + Date.now().toString(36).toUpperCase();
}

function loadAuditLog() {
    // Load from localStorage (in production, from API)
    const savedLog = localStorage.getItem('auditLog');
    if (savedLog) {
        HealthDataState.auditLog = JSON.parse(savedLog);
    }
}

function filterAuditLog() {
    const userFilter = document.getElementById('auditUserFilter')?.value;
    const actionFilter = document.getElementById('auditActionFilter')?.value;

    let filtered = [...HealthDataState.auditLog];

    if (userFilter !== 'all') {
        // Filter by user type
        filtered = filtered.filter(entry => {
            if (userFilter === 'doctors') return entry.user.includes('Dr.');
            if (userFilter === 'staff') return !entry.user.includes('Dr.');
            return true;
        });
    }

    if (actionFilter !== 'all') {
        filtered = filtered.filter(entry => entry.action.toLowerCase() === actionFilter);
    }

    displayAuditEntries(filtered);
}

function displayAuditEntries(entries) {
    const auditContainer = document.querySelector('.audit-entries');
    if (!auditContainer) return;

    auditContainer.innerHTML = entries.slice(0, 10).map(entry => `
        <div class="audit-entry">
            <div class="entry-info">
                <span class="entry-user">${entry.user}</span>
                <span class="entry-action">${entry.action} ${entry.target}</span>
                <span class="entry-target">${entry.details}</span>
            </div>
            <span class="entry-time">${formatTime(entry.timestamp)}</span>
        </div>
    `).join('');
}

function openRBACSettings() {
    // Create and show RBAC settings modal
    const modal = createRBACModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createRBACModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3 class="modal-title">Role-Based Access Control Settings</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="rbac-configuration">
                    <div class="role-section">
                        <h4>Clinic Owner Permissions</h4>
                        <div class="permission-matrix">
                            <div class="permission-row">
                                <span class="permission-name">View Patient List</span>
                                <span class="permission-status granted">✓ Granted</span>
                            </div>
                            <div class="permission-row">
                                <span class="permission-name">View Medical Details</span>
                                <span class="permission-status restricted">⚠ Metadata Only</span>
                            </div>
                            <div class="permission-row">
                                <span class="permission-name">Export Data</span>
                                <span class="permission-status granted">✓ Granted</span>
                            </div>
                            <div class="permission-row">
                                <span class="permission-name">Manage Staff</span>
                                <span class="permission-status granted">✓ Granted</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="role-section">
                        <h4>Doctor Permissions</h4>
                        <div class="permission-matrix">
                            <div class="permission-row">
                                <span class="permission-name">View Patient Records</span>
                                <span class="permission-status granted">✓ Full Access</span>
                            </div>
                            <div class="permission-row">
                                <span class="permission-name">Edit Medical Records</span>
                                <span class="permission-status granted">✓ Granted</span>
                            </div>
                            <div class="permission-row">
                                <span class="permission-name">Export Data</span>
                                <span class="permission-status restricted">⚠ Own Patients Only</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="role-section">
                        <h4>Receptionist Permissions</h4>
                        <div class="permission-matrix">
                            <div class="permission-row">
                                <span class="permission-name">View Patient List</span>
                                <span class="permission-status granted">✓ Granted</span>
                            </div>
                            <div class="permission-row">
                                <span class="permission-name">Edit Contact Info</span>
                                <span class="permission-status granted">✓ Granted</span>
                            </div>
                            <div class="permission-row">
                                <span class="permission-name">View Medical Records</span>
                                <span class="permission-status denied">✗ Denied</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button type="button" class="btn-primary" onclick="saveRBACSettings()">Save Changes</button>
            </div>
        </div>
    `;
    return modal;
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to notification container
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        document.body.appendChild(container);
    }

    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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

// ====================================
// DATA PERSISTENCE
// ====================================

function loadUserPreferences() {
    try {
        const preferences = localStorage.getItem('healthDataPreferences');
        if (preferences) {
            const parsed = JSON.parse(preferences);
            Object.assign(HealthDataState, parsed);
        }
    } catch (e) {
        console.error('Failed to load preferences:', e);
    }
}

function saveUserPreferences() {
    try {
        localStorage.setItem('healthDataPreferences', JSON.stringify(HealthDataState));
    } catch (e) {
        console.error('Failed to save preferences:', e);
    }
}

function savePermissions() {
    // Save to backend (in production)
    localStorage.setItem('portalPermissions', JSON.stringify(HealthDataState.permissions));
}

function saveAuditEntry(entry) {
    // Save to backend (in production)
    const currentLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
    currentLog.push(entry);
    localStorage.setItem('auditLog', JSON.stringify(currentLog));
}

// ====================================
// REAL-TIME SYNC
// ====================================

function setupRealtimeSync() {
    // Simulate real-time data sync
    setInterval(() => {
        // Check for updates
        checkForUpdates();
    }, 30000); // Check every 30 seconds
}

function checkForUpdates() {
    // In production, this would check for server updates
    const indicator = document.getElementById('autoRefreshIndicator');
    if (indicator) {
        indicator.classList.add('show');
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }
}

// ====================================
// EXPORT FUNCTIONS
// ====================================

function prepareExportData() {
    const patients = HealthDataState.filteredPatients.length > 0 ?
        HealthDataState.filteredPatients : HealthDataState.patients;

    return patients.map(patient => ({
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
        email: patient.email,
        gender: patient.gender,
        dateOfBirth: patient.dob,
        lastVisit: patient.lastVisit,
        totalVisits: patient.visits,
        assignedDoctor: patient.assignedDoctor,
        status: patient.status
    }));
}

function downloadExportFile(data, format) {
    let content, filename, mimeType;

    switch (format) {
        case 'csv':
            content = convertToCSV(data);
            filename = `patient_records_${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
            break;
        case 'json':
            content = JSON.stringify(data, null, 2);
            filename = `patient_records_${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
            break;
        case 'pdf':
            // In production, use a PDF library
            showNotification('info', 'PDF export would be generated here');
            return;
    }

    // Create download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ?
                `"${value}"` : value;
        }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
}

// ====================================
// NOTIFICATION FUNCTIONS
// ====================================

function markNotificationsAsRead() {
    setTimeout(() => {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });

        // Update badge
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = '0';
        }

        HealthDataState.notificationCount = 0;
    }, 3000);
}

function sendNewPatientNotification(patientData) {
    // Add notification to panel
    const notificationsList = document.querySelector('.notifications-list');
    if (notificationsList) {
        const newNotification = document.createElement('div');
        newNotification.className = 'notification-item unread';
        newNotification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-user-plus"></i>
            </div>
            <div class="notification-content">
                <h5>New Patient Registration</h5>
                <p>${patientData.firstName} ${patientData.lastName} has been registered and requires verification.</p>
                <span class="notification-time">Just now</span>
            </div>
        `;

        notificationsList.insertBefore(newNotification, notificationsList.firstChild);

        // Update badge
        HealthDataState.notificationCount++;
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = HealthDataState.notificationCount;
        }
    }
}

// ====================================
// ADDITIONAL HELPER FUNCTIONS
// ====================================

function updateRegistrationMetrics() {
    // Update registration stats
    const totalPatients = document.querySelector('.stat-value');
    if (totalPatients) {
        totalPatients.textContent = HealthDataState.patients.length;
    }

    // Update today's registrations
    const today = new Date().toISOString().split('T')[0];
    const todayRegistrations = HealthDataState.patients.filter(p =>
        p.registrationDate && p.registrationDate.startsWith(today)
    ).length;

    const todayElement = document.querySelectorAll('.stat-value')[1];
    if (todayElement) {
        todayElement.textContent = todayRegistrations;
    }
}

function updatePatientPortalAccess(patientId, enabled) {
    const patient = HealthDataState.patients.find(p => p.id === patientId);
    if (patient) {
        patient.portalAccess = enabled;
        savePatientData();
    }
}

function savePatientData() {
    localStorage.setItem('patients', JSON.stringify(HealthDataState.patients));
}

function performReassignment() {
    const fromDoctor = document.getElementById('fromDoctor')?.value;
    const toDoctor = document.getElementById('toDoctor')?.value;
    const patientSelection = document.querySelector('input[name="patientSelection"]:checked')?.value;

    if (!fromDoctor || !toDoctor) {
        showNotification('error', 'Please select both source and destination doctors');
        return;
    }

    if (fromDoctor === toDoctor) {
        showNotification('error', 'Source and destination doctors cannot be the same');
        return;
    }

    // Perform reassignment
    let reassignedCount = 0;
    HealthDataState.patients.forEach(patient => {
        if (patient.assignedDoctor === fromDoctor) {
            if (patientSelection === 'all') {
                patient.assignedDoctor = toDoctor;
                reassignedCount++;
            }
            // Handle specific patient selection
        }
    });

    // Log audit entry
    logAuditEntry('REASSIGN', 'Patient Reassignment', `${reassignedCount} patients from ${fromDoctor} to ${toDoctor}`);

    // Save changes
    savePatientData();

    // Update displays
    loadPatientData();
    updateWorkloadChart();

    showNotification('success', `Successfully reassigned ${reassignedCount} patients`);

    // Close modal
    document.querySelector('.modal')?.remove();
}

function saveSyncSettings() {
    // Save sync settings
    showNotification('success', 'Sync settings saved successfully');
    document.querySelector('.modal')?.remove();
}

function saveRBACSettings() {
    // Save RBAC settings
    showNotification('success', 'Access control settings updated successfully');
    logAuditEntry('UPDATE', 'RBAC Settings', 'Role permissions modified');
    document.querySelector('.modal')?.remove();
}

function exportAllPatients() {
    const data = prepareExportData();
    downloadExportFile(data, 'csv');
    logAuditEntry('EXPORT', 'Quick Export', 'All patients CSV');
}

function exportRecentActivity() {
    // Prepare recent activity data
    showNotification('info', 'Generating activity report...');
    setTimeout(() => {
        showNotification('success', 'Activity report exported successfully');
        logAuditEntry('EXPORT', 'Quick Export', 'Recent activity PDF');
    }, 1500);
}

function exportBillingSummary() {
    // Navigate to billing module for export
    window.location.href = '../Billings and Payments/billings_and_payments.html?export=true';
}

function showDoctorPatientList(doctorName) {
    // Filter patients by doctor and display
    HealthDataState.filters.doctor = doctorName.toLowerCase().replace(/\s/g, '-');
    applyFilters();

    // Scroll to patient list
    document.getElementById('patientList')?.scrollIntoView({ behavior: 'smooth' });
}

function createPatientDetailsModal(patient) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Patient Profile: ${patient.firstName} ${patient.lastName}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="patient-profile-content">
                    <div class="profile-section">
                        <h4>Basic Information</h4>
                        <div class="profile-details">
                            <div class="detail-row">
                                <span class="detail-label">Patient ID:</span>
                                <span class="detail-value">${patient.id}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Gender:</span>
                                <span class="detail-value">${patient.gender}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Date of Birth:</span>
                                <span class="detail-value">${formatDate(patient.dob)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Status:</span>
                                <span class="detail-value status-badge ${patient.status}">${patient.status}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h4>Contact Information</h4>
                        <div class="profile-details">
                            <div class="detail-row">
                                <span class="detail-label">Phone:</span>
                                <span class="detail-value">${patient.phone}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Email:</span>
                                <span class="detail-value">${patient.email || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h4>Medical Overview</h4>
                        <div class="profile-details">
                            <div class="detail-row">
                                <span class="detail-label">Total Visits:</span>
                                <span class="detail-value">${patient.visits || 0}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Last Visit:</span>
                                <span class="detail-value">${formatDate(patient.lastVisit)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Assigned Doctor:</span>
                                <span class="detail-value">${patient.assignedDoctor || 'Unassigned'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button type="button" class="btn-primary" onclick="editPatientProfile('${patient.id}')">Edit Profile</button>
            </div>
        </div>
    `;
    return modal;
}

function editPatientProfile(patientId) {
    // Navigate to edit mode or show edit form
    showNotification('info', 'Edit functionality would be implemented here');
}

function updateAuditDisplay() {
    const auditEntries = document.querySelector('.audit-entries');
    if (auditEntries) {
        displayAuditEntries(HealthDataState.auditLog);
    }
}

function initializeTooltips() {
    // Initialize tooltips for better UX
    document.querySelectorAll('[title]').forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('title');
    tooltip.style.cssText = `
        position: absolute;
        background: var(--primary-navy);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 0.8rem;
        z-index: 9999;
    `;

    document.body.appendChild(tooltip);

    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';

    e.target.tooltip = tooltip;
}

function hideTooltip(e) {
    if (e.target.tooltip) {
        e.target.tooltip.remove();
        delete e.target.tooltip;
    }
}

function initializeAccessChart() {
    // Initialize access frequency chart
    // In production, use a charting library like Chart.js
    const canvas = document.getElementById('accessChart');
    if (canvas) {
        // Simulate chart rendering
        canvas.style.background = 'linear-gradient(to top, #00BFA5 0%, #14B8A6 100%)';
        canvas.style.height = '100px';
        canvas.style.borderRadius = '8px';
    }
}

function startAuditMonitoring() {
    // Monitor user actions for audit logging
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-audit]');
        if (target) {
            const action = target.dataset.audit;
            logAuditEntry('CLICK', action, `User interaction logged`);
        }
    });
}

// ====================================
// CSS INJECTION FOR DYNAMIC ELEMENTS
// ====================================

const dynamicStyles = `
<style>
    .notification-toast {
        background: var(--white);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-sm);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-toast.success {
        border-left: 4px solid var(--success-green);
    }
    
    .notification-toast.error {
        border-left: 4px solid var(--error-red);
    }
    
    .notification-toast.warning {
        border-left: 4px solid var(--warning-yellow);
    }
    
    .notification-toast.info {
        border-left: 4px solid var(--accent-teal);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--medium-gray);
        cursor: pointer;
        padding: var(--spacing-xs);
    }
    
    .patient-card {
        background: var(--white);
        border: 1px solid var(--light-gray);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-md);
        transition: all var(--transition-fast);
    }
    
    .patient-card:hover {
        border-color: var(--accent-teal);
        box-shadow: var(--shadow-md);
    }
    
    .patient-card-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: var(--spacing-md);
    }
    
    .patient-basic-info h4 {
        color: var(--primary-navy);
        margin-bottom: var(--spacing-xs);
    }
    
    .patient-id {
        color: var(--medium-gray);
        font-size: 0.85rem;
    }
    
    .patient-status {
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: var(--font-weight-semibold);
    }
    
    .patient-status.active {
        background: var(--success-green);
        color: var(--white);
    }
    
    .patient-status.pending-verification {
        background: var(--warning-yellow);
        color: var(--primary-navy);
    }
    
    .patient-card-body {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
    }
    
    .patient-detail {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        color: var(--charcoal-gray);
        font-size: 0.9rem;
    }
    
    .patient-detail i {
        color: var(--accent-teal);
    }
    
    .patient-card-actions {
        display: flex;
        gap: var(--spacing-sm);
    }
    
    .action-btn {
        background: var(--navy-50);
        border: 1px solid var(--navy-200);
        border-radius: var(--radius-sm);
        padding: var(--spacing-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
    }
    
    .action-btn:hover {
        background: var(--accent-teal);
        color: var(--white);
        border-color: var(--accent-teal);
    }
    
    .no-patients {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--medium-gray);
    }
    
    .search-result-item {
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--light-gray);
        cursor: pointer;
        transition: background-color var(--transition-fast);
    }
    
    .search-result-item:hover {
        background: var(--navy-50);
    }
    
    .search-result-item:last-child {
        border-bottom: none;
    }
    
    .no-results {
        padding: var(--spacing-md);
        text-align: center;
        color: var(--medium-gray);
    }
    
    .modal.large .modal-content {
        max-width: 1000px;
    }
    
    .activity-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--spacing-lg);
    }
    
    .activity-stat-card {
        background: var(--navy-50);
        padding: var(--spacing-lg);
        border-radius: var(--radius-md);
    }
    
    .compliance-metrics {
        display: grid;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
    }
    
    .metric {
        display: flex;
        justify-content: space-between;
        padding: var(--spacing-sm);
        background: var(--white);
        border-radius: var(--radius-sm);
    }
    
    .feedback-trend {
        display: grid;
        gap: var(--spacing-md);
        margin-top: var(--spacing-md);
    }
    
    .trend-item {
        display: grid;
        grid-template-columns: 100px 1fr;
        align-items: center;
        gap: var(--spacing-md);
    }
    
    .rating-bar {
        background: var(--white);
        height: 20px;
        border-radius: var(--radius-sm);
        overflow: hidden;
    }
    
    .rating-fill {
        background: var(--accent-teal);
        height: 100%;
        transition: width var(--transition-normal);
    }
    
    .sync-settings-content {
        display: grid;
        gap: var(--spacing-xl);
    }
    
    .setting-section {
        background: var(--navy-50);
        padding: var(--spacing-lg);
        border-radius: var(--radius-md);
    }
    
    .sync-options,
    .security-options {
        display: grid;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
    }
    
    .checkbox-option {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: var(--white);
        border-radius: var(--radius-sm);
        cursor: pointer;
    }
    
    .checkbox-option:hover {
        background: var(--teal-50);
    }
    
    .reassign-form {
        display: grid;
        gap: var(--spacing-lg);
    }
    
    .patient-selection-options {
        display: grid;
        gap: var(--spacing-sm);
    }
    
    .radio-option {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: var(--navy-50);
        border-radius: var(--radius-sm);
        cursor: pointer;
    }
    
    .export-configuration {
        display: grid;
        gap: var(--spacing-xl);
    }
    
    .field-selection,
    .format-options {
        display: grid;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
    }
    
    .export-notice {
        background: var(--teal-50);
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }
    
    .export-notice i {
        color: var(--accent-teal);
    }
    
    .rbac-configuration {
        display: grid;
        gap: var(--spacing-xl);
    }
    
    .role-section {
        background: var(--navy-50);
        padding: var(--spacing-lg);
        border-radius: var(--radius-md);
    }
    
    .permission-matrix {
        display: grid;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
    }
    
    .permission-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--white);
        border-radius: var(--radius-sm);
    }
    
    .permission-status {
        font-size: 0.85rem;
        font-weight: var(--font-weight-semibold);
    }
    
    .permission-status.granted {
        color: var(--success-green);
    }
    
    .permission-status.restricted {
        color: var(--warning-yellow);
    }
    
    .permission-status.denied {
        color: var(--error-red);
    }
    
    .patient-profile-content {
        display: grid;
        gap: var(--spacing-xl);
    }
    
    .profile-section {
        background: var(--navy-50);
        padding: var(--spacing-lg);
        border-radius: var(--radius-md);
    }
    
    .profile-details {
        display: grid;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
    }
    
    .detail-row {
        display: flex;
        justify-content: space-between;
        padding: var(--spacing-sm);
        background: var(--white);
        border-radius: var(--radius-sm);
    }
    
    .detail-label {
        color: var(--medium-gray);
        font-weight: var(--font-weight-medium);
    }
    
    .detail-value {
        color: var(--primary-navy);
        font-weight: var(--font-weight-semibold);
    }
    
    .tooltip {
        pointer-events: none;
    }
</style>
`;

document.head.insertAdjacentHTML('beforeend', dynamicStyles);

// ====================================
// ERROR HANDLING
// ====================================

window.addEventListener('error', function (e) {
    console.error('Global error:', e.error);
    showNotification('error', 'An unexpected error occurred. Please try again.');
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('error', 'An unexpected error occurred. Please try again.');
});
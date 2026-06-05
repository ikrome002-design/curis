/* ===============================================
   CURIS PATIENT DIRECTORY JAVASCRIPT
   Receptionist & Clinic Assistant Interface
   Version: 1.0
   =============================================== */

// ===============================================
// GLOBAL STATE MANAGEMENT
// ===============================================
const appState = {
    currentUser: {
        id: 'USR-2025-001',
        name: 'Sarah Wanjiru',
        role: 'Receptionist',
        ipAddress: null
    },
    patients: [],
    currentPatient: null,
    currentStep: 1,
    totalSteps: 4,
    filters: {
        searchTerm: '',
        sortBy: 'name-asc',
        viewType: 'grid',
        frequency: [],
        ageMin: null,
        ageMax: null,
        gender: '',
        insurance: '',
        outstandingBills: ''
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 248,
        totalPages: 13
    },
    auditLog: []
};

// Sample patient data
const samplePatients = [
    {
        id: 'PAT-2025-001',
        name: 'John Kamau',
        phone: '0722-123-456',
        email: 'john.kamau@email.com',
        age: 34,
        gender: 'Male',
        dateOfBirth: '15/03/1991',
        lastVisit: '2025-09-15',
        registrationDate: '2023-01-12',
        insurance: { status: 'active', provider: 'Jubilee Insurance', policyNumber: 'JUB-2025-45678', validUntil: '31/12/2025' },
        outstanding: 0,
        photo: 'icons8-profile-picture-80.png',
        emergencyContact: { name: 'Jane Kamau', relationship: 'Spouse', phone: '0722-555-666' },
        alternativeContact: '0733-987-654',
        address: '123 Westlands, Nairobi',
        visitFrequency: 'monthly'
    },
    {
        id: 'PAT-2025-002',
        name: 'Grace Wanjiru',
        phone: '0733-456-789',
        email: 'grace.wanjiru@email.com',
        age: 28,
        gender: 'Female',
        dateOfBirth: '20/06/1997',
        lastVisit: '2025-09-28',
        registrationDate: '2024-05-10',
        insurance: { status: 'active', provider: 'AAR Insurance', policyNumber: 'AAR-2025-12345', validUntil: '30/11/2025' },
        outstanding: 0,
        photo: 'icons8-profile-picture-80.png',
        emergencyContact: { name: 'Peter Wanjiru', relationship: 'Brother', phone: '0711-222-333' },
        alternativeContact: '0722-888-999',
        address: '456 Kilimani, Nairobi',
        visitFrequency: 'weekly'
    },
    {
        id: 'PAT-2025-003',
        name: 'Peter Ochieng',
        phone: '0712-987-654',
        email: 'peter.ochieng@email.com',
        age: 45,
        gender: 'Male',
        dateOfBirth: '10/11/1980',
        lastVisit: '2025-08-10',
        registrationDate: '2022-03-15',
        insurance: { status: 'expired', provider: 'Madison Insurance', policyNumber: 'MAD-2024-98765', validUntil: '01/08/2025' },
        outstanding: 3500,
        photo: 'icons8-profile-picture-80.png',
        emergencyContact: { name: 'Mary Ochieng', relationship: 'Wife', phone: '0733-444-555' },
        alternativeContact: '0700-111-222',
        address: '789 Parklands, Nairobi',
        visitFrequency: 'rarely'
    },
    {
        id: 'PAT-2025-004',
        name: 'Mary Njeri',
        phone: '0724-555-123',
        email: 'mary.njeri@email.com',
        age: 52,
        gender: 'Female',
        dateOfBirth: '05/02/1973',
        lastVisit: '2025-09-29',
        registrationDate: '2021-11-20',
        insurance: { status: 'active', provider: 'CIC Insurance', policyNumber: 'CIC-2025-54321', validUntil: '31/12/2025' },
        outstanding: 0,
        photo: 'icons8-profile-picture-80.png',
        emergencyContact: { name: 'David Njeri', relationship: 'Son', phone: '0755-666-777' },
        alternativeContact: '0744-888-999',
        address: '321 Karen, Nairobi',
        visitFrequency: 'monthly'
    }
];

// ===============================================
// INITIALIZATION
// ===============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('Patient Directory Initializing...');

    // Get user IP address
    getUserIPAddress();

    // Initialize patients data
    appState.patients = [...samplePatients];

    // Initialize all components
    initializeEventListeners();
    initializeSearch();
    initializeFilters();
    initializePagination();
    initializeModals();
    initializeProfilePopup();
    initializeDarkMode();

    // Render initial patient list
    renderPatientList();

    // Log initialization
    logAuditAction('page_access', null, 'Accessed Patient Directory page');

    console.log('Patient Directory Initialized Successfully');
});

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

// Get User IP Address
function getUserIPAddress() {
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            appState.currentUser.ipAddress = data.ip;
        })
        .catch(() => {
            appState.currentUser.ipAddress = '127.0.0.1';
        });
}

// Audit Logging
function logAuditAction(action, patientId, details) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        userId: appState.currentUser.id,
        userName: appState.currentUser.name,
        action: action,
        patientId: patientId,
        details: details,
        ipAddress: appState.currentUser.ipAddress || 'Unknown',
        sessionId: generateSessionId()
    };

    appState.auditLog.push(logEntry);
    console.log('Audit Log:', logEntry);

    // Show audit notification briefly
    showAuditNotification();
}

function generateSessionId() {
    return 'SESSION-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function showAuditNotification() {
    const notification = document.getElementById('auditNotification');
    if (notification) {
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Calculate age
function calculateAge(dateOfBirth) {
    const dob = new Date(dateOfBirth.split('/').reverse().join('-'));
    const diff = Date.now() - dob.getTime();
    const age = new Date(diff);
    return Math.abs(age.getUTCFullYear() - 1970);
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#F59E0B'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===============================================
// EVENT LISTENERS
// ===============================================
function initializeEventListeners() {
    // Notification button
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            showNotification('You have 3 new notifications', 'info');
        });
    }

    // User profile
    const userProfile = document.getElementById('userProfile');
    if (userProfile) {
        userProfile.addEventListener('click', toggleProfilePopup);
    }

    // Close modals when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// ===============================================
// SEARCH FUNCTIONALITY
// ===============================================
function initializeSearch() {
    const searchInput = document.getElementById('patientSearchInput');
    if (searchInput) {
        // Real-time search with debounce
        let searchTimeout;
        searchInput.addEventListener('input', function (e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                appState.filters.searchTerm = e.target.value.toLowerCase();
                renderPatientList();
            }, 300);
        });

        // Voice search button
        const voiceBtn = document.querySelector('.voice-input-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', startVoiceSearch);
        }

        // Search button
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                renderPatientList();
            });
        }
    }
}

function startVoiceSearch() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.continuous = false;

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('patientSearchInput').value = transcript;
            appState.filters.searchTerm = transcript.toLowerCase();
            renderPatientList();
            showNotification('Voice search: ' + transcript, 'success');
        };

        recognition.onerror = function () {
            showNotification('Voice search not available', 'error');
        };

        recognition.start();
        showNotification('Listening...', 'info');
    } else {
        showNotification('Voice search not supported in this browser', 'error');
    }
}

// ===============================================
// FILTER FUNCTIONALITY
// ===============================================
function initializeFilters() {
    // Advanced filter toggle
    const filterToggle = document.getElementById('filterToggle');
    const advancedPanel = document.getElementById('advancedFilterPanel');

    if (filterToggle && advancedPanel) {
        filterToggle.addEventListener('click', () => {
            advancedPanel.style.display = advancedPanel.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            appState.filters.sortBy = e.target.value;
            renderPatientList();
        });
    }

    // View controls
    const gridView = document.querySelector('.grid-view');
    const listView = document.querySelector('.list-view');

    if (gridView) {
        gridView.addEventListener('click', () => {
            appState.filters.viewType = 'grid';
            gridView.classList.add('active');
            listView.classList.remove('active');
            renderPatientList();
        });
    }

    if (listView) {
        listView.addEventListener('click', () => {
            appState.filters.viewType = 'list';
            listView.classList.add('active');
            gridView.classList.remove('active');
            renderPatientList();
        });
    }

    // Apply filters button
    const applyBtn = document.querySelector('.apply-filter-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyAdvancedFilters);
    }

    // Clear filters button
    const clearBtn = document.querySelector('.clear-filter-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAdvancedFilters);
    }
}

function applyAdvancedFilters() {
    // Get frequency checkboxes
    const frequencyBoxes = document.querySelectorAll('input[name="frequency"]:checked');
    appState.filters.frequency = Array.from(frequencyBoxes).map(box => box.value);

    // Get age range
    const ageInputs = document.querySelectorAll('.age-input');
    appState.filters.ageMin = ageInputs[0].value ? parseInt(ageInputs[0].value) : null;
    appState.filters.ageMax = ageInputs[1].value ? parseInt(ageInputs[1].value) : null;

    // Get gender
    appState.filters.gender = document.querySelector('.gender-select').value;

    // Get insurance status
    appState.filters.insurance = document.querySelector('.insurance-select').value;

    // Get outstanding bills
    appState.filters.outstandingBills = document.querySelector('.bills-select').value;

    renderPatientList();
    showNotification('Filters applied successfully', 'success');
}

function clearAdvancedFilters() {
    // Reset all filters
    document.querySelectorAll('input[name="frequency"]').forEach(box => box.checked = false);
    document.querySelectorAll('.age-input').forEach(input => input.value = '');
    document.querySelector('.gender-select').value = '';
    document.querySelector('.insurance-select').value = '';
    document.querySelector('.bills-select').value = '';

    appState.filters.frequency = [];
    appState.filters.ageMin = null;
    appState.filters.ageMax = null;
    appState.filters.gender = '';
    appState.filters.insurance = '';
    appState.filters.outstandingBills = '';

    renderPatientList();
    showNotification('Filters cleared', 'info');
}

// ===============================================
// PATIENT LIST RENDERING
// ===============================================
function renderPatientList() {
    const patientGrid = document.getElementById('patientGrid');
    if (!patientGrid) return;

    // Filter patients
    let filteredPatients = filterPatients();

    // Sort patients
    filteredPatients = sortPatients(filteredPatients);

    // Paginate
    const paginatedPatients = paginatePatients(filteredPatients);

    // Clear grid
    patientGrid.innerHTML = '';

    // Render patients
    if (paginatedPatients.length === 0) {
        patientGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #9CA3AF;">No patients found matching your search criteria.</div>';
        return;
    }

    paginatedPatients.forEach(patient => {
        const card = createPatientCard(patient);
        patientGrid.appendChild(card);
    });

    // Update results count
    updateResultsCount(filteredPatients.length);
}

function filterPatients() {
    return appState.patients.filter(patient => {
        // Search term filter
        if (appState.filters.searchTerm) {
            const searchLower = appState.filters.searchTerm;
            const matchesSearch =
                patient.name.toLowerCase().includes(searchLower) ||
                patient.id.toLowerCase().includes(searchLower) ||
                patient.phone.includes(searchLower) ||
                patient.email.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
        }

        // Frequency filter
        if (appState.filters.frequency.length > 0) {
            if (!appState.filters.frequency.includes(patient.visitFrequency)) return false;
        }

        // Age filter
        if (appState.filters.ageMin && patient.age < appState.filters.ageMin) return false;
        if (appState.filters.ageMax && patient.age > appState.filters.ageMax) return false;

        // Gender filter
        if (appState.filters.gender && patient.gender.toLowerCase() !== appState.filters.gender.toLowerCase()) return false;

        // Insurance filter
        if (appState.filters.insurance) {
            if (appState.filters.insurance === 'active' && patient.insurance.status !== 'active') return false;
            if (appState.filters.insurance === 'expired' && patient.insurance.status !== 'expired') return false;
            if (appState.filters.insurance === 'none' && patient.insurance.status) return false;
        }

        // Outstanding bills filter
        if (appState.filters.outstandingBills) {
            if (appState.filters.outstandingBills === 'yes' && patient.outstanding === 0) return false;
            if (appState.filters.outstandingBills === 'no' && patient.outstanding > 0) return false;
        }

        return true;
    });
}

function sortPatients(patients) {
    const sortBy = appState.filters.sortBy;

    return patients.sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'lastvisit-desc':
                return new Date(b.lastVisit) - new Date(a.lastVisit);
            case 'lastvisit-asc':
                return new Date(a.lastVisit) - new Date(b.lastVisit);
            case 'registration-desc':
                return new Date(b.registrationDate) - new Date(a.registrationDate);
            default:
                return 0;
        }
    });
}

function paginatePatients(patients) {
    const start = (appState.pagination.currentPage - 1) * appState.pagination.itemsPerPage;
    const end = start + appState.pagination.itemsPerPage;
    appState.pagination.totalItems = patients.length;
    appState.pagination.totalPages = Math.ceil(patients.length / appState.pagination.itemsPerPage);
    return patients.slice(start, end);
}

function createPatientCard(patient) {
    const card = document.createElement('div');
    card.className = 'patient-card';

    const insuranceClass = patient.insurance.status === 'active' ? 'active' : 'expired';
    const warningRow = patient.outstanding > 0 ?
        `<div class="info-row warning">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Outstanding: KES. ${patient.outstanding.toLocaleString()}</span>
        </div>` : '';

    card.innerHTML = `
        <div class="patient-card-header">
            <img src="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\${patient.photo}" alt="Patient" class="patient-avatar">
            <div class="patient-basic-info">
                <h3 class="patient-name">${patient.name}</h3>
                <p class="patient-id">ID: ${patient.id}</p>
                <p class="patient-contact">${patient.phone}</p>
            </div>
        </div>
        <div class="patient-card-body">
            <div class="info-row">
                <span class="info-label">Last Visit:</span>
                <span class="info-value">${formatDate(patient.lastVisit)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Age:</span>
                <span class="info-value">${patient.age} years</span>
            </div>
            <div class="info-row">
                <span class="info-label">Insurance:</span>
                <span class="insurance-status ${insuranceClass}">${patient.insurance.status === 'active' ? 'Active' : 'Expired'}</span>
            </div>
            ${warningRow}
        </div>
        <div class="patient-card-actions">
            <button class="action-icon" onclick="viewPatientProfile('${patient.id}')" title="View Profile">
                <i class="fas fa-user"></i>
            </button>
            <button class="action-icon" onclick="showQuickActions('${patient.id}')" title="Quick Actions">
                <i class="fas fa-bolt"></i>
            </button>
            <button class="action-icon" onclick="verifyWalkIn('${patient.id}')" title="Walk-in Verify">
                <i class="fas fa-check-circle"></i>
            </button>
            <button class="action-icon" onclick="updateContact('${patient.id}')" title="Update Contact">
                <i class="fas fa-phone"></i>
            </button>
            <button class="action-icon" onclick="scheduleFollowUp('${patient.id}')" title="Follow-up">
                <i class="fas fa-calendar"></i>
            </button>
            <button class="action-icon ${patient.outstanding > 0 ? 'alert' : ''}" onclick="sendReminder('${patient.id}')" title="${patient.outstanding > 0 ? 'Payment Reminder' : 'Send Reminder'}">
                <i class="fas ${patient.outstanding > 0 ? 'fa-bell-dollar' : 'fa-envelope'}"></i>
            </button>
            <button class="action-icon" onclick="checkQueue('${patient.id}')" title="Queue Status">
                <i class="fas fa-users"></i>
            </button>
        </div>
    `;

    return card;
}

function updateResultsCount(total) {
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
        const start = (appState.pagination.currentPage - 1) * appState.pagination.itemsPerPage + 1;
        const end = Math.min(start + appState.pagination.itemsPerPage - 1, total);
        resultsCount.innerHTML = `Showing <strong>${start}-${end}</strong> of <strong>${total}</strong> patients`;
    }
}

// ===============================================
// PAGINATION
// ===============================================
function initializePagination() {
    // Items per page selector
    const itemsPerPage = document.getElementById('itemsPerPage');
    if (itemsPerPage) {
        itemsPerPage.addEventListener('change', (e) => {
            appState.pagination.itemsPerPage = parseInt(e.target.value);
            appState.pagination.currentPage = 1;
            renderPatientList();
            renderPaginationControls();
        });
    }

    renderPaginationControls();
}

function renderPaginationControls() {
    // This would update pagination buttons dynamically
    // For now, we'll add click handlers to existing buttons
    const pageButtons = document.querySelectorAll('.page-number');
    pageButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            appState.pagination.currentPage = index + 1;
            renderPatientList();
            updateActivePage();
        });
    });

    // Jump to page
    const goBtn = document.querySelector('.go-btn');
    if (goBtn) {
        goBtn.addEventListener('click', () => {
            const input = document.querySelector('.jump-to-page input');
            const page = parseInt(input.value);
            if (page && page > 0 && page <= appState.pagination.totalPages) {
                appState.pagination.currentPage = page;
                renderPatientList();
                updateActivePage();
            }
        });
    }
}

function updateActivePage() {
    document.querySelectorAll('.page-number').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelectorAll('.page-number')[appState.pagination.currentPage - 1];
    if (activeBtn) activeBtn.classList.add('active');
}

// ===============================================
// MODAL FUNCTIONS
// ===============================================
function initializeModals() {
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) closeModal(modal.id);
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ===============================================
// PATIENT ACTIONS
// ===============================================
function viewPatientProfile(patientId) {
    const patient = appState.patients.find(p => p.id === patientId);
    if (!patient) return;

    appState.currentPatient = patient;

    // Log audit
    logAuditAction('view_profile', patientId, `Viewed profile for ${patient.name}`);

    // Populate modal
    document.getElementById('modalPatientName').textContent = patient.name;

    // Update all patient info in modal
    const modal = document.getElementById('patientProfileModal');
    const infoItems = modal.querySelectorAll('.info-item span');

    // This is a simplified version - you would populate all fields
    openModal('patientProfileModal');
    showNotification(`Viewing profile: ${patient.name}`, 'info');
}

function showQuickActions(patientId) {
    const patient = appState.patients.find(p => p.id === patientId);
    if (!patient) return;

    appState.currentPatient = patient;
    logAuditAction('quick_actions', patientId, `Opened quick actions for ${patient.name}`);

    openModal('quickActionsModal');
}

function verifyWalkIn(patientId) {
    const patient = appState.patients.find(p => p.id === patientId);
    if (!patient) return;

    appState.currentPatient = patient;
    appState.currentStep = 1;

    logAuditAction('walk_in_start', patientId, `Started walk-in verification for ${patient.name}`);

    openModal('walkInModal');
    showStep(1);
}

function updateContact(patientId) {
    const patient = appState.patients.find(p => p.id === patientId);
    if (!patient) return;

    appState.currentPatient = patient;
    logAuditAction('contact_update', patientId, `Opened contact update for ${patient.name}`);

    openModal('updateContactModal');
}

function scheduleFollowUp(patientId) {
    const patient = appState.patients.find(p => p.id === patientId);
    if (!patient) return;

    appState.currentPatient = patient;
    logAuditAction('schedule_followup', patientId, `Opened follow-up scheduling for ${patient.name}`);

    openModal('followUpModal');
}

function sendReminder(patientId) {
    const patient = appState.patients.find(p => p.id === patientId);
    if (!patient) return;

    appState.currentPatient = patient;

    if (patient.outstanding > 0) {
        logAuditAction('payment_reminder', patientId, `Opened payment reminder for ${patient.name}`);
        openModal('paymentReminderModal');
    } else {
        logAuditAction('send_reminder', patientId, `Opened reminder for ${patient.name}`);
        openModal('sendReminderModal');
    }
}

function checkQueue(patientId) {
    const patient = appState.patients.find(p => p.id === patientId);
    if (!patient) return;

    appState.currentPatient = patient;
    logAuditAction('check_queue', patientId, `Checked queue status for ${patient.name}`);

    openModal('queueCheckModal');
}

// ===============================================
// QUICK ACTION PANEL FUNCTIONS
// ===============================================
function openWalkInModal() {
    appState.currentStep = 1;
    openModal('walkInModal');
    showStep(1);
}

function openContactConfirmModal() {
    openModal('contactConfirmModal');
}

function openFollowUpModal() {
    openModal('followUpModal');
}

function openPaymentReminderModal() {
    openModal('paymentReminderModal');
}

function openQueueCheckModal() {
    openModal('queueCheckModal');
}

// ===============================================
// WALK-IN VERIFICATION STEPS
// ===============================================
function showStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    const currentStep = document.getElementById(`walkInStep${stepNumber}`);
    if (currentStep) currentStep.classList.add('active');

    appState.currentStep = stepNumber;

    // Update navigation buttons
    updateStepNavigation();
}

function updateStepNavigation() {
    const prevBtn = document.querySelector('.step-nav-btn.prev');
    const nextBtn = document.querySelector('.step-nav-btn.next');
    const completeBtn = document.querySelector('.step-nav-btn.complete');

    if (prevBtn) prevBtn.disabled = appState.currentStep === 1;

    if (appState.currentStep === appState.totalSteps) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (completeBtn) completeBtn.style.display = 'flex';
    } else {
        if (nextBtn) nextBtn.style.display = 'flex';
        if (completeBtn) completeBtn.style.display = 'none';
    }
}

function nextStep() {
    if (appState.currentStep < appState.totalSteps) {
        showStep(appState.currentStep + 1);
    }
}

function previousStep() {
    if (appState.currentStep > 1) {
        showStep(appState.currentStep - 1);
    }
}

function completeWalkIn() {
    if (appState.currentPatient) {
        logAuditAction('walk_in_complete', appState.currentPatient.id, `Completed walk-in check-in for ${appState.currentPatient.name}`);
        showNotification(`${appState.currentPatient.name} checked in successfully!`, 'success');
        closeModal('walkInModal');

        // Navigate to check-in page or queue
        setTimeout(() => {
            window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Queue and Flow\\queue_and_flow.html';
        }, 1500);
    }
}

// ===============================================
// ADDITIONAL MODAL FUNCTIONS
// ===============================================
function openQuickActionsFromProfile() {
    closeModal('patientProfileModal');
    openModal('quickActionsModal');
}

function scheduleFollowUpFromHistory() {
    closeModal('appointmentHistoryModal');
    openModal('followUpModal');
}

function viewFullPhoto() {
    showNotification('Photo viewer opened', 'info');
}

function openBookingModal() {
    closeModal('quickActionsModal');
    showNotification('Redirecting to booking...', 'info');
    setTimeout(() => {
        window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Appointments\\appointments.html';
    }, 1000);
}

function openReminderModal() {
    closeModal('quickActionsModal');
    openModal('sendReminderModal');
}

function openUpdateContactModal() {
    closeModal('quickActionsModal');
    openModal('updateContactModal');
}

function viewInvoices() {
    showNotification('Redirecting to billing...', 'info');
    setTimeout(() => {
        window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Billings and Payments\\billings_and_payments.html';
    }, 1000);
}

function checkQueueStatus() {
    closeModal('quickActionsModal');
    openModal('queueCheckModal');
}

function openWalkInVerification() {
    closeModal('quickActionsModal');
    openWalkInModal();
}

function openFollowUpScheduler() {
    closeModal('quickActionsModal');
    openModal('followUpModal');
}

function viewAppointmentHistory() {
    closeModal('quickActionsModal');
    openModal('appointmentHistoryModal');
}

// ===============================================
// PROFILE POPUP
// ===============================================
function initializeProfilePopup() {
    const profilePopup = document.getElementById('profilePopup');

    // Close popup when clicking outside
    document.addEventListener('click', function (e) {
        if (profilePopup && profilePopup.classList.contains('active')) {
            if (!e.target.closest('.user-profile') && !e.target.closest('.profile-popup')) {
                profilePopup.classList.remove('active');
            }
        }
    });
}

function toggleProfilePopup() {
    const profilePopup = document.getElementById('profilePopup');
    if (profilePopup) {
        profilePopup.classList.toggle('active');
    }
}

// ===============================================
// DARK MODE
// ===============================================
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');

    if (darkModeToggle) {
        // Check for saved preference
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            showNotification(`${isDark ? 'Dark' : 'Light'} mode enabled`, 'info');
        });
    }
}

// ===============================================
// OTP VERIFICATION
// ===============================================
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('send-otp-btn')) {
        showNotification('OTP sent to registered mobile number', 'success');

        // Show OTP input
        const parent = e.target.closest('.otp-verification, .verification-section');
        const otpGroup = parent.querySelector('.otp-input-group, .otp-verification-group');
        if (otpGroup) {
            otpGroup.style.display = 'flex';
        }
    }

    if (e.target.classList.contains('verify-otp-btn') || e.target.classList.contains('verify-btn')) {
        const otpInput = e.target.previousElementSibling || e.target.parentElement.querySelector('.otp-input');
        const otp = otpInput ? otpInput.value : '';

        if (otp && otp.length >= 4) {
            showNotification('Contact verified successfully!', 'success');
            logAuditAction('contact_verified', appState.currentPatient?.id, 'Phone number verified via OTP');
        } else {
            showNotification('Please enter a valid OTP', 'error');
        }
    }
});

// ===============================================
// TIME SLOT SELECTION
// ===============================================
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('time-slot')) {
        // Remove selected class from all slots
        e.target.parentElement.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        // Add selected class to clicked slot
        e.target.classList.add('selected');
    }
});

// ===============================================
// CONSOLE LOG FOR DEBUGGING
// ===============================================
console.log('Patient Directory JavaScript Loaded Successfully');
console.log('Current State:', appState);

// Export functions to global scope for onclick handlers
window.viewPatientProfile = viewPatientProfile;
window.showQuickActions = showQuickActions;
window.verifyWalkIn = verifyWalkIn;
window.updateContact = updateContact;
window.scheduleFollowUp = scheduleFollowUp;
window.sendReminder = sendReminder;
window.checkQueue = checkQueue;
window.openWalkInModal = openWalkInModal;
window.openContactConfirmModal = openContactConfirmModal;
window.openFollowUpModal = openFollowUpModal;
window.openPaymentReminderModal = openPaymentReminderModal;
window.openQueueCheckModal = openQueueCheckModal;
window.closeModal = closeModal;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.completeWalkIn = completeWalkIn;
window.viewFullPhoto = viewFullPhoto;
window.openQuickActionsFromProfile = openQuickActionsFromProfile;
window.scheduleFollowUpFromHistory = scheduleFollowUpFromHistory;
window.openBookingModal = openBookingModal;
window.openReminderModal = openReminderModal;
window.openUpdateContactModal = openUpdateContactModal;
window.viewInvoices = viewInvoices;
window.checkQueueStatus = checkQueueStatus;
window.openWalkInVerification = openWalkInVerification;
window.openFollowUpScheduler = openFollowUpScheduler;
window.viewAppointmentHistory = viewAppointmentHistory;
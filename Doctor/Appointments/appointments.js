/**
 * CURIS APPOINTMENTS - COMPREHENSIVE JAVASCRIPT IMPLEMENTATION
 * Doctor (Specialist) Account Appointments Management
 * Aligned with Complete Navigation Structure
 */

// ========================================
// 1. GLOBAL CONFIGURATION & STATE
// ========================================
const AppointmentsConfig = {
    apiBaseUrl: '/api/v1',
    refreshInterval: 30000, // 30 seconds
    autoSaveInterval: 30000, // 30 seconds for notes
    sessionTimerInterval: 1000, // 1 second for ongoing sessions
    googleMeetBaseUrl: 'https://meet.google.com/',
    itemsPerPage: 10,
    maxExportItems: 1000
};

// Global State Management
const AppointmentsState = {
    currentDoctor: {
        id: 'DOC001',
        name: 'Dr. Sarah Wanjiru',
        clinicId: 'CLINIC001'
    },
    appointments: [],
    filteredAppointments: [],
    currentPage: 1,
    totalPages: 1,
    activeFilters: {
        dateRange: null,
        statuses: ['all'],
        patientName: ''
    },
    currentView: 'day', // day, week, month
    sessionTimers: new Map(), // Track ongoing session timers
    activeModals: new Set(),
    notesAutoSaveTimer: null,
    unsavedNotes: false,
    selectedAppointment: null
};

// ========================================
// 2. INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    initializeAppointments();
    setupEventListeners();
    loadAppointmentsData();
    startRealTimeSync();
    initializeLiveIndicators();
    initializeSessionTimers();
    setupAccessControl();
});

function initializeAppointments() {
    // Load saved preferences
    loadUserPreferences();

    // Initialize date filter with today
    setDateFilterToday();

    // Setup tooltips
    initializeTooltips();

    // Check for URL parameters (e.g., specific appointment)
    handleUrlParameters();
}

// ========================================
// 3. EVENT LISTENERS SETUP
// ========================================
function setupEventListeners() {
    // Profile dropdown
    setupProfileDropdown();

    // Date filter
    setupDateFilter();

    // Status filter
    setupStatusFilter();

    // Patient search
    setupPatientSearch();

    // Filter buttons
    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
    document.getElementById('clearFilters')?.addEventListener('click', clearAllFilters);

    // View tabs
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', handleViewChange);
    });

    // Export buttons
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', handleExport);
    });

    // Table action buttons
    setupTableActionButtons();

    // Modal close buttons
    setupModalHandlers();

    // Pagination
    setupPagination();

    // Dark mode
    document.getElementById('darkModeBtn')?.addEventListener('click', toggleDarkMode);
}

// ========================================
// 4. PROFILE DROPDOWN
// ========================================
function setupProfileDropdown() {
    const userProfile = document.getElementById('userProfile');
    const profileDropdown = document.getElementById('profileDropdown');

    if (userProfile) {
        userProfile.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });
    }

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.user-profile') && !e.target.closest('.profile-dropdown')) {
            userProfile?.classList.remove('active');
        }
    });
}

// ========================================
// 5. DATE FILTER FUNCTIONALITY
// ========================================
function setupDateFilter() {
    const dateInput = document.getElementById('dateFilter');
    const calendarTrigger = document.querySelector('.calendar-trigger');
    const quickSelects = document.querySelectorAll('.quick-select-btn');

    // Calendar trigger
    calendarTrigger?.addEventListener('click', openCalendarModal);

    // Quick date selects
    quickSelects.forEach(btn => {
        btn.addEventListener('click', function () {
            quickSelects.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyQuickDateFilter(this.dataset.range);
        });
    });

    // Date input change
    dateInput?.addEventListener('change', function () {
        AppointmentsState.activeFilters.dateRange = this.value;
    });
}

function setDateFilterToday() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('dateFilter');
    if (dateInput) {
        dateInput.value = today;
        AppointmentsState.activeFilters.dateRange = today;
    }
}

function applyQuickDateFilter(range) {
    const today = new Date();
    let startDate, endDate;

    switch (range) {
        case 'today':
            startDate = endDate = today;
            break;
        case 'week':
            startDate = new Date(today.setDate(today.getDate() - today.getDay()));
            endDate = new Date(today.setDate(today.getDate() + 6));
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
    }

    const dateInput = document.getElementById('dateFilter');
    if (dateInput && startDate) {
        const formatDate = (date) => date.toISOString().split('T')[0];
        if (startDate === endDate) {
            dateInput.value = formatDate(startDate);
        } else {
            dateInput.value = `${formatDate(startDate)} to ${formatDate(endDate)}`;
        }
        AppointmentsState.activeFilters.dateRange = dateInput.value;
    }
}

function openCalendarModal() {
    const modal = document.getElementById('calendarModal');
    if (modal) {
        modal.classList.add('active');
        initializeCalendar();
    }
}

function initializeCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.querySelector('.current-month').textContent = `${monthNames[month]} ${year}`;

    // Generate calendar days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '';

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        html += `<div class="calendar-header-day">${day}</div>`;
    });

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === currentDate.getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();
        html += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}">${day}</div>`;
    }

    calendarGrid.innerHTML = html;

    // Add click handlers to days
    document.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
        day.addEventListener('click', selectCalendarDate);
    });

    // Calendar navigation
    document.querySelector('.prev-month')?.addEventListener('click', () => navigateCalendar(-1));
    document.querySelector('.next-month')?.addEventListener('click', () => navigateCalendar(1));
}

function selectCalendarDate(e) {
    const date = e.target.dataset.date;
    const fromInput = document.querySelector('.date-range-from');
    const toInput = document.querySelector('.date-range-to');

    if (fromInput && !fromInput.value) {
        fromInput.value = date;
    } else if (toInput) {
        toInput.value = date;
    }

    // Highlight selected dates
    e.target.classList.add('selected');
}

// ========================================
// 6. STATUS FILTER FUNCTIONALITY
// ========================================
function setupStatusFilter() {
    const statusTrigger = document.getElementById('statusFilter');
    const statusDropdown = document.querySelector('.status-filter-dropdown');
    const checkboxes = statusDropdown?.querySelectorAll('input[type="checkbox"]');

    statusTrigger?.addEventListener('click', function () {
        statusDropdown.classList.toggle('active');
    });

    checkboxes?.forEach(checkbox => {
        checkbox.addEventListener('change', handleStatusFilterChange);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.status-filter-dropdown')) {
            statusDropdown?.classList.remove('active');
        }
    });
}

function handleStatusFilterChange(e) {
    const allCheckbox = document.querySelector('.status-dropdown-content input[value="all"]');
    const otherCheckboxes = document.querySelectorAll('.status-dropdown-content input:not([value="all"])');

    if (e.target.value === 'all') {
        // If "All" is checked, uncheck others
        if (e.target.checked) {
            otherCheckboxes.forEach(cb => cb.checked = false);
        }
    } else {
        // If any other is checked, uncheck "All"
        if (e.target.checked) {
            allCheckbox.checked = false;
        }
    }

    // Update active filters
    const checkedStatuses = Array.from(document.querySelectorAll('.status-dropdown-content input:checked'))
        .map(cb => cb.value);

    AppointmentsState.activeFilters.statuses = checkedStatuses.length ? checkedStatuses : ['all'];

    // Update trigger text
    const triggerText = document.querySelector('#statusFilter span');
    if (triggerText) {
        if (checkedStatuses.includes('all') || checkedStatuses.length === 0) {
            triggerText.textContent = 'All Statuses';
        } else {
            triggerText.textContent = `${checkedStatuses.length} selected`;
        }
    }
}

// ========================================
// 7. PATIENT SEARCH FUNCTIONALITY
// ========================================
function setupPatientSearch() {
    const searchInput = document.getElementById('patientSearch');
    const clearBtn = document.querySelector('.clear-search');
    const recentChips = document.querySelectorAll('.recent-patient-chip');

    // Search input with debounce
    let searchTimeout;
    searchInput?.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            AppointmentsState.activeFilters.patientName = this.value;
            if (this.value.length >= 2) {
                performPatientSearch(this.value);
            }
        }, 300);
    });

    // Clear search
    clearBtn?.addEventListener('click', function () {
        searchInput.value = '';
        AppointmentsState.activeFilters.patientName = '';
        this.style.display = 'none';
    });

    // Show/hide clear button
    searchInput?.addEventListener('input', function () {
        clearBtn.style.display = this.value ? 'block' : 'none';
    });

    // Recent patient chips
    recentChips.forEach(chip => {
        chip.addEventListener('click', function () {
            searchInput.value = this.textContent;
            AppointmentsState.activeFilters.patientName = this.textContent;
            applyFilters();
        });
    });
}

function performPatientSearch(query) {
    // Implement autocomplete/typeahead
    const filteredPatients = AppointmentsState.appointments.filter(apt =>
        apt.patientName.toLowerCase().includes(query.toLowerCase())
    );

    // Could show autocomplete dropdown here
    console.log('Matching patients:', filteredPatients);
}

// ========================================
// 8. APPLY FILTERS
// ========================================
function applyFilters() {
    showLoadingIndicator();

    // Get all active filters
    const filters = AppointmentsState.activeFilters;

    // Filter appointments
    let filtered = [...AppointmentsState.appointments];

    // Date filter
    if (filters.dateRange) {
        // Parse date range and filter
        filtered = filtered.filter(apt => {
            // Implementation depends on date format
            return true; // Placeholder
        });
    }

    // Status filter
    if (!filters.statuses.includes('all')) {
        filtered = filtered.filter(apt =>
            filters.statuses.includes(apt.status.toLowerCase())
        );
    }

    // Patient name filter
    if (filters.patientName) {
        filtered = filtered.filter(apt =>
            apt.patientName.toLowerCase().includes(filters.patientName.toLowerCase())
        );
    }

    AppointmentsState.filteredAppointments = filtered;

    // Update table
    renderAppointmentsTable();

    // Update pagination
    updatePagination();

    hideLoadingIndicator();

    // Show success toast
    showToast('Filters applied successfully', 'success');
}

function clearAllFilters() {
    // Reset all filter inputs
    document.getElementById('dateFilter').value = '';
    document.getElementById('patientSearch').value = '';

    // Reset status checkboxes
    document.querySelectorAll('.status-dropdown-content input').forEach(cb => {
        cb.checked = cb.value === 'all';
    });

    // Reset quick selects
    document.querySelectorAll('.quick-select-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Reset state
    AppointmentsState.activeFilters = {
        dateRange: null,
        statuses: ['all'],
        patientName: ''
    };

    // Reload data
    loadAppointmentsData();

    showToast('All filters cleared', 'info');
}

// ========================================
// 9. VIEW CHANGE HANDLING
// ========================================
function handleViewChange(e) {
    const view = e.currentTarget.dataset.view;

    // Update active tab
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    e.currentTarget.classList.add('active');

    AppointmentsState.currentView = view;

    // Re-render based on view
    switch (view) {
        case 'day':
            renderDayView();
            break;
        case 'week':
            renderWeekView();
            break;
        case 'month':
            renderMonthView();
            break;
    }

    showToast(`Switched to ${view} view`, 'info');
}

function renderDayView() {
    // Default table view for current day
    loadAppointmentsData();
}

function renderWeekView() {
    // Calendar week view implementation
    const tableSection = document.querySelector('.appointments-table-section');
    // Would render week calendar here
    console.log('Week view rendering');
}

function renderMonthView() {
    // Calendar month view implementation
    const tableSection = document.querySelector('.appointments-table-section');
    // Would render month calendar here
    console.log('Month view rendering');
}

// ========================================
// 10. EXPORT FUNCTIONALITY
// ========================================
function handleExport(e) {
    const exportType = e.currentTarget.dataset.export;

    switch (exportType) {
        case 'pdf':
            exportToPDF();
            break;
        case 'print':
            printAppointments();
            break;
        case 'csv':
            exportToCSV();
            break;
    }
}

function exportToPDF() {
    showToast('Generating PDF...', 'info');

    // In real implementation, would use library like jsPDF
    setTimeout(() => {
        showToast('PDF downloaded successfully', 'success');
    }, 2000);
}

function printAppointments() {
    window.print();
}

function exportToCSV() {
    const csv = generateCSV();
    downloadCSV(csv, `appointments_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('CSV exported successfully', 'success');
}

function generateCSV() {
    const headers = ['Patient Name', 'Date', 'Time', 'Type', 'Status', 'Scheduled By'];
    const rows = AppointmentsState.filteredAppointments.map(apt => [
        apt.patientName,
        apt.date,
        apt.time,
        apt.type,
        apt.status,
        apt.receptionist
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ========================================
// 11. TABLE ACTION BUTTONS
// ========================================
function setupTableActionButtons() {
    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', handleViewAppointment);
    });

    // Status dropdowns
    document.querySelectorAll('.status-dropdown').forEach(dropdown => {
        dropdown.addEventListener('change', handleStatusChange);
    });

    // Join consultation buttons
    document.querySelectorAll('.join-btn').forEach(btn => {
        btn.addEventListener('click', handleJoinConsultation);
    });

    // Start consultation buttons
    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', handleStartConsultation);
    });

    // Notes buttons
    document.querySelectorAll('.notes-btn').forEach(btn => {
        btn.addEventListener('click', handleViewNotes);
    });

    // Reschedule buttons
    document.querySelectorAll('.reschedule-btn').forEach(btn => {
        btn.addEventListener('click', handleReschedule);
    });

    // Follow-up buttons
    document.querySelectorAll('.follow-up-btn').forEach(btn => {
        btn.addEventListener('click', handleFollowUp);
    });
}

// ========================================
// 12. APPOINTMENT DETAIL MODAL
// ========================================
function handleViewAppointment(e) {
    const appointmentId = e.currentTarget.dataset.appointmentId;
    const appointment = getAppointmentById(appointmentId);

    if (appointment) {
        AppointmentsState.selectedAppointment = appointment;
        openAppointmentDetailModal(appointment);
    }
}

function openAppointmentDetailModal(appointment) {
    const modal = document.getElementById('appointmentDetailModal');
    if (!modal) return;

    // Update modal content with appointment data
    updateModalContent(modal, appointment);

    // Show modal
    modal.classList.add('active');

    // Setup quick action buttons
    setupQuickActionButtons();
}

function updateModalContent(modal, appointment) {
    // Update patient info
    modal.querySelector('.patient-info-section span:nth-child(2)').textContent = appointment.patientName;
    modal.querySelector('.patient-info-section span:nth-child(4)').textContent = appointment.age || '45 years';
    modal.querySelector('.patient-info-section span:nth-child(6)').textContent = appointment.gender || 'Male';
    modal.querySelector('.patient-info-section span:nth-child(8)').textContent = appointment.patientId;
    modal.querySelector('.patient-info-section span:nth-child(10)').textContent = appointment.phone || '+254 712 345678';

    // Update schedule details
    modal.querySelector('.schedule-details-section span:nth-child(2)').textContent = `${appointment.date} - ${appointment.time}`;

    // Update status badge
    const statusBadge = modal.querySelector('.schedule-details-section .status-badge');
    statusBadge.className = `status-badge ${appointment.status.toLowerCase()}`;
    statusBadge.textContent = appointment.status;

    modal.querySelector('.schedule-details-section span:nth-child(6)').textContent = appointment.type;
    modal.querySelector('.schedule-details-section span:nth-child(8)').textContent = `${appointment.receptionist} (Receptionist)`;
    modal.querySelector('.schedule-details-section span:nth-child(10)').textContent = appointment.reason || 'Follow-up consultation';

    // Show/hide Google Meet section
    const meetSection = modal.querySelector('.meet-link-section');
    if (appointment.isOnline && appointment.googleMeetUrl) {
        meetSection.style.display = 'block';
        meetSection.querySelector('.meet-link').href = appointment.googleMeetUrl;
    } else {
        meetSection.style.display = 'none';
    }
}

function setupQuickActionButtons() {
    const viewRecordBtn = document.querySelector('.view-record-btn');
    const addNotesBtn = document.querySelector('.add-notes-btn');
    const startConsultBtn = document.querySelector('.start-consult-btn');

    viewRecordBtn?.addEventListener('click', () => {
        window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Doctor\\Patient Records\\patient_records.html';
    });

    addNotesBtn?.addEventListener('click', openNotesEditor);

    startConsultBtn?.addEventListener('click', () => {
        startConsultationSession(AppointmentsState.selectedAppointment);
    });
}

// ========================================
// 13. STATUS CHANGE HANDLING
// ========================================
function handleStatusChange(e) {
    const appointmentId = e.target.dataset.appointmentId;
    const newStatus = e.target.value;
    const appointment = getAppointmentById(appointmentId);

    if (!appointment) return;

    switch (newStatus) {
        case 'ongoing':
            startSessionTimer(appointmentId);
            updateStatusBadge(appointmentId, 'ongoing');
            showToast('Consultation started', 'success');
            break;

        case 'completed':
            completeAppointment(appointmentId);
            break;

        case 'cancelled':
            openCancellationModal(appointmentId);
            break;

        default:
            updateStatusBadge(appointmentId, newStatus);
    }

    // Update backend
    updateAppointmentStatus(appointmentId, newStatus);
}

function startSessionTimer(appointmentId) {
    const row = document.querySelector(`tr[data-appointment-id="${appointmentId}"]`);
    if (!row) return;

    let seconds = 0;
    const timerElement = row.querySelector('.session-timer') || createTimerElement(row);

    const timer = setInterval(() => {
        seconds++;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);

    AppointmentsState.sessionTimers.set(appointmentId, timer);
}

function createTimerElement(row) {
    const timerElement = document.createElement('span');
    timerElement.className = 'session-timer';
    timerElement.textContent = '00:00:00';
    row.querySelector('.status-cell').appendChild(timerElement);
    return timerElement;
}

function completeAppointment(appointmentId) {
    const timer = AppointmentsState.sessionTimers.get(appointmentId);
    if (timer) {
        clearInterval(timer);
        AppointmentsState.sessionTimers.delete(appointmentId);
    }

    updateStatusBadge(appointmentId, 'completed');
    lockAppointmentEdits(appointmentId);
    showToast('Appointment marked as completed', 'success');
}

function lockAppointmentEdits(appointmentId) {
    const row = document.querySelector(`tr[data-appointment-id="${appointmentId}"]`);
    if (!row) return;

    // Disable status dropdown
    const statusDropdown = row.querySelector('.status-dropdown');
    if (statusDropdown) {
        statusDropdown.disabled = true;
    }

    // Change action buttons
    const actionsCell = row.querySelector('.actions-cell');
    actionsCell.innerHTML = `
        <button class="action-btn view-btn" data-appointment-id="${appointmentId}">
            <i class="fas fa-eye"></i> View
        </button>
        <button class="action-btn notes-btn" data-appointment-id="${appointmentId}">
            <i class="fas fa-notes-medical"></i> Notes
        </button>
    `;

    // Re-attach event listeners
    setupTableActionButtons();
}

function openCancellationModal(appointmentId) {
    const modal = document.getElementById('cancellationModal');
    if (!modal) return;

    modal.classList.add('active');
    modal.dataset.appointmentId = appointmentId;

    // Setup cancellation confirmation
    const confirmBtn = modal.querySelector('.confirm-cancel-btn');
    confirmBtn?.addEventListener('click', () => confirmCancellation(appointmentId), { once: true });
}

function confirmCancellation(appointmentId) {
    const reasonInput = document.getElementById('cancellationReason');
    const reason = reasonInput?.value;

    if (!reason) {
        showToast('Please provide a cancellation reason', 'error');
        return;
    }

    // Update status
    updateStatusBadge(appointmentId, 'cancelled');

    // Add cancellation reason to row
    const row = document.querySelector(`tr[data-appointment-id="${appointmentId}"]`);
    if (row) {
        const statusCell = row.querySelector('.status-cell');
        const reasonElement = document.createElement('span');
        reasonElement.className = 'cancellation-reason';
        reasonElement.textContent = reason;
        statusCell.appendChild(reasonElement);
    }

    // Send notifications
    const notifyPatient = {
        sms: document.querySelector('.notification-options input[type="checkbox"]:nth-child(1)')?.checked,
        email: document.querySelector('.notification-options input[type="checkbox"]:nth-child(2)')?.checked
    };

    if (notifyPatient.sms || notifyPatient.email) {
        sendCancellationNotifications(appointmentId, reason, notifyPatient);
    }

    // Close modal
    closeModal('cancellationModal');

    showToast('Appointment cancelled successfully', 'success');
}

// ========================================
// 14. CONSULTATION HANDLING
// ========================================
function handleJoinConsultation(e) {
    const meetLink = e.currentTarget.dataset.meetLink;

    if (meetLink) {
        // Open Google Meet in new tab
        window.open(meetLink, '_blank');

        // Update status to ongoing
        const appointmentId = e.currentTarget.closest('tr').querySelector('.status-dropdown')?.dataset.appointmentId;
        if (appointmentId) {
            updateStatusBadge(appointmentId, 'ongoing');
            startSessionTimer(appointmentId);
        }

        showToast('Joining online consultation...', 'info');
    }
}

function handleStartConsultation(e) {
    const appointmentId = e.currentTarget.dataset.appointmentId;
    startConsultationSession(getAppointmentById(appointmentId));
}

function startConsultationSession(appointment) {
    if (!appointment) return;

    // Navigate to consultations page with session parameter
    const consultationUrl = `C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Doctor\\Consultations\\consultations.html?sessionId=${appointment.id}`;

    // Update status before navigation
    updateAppointmentStatus(appointment.id, 'ongoing');

    showToast('Starting consultation session...', 'info');

    setTimeout(() => {
        window.location.href = consultationUrl;
    }, 1000);
}

// ========================================
// 15. NOTES EDITOR MODAL
// ========================================
function openNotesEditor() {
    const modal = document.getElementById('notesEditorModal');
    if (!modal) return;

    modal.classList.add('active');

    // Initialize rich text editor
    initializeRichTextEditor();

    // Setup auto-save
    startNotesAutoSave();

    // Setup tag input
    setupTagInput();
}

function initializeRichTextEditor() {
    const editorContent = document.getElementById('notesEditor');
    const editorButtons = document.querySelectorAll('.editor-btn');

    editorButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const command = this.dataset.command;
            document.execCommand(command, false, null);
            editorContent.focus();
        });
    });

    // Track changes for auto-save
    editorContent?.addEventListener('input', function () {
        AppointmentsState.unsavedNotes = true;
    });
}

function startNotesAutoSave() {
    // Clear existing timer
    if (AppointmentsState.notesAutoSaveTimer) {
        clearInterval(AppointmentsState.notesAutoSaveTimer);
    }

    AppointmentsState.notesAutoSaveTimer = setInterval(() => {
        if (AppointmentsState.unsavedNotes) {
            saveNotes(true); // Auto-save
        }
    }, AppointmentsConfig.autoSaveInterval);
}

function setupTagInput() {
    const tagInput = document.querySelector('.tag-input');
    const tagsContainer = document.querySelector('.tags-container');

    tagInput?.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tagText = this.value.trim();
            if (tagText) {
                addTag(tagText);
                this.value = '';
            }
        }
    });

    // Remove tag on click
    tagsContainer?.addEventListener('click', function (e) {
        if (e.target.classList.contains('tag')) {
            e.target.remove();
        }
    });
}

function addTag(tagText) {
    const tagsContainer = document.querySelector('.tags-container');
    const tagInput = document.querySelector('.tag-input');

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = tagText;

    tagsContainer.insertBefore(tag, tagInput);
}

function saveNotes(isAutoSave = false) {
    const notesContent = document.getElementById('notesEditor')?.innerHTML;
    const tags = Array.from(document.querySelectorAll('.tag')).map(tag => tag.textContent);

    if (!notesContent || notesContent === '<p>Enter pre-consultation notes here...</p>') {
        if (!isAutoSave) {
            showToast('Please enter notes before saving', 'warning');
        }
        return;
    }

    // Save to backend
    const notesData = {
        appointmentId: AppointmentsState.selectedAppointment?.id,
        content: notesContent,
        tags: tags,
        timestamp: new Date().toISOString(),
        doctorId: AppointmentsState.currentDoctor.id
    };

    // Simulate API call
    fetch(`${AppointmentsConfig.apiBaseUrl}/appointments/${notesData.appointmentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notesData)
    }).then(() => {
        AppointmentsState.unsavedNotes = false;
        if (!isAutoSave) {
            showToast('Notes saved successfully', 'success');
            closeModal('notesEditorModal');
        }
    }).catch(() => {
        showToast('Failed to save notes', 'error');
    });
}

// ========================================
// 16. FOLLOW-UP HANDLING
// ========================================
function handleFollowUp(e) {
    const appointmentId = e.currentTarget.dataset.appointmentId;
    openFollowUpModal(appointmentId);
}

function openFollowUpModal(appointmentId) {
    const modal = document.getElementById('patientFollowUpModal');
    if (!modal) return;

    modal.classList.add('active');
    modal.dataset.appointmentId = appointmentId;

    // Setup contact options
    setupContactOptions(appointmentId);
}

function setupContactOptions(appointmentId) {
    const contactButtons = document.querySelectorAll('.contact-option-btn');

    contactButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const action = this.querySelector('span').textContent;
            handleContactAction(action, appointmentId);
        }, { once: true });
    });
}

function handleContactAction(action, appointmentId) {
    const appointment = getAppointmentById(appointmentId);

    switch (action) {
        case 'Call Patient':
            initiatePhoneCall(appointment);
            break;
        case 'Send SMS':
            sendSMSReminder(appointment);
            break;
        case 'Send Email':
            sendEmailReminder(appointment);
            break;
        case 'Reschedule':
            initiateReschedule(appointment);
            break;
    }
}

// ========================================
// 17. MODAL HANDLERS
// ========================================
function setupModalHandlers() {
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Save & Close button for notes
    document.querySelector('.save-close-btn')?.addEventListener('click', () => saveNotes(false));

    // Apply date range
    document.querySelector('.apply-date-range')?.addEventListener('click', applyDateRange);

    // Modal dismiss buttons
    document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');

        // Clear auto-save timer if notes modal
        if (modalId === 'notesEditorModal' && AppointmentsState.notesAutoSaveTimer) {
            clearInterval(AppointmentsState.notesAutoSaveTimer);
            AppointmentsState.notesAutoSaveTimer = null;
        }
    }
}

function applyDateRange() {
    const fromDate = document.querySelector('.date-range-from')?.value;
    const toDate = document.querySelector('.date-range-to')?.value;

    if (fromDate && toDate) {
        const dateInput = document.getElementById('dateFilter');
        dateInput.value = `${fromDate} to ${toDate}`;
        AppointmentsState.activeFilters.dateRange = dateInput.value;

        closeModal('calendarModal');
        applyFilters();
    } else {
        showToast('Please select both start and end dates', 'warning');
    }
}

// ========================================
// 18. PAGINATION
// ========================================
function setupPagination() {
    // Previous/Next buttons
    document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', handlePaginationClick);
    });

    // Page numbers
    document.querySelectorAll('.page-number').forEach(btn => {
        btn.addEventListener('click', handlePageNumberClick);
    });
}

function handlePaginationClick(e) {
    const isPrevious = e.currentTarget.textContent.includes('Previous');

    if (isPrevious && AppointmentsState.currentPage > 1) {
        AppointmentsState.currentPage--;
    } else if (!isPrevious && AppointmentsState.currentPage < AppointmentsState.totalPages) {
        AppointmentsState.currentPage++;
    }

    updatePagination();
    renderAppointmentsTable();
}

function handlePageNumberClick(e) {
    const pageNumber = parseInt(e.currentTarget.textContent);
    AppointmentsState.currentPage = pageNumber;

    updatePagination();
    renderAppointmentsTable();
}

function updatePagination() {
    const totalItems = AppointmentsState.filteredAppointments.length;
    AppointmentsState.totalPages = Math.ceil(totalItems / AppointmentsConfig.itemsPerPage);

    // Update pagination info
    const start = (AppointmentsState.currentPage - 1) * AppointmentsConfig.itemsPerPage + 1;
    const end = Math.min(start + AppointmentsConfig.itemsPerPage - 1, totalItems);

    const infoElement = document.querySelector('.pagination-info');
    if (infoElement) {
        infoElement.innerHTML = `Showing <strong>${start}-${end}</strong> of <strong>${totalItems}</strong> appointments`;
    }

    // Update page numbers
    const pageNumbers = document.querySelectorAll('.page-number');
    pageNumbers.forEach((btn, index) => {
        const pageNum = index + 1;
        btn.textContent = pageNum;
        btn.classList.toggle('active', pageNum === AppointmentsState.currentPage);
        btn.style.display = pageNum <= AppointmentsState.totalPages ? 'flex' : 'none';
    });

    // Update prev/next buttons
    const prevBtn = document.querySelector('.pagination-btn:first-child');
    const nextBtn = document.querySelector('.pagination-btn:last-child');

    if (prevBtn) prevBtn.disabled = AppointmentsState.currentPage === 1;
    if (nextBtn) nextBtn.disabled = AppointmentsState.currentPage === AppointmentsState.totalPages;
}

// ========================================
// 19. TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);

    // Manual close
    toast.querySelector('.toast-close')?.addEventListener('click', () => {
        toast.remove();
    });
}

// ========================================
// 20. REAL-TIME SYNC & UPDATES
// ========================================
function startRealTimeSync() {
    // Periodic data refresh
    setInterval(() => {
        fetchLatestAppointments();
        updateLiveIndicators();
    }, AppointmentsConfig.refreshInterval);

    // WebSocket for real-time updates (if available)
    setupWebSocket();
}

function setupWebSocket() {
    try {
        const ws = new WebSocket('ws://localhost:8080/appointments');

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleRealTimeUpdate(data);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            // Attempt reconnection
            setTimeout(setupWebSocket, 5000);
        };
    } catch (error) {
        console.log('WebSocket not available');
    }
}

function handleRealTimeUpdate(data) {
    switch (data.type) {
        case 'appointment_changed':
            handleAppointmentChange(data.payload);
            break;
        case 'new_appointment':
            handleNewAppointment(data.payload);
            break;
        case 'patient_joined':
            handlePatientJoined(data.payload);
            break;
    }
}

function handleAppointmentChange(appointment) {
    // Show toast notification
    showToast(`Appointment for ${appointment.patientName} has been ${appointment.change}`, 'warning');

    // Update table row if visible
    updateTableRow(appointment);

    // Update live indicators
    updateLiveIndicators();
}

function handleNewAppointment(appointment) {
    showToast(`New appointment assigned: ${appointment.patientName} at ${appointment.time}`, 'info');

    // Add to appointments list
    AppointmentsState.appointments.push(appointment);

    // Re-render if matches filters
    if (matchesCurrentFilters(appointment)) {
        renderAppointmentsTable();
    }
}

function handlePatientJoined(data) {
    showToast(`${data.patientName} has joined the online consultation`, 'success');

    // Update status to ongoing if not already
    updateStatusBadge(data.appointmentId, 'ongoing');
}

// ========================================
// 21. LIVE INDICATORS
// ========================================
function initializeLiveIndicators() {
    updateLiveIndicators();
}

function updateLiveIndicators() {
    const ongoing = AppointmentsState.appointments.filter(a => a.status === 'ongoing').length;
    const pending = AppointmentsState.appointments.filter(a => a.status === 'pending').length;

    const ongoingIndicator = document.querySelector('.indicator-badge.ongoing span:last-child');
    const pendingIndicator = document.querySelector('.indicator-badge.pending span:last-child');

    if (ongoingIndicator) ongoingIndicator.textContent = `${ongoing} Ongoing`;
    if (pendingIndicator) pendingIndicator.textContent = `${pending} Pending`;
}

// ========================================
// 22. SESSION TIMERS
// ========================================
function initializeSessionTimers() {
    // Find all ongoing appointments and start timers
    document.querySelectorAll('.appointment-row.status-ongoing').forEach(row => {
        const appointmentId = row.querySelector('.status-dropdown')?.dataset.appointmentId;
        if (appointmentId) {
            startSessionTimer(appointmentId);
        }
    });
}

// ========================================
// 23. DATA LOADING
// ========================================
function loadAppointmentsData() {
    showLoadingIndicator();

    // Simulate API call
    fetch(`${AppointmentsConfig.apiBaseUrl}/appointments`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    })
        .then(response => response.json())
        .then(data => {
            AppointmentsState.appointments = data.appointments || getMockAppointments();
            AppointmentsState.filteredAppointments = [...AppointmentsState.appointments];
            renderAppointmentsTable();
            updatePagination();
            updateLiveIndicators();
        })
        .catch(error => {
            console.error('Error loading appointments:', error);
            // Use mock data as fallback
            AppointmentsState.appointments = getMockAppointments();
            AppointmentsState.filteredAppointments = [...AppointmentsState.appointments];
            renderAppointmentsTable();
        })
        .finally(() => {
            hideLoadingIndicator();
        });
}

function getMockAppointments() {
    return [
        {
            id: '1',
            patientName: 'John Kamau',
            patientId: 'PAT-2024-001',
            age: '45',
            gender: 'Male',
            date: '2025-09-25',
            time: '10:30 AM',
            type: 'Online Consultation',
            status: 'ongoing',
            receptionist: 'Jane Muthoni',
            isOnline: true,
            googleMeetUrl: 'https://meet.google.com/abc-defg-hij'
        },
        {
            id: '2',
            patientName: 'Mary Wambui',
            patientId: 'PAT-2024-002',
            age: '32',
            gender: 'Female',
            date: '2025-09-25',
            time: '11:15 AM',
            type: 'In-Person',
            status: 'pending',
            receptionist: 'Peter Njoroge',
            isOnline: false
        }
        // Add more as needed
    ];
}

function renderAppointmentsTable() {
    const tbody = document.querySelector('#appointmentsTable tbody');
    if (!tbody) return;

    const start = (AppointmentsState.currentPage - 1) * AppointmentsConfig.itemsPerPage;
    const end = start + AppointmentsConfig.itemsPerPage;
    const pageAppointments = AppointmentsState.filteredAppointments.slice(start, end);

    // Would render table rows here based on pageAppointments
    // For now, just update existing rows if needed
}

function fetchLatestAppointments() {
    // Periodic refresh of appointments data
    fetch(`${AppointmentsConfig.apiBaseUrl}/appointments/latest`)
        .then(response => response.json())
        .then(data => {
            // Merge with existing data
            mergeAppointmentsData(data.appointments);
        })
        .catch(error => {
            console.error('Error fetching latest appointments:', error);
        });
}

// ========================================
// 24. UTILITY FUNCTIONS
// ========================================
function getAppointmentById(id) {
    return AppointmentsState.appointments.find(a => a.id === id);
}

function updateStatusBadge(appointmentId, status) {
    const row = document.querySelector(`tr[data-appointment-id="${appointmentId}"]`) ||
        document.querySelector(`.status-dropdown[data-appointment-id="${appointmentId}"]`)?.closest('tr');

    if (!row) return;

    const statusCell = row.querySelector('.status-cell');
    const existingBadge = statusCell.querySelector('.status-badge');

    if (existingBadge) {
        existingBadge.className = `status-badge ${status}`;
        existingBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    } else {
        // Replace dropdown with badge
        statusCell.innerHTML = `
            <span class="status-badge ${status}">
                <i class="fas fa-${getStatusIcon(status)}"></i>
                ${status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        `;
    }

    // Update row class
    row.className = `appointment-row status-${status}`;
}

function getStatusIcon(status) {
    const icons = {
        pending: 'clock',
        ongoing: 'circle',
        completed: 'check-circle',
        cancelled: 'times-circle',
        missed: 'exclamation-triangle'
    };
    return icons[status] || 'circle';
}

function updateAppointmentStatus(appointmentId, status) {
    // Update backend
    fetch(`${AppointmentsConfig.apiBaseUrl}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ status })
    }).catch(error => {
        console.error('Error updating appointment status:', error);
    });
}

function updateTableRow(appointment) {
    const row = document.querySelector(`tr[data-appointment-id="${appointment.id}"]`) ||
        document.querySelector(`.status-dropdown[data-appointment-id="${appointment.id}"]`)?.closest('tr');

    if (!row) return;

    // Update relevant cells based on changed data
    // Implementation would update specific cells
}

function matchesCurrentFilters(appointment) {
    const filters = AppointmentsState.activeFilters;

    // Check date filter
    if (filters.dateRange && !matchesDateRange(appointment.date, filters.dateRange)) {
        return false;
    }

    // Check status filter
    if (!filters.statuses.includes('all') && !filters.statuses.includes(appointment.status)) {
        return false;
    }

    // Check patient name filter
    if (filters.patientName && !appointment.patientName.toLowerCase().includes(filters.patientName.toLowerCase())) {
        return false;
    }

    return true;
}

function matchesDateRange(date, range) {
    // Parse date range and check if date falls within
    // Implementation depends on date format
    return true; // Placeholder
}

function mergeAppointmentsData(newAppointments) {
    // Merge new appointments with existing ones
    newAppointments.forEach(newApt => {
        const existingIndex = AppointmentsState.appointments.findIndex(a => a.id === newApt.id);
        if (existingIndex >= 0) {
            AppointmentsState.appointments[existingIndex] = newApt;
        } else {
            AppointmentsState.appointments.push(newApt);
        }
    });

    // Re-apply filters
    applyFilters();
}

function sendCancellationNotifications(appointmentId, reason, channels) {
    // Send notifications via selected channels
    fetch(`${AppointmentsConfig.apiBaseUrl}/appointments/${appointmentId}/notify-cancellation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ reason, channels })
    });
}

function initiatePhoneCall(appointment) {
    showToast(`Initiating call to ${appointment.patientName}...`, 'info');
    // Would integrate with phone system
}

function sendSMSReminder(appointment) {
    showToast(`Sending SMS reminder to ${appointment.patientName}...`, 'info');
    // Would integrate with SMS service
}

function sendEmailReminder(appointment) {
    showToast(`Sending email reminder to ${appointment.patientName}...`, 'info');
    // Would integrate with email service
}

function initiateReschedule(appointment) {
    showToast('Opening rescheduling interface...', 'info');
    // Would open rescheduling modal or redirect
}

function handleReschedule(e) {
    const appointmentId = e.currentTarget.dataset.appointmentId;
    initiateReschedule(getAppointmentById(appointmentId));
}

function handleViewNotes(e) {
    const appointmentId = e.currentTarget.dataset.appointmentId;
    // Would open notes viewer
    showToast('Opening consultation notes...', 'info');
}

function navigateCalendar(direction) {
    // Navigate calendar month
    console.log('Navigate calendar:', direction);
    initializeCalendar(); // Re-render with new month
}

function showLoadingIndicator() {
    // Show loading state
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
        tableContainer.style.opacity = '0.6';
        tableContainer.style.pointerEvents = 'none';
    }
}

function hideLoadingIndicator() {
    // Hide loading state
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
        tableContainer.style.opacity = '1';
        tableContainer.style.pointerEvents = 'auto';
    }
}

function getAuthToken() {
    return localStorage.getItem('curisAuthToken') || 'demo-token';
}

function loadUserPreferences() {
    const prefs = localStorage.getItem('appointmentsPrefs');
    if (prefs) {
        const parsed = JSON.parse(prefs);
        // Apply saved preferences
    }
}

function toggleDarkMode() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);

    // Update icon
    const icon = document.querySelector('#darkModeBtn i');
    if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Save preference
    localStorage.setItem('curisTheme', newTheme);

    showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'info');
}

function handleUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const appointmentId = params.get('appointmentId');

    if (appointmentId) {
        // Open specific appointment
        setTimeout(() => {
            const appointment = getAppointmentById(appointmentId);
            if (appointment) {
                openAppointmentDetailModal(appointment);
            }
        }, 1000);
    }
}

function initializeTooltips() {
    // Add tooltips to elements with title attribute
    document.querySelectorAll('[title]').forEach(element => {
        const originalTitle = element.getAttribute('title');
        element.removeAttribute('title');
        element.setAttribute('data-tooltip', originalTitle);
    });
}

function setupAccessControl() {
    // Check user permissions
    // This would typically come from backend
    const permissions = {
        canView: true,
        canUpdate: true,
        canBook: false,
        canDelete: false
    };

    // Update UI based on permissions
    if (!permissions.canBook) {
        // Hide/disable booking functionality
    }

    if (!permissions.canDelete) {
        // Hide/disable delete functionality
    }
}

// ========================================
// 25. ERROR HANDLING
// ========================================
window.addEventListener('error', function (e) {
    console.error('Global error:', e);
    showToast('An error occurred. Please try again.', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e);
    showToast('An error occurred. Please try again.', 'error');
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppointmentsConfig,
        AppointmentsState,
        showToast,
        applyFilters
    };
}
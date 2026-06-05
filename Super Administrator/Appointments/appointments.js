// ===================================
// CURIS APPOINTMENTS PAGE JAVASCRIPT
// ===================================

// Global State Management
const AppState = {
    selectedClinic: null,
    appointments: [],
    filters: {
        dateRange: 'today',
        status: ['scheduled', 'canceled', 'completed'],
        doctor: '',
        patient: '',
        customDateFrom: '',
        customDateTo: ''
    },
    currentPage: 1,
    itemsPerPage: 10,
    sortColumn: 'datetime',
    sortDirection: 'asc',
    selectedAppointments: [],
    currentView: 'scheduled',
    realTimeEnabled: true,
    notifications: [
        { id: 1, type: 'appointment-canceled', title: 'Appointment Canceled', desc: 'Dr. Smith canceled appointment A045', time: '2 minutes ago', unread: true },
        { id: 2, type: 'appointment-new', title: 'New Appointment', desc: 'John Doe scheduled for tomorrow 10:00 AM', time: '5 minutes ago', unread: true }
    ]
};

// Sample Data
const clinicsData = [
    { id: 'clinic-a', name: 'Nairobi Medical Center', owner: 'Dr. Sarah Johnson', region: 'nairobi', status: 'active', doctors: 5, lastAccessed: '2 hours ago' },
    { id: 'clinic-b', name: 'Westlands Health Clinic', owner: 'Dr. Michael Brown', region: 'nairobi', status: 'active', doctors: 3, lastAccessed: 'Yesterday' },
    { id: 'clinic-c', name: 'Karen Medical Center', owner: 'Dr. Emily Davis', region: 'nairobi', status: 'active', doctors: 4, lastAccessed: '2 days ago' },
    { id: 'clinic-d', name: 'Eastleigh Family Clinic', owner: 'Dr. Ahmed Hassan', region: 'nairobi', status: 'active', doctors: 2, lastAccessed: '5 days ago' },
    { id: 'clinic-e', name: 'Kiambu District Hospital', owner: 'Dr. Grace Wanjiku', region: 'kiambu', status: 'active', doctors: 8, lastAccessed: '1 week ago' }
];

const appointmentsData = [
    { id: 'A001', patientName: 'John Doe', patientId: 'P12345', doctorName: 'Dr. Lee', doctorSpecialty: 'General', date: 'Today', time: '10:00 AM', status: 'scheduled', location: 'Room 1' },
    { id: 'A002', patientName: 'Jane Smith', patientId: 'P12346', doctorName: 'Dr. Park', doctorSpecialty: 'Cardiology', date: 'Today', time: '11:00 AM', status: 'canceled', location: 'Room 2' },
    { id: 'A003', patientName: 'Bob Wilson', patientId: 'P12347', doctorName: 'Dr. Kim', doctorSpecialty: 'Orthopedic', date: 'Today', time: '12:00 PM', status: 'completed', location: 'Room 3' },
    { id: 'A004', patientName: 'Alice Johnson', patientId: 'P12348', doctorName: 'Dr. Lee', doctorSpecialty: 'General', date: 'Today', time: '2:00 PM', status: 'scheduled', location: 'Room 1' },
    { id: 'A005', patientName: 'Charlie Brown', patientId: 'P12349', doctorName: 'Dr. Park', doctorSpecialty: 'Cardiology', date: 'Today', time: '3:00 PM', status: 'scheduled', location: 'Room 2' }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    initializeAppointmentsData();
    initializeRealTimeUpdates();
    updateNotificationBadge();
});

// Event Listeners
function initializeEventListeners() {
    // Header Navigation
    document.getElementById('notificationBtn').addEventListener('click', toggleNotificationPanel);
    document.getElementById('userProfileBtn').addEventListener('click', toggleUserDropdown);
    document.getElementById('closeNotifications').addEventListener('click', closeNotificationPanel);

    // Clinic Selection
    document.getElementById('selectClinicBtn').addEventListener('click', () => openModal('clinicSelectionModal'));
    document.getElementById('changeClinicBtn')?.addEventListener('click', () => openModal('clinicSelectionModal'));

    // Recent Clinic Cards
    document.querySelectorAll('.clinic-card').forEach(card => {
        card.addEventListener('click', function () {
            selectClinic(this.dataset.clinicId);
        });
    });

    // Filter & Search
    document.getElementById('filterSearchBtn')?.addEventListener('click', () => openModal('filterModal'));
    document.getElementById('applyFiltersBtn')?.addEventListener('click', applyFilters);
    document.getElementById('clearFiltersBtn')?.addEventListener('click', clearFilters);

    // Calendar View
    document.getElementById('calendarViewBtn')?.addEventListener('click', () => openModal('calendarViewModal'));

    // Force Cancel
    document.getElementById('forceCancelBtn')?.addEventListener('click', () => openModal('forceCancelModal'));
    document.getElementById('confirmForceCancelBtn')?.addEventListener('click', confirmForceCancel);

    // Reports
    document.getElementById('reportsBtn')?.addEventListener('click', () => openModal('reportsModal'));
    document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);

    // History
    document.getElementById('historyBtn')?.addEventListener('click', () => openModal('historyLogModal'));
    document.getElementById('applyHistoryFilters')?.addEventListener('click', applyHistoryFilters);
    document.getElementById('exportAuditLogBtn')?.addEventListener('click', exportAuditLog);

    // Quick Actions
    document.getElementById('quickSchedule')?.addEventListener('click', quickScheduleAppointment);
    document.getElementById('quickCancel')?.addEventListener('click', quickCancelAppointment);
    document.getElementById('quickMessage')?.addEventListener('click', quickSendMessage);
    document.getElementById('quickExport')?.addEventListener('click', quickExportToday);
    document.getElementById('doctorAvailability')?.addEventListener('click', () => openModal('doctorAvailabilityModal'));
    document.getElementById('notificationSettings')?.addEventListener('click', () => openModal('notificationConfigModal'));

    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function () {
            switchTab(this.dataset.tab);
        });
    });

    // Table Sorting
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', function () {
            sortTable(this.dataset.sort);
        });
    });

    // Appointment Actions
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            showAppointmentActions(this, this.dataset.appointmentId);
        });
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
        btn.addEventListener('click', function () {
            const modalId = this.dataset.modal || this.closest('.modal-overlay').id;
            closeModal(modalId);
        });
    });

    // Dark Mode Toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    // Clinic Selection Modal
    document.getElementById('clinicSearchInput')?.addEventListener('input', searchClinics);
    document.getElementById('regionFilter')?.addEventListener('change', filterClinics);
    document.getElementById('statusFilter')?.addEventListener('change', filterClinics);

    // Filter Modal
    document.querySelectorAll('input[name="dateRange"]').forEach(radio => {
        radio.addEventListener('change', function () {
            document.getElementById('customDateRange').classList.toggle('hidden', this.value !== 'custom');
        });
    });

    // Force Cancel Modal
    document.querySelectorAll('input[name="cancelReason"]').forEach(radio => {
        radio.addEventListener('change', function () {
            document.getElementById('otherReasonGroup').style.display =
                this.value === 'other' ? 'block' : 'none';
        });
    });

    // Appointment Details Modal
    document.getElementById('editAvailabilityBtn')?.addEventListener('click', editAvailability);
    document.getElementById('rescheduleAppointmentBtn')?.addEventListener('click', rescheduleAppointment);
    document.getElementById('cancelAppointmentBtn')?.addEventListener('click', cancelAppointment);

    // Doctor Availability Modal
    document.getElementById('doctorSelect')?.addEventListener('change', loadDoctorAvailability);
    document.getElementById('saveAvailabilityChanges')?.addEventListener('click', saveAvailabilityChanges);
    document.getElementById('blockTimeSlot')?.addEventListener('click', blockTimeSlot);
    document.getElementById('scheduleTimeOff')?.addEventListener('click', scheduleTimeOff);
    document.getElementById('setUnavailable')?.addEventListener('click', setDoctorUnavailable);
    document.getElementById('overrideSchedule')?.addEventListener('click', overrideSchedule);

    // Notification Settings Modal
    document.getElementById('saveNotificationSettings')?.addEventListener('click', saveNotificationSettings);
    document.getElementById('editReminderTemplate')?.addEventListener('click', () => editTemplate('reminder'));
    document.getElementById('editCancellationTemplate')?.addEventListener('click', () => editTemplate('cancellation'));
    document.getElementById('editRescheduleTemplate')?.addEventListener('click', () => editTemplate('reschedule'));

    // Calendar Navigation
    document.getElementById('prevMonth')?.addEventListener('click', () => navigateCalendar('prev'));
    document.getElementById('nextMonth')?.addEventListener('click', () => navigateCalendar('next'));
    document.getElementById('prevPeriod')?.addEventListener('click', () => navigatePeriod('prev'));
    document.getElementById('nextPeriod')?.addEventListener('click', () => navigatePeriod('next'));

    // Calendar View Buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            switchCalendarView(this.dataset.view);
        });
    });

    // Report Type Selection
    document.getElementById('reportType')?.addEventListener('change', updateReportOptions);

    // Export Buttons
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            exportReport(this.dataset.format);
        });
    });

    // Chart Type Selection
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            switchChartType(this.dataset.chart);
        });
    });

    // Pagination
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            if (!this.disabled) {
                changePage(this.textContent);
            }
        });
    });

    // Click outside handlers
    document.addEventListener('click', function (e) {
        // Close dropdowns when clicking outside
        if (!e.target.closest('.notification-container') && !e.target.closest('.notification-panel')) {
            closeNotificationPanel();
        }
        if (!e.target.closest('.user-profile-container') && !e.target.closest('.user-dropdown')) {
            closeUserDropdown();
        }
        if (!e.target.closest('.action-dropdown') && !e.target.closest('.actions-dropdown-menu')) {
            closeAllActionMenus();
        }
    });

    // Modal overlay click to close
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

// Clinic Selection Functions
function selectClinic(clinicId) {
    const clinic = clinicsData.find(c => c.id === clinicId);
    if (clinic) {
        AppState.selectedClinic = clinic;
        document.getElementById('clinicSelectionSection').classList.add('hidden');
        document.getElementById('clinicDashboard').classList.remove('hidden');

        // Update selected clinic info
        document.getElementById('selectedClinicName').textContent = clinic.name;
        document.getElementById('selectedClinicOwner').textContent = clinic.owner;

        // Load clinic appointments
        loadClinicAppointments(clinicId);

        // Close modal if open
        closeModal('clinicSelectionModal');

        // Update stats
        updateAppointmentStats();

        // Show success message
        showNotification('Clinic selected successfully', 'success');
    }
}

function searchClinics() {
    const searchTerm = document.getElementById('clinicSearchInput').value.toLowerCase();
    const clinicItems = document.querySelectorAll('.clinic-item');

    clinicItems.forEach(item => {
        const clinicName = item.querySelector('.clinic-name').textContent.toLowerCase();
        const clinicOwner = item.querySelector('.clinic-owner').textContent.toLowerCase();
        const clinicId = item.dataset.clinicId;

        if (clinicName.includes(searchTerm) || clinicOwner.includes(searchTerm) || clinicId.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterClinics() {
    const regionFilter = document.getElementById('regionFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const clinicItems = document.querySelectorAll('.clinic-item');

    clinicItems.forEach(item => {
        const clinicId = item.dataset.clinicId;
        const clinic = clinicsData.find(c => c.id === clinicId);

        let showItem = true;

        if (regionFilter && clinic.region !== regionFilter) {
            showItem = false;
        }

        if (statusFilter && clinic.status !== statusFilter) {
            showItem = false;
        }

        item.style.display = showItem ? 'flex' : 'none';
    });
}

// Appointment Management Functions
function loadClinicAppointments(clinicId) {
    // Simulate loading appointments for the selected clinic
    AppState.appointments = [...appointmentsData];
    renderAppointmentTable();
}

function renderAppointmentTable() {
    const tbody = document.querySelector('#appointmentTable tbody');
    tbody.innerHTML = '';

    // Apply filters
    let filteredAppointments = filterAppointments(AppState.appointments);

    // Sort appointments
    filteredAppointments = sortAppointments(filteredAppointments);

    // Paginate
    const startIndex = (AppState.currentPage - 1) * AppState.itemsPerPage;
    const endIndex = startIndex + AppState.itemsPerPage;
    const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);

    // Render rows
    paginatedAppointments.forEach(appointment => {
        const row = createAppointmentRow(appointment);
        tbody.appendChild(row);
    });

    // Update pagination
    updatePagination(filteredAppointments.length);

    // Update counts
    updateTabCounts();
}

function createAppointmentRow(appointment) {
    const row = document.createElement('tr');
    row.className = `appointment-row ${appointment.status}`;
    row.dataset.appointmentId = appointment.id;

    row.innerHTML = `
        <td class="appointment-id">${appointment.id}</td>
        <td class="patient-info">
            <div class="patient-cell">
                <img src="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png" 
                     alt="Patient" class="patient-avatar">
                <div class="patient-details">
                    <span class="patient-name">${appointment.patientName}</span>
                    <span class="patient-id">${appointment.patientId}</span>
                </div>
            </div>
        </td>
        <td class="doctor-info">
            <div class="doctor-cell">
                <img src="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png" 
                     alt="Doctor" class="doctor-avatar">
                <div class="doctor-details">
                    <span class="doctor-name">${appointment.doctorName}</span>
                    <span class="doctor-specialty">${appointment.doctorSpecialty}</span>
                </div>
            </div>
        </td>
        <td class="appointment-datetime">
            <div class="datetime-cell">
                <span class="date">${appointment.date}</span>
                <span class="time">${appointment.time}</span>
            </div>
        </td>
        <td class="appointment-status">
            <span class="status-badge ${appointment.status}">
                <i class="fas fa-circle"></i>
                ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
        </td>
        <td class="appointment-location">${appointment.location}</td>
        <td class="appointment-actions">
            <div class="action-dropdown">
                <button class="action-btn" data-appointment-id="${appointment.id}">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        </td>
    `;

    // Add event listener to action button
    row.querySelector('.action-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        showAppointmentActions(this, appointment.id);
    });

    return row;
}

function filterAppointments(appointments) {
    return appointments.filter(appointment => {
        // Filter by status
        if (!AppState.filters.status.includes(appointment.status)) {
            return false;
        }

        // Filter by doctor
        if (AppState.filters.doctor && appointment.doctorName !== AppState.filters.doctor) {
            return false;
        }

        // Filter by patient
        if (AppState.filters.patient) {
            const searchTerm = AppState.filters.patient.toLowerCase();
            if (!appointment.patientName.toLowerCase().includes(searchTerm) &&
                !appointment.patientId.toLowerCase().includes(searchTerm)) {
                return false;
            }
        }

        // Filter by date range
        // TODO: Implement date filtering based on AppState.filters.dateRange

        return true;
    });
}

function sortAppointments(appointments) {
    return appointments.sort((a, b) => {
        let aValue = a[AppState.sortColumn];
        let bValue = b[AppState.sortColumn];

        if (AppState.sortColumn === 'datetime') {
            // Convert to comparable format
            aValue = new Date(`${a.date} ${a.time}`).getTime();
            bValue = new Date(`${b.date} ${b.time}`).getTime();
        }

        if (aValue < bValue) return AppState.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return AppState.sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

function sortTable(column) {
    if (AppState.sortColumn === column) {
        AppState.sortDirection = AppState.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        AppState.sortColumn = column;
        AppState.sortDirection = 'asc';
    }

    renderAppointmentTable();
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / AppState.itemsPerPage);
    const paginationInfo = document.querySelector('.pagination-info');
    const paginationControls = document.querySelector('.pagination-controls');

    // Update info
    const startItem = (AppState.currentPage - 1) * AppState.itemsPerPage + 1;
    const endItem = Math.min(AppState.currentPage * AppState.itemsPerPage, totalItems);
    paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} appointments`;

    // Update controls
    const prevBtn = paginationControls.querySelector('.page-btn:first-child');
    const nextBtn = paginationControls.querySelector('.page-btn:last-child');

    prevBtn.disabled = AppState.currentPage === 1;
    nextBtn.disabled = AppState.currentPage === totalPages;

    // Update page numbers
    const pageButtons = paginationControls.querySelectorAll('.page-btn:not(:first-child):not(:last-child)');
    pageButtons.forEach(btn => {
        const pageNum = parseInt(btn.textContent);
        if (!isNaN(pageNum)) {
            btn.classList.toggle('active', pageNum === AppState.currentPage);
        }
    });
}

function changePage(action) {
    const totalPages = Math.ceil(filterAppointments(AppState.appointments).length / AppState.itemsPerPage);

    if (action === '«') {
        AppState.currentPage = Math.max(1, AppState.currentPage - 1);
    } else if (action === '»') {
        AppState.currentPage = Math.min(totalPages, AppState.currentPage + 1);
    } else {
        const pageNum = parseInt(action);
        if (!isNaN(pageNum)) {
            AppState.currentPage = pageNum;
        }
    }

    renderAppointmentTable();
}

// Tab Management
function switchTab(tabName) {
    AppState.currentView = tabName;

    // Update tab UI
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Filter appointments based on tab
    if (tabName === 'analytics') {
        showAnalytics();
    } else {
        renderAppointmentTable();
    }
}

function updateTabCounts() {
    const appointments = filterAppointments(AppState.appointments);

    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const canceled = appointments.filter(a => a.status === 'canceled').length;

    document.querySelector('[data-tab="scheduled"] .tab-count').textContent = scheduled;
    document.querySelector('[data-tab="completed"] .tab-count').textContent = completed;
    document.querySelector('[data-tab="canceled"] .tab-count').textContent = canceled;
}

// Appointment Actions
function showAppointmentActions(button, appointmentId) {
    // Close any open action menus
    closeAllActionMenus();

    // Get or create action menu
    let menu = document.getElementById('appointmentActionsMenu');
    if (!menu) {
        console.error('Appointment actions menu not found');
        return;
    }

    // Position menu next to button
    const rect = button.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.left = `${rect.left - 150}px`;

    // Show menu
    menu.classList.remove('hidden');

    // Update action handlers
    menu.querySelectorAll('.action-item').forEach(item => {
        item.onclick = function () {
            handleAppointmentAction(this.dataset.action, appointmentId);
            closeAllActionMenus();
        };
    });
}

function closeAllActionMenus() {
    document.querySelectorAll('.actions-dropdown-menu').forEach(menu => {
        menu.classList.add('hidden');
    });
}

function handleAppointmentAction(action, appointmentId) {
    switch (action) {
        case 'view':
            viewAppointmentDetails(appointmentId);
            break;
        case 'reschedule':
            rescheduleAppointment(appointmentId);
            break;
        case 'force-cancel':
            forceCancelAppointment(appointmentId);
            break;
        case 'history':
            viewAppointmentHistory(appointmentId);
            break;
        case 'notification':
            sendAppointmentNotification(appointmentId);
            break;
        case 'print':
            printAppointmentDetails(appointmentId);
            break;
    }
}

function viewAppointmentDetails(appointmentId) {
    const appointment = AppState.appointments.find(a => a.id === appointmentId);
    if (appointment) {
        // Update modal content
        document.querySelector('#appointmentDetailsModal .highlight').textContent = appointment.id;
        // Update other details...

        openModal('appointmentDetailsModal');
    }
}

function forceCancelAppointment(appointmentId) {
    const appointment = AppState.appointments.find(a => a.id === appointmentId);
    if (appointment) {
        // Update force cancel modal with appointment details
        document.querySelector('#forceCancelModal .appointment-summary .value').textContent = appointment.id;

        openModal('forceCancelModal');
    }
}

function confirmForceCancel() {
    const reason = document.querySelector('input[name="cancelReason"]:checked')?.value;
    const otherReason = document.getElementById('otherCancelReason').value;
    const notes = document.getElementById('cancelNotes').value;

    if (!reason) {
        showNotification('Please select a cancellation reason', 'error');
        return;
    }

    // Process cancellation
    showNotification('Appointment canceled successfully', 'success');
    closeModal('forceCancelModal');

    // Refresh table
    renderAppointmentTable();
}

// Filter Functions
function applyFilters() {
    // Get filter values
    const dateRange = document.querySelector('input[name="dateRange"]:checked').value;
    const statusFilters = Array.from(document.querySelectorAll('input[name="statusFilter"]:checked')).map(cb => cb.value);
    const doctorFilter = document.querySelector('select[name="doctorFilter"]').value;
    const patientSearch = document.querySelector('.search-input').value;

    // Update state
    AppState.filters.dateRange = dateRange;
    AppState.filters.status = statusFilters;
    AppState.filters.doctor = doctorFilter;
    AppState.filters.patient = patientSearch;

    if (dateRange === 'custom') {
        AppState.filters.customDateFrom = document.getElementById('dateFrom').value;
        AppState.filters.customDateTo = document.getElementById('dateTo').value;
    }

    // Reset to first page
    AppState.currentPage = 1;

    // Refresh table
    renderAppointmentTable();

    // Close modal
    closeModal('filterModal');

    showNotification('Filters applied successfully', 'success');
}

function clearFilters() {
    // Reset filters
    AppState.filters = {
        dateRange: 'today',
        status: ['scheduled', 'canceled', 'completed'],
        doctor: '',
        patient: '',
        customDateFrom: '',
        customDateTo: ''
    };

    // Reset form
    document.querySelector('input[name="dateRange"][value="today"]').checked = true;
    document.querySelectorAll('input[name="statusFilter"]').forEach(cb => cb.checked = true);
    document.querySelector('select[name="doctorFilter"]').value = '';
    document.querySelector('.search-input').value = '';

    // Refresh table
    renderAppointmentTable();

    showNotification('Filters cleared', 'success');
}

// Stats Update
function updateAppointmentStats() {
    const appointments = AppState.appointments;

    // Today's appointments
    const todayCount = appointments.filter(a => a.date === 'Today').length;
    document.querySelector('.stat-number').textContent = todayCount;

    // Status breakdown
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const canceled = appointments.filter(a => a.status === 'canceled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;

    document.querySelector('.breakdown-item.scheduled strong').textContent = scheduled;
    document.querySelector('.breakdown-item.canceled strong').textContent = canceled;
    document.querySelector('.breakdown-item.completed strong').textContent = completed;

    // Additional stats
    // These would be calculated from real data
    document.querySelector('.stat-row:nth-child(1) .stat-value').textContent = '127';
    document.querySelector('.stat-row:nth-child(2) .stat-value').textContent = '456';
    document.querySelector('.stat-row:nth-child(3) .stat-value').textContent = '12 mins';
    document.querySelector('.stat-row:nth-child(4) .stat-value').textContent = '8.5%';
}

// Quick Actions
function quickScheduleAppointment() {
    // Open scheduling modal or form
    showNotification('Quick schedule feature coming soon', 'info');
}

function quickCancelAppointment() {
    // Show quick cancel interface
    showNotification('Quick cancel feature coming soon', 'info');
}

function quickSendMessage() {
    // Open messaging interface
    showNotification('Messaging feature coming soon', 'info');
}

function quickExportToday() {
    // Export today's appointments
    const todayAppointments = AppState.appointments.filter(a => a.date === 'Today');

    // Create CSV content
    const csv = generateCSV(todayAppointments);

    // Download file
    downloadFile(csv, 'appointments-today.csv', 'text/csv');

    showNotification('Today\'s appointments exported successfully', 'success');
}

// Report Generation
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const dateFrom = document.getElementById('reportDateFrom').value;
    const dateTo = document.getElementById('reportDateTo').value;

    if (!dateFrom || !dateTo) {
        showNotification('Please select date range', 'error');
        return;
    }

    // Simulate report generation
    showNotification('Generating report...', 'info');

    setTimeout(() => {
        showNotification('Report generated successfully', 'success');
        // Show chart placeholder
        document.querySelector('.chart-placeholder').innerHTML = `
            <i class="fas fa-check-circle" style="color: var(--success-green);"></i>
            <p>Report generated for ${reportType}</p>
        `;
    }, 2000);
}

function exportReport(format) {
    showNotification(`Exporting report as ${format.toUpperCase()}...`, 'info');

    setTimeout(() => {
        showNotification('Report exported successfully', 'success');
    }, 1500);
}

function switchChartType(chartType) {
    // Update active chart type
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.chart === chartType);
    });

    // Update chart display
    showNotification(`Switching to ${chartType} chart`, 'info');
}

// Calendar Functions
function navigateCalendar(direction) {
    // Update calendar month
    const currentMonth = document.getElementById('currentMonth');
    // Implementation would update the calendar display
    showNotification(`Navigating calendar ${direction}`, 'info');
}

function navigatePeriod(direction) {
    // Update calendar period
    showNotification(`Navigating period ${direction}`, 'info');
}

function switchCalendarView(view) {
    // Update active view
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update calendar display
    showNotification(`Switching to ${view} view`, 'info');
}

// Doctor Availability
function loadDoctorAvailability() {
    const doctor = document.getElementById('doctorSelect').value;
    showNotification(`Loading availability for ${doctor}`, 'info');

    // Simulate loading availability
    setTimeout(() => {
        // Update availability display
        showNotification('Availability loaded', 'success');
    }, 1000);
}

function saveAvailabilityChanges() {
    showNotification('Saving availability changes...', 'info');

    setTimeout(() => {
        showNotification('Availability updated successfully', 'success');
        closeModal('doctorAvailabilityModal');
    }, 1500);
}

function blockTimeSlot() {
    showNotification('Block time slot feature coming soon', 'info');
}

function scheduleTimeOff() {
    showNotification('Schedule time off feature coming soon', 'info');
}

function setDoctorUnavailable() {
    showNotification('Set unavailable feature coming soon', 'info');
}

function overrideSchedule() {
    showNotification('Override schedule feature coming soon', 'info');
}

// Notification Settings
function saveNotificationSettings() {
    const reminderTime = document.getElementById('reminderTime').value;
    const channels = Array.from(document.querySelectorAll('input[name="channels"]:checked')).map(cb => cb.value);

    showNotification('Saving notification settings...', 'info');

    setTimeout(() => {
        showNotification('Notification settings saved', 'success');
        closeModal('notificationConfigModal');
    }, 1500);
}

function editTemplate(templateType) {
    showNotification(`Editing ${templateType} template`, 'info');
}

// History Functions
function applyHistoryFilters() {
    const dateFrom = document.getElementById('historyDateFrom').value;
    const dateTo = document.getElementById('historyDateTo').value;
    const status = document.getElementById('historyStatus').value;
    const action = document.getElementById('historyAction').value;

    showNotification('Applying history filters...', 'info');

    // Filter history entries
    setTimeout(() => {
        showNotification('History filtered', 'success');
    }, 1000);
}

function exportAuditLog() {
    showNotification('Exporting audit log...', 'info');

    setTimeout(() => {
        showNotification('Audit log exported successfully', 'success');
    }, 1500);
}

// Utility Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-green)' : type === 'error' ? 'var(--error-red)' : 'var(--info-blue)'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function generateCSV(data) {
    const headers = ['ID', 'Patient Name', 'Patient ID', 'Doctor', 'Date', 'Time', 'Status', 'Location'];
    const rows = data.map(appointment => [
        appointment.id,
        appointment.patientName,
        appointment.patientId,
        appointment.doctorName,
        appointment.date,
        appointment.time,
        appointment.status,
        appointment.location
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Header Functions
function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.toggle('hidden');

    if (!panel.classList.contains('hidden')) {
        markNotificationsAsRead();
    }
}

function closeNotificationPanel() {
    document.getElementById('notificationPanel').classList.add('hidden');
}

function toggleUserDropdown() {
    document.getElementById('userProfileDropdown').classList.toggle('hidden');
}

function closeUserDropdown() {
    document.getElementById('userProfileDropdown').classList.add('hidden');
}

function updateNotificationBadge() {
    const unreadCount = AppState.notifications.filter(n => n.unread).length;
    const badge = document.querySelector('.notification-badge');
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'block' : 'none';
}

function markNotificationsAsRead() {
    AppState.notifications.forEach(n => n.unread = false);
    updateNotificationBadge();
}

// Dark Mode
function toggleDarkMode() {
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';

    if (isDarkMode) {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        document.querySelector('#darkModeToggle span').textContent = 'Dark Mode';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        document.querySelector('#darkModeToggle span').textContent = 'Light Mode';
    }
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.querySelector('#darkModeToggle span').textContent = 'Light Mode';
    }
}

// Real-time Updates
function initializeRealTimeUpdates() {
    // Simulate real-time updates
    setInterval(() => {
        if (AppState.realTimeEnabled) {
            // Randomly update appointment status
            if (Math.random() > 0.8) {
                simulateAppointmentUpdate();
            }
        }
    }, 10000); // Every 10 seconds
}

function simulateAppointmentUpdate() {
    const randomIndex = Math.floor(Math.random() * AppState.appointments.length);
    const appointment = AppState.appointments[randomIndex];

    if (appointment && appointment.status === 'scheduled') {
        // Simulate status change
        const newStatus = Math.random() > 0.5 ? 'completed' : 'canceled';
        appointment.status = newStatus;

        // Show notification
        showNotification(`Appointment ${appointment.id} ${newStatus}`, 'info');

        // Update table
        renderAppointmentTable();

        // Update stats
        updateAppointmentStats();
    }
}

// Initialize appointments data
function initializeAppointmentsData() {
    // Generate more sample appointments
    for (let i = 6; i <= 30; i++) {
        const statuses = ['scheduled', 'completed', 'canceled'];
        const doctors = ['Dr. Lee', 'Dr. Park', 'Dr. Kim', 'Dr. Smith', 'Dr. Johnson'];
        const specialties = ['General', 'Cardiology', 'Orthopedic', 'Pediatrics', 'Dermatology'];
        const rooms = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5'];

        appointmentsData.push({
            id: `A${String(i).padStart(3, '0')}`,
            patientName: `Patient ${i}`,
            patientId: `P${12349 + i}`,
            doctorName: doctors[Math.floor(Math.random() * doctors.length)],
            doctorSpecialty: specialties[Math.floor(Math.random() * specialties.length)],
            date: i <= 15 ? 'Today' : 'Tomorrow',
            time: `${9 + (i % 8)}:00 ${i % 12 < 3 ? 'AM' : 'PM'}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            location: rooms[Math.floor(Math.random() * rooms.length)]
        });
    }
}

// Initialize theme on load
initializeTheme();

// Add CSS for notification toast animation
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
// ====================================
// CURIS APPOINTMENTS - COMPREHENSIVE JAVASCRIPT
// Modern Healthcare Appointments System
// Complete Functionality Implementation
// ====================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // ====================================
    // GLOBAL VARIABLES & CONSTANTS
    // ====================================

    // Current view states
    let currentCalendarView = 'day';
    let currentDate = new Date();
    let selectedTimeSlot = null;
    let selectedPatient = null;
    let selectedServices = [];
    let selectedDoctor = null;
    let currentAppointmentId = null;

    // Mock data for appointments
    const mockAppointments = [
        {
            id: 'APT001',
            patientName: 'John Mwangi',
            patientId: 'PAT001',
            serviceName: 'General Consultation',
            doctorName: 'Dr. James Kamau',
            time: '9:00 AM - 9:30 AM',
            date: '2025-05-24',
            status: 'confirmed',
            duration: 30,
            cost: 1500
        },
        {
            id: 'APT002',
            patientName: 'Grace Wanjiku',
            patientId: 'PAT002',
            serviceName: 'Blood Sugar Test',
            doctorName: 'Lab Technician',
            time: '10:00 AM - 10:30 AM',
            date: '2025-05-24',
            status: 'in-progress',
            duration: 30,
            cost: 800
        },
        {
            id: 'APT003',
            patientName: 'Peter Kiprotich',
            patientId: 'PAT003',
            serviceName: 'Vaccination',
            doctorName: 'Nurse Mary',
            time: '11:00 AM - 11:15 AM',
            date: '2025-05-24',
            status: 'pending',
            duration: 15,
            cost: 1200
        }
    ];

    // ====================================
    // INITIALIZATION
    // ====================================

    function init() {
        // Initialize all event listeners
        setupHeaderEventListeners();
        setupCalendarEventListeners();
        setupModalEventListeners();
        setupConfigurationEventListeners();
        setupQuickActionsEventListeners();
        setupFormEventListeners();

        // Update current period display
        updateCurrentPeriodDisplay();

        // Initialize calendar view
        updateCalendarView();

        // Initialize tooltips if needed
        initializeTooltips();
    }

    // ====================================
    // HEADER FUNCTIONALITY
    // ====================================

    function setupHeaderEventListeners() {
        // Calendar View Toggle
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                viewButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentCalendarView = this.dataset.view;
                updateCalendarView();
            });
        });

        // Search functionality
        const searchInput = document.getElementById('appointmentSearch');
        searchInput.addEventListener('input', debounce(function (e) {
            searchAppointments(e.target.value);
        }, 300));

        // New Appointment Button
        const newAppointmentBtn = document.getElementById('newAppointmentBtn');
        newAppointmentBtn.addEventListener('click', function () {
            openModal('newAppointmentModal');
            resetAppointmentForm();
        });

        // Notifications Button
        const notificationBtn = document.getElementById('notificationBtn');
        notificationBtn.addEventListener('click', function () {
            toggleNotificationsPanel();
        });

        // User Profile Dropdown
        const userProfileBtn = document.getElementById('userProfileBtn');
        userProfileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleDropdown('userDropdown');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function () {
            closeAllDropdowns();
        });
    }

    // JavaScript to handle user profile button click behavior
    const profileBtn = document.getElementById("userProfileBtn");
    const dropdown = document.getElementById("userDropdown");

    let isDropdownVisible = false;

    profileBtn.addEventListener("click", function () {
        if (!isDropdownVisible) {
            // Show dropdown
            dropdown.classList.add("visible");
            isDropdownVisible = true;
        } else {
            // Redirect to My Profile page
            window.location.href = "file:///C:/Users/nderu/Documents/Development/Product/Curis/Users/Clinic%20Owner/My%20Profile/my_profile.html";
        }
    });

    // Optional: Hide dropdown when clicking outside
    document.addEventListener("click", function (event) {
        const isClickInside = profileBtn.contains(event.target) || dropdown.contains(event.target);
        if (!isClickInside) {
            dropdown.classList.remove("visible");
            isDropdownVisible = false;
        }
    });

    // ====================================
    // CALENDAR FUNCTIONALITY
    // ====================================

    function setupCalendarEventListeners() {
        // Previous Period Button
        const prevPeriodBtn = document.getElementById('prevPeriod');
        prevPeriodBtn.addEventListener('click', function () {
            navigatePeriod(-1);
        });

        // Next Period Button
        const nextPeriodBtn = document.getElementById('nextPeriod');
        nextPeriodBtn.addEventListener('click', function () {
            navigatePeriod(1);
        });

        // Today Button
        const todayBtn = document.getElementById('todayBtn');
        todayBtn.addEventListener('click', function () {
            currentDate = new Date();
            updateCurrentPeriodDisplay();
            updateCalendarView();
        });

        // Filter Button
        const filterBtn = document.getElementById('filterBtn');
        filterBtn.addEventListener('click', function () {
            openModal('calendarFilterModal');
        });

        // Appointment Slot Actions
        document.addEventListener('click', function (e) {
            if (e.target.closest('.appointment-slot')) {
                const slot = e.target.closest('.appointment-slot');
                const appointmentId = slot.dataset.appointment;
                openAppointmentDetails(appointmentId);
            }

            if (e.target.closest('.book-slot-btn')) {
                const btn = e.target.closest('.book-slot-btn');
                const time = btn.dataset.time;
                openNewAppointmentWithTime(time);
            }

            if (e.target.closest('.available-slot')) {
                const slot = e.target.closest('.available-slot');
                const btn = slot.querySelector('.book-slot-btn');
                if (btn) {
                    const time = btn.dataset.time;
                    openNewAppointmentWithTime(time);
                }
            }
        });
    }

    // ====================================
    // MODAL FUNCTIONALITY
    // ====================================

    function setupModalEventListeners() {
        // Close buttons for all modals
        const modalCloseButtons = document.querySelectorAll('.modal-close');
        modalCloseButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const modalId = this.dataset.modal;
                closeModal(modalId);
            });
        });

        // Close modal when clicking outside
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', function (e) {
                if (e.target === this) {
                    closeModal(this.id);
                }
            });
        });

        // Tab functionality for all modals with tabs
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const tab = this.dataset.tab;
                const tabContainer = this.closest('.modal-body');

                // Update active tab button
                const siblingTabs = this.parentElement.querySelectorAll('.tab-btn');
                siblingTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Show corresponding tab content
                const tabContents = tabContainer.querySelectorAll('.tab-content');
                tabContents.forEach(content => {
                    content.style.display = 'none';
                    if (content.id === tab + 'Tab') {
                        content.style.display = 'block';
                    }
                });
            });
        });
    }

    // ====================================
    // CONFIGURATION PANEL
    // ====================================

    function setupConfigurationEventListeners() {
        // Scheduling Rules Button
        const schedulingConfigBtn = document.getElementById('schedulingConfigBtn');
        schedulingConfigBtn.addEventListener('click', function () {
            openModal('schedulingConfigModal');
        });

        // Policies Button
        const policiesBtn = document.getElementById('policiesBtn');
        policiesBtn.addEventListener('click', function () {
            openModal('policiesModal');
        });

        // Notification Config Button
        const notificationConfigBtn = document.getElementById('notificationConfigBtn');
        notificationConfigBtn.addEventListener('click', function () {
            openModal('notificationConfigModal');
        });

        // Analytics Button
        const analyticsBtn = document.getElementById('analyticsBtn');
        analyticsBtn.addEventListener('click', function () {
            openModal('performanceAnalyticsModal');
            loadAnalyticsData();
        });
    }

    // ====================================
    // QUICK ACTIONS PANEL
    // ====================================

    function setupQuickActionsEventListeners() {
        // Print Schedule
        const printScheduleBtn = document.getElementById('printScheduleBtn');
        printScheduleBtn.addEventListener('click', function () {
            printSchedule();
        });

        // Export Appointments
        const exportAppointmentsBtn = document.getElementById('exportAppointmentsBtn');
        exportAppointmentsBtn.addEventListener('click', function () {
            exportAppointments();
        });

        // Bulk Reminders
        const bulkRemindersBtn = document.getElementById('bulkRemindersBtn');
        bulkRemindersBtn.addEventListener('click', function () {
            sendBulkReminders();
        });

        // Block Time Slots
        const blockSlotsBtn = document.getElementById('blockSlotsBtn');
        blockSlotsBtn.addEventListener('click', function () {
            openBlockSlotsModal();
        });

        // View History
        const viewHistoryBtn = document.getElementById('viewHistoryBtn');
        viewHistoryBtn.addEventListener('click', function () {
            openModal('appointmentHistoryModal');
            loadAppointmentHistory();
        });

        // Workload Management
        const workloadManagementBtn = document.getElementById('workloadManagementBtn');
        workloadManagementBtn.addEventListener('click', function () {
            openModal('workloadManagementModal');
            loadWorkloadData();
        });
    }

    // ====================================
    // NEW APPOINTMENT FORM
    // ====================================

    function setupFormEventListeners() {
        // Patient Search
        const searchPatientBtn = document.getElementById('searchPatientBtn');
        searchPatientBtn.addEventListener('click', function () {
            const searchValue = document.getElementById('patientSearchInput').value;
            searchPatients(searchValue);
        });

        // Select Patient Buttons
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('select-patient-btn')) {
                const patientId = e.target.dataset.patient;
                selectPatient(patientId);
            }
        });

        // New Patient Button
        const newPatientBtn = document.getElementById('newPatientBtn');
        newPatientBtn.addEventListener('click', function () {
            toggleNewPatientForm();
        });

        // Step Navigation
        const nextToServiceBtn = document.getElementById('nextToServiceBtn');
        nextToServiceBtn.addEventListener('click', function () {
            if (validatePatientStep()) {
                navigateToStep(2);
            }
        });

        const backToPatientBtn = document.getElementById('backToPatientBtn');
        backToPatientBtn.addEventListener('click', function () {
            navigateToStep(1);
        });

        const nextToDateTimeBtn = document.getElementById('nextToDateTimeBtn');
        nextToDateTimeBtn.addEventListener('click', function () {
            if (validateServiceStep()) {
                navigateToStep(3);
            }
        });

        const backToServiceBtn = document.getElementById('backToServiceBtn');
        backToServiceBtn.addEventListener('click', function () {
            navigateToStep(2);
        });

        const nextToDoctorBtn = document.getElementById('nextToDoctorBtn');
        nextToDoctorBtn.addEventListener('click', function () {
            if (validateDateTimeStep()) {
                navigateToStep(4);
                updateAppointmentSummary();
            }
        });

        const backToDateTimeBtn = document.getElementById('backToDateTimeBtn');
        backToDateTimeBtn.addEventListener('click', function () {
            navigateToStep(3);
        });

        const confirmBookingBtn = document.getElementById('confirmBookingBtn');
        confirmBookingBtn.addEventListener('click', function () {
            confirmBooking();
        });

        // Service Selection
        const serviceSelect = document.querySelector('select[name="selectedService"]');
        serviceSelect.addEventListener('change', function () {
            if (this.value) {
                addSelectedService(this.value, this.options[this.selectedIndex].text);
                document.getElementById('nextToDateTimeBtn').disabled = false;
            }
        });

        // Add Another Service
        const addAnotherServiceBtn = document.getElementById('addAnotherServiceBtn');
        addAnotherServiceBtn.addEventListener('click', function () {
            document.querySelector('select[name="selectedService"]').value = '';
        });

        // Date Selection
        const appointmentDatePicker = document.getElementById('appointmentDatePicker');
        appointmentDatePicker.addEventListener('change', function () {
            loadAvailableTimeSlots(this.value);
        });

        // Time Slot Selection
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('time-slot') && e.target.classList.contains('available')) {
                selectTimeSlot(e.target);
            }
        });

        // Doctor Assignment Mode
        const assignmentModeRadios = document.querySelectorAll('input[name="assignmentMode"]');
        assignmentModeRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                const manualSelection = document.getElementById('manualDoctorSelection');
                if (this.value === 'manual') {
                    manualSelection.style.display = 'block';
                } else {
                    manualSelection.style.display = 'none';
                    selectedDoctor = 'auto';
                    updateAppointmentSummary();
                }
            });
        });

        // Doctor Selection
        const doctorRadios = document.querySelectorAll('input[name="selectedDoctor"]');
        doctorRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                selectedDoctor = this.value;
                updateAppointmentSummary();
            });
        });

        // Toggle switches
        const toggleSwitches = document.querySelectorAll('.toggle-switch input');
        toggleSwitches.forEach(toggle => {
            toggle.addEventListener('change', function () {
                handleToggleChange(this);
            });
        });

        // Save buttons for various settings
        const saveButtons = document.querySelectorAll('.save-break-btn, .save-buffer-btn, .update-btn');
        saveButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                saveSettings(this);
            });
        });

        // Modal action buttons
        const savePoliciesBtn = document.getElementById('savePoliciesBtn');
        savePoliciesBtn.addEventListener('click', function () {
            savePolicies();
        });

        const saveNotificationSettingsBtn = document.getElementById('saveNotificationSettingsBtn');
        saveNotificationSettingsBtn.addEventListener('click', function () {
            saveNotificationSettings();
        });

        const saveWorkloadSettingsBtn = document.getElementById('saveWorkloadSettingsBtn');
        saveWorkloadSettingsBtn.addEventListener('click', function () {
            saveWorkloadSettings();
        });

        const savePortalSettingsBtn = document.getElementById('savePortalSettingsBtn');
        savePortalSettingsBtn.addEventListener('click', function () {
            savePortalSettings();
        });

        // Calendar Filter Apply
        const applyCalendarFiltersBtn = document.getElementById('applyCalendarFiltersBtn');
        applyCalendarFiltersBtn.addEventListener('click', function () {
            applyCalendarFilters();
        });

        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        clearFiltersBtn.addEventListener('click', function () {
            clearCalendarFilters();
        });

        // Appointment Actions
        const confirmAppointmentBtn = document.getElementById('confirmAppointmentBtn');
        confirmAppointmentBtn.addEventListener('click', function () {
            confirmAppointment();
        });

        const rescheduleAppointmentBtn = document.getElementById('rescheduleAppointmentBtn');
        rescheduleAppointmentBtn.addEventListener('click', function () {
            rescheduleAppointment();
        });

        const markCompleteBtn = document.getElementById('markCompleteBtn');
        markCompleteBtn.addEventListener('click', function () {
            markAppointmentComplete();
        });

        const cancelAppointmentBtn = document.getElementById('cancelAppointmentBtn');
        cancelAppointmentBtn.addEventListener('click', function () {
            cancelAppointment();
        });

        const markNoShowBtn = document.getElementById('markNoShowBtn');
        markNoShowBtn.addEventListener('click', function () {
            markNoShow();
        });

        const generateInvoiceBtn = document.getElementById('generateInvoiceBtn');
        generateInvoiceBtn.addEventListener('click', function () {
            generateInvoice();
        });

        // Booking Success Modal
        const sendConfirmationBtn = document.getElementById('sendConfirmationBtn');
        sendConfirmationBtn.addEventListener('click', function () {
            sendBookingConfirmation();
        });

        const createAnotherBtn = document.getElementById('createAnotherBtn');
        createAnotherBtn.addEventListener('click', function () {
            closeModal('bookingSuccessModal');
            openModal('newAppointmentModal');
            resetAppointmentForm();
        });

        // Template placeholders
        const placeholderTags = document.querySelectorAll('.placeholder-tag');
        placeholderTags.forEach(tag => {
            tag.addEventListener('click', function () {
                insertPlaceholder(this.dataset.placeholder);
            });
        });

        // Dark Mode Toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        darkModeToggle.addEventListener('click', function () {
            toggleDarkMode();
        });
    }

    // ====================================
    // CALENDAR VIEW FUNCTIONS
    // ====================================

    function updateCalendarView() {
        // Hide all views
        document.querySelectorAll('.calendar-view').forEach(view => {
            view.style.display = 'none';
        });

        // Show selected view
        const selectedView = document.getElementById(currentCalendarView + 'View');
        if (selectedView) {
            selectedView.style.display = currentCalendarView === 'day' ? 'flex' : 'block';

            // Load appropriate data based on view
            switch (currentCalendarView) {
                case 'day':
                    loadDayView();
                    break;
                case 'week':
                    loadWeekView();
                    break;
                case 'month':
                    loadMonthView();
                    break;
            }
        }
    }

    function loadDayView() {
        // Implementation for loading day view appointments
        // This would typically fetch appointments for the current day
        console.log('Loading day view for:', currentDate);
    }

    function loadWeekView() {
        // Implementation for loading week view
        const weekGrid = document.querySelector('.week-grid');
        if (weekGrid) {
            weekGrid.innerHTML = generateWeekViewHTML();
        }
    }

    function loadMonthView() {
        // Implementation for loading month view
        const monthGrid = document.querySelector('.month-grid');
        if (monthGrid) {
            monthGrid.innerHTML = generateMonthViewHTML();
        }
    }

    function generateWeekViewHTML() {
        // Generate HTML for week view
        let html = '';
        for (let i = 0; i < 7; i++) {
            html += `
                <div class="week-day-column">
                    <div class="week-appointment">
                        <span class="appointment-time">9:00 AM</span>
                        <span class="patient-name">Sample Patient</span>
                    </div>
                </div>
            `;
        }
        return html;
    }

    function generateMonthViewHTML() {
        // Generate HTML for month view
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        let html = '';
        let dayCount = 1;

        // Generate calendar grid
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const cellIndex = week * 7 + day;

                if (cellIndex < startDayOfWeek || dayCount > daysInMonth) {
                    html += '<div class="month-day other-month"></div>';
                } else {
                    const isToday = dayCount === new Date().getDate() &&
                        currentDate.getMonth() === new Date().getMonth() &&
                        currentDate.getFullYear() === new Date().getFullYear();

                    html += `
                        <div class="month-day ${isToday ? 'today' : ''}">
                            <div class="month-day-number">${dayCount}</div>
                            <div class="month-appointment">9:00 AM - Patient</div>
                        </div>
                    `;
                    dayCount++;
                }
            }
        }

        return html;
    }

    function navigatePeriod(direction) {
        switch (currentCalendarView) {
            case 'day':
                currentDate.setDate(currentDate.getDate() + direction);
                break;
            case 'week':
                currentDate.setDate(currentDate.getDate() + (direction * 7));
                break;
            case 'month':
                currentDate.setMonth(currentDate.getMonth() + direction);
                break;
        }

        updateCurrentPeriodDisplay();
        updateCalendarView();
    }

    function updateCurrentPeriodDisplay() {
        const periodDisplay = document.getElementById('currentPeriod');

        switch (currentCalendarView) {
            case 'day':
                periodDisplay.textContent = formatDate(currentDate, 'long');
                break;
            case 'week':
                const weekStart = new Date(currentDate);
                weekStart.setDate(currentDate.getDate() - currentDate.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                periodDisplay.textContent = `${formatDate(weekStart, 'short')} - ${formatDate(weekEnd, 'short')}`;
                break;
            case 'month':
                periodDisplay.textContent = formatDate(currentDate, 'month');
                break;
        }
    }

    // ====================================
    // APPOINTMENT MANAGEMENT
    // ====================================

    function openAppointmentDetails(appointmentId) {
        const appointment = mockAppointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            currentAppointmentId = appointmentId;

            // Populate appointment details
            document.getElementById('detailPatientName').textContent = appointment.patientName;
            document.getElementById('detailPatientPhone').textContent = 'Phone: +254 712 345 678';
            document.getElementById('detailPatientEmail').textContent = 'Email: john.mwangi@email.com';
            document.getElementById('detailPatientID').textContent = `Patient ID: ${appointment.patientId}`;

            document.getElementById('detailServiceName').textContent = appointment.serviceName;
            document.getElementById('detailServiceDuration').textContent = `${appointment.duration} minutes`;
            document.getElementById('detailServiceCost').textContent = `KES. ${appointment.cost.toLocaleString()}`;

            document.getElementById('detailAppointmentDate').textContent = formatDate(new Date(appointment.date), 'long');
            document.getElementById('detailAppointmentTime').textContent = appointment.time;
            document.getElementById('detailDoctorName').textContent = appointment.doctorName;
            document.getElementById('detailDoctorSpecialty').textContent = 'General Practice';

            // Update status badge
            const statusBadge = document.getElementById('detailStatus');
            statusBadge.className = `status-badge ${appointment.status}`;
            statusBadge.innerHTML = `<i class="fas fa-circle"></i> ${capitalizeFirst(appointment.status)}`;

            openModal('appointmentDetailsModal');
        }
    }

    function openNewAppointmentWithTime(time) {
        openModal('newAppointmentModal');
        resetAppointmentForm();

        // Pre-select the time if on date/time step
        selectedTimeSlot = time;

        // You might want to jump directly to time selection step
        // navigateToStep(3);
    }

    function searchAppointments(query) {
        if (!query) {
            // Reset to show all appointments
            updateCalendarView();
            return;
        }

        // Filter appointments based on query
        const filtered = mockAppointments.filter(apt =>
            apt.patientName.toLowerCase().includes(query.toLowerCase()) ||
            apt.doctorName.toLowerCase().includes(query.toLowerCase()) ||
            apt.serviceName.toLowerCase().includes(query.toLowerCase())
        );

        // Update display with filtered results
        console.log('Filtered appointments:', filtered);
    }

    // ====================================
    // MULTI-STEP FORM FUNCTIONS
    // ====================================

    function navigateToStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show selected step
        const steps = ['patientStep', 'serviceStep', 'dateTimeStep', 'doctorStep'];
        const selectedStep = document.getElementById(steps[stepNumber - 1]);
        if (selectedStep) {
            selectedStep.classList.add('active');
        }

        // Update step indicator
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index < stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    function validatePatientStep() {
        if (!selectedPatient) {
            showToast('Please select or register a patient', 'error');
            return false;
        }
        return true;
    }

    function validateServiceStep() {
        if (selectedServices.length === 0) {
            showToast('Please select at least one service', 'error');
            return false;
        }
        return true;
    }

    function validateDateTimeStep() {
        const appointmentDate = document.getElementById('appointmentDatePicker').value;
        if (!appointmentDate || !selectedTimeSlot) {
            showToast('Please select date and time', 'error');
            return false;
        }
        return true;
    }

    function searchPatients(query) {
        // Simulate patient search
        console.log('Searching patients:', query);

        // In real implementation, this would be an API call
        const results = document.getElementById('patientSearchResults');
        results.style.display = 'block';
    }

    function selectPatient(patientId) {
        selectedPatient = patientId;

        // Highlight selected patient
        document.querySelectorAll('.patient-result').forEach(result => {
            result.classList.remove('selected');
        });

        const selectedResult = document.querySelector(`.patient-result[data-patient="${patientId}"]`);
        if (selectedResult) {
            selectedResult.classList.add('selected');
        }

        // Enable next button
        document.getElementById('nextToServiceBtn').disabled = false;

        showToast('Patient selected', 'success');
    }

    function toggleNewPatientForm() {
        const form = document.getElementById('newPatientForm');
        const isVisible = form.style.display === 'block';
        form.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            // Focus on first input
            form.querySelector('input').focus();
        }
    }

    function addSelectedService(serviceId, serviceName) {
        if (!selectedServices.find(s => s.id === serviceId)) {
            selectedServices.push({ id: serviceId, name: serviceName });
            updateSelectedServicesList();
        }
    }

    function updateSelectedServicesList() {
        const container = document.getElementById('selectedServicesList');

        if (selectedServices.length > 0) {
            container.innerHTML = selectedServices.map(service => `
                <div class="selected-service-item">
                    <span>${service.name}</span>
                    <button class="remove-service-btn" data-service="${service.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');

            container.style.display = 'block';

            // Add remove listeners
            container.querySelectorAll('.remove-service-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    removeSelectedService(this.dataset.service);
                });
            });
        } else {
            container.style.display = 'none';
        }
    }

    function removeSelectedService(serviceId) {
        selectedServices = selectedServices.filter(s => s.id !== serviceId);
        updateSelectedServicesList();

        if (selectedServices.length === 0) {
            document.getElementById('nextToDateTimeBtn').disabled = true;
        }
    }

    function loadAvailableTimeSlots(date) {
        // Simulate loading available time slots
        const slotsGrid = document.getElementById('timeSlotsGrid');

        // In real implementation, this would check against existing appointments
        console.log('Loading time slots for:', date);
    }

    function selectTimeSlot(slotElement) {
        // Remove previous selection
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });

        // Mark as selected
        slotElement.classList.add('selected');
        selectedTimeSlot = slotElement.dataset.time;

        // Enable next button
        document.getElementById('nextToDoctorBtn').disabled = false;
    }

    function updateAppointmentSummary() {
        // Update summary with selected values
        if (selectedPatient) {
            const patientName = document.querySelector(`.patient-result[data-patient="${selectedPatient}"] h5`).textContent;
            document.getElementById('summaryPatient').textContent = patientName;
        }

        if (selectedServices.length > 0) {
            document.getElementById('summaryService').textContent = selectedServices.map(s => s.name).join(', ');

            // Calculate total cost
            const totalCost = selectedServices.length * 1500; // Mock calculation
            document.getElementById('summaryCost').textContent = `KES. ${totalCost.toLocaleString()}`;
        }

        const appointmentDate = document.getElementById('appointmentDatePicker').value;
        if (appointmentDate && selectedTimeSlot) {
            const formattedDate = formatDate(new Date(appointmentDate), 'long');
            document.getElementById('summaryDateTime').textContent = `${formattedDate} at ${selectedTimeSlot}`;
        }

        const totalDuration = selectedServices.length * 30; // Mock calculation
        document.getElementById('summaryDuration').textContent = `${totalDuration} minutes`;

        if (selectedDoctor && selectedDoctor !== 'auto') {
            const doctorName = document.querySelector(`input[value="${selectedDoctor}"]`).closest('.doctor-option').querySelector('h6').textContent;
            document.getElementById('summaryDoctor').textContent = doctorName;
        } else {
            document.getElementById('summaryDoctor').textContent = 'Auto-assigned';
        }
    }

    function confirmBooking() {
        // Validate all required fields
        if (!selectedPatient || selectedServices.length === 0 || !selectedTimeSlot) {
            showToast('Please complete all required fields', 'error');
            return;
        }

        // Create new appointment
        const newAppointment = {
            id: 'APT' + (mockAppointments.length + 1).toString().padStart(3, '0'),
            patientId: selectedPatient,
            services: selectedServices,
            date: document.getElementById('appointmentDatePicker').value,
            time: selectedTimeSlot,
            doctor: selectedDoctor,
            status: 'confirmed'
        };

        // Save appointment (in real app, this would be an API call)
        console.log('Creating appointment:', newAppointment);

        // Close new appointment modal
        closeModal('newAppointmentModal');

        // Show success modal
        openModal('bookingSuccessModal');

        // Update calendar view
        updateCalendarView();
    }

    function resetAppointmentForm() {
        // Reset all form fields and states
        selectedPatient = null;
        selectedServices = [];
        selectedTimeSlot = null;
        selectedDoctor = null;

        // Reset form inputs
        document.getElementById('patientSearchInput').value = '';
        document.getElementById('patientSearchResults').style.display = 'none';
        document.getElementById('newPatientForm').style.display = 'none';
        document.querySelector('select[name="selectedService"]').value = '';
        document.getElementById('selectedServicesList').style.display = 'none';
        document.getElementById('appointmentDatePicker').value = '';

        // Reset time slots
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });

        // Reset doctor selection
        document.querySelector('input[name="assignmentMode"][value="auto"]').checked = true;
        document.getElementById('manualDoctorSelection').style.display = 'none';

        // Disable next buttons
        document.getElementById('nextToServiceBtn').disabled = true;
        document.getElementById('nextToDateTimeBtn').disabled = true;
        document.getElementById('nextToDoctorBtn').disabled = true;

        // Navigate to first step
        navigateToStep(1);
    }

    // ====================================
    // APPOINTMENT ACTIONS
    // ====================================

    function confirmAppointment() {
        updateAppointmentStatus(currentAppointmentId, 'confirmed');
        showToast('Appointment confirmed', 'success');
    }

    function rescheduleAppointment() {
        // Open reschedule modal or interface
        closeModal('appointmentDetailsModal');
        openModal('newAppointmentModal');
        // Pre-populate with appointment data
        showToast('Reschedule interface opened', 'info');
    }

    function markAppointmentComplete() {
        updateAppointmentStatus(currentAppointmentId, 'completed');
        showToast('Appointment marked as complete', 'success');
    }

    function cancelAppointment() {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            updateAppointmentStatus(currentAppointmentId, 'cancelled');
            showToast('Appointment cancelled', 'warning');
        }
    }

    function markNoShow() {
        updateAppointmentStatus(currentAppointmentId, 'no-show');
        showToast('Appointment marked as no-show', 'warning');
    }

    function generateInvoice() {
        closeModal('appointmentDetailsModal');
        showToast('Redirecting to billing...', 'info');
        // In real app, navigate to billing page
        setTimeout(() => {
            window.location.href = 'billings_and_payments.html';
        }, 1500);
    }

    function updateAppointmentStatus(appointmentId, newStatus) {
        const appointment = mockAppointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            appointment.status = newStatus;

            // Update UI
            closeModal('appointmentDetailsModal');
            updateCalendarView();

            // In real app, this would be an API call
            console.log('Updated appointment:', appointment);
        }
    }

    // ====================================
    // SETTINGS & CONFIGURATION
    // ====================================

    function savePolicies() {
        // Collect all policy settings
        const policies = {
            cancellationCutoff: document.querySelector('select[name="cancellationCutoff"]').value,
            enableCancellationFee: document.querySelector('input[name="enableCancellationFee"]').checked,
            rescheduleLimit: document.querySelector('select[name="rescheduleLimit"]').value,
            noshowThreshold: document.querySelector('select[name="noshowThreshold"]').value
        };

        console.log('Saving policies:', policies);
        showToast('Policies saved successfully', 'success');
        closeModal('policiesModal');
    }

    function saveNotificationSettings() {
        // Collect notification settings
        const settings = {
            bookingConfirmation: document.querySelector('input[name="bookingConfirmation"]').checked,
            reminder24h: document.querySelector('input[name="reminder24h"]').checked,
            reminder1h: document.querySelector('input[name="reminder1h"]').checked,
            smsEnabled: document.querySelector('input[name="smsEnabled"]').checked,
            emailEnabled: document.querySelector('input[name="emailEnabled"]').checked
        };

        console.log('Saving notification settings:', settings);
        showToast('Notification settings saved', 'success');
        closeModal('notificationConfigModal');
    }

    function saveWorkloadSettings() {
        // Collect workload settings
        const settings = {
            assignmentMode: document.querySelector('input[name="assignmentMode"]:checked').value,
            respectSpecialty: document.querySelector('input[name="respectSpecialty"]').checked,
            balanceWorkload: document.querySelector('input[name="balanceWorkload"]').checked
        };

        console.log('Saving workload settings:', settings);
        showToast('Workload settings saved', 'success');
        closeModal('workloadManagementModal');
    }

    function savePortalSettings() {
        // Collect portal settings
        const settings = {
            enableSelfBooking: document.querySelector('input[name="enableSelfBooking"]').checked,
            samedayPolicy: document.querySelector('input[name="samedayPolicy"]:checked').value,
            autoBlock: document.querySelector('input[name="autoBlock"]').checked
        };

        console.log('Saving portal settings:', settings);
        showToast('Portal settings saved', 'success');
        closeModal('patientPortalSettingsModal');
    }

    function handleToggleChange(toggle) {
        const name = toggle.name;
        const isChecked = toggle.checked;

        // Handle specific toggle behaviors
        if (name === 'enableCancellationFee' && isChecked) {
            document.querySelector('.fee-amount-section').style.display = 'block';
        } else if (name === 'enableCancellationFee' && !isChecked) {
            document.querySelector('.fee-amount-section').style.display = 'none';
        }

        console.log(`Toggle ${name} changed to:`, isChecked);
    }

    function saveSettings(button) {
        // Generic save function for various settings
        const settingType = button.classList.contains('save-break-btn') ? 'break' :
            button.classList.contains('save-buffer-btn') ? 'buffer' : 'duration';

        showToast(`${capitalizeFirst(settingType)} settings saved`, 'success');
    }

    // ====================================
    // ANALYTICS & REPORTING
    // ====================================

    function loadAnalyticsData() {
        // Simulate loading analytics data
        console.log('Loading analytics data...');

        // In real app, fetch data and render charts
        setTimeout(() => {
            showToast('Analytics data loaded', 'success');
        }, 1000);
    }

    function loadAppointmentHistory() {
        // Load appointment history
        console.log('Loading appointment history...');
    }

    function loadWorkloadData() {
        // Load workload data
        console.log('Loading workload data...');
    }

    // ====================================
    // QUICK ACTIONS
    // ====================================

    function printSchedule() {
        window.print();
        showToast('Print dialog opened', 'info');
    }

    function exportAppointments() {
        // Simulate export
        const format = confirm('Export as CSV? (OK for CSV, Cancel for PDF)') ? 'CSV' : 'PDF';
        showToast(`Exporting appointments as ${format}...`, 'info');

        setTimeout(() => {
            showToast(`Appointments exported as ${format}`, 'success');
        }, 2000);
    }

    function sendBulkReminders() {
        if (confirm('Send reminders to all patients with appointments tomorrow?')) {
            showToast('Sending bulk reminders...', 'info');

            setTimeout(() => {
                showToast('8 reminders sent successfully', 'success');
            }, 2000);
        }
    }

    function openBlockSlotsModal() {
        // Would open a modal to block time slots
        showToast('Block time slots feature coming soon', 'info');
    }

    function sendBookingConfirmation() {
        const sendSMS = document.querySelector('input[name="sendSMS"]').checked;
        const sendEmail = document.querySelector('input[name="sendEmail"]').checked;

        if (sendSMS || sendEmail) {
            const methods = [];
            if (sendSMS) methods.push('SMS');
            if (sendEmail) methods.push('Email');

            showToast(`Sending confirmation via ${methods.join(' and ')}...`, 'info');

            setTimeout(() => {
                showToast('Confirmation sent successfully', 'success');
                closeModal('bookingSuccessModal');
            }, 1500);
        } else {
            closeModal('bookingSuccessModal');
        }
    }

    // ====================================
    // CALENDAR FILTERS
    // ====================================

    function applyCalendarFilters() {
        // Collect filter values
        const filters = {
            startDate: document.querySelector('input[name="startDate"]').value,
            endDate: document.querySelector('input[name="endDate"]').value,
            doctors: Array.from(document.querySelectorAll('input[name="doctorFilter"]:checked')).map(cb => cb.value),
            serviceCategory: document.querySelector('select[name="serviceCategory"]').value,
            statuses: Array.from(document.querySelectorAll('input[name="statusFilter"]:checked')).map(cb => cb.value)
        };

        console.log('Applying filters:', filters);

        // Apply filters to calendar view
        closeModal('calendarFilterModal');
        updateCalendarView();
        showToast('Filters applied', 'success');
    }

    function clearCalendarFilters() {
        // Reset all filter inputs
        document.querySelector('input[name="startDate"]').value = '';
        document.querySelector('input[name="endDate"]').value = '';
        document.querySelectorAll('input[name="doctorFilter"]').forEach(cb => cb.checked = true);
        document.querySelector('select[name="serviceCategory"]').value = '';
        document.querySelectorAll('input[name="statusFilter"]').forEach(cb => cb.checked = true);

        showToast('Filters cleared', 'info');
    }

    // ====================================
    // TEMPLATE EDITOR
    // ====================================

    function insertPlaceholder(placeholder) {
        const textarea = document.querySelector('.template-textarea');
        const cursorPos = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, cursorPos);
        const textAfter = textarea.value.substring(cursorPos);

        textarea.value = textBefore + placeholder + textAfter;
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = cursorPos + placeholder.length;
    }

    // ====================================
    // UI UTILITY FUNCTIONS
    // ====================================

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

    function toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    function closeAllDropdowns() {
        document.querySelectorAll('.user-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }

    function toggleNotificationsPanel() {
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.classList.toggle('show');
        }
    }

    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${iconMap[type]} toast-icon"></i>
            <div class="toast-content">
                <div class="toast-title">${capitalizeFirst(type)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', function () {
            toast.remove();
        });
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);

        const icon = document.querySelector('#darkModeToggle i');
        icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }

    function initializeTooltips() {
        // Initialize tooltips if using a library
        console.log('Tooltips initialized');
    }

    // ====================================
    // HELPER FUNCTIONS
    // ====================================

    function formatDate(date, format = 'short') {
        const options = {
            short: { month: 'short', day: 'numeric', year: 'numeric' },
            long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
            month: { month: 'long', year: 'numeric' }
        };

        return date.toLocaleDateString('en-US', options[format]);
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
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
    // INITIALIZE APPLICATION
    // ====================================

    init();

    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('#darkModeToggle i').className = 'fas fa-sun';
    }

    // Log initialization
    console.log('Curis Appointments System initialized successfully');
});


// ====================================
// ADDITIONAL EVENT LISTENERS FOR EDGE CASES
// ====================================

window.addEventListener('resize', function () {
    // Handle responsive behavior
    if (window.innerWidth < 768) {
        // Mobile view adjustments
        document.querySelector('.sidebar').classList.remove('show');
    }
});

// Handle back button for modals
window.addEventListener('popstate', function (e) {
    // Close any open modals when browser back button is pressed
    document.querySelectorAll('.modal.show').forEach(modal => {
        modal.classList.remove('show');
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // ESC key closes modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = '';
    }

    // Ctrl/Cmd + N for new appointment
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        document.getElementById('newAppointmentBtn').click();
    }

    // Ctrl/Cmd + P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        document.getElementById('printScheduleBtn').click();
    }
});

// Auto-save functionality for forms
let autoSaveTimer;
document.addEventListener('input', function (e) {
    if (e.target.matches('input, textarea, select')) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            console.log('Auto-saving form data...');
            // Implement auto-save logic
        }, 2000);
    }
});

// Handle online/offline status
window.addEventListener('online', function () {
    showToast('Connection restored', 'success');
});

window.addEventListener('offline', function () {
    showToast('No internet connection', 'error');
});

// Prevent accidental navigation
window.addEventListener('beforeunload', function (e) {
    const hasUnsavedChanges = document.querySelector('.modal.show') !== null;
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});
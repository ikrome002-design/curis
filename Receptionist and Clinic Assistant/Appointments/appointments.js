/**
 * ========================================
 * CURIS APPOINTMENTS JAVASCRIPT
 * Scheduling Hub Complete Implementation
 * Version: 1.0.0
 * ========================================
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // GLOBAL STATE MANAGEMENT
    // ========================================
    const state = {
        currentView: 'list',
        appointments: [],
        doctors: [],
        patients: [],
        selectedDate: new Date(),
        selectedDoctor: null,
        selectedPatient: null,
        selectedTimeSlot: null,
        filters: {
            status: ['confirmed', 'pending'],
            doctor: 'all',
            dateRange: { start: null, end: null }
        },
        reminders: {
            twentyFourHour: true,
            oneHour: true,
            custom: false,
            customHours: 2
        },
        conflicts: [],
        auditLog: [],
        notifications: [],
        syncInterval: null,
        realTimeInterval: null,
        communicationQueue: []
    };

    // ========================================
    // INITIALIZATION
    // ========================================
    function init() {
        console.log('Initializing Appointments System...');
        
        // Load initial data
        loadAppointments();
        loadDoctors();
        loadPatients();
        
        // Setup event listeners
        initializeEventListeners();
        initializeModalHandlers();
        initializeViewToggles();
        initializeFilterSystem();
        initializeDragDrop();
        initializeRealTimeUpdates();
        initializeKeyboardShortcuts();
        initializeNotificationSystem();
        
        // Start sync engines
        startDataSync();
        startConflictMonitoring();
        
        // Load user preferences
        loadUserPreferences();
        
        console.log('Appointments System Initialized Successfully');
    }

    // ========================================
    // DATA LOADING
    // ========================================
    function loadAppointments() {
        // Simulate loading appointments from server
        state.appointments = [
            {
                id: 'APT001',
                patientId: 'P001',
                patientName: 'John Mwangi',
                doctorId: 'D001',
                doctorName: 'Dr. James Ochieng',
                date: '2025-09-27',
                time: '09:00',
                duration: 30,
                status: 'confirmed',
                room: 'Room 101',
                visitReason: 'General Consultation',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'APT002',
                patientId: 'P002',
                patientName: 'Mary Njeri',
                doctorId: 'D002',
                doctorName: 'Dr. Mary Kamau',
                date: '2025-09-27',
                time: '09:30',
                duration: 45,
                status: 'pending',
                room: 'Room 102',
                visitReason: 'Follow-up',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'APT003',
                patientId: 'P003',
                patientName: 'Peter Omondi',
                doctorId: 'D003',
                doctorName: 'Dr. Peter Mutua',
                date: '2025-09-27',
                time: '10:00',
                duration: 30,
                status: 'completed',
                room: 'Room 103',
                visitReason: 'Checkup',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        renderAppointmentsList();
    }

    function loadDoctors() {
        state.doctors = [
            {
                id: 'D001',
                name: 'Dr. James Ochieng',
                specialization: 'Cardiologist',
                status: 'available',
                room: 'Room 101',
                queueCount: 3,
                schedule: generateDoctorSchedule('D001')
            },
            {
                id: 'D002',
                name: 'Dr. Mary Kamau',
                specialization: 'Pediatrician',
                status: 'consultation',
                room: 'Room 102',
                queueCount: 5,
                schedule: generateDoctorSchedule('D002')
            },
            {
                id: 'D003',
                name: 'Dr. Peter Mutua',
                specialization: 'Orthopedic',
                status: 'available',
                room: 'Room 103',
                queueCount: 0,
                schedule: generateDoctorSchedule('D003')
            }
        ];
        
        updateDoctorAvailability();
    }

    function loadPatients() {
        state.patients = [
            { id: 'P001', name: 'John Mwangi', phone: '+254712345678', email: 'john@example.com' },
            { id: 'P002', name: 'Mary Njeri', phone: '+254723456789', email: 'mary@example.com' },
            { id: 'P003', name: 'Peter Omondi', phone: '+254734567890', email: 'peter@example.com' }
        ];
    }

    function generateDoctorSchedule(doctorId) {
        const schedule = {};
        const today = new Date().toISOString().split('T')[0];
        const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'];
        
        schedule[today] = timeSlots.map(time => ({
            time: time,
            available: Math.random() > 0.3,
            patientId: null
        }));
        
        return schedule;
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    function initializeEventListeners() {
        // Quick Action Buttons
        const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');
        const viewToggleBtn = document.getElementById('viewToggleBtn');
        const filterBtn = document.getElementById('filterBtn');
        const remindersBtn = document.getElementById('remindersBtn');
        const auditLogBtn = document.getElementById('auditLogBtn');
        
        if (bookAppointmentBtn) {
            bookAppointmentBtn.addEventListener('click', openBookingModal);
        }
        
        if (viewToggleBtn) {
            viewToggleBtn.addEventListener('click', toggleViewMode);
        }
        
        if (filterBtn) {
            filterBtn.addEventListener('click', openFilterModal);
        }
        
        if (remindersBtn) {
            remindersBtn.addEventListener('click', openReminderConfigModal);
        }
        
        if (auditLogBtn) {
            auditLogBtn.addEventListener('click', openAuditExportModal);
        }
        
        // Profile & Notifications
        const profileIcon = document.getElementById('profileIcon');
        const notificationBtn = document.getElementById('notificationBtn');
        const darkModeToggle = document.getElementById('darkModeToggle');
        
        if (profileIcon) {
            profileIcon.addEventListener('click', toggleProfilePopup);
        }
        
        if (notificationBtn) {
            notificationBtn.addEventListener('click', showNotificationCenter);
        }
        
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', toggleDarkMode);
        }
        
        // Appointment Actions
        document.addEventListener('click', function(e) {
            // Handle appointment action buttons
            if (e.target.closest('.action-icon')) {
                handleAppointmentAction(e);
            }
            
            // Handle management buttons
            if (e.target.closest('.stat-action')) {
                handleStatAction(e);
            }
            
            // Handle manage buttons
            if (e.target.closest('.manage-btn')) {
                handleManageAction(e);
            }
            
            // Handle channel buttons
            if (e.target.closest('.channel-btn')) {
                toggleChannelSelection(e);
            }
            
            // Handle communication buttons
            if (e.target.closest('.comm-btn')) {
                handleCommunicationAction(e);
            }
            
            // Handle retry buttons
            if (e.target.closest('.retry-btn')) {
                retryMessageDelivery(e);
            }
            
            // Handle conflict resolution
            if (e.target.closest('.resolve-btn')) {
                openConflictModal(e);
            }
        });
        
        // Close profile popup on outside click
        document.addEventListener('click', function(e) {
            const profilePopup = document.getElementById('profilePopup');
            if (profilePopup && !profilePopup.contains(e.target) && 
                e.target.id !== 'profileIcon') {
                profilePopup.classList.remove('active');
            }
        });
    }

    // ========================================
    // VIEW TOGGLES
    // ========================================
    function initializeViewToggles() {
        const viewButtons = document.querySelectorAll('.view-btn');
        
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const view = this.dataset.view;
                switchView(view);
            });
        });
    }

    function switchView(view) {
        state.currentView = view;
        
        const listView = document.getElementById('listView');
        const calendarView = document.getElementById('calendarView');
        const viewButtons = document.querySelectorAll('.view-btn');
        
        viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        if (view === 'calendar') {
            listView?.classList.add('hidden');
            calendarView?.classList.remove('hidden');
            renderCalendarView();
        } else {
            listView?.classList.remove('hidden');
            calendarView?.classList.add('hidden');
            renderAppointmentsList();
        }
    }

    function toggleViewMode() {
        const newView = state.currentView === 'list' ? 'calendar' : 'list';
        switchView(newView);
        
        const viewToggleBtn = document.getElementById('viewToggleBtn');
        if (viewToggleBtn) {
            const icon = viewToggleBtn.querySelector('i');
            const text = viewToggleBtn.querySelector('span');
            
            if (newView === 'calendar') {
                icon.className = 'fas fa-list';
                text.textContent = 'List View';
            } else {
                icon.className = 'fas fa-calendar-alt';
                text.textContent = 'Calendar View';
            }
        }
    }

    // ========================================
    // RENDER FUNCTIONS
    // ========================================
    function renderAppointmentsList() {
        const listView = document.getElementById('listView');
        if (!listView) return;
        
        const filteredAppointments = filterAppointments(state.appointments);
        
        listView.innerHTML = filteredAppointments.map(apt => `
            <div class="appointment-item ${apt.status}" data-id="${apt.id}">
                <div class="appt-time">
                    <span class="time">${apt.time}</span>
                    <span class="duration">${apt.duration} min</span>
                </div>
                <div class="appt-details">
                    <div class="patient-info">
                        <img src="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-30.png" 
                             alt="Patient" class="patient-avatar">
                        <div class="patient-details">
                            <span class="patient-name">${apt.patientName}</span>
                            <span class="visit-reason">${apt.visitReason}</span>
                        </div>
                    </div>
                    <div class="doctor-info">
                        <span class="doctor-name">${apt.doctorName}</span>
                        <span class="room">${apt.room}</span>
                    </div>
                </div>
                <div class="appt-status">
                    <span class="status-badge ${apt.status}">
                        ${getStatusIcon(apt.status)} ${getStatusText(apt.status)}
                    </span>
                </div>
                <div class="appt-actions">
                    ${getActionButtons(apt.status)}
                </div>
            </div>
        `).join('');
    }

    function renderCalendarView() {
        const calendarView = document.getElementById('calendarView');
        if (!calendarView) return;
        
        const calendar = generateCalendarHTML();
        const calendarGrid = calendarView.querySelector('.calendar-grid');
        if (calendarGrid) {
            calendarGrid.innerHTML = calendar;
        }
        
        // Add calendar navigation
        const prevBtn = calendarView.querySelector('.calendar-nav.prev');
        const nextBtn = calendarView.querySelector('.calendar-nav.next');
        
        if (prevBtn) {
            prevBtn.onclick = () => navigateCalendar(-1);
        }
        
        if (nextBtn) {
            nextBtn.onclick = () => navigateCalendar(1);
        }
    }

    function generateCalendarHTML() {
        const year = state.selectedDate.getFullYear();
        const month = state.selectedDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let html = '<div class="calendar-weekdays">';
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            html += `<div class="weekday">${day}</div>`;
        });
        html += '</div><div class="calendar-days">';
        
        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const appointmentCount = state.appointments.filter(apt => apt.date === date).length;
            
            html += `
                <div class="calendar-day" data-date="${date}">
                    <span class="day-number">${day}</span>
                    ${appointmentCount > 0 ? `<span class="appointment-count">${appointmentCount}</span>` : ''}
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    function navigateCalendar(direction) {
        state.selectedDate.setMonth(state.selectedDate.getMonth() + direction);
        updateCalendarHeader();
        renderCalendarView();
    }

    function updateCalendarHeader() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const monthElement = document.querySelector('.calendar-month');
        if (monthElement) {
            monthElement.textContent = `${monthNames[state.selectedDate.getMonth()]} ${state.selectedDate.getFullYear()}`;
        }
    }

    // ========================================
    // FILTER SYSTEM
    // ========================================
    function initializeFilterSystem() {
        // This will be called when filter modal opens
    }

    function filterAppointments(appointments) {
        return appointments.filter(apt => {
            // Status filter
            if (!state.filters.status.includes(apt.status)) {
                return false;
            }
            
            // Doctor filter
            if (state.filters.doctor !== 'all' && apt.doctorId !== state.filters.doctor) {
                return false;
            }
            
            // Date range filter
            if (state.filters.dateRange.start && new Date(apt.date) < new Date(state.filters.dateRange.start)) {
                return false;
            }
            
            if (state.filters.dateRange.end && new Date(apt.date) > new Date(state.filters.dateRange.end)) {
                return false;
            }
            
            return true;
        });
    }

    // ========================================
    // APPOINTMENT ACTIONS
    // ========================================
    function handleAppointmentAction(e) {
        const btn = e.target.closest('.action-icon');
        const appointmentItem = btn.closest('.appointment-item');
        const appointmentId = appointmentItem?.dataset.id;
        
        if (!appointmentId) return;
        
        const appointment = state.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) return;
        
        const title = btn.getAttribute('title');
        
        switch(title) {
            case 'Check-in':
                checkInPatient(appointment);
                break;
            case 'Confirm':
                confirmAppointment(appointment);
                break;
            case 'Reschedule':
                openRescheduleModal(appointment);
                break;
            case 'Cancel':
                openCancelModal(appointment);
                break;
            case 'View Details':
                viewAppointmentDetails(appointment);
                break;
            case 'Generate Invoice':
                generateInvoice(appointment);
                break;
            case 'More':
                showMoreOptions(appointment);
                break;
        }
    }

    function checkInPatient(appointment) {
        appointment.status = 'checked-in';
        appointment.checkedInAt = new Date().toISOString();
        
        // Update queue
        syncToQueue(appointment);
        
        // Log action
        logAction('CHECK_IN', appointment);
        
        // Show notification
        showNotification('Patient checked in successfully', 'success');
        
        // Refresh display
        renderAppointmentsList();
    }

    function confirmAppointment(appointment) {
        appointment.status = 'confirmed';
        appointment.confirmedAt = new Date().toISOString();
        
        // Send confirmation message
        sendConfirmationMessage(appointment);
        
        // Log action
        logAction('CONFIRM', appointment);
        
        // Show notification
        showNotification('Appointment confirmed', 'success');
        
        // Refresh display
        renderAppointmentsList();
        
        // Update metrics
        updateManagementStats();
    }

    function sendConfirmationMessage(appointment) {
        const message = generateConfirmationMessage(appointment);
        
        state.communicationQueue.push({
            id: 'MSG' + Date.now(),
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            message: message,
            channels: ['sms', 'email'],
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        
        processCommunicationQueue();
    }

    function generateConfirmationMessage(appointment) {
        const template = state.reminders.template || 
            'Dear [Patient Name], This is a confirmation for your appointment with [Doctor Name] on [Date] at [Time]. Please arrive 15 minutes early.';
        
        return template
            .replace('[Patient Name]', appointment.patientName)
            .replace('[Doctor Name]', appointment.doctorName)
            .replace('[Date]', appointment.date)
            .replace('[Time]', appointment.time);
    }

    // ========================================
    // MODAL HANDLERS
    // ========================================
    function initializeModalHandlers() {
        // Close modal buttons
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').classList.remove('active');
            });
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                }
            }
        });
        
        // Close on background click
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });
        
        // Booking Modal specific handlers
        initializeBookingModal();
        
        // Filter Modal handlers
        initializeFilterModal();
        
        // Quick Registration handlers
        initializeQuickRegistration();
        
        // Reminder Config handlers
        initializeReminderConfig();
        
        // Conflict Resolution handlers
        initializeConflictResolution();
        
        // Audit Export handlers
        initializeAuditExport();
        
        // Communication Panel handlers
        initializeCommunicationPanel();
    }

    function openBookingModal() {
        const modal = document.getElementById('bookingModal');
        if (modal) {
            modal.classList.add('active');
            initializeBookingForm();
        }
    }

    function initializeBookingModal() {
        const newPatientBtn = document.getElementById('newPatientBtn');
        if (newPatientBtn) {
            newPatientBtn.addEventListener('click', openQuickRegistration);
        }
        
        // Time slot selection
        const modal = document.getElementById('bookingModal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target.classList.contains('time-slot') && 
                    e.target.classList.contains('available')) {
                    selectTimeSlot(e.target);
                }
            });
            
            // Auto-suggest button
            const autoSuggestBtn = modal.querySelector('.btn-outline');
            if (autoSuggestBtn) {
                autoSuggestBtn.addEventListener('click', autoSuggestTimeSlots);
            }
            
            // Confirm booking
            const confirmBtn = modal.querySelector('.btn-primary');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', confirmBooking);
            }
        }
    }

    function initializeBookingForm() {
        // Load doctors into selector
        const doctorGrid = document.querySelector('.doctor-selection-grid');
        if (doctorGrid) {
            doctorGrid.innerHTML = state.doctors.map(doc => `
                <div class="doctor-option">
                    <input type="radio" name="doctor" id="doctor_${doc.id}" value="${doc.id}">
                    <label for="doctor_${doc.id}">
                        <span class="doc-name">${doc.name}</span>
                        <span class="doc-spec">${doc.specialization}</span>
                        <span class="doc-available">Next: ${getNextAvailableSlot(doc.id)}</span>
                    </label>
                </div>
            `).join('');
        }
        
        // Set date constraints
        const dateInput = document.querySelector('#bookingModal input[type="date"]');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = today;
            dateInput.addEventListener('change', updateAvailableSlots);
        }
    }

    function selectTimeSlot(slotElement) {
        // Clear previous selection
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Select new slot
        slotElement.classList.add('selected');
        state.selectedTimeSlot = slotElement.textContent;
    }

    function autoSuggestTimeSlots() {
        const selectedDoctor = document.querySelector('input[name="doctor"]:checked');
        if (!selectedDoctor) {
            showNotification('Please select a doctor first', 'warning');
            return;
        }
        
        const doctorId = selectedDoctor.value;
        const doctor = state.doctors.find(d => d.id === doctorId);
        
        if (doctor && doctor.schedule) {
            const today = new Date().toISOString().split('T')[0];
            const availableSlots = doctor.schedule[today]?.filter(slot => slot.available) || [];
            
            if (availableSlots.length > 0) {
                // Suggest first 3 available slots
                const suggestions = availableSlots.slice(0, 3);
                showNotification(`Suggested slots: ${suggestions.map(s => s.time).join(', ')}`, 'info');
                
                // Highlight suggested slots
                const slotElements = document.querySelectorAll('.time-slot');
                slotElements.forEach(el => {
                    if (suggestions.some(s => s.time === el.textContent)) {
                        el.style.border = '2px solid #00BFA5';
                    }
                });
            } else {
                showNotification('No available slots for today. Try another date.', 'warning');
            }
        }
    }

    function confirmBooking() {
        const patientName = document.querySelector('#bookingModal input[type="text"]').value;
        const selectedDoctor = document.querySelector('input[name="doctor"]:checked');
        const date = document.querySelector('#bookingModal input[type="date"]').value;
        const duration = document.querySelector('#bookingModal select').value;
        const visitReason = document.querySelector('#bookingModal textarea').value;
        
        if (!patientName || !selectedDoctor || !date || !state.selectedTimeSlot) {
            showNotification('Please fill all required fields', 'error');
            return;
        }
        
        const newAppointment = {
            id: 'APT' + Date.now(),
            patientName: patientName,
            doctorId: selectedDoctor.value,
            doctorName: state.doctors.find(d => d.id === selectedDoctor.value).name,
            date: date,
            time: state.selectedTimeSlot,
            duration: parseInt(duration),
            status: 'pending',
            visitReason: visitReason || 'General Consultation',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Check for conflicts
        const conflict = checkForConflicts(newAppointment);
        if (conflict) {
            handleConflict(conflict, newAppointment);
            return;
        }
        
        // Add appointment
        state.appointments.push(newAppointment);
        
        // Log action
        logAction('CREATE', newAppointment);
        
        // Send confirmation
        sendConfirmationMessage(newAppointment);
        
        // Sync to other systems
        syncAppointmentToSystems(newAppointment);
        
        // Show success
        showNotification('Appointment booked successfully', 'success');
        
        // Close modal and refresh
        document.getElementById('bookingModal').classList.remove('active');
        renderAppointmentsList();
        
        // Reset form
        resetBookingForm();
    }

    function resetBookingForm() {
        const modal = document.getElementById('bookingModal');
        if (!modal) return;
        
        modal.querySelector('input[type="text"]').value = '';
        modal.querySelector('textarea').value = '';
        modal.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
        modal.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
        state.selectedTimeSlot = null;
    }

    // ========================================
    // FILTER MODAL
    // ========================================
    function openFilterModal() {
        const modal = document.getElementById('filterModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    function initializeFilterModal() {
        const modal = document.getElementById('filterModal');
        if (!modal) return;
        
        const applyBtn = modal.querySelector('.btn-primary');
        const clearBtn = modal.querySelector('.btn-secondary');
        
        if (applyBtn) {
            applyBtn.addEventListener('click', applyFilters);
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', clearFilters);
        }
    }

    function applyFilters() {
        const modal = document.getElementById('filterModal');
        
        // Get filter values
        const patientName = modal.querySelector('input[type="text"]').value;
        const doctor = modal.querySelector('select').value;
        const dateInputs = modal.querySelectorAll('input[type="date"]');
        const statusCheckboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
        
        // Update state filters
        if (doctor !== 'All Doctors') {
            state.filters.doctor = state.doctors.find(d => d.name === doctor)?.id || 'all';
        }
        
        if (dateInputs[0].value) {
            state.filters.dateRange.start = dateInputs[0].value;
        }
        
        if (dateInputs[1].value) {
            state.filters.dateRange.end = dateInputs[1].value;
        }
        
        state.filters.status = Array.from(statusCheckboxes).map(cb => {
            const label = cb.nextElementSibling.textContent.toLowerCase();
            return label;
        });
        
        // Apply filters and refresh
        renderAppointmentsList();
        
        // Close modal
        modal.classList.remove('active');
        
        showNotification('Filters applied', 'success');
    }

    function clearFilters() {
        state.filters = {
            status: ['confirmed', 'pending', 'completed', 'cancelled'],
            doctor: 'all',
            dateRange: { start: null, end: null }
        };
        
        // Reset form
        const modal = document.getElementById('filterModal');
        modal.querySelector('input[type="text"]').value = '';
        modal.querySelector('select').selectedIndex = 0;
        modal.querySelectorAll('input[type="date"]').forEach(input => input.value = '');
        modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        
        renderAppointmentsList();
        showNotification('Filters cleared', 'info');
    }

    // ========================================
    // QUICK REGISTRATION
    // ========================================
    function openQuickRegistration() {
        const modal = document.getElementById('quickRegisterModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    function initializeQuickRegistration() {
        const modal = document.getElementById('quickRegisterModal');
        if (!modal) return;
        
        const createBtn = modal.querySelector('.btn-primary');
        if (createBtn) {
            createBtn.addEventListener('click', createAndContinue);
        }
    }

    function createAndContinue() {
        const modal = document.getElementById('quickRegisterModal');
        const name = modal.querySelector('input[placeholder="Full name"]').value;
        const phone = modal.querySelector('input[type="tel"]').value;
        const email = modal.querySelector('input[type="email"]').value;
        const dob = modal.querySelector('input[type="date"]').value;
        const gender = modal.querySelector('select').value;
        
        if (!name || !phone) {
            showNotification('Name and phone are required', 'error');
            return;
        }
        
        const newPatient = {
            id: 'P' + Date.now(),
            name: name,
            phone: phone,
            email: email,
            dateOfBirth: dob,
            gender: gender,
            createdAt: new Date().toISOString()
        };
        
        // Add to patients
        state.patients.push(newPatient);
        
        // Sync to patient directory
        syncToPatientDirectory(newPatient);
        
        // Fill in booking form
        const bookingModal = document.getElementById('bookingModal');
        if (bookingModal) {
            bookingModal.querySelector('input[type="text"]').value = name;
        }
        
        // Close registration modal
        modal.classList.remove('active');
        
        showNotification('Patient registered successfully', 'success');
    }

    // ========================================
    // REMINDER CONFIGURATION
    // ========================================
    function openReminderConfigModal() {
        const modal = document.getElementById('reminderConfigModal');
        if (modal) {
            modal.classList.add('active');
            loadReminderSettings();
        }
    }

    function initializeReminderConfig() {
        const modal = document.getElementById('reminderConfigModal');
        if (!modal) return;
        
        const saveBtn = modal.querySelector('.btn-primary');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveReminderSettings);
        }
        
        // Template placeholder clicks
        const tags = modal.querySelectorAll('.tag');
        tags.forEach(tag => {
            tag.addEventListener('click', function() {
                insertPlaceholder(this.textContent);
            });
        });
    }

    function loadReminderSettings() {
        const modal = document.getElementById('reminderConfigModal');
        
        // Load current settings
        modal.querySelectorAll('input[type="checkbox"]').forEach((cb, index) => {
            if (index === 0) cb.checked = state.reminders.twentyFourHour;
            if (index === 1) cb.checked = state.reminders.oneHour;
            if (index === 2) cb.checked = state.reminders.custom;
        });
    }

    function saveReminderSettings() {
        const modal = document.getElementById('reminderConfigModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        
        state.reminders.twentyFourHour = checkboxes[0].checked;
        state.reminders.oneHour = checkboxes[1].checked;
        state.reminders.custom = checkboxes[2].checked;
        
        const customHours = modal.querySelector('.inline-input')?.value;
        if (customHours) {
            state.reminders.customHours = parseInt(customHours);
        }
        
        // Save template
        state.reminders.template = modal.querySelector('textarea').value;
        
        // Save to localStorage
        localStorage.setItem('reminderSettings', JSON.stringify(state.reminders));
        
        modal.classList.remove('active');
        showNotification('Reminder settings saved', 'success');
        
        // Update reminder toggles in main UI
        updateReminderToggles();
    }

    function insertPlaceholder(placeholder) {
        const textarea = document.querySelector('#reminderConfigModal textarea');
        if (textarea) {
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(cursorPos);
            textarea.value = textBefore + placeholder + textAfter;
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = cursorPos + placeholder.length;
        }
    }

    // ========================================
    // CONFLICT DETECTION & RESOLUTION
    // ========================================
    function checkForConflicts(appointment) {
        const conflicts = state.appointments.filter(apt => 
            apt.doctorId === appointment.doctorId &&
            apt.date === appointment.date &&
            apt.time === appointment.time &&
            apt.status !== 'cancelled'
        );
        
        return conflicts.length > 0 ? conflicts[0] : null;
    }

    function openConflictModal(e) {
        const modal = document.getElementById('conflictModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    function initializeConflictResolution() {
        const modal = document.getElementById('conflictModal');
        if (!modal) return;
        
        const resolutionOptions = modal.querySelectorAll('.resolution-option');
        resolutionOptions.forEach(option => {
            option.addEventListener('click', selectResolution);
        });
        
        const applyBtn = modal.querySelector('.btn-primary');
        if (applyBtn) {
            applyBtn.addEventListener('click', applyResolution);
        }
        
        const escalateBtn = modal.querySelector('.btn-outline');
        if (escalateBtn) {
            escalateBtn.addEventListener('click', escalateToOwner);
        }
    }

    function selectResolution(e) {
        // Clear previous selection
        document.querySelectorAll('.resolution-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Select this option
        e.currentTarget.classList.add('selected');
    }

    function applyResolution() {
        const selected = document.querySelector('.resolution-option.selected');
        if (!selected) {
            showNotification('Please select a resolution option', 'warning');
            return;
        }
        
        // Apply the resolution based on selection
        // This would involve rescheduling or reassigning
        
        showNotification('Conflict resolved successfully', 'success');
        document.getElementById('conflictModal').classList.remove('active');
        
        // Log resolution
        logAction('CONFLICT_RESOLVED', { resolution: selected.textContent });
        
        // Refresh appointments
        renderAppointmentsList();
    }

    function escalateToOwner() {
        // Create escalation ticket
        const escalation = {
            id: 'ESC' + Date.now(),
            type: 'SCHEDULING_CONFLICT',
            priority: 'HIGH',
            description: 'Double booking conflict requires owner intervention',
            createdAt: new Date().toISOString()
        };
        
        // Send to owner's queue
        syncToOwnerDashboard(escalation);
        
        showNotification('Escalated to clinic owner', 'info');
        document.getElementById('conflictModal').classList.remove('active');
    }

    function startConflictMonitoring() {
        setInterval(() => {
            detectConflicts();
        }, 30000); // Check every 30 seconds
    }

    function detectConflicts() {
        const conflicts = [];
        const appointments = state.appointments.filter(apt => apt.status !== 'cancelled');
        
        appointments.forEach((apt1, index) => {
            appointments.slice(index + 1).forEach(apt2 => {
                if (apt1.doctorId === apt2.doctorId &&
                    apt1.date === apt2.date &&
                    apt1.time === apt2.time) {
                    conflicts.push({ apt1, apt2 });
                }
            });
        });
        
        state.conflicts = conflicts;
        updateConflictAlerts();
    }

    function updateConflictAlerts() {
        const alertsContainer = document.querySelector('.conflict-alerts');
        if (!alertsContainer || state.conflicts.length === 0) return;
        
        alertsContainer.innerHTML = state.conflicts.slice(0, 2).map(conflict => `
            <div class="conflict-item warning">
                <i class="fas fa-exclamation-circle"></i>
                <div class="conflict-details">
                    <span class="conflict-type">Double Booking Alert</span>
                    <span class="conflict-desc">
                        ${conflict.apt1.doctorName} - ${conflict.apt1.time} slot
                    </span>
                </div>
                <button class="resolve-btn">Resolve</button>
            </div>
        `).join('');
        
        // Update stats
        const statsElement = document.querySelector('.conflict-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <span class="stat">${state.conflicts.length} Active Conflicts</span>
                <span class="stat">3 Resolved Today</span>
            `;
        }
    }

    // ========================================
    // AUDIT TRAIL & LOGS
    // ========================================
    function openAuditExportModal() {
        const modal = document.getElementById('auditExportModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    function initializeAuditExport() {
        const modal = document.getElementById('auditExportModal');
        if (!modal) return;
        
        const exportBtn = modal.querySelector('.btn-primary');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportAuditLogs);
        }
    }

    function logAction(action, data) {
        const logEntry = {
            id: 'LOG' + Date.now(),
            action: action,
            data: data,
            user: 'Sarah Wanjiru',
            timestamp: new Date().toISOString()
        };
        
        state.auditLog.push(logEntry);
        
        // Update audit display
        updateAuditDisplay();
        
        // Persist to server (simulated)
        syncAuditLog(logEntry);
    }

    function updateAuditDisplay() {
        const auditEntries = document.querySelector('.audit-entries');
        if (!auditEntries) return;
        
        const recentLogs = state.auditLog.slice(-5).reverse();
        
        auditEntries.innerHTML = recentLogs.map(log => `
            <div class="audit-entry">
                <span class="audit-time">${formatTime(log.timestamp)}</span>
                <div class="audit-details">
                    <span class="audit-action">${formatAction(log.action)}</span>
                    <span class="audit-user">by ${log.user}</span>
                    <span class="audit-target">${formatAuditTarget(log.data)}</span>
                </div>
            </div>
        `).join('');
    }

    function exportAuditLogs() {
        const modal = document.getElementById('auditExportModal');
        const dateRange = modal.querySelectorAll('input[type="date"]');
        const format = modal.querySelector('input[name="format"]:checked')?.nextElementSibling.textContent;
        const email = modal.querySelector('input[type="email"]').value;
        
        const filteredLogs = state.auditLog.filter(log => {
            const logDate = new Date(log.timestamp);
            const startDate = dateRange[0].value ? new Date(dateRange[0].value) : null;
            const endDate = dateRange[1].value ? new Date(dateRange[1].value) : null;
            
            if (startDate && logDate < startDate) return false;
            if (endDate && logDate > endDate) return false;
            
            return true;
        });
        
        if (format === 'CSV Format') {
            exportToCSV(filteredLogs);
        } else {
            exportToPDF(filteredLogs);
        }
        
        if (email) {
            sendExportToEmail(email, format);
        }
        
        modal.classList.remove('active');
        showNotification('Audit logs exported successfully', 'success');
    }

    function exportToCSV(logs) {
        const csv = 'Timestamp,Action,User,Details\n' +
            logs.map(log => 
                `"${log.timestamp}","${log.action}","${log.user}","${JSON.stringify(log.data)}"`
            ).join('\n');
        
        downloadFile(csv, 'audit-logs.csv', 'text/csv');
    }

    function exportToPDF(logs) {
        // Simulate PDF export
        console.log('Exporting to PDF:', logs);
        showNotification('PDF export initiated', 'info');
    }

    function downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ========================================
    // COMMUNICATION PANEL
    // ========================================
    function initializeCommunicationPanel() {
        const modal = document.getElementById('communicationModal');
        if (!modal) return;
        
        const sendBtn = modal.querySelector('.btn-primary');
        if (sendBtn) {
            sendBtn.addEventListener('click', sendCommunication);
        }
        
        const addRecipientsBtn = modal.querySelector('.btn-outline');
        if (addRecipientsBtn) {
            addRecipientsBtn.addEventListener('click', openRecipientSelector);
        }
        
        // Remove recipient tags
        modal.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove')) {
                e.target.closest('.recipient-tag').remove();
            }
        });
    }

    function handleCommunicationAction(e) {
        const modal = document.getElementById('communicationModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    function sendCommunication() {
        const modal = document.getElementById('communicationModal');
        const messageType = modal.querySelector('select').value;
        const channels = Array.from(modal.querySelectorAll('.channel-options input:checked'))
            .map(cb => cb.nextElementSibling.textContent.trim());
        const message = modal.querySelector('textarea').value;
        const recipients = Array.from(modal.querySelectorAll('.recipient-tag'))
            .map(tag => tag.textContent.replace('×', '').trim());
        
        if (!message || recipients.length === 0) {
            showNotification('Please enter message and select recipients', 'error');
            return;
        }
        
        // Queue messages
        recipients.forEach(recipient => {
            state.communicationQueue.push({
                id: 'COMM' + Date.now(),
                recipient: recipient,
                message: message,
                type: messageType,
                channels: channels,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
        });
        
        processCommunicationQueue();
        
        modal.classList.remove('active');
        showNotification(`Message sent to ${recipients.length} recipients`, 'success');
        
        // Update delivery tracking
        updateDeliveryTracking();
    }

    function processCommunicationQueue() {
        state.communicationQueue.forEach(item => {
            if (item.status === 'pending') {
                // Simulate sending
                setTimeout(() => {
                    item.status = Math.random() > 0.1 ? 'delivered' : 'failed';
                    updateDeliveryTracking();
                }, Math.random() * 3000);
            }
        });
    }

    function updateDeliveryTracking() {
        const trackingContainer = document.querySelector('.tracking-items');
        if (!trackingContainer) return;
        
        const recentMessages = state.communicationQueue.slice(-3);
        
        trackingContainer.innerHTML = recentMessages.map(msg => `
            <div class="tracking-item">
                <span class="patient">${msg.recipient || msg.patientId}</span>
                <span class="status ${msg.status}">
                    ${getDeliveryStatusIcon(msg.status)} ${capitalizeFirst(msg.status)}
                    ${msg.status === 'failed' ? '<button class="retry-btn">Retry</button>' : ''}
                </span>
            </div>
        `).join('');
    }

    function retryMessageDelivery(e) {
        const patientName = e.target.closest('.tracking-item').querySelector('.patient').textContent;
        const message = state.communicationQueue.find(m => 
            m.recipient === patientName && m.status === 'failed'
        );
        
        if (message) {
            message.status = 'pending';
            processCommunicationQueue();
            showNotification('Retrying message delivery...', 'info');
        }
    }

    // ========================================
    // REAL-TIME UPDATES
    // ========================================
    function initializeRealTimeUpdates() {
        // Update doctor availability every minute
        setInterval(updateDoctorAvailability, 60000);
        
        // Check for new notifications
        setInterval(checkNewNotifications, 30000);
        
        // Update management stats
        setInterval(updateManagementStats, 45000);
        
        // Process reminders
        setInterval(processReminders, 60000);
    }

    function updateDoctorAvailability() {
        const availabilityGrid = document.querySelector('.availability-grid');
        if (!availabilityGrid) return;
        
        state.doctors.forEach(doctor => {
            // Randomly update status
            if (Math.random() > 0.7) {
                const statuses = ['available', 'consultation', 'break'];
                doctor.status = statuses[Math.floor(Math.random() * statuses.length)];
            }
            
            // Update queue count
            doctor.queueCount = Math.floor(Math.random() * 8);
        });
        
        renderDoctorAvailability();
    }

    function renderDoctorAvailability() {
        const availabilityGrid = document.querySelector('.availability-grid');
        if (!availabilityGrid) return;
        
        availabilityGrid.innerHTML = state.doctors.map(doctor => `
            <div class="doctor-schedule">
                <div class="doctor-header">
                    <img src="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png" 
                         alt="Doctor" class="doctor-avatar">
                    <div class="doctor-info">
                        <span class="doctor-name">${doctor.name}</span>
                        <span class="doctor-specialty">${doctor.specialization}</span>
                    </div>
                    <span class="status-indicator ${doctor.status}">
                        <i class="fas fa-circle"></i> ${capitalizeFirst(doctor.status)}
                    </span>
                </div>
                <div class="time-slots">
                    ${generateTimeSlotHTML(doctor)}
                </div>
                <div class="schedule-info">
                    <span class="room-assignment">${doctor.room}</span>
                    <span class="patient-load">Queue: ${doctor.queueCount}</span>
                </div>
            </div>
        `).join('');
    }

    function generateTimeSlotHTML(doctor) {
        const today = new Date().toISOString().split('T')[0];
        const schedule = doctor.schedule[today] || [];
        
        return schedule.map(slot => `
            <button class="slot ${slot.available ? 'available' : 'booked'}">
                ${slot.time}
            </button>
        `).join('');
    }

    function checkNewNotifications() {
        // Simulate new notifications
        if (Math.random() > 0.5) {
            const notifications = [
                { message: 'New appointment booking', icon: 'fa-user-plus' },
                { message: 'Appointment confirmed', icon: 'fa-check-circle' },
                { message: 'Patient cancelled appointment', icon: 'fa-times-circle' }
            ];
            
            const newNotif = notifications[Math.floor(Math.random() * notifications.length)];
            addNotification(newNotif);
        }
    }

    function addNotification(notif) {
        state.notifications.unshift({
            id: 'NOTIF' + Date.now(),
            ...notif,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        updateNotificationDisplay();
        updateNotificationBadge();
    }

    function updateNotificationDisplay() {
        const notifList = document.querySelector('.notification-list');
        if (!notifList) return;
        
        const recentNotifs = state.notifications.slice(0, 3);
        
        notifList.innerHTML = recentNotifs.map(notif => `
            <div class="notif-item ${!notif.read ? 'new' : ''}">
                <i class="fas ${notif.icon}"></i>
                <div class="notif-content">
                    <span class="notif-message">${notif.message}</span>
                    <span class="notif-time">${formatTimeAgo(notif.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }

    function updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            const unreadCount = state.notifications.filter(n => !n.read).length;
            badge.textContent = unreadCount > 0 ? unreadCount : '0';
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    function updateManagementStats() {
        const pending = state.appointments.filter(apt => apt.status === 'pending').length;
        const rescheduleRequests = state.appointments.filter(apt => apt.rescheduleRequested).length;
        const cancelledToday = state.appointments.filter(apt => 
            apt.status === 'cancelled' && 
            new Date(apt.updatedAt).toDateString() === new Date().toDateString()
        ).length;
        
        // Update stat displays
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 3) {
            statValues[0].textContent = pending;
            statValues[1].textContent = rescheduleRequests;
            statValues[2].textContent = cancelledToday;
        }
    }

    function processReminders() {
        const now = new Date();
        
        state.appointments.forEach(appointment => {
            const aptTime = new Date(`${appointment.date} ${appointment.time}`);
            const hoursUntil = (aptTime - now) / (1000 * 60 * 60);
            
            // 24-hour reminder
            if (state.reminders.twentyFourHour && 
                hoursUntil <= 24 && hoursUntil > 23 && 
                !appointment.reminder24Sent) {
                sendReminder(appointment, '24-hour');
                appointment.reminder24Sent = true;
            }
            
            // 1-hour reminder
            if (state.reminders.oneHour && 
                hoursUntil <= 1 && hoursUntil > 0 && 
                !appointment.reminder1Sent) {
                sendReminder(appointment, '1-hour');
                appointment.reminder1Sent = true;
            }
            
            // Custom reminder
            if (state.reminders.custom && 
                hoursUntil <= state.reminders.customHours && 
                hoursUntil > (state.reminders.customHours - 1) && 
                !appointment.reminderCustomSent) {
                sendReminder(appointment, 'custom');
                appointment.reminderCustomSent = true;
            }
        });
    }

    function sendReminder(appointment, type) {
        const message = generateConfirmationMessage(appointment);
        
        state.communicationQueue.push({
            id: 'REM' + Date.now(),
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            message: message,
            type: `${type} reminder`,
            channels: ['sms', 'email'],
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        
        processCommunicationQueue();
        
        showNotification(`${type} reminder sent for ${appointment.patientName}`, 'info');
    }

    // ========================================
    // DATA SYNCHRONIZATION
    // ========================================
    function startDataSync() {
        state.syncInterval = setInterval(() => {
            syncToDashboard();
            syncToCheckIn();
            syncToQueue();
            syncToBilling();
            syncToPatientDirectory();
        }, 30000); // Sync every 30 seconds
    }

    function syncAppointmentToSystems(appointment) {
        syncToDashboard();
        syncToCheckIn();
        syncToQueue();
        syncToBilling();
        syncToPatientDirectory();
    }

    function syncToDashboard() {
        // Update dashboard metrics
        const dashboardData = {
            totalAppointments: state.appointments.length,
            pendingConfirmations: state.appointments.filter(a => a.status === 'pending').length,
            completedToday: state.appointments.filter(a => 
                a.status === 'completed' && 
                a.date === new Date().toISOString().split('T')[0]
            ).length
        };
        
        localStorage.setItem('dashboardSync', JSON.stringify(dashboardData));
        console.log('Synced to Dashboard');
    }

    function syncToCheckIn() {
        // Sync today's appointments for check-in
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = state.appointments.filter(a => a.date === today);
        
        localStorage.setItem('checkInSync', JSON.stringify(todayAppointments));
        console.log('Synced to Check-In');
    }

    function syncToQueue(appointment) {
        // Update queue with appointment info
        const queueData = state.appointments
            .filter(a => a.status === 'checked-in' || a.status === 'confirmed')
            .sort((a, b) => a.time.localeCompare(b.time));
        
        localStorage.setItem('queueSync', JSON.stringify(queueData));
        console.log('Synced to Queue');
    }

    function syncToBilling() {
        // Sync completed appointments for billing
        const billableAppointments = state.appointments.filter(a => 
            a.status === 'completed' && !a.invoiced
        );
        
        localStorage.setItem('billingSync', JSON.stringify(billableAppointments));
        console.log('Synced to Billing');
    }

    function syncToPatientDirectory(patient) {
        // Sync patient data
        const patientData = patient || state.patients;
        localStorage.setItem('patientDirectorySync', JSON.stringify(patientData));
        console.log('Synced to Patient Directory');
    }

    function syncToOwnerDashboard(data) {
        // Sync escalations to owner
        const ownerData = localStorage.getItem('ownerSync') 
            ? JSON.parse(localStorage.getItem('ownerSync')) 
            : [];
        
        ownerData.push(data);
        localStorage.setItem('ownerSync', JSON.stringify(ownerData));
        console.log('Synced to Owner Dashboard');
    }

    function syncAuditLog(logEntry) {
        // Persist audit log
        const auditLogs = localStorage.getItem('auditLogs') 
            ? JSON.parse(localStorage.getItem('auditLogs')) 
            : [];
        
        auditLogs.push(logEntry);
        localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
    }

    // ========================================
    // DRAG & DROP FUNCTIONALITY
    // ========================================
    function initializeDragDrop() {
        // Enable drag and drop for rescheduling
        const appointmentItems = document.querySelectorAll('.appointment-item');
        
        appointmentItems.forEach(item => {
            item.draggable = true;
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
        });
        
        // Set up drop zones (time slots)
        const timeSlots = document.querySelectorAll('.slot.available');
        
        timeSlots.forEach(slot => {
            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('drop', handleDrop);
        });
    }

    let draggedAppointment = null;

    function handleDragStart(e) {
        draggedAppointment = e.currentTarget;
        e.currentTarget.style.opacity = '0.4';
    }

    function handleDragEnd(e) {
        e.currentTarget.style.opacity = '';
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        if (draggedAppointment) {
            const appointmentId = draggedAppointment.dataset.id;
            const newTime = this.textContent;
            
            // Update appointment time
            const appointment = state.appointments.find(a => a.id === appointmentId);
            if (appointment) {
                appointment.time = newTime;
                appointment.updatedAt = new Date().toISOString();
                
                // Log the reschedule
                logAction('RESCHEDULE', appointment);
                
                // Send notification
                sendRescheduleNotification(appointment);
                
                // Refresh display
                renderAppointmentsList();
                
                showNotification('Appointment rescheduled via drag-drop', 'success');
            }
        }
        
        return false;
    }

    function sendRescheduleNotification(appointment) {
        const message = `Your appointment has been rescheduled to ${appointment.time} on ${appointment.date}`;
        
        state.communicationQueue.push({
            id: 'NOTIF' + Date.now(),
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            message: message,
            type: 'reschedule',
            channels: ['sms', 'email'],
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        
        processCommunicationQueue();
    }

    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================
    function initializeKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + B: Book appointment
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                openBookingModal();
            }
            
            // Ctrl/Cmd + F: Open filter
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                openFilterModal();
            }
            
            // Ctrl/Cmd + R: Open reminders
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                openReminderConfigModal();
            }
            
            // Ctrl/Cmd + L: Open audit log
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                openAuditExportModal();
            }
        });
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${
                type === 'success' ? '#10B981' : 
                type === 'error' ? '#EF4444' : 
                type === 'warning' ? '#F59E0B' : 
                '#3B82F6'
            };
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 2000;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        
        const icon = 
            type === 'success' ? 'fa-check-circle' : 
            type === 'error' ? 'fa-exclamation-circle' : 
            type === 'warning' ? 'fa-exclamation-triangle' : 
            'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function showNotificationCenter() {
        // Implementation for notification center popup
        console.log('Opening notification center');
    }

    function toggleProfilePopup() {
        const popup = document.getElementById('profilePopup');
        if (popup) {
            popup.classList.toggle('active');
        }
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        localStorage.setItem('darkMode', isDark);
        
        const icon = document.querySelector('#darkModeToggle i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        showNotification(`Dark mode ${isDark ? 'enabled' : 'disabled'}`, 'info');
    }

    function loadUserPreferences() {
        // Load dark mode preference
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            const icon = document.querySelector('#darkModeToggle i');
            if (icon) icon.className = 'fas fa-sun';
        }
        
        // Load reminder settings
        const reminderSettings = localStorage.getItem('reminderSettings');
        if (reminderSettings) {
            state.reminders = JSON.parse(reminderSettings);
        }
        
        updateReminderToggles();
    }

    function updateReminderToggles() {
        const toggles = document.querySelectorAll('.reminder-toggle input');
        toggles.forEach((toggle, index) => {
            if (index === 0) toggle.checked = state.reminders.twentyFourHour;
            if (index === 1) toggle.checked = state.reminders.oneHour;
            if (index === 2) toggle.checked = state.reminders.custom;
        });
    }

    function updateAvailableSlots() {
        // Update time slots when date changes
        const selectedDoctor = document.querySelector('input[name="doctor"]:checked');
        if (!selectedDoctor) return;
        
        const doctorId = selectedDoctor.value;
        const date = document.querySelector('#bookingModal input[type="date"]').value;
        const doctor = state.doctors.find(d => d.id === doctorId);
        
        if (doctor && doctor.schedule[date]) {
            renderTimeSlots(doctor.schedule[date]);
        }
    }

    function renderTimeSlots(schedule) {
        const slotGrid = document.querySelector('.time-slot-grid');
        if (!slotGrid) return;
        
        slotGrid.innerHTML = schedule.map(slot => `
            <button class="time-slot ${slot.available ? 'available' : 'unavailable'}">
                ${slot.time}
            </button>
        `).join('');
    }

    function getNextAvailableSlot(doctorId) {
        const doctor = state.doctors.find(d => d.id === doctorId);
        if (!doctor) return 'N/A';
        
        const today = new Date().toISOString().split('T')[0];
        const todaySlots = doctor.schedule[today] || [];
        const availableSlot = todaySlots.find(s => s.available);
        
        return availableSlot ? availableSlot.time : 'No slots today';
    }

    function getStatusIcon(status) {
        const icons = {
            'confirmed': '<i class="fas fa-check-circle"></i>',
            'pending': '<i class="fas fa-clock"></i>',
            'completed': '<i class="fas fa-check-double"></i>',
            'cancelled': '<i class="fas fa-times-circle"></i>',
            'checked-in': '<i class="fas fa-user-check"></i>'
        };
        return icons[status] || '<i class="fas fa-question-circle"></i>';
    }

    function getStatusText(status) {
        return capitalizeFirst(status);
    }

    function getActionButtons(status) {
        const buttons = {
            'pending': `
                <button class="action-icon" title="Confirm">
                    <i class="fas fa-check"></i>
                </button>
                <button class="action-icon" title="Reschedule">
                    <i class="fas fa-calendar-alt"></i>
                </button>
                <button class="action-icon" title="Cancel">
                    <i class="fas fa-times-circle"></i>
                </button>
                <button class="action-icon" title="More">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            `,
            'confirmed': `
                <button class="action-icon" title="Check-in">
                    <i class="fas fa-user-check"></i>
                </button>
                <button class="action-icon" title="Reschedule">
                    <i class="fas fa-calendar-alt"></i>
                </button>
                <button class="action-icon" title="Cancel">
                    <i class="fas fa-times-circle"></i>
                </button>
                <button class="action-icon" title="More">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            `,
            'completed': `
                <button class="action-icon" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-icon" title="Generate Invoice">
                    <i class="fas fa-file-invoice"></i>
                </button>
                <button class="action-icon" title="More">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            `,
            'cancelled': `
                <button class="action-icon" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-icon" title="More">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            `
        };
        
        return buttons[status] || buttons['pending'];
    }

    function getDeliveryStatusIcon(status) {
        const icons = {
            'delivered': '<i class="fas fa-check"></i>',
            'read': '<i class="fas fa-check-double"></i>',
            'failed': '<i class="fas fa-times"></i>',
            'pending': '<i class="fas fa-clock"></i>'
        };
        return icons[status] || '';
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    function formatTimeAgo(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diff = (now - then) / 1000; // seconds
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
        return then.toLocaleDateString();
    }

    function formatAction(action) {
        const actionMap = {
            'CREATE': 'Appointment Created',
            'CONFIRM': 'Appointment Confirmed',
            'RESCHEDULE': 'Appointment Rescheduled',
            'CANCEL': 'Appointment Cancelled',
            'CHECK_IN': 'Patient Checked In',
            'COMPLETE': 'Appointment Completed',
            'CONFLICT_RESOLVED': 'Conflict Resolved'
        };
        return actionMap[action] || action;
    }

    function formatAuditTarget(data) {
        if (data.patientName) return `Patient: ${data.patientName}`;
        if (data.resolution) return data.resolution;
        return JSON.stringify(data).substring(0, 50) + '...';
    }

    function viewAppointmentDetails(appointment) {
        // Show detailed view of appointment
        console.log('Viewing appointment details:', appointment);
    }

    function generateInvoice(appointment) {
        // Navigate to billing with appointment data
        localStorage.setItem('pendingInvoice', JSON.stringify(appointment));
        window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Billings and Payments\\billings_and_payments.html';
    }

    function showMoreOptions(appointment) {
        // Show additional options menu
        console.log('More options for:', appointment);
    }

    function openRescheduleModal(appointment) {
        // Implementation for reschedule modal
        console.log('Opening reschedule modal for:', appointment);
    }

    function openCancelModal(appointment) {
        // Implementation for cancel modal
        console.log('Opening cancel modal for:', appointment);
    }

    function handleStatAction(e) {
        const action = e.target.textContent;
        
        switch(action) {
            case 'Confirm All':
                confirmAllPending();
                break;
            case 'Review':
                reviewRescheduleRequests();
                break;
            case 'View':
                viewCancellations();
                break;
        }
    }

    function confirmAllPending() {
        const pending = state.appointments.filter(a => a.status === 'pending');
        pending.forEach(appointment => confirmAppointment(appointment));
        showNotification(`${pending.length} appointments confirmed`, 'success');
    }

    function reviewRescheduleRequests() {
        // Filter to show only reschedule requests
        state.filters.rescheduleRequests = true;
        renderAppointmentsList();
    }

    function viewCancellations() {
        // Filter to show only cancelled appointments
        state.filters.status = ['cancelled'];
        renderAppointmentsList();
    }

    function handleManageAction(e) {
        const action = e.target.classList;
        
        if (action.contains('confirm')) {
            // One-click confirm for selected appointments
            console.log('One-click confirm');
        } else if (action.contains('reschedule')) {
            // Enable drag-drop mode
            console.log('Drag-drop reschedule mode');
        } else if (action.contains('cancel')) {
            // Cancel and notify
            console.log('Cancel and notify');
        }
    }

    function toggleChannelSelection(e) {
        e.target.classList.toggle('active');
    }

    function openRecipientSelector() {
        // Open patient selector modal
        console.log('Opening recipient selector');
    }

    function sendExportToEmail(email, format) {
        // Simulate sending export to email
        console.log(`Sending ${format} export to ${email}`);
    }

    function handleConflict(conflict, newAppointment) {
        // Show conflict resolution modal
        const modal = document.getElementById('conflictModal');
        if (modal) {
            modal.classList.add('active');
            // Populate conflict details
            console.log('Handling conflict:', conflict, newAppointment);
        }
    }

    // ========================================
    // CLEANUP ON PAGE UNLOAD
    // ========================================
    window.addEventListener('beforeunload', function() {
        if (state.syncInterval) clearInterval(state.syncInterval);
        if (state.realTimeInterval) clearInterval(state.realTimeInterval);
        
        // Save state to localStorage
        localStorage.setItem('appointmentsState', JSON.stringify(state));
    });

    // ========================================
    // INITIALIZE SYSTEM
    // ========================================
    init();
});
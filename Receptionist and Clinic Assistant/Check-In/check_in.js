/**
 * CURIS CHECK-IN PAGE JAVASCRIPT
 * Patient Flow Hub - Receptionist & Clinic Assistant
 * Complete Dynamic Implementation
 * Version: 1.0.0
 * Copyright 2025 Citrus Labs
 */

// ===============================================
// GLOBAL VARIABLES & STATE MANAGEMENT
// ===============================================
const CheckInApp = {
    // Application State
    state: {
        currentUser: {
            name: 'Sarah Wanjiru',
            role: 'Receptionist',
            id: 'USER_001',
            permissions: ['check_in', 'register', 'update', 'assign']
        },
        todaysAppointments: [],
        checkedInPatients: [],
        queueData: {
            green: 5,
            yellow: 3,
            red: 1
        },
        doctors: [
            {
                id: 'DOC_001',
                name: 'Dr. James Ochieng',
                specialty: 'Cardiologist',
                status: 'available',
                queue: 3,
                avgTime: 20,
                room: '101',
                capacity: 40
            },
            {
                id: 'DOC_002',
                name: 'Dr. Mary Kamau',
                specialty: 'Pediatrician',
                status: 'consultation',
                queue: 5,
                avgTime: 25,
                room: '102',
                capacity: 80
            },
            {
                id: 'DOC_003',
                name: 'Dr. Peter Mutua',
                specialty: 'Orthopedic',
                status: 'break',
                queue: 0,
                breakEndTime: '12:30 PM',
                room: '103',
                capacity: 0
            }
        ],
        notifications: [],
        auditLog: [],
        recentPatients: [],
        selectedPatient: null,
        darkMode: false
    },

    // Configuration
    config: {
        apiEndpoint: '/api/v1',
        websocketUrl: 'wss://curis-ws.citruslabs.co.ke',
        autoSaveInterval: 30000, // 30 seconds
        sessionTimeout: 1800000, // 30 minutes
        maxPhotoSize: 5242880, // 5MB
        supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp']
    }
};

// ===============================================
// INITIALIZATION
// ===============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('Curis Check-In System Initializing...');

    // Initialize core components
    initializeEventListeners();
    initializeModals();
    loadTodaysAppointments();
    initializeRealtimeSync();
    initializeNotifications();
    loadRecentPatients();
    initializeAuditSystem();
    initializeDarkMode();
    initializeProfileMenu();
    initializeSearchFunctionality();
    initializeTooltips();
    initializeKeyboardShortcuts();

    // Start auto-save and session management
    startAutoSave();
    startSessionMonitor();

    console.log('Check-In System Ready');
});

// ===============================================
// EVENT LISTENERS
// ===============================================
function initializeEventListeners() {
    // Quick Action Buttons
    document.getElementById('liveCheckInBtn')?.addEventListener('click', openLiveCheckIn);
    document.getElementById('newPatientBtn')?.addEventListener('click', openNewPatientRegistration);
    document.getElementById('walkInBtn')?.addEventListener('click', openWalkInModal);
    document.getElementById('updateProfileBtn')?.addEventListener('click', openUpdateProfileModal);
    document.getElementById('auditLogBtn')?.addEventListener('click', openAuditLogModal);
    document.getElementById('helpBtn')?.addEventListener('click', showHelpGuide);

    // Check-In Buttons (for each appointment)
    document.querySelectorAll('.check-in-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', handlePatientCheckIn);
    });

    // Registration Action Buttons
    document.querySelectorAll('.reg-action-btn').forEach(btn => {
        btn.addEventListener('click', handleRegistrationAction);
    });

    // Doctor Assignment Buttons
    document.querySelectorAll('.assign-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', handleDoctorAssignment);
    });

    // AI Suggestion Accept
    document.querySelector('.ai-suggestion .btn-primary')?.addEventListener('click', acceptAISuggestion);

    // Recent Patient Quick Access
    document.querySelectorAll('.recent-patient-btn').forEach(btn => {
        btn.addEventListener('click', quickAccessPatient);
    });

    // Walk-In Registration
    document.querySelector('.walk-in-section .btn-outline')?.addEventListener('click', openWalkInModal);

    // Search & Update Patient
    document.querySelector('.profile-updates .btn-outline')?.addEventListener('click', openUpdateProfileModal);

    // Add New Note
    document.querySelector('.admin-notes .btn-outline')?.addEventListener('click', openNotesModal);

    // Queue Actions
    document.querySelectorAll('.queue-btn').forEach(btn => {
        btn.addEventListener('click', handleQueueAction);
    });

    // Audit Actions
    document.querySelector('.audit-actions .btn-outline:first-child')?.addEventListener('click', openAuditFilterModal);
    document.querySelector('.audit-actions .btn-outline:last-child')?.addEventListener('click', exportAuditLog);

    // Help Links
    document.querySelectorAll('.help-link').forEach(link => {
        link.addEventListener('click', handleHelpLink);
    });

    // Toggle Switches
    document.querySelectorAll('.toggle-switch input').forEach(toggle => {
        toggle.addEventListener('change', handleToggleChange);
    });

    // Edit Note Buttons
    document.querySelectorAll('.edit-note-btn').forEach(btn => {
        btn.addEventListener('click', editNote);
    });
}

// ===============================================
// MODAL MANAGEMENT
// ===============================================
function initializeModals() {
    const modals = document.querySelectorAll('.modal');

    modals.forEach(modal => {
        // Close button
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Log to audit
        addAuditEntry('MODAL_OPEN', `Opened modal: ${modalId}`);
    }
}

function closeModal(modal) {
    if (typeof modal === 'string') {
        modal = document.getElementById(modal);
    }
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Clear form if present
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// ===============================================
// LIVE CHECK-IN FUNCTIONALITY
// ===============================================
function openLiveCheckIn() {
    openModal('checkInModal');
    loadCheckInData();
}

function loadCheckInData() {
    // Simulate loading today's appointments
    const appointments = [
        {
            id: 'APT_001',
            patientId: '12345',
            patientName: 'John Mwangi',
            time: '09:00 AM',
            doctor: 'Dr. James Ochieng',
            status: 'pending'
        },
        {
            id: 'APT_002',
            patientId: '12346',
            patientName: 'Mary Njeri',
            time: '09:30 AM',
            doctor: 'Dr. Mary Kamau',
            status: 'arrived',
            arrivedAt: '9:25 AM'
        },
        {
            id: 'APT_003',
            patientId: '12347',
            patientName: 'Peter Omondi',
            time: '10:00 AM',
            doctor: 'Dr. Peter Mutua',
            status: 'pending'
        }
    ];

    CheckInApp.state.todaysAppointments = appointments;
    updateCheckInDisplay();
}

function handlePatientCheckIn(e) {
    const btn = e.currentTarget;
    const patientId = btn.dataset.patientId;

    if (!patientId) return;

    // Find patient appointment
    const appointment = CheckInApp.state.todaysAppointments.find(
        apt => apt.patientId === patientId
    );

    if (appointment) {
        // Update status
        appointment.status = 'arrived';
        appointment.arrivedAt = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Update UI
        const appointmentItem = btn.closest('.appointment-item');
        if (appointmentItem) {
            appointmentItem.classList.remove('pending');
            appointmentItem.classList.add('arrived');

            const statusBadge = appointmentItem.querySelector('.status-badge');
            statusBadge.classList.remove('pending');
            statusBadge.classList.add('arrived');
            statusBadge.innerHTML = `<i class="fas fa-check-circle"></i> Arrived ${appointment.arrivedAt}`;

            btn.classList.add('disabled');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-check"></i> Checked In';
        }

        // Add to checked-in list
        CheckInApp.state.checkedInPatients.push(appointment);

        // Notify doctor
        notifyDoctor(appointment);

        // Add to queue
        addToQueue(appointment);

        // Update metrics
        updateDashboardMetrics();

        // Add audit entry
        addAuditEntry('CHECK_IN', `Patient checked in: ${appointment.patientName} - ID: ${patientId}`);

        // Show success notification
        showNotification('success', `${appointment.patientName} has been checked in successfully`);
    }
}

function updateCheckInDisplay() {
    // Update the appointment list display in the modal
    const modalBody = document.querySelector('#checkInModal .modal-body');
    if (modalBody && CheckInApp.state.todaysAppointments.length > 0) {
        // Update patient info section with first pending appointment
        const pendingApt = CheckInApp.state.todaysAppointments.find(apt => apt.status === 'pending');
        if (pendingApt) {
            const patientInfo = modalBody.querySelector('.patient-info');
            if (patientInfo) {
                patientInfo.querySelector('h3').textContent = pendingApt.patientName;
                patientInfo.querySelector('p:nth-child(2)').textContent =
                    `ID: ${pendingApt.patientId} | Phone: +254 712 345 678`;
                patientInfo.querySelector('p:nth-child(3)').textContent =
                    `Appointment: ${pendingApt.time} with ${pendingApt.doctor}`;
            }
        }
    }
}

// ===============================================
// PATIENT SEARCH
// ===============================================
function initializeSearchFunctionality() {
    const searchInput = document.getElementById('patientSearchInput');
    const searchBtn = document.querySelector('.patient-search-bar .search-btn');

    if (searchInput) {
        // Real-time search as you type
        searchInput.addEventListener('input', debounce(performPatientSearch, 300));

        // Search on Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performPatientSearch();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', performPatientSearch);
    }

    // Modal search inputs
    document.querySelectorAll('.search-options input').forEach(input => {
        input.addEventListener('input', debounce(performModalSearch, 300));
    });
}

function performPatientSearch() {
    const searchInput = document.getElementById('patientSearchInput');
    const query = searchInput?.value.trim().toLowerCase();

    if (!query) {
        // Reset to show all appointments
        showAllAppointments();
        return;
    }

    // Filter appointments
    const appointmentItems = document.querySelectorAll('.appointment-item');
    appointmentItems.forEach(item => {
        const patientName = item.querySelector('.patient-name')?.textContent.toLowerCase();
        const appointmentTime = item.querySelector('.appointment-time')?.textContent.toLowerCase();

        if (patientName?.includes(query) || appointmentTime?.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });

    // Add to audit
    addAuditEntry('SEARCH', `Patient search performed: "${query}"`);
}

function showAllAppointments() {
    document.querySelectorAll('.appointment-item').forEach(item => {
        item.style.display = 'flex';
    });
}

function performModalSearch() {
    const nameInput = document.querySelector('.search-options input[placeholder*="name"]');
    const phoneInput = document.querySelector('.search-options input[placeholder*="phone"]');
    const idInput = document.querySelector('.search-options input[placeholder*="ID"]');

    const searchCriteria = {
        name: nameInput?.value.trim(),
        phone: phoneInput?.value.trim(),
        id: idInput?.value.trim()
    };

    // Simulate search
    if (searchCriteria.name || searchCriteria.phone || searchCriteria.id) {
        // In production, this would make an API call
        console.log('Searching for patient:', searchCriteria);

        // Mock result
        setTimeout(() => {
            const patientCard = document.querySelector('.patient-card');
            if (patientCard) {
                patientCard.style.display = 'flex';
                // Update with search results
            }
        }, 500);
    }
}

// ===============================================
// NEW PATIENT REGISTRATION
// ===============================================
function openNewPatientRegistration() {
    openModal('registrationModal');
    initializeRegistrationForm();
}

function initializeRegistrationForm() {
    const form = document.querySelector('#registrationModal .registration-form');
    if (!form) return;

    // Photo upload handlers
    const cameraBtn = form.querySelector('.btn-outline:has(.fa-camera)');
    const uploadBtn = form.querySelector('.btn-outline:has(.fa-upload)');

    if (cameraBtn) {
        cameraBtn.addEventListener('click', capturePhoto);
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadPhoto);
    }

    // Form validation
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
    });

    // Duplicate check on phone/ID input
    const phoneInput = form.querySelector('input[type="tel"]');
    const idInput = form.querySelector('input[placeholder*="ID"]');

    if (phoneInput) {
        phoneInput.addEventListener('blur', checkForDuplicates);
    }

    if (idInput) {
        idInput.addEventListener('blur', checkForDuplicates);
    }

    // Submit handler
    const submitBtn = form.querySelector('.btn-primary');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleRegistrationSubmit);
    }
}

function capturePhoto() {
    // In production, this would access device camera
    console.log('Opening camera...');

    // Simulate camera capture
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                // Create video element for camera preview
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();

                // Create canvas for capture
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                // Simulate capture after 3 seconds
                setTimeout(() => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0);

                    // Convert to image
                    const imageData = canvas.toDataURL('image/jpeg');
                    updatePhotoPreview(imageData);

                    // Stop camera
                    stream.getTracks().forEach(track => track.stop());
                }, 3000);
            })
            .catch(err => {
                console.error('Camera access denied:', err);
                showNotification('error', 'Camera access denied. Please check permissions.');
            });
    }
}

function uploadPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file
            if (!CheckInApp.config.supportedImageTypes.includes(file.type)) {
                showNotification('error', 'Invalid file type. Please upload JPEG, PNG, or WebP.');
                return;
            }

            if (file.size > CheckInApp.config.maxPhotoSize) {
                showNotification('error', 'File too large. Maximum size is 5MB.');
                return;
            }

            // Read and display
            const reader = new FileReader();
            reader.onload = (event) => {
                updatePhotoPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    input.click();
}

function updatePhotoPreview(imageData) {
    const preview = document.getElementById('photoPreview');
    if (preview) {
        preview.src = imageData;

        // Store in state
        if (!CheckInApp.state.selectedPatient) {
            CheckInApp.state.selectedPatient = {};
        }
        CheckInApp.state.selectedPatient.photo = imageData;
    }
}

function checkForDuplicates(e) {
    const field = e.target;
    const value = field.value.trim();

    if (!value) return;

    // Simulate duplicate check
    setTimeout(() => {
        // Mock check - in production this would query the database
        const isDuplicate = Math.random() > 0.8; // 20% chance of duplicate

        if (isDuplicate) {
            const duplicateAlert = document.getElementById('duplicateAlert');
            if (duplicateAlert) {
                duplicateAlert.classList.remove('hidden');

                // Add view existing handler
                const viewBtn = duplicateAlert.querySelector('.btn-link');
                if (viewBtn) {
                    viewBtn.addEventListener('click', () => {
                        viewExistingPatient(value);
                    });
                }
            }
        } else {
            const duplicateAlert = document.getElementById('duplicateAlert');
            if (duplicateAlert) {
                duplicateAlert.classList.add('hidden');
            }
        }
    }, 500);
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();

    if (field.hasAttribute('required') && !value) {
        field.classList.add('error');
        showFieldError(field, 'This field is required');
    } else {
        field.classList.remove('error');
        clearFieldError(field);
    }
}

function handleRegistrationSubmit(e) {
    e.preventDefault();

    const form = document.querySelector('#registrationModal .registration-form');
    if (!form) return;

    // Collect form data
    const formData = {
        fullName: form.querySelector('input[placeholder*="full name"]')?.value,
        phone: form.querySelector('input[type="tel"]')?.value,
        email: form.querySelector('input[type="email"]')?.value,
        idNumber: form.querySelector('input[placeholder*="ID"]')?.value,
        dateOfBirth: form.querySelector('input[type="date"]')?.value,
        gender: form.querySelector('select')?.value,
        address: form.querySelector('input[placeholder*="Street"]')?.value,
        city: form.querySelector('input[placeholder*="City"]')?.value,
        county: form.querySelector('select:last-of-type')?.value,
        photo: CheckInApp.state.selectedPatient?.photo,
        referralSource: form.querySelector('input[name="referral"]:checked')?.value,
        registeredBy: CheckInApp.state.currentUser.id,
        registrationDate: new Date().toISOString()
    };

    // Validate required fields
    if (!formData.fullName || !formData.phone || !formData.idNumber || !formData.dateOfBirth || !formData.gender) {
        showNotification('error', 'Please fill in all required fields');
        return;
    }

    // Save patient (in production, this would be an API call)
    console.log('Registering new patient:', formData);

    // Generate patient ID
    const patientId = 'PAT_' + Date.now();

    // Add to audit log
    addAuditEntry('REGISTRATION', `New patient registered: ${formData.fullName} - ID: ${patientId}`);

    // Show success
    showNotification('success', `Patient ${formData.fullName} registered successfully with ID: ${patientId}`);

    // Close modal and reset form
    closeModal('registrationModal');
    form.reset();
    CheckInApp.state.selectedPatient = null;
}

function handleRegistrationAction(e) {
    const btn = e.currentTarget;
    const action = btn.querySelector('span')?.textContent;

    switch (action) {
        case 'Quick Registration':
            openNewPatientRegistration();
            break;
        case 'Photo Capture':
            openNewPatientRegistration();
            setTimeout(() => capturePhoto(), 500);
            break;
        case 'ID Scan':
            scanNationalID();
            break;
        case 'Duplicate Check':
            performDuplicateCheck();
            break;
    }
}

// ===============================================
// WALK-IN CONVERSION
// ===============================================
function openWalkInModal() {
    openModal('walkInModal');
    initializeWalkInForm();
}

function initializeWalkInForm() {
    const form = document.querySelector('#walkInModal .walkin-form');
    if (!form) return;

    const submitBtn = form.querySelector('.btn-primary');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleWalkInSubmit);
    }
}

function handleWalkInSubmit(e) {
    e.preventDefault();

    const form = document.querySelector('#walkInModal .walkin-form');
    if (!form) return;

    const walkInData = {
        patientName: form.querySelector('input[placeholder*="Full name"]')?.value,
        phone: form.querySelector('input[type="tel"]')?.value,
        reason: form.querySelector('textarea')?.value,
        urgency: form.querySelector('select:first-of-type')?.value,
        doctorPreference: form.querySelector('select:last-of-type')?.value,
        type: 'WALK_IN',
        timestamp: new Date().toISOString()
    };

    // Validate
    if (!walkInData.patientName || !walkInData.phone || !walkInData.reason) {
        showNotification('error', 'Please fill in all required fields');
        return;
    }

    // Create walk-in appointment
    const appointmentId = 'WALK_' + Date.now();

    // Assign to doctor
    let assignedDoctor = walkInData.doctorPreference;
    if (assignedDoctor === 'Any Available Doctor') {
        assignedDoctor = findNextAvailableDoctor();
    }

    // Add to queue
    const appointment = {
        id: appointmentId,
        ...walkInData,
        doctor: assignedDoctor,
        status: 'arrived',
        arrivedAt: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    CheckInApp.state.todaysAppointments.push(appointment);
    CheckInApp.state.checkedInPatients.push(appointment);

    // Notify doctor
    notifyDoctor(appointment);

    // Add to audit
    addAuditEntry('WALK_IN', `Walk-in patient registered: ${walkInData.patientName}`);

    // Show success
    showNotification('success', `Walk-in appointment created for ${walkInData.patientName}`);

    // Close modal
    closeModal('walkInModal');
    form.reset();
}

function findNextAvailableDoctor() {
    // Find doctor with least queue
    const availableDoctors = CheckInApp.state.doctors.filter(doc => doc.status === 'available');
    if (availableDoctors.length > 0) {
        availableDoctors.sort((a, b) => a.queue - b.queue);
        return availableDoctors[0].name;
    }

    // Default to first doctor if none available
    return CheckInApp.state.doctors[0].name;
}

// ===============================================
// PATIENT PROFILE UPDATES
// ===============================================
function openUpdateProfileModal() {
    openModal('updateProfileModal');
    initializeUpdateForm();
}

function initializeUpdateForm() {
    const form = document.querySelector('#updateProfileModal .update-form');
    if (!form) return;

    // Patient search
    const searchInput = form.querySelector('input[placeholder*="patient name"]');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchPatientForUpdate, 300));
    }

    // Submit handler
    const submitBtn = form.querySelector('.btn-primary');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleProfileUpdate);
    }
}

function searchPatientForUpdate() {
    const searchInput = document.querySelector('#updateProfileModal input[placeholder*="patient name"]');
    const query = searchInput?.value.trim();

    if (!query) return;

    // Simulate patient search and load data
    setTimeout(() => {
        // Mock patient data
        const patientData = {
            name: 'John Mwangi',
            phone: '+254 712 345 678',
            email: 'john.mwangi@example.com',
            address: '123 Kimathi Street',
            insurance: 'Jubilee Insurance',
            policyNumber: 'POL123456',
            emergencyContact: 'Jane Mwangi - +254 722 987 654'
        };

        // Populate form
        const form = document.querySelector('#updateProfileModal .update-form');
        if (form) {
            form.querySelector('input[type="tel"]').value = patientData.phone;
            form.querySelector('input[type="email"]').value = patientData.email;
            form.querySelector('input[value="123 Kimathi Street"]').value = patientData.address;
            // Continue populating other fields...
        }

        CheckInApp.state.selectedPatient = patientData;
    }, 500);
}

function handleProfileUpdate(e) {
    e.preventDefault();

    const form = document.querySelector('#updateProfileModal .update-form');
    if (!form || !CheckInApp.state.selectedPatient) return;

    // Collect changed fields
    const updates = {
        phone: form.querySelector('input[type="tel"]')?.value,
        email: form.querySelector('input[type="email"]')?.value,
        address: form.querySelector('input[value*="Street"]')?.value,
        insurance: form.querySelector('select')?.value,
        policyNumber: form.querySelector('input[placeholder*="policy"]')?.value,
        emergencyContact: form.querySelector('input[placeholder*="emergency"]')?.value,
        updateReason: form.querySelector('textarea')?.value
    };

    // Track changes
    const changeLog = [];
    Object.keys(updates).forEach(key => {
        if (updates[key] !== CheckInApp.state.selectedPatient[key]) {
            changeLog.push({
                field: key,
                oldValue: CheckInApp.state.selectedPatient[key],
                newValue: updates[key],
                changedBy: CheckInApp.state.currentUser.name,
                timestamp: new Date().toISOString()
            });
        }
    });

    if (changeLog.length > 0) {
        // Save updates (in production, this would be an API call)
        console.log('Profile updates:', changeLog);

        // Add to audit
        addAuditEntry('PROFILE_UPDATE', `Profile updated for ${CheckInApp.state.selectedPatient.name} - ${changeLog.length} fields changed`);

        // Show success
        showNotification('success', `Profile updated successfully for ${CheckInApp.state.selectedPatient.name}`);

        // Update recent updates display
        updateRecentProfileUpdates(CheckInApp.state.selectedPatient.name, changeLog[0].field);
    } else {
        showNotification('info', 'No changes detected');
    }

    // Close modal
    closeModal('updateProfileModal');
}

function updateRecentProfileUpdates(patientName, updateType) {
    const updateList = document.querySelector('.update-list');
    if (!updateList) return;

    // Create new update item
    const updateItem = document.createElement('div');
    updateItem.className = 'update-item';
    updateItem.innerHTML = `
        <span class="update-time">Just now</span>
        <div class="update-details">
            <span class="patient-name">${patientName}</span>
            <span class="update-type">${updateType} updated</span>
            <span class="updated-by">by ${CheckInApp.state.currentUser.name}</span>
        </div>
    `;

    // Add to top of list
    updateList.insertBefore(updateItem, updateList.firstChild);

    // Remove last item if list is too long
    if (updateList.children.length > 5) {
        updateList.removeChild(updateList.lastChild);
    }
}

// ===============================================
// DOCTOR ASSIGNMENT ENGINE
// ===============================================
function handleDoctorAssignment(e) {
    const btn = e.currentTarget;
    const doctorCard = btn.closest('.doctor-card');

    if (!doctorCard) return;

    // Get doctor info
    const doctorName = doctorCard.querySelector('.doctor-name')?.textContent;
    const doctorStatus = doctorCard.querySelector('.status-indicator')?.classList[1];

    if (doctorStatus === 'break') {
        showNotification('warning', `${doctorName} is currently on break`);
        return;
    }

    openModal('assignmentModal');

    // Populate assignment modal with doctor info
    const modal = document.getElementById('assignmentModal');
    if (modal) {
        const doctorOption = modal.querySelector(`label:has(.doc-name:contains("${doctorName}"))`);
        if (doctorOption) {
            const radio = doctorOption.previousElementSibling;
            if (radio) radio.checked = true;
        }
    }
}

function acceptAISuggestion() {
    // Get AI recommended doctor
    const recommendedDoctor = CheckInApp.state.doctors.find(doc => doc.status === 'available' && doc.queue === 3);

    if (recommendedDoctor) {
        // Assign patient to recommended doctor
        assignPatientToDoctor(CheckInApp.state.selectedPatient, recommendedDoctor);

        // Update UI
        updateDoctorLoadDisplay(recommendedDoctor.id);

        // Add to audit
        addAuditEntry('AI_ASSIGNMENT', `AI suggestion accepted - Patient assigned to ${recommendedDoctor.name}`);

        showNotification('success', `Patient assigned to ${recommendedDoctor.name} as recommended`);
    }
}

function assignPatientToDoctor(patient, doctor) {
    if (!patient || !doctor) return;

    // Update doctor queue
    doctor.queue++;
    doctor.capacity = Math.min(100, (doctor.queue / 10) * 100);

    // Create assignment record
    const assignment = {
        patientId: patient?.id || 'TEMP_' + Date.now(),
        patientName: patient?.name || 'Unknown Patient',
        doctorId: doctor.id,
        doctorName: doctor.name,
        assignedAt: new Date().toISOString(),
        assignedBy: CheckInApp.state.currentUser.id,
        estimatedWaitTime: doctor.queue * doctor.avgTime
    };

    // Notify doctor
    notifyDoctor(assignment);

    // Update queue
    addToQueue(assignment);

    return assignment;
}

function updateDoctorLoadDisplay(doctorId) {
    const doctor = CheckInApp.state.doctors.find(doc => doc.id === doctorId);
    if (!doctor) return;

    // Find doctor card in UI
    const doctorCards = document.querySelectorAll('.doctor-card');
    doctorCards.forEach(card => {
        const nameElement = card.querySelector('.doctor-name');
        if (nameElement?.textContent === doctor.name) {
            // Update queue count
            const queueValue = card.querySelector('.load-info .value');
            if (queueValue) queueValue.textContent = `${doctor.queue} patients`;

            // Update capacity gauge
            const gaugeFill = card.querySelector('.gauge-fill');
            if (gaugeFill) {
                gaugeFill.style.width = `${doctor.capacity}%`;

                // Change color based on capacity
                if (doctor.capacity > 70) {
                    gaugeFill.classList.add('high');
                } else {
                    gaugeFill.classList.remove('high');
                }
            }

            const gaugeLabel = card.querySelector('.gauge-label');
            if (gaugeLabel) gaugeLabel.textContent = `${doctor.capacity}% capacity`;
        }
    });
}

// ===============================================
// NOTIFICATION SYSTEM
// ===============================================
function initializeNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');

    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotificationCenter);
    }

    // Check for WebSocket support
    if ('WebSocket' in window) {
        initializeWebSocket();
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function initializeWebSocket() {
    try {
        const ws = new WebSocket(CheckInApp.config.websocketUrl);

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleRealtimeNotification(data);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected. Reconnecting...');
            setTimeout(initializeWebSocket, 5000);
        };

        CheckInApp.websocket = ws;
    } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
    }
}

function notifyDoctor(appointment) {
    const doctor = CheckInApp.state.doctors.find(doc =>
        doc.name === appointment.doctor || doc.name === appointment.doctorName
    );

    if (!doctor) return;

    // Check notification settings
    const toastEnabled = document.querySelector('.toggle-switch:has(.toggle-label:contains("Toast")) input')?.checked;
    const smsEnabled = document.querySelector('.toggle-switch:has(.toggle-label:contains("SMS")) input')?.checked;
    const internalEnabled = document.querySelector('.toggle-switch:has(.toggle-label:contains("Internal")) input')?.checked;

    const notification = {
        type: 'patient_arrival',
        doctorId: doctor.id,
        doctorName: doctor.name,
        patientName: appointment.patientName,
        room: doctor.room,
        timestamp: new Date().toISOString()
    };

    // Send via different channels
    if (toastEnabled) {
        sendToastNotification(notification);
    }

    if (smsEnabled && doctor.status === 'offline') {
        sendSMSNotification(notification);
    }

    if (internalEnabled) {
        sendInternalMessage(notification);
    }

    // Update notification display
    updateNotificationDisplay(notification);
}

function sendToastNotification(notification) {
    // Create browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Patient Arrived', {
            body: `${notification.patientName} has arrived for consultation in Room ${notification.room}`,
            icon: '/images/curis-icon.png',
            tag: 'patient-arrival',
            requireInteraction: true
        });
    }

    // Also show in-app toast
    showNotification('info', `${notification.doctorName} notified - Patient arrived`);
}

function sendSMSNotification(notification) {
    // In production, this would call SMS API
    console.log('Sending SMS to doctor:', notification);

    // Update notification list
    const notifItem = document.createElement('div');
    notifItem.className = 'notif-item warning';
    notifItem.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <div class="notif-content">
            <span class="notif-message">${notification.doctorName} offline - SMS sent</span>
            <span class="notif-time">Just now</span>
        </div>
    `;

    const notifList = document.querySelector('.notif-list');
    if (notifList) {
        notifList.insertBefore(notifItem, notifList.firstChild);
    }
}

function sendInternalMessage(notification) {
    // Send via WebSocket if available
    if (CheckInApp.websocket && CheckInApp.websocket.readyState === WebSocket.OPEN) {
        CheckInApp.websocket.send(JSON.stringify({
            type: 'doctor_notification',
            data: notification
        }));
    }
}

function updateNotificationDisplay(notification) {
    // Add to notifications array
    CheckInApp.state.notifications.unshift(notification);

    // Update badge count
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const count = CheckInApp.state.notifications.filter(n => !n.read).length;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }

    // Add to recent notifications
    const notifItem = document.createElement('div');
    notifItem.className = 'notif-item success';
    notifItem.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div class="notif-content">
            <span class="notif-message">${notification.doctorName} notified - Patient arrived</span>
            <span class="notif-time">Just now</span>
        </div>
    `;

    const notifList = document.querySelector('.notif-list');
    if (notifList) {
        notifList.insertBefore(notifItem, notifList.firstChild);

        // Keep only last 5 notifications
        while (notifList.children.length > 5) {
            notifList.removeChild(notifList.lastChild);
        }
    }
}

function showNotification(type, message, duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `app-notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="close-notif">&times;</button>
    `;

    // Add styles if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .app-notification {
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 16px 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 2000;
                animation: slideInRight 0.3s ease;
                max-width: 400px;
            }
            
            .app-notification.success { border-left: 4px solid #10B981; }
            .app-notification.error { border-left: 4px solid #EF4444; }
            .app-notification.warning { border-left: 4px solid #F59E0B; }
            .app-notification.info { border-left: 4px solid #3B82F6; }
            
            .app-notification i {
                font-size: 20px;
            }
            
            .app-notification.success i { color: #10B981; }
            .app-notification.error i { color: #EF4444; }
            .app-notification.warning i { color: #F59E0B; }
            .app-notification.info i { color: #3B82F6; }
            
            .close-notif {
                margin-left: auto;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #9CA3AF;
            }
            
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
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Close button
    notification.querySelector('.close-notif').addEventListener('click', () => {
        notification.remove();
    });

    // Auto-remove
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ===============================================
// QUEUE MANAGEMENT
// ===============================================
function addToQueue(appointment) {
    // Determine queue priority
    const waitTime = calculateWaitTime(appointment);

    // Update queue stats
    if (waitTime < 15) {
        CheckInApp.state.queueData.green++;
    } else if (waitTime <= 30) {
        CheckInApp.state.queueData.yellow++;
    } else {
        CheckInApp.state.queueData.red++;
    }

    // Update queue display
    updateQueueDisplay();

    // Sync with Queue & Flow page
    syncWithQueuePage(appointment);
}

function calculateWaitTime(appointment) {
    const doctor = CheckInApp.state.doctors.find(doc =>
        doc.name === appointment.doctor || doc.name === appointment.doctorName
    );

    if (!doctor) return 0;

    return doctor.queue * doctor.avgTime;
}

function updateQueueDisplay() {
    // Update green queue
    const greenCount = document.querySelector('.queue-item.green .queue-count');
    if (greenCount) greenCount.textContent = CheckInApp.state.queueData.green;

    // Update yellow queue
    const yellowCount = document.querySelector('.queue-item.yellow .queue-count');
    if (yellowCount) yellowCount.textContent = CheckInApp.state.queueData.yellow;

    // Update red queue
    const redCount = document.querySelector('.queue-item.red .queue-count');
    if (redCount) redCount.textContent = CheckInApp.state.queueData.red;
}

function handleQueueAction(e) {
    const btn = e.currentTarget;
    const action = btn.textContent.trim();

    switch (action) {
        case 'Refresh Queue':
            refreshQueueData();
            break;
        case 'Reorder Patients':
            openQueueReorderModal();
            break;
        case 'View Full Queue':
            // This is a link, handled by href
            break;
    }
}

function refreshQueueData() {
    // In production, this would fetch from server
    console.log('Refreshing queue data...');

    // Animate refresh button
    const refreshBtn = document.querySelector('.queue-btn:has(.fa-sync)');
    if (refreshBtn) {
        const icon = refreshBtn.querySelector('i');
        icon.style.animation = 'spin 1s linear';

        setTimeout(() => {
            icon.style.animation = '';
            showNotification('success', 'Queue data refreshed');
        }, 1000);
    }

    // Update display
    updateQueueDisplay();
}

// ===============================================
// ADMIN NOTES
// ===============================================
function openNotesModal() {
    openModal('notesModal');
    initializeNotesForm();
}

function initializeNotesForm() {
    const form = document.querySelector('#notesModal .notes-form');
    if (!form) return;

    // Character counter
    const textarea = form.querySelector('textarea');
    const charCount = form.querySelector('.char-count');

    if (textarea && charCount) {
        textarea.addEventListener('input', () => {
            const count = textarea.value.length;
            charCount.textContent = `${count} / 500`;

            if (count > 450) {
                charCount.style.color = 'var(--warning-yellow)';
            } else {
                charCount.style.color = 'var(--medium-gray)';
            }
        });
    }

    // Submit handler
    const submitBtn = form.querySelector('.btn-primary');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleNoteSubmit);
    }
}

function handleNoteSubmit(e) {
    e.preventDefault();

    const form = document.querySelector('#notesModal .notes-form');
    if (!form) return;

    const noteData = {
        patientName: form.querySelector('input[placeholder*="Search patient"]')?.value,
        category: form.querySelector('select')?.value,
        content: form.querySelector('textarea')?.value,
        addedBy: CheckInApp.state.currentUser.name,
        timestamp: new Date().toISOString()
    };

    if (!noteData.patientName || !noteData.content) {
        showNotification('error', 'Please select a patient and enter note content');
        return;
    }

    // Save note (in production, this would be an API call)
    console.log('Saving admin note:', noteData);

    // Add to notes display
    addNoteToDisplay(noteData);

    // Add to audit
    addAuditEntry('ADMIN_NOTE', `Admin note added for ${noteData.patientName}`);

    showNotification('success', 'Note added successfully');

    closeModal('notesModal');
}

function addNoteToDisplay(noteData) {
    const notesPanel = document.querySelector('.notes-panel');
    if (!notesPanel) return;

    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    noteItem.innerHTML = `
        <div class="note-header">
            <span class="patient-name">${noteData.patientName}</span>
            <span class="note-date">Added: ${new Date().toLocaleDateString()}</span>
        </div>
        <div class="note-content">
            <p>${noteData.content}</p>
        </div>
        <div class="note-footer">
            <span class="added-by">by ${noteData.addedBy}</span>
            <button class="edit-note-btn"><i class="fas fa-edit"></i></button>
        </div>
    `;

    // Add edit handler
    noteItem.querySelector('.edit-note-btn').addEventListener('click', editNote);

    // Add to top of panel
    notesPanel.insertBefore(noteItem, notesPanel.firstChild);
}

function editNote(e) {
    const noteItem = e.currentTarget.closest('.note-item');
    if (!noteItem) return;

    const content = noteItem.querySelector('.note-content p');
    const originalText = content.textContent;

    // Make editable
    content.contentEditable = true;
    content.style.padding = '8px';
    content.style.border = '2px solid var(--accent-teal)';
    content.style.borderRadius = '8px';
    content.focus();

    // Change button to save
    const editBtn = noteItem.querySelector('.edit-note-btn');
    editBtn.innerHTML = '<i class="fas fa-save"></i>';
    editBtn.style.color = 'var(--success-green)';

    // Save on click
    editBtn.onclick = () => {
        content.contentEditable = false;
        content.style.border = 'none';
        content.style.padding = '0';

        if (content.textContent !== originalText) {
            // Save changes
            showNotification('success', 'Note updated successfully');

            // Add to audit
            addAuditEntry('NOTE_EDIT', 'Admin note edited');
        }

        // Restore button
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.style.color = '';
        editBtn.onclick = editNote;
    };
}

// ===============================================
// AUDIT SYSTEM
// ===============================================
function initializeAuditSystem() {
    // Load existing audit log
    loadAuditLog();

    // Set up periodic sync
    setInterval(syncAuditLog, 60000); // Sync every minute
}

function addAuditEntry(action, details, targetId = null) {
    const entry = {
        id: 'AUDIT_' + Date.now(),
        action: action,
        details: details,
        targetId: targetId,
        userId: CheckInApp.state.currentUser.id,
        userName: CheckInApp.state.currentUser.name,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.100' // In production, get actual IP
    };

    CheckInApp.state.auditLog.push(entry);

    // Update display
    updateAuditDisplay(entry);

    // Save to server (async)
    saveAuditEntry(entry);
}

function updateAuditDisplay(entry) {
    const auditEntries = document.querySelector('.audit-entries');
    if (!auditEntries) return;

    const auditItem = document.createElement('div');
    auditItem.className = 'audit-entry';
    auditItem.innerHTML = `
        <span class="audit-time">${new Date(entry.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })}</span>
        <div class="audit-details">
            <span class="audit-action">${formatAuditAction(entry.action)}</span>
            <span class="audit-user">by ${entry.userName}</span>
            <span class="audit-target">${entry.details}</span>
            <span class="audit-ip">IP: ${entry.ip}</span>
        </div>
    `;

    auditEntries.insertBefore(auditItem, auditEntries.firstChild);

    // Keep only last 10 entries in view
    while (auditEntries.children.length > 10) {
        auditEntries.removeChild(auditEntries.lastChild);
    }
}

function formatAuditAction(action) {
    const actionMap = {
        'CHECK_IN': 'Patient Checked In',
        'REGISTRATION': 'New Patient Registered',
        'PROFILE_UPDATE': 'Profile Updated',
        'WALK_IN': 'Walk-In Registered',
        'AI_ASSIGNMENT': 'Doctor Assignment (AI)',
        'MANUAL_ASSIGNMENT': 'Doctor Assignment (Manual)',
        'ADMIN_NOTE': 'Admin Note Added',
        'NOTE_EDIT': 'Note Edited',
        'SEARCH': 'Search Performed',
        'MODAL_OPEN': 'Modal Opened'
    };

    return actionMap[action] || action;
}

function openAuditFilterModal() {
    openModal('auditFilterModal');
    initializeAuditFilters();
}

function initializeAuditFilters() {
    const form = document.querySelector('#auditFilterModal .filter-form');
    if (!form) return;

    const applyBtn = form.querySelector('.btn-primary');
    const resetBtn = form.querySelector('.btn-secondary');

    if (applyBtn) {
        applyBtn.addEventListener('click', applyAuditFilters);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetAuditFilters);
    }
}

function applyAuditFilters(e) {
    e.preventDefault();

    const form = document.querySelector('#auditFilterModal .filter-form');
    if (!form) return;

    const filters = {
        dateFrom: form.querySelector('input[type="date"]:first-of-type')?.value,
        dateTo: form.querySelector('input[type="date"]:last-of-type')?.value,
        user: form.querySelector('select:first-of-type')?.value,
        actionType: form.querySelector('select:nth-of-type(2)')?.value,
        patient: form.querySelector('input[placeholder*="patient"]')?.value,
        exportFormat: form.querySelector('input[name="export"]:checked')?.value
    };

    // Filter audit log
    let filteredLog = CheckInApp.state.auditLog;

    if (filters.dateFrom) {
        filteredLog = filteredLog.filter(entry =>
            new Date(entry.timestamp) >= new Date(filters.dateFrom)
        );
    }

    if (filters.dateTo) {
        filteredLog = filteredLog.filter(entry =>
            new Date(entry.timestamp) <= new Date(filters.dateTo)
        );
    }

    if (filters.user && filters.user !== 'All Users') {
        filteredLog = filteredLog.filter(entry => entry.userName === filters.user);
    }

    // Handle export
    if (filters.exportFormat === 'csv') {
        exportToCSV(filteredLog);
    } else if (filters.exportFormat === 'pdf') {
        exportToPDF(filteredLog);
    } else {
        displayFilteredAudit(filteredLog);
    }

    closeModal('auditFilterModal');
}

function exportAuditLog() {
    const format = confirm('Export as CSV? (OK for CSV, Cancel for PDF)') ? 'csv' : 'pdf';

    if (format === 'csv') {
        exportToCSV(CheckInApp.state.auditLog);
    } else {
        exportToPDF(CheckInApp.state.auditLog);
    }
}

function exportToCSV(data) {
    const csv = [
        ['Timestamp', 'Action', 'Details', 'User', 'IP Address'],
        ...data.map(entry => [
            entry.timestamp,
            entry.action,
            entry.details,
            entry.userName,
            entry.ip
        ])
    ].map(row => row.join(',')).join('\\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString()}.csv`;
    a.click();

    showNotification('success', 'Audit log exported as CSV');
}

function exportToPDF(data) {
    // In production, use a PDF library like jsPDF
    console.log('Exporting to PDF:', data);
    showNotification('info', 'PDF export feature coming soon');
}

// ===============================================
// REAL-TIME SYNCHRONIZATION
// ===============================================
function initializeRealtimeSync() {
    // Sync with other pages periodically
    setInterval(() => {
        syncWithDashboard();
        syncWithAppointments();
        syncWithQueuePage();
        syncWithPatientDirectory();
    }, 10000); // Every 10 seconds
}

function syncWithDashboard() {
    // Update dashboard metrics
    const metrics = {
        checkedInToday: CheckInApp.state.checkedInPatients.length,
        totalAppointments: CheckInApp.state.todaysAppointments.length,
        walkIns: CheckInApp.state.todaysAppointments.filter(apt => apt.type === 'WALK_IN').length
    };

    // Send to dashboard (in production, via API or WebSocket)
    if (CheckInApp.websocket?.readyState === WebSocket.OPEN) {
        CheckInApp.websocket.send(JSON.stringify({
            type: 'dashboard_update',
            data: metrics
        }));
    }
}

function syncWithAppointments() {
    // Sync appointment status changes
    const statusUpdates = CheckInApp.state.todaysAppointments.map(apt => ({
        id: apt.id,
        status: apt.status,
        arrivedAt: apt.arrivedAt
    }));

    // Send updates
    localStorage.setItem('appointment_updates', JSON.stringify(statusUpdates));
}

function syncWithQueuePage(appointment = null) {
    // Sync queue data
    const queueUpdate = {
        timestamp: new Date().toISOString(),
        queueStats: CheckInApp.state.queueData,
        newPatient: appointment
    };

    // Send to queue page
    localStorage.setItem('queue_update', JSON.stringify(queueUpdate));

    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'queue_update',
        newValue: JSON.stringify(queueUpdate)
    }));
}

function syncWithPatientDirectory() {
    // Sync new patients and updates
    const patientUpdates = {
        newPatients: CheckInApp.state.recentPatients.filter(p => p.isNew),
        profileUpdates: CheckInApp.state.auditLog.filter(entry =>
            entry.action === 'PROFILE_UPDATE'
        )
    };

    localStorage.setItem('patient_directory_sync', JSON.stringify(patientUpdates));
}

function updateDashboardMetrics() {
    // Calculate and update metrics
    const metrics = {
        patientsCheckedToday: CheckInApp.state.checkedInPatients.length,
        avgCheckInTime: calculateAvgCheckInTime(),
        peakHour: calculatePeakHour()
    };

    // Update local display if dashboard elements exist
    const metricsDisplay = document.querySelector('.performance-metrics');
    if (metricsDisplay) {
        // Update metric values
    }

    // Sync with dashboard
    syncWithDashboard();
}

// ===============================================
// HELPER FUNCTIONS
// ===============================================
function loadTodaysAppointments() {
    // In production, fetch from server
    const mockAppointments = [
        {
            id: 'APT_001',
            patientId: '12345',
            patientName: 'John Mwangi',
            time: '09:00 AM',
            doctor: 'Dr. James Ochieng',
            status: 'pending'
        },
        {
            id: 'APT_002',
            patientId: '12346',
            patientName: 'Mary Njeri',
            time: '09:30 AM',
            doctor: 'Dr. Mary Kamau',
            status: 'arrived',
            arrivedAt: '9:25 AM'
        },
        {
            id: 'APT_003',
            patientId: '12347',
            patientName: 'Peter Omondi',
            time: '10:00 AM',
            doctor: 'Dr. Peter Mutua',
            status: 'pending'
        }
    ];

    CheckInApp.state.todaysAppointments = mockAppointments;
}

function loadRecentPatients() {
    // Load from local storage or server
    const stored = localStorage.getItem('recent_patients');
    if (stored) {
        CheckInApp.state.recentPatients = JSON.parse(stored);
    } else {
        // Mock data
        CheckInApp.state.recentPatients = [
            { id: '12345', name: 'John Mwangi', lastVisit: '2025-09-28' },
            { id: '12346', name: 'Mary Njeri', lastVisit: '2025-09-27' },
            { id: '12347', name: 'Peter Omondi', lastVisit: '2025-09-26' },
            { id: '12348', name: 'Grace Wanjiku', lastVisit: '2025-09-25' },
            { id: '12349', name: 'David Kimani', lastVisit: '2025-09-24' }
        ];
    }
}

function quickAccessPatient(e) {
    const btn = e.currentTarget;
    const patientName = btn.querySelector('span')?.textContent;

    // Find patient
    const patient = CheckInApp.state.recentPatients.find(p => p.name === patientName);
    if (!patient) return;

    // Set as selected
    CheckInApp.state.selectedPatient = patient;

    // Open check-in modal with patient pre-selected
    openModal('checkInModal');

    // Populate patient info
    const patientInfo = document.querySelector('#checkInModal .patient-info');
    if (patientInfo) {
        patientInfo.querySelector('h3').textContent = patient.name;
        patientInfo.querySelector('p:nth-child(2)').textContent = `ID: ${patient.id}`;
    }
}

function loadAuditLog() {
    // Load from local storage or server
    const stored = localStorage.getItem('audit_log');
    if (stored) {
        CheckInApp.state.auditLog = JSON.parse(stored);

        // Display recent entries
        CheckInApp.state.auditLog.slice(-10).forEach(entry => {
            updateAuditDisplay(entry);
        });
    }
}

function saveAuditEntry(entry) {
    // Save to local storage
    const currentLog = CheckInApp.state.auditLog;
    localStorage.setItem('audit_log', JSON.stringify(currentLog));

    // In production, also send to server
    if (CheckInApp.websocket?.readyState === WebSocket.OPEN) {
        CheckInApp.websocket.send(JSON.stringify({
            type: 'audit_entry',
            data: entry
        }));
    }
}

function syncAuditLog() {
    // Sync with server
    saveAuditEntry(null);
}

function calculateAvgCheckInTime() {
    if (CheckInApp.state.checkedInPatients.length === 0) return 0;

    // Calculate average time between scheduled and arrival
    const times = CheckInApp.state.checkedInPatients
        .filter(p => p.arrivedAt)
        .map(p => {
            const scheduled = new Date(`2025-09-29 ${p.time}`);
            const arrived = new Date(`2025-09-29 ${p.arrivedAt}`);
            return Math.abs(arrived - scheduled) / 60000; // Minutes
        });

    return times.reduce((a, b) => a + b, 0) / times.length;
}

function calculatePeakHour() {
    // Count check-ins by hour
    const hourCounts = {};

    CheckInApp.state.checkedInPatients.forEach(patient => {
        if (patient.arrivedAt) {
            const hour = patient.arrivedAt.split(':')[0];
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
    });

    // Find peak hour
    let peakHour = '';
    let maxCount = 0;

    for (const [hour, count] of Object.entries(hourCounts)) {
        if (count > maxCount) {
            maxCount = count;
            peakHour = hour;
        }
    }

    return peakHour;
}

// ===============================================
// PROFILE & SETTINGS
// ===============================================
function initializeProfileMenu() {
    const profileIcon = document.getElementById('profileIcon');
    const profilePopup = document.getElementById('profilePopup');

    if (profileIcon && profilePopup) {
        profileIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            profilePopup.classList.toggle('active');
        });

        // Close on outside click
        document.addEventListener('click', () => {
            profilePopup.classList.remove('active');
        });

        profilePopup.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Check stored preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        CheckInApp.state.darkMode = true;
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    CheckInApp.state.darkMode = !CheckInApp.state.darkMode;

    // Save preference
    localStorage.setItem('darkMode', CheckInApp.state.darkMode);

    // Update icon
    const icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        icon.className = CheckInApp.state.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ===============================================
// AUTO-SAVE & SESSION MANAGEMENT
// ===============================================
function startAutoSave() {
    setInterval(() => {
        // Save application state
        const stateToSave = {
            checkedInPatients: CheckInApp.state.checkedInPatients,
            recentPatients: CheckInApp.state.recentPatients,
            notifications: CheckInApp.state.notifications,
            queueData: CheckInApp.state.queueData
        };

        localStorage.setItem('checkin_app_state', JSON.stringify(stateToSave));
        console.log('Auto-save completed');
    }, CheckInApp.config.autoSaveInterval);
}

function startSessionMonitor() {
    let lastActivity = Date.now();

    // Track user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => {
            lastActivity = Date.now();
        });
    });

    // Check for timeout
    setInterval(() => {
        if (Date.now() - lastActivity > CheckInApp.config.sessionTimeout) {
            showNotification('warning', 'Session will expire in 5 minutes due to inactivity');

            // Set final warning
            setTimeout(() => {
                if (Date.now() - lastActivity > CheckInApp.config.sessionTimeout + 240000) {
                    // Session expired
                    alert('Session expired. Please log in again.');
                    window.location.href = '/login';
                }
            }, 240000);
        }
    }, 60000); // Check every minute
}

// ===============================================
// UTILITY FUNCTIONS
// ===============================================
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

function showFieldError(field, message) {
    // Remove existing error
    clearFieldError(field);

    // Create error element
    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    error.style.color = 'var(--danger-red)';
    error.style.fontSize = '12px';
    error.style.marginTop = '4px';
    error.style.display = 'block';

    field.parentElement.appendChild(error);
}

function clearFieldError(field) {
    const error = field.parentElement.querySelector('.field-error');
    if (error) error.remove();
}

function handleToggleChange(e) {
    const toggle = e.target;
    const label = toggle.parentElement.querySelector('.toggle-label')?.textContent;

    console.log(`${label} toggled: ${toggle.checked}`);

    // Add to audit
    addAuditEntry('SETTINGS_CHANGE', `${label} ${toggle.checked ? 'enabled' : 'disabled'}`);
}

function handleHelpLink(e) {
    e.preventDefault();
    const link = e.currentTarget;
    const text = link.textContent.trim();

    switch (text) {
        case 'Check-In Guide':
            showHelpGuide();
            break;
        case 'Video Tutorials':
            window.open('/tutorials/check-in', '_blank');
            break;
        case 'Best Practices':
            window.open('/docs/best-practices', '_blank');
            break;
        case 'Contact Support':
            window.open('/support', '_blank');
            break;
    }
}

function showHelpGuide() {
    // Create help modal
    const helpContent = `
        <h3>Check-In System Guide</h3>
        <ol>
            <li><strong>Live Check-In:</strong> Search for scheduled patients and mark them as arrived</li>
            <li><strong>New Registration:</strong> Register first-time patients with photo capture</li>
            <li><strong>Walk-Ins:</strong> Convert unscheduled patients to appointments</li>
            <li><strong>Doctor Assignment:</strong> Use AI suggestions or manually assign patients</li>
            <li><strong>Queue Management:</strong> Monitor wait times and reorder as needed</li>
        </ol>
        <p><strong>Keyboard Shortcuts:</strong></p>
        <ul>
            <li>Ctrl+N: New patient registration</li>
            <li>Ctrl+W: Walk-in registration</li>
            <li>Ctrl+F: Focus search</li>
            <li>Ctrl+Q: View queue</li>
        </ul>
    `;

    showNotification('info', 'Help guide opened - check documentation for details', 10000);
}

// ===============================================
// KEYBOARD SHORTCUTS
// ===============================================
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Check if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    openNewPatientRegistration();
                    break;
                case 'w':
                    e.preventDefault();
                    openWalkInModal();
                    break;
                case 'f':
                    e.preventDefault();
                    document.getElementById('patientSearchInput')?.focus();
                    break;
                case 'q':
                    e.preventDefault();
                    window.location.href = '/queue-flow';
                    break;
            }
        }

        // ESC to close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });
}

// ===============================================
// TOOLTIPS
// ===============================================
function initializeTooltips() {
    // Add tooltips to key elements
    const tooltips = [
        { selector: '.check-in-btn', text: 'Click to check in patient' },
        { selector: '.assign-btn', text: 'Assign patient to this doctor' },
        { selector: '.queue-btn', text: 'Manage patient queue' },
        { selector: '.toggle-switch', text: 'Toggle notification setting' }
    ];

    tooltips.forEach(({ selector, text }) => {
        document.querySelectorAll(selector).forEach(element => {
            element.title = text;
        });
    });
}

// ===============================================
// ERROR HANDLING
// ===============================================
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);

    // Log to audit
    addAuditEntry('ERROR', e.error?.message || 'Unknown error occurred');

    // Show user-friendly message
    if (!e.error?.message?.includes('WebSocket')) {
        showNotification('error', 'An error occurred. Please refresh if issues persist.');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);

    // Log to audit
    addAuditEntry('ERROR', 'Unhandled promise rejection');
});

// ===============================================
// CLEANUP ON PAGE UNLOAD
// ===============================================
window.addEventListener('beforeunload', () => {
    // Save state
    const stateToSave = {
        checkedInPatients: CheckInApp.state.checkedInPatients,
        recentPatients: CheckInApp.state.recentPatients,
        notifications: CheckInApp.state.notifications,
        auditLog: CheckInApp.state.auditLog.slice(-100) // Keep last 100 entries
    };

    localStorage.setItem('checkin_app_state', JSON.stringify(stateToSave));

    // Close WebSocket
    if (CheckInApp.websocket) {
        CheckInApp.websocket.close();
    }
});

// Additional helper functions for missing implementations
function scanNationalID() {
    showNotification('info', 'ID scanner integration coming soon');
}

function performDuplicateCheck() {
    showNotification('info', 'Checking for duplicate patients...');
    setTimeout(() => {
        showNotification('success', 'No duplicates found');
    }, 2000);
}

function viewExistingPatient(identifier) {
    console.log('Viewing existing patient:', identifier);
    showNotification('info', `Loading patient record for ${identifier}`);
}

function openQueueReorderModal() {
    showNotification('info', 'Queue reordering interface opening...');
}

function toggleNotificationCenter() {
    showNotification('info', 'Notification center feature coming soon');
}

function handleRealtimeNotification(data) {
    console.log('Realtime notification received:', data);
    showNotification('info', `New notification: ${data.message || 'Update received'}`);
}

function displayFilteredAudit(filteredLog) {
    console.log('Displaying filtered audit log:', filteredLog);
    showNotification('success', `Found ${filteredLog.length} audit entries`);
}

function resetAuditFilters() {
    const form = document.querySelector('#auditFilterModal .filter-form');
    if (form) form.reset();
    showNotification('info', 'Filters reset');
}

console.log('Curis Check-In System JavaScript Loaded Successfully');
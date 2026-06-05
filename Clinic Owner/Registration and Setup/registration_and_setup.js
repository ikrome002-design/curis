/* ====================================
   CURIS REGISTRATION & SETUP - COMPLETE JAVASCRIPT
   Dynamic Healthcare Dashboard Functionality
   Comprehensive Setup Flow Management
   ==================================== */

// ====================================
// GLOBAL STATE MANAGEMENT
// ====================================
const SetupState = {
    currentStep: 1,
    completedSteps: {
        clinicIdentity: true,
        operatingHours: false,
        services: false,
        paymentTerms: false,
        finalSetup: false
    },
    formData: {
        clinicIdentity: {
            name: 'Nairobi Family Health Clinic',
            logo: null,
            phone: '+254 700 123 456',
            email: 'info@nairobifamilyhealth.co.ke',
            address: 'Karen Shopping Centre, Nairobi',
            description: 'Comprehensive family healthcare services in the heart of Nairobi, providing quality medical care for all ages.',
            website: '',
            social: {
                facebook: '',
                twitter: '',
                instagram: ''
            }
        },
        operatingHours: {
            monday: { open: '08:00', close: '18:00', breakStart: '13:00', breakEnd: '14:00', isOpen: true },
            tuesday: { open: '08:00', close: '18:00', breakStart: '13:00', breakEnd: '14:00', isOpen: true },
            wednesday: { open: '08:00', close: '18:00', breakStart: '13:00', breakEnd: '14:00', isOpen: true },
            thursday: { open: '08:00', close: '18:00', breakStart: '13:00', breakEnd: '14:00', isOpen: true },
            friday: { open: '08:00', close: '18:00', breakStart: '13:00', breakEnd: '14:00', isOpen: true },
            saturday: { open: '09:00', close: '13:00', breakStart: '', breakEnd: '', isOpen: true },
            sunday: { open: '', close: '', breakStart: '', breakEnd: '', isOpen: false }
        },
        specialties: ['Primary Care', 'Family Medicine', 'Pediatrics'],
        services: [
            {
                id: 1,
                name: 'General Consultation',
                duration: 30,
                fee: 2500,
                staffRole: 'doctor',
                description: ''
            },
            {
                id: 2,
                name: 'Follow-up Consultation',
                duration: 20,
                fee: 1800,
                staffRole: 'doctor',
                description: ''
            },
            {
                id: 3,
                name: 'Child Immunization',
                duration: 15,
                fee: 1200,
                staffRole: 'nurse',
                description: ''
            }
        ],
        labServicesEnabled: false,
        labCategories: [],
        paymentFrequency: '',
        termsAccepted: false,
        firstStaff: {
            role: '',
            name: '',
            email: '',
            phone: ''
        }
    }
};

// ====================================
// DOM ELEMENT REFERENCES
// ====================================
const DOMElements = {
    // Header elements
    userProfileBtn: document.getElementById('userProfileBtn'),
    userDropdown: document.getElementById('userDropdown'),
    notificationBtn: document.getElementById('notificationBtn'),
    notificationsPanel: document.getElementById('notificationsPanel'),

    // Progress tracking
    progressFill: document.getElementById('progressFill'),
    completionPercentage: document.getElementById('completionPercentage'),
    stepIndicators: document.querySelectorAll('.step-indicator'),

    // Clinic identity
    editIdentityBtn: document.getElementById('editIdentityBtn'),
    changeLogoBtn: document.getElementById('changeLogoBtn'),
    clinicIdentityModal: document.getElementById('clinicIdentityModal'),
    clinicIdentityForm: document.getElementById('clinicIdentityForm'),

    // Operating hours
    editScheduleBtn: document.getElementById('editScheduleBtn'),
    holidayCalendarBtn: document.getElementById('holidayCalendarBtn'),
    savePresetBtn: document.getElementById('savePresetBtn'),
    operatingHoursModal: document.getElementById('operatingHoursModal'),

    // Services
    addSpecialtyBtn: document.getElementById('addSpecialtyBtn'),
    configureServicesBtn: document.getElementById('configureServicesBtn'),
    smartSuggestionsBtn: document.getElementById('smartSuggestionsBtn'),
    labServicesToggle: document.getElementById('labServicesToggle'),
    labConfig: document.getElementById('labConfig'),
    specialtyModal: document.getElementById('specialtyModal'),
    serviceModal: document.getElementById('serviceModal'),

    // Payment
    termsAgreement: document.getElementById('termsAgreement'),
    confirmPaymentTermsBtn: document.getElementById('confirmPaymentTermsBtn'),
    previewPaymentBtn: document.getElementById('previewPaymentBtn'),

    // Final setup
    editProfileBtn: document.getElementById('editProfileBtn'),
    publishProfileBtn: document.getElementById('publishProfileBtn'),
    sendInvitationBtn: document.getElementById('sendInvitationBtn'),
    skipStaffBtn: document.getElementById('skipStaffBtn'),
    completeSetupBtn: document.getElementById('completeSetupBtn'),
    saveExitBtn: document.getElementById('saveExitBtn'),
    saveProgressModal: document.getElementById('saveProgressModal'),

    // Auto refresh indicator
    autoRefreshIndicator: document.getElementById('autoRefreshIndicator')
};

// ====================================
// INITIALIZATION
// ====================================
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    updateProgressTracker();
    checkSetupStatus();
    initializeFormValidations();
    loadSavedProgress();
});

// ====================================
// EVENT LISTENERS SETUP
// ====================================
function initializeEventListeners() {
    // Header interactions
    DOMElements.userProfileBtn?.addEventListener('click', toggleUserDropdown);
    DOMElements.notificationBtn?.addEventListener('click', toggleNotifications);

    // Clinic identity
    DOMElements.editIdentityBtn?.addEventListener('click', () => openModal('clinicIdentityModal'));
    DOMElements.changeLogoBtn?.addEventListener('click', () => document.getElementById('logoUpload').click());
    document.getElementById('uploadLogoBtn')?.addEventListener('click', () => document.getElementById('logoUpload').click());
    document.getElementById('logoUpload')?.addEventListener('change', handleLogoUpload);
    document.getElementById('setLocationBtn')?.addEventListener('click', openLocationPicker);
    document.getElementById('clinicDescription')?.addEventListener('input', updateCharacterCount);

    // Operating hours
    DOMElements.editScheduleBtn?.addEventListener('click', () => openModal('operatingHoursModal'));
    DOMElements.holidayCalendarBtn?.addEventListener('click', openHolidayCalendar);
    DOMElements.savePresetBtn?.addEventListener('click', saveSchedulePreset);
    document.querySelectorAll('.edit-day-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editDaySchedule(e.target.dataset.day));
    });
    document.getElementById('applyToAllBtn')?.addEventListener('click', applyMondayToAll);
    document.getElementById('resetScheduleBtn')?.addEventListener('click', resetSchedule);
    document.getElementById('saveScheduleBtn')?.addEventListener('click', saveSchedule);

    // Services
    DOMElements.addSpecialtyBtn?.addEventListener('click', () => openModal('specialtyModal'));
    DOMElements.configureServicesBtn?.addEventListener('click', () => openModal('serviceModal'));
    DOMElements.smartSuggestionsBtn?.addEventListener('click', showSmartSuggestions);
    DOMElements.labServicesToggle?.addEventListener('change', toggleLabServices);
    document.querySelectorAll('.remove-specialty').forEach(btn => {
        btn.addEventListener('click', removeSpecialty);
    });
    document.querySelectorAll('.edit-service-btn').forEach(btn => {
        btn.addEventListener('click', editService);
    });
    document.getElementById('specialtySearch')?.addEventListener('input', filterSpecialties);
    document.getElementById('addCustomSpecialty')?.addEventListener('click', addCustomSpecialty);
    document.getElementById('saveSpecialties')?.addEventListener('click', saveSelectedSpecialties);
    document.getElementById('serviceConfigForm')?.addEventListener('submit', saveService);

    // Payment
    document.querySelectorAll('input[name="paymentFrequency"]').forEach(radio => {
        radio.addEventListener('change', updatePaymentPreview);
    });
    document.getElementById('weeklyPatients')?.addEventListener('input', calculateEstimation);
    document.getElementById('averageFee')?.addEventListener('input', calculateEstimation);
    DOMElements.termsAgreement?.addEventListener('change', togglePaymentConfirmButton);
    DOMElements.confirmPaymentTermsBtn?.addEventListener('click', confirmPaymentTerms);
    DOMElements.previewPaymentBtn?.addEventListener('click', previewPaymentSchedule);

    // Final setup
    DOMElements.editProfileBtn?.addEventListener('click', editClinicProfile);
    DOMElements.publishProfileBtn?.addEventListener('click', publishClinicProfile);
    DOMElements.sendInvitationBtn?.addEventListener('click', sendStaffInvitation);
    DOMElements.skipStaffBtn?.addEventListener('click', skipStaffCreation);
    DOMElements.completeSetupBtn?.addEventListener('click', completeSetup);
    DOMElements.saveExitBtn?.addEventListener('click', () => openModal('saveProgressModal'));
    document.getElementById('continueSetup')?.addEventListener('click', () => closeModal('saveProgressModal'));
    document.getElementById('confirmSaveExit')?.addEventListener('click', saveAndExit);

    // Modal controls
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) closeModal(modal.id);
        });
    });

    // Form submissions
    DOMElements.clinicIdentityForm?.addEventListener('submit', saveClinicIdentity);

    // Day schedule toggles
    document.querySelectorAll('.day-config input[type="checkbox"]').forEach(toggle => {
        toggle.addEventListener('change', toggleDaySchedule);
    });
}

// ====================================
// PROGRESS TRACKING
// ====================================
function updateProgressTracker() {
    const steps = Object.values(SetupState.completedSteps);
    const completedCount = steps.filter(step => step).length;
    const totalSteps = steps.length;
    const percentage = Math.round((completedCount / totalSteps) * 100);

    // Update progress bar
    if (DOMElements.progressFill) {
        DOMElements.progressFill.style.width = `${percentage}%`;
    }

    // Update percentage text
    if (DOMElements.completionPercentage) {
        DOMElements.completionPercentage.textContent = `${percentage}% Complete`;
    }

    // Update step indicators
    DOMElements.stepIndicators.forEach((indicator, index) => {
        const stepIndex = index + 1;
        indicator.classList.remove('completed', 'active');

        if (stepIndex < SetupState.currentStep) {
            indicator.classList.add('completed');
            indicator.querySelector('i').className = 'fas fa-check';
        } else if (stepIndex === SetupState.currentStep) {
            indicator.classList.add('active');
            indicator.querySelector('i').className = 'fas fa-clock';
        } else {
            indicator.querySelector('i').className = 'fas fa-circle';
        }
    });

    // Update completion indicator in final setup
    const completionCircle = document.querySelector('.completion-text');
    if (completionCircle) {
        completionCircle.textContent = `${percentage}%`;
    }

    // Enable/disable complete setup button
    if (percentage === 100) {
        DOMElements.completeSetupBtn?.removeAttribute('disabled');
    }
}

function checkSetupStatus() {
    // Check each section's completion status
    updateSectionStatus('clinicIdentity', SetupState.completedSteps.clinicIdentity);
    updateSectionStatus('operatingHours', SetupState.completedSteps.operatingHours);
    updateSectionStatus('services', SetupState.completedSteps.services);
    updateSectionStatus('paymentTerms', SetupState.completedSteps.paymentTerms);
    updateSectionStatus('finalSetup', SetupState.completedSteps.finalSetup);
}

function updateSectionStatus(section, isCompleted) {
    const statusMap = {
        clinicIdentity: document.querySelector('.widget:nth-child(1) .widget-status'),
        operatingHours: document.querySelector('.widget:nth-child(2) .widget-status'),
        services: document.querySelector('.widget:nth-child(3) .widget-status'),
        paymentTerms: document.querySelector('.widget:nth-child(4) .widget-status'),
        finalSetup: document.querySelector('.widget:nth-child(5) .widget-status')
    };

    const statusElement = statusMap[section];
    if (statusElement) {
        statusElement.className = `widget-status ${isCompleted ? 'completed' : 'pending'}`;
        statusElement.innerHTML = isCompleted
            ? '<i class="fas fa-check-circle"></i><span>Completed</span>'
            : '<i class="fas fa-circle"></i><span>Pending</span>';
    }
}

// ====================================
// FORM VALIDATIONS
// ====================================
function initializeFormValidations() {
    // Clinic name validation
    const clinicNameInput = document.getElementById('clinicName');
    clinicNameInput?.addEventListener('input', debounce(validateClinicName, 500));

    // Phone validation
    const phoneInput = document.getElementById('clinicPhone');
    phoneInput?.addEventListener('input', validatePhone);

    // Email validation
    const emailInput = document.getElementById('clinicEmail');
    emailInput?.addEventListener('input', validateEmail);
}

function validateClinicName(e) {
    const name = e.target.value;
    const validationElement = document.getElementById('nameValidation');

    if (name.length < 3) {
        showValidationError(validationElement, 'Clinic name must be at least 3 characters');
        return false;
    }

    // Simulate uniqueness check
    simulateAsyncValidation(validationElement, 'Checking availability...', () => {
        const isAvailable = !['Test Clinic', 'Demo Clinic'].includes(name);
        if (isAvailable) {
            showValidationSuccess(validationElement, '✓ Name is available');
        } else {
            showValidationError(validationElement, '✗ Name is already taken. Try: ' + name + ' Medical Center');
        }
        return isAvailable;
    });
}

function validatePhone(e) {
    const phone = e.target.value;
    const validationElement = document.getElementById('phoneValidation');
    const phoneRegex = /^\+?[\d\s-()]+$/;

    if (!phoneRegex.test(phone) || phone.length < 10) {
        showValidationError(validationElement, 'Please enter a valid phone number');
        return false;
    }

    showValidationSuccess(validationElement, '✓ Valid phone format');
    return true;
}

function validateEmail(e) {
    const email = e.target.value;
    const validationElement = document.getElementById('emailValidation');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        showValidationError(validationElement, 'Please enter a valid email address');
        return false;
    }

    showValidationSuccess(validationElement, '✓ Valid email format');
    return true;
}

function showValidationError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.color = 'var(--error-red)';
    }
}

function showValidationSuccess(element, message) {
    if (element) {
        element.textContent = message;
        element.style.color = 'var(--success-green)';
    }
}

function simulateAsyncValidation(element, loadingMessage, callback) {
    element.textContent = loadingMessage;
    element.style.color = 'var(--medium-gray)';

    setTimeout(() => {
        callback();
    }, 1000);
}

// ====================================
// MODAL MANAGEMENT
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

// ====================================
// USER INTERFACE INTERACTIONS
// ====================================
function toggleUserDropdown() {
    DOMElements.userDropdown?.classList.toggle('show');
    // Close notifications if open
    DOMElements.notificationsPanel?.classList.remove('show');
}

function toggleNotifications() {
    DOMElements.notificationsPanel?.classList.toggle('show');
    // Close user dropdown if open
    DOMElements.userDropdown?.classList.remove('show');
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-profile-container')) {
        DOMElements.userDropdown?.classList.remove('show');
    }
    if (!e.target.closest('.notification-container') && !e.target.closest('.notifications-panel')) {
        DOMElements.notificationsPanel?.classList.remove('show');
    }
});

// ====================================
// CLINIC IDENTITY FUNCTIONS
// ====================================
function saveClinicIdentity(e) {
    e.preventDefault();

    // Validate all fields
    const isValid = validateClinicIdentityForm();
    if (!isValid) return;

    // Update state
    SetupState.formData.clinicIdentity = {
        name: document.getElementById('clinicName').value,
        phone: document.getElementById('clinicPhone').value,
        email: document.getElementById('clinicEmail').value,
        address: document.getElementById('clinicAddress').value,
        description: document.getElementById('clinicDescription').value,
        website: document.getElementById('clinicWebsite').value,
        social: {
            facebook: document.getElementById('clinicFacebook').value,
            twitter: document.getElementById('clinicTwitter').value,
            instagram: document.getElementById('clinicInstagram').value
        }
    };

    // Update UI
    updateClinicIdentityDisplay();

    // Mark as completed
    SetupState.completedSteps.clinicIdentity = true;
    SetupState.currentStep = 2;
    updateProgressTracker();
    updateSectionStatus('clinicIdentity', true);

    // Show success message
    showNotification('Clinic identity updated successfully!', 'success');

    // Close modal
    closeModal('clinicIdentityModal');
}

function validateClinicIdentityForm() {
    // Check all required fields
    const requiredFields = ['clinicName', 'clinicPhone', 'clinicEmail'];
    let isValid = true;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

    return isValid;
}

function updateClinicIdentityDisplay() {
    const data = SetupState.formData.clinicIdentity;

    // Update displayed information
    document.querySelector('.clinic-name').textContent = data.name;
    document.querySelector('.clinic-description').textContent = data.description;

    // Update contact info
    const contactItems = document.querySelectorAll('.contact-item span');
    contactItems[0].textContent = data.phone;
    contactItems[1].textContent = data.email;
    contactItems[2].textContent = data.address;

    // Update social links
    if (data.website) {
        document.querySelector('.social-link-item span').textContent = data.website;
    }
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
        showNotification('Please upload a JPG, PNG, or SVG file', 'error');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        return;
    }

    // Preview the image
    const reader = new FileReader();
    reader.onload = function (e) {
        const logoElements = document.querySelectorAll('.logo-preview, #currentLogoPreview');
        logoElements.forEach(el => {
            if (el) el.src = e.target.result;
        });

        SetupState.formData.clinicIdentity.logo = e.target.result;
        showNotification('Logo uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
}

function updateCharacterCount(e) {
    const textarea = e.target;
    const count = textarea.value.length;
    const countElement = document.getElementById('charCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

function openLocationPicker() {
    // Simulate opening Google Maps integration
    showNotification('Opening location picker...', 'info');

    // In a real implementation, this would open a map modal
    setTimeout(() => {
        const address = prompt('Enter your clinic address:');
        if (address) {
            document.getElementById('clinicAddress').value = address;
            SetupState.formData.clinicIdentity.address = address;
        }
    }, 500);
}

// ====================================
// OPERATING HOURS FUNCTIONS
// ====================================
function editDaySchedule(day) {
    openModal('operatingHoursModal');
    // Scroll to the specific day configuration
    const dayConfig = document.querySelector(`.day-config[data-day="${day}"]`);
    dayConfig?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function toggleDaySchedule(e) {
    const dayConfig = e.target.closest('.day-config');
    const timeInputsContainer = dayConfig.querySelector('.time-inputs');
    const breakInputs = dayConfig.querySelectorAll('.break-input');

    if (e.target.checked) {
        timeInputsContainer.classList.remove('disabled');
        timeInputsContainer.querySelectorAll('input').forEach(input => {
            input.removeAttribute('disabled');
        });
    } else {
        timeInputsContainer.classList.add('disabled');
        timeInputsContainer.querySelectorAll('input').forEach(input => {
            input.setAttribute('disabled', 'disabled');
        });
        breakInputs.forEach(input => {
            input.setAttribute('disabled', 'disabled');
        });
    }
}

function applyMondayToAll() {
    const mondayConfig = document.querySelector('.day-config[data-day="monday"]');
    const mondayOpen = mondayConfig.querySelector('.time-input[value="08:00"]').value;
    const mondayClose = mondayConfig.querySelector('.time-input[value="18:00"]').value;
    const mondayBreakStart = mondayConfig.querySelector('.break-input[value="13:00"]').value;
    const mondayBreakEnd = mondayConfig.querySelector('.break-input[value="14:00"]').value;

    const days = ['tuesday', 'wednesday', 'thursday', 'friday'];
    days.forEach(day => {
        const dayConfig = document.querySelector(`.day-config[data-day="${day}"]`);
        if (dayConfig) {
            dayConfig.querySelector('.toggle-switch input').checked = true;
            dayConfig.querySelector('.time-inputs').classList.remove('disabled');

            const inputs = dayConfig.querySelectorAll('.time-input');
            inputs[0].value = mondayOpen;
            inputs[1].value = mondayClose;

            const breakInputs = dayConfig.querySelectorAll('.break-input');
            breakInputs[0].value = mondayBreakStart;
            breakInputs[1].value = mondayBreakEnd;
            breakInputs.forEach(input => input.removeAttribute('disabled'));
        }
    });

    showNotification('Monday schedule applied to all weekdays', 'success');
}

function resetSchedule() {
    const defaultSchedule = {
        monday: { open: '08:00', close: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        tuesday: { open: '08:00', close: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        wednesday: { open: '08:00', close: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        thursday: { open: '08:00', close: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        friday: { open: '08:00', close: '18:00', breakStart: '13:00', breakEnd: '14:00' },
        saturday: { open: '09:00', close: '13:00', breakStart: '', breakEnd: '' },
        sunday: { open: '', close: '', breakStart: '', breakEnd: '' }
    };

    Object.entries(defaultSchedule).forEach(([day, times]) => {
        const dayConfig = document.querySelector(`.day-config[data-day="${day}"]`);
        if (dayConfig) {
            const isOpen = times.open !== '';
            dayConfig.querySelector('.toggle-switch input').checked = isOpen;

            const inputs = dayConfig.querySelectorAll('.time-input');
            inputs[0].value = times.open;
            inputs[1].value = times.close;

            const breakInputs = dayConfig.querySelectorAll('.break-input');
            breakInputs[0].value = times.breakStart;
            breakInputs[1].value = times.breakEnd;

            if (!isOpen) {
                dayConfig.querySelector('.time-inputs').classList.add('disabled');
                dayConfig.querySelectorAll('input[type="time"]').forEach(input => {
                    input.setAttribute('disabled', 'disabled');
                });
            }
        }
    });

    showNotification('Schedule reset to default', 'info');
}

function saveSchedule() {
    // Collect schedule data
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
        const dayConfig = document.querySelector(`.day-config[data-day="${day}"]`);
        const isOpen = dayConfig.querySelector('.toggle-switch input').checked;
        const inputs = dayConfig.querySelectorAll('.time-input');
        const breakInputs = dayConfig.querySelectorAll('.break-input');

        SetupState.formData.operatingHours[day] = {
            isOpen: isOpen,
            open: isOpen ? inputs[0].value : '',
            close: isOpen ? inputs[1].value : '',
            breakStart: isOpen && breakInputs[0].value ? breakInputs[0].value : '',
            breakEnd: isOpen && breakInputs[1].value ? breakInputs[1].value : ''
        };
    });

    // Update display
    updateScheduleDisplay();

    // Mark as completed
    SetupState.completedSteps.operatingHours = true;
    SetupState.currentStep = 3;
    updateProgressTracker();
    updateSectionStatus('operatingHours', true);

    showNotification('Operating hours saved successfully!', 'success');
    closeModal('operatingHoursModal');
}

function updateScheduleDisplay() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    days.forEach(day => {
        const schedule = SetupState.formData.operatingHours[day];
        const dayScheduleElement = document.querySelector(`.day-schedule:has(.edit-day-btn[data-day="${day}"])`);

        if (dayScheduleElement) {
            const hoursDisplay = dayScheduleElement.querySelector('.hours-display');
            const breakTime = dayScheduleElement.querySelector('.break-time');

            if (schedule.isOpen) {
                dayScheduleElement.classList.remove('closed');
                hoursDisplay.textContent = `${formatTime(schedule.open)} - ${formatTime(schedule.close)}`;
                hoursDisplay.classList.remove('closed-text');

                if (schedule.breakStart && schedule.breakEnd) {
                    breakTime.textContent = `Lunch: ${formatTime(schedule.breakStart)} - ${formatTime(schedule.breakEnd)}`;
                } else {
                    breakTime.textContent = 'No Breaks';
                }
            } else {
                dayScheduleElement.classList.add('closed');
                hoursDisplay.textContent = 'CLOSED';
                hoursDisplay.classList.add('closed-text');
                breakTime.textContent = '';
            }
        }
    });
}

function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function openHolidayCalendar() {
    showNotification('Holiday calendar feature coming soon!', 'info');
}

function saveSchedulePreset() {
    const presetName = prompt('Enter a name for this schedule preset:');
    if (presetName) {
        // Save preset to local storage
        const presets = JSON.parse(localStorage.getItem('schedulePresets') || '{}');
        presets[presetName] = SetupState.formData.operatingHours;
        localStorage.setItem('schedulePresets', JSON.stringify(presets));

        showNotification(`Schedule preset "${presetName}" saved!`, 'success');
    }
}

// ====================================
// SERVICES & SPECIALTIES FUNCTIONS
// ====================================
function toggleLabServices(e) {
    const labConfig = document.getElementById('labConfig');
    if (e.target.checked) {
        labConfig.classList.remove('hidden');
        SetupState.formData.labServicesEnabled = true;
    } else {
        labConfig.classList.add('hidden');
        SetupState.formData.labServicesEnabled = false;
        SetupState.formData.labCategories = [];
    }
}

function removeSpecialty(e) {
    const specialtyTag = e.target.closest('.specialty-tag');
    const specialtyName = specialtyTag.querySelector('span').textContent;

    // Remove from state
    SetupState.formData.specialties = SetupState.formData.specialties.filter(s => s !== specialtyName);

    // Remove from UI
    specialtyTag.remove();

    showNotification(`${specialtyName} removed`, 'info');
}

function filterSpecialties(e) {
    const searchTerm = e.target.value.toLowerCase();
    const specialtyOptions = document.querySelectorAll('.specialty-option');

    specialtyOptions.forEach(option => {
        const text = option.querySelector('span').textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

function addCustomSpecialty() {
    const input = document.getElementById('customSpecialtyName');
    const specialtyName = input.value.trim();

    if (!specialtyName) {
        showNotification('Please enter a specialty name', 'error');
        return;
    }

    // Add to temporary selection
    const customOption = document.createElement('label');
    customOption.className = 'specialty-option';
    customOption.innerHTML = `
        <input type="checkbox" value="${specialtyName.toLowerCase().replace(/\s+/g, '-')}" checked>
        <span>${specialtyName}</span>
    `;

    document.querySelector('.custom-specialty').insertAdjacentElement('afterend', customOption);

    input.value = '';
    showNotification(`Custom specialty "${specialtyName}" added`, 'success');
}

function saveSelectedSpecialties() {
    const checkedSpecialties = document.querySelectorAll('#specialtyModal input[type="checkbox"]:checked');
    const selectedSpecialties = Array.from(checkedSpecialties).map(cb =>
        cb.parentElement.querySelector('span').textContent
    );

    if (selectedSpecialties.length === 0) {
        showNotification('Please select at least one specialty', 'error');
        return;
    }

    // Update state
    SetupState.formData.specialties = selectedSpecialties;

    // Update UI
    updateSpecialtiesDisplay();

    showNotification('Specialties updated successfully!', 'success');
    closeModal('specialtyModal');
}

function updateSpecialtiesDisplay() {
    const container = document.querySelector('.selected-specialties');
    container.innerHTML = '';

    SetupState.formData.specialties.forEach(specialty => {
        const tag = document.createElement('div');
        tag.className = 'specialty-tag';
        tag.innerHTML = `
            <span>${specialty}</span>
            <button class="remove-specialty">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(tag);
    });

    // Re-attach event listeners
    document.querySelectorAll('.remove-specialty').forEach(btn => {
        btn.addEventListener('click', removeSpecialty);
    });
}

function editService(e) {
    const serviceItem = e.target.closest('.service-item');
    const serviceName = serviceItem.querySelector('h5').textContent;

    // Find service data
    const service = SetupState.formData.services.find(s => s.name === serviceName);
    if (!service) return;

    // Populate form
    document.getElementById('serviceName').value = service.name;
    document.getElementById('serviceDuration').value = service.duration;
    document.getElementById('serviceFee').value = service.fee;
    document.getElementById('staffRoles').value = service.staffRole;
    document.getElementById('serviceDescription').value = service.description || '';

    // Open modal
    openModal('serviceModal');
}

function saveService(e) {
    e.preventDefault();

    const serviceData = {
        id: Date.now(), // Simple ID generation
        name: document.getElementById('serviceName').value,
        duration: parseInt(document.getElementById('serviceDuration').value),
        fee: parseInt(document.getElementById('serviceFee').value),
        staffRole: document.getElementById('staffRoles').value,
        description: document.getElementById('serviceDescription').value
    };

    // Check if updating existing service
    const existingIndex = SetupState.formData.services.findIndex(s => s.name === serviceData.name);
    if (existingIndex >= 0) {
        SetupState.formData.services[existingIndex] = serviceData;
    } else {
        SetupState.formData.services.push(serviceData);
    }

    // Update display
    updateServicesDisplay();

    // Mark as in progress
    if (SetupState.formData.services.length > 0 && SetupState.formData.specialties.length > 0) {
        SetupState.completedSteps.services = true;
        SetupState.currentStep = 4;
        updateProgressTracker();
        updateSectionStatus('services', true);
    }

    showNotification('Service saved successfully!', 'success');
    closeModal('serviceModal');

    // Reset form
    e.target.reset();
}

function updateServicesDisplay() {
    const container = document.querySelector('.services-list');
    container.innerHTML = '';

    SetupState.formData.services.forEach(service => {
        const item = document.createElement('div');
        item.className = 'service-item';
        item.innerHTML = `
            <div class="service-info">
                <h5>${service.name}</h5>
                <div class="service-details">
                    <span class="duration">${service.duration} minutes</span>
                    <span class="fee">KES. ${service.fee.toLocaleString()}</span>
                    <span class="staff-role">${service.staffRole.charAt(0).toUpperCase() + service.staffRole.slice(1)}</span>
                </div>
            </div>
            <button class="edit-service-btn">
                <i class="fas fa-edit"></i>
            </button>
        `;
        container.appendChild(item);
    });

    // Re-attach event listeners
    document.querySelectorAll('.edit-service-btn').forEach(btn => {
        btn.addEventListener('click', editService);
    });
}

function showSmartSuggestions() {
    const suggestions = {
        'Primary Care': [
            { name: 'Annual Physical Exam', duration: 45, fee: 3500, staffRole: 'doctor' },
            { name: 'Sick Visit', duration: 20, fee: 2000, staffRole: 'doctor' },
            { name: 'Vaccination', duration: 15, fee: 1500, staffRole: 'nurse' }
        ],
        'Family Medicine': [
            { name: 'Family Consultation', duration: 30, fee: 3000, staffRole: 'doctor' },
            { name: 'Chronic Disease Management', duration: 45, fee: 4000, staffRole: 'doctor' },
            { name: 'Preventive Care', duration: 30, fee: 2500, staffRole: 'nurse' }
        ],
        'Pediatrics': [
            { name: 'Well-Child Visit', duration: 30, fee: 2800, staffRole: 'doctor' },
            { name: 'Newborn Checkup', duration: 45, fee: 3500, staffRole: 'doctor' },
            { name: 'Growth Monitoring', duration: 20, fee: 1800, staffRole: 'nurse' }
        ]
    };

    let suggestedServices = [];
    SetupState.formData.specialties.forEach(specialty => {
        if (suggestions[specialty]) {
            suggestedServices = suggestedServices.concat(suggestions[specialty]);
        }
    });

    if (suggestedServices.length === 0) {
        showNotification('Please select specialties first to get smart suggestions', 'info');
        return;
    }

    // Show suggestions modal
    const confirmAdd = confirm(`We found ${suggestedServices.length} suggested services based on your specialties. Would you like to add them?`);

    if (confirmAdd) {
        suggestedServices.forEach(service => {
            service.id = Date.now() + Math.random();
            SetupState.formData.services.push(service);
        });

        updateServicesDisplay();
        showNotification(`${suggestedServices.length} services added!`, 'success');
    }
}

// ====================================
// PAYMENT FUNCTIONS
// ====================================
function updatePaymentPreview() {
    const selectedFrequency = document.querySelector('input[name="paymentFrequency"]:checked');
    if (selectedFrequency) {
        SetupState.formData.paymentFrequency = selectedFrequency.value;
        calculateEstimation();
    }
}

function calculateEstimation() {
    const weeklyPatients = parseInt(document.getElementById('weeklyPatients').value) || 50;
    const averageFee = parseInt(document.getElementById('averageFee').value) || 2500;

    const weeklyRevenue = weeklyPatients * averageFee;
    const serviceChargePercent = 0.05; // 5%
    const serviceCharge = weeklyRevenue * serviceChargePercent;
    const netPayment = weeklyRevenue - serviceCharge;

    // Update display
    document.getElementById('weeklyRevenue').textContent = `KES. ${weeklyRevenue.toLocaleString()}`;
    document.getElementById('serviceCharge').textContent = `KES. ${serviceCharge.toLocaleString()}`;
    document.getElementById('netPayment').textContent = `KES. ${netPayment.toLocaleString()}`;

    // Calculate based on selected frequency
    const frequency = SetupState.formData.paymentFrequency;
    if (frequency === 'biweekly') {
        document.getElementById('netPayment').textContent = `KES. ${(netPayment * 2).toLocaleString()} (Bi-weekly)`;
    } else if (frequency === 'monthly') {
        document.getElementById('netPayment').textContent = `KES. ${(netPayment * 4).toLocaleString()} (Monthly)`;
    }
}

function togglePaymentConfirmButton() {
    const isChecked = DOMElements.termsAgreement.checked;
    const hasFrequency = SetupState.formData.paymentFrequency !== '';

    if (isChecked && hasFrequency) {
        DOMElements.confirmPaymentTermsBtn.removeAttribute('disabled');
    } else {
        DOMElements.confirmPaymentTermsBtn.setAttribute('disabled', 'disabled');
    }
}

function confirmPaymentTerms() {
    if (!DOMElements.termsAgreement.checked) {
        showNotification('Please accept the terms and conditions', 'error');
        return;
    }

    if (!SetupState.formData.paymentFrequency) {
        showNotification('Please select a payment frequency', 'error');
        return;
    }

    SetupState.formData.termsAccepted = true;
    SetupState.completedSteps.paymentTerms = true;
    SetupState.currentStep = 5;
    updateProgressTracker();
    updateSectionStatus('paymentTerms', true);

    showNotification('Payment terms confirmed!', 'success');

    // Show dynamic alert based on selection
    if (SetupState.formData.paymentFrequency === 'monthly') {
        setTimeout(() => {
            showNotification('Note: Monthly payments may affect your cash flow. Consider our weekly option for better financial management.', 'warning');
        }, 1000);
    }
}

function previewPaymentSchedule() {
    const frequency = SetupState.formData.paymentFrequency;
    if (!frequency) {
        showNotification('Please select a payment frequency first', 'error');
        return;
    }

    let scheduleMessage = '';
    const today = new Date();

    switch (frequency) {
        case 'weekly':
            const nextFriday = getNextFriday(today);
            scheduleMessage = `Your first payment will be processed on ${formatDate(nextFriday)}. Subsequent payments will be every Friday.`;
            break;
        case 'biweekly':
            const nextBiweekly = getNextFriday(today);
            scheduleMessage = `Your first payment will be processed on ${formatDate(nextBiweekly)}. Subsequent payments will be every two weeks on Friday.`;
            break;
        case 'monthly':
            const lastFriday = getLastFridayOfMonth(today);
            scheduleMessage = `Your first payment will be processed on ${formatDate(lastFriday)}. Subsequent payments will be on the last Friday of each month.`;
            break;
    }

    alert(scheduleMessage);
}

// ====================================
// FINAL SETUP FUNCTIONS
// ====================================
function editClinicProfile() {
    // Open profile preview in edit mode
    showNotification('Opening profile editor...', 'info');
    openModal('clinicIdentityModal');
}

function publishClinicProfile() {
    if (!allSectionsCompleted()) {
        showNotification('Please complete all setup sections before publishing', 'error');
        return;
    }

    showLoadingIndicator('Publishing profile...');

    setTimeout(() => {
        hideLoadingIndicator();
        showNotification('Clinic profile published successfully! Patients can now find you.', 'success');

        // Update button state
        DOMElements.publishProfileBtn.innerHTML = '<i class="fas fa-check"></i> Profile Published';
        DOMElements.publishProfileBtn.disabled = true;
        DOMElements.publishProfileBtn.style.background = 'var(--success-green)';
    }, 2000);
}

function sendStaffInvitation() {
    const staffData = {
        role: document.getElementById('staffRole').value,
        name: document.getElementById('staffName').value,
        email: document.getElementById('staffEmail').value,
        phone: document.getElementById('staffPhone').value
    };

    // Validate
    if (!staffData.role || !staffData.name || !staffData.email) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Check invitation methods
    const inviteMethods = [];
    document.querySelectorAll('.invitation-methods input:checked').forEach(checkbox => {
        inviteMethods.push(checkbox.value);
    });

    if (inviteMethods.length === 0) {
        showNotification('Please select at least one invitation method', 'error');
        return;
    }

    SetupState.formData.firstStaff = staffData;

    showLoadingIndicator('Sending invitation...');

    setTimeout(() => {
        hideLoadingIndicator();
        let methodText = inviteMethods.join(' and ');
        showNotification(`Invitation sent to ${staffData.name} via ${methodText}!`, 'success');

        // Clear form
        document.getElementById('staffRole').value = '';
        document.getElementById('staffName').value = '';
        document.getElementById('staffEmail').value = '';
        document.getElementById('staffPhone').value = '';

        // Update checklist
        updateChecklistItem('staff', true);
    }, 1500);
}

function skipStaffCreation() {
    showNotification('You can add staff members later from the Workforce Hub', 'info');
    updateChecklistItem('staff', true);
}

function completeSetup() {
    if (!allSectionsCompleted()) {
        showNotification('Please complete all setup sections', 'error');
        return;
    }

    showLoadingIndicator('Finalizing setup...');

    setTimeout(() => {
        hideLoadingIndicator();
        SetupState.completedSteps.finalSetup = true;
        updateProgressTracker();

        showNotification('Congratulations! Your clinic setup is complete. Redirecting to dashboard...', 'success');

        setTimeout(() => {
            // In production, this would navigate to the dashboard
            window.location.href = '/dashboard';
        }, 2000);
    }, 2000);
}

function saveAndExit() {
    saveProgressToLocalStorage();
    showNotification('Progress saved. You can resume setup anytime.', 'success');

    setTimeout(() => {
        // Navigate to dashboard
        window.location.href = '/dashboard';
    }, 1000);
}

function updateChecklistItem(item, completed) {
    const checklistMap = {
        'staff': 4 // Index of staff checklist item
    };

    const index = checklistMap[item];
    if (index !== undefined) {
        const checklistItem = document.querySelectorAll('.checklist-item')[index];
        if (checklistItem && completed) {
            checklistItem.classList.remove('pending');
            checklistItem.classList.add('completed');
            checklistItem.querySelector('.item-checkbox i').className = 'fas fa-check';
            checklistItem.querySelector('.status-badge').className = 'status-badge completed';
            checklistItem.querySelector('.status-badge').textContent = 'Complete';
        }
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

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getIconForType(type)}"></i>
        <span>${message}</span>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getIconForType(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function showLoadingIndicator(message = 'Loading...') {
    const indicator = DOMElements.autoRefreshIndicator;
    if (indicator) {
        indicator.querySelector('span').textContent = message;
        indicator.classList.add('show');
    }
}

function hideLoadingIndicator() {
    DOMElements.autoRefreshIndicator?.classList.remove('show');
}

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getNextFriday(date) {
    const result = new Date(date);
    result.setDate(result.getDate() + (5 - result.getDay() + 7) % 7 || 7);
    return result;
}

function getLastFridayOfMonth(date) {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const lastFriday = new Date(lastDay);
    lastFriday.setDate(lastDay.getDate() - (lastDay.getDay() + 2) % 7);
    return lastFriday;
}

function allSectionsCompleted() {
    return Object.values(SetupState.completedSteps).every(step => step);
}

// ====================================
// LOCAL STORAGE MANAGEMENT
// ====================================
function saveProgressToLocalStorage() {
    localStorage.setItem('curisSetupState', JSON.stringify(SetupState));
}

function loadSavedProgress() {
    const savedState = localStorage.getItem('curisSetupState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        Object.assign(SetupState, parsed);

        // Update UI based on saved state
        updateProgressTracker();
        checkSetupStatus();

        if (SetupState.formData.clinicIdentity.name !== 'Nairobi Family Health Clinic') {
            updateClinicIdentityDisplay();
        }

        if (SetupState.completedSteps.operatingHours) {
            updateScheduleDisplay();
        }

        if (SetupState.completedSteps.services) {
            updateSpecialtiesDisplay();
            updateServicesDisplay();
        }

        // Show resume notification
        if (Object.values(SetupState.completedSteps).some(step => step)) {
            showNotification('Welcome back! Your progress has been restored.', 'info');
        }
    }
}

// ====================================
// CSS FOR NOTIFICATIONS (Add to CSS file)
// ====================================
const notificationStyles = `
<style>
.notification-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--white);
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    transform: translateX(400px);
    transition: transform var(--transition-normal);
    z-index: 2000;
    max-width: 400px;
}

.notification-toast.show {
    transform: translateX(0);
}

.notification-toast.success {
    border-left: 4px solid var(--success-green);
    color: var(--success-green);
}

.notification-toast.error {
    border-left: 4px solid var(--error-red);
    color: var(--error-red);
}

.notification-toast.warning {
    border-left: 4px solid var(--warning-yellow);
    color: var(--warning-yellow);
}

.notification-toast.info {
    border-left: 4px solid var(--accent-teal);
    color: var(--accent-teal);
}

.notification-toast span {
    color: var(--charcoal-gray);
}

.error {
    border-color: var(--error-red) !important;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', notificationStyles);

// ====================================
// AUTO-SAVE FUNCTIONALITY
// ====================================
setInterval(() => {
    if (Object.values(SetupState.completedSteps).some(step => step)) {
        saveProgressToLocalStorage();
        console.log('Progress auto-saved');
    }
}, 30000); // Auto-save every 30 seconds
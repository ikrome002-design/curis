/* ====================================
   CURIS MY PROFILE PAGE - COMPREHENSIVE JAVASCRIPT
   Modern Healthcare Dashboard Functionality
   Clinic Owner's Personal & Clinic Management
   ==================================== */

// ====================================
// GLOBAL VARIABLES AND DATA STORAGE
// ====================================

// Personal Information Data
let personalData = {
    fullName: 'Dr. Sarah Wanjiku Kiprotich',
    professionalTitle: 'General Practitioner',
    medicalLicense: 'KE-MP-12345',
    email: 'sarah.wanjiku@nairobimed.co.ke',
    phone: '+254 701 234 567',
    address: '123 Uhuru Highway, Nairobi, Kenya 00100',
    yearsOfExperience: 8,
    profilePhoto: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-100-2.png',
    lastPasswordUpdate: '2025-03-15',
    twoFactorEnabled: false,
    emailVerified: true
};

// Clinic Information Data
let clinicData = {
    name: 'Nairobi Medical Center',
    registrationNumber: 'CL-NRB-2023-001',
    contactEmail: 'info@nairobimed.co.ke',
    contactPhone: '+254 20 123 4567',
    address: '456 Kenyatta Avenue, Nairobi, Kenya 00100',
    specialization: 'General Practice, Family Medicine',
    website: '',
    logo: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Logo\\logo_1.png',
    brandColors: {
        primary: '#1D2A3B',
        secondary: '#00BFA5',
        accent: '#FF6B35'
    }
};

// Business Hours Data
let businessHours = {
    monday: { isOpen: true, openTime: '08:00', closeTime: '18:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
    tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
    wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
    thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
    friday: { isOpen: true, openTime: '08:00', closeTime: '18:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '15:00', hasBreak: false, breakStart: '12:00', breakEnd: '13:00' },
    sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00', hasBreak: false, breakStart: '', breakEnd: '' }
};

// Services Data
let servicesData = [
    {
        id: 'consultation',
        name: 'General Consultation',
        description: 'Initial consultation and examination',
        duration: 30,
        price: 2500
    },
    {
        id: 'followup',
        name: 'Follow-up Visit',
        description: 'Follow-up consultation for existing patients',
        duration: 20,
        price: 1800
    },
    {
        id: 'vaccination',
        name: 'Vaccination',
        description: 'Immunization services for all ages',
        duration: 15,
        price: 1200
    },
    {
        id: 'screening',
        name: 'Health Screening',
        description: 'Comprehensive health check-up package',
        duration: 45,
        price: 4500
    }
];

// Activity Log
let activityLog = [];

// ====================================
// UTILITY FUNCTIONS
// ====================================

// Show notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-green)' : type === 'warning' ? 'var(--warning-yellow)' : 'var(--error-red)'};
        color: ${type === 'warning' ? 'var(--primary-navy)' : 'white'};
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1200;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        word-wrap: break-word;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Show auto-refresh indicator
function showAutoRefresh(message = 'Updating profile...') {
    const indicator = document.getElementById('autoRefreshIndicator');
    if (indicator) {
        indicator.querySelector('span').textContent = message;
        indicator.classList.add('show');

        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }
}

// Add activity log entry
function addActivityLog(action, details) {
    const newEntry = {
        timestamp: new Date().toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ''),
        user: personalData.fullName,
        action: action,
        details: details
    };

    activityLog.unshift(newEntry);

    // Keep only last 50 entries
    if (activityLog.length > 50) {
        activityLog = activityLog.slice(0, 50);
    }
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone format
function validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let strength = 0;
    let feedback = '';

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) {
        feedback = 'Weak - Add more characters and symbols';
        return { level: 'weak', percentage: 33, feedback };
    } else if (strength <= 4) {
        feedback = 'Medium - Add special characters for stronger security';
        return { level: 'medium', percentage: 66, feedback };
    } else {
        feedback = 'Strong - Excellent password security';
        return { level: 'strong', percentage: 100, feedback };
    }
}

// Format time display
function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
}

// ====================================
// MODAL MANAGEMENT
// ====================================

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Close modal when clicking outside
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        closeModal(modalId);
    }
});

// ====================================
// NAVIGATION FUNCTIONS
// ====================================

// Toggle notifications panel
function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.classList.toggle('show');
    }
}

// Toggle user dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');

    // Store preference
    localStorage.setItem('darkMode', isDarkMode);

    // Update icon
    const icon = document.querySelector('.dark-mode-toggle i');
    if (icon) {
        icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }

    addActivityLog('Toggled dark mode', `${isDarkMode ? 'Enabled' : 'Disabled'} dark theme`);
    showNotification(`Dark mode ${isDarkMode ? 'enabled' : 'disabled'}`);
}

// Close dropdowns when clicking outside
document.addEventListener('click', function (e) {
    const notificationBtn = document.querySelector('.notification-btn');
    const userProfileBtn = document.querySelector('.user-profile-btn');
    const notificationPanel = document.getElementById('notificationsPanel');
    const userDropdown = document.getElementById('userDropdown');

    if (!notificationBtn?.contains(e.target) && notificationPanel) {
        notificationPanel.classList.remove('show');
    }

    if (!userProfileBtn?.contains(e.target) && userDropdown) {
        userDropdown.classList.remove('show');
    }
});

// ====================================
// PERSONAL INFORMATION MANAGEMENT
// ====================================

// Edit personal information
function editPersonalInfo() {
    populatePersonalInfoModal();
    openModal('personalInfoModal');
}

// Populate personal info modal with current data
function populatePersonalInfoModal() {
    const modal = document.getElementById('personalInfoModal');
    const form = modal.querySelector('#personalInfoForm');

    if (form) {
        const inputs = form.querySelectorAll('input, textarea');
        const values = [
            personalData.fullName,
            personalData.professionalTitle,
            personalData.medicalLicense,
            personalData.phone,
            personalData.address,
            personalData.yearsOfExperience
        ];

        inputs.forEach((input, index) => {
            if (values[index] !== undefined) {
                input.value = values[index];
            }
        });
    }
}

// Save personal information
function savePersonalInfo() {
    const modal = document.getElementById('personalInfoModal');
    const form = modal.querySelector('#personalInfoForm');

    if (form) {
        const inputs = form.querySelectorAll('input, textarea');
        const newData = {
            fullName: inputs[0].value.trim(),
            professionalTitle: inputs[1].value.trim(),
            medicalLicense: inputs[2].value.trim(),
            phone: inputs[3].value.trim(),
            address: inputs[4].value.trim(),
            yearsOfExperience: parseInt(inputs[5].value) || 0
        };

        // Validation
        if (!newData.fullName || !newData.professionalTitle || !newData.medicalLicense) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!validatePhone(newData.phone)) {
            showNotification('Please enter a valid phone number', 'error');
            return;
        }

        // Update data
        Object.assign(personalData, newData);

        // Update display
        updatePersonalInfoDisplay();

        // Log activity
        addActivityLog('Updated personal information', 'Modified profile details');

        closeModal('personalInfoModal');
        showNotification('Personal information updated successfully');
        showAutoRefresh('Updating profile...');
    }
}

// Update personal information display
function updatePersonalInfoDisplay() {
    const infoItems = document.querySelectorAll('.personal-info-display .info-item');

    if (infoItems.length >= 6) {
        infoItems[0].querySelector('.info-value').textContent = personalData.fullName;
        infoItems[1].querySelector('.info-value').textContent = personalData.email;
        infoItems[2].querySelector('.info-value').textContent = personalData.phone;
        infoItems[3].querySelector('.info-value').textContent = personalData.professionalTitle;
        infoItems[4].querySelector('.info-value').textContent = personalData.medicalLicense;
        infoItems[5].querySelector('.info-value').textContent = personalData.address;
    }

    // Update profile name in header
    const profileName = document.querySelector('.profile-name');
    if (profileName) {
        profileName.textContent = personalData.fullName;
    }
}

// ====================================
// PROFILE PHOTO MANAGEMENT
// ====================================

// Open photo modal
function openPhotoModal() {
    const modal = document.getElementById('photoModal');
    const currentPreview = modal.querySelector('#currentPhotoPreview');

    if (currentPreview) {
        currentPreview.src = personalData.profilePhoto;
    }

    // Reset photo preview
    const photoPreview = modal.querySelector('#photoPreview');
    if (photoPreview) {
        photoPreview.style.display = 'none';
        photoPreview.src = '';
    }

    openModal('photoModal');
}

// Preview photo before saving
function previewPhoto(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('photoPreview');

    if (file && preview) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size must be less than 5MB', 'error');
            event.target.value = '';
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select a valid image file', 'error');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Save profile photo
function saveProfilePhoto() {
    const modal = document.getElementById('photoModal');
    const fileInput = modal.querySelector('input[type="file"]');
    const preview = modal.querySelector('#photoPreview');

    if (fileInput.files[0] && preview.src) {
        // In a real application, you would upload to a server
        // For now, we'll use the preview URL
        personalData.profilePhoto = preview.src;

        // Update all profile images on the page
        updateProfilePhotoDisplay();

        // Log activity
        addActivityLog('Updated profile photo', 'Changed profile picture');

        closeModal('photoModal');
        showNotification('Profile photo updated successfully');
        showAutoRefresh('Uploading photo...');
    } else {
        showNotification('Please select a photo first', 'warning');
    }
}

// Update profile photo display
function updateProfilePhotoDisplay() {
    const profilePhotos = document.querySelectorAll('.profile-photo, .profile-image');
    profilePhotos.forEach(photo => {
        photo.src = personalData.profilePhoto;
    });
}

// ====================================
// LOGIN CREDENTIALS MANAGEMENT
// ====================================

// Open credentials modal
function openCredentialsModal() {
    populateCredentialsModal();
    openModal('credentialsModal');
}

// Populate credentials modal
function populateCredentialsModal() {
    const modal = document.getElementById('credentialsModal');
    const currentEmailInput = modal.querySelector('input[readonly]');

    if (currentEmailInput) {
        currentEmailInput.value = personalData.email;
    }

    // Clear other inputs
    const inputs = modal.querySelectorAll('input:not([readonly])');
    inputs.forEach(input => input.value = '');

    // Reset password strength indicator
    updatePasswordStrengthIndicator('', modal);
}

// Request email change
function requestEmailChange() {
    const modal = document.getElementById('credentialsModal');
    const newEmailInput = modal.querySelector('input[placeholder="Enter new email address"]');

    if (!newEmailInput || !newEmailInput.value.trim()) {
        showNotification('Please enter a new email address', 'warning');
        return;
    }

    const newEmail = newEmailInput.value.trim();

    if (!validateEmail(newEmail)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    if (newEmail === personalData.email) {
        showNotification('New email must be different from current email', 'warning');
        return;
    }

    // Simulate email verification process
    showAutoRefresh('Sending verification email...');

    setTimeout(() => {
        showNotification(`Verification email sent to ${newEmail}. Please check your inbox and follow the instructions.`, 'success');
        addActivityLog('Requested email change', `Verification sent to ${newEmail}`);
        newEmailInput.value = '';
    }, 2000);
}

// Change email (simulation of verified change)
function changeEmail() {
    const modal = document.getElementById('credentialsModal');
    const newEmailInput = modal.querySelector('input[placeholder="Enter new email address"]');

    if (newEmailInput && newEmailInput.value.trim()) {
        const newEmail = newEmailInput.value.trim();
        personalData.email = newEmail;
        updatePersonalInfoDisplay();
        showNotification('Email address updated successfully');
        addActivityLog('Changed email address', `Updated to ${newEmail}`);
    }
}

// Change password
function changePassword() {
    const modal = document.getElementById('credentialsModal');
    const currentPasswordInput = modal.querySelector('input[placeholder="Enter current password"]');
    const newPasswordInput = modal.querySelector('input[placeholder="Enter new password"]');
    const confirmPasswordInput = modal.querySelector('input[placeholder="Confirm new password"]');

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validation
    if (!currentPassword) {
        showNotification('Please enter your current password', 'warning');
        return;
    }

    if (!newPassword) {
        showNotification('Please enter a new password', 'warning');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    const strength = calculatePasswordStrength(newPassword);
    if (strength.level === 'weak') {
        showNotification('Password is too weak. Please choose a stronger password.', 'warning');
        return;
    }

    // Simulate password change
    personalData.lastPasswordUpdate = new Date().toLocaleDateString('en-GB');

    // Update security display
    updateSecurityDisplay();

    // Clear inputs
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';

    // Reset strength indicator
    updatePasswordStrengthIndicator('', modal);

    addActivityLog('Changed password', 'Updated account password');
    showNotification('Password updated successfully');
    showAutoRefresh('Updating security settings...');
}

// Update password strength indicator
function updatePasswordStrengthIndicator(password, modal = null) {
    if (!modal) modal = document.getElementById('credentialsModal');

    const strengthFill = modal.querySelector('.strength-fill');
    const strengthText = modal.querySelector('.strength-text');

    if (strengthFill && strengthText) {
        if (!password) {
            strengthFill.style.width = '0%';
            strengthFill.style.background = 'var(--light-gray)';
            strengthText.textContent = 'Password strength will appear here';
            return;
        }

        const strength = calculatePasswordStrength(password);
        const colors = {
            weak: 'var(--error-red)',
            medium: 'var(--warning-yellow)',
            strong: 'var(--success-green)'
        };

        strengthFill.style.width = `${strength.percentage}%`;
        strengthFill.style.background = colors[strength.level];
        strengthText.textContent = strength.feedback;
    }
}

// Setup two-factor authentication
function setupTwoFactor() {
    // This would typically open a modal for 2FA setup
    showNotification('Two-factor authentication setup is currently in development', 'warning');
    addActivityLog('Attempted 2FA setup', 'Feature under development');
}

// Update security display
function updateSecurityDisplay() {
    const securityItems = document.querySelectorAll('.security-overview .security-item');

    if (securityItems.length >= 3) {
        // Update password item
        const passwordItem = securityItems[1];
        const passwordDescription = passwordItem.querySelector('.security-description');
        if (passwordDescription) {
            passwordDescription.textContent = `Last updated: ${personalData.lastPasswordUpdate}`;
        }
    }
}

// ====================================
// CLINIC INFORMATION MANAGEMENT
// ====================================

// Edit clinic information
function editClinicInfo() {
    populateClinicInfoModal();
    openModal('clinicInfoModal');
}

// Populate clinic info modal
function populateClinicInfoModal() {
    const modal = document.getElementById('clinicInfoModal');
    const form = modal.querySelector('#clinicInfoForm');

    if (form) {
        const inputs = form.querySelectorAll('input, textarea');
        const values = [
            clinicData.name,
            clinicData.registrationNumber,
            clinicData.contactEmail,
            clinicData.contactPhone,
            clinicData.address,
            clinicData.specialization,
            clinicData.website
        ];

        inputs.forEach((input, index) => {
            if (values[index] !== undefined) {
                input.value = values[index];
            }
        });
    }
}

// Save clinic information
function saveClinicInfo() {
    const modal = document.getElementById('clinicInfoModal');
    const form = modal.querySelector('#clinicInfoForm');

    if (form) {
        const inputs = form.querySelectorAll('input, textarea');
        const newData = {
            name: inputs[0].value.trim(),
            registrationNumber: inputs[1].value.trim(),
            contactEmail: inputs[2].value.trim(),
            contactPhone: inputs[3].value.trim(),
            address: inputs[4].value.trim(),
            specialization: inputs[5].value.trim(),
            website: inputs[6].value.trim()
        };

        // Validation
        if (!newData.name || !newData.registrationNumber || !newData.contactEmail) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!validateEmail(newData.contactEmail)) {
            showNotification('Please enter a valid contact email', 'error');
            return;
        }

        if (!validatePhone(newData.contactPhone)) {
            showNotification('Please enter a valid contact phone', 'error');
            return;
        }

        // Update data
        Object.assign(clinicData, newData);

        // Update display
        updateClinicInfoDisplay();

        // Log activity
        addActivityLog('Updated clinic information', 'Modified clinic details');

        closeModal('clinicInfoModal');
        showNotification('Clinic information updated successfully');
        showAutoRefresh('Updating clinic profile...');
    }
}

// Update clinic information display
function updateClinicInfoDisplay() {
    const clinicItems = document.querySelectorAll('.clinic-info-display .clinic-item');

    if (clinicItems.length >= 6) {
        clinicItems[0].querySelector('.clinic-value').textContent = clinicData.name;
        clinicItems[1].querySelector('.clinic-value').textContent = clinicData.registrationNumber;
        clinicItems[2].querySelector('.clinic-value').textContent = clinicData.contactEmail;
        clinicItems[3].querySelector('.clinic-value').textContent = clinicData.contactPhone;
        clinicItems[4].querySelector('.clinic-value').textContent = clinicData.address;
        clinicItems[5].querySelector('.clinic-value').textContent = clinicData.specialization;
    }
}

// ====================================
// BUSINESS HOURS MANAGEMENT
// ====================================

// Open business hours modal
function openBusinessHoursModal() {
    populateBusinessHoursModal();
    openModal('businessHoursModal');
}

// Populate business hours modal
function populateBusinessHoursModal() {
    const modal = document.getElementById('businessHoursModal');
    const dayConfigs = modal.querySelectorAll('.day-config');

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    dayConfigs.forEach((dayConfig, index) => {
        const day = days[index];
        const dayData = businessHours[day];

        // Set open checkbox
        const openCheckbox = dayConfig.querySelector('.day-header input[type="checkbox"]');
        if (openCheckbox) {
            openCheckbox.checked = dayData.isOpen;
        }

        // Set times
        const timeInputs = dayConfig.querySelectorAll('input[type="time"]');
        if (timeInputs.length >= 2) {
            timeInputs[0].value = dayData.openTime;
            timeInputs[1].value = dayData.closeTime;
        }

        // Set break checkbox and times
        const breakCheckbox = dayConfig.querySelector('.break-group input[type="checkbox"]');
        if (breakCheckbox) {
            breakCheckbox.checked = dayData.hasBreak;
        }

        const breakTimeInputs = dayConfig.querySelectorAll('.break-times input[type="time"]');
        if (breakTimeInputs.length >= 2) {
            breakTimeInputs[0].value = dayData.breakStart;
            breakTimeInputs[1].value = dayData.breakEnd;
        }

        // Toggle day times visibility
        toggleDayTimes(dayConfig, dayData.isOpen);
    });
}

// Toggle day times visibility
function toggleDayTimes(dayConfig, isOpen) {
    const dayTimes = dayConfig.querySelector('.day-times');
    if (dayTimes) {
        if (isOpen) {
            dayTimes.classList.remove('closed');
            dayTimes.style.display = 'grid';
        } else {
            dayTimes.classList.add('closed');
            dayTimes.innerHTML = '<p>Clinic is closed on this day</p>';
        }
    }
}

// Save business hours
function saveBusinessHours() {
    const modal = document.getElementById('businessHoursModal');
    const dayConfigs = modal.querySelectorAll('.day-config');

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    dayConfigs.forEach((dayConfig, index) => {
        const day = days[index];

        // Get open status
        const openCheckbox = dayConfig.querySelector('.day-header input[type="checkbox"]');
        const isOpen = openCheckbox ? openCheckbox.checked : false;

        // Get times
        const timeInputs = dayConfig.querySelectorAll('input[type="time"]');
        const openTime = timeInputs[0] ? timeInputs[0].value : '09:00';
        const closeTime = timeInputs[1] ? timeInputs[1].value : '17:00';

        // Get break info
        const breakCheckbox = dayConfig.querySelector('.break-group input[type="checkbox"]');
        const hasBreak = breakCheckbox ? breakCheckbox.checked : false;

        const breakTimeInputs = dayConfig.querySelectorAll('.break-times input[type="time"]');
        const breakStart = breakTimeInputs[0] ? breakTimeInputs[0].value : '';
        const breakEnd = breakTimeInputs[1] ? breakTimeInputs[1].value : '';

        // Update data
        businessHours[day] = {
            isOpen,
            openTime,
            closeTime,
            hasBreak,
            breakStart,
            breakEnd
        };
    });

    // Update display
    updateBusinessHoursDisplay();

    // Log activity
    addActivityLog('Updated business hours', 'Modified clinic operating schedule');

    closeModal('businessHoursModal');
    showNotification('Business hours updated successfully');
    showAutoRefresh('Updating appointment availability...');
}

// Update business hours display
function updateBusinessHoursDisplay() {
    const hoursGrid = document.querySelector('.hours-grid');
    if (!hoursGrid) return;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    hoursGrid.innerHTML = '';

    days.forEach((day, index) => {
        const dayData = businessHours[day];
        const dayName = dayNames[index];

        const dayElement = document.createElement('div');
        dayElement.className = `day-schedule ${!dayData.isOpen ? 'closed' : ''}`;

        if (dayData.isOpen) {
            const breakText = dayData.hasBreak ?
                `Lunch: ${formatTime(dayData.breakStart)} - ${formatTime(dayData.breakEnd)}` :
                'No break';

            dayElement.innerHTML = `
                <div class="day-name">${dayName}</div>
                <div class="day-hours">${formatTime(dayData.openTime)} - ${formatTime(dayData.closeTime)}</div>
                <div class="day-break">${breakText}</div>
            `;
        } else {
            dayElement.innerHTML = `
                <div class="day-name">${dayName}</div>
                <div class="day-hours">Closed</div>
                <div class="day-break">-</div>
            `;
        }

        hoursGrid.appendChild(dayElement);
    });
}

// ====================================
// SERVICES MANAGEMENT
// ====================================

// Open services modal
function openServicesModal() {
    populateServicesModal();
    openModal('servicesModal');
}

// Populate services modal
function populateServicesModal() {
    const modal = document.getElementById('servicesModal');
    const servicesList = modal.querySelector('.services-list');

    if (servicesList) {
        servicesList.innerHTML = '';

        servicesData.forEach(service => {
            const serviceElement = document.createElement('div');
            serviceElement.className = 'service-edit-item';
            serviceElement.dataset.serviceId = service.id;

            serviceElement.innerHTML = `
                <div class="service-details">
                    <input type="text" class="form-control" value="${service.name}">
                    <textarea class="form-control" rows="1">${service.description}</textarea>
                </div>
                <div class="service-params">
                    <input type="number" class="form-control" value="${service.duration}" min="5">
                    <span>minutes</span>
                    <input type="number" class="form-control" value="${service.price}" min="0">
                    <span>KES.</span>
                </div>
                <div class="service-controls">
                    <button class="btn-primary" onclick="updateService(this)">Save</button>
                    <button class="btn-secondary" onclick="deleteService(this)">Delete</button>
                </div>
            `;

            servicesList.appendChild(serviceElement);
        });
    }
}

// Add new service
function addService() {
    const modal = document.getElementById('servicesModal');
    const addForm = modal.querySelector('.add-service-form');
    const inputs = addForm.querySelectorAll('input, textarea');

    const newService = {
        name: inputs[0].value.trim(),
        duration: parseInt(inputs[1].value) || 30,
        price: parseInt(inputs[2].value) || 0,
        description: inputs[3].value.trim()
    };

    // Validation
    if (!newService.name) {
        showNotification('Please enter a service name', 'warning');
        return;
    }

    if (newService.duration < 5) {
        showNotification('Service duration must be at least 5 minutes', 'warning');
        return;
    }

    if (newService.price < 0) {
        showNotification('Service price cannot be negative', 'warning');
        return;
    }

    // Generate unique ID
    newService.id = 'service_' + Date.now();

    // Add to services data
    servicesData.push(newService);

    // Clear form
    inputs.forEach(input => input.value = '');

    // Refresh modal
    populateServicesModal();

    showNotification('Service added successfully');
    addActivityLog('Added new service', `Created service: ${newService.name}`);
}

// Update service
function updateService(button) {
    const serviceItem = button.closest('.service-edit-item');
    const serviceId = serviceItem.dataset.serviceId;

    const inputs = serviceItem.querySelectorAll('input, textarea');
    const updatedData = {
        name: inputs[0].value.trim(),
        description: inputs[1].value.trim(),
        duration: parseInt(inputs[2].value) || 30,
        price: parseInt(inputs[3].value) || 0
    };

    // Validation
    if (!updatedData.name) {
        showNotification('Service name is required', 'warning');
        return;
    }

    // Find and update service
    const serviceIndex = servicesData.findIndex(s => s.id === serviceId);
    if (serviceIndex !== -1) {
        Object.assign(servicesData[serviceIndex], updatedData);
        showNotification('Service updated successfully');
        addActivityLog('Updated service', `Modified service: ${updatedData.name}`);
    }
}

// Delete service
function deleteService(button) {
    const serviceItem = button.closest('.service-edit-item');
    const serviceId = serviceItem.dataset.serviceId;

    if (confirm('Are you sure you want to delete this service?')) {
        const serviceIndex = servicesData.findIndex(s => s.id === serviceId);
        if (serviceIndex !== -1) {
            const serviceName = servicesData[serviceIndex].name;
            servicesData.splice(serviceIndex, 1);

            // Refresh modal
            populateServicesModal();

            showNotification('Service deleted successfully');
            addActivityLog('Deleted service', `Removed service: ${serviceName}`);
        }
    }
}

// Edit specific service
function editService(serviceId) {
    openServicesModal();
    // The modal will show all services for editing
}

// Add new service (from main page)
function addNewService() {
    openServicesModal();
    // Focus on the add service form
    setTimeout(() => {
        const modal = document.getElementById('servicesModal');
        const firstInput = modal.querySelector('.add-service-form input');
        if (firstInput) {
            firstInput.focus();
        }
    }, 300);
}

// Save all services
function saveAllServices() {
    // Update the main display
    updateServicesDisplay();

    closeModal('servicesModal');
    showNotification('All services saved successfully');
    addActivityLog('Updated service offerings', 'Saved all service changes');
    showAutoRefresh('Updating service listings...');
}

// Update services display
function updateServicesDisplay() {
    const servicesDisplay = document.querySelector('.services-display');
    if (!servicesDisplay) return;

    servicesDisplay.innerHTML = '';

    servicesData.forEach(service => {
        const serviceElement = document.createElement('div');
        serviceElement.className = 'service-item';

        serviceElement.innerHTML = `
            <div class="service-info">
                <div class="service-name">${service.name}</div>
                <div class="service-description">${service.description}</div>
            </div>
            <div class="service-details">
                <div class="service-duration">${service.duration} minutes</div>
                <div class="service-price">KES. ${service.price.toLocaleString()}</div>
            </div>
            <div class="service-actions">
                <button class="service-edit-btn" onclick="editService('${service.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;

        servicesDisplay.appendChild(serviceElement);
    });
}

// ====================================
// CLINIC BRANDING MANAGEMENT
// ====================================

// Open branding modal
function openBrandingModal() {
    const modal = document.getElementById('brandingModal');
    const currentLogo = modal.querySelector('#currentLogoPreview');

    if (currentLogo) {
        currentLogo.src = clinicData.logo;
    }

    // Set current brand colors
    const colorInputs = modal.querySelectorAll('input[type="color"]');
    if (colorInputs.length >= 3) {
        colorInputs[0].value = clinicData.brandColors.primary;
        colorInputs[1].value = clinicData.brandColors.secondary;
        colorInputs[2].value = clinicData.brandColors.accent;
    }

    // Reset logo preview
    const logoPreview = modal.querySelector('#logoPreview');
    if (logoPreview) {
        logoPreview.style.display = 'none';
        logoPreview.src = '';
    }

    openModal('brandingModal');
}

// Preview logo before saving
function previewLogo(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('logoPreview');

    if (file && preview) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size must be less than 5MB', 'error');
            event.target.value = '';
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select a valid image file', 'error');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Save branding
function saveBranding() {
    const modal = document.getElementById('brandingModal');
    const fileInput = modal.querySelector('input[type="file"]');
    const logoPreview = modal.querySelector('#logoPreview');
    const colorInputs = modal.querySelectorAll('input[type="color"]');

    // Update logo if new one is selected
    if (fileInput.files[0] && logoPreview.src) {
        clinicData.logo = logoPreview.src;

        // Update logo display
        const clinicLogos = document.querySelectorAll('.clinic-logo-img');
        clinicLogos.forEach(logo => {
            logo.src = clinicData.logo;
        });
    }

    // Update brand colors
    if (colorInputs.length >= 3) {
        clinicData.brandColors.primary = colorInputs[0].value;
        clinicData.brandColors.secondary = colorInputs[1].value;
        clinicData.brandColors.accent = colorInputs[2].value;
    }

    // Log activity
    addActivityLog('Updated clinic branding', 'Modified logo and brand colors');

    closeModal('brandingModal');
    showNotification('Clinic branding updated successfully');
    showAutoRefresh('Updating brand assets...');
}

// ====================================
// DASHBOARD INTEGRATION
// ====================================

// Navigate back to dashboard
function backToDashboard() {
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Clinic Owner\\Dashboard\\dashboard.html';
}

// Integration with other modules
function integrateWithModules() {
    // Personal info changes affect user display across all modules
    window.updateUserProfile = function () {
        showAutoRefresh('Syncing profile across system...');
        console.log('Integrating with all modules for profile updates');
    };

    // Clinic info changes affect service displays
    window.updateClinicProfile = function () {
        showAutoRefresh('Updating clinic information...');
        console.log('Integrating with Clinic Services Hub');
    };

    // Business hours affect appointment availability
    window.updateAppointmentAvailability = function () {
        showAutoRefresh('Updating appointment slots...');
        console.log('Integrating with Appointments module');
    };

    // Service changes affect billing and appointments
    window.updateServiceOfferings = function () {
        showAutoRefresh('Syncing services...');
        console.log('Integrating with Appointments and Billing modules');
    };
}

// ====================================
// FORM VALIDATION AND HELPERS
// ====================================

// Add real-time form validation
function addFormValidation() {
    // Email validation
    document.addEventListener('input', function (e) {
        if (e.target.type === 'email') {
            const isValid = validateEmail(e.target.value);
            e.target.style.borderColor = isValid ? 'var(--success-green)' : 'var(--error-red)';
        }
    });

    // Phone validation
    document.addEventListener('input', function (e) {
        if (e.target.type === 'tel') {
            const isValid = validatePhone(e.target.value);
            e.target.style.borderColor = isValid ? 'var(--success-green)' : 'var(--error-red)';
        }
    });

    // Password strength checking
    document.addEventListener('input', function (e) {
        if (e.target.placeholder && e.target.placeholder.includes('new password')) {
            updatePasswordStrengthIndicator(e.target.value);
        }
    });

    // Required field validation
    document.addEventListener('blur', function (e) {
        if (e.target.required && !e.target.value.trim()) {
            e.target.style.borderColor = 'var(--error-red)';
        }
    });
}

// ====================================
// KEYBOARD NAVIGATION AND ACCESSIBILITY
// ====================================

// Add keyboard navigation support
function addKeyboardNavigation() {
    document.addEventListener('keydown', function (e) {
        // Close modals with Escape key
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                closeModal(modal.id);
            });

            // Close dropdowns
            const dropdowns = document.querySelectorAll('.show');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }

        // Save forms with Ctrl+S
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                const saveButton = openModal.querySelector('.btn-primary');
                if (saveButton) {
                    saveButton.click();
                }
            }
        }
    });

    // Add ARIA labels for accessibility
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
        const icon = button.querySelector('i');
        if (icon && !button.textContent.trim()) {
            const iconClass = icon.className;
            if (iconClass.includes('edit')) button.setAttribute('aria-label', 'Edit');
            if (iconClass.includes('camera')) button.setAttribute('aria-label', 'Upload photo');
            if (iconClass.includes('image')) button.setAttribute('aria-label', 'Upload logo');
            if (iconClass.includes('plus')) button.setAttribute('aria-label', 'Add new');
            if (iconClass.includes('key')) button.setAttribute('aria-label', 'Change password');
            if (iconClass.includes('mobile')) button.setAttribute('aria-label', 'Enable 2FA');
        }
    });
}

// ====================================
// DATA PERSISTENCE SIMULATION
// ====================================

// Save data to local storage (simulation)
function saveToLocalStorage() {
    const profileData = {
        personal: personalData,
        clinic: clinicData,
        businessHours: businessHours,
        services: servicesData,
        activityLog: activityLog,
        lastUpdated: new Date().toISOString()
    };

    try {
        localStorage.setItem('curisProfile', JSON.stringify(profileData));
    } catch (error) {
        console.warn('Could not save to localStorage:', error);
    }
}

// Load data from local storage
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('curisProfile');
        if (savedData) {
            const profileData = JSON.parse(savedData);

            if (profileData.personal) Object.assign(personalData, profileData.personal);
            if (profileData.clinic) Object.assign(clinicData, profileData.clinic);
            if (profileData.businessHours) Object.assign(businessHours, profileData.businessHours);
            if (profileData.services) servicesData = profileData.services;
            if (profileData.activityLog) activityLog = profileData.activityLog;

            // Update displays
            updatePersonalInfoDisplay();
            updateClinicInfoDisplay();
            updateBusinessHoursDisplay();
            updateServicesDisplay();
            updateSecurityDisplay();

            console.log('Profile data loaded from localStorage');
        }
    } catch (error) {
        console.warn('Could not load from localStorage:', error);
    }
}

// Auto-save data periodically
function initializeAutoSave() {
    setInterval(() => {
        saveToLocalStorage();
    }, 30000); // Save every 30 seconds
}

// ====================================
// INITIALIZATION AND SETUP
// ====================================

// Initialize the profile page
function initializeProfile() {
    // Load saved data
    loadFromLocalStorage();

    // Set up event listeners
    addFormValidation();
    addKeyboardNavigation();

    // Initialize auto-save
    initializeAutoSave();

    // Set up module integration
    integrateWithModules();

    // Load dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('.dark-mode-toggle i');
        if (icon) icon.className = 'fas fa-sun';
    }

    // Add business hours toggle listeners
    const dayCheckboxes = document.querySelectorAll('.day-header input[type="checkbox"]');
    dayCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const dayConfig = this.closest('.day-config');
            toggleDayTimes(dayConfig, this.checked);
        });
    });

    console.log('Profile page initialized successfully');
}

// Error handling
window.addEventListener('error', function (e) {
    console.error('Profile page error:', e.error);
    showNotification('An unexpected error occurred. Please try again.', 'error');
});

// Unload handler to save data
window.addEventListener('beforeunload', function () {
    saveToLocalStorage();
});

// ====================================
// EXPORT FUNCTIONS FOR GLOBAL ACCESS
// ====================================

// Make key functions available globally
window.CurisProfile = {
    // Personal Information
    editPersonalInfo,
    savePersonalInfo,
    openPhotoModal,
    previewPhoto,
    saveProfilePhoto,

    // Login Credentials
    openCredentialsModal,
    requestEmailChange,
    changeEmail,
    changePassword,
    setupTwoFactor,

    // Clinic Information
    editClinicInfo,
    saveClinicInfo,

    // Business Hours
    openBusinessHoursModal,
    saveBusinessHours,

    // Services Management
    openServicesModal,
    addService,
    updateService,
    deleteService,
    editService,
    addNewService,
    saveAllServices,

    // Branding
    openBrandingModal,
    previewLogo,
    saveBranding,

    // Navigation
    toggleNotifications,
    toggleUserDropdown,
    toggleDarkMode,
    backToDashboard,

    // Utilities
    showNotification,
    closeModal,

    // Data access
    personalData,
    clinicData,
    businessHours,
    servicesData
};

// ====================================
// PAGE LOAD INITIALIZATION
// ====================================

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeProfile();

    // Add CSS animations for notifications and modals
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .notification {
            animation: slideIn 0.3s ease-out;
        }
        
        .dark-mode {
            filter: invert(1) hue-rotate(180deg);
        }
        
        .dark-mode img, .dark-mode video, .dark-mode iframe {
            filter: invert(1) hue-rotate(180deg);
        }
        
        .modal.show .modal-content {
            animation: modalSlideIn 0.3s ease-out;
        }
        
        @keyframes modalSlideIn {
            from { 
                opacity: 0; 
                transform: translateY(-50px) scale(0.95); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
            }
        }
        
        .service-item:hover,
        .info-item:hover,
        .clinic-item:hover,
        .security-item:hover {
            transform: translateY(-2px);
            transition: transform 0.2s ease;
        }
        
        .day-schedule:hover {
            transform: translateX(4px);
            transition: transform 0.2s ease;
        }
        
        .profile-photo:hover,
        .clinic-logo-img:hover {
            transform: scale(1.05);
            transition: transform 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});

console.log('Curis Profile JavaScript loaded successfully');
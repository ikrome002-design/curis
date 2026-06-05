/* ====================================
   CURIS SETTINGS PAGE - COMPREHENSIVE JAVASCRIPT
   Modern Healthcare Dashboard Functionality
   Clinic Owner's Account Settings Management
   ==================================== */

// ====================================
// GLOBAL VARIABLES AND CONFIGURATION
// ====================================

// Settings data storage (simulating database)
let settingsData = {
    workingHours: {
        monday: { open: '08:00', close: '18:00', isOpen: true },
        tuesday: { open: '08:00', close: '18:00', isOpen: true },
        wednesday: { open: '08:00', close: '18:00', isOpen: true },
        thursday: { open: '08:00', close: '18:00', isOpen: true },
        friday: { open: '08:00', close: '18:00', isOpen: true },
        saturday: { open: '09:00', close: '15:00', isOpen: true },
        sunday: { open: '09:00', close: '17:00', isOpen: false }
    },
    holidays: [
        { date: '2025-01-01', name: 'New Year\'s Day' },
        { date: '2025-12-25', name: 'Christmas Day' }
    ],
    recurringHolidays: [
        { name: 'Kenya Independence Day (Dec 12)', enabled: true },
        { name: 'Mashujaa Day (Oct 20)', enabled: true },
        { name: 'Good Friday (Variable)', enabled: true }
    ],
    timeZone: {
        zone: 'EAT',
        region: 'Nairobi, Kenya',
        dstEnabled: false,
        dstAlerts: false
    },
    notifications: {
        channels: {
            email: true,
            sms: true,
            inApp: true
        },
        recipients: 'owner', // 'owner', 'all', 'custom'
        triggers: {
            newAppointment: true,
            cancelledAppointment: true,
            rescheduledAppointment: true,
            paymentSuccess: true,
            paymentFailure: true,
            billingCycle: true
        }
    },
    payment: {
        frequency: 'monthly', // 'weekly', 'biweekly', 'monthly'
        autoReconciliation: true,
        methods: {
            mpesa: {
                enabled: true,
                tillNumber: '123456',
                paybillNumber: '987654'
            },
            bank: { enabled: false },
            paypal: { enabled: false }
        }
    },
    privacy: {
        doctorPermissions: {
            medicalRecords: true,
            appointments: true,
            financialReports: false,
            billingHistory: false
        },
        receptionistPermissions: {
            scheduling: true,
            basicPatientInfo: true,
            medicalRecords: false,
            financialData: false
        }
    },
    profile: {
        name: 'Nairobi Medical Center',
        logo: null,
        address: {
            street: '123 Uhuru Highway',
            city: 'Nairobi',
            postal: '00100'
        },
        contact: {
            phone: '+254 701 234 567',
            email: 'info@nairobimed.co.ke'
        },
        primarySpecialty: 'general',
        specialties: ['internal', 'family']
    },
    backup: {
        autoBackup: true,
        frequency: 'monthly',
        types: {
            financial: true,
            appointments: true,
            patients: true,
            all: true
        },
        delivery: 'email' // 'email', 'download'
    },
    language: {
        current: 'en',
        region: 'ke',
        dateFormat: 'ddmmyyyy', // 'ddmmyyyy', 'mmddyyyy', 'yyyymmdd'
        timeFormat: '24h' // '24h', '12h'
    },
    security: {
        passwordStrength: 'medium',
        twoFactorEnabled: false
    }
};

// Activity log for audit trail
let activityLog = [
    {
        timestamp: '2025-06-01 14:30',
        user: 'Dr. Sarah Wanjiku',
        action: 'Updated working hours',
        details: 'Changed Monday-Friday hours from 9:00-17:00 to 8:00-18:00'
    },
    {
        timestamp: '2025-06-01 12:15',
        user: 'Dr. Sarah Wanjiku',
        action: 'Configured M-Pesa payment',
        details: 'Set Till: 123456, Paybill: 987654'
    },
    {
        timestamp: '2025-05-31 16:45',
        user: 'Dr. Sarah Wanjiku',
        action: 'Added new specialty',
        details: 'Added Internal Medicine to clinic specialties'
    }
];

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
        background: ${type === 'success' ? 'var(--success-green)' : 'var(--error-red)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1200;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show auto-refresh indicator
function showAutoRefresh(message = 'Syncing settings...') {
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
        user: 'Dr. Sarah Wanjiku',
        action: action,
        details: details
    };

    activityLog.unshift(newEntry);

    // Keep only last 50 entries
    if (activityLog.length > 50) {
        activityLog = activityLog.slice(0, 50);
    }
}

// Format time for display
function formatTime(time24) {
    if (settingsData.language.timeFormat === '12h') {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    }
    return time24;
}

// Update current time display
function updateCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        const timeString = settingsData.language.timeFormat === '12h'
            ? now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            : now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        timeElement.textContent = timeString;
    }
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

// Close dropdowns when clicking outside
document.addEventListener('click', function (e) {
    const notificationBtn = document.querySelector('.notification-btn');
    const userProfileBtn = document.querySelector('.user-profile-btn');
    const notificationPanel = document.getElementById('notificationsPanel');
    const userDropdown = document.getElementById('userDropdown');

    if (!notificationBtn.contains(e.target) && notificationPanel) {
        notificationPanel.classList.remove('show');
    }

    if (!userProfileBtn.contains(e.target) && userDropdown) {
        userDropdown.classList.remove('show');
    }
});

// ====================================
// WORKING HOURS FUNCTIONALITY
// ====================================

// Open working hours modal
function openWorkingHoursModal() {
    populateWorkingHoursModal();
    openModal('workingHoursModal');
}

// Populate working hours modal with current data
function populateWorkingHoursModal() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    days.forEach((day, index) => {
        const dayData = settingsData.workingHours[day];
        const modal = document.getElementById('workingHoursModal');
        const dayInputs = modal.querySelectorAll('.day-schedule .form-group')[index];

        if (dayInputs) {
            const timeInputs = dayInputs.querySelectorAll('input[type="time"]');
            const checkbox = dayInputs.querySelector('input[type="checkbox"]');

            if (timeInputs.length >= 2) {
                timeInputs[0].value = dayData.open;
                timeInputs[1].value = dayData.close;
            }

            if (checkbox) {
                checkbox.checked = dayData.isOpen;
            }
        }
    });
}

// Apply Monday hours to all days
function applyToAllDays() {
    const modal = document.getElementById('workingHoursModal');
    const mondayInputs = modal.querySelector('.day-schedule .form-group');

    if (mondayInputs) {
        const mondayOpen = mondayInputs.querySelectorAll('input[type="time"]')[0].value;
        const mondayClose = mondayInputs.querySelectorAll('input[type="time"]')[1].value;
        const mondayIsOpen = mondayInputs.querySelector('input[type="checkbox"]').checked;

        // Apply to all other days except Sunday
        const allDayInputs = modal.querySelectorAll('.day-schedule .form-group');
        for (let i = 1; i < allDayInputs.length - 1; i++) { // Skip Monday (0) and Sunday (6)
            const timeInputs = allDayInputs[i].querySelectorAll('input[type="time"]');
            const checkbox = allDayInputs[i].querySelector('input[type="checkbox"]');

            timeInputs[0].value = mondayOpen;
            timeInputs[1].value = mondayClose;
            checkbox.checked = mondayIsOpen;
        }

        showNotification('Monday hours applied to Tuesday-Saturday');
    }
}

// Save working hours
function saveWorkingHours() {
    const modal = document.getElementById('workingHoursModal');
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayInputs = modal.querySelectorAll('.day-schedule .form-group');

    const oldHours = JSON.stringify(settingsData.workingHours);

    days.forEach((day, index) => {
        const timeInputs = dayInputs[index].querySelectorAll('input[type="time"]');
        const checkbox = dayInputs[index].querySelector('input[type="checkbox"]');

        settingsData.workingHours[day] = {
            open: timeInputs[0].value,
            close: timeInputs[1].value,
            isOpen: checkbox.checked
        };
    });

    // Update display
    updateWorkingHoursDisplay();

    // Log activity
    addActivityLog('Updated working hours', 'Modified clinic operating schedule');

    // Show sync indicator
    showAutoRefresh('Updating appointment availability...');

    closeModal('workingHoursModal');
    showNotification('Working hours updated successfully');
}

// Update working hours display
function updateWorkingHoursDisplay() {
    const scheduleGrid = document.querySelector('.schedule-grid');
    if (scheduleGrid) {
        const weekdayHours = settingsData.workingHours.monday;
        const saturdayHours = settingsData.workingHours.saturday;
        const sundayHours = settingsData.workingHours.sunday;

        scheduleGrid.innerHTML = `
            <div class="schedule-day">
                <strong>Monday - Friday:</strong> ${formatTime(weekdayHours.open)} - ${formatTime(weekdayHours.close)}
            </div>
            <div class="schedule-day">
                <strong>Saturday:</strong> ${saturdayHours.isOpen ? `${formatTime(saturdayHours.open)} - ${formatTime(saturdayHours.close)}` : 'Closed'}
            </div>
            <div class="schedule-day">
                <strong>Sunday:</strong> ${sundayHours.isOpen ? `${formatTime(sundayHours.open)} - ${formatTime(sundayHours.close)}` : 'Closed'}
            </div>
        `;
    }
}

// Open holiday modal
function openHolidayModal() {
    populateHolidayModal();
    openModal('holidayModal');
}

// Populate holiday modal
function populateHolidayModal() {
    const holidayList = document.querySelector('.holiday-list');
    if (holidayList) {
        holidayList.innerHTML = settingsData.holidays.map(holiday => `
            <div class="holiday-item">
                <span>${new Date(holiday.date).toLocaleDateString()} - ${holiday.name}</span>
                <button class="btn-secondary" onclick="removeHoliday(this)" data-date="${holiday.date}">Remove</button>
            </div>
        `).join('');
    }

    // Update recurring holidays
    const recurringContainer = document.querySelector('.recurring-holidays');
    if (recurringContainer) {
        recurringContainer.innerHTML = settingsData.recurringHolidays.map(holiday => `
            <label>
                <input type="checkbox" ${holiday.enabled ? 'checked' : ''}> ${holiday.name}
            </label>
        `).join('');
    }
}

// Add holiday
function addHoliday() {
    const dateInput = document.getElementById('holidayDate');
    if (dateInput && dateInput.value) {
        const date = dateInput.value;
        const name = prompt('Enter holiday name:');

        if (name) {
            settingsData.holidays.push({ date, name });
            populateHolidayModal();
            showNotification('Holiday added successfully');
        }
    }
}

// Remove holiday
function removeHoliday(button) {
    const date = button.getAttribute('data-date');
    settingsData.holidays = settingsData.holidays.filter(h => h.date !== date);
    populateHolidayModal();
    showNotification('Holiday removed');
}

// Save holidays
function saveHolidays() {
    const recurringInputs = document.querySelectorAll('.recurring-holidays input[type="checkbox"]');

    recurringInputs.forEach((input, index) => {
        settingsData.recurringHolidays[index].enabled = input.checked;
    });

    addActivityLog('Updated holiday calendar', 'Modified clinic closure dates');

    closeModal('holidayModal');
    showNotification('Holiday settings saved');
}

// Real-time sync
function syncRealTime() {
    showAutoRefresh('Syncing with appointment system...');

    setTimeout(() => {
        showNotification('Settings synchronized with all systems');
        addActivityLog('Synchronized settings', 'Real-time sync with appointment system');
    }, 2000);
}

// ====================================
// TIME ZONE FUNCTIONALITY
// ====================================

// Open time zone modal
function openTimeZoneModal() {
    populateTimeZoneModal();
    openModal('timeZoneModal');
}

// Populate time zone modal
function populateTimeZoneModal() {
    const modal = document.getElementById('timeZoneModal');
    const searchInput = modal.querySelector('input[type="text"]');
    const select = modal.querySelector('select');

    if (searchInput) {
        searchInput.value = settingsData.timeZone.region;
    }

    if (select) {
        select.value = settingsData.timeZone.zone;
    }
}

// Save time zone
function saveTimeZone() {
    const modal = document.getElementById('timeZoneModal');
    const searchInput = modal.querySelector('input[type="text"]');
    const select = modal.querySelector('select');

    if (searchInput && select) {
        settingsData.timeZone.region = searchInput.value;
        settingsData.timeZone.zone = select.value;

        updateTimeZoneDisplay();
        addActivityLog('Updated time zone', `Changed to ${select.selectedOptions[0].text}`);

        closeModal('timeZoneModal');
        showNotification('Time zone updated successfully');
    }
}

// Update time zone display
function updateTimeZoneDisplay() {
    const timeZoneInfo = document.querySelector('.timezone-info');
    if (timeZoneInfo) {
        const rows = timeZoneInfo.querySelectorAll('.metric-row .metric-number');
        if (rows.length >= 3) {
            rows[0].textContent = settingsData.timeZone.zone === 'EAT' ? 'East Africa Time (EAT)' : settingsData.timeZone.zone;
            rows[2].textContent = settingsData.timeZone.dstEnabled ? 'Enabled' : 'Disabled';
        }
    }
}

// Open DST settings
function openDSTSettings() {
    populateDSTModal();
    openModal('dstModal');
}

// Populate DST modal
function populateDSTModal() {
    const modal = document.getElementById('dstModal');
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

    if (checkboxes.length >= 2) {
        checkboxes[0].checked = settingsData.timeZone.dstEnabled;
        checkboxes[1].checked = settingsData.timeZone.dstAlerts;
    }
}

// Save DST settings
function saveDSTSettings() {
    const modal = document.getElementById('dstModal');
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

    if (checkboxes.length >= 2) {
        settingsData.timeZone.dstEnabled = checkboxes[0].checked;
        settingsData.timeZone.dstAlerts = checkboxes[1].checked;

        updateTimeZoneDisplay();
        addActivityLog('Updated DST settings', 'Modified daylight saving time configuration');

        closeModal('dstModal');
        showNotification('DST settings updated');
    }
}

// ====================================
// NOTIFICATION SETTINGS FUNCTIONALITY
// ====================================

// Open notification modal
function openNotificationModal() {
    populateNotificationModal();
    openModal('notificationModal');
}

// Populate notification modal
function populateNotificationModal() {
    const modal = document.getElementById('notificationModal');
    const channelInputs = modal.querySelectorAll('.channel-toggles input[type="checkbox"]');
    const recipientInputs = modal.querySelectorAll('.recipient-options input[type="radio"]');

    // Set channel toggles
    if (channelInputs.length >= 3) {
        channelInputs[0].checked = settingsData.notifications.channels.email;
        channelInputs[1].checked = settingsData.notifications.channels.sms;
        channelInputs[2].checked = settingsData.notifications.channels.inApp;
    }

    // Set recipient selection
    recipientInputs.forEach(input => {
        if (input.value === settingsData.notifications.recipients) {
            input.checked = true;
        }
    });
}

// Save notification settings
function saveNotificationSettings() {
    const modal = document.getElementById('notificationModal');
    const channelInputs = modal.querySelectorAll('.channel-toggles input[type="checkbox"]');
    const recipientInputs = modal.querySelectorAll('.recipient-options input[type="radio"]');

    // Update channels
    if (channelInputs.length >= 3) {
        settingsData.notifications.channels.email = channelInputs[0].checked;
        settingsData.notifications.channels.sms = channelInputs[1].checked;
        settingsData.notifications.channels.inApp = channelInputs[2].checked;
    }

    // Update recipients
    const selectedRecipient = Array.from(recipientInputs).find(input => input.checked);
    if (selectedRecipient) {
        settingsData.notifications.recipients = selectedRecipient.value;
    }

    updateNotificationDisplay();
    addActivityLog('Updated notification settings', 'Modified alert preferences');

    closeModal('notificationModal');
    showNotification('Notification settings saved');
}

// Update notification display
function updateNotificationDisplay() {
    const statusBadges = document.querySelector('.notification-status .status-badges');
    if (statusBadges) {
        statusBadges.innerHTML = `
            <span class="status-badge ${settingsData.notifications.channels.email ? 'completed' : 'no-show'}">
                <i class="fas fa-envelope"></i>
                Email ${settingsData.notifications.channels.email ? 'Enabled' : 'Disabled'}
            </span>
            <span class="status-badge ${settingsData.notifications.channels.sms ? 'pending' : 'no-show'}">
                <i class="fas fa-sms"></i>
                SMS ${settingsData.notifications.channels.sms ? 'Enabled' : 'Disabled'}
            </span>
            <span class="status-badge ${settingsData.notifications.channels.inApp ? 'in-progress' : 'no-show'}">
                <i class="fas fa-mobile-alt"></i>
                In-App ${settingsData.notifications.channels.inApp ? 'Enabled' : 'Disabled'}
            </span>
        `;
    }
}

// Open recipient modal
function openRecipientModal() {
    openNotificationModal(); // Reuse main notification modal
}

// Open trigger modal
function openTriggerModal() {
    populateTriggerModal();
    openModal('triggerModal');
}

// Populate trigger modal
function populateTriggerModal() {
    const modal = document.getElementById('triggerModal');
    const appointmentInputs = modal.querySelectorAll('.trigger-options')[0].querySelectorAll('input[type="checkbox"]');
    const paymentInputs = modal.querySelectorAll('.trigger-options')[1].querySelectorAll('input[type="checkbox"]');
    const billingInputs = modal.querySelectorAll('.trigger-options')[2].querySelectorAll('input[type="checkbox"]');

    // Set appointment triggers
    if (appointmentInputs.length >= 3) {
        appointmentInputs[0].checked = settingsData.notifications.triggers.newAppointment;
        appointmentInputs[1].checked = settingsData.notifications.triggers.cancelledAppointment;
        appointmentInputs[2].checked = settingsData.notifications.triggers.rescheduledAppointment;
    }

    // Set payment triggers
    if (paymentInputs.length >= 2) {
        paymentInputs[0].checked = settingsData.notifications.triggers.paymentSuccess;
        paymentInputs[1].checked = settingsData.notifications.triggers.paymentFailure;
    }

    // Set billing triggers
    if (billingInputs.length >= 1) {
        billingInputs[0].checked = settingsData.notifications.triggers.billingCycle;
    }
}

// Save trigger settings
function saveTriggerSettings() {
    const modal = document.getElementById('triggerModal');
    const appointmentInputs = modal.querySelectorAll('.trigger-options')[0].querySelectorAll('input[type="checkbox"]');
    const paymentInputs = modal.querySelectorAll('.trigger-options')[1].querySelectorAll('input[type="checkbox"]');
    const billingInputs = modal.querySelectorAll('.trigger-options')[2].querySelectorAll('input[type="checkbox"]');

    // Update appointment triggers
    if (appointmentInputs.length >= 3) {
        settingsData.notifications.triggers.newAppointment = appointmentInputs[0].checked;
        settingsData.notifications.triggers.cancelledAppointment = appointmentInputs[1].checked;
        settingsData.notifications.triggers.rescheduledAppointment = appointmentInputs[2].checked;
    }

    // Update payment triggers
    if (paymentInputs.length >= 2) {
        settingsData.notifications.triggers.paymentSuccess = paymentInputs[0].checked;
        settingsData.notifications.triggers.paymentFailure = paymentInputs[1].checked;
    }

    // Update billing triggers
    if (billingInputs.length >= 1) {
        settingsData.notifications.triggers.billingCycle = billingInputs[0].checked;
    }

    addActivityLog('Updated notification triggers', 'Modified alert trigger conditions');

    closeModal('triggerModal');
    showNotification('Notification triggers updated');
}

// ====================================
// PAYMENT & BILLING FUNCTIONALITY
// ====================================

// Open payment modal
function openPaymentModal() {
    openFrequencyModal(); // Default to frequency settings
}

// Open frequency modal
function openFrequencyModal() {
    populateFrequencyModal();
    openModal('frequencyModal');
}

// Populate frequency modal
function populateFrequencyModal() {
    const modal = document.getElementById('frequencyModal');
    const frequencyInputs = modal.querySelectorAll('.frequency-options input[type="radio"]');

    frequencyInputs.forEach(input => {
        if (input.value === settingsData.payment.frequency) {
            input.checked = true;
        }
    });

    updateFrequencyPreview();
}

// Update frequency preview
function updateFrequencyPreview() {
    const modal = document.getElementById('frequencyModal');
    const previewCalc = modal.querySelector('.preview-calc');

    if (previewCalc) {
        const frequency = settingsData.payment.frequency;
        let estimatedRevenue = 85000; // Base monthly revenue
        let cycles = 1;

        switch (frequency) {
            case 'weekly':
                estimatedRevenue = Math.round(estimatedRevenue / 4);
                cycles = 4;
                break;
            case 'biweekly':
                estimatedRevenue = Math.round(estimatedRevenue / 2);
                cycles = 2;
                break;
            case 'monthly':
                cycles = 1;
                break;
        }

        const platformFee = Math.round(estimatedRevenue * 0.03);
        const netAmount = estimatedRevenue - platformFee;

        previewCalc.innerHTML = `
            <div class="metric-row">
                <span class="metric-label">Estimated ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Revenue:</span>
                <span class="metric-number">KES. ${estimatedRevenue.toLocaleString()}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Platform Fee (3%):</span>
                <span class="metric-number">KES. ${platformFee.toLocaleString()}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Net Amount:</span>
                <span class="metric-number">KES. ${netAmount.toLocaleString()}</span>
            </div>
        `;
    }
}

// Save frequency settings
function saveFrequencySettings() {
    const modal = document.getElementById('frequencyModal');
    const selectedFrequency = modal.querySelector('.frequency-options input[type="radio"]:checked');

    if (selectedFrequency) {
        settingsData.payment.frequency = selectedFrequency.value;
        updatePaymentDisplay();
        addActivityLog('Updated payment frequency', `Changed to ${selectedFrequency.value} billing`);

        closeModal('frequencyModal');
        showNotification('Payment frequency updated');
    }
}

// Update payment display
function updatePaymentDisplay() {
    const paymentSettings = document.querySelector('.payment-settings');
    if (paymentSettings) {
        const rows = paymentSettings.querySelectorAll('.metric-row .metric-number');
        if (rows.length >= 3) {
            rows[0].textContent = settingsData.payment.frequency.charAt(0).toUpperCase() + settingsData.payment.frequency.slice(1);
            rows[1].textContent = settingsData.payment.autoReconciliation ? 'Enabled' : 'Disabled';
            rows[2].textContent = settingsData.payment.methods.mpesa.enabled ? 'M-Pesa' : 'Not configured';
        }
    }
}

// Open methods modal
function openMethodsModal() {
    populateMethodsModal();
    openModal('methodsModal');
}

// Populate methods modal
function populateMethodsModal() {
    const modal = document.getElementById('methodsModal');
    const tillInput = modal.querySelector('.mpesa-config input[placeholder="Enter Till Number"]');
    const paybillInput = modal.querySelector('.mpesa-config input[placeholder="Enter Paybill Number"]');
    const autoReconCheckbox = modal.querySelector('input[type="checkbox"]');

    if (tillInput) tillInput.value = settingsData.payment.methods.mpesa.tillNumber;
    if (paybillInput) paybillInput.value = settingsData.payment.methods.mpesa.paybillNumber;
    if (autoReconCheckbox) autoReconCheckbox.checked = settingsData.payment.autoReconciliation;
}

// Save payment methods
function savePaymentMethods() {
    const modal = document.getElementById('methodsModal');
    const tillInput = modal.querySelector('.mpesa-config input[placeholder="Enter Till Number"]');
    const paybillInput = modal.querySelector('.mpesa-config input[placeholder="Enter Paybill Number"]');
    const autoReconCheckbox = modal.querySelector('input[type="checkbox"]');

    if (tillInput && paybillInput) {
        settingsData.payment.methods.mpesa.tillNumber = tillInput.value;
        settingsData.payment.methods.mpesa.paybillNumber = paybillInput.value;
        settingsData.payment.methods.mpesa.enabled = tillInput.value && paybillInput.value;
    }

    if (autoReconCheckbox) {
        settingsData.payment.autoReconciliation = autoReconCheckbox.checked;
    }

    updatePaymentDisplay();
    addActivityLog('Updated payment methods', 'Modified M-Pesa configuration');

    closeModal('methodsModal');
    showNotification('Payment methods updated');
}

// ====================================
// PRIVACY & PERMISSIONS FUNCTIONALITY
// ====================================

// Open privacy modal
function openPrivacyModal() {
    openAccessMatrix();
}

// Open access matrix
function openAccessMatrix() {
    populateAccessMatrix();
    openModal('accessMatrix');
}

// Populate access matrix
function populateAccessMatrix() {
    const modal = document.getElementById('accessMatrix');
    const doctorInputs = modal.querySelectorAll('.permission-grid')[0].querySelectorAll('input[type="checkbox"]');
    const receptionistInputs = modal.querySelectorAll('.permission-grid')[1].querySelectorAll('input[type="checkbox"]');

    // Set doctor permissions
    if (doctorInputs.length >= 4) {
        doctorInputs[0].checked = settingsData.privacy.doctorPermissions.medicalRecords;
        doctorInputs[1].checked = settingsData.privacy.doctorPermissions.appointments;
        doctorInputs[2].checked = settingsData.privacy.doctorPermissions.financialReports;
        doctorInputs[3].checked = settingsData.privacy.doctorPermissions.billingHistory;
    }

    // Set receptionist permissions
    if (receptionistInputs.length >= 4) {
        receptionistInputs[0].checked = settingsData.privacy.receptionistPermissions.scheduling;
        receptionistInputs[1].checked = settingsData.privacy.receptionistPermissions.basicPatientInfo;
        receptionistInputs[2].checked = settingsData.privacy.receptionistPermissions.medicalRecords;
        receptionistInputs[3].checked = settingsData.privacy.receptionistPermissions.financialData;
    }
}

// Save access matrix
function saveAccessMatrix() {
    const modal = document.getElementById('accessMatrix');
    const doctorInputs = modal.querySelectorAll('.permission-grid')[0].querySelectorAll('input[type="checkbox"]');
    const receptionistInputs = modal.querySelectorAll('.permission-grid')[1].querySelectorAll('input[type="checkbox"]');

    // Update doctor permissions
    if (doctorInputs.length >= 4) {
        settingsData.privacy.doctorPermissions.medicalRecords = doctorInputs[0].checked;
        settingsData.privacy.doctorPermissions.appointments = doctorInputs[1].checked;
        settingsData.privacy.doctorPermissions.financialReports = doctorInputs[2].checked;
        settingsData.privacy.doctorPermissions.billingHistory = doctorInputs[3].checked;
    }

    // Update receptionist permissions
    if (receptionistInputs.length >= 4) {
        settingsData.privacy.receptionistPermissions.scheduling = receptionistInputs[0].checked;
        settingsData.privacy.receptionistPermissions.basicPatientInfo = receptionistInputs[1].checked;
        settingsData.privacy.receptionistPermissions.medicalRecords = receptionistInputs[2].checked;
        settingsData.privacy.receptionistPermissions.financialData = receptionistInputs[3].checked;
    }

    updatePrivacyDisplay();
    addActivityLog('Updated access permissions', 'Modified staff access control matrix');

    closeModal('accessMatrix');
    showNotification('Access permissions updated');
}

// Update privacy display
function updatePrivacyDisplay() {
    const categoryBreakdown = document.querySelector('.permission-summary .category-breakdown');
    if (categoryBreakdown) {
        const doctorAccess = settingsData.privacy.doctorPermissions.medicalRecords ? 'Full Access' : 'Limited Access';
        const receptionistAccess = settingsData.privacy.receptionistPermissions.medicalRecords ? 'Full Access' : 'Limited Access';

        categoryBreakdown.innerHTML = `
            <div class="category-card consultation">
                <div class="category-title">Doctors</div>
                <div class="category-revenue">${doctorAccess}</div>
                <div class="category-percentage">Medical Records</div>
            </div>
            <div class="category-card prescription">
                <div class="category-title">Receptionists</div>
                <div class="category-revenue">${receptionistAccess}</div>
                <div class="category-percentage">Scheduling Only</div>
            </div>
        `;
    }
}

// ====================================
// CLINIC PROFILE FUNCTIONALITY
// ====================================

// Open profile modal
function openProfileModal() {
    populateProfileModal();
    openModal('profileModal');
}

// Populate profile modal
function populateProfileModal() {
    const modal = document.getElementById('profileModal');
    const nameInput = modal.querySelector('input[value="Nairobi Medical Center"]');
    const streetInput = modal.querySelector('input[value="123 Uhuru Highway"]');
    const cityInput = modal.querySelector('input[value="Nairobi"]');
    const postalInput = modal.querySelector('input[value="00100"]');
    const phoneInput = modal.querySelector('input[value="+254 701 234 567"]');
    const emailInput = modal.querySelector('input[value="info@nairobimed.co.ke"]');

    if (nameInput) nameInput.value = settingsData.profile.name;
    if (streetInput) streetInput.value = settingsData.profile.address.street;
    if (cityInput) cityInput.value = settingsData.profile.address.city;
    if (postalInput) postalInput.value = settingsData.profile.address.postal;
    if (phoneInput) phoneInput.value = settingsData.profile.contact.phone;
    if (emailInput) emailInput.value = settingsData.profile.contact.email;
}

// Save profile
function saveProfile() {
    const modal = document.getElementById('profileModal');
    const inputs = modal.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"]');

    if (inputs.length >= 6) {
        settingsData.profile.name = inputs[0].value;
        settingsData.profile.address.street = inputs[1].value;
        settingsData.profile.address.city = inputs[2].value;
        settingsData.profile.address.postal = inputs[3].value;
        settingsData.profile.contact.phone = inputs[4].value;
        settingsData.profile.contact.email = inputs[5].value;
    }

    updateProfileDisplay();
    addActivityLog('Updated clinic profile', 'Modified clinic information');

    closeModal('profileModal');
    showNotification('Clinic profile updated');
}

// Update profile display
function updateProfileDisplay() {
    const clinicInfo = document.querySelector('.clinic-info');
    if (clinicInfo) {
        const rows = clinicInfo.querySelectorAll('.metric-row .metric-number');
        if (rows.length >= 3) {
            rows[0].textContent = settingsData.profile.name;
            rows[1].textContent = getSpecialtyName(settingsData.profile.primarySpecialty);
            rows[2].textContent = settingsData.profile.contact.phone;
        }
    }
}

// Get specialty name
function getSpecialtyName(code) {
    const specialties = {
        'general': 'General Practice',
        'cardiology': 'Cardiology',
        'dermatology': 'Dermatology',
        'pediatrics': 'Pediatrics',
        'orthopedics': 'Orthopedics'
    };
    return specialties[code] || 'General Practice';
}

// Open specialty modal
function openSpecialtyModal() {
    populateSpecialtyModal();
    openModal('specialtyModal');
}

// Populate specialty modal
function populateSpecialtyModal() {
    const modal = document.getElementById('specialtyModal');
    const primarySelect = modal.querySelector('select');
    const specialtyList = modal.querySelector('.specialty-list');

    if (primarySelect) {
        primarySelect.value = settingsData.profile.primarySpecialty;
    }

    if (specialtyList) {
        specialtyList.innerHTML = settingsData.profile.specialties.map(specialty => `
            <div class="specialty-item">
                <span>${getSpecialtyName(specialty)}</span>
                <button class="btn-secondary" onclick="removeSpecialty(this)" data-specialty="${specialty}">Remove</button>
            </div>
        `).join('');
    }
}

// Add specialty
function addSpecialty() {
    const modal = document.getElementById('specialtyModal');
    const select = modal.querySelector('.add-specialty select');

    if (select && select.value) {
        if (!settingsData.profile.specialties.includes(select.value)) {
            settingsData.profile.specialties.push(select.value);
            populateSpecialtyModal();
            showNotification('Specialty added');
        } else {
            showNotification('Specialty already exists', 'error');
        }
    }
}

// Remove specialty
function removeSpecialty(button) {
    const specialty = button.getAttribute('data-specialty');
    settingsData.profile.specialties = settingsData.profile.specialties.filter(s => s !== specialty);
    populateSpecialtyModal();
    showNotification('Specialty removed');
}

// Save specialties
function saveSpecialties() {
    const modal = document.getElementById('specialtyModal');
    const primarySelect = modal.querySelector('select');

    if (primarySelect) {
        settingsData.profile.primarySpecialty = primarySelect.value;
    }

    updateProfileDisplay();
    addActivityLog('Updated specialties', 'Modified clinic specialization list');

    closeModal('specialtyModal');
    showNotification('Specialties updated');
}

// ====================================
// BACKUP & EXPORT FUNCTIONALITY
// ====================================

// Open backup modal
function openBackupModal() {
    populateBackupModal();
    openModal('backupModal');
}

// Populate backup modal
function populateBackupModal() {
    const modal = document.getElementById('backupModal');
    const autoBackupCheckbox = modal.querySelector('input[type="checkbox"]');
    const frequencySelect = modal.querySelector('select');
    const typeCheckboxes = modal.querySelectorAll('.backup-types input[type="checkbox"]');
    const deliveryRadios = modal.querySelectorAll('.delivery-options input[type="radio"]');

    if (autoBackupCheckbox) autoBackupCheckbox.checked = settingsData.backup.autoBackup;
    if (frequencySelect) frequencySelect.value = settingsData.backup.frequency;

    // Set backup types
    if (typeCheckboxes.length >= 4) {
        typeCheckboxes[0].checked = settingsData.backup.types.financial;
        typeCheckboxes[1].checked = settingsData.backup.types.appointments;
        typeCheckboxes[2].checked = settingsData.backup.types.patients;
        typeCheckboxes[3].checked = settingsData.backup.types.all;
    }

    // Set delivery method
    deliveryRadios.forEach(radio => {
        if (radio.value === settingsData.backup.delivery) {
            radio.checked = true;
        }
    });
}

// Save backup settings
function saveBackupSettings() {
    const modal = document.getElementById('backupModal');
    const autoBackupCheckbox = modal.querySelector('input[type="checkbox"]');
    const frequencySelect = modal.querySelector('select');
    const typeCheckboxes = modal.querySelectorAll('.backup-types input[type="checkbox"]');
    const deliveryRadios = modal.querySelectorAll('.delivery-options input[type="radio"]');

    if (autoBackupCheckbox) settingsData.backup.autoBackup = autoBackupCheckbox.checked;
    if (frequencySelect) settingsData.backup.frequency = frequencySelect.value;

    // Update backup types
    if (typeCheckboxes.length >= 4) {
        settingsData.backup.types.financial = typeCheckboxes[0].checked;
        settingsData.backup.types.appointments = typeCheckboxes[1].checked;
        settingsData.backup.types.patients = typeCheckboxes[2].checked;
        settingsData.backup.types.all = typeCheckboxes[3].checked;
    }

    // Update delivery method
    const selectedDelivery = Array.from(deliveryRadios).find(radio => radio.checked);
    if (selectedDelivery) {
        settingsData.backup.delivery = selectedDelivery.value;
    }

    updateBackupDisplay();
    addActivityLog('Updated backup settings', 'Modified automatic backup configuration');

    closeModal('backupModal');
    showNotification('Backup settings saved');
}

// Update backup display
function updateBackupDisplay() {
    const backupStatus = document.querySelector('.backup-status');
    if (backupStatus) {
        const alertItem = backupStatus.querySelector('.alert-item');
        if (alertItem) {
            alertItem.innerHTML = `
                <i class="fas fa-${settingsData.backup.autoBackup ? 'check-circle' : 'times-circle'}"></i>
                Auto-backup ${settingsData.backup.autoBackup ? 'enabled' : 'disabled'} - ${settingsData.backup.frequency} schedule
            `;
            alertItem.className = `alert-item ${settingsData.backup.autoBackup ? 'positive' : 'warning'}`;
        }
    }
}

// Export data now
function exportData() {
    showAutoRefresh('Preparing data export...');

    setTimeout(() => {
        const data = {
            exported: new Date().toISOString(),
            clinic: settingsData.profile,
            settings: settingsData,
            activityLog: activityLog
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `curis-data-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addActivityLog('Exported data', 'Generated comprehensive data export');
        showNotification('Data exported successfully');
    }, 2000);
}

// Open format modal
function openFormatModal() {
    openModal('formatModal');
}

// ====================================
// LANGUAGE & LOCALIZATION FUNCTIONALITY
// ====================================

// Open language modal
function openLanguageModal() {
    populateLanguageModal();
    openModal('languageModal');
}

// Populate language modal
function populateLanguageModal() {
    const modal = document.getElementById('languageModal');
    const languageRadios = modal.querySelectorAll('.language-options input[type="radio"]');
    const regionSelect = modal.querySelector('select');

    languageRadios.forEach(radio => {
        if (radio.value === settingsData.language.current) {
            radio.checked = true;
        }
    });

    if (regionSelect) {
        regionSelect.value = settingsData.language.region;
    }
}

// Save language settings
function saveLanguageSettings() {
    const modal = document.getElementById('languageModal');
    const languageRadios = modal.querySelectorAll('.language-options input[type="radio"]');
    const regionSelect = modal.querySelector('select');

    const selectedLanguage = Array.from(languageRadios).find(radio => radio.checked);
    if (selectedLanguage) {
        settingsData.language.current = selectedLanguage.value;
    }

    if (regionSelect) {
        settingsData.language.region = regionSelect.value;
    }

    updateLanguageDisplay();
    addActivityLog('Updated language settings', 'Changed system language and region');

    closeModal('languageModal');
    showNotification('Language settings updated');
}

// Update language display
function updateLanguageDisplay() {
    const languageSettings = document.querySelector('.language-settings');
    if (languageSettings) {
        const rows = languageSettings.querySelectorAll('.metric-row .metric-number');
        if (rows.length >= 3) {
            const languageNames = {
                'en': 'English (Default)',
                'sw': 'Kiswahili',
                'fr': 'Français'
            };
            rows[0].textContent = languageNames[settingsData.language.current] || 'English (Default)';

            const formatNames = {
                'ddmmyyyy': 'DD/MM/YYYY',
                'mmddyyyy': 'MM/DD/YYYY',
                'yyyymmdd': 'YYYY-MM-DD'
            };
            rows[1].textContent = formatNames[settingsData.language.dateFormat] || 'DD/MM/YYYY';
        }
    }
}

// Open date format modal
function openDateFormatModal() {
    populateDateFormatModal();
    openModal('dateFormatModal');
}

// Populate date format modal
function populateDateFormatModal() {
    const modal = document.getElementById('dateFormatModal');
    const dateRadios = modal.querySelectorAll('.format-options input[name="dateFormat"]');
    const timeRadios = modal.querySelectorAll('.format-options input[name="timeFormat"]');

    dateRadios.forEach(radio => {
        if (radio.value === settingsData.language.dateFormat) {
            radio.checked = true;
        }
    });

    timeRadios.forEach(radio => {
        if (radio.value === settingsData.language.timeFormat) {
            radio.checked = true;
        }
    });
}

// Save date format
function saveDateFormat() {
    const modal = document.getElementById('dateFormatModal');
    const dateRadios = modal.querySelectorAll('.format-options input[name="dateFormat"]');
    const timeRadios = modal.querySelectorAll('.format-options input[name="timeFormat"]');

    const selectedDateFormat = Array.from(dateRadios).find(radio => radio.checked);
    const selectedTimeFormat = Array.from(timeRadios).find(radio => radio.checked);

    if (selectedDateFormat) {
        settingsData.language.dateFormat = selectedDateFormat.value;
    }

    if (selectedTimeFormat) {
        settingsData.language.timeFormat = selectedTimeFormat.value;
    }

    updateLanguageDisplay();
    updateWorkingHoursDisplay(); // Update time display format
    updateCurrentTime(); // Update header time
    addActivityLog('Updated date format', 'Changed date and time display format');

    closeModal('dateFormatModal');
    showNotification('Date format updated');
}

// ====================================
// SECURITY FUNCTIONALITY
// ====================================

// Open security modal
function openSecurityModal() {
    openPasswordModal(); // Default to password settings
}

// Open password modal
function openPasswordModal() {
    openModal('passwordModal');
}

// Update password
function updatePassword() {
    const modal = document.getElementById('passwordModal');
    const currentPassword = modal.querySelector('input[placeholder="Enter current password"]').value;
    const newPassword = modal.querySelector('input[placeholder="Enter new password"]').value;
    const confirmPassword = modal.querySelector('input[placeholder="Confirm new password"]').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all password fields', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }

    // Simulate password update
    settingsData.security.passwordStrength = calculatePasswordStrength(newPassword);
    updateSecurityDisplay();
    addActivityLog('Updated password', 'Changed account password');

    closeModal('passwordModal');
    showNotification('Password updated successfully');
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength < 3) return 'weak';
    if (strength < 5) return 'medium';
    return 'strong';
}

// Open TFA modal
function openTFAModal() {
    openModal('tfaModal');
}

// Enable TFA
function enableTFA() {
    const modal = document.getElementById('tfaModal');
    const verificationCode = modal.querySelector('input[placeholder="Enter 6-digit code from app"]').value;

    if (!verificationCode || verificationCode.length !== 6) {
        showNotification('Please enter a valid 6-digit verification code', 'error');
        return;
    }

    settingsData.security.twoFactorEnabled = true;
    updateSecurityDisplay();
    addActivityLog('Enabled 2FA', 'Activated two-factor authentication');

    closeModal('tfaModal');
    showNotification('Two-factor authentication enabled');
}

// Update security display
function updateSecurityDisplay() {
    const securityStatus = document.querySelector('.security-status .status-badges');
    if (securityStatus) {
        const strengthColors = {
            'weak': 'no-show',
            'medium': 'pending',
            'strong': 'completed'
        };

        securityStatus.innerHTML = `
            <span class="status-badge ${strengthColors[settingsData.security.passwordStrength]}">
                <i class="fas fa-lock"></i>
                ${settingsData.security.passwordStrength.charAt(0).toUpperCase() + settingsData.security.passwordStrength.slice(1)} Password
            </span>
            <span class="status-badge ${settingsData.security.twoFactorEnabled ? 'completed' : 'no-show'}">
                <i class="fas fa-shield-alt"></i>
                2FA ${settingsData.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
        `;
    }
}

// ====================================
// AUDIT & LOGGING FUNCTIONALITY
// ====================================

// Open audit modal
function openAuditModal() {
    populateAuditModal();
    openModal('auditModal');
}

// Populate audit modal
function populateAuditModal() {
    const modal = document.getElementById('auditModal');
    const auditLog = modal.querySelector('.audit-log');

    if (auditLog) {
        auditLog.innerHTML = activityLog.map(entry => `
            <div class="log-entry">
                <div class="log-time">${entry.timestamp}</div>
                <div class="log-user">${entry.user}</div>
                <div class="log-action">${entry.action}</div>
                <div class="log-details">${entry.details}</div>
            </div>
        `).join('');
    }
}

// Export audit logs
function exportAuditLogs() {
    const data = {
        exported: new Date().toISOString(),
        clinic: settingsData.profile.name,
        logs: activityLog
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Audit logs exported successfully');
}

// Export logs (from widget)
function exportLogs() {
    exportAuditLogs();
}

// ====================================
// DARK MODE FUNCTIONALITY
// ====================================

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

// ====================================
// INITIALIZATION AND EVENT LISTENERS
// ====================================

// Initialize the settings page
function initializeSettings() {
    // Update current time every second
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // Update all displays with current data
    updateWorkingHoursDisplay();
    updateTimeZoneDisplay();
    updateNotificationDisplay();
    updatePaymentDisplay();
    updatePrivacyDisplay();
    updateProfileDisplay();
    updateBackupDisplay();
    updateLanguageDisplay();
    updateSecurityDisplay();

    // Load dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('.dark-mode-toggle i');
        if (icon) icon.className = 'fas fa-sun';
    }

    // Add keyboard navigation support
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            // Close any open modals
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                closeModal(modal.id);
            });

            // Close any open dropdowns
            const openDropdowns = document.querySelectorAll('.show');
            openDropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });

    // Add form validation listeners
    addFormValidationListeners();

    // Initialize tooltips and accessibility features
    initializeAccessibilityFeatures();

    console.log('Settings page initialized successfully');
}

// Add form validation listeners
function addFormValidationListeners() {
    // Real-time password strength indicator
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function () {
            if (this.placeholder.includes('new password')) {
                updatePasswordStrength(this.value);
            }
        });
    });

    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateEmail(this);
        });
    });

    // Phone validation
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('blur', function () {
            validatePhone(this);
        });
    });
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.password-strength small');

    if (strengthBar && strengthText) {
        const strength = calculatePasswordStrength(password);
        const strengthConfig = {
            'weak': { width: '33%', color: 'var(--error-red)', text: 'Weak - Add more characters and symbols' },
            'medium': { width: '66%', color: 'var(--warning-yellow)', text: 'Medium - Add special characters for stronger security' },
            'strong': { width: '100%', color: 'var(--success-green)', text: 'Strong - Excellent password security' }
        };

        const config = strengthConfig[strength];
        strengthBar.style.width = config.width;
        strengthBar.style.background = config.color;
        strengthText.textContent = config.text;
    }
}

// Validate email
function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(input.value);

    input.style.borderColor = isValid ? 'var(--success-green)' : 'var(--error-red)';

    if (!isValid && input.value) {
        showNotification('Please enter a valid email address', 'error');
    }
}

// Validate phone
function validatePhone(input) {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    const isValid = phoneRegex.test(input.value);

    input.style.borderColor = isValid ? 'var(--success-green)' : 'var(--error-red)';

    if (!isValid && input.value) {
        showNotification('Please enter a valid phone number', 'error');
    }
}

// Initialize accessibility features
function initializeAccessibilityFeatures() {
    // Add ARIA labels to buttons without text
    const iconButtons = document.querySelectorAll('button i');
    iconButtons.forEach(icon => {
        const button = icon.parentElement;
        if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
            const iconClass = icon.className;
            if (iconClass.includes('bell')) button.setAttribute('aria-label', 'Notifications');
            if (iconClass.includes('user')) button.setAttribute('aria-label', 'User menu');
            if (iconClass.includes('cog')) button.setAttribute('aria-label', 'Settings');
        }
    });

    // Add keyboard navigation for custom dropdowns
    const dropdowns = document.querySelectorAll('[onclick*="toggle"]');
    dropdowns.forEach(dropdown => {
        dropdown.setAttribute('tabindex', '0');
        dropdown.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// ====================================
// AUTO-SAVE FUNCTIONALITY
// ====================================

// Auto-save settings periodically
function initializeAutoSave() {
    setInterval(() => {
        // Simulate auto-save to server
        console.log('Auto-saving settings...', settingsData);
    }, 30000); // Every 30 seconds
}

// ====================================
// INTEGRATION WITH OTHER MODULES
// ====================================

// Simulate integration with other modules
function integrateWithModules() {
    // Working hours changes affect appointment availability
    window.updateAppointmentAvailability = function () {
        showAutoRefresh('Updating appointment slots...');
        console.log('Integrating with Appointments module');
    };

    // Payment settings affect billing module
    window.updateBillingConfiguration = function () {
        showAutoRefresh('Syncing billing settings...');
        console.log('Integrating with Billings module');
    };

    // Staff permissions affect workforce module
    window.updateStaffPermissions = function () {
        showAutoRefresh('Applying permission changes...');
        console.log('Integrating with Workforce Hub');
    };

    // Profile changes affect dashboard
    window.updateDashboardProfile = function () {
        showAutoRefresh('Updating dashboard...');
        console.log('Integrating with Dashboard');
    };
}

// ====================================
// ERROR HANDLING AND RECOVERY
// ====================================

// Global error handler
window.addEventListener('error', function (e) {
    console.error('Settings page error:', e.error);
    showNotification('An error occurred. Please try again.', 'error');
});

// Network error simulation
function simulateNetworkError() {
    showNotification('Network error. Changes will be saved when connection is restored.', 'error');
}

// ====================================
// PAGE LOAD INITIALIZATION
// ====================================

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeSettings();
    initializeAutoSave();
    integrateWithModules();

    // Add CSS animations for notifications
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
    `;
    document.head.appendChild(style);
});

// ====================================
// EXPORT FUNCTIONS FOR GLOBAL ACCESS
// ====================================

// Make key functions available globally
window.CurisSettings = {
    openWorkingHoursModal,
    openHolidayModal,
    openTimeZoneModal,
    openNotificationModal,
    openPaymentModal,
    openPrivacyModal,
    openProfileModal,
    openBackupModal,
    openLanguageModal,
    openSecurityModal,
    openAuditModal,
    toggleNotifications,
    toggleUserDropdown,
    toggleDarkMode,
    exportData,
    exportLogs,
    showNotification,
    settingsData
};

console.log('Curis Settings JavaScript loaded successfully');
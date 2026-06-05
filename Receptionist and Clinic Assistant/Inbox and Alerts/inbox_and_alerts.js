/**
 * ===============================================
 * CURIS INBOX & ALERTS JAVASCRIPT
 * Communication Hub Functionality
 * Version: 1.0.0
 * ===============================================
 */

// Global State Management
const InboxAlertsState = {
    alerts: [],
    messages: [],
    notifications: [],
    activeThread: null,
    activeFilter: 'all',
    unreadCount: 12,
    selectedRecipients: [],
    currentPage: 1,
    totalPages: 25,
    snoozeTimers: new Map(),
    typingStatus: new Map()
};

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function () {
    initializeInboxAlerts();
    setupEventListeners();
    loadInitialData();
    startRealTimeUpdates();
    initializeWebSocket();
});

/**
 * ===============================================
 * INITIALIZATION FUNCTIONS
 * ===============================================
 */
function initializeInboxAlerts() {
    // Initialize notification badge
    updateNotificationBadge(InboxAlertsState.unreadCount);

    // Initialize alert filters
    initializeAlertFilters();

    // Initialize chat system
    initializeChatSystem();

    // Initialize notification panel
    initializeNotificationPanel();

    // Initialize history log
    initializeHistoryLog();

    // Initialize smart filters
    initializeSmartFilters();

    console.log('Inbox & Alerts initialized successfully');
}

function setupEventListeners() {
    // Alert Filters
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', handleFilterChange);
    });

    // Mark All Read Button
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllAlertsAsRead);
    }

    // Filter Alerts Button
    const filterAlertsBtn = document.getElementById('filterAlertsBtn');
    if (filterAlertsBtn) {
        filterAlertsBtn.addEventListener('click', toggleFilterPanel);
    }

    // New Message Button
    const newMessageBtn = document.getElementById('newMessageBtn');
    if (newMessageBtn) {
        newMessageBtn.addEventListener('click', () => openModal('newMessageModal'));
    }

    // Broadcast Button
    const broadcastBtn = document.getElementById('broadcastBtn');
    if (broadcastBtn) {
        broadcastBtn.addEventListener('click', () => openModal('broadcastModal'));
    }

    // Profile Toggle
    const userProfile = document.getElementById('userProfile');
    const profilePopup = document.getElementById('profilePopup');
    if (userProfile && profilePopup) {
        userProfile.addEventListener('click', toggleProfilePopup);
    }

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // Chat Thread Selection
    document.querySelectorAll('.thread-item').forEach(thread => {
        thread.addEventListener('click', selectChatThread);
    });

    // Message Input
    const messageInput = document.querySelector('.message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', handleMessageInput);
        messageInput.addEventListener('input', handleTypingIndicator);
    }

    // Send Button
    const sendBtn = document.querySelector('.btn-send');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    // Smart Replies
    document.querySelectorAll('.smart-reply').forEach(reply => {
        reply.addEventListener('click', handleSmartReply);
    });

    // Send Options
    document.querySelectorAll('.send-option').forEach(option => {
        option.addEventListener('click', handleSendOptionChange);
    });

    // Message Template
    const messageTemplate = document.getElementById('messageTemplate');
    if (messageTemplate) {
        messageTemplate.addEventListener('change', handleTemplateChange);
    }

    // Load More Alerts
    const loadMoreBtn = document.querySelector('.btn-load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreAlerts);
    }

    // Export History
    const exportHistoryBtn = document.getElementById('exportHistoryBtn');
    if (exportHistoryBtn) {
        exportHistoryBtn.addEventListener('click', exportAlertHistory);
    }

    // Save Filter Preset
    const savePresetBtn = document.getElementById('savePresetBtn');
    if (savePresetBtn) {
        savePresetBtn.addEventListener('click', saveFilterPreset);
    }

    // Modal Close Buttons
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function () {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Form Submissions
    setupFormHandlers();

    // Alert Actions
    setupAlertActions();

    // Pagination
    setupPagination();

    // Recipient Management
    setupRecipientManagement();

    // Snooze Options
    setupSnoozeOptions();
}

/**
 * ===============================================
 * REAL-TIME ALERTS FEED
 * ===============================================
 */
function initializeAlertFilters() {
    InboxAlertsState.activeFilter = 'all';
    updateAlertsList();
}

function handleFilterChange(e) {
    // Remove active class from all chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });

    // Add active class to clicked chip
    e.target.classList.add('active');

    // Update active filter
    InboxAlertsState.activeFilter = e.target.dataset.filter;

    // Update alerts list
    updateAlertsList();
}

function updateAlertsList() {
    const alertsList = document.querySelector('.alerts-list');
    if (!alertsList) return;

    // Filter alerts based on active filter
    let filteredAlerts = filterAlerts(InboxAlertsState.alerts, InboxAlertsState.activeFilter);

    // Clear existing alerts
    const alertItems = alertsList.querySelectorAll('.alert-item');
    alertItems.forEach(item => {
        if (!filteredAlerts.includes(item)) {
            item.style.display = 'none';
        } else {
            item.style.display = 'flex';
        }
    });

    // Update unread count
    updateUnreadCount();
}

function filterAlerts(alerts, filter) {
    switch (filter) {
        case 'all':
            return alerts;
        case 'appointments':
            return alerts.filter(a => a.classList.contains('appointment'));
        case 'arrivals':
            return alerts.filter(a => a.classList.contains('arrival'));
        case 'emergency':
            return alerts.filter(a => a.classList.contains('emergency'));
        case 'system':
            return alerts.filter(a => a.classList.contains('system'));
        case 'unread':
            return alerts.filter(a => a.classList.contains('unread'));
        default:
            return alerts;
    }
}

function markAllAlertsAsRead() {
    document.querySelectorAll('.alert-item.unread').forEach(alert => {
        alert.classList.remove('unread');
    });

    InboxAlertsState.unreadCount = 0;
    updateNotificationBadge(0);

    showNotification('All alerts marked as read', 'success');
}

function loadMoreAlerts() {
    const loadMoreBtn = document.querySelector('.btn-load-more');
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

    // Simulate loading more alerts
    setTimeout(() => {
        const alertsList = document.querySelector('.alerts-list');

        // Create sample older alerts
        const olderAlerts = [
            {
                type: 'appointment',
                title: 'Rescheduled Appointment',
                message: 'Patient Samuel Njoroge rescheduled from 3:00 PM to 4:30 PM',
                time: '3 hours ago'
            },
            {
                type: 'system',
                title: 'System Backup Complete',
                message: 'Daily backup completed successfully at 12:00 PM',
                time: '4 hours ago'
            }
        ];

        olderAlerts.forEach(alert => {
            const alertElement = createAlertElement(alert);
            alertsList.appendChild(alertElement);
        });

        loadMoreBtn.innerHTML = '<i class="fas fa-arrow-down"></i> Load More Alerts';
        showNotification('Older alerts loaded', 'info');
    }, 1000);
}

function createAlertElement(alertData) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-item ${alertData.type}`;
    alertDiv.innerHTML = `
        <div class="alert-icon">
            <i class="fas fa-${getAlertIcon(alertData.type)}"></i>
        </div>
        <div class="alert-content">
            <div class="alert-header">
                <span class="alert-title">${alertData.title}</span>
                <span class="alert-time">${alertData.time}</span>
            </div>
            <p class="alert-message">${alertData.message}</p>
            <div class="alert-actions">
                <button class="btn-action acknowledge">
                    <i class="fas fa-check"></i> Acknowledge
                </button>
            </div>
        </div>
    `;

    // Add event listener to acknowledge button
    alertDiv.querySelector('.acknowledge').addEventListener('click', function () {
        acknowledgeAlert(alertDiv);
    });

    return alertDiv;
}

function getAlertIcon(type) {
    const icons = {
        'appointment': 'calendar-plus',
        'arrival': 'user-check',
        'emergency': 'exclamation-triangle',
        'system': 'info-circle',
        'cancellation': 'times-circle'
    };
    return icons[type] || 'bell';
}

function acknowledgeAlert(alertElement) {
    alertElement.classList.remove('unread');
    alertElement.style.opacity = '0.7';

    // Update unread count
    if (InboxAlertsState.unreadCount > 0) {
        InboxAlertsState.unreadCount--;
        updateNotificationBadge(InboxAlertsState.unreadCount);
    }

    showNotification('Alert acknowledged', 'success');
}

function setupAlertActions() {
    // Acknowledge buttons
    document.querySelectorAll('.btn-action.acknowledge').forEach(btn => {
        btn.addEventListener('click', function () {
            acknowledgeAlert(this.closest('.alert-item'));
        });
    });

    // View Appointments
    document.querySelectorAll('.btn-action.view-appointments').forEach(btn => {
        btn.addEventListener('click', function () {
            window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Appointments\\appointments.html';
        });
    });

    // Notify Patients
    document.querySelectorAll('.btn-action.notify-patients').forEach(btn => {
        btn.addEventListener('click', function () {
            openNotifyPatientsModal();
        });
    });

    // Contact Patient
    document.querySelectorAll('.btn-action.contact').forEach(btn => {
        btn.addEventListener('click', function () {
            const patientName = this.closest('.alert-item').querySelector('.alert-message').textContent.match(/Patient (\w+ \w+)/)[1];
            initiatePatientContact(patientName);
        });
    });

    // Reschedule
    document.querySelectorAll('.btn-action.reschedule').forEach(btn => {
        btn.addEventListener('click', function () {
            window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Appointments\\appointments.html#reschedule';
        });
    });

    // Notify Doctor
    document.querySelectorAll('.btn-action.notify-doctor').forEach(btn => {
        btn.addEventListener('click', function () {
            notifyDoctor(this.closest('.alert-item'));
        });
    });

    // Send Confirmation
    document.querySelectorAll('.btn-action.confirm').forEach(btn => {
        btn.addEventListener('click', function () {
            sendAppointmentConfirmation(this.closest('.alert-item'));
        });
    });

    // Open Slot
    document.querySelectorAll('.btn-action.open-slot').forEach(btn => {
        btn.addEventListener('click', function () {
            openTimeSlot(this.closest('.alert-item'));
        });
    });
}

/**
 * ===============================================
 * INTERNAL MESSAGING SYSTEM
 * ===============================================
 */
function initializeChatSystem() {
    InboxAlertsState.activeThread = document.querySelector('.thread-item.active');
    updateChatWindow();
}

function selectChatThread(e) {
    // Remove active class from all threads
    document.querySelectorAll('.thread-item').forEach(thread => {
        thread.classList.remove('active');
    });

    // Add active class to selected thread
    const thread = e.currentTarget;
    thread.classList.add('active');
    thread.classList.remove('unread');

    // Remove unread count
    const unreadCount = thread.querySelector('.unread-count');
    if (unreadCount) {
        unreadCount.remove();
    }

    // Update active thread
    InboxAlertsState.activeThread = thread;

    // Update chat window
    updateChatWindow();
}

function updateChatWindow() {
    if (!InboxAlertsState.activeThread) return;

    const threadName = InboxAlertsState.activeThread.querySelector('.thread-name').textContent;
    const chatUserName = document.querySelector('.chat-user-name');

    if (chatUserName) {
        chatUserName.textContent = threadName;
    }

    // Update online status
    const onlineStatus = InboxAlertsState.activeThread.querySelector('.online-status');
    const chatUserStatus = document.querySelector('.chat-user-status');

    if (onlineStatus && chatUserStatus) {
        if (onlineStatus.classList.contains('online')) {
            chatUserStatus.innerHTML = '<i class="fas fa-circle"></i> Online - Last seen just now';
        } else if (onlineStatus.classList.contains('away')) {
            chatUserStatus.innerHTML = '<i class="fas fa-circle"></i> Away - Last seen 10 minutes ago';
        } else {
            chatUserStatus.innerHTML = '<i class="fas fa-circle"></i> Offline - Last seen 1 hour ago';
        }
    }

    // Clear typing indicator
    hideTypingIndicator();

    // Load chat history for the selected thread
    loadChatHistory(threadName);
}

function loadChatHistory(threadName) {
    // Simulate loading chat history
    console.log(`Loading chat history for ${threadName}`);
}

function handleMessageInput(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function handleTypingIndicator() {
    // Clear existing timeout
    if (InboxAlertsState.typingTimeout) {
        clearTimeout(InboxAlertsState.typingTimeout);
    }

    // Send typing status
    sendTypingStatus(true);

    // Set timeout to stop typing indicator
    InboxAlertsState.typingTimeout = setTimeout(() => {
        sendTypingStatus(false);
    }, 2000);
}

function sendTypingStatus(isTyping) {
    // Send typing status via WebSocket
    if (InboxAlertsState.ws && InboxAlertsState.ws.readyState === WebSocket.OPEN) {
        InboxAlertsState.ws.send(JSON.stringify({
            type: 'typing',
            isTyping: isTyping,
            thread: InboxAlertsState.activeThread?.querySelector('.thread-name').textContent
        }));
    }
}

function showTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'block';
    }
}

function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

function sendMessage() {
    const messageInput = document.querySelector('.message-input');
    const messageText = messageInput.value.trim();

    if (!messageText) return;

    // Create message element
    const messagesArea = document.querySelector('.messages-area');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p class="message-text">${escapeHtml(messageText)}</p>
            <span class="message-time">${getCurrentTime()} <i class="fas fa-check"></i></span>
        </div>
    `;

    // Insert before typing indicator
    const typingIndicator = document.querySelector('.typing-indicator');
    messagesArea.insertBefore(messageDiv, typingIndicator);

    // Clear input
    messageInput.value = '';

    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // Send via WebSocket
    if (InboxAlertsState.ws && InboxAlertsState.ws.readyState === WebSocket.OPEN) {
        InboxAlertsState.ws.send(JSON.stringify({
            type: 'message',
            text: messageText,
            thread: InboxAlertsState.activeThread?.querySelector('.thread-name').textContent,
            timestamp: new Date().toISOString()
        }));
    }

    // Update thread preview
    updateThreadPreview(messageText);

    // Simulate read receipt after 2 seconds
    setTimeout(() => {
        const checkIcon = messageDiv.querySelector('.fa-check');
        if (checkIcon) {
            checkIcon.className = 'fas fa-check-double read';
        }
    }, 2000);
}

function handleSmartReply(e) {
    const replyText = e.target.textContent;
    const messageInput = document.querySelector('.message-input');

    if (messageInput) {
        messageInput.value = replyText;
        messageInput.focus();
    }
}

function updateThreadPreview(message) {
    if (!InboxAlertsState.activeThread) return;

    const preview = InboxAlertsState.activeThread.querySelector('.thread-preview');
    const time = InboxAlertsState.activeThread.querySelector('.thread-time');

    if (preview) {
        preview.textContent = message;
    }

    if (time) {
        time.textContent = 'Just now';
    }
}

/**
 * ===============================================
 * PATIENT NOTIFICATION PANEL
 * ===============================================
 */
function initializeNotificationPanel() {
    updateCharacterCount();
    loadMessageTemplates();
}

function handleSendOptionChange(e) {
    // Remove active class from all options
    document.querySelectorAll('.send-option').forEach(option => {
        option.classList.remove('active');
    });

    // Add active class to clicked option
    e.currentTarget.classList.add('active');

    // Update message format based on channel
    const channel = e.currentTarget.dataset.channel;
    updateMessageFormat(channel);
}

function updateMessageFormat(channel) {
    const messageTextarea = document.querySelector('.form-textarea');

    switch (channel) {
        case 'sms':
            messageTextarea.placeholder = 'Type your SMS message (160 characters max)...';
            updateCharacterCount();
            break;
        case 'whatsapp':
            messageTextarea.placeholder = 'Type your WhatsApp message...';
            hideCharacterCount();
            break;
        case 'email':
            messageTextarea.placeholder = 'Type your email content...';
            hideCharacterCount();
            break;
    }
}

function updateCharacterCount() {
    const messageTextarea = document.querySelector('.form-textarea');
    const characterCount = document.querySelector('.character-count span');

    if (messageTextarea && characterCount) {
        messageTextarea.addEventListener('input', function () {
            const length = this.value.length;
            const smsCount = Math.ceil(length / 160) || 1;
            characterCount.textContent = `${length} / ${smsCount * 160} characters (${smsCount} SMS)`;
        });
    }
}

function hideCharacterCount() {
    const characterCount = document.querySelector('.character-count');
    if (characterCount) {
        characterCount.style.display = 'none';
    }
}

function handleTemplateChange(e) {
    const templateValue = e.target.value;
    const messageTextarea = document.querySelector('.form-textarea');

    if (!messageTextarea) return;

    const templates = {
        'appointment-confirm': `Dear [Patient Name],

Your appointment with [Doctor Name] is confirmed for [Date] at [Time].

Please arrive 10 minutes early for check-in.

Reply STOP to unsubscribe.`,

        'reminder': `Reminder: You have an appointment tomorrow at [Time] with [Doctor Name].

Location: Curis Clinic

Call 0700-123-456 to confirm.`,

        'delay': `Dear [Patient Name],

Dr. [Doctor Name] is running [X] minutes late. Your new estimated appointment time is [Time].

We apologize for the inconvenience.`,

        'cancellation': `Dear [Patient Name],

Your appointment scheduled for [Date] at [Time] has been cancelled.

Please call 0700-123-456 to reschedule.`,

        'clinic-update': `Dear Valued Patient,

[Update Message]

Thank you for choosing Curis Clinic.`,

        'custom': ''
    };

    messageTextarea.value = templates[templateValue] || '';
    updateCharacterCount();

    if (templateValue === 'custom') {
        messageTextarea.focus();
    }
}

function setupRecipientManagement() {
    // Select All Button
    const selectAllBtn = document.querySelector('.btn-select-all');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAllTodayAppointments);
    }

    // Remove recipient chips
    document.querySelectorAll('.recipient-chip i').forEach(removeBtn => {
        removeBtn.addEventListener('click', function () {
            this.parentElement.remove();
            updateRecipientCount();
        });
    });

    // Recipient search
    const recipientInput = document.querySelector('.recipient-selector input');
    if (recipientInput) {
        recipientInput.addEventListener('input', searchRecipients);
    }
}

function selectAllTodayAppointments() {
    // Simulate selecting all today's appointments
    const recipients = [
        'John Kimani',
        'Grace Muthoni',
        'Peter Wachira',
        'Alice Wanjiku',
        'Samuel Njoroge'
    ];

    const selectedRecipients = document.querySelector('.selected-recipients');
    selectedRecipients.innerHTML = '';

    recipients.forEach(recipient => {
        const chip = document.createElement('span');
        chip.className = 'recipient-chip';
        chip.innerHTML = `${recipient} <i class="fas fa-times"></i>`;

        chip.querySelector('i').addEventListener('click', function () {
            chip.remove();
            updateRecipientCount();
        });

        selectedRecipients.appendChild(chip);
    });

    updateRecipientCount();
    showNotification(`${recipients.length} recipients selected`, 'info');
}

function updateRecipientCount() {
    const chips = document.querySelectorAll('.recipient-chip');
    const countElement = document.querySelector('.recipient-count');

    if (chips.length > 3 && countElement) {
        countElement.textContent = `+${chips.length - 2} more`;
        countElement.style.display = 'inline';
    } else if (countElement) {
        countElement.style.display = 'none';
    }
}

function searchRecipients(e) {
    const searchTerm = e.target.value.toLowerCase();

    // Simulate recipient search
    if (searchTerm.length < 2) return;

    console.log(`Searching for recipients: ${searchTerm}`);
    // Implement autocomplete/dropdown here
}

/**
 * ===============================================
 * ALERTS HISTORY LOG
 * ===============================================
 */
function initializeHistoryLog() {
    // Set default date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);

    const startDateInput = document.getElementById('historyStartDate');
    const endDateInput = document.getElementById('historyEndDate');

    if (startDateInput) {
        startDateInput.value = formatDate(startDate);
    }

    if (endDateInput) {
        endDateInput.value = formatDate(endDate);
    }
}

function exportAlertHistory() {
    const startDate = document.getElementById('historyStartDate').value;
    const endDate = document.getElementById('historyEndDate').value;

    showNotification('Preparing export...', 'info');

    // Simulate export preparation
    setTimeout(() => {
        // Create CSV content
        const csvContent = generateHistoryCSV(startDate, endDate);

        // Download CSV
        downloadCSV(csvContent, `alert_history_${startDate}_to_${endDate}.csv`);

        showNotification('Alert history exported successfully', 'success');
    }, 1500);
}

function generateHistoryCSV(startDate, endDate) {
    // Headers
    let csv = 'Timestamp,Type,Alert,Sender,Recipient,Status,Response Time\\n';

    // Sample data
    const historyData = [
        ['2025-09-29 14:45:00', 'Emergency', 'Doctor unavailable', 'Dr. James Ochieng', 'All Staff', 'Resolved', '2 min'],
        ['2025-09-29 14:30:15', 'Arrival', 'Patient check-in', 'System', 'Reception', 'Acknowledged', '30 sec'],
        ['2025-09-29 14:00:00', 'Appointment', 'New booking', 'System', 'Reception', 'Acknowledged', '5 min']
    ];

    historyData.forEach(row => {
        csv += row.join(',') + '\\n';
    });

    return csv;
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function setupPagination() {
    const prevBtn = document.querySelector('.page-btn:first-child');
    const nextBtn = document.querySelector('.page-btn:last-child');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => changePage(-1));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => changePage(1));
    }
}

function changePage(direction) {
    const newPage = InboxAlertsState.currentPage + direction;

    if (newPage < 1 || newPage > InboxAlertsState.totalPages) return;

    InboxAlertsState.currentPage = newPage;

    // Update page info
    const pageInfo = document.querySelector('.page-info');
    if (pageInfo) {
        pageInfo.textContent = `Page ${InboxAlertsState.currentPage} of ${InboxAlertsState.totalPages}`;
    }

    // Load page data
    loadHistoryPage(InboxAlertsState.currentPage);
}

function loadHistoryPage(page) {
    // Simulate loading history page data
    console.log(`Loading history page ${page}`);

    // Update table rows
    // This would typically fetch data from backend
}

/**
 * ===============================================
 * SMART FILTER & PRIORITIZATION
 * ===============================================
 */
function initializeSmartFilters() {
    setupFilterConfiguration();
    setupSnoozeOptions();
    loadSavedPresets();
}

function setupFilterConfiguration() {
    // Alert type checkboxes
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateFilterConfiguration);
    });

    // Filter selects
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', updateFilterConfiguration);
    });
}

function updateFilterConfiguration() {
    // Collect filter settings
    const filterSettings = {
        alertTypes: [],
        timeRange: '',
        readStatus: '',
        sender: '',
        status: ''
    };

    // Get checked alert types
    document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(checkbox => {
        filterSettings.alertTypes.push(checkbox.parentElement.textContent.trim());
    });

    // Apply filters
    applySmartFilters(filterSettings);
}

function applySmartFilters(settings) {
    console.log('Applying smart filters:', settings);
    updateAlertsList();
}

function setupSnoozeOptions() {
    document.querySelectorAll('.snooze-btn').forEach(btn => {
        btn.addEventListener('click', handleSnoozeOption);
    });

    // Auto-escalate and follow-up checkboxes
    document.querySelectorAll('.follow-up-settings input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateSnoozeSettings);
    });
}

function handleSnoozeOption(e) {
    const duration = e.target.dataset.duration;

    if (e.target.classList.contains('custom')) {
        // Show custom duration input
        const customDuration = prompt('Enter snooze duration in minutes:');
        if (customDuration && !isNaN(customDuration)) {
            snoozeAlert(parseInt(customDuration));
        }
    } else {
        snoozeAlert(parseInt(duration));
    }
}

function snoozeAlert(minutes) {
    showNotification(`Alert snoozed for ${minutes} minutes`, 'info');

    // Set timeout for snooze
    const snoozeId = Date.now();
    const timeout = setTimeout(() => {
        showSnoozedAlert(snoozeId);
        InboxAlertsState.snoozeTimers.delete(snoozeId);
    }, minutes * 60 * 1000);

    InboxAlertsState.snoozeTimers.set(snoozeId, timeout);
}

function showSnoozedAlert(snoozeId) {
    // Show notification
    showNotification('Snoozed alert is now due!', 'warning');

    // Create new alert
    const alertData = {
        type: 'system',
        title: 'Snoozed Alert',
        message: 'Your snoozed alert is now due for action',
        time: 'Just now'
    };

    const alertElement = createAlertElement(alertData);
    const alertsList = document.querySelector('.alerts-list');
    alertsList.insertBefore(alertElement, alertsList.firstChild);
}

function updateSnoozeSettings() {
    const autoEscalate = document.querySelector('input[type="checkbox"][id*="escalate"]')?.checked;
    const followUp = document.querySelector('input[type="checkbox"][id*="follow"]')?.checked;

    console.log('Snooze settings updated:', { autoEscalate, followUp });
}

function saveFilterPreset() {
    const presetName = prompt('Enter preset name:');
    if (!presetName) return;

    // Collect current filter settings
    const preset = {
        name: presetName,
        filters: collectCurrentFilters(),
        created: new Date().toISOString()
    };

    // Save to localStorage
    const presets = JSON.parse(localStorage.getItem('alertFilterPresets') || '[]');
    presets.push(preset);
    localStorage.setItem('alertFilterPresets', JSON.stringify(presets));

    // Add preset button
    addPresetButton(preset);

    showNotification(`Preset "${presetName}" saved`, 'success');
}

function collectCurrentFilters() {
    return {
        alertTypes: Array.from(document.querySelectorAll('.checkbox-group input:checked')).map(cb => cb.parentElement.textContent.trim()),
        timeRange: document.querySelector('.filter-group select')?.value,
        readStatus: document.querySelector('.filter-group select:nth-of-type(2)')?.value,
        activeFilter: InboxAlertsState.activeFilter
    };
}

function loadSavedPresets() {
    const presets = JSON.parse(localStorage.getItem('alertFilterPresets') || '[]');
    const presetList = document.querySelector('.preset-list');

    presets.forEach(preset => {
        addPresetButton(preset);
    });
}

function addPresetButton(preset) {
    const presetList = document.querySelector('.preset-list');
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = preset.name;
    btn.addEventListener('click', () => applyPreset(preset));
    presetList.appendChild(btn);
}

function applyPreset(preset) {
    // Apply saved filters
    if (preset.filters.alertTypes) {
        document.querySelectorAll('.checkbox-group input').forEach(cb => {
            cb.checked = preset.filters.alertTypes.includes(cb.parentElement.textContent.trim());
        });
    }

    // Apply other filters
    applySmartFilters(preset.filters);

    showNotification(`Applied preset: ${preset.name}`, 'info');
}

/**
 * ===============================================
 * FORM HANDLERS
 * ===============================================
 */
function setupFormHandlers() {
    // New Message Form
    const newMessageForm = document.getElementById('newMessageForm');
    if (newMessageForm) {
        newMessageForm.addEventListener('submit', handleNewMessageSubmit);
    }

    // Broadcast Form
    const broadcastForm = document.getElementById('broadcastForm');
    if (broadcastForm) {
        broadcastForm.addEventListener('submit', handleBroadcastSubmit);
    }

    // Send Actions
    document.querySelector('.btn-preview')?.addEventListener('click', previewMessage);
    document.querySelector('.btn-schedule')?.addEventListener('click', scheduleMessage);
    document.querySelector('.btn-send-now')?.addEventListener('click', sendMessageNow);
}

function handleNewMessageSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const recipient = formData.get('recipient');
    const message = formData.get('message');

    // Send internal message
    sendInternalMessage(recipient, message);

    // Close modal
    closeModal('newMessageModal');

    // Reset form
    e.target.reset();

    showNotification('Message sent successfully', 'success');
}

function handleBroadcastSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const broadcastType = formData.get('broadcastType');
    const subject = formData.get('subject');
    const message = formData.get('message');

    // Submit broadcast for approval
    submitBroadcastForApproval({
        type: broadcastType,
        subject: subject,
        message: message,
        channels: getSelectedChannels()
    });

    // Close modal
    closeModal('broadcastModal');

    // Reset form
    e.target.reset();

    showNotification('Broadcast submitted for owner approval', 'info');
}

function sendInternalMessage(recipient, message) {
    console.log(`Sending message to ${recipient}: ${message}`);

    // Add to chat history
    // Send via WebSocket
    if (InboxAlertsState.ws && InboxAlertsState.ws.readyState === WebSocket.OPEN) {
        InboxAlertsState.ws.send(JSON.stringify({
            type: 'internal_message',
            recipient: recipient,
            message: message,
            timestamp: new Date().toISOString()
        }));
    }
}

function submitBroadcastForApproval(broadcastData) {
    console.log('Submitting broadcast for approval:', broadcastData);

    // Send to backend for owner approval
    // This would typically be an API call
}

function getSelectedChannels() {
    const channels = [];
    document.querySelectorAll('.send-channels input:checked').forEach(checkbox => {
        channels.push(checkbox.parentElement.textContent.trim());
    });
    return channels;
}

function previewMessage() {
    const messageText = document.querySelector('.form-textarea').value;
    const recipients = document.querySelectorAll('.recipient-chip');

    if (!messageText || recipients.length === 0) {
        showNotification('Please enter a message and select recipients', 'warning');
        return;
    }

    // Show preview modal
    alert(`Preview:\\n\\nTo: ${recipients.length} recipients\\n\\nMessage:\\n${messageText}`);
}

function scheduleMessage() {
    const scheduleTime = prompt('Enter schedule time (HH:MM):');
    if (!scheduleTime) return;

    const messageText = document.querySelector('.form-textarea').value;
    const recipients = document.querySelectorAll('.recipient-chip');

    if (!messageText || recipients.length === 0) {
        showNotification('Please enter a message and select recipients', 'warning');
        return;
    }

    showNotification(`Message scheduled for ${scheduleTime}`, 'success');

    // Add to scheduled messages
    // This would typically be an API call
}

function sendMessageNow() {
    const messageText = document.querySelector('.form-textarea').value;
    const recipients = document.querySelectorAll('.recipient-chip');
    const channel = document.querySelector('.send-option.active').dataset.channel;

    if (!messageText || recipients.length === 0) {
        showNotification('Please enter a message and select recipients', 'warning');
        return;
    }

    // Show sending progress
    showNotification('Sending messages...', 'info');

    // Simulate sending
    setTimeout(() => {
        // Update recent sent list
        updateRecentSentList({
            channel: channel,
            recipientCount: recipients.length,
            time: getCurrentTime(),
            status: { delivered: recipients.length - 1, failed: 1 }
        });

        showNotification(`Messages sent to ${recipients.length} recipients`, 'success');

        // Clear form
        document.querySelector('.form-textarea').value = '';
        document.querySelector('.selected-recipients').innerHTML = '';
    }, 2000);
}

function updateRecentSentList(sentData) {
    const sentList = document.querySelector('.sent-list');

    const sentItem = document.createElement('div');
    sentItem.className = 'sent-item';
    sentItem.innerHTML = `
        <div class="sent-info">
            <span class="sent-type">
                <i class="fas fa-${getChannelIcon(sentData.channel)}"></i> ${sentData.channel.toUpperCase()}
            </span>
            <span class="sent-recipients">To: ${sentData.recipientCount} patients</span>
            <span class="sent-time">${sentData.time}</span>
        </div>
        <div class="sent-status">
            <span class="status-success">
                <i class="fas fa-check"></i> ${sentData.status.delivered} Delivered
            </span>
            ${sentData.status.failed > 0 ? `
                <span class="status-failed">
                    <i class="fas fa-times"></i> ${sentData.status.failed} Failed
                </span>
            ` : ''}
        </div>
    `;

    sentList.insertBefore(sentItem, sentList.firstChild);

    // Remove old items if list is too long
    while (sentList.children.length > 5) {
        sentList.removeChild(sentList.lastChild);
    }
}

function getChannelIcon(channel) {
    const icons = {
        'sms': 'sms',
        'whatsapp': 'whatsapp',
        'email': 'envelope'
    };
    return icons[channel] || 'paper-plane';
}

/**
 * ===============================================
 * WEBSOCKET CONNECTION
 * ===============================================
 */
function initializeWebSocket() {
    // Initialize WebSocket connection for real-time updates
    try {
        InboxAlertsState.ws = new WebSocket('ws://localhost:8080/inbox-alerts');

        InboxAlertsState.ws.onopen = function () {
            console.log('WebSocket connected');
        };

        InboxAlertsState.ws.onmessage = function (event) {
            handleWebSocketMessage(JSON.parse(event.data));
        };

        InboxAlertsState.ws.onerror = function (error) {
            console.error('WebSocket error:', error);
        };

        InboxAlertsState.ws.onclose = function () {
            console.log('WebSocket disconnected');
            // Attempt reconnection after 5 seconds
            setTimeout(initializeWebSocket, 5000);
        };
    } catch (error) {
        console.log('WebSocket not available, using polling instead');
        startPolling();
    }
}

function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'new_alert':
            handleNewAlert(data);
            break;
        case 'new_message':
            handleNewMessage(data);
            break;
        case 'typing':
            handleTypingStatus(data);
            break;
        case 'read_receipt':
            handleReadReceipt(data);
            break;
        case 'notification_status':
            handleNotificationStatus(data);
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

function handleNewAlert(data) {
    // Create and add new alert
    const alertElement = createAlertElement(data.alert);
    const alertsList = document.querySelector('.alerts-list');
    alertsList.insertBefore(alertElement, alertsList.firstChild);

    // Update unread count
    InboxAlertsState.unreadCount++;
    updateNotificationBadge(InboxAlertsState.unreadCount);

    // Show notification
    showNotification(`New alert: ${data.alert.title}`, 'info');

    // Play sound if emergency
    if (data.alert.type === 'emergency') {
        playAlertSound();
    }
}

function handleNewMessage(data) {
    // Check if message is for current thread
    if (InboxAlertsState.activeThread?.querySelector('.thread-name').textContent === data.sender) {
        // Add message to chat window
        const messagesArea = document.querySelector('.messages-area');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message received';
        messageDiv.innerHTML = `
            <img src="profile-icon.png" alt="Sender" class="message-avatar">
            <div class="message-content">
                <p class="message-text">${escapeHtml(data.message)}</p>
                <span class="message-time">${formatTime(data.timestamp)}</span>
            </div>
        `;

        const typingIndicator = document.querySelector('.typing-indicator');
        messagesArea.insertBefore(messageDiv, typingIndicator);

        // Scroll to bottom
        messagesArea.scrollTop = messagesArea.scrollHeight;
    } else {
        // Update thread list
        updateThreadList(data.sender, data.message);
    }
}

function handleTypingStatus(data) {
    if (data.thread === InboxAlertsState.activeThread?.querySelector('.thread-name').textContent) {
        if (data.isTyping) {
            showTypingIndicator();
        } else {
            hideTypingIndicator();
        }
    }
}

function handleReadReceipt(data) {
    // Update message read status
    const messages = document.querySelectorAll('.message.sent');
    messages.forEach(msg => {
        const messageTime = msg.querySelector('.message-time').textContent;
        if (messageTime.includes(data.timestamp)) {
            const checkIcon = msg.querySelector('.fa-check');
            if (checkIcon) {
                checkIcon.className = 'fas fa-check-double read';
            }
        }
    });
}

function handleNotificationStatus(data) {
    // Update notification delivery status
    console.log('Notification status:', data);
}

/**
 * ===============================================
 * REAL-TIME UPDATES & POLLING
 * ===============================================
 */
function startRealTimeUpdates() {
    // Update every 30 seconds
    setInterval(() => {
        checkForNewAlerts();
        updateOnlineStatuses();
        updateThreadTimes();
    }, 30000);
}

function startPolling() {
    // Fallback polling mechanism if WebSocket fails
    setInterval(() => {
        fetchNewAlerts();
        fetchNewMessages();
    }, 5000);
}

function checkForNewAlerts() {
    // Check for new alerts
    // This would typically be an API call
    console.log('Checking for new alerts...');
}

function updateOnlineStatuses() {
    // Update online status indicators
    document.querySelectorAll('.online-status').forEach(status => {
        // Randomly update for demo
        const random = Math.random();
        status.classList.remove('online', 'away', 'offline');

        if (random < 0.5) {
            status.classList.add('online');
        } else if (random < 0.8) {
            status.classList.add('away');
        } else {
            status.classList.add('offline');
        }
    });
}

function updateThreadTimes() {
    // Update thread timestamps
    document.querySelectorAll('.thread-time').forEach(time => {
        const currentText = time.textContent;
        if (currentText === 'Just now') {
            time.textContent = '1 min';
        } else if (currentText.includes('min')) {
            const minutes = parseInt(currentText);
            if (minutes < 59) {
                time.textContent = `${minutes + 1} min`;
            } else {
                time.textContent = '1 hour';
            }
        }
    });
}

function fetchNewAlerts() {
    // Fetch new alerts from server
    // This would be an API call
}

function fetchNewMessages() {
    // Fetch new messages from server
    // This would be an API call
}

/**
 * ===============================================
 * DATA LOADING
 * ===============================================
 */
function loadInitialData() {
    loadAlerts();
    loadMessages();
    loadNotifications();
    loadHistoryData();
}

function loadAlerts() {
    // Store alert elements for filtering
    InboxAlertsState.alerts = Array.from(document.querySelectorAll('.alert-item'));
}

function loadMessages() {
    // Load message threads
    console.log('Loading message threads...');
}

function loadNotifications() {
    // Load recent notifications
    console.log('Loading notifications...');
}

function loadHistoryData() {
    // Load history table data
    console.log('Loading history data...');
}

function loadMessageTemplates() {
    // Load saved message templates
    const templates = localStorage.getItem('messageTemplates');
    if (templates) {
        console.log('Loading saved templates...');
    }
}

/**
 * ===============================================
 * UTILITY FUNCTIONS
 * ===============================================
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function toggleProfilePopup(e) {
    e.stopPropagation();
    const profilePopup = document.getElementById('profilePopup');
    profilePopup.classList.toggle('active');

    // Close on outside click
    document.addEventListener('click', function closePopup(e) {
        if (!profilePopup.contains(e.target)) {
            profilePopup.classList.remove('active');
            document.removeEventListener('click', closePopup);
        }
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');

    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);

    const icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleFilterPanel() {
    const filterPanel = document.querySelector('.alert-filters');
    if (filterPanel) {
        filterPanel.style.display = filterPanel.style.display === 'none' ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${getNotificationColor(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'times-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#10B981',
        'error': '#EF4444',
        'warning': '#F59E0B',
        'info': '#3B82F6'
    };
    return colors[type] || '#3B82F6';
}

function updateNotificationBadge(count) {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

function updateUnreadCount() {
    const unreadAlerts = document.querySelectorAll('.alert-item.unread').length;
    InboxAlertsState.unreadCount = unreadAlerts;
    updateNotificationBadge(unreadAlerts);
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function playAlertSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi');
    audio.play().catch(e => console.log('Could not play alert sound'));
}

function updateThreadList(sender, message) {
    const thread = Array.from(document.querySelectorAll('.thread-item')).find(t =>
        t.querySelector('.thread-name').textContent === sender
    );

    if (thread) {
        thread.classList.add('unread');
        thread.querySelector('.thread-preview').textContent = message;
        thread.querySelector('.thread-time').textContent = 'Just now';

        // Add unread count
        let unreadCount = thread.querySelector('.unread-count');
        if (!unreadCount) {
            unreadCount = document.createElement('span');
            unreadCount.className = 'unread-count';
            thread.querySelector('.thread-info').appendChild(unreadCount);
        }

        const currentCount = parseInt(unreadCount.textContent || '0');
        unreadCount.textContent = currentCount + 1;
    }
}

/**
 * ===============================================
 * QUICK ACTIONS
 * ===============================================
 */
function openNotifyPatientsModal() {
    // Open notification panel with pre-selected recipients
    const notificationPanel = document.querySelector('.patient-notifications');
    if (notificationPanel) {
        notificationPanel.scrollIntoView({ behavior: 'smooth' });

        // Highlight panel
        notificationPanel.style.boxShadow = '0 0 20px rgba(0, 191, 165, 0.5)';
        setTimeout(() => {
            notificationPanel.style.boxShadow = '';
        }, 2000);
    }
}

function initiatePatientContact(patientName) {
    console.log(`Initiating contact with ${patientName}`);

    // Open messaging with patient pre-selected
    const recipientInput = document.querySelector('.recipient-selector input');
    if (recipientInput) {
        recipientInput.value = patientName;
        recipientInput.focus();
    }
}

function notifyDoctor(alertElement) {
    const message = alertElement.querySelector('.alert-message').textContent;

    // Send notification to doctor
    showNotification('Doctor notified', 'success');

    // Update alert status
    const alertContent = alertElement.querySelector('.alert-content');
    const statusNote = document.createElement('p');
    statusNote.style.cssText = 'font-size: 12px; color: #10B981; margin-top: 8px;';
    statusNote.textContent = `✓ Doctor notified at ${getCurrentTime()}`;
    alertContent.appendChild(statusNote);
}

function sendAppointmentConfirmation(alertElement) {
    const message = alertElement.querySelector('.alert-message').textContent;

    // Extract patient name from message
    const patientMatch = message.match(/([A-Za-z]+ [A-Za-z]+) for/);
    const patientName = patientMatch ? patientMatch[1] : 'Patient';

    // Send confirmation
    showNotification(`Confirmation sent to ${patientName}`, 'success');

    // Update alert
    const btn = alertElement.querySelector('.btn-action.confirm');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> Sent';
        btn.disabled = true;
        btn.style.opacity = '0.6';
    }
}

function openTimeSlot(alertElement) {
    const message = alertElement.querySelector('.alert-message').textContent;

    // Extract time from message
    const timeMatch = message.match(/(\d{1,2}:\d{2} [AP]M)/);
    const time = timeMatch ? timeMatch[1] : '';

    showNotification(`Time slot ${time} is now available`, 'info');

    // Navigate to appointments page
    setTimeout(() => {
        window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Appointments\\appointments.html#available-slots';
    }, 1500);
}

/**
 * ===============================================
 * CSS ANIMATION STYLES
 * ===============================================
 */
const style = document.createElement('style');
style.textContent = `
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
    
    @keyframes slideOut {
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

// Initialize dark mode if saved
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    const icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        icon.className = 'fas fa-sun';
    }
}

console.log('Curis Inbox & Alerts JavaScript loaded successfully');
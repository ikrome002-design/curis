/**
 * ===============================================
 * CURIS QUEUE & FLOW JAVASCRIPT
 * Patient Flow Management System
 * Version: 1.0.0
 * ===============================================
 */

// Global State Management
const QueueFlowState = {
    queues: {
        'dr-ochieng': [],
        'dr-kamau': [],
        'dr-mutua': []
    },
    timers: new Map(),
    doctorStatus: new Map(),
    currentFilter: 'all',
    draggedElement: null,
    selectedPatients: new Set(),
    waitTimeThreshold: 30, // minutes
    analytics: {
        averageWaitTime: 25,
        totalInQueue: 18,
        seenToday: 24,
        flowEfficiency: 85
    },
    auditLog: [],
    websocket: null,
    autoRefreshInterval: null
};

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function() {
    initializeQueueFlow();
    setupEventListeners();
    loadInitialData();
    startTimers();
    initializeWebSocket();
    startAutoRefresh();
    initializeCharts();
});

/**
 * ===============================================
 * INITIALIZATION FUNCTIONS
 * ===============================================
 */
function initializeQueueFlow() {
    // Initialize doctor statuses
    initializeDoctorStatus();
    
    // Initialize queue display
    initializeQueueDisplay();
    
    // Initialize drag and drop
    initializeDragAndDrop();
    
    // Initialize analytics
    initializeAnalytics();
    
    // Initialize notification system
    initializeNotifications();
    
    // Load saved preferences
    loadPreferences();
    
    console.log('Queue & Flow system initialized successfully');
}

function initializeDoctorStatus() {
    // Set initial doctor statuses
    QueueFlowState.doctorStatus.set('dr-ochieng', {
        status: 'available',
        currentPatient: 'John Kimani',
        room: 'Room 101',
        queueCount: 5,
        estimatedFinish: '3:45 PM',
        consultationTime: 15
    });
    
    QueueFlowState.doctorStatus.set('dr-kamau', {
        status: 'consulting',
        currentPatient: 'Grace Muthoni',
        room: 'Room 102',
        queueCount: 8,
        estimatedFinish: '3:30 PM',
        consultationTime: 8
    });
    
    QueueFlowState.doctorStatus.set('dr-mutua', {
        status: 'on-break',
        currentPatient: null,
        room: 'Room 103',
        queueCount: 5,
        resumeTime: '3:00 PM',
        breakTimeRemaining: 10
    });
    
    updateDoctorStatusDisplay();
}

function setupEventListeners() {
    // Queue Filter
    const doctorQueueFilter = document.getElementById('doctorQueueFilter');
    if (doctorQueueFilter) {
        doctorQueueFilter.addEventListener('change', handleQueueFilter);
    }
    
    // View Mode Toggle
    const viewModeBtn = document.getElementById('viewModeBtn');
    if (viewModeBtn) {
        viewModeBtn.addEventListener('click', toggleViewMode);
    }
    
    // Refresh Status Button
    const refreshStatusBtn = document.getElementById('refreshStatusBtn');
    if (refreshStatusBtn) {
        refreshStatusBtn.addEventListener('click', refreshDoctorStatus);
    }
    
    // Control Buttons
    setupControlButtons();
    
    // Quick Actions
    setupQuickActions();
    
    // Modal Triggers
    setupModalTriggers();
    
    // Profile Toggle
    const userProfile = document.getElementById('userProfile');
    if (userProfile) {
        userProfile.addEventListener('click', toggleProfilePopup);
    }
    
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Patient Card Actions
    setupPatientCardActions();
    
    // Timer Controls
    setupTimerControls();
    
    // Notification Templates
    setupNotificationTemplates();
    
    // Export Analytics
    const exportAnalyticsBtn = document.getElementById('exportAnalyticsBtn');
    if (exportAnalyticsBtn) {
        exportAnalyticsBtn.addEventListener('click', exportAnalytics);
    }
    
    // Audit Log Filter
    const filterAuditBtn = document.getElementById('filterAuditBtn');
    if (filterAuditBtn) {
        filterAuditBtn.addEventListener('click', filterAuditLog);
    }
    
    // Multi-Queue View Toggle
    const toggleQueueViewBtn = document.getElementById('toggleQueueViewBtn');
    if (toggleQueueViewBtn) {
        toggleQueueViewBtn.addEventListener('click', toggleMultiQueueView);
    }
}

/**
 * ===============================================
 * QUEUE DISPLAY & MANAGEMENT
 * ===============================================
 */
function initializeQueueDisplay() {
    const queueList = document.getElementById('queueList');
    if (!queueList) return;
    
    // Load queue data
    loadQueueData();
    
    // Apply initial filter
    applyQueueFilter('all');
    
    // Update statistics
    updateQueueStatistics();
}

function loadQueueData() {
    // Simulate loading queue data
    const patients = [
        {
            id: 'PAT001',
            name: 'John Kimani',
            position: 1,
            status: 'being-seen',
            appointmentType: 'Consultation',
            checkInTime: '2:30 PM',
            waitTime: 15,
            doctor: 'dr-ochieng',
            room: 'Room 101'
        },
        {
            id: 'PAT002',
            name: 'Grace Muthoni',
            position: 2,
            status: 'checked-in',
            appointmentType: 'Follow-up',
            checkInTime: '2:15 PM',
            waitTime: 8,
            doctor: 'dr-kamau',
            room: 'Room 102'
        },
        {
            id: 'PAT003',
            name: 'Peter Wachira',
            position: 3,
            status: 'delayed',
            appointmentType: 'Consultation',
            checkInTime: '2:00 PM',
            waitTime: 45,
            doctor: 'dr-ochieng',
            room: 'Waiting Area'
        },
        {
            id: 'PAT004',
            name: 'Alice Wanjiku',
            position: 4,
            status: 'overdue',
            appointmentType: 'Check-up',
            checkInTime: '1:30 PM',
            waitTime: 75,
            doctor: 'dr-kamau',
            room: 'Waiting Area'
        },
        {
            id: 'PAT005',
            name: 'David Maina',
            position: 5,
            status: 'checked-in',
            appointmentType: 'Lab Results',
            checkInTime: '2:45 PM',
            waitTime: 12,
            doctor: 'dr-mutua',
            room: 'Waiting Area'
        }
    ];
    
    // Distribute patients to doctor queues
    patients.forEach(patient => {
        if (!QueueFlowState.queues[patient.doctor]) {
            QueueFlowState.queues[patient.doctor] = [];
        }
        QueueFlowState.queues[patient.doctor].push(patient);
        
        // Start timer for patient
        startPatientTimer(patient);
    });
}

function handleQueueFilter(e) {
    const filter = e.target.value;
    QueueFlowState.currentFilter = filter;
    applyQueueFilter(filter);
}

function applyQueueFilter(filter) {
    const queueList = document.getElementById('queueList');
    const patientCards = queueList.querySelectorAll('.patient-queue-card');
    
    patientCards.forEach(card => {
        const doctor = card.dataset.doctor;
        
        if (filter === 'all' || doctor === filter) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    
    updateQueueStatistics();
}

function updateQueueStatistics() {
    // Calculate statistics
    let totalInQueue = 0;
    let overdueCount = 0;
    let totalWaitTime = 0;
    let patientCount = 0;
    
    Object.values(QueueFlowState.queues).forEach(queue => {
        queue.forEach(patient => {
            totalInQueue++;
            totalWaitTime += patient.waitTime;
            patientCount++;
            
            if (patient.waitTime > QueueFlowState.waitTimeThreshold * 2) {
                overdueCount++;
            }
        });
    });
    
    const avgWaitTime = patientCount > 0 ? Math.round(totalWaitTime / patientCount) : 0;
    
    // Update UI
    updateStatCard('total-queue', totalInQueue);
    updateStatCard('avg-wait', `${avgWaitTime} min`);
    updateStatCard('overdue', overdueCount);
    updateStatCard('seen-today', QueueFlowState.analytics.seenToday);
}

function updateStatCard(type, value) {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        const label = card.querySelector('.stat-label').textContent.toLowerCase();
        if ((type === 'total-queue' && label.includes('queue')) ||
            (type === 'avg-wait' && label.includes('wait')) ||
            (type === 'overdue' && label.includes('overdue')) ||
            (type === 'seen-today' && label.includes('seen'))) {
            card.querySelector('.stat-value').textContent = value;
        }
    });
}

/**
 * ===============================================
 * DRAG AND DROP FUNCTIONALITY
 * ===============================================
 */
function initializeDragAndDrop() {
    // Patient queue cards
    const patientCards = document.querySelectorAll('.patient-queue-card');
    patientCards.forEach(card => {
        setupDragAndDrop(card);
    });
    
    // Mini patient cards in multi-doctor view
    const miniCards = document.querySelectorAll('.mini-patient-card');
    miniCards.forEach(card => {
        setupDragAndDrop(card);
    });
    
    // Reorder items in modal
    const reorderItems = document.querySelectorAll('.reorder-item');
    reorderItems.forEach(item => {
        setupDragAndDrop(item);
    });
    
    // Setup drop zones
    setupDropZones();
}

function setupDragAndDrop(element) {
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('drop', handleDrop);
    element.addEventListener('dragenter', handleDragEnter);
    element.addEventListener('dragleave', handleDragLeave);
}

function handleDragStart(e) {
    QueueFlowState.draggedElement = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    
    // Remove drag-over class from all elements
    document.querySelectorAll('.drag-over').forEach(element => {
        element.classList.remove('drag-over');
    });
    
    QueueFlowState.draggedElement = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    const afterElement = getDragAfterElement(e.currentTarget.parentElement, e.clientY);
    if (afterElement == null) {
        e.currentTarget.parentElement.appendChild(QueueFlowState.draggedElement);
    } else {
        e.currentTarget.parentElement.insertBefore(QueueFlowState.draggedElement, afterElement);
    }
    
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    // Log the queue reorder action
    const patientName = QueueFlowState.draggedElement.querySelector('.patient-info h4')?.textContent ||
                       QueueFlowState.draggedElement.querySelector('.name')?.textContent;
    
    logAuditAction({
        action: 'Queue Reorder',
        patient: patientName,
        details: 'Queue position changed',
        reason: 'Manual reorder'
    });
    
    // Update queue positions
    updateQueuePositions();
    
    return false;
}

function handleDragEnter(e) {
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.patient-queue-card:not(.dragging),.mini-patient-card:not(.dragging),.reorder-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function setupDropZones() {
    // Queue list drop zone
    const queueList = document.getElementById('queueList');
    if (queueList) {
        queueList.addEventListener('dragover', handleDropZoneOver);
        queueList.addEventListener('drop', handleDropZoneDrop);
    }
    
    // Multi-doctor queue drop zones
    const queueItems = document.querySelectorAll('.queue-items');
    queueItems.forEach(zone => {
        zone.addEventListener('dragover', handleDropZoneOver);
        zone.addEventListener('drop', handleDropZoneDrop);
    });
}

function handleDropZoneOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDropZoneDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    // Handle doctor reassignment if dropped in different queue
    const newDoctor = e.currentTarget.dataset.doctor;
    if (newDoctor && QueueFlowState.draggedElement) {
        reassignPatientToDoctor(QueueFlowState.draggedElement, newDoctor);
    }
}

function updateQueuePositions() {
    const queueList = document.getElementById('queueList');
    const cards = queueList.querySelectorAll('.patient-queue-card');
    
    cards.forEach((card, index) => {
        const positionElement = card.querySelector('.queue-position');
        if (positionElement) {
            positionElement.textContent = index + 1;
        }
    });
    
    // Update multi-doctor view positions
    updateMultiDoctorQueuePositions();
}

function updateMultiDoctorQueuePositions() {
    const queueColumns = document.querySelectorAll('.queue-items');
    
    queueColumns.forEach(column => {
        const cards = column.querySelectorAll('.mini-patient-card');
        cards.forEach((card, index) => {
            const positionElement = card.querySelector('.position');
            if (positionElement) {
                positionElement.textContent = index + 1;
            }
        });
    });
}

/**
 * ===============================================
 * DOCTOR STATUS MANAGEMENT
 * ===============================================
 */
function updateDoctorStatusDisplay() {
    QueueFlowState.doctorStatus.forEach((status, doctorId) => {
        updateDoctorCard(doctorId, status);
    });
}

function updateDoctorCard(doctorId, status) {
    const doctorCards = document.querySelectorAll('.doctor-card');
    
    doctorCards.forEach(card => {
        const doctorName = card.querySelector('.doctor-info h3').textContent;
        
        if (doctorName.toLowerCase().includes(doctorId.replace('dr-', ''))) {
            // Update status indicator
            const statusIndicator = card.querySelector('.status-indicator');
            statusIndicator.className = `status-indicator ${getStatusClass(status.status)}`;
            
            // Update status text
            const statusValue = card.querySelector('.status-available, .status-consulting, .status-break');
            if (statusValue) {
                statusValue.className = `value status-${status.status.replace('-', '')}`;
                statusValue.innerHTML = `<i class="fas fa-circle"></i> ${formatStatus(status.status)}`;
            }
            
            // Update current patient
            if (status.currentPatient) {
                updateCardDetail(card, 'Current:', `${status.currentPatient} (${status.consultationTime} min)`);
            }
            
            // Update queue count
            updateCardDetail(card, 'Queue:', `${status.queueCount} patients`);
            
            // Update room
            updateCardDetail(card, 'Room:', status.room);
            
            // Update estimated finish or resume time
            if (status.estimatedFinish) {
                updateCardDetail(card, 'Est. Finish:', status.estimatedFinish);
            } else if (status.resumeTime) {
                updateCardDetail(card, 'Resume:', status.resumeTime);
                updateCardDetail(card, 'Break Time:', `${status.breakTimeRemaining} min remaining`);
            }
        }
    });
}

function getStatusClass(status) {
    const statusMap = {
        'available': 'online',
        'consulting': 'busy',
        'on-break': 'away'
    };
    return statusMap[status] || 'offline';
}

function formatStatus(status) {
    const statusMap = {
        'available': 'Available',
        'consulting': 'Consulting',
        'on-break': 'On Break',
        'unavailable': 'Unavailable'
    };
    return statusMap[status] || status;
}

function updateCardDetail(card, label, value) {
    const detailRows = card.querySelectorAll('.detail-row');
    detailRows.forEach(row => {
        const rowLabel = row.querySelector('.label').textContent;
        if (rowLabel === label) {
            row.querySelector('.value').textContent = value;
        }
    });
}

function refreshDoctorStatus() {
    const refreshBtn = document.getElementById('refreshStatusBtn');
    
    // Add spinning animation
    refreshBtn.querySelector('i').classList.add('fa-spin');
    
    // Simulate refresh
    setTimeout(() => {
        // Update doctor statuses
        updateDoctorStatuses();
        
        // Remove spinning animation
        refreshBtn.querySelector('i').classList.remove('fa-spin');
        
        showNotification('Doctor status refreshed', 'success');
    }, 1000);
}

function updateDoctorStatuses() {
    // Simulate status updates
    const statuses = ['available', 'consulting', 'on-break'];
    
    QueueFlowState.doctorStatus.forEach((status, doctorId) => {
        // Randomly update some values
        if (Math.random() > 0.5) {
            status.queueCount = Math.floor(Math.random() * 10) + 1;
        }
        
        // Update consultation time
        if (status.consultationTime) {
            status.consultationTime = Math.max(0, status.consultationTime - 1);
        }
        
        // Update break time
        if (status.breakTimeRemaining) {
            status.breakTimeRemaining = Math.max(0, status.breakTimeRemaining - 1);
            
            if (status.breakTimeRemaining === 0) {
                status.status = 'available';
                delete status.breakTimeRemaining;
                delete status.resumeTime;
            }
        }
    });
    
    updateDoctorStatusDisplay();
}

/**
 * ===============================================
 * TIMER MANAGEMENT
 * ===============================================
 */
function startTimers() {
    // Start individual patient timers
    QueueFlowState.timerInterval = setInterval(() => {
        updateAllTimers();
    }, 1000);
}

function startPatientTimer(patient) {
    const timerId = `timer-${patient.id}`;
    
    QueueFlowState.timers.set(timerId, {
        patientId: patient.id,
        patientName: patient.name,
        startTime: new Date(),
        waitTime: patient.waitTime * 60, // Convert to seconds
        status: patient.status
    });
}

function updateAllTimers() {
    QueueFlowState.timers.forEach((timer, timerId) => {
        timer.waitTime++;
        
        // Update timer display
        updateTimerDisplay(timer);
        
        // Check for excessive wait time
        checkWaitTimeAlert(timer);
    });
    
    // Update average wait time
    updateAverageWaitTime();
}

function updateTimerDisplay(timer) {
    const timerCards = document.querySelectorAll('.timer-card');
    
    timerCards.forEach(card => {
        const patientName = card.querySelector('.timer-name').textContent;
        
        if (patientName === timer.patientName) {
            const timerValue = card.querySelector('.timer-value');
            timerValue.textContent = formatTime(timer.waitTime);
            
            // Update timer card class based on wait time
            card.className = 'timer-card';
            
            if (timer.waitTime > QueueFlowState.waitTimeThreshold * 120) { // > 60 min
                card.classList.add('danger');
            } else if (timer.waitTime > QueueFlowState.waitTimeThreshold * 60) { // > 30 min
                card.classList.add('warning');
            } else {
                card.classList.add('normal');
            }
        }
    });
    
    // Update patient card wait times
    updatePatientCardWaitTimes(timer);
}

function updatePatientCardWaitTimes(timer) {
    const patientCards = document.querySelectorAll('.patient-queue-card');
    
    patientCards.forEach(card => {
        const patientName = card.querySelector('.patient-info h4').textContent;
        
        if (patientName === timer.patientName) {
            const waitTimeElement = card.querySelector('.wait-time');
            if (waitTimeElement) {
                const minutes = Math.floor(timer.waitTime / 60);
                waitTimeElement.textContent = `Wait: ${minutes} min`;
                
                // Update wait time class
                waitTimeElement.className = 'wait-time';
                
                if (minutes > QueueFlowState.waitTimeThreshold * 2) {
                    waitTimeElement.classList.add('danger');
                } else if (minutes > QueueFlowState.waitTimeThreshold) {
                    waitTimeElement.classList.add('warning');
                }
            }
        }
    });
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function checkWaitTimeAlert(timer) {
    const minutes = Math.floor(timer.waitTime / 60);
    
    // Check if exceeded threshold and not already alerted
    if (minutes === QueueFlowState.waitTimeThreshold && !timer.alerted30) {
        timer.alerted30 = true;
        showWaitTimeAlert(timer, 'warning', minutes);
    } else if (minutes === QueueFlowState.waitTimeThreshold * 2 && !timer.alerted60) {
        timer.alerted60 = true;
        showWaitTimeAlert(timer, 'danger', minutes);
    }
}

function showWaitTimeAlert(timer, severity, minutes) {
    // Show notification
    showNotification(`${timer.patientName} has been waiting for ${minutes} minutes`, severity);
    
    // Update notification badge
    incrementNotificationBadge();
    
    // Log to audit
    logAuditAction({
        action: 'Wait Time Alert',
        patient: timer.patientName,
        details: `Excessive wait time: ${minutes} minutes`,
        reason: 'Automatic alert'
    });
    
    // Show alert modal if severe
    if (severity === 'danger') {
        showWaitAlertModal(timer);
    }
}

function showWaitAlertModal(timer) {
    const modal = document.getElementById('waitAlertModal');
    
    // Update modal content
    const patientName = modal.querySelector('.alert-details h4');
    const waitInfo = modal.querySelector('.wait-info strong');
    
    if (patientName) {
        patientName.textContent = timer.patientName;
    }
    
    if (waitInfo) {
        waitInfo.textContent = `${Math.floor(timer.waitTime / 60)} minutes`;
    }
    
    // Show modal
    modal.classList.add('active');
}

function updateAverageWaitTime() {
    let totalWait = 0;
    let count = 0;
    
    QueueFlowState.timers.forEach(timer => {
        if (timer.status !== 'complete') {
            totalWait += timer.waitTime;
            count++;
        }
    });
    
    if (count > 0) {
        const avgMinutes = Math.floor(totalWait / count / 60);
        updateStatCard('avg-wait', `${avgMinutes} min`);
        
        // Update analytics
        QueueFlowState.analytics.averageWaitTime = avgMinutes;
    }
}

/**
 * ===============================================
 * CONTROL BUTTONS & ACTIONS
 * ===============================================
 */
function setupControlButtons() {
    // Reorder Queue
    const reorderQueueBtn = document.getElementById('reorderQueueBtn');
    if (reorderQueueBtn) {
        reorderQueueBtn.addEventListener('click', () => openModal('reorderQueueModal'));
    }
    
    // Mark Status
    const markStatusBtn = document.getElementById('markStatusBtn');
    if (markStatusBtn) {
        markStatusBtn.addEventListener('click', () => openModal('markStatusModal'));
    }
    
    // Reassign Doctor
    const reassignDoctorBtn = document.getElementById('reassignDoctorBtn');
    if (reassignDoctorBtn) {
        reassignDoctorBtn.addEventListener('click', () => openModal('reassignDoctorModal'));
    }
    
    // Priority Override
    const priorityOverrideBtn = document.getElementById('priorityOverrideBtn');
    if (priorityOverrideBtn) {
        priorityOverrideBtn.addEventListener('click', handlePriorityOverride);
    }
    
    // Merge/Split Queues
    const mergeQueuesBtn = document.getElementById('mergeQueuesBtn');
    if (mergeQueuesBtn) {
        mergeQueuesBtn.addEventListener('click', () => openModal('mergeSplitModal'));
    }
    
    // Bulk Actions
    const bulkActionsBtn = document.getElementById('bulkActionsBtn');
    if (bulkActionsBtn) {
        bulkActionsBtn.addEventListener('click', handleBulkActions);
    }
}

function setupQuickActions() {
    const quickActions = document.querySelectorAll('.quick-action');
    
    quickActions.forEach(action => {
        action.addEventListener('click', function() {
            const actionText = this.textContent.trim();
            
            switch(actionText) {
                case "Send 'You're Next'":
                    sendYoureNextNotification();
                    break;
                case 'Move to Doctor':
                    movePatientToDoctor();
                    break;
                case 'Mark Complete':
                    markPatientComplete();
                    break;
                case 'Print Queue List':
                    printQueueList();
                    break;
            }
        });
    });
}

function setupModalTriggers() {
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // Form submissions
    setupFormSubmissions();
    
    // Tab switching in merge/split modal
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
}

function setupFormSubmissions() {
    // Mark Status Form
    const markStatusForm = document.getElementById('markStatusForm');
    if (markStatusForm) {
        markStatusForm.addEventListener('submit', handleMarkStatusSubmit);
    }
    
    // Reassign Doctor Form
    const reassignDoctorForm = document.getElementById('reassignDoctorForm');
    if (reassignDoctorForm) {
        reassignDoctorForm.addEventListener('submit', handleReassignDoctorSubmit);
    }
}

function handlePriorityOverride() {
    if (QueueFlowState.selectedPatients.size === 0) {
        showNotification('Please select a patient first', 'warning');
        return;
    }
    
    // Move selected patients to top of queue
    QueueFlowState.selectedPatients.forEach(patientId => {
        movePatientToTop(patientId);
    });
    
    showNotification('Priority override applied', 'success');
    
    // Clear selection
    QueueFlowState.selectedPatients.clear();
}

function handleBulkActions() {
    if (QueueFlowState.selectedPatients.size === 0) {
        showNotification('Please select patients for bulk action', 'warning');
        return;
    }
    
    const actionType = prompt('Enter bulk action (complete/defer/reassign):');
    
    if (actionType) {
        performBulkAction(actionType);
    }
}

function performBulkAction(actionType) {
    QueueFlowState.selectedPatients.forEach(patientId => {
        switch(actionType.toLowerCase()) {
            case 'complete':
                markPatientStatus(patientId, 'complete');
                break;
            case 'defer':
                markPatientStatus(patientId, 'deferred');
                break;
            case 'reassign':
                // Open reassign modal for bulk reassign
                openModal('reassignDoctorModal');
                break;
        }
    });
    
    showNotification(`Bulk action '${actionType}' applied to ${QueueFlowState.selectedPatients.size} patients`, 'success');
    
    // Clear selection
    QueueFlowState.selectedPatients.clear();
}

/**
 * ===============================================
 * PATIENT CARD ACTIONS
 * ===============================================
 */
function setupPatientCardActions() {
    const actionBtns = document.querySelectorAll('.patient-queue-card .action-btn');
    
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            showQuickActionsMenu(this, this.closest('.patient-queue-card'));
        });
    });
    
    // Add click to select
    const patientCards = document.querySelectorAll('.patient-queue-card');
    patientCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('action-btn')) {
                togglePatientSelection(this);
            }
        });
    });
}

function showQuickActionsMenu(button, patientCard) {
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'quick-actions-menu';
    menu.innerHTML = `
        <button class="menu-action" data-action="send-next">Send "You're Next"</button>
        <button class="menu-action" data-action="move-doctor">Move to Doctor</button>
        <button class="menu-action" data-action="mark-complete">Mark Complete</button>
        <button class="menu-action" data-action="view-details">View Details</button>
        <button class="menu-action" data-action="reassign">Reassign Doctor</button>
    `;
    
    // Position menu
    const rect = button.getBoundingClientRect();
    menu.style.cssText = `
        position: fixed;
        top: ${rect.bottom + 5}px;
        right: ${window.innerWidth - rect.right}px;
        background: white;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        padding: 8px 0;
    `;
    
    // Add menu actions
    menu.querySelectorAll('.menu-action').forEach(action => {
        action.addEventListener('click', function() {
            handlePatientAction(this.dataset.action, patientCard);
            menu.remove();
        });
    });
    
    // Add to body
    document.body.appendChild(menu);
    
    // Remove menu on outside click
    setTimeout(() => {
        document.addEventListener('click', function removeMenu() {
            menu.remove();
            document.removeEventListener('click', removeMenu);
        });
    }, 100);
}

function handlePatientAction(action, patientCard) {
    const patientName = patientCard.querySelector('.patient-info h4').textContent;
    
    switch(action) {
        case 'send-next':
            sendNotificationToPatient(patientName, "You're next");
            break;
        case 'move-doctor':
            moveSpecificPatientToDoctor(patientCard);
            break;
        case 'mark-complete':
            markSpecificPatientComplete(patientCard);
            break;
        case 'view-details':
            viewPatientDetails(patientCard);
            break;
        case 'reassign':
            openReassignModalForPatient(patientCard);
            break;
    }
}

function togglePatientSelection(card) {
    const patientId = card.dataset.patientId || card.querySelector('.patient-info h4').textContent;
    
    if (QueueFlowState.selectedPatients.has(patientId)) {
        QueueFlowState.selectedPatients.delete(patientId);
        card.classList.remove('selected');
    } else {
        QueueFlowState.selectedPatients.add(patientId);
        card.classList.add('selected');
    }
}

/**
 * ===============================================
 * TIMER CONTROLS
 * ===============================================
 */
function setupTimerControls() {
    // Pause buttons
    document.querySelectorAll('.timer-btn.pause').forEach(btn => {
        btn.addEventListener('click', function() {
            pauseTimer(this.closest('.timer-card'));
        });
    });
    
    // Reset buttons
    document.querySelectorAll('.timer-btn.reset').forEach(btn => {
        btn.addEventListener('click', function() {
            resetTimer(this.closest('.timer-card'));
        });
    });
    
    // Notify buttons
    document.querySelectorAll('.timer-btn.notify').forEach(btn => {
        btn.addEventListener('click', function() {
            notifyPatientFromTimer(this.closest('.timer-card'));
        });
    });
    
    // Escalate buttons
    document.querySelectorAll('.timer-btn.escalate').forEach(btn => {
        btn.addEventListener('click', function() {
            escalateWaitTime(this.closest('.timer-card'));
        });
    });
    
    // Priority buttons
    document.querySelectorAll('.timer-btn.priority').forEach(btn => {
        btn.addEventListener('click', function() {
            setPriorityFromTimer(this.closest('.timer-card'));
        });
    });
    
    // Reassign buttons
    document.querySelectorAll('.timer-btn.reassign').forEach(btn => {
        btn.addEventListener('click', function() {
            reassignFromTimer(this.closest('.timer-card'));
        });
    });
}

function pauseTimer(timerCard) {
    const patientName = timerCard.querySelector('.timer-name').textContent;
    
    // Find and pause timer
    QueueFlowState.timers.forEach(timer => {
        if (timer.patientName === patientName) {
            timer.paused = !timer.paused;
            
            // Update button
            const pauseBtn = timerCard.querySelector('.timer-btn.pause i');
            if (timer.paused) {
                pauseBtn.className = 'fas fa-play';
            } else {
                pauseBtn.className = 'fas fa-pause';
            }
            
            showNotification(`Timer ${timer.paused ? 'paused' : 'resumed'} for ${patientName}`, 'info');
        }
    });
}

function resetTimer(timerCard) {
    const patientName = timerCard.querySelector('.timer-name').textContent;
    
    if (confirm(`Reset timer for ${patientName}?`)) {
        QueueFlowState.timers.forEach(timer => {
            if (timer.patientName === patientName) {
                timer.waitTime = 0;
                timer.alerted30 = false;
                timer.alerted60 = false;
                updateTimerDisplay(timer);
            }
        });
        
        showNotification(`Timer reset for ${patientName}`, 'success');
    }
}

function notifyPatientFromTimer(timerCard) {
    const patientName = timerCard.querySelector('.timer-name').textContent;
    sendNotificationToPatient(patientName, 'Update on your wait time');
}

function escalateWaitTime(timerCard) {
    const patientName = timerCard.querySelector('.timer-name').textContent;
    
    // Show escalation options
    const action = confirm(`Escalate ${patientName} to clinic manager?`);
    
    if (action) {
        // Log escalation
        logAuditAction({
            action: 'Wait Time Escalation',
            patient: patientName,
            details: 'Escalated to clinic manager',
            reason: 'Excessive wait time'
        });
        
        // Send notification to manager
        sendManagerNotification(patientName, 'Excessive wait time alert');
        
        showNotification(`Escalated ${patientName} to management`, 'warning');
    }
}

function setPriorityFromTimer(timerCard) {
    const patientName = timerCard.querySelector('.timer-name').textContent;
    
    // Find patient card and move to top
    const patientCard = findPatientCard(patientName);
    if (patientCard) {
        movePatientToTop(patientCard);
        
        // Add priority badge
        addPriorityBadge(patientCard);
        
        showNotification(`${patientName} set as priority`, 'success');
    }
}

function reassignFromTimer(timerCard) {
    const patientName = timerCard.querySelector('.timer-name').textContent;
    const patientCard = findPatientCard(patientName);
    
    if (patientCard) {
        openReassignModalForPatient(patientCard);
    }
}

/**
 * ===============================================
 * NOTIFICATION SYSTEM
 * ===============================================
 */
function initializeNotifications() {
    setupNotificationTemplates();
    setupCustomNotifications();
}

function setupNotificationTemplates() {
    const templateBtns = document.querySelectorAll('.template-btn');
    
    templateBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const message = this.dataset.message;
            
            if (message === 'custom') {
                // Show custom message section
                document.querySelector('.custom-message-section').scrollIntoView({ behavior: 'smooth' });
            } else {
                // Send template message
                sendTemplateNotification(message);
            }
        });
    });
}

function setupCustomNotifications() {
    const sendBtn = document.querySelector('.btn-send');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendCustomNotification);
    }
}

function sendTemplateNotification(templateType) {
    const templates = {
        'you-are-next': "You're next! Please proceed to the consultation room.",
        'doctor-delayed': "Your doctor is running late. We apologize for the delay.",
        'please-wait': "Please wait a few more minutes. We'll call you soon.",
        'ready-for-you': "The doctor is ready for you now.",
        'room-change': "Please move to Room [X] for your consultation."
    };
    
    const message = templates[templateType];
    
    if (QueueFlowState.selectedPatients.size > 0) {
        QueueFlowState.selectedPatients.forEach(patientId => {
            sendNotificationToPatient(patientId, message);
        });
        
        showNotification(`Sent "${message}" to ${QueueFlowState.selectedPatients.size} patients`, 'success');
        QueueFlowState.selectedPatients.clear();
    } else {
        showNotification('Please select patients to notify', 'warning');
    }
}

function sendCustomNotification() {
    const patientSelect = document.getElementById('patientSelect');
    const messageTextarea = document.querySelector('.message-form .form-textarea');
    const sendOptions = document.querySelectorAll('.send-options input[type="checkbox"]:checked');
    
    if (!patientSelect.value) {
        showNotification('Please select a patient', 'warning');
        return;
    }
    
    if (!messageTextarea.value.trim()) {
        showNotification('Please enter a message', 'warning');
        return;
    }
    
    const channels = Array.from(sendOptions).map(opt => opt.parentElement.textContent.trim());
    
    // Send notification
    sendNotificationToPatient(patientSelect.value, messageTextarea.value, channels);
    
    // Clear form
    patientSelect.value = '';
    messageTextarea.value = '';
    
    showNotification('Notification sent successfully', 'success');
}

function sendNotificationToPatient(patientName, message, channels = ['In-App']) {
    // Simulate sending notification
    console.log(`Sending to ${patientName}: ${message} via ${channels.join(', ')}`);
    
    // Log to audit
    logAuditAction({
        action: 'Patient Notification',
        patient: patientName,
        details: `Message: "${message}"`,
        reason: `Channels: ${channels.join(', ')}`
    });
    
    // Update UI to show notification sent
    const patientCard = findPatientCard(patientName);
    if (patientCard) {
        // Add notification indicator
        showNotificationIndicator(patientCard);
    }
}

function showNotificationIndicator(patientCard) {
    // Add a temporary indicator
    const indicator = document.createElement('span');
    indicator.className = 'notification-sent-indicator';
    indicator.innerHTML = '<i class="fas fa-check"></i> Notified';
    indicator.style.cssText = `
        position: absolute;
        top: 8px;
        left: 8px;
        background: #10B981;
        color: white;
        padding: 4px 8px;
        border-radius: 20px;
        font-size: 11px;
        animation: fadeOut 3s forwards;
    `;
    
    patientCard.appendChild(indicator);
    
    // Remove after animation
    setTimeout(() => indicator.remove(), 3000);
}

function sendYoureNextNotification() {
    // Find next patient in queue
    const firstWaitingPatient = document.querySelector('.patient-queue-card.checked-in');
    
    if (firstWaitingPatient) {
        const patientName = firstWaitingPatient.querySelector('.patient-info h4').textContent;
        sendNotificationToPatient(patientName, "You're next! Please proceed to the consultation room.");
        
        showNotification(`Notified ${patientName} they're next`, 'success');
    } else {
        showNotification('No waiting patients to notify', 'info');
    }
}

/**
 * ===============================================
 * ANALYTICS & REPORTING
 * ===============================================
 */
function initializeAnalytics() {
    updateKPIs();
    initializeCharts();
    loadDoctorComparison();
}

function updateKPIs() {
    // Update KPI cards
    const kpiData = {
        'Current Queue': QueueFlowState.analytics.totalInQueue,
        'Avg Wait Time': `${QueueFlowState.analytics.averageWaitTime} min`,
        'Flow Efficiency': `${QueueFlowState.analytics.flowEfficiency}%`,
        'Patients/Hour': '3.2'
    };
    
    const kpiCards = document.querySelectorAll('.kpi-card');
    kpiCards.forEach(card => {
        const label = card.querySelector('.kpi-label').textContent;
        if (kpiData[label]) {
            card.querySelector('.kpi-value').textContent = kpiData[label];
        }
    });
}

function initializeCharts() {
    const canvas = document.getElementById('queueVolumeChart');
    if (!canvas) return;
    
    // Create placeholder chart
    const ctx = canvas.getContext('2d');
    
    // Simple line chart simulation
    drawQueueVolumeChart(ctx, canvas.width, canvas.height);
}

function drawQueueVolumeChart(ctx, width, height) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.strokeStyle = '#9CA3AF';
    ctx.stroke();
    
    // Draw sample data points
    const data = [5, 8, 12, 18, 15, 20, 16, 14, 10, 8];
    const stepX = (width - 60) / data.length;
    const maxValue = Math.max(...data);
    
    ctx.beginPath();
    ctx.strokeStyle = '#00BFA5';
    ctx.lineWidth = 2;
    
    data.forEach((value, index) => {
        const x = 40 + (index * stepX);
        const y = height - 40 - ((value / maxValue) * (height - 60));
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw point
        ctx.fillStyle = '#00BFA5';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    ctx.stroke();
    
    // Add labels
    ctx.fillStyle = '#4B5563';
    ctx.font = '12px Poppins';
    ctx.fillText('Queue Volume by Hour', width / 2 - 60, 15);
}

function loadDoctorComparison() {
    // This is already populated in HTML
    // Could be made dynamic with real data
}

function exportAnalytics() {
    showNotification('Preparing analytics export...', 'info');
    
    setTimeout(() => {
        // Generate CSV data
        const csvData = generateAnalyticsCSV();
        
        // Download CSV
        downloadCSV(csvData, `queue_analytics_${formatDateForFile()}.csv`);
        
        showNotification('Analytics exported successfully', 'success');
    }, 1500);
}

function generateAnalyticsCSV() {
    let csv = 'Metric,Value\\n';
    csv += `Total in Queue,${QueueFlowState.analytics.totalInQueue}\\n`;
    csv += `Average Wait Time,${QueueFlowState.analytics.averageWaitTime} min\\n`;
    csv += `Flow Efficiency,${QueueFlowState.analytics.flowEfficiency}%\\n`;
    csv += `Patients Seen Today,${QueueFlowState.analytics.seenToday}\\n`;
    
    return csv;
}

/**
 * ===============================================
 * AUDIT LOGGING
 * ===============================================
 */
function logAuditAction(action) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        action: action.action,
        patient: action.patient,
        user: 'Sarah Wanjiru',
        details: action.details,
        reason: action.reason
    };
    
    QueueFlowState.auditLog.push(logEntry);
    
    // Update audit table
    updateAuditTable(logEntry);
    
    // Send to backend
    sendAuditToBackend(logEntry);
}

function updateAuditTable(logEntry) {
    const auditTable = document.querySelector('.audit-table tbody');
    if (!auditTable) return;
    
    // Create new row
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${formatDateTime(logEntry.timestamp)}</td>
        <td>${logEntry.action}</td>
        <td>${logEntry.patient}</td>
        <td>${logEntry.user}</td>
        <td>${logEntry.details}</td>
        <td>${logEntry.reason}</td>
    `;
    
    // Insert at top
    auditTable.insertBefore(row, auditTable.firstChild);
    
    // Limit to 50 rows
    while (auditTable.children.length > 50) {
        auditTable.removeChild(auditTable.lastChild);
    }
}

function filterAuditLog() {
    const startDate = document.getElementById('auditStartDate').value;
    const endDate = document.getElementById('auditEndDate').value;
    
    if (!startDate || !endDate) {
        showNotification('Please select date range', 'warning');
        return;
    }
    
    // Filter audit log
    const filtered = QueueFlowState.auditLog.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
    });
    
    // Update table with filtered results
    updateAuditTableWithFiltered(filtered);
    
    showNotification(`Showing ${filtered.length} audit entries`, 'info');
}

function updateAuditTableWithFiltered(entries) {
    const auditTable = document.querySelector('.audit-table tbody');
    if (!auditTable) return;
    
    // Clear table
    auditTable.innerHTML = '';
    
    // Add filtered entries
    entries.forEach(entry => {
        updateAuditTable(entry);
    });
}

function sendAuditToBackend(logEntry) {
    // Send to backend via WebSocket or API
    if (QueueFlowState.websocket && QueueFlowState.websocket.readyState === WebSocket.OPEN) {
        QueueFlowState.websocket.send(JSON.stringify({
            type: 'audit_log',
            data: logEntry
        }));
    }
}

/**
 * ===============================================
 * WEBSOCKET CONNECTION
 * ===============================================
 */
function initializeWebSocket() {
    try {
        QueueFlowState.websocket = new WebSocket('ws://localhost:8080/queue-flow');
        
        QueueFlowState.websocket.onopen = function() {
            console.log('WebSocket connected');
        };
        
        QueueFlowState.websocket.onmessage = function(event) {
            handleWebSocketMessage(JSON.parse(event.data));
        };
        
        QueueFlowState.websocket.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
        
        QueueFlowState.websocket.onclose = function() {
            console.log('WebSocket disconnected');
            // Attempt reconnection after 5 seconds
            setTimeout(initializeWebSocket, 5000);
        };
    } catch (error) {
        console.log('WebSocket not available, using polling');
        startPolling();
    }
}

function handleWebSocketMessage(data) {
    switch(data.type) {
        case 'queue_update':
            handleQueueUpdate(data);
            break;
        case 'doctor_status':
            handleDoctorStatusUpdate(data);
            break;
        case 'new_patient':
            handleNewPatient(data);
            break;
        case 'wait_alert':
            handleWaitAlert(data);
            break;
        case 'notification_sent':
            handleNotificationSent(data);
            break;
    }
}

function handleQueueUpdate(data) {
    // Update queue display
    loadQueueData();
    updateQueueStatistics();
    showNotification('Queue updated', 'info');
}

function handleDoctorStatusUpdate(data) {
    // Update doctor status
    QueueFlowState.doctorStatus.set(data.doctorId, data.status);
    updateDoctorStatusDisplay();
}

function handleNewPatient(data) {
    // Add new patient to queue
    const patient = data.patient;
    QueueFlowState.queues[patient.doctor].push(patient);
    
    // Start timer
    startPatientTimer(patient);
    
    // Update display
    addPatientToDisplay(patient);
    updateQueueStatistics();
    
    showNotification(`New patient: ${patient.name}`, 'info');
}

function handleWaitAlert(data) {
    // Show wait time alert
    showWaitAlertModal(data.timer);
}

function handleNotificationSent(data) {
    // Update UI to show notification was sent
    const patientCard = findPatientCard(data.patientName);
    if (patientCard) {
        showNotificationIndicator(patientCard);
    }
}

/**
 * ===============================================
 * AUTO-REFRESH & POLLING
 * ===============================================
 */
function startAutoRefresh() {
    // Refresh every 30 seconds
    QueueFlowState.autoRefreshInterval = setInterval(() => {
        refreshDoctorStatus();
        updateQueueStatistics();
        updateKPIs();
    }, 30000);
}

function startPolling() {
    // Fallback polling if WebSocket fails
    setInterval(() => {
        fetchQueueUpdates();
        fetchDoctorStatuses();
    }, 5000);
}

function fetchQueueUpdates() {
    // Fetch queue updates from server
    // This would be an API call
    console.log('Fetching queue updates...');
}

function fetchDoctorStatuses() {
    // Fetch doctor statuses from server
    // This would be an API call
    console.log('Fetching doctor statuses...');
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

function toggleViewMode() {
    const queueList = document.getElementById('queueList');
    const viewModeBtn = document.getElementById('viewModeBtn');
    
    if (queueList.classList.contains('grid-view')) {
        queueList.classList.remove('grid-view');
        viewModeBtn.innerHTML = '<i class="fas fa-th"></i>';
    } else {
        queueList.classList.add('grid-view');
        viewModeBtn.innerHTML = '<i class="fas fa-list"></i>';
    }
}

function toggleMultiQueueView() {
    const multiQueueSection = document.querySelector('.multi-doctor-queues');
    const btn = document.getElementById('toggleQueueViewBtn');
    
    if (multiQueueSection.classList.contains('unified')) {
        multiQueueSection.classList.remove('unified');
        btn.innerHTML = '<i class="fas fa-compress-alt"></i> Unified View';
    } else {
        multiQueueSection.classList.add('unified');
        btn.innerHTML = '<i class="fas fa-expand-alt"></i> Separated View';
    }
}

function switchTab(tabName) {
    // Remove active from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active to selected tab
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${getNotificationColor(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
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

function incrementNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const current = parseInt(badge.textContent) || 0;
        badge.textContent = current + 1;
    }
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatDateForFile() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

function findPatientCard(patientName) {
    const cards = document.querySelectorAll('.patient-queue-card');
    
    for (let card of cards) {
        const name = card.querySelector('.patient-info h4')?.textContent;
        if (name === patientName) {
            return card;
        }
    }
    
    return null;
}

function movePatientToTop(patient) {
    const queueList = document.getElementById('queueList');
    const patientCard = typeof patient === 'string' ? findPatientCard(patient) : patient;
    
    if (patientCard && queueList) {
        queueList.insertBefore(patientCard, queueList.firstChild);
        updateQueuePositions();
    }
}

function addPriorityBadge(patientCard) {
    if (!patientCard.querySelector('.priority-badge')) {
        const badge = document.createElement('span');
        badge.className = 'priority-badge';
        badge.innerHTML = '<i class="fas fa-star"></i> Priority';
        badge.style.cssText = `
            position: absolute;
            top: 8px;
            right: 80px;
            background: #F59E0B;
            color: white;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 11px;
        `;
        patientCard.appendChild(badge);
    }
}

function movePatientToDoctor() {
    if (QueueFlowState.selectedPatients.size === 0) {
        showNotification('Please select a patient to move', 'warning');
        return;
    }
    
    // Move selected patients to consultation
    QueueFlowState.selectedPatients.forEach(patientId => {
        const patientCard = findPatientCard(patientId);
        if (patientCard) {
            // Update status to being-seen
            patientCard.classList.remove('checked-in', 'delayed', 'overdue');
            patientCard.classList.add('being-seen');
            
            // Update status badge
            const statusBadge = patientCard.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.className = 'status-badge being-seen';
                statusBadge.innerHTML = '<i class="fas fa-user-doctor"></i> Being Seen';
            }
        }
    });
    
    showNotification(`Moved ${QueueFlowState.selectedPatients.size} patient(s) to doctor`, 'success');
    QueueFlowState.selectedPatients.clear();
}

function markPatientComplete() {
    if (QueueFlowState.selectedPatients.size === 0) {
        showNotification('Please select a patient to mark complete', 'warning');
        return;
    }
    
    QueueFlowState.selectedPatients.forEach(patientId => {
        markPatientStatus(patientId, 'complete');
    });
    
    // Update seen today count
    QueueFlowState.analytics.seenToday += QueueFlowState.selectedPatients.size;
    updateStatCard('seen-today', QueueFlowState.analytics.seenToday);
    
    showNotification(`Marked ${QueueFlowState.selectedPatients.size} patient(s) as complete`, 'success');
    QueueFlowState.selectedPatients.clear();
}

function markPatientStatus(patientId, status) {
    const patientCard = findPatientCard(patientId);
    if (!patientCard) return;
    
    switch(status) {
        case 'complete':
            patientCard.style.opacity = '0.5';
            patientCard.classList.add('complete');
            
            // Remove from queue after delay
            setTimeout(() => {
                patientCard.remove();
                updateQueuePositions();
                updateQueueStatistics();
            }, 2000);
            break;
            
        case 'deferred':
            patientCard.classList.add('deferred');
            break;
            
        case 'no-show':
            patientCard.classList.add('no-show');
            patientCard.style.textDecoration = 'line-through';
            break;
    }
    
    // Log action
    logAuditAction({
        action: 'Status Update',
        patient: patientId,
        details: `Status changed to ${status}`,
        reason: 'Manual update'
    });
}

function printQueueList() {
    window.print();
}

function moveSpecificPatientToDoctor(patientCard) {
    patientCard.classList.remove('checked-in', 'delayed', 'overdue');
    patientCard.classList.add('being-seen');
    
    const statusBadge = patientCard.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.className = 'status-badge being-seen';
        statusBadge.innerHTML = '<i class="fas fa-user-doctor"></i> Being Seen';
    }
    
    const patientName = patientCard.querySelector('.patient-info h4').textContent;
    showNotification(`${patientName} moved to doctor`, 'success');
}

function markSpecificPatientComplete(patientCard) {
    const patientName = patientCard.querySelector('.patient-info h4').textContent;
    markPatientStatus(patientName, 'complete');
    
    QueueFlowState.analytics.seenToday++;
    updateStatCard('seen-today', QueueFlowState.analytics.seenToday);
    
    showNotification(`${patientName} marked as complete`, 'success');
}

function viewPatientDetails(patientCard) {
    const patientInfo = {
        name: patientCard.querySelector('.patient-info h4').textContent,
        type: patientCard.querySelector('.appointment-type').textContent,
        checkIn: patientCard.querySelector('.detail:nth-child(1) span').textContent,
        waitTime: patientCard.querySelector('.wait-time').textContent,
        doctor: patientCard.querySelector('.detail:nth-child(3) span').textContent,
        room: patientCard.querySelector('.detail:nth-child(4) span').textContent
    };
    
    alert(`Patient Details:\\n\\nName: ${patientInfo.name}\\nType: ${patientInfo.type}\\n${patientInfo.checkIn}\\n${patientInfo.waitTime}\\nDoctor: ${patientInfo.doctor}\\nRoom: ${patientInfo.room}`);
}

function openReassignModalForPatient(patientCard) {
    const patientName = patientCard.querySelector('.patient-info h4').textContent;
    const currentDoctor = patientCard.querySelector('.detail:nth-child(3) span').textContent;
    
    // Update modal fields
    const modal = document.getElementById('reassignDoctorModal');
    modal.querySelector('.form-input[value="Peter Wachira"]').value = patientName;
    modal.querySelector('.form-input[value="Dr. James Ochieng"]').value = currentDoctor;
    
    // Open modal
    openModal('reassignDoctorModal');
}

function reassignPatientToDoctor(patientElement, newDoctor) {
    const patientName = patientElement.querySelector('.name')?.textContent ||
                        patientElement.querySelector('.patient-info h4')?.textContent;
    
    // Update doctor assignment
    const doctorDetail = patientElement.querySelector('.detail:nth-child(3) span');
    if (doctorDetail) {
        const doctorNames = {
            'dr-ochieng': 'Dr. James Ochieng',
            'dr-kamau': 'Dr. Mary Kamau',
            'dr-mutua': 'Dr. Peter Mutua'
        };
        doctorDetail.textContent = doctorNames[newDoctor] || newDoctor;
    }
    
    // Log action
    logAuditAction({
        action: 'Reassign Doctor',
        patient: patientName,
        details: `Reassigned to ${newDoctor}`,
        reason: 'Load balancing'
    });
    
    showNotification(`${patientName} reassigned to ${newDoctor}`, 'success');
}

function sendManagerNotification(patientName, message) {
    // Simulate sending notification to manager
    console.log(`Manager notification: ${patientName} - ${message}`);
}

function addPatientToDisplay(patient) {
    const queueList = document.getElementById('queueList');
    
    const card = document.createElement('div');
    card.className = `patient-queue-card ${patient.status}`;
    card.draggable = true;
    card.dataset.patientId = patient.id;
    card.dataset.doctor = patient.doctor;
    
    card.innerHTML = `
        <div class="queue-position">${patient.position}</div>
        <img src="profile-icon.png" alt="Patient" class="patient-avatar">
        <div class="patient-info">
            <h4>${patient.name}</h4>
            <span class="appointment-type">${patient.appointmentType}</span>
        </div>
        <div class="queue-details">
            <div class="detail">
                <i class="fas fa-clock"></i>
                <span>Check-in: ${patient.checkInTime}</span>
            </div>
            <div class="detail">
                <i class="fas fa-hourglass-half"></i>
                <span class="wait-time">Wait: ${patient.waitTime} min</span>
            </div>
            <div class="detail">
                <i class="fas fa-user-doctor"></i>
                <span>${patient.doctor}</span>
            </div>
            <div class="detail">
                <i class="fas fa-door-open"></i>
                <span>${patient.room}</span>
            </div>
        </div>
        <div class="status-badge ${patient.status}">
            <i class="fas fa-check"></i> Checked-in
        </div>
        <div class="queue-actions">
            <button class="action-btn" title="Quick Actions">
                <i class="fas fa-ellipsis-v"></i>
            </button>
        </div>
    `;
    
    queueList.appendChild(card);
    
    // Setup drag and drop
    setupDragAndDrop(card);
    
    // Setup actions
    const actionBtn = card.querySelector('.action-btn');
    actionBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showQuickActionsMenu(this, card);
    });
    
    card.addEventListener('click', function(e) {
        if (!e.target.classList.contains('action-btn')) {
            togglePatientSelection(this);
        }
    });
}

function handleMarkStatusSubmit(e) {
    e.preventDefault();
    
    const patient = e.target.querySelector('select[required]').value;
    const status = e.target.querySelector('input[name="status"]:checked')?.value;
    const followUp = e.target.querySelector('select:nth-of-type(2)').value;
    const notes = e.target.querySelector('.form-textarea').value;
    
    if (!patient || !status) {
        showNotification('Please select patient and status', 'warning');
        return;
    }
    
    // Update patient status
    markPatientStatus(patient, status);
    
    // Handle follow-up action
    if (followUp) {
        handleFollowUpAction(patient, followUp);
    }
    
    // Log action
    logAuditAction({
        action: 'Status Update',
        patient: patient,
        details: `Changed to ${status}`,
        reason: notes || 'No notes provided'
    });
    
    // Close modal
    closeModal('markStatusModal');
    
    // Reset form
    e.target.reset();
    
    showNotification(`Status updated for ${patient}`, 'success');
}

function handleReassignDoctorSubmit(e) {
    e.preventDefault();
    
    const patient = e.target.querySelector('.form-input[readonly]').value;
    const newDoctor = e.target.querySelector('input[name="newDoctor"]:checked')?.value;
    const reason = e.target.querySelector('.form-textarea').value;
    const notify = e.target.querySelector('input[type="checkbox"]').checked;
    
    if (!newDoctor) {
        showNotification('Please select a new doctor', 'warning');
        return;
    }
    
    // Find and update patient card
    const patientCard = findPatientCard(patient);
    if (patientCard) {
        reassignPatientToDoctor(patientCard, newDoctor);
    }
    
    // Send notification if requested
    if (notify) {
        sendNotificationToPatient(patient, `You have been reassigned to a different doctor`);
    }
    
    // Log action
    logAuditAction({
        action: 'Reassign Doctor',
        patient: patient,
        details: `Reassigned to ${newDoctor}`,
        reason: reason
    });
    
    // Close modal
    closeModal('reassignDoctorModal');
    
    showNotification(`${patient} reassigned successfully`, 'success');
}

function handleFollowUpAction(patient, action) {
    switch(action) {
        case 'reschedule':
            // Navigate to appointments page
            window.location.href = 'appointments.html#reschedule';
            break;
        case 'call':
            showNotification(`Please call ${patient}`, 'info');
            break;
        case 'message':
            sendNotificationToPatient(patient, 'Please contact reception for follow-up');
            break;
    }
}

function loadPreferences() {
    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('#darkModeToggle i');
        if (icon) {
            icon.className = 'fas fa-sun';
        }
    }
    
    // Load other preferences
    const preferences = JSON.parse(localStorage.getItem('queuePreferences') || '{}');
    
    if (preferences.waitTimeThreshold) {
        QueueFlowState.waitTimeThreshold = preferences.waitTimeThreshold;
    }
}

function loadInitialData() {
    // This function is called on page load to set up initial data
    console.log('Loading initial queue data...');
}

// Add CSS animations
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
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .queue-list.grid-view {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
    
    .patient-queue-card.selected {
        background: rgba(0, 191, 165, 0.1);
        border-color: #00BFA5;
    }
    
    .multi-doctor-queues.unified .doctor-queue-column {
        display: none;
    }
    
    .multi-doctor-queues.unified .multi-queue-container {
        display: block;
    }
    
    .quick-actions-menu .menu-action {
        display: block;
        width: 100%;
        padding: 10px 16px;
        border: none;
        background: none;
        text-align: left;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .quick-actions-menu .menu-action:hover {
        background: #F5F5F7;
    }
`;
document.head.appendChild(style);

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (QueueFlowState.timerInterval) {
        clearInterval(QueueFlowState.timerInterval);
    }
    
    if (QueueFlowState.autoRefreshInterval) {
        clearInterval(QueueFlowState.autoRefreshInterval);
    }
    
    if (QueueFlowState.websocket) {
        QueueFlowState.websocket.close();
    }
});

console.log('Curis Queue & Flow JavaScript loaded successfully');
// ===================================
// CURIS HEALTH PAGE JAVASCRIPT
// ===================================

// Global State Management
const HealthState = {
    selectedClinic: null,
    currentTab: 'audit',
    searchResults: [],
    accessLogs: [],
    complianceData: [],
    filters: {
        recordType: '',
        dateRange: 'today',
        doctor: '',
        changeType: '',
        changeDateFilter: 'today'
    },
    currentFileNumber: null,
    realTimeEnabled: true,
    notifications: [
        { id: 1, type: 'warning', title: 'Unusual Access Pattern', desc: 'Multiple record access from IP 192.168.1.100', time: '15 minutes ago', unread: true },
        { id: 2, type: 'info', title: 'Record Modified', desc: 'Prescription updated in file #12845', time: '32 minutes ago', unread: true }
    ],
    privacyPanelOpen: true,
    activeHistoryTab: 'prescriptions',
    modalHistoryTab: 'prescriptions',
    alertsEnabled: {
        recordModifications: true,
        unusualAccess: true,
        complianceViolations: true,
        prescriptionChanges: true
    },
    notificationChannels: {
        dashboard: true,
        email: false,
        sms: false
    }
};

// Sample Data
const clinicsData = [
    { id: 'clinic-a', name: 'Nairobi Medical Center', owner: 'Dr. Sarah Johnson', region: 'nairobi', status: 'active', records: 2847, lastAudited: '1 hour ago' },
    { id: 'clinic-b', name: 'Westlands Health Clinic', owner: 'Dr. Michael Brown', region: 'westlands', status: 'active', records: 1234, lastAudited: 'Yesterday' },
    { id: 'clinic-c', name: 'Karen Medical Center', owner: 'Dr. Emily Davis', region: 'karen', status: 'active', records: 3156, lastAudited: '2 days ago' },
    { id: 'clinic-d', name: 'Eastleigh Family Clinic', owner: 'Dr. Ahmed Hassan', region: 'eastleigh', status: 'active', records: 892, lastAudited: '5 days ago' },
    { id: 'clinic-e', name: 'Kiambu District Hospital', owner: 'Dr. Grace Wanjiku', region: 'kiambu', status: 'active', records: 4567, lastAudited: '1 week ago' }
];

const accessLogsData = [
    { time: '10:30 AM', user: 'Dr. Lee', userId: 'DOC001', role: 'doctor', fileNumber: '#12345', duration: '15 min', ip: '192.168.1.45' },
    { time: '11:15 AM', user: 'Nurse Kim', userId: 'NUR001', role: 'nurse', fileNumber: '#67890', duration: '8 min', ip: '192.168.1.67' },
    { time: '12:00 PM', user: 'Reception', userId: 'REC001', role: 'receptionist', fileNumber: '#11111', duration: '3 min', ip: '192.168.1.89' },
    { time: '12:30 PM', user: 'Dr. Park', userId: 'DOC002', role: 'doctor', fileNumber: '#22222', duration: '25 min', ip: '192.168.1.78' },
    { time: '1:15 PM', user: 'Lab Tech', userId: 'LAB001', role: 'lab', fileNumber: '#33333', duration: '12 min', ip: '192.168.1.90' }
];

const complianceChanges = [
    { time: 'Today 09:45 AM', type: 'prescription', action: 'added prescription', details: 'Added: Amoxicillin 500mg - 3x daily for 7 days', user: 'Dr. Lee', fileNumber: '#12845' },
    { time: 'Today 10:30 AM', type: 'diagnosis', action: 'updated diagnosis', details: 'Changed: Primary diagnosis from A01 to B02', user: 'Dr. Park', fileNumber: '#13567' },
    { time: 'Today 11:15 AM', type: 'lab', action: 'added results', details: 'Added: Complete Blood Count results', user: 'Lab Tech', fileNumber: '#14729' },
    { time: 'Yesterday 3:30 PM', type: 'prescription', action: 'modified prescription', details: 'Changed: Dosage from 2x to 3x daily', user: 'Dr. Smith', fileNumber: '#15892' }
];

const patientRecords = {
    '#12345': {
        lastVisit: 'Nov 25, 2024',
        primaryDiagnosis: 'ICD-10: J06.9',
        activeMedications: 3,
        prescriptions: [
            { date: 'Nov 25, 2024', medication: 'Amoxicillin 500mg', dosage: '3x daily for 7 days', instructions: 'Take with food', prescribedBy: 'DOC001' },
            { date: 'Nov 20, 2024', medication: 'Paracetamol 500mg', dosage: 'As needed for fever', instructions: 'Maximum 4 times daily', prescribedBy: 'DOC001' }
        ],
        diagnoses: [
            { date: 'Nov 25, 2024', primary: 'J06.9 - Acute upper respiratory infection', secondary: 'Z87.891 - Personal history of nicotine dependence', diagnosedBy: 'DOC001' }
        ],
        labResults: [
            { date: 'Nov 24, 2024', test: 'Complete Blood Count', results: 'WBC: 7.2 K/uL (Normal), RBC: 4.5 M/uL (Normal), Hemoglobin: 13.8 g/dL (Normal)', orderedBy: 'DOC001' }
        ],
        treatments: [
            { date: 'Nov 25, 2024', plan: 'Treatment Plan:\n1. Antibiotic therapy (Amoxicillin)\n2. Symptomatic relief (Paracetamol)\n3. Follow-up in 7 days\n4. Rest and increased fluid intake', plannedBy: 'DOC001' }
        ]
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    initializeHealthData();
    initializeRealTimeUpdates();
    updateNotificationBadge();
    setupPrivacyPanel();
    updateComplianceScore();
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

    // Privacy Panel Toggle
    document.querySelector('.toggle-panel')?.addEventListener('click', togglePrivacyPanel);

    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function () {
            switchTab(this.dataset.tab);
        });
    });

    // Quick Actions
    document.getElementById('quickAudit')?.addEventListener('click', quickAudit);
    document.getElementById('quickCompliance')?.addEventListener('click', quickComplianceCheck);
    document.getElementById('quickExport')?.addEventListener('click', quickExportTodayLog);
    document.getElementById('quickAlert')?.addEventListener('click', viewAlerts);

    // Audit Tab
    document.getElementById('applyAuditFilters')?.addEventListener('click', applyAuditFilters);
    document.getElementById('exportAccessLog')?.addEventListener('click', exportAccessLog);

    // Records Tab
    document.getElementById('searchRecordBtn')?.addEventListener('click', searchPatientRecord);
    document.getElementById('fileNumberSearch')?.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') searchPatientRecord();
    });
    document.getElementById('printSummaryBtn')?.addEventListener('click', printRecordSummary);
    document.getElementById('exportRecordBtn')?.addEventListener('click', exportPatientRecord);

    // History Tab Buttons
    document.querySelectorAll('.history-tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            switchHistoryTab(this.dataset.history);
        });
    });

    // Compliance Tab
    document.getElementById('changeTypeFilter')?.addEventListener('change', filterComplianceChanges);
    document.getElementById('changeDateFilter')?.addEventListener('change', filterComplianceChanges);
    document.getElementById('generateComplianceReport')?.addEventListener('click', generateComplianceReport);
    document.getElementById('exportChangeLog')?.addEventListener('click', exportChangeLog);

    // Reports Tab
    document.getElementById('generateReportBtn')?.addEventListener('click', generateHealthReport);

    // Health Alerts
    document.getElementById('configureAlertsBtn')?.addEventListener('click', () => openModal('alertConfigModal'));
    document.getElementById('saveAlertConfig')?.addEventListener('click', saveAlertConfiguration);

    // Alert Type Toggles
    document.querySelectorAll('.alert-type-item input[type="checkbox"]').forEach(toggle => {
        toggle.addEventListener('change', function () {
            updateAlertSettings();
        });
    });

    // Billing Integration
    document.getElementById('billingVerifyBtn')?.addEventListener('click', verifyBilling);
    document.getElementById('generateBillingReport')?.addEventListener('click', generateBillingReport);

    // Modal Controls
    document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
        btn.addEventListener('click', function () {
            const modalId = this.dataset.modal || this.closest('.modal-overlay').id;
            closeModal(modalId);
        });
    });

    // Clinic Selection Modal
    document.getElementById('clinicSearchInput')?.addEventListener('input', searchClinics);
    document.getElementById('regionFilter')?.addEventListener('change', filterClinics);
    document.getElementById('statusFilter')?.addEventListener('change', filterClinics);

    // Modal Tab Navigation
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            switchModalHistoryTab(this.dataset.modalTab);
        });
    });

    // Modal Print Summary
    document.getElementById('modalPrintSummary')?.addEventListener('click', printModalSummary);

    // Dark Mode Toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    // Access Log Details
    document.querySelectorAll('[data-action="view-details"]').forEach(btn => {
        btn.addEventListener('click', function () {
            viewAccessDetails(this.closest('tr'));
        });
    });

    // Click outside handlers
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.notification-container') && !e.target.closest('.notification-panel')) {
            closeNotificationPanel();
        }
        if (!e.target.closest('.user-profile-container') && !e.target.closest('.user-dropdown')) {
            closeUserDropdown();
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
        HealthState.selectedClinic = clinic;
        document.getElementById('clinicSelectionSection').classList.add('hidden');
        document.getElementById('healthRecordsDashboard').classList.remove('hidden');

        // Update selected clinic info
        document.getElementById('selectedClinicName').textContent = clinic.name;
        document.getElementById('selectedClinicOwner').textContent = clinic.owner;

        // Update stats
        updateHealthStats(clinic);

        // Load clinic data
        loadClinicHealthData(clinicId);

        // Close modal if open
        closeModal('clinicSelectionModal');

        // Show success message
        showNotification('Clinic selected successfully', 'success');

        // Start real-time updates
        startRealTimeUpdates();
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

// Health Data Management
function loadClinicHealthData(clinicId) {
    // Load access logs
    HealthState.accessLogs = [...accessLogsData];
    renderAccessLogs();

    // Load compliance data
    HealthState.complianceData = [...complianceChanges];
    renderComplianceTimeline();

    // Update recent activity
    updateRecentActivity();
}

function updateHealthStats(clinic) {
    // Update total records
    document.querySelector('.stat-card.primary .stat-number').textContent = clinic.records.toLocaleString();

    // Update records accessed today
    document.querySelector('.stat-card.info .stat-number').textContent = '156';

    // Update records modified this week
    document.querySelector('.stat-card.warning .stat-number').textContent = '23';

    // Update active doctors
    document.querySelector('.stat-card.success .stat-number').textContent = '8';
}

function updateRecentActivity() {
    // These would be calculated from real data
    document.querySelector('.activity-item:nth-child(1) .activity-count').textContent = '42';
    document.querySelector('.activity-item:nth-child(2) .activity-count').textContent = '18';
    document.querySelector('.activity-item:nth-child(3) .activity-count').textContent = '67';
}

// Privacy Panel
function togglePrivacyPanel() {
    const panelContent = document.getElementById('privacyPanelContent');
    const toggleBtn = document.querySelector('.toggle-panel i');

    HealthState.privacyPanelOpen = !HealthState.privacyPanelOpen;

    if (HealthState.privacyPanelOpen) {
        panelContent.classList.remove('hidden');
        toggleBtn.classList.remove('fa-chevron-right');
        toggleBtn.classList.add('fa-chevron-down');
    } else {
        panelContent.classList.add('hidden');
        toggleBtn.classList.remove('fa-chevron-down');
        toggleBtn.classList.add('fa-chevron-right');
    }
}

function setupPrivacyPanel() {
    // Initialize privacy panel state
    if (!HealthState.privacyPanelOpen) {
        document.getElementById('privacyPanelContent').classList.add('hidden');
        document.querySelector('.toggle-panel i').classList.remove('fa-chevron-down');
        document.querySelector('.toggle-panel i').classList.add('fa-chevron-right');
    }
}

// Tab Management
function switchTab(tabName) {
    HealthState.currentTab = tabName;

    // Update tab UI
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.getElementById(`${tabName}Tab`).classList.add('active');

    // Refresh data for the selected tab
    switch (tabName) {
        case 'audit':
            renderAccessLogs();
            break;
        case 'compliance':
            renderComplianceTimeline();
            break;
        case 'records':
            resetRecordSearch();
            break;
        case 'reports':
            updateReportMetrics();
            break;
    }
}

// Audit Functions
function renderAccessLogs() {
    const tbody = document.querySelector('.log-table tbody');
    tbody.innerHTML = '';

    HealthState.accessLogs.forEach((log, index) => {
        const row = createAccessLogRow(log, index);
        tbody.appendChild(row);
    });
}

function createAccessLogRow(log, index) {
    const row = document.createElement('tr');
    row.className = 'log-entry';

    row.innerHTML = `
        <td class="log-time">
            <i class="fas fa-clock"></i>
            ${log.time}
        </td>
        <td class="log-user">${log.user} (ID: ${log.userId})</td>
        <td class="log-role">
            <span class="role-badge ${log.role}">${log.role.charAt(0).toUpperCase() + log.role.slice(1)}</span>
        </td>
        <td class="log-file">${log.fileNumber}</td>
        <td class="log-duration">${log.duration}</td>
        <td class="log-ip">${log.ip}</td>
        <td class="log-actions">
            <button class="btn-link" data-action="view-details" data-index="${index}">Details</button>
        </td>
    `;

    // Add event listener
    row.querySelector('[data-action="view-details"]').addEventListener('click', function () {
        viewAccessDetails(log);
    });

    return row;
}

function applyAuditFilters() {
    const recordType = document.getElementById('recordType').value;
    const dateRange = document.getElementById('dateRange').value;
    const doctor = document.getElementById('doctorFilter').value;

    // Update state
    HealthState.filters.recordType = recordType;
    HealthState.filters.dateRange = dateRange;
    HealthState.filters.doctor = doctor;

    // Filter and re-render logs
    filterAccessLogs();
    showNotification('Filters applied successfully', 'success');
}

function filterAccessLogs() {
    // In a real application, this would filter the logs based on the selected criteria
    // For now, we'll just re-render the existing logs
    renderAccessLogs();
}

function viewAccessDetails(log) {
    showNotification(`Viewing details for access to file ${log.fileNumber}`, 'info');
    // In a real application, this would open a detailed view modal
}

function exportAccessLog() {
    const logs = HealthState.accessLogs;
    const csv = generateAccessLogCSV(logs);
    downloadFile(csv, 'access-log.csv', 'text/csv');
    showNotification('Access log exported successfully', 'success');
}

// Patient Record Functions
function searchPatientRecord() {
    const fileNumber = document.getElementById('fileNumberSearch').value.trim();

    if (!fileNumber) {
        showNotification('Please enter a file number', 'error');
        return;
    }

    if (!fileNumber.startsWith('#')) {
        showNotification('File number must start with #', 'error');
        return;
    }

    // Check if record exists
    const record = patientRecords[fileNumber];

    if (record) {
        displayPatientRecord(fileNumber, record);
        showNotification('Record found', 'success');
    } else {
        showNotification('No record found for this file number', 'error');
    }
}

function displayPatientRecord(fileNumber, record) {
    HealthState.currentFileNumber = fileNumber;

    // Hide placeholder, show record details
    document.getElementById('recordViewPlaceholder').classList.add('hidden');
    document.getElementById('recordDetailsSection').classList.remove('hidden');

    // Update file number
    document.getElementById('currentFileNumber').textContent = fileNumber;

    // Update summary
    document.getElementById('lastVisit').textContent = record.lastVisit;
    document.getElementById('primaryDiagnosis').textContent = record.primaryDiagnosis;
    document.getElementById('activeMedications').textContent = record.activeMedications;

    // Display default history tab
    switchHistoryTab('prescriptions');
}

function switchHistoryTab(tabName) {
    HealthState.activeHistoryTab = tabName;

    // Update tab UI
    document.querySelectorAll('.history-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.history === tabName);
    });

    // Update content
    const record = patientRecords[HealthState.currentFileNumber];
    if (!record) return;

    const historyList = document.querySelector('.history-list');
    historyList.innerHTML = '';

    switch (tabName) {
        case 'prescriptions':
            renderPrescriptions(record.prescriptions, historyList);
            break;
        case 'diagnoses':
            renderDiagnoses(record.diagnoses, historyList);
            break;
        case 'lab-results':
            renderLabResults(record.labResults, historyList);
            break;
        case 'treatments':
            renderTreatments(record.treatments, historyList);
            break;
    }
}

function renderPrescriptions(prescriptions, container) {
    prescriptions.forEach(rx => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-date">${rx.date}</div>
            <div class="history-detail">${rx.medication} - ${rx.dosage}</div>
            <div class="history-provider">Prescribed by: ${rx.prescribedBy}</div>
        `;
        container.appendChild(item);
    });
}

function renderDiagnoses(diagnoses, container) {
    diagnoses.forEach(dx => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-date">${dx.date}</div>
            <div class="history-detail">
                <strong>Primary Diagnosis:</strong> ${dx.primary}<br>
                <strong>Secondary:</strong> ${dx.secondary}
            </div>
            <div class="history-provider">Diagnosed by: ${dx.diagnosedBy}</div>
        `;
        container.appendChild(item);
    });
}

function renderLabResults(labs, container) {
    labs.forEach(lab => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-date">${lab.date}</div>
            <div class="history-detail">
                <strong>${lab.test}</strong><br>
                ${lab.results}
            </div>
            <div class="history-provider">Ordered by: ${lab.orderedBy}</div>
        `;
        container.appendChild(item);
    });
}

function renderTreatments(treatments, container) {
    treatments.forEach(treatment => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-date">${treatment.date}</div>
            <div class="history-detail">
                <strong>${treatment.plan.split('\n')[0]}</strong><br>
                ${treatment.plan.split('\n').slice(1).join('<br>')}
            </div>
            <div class="history-provider">Planned by: ${treatment.plannedBy}</div>
        `;
        container.appendChild(item);
    });
}

function resetRecordSearch() {
    document.getElementById('recordViewPlaceholder').classList.remove('hidden');
    document.getElementById('recordDetailsSection').classList.add('hidden');
    document.getElementById('fileNumberSearch').value = '';
    HealthState.currentFileNumber = null;
}

function printRecordSummary() {
    if (!HealthState.currentFileNumber) return;

    window.print();
    showNotification('Printing record summary...', 'info');
}

function exportPatientRecord() {
    if (!HealthState.currentFileNumber) return;

    const record = patientRecords[HealthState.currentFileNumber];
    const data = generateRecordExport(HealthState.currentFileNumber, record);
    downloadFile(data, `patient-record-${HealthState.currentFileNumber}.json`, 'application/json');
    showNotification('Patient record exported successfully', 'success');
}

// Compliance Functions
function renderComplianceTimeline() {
    const timeline = document.querySelector('.change-timeline');
    timeline.innerHTML = '';

    HealthState.complianceData.forEach(change => {
        const item = createTimelineItem(change);
        timeline.appendChild(item);
    });
}

function createTimelineItem(change) {
    const item = document.createElement('div');
    item.className = 'timeline-item';

    item.innerHTML = `
        <div class="timeline-marker ${change.type}"></div>
        <div class="timeline-content">
            <div class="timeline-time">
                <i class="fas fa-clock"></i>
                ${change.time}
            </div>
            <div class="timeline-action">
                <i class="fas fa-${getChangeIcon(change.type)}"></i>
                ${change.user} ${change.action} in file ${change.fileNumber}
            </div>
            <div class="timeline-details">
                ${change.details}
            </div>
        </div>
    `;

    return item;
}

function getChangeIcon(type) {
    const icons = {
        prescription: 'pills',
        diagnosis: 'stethoscope',
        lab: 'vial',
        treatment: 'clipboard-list'
    };
    return icons[type] || 'edit';
}

function filterComplianceChanges() {
    const changeType = document.getElementById('changeTypeFilter').value;
    const dateFilter = document.getElementById('changeDateFilter').value;

    // Filter compliance data
    let filtered = [...complianceChanges];

    if (changeType) {
        filtered = filtered.filter(change => change.type === changeType);
    }

    // Update state and re-render
    HealthState.complianceData = filtered;
    renderComplianceTimeline();
}

function updateComplianceScore() {
    // Calculate compliance score (mock calculation)
    const score = 94.2;
    document.querySelector('.score-value').textContent = `${score}%`;
}

function generateComplianceReport() {
    showNotification('Generating compliance report...', 'info');

    setTimeout(() => {
        showNotification('Compliance report generated successfully', 'success');
        // In a real application, this would generate and download a report
    }, 2000);
}

function exportChangeLog() {
    const changes = HealthState.complianceData;
    const csv = generateChangeLogCSV(changes);
    downloadFile(csv, 'change-log.csv', 'text/csv');
    showNotification('Change log exported successfully', 'success');
}

// Reports Functions
function updateReportMetrics() {
    // Update metrics display
    document.querySelector('.metric-item:nth-child(1) .metric-value').textContent = '156 accesses/day avg';
    document.querySelector('.metric-item:nth-child(2) .metric-value').textContent = '10:00-12:00 PM';
    document.querySelector('.metric-item:nth-child(3) .metric-value').textContent = '8 active users/hour';
    document.querySelector('.metric-item:nth-child(4) .metric-value').textContent = '94.2%';
}

function generateHealthReport() {
    const reportType = document.getElementById('reportType').value;
    const reportPeriod = document.getElementById('reportPeriod').value;
    const reportFormat = document.getElementById('reportFormat').value;

    showNotification(`Generating ${reportType} report...`, 'info');

    setTimeout(() => {
        showNotification('Report generated successfully', 'success');
        // In a real application, this would generate and download the report
    }, 2000);
}

// Quick Actions
function quickAudit() {
    switchTab('audit');
    showNotification('Quick audit initiated', 'info');
}

function quickComplianceCheck() {
    switchTab('compliance');
    showNotification('Running compliance check...', 'info');

    setTimeout(() => {
        updateComplianceScore();
        showNotification('Compliance check completed', 'success');
    }, 1500);
}

function quickExportTodayLog() {
    const todayLogs = HealthState.accessLogs.filter(log => log.time.includes('AM') || log.time.includes('PM'));
    const csv = generateAccessLogCSV(todayLogs);
    downloadFile(csv, `access-log-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    showNotification('Today\'s log exported successfully', 'success');
}

function viewAlerts() {
    openModal('alertConfigModal');
}

// Alert Configuration
function updateAlertSettings() {
    // Update alert settings based on toggles
    document.querySelectorAll('.alert-type-item input[type="checkbox"]').forEach((toggle, index) => {
        const alertTypes = ['recordModifications', 'unusualAccess', 'complianceViolations', 'prescriptionChanges'];
        HealthState.alertsEnabled[alertTypes[index]] = toggle.checked;
    });
}

function saveAlertConfiguration() {
    // Save alert configuration
    showNotification('Alert configuration saved successfully', 'success');
    closeModal('alertConfigModal');

    // Log configuration
    console.log('Alert Settings:', HealthState.alertsEnabled);
    console.log('Notification Channels:', HealthState.notificationChannels);
}

// Billing Integration
function verifyBilling() {
    showNotification('Verifying billing integration...', 'info');

    setTimeout(() => {
        // Update verification status
        document.querySelectorAll('.verification-status').forEach(status => {
            if (status.classList.contains('warning')) {
                status.textContent = '3 Discrepancies';
            } else {
                status.textContent = 'Verified';
            }
        });

        showNotification('Billing verification completed', 'success');
    }, 2000);
}

function generateBillingReport() {
    showNotification('Generating billing discrepancy report...', 'info');

    setTimeout(() => {
        showNotification('Billing report generated', 'success');
        // In a real application, this would generate and download the report
    }, 1500);
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // If opening patient record modal, populate it
        if (modalId === 'patientRecordModal' && HealthState.currentFileNumber) {
            populateRecordModal(HealthState.currentFileNumber);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function populateRecordModal(fileNumber) {
    const record = patientRecords[fileNumber];
    if (!record) return;

    // Update modal file number
    document.getElementById('modalFileNumber').textContent = fileNumber.substring(1);

    // Update summary in modal
    const summaryGrid = document.querySelector('.modal-record-summary .summary-grid');
    summaryGrid.querySelector('.summary-item:nth-child(1) .summary-value').textContent = record.lastVisit;
    summaryGrid.querySelector('.summary-item:nth-child(2) .summary-value').textContent = record.primaryDiagnosis;
    summaryGrid.querySelector('.summary-item:nth-child(3) .summary-value').textContent = record.activeMedications;
    summaryGrid.querySelector('.summary-item:nth-child(4) .summary-value').textContent = 'Nov 25, 2024 10:30 AM';

    // Display default modal tab
    switchModalHistoryTab('prescriptions');
}

function switchModalHistoryTab(tabName) {
    HealthState.modalHistoryTab = tabName;

    // Update tab UI
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.modalTab === tabName);
    });

    // Update content
    document.querySelectorAll('.modal-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const tabId = `modal${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`;
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add('active');
    }
}

function printModalSummary() {
    window.print();
    showNotification('Printing record summary...', 'info');
}

// Real-time Updates
function initializeRealTimeUpdates() {
    setInterval(() => {
        if (HealthState.realTimeEnabled && HealthState.selectedClinic) {
            simulateRealTimeUpdate();
        }
    }, 15000); // Every 15 seconds
}

function startRealTimeUpdates() {
    HealthState.realTimeEnabled = true;
    document.querySelector('.realtime-indicator').classList.add('active');
}

function simulateRealTimeUpdate() {
    // Simulate new access log entry
    if (Math.random() > 0.7) {
        const newLog = {
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            user: 'Dr. ' + ['Johnson', 'Williams', 'Brown', 'Davis'][Math.floor(Math.random() * 4)],
            userId: 'DOC' + Math.floor(Math.random() * 100),
            role: 'doctor',
            fileNumber: '#' + Math.floor(Math.random() * 90000 + 10000),
            duration: Math.floor(Math.random() * 20 + 5) + ' min',
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`
        };

        HealthState.accessLogs.unshift(newLog);

        // Update UI if on audit tab
        if (HealthState.currentTab === 'audit') {
            renderAccessLogs();
        }

        // Update stats
        const accessedToday = document.querySelector('.stat-card.info .stat-number');
        accessedToday.textContent = (parseInt(accessedToday.textContent) + 1).toString();

        // Show notification
        showNotification(`New access: ${newLog.user} accessed file ${newLog.fileNumber}`, 'info');
    }
}

// Utility Functions
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

function generateAccessLogCSV(logs) {
    const headers = ['Time', 'User', 'User ID', 'Role', 'File Number', 'Duration', 'IP Address'];
    const rows = logs.map(log => [
        log.time,
        log.user,
        log.userId,
        log.role,
        log.fileNumber,
        log.duration,
        log.ip
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

function generateChangeLogCSV(changes) {
    const headers = ['Time', 'Type', 'Action', 'Details', 'User', 'File Number'];
    const rows = changes.map(change => [
        change.time,
        change.type,
        change.action,
        change.details,
        change.user,
        change.fileNumber
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

function generateRecordExport(fileNumber, record) {
    return JSON.stringify({
        fileNumber,
        exportDate: new Date().toISOString(),
        summary: {
            lastVisit: record.lastVisit,
            primaryDiagnosis: record.primaryDiagnosis,
            activeMedications: record.activeMedications
        },
        medicalHistory: record
    }, null, 2);
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
    const unreadCount = HealthState.notifications.filter(n => n.unread).length;
    const badge = document.querySelector('.notification-badge');
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'block' : 'none';
}

function markNotificationsAsRead() {
    HealthState.notifications.forEach(n => n.unread = false);
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

// Initialize health data
function initializeHealthData() {
    // Set up initial state
    HealthState.accessLogs = [...accessLogsData];
    HealthState.complianceData = [...complianceChanges];
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
    
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    
    .realtime-indicator.active i {
        animation: spin 2s linear infinite;
    }
`;
document.head.appendChild(style);
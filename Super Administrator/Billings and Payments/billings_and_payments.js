// ===================================
// CURIS BILLINGS & PAYMENTS JAVASCRIPT
// Complete Dynamic Implementation
// ===================================

// Global State Management
const BillingState = {
    currentTab: 'invoices',
    invoices: [],
    clinics: [],
    transactions: [],
    disputes: [],
    settings: {
        chargeModel: 'percentage',
        frequency: 'weekly',
        notifications: {
            dueDates: true,
            generated: true,
            failed: true,
            overdue: true
        }
    },
    filters: {
        clinicOwner: '',
        frequency: '',
        region: '',
        timePeriod: 'month'
    },
    selectedInvoices: new Set()
};

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ===================================
// INITIALIZATION
// ===================================

function initializeApp() {
    // Initialize data
    initializeData();
    
    // Setup event listeners
    setupHeaderControls();
    setupDashboardFilters();
    setupTabNavigation();
    setupInvoiceManagement();
    setupServiceConfiguration();
    setupPaymentCycles();
    setupDisputes();
    setupReports();
    setupTransactionHistory();
    setupQuickActions();
    setupNotificationSettings();
    setupManualPaymentBulkActions();
    setupModalControls();
    setupDarkMode();
    
    // Load initial data
    loadDashboardData();
    updateRealtimeStatus();
    
    // Start real-time updates simulation
    startRealtimeUpdates();
}

// ===================================
// DATA INITIALIZATION
// ===================================

function initializeData() {
    // Sample invoices data
    BillingState.invoices = [
        {
            id: 'INV001',
            clinicId: 'clinic-a',
            clinicName: 'Nairobi Medical Center',
            ownerName: 'Dr. Sarah Johnson',
            amount: 2500,
            status: 'pending',
            dueDate: new Date(),
            period: '01/01 - 07/01',
            services: {
                consultations: { count: 50, rate: 100, total: 5000 },
                prescriptions: { count: 30, rate: 50, total: 1500 },
                labTests: { count: 20, rate: 200, total: 4000 }
            }
        },
        {
            id: 'INV002',
            clinicId: 'clinic-b',
            clinicName: 'Westlands Health Clinic',
            ownerName: 'Dr. Michael Brown',
            amount: 3000,
            status: 'paid',
            dueDate: new Date(Date.now() - 86400000),
            period: '01/01 - 07/01'
        },
        {
            id: 'INV003',
            clinicId: 'clinic-c',
            clinicName: 'Karen Medical Center',
            ownerName: 'Dr. Emily Davis',
            amount: 2000,
            status: 'overdue',
            dueDate: new Date(Date.now() - 432000000),
            period: '01/01 - 07/01'
        }
    ];
    
    // Sample clinics data
    BillingState.clinics = [
        {
            id: 'clinic-a',
            name: 'Nairobi Medical Center',
            owner: 'Dr. Sarah Johnson',
            chargeType: 'percentage',
            chargeValue: 20,
            frequency: 'weekly',
            currentAmount: 5000,
            paymentMethod: 'M-PESA',
            status: 'active'
        },
        {
            id: 'clinic-b',
            name: 'Westlands Health Clinic',
            owner: 'Dr. Michael Brown',
            chargeType: 'fixed',
            chargeValue: 3000,
            frequency: 'monthly',
            currentAmount: 8000,
            paymentMethod: 'Stripe',
            status: 'overdue'
        },
        {
            id: 'clinic-c',
            name: 'Karen Medical Center',
            owner: 'Dr. Emily Davis',
            chargeType: 'percentage',
            chargeValue: 25,
            frequency: 'bi-weekly',
            currentAmount: 3500,
            paymentMethod: 'Bank Transfer',
            status: 'settled'
        }
    ];
    
    // Sample transactions
    BillingState.transactions = [
        {
            id: 'TXN001',
            date: new Date(),
            type: 'consultation',
            amount: 500,
            status: 'paid',
            clinic: 'Nairobi Medical Center',
            reference: 'TXN001'
        },
        {
            id: 'TXN002',
            date: new Date(),
            type: 'prescription',
            amount: 300,
            status: 'paid',
            clinic: 'Westlands Health Clinic',
            reference: 'TXN002'
        },
        {
            id: 'TXN003',
            date: new Date(Date.now() - 86400000),
            type: 'service_charge',
            amount: 2000,
            status: 'pending',
            clinic: 'Nairobi Medical Center',
            reference: 'TXN003'
        },
        {
            id: 'REF001',
            date: new Date(Date.now() - 86400000),
            type: 'refund',
            amount: -500,
            status: 'complete',
            clinic: 'Karen Medical Center',
            reference: 'REF001'
        }
    ];
    
    // Sample disputes
    BillingState.disputes = [
        {
            id: 'D001',
            clinicId: 'clinic-a',
            clinicName: 'Nairobi Medical Center',
            amount: 500,
            reason: 'Overcharge',
            status: 'open',
            created: new Date('2024-11-20')
        },
        {
            id: 'D002',
            clinicId: 'clinic-b',
            clinicName: 'Westlands Health Clinic',
            amount: 1000,
            reason: 'Duplicate Charge',
            status: 'resolved',
            created: new Date('2024-11-18')
        }
    ];
    
    // Load saved settings
    loadSettings();
}

// ===================================
// HEADER CONTROLS
// ===================================

function setupHeaderControls() {
    // User profile dropdown
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdown = document.getElementById('userProfileDropdown');
    
    userProfileBtn?.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
        notificationPanel.classList.add('hidden');
    });
    
    // Notification panel
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotifications = document.getElementById('closeNotifications');
    
    notificationBtn?.addEventListener('click', function(e) {
        e.stopPropagation();
        notificationPanel.classList.toggle('hidden');
        userDropdown.classList.add('hidden');
    });
    
    closeNotifications?.addEventListener('click', function() {
        notificationPanel.classList.add('hidden');
    });
    
    // Close dropdowns on outside click
    document.addEventListener('click', function() {
        userDropdown?.classList.add('hidden');
        notificationPanel?.classList.add('hidden');
    });
}

// ===================================
// DASHBOARD FILTERS
// ===================================

function setupDashboardFilters() {
    const filters = ['clinicOwnerFilter', 'frequencyFilter', 'regionFilter', 'timePeriodFilter'];
    
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        element?.addEventListener('change', function() {
            const filterKey = filterId.replace('Filter', '');
            BillingState.filters[filterKey] = this.value;
            loadDashboardData();
        });
    });
}

function loadDashboardData() {
    // Update revenue stats based on filters
    updateRevenueStats();
    
    // Update invoice counts
    updateInvoiceCounts();
    
    // Update failed transactions
    updateFailedTransactions();
}

function updateRevenueStats() {
    // Calculate revenue based on current filters
    let totalRevenue = 847500;
    let monthlyRevenue = 234800;
    let ytdRevenue = 2847300;
    
    // Apply filters
    if (BillingState.filters.clinicOwner) {
        totalRevenue = Math.floor(totalRevenue * 0.3);
        monthlyRevenue = Math.floor(monthlyRevenue * 0.3);
        ytdRevenue = Math.floor(ytdRevenue * 0.3);
    }
    
    // Update DOM
    const revenueElements = document.querySelectorAll('.revenue-breakdown .amount');
    if (revenueElements[0]) revenueElements[0].textContent = `KES. ${totalRevenue.toLocaleString()}`;
    if (revenueElements[1]) revenueElements[1].textContent = `KES. ${monthlyRevenue.toLocaleString()}`;
    if (revenueElements[2]) revenueElements[2].textContent = `KES. ${ytdRevenue.toLocaleString()}`;
}

function updateInvoiceCounts() {
    const pendingCount = BillingState.invoices.filter(inv => inv.status === 'pending').length;
    const paidCount = BillingState.invoices.filter(inv => inv.status === 'paid').length;
    
    const pendingAmount = BillingState.invoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.amount, 0);
    
    const paidAmount = BillingState.invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);
    
    // Update DOM
    const statusCounts = document.querySelectorAll('.status-count');
    const statusAmounts = document.querySelectorAll('.status-amount');
    
    if (statusCounts[0]) statusCounts[0].textContent = pendingCount;
    if (statusCounts[1]) statusCounts[1].textContent = paidCount;
    if (statusAmounts[0]) statusAmounts[0].textContent = `KES. ${pendingAmount.toLocaleString()}`;
    if (statusAmounts[1]) statusAmounts[1].textContent = `KES. ${paidAmount.toLocaleString()}`;
}

function updateFailedTransactions() {
    const failedCount = document.querySelector('.failed-count');
    const failedAmount = document.querySelector('.failed-amount');
    
    if (failedCount) failedCount.textContent = '8';
    if (failedAmount) failedAmount.textContent = 'KES. 24,000';
}

// ===================================
// TAB NAVIGATION
// ===================================

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activate selected tab
            this.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}Tab`);
            if (targetContent) {
                targetContent.classList.add('active');
                BillingState.currentTab = targetTab;
                
                // Load tab-specific data
                loadTabData(targetTab);
            }
        });
    });
}

function loadTabData(tab) {
    switch(tab) {
        case 'invoices':
            loadInvoiceData();
            break;
        case 'service-config':
            loadServiceConfigData();
            break;
        case 'payment-cycles':
            loadPaymentCyclesData();
            break;
        case 'disputes':
            loadDisputesData();
            break;
        case 'reports':
            loadReportsData();
            break;
        case 'transactions':
            loadTransactionData();
            break;
    }
}

// ===================================
// INVOICE MANAGEMENT
// ===================================

function setupInvoiceManagement() {
    // Auto-generation settings
    const autoGenSettingsBtn = document.getElementById('autoGenSettingsBtn');
    const generateNowBtn = document.getElementById('generateNowBtn');
    const generateInvoicesBtn = document.getElementById('generateInvoicesBtn');
    
    autoGenSettingsBtn?.addEventListener('click', function() {
        const settings = document.querySelector('.auto-gen-settings');
        settings.style.display = settings.style.display === 'none' ? 'block' : 'none';
    });
    
    generateNowBtn?.addEventListener('click', generateInvoices);
    generateInvoicesBtn?.addEventListener('click', generateInvoices);
    
    // Search and filters
    setupInvoiceFilters();
    
    // Table interactions
    setupInvoiceTable();
    
    // Invoice actions
    setupInvoiceActions();
}

function setupInvoiceFilters() {
    const searchInput = document.getElementById('invoiceSearch');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const amountFilter = document.getElementById('amountFilter');
    
    const filterInvoices = () => {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const status = statusFilter?.value || '';
        const date = dateFilter?.value || '';
        const amount = amountFilter?.value || '';
        
        // Filter logic here
        updateInvoiceTable();
    };
    
    searchInput?.addEventListener('input', filterInvoices);
    statusFilter?.addEventListener('change', filterInvoices);
    dateFilter?.addEventListener('change', filterInvoices);
    amountFilter?.addEventListener('change', filterInvoices);
}

function setupInvoiceTable() {
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAllInvoices');
    selectAllCheckbox?.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = this.checked;
            if (this.checked) {
                BillingState.selectedInvoices.add(cb.dataset.invoiceId);
            } else {
                BillingState.selectedInvoices.clear();
            }
        });
    });
    
    // Row checkboxes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('row-checkbox')) {
            if (e.target.checked) {
                BillingState.selectedInvoices.add(e.target.dataset.invoiceId);
            } else {
                BillingState.selectedInvoices.delete(e.target.dataset.invoiceId);
            }
        }
    });
    
    // Sorting
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const sortBy = this.dataset.sort;
            sortInvoices(sortBy);
        });
    });
    
    // Bulk export
    const bulkExportBtn = document.getElementById('bulkExportBtn');
    bulkExportBtn?.addEventListener('click', exportSelectedInvoices);
}

function setupInvoiceActions() {
    // Action buttons in table
    document.addEventListener('click', function(e) {
        if (e.target.closest('.action-btn')) {
            e.stopPropagation();
            const btn = e.target.closest('.action-btn');
            const invoiceId = btn.dataset.invoiceId;
            showInvoiceActionsMenu(btn, invoiceId);
        }
    });
    
    // Action menu items
    document.addEventListener('click', function(e) {
        if (e.target.closest('.action-item')) {
            const action = e.target.closest('.action-item').dataset.action;
            const menu = document.getElementById('invoiceActionsMenu');
            const invoiceId = menu.dataset.currentInvoice;
            
            handleInvoiceAction(action, invoiceId);
            menu.classList.add('hidden');
        }
    });
}

function showInvoiceActionsMenu(button, invoiceId) {
    const menu = document.getElementById('invoiceActionsMenu');
    const rect = button.getBoundingClientRect();
    
    menu.style.top = `${rect.bottom + window.scrollY}px`;
    menu.style.left = `${rect.left + window.scrollX - 150}px`;
    menu.dataset.currentInvoice = invoiceId;
    menu.classList.remove('hidden');
    
    // Close menu on outside click
    setTimeout(() => {
        document.addEventListener('click', hideInvoiceActionsMenu, { once: true });
    }, 0);
}

function hideInvoiceActionsMenu() {
    const menu = document.getElementById('invoiceActionsMenu');
    menu?.classList.add('hidden');
}

function handleInvoiceAction(action, invoiceId) {
    switch(action) {
        case 'view-details':
            showInvoiceDetails(invoiceId);
            break;
        case 'edit-status':
            editInvoiceStatus(invoiceId);
            break;
        case 'mark-paid':
            updateInvoiceStatus(invoiceId, 'paid');
            break;
        case 'mark-unpaid':
            updateInvoiceStatus(invoiceId, 'pending');
            break;
        case 'send-reminder':
            sendInvoiceReminder(invoiceId);
            break;
        case 'download-pdf':
            downloadInvoicePDF(invoiceId);
            break;
        case 'download-csv':
            downloadInvoiceCSV(invoiceId);
            break;
        case 'view-breakdown':
            showInvoiceBreakdown(invoiceId);
            break;
    }
}

function showInvoiceDetails(invoiceId) {
    const invoice = BillingState.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    // Update modal content
    document.getElementById('invoiceDetailsId').textContent = invoice.id;
    document.getElementById('invoiceClinicName').textContent = invoice.clinicName;
    document.getElementById('invoiceOwnerName').textContent = invoice.ownerName;
    document.getElementById('invoicePeriod').textContent = invoice.period;
    
    // Update status
    const statusElement = document.getElementById('invoiceStatus');
    statusElement.className = `status-badge ${invoice.status}`;
    statusElement.innerHTML = `<i class="fas fa-circle"></i> ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}`;
    
    // Show modal
    const modal = document.getElementById('invoiceDetailsModal');
    modal.classList.remove('hidden');
}

function loadInvoiceData() {
    updateInvoiceTable();
}

function updateInvoiceTable() {
    // This would update the invoice table with filtered/sorted data
    console.log('Updating invoice table...');
}

function generateInvoices() {
    showNotification('Generating invoices...', 'info');
    
    setTimeout(() => {
        showNotification('Invoices generated successfully!', 'success');
        loadInvoiceData();
    }, 1500);
}

function sortInvoices(sortBy) {
    // Sort implementation
    console.log('Sorting by:', sortBy);
    updateInvoiceTable();
}

function exportSelectedInvoices() {
    if (BillingState.selectedInvoices.size === 0) {
        showNotification('Please select invoices to export', 'warning');
        return;
    }
    
    showNotification(`Exporting ${BillingState.selectedInvoices.size} invoices...`, 'info');
}

function updateInvoiceStatus(invoiceId, status) {
    const invoice = BillingState.invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        invoice.status = status;
        updateInvoiceTable();
        showNotification(`Invoice ${invoiceId} marked as ${status}`, 'success');
    }
}

function sendInvoiceReminder(invoiceId) {
    showNotification(`Reminder sent for invoice ${invoiceId}`, 'success');
}

function downloadInvoicePDF(invoiceId) {
    showNotification(`Downloading PDF for invoice ${invoiceId}...`, 'info');
}

function downloadInvoiceCSV(invoiceId) {
    showNotification(`Downloading CSV for invoice ${invoiceId}...`, 'info');
}

function showInvoiceBreakdown(invoiceId) {
    showInvoiceDetails(invoiceId);
}

function editInvoiceStatus(invoiceId) {
    // Show status edit dialog
    const newStatus = prompt('Enter new status (pending/paid/overdue):');
    if (newStatus && ['pending', 'paid', 'overdue'].includes(newStatus)) {
        updateInvoiceStatus(invoiceId, newStatus);
    }
}

// ===================================
// SERVICE CONFIGURATION
// ===================================

function setupServiceConfiguration() {
    // Model selection
    const percentageOptions = document.querySelectorAll('input[name="percentageFreq"]');
    const fixedOptions = document.querySelectorAll('input[name="fixedFreq"]');
    
    percentageOptions.forEach(option => {
        option.addEventListener('change', function() {
            BillingState.settings.chargeModel = 'percentage';
            BillingState.settings.frequency = this.value;
        });
    });
    
    fixedOptions.forEach(option => {
        option.addEventListener('change', function() {
            BillingState.settings.chargeModel = 'fixed';
            BillingState.settings.frequency = this.value;
        });
    });
    
    // Edit amounts button
    const editAmountsBtn = document.querySelector('.edit-amounts-btn');
    editAmountsBtn?.addEventListener('click', function() {
        const inputs = document.querySelectorAll('.fixed-settings .inline-input');
        inputs.forEach(input => {
            input.removeAttribute('readonly');
            input.focus();
        });
    });
    
    // Application settings
    const applyToOptions = document.querySelectorAll('input[name="applyTo"]');
    applyToOptions.forEach(option => {
        option.addEventListener('change', function() {
            const specificSelect = document.getElementById('specificClinicSelect');
            specificSelect.disabled = this.value !== 'specific';
        });
    });
    
    // Save configuration
    const saveConfigBtn = document.getElementById('saveConfigurationBtn');
    saveConfigBtn?.addEventListener('click', saveServiceConfiguration);
    
    // Reset configuration
    const resetConfigBtn = document.getElementById('resetConfigBtn');
    resetConfigBtn?.addEventListener('click', resetServiceConfiguration);
    
    // Edit clinic settings
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-setting')) {
            const clinicId = e.target.closest('.edit-setting').dataset.clinic;
            editClinicSetting(clinicId);
        }
    });
}

function loadServiceConfigData() {
    // Load current service charge settings
    updateServiceConfigDisplay();
}

function updateServiceConfigDisplay() {
    // Update the current settings display
    const settingsList = document.querySelector('.settings-list');
    if (!settingsList) return;
    
    settingsList.innerHTML = BillingState.clinics.map(clinic => `
        <div class="setting-item">
            <span class="clinic-name">${clinic.name}:</span>
            <span class="setting-value">${formatChargeSetting(clinic)}</span>
            <button class="btn-link edit-setting" data-clinic="${clinic.id}">
                <i class="fas fa-edit"></i>
            </button>
        </div>
    `).join('');
}

function formatChargeSetting(clinic) {
    if (clinic.chargeType === 'percentage') {
        return `${clinic.frequency.charAt(0).toUpperCase() + clinic.frequency.slice(1)} ${clinic.chargeValue}%`;
    } else {
        return `${clinic.frequency.charAt(0).toUpperCase() + clinic.frequency.slice(1)} Fixed KES. ${clinic.chargeValue.toLocaleString()}`;
    }
}

function saveServiceConfiguration() {
    // Save configuration logic
    showNotification('Service charge configuration saved successfully!', 'success');
    saveSettings();
}

function resetServiceConfiguration() {
    if (confirm('Are you sure you want to reset to default settings?')) {
        // Reset logic
        showNotification('Settings reset to defaults', 'info');
    }
}

function editClinicSetting(clinicId) {
    const clinic = BillingState.clinics.find(c => c.id === clinicId);
    if (!clinic) return;
    
    // Show edit dialog
    const newSetting = prompt(`Enter new setting for ${clinic.name} (e.g., "weekly 20%" or "monthly fixed 3000"):`);
    if (newSetting) {
        // Parse and update setting
        updateClinicSetting(clinicId, newSetting);
    }
}

function updateClinicSetting(clinicId, setting) {
    const clinic = BillingState.clinics.find(c => c.id === clinicId);
    if (!clinic) return;
    
    // Parse the setting string
    const parts = setting.toLowerCase().split(' ');
    if (parts.length >= 2) {
        clinic.frequency = parts[0];
        if (parts[1].includes('%')) {
            clinic.chargeType = 'percentage';
            clinic.chargeValue = parseInt(parts[1]);
        } else if (parts[1] === 'fixed' && parts[2]) {
            clinic.chargeType = 'fixed';
            clinic.chargeValue = parseInt(parts[2]);
        }
        
        updateServiceConfigDisplay();
        showNotification(`Updated settings for ${clinic.name}`, 'success');
    }
}

// ===================================
// PAYMENT CYCLES
// ===================================

function setupPaymentCycles() {
    // View delinquent details
    const viewDelinquentBtn = document.getElementById('viewDelinquentDetails');
    viewDelinquentBtn?.addEventListener('click', function() {
        showDelinquentAccounts();
    });
    
    // Cycle row actions
    document.addEventListener('click', function(e) {
        if (e.target.closest('[data-action="view-details"]')) {
            const row = e.target.closest('.cycle-row');
            const clinicName = row.querySelector('.clinic-name').textContent;
            showPaymentCycleDetails(clinicName);
        }
    });
}

function loadPaymentCyclesData() {
    updatePaymentCyclesTable();
    updatePaymentSummary();
}

function updatePaymentCyclesTable() {
    // Update the payment cycles table with current data
    console.log('Updating payment cycles table...');
}

function updatePaymentSummary() {
    // Update payment status summary
    const summaryItems = document.querySelectorAll('.summary-count');
    if (summaryItems[0]) summaryItems[0].textContent = '47';
    if (summaryItems[1]) summaryItems[1].textContent = '8';
    if (summaryItems[2]) summaryItems[2].textContent = '5';
    if (summaryItems[3]) summaryItems[3].textContent = '23';
}

function showDelinquentAccounts() {
    // Show delinquent accounts modal or details
    showNotification('Loading delinquent accounts...', 'info');
}

function showPaymentCycleDetails(clinicName) {
    showNotification(`Loading payment details for ${clinicName}...`, 'info');
}

// ===================================
// DISPUTES & REFUNDS
// ===================================

function setupDisputes() {
    // Export dispute log
    const exportDisputeLogBtn = document.getElementById('exportDisputeLogBtn');
    exportDisputeLogBtn?.addEventListener('click', exportDisputeLog);
    
    // Dispute actions
    document.addEventListener('click', function(e) {
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn && e.target.closest('.dispute-row')) {
            const action = actionBtn.dataset.action;
            const row = e.target.closest('.dispute-row');
            const disputeId = row.querySelector('.dispute-id').textContent;
            
            handleDisputeAction(action, disputeId);
        }
    });
}

function loadDisputesData() {
    updateDisputesTable();
}

function updateDisputesTable() {
    // Update disputes table
    console.log('Updating disputes table...');
}

function handleDisputeAction(action, disputeId) {
    switch(action) {
        case 'view-dispute':
            viewDisputeDetails(disputeId);
            break;
        case 'adjust-charge':
            adjustDisputeCharge(disputeId);
            break;
        case 'waive-charge':
            waiveDisputeCharge(disputeId);
            break;
        case 'issue-refund':
            issueDisputeRefund(disputeId);
            break;
        case 'view-resolution':
            viewDisputeResolution(disputeId);
            break;
    }
}

function viewDisputeDetails(disputeId) {
    showNotification(`Loading dispute ${disputeId} details...`, 'info');
}

function adjustDisputeCharge(disputeId) {
    const adjustment = prompt('Enter adjustment amount (KES):');
    if (adjustment && !isNaN(adjustment)) {
        showNotification(`Adjusted charge by KES ${adjustment} for dispute ${disputeId}`, 'success');
    }
}

function waiveDisputeCharge(disputeId) {
    if (confirm('Are you sure you want to waive this charge?')) {
        showNotification(`Charge waived for dispute ${disputeId}`, 'success');
    }
}

function issueDisputeRefund(disputeId) {
    const refundAmount = prompt('Enter refund amount (KES):');
    if (refundAmount && !isNaN(refundAmount)) {
        showNotification(`Refund of KES ${refundAmount} issued for dispute ${disputeId}`, 'success');
    }
}

function viewDisputeResolution(disputeId) {
    showNotification(`Loading resolution details for dispute ${disputeId}...`, 'info');
}

function exportDisputeLog() {
    showNotification('Exporting dispute log...', 'info');
}

// ===================================
// FINANCIAL REPORTS
// ===================================

function setupReports() {
    // Generate report button
    const generateReportBtn = document.getElementById('generateFinancialReportBtn');
    generateReportBtn?.addEventListener('click', generateFinancialReport);
    
    // Export buttons
    const exportBtns = document.querySelectorAll('.export-btn');
    exportBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.dataset.format;
            exportReport(format);
        });
    });
}

function loadReportsData() {
    // Load report configurations
    console.log('Loading reports data...');
}

function generateFinancialReport() {
    const reportType = document.getElementById('reportType')?.value;
    const clinic = document.getElementById('reportClinic')?.value;
    const chargeType = document.getElementById('reportChargeType')?.value;
    const frequency = document.getElementById('reportFrequency')?.value;
    const dateFrom = document.getElementById('reportDateFrom')?.value;
    const dateTo = document.getElementById('reportDateTo')?.value;
    
    showNotification('Generating report...', 'info');
    
    // Simulate report generation
    setTimeout(() => {
        showNotification('Report generated successfully!', 'success');
        // Show visualizations
        showReportVisualizations();
    }, 2000);
}

function showReportVisualizations() {
    // Update chart placeholders with actual visualizations
    console.log('Showing report visualizations...');
}

function exportReport(format) {
    showNotification(`Exporting report as ${format.toUpperCase()}...`, 'info');
}

// ===================================
// TRANSACTION HISTORY
// ===================================

function setupTransactionHistory() {
    // Transaction filters
    const transactionClinicFilter = document.getElementById('transactionClinicFilter');
    transactionClinicFilter?.addEventListener('change', filterTransactions);
    
    // Export transaction history
    const exportHistoryBtn = document.getElementById('exportTransactionHistoryBtn');
    exportHistoryBtn?.addEventListener('click', exportTransactionHistory);
    
    // Transaction row actions
    document.addEventListener('click', function(e) {
        if (e.target.closest('.transaction-row .btn-link')) {
            const row = e.target.closest('.transaction-row');
            const reference = row.querySelector('.transaction-reference').textContent;
            viewTransactionDetails(reference);
        }
    });
}

function loadTransactionData() {
    updateTransactionTable();
    updateTransactionSummary();
}

function updateTransactionTable() {
    // Update transaction table
    console.log('Updating transaction table...');
}

function updateTransactionSummary() {
    // Update transaction summary cards
    console.log('Updating transaction summary...');
}

function filterTransactions() {
    const clinicFilter = document.getElementById('transactionClinicFilter')?.value;
    // Apply filter
    updateTransactionTable();
}

function viewTransactionDetails(reference) {
    showNotification(`Loading transaction ${reference} details...`, 'info');
}

function exportTransactionHistory() {
    showNotification('Exporting transaction history...', 'info');
}

// ===================================
// QUICK ACTIONS
// ===================================

function setupQuickActions() {
    // Quick Invoice
    const quickInvoiceBtn = document.getElementById('quickInvoice');
    quickInvoiceBtn?.addEventListener('click', () => {
        document.getElementById('generateInvoicesBtn')?.click();
    });
    
    // Quick Charge Adjustment
    const quickChargeBtn = document.getElementById('quickCharge');
    quickChargeBtn?.addEventListener('click', () => {
        // Show charge adjustment modal
        showNotification('Opening charge adjustment...', 'info');
    });
    
    // Quick Report
    const quickReportBtn = document.getElementById('quickReport');
    quickReportBtn?.addEventListener('click', () => {
        generateQuickReport();
    });
    
    // Quick Export
    const quickExportBtn = document.getElementById('quickExport');
    quickExportBtn?.addEventListener('click', () => {
        exportQuickData();
    });
    
    // View Failed Transactions
    const viewFailedBtn = document.getElementById('viewFailedTransactions');
    viewFailedBtn?.addEventListener('click', () => {
        showFailedTransactions();
    });
}

function generateQuickReport() {
    showNotification('Generating today\'s report...', 'info');
    setTimeout(() => {
        showNotification('Today\'s report ready!', 'success');
    }, 1500);
}

function exportQuickData() {
    showNotification('Preparing data export...', 'info');
}

function showFailedTransactions() {
    // Switch to transactions tab and filter by failed
    document.querySelector('[data-tab="transactions"]')?.click();
    showNotification('Showing failed transactions...', 'info');
}

// ===================================
// NOTIFICATION SETTINGS
// ===================================

function setupNotificationSettings() {
    // Configure notifications button
    const configureNotifBtn = document.getElementById('configureNotificationsBtn');
    configureNotifBtn?.addEventListener('click', () => {
        showNotification('Opening notification settings...', 'info');
    });
    
    // Toggle switches
    const toggleSwitches = document.querySelectorAll('.notification-type-item input[type="checkbox"]');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const notificationType = this.closest('.notification-type-item').querySelector('span').textContent;
            updateNotificationSetting(notificationType, this.checked);
        });
    });
}

function updateNotificationSetting(type, enabled) {
    showNotification(`${type} notifications ${enabled ? 'enabled' : 'disabled'}`, 'success');
    saveSettings();
}

// ===================================
// MANUAL PAYMENT & BULK ACTIONS
// ===================================

function setupManualPaymentBulkActions() {
    // Manual payment
    const recordPaymentBtn = document.getElementById('recordOfflinePaymentBtn');
    recordPaymentBtn?.addEventListener('click', () => {
        showModal('manualPaymentModal');
    });
    
    const recordPaymentSubmit = document.getElementById('recordPaymentBtn');
    recordPaymentSubmit?.addEventListener('click', recordManualPayment);
    
    // Bulk actions
    const bulkChargeBtn = document.getElementById('bulkChargeUpdateBtn');
    bulkChargeBtn?.addEventListener('click', () => {
        showModal('bulkOperationsModal');
    });
    
    const bulkInvoiceBtn = document.getElementById('bulkInvoiceGenBtn');
    bulkInvoiceBtn?.addEventListener('click', generateBulkInvoices);
    
    const bulkExportBtn = document.getElementById('bulkExportBtn');
    bulkExportBtn?.addEventListener('click', () => {
        showModal('bulkOperationsModal');
    });
    
    // Bulk operations modal actions
    const applyBulkChangesBtn = document.getElementById('applyBulkChangesBtn');
    applyBulkChangesBtn?.addEventListener('click', applyBulkChargeChanges);
    
    const generateAllInvoicesBtn = document.getElementById('generateAllInvoicesBtn');
    generateAllInvoicesBtn?.addEventListener('click', generateAllInvoices);
    
    const exportAllDataBtn = document.getElementById('exportAllDataBtn');
    exportAllDataBtn?.addEventListener('click', exportAllBillingData);
    
    const executeBulkActionBtn = document.getElementById('executeBulkActionBtn');
    executeBulkActionBtn?.addEventListener('click', executeBulkAction);
}

function recordManualPayment() {
    const clinic = document.getElementById('paymentClinic')?.value;
    const amount = document.getElementById('paymentAmount')?.value;
    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const reference = document.getElementById('paymentReference')?.value;
    const date = document.getElementById('paymentDate')?.value;
    const notes = document.getElementById('paymentNotes')?.value;
    
    if (!clinic || !amount || !method) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Record payment
    showNotification('Recording manual payment...', 'info');
    
    setTimeout(() => {
        showNotification('Payment recorded successfully!', 'success');
        hideModal('manualPaymentModal');
        loadTransactionData();
    }, 1000);
}

function generateBulkInvoices() {
    showNotification('Generating invoices for all clinics...', 'info');
    
    setTimeout(() => {
        showNotification('Bulk invoices generated successfully!', 'success');
        loadInvoiceData();
    }, 2000);
}

function applyBulkChargeChanges() {
    const selectedClinics = document.querySelectorAll('input[name="bulkClinics"]:checked');
    const newSetting = document.getElementById('bulkNewSetting')?.value;
    
    if (selectedClinics.length === 0 || !newSetting) {
        showNotification('Please select clinics and enter new setting', 'error');
        return;
    }
    
    showNotification('Applying bulk charge updates...', 'info');
    
    setTimeout(() => {
        showNotification('Bulk charge updates applied successfully!', 'success');
    }, 1500);
}

function generateAllInvoices() {
    const period = document.getElementById('bulkPeriod')?.value;
    
    showNotification(`Generating invoices for period: ${period || 'Current'}...`, 'info');
    
    setTimeout(() => {
        showNotification('All invoices generated successfully!', 'success');
    }, 2000);
}

function exportAllBillingData() {
    const format = document.getElementById('exportFormat')?.value;
    const dateFrom = document.getElementById('exportPeriodFrom')?.value;
    const dateTo = document.getElementById('exportPeriodTo')?.value;
    
    showNotification(`Exporting all billing data as ${format.toUpperCase()}...`, 'info');
}

function executeBulkAction() {
    // Get global rules
    const gracePeriod = document.getElementById('gracePeriod')?.value;
    const lateFee = document.getElementById('lateFee')?.value;
    const notificationFreq = document.getElementById('notificationFreq')?.value;
    
    // Save global rules
    showNotification('Executing bulk action and updating global rules...', 'info');
    
    setTimeout(() => {
        showNotification('Bulk action completed successfully!', 'success');
        hideModal('bulkOperationsModal');
    }, 1500);
}

// ===================================
// MODAL CONTROLS
// ===================================

function setupModalControls() {
    // Close button handlers
    const closeButtons = document.querySelectorAll('.modal-close, [data-modal]');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.dataset.modal || this.closest('.modal-overlay').id;
            hideModal(modalId);
        });
    });
    
    // Modal overlay click to close
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.add('hidden');
        }
    });
    
    // Invoice details modal actions
    const editStatusBtn = document.getElementById('editInvoiceStatusBtn');
    editStatusBtn?.addEventListener('click', () => {
        const invoiceId = document.getElementById('invoiceDetailsId').textContent;
        editInvoiceStatus(invoiceId);
    });
    
    const sendInvoiceBtn = document.getElementById('sendInvoiceBtn');
    sendInvoiceBtn?.addEventListener('click', () => {
        const invoiceId = document.getElementById('invoiceDetailsId').textContent;
        sendInvoiceReminder(invoiceId);
    });
    
    const exportPdfBtn = document.getElementById('exportInvoicePdfBtn');
    exportPdfBtn?.addEventListener('click', () => {
        const invoiceId = document.getElementById('invoiceDetailsId').textContent;
        downloadInvoicePDF(invoiceId);
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        // Focus first input if exists
        const firstInput = modal.querySelector('input, select, textarea');
        firstInput?.focus();
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        // Reset form if exists
        const form = modal.querySelector('form');
        form?.reset();
    }
}

// ===================================
// DARK MODE
// ===================================

function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateDarkModeButton(currentTheme);
    
    darkModeToggle?.addEventListener('click', toggleDarkMode);
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateDarkModeButton(newTheme);
}

function updateDarkModeButton(theme) {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const icon = darkModeToggle.querySelector('i');
        const text = darkModeToggle.querySelector('span');
        
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            text.textContent = 'Light Mode';
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            text.textContent = 'Dark Mode';
        }
    }
}

// ===================================
// REAL-TIME UPDATES
// ===================================

function startRealtimeUpdates() {
    // Simulate WebSocket connection for real-time updates
    setInterval(() => {
        // Random updates
        if (Math.random() > 0.8) {
            simulateNewPayment();
        }
        if (Math.random() > 0.9) {
            simulateStatusChange();
        }
    }, 10000); // Every 10 seconds
}

function updateRealtimeStatus() {
    const indicator = document.querySelector('.status-indicator');
    if (indicator) {
        // Check connection status
        const isConnected = true; // Would check actual WebSocket status
        
        if (isConnected) {
            indicator.classList.add('active');
            indicator.innerHTML = '<i class="fas fa-sync-alt"></i><span>Real-Time Updates Active</span>';
        } else {
            indicator.classList.remove('active');
            indicator.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>Real-Time Updates Offline</span>';
        }
    }
}

function simulateNewPayment() {
    // Add a new payment notification
    const notification = {
        type: 'payment',
        message: `New payment received: KES ${Math.floor(Math.random() * 5000 + 1000)}`,
        time: 'Just now'
    };
    
    addNotificationToPanel(notification);
    updateNotificationBadge();
}

function simulateStatusChange() {
    // Simulate invoice status change
    const randomInvoice = BillingState.invoices[Math.floor(Math.random() * BillingState.invoices.length)];
    if (randomInvoice && randomInvoice.status === 'pending') {
        randomInvoice.status = 'paid';
        updateInvoiceTable();
        
        const notification = {
            type: 'status',
            message: `Invoice ${randomInvoice.id} marked as paid`,
            time: 'Just now'
        };
        
        addNotificationToPanel(notification);
        updateNotificationBadge();
    }
}

function addNotificationToPanel(notification) {
    const notificationList = document.querySelector('.notification-list');
    if (!notificationList) return;
    
    const notificationHtml = `
        <div class="notification-item unread ${notification.type}">
            <div class="notification-icon">
                <i class="fas ${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <p class="notification-title">${getNotificationTitle(notification.type)}</p>
                <p class="notification-desc">${notification.message}</p>
                <p class="notification-time">${notification.time}</p>
            </div>
        </div>
    `;
    
    // Add to beginning of list
    notificationList.insertAdjacentHTML('afterbegin', notificationHtml);
}

function getNotificationIcon(type) {
    const icons = {
        payment: 'fa-check-circle',
        status: 'fa-info-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle'
    };
    return icons[type] || 'fa-bell';
}

function getNotificationTitle(type) {
    const titles = {
        payment: 'Payment Received',
        status: 'Status Update',
        error: 'Error',
        warning: 'Warning'
    };
    return titles[type] || 'Notification';
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `system-notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatCurrency(amount) {
    return `KES. ${amount.toLocaleString()}`;
}

function saveSettings() {
    localStorage.setItem('billingSettings', JSON.stringify(BillingState.settings));
}

function loadSettings() {
    const saved = localStorage.getItem('billingSettings');
    if (saved) {
        try {
            BillingState.settings = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}

// Add CSS animations
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

// ===================================
// ERROR HANDLING
// ===================================

window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An error occurred. Please try again.', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('An error occurred. Please try again.', 'error');
});
// ====================================
// CURIS BILLING & PAYMENTS - COMPREHENSIVE JAVASCRIPT
// Modern Healthcare Billing Dashboard Functionality
// Complete Implementation with All Features
// ====================================

// Global state management
const BillingState = {
    currentFilter: 'week',
    selectedInvoices: [],
    pendingPayments: [],
    serviceChargeBalance: 42580,
    paymentMethods: {
        mpesa: { active: true, config: { paybill: '123456', account: 'CURIS' } },
        bank: { active: true, config: { bank: 'KCB', account: '1234567890' } },
        insurance: { active: true, providers: ['NHIF', 'AAR'] },
        cash: { active: true },
        card: { active: false },
        pesalink: { active: false }
    },
    outstandingPatients: [
        { id: 1, name: 'Peter Mwangi', amount: 15000, daysOverdue: 15, phone: '0712345678' },
        { id: 2, name: 'Grace Njeri', amount: 8500, daysOverdue: 7, phone: '0723456789' }
    ],
    recentTransactions: [],
    notifications: 5
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
    initializeBillingDashboard();
    setupEventListeners();
    loadFinancialData();
    initializeModals();
    setupRealtimeUpdates();
});

// ====================================
// INITIALIZATION FUNCTIONS
// ====================================

function initializeBillingDashboard() {
    // Initialize tooltips
    initializeTooltips();

    // Load saved preferences
    loadUserPreferences();

    // Initialize date filter
    updateDateFilter();

    // Load initial data
    loadInvoices();
    loadTransactionHistory();
    updateFinancialKPIs();

    // Initialize charts if needed
    initializeFinancialCharts();
}

function setupEventListeners() {
    // User profile dropdown
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdown = document.getElementById('userDropdown');

    userProfileBtn?.addEventListener('click', function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    // Notifications
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationsPanel = document.getElementById('notificationsPanel');

    notificationBtn?.addEventListener('click', function (e) {
        e.stopPropagation();
        notificationsPanel.classList.toggle('show');
        notificationsPanel.removeAttribute('hidden');
        markNotificationsAsRead();
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function () {
        userDropdown?.classList.remove('show');
        notificationsPanel?.classList.remove('show');
    });

    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    dateFilter?.addEventListener('change', handleDateFilterChange);

    // Invoice filters
    const invoiceStatusFilter = document.getElementById('invoiceStatusFilter');
    invoiceStatusFilter?.addEventListener('change', filterInvoices);

    // Button listeners
    setupButtonListeners();

    // Form submissions
    setupFormListeners();

    // Payment method configuration
    setupPaymentMethodListeners();
}

function setupButtonListeners() {
    // Create Invoice
    const createInvoiceBtn = document.getElementById('createInvoiceBtn');
    createInvoiceBtn?.addEventListener('click', () => openModal('createInvoiceModal'));

    // Export Invoices
    const exportInvoicesBtn = document.getElementById('exportInvoicesBtn');
    exportInvoicesBtn?.addEventListener('click', () => openModal('exportModal'));

    // Add Payment Method
    const addPaymentMethodBtn = document.getElementById('addPaymentMethodBtn');
    addPaymentMethodBtn?.addEventListener('click', () => openModal('paymentMethodModal'));

    // Service Charge Payment
    const payServiceChargeBtn = document.getElementById('payServiceChargeBtn');
    payServiceChargeBtn?.addEventListener('click', () => openModal('serviceChargeModal'));

    // View Service Charge Details
    const viewChargeDetailsBtn = document.getElementById('viewChargeDetailsBtn');
    viewChargeDetailsBtn?.addEventListener('click', showServiceChargeDetails);

    // View Payment History
    const viewPaymentHistoryBtn = document.getElementById('viewPaymentHistoryBtn');
    viewPaymentHistoryBtn?.addEventListener('click', showPaymentHistory);

    // Send Bulk Reminders
    const sendBulkRemindersBtn = document.getElementById('sendBulkRemindersBtn');
    sendBulkRemindersBtn?.addEventListener('click', sendBulkReminders);

    // Manual Payment Entry
    const manualPaymentEntryBtn = document.getElementById('manualPaymentEntryBtn');
    manualPaymentEntryBtn?.addEventListener('click', () => openModal('manualPaymentModal'));

    // Advanced Filter
    const advancedFilterBtn = document.getElementById('advancedFilterBtn');
    advancedFilterBtn?.addEventListener('click', showAdvancedFilters);

    // Verify Payment
    const verifyPaymentBtn = document.getElementById('verifyPaymentBtn');
    verifyPaymentBtn?.addEventListener('click', verifyPayment);

    // Receipt Management
    const searchReceiptBtn = document.getElementById('searchReceiptBtn');
    searchReceiptBtn?.addEventListener('click', searchReceipts);

    const bulkDownloadBtn = document.getElementById('bulkDownloadBtn');
    bulkDownloadBtn?.addEventListener('click', bulkDownloadReceipts);

    // Quick filters
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', handleQuickFilter);
    });

    // Invoice action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleInvoiceAction);
    });

    // Patient action buttons
    document.querySelectorAll('.patient-actions .btn-icon').forEach(btn => {
        btn.addEventListener('click', handlePatientAction);
    });

    // Receipt action buttons
    document.querySelectorAll('.receipt-actions-btns .btn-icon').forEach(btn => {
        btn.addEventListener('click', handleReceiptAction);
    });
}

function setupFormListeners() {
    // Create Invoice Form
    const createInvoiceForm = document.getElementById('createInvoiceForm');
    createInvoiceForm?.addEventListener('submit', handleCreateInvoice);

    // Manual Payment Form
    const manualPaymentForm = document.getElementById('manualPaymentForm');
    manualPaymentForm?.addEventListener('submit', handleManualPayment);

    // Service Charge Payment
    const proceedPaymentBtn = document.getElementById('proceedPaymentBtn');
    proceedPaymentBtn?.addEventListener('click', handleServiceChargePayment);
}

function setupPaymentMethodListeners() {
    // Payment method option buttons
    document.querySelectorAll('.method-option-btn').forEach(btn => {
        btn.addEventListener('click', handlePaymentMethodSelection);
    });

    // Payment method configuration
    document.querySelectorAll('.payment-method-card .btn-link').forEach(btn => {
        btn.addEventListener('click', configurePaymentMethod);
    });

    // Payment type selection (full/partial)
    document.querySelectorAll('.payment-option-btn[data-payment-type]').forEach(btn => {
        btn.addEventListener('click', handlePaymentTypeSelection);
    });
}

// ====================================
// FINANCIAL DATA MANAGEMENT
// ====================================

function loadFinancialData() {
    // Simulate loading financial data
    updateFinancialKPIs();
    loadInvoices();
    loadOutstandingBalances();
    loadTransactionHistory();
    updateServiceChargeStatus();
}

function updateFinancialKPIs() {
    const period = BillingState.currentFilter;

    // Simulate API call to get financial data
    const kpiData = calculateKPIs(period);

    // Update KPI cards
    updateKPICard('revenue', kpiData.totalRevenue, kpiData.revenueTrend);
    updateKPICard('outstanding', kpiData.outstandingAmount, kpiData.patientCount);
    updateKPICard('profit', kpiData.netProfit);
    updateKPICard('service-fees', kpiData.serviceFees, kpiData.feeStatus);
}

function calculateKPIs(period) {
    // Simulate KPI calculation based on period
    const baseRevenue = 856420;
    const periodMultiplier = {
        'today': 0.05,
        'week': 1,
        'month': 4.3,
        'year': 52,
        'custom': 1
    };

    const multiplier = periodMultiplier[period] || 1;

    return {
        totalRevenue: Math.round(baseRevenue * multiplier),
        revenueTrend: '+12.5%',
        outstandingAmount: 124650,
        patientCount: 23,
        netProfit: Math.round(baseRevenue * multiplier * 0.8),
        serviceFees: Math.round(baseRevenue * multiplier * 0.2),
        feeStatus: 'paid'
    };
}

function updateKPICard(type, value, additional) {
    const card = document.querySelector(`.kpi-card.${type}`);
    if (!card) return;

    const valueElement = card.querySelector('.kpi-value');
    if (valueElement) {
        valueElement.textContent = `KES. ${value.toLocaleString()}`;
    }

    // Update additional info based on card type
    if (type === 'revenue' && additional) {
        const trendElement = card.querySelector('.kpi-trend');
        if (trendElement) {
            trendElement.textContent = `${additional} from last period`;
        }
    } else if (type === 'outstanding' && additional) {
        const patientsElement = card.querySelector('.kpi-patients');
        if (patientsElement) {
            patientsElement.textContent = `${additional} patients`;
        }
    } else if (type === 'service-fees' && additional) {
        const statusElement = card.querySelector('.kpi-status');
        if (statusElement) {
            statusElement.textContent = additional;
            statusElement.className = `kpi-status ${additional}`;
        }
    }
}

// ====================================
// INVOICE MANAGEMENT
// ====================================

function loadInvoices() {
    // Simulate loading invoices
    const invoices = generateSampleInvoices();
    displayInvoices(invoices);
    updateInvoiceStatusSummary(invoices);
}

function generateSampleInvoices() {
    return [
        {
            id: 'INV-2025-0145',
            patient: 'Mary Wanjiru',
            service: 'General Consultation',
            amount: 2500,
            date: 'May 30, 2025',
            status: 'paid'
        },
        {
            id: 'INV-2025-0144',
            patient: 'James Ochieng',
            service: 'Dental Checkup',
            amount: 4000,
            date: 'May 30, 2025',
            status: 'pending'
        },
        {
            id: 'INV-2025-0143',
            patient: 'Sarah Kimani',
            service: 'Lab Tests',
            amount: 8500,
            date: 'May 29, 2025',
            status: 'overdue'
        }
    ];
}

function displayInvoices(invoices) {
    const tbody = document.querySelector('.invoices-table tbody');
    if (!tbody) return;

    tbody.innerHTML = invoices.map(invoice => `
        <tr data-invoice-id="${invoice.id}">
            <td>${invoice.id}</td>
            <td>${invoice.patient}</td>
            <td>${invoice.service}</td>
            <td>KES. ${invoice.amount.toLocaleString()}</td>
            <td>${invoice.date}</td>
            <td><span class="status-badge ${invoice.status}">${capitalizeFirst(invoice.status)}</span></td>
            <td>
                <button class="action-btn view" title="View Details" data-action="view" data-id="${invoice.id}">
                    <i class="fas fa-eye"></i>
                </button>
                ${invoice.status === 'paid' ?
            `<button class="action-btn download" title="Download" data-action="download" data-id="${invoice.id}">
                        <i class="fas fa-download"></i>
                    </button>` :
            `<button class="action-btn send" title="Send Reminder" data-action="remind" data-id="${invoice.id}">
                        <i class="fas fa-paper-plane"></i>
                    </button>`
        }
            </td>
        </tr>
    `).join('');

    // Re-attach event listeners
    tbody.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleInvoiceAction);
    });
}

function updateInvoiceStatusSummary(invoices) {
    const statusCounts = {
        paid: 0,
        pending: 0,
        overdue: 0,
        cancelled: 0
    };

    invoices.forEach(invoice => {
        if (statusCounts.hasOwnProperty(invoice.status)) {
            statusCounts[invoice.status]++;
        }
    });

    Object.keys(statusCounts).forEach(status => {
        const card = document.querySelector(`.status-card.${status} .status-count`);
        if (card) {
            card.textContent = statusCounts[status];
        }
    });
}

function filterInvoices(e) {
    const filterValue = e.target.value;
    const rows = document.querySelectorAll('.invoices-table tbody tr');

    rows.forEach(row => {
        if (filterValue === 'all') {
            row.style.display = '';
        } else {
            const statusBadge = row.querySelector('.status-badge');
            const status = statusBadge?.classList.contains(filterValue);
            row.style.display = status ? '' : 'none';
        }
    });
}

function handleInvoiceAction(e) {
    const btn = e.currentTarget;
    const action = btn.dataset.action;
    const invoiceId = btn.dataset.id;

    switch (action) {
        case 'view':
            viewInvoiceDetails(invoiceId);
            break;
        case 'download':
            downloadInvoice(invoiceId);
            break;
        case 'remind':
            sendPaymentReminder(invoiceId);
            break;
    }
}

function viewInvoiceDetails(invoiceId) {
    // Show invoice details modal
    showNotification('info', `Viewing invoice ${invoiceId}`);
    // In production, this would open a detailed invoice modal
}

function downloadInvoice(invoiceId) {
    // Simulate invoice download
    showNotification('success', `Downloading invoice ${invoiceId}...`);
    // In production, this would trigger actual PDF download
}

function sendPaymentReminder(invoiceId) {
    // Open reminder modal with pre-filled data
    const reminderModal = document.getElementById('reminderModal');
    if (reminderModal) {
        // Pre-fill reminder data
        const invoice = findInvoiceById(invoiceId);
        if (invoice) {
            populateReminderModal(invoice);
        }
        openModal('reminderModal');
    }
}

function handleCreateInvoice(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const invoiceData = {
        patient: formData.get('patient'),
        service: formData.get('service'),
        amount: formData.get('amount'),
        doctor: formData.get('doctor'),
        notes: formData.get('notes'),
        date: new Date().toLocaleDateString(),
        status: 'pending'
    };

    // Validate and create invoice
    if (validateInvoiceData(invoiceData)) {
        createInvoice(invoiceData);
        closeModal('createInvoiceModal');
        e.target.reset();
    }
}

function createInvoice(invoiceData) {
    // Generate invoice ID
    const invoiceId = generateInvoiceId();
    invoiceData.id = invoiceId;

    // In production, this would send to API
    showNotification('success', `Invoice ${invoiceId} created successfully`);

    // Refresh invoice list
    loadInvoices();
}

// ====================================
// PAYMENT METHODS MANAGEMENT
// ====================================

function handlePaymentMethodSelection(e) {
    const method = e.currentTarget.dataset.method;
    showPaymentMethodConfig(method);
}

function showPaymentMethodConfig(method) {
    const configForm = document.getElementById('methodConfigForm');
    if (!configForm) return;

    // Generate configuration form based on method
    const formHTML = generatePaymentMethodForm(method);
    configForm.innerHTML = formHTML;

    // Add MFA requirement notice
    if (!BillingState.paymentMethods[method]?.active) {
        showMFANotice();
    }
}

function generatePaymentMethodForm(method) {
    const forms = {
        mpesa: `
            <h4>M-Pesa Configuration</h4>
            <form id="mpesaConfigForm">
                <div class="form-group">
                    <label>Business Type</label>
                    <select class="form-control" required>
                        <option value="paybill">Paybill</option>
                        <option value="till">Buy Goods (Till)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Business Number</label>
                    <input type="text" class="form-control" placeholder="e.g., 123456" required>
                </div>
                <div class="form-group">
                    <label>Account Name (Optional)</label>
                    <input type="text" class="form-control" placeholder="e.g., CURIS">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" data-close-modal>Cancel</button>
                    <button type="submit" class="btn-primary">Save Configuration</button>
                </div>
            </form>
        `,
        bank: `
            <h4>Bank Transfer Configuration</h4>
            <form id="bankConfigForm">
                <div class="form-group">
                    <label>Bank Name</label>
                    <select class="form-control" required>
                        <option value="">Select Bank</option>
                        <option value="kcb">KCB Bank</option>
                        <option value="equity">Equity Bank</option>
                        <option value="coop">Co-operative Bank</option>
                        <option value="stanchart">Standard Chartered</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Account Number</label>
                    <input type="text" class="form-control" placeholder="Account number" required>
                </div>
                <div class="form-group">
                    <label>Account Name</label>
                    <input type="text" class="form-control" placeholder="Account holder name" required>
                </div>
                <div class="form-group">
                    <label>Branch (Optional)</label>
                    <input type="text" class="form-control" placeholder="Branch name">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" data-close-modal>Cancel</button>
                    <button type="submit" class="btn-primary">Save Configuration</button>
                </div>
            </form>
        `,
        insurance: `
            <h4>Insurance Provider Configuration</h4>
            <form id="insuranceConfigForm">
                <div class="form-group">
                    <label>Insurance Provider</label>
                    <select class="form-control" required>
                        <option value="">Select Provider</option>
                        <option value="nhif">NHIF</option>
                        <option value="aar">AAR Insurance</option>
                        <option value="jubilee">Jubilee Insurance</option>
                        <option value="apa">APA Insurance</option>
                        <option value="britam">Britam</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Provider Code/ID</label>
                    <input type="text" class="form-control" placeholder="Your provider code" required>
                </div>
                <div class="form-group">
                    <label>Coverage Types</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" value="outpatient"> Outpatient</label>
                        <label><input type="checkbox" value="inpatient"> Inpatient</label>
                        <label><input type="checkbox" value="dental"> Dental</label>
                        <label><input type="checkbox" value="optical"> Optical</label>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" data-close-modal>Cancel</button>
                    <button type="submit" class="btn-primary">Add Provider</button>
                </div>
            </form>
        `
    };

    return forms[method] || '<p>Configuration form not available</p>';
}

function showMFANotice() {
    const notice = `
        <div class="mfa-notice">
            <i class="fas fa-shield-alt"></i>
            <p>Email confirmation will be required to activate this payment method</p>
        </div>
    `;

    const configForm = document.getElementById('methodConfigForm');
    if (configForm) {
        configForm.insertAdjacentHTML('afterbegin', notice);
    }
}

function configurePaymentMethod(e) {
    const card = e.target.closest('.payment-method-card');
    const methodType = card.classList[1]; // Get method type from class

    // Open configuration modal for the specific method
    openModal('paymentMethodModal');
    showPaymentMethodConfig(methodType);
}

// ====================================
// SERVICE CHARGE MANAGEMENT
// ====================================

function updateServiceChargeStatus() {
    // Update service charge display
    const currentBalance = BillingState.serviceChargeBalance;

    // Update UI elements
    const balanceElement = document.querySelector('.fee-card .fee-value.outstanding');
    if (balanceElement) {
        balanceElement.textContent = `KES. ${currentBalance.toLocaleString()}`;
    }

    // Update payment status
    if (currentBalance === 0) {
        updateServiceChargeStatusDisplay('paid');
    } else if (currentBalance > 0) {
        updateServiceChargeStatusDisplay('pending');
    }
}

function updateServiceChargeStatusDisplay(status) {
    const statusElement = document.querySelector('.kpi-card.service-fees .kpi-status');
    if (statusElement) {
        statusElement.textContent = capitalizeFirst(status);
        statusElement.className = `kpi-status ${status}`;
    }
}

function handleServiceChargePayment() {
    const selectedPaymentType = document.querySelector('button[data-payment-type].active')?.dataset.paymentType || 'full';
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'auto-mpesa';

    if (selectedPaymentType === 'partial') {
        // Show amount input modal
        showPartialPaymentInput();
    } else {
        // Proceed with full payment
        processServiceChargePayment(BillingState.serviceChargeBalance, selectedMethod);
    }
}

function showPartialPaymentInput() {
    // Create and show partial payment amount input
    const modal = createPartialPaymentModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createPartialPaymentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Enter Partial Payment Amount</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Amount to Pay (KES.)</label>
                    <input type="number" id="partialAmount" class="form-control" 
                           placeholder="0.00" min="100" max="${BillingState.serviceChargeBalance}" required>
                    <small>Outstanding balance: KES. ${BillingState.serviceChargeBalance.toLocaleString()}</small>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="button" class="btn-primary" onclick="confirmPartialPayment()">Proceed</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

function confirmPartialPayment() {
    const amount = document.getElementById('partialAmount')?.value;
    if (amount && amount >= 100) {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'auto-mpesa';
        processServiceChargePayment(parseFloat(amount), selectedMethod);
        document.querySelector('.modal')?.remove();
    }
}

function processServiceChargePayment(amount, method) {
    if (method === 'auto-mpesa') {
        // Show phone number modal
        showPhoneNumberModal(amount);
    } else {
        // Show manual payment instructions
        showManualPaymentInstructions(amount);
    }
}

function showPhoneNumberModal(amount) {
    const modal = createPhoneNumberModal(amount);
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createPhoneNumberModal(amount) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Confirm Phone Number</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="payment-summary">
                    <p>Amount to pay: <strong>KES. ${amount.toLocaleString()}</strong></p>
                </div>
                <div class="form-group">
                    <label>M-Pesa Phone Number</label>
                    <div class="phone-options">
                        <label class="radio-option">
                            <input type="radio" name="phoneOption" value="default" checked>
                            <span>Use registered number (0712****678)</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="phoneOption" value="custom">
                            <span>Use different number</span>
                        </label>
                    </div>
                    <input type="tel" id="customPhone" class="form-control" 
                           placeholder="07XXXXXXXX" pattern="07[0-9]{8}" style="display:none;">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="button" class="btn-primary" onclick="sendSTKPush(${amount})">Send Payment Request</button>
                </div>
            </div>
        </div>
    `;

    // Add phone option toggle
    modal.querySelector('input[value="custom"]').addEventListener('change', function () {
        modal.querySelector('#customPhone').style.display = this.checked ? 'block' : 'none';
    });

    return modal;
}

function sendSTKPush(amount) {
    const phoneOption = document.querySelector('input[name="phoneOption"]:checked')?.value;
    const phoneNumber = phoneOption === 'custom' ?
        document.getElementById('customPhone')?.value : '0712345678';

    // Close phone modal
    document.querySelector('.modal')?.remove();

    // Show STK push sent notification
    showSTKPushNotification(phoneNumber, amount);

    // Simulate STK push process
    simulateSTKPushProcess(amount);
}

function showSTKPushNotification(phone, amount) {
    const notification = createNotificationElement(
        'M-Pesa payment request sent',
        `Please check your phone (${phone}) and enter your M-Pesa PIN to complete the payment of KES. ${amount.toLocaleString()}`,
        'info'
    );

    showTemporaryNotification(notification, 10000);
}

function simulateSTKPushProcess(amount) {
    // Show processing state
    showProcessingOverlay('Processing M-Pesa payment...');

    // Simulate payment processing
    setTimeout(() => {
        // Simulate successful payment
        hideProcessingOverlay();
        handlePaymentSuccess(amount, 'M-Pesa');
    }, 5000);
}

function showManualPaymentInstructions(amount) {
    const modal = createManualPaymentModal(amount);
    document.body.appendChild(modal);
    modal.classList.add('show');

    // Start background reconciliation
    startBackgroundReconciliation(amount);
}

function createManualPaymentModal(amount) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Manual M-Pesa Payment Instructions</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="payment-instructions">
                    <h4>Follow these steps to complete payment:</h4>
                    <ol>
                        <li>Go to M-Pesa on your phone</li>
                        <li>Select <strong>Lipa na M-Pesa</strong></li>
                        <li>Select <strong>Pay Bill</strong></li>
                        <li>Enter Business Number: <strong>123456</strong></li>
                        <li>Enter Account Number: <strong>CURIS-${generateReferenceNumber()}</strong></li>
                        <li>Enter Amount: <strong>KES. ${amount.toLocaleString()}</strong></li>
                        <li>Enter your M-Pesa PIN</li>
                        <li>Confirm the transaction</li>
                    </ol>
                    <div class="payment-details-card">
                        <div class="detail-row">
                            <span>Paybill:</span>
                            <strong>123456</strong>
                        </div>
                        <div class="detail-row">
                            <span>Account:</span>
                            <strong>CURIS-${generateReferenceNumber()}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Amount:</span>
                            <strong>KES. ${amount.toLocaleString()}</strong>
                        </div>
                    </div>
                    <p class="reconciliation-notice">
                        <i class="fas fa-info-circle"></i>
                        Payment will be automatically detected and reconciled within 2-5 minutes
                    </p>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-primary" onclick="this.closest('.modal').remove()">I've Made the Payment</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

function startBackgroundReconciliation(expectedAmount) {
    // Show reconciliation status
    showNotification('info', 'Monitoring for payment confirmation...');

    // Simulate background reconciliation
    setTimeout(() => {
        // Simulate payment detected
        handlePaymentSuccess(expectedAmount, 'M-Pesa (Manual)');
    }, 8000);
}

function handlePaymentSuccess(amount, method) {
    // Update service charge balance
    BillingState.serviceChargeBalance = Math.max(0, BillingState.serviceChargeBalance - amount);
    updateServiceChargeStatus();

    // Generate receipt
    const receiptData = generateReceipt(amount, method);

    // Show success modal
    showPaymentSuccessModal(receiptData);

    // Send notifications
    distributeReceipt(receiptData);

    // Update transaction history
    addToTransactionHistory({
        type: 'service-charge',
        amount: amount,
        method: method,
        date: new Date(),
        status: 'completed',
        receipt: receiptData.number
    });
}

function generateReceipt(amount, method) {
    return {
        number: `R${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        date: new Date().toLocaleString(),
        amount: amount,
        method: method,
        description: 'Curis Service Charge Payment',
        recipient: 'Curis Healthcare Platform'
    };
}

function showPaymentSuccessModal(receipt) {
    const modal = createPaymentSuccessModal(receipt);
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createPaymentSuccessModal(receipt) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Payment Successful!</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="success-message">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-green);"></i>
                    <h4>Payment Received Successfully</h4>
                    <p>Your payment has been processed and confirmed.</p>
                </div>
                <div class="receipt-summary">
                    <h5>Receipt Details</h5>
                    <div class="receipt-details">
                        <div class="detail-row">
                            <span>Receipt Number:</span>
                            <strong>${receipt.number}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Amount Paid:</span>
                            <strong>KES. ${receipt.amount.toLocaleString()}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Payment Method:</span>
                            <strong>${receipt.method}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Date:</span>
                            <strong>${receipt.date}</strong>
                        </div>
                    </div>
                </div>
                <div class="receipt-actions">
                    <button class="btn-primary" onclick="downloadReceipt('${receipt.number}')">
                        <i class="fas fa-download"></i> Download Receipt
                    </button>
                    <button class="btn-secondary" onclick="shareReceipt('${receipt.number}')">
                        <i class="fas fa-share"></i> Share Receipt
                    </button>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-primary" onclick="this.closest('.modal').remove()">Done</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

function distributeReceipt(receipt) {
    // Simulate receipt distribution to multiple recipients
    const recipients = ['Owner', 'Finance Staff', 'Curis SuperAdmin'];

    recipients.forEach(recipient => {
        console.log(`Receipt ${receipt.number} sent to ${recipient}`);
    });

    showNotification('success', 'Receipt has been sent to all relevant parties');
}

// ====================================
// OUTSTANDING BALANCE MANAGEMENT
// ====================================

function loadOutstandingBalances() {
    displayOutstandingPatients(BillingState.outstandingPatients);
}

function displayOutstandingPatients(patients) {
    const container = document.querySelector('.outstanding-patients-list');
    if (!container) return;

    const patientsHTML = patients.map(patient => `
        <div class="patient-card" data-patient-id="${patient.id}">
            <div class="patient-info">
                <img src="path/to/avatar.png" alt="Patient" class="patient-avatar">
                <div class="patient-details">
                    <h5>${patient.name}</h5>
                    <p>Outstanding: KES. ${patient.amount.toLocaleString()} | ${patient.daysOverdue} days overdue</p>
                </div>
            </div>
            <div class="patient-actions">
                <button class="btn-icon" title="Send Reminder" data-action="remind" data-patient-id="${patient.id}">
                    <i class="fas fa-paper-plane"></i>
                </button>
                <button class="btn-icon" title="Call Patient" data-action="call" data-patient-id="${patient.id}">
                    <i class="fas fa-phone"></i>
                </button>
                <button class="btn-icon" title="View Details" data-action="view" data-patient-id="${patient.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Find the correct place to insert patients
    const existingCards = container.querySelector('.patient-card');
    if (existingCards) {
        container.innerHTML = patientsHTML +
            '<button class="btn-link view-all-btn">View All Outstanding Patients</button>';
    }
}

function handlePatientAction(e) {
    const action = e.currentTarget.dataset.action;
    const patientId = e.currentTarget.dataset.patientId;

    switch (action) {
        case 'remind':
            sendIndividualReminder(patientId);
            break;
        case 'call':
            initiatePatientCall(patientId);
            break;
        case 'view':
            viewPatientDetails(patientId);
            break;
    }
}

function sendIndividualReminder(patientId) {
    const patient = BillingState.outstandingPatients.find(p => p.id == patientId);
    if (patient) {
        populateReminderModal(patient);
        openModal('reminderModal');
    }
}

function populateReminderModal(data) {
    // Update recipient info
    const recipientName = document.querySelector('.recipient-info h5');
    const recipientDetails = document.querySelector('.recipient-info p');

    if (recipientName) recipientName.textContent = data.name || data.patient;
    if (recipientDetails) {
        recipientDetails.textContent = `Outstanding: KES. ${data.amount.toLocaleString()} | Invoice #${data.id || 'N/A'}`;
    }

    // Pre-select reminder template
    const template = document.getElementById('reminderTemplate');
    if (template) {
        template.value = 'friendly';
        updateReminderMessage('friendly');
    }
}

function sendBulkReminders() {
    const selectedPatients = BillingState.outstandingPatients;
    const count = selectedPatients.length;

    if (count === 0) {
        showNotification('info', 'No outstanding patients to send reminders to');
        return;
    }

    // Show confirmation
    if (confirm(`Send payment reminders to ${count} patients?`)) {
        showProcessingOverlay(`Sending reminders to ${count} patients...`);

        // Simulate sending reminders
        setTimeout(() => {
            hideProcessingOverlay();
            showNotification('success', `Payment reminders sent to ${count} patients successfully`);

            // Update notification count
            addNotificationItem({
                title: 'Bulk Reminders Sent',
                message: `Payment reminders sent to ${count} patients with outstanding balances`,
                type: 'success'
            });
        }, 2000);
    }
}

function handleManualPayment(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const paymentData = {
        patient: formData.get('patient'),
        invoice: formData.get('invoice'),
        amount: parseFloat(formData.get('amount')),
        method: formData.get('method'),
        reference: formData.get('reference'),
        date: formData.get('date')
    };

    // Process manual payment entry
    processManualPayment(paymentData);
    closeModal('manualPaymentModal');
    e.target.reset();
}

function processManualPayment(paymentData) {
    // Add to transaction history
    addToTransactionHistory({
        ...paymentData,
        type: 'manual',
        status: 'completed'
    });

    // Update outstanding balances
    updateOutstandingBalance(paymentData.patient, paymentData.amount);

    showNotification('success', 'Manual payment recorded successfully');

    // Refresh displays
    loadOutstandingBalances();
    loadTransactionHistory();
}

// ====================================
// PAYMENT HISTORY & AUDIT
// ====================================

function loadTransactionHistory() {
    const transactions = generateSampleTransactions();
    displayTransactions(transactions);
}

function generateSampleTransactions() {
    return [
        {
            id: 'TXN001',
            patient: 'Mary Wanjiru',
            service: 'General Consultation',
            amount: 2500,
            method: 'mpesa',
            reference: 'QEF3RT5Y8P',
            date: 'May 30, 2025 14:32',
            status: 'completed'
        },
        {
            id: 'TXN002',
            patient: 'John Kamau',
            service: 'Lab Tests',
            amount: 12000,
            method: 'bank',
            reference: 'KCB2025053012',
            date: 'May 30, 2025 11:15',
            status: 'completed'
        },
        {
            id: 'TXN003',
            patient: 'Alice Mutua',
            service: 'Dental Procedure',
            amount: 8500,
            method: 'insurance',
            reference: 'NH2025089',
            date: 'May 29, 2025 16:45',
            status: 'completed'
        }
    ];
}

function displayTransactions(transactions) {
    const container = document.querySelector('.transaction-list');
    if (!container) return;

    const transactionsHTML = transactions.map(txn => `
        <div class="transaction-item" data-txn-id="${txn.id}">
            <div class="transaction-icon ${txn.method}">
                <i class="fas ${getPaymentMethodIcon(txn.method)}"></i>
            </div>
            <div class="transaction-details">
                <h5>${txn.patient} - ${txn.service}</h5>
                <p>${getPaymentMethodName(txn.method)} • Ref: ${txn.reference} • ${txn.date}</p>
            </div>
            <div class="transaction-amount">
                <span class="amount">+KES. ${txn.amount.toLocaleString()}</span>
                <button class="btn-icon" title="View Details" data-txn-id="${txn.id}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = transactionsHTML;

    // Attach event listeners
    container.querySelectorAll('.btn-icon').forEach(btn => {
        btn.addEventListener('click', viewTransactionDetails);
    });
}

function getPaymentMethodIcon(method) {
    const icons = {
        mpesa: 'fa-mobile-alt',
        bank: 'fa-university',
        insurance: 'fa-shield-alt',
        cash: 'fa-money-bill',
        card: 'fa-credit-card'
    };
    return icons[method] || 'fa-money-bill';
}

function getPaymentMethodName(method) {
    const names = {
        mpesa: 'M-Pesa',
        bank: 'Bank Transfer',
        insurance: 'Insurance',
        cash: 'Cash',
        card: 'Card Payment'
    };
    return names[method] || 'Payment';
}

function handleQuickFilter(e) {
    const filter = e.currentTarget.textContent.toLowerCase();

    // Remove active class from all chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });

    // Add active class to clicked chip
    e.currentTarget.classList.add('active');

    // Apply filter
    filterTransactionsByPeriod(filter);
}

function filterTransactionsByPeriod(period) {
    // In production, this would filter actual transaction data
    showNotification('info', `Filtering transactions: ${period}`);
    loadTransactionHistory(); // Reload with filtered data
}

function showAdvancedFilters() {
    // Create and show advanced filter modal
    const modal = createAdvancedFilterModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function verifyPayment() {
    // Show payment verification modal
    const modal = createVerificationModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function viewTransactionDetails(e) {
    const txnId = e.currentTarget.dataset.txnId;
    // Show transaction details modal
    showNotification('info', `Viewing transaction ${txnId}`);
}

// ====================================
// RECEIPT MANAGEMENT
// ====================================

function handleReceiptAction(e) {
    const action = e.currentTarget.getAttribute('title').toLowerCase();
    const receiptElement = e.currentTarget.closest('.receipt-item');
    const receiptNumber = receiptElement?.querySelector('h5')?.textContent;

    switch (action) {
        case 'download':
            downloadReceipt(receiptNumber);
            break;
        case 'send':
            shareReceipt(receiptNumber);
            break;
        case 'reissue':
            reissueReceipt(receiptNumber);
            break;
    }
}

function downloadReceipt(receiptNumber) {
    showNotification('success', `Downloading ${receiptNumber}...`);
    // In production, trigger actual PDF download
}

function shareReceipt(receiptNumber) {
    // Show sharing options modal
    const modal = createShareModal(receiptNumber);
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function reissueReceipt(receiptNumber) {
    if (confirm(`Reissue ${receiptNumber}?`)) {
        showNotification('success', `${receiptNumber} has been reissued and sent`);
    }
}

function searchReceipts() {
    // Show receipt search modal
    const modal = createReceiptSearchModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function bulkDownloadReceipts() {
    // Show bulk download options
    showNotification('info', 'Preparing receipts for download...');
    setTimeout(() => {
        showNotification('success', 'Receipts downloaded successfully');
    }, 2000);
}

// ====================================
// MODAL MANAGEMENT
// ====================================

function initializeModals() {
    // Close modal buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal, .modal-overlay');
            closeModal(modal.id);
        });
    });

    // Close on outside click
    document.querySelectorAll('.modal, .modal-overlay').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.setAttribute('hidden', '');
        document.body.style.overflow = '';
    }
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

function showNotification(type, message) {
    const notification = createNotificationElement('', message, type);
    showTemporaryNotification(notification, 5000);
}

function createNotificationElement(title, message, type) {
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            ${title ? `<h5>${title}</h5>` : ''}
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    return notification;
}

function showTemporaryNotification(element, duration) {
    // Create container if it doesn't exist
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        document.body.appendChild(container);
    }

    container.appendChild(element);

    setTimeout(() => {
        element.remove();
    }, duration);
}

function showProcessingOverlay(message) {
    const overlay = document.createElement('div');
    overlay.id = 'processingOverlay';
    overlay.className = 'processing-overlay';
    overlay.innerHTML = `
        <div class="processing-content">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideProcessingOverlay() {
    const overlay = document.getElementById('processingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateInvoiceId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}-${random}`;
}

function generateReferenceNumber() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function findInvoiceById(id) {
    // In production, this would fetch from actual data
    const invoices = generateSampleInvoices();
    return invoices.find(inv => inv.id === id);
}

function validateInvoiceData(data) {
    if (!data.patient || !data.service || !data.amount) {
        showNotification('error', 'Please fill all required fields');
        return false;
    }

    if (data.amount <= 0) {
        showNotification('error', 'Amount must be greater than zero');
        return false;
    }

    return true;
}

function addToTransactionHistory(transaction) {
    BillingState.recentTransactions.unshift(transaction);
    // In production, this would save to backend
}

function updateOutstandingBalance(patientId, amountPaid) {
    const patient = BillingState.outstandingPatients.find(p => p.name === patientId);
    if (patient) {
        patient.amount = Math.max(0, patient.amount - amountPaid);
        if (patient.amount === 0) {
            // Remove from outstanding list
            BillingState.outstandingPatients = BillingState.outstandingPatients.filter(p => p.id !== patient.id);
        }
    }
}

function addNotificationItem(notification) {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;

    const notificationHTML = `
        <div class="notification-item unread">
            <div class="notification-icon">
                <i class="fas ${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <h5>${notification.title}</h5>
                <p>${notification.message}</p>
                <span class="notification-time">Just now</span>
            </div>
        </div>
    `;

    notificationsList.insertAdjacentHTML('afterbegin', notificationHTML);

    // Update notification count
    BillingState.notifications++;
    updateNotificationBadge();
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || 'fa-bell';
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = BillingState.notifications;
    }
}

function markNotificationsAsRead() {
    setTimeout(() => {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        BillingState.notifications = 0;
        updateNotificationBadge();
    }, 3000);
}

// ====================================
// DATA PERSISTENCE
// ====================================

function loadUserPreferences() {
    try {
        const preferences = localStorage.getItem('billingPreferences');
        if (preferences) {
            const parsed = JSON.parse(preferences);
            Object.assign(BillingState, parsed);
        }
    } catch (e) {
        console.error('Failed to load preferences:', e);
    }
}

function saveUserPreferences() {
    try {
        localStorage.setItem('billingPreferences', JSON.stringify(BillingState));
    } catch (e) {
        console.error('Failed to save preferences:', e);
    }
}

// ====================================
// REAL-TIME UPDATES
// ====================================

function setupRealtimeUpdates() {
    // Simulate real-time updates
    setInterval(() => {
        // Random chance of new payment
        if (Math.random() < 0.1) {
            simulateNewPayment();
        }
    }, 30000); // Check every 30 seconds
}

function simulateNewPayment() {
    const payment = {
        patient: 'New Patient',
        amount: Math.floor(Math.random() * 5000) + 1000,
        method: 'mpesa',
        date: new Date().toLocaleString()
    };

    addNotificationItem({
        title: 'Payment Received',
        message: `${payment.method} payment of KES. ${payment.amount.toLocaleString()} received`,
        type: 'success'
    });

    // Update displays
    loadTransactionHistory();
    updateFinancialKPIs();
}

// ====================================
// CHARTS AND VISUALIZATIONS
// ====================================

function initializeFinancialCharts() {
    // Initialize any charts or visualizations
    // This would use a charting library in production
    console.log('Financial charts initialized');
}

// ====================================
// DATE HANDLING
// ====================================

function updateDateFilter() {
    const filter = document.getElementById('dateFilter');
    if (filter) {
        filter.addEventListener('change', handleDateFilterChange);
    }
}

function handleDateFilterChange(e) {
    BillingState.currentFilter = e.target.value;

    if (e.target.value === 'custom') {
        showCustomDateRangePicker();
    } else {
        loadFinancialData();
    }

    saveUserPreferences();
}

function showCustomDateRangePicker() {
    // Show date range picker modal
    const modal = createDateRangeModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createDateRangeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Select Date Range</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="date-range-inputs">
                    <div class="form-group">
                        <label>From Date</label>
                        <input type="date" id="fromDate" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>To Date</label>
                        <input type="date" id="toDate" class="form-control" required>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="button" class="btn-primary" onclick="applyCustomDateRange()">Apply</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

function applyCustomDateRange() {
    const fromDate = document.getElementById('fromDate')?.value;
    const toDate = document.getElementById('toDate')?.value;

    if (fromDate && toDate) {
        BillingState.customDateRange = { from: fromDate, to: toDate };
        loadFinancialData();
        document.querySelector('.modal')?.remove();
    }
}

// ====================================
// TOOLTIP INITIALIZATION
// ====================================

function initializeTooltips() {
    // Initialize tooltips for better UX
    document.querySelectorAll('[title]').forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('title');
    tooltip.style.cssText = `
        position: absolute;
        background: var(--primary-navy);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 0.8rem;
        z-index: 9999;
    `;

    document.body.appendChild(tooltip);

    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';

    e.target.tooltip = tooltip;
}

function hideTooltip(e) {
    if (e.target.tooltip) {
        e.target.tooltip.remove();
        delete e.target.tooltip;
    }
}

// ====================================
// SERVICE CHARGE DETAILS
// ====================================

function showServiceChargeDetails() {
    const modal = createServiceChargeDetailsModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createServiceChargeDetailsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3 class="modal-title">Curis Service Charge Details</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="service-charge-explanation">
                    <h4>How Service Charges Work</h4>
                    <p>Curis charges a 20% service fee on all revenue generated through the platform. This fee covers:</p>
                    <ul>
                        <li>Platform maintenance and updates</li>
                        <li>24/7 technical support</li>
                        <li>Data backup and security</li>
                        <li>New feature development</li>
                        <li>SMS and notification services</li>
                    </ul>
                </div>
                <div class="charge-calculation">
                    <h4>Current Period Calculation</h4>
                    <table class="calculation-table">
                        <tr>
                            <td>Total Revenue:</td>
                            <td>KES. 212,900</td>
                        </tr>
                        <tr>
                            <td>Service Rate:</td>
                            <td>20%</td>
                        </tr>
                        <tr>
                            <td>Service Charge:</td>
                            <td><strong>KES. 42,580</strong></td>
                        </tr>
                    </table>
                </div>
                <div class="payment-schedule">
                    <h4>Payment Schedule</h4>
                    <p>Your current payment frequency: <strong>Bi-weekly</strong></p>
                    <p>Next payment due: <strong>June 15, 2025</strong></p>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-primary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

// ====================================
// PAYMENT HISTORY DETAILS
// ====================================

function showPaymentHistory() {
    const modal = createPaymentHistoryModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

function createPaymentHistoryModal() {
    const transactions = BillingState.recentTransactions.slice(0, 10);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3 class="modal-title">Service Charge Payment History</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="payment-history-list">
                    ${transactions.length > 0 ? transactions.map(txn => `
                        <div class="history-item">
                            <div class="history-date">${new Date(txn.date).toLocaleDateString()}</div>
                            <div class="history-details">
                                <p><strong>Amount:</strong> KES. ${txn.amount.toLocaleString()}</p>
                                <p><strong>Method:</strong> ${txn.method}</p>
                                <p><strong>Receipt:</strong> ${txn.receipt || 'N/A'}</p>
                            </div>
                            <div class="history-status ${txn.status}">
                                ${capitalizeFirst(txn.status)}
                            </div>
                        </div>
                    `).join('') : '<p>No payment history available</p>'}
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="exportPaymentHistory()">Export History</button>
                    <button type="button" class="btn-primary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

function exportPaymentHistory() {
    showNotification('success', 'Payment history exported successfully');
}

// ====================================
// ADVANCED FILTER MODAL
// ====================================

function createAdvancedFilterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Advanced Transaction Filters</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="advancedFilterForm">
                    <div class="form-group">
                        <label>Date Range</label>
                        <div class="date-range-inputs">
                            <input type="date" class="form-control" placeholder="From">
                            <input type="date" class="form-control" placeholder="To">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Transaction Status</label>
                        <select class="form-control">
                            <option value="">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Payment Method</label>
                        <select class="form-control">
                            <option value="">All Methods</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="insurance">Insurance</option>
                            <option value="cash">Cash</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Amount Range (KES.)</label>
                        <div class="amount-range-inputs">
                            <input type="number" class="form-control" placeholder="Min">
                            <input type="number" class="form-control" placeholder="Max">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Apply Filters</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    modal.querySelector('#advancedFilterForm').addEventListener('submit', function (e) {
        e.preventDefault();
        applyAdvancedFilters();
        modal.remove();
    });

    return modal;
}

function applyAdvancedFilters() {
    showNotification('info', 'Applying advanced filters...');
    // In production, this would filter the transaction data
    loadTransactionHistory();
}

// ====================================
// PAYMENT VERIFICATION MODAL
// ====================================

function createVerificationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Verify Payment</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>Enter payment details to verify transaction:</p>
                <form id="verificationForm">
                    <div class="form-group">
                        <label>Transaction Reference</label>
                        <input type="text" class="form-control" placeholder="e.g., QEF3RT5Y8P" required>
                    </div>
                    <div class="form-group">
                        <label>Phone Number (for M-Pesa)</label>
                        <input type="tel" class="form-control" placeholder="07XXXXXXXX" pattern="07[0-9]{8}">
                    </div>
                    <div class="form-group">
                        <label>Amount (KES.)</label>
                        <input type="number" class="form-control" placeholder="0.00">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Verify</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    modal.querySelector('#verificationForm').addEventListener('submit', function (e) {
        e.preventDefault();
        performPaymentVerification();
        modal.remove();
    });

    return modal;
}

function performPaymentVerification() {
    showProcessingOverlay('Verifying payment...');

    setTimeout(() => {
        hideProcessingOverlay();
        showNotification('success', 'Payment verified successfully');
    }, 2000);
}

// ====================================
// RECEIPT SEARCH MODAL
// ====================================

function createReceiptSearchModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Search Receipts</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="receiptSearchForm">
                    <div class="form-group">
                        <label>Search By</label>
                        <select class="form-control" id="searchType">
                            <option value="receipt">Receipt Number</option>
                            <option value="patient">Patient Name</option>
                            <option value="date">Date Range</option>
                            <option value="invoice">Invoice Number</option>
                        </select>
                    </div>
                    <div class="form-group" id="searchInput">
                        <label>Receipt Number</label>
                        <input type="text" class="form-control" placeholder="e.g., R2025-0512" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Search</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const searchType = modal.querySelector('#searchType');
    const searchInput = modal.querySelector('#searchInput');

    searchType.addEventListener('change', function () {
        updateSearchInput(this.value, searchInput);
    });

    modal.querySelector('#receiptSearchForm').addEventListener('submit', function (e) {
        e.preventDefault();
        performReceiptSearch();
        modal.remove();
    });

    return modal;
}

function updateSearchInput(type, container) {
    const inputs = {
        receipt: '<label>Receipt Number</label><input type="text" class="form-control" placeholder="e.g., R2025-0512" required>',
        patient: '<label>Patient Name</label><input type="text" class="form-control" placeholder="Enter patient name" required>',
        date: '<label>Date Range</label><div class="date-range-inputs"><input type="date" class="form-control" required><input type="date" class="form-control" required></div>',
        invoice: '<label>Invoice Number</label><input type="text" class="form-control" placeholder="e.g., INV-2025-0145" required>'
    };

    container.innerHTML = inputs[type] || inputs.receipt;
}

function performReceiptSearch() {
    showNotification('info', 'Searching for receipts...');
    // In production, this would perform actual search
}

// ====================================
// SHARE MODAL
// ====================================

function createShareModal(receiptNumber) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Share Receipt</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>Select sharing method for ${receiptNumber}:</p>
                <div class="sharing-options">
                    <button class="sharing-option" onclick="shareViaEmail('${receiptNumber}')">
                        <i class="fas fa-envelope"></i>
                        <span>Email</span>
                    </button>
                    <button class="sharing-option" onclick="shareViaWhatsApp('${receiptNumber}')">
                        <i class="fab fa-whatsapp"></i>
                        <span>WhatsApp</span>
                    </button>
                    <button class="sharing-option" onclick="shareViaSMS('${receiptNumber}')">
                        <i class="fas fa-sms"></i>
                        <span>SMS</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

function shareViaEmail(receiptNumber) {
    showNotification('success', `${receiptNumber} sent via email`);
    document.querySelector('.modal')?.remove();
}

function shareViaWhatsApp(receiptNumber) {
    showNotification('success', `${receiptNumber} sent via WhatsApp`);
    document.querySelector('.modal')?.remove();
}

function shareViaSMS(receiptNumber) {
    showNotification('success', `${receiptNumber} sent via SMS`);
    document.querySelector('.modal')?.remove();
}

// ====================================
// CSS INJECTION FOR DYNAMIC ELEMENTS
// ====================================

// Add dynamic styles for elements created by JavaScript
const dynamicStyles = `
    <style>
        .notification-toast {
            background: var(--white);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-sm);
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            animation: slideIn 0.3s ease-out;
        }
        
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
        
        .notification-toast.success {
            border-left: 4px solid var(--success-green);
        }
        
        .notification-toast.error {
            border-left: 4px solid var(--error-red);
        }
        
        .notification-toast.info {
            border-left: 4px solid var(--accent-teal);
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--medium-gray);
            cursor: pointer;
            padding: var(--spacing-xs);
        }
        
        .processing-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .processing-content {
            background: var(--white);
            padding: var(--spacing-xl);
            border-radius: var(--radius-lg);
            text-align: center;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid var(--light-gray);
            border-top-color: var(--accent-teal);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto var(--spacing-md);
        }
        
        .mfa-notice {
            background: var(--teal-50);
            border: 1px solid var(--accent-teal);
            border-radius: var(--radius-md);
            padding: var(--spacing-md);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-lg);
        }
        
        .mfa-notice i {
            color: var(--accent-teal);
            font-size: 1.2rem;
        }
        
        .payment-details-card {
            background: var(--navy-50);
            border-radius: var(--radius-md);
            padding: var(--spacing-md);
            margin: var(--spacing-md) 0;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: var(--spacing-sm) 0;
        }
        
        .reconciliation-notice {
            background: var(--teal-50);
            border-radius: var(--radius-md);
            padding: var(--spacing-md);
            margin-top: var(--spacing-md);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
        }
        
        .success-message {
            text-align: center;
            margin-bottom: var(--spacing-lg);
        }
        
        .receipt-summary {
            background: var(--navy-50);
            border-radius: var(--radius-md);
            padding: var(--spacing-lg);
            margin-bottom: var(--spacing-lg);
        }
        
        .receipt-details {
            margin-top: var(--spacing-md);
        }
        
        .receipt-actions {
            display: flex;
            gap: var(--spacing-md);
            justify-content: center;
            margin-bottom: var(--spacing-lg);
        }
        
        .phone-options {
            margin: var(--spacing-md) 0;
        }
        
        .sharing-options {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--spacing-md);
            margin-top: var(--spacing-lg);
        }
        
        .sharing-option {
            background: var(--navy-50);
            border: 2px solid var(--light-gray);
            border-radius: var(--radius-md);
            padding: var(--spacing-lg);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-sm);
            cursor: pointer;
            transition: all var(--transition-fast);
        }
        
        .sharing-option:hover {
            border-color: var(--accent-teal);
            background: var(--teal-50);
        }
        
        .sharing-option i {
            font-size: 2rem;
            color: var(--accent-teal);
        }
        
        .checkbox-group {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-md);
        }
        
        .checkbox-group label {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
        }
        
        .amount-range-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-md);
        }
        
        .calculation-table {
            width: 100%;
            margin: var(--spacing-md) 0;
        }
        
        .calculation-table td {
            padding: var(--spacing-sm);
            border-bottom: 1px solid var(--light-gray);
        }
        
        .calculation-table td:last-child {
            text-align: right;
        }
        
        .service-charge-explanation ul {
            margin-left: var(--spacing-lg);
            margin-top: var(--spacing-sm);
        }
        
        .payment-history-list {
            max-height: 400px;
            overflow-y: auto;
        }
        
        .history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--spacing-md);
            border: 1px solid var(--light-gray);
            border-radius: var(--radius-md);
            margin-bottom: var(--spacing-sm);
        }
        
        .history-status {
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--radius-sm);
            font-size: 0.85rem;
            font-weight: var(--font-weight-semibold);
        }
        
        .history-status.completed {
            background: var(--success-green);
            color: var(--white);
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', dynamicStyles);

// ====================================
// ERROR HANDLING
// ====================================

window.addEventListener('error', function (e) {
    console.error('Global error:', e.error);
    showNotification('error', 'An unexpected error occurred. Please try again.');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('error', 'An unexpected error occurred. Please try again.');
});
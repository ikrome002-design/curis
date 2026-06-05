/**
 * CURIS BILLINGS & PAYMENTS JAVASCRIPT
 * Financial Management Hub - Receptionist & Clinic Assistant
 * Complete Dynamic Implementation
 * Version: 1.0.0
 * Copyright 2025 Citrus Labs
 */

// ===============================================
// GLOBAL VARIABLES & STATE MANAGEMENT
// ===============================================
const BillingApp = {
    // Application State
    state: {
        currentUser: {
            name: 'Sarah Wanjiru',
            role: 'Receptionist',
            id: 'USER_001',
            permissions: ['create_invoice', 'mark_paid', 'view_reports', 'send_reminders']
        },
        invoices: [],
        outstandingPayments: [],
        walletBalances: {},
        platformFees: [],
        paymentLogs: [],
        alerts: [],
        reports: {
            daily: {},
            revenue: {},
            doctor: {}
        },
        filters: {
            doctor: '',
            status: '',
            method: '',
            dateRange: {
                start: null,
                end: null
            }
        },
        selectedInvoice: null,
        currentPage: 1,
        itemsPerPage: 10,
        darkMode: false,
        currencySymbol: 'KES.',
        vatRate: 0.16,
        platformFeeRate: 0.20,
        mpesaDetails: {
            paybill: '522533',
            account: '1234567890'
        },
        bankDetails: {
            account: '0100123456789',
            bank: 'Standard Chartered',
            branch: 'Westlands'
        }
    },

    // Configuration
    config: {
        apiEndpoint: '/api/v1',
        websocketUrl: 'wss://curis-ws.citruslabs.co.ke',
        autoSaveInterval: 30000, // 30 seconds
        reminderInterval: 86400000, // 24 hours
        overdueThreshold: 7, // days
        installmentOptions: [2, 3, 4, 6],
        exportFormats: ['PDF', 'CSV', 'Excel'],
        notificationChannels: ['SMS', 'Email', 'WhatsApp', 'In-App']
    },

    // Service catalog for invoice creation
    serviceCatalog: [
        { id: 'consultation', name: 'Consultation', price: 2500 },
        { id: 'lab-test', name: 'Lab Test', price: 3000 },
        { id: 'xray', name: 'X-Ray', price: 5000 },
        { id: 'ultrasound', name: 'Ultrasound', price: 7500 },
        { id: 'procedure-minor', name: 'Minor Procedure', price: 8000 },
        { id: 'procedure-major', name: 'Major Procedure', price: 25000 },
        { id: 'pharmacy', name: 'Pharmacy', price: 0 }, // Variable
        { id: 'admission', name: 'Admission (per day)', price: 5000 }
    ]
};

// ===============================================
// INITIALIZATION
// ===============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('Curis Billing System Initializing...');

    // Initialize core components
    initializeEventListeners();
    initializeModals();
    initializeFilters();
    loadInvoices();
    loadOutstandingPayments();
    loadWalletData();
    loadPlatformFees();
    loadPaymentLogs();
    loadAlerts();
    generateReports();
    initializeRealtimeSync();
    initializeProfileMenu();
    initializeDarkMode();
    initializePaymentMethods();
    initializeTooltips();
    initializeKeyboardShortcuts();

    // Start auto-save and monitoring
    startAutoSave();
    startPaymentMonitoring();
    startReminderSystem();

    console.log('Billing System Ready');
});

// ===============================================
// EVENT LISTENERS
// ===============================================
function initializeEventListeners() {
    // Quick Action Buttons
    document.getElementById('createInvoiceBtn')?.addEventListener('click', openCreateInvoiceModal);
    document.getElementById('markPaidBtn')?.addEventListener('click', openMarkPaidModal);
    document.getElementById('issueReceiptBtn')?.addEventListener('click', openReceiptModal);
    document.getElementById('processRefundBtn')?.addEventListener('click', openRefundModal);
    document.getElementById('insuranceClaimBtn')?.addEventListener('click', openInsuranceClaimModal);
    document.getElementById('installmentPlanBtn')?.addEventListener('click', openInstallmentModal);
    document.getElementById('walletDepositBtn')?.addEventListener('click', openWalletDepositModal);
    document.getElementById('addDepositBtn')?.addEventListener('click', openWalletDepositModal);
    document.getElementById('sendBulkRemindersBtn')?.addEventListener('click', sendBulkReminders);
    document.getElementById('viewClaimProcess')?.addEventListener('click', viewInsuranceClaimProcess);
    document.getElementById('generateReportBtn')?.addEventListener('click', generateCustomReport);

    // Invoice Table Actions
    document.querySelectorAll('.view-invoice').forEach(btn => {
        btn.addEventListener('click', viewInvoice);
    });

    document.querySelectorAll('.print-invoice').forEach(btn => {
        btn.addEventListener('click', printInvoice);
    });

    document.querySelectorAll('.send-invoice').forEach(btn => {
        btn.addEventListener('click', sendInvoice);
    });

    document.querySelectorAll('.mark-paid').forEach(btn => {
        btn.addEventListener('click', markInvoiceAsPaid);
    });

    document.querySelectorAll('.send-reminder').forEach(btn => {
        btn.addEventListener('click', sendPaymentReminder);
    });

    document.querySelectorAll('.view-claim').forEach(btn => {
        btn.addEventListener('click', viewInsuranceClaim);
    });

    document.querySelectorAll('.update-status').forEach(btn => {
        btn.addEventListener('click', updateInvoiceStatus);
    });

    document.querySelectorAll('.add-payment').forEach(btn => {
        btn.addEventListener('click', addPartialPayment);
    });

    document.querySelectorAll('.payment-history').forEach(btn => {
        btn.addEventListener('click', viewPaymentHistory);
    });

    // Outstanding Payments Actions
    document.querySelectorAll('.btn-remind').forEach(btn => {
        btn.addEventListener('click', sendIndividualReminder);
    });

    document.querySelectorAll('.btn-call').forEach(btn => {
        btn.addEventListener('click', initiatePatientCall);
    });

    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', viewInstallmentPlan);
    });

    // Wallet Actions
    document.querySelectorAll('.view-history').forEach(btn => {
        btn.addEventListener('click', viewWalletHistory);
    });

    document.querySelectorAll('.apply-to-invoice').forEach(btn => {
        btn.addEventListener('click', applyWalletToInvoice);
    });

    // Copy Buttons for Payment Methods
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', copyToClipboard);
    });

    // Platform Fee Actions
    document.querySelectorAll('.btn-pay-now').forEach(btn => {
        btn.addEventListener('click', payPlatformFee);
    });

    document.querySelectorAll('.btn-view-receipt').forEach(btn => {
        btn.addEventListener('click', viewFeeReceipt);
    });

    // Report Actions
    document.querySelectorAll('.btn-export-report').forEach(btn => {
        btn.addEventListener('click', exportReport);
    });

    document.querySelectorAll('.btn-view-details').forEach(btn => {
        btn.addEventListener('click', viewReportDetails);
    });

    // Alert Actions
    document.querySelectorAll('.alerts-list .btn-action').forEach(btn => {
        btn.addEventListener('click', handleAlertAction);
    });

    // Form Handlers in Modals
    document.getElementById('createInvoiceForm')?.addEventListener('submit', handleInvoiceCreation);
    document.getElementById('markPaidForm')?.addEventListener('submit', handlePaymentRecording);
    document.getElementById('insuranceClaimForm')?.addEventListener('submit', handleInsuranceClaim);
    document.getElementById('refundForm')?.addEventListener('submit', handleRefundRequest);
    document.getElementById('walletDepositForm')?.addEventListener('submit', handleWalletDeposit);

    // Invoice Form Dynamic Updates
    document.getElementById('enableInstallments')?.addEventListener('change', toggleInstallmentOptions);
    document.getElementById('addServiceBtn')?.addEventListener('click', addServiceRow);
    document.getElementById('paymentType')?.addEventListener('change', handlePaymentTypeChange);

    // Filter Controls
    document.getElementById('doctorFilter')?.addEventListener('change', filterInvoices);
    document.getElementById('statusFilter')?.addEventListener('change', filterInvoices);
    document.getElementById('methodFilter')?.addEventListener('change', filterInvoices);
    document.getElementById('invoiceSearch')?.addEventListener('input', searchInvoices);

    // Pagination
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', handlePagination);
    });

    // Export Functions
    document.querySelector('.btn-export')?.addEventListener('click', exportInvoices);
    document.querySelector('.payment-logs .btn-export')?.addEventListener('click', exportPaymentLogs);

    // Receipt Send Options
    document.querySelector('.btn-send-sms')?.addEventListener('click', () => sendReceipt('SMS'));
    document.querySelector('.btn-send-email')?.addEventListener('click', () => sendReceipt('Email'));
    document.querySelector('.btn-send-whatsapp')?.addEventListener('click', () => sendReceipt('WhatsApp'));
    document.querySelector('.btn-print')?.addEventListener('click', printReceipt);
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
            closeBtn.addEventListener('click', () => closeModal(modal.id));
        }

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        addAuditEntry('MODAL_OPEN', `Opened modal: ${modalId}`);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Clear form if present
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// ===============================================
// INVOICE MANAGEMENT
// ===============================================
function openCreateInvoiceModal() {
    openModal('createInvoiceModal');
    initializeInvoiceForm();
}

function initializeInvoiceForm() {
    // Initialize patient autocomplete
    initializePatientSearch();

    // Calculate initial totals
    calculateInvoiceTotal();

    // Set up service rows
    setupServiceSelectors();
}

function initializePatientSearch() {
    const patientInput = document.getElementById('patientName');
    if (!patientInput) return;

    let timeout;
    patientInput.addEventListener('input', function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            searchPatients(this.value);
        }, 300);
    });
}

function searchPatients(query) {
    if (!query || query.length < 2) return;

    // In production, this would be an API call
    const mockPatients = [
        { id: 'PAT001', name: 'John Kimani', phone: '+254712345678' },
        { id: 'PAT002', name: 'Grace Muthoni', phone: '+254722345678' },
        { id: 'PAT003', name: 'Peter Odhiambo', phone: '+254733345678' }
    ];

    const results = mockPatients.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
    );

    // Display results (in production, show dropdown)
    console.log('Patient search results:', results);
}

function addServiceRow() {
    const serviceItems = document.getElementById('serviceItems');
    if (!serviceItems) return;

    const newRow = document.createElement('div');
    newRow.className = 'service-item-row';
    newRow.innerHTML = `
        <select class="service-select">
            <option value="">Select Service</option>
            ${BillingApp.serviceCatalog.map(service =>
        `<option value="${service.id}">${service.name} - ${BillingApp.state.currencySymbol} ${service.price.toLocaleString()}</option>`
    ).join('')}
        </select>
        <input type="number" class="quantity-input" value="1" min="1">
        <input type="text" class="amount-input" value="0" readonly>
        <button type="button" class="btn-remove-item">
            <i class="fas fa-trash"></i>
        </button>
    `;

    serviceItems.appendChild(newRow);

    // Set up event listeners for new row
    setupServiceRow(newRow);
}

function setupServiceRow(row) {
    const serviceSelect = row.querySelector('.service-select');
    const quantityInput = row.querySelector('.quantity-input');
    const removeBtn = row.querySelector('.btn-remove-item');

    serviceSelect.addEventListener('change', () => updateServiceAmount(row));
    quantityInput.addEventListener('input', () => updateServiceAmount(row));
    removeBtn.addEventListener('click', () => removeServiceRow(row));
}

function setupServiceSelectors() {
    document.querySelectorAll('.service-item-row').forEach(row => {
        setupServiceRow(row);
    });
}

function updateServiceAmount(row) {
    const serviceSelect = row.querySelector('.service-select');
    const quantityInput = row.querySelector('.quantity-input');
    const amountInput = row.querySelector('.amount-input');

    const serviceId = serviceSelect.value;
    const quantity = parseInt(quantityInput.value) || 0;

    if (serviceId) {
        const service = BillingApp.serviceCatalog.find(s => s.id === serviceId);
        if (service) {
            const amount = service.price * quantity;
            amountInput.value = amount.toLocaleString();
        }
    } else {
        amountInput.value = '0';
    }

    calculateInvoiceTotal();
}

function removeServiceRow(row) {
    if (document.querySelectorAll('.service-item-row').length > 1) {
        row.remove();
        calculateInvoiceTotal();
    } else {
        showNotification('warning', 'At least one service item is required');
    }
}

function calculateInvoiceTotal() {
    let subtotal = 0;

    document.querySelectorAll('.service-item-row').forEach(row => {
        const amountInput = row.querySelector('.amount-input');
        const amount = parseFloat(amountInput.value.replace(/,/g, '')) || 0;
        subtotal += amount;
    });

    // Calculate VAT
    const vat = subtotal * BillingApp.state.vatRate;

    // Get discount
    const discountInput = document.getElementById('discount');
    const discountType = document.querySelector('.discount-type')?.value;
    let discount = 0;

    if (discountInput && discountInput.value) {
        const discountValue = parseFloat(discountInput.value) || 0;
        if (discountType === 'percent') {
            discount = subtotal * (discountValue / 100);
        } else {
            discount = discountValue;
        }
    }

    // Calculate total
    const total = subtotal + vat - discount;

    // Update display
    document.getElementById('subtotal').value = `${BillingApp.state.currencySymbol} ${subtotal.toLocaleString()}`;
    document.getElementById('vat').value = `${BillingApp.state.currencySymbol} ${vat.toLocaleString()}`;
    document.getElementById('totalAmount').value = `${BillingApp.state.currencySymbol} ${total.toLocaleString()}`;
}

function toggleInstallmentOptions(e) {
    const installmentOptions = document.getElementById('installmentOptions');
    if (installmentOptions) {
        installmentOptions.style.display = e.target.checked ? 'block' : 'none';
    }
}

function handlePaymentTypeChange(e) {
    const paymentType = e.target.value;

    switch (paymentType) {
        case 'insurance':
            showInsuranceFields();
            break;
        case 'corporate':
            showCorporateFields();
            break;
        default:
            hideAdditionalFields();
    }
}

function handleInvoiceCreation(e) {
    e.preventDefault();

    const formData = collectInvoiceFormData();

    if (!validateInvoiceData(formData)) {
        return;
    }

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();

    // Create invoice object
    const invoice = {
        id: invoiceNumber,
        ...formData,
        createdBy: BillingApp.state.currentUser.id,
        createdAt: new Date().toISOString(),
        status: 'unpaid'
    };

    // Save invoice
    saveInvoice(invoice);

    // Handle special cases
    if (formData.paymentType === 'insurance') {
        processInsuranceClaim(invoice);
    } else if (formData.enableInstallments) {
        createInstallmentPlan(invoice);
    }

    // Update UI
    addInvoiceToTable(invoice);

    // Show success message
    showNotification('success', `Invoice ${invoiceNumber} created successfully`);

    // Close modal
    closeModal('createInvoiceModal');

    // Add to audit log
    addAuditEntry('INVOICE_CREATE', `Created invoice ${invoiceNumber} for ${formData.patientName}`);
}

function collectInvoiceFormData() {
    const services = [];
    document.querySelectorAll('.service-item-row').forEach(row => {
        const serviceSelect = row.querySelector('.service-select');
        const quantityInput = row.querySelector('.quantity-input');

        if (serviceSelect.value) {
            services.push({
                serviceId: serviceSelect.value,
                quantity: parseInt(quantityInput.value) || 1,
                amount: parseFloat(row.querySelector('.amount-input').value.replace(/,/g, '')) || 0
            });
        }
    });

    return {
        patientName: document.getElementById('patientName')?.value,
        paymentType: document.getElementById('paymentType')?.value,
        services: services,
        subtotal: parseFloat(document.getElementById('subtotal')?.value.replace(/[^0-9.-]/g, '')) || 0,
        vat: parseFloat(document.getElementById('vat')?.value.replace(/[^0-9.-]/g, '')) || 0,
        discount: parseFloat(document.getElementById('discount')?.value) || 0,
        total: parseFloat(document.getElementById('totalAmount')?.value.replace(/[^0-9.-]/g, '')) || 0,
        notes: document.getElementById('invoiceNotes')?.value,
        enableInstallments: document.getElementById('enableInstallments')?.checked,
        numInstallments: document.getElementById('numInstallments')?.value,
        frequency: document.getElementById('frequency')?.value
    };
}

function validateInvoiceData(data) {
    if (!data.patientName) {
        showNotification('error', 'Please select or enter a patient name');
        return false;
    }

    if (data.services.length === 0) {
        showNotification('error', 'Please add at least one service');
        return false;
    }

    if (data.total <= 0) {
        showNotification('error', 'Invoice total must be greater than zero');
        return false;
    }

    return true;
}

function generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const count = (BillingApp.state.invoices.length + 1).toString().padStart(3, '0');
    return `INV-${year}-${count}`;
}

function saveInvoice(invoice) {
    BillingApp.state.invoices.push(invoice);

    // In production, save to database
    localStorage.setItem('curis_invoices', JSON.stringify(BillingApp.state.invoices));
}

function addInvoiceToTable(invoice) {
    const tbody = document.querySelector('.invoice-table tbody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${invoice.id}</td>
        <td>${invoice.patientName}</td>
        <td>${invoice.doctor || 'N/A'}</td>
        <td>${BillingApp.state.currencySymbol} ${invoice.total.toLocaleString()}</td>
        <td><span class="status-badge ${invoice.status}">${formatStatus(invoice.status)}</span></td>
        <td>${invoice.paymentMethod || '-'}</td>
        <td>${formatDate(invoice.createdAt)}</td>
        <td>
            <button class="action-btn view-invoice" title="View">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn print-invoice" title="Print">
                <i class="fas fa-print"></i>
            </button>
            <button class="action-btn send-invoice" title="Send">
                <i class="fas fa-paper-plane"></i>
            </button>
        </td>
    `;

    tbody.insertBefore(row, tbody.firstChild);
}

// ===============================================
// PAYMENT PROCESSING
// ===============================================
function openMarkPaidModal() {
    openModal('markPaidModal');

    // Set up payment method change handler
    const methodSelect = document.querySelector('#markPaidModal .form-select');
    if (methodSelect) {
        methodSelect.addEventListener('change', handlePaymentMethodChange);
    }
}

function handlePaymentMethodChange(e) {
    const method = e.target.value;
    const referenceField = document.getElementById('referenceField');

    if (method === 'mpesa' || method === 'insurance') {
        referenceField.style.display = 'block';
    } else {
        referenceField.style.display = 'none';
    }
}

function handlePaymentRecording(e) {
    e.preventDefault();

    const formData = {
        invoiceNumber: e.target.querySelector('input[placeholder*="invoice number"]')?.value,
        amountDue: parseFloat(e.target.querySelector('input[readonly]')?.value.replace(/[^0-9.-]/g, '')) || 0,
        amountReceived: parseFloat(e.target.querySelector('input[placeholder*="amount received"]')?.value) || 0,
        paymentMethod: e.target.querySelector('.form-select')?.value,
        transactionRef: e.target.querySelector('input[placeholder*="reference"]')?.value,
        paymentTime: e.target.querySelector('input[type="datetime-local"]')?.value || new Date().toISOString()
    };

    // Validate payment
    if (!formData.invoiceNumber) {
        showNotification('error', 'Please enter invoice number');
        return;
    }

    if (!formData.paymentMethod) {
        showNotification('error', 'Please select payment method');
        return;
    }

    if (formData.amountReceived <= 0) {
        showNotification('error', 'Please enter valid amount');
        return;
    }

    // Process payment
    processPayment(formData);

    // Close modal
    closeModal('markPaidModal');
}

function processPayment(paymentData) {
    // Find invoice
    const invoice = BillingApp.state.invoices.find(inv => inv.id === paymentData.invoiceNumber);

    if (!invoice) {
        showNotification('error', 'Invoice not found');
        return;
    }

    // Check for overpayment
    if (paymentData.amountReceived > paymentData.amountDue) {
        handleOverpayment(paymentData, invoice);
    } else if (paymentData.amountReceived < paymentData.amountDue) {
        handlePartialPayment(paymentData, invoice);
    } else {
        handleFullPayment(paymentData, invoice);
    }

    // Generate receipt
    generateReceipt(paymentData, invoice);

    // Update dashboard metrics
    updatePaymentMetrics();

    // Add to payment log
    addPaymentLog(paymentData);

    // Add to audit
    addAuditEntry('PAYMENT_RECEIVED', `Payment of ${BillingApp.state.currencySymbol} ${paymentData.amountReceived.toLocaleString()} for invoice ${paymentData.invoiceNumber}`);
}

function handleFullPayment(paymentData, invoice) {
    invoice.status = 'paid';
    invoice.paymentMethod = paymentData.paymentMethod;
    invoice.paymentDate = paymentData.paymentTime;
    invoice.transactionRef = paymentData.transactionRef;

    // Update invoice in table
    updateInvoiceStatus(invoice.id, 'paid');

    // Remove from outstanding if exists
    removeFromOutstanding(invoice.id);

    showNotification('success', `Invoice ${invoice.id} marked as paid`);
}

function handlePartialPayment(paymentData, invoice) {
    invoice.status = 'partial';
    invoice.amountPaid = (invoice.amountPaid || 0) + paymentData.amountReceived;
    invoice.balance = invoice.total - invoice.amountPaid;

    // Add payment to history
    if (!invoice.paymentHistory) {
        invoice.paymentHistory = [];
    }

    invoice.paymentHistory.push({
        amount: paymentData.amountReceived,
        method: paymentData.paymentMethod,
        date: paymentData.paymentTime,
        reference: paymentData.transactionRef
    });

    updateInvoiceStatus(invoice.id, 'partial');

    showNotification('warning', `Partial payment recorded. Balance: ${BillingApp.state.currencySymbol} ${invoice.balance.toLocaleString()}`);
}

function handleOverpayment(paymentData, invoice) {
    const overpayment = paymentData.amountReceived - paymentData.amountDue;

    // Show overpayment options
    const action = confirm(`Overpayment of ${BillingApp.state.currencySymbol} ${overpayment.toLocaleString()} detected. Apply to patient wallet?`);

    if (action) {
        // Apply to wallet
        addToPatientWallet(invoice.patientName, overpayment);
        showNotification('success', `${BillingApp.state.currencySymbol} ${overpayment.toLocaleString()} added to patient wallet`);
    } else {
        // Process refund
        initiateRefund(invoice.id, overpayment);
    }

    // Mark invoice as paid
    handleFullPayment(paymentData, invoice);
}

// ===============================================
// INSURANCE CLAIMS
// ===============================================
function openInsuranceClaimModal() {
    openModal('insuranceClaimModal');
    fetchMedicalDocuments();
}

function fetchMedicalDocuments() {
    // Simulate fetching documents from doctor's records
    setTimeout(() => {
        showNotification('success', 'Medical documents fetched successfully');

        // Update UI to show fetched documents
        const documentList = document.querySelector('.document-list');
        if (documentList) {
            documentList.querySelectorAll('.document-item').forEach(item => {
                item.classList.add('fetched');
            });
        }
    }, 1500);
}

function handleInsuranceClaim(e) {
    e.preventDefault();

    const claimData = {
        patientName: e.target.querySelector('input[readonly]')?.value,
        invoiceNumber: e.target.querySelector('input[value*="INV"]')?.value,
        insuranceProvider: e.target.querySelector('.form-select')?.value,
        policyNumber: e.target.querySelector('input[placeholder*="policy"]')?.value,
        documents: collectUploadedDocuments(),
        claimAmount: 12000, // From invoice
        submittedBy: BillingApp.state.currentUser.id,
        submittedAt: new Date().toISOString()
    };

    // Generate claim number
    const claimNumber = generateClaimNumber();

    // Submit claim
    submitInsuranceClaim(claimNumber, claimData);

    // Update invoice status
    updateInvoiceStatus(claimData.invoiceNumber, 'pending-claim');

    // Generate PDF packet
    generateInsurancePDFPacket(claimNumber, claimData);

    showNotification('success', `Insurance claim ${claimNumber} submitted successfully`);

    closeModal('insuranceClaimModal');
}

function generateClaimNumber() {
    const year = new Date().getFullYear();
    const count = Math.floor(Math.random() * 1000);
    return `CLM-${year}-${count.toString().padStart(3, '0')}`;
}

function submitInsuranceClaim(claimNumber, claimData) {
    // In production, submit to insurance API
    console.log('Submitting insurance claim:', claimNumber, claimData);

    // Track claim status
    trackClaimStatus(claimNumber);
}

function generateInsurancePDFPacket(claimNumber, claimData) {
    // Generate comprehensive PDF packet
    const pdfContents = [
        'Claim Form',
        'Invoice & Discharge Summary',
        'Doctor\'s Report',
        'Prescriptions',
        'Referral Letter (if applicable)',
        'Proof of Payment'
    ];

    console.log('Generating PDF packet for claim:', claimNumber);

    // In production, use PDF library to create actual PDFs
    showNotification('info', 'Insurance PDF packet generated and watermarked');
}

function trackClaimStatus(claimNumber) {
    // Set up periodic status check
    const checkInterval = setInterval(() => {
        // In production, check with insurance API
        const status = Math.random() > 0.7 ? 'approved' : 'pending';

        if (status === 'approved') {
            showNotification('success', `Insurance claim ${claimNumber} approved!`);
            clearInterval(checkInterval);
        }
    }, 30000); // Check every 30 seconds
}

// ===============================================
// REFUNDS & ADJUSTMENTS
// ===============================================
function openRefundModal() {
    openModal('refundModal');
}

function handleRefundRequest(e) {
    e.preventDefault();

    const refundData = {
        requestType: e.target.querySelector('.form-select')?.value,
        invoiceNumber: e.target.querySelector('input[placeholder*="invoice number"]')?.value,
        amount: parseFloat(e.target.querySelector('input[placeholder*="amount"]')?.value) || 0,
        method: e.target.querySelector('select:nth-of-type(2)')?.value,
        reason: e.target.querySelector('textarea')?.value,
        requestedBy: BillingApp.state.currentUser.id,
        requestedAt: new Date().toISOString()
    };

    // Validate refund request
    if (!refundData.invoiceNumber || !refundData.amount || !refundData.reason) {
        showNotification('error', 'Please fill in all required fields');
        return;
    }

    // Submit for approval
    submitRefundForApproval(refundData);

    showNotification('info', 'Refund request submitted for approval');

    closeModal('refundModal');
}

function submitRefundForApproval(refundData) {
    // Create approval workflow
    const approvalRequest = {
        id: 'APR-' + Date.now(),
        type: 'refund',
        data: refundData,
        status: 'pending',
        approver: 'clinic_manager'
    };

    // In production, notify manager
    console.log('Approval request created:', approvalRequest);

    // Simulate approval after delay
    setTimeout(() => {
        processApprovedRefund(refundData);
    }, 5000);
}

function processApprovedRefund(refundData) {
    // Process the refund
    switch (refundData.method) {
        case 'mpesa':
            processMpesaRefund(refundData);
            break;
        case 'cash':
            processCashRefund(refundData);
            break;
        case 'bank':
            processBankRefund(refundData);
            break;
    }

    // Update invoice status
    updateInvoiceForRefund(refundData.invoiceNumber, refundData.amount);

    // Add to audit log
    addAuditEntry('REFUND_PROCESSED', `Refund of ${BillingApp.state.currencySymbol} ${refundData.amount.toLocaleString()} for invoice ${refundData.invoiceNumber}`);

    showNotification('success', 'Refund processed successfully');
}

// ===============================================
// PATIENT WALLET MANAGEMENT
// ===============================================
function openWalletDepositModal() {
    openModal('walletDepositModal');
    initializeWalletForm();
}

function initializeWalletForm() {
    const patientInput = document.querySelector('#walletDepositModal input[placeholder*="Search patient"]');

    if (patientInput) {
        patientInput.addEventListener('input', debounce(function () {
            searchPatientsForWallet(this.value);
        }, 300));
    }
}

function searchPatientsForWallet(query) {
    if (!query || query.length < 2) return;

    // Find patient and load balance
    const patient = findPatient(query);
    if (patient) {
        loadPatientWalletBalance(patient);
    }
}

function loadPatientWalletBalance(patient) {
    const balance = BillingApp.state.walletBalances[patient.id] || 0;

    const balanceInput = document.querySelector('#walletDepositModal input[readonly]');
    if (balanceInput) {
        balanceInput.value = `${BillingApp.state.currencySymbol} ${balance.toLocaleString()}`;
    }
}

function handleWalletDeposit(e) {
    e.preventDefault();

    const depositData = {
        patientName: e.target.querySelector('input[placeholder*="Search patient"]')?.value,
        currentBalance: parseFloat(e.target.querySelector('input[readonly]')?.value.replace(/[^0-9.-]/g, '')) || 0,
        depositAmount: parseFloat(e.target.querySelector('input[placeholder*="amount"]')?.value) || 0,
        paymentMethod: e.target.querySelector('.form-select')?.value,
        reference: e.target.querySelector('input[placeholder*="reference"]')?.value,
        notes: e.target.querySelector('textarea')?.value,
        depositedBy: BillingApp.state.currentUser.id,
        depositedAt: new Date().toISOString()
    };

    // Validate deposit
    if (!depositData.patientName || depositData.depositAmount <= 0 || !depositData.paymentMethod) {
        showNotification('error', 'Please fill in all required fields');
        return;
    }

    // Process deposit
    processWalletDeposit(depositData);

    // Generate receipt
    generateDepositReceipt(depositData);

    showNotification('success', `${BillingApp.state.currencySymbol} ${depositData.depositAmount.toLocaleString()} added to wallet`);

    closeModal('walletDepositModal');
}

function processWalletDeposit(depositData) {
    // Update wallet balance
    const patient = findPatient(depositData.patientName);
    if (patient) {
        if (!BillingApp.state.walletBalances[patient.id]) {
            BillingApp.state.walletBalances[patient.id] = 0;
        }
        BillingApp.state.walletBalances[patient.id] += depositData.depositAmount;
    }

    // Add to transaction history
    addWalletTransaction(patient.id, depositData);

    // Update UI
    updateWalletDisplay(patient.id);

    // Add to audit
    addAuditEntry('WALLET_DEPOSIT', `Wallet deposit of ${BillingApp.state.currencySymbol} ${depositData.depositAmount.toLocaleString()} for ${depositData.patientName}`);
}

function viewWalletHistory(e) {
    const walletItem = e.target.closest('.wallet-item');
    const patientId = walletItem?.dataset.patientId;

    if (!patientId) return;

    // Load and display wallet history
    const history = getWalletHistory(patientId);
    displayWalletHistory(history);
}

function applyWalletToInvoice(e) {
    const walletItem = e.target.closest('.wallet-item');
    const patientId = walletItem?.dataset.patientId;

    if (!patientId) return;

    const balance = BillingApp.state.walletBalances[patientId] || 0;

    if (balance <= 0) {
        showNotification('warning', 'Insufficient wallet balance');
        return;
    }

    // Show invoice selection modal
    showInvoiceSelectionForWallet(patientId, balance);
}

// ===============================================
// RECEIPT GENERATION
// ===============================================
function openReceiptModal() {
    openModal('receiptModal');
    generateReceiptPreview();
}

function generateReceiptPreview() {
    // Generate receipt number
    const receiptNumber = 'RCP-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // Update receipt preview
    const receiptDetails = document.querySelector('.receipt-details');
    if (receiptDetails) {
        receiptDetails.querySelector('.receipt-row:nth-child(1) .value').textContent = receiptNumber;
        // Continue updating other fields...
    }
}

function sendReceipt(channel) {
    const receiptData = collectReceiptData();

    switch (channel) {
        case 'SMS':
            sendReceiptSMS(receiptData);
            break;
        case 'Email':
            sendReceiptEmail(receiptData);
            break;
        case 'WhatsApp':
            sendReceiptWhatsApp(receiptData);
            break;
    }
}

function sendReceiptSMS(receiptData) {
    const message = `Payment Receipt\n${receiptData.receiptNumber}\nAmount: ${BillingApp.state.currencySymbol} ${receiptData.amount}\nThank you for your payment.`;

    // In production, call SMS API
    console.log('Sending SMS:', message);

    showNotification('success', 'Receipt sent via SMS');
}

function sendReceiptEmail(receiptData) {
    // Generate HTML email with receipt
    const emailHTML = generateReceiptHTML(receiptData);

    // In production, call email API
    console.log('Sending email with receipt');

    showNotification('success', 'Receipt sent via email');
}

function sendReceiptWhatsApp(receiptData) {
    // Generate WhatsApp message
    const message = encodeURIComponent(`Payment Receipt ${receiptData.receiptNumber}\nAmount: ${BillingApp.state.currencySymbol} ${receiptData.amount}`);
    const whatsappUrl = `https://wa.me/${receiptData.phone}?text=${message}`;

    window.open(whatsappUrl, '_blank');

    showNotification('success', 'Receipt sent via WhatsApp');
}

function printReceipt() {
    window.print();
}

// ===============================================
// OUTSTANDING PAYMENTS
// ===============================================
function loadOutstandingPayments() {
    // Load from database
    const mockOutstanding = [
        {
            id: 'INV-2025-089',
            patientName: 'Michael Wachira',
            amount: 15000,
            daysOverdue: 14,
            phone: '+254712345678'
        },
        {
            id: 'INV-2025-095',
            patientName: 'Alice Wanjiku',
            amount: 8500,
            daysOverdue: 7,
            phone: '+254722345678'
        },
        {
            id: 'INV-2025-102',
            patientName: 'David Maina',
            amount: 5000,
            installment: '2/4',
            dueIn: 3,
            phone: '+254733345678'
        }
    ];

    BillingApp.state.outstandingPayments = mockOutstanding;
    updateOutstandingDisplay();
}

function updateOutstandingDisplay() {
    const totalOutstanding = BillingApp.state.outstandingPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Update summary stat
    const statCard = document.querySelector('.stat-card.warning .stat-value');
    if (statCard) {
        statCard.textContent = `${BillingApp.state.currencySymbol} ${totalOutstanding.toLocaleString()}`;
    }
}

function sendBulkReminders() {
    const overdue = BillingApp.state.outstandingPayments.filter(p => p.daysOverdue > 0);

    if (overdue.length === 0) {
        showNotification('info', 'No overdue payments to remind');
        return;
    }

    // Confirm action
    if (!confirm(`Send reminders to ${overdue.length} patients?`)) {
        return;
    }

    let sent = 0;
    overdue.forEach(payment => {
        sendPaymentReminder(payment);
        sent++;
    });

    showNotification('success', `${sent} payment reminders sent`);

    // Add to audit
    addAuditEntry('BULK_REMINDERS', `Sent ${sent} payment reminders`);
}

function sendIndividualReminder(e) {
    const item = e.target.closest('.outstanding-item');
    const invoiceNumber = item?.querySelector('.invoice-number')?.textContent;

    if (!invoiceNumber) return;

    const payment = BillingApp.state.outstandingPayments.find(p => p.id === invoiceNumber);
    if (payment) {
        sendPaymentReminder(payment);
        showNotification('success', `Reminder sent to ${payment.patientName}`);
    }
}

function sendPaymentReminder(payment) {
    const message = `Dear ${payment.patientName}, your invoice ${payment.id} of ${BillingApp.state.currencySymbol} ${payment.amount.toLocaleString()} is overdue. Please make payment to avoid service interruption.`;

    // In production, send via configured channels
    console.log('Sending reminder:', message);

    // Log reminder
    logReminderSent(payment.id);
}

function initiatePatientCall(e) {
    const item = e.target.closest('.outstanding-item');
    const phone = item?.dataset.phone;

    if (phone) {
        // In production, integrate with phone system
        window.location.href = `tel:${phone}`;

        // Log call
        addAuditEntry('PATIENT_CALL', `Initiated call to ${phone}`);
    }
}

// ===============================================
// INSTALLMENT PLANS
// ===============================================
function openInstallmentModal() {
    showNotification('info', 'Installment plan creation opening...');
    // Implementation for installment modal
}

function createInstallmentPlan(invoice) {
    if (!invoice.enableInstallments) return;

    const installmentAmount = invoice.total / parseInt(invoice.numInstallments);
    const installments = [];

    for (let i = 0; i < parseInt(invoice.numInstallments); i++) {
        const dueDate = calculateInstallmentDueDate(i, invoice.frequency);
        installments.push({
            number: i + 1,
            amount: installmentAmount,
            dueDate: dueDate,
            status: 'pending'
        });
    }

    invoice.installmentPlan = installments;

    // Set up reminders for each installment
    scheduleInstallmentReminders(invoice.id, installments);
}

function calculateInstallmentDueDate(index, frequency) {
    const date = new Date();

    switch (frequency) {
        case 'weekly':
            date.setDate(date.getDate() + (7 * (index + 1)));
            break;
        case 'biweekly':
            date.setDate(date.getDate() + (14 * (index + 1)));
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + (index + 1));
            break;
    }

    return date.toISOString();
}

function scheduleInstallmentReminders(invoiceId, installments) {
    installments.forEach((installment, index) => {
        // Schedule reminder 3 days before due date
        const reminderDate = new Date(installment.dueDate);
        reminderDate.setDate(reminderDate.getDate() - 3);

        // In production, schedule actual reminders
        console.log(`Scheduled reminder for installment ${index + 1} on ${reminderDate.toLocaleDateString()}`);
    });
}

function viewInstallmentPlan(e) {
    const item = e.target.closest('.outstanding-item');
    const invoiceNumber = item?.querySelector('.invoice-number')?.textContent;

    if (!invoiceNumber) return;

    const invoice = BillingApp.state.invoices.find(inv => inv.id === invoiceNumber.split(' ')[0]);
    if (invoice && invoice.installmentPlan) {
        displayInstallmentPlan(invoice);
    }
}

// ===============================================
// PLATFORM FEES
// ===============================================
function loadPlatformFees() {
    // Calculate platform fees
    const currentMonth = new Date().toISOString().slice(0, 7);
    const totalRevenue = calculateMonthlyRevenue(currentMonth);
    const platformFee = totalRevenue * BillingApp.state.platformFeeRate;

    BillingApp.state.platformFees.push({
        period: currentMonth,
        revenue: totalRevenue,
        fee: platformFee,
        status: 'pending',
        dueDate: calculateFeesDueDate()
    });

    updatePlatformFeesDisplay();
}

function calculateMonthlyRevenue(month) {
    return BillingApp.state.invoices
        .filter(inv => inv.createdAt.startsWith(month) && inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);
}

function calculateFeesDueDate() {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(5); // Due on 5th of next month
    return date.toISOString();
}

function updatePlatformFeesDisplay() {
    const currentFee = BillingApp.state.platformFees[BillingApp.state.platformFees.length - 1];

    if (currentFee && currentFee.status === 'pending') {
        // Update alert display
        const feeAlert = document.querySelector('.fee-alert span');
        if (feeAlert) {
            const daysUntilDue = Math.ceil((new Date(currentFee.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            feeAlert.innerHTML = `Platform fee of <strong>${BillingApp.state.currencySymbol} ${currentFee.fee.toLocaleString()}</strong> due in ${daysUntilDue} days`;
        }
    }
}

function payPlatformFee(e) {
    const row = e.target.closest('tr');
    const period = row?.querySelector('td:first-child')?.textContent;

    if (!period) return;

    // Process platform fee payment
    initiatePlatformFeePayment(period);
}

function initiatePlatformFeePayment(period) {
    const fee = BillingApp.state.platformFees.find(f => f.period === period);

    if (!fee) return;

    // Show payment options
    const paymentMethod = prompt('Select payment method:\n1. M-Pesa\n2. Bank Transfer');

    if (paymentMethod === '1') {
        // M-Pesa STK push
        initiateSTKPush(fee.fee);
    } else if (paymentMethod === '2') {
        // Show bank details
        showBankTransferDetails(fee.fee);
    }
}

// ===============================================
// REPORTS & ANALYTICS
// ===============================================
function generateReports() {
    generateDailyCashierReport();
    generateRevenueByService();
    generateRevenueByDoctor();
}

function generateDailyCashierReport() {
    const today = new Date().toISOString().slice(0, 10);

    const cashPayments = BillingApp.state.paymentLogs
        .filter(log => log.date.startsWith(today) && log.method === 'cash')
        .reduce((sum, log) => sum + log.amount, 0);

    const mpesaPayments = BillingApp.state.paymentLogs
        .filter(log => log.date.startsWith(today) && log.method === 'mpesa')
        .reduce((sum, log) => sum + log.amount, 0);

    const insurancePayments = BillingApp.state.paymentLogs
        .filter(log => log.date.startsWith(today) && log.method === 'insurance')
        .reduce((sum, log) => sum + log.amount, 0);

    BillingApp.state.reports.daily = {
        cash: cashPayments,
        mpesa: mpesaPayments,
        insurance: insurancePayments,
        total: cashPayments + mpesaPayments + insurancePayments
    };

    updateReportDisplay('daily', BillingApp.state.reports.daily);
}

function generateRevenueByService() {
    const serviceRevenue = {};

    BillingApp.state.invoices.forEach(invoice => {
        if (invoice.status === 'paid') {
            invoice.services?.forEach(service => {
                if (!serviceRevenue[service.serviceId]) {
                    serviceRevenue[service.serviceId] = 0;
                }
                serviceRevenue[service.serviceId] += service.amount;
            });
        }
    });

    BillingApp.state.reports.revenue = serviceRevenue;
    updateReportDisplay('service', serviceRevenue);
}

function generateRevenueByDoctor() {
    const doctorRevenue = {
        'Dr. James Ochieng': 92000,
        'Dr. Mary Kamau': 78600,
        'Dr. Peter Mutua': 75000
    };

    BillingApp.state.reports.doctor = doctorRevenue;
    updateReportDisplay('doctor', doctorRevenue);
}

function updateReportDisplay(type, data) {
    switch (type) {
        case 'daily':
            // Update daily cashier report display
            document.querySelector('.summary-item:nth-child(1) .value').textContent =
                `${BillingApp.state.currencySymbol} ${data.cash.toLocaleString()}`;
            document.querySelector('.summary-item:nth-child(2) .value').textContent =
                `${BillingApp.state.currencySymbol} ${data.mpesa.toLocaleString()}`;
            document.querySelector('.summary-item:nth-child(3) .value').textContent =
                `${BillingApp.state.currencySymbol} ${data.insurance.toLocaleString()}`;
            document.querySelector('.summary-item.total .value').textContent =
                `${BillingApp.state.currencySymbol} ${data.total.toLocaleString()}`;
            break;
    }
}

function generateCustomReport() {
    const startDate = document.getElementById('reportStartDate')?.value;
    const endDate = document.getElementById('reportEndDate')?.value;

    if (!startDate || !endDate) {
        showNotification('warning', 'Please select date range');
        return;
    }

    // Generate report for custom date range
    const customReport = generateReportForDateRange(startDate, endDate);

    // Update display
    updateReportDisplay('custom', customReport);

    showNotification('success', 'Report generated successfully');
}

function exportReport(e) {
    const reportCard = e.target.closest('.report-card');
    const reportType = reportCard?.querySelector('h3')?.textContent;

    // Prepare report data
    const reportData = prepareReportData(reportType);

    // Export as PDF
    exportAsPDF(reportData, reportType);
}

function exportAsPDF(data, title) {
    // In production, use PDF library
    console.log('Exporting report as PDF:', title, data);

    showNotification('success', 'Report exported as PDF');
}

// ===============================================
// FILTERS AND SEARCH
// ===============================================
function initializeFilters() {
    // Initialize filter state from UI
    BillingApp.state.filters.doctor = document.getElementById('doctorFilter')?.value || '';
    BillingApp.state.filters.status = document.getElementById('statusFilter')?.value || '';
    BillingApp.state.filters.method = document.getElementById('methodFilter')?.value || '';
}

function filterInvoices() {
    const filters = {
        doctor: document.getElementById('doctorFilter')?.value,
        status: document.getElementById('statusFilter')?.value,
        method: document.getElementById('methodFilter')?.value
    };

    let filteredInvoices = [...BillingApp.state.invoices];

    if (filters.doctor) {
        filteredInvoices = filteredInvoices.filter(inv => inv.doctor === filters.doctor);
    }

    if (filters.status) {
        filteredInvoices = filteredInvoices.filter(inv => inv.status === filters.status);
    }

    if (filters.method) {
        filteredInvoices = filteredInvoices.filter(inv => inv.paymentMethod === filters.method);
    }

    displayInvoices(filteredInvoices);
}

function searchInvoices(e) {
    const query = e.target.value.toLowerCase();

    if (!query) {
        displayInvoices(BillingApp.state.invoices);
        return;
    }

    const filtered = BillingApp.state.invoices.filter(inv =>
        inv.id.toLowerCase().includes(query) ||
        inv.patientName.toLowerCase().includes(query) ||
        inv.doctor?.toLowerCase().includes(query)
    );

    displayInvoices(filtered);
}

function displayInvoices(invoices) {
    const tbody = document.querySelector('.invoice-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    invoices.forEach(invoice => {
        const row = createInvoiceRow(invoice);
        tbody.appendChild(row);
    });
}

// ===============================================
// PAYMENT METHODS
// ===============================================
function initializePaymentMethods() {
    // Set up copy functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', copyToClipboard);
    });
}

function copyToClipboard(e) {
    const detailItem = e.target.closest('.detail-item');
    const value = detailItem?.querySelector('.detail-value')?.textContent;

    if (value) {
        navigator.clipboard.writeText(value).then(() => {
            showNotification('success', 'Copied to clipboard');
        });
    }
}

// ===============================================
// REAL-TIME SYNCHRONIZATION
// ===============================================
function initializeRealtimeSync() {
    // Initialize WebSocket for real-time updates
    if ('WebSocket' in window) {
        try {
            const ws = new WebSocket(BillingApp.config.websocketUrl);

            ws.onopen = () => {
                console.log('WebSocket connected for billing sync');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleRealtimeUpdate(data);
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected. Reconnecting...');
                setTimeout(initializeRealtimeSync, 5000);
            };

            BillingApp.websocket = ws;
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }
    }

    // Sync with other pages
    syncWithOtherPages();
}

function handleRealtimeUpdate(data) {
    switch (data.type) {
        case 'payment_received':
            handleRealtimePayment(data.payload);
            break;
        case 'invoice_created':
            handleRealtimeInvoice(data.payload);
            break;
        case 'insurance_claim_update':
            handleClaimUpdate(data.payload);
            break;
        case 'refund_approved':
            handleRefundApproval(data.payload);
            break;
    }
}

function syncWithOtherPages() {
    // Sync with Dashboard
    syncWithDashboard();

    // Sync with Check-In
    syncWithCheckIn();

    // Sync with Doctor Account for insurance claims
    syncWithDoctorAccount();
}

function syncWithDashboard() {
    const dashboardData = {
        todaysCollections: BillingApp.state.reports.daily.total,
        invoicesGenerated: BillingApp.state.invoices.filter(inv =>
            inv.createdAt.startsWith(new Date().toISOString().slice(0, 10))
        ).length,
        outstandingAmount: BillingApp.state.outstandingPayments.reduce((sum, p) => sum + p.amount, 0),
        platformFeeDue: BillingApp.state.platformFees.find(f => f.status === 'pending')?.fee || 0
    };

    // Send to dashboard
    if (BillingApp.websocket?.readyState === WebSocket.OPEN) {
        BillingApp.websocket.send(JSON.stringify({
            type: 'dashboard_update',
            data: dashboardData
        }));
    }

    // Also update localStorage for cross-tab communication
    localStorage.setItem('billing_dashboard_sync', JSON.stringify(dashboardData));
}

function syncWithCheckIn() {
    // Share patient invoice status with check-in
    const patientInvoices = {};

    BillingApp.state.invoices.forEach(invoice => {
        if (!patientInvoices[invoice.patientName]) {
            patientInvoices[invoice.patientName] = [];
        }
        patientInvoices[invoice.patientName].push({
            id: invoice.id,
            amount: invoice.total,
            status: invoice.status,
            balance: invoice.balance || 0
        });
    });

    localStorage.setItem('patient_invoices', JSON.stringify(patientInvoices));
}

function syncWithDoctorAccount() {
    // Request medical documents for insurance claims
    if (BillingApp.websocket?.readyState === WebSocket.OPEN) {
        BillingApp.websocket.send(JSON.stringify({
            type: 'request_medical_docs',
            data: { invoiceId: BillingApp.state.selectedInvoice }
        }));
    }
}

// ===============================================
// AUDIT & LOGGING
// ===============================================
function loadPaymentLogs() {
    // Load from database
    const mockLogs = [
        {
            timestamp: '2025-09-29 14:32:15',
            invoiceId: 'INV-2025-001',
            action: 'Payment Received',
            amount: 5500,
            method: 'M-Pesa',
            user: 'Sarah Wanjiru',
            details: 'Trans: PH45GHJ2K1'
        },
        {
            timestamp: '2025-09-29 14:15:08',
            invoiceId: 'INV-2025-098',
            action: 'Refund Processed',
            amount: 2000,
            method: 'M-Pesa',
            user: 'Admin User',
            details: 'Approved by Manager'
        }
    ];

    BillingApp.state.paymentLogs = mockLogs;
}

function addPaymentLog(paymentData) {
    const log = {
        timestamp: new Date().toLocaleString(),
        invoiceId: paymentData.invoiceNumber,
        action: 'Payment Received',
        amount: paymentData.amountReceived,
        method: paymentData.paymentMethod,
        user: BillingApp.state.currentUser.name,
        details: paymentData.transactionRef || 'N/A'
    };

    BillingApp.state.paymentLogs.unshift(log);

    // Update display
    addLogToTable(log);
}

function addLogToTable(log) {
    const tbody = document.querySelector('.logs-table tbody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${log.timestamp}</td>
        <td>${log.invoiceId}</td>
        <td>${log.action}</td>
        <td>${BillingApp.state.currencySymbol} ${log.amount.toLocaleString()}</td>
        <td>${log.method}</td>
        <td>${log.user}</td>
        <td>${log.details}</td>
    `;

    tbody.insertBefore(row, tbody.firstChild);
}

function addAuditEntry(action, details) {
    const entry = {
        id: 'AUDIT-' + Date.now(),
        action: action,
        details: details,
        userId: BillingApp.state.currentUser.id,
        userName: BillingApp.state.currentUser.name,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.100' // In production, get actual IP
    };

    // Save to audit log
    saveAuditLog(entry);
}

function saveAuditLog(entry) {
    // In production, save to database
    console.log('Audit log entry:', entry);

    // Also store locally
    const auditLog = JSON.parse(localStorage.getItem('billing_audit_log') || '[]');
    auditLog.push(entry);
    localStorage.setItem('billing_audit_log', JSON.stringify(auditLog));
}

function exportPaymentLogs() {
    const format = prompt('Export format:\n1. CSV\n2. PDF\n3. Excel');

    switch (format) {
        case '1':
            exportLogsAsCSV();
            break;
        case '2':
            exportLogsAsPDF();
            break;
        case '3':
            exportLogsAsExcel();
            break;
    }
}

function exportLogsAsCSV() {
    const csv = convertLogsToCSV(BillingApp.state.paymentLogs);
    downloadFile(csv, 'payment_logs.csv', 'text/csv');
    showNotification('success', 'Payment logs exported as CSV');
}

// ===============================================
// ALERTS & NOTIFICATIONS
// ===============================================
function loadAlerts() {
    // Check for various alert conditions
    checkPlatformFeeAlert();
    checkOverdueInvoicesAlert();
    checkInsuranceClaimsAlert();
}

function checkPlatformFeeAlert() {
    const pendingFee = BillingApp.state.platformFees.find(f => f.status === 'pending');

    if (pendingFee) {
        const daysUntilDue = Math.ceil((new Date(pendingFee.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue <= 3) {
            addAlert({
                type: 'high-priority',
                title: 'Platform Fee Due',
                description: `Monthly fee of ${BillingApp.state.currencySymbol} ${pendingFee.fee.toLocaleString()} due in ${daysUntilDue} days`,
                action: 'Pay Now'
            });
        }
    }
}

function checkOverdueInvoicesAlert() {
    const overdueCount = BillingApp.state.outstandingPayments.filter(p => p.daysOverdue > 7).length;

    if (overdueCount > 0) {
        const totalOverdue = BillingApp.state.outstandingPayments
            .filter(p => p.daysOverdue > 7)
            .reduce((sum, p) => sum + p.amount, 0);

        addAlert({
            type: 'medium-priority',
            title: `${overdueCount} Overdue Invoices`,
            description: `Total of ${BillingApp.state.currencySymbol} ${totalOverdue.toLocaleString()} pending for over 7 days`,
            action: 'Review'
        });
    }
}

function checkInsuranceClaimsAlert() {
    // Check for approved claims
    const approvedClaims = BillingApp.state.invoices.filter(inv =>
        inv.status === 'pending-claim' && inv.claimStatus === 'approved'
    );

    approvedClaims.forEach(invoice => {
        addAlert({
            type: 'success',
            title: 'Insurance Claim Approved',
            description: `Claim for invoice ${invoice.id} approved for ${BillingApp.state.currencySymbol} ${invoice.total.toLocaleString()}`,
            action: 'View'
        });
    });
}

function addAlert(alert) {
    BillingApp.state.alerts.push(alert);

    // Update alert count
    const alertCount = document.querySelector('.alert-count');
    if (alertCount) {
        alertCount.textContent = `${BillingApp.state.alerts.length} Active Alerts`;
    }
}

function handleAlertAction(e) {
    const alertItem = e.target.closest('.alert-item');
    const alertTitle = alertItem?.querySelector('.alert-title')?.textContent;

    switch (alertTitle) {
        case 'Platform Fee Due':
            openModal('platformFeeModal');
            break;
        case 'Overdue Invoices':
            filterInvoicesByStatus('overdue');
            break;
        case 'Insurance Claim Approved':
            viewApprovedClaim();
            break;
    }
}

// ===============================================
// AUTO-SAVE & MONITORING
// ===============================================
function startAutoSave() {
    setInterval(() => {
        // Save application state
        const stateToSave = {
            invoices: BillingApp.state.invoices,
            walletBalances: BillingApp.state.walletBalances,
            outstandingPayments: BillingApp.state.outstandingPayments,
            paymentLogs: BillingApp.state.paymentLogs.slice(-100) // Keep last 100
        };

        localStorage.setItem('billing_app_state', JSON.stringify(stateToSave));
        console.log('Auto-save completed');
    }, BillingApp.config.autoSaveInterval);
}

function startPaymentMonitoring() {
    // Monitor for overdue payments
    setInterval(() => {
        BillingApp.state.invoices.forEach(invoice => {
            if (invoice.status === 'unpaid') {
                const daysOverdue = calculateDaysOverdue(invoice.createdAt);

                if (daysOverdue > BillingApp.config.overdueThreshold) {
                    markAsOverdue(invoice.id);
                }
            }
        });
    }, 86400000); // Check daily
}

function startReminderSystem() {
    // Check for reminders to send
    setInterval(() => {
        checkAndSendReminders();
    }, BillingApp.config.reminderInterval);
}

function checkAndSendReminders() {
    const today = new Date().toISOString().slice(0, 10);

    // Check installment reminders
    BillingApp.state.invoices.forEach(invoice => {
        if (invoice.installmentPlan) {
            invoice.installmentPlan.forEach(installment => {
                if (installment.status === 'pending') {
                    const dueDate = new Date(installment.dueDate).toISOString().slice(0, 10);
                    const daysBefore = calculateDaysBetween(today, dueDate);

                    if (daysBefore === 3) {
                        sendInstallmentReminder(invoice, installment);
                    }
                }
            });
        }
    });
}

// ===============================================
// PROFILE & SETTINGS
// ===============================================
function initializeProfileMenu() {
    const userProfile = document.getElementById('userProfile');
    const profilePopup = document.getElementById('profilePopup');

    if (userProfile && profilePopup) {
        userProfile.addEventListener('click', (e) => {
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
        BillingApp.state.darkMode = true;
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    BillingApp.state.darkMode = !BillingApp.state.darkMode;

    // Save preference
    localStorage.setItem('darkMode', BillingApp.state.darkMode);

    // Update icon
    const icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        icon.className = BillingApp.state.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ===============================================
// UTILITY FUNCTIONS
// ===============================================
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
            
            .app-notification i { font-size: 20px; }
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
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
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

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-KE');
}

function formatStatus(status) {
    const statusMap = {
        'paid': 'Paid',
        'unpaid': 'Unpaid',
        'partial': 'Partial',
        'pending-claim': 'Pending Claim',
        'overdue': 'Overdue'
    };
    return statusMap[status] || status;
}

function findPatient(query) {
    // In production, search database
    return {
        id: 'PAT-' + Math.floor(Math.random() * 1000),
        name: query,
        phone: '+254712345678'
    };
}

function calculateDaysOverdue(createdDate) {
    const created = new Date(createdDate);
    const now = new Date();
    const diff = now - created;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calculateDaysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = d2 - d1;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function convertLogsToCSV(logs) {
    const headers = ['Timestamp', 'Invoice ID', 'Action', 'Amount', 'Method', 'User', 'Details'];
    const rows = logs.map(log => [
        log.timestamp,
        log.invoiceId,
        log.action,
        log.amount,
        log.method,
        log.user,
        log.details
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function generateReceiptHTML(receiptData) {
    return `
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Payment Receipt</h2>
            <p>Receipt Number: ${receiptData.receiptNumber}</p>
            <p>Amount: ${BillingApp.state.currencySymbol} ${receiptData.amount}</p>
            <p>Date: ${receiptData.date}</p>
            <p>Thank you for your payment.</p>
        </body>
        </html>
    `;
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
                    openCreateInvoiceModal();
                    break;
                case 'p':
                    e.preventDefault();
                    openMarkPaidModal();
                    break;
                case 'r':
                    e.preventDefault();
                    openReceiptModal();
                    break;
                case 'f':
                    e.preventDefault();
                    document.getElementById('invoiceSearch')?.focus();
                    break;
            }
        }

        // ESC to close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
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
        { selector: '.action-btn', text: 'Click for action' },
        { selector: '.status-badge', text: 'Payment status' },
        { selector: '.copy-btn', text: 'Click to copy' }
    ];

    tooltips.forEach(({ selector, text }) => {
        document.querySelectorAll(selector).forEach(element => {
            if (!element.title) {
                element.title = text;
            }
        });
    });
}

// ===============================================
// ERROR HANDLING
// ===============================================
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    addAuditEntry('ERROR', e.error?.message || 'Unknown error occurred');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    addAuditEntry('ERROR', 'Unhandled promise rejection');
});

// ===============================================
// CLEANUP ON PAGE UNLOAD
// ===============================================
window.addEventListener('beforeunload', () => {
    // Save state
    const stateToSave = {
        invoices: BillingApp.state.invoices,
        walletBalances: BillingApp.state.walletBalances,
        outstandingPayments: BillingApp.state.outstandingPayments,
        filters: BillingApp.state.filters,
        paymentLogs: BillingApp.state.paymentLogs.slice(-50)
    };

    localStorage.setItem('billing_app_state', JSON.stringify(stateToSave));

    // Close WebSocket
    if (BillingApp.websocket) {
        BillingApp.websocket.close();
    }
});

// Additional helper functions for missing implementations
function loadInvoices() {
    // Load from localStorage or initialize with mock data
    const stored = localStorage.getItem('curis_invoices');
    if (stored) {
        BillingApp.state.invoices = JSON.parse(stored);
    } else {
        // Mock data
        BillingApp.state.invoices = [];
    }
}

function loadWalletData() {
    const stored = localStorage.getItem('wallet_balances');
    if (stored) {
        BillingApp.state.walletBalances = JSON.parse(stored);
    }
}

function updateInvoiceStatus(invoiceId, newStatus) {
    const invoice = BillingApp.state.invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        invoice.status = newStatus;
        // Update UI
        const row = document.querySelector(`td:contains('${invoiceId}')`);
        if (row) {
            const statusBadge = row.closest('tr').querySelector('.status-badge');
            statusBadge.className = `status-badge ${newStatus}`;
            statusBadge.textContent = formatStatus(newStatus);
        }
    }
}

console.log('Curis Billing System JavaScript Loaded Successfully');
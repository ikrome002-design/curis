/* ===================================
   CURIS BILLINGS & PAYMENTS - JAVASCRIPT
   Modern Healthcare Platform
   =================================== */

// ===================================
// 1. GLOBAL STATE MANAGEMENT
// ===================================

const BillingsState = {
    currentUser: {
        id: 'self',
        name: 'John Kamau',
        relationship: 'Self',
        age: 45,
        avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png',
        outstanding: 12500,
        paid: 48500,
        pending: 0,
        overdue: 12500
    },
    familyMembers: [
        {
            id: 'self',
            name: 'John Kamau',
            relationship: 'Self',
            age: 45,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            outstanding: 12500,
            paid: 48500,
            pending: 0,
            overdue: 12500
        },
        {
            id: 'spouse',
            name: 'Jane Kamau',
            relationship: 'Spouse',
            age: 42,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            outstanding: 0,
            paid: 15000,
            pending: 0,
            overdue: 0
        },
        {
            id: 'daughter',
            name: 'Mary Kamau',
            relationship: 'Daughter',
            age: 12,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            outstanding: 8750,
            paid: 12000,
            pending: 8750,
            overdue: 0
        },
        {
            id: 'son',
            name: 'David Kamau',
            relationship: 'Son',
            age: 8,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            outstanding: 8500,
            paid: 8500,
            pending: 0,
            overdue: 0
        }
    ],
    activeTab: 'outstanding',
    searchFilters: {
        patient: 'all',
        clinics: [],
        invoiceNumber: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: ''
    },
    currentInvoice: null,
    notificationSettings: {
        email: true,
        sms: true,
        whatsapp: true,
        inApp: true,
        newInvoice: true,
        paymentStatus: true,
        reminders: true,
        overdue: true,
        submissions: true,
        familyScope: 'all'
    }
};

// Mock invoice data
const invoiceData = [
    {
        id: 'INV-2025-001234',
        clinic: 'Nairobi Health Center',
        clinicLocation: 'Westlands, Nairobi',
        patient: 'John Kamau (Self)',
        patientId: 'self',
        issueDate: '2025-09-30',
        dueDate: '2025-10-15',
        amount: 12500,
        status: 'overdue',
        services: [
            { name: 'General Consultation', amount: 3000 },
            { name: 'Blood Test - Complete Blood Count', amount: 2500 },
            { name: 'Medication - Amoxicillin 500mg', amount: 7000 }
        ]
    },
    {
        id: 'INV-2025-001456',
        clinic: 'Westlands Medical Clinic',
        clinicLocation: 'Westlands, Nairobi',
        patient: 'Mary Kamau (Daughter)',
        patientId: 'daughter',
        issueDate: '2025-10-01',
        dueDate: '2025-10-16',
        amount: 8750,
        status: 'pending-review',
        services: [
            { name: 'Pediatric Check-up', amount: 2500 },
            { name: 'HPV Vaccination', amount: 4500 },
            { name: 'Growth Assessment', amount: 1750 }
        ],
        paymentProof: {
            method: 'mpesa',
            transactionCode: 'RKL4M2N8P5',
            submittedDate: '2025-10-01T16:15:00',
            file: 'mpesa_receipt.jpg'
        }
    },
    {
        id: 'INV-2025-001589',
        clinic: 'Karen Hospital',
        clinicLocation: 'Karen, Nairobi',
        patient: 'David Kamau (Son)',
        patientId: 'son',
        issueDate: '2025-10-02',
        dueDate: '2025-10-17',
        amount: 8500,
        status: 'outstanding',
        isNew: true,
        services: [
            { name: 'Emergency Consultation', amount: 5000 },
            { name: 'X-Ray Imaging', amount: 3500 }
        ]
    }
];

// Mock payment history data
const paymentHistory = [
    {
        id: 'PAY-001',
        invoiceId: 'INV-2025-001123',
        clinic: 'Nairobi Health Center',
        patient: 'John Kamau (Self)',
        patientId: 'self',
        amount: 5500,
        method: 'M-Pesa',
        transactionCode: 'QGH7X8Y9Z0',
        date: '2025-09-28T14:45:00',
        status: 'paid',
        service: 'General Consultation & Lab Tests'
    },
    {
        id: 'PAY-002',
        invoiceId: 'INV-2025-001045',
        clinic: 'Westlands Medical Clinic',
        patient: 'Mary Kamau (Daughter)',
        patientId: 'daughter',
        amount: 4500,
        method: 'Bank Transfer',
        transactionCode: 'FT2025091501234',
        date: '2025-09-15T10:30:00',
        status: 'paid',
        service: 'Pediatric Vaccination'
    },
    {
        id: 'PAY-003',
        invoiceId: 'INV-2025-000987',
        clinic: 'Karen Hospital',
        patient: 'John Kamau (Self)',
        patientId: 'self',
        amount: 6200,
        method: 'M-Pesa',
        date: '2025-09-10T15:20:00',
        status: 'rejected',
        rejectionReason: 'Transaction code does not match our records. Please verify the M-Pesa transaction code and resubmit with correct details.'
    }
];

// ===================================
// 2. UTILITY FUNCTIONS
// ===================================

const Utils = {
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${iconMap[type]}"></i>
            <p>${message}</p>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in-out';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    },

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    formatDateTime(dateString) {
        const date = new Date(dateString);
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
        return `${date.toLocaleDateString('en-US', dateOptions)} at ${date.toLocaleTimeString('en-US', timeOptions)}`;
    },

    formatCurrency(amount) {
        return `KES. ${amount.toLocaleString()}`;
    },

    showLoading(show = true, message = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = document.getElementById('loadingText');
        
        if (show) {
            if (text) text.textContent = message;
            if (overlay) overlay.classList.add('active');
        } else {
            if (overlay) overlay.classList.remove('active');
        }
    },

    isOverdue(dueDate) {
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return due < today;
    },

    calculateTotalOutstanding(memberId = 'all') {
        if (memberId === 'all') {
            return BillingsState.familyMembers.reduce((sum, member) => sum + member.outstanding, 0);
        }
        const member = BillingsState.familyMembers.find(m => m.id === memberId);
        return member ? member.outstanding : 0;
    },

    calculateTotalPaid(memberId = 'all') {
        if (memberId === 'all') {
            return BillingsState.familyMembers.reduce((sum, member) => sum + member.paid, 0);
        }
        const member = BillingsState.familyMembers.find(m => m.id === memberId);
        return member ? member.paid : 0;
    }
};

// ===================================
// 3. FAMILY MEMBER SWITCHER
// ===================================

function initializeFamilySwitcher() {
    const profileSelector = document.getElementById('profileSelector');
    const familyMembers = document.querySelectorAll('.family-member');
    
    if (profileSelector) {
        profileSelector.addEventListener('click', () => {
            Utils.openModal('familyModal');
        });
    }
    
    familyMembers.forEach(member => {
        member.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member-id');
            selectFamilyMember(memberId);
        });
    });
}

function selectFamilyMember(memberId) {
    if (memberId === 'all') {
        BillingsState.currentUser = {
            id: 'all',
            name: 'All Family Members',
            relationship: 'Family',
            outstanding: Utils.calculateTotalOutstanding('all'),
            paid: Utils.calculateTotalPaid('all')
        };
    } else {
        const member = BillingsState.familyMembers.find(m => m.id === memberId);
        if (!member) return;
        BillingsState.currentUser = member;
    }
    
    updateProfileDisplay();
    updatePaymentSummary();
    applyFilters();
    
    document.querySelectorAll('.family-member').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`[data-member-id="${memberId}"]`)?.classList.add('active');
    
    Utils.closeModal('familyModal');
    Utils.showToast(`Viewing ${BillingsState.currentUser.name}'s invoices`, 'success');
}

function updateProfileDisplay() {
    const profileName = document.querySelector('.profile-name');
    const profileAvatar = document.querySelector('.profile-avatar');
    
    if (profileName) {
        const relationship = BillingsState.currentUser.id === 'all' 
            ? '' 
            : ` (${BillingsState.currentUser.relationship})`;
        profileName.textContent = `${BillingsState.currentUser.name}${relationship}`;
    }
    
    if (profileAvatar && BillingsState.currentUser.avatar) {
        profileAvatar.src = BillingsState.currentUser.avatar;
    }
}

function updatePaymentSummary() {
    const userId = BillingsState.currentUser.id;
    
    let totalOutstanding = 0;
    let totalPaid = 0;
    let pendingReview = 0;
    let overdue = 0;
    
    if (userId === 'all') {
        BillingsState.familyMembers.forEach(member => {
            totalOutstanding += member.outstanding;
            totalPaid += member.paid;
            pendingReview += member.pending;
            overdue += member.overdue;
        });
    } else {
        totalOutstanding = BillingsState.currentUser.outstanding;
        totalPaid = BillingsState.currentUser.paid;
        pendingReview = BillingsState.currentUser.pending;
        overdue = BillingsState.currentUser.overdue;
    }
    
    const summaryElements = {
        '.total-outstanding .summary-value': totalOutstanding,
        '.total-paid .summary-value': totalPaid,
        '.pending-review .summary-value': pendingReview,
        '.overdue .summary-value': overdue
    };
    
    Object.entries(summaryElements).forEach(([selector, amount]) => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = Utils.formatCurrency(amount);
        }
    });
}

// ===================================
// 4. TAB MANAGEMENT
// ===================================

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.invoice-tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    BillingsState.activeTab = tabName;
    
    document.querySelectorAll('.invoice-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
    
    loadTabContent(tabName);
}

function loadTabContent(tabName) {
    switch(tabName) {
        case 'outstanding':
            displayOutstandingInvoices();
            break;
        case 'historical':
            displayPaymentHistory();
            break;
        case 'pending-review':
            displayPendingReview();
            break;
    }
}

// ===================================
// 5. INVOICE DISPLAY
// ===================================

function displayOutstandingInvoices() {
    const grid = document.querySelector('#outstanding-tab .invoice-cards-grid');
    if (!grid) return;
    
    const filtered = filterInvoices(invoiceData.filter(inv => 
        inv.status === 'outstanding' || inv.status === 'overdue' || inv.isNew
    ));
    
    if (filtered.length === 0) {
        grid.innerHTML = '';
        document.querySelector('#outstanding-tab .empty-state').style.display = 'block';
        return;
    }
    
    document.querySelector('#outstanding-tab .empty-state').style.display = 'none';
    grid.innerHTML = filtered.map(invoice => createInvoiceCard(invoice)).join('');
    
    attachInvoiceCardListeners();
}

function filterInvoices(invoices) {
    const userId = BillingsState.currentUser.id;
    
    return invoices.filter(invoice => {
        if (userId !== 'all' && invoice.patientId !== userId) return false;
        
        if (BillingsState.searchFilters.invoiceNumber && 
            !invoice.id.toLowerCase().includes(BillingsState.searchFilters.invoiceNumber.toLowerCase())) {
            return false;
        }
        
        return true;
    });
}

function createInvoiceCard(invoice) {
    const statusClass = invoice.status === 'overdue' ? 'overdue-invoice' : 
                       invoice.status === 'pending' ? 'pending-invoice' : 
                       invoice.isNew ? 'new-invoice' : '';
    
    const statusBadge = invoice.status === 'overdue' ? 
        '<span class="status-badge status-overdue"><i class="fas fa-triangle-exclamation"></i>Overdue</span>' :
        invoice.status === 'pending' ? 
        '<span class="status-badge status-pending"><i class="fas fa-clock"></i>Due Soon</span>' :
        invoice.isNew ? 
        '<span class="status-badge status-new"><i class="fas fa-sparkles"></i>New</span>' : '';
    
    const dependentBadge = invoice.patientId !== 'self' ? 
        `<span class="status-badge status-dependent"><i class="fas fa-user"></i>${invoice.patient}</span>` : '';
    
    const servicesHTML = invoice.services.map(service => `
        <li class="service-item">
            <span class="service-name">${service.name}</span>
            <span class="service-amount">${Utils.formatCurrency(service.amount)}</span>
        </li>
    `).join('');
    
    return `
        <div class="invoice-card ${statusClass}">
            <div class="invoice-card-header">
                <div class="clinic-branding">
                    <div class="clinic-logo">
                        <i class="fas fa-hospital"></i>
                    </div>
                    <div class="clinic-info">
                        <h3 class="clinic-name">${invoice.clinic}</h3>
                        <p class="clinic-location">${invoice.clinicLocation}</p>
                    </div>
                </div>
                <div class="invoice-status-badges">
                    ${statusBadge}
                    ${dependentBadge}
                </div>
            </div>
            
            <div class="invoice-card-body">
                <div class="invoice-details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Invoice Number</span>
                        <span class="detail-value">${invoice.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Patient</span>
                        <span class="detail-value">${invoice.patient}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Issue Date</span>
                        <span class="detail-value">${Utils.formatDate(invoice.issueDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Due Date</span>
                        <span class="detail-value ${invoice.status === 'overdue' ? 'due-date-overdue' : ''}">
                            ${Utils.formatDate(invoice.dueDate)}
                        </span>
                    </div>
                </div>
                
                <div class="service-summary">
                    <h4 class="summary-title">Services Rendered</h4>
                    <ul class="service-list">
                        ${servicesHTML}
                    </ul>
                </div>
                
                <div class="invoice-amount-total">
                    <span class="amount-label">Amount Due</span>
                    <span class="amount-value">${Utils.formatCurrency(invoice.amount)}</span>
                </div>
            </div>
            
            <div class="invoice-card-footer">
                <button class="card-action-btn btn-secondary download-invoice-btn" data-invoice-id="${invoice.id}">
                    <i class="fas fa-download"></i>
                    Download Invoice
                </button>
                <button class="card-action-btn btn-secondary dispute-invoice-btn" data-invoice-id="${invoice.id}">
                    <i class="fas fa-flag"></i>
                    Dispute
                </button>
                <button class="card-action-btn btn-primary pay-now-btn" data-invoice-id="${invoice.id}" data-amount="${invoice.amount}">
                    <i class="fas fa-credit-card"></i>
                    Pay Now
                </button>
            </div>
        </div>
    `;
}

function attachInvoiceCardListeners() {
    document.querySelectorAll('.download-invoice-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const invoiceId = this.getAttribute('data-invoice-id');
            downloadInvoice(invoiceId);
        });
    });
    
    document.querySelectorAll('.dispute-invoice-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const invoiceId = this.getAttribute('data-invoice-id');
            openDisputeModal(invoiceId);
        });
    });
    
    document.querySelectorAll('.pay-now-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const invoiceId = this.getAttribute('data-invoice-id');
            const amount = this.getAttribute('data-amount');
            openPaymentProofModal(invoiceId, amount);
        });
    });
}

// ===================================
// 6. PAYMENT HISTORY DISPLAY
// ===================================

function displayPaymentHistory() {
    const timeline = document.querySelector('#historical-tab .payment-timeline');
    if (!timeline) return;
    
    const filtered = filterPayments(paymentHistory);
    
    if (filtered.length === 0) {
        timeline.innerHTML = '';
        document.querySelector('#historical-tab .empty-state').style.display = 'block';
        return;
    }
    
    document.querySelector('#historical-tab .empty-state').style.display = 'none';
    timeline.innerHTML = filtered.map(payment => createPaymentCard(payment)).join('');
    
    attachPaymentCardListeners();
}

function filterPayments(payments) {
    const userId = BillingsState.currentUser.id;
    
    return payments.filter(payment => {
        if (userId !== 'all' && payment.patientId !== userId) return false;
        return true;
    });
}

function createPaymentCard(payment) {
    const cardClass = payment.status === 'paid' ? 'paid-payment' : 
                     payment.status === 'rejected' ? 'rejected-payment' : '';
    
    const iconClass = payment.status === 'paid' ? '' : 
                     payment.status === 'rejected' ? 'rejected' : '';
    
    const statusBadge = payment.status === 'paid' ? 
        '<span class="status-badge status-paid"><i class="fas fa-check"></i>Paid</span>' :
        '<span class="status-badge status-rejected"><i class="fas fa-times"></i>Rejected</span>';
    
    const dependentBadge = payment.patientId !== 'self' ? 
        `<span class="status-badge status-dependent"><i class="fas fa-user"></i>${payment.patient.split('(')[0].trim()}</span>` : '';
    
    const title = payment.status === 'paid' ? 'Payment Confirmed' : 'Payment Rejected';
    
    const rejectionSection = payment.status === 'rejected' ? `
        <div class="rejection-reason">
            <h4 class="rejection-title">
                <i class="fas fa-info-circle"></i>
                Rejection Reason
            </h4>
            <p class="rejection-message">${payment.rejectionReason}</p>
        </div>
    ` : '';
    
    const actionButtons = payment.status === 'rejected' ? `
        <button class="card-action-btn btn-secondary">
            <i class="fas fa-file-invoice"></i>
            View Invoice
        </button>
        <button class="card-action-btn btn-primary resubmit-payment-btn" data-invoice-id="${payment.invoiceId}">
            <i class="fas fa-rotate"></i>
            Resubmit Payment Proof
        </button>
    ` : `
        <button class="card-action-btn btn-secondary">
            <i class="fas fa-download"></i>
            Download Receipt
        </button>
        <button class="card-action-btn btn-secondary">
            <i class="fas fa-file-invoice"></i>
            View Invoice
        </button>
    `;
    
    return `
        <div class="payment-card ${cardClass}">
            <div class="payment-card-header">
                <div class="payment-status-icon ${iconClass}">
                    <i class="fas ${payment.status === 'paid' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                </div>
                <div class="payment-header-info">
                    <h3 class="payment-title">${title}</h3>
                    <p class="payment-date">${Utils.formatDateTime(payment.date)}</p>
                </div>
                <div class="payment-badges">
                    ${statusBadge}
                    ${dependentBadge}
                </div>
            </div>
            
            <div class="payment-card-body">
                <div class="payment-details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Invoice Number</span>
                        <span class="detail-value">${payment.invoiceId}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Patient</span>
                        <span class="detail-value">${payment.patient}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Clinic</span>
                        <span class="detail-value">${payment.clinic}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Payment Method</span>
                        <span class="detail-value">
                            <i class="fas ${payment.method === 'M-Pesa' ? 'fa-mobile-screen' : 'fa-building-columns'}"></i>
                            ${payment.method}
                        </span>
                    </div>
                    ${payment.transactionCode ? `
                    <div class="detail-item">
                        <span class="detail-label">Transaction Code</span>
                        <span class="detail-value">${payment.transactionCode}</span>
                    </div>
                    ` : ''}
                    ${payment.service ? `
                    <div class="detail-item">
                        <span class="detail-label">Service Description</span>
                        <span class="detail-value">${payment.service}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="payment-amount-total">
                    <span class="amount-label">${payment.status === 'rejected' ? 'Attempted Amount' : 'Amount Paid'}</span>
                    <span class="amount-value">${Utils.formatCurrency(payment.amount)}</span>
                </div>
                
                ${rejectionSection}
            </div>
            
            <div class="payment-card-footer">
                ${actionButtons}
            </div>
        </div>
    `;
}

function attachPaymentCardListeners() {
    document.querySelectorAll('.resubmit-payment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const invoiceId = this.getAttribute('data-invoice-id');
            const invoice = invoiceData.find(inv => inv.id === invoiceId);
            if (invoice) {
                openPaymentProofModal(invoiceId, invoice.amount);
            }
        });
    });
}

// ===================================
// 7. PENDING REVIEW DISPLAY
// ===================================

function displayPendingReview() {
    const grid = document.querySelector('#pending-review-tab .pending-payments-grid');
    if (!grid) return;
    
    const pending = invoiceData.filter(inv => inv.status === 'pending-review');
    const filtered = filterInvoices(pending);
    
    if (filtered.length === 0) {
        grid.innerHTML = '';
        document.querySelector('#pending-review-tab .empty-state').style.display = 'block';
        return;
    }
    
    document.querySelector('#pending-review-tab .empty-state').style.display = 'none';
    grid.innerHTML = filtered.map(invoice => createPendingPaymentCard(invoice)).join('');
}

function createPendingPaymentCard(invoice) {
    return `
        <div class="payment-card pending-payment">
            <div class="payment-card-header">
                <div class="payment-status-icon pending">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="payment-header-info">
                    <h3 class="payment-title">Payment Under Review</h3>
                    <p class="payment-date">Submitted on ${Utils.formatDateTime(invoice.paymentProof.submittedDate)}</p>
                </div>
                <div class="payment-badges">
                    <span class="status-badge status-under-review">
                        <i class="fas fa-hourglass-half"></i>
                        Under Review
                    </span>
                </div>
            </div>
            
            <div class="payment-card-body">
                <div class="payment-details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Invoice Number</span>
                        <span class="detail-value">${invoice.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Patient</span>
                        <span class="detail-value">${invoice.patient}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Clinic</span>
                        <span class="detail-value">${invoice.clinic}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Payment Method</span>
                        <span class="detail-value">
                            <i class="fas fa-mobile-screen"></i>
                            ${invoice.paymentProof.method === 'mpesa' ? 'M-Pesa' : invoice.paymentProof.method}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Transaction Code</span>
                        <span class="detail-value">${invoice.paymentProof.transactionCode}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Submitted Amount</span>
                        <span class="detail-value">${Utils.formatCurrency(invoice.amount)}</span>
                    </div>
                </div>
                
                <div class="review-info">
                    <div class="review-info-item">
                        <i class="fas fa-file-image"></i>
                        <span>Payment proof uploaded</span>
                    </div>
                    <div class="review-info-item">
                        <i class="fas fa-lock"></i>
                        <span>Invoice locked during review</span>
                    </div>
                </div>
                
                <div class="review-timeline">
                    <p class="review-timeline-text">
                        <i class="fas fa-info-circle"></i>
                        Reviews typically take 1-2 business days. You'll be notified once the review is complete.
                    </p>
                </div>
            </div>
            
            <div class="payment-card-footer">
                <button class="card-action-btn btn-secondary">
                    <i class="fas fa-eye"></i>
                    View Submitted Proof
                </button>
                <button class="card-action-btn btn-secondary">
                    <i class="fas fa-file-invoice"></i>
                    View Invoice
                </button>
            </div>
        </div>
    `;
}

// ===================================
// 8. SEARCH & FILTER FUNCTIONALITY
// ===================================

function initializeSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    const searchFilterBtn = document.getElementById('searchFilterBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            BillingsState.searchFilters.invoiceNumber = this.value;
            applyFilters();
        });
    }
    
    if (searchFilterBtn) {
        searchFilterBtn.addEventListener('click', () => {
            Utils.openModal('invoiceFilterModal');
        });
    }
}

function initializeFilterModal() {
    const applyBtn = document.getElementById('applyInvoiceFilters');
    const clearBtn = document.getElementById('clearInvoiceFilters');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', applyInvoiceFilters);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearInvoiceFilters);
    }
    
    // Quick date range buttons
    document.querySelectorAll('.date-option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const range = parseInt(this.getAttribute('data-range'));
            setQuickDateRange(range);
            
            document.querySelectorAll('.date-option-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function setQuickDateRange(days) {
    const today = new Date();
    const startDate = new Date(today);
    
    if (days === 'all') {
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
    } else {
        startDate.setDate(today.getDate() - days);
        document.getElementById('filterStartDate').value = startDate.toISOString().split('T')[0];
        document.getElementById('filterEndDate').value = today.toISOString().split('T')[0];
    }
}

function applyInvoiceFilters() {
    BillingsState.searchFilters = {
        patient: document.getElementById('filterPatient')?.value || 'all',
        invoiceNumber: document.getElementById('filterInvoiceNumber')?.value || '',
        startDate: document.getElementById('filterStartDate')?.value || '',
        endDate: document.getElementById('filterEndDate')?.value || '',
        minAmount: document.getElementById('filterMinAmount')?.value || '',
        maxAmount: document.getElementById('filterMaxAmount')?.value || ''
    };
    
    const selectedClinics = [];
    document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(cb => {
        selectedClinics.push(cb.value);
    });
    BillingsState.searchFilters.clinics = selectedClinics;
    
    Utils.closeModal('invoiceFilterModal');
    applyFilters();
    Utils.showToast('Filters applied successfully', 'success');
}

function clearInvoiceFilters() {
    document.getElementById('filterPatient').value = 'all';
    document.getElementById('filterInvoiceNumber').value = '';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterMinAmount').value = '';
    document.getElementById('filterMaxAmount').value = '';
    
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
    });
    
    document.querySelectorAll('.date-option-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-range') === 'all') {
            btn.classList.add('active');
        }
    });
    
    BillingsState.searchFilters = {
        patient: 'all',
        clinics: [],
        invoiceNumber: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: ''
    };
    
    Utils.showToast('Filters cleared', 'info');
}

function applyFilters() {
    loadTabContent(BillingsState.activeTab);
}

// ===================================
// 9. PAYMENT PROOF SUBMISSION
// ===================================

function openPaymentProofModal(invoiceId, amount) {
    const invoice = invoiceData.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    BillingsState.currentInvoice = invoice;
    
    document.getElementById('proofInvoiceNumber').textContent = invoiceId;
    document.getElementById('proofAmount').textContent = Utils.formatCurrency(amount);
    document.getElementById('proofClinic').textContent = invoice.clinic;
    
    // Reset form
    document.getElementById('paymentProofForm').reset();
    document.getElementById('filePreview').style.display = 'none';
    
    Utils.openModal('paymentProofModal');
}

function initializePaymentProofForm() {
    const form = document.getElementById('paymentProofForm');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('proofUpload');
    const submitBtn = document.getElementById('submitPaymentProof');
    const removeBtn = document.getElementById('removeFileBtn');
    
    // File upload drag and drop
    if (fileUploadArea) {
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = 'var(--accent-teal)';
        });
        
        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.style.borderColor = 'var(--gray-300)';
        });
        
        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = 'var(--gray-300)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            document.getElementById('filePreview').style.display = 'none';
            document.getElementById('proofUpload').value = '';
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitPaymentProof);
    }
}

function handleFileUpload(file) {
    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        Utils.showToast('Please upload a valid image (JPG, PNG) or PDF file', 'error');
        return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        Utils.showToast('File size must be less than 5MB', 'error');
        return;
    }
    
    // Show preview
    const preview = document.getElementById('filePreview');
    const previewImage = document.getElementById('previewImage');
    const fileName = document.getElementById('fileName');
    
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'block';
        previewImage.src = '';
    }
    
    fileName.textContent = file.name;
}

function submitPaymentProof() {
    const form = document.getElementById('paymentProofForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const paymentMethod = document.getElementById('paymentMethod').value;
    const transactionCode = document.getElementById('transactionCode').value;
    const file = document.getElementById('proofUpload').files[0];
    const notes = document.getElementById('paymentNotes').value;
    
    if (!file) {
        Utils.showToast('Please upload payment proof', 'error');
        return;
    }
    
    Utils.closeModal('paymentProofModal');
    Utils.showLoading(true, 'Submitting payment proof...');
    
    // Simulate submission
    setTimeout(() => {
        Utils.showLoading(false);
        Utils.showToast('Payment proof submitted successfully!', 'success');
        
        setTimeout(() => {
            Utils.showToast('Your submission is under review. You will be notified within 1-2 business days.', 'info');
        }, 1000);
        
        // Update invoice status to pending-review
        if (BillingsState.currentInvoice) {
            const invoice = invoiceData.find(inv => inv.id === BillingsState.currentInvoice.id);
            if (invoice) {
                invoice.status = 'pending-review';
                invoice.paymentProof = {
                    method: paymentMethod,
                    transactionCode: transactionCode,
                    submittedDate: new Date().toISOString(),
                    file: file.name
                };
            }
        }
        
        // Refresh display
        setTimeout(() => {
            applyFilters();
            updatePaymentSummary();
        }, 1500);
    }, 2000);
}

// ===================================
// 10. DISPUTE INVOICE
// ===================================

function openDisputeModal(invoiceId) {
    const invoice = invoiceData.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    BillingsState.currentInvoice = invoice;
    
    document.getElementById('disputeInvoiceNumber').textContent = invoiceId;
    document.getElementById('disputeAmount').textContent = Utils.formatCurrency(invoice.amount);
    document.getElementById('disputeClinic').textContent = invoice.clinic;
    
    // Reset form
    document.getElementById('disputeForm').reset();
    
    Utils.openModal('disputeModal');
}

function initializeDisputeForm() {
    const submitBtn = document.getElementById('submitDispute');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitDispute);
    }
}

function submitDispute() {
    const form = document.getElementById('disputeForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const reason = document.getElementById('disputeReason').value;
    const message = document.getElementById('disputeMessage').value;
    
    Utils.closeModal('disputeModal');
    Utils.showLoading(true, 'Submitting dispute...');
    
    // Simulate submission
    setTimeout(() => {
        Utils.showLoading(false);
        Utils.showToast('Dispute submitted successfully', 'success');
        
        setTimeout(() => {
            Utils.showToast('The billing department will review your dispute within 3-5 business days', 'info');
        }, 1000);
    }, 1500);
}

// ===================================
// 11. QUICK ACTIONS
// ===================================

function initializeQuickActions() {
    const payAllBtn = document.getElementById('payAllBtn');
    const exportBtn = document.getElementById('exportHistoryBtn');
    const contactBtn = document.getElementById('contactBillingBtn');
    const notificationBtn = document.getElementById('notificationSettingsBtn');
    
    if (payAllBtn) {
        payAllBtn.addEventListener('click', () => {
            Utils.showToast('Pay all functionality coming soon', 'info');
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            Utils.openModal('exportHistoryModal');
        });
    }
    
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            Utils.openModal('billingMessageModal');
        });
    }
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            Utils.openModal('notificationSettingsModal');
        });
    }
}

// ===================================
// 12. NOTIFICATION SETTINGS
// ===================================

function initializeNotificationSettings() {
    const saveBtn = document.getElementById('saveNotificationSettings');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveNotificationSettings);
    }
}

function saveNotificationSettings() {
    // Collect settings
    const settings = {
        email: document.querySelector('.notification-settings-form input[type="checkbox"]:nth-of-type(1)').checked,
        sms: document.querySelector('.notification-settings-form input[type="checkbox"]:nth-of-type(2)').checked,
        whatsapp: document.querySelector('.notification-settings-form input[type="checkbox"]:nth-of-type(3)').checked,
        inApp: document.querySelector('.notification-settings-form input[type="checkbox"]:nth-of-type(4)').checked,
        familyScope: document.querySelector('input[name="familyNotifications"]:checked')?.value || 'all'
    };
    
    BillingsState.notificationSettings = settings;
    
    Utils.closeModal('notificationSettingsModal');
    Utils.showToast('Notification settings saved successfully', 'success');
}

// ===================================
// 13. EXPORT HISTORY
// ===================================

function initializeExportHistory() {
    const generateBtn = document.getElementById('generateExport');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generateExport);
    }
}

function generateExport() {
    const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'pdf';
    
    Utils.closeModal('exportHistoryModal');
    Utils.showLoading(true, 'Generating export...');
    
    setTimeout(() => {
        Utils.showLoading(false);
        Utils.showToast(`Payment history exported as ${format.toUpperCase()}`, 'success');
    }, 2000);
}

// ===================================
// 14. BILLING MESSAGES
// ===================================

function initializeBillingMessages() {
    const sendBtn = document.getElementById('sendBillingMessage');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendBillingMessage);
    }
}

function sendBillingMessage() {
    const messageInput = document.getElementById('newBillingMessage');
    const message = messageInput.value.trim();
    
    if (!message) {
        Utils.showToast('Please enter a message', 'error');
        return;
    }
    
    // Add message to thread
    const thread = document.getElementById('billingMessageThread');
    const messageHTML = `
        <div class="message-item sent">
            <div class="message-bubble">
                <p>${message}</p>
                <span class="message-time">Just now</span>
            </div>
        </div>
    `;
    
    thread.innerHTML += messageHTML;
    thread.scrollTop = thread.scrollHeight;
    
    messageInput.value = '';
    Utils.showToast('Message sent successfully', 'success');
}

// ===================================
// 15. INVOICE DOWNLOAD
// ===================================

function downloadInvoice(invoiceId) {
    Utils.showLoading(true, 'Generating invoice PDF...');
    
    setTimeout(() => {
        Utils.showLoading(false);
        Utils.showToast(`Invoice ${invoiceId} downloaded successfully`, 'success');
    }, 1500);
}

// ===================================
// 16. MODAL MANAGEMENT
// ===================================

function initializeModals() {
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

// ===================================
// 17. DARK MODE TOGGLE
// ===================================

function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            const icon = this.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                Utils.showToast('Dark mode enabled', 'info');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                Utils.showToast('Light mode enabled', 'info');
            }
        });
    }
}

// ===================================
// 18. PROFILE DROPDOWN
// ===================================

function initializeProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileMenu.style.opacity = profileMenu.style.opacity === '1' ? '0' : '1';
            profileMenu.style.visibility = profileMenu.style.visibility === 'visible' ? 'hidden' : 'visible';
        });
        
        document.addEventListener('click', function(e) {
            if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.style.opacity = '0';
                profileMenu.style.visibility = 'hidden';
            }
        });
    }
}

// ===================================
// 19. KEYBOARD SHORTCUTS
// ===================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            Utils.closeAllModals();
        }
        
        // Ctrl/Cmd + F for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('globalSearchInput')?.focus();
        }
    });
}

// ===================================
// 20. SESSION MANAGEMENT
// ===================================

function initializeSessionManagement() {
    let inactivityTimer;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
    
    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            Utils.showToast('Session expired due to inactivity', 'warning');
            setTimeout(() => {
                // Redirect to login
            }, 2000);
        }, INACTIVITY_LIMIT);
    }
    
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer();
}

// ===================================
// 21. ERROR HANDLING
// ===================================

function initializeErrorHandling() {
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        Utils.showToast('An error occurred. Please try again.', 'error');
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        Utils.showToast('An error occurred. Please try again.', 'error');
    });
}

// ===================================
// 22. ANIMATION OBSERVERS
// ===================================

function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.invoice-card, .payment-card, .quick-nav-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease-in-out';
        observer.observe(el);
    });
}

// ===================================
// 23. TAB COUNT UPDATES
// ===================================

function updateTabCounts() {
    const outstanding = invoiceData.filter(inv => 
        inv.status === 'outstanding' || inv.status === 'overdue' || inv.isNew
    ).length;
    
    const pendingReview = invoiceData.filter(inv => inv.status === 'pending-review').length;
    
    const outstandingTab = document.querySelector('[data-tab="outstanding"] .tab-count');
    const pendingTab = document.querySelector('[data-tab="pending-review"] .tab-count');
    
    if (outstandingTab) outstandingTab.textContent = outstanding;
    if (pendingTab) pendingTab.textContent = pendingReview;
}

// ===================================
// 24. INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Curis Billings & Payments initializing...');
    
    try {
        // Initialize all components
        initializeFamilySwitcher();
        initializeTabs();
        initializeSearch();
        initializeFilterModal();
        initializePaymentProofForm();
        initializeDisputeForm();
        initializeQuickActions();
        initializeNotificationSettings();
        initializeExportHistory();
        initializeBillingMessages();
        initializeModals();
        initializeDarkMode();
        initializeProfileDropdown();
        initializeKeyboardShortcuts();
        initializeSessionManagement();
        initializeErrorHandling();
        initializeAnimations();
        
        // Initial data load
        updateProfileDisplay();
        updatePaymentSummary();
        updateTabCounts();
        displayOutstandingInvoices();
        
        console.log('Curis Billings & Payments initialized successfully');
        
        setTimeout(() => {
            Utils.showToast('Welcome to Billings & Payments!', 'success');
        }, 500);
        
    } catch (error) {
        console.error('Initialization error:', error);
        Utils.showToast('Initialization error. Please refresh the page.', 'error');
    }
});

// ===================================
// 25. WINDOW RESIZE HANDLER
// ===================================

let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // Handle responsive adjustments
        if (window.innerWidth <= 768) {
            // Mobile adjustments
        }
    }, 250);
});

// ===================================
// 26. EXPORT FOR EXTERNAL ACCESS
// ===================================

window.CurisBillings = {
    Utils,
    BillingsState,
    selectFamilyMember,
    applyFilters,
    openPaymentProofModal,
    downloadInvoice
};
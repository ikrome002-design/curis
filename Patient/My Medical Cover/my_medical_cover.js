/* ===================================
   CURIS MY MEDICAL COVER - JAVASCRIPT
   Modern Healthcare Insurance Platform
   =================================== */

// ===================================
// 1. GLOBAL STATE MANAGEMENT
// ===================================

const MedicalCoverState = {
    currentUser: {
        id: 'self',
        name: 'John Kamau',
        relationship: 'Self',
        age: 45,
        avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png',
        policyInfo: {
            provider: 'AAA Insurance',
            policyNumber: '123456789',
            validUntil: 'December 31, 2025'
        }
    },
    familyMembers: [
        {
            id: 'self',
            name: 'John Kamau',
            relationship: 'Self',
            age: 45,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            policyInfo: {
                provider: 'AAA Insurance',
                policyNumber: '123456789',
                validUntil: 'December 31, 2025'
            }
        },
        {
            id: 'spouse',
            name: 'Jane Kamau',
            relationship: 'Spouse',
            age: 42,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            policyInfo: {
                provider: 'AAA Insurance',
                policyNumber: '123456789',
                validUntil: 'December 31, 2025'
            }
        },
        {
            id: 'daughter',
            name: 'Mary Kamau',
            relationship: 'Daughter',
            age: 12,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            policyInfo: {
                provider: 'Britam Health',
                policyNumber: '789012',
                validUntil: 'December 31, 2025'
            }
        },
        {
            id: 'son',
            name: 'David Kamau',
            relationship: 'Son',
            age: 8,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            policyInfo: null
        }
    ],
    claimCreation: {
        currentStep: 1,
        selectedPatient: null,
        claimType: null,
        selectedProvider: null,
        selectedInvoices: [],
        attachedDocuments: [],
        manualDocuments: []
    },
    searchFilters: {
        query: '',
        status: 'all',
        provider: 'all',
        dateRange: null
    },
    claims: [
        {
            id: 'CLM-2025-001',
            patientId: 'self',
            patientName: 'John Kamau',
            relationship: 'Self',
            provider: 'AAA Insurance',
            claimType: 'outpatient',
            amount: 12500,
            submissionDate: '2025-09-28',
            approvalDate: '2025-09-30',
            status: 'approved'
        },
        {
            id: 'CLM-2025-002',
            patientId: 'daughter',
            patientName: 'Mary Kamau',
            relationship: 'Daughter',
            provider: 'Britam Health',
            claimType: 'specialist',
            amount: 8750,
            submissionDate: '2025-10-01',
            status: 'under-review'
        },
        {
            id: 'CLM-2025-003',
            patientId: 'self',
            patientName: 'John Kamau',
            relationship: 'Self',
            provider: 'APA Insurance',
            claimType: 'lab',
            amount: 5200,
            submissionDate: '2025-10-02',
            status: 'submitted'
        },
        {
            id: 'CLM-2025-004',
            patientId: 'son',
            patientName: 'David Kamau',
            relationship: 'Son',
            provider: 'Jubilee Insurance',
            claimType: 'medication',
            amount: 3500,
            submissionDate: '2025-09-15',
            status: 'paid'
        }
    ],
    insuranceProviders: [
        {
            id: 'aaa',
            name: 'AAA Insurance',
            type: 'Health Insurance',
            email: 'claims@aaainsurance.co.ke',
            phone: '+254 20 222 2000',
            coverage: ['outpatient', 'inpatient', 'specialist', 'lab'],
            instructions: [
                'Submit claims within 30 days of service',
                'Include official invoice with clinic stamp',
                'Attach detailed medical reports',
                'Provide doctor\'s prescription for medications',
                'Processing time: 7-14 business days'
            ]
        },
        {
            id: 'britam',
            name: 'Britam Health',
            type: 'Medical Insurance',
            email: 'health.claims@britam.com',
            phone: '+254 709 940 000',
            coverage: ['outpatient', 'lab', 'medication-partial'],
            instructions: [
                'Online submission preferred via portal',
                'Include policy number on all documents',
                'Pre-authorization required for specialist visits',
                'Submit within 60 days of treatment',
                'Processing time: 5-10 business days'
            ]
        },
        {
            id: 'apa',
            name: 'APA Insurance',
            type: 'Health Cover',
            email: 'medicalclaims@apainsurance.org',
            phone: '+254 20 289 8000',
            coverage: ['outpatient', 'inpatient', 'specialist', 'lab', 'medication'],
            instructions: [
                'Submit through online portal or email',
                'All types of medical claims accepted',
                'Quick processing within 5-7 days',
                'Comprehensive coverage',
                'Direct settlement with network hospitals'
            ]
        }
    ],
    availableInvoices: [
        {
            id: 'INV-2025-001234',
            date: '2025-09-28',
            amount: 12500,
            clinic: 'Nairobi Health Center',
            doctor: 'Dr. Sarah Wanjiru',
            service: 'General Consultation & Lab Tests',
            paid: true,
            patientId: 'self'
        },
        {
            id: 'INV-2025-001456',
            date: '2025-10-01',
            amount: 8750,
            clinic: 'Westlands Medical Clinic',
            doctor: 'Dr. James Omondi',
            service: 'Pediatric Check-up & Vaccination',
            paid: true,
            patientId: 'daughter'
        }
    ]
};

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
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    formatCurrency(amount) {
        return `KES. ${amount.toLocaleString()}`;
    },

    showLoading(show = true, text = 'Processing claim...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        
        if (overlay) {
            if (show) {
                overlay.classList.add('active');
                if (loadingText) loadingText.textContent = text;
            } else {
                overlay.classList.remove('active');
            }
        }
    },

    hasMissingPolicyInfo() {
        return MedicalCoverState.familyMembers.some(member => !member.policyInfo);
    },

    getMemberById(memberId) {
        return MedicalCoverState.familyMembers.find(m => m.id === memberId);
    },

    getClaimById(claimId) {
        return MedicalCoverState.claims.find(c => c.id === claimId);
    },

    getProviderById(providerId) {
        return MedicalCoverState.insuranceProviders.find(p => p.id === providerId);
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
    const member = Utils.getMemberById(memberId);
    if (!member) return;
    
    MedicalCoverState.currentUser = member;
    
    // Update UI
    updateProfileDisplay();
    
    // Update active state in modal
    document.querySelectorAll('.family-member').forEach(el => {
        el.classList.remove('active');
    });
    const selectedElement = document.querySelector(`[data-member-id="${memberId}"]`);
    if (selectedElement) {
        selectedElement.classList.add('active');
    }
    
    // Refresh claims view
    filterAndDisplayClaims();
    
    // Update statistics
    updateClaimStatistics();
    
    Utils.closeModal('familyModal');
    Utils.showToast(`Switched to ${member.name}'s profile`, 'success');
}

function updateProfileDisplay() {
    const profileName = document.querySelector('.profile-name');
    const profileAvatar = document.querySelector('.profile-avatar');
    
    if (profileName) {
        const relationship = MedicalCoverState.currentUser.relationship === 'Self' 
            ? 'Self' 
            : `${MedicalCoverState.currentUser.relationship}`;
        profileName.textContent = `${MedicalCoverState.currentUser.name} (${relationship})`;
    }
    
    if (profileAvatar) {
        profileAvatar.src = MedicalCoverState.currentUser.avatar;
    }
}

// ===================================
// 4. COVERAGE ALERT BANNER
// ===================================

function initializeCoverageAlert() {
    const alertBanner = document.getElementById('coverageAlertBanner');
    const addPolicyBtn = document.getElementById('addPolicyInfoBtn');
    
    if (Utils.hasMissingPolicyInfo()) {
        if (alertBanner) {
            alertBanner.style.display = 'block';
        }
    }
    
    if (addPolicyBtn) {
        addPolicyBtn.addEventListener('click', () => {
            Utils.showToast('Redirecting to profile to add policy information...', 'info');
            setTimeout(() => {
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Patient\\My Profile\\my_profile.html';
            }, 1500);
        });
    }
}

// ===================================
// 5. CLAIM STATISTICS
// ===================================

function updateClaimStatistics() {
    const userClaims = MedicalCoverState.claims.filter(claim => 
        claim.patientId === MedicalCoverState.currentUser.id
    );
    
    const pendingCount = userClaims.filter(c => c.status === 'under-review' || c.status === 'submitted').length;
    const approvedCount = userClaims.filter(c => c.status === 'approved' || c.status === 'paid').length;
    const totalCount = userClaims.length;
    const totalValue = userClaims.reduce((sum, claim) => sum + claim.amount, 0);
    
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
        statCards[0].querySelector('.stat-value').textContent = pendingCount;
        statCards[1].querySelector('.stat-value').textContent = approvedCount;
        statCards[2].querySelector('.stat-value').textContent = totalCount;
        statCards[3].querySelector('.stat-value').textContent = Utils.formatCurrency(totalValue);
    }
}

// ===================================
// 6. SEARCH AND FILTER
// ===================================

function initializeSearchAndFilter() {
    const searchInput = document.getElementById('claimSearchInput');
    const statusFilter = document.getElementById('statusFilter');
    const providerFilter = document.getElementById('providerFilter');
    const advancedFilterBtn = document.getElementById('advancedFilterBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            MedicalCoverState.searchFilters.query = e.target.value.toLowerCase();
            filterAndDisplayClaims();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            MedicalCoverState.searchFilters.status = e.target.value;
            filterAndDisplayClaims();
        });
    }
    
    if (providerFilter) {
        providerFilter.addEventListener('change', (e) => {
            MedicalCoverState.searchFilters.provider = e.target.value;
            filterAndDisplayClaims();
        });
    }
    
    if (advancedFilterBtn) {
        advancedFilterBtn.addEventListener('click', () => {
            Utils.showToast('Advanced filters coming soon!', 'info');
        });
    }
}

function filterAndDisplayClaims() {
    let filteredClaims = MedicalCoverState.claims.filter(claim => {
        // Filter by current user
        const matchesUser = claim.patientId === MedicalCoverState.currentUser.id;
        if (!matchesUser) return false;
        
        // Filter by search query
        const matchesQuery = !MedicalCoverState.searchFilters.query || 
            claim.id.toLowerCase().includes(MedicalCoverState.searchFilters.query) ||
            claim.patientName.toLowerCase().includes(MedicalCoverState.searchFilters.query) ||
            claim.provider.toLowerCase().includes(MedicalCoverState.searchFilters.query);
        
        // Filter by status
        const matchesStatus = MedicalCoverState.searchFilters.status === 'all' || 
            claim.status === MedicalCoverState.searchFilters.status;
        
        // Filter by provider
        const matchesProvider = MedicalCoverState.searchFilters.provider === 'all' || 
            claim.provider.toLowerCase().includes(MedicalCoverState.searchFilters.provider);
        
        return matchesQuery && matchesStatus && matchesProvider;
    });
    
    displayClaims(filteredClaims);
}

function displayClaims(claims) {
    const tbody = document.querySelector('.claims-table tbody');
    const emptyState = document.querySelector('.empty-state');
    
    if (!tbody) return;
    
    if (claims.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    tbody.innerHTML = claims.map(claim => createClaimRow(claim)).join('');
    
    // Add event listeners
    document.querySelectorAll('.view-claim').forEach(btn => {
        btn.addEventListener('click', function() {
            const claimId = this.getAttribute('data-claim-id');
            viewClaimDetails(claimId);
        });
    });
    
    document.querySelectorAll('.download-claim').forEach(btn => {
        btn.addEventListener('click', function() {
            const claimId = this.getAttribute('data-claim-id');
            downloadClaim(claimId);
        });
    });
}

function createClaimRow(claim) {
    const statusClass = `status-${claim.status.replace('-', '-')}`;
    const typeClass = claim.claimType;
    
    const statusIcons = {
        'approved': 'fa-check-circle',
        'under-review': 'fa-clock',
        'submitted': 'fa-paper-plane',
        'paid': 'fa-money-bill-wave',
        'rejected': 'fa-times-circle'
    };
    
    const typeIcons = {
        'outpatient': 'fa-clinic-medical',
        'specialist': 'fa-user-doctor',
        'lab': 'fa-flask',
        'medication': 'fa-pills',
        'inpatient': 'fa-hospital'
    };
    
    const statusLabels = {
        'approved': 'Approved',
        'under-review': 'Under Review',
        'submitted': 'Submitted',
        'paid': 'Paid',
        'rejected': 'Rejected'
    };
    
    const typeLabels = {
        'outpatient': 'Outpatient',
        'specialist': 'Specialist',
        'lab': 'Lab/Diagnostic',
        'medication': 'Medication',
        'inpatient': 'Inpatient'
    };
    
    return `
        <tr class="claim-row">
            <td class="claim-id">${claim.id}</td>
            <td class="patient-name">
                <div class="patient-info">
                    <span class="name">${claim.patientName}</span>
                    <span class="relationship">(${claim.relationship})</span>
                </div>
            </td>
            <td class="provider-name">${claim.provider}</td>
            <td class="claim-type">
                <span class="type-badge ${typeClass}">
                    <i class="fas ${typeIcons[claim.claimType]}"></i>
                    ${typeLabels[claim.claimType]}
                </span>
            </td>
            <td class="claim-amount">${Utils.formatCurrency(claim.amount)}</td>
            <td class="submission-date">${Utils.formatDate(claim.submissionDate)}</td>
            <td class="claim-status">
                <span class="status-badge ${statusClass}">
                    <i class="fas ${statusIcons[claim.status]}"></i>
                    ${statusLabels[claim.status]}
                </span>
            </td>
            <td class="claim-actions">
                <button class="action-btn view-claim" data-claim-id="${claim.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn download-claim" data-claim-id="${claim.id}">
                    <i class="fas fa-download"></i>
                </button>
            </td>
        </tr>
    `;
}

// ===================================
// 7. CLAIM ACTIONS
// ===================================

function viewClaimDetails(claimId) {
    const claim = Utils.getClaimById(claimId);
    if (!claim) return;
    
    // Update modal content
    document.querySelector('#viewClaimModal .claim-id-value').textContent = claim.id;
    
    const statusBadge = document.querySelector('#viewClaimModal .status-badge');
    statusBadge.className = `status-badge status-${claim.status}`;
    statusBadge.innerHTML = `<i class="fas fa-check-circle"></i> ${claim.status.charAt(0).toUpperCase() + claim.status.slice(1).replace('-', ' ')}`;
    
    // Update info sections
    const infoSections = document.querySelectorAll('#viewClaimModal .info-section');
    if (infoSections.length >= 3) {
        // Patient info
        infoSections[0].querySelector('.info-details').innerHTML = `
            <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${claim.patientName} (${claim.relationship})</span>
            </div>
            <div class="info-row">
                <span class="label">Age:</span>
                <span class="value">${Utils.getMemberById(claim.patientId)?.age || 'N/A'} years</span>
            </div>
        `;
        
        // Insurance info
        const member = Utils.getMemberById(claim.patientId);
        infoSections[1].querySelector('.info-details').innerHTML = `
            <div class="info-row">
                <span class="label">Provider:</span>
                <span class="value">${claim.provider}</span>
            </div>
            <div class="info-row">
                <span class="label">Policy Number:</span>
                <span class="value">${member?.policyInfo?.policyNumber || 'N/A'}</span>
            </div>
        `;
        
        // Claim info
        infoSections[2].querySelector('.info-details').innerHTML = `
            <div class="info-row">
                <span class="label">Type:</span>
                <span class="value">${claim.claimType.charAt(0).toUpperCase() + claim.claimType.slice(1)}</span>
            </div>
            <div class="info-row">
                <span class="label">Amount:</span>
                <span class="value">${Utils.formatCurrency(claim.amount)}</span>
            </div>
            <div class="info-row">
                <span class="label">Submitted:</span>
                <span class="value">${Utils.formatDate(claim.submissionDate)}</span>
            </div>
            ${claim.approvalDate ? `
            <div class="info-row">
                <span class="label">Approved:</span>
                <span class="value">${Utils.formatDate(claim.approvalDate)}</span>
            </div>
            ` : ''}
        `;
    }
    
    Utils.openModal('viewClaimModal');
}

function downloadClaim(claimId) {
    Utils.showLoading(true, 'Generating claim document...');
    
    setTimeout(() => {
        Utils.showLoading(false);
        Utils.showToast(`Claim ${claimId} downloaded successfully`, 'success');
    }, 2000);
}

// ===================================
// 8. CREATE CLAIM - STEP 1
// ===================================

function initializeCreateClaim() {
    const newClaimBtn = document.getElementById('newClaimBtn');
    const createFirstClaimBtn = document.getElementById('createFirstClaimBtn');
    
    [newClaimBtn, createFirstClaimBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                resetClaimCreation();
                Utils.openModal('createClaimModal');
            });
        }
    });
    
    // Step 1 - Patient and Type Selection
    const step1Next = document.getElementById('claimStep1Next');
    if (step1Next) {
        step1Next.addEventListener('click', validateAndProceedStep1);
    }
    
    // Claim type card selection
    document.querySelectorAll('.claim-type-card').forEach(card => {
        card.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });
}

function resetClaimCreation() {
    MedicalCoverState.claimCreation = {
        currentStep: 1,
        selectedPatient: null,
        claimType: null,
        selectedProvider: null,
        selectedInvoices: [],
        attachedDocuments: [],
        manualDocuments: []
    };
    
    // Reset form
    const form = document.getElementById('claimFormStep1');
    if (form) form.reset();
}

function validateAndProceedStep1() {
    const patientSelect = document.getElementById('claimPatient');
    const claimTypeRadio = document.querySelector('input[name="claimType"]:checked');
    
    if (!patientSelect?.value) {
        Utils.showToast('Please select a patient', 'error');
        return;
    }
    
    if (!claimTypeRadio) {
        Utils.showToast('Please select a claim type', 'error');
        return;
    }
    
    MedicalCoverState.claimCreation.selectedPatient = patientSelect.value;
    MedicalCoverState.claimCreation.claimType = claimTypeRadio.value;
    
    // Check if selected patient has policy info
    const member = Utils.getMemberById(patientSelect.value);
    if (!member?.policyInfo) {
        Utils.showToast('Selected patient does not have policy information. Please add it first.', 'warning');
        setTimeout(() => {
            Utils.openModal('unpaidInvoiceModal');
        }, 1000);
        return;
    }
    
    Utils.closeModal('createClaimModal');
    Utils.openModal('claimProviderModal');
}

// ===================================
// 9. CREATE CLAIM - STEP 2
// ===================================

function initializeClaimStep2() {
    const step2Next = document.getElementById('claimStep2Next');
    const step2Back = document.getElementById('claimStep2Back');
    
    if (step2Next) {
        step2Next.addEventListener('click', validateAndProceedStep2);
    }
    
    if (step2Back) {
        step2Back.addEventListener('click', () => {
            Utils.closeModal('claimProviderModal');
            Utils.openModal('createClaimModal');
        });
    }
    
    // Provider card selection
    document.querySelectorAll('.provider-card').forEach(card => {
        card.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                showPolicyAutofill(radio.value);
            }
        });
    });
    
    // Provider radio change
    document.querySelectorAll('input[name="insuranceProvider"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                showPolicyAutofill(this.value);
            }
        });
    });
}

function showPolicyAutofill(providerId) {
    const autofillSection = document.getElementById('policyAutofillSection');
    if (!autofillSection) return;
    
    const member = Utils.getMemberById(MedicalCoverState.claimCreation.selectedPatient);
    if (member?.policyInfo) {
        autofillSection.style.display = 'block';
        document.getElementById('policyNumber').textContent = member.policyInfo.policyNumber;
        document.getElementById('policyHolder').textContent = member.name;
        document.getElementById('policyValidity').textContent = member.policyInfo.validUntil;
    }
}

function validateAndProceedStep2() {
    const providerRadio = document.querySelector('input[name="insuranceProvider"]:checked');
    
    if (!providerRadio) {
        Utils.showToast('Please select an insurance provider', 'error');
        return;
    }
    
    MedicalCoverState.claimCreation.selectedProvider = providerRadio.value;
    
    // Load available invoices for selected patient
    loadInvoicesForPatient();
    
    Utils.closeModal('claimProviderModal');
    Utils.openModal('claimInvoiceModal');
}

// ===================================
// 10. CREATE CLAIM - STEP 3
// ===================================

function initializeClaimStep3() {
    const step3Next = document.getElementById('claimStep3Next');
    const step3Back = document.getElementById('claimStep3Back');
    
    if (step3Next) {
        step3Next.addEventListener('click', validateAndProceedStep3);
    }
    
    if (step3Back) {
        step3Back.addEventListener('click', () => {
            Utils.closeModal('claimInvoiceModal');
            Utils.openModal('claimProviderModal');
        });
    }
    
    // Invoice filters
    const dateFilter = document.getElementById('invoiceDateFilter');
    const clinicFilter = document.getElementById('invoiceClinicFilter');
    
    if (dateFilter) {
        dateFilter.addEventListener('change', filterInvoices);
    }
    
    if (clinicFilter) {
        clinicFilter.addEventListener('change', filterInvoices);
    }
}

function loadInvoicesForPatient() {
    const patientInvoices = MedicalCoverState.availableInvoices.filter(
        inv => inv.patientId === MedicalCoverState.claimCreation.selectedPatient && inv.paid
    );
    
    displayInvoiceSelection(patientInvoices);
}

function displayInvoiceSelection(invoices) {
    const checklist = document.querySelector('.invoices-checklist');
    if (!checklist) return;
    
    checklist.innerHTML = invoices.map(invoice => `
        <div class="invoice-checkbox-item">
            <div class="checkbox-wrapper">
                <input type="checkbox" id="invoice${invoice.id}" value="${invoice.id}" class="invoice-checkbox">
                <label for="invoice${invoice.id}"></label>
            </div>
            <div class="invoice-item-details">
                <div class="invoice-header">
                    <span class="invoice-number">${invoice.id}</span>
                    <span class="invoice-date">${Utils.formatDate(invoice.date)}</span>
                    <span class="invoice-amount">${Utils.formatCurrency(invoice.amount)}</span>
                </div>
                <div class="invoice-info">
                    <div class="info-item">
                        <i class="fas fa-hospital"></i>
                        <span>${invoice.clinic}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-user-doctor"></i>
                        <span>${invoice.doctor}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-notes-medical"></i>
                        <span>${invoice.service}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.invoice-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateInvoiceSelection);
    });
}

function updateInvoiceSelection() {
    const selectedCheckboxes = document.querySelectorAll('.invoice-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);
    
    MedicalCoverState.claimCreation.selectedInvoices = selectedIds;
    
    // Calculate totals
    const selectedInvoices = MedicalCoverState.availableInvoices.filter(
        inv => selectedIds.includes(inv.id)
    );
    
    const totalAmount = selectedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    document.getElementById('selectedInvoiceCount').textContent = selectedIds.length;
    document.getElementById('totalClaimAmount').textContent = Utils.formatCurrency(totalAmount);
}

function filterInvoices() {
    // Implement invoice filtering logic
    loadInvoicesForPatient();
}

function validateAndProceedStep3() {
    if (MedicalCoverState.claimCreation.selectedInvoices.length === 0) {
        Utils.showToast('Please select at least one invoice', 'error');
        return;
    }
    
    // Auto-attach medical documents
    autoAttachDocuments();
    
    // Update summary
    updateClaimSummary();
    
    Utils.closeModal('claimInvoiceModal');
    Utils.openModal('claimDocumentModal');
}

// ===================================
// 11. CREATE CLAIM - STEP 4
// ===================================

function initializeClaimStep4() {
    const step4Back = document.getElementById('claimStep4Back');
    const submitBtn = document.getElementById('submitClaimBtn');
    const uploadArea = document.getElementById('manualUploadArea');
    const fileInput = document.getElementById('manualFileUpload');
    
    if (step4Back) {
        step4Back.addEventListener('click', () => {
            Utils.closeModal('claimDocumentModal');
            Utils.openModal('claimInvoiceModal');
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitClaim);
    }
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', handleManualFileUpload);
    }
    
    // Document action buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.preview-doc')) {
            Utils.showToast('Document preview coming soon', 'info');
        }
        
        if (e.target.closest('.remove-doc')) {
            e.target.closest('.document-item')?.remove();
            updateDocumentCount();
        }
    });
}

function autoAttachDocuments() {
    // Simulate auto-attaching documents from medical records
    MedicalCoverState.claimCreation.attachedDocuments = [
        {
            name: `Official Invoice - ${MedicalCoverState.claimCreation.selectedInvoices[0]}`,
            type: 'invoice',
            icon: 'fa-file-invoice'
        },
        {
            name: 'Consultation Summary',
            type: 'consultation',
            icon: 'fa-file-medical'
        },
        {
            name: 'Lab Results - Lipid Profile',
            type: 'lab',
            icon: 'fa-flask'
        },
        {
            name: 'Doctor\'s Clinical Notes',
            type: 'notes',
            icon: 'fa-notes-medical'
        },
        {
            name: 'Provider Credentials',
            type: 'credentials',
            icon: 'fa-certificate'
        }
    ];
}

function handleManualFileUpload(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        MedicalCoverState.claimCreation.manualDocuments.push({
            name: file.name,
            type: 'manual',
            size: file.size,
            file: file
        });
    });
    
    Utils.showToast(`${files.length} file(s) uploaded successfully`, 'success');
    updateDocumentCount();
}

function updateDocumentCount() {
    const autoCount = document.querySelectorAll('.attached-docs-list .document-item').length;
    const manualCount = MedicalCoverState.claimCreation.manualDocuments.length;
    const totalCount = autoCount + manualCount;
    
    document.getElementById('summaryDocCount').textContent = `${totalCount} files`;
}

function updateClaimSummary() {
    const member = Utils.getMemberById(MedicalCoverState.claimCreation.selectedPatient);
    const provider = Utils.getProviderById(MedicalCoverState.claimCreation.selectedProvider);
    
    const selectedInvoices = MedicalCoverState.availableInvoices.filter(
        inv => MedicalCoverState.claimCreation.selectedInvoices.includes(inv.id)
    );
    const totalAmount = selectedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    document.getElementById('summaryPatient').textContent = `${member?.name} (${member?.relationship})`;
    document.getElementById('summaryClaimType').textContent = MedicalCoverState.claimCreation.claimType.charAt(0).toUpperCase() + MedicalCoverState.claimCreation.claimType.slice(1);
    document.getElementById('summaryProvider').textContent = provider?.name || '';
    document.getElementById('summaryAmount').textContent = Utils.formatCurrency(totalAmount);
    updateDocumentCount();
}

function submitClaim() {
    Utils.closeModal('claimDocumentModal');
    Utils.showLoading(true, 'Submitting your claim...');
    
    setTimeout(() => {
        const newClaimId = `CLM-2025-${String(MedicalCoverState.claims.length + 1).padStart(3, '0')}`;
        
        const member = Utils.getMemberById(MedicalCoverState.claimCreation.selectedPatient);
        const selectedInvoices = MedicalCoverState.availableInvoices.filter(
            inv => MedicalCoverState.claimCreation.selectedInvoices.includes(inv.id)
        );
        const totalAmount = selectedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const provider = Utils.getProviderById(MedicalCoverState.claimCreation.selectedProvider);
        
        const newClaim = {
            id: newClaimId,
            patientId: MedicalCoverState.claimCreation.selectedPatient,
            patientName: member.name,
            relationship: member.relationship,
            provider: provider.name,
            claimType: MedicalCoverState.claimCreation.claimType,
            amount: totalAmount,
            submissionDate: new Date().toISOString().split('T')[0],
            status: 'submitted'
        };
        
        MedicalCoverState.claims.unshift(newClaim);
        
        Utils.showLoading(false);
        Utils.showToast(`Claim ${newClaimId} submitted successfully!`, 'success');
        
        setTimeout(() => {
            Utils.showToast('Confirmation sent via Email and SMS', 'info');
        }, 1000);
        
        // Refresh display
        filterAndDisplayClaims();
        updateClaimStatistics();
        
        // Reset form
        resetClaimCreation();
    }, 2500);
}

// ===================================
// 12. INSURANCE PROVIDERS DIRECTORY
// ===================================

function initializeProvidersDirectory() {
    const viewProvidersBtn = document.getElementById('viewProvidersBtn');
    const providersBtn = document.getElementById('insuranceProvidersBtn');
    
    [viewProvidersBtn, providersBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                Utils.openModal('providersDirectoryModal');
            });
        }
    });
}

// ===================================
// 13. QUICK ACTIONS
// ===================================

function initializeQuickActions() {
    const trackClaimsBtn = document.getElementById('trackClaimsBtn');
    const claimGuideBtn = document.getElementById('claimGuideBtn');
    
    if (trackClaimsBtn) {
        trackClaimsBtn.addEventListener('click', () => {
            document.querySelector('.claims-search-section')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    if (claimGuideBtn) {
        claimGuideBtn.addEventListener('click', () => {
            Utils.showToast('Opening claim submission guide...', 'info');
        });
    }
}

// ===================================
// 14. UNPAID INVOICE HANDLING
// ===================================

function initializeUnpaidInvoiceModal() {
    const goToPaymentBtn = document.getElementById('goToPaymentBtn');
    
    if (goToPaymentBtn) {
        goToPaymentBtn.addEventListener('click', () => {
            Utils.showToast('Redirecting to Billing & Payments...', 'info');
            setTimeout(() => {
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Patient\\Billings and Payments\\billings_and_payments.html';
            }, 1000);
        });
    }
}

// ===================================
// 15. MODAL MANAGEMENT
// ===================================

function initializeModals() {
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Prevent modal content clicks from closing modal
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

// ===================================
// 16. DARK MODE TOGGLE
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
// 17. PROFILE DROPDOWN
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
// 18. KEYBOARD SHORTCUTS
// ===================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            Utils.closeAllModals();
        }
        
        // Ctrl/Cmd + N for new claim
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            document.getElementById('newClaimBtn')?.click();
        }
    });
}

// ===================================
// 19. SESSION MANAGEMENT
// ===================================

function initializeSessionManagement() {
    let inactivityTimer;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
    
    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            Utils.showToast('Session expired due to inactivity', 'warning');
            setTimeout(() => {
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Patient\\Landing Page\\landing_page.html';
            }, 2000);
        }, INACTIVITY_LIMIT);
    }
    
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer();
}

// ===================================
// 20. ERROR HANDLING
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
// 21. ANIMATION OBSERVERS
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
    
    document.querySelectorAll('.stat-card, .help-card, .provider-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease-in-out';
        observer.observe(el);
    });
}

// ===================================
// 22. INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Curis My Medical Cover initializing...');
    
    try {
        // Initialize all components
        initializeFamilySwitcher();
        initializeCoverageAlert();
        updateClaimStatistics();
        initializeSearchAndFilter();
        filterAndDisplayClaims();
        initializeCreateClaim();
        initializeClaimStep2();
        initializeClaimStep3();
        initializeClaimStep4();
        initializeProvidersDirectory();
        initializeQuickActions();
        initializeUnpaidInvoiceModal();
        initializeModals();
        initializeDarkMode();
        initializeProfileDropdown();
        initializeKeyboardShortcuts();
        initializeSessionManagement();
        initializeErrorHandling();
        initializeAnimations();
        
        console.log('Curis My Medical Cover initialized successfully');
        
        setTimeout(() => {
            Utils.showToast('Welcome to My Medical Cover!', 'success');
        }, 500);
        
    } catch (error) {
        console.error('Initialization error:', error);
        Utils.showToast('Initialization error. Please refresh the page.', 'error');
    }
});

// ===================================
// 23. WINDOW RESIZE HANDLER
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
// 24. EXPORT FOR EXTERNAL ACCESS
// ===================================

window.CurisMedicalCover = {
    Utils,
    MedicalCoverState,
    selectFamilyMember,
    filterAndDisplayClaims,
    viewClaimDetails
};
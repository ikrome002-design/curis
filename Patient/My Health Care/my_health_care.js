/* ===================================
   CURIS MY HEALTH CARE - JAVASCRIPT
   Modern Healthcare Platform
   =================================== */

// ===================================
// 1. GLOBAL STATE MANAGEMENT
// ===================================

const HealthCareState = {
    currentUser: {
        id: 'self',
        name: 'John Kamau',
        relationship: 'Self',
        age: 45,
        avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png'
    },
    familyMembers: [
        {
            id: 'self',
            name: 'John Kamau',
            relationship: 'Self',
            age: 45,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            hasPrivateRecords: false
        },
        {
            id: 'spouse',
            name: 'Jane Kamau',
            relationship: 'Spouse',
            age: 42,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            hasPrivateRecords: false
        },
        {
            id: 'daughter',
            name: 'Mary Kamau',
            relationship: 'Daughter',
            age: 12,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            hasPrivateRecords: true
        },
        {
            id: 'son',
            name: 'David Kamau',
            relationship: 'Son',
            age: 8,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            hasPrivateRecords: false
        }
    ],
    activeTab: 'medical-records',
    activeSubTab: 'visit-history',
    activePrescriptionTab: 'current',
    searchQuery: '',
    filters: {
        clinics: [],
        dateRange: { start: null, end: null },
        serviceType: 'all',
        doctor: 'all',
        recordType: ['visits', 'labs', 'prescriptions', 'notes'],
        providers: []
    },
    expandedClinics: [],
    expandedSummaries: [],
    expandedClinicalNotes: []
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
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    showLoading(show = true) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.add('active');
            } else {
                loadingOverlay.classList.remove('active');
            }
        }
    },

    isMinor(age) {
        return age < 18;
    },

    requiresConsent(age) {
        return age >= 13 && age < 18;
    },

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// ===================================
// 3. FAMILY MEMBER SWITCHING
// ===================================

function initializeFamilySwitcher() {
    const profileSelector = document.getElementById('profileSelector');
    const avatarItems = document.querySelectorAll('.avatar-item');
    const familyMembers = document.querySelectorAll('.family-member');
    
    // Profile selector click
    if (profileSelector) {
        profileSelector.addEventListener('click', () => {
            Utils.openModal('familyModal');
        });
    }
    
    // Avatar bar switching
    avatarItems.forEach(item => {
        item.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member-id');
            switchFamilyMember(memberId);
        });
    });
    
    // Modal family member selection
    familyMembers.forEach(member => {
        member.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member-id');
            switchFamilyMember(memberId);
            Utils.closeModal('familyModal');
        });
    });
}

function switchFamilyMember(memberId) {
    const member = HealthCareState.familyMembers.find(m => m.id === memberId);
    if (!member) return;
    
    // Check privacy consent for teens
    if (Utils.requiresConsent(member.age)) {
        showPrivacyConsent(member);
        return;
    }
    
    // Update state
    HealthCareState.currentUser = member;
    
    // Update UI
    updateProfileDisplay();
    updateAvatarBar();
    updateModalSelection(memberId);
    
    // Refresh health records
    Utils.showLoading(true);
    setTimeout(() => {
        refreshHealthRecords();
        Utils.showLoading(false);
        Utils.showToast(`Switched to ${member.name}'s health records`, 'success');
    }, 800);
}

function updateProfileDisplay() {
    const profileName = document.querySelector('.profile-name');
    const profileAvatar = document.querySelector('.profile-avatar');
    
    if (profileName) {
        const relationship = HealthCareState.currentUser.relationship === 'Self' 
            ? 'Self' 
            : `${HealthCareState.currentUser.relationship}`;
        profileName.textContent = `${HealthCareState.currentUser.name} (${relationship})`;
    }
    
    if (profileAvatar) {
        profileAvatar.src = HealthCareState.currentUser.avatar;
    }
}

function updateAvatarBar() {
    document.querySelectorAll('.avatar-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-member-id') === HealthCareState.currentUser.id) {
            item.classList.add('active');
        }
    });
}

function updateModalSelection(memberId) {
    document.querySelectorAll('.family-member').forEach(member => {
        member.classList.remove('active');
        if (member.getAttribute('data-member-id') === memberId) {
            member.classList.add('active');
        }
    });
}

function showPrivacyConsent(member) {
    const modal = document.getElementById('privacyConsentModal');
    const dependentName = document.getElementById('dependentName');
    const acknowledgeConsent = document.getElementById('acknowledgeConsent');
    const proceedBtn = document.getElementById('proceedWithAccess');
    
    if (dependentName) {
        dependentName.textContent = member.name;
    }
    
    if (acknowledgeConsent) {
        acknowledgeConsent.checked = false;
        acknowledgeConsent.addEventListener('change', function() {
            if (proceedBtn) {
                proceedBtn.disabled = !this.checked;
            }
        });
    }
    
    if (proceedBtn) {
        proceedBtn.onclick = () => {
            Utils.closeModal('privacyConsentModal');
            HealthCareState.currentUser = member;
            updateProfileDisplay();
            updateAvatarBar();
            refreshHealthRecords();
            Utils.showToast(`Accessing ${member.name}'s records`, 'info');
        };
    }
    
    Utils.openModal('privacyConsentModal');
}

function refreshHealthRecords() {
    // Simulate data refresh
    Utils.scrollToTop();
    // In production, this would fetch new data from the backend
}

// ===================================
// 4. TAB MANAGEMENT
// ===================================

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    const prescriptionTabButtons = document.querySelectorAll('.prescription-tab-btn');
    
    // Main tabs
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchMainTab(tabName);
        });
    });
    
    // Sub-tabs
    subTabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const subTabName = this.getAttribute('data-subtab');
            switchSubTab(subTabName);
        });
    });
    
    // Prescription tabs
    prescriptionTabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const prescriptionTab = this.getAttribute('data-prescription-tab');
            switchPrescriptionTab(prescriptionTab);
        });
    });
}

function switchMainTab(tabName) {
    HealthCareState.activeTab = tabName;
    
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
    
    Utils.scrollToTop();
}

function switchSubTab(subTabName) {
    HealthCareState.activeSubTab = subTabName;
    
    // Update buttons
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-subtab') === subTabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.sub-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${subTabName}-content`)?.classList.add('active');
}

function switchPrescriptionTab(tabName) {
    HealthCareState.activePrescriptionTab = tabName;
    
    // Update buttons
    document.querySelectorAll('.prescription-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-prescription-tab') === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.prescription-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-medications`)?.classList.add('active');
}

// ===================================
// 5. SEARCH AND FILTERING
// ===================================

function initializeSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    const searchFilterBtn = document.getElementById('searchFilterBtn');
    const applySearchFilters = document.getElementById('applySearchFilters');
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                HealthCareState.searchQuery = this.value;
                performSearch();
            }, 500);
        });
    }
    
    if (searchFilterBtn) {
        searchFilterBtn.addEventListener('click', () => {
            Utils.openModal('searchFilterModal');
        });
    }
    
    if (applySearchFilters) {
        applySearchFilters.addEventListener('click', applySearchFilterSettings);
    }
}

function performSearch() {
    const query = HealthCareState.searchQuery.toLowerCase();
    
    if (!query) {
        // Show all records
        document.querySelectorAll('.visit-card, .lab-result-card, .medication-card, .doctor-note-card').forEach(card => {
            card.style.display = '';
        });
        return;
    }
    
    Utils.showLoading(true);
    
    setTimeout(() => {
        // Search logic
        document.querySelectorAll('.visit-card, .lab-result-card, .medication-card, .doctor-note-card').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? '' : 'none';
        });
        
        Utils.showLoading(false);
        Utils.showToast(`Search completed for "${HealthCareState.searchQuery}"`, 'info');
    }, 300);
}

function applySearchFilterSettings() {
    // Get filter values
    const recordTypes = Array.from(document.querySelectorAll('#searchFilterForm input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    const dateRange = document.getElementById('searchDateRange')?.value;
    const provider = document.getElementById('searchProvider')?.value;
    
    HealthCareState.filters.recordType = recordTypes;
    
    Utils.closeModal('searchFilterModal');
    Utils.showToast('Search filters applied', 'success');
    
    // Apply filters
    performSearch();
}

// ===================================
// 6. VISIT FILTERING
// ===================================

function initializeVisitFilters() {
    const filterBtn = document.getElementById('visitFilterBtn');
    const applyFilters = document.getElementById('applyFilters');
    const clearFilters = document.getElementById('clearFilters');
    
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            Utils.openModal('visitFilterModal');
        });
    }
    
    if (applyFilters) {
        applyFilters.addEventListener('click', applyVisitFilters);
    }
    
    if (clearFilters) {
        clearFilters.addEventListener('click', clearVisitFilters);
    }
}

function applyVisitFilters() {
    const clinics = Array.from(document.querySelectorAll('#filterClinic option:checked')).map(opt => opt.value);
    const startDate = document.getElementById('filterStartDate')?.value;
    const endDate = document.getElementById('filterEndDate')?.value;
    const serviceType = document.getElementById('filterServiceType')?.value;
    const doctor = document.getElementById('filterDoctor')?.value;
    
    HealthCareState.filters.clinics = clinics;
    HealthCareState.filters.dateRange = { start: startDate, end: endDate };
    HealthCareState.filters.serviceType = serviceType;
    HealthCareState.filters.doctor = doctor;
    
    Utils.closeModal('visitFilterModal');
    Utils.showLoading(true);
    
    setTimeout(() => {
        filterVisitCards();
        Utils.showLoading(false);
        Utils.showToast('Filters applied successfully', 'success');
    }, 500);
}

function filterVisitCards() {
    // Filter logic would go here
    // For now, just show all cards
    document.querySelectorAll('.visit-card').forEach(card => {
        card.style.display = '';
    });
}

function clearVisitFilters() {
    // Reset form
    document.getElementById('filterClinic').selectedIndex = 0;
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterServiceType').selectedIndex = 0;
    document.getElementById('filterDoctor').selectedIndex = 0;
    
    // Reset state
    HealthCareState.filters = {
        clinics: [],
        dateRange: { start: null, end: null },
        serviceType: 'all',
        doctor: 'all'
    };
    
    Utils.showToast('Filters cleared', 'info');
    filterVisitCards();
}

// ===================================
// 7. CLINIC GROUPS EXPANSION
// ===================================

function initializeClinicGroups() {
    const expandButtons = document.querySelectorAll('.expand-clinic-btn');
    
    expandButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const clinicId = this.getAttribute('data-clinic');
            toggleClinicGroup(clinicId, this);
        });
    });
}

function toggleClinicGroup(clinicId, button) {
    const content = document.querySelector(`[data-clinic-content="${clinicId}"]`);
    
    if (!content) return;
    
    const isExpanded = content.classList.contains('expanded');
    
    if (isExpanded) {
        content.classList.remove('expanded');
        button.querySelector('i').style.transform = 'rotate(0deg)';
        HealthCareState.expandedClinics = HealthCareState.expandedClinics.filter(id => id !== clinicId);
    } else {
        content.classList.add('expanded');
        button.querySelector('i').style.transform = 'rotate(180deg)';
        HealthCareState.expandedClinics.push(clinicId);
    }
}

// ===================================
// 8. DOCTOR INFORMATION
// ===================================

function initializeDoctorBadges() {
    const doctorBadges = document.querySelectorAll('.doctor-badge');
    
    doctorBadges.forEach(badge => {
        badge.addEventListener('click', function() {
            const doctorId = this.getAttribute('data-doctor-id');
            showDoctorInfo(doctorId);
        });
    });
}

function showDoctorInfo(doctorId) {
    // Simulate doctor data
    const doctorData = {
        wanjiru: {
            name: 'Dr. Sarah Wanjiru',
            specialty: 'Cardiologist',
            clinic: 'Nairobi Health Center',
            education: 'MD, University of Nairobi',
            license: 'KE-MD-12345'
        },
        omondi: {
            name: 'Dr. James Omondi',
            specialty: 'Pediatrician',
            clinic: 'Westlands Medical Clinic',
            education: 'MD, Aga Khan University',
            license: 'KE-MD-23456'
        },
        njeri: {
            name: 'Dr. Emily Njeri',
            specialty: 'Emergency Medicine Physician',
            clinic: 'Karen Hospital',
            education: 'MD, Moi University',
            license: 'KE-MD-34567'
        }
    };
    
    const doctor = doctorData[doctorId];
    if (!doctor) return;
    
    // Update modal
    document.getElementById('doctorModalName').textContent = doctor.name;
    document.getElementById('doctorModalSpecialty').textContent = doctor.specialty;
    document.getElementById('doctorModalClinic').textContent = doctor.clinic;
    document.getElementById('doctorModalEducation').textContent = doctor.education;
    document.getElementById('doctorModalLicense').textContent = doctor.license;
    
    Utils.openModal('doctorInfoModal');
}

// ===================================
// 9. CLINICAL NOTES TOGGLE
// ===================================

function initializeClinicalNotes() {
    const toggleButtons = document.querySelectorAll('.clinical-notes-toggle');
    
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const notesId = this.getAttribute('data-notes');
            toggleClinicalNotes(notesId, this);
        });
    });
}

function toggleClinicalNotes(notesId, button) {
    const content = document.getElementById(`${notesId}-notes`);
    
    if (!content) return;
    
    const isExpanded = content.classList.contains('expanded');
    
    if (isExpanded) {
        content.classList.remove('expanded');
        button.classList.remove('expanded');
        HealthCareState.expandedClinicalNotes = HealthCareState.expandedClinicalNotes.filter(id => id !== notesId);
    } else {
        content.classList.add('expanded');
        button.classList.add('expanded');
        HealthCareState.expandedClinicalNotes.push(notesId);
    }
}

// ===================================
// 10. DOCTOR NOTE SUMMARIES
// ===================================

function initializeSummaryExpansion() {
    const expandButtons = document.querySelectorAll('.expand-summary-btn');
    
    expandButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const summaryId = this.getAttribute('data-summary');
            toggleSummary(summaryId, this);
        });
    });
}

function toggleSummary(summaryId, button) {
    const content = document.getElementById(`${summaryId}-content`);
    
    if (!content) return;
    
    const isExpanded = content.classList.contains('expanded');
    
    if (isExpanded) {
        content.classList.remove('expanded');
        button.classList.remove('expanded');
        button.querySelector('span').textContent = 'View Complete Summary';
        HealthCareState.expandedSummaries = HealthCareState.expandedSummaries.filter(id => id !== summaryId);
    } else {
        content.classList.add('expanded');
        button.classList.add('expanded');
        button.querySelector('span').textContent = 'Hide Summary';
        HealthCareState.expandedSummaries.push(summaryId);
    }
}

// ===================================
// 11. FILE MANAGEMENT
// ===================================

function initializeFileHandlers() {
    const fileItems = document.querySelectorAll('.file-item');
    const downloadAllButtons = document.querySelectorAll('.download-all-btn');
    
    fileItems.forEach(item => {
        item.addEventListener('click', function() {
            const fileType = this.getAttribute('data-file-type');
            const fileName = this.querySelector('.file-name').textContent;
            handleFileClick(fileName, fileType);
        });
    });
    
    downloadAllButtons.forEach(btn => {
        btn.addEventListener('click', downloadAllFiles);
    });
}

function handleFileClick(fileName, fileType) {
    if (fileType === 'pdf') {
        viewPDF(fileName);
    } else {
        downloadFile(fileName);
    }
}

function viewPDF(fileName) {
    const pdfTitle = document.getElementById('pdfTitle');
    const pdfFrame = document.getElementById('pdfFrame');
    
    if (pdfTitle) {
        pdfTitle.textContent = fileName;
    }
    
    // In production, this would load the actual PDF
    if (pdfFrame) {
        pdfFrame.src = 'about:blank'; // Placeholder
    }
    
    Utils.openModal('pdfViewerModal');
}

function downloadFile(fileName) {
    Utils.showToast(`Downloading ${fileName}...`, 'info');
    
    // Simulate download
    setTimeout(() => {
        Utils.showToast(`${fileName} downloaded successfully`, 'success');
    }, 1500);
}

function downloadAllFiles() {
    Utils.showToast('Preparing files for download...', 'info');
    
    setTimeout(() => {
        Utils.showToast('All files downloaded successfully', 'success');
    }, 2000);
}

// ===================================
// 12. QUICK ACTIONS
// ===================================

function initializeQuickActions() {
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const printSummaryBtn = document.getElementById('printSummaryBtn');
    const shareWithDoctorBtn = document.getElementById('shareWithDoctorBtn');
    const exportHealthSummaryBtn = document.getElementById('exportHealthSummaryBtn');
    const exportPrescriptionsBtn = document.getElementById('exportPrescriptionsBtn');
    
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', downloadAllRecords);
    }
    
    if (printSummaryBtn) {
        printSummaryBtn.addEventListener('click', printHealthSummary);
    }
    
    if (shareWithDoctorBtn) {
        shareWithDoctorBtn.addEventListener('click', shareWithDoctor);
    }
    
    if (exportHealthSummaryBtn) {
        exportHealthSummaryBtn.addEventListener('click', () => {
            Utils.openModal('exportHealthSummaryModal');
        });
    }
    
    if (exportPrescriptionsBtn) {
        exportPrescriptionsBtn.addEventListener('click', () => {
            Utils.openModal('exportPrescriptionsModal');
        });
    }
}

function downloadAllRecords() {
    Utils.showLoading(true);
    Utils.showToast('Preparing all health records for download...', 'info');
    
    setTimeout(() => {
        Utils.showLoading(false);
        Utils.showToast('All health records downloaded successfully', 'success');
    }, 2500);
}

function printHealthSummary() {
    Utils.showToast('Preparing print preview...', 'info');
    
    setTimeout(() => {
        window.print();
    }, 500);
}

function shareWithDoctor() {
    Utils.showToast('Opening share options...', 'info');
    
    setTimeout(() => {
        Utils.showToast('Feature coming soon - Share directly with your healthcare provider', 'info');
    }, 1000);
}

// ===================================
// 13. EXPORT FUNCTIONALITY
// ===================================

function initializeExport() {
    const generateExport = document.getElementById('generateExport');
    const generatePrescriptionExport = document.getElementById('generatePrescriptionExport');
    const dateOptionButtons = document.querySelectorAll('.date-option-btn');
    const providerRadios = document.querySelectorAll('input[name="providers"]');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const printPdfBtn = document.getElementById('printPdfBtn');
    
    if (generateExport) {
        generateExport.addEventListener('click', generateHealthSummary);
    }
    
    if (generatePrescriptionExport) {
        generatePrescriptionExport.addEventListener('click', generatePrescriptionList);
    }
    
    dateOptionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.date-option-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    providerRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const specificProviders = document.getElementById('specificProviders');
            if (specificProviders) {
                specificProviders.style.display = this.value === 'specific' ? 'block' : 'none';
            }
        });
    });
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            Utils.showToast('Downloading PDF...', 'info');
            setTimeout(() => {
                Utils.showToast('PDF downloaded successfully', 'success');
            }, 1500);
        });
    }
    
    if (printPdfBtn) {
        printPdfBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

function generateHealthSummary() {
    const format = document.querySelector('input[name="format"]:checked')?.value;
    const dateRange = document.querySelector('.date-option-btn.active')?.getAttribute('data-range');
    
    Utils.closeModal('exportHealthSummaryModal');
    Utils.showLoading(true);
    
    setTimeout(() => {
        Utils.showLoading(false);
        
        if (format === 'insurance') {
            Utils.showToast('Insurance-ready health summary generated', 'success');
            setTimeout(() => {
                // Redirect to insurance page
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Patient\\My Medical Cover\\my_medical_cover.html';
            }, 1500);
        } else {
            Utils.showToast('Health summary PDF generated successfully', 'success');
            setTimeout(() => {
                Utils.showToast('Download started', 'info');
            }, 1000);
        }
    }, 2000);
}

function generatePrescriptionList() {
    Utils.closeModal('exportPrescriptionsModal');
    Utils.showLoading(true);
    
    setTimeout(() => {
        Utils.showLoading(false);
        Utils.showToast('Medication list PDF generated successfully', 'success');
        setTimeout(() => {
            Utils.showToast('Download started', 'info');
        }, 1000);
    }, 1500);
}

// ===================================
// 14. SECURE MESSAGING
// ===================================

function initializeMessaging() {
    const messageButtons = document.querySelectorAll('[data-doctor-message]');
    const messageDoctorFromModal = document.getElementById('messageDoctorFromModal');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const newMessageInput = document.getElementById('newMessageInput');
    
    messageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const doctorId = this.getAttribute('data-doctor-message');
            openDoctorMessage(doctorId);
        });
    });
    
    if (messageDoctorFromModal) {
        messageDoctorFromModal.addEventListener('click', () => {
            Utils.closeModal('doctorInfoModal');
            Utils.openModal('messageDoctorModal');
        });
    }
    
    if (sendMessageBtn && newMessageInput) {
        sendMessageBtn.addEventListener('click', () => {
            const message = newMessageInput.value.trim();
            if (message) {
                sendMessage(message);
            } else {
                Utils.showToast('Please enter a message', 'warning');
            }
        });
    }
}

function openDoctorMessage(doctorId) {
    // Set doctor info in modal
    const doctorData = {
        wanjiru: { name: 'Dr. Sarah Wanjiru', specialty: 'Cardiologist' },
        omondi: { name: 'Dr. James Omondi', specialty: 'Pediatrician' },
        njeri: { name: 'Dr. Emily Njeri', specialty: 'Emergency Medicine' }
    };
    
    const doctor = doctorData[doctorId];
    if (doctor) {
        document.getElementById('messageDoctorName').textContent = doctor.name;
        document.getElementById('messageDoctorSpecialty').textContent = doctor.specialty;
    }
    
    Utils.openModal('messageDoctorModal');
}

function sendMessage(message) {
    const thread = document.getElementById('messageThread');
    const newMessageInput = document.getElementById('newMessageInput');
    
    // Add message to thread
    const messageItem = document.createElement('div');
    messageItem.className = 'message-item sent';
    messageItem.innerHTML = `
        <div class="message-bubble">
            <p>${message}</p>
            <span class="message-time">Just now</span>
        </div>
    `;
    
    thread.appendChild(messageItem);
    thread.scrollTop = thread.scrollHeight;
    
    // Clear input
    newMessageInput.value = '';
    
    Utils.showToast('Message sent to doctor', 'success');
    
    // Simulate doctor response
    setTimeout(() => {
        const responseItem = document.createElement('div');
        responseItem.className = 'message-item received';
        responseItem.innerHTML = `
            <div class="message-bubble">
                <p>Thank you for your message. I'll review this and get back to you shortly.</p>
                <span class="message-time">Just now</span>
            </div>
        `;
        thread.appendChild(responseItem);
        thread.scrollTop = thread.scrollHeight;
        Utils.showToast('Doctor responded', 'info');
    }, 3000);
}

// ===================================
// 15. ACCESS LOG
// ===================================

function initializeAccessLog() {
    // Access log functionality would go here
    // For now, just show toast when viewing
    const viewLogsButtons = document.querySelectorAll('[data-view-logs]');
    
    viewLogsButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            Utils.openModal('accessLogModal');
        });
    });
}

// ===================================
// 16. MODAL MANAGEMENT
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
        
        // Ctrl/Cmd + E for export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            document.getElementById('exportHealthSummaryBtn')?.click();
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
    
    document.querySelectorAll('.visit-card, .lab-result-card, .medication-card, .doctor-note-card, .highlight-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease-in-out';
        observer.observe(el);
    });
}

// ===================================
// 23. REAL-TIME SYNC SIMULATION
// ===================================

function initializeRealTimeSync() {
    // Simulate receiving new records
    setInterval(() => {
        const random = Math.random();
        if (random > 0.95) {
            Utils.showToast('New health record added', 'info');
            // In production, this would fetch new data
        }
    }, 60000); // Check every minute
}

// ===================================
// 24. INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Curis My Health Care initializing...');
    
    try {
        // Initialize all components
        initializeFamilySwitcher();
        initializeTabs();
        initializeSearch();
        initializeVisitFilters();
        initializeClinicGroups();
        initializeDoctorBadges();
        initializeClinicalNotes();
        initializeSummaryExpansion();
        initializeFileHandlers();
        initializeQuickActions();
        initializeExport();
        initializeMessaging();
        initializeAccessLog();
        initializeModals();
        initializeDarkMode();
        initializeProfileDropdown();
        initializeKeyboardShortcuts();
        initializeSessionManagement();
        initializeErrorHandling();
        initializeAnimations();
        initializeRealTimeSync();
        
        console.log('Curis My Health Care initialized successfully');
        
        setTimeout(() => {
            Utils.showToast('Welcome to My Health Care!', 'success');
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

window.CurisHealthCare = {
    Utils,
    HealthCareState,
    switchFamilyMember,
    switchMainTab,
    performSearch
};
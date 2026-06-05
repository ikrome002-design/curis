/* ===================================
   CURIS EMERGENCY CARE - JAVASCRIPT
   Modern Healthcare Platform
   =================================== */

// ===================================
// 1. GLOBAL STATE MANAGEMENT
// ===================================

const EmergencyState = {
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
            hasAllergies: false
        },
        {
            id: 'spouse',
            name: 'Jane Kamau',
            relationship: 'Spouse',
            age: 42,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            hasAllergies: false
        },
        {
            id: 'daughter',
            name: 'Mary Kamau',
            relationship: 'Daughter',
            age: 12,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            hasAllergies: true,
            allergies: [
                { type: 'Peanut Allergy', severity: 'severe', description: 'Severe - Anaphylaxis Risk' },
                { type: 'Penicillin', severity: 'moderate', description: 'Moderate - Drug Allergy' }
            ],
            pediatrician: {
                name: 'Dr. James Omondi',
                clinic: 'Westlands Medical Clinic',
                phone: '+254722345678'
            },
            schoolContact: {
                name: 'Greenfield Academy',
                contactPerson: 'Mrs. Wanjiku (School Nurse)',
                phone: '+254733456789'
            }
        },
        {
            id: 'son',
            name: 'David Kamau',
            relationship: 'Son',
            age: 8,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            hasAllergies: false
        }
    ],
    personalContacts: [
        {
            id: 1,
            name: 'Jane Kamau',
            type: 'next-of-kin',
            relationship: 'spouse',
            phone: '+254722123456',
            notes: ''
        },
        {
            id: 2,
            name: 'AAR Emergency Services',
            type: 'private-ambulance',
            relationship: 'service-provider',
            phone: '+254202717374',
            notes: 'Available 24/7'
        },
        {
            id: 3,
            name: 'Dr. Sarah Wanjiru',
            type: 'family-doctor',
            relationship: 'healthcare-provider',
            phone: '+254733234567',
            notes: 'Nairobi Health Center'
        },
        {
            id: 4,
            name: 'Peter Kamau',
            type: 'family-member',
            relationship: 'sibling',
            phone: '+254711345678',
            notes: 'Brother'
        }
    ],
    selectedCounty: 'nairobi',
    activeContactCategory: 'all',
    currentContactId: null,
    searchQuery: '',
    emergencyAlertDismissed: false
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

    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast(`Number copied: ${text}`, 'success');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    },

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            this.showToast(`Number copied: ${text}`, 'success');
        } catch (err) {
            this.showToast('Failed to copy number', 'error');
        }
        document.body.removeChild(textArea);
    },

    isChild(age) {
        return age < 18;
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

    formatPhoneNumber(phone) {
        // Basic formatting for Kenyan numbers
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('254')) {
            return `+254 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
        } else if (cleaned.startsWith('0')) {
            return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
        }
        return phone;
    }
};

// ===================================
// 3. FAMILY MEMBER SWITCHER
// ===================================

function initializeFamilySwitcher() {
    const profileSelector = document.getElementById('emergencyProfileSelector');
    const familyMembers = document.querySelectorAll('.family-member');

    if (profileSelector) {
        profileSelector.addEventListener('click', () => {
            Utils.openModal('familyEmergencyModal');
        });
    }

    familyMembers.forEach(member => {
        member.addEventListener('click', function () {
            const memberId = this.getAttribute('data-member-id');
            selectFamilyMember(memberId);
        });
    });
}

function selectFamilyMember(memberId) {
    const member = EmergencyState.familyMembers.find(m => m.id === memberId);
    if (!member) return;

    EmergencyState.currentUser = member;

    // Update UI
    updateProfileDisplay();

    // Update active state in modal
    document.querySelectorAll('.family-member').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`[data-member-id="${memberId}"]`)?.classList.add('active');

    // Show/hide dependent emergency card
    toggleDependentEmergencyCard(member);

    Utils.closeModal('familyEmergencyModal');
    Utils.showToast(`Switched to ${member.name}'s emergency profile`, 'success');
}

function updateProfileDisplay() {
    const profileName = document.querySelector('.emergency-switcher .profile-name');
    const profileAvatar = document.querySelector('.emergency-switcher .profile-avatar');

    if (profileName) {
        const relationship = EmergencyState.currentUser.relationship === 'Self'
            ? 'Self'
            : EmergencyState.currentUser.relationship;
        profileName.textContent = `${EmergencyState.currentUser.name} (${relationship})`;
    }

    if (profileAvatar) {
        profileAvatar.src = EmergencyState.currentUser.avatar;
    }
}

function toggleDependentEmergencyCard(member) {
    const dependentCard = document.getElementById('dependentEmergencyCard');

    if (!dependentCard) return;

    if (Utils.isChild(member.age) && member.id !== 'self') {
        // Show dependent emergency card
        dependentCard.style.display = 'block';

        // Update dependent information
        document.getElementById('dependentPhoto').src = member.avatar;
        document.getElementById('dependentName').textContent = member.name;
        document.getElementById('dependentAge').textContent = `${member.age} years old`;

        // Show/hide allergy section based on member data
        if (member.hasAllergies && member.allergies) {
            updateAllergyDisplay(member.allergies);
        }

        // Update child contacts if available
        if (member.pediatrician || member.schoolContact) {
            updateChildContacts(member);
        }
    } else {
        // Hide dependent emergency card for adults
        dependentCard.style.display = 'none';
    }
}

function updateAllergyDisplay(allergies) {
    // This is already in HTML, but could be dynamically generated
    // For now, the static HTML handles this
}

function updateChildContacts(member) {
    // This is already in HTML, but could be dynamically generated
    // For now, the static HTML handles this
}

// ===================================
// 4. COPY NUMBER FUNCTIONALITY
// ===================================

function initializeCopyNumbers() {
    document.addEventListener('click', function (e) {
        const copyBtn = e.target.closest('.copy-number');
        if (copyBtn) {
            const number = copyBtn.getAttribute('data-number');
            if (number) {
                Utils.copyToClipboard(number);
            }
        }
    });
}

// ===================================
// 5. EMERGENCY ALERT BANNER
// ===================================

function initializeEmergencyAlert() {
    const closeAlertBtn = document.querySelector('.close-alert-btn');
    const alertBanner = document.getElementById('emergencyAlertBanner');
    const alertActionBtns = document.querySelectorAll('.alert-action-btn');

    if (closeAlertBtn && alertBanner) {
        closeAlertBtn.addEventListener('click', () => {
            alertBanner.style.display = 'none';
            EmergencyState.emergencyAlertDismissed = true;
            Utils.showToast('Health advisory dismissed', 'info');
        });
    }

    alertActionBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const action = this.textContent.trim();
            if (action.includes('Safety Measures')) {
                Utils.openModal('healthAdvisoryModal');
            } else if (action.includes('Treatment Centers')) {
                Utils.showToast('Redirecting to treatment center locator...', 'info');
                // Could implement actual navigation
            }
        });
    });
}

// ===================================
// 6. QUICK ACTIONS
// ===================================

function initializeQuickActions() {
    const callAmbulanceBtn = document.getElementById('callAmbulanceBtn');
    const contactClinicBtn = document.getElementById('contactClinicBtn');
    const viewChildInfoBtn = document.getElementById('viewChildInfoBtn');
    const urgentBookingBtn = document.getElementById('urgentBookingBtn');

    if (callAmbulanceBtn) {
        callAmbulanceBtn.addEventListener('click', () => {
            Utils.openModal('callAmbulanceModal');
        });
    }

    if (contactClinicBtn) {
        contactClinicBtn.addEventListener('click', () => {
            Utils.openModal('contactClinicModal');
        });
    }

    if (viewChildInfoBtn) {
        viewChildInfoBtn.addEventListener('click', () => {
            const currentUser = EmergencyState.currentUser;
            if (Utils.isChild(currentUser.age) && currentUser.id !== 'self') {
                const dependentCard = document.getElementById('dependentEmergencyCard');
                if (dependentCard) {
                    dependentCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    Utils.showToast(`Viewing emergency info for ${currentUser.name}`, 'info');
                }
            } else {
                Utils.showToast('Please select a child from the family switcher', 'warning');
                Utils.openModal('familyEmergencyModal');
            }
        });
    }

    if (urgentBookingBtn) {
        urgentBookingBtn.addEventListener('click', () => {
            handleUrgentBooking();
        });
    }

    // Urgent pediatric booking button
    const urgentPediatricBtn = document.getElementById('urgentPediatricBooking');
    if (urgentPediatricBtn) {
        urgentPediatricBtn.addEventListener('click', () => {
            handleUrgentBooking(true);
        });
    }
}

function handleUrgentBooking(isPediatric = false) {
    Utils.showToast('Redirecting to urgent appointment booking...', 'info');
    setTimeout(() => {
        // In production, this would navigate to appointments page with urgent flag
        const appointmentsUrl = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Patient\\My Appointments\\my_appointments.html';
        if (isPediatric) {
            Utils.showToast('Opening pediatric urgent booking...', 'info');
        }
        // window.location.href = appointmentsUrl;
    }, 1000);
}

// ===================================
// 7. EMERGENCY SEARCH & FILTERING
// ===================================

function initializeSearch() {
    const searchInput = document.getElementById('emergencySearchInput');
    const countyFilter = document.getElementById('countyFilter');

    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                EmergencyState.searchQuery = this.value.toLowerCase();
                filterEmergencyServices();
            }, 300);
        });
    }

    if (countyFilter) {
        countyFilter.addEventListener('change', function () {
            EmergencyState.selectedCounty = this.value;
            filterByCounty();
            Utils.showToast(`Filtering services for ${this.options[this.selectedIndex].text}`, 'info');
        });
    }
}

function filterEmergencyServices() {
    const query = EmergencyState.searchQuery;
    const categoryCards = document.querySelectorAll('.emergency-category-card');
    const serviceItems = document.querySelectorAll('.service-item');

    let visibleCount = 0;

    if (query === '') {
        // Show all
        categoryCards.forEach(card => card.style.display = 'block');
        serviceItems.forEach(item => item.style.display = 'flex');
        return;
    }

    categoryCards.forEach(card => {
        const categoryTitle = card.querySelector('.category-title').textContent.toLowerCase();
        const services = card.querySelectorAll('.service-item');
        let hasVisibleServices = false;

        services.forEach(service => {
            const serviceName = service.querySelector('.service-name').textContent.toLowerCase();
            const serviceText = service.textContent.toLowerCase();

            if (serviceName.includes(query) || serviceText.includes(query) || categoryTitle.includes(query)) {
                service.style.display = 'flex';
                hasVisibleServices = true;
                visibleCount++;
            } else {
                service.style.display = 'none';
            }
        });

        card.style.display = hasVisibleServices ? 'block' : 'none';
    });

    if (visibleCount === 0) {
        Utils.showToast('No emergency services found matching your search', 'warning');
    }
}

function filterByCounty() {
    const county = EmergencyState.selectedCounty;

    // In a real implementation, this would filter services by county
    // For now, we'll just show a message
    if (county !== 'all') {
        Utils.showToast(`Showing emergency services for selected county`, 'info');
    }
}

// ===================================
// 8. PERSONAL CONTACTS MANAGEMENT
// ===================================

function initializePersonalContacts() {
    const addContactBtn = document.getElementById('addContactBtn');
    const addFirstContactBtn = document.getElementById('addFirstContactBtn');
    const saveContactBtn = document.getElementById('saveContactBtn');
    const updateContactBtn = document.getElementById('updateContactBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    if (addContactBtn) {
        addContactBtn.addEventListener('click', () => {
            resetContactForm();
            Utils.openModal('addContactModal');
        });
    }

    if (addFirstContactBtn) {
        addFirstContactBtn.addEventListener('click', () => {
            resetContactForm();
            Utils.openModal('addContactModal');
        });
    }

    if (saveContactBtn) {
        saveContactBtn.addEventListener('click', saveNewContact);
    }

    if (updateContactBtn) {
        updateContactBtn.addEventListener('click', updateContact);
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteContact);
    }

    // Edit and Delete buttons
    document.addEventListener('click', function (e) {
        if (e.target.closest('.edit-contact')) {
            const contactId = parseInt(e.target.closest('.edit-contact').getAttribute('data-contact-id'));
            openEditContactModal(contactId);
        }

        if (e.target.closest('.delete-contact')) {
            const contactId = parseInt(e.target.closest('.delete-contact').getAttribute('data-contact-id'));
            openDeleteContactModal(contactId);
        }
    });

    // Category tabs
    initializeContactCategoryTabs();

    // Initialize display
    displayPersonalContacts();
}

function initializeContactCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab-btn');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const category = this.getAttribute('data-category');

            // Update active state
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Update state and filter
            EmergencyState.activeContactCategory = category;
            filterContactsByCategory(category);
        });
    });
}

function filterContactsByCategory(category) {
    const contactCards = document.querySelectorAll('.personal-contact-card');

    contactCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function displayPersonalContacts() {
    const grid = document.getElementById('personalContactsGrid');
    const emptyState = document.querySelector('.personal-contacts-section .empty-state');

    if (!grid) return;

    if (EmergencyState.personalContacts.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = EmergencyState.personalContacts.map(contact => createContactCard(contact)).join('');
}

function createContactCard(contact) {
    const typeLabels = {
        'next-of-kin': 'Next of Kin',
        'private-ambulance': 'Private Ambulance',
        'family-doctor': 'Family Doctor',
        'family-member': 'Family Member'
    };

    const relationshipIcons = {
        'spouse': 'fa-heart',
        'mother': 'fa-user',
        'father': 'fa-user',
        'sibling': 'fa-user',
        'child': 'fa-child',
        'guardian': 'fa-user-shield',
        'healthcare-provider': 'fa-hospital',
        'service-provider': 'fa-briefcase-medical',
        'other': 'fa-user'
    };

    return `
        <div class="personal-contact-card" data-contact-id="${contact.id}" data-category="${contact.type}">
            <div class="contact-card-header">
                <div class="contact-type-badge ${contact.type}">
                    <i class="fas ${getContactTypeIcon(contact.type)}"></i>
                    <span>${typeLabels[contact.type]}</span>
                </div>
                <div class="contact-actions">
                    <button class="contact-action-btn edit-contact" data-contact-id="${contact.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="contact-action-btn delete-contact" data-contact-id="${contact.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="contact-card-body">
                <h4 class="contact-name">${contact.name}</h4>
                <p class="contact-relationship">
                    <i class="fas ${relationshipIcons[contact.relationship] || 'fa-user'}"></i>
                    ${formatRelationship(contact.relationship, contact.notes)}
                </p>
                <button class="contact-number-btn copy-number" data-number="${contact.phone}">
                    <i class="fas fa-phone"></i>
                    <span>${Utils.formatPhoneNumber(contact.phone)}</span>
                    <i class="fas fa-copy copy-icon"></i>
                </button>
            </div>
        </div>
    `;
}

function getContactTypeIcon(type) {
    const icons = {
        'next-of-kin': 'fa-user-shield',
        'private-ambulance': 'fa-truck-medical',
        'family-doctor': 'fa-user-doctor',
        'family-member': 'fa-users'
    };
    return icons[type] || 'fa-user';
}

function formatRelationship(relationship, notes) {
    const labels = {
        'spouse': 'Spouse',
        'mother': 'Mother',
        'father': 'Father',
        'sibling': 'Sibling',
        'child': 'Child',
        'guardian': 'Guardian',
        'healthcare-provider': 'Healthcare Provider',
        'service-provider': 'Service Provider',
        'other': 'Other'
    };

    const label = labels[relationship] || relationship;
    return notes ? notes : label;
}

function resetContactForm() {
    const form = document.getElementById('addContactForm');
    if (form) form.reset();
}

function saveNewContact() {
    const name = document.getElementById('contactName')?.value;
    const type = document.getElementById('contactType')?.value;
    const relationship = document.getElementById('contactRelationship')?.value;
    const phone = document.getElementById('contactPhone')?.value;
    const notes = document.getElementById('contactNotes')?.value;

    if (!name || !type || !relationship || !phone) {
        Utils.showToast('Please fill in all required fields', 'error');
        return;
    }

    const newContact = {
        id: Date.now(),
        name,
        type,
        relationship,
        phone,
        notes
    };

    EmergencyState.personalContacts.push(newContact);

    Utils.closeModal('addContactModal');
    displayPersonalContacts();
    Utils.showToast(`${name} added to emergency contacts`, 'success');
}

function openEditContactModal(contactId) {
    const contact = EmergencyState.personalContacts.find(c => c.id === contactId);
    if (!contact) return;

    EmergencyState.currentContactId = contactId;

    document.getElementById('editContactId').value = contactId;
    document.getElementById('editContactName').value = contact.name;
    document.getElementById('editContactType').value = contact.type;
    document.getElementById('editContactRelationship').value = contact.relationship;
    document.getElementById('editContactPhone').value = contact.phone;
    document.getElementById('editContactNotes').value = contact.notes || '';

    Utils.openModal('editContactModal');
}

function updateContact() {
    const contactId = parseInt(document.getElementById('editContactId')?.value);
    const contact = EmergencyState.personalContacts.find(c => c.id === contactId);

    if (!contact) return;

    contact.name = document.getElementById('editContactName')?.value;
    contact.type = document.getElementById('editContactType')?.value;
    contact.relationship = document.getElementById('editContactRelationship')?.value;
    contact.phone = document.getElementById('editContactPhone')?.value;
    contact.notes = document.getElementById('editContactNotes')?.value;

    Utils.closeModal('editContactModal');
    displayPersonalContacts();
    Utils.showToast(`${contact.name} updated successfully`, 'success');
}

function openDeleteContactModal(contactId) {
    const contact = EmergencyState.personalContacts.find(c => c.id === contactId);
    if (!contact) return;

    EmergencyState.currentContactId = contactId;

    document.getElementById('deleteContactName').textContent = contact.name;
    Utils.openModal('deleteContactModal');
}

function deleteContact() {
    const contactId = EmergencyState.currentContactId;
    const index = EmergencyState.personalContacts.findIndex(c => c.id === contactId);

    if (index !== -1) {
        const contactName = EmergencyState.personalContacts[index].name;
        EmergencyState.personalContacts.splice(index, 1);

        Utils.closeModal('deleteContactModal');
        displayPersonalContacts();
        Utils.showToast(`${contactName} removed from emergency contacts`, 'success');
    }
}

// ===================================
// 9. EMERGENCY MESSAGING
// ===================================

function initializeEmergencyMessaging() {
    const sendMessageBtn = document.getElementById('sendEmergencyMessageBtn');
    const templateBtns = document.querySelectorAll('.template-btn');

    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendEmergencyMessage);
    }

    templateBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const template = this.getAttribute('data-template');
            applyMessageTemplate(template);
        });
    });
}

function applyMessageTemplate(template) {
    const descriptionField = document.getElementById('emergencyDescription');
    if (!descriptionField) return;

    const templates = {
        'pain': 'I am experiencing severe pain and need urgent medical attention. Please advise on next steps.',
        'accident': 'There has been an accident/injury. Immediate medical assistance required.',
        'allergy': 'Experiencing allergic reaction. Need urgent medical evaluation.',
        'other': ''
    };

    descriptionField.value = templates[template] || '';
    descriptionField.focus();
}

function sendEmergencyMessage() {
    const clinic = document.getElementById('emergencyClinic')?.value;
    const description = document.getElementById('emergencyDescription')?.value;

    if (!clinic || !description) {
        Utils.showToast('Please select a clinic and describe the emergency', 'error');
        return;
    }

    Utils.closeModal('contactClinicModal');
    Utils.showLoading(true);

    setTimeout(() => {
        Utils.showLoading(false);
        Utils.showToast('URGENT message sent to clinic emergency inbox', 'success');

        setTimeout(() => {
            Utils.showToast('Clinic will respond shortly', 'info');
        }, 1000);

        // Reset form
        document.getElementById('emergencyMessageForm')?.reset();
    }, 1500);
}

// ===================================
// 10. MODAL MANAGEMENT
// ===================================

function initializeModals() {
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Prevent modal content clicks from closing modal
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    });
}

// ===================================
// 11. DARK MODE TOGGLE
// ===================================

function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function () {
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
// 12. PROFILE DROPDOWN
// ===================================

function initializeProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');

    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isVisible = profileMenu.style.opacity === '1';
            profileMenu.style.opacity = isVisible ? '0' : '1';
            profileMenu.style.visibility = isVisible ? 'hidden' : 'visible';
        });

        document.addEventListener('click', function (e) {
            if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.style.opacity = '0';
                profileMenu.style.visibility = 'hidden';
            }
        });
    }
}

// ===================================
// 13. KEYBOARD SHORTCUTS
// ===================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            Utils.closeAllModals();
        }

        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('emergencySearchInput')?.focus();
        }

        // Ctrl/Cmd + N for new contact
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            document.getElementById('addContactBtn')?.click();
        }
    });
}

// ===================================
// 14. SESSION MANAGEMENT
// ===================================

function initializeSessionManagement() {
    let inactivityTimer;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            Utils.showToast('Session expired due to inactivity', 'warning');
            setTimeout(() => {
                // In production, redirect to login
                // window.location.href = 'login.html';
            }, 2000);
        }, INACTIVITY_LIMIT);
    }

    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });

    resetTimer();
}

// ===================================
// 15. ERROR HANDLING
// ===================================

function initializeErrorHandling() {
    window.addEventListener('error', function (e) {
        console.error('Global error:', e.error);
        Utils.showToast('An error occurred. Please try again.', 'error');
    });

    window.addEventListener('unhandledrejection', function (e) {
        console.error('Unhandled promise rejection:', e.reason);
        Utils.showToast('An error occurred. Please try again.', 'error');
    });
}

// ===================================
// 16. ANIMATION OBSERVERS
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

    document.querySelectorAll('.emergency-category-card, .personal-contact-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease-in-out';
        observer.observe(el);
    });
}

// ===================================
// 17. INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('Curis Emergency Care initializing...');

    try {
        // Initialize all components
        initializeFamilySwitcher();
        initializeCopyNumbers();
        initializeEmergencyAlert();
        initializeQuickActions();
        initializeSearch();
        initializePersonalContacts();
        initializeEmergencyMessaging();
        initializeModals();
        initializeDarkMode();
        initializeProfileDropdown();
        initializeKeyboardShortcuts();
        initializeSessionManagement();
        initializeErrorHandling();
        initializeAnimations();

        console.log('Curis Emergency Care initialized successfully');

        setTimeout(() => {
            Utils.showToast('Emergency Care ready - Stay safe!', 'success');
        }, 500);

    } catch (error) {
        console.error('Initialization error:', error);
        Utils.showToast('Initialization error. Please refresh the page.', 'error');
    }
});

// ===================================
// 18. WINDOW RESIZE HANDLER
// ===================================

let resizeTimer;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        // Handle responsive adjustments
        if (window.innerWidth <= 768) {
            // Mobile adjustments if needed
        }
    }, 250);
});

// ===================================
// 19. EXPORT FOR EXTERNAL ACCESS
// ===================================

window.CurisEmergency = {
    Utils,
    EmergencyState,
    selectFamilyMember,
    copyToClipboard: Utils.copyToClipboard.bind(Utils)
};
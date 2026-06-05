/* ===================================
   CURIS MY APPOINTMENTS - JAVASCRIPT
   Modern Healthcare Platform
   =================================== */

// ===================================
// 1. GLOBAL STATE MANAGEMENT
// ===================================

const AppointmentsState = {
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
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png'
        },
        {
            id: 'spouse',
            name: 'Jane Kamau',
            relationship: 'Spouse',
            age: 42,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png'
        },
        {
            id: 'daughter',
            name: 'Mary Kamau',
            relationship: 'Daughter',
            age: 12,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png'
        },
        {
            id: 'son',
            name: 'David Kamau',
            relationship: 'Son',
            age: 8,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png'
        }
    ],
    selectedClinic: null,
    selectedDoctor: null,
    selectedDate: null,
    selectedTime: null,
    selectedService: 'consultation',
    currentAppointmentId: null,
    searchFilters: {
        location: '',
        specialty: '',
        availability: ''
    },
    currentCalendar: {
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    }
};

// Mock clinic data
const clinicData = [
    {
        id: 1,
        name: 'Nairobi Health Center',
        location: 'Westlands, Nairobi',
        phone: '+254 700 123 456',
        doctorCount: 5,
        nextAvailable: 'Tomorrow 9:00 AM',
        specialties: ['General Practice', 'Pediatrics', 'Dentistry'],
        doctors: [
            { id: 1, name: 'Dr. Sarah Wanjiru', specialty: 'General Practice' },
            { id: 2, name: 'Dr. James Omondi', specialty: 'Pediatrics' }
        ]
    },
    {
        id: 2,
        name: 'Westlands Medical Clinic',
        location: 'Westlands, Nairobi',
        phone: '+254 700 789 012',
        doctorCount: 8,
        nextAvailable: 'Today 2:00 PM',
        specialties: ['Dermatology', 'Cardiology', 'Orthopedics'],
        doctors: [
            { id: 3, name: 'Dr. Peter Mwangi', specialty: 'Dermatology' },
            { id: 4, name: 'Dr. Grace Njeri', specialty: 'Cardiology' }
        ]
    },
    {
        id: 3,
        name: 'Karen Medical Centre',
        location: 'Karen, Nairobi',
        phone: '+254 700 345 678',
        doctorCount: 3,
        nextAvailable: 'Oct 3, 10:00 AM',
        specialties: ['General Practice', 'Pediatrics'],
        doctors: [
            { id: 5, name: 'Dr. Michael Ochieng', specialty: 'General Practice' }
        ]
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

    formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    },

    isFutureDate(dateString) {
        const selectedDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
    },

    canCancelAppointment(appointmentDate) {
        const apptDate = new Date(appointmentDate);
        const now = new Date();
        const hoursDiff = (apptDate - now) / (1000 * 60 * 60);
        return hoursDiff >= 24;
    },

    isChildPatient(age) {
        return age < 18;
    },

    showLoading(show = true) {
        const loadingState = document.getElementById('loadingState');
        const clinicCardsGrid = document.getElementById('clinicCardsGrid');
        const emptyState = document.getElementById('emptyState');

        if (show) {
            if (loadingState) loadingState.style.display = 'block';
            if (clinicCardsGrid) clinicCardsGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'none';
        } else {
            if (loadingState) loadingState.style.display = 'none';
            if (clinicCardsGrid) clinicCardsGrid.style.display = 'grid';
        }
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
        member.addEventListener('click', function () {
            const memberId = this.getAttribute('data-member-id');
            const memberAge = parseInt(this.getAttribute('data-age'));
            selectFamilyMember(memberId, memberAge);
        });
    });
}

function selectFamilyMember(memberId, memberAge) {
    const member = AppointmentsState.familyMembers.find(m => m.id === memberId);
    if (!member) return;

    AppointmentsState.currentUser = member;

    // Update UI
    updateProfileDisplay();

    // Update active state in modal
    document.querySelectorAll('.family-member').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`[data-member-id="${memberId}"]`).classList.add('active');

    // Filter services based on age
    filterServicesBasedOnAge(memberAge);

    // Refresh search results
    applyFilters();

    Utils.closeModal('familyModal');
    Utils.showToast(`Switched to ${member.name}'s profile`, 'success');
}

function updateProfileDisplay() {
    const profileName = document.querySelector('.profile-name');
    const profileAvatar = document.querySelector('.profile-avatar');

    if (profileName) {
        const relationship = AppointmentsState.currentUser.relationship === 'Self'
            ? 'Self'
            : `${AppointmentsState.currentUser.relationship}`;
        profileName.textContent = `${AppointmentsState.currentUser.name} (${relationship})`;
    }

    if (profileAvatar) {
        profileAvatar.src = AppointmentsState.currentUser.avatar;
    }
}

function filterServicesBasedOnAge(age) {
    // Filter clinics to show age-appropriate providers
    // For children, prioritize pediatricians
    if (Utils.isChildPatient(age)) {
        Utils.showToast('Showing pediatric-friendly providers', 'info');
    }
}

// ===================================
// 4. SEARCH AND FILTER FUNCTIONALITY
// ===================================

function initializeSearchFilters() {
    const locationFilter = document.getElementById('locationFilter');
    const specialtyFilter = document.getElementById('specialtyFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const advancedSearchBtn = document.getElementById('advancedSearchBtn');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    if (advancedSearchBtn) {
        advancedSearchBtn.addEventListener('click', () => {
            Utils.openModal('advancedSearchModal');
        });
    }

    // Real-time filtering on input
    [locationFilter, specialtyFilter, availabilityFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', () => {
                updateSearchFilters();
            });
        }
    });
}

function updateSearchFilters() {
    AppointmentsState.searchFilters = {
        location: document.getElementById('locationFilter')?.value || '',
        specialty: document.getElementById('specialtyFilter')?.value || '',
        availability: document.getElementById('availabilityFilter')?.value || ''
    };
}

function applyFilters() {
    updateSearchFilters();

    Utils.showLoading(true);

    setTimeout(() => {
        const filteredClinics = filterClinics(clinicData, AppointmentsState.searchFilters);
        displayClinics(filteredClinics);
        Utils.showLoading(false);

        if (filteredClinics.length === 0) {
            showEmptyState();
        }
    }, 500);
}

function filterClinics(clinics, filters) {
    return clinics.filter(clinic => {
        const matchesLocation = !filters.location ||
            clinic.location.toLowerCase().includes(filters.location.toLowerCase());

        const matchesSpecialty = !filters.specialty ||
            clinic.specialties.some(s => s.toLowerCase().includes(filters.specialty.toLowerCase()));

        const matchesAvailability = !filters.availability || true; // Simplified

        return matchesLocation && matchesSpecialty && matchesAvailability;
    });
}

function displayClinics(clinics) {
    const grid = document.getElementById('clinicCardsGrid');
    if (!grid) return;

    if (clinics.length === 0) {
        grid.style.display = 'none';
        return;
    }

    grid.style.display = 'grid';
    grid.innerHTML = clinics.map(clinic => createClinicCard(clinic)).join('');

    // Add event listeners to book buttons
    document.querySelectorAll('.book-clinic-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const clinicId = parseInt(this.getAttribute('data-clinic-id'));
            openBookingModal(clinicId);
        });
    });
}

function createClinicCard(clinic) {
    return `
        <div class="clinic-card" data-clinic-id="${clinic.id}">
            <div class="clinic-header">
                <div class="clinic-logo">
                    <i class="fas fa-hospital"></i>
                </div>
                <div class="clinic-info">
                    <h3 class="clinic-name">${clinic.name}</h3>
                    <p class="clinic-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${clinic.location}
                    </p>
                </div>
            </div>
            
            <div class="clinic-details">
                <div class="detail-item">
                    <i class="fas fa-user-doctor"></i>
                    <span>${clinic.doctorCount} Doctors Available</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>Next Available: ${clinic.nextAvailable}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <span>${clinic.phone}</span>
                </div>
            </div>
            
            <div class="clinic-specialties">
                ${clinic.specialties.map(s => `<span class="specialty-tag">${s}</span>`).join('')}
            </div>
            
            <button class="btn-primary book-clinic-btn" data-clinic-id="${clinic.id}">
                <i class="fas fa-calendar-plus"></i>
                Book Appointment
            </button>
        </div>
    `;
}

function clearFilters() {
    document.getElementById('locationFilter').value = '';
    document.getElementById('specialtyFilter').value = '';
    document.getElementById('availabilityFilter').value = '';

    AppointmentsState.searchFilters = {
        location: '',
        specialty: '',
        availability: ''
    };

    applyFilters();
    Utils.showToast('Filters cleared', 'info');
}

function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.style.display = 'block';
    }
}

// ===================================
// 5. ADVANCED SEARCH
// ===================================

function initializeAdvancedSearch() {
    const executeSearchBtn = document.getElementById('executeAdvancedSearch');
    const advancedSearchForm = document.getElementById('advancedSearchForm');

    if (executeSearchBtn) {
        executeSearchBtn.addEventListener('click', () => {
            executeAdvancedSearch();
        });
    }
}

function executeAdvancedSearch() {
    const clinicName = document.getElementById('clinicNameSearch')?.value || '';
    const doctorName = document.getElementById('doctorNameSearch')?.value || '';
    const email = document.getElementById('emailSearch')?.value || '';
    const phone = document.getElementById('phoneSearch')?.value || '';
    const serviceType = document.getElementById('serviceTypeSearch')?.value || '';

    Utils.closeModal('advancedSearchModal');
    Utils.showLoading(true);

    setTimeout(() => {
        // Simulate search with filters
        let results = clinicData;

        if (clinicName) {
            results = results.filter(c =>
                c.name.toLowerCase().includes(clinicName.toLowerCase())
            );
        }

        if (doctorName) {
            results = results.filter(c =>
                c.doctors.some(d => d.name.toLowerCase().includes(doctorName.toLowerCase()))
            );
        }

        displayClinics(results);
        Utils.showLoading(false);

        Utils.showToast(`Found ${results.length} matching provider(s)`, 'success');
    }, 800);
}

// ===================================
// 6. CALENDAR IMPLEMENTATION
// ===================================

function initializeCalendar() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            changeMonth(-1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            changeMonth(1);
        });
    }

    renderCalendar();
}

function changeMonth(delta) {
    AppointmentsState.currentCalendar.month += delta;

    if (AppointmentsState.currentCalendar.month > 11) {
        AppointmentsState.currentCalendar.month = 0;
        AppointmentsState.currentCalendar.year++;
    } else if (AppointmentsState.currentCalendar.month < 0) {
        AppointmentsState.currentCalendar.month = 11;
        AppointmentsState.currentCalendar.year--;
    }

    renderCalendar();
}

function renderCalendar() {
    const { month, year } = AppointmentsState.currentCalendar;
    const grid = document.getElementById('calendarGrid');
    const title = document.getElementById('calendarTitle');

    if (!grid) return;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    if (title) {
        title.textContent = `${monthNames[month]} ${year}`;
    }

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Clear previous days (keep headers)
    const existingDays = grid.querySelectorAll('.calendar-day');
    existingDays.forEach(day => day.remove());

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        grid.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('button');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.setAttribute('data-date', `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

        const dayDate = new Date(year, month, day);

        // Mark today
        if (dayDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }

        // Mark past dates as disabled
        if (dayDate < today && dayDate.toDateString() !== today.toDateString()) {
            dayElement.classList.add('disabled');
            dayElement.disabled = true;
        } else {
            dayElement.classList.add('available');
            dayElement.addEventListener('click', function () {
                selectDate(this.getAttribute('data-date'));
            });
        }

        grid.appendChild(dayElement);
    }
}

function selectDate(dateString) {
    AppointmentsState.selectedDate = dateString;

    // Update visual selection
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });
    document.querySelector(`[data-date="${dateString}"]`)?.classList.add('selected');

    // Update selected date display
    const display = document.getElementById('selectedDateDisplay');
    if (display) {
        display.textContent = `Selected: ${Utils.formatDate(dateString)}`;
    }

    // Load available time slots for selected date
    loadTimeSlots(dateString);

    // Enable confirm button
    updateBookingButtonState();
}

function loadTimeSlots(date) {
    // Simulate loading available slots
    // In production, this would fetch from backend
    Utils.showToast('Loading available time slots...', 'info');
}

// ===================================
// 7. TIME SLOT BOOKING
// ===================================

function initializeTimeSlots() {
    const timeSlots = document.querySelectorAll('.time-slot.available');

    timeSlots.forEach(slot => {
        slot.addEventListener('click', function () {
            if (!AppointmentsState.selectedDate) {
                Utils.showToast('Please select a date first', 'warning');
                return;
            }

            selectTimeSlot(this);
        });
    });
}

function selectTimeSlot(slotElement) {
    const time = slotElement.getAttribute('data-time');
    AppointmentsState.selectedTime = time;

    // Update visual selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    slotElement.classList.add('selected');

    updateBookingButtonState();
}

function updateBookingButtonState() {
    const confirmBtn = document.getElementById('confirmBooking');
    if (confirmBtn) {
        const isEnabled = AppointmentsState.selectedDate && AppointmentsState.selectedTime;
        confirmBtn.disabled = !isEnabled;
    }
}

function openBookingModal(clinicId) {
    const clinic = clinicData.find(c => c.id === clinicId);
    if (!clinic) return;

    AppointmentsState.selectedClinic = clinic;

    // Update modal with clinic info
    document.getElementById('selectedClinic').textContent = clinic.name;
    document.getElementById('selectedPatient').textContent =
        `${AppointmentsState.currentUser.name} (${AppointmentsState.currentUser.relationship})`;

    // Reset selections
    AppointmentsState.selectedDate = null;
    AppointmentsState.selectedTime = null;
    document.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('selected'));
    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));

    // Initialize calendar
    initializeCalendar();
    initializeTimeSlots();

    Utils.openModal('timeSlotModal');
}

function initializeBookingConfirmation() {
    const confirmBtn = document.getElementById('confirmBooking');
    const finalConfirmBtn = document.getElementById('finalConfirmBooking');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', showBookingConfirmation);
    }

    if (finalConfirmBtn) {
        finalConfirmBtn.addEventListener('click', finalizeBooking);
    }
}

function showBookingConfirmation() {
    if (!AppointmentsState.selectedDate || !AppointmentsState.selectedTime) {
        Utils.showToast('Please select date and time', 'error');
        return;
    }

    const serviceType = document.getElementById('serviceType')?.value || 'consultation';
    const doctorRadio = document.querySelector('input[name="doctor"]:checked');
    const doctorId = doctorRadio ? parseInt(doctorRadio.value) : 1;

    const doctor = AppointmentsState.selectedClinic.doctors.find(d => d.id === doctorId);

    // Update confirmation modal
    document.getElementById('confirmClinicName').textContent = AppointmentsState.selectedClinic.name;
    document.getElementById('confirmDoctorName').textContent = doctor.name;
    document.getElementById('confirmSpecialty').textContent = doctor.specialty;
    document.getElementById('confirmDateTime').textContent =
        `${Utils.formatDate(AppointmentsState.selectedDate)} at ${formatTime(AppointmentsState.selectedTime)}`;
    document.getElementById('confirmPatientName').textContent =
        `${AppointmentsState.currentUser.name} (${AppointmentsState.currentUser.relationship})`;
    document.getElementById('confirmServiceType').textContent =
        serviceType.charAt(0).toUpperCase() + serviceType.slice(1);

    Utils.closeModal('timeSlotModal');
    Utils.openModal('bookingConfirmationModal');
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${minutes || '00'} ${ampm}`;
}

function finalizeBooking() {
    // Simulate booking process
    Utils.closeModal('bookingConfirmationModal');

    Utils.showToast('Processing your appointment...', 'info');

    setTimeout(() => {
        const bookingRef = `APT-2025-${Math.floor(Math.random() * 900000 + 100000)}`;

        Utils.showToast(`Appointment booked successfully! Reference: ${bookingRef}`, 'success');

        setTimeout(() => {
            Utils.showToast('Confirmation sent via SMS and Email', 'info');
        }, 1000);

        // Reset state
        AppointmentsState.selectedClinic = null;
        AppointmentsState.selectedDate = null;
        AppointmentsState.selectedTime = null;

        // Refresh appointments list
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }, 1500);
}

// ===================================
// 8. APPOINTMENT HISTORY MANAGEMENT
// ===================================

function initializeHistoryTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`)?.classList.add('active');
}

function initializeHistoryFilters() {
    const filterBtn = document.getElementById('historyFilterBtn');
    const applyFiltersBtn = document.getElementById('applyHistoryFilters');
    const clearFiltersBtn = document.getElementById('clearHistoryFilters');

    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            Utils.openModal('historyFilterModal');
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyHistoryFilters);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearHistoryFilters);
    }

    // Quick date range buttons
    document.querySelectorAll('.quick-range-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const range = this.getAttribute('data-range');
            setQuickDateRange(range);
        });
    });
}

function setQuickDateRange(range) {
    const today = new Date();
    let startDate, endDate = today;

    switch (range) {
        case 'week':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 1);
            break;
        case 'year':
            startDate = new Date(today);
            startDate.setFullYear(today.getFullYear() - 1);
            break;
    }

    document.getElementById('filterStartDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('filterEndDate').value = endDate.toISOString().split('T')[0];
}

function applyHistoryFilters() {
    const startDate = document.getElementById('filterStartDate')?.value;
    const endDate = document.getElementById('filterEndDate')?.value;
    const patient = document.getElementById('filterPatient')?.value;
    const provider = document.getElementById('filterProvider')?.value;
    const status = document.getElementById('filterStatus')?.value;

    Utils.closeModal('historyFilterModal');
    Utils.showToast('Applying filters...', 'info');

    // Simulate filtering
    setTimeout(() => {
        Utils.showToast('Appointments filtered successfully', 'success');
    }, 500);
}

function clearHistoryFilters() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterPatient').value = 'all';
    document.getElementById('filterProvider').value = 'all';
    document.getElementById('filterStatus').value = 'all';

    Utils.showToast('Filters cleared', 'info');
}

// ===================================
// 9. APPOINTMENT ACTIONS
// ===================================

function initializeAppointmentActions() {
    // View details
    document.querySelectorAll('.action-btn.view-details').forEach(btn => {
        btn.addEventListener('click', function () {
            const appointmentId = this.getAttribute('data-appointment-id');
            viewAppointmentDetails(appointmentId);
        });
    });

    // Reschedule
    document.querySelectorAll('.action-btn.reschedule').forEach(btn => {
        btn.addEventListener('click', function () {
            const appointmentId = this.getAttribute('data-appointment-id');
            openRescheduleModal(appointmentId);
        });
    });

    // Cancel
    document.querySelectorAll('.action-btn.cancel').forEach(btn => {
        btn.addEventListener('click', function () {
            const appointmentId = this.getAttribute('data-appointment-id');
            openCancelModal(appointmentId);
        });
    });

    // Rebook
    document.querySelectorAll('.action-btn.rebook').forEach(btn => {
        btn.addEventListener('click', function () {
            Utils.showToast('Opening booking form...', 'info');
            document.getElementById('bookNewBtn')?.click();
        });
    });

    // View records
    document.querySelectorAll('.action-btn.view-records').forEach(btn => {
        btn.addEventListener('click', function () {
            window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Patient\\My Health Care\\my_health_care.html';
        });
    });
}

function viewAppointmentDetails(appointmentId) {
    AppointmentsState.currentAppointmentId = appointmentId;
    Utils.openModal('appointmentDetailsModal');
}

function openRescheduleModal(appointmentId) {
    AppointmentsState.currentAppointmentId = appointmentId;

    // Check if within cancellation window
    const appointmentDate = '2025-10-15T10:00:00';

    if (!Utils.canCancelAppointment(appointmentDate)) {
        Utils.showToast('Cannot reschedule less than 24 hours before appointment', 'error');
        return;
    }

    // Reset form
    document.getElementById('rescheduleDate').value = '';
    document.querySelectorAll('#rescheduleModal .time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    Utils.openModal('rescheduleModal');
}

function initializeReschedule() {
    const rescheduleDate = document.getElementById('rescheduleDate');
    const confirmBtn = document.getElementById('confirmReschedule');

    if (rescheduleDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        rescheduleDate.setAttribute('min', tomorrow.toISOString().split('T')[0]);

        rescheduleDate.addEventListener('change', function () {
            if (Utils.isFutureDate(this.value)) {
                // Enable time slots
                document.querySelectorAll('#rescheduleModal .time-slot').forEach(slot => {
                    slot.disabled = false;
                    slot.addEventListener('click', function () {
                        document.querySelectorAll('#rescheduleModal .time-slot').forEach(s => {
                            s.classList.remove('selected');
                        });
                        this.classList.add('selected');
                    });
                });
            }
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmReschedule);
    }
}

function confirmReschedule() {
    const newDate = document.getElementById('rescheduleDate')?.value;
    const selectedSlot = document.querySelector('#rescheduleModal .time-slot.selected');

    if (!newDate || !selectedSlot) {
        Utils.showToast('Please select date and time', 'error');
        return;
    }

    Utils.closeModal('rescheduleModal');
    Utils.showToast('Rescheduling appointment...', 'info');

    setTimeout(() => {
        Utils.showToast('Appointment rescheduled successfully', 'success');
        setTimeout(() => {
            Utils.showToast('Confirmation sent via SMS and Email', 'info');
        }, 1000);
    }, 1000);
}

function openCancelModal(appointmentId) {
    AppointmentsState.currentAppointmentId = appointmentId;

    // Check cancellation policy
    const appointmentDate = '2025-10-15T10:00:00';

    if (!Utils.canCancelAppointment(appointmentDate)) {
        Utils.showToast('Cannot cancel less than 24 hours before appointment', 'error');
        return;
    }

    // Reset form
    document.getElementById('cancellationReason').value = '';

    Utils.openModal('cancelModal');
}

function initializeCancellation() {
    const confirmBtn = document.getElementById('confirmCancel');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmCancellation);
    }
}

function confirmCancellation() {
    const reason = document.getElementById('cancellationReason')?.value;

    Utils.closeModal('cancelModal');
    Utils.showToast('Cancelling appointment...', 'info');

    setTimeout(() => {
        Utils.showToast('Appointment cancelled successfully', 'success');
        setTimeout(() => {
            Utils.showToast('Cancellation confirmation sent', 'info');
        }, 1000);

        // Remove appointment from list (simulate)
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }, 1000);
}

// ===================================
// 10. NOTIFICATION SETTINGS
// ===================================

function initializeNotificationSettings() {
    const settingsBtn = document.getElementById('notificationSettingsBtn');
    const saveBtn = document.getElementById('saveNotificationSettings');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            Utils.openModal('notificationSettingsModal');
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveNotificationSettings);
    }
}

function saveNotificationSettings() {
    const emailReminders = document.querySelector('#notificationSettingsModal input[type="checkbox"]:nth-of-type(1)').checked;
    const smsReminders = document.querySelector('#notificationSettingsModal input[type="checkbox"]:nth-of-type(2)').checked;
    const reminderTiming = document.getElementById('reminderTiming')?.value;
    const scope = document.querySelector('input[name="scope"]:checked')?.value;

    Utils.closeModal('notificationSettingsModal');
    Utils.showToast('Saving notification preferences...', 'info');

    setTimeout(() => {
        Utils.showToast('Notification settings saved successfully', 'success');
    }, 800);
}

// ===================================
// 11. QUICK ACTIONS
// ===================================

function initializeQuickActions() {
    const bookNewBtn = document.getElementById('bookNewBtn');
    const findDoctorBtn = document.getElementById('findDoctorBtn');
    const emergencyBookingBtn = document.getElementById('emergencyBookingBtn');

    if (bookNewBtn) {
        bookNewBtn.addEventListener('click', () => {
            // Scroll to search section
            document.querySelector('.search-section')?.scrollIntoView({ behavior: 'smooth' });
            Utils.showToast('Select a clinic to book an appointment', 'info');
        });
    }

    if (findDoctorBtn) {
        findDoctorBtn.addEventListener('click', () => {
            Utils.openModal('advancedSearchModal');
        });
    }

    if (emergencyBookingBtn) {
        emergencyBookingBtn.addEventListener('click', () => {
            Utils.showToast('Redirecting to emergency care...', 'info');
            setTimeout(() => {
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Patient\\Emergency Care\\emergency_care.html';
            }, 1000);
        });
    }
}

// ===================================
// 12. MODAL MANAGEMENT
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
// 13. DARK MODE TOGGLE
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
// 14. PROFILE DROPDOWN
// ===================================

function initializeProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');

    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            profileMenu.style.opacity = profileMenu.style.opacity === '1' ? '0' : '1';
            profileMenu.style.visibility = profileMenu.style.visibility === 'visible' ? 'hidden' : 'visible';
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
// 15. KEYBOARD SHORTCUTS
// ===================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            Utils.closeAllModals();
        }

        // Ctrl/Cmd + F for advanced search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('advancedSearchBtn')?.click();
        }
    });
}

// ===================================
// 16. SESSION MANAGEMENT
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
// 17. ERROR HANDLING
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
// 18. ANIMATION OBSERVERS
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

    document.querySelectorAll('.clinic-card, .appointment-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease-in-out';
        observer.observe(el);
    });
}

// ===================================
// 19. INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('Curis My Appointments initializing...');

    try {
        // Initialize all components
        initializeFamilySwitcher();
        initializeSearchFilters();
        initializeAdvancedSearch();
        initializeHistoryTabs();
        initializeHistoryFilters();
        initializeAppointmentActions();
        initializeReschedule();
        initializeCancellation();
        initializeBookingConfirmation();
        initializeNotificationSettings();
        initializeQuickActions();
        initializeModals();
        initializeDarkMode();
        initializeProfileDropdown();
        initializeKeyboardShortcuts();
        initializeSessionManagement();
        initializeErrorHandling();
        initializeAnimations();

        // Initial data load
        applyFilters();

        console.log('Curis My Appointments initialized successfully');

        setTimeout(() => {
            Utils.showToast('Welcome to My Appointments!', 'success');
        }, 500);

    } catch (error) {
        console.error('Initialization error:', error);
        Utils.showToast('Initialization error. Please refresh the page.', 'error');
    }
});

// ===================================
// 20. WINDOW RESIZE HANDLER
// ===================================

let resizeTimer;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        // Handle responsive adjustments
        if (window.innerWidth <= 768) {
            // Mobile adjustments
        }
    }, 250);
});

// ===================================
// 21. EXPORT FOR EXTERNAL ACCESS
// ===================================

window.CurisAppointments = {
    Utils,
    AppointmentsState,
    selectFamilyMember,
    applyFilters,
    openBookingModal
};
/* ===================================
   CURIS PATIENT DASHBOARD - JAVASCRIPT
   Modern Healthcare Platform
   =================================== */

// ===================================
// 1. GLOBAL STATE MANAGEMENT
// ===================================

const DashboardState = {
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
    currentAppointmentId: null,
    currentInvoiceId: null,
    selectedTimeSlot: null,
    selectedDate: null
};

// ===================================
// 2. UTILITY FUNCTIONS
// ===================================

const Utils = {
    // Get time-based greeting
    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    },

    // Format currency
    formatCurrency(amount) {
        return `KES ${amount.toLocaleString()}`;
    },

    // Show toast notification
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
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in-out';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    // Open modal
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // Validate date is in future
    isFutureDate(dateString) {
        const selectedDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
    },

    // Check if cancellation is within policy time limit (24 hours)
    canCancelAppointment(appointmentDate) {
        const apptDate = new Date(appointmentDate);
        const now = new Date();
        const hoursDiff = (apptDate - now) / (1000 * 60 * 60);
        return hoursDiff >= 24;
    }
};

// ===================================
// 3. GREETING INITIALIZATION
// ===================================

function initializeGreeting() {
    const greetingText = document.getElementById('greetingText');
    if (greetingText) {
        const greeting = Utils.getTimeBasedGreeting();
        const firstName = DashboardState.currentUser.name.split(' ')[0];
        greetingText.textContent = `${greeting}, ${firstName}!`;
    }
}

// ===================================
// 4. FAMILY PROFILE SWITCHER
// ===================================

function initializeFamilySwitcher() {
    const profileSelector = document.getElementById('profileSelector');
    const familyModal = document.getElementById('familyModal');
    const familyMembers = document.querySelectorAll('.family-member');
    
    // Open family modal
    if (profileSelector) {
        profileSelector.addEventListener('click', () => {
            Utils.openModal('familyModal');
        });
    }
    
    // Handle family member selection
    familyMembers.forEach(member => {
        member.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member-id');
            selectFamilyMember(memberId);
        });
    });
}

function selectFamilyMember(memberId) {
    // Find selected family member
    const member = DashboardState.familyMembers.find(m => m.id === memberId);
    if (!member) return;
    
    // Update current user
    DashboardState.currentUser = member;
    
    // Update UI
    updateProfileDisplay();
    
    // Update active state in modal
    document.querySelectorAll('.family-member').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`[data-member-id="${memberId}"]`).classList.add('active');
    
    // Refresh all dashboard widgets
    refreshDashboardData();
    
    // Close modal
    Utils.closeModal('familyModal');
    
    // Show success toast
    Utils.showToast(`Switched to ${member.name}'s profile`, 'success');
}

function updateProfileDisplay() {
    const profileName = document.querySelector('.profile-name');
    const profileAvatar = document.querySelector('.profile-avatar');
    const greetingText = document.getElementById('greetingText');
    
    if (profileName) {
        const relationship = DashboardState.currentUser.relationship === 'Self' 
            ? 'Self' 
            : `${DashboardState.currentUser.relationship}`;
        profileName.textContent = `${DashboardState.currentUser.name} (${relationship})`;
    }
    
    if (profileAvatar) {
        profileAvatar.src = DashboardState.currentUser.avatar;
    }
    
    if (greetingText) {
        const greeting = Utils.getTimeBasedGreeting();
        const firstName = DashboardState.currentUser.name.split(' ')[0];
        greetingText.textContent = `${greeting}, ${firstName}!`;
    }
}

function refreshDashboardData() {
    // Simulate data refresh for selected family member
    // In production, this would fetch data from the backend
    
    Utils.showToast('Dashboard data refreshed', 'info');
    
    // You would typically call:
    // - refreshAppointments()
    // - refreshPrescriptions()
    // - refreshInvoices()
    // - refreshMessages()
}

// ===================================
// 5. APPOINTMENT MANAGEMENT
// ===================================

function initializeAppointments() {
    // Reschedule buttons
    document.querySelectorAll('.action-btn.reschedule').forEach(btn => {
        btn.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-appointment-id');
            openRescheduleModal(appointmentId);
        });
    });
    
    // Cancel buttons
    document.querySelectorAll('.action-btn.cancel').forEach(btn => {
        btn.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-appointment-id');
            openCancelModal(appointmentId);
        });
    });
    
    // Confirm reschedule
    const confirmRescheduleBtn = document.getElementById('confirmReschedule');
    if (confirmRescheduleBtn) {
        confirmRescheduleBtn.addEventListener('click', confirmReschedule);
    }
    
    // Confirm cancel
    const confirmCancelBtn = document.getElementById('confirmCancel');
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', confirmCancel);
    }
    
    // Time slot selection
    initializeTimeSlots();
}

function openRescheduleModal(appointmentId) {
    DashboardState.currentAppointmentId = appointmentId;
    
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    
    const dateInput = document.getElementById('newDate');
    if (dateInput) {
        dateInput.setAttribute('min', minDate);
        dateInput.value = '';
    }
    
    // Reset time slot selection
    DashboardState.selectedTimeSlot = null;
    DashboardState.selectedDate = null;
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    Utils.openModal('rescheduleModal');
}

function initializeTimeSlots() {
    const dateInput = document.getElementById('newDate');
    const timeSlots = document.querySelectorAll('.time-slot');
    
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            if (Utils.isFutureDate(this.value)) {
                DashboardState.selectedDate = this.value;
                // Enable time slots
                timeSlots.forEach(slot => slot.disabled = false);
            } else {
                Utils.showToast('Please select a future date', 'warning');
                this.value = '';
            }
        });
    }
    
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            if (!DashboardState.selectedDate) {
                Utils.showToast('Please select a date first', 'warning');
                return;
            }
            
            // Remove previous selection
            timeSlots.forEach(s => s.classList.remove('selected'));
            
            // Add selection to clicked slot
            this.classList.add('selected');
            DashboardState.selectedTimeSlot = this.textContent.trim();
        });
    });
}

function confirmReschedule() {
    if (!DashboardState.selectedDate) {
        Utils.showToast('Please select a date', 'error');
        return;
    }
    
    if (!DashboardState.selectedTimeSlot) {
        Utils.showToast('Please select a time slot', 'error');
        return;
    }
    
    // In production, send data to backend
    // For now, simulate success
    
    Utils.closeModal('rescheduleModal');
    Utils.showToast(`Appointment rescheduled to ${DashboardState.selectedDate} at ${DashboardState.selectedTimeSlot}`, 'success');
    
    // Simulate sending confirmation email/SMS
    setTimeout(() => {
        Utils.showToast('Confirmation sent via email and SMS', 'info');
    }, 1000);
    
    // Reset state
    DashboardState.selectedDate = null;
    DashboardState.selectedTimeSlot = null;
}

function openCancelModal(appointmentId) {
    DashboardState.currentAppointmentId = appointmentId;
    
    // Check cancellation policy (24 hours before)
    // For demo, we'll use October 15, 2025 10:00 AM
    const appointmentDate = '2025-10-15T10:00:00';
    
    if (!Utils.canCancelAppointment(appointmentDate)) {
        Utils.showToast('Cancellation not permitted less than 24 hours before appointment', 'error');
        return;
    }
    
    Utils.openModal('cancelModal');
}

function confirmCancel() {
    // In production, send cancellation request to backend
    
    Utils.closeModal('cancelModal');
    Utils.showToast('Appointment cancelled successfully', 'success');
    
    // Simulate sending notifications
    setTimeout(() => {
        Utils.showToast('Cancellation confirmation sent', 'info');
    }, 1000);
    
    // Remove appointment from UI (in production, refresh from backend)
    // For demo purposes only
}

// ===================================
// 6. PRESCRIPTION MANAGEMENT
// ===================================

function initializePrescriptions() {
    // View details buttons
    document.querySelectorAll('.prescription-actions .view-details').forEach(btn => {
        btn.addEventListener('click', function() {
            // Redirect to My Health Care page - Prescriptions section
            Utils.showToast('Redirecting to prescription details...', 'info');
            // window.location.href = 'path/to/my_health_care.html#prescriptions';
        });
    });
    
    // Refill request buttons
    document.querySelectorAll('.prescription-actions .refill-request').forEach(btn => {
        btn.addEventListener('click', function() {
            handleRefillRequest(this);
        });
    });
}

function handleRefillRequest(button) {
    const prescriptionCard = button.closest('.prescription-card');
    const medicationName = prescriptionCard.querySelector('.prescription-title').textContent;
    
    // In production, open refill modal or send request to backend
    Utils.showToast(`Refill request sent for ${medicationName}`, 'success');
    
    setTimeout(() => {
        Utils.showToast('Doctor will be notified of your refill request', 'info');
    }, 1000);
}

// ===================================
// 7. INVOICE MANAGEMENT
// ===================================

function initializeInvoices() {
    // View invoice buttons
    document.querySelectorAll('.view-invoice').forEach(btn => {
        btn.addEventListener('click', function() {
            const invoiceId = this.getAttribute('data-invoice-id');
            openInvoiceModal(invoiceId);
        });
    });
    
    // Pay now buttons
    document.querySelectorAll('.pay-now').forEach(btn => {
        btn.addEventListener('click', function() {
            const invoiceId = this.getAttribute('data-invoice-id');
            openPaymentModal(invoiceId);
        });
    });
    
    // Download invoice button
    const downloadBtn = document.getElementById('downloadInvoice');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadInvoicePDF);
    }
    
    // Submit payment button
    const submitPaymentBtn = document.getElementById('submitPayment');
    if (submitPaymentBtn) {
        submitPaymentBtn.addEventListener('click', submitPaymentProof);
    }
}

function openInvoiceModal(invoiceId) {
    DashboardState.currentInvoiceId = invoiceId;
    Utils.openModal('invoiceModal');
}

function openPaymentModal(invoiceId) {
    DashboardState.currentInvoiceId = invoiceId;
    
    // Close invoice modal if open
    Utils.closeModal('invoiceModal');
    
    // Reset form
    const form = document.getElementById('paymentForm');
    if (form) form.reset();
    
    Utils.openModal('paymentModal');
}

function downloadInvoicePDF() {
    // In production, generate and download PDF from backend
    Utils.showToast('Downloading invoice PDF...', 'info');
    
    setTimeout(() => {
        Utils.showToast('Invoice downloaded successfully', 'success');
    }, 1500);
}

function submitPaymentProof() {
    const form = document.getElementById('paymentForm');
    if (!form) return;
    
    // Validate form
    const paymentMethod = document.getElementById('paymentMethod').value;
    const transactionCode = document.getElementById('transactionCode').value;
    const receiptUpload = document.getElementById('receiptUpload').files[0];
    
    if (!paymentMethod) {
        Utils.showToast('Please select a payment method', 'error');
        return;
    }
    
    if (!transactionCode.trim()) {
        Utils.showToast('Please enter transaction reference number', 'error');
        return;
    }
    
    if (!receiptUpload) {
        Utils.showToast('Please upload payment receipt', 'error');
        return;
    }
    
    // Check file size (max 5MB)
    if (receiptUpload.size > 5 * 1024 * 1024) {
        Utils.showToast('File size must not exceed 5MB', 'error');
        return;
    }
    
    // In production, send form data to backend
    Utils.closeModal('paymentModal');
    Utils.showToast('Payment proof submitted for review', 'success');
    
    setTimeout(() => {
        Utils.showToast('Clinic has been notified. You will receive confirmation once verified.', 'info');
    }, 1500);
    
    // Reset form
    form.reset();
}

// ===================================
// 8. NOTIFICATION BANNER
// ===================================

function initializeNotifications() {
    const closeButtons = document.querySelectorAll('.close-notification');
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const notificationItem = this.closest('.notification-item');
            if (notificationItem) {
                notificationItem.style.animation = 'fadeOut 0.3s ease-in-out';
                setTimeout(() => {
                    notificationItem.remove();
                    
                    // Hide banner if no notifications left
                    const banner = document.getElementById('notificationsBanner');
                    if (banner && banner.querySelectorAll('.notification-item').length === 0) {
                        banner.style.display = 'none';
                    }
                }, 300);
            }
        });
    });
}

// ===================================
// 9. MODAL MANAGEMENT
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
// 10. DARK MODE TOGGLE
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
// 11. PROFILE DROPDOWN
// ===================================

function initializeProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileBtn && profileMenu) {
        // Toggle dropdown on click (for mobile/touch devices)
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileMenu.style.opacity = profileMenu.style.opacity === '1' ? '0' : '1';
            profileMenu.style.visibility = profileMenu.style.visibility === 'visible' ? 'hidden' : 'visible';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.style.opacity = '0';
                profileMenu.style.visibility = 'hidden';
            }
        });
    }
}

// ===================================
// 12. FORM VALIDATION
// ===================================

function initializeFormValidation() {
    // Payment method change event
    const paymentMethod = document.getElementById('paymentMethod');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', function() {
            const transactionLabel = document.querySelector('label[for="transactionCode"]');
            if (transactionLabel) {
                if (this.value === 'mpesa') {
                    transactionLabel.textContent = 'M-Pesa Transaction Code';
                } else if (this.value === 'bank') {
                    transactionLabel.textContent = 'Bank Reference Number';
                } else {
                    transactionLabel.textContent = 'Transaction Reference Number';
                }
            }
        });
    }
    
    // File upload preview
    const receiptUpload = document.getElementById('receiptUpload');
    if (receiptUpload) {
        receiptUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const fileName = this.files[0].name;
                const fileSize = (this.files[0].size / 1024 / 1024).toFixed(2);
                Utils.showToast(`Selected: ${fileName} (${fileSize}MB)`, 'info');
            }
        });
    }
}

// ===================================
// 13. SESSION MANAGEMENT
// ===================================

function initializeSessionManagement() {
    let inactivityTimer;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
    
    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            Utils.showToast('Session expired due to inactivity', 'warning');
            setTimeout(() => {
                // Redirect to login page
                // window.location.href = 'path/to/landing_page.html';
            }, 2000);
        }, INACTIVITY_LIMIT);
    }
    
    // Reset timer on user activity
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });
    
    // Initialize timer
    resetTimer();
}

// ===================================
// 14. KEYBOARD SHORTCUTS
// ===================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });
}

// ===================================
// 15. RESPONSIVE MENU TOGGLE
// ===================================

function initializeResponsiveMenu() {
    // Add hamburger menu for mobile (if needed)
    const sidebar = document.querySelector('.sidebar');
    
    // Create mobile menu toggle if on small screen
    if (window.innerWidth <= 768) {
        // Add toggle button logic here if needed
    }
}

// ===================================
// 16. ANIMATION OBSERVERS
// ===================================

function initializeAnimations() {
    // Intersection Observer for fade-in animations
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
    
    // Observe dashboard widgets
    document.querySelectorAll('.dashboard-widget, .quick-nav-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease-in-out';
        observer.observe(el);
    });
}

// ===================================
// 17. ERROR HANDLING
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
// 18. INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Curis Patient Dashboard initializing...');
    
    try {
        // Initialize all components
        initializeGreeting();
        initializeFamilySwitcher();
        initializeAppointments();
        initializePrescriptions();
        initializeInvoices();
        initializeNotifications();
        initializeModals();
        initializeDarkMode();
        initializeProfileDropdown();
        initializeFormValidation();
        initializeSessionManagement();
        initializeKeyboardShortcuts();
        initializeResponsiveMenu();
        initializeAnimations();
        initializeErrorHandling();
        
        console.log('Curis Patient Dashboard initialized successfully');
        
        // Show welcome message
        setTimeout(() => {
            Utils.showToast('Welcome to your health dashboard!', 'success');
        }, 500);
        
    } catch (error) {
        console.error('Initialization error:', error);
        Utils.showToast('Dashboard initialization error. Please refresh the page.', 'error');
    }
});

// ===================================
// 19. WINDOW RESIZE HANDLER
// ===================================

let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        initializeResponsiveMenu();
    }, 250);
});

// ===================================
// 20. EXPORT FOR TESTING (Optional)
// ===================================

// Expose utilities for external access if needed
window.CurisDashboard = {
    Utils,
    DashboardState,
    selectFamilyMember,
    refreshDashboardData
};
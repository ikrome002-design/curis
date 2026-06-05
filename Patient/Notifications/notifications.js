/* ===================================
   CURIS NOTIFICATIONS - JAVASCRIPT
   Modern Healthcare Platform
   =================================== */

// ===================================
// 1. GLOBAL STATE MANAGEMENT
// ===================================

const NotificationsState = {
    currentUser: {
        id: 'self',
        name: 'John Kamau',
        relationship: 'Self',
        age: 45
    },
    familyMembers: [
        {
            id: 'self',
            name: 'John Kamau',
            relationship: 'Self',
            age: 45
        },
        {
            id: 'spouse',
            name: 'Jane Kamau',
            relationship: 'Spouse',
            age: 42
        },
        {
            id: 'daughter',
            name: 'Mary Kamau',
            relationship: 'Daughter',
            age: 12
        },
        {
            id: 'son',
            name: 'David Kamau',
            relationship: 'Son',
            age: 8
        }
    ],
    notifications: [],
    filteredNotifications: [],
    filters: {
        category: 'all',
        timeRange: 'today',
        priority: null,
        status: 'all',
        familyMember: 'all',
        customStartDate: null,
        customEndDate: null
    },
    preferences: {
        channels: {
            inApp: true,
            email: true,
            sms: true,
            whatsApp: false,
            push: true
        },
        frequency: 'immediate',
        doNotDisturb: {
            enabled: false,
            startTime: '22:00',
            endTime: '07:00'
        },
        contentTypes: {
            appointments: true,
            medical: true,
            billing: true,
            emergency: true,
            insurance: true,
            marketing: false
        }
    },
    autoRefreshInterval: null,
    unreadCount: 12
};

// Mock notification data
const mockNotifications = [
    {
        id: 1,
        category: 'emergency',
        priority: 'emergency',
        title: 'Abnormal Test Results - Immediate Attention Required',
        message: 'Your recent blood test results show abnormal values that require immediate medical attention. Please contact Dr. Sarah Wanjiru urgently.',
        patient: 'self',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        details: {
            doctor: 'Dr. Sarah Wanjiru',
            specialty: 'General Practice',
            clinic: 'Nairobi Health Center',
            phone: '+254 700 123 456'
        }
    },
    {
        id: 2,
        category: 'appointments',
        priority: 'high',
        title: 'Appointment Reminder - Tomorrow at 10:00 AM',
        message: 'You have a general consultation scheduled for tomorrow, October 5, 2025 at 10:00 AM.',
        patient: 'self',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: false,
        details: {
            doctor: 'Dr. Sarah Wanjiru',
            clinic: 'Nairobi Health Center - Westlands',
            type: 'In-Person Visit',
            date: 'October 5, 2025',
            time: '10:00 AM'
        }
    },
    {
        id: 3,
        category: 'medical',
        priority: 'high',
        title: 'New Lab Results Available',
        message: 'Complete Blood Count (CBC) test results for Mary Kamau are now available for review.',
        patient: 'daughter',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        details: {
            testType: 'Complete Blood Count (CBC)',
            status: 'Normal',
            patient: 'Mary Kamau'
        }
    },
    {
        id: 4,
        category: 'billing',
        priority: 'normal',
        title: 'Payment Verified - Receipt Available',
        message: 'Your payment of KES. 12,500 for Invoice #INV-2025-001234 has been verified and processed successfully.',
        patient: 'self',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        read: true,
        details: {
            amount: 'KES. 12,500',
            invoice: 'INV-2025-001234',
            transaction: 'QGH7X8Y9Z0',
            clinic: 'Nairobi Health Center'
        }
    },
    {
        id: 5,
        category: 'billing',
        priority: 'high',
        title: 'New Invoice Generated - Payment Due',
        message: 'A new invoice has been generated for Jane Kamau\'s recent consultation at Westlands Medical Clinic.',
        patient: 'spouse',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        read: false,
        details: {
            invoice: 'INV-2025-001567',
            amount: 'KES. 8,750',
            dueDate: 'October 19, 2025',
            patient: 'Jane Kamau',
            clinic: 'Westlands Medical Clinic'
        }
    },
    {
        id: 6,
        category: 'medical',
        priority: 'normal',
        title: 'New Prescription Added',
        message: 'Dr. Sarah Wanjiru has prescribed Amoxicillin 500mg for your recent consultation.',
        patient: 'self',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: false,
        details: {
            medication: 'Amoxicillin 500mg',
            dosage: 'Take 1 capsule three times daily after meals',
            duration: '7 days',
            doctor: 'Dr. Sarah Wanjiru'
        }
    },
    {
        id: 7,
        category: 'appointments',
        priority: 'normal',
        title: 'Appointment Confirmed',
        message: 'Your appointment booking for David Kamau has been confirmed successfully.',
        patient: 'son',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: true,
        details: {
            reference: 'APT-2025-456789',
            date: 'October 8, 2025',
            time: '2:00 PM',
            doctor: 'Dr. James Omondi',
            specialty: 'Pediatrics',
            patient: 'David Kamau'
        }
    },
    {
        id: 8,
        category: 'insurance',
        priority: 'normal',
        title: 'Insurance Claim Approved',
        message: 'Your insurance claim for recent medical consultation has been approved.',
        patient: 'self',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: false,
        details: {
            claimNumber: 'CLM-2025-789012',
            approvedAmount: 'KES. 10,000',
            provider: 'AAR Health Insurance'
        }
    },
    {
        id: 9,
        category: 'emergency',
        priority: 'high',
        title: 'Public Health Advisory - Dengue Fever Alert',
        message: 'The Ministry of Health has issued an alert regarding increased dengue fever cases in Nairobi County. Take necessary precautions and seek medical attention if symptoms develop.',
        patient: 'all',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        read: true
    },
    {
        id: 10,
        category: 'system',
        priority: 'normal',
        title: 'Security Alert - New Device Login',
        message: 'Your account was accessed from a new device. If this wasn\'t you, please secure your account immediately.',
        patient: 'self',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        read: true,
        details: {
            device: 'iPhone 13 Pro',
            location: 'Nairobi, Kenya',
            time: 'October 1, 2025 at 9:30 AM'
        }
    },
    {
        id: 11,
        category: 'appointments',
        priority: 'high',
        title: 'Appointment Cancelled by Clinic',
        message: 'Your appointment scheduled for October 3, 2025 has been cancelled due to doctor unavailability.',
        patient: 'daughter',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        read: true,
        details: {
            reason: 'Doctor emergency leave',
            clinic: 'Karen Medical Centre',
            patient: 'Mary Kamau'
        }
    },
    {
        id: 12,
        category: 'system',
        priority: 'low',
        title: 'Profile Information Updated',
        message: 'Your profile information has been successfully updated. Changes include contact phone number.',
        patient: 'self',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        read: true
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

    formatTimestamp(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        const weeks = Math.floor(diff / 604800000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        
        return timestamp.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    },

    getPatientName(patientId) {
        if (patientId === 'all') return 'All Family Members';
        const member = NotificationsState.familyMembers.find(m => m.id === patientId);
        return member ? `${member.name} (${member.relationship})` : 'Unknown';
    },

    getCategoryIcon(category) {
        const icons = {
            appointments: 'fa-calendar-check',
            medical: 'fa-flask',
            billing: 'fa-check-circle',
            emergency: 'fa-triangle-exclamation',
            insurance: 'fa-shield-heart',
            system: 'fa-lock'
        };
        return icons[category] || 'fa-bell';
    },

    updateNotificationCount() {
        const unreadCount = NotificationsState.notifications.filter(n => !n.read).length;
        NotificationsState.unreadCount = unreadCount;
        
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = unreadCount;
            if (unreadCount === 0) {
                badge.style.display = 'none';
            } else {
                badge.style.display = 'block';
            }
        }
    },

    updateOverviewCards() {
        const unreadUrgent = NotificationsState.notifications.filter(
            n => !n.read && (n.priority === 'emergency' || n.priority === 'high')
        ).length;
        
        const appointmentAlerts = NotificationsState.notifications.filter(
            n => n.category === 'appointments'
        ).length;
        
        const medicalUpdates = NotificationsState.notifications.filter(
            n => n.category === 'medical'
        ).length;
        
        const billingNotices = NotificationsState.notifications.filter(
            n => n.category === 'billing'
        ).length;

        const overviewCards = document.querySelectorAll('.overview-card .stat-number');
        if (overviewCards.length >= 4) {
            overviewCards[0].textContent = unreadUrgent;
            overviewCards[1].textContent = appointmentAlerts;
            overviewCards[2].textContent = medicalUpdates;
            overviewCards[3].textContent = billingNotices;
        }
    }
};

// ===================================
// 3. NOTIFICATION FEED MANAGEMENT
// ===================================

function initializeNotifications() {
    NotificationsState.notifications = [...mockNotifications];
    NotificationsState.filteredNotifications = [...mockNotifications];
    
    renderNotificationFeed();
    Utils.updateNotificationCount();
    Utils.updateOverviewCards();
    
    // Start auto-refresh
    startAutoRefresh();
}

function renderNotificationFeed() {
    const feedContent = document.getElementById('feedContent');
    const feedCount = document.getElementById('feedCount');
    const emptyState = document.getElementById('emptyState');
    
    if (!feedContent) return;

    const notifications = NotificationsState.filteredNotifications;
    
    if (notifications.length === 0) {
        feedContent.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        if (feedCount) feedCount.textContent = '0 notifications';
        return;
    }

    feedContent.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    if (feedCount) {
        feedCount.textContent = `${notifications.length} notification${notifications.length > 1 ? 's' : ''}`;
    }

    feedContent.innerHTML = notifications.map(notification => 
        createNotificationCard(notification)
    ).join('');

    // Attach event listeners
    attachNotificationEventListeners();
}

function createNotificationCard(notification) {
    const categoryClass = notification.category;
    const priorityClass = notification.priority;
    const readClass = notification.read ? 'read' : 'unread';
    const patientName = Utils.getPatientName(notification.patient);
    const icon = Utils.getCategoryIcon(notification.category);
    
    return `
        <div class="notification-card ${categoryClass} ${readClass}" 
             data-notification-id="${notification.id}"
             data-category="${notification.category}"
             data-priority="${notification.priority}">
            <div class="notification-indicator ${priorityClass}"></div>
            <div class="notification-header">
                <div class="notification-icon ${categoryClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="notification-meta">
                    <h3 class="notification-title">${notification.title}</h3>
                    <div class="notification-info">
                        <span class="notification-category">
                            <i class="fas fa-tag"></i>
                            ${notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}
                        </span>
                        <span class="notification-time">
                            <i class="fas fa-clock"></i>
                            ${Utils.formatTimestamp(notification.timestamp)}
                        </span>
                        <span class="notification-patient">
                            <i class="fas fa-user"></i>
                            ${patientName}
                        </span>
                    </div>
                </div>
                <div class="notification-actions">
                    <button class="action-icon-btn mark-read-btn" 
                            data-notification-id="${notification.id}"
                            title="${notification.read ? 'Mark as unread' : 'Mark as read'}">
                        <i class="fas ${notification.read ? 'fa-envelope' : 'fa-check'}"></i>
                    </button>
                    <button class="action-icon-btn delete-btn" 
                            data-notification-id="${notification.id}"
                            title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="notification-body">
                <p class="notification-message">${notification.message}</p>
                ${notification.details ? createNotificationDetails(notification) : ''}
            </div>
            ${createNotificationFooter(notification)}
        </div>
    `;
}

function createNotificationDetails(notification) {
    if (!notification.details) return '';
    
    const details = notification.details;
    let html = '<div class="notification-details">';
    
    for (const [key, value] of Object.entries(details)) {
        const iconMap = {
            doctor: 'fa-user-doctor',
            specialty: 'fa-stethoscope',
            clinic: 'fa-hospital',
            phone: 'fa-phone',
            amount: 'fa-money-bill',
            invoice: 'fa-hashtag',
            transaction: 'fa-hashtag',
            reference: 'fa-hashtag',
            date: 'fa-calendar',
            time: 'fa-clock',
            device: 'fa-mobile-screen',
            location: 'fa-location-dot',
            claimNumber: 'fa-hashtag',
            provider: 'fa-building'
        };
        
        const icon = iconMap[key] || 'fa-info-circle';
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        
        html += `
            <div class="detail-item">
                <i class="fas ${icon}"></i>
                <span>${value}</span>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

function createNotificationFooter(notification) {
    const buttons = {
        emergency: [
            { text: 'View Test Results', icon: 'fa-file-medical', class: 'btn-primary btn-sm' },
            { text: 'Call Doctor Now', icon: 'fa-phone', class: 'btn-danger btn-sm' }
        ],
        appointments: [
            { text: 'Add to Calendar', icon: 'fa-calendar-plus', class: 'btn-primary btn-sm' },
            { text: 'Reschedule', icon: 'fa-calendar', class: 'btn-secondary btn-sm' }
        ],
        medical: [
            { text: 'View Full Report', icon: 'fa-file-medical', class: 'btn-primary btn-sm' },
            { text: 'Download PDF', icon: 'fa-download', class: 'btn-secondary btn-sm' }
        ],
        billing: [
            { text: 'Pay Now', icon: 'fa-credit-card', class: 'btn-primary btn-sm' },
            { text: 'View Invoice', icon: 'fa-file-invoice', class: 'btn-secondary btn-sm' }
        ],
        insurance: [
            { text: 'View Claim Details', icon: 'fa-file-invoice', class: 'btn-primary btn-sm' },
            { text: 'Download Report', icon: 'fa-download', class: 'btn-secondary btn-sm' }
        ],
        system: [
            { text: 'This Was Me', icon: 'fa-check', class: 'btn-primary btn-sm' },
            { text: 'Secure Account', icon: 'fa-shield', class: 'btn-danger btn-sm' }
        ]
    };

    const categoryButtons = buttons[notification.category] || [];
    
    if (categoryButtons.length === 0) return '';
    
    return `
        <div class="notification-footer">
            ${categoryButtons.map(btn => `
                <button class="${btn.class}">
                    <i class="fas ${btn.icon}"></i>
                    ${btn.text}
                </button>
            `).join('')}
        </div>
    `;
}

function attachNotificationEventListeners() {
    // Mark as read/unread buttons
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const notificationId = parseInt(this.getAttribute('data-notification-id'));
            toggleReadStatus(notificationId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const notificationId = parseInt(this.getAttribute('data-notification-id'));
            deleteNotification(notificationId);
        });
    });

    // Notification cards (click to view details)
    document.querySelectorAll('.notification-card').forEach(card => {
        card.addEventListener('click', function() {
            const notificationId = parseInt(this.getAttribute('data-notification-id'));
            viewNotificationDetails(notificationId);
        });
    });
}

function toggleReadStatus(notificationId) {
    const notification = NotificationsState.notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = !notification.read;
        applyFilters();
        Utils.updateNotificationCount();
        Utils.updateOverviewCards();
        Utils.showToast(
            `Notification marked as ${notification.read ? 'read' : 'unread'}`,
            'success'
        );
    }
}

function deleteNotification(notificationId) {
    if (confirm('Are you sure you want to delete this notification?')) {
        NotificationsState.notifications = NotificationsState.notifications.filter(
            n => n.id !== notificationId
        );
        applyFilters();
        Utils.updateNotificationCount();
        Utils.updateOverviewCards();
        Utils.showToast('Notification deleted successfully', 'success');
    }
}

function viewNotificationDetails(notificationId) {
    const notification = NotificationsState.notifications.find(n => n.id === notificationId);
    if (!notification) return;

    // Mark as read when viewing
    if (!notification.read) {
        notification.read = true;
        Utils.updateNotificationCount();
        Utils.updateOverviewCards();
        applyFilters();
    }

    // For now, just show a toast
    Utils.showToast('Viewing notification details', 'info');
}

// ===================================
// 4. FILTERING SYSTEM
// ===================================

function initializeFilters() {
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const filtersPanel = document.getElementById('filtersPanel');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    if (filterToggleBtn && filtersPanel) {
        filterToggleBtn.addEventListener('click', () => {
            filtersPanel.classList.toggle('active');
            filterToggleBtn.classList.toggle('active');
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            applyFilters();
            if (filtersPanel) filtersPanel.classList.remove('active');
            if (filterToggleBtn) filterToggleBtn.classList.remove('active');
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Category filter buttons
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            NotificationsState.filters.category = this.getAttribute('data-filter');
        });
    });

    // Time filter buttons
    document.querySelectorAll('[data-time-filter]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-time-filter]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const timeFilter = this.getAttribute('data-time-filter');
            
            if (timeFilter === 'custom') {
                Utils.openModal('customDateRangeModal');
            } else {
                NotificationsState.filters.timeRange = timeFilter;
            }
        });
    });

    // Priority filter buttons
    document.querySelectorAll('[data-priority-filter]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-priority-filter]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            NotificationsState.filters.priority = this.getAttribute('data-priority-filter');
        });
    });

    // Status filter buttons
    document.querySelectorAll('[data-status-filter]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-status-filter]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            NotificationsState.filters.status = this.getAttribute('data-status-filter');
        });
    });

    // Family member filter buttons
    document.querySelectorAll('[data-family-filter]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-family-filter]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            NotificationsState.filters.familyMember = this.getAttribute('data-family-filter');
        });
    });
}

function applyFilters() {
    let filtered = [...NotificationsState.notifications];

    // Category filter
    if (NotificationsState.filters.category !== 'all') {
        filtered = filtered.filter(n => n.category === NotificationsState.filters.category);
    }

    // Time filter
    const now = new Date();
    switch (NotificationsState.filters.timeRange) {
        case 'today':
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            filtered = filtered.filter(n => n.timestamp >= todayStart);
            break;
        case 'week':
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(n => n.timestamp >= weekStart);
            break;
        case 'month':
            const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(n => n.timestamp >= monthStart);
            break;
        case 'custom':
            if (NotificationsState.filters.customStartDate && NotificationsState.filters.customEndDate) {
                filtered = filtered.filter(n => 
                    n.timestamp >= NotificationsState.filters.customStartDate &&
                    n.timestamp <= NotificationsState.filters.customEndDate
                );
            }
            break;
    }

    // Priority filter
    if (NotificationsState.filters.priority) {
        filtered = filtered.filter(n => n.priority === NotificationsState.filters.priority);
    }

    // Status filter
    if (NotificationsState.filters.status === 'unread') {
        filtered = filtered.filter(n => !n.read);
    } else if (NotificationsState.filters.status === 'read') {
        filtered = filtered.filter(n => n.read);
    }

    // Family member filter
    if (NotificationsState.filters.familyMember !== 'all') {
        filtered = filtered.filter(n => 
            n.patient === NotificationsState.filters.familyMember || n.patient === 'all'
        );
    }

    NotificationsState.filteredNotifications = filtered;
    renderNotificationFeed();
    
    Utils.showToast('Filters applied successfully', 'success');
}

function clearFilters() {
    NotificationsState.filters = {
        category: 'all',
        timeRange: 'today',
        priority: null,
        status: 'all',
        familyMember: 'all',
        customStartDate: null,
        customEndDate: null
    };

    // Reset all filter buttons
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === 'all') {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('[data-time-filter]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-time-filter') === 'today') {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('[data-priority-filter]').forEach(btn => {
        btn.classList.remove('active');
    });

    document.querySelectorAll('[data-status-filter]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-status-filter') === 'all') {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('[data-family-filter]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-family-filter') === 'all') {
            btn.classList.add('active');
        }
    });

    applyFilters();
    Utils.showToast('Filters cleared', 'info');
}

// ===================================
// 5. NOTIFICATION ACTIONS
// ===================================

function initializeNotificationActions() {
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    const refreshNotificationsBtn = document.getElementById('refreshNotificationsBtn');
    const notificationSettingsBtn = document.getElementById('notificationSettingsBtn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllAsRead);
    }

    if (refreshNotificationsBtn) {
        refreshNotificationsBtn.addEventListener('click', refreshNotifications);
    }

    if (notificationSettingsBtn) {
        notificationSettingsBtn.addEventListener('click', () => {
            Utils.openModal('notificationPreferencesModal');
        });
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreNotifications);
    }
}

function markAllAsRead() {
    NotificationsState.notifications.forEach(n => n.read = true);
    applyFilters();
    Utils.updateNotificationCount();
    Utils.updateOverviewCards();
    Utils.showToast('All notifications marked as read', 'success');
}

function refreshNotifications() {
    Utils.showToast('Refreshing notifications...', 'info');
    
    // Simulate server refresh
    setTimeout(() => {
        // In production, this would fetch from the server
        renderNotificationFeed();
        Utils.updateNotificationCount();
        Utils.updateOverviewCards();
        Utils.showToast('Notifications refreshed successfully', 'success');
    }, 1000);
}

function loadMoreNotifications() {
    Utils.showToast('Loading more notifications...', 'info');
    
    // Simulate loading more notifications
    setTimeout(() => {
        Utils.showToast('All notifications loaded', 'info');
    }, 1000);
}

// ===================================
// 6. AUTO-REFRESH FUNCTIONALITY
// ===================================

function startAutoRefresh() {
    // Refresh every 30 seconds
    NotificationsState.autoRefreshInterval = setInterval(() => {
        refreshNotifications();
    }, 30000);
}

function stopAutoRefresh() {
    if (NotificationsState.autoRefreshInterval) {
        clearInterval(NotificationsState.autoRefreshInterval);
        NotificationsState.autoRefreshInterval = null;
    }
}

// ===================================
// 7. NOTIFICATION PREFERENCES
// ===================================

function initializeNotificationPreferences() {
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    const dndToggle = document.getElementById('dndToggle');
    const dndOptions = document.getElementById('dndOptions');

    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', saveNotificationPreferences);
    }

    if (dndToggle && dndOptions) {
        dndToggle.addEventListener('change', function() {
            if (this.checked) {
                dndOptions.style.display = 'block';
            } else {
                dndOptions.style.display = 'none';
            }
        });
    }
}

function saveNotificationPreferences() {
    // Collect all preference values
    const channels = {
        inApp: document.querySelector('#notificationPreferencesModal input[type="checkbox"]:nth-of-type(1)').checked,
        email: document.querySelector('#notificationPreferencesModal input[type="checkbox"]:nth-of-type(2)').checked,
        sms: document.querySelector('#notificationPreferencesModal input[type="checkbox"]:nth-of-type(3)').checked,
        whatsApp: document.querySelector('#notificationPreferencesModal input[type="checkbox"]:nth-of-type(4)').checked,
        push: document.querySelector('#notificationPreferencesModal input[type="checkbox"]:nth-of-type(5)').checked
    };

    NotificationsState.preferences.channels = channels;

    Utils.closeModal('notificationPreferencesModal');
    Utils.showToast('Notification preferences saved successfully', 'success');
}

// ===================================
// 8. CUSTOM DATE RANGE
// ===================================

function initializeCustomDateRange() {
    const applyDateRangeBtn = document.getElementById('applyDateRangeBtn');
    
    if (applyDateRangeBtn) {
        applyDateRangeBtn.addEventListener('click', applyCustomDateRange);
    }
}

function applyCustomDateRange() {
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;

    if (!startDate || !endDate) {
        Utils.showToast('Please select both start and end dates', 'error');
        return;
    }

    NotificationsState.filters.customStartDate = new Date(startDate);
    NotificationsState.filters.customEndDate = new Date(endDate);
    NotificationsState.filters.timeRange = 'custom';

    Utils.closeModal('customDateRangeModal');
    applyFilters();
}

// ===================================
// 9. MODALS MANAGEMENT
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
// 10. PROFILE DROPDOWN
// ===================================

function initializeProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');

    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isVisible = profileMenu.style.opacity === '1';
            profileMenu.style.opacity = isVisible ? '0' : '1';
            profileMenu.style.visibility = isVisible ? 'hidden' : 'visible';
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
// 11. DARK MODE TOGGLE
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
// 12. KEYBOARD SHORTCUTS
// ===================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            Utils.closeAllModals();
            
            // Close filters panel
            const filtersPanel = document.getElementById('filtersPanel');
            const filterToggleBtn = document.getElementById('filterToggleBtn');
            if (filtersPanel && filtersPanel.classList.contains('active')) {
                filtersPanel.classList.remove('active');
                if (filterToggleBtn) filterToggleBtn.classList.remove('active');
            }
        }

        // Ctrl/Cmd + R for refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshNotifications();
        }

        // Ctrl/Cmd + A for mark all as read
        if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            markAllAsRead();
        }
    });
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
            stopAutoRefresh();
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
// 14. ERROR HANDLING
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
// 15. ANIMATION OBSERVERS
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

    document.querySelectorAll('.notification-card, .overview-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease-in-out';
        observer.observe(el);
    });
}

// ===================================
// 16. PAGE VISIBILITY HANDLING
// ===================================

function initializePageVisibility() {
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoRefresh();
        } else {
            startAutoRefresh();
            refreshNotifications();
        }
    });
}

// ===================================
// 17. INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Curis Notifications initializing...');

    try {
        // Initialize all components
        initializeNotifications();
        initializeFilters();
        initializeNotificationActions();
        initializeNotificationPreferences();
        initializeCustomDateRange();
        initializeModals();
        initializeProfileDropdown();
        initializeDarkMode();
        initializeKeyboardShortcuts();
        initializeSessionManagement();
        initializeErrorHandling();
        initializeAnimations();
        initializePageVisibility();

        console.log('Curis Notifications initialized successfully');

        setTimeout(() => {
            Utils.showToast('Welcome to Notifications Center!', 'success');
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
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // Handle responsive adjustments
        if (window.innerWidth <= 768) {
            // Mobile adjustments
            const filtersPanel = document.getElementById('filtersPanel');
            const filterToggleBtn = document.getElementById('filterToggleBtn');
            if (filtersPanel && filtersPanel.classList.contains('active')) {
                filtersPanel.classList.remove('active');
                if (filterToggleBtn) filterToggleBtn.classList.remove('active');
            }
        }
    }, 250);
});

// ===================================
// 19. BEFORE UNLOAD HANDLER
// ===================================

window.addEventListener('beforeunload', function() {
    stopAutoRefresh();
});

// ===================================
// 20. EXPORT FOR EXTERNAL ACCESS
// ===================================

window.CurisNotifications = {
    Utils,
    NotificationsState,
    refreshNotifications,
    applyFilters,
    markAllAsRead
};
/**
 * ========================================
 * CURIS DASHBOARD JAVASCRIPT
 * Receptionist & Clinic Assistant Interface
 * Complete Functionality Implementation
 * Version: 1.0.0
 * ========================================
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // ========================================
    // GLOBAL VARIABLES & STATE MANAGEMENT
    // ========================================
    const state = {
        user: {
            name: 'Sarah Wanjiru',
            role: 'Receptionist',
            id: 'RCP-001',
            permissions: ['check-in', 'appointments', 'billing', 'messaging']
        },
        notifications: [],
        doctors: [],
        appointments: [],
        queue: [],
        metrics: {
            patientsToday: 42,
            totalAppointments: 58,
            paymentCollection: 125400,
            completionRate: 85
        },
        darkMode: false,
        syncInterval: null,
        realTimeInterval: null
    };

    // ========================================
    // INITIALIZATION
    // ========================================
    function init() {
        initializeEventListeners();
        initializeRealTimeUpdates();
        initializeDataSync();
        loadUserPreferences();
        updateNotificationBadge();
        initializeTimeTracking();
        initializeKeyboardShortcuts();
        initializeTooltips();
        console.log('Curis Dashboard initialized successfully');
    }

    // ========================================
    // EVENT LISTENERS SETUP
    // ========================================
    function initializeEventListeners() {
        // Quick Access Panel Actions
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', handleQuickAction);
        });

        // Modal Controls
        initializeModalControls();

        // Profile Popup
        const profileIcon = document.getElementById('profileIcon');
        if (profileIcon) {
            profileIcon.addEventListener('click', toggleProfilePopup);
        }

        // Notification Button
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', handleNotificationClick);
        }

        // Dark Mode Toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', toggleDarkMode);
        }

        // Search Functionality
        const searchBtn = document.querySelector('.search-btn');
        const searchInput = document.querySelector('.search-input');
        if (searchBtn) {
            searchBtn.addEventListener('click', handleSearch);
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleSearch();
            });
        }

        // Task Items Click
        const taskItems = document.querySelectorAll('.task-item');
        taskItems.forEach(item => {
            item.addEventListener('click', handleTaskClick);
        });

        // Alert Actions
        const alertActions = document.querySelectorAll('.alert-action');
        alertActions.forEach(btn => {
            btn.addEventListener('click', handleAlertAction);
        });

        // Doctor Status Items
        const doctorItems = document.querySelectorAll('.doctor-item');
        doctorItems.forEach(item => {
            item.addEventListener('click', handleDoctorClick);
        });

        // Quick Reply Buttons
        const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');
        quickReplyBtns.forEach(btn => {
            btn.addEventListener('click', handleQuickReply);
        });

        // Close profile popup when clicking outside
        document.addEventListener('click', (e) => {
            const profilePopup = document.getElementById('profilePopup');
            const profileIcon = document.getElementById('profileIcon');
            if (profilePopup && !profilePopup.contains(e.target) && e.target !== profileIcon) {
                profilePopup.classList.remove('active');
            }
        });
    }

    // ========================================
    // MODAL MANAGEMENT
    // ========================================
    function initializeModalControls() {
        // Quick Access Modal
        const quickAccessModal = document.getElementById('quickAccessModal');
        const rescheduleModal = document.getElementById('rescheduleModal');
        const cancelModal = document.getElementById('cancelModal');
        const assignDoctorModal = document.getElementById('assignDoctorModal');

        // Close buttons for all modals
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Secondary buttons (Cancel/Go Back)
        const secondaryBtns = document.querySelectorAll('.btn-secondary');
        secondaryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Modal action buttons in Quick Access Modal
        if (quickAccessModal) {
            const checkInAction = quickAccessModal.querySelector('.check-in-action');
            const rescheduleAction = quickAccessModal.querySelector('.reschedule-action');
            const cancelAction = quickAccessModal.querySelector('.cancel-action');
            const assignAction = quickAccessModal.querySelector('.assign-action');

            if (checkInAction) {
                checkInAction.addEventListener('click', () => {
                    quickAccessModal.classList.remove('active');
                    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Check-In\\check_in.html';
                });
            }

            if (rescheduleAction) {
                rescheduleAction.addEventListener('click', () => {
                    quickAccessModal.classList.remove('active');
                    rescheduleModal.classList.add('active');
                });
            }

            if (cancelAction) {
                cancelAction.addEventListener('click', () => {
                    quickAccessModal.classList.remove('active');
                    cancelModal.classList.add('active');
                });
            }

            if (assignAction) {
                assignAction.addEventListener('click', () => {
                    quickAccessModal.classList.remove('active');
                    assignDoctorModal.classList.add('active');
                });
            }
        }

        // Reschedule Modal Form
        if (rescheduleModal) {
            initializeRescheduleModal(rescheduleModal);
        }

        // Cancel Modal Form
        if (cancelModal) {
            initializeCancelModal(cancelModal);
        }

        // Assign Doctor Modal Form
        if (assignDoctorModal) {
            initializeAssignDoctorModal(assignDoctorModal);
        }

        // Close modal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal.active');
                activeModals.forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });

        // Close modal on background click
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // ========================================
    // RESCHEDULE MODAL FUNCTIONALITY
    // ========================================
    function initializeRescheduleModal(modal) {
        const timeSlots = modal.querySelectorAll('.time-slot');
        const confirmBtn = modal.querySelector('.btn-primary');
        const dateInput = modal.querySelector('input[type="date"]');
        let selectedTimeSlot = null;

        // Set minimum date to today
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }

        // Time slot selection
        timeSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                timeSlots.forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                selectedTimeSlot = slot.textContent;
            });
        });

        // Confirm reschedule
        if (confirmBtn) {
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const patientName = modal.querySelector('input[type="text"]').value;
                const doctor = modal.querySelector('select').value;
                const date = dateInput.value;

                if (patientName && doctor && date && selectedTimeSlot) {
                    // Process reschedule
                    processReschedule({
                        patient: patientName,
                        doctor: doctor,
                        date: date,
                        time: selectedTimeSlot
                    });

                    // Show success notification
                    showNotification('Appointment rescheduled successfully', 'success');

                    // Close modal
                    modal.classList.remove('active');

                    // Reset form
                    modal.querySelector('input[type="text"]').value = '';
                    dateInput.value = '';
                    timeSlots.forEach(s => s.classList.remove('selected'));
                    selectedTimeSlot = null;
                } else {
                    showNotification('Please fill all required fields', 'error');
                }
            });
        }
    }

    // ========================================
    // CANCEL MODAL FUNCTIONALITY
    // ========================================
    function initializeCancelModal(modal) {
        const confirmBtn = modal.querySelector('.btn-danger');
        const smsCheckbox = modal.querySelector('input[type="checkbox"]');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const patientName = modal.querySelector('input[type="text"]').value;
                const reason = modal.querySelector('textarea').value;
                const notifyPatient = smsCheckbox ? smsCheckbox.checked : false;

                if (patientName && reason) {
                    // Process cancellation
                    processCancellation({
                        patient: patientName,
                        reason: reason,
                        notify: notifyPatient
                    });

                    // Show notification
                    showNotification('Appointment cancelled successfully', 'warning');

                    // Close modal
                    modal.classList.remove('active');

                    // Reset form
                    modal.querySelector('input[type="text"]').value = '';
                    modal.querySelector('textarea').value = '';
                    if (smsCheckbox) smsCheckbox.checked = false;
                } else {
                    showNotification('Please provide patient name and reason', 'error');
                }
            });
        }
    }

    // ========================================
    // ASSIGN DOCTOR MODAL FUNCTIONALITY
    // ========================================
    function initializeAssignDoctorModal(modal) {
        const confirmBtn = modal.querySelector('.btn-primary');
        const doctorRadios = modal.querySelectorAll('input[name="doctor"]');
        const prioritySelect = modal.querySelector('select');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const patientName = modal.querySelector('input[type="text"]').value;
                const selectedDoctor = modal.querySelector('input[name="doctor"]:checked');
                const priority = prioritySelect ? prioritySelect.value : 'Normal';

                if (patientName && selectedDoctor) {
                    // Process assignment
                    processAssignment({
                        patient: patientName,
                        doctorId: selectedDoctor.id,
                        priority: priority
                    });

                    // Update queue display
                    updateQueueDisplay();

                    // Show notification
                    showNotification('Doctor assigned successfully', 'success');

                    // Close modal
                    modal.classList.remove('active');

                    // Reset form
                    modal.querySelector('input[type="text"]').value = '';
                    doctorRadios.forEach(radio => radio.checked = false);
                    if (prioritySelect) prioritySelect.value = 'Normal';
                } else {
                    showNotification('Please select patient and doctor', 'error');
                }
            });
        }
    }

    // ========================================
    // QUICK ACTION HANDLER
    // ========================================
    function handleQuickAction(e) {
        const action = e.currentTarget.dataset.action;
        const modal = document.getElementById('quickAccessModal');

        switch (action) {
            case 'check-in':
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Check-In\\check_in.html';
                break;
            case 'reschedule':
                document.getElementById('rescheduleModal').classList.add('active');
                break;
            case 'cancel':
                document.getElementById('cancelModal').classList.add('active');
                break;
            case 'assign':
                document.getElementById('assignDoctorModal').classList.add('active');
                break;
            default:
                if (modal) modal.classList.add('active');
        }
    }

    // ========================================
    // NOTIFICATION SYSTEM
    // ========================================
    function handleNotificationClick() {
        const notificationCenter = createNotificationCenter();
        document.body.appendChild(notificationCenter);
    }

    function createNotificationCenter() {
        const existingCenter = document.getElementById('notificationCenter');
        if (existingCenter) {
            existingCenter.remove();
        }

        const center = document.createElement('div');
        center.id = 'notificationCenter';
        center.className = 'notification-center-popup';
        center.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            width: 400px;
            max-height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            z-index: 2000;
            overflow: hidden;
        `;

        center.innerHTML = `
            <div style="padding: 20px; background: #1D2A3B; color: white;">
                <h3 style="margin: 0; font-size: 18px;">Notification Center</h3>
                <span style="font-size: 12px; opacity: 0.8;">All notifications</span>
            </div>
            <div style="max-height: 400px; overflow-y: auto; padding: 16px;">
                ${generateNotificationsList()}
            </div>
            <div style="padding: 16px; border-top: 1px solid #e5e7eb;">
                <button onclick="clearAllNotifications()" style="width: 100%; padding: 10px; background: #00BFA5; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Clear All Notifications
                </button>
            </div>
        `;

        // Close when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeCenter(e) {
                if (!center.contains(e.target) && e.target.id !== 'notificationBtn') {
                    center.remove();
                    document.removeEventListener('click', closeCenter);
                }
            });
        }, 100);

        return center;
    }

    function generateNotificationsList() {
        const notifications = [
            { type: 'appointment', message: 'New appointment booked for tomorrow', time: '2 min ago', icon: 'fa-calendar-check' },
            { type: 'payment', message: 'Payment received: KES 3,500', time: '5 min ago', icon: 'fa-money-bill' },
            { type: 'cancel', message: 'Appointment cancelled by patient', time: '15 min ago', icon: 'fa-times-circle' },
            { type: 'checkin', message: 'Patient checked in for 10:00 AM', time: '30 min ago', icon: 'fa-user-check' },
            { type: 'system', message: 'System maintenance scheduled', time: '1 hour ago', icon: 'fa-cog' }
        ];

        return notifications.map(n => `
            <div style="padding: 12px; margin-bottom: 8px; background: #f5f5f7; border-radius: 8px; cursor: pointer; transition: background 0.2s;"
                 onmouseover="this.style.background='#e8e8ea'" onmouseout="this.style.background='#f5f5f7'">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fas ${n.icon}" style="color: #00BFA5;"></i>
                    <div style="flex: 1;">
                        <div style="font-size: 14px; color: #333; margin-bottom: 4px;">${n.message}</div>
                        <div style="font-size: 11px; color: #999;">${n.time}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.clearAllNotifications = function () {
        const badge = document.querySelector('.notification-badge');
        if (badge) badge.textContent = '0';
        const center = document.getElementById('notificationCenter');
        if (center) center.remove();
        showNotification('All notifications cleared', 'success');
    };

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `toast-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 3000;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        const icon = type === 'success' ? 'fa-check-circle' :
            type === 'error' ? 'fa-exclamation-circle' :
                type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            const count = Math.floor(Math.random() * 10) + 1;
            badge.textContent = count;
        }
    }

    // ========================================
    // PROFILE POPUP
    // ========================================
    function toggleProfilePopup() {
        const popup = document.getElementById('profilePopup');
        if (popup) {
            popup.classList.toggle('active');
        }
    }

    // ========================================
    // DARK MODE
    // ========================================
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        state.darkMode = !state.darkMode;

        // Save preference
        localStorage.setItem('darkMode', state.darkMode);

        // Update icon
        const icon = document.querySelector('#darkModeToggle i');
        if (icon) {
            icon.className = state.darkMode ? 'fas fa-sun' : 'fas fa-moon';
        }

        showNotification(`Dark mode ${state.darkMode ? 'enabled' : 'disabled'}`, 'info');
    }

    function loadUserPreferences() {
        // Load dark mode preference
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            state.darkMode = true;
            const icon = document.querySelector('#darkModeToggle i');
            if (icon) icon.className = 'fas fa-sun';
        }
    }

    // ========================================
    // SEARCH FUNCTIONALITY
    // ========================================
    function handleSearch() {
        const input = document.querySelector('.search-input');
        if (!input) return;

        const query = input.value.trim().toLowerCase();
        if (!query) {
            showNotification('Please enter a search term', 'warning');
            return;
        }

        // Simulate search
        showNotification(`Searching for "${query}"...`, 'info');

        setTimeout(() => {
            const results = performSearch(query);
            displaySearchResults(results, query);
        }, 500);
    }

    function performSearch(query) {
        // Simulated search results
        const database = {
            patients: [
                { id: 'P001', name: 'John Kimani', phone: '0712345678' },
                { id: 'P002', name: 'Grace Muthoni', phone: '0723456789' },
                { id: 'P003', name: 'Peter Omondi', phone: '0734567890' }
            ],
            doctors: [
                { id: 'D001', name: 'Dr. James Ochieng', specialty: 'Cardiologist' },
                { id: 'D002', name: 'Dr. Mary Kamau', specialty: 'Pediatrician' },
                { id: 'D003', name: 'Dr. Peter Mutua', specialty: 'Orthopedic' }
            ],
            invoices: [
                { id: 'INV001', patient: 'John Kimani', amount: 3500 },
                { id: 'INV002', patient: 'Grace Muthoni', amount: 2800 }
            ]
        };

        const results = [];

        // Search patients
        database.patients.forEach(p => {
            if (p.name.toLowerCase().includes(query) || p.phone.includes(query)) {
                results.push({ type: 'Patient', ...p });
            }
        });

        // Search doctors
        database.doctors.forEach(d => {
            if (d.name.toLowerCase().includes(query) || d.specialty.toLowerCase().includes(query)) {
                results.push({ type: 'Doctor', ...d });
            }
        });

        // Search invoices
        database.invoices.forEach(i => {
            if (i.patient.toLowerCase().includes(query) || i.id.toLowerCase().includes(query)) {
                results.push({ type: 'Invoice', ...i });
            }
        });

        return results;
    }

    function displaySearchResults(results, query) {
        if (results.length === 0) {
            showNotification(`No results found for "${query}"`, 'warning');
            return;
        }

        showNotification(`Found ${results.length} results for "${query}"`, 'success');
        console.log('Search Results:', results);
    }

    // ========================================
    // TASK HANDLING
    // ========================================
    function handleTaskClick(e) {
        const taskLabel = e.currentTarget.querySelector('.task-label').textContent;

        switch (taskLabel) {
            case 'Scheduled Check-ins':
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Check-In\\check_in.html';
                break;
            case 'Pending Confirmations':
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Appointments\\appointments.html';
                break;
            case 'Unpaid Invoice Follow-ups':
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Billings and Payments\\billings_and_payments.html';
                break;
            default:
                showNotification(`Opening ${taskLabel}...`, 'info');
        }
    }

    // ========================================
    // ALERT ACTIONS
    // ========================================
    function handleAlertAction(e) {
        const alertTitle = e.target.parentElement.querySelector('.alert-title').textContent;

        if (alertTitle.includes('Overdue Bills')) {
            window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Billings and Payments\\billings_and_payments.html';
        } else if (alertTitle.includes('Unassigned Appointments')) {
            document.getElementById('assignDoctorModal').classList.add('active');
        } else if (alertTitle.includes('Service Fee')) {
            showNotification('Opening payment portal...', 'info');
            // Simulate payment portal
            setTimeout(() => {
                window.open('https://citruslabs.co.ke/', '_blank');
            }, 1000);
        }
    }

    // ========================================
    // DOCTOR CLICK HANDLER
    // ========================================
    function handleDoctorClick(e) {
        const doctorName = e.currentTarget.querySelector('.doctor-name').textContent;
        const status = e.currentTarget.querySelector('.doctor-status').textContent.trim();

        showNotification(`${doctorName} - Status: ${status}`, 'info');

        // Navigate to queue view for this doctor
        setTimeout(() => {
            window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Queue and Flow\\queue_and_flow.html';
        }, 1000);
    }

    // ========================================
    // QUICK REPLY HANDLER
    // ========================================
    function handleQuickReply(e) {
        const messageItem = e.target.closest('.message-item');
        const senderName = messageItem.querySelector('.sender-name').textContent;

        showNotification(`Opening chat with ${senderName}...`, 'info');

        setTimeout(() => {
            window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Messaging\\messaging.html';
        }, 1000);
    }

    // ========================================
    // REAL-TIME UPDATES
    // ========================================
    function initializeRealTimeUpdates() {
        // Update notifications every 30 seconds
        state.realTimeInterval = setInterval(() => {
            updateNotifications();
            updateDoctorStatus();
            updateMetrics();
            updateTaskSummary();
        }, 30000);

        // Simulate initial updates
        setTimeout(() => {
            addNewNotification();
        }, 5000);
    }

    function updateNotifications() {
        const notificationsList = document.querySelector('.notifications-list');
        if (!notificationsList) return;

        // Randomly add a new notification
        if (Math.random() > 0.7) {
            addNewNotification();
        }
    }

    function addNewNotification() {
        const notificationsList = document.querySelector('.notifications-list');
        if (!notificationsList) return;

        const notifications = [
            { icon: 'fa-user-plus', text: 'New patient registered', time: 'Just now' },
            { icon: 'fa-calendar-check', text: 'Appointment confirmed', time: '1 min ago' },
            { icon: 'fa-money-bill', text: 'Payment processed successfully', time: '2 min ago' }
        ];

        const newNotif = notifications[Math.floor(Math.random() * notifications.length)];

        const notifElement = document.createElement('div');
        notifElement.className = 'notification-item new';
        notifElement.innerHTML = `
            <span class="notification-time">${newNotif.time}</span>
            <div class="notification-content">
                <i class="fas ${newNotif.icon}"></i>
                <span>${newNotif.text}</span>
            </div>
        `;

        notificationsList.insertBefore(notifElement, notificationsList.firstChild);

        // Remove oldest notification if too many
        const allNotifs = notificationsList.querySelectorAll('.notification-item');
        if (allNotifs.length > 5) {
            notificationsList.removeChild(allNotifs[allNotifs.length - 1]);
        }

        // Update badge
        updateNotificationBadge();

        // Show toast
        showNotification(newNotif.text, 'info');
    }

    function updateDoctorStatus() {
        const doctorItems = document.querySelectorAll('.doctor-item');
        doctorItems.forEach(item => {
            if (Math.random() > 0.8) {
                const statusElement = item.querySelector('.doctor-status');
                const statuses = ['available', 'consultation', 'break'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

                statusElement.className = `doctor-status ${randomStatus}`;
                statusElement.innerHTML = `<i class="fas fa-circle"></i> ${randomStatus === 'available' ? 'Available' :
                        randomStatus === 'consultation' ? 'In Consultation' : 'On Break'
                    }`;

                // Update queue count
                const queueElement = item.querySelector('.queue-count');
                if (randomStatus === 'break') {
                    queueElement.textContent = 'Queue: 0';
                } else {
                    queueElement.textContent = `Queue: ${Math.floor(Math.random() * 8)}`;
                }
            }
        });
    }

    function updateMetrics() {
        // Update performance metrics with random changes
        const metrics = document.querySelectorAll('.metric-value');
        metrics.forEach((metric, index) => {
            if (Math.random() > 0.7) {
                const currentValue = metric.textContent;
                let newValue;

                if (index === 0) { // Patients checked
                    newValue = parseInt(currentValue) + Math.floor(Math.random() * 3);
                    metric.textContent = newValue;
                } else if (index === 1) { // Total appointments
                    newValue = parseInt(currentValue) + Math.floor(Math.random() * 2);
                    metric.textContent = newValue;
                } else if (index === 2) { // Payment collection
                    const amount = parseInt(currentValue.replace(/[^0-9]/g, ''));
                    newValue = amount + (Math.floor(Math.random() * 5000));
                    metric.textContent = `KES ${newValue.toLocaleString()}`;
                } else if (index === 3) { // Completion rate
                    newValue = Math.min(100, parseInt(currentValue) + Math.floor(Math.random() * 3));
                    metric.textContent = `${newValue}%`;
                }

                // Animate the change
                metric.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    metric.style.animation = '';
                }, 500);
            }
        });
    }

    function updateTaskSummary() {
        const taskCounts = document.querySelectorAll('.task-count');
        taskCounts.forEach(count => {
            if (Math.random() > 0.8) {
                const currentValue = parseInt(count.textContent);
                const change = Math.random() > 0.5 ? 1 : -1;
                const newValue = Math.max(0, currentValue + change);
                count.textContent = newValue;

                // Update status based on value
                const statusElement = count.parentElement.querySelector('.task-status');
                if (newValue === 0 && statusElement) {
                    statusElement.className = 'task-status complete';
                    statusElement.textContent = 'Complete';
                }
            }
        });
    }

    // ========================================
    // DATA SYNCHRONIZATION ENGINE
    // ========================================
    function initializeDataSync() {
        // Sync data every 60 seconds
        state.syncInterval = setInterval(() => {
            syncAppointments();
            syncQueue();
            syncPayments();
            syncPatientData();
        }, 60000);
    }

    function syncAppointments() {
        console.log('Syncing appointments...');
        // Simulate API call
        fetch('/api/appointments/sync', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${state.user.id}`,
                'Content-Type': 'application/json'
            }
        }).then(response => {
            console.log('Appointments synced');
        }).catch(error => {
            console.log('Appointments sync simulation complete');
        });
    }

    function syncQueue() {
        console.log('Syncing queue data...');
        // Update queue information
        const queueData = {
            timestamp: new Date().toISOString(),
            doctors: state.doctors,
            waitTime: calculateAverageWaitTime()
        };
        localStorage.setItem('queueData', JSON.stringify(queueData));
    }

    function syncPayments() {
        console.log('Syncing payment data...');
        // Update payment information
        const paymentData = {
            dailyTotal: state.metrics.paymentCollection,
            pending: 5,
            processed: 42
        };
        localStorage.setItem('paymentData', JSON.stringify(paymentData));
    }

    function syncPatientData() {
        console.log('Syncing patient data...');
        // Update patient information
        const patientData = {
            checkedIn: state.metrics.patientsToday,
            scheduled: state.metrics.totalAppointments,
            walkIns: 3
        };
        localStorage.setItem('patientData', JSON.stringify(patientData));
    }

    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    function processReschedule(data) {
        console.log('Processing reschedule:', data);
        // Add to state
        state.appointments.push({
            id: 'APT' + Date.now(),
            ...data,
            status: 'rescheduled'
        });

        // Update local storage
        localStorage.setItem('appointments', JSON.stringify(state.appointments));

        // Sync with server (simulated)
        syncAppointments();
    }

    function processCancellation(data) {
        console.log('Processing cancellation:', data);
        // Update state
        const appointment = state.appointments.find(a => a.patient === data.patient);
        if (appointment) {
            appointment.status = 'cancelled';
            appointment.cancelReason = data.reason;
        }

        // Send notification if requested
        if (data.notify) {
            console.log('Sending SMS notification to patient...');
        }
    }

    function processAssignment(data) {
        console.log('Processing doctor assignment:', data);
        // Add to queue
        state.queue.push({
            id: 'Q' + Date.now(),
            ...data,
            timestamp: new Date().toISOString()
        });

        // Update doctor's queue count
        updateQueueDisplay();
    }

    function updateQueueDisplay() {
        const doctorItems = document.querySelectorAll('.doctor-item');
        doctorItems.forEach(item => {
            const queueElement = item.querySelector('.queue-count');
            const currentCount = parseInt(queueElement.textContent.replace('Queue: ', ''));
            queueElement.textContent = `Queue: ${currentCount + 1}`;
        });
    }

    function calculateAverageWaitTime() {
        // Simulate wait time calculation
        return Math.floor(Math.random() * 30) + 15; // 15-45 minutes
    }

    // ========================================
    // TIME TRACKING
    // ========================================
    function initializeTimeTracking() {
        // Track session time
        const sessionStart = Date.now();

        setInterval(() => {
            const elapsed = Date.now() - sessionStart;
            const minutes = Math.floor(elapsed / 60000);
            console.log(`Session active: ${minutes} minutes`);
        }, 60000);
    }

    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================
    function initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + key combinations
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'q': // Quick access
                        e.preventDefault();
                        document.getElementById('quickAccessModal')?.classList.add('active');
                        break;
                    case 'b': // Book appointment
                        e.preventDefault();
                        window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Appointments\\appointments.html';
                        break;
                    case 'k': // Focus search
                        e.preventDefault();
                        document.querySelector('.search-input')?.focus();
                        break;
                    case 'd': // Toggle dark mode
                        e.preventDefault();
                        toggleDarkMode();
                        break;
                }
            }

            // Alt + number for quick navigation
            if (e.altKey) {
                const navItems = document.querySelectorAll('.nav-item');
                const num = parseInt(e.key);
                if (num >= 1 && num <= navItems.length) {
                    e.preventDefault();
                    navItems[num - 1].querySelector('.nav-link')?.click();
                }
            }
        });
    }

    // ========================================
    // TOOLTIPS
    // ========================================
    function initializeTooltips() {
        // Add tooltips to important elements
        const elements = [
            { selector: '.notification-btn', text: 'View all notifications' },
            { selector: '.dark-mode-toggle', text: 'Toggle dark mode' },
            { selector: '.profile-icon', text: 'View profile menu' },
            { selector: '.quick-action-btn', text: 'Quick action' }
        ];

        elements.forEach(({ selector, text }) => {
            const element = document.querySelector(selector);
            if (element) {
                element.title = text;
            }
        });
    }

    // ========================================
    // CLEANUP
    // ========================================
    window.addEventListener('beforeunload', () => {
        // Clear intervals
        if (state.syncInterval) clearInterval(state.syncInterval);
        if (state.realTimeInterval) clearInterval(state.realTimeInterval);

        // Save state
        localStorage.setItem('dashboardState', JSON.stringify(state));
    });

    // ========================================
    // ANIMATIONS
    // ========================================
    // Add CSS for animations if not already present
    if (!document.querySelector('#dashboardAnimations')) {
        const style = document.createElement('style');
        style.id = 'dashboardAnimations';
        style.innerHTML = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // INITIALIZE DASHBOARD
    // ========================================
    init();
});
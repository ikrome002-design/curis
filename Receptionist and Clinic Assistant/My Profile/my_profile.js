/* ===============================================
   CURIS MY PROFILE PAGE JAVASCRIPT
   Receptionist & Clinic Assistant Interface
   Version: 1.0
   =============================================== */

// ===============================================
// GLOBAL STATE MANAGEMENT
// ===============================================
const profileState = {
    currentUser: {
        id: 'RCP-2024-0042',
        fullName: 'Sarah Wanjiru Maina',
        displayName: 'Sarah Wanjiru',
        email: 'sarah.wanjiru@curis.co.ke',
        username: 'sarah.wanjiru',
        role: 'Receptionist & Clinic Assistant',
        department: 'Front Desk Department',
        joinDate: 'January 15, 2024',
        dateOfBirth: 'March 12, 1995',
        gender: 'Female',
        nationalId: '32145678',
        nationality: 'Kenyan',
        maritalStatus: 'Single',
        primaryPhone: '+254 712 345 678',
        secondaryPhone: '+254 734 567 890',
        whatsapp: '+254 712 345 678',
        address: 'Nairobi, Westlands, ABC Plaza, 4th Floor, Suite 402',
        preferredContact: 'WhatsApp',
        smsConsent: true,
        accountCreated: 'January 15, 2024',
        profileCompletion: 85,
        verified: true,
        lastPasswordChange: 'August 20, 2024',
        twoFactorEnabled: false,
        activeSessions: 1,
        lastLogin: 'Today at 8:45 AM'
    },
    requests: [
        {
            id: 'REQ-2024-0156',
            field: 'Primary Phone Number',
            currentValue: '+254 712 345 678',
            requestedValue: '+254 722 987 654',
            reason: 'Changed phone number',
            status: 'pending',
            submittedDate: 'September 25, 2025',
            ownerComments: null
        },
        {
            id: 'REQ-2024-0148',
            field: 'Address',
            currentValue: 'Nairobi, Westlands, ABC Plaza',
            requestedValue: 'Nairobi, Karen, XYZ Complex',
            reason: 'Relocated to new area',
            status: 'review',
            submittedDate: 'September 22, 2025',
            ownerComments: 'Reviewing documentation...'
        }
    ],
    notifications: {
        email: {
            newAppointments: true,
            patientArrivals: true,
            paymentConfirmations: true,
            requestUpdates: true,
            systemUpdates: false
        },
        sms: {
            enabled: true,
            urgentOnly: false
        },
        inApp: {
            enabled: true,
            soundEnabled: true,
            badgeCounters: true
        }
    },
    activityLogs: [],
    auditLog: []
};

// ===============================================
// INITIALIZATION
// ===============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('My Profile Page Initializing...');

    // Initialize all components
    initializeEventListeners();
    initializeModals();
    initializeProfileActions();
    initializeNotificationSettings();
    initializeActivityLogs();
    initializeProfileCompletion();
    initializeDarkMode();
    initializeProfilePopup();

    // Log page access
    logAuditAction('page_access', 'Accessed My Profile page');

    console.log('My Profile Page Initialized Successfully');
});

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

// Show notification toast
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        font-weight: 500;
        max-width: 400px;
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Audit logging
function logAuditAction(action, details) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        userId: profileState.currentUser.id,
        userName: profileState.currentUser.fullName,
        action: action,
        details: details
    };

    profileState.auditLog.push(logEntry);
    console.log('Audit Log:', logEntry);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ===============================================
// EVENT LISTENERS
// ===============================================
function initializeEventListeners() {
    // Notification button
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            showNotification('You have 3 new notifications', 'info');
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // All close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                closeModal(modalId);
            } else {
                const modal = this.closest('.modal');
                if (modal) closeModal(modal.id);
            }
        });
    });
}

// ===============================================
// MODAL MANAGEMENT
// ===============================================
function initializeModals() {
    // Modal close on secondary buttons
    document.querySelectorAll('.btn-secondary').forEach(btn => {
        if (btn.hasAttribute('data-modal')) {
            btn.addEventListener('click', function () {
                closeModal(this.getAttribute('data-modal'));
            });
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        logAuditAction('modal_opened', `Opened modal: ${modalId}`);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ===============================================
// PROFILE ACTIONS
// ===============================================
function initializeProfileActions() {
    // Avatar edit button
    const avatarEditBtn = document.getElementById('avatarEditBtn');
    if (avatarEditBtn) {
        avatarEditBtn.addEventListener('click', () => {
            openModal('avatarModal');
            logAuditAction('avatar_edit_clicked', 'Opened avatar management');
        });
    }

    // Profile action icons
    const actionIcons = {
        'viewProfileIcon': () => {
            openModal('fullProfileModal');
            logAuditAction('view_full_profile', 'Viewed full profile information');
        },
        'quickActionsIcon': () => {
            openModal('quickActionsModal');
            logAuditAction('quick_actions_opened', 'Opened quick actions menu');
        },
        'walkInVerifyIcon': () => {
            openModal('idCheckModal');
            logAuditAction('id_verification', 'Performed staff ID verification');
        },
        'contactConfirmIcon': () => {
            openModal('contactTestModal');
            logAuditAction('contact_test_opened', 'Opened contact testing');
        },
        'followUpIcon': () => {
            showNotification('Redirecting to appointments...', 'info');
            logAuditAction('staff_tasks_redirect', 'Redirected to staff tasks');
            setTimeout(() => {
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Appointments\\appointments.html';
            }, 1000);
        },
        'paymentRemindIcon': () => {
            showNotification('Opening billing sync...', 'info');
            logAuditAction('billing_sync_opened', 'Opened billing sync shortcuts');
            setTimeout(() => {
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Billings and Payments\\billings_and_payments.html';
            }, 1000);
        },
        'queueCheckIcon': () => {
            openModal('queueStatusModal');
            logAuditAction('queue_status_checked', 'Checked live queue status');
        }
    };

    Object.keys(actionIcons).forEach(iconId => {
        const icon = document.getElementById(iconId);
        if (icon) {
            icon.addEventListener('click', actionIcons[iconId]);
        }
    });

    // Request management
    const viewRequestsBtn = document.getElementById('viewActiveRequestsBtn');
    if (viewRequestsBtn) {
        viewRequestsBtn.addEventListener('click', () => {
            openModal('activeRequestsModal');
            logAuditAction('view_requests', 'Viewed active change requests');
        });
    }

    // Edit request buttons
    const requestPersonalEditBtn = document.getElementById('requestPersonalEditBtn');
    if (requestPersonalEditBtn) {
        requestPersonalEditBtn.addEventListener('click', () => {
            openModal('editRequestModal');
            logAuditAction('request_personal_edit', 'Opened personal details edit request');
        });
    }

    const requestContactEditBtn = document.getElementById('requestContactEditBtn');
    if (requestContactEditBtn) {
        requestContactEditBtn.addEventListener('click', () => {
            openModal('editRequestModal');
            logAuditAction('request_contact_edit', 'Opened contact info edit request');
        });
    }

    // Submit edit request
    const submitRequestBtns = document.querySelectorAll('.edit-request-form .btn-primary');
    submitRequestBtns.forEach(btn => {
        btn.addEventListener('click', submitEditRequest);
    });

    // View security details
    const viewSecurityBtn = document.getElementById('viewSecurityBtn');
    if (viewSecurityBtn) {
        viewSecurityBtn.addEventListener('click', () => {
            showNotification('Security settings are managed separately. Use email link to reset password.', 'info');
            logAuditAction('view_security', 'Viewed security information');
        });
    }

    // View permissions
    const viewPermissionsBtn = document.getElementById('viewPermissionsBtn');
    if (viewPermissionsBtn) {
        viewPermissionsBtn.addEventListener('click', () => {
            openModal('permissionsDetailModal');
            logAuditAction('view_permissions', 'Viewed detailed permissions');
        });
    }
}

// Submit edit request
function submitEditRequest() {
    const fieldSelect = document.getElementById('fieldToEdit');
    const field = fieldSelect ? fieldSelect.value : '';

    if (!field) {
        showNotification('Please select a field to edit', 'warning');
        return;
    }

    // Create new request
    const newRequest = {
        id: 'REQ-2024-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
        field: fieldSelect.options[fieldSelect.selectedIndex].text,
        status: 'pending',
        submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
        ownerComments: null
    };

    profileState.requests.unshift(newRequest);

    closeModal('editRequestModal');
    showNotification('Edit request submitted successfully! Awaiting clinic owner approval.', 'success');
    logAuditAction('submit_edit_request', `Submitted edit request for field: ${newRequest.field}`);

    // Update request count
    updateRequestCount();
}

function updateRequestCount() {
    const pendingCount = profileState.requests.filter(r => r.status === 'pending').length;
    const reviewCount = profileState.requests.filter(r => r.status === 'review').length;

    // Update UI if elements exist
    const statNumbers = document.querySelectorAll('.request-stat .stat-number');
    if (statNumbers.length >= 2) {
        statNumbers[0].textContent = pendingCount;
        statNumbers[1].textContent = reviewCount;
    }
}

// ===============================================
// NOTIFICATION SETTINGS
// ===============================================
function initializeNotificationSettings() {
    // Notification category buttons
    const notificationBtns = {
        'emailNotifsBtn': 'emailNotifsModal',
        'smsNotifsBtn': () => {
            showNotification('SMS notification settings', 'info');
            logAuditAction('sms_settings_opened', 'Opened SMS notification settings');
        },
        'inAppNotifsBtn': () => {
            showNotification('In-app notification settings', 'info');
            logAuditAction('inapp_settings_opened', 'Opened in-app notification settings');
        },
        'soundAlertsBtn': () => {
            showNotification('Sound & alert settings', 'info');
            logAuditAction('sound_settings_opened', 'Opened sound alert settings');
        }
    };

    Object.keys(notificationBtns).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                if (typeof notificationBtns[btnId] === 'function') {
                    notificationBtns[btnId]();
                } else {
                    openModal(notificationBtns[btnId]);
                    logAuditAction('notification_settings', `Opened ${btnId}`);
                }
            });
        }
    });

    // Toggle switches
    document.querySelectorAll('.toggle-switch input').forEach(toggle => {
        toggle.addEventListener('change', function () {
            const setting = this.closest('.notification-setting-item').querySelector('label').textContent;
            logAuditAction('notification_toggle', `Changed setting: ${setting} to ${this.checked}`);
            showNotification(`Setting updated: ${setting}`, 'success');
        });
    });

    // Save notification preferences
    const savePrefsBtn = document.querySelector('#emailNotifsModal .btn-primary');
    if (savePrefsBtn) {
        savePrefsBtn.addEventListener('click', () => {
            showNotification('Notification preferences saved successfully!', 'success');
            logAuditAction('save_notification_prefs', 'Saved notification preferences');
            closeModal('emailNotifsModal');
        });
    }
}

// ===============================================
// ACTIVITY LOGS
// ===============================================
function initializeActivityLogs() {
    // Activity log buttons
    const activityBtns = {
        'loginHistoryBtn': 'loginHistoryModal',
        'actionLogsBtn': () => {
            showNotification('Viewing action and change logs', 'info');
            logAuditAction('view_action_logs', 'Viewed action logs');
        },
        'systemActivityBtn': () => {
            showNotification('Viewing system activity tracking', 'info');
            logAuditAction('view_system_activity', 'Viewed system activity');
        },
        'exportLogsBtn': () => {
            showNotification('Exporting logs... This may take a moment.', 'info');
            logAuditAction('export_logs', 'Initiated log export');
            setTimeout(() => {
                showNotification('Logs exported successfully! Check your email.', 'success');
            }, 2000);
        }
    };

    Object.keys(activityBtns).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                if (typeof activityBtns[btnId] === 'function') {
                    activityBtns[btnId]();
                } else {
                    openModal(activityBtns[btnId]);
                    logAuditAction('view_activity_log', `Opened ${btnId}`);
                }
            });
        }
    });
}

// ===============================================
// CONTACT TESTING
// ===============================================
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-sm') && e.target.textContent === 'Send Test') {
        const testItem = e.target.closest('.contact-test-item');
        const testType = testItem.querySelector('.test-info span').textContent;
        const testNumber = testItem.querySelector('.test-number').textContent;

        e.target.disabled = true;
        e.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        setTimeout(() => {
            e.target.disabled = false;
            e.target.textContent = 'Send Test';
            showNotification(`Test ${testType} sent to ${testNumber}`, 'success');
            logAuditAction('contact_test', `Sent test ${testType} to ${testNumber}`);

            // Update delivery status
            const statusMsg = testItem.closest('.contact-test').querySelector('.status-message');
            if (statusMsg) {
                statusMsg.innerHTML = `<i class="fas fa-check-circle"></i> Last ${testType} sent to ${testNumber.substring(0, 8)}*** just now`;
            }
        }, 1500);
    }
});

// ===============================================
// AVATAR MANAGEMENT
// ===============================================
document.addEventListener('click', function (e) {
    const avatarActions = {
        'Upload New Photo': () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpeg,image/png';
            input.onchange = function (event) {
                const file = event.target.files[0];
                if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                        showNotification('File size exceeds 5MB limit', 'error');
                        return;
                    }
                    showNotification('Uploading photo...', 'info');
                    setTimeout(() => {
                        showNotification('Profile photo updated successfully!', 'success');
                        logAuditAction('avatar_upload', `Uploaded new profile photo: ${file.name}`);
                        closeModal('avatarModal');
                    }, 1500);
                }
            };
            input.click();
        },
        'Crop & Resize': () => {
            showNotification('Opening crop tool...', 'info');
            logAuditAction('avatar_crop', 'Opened photo crop tool');
        },
        'Remove Current Photo': () => {
            if (confirm('Are you sure you want to remove your profile photo?')) {
                showNotification('Profile photo removed', 'success');
                logAuditAction('avatar_remove', 'Removed profile photo');
                closeModal('avatarModal');
            }
        }
    };

    if (e.target.closest('.avatar-actions button')) {
        const btnText = e.target.closest('button').textContent.trim();
        const action = avatarActions[btnText];
        if (action) action();
    }
});

// ===============================================
// QUICK ACTIONS
// ===============================================
document.addEventListener('click', function (e) {
    if (e.target.closest('.quick-action-item')) {
        const actionText = e.target.closest('.quick-action-item').textContent.trim();

        const quickActions = {
            'Request Contact Change': () => {
                closeModal('quickActionsModal');
                openModal('editRequestModal');
                logAuditAction('quick_action', 'Request contact change');
            },
            'View Activity Logs': () => {
                closeModal('quickActionsModal');
                openModal('loginHistoryModal');
                logAuditAction('quick_action', 'View activity logs');
            },
            'Download Profile PDF': () => {
                showNotification('Generating PDF... This may take a moment.', 'info');
                logAuditAction('quick_action', 'Download profile PDF');
                setTimeout(() => {
                    showNotification('Profile PDF ready! Check your downloads.', 'success');
                }, 2000);
            },
            'Contact Support': () => {
                closeModal('quickActionsModal');
                openModal('supportTicketModal');
                logAuditAction('quick_action', 'Contact support');
            },
            'View Permissions': () => {
                closeModal('quickActionsModal');
                openModal('permissionsDetailModal');
                logAuditAction('quick_action', 'View permissions');
            },
            'System Status': () => {
                showNotification('All systems operational ✓', 'success');
                logAuditAction('quick_action', 'Check system status');
            }
        };

        const action = quickActions[actionText];
        if (action) action();
    }
});

// ===============================================
// QUEUE STATUS
// ===============================================
document.addEventListener('click', function (e) {
    if (e.target.closest('button') && e.target.closest('button').innerHTML.includes('Refresh Queue')) {
        const btn = e.target.closest('button');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync"></i> Refresh Queue';
            showNotification('Queue status updated', 'success');
            logAuditAction('refresh_queue', 'Refreshed queue status');

            // Update random numbers
            const statNumbers = document.querySelectorAll('.queue-stat-item .stat-number');
            statNumbers.forEach(stat => {
                const current = parseInt(stat.textContent);
                stat.textContent = current + Math.floor(Math.random() * 3);
            });
        }, 1000);
    }
});

// ===============================================
// SUPPORT TICKET
// ===============================================
const createTicketBtn = document.getElementById('createTicketBtn');
if (createTicketBtn) {
    createTicketBtn.addEventListener('click', () => {
        openModal('supportTicketModal');
        logAuditAction('support_ticket_opened', 'Opened support ticket form');
    });
}

document.addEventListener('click', function (e) {
    if (e.target.closest('.support-ticket-form .btn-primary')) {
        const category = document.querySelector('.support-ticket-form .form-select').value;
        if (!category) {
            showNotification('Please select an issue category', 'warning');
            return;
        }

        const ticketId = 'TKT-2024-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        showNotification(`Support ticket ${ticketId} created successfully!`, 'success');
        logAuditAction('support_ticket_created', `Created support ticket: ${ticketId}`);
        closeModal('supportTicketModal');

        // Reset form
        document.querySelector('.support-ticket-form .form-select').value = '';
        document.querySelector('.support-ticket-form .form-textarea').value = '';
    }
});

// ===============================================
// PROFILE COMPLETION
// ===============================================
function initializeProfileCompletion() {
    const completionFill = document.querySelector('.completion-fill');
    if (completionFill) {
        const percentage = completionFill.getAttribute('data-percentage') || 85;
        setTimeout(() => {
            completionFill.style.width = percentage + '%';
        }, 500);
    }
}

// ===============================================
// PROFILE POPUP
// ===============================================
function initializeProfilePopup() {
    const profileIcon = document.getElementById('profileIcon');
    const profilePopup = document.getElementById('profilePopup');

    if (profileIcon && profilePopup) {
        profileIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            profilePopup.classList.toggle('active');
            logAuditAction('profile_popup_toggle', 'Toggled profile popup menu');
        });

        // Close popup when clicking outside
        document.addEventListener('click', function (e) {
            if (profilePopup.classList.contains('active')) {
                if (!e.target.closest('.profile-popup') && !e.target.closest('#profileIcon')) {
                    profilePopup.classList.remove('active');
                }
            }
        });
    }
}

// ===============================================
// DARK MODE
// ===============================================
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');

    if (darkModeToggle) {
        // Check for saved preference
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            showNotification(`${isDark ? 'Dark' : 'Light'} mode enabled`, 'info');
            logAuditAction('dark_mode_toggle', `Switched to ${isDark ? 'dark' : 'light'} mode`);
        });
    }
}

// ===============================================
// REQUEST STATUS SIMULATION
// ===============================================
function simulateRequestApproval(requestId) {
    const request = profileState.requests.find(r => r.id === requestId);
    if (!request) return;

    // Simulate approval after some time
    setTimeout(() => {
        request.status = 'approved';
        request.ownerComments = 'Approved by clinic owner';

        showNotification('Your change request has been approved!', 'success');
        logAuditAction('request_approved', `Request ${requestId} approved`);

        // Update the actual profile field
        // This would normally be done by the backend

    }, Math.random() * 10000 + 5000); // Random time between 5-15 seconds
}

// ===============================================
// FILE UPLOAD HANDLING
// ===============================================
document.addEventListener('change', function (e) {
    if (e.target.type === 'file' && e.target.accept === 'image/*') {
        const file = e.target.files[0];
        if (file) {
            showNotification(`Selected file: ${file.name}`, 'info');
            logAuditAction('file_selected', `Selected file: ${file.name}`);
        }
    }
});

// ===============================================
// KEYBOARD SHORTCUTS
// ===============================================
document.addEventListener('keydown', function (e) {
    // ESC to close modals
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
    }

    // Ctrl/Cmd + K for quick actions
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openModal('quickActionsModal');
    }
});

// ===============================================
// AUTO-SAVE FUNCTIONALITY
// ===============================================
let autoSaveTimer;
document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(input => {
    input.addEventListener('input', function () {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            console.log('Auto-saving form data...');
            // This would save to localStorage or backend
        }, 2000);
    });
});

// ===============================================
// ACCESSIBILITY ENHANCEMENTS
// ===============================================
document.querySelectorAll('button, a, .action-icon-btn').forEach(element => {
    if (!element.hasAttribute('aria-label') && !element.getAttribute('title')) {
        const text = element.textContent.trim() || element.getAttribute('title') || 'Interactive element';
        element.setAttribute('aria-label', text);
    }
});

// ===============================================
// PERFORMANCE MONITORING
// ===============================================
window.addEventListener('load', function () {
    const loadTime = performance.now();
    console.log(`Page loaded in ${Math.round(loadTime)}ms`);
    logAuditAction('page_load', `Page load time: ${Math.round(loadTime)}ms`);
});

// ===============================================
// SESSION MANAGEMENT
// ===============================================
let sessionWarningShown = false;
let sessionTimeout;

function resetSessionTimer() {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        if (!sessionWarningShown) {
            showNotification('Your session will expire in 5 minutes due to inactivity', 'warning');
            sessionWarningShown = true;

            setTimeout(() => {
                showNotification('Session expired. Please log in again.', 'error');
                logAuditAction('session_expired', 'Session expired due to inactivity');
                setTimeout(() => {
                    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Receptionist and Clinic Assistant\\Landing Page\\landing_page.html';
                }, 2000);
            }, 5 * 60 * 1000); // 5 minutes warning
        }
    }, 25 * 60 * 1000); // 25 minutes of inactivity
}

// Reset session timer on user activity
['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
    document.addEventListener(event, resetSessionTimer, { passive: true });
});

resetSessionTimer();

// ===============================================
// ERROR HANDLING
// ===============================================
window.addEventListener('error', function (e) {
    console.error('JavaScript Error:', e.error);
    showNotification('An error occurred. Please try again or contact support.', 'error');
    logAuditAction('javascript_error', `Error: ${e.message}`);
});

// ===============================================
// NETWORK STATUS MONITORING
// ===============================================
window.addEventListener('online', () => {
    showNotification('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    showNotification('You are offline. Some features may be unavailable.', 'warning');
});

// ===============================================
// DATA EXPORT FUNCTIONS
// ===============================================
function exportProfileToPDF() {
    showNotification('Generating PDF... This may take a moment.', 'info');
    logAuditAction('export_profile_pdf', 'Exported profile to PDF');

    setTimeout(() => {
        showNotification('Profile PDF downloaded successfully!', 'success');
    }, 2000);
}

function exportActivityLogs() {
    showNotification('Exporting activity logs...', 'info');
    logAuditAction('export_activity_logs', 'Exported activity logs');

    setTimeout(() => {
        showNotification('Activity logs exported to PDF', 'success');
    }, 2000);
}

// ===============================================
// VALIDATION FUNCTIONS
// ===============================================
function validatePhoneNumber(phone) {
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===============================================
// CONSOLE LOG
// ===============================================
console.log('My Profile JavaScript Loaded Successfully');
console.log('Current User:', profileState.currentUser);
console.log('Active Requests:', profileState.requests.length);

// Export functions to global scope
window.openModal = openModal;
window.closeModal = closeModal;
window.showNotification = showNotification;
window.exportProfileToPDF = exportProfileToPDF;
window.exportActivityLogs = exportActivityLogs;
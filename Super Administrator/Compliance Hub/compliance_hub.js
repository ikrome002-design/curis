// ===================================
// CURIS COMPLIANCE HUB JAVASCRIPT
// Complete Security & Audit Center Implementation
// ===================================

// Global State Management
const ComplianceState = {
    auditLogs: [],
    failedLogins: [],
    lockedAccounts: [],
    blockedIPs: [],
    whitelistedIPs: [],
    activeThreats: {
        bruteForce: 2,
        suspiciousIPs: 5,
        lockedAccounts: 12
    },
    filters: {
        quickFilter: 'all',
        userType: '',
        actionType: '',
        dateFrom: '',
        dateTo: ''
    },
    securitySettings: {
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        captchaAfter: 3,
        autoLock: true,
        ipBlocking: true,
        deviceFingerprinting: true
    },
    sessionData: {
        activeUsers: 125,
        avgDuration: 45,
        peakTime: '10-11 AM'
    },
    dataAccess: {
        medicalRecords: 234,
        billingData: 89,
        userData: 145
    }
};

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function () {
    initializeComplianceHub();
});

// ===================================
// INITIALIZATION
// ===================================

function initializeComplianceHub() {
    // Initialize mock data
    initializeMockData();

    // Setup event listeners
    setupHeaderControls();
    setupWidgetClicks();
    setupQuickActions();
    setupModalControls();
    setupAuditLogFilters();
    setupSecurityMonitoring();
    setupExportConfiguration();
    setupRealTimeUpdates();
    setupDarkMode();

    // Load initial data
    loadDashboardData();
    updateSecurityStatus();

    // Start real-time monitoring
    startSecurityMonitoring();
}

// ===================================
// MOCK DATA INITIALIZATION
// ===================================

function initializeMockData() {
    // Generate audit logs
    ComplianceState.auditLogs = generateAuditLogs();

    // Generate failed login attempts
    ComplianceState.failedLogins = [
        {
            id: 'FL001',
            time: '10:45',
            user: 'user@mail.com',
            ip: '185.123.45.67',
            attempts: 5,
            maxAttempts: 5,
            status: 'locked',
            risk: 'high'
        },
        {
            id: 'FL002',
            time: '10:30',
            user: 'admin',
            ip: '192.168.1.100',
            attempts: 3,
            maxAttempts: 5,
            status: 'warning',
            risk: 'medium'
        },
        {
            id: 'FL003',
            time: '10:15',
            user: 'doctor@clinic.com',
            ip: '10.0.0.55',
            attempts: 2,
            maxAttempts: 5,
            status: 'active',
            risk: 'low'
        }
    ];

    // Locked accounts
    ComplianceState.lockedAccounts = [
        {
            id: 'LA001',
            user: 'user1@clinic.com',
            reason: '5 Failed Attempts',
            lockedAt: '10:45',
            duration: '25 min left',
            type: 'automatic'
        },
        {
            id: 'LA002',
            user: 'user2@clinic.com',
            reason: 'Admin Lock',
            lockedAt: 'Yesterday',
            duration: 'Indefinite',
            type: 'manual'
        },
        {
            id: 'LA003',
            user: 'user3@clinic.com',
            reason: 'Suspicious Activity',
            lockedAt: '09:30',
            duration: '10 min left',
            type: 'security'
        }
    ];

    // Blocked IPs
    ComplianceState.blockedIPs = [
        { ip: '185.123.45.*', reason: 'Brute force', blockedAt: new Date() },
        { ip: '192.168.1.99', reason: 'Suspicious', blockedAt: new Date() },
        { ip: '10.0.0.55', reason: 'Temp block', blockedAt: new Date() }
    ];

    // Whitelisted IPs
    ComplianceState.whitelistedIPs = [
        { ip: '192.168.1.0/24', reason: 'Office Network', addedAt: new Date() },
        { ip: '10.0.0.0/16', reason: 'VPN Network', addedAt: new Date() }
    ];
}

function generateAuditLogs() {
    const actions = ['Login Success', 'User Created', 'Login Failed', 'Medical Access', 'Billing Update', 'Data Export', 'Settings Changed', 'Account Locked'];
    const users = [
        { name: 'Dr. Lee', id: 'U12345', avatar: 'icons8-profile-picture-30.png' },
        { name: 'Admin', id: 'A67890', avatar: 'icons8-profile-picture-30.png' },
        { name: 'Dr. Kim', id: 'U54321', avatar: 'icons8-profile-picture-30.png' },
        { name: 'Clinic A', id: 'C98765', avatar: 'icons8-profile-picture-30.png' }
    ];
    const statuses = ['success', 'failed', 'warning'];

    const logs = [];
    const now = new Date();

    for (let i = 0; i < 100; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        logs.push({
            id: `LOG${String(i + 1).padStart(5, '0')}`,
            timestamp: new Date(now.getTime() - i * 900000), // 15 min intervals
            user: user,
            action: action,
            details: generateActionDetails(action),
            ip: generateRandomIP(),
            status: status,
            sessionId: `S${Math.random().toString(36).substr(2, 9)}`,
            device: 'Chrome/Windows',
            location: 'Nairobi, Kenya'
        });
    }

    return logs;
}

function generateActionDetails(action) {
    const detailsMap = {
        'Login Success': 'Dashboard Access',
        'User Created': 'Added new user',
        'Login Failed': 'Wrong Password',
        'Medical Access': `File #${Math.floor(Math.random() * 99999) + 10000}`,
        'Billing Update': 'Invoice Paid',
        'Data Export': 'Exported audit logs',
        'Settings Changed': 'Updated security settings',
        'Account Locked': 'Too many failed attempts'
    };
    return detailsMap[action] || 'System Action';
}

function generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// ===================================
// HEADER CONTROLS
// ===================================

function setupHeaderControls() {
    // Handle notification toggle
    window.toggleNotifications = function () {
        const panel = document.getElementById('notificationPanel');
        panel.classList.toggle('hidden');

        // Close user dropdown if open
        document.getElementById('userDropdown')?.classList.add('hidden');
    };

    // Handle user dropdown toggle
    window.toggleUserDropdown = function () {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('hidden');

        // Close notifications if open
        document.getElementById('notificationPanel')?.classList.add('hidden');
    };

    // Close dropdowns on outside click
    document.addEventListener('click', function (e) {
        const isNotificationBtn = e.target.closest('.notification-btn');
        const isUserBtn = e.target.closest('.user-profile-btn');
        const isNotificationPanel = e.target.closest('.notification-panel');
        const isUserDropdown = e.target.closest('.user-dropdown');

        if (!isNotificationBtn && !isNotificationPanel) {
            document.getElementById('notificationPanel')?.classList.add('hidden');
        }

        if (!isUserBtn && !isUserDropdown) {
            document.getElementById('userDropdown')?.classList.add('hidden');
        }
    });
}

// ===================================
// DASHBOARD WIDGETS
// ===================================

function setupWidgetClicks() {
    // Audit Log Widget
    window.openAuditLogs = function () {
        showModal('auditLogsModal');
        loadAuditLogs();
    };

    // Login Monitoring Widget
    window.openLoginMonitoring = function () {
        showModal('securityModal');
        loadSecurityData();
    };

    // Session History Widget
    window.openSessionHistory = function () {
        showModal('auditLogsModal');
        showSessionHistory();
    };

    // Data Access Logs Widget
    window.openDataAccessLogs = function () {
        showModal('auditLogsModal');
        showDataAccessLogs();
    };

    // Compliance Reports Widget
    window.openComplianceReports = function () {
        generateComplianceReport();
    };
}

function loadDashboardData() {
    // Update widget statistics
    updateAuditLogStats();
    updateLoginMonitoringStats();
    updateSessionStats();
    updateDataAccessStats();
    updateComplianceScore();
}

function updateAuditLogStats() {
    const totalLogs = ComplianceState.auditLogs.length;
    const successfulActions = ComplianceState.auditLogs.filter(log => log.status === 'success').length;
    const warnings = ComplianceState.auditLogs.filter(log => log.status === 'warning').length;
    const failedActions = ComplianceState.auditLogs.filter(log => log.status === 'failed').length;

    // Update DOM
    const statNumber = document.querySelector('.audit-widget .stat-number');
    if (statNumber) statNumber.textContent = totalLogs.toLocaleString();

    const breakdownItems = document.querySelectorAll('.audit-widget .breakdown-item strong');
    if (breakdownItems[0]) breakdownItems[0].textContent = successfulActions.toLocaleString();
    if (breakdownItems[1]) breakdownItems[1].textContent = warnings.toLocaleString();
    if (breakdownItems[2]) breakdownItems[2].textContent = failedActions.toLocaleString();
}

function updateLoginMonitoringStats() {
    const failedAttemptsToday = ComplianceState.failedLogins.length;
    const lockedAccounts = ComplianceState.lockedAccounts.length;
    const blockedIPs = ComplianceState.blockedIPs.length;

    // Update DOM
    const statNumber = document.querySelector('.security-widget .stat-number');
    if (statNumber) statNumber.textContent = failedAttemptsToday;

    const alertText = document.querySelector('.security-alerts span');
    if (alertText) alertText.textContent = `${lockedAccounts} accounts currently locked due to suspicious activity`;

    const breakdownItems = document.querySelectorAll('.security-widget .breakdown-item strong');
    if (breakdownItems[0]) breakdownItems[0].textContent = blockedIPs;
    if (breakdownItems[1]) breakdownItems[1].textContent = '15'; // Monitoring count
}

function updateSessionStats() {
    // Update active sessions
    const statNumber = document.querySelector('.session-widget .stat-number');
    if (statNumber) statNumber.textContent = ComplianceState.sessionData.activeUsers;
}

function updateDataAccessStats() {
    // Update data access counts
    const statNumber = document.querySelector('.data-widget .stat-number');
    if (statNumber) statNumber.textContent = (
        ComplianceState.dataAccess.medicalRecords +
        ComplianceState.dataAccess.billingData +
        ComplianceState.dataAccess.userData
    ).toLocaleString();
}

function updateComplianceScore() {
    // Calculate compliance score
    const score = 98.5; // Mock score
    const statNumber = document.querySelector('.reports-widget .stat-number');
    if (statNumber) statNumber.textContent = `${score}%`;
}

// ===================================
// QUICK ACTIONS
// ===================================

function setupQuickActions() {
    // Export Today's Logs
    window.exportTodayLogs = function () {
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = ComplianceState.auditLogs.filter(log =>
            log.timestamp.toISOString().split('T')[0] === today
        );

        showNotification(`Exporting ${todayLogs.length} logs from today...`, 'info');

        setTimeout(() => {
            showNotification('Export completed successfully!', 'success');
        }, 1500);
    };

    // Block Suspicious IP
    window.blockSuspiciousIP = function () {
        const ip = prompt('Enter IP address to block:');
        if (ip) {
            const reason = prompt('Reason for blocking:') || 'Suspicious activity';
            blockIP(ip, reason);
        }
    };

    // Unlock Account
    window.unlockAccount = function () {
        const email = prompt('Enter user email to unlock:');
        if (email) {
            unlockUserAccount(email);
        }
    };

    // Generate Security Report
    window.generateSecurityReport = function () {
        showNotification('Generating security report...', 'info');

        setTimeout(() => {
            showNotification('Security report generated successfully!', 'success');
            // Could open a modal or download the report
        }, 2000);
    };
}

// ===================================
// AUDIT LOG MANAGEMENT
// ===================================

function setupAuditLogFilters() {
    // Quick filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Apply filter
            ComplianceState.filters.quickFilter = this.dataset.filter;
            applyFilters();
        });
    });
}

window.applyFilters = function () {
    const userType = document.getElementById('userTypeFilter')?.value;
    const actionType = document.getElementById('actionTypeFilter')?.value;
    const dateFrom = document.getElementById('dateFromFilter')?.value;
    const dateTo = document.getElementById('dateToFilter')?.value;

    ComplianceState.filters = {
        ...ComplianceState.filters,
        userType,
        actionType,
        dateFrom,
        dateTo
    };

    loadAuditLogs();
    showNotification('Filters applied', 'success');
};

window.clearFilters = function () {
    // Reset filter values
    document.getElementById('userTypeFilter').value = '';
    document.getElementById('actionTypeFilter').value = '';
    document.getElementById('dateFromFilter').value = '';
    document.getElementById('dateToFilter').value = '';

    // Reset quick filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'all') {
            btn.classList.add('active');
        }
    });

    ComplianceState.filters = {
        quickFilter: 'all',
        userType: '',
        actionType: '',
        dateFrom: '',
        dateTo: ''
    };

    loadAuditLogs();
    showNotification('Filters cleared', 'info');
};

function loadAuditLogs() {
    let filteredLogs = [...ComplianceState.auditLogs];

    // Apply quick filter
    switch (ComplianceState.filters.quickFilter) {
        case 'today':
            const today = new Date().toISOString().split('T')[0];
            filteredLogs = filteredLogs.filter(log =>
                log.timestamp.toISOString().split('T')[0] === today
            );
            break;
        case 'failed':
            filteredLogs = filteredLogs.filter(log =>
                log.action === 'Login Failed' || log.status === 'failed'
            );
            break;
        case 'critical':
            filteredLogs = filteredLogs.filter(log =>
                ['Account Locked', 'Settings Changed', 'Data Export'].includes(log.action)
            );
            break;
        case 'suspicious':
            filteredLogs = filteredLogs.filter(log =>
                log.status === 'warning' || log.status === 'failed'
            );
            break;
    }

    // Apply advanced filters
    if (ComplianceState.filters.userType) {
        // Filter by user type logic
    }

    if (ComplianceState.filters.actionType) {
        // Filter by action type logic
    }

    // Date range filter
    if (ComplianceState.filters.dateFrom) {
        const fromDate = new Date(ComplianceState.filters.dateFrom);
        filteredLogs = filteredLogs.filter(log => log.timestamp >= fromDate);
    }

    if (ComplianceState.filters.dateTo) {
        const toDate = new Date(ComplianceState.filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        filteredLogs = filteredLogs.filter(log => log.timestamp <= toDate);
    }

    // Update table
    updateAuditLogTable(filteredLogs);
}

function updateAuditLogTable(logs) {
    const tbody = document.getElementById('logTableBody');
    if (!tbody) return;

    tbody.innerHTML = logs.slice(0, 20).map(log => `
        <tr class="log-entry ${log.status}">
            <td>${formatDateTime(log.timestamp)}</td>
            <td>
                <div class="user-info">
                    <img src="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\${log.user.avatar}" alt="User">
                    <span>${log.user.name} (ID: ${log.user.id})</span>
                </div>
            </td>
            <td>${log.action}</td>
            <td>${log.details}</td>
            <td>${log.ip}</td>
            <td><span class="status-badge ${log.status}">${capitalizeFirst(log.status)}</span></td>
            <td>
                <button class="action-btn" onclick="viewLogDetails('${log.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

window.viewLogDetails = function (logId) {
    const log = ComplianceState.auditLogs.find(l => l.id === logId);
    if (!log) return;

    // Show detailed log information
    alert(`Log Details:
    ID: ${log.id}
    User: ${log.user.name}
    Action: ${log.action}
    Time: ${formatDateTime(log.timestamp)}
    IP: ${log.ip}
    Session: ${log.sessionId}
    Device: ${log.device}
    Location: ${log.location}`);

    // In a real implementation, this would open a modal with detailed information
};

window.refreshLogs = function () {
    showNotification('Refreshing logs...', 'info');

    // Simulate adding new logs
    const newLog = {
        id: `LOG${String(ComplianceState.auditLogs.length + 1).padStart(5, '0')}`,
        timestamp: new Date(),
        user: { name: 'Dr. New', id: 'U99999', avatar: 'icons8-profile-picture-30.png' },
        action: 'Login Success',
        details: 'Dashboard Access',
        ip: generateRandomIP(),
        status: 'success',
        sessionId: `S${Math.random().toString(36).substr(2, 9)}`,
        device: 'Chrome/Windows',
        location: 'Nairobi, Kenya'
    };

    ComplianceState.auditLogs.unshift(newLog);
    loadAuditLogs();

    setTimeout(() => {
        showNotification('Logs refreshed', 'success');
    }, 500);
};

window.exportLogs = function () {
    showModal('exportModal');
};

// ===================================
// SECURITY MONITORING
// ===================================

function setupSecurityMonitoring() {
    // Security panel is managed through the modal
}

function loadSecurityData() {
    // Update threat stats
    updateThreatStats();

    // Update failed logins table
    updateFailedLoginsTable();

    // Update IP lists
    updateIPLists();

    // Update locked accounts
    updateLockedAccountsTable();
}

function updateThreatStats() {
    const stats = document.querySelectorAll('.threat-stat .stat-number');
    if (stats[0]) stats[0].textContent = ComplianceState.activeThreats.bruteForce;
    if (stats[1]) stats[1].textContent = ComplianceState.activeThreats.suspiciousIPs;
    if (stats[2]) stats[2].textContent = ComplianceState.activeThreats.lockedAccounts;
}

function updateFailedLoginsTable() {
    const tbody = document.querySelector('.failed-logins-table tbody');
    if (!tbody) return;

    tbody.innerHTML = ComplianceState.failedLogins.map(login => `
        <tr class="${login.risk}-risk">
            <td>${login.time}</td>
            <td>${login.user}</td>
            <td>${login.ip}</td>
            <td>${login.attempts}/${login.maxAttempts}</td>
            <td><span class="status-badge ${login.status}">${capitalizeFirst(login.status)}</span></td>
            <td>
                ${login.status === 'locked' ? `
                    <button class="action-btn" onclick="blockIP('${login.ip}')">
                        <i class="fas fa-ban"></i>
                    </button>
                    <button class="action-btn" onclick="unlockUser('${login.user}')">
                        <i class="fas fa-unlock"></i>
                    </button>
                ` : login.status === 'warning' ? `
                    <button class="action-btn" onclick="monitorIP('${login.ip}')">
                        <i class="fas fa-eye"></i>
                    </button>
                ` : `
                    <button class="action-btn" onclick="viewUserDetails('${login.user}')">
                        <i class="fas fa-user"></i>
                    </button>
                `}
            </td>
        </tr>
    `).join('');
}

function updateIPLists() {
    // Update blocked IPs
    const blockedList = document.querySelector('.blocked-ips .ip-list');
    if (blockedList) {
        blockedList.innerHTML = ComplianceState.blockedIPs.map(item => `
            <div class="ip-item blocked">
                <span class="ip">${item.ip}</span>
                <span class="reason">${item.reason}</span>
                <button class="unblock-btn" onclick="unblockIP('${item.ip}')">
                    <i class="fas fa-unlock"></i>
                </button>
            </div>
        `).join('') + `
            <button class="btn-secondary" onclick="addBlockedIP()">
                <i class="fas fa-plus"></i>
                Add IP Block
            </button>
        `;
    }

    // Update whitelisted IPs
    const whiteList = document.querySelector('.whitelisted-ips .ip-list');
    if (whiteList) {
        whiteList.innerHTML = ComplianceState.whitelistedIPs.map(item => `
            <div class="ip-item whitelisted">
                <span class="ip">${item.ip}</span>
                <span class="reason">${item.reason}</span>
                <button class="remove-btn" onclick="removeWhitelist('${item.ip}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('') + `
            <button class="btn-secondary" onclick="addWhitelistIP()">
                <i class="fas fa-plus"></i>
                Add Whitelist
            </button>
        `;
    }
}

function updateLockedAccountsTable() {
    const tbody = document.querySelector('.locked-accounts-table tbody');
    if (!tbody) return;

    tbody.innerHTML = ComplianceState.lockedAccounts.map(account => `
        <tr>
            <td>${account.user}</td>
            <td>${account.reason}</td>
            <td>${account.lockedAt}</td>
            <td>${account.duration}</td>
            <td>
                <button class="btn-primary" onclick="unlockAccount('${account.user}')">
                    <i class="fas fa-unlock"></i>
                    Unlock
                </button>
            </td>
        </tr>
    `).join('');
}

// IP Management Functions
window.blockIP = function (ip, reason) {
    reason = reason || prompt(`Reason for blocking ${ip}:`) || 'Suspicious activity';

    if (!ComplianceState.blockedIPs.find(item => item.ip === ip)) {
        ComplianceState.blockedIPs.push({
            ip: ip,
            reason: reason,
            blockedAt: new Date()
        });

        updateIPLists();
        showNotification(`IP ${ip} has been blocked`, 'success');
        logSecurityAction('IP Blocked', `Blocked IP: ${ip}, Reason: ${reason}`);
    }
};

window.unblockIP = function (ip) {
    if (confirm(`Are you sure you want to unblock ${ip}?`)) {
        ComplianceState.blockedIPs = ComplianceState.blockedIPs.filter(item => item.ip !== ip);
        updateIPLists();
        showNotification(`IP ${ip} has been unblocked`, 'success');
        logSecurityAction('IP Unblocked', `Unblocked IP: ${ip}`);
    }
};

window.addBlockedIP = function () {
    const ip = prompt('Enter IP address or range to block (e.g., 192.168.1.* or 192.168.1.100):');
    if (ip) {
        const reason = prompt('Reason for blocking:') || 'Manual block';
        blockIP(ip, reason);
    }
};

window.addWhitelistIP = function () {
    const ip = prompt('Enter IP address or range to whitelist (e.g., 192.168.1.0/24):');
    if (ip) {
        const reason = prompt('Reason for whitelisting:') || 'Trusted network';

        if (!ComplianceState.whitelistedIPs.find(item => item.ip === ip)) {
            ComplianceState.whitelistedIPs.push({
                ip: ip,
                reason: reason,
                addedAt: new Date()
            });

            updateIPLists();
            showNotification(`IP ${ip} has been whitelisted`, 'success');
            logSecurityAction('IP Whitelisted', `Whitelisted IP: ${ip}, Reason: ${reason}`);
        }
    }
};

window.removeWhitelist = function (ip) {
    if (confirm(`Are you sure you want to remove ${ip} from whitelist?`)) {
        ComplianceState.whitelistedIPs = ComplianceState.whitelistedIPs.filter(item => item.ip !== ip);
        updateIPLists();
        showNotification(`IP ${ip} removed from whitelist`, 'success');
        logSecurityAction('IP Whitelist Removed', `Removed IP: ${ip}`);
    }
};

window.monitorIP = function (ip) {
    showNotification(`Now monitoring IP: ${ip}`, 'info');
    logSecurityAction('IP Monitoring', `Started monitoring IP: ${ip}`);
};

window.viewUserDetails = function (user) {
    showNotification(`Loading details for ${user}...`, 'info');
    // In real implementation, would show user details modal
};

// Account Management Functions
window.unlockUser = function (user) {
    unlockUserAccount(user);
};

function unlockUserAccount(user) {
    const account = ComplianceState.lockedAccounts.find(acc => acc.user === user);
    if (account) {
        if (confirm(`Are you sure you want to unlock ${user}?`)) {
            ComplianceState.lockedAccounts = ComplianceState.lockedAccounts.filter(acc => acc.user !== user);

            // Remove from failed logins
            const failedLogin = ComplianceState.failedLogins.find(login => login.user === user);
            if (failedLogin) {
                failedLogin.status = 'active';
                failedLogin.attempts = 0;
            }

            updateLockedAccountsTable();
            updateFailedLoginsTable();
            showNotification(`Account ${user} has been unlocked`, 'success');
            logSecurityAction('Account Unlocked', `Unlocked account: ${user}`);
        }
    } else {
        showNotification(`Account ${user} not found in locked accounts`, 'error');
    }
}

// ===================================
// SESSION HISTORY
// ===================================

function showSessionHistory() {
    // Switch to session history view in audit logs modal
    showNotification('Loading session history...', 'info');

    // Update modal content to show session data
    const modalContent = document.querySelector('#auditLogsModal .modal-content');
    if (modalContent) {
        modalContent.innerHTML = generateSessionHistoryHTML();
    }
}

function generateSessionHistoryHTML() {
    return `
        <div class="session-history-panel">
            <h3>
                <i class="fas fa-clock"></i>
                Session History Analysis
            </h3>
            <div class="session-stats">
                <div class="stat-card">
                    <div class="stat-number">${ComplianceState.sessionData.activeUsers}</div>
                    <div class="stat-label">Active Sessions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${ComplianceState.sessionData.avgDuration} min</div>
                    <div class="stat-label">Average Duration</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${ComplianceState.sessionData.peakTime}</div>
                    <div class="stat-label">Peak Time</div>
                </div>
            </div>
            <div class="session-table">
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Login Time</th>
                            <th>Duration</th>
                            <th>Actions</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Dr. Lee</td>
                            <td>08:00</td>
                            <td>2 hrs</td>
                            <td>45 actions</td>
                            <td><span class="status-badge success">Active</span></td>
                        </tr>
                        <tr>
                            <td>Admin</td>
                            <td>09:00</td>
                            <td>1 hr</td>
                            <td>23 actions</td>
                            <td><span class="status-badge">Ended</span></td>
                        </tr>
                        <tr>
                            <td>Patient1</td>
                            <td>10:00</td>
                            <td>30 min</td>
                            <td>5 actions</td>
                            <td><span class="status-badge success">Active</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="unusual-patterns">
                <h4>Unusual Patterns Detected</h4>
                <div class="pattern-alerts">
                    <div class="alert-item warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        Long session: User X (6hrs)
                    </div>
                    <div class="alert-item warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        High activity: User Y (200/hr)
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===================================
// DATA ACCESS LOGS
// ===================================

function showDataAccessLogs() {
    showNotification('Loading data access logs...', 'info');

    // Update modal content to show data access logs
    const modalContent = document.querySelector('#auditLogsModal .modal-content');
    if (modalContent) {
        modalContent.innerHTML = generateDataAccessHTML();
    }
}

function generateDataAccessHTML() {
    return `
        <div class="data-access-panel">
            <h3>
                <i class="fas fa-database"></i>
                Data Access Monitor
            </h3>
            <div class="access-stats">
                <div class="stat-card">
                    <h4>Medical Records</h4>
                    <div class="stat-number">${ComplianceState.dataAccess.medicalRecords}</div>
                    <div class="stat-label">Files Accessed Today</div>
                </div>
                <div class="stat-card">
                    <h4>Billing Data</h4>
                    <div class="stat-number">${ComplianceState.dataAccess.billingData}</div>
                    <div class="stat-label">Invoices Viewed</div>
                </div>
                <div class="stat-card">
                    <h4>User Data</h4>
                    <div class="stat-number">${ComplianceState.dataAccess.userData}</div>
                    <div class="stat-label">Profiles Viewed</div>
                </div>
            </div>
            <div class="access-heatmap">
                <h4>Access Patterns Heatmap</h4>
                <div class="heatmap-placeholder">
                    [Interactive heatmap visualization would go here]
                </div>
            </div>
            <button class="btn-primary" onclick="generateAccessReport()">
                <i class="fas fa-chart-bar"></i>
                Generate Access Report
            </button>
        </div>
    `;
}

window.generateAccessReport = function () {
    showNotification('Generating data access report...', 'info');
    setTimeout(() => {
        showNotification('Data access report generated successfully!', 'success');
    }, 1500);
};

// ===================================
// EXPORT FUNCTIONALITY
// ===================================

function setupExportConfiguration() {
    // Process export is handled by the button
}

window.processExport = function () {
    const format = document.querySelector('input[name="exportFormat"]:checked')?.value;
    const dateRange = document.querySelector('input[name="dateRange"]:checked')?.value;
    const includeOptions = Array.from(document.querySelectorAll('.checkbox-group input:checked')).map(cb => cb.nextElementSibling.textContent);

    showNotification(`Exporting data as ${format.toUpperCase()}...`, 'info');

    // Simulate export process
    setTimeout(() => {
        showNotification('Export completed successfully!', 'success');
        closeModal('exportModal');

        // Log the export action
        logSecurityAction('Data Export', `Exported ${dateRange} data as ${format}`);
    }, 2000);
};

// ===================================
// COMPLIANCE REPORTS
// ===================================

function generateComplianceReport() {
    showNotification('Generating compliance report...', 'info');

    setTimeout(() => {
        showNotification('Compliance report generated successfully!', 'success');

        // Create a simple report summary
        const reportSummary = `
        COMPLIANCE REPORT SUMMARY
        ========================
        Generated: ${new Date().toLocaleString()}
        
        Security Score: 98.5%
        HIPAA Compliant: Yes
        GDPR Compliant: Yes
        
        Key Metrics:
        - Total Security Events: ${ComplianceState.auditLogs.length}
        - Failed Login Attempts: ${ComplianceState.failedLogins.length}
        - Locked Accounts: ${ComplianceState.lockedAccounts.length}
        - Blocked IPs: ${ComplianceState.blockedIPs.length}
        
        Recommendations:
        - Review and update password policies
        - Implement additional 2FA requirements
        - Schedule regular security training
        `;

        console.log(reportSummary);
        // In real implementation, would download or display the report
    }, 2000);
}

// ===================================
// REAL-TIME UPDATES
// ===================================

function setupRealTimeUpdates() {
    // Update last updated timestamp
    setInterval(() => {
        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
            lastUpdated.textContent = 'Just now';
        }
    }, 60000); // Update every minute
}

function startSecurityMonitoring() {
    // Simulate real-time security events
    setInterval(() => {
        // Random security events
        if (Math.random() > 0.95) {
            simulateFailedLogin();
        }

        if (Math.random() > 0.98) {
            simulateSecurityAlert();
        }

        // Update security status
        updateSecurityStatus();
    }, 10000); // Check every 10 seconds
}

function simulateFailedLogin() {
    const newFailedLogin = {
        id: `FL${String(ComplianceState.failedLogins.length + 1).padStart(3, '0')}`,
        time: new Date().toTimeString().slice(0, 5),
        user: `user${Math.floor(Math.random() * 100)}@clinic.com`,
        ip: generateRandomIP(),
        attempts: Math.floor(Math.random() * 5) + 1,
        maxAttempts: 5,
        status: 'warning',
        risk: 'medium'
    };

    ComplianceState.failedLogins.unshift(newFailedLogin);

    // Show notification
    addSecurityNotification('Failed Login Attempt', `${newFailedLogin.attempts} failed attempts from ${newFailedLogin.ip}`);

    // Update stats if security modal is open
    if (!document.getElementById('securityModal')?.classList.contains('hidden')) {
        updateFailedLoginsTable();
    }
}

function simulateSecurityAlert() {
    const alerts = [
        'Suspicious login pattern detected',
        'Multiple failed attempts from same IP',
        'Unusual data access pattern',
        'Account lockout threshold reached'
    ];

    const alert = alerts[Math.floor(Math.random() * alerts.length)];

    // Show security alert banner
    showSecurityAlert(alert);

    // Add to notifications
    addSecurityNotification('Security Alert', alert);
}

function showSecurityAlert(message) {
    const alertBanner = document.getElementById('securityAlert');
    const alertMessage = document.getElementById('alertMessage');

    if (alertBanner && alertMessage) {
        alertMessage.textContent = `Security Alert: ${message}`;
        alertBanner.classList.remove('hidden');

        // Auto-hide after 10 seconds
        setTimeout(() => {
            alertBanner.classList.add('hidden');
        }, 10000);
    }
}

window.closeAlert = function () {
    document.getElementById('securityAlert')?.classList.add('hidden');
};

function addSecurityNotification(title, desc) {
    const notificationList = document.querySelector('.notification-list');
    if (!notificationList) return;

    const notification = document.createElement('div');
    notification.className = 'notification-item unread';
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-desc">${desc}</div>
            <div class="notification-time">Just now</div>
        </div>
    `;

    notificationList.insertBefore(notification, notificationList.firstChild);

    // Update badge count
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const count = parseInt(badge.textContent) || 0;
        badge.textContent = count + 1;
    }
}

function updateSecurityStatus() {
    const statusText = document.querySelector('.security-status-item strong');
    if (statusText) {
        // Check for any active threats
        const hasThreats = ComplianceState.activeThreats.bruteForce > 0 ||
            ComplianceState.activeThreats.suspiciousIPs > 3;

        if (hasThreats) {
            statusText.textContent = 'Alert';
            statusText.className = 'warning';
        } else {
            statusText.textContent = 'Secure';
            statusText.className = 'success';
        }
    }
}

// ===================================
// MODAL CONTROLS
// ===================================

function setupModalControls() {
    // Modal close buttons
    window.closeModal = function (modalId) {
        document.getElementById(modalId)?.classList.add('hidden');
    };

    // Close modal on background click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.add('hidden');
            }
        });
    });
}

function showModal(modalId) {
    document.getElementById(modalId)?.classList.remove('hidden');
}

// ===================================
// DARK MODE
// ===================================

function setupDarkMode() {
    window.toggleDarkMode = function () {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update button text
        const darkModeBtn = document.querySelector('.dark-mode-btn');
        if (darkModeBtn) {
            const icon = darkModeBtn.querySelector('i');
            const text = darkModeBtn.querySelector('span');

            if (newTheme === 'dark') {
                icon.className = 'fas fa-sun';
                text.textContent = 'Light Mode';
            } else {
                icon.className = 'fas fa-moon';
                text.textContent = 'Dark Mode';
            }
        }
    };

    // Apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (savedTheme === 'dark') {
        const darkModeBtn = document.querySelector('.dark-mode-btn');
        if (darkModeBtn) {
            darkModeBtn.querySelector('i').className = 'fas fa-sun';
            darkModeBtn.querySelector('span').textContent = 'Light Mode';
        }
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `system-notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || 'fa-bell';
}

function logSecurityAction(action, details) {
    // Add to audit log
    const newLog = {
        id: `LOG${String(ComplianceState.auditLogs.length + 1).padStart(5, '0')}`,
        timestamp: new Date(),
        user: { name: 'Super Admin', id: 'SA001', avatar: 'icons8-profile-picture-30.png' },
        action: action,
        details: details,
        ip: '127.0.0.1', // Local admin action
        status: 'success',
        sessionId: 'current',
        device: 'Admin Panel',
        location: 'System'
    };

    ComplianceState.auditLogs.unshift(newLog);

    // Update stats if audit modal is open
    if (!document.getElementById('auditLogsModal')?.classList.contains('hidden')) {
        loadAuditLogs();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .session-history-panel,
    .data-access-panel {
        padding: var(--spacing-xl);
    }
    
    .session-stats,
    .access-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-2xl);
    }
    
    .stat-card {
        background: var(--soft-gray);
        padding: var(--spacing-xl);
        border-radius: var(--radius-lg);
        text-align: center;
    }
    
    .stat-card .stat-number {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--primary-navy);
        margin-bottom: var(--spacing-sm);
    }
    
    .session-table table,
    .access-table table {
        width: 100%;
        border-collapse: collapse;
        margin-top: var(--spacing-xl);
    }
    
    .session-table th,
    .access-table th {
        background: var(--primary-navy);
        color: var(--white);
        padding: var(--spacing-md);
        text-align: left;
    }
    
    .session-table td,
    .access-table td {
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--light-gray);
    }
    
    .unusual-patterns {
        margin-top: var(--spacing-2xl);
        background: var(--soft-gray);
        padding: var(--spacing-xl);
        border-radius: var(--radius-lg);
    }
    
    .pattern-alerts {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        margin-top: var(--spacing-lg);
    }
    
    .heatmap-placeholder {
        height: 300px;
        background: var(--soft-gray);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--medium-gray);
        margin: var(--spacing-xl) 0;
    }
`;
document.head.appendChild(style);

// ===================================
// ERROR HANDLING
// ===================================

window.addEventListener('error', function (e) {
    console.error('Global error:', e.error);
    showNotification('An error occurred. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('An error occurred. Please try again.', 'error');
});
// ===================================
// CURIS USERS PAGE JAVASCRIPT
// ===================================

// Global state management for Users page
const UsersPageState = {
    users: [],
    filteredUsers: [],
    selectedUsers: new Set(),
    currentTab: 'active',
    currentSort: { column: null, direction: 'asc' },
    currentPage: 1,
    itemsPerPage: 10,
    filters: {
        roles: ['patients', 'doctors', 'receptionists', 'clinic-owners'],
        statuses: ['active', 'suspended', 'pending'],
        clinic: '',
        search: ''
    },
    metrics: {
        total: 1247,
        byRole: {
            patients: 856,
            doctors: 142,
            receptionists: 124,
            clinicOwners: 125
        },
        byStatus: {
            active: 1198,
            suspended: 32,
            pending: 17
        }
    },
    currentTheme: localStorage.getItem('theme') || 'light'
};

// Sample user data
const sampleUsers = [
    {
        id: 'U001',
        name: 'Dr. John Doe',
        email: 'john.doe@example.com',
        role: 'doctor',
        status: 'active',
        clinic: 'Nairobi Medical Center',
        created: '01/01/2024',
        lastLogin: 'Today',
        phone: '+254712345678',
        avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png'
    },
    {
        id: 'U002',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'patient',
        status: 'suspended',
        clinic: '-',
        created: '02/01/2024',
        lastLogin: '5 days ago',
        phone: '+254723456789',
        avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png'
    },
    {
        id: 'U003',
        name: 'Bob Johnson',
        email: 'bob.johnson@clinic.com',
        role: 'clinic-owner',
        status: 'active',
        clinic: 'Westlands Health Clinic',
        created: '03/01/2024',
        lastLogin: 'Yesterday',
        phone: '+254734567890',
        avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png'
    },
    {
        id: 'U004',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@clinic.com',
        role: 'receptionist',
        status: 'pending',
        clinic: 'Karen Medical Center',
        created: '04/01/2024',
        lastLogin: 'Never',
        phone: '+254745678901',
        avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png'
    }
];

// Initialize page on DOM load
document.addEventListener('DOMContentLoaded', function () {
    initializeUsersPage();
    initializeEventListeners();
    initializeRealTimeUpdates();
    applyTheme(UsersPageState.currentTheme);
});

// ===================================
// INITIALIZATION FUNCTIONS
// ===================================

function initializeUsersPage() {
    // Load user data
    UsersPageState.users = generateMoreUsers(sampleUsers, 1247);

    // Apply initial filters
    applyFilters();

    // Update UI
    updateMetricsDisplay();
    updateTabCounts();
    renderUserTable();
    updatePagination();
}

function initializeEventListeners() {
    // Header event listeners (from dashboard)
    const notificationBtn = document.getElementById('notificationBtn');
    const userProfileBtn = document.getElementById('userProfileBtn');
    const closeNotifications = document.getElementById('closeNotifications');

    notificationBtn?.addEventListener('click', toggleNotificationPanel);
    userProfileBtn?.addEventListener('click', toggleUserDropdown);
    closeNotifications?.addEventListener('click', hideNotificationPanel);

    // Filter button
    document.getElementById('filterOptionsBtn')?.addEventListener('click', () => showModal('filterModal'));

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleTabSwitch);
    });

    // Action buttons
    document.getElementById('addUserBtn')?.addEventListener('click', () => showModal('createUserModal'));
    document.getElementById('batchUploadBtn')?.addEventListener('click', () => showModal('batchUploadModal'));
    document.getElementById('auditLogsBtn')?.addEventListener('click', () => showModal('auditLogModal'));
    document.getElementById('communicationBtn')?.addEventListener('click', () => showModal('communicationModal'));
    document.getElementById('notificationMgmtBtn')?.addEventListener('click', () => showModal('notificationSettingsModal'));

    // Table interactions
    document.getElementById('selectAll')?.addEventListener('change', handleSelectAll);
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleRowSelect);
    });

    // Sort headers
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', handleSort);
    });

    // Action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleActionMenu);
    });

    // Pagination
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', handlePagination);
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.currentTarget.getAttribute('data-modal');
            hideModal(modalId);
        });
    });

    // Modal overlay clicks
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideModal(overlay.id);
            }
        });
    });

    // Filter modal actions
    document.getElementById('applyFiltersBtn')?.addEventListener('click', handleApplyFilters);
    document.getElementById('clearFiltersBtn')?.addEventListener('click', handleClearFilters);

    // User profile modal actions
    document.getElementById('saveUserChanges')?.addEventListener('click', handleSaveUserChanges);
    document.getElementById('resetUserPassword')?.addEventListener('click', handleResetPassword);
    document.getElementById('addUserNote')?.addEventListener('click', handleAddUserNote);

    // Suspension modal
    document.querySelectorAll('input[name="suspensionReason"]').forEach(radio => {
        radio.addEventListener('change', handleSuspensionReasonChange);
    });
    document.querySelectorAll('input[name="suspensionDuration"]').forEach(radio => {
        radio.addEventListener('change', handleSuspensionDurationChange);
    });
    document.getElementById('confirmSuspension')?.addEventListener('click', handleConfirmSuspension);

    // Create user modal
    document.getElementById('createUserBtn')?.addEventListener('click', handleCreateUser);
    document.getElementById('togglePassword')?.addEventListener('click', togglePasswordVisibility);
    document.getElementById('autoGeneratePassword')?.addEventListener('change', handleAutoGeneratePassword);

    // Batch upload
    document.getElementById('downloadTemplate')?.addEventListener('click', handleDownloadTemplate);
    document.getElementById('selectFileBtn')?.addEventListener('click', () => {
        document.getElementById('csvFileInput')?.click();
    });
    document.getElementById('csvFileInput')?.addEventListener('change', handleFileSelect);
    document.getElementById('importUsersBtn')?.addEventListener('click', handleImportUsers);

    // Drag and drop
    const dropzone = document.getElementById('uploadDropzone');
    if (dropzone) {
        dropzone.addEventListener('dragover', handleDragOver);
        dropzone.addEventListener('dragleave', handleDragLeave);
        dropzone.addEventListener('drop', handleDrop);
    }

    // Communication modal
    document.querySelectorAll('input[name="recipientType"]').forEach(radio => {
        radio.addEventListener('change', handleRecipientTypeChange);
    });
    document.querySelectorAll('input[name="messageSchedule"]').forEach(radio => {
        radio.addEventListener('change', handleMessageScheduleChange);
    });
    document.getElementById('messageTemplate')?.addEventListener('change', handleTemplateChange);
    document.getElementById('sendMessageBtn')?.addEventListener('click', handleSendMessage);

    // Notification settings
    document.getElementById('saveNotificationSettings')?.addEventListener('click', handleSaveNotificationSettings);
    document.getElementById('addCustomRule')?.addEventListener('click', handleAddCustomRule);

    // Deactivation modal
    document.getElementById('confirmationText')?.addEventListener('input', handleConfirmationText);
    document.getElementById('proceedDeactivation')?.addEventListener('click', handleProceedDeactivation);

    // Audit log filters
    document.getElementById('applyLogFilters')?.addEventListener('click', handleApplyLogFilters);
    document.getElementById('exportLogsBtn')?.addEventListener('click', handleExportLogs);

    // Dark mode toggle
    document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);

    // Click outside handlers
    document.addEventListener('click', handleOutsideClick);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ===================================
// DATA GENERATION & MANAGEMENT
// ===================================

function generateMoreUsers(baseUsers, totalCount) {
    const users = [...baseUsers];
    const roles = ['patient', 'doctor', 'receptionist', 'clinic-owner'];
    const statuses = ['active', 'suspended', 'pending'];
    const clinics = ['Nairobi Medical Center', 'Westlands Health Clinic', 'Karen Medical Center', 'Eastleigh Family Clinic', '-'];
    const firstNames = ['John', 'Jane', 'Bob', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'James', 'Jennifer'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    for (let i = users.length; i < totalCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const status = Math.random() > 0.1 ? 'active' : statuses[Math.floor(Math.random() * statuses.length)];
        const clinic = role === 'patient' ? '-' : clinics[Math.floor(Math.random() * clinics.length)];

        users.push({
            id: `U${String(i + 1).padStart(3, '0')}`,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            role: role,
            status: status,
            clinic: clinic,
            created: generateRandomDate(),
            lastLogin: generateRandomLastLogin(),
            phone: `+2547${Math.floor(10000000 + Math.random() * 90000000)}`,
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png'
        });
    }

    return users;
}

function generateRandomDate() {
    const start = new Date(2024, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function generateRandomLastLogin() {
    const options = ['Today', 'Yesterday', '2 days ago', '3 days ago', '5 days ago', '1 week ago', '2 weeks ago', 'Never'];
    return options[Math.floor(Math.random() * options.length)];
}

// ===================================
// FILTER FUNCTIONS
// ===================================

function applyFilters() {
    const { roles, statuses, clinic, search } = UsersPageState.filters;

    UsersPageState.filteredUsers = UsersPageState.users.filter(user => {
        // Tab filter
        if (UsersPageState.currentTab !== 'all') {
            if (user.status !== UsersPageState.currentTab) return false;
        }

        // Role filter
        const roleMap = {
            'patients': 'patient',
            'doctors': 'doctor',
            'receptionists': 'receptionist',
            'clinic-owners': 'clinic-owner'
        };
        const userRoleKey = Object.keys(roleMap).find(key => roleMap[key] === user.role);
        if (!roles.includes(userRoleKey)) return false;

        // Status filter
        if (!statuses.includes(user.status)) return false;

        // Clinic filter
        if (clinic && user.clinic !== clinic) return false;

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            return (
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.id.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    // Reset to page 1 when filters change
    UsersPageState.currentPage = 1;
}

function handleApplyFilters() {
    // Get role filters
    const roleCheckboxes = document.querySelectorAll('input[name="roleFilter"]:checked');
    UsersPageState.filters.roles = Array.from(roleCheckboxes).map(cb => cb.value);

    // Get status filters
    const statusCheckboxes = document.querySelectorAll('input[name="statusFilter"]:checked');
    UsersPageState.filters.statuses = Array.from(statusCheckboxes).map(cb => cb.value);

    // Get clinic filter
    const clinicSelect = document.querySelector('select[name="clinicFilter"]');
    UsersPageState.filters.clinic = clinicSelect?.value || '';

    // Get search filter
    const searchInput = document.querySelector('.search-input');
    UsersPageState.filters.search = searchInput?.value || '';

    // Apply filters and update UI
    applyFilters();
    renderUserTable();
    updatePagination();
    updateTabCounts();

    // Close modal
    hideModal('filterModal');

    // Show notification
    showNotification('Filters applied successfully', 'success');
}

function handleClearFilters() {
    // Reset all filter checkboxes
    document.querySelectorAll('input[name="roleFilter"]').forEach(cb => cb.checked = true);
    document.querySelectorAll('input[name="statusFilter"]').forEach(cb => cb.checked = true);

    // Reset select and search
    const clinicSelect = document.querySelector('select[name="clinicFilter"]');
    if (clinicSelect) clinicSelect.value = '';

    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.value = '';

    // Reset state
    UsersPageState.filters = {
        roles: ['patients', 'doctors', 'receptionists', 'clinic-owners'],
        statuses: ['active', 'suspended', 'pending'],
        clinic: '',
        search: ''
    };

    // Apply filters and update UI
    applyFilters();
    renderUserTable();
    updatePagination();
    updateTabCounts();

    showNotification('Filters cleared', 'info');
}

// ===================================
// TABLE FUNCTIONS
// ===================================

function renderUserTable() {
    const tbody = document.querySelector('#userTable tbody');
    if (!tbody) return;

    // Calculate pagination
    const startIndex = (UsersPageState.currentPage - 1) * UsersPageState.itemsPerPage;
    const endIndex = startIndex + UsersPageState.itemsPerPage;
    const pageUsers = UsersPageState.filteredUsers.slice(startIndex, endIndex);

    // Clear existing rows
    tbody.innerHTML = '';

    // Render rows
    pageUsers.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });

    // Update selected count
    updateSelectedCount();

    // Re-attach event listeners
    attachTableEventListeners();
}

function createUserRow(user) {
    const row = document.createElement('tr');
    row.className = 'user-row';
    row.dataset.userId = user.id;

    if (UsersPageState.selectedUsers.has(user.id)) {
        row.classList.add('selected');
    }

    const roleDisplay = {
        'patient': { icon: 'fa-user-injured', label: 'Patient' },
        'doctor': { icon: 'fa-user-md', label: 'Doctor' },
        'receptionist': { icon: 'fa-user-pen', label: 'Receptionist' },
        'clinic-owner': { icon: 'fa-building', label: 'Clinic Owner' }
    };

    const statusClass = {
        'active': 'active',
        'suspended': 'suspended',
        'pending': 'pending'
    };

    const loginClass = user.lastLogin === 'Today' ? 'recent' :
        user.lastLogin === 'Never' ? 'never' : 'old';

    row.innerHTML = `
        <td>
            <input type="checkbox" class="row-checkbox" data-user-id="${user.id}" 
                ${UsersPageState.selectedUsers.has(user.id) ? 'checked' : ''}>
        </td>
        <td class="user-id">${user.id}</td>
        <td class="user-name">
            <div class="name-cell">
                <img src="${user.avatar}" alt="Profile" class="user-avatar">
                <div class="name-info">
                    <span class="name">${user.name}</span>
                    <span class="email">${user.email}</span>
                </div>
            </div>
        </td>
        <td class="user-role">
            <span class="role-badge ${user.role}">
                <i class="fas ${roleDisplay[user.role].icon}"></i>
                ${roleDisplay[user.role].label}
            </span>
        </td>
        <td class="user-status">
            <span class="status-badge ${statusClass[user.status]}">
                <i class="fas fa-circle"></i>
                ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
        </td>
        <td class="user-clinic">${user.clinic}</td>
        <td class="user-created">${user.created}</td>
        <td class="user-login">
            <span class="login-time ${loginClass}">${user.lastLogin}</span>
        </td>
        <td class="user-actions">
            <div class="action-dropdown">
                <button class="action-btn" data-user-id="${user.id}">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        </td>
    `;

    return row;
}

function attachTableEventListeners() {
    // Re-attach checkbox listeners
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleRowSelect);
    });

    // Re-attach action button listeners
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleActionMenu);
    });
}

function handleSort(e) {
    const header = e.currentTarget;
    const column = header.dataset.sort;

    // Update sort state
    if (UsersPageState.currentSort.column === column) {
        UsersPageState.currentSort.direction = UsersPageState.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        UsersPageState.currentSort.column = column;
        UsersPageState.currentSort.direction = 'asc';
    }

    // Sort the filtered users
    UsersPageState.filteredUsers.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];

        // Handle dates
        if (column === 'created') {
            aVal = new Date(aVal.split('/').reverse().join('-'));
            bVal = new Date(bVal.split('/').reverse().join('-'));
        }

        // Handle last login
        if (column === 'login') {
            const loginOrder = {
                'Today': 0,
                'Yesterday': 1,
                '2 days ago': 2,
                '3 days ago': 3,
                '5 days ago': 5,
                '1 week ago': 7,
                '2 weeks ago': 14,
                'Never': 999
            };
            aVal = loginOrder[a.lastLogin] || 999;
            bVal = loginOrder[b.lastLogin] || 999;
        }

        // Compare
        if (aVal < bVal) return UsersPageState.currentSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return UsersPageState.currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Update UI
    updateSortIndicators();
    renderUserTable();
}

function updateSortIndicators() {
    // Reset all indicators
    document.querySelectorAll('.sortable i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });

    // Update current column indicator
    const currentHeader = document.querySelector(`[data-sort="${UsersPageState.currentSort.column}"] i`);
    if (currentHeader) {
        currentHeader.className = UsersPageState.currentSort.direction === 'asc'
            ? 'fas fa-sort-up'
            : 'fas fa-sort-down';
    }
}

// ===================================
// SELECTION FUNCTIONS
// ===================================

function handleSelectAll(e) {
    const isChecked = e.target.checked;

    // Get current page users
    const startIndex = (UsersPageState.currentPage - 1) * UsersPageState.itemsPerPage;
    const endIndex = startIndex + UsersPageState.itemsPerPage;
    const pageUsers = UsersPageState.filteredUsers.slice(startIndex, endIndex);

    if (isChecked) {
        pageUsers.forEach(user => UsersPageState.selectedUsers.add(user.id));
    } else {
        pageUsers.forEach(user => UsersPageState.selectedUsers.delete(user.id));
    }

    // Update UI
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        checkbox.checked = isChecked;
    });

    updateSelectedCount();
}

function handleRowSelect(e) {
    const userId = e.target.dataset.userId;
    const row = e.target.closest('.user-row');

    if (e.target.checked) {
        UsersPageState.selectedUsers.add(userId);
        row?.classList.add('selected');
    } else {
        UsersPageState.selectedUsers.delete(userId);
        row?.classList.remove('selected');
    }

    updateSelectedCount();
    updateSelectAllCheckbox();
}

function updateSelectedCount() {
    const count = UsersPageState.selectedUsers.size;
    const selectedCountEl = document.getElementById('selectedCount');
    if (selectedCountEl) {
        selectedCountEl.textContent = count;
    }

    // Show/hide bulk actions panel
    const bulkPanel = document.getElementById('bulkActionsPanel');
    if (bulkPanel) {
        if (count > 0) {
            bulkPanel.classList.remove('hidden');
        } else {
            bulkPanel.classList.add('hidden');
        }
    }
}

function updateSelectAllCheckbox() {
    const selectAll = document.getElementById('selectAll');
    if (!selectAll) return;

    const checkboxes = document.querySelectorAll('.row-checkbox');
    const checkedCount = document.querySelectorAll('.row-checkbox:checked').length;

    selectAll.checked = checkboxes.length > 0 && checkedCount === checkboxes.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
}

// ===================================
// TAB NAVIGATION
// ===================================

function handleTabSwitch(e) {
    const tab = e.currentTarget;
    const tabValue = tab.dataset.tab;

    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    tab.classList.add('active');

    // Update state
    UsersPageState.currentTab = tabValue;

    // Apply filters and render
    applyFilters();
    renderUserTable();
    updatePagination();
}

function updateTabCounts() {
    const counts = {
        active: 0,
        suspended: 0,
        pending: 0
    };

    UsersPageState.users.forEach(user => {
        if (counts.hasOwnProperty(user.status)) {
            counts[user.status]++;
        }
    });

    // Update tab counts
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const tab = btn.dataset.tab;
        const countEl = btn.querySelector('.tab-count');
        if (countEl && counts.hasOwnProperty(tab)) {
            countEl.textContent = counts[tab];
        }
    });
}

// ===================================
// PAGINATION
// ===================================

function handlePagination(e) {
    const btn = e.currentTarget;

    if (btn.disabled) return;

    if (btn.textContent.includes('fa-chevron-left')) {
        UsersPageState.currentPage = Math.max(1, UsersPageState.currentPage - 1);
    } else if (btn.textContent.includes('fa-chevron-right')) {
        const maxPage = Math.ceil(UsersPageState.filteredUsers.length / UsersPageState.itemsPerPage);
        UsersPageState.currentPage = Math.min(maxPage, UsersPageState.currentPage + 1);
    } else {
        UsersPageState.currentPage = parseInt(btn.textContent);
    }

    renderUserTable();
    updatePagination();
}

function updatePagination() {
    const totalItems = UsersPageState.filteredUsers.length;
    const totalPages = Math.ceil(totalItems / UsersPageState.itemsPerPage);
    const currentPage = UsersPageState.currentPage;

    // Update info
    const startItem = (currentPage - 1) * UsersPageState.itemsPerPage + 1;
    const endItem = Math.min(currentPage * UsersPageState.itemsPerPage, totalItems);

    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} users`;
    }

    // Update controls
    const paginationControls = document.querySelector('.pagination-controls');
    if (!paginationControls) return;

    let html = '';

    // Previous button
    html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
    </button>`;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        html += `<button class="page-btn">1</button>`;
        if (startPage > 2) {
            html += `<span class="page-dots">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="page-dots">...</span>`;
        }
        html += `<button class="page-btn">${totalPages}</button>`;
    }

    // Next button
    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
    </button>`;

    paginationControls.innerHTML = html;

    // Re-attach event listeners
    paginationControls.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', handlePagination);
    });
}

// ===================================
// ACTION MENU
// ===================================

function handleActionMenu(e) {
    e.stopPropagation();

    const userId = e.currentTarget.dataset.userId;
    const user = UsersPageState.users.find(u => u.id === userId);

    // Close any open menus
    closeAllActionMenus();

    // Create and show menu
    const menu = document.getElementById('userActionsMenu');
    if (!menu) return;

    // Position menu
    const rect = e.currentTarget.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = rect.bottom + 'px';
    menu.style.left = (rect.left - 150) + 'px';

    // Store current user context
    menu.dataset.userId = userId;

    // Update menu items based on user status
    updateActionMenuItems(user);

    // Show menu
    menu.classList.remove('hidden');
}

function updateActionMenuItems(user) {
    const suspendBtn = document.querySelector('[data-action="suspend"]');
    if (suspendBtn) {
        const icon = suspendBtn.querySelector('i');
        const text = suspendBtn.querySelector('span');

        if (user.status === 'active') {
            icon.className = 'fas fa-pause';
            text.textContent = 'Suspend User';
        } else {
            icon.className = 'fas fa-play';
            text.textContent = 'Activate User';
        }
    }
}

function closeAllActionMenus() {
    document.querySelectorAll('.actions-dropdown-menu').forEach(menu => {
        menu.classList.add('hidden');
    });
}

// ===================================
// USER ACTIONS
// ===================================

function initializeActionMenuHandlers() {
    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', handleUserAction);
    });
}

function handleUserAction(e) {
    const action = e.currentTarget.dataset.action;
    const menu = e.currentTarget.closest('.actions-dropdown-menu');
    const userId = menu?.dataset.userId;

    if (!userId) return;

    // Close menu
    closeAllActionMenus();

    switch (action) {
        case 'view':
            viewUserProfile(userId);
            break;
        case 'edit':
            editUserProfile(userId);
            break;
        case 'change-role':
            changeUserRole(userId);
            break;
        case 'reset-password':
            resetUserPassword(userId);
            break;
        case 'suspend':
            toggleUserStatus(userId);
            break;
        case 'delete':
            deleteUser(userId);
            break;
        case 'activity-log':
            viewActivityLog(userId);
            break;
        case 'send-message':
            sendUserMessage(userId);
            break;
    }
}

function viewUserProfile(userId) {
    const user = UsersPageState.users.find(u => u.id === userId);
    if (!user) return;

    // Populate profile modal
    populateProfileModal(user, true);

    // Show modal
    showModal('userProfileModal');
}

function editUserProfile(userId) {
    const user = UsersPageState.users.find(u => u.id === userId);
    if (!user) return;

    // Populate profile modal
    populateProfileModal(user, false);

    // Show modal
    showModal('userProfileModal');
}

function populateProfileModal(user, readOnly = false) {
    // Set user data
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPhone').value = user.phone;
    document.getElementById('userId').value = user.id;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').checked = user.status === 'active';
    document.getElementById('userClinic').value = user.clinic === '-' ? '' : user.clinic;

    // Set read-only state
    const inputs = document.querySelectorAll('#userProfileModal input:not([type="checkbox"]), #userProfileModal select');
    inputs.forEach(input => {
        if (input.id !== 'userId') {
            input.readOnly = readOnly;
            input.disabled = readOnly;
        }
    });

    // Update modal title
    const modalHeader = document.querySelector('#userProfileModal .modal-header h2');
    if (modalHeader) {
        modalHeader.textContent = readOnly ? 'View User Profile' : 'Edit User Profile';
    }

    // Store user ID for actions
    document.getElementById('userProfileModal').dataset.userId = user.id;
}

function changeUserRole(userId) {
    editUserProfile(userId);
    // Focus on role select
    setTimeout(() => {
        document.getElementById('userRole')?.focus();
    }, 300);
}

function resetUserPassword(userId) {
    const user = UsersPageState.users.find(u => u.id === userId);
    if (!user) return;

    if (confirm(`Reset password for ${user.name}?\n\nA temporary password will be sent to their email.`)) {
        // Simulate API call
        showNotification(`Password reset email sent to ${user.email}`, 'success');

        // Log activity
        addActivityLog(userId, 'password-change', 'Password reset by admin');
    }
}

function toggleUserStatus(userId) {
    const user = UsersPageState.users.find(u => u.id === userId);
    if (!user) return;

    if (user.status === 'active') {
        // Show suspension modal
        document.getElementById('suspensionModal').dataset.userId = userId;
        showModal('suspensionModal');
    } else {
        // Activate user
        if (confirm(`Activate user ${user.name}?`)) {
            user.status = 'active';
            updateMetricsDisplay();
            updateTabCounts();
            renderUserTable();
            showNotification(`User ${user.name} activated`, 'success');

            // Log activity
            addActivityLog(userId, 'activation', 'User activated by admin');
        }
    }
}

function deleteUser(userId) {
    const user = UsersPageState.users.find(u => u.id === userId);
    if (!user) return;

    // Add to deactivation modal
    UsersPageState.selectedUsers.clear();
    UsersPageState.selectedUsers.add(userId);

    // Update deactivation modal
    const usersList = document.querySelector('#deactivationModal .selected-users-list');
    if (usersList) {
        usersList.innerHTML = `<div class="user-item">${user.name} (${user.id})</div>`;
    }

    showModal('deactivationModal');
}

function viewActivityLog(userId) {
    const user = UsersPageState.users.find(u => u.id === userId);
    if (!user) return;

    // Set filter to specific user
    const userFilter = document.getElementById('logUserFilter');
    if (userFilter) {
        userFilter.value = userId;
    }

    // Apply filter and show modal
    handleApplyLogFilters();
    showModal('auditLogModal');
}

function sendUserMessage(userId) {
    const user = UsersPageState.users.find(u => u.id === userId);
    if (!user) return;

    // Set recipient
    document.querySelector('input[name="recipientType"][value="individual"]').checked = true;
    handleRecipientTypeChange();

    // Set user in dropdown
    const userSelect = document.querySelector('#individualSelection select');
    if (userSelect) {
        userSelect.value = userId;
    }

    showModal('communicationModal');
}

// ===================================
// PROFILE ACTIONS
// ===================================

function handleSaveUserChanges() {
    const modal = document.getElementById('userProfileModal');
    const userId = modal?.dataset.userId;

    if (!userId) return;

    const user = UsersPageState.users.find(u => u.id === userId);
    if (!user) return;

    // Get updated values
    const updates = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        phone: document.getElementById('userPhone').value,
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').checked ? 'active' : 'suspended',
        clinic: document.getElementById('userClinic').value || '-'
    };

    // Validate
    if (!updates.name || !updates.email || !updates.phone) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Update user
    Object.assign(user, updates);

    // Update UI
    updateMetricsDisplay();
    updateTabCounts();
    renderUserTable();

    // Close modal
    hideModal('userProfileModal');

    showNotification('User profile updated successfully', 'success');

    // Log activity
    addActivityLog(userId, 'profile-update', 'Profile updated by admin');
}

function handleResetPassword() {
    const modal = document.getElementById('userProfileModal');
    const userId = modal?.dataset.userId;

    if (userId) {
        resetUserPassword(userId);
    }
}

function handleAddUserNote() {
    const modal = document.getElementById('userProfileModal');
    const userId = modal?.dataset.userId;
    const notes = document.getElementById('userNotes')?.value;

    if (!userId || !notes) {
        showNotification('Please enter a note', 'error');
        return;
    }

    // Save note (in production, this would be an API call)
    showNotification('Note added successfully', 'success');

    // Clear notes field
    document.getElementById('userNotes').value = '';

    // Log activity
    addActivityLog(userId, 'note-added', 'Admin note added');
}

// ===================================
// SUSPENSION HANDLING
// ===================================

function handleSuspensionReasonChange(e) {
    const otherReasonGroup = document.getElementById('otherReasonGroup');
    if (otherReasonGroup) {
        otherReasonGroup.style.display = e.target.value === 'other' ? 'block' : 'none';
    }
}

function handleSuspensionDurationChange(e) {
    const dateRangeGroup = document.getElementById('dateRangeGroup');
    if (dateRangeGroup) {
        dateRangeGroup.style.display = e.target.value === 'temporary' ? 'block' : 'none';
    }
}

function handleConfirmSuspension() {
    const modal = document.getElementById('suspensionModal');
    const userId = modal?.dataset.userId;

    if (!userId) return;

    const user = UsersPageState.users.find(u => u.id === userId);
    if (!user) return;

    // Get suspension details
    const reason = document.querySelector('input[name="suspensionReason"]:checked')?.value;
    const duration = document.querySelector('input[name="suspensionDuration"]:checked')?.value;
    const notes = document.getElementById('suspensionNotes')?.value;

    if (!reason) {
        showNotification('Please select a suspension reason', 'error');
        return;
    }

    // Update user status
    user.status = 'suspended';

    // Update UI
    updateMetricsDisplay();
    updateTabCounts();
    renderUserTable();

    // Close modal
    hideModal('suspensionModal');

    showNotification(`User ${user.name} suspended`, 'warning');

    // Log activity
    addActivityLog(userId, 'suspension', `Suspended: ${reason}`);

    // Send notifications if checked
    const emailNotify = document.querySelector('input[name="notifyUser"][value="email"]:checked');
    const smsNotify = document.querySelector('input[name="notifyUser"][value="sms"]:checked');

    if (emailNotify || smsNotify) {
        const methods = [];
        if (emailNotify) methods.push('email');
        if (smsNotify) methods.push('SMS');
        showNotification(`Suspension notification sent via ${methods.join(' and ')}`, 'info');
    }
}

// ===================================
// CREATE USER
// ===================================

function handleCreateUser() {
    // Get form values
    const role = document.querySelector('input[name="newUserRole"]:checked')?.value;
    const name = document.getElementById('newUserName')?.value;
    const email = document.getElementById('newUserEmail')?.value;
    const phone = document.getElementById('newUserPhone')?.value;
    const password = document.getElementById('newUserPassword')?.value;
    const autoGenerate = document.getElementById('autoGeneratePassword')?.checked;
    const clinic = document.getElementById('newUserClinic')?.value || '-';
    const status = document.querySelector('input[name="newUserStatus"]:checked')?.value || 'active';

    // Validate
    if (!role || !name || !email || !phone) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Generate password if needed
    const finalPassword = autoGenerate ? generateSecurePassword() : password;

    if (!finalPassword) {
        showNotification('Please provide a password or enable auto-generation', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: `U${String(UsersPageState.users.length + 1).padStart(3, '0')}`,
        name: name,
        email: email,
        phone: phone,
        role: role,
        status: status,
        clinic: clinic,
        created: new Date().toLocaleDateString('en-GB'),
        lastLogin: 'Never',
        avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png'
    };

    // Add to users array
    UsersPageState.users.push(newUser);

    // Update UI
    updateMetricsDisplay();
    updateTabCounts();
    applyFilters();
    renderUserTable();
    updatePagination();

    // Close modal
    hideModal('createUserModal');

    // Clear form
    document.getElementById('createUserModal').querySelectorAll('input').forEach(input => {
        if (input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.type === 'password') {
            input.value = '';
        } else if (input.type === 'radio') {
            input.checked = false;
        }
    });

    showNotification(`User ${name} created successfully`, 'success');

    // Send credentials
    if (autoGenerate) {
        showNotification(`Temporary password sent to ${email}`, 'info');
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('newUserPassword');
    const toggleBtn = document.getElementById('togglePassword');
    const icon = toggleBtn?.querySelector('i');

    if (passwordInput && icon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
}

function handleAutoGeneratePassword(e) {
    const passwordInput = document.getElementById('newUserPassword');
    const toggleBtn = document.getElementById('togglePassword');

    if (passwordInput) {
        passwordInput.disabled = e.target.checked;
        if (toggleBtn) {
            toggleBtn.disabled = e.target.checked;
        }

        if (e.target.checked) {
            passwordInput.value = '';
            passwordInput.placeholder = 'Password will be auto-generated';
        } else {
            passwordInput.placeholder = 'Enter password';
        }
    }
}

function generateSecurePassword() {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
}

// ===================================
// BATCH UPLOAD
// ===================================

function handleDownloadTemplate() {
    // Create CSV template
    const headers = ['name', 'email', 'phone', 'role', 'clinic', 'status'];
    const sampleData = [
        ['John Doe', 'john.doe@example.com', '+254712345678', 'doctor', 'Nairobi Medical Center', 'active'],
        ['Jane Smith', 'jane.smith@example.com', '+254723456789', 'patient', '', 'active']
    ];

    let csv = headers.join(',') + '\n';
    sampleData.forEach(row => {
        csv += row.join(',') + '\n';
    });

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processCSVFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
        processCSVFile(file);
    } else {
        showNotification('Please upload a CSV file', 'error');
    }
}

function processCSVFile(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const csvData = e.target.result;
        const parsedData = parseCSV(csvData);

        if (parsedData.valid.length > 0 || parsedData.errors.length > 0) {
            displayPreview(parsedData);
        }
    };

    reader.readAsText(file);
}

function parseCSV(csvData) {
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const valid = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const user = {};
        let hasError = false;
        let errorMsg = '';

        headers.forEach((header, index) => {
            user[header] = values[index] || '';
        });

        // Validate required fields
        if (!user.name || !user.email || !user.phone || !user.role) {
            hasError = true;
            errorMsg = 'Missing required fields';
        }

        // Validate email format
        if (user.email && !isValidEmail(user.email)) {
            hasError = true;
            errorMsg = 'Invalid email format';
        }

        // Validate role
        const validRoles = ['patient', 'doctor', 'receptionist', 'clinic-owner'];
        if (user.role && !validRoles.includes(user.role)) {
            hasError = true;
            errorMsg = 'Invalid role';
        }

        if (hasError) {
            errors.push({ row: i, data: user, error: errorMsg });
        } else {
            valid.push(user);
        }
    }

    return { valid, errors };
}

function displayPreview(parsedData) {
    const preview = document.getElementById('uploadPreview');
    const validCount = document.getElementById('validRecords');
    const errorCount = document.getElementById('errorRecords');
    const importBtn = document.getElementById('importUsersBtn');

    if (!preview) return;

    // Update counts
    if (validCount) validCount.textContent = `${parsedData.valid.length} valid records`;
    if (errorCount) errorCount.textContent = `${parsedData.errors.length} errors`;

    // Show/hide import button
    if (importBtn) {
        if (parsedData.valid.length > 0) {
            importBtn.classList.remove('hidden');
        } else {
            importBtn.classList.add('hidden');
        }
    }

    // Create preview table
    const thead = document.getElementById('previewTableHead');
    const tbody = document.getElementById('previewTableBody');

    if (thead && tbody) {
        // Headers
        thead.innerHTML = `
            <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Clinic</th>
            </tr>
        `;

        // Rows
        tbody.innerHTML = '';

        // Valid records
        parsedData.valid.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><i class="fas fa-check-circle" style="color: var(--success-green)"></i></td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.role}</td>
                <td>${user.clinic || '-'}</td>
            `;
            tbody.appendChild(row);
        });

        // Error records
        parsedData.errors.forEach(item => {
            const row = document.createElement('tr');
            row.style.backgroundColor = '#FEE2E2';
            row.innerHTML = `
                <td><i class="fas fa-times-circle" style="color: var(--error-red)"></i></td>
                <td>${item.data.name || '-'}</td>
                <td>${item.data.email || '-'}</td>
                <td>${item.data.phone || '-'}</td>
                <td>${item.data.role || '-'}</td>
                <td>${item.data.clinic || '-'}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Store parsed data for import
    preview.dataset.parsedData = JSON.stringify(parsedData);

    // Show preview
    preview.classList.remove('hidden');
}

function handleImportUsers() {
    const preview = document.getElementById('uploadPreview');
    const parsedData = JSON.parse(preview?.dataset.parsedData || '{}');

    if (!parsedData.valid || parsedData.valid.length === 0) {
        showNotification('No valid records to import', 'error');
        return;
    }

    // Import users
    let imported = 0;
    parsedData.valid.forEach(userData => {
        const newUser = {
            id: `U${String(UsersPageState.users.length + imported + 1).padStart(3, '0')}`,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            status: userData.status || 'active',
            clinic: userData.clinic || '-',
            created: new Date().toLocaleDateString('en-GB'),
            lastLogin: 'Never',
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png'
        };

        UsersPageState.users.push(newUser);
        imported++;
    });

    // Update UI
    updateMetricsDisplay();
    updateTabCounts();
    applyFilters();
    renderUserTable();
    updatePagination();

    // Close modal
    hideModal('batchUploadModal');

    // Reset upload area
    document.getElementById('uploadPreview')?.classList.add('hidden');
    document.getElementById('csvFileInput').value = '';

    showNotification(`Successfully imported ${imported} users`, 'success');
}

// ===================================
// COMMUNICATION
// ===================================

function handleRecipientTypeChange(e) {
    const individualSelection = document.getElementById('individualSelection');
    const groupSelection = document.getElementById('groupSelection');

    if (e?.target?.value === 'individual' || document.querySelector('input[name="recipientType"][value="individual"]')?.checked) {
        individualSelection?.style.removeProperty('display');
        groupSelection?.style.setProperty('display', 'none');
    } else {
        individualSelection?.style.setProperty('display', 'none');
        groupSelection?.style.removeProperty('display');
    }
}

function handleMessageScheduleChange(e) {
    const scheduleDateTime = document.getElementById('scheduleDateTime');
    if (scheduleDateTime) {
        scheduleDateTime.style.display = e.target.value === 'schedule' ? 'block' : 'none';
    }
}

function handleTemplateChange(e) {
    const templates = {
        welcome: {
            subject: 'Welcome to Curis by Citrus',
            content: 'Dear {name},\n\nWelcome to Curis by Citrus! Your account has been successfully created.\n\nBest regards,\nCuris Team'
        },
        suspension: {
            subject: 'Account Suspension Notice',
            content: 'Dear {name},\n\nYour account has been suspended. Please contact support for more information.\n\nBest regards,\nCuris Team'
        },
        'password-reset': {
            subject: 'Password Reset',
            content: 'Dear {name},\n\nYour password has been reset. Your temporary password is: {password}\n\nPlease change it upon login.\n\nBest regards,\nCuris Team'
        },
        maintenance: {
            subject: 'Scheduled Maintenance',
            content: 'Dear {name},\n\nWe will be performing scheduled maintenance on {date} from {time}.\n\nBest regards,\nCuris Team'
        }
    };

    const template = templates[e.target.value];
    if (template) {
        document.getElementById('messageSubject').value = template.subject;
        document.getElementById('messageContent').value = template.content;
    }
}

function handleSendMessage() {
    const recipientType = document.querySelector('input[name="recipientType"]:checked')?.value;
    const messageType = document.querySelector('input[name="messageType"]:checked')?.value;
    const subject = document.getElementById('messageSubject')?.value;
    const content = document.getElementById('messageContent')?.value;
    const schedule = document.querySelector('input[name="messageSchedule"]:checked')?.value;

    // Validate
    if (!recipientType || !messageType || !subject || !content) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Get recipients count
    let recipientCount = 0;
    if (recipientType === 'individual') {
        recipientCount = 1;
    } else {
        const selectedGroups = document.querySelectorAll('input[name="userGroup"]:checked');
        selectedGroups.forEach(group => {
            switch (group.value) {
                case 'doctors':
                    recipientCount += UsersPageState.metrics.byRole.doctors;
                    break;
                case 'patients':
                    recipientCount += UsersPageState.metrics.byRole.patients;
                    break;
                case 'clinic-owners':
                    recipientCount += UsersPageState.metrics.byRole.clinicOwners;
                    break;
            }
        });
    }

    // Send message
    const messageMethod = messageType === 'both' ? 'Email and SMS' : messageType.toUpperCase();
    const when = schedule === 'schedule' ? 'scheduled' : 'sent';

    showNotification(`${messageMethod} ${when} to ${recipientCount} recipient(s)`, 'success');

    // Close modal
    hideModal('communicationModal');

    // Clear form
    document.getElementById('messageSubject').value = '';
    document.getElementById('messageContent').value = '';
    document.getElementById('messageTemplate').value = '';
}

// ===================================
// ACTIVITY LOGS
// ===================================

function handleApplyLogFilters() {
    // This would fetch filtered logs from API
    // For demo, just show existing logs
    showNotification('Log filters applied', 'info');
}

function handleExportLogs() {
    // Create CSV of logs
    const csv = 'Time,Action,User,Details\n' +
        'Today 10:30 AM,Login Success,Dr. John Doe (U001),IP: 197.248.15.42\n' +
        'Today 10:45 AM,Profile Updated,Dr. John Doe (U001),Updated phone number';

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity_logs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showNotification('Activity logs exported', 'success');
}

function addActivityLog(userId, action, details) {
    // In production, this would be an API call
    console.log(`Activity Log: User ${userId} - ${action} - ${details}`);
}

// ===================================
// NOTIFICATION SETTINGS
// ===================================

function handleSaveNotificationSettings() {
    // Save notification preferences
    showNotification('Notification settings saved', 'success');
    hideModal('notificationSettingsModal');
}

function handleAddCustomRule() {
    // Would open a rule creation interface
    showNotification('Custom rule feature coming soon', 'info');
}

// ===================================
// DEACTIVATION
// ===================================

function handleConfirmationText(e) {
    const proceedBtn = document.getElementById('proceedDeactivation');
    if (proceedBtn) {
        proceedBtn.disabled = e.target.value !== 'CONFIRM';
    }
}

function handleProceedDeactivation() {
    const actionType = document.querySelector('input[name="actionType"]:checked')?.value;
    const selectedCount = UsersPageState.selectedUsers.size;

    if (actionType === 'delete') {
        // Permanent deletion
        if (confirm(`This will permanently delete ${selectedCount} user(s). This action cannot be undone. Continue?`)) {
            // Remove users
            UsersPageState.users = UsersPageState.users.filter(user =>
                !UsersPageState.selectedUsers.has(user.id)
            );

            showNotification(`${selectedCount} user(s) permanently deleted`, 'error');
        }
    } else {
        // Deactivation
        UsersPageState.users.forEach(user => {
            if (UsersPageState.selectedUsers.has(user.id)) {
                user.status = 'suspended';
            }
        });

        showNotification(`${selectedCount} user(s) deactivated`, 'warning');
    }

    // Clear selection
    UsersPageState.selectedUsers.clear();

    // Update UI
    updateMetricsDisplay();
    updateTabCounts();
    applyFilters();
    renderUserTable();
    updatePagination();

    // Close modal
    hideModal('deactivationModal');
}

// ===================================
// METRICS UPDATE
// ===================================

function updateMetricsDisplay() {
    // Recalculate metrics
    const metrics = {
        total: UsersPageState.users.length,
        byRole: {
            patients: 0,
            doctors: 0,
            receptionists: 0,
            clinicOwners: 0
        },
        byStatus: {
            active: 0,
            suspended: 0,
            pending: 0
        }
    };

    UsersPageState.users.forEach(user => {
        // By role
        switch (user.role) {
            case 'patient':
                metrics.byRole.patients++;
                break;
            case 'doctor':
                metrics.byRole.doctors++;
                break;
            case 'receptionist':
                metrics.byRole.receptionists++;
                break;
            case 'clinic-owner':
                metrics.byRole.clinicOwners++;
                break;
        }

        // By status
        if (metrics.byStatus.hasOwnProperty(user.status)) {
            metrics.byStatus[user.status]++;
        }
    });

    UsersPageState.metrics = metrics;

    // Update UI
    animateNumber(document.querySelector('.metric-number'), metrics.total);

    // Update role breakdown
    const roleBreakdown = document.querySelectorAll('.breakdown-section.roles .breakdown-item strong');
    if (roleBreakdown.length >= 4) {
        animateNumber(roleBreakdown[0], metrics.byRole.patients);
        animateNumber(roleBreakdown[1], metrics.byRole.doctors);
        animateNumber(roleBreakdown[2], metrics.byRole.receptionists);
        animateNumber(roleBreakdown[3], metrics.byRole.clinicOwners);
    }

    // Update status breakdown
    const statusBreakdown = document.querySelectorAll('.breakdown-section.status .breakdown-item strong');
    if (statusBreakdown.length >= 3) {
        animateNumber(statusBreakdown[0], metrics.byStatus.active);
        animateNumber(statusBreakdown[1], metrics.byStatus.suspended);
        animateNumber(statusBreakdown[2], metrics.byStatus.pending);
    }
}

// ===================================
// MODAL MANAGEMENT
// ===================================

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Hide any open modals first
    document.querySelectorAll('.modal-overlay').forEach(m => {
        m.classList.add('hidden');
    });

    // Show the modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Initialize any modal-specific handlers
    initializeModalHandlers(modalId);

    // Trap focus
    trapFocus(modal);
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function initializeModalHandlers(modalId) {
    // Initialize action menu handlers when user actions menu is created
    if (!document.querySelector('.action-item[data-initialized]')) {
        initializeActionMenuHandlers();
        document.querySelectorAll('.action-item').forEach(item => {
            item.dataset.initialized = 'true';
        });
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function animateNumber(element, targetNumber) {
    if (!element || !element.textContent) return;

    const currentNumber = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const increment = (targetNumber - currentNumber) / 20;
    let current = currentNumber;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= targetNumber) ||
            (increment < 0 && current <= targetNumber)) {
            current = targetNumber;
            clearInterval(timer);
        }
        element.textContent = Math.round(current).toLocaleString();
    }, 50);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' :
            type === 'error' ? 'times-circle' :
                type === 'warning' ? 'exclamation-triangle' :
                    'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Add animation class
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }

        if (e.key === 'Escape') {
            const modalId = element.id;
            hideModal(modalId);
        }
    });
}

// ===================================
// THEME MANAGEMENT
// ===================================

function toggleDarkMode() {
    const newTheme = UsersPageState.currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    UsersPageState.currentTheme = newTheme;
    localStorage.setItem('theme', newTheme);

    // Update button text
    const darkModeBtn = document.getElementById('darkModeToggle');
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
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

// ===================================
// HEADER FUNCTIONS (FROM DASHBOARD)
// ===================================

function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    const dropdown = document.getElementById('userProfileDropdown');

    if (!panel) return;

    // Close user dropdown if open
    dropdown?.classList.add('hidden');

    panel.classList.toggle('hidden');
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userProfileDropdown');
    const panel = document.getElementById('notificationPanel');

    if (!dropdown) return;

    // Close notification panel if open
    panel?.classList.add('hidden');

    dropdown.classList.toggle('hidden');
}

function hideNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.add('hidden');
    }
}

function handleOutsideClick(e) {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdown = document.getElementById('userProfileDropdown');

    // Close notification panel if clicked outside
    if (notificationPanel && !notificationPanel.contains(e.target) &&
        !notificationBtn.contains(e.target)) {
        notificationPanel.classList.add('hidden');
    }

    // Close user dropdown if clicked outside
    if (userDropdown && !userDropdown.contains(e.target) &&
        !userProfileBtn.contains(e.target)) {
        userDropdown.classList.add('hidden');
    }

    // Close action menus if clicked outside
    const actionMenus = document.querySelectorAll('.actions-dropdown-menu');
    const actionBtns = document.querySelectorAll('.action-btn');
    let clickedOnAction = false;

    actionBtns.forEach(btn => {
        if (btn.contains(e.target)) {
            clickedOnAction = true;
        }
    });

    if (!clickedOnAction) {
        actionMenus.forEach(menu => {
            if (!menu.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
    }
}

// ===================================
// KEYBOARD SHORTCUTS
// ===================================

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K: Quick search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
    }

    // Ctrl/Cmd + N: Add new user
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showModal('createUserModal');
    }

    // Ctrl/Cmd + F: Filter
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        showModal('filterModal');
    }

    // Ctrl/Cmd + A: Select all (when in table)
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('selectAll')?.click();
    }
}

// ===================================
// REAL-TIME UPDATES
// ===================================

function initializeRealTimeUpdates() {
    // Simulate real-time updates
    setInterval(() => {
        // Random user status changes
        if (Math.random() > 0.95) {
            const randomUser = UsersPageState.users[Math.floor(Math.random() * UsersPageState.users.length)];
            if (randomUser) {
                // Simulate login
                randomUser.lastLogin = 'Just now';

                // Update table if user is visible
                const userRow = document.querySelector(`[data-user-id="${randomUser.id}"]`);
                if (userRow) {
                    const loginCell = userRow.querySelector('.user-login .login-time');
                    if (loginCell) {
                        loginCell.textContent = 'Just now';
                        loginCell.className = 'login-time recent';

                        // Highlight row briefly
                        userRow.style.backgroundColor = '#E6F7FF';
                        setTimeout(() => {
                            userRow.style.backgroundColor = '';
                        }, 2000);
                    }
                }
            }
        }

        // Update real-time indicator
        const indicator = document.querySelector('.status-indicator i');
        if (indicator) {
            indicator.style.animation = 'none';
            setTimeout(() => {
                indicator.style.animation = 'pulse 2s infinite';
            }, 10);
        }
    }, 5000);
}

// ===================================
// CLEANUP
// ===================================

window.addEventListener('beforeunload', function () {
    // Clean up any intervals or connections
    // This would be where WebSocket connections are closed
});

// ===================================
// NOTIFICATION TOAST STYLES
// ===================================

// Add dynamic styles for notification toasts
const style = document.createElement('style');
style.textContent = `
.notification-toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--white);
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(400px);
    transition: transform 0.3s ease-out;
    z-index: 1100;
}

.notification-toast.show {
    transform: translateX(0);
}

.notification-toast.success {
    border-left: 4px solid var(--success-green);
}

.notification-toast.error {
    border-left: 4px solid var(--error-red);
}

.notification-toast.warning {
    border-left: 4px solid var(--warning-yellow);
}

.notification-toast.info {
    border-left: 4px solid var(--info-blue);
}

.notification-toast i {
    font-size: 20px;
}

.notification-toast.success i {
    color: var(--success-green);
}

.notification-toast.error i {
    color: var(--error-red);
}

.notification-toast.warning i {
    color: var(--warning-yellow);
}

.notification-toast.info i {
    color: var(--info-blue);
}
`;
document.head.appendChild(style);
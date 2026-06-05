// ====================================
// CURIS CLINIC SERVICES HUB - JAVASCRIPT
// Service Configuration & Management System
// ====================================

// ====================================
// GLOBAL STATE & DATA MANAGEMENT
// ====================================
const ClinicServicesHub = {
    // Service data storage
    services: [
        {
            id: 'SVC001',
            name: 'General Consultation',
            category: 'consultations',
            description: 'Comprehensive medical examination and diagnosis for general health concerns',
            duration: 30,
            price: 1500,
            status: 'active',
            doctorsAssigned: 5,
            bookingsThisMonth: 42,
            icon: 'fa-stethoscope',
            prerequisites: [],
            insuranceProviders: ['nhif', 'jubilee'],
            discountType: null,
            discountValue: 0,
            vatApplicable: true,
            includesCurisFee: true
        },
        {
            id: 'SVC002',
            name: 'Blood Sugar Test',
            category: 'lab-tests',
            description: 'Glucose level testing for diabetes screening and monitoring',
            duration: 15,
            price: 800,
            status: 'active',
            doctorsAssigned: 3,
            bookingsThisMonth: 28,
            icon: 'fa-flask',
            prerequisites: [],
            insuranceProviders: ['nhif'],
            discountType: null,
            discountValue: 0,
            vatApplicable: true,
            includesCurisFee: true
        },
        {
            id: 'SVC003',
            name: 'Minor Surgery',
            category: 'procedures',
            description: 'Outpatient surgical procedures for minor conditions',
            duration: 90,
            price: 8500,
            status: 'inactive',
            doctorsAssigned: 2,
            bookingsThisMonth: 5,
            icon: 'fa-user-md',
            prerequisites: ['SVC001'],
            insuranceProviders: ['jubilee', 'britam'],
            discountType: null,
            discountValue: 0,
            vatApplicable: true,
            includesCurisFee: true
        },
        {
            id: 'SVC004',
            name: 'Vaccination',
            category: 'procedures',
            description: 'Immunization services for children and adults',
            duration: 15,
            price: 1200,
            status: 'active',
            doctorsAssigned: 4,
            bookingsThisMonth: 67,
            icon: 'fa-syringe',
            prerequisites: [],
            insuranceProviders: ['nhif', 'jubilee', 'britam'],
            discountType: null,
            discountValue: 0,
            vatApplicable: false,
            includesCurisFee: true
        },
        {
            id: 'SVC005',
            name: 'Post-Surgery Follow-up',
            category: 'followups',
            description: 'Post-operative care and wound monitoring',
            duration: 20,
            price: 1000,
            status: 'active',
            doctorsAssigned: 3,
            bookingsThisMonth: 12,
            icon: 'fa-redo-alt',
            prerequisites: ['SVC003'],
            insuranceProviders: ['jubilee'],
            discountType: null,
            discountValue: 0,
            vatApplicable: true,
            includesCurisFee: true
        },
        {
            id: 'SVC006',
            name: 'Complete Blood Count (CBC)',
            category: 'lab-tests',
            description: 'Comprehensive blood analysis including RBC, WBC, and platelets',
            duration: 10,
            price: 1200,
            status: 'active',
            doctorsAssigned: 2,
            bookingsThisMonth: 35,
            icon: 'fa-flask',
            prerequisites: [],
            insuranceProviders: ['nhif', 'jubilee', 'britam', 'aar'],
            discountType: null,
            discountValue: 0,
            vatApplicable: true,
            includesCurisFee: true
        }
    ],

    // Categories data
    categories: [
        {
            id: 'consultations',
            name: 'Consultations',
            description: 'Medical consultations and examinations',
            icon: 'fa-stethoscope',
            serviceCount: 10,
            order: 1
        },
        {
            id: 'lab-tests',
            name: 'Lab Tests',
            description: 'Laboratory testing and analysis',
            icon: 'fa-flask',
            serviceCount: 25,
            order: 2
        },
        {
            id: 'procedures',
            name: 'Medical Procedures',
            description: 'Surgical and medical procedures',
            icon: 'fa-user-md',
            serviceCount: 15,
            order: 3
        },
        {
            id: 'followups',
            name: 'Follow-ups',
            description: 'Post-treatment follow-up appointments',
            icon: 'fa-redo-alt',
            serviceCount: 5,
            order: 4
        }
    ],

    // Doctors data
    doctors: [
        {
            id: 'DOC001',
            name: 'Dr. James Kamau',
            specialty: 'General Practice',
            avatar: 'icons8-profile-picture-40.png'
        },
        {
            id: 'DOC002',
            name: 'Dr. Grace Wanjiru',
            specialty: 'Pediatrics',
            avatar: 'icons8-profile-picture-40.png'
        },
        {
            id: 'DOC003',
            name: 'Dr. Peter Mwangi',
            specialty: 'Cardiology',
            avatar: 'icons8-profile-picture-40.png'
        }
    ],

    // Filter state
    filters: {
        categories: ['consultations', 'lab-tests', 'procedures', 'followups'],
        status: 'all',
        doctorAssignment: 'all',
        priceMin: 0,
        priceMax: 10000
    },

    // Sort state
    sortBy: 'name',

    // View state
    viewMode: 'grid',

    // Selected services for bulk actions
    selectedServices: []
};

// ====================================
// INITIALIZATION
// ====================================
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    initializeCategories();
    renderServices();
    initializeCharts();
    initializeSortable();
});

// ====================================
// EVENT LISTENERS
// ====================================
function initializeEventListeners() {
    // Header Actions
    document.getElementById('globalServiceSearch').addEventListener('input', handleGlobalSearch);
    document.getElementById('addServiceBtn').addEventListener('click', openServiceCreationModal);
    document.getElementById('notificationBtn').addEventListener('click', toggleNotificationsPanel);
    document.getElementById('userProfileBtn').addEventListener('click', toggleUserDropdown);

    // Category Management
    document.getElementById('manageCategoriesBtn').addEventListener('click', openCategoryManagementModal);

    // Service Management Toolbar
    document.getElementById('advancedFilterBtn').addEventListener('click', openAdvancedFilterModal);
    document.getElementById('sortOptions').addEventListener('change', handleSortChange);
    document.getElementById('gridViewBtn').addEventListener('click', () => setViewMode('grid'));
    document.getElementById('listViewBtn').addEventListener('click', () => setViewMode('list'));
    document.getElementById('bulkActionsDropdown').addEventListener('change', handleBulkAction);
    document.getElementById('analyticsBtn').addEventListener('click', openAnalyticsModal);

    // Quick Actions
    document.getElementById('importServicesBtn').addEventListener('click', openImportModal);
    document.getElementById('exportAllBtn').addEventListener('click', exportAllServices);
    document.getElementById('serviceTemplatesBtn').addEventListener('click', openTemplatesModal);
    document.getElementById('helpGuidelinesBtn').addEventListener('click', showHelpGuidelines);

    // Footer
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    // Service Creation Modal Steps
    document.getElementById('nextToPricingBtn').addEventListener('click', () => navigateStep(2));
    document.getElementById('backToDetailsBtn').addEventListener('click', () => navigateStep(1));
    document.getElementById('nextToSettingsBtn').addEventListener('click', () => navigateStep(3));
    document.getElementById('backToPricingBtn').addEventListener('click', () => navigateStep(2));
    document.getElementById('createServiceBtn').addEventListener('click', createService);

    // Category Management Modal
    document.getElementById('addCategoryBtn').addEventListener('click', openAddCategoryModal);
    document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);
    document.getElementById('iconPickerBtn').addEventListener('click', openIconPicker);

    // Advanced Filter Modal
    document.getElementById('clearAllFilters').addEventListener('click', clearAllFilters);
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);

    // Analytics Modal
    document.getElementById('analyticsPeriod').addEventListener('change', updateAnalyticsPeriod);
    document.getElementById('exportAnalyticsBtn').addEventListener('click', exportAnalytics);
    document.getElementById('scheduleReportBtn').addEventListener('click', openScheduleReportsModal);

    // Clone Modal
    document.getElementById('confirmCloneBtn').addEventListener('click', confirmCloneService);

    // Delete Modal
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDeleteService);

    // Import Modal
    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('csvFileInput').click());
    document.getElementById('csvFileInput').addEventListener('change', handleFileUpload);
    document.getElementById('downloadTemplateBtn').addEventListener('click', downloadCSVTemplate);
    document.getElementById('startImportBtn').addEventListener('click', startImport);

    // Price Range Sliders
    document.getElementById('minPriceSlider').addEventListener('input', updatePriceRange);
    document.getElementById('maxPriceSlider').addEventListener('input', updatePriceRange);

    // Toggle Switches
    document.querySelectorAll('input[name="enablePrerequisites"]').forEach(el => {
        el.addEventListener('change', togglePrerequisitesPanel);
    });

    document.querySelectorAll('input[name="insuranceCoverage"]').forEach(el => {
        el.addEventListener('change', toggleInsuranceProviders);
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function () {
            const modalId = this.getAttribute('data-modal');
            closeModal(modalId);
        });
    });

    // Doctor Assignment
    document.getElementById('selectAllDoctors').addEventListener('click', selectAllDoctors);
    document.getElementById('selectNoneDoctors').addEventListener('click', selectNoneDoctors);
    document.getElementById('doctorSearch').addEventListener('input', filterDoctors);

    // Template Modal
    document.querySelectorAll('.use-template-btn').forEach(btn => {
        btn.addEventListener('click', useTemplate);
    });

    // Tab Switching in Analytics
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchAnalyticsTab);
    });

    // Drag and Drop for Import
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Category Expand/Collapse
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', toggleCategoryExpansion);
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Service Card Actions
    document.addEventListener('click', function (e) {
        if (e.target.closest('.action-btn')) {
            const btn = e.target.closest('.action-btn');
            const action = btn.getAttribute('data-action');
            const serviceId = btn.getAttribute('data-service');
            handleServiceAction(action, serviceId);
        }

        if (e.target.closest('.service-checkbox')) {
            updateSelectedServices();
        }

        if (e.target.closest('.edit-category-btn')) {
            const categoryId = e.target.closest('.edit-category-btn').getAttribute('data-category');
            editCategory(categoryId);
        }

        if (e.target.closest('.delete-category-btn')) {
            const categoryId = e.target.closest('.delete-category-btn').getAttribute('data-category');
            deleteCategory(categoryId);
        }
    });
}

// ====================================
// CATEGORY MANAGEMENT
// ====================================
function initializeCategories() {
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', toggleCategoryExpansion);
    });
}

function toggleCategoryExpansion(e) {
    const categoryId = e.currentTarget.getAttribute('data-category');
    const servicesContainer = document.getElementById(`${categoryId}-services`);
    const expandBtn = e.currentTarget;

    servicesContainer.classList.toggle('collapsed');
    expandBtn.classList.toggle('expanded');
}

function openCategoryManagementModal() {
    openModal('categoryManagementModal');
    renderCategoriesForManagement();
}

function renderCategoriesForManagement() {
    const container = document.querySelector('.categories-sortable');
    container.innerHTML = ClinicServicesHub.categories
        .sort((a, b) => a.order - b.order)
        .map(category => `
            <div class="category-management-item" data-category="${category.id}">
                <div class="drag-handle">
                    <i class="fas fa-grip-vertical"></i>
                </div>
                <div class="category-details">
                    <div class="category-icon">
                        <i class="fas ${category.icon}"></i>
                    </div>
                    <div class="category-text">
                        <h5>${category.name}</h5>
                        <span>${category.description}</span>
                    </div>
                </div>
                <div class="category-actions">
                    <button class="edit-category-btn" data-category="${category.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-category-btn" data-category="${category.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
}

function openAddCategoryModal() {
    document.getElementById('categoryFormTitle').textContent = 'Add New Category';
    document.getElementById('categoryForm').reset();
    closeModal('categoryManagementModal');
    openModal('categoryFormModal');
}

function editCategory(categoryId) {
    const category = ClinicServicesHub.categories.find(c => c.id === categoryId);
    if (!category) return;

    document.getElementById('categoryFormTitle').textContent = 'Edit Category';
    document.querySelector('input[name="categoryName"]').value = category.name;
    document.querySelector('textarea[name="categoryDescription"]').value = category.description;
    document.getElementById('selectedIcon').className = `fas ${category.icon}`;

    closeModal('categoryManagementModal');
    openModal('categoryFormModal');
}

function deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category? All services in this category will need to be reassigned.')) {
        ClinicServicesHub.categories = ClinicServicesHub.categories.filter(c => c.id !== categoryId);
        renderCategoriesForManagement();
        showToast('Category deleted successfully', 'success');
    }
}

function saveCategory(e) {
    e.preventDefault();

    const name = document.querySelector('input[name="categoryName"]').value;
    const description = document.querySelector('textarea[name="categoryDescription"]').value;
    const icon = document.getElementById('selectedIcon').className.split(' ')[1];

    const newCategory = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        description: description,
        icon: icon,
        serviceCount: 0,
        order: ClinicServicesHub.categories.length + 1
    };

    ClinicServicesHub.categories.push(newCategory);
    closeModal('categoryFormModal');
    openModal('categoryManagementModal');
    renderCategoriesForManagement();
    showToast('Category saved successfully', 'success');
}

// ====================================
// SERVICE RENDERING
// ====================================
function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    const filteredServices = filterServices();
    const sortedServices = sortServices(filteredServices);

    if (sortedServices.length === 0) {
        servicesGrid.innerHTML = '<div class="no-services">No services found matching your criteria.</div>';
        return;
    }

    servicesGrid.innerHTML = sortedServices.map(service => createServiceCard(service)).join('');
}

function createServiceCard(service) {
    const category = ClinicServicesHub.categories.find(c => c.id === service.category);
    const categoryName = category ? category.name : 'Uncategorized';

    return `
        <div class="service-card" data-service-id="${service.id}">
            <div class="service-header">
                <div class="service-selection">
                    <input type="checkbox" class="service-checkbox" data-service="${service.id}">
                </div>
                <div class="service-status">
                    <span class="status-badge ${service.status}">
                        <i class="fas fa-circle"></i>
                        ${service.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
            
            <div class="service-content">
                <div class="service-icon">
                    <i class="fas ${service.icon}"></i>
                </div>
                <h3 class="service-name">${service.name}</h3>
                <span class="service-category">${categoryName}</span>
                <p class="service-description">${service.description}</p>
                
                <div class="service-details">
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${service.duration} minutes</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>KES. ${service.price.toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-user-md"></i>
                        <span>${service.doctorsAssigned} ${service.doctorsAssigned === 1 ? 'doctor' : 'doctors'} assigned</span>
                    </div>
                </div>
                
                <div class="service-stats">
                    <div class="stat-item">
                        <span class="stat-value">${service.bookingsThisMonth}</span>
                        <span class="stat-label">Bookings this month</span>
                    </div>
                </div>
            </div>
            
            <div class="service-actions">
                <button class="action-btn edit-btn" data-action="edit" data-service="${service.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn clone-btn" data-action="clone" data-service="${service.id}">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn toggle-btn" data-action="toggle" data-service="${service.id}">
                    <i class="fas fa-power-off"></i>
                </button>
                <button class="action-btn more-btn" data-action="more" data-service="${service.id}">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        </div>
    `;
}

// ====================================
// FILTERING & SORTING
// ====================================
function filterServices() {
    return ClinicServicesHub.services.filter(service => {
        // Category filter
        if (!ClinicServicesHub.filters.categories.includes(service.category)) {
            return false;
        }

        // Status filter
        if (ClinicServicesHub.filters.status !== 'all' && service.status !== ClinicServicesHub.filters.status) {
            return false;
        }

        // Doctor assignment filter
        if (ClinicServicesHub.filters.doctorAssignment === 'assigned' && service.doctorsAssigned === 0) {
            return false;
        }
        if (ClinicServicesHub.filters.doctorAssignment === 'unassigned' && service.doctorsAssigned > 0) {
            return false;
        }

        // Price filter
        if (service.price < ClinicServicesHub.filters.priceMin || service.price > ClinicServicesHub.filters.priceMax) {
            return false;
        }

        return true;
    });
}

function sortServices(services) {
    const sortFunctions = {
        'name': (a, b) => a.name.localeCompare(b.name),
        'price-low': (a, b) => a.price - b.price,
        'price-high': (a, b) => b.price - a.price,
        'usage': (a, b) => b.bookingsThisMonth - a.bookingsThisMonth,
        'modified': (a, b) => (b.lastModified || 0) - (a.lastModified || 0)
    };

    return [...services].sort(sortFunctions[ClinicServicesHub.sortBy] || sortFunctions.name);
}

function handleSortChange(e) {
    ClinicServicesHub.sortBy = e.target.value;
    renderServices();
}

function setViewMode(mode) {
    ClinicServicesHub.viewMode = mode;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${mode}ViewBtn`).classList.add('active');

    const servicesGrid = document.getElementById('servicesGrid');
    if (mode === 'list') {
        servicesGrid.classList.add('list-view');
    } else {
        servicesGrid.classList.remove('list-view');
    }
}

// ====================================
// SEARCH FUNCTIONALITY
// ====================================
function handleGlobalSearch(e) {
    const searchTerm = e.target.value.toLowerCase();

    if (searchTerm.length === 0) {
        renderServices();
        return;
    }

    const filteredServices = ClinicServicesHub.services.filter(service => {
        return service.name.toLowerCase().includes(searchTerm) ||
            service.description.toLowerCase().includes(searchTerm) ||
            service.category.toLowerCase().includes(searchTerm);
    });

    const servicesGrid = document.getElementById('servicesGrid');
    servicesGrid.innerHTML = filteredServices.map(service => createServiceCard(service)).join('');
}

// ====================================
// SERVICE ACTIONS
// ====================================
function handleServiceAction(action, serviceId) {
    switch (action) {
        case 'edit':
            editService(serviceId);
            break;
        case 'clone':
            cloneService(serviceId);
            break;
        case 'toggle':
            toggleServiceStatus(serviceId);
            break;
        case 'more':
            showMoreOptions(serviceId);
            break;
    }
}

function editService(serviceId) {
    const service = ClinicServicesHub.services.find(s => s.id === serviceId);
    if (!service) return;

    // Populate edit form with service data
    // This would populate the same multi-step form used for creation
    openModal('editServiceModal');

    // Show auto-save indicator
    const autoSaveIndicator = document.querySelector('.auto-save-indicator');
    autoSaveIndicator.classList.add('show');

    // Auto-save functionality
    setInterval(() => {
        // Save changes automatically
        autoSaveIndicator.style.opacity = '1';
        setTimeout(() => {
            autoSaveIndicator.style.opacity = '0.5';
        }, 1000);
    }, 30000);
}

function cloneService(serviceId) {
    const service = ClinicServicesHub.services.find(s => s.id === serviceId);
    if (!service) return;

    document.getElementById('originalServiceName').textContent = service.name;
    openModal('cloneServiceModal');

    // Store the service being cloned
    window.currentCloneService = service;
}

function confirmCloneService() {
    const newName = document.querySelector('input[name="newServiceName"]').value;
    if (!newName) {
        alert('Please enter a name for the new service');
        return;
    }

    const cloneOptions = Array.from(document.querySelectorAll('input[name="cloneOptions"]:checked'))
        .map(cb => cb.value);

    const clonedService = {
        ...window.currentCloneService,
        id: 'SVC' + Date.now(),
        name: newName,
        bookingsThisMonth: 0
    };

    // Apply clone options
    if (!cloneOptions.includes('pricing')) {
        clonedService.price = 0;
        clonedService.discountType = null;
        clonedService.discountValue = 0;
    }

    if (!cloneOptions.includes('doctors')) {
        clonedService.doctorsAssigned = 0;
    }

    if (!cloneOptions.includes('settings')) {
        clonedService.status = 'inactive';
    }

    ClinicServicesHub.services.push(clonedService);
    renderServices();
    closeModal('cloneServiceModal');
    showToast('Service cloned successfully', 'success');
}

function toggleServiceStatus(serviceId) {
    const service = ClinicServicesHub.services.find(s => s.id === serviceId);
    if (!service) return;

    service.status = service.status === 'active' ? 'inactive' : 'active';
    renderServices();
    showToast(`Service ${service.status === 'active' ? 'activated' : 'deactivated'}`, 'success');
}

function showMoreOptions(serviceId) {
    // Create a dropdown menu with additional options
    const moreMenu = document.createElement('div');
    moreMenu.className = 'more-options-menu';
    moreMenu.innerHTML = `
        <a href="#" onclick="viewServiceAppointments('${serviceId}')">View Appointments</a>
        <a href="#" onclick="viewServiceInvoices('${serviceId}')">View Invoices</a>
        <a href="#" onclick="deleteService('${serviceId}')">Delete Service</a>
    `;

    // Position and show the menu
    // Implementation would include proper positioning logic
}

function deleteService(serviceId) {
    const service = ClinicServicesHub.services.find(s => s.id === serviceId);
    if (!service) return;

    document.getElementById('serviceToDeleteName').textContent = service.name;
    openModal('deleteConfirmationModal');

    // Store the service being deleted
    window.currentDeleteService = serviceId;
}

function confirmDeleteService() {
    const serviceId = window.currentDeleteService;
    ClinicServicesHub.services = ClinicServicesHub.services.filter(s => s.id !== serviceId);
    renderServices();
    closeModal('deleteConfirmationModal');
    showToast('Service deleted successfully', 'success');
}

// ====================================
// BULK ACTIONS
// ====================================
function updateSelectedServices() {
    const checkboxes = document.querySelectorAll('.service-checkbox:checked');
    ClinicServicesHub.selectedServices = Array.from(checkboxes).map(cb => cb.getAttribute('data-service'));

    // Enable/disable bulk actions dropdown
    const bulkActionsDropdown = document.getElementById('bulkActionsDropdown');
    bulkActionsDropdown.disabled = ClinicServicesHub.selectedServices.length === 0;
}

function handleBulkAction(e) {
    const action = e.target.value;
    if (!action) return;

    switch (action) {
        case 'activate':
            bulkActivateServices();
            break;
        case 'deactivate':
            bulkDeactivateServices();
            break;
        case 'delete':
            bulkDeleteServices();
            break;
        case 'export':
            bulkExportServices();
            break;
    }

    e.target.value = '';
}

function bulkActivateServices() {
    ClinicServicesHub.selectedServices.forEach(serviceId => {
        const service = ClinicServicesHub.services.find(s => s.id === serviceId);
        if (service) service.status = 'active';
    });
    renderServices();
    showToast(`${ClinicServicesHub.selectedServices.length} services activated`, 'success');
}

function bulkDeactivateServices() {
    ClinicServicesHub.selectedServices.forEach(serviceId => {
        const service = ClinicServicesHub.services.find(s => s.id === serviceId);
        if (service) service.status = 'inactive';
    });
    renderServices();
    showToast(`${ClinicServicesHub.selectedServices.length} services deactivated`, 'success');
}

function bulkDeleteServices() {
    if (confirm(`Are you sure you want to delete ${ClinicServicesHub.selectedServices.length} services?`)) {
        ClinicServicesHub.services = ClinicServicesHub.services.filter(
            s => !ClinicServicesHub.selectedServices.includes(s.id)
        );
        renderServices();
        showToast(`${ClinicServicesHub.selectedServices.length} services deleted`, 'success');
    }
}

function bulkExportServices() {
    const selectedServices = ClinicServicesHub.services.filter(
        s => ClinicServicesHub.selectedServices.includes(s.id)
    );
    exportServicesToCSV(selectedServices);
}

// ====================================
// SERVICE CREATION MODAL
// ====================================
function openServiceCreationModal() {
    openModal('serviceCreationModal');
    resetServiceForm();
    navigateStep(1);
}

function resetServiceForm() {
    document.querySelectorAll('#serviceCreationModal form').forEach(form => form.reset());
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.toggle('active', index === 0);
    });
    document.querySelectorAll('.step-content').forEach((content, index) => {
        content.classList.toggle('active', index === 0);
    });
}

function navigateStep(stepNumber) {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.toggle('active', index === stepNumber - 1);
    });

    document.querySelectorAll('.step-content').forEach((content, index) => {
        content.classList.toggle('active', index === stepNumber - 1);
    });
}

function createService() {
    // Gather all form data
    const serviceData = {
        id: 'SVC' + Date.now(),
        name: document.querySelector('input[name="serviceName"]').value,
        category: document.querySelector('select[name="category"]').value,
        duration: parseInt(document.querySelector('select[name="duration"]').value),
        description: document.querySelector('textarea[name="description"]').value,
        price: parseFloat(document.querySelector('input[name="baseFee"]').value),
        status: document.querySelector('input[name="serviceActive"]').checked ? 'active' : 'inactive',
        doctorsAssigned: document.querySelectorAll('input[name="assignedDoctors"]:checked').length,
        bookingsThisMonth: 0,
        icon: getCategoryIcon(document.querySelector('select[name="category"]').value),
        prerequisites: getSelectedPrerequisites(),
        insuranceProviders: getSelectedInsuranceProviders(),
        discountType: document.querySelector('select[name="discountType"]').value || null,
        discountValue: parseFloat(document.querySelector('input[name="discountValue"]').value) || 0,
        vatApplicable: document.querySelector('input[name="vatApplicable"]').checked,
        includesCurisFee: document.querySelector('input[name="includesCurisFee"]').checked
    };

    // Validate required fields
    if (!serviceData.name || !serviceData.category || !serviceData.duration || !serviceData.price) {
        alert('Please fill in all required fields');
        return;
    }

    // Add to services array
    ClinicServicesHub.services.push(serviceData);

    // Update category service count
    const category = ClinicServicesHub.categories.find(c => c.id === serviceData.category);
    if (category) category.serviceCount++;

    // Close modal and refresh
    closeModal('serviceCreationModal');
    renderServices();
    showToast('Service created successfully!', 'success');
}

function getCategoryIcon(categoryId) {
    const category = ClinicServicesHub.categories.find(c => c.id === categoryId);
    return category ? category.icon : 'fa-hospital';
}

function getSelectedPrerequisites() {
    if (!document.querySelector('input[name="enablePrerequisites"]').checked) {
        return [];
    }
    return Array.from(document.querySelectorAll('select[name="prerequisites"] option:checked'))
        .map(option => option.value);
}

function getSelectedInsuranceProviders() {
    if (!document.querySelector('input[name="insuranceCoverage"]').checked) {
        return [];
    }
    return Array.from(document.querySelectorAll('input[name="insuranceProviders"]:checked'))
        .map(cb => cb.value);
}

// ====================================
// ADVANCED FILTERS
// ====================================
function openAdvancedFilterModal() {
    openModal('advancedFilterModal');

    // Set current filter values
    document.querySelectorAll('input[name="categoryFilter"]').forEach(cb => {
        cb.checked = ClinicServicesHub.filters.categories.includes(cb.value);
    });

    document.querySelector(`input[name="statusFilter"][value="${ClinicServicesHub.filters.status}"]`).checked = true;
    document.querySelector(`input[name="doctorFilter"][value="${ClinicServicesHub.filters.doctorAssignment}"]`).checked = true;

    document.getElementById('minPriceSlider').value = ClinicServicesHub.filters.priceMin;
    document.getElementById('maxPriceSlider').value = ClinicServicesHub.filters.priceMax;
    updatePriceRangeDisplay();
}

function clearAllFilters() {
    ClinicServicesHub.filters = {
        categories: ['consultations', 'lab-tests', 'procedures', 'followups'],
        status: 'all',
        doctorAssignment: 'all',
        priceMin: 0,
        priceMax: 10000
    };

    // Reset UI
    document.querySelectorAll('input[name="categoryFilter"]').forEach(cb => cb.checked = true);
    document.querySelector('input[name="statusFilter"][value="all"]').checked = true;
    document.querySelector('input[name="doctorFilter"][value="all"]').checked = true;
    document.getElementById('minPriceSlider').value = 0;
    document.getElementById('maxPriceSlider').value = 10000;
    updatePriceRangeDisplay();
}

function applyFilters() {
    // Update category filters
    ClinicServicesHub.filters.categories = Array.from(
        document.querySelectorAll('input[name="categoryFilter"]:checked')
    ).map(cb => cb.value);

    // Update status filter
    ClinicServicesHub.filters.status = document.querySelector('input[name="statusFilter"]:checked').value;

    // Update doctor assignment filter
    ClinicServicesHub.filters.doctorAssignment = document.querySelector('input[name="doctorFilter"]:checked').value;

    // Update price filters
    ClinicServicesHub.filters.priceMin = parseInt(document.getElementById('minPriceSlider').value);
    ClinicServicesHub.filters.priceMax = parseInt(document.getElementById('maxPriceSlider').value);

    closeModal('advancedFilterModal');
    renderServices();
    showToast('Filters applied', 'success');
}

function updatePriceRange() {
    const minValue = parseInt(document.getElementById('minPriceSlider').value);
    const maxValue = parseInt(document.getElementById('maxPriceSlider').value);

    // Ensure min doesn't exceed max
    if (minValue > maxValue) {
        document.getElementById('minPriceSlider').value = maxValue;
    }

    updatePriceRangeDisplay();
}

function updatePriceRangeDisplay() {
    const minValue = parseInt(document.getElementById('minPriceSlider').value);
    const maxValue = parseInt(document.getElementById('maxPriceSlider').value);

    document.getElementById('minPriceValue').textContent = `KES. ${minValue.toLocaleString()}`;
    document.getElementById('maxPriceValue').textContent = `KES. ${maxValue.toLocaleString()}`;
}

// ====================================
// ANALYTICS
// ====================================
function openAnalyticsModal() {
    openModal('serviceAnalyticsModal');
    updateAnalyticsData();
}

function updateAnalyticsPeriod() {
    const period = document.getElementById('analyticsPeriod').value;
    updateAnalyticsData(period);
}

function updateAnalyticsData(period = 'week') {
    // Update charts based on selected period
    updateBookingChart(period);
    updateRevenueChart(period);
    updateUtilizationTable(period);
}

function initializeCharts() {
    // Initialize Chart.js charts (placeholder for actual implementation)
    // This would require the Chart.js library to be loaded
}

function updateBookingChart(period) {
    // Update booking frequency chart
    const ctx = document.getElementById('bookingChart');
    if (!ctx) return;

    // Chart.js implementation would go here
}

function updateRevenueChart(period) {
    // Update revenue by service chart
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    // Chart.js implementation would go here
}

function updateUtilizationTable(period) {
    // Update service utilization table based on selected tab
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    switchAnalyticsTab({ currentTarget: document.querySelector(`.tab-btn[data-tab="${activeTab}"]`) });
}

function switchAnalyticsTab(e) {
    const tabName = e.currentTarget.getAttribute('data-tab');

    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');

    // Show selected tab content
    document.getElementById(`${tabName}-tab`).style.display = 'block';
}

function exportAnalytics() {
    // Export analytics data to PDF
    showToast('Preparing analytics report...', 'info');

    setTimeout(() => {
        // Simulate PDF generation
        const link = document.createElement('a');
        link.href = '#';
        link.download = `service-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        showToast('Analytics report downloaded', 'success');
    }, 2000);
}

function openScheduleReportsModal() {
    // Open modal for scheduling automated reports
    showToast('Report scheduling feature coming soon', 'info');
}

// ====================================
// IMPORT/EXPORT FUNCTIONALITY
// ====================================
function openImportModal() {
    openModal('importServicesModal');
}

function handleFileUpload(e) {
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
        alert('Please upload a CSV file');
    }
}

function processCSVFile(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');

        // Show import progress
        document.getElementById('importProgress').style.display = 'block';
        document.getElementById('startImportBtn').disabled = false;

        // Store parsed data for import
        window.importData = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
                name: values[0],
                category: values[1],
                duration: parseInt(values[2]),
                price: parseFloat(values[3]),
                description: values[4]
            };
        }).filter(item => item.name); // Filter out empty rows

        document.querySelector('.progress-text').textContent = `Ready to import ${window.importData.length} services`;
    };

    reader.readAsText(file);
}

function startImport() {
    if (!window.importData || window.importData.length === 0) {
        alert('No data to import');
        return;
    }

    const progressFill = document.querySelector('.progress-fill');
    let imported = 0;

    window.importData.forEach((serviceData, index) => {
        setTimeout(() => {
            // Create new service
            const newService = {
                id: 'SVC' + Date.now() + index,
                name: serviceData.name,
                category: serviceData.category.toLowerCase().replace(/\s+/g, '-'),
                duration: serviceData.duration,
                price: serviceData.price,
                description: serviceData.description,
                status: 'inactive',
                doctorsAssigned: 0,
                bookingsThisMonth: 0,
                icon: getCategoryIcon(serviceData.category.toLowerCase().replace(/\s+/g, '-')),
                prerequisites: [],
                insuranceProviders: [],
                discountType: null,
                discountValue: 0,
                vatApplicable: true,
                includesCurisFee: true
            };

            ClinicServicesHub.services.push(newService);
            imported++;

            // Update progress
            const progress = (imported / window.importData.length) * 100;
            progressFill.style.width = progress + '%';
            document.querySelector('.progress-text').textContent = `Importing services... ${imported}/${window.importData.length}`;

            if (imported === window.importData.length) {
                renderServices();
                closeModal('importServicesModal');
                showToast(`Successfully imported ${imported} services`, 'success');
            }
        }, index * 100); // Stagger imports for visual effect
    });
}

function downloadCSVTemplate() {
    const csvContent = 'Service Name,Category,Duration,Price,Description\n' +
        'Example Service,Consultations,30,1500,This is an example service description\n';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'service-import-template.csv';
    link.click();
}

function exportAllServices() {
    exportServicesToCSV(ClinicServicesHub.services);
}

function exportServicesToCSV(services) {
    const headers = ['Service Name', 'Category', 'Duration', 'Price', 'Status', 'Doctors Assigned', 'Bookings This Month'];
    const rows = services.map(service => {
        const category = ClinicServicesHub.categories.find(c => c.id === service.category);
        return [
            service.name,
            category ? category.name : service.category,
            service.duration,
            service.price,
            service.status,
            service.doctorsAssigned,
            service.bookingsThisMonth
        ];
    });

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `services-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast('Services exported successfully', 'success');
}

// ====================================
// SERVICE TEMPLATES
// ====================================
function openTemplatesModal() {
    openModal('serviceTemplatesModal');
}

function useTemplate(e) {
    const templateId = e.currentTarget.getAttribute('data-template');
    const templates = {
        'basic-consultation': [
            { name: 'General Consultation', category: 'consultations', duration: 30, price: 1500 },
            { name: 'Physical Examination', category: 'consultations', duration: 20, price: 1000 },
            { name: 'Basic Diagnosis', category: 'consultations', duration: 15, price: 800 }
        ],
        'lab-package': [
            { name: 'Blood Sugar Test', category: 'lab-tests', duration: 15, price: 800 },
            { name: 'Complete Blood Count', category: 'lab-tests', duration: 10, price: 1200 },
            { name: 'Urine Analysis', category: 'lab-tests', duration: 10, price: 600 },
            { name: 'Cholesterol Test', category: 'lab-tests', duration: 15, price: 1000 }
        ],
        'pediatric-package': [
            { name: 'Pediatric Consultation', category: 'consultations', duration: 30, price: 1800 },
            { name: 'Vaccination', category: 'procedures', duration: 15, price: 1200 },
            { name: 'Growth Monitoring', category: 'procedures', duration: 20, price: 500 },
            { name: 'Child Health Check', category: 'consultations', duration: 45, price: 2000 }
        ],
        'preventive-care': [
            { name: 'Health Screening', category: 'consultations', duration: 60, price: 3000 },
            { name: 'Blood Pressure Check', category: 'procedures', duration: 10, price: 200 },
            { name: 'Diabetes Screening', category: 'lab-tests', duration: 20, price: 1500 },
            { name: 'Health Education', category: 'consultations', duration: 30, price: 800 }
        ]
    };

    const templateServices = templates[templateId];
    if (!templateServices) return;

    // Add template services
    templateServices.forEach((serviceData, index) => {
        setTimeout(() => {
            const newService = {
                id: 'SVC' + Date.now() + index,
                name: serviceData.name,
                category: serviceData.category,
                duration: serviceData.duration,
                price: serviceData.price,
                description: `${serviceData.name} service`,
                status: 'active',
                doctorsAssigned: 0,
                bookingsThisMonth: 0,
                icon: getCategoryIcon(serviceData.category),
                prerequisites: [],
                insuranceProviders: [],
                discountType: null,
                discountValue: 0,
                vatApplicable: true,
                includesCurisFee: true
            };

            ClinicServicesHub.services.push(newService);

            if (index === templateServices.length - 1) {
                renderServices();
                closeModal('serviceTemplatesModal');
                showToast(`Added ${templateServices.length} services from template`, 'success');
            }
        }, index * 200);
    });
}

// ====================================
// UI HELPERS
// ====================================
function togglePrerequisitesPanel(e) {
    const panel = document.querySelector('.prerequisites-panel');
    panel.style.display = e.target.checked ? 'block' : 'none';
}

function toggleInsuranceProviders(e) {
    const panel = document.querySelector('.insurance-providers');
    panel.style.display = e.target.checked ? 'block' : 'none';
}

function selectAllDoctors() {
    document.querySelectorAll('input[name="assignedDoctors"]').forEach(cb => cb.checked = true);
}

function selectNoneDoctors() {
    document.querySelectorAll('input[name="assignedDoctors"]').forEach(cb => cb.checked = false);
}

function filterDoctors(e) {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.doctor-item').forEach(item => {
        const doctorName = item.querySelector('.doctor-name').textContent.toLowerCase();
        const doctorSpecialty = item.querySelector('.doctor-specialty').textContent.toLowerCase();

        if (doctorName.includes(searchTerm) || doctorSpecialty.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function openIconPicker() {
    // Implementation for icon picker modal
    showToast('Icon picker coming soon', 'info');
}

function showHelpGuidelines() {
    // Implementation for help guidelines
    showToast('Opening help documentation...', 'info');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);

    const icon = document.querySelector('#darkModeToggle i');
    icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
}

// ====================================
// NOTIFICATIONS
// ====================================
function toggleNotificationsPanel() {
    const panel = document.getElementById('notificationsPanel');
    panel.classList.toggle('show');

    // Close user dropdown if open
    document.getElementById('userDropdown').classList.remove('show');
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');

    // Close notifications panel if open
    document.getElementById('notificationsPanel').classList.remove('show');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function (e) {
    if (!e.target.closest('.notification-container')) {
        document.getElementById('notificationsPanel').classList.remove('show');
    }

    if (!e.target.closest('.user-profile-container')) {
        document.getElementById('userDropdown').classList.remove('show');
    }
});

// ====================================
// MODAL MANAGEMENT
// ====================================
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    document.body.style.overflow = 'auto';
}

// ====================================
// TOAST NOTIFICATIONS
// ====================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('i');

    // Update toast content
    toastMessage.textContent = message;

    // Update toast styling based on type
    toast.className = `toast ${type}`;

    // Update icon based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toastIcon.className = `fas ${icons[type]}`;

    // Show toast
    toast.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Toast close button
document.querySelector('.toast-close').addEventListener('click', function () {
    document.getElementById('successToast').style.display = 'none';
});

// ====================================
// SORTABLE FUNCTIONALITY
// ====================================
function initializeSortable() {
    // This would integrate with a sortable library like SortableJS
    // For now, it's a placeholder for drag-and-drop functionality
    const sortableContainer = document.querySelector('.categories-sortable');
    if (sortableContainer) {
        // Initialize sortable functionality
        // Would require including SortableJS library
    }
}

// ====================================
// UTILITY FUNCTIONS
// ====================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced search
const debouncedSearch = debounce(handleGlobalSearch, 300);

// ====================================
// NAVIGATION HELPERS
// ====================================
function viewServiceAppointments(serviceId) {
    // Navigate to appointments page with service filter
    window.location.href = `../Appointments/appointments.html?service=${serviceId}`;
}

function viewServiceInvoices(serviceId) {
    // Navigate to billing page with service filter
    window.location.href = `../Billings and Payments/billings_and_payments.html?service=${serviceId}`;
}

// ====================================
// INITIALIZATION CHECKS
// ====================================
// Check for dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.querySelector('#darkModeToggle i').className = 'fas fa-sun';
}

// Auto-save form data
let autoSaveTimer;
document.addEventListener('input', function (e) {
    if (e.target.closest('#serviceCreationModal') || e.target.closest('#editServiceModal')) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            // Save form data to localStorage
            const formData = new FormData(e.target.closest('form'));
            localStorage.setItem('serviceFormDraft', JSON.stringify(Object.fromEntries(formData)));
            console.log('Form data auto-saved');
        }, 1000);
    }
});

// Restore form data if available
window.addEventListener('load', function () {
    const savedFormData = localStorage.getItem('serviceFormDraft');
    if (savedFormData) {
        // Offer to restore draft
        if (confirm('Would you like to restore your previous work?')) {
            const data = JSON.parse(savedFormData);
            // Restore form fields
            Object.entries(data).forEach(([key, value]) => {
                const field = document.querySelector(`[name="${key}"]`);
                if (field) field.value = value;
            });
        }
    }
});

// ====================================
// KEYBOARD SHORTCUTS
// ====================================
document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + N: New Service
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openServiceCreationModal();
    }

    // Ctrl/Cmd + F: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('globalServiceSearch').focus();
    }

    // Escape: Close modals
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => closeModal(modal.id));
    }
});

// ====================================
// PERFORMANCE OPTIMIZATION
// ====================================
// Lazy load images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
});

// Observe all lazy images
document.querySelectorAll('img.lazy').forEach(img => {
    imageObserver.observe(img);
});

// ====================================
// ERROR HANDLING
// ====================================
window.addEventListener('error', function (e) {
    console.error('Global error:', e.error);
    showToast('An error occurred. Please try again.', 'error');
});

// ====================================
// SESSION MANAGEMENT
// ====================================
// Auto-logout after inactivity
let inactivityTimer;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (confirm('Your session has expired. Would you like to continue?')) {
            resetInactivityTimer();
        } else {
            window.location.href = '../Landing Page/landing_page.html';
        }
    }, INACTIVITY_TIMEOUT);
}

// Reset timer on user activity
['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
});

resetInactivityTimer();

// ====================================
// REAL-TIME SYNC SIMULATION
// ====================================
setInterval(() => {
    // Simulate real-time sync
    const syncIndicator = document.querySelector('.sync-indicator i');
    syncIndicator.classList.add('spinning');

    setTimeout(() => {
        syncIndicator.classList.remove('spinning');
        document.querySelector('.sync-time').textContent = 'Last sync: just now';
    }, 2000);
}, 60000); // Every minute

console.log('Clinic Services Hub initialized successfully');
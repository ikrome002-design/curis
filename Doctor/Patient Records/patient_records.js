// ========================================
// CURIS PATIENT RECORDS - COMPREHENSIVE JAVASCRIPT
// Full Dynamic Functionality Implementation
// ========================================

(function () {
    'use strict';

    // ========================================
    // 1. GLOBAL STATE MANAGEMENT
    // ========================================
    const PatientRecordsState = {
        currentPatientId: null,
        currentTab: 'medical-history',
        searchResults: [],
        recentPatients: [],
        medicalHistory: [],
        documents: [],
        prescriptions: [],
        allergies: [],
        conditions: [],
        comments: [],
        activityLog: [],
        filters: {
            name: '',
            gender: 'all',
            ageMin: null,
            ageMax: null,
            visitFrom: null,
            visitTo: null,
            chronicConditions: []
        },
        isLoading: false,
        splitViewActive: false,
        editorContent: {},
        uploadQueue: []
    };

    // Sample data store
    const DataStore = {
        patients: [
            {
                id: 'PAT-2024-001',
                name: 'John Kamau',
                age: 45,
                gender: 'Male',
                bloodType: 'O+',
                phone: '+254 712 345678',
                email: 'john.kamau@email.com',
                photo: 'icons8-profile-picture-80.png',
                lastVisit: '2025-09-20'
            },
            {
                id: 'PAT-2024-002',
                name: 'Mary Wambui',
                age: 38,
                gender: 'Female',
                bloodType: 'A+',
                phone: '+254 722 987654',
                email: 'mary.wambui@email.com',
                photo: 'icons8-profile-picture-80.png',
                lastVisit: '2025-09-18'
            },
            {
                id: 'PAT-2024-003',
                name: 'Peter Ochieng',
                age: 52,
                gender: 'Male',
                bloodType: 'B-',
                phone: '+254 733 456789',
                email: 'peter.ochieng@email.com',
                photo: 'icons8-profile-picture-80.png',
                lastVisit: '2025-09-15'
            },
            {
                id: 'PAT-2024-004',
                name: 'Grace Njeri',
                age: 29,
                gender: 'Female',
                bloodType: 'AB+',
                phone: '+254 745 123456',
                email: 'grace.njeri@email.com',
                photo: 'icons8-profile-picture-80.png',
                lastVisit: '2025-09-12'
            }
        ],
        icd10Codes: [
            { code: 'I10', description: 'Essential (primary) hypertension' },
            { code: 'E11', description: 'Type 2 diabetes mellitus' },
            { code: 'J45', description: 'Asthma' },
            { code: 'M79.3', description: 'Myalgia' },
            { code: 'R50', description: 'Fever of other and unknown origin' }
        ]
    };

    // ========================================
    // 2. INITIALIZATION
    // ========================================
    document.addEventListener('DOMContentLoaded', function () {
        initializeApp();
    });

    function initializeApp() {
        // Initialize all components
        initializeNavigation();
        initializePatientSearch();
        initializeTabNavigation();
        initializeModals();
        initializeEditors();
        initializeFileHandlers();
        initializeCommentSystem();
        initializeProfileDropdown();
        initializeDarkMode();
        loadRecentPatients();
        setupRealTimeUpdates();
        initializeAccessControl();
    }

    // ========================================
    // 3. NAVIGATION & PROFILE
    // ========================================
    function initializeNavigation() {
        // Sidebar navigation active state
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function (e) {
                if (!this.getAttribute('href').startsWith('#')) {
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    this.parentElement.classList.add('active');
                }
            });
        });
    }

    function initializeProfileDropdown() {
        const userProfile = document.getElementById('userProfile');
        const profileDropdown = document.getElementById('profileDropdown');

        if (userProfile && profileDropdown) {
            userProfile.addEventListener('click', function (e) {
                e.stopPropagation();
                this.classList.toggle('active');
            });

            document.addEventListener('click', function (e) {
                if (!userProfile.contains(e.target) && !profileDropdown.contains(e.target)) {
                    userProfile.classList.remove('active');
                }
            });
        }
    }

    // ========================================
    // 4. PATIENT SEARCH & ACCESS
    // ========================================
    function initializePatientSearch() {
        const searchBar = document.getElementById('patientSearchBar');
        const searchSuggestions = document.getElementById('searchSuggestions');
        const clearBtn = document.querySelector('.clear-search-btn');
        const filterBtn = document.getElementById('openFilterModal');

        // Search bar functionality
        if (searchBar) {
            let searchTimeout;
            searchBar.addEventListener('input', function () {
                clearTimeout(searchTimeout);
                const query = this.value.trim();

                if (query.length > 0) {
                    clearBtn.style.display = 'block';
                    searchTimeout = setTimeout(() => performSearch(query), 300);
                } else {
                    clearBtn.style.display = 'none';
                    hideSuggestions();
                }
            });

            // Clear search
            clearBtn.addEventListener('click', function () {
                searchBar.value = '';
                this.style.display = 'none';
                hideSuggestions();
            });
        }

        // Advanced filter button
        if (filterBtn) {
            filterBtn.addEventListener('click', function () {
                openModal('filterModal');
            });
        }

        // Recent patient tiles
        document.querySelectorAll('.recent-patient-tile').forEach(tile => {
            tile.addEventListener('click', function () {
                const patientId = this.getAttribute('data-patient-id');
                loadPatientRecord(patientId);
            });
        });
    }

    function performSearch(query) {
        // Simulate search with sample data
        const results = DataStore.patients.filter(patient =>
            patient.name.toLowerCase().includes(query.toLowerCase()) ||
            patient.id.toLowerCase().includes(query.toLowerCase())
        );

        showSearchSuggestions(results);
    }

    function showSearchSuggestions(results) {
        const suggestionsContainer = document.getElementById('searchSuggestions');

        if (results.length > 0) {
            let suggestionsHTML = '';
            results.forEach(patient => {
                suggestionsHTML += `
                    <div class="suggestion-item" data-patient-id="${patient.id}">
                        <img src="${patient.photo}" alt="${patient.name}" style="width: 30px; height: 30px; border-radius: 50%;">
                        <div>
                            <div style="font-weight: 600;">${patient.name}</div>
                            <div style="font-size: 0.813rem; color: #666;">${patient.id}</div>
                        </div>
                    </div>
                `;
            });

            suggestionsContainer.innerHTML = suggestionsHTML;
            suggestionsContainer.classList.add('active');

            // Add click handlers to suggestions
            suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', function () {
                    const patientId = this.getAttribute('data-patient-id');
                    loadPatientRecord(patientId);
                    hideSuggestions();
                    document.getElementById('patientSearchBar').value = '';
                });
            });
        } else {
            suggestionsContainer.innerHTML = '<div class="suggestion-item">No results found</div>';
            suggestionsContainer.classList.add('active');
        }
    }

    function hideSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        suggestionsContainer.classList.remove('active');
    }

    function loadRecentPatients() {
        // Load and display recently accessed patients
        PatientRecordsState.recentPatients = DataStore.patients.slice(0, 4);
        updateRecentPatientsDisplay();
    }

    function updateRecentPatientsDisplay() {
        // Update the recently accessed patients grid
        const grid = document.querySelector('.recent-patients-grid');
        if (!grid) return;

        // The HTML already has the tiles, just ensure click handlers are attached
    }

    // ========================================
    // 5. PATIENT RECORD LOADING
    // ========================================
    function loadPatientRecord(patientId) {
        // Show loading state
        showLoadingState();

        // Simulate API call
        setTimeout(() => {
            const patient = DataStore.patients.find(p => p.id === patientId);
            if (patient) {
                PatientRecordsState.currentPatientId = patientId;
                displayPatientRecord(patient);
                loadMedicalHistory(patientId);
                loadAllergiesAndConditions(patientId);
                loadPrescriptions(patientId);
                loadDocuments(patientId);
                loadActivityTimeline(patientId);
                loadComments(patientId);
            }
            hideLoadingState();
        }, 500);
    }

    function displayPatientRecord(patient) {
        // Update patient header information
        const patientSection = document.getElementById('patientRecordSection');
        if (!patientSection) return;

        // Update patient name
        const nameElement = patientSection.querySelector('.patient-full-name');
        if (nameElement) nameElement.textContent = patient.name;

        // Update patient details
        const details = patientSection.querySelectorAll('.detail-item span');
        if (details.length >= 6) {
            details[0].textContent = patient.id;
            details[1].textContent = `${patient.age} years`;
            details[2].textContent = patient.gender;
            details[3].textContent = patient.bloodType;
            details[4].textContent = patient.phone;
            details[5].textContent = patient.email;
        }

        // Show the record section
        patientSection.style.display = 'block';
    }

    function loadMedicalHistory(patientId) {
        // Simulate loading medical history
        PatientRecordsState.medicalHistory = [
            {
                id: 1,
                type: 'consultation',
                title: 'Consultation - Follow-up',
                date: '2025-09-20',
                summary: 'Follow-up consultation for hypertension management',
                doctor: 'Dr. Sarah Wanjiru',
                duration: '45 minutes',
                mode: 'Online'
            },
            {
                id: 2,
                type: 'diagnosis',
                title: 'Diagnosis Added',
                date: '2025-09-15',
                summary: 'Essential Hypertension (ICD-10: I10)',
                doctor: 'Dr. Sarah Wanjiru',
                status: 'Chronic'
            },
            {
                id: 3,
                type: 'prescription',
                title: 'Prescription Issued',
                date: '2025-09-10',
                summary: 'Amlodipine 5mg - Once daily for 30 days',
                doctor: 'Dr. Sarah Wanjiru',
                refills: 2
            },
            {
                id: 4,
                type: 'lab',
                title: 'Lab Results Uploaded',
                date: '2025-09-05',
                summary: 'Complete Blood Count (CBC) - Results normal',
                status: 'Reviewed'
            }
        ];

        // Update display if medical history tab is active
        if (PatientRecordsState.currentTab === 'medical-history') {
            updateMedicalHistoryDisplay();
        }
    }

    function loadAllergiesAndConditions(patientId) {
        // Simulate loading allergies and conditions
        PatientRecordsState.allergies = [
            { name: 'Penicillin', severity: 'severe', reaction: 'Anaphylaxis' },
            { name: 'Latex', severity: 'moderate', reaction: 'Rash' },
            { name: 'Dust', severity: 'mild', reaction: 'Sneezing' }
        ];

        PatientRecordsState.conditions = [
            { name: 'Hypertension', status: 'active', since: '2020' },
            { name: 'Type 2 Diabetes', status: 'active', since: '2018' },
            { name: 'Asthma', status: 'controlled', since: '2015' }
        ];

        updateAllergiesDisplay();
        updateConditionsDisplay();
    }

    function loadPrescriptions(patientId) {
        // Simulate loading prescriptions
        PatientRecordsState.prescriptions = [
            {
                id: 1,
                medication: 'Amlodipine',
                dosage: '5mg - Once daily',
                status: 'active',
                issuedDate: '2025-09-10',
                duration: '30 days',
                refills: 2,
                doctor: 'Dr. Sarah Wanjiru',
                instructions: 'Take one tablet by mouth once daily in the morning. Can be taken with or without food.'
            },
            {
                id: 2,
                medication: 'Metformin',
                dosage: '500mg - Twice daily',
                status: 'completed',
                issuedDate: '2025-08-15',
                duration: '30 days',
                refills: 0,
                doctor: 'Dr. Sarah Wanjiru',
                instructions: 'Take one tablet by mouth twice daily with meals (morning and evening).'
            }
        ];
    }

    function loadDocuments(patientId) {
        // Simulate loading documents
        PatientRecordsState.documents = [
            {
                id: 1,
                name: 'CBC_Report_Sept2025.pdf',
                category: 'lab',
                date: '2025-09-05',
                size: '1.2 MB'
            },
            {
                id: 2,
                name: 'Chest_Xray_Aug2025.jpg',
                category: 'imaging',
                date: '2025-08-20',
                size: '3.5 MB'
            }
        ];
    }

    function loadActivityTimeline(patientId) {
        // Simulate loading activity timeline
        PatientRecordsState.activityLog = [
            {
                id: 1,
                action: 'Clinical Notes Updated',
                description: 'Added follow-up consultation notes',
                user: 'Dr. Sarah Wanjiru',
                timestamp: '2025-09-20 10:45 AM',
                type: 'notes'
            },
            {
                id: 2,
                action: 'Prescription Issued',
                description: 'Amlodipine 5mg prescribed for 30 days',
                user: 'Dr. Sarah Wanjiru',
                timestamp: '2025-09-10 02:30 PM',
                type: 'prescription'
            }
        ];
    }

    function loadComments(patientId) {
        // Simulate loading comments
        PatientRecordsState.comments = [
            {
                id: 1,
                author: 'Dr. Sarah Wanjiru',
                date: '2025-09-20 11:00 AM',
                priority: 'normal',
                text: 'Patient showing good response to current medication. Blood pressure readings have improved. Continue monitoring and schedule follow-up in 4 weeks.',
                replies: []
            },
            {
                id: 2,
                author: 'Nurse Jane Muthoni',
                date: '2025-09-19 03:00 PM',
                priority: 'urgent',
                text: '@Dr. Sarah Wanjiru - Patient called reporting mild side effects from new medication. Please review and advise on next steps.',
                replies: []
            }
        ];
    }

    // ========================================
    // 6. TAB NAVIGATION
    // ========================================
    function initializeTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', function () {
                const targetTab = this.getAttribute('data-tab');

                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                this.classList.add('active');
                const targetPane = document.getElementById(targetTab);
                if (targetPane) {
                    targetPane.classList.add('active');
                    PatientRecordsState.currentTab = targetTab;

                    // Load content for the selected tab
                    loadTabContent(targetTab);
                }
            });
        });
    }

    function loadTabContent(tabName) {
        switch (tabName) {
            case 'medical-history':
                updateMedicalHistoryDisplay();
                break;
            case 'clinical-notes':
                updateClinicalNotesDisplay();
                break;
            case 'documents':
                updateDocumentsDisplay();
                break;
            case 'prescriptions':
                updatePrescriptionsDisplay();
                break;
            case 'activity-timeline':
                updateActivityTimelineDisplay();
                break;
            case 'comments':
                updateCommentsDisplay();
                break;
        }
    }

    // ========================================
    // 7. MEDICAL HISTORY HANDLERS
    // ========================================
    function updateMedicalHistoryDisplay() {
        // History entry expand/collapse handlers
        document.querySelectorAll('.expand-entry-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const entryId = this.getAttribute('data-entry-id');
                openConsultationDetailModal(entryId);
            });
        });
    }

    function openConsultationDetailModal(entryId) {
        const modal = document.getElementById('consultDetailModal');
        if (modal) {
            // Load and display consultation details
            const entry = PatientRecordsState.medicalHistory.find(e => e.id == entryId);
            if (entry) {
                // Update modal content with entry details
                modal.classList.add('active');
            }
        }
    }

    // ========================================
    // 8. CLINICAL NOTES EDITOR
    // ========================================
    function initializeEditors() {
        // Add Clinical Notes button
        const addNotesBtn = document.getElementById('addNotesBtn');
        if (addNotesBtn) {
            addNotesBtn.addEventListener('click', function () {
                openModal('notesEditorModal');
                initializeRichTextEditor();
            });
        }

        const addNewNoteBtn = document.getElementById('addNewNoteBtn');
        if (addNewNoteBtn) {
            addNewNoteBtn.addEventListener('click', function () {
                openModal('notesEditorModal');
                initializeRichTextEditor();
            });
        }
    }

    function initializeRichTextEditor() {
        // Toolbar buttons
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const command = this.getAttribute('data-command');
                document.execCommand(command, false, null);
            });
        });

        // Heading selector
        const headingSelect = document.getElementById('headingSelect');
        if (headingSelect) {
            headingSelect.addEventListener('change', function () {
                if (this.value) {
                    document.execCommand('formatBlock', false, this.value);
                }
            });
        }

        // Diagnosis search
        const diagnosisSearch = document.getElementById('diagnosisSearch');
        if (diagnosisSearch) {
            let diagnosisTimeout;
            diagnosisSearch.addEventListener('input', function () {
                clearTimeout(diagnosisTimeout);
                const query = this.value.trim();

                if (query.length > 2) {
                    diagnosisTimeout = setTimeout(() => searchICD10Codes(query), 300);
                } else {
                    hideDiagnosisSuggestions();
                }
            });
        }

        // Save buttons
        const saveDraftBtn = document.querySelector('.save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', function () {
                saveClinicalNote('draft');
            });
        }

        const saveFinalBtn = document.querySelector('.save-final-btn');
        if (saveFinalBtn) {
            saveFinalBtn.addEventListener('click', function () {
                saveClinicalNote('final');
            });
        }

        // Keyword tags
        initializeKeywordTags();
    }

    function searchICD10Codes(query) {
        const results = DataStore.icd10Codes.filter(code =>
            code.code.toLowerCase().includes(query.toLowerCase()) ||
            code.description.toLowerCase().includes(query.toLowerCase())
        );

        showDiagnosisSuggestions(results);
    }

    function showDiagnosisSuggestions(results) {
        const suggestionsContainer = document.getElementById('diagnosisSuggestions');
        if (!suggestionsContainer) return;

        if (results.length > 0) {
            let html = '';
            results.forEach(code => {
                html += `
                    <div class="diagnosis-suggestion-item" data-code="${code.code}">
                        <strong>${code.code}</strong> - ${code.description}
                    </div>
                `;
            });
            suggestionsContainer.innerHTML = html;
            suggestionsContainer.style.display = 'block';

            // Add click handlers
            suggestionsContainer.querySelectorAll('.diagnosis-suggestion-item').forEach(item => {
                item.addEventListener('click', function () {
                    const code = this.getAttribute('data-code');
                    const text = this.textContent;
                    document.getElementById('diagnosisSearch').value = text;
                    hideDiagnosisSuggestions();
                });
            });
        }
    }

    function hideDiagnosisSuggestions() {
        const suggestionsContainer = document.getElementById('diagnosisSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    function initializeKeywordTags() {
        const tagInput = document.querySelector('.tag-input');
        if (tagInput) {
            tagInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const tag = this.value.trim();
                    if (tag) {
                        addKeywordTag(tag);
                        this.value = '';
                    }
                }
            });
        }
    }

    function addKeywordTag(tag) {
        const container = document.querySelector('.keyword-tags-container');
        if (container) {
            const tagElement = document.createElement('span');
            tagElement.className = 'keyword-tag';
            tagElement.textContent = tag;
            container.insertBefore(tagElement, container.querySelector('.tag-input'));
        }
    }

    function saveClinicalNote(status) {
        const noteData = {
            chiefComplaint: document.getElementById('chiefComplaint')?.value || '',
            symptoms: document.getElementById('symptomsEditor')?.innerHTML || '',
            observations: document.getElementById('observationsEditor')?.innerHTML || '',
            diagnosis: document.getElementById('diagnosisSearch')?.value || '',
            treatmentPlan: document.getElementById('treatmentEditor')?.innerHTML || '',
            status: status,
            timestamp: new Date().toISOString()
        };

        // Simulate save
        console.log('Saving clinical note:', noteData);

        // Show success message
        showNotification('Clinical note saved successfully', 'success');

        // Close modal
        closeModal('notesEditorModal');

        // Refresh medical history
        if (PatientRecordsState.currentTab === 'medical-history') {
            updateMedicalHistoryDisplay();
        }
    }

    // ========================================
    // 9. DOCUMENT MANAGEMENT
    // ========================================
    function initializeFileHandlers() {
        const uploadBtn = document.getElementById('uploadDocBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', function () {
                openModal('uploadModal');
                initializeUploadZone();
            });
        }

        // Document filter buttons
        document.querySelectorAll('.doc-filter-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.doc-filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const category = this.getAttribute('data-category');
                filterDocuments(category);
            });
        });

        // Document action buttons
        initializeDocumentActions();
    }

    function initializeUploadZone() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.querySelector('.browse-files-btn');

        if (browseBtn) {
            browseBtn.addEventListener('click', function () {
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', function (e) {
                handleFileSelection(e.target.files);
            });
        }

        if (uploadZone) {
            // Drag and drop handlers
            uploadZone.addEventListener('dragover', function (e) {
                e.preventDefault();
                this.classList.add('dragover');
            });

            uploadZone.addEventListener('dragleave', function (e) {
                e.preventDefault();
                this.classList.remove('dragover');
            });

            uploadZone.addEventListener('drop', function (e) {
                e.preventDefault();
                this.classList.remove('dragover');
                handleFileSelection(e.dataTransfer.files);
            });
        }

        // Upload confirm button
        const uploadConfirmBtn = document.getElementById('uploadConfirmBtn');
        if (uploadConfirmBtn) {
            uploadConfirmBtn.addEventListener('click', function () {
                uploadDocuments();
            });
        }
    }

    function handleFileSelection(files) {
        const filePreviewArea = document.getElementById('filePreviewArea');
        if (!filePreviewArea) return;

        PatientRecordsState.uploadQueue = [];
        let previewHTML = '';

        for (let file of files) {
            // Validate file
            if (validateFile(file)) {
                PatientRecordsState.uploadQueue.push(file);
                previewHTML += `
                    <div class="file-preview-item">
                        <i class="fas fa-file"></i>
                        <span>${file.name}</span>
                        <span class="file-size">${formatFileSize(file.size)}</span>
                    </div>
                `;
            }
        }

        filePreviewArea.innerHTML = previewHTML;
    }

    function validateFile(file) {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            showNotification('Invalid file type. Only PDF, JPG, and PNG files are allowed.', 'error');
            return false;
        }

        if (file.size > maxSize) {
            showNotification('File size exceeds 10MB limit.', 'error');
            return false;
        }

        return true;
    }

    function uploadDocuments() {
        const category = document.getElementById('documentCategory')?.value;

        if (!category) {
            showNotification('Please select a document category.', 'warning');
            return;
        }

        if (PatientRecordsState.uploadQueue.length === 0) {
            showNotification('Please select files to upload.', 'warning');
            return;
        }

        // Simulate upload
        showLoadingState();

        setTimeout(() => {
            // Add to documents list
            PatientRecordsState.uploadQueue.forEach(file => {
                PatientRecordsState.documents.push({
                    id: Date.now(),
                    name: file.name,
                    category: category,
                    date: new Date().toLocaleDateString(),
                    size: formatFileSize(file.size)
                });
            });

            hideLoadingState();
            showNotification('Documents uploaded successfully.', 'success');
            closeModal('uploadModal');

            // Refresh documents display
            if (PatientRecordsState.currentTab === 'documents') {
                updateDocumentsDisplay();
            }
        }, 1500);
    }

    function initializeDocumentActions() {
        // View document buttons
        document.querySelectorAll('.view-doc').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const docId = this.getAttribute('data-doc-id');
                viewDocument(docId);
            });
        });

        // Download document buttons
        document.querySelectorAll('.download-doc').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const docId = this.getAttribute('data-doc-id');
                downloadDocument(docId);
            });
        });

        // Share document buttons
        document.querySelectorAll('.share-doc').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const docId = this.getAttribute('data-doc-id');
                shareDocument(docId);
            });
        });
    }

    function viewDocument(docId) {
        openModal('documentViewerModal');
        // Load and display document
        // Initialize viewer controls
        initializeDocumentViewer();
    }

    function initializeDocumentViewer() {
        const zoomIn = document.querySelector('.zoom-in');
        const zoomOut = document.querySelector('.zoom-out');
        const fitPage = document.querySelector('.fit-page');
        const download = document.querySelector('.viewer-btn.download');
        const print = document.querySelector('.viewer-btn.print');
        const share = document.querySelector('.viewer-btn.share');

        let currentZoom = 100;

        if (zoomIn) {
            zoomIn.addEventListener('click', function () {
                currentZoom = Math.min(currentZoom + 25, 200);
                updateDocumentZoom(currentZoom);
            });
        }

        if (zoomOut) {
            zoomOut.addEventListener('click', function () {
                currentZoom = Math.max(currentZoom - 25, 50);
                updateDocumentZoom(currentZoom);
            });
        }

        if (fitPage) {
            fitPage.addEventListener('click', function () {
                currentZoom = 100;
                updateDocumentZoom(currentZoom);
            });
        }

        if (download) {
            download.addEventListener('click', function () {
                // Trigger download
                console.log('Downloading document...');
            });
        }

        if (print) {
            print.addEventListener('click', function () {
                window.print();
            });
        }

        if (share) {
            share.addEventListener('click', function () {
                // Open share dialog
                console.log('Sharing document...');
            });
        }
    }

    function updateDocumentZoom(zoom) {
        const documentImage = document.querySelector('.document-image');
        if (documentImage) {
            documentImage.style.transform = `scale(${zoom / 100})`;
        }
    }

    function filterDocuments(category) {
        const documentItems = document.querySelectorAll('.document-item');

        documentItems.forEach(item => {
            if (category === 'all') {
                item.style.display = 'block';
            } else {
                const itemCategory = item.getAttribute('data-category');
                item.style.display = itemCategory === category ? 'block' : 'none';
            }
        });
    }

    // ========================================
    // 10. ALLERGIES & CONDITIONS
    // ========================================
    function updateAllergiesDisplay() {
        // Update allergy tags display
        const allergyTags = document.querySelector('.allergy-tags');
        if (allergyTags && PatientRecordsState.allergies.length > 0) {
            let html = '';
            PatientRecordsState.allergies.forEach(allergy => {
                html += `<span class="allergy-tag ${allergy.severity}">${allergy.name} (${capitalizeFirst(allergy.severity)})</span>`;
            });
            allergyTags.innerHTML = html;
        }

        // Edit allergies button
        const editAllergiesBtn = document.getElementById('editAllergiesBtn');
        if (editAllergiesBtn) {
            editAllergiesBtn.addEventListener('click', function () {
                openModal('allergyModal');
                loadAllergyModal();
            });
        }
    }

    function updateConditionsDisplay() {
        // Update condition tags display
        const conditionTags = document.querySelector('.condition-tags');
        if (conditionTags && PatientRecordsState.conditions.length > 0) {
            let html = '';
            PatientRecordsState.conditions.forEach(condition => {
                html += `<span class="condition-tag">${condition.name}</span>`;
            });
            conditionTags.innerHTML = html;
        }

        // Edit conditions button
        const editConditionsBtn = document.getElementById('editConditionsBtn');
        if (editConditionsBtn) {
            editConditionsBtn.addEventListener('click', function () {
                // Open conditions modal (similar to allergy modal)
                console.log('Edit conditions');
            });
        }
    }

    function loadAllergyModal() {
        const allergyList = document.querySelector('.allergy-list');
        if (allergyList) {
            let html = '';
            PatientRecordsState.allergies.forEach((allergy, index) => {
                html += `
                    <div class="allergy-item" data-index="${index}">
                        <span class="allergy-name">${allergy.name}</span>
                        <select class="severity-select">
                            <option value="mild" ${allergy.severity === 'mild' ? 'selected' : ''}>Mild</option>
                            <option value="moderate" ${allergy.severity === 'moderate' ? 'selected' : ''}>Moderate</option>
                            <option value="severe" ${allergy.severity === 'severe' ? 'selected' : ''}>Severe</option>
                        </select>
                        <select class="reaction-select">
                            <option value="rash" ${allergy.reaction === 'Rash' ? 'selected' : ''}>Rash</option>
                            <option value="anaphylaxis" ${allergy.reaction === 'Anaphylaxis' ? 'selected' : ''}>Anaphylaxis</option>
                            <option value="other">Other</option>
                        </select>
                        <button class="remove-allergy-btn" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            });
            allergyList.innerHTML = html;

            // Add remove handlers
            allergyList.querySelectorAll('.remove-allergy-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const index = this.getAttribute('data-index');
                    removeAllergy(index);
                });
            });
        }

        // Add new allergy handler
        const addAllergyBtn = document.querySelector('.add-allergy-btn');
        if (addAllergyBtn) {
            addAllergyBtn.addEventListener('click', function () {
                addNewAllergy();
            });
        }

        // Save allergies handler
        const saveAllergiesBtn = document.getElementById('saveAllergies');
        if (saveAllergiesBtn) {
            saveAllergiesBtn.addEventListener('click', function () {
                saveAllergies();
            });
        }
    }

    function removeAllergy(index) {
        PatientRecordsState.allergies.splice(index, 1);
        loadAllergyModal();
    }

    function addNewAllergy() {
        const allergySearch = document.getElementById('allergySearch');
        const allergyType = document.getElementById('allergyType');

        if (allergySearch && allergyType) {
            const name = allergySearch.value.trim();
            const type = allergyType.value;

            if (name && type) {
                PatientRecordsState.allergies.push({
                    name: name,
                    severity: 'mild',
                    reaction: 'Rash',
                    type: type
                });

                allergySearch.value = '';
                allergyType.value = '';
                loadAllergyModal();
            }
        }
    }

    function saveAllergies() {
        // Update allergy data from modal inputs
        const allergyItems = document.querySelectorAll('.allergy-item');
        allergyItems.forEach((item, index) => {
            const severity = item.querySelector('.severity-select').value;
            const reaction = item.querySelector('.reaction-select').value;

            if (PatientRecordsState.allergies[index]) {
                PatientRecordsState.allergies[index].severity = severity;
                PatientRecordsState.allergies[index].reaction = reaction;
            }
        });

        // Update display
        updateAllergiesDisplay();

        // Show success message
        showNotification('Allergies updated successfully', 'success');

        // Close modal
        closeModal('allergyModal');
    }

    // ========================================
    // 11. PRESCRIPTIONS
    // ========================================
    function updatePrescriptionsDisplay() {
        // Re-issue prescription buttons
        document.querySelectorAll('.reissue-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const prescriptionCard = this.closest('.prescription-card');
                reissuePrescription(prescriptionCard);
            });
        });

        // Modify prescription buttons
        document.querySelectorAll('.modify-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const prescriptionCard = this.closest('.prescription-card');
                modifyPrescription(prescriptionCard);
            });
        });

        // View PDF buttons
        document.querySelectorAll('.view-pdf-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                viewPrescriptionPDF();
            });
        });
    }

    function reissuePrescription(prescriptionCard) {
        // Navigate to prescriptions page with pre-filled data
        showNotification('Redirecting to prescriptions page...', 'info');
        setTimeout(() => {
            // In real app, this would navigate with prescription data
            console.log('Navigate to prescriptions page');
        }, 1000);
    }

    function modifyPrescription(prescriptionCard) {
        // Open prescription modification modal
        showNotification('Opening prescription editor...', 'info');
    }

    function viewPrescriptionPDF() {
        // Open PDF viewer
        openModal('documentViewerModal');
    }

    // ========================================
    // 12. ACTIVITY TIMELINE
    // ========================================
    function updateActivityTimelineDisplay() {
        const timelineContainer = document.querySelector('.activity-timeline');
        if (timelineContainer && PatientRecordsState.activityLog.length > 0) {
            // Timeline filter
            const filterSelect = document.querySelector('.timeline-filter-select');
            if (filterSelect) {
                filterSelect.addEventListener('change', function () {
                    filterActivityTimeline(this.value);
                });
            }
        }
    }

    function filterActivityTimeline(filterType) {
        const entries = document.querySelectorAll('.timeline-entry');
        entries.forEach(entry => {
            // Filter logic based on type
            entry.style.display = 'flex';
        });
    }

    // ========================================
    // 13. COMMENTS SYSTEM
    // ========================================
    function initializeCommentSystem() {
        const addCommentBtn = document.getElementById('addCommentBtn');
        if (addCommentBtn) {
            addCommentBtn.addEventListener('click', function () {
                openModal('commentModal');
                initializeCommentForm();
            });
        }

        // Reply buttons
        document.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const commentItem = this.closest('.comment-item');
                showReplyForm(commentItem);
            });
        });
    }

    function initializeCommentForm() {
        const commentText = document.getElementById('commentText');
        const mentionDropdown = document.getElementById('mentionDropdown');

        if (commentText) {
            commentText.addEventListener('input', function () {
                const text = this.value;
                const lastChar = text[text.length - 1];

                if (lastChar === '@') {
                    showMentionDropdown(this);
                }
            });
        }

        // Post comment button
        const postCommentBtn = document.getElementById('postComment');
        if (postCommentBtn) {
            postCommentBtn.addEventListener('click', function () {
                postComment();
            });
        }
    }

    function showMentionDropdown(textarea) {
        const mentionDropdown = document.getElementById('mentionDropdown');
        if (mentionDropdown) {
            mentionDropdown.style.display = 'block';

            // Position near cursor
            const rect = textarea.getBoundingClientRect();
            mentionDropdown.style.top = rect.bottom + 'px';
            mentionDropdown.style.left = rect.left + 'px';

            // Add click handlers to mention items
            mentionDropdown.querySelectorAll('.mention-item').forEach(item => {
                item.addEventListener('click', function () {
                    const name = this.textContent;
                    const currentText = textarea.value;
                    textarea.value = currentText + name + ' ';
                    mentionDropdown.style.display = 'none';
                });
            });
        }
    }

    function postComment() {
        const commentText = document.getElementById('commentText').value;
        const priority = document.querySelector('input[name="priority"]:checked').value;
        const reference = document.getElementById('attachReference').value;

        if (!commentText.trim()) {
            showNotification('Please enter a comment', 'warning');
            return;
        }

        const newComment = {
            id: Date.now(),
            author: 'Dr. Sarah Wanjiru',
            date: new Date().toLocaleString(),
            priority: priority,
            text: commentText,
            reference: reference,
            replies: []
        };

        PatientRecordsState.comments.push(newComment);

        // Send notifications if mentions present
        if (commentText.includes('@')) {
            sendMentionNotifications(commentText);
        }

        showNotification('Comment posted successfully', 'success');
        closeModal('commentModal');

        // Refresh comments display
        if (PatientRecordsState.currentTab === 'comments') {
            updateCommentsDisplay();
        }
    }

    function sendMentionNotifications(text) {
        // Parse mentions and send notifications
        const mentions = text.match(/@[\w\s]+/g);
        if (mentions) {
            mentions.forEach(mention => {
                console.log('Sending notification to:', mention);
            });
        }
    }

    function showReplyForm(commentItem) {
        // Create inline reply form
        const replyForm = document.createElement('div');
        replyForm.className = 'reply-form';
        replyForm.innerHTML = `
            <textarea class="reply-input" placeholder="Type your reply..."></textarea>
            <div class="reply-actions">
                <button class="btn-secondary cancel-reply">Cancel</button>
                <button class="btn-primary submit-reply">Reply</button>
            </div>
        `;

        commentItem.appendChild(replyForm);

        // Handle reply submission
        replyForm.querySelector('.submit-reply').addEventListener('click', function () {
            const replyText = replyForm.querySelector('.reply-input').value;
            if (replyText.trim()) {
                submitReply(commentItem, replyText);
                commentItem.removeChild(replyForm);
            }
        });

        // Handle cancel
        replyForm.querySelector('.cancel-reply').addEventListener('click', function () {
            commentItem.removeChild(replyForm);
        });
    }

    function submitReply(commentItem, replyText) {
        // Add reply to comment
        console.log('Reply submitted:', replyText);
        showNotification('Reply posted successfully', 'success');
    }

    function updateCommentsDisplay() {
        // Refresh comments thread display
        console.log('Updating comments display');
    }

    function updateClinicalNotesDisplay() {
        // Refresh clinical notes display
        console.log('Updating clinical notes display');
    }

    function updateDocumentsDisplay() {
        // Refresh documents display
        console.log('Updating documents display');
    }

    function downloadDocument(docId) {
        // Trigger document download
        console.log('Downloading document:', docId);
        showNotification('Download started...', 'info');
    }

    function shareDocument(docId) {
        // Open share dialog
        console.log('Sharing document:', docId);
    }

    // ========================================
    // 14. CONSULTATION INTEGRATION
    // ========================================
    const splitViewBtn = document.getElementById('splitViewBtn');
    if (splitViewBtn) {
        splitViewBtn.addEventListener('click', function () {
            toggleSplitView();
        });
    }

    const quickStartBtn = document.querySelector('.quick-start-consultation-btn');
    if (quickStartBtn) {
        quickStartBtn.addEventListener('click', function () {
            startQuickConsultation();
        });
    }

    function toggleSplitView() {
        PatientRecordsState.splitViewActive = !PatientRecordsState.splitViewActive;

        if (PatientRecordsState.splitViewActive) {
            // Open split view
            document.querySelector('.main-content').classList.add('split-view-active');
            showNotification('Split view activated', 'info');
        } else {
            // Close split view
            document.querySelector('.main-content').classList.remove('split-view-active');
        }
    }

    function startQuickConsultation() {
        showNotification('Redirecting to consultation...', 'info');
        setTimeout(() => {
            // Navigate to consultations page
            console.log('Navigate to consultations');
        }, 1000);
    }

    // ========================================
    // 15. MODALS MANAGEMENT
    // ========================================
    function initializeModals() {
        // Close buttons
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function () {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Dismiss buttons
        document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', function () {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Click outside to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function (e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });

        // Apply filters button
        const applyFiltersBtn = document.getElementById('applyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', function () {
                applySearchFilters();
            });
        }
    }

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // ========================================
    // 16. SEARCH FILTERS
    // ========================================
    function applySearchFilters() {
        // Get filter values
        PatientRecordsState.filters = {
            name: document.getElementById('filterName')?.value || '',
            gender: document.querySelector('input[name="gender"]:checked')?.value || 'all',
            ageMin: document.getElementById('ageMin')?.value || null,
            ageMax: document.getElementById('ageMax')?.value || null,
            visitFrom: document.getElementById('visitFrom')?.value || null,
            visitTo: document.getElementById('visitTo')?.value || null,
            chronicConditions: Array.from(document.getElementById('chronicConditions')?.selectedOptions || [])
                .map(option => option.value)
        };

        // Apply filters to search
        performAdvancedSearch(PatientRecordsState.filters);

        // Close modal
        closeModal('filterModal');
    }

    function performAdvancedSearch(filters) {
        showLoadingState();

        // Simulate filtered search
        setTimeout(() => {
            let results = DataStore.patients;

            // Apply filters
            if (filters.name) {
                results = results.filter(p =>
                    p.name.toLowerCase().includes(filters.name.toLowerCase())
                );
            }

            if (filters.gender !== 'all') {
                results = results.filter(p =>
                    p.gender.toLowerCase() === filters.gender
                );
            }

            if (filters.ageMin) {
                results = results.filter(p => p.age >= filters.ageMin);
            }

            if (filters.ageMax) {
                results = results.filter(p => p.age <= filters.ageMax);
            }

            hideLoadingState();
            showSearchResults(results);
        }, 500);
    }

    function showSearchResults(results) {
        showNotification(`Found ${results.length} patients matching your criteria`, 'info');
        // Display results in UI
    }

    // ========================================
    // 17. ACCESS CONTROL
    // ========================================
    function initializeAccessControl() {
        // Check user permissions
        const userPermissions = {
            canView: true,
            canEdit: true,
            canDelete: false,
            assignedPatientsOnly: true
        };

        // Apply permission-based UI adjustments
        if (!userPermissions.canEdit) {
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.style.display = 'none';
            });
        }

        if (!userPermissions.canDelete) {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }

    // ========================================
    // 18. REAL-TIME UPDATES
    // ========================================
    function setupRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            checkForUpdates();
        }, 30000); // Check every 30 seconds
    }

    function checkForUpdates() {
        // Check for new lab results, comments, etc.
        console.log('Checking for updates...');
    }

    // ========================================
    // 19. DARK MODE
    // ========================================
    function initializeDarkMode() {
        const darkModeBtn = document.getElementById('darkModeBtn');
        const savedTheme = localStorage.getItem('theme') || 'light';

        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            if (darkModeBtn) {
                darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
            }
        }

        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', function () {
                const currentTheme = document.body.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';

                document.body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);

                this.innerHTML = newTheme === 'dark' ?
                    '<i class="fas fa-sun"></i>' :
                    '<i class="fas fa-moon"></i>';
            });
        }
    }

    // ========================================
    // 20. UTILITY FUNCTIONS
    // ========================================
    function showLoadingState() {
        PatientRecordsState.isLoading = true;
        // Show loading spinner
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
    }

    function hideLoadingState() {
        PatientRecordsState.isLoading = false;
        // Remove loading spinner
        const loader = document.querySelector('.loading-overlay');
        if (loader) {
            loader.remove();
        }
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    function getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ========================================
    // 21. CSS FOR NOTIFICATIONS & LOADER
    // ========================================
    const style = document.createElement('style');
    style.textContent = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-top-color: #00BFA5;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .notification {
            position: fixed;
            top: 100px;
            right: -400px;
            max-width: 400px;
            padding: 16px 24px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: right 0.3s ease;
            z-index: 9999;
        }
        
        .notification.show {
            right: 24px;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .notification-success {
            border-left: 4px solid #4CAF50;
        }
        
        .notification-success i {
            color: #4CAF50;
        }
        
        .notification-error {
            border-left: 4px solid #F44336;
        }
        
        .notification-error i {
            color: #F44336;
        }
        
        .notification-warning {
            border-left: 4px solid #FFC107;
        }
        
        .notification-warning i {
            color: #FFC107;
        }
        
        .notification-info {
            border-left: 4px solid #2196F3;
        }
        
        .notification-info i {
            color: #2196F3;
        }
        
        .file-preview-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: #F5F5F7;
            border-radius: 6px;
            margin-bottom: 8px;
        }
        
        .file-size {
            margin-left: auto;
            font-size: 0.813rem;
            color: #666;
        }
        
        .diagnosis-suggestion-item {
            padding: 8px 12px;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .diagnosis-suggestion-item:hover {
            background: rgba(0, 191, 165, 0.1);
        }
        
        .reply-form {
            margin-top: 16px;
            padding: 16px;
            background: #F5F5F7;
            border-radius: 6px;
        }
        
        .reply-input {
            width: 100%;
            padding: 8px;
            border: 1px solid #E0E0E2;
            border-radius: 4px;
            resize: vertical;
            min-height: 60px;
            font-family: inherit;
        }
        
        .reply-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            justify-content: flex-end;
        }
        
        .split-view-active {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
    `;
    document.head.appendChild(style);

})();
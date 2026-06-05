// ========================================
// CURIS CONSULTATIONS - COMPREHENSIVE JAVASCRIPT
// Full Dynamic Functionality Implementation
// ========================================

(function() {
    'use strict';

    // ========================================
    // 1. GLOBAL STATE MANAGEMENT
    // ========================================
    const ConsultationsState = {
        currentTab: 'upcoming',
        activeConsultations: new Map(),
        sessionTimers: new Map(),
        filters: {
            dateRange: 'today',
            dateFrom: null,
            dateTo: null,
            patientName: '',
            status: 'all'
        },
        consultations: {
            upcoming: [],
            ongoing: [],
            completed: [],
            missed: []
        },
        currentSession: null,
        autoSaveInterval: null,
        countdownInterval: null,
        documentationMode: 'split-view',
        liveNotes: {
            diagnosis: [],
            observations: '',
            vitals: {},
            nextSteps: {}
        },
        patientWaitingQueue: [],
        missedSessionTracker: new Map()
    };

    // Sample data store
    const DataStore = {
        consultations: [
            {
                id: 1,
                patientId: 'PAT-2024-001',
                patientName: 'John Kamau',
                patientPhoto: 'icons8-profile-picture-40.png',
                time: '10:30 AM - 11:00 AM',
                mode: 'online',
                meetLink: 'https://meet.google.com/abc-defg-hij',
                reason: 'Follow-up Consultation',
                status: 'scheduled',
                date: '2025-09-26',
                room: null
            },
            {
                id: 2,
                patientId: 'PAT-2024-002',
                patientName: 'Mary Wambui',
                patientPhoto: 'icons8-profile-picture-40.png',
                time: '11:15 AM - 11:45 AM',
                mode: 'in-clinic',
                room: 'Room 203',
                reason: 'Initial Consultation',
                status: 'scheduled',
                date: '2025-09-26',
                meetLink: null
            },
            {
                id: 3,
                patientId: 'PAT-2024-003',
                patientName: 'Peter Ochieng',
                patientPhoto: 'icons8-profile-picture-40.png',
                time: '09:00 AM - 09:30 AM',
                mode: 'online',
                meetLink: 'https://meet.google.com/xyz-uvwx-yz',
                reason: 'Post-surgery Review',
                status: 'ongoing',
                date: '2025-09-26',
                startTime: new Date().getTime() - (23 * 60 * 1000) // Started 23 mins ago
            },
            {
                id: 4,
                patientId: 'PAT-2024-004',
                patientName: 'Grace Njeri',
                patientPhoto: 'icons8-profile-picture-40.png',
                time: '09:45 AM - 10:15 AM',
                mode: 'in-clinic',
                room: 'Room 105',
                reason: 'Routine Check-up',
                status: 'ongoing',
                date: '2025-09-26',
                startTime: new Date().getTime() - (15 * 60 * 1000) // Started 15 mins ago
            }
        ],
        patientRecords: {
            'PAT-2024-001': {
                name: 'John Kamau',
                age: 45,
                gender: 'Male',
                bloodType: 'O+',
                activeConditions: ['Hypertension', 'Diabetes Type 2'],
                currentMedications: [
                    'Amlodipine 5mg - Once daily',
                    'Metformin 500mg - Twice daily'
                ],
                allergies: [
                    { name: 'Penicillin', severity: 'severe' },
                    { name: 'Latex', severity: 'moderate' }
                ],
                medicalHistory: [
                    {
                        date: '2025-09-20',
                        type: 'Follow-up Consultation',
                        notes: 'Blood pressure control assessment. Patient responding well to medication.'
                    },
                    {
                        date: '2025-08-15',
                        type: 'Initial Diagnosis',
                        notes: 'Essential Hypertension (I10) diagnosed. Started on Amlodipine 5mg.'
                    }
                ]
            }
        },
        icd10Codes: [
            { code: 'I10', description: 'Essential (primary) hypertension' },
            { code: 'E11', description: 'Type 2 diabetes mellitus' },
            { code: 'J45', description: 'Asthma' },
            { code: 'M79.3', description: 'Myalgia' }
        ]
    };

    // ========================================
    // 2. INITIALIZATION
    // ========================================
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });

    function initializeApp() {
        // Core initializations
        initializeNavigation();
        initializeTabs();
        initializeFilters();
        initializeSessionControls();
        initializeModals();
        initializeLiveDocumentation();
        initializeTimers();
        initializeNotifications();
        initializeProfileDropdown();
        initializeDarkMode();
        
        // Load initial data
        loadConsultations();
        setupCountdownTimer();
        checkPatientWaitingStatus();
        checkMissedSessions();
        
        // Set up real-time updates
        setupRealTimeUpdates();
        setupAutoSave();
    }

    // ========================================
    // 3. NAVIGATION & PROFILE
    // ========================================
    function initializeNavigation() {
        // Sidebar navigation active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
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
            userProfile.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.toggle('active');
            });

            document.addEventListener('click', function(e) {
                if (!userProfile.contains(e.target) && !profileDropdown.contains(e.target)) {
                    userProfile.classList.remove('active');
                }
            });
        }
    }

    // ========================================
    // 4. TAB NAVIGATION
    // ========================================
    function initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                this.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                ConsultationsState.currentTab = targetTab;
                loadTabContent(targetTab);
            });
        });
    }

    function loadTabContent(tabName) {
        // Load appropriate content based on tab
        switch(tabName) {
            case 'upcoming':
                loadUpcomingConsultations();
                break;
            case 'ongoing':
                loadOngoingConsultations();
                break;
            case 'completed':
                loadCompletedConsultations();
                break;
            case 'missed':
                loadMissedConsultations();
                break;
        }
        updateTabCounts();
    }

    function updateTabCounts() {
        // Update tab count badges
        const counts = {
            upcoming: ConsultationsState.consultations.upcoming.length,
            ongoing: ConsultationsState.consultations.ongoing.length,
            completed: ConsultationsState.consultations.completed.length,
            missed: ConsultationsState.consultations.missed.length
        };
        
        document.querySelectorAll('.tab-count').forEach(count => {
            const tab = count.closest('.tab-btn').getAttribute('data-tab');
            if (counts[tab] !== undefined) {
                count.textContent = counts[tab];
            }
        });
    }

    // ========================================
    // 5. FILTERS & SEARCH
    // ========================================
    function initializeFilters() {
        // Date Range Filter
        initializeDateFilter();
        
        // Patient Search
        initializePatientSearch();
        
        // Status Filter
        initializeStatusFilter();
        
        // Apply & Clear Filters
        document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
        document.getElementById('clearFilters')?.addEventListener('click', clearFilters);
    }

    function initializeDateFilter() {
        // Quick date buttons
        document.querySelectorAll('.quick-date-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.quick-date-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const range = this.getAttribute('data-range');
                ConsultationsState.filters.dateRange = range;
                setDateRange(range);
            });
        });
        
        // Calendar button
        document.querySelector('.calendar-btn')?.addEventListener('click', function() {
            openModal('calendarModal');
        });
    }

    function setDateRange(range) {
        const today = new Date();
        let from = new Date();
        let to = new Date();
        
        switch(range) {
            case 'today':
                // From and to are same day
                break;
            case 'week':
                from.setDate(today.getDate() - today.getDay()); // Start of week
                to.setDate(from.getDate() + 6); // End of week
                break;
            case 'month':
                from.setDate(1); // Start of month
                to = new Date(today.getFullYear(), today.getMonth() + 1, 0); // End of month
                break;
            case 'custom':
                // Open calendar modal
                openModal('calendarModal');
                return;
        }
        
        ConsultationsState.filters.dateFrom = from;
        ConsultationsState.filters.dateTo = to;
        updateDateDisplay();
    }

    function updateDateDisplay() {
        const dateInput = document.getElementById('dateRangeFilter');
        if (dateInput && ConsultationsState.filters.dateFrom && ConsultationsState.filters.dateTo) {
            const from = ConsultationsState.filters.dateFrom.toLocaleDateString();
            const to = ConsultationsState.filters.dateTo.toLocaleDateString();
            dateInput.value = from === to ? from : `${from} - ${to}`;
        }
    }

    function initializePatientSearch() {
        const searchInput = document.getElementById('patientSearch');
        const clearBtn = document.querySelector('.clear-search-btn');
        const recentChips = document.querySelectorAll('.recent-search-chip');
        
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                const query = this.value.trim();
                ConsultationsState.filters.patientName = query;
                
                if (query.length > 0) {
                    clearBtn.style.display = 'block';
                } else {
                    clearBtn.style.display = 'none';
                }
                
                searchTimeout = setTimeout(() => applyFilters(), 300);
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                searchInput.value = '';
                this.style.display = 'none';
                ConsultationsState.filters.patientName = '';
                applyFilters();
            });
        }
        
        // Recent search chips
        recentChips.forEach(chip => {
            chip.addEventListener('click', function() {
                const name = this.textContent;
                searchInput.value = name;
                ConsultationsState.filters.patientName = name;
                applyFilters();
            });
        });
    }

    function initializeStatusFilter() {
        const statusSelect = document.getElementById('statusFilter');
        if (statusSelect) {
            statusSelect.addEventListener('change', function() {
                ConsultationsState.filters.status = this.value;
            });
        }
    }

    function applyFilters() {
        // Apply all active filters
        loadConsultations();
        showNotification('Filters applied successfully', 'success');
    }

    function clearFilters() {
        // Reset all filters
        ConsultationsState.filters = {
            dateRange: 'today',
            dateFrom: null,
            dateTo: null,
            patientName: '',
            status: 'all'
        };
        
        // Reset UI
        document.getElementById('patientSearch').value = '';
        document.getElementById('statusFilter').value = 'all';
        document.querySelectorAll('.quick-date-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-range') === 'today');
        });
        
        applyFilters();
    }

    // ========================================
    // 6. CONSULTATION LOADING
    // ========================================
    function loadConsultations() {
        // Filter consultations based on current filters
        const filtered = DataStore.consultations.filter(consultation => {
            // Apply filters
            if (ConsultationsState.filters.patientName) {
                if (!consultation.patientName.toLowerCase().includes(
                    ConsultationsState.filters.patientName.toLowerCase()
                )) {
                    return false;
                }
            }
            
            if (ConsultationsState.filters.status !== 'all') {
                if (consultation.status !== ConsultationsState.filters.status) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Categorize consultations
        ConsultationsState.consultations = {
            upcoming: filtered.filter(c => c.status === 'scheduled'),
            ongoing: filtered.filter(c => c.status === 'ongoing'),
            completed: filtered.filter(c => c.status === 'completed'),
            missed: filtered.filter(c => c.status === 'missed')
        };
        
        // Load current tab content
        loadTabContent(ConsultationsState.currentTab);
    }

    function loadUpcomingConsultations() {
        const container = document.querySelector('#upcoming .consultation-list');
        if (!container) return;
        
        // Initialize action handlers for upcoming consultations
        initializeUpcomingActions();
    }

    function loadOngoingConsultations() {
        const container = document.querySelector('#ongoing .consultation-list');
        if (!container) return;
        
        // Start timers for ongoing sessions
        ConsultationsState.consultations.ongoing.forEach(consultation => {
            if (consultation.startTime && !ConsultationsState.sessionTimers.has(consultation.id)) {
                startSessionTimer(consultation.id, consultation.startTime);
            }
        });
        
        initializeOngoingActions();
    }

    function loadCompletedConsultations() {
        initializeCompletedActions();
    }

    function loadMissedConsultations() {
        initializeMissedActions();
    }

    // ========================================
    // 7. SESSION CONTROLS
    // ========================================
    function initializeSessionControls() {
        // Join Consultation (Online)
        document.querySelectorAll('.join-consultation-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const meetLink = this.getAttribute('data-meet-link');
                const consultationId = this.closest('.consultation-entry').getAttribute('data-consultation-id');
                joinOnlineConsultation(consultationId, meetLink);
            });
        });
        
        // Start Consultation (In-clinic)
        document.querySelectorAll('.start-consultation-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const consultationId = this.getAttribute('data-consultation-id');
                openStartSessionModal(consultationId);
            });
        });
        
        // End Session
        document.querySelectorAll('.end-session-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const consultationId = this.getAttribute('data-consultation-id');
                openEndSessionModal(consultationId);
            });
        });
        
        // Live Notes
        document.querySelectorAll('.notes-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const consultationId = this.getAttribute('data-consultation-id');
                openLiveDocumentation(consultationId);
            });
        });
    }

    function initializeUpcomingActions() {
        // View Patient Records
        document.querySelectorAll('.view-patient-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const patientId = this.getAttribute('data-patient-id');
                viewPatientRecords(patientId);
            });
        });
    }

    function initializeOngoingActions() {
        // Resume Consultation
        document.querySelectorAll('.resume-consultation-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                resumeConsultation();
            });
        });
    }

    function initializeCompletedActions() {
        // View Notes
        document.querySelectorAll('.view-notes-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const consultationId = this.getAttribute('data-consultation-id');
                viewConsultationNotes(consultationId);
            });
        });
    }

    function initializeMissedActions() {
        // Follow-up
        document.querySelectorAll('.follow-up-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const patientId = this.getAttribute('data-patient-id');
                initiateFollowUp(patientId);
            });
        });
        
        // Reschedule
        document.querySelectorAll('.reschedule-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const consultationId = this.getAttribute('data-consultation-id');
                rescheduleConsultation(consultationId);
            });
        });
    }

    // ========================================
    // 8. ONLINE CONSULTATION (GOOGLE MEET)
    // ========================================
    function joinOnlineConsultation(consultationId, meetLink) {
        // Pre-join checks
        performPreJoinChecks(consultationId).then(canJoin => {
            if (canJoin) {
                // Launch Google Meet in new tab
                window.open(meetLink, '_blank');
                
                // Update status to ongoing
                updateConsultationStatus(consultationId, 'ongoing');
                
                // Start session timer
                const startTime = new Date().getTime();
                startSessionTimer(consultationId, startTime);
                
                // Store in active consultations
                ConsultationsState.activeConsultations.set(consultationId, {
                    startTime: startTime,
                    mode: 'online',
                    meetLink: meetLink
                });
                
                // Show notification
                showNotification('Joined online consultation successfully', 'success');
                
                // Refresh UI
                loadConsultations();
            }
        });
    }

    function performPreJoinChecks(consultationId) {
        return new Promise((resolve) => {
            // Check if it's time for the consultation
            const now = new Date();
            const scheduledTime = getScheduledTime(consultationId);
            
            if (!scheduledTime) {
                resolve(true);
                return;
            }
            
            const timeDiff = scheduledTime - now;
            const minutesUntil = Math.floor(timeDiff / (1000 * 60));
            
            if (minutesUntil > 5) {
                showNotification(`Consultation starts in ${minutesUntil} minutes`, 'warning');
                resolve(false);
            } else {
                // Check if patient has joined
                checkPatientJoined(consultationId).then(hasJoined => {
                    if (hasJoined) {
                        showPatientWaitingAlert();
                    }
                    resolve(true);
                });
            }
        });
    }

    function getScheduledTime(consultationId) {
        // Get scheduled time from consultation data
        const consultation = DataStore.consultations.find(c => c.id == consultationId);
        if (consultation && consultation.time) {
            // Parse time string
            const timeParts = consultation.time.split(' - ')[0].split(':');
            const date = new Date();
            date.setHours(parseInt(timeParts[0]));
            date.setMinutes(parseInt(timeParts[1].split(' ')[0]));
            return date;
        }
        return null;
    }

    function checkPatientJoined(consultationId) {
        // Simulate checking if patient has joined
        return new Promise((resolve) => {
            // In real implementation, this would check with backend
            const hasJoined = Math.random() > 0.5;
            resolve(hasJoined);
        });
    }

    function showPatientWaitingAlert() {
        const toast = document.getElementById('patientWaitingToast');
        if (toast) {
            toast.style.display = 'flex';
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                toast.style.display = 'none';
            }, 10000);
            
            // Join now button
            toast.querySelector('.join-now')?.addEventListener('click', function() {
                toast.style.display = 'none';
            });
            
            // Close button
            toast.querySelector('.toast-close')?.addEventListener('click', function() {
                toast.style.display = 'none';
            });
        }
    }

    // ========================================
    // 9. IN-CLINIC CONSULTATION
    // ========================================
    function openStartSessionModal(consultationId) {
        const modal = document.getElementById('startSessionModal');
        if (!modal) return;
        
        // Get consultation details
        const consultation = DataStore.consultations.find(c => c.id == consultationId);
        if (consultation) {
            // Update modal content
            document.getElementById('confirmPatientName').textContent = consultation.patientName;
            document.getElementById('confirmSessionTime').textContent = consultation.time;
            
            modal.classList.add('active');
            
            // Confirm start button
            document.getElementById('confirmStartSession')?.addEventListener('click', function() {
                const roomNumber = document.getElementById('roomNumber')?.value;
                startInClinicSession(consultationId, roomNumber);
                closeModal('startSessionModal');
            });
        }
    }

    function startInClinicSession(consultationId, roomNumber) {
        // Update status to ongoing
        updateConsultationStatus(consultationId, 'ongoing');
        
        // Start timer
        const startTime = new Date().getTime();
        startSessionTimer(consultationId, startTime);
        
        // Store in active consultations
        ConsultationsState.activeConsultations.set(consultationId, {
            startTime: startTime,
            mode: 'in-clinic',
            room: roomNumber || 'Not specified'
        });
        
        // Enable live notes
        openLiveDocumentation(consultationId);
        
        // Show notification
        showNotification('In-clinic session started', 'success');
        
        // Refresh UI
        loadConsultations();
    }

    function updateConsultationStatus(consultationId, newStatus) {
        const consultation = DataStore.consultations.find(c => c.id == consultationId);
        if (consultation) {
            consultation.status = newStatus;
            
            if (newStatus === 'ongoing') {
                consultation.startTime = new Date().getTime();
            } else if (newStatus === 'completed') {
                consultation.endTime = new Date().getTime();
            }
        }
    }

    // ========================================
    // 10. SESSION TIMER
    // ========================================
    function startSessionTimer(consultationId, startTime) {
        const timerDisplay = document.querySelector(
            `.consultation-entry[data-consultation-id="${consultationId}"] .timer-display`
        );
        
        if (!timerDisplay) return;
        
        // Clear existing timer if any
        if (ConsultationsState.sessionTimers.has(consultationId)) {
            clearInterval(ConsultationsState.sessionTimers.get(consultationId));
        }
        
        // Start new timer
        const timerId = setInterval(() => {
            const elapsed = new Date().getTime() - startTime;
            const hours = Math.floor(elapsed / (1000 * 60 * 60));
            const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
            
            timerDisplay.textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
        
        ConsultationsState.sessionTimers.set(consultationId, timerId);
    }

    function stopSessionTimer(consultationId) {
        if (ConsultationsState.sessionTimers.has(consultationId)) {
            clearInterval(ConsultationsState.sessionTimers.get(consultationId));
            ConsultationsState.sessionTimers.delete(consultationId);
        }
    }

    // ========================================
    // 11. LIVE DOCUMENTATION
    // ========================================
    function initializeLiveDocumentation() {
        // View mode buttons
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const mode = this.getAttribute('data-mode');
                setDocumentationMode(mode);
            });
        });
        
        // Editor toolbar
        initializeEditorToolbar();
        
        // Diagnosis input
        initializeDiagnosisInput();
        
        // Template selection
        initializeTemplateSelection();
        
        // Vitals input
        initializeVitalsInput();
        
        // Voice-to-text
        initializeVoiceToText();
    }

    function openLiveDocumentation(consultationId) {
        ConsultationsState.currentSession = consultationId;
        
        // Load patient data
        loadPatientQuickSummary(consultationId);
        
        // Show documentation section
        const docSection = document.getElementById('liveDocumentation');
        if (docSection) {
            docSection.style.display = 'block';
            
            // Scroll to documentation
            docSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Start auto-save
        startAutoSave();
    }

    function setDocumentationMode(mode) {
        ConsultationsState.documentationMode = mode;
        
        // Update UI
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
        });
        
        // Apply mode-specific layout changes
        switch(mode) {
            case 'side-drawer':
                // Implement side drawer layout
                break;
            case 'full-modal':
                openModal('patientDataModal');
                break;
            case 'split-view':
                // Default layout
                break;
        }
    }

    function loadPatientQuickSummary(consultationId) {
        const consultation = DataStore.consultations.find(c => c.id == consultationId);
        if (!consultation) return;
        
        const patientData = DataStore.patientRecords[consultation.patientId];
        if (!patientData) return;
        
        // Update quick summary display
        document.querySelector('.quick-summary h4').textContent = `Patient: ${consultation.patientName}`;
        
        // Update conditions
        const conditionTags = document.querySelector('.condition-tags');
        if (conditionTags) {
            conditionTags.innerHTML = patientData.activeConditions
                .map(condition => `<span class="condition-tag">${condition}</span>`)
                .join('');
        }
        
        // Update medications
        const medList = document.querySelector('.medication-list');
        if (medList) {
            medList.innerHTML = patientData.currentMedications
                .map(med => `<li>${med}</li>`)
                .join('');
        }
    }

    function initializeEditorToolbar() {
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const command = this.getAttribute('data-command');
                if (command) {
                    document.execCommand(command, false, null);
                }
            });
        });
    }

    function initializeDiagnosisInput() {
        const icdLookup = document.getElementById('icdLookup');
        const addDiagnosisBtn = document.querySelector('.add-diagnosis-btn');
        
        if (icdLookup) {
            let lookupTimeout;
            icdLookup.addEventListener('input', function() {
                clearTimeout(lookupTimeout);
                const query = this.value.trim();
                
                if (query.length > 2) {
                    lookupTimeout = setTimeout(() => searchICD10(query), 300);
                }
            });
        }
        
        if (addDiagnosisBtn) {
            addDiagnosisBtn.addEventListener('click', function() {
                addDiagnosis();
            });
        }
        
        // Remove diagnosis buttons
        document.querySelectorAll('.remove-diagnosis').forEach(btn => {
            btn.addEventListener('click', function() {
                removeDiagnosis(this.closest('.diagnosis-item'));
            });
        });
    }

    function searchICD10(query) {
        const results = DataStore.icd10Codes.filter(code => 
            code.code.toLowerCase().includes(query.toLowerCase()) ||
            code.description.toLowerCase().includes(query.toLowerCase())
        );
        
        // Show suggestions (implementation depends on UI)
        console.log('ICD-10 search results:', results);
    }

    function addDiagnosis() {
        const input = document.getElementById('icdLookup');
        if (!input || !input.value.trim()) return;
        
        const diagnosisList = document.querySelector('.diagnosis-list');
        if (diagnosisList) {
            const newDiagnosis = document.createElement('div');
            newDiagnosis.className = 'diagnosis-item';
            newDiagnosis.innerHTML = `
                <span class="diagnosis-type primary">Primary</span>
                <span class="diagnosis-code">${input.value}</span>
                <button class="remove-diagnosis">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            diagnosisList.appendChild(newDiagnosis);
            
            // Add to state
            ConsultationsState.liveNotes.diagnosis.push(input.value);
            
            // Clear input
            input.value = '';
            
            // Add remove handler
            newDiagnosis.querySelector('.remove-diagnosis').addEventListener('click', function() {
                removeDiagnosis(newDiagnosis);
            });
        }
    }

    function removeDiagnosis(diagnosisElement) {
        if (diagnosisElement) {
            diagnosisElement.remove();
            // Update state
            const code = diagnosisElement.querySelector('.diagnosis-code').textContent;
            const index = ConsultationsState.liveNotes.diagnosis.indexOf(code);
            if (index > -1) {
                ConsultationsState.liveNotes.diagnosis.splice(index, 1);
            }
        }
    }

    function initializeTemplateSelection() {
        const templateSelect = document.querySelector('.template-select');
        if (templateSelect) {
            templateSelect.addEventListener('change', function() {
                loadTemplate(this.value);
            });
        }
    }

    function loadTemplate(templateType) {
        const observationsEditor = document.getElementById('observationsEditor');
        if (!observationsEditor || !templateType) return;
        
        // Load template content based on type
        const templates = {
            'general': 'Chief Complaint:\n\nHistory of Present Illness:\n\nReview of Systems:\n\nPhysical Examination:\n\nAssessment:\n\nPlan:',
            'followup': 'Follow-up Visit\n\nProgress since last visit:\n\nCurrent symptoms:\n\nMedication compliance:\n\nSide effects:\n\nPlan:',
            'initial': 'Initial Assessment\n\nChief Complaint:\n\nHistory of Present Illness:\n\nPast Medical History:\n\nMedications:\n\nAllergies:\n\nSocial History:\n\nFamily History:\n\nReview of Systems:\n\nPhysical Examination:\n\nAssessment:\n\nPlan:'
        };
        
        if (templates[templateType]) {
            observationsEditor.innerHTML = `<pre>${templates[templateType]}</pre>`;
        }
    }

    function initializeVitalsInput() {
        document.querySelectorAll('.vital-field').forEach(input => {
            input.addEventListener('input', function() {
                const vitalType = this.closest('.vital-input').querySelector('label').textContent;
                ConsultationsState.liveNotes.vitals[vitalType] = this.value;
            });
        });
        
        // Temperature unit toggle
        document.querySelector('.temp-unit')?.addEventListener('change', function() {
            convertTemperature(this.value);
        });
        
        // Weight unit toggle
        document.querySelector('.weight-unit')?.addEventListener('change', function() {
            convertWeight(this.value);
        });
    }

    function convertTemperature(unit) {
        const tempInput = document.querySelector('.vital-input .temp-input input');
        if (!tempInput || !tempInput.value) return;
        
        const value = parseFloat(tempInput.value);
        if (unit === 'fahrenheit') {
            tempInput.value = ((value * 9/5) + 32).toFixed(1);
        } else {
            tempInput.value = ((value - 32) * 5/9).toFixed(1);
        }
    }

    function convertWeight(unit) {
        const weightInput = document.querySelector('.vital-input .weight-input input');
        if (!weightInput || !weightInput.value) return;
        
        const value = parseFloat(weightInput.value);
        if (unit === 'lbs') {
            weightInput.value = (value * 2.20462).toFixed(1);
        } else {
            weightInput.value = (value / 2.20462).toFixed(1);
        }
    }

    function initializeVoiceToText() {
        const voiceBtn = document.querySelector('.voice-to-text-btn');
        if (voiceBtn && 'webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            
            let isRecording = false;
            
            voiceBtn.addEventListener('click', function() {
                if (isRecording) {
                    recognition.stop();
                    this.classList.remove('recording');
                    isRecording = false;
                } else {
                    recognition.start();
                    this.classList.add('recording');
                    isRecording = true;
                }
            });
            
            recognition.onresult = function(event) {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                
                // Add to observations editor
                const editor = document.getElementById('observationsEditor');
                if (editor) {
                    editor.innerHTML += ' ' + transcript;
                }
            };
            
            recognition.onerror = function(event) {
                console.error('Voice recognition error:', event.error);
                voiceBtn.classList.remove('recording');
                isRecording = false;
            };
        }
    }

    // ========================================
    // 12. AUTO-SAVE FUNCTIONALITY
    // ========================================
    function startAutoSave() {
        // Clear existing interval
        if (ConsultationsState.autoSaveInterval) {
            clearInterval(ConsultationsState.autoSaveInterval);
        }
        
        // Auto-save every 30 seconds
        ConsultationsState.autoSaveInterval = setInterval(() => {
            saveSessionNotes();
        }, 30000);
    }

    function saveSessionNotes() {
        if (!ConsultationsState.currentSession) return;
        
        // Gather all notes data
        const notesData = {
            consultationId: ConsultationsState.currentSession,
            diagnosis: ConsultationsState.liveNotes.diagnosis,
            observations: document.getElementById('observationsEditor')?.innerHTML || '',
            vitals: ConsultationsState.liveNotes.vitals,
            nextSteps: {
                followUp: document.querySelector('.followup-select')?.value || '',
                tests: document.querySelector('.next-steps-form textarea')?.value || '',
                referrals: document.querySelectorAll('.next-steps-form textarea')[1]?.value || ''
            },
            timestamp: new Date().toISOString()
        };
        
        // Save to local storage (in production, this would be an API call)
        localStorage.setItem(`consultation_notes_${ConsultationsState.currentSession}`, JSON.stringify(notesData));
        
        // Update save indicator
        const saveIndicator = document.querySelector('.auto-save-indicator');
        if (saveIndicator) {
            saveIndicator.innerHTML = `
                <i class="fas fa-check"></i>
                <span>Saved at ${new Date().toLocaleTimeString()}</span>
            `;
        }
        
        console.log('Session notes auto-saved:', notesData);
    }

    // ========================================
    // 13. POST-CONSULTATION SUMMARY
    // ========================================
    function openEndSessionModal(consultationId) {
        ConsultationsState.currentSession = consultationId;
        
        // Save notes first
        saveSessionNotes();
        
        // Open summary modal
        openModal('summaryModal');
        
        // Load session summary
        loadSessionSummary(consultationId);
        
        // Initialize summary actions
        initializeSummaryActions();
    }

    function loadSessionSummary(consultationId) {
        // Load saved notes
        const savedNotes = localStorage.getItem(`consultation_notes_${consultationId}`);
        if (savedNotes) {
            const notes = JSON.parse(savedNotes);
            
            // Display notes preview
            const preview = document.querySelector('.notes-preview');
            if (preview) {
                preview.innerHTML = `
                    <p><strong>Diagnosis:</strong> ${notes.diagnosis.join(', ')}</p>
                    <p><strong>Observations:</strong> ${notes.observations.substring(0, 200)}...</p>
                    <p><strong>Treatment:</strong> Continue current medication regimen...</p>
                `;
            }
        }
    }

    function initializeSummaryActions() {
        // Edit notes button
        document.querySelector('.btn-edit-notes')?.addEventListener('click', function() {
            closeModal('summaryModal');
            // Return to live documentation
        });
        
        // Confirm notes button
        document.querySelector('.btn-confirm-notes')?.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-check"></i> Notes Confirmed';
            this.disabled = true;
        });
        
        // Schedule follow-up checkbox
        const followupCheckbox = document.getElementById('scheduleFollowup');
        if (followupCheckbox) {
            followupCheckbox.addEventListener('change', function() {
                document.querySelector('.followup-details').style.display = 
                    this.checked ? 'block' : 'none';
            });
        }
        
        // Prescription button
        document.querySelector('.btn-prescription')?.addEventListener('click', function() {
            // Navigate to prescriptions page
            showNotification('Redirecting to prescriptions page...', 'info');
        });
        
        // Attachment buttons
        document.querySelectorAll('.btn-attach').forEach(btn => {
            btn.addEventListener('click', function() {
                // Open file upload dialog
                showNotification('Opening file upload...', 'info');
            });
        });
        
        // Finalize consultation button
        document.getElementById('finalizeConsultation')?.addEventListener('click', function() {
            finalizeConsultation();
        });
    }

    function finalizeConsultation() {
        if (!ConsultationsState.currentSession) return;
        
        // Get completion status
        const completionStatus = document.querySelector('input[name="completion"]:checked')?.value || 'complete';
        const completionNotes = document.querySelector('.completion-options textarea')?.value || '';
        
        // Stop session timer
        stopSessionTimer(ConsultationsState.currentSession);
        
        // Update consultation status
        updateConsultationStatus(ConsultationsState.currentSession, completionStatus === 'complete' ? 'completed' : 'incomplete');
        
        // Remove from active consultations
        ConsultationsState.activeConsultations.delete(ConsultationsState.currentSession);
        
        // Clear auto-save
        if (ConsultationsState.autoSaveInterval) {
            clearInterval(ConsultationsState.autoSaveInterval);
            ConsultationsState.autoSaveInterval = null;
        }
        
        // Hide live documentation
        document.getElementById('liveDocumentation').style.display = 'none';
        
        // Close modal
        closeModal('summaryModal');
        
        // Show success notification
        showNotification('Consultation finalized successfully', 'success');
        
        // Reload consultations
        loadConsultations();
        
        // Reset current session
        ConsultationsState.currentSession = null;
    }

    // ========================================
    // 14. MEDICAL RECORDS ACCESS
    // ========================================
    function viewPatientRecords(patientId) {
        // Open patient data modal
        openModal('patientDataModal');
        
        // Load patient data
        loadPatientData(patientId);
        
        // Initialize modal tabs
        initializeModalTabs();
    }

    function loadPatientData(patientId) {
        const patientData = DataStore.patientRecords[patientId];
        if (!patientData) return;
        
        // Update patient header
        document.querySelector('.patient-main-info h3').textContent = patientData.name;
        document.querySelector('.patient-meta').innerHTML = `
            <span>ID: ${patientId}</span>
            <span>Age: ${patientData.age} years</span>
            <span>Gender: ${patientData.gender}</span>
        `;
        
        // Load medical history
        loadMedicalHistory(patientData);
        
        // Load allergies
        loadAllergies(patientData);
        
        // Load prescriptions
        loadPrescriptions(patientData);
    }

    function initializeModalTabs() {
        document.querySelectorAll('.modal-tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Update active states
                document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.modal-tab-pane').forEach(pane => pane.classList.remove('active'));
                
                this.classList.add('active');
                document.getElementById(targetTab)?.classList.add('active');
            });
        });
    }

    function loadMedicalHistory(patientData) {
        const historyContainer = document.querySelector('.history-timeline');
        if (!historyContainer) return;
        
        let historyHTML = '';
        patientData.medicalHistory.forEach(entry => {
            historyHTML += `
                <div class="history-item">
                    <div class="history-date">${entry.date}</div>
                    <div class="history-content">
                        <h5>${entry.type}</h5>
                        <p>${entry.notes}</p>
                    </div>
                </div>
            `;
        });
        
        historyContainer.innerHTML = historyHTML;
    }

    function loadAllergies(patientData) {
        const allergyContainer = document.querySelector('.allergy-alerts');
        if (!allergyContainer) return;
        
        let allergyHTML = '';
        patientData.allergies.forEach(allergy => {
            allergyHTML += `
                <div class="allergy-item ${allergy.severity}">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${allergy.name} - ${capitalizeFirst(allergy.severity)}</span>
                </div>
            `;
        });
        
        allergyContainer.innerHTML = allergyHTML;
    }

    function loadPrescriptions(patientData) {
        // Implementation for loading prescriptions
    }

    // ========================================
    // 15. TIMERS & ALERTS
    // ========================================
    function initializeTimers() {
        // Check for upcoming consultations every minute
        setInterval(checkUpcomingConsultations, 60000);
    }

    function setupCountdownTimer() {
        const countdownElement = document.getElementById('countdownTimer');
        if (!countdownElement) return;
        
        // Find next upcoming consultation
        const upcoming = ConsultationsState.consultations.upcoming[0];
        if (!upcoming) return;
        
        const scheduledTime = getScheduledTime(upcoming.id);
        if (!scheduledTime) return;
        
        // Update countdown every second
        ConsultationsState.countdownInterval = setInterval(() => {
            const now = new Date();
            const diff = scheduledTime - now;
            
            if (diff <= 0) {
                countdownElement.textContent = '00:00';
                clearInterval(ConsultationsState.countdownInterval);
                showNotification('Consultation starting now!', 'warning');
            } else {
                const minutes = Math.floor(diff / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                countdownElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                
                // Show alerts at specific intervals
                if (minutes === 15 && seconds === 0) {
                    showNotification('Consultation starts in 15 minutes', 'info');
                } else if (minutes === 5 && seconds === 0) {
                    showNotification('Consultation starts in 5 minutes', 'warning');
                }
            }
        }, 1000);
    }

    function checkUpcomingConsultations() {
        const now = new Date();
        
        ConsultationsState.consultations.upcoming.forEach(consultation => {
            const scheduledTime = getScheduledTime(consultation.id);
            if (!scheduledTime) return;
            
            const diff = scheduledTime - now;
            const minutes = Math.floor(diff / (1000 * 60));
            
            if (minutes === 15) {
                showNotification(`${consultation.patientName} consultation in 15 minutes`, 'info');
            } else if (minutes === 5) {
                showNotification(`${consultation.patientName} consultation in 5 minutes`, 'warning');
            }
        });
    }

    function checkMissedSessions() {
        // Check for sessions that should be marked as missed
        const now = new Date();
        
        ConsultationsState.consultations.upcoming.forEach(consultation => {
            const scheduledTime = getScheduledTime(consultation.id);
            if (!scheduledTime) return;
            
            const diff = now - scheduledTime;
            const minutes = Math.floor(diff / (1000 * 60));
            
            if (minutes > 15 && !ConsultationsState.missedSessionTracker.has(consultation.id)) {
                // Mark as missed after 15 minutes
                markSessionAsMissed(consultation.id);
            }
        });
    }

    function markSessionAsMissed(consultationId) {
        updateConsultationStatus(consultationId, 'missed');
        ConsultationsState.missedSessionTracker.set(consultationId, new Date());
        
        // Show missed session notification
        const toast = document.getElementById('missedSessionToast');
        if (toast) {
            toast.style.display = 'flex';
            
            // Initialize toast actions
            toast.querySelector('.follow-up')?.addEventListener('click', function() {
                initiateFollowUp(consultationId);
                toast.style.display = 'none';
            });
            
            toast.querySelector('.reschedule')?.addEventListener('click', function() {
                rescheduleConsultation(consultationId);
                toast.style.display = 'none';
            });
            
            toast.querySelector('.toast-close')?.addEventListener('click', function() {
                toast.style.display = 'none';
            });
        }
        
        // Refresh UI
        loadConsultations();
    }

    function checkPatientWaitingStatus() {
        // Check if any patients are waiting for online consultations
        ConsultationsState.consultations.upcoming.forEach(consultation => {
            if (consultation.mode === 'online') {
                checkPatientJoined(consultation.id).then(hasJoined => {
                    if (hasJoined) {
                        ConsultationsState.patientWaitingQueue.push(consultation.id);
                        updatePatientWaitingBadge();
                    }
                });
            }
        });
    }

    function updatePatientWaitingBadge() {
        const badge = document.querySelector('.patient-waiting span');
        if (badge) {
            const count = ConsultationsState.patientWaitingQueue.length;
            badge.textContent = count === 1 ? '1 patient waiting' : `${count} patients waiting`;
            badge.parentElement.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // ========================================
    // 16. NOTIFICATIONS
    // ========================================
    function initializeNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    function showNotification(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}-toast`;
        toast.style.display = 'flex';
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${getNotificationIcon(type)}"></i>
            </div>
            <div class="toast-content">
                <p>${message}</p>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        // Position toast
        const existingToasts = document.querySelectorAll('.toast-notification');
        const topOffset = 100 + (existingToasts.length - 1) * 90;
        toast.style.top = `${topOffset}px`;
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', function() {
            toast.remove();
        });
        
        // Desktop notification for important alerts
        if (type === 'warning' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Curis Consultation Alert', {
                body: message,
                icon: '/favicon.ico'
            });
        }
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

    // ========================================
    // 17. MODAL MANAGEMENT
    // ========================================
    function initializeModals() {
        // Close buttons
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Dismiss buttons
        document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Click outside to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });
        
        // Calendar modal specific
        initializeCalendarModal();
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

    function initializeCalendarModal() {
        // Calendar navigation
        document.querySelector('.prev-month')?.addEventListener('click', navigatePrevMonth);
        document.querySelector('.next-month')?.addEventListener('click', navigateNextMonth);
        
        // Apply date range
        document.getElementById('applyDateRange')?.addEventListener('click', function() {
            const from = document.getElementById('dateFrom')?.value;
            const to = document.getElementById('dateTo')?.value;
            
            if (from && to) {
                ConsultationsState.filters.dateFrom = new Date(from);
                ConsultationsState.filters.dateTo = new Date(to);
                updateDateDisplay();
                applyFilters();
                closeModal('calendarModal');
            }
        });
    }

    function navigatePrevMonth() {
        // Implementation for previous month navigation
    }

    function navigateNextMonth() {
        // Implementation for next month navigation
    }

    // ========================================
    // 18. UTILITY FUNCTIONS
    // ========================================
    function viewConsultationNotes(consultationId) {
        // Load and display saved consultation notes
        const savedNotes = localStorage.getItem(`consultation_notes_${consultationId}`);
        if (savedNotes) {
            const notes = JSON.parse(savedNotes);
            showNotification('Loading consultation notes...', 'info');
            // In real implementation, this would open a notes viewer
            console.log('Consultation notes:', notes);
        } else {
            showNotification('No notes found for this consultation', 'warning');
        }
    }

    function initiateFollowUp(patientId) {
        // Open follow-up action modal or redirect
        showNotification('Opening follow-up options...', 'info');
    }

    function rescheduleConsultation(consultationId) {
        // Open reschedule modal
        showNotification('Opening reschedule options...', 'info');
    }

    function resumeConsultation() {
        // Resume an ongoing consultation
        showNotification('Resuming consultation session...', 'info');
    }

    function setupRealTimeUpdates() {
        // Simulate real-time updates (in production, this would be WebSocket or SSE)
        setInterval(() => {
            // Check for new consultations, status changes, etc.
            checkForUpdates();
        }, 30000); // Every 30 seconds
    }

    function checkForUpdates() {
        // Check for updates from server
        console.log('Checking for updates...');
    }

    function setupAutoSave() {
        // Set up auto-save for all forms and editors
        document.querySelectorAll('input, textarea, [contenteditable]').forEach(element => {
            element.addEventListener('input', debounce(saveSessionNotes, 5000));
        });
    }

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

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
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
            darkModeBtn.addEventListener('click', function() {
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
    // 20. ADDITIONAL STYLES FOR DYNAMIC ELEMENTS
    // ========================================
    const style = document.createElement('style');
    style.textContent = `
        .recording {
            background: #f44336 !important;
            color: white !important;
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        .info-toast {
            border-left: 4px solid #2196F3;
        }
        
        .success-toast {
            border-left: 4px solid #4CAF50;
        }
        
        .warning-toast {
            border-left: 4px solid #FFC107;
        }
        
        .error-toast {
            border-left: 4px solid #F44336;
        }
        
        @keyframes slideOutRight {
            to {
                transform: translateX(120%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

})();
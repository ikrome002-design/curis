// ========================================
// CURIS PRESCRIPTIONS PAGE - JAVASCRIPT
// Digital Medication Management System
// ========================================

// Global State Management
const PrescriptionState = {
    prescriptions: [],
    currentPrescription: {},
    selectedPatient: null,
    activeConsultation: null,
    medications: [],
    filters: {
        patient: '',
        dateFrom: null,
        dateTo: null,
        medication: '',
        status: 'all'
    },
    currentPage: 1,
    itemsPerPage: 10,
    isDarkMode: false
};

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function () {
    initializePage();
    loadPrescriptions();
    setupEventListeners();
    checkActiveConsultation();
    loadMedicationDatabase();
    initializeTooltips();
    loadRecentPatients();
});

// ========================================
// INITIALIZATION FUNCTIONS
// ========================================

function initializePage() {
    // Initialize date inputs with today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateTo').value = today;

    // Set date from 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    document.getElementById('dateFrom').value = thirtyDaysAgo.toISOString().split('T')[0];

    // Update stats
    updatePrescriptionStats();

    // Check for dark mode preference
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        document.body.classList.add('dark-mode');
        PrescriptionState.isDarkMode = true;
    }
}

function setupEventListeners() {
    // Profile Dropdown
    const userProfile = document.getElementById('userProfile');
    const profileDropdown = document.getElementById('profileDropdown');

    userProfile.addEventListener('click', function (e) {
        e.stopPropagation();
        userProfile.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!userProfile.contains(e.target) && !profileDropdown.contains(e.target)) {
            userProfile.classList.remove('active');
        }
    });

    // Dark Mode Toggle
    document.getElementById('darkModeBtn').addEventListener('click', toggleDarkMode);

    // Main Action Buttons
    document.getElementById('newPrescriptionBtn').addEventListener('click', openNewPrescriptionModal);
    document.getElementById('quickDuplicateBtn').addEventListener('click', openQuickDuplicateModal);
    document.getElementById('medicationDbBtn').addEventListener('click', openMedicationDatabase);

    // Filter Controls
    document.querySelector('.btn-filter-apply').addEventListener('click', applyFilters);

    // Filter inputs - real-time search
    document.getElementById('patientFilter').addEventListener('input', debounce(filterPrescriptions, 300));
    document.getElementById('medicationFilter').addEventListener('input', debounce(filterPrescriptions, 300));
    document.getElementById('statusFilter').addEventListener('change', filterPrescriptions);

    // Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function () {
            closeModal(this.closest('.modal'));
        });
    });

    // Modal Dismiss Buttons
    document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
        btn.addEventListener('click', function () {
            closeModal(this.closest('.modal'));
        });
    });

    // Prescription Form Elements
    setupPrescriptionFormListeners();

    // Pagination
    setupPaginationListeners();

    // Prescription Actions
    setupPrescriptionActionListeners();
}

// ========================================
// PRESCRIPTION FORM SETUP
// ========================================

function setupPrescriptionFormListeners() {
    // Patient Search
    const patientSearch = document.getElementById('patientSearch');
    patientSearch.addEventListener('input', debounce(searchPatients, 300));

    // Recent Patient Chips
    document.querySelectorAll('.patient-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            selectPatient(this.dataset.patientId);
        });
    });

    // Change Patient Button
    const changePatientBtn = document.querySelector('.change-patient-btn');
    if (changePatientBtn) {
        changePatientBtn.addEventListener('click', function () {
            document.getElementById('selectedPatientInfo').style.display = 'none';
            document.getElementById('patientSearch').value = '';
            PrescriptionState.selectedPatient = null;
        });
    }

    // Medication Search
    const medicationSelect = document.getElementById('medicationSelect');
    medicationSelect.addEventListener('input', debounce(searchMedications, 300));

    // Generic/Brand Toggle
    document.querySelector('.generic-brand-toggle').addEventListener('click', toggleGenericBrand);

    // Frequency Buttons
    document.querySelectorAll('.freq-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            selectFrequency(this);
        });
    });

    // Instruction Templates
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            addInstructionTemplate(this.dataset.template);
        });
    });

    // Ongoing Treatment Checkbox
    document.getElementById('ongoing').addEventListener('change', function () {
        const durationInput = document.getElementById('duration');
        const durationUnit = document.getElementById('durationUnit');

        if (this.checked) {
            durationInput.disabled = true;
            durationUnit.disabled = true;
            durationInput.value = '';
        } else {
            durationInput.disabled = false;
            durationUnit.disabled = false;
        }
    });

    // Preview Button
    document.querySelector('.preview-prescription-btn').addEventListener('click', previewPrescription);

    // Save Draft Button
    document.querySelector('.save-draft-btn').addEventListener('click', saveDraft);

    // Edit Prescription Button
    document.querySelector('.edit-prescription-btn').addEventListener('click', function () {
        closeModal(document.getElementById('previewModal'));
    });

    // Confirm Prescription Button
    document.querySelector('.confirm-prescription-btn').addEventListener('click', confirmPrescription);
}

// ========================================
// PATIENT MANAGEMENT
// ========================================

function searchPatients(e) {
    const searchTerm = e.target.value.toLowerCase();
    const suggestionsDiv = document.getElementById('patientSuggestions');

    if (searchTerm.length < 2) {
        suggestionsDiv.classList.remove('active');
        return;
    }

    // Simulate patient search (would be API call in production)
    const patients = [
        { id: 'PAT-2024-001', name: 'John Kamau', age: 45, gender: 'Male' },
        { id: 'PAT-2024-002', name: 'Mary Wambui', age: 32, gender: 'Female' },
        { id: 'PAT-2024-003', name: 'Peter Ochieng', age: 28, gender: 'Male' },
        { id: 'PAT-2024-004', name: 'Grace Njeri', age: 55, gender: 'Female' },
        { id: 'PAT-2024-005', name: 'James Mwangi', age: 38, gender: 'Male' }
    ];

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.id.toLowerCase().includes(searchTerm)
    );

    if (filteredPatients.length > 0) {
        suggestionsDiv.innerHTML = filteredPatients.map(patient => `
            <div class="patient-suggestion" data-patient-id="${patient.id}">
                <div class="suggestion-info">
                    <strong>${patient.name}</strong>
                    <span>${patient.id} | ${patient.age} years, ${patient.gender}</span>
                </div>
            </div>
        `).join('');

        suggestionsDiv.classList.add('active');

        // Add click listeners to suggestions
        suggestionsDiv.querySelectorAll('.patient-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', function () {
                selectPatient(this.dataset.patientId);
                suggestionsDiv.classList.remove('active');
                e.target.value = '';
            });
        });
    } else {
        suggestionsDiv.classList.remove('active');
    }
}

function selectPatient(patientId) {
    // Simulate loading patient data (would be API call in production)
    const patientData = {
        'PAT-2024-001': {
            name: 'John Kamau',
            id: 'PAT-2024-001',
            age: '45 years, Male',
            allergies: ['Penicillin', 'Latex'],
            conditions: ['Hypertension', 'Diabetes Type 2'],
            medications: ['Amlodipine 5mg', 'Metformin 500mg']
        },
        'PAT-2024-002': {
            name: 'Mary Wambui',
            id: 'PAT-2024-002',
            age: '32 years, Female',
            allergies: ['None'],
            conditions: ['Asthma'],
            medications: ['Salbutamol inhaler']
        },
        'PAT-2024-003': {
            name: 'Peter Ochieng',
            id: 'PAT-2024-003',
            age: '28 years, Male',
            allergies: ['Sulfa drugs'],
            conditions: ['None'],
            medications: ['None']
        },
        'PAT-2024-004': {
            name: 'Grace Njeri',
            id: 'PAT-2024-004',
            age: '55 years, Female',
            allergies: ['Iodine'],
            conditions: ['Arthritis', 'Hypertension'],
            medications: ['Diclofenac 50mg', 'Losartan 50mg']
        }
    };

    const patient = patientData[patientId];
    if (patient) {
        PrescriptionState.selectedPatient = patient;
        displaySelectedPatient(patient);
        checkDrugInteractions(patient);
    }
}

function displaySelectedPatient(patient) {
    const infoDiv = document.getElementById('selectedPatientInfo');

    // Update patient info
    document.getElementById('selectedPatientName').textContent = patient.name;
    document.getElementById('selectedPatientId').textContent = patient.id;
    document.getElementById('selectedPatientAge').textContent = patient.age;

    // Update allergies
    const allergySpan = infoDiv.querySelector('.allergy-alert span:last-child');
    allergySpan.textContent = patient.allergies.join(', ');

    // Update conditions
    const conditionSpan = infoDiv.querySelector('.condition-alert span:last-child');
    conditionSpan.textContent = patient.conditions.join(', ');

    // Update medications
    const medicationSpan = infoDiv.querySelector('.medication-alert span:last-child');
    medicationSpan.textContent = patient.medications.join(', ');

    infoDiv.style.display = 'block';
}

// ========================================
// MEDICATION MANAGEMENT
// ========================================

function loadMedicationDatabase() {
    // Simulate loading medication database
    PrescriptionState.medications = [
        { name: 'Amlodipine', category: 'cardiovascular', dosages: ['2.5mg', '5mg', '10mg'] },
        { name: 'Amoxicillin', category: 'antibiotics', dosages: ['250mg', '500mg', '875mg'] },
        { name: 'Metformin', category: 'diabetes', dosages: ['500mg', '850mg', '1000mg'] },
        { name: 'Paracetamol', category: 'analgesics', dosages: ['500mg', '1000mg'] },
        { name: 'Omeprazole', category: 'gastrointestinal', dosages: ['20mg', '40mg'] },
        { name: 'Salbutamol', category: 'respiratory', dosages: ['100mcg', '200mcg'] },
        { name: 'Diclofenac', category: 'analgesics', dosages: ['25mg', '50mg', '75mg'] },
        { name: 'Losartan', category: 'cardiovascular', dosages: ['25mg', '50mg', '100mg'] },
        { name: 'Ciprofloxacin', category: 'antibiotics', dosages: ['250mg', '500mg', '750mg'] },
        { name: 'Simvastatin', category: 'cardiovascular', dosages: ['10mg', '20mg', '40mg'] }
    ];
}

function searchMedications(e) {
    const searchTerm = e.target.value.toLowerCase();
    const suggestionsDiv = document.getElementById('drugSuggestions');

    if (searchTerm.length < 2) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const filteredMeds = PrescriptionState.medications.filter(med =>
        med.name.toLowerCase().includes(searchTerm)
    );

    if (filteredMeds.length > 0) {
        suggestionsDiv.innerHTML = filteredMeds.map(med => `
            <div class="drug-suggestion" data-drug="${med.name}">
                <strong>${med.name}</strong>
                <span>${med.category}</span>
                <div class="suggested-dosages">
                    ${med.dosages.map(d => `<span class="dosage-tag">${d}</span>`).join('')}
                </div>
            </div>
        `).join('');

        suggestionsDiv.style.display = 'block';

        // Add click listeners
        suggestionsDiv.querySelectorAll('.drug-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', function () {
                selectMedication(this.dataset.drug);
                suggestionsDiv.style.display = 'none';
            });
        });
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

function selectMedication(drugName) {
    document.getElementById('medicationSelect').value = drugName;

    // Show drug info panel
    const drugInfoPanel = document.getElementById('drugInfoPanel');
    drugInfoPanel.style.display = 'block';

    // Update drug info (simulated data)
    document.getElementById('activeIngredient').textContent = drugName;
    document.getElementById('standardDosage').textContent = getStandardDosage(drugName);
    document.getElementById('sideEffects').textContent = getSideEffects(drugName);
    document.getElementById('contraindications').textContent = getContraindications(drugName);

    // Check for drug interactions
    if (PrescriptionState.selectedPatient) {
        checkDrugInteractions(PrescriptionState.selectedPatient, drugName);
    }
}

function getStandardDosage(drugName) {
    const dosages = {
        'Amlodipine': '5-10mg once daily',
        'Amoxicillin': '500mg three times daily',
        'Metformin': '500mg twice daily, max 2000mg/day',
        'Paracetamol': '500-1000mg every 4-6 hours, max 4g/day',
        'Omeprazole': '20mg once daily',
        'Salbutamol': '100-200mcg as needed',
        'Diclofenac': '50mg twice or thrice daily',
        'Losartan': '50-100mg once daily',
        'Ciprofloxacin': '250-750mg twice daily',
        'Simvastatin': '20-40mg once daily at night'
    };
    return dosages[drugName] || 'Consult prescribing information';
}

function getSideEffects(drugName) {
    const sideEffects = {
        'Amlodipine': 'Dizziness, edema, fatigue',
        'Amoxicillin': 'Nausea, diarrhea, rash',
        'Metformin': 'GI upset, lactic acidosis (rare)',
        'Paracetamol': 'Rare at therapeutic doses',
        'Omeprazole': 'Headache, GI symptoms',
        'Salbutamol': 'Tremor, tachycardia',
        'Diclofenac': 'GI upset, increased CV risk',
        'Losartan': 'Dizziness, hyperkalemia',
        'Ciprofloxacin': 'GI upset, tendon issues',
        'Simvastatin': 'Muscle pain, elevated liver enzymes'
    };
    return sideEffects[drugName] || 'See package insert';
}

function getContraindications(drugName) {
    const contraindications = {
        'Amlodipine': 'Severe hypotension, shock',
        'Amoxicillin': 'Penicillin allergy',
        'Metformin': 'Severe renal impairment, metabolic acidosis',
        'Paracetamol': 'Severe liver disease',
        'Omeprazole': 'Hypersensitivity to PPIs',
        'Salbutamol': 'Tachyarrhythmias',
        'Diclofenac': 'Active GI bleeding, severe heart failure',
        'Losartan': 'Pregnancy, bilateral renal artery stenosis',
        'Ciprofloxacin': 'Concurrent tizanidine use',
        'Simvastatin': 'Active liver disease, pregnancy'
    };
    return contraindications[drugName] || 'Consult prescribing information';
}

// ========================================
// PRESCRIPTION WORKFLOW
// ========================================

function selectFrequency(btn) {
    // Remove selected class from all buttons
    document.querySelectorAll('.freq-btn').forEach(b => b.classList.remove('selected'));

    // Add selected class to clicked button
    btn.classList.add('selected');

    // Handle custom frequency
    if (btn.dataset.frequency === 'custom') {
        openCustomScheduleModal();
    }
}

function openCustomScheduleModal() {
    const modal = document.getElementById('customScheduleModal');
    modal.style.display = 'block';
}

function addInstructionTemplate(template) {
    const instructionsField = document.getElementById('instructions');
    const templates = {
        'with-food': 'Take with food to reduce stomach upset.',
        'before-meal': 'Take 30 minutes before meals.',
        'after-meal': 'Take after meals.',
        'empty-stomach': 'Take on an empty stomach, at least 1 hour before or 2 hours after meals.'
    };

    const currentValue = instructionsField.value;
    instructionsField.value = currentValue + (currentValue ? ' ' : '') + templates[template];
}

function toggleGenericBrand() {
    // Toggle between generic and brand names
    const medicationField = document.getElementById('medicationSelect');
    // In production, this would toggle between generic/brand names
    console.log('Toggling generic/brand display');
}

// ========================================
// PRESCRIPTION PREVIEW & SUBMISSION
// ========================================

function previewPrescription() {
    if (!validatePrescriptionForm()) {
        return;
    }

    // Collect form data
    const prescriptionData = collectPrescriptionData();

    // Update preview modal
    updatePreviewModal(prescriptionData);

    // Show preview modal
    openModal(document.getElementById('previewModal'));
}

function validatePrescriptionForm() {
    // Check if patient is selected
    if (!PrescriptionState.selectedPatient) {
        showAlert('Please select a patient', 'warning');
        return false;
    }

    // Check medication
    const medication = document.getElementById('medicationSelect').value;
    if (!medication) {
        showAlert('Please select a medication', 'warning');
        return false;
    }

    // Check dosage
    const strength = document.getElementById('strength').value;
    const quantity = document.getElementById('quantity').value;
    if (!strength || !quantity) {
        showAlert('Please enter dosage information', 'warning');
        return false;
    }

    // Check frequency
    const selectedFreq = document.querySelector('.freq-btn.selected');
    if (!selectedFreq) {
        showAlert('Please select frequency', 'warning');
        return false;
    }

    // Check duration (unless ongoing)
    const ongoing = document.getElementById('ongoing').checked;
    const duration = document.getElementById('duration').value;
    if (!ongoing && !duration) {
        showAlert('Please enter duration or mark as ongoing', 'warning');
        return false;
    }

    return true;
}

function collectPrescriptionData() {
    const selectedFreq = document.querySelector('.freq-btn.selected');
    const frequencyText = {
        'od': 'Once daily',
        'bd': 'Twice daily',
        'tds': 'Thrice daily',
        'qds': 'Four times daily',
        'prn': 'As needed',
        'custom': 'Custom schedule'
    };

    return {
        patient: PrescriptionState.selectedPatient,
        medication: document.getElementById('medicationSelect').value,
        strength: document.getElementById('strength').value,
        quantity: document.getElementById('quantity').value,
        unit: document.getElementById('unit').value,
        frequency: frequencyText[selectedFreq.dataset.frequency],
        duration: document.getElementById('ongoing').checked ?
            'Ongoing' :
            `${document.getElementById('duration').value} ${document.getElementById('durationUnit').value}`,
        route: document.getElementById('route').value,
        instructions: document.getElementById('instructions').value,
        appointmentLink: document.getElementById('appointmentLink').value,
        prescriber: 'Dr. Sarah Wanjiru',
        license: 'MP-12345',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
}

function updatePreviewModal(data) {
    // Update patient information
    document.getElementById('previewPatientName').textContent = data.patient.name;
    document.getElementById('previewPatientId').textContent = data.patient.id;
    document.getElementById('previewPatientAge').textContent = data.patient.age.split(',')[0];
    document.getElementById('previewPatientGender').textContent = data.patient.age.split(',')[1].trim();

    // Update medication details
    document.getElementById('previewMedication').textContent = `${data.medication} ${data.strength}`;
    document.getElementById('previewDosage').textContent = `${data.quantity} ${data.unit} ${data.frequency}`;
    document.getElementById('previewDuration').textContent = data.duration;
    document.getElementById('previewRoute').textContent = capitalizeFirst(data.route);
    document.getElementById('previewInstructions').textContent = data.instructions || 'No special instructions';

    // Generate prescription ID
    const prescriptionId = generatePrescriptionId();
    PrescriptionState.currentPrescription = { ...data, id: prescriptionId };
}

function confirmPrescription() {
    // Check for duplicates
    if (checkForDuplicates()) {
        openDuplicateWarningModal();
        return;
    }

    // Check for drug interactions
    if (checkForInteractions()) {
        openInteractionAlertModal();
        return;
    }

    // Submit prescription
    submitPrescription();
}

function submitPrescription() {
    const prescription = PrescriptionState.currentPrescription;
    prescription.status = 'active';
    prescription.timestamp = new Date().toISOString();

    // Add to prescriptions list
    PrescriptionState.prescriptions.unshift(prescription);

    // Save to localStorage (in production, this would be an API call)
    savePrescriptionsToStorage();

    // Generate PDF and QR code
    generatePrescriptionPDF(prescription);
    generateQRCode(prescription.id);

    // Send to patient portal
    syncToPatientPortal(prescription);

    // Show success message
    showAlert('Prescription issued successfully!', 'success');

    // Close modals
    closeModal(document.getElementById('previewModal'));
    closeModal(document.getElementById('prescriptionModal'));

    // Reset form
    resetPrescriptionForm();

    // Refresh prescription list
    displayPrescriptions();

    // Update stats
    updatePrescriptionStats();
}

function saveDraft() {
    const prescriptionData = collectPrescriptionData();
    prescriptionData.status = 'draft';
    prescriptionData.id = generatePrescriptionId();
    prescriptionData.timestamp = new Date().toISOString();

    PrescriptionState.prescriptions.unshift(prescriptionData);
    savePrescriptionsToStorage();

    showAlert('Draft saved successfully', 'info');
    closeModal(document.getElementById('prescriptionModal'));
    displayPrescriptions();
}

// ========================================
// PRESCRIPTION ACTIONS
// ========================================

function setupPrescriptionActionListeners() {
    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            viewPrescriptionDetails(this.dataset.prescriptionId);
        });
    });

    // Re-issue buttons
    document.querySelectorAll('.reissue-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            openReissueModal(this.dataset.prescriptionId);
        });
    });

    // Print buttons
    document.querySelectorAll('.print-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            printPrescription(this.dataset.prescriptionId);
        });
    });

    // Edit draft buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            editDraftPrescription(this.dataset.prescriptionId);
        });
    });

    // Delete draft buttons
    document.querySelectorAll('.delete-draft-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            deleteDraftPrescription(this.dataset.prescriptionId);
        });
    });
}

function viewPrescriptionDetails(prescriptionId) {
    // Load prescription details
    const prescription = getPrescriptionById(prescriptionId);

    if (prescription) {
        // Update detail modal with prescription data
        const modal = document.getElementById('prescriptionDetailModal');
        // Update modal content here...
        openModal(modal);
    }
}

function openReissueModal(prescriptionId) {
    const prescription = getPrescriptionById(prescriptionId);

    if (prescription) {
        PrescriptionState.currentPrescription = prescription;
        const modal = document.getElementById('reissueModal');

        // Pre-fill reissue form
        modal.querySelector('strong').textContent =
            `${prescription.patient?.name || 'Patient'} - ${prescription.medication} ${prescription.strength}`;

        openModal(modal);
    }
}

function printPrescription(prescriptionId) {
    const prescription = getPrescriptionById(prescriptionId);

    if (prescription) {
        // Generate print-friendly version
        window.print();
    }
}

function editDraftPrescription(prescriptionId) {
    const prescription = getPrescriptionById(prescriptionId);

    if (prescription && prescription.status === 'draft') {
        // Load draft into form
        loadPrescriptionIntoForm(prescription);
        openNewPrescriptionModal();
    }
}

function deleteDraftPrescription(prescriptionId) {
    if (confirm('Are you sure you want to delete this draft?')) {
        PrescriptionState.prescriptions = PrescriptionState.prescriptions.filter(
            p => p.id !== prescriptionId
        );
        savePrescriptionsToStorage();
        displayPrescriptions();
        showAlert('Draft deleted', 'info');
    }
}

// ========================================
// DUPLICATE & REISSUE FUNCTIONALITY
// ========================================

function openQuickDuplicateModal() {
    const modal = document.getElementById('quickDuplicateModal');

    // Load recent prescriptions
    const recentPrescriptions = PrescriptionState.prescriptions
        .filter(p => p.status === 'active')
        .slice(0, 10);

    const listContainer = modal.querySelector('.recent-prescriptions-list');
    listContainer.innerHTML = recentPrescriptions.map(prescription => `
        <div class="recent-prescription-item" data-prescription-id="${prescription.id}">
            <div class="prescription-info">
                <h5>${prescription.patient?.name || 'Unknown'} - ${prescription.medication} ${prescription.strength}</h5>
                <p>${prescription.quantity} ${prescription.unit} ${prescription.frequency} - ${prescription.duration}</p>
                <span class="prescription-date">${prescription.date}</span>
            </div>
            <button class="duplicate-btn" data-id="${prescription.id}">
                <i class="fas fa-copy"></i>
                Duplicate
            </button>
        </div>
    `).join('');

    // Add event listeners to duplicate buttons
    listContainer.querySelectorAll('.duplicate-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            duplicatePrescription(this.dataset.id);
        });
    });

    openModal(modal);
}

function duplicatePrescription(prescriptionId) {
    const prescription = getPrescriptionById(prescriptionId);

    if (prescription) {
        // Create duplicate with new ID and timestamp
        const duplicate = {
            ...prescription,
            id: generatePrescriptionId(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().toISOString()
        };

        // Load into form for review
        loadPrescriptionIntoForm(duplicate);
        closeModal(document.getElementById('quickDuplicateModal'));
        openNewPrescriptionModal();
    }
}

function loadPrescriptionIntoForm(prescription) {
    // Load patient
    if (prescription.patient) {
        PrescriptionState.selectedPatient = prescription.patient;
        displaySelectedPatient(prescription.patient);
    }

    // Load medication details
    document.getElementById('medicationSelect').value = prescription.medication || '';
    document.getElementById('strength').value = prescription.strength || '';
    document.getElementById('quantity').value = prescription.quantity || '';
    document.getElementById('unit').value = prescription.unit || 'tablets';

    // Load frequency
    const frequencyMap = {
        'Once daily': 'od',
        'Twice daily': 'bd',
        'Thrice daily': 'tds',
        'Four times daily': 'qds',
        'As needed': 'prn'
    };

    const freqCode = frequencyMap[prescription.frequency];
    if (freqCode) {
        const freqBtn = document.querySelector(`.freq-btn[data-frequency="${freqCode}"]`);
        if (freqBtn) selectFrequency(freqBtn);
    }

    // Load duration
    if (prescription.duration === 'Ongoing') {
        document.getElementById('ongoing').checked = true;
        document.getElementById('duration').disabled = true;
        document.getElementById('durationUnit').disabled = true;
    } else {
        const durationParts = prescription.duration.split(' ');
        document.getElementById('duration').value = durationParts[0] || '';
        document.getElementById('durationUnit').value = durationParts[1] || 'days';
    }

    // Load other fields
    document.getElementById('route').value = prescription.route || 'oral';
    document.getElementById('instructions').value = prescription.instructions || '';
}

// ========================================
// DRUG INTERACTION & DUPLICATE CHECKS
// ========================================

function checkDrugInteractions(patient, newMedication = null) {
    if (!patient.medications || patient.medications.length === 0) {
        return false;
    }

    // Simulate interaction checking (in production, use drug interaction API)
    const interactions = [];

    if (newMedication === 'Amlodipine' && patient.medications.includes('Simvastatin')) {
        interactions.push({
            severity: 'moderate',
            drugs: ['Amlodipine', 'Simvastatin'],
            description: 'May increase simvastatin levels. Consider dose adjustment.'
        });
    }

    if (interactions.length > 0) {
        PrescriptionState.currentInteractions = interactions;
        return true;
    }

    return false;
}

function checkForDuplicates() {
    const current = PrescriptionState.currentPrescription;

    // Check for active prescriptions with same medication for same patient
    const duplicates = PrescriptionState.prescriptions.filter(p =>
        p.status === 'active' &&
        p.patient?.id === current.patient?.id &&
        p.medication === current.medication
    );

    return duplicates.length > 0;
}

function checkForInteractions() {
    return PrescriptionState.currentInteractions &&
        PrescriptionState.currentInteractions.length > 0;
}

function openDuplicateWarningModal() {
    const modal = document.getElementById('duplicateWarningModal');
    openModal(modal);

    // Handle override
    document.querySelector('.override-duplicate-btn').addEventListener('click', function () {
        const justification = modal.querySelector('textarea').value;
        if (!justification) {
            showAlert('Please provide justification', 'warning');
            return;
        }

        PrescriptionState.currentPrescription.duplicateJustification = justification;
        closeModal(modal);
        submitPrescription();
    });
}

function openInteractionAlertModal() {
    const modal = document.getElementById('interactionAlertModal');

    // Display interactions
    const interactionsContainer = modal.querySelector('.interaction-details');
    interactionsContainer.innerHTML = PrescriptionState.currentInteractions.map(interaction => `
        <div class="interaction-item">
            <span class="severity-badge ${interaction.severity}">${interaction.severity}</span>
            <p><strong>${interaction.drugs.join(' + ')}:</strong></p>
            <p>${interaction.description}</p>
        </div>
    `).join('');

    openModal(modal);

    // Handle proceed with caution
    document.querySelector('.proceed-with-caution-btn').addEventListener('click', function () {
        PrescriptionState.currentPrescription.interactionAcknowledged = true;
        closeModal(modal);
        submitPrescription();
    });
}

// ========================================
// MEDICATION DATABASE MODAL
// ========================================

function openMedicationDatabase() {
    const modal = document.getElementById('medicationDbModal');
    displayMedicationDatabase();
    openModal(modal);

    // Setup category filters
    modal.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            filterMedicationsByCategory(this.dataset.category);

            // Update active state
            modal.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Setup search
    const searchInput = modal.querySelector('.drug-search-bar input');
    searchInput.addEventListener('input', debounce(function (e) {
        searchMedicationDatabase(e.target.value);
    }, 300));
}

function displayMedicationDatabase(filter = null) {
    const container = document.querySelector('.drug-list');
    let medications = PrescriptionState.medications;

    if (filter) {
        medications = medications.filter(med =>
            filter === 'all' || med.category === filter
        );
    }

    container.innerHTML = medications.map(med => `
        <div class="drug-item" data-drug="${med.name}">
            <h4>${med.name}</h4>
            <p class="drug-category">${med.category}</p>
            <p class="drug-description">${getDescription(med.name)}</p>
            <div class="drug-dosages">
                ${med.dosages.map(d => `<span class="dosage-option">${d}</span>`).join('')}
            </div>
        </div>
    `).join('');

    // Add click listeners
    container.querySelectorAll('.drug-item').forEach(item => {
        item.addEventListener('click', function () {
            const drugName = this.dataset.drug;
            document.getElementById('medicationSelect').value = drugName;
            selectMedication(drugName);
            closeModal(document.getElementById('medicationDbModal'));
        });
    });
}

function filterMedicationsByCategory(category) {
    displayMedicationDatabase(category);
}

function searchMedicationDatabase(searchTerm) {
    const container = document.querySelector('.drug-list');
    const medications = PrescriptionState.medications.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (medications.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">No medications found</p>';
        return;
    }

    displayMedicationDatabase();
}

function getDescription(drugName) {
    const descriptions = {
        'Amlodipine': 'Calcium channel blocker for hypertension',
        'Amoxicillin': 'Broad-spectrum antibiotic',
        'Metformin': 'Oral antidiabetic medication',
        'Paracetamol': 'Pain reliever and fever reducer',
        'Omeprazole': 'Proton pump inhibitor for acid reflux',
        'Salbutamol': 'Bronchodilator for asthma',
        'Diclofenac': 'NSAID for pain and inflammation',
        'Losartan': 'Angiotensin receptor blocker for hypertension',
        'Ciprofloxacin': 'Fluoroquinolone antibiotic',
        'Simvastatin': 'Statin for cholesterol management'
    };
    return descriptions[drugName] || 'Pharmaceutical medication';
}

// ========================================
// FILTERING & SEARCH
// ========================================

function applyFilters() {
    // Collect filter values
    PrescriptionState.filters = {
        patient: document.getElementById('patientFilter').value.toLowerCase(),
        dateFrom: document.getElementById('dateFrom').value,
        dateTo: document.getElementById('dateTo').value,
        medication: document.getElementById('medicationFilter').value.toLowerCase(),
        status: document.getElementById('statusFilter').value
    };

    filterPrescriptions();
}

function filterPrescriptions() {
    // Update filter state
    PrescriptionState.filters.patient = document.getElementById('patientFilter').value.toLowerCase();
    PrescriptionState.filters.medication = document.getElementById('medicationFilter').value.toLowerCase();
    PrescriptionState.filters.status = document.getElementById('statusFilter').value;

    // Reset to first page
    PrescriptionState.currentPage = 1;

    // Display filtered results
    displayPrescriptions();
}

function getFilteredPrescriptions() {
    let filtered = [...PrescriptionState.prescriptions];
    const filters = PrescriptionState.filters;

    // Apply patient filter
    if (filters.patient) {
        filtered = filtered.filter(p =>
            p.patient?.name?.toLowerCase().includes(filters.patient) ||
            p.patient?.id?.toLowerCase().includes(filters.patient)
        );
    }

    // Apply medication filter
    if (filters.medication) {
        filtered = filtered.filter(p =>
            p.medication?.toLowerCase().includes(filters.medication)
        );
    }

    // Apply status filter
    if (filters.status !== 'all') {
        filtered = filtered.filter(p => p.status === filters.status);
    }

    // Apply date filter
    if (filters.dateFrom) {
        filtered = filtered.filter(p => {
            const prescDate = new Date(p.timestamp);
            const fromDate = new Date(filters.dateFrom);
            return prescDate >= fromDate;
        });
    }

    if (filters.dateTo) {
        filtered = filtered.filter(p => {
            const prescDate = new Date(p.timestamp);
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59); // Include entire day
            return prescDate <= toDate;
        });
    }

    return filtered;
}

// ========================================
// DISPLAY & PAGINATION
// ========================================

function displayPrescriptions() {
    const filtered = getFilteredPrescriptions();
    const container = document.querySelector('.prescription-list');

    // Calculate pagination
    const startIndex = (PrescriptionState.currentPage - 1) * PrescriptionState.itemsPerPage;
    const endIndex = startIndex + PrescriptionState.itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    if (paginated.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-prescription" style="font-size: 3rem; margin-bottom: 10px;"></i>
                <p>No prescriptions found</p>
            </div>
        `;
        updatePaginationButtons(0);
        return;
    }

    // Generate HTML for prescriptions
    container.innerHTML = paginated.map(prescription => `
        <div class="prescription-entry" data-prescription-id="${prescription.id}">
            <div class="patient-info">
                <img src="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-40.png" 
                     alt="Patient" class="patient-photo">
                <div class="patient-details">
                    <h4 class="patient-name">${prescription.patient?.name || 'Unknown Patient'}</h4>
                    <span class="patient-id">ID: ${prescription.patient?.id || 'N/A'}</span>
                </div>
            </div>
            
            <div class="medication-info">
                <h4 class="medication-name">${prescription.medication} ${prescription.strength}</h4>
                <div class="medication-details">
                    <span class="dosage">
                        <i class="fas fa-tablets"></i>
                        ${prescription.quantity} ${prescription.unit} ${prescription.frequency}
                    </span>
                    <span class="duration">
                        <i class="fas fa-calendar-alt"></i>
                        ${prescription.duration}
                    </span>
                    <span class="route">
                        <i class="fas fa-mouth-open"></i>
                        ${capitalizeFirst(prescription.route)}
                    </span>
                </div>
            </div>
            
            <div class="prescription-meta">
                <span class="prescription-date">
                    <i class="fas fa-calendar"></i>
                    ${prescription.date}
                </span>
                <span class="prescription-id">${prescription.id}</span>
            </div>
            
            <div class="status-badge ${prescription.status}">
                <i class="fas ${getStatusIcon(prescription.status)}"></i>
                ${capitalizeFirst(prescription.status)}
            </div>
            
            <div class="prescription-actions">
                ${generateActionButtons(prescription)}
            </div>
        </div>
    `).join('');

    // Update pagination
    updatePaginationButtons(filtered.length);

    // Re-attach event listeners
    setupPrescriptionActionListeners();
}

function generateActionButtons(prescription) {
    if (prescription.status === 'draft') {
        return `
            <button class="action-btn edit-btn" data-prescription-id="${prescription.id}">
                <i class="fas fa-edit"></i>
                Edit
            </button>
            <button class="action-btn delete-draft-btn" data-prescription-id="${prescription.id}">
                <i class="fas fa-trash"></i>
                Delete
            </button>
        `;
    } else {
        return `
            <button class="action-btn view-btn" data-prescription-id="${prescription.id}">
                <i class="fas fa-eye"></i>
                View
            </button>
            <button class="action-btn reissue-btn" data-prescription-id="${prescription.id}">
                <i class="fas fa-redo"></i>
                Re-issue
            </button>
            <button class="action-btn print-btn" data-prescription-id="${prescription.id}">
                <i class="fas fa-print"></i>
                Print
            </button>
        `;
    }
}

function getStatusIcon(status) {
    const icons = {
        'active': 'fa-check-circle',
        'expired': 'fa-times-circle',
        'cancelled': 'fa-ban',
        'draft': 'fa-save'
    };
    return icons[status] || 'fa-circle';
}

function setupPaginationListeners() {
    // Previous button
    document.querySelector('.pagination-btn:first-child').addEventListener('click', function () {
        if (PrescriptionState.currentPage > 1) {
            PrescriptionState.currentPage--;
            displayPrescriptions();
        }
    });

    // Next button
    document.querySelector('.pagination-btn:last-child').addEventListener('click', function () {
        const totalPages = Math.ceil(getFilteredPrescriptions().length / PrescriptionState.itemsPerPage);
        if (PrescriptionState.currentPage < totalPages) {
            PrescriptionState.currentPage++;
            displayPrescriptions();
        }
    });

    // Page numbers
    document.querySelectorAll('.page-number').forEach((btn, index) => {
        btn.addEventListener('click', function () {
            PrescriptionState.currentPage = index + 1;
            displayPrescriptions();
        });
    });
}

function updatePaginationButtons(totalItems) {
    const totalPages = Math.ceil(totalItems / PrescriptionState.itemsPerPage);
    const currentPage = PrescriptionState.currentPage;

    // Update previous button
    const prevBtn = document.querySelector('.pagination-btn:first-child');
    prevBtn.disabled = currentPage === 1;

    // Update next button
    const nextBtn = document.querySelector('.pagination-btn:last-child');
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    // Update page numbers
    const pageNumbersContainer = document.querySelector('.page-numbers');
    pageNumbersContainer.innerHTML = '';

    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-number';
        btn.textContent = i;

        if (i === currentPage) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', function () {
            PrescriptionState.currentPage = i;
            displayPrescriptions();
        });

        pageNumbersContainer.appendChild(btn);
    }
}

// ========================================
// DATA PERSISTENCE
// ========================================

function loadPrescriptions() {
    // Load from localStorage (in production, this would be an API call)
    const stored = localStorage.getItem('prescriptions');

    if (stored) {
        PrescriptionState.prescriptions = JSON.parse(stored);
    } else {
        // Load sample data
        loadSamplePrescriptions();
    }

    displayPrescriptions();
}

function loadSamplePrescriptions() {
    PrescriptionState.prescriptions = [
        {
            id: 'RX-2025-001',
            patient: {
                name: 'John Kamau',
                id: 'PAT-2024-001',
                age: '45 years, Male',
                allergies: ['Penicillin', 'Latex'],
                conditions: ['Hypertension', 'Diabetes Type 2'],
                medications: ['Amlodipine 5mg', 'Metformin 500mg']
            },
            medication: 'Amlodipine',
            strength: '5mg',
            quantity: '1',
            unit: 'tablet',
            frequency: 'Once daily',
            duration: '30 days',
            route: 'oral',
            instructions: 'Take with or without food',
            date: 'Sept 25, 2025',
            time: '10:45 AM',
            status: 'active',
            timestamp: new Date().toISOString()
        },
        {
            id: 'RX-2025-002',
            patient: {
                name: 'Mary Wambui',
                id: 'PAT-2024-002',
                age: '32 years, Female',
                allergies: ['None'],
                conditions: ['Asthma'],
                medications: ['Salbutamol inhaler']
            },
            medication: 'Metformin',
            strength: '500mg',
            quantity: '1',
            unit: 'tablet',
            frequency: 'Twice daily',
            duration: '30 days',
            route: 'oral',
            instructions: 'Take with meals',
            date: 'Sept 24, 2025',
            time: '2:00 PM',
            status: 'active',
            timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 'RX-2025-003',
            patient: {
                name: 'Peter Ochieng',
                id: 'PAT-2024-003',
                age: '28 years, Male',
                allergies: ['Sulfa drugs'],
                conditions: ['None'],
                medications: ['None']
            },
            medication: 'Amoxicillin',
            strength: '500mg',
            quantity: '1',
            unit: 'capsule',
            frequency: 'Thrice daily',
            duration: '7 days',
            route: 'oral',
            instructions: 'Complete full course',
            date: 'Sept 10, 2025',
            time: '11:00 AM',
            status: 'expired',
            timestamp: new Date(Date.now() - 1296000000).toISOString()
        },
        {
            id: 'RX-2025-004',
            patient: {
                name: 'Grace Njeri',
                id: 'PAT-2024-004',
                age: '55 years, Female',
                allergies: ['Iodine'],
                conditions: ['Arthritis', 'Hypertension'],
                medications: ['Diclofenac 50mg', 'Losartan 50mg']
            },
            medication: 'Paracetamol',
            strength: '500mg',
            quantity: '2',
            unit: 'tablets',
            frequency: 'As needed',
            duration: 'PRN',
            route: 'oral',
            instructions: 'Maximum 8 tablets per day',
            date: 'Sept 25, 2025',
            time: '3:30 PM',
            status: 'draft',
            timestamp: new Date().toISOString()
        }
    ];
}

function savePrescriptionsToStorage() {
    localStorage.setItem('prescriptions', JSON.stringify(PrescriptionState.prescriptions));
}

function getPrescriptionById(id) {
    return PrescriptionState.prescriptions.find(p => p.id === id);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function generatePrescriptionId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RX-${year}-${random}`;
}

function generateQRCode(prescriptionId) {
    // In production, use a QR code library
    console.log('Generating QR code for:', prescriptionId);
}

function generatePrescriptionPDF(prescription) {
    // In production, use a PDF generation library
    console.log('Generating PDF for prescription:', prescription.id);
}

function syncToPatientPortal(prescription) {
    // In production, this would be an API call
    console.log('Syncing prescription to patient portal:', prescription.id);

    // Simulate notification
    setTimeout(() => {
        console.log('Patient notified via SMS/Email');
    }, 1000);
}

function checkActiveConsultation() {
    // Check if there's an active consultation
    // In production, this would check session/API
    const activeConsultation = sessionStorage.getItem('activeConsultation');

    if (activeConsultation) {
        const consultation = JSON.parse(activeConsultation);
        PrescriptionState.activeConsultation = consultation;

        // Show active consultation alert
        const alert = document.getElementById('activeConsultAlert');
        if (alert) {
            document.getElementById('activePatientName').textContent = consultation.patientName;
            alert.style.display = 'flex';
        }
    }
}

function openNewPrescriptionModal() {
    const modal = document.getElementById('prescriptionModal');

    // Check for active consultation
    if (PrescriptionState.activeConsultation) {
        document.getElementById('activeConsultAlert').style.display = 'flex';
        document.getElementById('appointmentLink').value = 'auto';

        // Pre-select patient from consultation
        selectPatient(PrescriptionState.activeConsultation.patientId);
    }

    openModal(modal);
}

function resetPrescriptionForm() {
    document.getElementById('prescriptionForm').reset();
    document.getElementById('selectedPatientInfo').style.display = 'none';
    document.getElementById('drugInfoPanel').style.display = 'none';
    document.querySelectorAll('.freq-btn').forEach(btn => btn.classList.remove('selected'));
    PrescriptionState.selectedPatient = null;
    PrescriptionState.currentPrescription = {};
}

function loadRecentPatients() {
    // Load recent patients for quick selection
    const recentPatients = [
        { id: 'PAT-2024-001', name: 'John Kamau' },
        { id: 'PAT-2024-002', name: 'Mary Wambui' },
        { id: 'PAT-2024-003', name: 'Peter Ochieng' }
    ];

    const container = document.querySelector('.recent-patient-chips');
    if (container) {
        container.innerHTML = recentPatients.map(patient => `
            <button type="button" class="patient-chip" data-patient-id="${patient.id}">
                ${patient.name}
            </button>
        `).join('');

        // Re-attach listeners
        container.querySelectorAll('.patient-chip').forEach(chip => {
            chip.addEventListener('click', function () {
                selectPatient(this.dataset.patientId);
            });
        });
    }
}

function updatePrescriptionStats() {
    // Update header stats
    const today = new Date().toDateString();
    const todayPrescriptions = PrescriptionState.prescriptions.filter(p => {
        const prescDate = new Date(p.timestamp).toDateString();
        return prescDate === today && p.status !== 'draft';
    });

    const pendingPrescriptions = PrescriptionState.prescriptions.filter(p =>
        p.status === 'draft'
    );

    // Update badges
    const statBadges = document.querySelectorAll('.stat-badge span');
    if (statBadges[0]) statBadges[0].textContent = `Today: ${todayPrescriptions.length}`;
    if (statBadges[1]) statBadges[1].textContent = `Pending: ${pendingPrescriptions.length}`;
}

function initializeTooltips() {
    // Initialize tooltips for help icons or info bubbles
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        el.setAttribute('title', el.dataset.tooltip);
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    PrescriptionState.isDarkMode = !PrescriptionState.isDarkMode;
    localStorage.setItem('darkMode', PrescriptionState.isDarkMode);

    // Update icon
    const icon = document.querySelector('#darkModeBtn i');
    icon.className = PrescriptionState.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
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

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FFC107' : '#2196F3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    alert.textContent = message;

    document.body.appendChild(alert);

    // Remove after 3 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function openModal(modal) {
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .patient-suggestion,
    .drug-suggestion {
        padding: 10px;
        cursor: pointer;
        border-bottom: 1px solid #e0e0e0;
        transition: background 0.2s;
    }
    
    .patient-suggestion:hover,
    .drug-suggestion:hover {
        background: #f5f5f5;
    }
    
    .suggestion-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .suggestion-info strong {
        color: #1D2A3B;
    }
    
    .suggestion-info span {
        font-size: 0.813rem;
        color: #666;
    }
    
    .suggested-dosages {
        display: flex;
        gap: 4px;
        margin-top: 4px;
    }
    
    .dosage-tag {
        padding: 2px 6px;
        background: #00BFA5;
        color: white;
        border-radius: 4px;
        font-size: 0.75rem;
    }
    
    .drug-suggestions,
    #drugSuggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        max-height: 300px;
        overflow-y: auto;
        z-index: 100;
        margin-top: 4px;
    }
`;
document.head.appendChild(style);

// Initialize page on load
console.log('Prescriptions page initialized successfully');
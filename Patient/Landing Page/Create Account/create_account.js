// ===== CURIS CREATE ACCOUNT - JAVASCRIPT ===== //
// Comprehensive account creation system for Curis by Citrus
// Supports both self-initiated and clinic-referred registration flows

class CurisAccountCreation {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 4;
        this.registrationType = null;
        this.formData = {};
        this.familyMembers = [];
        this.verificationTimers = {};
        this.isDarkMode = false;
        this.isHighContrast = false;
        
        this.init();
    }

    // ===== INITIALIZATION ===== //
    init() {
        this.setupEventListeners();
        this.setupValidation();
        this.setupAccessibility();
        this.loadSavedPreferences();
        this.handlePageLoad();
    }

    // ===== EVENT LISTENERS SETUP ===== //
    setupEventListeners() {
        // Account initiation type selection
        document.querySelectorAll('.initiation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.selectRegistrationType(type);
            });
        });

        // Self-registration form navigation
        this.setupSelfRegistrationListeners();
        
        // Clinic-referred form navigation
        this.setupClinicReferredListeners();
        
        // Modal handlers
        this.setupModalListeners();
        
        // Accessibility toggles
        this.setupAccessibilityListeners();
        
        // Dark mode toggle
        this.setupDarkModeToggle();
        
        // Password visibility toggles
        this.setupPasswordToggles();
        
        // Real-time validation
        this.setupRealTimeValidation();
    }

    // ===== SELF-REGISTRATION EVENT LISTENERS ===== //
    setupSelfRegistrationListeners() {
        // Step navigation buttons
        document.getElementById('next-to-security')?.addEventListener('click', () => {
            if (this.validateStep(1)) {
                this.navigateToStep(2);
            }
        });

        document.getElementById('back-to-basic')?.addEventListener('click', () => {
            this.navigateToStep(1);
        });

        document.getElementById('next-to-verification')?.addEventListener('click', () => {
            if (this.validateStep(2)) {
                this.navigateToStep(3);
            }
        });

        document.getElementById('back-to-security')?.addEventListener('click', () => {
            this.navigateToStep(2);
        });

        document.getElementById('next-to-legal')?.addEventListener('click', () => {
            if (this.validateStep(3)) {
                this.navigateToStep(4);
            }
        });

        document.getElementById('back-to-verification')?.addEventListener('click', () => {
            this.navigateToStep(3);
        });

        // Date of birth change handler
        document.getElementById('dob')?.addEventListener('change', (e) => {
            this.handleDateOfBirthChange(e.target.value);
        });

        // Family member toggle
        document.getElementById('addFamilyMembers')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.openFamilyMemberModal();
            }
        });

        // Verification buttons
        this.setupVerificationListeners();

        // Form submission
        document.getElementById('self-registration-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });
    }

    // ===== CLINIC-REFERRED EVENT LISTENERS ===== //
    setupClinicReferredListeners() {
        // OTP verification
        document.getElementById('verify-clinic-otp')?.addEventListener('click', () => {
            this.verifyClinicOTP();
        });

        document.getElementById('resend-clinic-otp')?.addEventListener('click', () => {
            this.resendClinicOTP();
        });

        // Account details
        document.getElementById('edit-account-details')?.addEventListener('click', () => {
            this.openEditDetailsModal();
        });

        document.getElementById('confirm-details')?.addEventListener('click', () => {
            this.confirmAccountDetails();
        });

        // Security step
        document.getElementById('continue-to-clinic-verification')?.addEventListener('click', () => {
            if (this.validateClinicSecurity()) {
                this.navigateToClinicStep('clinic-verification-step');
            }
        });

        // Verification step
        document.getElementById('send-clinic-phone-otp')?.addEventListener('click', () => {
            this.sendClinicPhoneOTP();
        });

        document.getElementById('verify-clinic-phone-otp')?.addEventListener('click', () => {
            this.verifyClinicPhoneOTP();
        });

        document.getElementById('send-clinic-email-code')?.addEventListener('click', () => {
            this.sendClinicEmailCode();
        });

        document.getElementById('verify-clinic-email-code')?.addEventListener('click', () => {
            this.verifyClinicEmailCode();
        });

        document.getElementById('proceed-to-clinic-legal')?.addEventListener('click', () => {
            if (this.validateClinicVerification()) {
                this.navigateToClinicStep('clinic-legal-step');
            }
        });

        // Legal step
        document.getElementById('complete-activation')?.addEventListener('click', () => {
            this.completeAccountActivation();
        });

        // Navigation buttons
        document.getElementById('back-to-details')?.addEventListener('click', () => {
            this.navigateToClinicStep('clinic-details-step');
        });

        document.getElementById('back-to-clinic-security')?.addEventListener('click', () => {
            this.navigateToClinicStep('clinic-security-step');
        });

        document.getElementById('back-to-clinic-verification')?.addEventListener('click', () => {
            this.navigateToClinicStep('clinic-verification-step');
        });
    }

    // ===== REGISTRATION TYPE SELECTION ===== //
    selectRegistrationType(type) {
        this.registrationType = type;
        
        // Hide initiation selection
        document.getElementById('initiation-selection').classList.add('hidden');
        
        if (type === 'self') {
            // Show self-registration flow
            document.getElementById('self-registration').classList.remove('hidden');
            this.currentStep = 1;
            this.updateStepIndicators();
        } else if (type === 'clinic') {
            // Show clinic-referred flow
            document.getElementById('clinic-registration').classList.remove('hidden');
            this.showClinicStep('clinic-otp-step');
        }
        
        // Smooth scroll to the form
        setTimeout(() => {
            document.querySelector('.form-container').scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        }, 300);
    }

    // ===== STEP NAVIGATION FOR SELF-REGISTRATION ===== //
    navigateToStep(step) {
        const currentStepElement = document.querySelector(`.form-step.active`);
        const targetStepElement = document.getElementById(this.getStepElementId(step));
        
        if (!targetStepElement) return;
        
        // Hide current step
        currentStepElement.classList.remove('active');
        currentStepElement.classList.add('hidden');
        
        // Show target step
        targetStepElement.classList.remove('hidden');
        targetStepElement.classList.add('active');
        
        this.currentStep = step;
        this.updateStepIndicators();
        
        // Smooth scroll to form
        targetStepElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    getStepElementId(step) {
        const stepMap = {
            1: 'basic-info-step',
            2: 'security-step',
            3: 'verification-step',
            4: 'legal-step'
        };
        return stepMap[step];
    }

    updateStepIndicators() {
        const indicators = document.querySelectorAll('.step');
        indicators.forEach((indicator, index) => {
            const stepNumber = index + 1;
            indicator.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentStep) {
                indicator.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                indicator.classList.add('active');
            }
        });
        
        // Update progress bar
        const progressWidth = ((this.currentStep - 1) / (this.maxSteps - 1)) * 100;
        document.documentElement.style.setProperty('--progress-width', `${progressWidth}%`);
    }

    // ===== DATE OF BIRTH HANDLING ===== //
    handleDateOfBirthChange(dateStr) {
        if (!dateStr) return;
        
        const birthDate = new Date(dateStr);
        const today = new Date();
        const age = this.calculateAge(birthDate, today);
        
        // Display age info
        const ageInfo = document.getElementById('age-info');
        if (ageInfo) {
            ageInfo.textContent = `Age: ${age} years old`;
        }
        
        // Handle age-specific logic
        this.handleAgeSpecificLogic(age);
        
        // Store calculated age
        this.formData.age = age;
    }

    calculateAge(birthDate, today) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    handleAgeSpecificLogic(age) {
        const familySection = document.getElementById('family-section');
        const guardianSection = document.getElementById('guardian-section');
        
        // Reset all sections
        familySection.classList.add('hidden');
        guardianSection.classList.add('hidden');
        
        if (age < 13) {
            // Under 13 - block registration
            this.showUnder13Modal();
        } else if (age >= 13 && age < 18) {
            // Teen (13-17) - show guardian awareness
            guardianSection.classList.remove('hidden');
        } else {
            // Adult (18+) - show family member option
            familySection.classList.remove('hidden');
        }
    }

    showUnder13Modal() {
        const modal = document.getElementById('under-13-modal');
        if (modal) {
            this.showModal(modal);
            
            // Setup under 13 specific buttons
            document.getElementById('send-parent-link')?.addEventListener('click', () => {
                this.sendParentLink();
            });
            
            document.getElementById('contact-clinic')?.addEventListener('click', () => {
                this.contactClinic();
            });
        }
    }

    // ===== FAMILY MEMBER MANAGEMENT ===== //
    openFamilyMemberModal() {
        const modal = document.getElementById('family-member-modal');
        if (modal) {
            this.resetFamilyMemberModal();
            this.showModal(modal);
            this.addFamilyMemberForm();
            
            // Setup family member modal buttons
            document.getElementById('add-another-family-member')?.addEventListener('click', () => {
                this.addFamilyMemberForm();
            });
            
            document.getElementById('save-family-members')?.addEventListener('click', () => {
                this.saveFamilyMembers();
            });
            
            document.getElementById('cancel-family-members')?.addEventListener('click', () => {
                this.closeFamilyMemberModal();
            });
        }
    }

    addFamilyMemberForm() {
        const container = document.getElementById('family-members-container');
        const memberIndex = container.children.length;
        
        const memberForm = document.createElement('div');
        memberForm.className = 'family-member-form';
        memberForm.dataset.index = memberIndex;
        
        memberForm.innerHTML = `
            <h4>Family Member ${memberIndex + 1}</h4>
            <div class="form-field">
                <label for="family-name-${memberIndex}">Full Name <span class="required">*</span></label>
                <input type="text" id="family-name-${memberIndex}" name="family-name-${memberIndex}" required>
                <div class="error-message" id="family-name-${memberIndex}-error"></div>
            </div>
            <div class="form-field">
                <label for="family-dob-${memberIndex}">Date of Birth <span class="required">*</span></label>
                <input type="date" id="family-dob-${memberIndex}" name="family-dob-${memberIndex}" required>
                <div class="error-message" id="family-dob-${memberIndex}-error"></div>
            </div>
            <div class="form-field">
                <label for="family-gender-${memberIndex}">Gender <span class="required">*</span></label>
                <select id="family-gender-${memberIndex}" name="family-gender-${memberIndex}" required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                <div class="error-message" id="family-gender-${memberIndex}-error"></div>
            </div>
            <div class="form-field">
                <label for="family-relationship-${memberIndex}">Relationship <span class="required">*</span></label>
                <select id="family-relationship-${memberIndex}" name="family-relationship-${memberIndex}" required>
                    <option value="">Select Relationship</option>
                    <option value="child">Child</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                </select>
                <div class="error-message" id="family-relationship-${memberIndex}-error"></div>
            </div>
            <button type="button" class="remove-family-member link-button" onclick="curisAccount.removeFamilyMember(${memberIndex})">
                Remove Member
            </button>
            <hr>
        `;
        
        container.appendChild(memberForm);
    }

    removeFamilyMember(index) {
        const memberForm = document.querySelector(`[data-index="${index}"]`);
        if (memberForm) {
            memberForm.remove();
            this.reindexFamilyMembers();
        }
    }

    reindexFamilyMembers() {
        const forms = document.querySelectorAll('.family-member-form');
        forms.forEach((form, index) => {
            form.dataset.index = index;
            const title = form.querySelector('h4');
            title.textContent = `Family Member ${index + 1}`;
            
            // Update input IDs and names
            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => {
                const baseName = input.name.split('-').slice(0, -1).join('-');
                input.name = `${baseName}-${index}`;
                input.id = `${baseName}-${index}`;
                
                const label = form.querySelector(`label[for="${input.id}"]`);
                if (label) {
                    label.setAttribute('for', input.id);
                }
            });
            
            // Update remove button
            const removeBtn = form.querySelector('.remove-family-member');
            removeBtn.setAttribute('onclick', `curisAccount.removeFamilyMember(${index})`);
        });
    }

    saveFamilyMembers() {
        const forms = document.querySelectorAll('.family-member-form');
        this.familyMembers = [];
        let isValid = true;
        
        forms.forEach((form, index) => {
            const member = {
                name: document.getElementById(`family-name-${index}`).value,
                dob: document.getElementById(`family-dob-${index}`).value,
                gender: document.getElementById(`family-gender-${index}`).value,
                relationship: document.getElementById(`family-relationship-${index}`).value
            };
            
            // Validate each member
            if (!member.name || !member.dob || !member.gender || !member.relationship) {
                isValid = false;
                this.showError(`family-member-${index}`, 'All fields are required');
            } else {
                this.familyMembers.push(member);
            }
        });
        
        if (isValid && this.familyMembers.length > 0) {
            this.hideModal(document.getElementById('family-member-modal'));
            this.showSuccess('Family members added successfully');
        }
    }

    closeFamilyMemberModal() {
        // Uncheck the toggle if no family members were saved
        if (this.familyMembers.length === 0) {
            document.getElementById('addFamilyMembers').checked = false;
        }
        this.hideModal(document.getElementById('family-member-modal'));
    }

    resetFamilyMemberModal() {
        const container = document.getElementById('family-members-container');
        container.innerHTML = '';
    }

    // ===== PASSWORD MANAGEMENT ===== //
    setupPasswordToggles() {
        window.togglePassword = (inputId) => {
            const input = document.getElementById(inputId);
            const toggle = input.nextElementSibling;
            const icon = toggle.querySelector('.eye-icon');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.add('visible');
            } else {
                input.type = 'password';
                icon.classList.remove('visible');
            }
        };
    }

    checkPasswordStrength(password, indicatorId, textId) {
        const indicator = document.getElementById(indicatorId);
        const text = document.getElementById(textId);
        
        if (!indicator || !text) return;
        
        let strength = 0;
        let strengthText = '';
        
        // Check various criteria
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Update indicator
        indicator.className = 'strength-indicator';
        
        if (strength <= 2) {
            indicator.classList.add('weak');
            strengthText = 'Weak';
        } else if (strength <= 3) {
            indicator.classList.add('medium');
            strengthText = 'Medium';
        } else {
            indicator.classList.add('strong');
            strengthText = 'Strong';
        }
        
        text.textContent = `Password Strength: ${strengthText}`;
    }

    // ===== VERIFICATION SYSTEM ===== //
    setupVerificationListeners() {
        // Phone verification - Self registration
        document.getElementById('send-phone-otp')?.addEventListener('click', () => {
            this.sendPhoneOTP();
        });

        document.getElementById('verify-phone-otp')?.addEventListener('click', () => {
            this.verifyPhoneOTP();
        });

        document.getElementById('resend-phone-otp')?.addEventListener('click', () => {
            this.resendPhoneOTP();
        });

        // Email verification - Self registration
        document.getElementById('send-email-code')?.addEventListener('click', () => {
            this.sendEmailCode();
        });

        document.getElementById('verify-email-code')?.addEventListener('click', () => {
            this.verifyEmailCode();
        });

        document.getElementById('skip-email-verification')?.addEventListener('click', () => {
            this.skipEmailVerification();
        });

        document.getElementById('resend-email-code')?.addEventListener('click', () => {
            this.resendEmailCode();
        });
    }

    sendPhoneOTP() {
        const phoneNumber = document.getElementById('phoneNumber').value;
        const phoneDisplay = document.getElementById('phone-display');
        
        if (!phoneNumber || !this.validatePhoneNumber(phoneNumber)) {
            this.showError('phoneNumber-error', 'Please enter a valid phone number');
            return;
        }
        
        // Display masked phone number
        phoneDisplay.textContent = this.maskPhoneNumber(phoneNumber);
        
        // Show OTP container
        document.getElementById('phone-otp-container').classList.remove('hidden');
        
        // Disable send button
        document.getElementById('send-phone-otp').disabled = true;
        
        // Start countdown timer
        this.startTimer('phone-timer', 'resend-phone-otp', 60);
        
        // Update status
        document.getElementById('phone-otp-status').innerHTML = 
            '<span class="success">✓ Verification code sent successfully</span>';
        
        // Simulate API call
        this.simulatePhoneOTPSend(phoneNumber);
    }

    verifyPhoneOTP() {
        const otp = document.getElementById('phoneOTP').value;
        
        if (!otp || otp.length !== 6) {
            this.showError('phoneOTP-error', 'Please enter a valid 6-digit code');
            return;
        }
        
        // Simulate verification
        this.simulatePhoneOTPVerification(otp);
    }

    sendEmailCode() {
        const email = document.getElementById('email').value;
        
        if (!email || !this.validateEmail(email)) {
            this.showError('email-error', 'Please enter a valid email address');
            return;
        }
        
        // Show email code container
        document.getElementById('email-code-container').classList.remove('hidden');
        
        // Disable send button
        document.getElementById('send-email-code').disabled = true;
        
        // Start countdown timer
        this.startTimer('email-timer', 'resend-email-code', 60);
        
        // Update status
        document.getElementById('email-verification-status').innerHTML = 
            '<span class="success">✓ Verification code sent to your email</span>';
        
        // Simulate API call
        this.simulateEmailCodeSend(email);
    }

    verifyEmailCode() {
        const code = document.getElementById('emailCode').value;
        
        if (!code || code.length !== 6) {
            this.showError('emailCode-error', 'Please enter a valid 6-digit code');
            return;
        }
        
        // Simulate verification
        this.simulateEmailCodeVerification(code);
    }

    skipEmailVerification() {
        // Mark email verification as skipped
        this.formData.emailVerified = false;
        document.getElementById('email-verification-status').innerHTML = 
            '<span class="muted-text">Email verification skipped</span>';
        
        // Enable navigation to next step
        document.getElementById('next-to-legal').disabled = false;
    }

    startTimer(timerId, buttonId, duration) {
        let timeLeft = duration;
        const timerElement = document.getElementById(timerId);
        const buttonElement = document.getElementById(buttonId);
        
        if (!timerElement || !buttonElement) return;
        
        buttonElement.classList.add('hidden');
        
        const timerId_interval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            timerElement.textContent = `Resend available in ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            timeLeft--;
            
            if (timeLeft < 0) {
                clearInterval(timerId_interval);
                timerElement.textContent = '';
                buttonElement.classList.remove('hidden');
            }
        }, 1000);
        
        // Store interval ID for potential cleanup
        this.verificationTimers[timerId] = timerId_interval;
    }

    // ===== CLINIC REFERRED METHODS ===== //
    showClinicStep(stepId) {
        // Hide all clinic steps
        document.querySelectorAll('.clinic-step').forEach(step => {
            step.classList.remove('active');
            step.classList.add('hidden');
        });
        
        // Show target step
        const targetStep = document.getElementById(stepId);
        if (targetStep) {
            targetStep.classList.remove('hidden');
            targetStep.classList.add('active');
            
            // Smooth scroll
            targetStep.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    navigateToClinicStep(stepId) {
        this.showClinicStep(stepId);
    }

    verifyClinicOTP() {
        const otp = document.getElementById('clinicOTP').value;
        
        if (!otp || otp.length !== 6) {
            this.showError('clinicOTP-error', 'Please enter a valid 6-digit code');
            return;
        }
        
        // Simulate OTP verification
        this.simulateClinicOTPVerification(otp);
    }

    resendClinicOTP() {
        // Simulate resending OTP
        this.startTimer('clinic-otp-timer', 'resend-clinic-otp', 60);
        this.showSuccess('Verification code resent successfully');
    }

    openEditDetailsModal() {
        const modal = document.getElementById('edit-details-modal');
        if (modal) {
            this.populateEditDetailsModal();
            this.showModal(modal);
            
            // Setup save button
            document.getElementById('save-changes')?.addEventListener('click', () => {
                this.saveAccountChanges();
            });
            
            document.getElementById('cancel-edit')?.addEventListener('click', () => {
                this.hideModal(modal);
            });
        }
    }

    populateEditDetailsModal() {
        // Populate with existing data (from clinic)
        document.getElementById('editFullName').value = 'John Doe'; // Example data
        document.getElementById('editDOB').value = '1990-01-01';
        document.getElementById('editGender').value = 'male';
        document.getElementById('editPhone').value = '+1234567890';
        document.getElementById('editEmail').value = 'john.doe@example.com';
    }

    saveAccountChanges() {
        // Validate changes
        const formData = {
            name: document.getElementById('editFullName').value,
            dob: document.getElementById('editDOB').value,
            gender: document.getElementById('editGender').value,
            phone: document.getElementById('editPhone').value,
            email: document.getElementById('editEmail').value
        };
        
        // Perform validation
        if (this.validateEditDetails(formData)) {
            // Update display
            this.updateAccountDetailsDisplay(formData);
            
            // Close modal
            this.hideModal(document.getElementById('edit-details-modal'));
            
            this.showSuccess('Account details updated successfully');
        }
    }

    updateAccountDetailsDisplay(data) {
        document.getElementById('display-patient-name').textContent = data.name;
        document.getElementById('display-patient-dob').textContent = data.dob;
        document.getElementById('display-patient-gender').textContent = data.gender;
        document.getElementById('display-patient-phone').textContent = data.phone;
        document.getElementById('display-patient-email').textContent = data.email;
    }

    confirmAccountDetails() {
        // Proceed to security step
        this.navigateToClinicStep('clinic-security-step');
    }

    sendClinicPhoneOTP() {
        const phoneNumber = document.getElementById('clinic-phone-display').textContent;
        
        // Show phone OTP container
        document.getElementById('clinic-phone-container').classList.remove('hidden');
        
        // Disable send button
        document.getElementById('send-clinic-phone-otp').disabled = true;
        
        // Start timer
        this.startTimer('clinic-phone-timer', 'resend-clinic-phone-otp', 60);
        
        // Update status
        document.getElementById('clinic-phone-status').innerHTML = 
            '<span class="success">✓ Verification code sent successfully</span>';
    }

    verifyClinicPhoneOTP() {
        const otp = document.getElementById('clinicPhoneOTP').value;
        
        if (!otp || otp.length !== 6) {
            this.showError('clinicPhoneOTP-error', 'Please enter a valid 6-digit code');
            return;
        }
        
        // Simulate verification
        setTimeout(() => {
            document.getElementById('clinic-phone-status').innerHTML = 
                '<span class="success">✓ Phone number verified successfully</span>';
            
            document.getElementById('verify-clinic-phone-otp').disabled = true;
            document.getElementById('verify-clinic-phone-otp').classList.add('success');
            
            this.formData.clinicPhoneVerified = true;
            this.checkClinicVerificationComplete();
        }, 1000);
    }

    sendClinicEmailCode() {
        const email = document.getElementById('clinic-email-display').textContent;
        
        // Show email code container
        document.getElementById('clinic-email-container').classList.remove('hidden');
        
        // Disable send button
        document.getElementById('send-clinic-email-code').disabled = true;
        
        // Start timer
        this.startTimer('clinic-email-timer', 'resend-clinic-email-code', 60);
        
        // Update status
        document.getElementById('clinic-email-status').innerHTML = 
            '<span class="success">✓ Verification code sent to your email</span>';
    }

    verifyClinicEmailCode() {
        const code = document.getElementById('clinicEmailCode').value;
        
        if (!code || code.length !== 6) {
            this.showError('clinicEmailCode-error', 'Please enter a valid 6-digit code');
            return;
        }
        
        // Simulate verification
        setTimeout(() => {
            document.getElementById('clinic-email-status').innerHTML = 
                '<span class="success">✓ Email address verified successfully</span>';
            
            document.getElementById('verify-clinic-email-code').disabled = true;
            document.getElementById('verify-clinic-email-code').classList.add('success');
            
            this.formData.clinicEmailVerified = true;
            this.checkClinicVerificationComplete();
        }, 1000);
    }

    checkClinicVerificationComplete() {
        if (this.formData.clinicPhoneVerified && this.formData.clinicEmailVerified) {
            document.getElementById('proceed-to-clinic-legal').disabled = false;
        }
    }

    completeAccountActivation() {
        // Validate legal agreements
        const termsChecked = document.getElementById('clinicTermsCheckbox').checked;
        const privacyChecked = document.getElementById('clinicPrivacyCheckbox').checked;
        const dataChecked = document.getElementById('clinicDataPolicyCheckbox').checked;
        
        if (!termsChecked || !privacyChecked || !dataChecked) {
            this.showError('clinic-legal-error', 'Please accept all legal agreements to continue');
            return;
        }
        
        // Show loading
        document.getElementById('clinic-loading-indicator').classList.remove('hidden');
        
        // Simulate account activation
        setTimeout(() => {
            document.getElementById('clinic-loading-indicator').classList.add('hidden');
            document.getElementById('clinic-success-message').classList.remove('hidden');
            
            // Setup continue button
            document.getElementById('continue-to-clinic-dashboard')?.addEventListener('click', () => {
                this.redirectToDashboard();
            });
        }, 2000);
    }

    // ===== VALIDATION METHODS ===== //
    setupRealTimeValidation() {
        // Email validation
        document.getElementById('email')?.addEventListener('input', (e) => {
            this.validateEmailRealTime(e.target.value);
        });

        // Phone validation
        document.getElementById('phoneNumber')?.addEventListener('input', (e) => {
            this.validatePhoneRealTime(e.target.value);
        });

        // Password strength
        document.getElementById('password')?.addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value, 'password-strength-indicator', 'password-strength-text');
            this.checkPasswordMatch();
        });

        document.getElementById('confirmPassword')?.addEventListener('input', () => {
            this.checkPasswordMatch();
        });

        // Clinic password strength
        document.getElementById('clinicPassword')?.addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value, 'clinic-password-strength-indicator', 'clinic-password-strength-text');
            this.checkClinicPasswordMatch();
        });

        document.getElementById('clinicConfirmPassword')?.addEventListener('input', () => {
            this.checkClinicPasswordMatch();
        });
    }

    validateEmailRealTime(email) {
        const indicator = document.getElementById('email-validation');
        const errorElement = document.getElementById('email-error');
        
        if (!email) {
            indicator.className = 'validation-indicator';
            errorElement.textContent = '';
            return;
        }
        
        if (this.validateEmail(email)) {
            indicator.className = 'validation-indicator valid';
            errorElement.textContent = '';
        } else {
            indicator.className = 'validation-indicator invalid';
            errorElement.textContent = 'Please enter a valid email address';
        }
    }

    validatePhoneRealTime(phone) {
        const indicator = document.getElementById('phone-validation');
        const errorElement = document.getElementById('phoneNumber-error');
        
        if (!phone) {
            indicator.className = 'validation-indicator';
            errorElement.textContent = '';
            return;
        }
        
        if (this.validatePhoneNumber(phone)) {
            indicator.className = 'validation-indicator valid';
            errorElement.textContent = '';
        } else {
            indicator.className = 'validation-indicator invalid';
            errorElement.textContent = 'Please enter a valid phone number';
        }
    }

    checkPasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const indicator = document.getElementById('password-match-validation');
        
        if (!confirmPassword) {
            indicator.className = 'validation-indicator';
            return;
        }
        
        if (password === confirmPassword) {
            indicator.className = 'validation-indicator valid';
        } else {
            indicator.className = 'validation-indicator invalid';
        }
    }

    checkClinicPasswordMatch() {
        const password = document.getElementById('clinicPassword').value;
        const confirmPassword = document.getElementById('clinicConfirmPassword').value;
        const indicator = document.getElementById('clinic-password-match-validation');
        
        if (!confirmPassword) {
            indicator.className = 'validation-indicator';
            return;
        }
        
        if (password === confirmPassword) {
            indicator.className = 'validation-indicator valid';
        } else {
            indicator.className = 'validation-indicator invalid';
        }
    }

    validateStep(step) {
        let isValid = true;
        
        if (step === 1) {
            // Basic information validation
            isValid = this.validateBasicInfo();
        } else if (step === 2) {
            // Security validation
            isValid = this.validateSecurity();
        } else if (step === 3) {
            // Verification validation
            isValid = this.validateVerification();
        } else if (step === 4) {
            // Legal validation
            isValid = this.validateLegal();
        }
        
        return isValid;
    }

    validateBasicInfo() {
        let isValid = true;
        
        // Full name validation
        const fullName = document.getElementById('fullName').value;
        if (!fullName || fullName.length < 2) {
            this.showError('fullName-error', 'Please enter your full name');
            isValid = false;
        } else {
            this.clearError('fullName-error');
        }
        
        // Date of birth validation
        const dob = document.getElementById('dob').value;
        if (!dob) {
            this.showError('dob-error', 'Please select your date of birth');
            isValid = false;
        } else {
            const age = this.calculateAge(new Date(dob), new Date());
            if (age < 13) {
                this.showError('dob-error', 'Account creation is not available for individuals under 13');
                isValid = false;
            } else {
                this.clearError('dob-error');
            }
        }
        
        // Gender validation
        const gender = document.getElementById('gender').value;
        if (!gender) {
            this.showError('gender-error', 'Please select your gender');
            isValid = false;
        } else {
            this.clearError('gender-error');
        }
        
        // Phone validation
        const phone = document.getElementById('phoneNumber').value;
        if (!phone || !this.validatePhoneNumber(phone)) {
            this.showError('phoneNumber-error', 'Please enter a valid phone number');
            isValid = false;
        } else {
            this.clearError('phoneNumber-error');
        }
        
        // Email validation
        const email = document.getElementById('email').value;
        if (!email || !this.validateEmail(email)) {
            this.showError('email-error', 'Please enter a valid email address');
            isValid = false;
        } else {
            this.clearError('email-error');
        }
        
        // Guardian awareness for teens
        const age = this.formData.age || 0;
        if (age >= 13 && age < 18) {
            const guardianAware = document.getElementById('guardianAware').checked;
            if (!guardianAware) {
                this.showError('guardianAware-error', 'Guardian awareness confirmation is required');
                isValid = false;
            } else {
                this.clearError('guardianAware-error');
            }
        }
        
        return isValid;
    }

    validateSecurity() {
        let isValid = true;
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Password validation
        if (!password || password.length < 8) {
            this.showError('password-error', 'Password must be at least 8 characters long');
            isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
            this.showError('password-error', 'Password must contain uppercase, lowercase, and numbers');
            isValid = false;
        } else {
            this.clearError('password-error');
        }
        
        // Confirm password validation
        if (!confirmPassword) {
            this.showError('confirmPassword-error', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            this.showError('confirmPassword-error', 'Passwords do not match');
            isValid = false;
        } else {
            this.clearError('confirmPassword-error');
        }
        
        return isValid;
    }

    validateVerification() {
        // Phone verification is required
        if (!this.formData.phoneVerified) {
            this.showError('verification-error', 'Phone number verification is required');
            return false;
        }
        
        return true;
    }

    validateLegal() {
        let isValid = true;
        
        const terms = document.getElementById('termsCheckbox').checked;
        const privacy = document.getElementById('privacyCheckbox').checked;
        const dataPolicy = document.getElementById('dataPolicyCheckbox').checked;
        
        if (!terms) {
            this.showError('termsCheckbox-error', 'You must accept the Terms & Conditions');
            isValid = false;
        } else {
            this.clearError('termsCheckbox-error');
        }
        
        if (!privacy) {
            this.showError('privacyCheckbox-error', 'You must accept the Privacy Policy');
            isValid = false;
        } else {
            this.clearError('privacyCheckbox-error');
        }
        
        if (!dataPolicy) {
            this.showError('dataPolicyCheckbox-error', 'You must accept the Data Policy');
            isValid = false;
        } else {
            this.clearError('dataPolicyCheckbox-error');
        }
        
        return isValid;
    }

    validateClinicSecurity() {
        let isValid = true;
        
        const password = document.getElementById('clinicPassword').value;
        const confirmPassword = document.getElementById('clinicConfirmPassword').value;
        
        if (!password || password.length < 8) {
            this.showError('clinicPassword-error', 'Password must be at least 8 characters long');
            isValid = false;
        } else {
            this.clearError('clinicPassword-error');
        }
        
        if (!confirmPassword || password !== confirmPassword) {
            this.showError('clinicConfirmPassword-error', 'Passwords do not match');
            isValid = false;
        } else {
            this.clearError('clinicConfirmPassword-error');
        }
        
        return isValid;
    }

    validateClinicVerification() {
        return this.formData.clinicPhoneVerified && this.formData.clinicEmailVerified;
    }

    validateEditDetails(data) {
        let isValid = true;
        
        if (!data.name || data.name.length < 2) {
            this.showError('editFullName-error', 'Please enter a valid name');
            isValid = false;
        }
        
        if (!data.dob) {
            this.showError('editDOB-error', 'Please select a date of birth');
            isValid = false;
        }
        
        if (!data.gender) {
            this.showError('editGender-error', 'Please select a gender');
            isValid = false;
        }
        
        if (!data.phone || !this.validatePhoneNumber(data.phone)) {
            this.showError('editPhone-error', 'Please enter a valid phone number');
            isValid = false;
        }
        
        if (!data.email || !this.validateEmail(data.email)) {
            this.showError('editEmail-error', 'Please enter a valid email address');
            isValid = false;
        }
        
        return isValid;
    }

    // ===== UTILITY VALIDATION FUNCTIONS ===== //
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhoneNumber(phone) {
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');
        // Check if it's a valid length (10-15 digits)
        return cleaned.length >= 10 && cleaned.length <= 15;
    }

    maskPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const masked = cleaned.slice(0, -4).replace(/\d/g, '*') + cleaned.slice(-4);
        return masked;
    }

    // ===== ERROR HANDLING ===== //
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.color = 'var(--danger-color)';
            
            // Add shake animation to the parent field
            const field = errorElement.closest('.form-field');
            if (field) {
                field.classList.add('error-shake');
                setTimeout(() => field.classList.remove('error-shake'), 600);
            }
        }
    }

    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    showSuccess(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✓</span>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius-md);
            box-shadow: var(--shadow-medium);
            z-index: 2000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => successDiv.remove(), 300);
        }, 3000);
    }

    // ===== MODAL MANAGEMENT ===== //
    setupModalListeners() {
        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });
        
        // Modal overlay clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });
        
        // Modal link buttons
        document.querySelectorAll('.modal-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modal;
                const modal = document.getElementById(modalId);
                if (modal) {
                    this.showModal(modal);
                    this.loadModalContent(modalId);
                }
            });
        });
    }

    showModal(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const firstInput = modal.querySelector('input, button, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }

    hideModal(modal) {
        modal.classList.remove('show');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    loadModalContent(modalId) {
        const modalBody = document.querySelector(`#${modalId} .modal-body`);
        
        // Simulate loading content based on modal type
        switch (modalId) {
            case 'terms-modal':
                modalBody.innerHTML = this.getTermsContent();
                break;
            case 'privacy-modal':
                modalBody.innerHTML = this.getPrivacyContent();
                break;
            case 'data-policy-modal':
                modalBody.innerHTML = this.getDataPolicyContent();
                break;
        }
    }

    // ===== ACCESSIBILITY FEATURES ===== //
    setupAccessibilityListeners() {
        document.getElementById('high-contrast-toggle')?.addEventListener('click', () => {
            this.toggleHighContrast();
        });
        
        document.getElementById('screen-reader-toggle')?.addEventListener('click', () => {
            this.toggleScreenReaderMode();
        });
    }

    setupAccessibility() {
        // Keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.hideModal(openModal);
                }
            }
        });
        
        // Focus management
        this.setupFocusManagement();
    }

    setupFocusManagement() {
        // Trap focus within modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal.show');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });
    }

    trapFocus(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    toggleHighContrast() {
        this.isHighContrast = !this.isHighContrast;
        document.body.classList.toggle('high-contrast', this.isHighContrast);
        
        // Store preference
        localStorage.setItem('curis-high-contrast', this.isHighContrast);
        
        // Update button state
        const button = document.getElementById('high-contrast-toggle');
        button.setAttribute('aria-pressed', this.isHighContrast);
        button.innerHTML = this.isHighContrast ? 
            '<i class="fas fa-adjust" style="color: var(--accent-color);"></i>' : 
            '<i class="fas fa-adjust"></i>';
    }

    toggleScreenReaderMode() {
        // Add screen reader specific announcements
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = 'Screen reader mode toggled';
        
        document.body.appendChild(announcement);
        
        setTimeout(() => announcement.remove(), 1000);
    }

    // ===== DARK MODE ===== //
    setupDarkModeToggle() {
        document.getElementById('dark-mode-toggle')?.addEventListener('click', () => {
            this.toggleDarkMode();
        });
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        
        // Update button icon
        const button = document.getElementById('dark-mode-toggle');
        const icon = button.querySelector('i');
        icon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        
        // Store preference
        localStorage.setItem('curis-dark-mode', this.isDarkMode);
    }

    loadSavedPreferences() {
        // Load dark mode preference
        const savedDarkMode = localStorage.getItem('curis-dark-mode');
        if (savedDarkMode === 'true') {
            this.isDarkMode = true;
            document.body.classList.add('dark-mode');
            const button = document.getElementById('dark-mode-toggle');
            if (button) {
                const icon = button.querySelector('i');
                icon.className = 'fas fa-sun';
            }
        }
        
        // Load high contrast preference
        const savedHighContrast = localStorage.getItem('curis-high-contrast');
        if (savedHighContrast === 'true') {
            this.isHighContrast = true;
            document.body.classList.add('high-contrast');
            const button = document.getElementById('high-contrast-toggle');
            if (button) {
                button.setAttribute('aria-pressed', 'true');
                button.innerHTML = '<i class="fas fa-adjust" style="color: var(--accent-color);"></i>';
            }
        }
    }

    // ===== SIMULATION METHODS ===== //
    simulatePhoneOTPSend(phoneNumber) {
        // Simulate API delay
        setTimeout(() => {
            console.log(`OTP sent to ${phoneNumber}`);
        }, 1000);
    }

    simulatePhoneOTPVerification(otp) {
        // Simulate verification delay
        setTimeout(() => {
            // For demo purposes, accept any 6-digit code
            if (otp.length === 6) {
                this.formData.phoneVerified = true;
                
                document.getElementById('phone-otp-status').innerHTML = 
                    '<span class="success">✓ Phone number verified successfully</span>';
                
                document.getElementById('verify-phone-otp').disabled = true;
                document.getElementById('verify-phone-otp').classList.add('success');
                
                // Enable next step
                document.getElementById('next-to-legal').disabled = false;
                
                this.clearError('phoneOTP-error');
            } else {
                this.showError('phoneOTP-error', 'Invalid verification code');
            }
        }, 1000);
    }

    simulateEmailCodeSend(email) {
        setTimeout(() => {
            console.log(`Email verification code sent to ${email}`);
        }, 1000);
    }

    simulateEmailCodeVerification(code) {
        setTimeout(() => {
            if (code.length === 6) {
                this.formData.emailVerified = true;
                
                document.getElementById('email-verification-status').innerHTML = 
                    '<span class="success">✓ Email address verified successfully</span>';
                
                document.getElementById('verify-email-code').disabled = true;
                document.getElementById('verify-email-code').classList.add('success');
                
                this.clearError('emailCode-error');
            } else {
                this.showError('emailCode-error', 'Invalid verification code');
            }
        }, 1000);
    }

    simulateClinicOTPVerification(otp) {
        setTimeout(() => {
            if (otp.length === 6) {
                // Populate clinic data
                document.getElementById('display-clinic-name').textContent = 'Nairobi Medical Center';
                document.getElementById('display-staff-name').textContent = 'Dr. Jane Smith';
                document.getElementById('display-creation-time').textContent = new Date().toLocaleDateString();
                
                document.getElementById('display-patient-name').textContent = 'John Doe';
                document.getElementById('display-patient-dob').textContent = '1990-01-01';
                document.getElementById('display-patient-gender').textContent = 'Male';
                document.getElementById('display-patient-phone').textContent = '+254700123456';
                document.getElementById('display-patient-email').textContent = 'john.doe@example.com';
                
                // Show account details step
                this.navigateToClinicStep('clinic-details-step');
                
                this.clearError('clinicOTP-error');
            } else {
                this.showError('clinicOTP-error', 'Invalid verification code');
            }
        }, 1000);
    }

    // ===== FORM SUBMISSION ===== //
    handleFormSubmission() {
        if (!this.validateStep(4)) {
            return;
        }
        
        // Collect all form data
        this.collectFormData();
        
        // Show loading
        document.getElementById('loading-indicator').classList.remove('hidden');
        
        // Simulate account creation
        setTimeout(() => {
            document.getElementById('loading-indicator').classList.add('hidden');
            document.getElementById('success-message').classList.remove('hidden');
            
            // Setup continue button
            document.getElementById('continue-to-dashboard')?.addEventListener('click', () => {
                this.redirectToDashboard();
            });
        }, 3000);
    }

    collectFormData() {
        this.formData = {
            ...this.formData,
            fullName: document.getElementById('fullName').value,
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            termsAccepted: document.getElementById('termsCheckbox').checked,
            privacyAccepted: document.getElementById('privacyCheckbox').checked,
            dataPolicyAccepted: document.getElementById('dataPolicyCheckbox').checked,
            marketingConsent: document.getElementById('marketingConsent').checked,
            familyMembers: this.familyMembers
        };
        
        // Store in localStorage for demo purposes
        localStorage.setItem('curis-account-data', JSON.stringify(this.formData));
    }

    // ===== REDIRECT TO DASHBOARD ===== //
    redirectToDashboard() {
        // Redirect to the dashboard
        window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Patient\\Dashboard\\dashboard.html';
    }

    // ===== UTILITY METHODS ===== //
    resendPhoneOTP() {
        this.sendPhoneOTP();
    }

    resendEmailCode() {
        this.sendEmailCode();
    }

    sendParentLink() {
        const email = prompt('Enter parent/guardian email address:');
        if (email && this.validateEmail(email)) {
            // Simulate sending email
            setTimeout(() => {
                document.getElementById('parent-link-sent').classList.remove('hidden');
                document.getElementById('send-parent-link').disabled = true;
                this.showSuccess('Parent link sent successfully');
            }, 1000);
        }
    }

    contactClinic() {
        // Redirect to clinic contact page or show contact info
        this.showModal(document.getElementById('error-modal'));
        document.getElementById('error-message-text').textContent = 
            'Please contact your healthcare provider for assistance with account creation.';
    }

    // ===== CONTENT METHODS ===== //
    getTermsContent() {
        return `
            <h3>Terms & Conditions</h3>
            <p>Welcome to Curis Health Platform. By using our services, you agree to the following terms and conditions:</p>
            
            <h4>1. Acceptance of Terms</h4>
            <p>By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
            
            <h4>2. Use of Platform</h4>
            <p>The platform is intended for healthcare management purposes. You agree to use it responsibly and in accordance with applicable laws.</p>
            
            <h4>3. Privacy and Data Protection</h4>
            <p>We are committed to protecting your privacy and personal health information in accordance with applicable privacy laws.</p>
            
            <h4>4. User Responsibilities</h4>
            <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device.</p>
            
            <h4>5. Limitation of Liability</h4>
            <p>The platform is provided "as is" without any warranties. We shall not be liable for any indirect, incidental, or consequential damages.</p>
            
            <p class="text-muted mt-3">Last updated: January 2025</p>
        `;
    }

    getPrivacyContent() {
        return `
            <h3>Privacy Policy</h3>
            <p>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
            
            <h4>1. Information We Collect</h4>
            <p>We collect information you provide directly to us, such as when you create an account, make appointments, or communicate with healthcare providers.</p>
            
            <h4>2. How We Use Your Information</h4>
            <p>We use your information to provide healthcare services, communicate with you, and improve our platform.</p>
            
            <h4>3. Information Sharing</h4>
            <p>We do not sell your personal information. We may share information with healthcare providers involved in your care.</p>
            
            <h4>4. Data Security</h4>
            <p>We implement appropriate technical and organizational measures to protect your personal information.</p>
            
            <h4>5. Your Rights</h4>
            <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>
            
            <p class="text-muted mt-3">Last updated: January 2025</p>
        `;
    }

    getDataPolicyContent() {
        return `
            <h3>Data Policy</h3>
            <p>This policy explains how we handle your health data and comply with healthcare regulations.</p>
            
            <h4>1. Health Data Protection</h4>
            <p>We comply with HIPAA and other applicable healthcare privacy regulations to protect your health information.</p>
            
            <h4>2. Data Storage</h4>
            <p>Your data is stored securely using industry-standard encryption and security measures.</p>
            
            <h4>3. Data Access</h4>
            <p>Only authorized healthcare providers and staff have access to your health information as necessary for your care.</p>
            
            <h4>4. Data Retention</h4>
            <p>We retain your health data as required by law and for as long as necessary to provide healthcare services.</p>
            
            <h4>5. Data Rights</h4>
            <p>You have the right to access your health records, request corrections, and receive a copy of your data.</p>
            
            <p class="text-muted mt-3">Last updated: January 2025</p>
        `;
    }

    // ===== PAGE LOAD HANDLING ===== //
    handlePageLoad() {
        // Add any initialization that should happen when the page loads
        console.log('Curis Account Creation System Initialized');
        
        // Check if user is returning from a session
        const savedData = localStorage.getItem('curis-account-partial');
        if (savedData) {
            // Could restore partial form data here
            console.log('Found partial account data');
        }
    }
}

// ===== GLOBAL INITIALIZATION ===== //
let curisAccount;

document.addEventListener('DOMContentLoaded', () => {
    curisAccount = new CurisAccountCreation();
});

// ===== CSS ANIMATIONS (Added via JavaScript) ===== //
const style = document.createElement('style');
style.textContent = `
    .success-toast {
        animation: slideInRight 0.3s ease !important;
    }
    
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
    
    .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        margin: -1px !important;
        padding: 0 !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        border: 0 !important;
    }
    
    .high-contrast {
        filter: contrast(150%) brightness(120%);
    }
    
    .high-contrast .form-container,
    .high-contrast .sales-copy,
    .high-contrast .modal-content {
        border: 2px solid var(--primary-color);
    }
    
    .high-contrast .step.active {
        box-shadow: 0 0 0 3px var(--accent-color);
    }
    
    /* Loading states */
    .loading-indicator .spinner {
        animation: spin 1s linear infinite !important;
    }
    
    @media (prefers-reduced-motion: reduce) {
        .loading-indicator .spinner {
            animation: none !important;
        }
        
        .loading-indicator::after {
            content: 'Loading...';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
`;

document.head.appendChild(style);

// ===== EXPORT FOR TESTING ===== //
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurisAccountCreation;
}
/**
 * Curis Get Started Page JavaScript
 * 
 * This script manages all functionality for the Curis by Citrus "Get Started" page:
 * - Tab switching between Create Account and Login
 * - Form validation (email, phone, password requirements)
 * - Account creation flow with email verification, sales code validation, and policy agreement
 * - Login flow with credential validation and user type detection
 * - Forgot password flow with email verification and password reset
 * - Dark mode toggle with preference persistence
 * - Responsive UI enhancements and accessibility features
 */

document.addEventListener('DOMContentLoaded', function () {
    // ----- DOM ELEMENT REFERENCES -----
    // Tab navigation elements
    const createAccountTab = document.getElementById('createAccountTab');
    const loginTab = document.getElementById('loginTab');
    const createAccountPanel = document.getElementById('createAccountPanel');
    const loginPanel = document.getElementById('loginPanel');
    const switchToLogin = document.getElementById('switchToLogin');
    const switchToCreateAccount = document.getElementById('switchToCreateAccount');

    // Create Account form elements
    const createAccountForm = document.getElementById('createAccountForm');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const salesCodeInput = document.getElementById('salesCode');
    const requestCodeLink = document.getElementById('requestCodeLink');
    const resetFormBtn = document.getElementById('resetFormBtn');
    const emailFeedback = document.getElementById('emailFeedback');
    const phoneFeedback = document.getElementById('phoneFeedback');

    // Password validation elements
    const lengthCheck = document.getElementById('length-check');
    const uppercaseCheck = document.getElementById('uppercase-check');
    const numberCheck = document.getElementById('number-check');
    const specialCheck = document.getElementById('special-check');

    // Login form elements
    const loginForm = document.getElementById('loginForm');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');

    // Other UI elements
    const passwordToggles = document.querySelectorAll('.password-toggle');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Dashboard redirect path
    const dashboardPath = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Clinic Owner\\Dashboard\\dashboard.html';

    // ----- INITIALIZATION -----
    initializeDarkMode();
    loadSavedUserData();
    attachEventListeners();

    // ----- EVENT BINDING -----

    /**
     * Attaches all event listeners for the page
     */
    function attachEventListeners() {
        // Tab switching events
        createAccountTab.addEventListener('click', () => switchTabs('createAccount'));
        loginTab.addEventListener('click', () => switchTabs('login'));
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchTabs('login');
        });
        switchToCreateAccount.addEventListener('click', (e) => {
            e.preventDefault();
            switchTabs('createAccount');
        });

        // Password visibility toggles
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', togglePasswordVisibility);
        });

        // Form validation events
        emailInput.addEventListener('input', () => {
            if (emailInput.value.trim()) validateEmail(emailInput.value);
        });

        emailInput.addEventListener('blur', () => {
            validateEmail(emailInput.value);
        });

        phoneInput.addEventListener('input', () => {
            if (phoneInput.value.trim()) validatePhone(phoneInput.value);
        });

        phoneInput.addEventListener('blur', () => {
            validatePhone(phoneInput.value);
        });

        passwordInput.addEventListener('input', () => {
            validatePassword(passwordInput.value);
        });

        // Form actions
        resetFormBtn.addEventListener('click', resetCreateAccountForm);
        requestCodeLink.addEventListener('click', (e) => {
            e.preventDefault();
            requestSalesPersonnelCode();
        });

        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            initiatePasswordReset();
        });

        // Form submissions
        createAccountForm.addEventListener('submit', handleCreateAccountSubmit);
        loginForm.addEventListener('submit', handleLoginSubmit);

        // Dark mode toggle
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // ----- TAB SWITCHING FUNCTIONALITY -----

    /**
     * Switches between Create Account and Login tabs
     * @param {string} tab - The tab to switch to ('createAccount' or 'login')
     */
    function switchTabs(tab) {
        if (tab === 'createAccount') {
            createAccountTab.classList.add('active');
            loginTab.classList.remove('active');
            createAccountPanel.classList.add('active');
            loginPanel.classList.remove('active');
        } else if (tab === 'login') {
            loginTab.classList.add('active');
            createAccountTab.classList.remove('active');
            loginPanel.classList.add('active');
            createAccountPanel.classList.remove('active');
        }
    }

    // ----- FORM VALIDATION FUNCTIONS -----

    /**
     * Validates email format
     * @param {string} email - Email to validate
     * @returns {boolean} Whether the email is valid
     */
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);

        if (!email) {
            setInputFeedback(emailInput, emailFeedback, 'Email is required', false);
            return false;
        } else if (!isValid) {
            setInputFeedback(emailInput, emailFeedback, 'Please enter a valid email address', false);
            return false;
        } else {
            setInputFeedback(emailInput, emailFeedback, 'Email looks good!', true);
            return true;
        }
    }

    /**
     * Validates phone number format (Kenyan format)
     * @param {string} phone - Phone number to validate
     * @returns {boolean} Whether the phone number is valid
     */
    function validatePhone(phone) {
        // Basic Kenya phone number validation (starts with 07, 01, or +254 and has 9-12 digits)
        const phoneRegex = /^(\+254|0)[17]\d{8,9}$/;
        const isValid = phoneRegex.test(phone);

        if (!phone) {
            setInputFeedback(phoneInput, phoneFeedback, 'Phone number is required', false);
            return false;
        } else if (!isValid) {
            setInputFeedback(phoneInput, phoneFeedback, 'Please enter a valid Kenya phone number', false);
            return false;
        } else {
            setInputFeedback(phoneInput, phoneFeedback, 'Phone number looks good!', true);
            return true;
        }
    }

    /**
     * Validates password strength
     * @param {string} password - Password to validate
     * @returns {boolean} Whether password meets all requirements
     */
    function validatePassword(password) {
        const lengthValid = password.length >= 8;
        const uppercaseValid = /[A-Z]/.test(password);
        const numberValid = /[0-9]/.test(password);
        const specialValid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        // Update UI for each requirement
        updateRequirementUI(lengthCheck, lengthValid);
        updateRequirementUI(uppercaseCheck, uppercaseValid);
        updateRequirementUI(numberCheck, numberValid);
        updateRequirementUI(specialCheck, specialValid);

        return lengthValid && uppercaseValid && numberValid && specialValid;
    }

    /**
     * Updates the UI for a password requirement check
     * @param {Element} element - The list item element to update
     * @param {boolean} isValid - Whether the requirement is met
     */
    function updateRequirementUI(element, isValid) {
        const icon = element.querySelector('i');

        if (isValid) {
            element.classList.add('valid');
            element.classList.remove('invalid');
            icon.classList.remove('fa-circle');
            icon.classList.add('fa-check-circle');
        } else {
            element.classList.add('invalid');
            element.classList.remove('valid');
            icon.classList.remove('fa-check-circle');
            icon.classList.add('fa-times-circle');
        }
    }

    /**
     * Sets feedback message for form inputs
     * @param {Element} inputElement - The input element
     * @param {Element} feedbackElement - The feedback element
     * @param {string} message - The feedback message
     * @param {boolean} isValid - Whether the input is valid
     */
    function setInputFeedback(inputElement, feedbackElement, message, isValid) {
        const formGroup = inputElement.closest('.form-group');

        formGroup.classList.remove('success', 'error');
        formGroup.classList.add(isValid ? 'success' : 'error');

        feedbackElement.textContent = message;
        feedbackElement.classList.remove('success', 'error');
        feedbackElement.classList.add(isValid ? 'success' : 'error');
    }

    /**
     * Validates the Create Account form
     * @returns {boolean} Whether all form fields are valid
     */
    function validateCreateAccountForm() {
        const emailValid = validateEmail(emailInput.value);
        const phoneValid = validatePhone(phoneInput.value);
        const passwordValid = validatePassword(passwordInput.value);

        return emailValid && phoneValid && passwordValid;
    }

    /**
     * Validates the Login form
     * @returns {boolean} Whether all required fields are filled
     */
    function validateLoginForm() {
        let isValid = true;

        if (!loginEmailInput.value.trim()) {
            showNotification('Please enter your email address', 'error');
            isValid = false;
        }

        if (!loginPasswordInput.value.trim()) {
            showNotification('Please enter your password', 'error');
            isValid = false;
        }

        return isValid;
    }

    // ----- PASSWORD VISIBILITY TOGGLE -----

    /**
     * Toggles password field visibility between text and password
     */
    function togglePasswordVisibility() {
        const passwordField = this.parentElement.querySelector('input');
        const icon = this.querySelector('i');

        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    // ----- FORM RESET FUNCTIONALITY -----

    /**
     * Resets the Create Account form to its initial state
     */
    function resetCreateAccountForm() {
        createAccountForm.reset();

        // Reset password requirements
        [lengthCheck, uppercaseCheck, numberCheck, specialCheck].forEach(check => {
            const icon = check.querySelector('i');
            check.classList.remove('valid', 'invalid');
            icon.classList.remove('fa-check-circle', 'fa-times-circle');
            icon.classList.add('fa-circle');
        });

        // Clear feedback messages
        const feedbackElements = document.querySelectorAll('.input-feedback');
        feedbackElements.forEach(element => {
            element.textContent = '';
            element.classList.remove('success', 'error');
        });

        // Remove success/error classes from form groups
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('success', 'error');
        });
    }

    // ----- CREATE ACCOUNT FLOW -----

    /**
     * Handles the Create Account form submission
     * @param {Event} e - The form submit event
     */
    function handleCreateAccountSubmit(e) {
        e.preventDefault();

        if (!validateCreateAccountForm()) {
            showNotification('Please correct the errors in the form', 'error');
            return;
        }

        // Form data is valid, proceed to email verification
        const formData = {
            email: emailInput.value,
            phone: phoneInput.value,
            password: passwordInput.value,
            salesCode: salesCodeInput.value
        };

        // Show loading state
        showLoadingState(createAccountForm);

        // Simulate server verification delay
        setTimeout(() => {
            hideLoadingState(createAccountForm);
            simulateEmailVerification(formData);
        }, 1500);
    }

    /**
     * Simulates the email verification step
     * @param {Object} formData - Account form data
     */
    function simulateEmailVerification(formData) {
        showModal({
            title: 'Verify Your Email',
            content: `
                <div style="text-align: center;">
                    <i class="fas fa-envelope-open-text" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 1rem;"></i>
                    <p>We've sent a verification link to <strong>${formData.email}</strong></p>
                    <p>Please check your inbox and click the link to continue.</p>
                </div>
            `,
            buttons: [
                {
                    text: 'Resend Email',
                    action: () => {
                        showNotification('Verification email resent successfully', 'success');
                    }
                },
                {
                    text: 'Simulate Email Verification',
                    primary: true,
                    action: () => {
                        // Proceed to sales personnel code confirmation
                        checkSalesPersonnelCode(formData);
                    }
                }
            ]
        });
    }

    /**
     * Checks the sales personnel code
     * @param {Object} formData - Account form data
     */
    function checkSalesPersonnelCode(formData) {
        showLoadingOverlay('Checking sales personnel code...');

        // Simulate verification delay
        setTimeout(() => {
            hideLoadingOverlay();

            if (formData.salesCode) {
                // Sales code was provided - show validation
                showModal({
                    title: 'Sales Personnel Code',
                    content: `
                        <div style="text-align: center;">
                            <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-color); margin-bottom: 1rem;"></i>
                            <p>Sales Code <strong>${formData.salesCode}</strong> has been verified.</p>
                            <p>You're now connected to your Curis sales representative.</p>
                        </div>
                    `,
                    buttons: [
                        {
                            text: 'Back to Edit Details',
                            action: () => {
                                // Return to form
                            }
                        },
                        {
                            text: 'Confirm & Proceed',
                            primary: true,
                            action: () => {
                                // Proceed to policy agreement
                                showPolicyAgreement(formData);
                            }
                        }
                    ]
                });
            } else {
                // No sales code provided - show error message
                showModal({
                    title: 'No Sales Personnel Code',
                    content: `
                        <div style="text-align: center;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--warning-color); margin-bottom: 1rem;"></i>
                            <p>We couldn't find a sales personnel code associated with your account.</p>
                            <p>A code is required to complete your registration.</p>
                        </div>
                    `,
                    buttons: [
                        {
                            text: 'Back to Edit Details',
                            action: () => {
                                // Return to form
                            }
                        },
                        {
                            text: 'Request a Code',
                            primary: true,
                            action: () => {
                                requestSalesPersonnelCode();
                            }
                        }
                    ]
                });
            }
        }, 1500);
    }

    /**
     * Handles the request for a sales personnel code
     */
    function requestSalesPersonnelCode() {
        // Check if email and phone are valid before requesting
        if (!validateEmail(emailInput.value) || !validatePhone(phoneInput.value)) {
            showNotification('Please provide valid email and phone information first', 'error');
            return;
        }

        showModal({
            title: 'Request Sales Personnel Code',
            content: `
                <div>
                    <p>Our team will contact you with your sales personnel code. Please verify your contact information:</p>
                    <ul style="list-style-type: none; margin: 1rem 0;">
                        <li><strong>Email:</strong> ${emailInput.value}</li>
                        <li><strong>Phone:</strong> ${phoneInput.value}</li>
                    </ul>
                    <p>How would you like to be contacted?</p>
                </div>
            `,
            buttons: [
                {
                    text: 'Cancel',
                    action: () => {
                        // Just close modal
                    }
                },
                {
                    text: 'Email Only',
                    action: () => {
                        showLoadingOverlay('Submitting request...');

                        // Simulate request processing
                        setTimeout(() => {
                            hideLoadingOverlay();
                            showNotification('Request sent! Check your email for your code.', 'success');
                        }, 1000);
                    }
                },
                {
                    text: 'Email & Phone',
                    primary: true,
                    action: () => {
                        showLoadingOverlay('Submitting request...');

                        // Simulate request processing
                        setTimeout(() => {
                            hideLoadingOverlay();
                            showNotification('Request sent! You will be contacted shortly.', 'success');
                        }, 1000);
                    }
                }
            ]
        });
    }

    /**
     * Shows the policy agreement screen
     * @param {Object} formData - Account form data
     */
    function showPolicyAgreement(formData) {
        showModal({
            title: 'Policy Agreement',
            content: `
                <div>
                    <p>Before finalizing your account, please review and agree to our policies:</p>
                    <div style="margin: 1rem 0; display: flex; flex-direction: column; gap: 0.5rem;">
                        <div style="padding: 0.5rem; background-color: var(--bg-light); border-radius: 0.25rem;">
                            <a href="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Clinic Owner\\Landing Page\\Footer\\Data Policy\\data_policy.html" target="_blank">
                                <i class="fas fa-database"></i> Data Policy
                            </a>
                        </div>
                        <div style="padding: 0.5rem; background-color: var(--bg-light); border-radius: 0.25rem;">
                            <a href="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Clinic Owner\\Landing Page\\Footer\\Privacy Policy\\privacy_policy.html" target="_blank">
                                <i class="fas fa-shield-alt"></i> Privacy Policy
                            </a>
                        </div>
                        <div style="padding: 0.5rem; background-color: var(--bg-light); border-radius: 0.25rem;">
                            <a href="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Clinic Owner\\Landing Page\\Footer\\Terms and Conditions\\terms_and_conditions.html" target="_blank">
                                <i class="fas fa-file-contract"></i> Terms & Conditions
                            </a>
                        </div>
                    </div>
                    <div style="margin-top: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" id="policyAgreement">
                            <span>I have read and agree to all Curis policies by Citrus Labs Limited</span>
                        </label>
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: 'Decline & Cancel',
                    action: () => {
                        showNotification('Account creation cancelled', 'error');
                    }
                },
                {
                    text: 'Agree & Complete Registration',
                    primary: true,
                    action: () => {
                        const agreementCheckbox = document.getElementById('policyAgreement');

                        if (!agreementCheckbox.checked) {
                            showNotification('You must agree to the policies to continue', 'error');
                            return false; // Prevent modal from closing
                        }

                        // Complete account creation
                        finalizeAccountCreation(formData);
                    }
                }
            ]
        });
    }

    /**
     * Finalizes account creation and redirects to dashboard
     * @param {Object} formData - Account form data
     */
    function finalizeAccountCreation(formData) {
        showLoadingOverlay('Creating your account...');

        // Simulate account creation
        setTimeout(() => {
            hideLoadingOverlay();

            showModal({
                title: 'Account Created Successfully!',
                content: `
                    <div style="text-align: center;">
                        <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-color); margin-bottom: 1rem;"></i>
                        <h3>Welcome to Curis!</h3>
                        <p>Your clinic owner account has been created successfully.</p>
                        <p>You will be redirected to your dashboard in a moment.</p>
                    </div>
                `,
                buttons: []
            });

            // Save email to localStorage for persistence if needed
            if (formData.email) {
                localStorage.setItem('curisEmail', formData.email);
            }

            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = dashboardPath;
            }, 3000);
        }, 2000);
    }

    // ----- LOGIN FLOW -----

    /**
     * Loads saved user data from localStorage (if any)
     */
    function loadSavedUserData() {
        const savedEmail = localStorage.getItem('curisEmail');

        if (savedEmail && loginEmailInput) {
            loginEmailInput.value = savedEmail;
            if (rememberMeCheckbox) {
                rememberMeCheckbox.checked = true;
            }
        }
    }

    /**
     * Handles the Login form submission
     * @param {Event} e - The form submit event
     */
    function handleLoginSubmit(e) {
        e.preventDefault();

        if (!validateLoginForm()) {
            return; // Form validation failed
        }

        const loginData = {
            email: loginEmailInput.value,
            password: loginPasswordInput.value,
            remember: rememberMeCheckbox.checked
        };

        // Show loading state
        showLoadingState(loginForm);

        // Simulate authentication
        setTimeout(() => {
            hideLoadingState(loginForm);

            // Simulate server authentication - we'll assume valid credentials for demo
            // In a real app, this would be validated server-side

            // Save email if remember me is checked
            if (loginData.remember) {
                localStorage.setItem('curisEmail', loginData.email);
            } else {
                localStorage.removeItem('curisEmail');
            }

            // Check user type: For demo, we'll assume admin for specific email, staff for others
            const isAdmin = loginData.email.includes('admin') || loginData.email.includes('owner');

            if (isAdmin) {
                showNotification('Welcome back, Administrator!', 'success');
            } else {
                showNotification('Welcome back, Staff Member!', 'success');
            }

            // Redirect to dashboard after notification
            setTimeout(() => {
                window.location.href = dashboardPath;
            }, 1500);
        }, 2000);
    }

    // ----- FORGOT PASSWORD FLOW -----

    /**
     * Initiates the password reset flow
     */
    function initiatePasswordReset() {
        showModal({
            title: 'Reset Your Password',
            content: `
                <div>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                    <div style="margin-top: 1rem;">
                        <input type="email" id="resetEmail" placeholder="your.email@example.com" 
                            style="width: 100%; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--light-gray);">
                        <div id="resetEmailError" style="color: var(--error-color); margin-top: 0.5rem; min-height: 1.2rem;"></div>
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: 'Cancel',
                    action: () => {
                        // Just close modal
                    }
                },
                {
                    text: 'Send Reset Link',
                    primary: true,
                    action: () => {
                        const resetEmail = document.getElementById('resetEmail').value;
                        const errorElement = document.getElementById('resetEmailError');

                        // Validate email
                        if (!resetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
                            errorElement.textContent = 'Please enter a valid email address';
                            return false; // Keep modal open
                        }

                        // Proceed with reset
                        simulateResetLinkSent(resetEmail);
                    }
                }
            ]
        });
    }

    /**
     * Simulates sending a password reset link
     * @param {string} email - The user's email address
     */
    function simulateResetLinkSent(email) {
        showLoadingOverlay('Sending password reset link...');

        // Simulate server request
        setTimeout(() => {
            hideLoadingOverlay();

            showModal({
                title: 'Reset Link Sent',
                content: `
                    <div style="text-align: center;">
                        <i class="fas fa-envelope" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 1rem;"></i>
                        <p>We've sent a password reset link to <strong>${email}</strong></p>
                        <p>Please check your inbox and click the link to reset your password.</p>
                    </div>
                `,
                buttons: [
                    {
                        text: 'Close',
                        action: () => {
                            // Just close modal
                        }
                    },
                    {
                        text: 'Simulate Reset Link',
                        primary: true,
                        action: () => {
                            showResetPasswordForm(email);
                        }
                    }
                ]
            });
        }, 1500);
    }

    /**
     * Shows the reset password form
     * @param {string} email - The user's email address
     */
    function showResetPasswordForm(email) {
        showModal({
            title: 'Create New Password',
            content: `
                <div>
                    <p>Create a new password for <strong>${email}</strong></p>
                    
                    <div style="margin-top: 1rem;">
                        <label for="newPassword" style="display: block; margin-bottom: 0.5rem;">New Password</label>
                        <div style="position: relative;">
                            <input type="password" id="newPassword" placeholder="Enter new password" 
                                style="width: 100%; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--light-gray);">
                            <button type="button" id="newPasswordToggle" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer;">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        
                        <div style="margin-top: 0.75rem; font-size: 0.9rem;">
                            <p>Password must contain:</p>
                            <ul style="margin-top: 0.5rem; list-style-type: none;">
                                <li id="reset-length-check" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                    <i class="fas fa-circle" style="font-size: 0.8rem;"></i> At least 8 characters
                                </li>
                                <li id="reset-uppercase-check" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                    <i class="fas fa-circle" style="font-size: 0.8rem;"></i> 1 uppercase letter
                                </li>
                                <li id="reset-number-check" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                    <i class="fas fa-circle" style="font-size: 0.8rem;"></i> 1 number
                                </li>
                                <li id="reset-special-check" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                    <i class="fas fa-circle" style="font-size: 0.8rem;"></i> 1 special character
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="margin-top: 1.5rem;">
                        <label for="confirmPassword" style="display: block; margin-bottom: 0.5rem;">Confirm Password</label>
                        <input type="password" id="confirmPassword" placeholder="Confirm your password" 
                            style="width: 100%; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--light-gray);">
                        <div id="confirmError" style="color: var(--error-color); margin-top: 0.5rem; min-height: 1.2rem;"></div>
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: 'Cancel',
                    action: () => {
                        // Just close modal
                    }
                },
                {
                    text: 'Reset Password',
                    primary: true,
                    action: () => {
                        const newPassword = document.getElementById('newPassword').value;
                        const confirmPassword = document.getElementById('confirmPassword').value;
                        const confirmError = document.getElementById('confirmError');

                        // Validate password strength
                        const lengthValid = newPassword.length >= 8;
                        const uppercaseValid = /[A-Z]/.test(newPassword);
                        const numberValid = /[0-9]/.test(newPassword);
                        const specialValid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

                        // Update UI indicators
                        updatePasswordResetRequirement('reset-length-check', lengthValid);
                        updatePasswordResetRequirement('reset-uppercase-check', uppercaseValid);
                        updatePasswordResetRequirement('reset-number-check', numberValid);
                        updatePasswordResetRequirement('reset-special-check', specialValid);

                        // Check if all requirements are met
                        if (!(lengthValid && uppercaseValid && numberValid && specialValid)) {
                            confirmError.textContent = 'Password does not meet all requirements';
                            return false; // Keep modal open
                        }

                        // Check if passwords match
                        if (newPassword !== confirmPassword) {
                            confirmError.textContent = 'Passwords do not match';
                            return false; // Keep modal open
                        }

                        // All validations passed, complete reset
                        completePasswordReset(email);
                    }
                }
            ],
            onOpen: () => {
                // Add event listeners for password requirements check
                const newPasswordInput = document.getElementById('newPassword');
                const newPasswordToggle = document.getElementById('newPasswordToggle');

                newPasswordInput.addEventListener('input', function () {
                    const lengthValid = this.value.length >= 8;
                    const uppercaseValid = /[A-Z]/.test(this.value);
                    const numberValid = /[0-9]/.test(this.value);
                    const specialValid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.value);

                    updatePasswordResetRequirement('reset-length-check', lengthValid);
                    updatePasswordResetRequirement('reset-uppercase-check', uppercaseValid);
                    updatePasswordResetRequirement('reset-number-check', numberValid);
                    updatePasswordResetRequirement('reset-special-check', specialValid);
                });

                // Add toggle password visibility
                newPasswordToggle.addEventListener('click', function () {
                    const passwordField = document.getElementById('newPassword');
                    const icon = this.querySelector('i');

                    if (passwordField.type === 'password') {
                        passwordField.type = 'text';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    } else {
                        passwordField.type = 'password';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    }
                });
            }
        });
    }

    /**
     * Updates the UI for password reset requirements
     * @param {string} elementId - The element ID
     * @param {boolean} isValid - Whether the requirement is met
     */
    function updatePasswordResetRequirement(elementId, isValid) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const icon = element.querySelector('i');

        if (isValid) {
            element.style.color = 'var(--success-color)';
            icon.classList.remove('fa-circle');
            icon.classList.add('fa-check-circle');
        } else {
            element.style.color = 'var(--error-color)';
            icon.classList.remove('fa-check-circle');
            icon.classList.add('fa-times-circle');
        }
    }

    /**
     * Completes the password reset process
     * @param {string} email - The user's email address
     */
    function completePasswordReset(email) {
        showLoadingOverlay('Updating your password...');

        // Simulate server request
        setTimeout(() => {
            hideLoadingOverlay();

            showModal({
                title: 'Password Reset Complete',
                content: `
                    <div style="text-align: center;">
                        <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-color); margin-bottom: 1rem;"></i>
                        <p>Your password has been reset successfully.</p>
                        <p>You can now login with your new password.</p>
                    </div>
                `,
                buttons: [
                    {
                        text: 'Go to Login',
                        primary: true,
                        action: () => {
                            // Switch to login tab
                            switchTabs('login');

                            // Pre-fill email field if available
                            if (loginEmailInput) {
                                loginEmailInput.value = email;
                            }
                        }
                    }
                ]
            });
        }, 1500);
    }

    // ----- DARK MODE FUNCTIONALITY -----

    /**
     * Initializes dark mode based on user preference
     */
    function initializeDarkMode() {
        const savedDarkMode = localStorage.getItem('darkMode');
        const darkModeIcon = darkModeToggle.querySelector('i');

        if (savedDarkMode === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeIcon.classList.remove('fa-moon');
            darkModeIcon.classList.add('fa-sun');
        } else {
            document.body.classList.remove('dark-mode');
            darkModeIcon.classList.remove('fa-sun');
            darkModeIcon.classList.add('fa-moon');
        }
    }

    /**
     * Toggles dark mode and saves preference
     */
    function toggleDarkMode() {
        const darkModeIcon = darkModeToggle.querySelector('i');

        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            darkModeIcon.classList.remove('fa-sun');
            darkModeIcon.classList.add('fa-moon');
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            darkModeIcon.classList.remove('fa-moon');
            darkModeIcon.classList.add('fa-sun');
        }
    }

    // ----- UI HELPER FUNCTIONS -----

    /**
     * Shows a loading state on a form
     * @param {Element} form - The form element
     */
    function showLoadingState(form) {
        form.classList.add('form-submitting');

        // Disable all inputs and buttons
        const inputs = form.querySelectorAll('input, button');
        inputs.forEach(input => {
            input.setAttribute('disabled', 'disabled');
        });
    }

    /**
     * Hides the loading state on a form
     * @param {Element} form - The form element
     */
    function hideLoadingState(form) {
        form.classList.remove('form-submitting');

        // Re-enable all inputs and buttons
        const inputs = form.querySelectorAll('input, button');
        inputs.forEach(input => {
            input.removeAttribute('disabled');
        });
    }

    /**
     * Shows a full-screen loading overlay
     * @param {string} message - Message to display
     */
    function showLoadingOverlay(message) {
        // Check if overlay already exists
        let overlay = document.querySelector('.loading-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-message">${message || 'Loading...'}</div>
            `;

            document.body.appendChild(overlay);
        } else {
            // Update message in existing overlay
            overlay.querySelector('.loading-message').textContent = message || 'Loading...';
        }

        // Add loading overlay styles if they don't exist
        if (!document.getElementById('loading-overlay-styles')) {
            const loadingStyles = document.createElement('style');
            loadingStyles.id = 'loading-overlay-styles';
            loadingStyles.textContent = `
                .loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                    color: white;
                }
                
                .loading-spinner {
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top: 4px solid var(--accent-color);
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                
                .loading-message {
                    font-size: 1.1rem;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;

            document.head.appendChild(loadingStyles);
        }
    }

    /**
     * Hides the loading overlay
     */
    function hideLoadingOverlay() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Shows a notification message
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('success' or 'error')
     */
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add notification to the body
        document.body.appendChild(notification);

        // Add notification styles if they don't exist
        if (!document.getElementById('notification-styles')) {
            const notificationStyles = document.createElement('style');
            notificationStyles.id = 'notification-styles';
            notificationStyles.textContent = `
                .notification {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 12px 24px;
                    border-radius: var(--border-radius-md);
                    background-color: var(--success-color);
                    color: white;
                    box-shadow: var(--shadow-md);
                    z-index: 1500;
                    animation: notification-fade-in 0.3s ease-out forwards, 
                               notification-fade-out 0.3s ease-in forwards 2.7s;
                }
                
                .notification.error {
                    background-color: var(--error-color);
                }
                
                @keyframes notification-fade-in {
                    from {
                        opacity: 0;
                        transform: translate(-50%, 20px);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }
                
                @keyframes notification-fade-out {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
            `;

            document.head.appendChild(notificationStyles);
        }

        // Auto-remove the notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Shows a modal dialog
     * @param {Object} options - Modal options
     * @param {string} options.title - Modal title
     * @param {string} options.content - Modal HTML content
     * @param {Array} options.buttons - Array of button objects with text, action, and primary properties
     * @param {Function} options.onOpen - Function to call when modal opens
     * @returns {Element} The modal element
     */
    function showModal(options) {
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'modal-container';

        // Generate buttons HTML
        const buttonsHTML = options.buttons.length > 0
            ? `<div class="modal-footer">
                ${options.buttons.map((btn, index) => {
                const btnClass = btn.primary ? 'modal-btn-primary' : 'modal-btn-secondary';
                return `<button class="modal-btn ${btnClass}" data-button-index="${index}">${btn.text}</button>`;
            }).join('')}
              </div>`
            : '';

        // Create modal HTML
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${options.title}</h3>
                    ${options.buttons.length > 0 ? '<button class="modal-close" aria-label="Close"><i class="fas fa-times"></i></button>' : ''}
                </div>
                <div class="modal-body">
                    ${options.content}
                </div>
                ${buttonsHTML}
            </div>
        `;

        // Add modal to the body
        document.body.appendChild(modal);

        // Add modal styles if they don't exist
        if (!document.getElementById('modal-styles')) {
            const modalStyles = document.createElement('style');
            modalStyles.id = 'modal-styles';
            modalStyles.textContent = `
                .modal-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: -1;
                }
                
                .modal-content {
                    background-color: var(--white);
                    border-radius: var(--border-radius-md);
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-lg);
                    animation: modal-fade-in 0.3s ease-out;
                }
                
                @keyframes modal-fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 1px solid var(--light-gray);
                }
                
                .modal-header h3 {
                    margin: 0;
                    color: var(--primary-color);
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: var(--medium-gray);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    transition: background-color var(--transition-fast);
                }
                
                .modal-close:hover {
                    background-color: var(--light-gray);
                }
                
                .modal-body {
                    padding: 1.5rem;
                }
                
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                    padding: 1rem;
                    border-top: 1px solid var(--light-gray);
                }
                
                .modal-btn {
                    padding: 0.5rem 1rem;
                    border-radius: var(--border-radius-sm);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    border: none;
                }
                
                .modal-btn-primary {
                    background-color: var(--accent-color);
                    color: white;
                }
                
                .modal-btn-primary:hover {
                    background-color: var(--primary-color);
                }
                
                .modal-btn-secondary {
                    background-color: var(--light-gray);
                    color: var(--primary-color);
                }
                
                .modal-btn-secondary:hover {
                    background-color: var(--medium-gray);
                    color: white;
                }
                
                /* Dark mode styles */
                .dark-mode .modal-content {
                    background-color: var(--primary-color);
                    color: var(--white);
                }
                
                .dark-mode .modal-header {
                    border-color: rgba(255, 255, 255, 0.1);
                }
                
                .dark-mode .modal-header h3 {
                    color: var(--white);
                }
                
                .dark-mode .modal-footer {
                    border-color: rgba(255, 255, 255, 0.1);
                }
                
                .dark-mode .modal-btn-secondary {
                    background-color: rgba(255, 255, 255, 0.1);
                    color: var(--white);
                }
                
                @media (max-width: 576px) {
                    .modal-footer {
                        flex-direction: column-reverse;
                    }
                    
                    .modal-btn {
                        width: 100%;
                    }
                }
            `;

            document.head.appendChild(modalStyles);
        }

        // Set up event handlers
        if (options.buttons.length > 0) {
            // Close button event
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    closeModal(modal);
                });
            }

            // Overlay click to close
            modal.querySelector('.modal-overlay').addEventListener('click', () => {
                closeModal(modal);
            });

            // Button actions
            options.buttons.forEach((btn, index) => {
                const button = modal.querySelector(`.modal-btn[data-button-index="${index}"]`);
                if (button && btn.action) {
                    button.addEventListener('click', () => {
                        const result = btn.action();
                        if (result !== false) {
                            closeModal(modal);
                        }
                    });
                }
            });
        }

        // Call onOpen callback if provided
        if (typeof options.onOpen === 'function') {
            options.onOpen();
        }

        return modal;
    }

    /**
     * Closes a modal dialog
     * @param {Element} modal - The modal element to close
     */
    function closeModal(modal) {
        // Add fade-out animation
        modal.classList.add('modal-closing');

        // Remove modal after animation
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
});
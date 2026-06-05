// ==========================================================
// CURIS SUPER ADMINISTRATOR LOGIN JAVASCRIPT
// Professional, Secure, and Modern Implementation
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {
    // ----------------
    // CONSTANTS & CONFIGURATION
    // ----------------
    const VALID_DOMAIN = 'citruslabs.co.ke';
    const VERIFICATION_CODE_LENGTH = 6;
    const CODE_EXPIRY_TIME = 10 * 60; // 10 minutes in seconds
    const RESEND_COOLDOWN = 60; // 60 seconds
    const DASHBOARD_URL = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Super Administrator\\Dashboard\\dashboard.html';

    // ----------------
    // STATE MANAGEMENT
    // ----------------
    let currentVerificationCode = null;
    let codeExpiryTimer = null;
    let resendCooldownTimer = null;
    let codeExpiryTimestamp = null;
    let lastEmailUsed = null;

    // ----------------
    // DOM ELEMENTS
    // ----------------
    const elements = {
        // Screens
        emailInputScreen: document.getElementById('emailInputScreen'),
        verificationScreen: document.getElementById('verificationScreen'),
        
        // Forms
        emailForm: document.getElementById('emailForm'),
        verificationForm: document.getElementById('verificationForm'),
        
        // Inputs
        adminEmail: document.getElementById('adminEmail'),
        verificationCode: document.getElementById('verificationCode'),
        
        // Buttons
        sendVerificationBtn: document.getElementById('sendVerificationBtn'),
        verifyBtn: document.getElementById('verifyBtn'),
        resendBtn: document.getElementById('resendBtn'),
        backToEmailBtn: document.getElementById('backToEmailBtn'),
        errorCloseBtn: document.getElementById('errorCloseBtn'),
        darkModeToggle: document.getElementById('darkModeToggle'),
        
        // Validation
        emailValidationIcon: document.getElementById('emailValidationIcon'),
        emailError: document.getElementById('emailError'),
        verificationError: document.getElementById('verificationError'),
        
        // Display elements
        emailDisplay: document.getElementById('emailDisplay'),
        countdown: document.getElementById('countdown'),
        resendCountdown: document.getElementById('resendCountdown'),
        resendTimer: document.getElementById('resendTimer'),
        
        // Overlays
        loadingOverlay: document.getElementById('loadingOverlay'),
        errorOverlay: document.getElementById('errorOverlay'),
        loadingMessage: document.getElementById('loadingMessage'),
        errorText: document.getElementById('errorText'),
        
        // Modal
        contactFormModal: document.getElementById('contactFormModal'),
        supportForm: document.getElementById('supportForm'),
        modalCloseBtn: document.querySelector('.close-modal')
    };

    // ----------------
    // INITIALIZATION
    // ----------------
    initializeEmailValidation();
    initializeFormHandlers();
    initializeDarkMode();
    initializeModalHandlers();

    // ----------------
    // EMAIL VALIDATION
    // ----------------
    function initializeEmailValidation() {
        elements.adminEmail.addEventListener('input', function() {
            const email = this.value.trim();
            
            if (email) {
                const isValidFormat = validateEmailFormat(email);
                const isValidDomain = validateEmailDomain(email);
                
                if (isValidFormat && isValidDomain) {
                    // Valid email
                    elements.emailValidationIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                    elements.emailValidationIcon.classList.remove('invalid');
                    elements.emailValidationIcon.classList.add('valid');
                    clearEmailError();
                } else {
                    // Invalid email
                    elements.emailValidationIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
                    elements.emailValidationIcon.classList.remove('valid');
                    elements.emailValidationIcon.classList.add('invalid');
                    
                    if (!isValidFormat) {
                        showEmailError('Please enter a valid email address.');
                    } else if (!isValidDomain) {
                        showEmailError(`Email must end with ${VALID_DOMAIN}.`);
                    }
                }
            } else {
                elements.emailValidationIcon.innerHTML = '';
                elements.emailValidationIcon.classList.remove('valid', 'invalid');
                clearEmailError();
            }
        });
    }

    function validateEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateEmailDomain(email) {
        return email.toLowerCase().endsWith(`@${VALID_DOMAIN}`);
    }

    // ----------------
    // FORM HANDLERS
    // ----------------
    function initializeFormHandlers() {
        // Email form submission
        elements.emailForm.addEventListener('submit', handleEmailSubmit);
        
        // Verification form submission
        elements.verificationForm.addEventListener('submit', handleVerificationSubmit);
        
        // Back to email button
        elements.backToEmailBtn.addEventListener('click', handleBackToEmail);
        
        // Resend code button
        elements.resendBtn.addEventListener('click', handleResendCode);
        
        // Error overlay close
        elements.errorCloseBtn.addEventListener('click', hideErrorOverlay);
    }

    async function handleEmailSubmit(e) {
        e.preventDefault();
        
        const email = elements.adminEmail.value.trim();
        
        // Validate email
        if (!validateEmailFormat(email)) {
            showEmailError('Please enter a valid email address.');
            return;
        }
        
        if (!validateEmailDomain(email)) {
            showEmailError(`Email must be from ${VALID_DOMAIN} domain.`);
            return;
        }
        
        // Show loading overlay
        showLoadingOverlay('Sending verification code...');
        
        // Simulate API call
        await simulateAPICall(2000);
        
        // Generate and "send" verification code
        currentVerificationCode = generateVerificationCode();
        codeExpiryTimestamp = Date.now() + (CODE_EXPIRY_TIME * 1000);
        lastEmailUsed = email;
        
        // For demo purposes, log the verification code to console
        console.log('Verification code:', currentVerificationCode);
        
        // Hide loading overlay
        hideLoadingOverlay();
        
        // Transition to verification screen
        transitionToVerificationScreen(email);
    }

    async function handleVerificationSubmit(e) {
        e.preventDefault();
        
        const code = elements.verificationCode.value.trim();
        
        // Validate code
        if (!code || code.length !== VERIFICATION_CODE_LENGTH) {
            showVerificationError('Please enter a valid 6-digit code.');
            return;
        }
        
        // Check expiry
        if (Date.now() > codeExpiryTimestamp) {
            showVerificationError('Verification code has expired. Please request a new one.');
            return;
        }
        
        // Verify code
        if (code !== currentVerificationCode) {
            showVerificationError('Incorrect verification code. Please try again.');
            return;
        }
        
        // Show loading overlay
        showLoadingOverlay('Verifying...');
        
        // Simulate API call for verification
        await simulateAPICall(2000);
        
        // Clear timers
        clearIntervals();
        
        // Success! Create session and redirect
        // In a real application, you would handle JWT session creation here
        
        // Redirect to dashboard
        window.location.href = DASHBOARD_URL;
    }

    function handleBackToEmail(e) {
        e.preventDefault();
        clearIntervals();
        transitionToEmailScreen();
    }

    async function handleResendCode() {
        if (elements.resendBtn.disabled) return;
        
        // Show loading overlay
        showLoadingOverlay('Resending verification code...');
        
        // Simulate API call
        await simulateAPICall(2000);
        
        // Generate new code
        currentVerificationCode = generateVerificationCode();
        codeExpiryTimestamp = Date.now() + (CODE_EXPIRY_TIME * 1000);
        
        // For demo purposes, log the new code
        console.log('New verification code:', currentVerificationCode);
        
        // Hide loading overlay
        hideLoadingOverlay();
        
        // Reset verification form
        elements.verificationCode.value = '';
        clearVerificationError();
        
        // Restart timers
        startCodeExpiryTimer();
        startResendCooldownTimer();
        
        // Show success message
        showVerificationError('New verification code sent!', true);
    }

    // ----------------
    // SCREEN TRANSITIONS
    // ----------------
    function transitionToVerificationScreen(email) {
        // Update display
        elements.emailDisplay.textContent = email;
        
        // Hide email screen
        elements.emailInputScreen.classList.remove('active');
        
        // Show verification screen
        elements.verificationScreen.classList.add('active');
        
        // Start timers
        startCodeExpiryTimer();
        startResendCooldownTimer();
        
        // Clear verification input
        elements.verificationCode.value = '';
        clearVerificationError();
        
        // Focus on verification input
        elements.verificationCode.focus();
    }

    function transitionToEmailScreen() {
        // Hide verification screen
        elements.verificationScreen.classList.remove('active');
        
        // Show email screen
        elements.emailInputScreen.classList.add('active');
        
        // Clear email input
        elements.adminEmail.value = '';
        elements.emailValidationIcon.innerHTML = '';
        elements.emailValidationIcon.classList.remove('valid', 'invalid');
        clearEmailError();
        
        // Focus on email input
        elements.adminEmail.focus();
    }

    // ----------------
    // TIMER MANAGEMENT
    // ----------------
    function startCodeExpiryTimer() {
        clearInterval(codeExpiryTimer);
        
        const updateCountdown = () => {
            const remainingTime = Math.max(0, Math.floor((codeExpiryTimestamp - Date.now()) / 1000));
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            
            elements.countdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (remainingTime <= 0) {
                clearInterval(codeExpiryTimer);
                showVerificationError('Verification code has expired. Please request a new one.');
                elements.resendBtn.disabled = false;
                elements.resendBtn.textContent = 'Resend Code';
            }
        };
        
        updateCountdown(); // Initial update
        codeExpiryTimer = setInterval(updateCountdown, 1000);
    }

    function startResendCooldownTimer() {
        clearInterval(resendCooldownTimer);
        elements.resendBtn.disabled = true;
        elements.resendCountdown.style.display = 'block';
        
        let cooldown = RESEND_COOLDOWN;
        
        const updateResendCountdown = () => {
            elements.resendTimer.textContent = cooldown;
            
            if (cooldown <= 0) {
                clearInterval(resendCooldownTimer);
                elements.resendBtn.disabled = false;
                elements.resendCountdown.style.display = 'none';
            } else {
                cooldown--;
            }
        };
        
        updateResendCountdown(); // Initial update
        resendCooldownTimer = setInterval(updateResendCountdown, 1000);
    }

    function clearIntervals() {
        clearInterval(codeExpiryTimer);
        clearInterval(resendCooldownTimer);
    }

    // ----------------
    // VERIFICATION CODE GENERATION
    // ----------------
    function generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // ----------------
    // ERROR HANDLING
    // ----------------
    function showEmailError(message) {
        elements.emailError.textContent = message;
        elements.emailError.classList.add('show');
    }

    function clearEmailError() {
        elements.emailError.textContent = '';
        elements.emailError.classList.remove('show');
    }

    function showVerificationError(message, isSuccess = false) {
        elements.verificationError.textContent = message;
        elements.verificationError.classList.add('show');
        elements.verificationError.style.color = isSuccess ? 'var(--success-color)' : 'var(--error-color)';
    }

    function clearVerificationError() {
        elements.verificationError.textContent = '';
        elements.verificationError.classList.remove('show');
    }

    // ----------------
    // OVERLAY MANAGEMENT
    // ----------------
    function showLoadingOverlay(message = 'Loading...') {
        elements.loadingMessage.textContent = message;
        elements.loadingOverlay.classList.add('show');
    }

    function hideLoadingOverlay() {
        elements.loadingOverlay.classList.remove('show');
    }

    function showErrorOverlay(message) {
        elements.errorText.textContent = message;
        elements.errorOverlay.classList.add('show');
    }

    function hideErrorOverlay() {
        elements.errorOverlay.classList.remove('show');
    }

    // ----------------
    // DARK MODE
    // ----------------
    function initializeDarkMode() {
        // Check for saved preference
        const darkModeStored = localStorage.getItem('darkMode');
        if (darkModeStored === 'true') {
            document.body.classList.add('dark-mode');
            elements.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        // Toggle event
        elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    function toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        elements.darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // ----------------
    // MODAL HANDLERS
    // ----------------
    function initializeModalHandlers() {
        // Close modal button
        elements.modalCloseBtn.addEventListener('click', closeContactModal);
        
        // Click outside modal to close
        elements.contactFormModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeContactModal();
            }
        });
        
        // Support form submission
        elements.supportForm.addEventListener('submit', handleSupportSubmit);
    }

    function closeContactModal() {
        elements.contactFormModal.classList.remove('show');
    }

    async function handleSupportSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('supportName').value,
            email: document.getElementById('supportEmail').value,
            subject: document.getElementById('supportSubject').value,
            message: document.getElementById('supportMessage').value
        };
        
        // Show loading
        showLoadingOverlay('Submitting...');
        
        // Simulate API call
        await simulateAPICall(2000);
        
        // Hide loading
        hideLoadingOverlay();
        
        // Show success message (for demo)
        alert('Support request submitted successfully!');
        
        // Close modal and reset form
        closeContactModal();
        elements.supportForm.reset();
    }

    // ----------------
    // UTILITY FUNCTIONS
    // ----------------
    function simulateAPICall(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    // ----------------
    // CLEANUP
    // ----------------
    window.addEventListener('beforeunload', function() {
        clearIntervals();
    });

    // ----------------
    // EASTER EGG CONSOLE MESSAGE
    // ----------------
    console.log('%cWelcome to Curis Super Administrator Login', 'color: #00BFA5; font-size: 24px; font-weight: bold;');
    console.log('%cSecurity Notice: For testing purposes, verification codes are logged to console.', 'color: #FF6B35; font-weight: bold;');
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('An error occurred:', event.error);
    document.getElementById('errorText').textContent = 'An unexpected error occurred. Please try again.';
    document.getElementById('errorOverlay').classList.add('show');
});
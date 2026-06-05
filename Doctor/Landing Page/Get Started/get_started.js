/**
 * Curis Get Started JavaScript
 * Created: April 18, 2025
 * 
 * This file contains the JavaScript functionality for the Curis Get Started page,
 * including email validation, verification code handling, session management,
 * and dark mode toggle.
 */

// Wait for the DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', function () {
    // ---------- GLOBAL VARIABLES ----------
    let verificationCodeExpiry; // Timestamp for code expiration
    let resendTimer; // Timer for resend button cooldown
    let codeExpiryTimer; // Timer for code expiration countdown
    let emailValue; // Store the entered email
    let verificationCode; // Store the generated verification code

    // ---------- DOM ELEMENTS ----------
    // Forms
    const emailForm = document.getElementById('email-form');
    const verificationForm = document.getElementById('verification-form');

    // Input elements
    const emailInput = document.getElementById('doctor-email');
    const verificationCodeInput = document.getElementById('verification-code');

    // Validation messages
    const emailValidationMessage = document.getElementById('email-validation-message');
    const codeValidationMessage = document.getElementById('code-validation-message');

    // Buttons
    const sendVerificationBtn = document.getElementById('send-verification-btn');
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    const resendCodeBtn = document.getElementById('resend-code-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Containers
    const emailInputForm = document.getElementById('email-input-form');
    const verificationScreen = document.getElementById('verification-screen');

    // Display elements
    const maskedEmailSpan = document.getElementById('masked-email').querySelector('span');
    const codeCountdown = document.getElementById('code-countdown');
    const resendCountdown = document.getElementById('resend-countdown');

    // ---------- INITIAL SETUP ----------
    // Load Font Awesome if not already loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);
    }

    // Check if user has an active session
    checkExistingSession();

    // Check for dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
    }

    // Add input listeners for real-time validation
    emailInput.addEventListener('input', validateEmailInput);
    verificationCodeInput.addEventListener('input', validateCodeInput);

    // ---------- FORM SUBMISSION HANDLERS ----------
    // Email form submission
    emailForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Final validation before submission
        if (validateEmailFinal()) {
            // Store email value for later use
            emailValue = emailInput.value.trim().toLowerCase();

            // Disable button and show loading state
            sendVerificationBtn.disabled = true;
            sendVerificationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Simulate API call to send verification code
            setTimeout(() => {
                sendVerificationCode(emailValue);
            }, 1500); // Add a slight delay to simulate API call
        }
    });

    // Verification form submission
    verificationForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate code format
        if (validateCodeFormat()) {
            // Disable button and show loading state
            verifyCodeBtn.disabled = true;
            verifyCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

            // Simulate API call to verify code
            setTimeout(() => {
                verifyCode(verificationCodeInput.value.trim());
            }, 1500); // Add a slight delay to simulate API call
        }
    });

    // Resend code button click
    resendCodeBtn.addEventListener('click', function () {
        if (!resendCodeBtn.disabled) {
            // Disable button and show loading state
            resendCodeBtn.disabled = true;
            resendCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Simulate API call to resend verification code
            setTimeout(() => {
                resendVerificationCode(emailValue);
            }, 1500); // Add a slight delay to simulate API call
        }
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('click', function () {
        if (document.body.classList.contains('dark-mode')) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });

    // ---------- EMAIL VALIDATION FUNCTIONS ----------
    // Real-time email validation as user types
    function validateEmailInput() {
        const email = emailInput.value.trim();

        // Clear previous validation messages
        emailValidationMessage.textContent = '';
        emailValidationMessage.className = 'validation-message';
        emailInput.classList.remove('valid', 'invalid');

        // Skip validation if empty
        if (email === '') return;

        // Basic format validation with regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailInput.classList.add('invalid');
            emailValidationMessage.textContent = 'Please enter a valid email address';
            emailValidationMessage.classList.add('error');
            return false;
        }

        // Advanced validation for healthcare domain (optional enhancement)
        const domain = email.split('@')[1];
        const commonHealthcareDomains = ['hospital.com', 'clinic.org', 'med.ke', 'health.go.ke', 'doctor.co.ke'];
        const isHealthcareDomain = commonHealthcareDomains.some(d => domain.includes(d));

        if (isHealthcareDomain) {
            emailInput.classList.add('valid');
            emailValidationMessage.textContent = 'Valid healthcare email';
            emailValidationMessage.classList.add('success');
        }

        return true;
    }

    // Final validation before form submission
    function validateEmailFinal() {
        const email = emailInput.value.trim();

        // Check if empty
        if (email === '') {
            emailInput.classList.add('invalid');
            emailValidationMessage.textContent = 'Email is required';
            emailValidationMessage.classList.add('error');
            emailInput.focus();
            return false;
        }

        // Basic format validation with regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailInput.classList.add('invalid');
            emailValidationMessage.textContent = 'Please enter a valid email address';
            emailValidationMessage.classList.add('error');
            emailInput.focus();
            return false;
        }

        return true;
    }

    // ---------- CODE VALIDATION FUNCTIONS ----------
    // Real-time code validation as user types
    function validateCodeInput() {
        const code = verificationCodeInput.value.trim();

        // Clear previous validation messages
        codeValidationMessage.textContent = '';
        codeValidationMessage.className = 'validation-message';
        verificationCodeInput.classList.remove('valid', 'invalid');

        // Skip validation if empty
        if (code === '') return;

        // Check if input is exactly 6 digits
        const codeRegex = /^\d{6}$/;
        if (!codeRegex.test(code)) {
            verificationCodeInput.classList.add('invalid');
            codeValidationMessage.textContent = 'Code must be 6 digits';
            codeValidationMessage.classList.add('error');
            return false;
        }

        verificationCodeInput.classList.add('valid');
        return true;
    }

    // Validate code format before submission
    function validateCodeFormat() {
        const code = verificationCodeInput.value.trim();

        // Check if empty
        if (code === '') {
            verificationCodeInput.classList.add('invalid');
            codeValidationMessage.textContent = 'Verification code is required';
            codeValidationMessage.classList.add('error');
            verificationCodeInput.focus();
            return false;
        }

        // Check if input is exactly 6 digits
        const codeRegex = /^\d{6}$/;
        if (!codeRegex.test(code)) {
            verificationCodeInput.classList.add('invalid');
            codeValidationMessage.textContent = 'Code must be 6 digits';
            codeValidationMessage.classList.add('error');
            verificationCodeInput.focus();
            return false;
        }

        return true;
    }

    // ---------- VERIFICATION CODE HANDLING ----------
    // Send verification code to user's email
    function sendVerificationCode(email) {
        // In a real implementation, this would make an API call to your backend
        // For this demo, we'll simulate a successful response

        // Generate a random 6-digit code
        verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`Verification code for ${email}: ${verificationCode}`); // For demo purposes only

        // Set expiry time (10 minutes from now)
        verificationCodeExpiry = Date.now() + (10 * 60 * 1000);

        // Update UI for successful code sending
        sendVerificationSuccess(email);

        // In a real implementation, you would have error handling:
        // if (apiResponse.error) {
        //     sendVerificationError(apiResponse.error);
        // } else {
        //     sendVerificationSuccess(email);
        // }
    }

    // Handle successful verification code sending
    function sendVerificationSuccess(email) {
        // Update masked email display
        maskedEmailSpan.textContent = maskEmail(email);

        // Show verification screen, hide email form
        emailInputForm.style.display = 'none';
        verificationScreen.style.display = 'block';
        verificationScreen.classList.add('fadeIn');

        // Reset verification code input
        verificationCodeInput.value = '';
        codeValidationMessage.textContent = '';

        // Focus on the code input
        setTimeout(() => {
            verificationCodeInput.focus();
        }, 300);

        // Start countdown for code expiry
        startCodeExpiryCountdown();

        // Start countdown for resend button
        startResendCountdown();

        // Reset the send button
        sendVerificationBtn.disabled = false;
        sendVerificationBtn.innerHTML = 'Send Verification Code';
    }

    // Handle verification code sending error
    function sendVerificationError(error) {
        // Reset the send button
        sendVerificationBtn.disabled = false;
        sendVerificationBtn.innerHTML = 'Send Verification Code';

        // Show error message
        emailValidationMessage.textContent = error || 'Failed to send verification code. Please try again.';
        emailValidationMessage.classList.add('error');

        // Add shake animation to form
        emailForm.classList.add('shake');
        setTimeout(() => {
            emailForm.classList.remove('shake');
        }, 600);
    }

    // Resend verification code
    function resendVerificationCode(email) {
        // In a real implementation, this would make an API call to your backend
        // For this demo, we'll simulate a successful response

        // Generate a new random 6-digit code
        verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`New verification code for ${email}: ${verificationCode}`); // For demo purposes only

        // Set new expiry time (10 minutes from now)
        verificationCodeExpiry = Date.now() + (10 * 60 * 1000);

        // Reset code input
        verificationCodeInput.value = '';
        codeValidationMessage.textContent = '';

        // Reset countdown for code expiry
        startCodeExpiryCountdown();

        // Start new countdown for resend button
        startResendCountdown();

        // Reset the resend button
        resendCodeBtn.innerHTML = 'Resend Code (<span id="resend-countdown">60</span>s)';
        document.getElementById('resend-countdown').textContent = '60';

        // Show success message
        codeValidationMessage.textContent = 'New verification code sent!';
        codeValidationMessage.classList.add('success');
    }

    // Verify the entered code
    function verifyCode(code) {
        // In a real implementation, this would make an API call to verify the code
        // For this demo, we'll check against our generated code

        // Check if code has expired
        if (Date.now() > verificationCodeExpiry) {
            verifyCodeError('Verification code has expired. Please request a new one.');
            return;
        }

        // Check if code matches
        if (code === verificationCode) {
            verifyCodeSuccess();
        } else {
            verifyCodeError('Invalid verification code. Please try again.');
        }
    }

    // Handle successful code verification
    function verifyCodeSuccess() {
        // Clear any existing timers
        clearInterval(codeExpiryTimer);
        clearInterval(resendTimer);

        // Create session
        createSession(emailValue);

        // Show success message
        codeValidationMessage.textContent = 'Verification successful! Redirecting...';
        codeValidationMessage.classList.add('success');

        // In a real implementation, you would redirect to the dashboard
        setTimeout(() => {
            window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Doctor\\Dashboard\\dashboard.html';
        }, 2000);
    }

    // Handle code verification error
    function verifyCodeError(error) {
        // Reset the verify button
        verifyCodeBtn.disabled = false;
        verifyCodeBtn.innerHTML = 'Verify Code';

        // Show error message
        codeValidationMessage.textContent = error;
        codeValidationMessage.classList.add('error');

        // Add shake animation to form
        verificationForm.classList.add('shake');
        setTimeout(() => {
            verificationForm.classList.remove('shake');
        }, 600);

        // Focus on the code input
        verificationCodeInput.focus();
    }

    // ---------- TIMER FUNCTIONS ----------
    // Start countdown for code expiration (10 minutes)
    function startCodeExpiryCountdown() {
        // Clear any existing timer
        if (codeExpiryTimer) clearInterval(codeExpiryTimer);

        // Update countdown every second
        codeExpiryTimer = setInterval(() => {
            // Calculate remaining time
            const now = Date.now();
            const timeLeft = verificationCodeExpiry - now;

            if (timeLeft <= 0) {
                // Code has expired
                clearInterval(codeExpiryTimer);
                codeCountdown.textContent = '00:00';
                codeCountdown.style.color = 'var(--error-color)';
                codeValidationMessage.textContent = 'Code has expired. Please request a new one.';
                codeValidationMessage.classList.add('error');
                verifyCodeBtn.disabled = true;

                // Ensure resend button is enabled
                if (parseInt(resendCountdown.textContent) <= 0) {
                    resendCodeBtn.disabled = false;
                }
            } else {
                // Format time as MM:SS
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                codeCountdown.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                // Change color when time is running out (less than 1 minute)
                if (timeLeft < 60000) {
                    codeCountdown.style.color = 'var(--error-color)';
                } else {
                    codeCountdown.style.color = 'var(--secondary-color)';
                }
            }
        }, 1000);
    }

    // Start countdown for resend button (60 seconds)
    function startResendCountdown() {
        // Clear any existing timer
        if (resendTimer) clearInterval(resendTimer);

        // Disable resend button
        resendCodeBtn.disabled = true;

        // Set initial countdown value
        let secondsLeft = 60;
        document.getElementById('resend-countdown').textContent = secondsLeft;

        // Update countdown every second
        resendTimer = setInterval(() => {
            secondsLeft--;
            document.getElementById('resend-countdown').textContent = secondsLeft;

            if (secondsLeft <= 0) {
                // Countdown complete, enable resend button
                clearInterval(resendTimer);
                resendCodeBtn.disabled = false;
                resendCodeBtn.innerHTML = 'Resend Code';
            }
        }, 1000);
    }

    // ---------- SESSION MANAGEMENT ----------
    // Create a new session
    function createSession(email) {
        // In a real implementation, this would use JWT or similar token-based auth
        // For this demo, we'll use localStorage to simulate a session

        // Create a session object
        const session = {
            email: email,
            role: 'doctor',
            permissions: ['view_patients', 'manage_appointments', 'write_prescriptions'],
            created: Date.now(),
            expires: Date.now() + (8 * 60 * 60 * 1000) // 8 hours from now
        };

        // Save session to localStorage
        localStorage.setItem('curisSession', JSON.stringify(session));

        // In a real implementation, you might also set a cookie or use a more secure method
    }

    // Check if user has an existing session
    function checkExistingSession() {
        const sessionData = localStorage.getItem('curisSession');

        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);

                // Check if session is still valid
                if (session.expires > Date.now()) {
                    // Session is valid, redirect to dashboard
                    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Doctor\\Dashboard\\dashboard.html';
                } else {
                    // Session has expired, clear it
                    localStorage.removeItem('curisSession');
                }
            } catch (error) {
                // Invalid session data, clear it
                localStorage.removeItem('curisSession');
            }
        }
    }

    // ---------- SESSION VALIDATION ----------
    // Function to validate session periodically (every 5 minutes)
    function setupSessionValidation() {
        // Check session every 5 minutes
        setInterval(() => {
            const sessionData = localStorage.getItem('curisSession');

            if (sessionData) {
                try {
                    const session = JSON.parse(sessionData);

                    // Check if session is still valid
                    if (session.expires <= Date.now()) {
                        // Session has expired, redirect to login
                        alert('Your session has expired. Please log in again.');
                        localStorage.removeItem('curisSession');
                        window.location.reload();
                    }
                } catch (error) {
                    // Invalid session data, clear it
                    localStorage.removeItem('curisSession');
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    // Call setupSessionValidation when a session is created
    // This would typically be called after successful login

    // ---------- UTILITY FUNCTIONS ----------
    // Mask email for display (e.g. j***@example.com)
    function maskEmail(email) {
        const parts = email.split('@');
        const name = parts[0];
        const domain = parts[1];

        let maskedName;
        if (name.length <= 1) {
            maskedName = '*';
        } else if (name.length <= 3) {
            maskedName = name.charAt(0) + '*'.repeat(name.length - 1);
        } else {
            maskedName = name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
        }

        return `${maskedName}@${domain}`;
    }

    // ---------- DARK MODE FUNCTIONS ----------
    // Enable dark mode
    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        updateDarkModeIcon(true);
    }

    // Disable dark mode
    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        updateDarkModeIcon(false);
    }

    // Update dark mode icon
    function updateDarkModeIcon(isDarkMode) {
        const icon = darkModeToggle.querySelector('i');
        if (isDarkMode) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // ---------- ACTIVITY TRACKING ----------
    // Set up idle tracking for security
    function setupIdleTracking() {
        let idleTime = 0;
        const idleThreshold = 30; // minutes

        // Reset idle time on user activity
        const resetIdleTime = () => {
            idleTime = 0;
        };

        // Check idle time every minute
        const idleInterval = setInterval(() => {
            idleTime++;

            // Log out if idle for too long
            if (idleTime >= idleThreshold) {
                clearInterval(idleInterval);

                // Show warning before logout
                if (confirm(`You've been inactive for ${idleThreshold} minutes. For security, you'll be logged out. Continue session?`)) {
                    resetIdleTime();
                } else {
                    // Log out
                    localStorage.removeItem('curisSession');
                    window.location.reload();
                }
            }
        }, 60 * 1000); // 1 minute

        // Reset idle time on various user activities
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
        events.forEach(event => {
            document.addEventListener(event, resetIdleTime);
        });
    }

    // Set up idle tracking if user is logged in
    if (localStorage.getItem('curisSession')) {
        setupIdleTracking();
        setupSessionValidation();
    }

    // ---------- INITIAL CALL ----------
    // Add event listener for page unload/refresh
    window.addEventListener('beforeunload', function (e) {
        // If we're in the middle of verification, show a warning
        if (verificationScreen.style.display === 'block' && !verificationForm.classList.contains('verified')) {
            // In modern browsers, this text is often ignored and a generic message is shown instead
            const confirmationMessage = 'You have a pending verification process. Are you sure you want to leave?';
            e.returnValue = confirmationMessage; // Standard
            return confirmationMessage; // For older browsers
        }
    });

    // Initialize any accessibility enhancements
    function initAccessibility() {
        // Add proper ARIA attributes
        emailInput.setAttribute('aria-describedby', 'email-validation-message');
        verificationCodeInput.setAttribute('aria-describedby', 'code-validation-message');

        // Add keyboard support for the resend button
        resendCodeBtn.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!this.disabled) {
                    this.click();
                }
            }
        });
    }

    // Call initial functions
    initAccessibility();
});
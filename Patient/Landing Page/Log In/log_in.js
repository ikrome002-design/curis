/**
 * Curis Health - Login Functionality
 * This script handles all functionality for the Curis Patient Log In process.
 */

// Wait for DOM to be fully loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initializeEmailValidation();
    initializeAuthToggle();
    initializeCodeAuth();
    initializePasswordAuth();
    initializeModals();
    setupForgotPassword();
    setupDarkMode();
    
    // Set up session timeout monitoring
    setupSessionTimeoutMonitoring();
});

/**
 * Initialize email validation functionality
 */
function initializeEmailValidation() {
    const emailInput = document.getElementById('email');
    const emailValidationIcon = document.getElementById('email-validation-icon');
    const emailError = document.getElementById('email-error');
    
    // Add event listeners for real-time validation
    emailInput.addEventListener('input', () => {
        validateEmail(emailInput.value);
    });
    
    emailInput.addEventListener('blur', () => {
        if (emailInput.value) {
            validateEmail(emailInput.value);
        } else {
            emailError.textContent = 'Email is required';
            emailValidationIcon.className = 'validation-icon invalid';
            emailInput.style.borderColor = 'var(--danger-color)';
        }
    });
    
    /**
     * Validates email format and updates UI accordingly
     * @param {string} email - The email to validate
     * @returns {boolean} - Whether the email is valid
     */
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        if (isValid) {
            emailError.textContent = '';
            emailValidationIcon.className = 'validation-icon valid';
            emailInput.style.borderColor = 'var(--success-color)';
        } else {
            emailError.textContent = email ? 'Please enter a valid email address' : '';
            emailValidationIcon.className = email ? 'validation-icon invalid' : '';
            emailInput.style.borderColor = email ? 'var(--danger-color)' : '';
        }
        
        return isValid;
    }
}

/**
 * Initialize authentication method toggle
 */
function initializeAuthToggle() {
    const codeAuthBtn = document.getElementById('code-auth-btn');
    const passwordAuthBtn = document.getElementById('password-auth-btn');
    const codeAuthSection = document.getElementById('code-auth-section');
    const passwordAuthSection = document.getElementById('password-auth-section');
    
    // Set up toggle buttons
    codeAuthBtn.addEventListener('click', () => {
        if (!codeAuthBtn.classList.contains('active')) {
            // Switch to code authentication
            codeAuthBtn.classList.add('active');
            passwordAuthBtn.classList.remove('active');
            
            codeAuthSection.classList.remove('hidden');
            passwordAuthSection.classList.add('hidden');
            
            // Reset verification code container if shown
            const verificationCodeContainer = document.getElementById('verification-code-container');
            const sendCodeContainer = document.getElementById('send-code-container');
            
            if (verificationCodeContainer.classList.contains('hidden') === false) {
                verificationCodeContainer.classList.add('hidden');
                sendCodeContainer.classList.remove('hidden');
            }
        }
    });
    
    passwordAuthBtn.addEventListener('click', () => {
        if (!passwordAuthBtn.classList.contains('active')) {
            // Switch to password authentication
            passwordAuthBtn.classList.add('active');
            codeAuthBtn.classList.remove('active');
            
            passwordAuthSection.classList.remove('hidden');
            codeAuthSection.classList.add('hidden');
            
            // Focus on password field
            setTimeout(() => {
                document.getElementById('password').focus();
            }, 100);
        }
    });
}

/**
 * Initialize code authentication functionality
 */
function initializeCodeAuth() {
    const sendCodeBtn = document.getElementById('send-code-btn');
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    const resendCodeBtn = document.getElementById('resend-code-btn');
    const verificationCodeContainer = document.getElementById('verification-code-container');
    const sendCodeContainer = document.getElementById('send-code-container');
    const verificationCode = document.getElementById('verification-code');
    const maskedEmail = document.getElementById('masked-email');
    
    // Send code button click
    sendCodeBtn.addEventListener('click', () => {
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('email-error');
        
        // Validate email
        if (!validateEmailForCode(emailInput.value)) {
            return;
        }
        
        // Show loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        loadingIndicator.classList.remove('hidden');
        
        // Simulate API call to send code
        setTimeout(() => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            
            // Hide send code button and show verification code input
            sendCodeContainer.classList.add('hidden');
            verificationCodeContainer.classList.remove('hidden');
            
            // Display masked email
            maskedEmail.textContent = maskEmail(emailInput.value);
            
            // Start countdown timer
            startCodeExpiryCountdown();
            
            // Start resend timer
            startResendTimer();
            
            // Focus on verification code input
            setTimeout(() => {
                verificationCode.focus();
            }, 100);
        }, 1500);
    });
    
    // Verify code button click
    verifyCodeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!validateVerificationCode()) {
            return;
        }
        
        // Show loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        loadingIndicator.classList.remove('hidden');
        
        // Simulate API verification
        setTimeout(() => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            
            // Redirect to dashboard
            redirectToDashboard();
        }, 1500);
    });
    
    // Resend code button click
    resendCodeBtn.addEventListener('click', () => {
        if (resendCodeBtn.disabled) {
            return;
        }
        
        // Show loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        loadingIndicator.classList.remove('hidden');
        
        // Simulate API call to resend code
        setTimeout(() => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            
            // Reset verification code input
            verificationCode.value = '';
            
            // Clear error message
            document.getElementById('verification-code-error').textContent = '';
            
            // Start countdown timer again
            startCodeExpiryCountdown();
            
            // Start resend timer again
            startResendTimer();
            
            // Show confirmation message
            showNotification('A new verification code has been sent');
        }, 1500);
    });
    
    // Verification code input enhancements
    verificationCode.addEventListener('input', (e) => {
        // Only allow numbers
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        // Clear error on input
        document.getElementById('verification-code-error').textContent = '';
    });
    
    /**
     * Validates email for sending code
     * @param {string} email - The email to validate
     * @returns {boolean} - Whether the email is valid
     */
    function validateEmailForCode(email) {
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('email-error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            emailError.textContent = 'Email is required';
            emailInput.style.borderColor = 'var(--danger-color)';
            emailInput.classList.add('error-shake');
            
            setTimeout(() => {
                emailInput.classList.remove('error-shake');
            }, 600);
            
            return false;
        }
        
        if (!emailRegex.test(email)) {
            emailError.textContent = 'Please enter a valid email address';
            emailInput.style.borderColor = 'var(--danger-color)';
            emailInput.classList.add('error-shake');
            
            setTimeout(() => {
                emailInput.classList.remove('error-shake');
            }, 600);
            
            return false;
        }
        
        return true;
    }
    
    /**
     * Validates verification code
     * @returns {boolean} - Whether the code is valid
     */
    function validateVerificationCode() {
        const verificationCode = document.getElementById('verification-code');
        const codeError = document.getElementById('verification-code-error');
        
        // Check if code is entered
        if (!verificationCode.value) {
            codeError.textContent = 'Please enter the verification code';
            verificationCode.style.borderColor = 'var(--danger-color)';
            verificationCode.classList.add('error-shake');
            
            setTimeout(() => {
                verificationCode.classList.remove('error-shake');
            }, 600);
            
            return false;
        }
        
        // Check if code is 6 digits
        if (verificationCode.value.length !== 6) {
            codeError.textContent = 'Verification code must be 6 digits';
            verificationCode.style.borderColor = 'var(--danger-color)';
            verificationCode.classList.add('error-shake');
            
            setTimeout(() => {
                verificationCode.classList.remove('error-shake');
            }, 600);
            
            return false;
        }
        
        // For demo purposes, we'll consider code "123456" as valid
        if (verificationCode.value !== '123456') {
            codeError.textContent = 'Invalid verification code';
            verificationCode.style.borderColor = 'var(--danger-color)';
            verificationCode.classList.add('error-shake');
            
            setTimeout(() => {
                verificationCode.classList.remove('error-shake');
            }, 600);
            
            return false;
        }
        
        return true;
    }
    
    /**
     * Masks email for display
     * @param {string} email - The email to mask
     * @returns {string} - The masked email
     */
    function maskEmail(email) {
        const parts = email.split('@');
        if (parts.length !== 2) return email;
        
        const name = parts[0];
        const domain = parts[1];
        
        // Show first character, mask the rest with *
        const maskedName = name.substring(0, 1) + '*'.repeat(Math.max(1, name.length - 2)) + (name.length > 1 ? name.substring(name.length - 1) : '');
        
        return `${maskedName}@${domain}`;
    }
    
    /**
     * Starts countdown timer for code expiry
     */
    function startCodeExpiryCountdown() {
        const countdownTimer = document.getElementById('countdown-timer');
        let minutes = 10;
        let seconds = 0;
        
        // Clear any existing interval
        if (window.countdownInterval) {
            clearInterval(window.countdownInterval);
        }
        
        // Update the countdown every second
        window.countdownInterval = setInterval(() => {
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(window.countdownInterval);
                    countdownTimer.textContent = '00:00';
                    
                    // Show error message
                    document.getElementById('verification-code-error').textContent = 'Code has expired. Please request a new one.';
                    document.getElementById('verification-code').style.borderColor = 'var(--danger-color)';
                    
                    return;
                }
                minutes--;
                seconds = 59;
            } else {
                seconds--;
            }
            
            // Format the time
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
            
            countdownTimer.textContent = `${formattedMinutes}:${formattedSeconds}`;
            
            // Change color if less than 1 minute left
            if (minutes === 0 && seconds <= 59) {
                countdownTimer.style.color = 'var(--warning-color)';
            }
            
            // Change color if less than 10 seconds left
            if (minutes === 0 && seconds <= 10) {
                countdownTimer.style.color = 'var(--danger-color)';
            }
        }, 1000);
    }
    
    /**
     * Starts timer for resend button cooldown
     */
    function startResendTimer() {
        const resendBtn = document.getElementById('resend-code-btn');
        const resendTimer = document.getElementById('resend-timer');
        let cooldown = 60; // Cooldown in seconds
        
        // Disable resend button and show cooldown timer
        resendBtn.disabled = true;
        resendTimer.textContent = `Available in ${cooldown}s`;
        resendTimer.style.display = 'inline';
        
        // Clear any existing interval
        if (window.resendInterval) {
            clearInterval(window.resendInterval);
        }
        
        // Update the cooldown timer every second
        window.resendInterval = setInterval(() => {
            cooldown--;
            
            if (cooldown <= 0) {
                clearInterval(window.resendInterval);
                resendBtn.disabled = false;
                resendTimer.style.display = 'none';
                return;
            }
            
            resendTimer.textContent = `Available in ${cooldown}s`;
        }, 1000);
    }
}

/**
 * Initialize password authentication functionality
 */
function initializePasswordAuth() {
    const passwordAuthForm = document.getElementById('password-auth-form');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('password-error');
    const togglePasswordBtn = document.getElementById('toggle-password-visibility');
    const eyeIcon = togglePasswordBtn.querySelector('.eye-icon');
    const rememberMe = document.getElementById('remember-me');
    
    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle eye icon
        eyeIcon.classList.toggle('visible');
    });
    
    // Form submission
    passwordAuthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validatePasswordForm()) {
            return;
        }
        
        // Show loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        loadingIndicator.classList.remove('hidden');
        
        // Get form data
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const shouldRemember = rememberMe.checked;
        
        // Simulate API login
        setTimeout(() => {
            // For demo purposes, we'll consider specific credentials as valid
            // In a real app, this would be an API call
            if (email === 'demo@curis.health' && password === 'Password123') {
                // Save to localStorage if remember me is checked
                if (shouldRemember) {
                    localStorage.setItem('curis_remembered_email', email);
                } else {
                    localStorage.removeItem('curis_remembered_email');
                }
                
                // Hide loading indicator
                loadingIndicator.classList.add('hidden');
                
                // Redirect to dashboard
                redirectToDashboard();
            } else {
                // Hide loading indicator
                loadingIndicator.classList.add('hidden');
                
                // Show error
                passwordError.textContent = 'Invalid email or password';
                passwordInput.style.borderColor = 'var(--danger-color)';
                passwordInput.classList.add('error-shake');
                
                setTimeout(() => {
                    passwordInput.classList.remove('error-shake');
                }, 600);
            }
        }, 1500);
    });
    
    // Clear error on input
    passwordInput.addEventListener('input', () => {
        passwordError.textContent = '';
        passwordInput.style.borderColor = '';
    });
    
    // Check for remembered email on page load
    const rememberedEmail = localStorage.getItem('curis_remembered_email');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('password-auth-btn').click();
        rememberMe.checked = true;
        
        // Trigger email validation
        const event = new Event('input');
        document.getElementById('email').dispatchEvent(event);
    }
    
    /**
     * Validates password authentication form
     * @returns {boolean} - Whether the form is valid
     */
    function validatePasswordForm() {
        const email = document.getElementById('email');
        const emailError = document.getElementById('email-error');
        let isValid = true;
        
        // Validate email
        if (!email.value) {
            emailError.textContent = 'Email is required';
            email.style.borderColor = 'var(--danger-color)';
            email.classList.add('error-shake');
            
            setTimeout(() => {
                email.classList.remove('error-shake');
            }, 600);
            
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            emailError.textContent = 'Please enter a valid email address';
            email.style.borderColor = 'var(--danger-color)';
            email.classList.add('error-shake');
            
            setTimeout(() => {
                email.classList.remove('error-shake');
            }, 600);
            
            isValid = false;
        }
        
        // Validate password
        if (!passwordInput.value) {
            passwordError.textContent = 'Password is required';
            passwordInput.style.borderColor = 'var(--danger-color)';
            passwordInput.classList.add('error-shake');
            
            setTimeout(() => {
                passwordInput.classList.remove('error-shake');
            }, 600);
            
            isValid = false;
        }
        
        return isValid;
    }
}

/**
 * Initialize modal functionality
 */
function initializeModals() {
    // Get all modals
    const modals = document.querySelectorAll('.modal');
    
    // Get all close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Add event listeners to close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside content
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Close modal with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
    
    // Error modal close button
    const errorModalCloseBtn = document.getElementById('error-modal-close');
    if (errorModalCloseBtn) {
        errorModalCloseBtn.addEventListener('click', () => {
            const errorModal = document.getElementById('error-modal');
            closeModal(errorModal);
        });
    }
    
    // Timeout modal buttons
    const timeoutStayBtn = document.getElementById('timeout-stay-btn');
    const timeoutLogoutBtn = document.getElementById('timeout-logout-btn');
    
    if (timeoutStayBtn) {
        timeoutStayBtn.addEventListener('click', () => {
            // Reset inactivity timer
            resetInactivityTimer();
            
            // Close modal
            const timeoutModal = document.getElementById('timeout-warning-modal');
            closeModal(timeoutModal);
        });
    }
    
    if (timeoutLogoutBtn) {
        timeoutLogoutBtn.addEventListener('click', () => {
            // Redirect to login page (essentially logging out)
            window.location.reload();
        });
    }
}

/**
 * Opens a modal
 * @param {string} modalId - The ID of the modal to open
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Closes a modal
 * @param {HTMLElement} modal - The modal element to close
 */
function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300); // Match transition duration
}

/**
 * Shows an error modal with message
 * @param {string} message - The error message to display
 */
function showErrorModal(message) {
    const errorModal = document.getElementById('error-modal');
    const errorMessage = document.getElementById('error-modal-message');
    
    errorMessage.textContent = message;
    openModal('error-modal');
}

/**
 * Shows a notification in the appropriate format
 * @param {string} message - The notification message
 */
function showNotification(message) {
    // For simplicity, we'll use the error modal for notifications
    // In a production environment, this would be a toast or notification component
    showErrorModal(message);
}

/**
 * Set up forgot password functionality
 */
function setupForgotPassword() {
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const cancelResetBtn = document.getElementById('cancel-reset-btn');
    const sendResetBtn = document.getElementById('send-reset-btn');
    
    // Open forgot password modal
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('forgot-password-modal');
        
        // Pre-fill email if available
        const email = document.getElementById('email').value;
        if (email) {
            document.getElementById('reset-email').value = email;
        }
        
        // Focus on email field
        setTimeout(() => {
            document.getElementById('reset-email').focus();
        }, 300);
    });
    
    // Cancel button
    cancelResetBtn.addEventListener('click', () => {
        closeModal(document.getElementById('forgot-password-modal'));
    });
    
    // Send reset link button
    sendResetBtn.addEventListener('click', () => {
        const resetEmail = document.getElementById('reset-email');
        const resetEmailError = document.getElementById('reset-email-error');
        
        // Validate email
        if (!resetEmail.value) {
            resetEmailError.textContent = 'Email is required';
            resetEmail.style.borderColor = 'var(--danger-color)';
            return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.value)) {
            resetEmailError.textContent = 'Please enter a valid email address';
            resetEmail.style.borderColor = 'var(--danger-color)';
            return;
        }
        
        // Show loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        loadingIndicator.classList.remove('hidden');
        
        // Simulate API call
        setTimeout(() => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            
            // Close modal
            closeModal(document.getElementById('forgot-password-modal'));
            
            // Show success message
            showNotification(`Password reset link has been sent to ${resetEmail.value}`);
        }, 1500);
    });
    
    // Clear error on input
    document.getElementById('reset-email').addEventListener('input', () => {
        document.getElementById('reset-email-error').textContent = '';
        document.getElementById('reset-email').style.borderColor = '';
    });
}

/**
 * Set up session timeout monitoring
 */
function setupSessionTimeoutMonitoring() {
    const inactivityTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const warningTime = 60 * 1000; // 1 minute warning before timeout
    
    let inactivityTimer;
    let warningTimer;
    let warningCountdown;
    
    // Reset inactivity timer on user activity
    const resetOnActivity = () => {
        resetInactivityTimer();
    };
    
    // Add event listeners for user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetOnActivity, false);
    });
    
    // Initial timer setup
    resetInactivityTimer();
    
    /**
     * Resets the inactivity timer
     */
    function resetInactivityTimer() {
        // Clear existing timers
        clearTimeout(inactivityTimer);
        clearTimeout(warningTimer);
        clearInterval(warningCountdown);
        
        // Set new inactivity timer
        inactivityTimer = setTimeout(() => {
            showTimeoutWarning();
        }, inactivityTime - warningTime);
    }
    
    /**
     * Shows the timeout warning modal with countdown
     */
    function showTimeoutWarning() {
        // Open warning modal
        openModal('timeout-warning-modal');
        
        // Set up countdown
        let secondsLeft = warningTime / 1000;
        const countdownElement = document.getElementById('timeout-countdown');
        
        countdownElement.textContent = secondsLeft;
        
        // Update countdown every second
        warningCountdown = setInterval(() => {
            secondsLeft--;
            countdownElement.textContent = secondsLeft;
            
            if (secondsLeft <= 0) {
                clearInterval(warningCountdown);
            }
        }, 1000);
        
        // Set timeout for automatic logout
        warningTimer = setTimeout(() => {
            // Redirect to login page (refresh)
            window.location.reload();
        }, warningTime);
    }
    
    // Add to window for access from other functions
    window.resetInactivityTimer = resetInactivityTimer;
}

/**
 * Set up dark mode toggle
 */
function setupDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    // Check for saved dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Apply dark mode if saved preference exists
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Toggle dark mode on button click
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Update icon
        const isDark = document.body.classList.contains('dark-mode');
        darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        
        // Save preference
        localStorage.setItem('darkMode', isDark);
    });
}

/**
 * Redirects user to dashboard after successful login
 */
function redirectToDashboard() {
    window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Patient\\Dashboard\\dashboard.html';
}
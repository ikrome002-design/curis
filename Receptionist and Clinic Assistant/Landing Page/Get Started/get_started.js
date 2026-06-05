/**
 * Curis by Citrus - Get Started Page JavaScript
 * 
 * This script handles the login and verification flow for the Curis platform
 * based on a secure two-step verification process. It includes:
 * - Email validation and submission
 * - Verification code handling and validation
 * - Session creation and management
 * - UI state transitions
 * - Error handling
 * - Dark mode toggle and persistence
 */

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // ===== DOM ELEMENTS =====
    // Login States
    const loginPage = document.getElementById("login-page");
    const verificationScreen = document.getElementById("verification-screen");
    const loadingState = document.getElementById("loading-state");
    const errorState = document.getElementById("error-state");

    // Forms and Inputs
    const emailForm = document.getElementById("email-form");
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("email-error");
    const userEmailDisplay = document.getElementById("user-email");

    const verificationForm = document.getElementById("verification-form");
    const verificationCode = document.getElementById("verification-code");
    const codeError = document.getElementById("code-error");

    // Buttons
    const sendCodeBtn = document.getElementById("send-code-btn");
    const verifyCodeBtn = document.getElementById("verify-code-btn");
    const resendCodeBtn = document.getElementById("resend-code-btn");
    const changeEmailBtn = document.getElementById("change-email-btn");
    const retryBtn = document.getElementById("retry-btn");

    // Timers
    const countdownTimer = document.getElementById("countdown-timer");
    const resendTimer = document.getElementById("resend-timer");

    // Messages
    const loadingMessage = document.getElementById("loading-message");
    const errorMessage = document.getElementById("error-message");

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    // ===== CONSTANTS =====
    const VERIFICATION_CODE_EXPIRY = 10 * 60; // 10 minutes in seconds
    const RESEND_CODE_COOLDOWN = 60; // 60 seconds
    const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
    const DASHBOARD_PATH = "C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Receptionist and Clinic Assistant\\Dashboard\\dashboard.html";

    // Simulated verification code (in a real app, this would be generated server-side and sent via email)
    let generatedCode = "";
    // Timer references for cleanup
    let expiryTimerInterval;
    let resendTimerInterval;
    let sessionCheckInterval;
    // Track the current UI state
    let currentState = "login";
    // Track the user's email
    let userEmail = "";

    // ===== EVENT LISTENERS =====

    // Email Form Submission
    emailForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = emailInput.value.trim();

        if (validateEmail(email)) {
            setLoadingState(sendCodeBtn, true);
            emailError.textContent = "";

            // Simulate API call to validate email and send verification code
            setTimeout(() => {
                if (simulateEmailValidation(email)) {
                    // Email is valid, proceed to send verification code
                    userEmail = email; // Store the email for later use
                    sendVerificationCode(email);
                } else {
                    // Email validation failed
                    setLoadingState(sendCodeBtn, false);
                    emailError.textContent = "This email is not associated with a Curis account. Please check with your administrator.";
                }
            }, 1500);
        } else {
            emailError.textContent = "Please enter a valid email address";
        }
    });

    // Verification Form Submission
    verificationForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const code = verificationCode.value.trim();

        if (validateVerificationCode(code)) {
            setLoadingState(verifyCodeBtn, true);
            codeError.textContent = "";

            // Simulate API call to validate verification code
            setTimeout(() => {
                if (code === generatedCode) {
                    // Verification code is valid, proceed to session creation
                    createSession();
                } else {
                    // Verification code is invalid
                    setLoadingState(verifyCodeBtn, false);
                    codeError.textContent = "Invalid verification code. Please try again.";

                    // Shake the input to indicate error
                    verificationCode.classList.add('shake');
                    setTimeout(() => {
                        verificationCode.classList.remove('shake');
                    }, 500);
                }
            }, 1500);
        } else {
            codeError.textContent = "Please enter a valid 6-digit code";
        }
    });

    // Resend Code Button
    resendCodeBtn.addEventListener("click", function () {
        if (!resendCodeBtn.disabled) {
            resendVerificationCode();
        }
    });

    // Change Email Button
    changeEmailBtn.addEventListener("click", function () {
        showLoginPage();
    });

    // Retry Button
    retryBtn.addEventListener("click", function () {
        showLoginPage();
    });

    // Real-time Email Validation
    emailInput.addEventListener("input", function () {
        if (emailInput.value.trim() !== "" && !validateEmail(emailInput.value.trim())) {
            emailError.textContent = "Please enter a valid email address";
        } else {
            emailError.textContent = "";
        }
    });

    // Real-time Verification Code Validation
    verificationCode.addEventListener("input", function () {
        // Only allow digits
        verificationCode.value = verificationCode.value.replace(/[^\d]/g, "");

        if (verificationCode.value.length === 6) {
            codeError.textContent = "";
        }
    });

    // Dark Mode Toggle
    darkModeToggle.addEventListener("click", toggleDarkMode);

    // Initialize the UI
    initializeUI();

    // ===== FUNCTIONS =====

    /**
     * Initialize the UI, check for dark mode preference and session
     */
    function initializeUI() {
        // Check for dark mode preference
        const darkModePreference = localStorage.getItem("darkMode");
        if (darkModePreference === "enabled") {
            document.body.classList.add("dark-mode");
        }

        // Check if there's an active session
        if (checkExistingSession()) {
            // If there's a valid session, redirect to dashboard
            redirectToDashboard();
        }

        // Add skip to content link for accessibility
        const skipLink = document.createElement("a");
        skipLink.href = "#login-page";
        skipLink.className = "skip-to-content";
        skipLink.textContent = "Skip to login form";
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add shake animation for invalid inputs
        const shakeStyle = document.createElement('style');
        shakeStyle.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            .shake {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
            }
        `;
        document.head.appendChild(shakeStyle);
    }

    /**
     * Check if there's an existing valid session
     * @returns {boolean} - Whether there's a valid session
     */
    function checkExistingSession() {
        const sessionToken = localStorage.getItem("sessionToken");
        const sessionExpires = localStorage.getItem("sessionExpires");

        if (!sessionToken || !sessionExpires) {
            return false;
        }

        // Check if session has expired
        if (Date.now() > parseInt(sessionExpires)) {
            // Session has expired, clear it
            clearSession();
            return false;
        }

        // Session is valid
        return true;
    }

    /**
     * Toggle between dark and light modes
     */
    function toggleDarkMode() {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
            darkModeToggle.setAttribute("aria-label", "Switch to light mode");
        } else {
            localStorage.setItem("darkMode", "disabled");
            darkModeToggle.setAttribute("aria-label", "Switch to dark mode");
        }
    }

    /**
     * Validate email format
     * @param {string} email - The email to validate
     * @returns {boolean} - Whether the email is valid
     */
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    /**
     * Validate verification code format
     * @param {string} code - The verification code to validate
     * @returns {boolean} - Whether the code is valid
     */
    function validateVerificationCode(code) {
        return /^\d{6}$/.test(code);
    }

    /**
     * Simulate email validation against a server
     * In a real app, this would be an API call
     * @param {string} email - The email to validate
     * @returns {boolean} - Whether the email exists in the system
     */
    function simulateEmailValidation(email) {
        // For demo purposes, we'll accept clinic-related domains
        const validDomains = [
            "clinic.com",
            "hospital.org",
            "health.co.ke",
            "curis.africa",
            "citruslabs.co.ke",
            "gmail.com", // For testing purposes
            "yahoo.com", // For testing purposes
            "outlook.com" // For testing purposes
        ];

        const domain = email.split("@")[1];
        return validDomains.some(validDomain => domain === validDomain);
    }

    /**
     * Set loading state for a button
     * @param {HTMLElement} button - The button to set loading state for
     * @param {boolean} isLoading - Whether the button is loading
     */
    function setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add("loading");
            button.disabled = true;
        } else {
            button.classList.remove("loading");
            button.disabled = false;
        }
    }

    /**
     * Show only the specified state and hide others
     * @param {string} state - The state to show
     */
    function showState(state) {
        // Hide all states
        loginPage.classList.remove("active");
        verificationScreen.classList.remove("active");
        loadingState.classList.remove("active");
        errorState.classList.remove("active");

        // Show the specified state
        switch (state) {
            case "login":
                loginPage.classList.add("active");
                currentState = "login";
                break;
            case "verification":
                verificationScreen.classList.add("active");
                currentState = "verification";
                break;
            case "loading":
                loadingState.classList.add("active");
                currentState = "loading";
                break;
            case "error":
                errorState.classList.add("active");
                currentState = "error";
                break;
        }
    }

    /**
     * Show the login page
     */
    function showLoginPage() {
        // Clear timers
        clearInterval(expiryTimerInterval);
        clearInterval(resendTimerInterval);

        // Reset forms
        emailForm.reset();
        if (verificationForm) verificationForm.reset();
        emailError.textContent = "";
        if (codeError) codeError.textContent = "";

        // Reset buttons
        setLoadingState(sendCodeBtn, false);
        if (verifyCodeBtn) setLoadingState(verifyCodeBtn, false);

        showState("login");
    }

    /**
     * Send a verification code to the provided email
     * @param {string} email - The email to send the code to
     */
    function sendVerificationCode(email) {
        // In a real app, this would be an API call to send the code
        // For demo purposes, we'll generate a random 6-digit code
        generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`Generated verification code: ${generatedCode}`); // For debugging, remove in production

        // Show loading state
        showState("loading");
        loadingMessage.textContent = "Sending verification code...";

        // Simulate API delay
        setTimeout(() => {
            // Display user email
            userEmailDisplay.textContent = email;

            // Reset verification form
            if (verificationForm) verificationForm.reset();
            if (codeError) codeError.textContent = "";

            // Start countdown timer
            startExpiryTimer();

            // Start resend cooldown
            startResendCooldown();

            // Show verification screen
            showState("verification");
            setLoadingState(sendCodeBtn, false);

            // Focus on verification code input
            setTimeout(() => {
                verificationCode.focus();
            }, 300);
        }, 2000);
    }

    /**
     * Resend the verification code
     */
    function resendVerificationCode() {
        // Disable resend button
        resendCodeBtn.disabled = true;

        // Show loading state
        showState("loading");
        loadingMessage.textContent = "Resending verification code...";

        // Generate a new code
        generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`Generated new verification code: ${generatedCode}`); // For debugging, remove in production

        // Simulate API delay
        setTimeout(() => {
            // Reset verification form
            if (verificationForm) verificationForm.reset();
            if (codeError) codeError.textContent = "";

            // Restart countdown timer
            startExpiryTimer();

            // Restart resend cooldown
            startResendCooldown();

            // Show verification screen
            showState("verification");

            // Focus on verification code input
            setTimeout(() => {
                verificationCode.focus();
            }, 300);
        }, 2000);
    }

    /**
     * Start the expiry timer for the verification code
     */
    function startExpiryTimer() {
        // Clear any existing timer
        clearInterval(expiryTimerInterval);

        let timeLeft = VERIFICATION_CODE_EXPIRY;
        updateExpiryTimerDisplay(timeLeft);

        expiryTimerInterval = setInterval(() => {
            timeLeft--;
            updateExpiryTimerDisplay(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(expiryTimerInterval);
                // Show error state for expired code
                showState("error");
                errorMessage.textContent = "Your verification code has expired. Please try again.";
            }
        }, 1000);
    }

    /**
     * Update the expiry timer display
     * @param {number} seconds - The number of seconds left
     */
    function updateExpiryTimerDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        countdownTimer.textContent = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;

        // Add warning color when less than 1 minute remains
        if (seconds < 60) {
            countdownTimer.style.color = '#FFCC00';
        } else {
            countdownTimer.style.color = '';
        }
    }

    /**
     * Start the cooldown for the resend button
     */
    function startResendCooldown() {
        // Clear any existing timer
        clearInterval(resendTimerInterval);

        // Disable resend button
        resendCodeBtn.disabled = true;

        let cooldownLeft = RESEND_CODE_COOLDOWN;
        resendTimer.textContent = cooldownLeft;

        resendTimerInterval = setInterval(() => {
            cooldownLeft--;
            resendTimer.textContent = cooldownLeft;

            if (cooldownLeft <= 0) {
                clearInterval(resendTimerInterval);
                resendCodeBtn.disabled = false;
            }
        }, 1000);
    }

    /**
     * Create a session after successful verification
     */
    function createSession() {
        // Show loading state
        showState("loading");
        loadingMessage.textContent = "Setting up your session...";

        // Simulate session creation delay
        setTimeout(() => {
            try {
                // In a real app, this would create a JWT token and store it
                const sessionToken = generateSessionToken();

                // Store session
                localStorage.setItem("sessionToken", sessionToken);
                localStorage.setItem("sessionEmail", userEmail);
                localStorage.setItem("sessionCreated", Date.now().toString());
                localStorage.setItem("sessionExpires", (Date.now() + SESSION_DURATION).toString());
                localStorage.setItem("sessionRole", "Receptionist / Clinic Assistant");

                // Start session validation check
                startSessionValidation();

                // Redirect to dashboard
                redirectToDashboard();
            } catch (error) {
                console.error("Error creating session:", error);
                showState("error");
                errorMessage.textContent = "There was a problem creating your session. Please try again.";
            }
        }, 2500);
    }

    /**
     * Generate a session token
     * @returns {string} - The generated session token
     */
    function generateSessionToken() {
        // In a real app, this would be a JWT token generated by the server
        // For demo purposes, we'll create a random string
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 64; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    /**
     * Start the session validation check
     */
    function startSessionValidation() {
        // Clear any existing interval
        clearInterval(sessionCheckInterval);

        // Check session validity every 5 minutes
        sessionCheckInterval = setInterval(() => {
            validateSession();
        }, SESSION_CHECK_INTERVAL);
    }

    /**
     * Validate the current session
     * @returns {boolean} - Whether the session is valid
     */
    function validateSession() {
        const sessionToken = localStorage.getItem("sessionToken");
        const sessionExpires = localStorage.getItem("sessionExpires");

        if (!sessionToken || !sessionExpires) {
            return false;
        }

        // Check if session has expired
        if (Date.now() > parseInt(sessionExpires)) {
            // Session has expired
            clearSession();
            return false;
        }

        // In a real app, this would also validate the token with the server
        return true;
    }

    /**
     * Clear the current session
     */
    function clearSession() {
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("sessionEmail");
        localStorage.removeItem("sessionCreated");
        localStorage.removeItem("sessionExpires");
        localStorage.removeItem("sessionRole");
        clearInterval(sessionCheckInterval);
    }

    /**
     * Redirect to the dashboard
     */
    function redirectToDashboard() {
        // Redirect to dashboard page using the provided path
        loadingMessage.textContent = "Redirecting to dashboard...";

        try {
            // In an actual web environment, we would use a relative path or URL
            // Since this is a local file system path, we'll convert to a file URL
            // In a real production environment, this would be a proper URL
            const dashboardPath = "C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Receptionist and Clinic Assistant\\Dashboard\\dashboard.html";

            // For demonstration purposes only - in production this would be a proper URL
            // Note: In a real web app, we wouldn't use a file:// URL or absolute path, 
            // but for this demonstration we're simulating that redirect
            setTimeout(() => {
                window.location.href = dashboardPath;

                // Fallback in case the redirect fails (for demo purposes)
                // In a real application this code wouldn't be reached
                showState("error");
                errorMessage.textContent = "Login successful! Redirecting to dashboard...";
                errorMessage.style.color = "var(--success)";

                // Change error icon to success icon
                const errorIcon = document.querySelector('.error-icon');
                if (errorIcon) {
                    errorIcon.style.backgroundColor = "var(--success)";
                }

                // Change retry button to manual redirect button
                const retryBtn = document.getElementById('retry-btn');
                if (retryBtn) {
                    retryBtn.textContent = "Go to Dashboard";
                    retryBtn.addEventListener('click', function () {
                        window.location.href = dashboardPath;
                    }, { once: true });
                }
            }, 1500);
        } catch (error) {
            console.error("Error redirecting to dashboard:", error);
            showState("error");
            errorMessage.textContent = "Login successful, but there was a problem redirecting you. Please try again.";
        }
    }
});
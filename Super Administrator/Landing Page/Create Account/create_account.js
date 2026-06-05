// ==========================================================
// CURIS SUPER ADMINISTRATOR CREATE ACCOUNT JAVASCRIPT
// Professional, Secure, and Authority-focused Implementation
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {
    // ----------------
    // INITIALIZATION
    // ----------------
    initializeForm();
    initializeEmailValidation();
    initializeCaptcha();
    initializeLegalModals();
    initializeDarkMode();
    initializeFormValidation();
    
    // Global variable for CAPTCHA verification
    let captchaIsVerified = false;
    
    // ----------------
    // FORM INITIALIZATION
    // ----------------
    function initializeForm() {
        const form = document.getElementById('accountCreationForm');
        const createAccountBtn = document.getElementById('createAccountBtn');
        const loadingIndicator = document.getElementById('loadingIndicator');
        
        form.addEventListener('submit', handleFormSubmit);
        
        // Add focus and blur events to all form inputs for dynamic validation
        const formInputs = form.querySelectorAll('input');
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                // Clear error message when user starts typing
                clearFieldError(this);
            });
        });
    }
    
    // ----------------
    // EMAIL VALIDATION
    // ----------------
    function initializeEmailValidation() {
        const emailInput = document.getElementById('workEmail');
        const emailValidationIcon = document.getElementById('emailValidationIcon');
        
        // Set up email domain validation for citruslabs.co.ke
        emailInput.addEventListener('input', function() {
            const email = this.value.trim();
            
            if (email) {
                // Check if email ends with @citruslabs.co.ke
                const isValidCitrusEmail = email.endsWith('@citruslabs.co.ke');
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isValidFormat = emailRegex.test(email);
                
                if (isValidFormat && isValidCitrusEmail) {
                    // Valid email
                    emailValidationIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                    emailValidationIcon.className = 'validation-icon valid';
                    clearFieldError(this);
                } else {
                    // Invalid email
                    emailValidationIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
                    emailValidationIcon.className = 'validation-icon invalid';
                    
                    if (!isValidFormat) {
                        showFieldError(this, 'Please enter a valid email address');
                    } else if (!isValidCitrusEmail) {
                        showFieldError(this, 'Must be a valid Citrus Labs email (@citruslabs.co.ke)');
                    }
                }
            } else {
                emailValidationIcon.className = 'validation-icon';
                emailValidationIcon.innerHTML = '';
            }
        });
    }
    
    // ----------------
    // CAPTCHA IMPLEMENTATION
    // ----------------
    function initializeCaptcha() {
        generateCaptcha();
        
        // Add refresh button for CAPTCHA
        const captchaContainer = document.getElementById('captcha');
        const refreshButton = document.createElement('button');
        refreshButton.type = 'button';
        refreshButton.className = 'captcha-refresh';
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        refreshButton.onclick = generateCaptcha;
        
        captchaContainer.parentNode.insertBefore(refreshButton, captchaContainer.nextSibling);
    }
    
    function generateCaptcha() {
        const captchaContainer = document.getElementById('captcha');
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789';
        let captchaText = '';
        
        for (let i = 0; i < 6; i++) {
            captchaText += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        // Create the CAPTCHA display
        captchaContainer.innerHTML = `
            <div class="captcha-display">
                <canvas id="captchaCanvas" width="200" height="60"></canvas>
            </div>
            <input type="text" id="captchaInput" placeholder="Enter the characters above" required>
            <div id="captchaErrorContainer" class="error-message"></div>
        `;
        
        // Draw CAPTCHA on canvas
        const canvas = document.getElementById('captchaCanvas');
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add noise
        for (let i = 0; i < 30; i++) {
            ctx.strokeStyle = '#ccc';
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }
        
        // Draw text
        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = '#333';
        for (let i = 0; i < captchaText.length; i++) {
            const x = 20 + i * 30;
            const y = 30 + Math.random() * 10;
            const rotation = (Math.random() - 0.5) * 0.4;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillText(captchaText[i], 0, 0);
            ctx.restore();
        }
        
        // Store CAPTCHA value (in a real application, this would be handled server-side)
        captchaContainer.dataset.captchaValue = captchaText;
        
        // Reset CAPTCHA verification state
        captchaIsVerified = false;
        
        // Add verification listener
        const captchaInput = document.getElementById('captchaInput');
        captchaInput.addEventListener('input', function() {
            if (this.value === captchaContainer.dataset.captchaValue) {
                captchaIsVerified = true;
                document.getElementById('captchaErrorContainer').style.display = 'none';
            } else {
                captchaIsVerified = false;
            }
        });
    }
    
    // ----------------
    // LEGAL AGREEMENTS MODAL
    // ----------------
    function initializeLegalModals() {
        // Terms Modal
        setupModal('termsLink', 'termsModal', 'Terms and Conditions content goes here...');
        
        // Privacy Policy Modal
        setupModal('privacyLink', 'privacyModal', 'Privacy Policy content goes here...');
        
        // Data Policy Modal
        setupModal('dataPolicyLink', 'dataPolicyModal', 'Data Policy content goes here...');
    }
    
    function setupModal(linkId, modalId, content) {
        const link = document.getElementById(linkId);
        const modal = document.getElementById(modalId);
        const closeBtn = modal.querySelector('.close-modal');
        const modalBody = modal.querySelector('.modal-body');
        
        // Load content (in a real application, this would fetch from the server)
        modalBody.innerHTML = content;
        
        // Show modal
        link.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
        
        // Close modal
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }
    
    // ----------------
    // DARK MODE TOGGLE
    // ----------------
    function initializeDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const darkModeStored = localStorage.getItem('darkMode');
        
        // Apply saved preference
        if (darkModeStored === 'true') {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            
            this.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }
    
    // ----------------
    // FORM VALIDATION
    // ----------------
    function initializeFormValidation() {
        // Add real-time validation for each field
        setupFieldValidation('firstName', validateName);
        setupFieldValidation('lastName', validateName);
        setupFieldValidation('staffId', validateStaffId);
        setupFieldValidation('jobTitle', validateRequired);
        setupFieldValidation('department', validateRequired);
    }
    
    function setupFieldValidation(fieldId, validationFunction) {
        const field = document.getElementById(fieldId);
        
        field.addEventListener('blur', function() {
            validationFunction(this);
        });
        
        field.addEventListener('input', function() {
            clearFieldError(this);
        });
    }
    
    function validateName(field) {
        const value = field.value.trim();
        if (!value) {
            showFieldError(field, 'This field is required');
            return false;
        }
        
        if (value.length < 2) {
            showFieldError(field, 'Must be at least 2 characters long');
            return false;
        }
        
        if (!/^[a-zA-Z\s-']+$/.test(value)) {
            showFieldError(field, 'Only letters, spaces, hyphens, and apostrophes are allowed');
            return false;
        }
        
        return true;
    }
    
    function validateStaffId(field) {
        const value = field.value.trim();
        if (!value) {
            showFieldError(field, 'This field is required');
            return false;
        }
        
        if (!/^[A-Za-z0-9]+$/.test(value)) {
            showFieldError(field, 'Staff ID must be alphanumeric');
            return false;
        }
        
        return true;
    }
    
    function validateRequired(field) {
        const value = field.value.trim();
        if (!value) {
            showFieldError(field, 'This field is required');
            return false;
        }
        
        return true;
    }
    
    function validateField(field) {
        switch (field.id) {
            case 'firstName':
            case 'lastName':
                return validateName(field);
            case 'staffId':
                return validateStaffId(field);
            case 'workEmail':
                const email = field.value.trim();
                const isValidCitrusEmail = email.endsWith('@citruslabs.co.ke');
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isValidFormat = emailRegex.test(email);
                
                if (!email) {
                    showFieldError(field, 'This field is required');
                    return false;
                }
                
                if (!isValidFormat) {
                    showFieldError(field, 'Please enter a valid email address');
                    return false;
                }
                
                if (!isValidCitrusEmail) {
                    showFieldError(field, 'Must be a valid Citrus Labs email (@citruslabs.co.ke)');
                    return false;
                }
                
                return true;
            case 'jobTitle':
            case 'department':
                return validateRequired(field);
            default:
                return true;
        }
    }
    
    function showFieldError(field, message) {
        const errorElement = document.getElementById(field.id + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        field.classList.add('error');
    }
    
    function clearFieldError(field) {
        const errorElement = document.getElementById(field.id + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
        field.classList.remove('error');
    }
    
    // ----------------
    // FORM SUBMISSION
    // ----------------
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const loadingIndicator = document.getElementById('loadingIndicator');
        const createAccountBtn = document.getElementById('createAccountBtn');
        
        // Perform validation
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Check checkboxes
        const termsAgree = document.getElementById('termsAgree');
        const privacyAgree = document.getElementById('privacyAgree');
        const dataPolicyAgree = document.getElementById('dataPolicyAgree');
        
        if (!termsAgree.checked) {
            showFieldError(termsAgree, 'You must agree to the Terms & Conditions');
            isValid = false;
        }
        
        if (!privacyAgree.checked) {
            showFieldError(privacyAgree, 'You must agree to the Privacy Policy');
            isValid = false;
        }
        
        if (!dataPolicyAgree.checked) {
            showFieldError(dataPolicyAgree, 'You must agree to the Data Policy');
            isValid = false;
        }
        
        // Check CAPTCHA
        if (!captchaIsVerified) {
            const captchaErrorContainer = document.getElementById('captchaErrorContainer');
            captchaErrorContainer.textContent = 'Please complete the CAPTCHA verification';
            captchaErrorContainer.classList.add('show');
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        // Show loading indicator
        loadingIndicator.classList.add('show');
        createAccountBtn.disabled = true;
        
        // Simulate server request (replace with actual API call in production)
        setTimeout(() => {
            // Simulate successful account creation
            loadingIndicator.classList.remove('show');
            createAccountBtn.disabled = false;
            
            // Show success message
            const messageOverlay = document.getElementById('messageOverlay');
            const successMessage = document.getElementById('successMessage');
            const errorMessage = document.getElementById('errorMessage');
            
            messageOverlay.classList.add('show');
            successMessage.classList.add('show');
            errorMessage.classList.remove('show');
            
            // Handle close success button
            document.getElementById('closeSuccessBtn').addEventListener('click', function() {
                messageOverlay.classList.remove('show');
                successMessage.classList.remove('show');
                
                // In a real application, redirect to a waiting page or dashboard after admin approval
                // For now, we'll just reset the form
                form.reset();
                captchaIsVerified = false;
                generateCaptcha();
            });
            
        }, 2000); // Simulate 2-second server request
    }
    
    // ----------------
    // ERROR HANDLING
    // ----------------
    document.getElementById('retryBtn').addEventListener('click', function() {
        const messageOverlay = document.getElementById('messageOverlay');
        const errorMessage = document.getElementById('errorMessage');
        
        messageOverlay.classList.remove('show');
        errorMessage.classList.remove('show');
    });
    
    // ----------------
    // UTILITY FUNCTIONS
    // ----------------
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
    
    // Add custom styles for CAPTCHA refresh button
    const style = document.createElement('style');
    style.textContent = `
        .captcha-refresh {
            background: var(--accent-gradient);
            color: white;
            border: none;
            padding: var(--space-sm) var(--space-md);
            border-radius: var(--radius-md);
            margin-top: var(--space-sm);
            cursor: pointer;
            font-size: 0.875rem;
            transition: all var(--transition-medium);
        }
        
        .captcha-refresh:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 191, 165, 0.2);
        }
        
        .captcha-display {
            margin-bottom: var(--space-md);
        }
        
        #captchaInput {
            width: 100%;
            padding: var(--space-sm);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            margin-bottom: var(--space-sm);
        }
        
        input.error {
            border-color: var(--error-color) !important;
        }
        
        .checkbox-container input[type="checkbox"].error {
            border-color: var(--error-color) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Note: In a real application, after admin approval, you would redirect to the dashboard:
    // window.location.href = "C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Super Administrator\\Dashboard\\dashboard.html";
});
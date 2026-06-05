/* ===================================
   CURIS MY PROFILE - JAVASCRIPT
   Modern Healthcare Platform
   =================================== */

// ===================================
// 1. GLOBAL STATE MANAGEMENT
// ===================================

const ProfileState = {
    currentUser: {
        id: 'self',
        name: 'John Kamau',
        email: 'john.kamau@example.com',
        phone: '+254 700 123 456',
        gender: 'Male',
        dob: '1980-01-15',
        age: 45,
        nationalId: '12345678',
        avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-100-2.png',
        memberSince: 'January 2024',
        lastPasswordChange: 'September 15, 2025'
    },
    dependents: [
        {
            id: 'spouse',
            name: 'Jane Kamau',
            relationship: 'Spouse',
            age: 42,
            gender: 'Female',
            dob: '1983-05-20',
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            accessLevel: 'independent'
        },
        {
            id: 'daughter',
            name: 'Mary Kamau',
            relationship: 'Daughter',
            age: 12,
            gender: 'Female',
            dob: '2013-03-15',
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            accessLevel: 'full'
        },
        {
            id: 'son',
            name: 'David Kamau',
            relationship: 'Son',
            age: 15,
            gender: 'Male',
            dob: '2010-08-10',
            email: 'david.kamau@example.com',
            avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
            accessLevel: 'limited'
        }
    ],
    pendingChanges: {},
    editingField: null,
    otpVerification: {
        active: false,
        type: null,
        code: null,
        newValue: null
    },
    uploadedImage: null,
    cropperInstance: null
};

// ===================================
// 2. UTILITY FUNCTIONS
// ===================================

const Utils = {
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${iconMap[type]}"></i>
            <p>${message}</p>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in-out';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    },

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    calculateAge(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    },

    formatPhoneNumber(phone) {
        // Remove all non-digits
        const digits = phone.replace(/\D/g, '');
        
        // Format as +254 XXX XXX XXX
        if (digits.startsWith('254')) {
            return `+254 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
        } else if (digits.startsWith('0')) {
            return `+254 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
        }
        
        return phone;
    },

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePhone(phone) {
        const digits = phone.replace(/\D/g, '');
        return digits.length === 12 && digits.startsWith('254');
    },

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    getAccessLevel(age) {
        if (age < 13) return 'full';
        if (age >= 13 && age < 18) return 'limited';
        return 'independent';
    },

    debounce(func, wait) {
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
};

// ===================================
// 3. PERSONAL INFORMATION EDITING
// ===================================

function initializePersonalInfoEditing() {
    const editButtons = document.querySelectorAll('.edit-field-btn');
    
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const field = this.getAttribute('data-edit');
            openEditModal(field);
        });
    });
}

function openEditModal(field) {
    ProfileState.editingField = field;
    
    const modalMap = {
        'name': 'editNameModal',
        'email': 'editEmailModal',
        'phone': 'editPhoneModal',
        'gender': 'editGenderModal',
        'dob': 'editDobModal',
        'id': 'editIdModal'
    };
    
    const modalId = modalMap[field];
    if (modalId) {
        // Pre-fill current values
        prefillEditModal(field, modalId);
        Utils.openModal(modalId);
    }
}

function prefillEditModal(field, modalId) {
    const currentValue = ProfileState.currentUser[field === 'id' ? 'nationalId' : field];
    
    switch(field) {
        case 'name':
            document.getElementById('editNameInput').value = currentValue;
            break;
        case 'email':
            document.getElementById('editEmailInput').value = currentValue;
            break;
        case 'phone':
            document.getElementById('editPhoneInput').value = currentValue;
            break;
        case 'gender':
            const genderRadio = document.querySelector(`input[name="gender"][value="${currentValue}"]`);
            if (genderRadio) genderRadio.checked = true;
            break;
        case 'dob':
            document.getElementById('editDobInput').value = currentValue;
            break;
        case 'id':
            document.getElementById('editIdInput').value = currentValue;
            break;
    }
}

function initializeNameEdit() {
    const saveBtn = document.getElementById('saveNameBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const newName = document.getElementById('editNameInput').value.trim();
            
            if (!newName) {
                Utils.showToast('Please enter a valid name', 'error');
                return;
            }
            
            ProfileState.currentUser.name = newName;
            updateProfileDisplay();
            Utils.closeModal('editNameModal');
            Utils.showToast('Name updated successfully', 'success');
        });
    }
}

function initializeEmailEdit() {
    const sendOtpBtn = document.getElementById('sendEmailOtpBtn');
    const verifyBtn = document.getElementById('verifyEmailBtn');
    
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', () => {
            const newEmail = document.getElementById('editEmailInput').value.trim();
            
            if (!Utils.validateEmail(newEmail)) {
                Utils.showToast('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate sending OTP
            const otp = Utils.generateOTP();
            ProfileState.otpVerification = {
                active: true,
                type: 'email',
                code: otp,
                newValue: newEmail
            };
            
            console.log('Email OTP:', otp); // For testing
            
            document.getElementById('emailOtpGroup').style.display = 'block';
            sendOtpBtn.style.display = 'none';
            verifyBtn.style.display = 'inline-flex';
            
            Utils.showToast('Verification code sent to your email', 'info');
        });
    }
    
    if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
            const enteredOtp = document.getElementById('emailOtpInput').value.trim();
            
            if (enteredOtp === ProfileState.otpVerification.code) {
                ProfileState.currentUser.email = ProfileState.otpVerification.newValue;
                updateProfileDisplay();
                resetEmailModal();
                Utils.closeModal('editEmailModal');
                Utils.showToast('Email updated successfully', 'success');
            } else {
                Utils.showToast('Invalid verification code', 'error');
            }
        });
    }
}

function resetEmailModal() {
    document.getElementById('emailOtpGroup').style.display = 'none';
    document.getElementById('sendEmailOtpBtn').style.display = 'inline-flex';
    document.getElementById('verifyEmailBtn').style.display = 'none';
    document.getElementById('emailOtpInput').value = '';
    ProfileState.otpVerification = { active: false, type: null, code: null, newValue: null };
}

function initializePhoneEdit() {
    const phoneInput = document.getElementById('editPhoneInput');
    const sendOtpBtn = document.getElementById('sendPhoneOtpBtn');
    const verifyBtn = document.getElementById('verifyPhoneBtn');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = Utils.formatPhoneNumber(this.value);
        });
    }
    
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', () => {
            const newPhone = phoneInput.value.trim();
            
            if (!Utils.validatePhone(newPhone)) {
                Utils.showToast('Please enter a valid phone number', 'error');
                return;
            }
            
            // Simulate sending OTP
            const otp = Utils.generateOTP();
            ProfileState.otpVerification = {
                active: true,
                type: 'phone',
                code: otp,
                newValue: newPhone
            };
            
            console.log('Phone OTP:', otp); // For testing
            
            document.getElementById('phoneOtpGroup').style.display = 'block';
            sendOtpBtn.style.display = 'none';
            verifyBtn.style.display = 'inline-flex';
            
            Utils.showToast('Verification code sent via SMS', 'info');
        });
    }
    
    if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
            const enteredOtp = document.getElementById('phoneOtpInput').value.trim();
            
            if (enteredOtp === ProfileState.otpVerification.code) {
                ProfileState.currentUser.phone = ProfileState.otpVerification.newValue;
                updateProfileDisplay();
                resetPhoneModal();
                Utils.closeModal('editPhoneModal');
                Utils.showToast('Phone number updated successfully', 'success');
            } else {
                Utils.showToast('Invalid verification code', 'error');
            }
        });
    }
}

function resetPhoneModal() {
    document.getElementById('phoneOtpGroup').style.display = 'none';
    document.getElementById('sendPhoneOtpBtn').style.display = 'inline-flex';
    document.getElementById('verifyPhoneBtn').style.display = 'none';
    document.getElementById('phoneOtpInput').value = '';
    ProfileState.otpVerification = { active: false, type: null, code: null, newValue: null };
}

function initializeGenderEdit() {
    const saveBtn = document.getElementById('saveGenderBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const selectedGender = document.querySelector('input[name="gender"]:checked');
            
            if (!selectedGender) {
                Utils.showToast('Please select a gender', 'error');
                return;
            }
            
            ProfileState.currentUser.gender = selectedGender.value;
            updateProfileDisplay();
            Utils.closeModal('editGenderModal');
            Utils.showToast('Gender updated successfully', 'success');
        });
    }
}

function initializeDobEdit() {
    const dobInput = document.getElementById('editDobInput');
    const saveBtn = document.getElementById('saveDobBtn');
    
    if (dobInput) {
        // Set max date to 18 years ago
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - 18);
        dobInput.max = maxDate.toISOString().split('T')[0];
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const newDob = dobInput.value;
            
            if (!newDob) {
                Utils.showToast('Please select a date of birth', 'error');
                return;
            }
            
            const age = Utils.calculateAge(newDob);
            if (age < 18) {
                Utils.showToast('You must be at least 18 years old', 'error');
                return;
            }
            
            ProfileState.currentUser.dob = newDob;
            ProfileState.currentUser.age = age;
            updateProfileDisplay();
            Utils.closeModal('editDobModal');
            Utils.showToast('Date of birth updated successfully', 'success');
        });
    }
}

function initializeIdEdit() {
    const saveBtn = document.getElementById('saveIdBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const newId = document.getElementById('editIdInput').value.trim();
            
            if (!newId || newId.length < 7) {
                Utils.showToast('Please enter a valid National ID', 'error');
                return;
            }
            
            ProfileState.currentUser.nationalId = newId;
            updateProfileDisplay();
            Utils.closeModal('editIdModal');
            Utils.showToast('National ID updated successfully', 'success');
        });
    }
}

function updateProfileDisplay() {
    // Update header
    document.getElementById('profileNameDisplay').textContent = ProfileState.currentUser.name;
    document.getElementById('profileEmailDisplay').textContent = ProfileState.currentUser.email;
    
    // Update fields
    document.getElementById('fullNameValue').textContent = ProfileState.currentUser.name;
    document.getElementById('emailValue').textContent = ProfileState.currentUser.email;
    document.getElementById('phoneValue').textContent = ProfileState.currentUser.phone;
    document.getElementById('genderValue').textContent = ProfileState.currentUser.gender;
    document.getElementById('dobValue').textContent = `${Utils.formatDate(ProfileState.currentUser.dob)} (${ProfileState.currentUser.age} years)`;
    document.getElementById('idValue').textContent = ProfileState.currentUser.nationalId;
}

// ===================================
// 4. PASSWORD MANAGEMENT
// ===================================

function initializePasswordManagement() {
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const confirmChangeBtn = document.getElementById('confirmChangePasswordBtn');
    const newPasswordInput = document.getElementById('newPassword');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password-btn');
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            Utils.openModal('changePasswordModal');
        });
    }
    
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', Utils.debounce(function() {
            checkPasswordStrength(this.value);
        }, 300));
    }
    
    if (confirmChangeBtn) {
        confirmChangeBtn.addEventListener('click', handlePasswordChange);
    }
    
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

function checkPasswordStrength(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    // Update requirement indicators
    Object.keys(requirements).forEach(req => {
        const element = document.getElementById(`req-${req}`);
        if (element) {
            if (requirements[req]) {
                element.classList.add('valid');
            } else {
                element.classList.remove('valid');
            }
        }
    });
    
    // Calculate strength
    const passed = Object.values(requirements).filter(Boolean).length;
    const strengthFill = document.querySelector('.strength-meter-fill');
    const strengthLabel = document.getElementById('strengthLabel');
    
    if (strengthFill && strengthLabel) {
        strengthFill.className = 'strength-meter-fill';
        
        if (passed <= 2) {
            strengthFill.classList.add('weak');
            strengthLabel.textContent = 'Weak';
        } else if (passed <= 4) {
            strengthFill.classList.add('medium');
            strengthLabel.textContent = 'Medium';
        } else {
            strengthFill.classList.add('strong');
            strengthLabel.textContent = 'Strong';
        }
    }
    
    return passed === 5;
}

function handlePasswordChange() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        Utils.showToast('Please fill in all password fields', 'error');
        return;
    }
    
    if (!checkPasswordStrength(newPassword)) {
        Utils.showToast('Password does not meet all requirements', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        Utils.showToast('Passwords do not match', 'error');
        return;
    }
    
    // Simulate password change
    Utils.closeModal('changePasswordModal');
    Utils.showToast('Password changed successfully', 'success');
    
    // Reset form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    // Update last password change date
    ProfileState.currentUser.lastPasswordChange = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ===================================
// 5. PROFILE PICTURE MANAGEMENT
// ===================================

function initializeProfilePicture() {
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const browseBtn = document.getElementById('browseAvatarBtn');
    const fileInput = document.getElementById('avatarFileInput');
    const uploadArea = document.getElementById('uploadArea');
    const saveAvatarBtn = document.getElementById('saveAvatarBtn');
    
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => {
            Utils.openModal('changeAvatarModal');
        });
    }
    
    if (browseBtn) {
        browseBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--accent-teal)';
            uploadArea.style.backgroundColor = 'var(--gray-100)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '';
            uploadArea.style.backgroundColor = '';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            uploadArea.style.backgroundColor = '';
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageUpload(file);
            } else {
                Utils.showToast('Please upload a valid image file', 'error');
            }
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleImageUpload(file);
            }
        });
    }
    
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', saveProfilePicture);
    }
    
    // Crop controls
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => adjustImageZoom(0.1));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => adjustImageZoom(-0.1));
    if (rotateLeftBtn) rotateLeftBtn.addEventListener('click', () => rotateImage(-90));
    if (rotateRightBtn) rotateRightBtn.addEventListener('click', () => rotateImage(90));
}

function handleImageUpload(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const cropImage = document.getElementById('cropImage');
        cropImage.src = e.target.result;
        
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('cropSection').style.display = 'block';
        document.getElementById('saveAvatarBtn').style.display = 'inline-flex';
        
        ProfileState.uploadedImage = e.target.result;
        updatePreview();
    };
    
    reader.readAsDataURL(file);
}

function adjustImageZoom(delta) {
    const cropImage = document.getElementById('cropImage');
    const currentScale = cropImage.style.transform.match(/scale\(([\d.]+)\)/);
    const scale = currentScale ? parseFloat(currentScale[1]) : 1;
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    
    cropImage.style.transform = `scale(${newScale})`;
    updatePreview();
}

function rotateImage(degrees) {
    const cropImage = document.getElementById('cropImage');
    const currentRotation = cropImage.style.transform.match(/rotate\(([\d-]+)deg\)/);
    const rotation = currentRotation ? parseInt(currentRotation[1]) : 0;
    const newRotation = rotation + degrees;
    
    const scaleMatch = cropImage.style.transform.match(/scale\(([\d.]+)\)/);
    const scale = scaleMatch ? scaleMatch[1] : '1';
    
    cropImage.style.transform = `scale(${scale}) rotate(${newRotation}deg)`;
    updatePreview();
}

function updatePreview() {
    const preview = document.getElementById('avatarPreview');
    const cropImage = document.getElementById('cropImage');
    
    if (preview && cropImage.src) {
        preview.style.backgroundImage = `url(${cropImage.src})`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
    }
}

function saveProfilePicture() {
    // In production, this would upload to server
    const cropImage = document.getElementById('cropImage');
    ProfileState.currentUser.avatar = cropImage.src;
    
    // Update display
    document.getElementById('profileAvatarDisplay').src = cropImage.src;
    
    Utils.closeModal('changeAvatarModal');
    Utils.showToast('Profile picture updated successfully', 'success');
    
    // Reset modal
    setTimeout(() => {
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('cropSection').style.display = 'none';
        document.getElementById('saveAvatarBtn').style.display = 'none';
        document.getElementById('cropImage').src = '';
    }, 300);
}

// ===================================
// 6. FAMILY/DEPENDENT MANAGEMENT
// ===================================

function initializeDependentManagement() {
    const addDependentBtn = document.getElementById('addDependentBtn');
    const saveDependentBtn = document.getElementById('saveDependentBtn');
    const updateDependentBtn = document.getElementById('updateDependentBtn');
    const dependentDobInput = document.getElementById('dependentDob');
    
    if (addDependentBtn) {
        addDependentBtn.addEventListener('click', () => {
            resetDependentForm();
            Utils.openModal('addDependentModal');
        });
    }
    
    if (saveDependentBtn) {
        saveDependentBtn.addEventListener('click', handleAddDependent);
    }
    
    if (updateDependentBtn) {
        updateDependentBtn.addEventListener('click', handleUpdateDependent);
    }
    
    if (dependentDobInput) {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 0); // Can add from birth
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 17); // Max 17 years old
        
        dependentDobInput.max = today.toISOString().split('T')[0];
    }
    
    // Edit dependent buttons
    document.querySelectorAll('.edit-dependent-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-edit-member');
            openEditDependentModal(memberId);
        });
    });
    
    // Remove dependent buttons
    document.querySelectorAll('.remove-dependent-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-remove-member');
            openRemoveDependentModal(memberId);
        });
    });
    
    // Manage teen buttons
    document.querySelectorAll('.manage-teen-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-manage-teen');
            openManageTeenModal(memberId);
        });
    });
}

function resetDependentForm() {
    document.getElementById('dependentName').value = '';
    document.getElementById('dependentDob').value = '';
    document.getElementById('dependentGender').value = '';
    document.getElementById('dependentRelationship').value = '';
}

function handleAddDependent() {
    const name = document.getElementById('dependentName').value.trim();
    const dob = document.getElementById('dependentDob').value;
    const gender = document.getElementById('dependentGender').value;
    const relationship = document.getElementById('dependentRelationship').value;
    
    if (!name || !dob || !gender || !relationship) {
        Utils.showToast('Please fill in all required fields', 'error');
        return;
    }
    
    const age = Utils.calculateAge(dob);
    if (age >= 18) {
        Utils.showToast('Dependents must be under 18 years old', 'error');
        return;
    }
    
    const newDependent = {
        id: `dependent_${Date.now()}`,
        name,
        relationship,
        age,
        gender,
        dob,
        avatar: 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Technical Writings\\Images\\Icons\\icons8-profile-picture-64.png',
        accessLevel: Utils.getAccessLevel(age)
    };
    
    ProfileState.dependents.push(newDependent);
    refreshFamilyDisplay();
    Utils.closeModal('addDependentModal');
    Utils.showToast(`${name} added successfully`, 'success');
}

function openEditDependentModal(memberId) {
    const dependent = ProfileState.dependents.find(d => d.id === memberId);
    if (!dependent) return;
    
    document.getElementById('editDependentName').value = dependent.name;
    document.getElementById('editDependentDob').value = dependent.dob;
    document.getElementById('editDependentGender').value = dependent.gender;
    
    ProfileState.editingDependent = memberId;
    Utils.openModal('editDependentModal');
}

function handleUpdateDependent() {
    const memberId = ProfileState.editingDependent;
    const dependent = ProfileState.dependents.find(d => d.id === memberId);
    
    if (!dependent) return;
    
    const name = document.getElementById('editDependentName').value.trim();
    const dob = document.getElementById('editDependentDob').value;
    const gender = document.getElementById('editDependentGender').value;
    
    if (!name || !dob || !gender) {
        Utils.showToast('Please fill in all fields', 'error');
        return;
    }
    
    dependent.name = name;
    dependent.dob = dob;
    dependent.gender = gender;
    dependent.age = Utils.calculateAge(dob);
    dependent.accessLevel = Utils.getAccessLevel(dependent.age);
    
    refreshFamilyDisplay();
    Utils.closeModal('editDependentModal');
    Utils.showToast('Family member updated successfully', 'success');
}

function openRemoveDependentModal(memberId) {
    const dependent = ProfileState.dependents.find(d => d.id === memberId);
    if (!dependent) return;
    
    document.getElementById('removeDependentName').textContent = dependent.name;
    ProfileState.removingDependent = memberId;
    
    // Check for restrictions
    const restrictions = checkRemovalRestrictions(memberId);
    const restrictionCheck = document.getElementById('restrictionCheck');
    
    if (restrictions.length > 0) {
        restrictionCheck.innerHTML = `
            <div class="warning-notice">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Cannot remove this family member:</strong>
                    <ul>
                        ${restrictions.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        document.getElementById('confirmRemoveDependentBtn').disabled = true;
    } else {
        restrictionCheck.innerHTML = '';
        document.getElementById('confirmRemoveDependentBtn').disabled = false;
    }
    
    Utils.openModal('removeDependentModal');
}

function checkRemovalRestrictions(memberId) {
    const restrictions = [];
    
    // Simulate checking for active appointments
    // In production, this would check against actual data
    const hasActiveAppointments = Math.random() > 0.7;
    const hasOutstandingInvoices = Math.random() > 0.7;
    
    if (hasActiveAppointments) {
        restrictions.push('Has active upcoming appointments');
    }
    
    if (hasOutstandingInvoices) {
        restrictions.push('Has outstanding unpaid invoices');
    }
    
    return restrictions;
}

const confirmRemoveBtn = document.getElementById('confirmRemoveDependentBtn');
if (confirmRemoveBtn) {
    confirmRemoveBtn.addEventListener('click', () => {
        const memberId = ProfileState.removingDependent;
        const index = ProfileState.dependents.findIndex(d => d.id === memberId);
        
        if (index !== -1) {
            const name = ProfileState.dependents[index].name;
            ProfileState.dependents.splice(index, 1);
            refreshFamilyDisplay();
            Utils.closeModal('removeDependentModal');
            Utils.showToast(`${name} removed from family account`, 'success');
        }
    });
}

function openManageTeenModal(memberId) {
    const teen = ProfileState.dependents.find(d => d.id === memberId);
    if (!teen) return;
    
    ProfileState.managingTeen = memberId;
    Utils.openModal('manageTeenModal');
}

function initializeTeenManagement() {
    const updateEmailBtn = document.getElementById('updateTeenEmailBtn');
    const resetPasswordBtn = document.getElementById('resetTeenPasswordBtn');
    
    if (updateEmailBtn) {
        updateEmailBtn.addEventListener('click', () => {
            Utils.showToast('Email update link sent to teen', 'success');
            Utils.closeModal('manageTeenModal');
        });
    }
    
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', () => {
            Utils.showToast('Password reset link sent to teen\'s email', 'success');
            Utils.closeModal('manageTeenModal');
        });
    }
}

function refreshFamilyDisplay() {
    // In production, this would re-render the family members list
    // For now, we'll just show a notification
    Utils.showToast('Family list updated', 'info');
}

// ===================================
// 7. ACCOUNT MANAGEMENT
// ===================================

function initializeAccountManagement() {
    const tempDeactivateBtn = document.getElementById('tempDeactivateBtn');
    const permanentDeleteBtn = document.getElementById('permanentDeleteBtn');
    const confirmTempDeactivateBtn = document.getElementById('confirmTempDeactivateBtn');
    const confirmPermanentDeleteBtn = document.getElementById('confirmPermanentDeleteBtn');
    
    if (tempDeactivateBtn) {
        tempDeactivateBtn.addEventListener('click', () => {
            Utils.openModal('tempDeactivateModal');
        });
    }
    
    if (permanentDeleteBtn) {
        permanentDeleteBtn.addEventListener('click', () => {
            checkDeletionRestrictions();
        });
    }
    
    if (confirmTempDeactivateBtn) {
        confirmTempDeactivateBtn.addEventListener('click', handleTempDeactivation);
    }
    
    if (confirmPermanentDeleteBtn) {
        confirmPermanentDeleteBtn.addEventListener('click', handlePermanentDeletion);
    }
    
    // Monitor deletion confirmation checkboxes
    const deletionCheckboxes = [
        'confirmUnderstand',
        'confirmDataLoss',
        'confirmFamilyImpact'
    ];
    
    deletionCheckboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', updateDeletionButton);
        }
    });
    
    const deletionConfirmText = document.getElementById('deletionConfirmText');
    if (deletionConfirmText) {
        deletionConfirmText.addEventListener('input', updateDeletionButton);
    }
}

function handleTempDeactivation() {
    const password = document.getElementById('tempDeactivatePassword').value;
    
    if (!password) {
        Utils.showToast('Please enter your password', 'error');
        return;
    }
    
    // Simulate deactivation
    Utils.closeModal('tempDeactivateModal');
    Utils.showToast('Account temporarily deactivated', 'warning');
    
    setTimeout(() => {
        Utils.showToast('You can reactivate by logging in again', 'info');
    }, 1000);
}

function checkDeletionRestrictions() {
    const restrictions = [];
    
    // Simulate checking for restrictions
    const hasUpcomingAppointments = Math.random() > 0.8;
    const hasOutstandingPayments = Math.random() > 0.8;
    
    if (hasUpcomingAppointments) {
        restrictions.push('You have upcoming appointments scheduled');
    }
    
    if (hasOutstandingPayments) {
        restrictions.push('You have outstanding unpaid invoices');
    }
    
    const restrictionWarnings = document.getElementById('deletionRestrictions');
    
    if (restrictions.length > 0) {
        restrictionWarnings.innerHTML = `
            <div class="warning-notice">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Please resolve the following before deleting:</strong>
                    <ul>
                        ${restrictions.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    } else {
        restrictionWarnings.innerHTML = '';
    }
    
    Utils.openModal('permanentDeleteModal');
}

function updateDeletionButton() {
    const confirmBtn = document.getElementById('confirmPermanentDeleteBtn');
    
    const checkbox1 = document.getElementById('confirmUnderstand')?.checked;
    const checkbox2 = document.getElementById('confirmDataLoss')?.checked;
    const checkbox3 = document.getElementById('confirmFamilyImpact')?.checked;
    const confirmText = document.getElementById('deletionConfirmText')?.value;
    
    const allChecked = checkbox1 && checkbox2 && checkbox3;
    const textMatches = confirmText === 'DELETE';
    
    if (confirmBtn) {
        confirmBtn.disabled = !(allChecked && textMatches);
    }
}

function handlePermanentDeletion() {
    const password = document.getElementById('deletionPassword').value;
    
    if (!password) {
        Utils.showToast('Please enter your password', 'error');
        return;
    }
    
    // Final confirmation
    const confirmed = confirm('This is your last chance. Are you absolutely sure you want to permanently delete your account? This action CANNOT be undone.');
    
    if (confirmed) {
        Utils.closeModal('permanentDeleteModal');
        Utils.showToast('Account deletion in progress...', 'warning');
        
        setTimeout(() => {
            Utils.showToast('Account permanently deleted', 'error');
            // In production, redirect to landing page
            setTimeout(() => {
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Patient\\Landing Page\\landing_page.html';
            }, 2000);
        }, 2000);
    }
}

// ===================================
// 8. MODAL MANAGEMENT
// ===================================

function initializeModals() {
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

// ===================================
// 9. PROFILE DROPDOWN
// ===================================

function initializeProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isVisible = profileMenu.style.opacity === '1';
            profileMenu.style.opacity = isVisible ? '0' : '1';
            profileMenu.style.visibility = isVisible ? 'hidden' : 'visible';
        });
        
        document.addEventListener('click', function(e) {
            if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.style.opacity = '0';
                profileMenu.style.visibility = 'hidden';
            }
        });
    }
}

// ===================================
// 10. DARK MODE TOGGLE
// ===================================

function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            const icon = this.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                Utils.showToast('Dark mode enabled', 'info');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                Utils.showToast('Light mode enabled', 'info');
            }
        });
    }
}

// ===================================
// 11. ACTIVITY LOG
// ===================================

function initializeActivityLog() {
    const viewFullActivityBtn = document.getElementById('viewFullActivityBtn');
    
    if (viewFullActivityBtn) {
        viewFullActivityBtn.addEventListener('click', () => {
            Utils.showToast('Full activity log feature coming soon', 'info');
        });
    }
}

// ===================================
// 12. KEYBOARD SHORTCUTS
// ===================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            Utils.closeAllModals();
        }
    });
}

// ===================================
// 13. SESSION MANAGEMENT
// ===================================

function initializeSessionManagement() {
    let inactivityTimer;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
    
    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            Utils.showToast('Session expired due to inactivity', 'warning');
            setTimeout(() => {
                window.location.href = 'C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\1.0\\Users\\Patient\\Landing Page\\landing_page.html';
            }, 2000);
        }, INACTIVITY_LIMIT);
    }
    
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer();
}

// ===================================
// 14. ERROR HANDLING
// ===================================

function initializeErrorHandling() {
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        Utils.showToast('An error occurred. Please try again.', 'error');
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        Utils.showToast('An error occurred. Please try again.', 'error');
    });
}

// ===================================
// 15. ANIMATION OBSERVERS
// ===================================

function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.profile-section, .family-member-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease-in-out';
        observer.observe(el);
    });
}

// ===================================
// 16. INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Curis My Profile initializing...');
    
    try {
        // Initialize all components
        initializePersonalInfoEditing();
        initializeNameEdit();
        initializeEmailEdit();
        initializePhoneEdit();
        initializeGenderEdit();
        initializeDobEdit();
        initializeIdEdit();
        initializePasswordManagement();
        initializeProfilePicture();
        initializeDependentManagement();
        initializeTeenManagement();
        initializeAccountManagement();
        initializeModals();
        initializeProfileDropdown();
        initializeDarkMode();
        initializeActivityLog();
        initializeKeyboardShortcuts();
        initializeSessionManagement();
        initializeErrorHandling();
        initializeAnimations();
        
        console.log('Curis My Profile initialized successfully');
        
        setTimeout(() => {
            Utils.showToast('Welcome to your profile!', 'success');
        }, 500);
        
    } catch (error) {
        console.error('Initialization error:', error);
        Utils.showToast('Initialization error. Please refresh the page.', 'error');
    }
});

// ===================================
// 17. WINDOW RESIZE HANDLER
// ===================================

let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // Handle responsive adjustments
        if (window.innerWidth <= 768) {
            // Mobile adjustments
        }
    }, 250);
});

// ===================================
// 18. EXPORT FOR EXTERNAL ACCESS
// ===================================

window.CurisProfile = {
    Utils,
    ProfileState,
    updateProfileDisplay
};
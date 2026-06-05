/**
 * Curis by Citrus - Landing Page JavaScript
 * Provides interactive functionality for the Curis landing page
 */

// Wait for the DOM to be fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initializeHeader();
    initializeNavigation();
    initializeDarkMode();
    initializeAnimations();
    initializeRoiCalculator();
    initializePartnerInfos();
    initializeContactModal();
    initializeTestimonialRatings();
    initializeScrollIndicator();
});

/**
 * Header functionality - Makes the header sticky on scroll
 */
function initializeHeader() {
    const header = document.querySelector('.main-header');
    const headerHeight = header.offsetHeight;

    // Create and add mobile navigation toggle button
    const nav = document.querySelector('.main-nav');
    const headerContainer = document.querySelector('.main-header .container');

    const mobileNavToggle = document.createElement('button');
    mobileNavToggle.classList.add('mobile-nav-toggle');
    mobileNavToggle.setAttribute('aria-label', 'Toggle Navigation Menu');
    mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';

    headerContainer.appendChild(mobileNavToggle);

    // Make header sticky on scroll
    window.addEventListener('scroll', function () {
        if (window.scrollY > headerHeight) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });
}

/**
 * Navigation functionality - Handles mobile menu and smooth scrolling
 */
function initializeNavigation() {
    const nav = document.querySelector('.main-nav');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const header = document.querySelector('.main-header');

    // Toggle mobile navigation menu
    mobileNavToggle.addEventListener('click', function () {
        nav.classList.toggle('active');

        // Change icon based on menu state
        if (nav.classList.contains('active')) {
            mobileNavToggle.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (event) {
        if (!nav.contains(event.target) && !mobileNavToggle.contains(event.target) && nav.classList.contains('active')) {
            nav.classList.remove('active');
            mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.main-nav a, a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Only apply to links that start with #
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                if (targetId === '#') return; // Skip if it's just #

                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    // Close mobile menu if open
                    if (nav.classList.contains('active')) {
                        nav.classList.remove('active');
                        mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }

                    // Calculate scroll position accounting for sticky header
                    const headerOffset = header.offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Highlight active section in navigation
    window.addEventListener('scroll', updateActiveNavLink);
}

/**
 * Updates the active navigation link based on scroll position
 */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a');

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100; // Offset to trigger earlier
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            // Remove active class from all links
            navLinks.forEach(link => {
                link.classList.remove('active');
            });

            // Add active class to corresponding link
            const correspondingLink = document.querySelector(`.main-nav a[href="#${sectionId}"]`);
            if (correspondingLink) {
                correspondingLink.classList.add('active');
            }
        }
    });
}

/**
 * Dark Mode Toggle functionality
 */
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Check if user has previously enabled dark mode
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';

    // Set initial state
    if (isDarkMode) {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Handle dark mode toggle click
    darkModeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
}

/**
 * Animations - Add fade-in animations as elements appear in viewport
 */
function initializeAnimations() {
    // Elements that should animate when scrolled into view
    const animationElements = [
        ...document.querySelectorAll('.hero-section h1, .hero-section .tagline, .hero-section .btn'),
        ...document.querySelectorAll('section h2'),
        ...document.querySelectorAll('.value-prop-item, .feature-item, .step, .testimonial-item, .pricing-feature, .partner-item, .cta-option')
    ];

    // Add numbered fade-in classes for sequential animation
    animationElements.forEach((el, index) => {
        const delay = index % 5;
        el.classList.add(`fade-in-${delay + 1}`);
    });

    // Create IntersectionObserver for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animation elements
    animationElements.forEach(el => {
        observer.observe(el);
    });
}

/**
 * ROI Calculator functionality
 */
function initializeRoiCalculator() {
    const roiCalculator = document.querySelector('.roi-calculator');

    if (roiCalculator) {
        roiCalculator.innerHTML = `
            <h3><i class="fas fa-calculator"></i> ROI Calculator</h3>
            <p>See how much time and money your clinic can save with Curis</p>
            
            <div class="calculator-tabs">
                <button id="feeCalcTab" class="calc-tab active">Service Fee</button>
                <button id="roiCalcTab" class="calc-tab">ROI Calculator</button>
            </div>
            
            <div id="feeCalculator" class="calculator-content">
                <form id="feeCalculatorForm" class="calculator-form">
                    <div class="form-group">
                        <label for="monthlyRevenue">Estimated monthly revenue (KSh)</label>
                        <input type="number" id="monthlyRevenue" name="monthlyRevenue" min="1000" value="100000">
                    </div>
                    
                    <div class="form-group">
                        <label for="averageInvoice">Average invoice amount (KSh)</label>
                        <input type="number" id="averageInvoice" name="averageInvoice" min="500" value="2000">
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Calculate Service Fees</button>
                </form>
                
                <div id="feeResult" class="calculator-result"></div>
            </div>
            
            <div id="roiCalculator" class="calculator-content" style="display: none;">
                <form id="roiCalculatorForm" class="calculator-form">
                    <div class="form-group">
                        <label for="patientsPerDay">Average patients per day</label>
                        <input type="number" id="patientsPerDay" name="patientsPerDay" min="1" value="20">
                    </div>
                    
                    <div class="form-group">
                        <label for="timePerPatient">Minutes spent on administration per patient</label>
                        <input type="number" id="timePerPatient" name="timePerPatient" min="1" value="15">
                    </div>
                    
                    <div class="form-group">
                        <label for="staffHourlyRate">Average staff hourly rate (KSh)</label>
                        <input type="number" id="staffHourlyRate" name="staffHourlyRate" min="100" value="500">
                    </div>
                    
                    <div class="form-group">
                        <label for="workingDays">Working days per month</label>
                        <input type="number" id="workingDays" name="workingDays" min="1" max="31" value="22">
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Calculate Savings</button>
                </form>
                
                <div id="roiResult" class="calculator-result"></div>
            </div>
        `;

        // Tab switching functionality
        const feeCalcTab = document.getElementById('feeCalcTab');
        const roiCalcTab = document.getElementById('roiCalcTab');
        const feeCalculator = document.getElementById('feeCalculator');
        const roiCalculator = document.getElementById('roiCalculator');

        feeCalcTab.addEventListener('click', function () {
            feeCalcTab.classList.add('active');
            roiCalcTab.classList.remove('active');
            feeCalculator.style.display = 'block';
            roiCalculator.style.display = 'none';
        });

        roiCalcTab.addEventListener('click', function () {
            roiCalcTab.classList.add('active');
            feeCalcTab.classList.remove('active');
            roiCalculator.style.display = 'block';
            feeCalculator.style.display = 'none';
        });

        // Fee Calculator functionality
        const feeForm = document.getElementById('feeCalculatorForm');
        const feeResult = document.getElementById('feeResult');

        feeForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get input values
            const monthlyRevenue = parseFloat(document.getElementById('monthlyRevenue').value);
            const averageInvoice = parseFloat(document.getElementById('averageInvoice').value);

            // Calculate service fees
            const serviceFeeRate = 0.15; // 15%
            const monthlyServiceFee = monthlyRevenue * serviceFeeRate;
            const invoiceCount = Math.round(monthlyRevenue / averageInvoice);
            const feePerInvoice = averageInvoice * serviceFeeRate;

            // Display results
            feeResult.innerHTML = `
                <div class="result-header">Your Estimated Monthly Service Fees</div>
                <div class="result-details">
                    <div class="result-row">
                        <div class="result-label">Monthly Revenue:</div>
                        <div class="result-value">KSh ${monthlyRevenue.toLocaleString()}</div>
                    </div>
                    <div class="result-row">
                        <div class="result-label">Estimated Invoices:</div>
                        <div class="result-value">${invoiceCount} invoices</div>
                    </div>
                    <div class="result-row">
                        <div class="result-label">Service Fee per Invoice:</div>
                        <div class="result-value">KSh ${feePerInvoice.toLocaleString()} (15%)</div>
                    </div>
                    <div class="result-row total">
                        <div class="result-label">Total Monthly Service Fee:</div>
                        <div class="result-value">KSh ${monthlyServiceFee.toLocaleString()}</div>
                    </div>
                </div>
                <div class="result-note">While traditional EMR systems charge monthly subscriptions regardless of your revenue, with Curis you only pay when you earn.</div>
                <div class="result-cta">
                    <a href="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Clinic Owner\\Landing Page\\Get Started\\get_started.html" class="btn btn-primary">Get Started For Free</a>
                </div>
            `;

            feeResult.style.display = 'block';
        });

        // ROI Calculator functionality
        const roiForm = document.getElementById('roiCalculatorForm');
        const roiResult = document.getElementById('roiResult');

        roiForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get input values
            const patientsPerDay = parseInt(document.getElementById('patientsPerDay').value);
            const timePerPatient = parseInt(document.getElementById('timePerPatient').value);
            const staffHourlyRate = parseInt(document.getElementById('staffHourlyRate').value);
            const workingDays = parseInt(document.getElementById('workingDays').value);

            // Calculate savings
            const minutesPerMonth = patientsPerDay * timePerPatient * workingDays;
            const hoursPerMonth = minutesPerMonth / 60;
            const currentCost = hoursPerMonth * staffHourlyRate;

            // Assume Curis reduces admin time by 60%
            const savingsRate = 0.6;
            const savingsAmount = currentCost * savingsRate;
            const savingsHours = hoursPerMonth * savingsRate;

            // Display results
            roiResult.innerHTML = `
                <div class="result-header">Your Estimated Monthly Savings</div>
                <div class="result-amount">KSh ${savingsAmount.toLocaleString()}</div>
                <div class="result-hours">${savingsHours.toFixed(1)} hours saved each month</div>
                <div class="result-note">This is an estimate based on industry averages. Actual results may vary.</div>
                <div class="result-cta">
                    <a href="C:\\Users\\nderu\\Documents\\Development\\Product\\Curis\\Users\\Clinic Owner\\Landing Page\\Get Started\\get_started.html" class="btn btn-primary">Get Started For Free</a>
                </div>
            `;

            roiResult.style.display = 'block';
        });
    }
}

/**
 * Add detailed information to partner integration sections
 */
function initializePartnerInfos() {
    const partnerItems = document.querySelectorAll('.partner-item');

    partnerItems.forEach(item => {
        // Create partner info element that shows on hover
        const partnerInfo = document.createElement('div');
        partnerInfo.className = 'partner-info';

        // Determine which partner this is and add relevant content
        const partnerTitle = item.querySelector('h3').textContent.toLowerCase();

        if (partnerTitle.includes('mpesa')) {
            partnerInfo.innerHTML = `
                <p>Accept payments directly through MPesa integration.</p>
                <ul>
                    <li>Instant payment confirmation</li>
                    <li>Automated receipts</li>
                    <li>Transaction history</li>
                </ul>
            `;
        } else if (partnerTitle.includes('nhif')) {
            partnerInfo.innerHTML = `
                <p>Streamline NHIF claims and verification.</p>
                <ul>
                    <li>Patient cover verification</li>
                    <li>Digital claim submission</li>
                    <li>Approval tracking</li>
                </ul>
            `;
        } else if (partnerTitle.includes('lab')) {
            partnerInfo.innerHTML = `
                <p>Connect with lab systems for seamless workflows.</p>
                <ul>
                    <li>Test ordering</li>
                    <li>Result integration</li>
                    <li>Sample tracking</li>
                </ul>
            `;
        }

        // Add the info to the partner item
        item.appendChild(partnerInfo);

        // Show/hide partner info on hover
        item.addEventListener('mouseenter', function () {
            partnerInfo.style.display = 'flex';
        });

        item.addEventListener('mouseleave', function () {
            partnerInfo.style.display = 'none';
        });
    });
}

/**
 * Initialize contact modal for "Talk to Sales" button
 */
function initializeContactModal() {
    // Find the Talk to Sales button
    const contactSalesBtn = document.querySelector('.cta-option a[href="#"]');

    if (contactSalesBtn) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'contact-modal';
        modal.id = 'contactModal';
        modal.style.display = 'none';

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Talk to Sales</h3>
                <p>Fill out the form below and our team will get in touch with you shortly.</p>
                
                <form id="contactForm" class="contact-form">
                    <div class="form-group">
                        <label for="fullName">Full Name*</label>
                        <input type="text" id="fullName" name="fullName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="clinicName">Clinic Name*</label>
                        <input type="text" id="clinicName" name="clinicName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Address*</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Phone Number*</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="message">How can we help you?</label>
                        <textarea id="message" name="message" rows="4"></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Submit</button>
                </form>
                
                <div id="formSuccess" class="form-success" style="display: none;">
                    <i class="fas fa-check-circle"></i>
                    <h4>Thank you for reaching out!</h4>
                    <p>We've received your information and will be in touch within 24 hours.</p>
                </div>
            </div>
        `;

        // Add modal to the page
        document.body.appendChild(modal);

        // Open modal when clicking the button
        contactSalesBtn.addEventListener('click', function (e) {
            e.preventDefault();
            modal.style.display = 'flex';
        });

        // Close modal when clicking X
        const closeModal = modal.querySelector('.close-modal');
        closeModal.addEventListener('click', function () {
            modal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Form submission handling
        const contactForm = document.getElementById('contactForm');
        const formSuccess = document.getElementById('formSuccess');

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Basic form validation
            const fullName = document.getElementById('fullName').value.trim();
            const clinicName = document.getElementById('clinicName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();

            if (!fullName || !clinicName || !email || !phone) {
                alert('Please fill out all required fields.');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Validate phone number (simple validation)
            const phoneRegex = /^\+?[0-9\s\-()]{9,20}$/;
            if (!phoneRegex.test(phone)) {
                alert('Please enter a valid phone number.');
                return;
            }

            // If validation passes, show success message
            contactForm.style.display = 'none';
            formSuccess.style.display = 'block';

            // Reset form (but don't show it again immediately)
            setTimeout(function () {
                contactForm.reset();
                // Could close modal automatically after delay
                // modal.style.display = 'none';
                // formSuccess.style.display = 'none';
                // contactForm.style.display = 'block';
            }, 500);
        });
    }
}

/**
 * Add star ratings to testimonials
 */
function initializeTestimonialRatings() {
    const testimonialItems = document.querySelectorAll('.testimonial-item');

    testimonialItems.forEach(item => {
        // Create rating element
        const ratingElement = document.createElement('div');
        ratingElement.className = 'testimonial-rating';

        // Generate a random rating between 4.5 and 5 stars
        const rating = Math.random() * (5 - 4.5) + 4.5;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;

        // Create star HTML
        let starsHTML = '';
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                starsHTML += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }

        ratingElement.innerHTML = starsHTML;

        // Add the rating element after the content but before the author
        const testimonialContent = item.querySelector('.testimonial-content');
        testimonialContent.insertAdjacentElement('afterend', ratingElement);
    });
}

/**
 * Add scroll indicator to hero section
 */
function initializeScrollIndicator() {
    const heroSection = document.querySelector('.hero-section');

    if (heroSection) {
        // Create scroll indicator element
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-down-indicator';
        scrollIndicator.innerHTML = '<i class="fas fa-chevron-down"></i>';
        heroSection.appendChild(scrollIndicator);

        // Scroll to About section when clicked
        scrollIndicator.addEventListener('click', function () {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const aboutPosition = aboutSection.getBoundingClientRect().top;
                const offsetPosition = aboutPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}
// ====================================
// CURIS INSIGHTS & PERFORMANCE - COMPREHENSIVE JAVASCRIPT
// Modern Healthcare Analytics Dashboard Functionality
// ====================================

// ====================================
// GLOBAL VARIABLES & CONFIGURATION
// ====================================
const InsightsPerformance = {
    // Chart instances
    charts: {
        bookingTrends: null,
        utilization: null,
        retentionPie: null,
        correlationScatter: null,
        serviceBreakdown: null,
        revenueTrends: null,
        serviceDistribution: null,
        staffPerformance: null,
        efficiencyTrend: null
    },
    
    // Current state
    state: {
        currentTimeframe: 'weekly',
        currentTab: 'retention',
        currentComparison: 'month',
        selectedFilters: {
            dateRange: { start: null, end: null },
            staff: [],
            services: [],
            patientType: 'all'
        },
        exportWizardStep: 1
    },
    
    // Mock data for demonstration
    mockData: {
        financialMetrics: {
            totalIncome: 2450000,
            serviceCharges: 122500,
            outstanding: 185750,
            serviceCategories: 8
        },
        appointments: {
            total: 810,
            completed: 645,
            cancelled: 67,
            rescheduled: 98,
            noShows: 46
        },
        staffMetrics: {
            avgRating: 4.7,
            avgResponseTime: 2.3
        }
    }
};

// ====================================
// INITIALIZATION
// ====================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize navigation elements
    initializeNavigation();
    
    // Initialize header controls
    initializeHeaderControls();
    
    // Initialize financial reports
    initializeFinancialReports();
    
    // Initialize appointment analytics
    initializeAppointmentAnalytics();
    
    // Initialize service performance
    initializeServicePerformance();
    
    // Initialize staff efficiency
    initializeStaffEfficiency();
    
    // Initialize visual dashboards
    initializeVisualDashboards();
    
    // Initialize export functionality
    initializeExportFunctionality();
    
    // Initialize modals
    initializeModals();
    
    // Initialize charts
    initializeAllCharts();
    
    // Initialize auto-refresh
    initializeAutoRefresh();
    
    // Set initial focus for accessibility
    document.querySelector('.widget-title').focus();
}

let dropdownVisible = false;

document.getElementById("userProfileBtn").addEventListener("click", function () {
    const dropdown = document.getElementById("userDropdown");

    if (!dropdownVisible) {
        dropdown.style.display = "block";
        dropdownVisible = true;
    } else {
        // Redirect to My Profile
        window.location.href = "file:///C:/Users/nderu/Documents/Development/Product/Curis/Users/Clinic%20Owner/My%20Profile/my_profile.html";
    }
});

// ====================================
// NAVIGATION & UI CONTROLS
// ====================================
function initializeNavigation() {
    // Mobile sidebar toggle
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
    
    // Add mobile menu button to header on small screens
    if (window.innerWidth <= 768) {
        document.querySelector('.header-left').prepend(mobileMenuBtn);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-btn')) {
            document.querySelector('.header-left').prepend(mobileMenuBtn);
        } else if (window.innerWidth > 768 && document.querySelector('.mobile-menu-btn')) {
            document.querySelector('.mobile-menu-btn').remove();
        }
    });
}

function initializeHeaderControls() {
    // User profile dropdown
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    userProfileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });
    
    // Notifications
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationsPanel = document.getElementById('notificationsPanel');
    
    notificationBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        notificationsPanel.classList.toggle('show');
        
        // Mark notifications as read
        if (notificationsPanel.classList.contains('show')) {
            setTimeout(() => {
                document.querySelectorAll('.notification-item.unread').forEach(item => {
                    item.classList.remove('unread');
                });
                updateNotificationBadge();
            }, 2000);
        }
    });
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode-enabled');
        const isDarkMode = document.body.classList.contains('dark-mode-enabled');
        localStorage.setItem('darkMode', isDarkMode);
        
        // Update icon
        this.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        userDropdown.classList.remove('show');
        notificationsPanel.classList.remove('show');
    });
}

// ====================================
// FINANCIAL PERFORMANCE REPORTS
// ====================================
function initializeFinancialReports() {
    // Income Overview Card
    const incomeOverviewCard = document.getElementById('incomeOverviewCard');
    const incomeOverviewModal = document.getElementById('incomeOverviewModal');
    const closeIncomeModal = document.getElementById('closeIncomeModal');
    
    incomeOverviewCard.addEventListener('click', function() {
        incomeOverviewModal.classList.add('show');
        initializeServiceBreakdownChart();
    });
    
    closeIncomeModal.addEventListener('click', function() {
        incomeOverviewModal.classList.remove('show');
    });
    
    // Service Charge Card
    const serviceChargeCard = document.getElementById('serviceChargeCard');
    serviceChargeCard.addEventListener('click', function() {
        showDeductionDetails();
    });
    
    // Outstanding Card
    const outstandingCard = document.getElementById('outstandingCard');
    outstandingCard.addEventListener('click', function() {
        showOutstandingDetails();
    });
    
    // Revenue by Service Card
    const revenueByServiceCard = document.getElementById('revenueByServiceCard');
    revenueByServiceCard.addEventListener('click', function() {
        showServiceRevenueModal();
    });
    
    // Download Reports Button
    const downloadReportsBtn = document.getElementById('downloadReportsBtn');
    downloadReportsBtn.addEventListener('click', function() {
        document.getElementById('exportConfigModal').classList.add('show');
    });
    
    // Timeframe buttons in Income Modal
    const timeframeBtns = document.querySelectorAll('.timeframe-btn');
    timeframeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            timeframeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const period = this.dataset.period;
            updateIncomeAnalysis(period);
        });
    });
}

// ====================================
// APPOINTMENT ANALYTICS
// ====================================
function initializeAppointmentAnalytics() {
    // Analytics timeframe selector
    const analyticsTimeframe = document.getElementById('analyticsTimeframe');
    analyticsTimeframe.addEventListener('change', function() {
        InsightsPerformance.state.currentTimeframe = this.value;
        updateAppointmentAnalytics(this.value);
    });
    
    // Analytics cards click handlers
    const bookingTrendsCard = document.getElementById('bookingTrendsCard');
    bookingTrendsCard.addEventListener('click', function() {
        showBookingTrendsModal();
    });
    
    const cancellationMetricsCard = document.getElementById('cancellationMetricsCard');
    cancellationMetricsCard.addEventListener('click', function() {
        showCancellationModal();
    });
    
    const noShowAnalysisCard = document.getElementById('noShowAnalysisCard');
    noShowAnalysisCard.addEventListener('click', function() {
        showNoShowModal();
    });
    
    const utilizationRateCard = document.getElementById('utilizationRateCard');
    utilizationRateCard.addEventListener('click', function() {
        showUtilizationModal();
    });
}

// ====================================
// SERVICE PERFORMANCE
// ====================================
function initializeServicePerformance() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Update button states
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update content visibility
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${targetTab}Tab`).classList.add('active');
            
            // Update state
            InsightsPerformance.state.currentTab = targetTab;
            
            // Initialize tab-specific content
            if (targetTab === 'retention') {
                updateRetentionChart();
            } else if (targetTab === 'utilization') {
                updateServiceUtilization();
            } else if (targetTab === 'correlation') {
                updateCorrelationAnalysis();
            }
        });
    });
    
    // Service Analysis Button
    const serviceAnalysisBtn = document.getElementById('serviceAnalysisBtn');
    serviceAnalysisBtn.addEventListener('click', function() {
        showServiceAnalysisModal();
    });
}

// ====================================
// STAFF EFFICIENCY METRICS
// ====================================
function initializeStaffEfficiency() {
    // Staff Analysis Button
    const staffAnalysisBtn = document.getElementById('staffAnalysisBtn');
    staffAnalysisBtn.addEventListener('click', function() {
        showStaffAnalysisModal();
    });
    
    // Initialize efficiency trend chart
    setTimeout(() => {
        initializeEfficiencyTrendChart();
    }, 1000);
}

// ====================================
// VISUAL DASHBOARDS
// ====================================
function initializeVisualDashboards() {
    // Chart Configuration
    const chartConfigBtn = document.getElementById('chartConfigBtn');
    const chartConfigPanel = document.getElementById('chartConfigPanel');
    
    chartConfigBtn.addEventListener('click', function() {
        chartConfigPanel.classList.toggle('show');
        filterToolsPanel.classList.remove('show');
    });
    
    // Filter Tools
    const filterToolsBtn = document.getElementById('filterToolsBtn');
    const filterToolsPanel = document.getElementById('filterToolsPanel');
    
    filterToolsBtn.addEventListener('click', function() {
        filterToolsPanel.classList.toggle('show');
        chartConfigPanel.classList.remove('show');
    });
    
    // Chart type selection
    const chartOptions = document.querySelectorAll('.chart-option');
    chartOptions.forEach(option => {
        option.addEventListener('click', function() {
            chartOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            const chartType = this.dataset.chart;
            updateChartTypes(chartType);
        });
    });
    
    // Date range quick buttons
    const rangeBtns = document.querySelectorAll('.range-btn');
    rangeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const days = parseInt(this.dataset.range);
            setDateRange(days);
        });
    });
    
    // Filter checkboxes
    const filterCheckboxes = document.querySelectorAll('.checkbox-item input');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateFilteredData();
        });
    });
    
    // Patient segmentation
    const patientTypeRadios = document.querySelectorAll('input[name="patientType"]');
    patientTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            InsightsPerformance.state.selectedFilters.patientType = this.value;
            updateFilteredData();
        });
    });
    
    // Comparison button
    const compareBtn = document.getElementById('compareBtn');
    const comparativeAnalysis = document.getElementById('comparativeAnalysis');
    
    compareBtn.addEventListener('click', function() {
        comparativeAnalysis.classList.toggle('show');
    });
    
    // Comparison options
    const comparisonBtns = document.querySelectorAll('.comparison-btn');
    comparisonBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            comparisonBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const comparison = this.dataset.comparison;
            InsightsPerformance.state.currentComparison = comparison;
            updateComparisonAnalysis(comparison);
        });
    });
}

// ====================================
// EXPORT FUNCTIONALITY
// ====================================
function initializeExportFunctionality() {
    // Export Configuration Button
    const exportConfigBtn = document.getElementById('exportConfigBtn');
    const exportConfigModal = document.getElementById('exportConfigModal');
    const closeExportModal = document.getElementById('closeExportModal');
    
    exportConfigBtn.addEventListener('click', function() {
        exportConfigModal.classList.add('show');
        resetExportWizard();
    });
    
    closeExportModal.addEventListener('click', function() {
        exportConfigModal.classList.remove('show');
    });
    
    // Export wizard navigation
    const wizardPrevBtn = document.getElementById('wizardPrevBtn');
    const wizardNextBtn = document.getElementById('wizardNextBtn');
    
    wizardPrevBtn.addEventListener('click', function() {
        if (InsightsPerformance.state.exportWizardStep > 1) {
            InsightsPerformance.state.exportWizardStep--;
            updateExportWizard();
        }
    });
    
    wizardNextBtn.addEventListener('click', function() {
        if (InsightsPerformance.state.exportWizardStep < 3) {
            InsightsPerformance.state.exportWizardStep++;
            updateExportWizard();
        } else {
            generateExport();
        }
    });
    
    // Quick date buttons in export modal
    const quickDateBtns = document.querySelectorAll('.quick-date-btn');
    quickDateBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const days = parseInt(this.dataset.range);
            setExportDateRange(days);
        });
    });
    
    // Format cards
    const formatCards = document.querySelectorAll('.format-card:not(.future-feature)');
    formatCards.forEach(card => {
        card.addEventListener('click', function() {
            const format = this.dataset.format;
            generateQuickExport(format);
        });
    });
    
    // Export action buttons
    const downloadBtns = document.querySelectorAll('.action-btn.download');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            downloadExport(this.closest('.export-item'));
        });
    });
    
    const shareBtns = document.querySelectorAll('.action-btn.share');
    shareBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            shareExport(this.closest('.export-item'));
        });
    });
}

// ====================================
// MODAL HANDLERS
// ====================================
function initializeModals() {
    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
    
    // ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => modal.classList.remove('show'));
        }
    });
}

// ====================================
// CHART INITIALIZATION
// ====================================
function initializeAllCharts() {
    // Initialize all charts with loading state
    setTimeout(() => {
        initializeBookingTrendsChart();
        initializeUtilizationChart();
        initializeRetentionPieChart();
        initializeRevenueTrendsChart();
        initializeServiceDistributionChart();
        initializeStaffPerformanceChart();
    }, 500);
}

function initializeBookingTrendsChart() {
    const ctx = document.getElementById('bookingTrendsChart');
    if (!ctx) return;
    
    // Destroy existing chart if any
    if (InsightsPerformance.charts.bookingTrends) {
        InsightsPerformance.charts.bookingTrends.destroy();
    }
    
    InsightsPerformance.charts.bookingTrends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: generateDateLabels(7),
            datasets: [{
                label: 'Bookings',
                data: generateRandomData(7, 20, 50),
                borderColor: '#00BFA5',
                backgroundColor: 'rgba(0, 191, 165, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1D2A3B',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

function initializeUtilizationChart() {
    const ctx = document.getElementById('utilizationChart');
    if (!ctx) return;
    
    if (InsightsPerformance.charts.utilization) {
        InsightsPerformance.charts.utilization.destroy();
    }
    
    InsightsPerformance.charts.utilization = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Booked', 'Available'],
            datasets: [{
                data: [82.4, 17.6],
                backgroundColor: ['#00BFA5', '#E5E7EB'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1D2A3B',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

function initializeRetentionPieChart() {
    const ctx = document.getElementById('retentionPieChart');
    if (!ctx) return;
    
    if (InsightsPerformance.charts.retentionPie) {
        InsightsPerformance.charts.retentionPie.destroy();
    }
    
    InsightsPerformance.charts.retentionPie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['New Patients', 'Returning Patients'],
            datasets: [{
                data: [25.2, 74.8],
                backgroundColor: ['#FF6B35', '#00BFA5'],
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1D2A3B',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

function initializeServiceBreakdownChart() {
    const ctx = document.getElementById('serviceBreakdownChart');
    if (!ctx) return;
    
    if (InsightsPerformance.charts.serviceBreakdown) {
        InsightsPerformance.charts.serviceBreakdown.destroy();
    }
    
    InsightsPerformance.charts.serviceBreakdown = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['General Consultation', 'Lab Tests', 'Specialist', 'Procedures', 'Immunizations'],
            datasets: [{
                label: 'Revenue (KES)',
                data: [890000, 578000, 465000, 320000, 197000],
                backgroundColor: '#00BFA5',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1D2A3B',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return 'Revenue: KES ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'KES ' + (value / 1000) + 'K';
                        }
                    }
                }
            }
        }
    });
}

function initializeCorrelationScatterChart() {
    const ctx = document.getElementById('correlationScatterChart');
    if (!ctx) return;
    
    if (InsightsPerformance.charts.correlationScatter) {
        InsightsPerformance.charts.correlationScatter.destroy();
    }
    
    InsightsPerformance.charts.correlationScatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Services',
                data: generateScatterData(20),
                backgroundColor: '#00BFA5',
                borderColor: '#00BFA5',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1D2A3B',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return 'Utilization: ' + context.parsed.x + '%, Revenue: KES ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Utilization Rate (%)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Revenue (KES)'
                    }
                }
            }
        }
    });
}

function initializeRevenueTrendsChart() {
    const ctx = document.getElementById('revenueTrendsChart');
    if (!ctx) return;
    
    if (InsightsPerformance.charts.revenueTrends) {
        InsightsPerformance.charts.revenueTrends.destroy();
    }
    
    InsightsPerformance.charts.revenueTrends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Current Year',
                data: generateRandomData(12, 1800000, 2500000),
                borderColor: '#00BFA5',
                backgroundColor: 'rgba(0, 191, 165, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Previous Year',
                data: generateRandomData(12, 1500000, 2200000),
                borderColor: '#FF6B35',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                tension: 0.4,
                fill: false,
                borderDash: [5, 5]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end'
                },
                tooltip: {
                    backgroundColor: '#1D2A3B',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': KES ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'KES ' + (value / 1000000).toFixed(1) + 'M';
                        }
                    }
                }
            }
        }
    });
}

function initializeServiceDistributionChart() {
    const ctx = document.getElementById('serviceDistributionChart');
    if (!ctx) return;
    
    if (InsightsPerformance.charts.serviceDistribution) {
        InsightsPerformance.charts.serviceDistribution.destroy();
    }
    
    InsightsPerformance.charts.serviceDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Consultation', 'Lab Tests', 'Specialist', 'Procedures', 'Others'],
            datasets: [{
                data: [36.3, 23.6, 19.0, 13.1, 8.0],
                backgroundColor: ['#00BFA5', '#FF6B35', '#1D2A3B', '#F59E0B', '#9CA3AF'],
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: '#1D2A3B',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

function initializeStaffPerformanceChart() {
    const ctx = document.getElementById('staffPerformanceChart');
    if (!ctx) return;
    
    if (InsightsPerformance.charts.staffPerformance) {
        InsightsPerformance.charts.staffPerformance.destroy();
    }
    
    InsightsPerformance.charts.staffPerformance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Dr. Johnson', 'Dr. Smith', 'Dr. Brown', 'Sarah J.', 'Mike R.'],
            datasets: [{
                label: 'Appointments',
                data: [234, 156, 189, 89, 67],
                backgroundColor: '#00BFA5',
                borderRadius: 8
            }, {
                label: 'Satisfaction Score',
                data: [4.9, 4.7, 4.8, 4.8, 4.6],
                backgroundColor: '#FF6B35',
                borderRadius: 8,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end'
                },
                tooltip: {
                    backgroundColor: '#1D2A3B',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    max: 5,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

function initializeEfficiencyTrendChart() {
    const ctx = document.getElementById('efficiencyTrendChart');
    if (!ctx) return;
    
    if (InsightsPerformance.charts.efficiencyTrend) {
        InsightsPerformance.charts.efficiencyTrend.destroy();
    }
    
    InsightsPerformance.charts.efficiencyTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Efficiency %',
                data: [88, 92, 90, 94, 91, 85, 87],
                borderColor: '#00BFA5',
                backgroundColor: 'rgba(0, 191, 165, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1D2A3B',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return 'Efficiency: ' + context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 80,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// ====================================
// DATA UPDATE FUNCTIONS
// ====================================
function updateAppointmentAnalytics(timeframe) {
    // Show loading state
    showAutoRefreshIndicator();
    
    // Simulate data update
    setTimeout(() => {
        // Update booking trends
        if (InsightsPerformance.charts.bookingTrends) {
            const days = timeframe === 'daily' ? 24 : timeframe === 'weekly' ? 7 : 30;
            InsightsPerformance.charts.bookingTrends.data.labels = generateDateLabels(days);
            InsightsPerformance.charts.bookingTrends.data.datasets[0].data = generateRandomData(days, 20, 50);
            InsightsPerformance.charts.bookingTrends.update();
        }
        
        // Update other metrics
        updateMetricValues();
        
        hideAutoRefreshIndicator();
    }, 1000);
}

function updateIncomeAnalysis(period) {
    showAutoRefreshIndicator();
    
    setTimeout(() => {
        // Update service breakdown chart
        if (InsightsPerformance.charts.serviceBreakdown) {
            const multiplier = period === 'daily' ? 0.033 : period === 'weekly' ? 0.25 : period === 'yearly' ? 12 : 1;
            const baseData = [890000, 578000, 465000, 320000, 197000];
            InsightsPerformance.charts.serviceBreakdown.data.datasets[0].data = baseData.map(value => Math.round(value * multiplier));
            InsightsPerformance.charts.serviceBreakdown.update();
        }
        
        hideAutoRefreshIndicator();
    }, 800);
}

function updateRetentionChart() {
    if (InsightsPerformance.charts.retentionPie) {
        // Simulate data variation
        const newPatients = 20 + Math.random() * 10;
        const returningPatients = 100 - newPatients;
        
        InsightsPerformance.charts.retentionPie.data.datasets[0].data = [newPatients, returningPatients];
        InsightsPerformance.charts.retentionPie.update();
    }
}

function updateServiceUtilization() {
    // Update service ranking with animation
    const rankItems = document.querySelectorAll('.rank-item');
    rankItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-in');
        }, index * 100);
    });
}

function updateCorrelationAnalysis() {
    // Initialize correlation chart if not already done
    if (!InsightsPerformance.charts.correlationScatter) {
        setTimeout(() => {
            initializeCorrelationScatterChart();
        }, 300);
    }
}

function updateFilteredData() {
    showAutoRefreshIndicator();
    
    // Collect selected filters
    const selectedStaff = [];
    const selectedServices = [];
    
    document.querySelectorAll('.checkbox-group input:checked').forEach(checkbox => {
        const text = checkbox.parentElement.textContent.trim();
        if (text.includes('Dr.') || text.includes('Sarah')) {
            selectedStaff.push(text);
        } else {
            selectedServices.push(text);
        }
    });
    
    InsightsPerformance.state.selectedFilters.staff = selectedStaff;
    InsightsPerformance.state.selectedFilters.services = selectedServices;
    
    // Update all charts with filtered data
    setTimeout(() => {
        updateAllCharts();
        hideAutoRefreshIndicator();
    }, 1000);
}

function updateComparisonAnalysis(comparison) {
    // Update comparison metrics
    const metrics = document.querySelectorAll('.comparison-metric');
    
    metrics.forEach((metric, index) => {
        setTimeout(() => {
            const changeElement = metric.querySelector('.comparison-change');
            const currentValue = metric.querySelector('.current-value');
            
            // Simulate different comparison data
            let changePercent, changeDirection;
            
            if (comparison === 'month') {
                changePercent = 8 + Math.random() * 10;
                changeDirection = Math.random() > 0.3 ? 'positive' : 'negative';
            } else if (comparison === 'year') {
                changePercent = 15 + Math.random() * 20;
                changeDirection = Math.random() > 0.2 ? 'positive' : 'negative';
            } else {
                changePercent = Math.random() * 30 - 15;
                changeDirection = changePercent > 0 ? 'positive' : 'negative';
            }
            
            changeElement.className = `comparison-change ${changeDirection}`;
            changeElement.innerHTML = `
                <i class="fas fa-arrow-${changeDirection === 'positive' ? 'up' : 'down'}"></i>
                ${changeDirection === 'positive' ? '+' : ''}${changePercent.toFixed(1)}% vs ${comparison === 'month' ? 'last month' : comparison === 'year' ? 'last year' : 'comparison period'}
            `;
            
            metric.classList.add('fade-in');
        }, index * 200);
    });
}

function updateChartTypes(chartType) {
    // Update main charts based on selected type
    showAutoRefreshIndicator();
    
    setTimeout(() => {
        if (chartType === 'line') {
            convertChartsToLine();
        } else if (chartType === 'bar') {
            convertChartsToBar();
        } else if (chartType === 'pie') {
            convertChartsToPie();
        } else if (chartType === 'custom') {
            showCustomChartBuilder();
        }
        
        hideAutoRefreshIndicator();
    }, 500);
}

function updateAllCharts() {
    // Update all active charts
    Object.values(InsightsPerformance.charts).forEach(chart => {
        if (chart) {
            chart.update();
        }
    });
}

// ====================================
// EXPORT FUNCTIONS
// ====================================
function resetExportWizard() {
    InsightsPerformance.state.exportWizardStep = 1;
    updateExportWizard();
}

function updateExportWizard() {
    const steps = document.querySelectorAll('.wizard-step');
    const indicators = document.querySelectorAll('.step-indicator');
    const prevBtn = document.getElementById('wizardPrevBtn');
    const nextBtn = document.getElementById('wizardNextBtn');
    
    // Update step visibility
    steps.forEach((step, index) => {
        step.classList.toggle('active', index + 1 === InsightsPerformance.state.exportWizardStep);
    });
    
    // Update indicators
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index + 1 <= InsightsPerformance.state.exportWizardStep);
    });
    
    // Update buttons
    prevBtn.disabled = InsightsPerformance.state.exportWizardStep === 1;
    nextBtn.innerHTML = InsightsPerformance.state.exportWizardStep === 3 
        ? '<i class="fas fa-download"></i> Generate Export' 
        : 'Next <i class="fas fa-arrow-right"></i>';
}

function setExportDateRange(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    document.getElementById('exportStartDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('exportEndDate').value = endDate.toISOString().split('T')[0];
}

function generateExport() {
    const exportModal = document.getElementById('exportConfigModal');
    
    // Show loading state
    showAutoRefreshIndicator();
    
    // Collect export settings
    const exportSettings = {
        dateRange: {
            start: document.getElementById('exportStartDate').value,
            end: document.getElementById('exportEndDate').value
        },
        reportTypes: [],
        format: document.querySelector('input[name="exportFormat"]:checked').value,
        includeCharts: document.querySelector('input[type="checkbox"][checked]').checked
    };
    
    // Get selected report types
    document.querySelectorAll('.report-type-option input:checked').forEach(checkbox => {
        const reportType = checkbox.closest('.report-type-option').querySelector('h5').textContent;
        exportSettings.reportTypes.push(reportType);
    });
    
    // Simulate export generation
    setTimeout(() => {
        exportModal.classList.remove('show');
        hideAutoRefreshIndicator();
        
        // Show success notification
        showNotification('Export generated successfully!', 'success');
        
        // Add to recent exports
        addToRecentExports(exportSettings);
    }, 2000);
}

function generateQuickExport(format) {
    showAutoRefreshIndicator();
    
    setTimeout(() => {
        hideAutoRefreshIndicator();
        
        // Simulate download
        if (format === 'pdf') {
            downloadPDF();
        } else if (format === 'csv') {
            downloadCSV();
        }
        
        showNotification(`${format.toUpperCase()} export generated successfully!`, 'success');
    }, 1500);
}

function downloadExport(exportItem) {
    const fileName = exportItem.querySelector('.export-name').textContent;
    showNotification(`Downloading ${fileName}...`, 'info');
    
    // Simulate download
    setTimeout(() => {
        showNotification('Download completed!', 'success');
    }, 1000);
}

function shareExport(exportItem) {
    const fileName = exportItem.querySelector('.export-name').textContent;
    
    // Create share modal or use native share API
    if (navigator.share) {
        navigator.share({
            title: 'Curis Export',
            text: `Sharing ${fileName}`,
            url: window.location.href
        }).then(() => {
            showNotification('Shared successfully!', 'success');
        }).catch((error) => {
            console.log('Error sharing:', error);
        });
    } else {
        // Fallback for browsers that don't support native share
        showShareModal(fileName);
    }
}

// ====================================
// UTILITY FUNCTIONS
// ====================================
function generateDateLabels(count) {
    const labels = [];
    const today = new Date();
    
    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    return labels;
}

function generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
}

function generateScatterData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            x: Math.random() * 100,
            y: Math.random() * 1000000 + 100000
        });
    }
    return data;
}

function setDateRange(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    document.getElementById('dashboardDateStart').value = startDate.toISOString().split('T')[0];
    document.getElementById('dashboardDateEnd').value = endDate.toISOString().split('T')[0];
    
    // Update filters
    InsightsPerformance.state.selectedFilters.dateRange = {
        start: startDate,
        end: endDate
    };
    
    updateFilteredData();
}

function updateMetricValues() {
    // Animate metric value updates
    const metricValues = document.querySelectorAll('.metric-value');
    metricValues.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('fade-in');
        }, index * 100);
    });
}

function updateNotificationBadge() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    const badge = document.querySelector('.notification-badge');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

function showAutoRefreshIndicator() {
    const indicator = document.getElementById('autoRefreshIndicator');
    indicator.classList.add('show');
}

function hideAutoRefreshIndicator() {
    const indicator = document.getElementById('autoRefreshIndicator');
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 500);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#00BFA5'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function addToRecentExports(exportSettings) {
    // Add new export to the recent exports list
    const exportHistory = document.querySelector('.export-history');
    const newExport = document.createElement('div');
    newExport.className = 'export-item fade-in';
    
    const fileName = `${exportSettings.reportTypes[0]}_${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(/\s/g, '_')}.${exportSettings.format}`;
    const fileSize = exportSettings.format === 'pdf' ? '2.1 MB' : '456 KB';
    
    newExport.innerHTML = `
        <div class="export-icon">
            <i class="fas fa-file-${exportSettings.format}"></i>
        </div>
        <div class="export-info">
            <span class="export-name">${fileName}</span>
            <span class="export-date">Generated: Just now</span>
            <span class="export-size">${fileSize}</span>
        </div>
        <div class="export-actions">
            <button class="action-btn download">
                <i class="fas fa-download"></i>
            </button>
            <button class="action-btn share">
                <i class="fas fa-share"></i>
            </button>
        </div>
    `;
    
    exportHistory.insertBefore(newExport, exportHistory.firstChild);
    
    // Add event listeners to new buttons
    newExport.querySelector('.action-btn.download').addEventListener('click', function(e) {
        e.stopPropagation();
        downloadExport(newExport);
    });
    
    newExport.querySelector('.action-btn.share').addEventListener('click', function(e) {
        e.stopPropagation();
        shareExport(newExport);
    });
    
    // Remove oldest export if more than 5
    const allExports = exportHistory.querySelectorAll('.export-item');
    if (allExports.length > 5) {
        allExports[allExports.length - 1].remove();
    }
}

// ====================================
// MODAL DISPLAY FUNCTIONS
// ====================================
function showDeductionDetails() {
    showNotification('Opening service charge details...', 'info');
    // Could open a dedicated modal for deduction details
}

function showOutstandingDetails() {
    showNotification('Loading outstanding balance details...', 'info');
    // Could open a dedicated modal for outstanding invoices
}

function showServiceRevenueModal() {
    showNotification('Loading service revenue analysis...', 'info');
    // Could open a dedicated modal for service revenue
}

function showBookingTrendsModal() {
    showNotification('Opening booking trends analysis...', 'info');
    // Could open a detailed trends modal
}

function showCancellationModal() {
    showNotification('Loading cancellation analysis...', 'info');
    // Could open a cancellation details modal
}

function showNoShowModal() {
    showNotification('Opening no-show analysis...', 'info');
    // Could open a no-show details modal
}

function showUtilizationModal() {
    showNotification('Loading utilization details...', 'info');
    // Could open a utilization analysis modal
}

function showServiceAnalysisModal() {
    showNotification('Opening comprehensive service analysis...', 'info');
    // Could open a detailed service analysis modal
}

function showStaffAnalysisModal() {
    showNotification('Loading staff performance analysis...', 'info');
    // Could open a detailed staff analysis modal
}

function showShareModal(fileName) {
    // Create and show a custom share modal
    const shareOptions = ['Email', 'WhatsApp', 'Copy Link'];
    showNotification('Share options displayed', 'info');
}

function showCustomChartBuilder() {
    showNotification('Custom chart builder coming soon!', 'info');
}

function convertChartsToLine() {
    // Convert applicable charts to line type
    showNotification('Converting charts to line format...', 'info');
}

function convertChartsToBar() {
    // Convert applicable charts to bar type
    showNotification('Converting charts to bar format...', 'info');
}

function convertChartsToPie() {
    // Convert applicable charts to pie type
    showNotification('Converting charts to pie format...', 'info');
}

function downloadPDF() {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'insights_report.pdf';
    link.click();
}

function downloadCSV() {
    // Simulate CSV download
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'insights_data.csv';
    link.click();
}

// ====================================
// AUTO-REFRESH FUNCTIONALITY
// ====================================
function initializeAutoRefresh() {
    // Set up auto-refresh for real-time data
    setInterval(() => {
        // Only refresh if the page is visible
        if (!document.hidden) {
            refreshDashboardData();
        }
    }, 300000); // Refresh every 5 minutes
}

function refreshDashboardData() {
    // Silently refresh data without showing indicator
    updateMetricValues();
    
    // Update specific metrics that change frequently
    const noShowRate = document.querySelector('.no-show-rate');
    if (noShowRate) {
        const newRate = (Math.random() * 2 + 4).toFixed(1);
        noShowRate.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${newRate}% no-show rate`;
    }
    
    const utilizationScore = document.querySelector('.utilization-score');
    if (utilizationScore) {
        const newScore = (Math.random() * 10 + 75).toFixed(1);
        utilizationScore.innerHTML = `<i class="fas fa-check-circle"></i> ${newScore}% efficiency`;
    }
}

// ====================================
// KEYBOARD NAVIGATION
// ====================================
document.addEventListener('keydown', function(e) {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'e':
                e.preventDefault();
                document.getElementById('exportConfigBtn').click();
                break;
            case 'd':
                e.preventDefault();
                document.getElementById('downloadReportsBtn').click();
                break;
            case 'f':
                e.preventDefault();
                document.getElementById('filterToolsBtn').click();
                break;
            case '/':
                e.preventDefault();
                document.querySelector('.notification-btn').click();
                break;
        }
    }
});

// ====================================
// RESPONSIVE CHART RESIZE
// ====================================
window.addEventListener('resize', function() {
    // Resize all active charts
    Object.values(InsightsPerformance.charts).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
});

// ====================================
// PRINT FUNCTIONALITY
// ====================================
window.addEventListener('beforeprint', function() {
    // Prepare charts for printing
    Object.values(InsightsPerformance.charts).forEach(chart => {
        if (chart) {
            chart.resize();
            chart.update();
        }
    });
});

// ====================================
// PERFORMANCE OPTIMIZATION
// ====================================
// Debounce function for search and filter inputs
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

// Apply debouncing to filter updates
const debouncedFilterUpdate = debounce(updateFilteredData, 500);

// ====================================
// ERROR HANDLING
// ====================================
window.addEventListener('error', function(e) {
    console.error('Application error:', e);
    showNotification('An error occurred. Please refresh the page.', 'error');
});

// Handle chart errors
Chart.defaults.plugins.legend.onClick = function(e, legendItem, legend) {
    try {
        const index = legendItem.datasetIndex;
        const chart = legend.chart;
        const meta = chart.getDatasetMeta(index);
        
        meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
        chart.update();
    } catch (error) {
        console.error('Chart interaction error:', error);
    }
};

// ====================================
// ACCESSIBILITY ENHANCEMENTS
// ====================================
// Add ARIA live regions for dynamic updates
const liveRegion = document.createElement('div');
liveRegion.setAttribute('aria-live', 'polite');
liveRegion.setAttribute('aria-atomic', 'true');
liveRegion.className = 'sr-only';
document.body.appendChild(liveRegion);

function announceUpdate(message) {
    liveRegion.textContent = message;
    setTimeout(() => {
        liveRegion.textContent = '';
    }, 1000);
}

// ====================================
// INITIALIZE TOOLTIPS
// ====================================
function initializeTooltips() {
    // Add tooltips to metric cards
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        card.setAttribute('title', 'Click for detailed analysis');
    });
    
    // Add tooltips to chart controls
    const chartControls = document.querySelectorAll('.control-btn');
    chartControls.forEach(btn => {
        const text = btn.textContent.trim();
        btn.setAttribute('title', `Click to ${text.toLowerCase()}`);
    });
}

// Initialize tooltips on load
initializeTooltips();

// ====================================
// FINAL INITIALIZATION
// ====================================
console.log('Curis Insights & Performance initialized successfully');
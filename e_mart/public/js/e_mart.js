// E Mart App - Enhanced UI/UX Components
// Compatible with Frappe/ERPNext v15

class EMartUI {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.setupResponsiveDesign();
    }

    setupEventListeners() {
        // Global event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.enhanceForms();
            this.enhanceTables();
            this.enhanceButtons();
            this.setupAnimations();
        });

        // Frappe specific events
        if (typeof frappe !== 'undefined') {
            frappe.after_ajax(() => {
                this.enhanceForms();
                this.enhanceTables();
            });
        }
    }

    initializeComponents() {
        this.setupToastNotifications();
        this.setupLoadingStates();
        this.setupTooltips();
        this.setupModals();
    }

    setupResponsiveDesign() {
        // Handle responsive behavior
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        mediaQuery.addListener(() => {
            this.handleResponsiveChange(mediaQuery);
        });
    }

    // Enhanced Form Components
    enhanceForms() {
        // Add modern styling to form elements
        const formInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], textarea, select');
        
        formInputs.forEach(input => {
            if (!input.classList.contains('e-mart-enhanced')) {
                input.classList.add('e-mart-form-input', 'e-mart-enhanced');
                
                // Add focus effects
                input.addEventListener('focus', (e) => {
                    e.target.parentElement.classList.add('e-mart-focused');
                });
                
                input.addEventListener('blur', (e) => {
                    e.target.parentElement.classList.remove('e-mart-focused');
                });
            }
        });

        // Enhance form groups
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            if (!group.classList.contains('e-mart-enhanced')) {
                group.classList.add('e-mart-form-group', 'e-mart-enhanced');
            }
        });
    }

    // Enhanced Table Components
    enhanceTables() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            if (!table.classList.contains('e-mart-enhanced')) {
                table.classList.add('e-mart-table', 'e-mart-enhanced');
                
                // Add hover effects
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    row.addEventListener('mouseenter', () => {
                        row.style.backgroundColor = 'rgba(37, 99, 235, 0.02)';
                    });
                    
                    row.addEventListener('mouseleave', () => {
                        row.style.backgroundColor = '';
                    });
                });
            }
        });
    }

    // Enhanced Button Components
    enhanceButtons() {
        const buttons = document.querySelectorAll('button, .btn');
        
        buttons.forEach(button => {
            if (!button.classList.contains('e-mart-enhanced')) {
                button.classList.add('e-mart-btn', 'e-mart-enhanced');
                
                // Add ripple effect
                button.addEventListener('click', (e) => {
                    this.createRippleEffect(e);
                });
            }
        });
    }

    // Ripple Effect for Buttons
    createRippleEffect(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('e-mart-ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Toast Notifications
    setupToastNotifications() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'e-mart-toast-container';
        document.body.appendChild(this.toastContainer);
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `e-mart-toast e-mart-toast-${type} e-mart-fade-in`;
        const toastContent = document.createElement('div');
        toastContent.className = 'e-mart-toast-content';
        
        const toastMessage = document.createElement('span');
        toastMessage.className = 'e-mart-toast-message';
        toastMessage.textContent = message; // Escape message to prevent XSS
        
        const toastCloseButton = document.createElement('button');
        toastCloseButton.className = 'e-mart-toast-close';
        toastCloseButton.textContent = '×'; // Escape close button text
        
        toastContent.appendChild(toastMessage);
        toastContent.appendChild(toastCloseButton);
        toast.appendChild(toastContent);
        
        this.toastContainer.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.add('e-mart-fade-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
        
        // Manual close
        toast.querySelector('.e-mart-toast-close').addEventListener('click', () => {
            toast.classList.add('e-mart-fade-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }

    // Loading States
    setupLoadingStates() {
        // Add loading spinner to buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('button[type="submit"], .btn-primary')) {
                this.showButtonLoading(e.target);
            }
        });
    }

    showButtonLoading(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="e-mart-spinner"></span> Loading...';
        button.disabled = true;
        
        // Reset after form submission or timeout
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 5000);
    }

    // Tooltips
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.getAttribute('data-tooltip'));
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'e-mart-tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    // Modal System
    setupModals() {
        // Create modal container
        this.modalContainer = document.createElement('div');
        this.modalContainer.className = 'e-mart-modal-container';
        document.body.appendChild(this.modalContainer);
    }

    showModal(options) {
        const modal = document.createElement('div');
        modal.className = 'e-mart-modal e-mart-fade-in';
        modal.innerHTML = `
            <div class="e-mart-modal-backdrop"></div>
            <div class="e-mart-modal-content">
                <div class="e-mart-modal-header">
                    <h3>${options.title || 'Modal'}</h3>
                    <button class="e-mart-modal-close">&times;</button>
                </div>
                <div class="e-mart-modal-body">
                    ${options.content || ''}
                </div>
                ${options.footer ? `<div class="e-mart-modal-footer">${options.footer}</div>` : ''}
            </div>
        `;
        
        this.modalContainer.appendChild(modal);
        
        // Close functionality
        modal.querySelector('.e-mart-modal-close').addEventListener('click', () => {
            this.hideModal(modal);
        });
        
        modal.querySelector('.e-mart-modal-backdrop').addEventListener('click', () => {
            this.hideModal(modal);
        });
        
        return modal;
    }

    hideModal(modal) {
        modal.classList.add('e-mart-fade-out');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // Animations
    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('e-mart-fade-in');
                }
            });
        }, observerOptions);
        
        // Observe elements with animation classes
        const animatedElements = document.querySelectorAll('.e-mart-animate-on-scroll');
        animatedElements.forEach(el => observer.observe(el));
    }

    // Responsive Design
    handleResponsiveChange(mediaQuery) {
        if (mediaQuery.matches) {
            document.body.classList.add('e-mart-mobile');
            this.setupMobileNavigation();
        } else {
            document.body.classList.remove('e-mart-mobile');
        }
    }

    setupMobileNavigation() {
        // Mobile-specific navigation enhancements
        const navToggle = document.querySelector('.e-mart-mobile-nav-toggle');
        const nav = document.querySelector('.e-mart-nav');
        
        if (navToggle && nav) {
            navToggle.addEventListener('click', () => {
                nav.classList.toggle('e-mart-nav-open');
            });
        }
    }

    // Utility Methods
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

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Enhanced Series Management UI
class EMartSeriesUI extends EMartUI {
    constructor() {
        super();
        this.setupSeriesComponents();
    }

    setupSeriesComponents() {
        this.setupSeriesDashboard();
        this.setupSeriesForm();
        this.setupSeriesActions();
    }

    setupSeriesDashboard() {
        const dashboard = document.querySelector('.series-dashboard');
        if (dashboard) {
            this.enhanceDashboard(dashboard);
        }
    }

    enhanceDashboard(dashboard) {
        // Add animated counters
        const statNumbers = dashboard.querySelectorAll('.series-stat-number');
        statNumbers.forEach(stat => {
            this.animateCounter(stat, 0, parseInt(stat.textContent), 1000);
        });
    }

    animateCounter(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = Math.floor(current);
            
            if (current >= end) {
                element.textContent = end;
                clearInterval(timer);
            }
        }, 16);
    }

    setupSeriesForm() {
        const form = document.querySelector('.series-form');
        if (form) {
            this.enhanceSeriesForm(form);
        }
    }

    enhanceSeriesForm(form) {
        // Add form validation
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        
        // Remove existing validation classes
        field.classList.remove('e-mart-error', 'e-mart-success');
        
        if (!value) {
            field.classList.add('e-mart-error');
            this.showFieldError(field, 'This field is required');
        } else {
            field.classList.add('e-mart-success');
            this.hideFieldError(field);
        }
    }

    showFieldError(field, message) {
        let errorElement = field.parentNode.querySelector('.e-mart-field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'e-mart-field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    hideFieldError(field) {
        const errorElement = field.parentNode.querySelector('.e-mart-field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    setupSeriesActions() {
        // Enhanced series action buttons
        const generateBtn = document.querySelector('.series-btn-generate');
        const resetBtn = document.querySelector('.series-btn-reset');
        const infoBtn = document.querySelector('.series-btn-info');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', (e) => {
                this.handleSeriesGeneration(e);
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                this.handleSeriesReset(e);
            });
        }
        
        if (infoBtn) {
            infoBtn.addEventListener('click', (e) => {
                this.handleSeriesInfo(e);
            });
        }
    }

    handleSeriesGeneration(event) {
        const button = event.target;
        const originalText = button.innerHTML;
        
        button.innerHTML = '<span class="e-mart-spinner"></span> Generating...';
        button.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            this.showToast('Series number generated successfully!', 'success');
        }, 1500);
    }

    handleSeriesReset(event) {
        this.showModal({
            title: 'Reset Series',
            content: `
                <div class="e-mart-form-group">
                    <label class="e-mart-form-label">New Start Number</label>
                    <input type="number" class="e-mart-form-input" id="new-start-number" min="1" value="1">
                </div>
                <div class="e-mart-alert e-mart-alert-warning">
                    <strong>Warning:</strong> This action will reset the series number. Are you sure?
                </div>
            `,
            footer: `
                <button class="e-mart-btn e-mart-btn-danger" onclick="eMartUI.confirmSeriesReset()">Reset</button>
                <button class="e-mart-btn e-mart-btn-secondary" onclick="eMartUI.hideModal(document.querySelector('.e-mart-modal'))">Cancel</button>
            `
        });
    }

    handleSeriesInfo(event) {
        // Show series information in a modal
        this.showModal({
            title: 'Series Information',
            content: `
                <div class="e-mart-series-info">
                    <div class="e-mart-series-info-item">
                        <strong>Current Series:</strong> NORM-20250630-0005
                    </div>
                    <div class="e-mart-series-info-item">
                        <strong>Next Series:</strong> NORM-20250630-0006
                    </div>
                    <div class="e-mart-series-info-item">
                        <strong>Format:</strong> YYYYMMDD-####
                    </div>
                    <div class="e-mart-series-info-item">
                        <strong>Prefix:</strong> NORM
                    </div>
                </div>
            `
        });
    }

    confirmSeriesReset() {
        const newStartNumber = document.getElementById('new-start-number').value;
        this.hideModal(document.querySelector('.e-mart-modal'));
        this.showToast(`Series reset to ${newStartNumber}`, 'success');
    }
}

// Enhanced Special Purchase Scheme UI
class EMartSchemeUI extends EMartUI {
    constructor() {
        super();
        this.setupSchemeComponents();
    }

    setupSchemeComponents() {
        this.setupSchemeCards();
        this.setupSchemeForm();
        this.setupSchemeValidation();
    }

    setupSchemeCards() {
        const schemeCards = document.querySelectorAll('.scheme-card');
        schemeCards.forEach(card => {
            this.enhanceSchemeCard(card);
        });
    }

    enhanceSchemeCard(card) {
        // Add click to edit functionality
        card.addEventListener('click', () => {
            this.editScheme(card.dataset.schemeId);
        });
        
        // Add status indicator animation
        const statusDot = card.querySelector('.scheme-status-dot');
        if (statusDot) {
            statusDot.classList.add('e-mart-pulse');
        }
    }

    editScheme(schemeId) {
        // Open scheme edit modal
        this.showModal({
            title: 'Edit Special Purchase Scheme',
            content: `
                <div class="e-mart-form-group">
                    <label class="e-mart-form-label">Scheme Name</label>
                    <input type="text" class="e-mart-form-input" value="Summer Electronics Sale">
                </div>
                <div class="e-mart-form-group">
                    <label class="e-mart-form-label">Discount Percentage</label>
                    <input type="number" class="e-mart-form-input" value="15" min="0" max="100">
                </div>
                <div class="e-mart-form-group">
                    <label class="e-mart-form-label">Valid From</label>
                    <input type="date" class="e-mart-form-input" value="2025-06-01">
                </div>
                <div class="e-mart-form-group">
                    <label class="e-mart-form-label">Valid To</label>
                    <input type="date" class="e-mart-form-input" value="2025-08-31">
                </div>
            `,
            footer: `
                <button class="e-mart-btn e-mart-btn-primary">Save Changes</button>
                <button class="e-mart-btn e-mart-btn-secondary" onclick="eMartUI.hideModal(document.querySelector('.e-mart-modal'))">Cancel</button>
            `
        });
    }

    setupSchemeForm() {
        const form = document.querySelector('.scheme-form');
        if (form) {
            this.enhanceSchemeForm(form);
        }
    }

    enhanceSchemeForm(form) {
        // Add real-time validation
        const discountInput = form.querySelector('input[name="discount_percentage"]');
        if (discountInput) {
            discountInput.addEventListener('input', (e) => {
                this.validateDiscount(e.target);
            });
        }
        
        // Add date validation
        const validFromInput = form.querySelector('input[name="valid_from"]');
        const validToInput = form.querySelector('input[name="valid_to"]');
        
        if (validFromInput && validToInput) {
            validFromInput.addEventListener('change', () => {
                this.validateDateRange(validFromInput, validToInput);
            });
            
            validToInput.addEventListener('change', () => {
                this.validateDateRange(validFromInput, validToInput);
            });
        }
    }

    validateDiscount(input) {
        const value = parseInt(input.value);
        const field = input.parentNode;
        
        field.classList.remove('e-mart-error', 'e-mart-success');
        
        if (value < 0 || value > 100) {
            field.classList.add('e-mart-error');
            this.showFieldError(input, 'Discount must be between 0 and 100%');
        } else {
            field.classList.add('e-mart-success');
            this.hideFieldError(input);
        }
    }

    validateDateRange(fromInput, toInput) {
        const fromDate = new Date(fromInput.value);
        const toDate = new Date(toInput.value);
        
        if (fromDate >= toDate) {
            toInput.classList.add('e-mart-error');
            this.showFieldError(toInput, 'End date must be after start date');
        } else {
            toInput.classList.remove('e-mart-error');
            this.hideFieldError(toInput);
        }
    }

    setupSchemeValidation() {
        // Form submission validation
        const forms = document.querySelectorAll('.scheme-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateSchemeForm(form)) {
                    e.preventDefault();
                }
            });
        });
    }

    validateSchemeForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('e-mart-error');
                this.showFieldError(field, 'This field is required');
                isValid = false;
            }
        });
        
        return isValid;
    }
}

// Initialize UI components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.eMartUI = new EMartUI();
    window.eMartSeriesUI = new EMartSeriesUI();
    window.eMartSchemeUI = new EMartSchemeUI();
});

// Frappe specific initialization
if (typeof frappe !== 'undefined') {
    frappe.after_ajax(() => {
        if (window.eMartUI) {
            window.eMartUI.enhanceForms();
            window.eMartUI.enhanceTables();
            window.eMartUI.enhanceButtons();
        }
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EMartUI, EMartSeriesUI, EMartSchemeUI };
} 
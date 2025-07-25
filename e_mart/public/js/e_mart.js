// E Mart App - Enhanced UI/UX Components
// Compatible with Frappe/ERPNext v15
// Includes PWA features, settings management, and real-world functionality

class EMartUI {
    constructor() {
        this.settings = null;
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.initializeComponents();
        this.setupResponsiveDesign();
        this.initializePWA();
        this.setupOfflineSupport();
    }

    async loadSettings() {
        try {
            const response = await frappe.call({
                method: "e_mart.e_mart.doctype.e_mart_settings.e_mart_settings.get_e_mart_settings",
                type: "GET"
            });
            this.settings = response.message || {};
            this.applySettings();
        } catch (error) {
            console.warn('Could not load E Mart settings, using defaults:', error);
            this.settings = this.getDefaultSettings();
        }
    }

    applySettings() {
        if (!this.settings) return;

        // Apply UI theme
        this.applyTheme();
        
        // Apply feature toggles
        this.applyFeatureToggles();
        
        // Apply accessibility settings
        this.applyAccessibilitySettings();
    }

    applyTheme() {
        const ui = this.settings.ui || {};
        
        // Update CSS custom properties
        if (ui.primaryColor) {
            document.documentElement.style.setProperty('--e-mart-primary', ui.primaryColor);
        }
        
        if (ui.secondaryColor) {
            document.documentElement.style.setProperty('--e-mart-secondary', ui.secondaryColor);
        }
        
        // Apply theme class
        document.body.classList.remove('e-mart-light', 'e-mart-dark');
        if (ui.theme === 'Dark') {
            document.body.classList.add('e-mart-dark');
        } else if (ui.theme === 'Light') {
            document.body.classList.add('e-mart-light');
        } else {
            // Auto theme - detect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.add(prefersDark ? 'e-mart-dark' : 'e-mart-light');
        }
        
        // Apply animations
        if (!ui.enableAnimations) {
            document.body.classList.add('e-mart-no-animations');
        }
    }

    applyFeatureToggles() {
        const features = this.settings.features || {};
        
        // Toggle features based on settings
        if (!features.notifications) {
            this.disableNotifications();
        }
        
        if (features.auditLog) {
            this.enableAuditLogging();
        }
    }

    applyAccessibilitySettings() {
        // Add accessibility enhancements
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
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

        // Online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Theme change detection
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.settings.ui?.theme === 'Auto') {
                this.applyTheme();
            }
        });
    }

    initializeComponents() {
        this.setupToastNotifications();
        this.setupLoadingStates();
        this.setupTooltips();
        this.setupModals();
        this.setupDataTable();
        this.setupFormValidation();
    }

    setupResponsiveDesign() {
        // Handle responsive behavior
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        mediaQuery.addListener(() => {
            this.handleResponsiveChange(mediaQuery);
        });
        this.handleResponsiveChange(mediaQuery);
    }

    async initializePWA() {
        // Service Worker registration
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/assets/e_mart/js/sw.js');
                console.log('Service Worker registered:', registration);
                
                // Handle service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }

        // Install app prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // Push notifications
        if (this.settings.mobile?.pushNotifications) {
            this.setupPushNotifications();
        }
    }

    setupOfflineSupport() {
        // Setup offline data storage
        this.setupOfflineStorage();
        
        // Monitor network status
        this.updateNetworkStatus();
        
        // Background sync for forms
        this.setupBackgroundSync();
    }

    // Enhanced Form Components with real-time validation
    enhanceForms() {
        const formInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], textarea, select');
        
        formInputs.forEach(input => {
            if (!input.classList.contains('e-mart-enhanced')) {
                input.classList.add('e-mart-form-input', 'e-mart-enhanced');
                
                // Add focus effects
                input.addEventListener('focus', (e) => {
                    e.target.parentElement.classList.add('e-mart-focused');
                    this.logUserAction('focus_field', { field: e.target.name });
                });
                
                input.addEventListener('blur', (e) => {
                    e.target.parentElement.classList.remove('e-mart-focused');
                    this.validateField(e.target);
                });

                // Real-time validation
                input.addEventListener('input', (e) => {
                    this.debounce(() => this.validateFieldRealTime(e.target), 300)();
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

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        // Clear previous validation
        field.classList.remove('e-mart-error', 'e-mart-success');
        this.hideFieldError(field);
        
        // Required field validation
        if (required && !value) {
            this.showFieldError(field, 'This field is required');
            field.classList.add('e-mart-error');
            return false;
        }
        
        // Type-specific validation
        if (value) {
            switch (type) {
                case 'email':
                    if (!this.isValidEmail(value)) {
                        this.showFieldError(field, 'Please enter a valid email address');
                        field.classList.add('e-mart-error');
                        return false;
                    }
                    break;
                case 'number':
                    if (isNaN(value)) {
                        this.showFieldError(field, 'Please enter a valid number');
                        field.classList.add('e-mart-error');
                        return false;
                    }
                    break;
            }
        }
        
        // Success state
        if (value || !required) {
            field.classList.add('e-mart-success');
        }
        
        return true;
    }

    validateFieldRealTime(field) {
        // Less aggressive real-time validation
        if (field.value.trim()) {
            this.validateField(field);
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
        errorElement.setAttribute('role', 'alert');
    }

    hideFieldError(field) {
        const errorElement = field.parentNode.querySelector('.e-mart-field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Enhanced Table Components with sorting and filtering
    enhanceTables() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            if (!table.classList.contains('e-mart-enhanced')) {
                table.classList.add('e-mart-table', 'e-mart-enhanced');
                
                // Add sorting capability
                this.addTableSorting(table);
                
                // Add filtering
                this.addTableFiltering(table);
                
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

    addTableSorting(table) {
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                this.sortTable(table, index);
            });
        });
    }

    sortTable(table, columnIndex) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        const isAscending = !table.dataset.sortDirection || table.dataset.sortDirection === 'desc';
        table.dataset.sortDirection = isAscending ? 'asc' : 'desc';
        
        rows.sort((a, b) => {
            const aVal = a.cells[columnIndex].textContent.trim();
            const bVal = b.cells[columnIndex].textContent.trim();
            
            // Try numeric comparison first
            const aNum = parseFloat(aVal);
            const bNum = parseFloat(bVal);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return isAscending ? aNum - bNum : bNum - aNum;
            }
            
            // Fallback to string comparison
            return isAscending ? 
                aVal.localeCompare(bVal) : 
                bVal.localeCompare(aVal);
        });
        
        // Re-append sorted rows
        rows.forEach(row => tbody.appendChild(row));
        
        // Update header indicators
        table.querySelectorAll('th').forEach(th => {
            th.classList.remove('e-mart-sort-asc', 'e-mart-sort-desc');
        });
        
        const currentHeader = table.querySelectorAll('th')[columnIndex];
        currentHeader.classList.add(isAscending ? 'e-mart-sort-asc' : 'e-mart-sort-desc');
    }

    addTableFiltering(table) {
        // Add search input above table
        if (table.parentNode.querySelector('.e-mart-table-search')) return;
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'e-mart-table-search e-mart-mb-3';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search table...';
        searchInput.className = 'e-mart-form-input';
        searchInput.style.width = '300px';
        
        searchContainer.appendChild(searchInput);
        table.parentNode.insertBefore(searchContainer, table);
        
        // Implement search functionality
        searchInput.addEventListener('input', this.debounce((e) => {
            this.filterTable(table, e.target.value);
        }, 300));
    }

    filterTable(table, searchTerm) {
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }

    // Enhanced Button Components with accessibility
    enhanceButtons() {
        const buttons = document.querySelectorAll('button, .btn');
        
        buttons.forEach(button => {
            if (!button.classList.contains('e-mart-enhanced')) {
                button.classList.add('e-mart-btn', 'e-mart-enhanced');
                
                // Add ripple effect
                button.addEventListener('click', (e) => {
                    this.createRippleEffect(e);
                    this.logUserAction('button_click', { 
                        button: button.textContent.trim(),
                        page: window.location.pathname 
                    });
                });

                // Add keyboard accessibility
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        button.click();
                    }
                });

                // Add ARIA attributes if missing
                if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                    button.setAttribute('aria-label', 'Button');
                }
            }
        });
    }

    // Ripple Effect for Buttons with performance optimization
    createRippleEffect(event) {
        const button = event.currentTarget;
        
        // Prevent multiple ripples
        const existingRipple = button.querySelector('.e-mart-ripple');
        if (existingRipple) return;
        
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('e-mart-ripple');
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        // Use animation end event for cleanup
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
        
        // Fallback cleanup
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    // Toast Notifications with queue management
    setupToastNotifications() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'e-mart-toast-container';
        this.toastContainer.setAttribute('aria-live', 'polite');
        this.toastContainer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(this.toastContainer);
        
        this.toastQueue = [];
        this.maxToasts = 3;
    }

    showToast(message, type = 'info', duration = 3000, options = {}) {
        // Queue management
        if (this.toastContainer.children.length >= this.maxToasts) {
            this.toastQueue.push({ message, type, duration, options });
            return;
        }

        const toast = document.createElement('div');
        toast.className = `e-mart-toast e-mart-toast-${type} e-mart-fade-in`;
        toast.setAttribute('role', 'alert');
        
        const toastContent = document.createElement('div');
        toastContent.className = 'e-mart-toast-content';
        
        // Add icon based on type
        const icon = this.getToastIcon(type);
        if (icon) {
            const iconElement = document.createElement('span');
            iconElement.className = 'e-mart-toast-icon';
            iconElement.innerHTML = icon;
            toastContent.appendChild(iconElement);
        }
        
        const toastMessage = document.createElement('span');
        toastMessage.className = 'e-mart-toast-message';
        toastMessage.textContent = message;
        
        const toastCloseButton = document.createElement('button');
        toastCloseButton.className = 'e-mart-toast-close';
        toastCloseButton.innerHTML = '&times;';
        toastCloseButton.setAttribute('aria-label', 'Close notification');
        
        toastContent.appendChild(toastMessage);
        toastContent.appendChild(toastCloseButton);
        toast.appendChild(toastContent);
        
        // Add action buttons if provided
        if (options.actions && options.actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'e-mart-toast-actions';
            
            options.actions.forEach(action => {
                const actionButton = document.createElement('button');
                actionButton.className = 'e-mart-btn e-mart-btn-sm';
                actionButton.textContent = action.label;
                actionButton.addEventListener('click', () => {
                    action.callback();
                    this.hideToast(toast);
                });
                actionsContainer.appendChild(actionButton);
            });
            
            toast.appendChild(actionsContainer);
        }
        
        this.toastContainer.appendChild(toast);
        
        // Auto remove
        const autoRemove = setTimeout(() => {
            this.hideToast(toast);
        }, duration);
        
        // Manual close
        toastCloseButton.addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.hideToast(toast);
        });
        
        // Accessibility: Focus management
        if (type === 'danger' || options.requireInteraction) {
            toast.setAttribute('role', 'alertdialog');
            toast.setAttribute('tabindex', '-1');
            toast.focus();
        }
    }

    hideToast(toast) {
        toast.classList.add('e-mart-fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            // Process queue
            if (this.toastQueue.length > 0) {
                const nextToast = this.toastQueue.shift();
                this.showToast(nextToast.message, nextToast.type, nextToast.duration, nextToast.options);
            }
        }, 300);
    }

    getToastIcon(type) {
        const icons = {
            success: '✓',
            warning: '⚠',
            danger: '✕',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    // Loading States with improved UX
    setupLoadingStates() {
        this.loadingStates = new Map();
        
        // Enhanced form submission handling
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                this.showFormLoading(form);
            }
        });
        
        // Button loading states
        document.addEventListener('click', (e) => {
            if (e.target.matches('button[type="submit"], .btn-primary')) {
                this.showButtonLoading(e.target);
            }
        });
    }

    showFormLoading(form) {
        const submitButton = form.querySelector('button[type="submit"], .btn-primary');
        if (submitButton) {
            this.showButtonLoading(submitButton);
        }
        
        // Disable all form inputs
        const inputs = form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
            input.disabled = true;
            input.classList.add('e-mart-loading-disabled');
        });
        
        // Add loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'e-mart-form-loading-overlay';
        overlay.innerHTML = `
            <div class="e-mart-loading-spinner">
                <span class="e-mart-spinner"></span>
                <span>Processing...</span>
            </div>
        `;
        form.style.position = 'relative';
        form.appendChild(overlay);
        
        // Auto-remove after timeout
        setTimeout(() => {
            this.hideFormLoading(form);
        }, 10000);
    }

    hideFormLoading(form) {
        // Re-enable inputs
        const inputs = form.querySelectorAll('.e-mart-loading-disabled');
        inputs.forEach(input => {
            input.disabled = false;
            input.classList.remove('e-mart-loading-disabled');
        });
        
        // Remove overlay
        const overlay = form.querySelector('.e-mart-form-loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showButtonLoading(button) {
        if (this.loadingStates.has(button)) return;
        
        const originalContent = button.innerHTML;
        const originalText = button.textContent;
        this.loadingStates.set(button, { originalContent, originalText });
        
        button.innerHTML = '<span class="e-mart-spinner"></span> Loading...';
        button.disabled = true;
        button.classList.add('e-mart-loading');
        
        // Reset after timeout
        setTimeout(() => {
            this.hideButtonLoading(button);
        }, 5000);
    }

    hideButtonLoading(button) {
        const state = this.loadingStates.get(button);
        if (state) {
            button.innerHTML = state.originalContent;
            button.disabled = false;
            button.classList.remove('e-mart-loading');
            this.loadingStates.delete(button);
        }
    }

    // Enhanced Tooltips with positioning
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.getAttribute('data-tooltip'));
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            element.addEventListener('focus', (e) => {
                this.showTooltip(e.target, e.target.getAttribute('data-tooltip'));
            });

            element.addEventListener('blur', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        this.hideTooltip(); // Remove any existing tooltip
        
        const tooltip = document.createElement('div');
        tooltip.className = 'e-mart-tooltip';
        tooltip.textContent = text;
        tooltip.setAttribute('role', 'tooltip');
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 10;
        
        // Adjust if tooltip goes off screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        if (top < 10) {
            top = rect.bottom + 10;
            tooltip.classList.add('e-mart-tooltip-bottom');
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        
        this.currentTooltip = tooltip;
        
        // Auto-hide after delay
        this.tooltipTimeout = setTimeout(() => {
            this.hideTooltip();
        }, 5000);
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }
    }

    // Modal System with accessibility
    setupModals() {
        this.modalContainer = document.createElement('div');
        this.modalContainer.className = 'e-mart-modal-container';
        this.modalContainer.style.display = 'none';
        document.body.appendChild(this.modalContainer);
        
        // Handle ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalContainer.style.display !== 'none') {
                this.hideAllModals();
            }
        });
    }

    showModal(options) {
        const modal = document.createElement('div');
        modal.className = 'e-mart-modal e-mart-fade-in';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-title');
        
        modal.innerHTML = `
            <div class="e-mart-modal-backdrop"></div>
            <div class="e-mart-modal-content">
                <div class="e-mart-modal-header">
                    <h3 id="modal-title">${this.escapeHtml(options.title || 'Modal')}</h3>
                    <button class="e-mart-modal-close" aria-label="Close dialog">&times;</button>
                </div>
                <div class="e-mart-modal-body">
                    ${options.content || ''}
                </div>
                ${options.footer ? `<div class="e-mart-modal-footer">${options.footer}</div>` : ''}
            </div>
        `;
        
        this.modalContainer.appendChild(modal);
        this.modalContainer.style.display = 'flex';
        
        // Focus management
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
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
            
            // Hide container if no modals left
            if (this.modalContainer.children.length === 0) {
                this.modalContainer.style.display = 'none';
            }
        }, 300);
    }

    hideAllModals() {
        const modals = this.modalContainer.querySelectorAll('.e-mart-modal');
        modals.forEach(modal => this.hideModal(modal));
    }

    // Data Table with advanced features
    setupDataTable() {
        // Setup enhanced data tables for large datasets
        this.setupVirtualScrolling();
        this.setupAdvancedFiltering();
    }

    setupVirtualScrolling() {
        // Implement virtual scrolling for large tables
        const largeTables = document.querySelectorAll('table[data-virtual-scroll]');
        largeTables.forEach(table => {
            this.initVirtualScrolling(table);
        });
    }

    // Form Validation
    setupFormValidation() {
        this.validationRules = new Map();
        this.setupCustomValidators();
    }

    setupCustomValidators() {
        this.validationRules.set('phone', (value) => {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(value.replace(/\s+/g, ''));
        });

        this.validationRules.set('strong-password', (value) => {
            const minLength = this.settings.security?.minPasswordLength || 8;
            const requireSpecial = this.settings.security?.requireSpecialChars;
            
            if (value.length < minLength) return false;
            if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) return false;
            
            return true;
        });
    }

    // Accessibility features
    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Tab trap for modals
            if (e.key === 'Tab' && this.modalContainer.style.display !== 'none') {
                this.handleModalTabTrap(e);
            }
        });
    }

    setupScreenReaderSupport() {
        // Add screen reader announcements
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.className = 'sr-only';
        document.body.appendChild(this.announcer);
    }

    announceToScreenReader(message) {
        this.announcer.textContent = message;
        setTimeout(() => {
            this.announcer.textContent = '';
        }, 1000);
    }

    setupFocusManagement() {
        // Focus management for dynamic content
        this.focusHistory = [];
        
        document.addEventListener('focusin', (e) => {
            this.focusHistory.push(e.target);
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        });
    }

    // PWA specific methods
    showInstallPrompt() {
        if (!this.deferredPrompt) return;
        
        const installBanner = document.createElement('div');
        installBanner.className = 'e-mart-install-banner';
        installBanner.innerHTML = `
            <div class="e-mart-install-content">
                <span>📱 Install E Mart app for a better experience</span>
                <div class="e-mart-install-actions">
                    <button class="e-mart-btn e-mart-btn-primary" id="install-btn">Install</button>
                    <button class="e-mart-btn e-mart-btn-secondary" id="dismiss-btn">Not now</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(installBanner);
        
        installBanner.querySelector('#install-btn').addEventListener('click', async () => {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`User choice: ${outcome}`);
            this.deferredPrompt = null;
            installBanner.remove();
        });
        
        installBanner.querySelector('#dismiss-btn').addEventListener('click', () => {
            installBanner.remove();
        });
    }

    showUpdateAvailable() {
        this.showToast('A new version is available!', 'info', 0, {
            actions: [
                {
                    label: 'Update',
                    callback: () => {
                        window.location.reload();
                    }
                },
                {
                    label: 'Later',
                    callback: () => {}
                }
            ]
        });
    }

    async setupPushNotifications() {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Push notifications enabled');
            this.registerPushSubscription();
        }
    }

    async registerPushSubscription() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.getVapidPublicKey())
            });
            
            // Send subscription to server
            await frappe.call({
                method: 'e_mart.api.register_push_subscription',
                args: { subscription: JSON.stringify(subscription) }
            });
        } catch (error) {
            console.error('Push subscription failed:', error);
        }
    }

    // Offline support
    setupOfflineStorage() {
        if ('indexedDB' in window) {
            this.initOfflineDB();
        }
    }

    async initOfflineDB() {
        try {
            this.offlineDB = await this.openDB('e-mart-offline', 1);
        } catch (error) {
            console.error('Failed to initialize offline DB:', error);
        }
    }

    openDB(name, version) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(name, version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('forms')) {
                    db.createObjectStore('forms', { keyPath: 'id', autoIncrement: true });
                }
                
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                this.syncRegistration = registration;
            });
        }
    }

    updateNetworkStatus() {
        const updateStatus = () => {
            const isOnline = navigator.onLine;
            document.body.classList.toggle('e-mart-offline', !isOnline);
            
            if (isOnline) {
                this.handleOnline();
            } else {
                this.handleOffline();
            }
        };
        
        updateStatus();
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
    }

    handleOnline() {
        this.showToast('Connection restored', 'success', 2000);
        this.syncOfflineData();
    }

    handleOffline() {
        this.showToast('You are offline. Some features may be limited.', 'warning', 3000);
    }

    async syncOfflineData() {
        if (this.syncRegistration) {
            try {
                await this.syncRegistration.sync.register('background-sync-forms');
            } catch (error) {
                console.error('Background sync registration failed:', error);
            }
        }
    }

    // Utility methods
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getDefaultSettings() {
        return {
            ui: {
                theme: 'Auto',
                primaryColor: '#2563eb',
                secondaryColor: '#64748b',
                enableAnimations: true,
                enableModernUI: true
            },
            features: {
                notifications: true,
                auditLog: true
            },
            mobile: {
                pushNotifications: true
            },
            security: {
                minPasswordLength: 8,
                requireSpecialChars: true
            }
        };
    }

    // Analytics and logging
    logUserAction(action, data = {}) {
        if (!this.settings.features?.auditLog) return;
        
        const logEntry = {
            action,
            data,
            timestamp: new Date().toISOString(),
            user: frappe?.session?.user || 'anonymous',
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };
        
        // Send to server or store locally
        this.sendAnalytics(logEntry);
    }

    async sendAnalytics(logEntry) {
        try {
            await frappe.call({
                method: 'e_mart.api.log_user_action',
                args: { log_entry: logEntry }
            });
        } catch (error) {
            // Store locally if server request fails
            this.storeAnalyticsLocally(logEntry);
        }
    }

    storeAnalyticsLocally(logEntry) {
        if (this.offlineDB) {
            const transaction = this.offlineDB.transaction(['analytics'], 'readwrite');
            const store = transaction.objectStore('analytics');
            store.add(logEntry);
        }
    }

    // Performance monitoring
    enablePerformanceMonitoring() {
        if (!this.settings.features?.performanceMonitoring) return;
        
        // Monitor page load times
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.logUserAction('page_load', { loadTime });
        });
        
        // Monitor resource loading
        new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.duration > 1000) { // Log slow resources
                    this.logUserAction('slow_resource', {
                        name: entry.name,
                        duration: entry.duration
                    });
                }
            });
        }).observe({ type: 'resource', buffered: true });
    }

    // Security enhancements
    enableSecurityFeatures() {
        this.setupCSRFProtection();
        this.setupContentSecurityPolicy();
        this.monitorSecurityEvents();
    }

    setupCSRFProtection() {
        // Add CSRF token to all requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            if (options.method && options.method !== 'GET') {
                options.headers = options.headers || {};
                options.headers['X-Frappe-CSRF-Token'] = frappe?.csrf_token;
            }
            return originalFetch(url, options);
        };
    }

    monitorSecurityEvents() {
        // Monitor for suspicious activities
        let failedAttempts = 0;
        
        document.addEventListener('securityviolation', (e) => {
            failedAttempts++;
            if (failedAttempts > 3) {
                this.logUserAction('security_violation', {
                    type: e.violatedDirective,
                    blockedURI: e.blockedURI
                });
            }
        });
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    getVapidPublicKey() {
        // This should be configured in settings
        return 'your-vapid-public-key';
    }

    disableNotifications() {
        // Disable notification features
        this.notificationsDisabled = true;
    }

    enableAuditLogging() {
        // Enable comprehensive audit logging
        this.auditLoggingEnabled = true;
        this.enablePerformanceMonitoring();
    }

    // Animation helpers
    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('e-mart-fade-in');
                }
            });
        }, observerOptions);
        
        // Observe elements with animation classes
        const animatedElements = document.querySelectorAll('.e-mart-animate-on-scroll');
        animatedElements.forEach(el => this.scrollObserver.observe(el));
    }

    // Responsive design handler
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
}

// Enhanced Series Management UI with real-world features
class EMartSeriesUI extends EMartUI {
    constructor() {
        super();
        this.setupSeriesComponents();
    }

    setupSeriesComponents() {
        this.setupSeriesDashboard();
        this.setupSeriesForm();
        this.setupSeriesActions();
        this.setupSeriesValidation();
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
            this.animateCounter(stat, 0, parseInt(stat.textContent) || 0, 1000);
        });

        // Add real-time updates
        this.setupRealTimeUpdates();
    }

    setupRealTimeUpdates() {
        // Poll for updates every 30 seconds
        setInterval(async () => {
            try {
                const response = await frappe.call({
                    method: 'e_mart.api.get_series_stats',
                    type: 'GET'
                });
                
                if (response.message) {
                    this.updateDashboardStats(response.message);
                }
            } catch (error) {
                console.warn('Failed to update series stats:', error);
            }
        }, 30000);
    }

    updateDashboardStats(stats) {
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                const currentValue = parseInt(element.textContent) || 0;
                if (currentValue !== value) {
                    this.animateCounter(element, currentValue, value, 500);
                }
            }
        });
    }

    animateCounter(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = Math.floor(current);
            
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
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

        // Add auto-save functionality
        this.setupAutoSave(form);
    }

    setupAutoSave(form) {
        const inputs = form.querySelectorAll('input, select');
        let autoSaveTimeout;
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    this.autoSaveForm(form);
                }, 2000);
            });
        });
    }

    async autoSaveForm(form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            await frappe.call({
                method: 'e_mart.api.auto_save_series_settings',
                args: { data }
            });
            
            this.showToast('Settings auto-saved', 'info', 1000);
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    setupSeriesValidation() {
        // Custom validation rules for series
        this.validationRules.set('series-format', (value) => {
            const formatRegex = /^[A-Z]+-[0-9#]+-[0-9#]+$/;
            return formatRegex.test(value);
        });
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

    async handleSeriesGeneration(event) {
        const button = event.target;
        this.showButtonLoading(button);
        
        try {
            const response = await frappe.call({
                method: 'e_mart.api.generate_series_number',
                args: this.getSeriesFormData()
            });
            
            if (response.message) {
                this.showToast('Series number generated successfully!', 'success');
                this.updateSeriesDisplay(response.message);
                this.logUserAction('series_generated', response.message);
            }
        } catch (error) {
            this.showToast('Failed to generate series number', 'danger');
            console.error('Series generation failed:', error);
        } finally {
            this.hideButtonLoading(button);
        }
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
                <button class="e-mart-btn e-mart-btn-danger" onclick="window.eMartSeriesUI.confirmSeriesReset()">Reset</button>
                <button class="e-mart-btn e-mart-btn-secondary" onclick="window.eMartUI.hideAllModals()">Cancel</button>
            `
        });
    }

    async confirmSeriesReset() {
        const newStartNumber = document.getElementById('new-start-number').value;
        
        try {
            await frappe.call({
                method: 'e_mart.api.reset_series',
                args: { start_number: parseInt(newStartNumber) }
            });
            
            this.hideAllModals();
            this.showToast(`Series reset to ${newStartNumber}`, 'success');
            this.logUserAction('series_reset', { start_number: newStartNumber });
        } catch (error) {
            this.showToast('Failed to reset series', 'danger');
        }
    }

    async handleSeriesInfo(event) {
        try {
            const response = await frappe.call({
                method: 'e_mart.api.get_series_info',
                type: 'GET'
            });
            
            if (response.message) {
                this.showSeriesInfoModal(response.message);
            }
        } catch (error) {
            this.showToast('Failed to load series information', 'danger');
        }
    }

    showSeriesInfoModal(seriesInfo) {
        const content = `
            <div class="e-mart-series-info">
                <div class="e-mart-series-info-item">
                    <strong>Current Series:</strong> ${this.escapeHtml(seriesInfo.current || 'N/A')}
                </div>
                <div class="e-mart-series-info-item">
                    <strong>Next Series:</strong> ${this.escapeHtml(seriesInfo.next || 'N/A')}
                </div>
                <div class="e-mart-series-info-item">
                    <strong>Format:</strong> ${this.escapeHtml(seriesInfo.format || 'N/A')}
                </div>
                <div class="e-mart-series-info-item">
                    <strong>Prefix:</strong> ${this.escapeHtml(seriesInfo.prefix || 'N/A')}
                </div>
                <div class="e-mart-series-info-item">
                    <strong>Total Generated:</strong> ${seriesInfo.total_generated || 0}
                </div>
                <div class="e-mart-series-info-item">
                    <strong>Last Generated:</strong> ${seriesInfo.last_generated || 'Never'}
                </div>
            </div>
        `;
        
        this.showModal({
            title: 'Series Information',
            content: content
        });
    }

    getSeriesFormData() {
        const form = document.querySelector('.series-form');
        if (!form) return {};
        
        const formData = new FormData(form);
        return Object.fromEntries(formData);
    }

    updateSeriesDisplay(seriesData) {
        // Update UI with new series information
        const currentElement = document.querySelector('[data-current-series]');
        const nextElement = document.querySelector('[data-next-series]');
        
        if (currentElement && seriesData.current) {
            currentElement.textContent = seriesData.current;
        }
        
        if (nextElement && seriesData.next) {
            nextElement.textContent = seriesData.next;
        }
    }
}

// Enhanced Special Purchase Scheme UI with advanced features
class EMartSchemeUI extends EMartUI {
    constructor() {
        super();
        this.setupSchemeComponents();
    }

    setupSchemeComponents() {
        this.setupSchemeCards();
        this.setupSchemeForm();
        this.setupSchemeValidation();
        this.setupSchemeFiltering();
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

        // Add drag and drop for reordering
        this.setupCardDragDrop(card);
        
        // Add context menu
        this.setupCardContextMenu(card);
    }

    setupCardDragDrop(card) {
        card.draggable = true;
        
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.dataset.schemeId);
            card.classList.add('e-mart-dragging');
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('e-mart-dragging');
        });
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData('text/plain');
            if (draggedId !== card.dataset.schemeId) {
                this.reorderSchemes(draggedId, card.dataset.schemeId);
            }
        });
    }

    setupCardContextMenu(card) {
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, card);
        });
    }

    showContextMenu(event, card) {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'e-mart-context-menu';
        contextMenu.innerHTML = `
            <div class="e-mart-context-item" data-action="edit">Edit Scheme</div>
            <div class="e-mart-context-item" data-action="duplicate">Duplicate</div>
            <div class="e-mart-context-item" data-action="disable">Disable</div>
            <div class="e-mart-context-divider"></div>
            <div class="e-mart-context-item e-mart-danger" data-action="delete">Delete</div>
        `;
        
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.top = event.pageY + 'px';
        
        document.body.appendChild(contextMenu);
        
        // Handle menu actions
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.handleContextAction(action, card);
            }
            contextMenu.remove();
        });
        
        // Remove on outside click
        setTimeout(() => {
            document.addEventListener('click', () => {
                contextMenu.remove();
            }, { once: true });
        }, 100);
    }

    handleContextAction(action, card) {
        const schemeId = card.dataset.schemeId;
        
        switch (action) {
            case 'edit':
                this.editScheme(schemeId);
                break;
            case 'duplicate':
                this.duplicateScheme(schemeId);
                break;
            case 'disable':
                this.toggleSchemeStatus(schemeId);
                break;
            case 'delete':
                this.deleteScheme(schemeId);
                break;
        }
    }

    async editScheme(schemeId) {
        try {
            const response = await frappe.call({
                method: 'e_mart.api.get_scheme_details',
                args: { scheme_id: schemeId }
            });
            
            if (response.message) {
                this.showSchemeEditModal(response.message);
            }
        } catch (error) {
            this.showToast('Failed to load scheme details', 'danger');
        }
    }

    showSchemeEditModal(schemeData) {
        this.showModal({
            title: 'Edit Special Purchase Scheme',
            content: this.getSchemeFormHTML(schemeData),
            footer: `
                <button class="e-mart-btn e-mart-btn-primary" onclick="window.eMartSchemeUI.saveScheme()">Save Changes</button>
                <button class="e-mart-btn e-mart-btn-secondary" onclick="window.eMartUI.hideAllModals()">Cancel</button>
            `
        });
        
        // Setup form validation in modal
        setTimeout(() => {
            this.setupModalFormValidation();
        }, 100);
    }

    getSchemeFormHTML(data = {}) {
        return `
            <form id="scheme-edit-form">
                <div class="e-mart-form-group">
                    <label class="e-mart-form-label">Scheme Name</label>
                    <input type="text" name="scheme_name" class="e-mart-form-input" 
                           value="${this.escapeHtml(data.scheme_name || '')}" required>
                </div>
                <div class="e-mart-grid e-mart-grid-2">
                    <div class="e-mart-form-group">
                        <label class="e-mart-form-label">Discount Percentage</label>
                        <input type="number" name="discount_percentage" class="e-mart-form-input" 
                               value="${data.discount_percentage || ''}" min="0" max="100" step="0.01" required>
                    </div>
                    <div class="e-mart-form-group">
                        <label class="e-mart-form-label">Minimum Purchase Amount</label>
                        <input type="number" name="min_purchase_amount" class="e-mart-form-input" 
                               value="${data.min_purchase_amount || ''}" min="0" step="0.01">
                    </div>
                </div>
                <div class="e-mart-grid e-mart-grid-2">
                    <div class="e-mart-form-group">
                        <label class="e-mart-form-label">Valid From</label>
                        <input type="date" name="valid_from" class="e-mart-form-input" 
                               value="${data.valid_from || ''}" required>
                    </div>
                    <div class="e-mart-form-group">
                        <label class="e-mart-form-label">Valid To</label>
                        <input type="date" name="valid_to" class="e-mart-form-input" 
                               value="${data.valid_to || ''}" required>
                    </div>
                </div>
                <div class="e-mart-form-group">
                    <label class="e-mart-form-label">Description</label>
                    <textarea name="description" class="e-mart-form-input" rows="3">${this.escapeHtml(data.description || '')}</textarea>
                </div>
                <div class="e-mart-form-group">
                    <label class="e-mart-form-label">
                        <input type="checkbox" name="is_active" ${data.is_active ? 'checked' : ''}> 
                        Active
                    </label>
                </div>
                <input type="hidden" name="scheme_id" value="${data.name || ''}">
            </form>
        `;
    }

    setupModalFormValidation() {
        const form = document.getElementById('scheme-edit-form');
        if (!form) return;
        
        const discountInput = form.querySelector('input[name="discount_percentage"]');
        const validFromInput = form.querySelector('input[name="valid_from"]');
        const validToInput = form.querySelector('input[name="valid_to"]');
        
        if (discountInput) {
            discountInput.addEventListener('input', (e) => {
                this.validateDiscount(e.target);
            });
        }
        
        if (validFromInput && validToInput) {
            validFromInput.addEventListener('change', () => {
                this.validateDateRange(validFromInput, validToInput);
            });
            
            validToInput.addEventListener('change', () => {
                this.validateDateRange(validFromInput, validToInput);
            });
        }
    }

    async saveScheme() {
        const form = document.getElementById('scheme-edit-form');
        if (!form) return;
        
        if (!this.validateSchemeForm(form)) {
            return;
        }
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await frappe.call({
                method: 'e_mart.api.save_scheme',
                args: { scheme_data: data }
            });
            
            if (response.message) {
                this.hideAllModals();
                this.showToast('Scheme saved successfully', 'success');
                this.refreshSchemeList();
                this.logUserAction('scheme_saved', data);
            }
        } catch (error) {
            this.showToast('Failed to save scheme', 'danger');
            console.error('Scheme save failed:', error);
        }
    }

    setupSchemeFiltering() {
        const filterContainer = document.querySelector('.scheme-filters');
        if (!filterContainer) return;
        
        const searchInput = filterContainer.querySelector('.scheme-search');
        const statusFilter = filterContainer.querySelector('.scheme-status-filter');
        
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.filterSchemes({ search: e.target.value });
            }, 300));
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterSchemes({ status: e.target.value });
            });
        }
    }

    filterSchemes(filters) {
        const schemeCards = document.querySelectorAll('.scheme-card');
        
        schemeCards.forEach(card => {
            let visible = true;
            
            // Search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const cardText = card.textContent.toLowerCase();
                visible = visible && cardText.includes(searchTerm);
            }
            
            // Status filter
            if (filters.status && filters.status !== 'all') {
                const cardStatus = card.dataset.status;
                visible = visible && cardStatus === filters.status;
            }
            
            card.style.display = visible ? '' : 'none';
        });
    }

    validateDiscount(input) {
        const value = parseFloat(input.value);
        
        input.classList.remove('e-mart-error', 'e-mart-success');
        this.hideFieldError(input);
        
        if (value < 0 || value > 100) {
            input.classList.add('e-mart-error');
            this.showFieldError(input, 'Discount must be between 0 and 100%');
            return false;
        } else if (value > 0) {
            input.classList.add('e-mart-success');
        }
        
        return true;
    }

    validateDateRange(fromInput, toInput) {
        const fromDate = new Date(fromInput.value);
        const toDate = new Date(toInput.value);
        
        toInput.classList.remove('e-mart-error', 'e-mart-success');
        this.hideFieldError(toInput);
        
        if (fromDate >= toDate) {
            toInput.classList.add('e-mart-error');
            this.showFieldError(toInput, 'End date must be after start date');
            return false;
        } else {
            toInput.classList.add('e-mart-success');
        }
        
        return true;
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
        
        // Custom validations
        const discountField = form.querySelector('input[name="discount_percentage"]');
        if (discountField && !this.validateDiscount(discountField)) {
            isValid = false;
        }
        
        const validFromField = form.querySelector('input[name="valid_from"]');
        const validToField = form.querySelector('input[name="valid_to"]');
        if (validFromField && validToField && !this.validateDateRange(validFromField, validToField)) {
            isValid = false;
        }
        
        return isValid;
    }

    async refreshSchemeList() {
        // Refresh the scheme list display
        try {
            const response = await frappe.call({
                method: 'e_mart.api.get_scheme_list',
                type: 'GET'
            });
            
            if (response.message) {
                this.updateSchemeDisplay(response.message);
            }
        } catch (error) {
            console.warn('Failed to refresh scheme list:', error);
        }
    }

    updateSchemeDisplay(schemes) {
        const container = document.querySelector('.scheme-container');
        if (!container) return;
        
        // Re-render scheme cards
        container.innerHTML = schemes.map(scheme => this.renderSchemeCard(scheme)).join('');
        
        // Re-enhance the new cards
        const newCards = container.querySelectorAll('.scheme-card');
        newCards.forEach(card => this.enhanceSchemeCard(card));
    }

    renderSchemeCard(scheme) {
        return `
            <div class="scheme-card" data-scheme-id="${scheme.name}" data-status="${scheme.is_active ? 'active' : 'inactive'}">
                <div class="scheme-card-header">
                    <div class="scheme-name">${this.escapeHtml(scheme.scheme_name)}</div>
                    <div class="scheme-code">${this.escapeHtml(scheme.name)}</div>
                </div>
                <div class="scheme-card-body">
                    <div class="scheme-discount">${scheme.discount_percentage}% Discount</div>
                    <div class="scheme-details">
                        <div class="scheme-detail">
                            <div class="scheme-detail-label">Valid From</div>
                            <div class="scheme-detail-value">${scheme.valid_from}</div>
                        </div>
                        <div class="scheme-detail">
                            <div class="scheme-detail-label">Valid To</div>
                            <div class="scheme-detail-value">${scheme.valid_to}</div>
                        </div>
                    </div>
                    <div class="scheme-status">
                        <div class="scheme-status-indicator">
                            <div class="scheme-status-dot ${scheme.is_active ? '' : 'inactive'}"></div>
                            <span>${scheme.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize UI components when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.eMartUI = new EMartUI();
        window.eMartSeriesUI = new EMartSeriesUI();
        window.eMartSchemeUI = new EMartSchemeUI();
        
        // Initialize additional features based on settings
        const settings = window.eMartUI.settings;
        if (settings?.features?.performanceMonitoring) {
            window.eMartUI.enablePerformanceMonitoring();
        }
        
        if (settings?.security) {
            window.eMartUI.enableSecurityFeatures();
        }
        
        console.log('E Mart UI components initialized successfully');
    } catch (error) {
        console.error('Failed to initialize E Mart UI components:', error);
    }
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
    
    // Add to Frappe's ready event
    frappe.ready(() => {
        if (window.eMartUI) {
            window.eMartUI.announceToScreenReader('E Mart application loaded successfully');
        }
    });
}

// Service Worker update handling
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EMartUI, EMartSeriesUI, EMartSchemeUI };
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
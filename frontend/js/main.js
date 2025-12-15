/**
 * Main JavaScript File for Sehat Sathi
 * Contains common functionality used across all pages
 */

// Global configuration
const CONFIG = {
    API_BASE_URL: 'https://api.sehatsathi.com/v1',
    SOCKET_URL: 'wss://api.sehatsathi.com/ws',
    MAPS_API_KEY: 'AIzaSyB6E7h4zL3q6n8cX7Q1r2s3t4u5v6w7x8y9z',
    RAZORPAY_KEY: 'rzp_test_1234567890',
    APP_VERSION: '1.0.0'
};

// User session management
class UserSession {
    constructor() {
        this.user = null;
        this.token = null;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupAutoLogout();
    }

    loadFromStorage() {
        try {
            const userData = localStorage.getItem('user');
            const tokenData = localStorage.getItem('token');
            
            if (userData) {
                this.user = JSON.parse(userData);
            }
            
            if (tokenData) {
                this.token = tokenData;
            }
        } catch (error) {
            console.error('Error loading user session:', error);
            this.clear();
        }
    }

    saveToStorage(user, token) {
        try {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            this.user = user;
            this.token = token;
            
            // Update last activity timestamp
            localStorage.setItem('lastActivity', Date.now().toString());
        } catch (error) {
            console.error('Error saving user session:', error);
        }
    }

    clear() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('rememberMe');
        this.user = null;
        this.token = null;
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getUserRole() {
        return this.user ? this.user.role : null;
    }

    hasPermission(permission) {
        if (!this.user || !this.user.permissions) return false;
        return this.user.permissions.includes(permission);
    }

    setupAutoLogout() {
        // Check last activity every minute
        setInterval(() => {
            const lastActivity = localStorage.getItem('lastActivity');
            const rememberMe = localStorage.getItem('rememberMe');
            
            if (lastActivity && !rememberMe) {
                const inactiveTime = Date.now() - parseInt(lastActivity);
                const maxInactiveTime = 30 * 60 * 1000; // 30 minutes
                
                if (inactiveTime > maxInactiveTime) {
                    this.logout();
                }
            }
        }, 60000); // Check every minute
    }

    logout() {
        this.clear();
        window.location.href = '/pages/login.html';
    }

    updateLastActivity() {
        localStorage.setItem('lastActivity', Date.now().toString());
    }
}

// Initialize user session
const userSession = new UserSession();

// Common UI components
class UIComponents {
    constructor() {
        this.loadingStates = new Map();
        this.modals = new Map();
        this.toasts = [];
        this.init();
    }

    init() {
        this.setupGlobalEventListeners();
        this.injectGlobalStyles();
    }

    setupGlobalEventListeners() {
        // Update last activity on user interaction
        document.addEventListener('click', () => userSession.updateLastActivity());
        document.addEventListener('keypress', () => userSession.updateLastActivity());
        document.addEventListener('scroll', () => userSession.updateLastActivity());
        
        // Handle back button
        window.addEventListener('popstate', (e) => {
            this.handleBackButton(e);
        });
        
        // Handle offline/online events
        window.addEventListener('online', () => {
            this.showNotification('You are back online', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('You are offline. Some features may not work.', 'warning');
        });
    }

    injectGlobalStyles() {
        // Inject CSS for toast notifications
        const style = document.createElement('style');
        style.id = 'global-ui-styles';
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(3px);
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid var(--primary-green);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9998;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            }
            
            .toast {
                padding: 1rem 1.5rem;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                animation: slideIn 0.3s ease;
                box-shadow: var(--shadow);
                max-width: 400px;
            }
            
            .toast.success {
                background-color: #d4edda;
                color: #155724;
                border-left: 4px solid #28a745;
            }
            
            .toast.error {
                background-color: #f8d7da;
                color: #721c24;
                border-left: 4px solid #dc3545;
            }
            
            .toast.warning {
                background-color: #fff3cd;
                color: #856404;
                border-left: 4px solid #ffc107;
            }
            
            .toast.info {
                background-color: #d1ecf1;
                color: #0c5460;
                border-left: 4px solid #17a2b8;
            }
            
            .toast .close {
                margin-left: auto;
                background: none;
                border: none;
                font-size: 1.25rem;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .toast .close:hover {
                opacity: 1;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        if (!document.getElementById('global-ui-styles')) {
            document.head.appendChild(style);
        }
    }

    // Loading states
    showLoading(containerId = 'app') {
        const container = document.getElementById(containerId) || document.body;
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loading-overlay';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        
        overlay.appendChild(spinner);
        container.appendChild(overlay);
        
        return overlay;
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }

    // Toast notifications
    showNotification(message, type = 'info', duration = 5000) {
        // Create toast container if it doesn't exist
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            ${icon}
            <span>${message}</span>
            <button class="close">&times;</button>
        `;
        
        // Add to container
        container.appendChild(toast);
        
        // Auto remove
        const removeToast = () => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        };
        
        // Close button
        toast.querySelector('.close').addEventListener('click', removeToast);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(removeToast, duration);
        }
        
        // Store reference
        this.toasts.push(toast);
        
        return toast;
    }

    getToastIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }

    // Confirmation dialog
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const modalId = 'confirm-modal-' + Date.now();
            const title = options.title || 'Confirm';
            const confirmText = options.confirmText || 'Confirm';
            const cancelText = options.cancelText || 'Cancel';
            const danger = options.danger || false;
            
            const modalHTML = `
                <div class="modal" id="${modalId}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${title}</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" id="cancel-btn">${cancelText}</button>
                            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-btn">${confirmText}</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Inject modal
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const modal = document.getElementById(modalId);
            
            // Show modal
            setTimeout(() => modal.classList.add('show'), 10);
            
            // Event handlers
            const confirmBtn = modal.querySelector('#confirm-btn');
            const cancelBtn = modal.querySelector('#cancel-btn');
            const closeBtn = modal.querySelector('.close-modal');
            
            const closeModal = (result) => {
                modal.classList.remove('show');
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                    resolve(result);
                }, 300);
            };
            
            confirmBtn.addEventListener('click', () => closeModal(true));
            cancelBtn.addEventListener('click', () => closeModal(false));
            closeBtn.addEventListener('click', () => closeModal(false));
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(false);
                }
            });
            
            // Close on escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closeModal(false);
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    }

    // Form validation
    validateForm(form, rules) {
        const errors = {};
        let isValid = true;
        
        for (const [field, rule] of Object.entries(rules)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (!input) continue;
            
            const value = input.value.trim();
            const errorElement = document.getElementById(`${field}-error`) || 
                               input.nextElementSibling?.classList?.contains('error-message') ? 
                               input.nextElementSibling : null;
            
            // Clear previous error
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
            
            // Check required
            if (rule.required && !value) {
                errors[field] = rule.message || 'This field is required';
                isValid = false;
                continue;
            }
            
            // Check pattern
            if (rule.pattern && value) {
                const pattern = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
                if (!pattern.test(value)) {
                    errors[field] = rule.message || 'Invalid format';
                    isValid = false;
                    continue;
                }
            }
            
            // Check min length
            if (rule.minLength && value.length < rule.minLength) {
                errors[field] = rule.message || `Minimum ${rule.minLength} characters required`;
                isValid = false;
                continue;
            }
            
            // Check max length
            if (rule.maxLength && value.length > rule.maxLength) {
                errors[field] = rule.message || `Maximum ${rule.maxLength} characters allowed`;
                isValid = false;
                continue;
            }
            
            // Custom validation
            if (rule.validate && typeof rule.validate === 'function') {
                const customError = rule.validate(value, form);
                if (customError) {
                    errors[field] = customError;
                    isValid = false;
                }
            }
        }
        
        // Display errors
        for (const [field, error] of Object.entries(errors)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (!input) continue;
            
            let errorElement = document.getElementById(`${field}-error`);
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.id = `${field}-error`;
                input.parentNode.appendChild(errorElement);
            }
            
            errorElement.textContent = error;
            errorElement.style.display = 'block';
            
            // Add error class to input
            input.classList.add('error');
        }
        
        return { isValid, errors };
    }

    // File upload helper
    async uploadFile(file, options = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        if (options.folder) {
            formData.append('folder', options.folder);
        }
        
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userSession.token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    // Handle back button
    handleBackButton(e) {
        // You can add custom back button handling here
        console.log('Back button pressed', e);
    }

    // Format date
    formatDate(date, format = 'long') {
        const d = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - d);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (format === 'relative') {
            if (diffDays === 0) {
                return 'Today';
            } else if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            }
        }
        
        const options = {
            year: 'numeric',
            month: format === 'short' ? 'short' : 'long',
            day: 'numeric'
        };
        
        if (format === 'datetime') {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return d.toLocaleDateString('en-US', options);
    }

    // Format currency
    formatCurrency(amount, currency = 'INR') {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Copy to clipboard
    copyToClipboard(text) {
        return new Promise((resolve, reject) => {
            navigator.clipboard.writeText(text)
                .then(() => {
                    this.showNotification('Copied to clipboard', 'success');
                    resolve();
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    reject(err);
                });
        });
    }

    // Debounce function
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

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize UI components
const ui = new UIComponents();

// Export for use in other modules
window.ui = ui;
window.userSession = userSession;
window.CONFIG = CONFIG;

// Global event handlers
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication on protected pages
    const protectedPages = ['dashboard', 'appointment', 'doctors', 'chatbot'];
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    if (protectedPages.includes(currentPage) && !userSession.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }
    
    // Add active class to current page in navigation
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.dataset.tooltip;
            tooltip.style.position = 'absolute';
            tooltip.style.background = '#333';
            tooltip.style.color = '#fff';
            tooltip.style.padding = '5px 10px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '12px';
            tooltip.style.zIndex = '10000';
            tooltip.style.whiteSpace = 'nowrap';
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.left = (rect.left + (rect.width - tooltip.offsetWidth) / 2) + 'px';
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip && this._tooltip.parentNode) {
                this._tooltip.parentNode.removeChild(this._tooltip);
            }
        });
    });
    
    // Handle form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                
                // Re-enable button after 5 seconds if still disabled
                setTimeout(() => {
                    if (submitBtn.disabled) {
                        submitBtn.disabled = false;
                    }
                }, 5000);
            }
        });
    });
    
    // Log page view for analytics
    if (userSession.isAuthenticated()) {
        const pageData = {
            page: currentPage,
            timestamp: new Date().toISOString(),
            user_id: userSession.user.id
        };
        
        // You can send this to your analytics service
        console.log('Page view:', pageData);
    }
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    
    // Don't show error notifications for network errors in production
    if (CONFIG.API_BASE_URL.includes('localhost') || CONFIG.API_BASE_URL.includes('127.0.0.1')) {
        ui.showNotification(`Error: ${e.error.message}`, 'error');
    }
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    ui.showNotification('An unexpected error occurred', 'error');
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
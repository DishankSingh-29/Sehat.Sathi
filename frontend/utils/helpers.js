/**
 * Utility Helper Functions for Sehat Sathi
 * Common helper functions used throughout the application
 */

class Helpers {
    constructor() {
        // Initialize any required properties
    }

    // Date & Time Helpers
    formatDate(date, format = 'medium') {
        if (!date) return '';
        
        const dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime())) {
            return 'Invalid date';
        }
        
        const formats = {
            'short': {
                date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            },
            'medium': {
                date: dateObj.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                }),
                time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            },
            'long': {
                date: dateObj.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                }),
                time: dateObj.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                })
            },
            'date-only': dateObj.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
            }),
            'time-only': dateObj.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
            })
        };
        
        if (format === 'date-only' || format === 'time-only') {
            return formats[format];
        }
        
        return `${formats[format].date} at ${formats[format].time}`;
    }

    getRelativeTime(date) {
        if (!date) return '';
        
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffWeek = Math.floor(diffDay / 7);
        const diffMonth = Math.floor(diffDay / 30);
        const diffYear = Math.floor(diffDay / 365);
        
        if (diffYear > 0) {
            return diffYear === 1 ? '1 year ago' : `${diffYear} years ago`;
        }
        if (diffMonth > 0) {
            return diffMonth === 1 ? '1 month ago' : `${diffMonth} months ago`;
        }
        if (diffWeek > 0) {
            return diffWeek === 1 ? '1 week ago' : `${diffWeek} weeks ago`;
        }
        if (diffDay > 0) {
            return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
        }
        if (diffHour > 0) {
            return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
        }
        if (diffMin > 0) {
            return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
        }
        if (diffSec > 0) {
            return diffSec === 1 ? '1 second ago' : `${diffSec} seconds ago`;
        }
        
        return 'Just now';
    }

    formatDuration(minutes) {
        if (!minutes || minutes < 0) return '';
        
        if (minutes < 60) {
            return `${minutes} min`;
        }
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (remainingMinutes === 0) {
            return `${hours} hr`;
        }
        
        return `${hours} hr ${remainingMinutes} min`;
    }

    // String Helpers
    truncateText(text, maxLength = 100, suffix = '...') {
        if (!text || text.length <= maxLength) return text;
        
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    capitalizeWords(text) {
        if (!text) return '';
        
        return text.replace(/\b\w/g, char => char.toUpperCase());
    }

    slugify(text) {
        if (!text) return '';
        
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    }

    parseQueryString(queryString) {
        if (!queryString) return {};
        
        if (queryString.startsWith('?')) {
            queryString = queryString.substring(1);
        }
        
        const params = {};
        const pairs = queryString.split('&');
        
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
            }
        });
        
        return params;
    }

    buildQueryString(params) {
        if (!params || Object.keys(params).length === 0) {
            return '';
        }
        
        const queryParams = [];
        
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
            }
        });
        
        return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    }

    // Validation Helpers
    isValidEmail(email) {
        if (!email) return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    isValidPhone(phone) {
        if (!phone) return false;
        
        // Basic phone validation - accepts various formats
        const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
        const digitsOnly = phone.replace(/\D/g, '');
        
        return phoneRegex.test(phone) && digitsOnly.length >= 10;
    }

    isValidPassword(password) {
        if (!password) return false;
        
        // At least 8 characters, containing at least one letter and one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    validateRequiredFields(fields, data) {
        const errors = {};
        
        fields.forEach(field => {
            if (!data[field] || data[field].toString().trim() === '') {
                errors[field] = `${this.capitalizeWords(field.replace(/([A-Z])/g, ' $1'))} is required`;
            }
        });
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    // Number Helpers
    formatCurrency(amount, currency = 'INR', locale = 'en-IN') {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatNumber(number, decimals = 0) {
        if (typeof number !== 'number') {
            number = parseFloat(number) || 0;
        }
        
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    roundToDecimal(number, decimals = 2) {
        if (typeof number !== 'number') {
            number = parseFloat(number) || 0;
        }
        
        const factor = Math.pow(10, decimals);
        return Math.round(number * factor) / factor;
    }

    // Array Helpers
    chunkArray(array, size) {
        if (!Array.isArray(array) || array.length === 0) {
            return [];
        }
        
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        
        return chunks;
    }

    uniqueArray(array, key = null) {
        if (!Array.isArray(array) || array.length === 0) {
            return [];
        }
        
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const value = item[key];
                if (seen.has(value)) {
                    return false;
                }
                seen.add(value);
                return true;
            });
        }
        
        return [...new Set(array)];
    }

    sortByKey(array, key, order = 'asc') {
        if (!Array.isArray(array) || array.length === 0) {
            return [];
        }
        
        return [...array].sort((a, b) => {
            let aValue = a[key];
            let bValue = b[key];
            
            // Handle different data types
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Object Helpers
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
        
        return obj;
    }

    mergeObjects(target, source) {
        const result = this.deepClone(target);
        
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeObjects(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        });
        
        return result;
    }

    filterObject(obj, predicate) {
        if (!obj || typeof obj !== 'object') {
            return {};
        }
        
        const filtered = {};
        
        Object.keys(obj).forEach(key => {
            if (predicate(obj[key], key)) {
                filtered[key] = obj[key];
            }
        });
        
        return filtered;
    }

    // DOM Helpers
    showLoading(selector = 'body', message = 'Loading...') {
        const target = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!target) return;
        
        // Remove existing loading overlay
        const existingOverlay = target.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                ${message ? `<div class="loading-message">${message}</div>` : ''}
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .loading-spinner {
                text-align: center;
            }
            .loading-spinner .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            .loading-message {
                color: #333;
                font-size: 0.9rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        overlay.appendChild(style);
        target.style.position = 'relative';
        target.appendChild(overlay);
        
        return overlay;
    }

    hideLoading(selector = 'body') {
        const target = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!target) return;
        
        const overlay = target.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showToast(message, type = 'info', duration = 5000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(toast => toast.remove());
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        
        const icon = type === 'error' ? 'fas fa-exclamation-circle' :
                    type === 'success' ? 'fas fa-check-circle' :
                    type === 'warning' ? 'fas fa-exclamation-triangle' :
                    'fas fa-info-circle';
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        const styleId = 'toast-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .toast-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #333;
                    color: white;
                    padding: 12px 24px;
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow);
                    z-index: 10000;
                    animation: toastSlideIn 0.3s ease forwards;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    max-width: 400px;
                }
                .toast-notification.success {
                    background: #2ecc71;
                }
                .toast-notification.error {
                    background: #e74c3c;
                }
                .toast-notification.warning {
                    background: #f39c12;
                }
                .toast-notification.info {
                    background: #3498db;
                }
                @keyframes toastSlideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes toastSlideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Auto-remove after duration
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
        
        return toast;
    }

    showModal(title, content, options = {}) {
        const modalId = options.id || 'modal-' + Date.now();
        const size = options.size || 'medium';
        const showFooter = options.showFooter !== false;
        
        // Remove existing modal with same ID
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal" id="${modalId}">
                <div class="modal-content modal-${size}">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="close-modal" onclick="helpers.closeModal('${modalId}')">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${showFooter ? `
                    <div class="modal-footer">
                        ${options.cancelText ? `
                        <button class="btn btn-secondary" onclick="helpers.closeModal('${modalId}')">
                            ${options.cancelText}
                        </button>` : ''}
                        ${options.confirmText ? `
                        <button class="btn btn-primary" id="${modalId}-confirm-btn">
                            ${options.confirmText}
                        </button>` : ''}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = document.getElementById(modalId);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add confirm button event listener
        if (options.confirmText && options.onConfirm) {
            const confirmBtn = document.getElementById(`${modalId}-confirm-btn`);
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    options.onConfirm();
                    this.closeModal(modalId);
                });
            }
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modalId);
            }
        });
        
        // Close on escape key
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modalId);
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        
        document.addEventListener('keydown', closeOnEscape);
        
        return modalId;
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                modal.remove();
            }, 300);
        }
    }

    confirmDialog(message, options = {}) {
        return new Promise((resolve) => {
            const title = options.title || 'Confirm';
            const confirmText = options.confirmText || 'Yes';
            const cancelText = options.cancelText || 'No';
            
            const modalId = this.showModal(title, `
                <p>${message}</p>
            `, {
                showFooter: true,
                confirmText: confirmText,
                cancelText: cancelText,
                onConfirm: () => resolve(true)
            });
            
            // Handle cancel button
            const modal = document.getElementById(modalId);
            if (modal) {
                const cancelBtn = modal.querySelector('.btn-secondary');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        resolve(false);
                        this.closeModal(modalId);
                    });
                }
            }
        });
    }

    // Storage Helpers
    setLocalStorage(key, value, ttl = null) {
        try {
            const item = {
                value: value,
                timestamp: Date.now()
            };
            
            if (ttl) {
                item.expiry = Date.now() + ttl;
            }
            
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Error setting localStorage:', error);
            return false;
        }
    }

    getLocalStorage(key, defaultValue = null) {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return defaultValue;
            
            const item = JSON.parse(itemStr);
            
            // Check if expired
            if (item.expiry && Date.now() > item.expiry) {
                localStorage.removeItem(key);
                return defaultValue;
            }
            
            return item.value;
        } catch (error) {
            console.error('Error getting localStorage:', error);
            return defaultValue;
        }
    }

    removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing localStorage:', error);
            return false;
        }
    }

    clearLocalStorage(prefix = '') {
        try {
            if (prefix) {
                // Remove only items with prefix
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            } else {
                // Clear all
                localStorage.clear();
            }
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // URL Helpers
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    setUrlParameter(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    }

    removeUrlParameter(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.replaceState({}, '', url);
    }

    // Device & Browser Helpers
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        
        return {
            isChrome: /Chrome/.test(ua) && !/Edge|Edg/.test(ua),
            isFirefox: /Firefox/.test(ua),
            isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
            isEdge: /Edge|Edg/.test(ua),
            isIE: /Trident/.test(ua),
            version: ua.match(/(Chrome|Firefox|Safari|Edge|MSIE|Trident)\/([\d.]+)/)?.[2] || 'unknown'
        };
    }

    // Health Data Helpers
    calculateBMI(weight, height) {
        if (!weight || !height || weight <= 0 || height <= 0) {
            return null;
        }
        
        // Convert height from cm to meters
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);
        
        return this.roundToDecimal(bmi, 1);
    }

    getBMICategory(bmi) {
        if (!bmi || bmi <= 0) return 'Unknown';
        
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }

    calculateAge(birthDate) {
        if (!birthDate) return null;
        
        const today = new Date();
        const birth = new Date(birthDate);
        
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    // Color Helpers
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    lightenColor(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const t = percent < 0 ? 0 : 255;
        const p = Math.abs(percent) / 100;
        
        return this.rgbToHex(
            Math.round((t - rgb.r) * p) + rgb.r,
            Math.round((t - rgb.g) * p) + rgb.g,
            Math.round((t - rgb.b) * p) + rgb.b
        );
    }

    // Animation Helpers
    animateValue(element, start, end, duration) {
        if (!element) return;
        
        const startTime = performance.now();
        const diff = end - start;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = start + diff * progress;
            element.textContent = Math.round(currentValue).toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = 0;
        element.style.display = 'block';
        
        let opacity = 0;
        const interval = 16; // ~60fps
        
        const fade = () => {
            opacity += interval / duration;
            element.style.opacity = opacity;
            
            if (opacity < 1) {
                requestAnimationFrame(fade);
            }
        };
        
        requestAnimationFrame(fade);
    }

    fadeOut(element, duration = 300) {
        if (!element) return;
        
        let opacity = 1;
        const interval = 16; // ~60fps
        
        const fade = () => {
            opacity -= interval / duration;
            element.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(fade);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(fade);
    }

    // Performance Helpers
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
        
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // File Helpers
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileExtension(filename) {
        if (!filename) return '';
        
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
    }

    isValidFileType(filename, allowedTypes) {
        if (!filename || !allowedTypes || !Array.isArray(allowedTypes)) {
            return false;
        }
        
        const extension = this.getFileExtension(filename);
        return allowedTypes.includes(extension.toLowerCase());
    }

    // API Response Formatter
    formatApiResponse(data, message = '', success = true) {
        return {
            success: success,
            message: message,
            data: data,
            timestamp: new Date().toISOString()
        };
    }

    // Error Handler
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        const errorMessage = error.message || 'An unexpected error occurred';
        const errorCode = error.code || 'UNKNOWN_ERROR';
        
        // Show user-friendly error message
        this.showToast(`Error: ${errorMessage}`, 'error');
        
        // Return formatted error
        return {
            success: false,
            error: errorMessage,
            code: errorCode,
            context: context,
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize Helpers globally
window.helpers = new Helpers();
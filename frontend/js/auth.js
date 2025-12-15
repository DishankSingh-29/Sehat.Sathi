/**
 * Authentication Module for Sehat Sathi
 * Handles user login, registration, and session management
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Registration form submission
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }

        // Logout buttons
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Auto-fill demo credentials
        const demoLoginBtn = document.getElementById('demo-login-btn');
        if (demoLoginBtn) {
            demoLoginBtn.addEventListener('click', () => this.fillDemoCredentials());
        }
    }

    loadCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                return this.currentUser;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
        return null;
    }

    saveCurrentUser(user) {
        try {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUser = user;
            return true;
        } catch (error) {
            console.error('Error saving user data:', error);
            return false;
        }
    }

    checkAuthState() {
        const publicPages = ['/', '/index.html', '/pages/login.html', '/pages/register.html'];
        const currentPage = window.location.pathname;
        
        if (this.currentUser) {
            // User is logged in
            if (publicPages.includes(currentPage)) {
                window.location.href = '/pages/dashboard.html';
            }
            
            // Update UI with user info
            this.updateUserUI();
        } else {
            // User is not logged in
            if (!publicPages.includes(currentPage) && !currentPage.includes('login') && !currentPage.includes('register')) {
                window.location.href = '/pages/login.html';
            }
        }
    }

    updateUserUI() {
        if (!this.currentUser) return;

        // Update user avatar and name in header
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        
        if (userAvatar) {
            const initials = this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.textContent = initials;
        }
        
        if (userName) {
            userName.textContent = this.currentUser.name;
        }
    }

    async handleLogin() {
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;
        const rememberMe = document.getElementById('remember-me')?.checked;

        if (!email || !password) {
            this.showError('Please enter both email and password');
            return;
        }

        // Show loading state
        this.showLoading('Logging in...');

        try {
            // In production, this would be an API call
            const user = await this.mockLoginAPI(email, password);
            
            if (user) {
                // Save user data
                user.isLoggedIn = true;
                user.lastLogin = new Date().toISOString();
                
                if (rememberMe) {
                    user.rememberMe = true;
                }

                this.saveCurrentUser(user);
                this.showSuccess('Login successful! Redirecting...');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/pages/dashboard.html';
                }, 1000);
            } else {
                this.showError('Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
        }
    }

    async handleRegistration() {
        const name = document.getElementById('register-name')?.value;
        const email = document.getElementById('register-email')?.value;
        const phone = document.getElementById('register-phone')?.value;
        const password = document.getElementById('register-password')?.value;
        const confirmPassword = document.getElementById('register-confirm-password')?.value;
        const terms = document.getElementById('register-terms')?.checked;

        // Validation
        if (!name || !email || !phone || !password || !confirmPassword) {
            this.showError('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            this.showError('Password must be at least 8 characters long');
            return;
        }

        if (!terms) {
            this.showError('Please accept the terms and conditions');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        // Show loading state
        this.showLoading('Creating account...');

        try {
            // In production, this would be an API call
            const user = await this.mockRegisterAPI(name, email, phone, password);
            
            if (user) {
                // Save user data
                user.isLoggedIn = true;
                user.joined = new Date().toISOString();
                
                this.saveCurrentUser(user);
                this.showSuccess('Account created successfully! Redirecting...');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/pages/dashboard.html';
                }, 1000);
            } else {
                this.showError('Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showError('Registration failed. Please try again.');
        }
    }

    handleLogout() {
        if (this.currentUser) {
            // Update user data before logging out
            this.currentUser.isLoggedIn = false;
            this.currentUser.lastLogout = new Date().toISOString();
            
            // Save logout time but keep user data if rememberMe is true
            if (!this.currentUser.rememberMe) {
                localStorage.removeItem('currentUser');
            } else {
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
            
            this.currentUser = null;
        }
        
        // Clear session data
        sessionStorage.clear();
        
        // Show logout message
        this.showSuccess('Logged out successfully');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 500);
    }

    fillDemoCredentials() {
        const loginEmail = document.getElementById('login-email');
        const loginPassword = document.getElementById('login-password');
        
        if (loginEmail && loginPassword) {
            loginEmail.value = 'demo@sehatsathi.com';
            loginPassword.value = 'demo123';
            this.showInfo('Demo credentials filled. Click Login to continue.');
        }
    }

    async mockLoginAPI(email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock user data - in production, this would validate against a backend
        const mockUsers = [
            {
                id: 'user-001',
                name: 'John Smith',
                email: 'demo@sehatsathi.com',
                phone: '+91 9876543210',
                role: 'patient',
                avatar: 'JS'
            },
            {
                id: 'user-002',
                name: 'Priya Sharma',
                email: 'priya@example.com',
                phone: '+91 8765432109',
                role: 'patient',
                avatar: 'PS'
            }
        ];
        
        // Check if email/password matches demo credentials
        if (email === 'demo@sehatsathi.com' && password === 'demo123') {
            return mockUsers[0];
        }
        
        // Check against stored users
        const storedUsers = JSON.parse(localStorage.getItem('sehatSathiUsers')) || [];
        const user = storedUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            return {
                id: user.id || `user-${Date.now()}`,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: 'patient',
                avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase()
            };
        }
        
        return null;
    }

    async mockRegisterAPI(name, email, phone, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user already exists
        const storedUsers = JSON.parse(localStorage.getItem('sehatSathiUsers')) || [];
        const existingUser = storedUsers.find(u => u.email === email);
        
        if (existingUser) {
            throw new Error('User already exists');
        }
        
        // Create new user
        const newUser = {
            id: `user-${Date.now()}`,
            name: name,
            email: email,
            phone: phone,
            password: password, // In production, this would be hashed
            role: 'patient',
            avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
            createdAt: new Date().toISOString()
        };
        
        // Store user
        storedUsers.push(newUser);
        localStorage.setItem('sehatSathiUsers', JSON.stringify(storedUsers));
        
        return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            avatar: newUser.avatar
        };
    }

    // UI Helper Methods
    showLoading(message) {
        const submitBtn = document.querySelector('#login-submit-btn, #register-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
            
            // Store original text for restoration
            submitBtn.dataset.originalText = originalText;
        }
    }

    hideLoading() {
        const submitBtn = document.querySelector('#login-submit-btn, #register-submit-btn');
        if (submitBtn && submitBtn.dataset.originalText) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.dataset.originalText;
        }
    }

    showError(message) {
        this.hideLoading();
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.hideLoading();
        this.showNotification(message, 'success');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.auth-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        
        const icon = type === 'error' ? 'fas fa-exclamation-circle' :
                    type === 'success' ? 'fas fa-check-circle' :
                    'fas fa-info-circle';
        
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#e74c3c' :
                        type === 'success' ? '#2ecc71' :
                        '#3498db'};
            color: white;
            padding: 12px 24px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            z-index: 10000;
            animation: slideIn 0.3s ease forwards;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
        
        // Add animation styles if not already present
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Password strength checker
    checkPasswordStrength(password) {
        if (!password) return { score: 0, text: '' };
        
        let score = 0;
        
        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Complexity checks
        if (/[a-z]/.test(password)) score++; // Lowercase
        if (/[A-Z]/.test(password)) score++; // Uppercase
        if (/[0-9]/.test(password)) score++; // Numbers
        if (/[^A-Za-z0-9]/.test(password)) score++; // Special characters
        
        const strengthText = score <= 2 ? 'Weak' :
                           score <= 4 ? 'Fair' :
                           score <= 5 ? 'Good' : 'Strong';
        
        return { score, text: strengthText };
    }

    // Generate avatar from name
    generateAvatar(name) {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    // Check if user has valid session
    hasValidSession() {
        if (!this.currentUser || !this.currentUser.isLoggedIn) return false;
        
        // Check if session expired (24 hours)
        const lastLogin = new Date(this.currentUser.lastLogin);
        const now = new Date();
        const hoursDiff = (now - lastLogin) / (1000 * 60 * 60);
        
        if (hoursDiff > 24 && !this.currentUser.rememberMe) {
            return false;
        }
        
        return true;
    }
}

// Initialize Auth Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
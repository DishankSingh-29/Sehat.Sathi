/**
 * API Service Module for Sehat Sathi
 * Handles all API communication with the backend
 */

class APIService {
    constructor() {
        this.baseURL = 'https://api.sehatsathi.com/v1';
        this.authToken = null;
        this.init();
    }

    init() {
        this.loadAuthToken();
        this.setupInterceptors();
    }

    loadAuthToken() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                const user = JSON.parse(userData);
                this.authToken = user.authToken || null;
            }
        } catch (error) {
            console.error('Error loading auth token:', error);
        }
    }

    setupInterceptors() {
        // Request interceptor
        this.requestInterceptor = (config) => {
            if (this.authToken) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${this.authToken}`;
            }
            
            config.headers = config.headers || {};
            config.headers['Content-Type'] = 'application/json';
            config.headers['Accept'] = 'application/json';
            
            return config;
        };

        // Response interceptor
        this.responseInterceptor = (response) => {
            return response;
        };

        this.errorInterceptor = (error) => {
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        this.handleUnauthorized();
                        break;
                    case 403:
                        this.handleForbidden();
                        break;
                    case 404:
                        this.handleNotFound();
                        break;
                    case 500:
                        this.handleServerError();
                        break;
                    default:
                        this.handleApiError(error);
                }
            } else if (error.request) {
                this.handleNetworkError();
            } else {
                this.handleRequestError(error);
            }
            
            return Promise.reject(error);
        };
    }

    // Authentication APIs
    async login(email, password) {
        try {
            const response = await this.post('/auth/login', { email, password });
            
            if (response.success && response.data.token) {
                this.authToken = response.data.token;
                this.saveAuthToken(response.data.token);
            }
            
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await this.post('/auth/register', userData);
            
            if (response.success && response.data.token) {
                this.authToken = response.data.token;
                this.saveAuthToken(response.data.token);
            }
            
            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const response = await this.post('/auth/logout');
            this.clearAuthToken();
            return response;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    async verifyToken() {
        try {
            const response = await this.get('/auth/verify');
            return response;
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    }

    // User Profile APIs
    async getUserProfile() {
        try {
            const response = await this.get('/user/profile');
            return response;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    async updateUserProfile(profileData) {
        try {
            const response = await this.put('/user/profile', profileData);
            return response;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    async updateUserPassword(passwordData) {
        try {
            const response = await this.put('/user/password', passwordData);
            return response;
        } catch (error) {
            console.error('Update password error:', error);
            throw error;
        }
    }

    // Doctors APIs
    async getDoctors(filters = {}) {
        try {
            const queryString = this.buildQueryString(filters);
            const response = await this.get(`/doctors${queryString}`);
            return response;
        } catch (error) {
            console.error('Get doctors error:', error);
            throw error;
        }
    }

    async getDoctorById(doctorId) {
        try {
            const response = await this.get(`/doctors/${doctorId}`);
            return response;
        } catch (error) {
            console.error('Get doctor error:', error);
            throw error;
        }
    }

    async getDoctorAvailability(doctorId, date) {
        try {
            const response = await this.get(`/doctors/${doctorId}/availability`, { date });
            return response;
        } catch (error) {
            console.error('Get availability error:', error);
            throw error;
        }
    }

    async searchDoctors(query, filters = {}) {
        try {
            const response = await this.post('/doctors/search', { query, ...filters });
            return response;
        } catch (error) {
            console.error('Search doctors error:', error);
            throw error;
        }
    }

    async getDoctorReviews(doctorId, page = 1) {
        try {
            const response = await this.get(`/doctors/${doctorId}/reviews`, { page });
            return response;
        } catch (error) {
            console.error('Get reviews error:', error);
            throw error;
        }
    }

    async submitDoctorReview(doctorId, reviewData) {
        try {
            const response = await this.post(`/doctors/${doctorId}/reviews`, reviewData);
            return response;
        } catch (error) {
            console.error('Submit review error:', error);
            throw error;
        }
    }

    // Appointments APIs
    async getAppointments(filters = {}) {
        try {
            const queryString = this.buildQueryString(filters);
            const response = await this.get(`/appointments${queryString}`);
            return response;
        } catch (error) {
            console.error('Get appointments error:', error);
            throw error;
        }
    }

    async getAppointmentById(appointmentId) {
        try {
            const response = await this.get(`/appointments/${appointmentId}`);
            return response;
        } catch (error) {
            console.error('Get appointment error:', error);
            throw error;
        }
    }

    async bookAppointment(appointmentData) {
        try {
            const response = await this.post('/appointments', appointmentData);
            return response;
        } catch (error) {
            console.error('Book appointment error:', error);
            throw error;
        }
    }

    async rescheduleAppointment(appointmentId, newDateTime) {
        try {
            const response = await this.put(`/appointments/${appointmentId}/reschedule`, { newDateTime });
            return response;
        } catch (error) {
            console.error('Reschedule appointment error:', error);
            throw error;
        }
    }

    async cancelAppointment(appointmentId, reason) {
        try {
            const response = await this.put(`/appointments/${appointmentId}/cancel`, { reason });
            return response;
        } catch (error) {
            console.error('Cancel appointment error:', error);
            throw error;
        }
    }

    async joinAppointmentCall(appointmentId) {
        try {
            const response = await this.post(`/appointments/${appointmentId}/join-call`);
            return response;
        } catch (error) {
            console.error('Join call error:', error);
            throw error;
        }
    }

    async submitAppointmentFeedback(appointmentId, feedbackData) {
        try {
            const response = await this.post(`/appointments/${appointmentId}/feedback`, feedbackData);
            return response;
        } catch (error) {
            console.error('Submit feedback error:', error);
            throw error;
        }
    }

    // Health Chatbot APIs
    async analyzeSymptoms(symptoms, userContext = {}) {
        try {
            const response = await this.post('/ai/symptom-analysis', { symptoms, userContext });
            return response;
        } catch (error) {
            console.error('Symptom analysis error:', error);
            throw error;
        }
    }

    async getChatResponse(message, chatHistory = []) {
        try {
            const response = await this.post('/ai/chat', { message, chatHistory });
            return response;
        } catch (error) {
            console.error('Chat response error:', error);
            throw error;
        }
    }

    async getMedicationInfo(medicationName) {
        try {
            const response = await this.get(`/ai/medications/${encodeURIComponent(medicationName)}`);
            return response;
        } catch (error) {
            console.error('Medication info error:', error);
            throw error;
        }
    }

    async getHealthAdvice(topic, userProfile = {}) {
        try {
            const response = await this.post('/ai/health-advice', { topic, userProfile });
            return response;
        } catch (error) {
            console.error('Health advice error:', error);
            throw error;
        }
    }

    // Medicine Delivery APIs
    async searchMedicines(query, location = '') {
        try {
            const response = await this.post('/medicines/search', { query, location });
            return response;
        } catch (error) {
            console.error('Search medicines error:', error);
            throw error;
        }
    }

    async getMedicineDetails(medicineId) {
        try {
            const response = await this.get(`/medicines/${medicineId}`);
            return response;
        } catch (error) {
            console.error('Get medicine error:', error);
            throw error;
        }
    }

    async uploadPrescription(formData) {
        try {
            const response = await this.upload('/medicines/upload-prescription', formData);
            return response;
        } catch (error) {
            console.error('Upload prescription error:', error);
            throw error;
        }
    }

    async createOrder(orderData) {
        try {
            const response = await this.post('/medicines/orders', orderData);
            return response;
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    }

    async getOrderStatus(orderId) {
        try {
            const response = await this.get(`/medicines/orders/${orderId}`);
            return response;
        } catch (error) {
            console.error('Get order status error:', error);
            throw error;
        }
    }

    // Lab Tests APIs
    async getLabTests(filters = {}) {
        try {
            const queryString = this.buildQueryString(filters);
            const response = await this.get(`/lab-tests${queryString}`);
            return response;
        } catch (error) {
            console.error('Get lab tests error:', error);
            throw error;
        }
    }

    async bookLabTest(testData) {
        try {
            const response = await this.post('/lab-tests/book', testData);
            return response;
        } catch (error) {
            console.error('Book lab test error:', error);
            throw error;
        }
    }

    async getLabResults() {
        try {
            const response = await this.get('/lab-tests/results');
            return response;
        } catch (error) {
            console.error('Get lab results error:', error);
            throw error;
        }
    }

    // Medical Records APIs
    async getMedicalRecords(filters = {}) {
        try {
            const queryString = this.buildQueryString(filters);
            const response = await this.get(`/medical-records${queryString}`);
            return response;
        } catch (error) {
            console.error('Get medical records error:', error);
            throw error;
        }
    }

    async uploadMedicalRecord(recordData) {
        try {
            const response = await this.post('/medical-records', recordData);
            return response;
        } catch (error) {
            console.error('Upload medical record error:', error);
            throw error;
        }
    }

    async shareMedicalRecord(recordId, shareWith) {
        try {
            const response = await this.post(`/medical-records/${recordId}/share`, { shareWith });
            return response;
        } catch (error) {
            console.error('Share medical record error:', error);
            throw error;
        }
    }

    // Utility Methods
    buildQueryString(params) {
        if (!params || Object.keys(params).length === 0) {
            return '';
        }
        
        const queryParams = new URLSearchParams();
        
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });
        
        const queryString = queryParams.toString();
        return queryString ? `?${queryString}` : '';
    }

    async get(endpoint, params = {}) {
        const queryString = this.buildQueryString(params);
        const url = `${this.baseURL}${endpoint}${queryString}`;
        
        try {
            const config = this.requestInterceptor({ method: 'GET', url });
            
            const response = await fetch(url, config);
            const data = await response.json();
            
            return this.responseInterceptor({ data, status: response.status, headers: response.headers });
        } catch (error) {
            return this.errorInterceptor(error);
        }
    }

    async post(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const config = this.requestInterceptor({
                method: 'POST',
                url,
                body: JSON.stringify(data)
            });
            
            const response = await fetch(url, config);
            const responseData = await response.json();
            
            return this.responseInterceptor({ data: responseData, status: response.status, headers: response.headers });
        } catch (error) {
            return this.errorInterceptor(error);
        }
    }

    async put(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const config = this.requestInterceptor({
                method: 'PUT',
                url,
                body: JSON.stringify(data)
            });
            
            const response = await fetch(url, config);
            const responseData = await response.json();
            
            return this.responseInterceptor({ data: responseData, status: response.status, headers: response.headers });
        } catch (error) {
            return this.errorInterceptor(error);
        }
    }

    async delete(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const config = this.requestInterceptor({
                method: 'DELETE',
                url,
                body: JSON.stringify(data)
            });
            
            const response = await fetch(url, config);
            const responseData = await response.json();
            
            return this.responseInterceptor({ data: responseData, status: response.status, headers: response.headers });
        } catch (error) {
            return this.errorInterceptor(error);
        }
    }

    async upload(endpoint, formData) {
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const config = this.requestInterceptor({
                method: 'POST',
                url,
                body: formData,
                headers: {
                    'Authorization': this.authToken ? `Bearer ${this.authToken}` : ''
                }
            });
            
            // Remove Content-Type for FormData to let browser set it
            delete config.headers['Content-Type'];
            
            const response = await fetch(url, config);
            const responseData = await response.json();
            
            return this.responseInterceptor({ data: responseData, status: response.status, headers: response.headers });
        } catch (error) {
            return this.errorInterceptor(error);
        }
    }

    // Token Management
    saveAuthToken(token) {
        try {
            this.authToken = token;
            
            // Save to localStorage
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                const user = JSON.parse(userData);
                user.authToken = token;
                localStorage.setItem('currentUser', JSON.stringify(user));
            }
            
            return true;
        } catch (error) {
            console.error('Error saving auth token:', error);
            return false;
        }
    }

    clearAuthToken() {
        this.authToken = null;
        
        // Remove from localStorage
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            const user = JSON.parse(userData);
            delete user.authToken;
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
    }

    // Error Handlers
    handleUnauthorized() {
        // Clear auth token
        this.clearAuthToken();
        
        // Show notification
        this.showNotification('Your session has expired. Please login again.', 'error');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 2000);
    }

    handleForbidden() {
        this.showNotification('You do not have permission to access this resource.', 'error');
    }

    handleNotFound() {
        this.showNotification('The requested resource was not found.', 'error');
    }

    handleServerError() {
        this.showNotification('Server error. Please try again later.', 'error');
    }

    handleNetworkError() {
        this.showNotification('Network error. Please check your internet connection.', 'error');
    }

    handleRequestError(error) {
        this.showNotification('Request failed. Please try again.', 'error');
        console.error('Request error:', error);
    }

    handleApiError(error) {
        const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
        this.showNotification(errorMessage, 'error');
    }

    // Notification Helper
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.api-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `api-notification ${type}`;
        
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
    }

    // Mock APIs for development (when backend is not available)
    async mockGet(endpoint, params = {}) {
        console.log('Mock GET:', endpoint, params);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock responses based on endpoint
        switch (endpoint) {
            case '/auth/verify':
                return {
                    success: true,
                    data: { valid: true, user: this.getMockUser() }
                };
                
            case '/user/profile':
                return {
                    success: true,
                    data: this.getMockUserProfile()
                };
                
            case '/doctors':
                return {
                    success: true,
                    data: this.getMockDoctors(params)
                };
                
            case '/appointments':
                return {
                    success: true,
                    data: this.getMockAppointments(params)
                };
                
            default:
                return {
                    success: false,
                    error: 'Endpoint not implemented in mock'
                };
        }
    }

    async mockPost(endpoint, data = {}) {
        console.log('Mock POST:', endpoint, data);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock responses based on endpoint
        switch (endpoint) {
            case '/auth/login':
                return {
                    success: true,
                    data: {
                        token: 'mock-jwt-token',
                        user: this.getMockUser()
                    }
                };
                
            case '/auth/register':
                return {
                    success: true,
                    data: {
                        token: 'mock-jwt-token',
                        user: { ...data, id: 'user-' + Date.now() }
                    }
                };
                
            case '/appointments':
                return {
                    success: true,
                    data: {
                        id: 'apt-' + Date.now(),
                        ...data,
                        status: 'scheduled',
                        createdAt: new Date().toISOString()
                    }
                };
                
            case '/ai/symptom-analysis':
                return {
                    success: true,
                    data: this.generateMockSymptomAnalysis(data.symptoms)
                };
                
            default:
                return {
                    success: false,
                    error: 'Endpoint not implemented in mock'
                };
        }
    }

    // Mock Data Generators
    getMockUser() {
        return {
            id: 'user-001',
            name: 'John Smith',
            email: 'demo@sehatsathi.com',
            phone: '+91 9876543210',
            role: 'patient',
            avatar: 'JS'
        };
    }

    getMockUserProfile() {
        return {
            ...this.getMockUser(),
            age: 35,
            gender: 'male',
            bloodGroup: 'O+',
            height: '175 cm',
            weight: '70 kg',
            allergies: ['Penicillin'],
            medicalConditions: ['Hypertension'],
            medications: ['Lisinopril 10mg daily'],
            emergencyContact: {
                name: 'Jane Smith',
                relationship: 'Spouse',
                phone: '+91 8765432109'
            }
        };
    }

    getMockDoctors(filters = {}) {
        const allDoctors = [
            {
                id: 'doc-001',
                name: 'Dr. Rajesh Sharma',
                specialization: 'Cardiologist',
                experience: '15 years',
                rating: 4.8,
                consultationFee: 500,
                languages: ['English', 'Hindi'],
                location: 'Delhi',
                availableSlots: ['09:00', '10:30', '14:00', '15:30'],
                avatar: 'RS'
            },
            {
                id: 'doc-002',
                name: 'Dr. Priya Singh',
                specialization: 'Dermatologist',
                experience: '12 years',
                rating: 4.7,
                consultationFee: 400,
                languages: ['English', 'Hindi', 'Bengali'],
                location: 'Mumbai',
                availableSlots: ['10:00', '11:30', '16:00', '17:30'],
                avatar: 'PS'
            },
            {
                id: 'doc-003',
                name: 'Dr. Amit Verma',
                specialization: 'General Physician',
                experience: '8 years',
                rating: 4.6,
                consultationFee: 300,
                languages: ['English', 'Hindi'],
                location: 'Bangalore',
                availableSlots: ['09:30', '11:00', '14:30', '16:00'],
                avatar: 'AV'
            },
            {
                id: 'doc-004',
                name: 'Dr. Anjali Desai',
                specialization: 'Gynecologist',
                experience: '18 years',
                rating: 4.9,
                consultationFee: 600,
                languages: ['English', 'Hindi', 'Marathi'],
                location: 'Pune',
                availableSlots: ['10:00', '12:00', '15:00', '17:00'],
                avatar: 'AD'
            },
            {
                id: 'doc-005',
                name: 'Dr. Sanjay Kumar',
                specialization: 'Orthopedic',
                experience: '20 years',
                rating: 4.8,
                consultationFee: 700,
                languages: ['English', 'Hindi', 'Tamil'],
                location: 'Chennai',
                availableSlots: ['09:00', '11:00', '14:00', '16:00'],
                avatar: 'SK'
            }
        ];
        
        // Apply filters
        let filteredDoctors = [...allDoctors];
        
        if (filters.specialization) {
            filteredDoctors = filteredDoctors.filter(doc => 
                doc.specialization.toLowerCase().includes(filters.specialization.toLowerCase())
            );
        }
        
        if (filters.location) {
            filteredDoctors = filteredDoctors.filter(doc => 
                doc.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }
        
        if (filters.experience) {
            const [min, max] = filters.experience.split('-').map(Number);
            filteredDoctors = filteredDoctors.filter(doc => {
                const expYears = parseInt(doc.experience);
                return expYears >= min && expYears <= (max || Infinity);
            });
        }
        
        if (filters.language) {
            filteredDoctors = filteredDoctors.filter(doc =>
                doc.languages.some(lang => 
                    lang.toLowerCase().includes(filters.language.toLowerCase())
                )
            );
        }
        
        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedDoctors = filteredDoctors.slice(startIndex, endIndex);
        
        return {
            doctors: paginatedDoctors,
            total: filteredDoctors.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(filteredDoctors.length / limit)
        };
    }

    getMockAppointments(filters = {}) {
        const now = new Date();
        const mockAppointments = [
            {
                id: 'apt-001',
                doctorId: 'doc-001',
                doctorName: 'Dr. Rajesh Sharma',
                specialization: 'Cardiologist',
                dateTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
                type: 'video',
                status: 'scheduled',
                duration: 30,
                notes: 'Follow-up consultation',
                symptoms: ['Chest pain', 'Shortness of breath']
            },
            {
                id: 'apt-002',
                doctorId: 'doc-002',
                doctorName: 'Dr. Priya Singh',
                specialization: 'Dermatologist',
                dateTime: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
                type: 'in-person',
                status: 'scheduled',
                duration: 45,
                notes: 'Skin checkup',
                symptoms: ['Skin rash', 'Itching']
            },
            {
                id: 'apt-003',
                doctorId: 'doc-003',
                doctorName: 'Dr. Amit Verma',
                specialization: 'General Physician',
                dateTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'video',
                status: 'completed',
                duration: 20,
                notes: 'General consultation',
                symptoms: ['Fever', 'Headache']
            }
        ];
        
        // Apply filters
        let filteredAppointments = [...mockAppointments];
        
        if (filters.status) {
            filteredAppointments = filteredAppointments.filter(apt => 
                apt.status === filters.status
            );
        }
        
        // Sort by date (newest first)
        filteredAppointments.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        
        return {
            appointments: filteredAppointments,
            total: filteredAppointments.length
        };
    }

    generateMockSymptomAnalysis(symptoms) {
        const analysis = {
            id: 'analysis-' + Date.now(),
            symptoms: [],
            severity: 'low',
            confidence: 0.7,
            recommendations: [],
            suggestedActions: [],
            timestamp: new Date().toISOString()
        };
        
        // Simple symptom detection
        const symptomText = symptoms.toLowerCase();
        
        if (symptomText.includes('headache')) {
            analysis.symptoms.push('Headache');
            analysis.severity = symptomText.includes('severe') ? 'high' : 'medium';
            analysis.recommendations.push(
                'Rest in a quiet, dark environment',
                'Stay hydrated',
                'Consider over-the-counter pain relief if appropriate'
            );
        }
        
        if (symptomText.includes('fever')) {
            analysis.symptoms.push('Fever');
            analysis.severity = analysis.severity === 'high' ? 'high' : 'medium';
            analysis.recommendations.push(
                'Monitor temperature regularly',
                'Stay hydrated',
                'Rest and maintain comfortable room temperature'
            );
        }
        
        if (symptomText.includes('cough') || symptomText.includes('cold')) {
            analysis.symptoms.push('Respiratory symptoms');
            analysis.recommendations.push(
                'Use a humidifier',
                'Stay hydrated with warm liquids',
                'Avoid irritants'
            );
        }
        
        // Default if no specific symptoms detected
        if (analysis.symptoms.length === 0) {
            analysis.symptoms = ['General symptoms'];
            analysis.recommendations = [
                'Monitor symptoms',
                'Rest and maintain hydration',
                'Consult doctor if symptoms worsen or persist'
            ];
        }
        
        // Add suggested actions based on severity
        if (analysis.severity === 'high') {
            analysis.suggestedActions = ['Consult doctor within 24 hours'];
        } else if (analysis.severity === 'medium') {
            analysis.suggestedActions = ['Consult doctor if symptoms persist beyond 3 days'];
        } else {
            analysis.suggestedActions = ['Self-care, monitor symptoms'];
        }
        
        return analysis;
    }
}

// Initialize API Service
window.apiService = new APIService();
/**
 * Dashboard Module for Sehat Sathi
 * Handles dashboard functionality and user data
 */

class DashboardManager {
    constructor() {
        this.user = null;
        this.appointments = [];
        this.recentActivities = [];
        this.healthStats = {};
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.loadDashboardData();
        this.updateDashboardUI();
    }

    loadUserData() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                this.user = JSON.parse(userData);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    setupEventListeners() {
        // Quick action buttons
        const quickConsultBtn = document.getElementById('quick-consult-btn');
        if (quickConsultBtn) {
            quickConsultBtn.addEventListener('click', () => {
                window.location.href = 'chatbot.html';
            });
        }

        const bookAppointmentBtn = document.getElementById('book-appointment-btn');
        if (bookAppointmentBtn) {
            bookAppointmentBtn.addEventListener('click', () => {
                window.location.href = 'doctors.html';
            });
        }

        const orderMedicineBtn = document.getElementById('order-medicine-btn');
        if (orderMedicineBtn) {
            orderMedicineBtn.addEventListener('click', () => {
                window.location.href = '../index.html#medicine-delivery';
            });
        }

        const labTestsBtn = document.getElementById('lab-tests-btn');
        if (labTestsBtn) {
            labTestsBtn.addEventListener('click', () => {
                window.location.href = '../index.html#lab-tests';
            });
        }

        // View all buttons
        const viewAllAppointmentsBtn = document.getElementById('view-all-appointments');
        if (viewAllAppointmentsBtn) {
            viewAllAppointmentsBtn.addEventListener('click', () => {
                window.location.href = 'appointment.html';
            });
        }

        const viewAllActivitiesBtn = document.getElementById('view-all-activities');
        if (viewAllActivitiesBtn) {
            viewAllActivitiesBtn.addEventListener('click', () => {
                this.showAllActivities();
            });
        }

        // Refresh data button
        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }

        // Profile edit button
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.editProfile();
            });
        }
    }

    async loadDashboardData() {
        try {
            // Show loading state
            this.showLoading();
            
            // Load appointments
            await this.loadAppointments();
            
            // Load recent activities
            await this.loadRecentActivities();
            
            // Load health statistics
            await this.loadHealthStats();
            
            // Hide loading
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
            this.hideLoading();
        }
    }

    async loadAppointments() {
        // Try to load from API first, then fallback to localStorage
        try {
            // In production, this would be an API call
            // const response = await fetch('/api/appointments');
            // this.appointments = await response.json();
            
            // For demo, use localStorage data
            const savedAppointments = localStorage.getItem('userAppointments');
            if (savedAppointments) {
                this.appointments = JSON.parse(savedAppointments);
            } else {
                // Generate sample appointments
                this.appointments = this.generateSampleAppointments();
                localStorage.setItem('userAppointments', JSON.stringify(this.appointments));
            }
            
            this.updateAppointmentsUI();
            
        } catch (error) {
            console.error('Error loading appointments:', error);
            throw error;
        }
    }

    async loadRecentActivities() {
        try {
            // In production, this would be an API call
            const savedActivities = localStorage.getItem('userActivities');
            if (savedActivities) {
                this.recentActivities = JSON.parse(savedActivities);
            } else {
                // Generate sample activities
                this.recentActivities = this.generateSampleActivities();
                localStorage.setItem('userActivities', JSON.stringify(this.recentActivities));
            }
            
            this.updateActivitiesUI();
            
        } catch (error) {
            console.error('Error loading activities:', error);
            throw error;
        }
    }

    async loadHealthStats() {
        try {
            // In production, this would be an API call
            const savedStats = localStorage.getItem('userHealthStats');
            if (savedStats) {
                this.healthStats = JSON.parse(savedStats);
            } else {
                // Generate sample stats
                this.healthStats = this.generateSampleHealthStats();
                localStorage.setItem('userHealthStats', JSON.stringify(this.healthStats));
            }
            
            this.updateHealthStatsUI();
            
        } catch (error) {
            console.error('Error loading health stats:', error);
            throw error;
        }
    }

    updateDashboardUI() {
        // Update user welcome message
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage && this.user) {
            const timeOfDay = this.getTimeOfDay();
            welcomeMessage.textContent = `Good ${timeOfDay}, ${this.user.name}!`;
        }
        
        // Update user avatar
        const userAvatar = document.getElementById('dashboard-user-avatar');
        if (userAvatar && this.user) {
            userAvatar.textContent = this.user.avatar || 
                this.user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        
        // Update last login time
        const lastLogin = document.getElementById('last-login-time');
        if (lastLogin && this.user && this.user.lastLogin) {
            const lastLoginDate = new Date(this.user.lastLogin);
            const now = new Date();
            const diffMs = now - lastLoginDate;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            let timeAgo = '';
            if (diffDays > 0) {
                timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else if (diffHours > 0) {
                timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else if (diffMins > 0) {
                timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
            } else {
                timeAgo = 'Just now';
            }
            
            lastLogin.textContent = `Last login: ${timeAgo}`;
        }
    }

    updateAppointmentsUI() {
        const appointmentsContainer = document.getElementById('upcoming-appointments');
        const appointmentsCount = document.getElementById('appointments-count');
        
        if (!appointmentsContainer) return;
        
        // Filter upcoming appointments (next 7 days)
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcomingAppointments = this.appointments.filter(apt => {
            const aptDate = new Date(apt.dateTime);
            return aptDate > now && aptDate < nextWeek && apt.status === 'scheduled';
        }).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
          .slice(0, 3); // Show only next 3 appointments
        
        // Update count
        if (appointmentsCount) {
            appointmentsCount.textContent = upcomingAppointments.length;
        }
        
        if (upcomingAppointments.length === 0) {
            appointmentsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No upcoming appointments</p>
                    <a href="doctors.html" class="btn btn-secondary btn-sm">Book Now</a>
                </div>
            `;
            return;
        }
        
        // Create appointments list
        appointmentsContainer.innerHTML = '';
        
        upcomingAppointments.forEach((appointment, index) => {
            const aptDate = new Date(appointment.dateTime);
            const formattedDate = aptDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            const formattedTime = aptDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const appointmentCard = document.createElement('div');
            appointmentCard.className = 'appointment-card';
            
            appointmentCard.innerHTML = `
                <div class="appointment-header">
                    <div>
                        <h4>${appointment.doctorName}</h4>
                        <p class="specialty">${appointment.specialty}</p>
                    </div>
                    <span class="badge ${appointment.status}">${appointment.status}</span>
                </div>
                <div class="appointment-details">
                    <div class="detail">
                        <i class="fas fa-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-clock"></i>
                        <span>${formattedTime}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-video"></i>
                        <span>${appointment.type === 'video' ? 'Video Call' : 'In-person'}</span>
                    </div>
                </div>
                <div class="appointment-actions">
                    <button class="btn btn-primary btn-sm join-call-btn" data-id="${appointment.id}">
                        <i class="fas fa-video"></i> Join
                    </button>
                    <button class="btn btn-secondary btn-sm reschedule-btn" data-id="${appointment.id}">
                        <i class="fas fa-calendar-alt"></i> Reschedule
                    </button>
                </div>
            `;
            
            appointmentsContainer.appendChild(appointmentCard);
        });
        
        // Add event listeners to appointment buttons
        this.setupAppointmentActions();
    }

    updateActivitiesUI() {
        const activitiesContainer = document.getElementById('recent-activities');
        const activitiesCount = document.getElementById('activities-count');
        
        if (!activitiesContainer) return;
        
        // Show only recent 5 activities
        const recentActivities = this.recentActivities.slice(0, 5);
        
        // Update count
        if (activitiesCount) {
            activitiesCount.textContent = this.recentActivities.length;
        }
        
        if (recentActivities.length === 0) {
            activitiesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No recent activities</p>
                </div>
            `;
            return;
        }
        
        // Create activities list
        activitiesContainer.innerHTML = '';
        
        recentActivities.forEach((activity, index) => {
            const activityDate = new Date(activity.timestamp);
            const formattedTime = activityDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const iconMap = {
                'consultation': 'fas fa-video',
                'appointment': 'fas fa-calendar-check',
                'prescription': 'fas fa-prescription',
                'medicine': 'fas fa-pills',
                'lab_test': 'fas fa-flask',
                'symptom_check': 'fas fa-stethoscope',
                'payment': 'fas fa-credit-card',
                'profile_update': 'fas fa-user-edit'
            };
            
            const iconClass = iconMap[activity.type] || 'fas fa-info-circle';
            
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.description}</p>
                    <span class="activity-time">${formattedTime}</span>
                </div>
                ${activity.status === 'success' ? 
                    '<i class="fas fa-check-circle success"></i>' : 
                    activity.status === 'pending' ?
                    '<i class="fas fa-clock pending"></i>' :
                    '<i class="fas fa-exclamation-circle error"></i>'}
            `;
            
            activitiesContainer.appendChild(activityItem);
        });
    }

    updateHealthStatsUI() {
        const statsContainer = document.getElementById('health-stats');
        if (!statsContainer || !this.healthStats) return;
        
        // Update each stat card
        const updateStatCard = (statId, value, label, icon, color) => {
            const card = document.getElementById(statId);
            if (card) {
                card.querySelector('.stat-value').textContent = value;
                card.querySelector('.stat-label').textContent = label;
                card.querySelector('.stat-icon i').className = icon;
                card.style.setProperty('--stat-color', color);
            }
        };
        
        // Update stats from healthStats object
        if (this.healthStats.consultations) {
            updateStatCard('stat-consultations', 
                this.healthStats.consultations, 
                'Consultations', 
                'fas fa-video', 
                '#3498db'
            );
        }
        
        if (this.healthStats.prescriptions) {
            updateStatCard('stat-prescriptions', 
                this.healthStats.prescriptions, 
                'Prescriptions', 
                'fas fa-prescription', 
                '#2ecc71'
            );
        }
        
        if (this.healthStats.labTests) {
            updateStatCard('stat-labtests', 
                this.healthStats.labTests, 
                'Lab Tests', 
                'fas fa-flask', 
                '#9b59b6'
            );
        }
        
        if (this.healthStats.medicines) {
            updateStatCard('stat-medicines', 
                this.healthStats.medicines, 
                'Medicines', 
                'fas fa-pills', 
                '#e74c3c'
            );
        }
        
        // Update health score gauge
        const healthScore = document.getElementById('health-score-value');
        const healthScoreCircle = document.querySelector('.health-score-circle');
        
        if (healthScore && this.healthStats.healthScore) {
            healthScore.textContent = this.healthStats.healthScore;
            
            // Calculate circle progress (0-100 to 0-283)
            const score = Math.min(Math.max(this.healthStats.healthScore, 0), 100);
            const circumference = 283; // 2 * π * 45
            const offset = circumference - (score / 100) * circumference;
            
            if (healthScoreCircle) {
                const circlePath = healthScoreCircle.querySelector('.circle-progress');
                if (circlePath) {
                    circlePath.style.strokeDashoffset = offset;
                    
                    // Set color based on score
                    let color;
                    if (score >= 80) color = '#2ecc71';
                    else if (score >= 60) color = '#f39c12';
                    else color = '#e74c3c';
                    
                    circlePath.style.stroke = color;
                }
            }
        }
    }

    setupAppointmentActions() {
        // Join call buttons
        const joinCallBtns = document.querySelectorAll('.join-call-btn');
        joinCallBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appointmentId = e.target.closest('.join-call-btn').dataset.id;
                this.joinAppointmentCall(appointmentId);
            });
        });
        
        // Reschedule buttons
        const rescheduleBtns = document.querySelectorAll('.reschedule-btn');
        rescheduleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appointmentId = e.target.closest('.reschedule-btn').dataset.id;
                this.rescheduleAppointment(appointmentId);
            });
        });
    }

    joinAppointmentCall(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) {
            this.showError('Appointment not found');
            return;
        }
        
        // Check if appointment is in the future
        const now = new Date();
        const aptTime = new Date(appointment.dateTime);
        const timeDiff = aptTime - now;
        
        // Allow joining 10 minutes before scheduled time
        if (timeDiff > 10 * 60 * 1000) {
            this.showError(`Appointment starts at ${aptTime.toLocaleTimeString()}. You can join 10 minutes before.`);
            return;
        }
        
        // Check if appointment is more than 1 hour past
        if (timeDiff < -60 * 60 * 1000) {
            this.showError('This appointment has expired');
            return;
        }
        
        // Redirect to video call page or open modal
        this.showVideoCallModal(appointment);
    }

    rescheduleAppointment(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) {
            this.showError('Appointment not found');
            return;
        }
        
        // Show rescheduling modal
        this.showRescheduleModal(appointment);
    }

    showVideoCallModal(appointment) {
        // Create video call modal
        const modalHTML = `
            <div class="modal" id="video-call-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Join Video Consultation</h3>
                        <button class="close-modal" id="close-video-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="call-info">
                            <div class="doctor-info">
                                <div class="doctor-avatar">${appointment.doctorName.split(' ').map(n => n[0]).join('')}</div>
                                <div>
                                    <h4>${appointment.doctorName}</h4>
                                    <p>${appointment.specialty}</p>
                                </div>
                            </div>
                            <div class="call-details">
                                <p><i class="fas fa-clock"></i> ${new Date(appointment.dateTime).toLocaleTimeString()}</p>
                                <p><i class="fas fa-calendar"></i> ${new Date(appointment.dateTime).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div class="call-actions">
                            <button class="btn btn-primary" id="start-video-call">
                                <i class="fas fa-video"></i> Start Video Call
                            </button>
                            <button class="btn btn-secondary" id="audio-only">
                                <i class="fas fa-phone"></i> Audio Only
                            </button>
                            <button class="btn btn-secondary" id="test-audio">
                                <i class="fas fa-volume-up"></i> Test Audio/Video
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = document.getElementById('video-call-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add event listeners
        const closeBtn = document.getElementById('close-video-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                modal.remove();
            });
        }
        
        const startCallBtn = document.getElementById('start-video-call');
        if (startCallBtn) {
            startCallBtn.addEventListener('click', () => {
                // In production, this would initiate the video call
                window.location.href = `video-call.html?appointment=${appointmentId}`;
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                modal.remove();
            }
        });
    }

    showRescheduleModal(appointment) {
        // Create reschedule modal
        const modalHTML = `
            <div class="modal" id="reschedule-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Reschedule Appointment</h3>
                        <button class="close-modal" id="close-reschedule-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="current-appointment">
                            <p>Current appointment with <strong>${appointment.doctorName}</strong></p>
                            <p>${new Date(appointment.dateTime).toLocaleString()}</p>
                        </div>
                        <div class="reschedule-form">
                            <div class="form-group">
                                <label for="new-date">Select New Date</label>
                                <input type="date" id="new-date" class="form-control" min="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label for="new-time">Select Time Slot</label>
                                <select id="new-time" class="form-control">
                                    <option value="">Choose a time</option>
                                    <option value="09:00">9:00 AM</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="14:00">2:00 PM</option>
                                    <option value="15:00">3:00 PM</option>
                                    <option value="16:00">4:00 PM</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="reschedule-reason">Reason for Rescheduling</label>
                                <textarea id="reschedule-reason" class="form-control" rows="3" placeholder="Optional"></textarea>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-primary" id="confirm-reschedule">Reschedule</button>
                            <button class="btn btn-secondary" id="cancel-reschedule">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = document.getElementById('reschedule-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add event listeners
        const closeBtn = document.getElementById('close-reschedule-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                modal.remove();
            });
        }
        
        const confirmBtn = document.getElementById('confirm-reschedule');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                const newDate = document.getElementById('new-date').value;
                const newTime = document.getElementById('new-time').value;
                
                if (!newDate || !newTime) {
                    this.showError('Please select both date and time');
                    return;
                }
                
                this.processReschedule(appointment.id, newDate, newTime);
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                modal.remove();
            });
        }
        
        const cancelBtn = document.getElementById('cancel-reschedule');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                modal.remove();
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                modal.remove();
            }
        });
    }

    processReschedule(appointmentId, newDate, newTime) {
        // Find appointment
        const appointmentIndex = this.appointments.findIndex(apt => apt.id === appointmentId);
        if (appointmentIndex === -1) {
            this.showError('Appointment not found');
            return;
        }
        
        // Create new date time
        const newDateTime = new Date(`${newDate}T${newTime}`);
        
        // Update appointment
        this.appointments[appointmentIndex].dateTime = newDateTime.toISOString();
        this.appointments[appointmentIndex].status = 'rescheduled';
        
        // Save to localStorage
        localStorage.setItem('userAppointments', JSON.stringify(this.appointments));
        
        // Add activity
        this.addActivity({
            type: 'appointment',
            description: `Rescheduled appointment with ${this.appointments[appointmentIndex].doctorName}`,
            timestamp: new Date().toISOString(),
            status: 'success'
        });
        
        // Update UI
        this.updateAppointmentsUI();
        
        // Show success message
        this.showSuccess('Appointment rescheduled successfully');
    }

    addActivity(activity) {
        this.recentActivities.unshift(activity);
        
        // Keep only last 50 activities
        if (this.recentActivities.length > 50) {
            this.recentActivities = this.recentActivities.slice(0, 50);
        }
        
        // Save to localStorage
        localStorage.setItem('userActivities', JSON.stringify(this.recentActivities));
        
        // Update UI
        this.updateActivitiesUI();
    }

    refreshDashboard() {
        // Show loading state
        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing';
        }
        
        // Reload data
        this.loadDashboardData().finally(() => {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            }
        });
    }

    editProfile() {
        // Redirect to profile edit page or show modal
        // For now, show a simple modal
        const modalHTML = `
            <div class="modal" id="edit-profile-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Edit Profile</h3>
                        <button class="close-modal" id="close-edit-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Profile editing feature coming soon!</p>
                        <p>You can update your profile settings in the next update.</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" id="close-modal-btn">OK</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = document.getElementById('edit-profile-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add event listeners
        const closeBtn = document.getElementById('close-edit-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        
        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            modal.remove();
        };
        
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    showAllActivities() {
        // Create modal to show all activities
        const modalHTML = `
            <div class="modal" id="all-activities-modal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3 class="modal-title">All Activities</h3>
                        <button class="close-modal" id="close-activities-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="activities-list" id="all-activities-list">
                            <!-- All activities will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = document.getElementById('all-activities-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Load all activities
        const activitiesList = document.getElementById('all-activities-list');
        if (activitiesList) {
            if (this.recentActivities.length === 0) {
                activitiesList.innerHTML = '<div class="empty-state"><p>No activities found</p></div>';
            } else {
                activitiesList.innerHTML = this.recentActivities.map(activity => {
                    const activityDate = new Date(activity.timestamp);
                    const formattedDate = activityDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    const formattedTime = activityDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const iconMap = {
                        'consultation': 'fas fa-video',
                        'appointment': 'fas fa-calendar-check',
                        'prescription': 'fas fa-prescription',
                        'medicine': 'fas fa-pills',
                        'lab_test': 'fas fa-flask',
                        'symptom_check': 'fas fa-stethoscope',
                        'payment': 'fas fa-credit-card',
                        'profile_update': 'fas fa-user-edit'
                    };
                    
                    const iconClass = iconMap[activity.type] || 'fas fa-info-circle';
                    
                    return `
                        <div class="activity-item detailed">
                            <div class="activity-icon">
                                <i class="${iconClass}"></i>
                            </div>
                            <div class="activity-content">
                                <p>${activity.description}</p>
                                <span class="activity-time">${formattedDate} at ${formattedTime}</span>
                            </div>
                            <div class="activity-status">
                                ${activity.status === 'success' ? 
                                    '<span class="badge success">Completed</span>' : 
                                    activity.status === 'pending' ?
                                    '<span class="badge pending">Pending</span>' :
                                    '<span class="badge error">Failed</span>'}
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
        
        // Add event listeners
        const closeBtn = document.getElementById('close-activities-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                modal.remove();
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                modal.remove();
            }
        });
    }

    // Helper Methods
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }

    generateSampleAppointments() {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        
        return [
            {
                id: 'apt-001',
                doctorName: 'Dr. Rajesh Sharma',
                specialty: 'Cardiologist',
                dateTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 30).toISOString(),
                type: 'video',
                status: 'scheduled',
                duration: 30,
                notes: 'Follow-up consultation'
            },
            {
                id: 'apt-002',
                doctorName: 'Dr. Priya Singh',
                specialty: 'Dermatologist',
                dateTime: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 11, 0).toISOString(),
                type: 'in-person',
                status: 'scheduled',
                duration: 45,
                notes: 'Skin checkup'
            },
            {
                id: 'apt-003',
                doctorName: 'Dr. Amit Verma',
                specialty: 'General Physician',
                dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 16, 15).toISOString(),
                type: 'video',
                status: 'scheduled',
                duration: 20,
                notes: 'General consultation'
            }
        ];
    }

    generateSampleActivities() {
        const now = new Date();
        return [
            {
                type: 'consultation',
                description: 'Video consultation with Dr. Sharma',
                timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                status: 'success'
            },
            {
                type: 'prescription',
                description: 'Received prescription for medication',
                timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
                status: 'success'
            },
            {
                type: 'appointment',
                description: 'Booked appointment with Dr. Singh',
                timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'success'
            },
            {
                type: 'medicine',
                description: 'Ordered medicines from pharmacy',
                timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'pending'
            },
            {
                type: 'symptom_check',
                description: 'Used AI symptom checker',
                timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'success'
            }
        ];
    }

    generateSampleHealthStats() {
        return {
            consultations: 5,
            prescriptions: 3,
            labTests: 2,
            medicines: 8,
            healthScore: 78,
            lastCheckup: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            upcomingAppointments: 2
        };
    }

    showLoading() {
        const loadingElement = document.getElementById('dashboard-loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
    }

    hideLoading() {
        const loadingElement = document.getElementById('dashboard-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.dashboard-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        
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
}

// Initialize Dashboard Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});
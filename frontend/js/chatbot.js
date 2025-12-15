/**
 * AI Health Chatbot Module for Sehat Sathi
 * Handles AI-powered health consultation and symptom analysis
 */

class HealthChatbot {
    constructor() {
        this.currentChatId = null;
        this.chatHistory = [];
        this.userProfile = null;
        this.symptomAnalysis = null;
        this.isTyping = false;
        this.recognition = null;
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.setupEventListeners();
        this.loadChatHistory();
        this.initializeSpeechRecognition();
        this.startNewChat();
    }

    loadUserProfile() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                this.userProfile = JSON.parse(userData);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    setupEventListeners() {
        // Send message button
        const sendBtn = document.getElementById('send-message-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleSendMessage());
        }

        // Chat input enter key
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });
            
            // Auto-resize textarea
            chatInput.addEventListener('input', () => {
                this.autoResizeTextarea(chatInput);
            });
        }

        // Voice input button
        const voiceBtn = document.getElementById('voice-input-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceRecording());
        }

        // New chat button
        const newChatBtn = document.getElementById('new-chat-btn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => this.startNewChat());
        }

        // Clear chat button
        const clearChatBtn = document.getElementById('clear-chat-btn');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearCurrentChat());
        }

        // Export chat buttons
        const exportBtn = document.getElementById('export-chat-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.toggleExportOptions());
        }

        // Quick replies
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-reply')) {
                this.handleQuickReply(e.target.textContent);
            }
        });

        // History item clicks
        document.addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                const chatId = historyItem.dataset.chatId;
                if (chatId) {
                    this.loadChat(chatId);
                }
            }
        });

        // Export options
        document.addEventListener('click', (e) => {
            const exportOption = e.target.closest('.export-option');
            if (exportOption) {
                const format = exportOption.dataset.format;
                this.exportChat(format);
                this.hideExportOptions();
            }
        });

        // Close export options when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.export-dropdown')) {
                this.hideExportOptions();
            }
        });
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.showRecordingIndicator(true);
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processVoiceInput(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification('Voice recognition failed. Please try typing instead.', 'error');
                this.showRecordingIndicator(false);
            };
            
            this.recognition.onend = () => {
                this.showRecordingIndicator(false);
            };
        } else {
            console.warn('Speech recognition not supported');
            const voiceBtn = document.getElementById('voice-input-btn');
            if (voiceBtn) {
                voiceBtn.style.display = 'none';
            }
        }
    }

    loadChatHistory() {
        try {
            const savedHistory = localStorage.getItem('chatHistory');
            if (savedHistory) {
                this.chatHistory = JSON.parse(savedHistory);
                this.updateHistorySidebar();
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    saveChatHistory() {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
            this.updateHistorySidebar();
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    startNewChat() {
        this.currentChatId = 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        // Initialize chat data
        const chatData = {
            id: this.currentChatId,
            title: 'Health Consultation',
            messages: [],
            symptoms: [],
            analysis: null,
            timestamp: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Add to history
        this.chatHistory.unshift(chatData);
        
        // Keep only last 20 chats
        if (this.chatHistory.length > 20) {
            this.chatHistory = this.chatHistory.slice(0, 20);
        }
        
        // Clear chat UI
        this.clearChatUI();
        
        // Add welcome message
        this.addBotMessage(
            `Hello${this.userProfile ? ' ' + this.userProfile.name.split(' ')[0] : ''}! I'm your AI health assistant. ` +
            `I can help you with symptom analysis, medication information, health advice, ` +
            `and connecting you with healthcare providers. How can I assist you today?`,
            [
                'I have symptoms to discuss',
                'Need medication information',
                'Find a doctor',
                'General health advice'
            ]
        );
        
        // Save history
        this.saveChatHistory();
    }

    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (!chat) {
            this.showNotification('Chat not found', 'error');
            return;
        }
        
        this.currentChatId = chatId;
        
        // Clear current chat UI
        this.clearChatUI();
        
        // Load messages
        if (chat.messages && chat.messages.length > 0) {
            chat.messages.forEach(msg => {
                if (msg.type === 'user') {
                    this.addUserMessage(msg.content);
                } else if (msg.type === 'bot') {
                    this.addBotMessage(msg.content, msg.quickReplies);
                } else if (msg.type === 'system') {
                    this.addSystemMessage(msg.content);
                }
            });
        } else {
            this.addBotMessage('Welcome back! How can I help you today?');
        }
        
        // Update timestamp
        chat.updatedAt = new Date().toISOString();
        this.saveChatHistory();
    }

    clearCurrentChat() {
        if (!confirm('Are you sure you want to clear this chat?')) {
            return;
        }
        
        // Find current chat
        const chatIndex = this.chatHistory.findIndex(c => c.id === this.currentChatId);
        if (chatIndex !== -1) {
            // Keep only metadata, clear messages
            this.chatHistory[chatIndex].messages = [];
            this.chatHistory[chatIndex].symptoms = [];
            this.chatHistory[chatIndex].analysis = null;
            this.chatHistory[chatIndex].updatedAt = new Date().toISOString();
        }
        
        // Clear UI
        this.clearChatUI();
        
        // Add new welcome message
        this.addBotMessage('Chat cleared. How can I help you today?');
        
        // Save history
        this.saveChatHistory();
    }

    async handleSendMessage() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addUserMessage(message);
        
        // Clear input
        chatInput.value = '';
        this.autoResizeTextarea(chatInput);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Process message and get response
            const response = await this.processUserMessage(message);
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Add bot response
            this.addBotMessage(response.text, response.quickReplies);
            
            // Check if symptom analysis is needed
            if (response.requiresSymptomAnalysis) {
                await this.performSymptomAnalysis(message);
            }
            
        } catch (error) {
            console.error('Error processing message:', error);
            this.removeTypingIndicator();
            this.addBotMessage('Sorry, I encountered an error. Please try again.');
        }
        
        // Save chat
        this.saveCurrentChat();
    }

    handleQuickReply(text) {
        this.addUserMessage(text);
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.removeTypingIndicator();
            
            // Process quick reply
            let response;
            switch (text) {
                case 'I have symptoms to discuss':
                    response = {
                        text: 'Please describe your symptoms in detail. Include information about:\n\n' +
                              '• What symptoms you\'re experiencing\n' +
                              '• When they started\n' +
                              '• How severe they are\n' +
                              '• Any other relevant details',
                        quickReplies: ['Headache', 'Fever', 'Cough', 'Stomach pain', 'Body ache'],
                        requiresSymptomAnalysis: true
                    };
                    break;
                    
                case 'Need medication information':
                    response = {
                        text: 'I can provide information about medications. Please tell me:\n\n' +
                              '• The name of the medication\n' +
                              '• What you\'re taking it for\n' +
                              '• Any specific questions you have',
                        quickReplies: ['Paracetamol', 'Cetirizine', 'Ibuprofen', 'Antibiotics', 'Vitamins']
                    };
                    break;
                    
                case 'Find a doctor':
                    response = {
                        text: 'I can help you find a doctor. Please specify:\n\n' +
                              '• Your location or city\n' +
                              '• Type of specialist needed\n' +
                              '• Any preferences (experience, language, etc.)',
                        quickReplies: ['Cardiologist', 'Dermatologist', 'General Physician', 'Gynecologist', 'Pediatrician']
                    };
                    break;
                    
                case 'General health advice':
                    response = {
                        text: 'I can provide general health advice. What would you like to know about?\n\n' +
                              '• Diet and nutrition\n' +
                              '• Exercise and fitness\n' +
                              '• Mental health\n' +
                              '• Preventive care\n' +
                              '• Lifestyle tips',
                        quickReplies: ['Healthy diet', 'Exercise routine', 'Stress management', 'Sleep tips', 'Immunity boosters']
                    };
                    break;
                    
                default:
                    response = this.generateResponseForSymptom(text);
            }
            
            this.addBotMessage(response.text, response.quickReplies);
            this.saveCurrentChat();
        }, 1000);
    }

    async processUserMessage(message) {
        // Convert to lowercase for easier matching
        const lowerMessage = message.toLowerCase();
        
        // Check for emergency keywords
        const emergencyKeywords = ['emergency', 'chest pain', 'difficulty breathing', 'severe bleeding', 'unconscious'];
        if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return {
                text: '🚨 Based on your symptoms, this may be a medical emergency. Please:\n\n' +
                      '1. Call emergency services immediately (108 in India)\n' +
                      '2. Do not drive yourself to the hospital\n' +
                      '3. Inform someone nearby\n\n' +
                      'I can also help you find the nearest hospital or connect you with a doctor immediately.',
                quickReplies: ['Find nearest hospital', 'Call volunteer', 'Connect to doctor'],
                requiresSymptomAnalysis: true
            };
        }
        
        // Check for symptom-related messages
        const symptomKeywords = ['pain', 'ache', 'fever', 'cough', 'headache', 'nausea', 'dizziness', 'weakness'];
        if (symptomKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return {
                text: 'I understand you\'re describing symptoms. Let me ask a few questions to better understand your situation:\n\n' +
                      '1. How long have you had these symptoms?\n' +
                      '2. On a scale of 1-10, how severe is the discomfort?\n' +
                      '3. Have you taken any medication for this?\n' +
                      '4. Are there any other symptoms you\'re experiencing?',
                quickReplies: ['Less than 24 hours', 'Moderate pain', 'No medication', 'Yes, other symptoms'],
                requiresSymptomAnalysis: true
            };
        }
        
        // Check for medication queries
        if (lowerMessage.includes('medicine') || lowerMessage.includes('medication') || lowerMessage.includes('pill')) {
            return {
                text: 'I can provide information about medications. However, please note:\n\n' +
                      '• I am an AI assistant and not a replacement for medical advice\n' +
                      '• Always consult a doctor before starting new medications\n' +
                      '• Follow your doctor\'s prescription exactly\n\n' +
                      'What specific medication would you like information about?',
                quickReplies: ['Side effects', 'Dosage', 'Interactions', 'Precautions']
            };
        }
        
        // Default response for other queries
        return {
            text: 'Thank you for sharing. I\'ll do my best to provide helpful information. ' +
                  'For the most accurate medical advice, it\'s always best to consult with a healthcare professional. ' +
                  'Would you like me to help you find a doctor or provide more specific information?',
            quickReplies: ['Find a doctor', 'More information', 'Book appointment', 'Back to symptoms']
        };
    }

    generateResponseForSymptom(symptom) {
        const symptomResponses = {
            'Headache': {
                text: 'For headaches, consider:\n\n' +
                      '• Rest in a quiet, dark room\n' +
                      '• Stay hydrated\n' +
                      '• Consider over-the-counter pain relief if appropriate\n' +
                      '• Avoid triggers like stress, certain foods, or screen time\n\n' +
                      'If headaches are severe, persistent, or accompanied by vision changes, seek medical attention.',
                quickReplies: ['Severe headache', 'Migraine', 'Tension headache', 'Need doctor']
            },
            'Fever': {
                text: 'For fever management:\n\n' +
                      '• Rest and stay hydrated\n' +
                      '• Monitor temperature regularly\n' +
                      '• Use fever-reducing medication if prescribed\n' +
                      '• Keep the room at a comfortable temperature\n\n' +
                      'If fever is above 103°F (39.4°C) or lasts more than 3 days, consult a doctor.',
                quickReplies: ['High fever', 'With chills', 'Child with fever', 'Persistent fever']
            },
            'Cough': {
                text: 'For cough relief:\n\n' +
                      '• Stay hydrated with warm liquids\n' +
                      '• Use a humidifier\n' +
                      '• Avoid irritants like smoke\n' +
                      '• Consider honey (for adults) or cough drops\n\n' +
                      'If cough is severe, produces blood, or lasts more than 3 weeks, see a doctor.',
                quickReplies: ['Dry cough', 'Chesty cough', 'Nighttime cough', 'With shortness of breath']
            }
        };
        
        return symptomResponses[symptom] || {
            text: 'I understand you\'re experiencing symptoms. Could you provide more details about:\n\n' +
                  '• The exact nature of your symptoms\n' +
                  '• When they started\n' +
                  '• What makes them better or worse\n' +
                  '• Any other health conditions you have',
            quickReplies: ['Started recently', 'Getting worse', 'Chronic condition', 'Need doctor now']
        };
    }

    async performSymptomAnalysis(symptomDescription) {
        try {
            // Show analysis in progress
            this.addSystemMessage('🔍 Analyzing your symptoms...');
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generate analysis
            const analysis = await this.generateSymptomAnalysis(symptomDescription);
            this.symptomAnalysis = analysis;
            
            // Remove the "analyzing" message
            this.removeLastSystemMessage();
            
            // Display analysis
            this.displaySymptomAnalysis(analysis);
            
            // Save to chat
            this.saveCurrentChat();
            
        } catch (error) {
            console.error('Error performing symptom analysis:', error);
            this.removeLastSystemMessage();
            this.addBotMessage('Sorry, I couldn\'t complete the symptom analysis. Please try again.');
        }
    }

    async generateSymptomAnalysis(symptomDescription) {
        // This would normally call an AI/ML API
        // For now, generate mock analysis based on keywords
        
        const lowerDesc = symptomDescription.toLowerCase();
        const analysis = {
            id: 'analysis-' + Date.now(),
            symptoms: [],
            severity: 'low',
            confidence: 0.7,
            recommendations: [],
            suggestedActions: [],
            timestamp: new Date().toISOString()
        };
        
        // Detect symptoms
        if (lowerDesc.includes('headache') || lowerDesc.includes('head pain')) {
            analysis.symptoms.push('Headache');
            if (lowerDesc.includes('severe') || lowerDesc.includes('worst')) {
                analysis.severity = 'high';
            } else if (lowerDesc.includes('mild')) {
                analysis.severity = 'low';
            } else {
                analysis.severity = 'medium';
            }
            
            analysis.recommendations = [
                'Rest in a quiet, dark environment',
                'Stay hydrated',
                'Consider over-the-counter pain relief if appropriate',
                'Monitor for any vision changes or neurological symptoms'
            ];
            
            analysis.suggestedActions = analysis.severity === 'high' ? 
                ['Consult doctor within 24 hours'] : 
                ['Self-care, consult if symptoms persist beyond 3 days'];
        }
        
        if (lowerDesc.includes('fever')) {
            analysis.symptoms.push('Fever');
            analysis.severity = analysis.severity === 'high' ? 'high' : 'medium';
            
            analysis.recommendations.push(
                'Monitor temperature regularly',
                'Stay hydrated',
                'Rest and maintain comfortable room temperature'
            );
        }
        
        if (lowerDesc.includes('cough') || lowerDesc.includes('cold')) {
            analysis.symptoms.push('Respiratory symptoms');
            analysis.recommendations.push(
                'Use a humidifier',
                'Stay hydrated with warm liquids',
                'Avoid irritants'
            );
        }
        
        if (lowerDesc.includes('stomach') || lowerDesc.includes('abdominal')) {
            analysis.symptoms.push('Gastrointestinal symptoms');
            analysis.recommendations.push(
                'Maintain bland diet if nauseous',
                'Stay hydrated with clear fluids',
                'Avoid spicy or fatty foods'
            );
        }
        
        // If no specific symptoms detected
        if (analysis.symptoms.length === 0) {
            analysis.symptoms = ['General symptoms'];
            analysis.severity = 'low';
            analysis.recommendations = [
                'Monitor symptoms',
                'Rest and maintain hydration',
                'Consult doctor if symptoms worsen or persist'
            ];
            analysis.suggestedActions = ['Consult doctor if concerned'];
        }
        
        return analysis;
    }

    displaySymptomAnalysis(analysis) {
        const severityColors = {
            'high': '#e74c3c',
            'medium': '#f39c12',
            'low': '#2ecc71'
        };
        
        const severityText = {
            'high': 'High Priority',
            'medium': 'Medium Priority',
            'low': 'Low Priority'
        };
        
        const analysisHTML = `
            <div class="symptom-analysis">
                <h4>📋 Symptom Analysis Report</h4>
                <div class="analysis-result">
                    <div class="severity-indicator">
                        <div class="severity-dot ${analysis.severity}"></div>
                        <strong>${severityText[analysis.severity]}</strong>
                    </div>
                    <span class="confidence">Confidence: ${Math.round(analysis.confidence * 100)}%</span>
                </div>
                
                <div class="detected-symptoms">
                    <p><strong>Detected Symptoms:</strong> ${analysis.symptoms.join(', ')}</p>
                </div>
                
                <div class="recommendations">
                    <p><strong>Recommendations:</strong></p>
                    <ul>
                        ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="analysis-actions">
                    <button class="btn btn-primary" onclick="healthChatbot.showDetailedAnalysis()">
                        <i class="fas fa-chart-bar"></i> Detailed Report
                    </button>
                    <button class="btn btn-secondary" onclick="healthChatbot.findDoctorsForSymptoms()">
                        <i class="fas fa-user-md"></i> Find Doctors
                    </button>
                    <button class="btn btn-secondary" onclick="healthChatbot.saveAnalysisReport()">
                        <i class="fas fa-save"></i> Save Report
                    </button>
                </div>
            </div>
        `;
        
        // Add as bot message
        this.addBotMessage(analysisHTML);
    }

    showDetailedAnalysis() {
        if (!this.symptomAnalysis) {
            this.showNotification('No symptom analysis available', 'error');
            return;
        }
        
        const modalHTML = `
            <div class="modal" id="detailed-analysis-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Detailed Symptom Analysis</h3>
                        <button class="close-modal" id="close-analysis-modal">&times;</button>
                    </div>
                    <div class="modal-body" id="detailed-analysis-content">
                        <!-- Content will be loaded here -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="healthChatbot.exportAnalysisReport()">
                            <i class="fas fa-download"></i> Export Report
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = document.getElementById('detailed-analysis-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Load content
        const content = document.getElementById('detailed-analysis-content');
        if (content) {
            content.innerHTML = this.generateDetailedAnalysisHTML();
        }
        
        // Add event listeners
        const closeBtn = document.getElementById('close-analysis-modal');
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

    generateDetailedAnalysisHTML() {
        if (!this.symptomAnalysis) return '<p>No analysis data available.</p>';
        
        const analysis = this.symptomAnalysis;
        const formattedDate = new Date(analysis.timestamp).toLocaleString();
        
        return `
            <div class="detailed-report">
                <div class="report-header">
                    <p><strong>Analysis ID:</strong> ${analysis.id}</p>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                </div>
                
                <div class="report-section">
                    <h4>Symptoms Detected</h4>
                    <ul>
                        ${analysis.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="report-section">
                    <h4>Severity Assessment</h4>
                    <div class="severity-scale">
                        <div class="scale-item ${analysis.severity === 'low' ? 'active' : ''}">
                            <span class="dot green"></span>
                            <span>Low Priority</span>
                        </div>
                        <div class="scale-item ${analysis.severity === 'medium' ? 'active' : ''}">
                            <span class="dot yellow"></span>
                            <span>Medium Priority</span>
                        </div>
                        <div class="scale-item ${analysis.severity === 'high' ? 'active' : ''}">
                            <span class="dot red"></span>
                            <span>High Priority</span>
                        </div>
                    </div>
                    <p><strong>Confidence Level:</strong> ${Math.round(analysis.confidence * 100)}%</p>
                </div>
                
                <div class="report-section">
                    <h4>Detailed Recommendations</h4>
                    <div class="recommendations-detailed">
                        ${analysis.recommendations.map((rec, index) => `
                            <div class="recommendation-item">
                                <span class="rec-number">${index + 1}</span>
                                <span>${rec}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="report-section">
                    <h4>Next Steps</h4>
                    <div class="next-steps">
                        ${analysis.suggestedActions.map(action => `
                            <div class="step-item">
                                <i class="fas fa-check-circle"></i>
                                <span>${action}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="report-section">
                    <h4>Important Notes</h4>
                    <div class="notes">
                        <p>This analysis is generated by AI and should not replace professional medical advice.</p>
                        <p>Always consult with a healthcare provider for accurate diagnosis and treatment.</p>
                        <p>In case of emergency, call your local emergency services immediately.</p>
                    </div>
                </div>
            </div>
        `;
    }

    findDoctorsForSymptoms() {
        if (!this.symptomAnalysis) {
            this.showNotification('No symptoms analyzed yet', 'error');
            return;
        }
        
        // Redirect to doctors page with symptoms
        const symptomsParam = encodeURIComponent(this.symptomAnalysis.symptoms.join(','));
        window.location.href = `doctors.html?symptoms=${symptomsParam}`;
    }

    saveAnalysisReport() {
        if (!this.symptomAnalysis) {
            this.showNotification('No analysis to save', 'error');
            return;
        }
        
        // Save to user's medical history
        try {
            const medicalHistory = JSON.parse(localStorage.getItem('medicalHistory')) || [];
            medicalHistory.push({
                ...this.symptomAnalysis,
                chatId: this.currentChatId,
                savedAt: new Date().toISOString()
            });
            
            localStorage.setItem('medicalHistory', JSON.stringify(medicalHistory));
            this.showNotification('Analysis saved to medical history', 'success');
            
        } catch (error) {
            console.error('Error saving analysis:', error);
            this.showNotification('Failed to save analysis', 'error');
        }
    }

    exportAnalysisReport() {
        if (!this.symptomAnalysis) {
            this.showNotification('No analysis to export', 'error');
            return;
        }
        
        this.exportChat('pdf');
    }

    toggleVoiceRecording() {
        if (!this.recognition) {
            this.showNotification('Voice recognition not supported in your browser', 'error');
            return;
        }
        
        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
        
        this.isRecording = !this.isRecording;
    }

    processVoiceInput(transcript) {
        // Add to chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = transcript;
            this.autoResizeTextarea(chatInput);
        }
        
        // Show notification
        this.showNotification('Voice input received. Click send or press enter.', 'info');
    }

    showRecordingIndicator(show) {
        const voiceBtn = document.getElementById('voice-input-btn');
        if (!voiceBtn) return;
        
        if (show) {
            voiceBtn.classList.add('recording');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            this.showNotification('Listening... Speak now.', 'info');
        } else {
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }
    }

    // UI Helper Methods
    addUserMessage(content) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.textContent = content;
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Save to current chat
        this.addMessageToCurrentChat('user', content);
    }

    addBotMessage(content, quickReplies = null) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        
        // Check if content is HTML or plain text
        if (content.startsWith('<')) {
            messageDiv.innerHTML = content;
        } else {
            const textPara = document.createElement('p');
            textPara.textContent = content;
            messageDiv.appendChild(textPara);
        }
        
        // Add quick replies if provided
        if (quickReplies && quickReplies.length > 0) {
            const quickRepliesDiv = document.createElement('div');
            quickRepliesDiv.className = 'quick-replies';
            
            quickReplies.forEach(reply => {
                const button = document.createElement('button');
                button.className = 'quick-reply';
                button.textContent = reply;
                quickRepliesDiv.appendChild(button);
            });
            
            messageDiv.appendChild(quickRepliesDiv);
        }
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Save to current chat
        this.addMessageToCurrentChat('bot', content, quickReplies);
    }

    addSystemMessage(content) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.textContent = content;
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        this.isTyping = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator && typingIndicator.parentNode) {
            typingIndicator.remove();
        }
    }

    removeLastSystemMessage() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const systemMessages = messagesContainer.querySelectorAll('.message.system');
        if (systemMessages.length > 0) {
            systemMessages[systemMessages.length - 1].remove();
        }
    }

    clearChatUI() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    updateHistorySidebar() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        if (this.chatHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-comments"></i>
                    <p>No previous chats</p>
                </div>
            `;
            return;
        }
        
        // Clear existing
        historyList.innerHTML = '';
        
        // Add history items
        this.chatHistory.forEach(chat => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            historyItem.dataset.chatId = chat.id;
            
            const chatDate = new Date(chat.updatedAt || chat.timestamp);
            const formattedDate = chatDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            const previewText = chat.messages && chat.messages.length > 0 ?
                (chat.messages[0].content || 'Health consultation').substring(0, 40) + '...' :
                'Health consultation';
            
            historyItem.innerHTML = `
                <div class="history-date">${formattedDate}</div>
                <div class="history-preview">${previewText}</div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }

    addMessageToCurrentChat(type, content, quickReplies = null) {
        const chatIndex = this.chatHistory.findIndex(c => c.id === this.currentChatId);
        if (chatIndex === -1) return;
        
        const message = {
            type: type,
            content: content,
            timestamp: new Date().toISOString()
        };
        
        if (quickReplies) {
            message.quickReplies = quickReplies;
        }
        
        this.chatHistory[chatIndex].messages.push(message);
        this.chatHistory[chatIndex].updatedAt = new Date().toISOString();
    }

    saveCurrentChat() {
        // Update chat title based on first user message
        const chatIndex = this.chatHistory.findIndex(c => c.id === this.currentChatId);
        if (chatIndex === -1) return;
        
        const chat = this.chatHistory[chatIndex];
        const firstUserMessage = chat.messages.find(m => m.type === 'user');
        
        if (firstUserMessage && !chat.title.includes('Consultation')) {
            chat.title = firstUserMessage.content.substring(0, 30) + '...';
        }
        
        // Add symptom analysis if available
        if (this.symptomAnalysis) {
            chat.symptoms = this.symptomAnalysis.symptoms;
            chat.analysis = this.symptomAnalysis;
        }
        
        // Save to history
        this.saveChatHistory();
    }

    toggleExportOptions() {
        const exportOptions = document.getElementById('export-options');
        if (exportOptions) {
            exportOptions.classList.toggle('show');
        }
    }

    hideExportOptions() {
        const exportOptions = document.getElementById('export-options');
        if (exportOptions) {
            exportOptions.classList.remove('show');
        }
    }

    exportChat(format = 'pdf') {
        const chatIndex = this.chatHistory.findIndex(c => c.id === this.currentChatId);
        if (chatIndex === -1) {
            this.showNotification('No chat to export', 'error');
            return;
        }
        
        const chat = this.chatHistory[chatIndex];
        
        switch (format) {
            case 'pdf':
                this.exportChatAsPDF(chat);
                break;
            case 'text':
                this.exportChatAsText(chat);
                break;
            default:
                this.showNotification('Unsupported export format', 'error');
        }
    }

    exportChatAsPDF(chat) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            let yPos = margin;
            
            // Header
            doc.setFontSize(20);
            doc.setTextColor(26, 59, 93);
            doc.text('Sehat Sathi - Health Consultation Report', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Report ID: ${chat.id}`, margin, yPos);
            doc.text(`Date: ${new Date(chat.timestamp).toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
            yPos += 15;
            
            // Patient info
            if (this.userProfile) {
                doc.setFontSize(14);
                doc.setTextColor(26, 59, 93);
                doc.text('Patient Information', margin, yPos);
                yPos += 8;
                
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                doc.text(`Name: ${this.userProfile.name}`, margin, yPos);
                yPos += 6;
                if (this.userProfile.email) {
                    doc.text(`Email: ${this.userProfile.email}`, margin, yPos);
                    yPos += 6;
                }
                if (this.userProfile.phone) {
                    doc.text(`Phone: ${this.userProfile.phone}`, margin, yPos);
                    yPos += 6;
                }
                yPos += 10;
            }
            
            // Chat messages
            doc.setFontSize(14);
            doc.setTextColor(26, 59, 93);
            doc.text('Consultation History', margin, yPos);
            yPos += 10;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            chat.messages.forEach((message, index) => {
                const isBot = message.type === 'bot';
                const prefix = isBot ? 'AI Assistant: ' : 'You: ';
                
                // Check if we need a new page
                if (yPos > 270) {
                    doc.addPage();
                    yPos = margin;
                }
                
                // Draw message bubble
                doc.setFillColor(isBot ? 240, 247, 255, 230, 245, 253);
                doc.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 15, 3, 3, 'F');
                
                // Add text
                doc.setTextColor(isBot ? 0, 0, 0 : 26, 59, 93);
                doc.text(prefix + message.content.substring(0, 100), margin + 5, yPos + 2);
                yPos += 20;
            });
            
            // Symptom analysis
            if (chat.analysis) {
                yPos += 10;
                
                doc.setFontSize(14);
                doc.setTextColor(26, 59, 93);
                doc.text('Symptom Analysis Summary', margin, yPos);
                yPos += 10;
                
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`Symptoms: ${chat.analysis.symptoms.join(', ')}`, margin, yPos);
                yPos += 6;
                doc.text(`Severity: ${chat.analysis.severity}`, margin, yPos);
                yPos += 6;
                doc.text(`Confidence: ${Math.round(chat.analysis.confidence * 100)}%`, margin, yPos);
                yPos += 10;
                
                doc.text('Recommendations:', margin, yPos);
                yPos += 6;
                chat.analysis.recommendations.forEach(rec => {
                    doc.text(`• ${rec}`, margin + 5, yPos);
                    yPos += 6;
                });
            }
            
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Generated by Sehat Sathi AI Health Assistant', pageWidth / 2, 290, { align: 'center' });
            doc.text('Confidential - For medical reference only', pageWidth / 2, 295, { align: 'center' });
            
            // Save PDF
            const fileName = `SehatSathi_Consultation_${chat.id}.pdf`;
            doc.save(fileName);
            
            this.showNotification('PDF report downloaded successfully', 'success');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showNotification('Failed to generate PDF report', 'error');
        }
    }

    exportChatAsText(chat) {
        try {
            let textContent = 'Sehat Sathi - Health Consultation Report\n';
            textContent += '=========================================\n\n';
            textContent += `Report ID: ${chat.id}\n`;
            textContent += `Date: ${new Date(chat.timestamp).toLocaleString()}\n\n`;
            
            if (this.userProfile) {
                textContent += 'Patient Information:\n';
                textContent += `Name: ${this.userProfile.name}\n`;
                if (this.userProfile.email) textContent += `Email: ${this.userProfile.email}\n`;
                if (this.userProfile.phone) textContent += `Phone: ${this.userProfile.phone}\n`;
                textContent += '\n';
            }
            
            textContent += 'Consultation History:\n';
            textContent += '---------------------\n\n';
            
            chat.messages.forEach(message => {
                const prefix = message.type === 'bot' ? 'AI Assistant: ' : 'You: ';
                textContent += `${prefix}${message.content}\n\n`;
            });
            
            if (chat.analysis) {
                textContent += '\nSymptom Analysis:\n';
                textContent += '-----------------\n';
                textContent += `Symptoms: ${chat.analysis.symptoms.join(', ')}\n`;
                textContent += `Severity: ${chat.analysis.severity}\n`;
                textContent += `Confidence: ${Math.round(chat.analysis.confidence * 100)}%\n\n`;
                textContent += 'Recommendations:\n';
                chat.analysis.recommendations.forEach(rec => {
                    textContent += `• ${rec}\n`;
                });
            }
            
            textContent += '\n\n---\n';
            textContent += 'Generated by Sehat Sathi AI Health Assistant\n';
            textContent += 'Confidential - For medical reference only\n';
            
            // Create blob and download
            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SehatSathi_Consultation_${chat.id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Text report downloaded successfully', 'success');
            
        } catch (error) {
            console.error('Error generating text report:', error);
            this.showNotification('Failed to generate text report', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.chatbot-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `chatbot-notification ${type}`;
        
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

// Initialize Health Chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.healthChatbot = new HealthChatbot();
});
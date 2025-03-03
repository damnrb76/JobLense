// JobLens App.js - Main application logic

// Mock database - This would normally be stored in a real database
const db = {
    users: [
        { id: 1, name: "Demo User", email: "demo@joblens.com" }
    ],
    cvs: [],
    coverLetters: [],
    jobDescriptions: [],
    customisedDocuments: []
};

// Current user - In a real app, this would be set after authentication
const currentUser = db.users[0];

// Main app controller
const App = {
    // Initialize the application
    init: function() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Load home screen by default
        this.loadScreen('home');
    },
    
    // Set up event listeners
    setupEventListeners: function() {
        // Tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const screen = tab.getAttribute('data-screen');
                this.loadScreen(screen);
            });
        });
        
        // Global event delegation for the entire app
        document.addEventListener('click', (e) => {
            // Home screen action buttons
            if (e.target.closest('[data-action="upload-cv"]')) {
                this.showAddDocumentModal('cv');
            }
            
            if (e.target.closest('[data-action="analyse-job"]')) {
                this.showAddJobModal();
            }
            
            if (e.target.closest('[data-action="create-custom"]')) {
                this.loadScreen('customise');
            }
            
            // Add job button
            if (e.target.closest('#add-job-btn')) {
                this.showAddJobModal();
            }
            
            // Close modal buttons
            if (e.target.closest('.close-button') || e.target.closest('.cancel-button')) {
                this.closeModal();
            }
            
            // Tab buttons within screens
            if (e.target.closest('.tab-button')) {
                const tabButton = e.target.closest('.tab-button');
                const tabContainer = tabButton.closest('.tab-header').parentElement;
                const tabName = tabButton.getAttribute('data-tab');
                
                // Update active tab button
                tabContainer.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                tabButton.classList.add('active');
                
                // Update active tab content
                tabContainer.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                tabContainer.querySelector(`[data-tab-content="${tabName}"]`).classList.add('active');
            }
            
            // Add document button on documents screen
            if (e.target.closest('.documents-screen .action-button')) {
                const activeTab = document.querySelector('.documents-screen .tab-button.active');
                if (activeTab) {
                    const docType = activeTab.getAttribute('data-tab');
                    this.showAddDocumentModal(docType === 'cvs' ? 'cv' : 'cover-letter');
                }
            }
        });
        
        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'job-form') {
                e.preventDefault();
                this.handleJobFormSubmit();
            }
            
            if (e.target.id === 'document-form') {
                e.preventDefault();
                this.handleDocumentFormSubmit();
            }
        });
    },
    
    // Load a specific screen
    loadScreen: function(screenName) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.tab[data-screen="${screenName}"]`).classList.add('active');
        
        // Clear main content
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';
        
        // Load template based on screen name
        const template = document.getElementById(`${screenName}-template`);
        if (template) {
            const content = template.content.cloneNode(true);
            mainContent.appendChild(content);
            
            // Add class to identify the screen
            const screenContent = mainContent.querySelector('.screen-content');
            if (screenContent) {
                screenContent.classList.add(`${screenName}-screen`);
            }
            
            // Perform any necessary data loading
            this.loadScreenData(screenName);
        }
    },
    
    // Load data for specific screens
    loadScreenData: function(screenName) {
        switch(screenName) {
            case 'home':
                this.updateHomeStats();
                break;
            case 'documents':
                this.loadDocuments();
                break;
            case 'jobs':
                this.loadJobs();
                break;
            case 'customise':
                this.loadCustomisationOptions();
                break;
        }
    },
    
    // Update home screen statistics
    updateHomeStats: function() {
        const statCards = document.querySelectorAll('.stat-card .stat-number');
        if (statCards.length >= 3) {
            // CV count
            const cvCount = db.cvs.filter(cv => cv.userId === currentUser.id).length;
            statCards[0].textContent = cvCount;
            
            // Cover letter count
            const clCount = db.coverLetters.filter(cl => cl.userId === currentUser.id).length;
            statCards[1].textContent = clCount;
            
            // Job descriptions count
            const jobCount = db.jobDescriptions.filter(job => job.userId === currentUser.id).length;
            statCards[2].textContent = jobCount;
        }
    },
    
    // Load documents for the documents screen
    loadDocuments: function() {
        // Load CVs
        const cvs = db.cvs.filter(cv => cv.userId === currentUser.id);
        const cvContainer = document.querySelector('[data-tab-content="cvs"]');
        
        if (cvs.length > 0) {
            cvContainer.innerHTML = '';
            const docList = document.createElement('div');
            docList.className = 'document-list';
            
            cvs.forEach(cv => {
                const docItem = document.createElement('div');
                docItem.className = 'document-item';
                docItem.innerHTML = `
                    <div class="document-info">
                        <h3>${cv.title}</h3>
                        <p>Added: ${new Date(cv.createdDate).toLocaleDateString()}</p>
                    </div>
                    <div class="document-actions">
                        <button class="action-icon view-doc" data-id="${cv.id}"><i class="fas fa-eye"></i></button>
                        <button class="action-icon edit-doc" data-id="${cv.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-icon delete-doc" data-id="${cv.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                docList.appendChild(docItem);
            });
            
            cvContainer.appendChild(docList);
        }
        
        // Load Cover Letters
        const cls = db.coverLetters.filter(cl => cl.userId === currentUser.id);
        const clContainer = document.querySelector('[data-tab-content="cover-letters"]');
        
        if (cls.length > 0) {
            clContainer.innerHTML = '';
            const docList = document.createElement('div');
            docList.className = 'document-list';
            
            cls.forEach(cl => {
                const docItem = document.createElement('div');
                docItem.className = 'document-item';
                docItem.innerHTML = `
                    <div class="document-info">
                        <h3>${cl.title}</h3>
                        <p>Added: ${new Date(cl.createdDate).toLocaleDateString()}</p>
                    </div>
                    <div class="document-actions">
                        <button class="action-icon view-doc" data-id="${cl.id}"><i class="fas fa-eye"></i></button>
                        <button class="action-icon edit-doc" data-id="${cl.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-icon delete-doc" data-id="${cl.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                docList.appendChild(docItem);
            });
            
            clContainer.appendChild(docList);
        }
    },
    
    // Load jobs for the jobs screen
    loadJobs: function() {
        const jobs = db.jobDescriptions.filter(job => job.userId === currentUser.id);
        const jobContainer = document.querySelector('.job-list-container');
        
        if (jobs.length > 0) {
            jobContainer.innerHTML = '';
            const jobList = document.createElement('div');
            jobList.className = 'job-list';
            
            jobs.forEach(job => {
                const jobItem = document.createElement('div');
                jobItem.className = 'job-item';
                jobItem.innerHTML = `
                    <div class="job-info">
                        <h3>${job.title}</h3>
                        <p>${job.company}</p>
                        <p class="job-date">Added: ${new Date(job.addedDate).toLocaleDateString()}</p>
                    </div>
                    <div class="job-actions">
                        <button class="action-icon view-job" data-id="${job.id}"><i class="fas fa-eye"></i></button>
                        <button class="action-icon analyse-job" data-id="${job.id}"><i class="fas fa-search"></i></button>
                        <button class="action-icon customise-job" data-id="${job.id}"><i class="fas fa-magic"></i></button>
                    </div>
                `;
                jobList.appendChild(jobItem);
            });
            
            jobContainer.appendChild(jobList);
        }
    },
    
    // Load customisation options
    loadCustomisationOptions: function() {
        // Load job descriptions for select dropdown
        const jobs = db.jobDescriptions.filter(job => job.userId === currentUser.id);
        const jobSelect = document.getElementById('job-select');
        
        if (jobs.length > 0) {
            jobSelect.innerHTML = '<option value="">Select a job description...</option>';
            jobs.forEach(job => {
                const option = document.createElement('option');
                option.value = job.id;
                option.textContent = `${job.title} at ${job.company}`;
                jobSelect.appendChild(option);
            });
            jobSelect.disabled = false;
        }
        
        // Load CVs for select dropdown
        const cvs = db.cvs.filter(cv => cv.userId === currentUser.id);
        const cvSelect = document.getElementById('cv-select');
        
        if (cvs.length > 0) {
            cvSelect.innerHTML = '<option value="">Select a CV...</option>';
            cvs.forEach(cv => {
                const option = document.createElement('option');
                option.value = cv.id;
                option.textContent = cv.title;
                cvSelect.appendChild(option);
            });
            cvSelect.disabled = false;
        }
        
        // Load cover letters for select dropdown
        const cls = db.coverLetters.filter(cl => cl.userId === currentUser.id);
        const clSelect = document.getElementById('cl-select');
        
        if (cls.length > 0) {
            clSelect.innerHTML = '<option value="">Select a cover letter...</option>';
            cls.forEach(cl => {
                const option = document.createElement('option');
                option.value = cl.id;
                option.textContent = cl.title;
                clSelect.appendChild(option);
            });
            clSelect.disabled = false;
        }
        
        // Enable/disable the generate button based on selections
        const generateBtn = document.querySelector('.selection-form .primary-button');
        if (jobs.length > 0 && cvs.length > 0 && cls.length > 0) {
            generateBtn.disabled = false;
        }
        
        // Load existing customisations
        this.loadCustomisations();
    },
    
    // Load existing customisations
    loadCustomisations: function() {
        const customisations = db.customisedDocuments.filter(doc => doc.userId === currentUser.id);
        const customisationContainer = document.querySelector('.customisation-list');
        
        if (customisations.length > 0) {
            const emptyState = customisationContainer.querySelector('.list-empty');
            if (emptyState) {
                emptyState.remove();
            }
            
            const customList = document.createElement('div');
            customList.className = 'customisation-items';
            
            customisations.forEach(custom => {
                // Find related job
                const job = db.jobDescriptions.find(j => j.id === custom.jobId);
                
                const customItem = document.createElement('div');
                customItem.className = 'customisation-item';
                customItem.innerHTML = `
                    <div class="customisation-info">
                        <h3>${job ? job.title : 'Untitled Job'}</h3>
                        <p>${job ? job.company : ''}</p>
                        <p>Created: ${new Date(custom.createdDate).toLocaleDateString()}</p>
                        <div class="score-container">
                            <div class="score">
                                <span>ATS Score:</span>
                                <div class="progress-bar">
                                    <div class="progress" style="width: ${custom.atsScore}%"></div>
                                </div>
                                <span>${custom.atsScore}%</span>
                            </div>
                            <div class="score">
                                <span>LPS Score:</span>
                                <div class="progress-bar">
                                    <div class="progress" style="width: ${custom.lpsScore}%"></div>
                                </div>
                                <span>${custom.lpsScore}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="customisation-actions">
                        <button class="secondary-button view-custom" data-id="${custom.id}">View</button>
                    </div>
                `;
                customList.appendChild(customItem);
            });
            
            customisationContainer.appendChild(customList);
        }
    },
    
    // Show add document modal
    showAddDocumentModal: function(docType = 'cv') {
        const modalTemplate = document.getElementById('add-document-modal-template');
        const modalContent = modalTemplate.content.cloneNode(true);
        document.body.appendChild(modalContent);
        
        // Set the modal title based on document type
        const modalTitle = document.querySelector('.modal-header h3');
        modalTitle.textContent = docType === 'cv' ? 'Add CV' : 'Add Cover Letter';
        
        // Store the document type for form submission handling
        const form = document.getElementById('document-form');
        form.setAttribute('data-doc-type', docType);
    },
    
    // Show add job modal
    showAddJobModal: function() {
        const modalTemplate = document.getElementById('add-job-modal-template');
        const modalContent = modalTemplate.content.cloneNode(true);
        document.body.appendChild(modalContent);
    },
    
    // Close any open modal
    closeModal: function() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    },
    
    // Handle job form submission
    handleJobFormSubmit: function() {
        const title = document.getElementById('job-title').value;
        const company = document.getElementById('company').value;
        const description = document.getElementById('job-description').value;
        const url = document.getElementById('job-url').value;
        
        if (title && company && description) {
            // Create new job record
            const newJob = {
                id: Date.now(), // Simple ID generation
                userId: currentUser.id,
                title: title,
                company: company,
                description: description,
                url: url,
                addedDate: new Date(),
                status: 'Active',
                requirements: [],
                skills: [],
                keywords: []
            };
            
            // Add to database
            db.jobDescriptions.push(newJob);
            
            // Close modal
            this.closeModal();
            
            // Show job analysis result modal (simplified for this demo)
            this.showJobAnalysisResult(newJob);
        }
    },
    
    // Show job analysis result (simplified)
    showJobAnalysisResult: function(job) {
        // In a real app, this would use AI to extract requirements, skills, and keywords
        // For this demo, we'll just simulate it
        
        // Simple keyword extraction simulation
        const keywords = this.simulateKeywordExtraction(job.description);
        
        // Update the job with extracted data
        job.requirements = keywords.requirements;
        job.skills = keywords.skills;
        job.keywords = keywords.keywords;
        
        // Refresh the jobs screen
        this.loadScreen('jobs');
        
        // Show success message
        this.showToast('Job description analysed successfully');
    },
    
    // Simulate keyword extraction (in a real app, this would use AI)
    simulateKeywordExtraction: function(text) {
        // Convert text to lowercase for easier matching
        const lowerText = text.toLowerCase();
        
        // Sample requirements, skills, and keywords to look for
        const requirementKeywords = [
            'required', 'requirement', 'must have', 'essential', 'necessary',
            'degree', 'qualification', 'experience', 'years', 'background'
        ];
        
        const skillKeywords = [
            'skill', 'proficient', 'knowledge', 'familiar', 'expertise',
            'programming', 'development', 'design', 'communication', 'management',
            'javascript', 'python', 'react', 'angular', 'vue', 'nodejs', 'html', 'css',
            'java', 'c#', 'php', 'sql', 'database', 'cloud', 'aws', 'azure'
        ];
        
        const generalKeywords = [
            'team', 'collaborate', 'project', 'deadline', 'client',
            'innovative', 'solution', 'problem', 'solving', 'analytical',
            'detail', 'organized', 'leadership', 'initiative', 'motivated'
        ];
        
        // Split text into sentences
        const sentences = text.split(/[.!?]+/);
        
        const requirements = [];
        const skills = [];
        const keywords = [];
        
        // Process each sentence
        sentences.forEach(sentence => {
            const lowerSentence = sentence.toLowerCase().trim();
            if (lowerSentence.length < 5) return; // Skip very short sentences
            
            // Check for requirement sentences
            if (requirementKeywords.some(keyword => lowerSentence.includes(keyword))) {
                requirements.push(sentence.trim());
            }
            
            // Check for skill sentences
            if (skillKeywords.some(keyword => lowerSentence.includes(keyword))) {
                skills.push(sentence.trim());
            }
            
            // Check for general keywords
            if (generalKeywords.some(keyword => lowerSentence.includes(keyword))) {
                keywords.push(sentence.trim());
            }
        });
        
        // Limit the number of items
        return {
            requirements: requirements.slice(0, 5),
            skills: skills.slice(0, 5),
            keywords: keywords.slice(0, 5)
        };
    },
    
    // Handle document form submission
    handleDocumentFormSubmit: function() {
        const form = document.getElementById('document-form');
        const docType = form.getAttribute('data-doc-type');
        
        // Determine which tab is active
        const activeTab = document.querySelector('.modal-body .tab-button.active');
        const isUpload = activeTab.getAttribute('data-tab') === 'upload';
        
        let title, content;
        
        if (isUpload) {
            title = document.getElementById('doc-title').value;
            const fileInput = document.getElementById('doc-file');
            
            if (!fileInput.files || fileInput.files.length === 0) {
                this.showToast('Please select a file to upload', 'error');
                return;
            }
            
            // In a real app, we would process the file
            // For this demo, we'll just use a placeholder
            content = `Content extracted from ${fileInput.files[0].name}`;
        } else {
            title = document.getElementById('doc-title-paste').value;
            content = document.getElementById('doc-content').value;
            
            if (!content) {
                this.showToast('Please enter document content', 'error');
                return;
            }
        }
        
        if (!title) {
            this.showToast('Please enter a title for your document', 'error');
            return;
        }
        
        // Create new document record
        if (docType === 'cv') {
            const newCV = {
                id: Date.now(), // Simple ID generation
                userId: currentUser.id,
                title: title,
                content: content,
                createdDate: new Date(),
                lastModified: new Date(),
                isBase: true
            };
            
            // Add to database
            db.cvs.push(newCV);
        } else {
            const newCL = {
                id: Date.now(), // Simple ID generation
                userId: currentUser.id,
                title: title,
                content: content,
                createdDate: new Date(),
                lastModified: new Date(),
                isBase: true
            };
            
            // Add to database
            db.coverLetters.push(newCL);
        }
        
        // Close modal
        this.closeModal();
        
        // Refresh documents screen
        this.loadScreen('documents');
        
        // Show success message
        this.showToast(`${docType.toUpperCase()} added successfully`);
    },
    
    // Show a toast notification
    showToast: function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide and remove the toast after a delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
};

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    App.init();
    
    // Add toast styling
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background-color: var(--success-color);
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            opacity: 0;
            transition: transform 0.3s, opacity 0.3s;
        }
        
        .toast.error {
            background-color: var(--secondary-color);
        }
        
        .toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        .document-list, .job-list, .customisation-items {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .document-item, .job-item, .customisation-item {
            background-color: var(--card-background);
            border-radius: 8px;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: var(--shadow);
        }
        
        .document-actions, .job-actions {
            display: flex;
            gap: 10px;
        }
        
        .action-icon {
            background: none;
            border: none;
            color: var(--light-text);
            font-size: 16px;
            cursor: pointer;
            padding: 5px;
        }
        
        .action-icon:hover {
            color: var(--primary-color);
        }
        
        .progress-bar {
            height: 10px;
            background-color: var(--border-color);
            border-radius: 5px;
            overflow: hidden;
            margin: 0 10px;
            flex-grow: 1;
        }
        
        .progress {
            height: 100%;
            background-color: var(--primary-color);
        }
        
        .score {
            display: flex;
            align-items: center;
            margin-top: 5px;
        }
        
        .score-container {
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);
});

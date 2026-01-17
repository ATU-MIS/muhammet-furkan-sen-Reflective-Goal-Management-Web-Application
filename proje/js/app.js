/**
 * Main Application Logic
 */

class App {
    constructor() {
        this.storage = new GoalJourneyStorage();
        this.ui = new GoalJourneyUI();
        this.currentUser = null;
        this.goals = [];
        
        // In-memory store for file objects (simulating backend file storage)
        this.fileStore = new Map();
        
        // Define handlers for UI to call
        this.handlers = {
            viewGoal: (id) => this.viewGoal(id),
            toggleMilestone: (gId, mId) => this.toggleMilestone(gId, mId),
            addMilestone: (gId) => this.promptAddMilestone(gId),
            saveMilestone: (gId, form) => this.saveMilestone(gId, form),
            saveGlobalMilestone: (form) => this.saveGlobalMilestone(form),
            addNote: (gId) => this.promptAddNote(gId),
            logTime: (gId) => this.promptLogTime(gId),
            simulateComment: (gId) => this.simulateComment(gId),
            logFailure: (gId) => this.promptLogFailure(gId),
            saveNote: (gId, form) => this.saveNote(gId, form),
            onFileSelect: (input) => this.handleFileSelect(input),
            toggleSidebar: () => this.toggleSidebar(),
            openAttachment: (fileId) => this.openAttachment(fileId),
            completeGoal: (gId) => this.completeGoal(gId),
            saveCompletionReflection: (gId, form) => this.saveCompletionReflection(gId, form),
            logout: () => this.logout(),
            confirmLogout: () => this.confirmLogout()
        };
    }

    init() {
        this.currentUser = this.storage.getUser();
        this.goals = this.storage.getGoals();

        this.setupEventListeners();

        if (!this.currentUser) {
            this.ui.renderWelcome();
        } else {
            this.ui.renderUserPreview(this.currentUser);
            this.ui.renderDashboard(this.currentUser, this.goals);
        }
        
        this.ui.updateDateTime(); // Initial call
        
        // Global refresh loop for time updates (every second for fluid clock)
        setInterval(() => {
            this.ui.updateDateTime();
        }, 1000); // 1 second update
    }

    logout() {
        this.ui.renderLogoutConfirmationModal();
    }

    confirmLogout() {
        this.storage.clearUser();
        this.currentUser = null;
        this.ui.renderLogoutState();
    }

    setupEventListeners() {
        // Navigation delegation for sidebar is largely handled by onclick attributes in HTML for simplicity in this refactor,
        // but we can keep a general listener if needed.
        
        document.body.addEventListener('click', (e) => {
            // Create Profile Button handled by onclick or specific ID
            if (e.target.id === 'btn-create-profile') {
                this.switchView('profile'); // Switch to profile view
            }

            // Add Goal Button
            if (e.target.id === 'btn-add-goal') {
                this.ui.renderAddGoalForm();
                this.setupFormListeners(); // Re-bind form listeners for modal
            }
        });

        // Form Submission Delegation (since forms are dynamic)
        document.body.addEventListener('submit', (e) => {
            if (e.target.id === 'profile-form') {
                e.preventDefault();
                this.handleProfileSubmit(new FormData(e.target));
            }
            if (e.target.id === 'add-goal-form') {
                e.preventDefault();
                this.handleAddGoal(new FormData(e.target));
            }
        });
    }

    setupFormListeners() {
        // Any specific input listeners if needed
    }

    switchView(viewName) {
        if (!this.currentUser && viewName !== 'profile') {
            // Force welcome if no user
             return this.ui.renderWelcome();
        }
        
        this.ui.updateActiveNav(viewName);
        
        // Scroll to top
        window.scrollTo(0,0);

        switch(viewName) {
            case 'dashboard':
                this.ui.renderDashboard(this.currentUser, this.goals);
                break;
            case 'profile':
                this.ui.renderProfile(this.currentUser);
                break;
            case 'add-goal':
                this.ui.renderAddGoalForm();
                break;
            case 'my-goals':
                this.ui.renderMyGoals(this.goals);
                break;
            case 'notes':
                this.ui.renderGlobalNotes(this.goals);
                break;
            case 'milestones':
                this.ui.renderGlobalMilestones(this.goals);
                break;
            case 'goal-story':
                this.ui.renderGlobalTimeline(this.goals);
                break;
            case 'failure-log':
                this.ui.renderGlobalFailureLog(this.goals);
                break;
            case 'time-reality-check':
                this.ui.renderTimeRealityCheck(this.goals);
                break;
            case 'goal-detail': // Helper case, usually called via viewGoal
                if (this.currentGoalId) this.viewGoal(this.currentGoalId);
                break;
            default:
                this.ui.renderDashboard(this.currentUser, this.goals);
        }
    }

    // --- Actions ---

    handleProfileSubmit(formData) {
        const user = new User(
            formData.get('name'),
            formData.get('bio'),
            formData.get('avatar')
        );
        
        // Update existing if ID matches? For now just overwrite or create new
        if (this.currentUser) {
            user.id = this.currentUser.id;
            user.joinedAt = this.currentUser.joinedAt;
        }

        this.currentUser = user;
        this.storage.saveUser(user);
        this.ui.renderUserPreview(user);
        this.switchView('dashboard');
    }

    handleAddGoal(formData) {
        const title = formData.get('title');
        const desc = formData.get('description');
        const deadline = formData.get('deadline');
        const hours = formData.get('estimatedHours');

        if (!this.currentUser) return;

        const newGoal = new Goal(this.currentUser.id, title, desc, deadline, hours);
        this.storage.addGoal(newGoal);
        this.goals.push(newGoal); // Update local state
        
        this.ui.closeModal();
        this.switchView('dashboard'); // Refresh
    }

    viewGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            this.ui.renderGoalDetail(goal);
        }
    }

    completeGoal(goalId) {
        this.ui.renderCompletionReflectionModal(goalId);
    }

    saveCompletionReflection(goalId, formElement) {
        const formData = new FormData(formElement);
        const reflection = {
            worked: formData.get('worked'),
            didntWork: formData.get('didntWork'),
            differently: formData.get('differently')
        };

        const goal = this.goals.find(g => g.id === goalId);
        if (goal && reflection.worked) {
            goal.markAsCompleted(reflection);
            this.storage.updateGoal(goal);
            this.ui.closeModal();
            this.ui.renderGoalDetail(goal); // Re-render to show completion state
            this.ui.renderDashboard(this.currentUser, this.goals); // Refresh dashboard stats
        }
    }

    toggleMilestone(goalId, milestoneId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.toggleMilestone(milestoneId);
            this.storage.updateGoal(goal);
            this.ui.renderGoalDetail(goal); // Re-render modal
        }
    }

    promptAddMilestone(goalId) {
        this.ui.renderAddMilestoneModal(goalId);
    }

    saveMilestone(goalId, formElement) {
        const formData = new FormData(formElement);
        const title = formData.get('title');
        const description = formData.get('description');
        let externalLink = formData.get('externalLink');

        if (externalLink && !externalLink.match(/^https?:\/\//)) {
            alert('Please enter a valid URL starting with http:// or https://');
            return;
        }

        if (title) {
            const goal = this.goals.find(g => g.id === goalId);
            if (goal) {
                goal.addMilestone(title, description, externalLink);
                this.storage.updateGoal(goal);
                this.ui.closeModal();
                this.ui.renderGoalDetail(goal);
            }
        }
    }

    saveGlobalMilestone(formElement) {
        const formData = new FormData(formElement);
        const goalId = formData.get('goalId');
        // Reuse saveMilestone logic effectively, but we need to handle the render target.
        // For simplicity, let's just duplicate the crucial logic or call saveMilestone if we can redirect the view update.
        // But saveMilestone calls renderGoalDetail. We want renderGlobalMilestones.
        
        const title = formData.get('title');
        const description = formData.get('description');
        let externalLink = formData.get('externalLink');

        if (externalLink && !externalLink.match(/^https?:\/\//)) {
            alert('Please enter a valid URL starting with http:// or https://');
            return;
        }
        
        if (title && goalId) {
            const goal = this.goals.find(g => g.id === goalId);
            if (goal) {
                goal.addMilestone(title, description, externalLink);
                this.storage.updateGoal(goal);
                this.ui.closeModal();
                this.ui.renderGlobalMilestones(this.goals); // Render the global list
            }
        }
    }

    promptAddNote(goalId) {
        // Replaced prompt with modal
        this.ui.renderAddNoteModal(goalId);
    }

    handleFileSelect(inputElement) {
        const feedback = document.getElementById('file-feedback');
        const saveBtn = document.getElementById('btn-save-note');
        
        if (!feedback) return;

        feedback.innerHTML = ''; // Clear previous
        
        // Read directly from the input files property
        const files = Array.from(inputElement.files);
        
        if (files.length === 0) return;

        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '0.5rem';

        files.forEach(file => {
            // Explicitly recognize PDF files as requested
            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
            if (isPdf) {
                console.log('PDF File processed:', file.name);
            }

            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '0.5rem';
            item.style.padding = '0.5rem';
            item.style.borderRadius = '0.25rem';
            item.style.background = 'rgba(52, 211, 153, 0.1)';
            item.style.border = '1px solid var(--success)';

            item.innerHTML = `
                <span style="color: var(--success); font-weight: bold;">${isPdf ? '📄' : '✓'}</span>
                <span style="flex: 1; font-size: 0.9rem;">${file.name}</span>
            `;
            list.appendChild(item);
        });

        feedback.appendChild(list);
        
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
            saveBtn.style.cursor = 'pointer';
        }
    }

    saveNote(goalId, formElement) {
        const formData = new FormData(formElement);
        const content = formData.get('content');
        const type = formData.get('type') || 'Reflection';
        const impact = formData.get('impact') || 'Neutral';
        
        // Get files directly from input since FormData handling of multiple files varies
        const fileInput = formElement.querySelector('input[type="file"]');
        const files = fileInput ? Array.from(fileInput.files) : [];

        if (content) {
            const goal = this.goals.find(g => g.id === goalId);
            if (goal) {
                const attachments = [];
                
                // Process Files (No restrictions)
                for (const file of files) {
                    // Generate a simple unique ID for the file
                    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    
                    // Store the actual File object in memory
                    this.fileStore.set(fileId, file);

                    attachments.push({
                        id: fileId,
                        name: file.name,
                        type: file.type || 'application/octet-stream',
                        size: (file.size / 1024).toFixed(2) + ' KB',
                        createdAt: new Date().toISOString()
                    });
                }

                goal.addNote(content, attachments, type, impact);
                this.storage.updateGoal(goal);
                this.ui.closeModal();
                this.ui.renderGoalDetail(goal); // Re-render modal details
            }
        }
    }

    openAttachment(fileId) {
        const file = this.fileStore.get(fileId);
        if (file) {
            const url = URL.createObjectURL(file);
            window.open(url, '_blank');
        } else {
            alert('ℹ️ Simulation Notice\n\nBecause this is a front-end only demo, file attachments are stored in temporary session memory.\n\nThe file you are trying to open was attached in a previous session and is no longer available. To test file opening, please re-upload the file in this current session.');
        }
    }
    
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }

    _setupMobileSidebarListener() {
         const sidebar = document.querySelector('.sidebar');
         const toggleBtn = document.getElementById('mobile-menu-toggle');
         
         document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
         });
    }
    
    promptLogTime(goalId) {
        const hours = prompt("Enter hours spent:");
        if (hours && !isNaN(hours)) {
             const goal = this.goals.find(g => g.id === goalId);
             if (goal) {
                 goal.actualHours += parseFloat(hours);
                 this.storage.updateGoal(goal);
                 // If we are currently on the Time Reality Check view, re-render it to update the global bar
                 const currentView = document.querySelector('.sidebar-link.active');
                 if (currentView && currentView.dataset.view === 'time-reality-check') {
                     this.ui.renderTimeRealityCheck(this.goals);
                 } else {
                     this.ui.renderGoalDetail(goal); // Fallback if just in modal
                 }
             }
         }
    }

    simulateComment(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            const users = ['Alice', 'Bob', 'Charlie', 'Coach_Mike', 'Sarah_Dev'];
            const messages = [
                'Keep going! You got this.',
                'Have you tried breaking this down further?',
                'I struggled with this too, let me know if you need help.',
                'Great progress so far!',
                'What is your plan for the next milestone?'
            ];
            
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];
            
            goal.addComment(randomUser, randomMsg);
            this.storage.updateGoal(goal);
            this.ui.renderGoalDetail(goal);
        }
    }

    promptLogFailure(goalId) {
        const reason = prompt("What setback did you encounter?");
        if (reason) {
            const goal = this.goals.find(g => g.id === goalId);
            if (goal) {
                goal.logFailure(reason);
                this.storage.updateGoal(goal);
                this.ui.renderGoalDetail(goal);
            }
        }
    }
}

// Initialize App
const app = new App();
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    app._setupMobileSidebarListener();
    // Expose app to window for event attributes
    window.app = app;
});

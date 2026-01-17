/**
 * UI Controller for My Goal Journey
 */

class GoalJourneyUI {
    constructor() {
        this.app = document.getElementById('app');
        // this.mainContent = document.getElementById('main-content'); // No longer targeting main directly
        this.modalContainer = document.getElementById('modal-container');
        this.userPreview = document.getElementById('userPreview');
        this.sidebar = document.querySelector('.sidebar');
        this.header = document.querySelector('.main-header');
        
        // Cache sections
        this.sections = {
            dashboard: document.getElementById('section-dashboard'),
            profile: document.getElementById('section-profile'),
            addGoal: document.getElementById('section-add-goal'),
            myGoals: document.getElementById('section-my-goals'),
            notes: document.getElementById('section-notes'),
            milestones: document.getElementById('section-milestones'),
            goalStory: document.getElementById('section-goal-story'),
            failureLog: document.getElementById('section-failure-log'),
            timeReality: document.getElementById('section-time-reality-check')
        };
    }
    
    // --- Layout Helpers ---
    showSection(sectionName) {
        // Hide all
        Object.values(this.sections).forEach(el => {
            if(el) el.classList.add('hidden');
        });

        // Hide header progress bar by default
        const headerBar = document.getElementById('header-progress-bar');
        if (headerBar) headerBar.classList.add('hidden');
        
        // Show target
        const target = this.sections[sectionName];
        if (target) {
            target.classList.remove('hidden');
        }
    }

    // --- Navigation & Layout ---

    updateActiveNav(viewName) {
        // Remove active from all sidebar links
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add to current
        if (viewName) {
            const activeLink = document.querySelector(`.sidebar-link[data-view="${viewName}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }

    renderUserPreview(user) {
        if (!user) {
            this.userPreview.innerHTML = '';
            if (this.sidebar) this.sidebar.classList.add('hidden');
            if (this.header) this.header.classList.add('hidden');
            return;
        }
        if (this.sidebar) this.sidebar.classList.remove('hidden');
        if (this.header) this.header.classList.remove('hidden');
        this.userPreview.innerHTML = `
            <span class="header-user-name">${user.name}</span>
            <div class="header-user-avatar">
               ${user.avatar ? `<img src="${user.avatar}" style="width:100%; height:100%; object-fit:cover;">` : user.name[0]}
            </div>
        `;
    }

    updateDateTime() {
        const now = new Date();
        const el = document.getElementById('header-datetime');
        if (el) {
            const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            el.innerHTML = `${dateStr}  <span style="opacity:0.6; margin: 0 0.5rem;">|</span>  ${timeStr}`;
        }
    }

    // --- Views ---

    renderWelcome() {
        if (this.sidebar) this.sidebar.classList.add('hidden');
        if (this.header) this.header.classList.add('hidden');
        this.showSection('dashboard');
        this.sections.dashboard.innerHTML = `
            <div class="welcome-screen" style="text-align: center; margin-top: 4rem;">
                <h1 style="font-size: 3rem; margin-bottom: 1rem;">Welcome to Your Journey</h1>
                <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 1.2rem;">Start via creating your profile.</p>
                <button class="btn btn-primary" id="btn-create-profile">Create Profile</button>
            </div>
        `;
    }

    renderDashboard(user, goals) {
        const activeGoals = goals.filter(g => g.status === 'active');
        const completedGoals = goals.filter(g => g.status === 'completed');
        
        this.showSection('dashboard');
        this.sections.dashboard.innerHTML = `
            <div class="dashboard-header" style="margin-bottom: 2rem;">
                <h2>Hello, ${user.name} 👋</h2>
                <p style="color: var(--text-muted);">Here is your progress overview.</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3 class="stat-value" style="color: var(--primary);">${goals.length}</h3>
                    <p style="color: var(--text-muted);">Total Goals</p>
                </div>
                <div class="stat-card">
                    <h3 class="stat-value" style="color: var(--success);">${completedGoals.length}</h3>
                    <p style="color: var(--text-muted);">Completed</p>
                </div>
                <div class="stat-card">
                    <h3 class="stat-value" style="color: var(--warning);">${activeGoals.length}</h3>
                    <p style="color: var(--text-muted);">In Progress</p>
                </div>
            </div>

            <!-- Suggested Actions -->
            ${this._renderSuggestions(activeGoals)}

            <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h3>Active Missions</h3>
                <button class="btn btn-primary" id="btn-add-goal">+ New Goal</button>
            </div>

            ${activeGoals.length === 0 ? 
                `<div class="empty-state">
                    No active goals. Start something new!
                </div>` : 
                `<div class="goals-grid">
                    ${activeGoals.map(g => this._createGoalCard(g)).join('')}
                </div>`
            }
        `;
    }

    renderLogoutConfirmationModal() {
        const content = `
            <div style="background: var(--bg-card); padding: 2.5rem; border-radius: var(--radius-md); text-align: center; max-width: 400px; margin: 2rem auto;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🚪</div>
                <h3 style="margin-bottom: 0.5rem;">Ready to leave?</h3>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Your progress is saved and waiting for your next visit.</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn btn-secondary" style="flex: 1;" onclick="app.ui.closeModal()">Stay</button>
                    <button class="btn btn-primary" style="flex: 1; background: var(--danger); border-color: var(--danger);" onclick="app.handlers.confirmLogout()">Logout</button>
                </div>
            </div>
        `;
        this.openModal(content);
    }

    renderLogoutState() {
        // Immediate visual feedback: start fading out elements
        if (this.sidebar) {
            this.sidebar.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            this.sidebar.style.opacity = '0';
            this.sidebar.style.transform = 'translateX(-20px)';
        }
        if (this.header) {
            this.header.style.transition = 'opacity 0.2s ease';
            this.header.style.opacity = '0';
        }

        setTimeout(() => {
            this.closeModal();
            if (this.sidebar) {
                this.sidebar.classList.add('hidden');
                this.sidebar.style.opacity = '';
                this.sidebar.style.transform = '';
            }
            if (this.header) {
                this.header.classList.add('hidden');
                this.header.style.opacity = '';
            }
            
            // Show welcome screen with its own animation
            this.renderWelcome();
        }, 300);
    }

    renderProfile(user) {
        this.showSection('profile');
        this.sections.profile.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; background: var(--bg-card); padding: 2rem; border-radius: 1rem; border: 1px solid var(--border-color);">
                <h2 style="margin-bottom: 1.5rem;">User Profile</h2>
                <form id="profile-form">
                    <div class="form-group">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input" name="name" value="${user ? user.name : ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bio</label>
                        <textarea class="form-textarea" name="bio" rows="3">${user ? user.bio : ''}</textarea>
                    </div>
                    <!-- Simple simulation for avatar URL -->
                    <div class="form-group">
                        <label class="form-label">Avatar URL (Optional)</label>
                        <input type="text" class="form-input" name="avatar" value="${user ? user.avatar : ''}">
                    </div>
                    <button type="submit" class="btn btn-primary">Save Profile</button>
                </form>
            </div>
        `;
    }

    renderGoalDetail(goal) {
        // Calculate countdown
        const now = new Date();
        const end = new Date(goal.deadline);
        const diff = end - now;
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const isExpired = diff < 0;

        const content = `
            <div class="goal-detail-header" style="margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">${goal.title}</h2>
                        <span style="background: rgba(99, 102, 241, 0.1); color: var(--primary); padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem;">
                            ${goal.status.toUpperCase()}
                        </span>
                    </div>
                    <div style="text-align: right;">
                         <div style="font-size: 2rem; font-weight: 700; color: ${isExpired ? 'var(--danger)' : 'var(--text-main)'};">
                            ${isExpired ? 'Expired' : daysLeft + 'd'}
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">Remaining</div>
                        ${goal.status === 'active' ? `<button class="btn btn-primary" style="margin-top: 1rem; font-size: 0.8rem;" onclick="app.handlers.completeGoal('${goal.id}')">✓ Mark as Completed</button>` : ''}
                    </div>
                </div>
                <p style="margin-top: 1rem; color: var(--text-muted);">${goal.description || 'No description provided.'}</p>
                
                ${goal.completionReflection ? `
                    <div style="margin-top: 2rem; background: var(--bg-body); padding: 1.5rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                        <h3 style="margin-bottom: 1rem; font-size: 1.2rem;">🏆 Completion Reflection</h3>
                        <div style="display: grid; gap: 1rem;">
                            <div>
                                <div style="font-size: 0.8rem; color: var(--success); font-weight: 600; margin-bottom: 0.2rem;">What Worked Well</div>
                                <p style="font-size: 0.9rem;">${goal.completionReflection.worked}</p>
                            </div>
                            <div>
                                <div style="font-size: 0.8rem; color: var(--danger); font-weight: 600; margin-bottom: 0.2rem;">What Did Not Work</div>
                                <p style="font-size: 0.9rem;">${goal.completionReflection.didntWork}</p>
                            </div>
                            <div>
                                <div style="font-size: 0.8rem; color: var(--primary); font-weight: 600; margin-bottom: 0.2rem;">Next Time</div>
                                <p style="font-size: 0.9rem;">${goal.completionReflection.differently}</p>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>

            <div class="goal-sections" style="display: grid; gap: 2rem;">
                
                <!-- Progress & Milestones -->
                <section>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3>Milestones</h3>
                        <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="app.handlers.addMilestone('${goal.id}')">+ Add</button>
                    </div>
                    <div class="progress-bar" style="height: 8px; background: var(--bg-card-hover); border-radius: 4px; margin-bottom: 1rem; overflow: hidden;">
                        <div style="height: 100%; width: ${goal.progress}%; background: var(--success); transition: width 0.3s;"></div>
                    </div>
                    <div class="milestones-container">
                        ${goal.milestones.length === 0 ? `
                            <div style="text-align: center; padding: 2rem; background: var(--bg-card); border: 2px dashed var(--border-color); border-radius: var(--radius-md); margin-top: 1rem;">
                                <div style="font-size: 2rem; margin-bottom: 1rem;">🎯</div>
                                <h4 style="margin-bottom: 0.5rem;">No milestones yet</h4>
                                <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 300px; margin: 0 auto 1.5rem auto;">
                                    Milestones help you break down big goals into manageable steps. They can be normal tasks or links to external learning resources.
                                </p>
                                <button class="btn btn-primary" onclick="app.handlers.addMilestone('${goal.id}')">Create your first milestone</button>
                            </div>
                        ` : 
                          goal.milestones.map(m => {
                            const badge = this._getResourceBadge(m.externalLink);
                            return `
                            <div class="milestone-card ${m.isCompleted ? 'completed' : ''} ${m.externalLink ? 'type-learning' : 'type-task'}">
                                <div class="custom-checkbox ${m.isCompleted ? 'checked' : ''}" onclick="app.handlers.toggleMilestone('${goal.id}', '${m.id}')" style="margin-top: 0.2rem;"></div>
                                <div class="milestone-info">
                                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                        <div class="milestone-title">${m.title}</div>
                                        ${badge ? `
                                            <span class="milestone-badge-pill">
                                                <span>${badge.icon}</span> ${badge.text}
                                            </span>
                                        ` : ''}
                                    </div>
                                    ${m.description ? `<p class="milestone-desc">${m.description}</p>` : ''}
                                    ${m.externalLink ? `
                                        <a href="${m.externalLink}" target="_blank" rel="noopener noreferrer" title="Open learning resource" class="milestone-resource-btn">
                                            <span>🔗</span> Open Resource
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                    </div>
                </section>

                <!-- Time Reality Check -->
                <section style="background: var(--bg-card-hover); padding: 1rem; border-radius: 0.5rem;">
                    <h3>Time Reality Check</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                        <div>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">Estimated</span>
                            <div style="font-weight: 600;">${goal.estimatedHours} hrs</div>
                        </div>
                        <div>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">Actual</span>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <span style="font-weight: 600;">${goal.actualHours} hrs</span>
                                <button onclick="app.handlers.logTime('${goal.id}')" style="background: none; border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px; cursor: pointer; padding: 0 0.5rem;">+</button>
                            </div>
                        </div>
                    </div>
                    <!-- Visual Bar comparison -->
                    <div style="margin-top: 1rem;">
                        <div style="font-size: 0.7rem; margin-bottom: 0.2rem;">Reality vs Expectation</div>
                        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; position: relative;">
                            <!-- Estimated Marker -->
                            <div style="position: absolute; left: 0; top:0; bottom:0; width: ${Math.min(100, (goal.estimatedHours / (Math.max(goal.estimatedHours, goal.actualHours) || 1)) * 100)}%; background: var(--primary); opacity: 0.5;"></div>
                            <!-- Actual Marker -->
                             <div style="position: absolute; left: 0; top:0; bottom:0; width: ${Math.min(100, (goal.actualHours / (Math.max(goal.estimatedHours, goal.actualHours) || 1)) * 100)}%; background: ${goal.actualHours > goal.estimatedHours ? 'var(--danger)' : 'var(--success)'};"></div>
                        </div>
                    </div>
                </section>

                <!-- Notes -->
                <section>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3>Notes & Attachments</h3>
                        <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="app.handlers.addNote('${goal.id}')">+ Add Note</button>
                    </div>
                    <div class="notes-list">
                         ${goal.notes.length === 0 ? '<p style="color: var(--text-muted); font-style: italic;">No notes recorded.</p>' : 
                          goal.notes.map(n => `
                            <div class="note-item" style="background: var(--bg-card); padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border-color); margin-bottom: 0.5rem;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                    <div style="display:flex; gap: 0.5rem;">
                                        <span class="badge badge-${(n.type || 'Reflection').toLowerCase().replace(' ', '-')}" style="font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 1rem; background: var(--bg-body); border: 1px solid var(--border-color);">${n.type || 'Reflection'}</span>
                                        ${n.impact && n.impact !== 'Neutral' ? `<span style="font-size: 0.7rem; padding: 0.2rem 0.4rem; border-radius: 1rem; background: ${n.impact === 'Positive' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${n.impact === 'Positive' ? 'var(--success)' : 'var(--danger)'}; border: 1px solid ${n.impact === 'Positive' ? 'var(--success)' : 'var(--danger)'};">${n.impact === 'Positive' ? '🟢' : '🔴'}</span>` : ''}
                                    </div>
                                    <span style="font-size: 0.7rem; color: var(--text-muted);">${new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style="margin-top: 0.5rem;">${n.content}</p>
                                ${n.attachments && n.attachments.length > 0 ? `
                                    <div style="margin-top: 0.5rem; font-size: 0.8rem;">
                                        ${n.attachments.map(a => {
                                            let icon = '📎';
                                            if (a.name.toLowerCase().endsWith('.pdf') || a.type.includes('pdf')) icon = '📄';
                                            else if (a.name.toLowerCase().match(/\.(doc|docx)$/) || a.type.includes('word')) icon = '📝';
                                            else if (a.name.toLowerCase().match(/\.(ppt|pptx)$/) || a.type.includes('presentation')) icon = '📊';
                                            else if (a.name.toLowerCase().endsWith('.txt') || a.type.includes('text')) icon = '📃';
                                            
                                            return `
                                            <div style="display: flex; align-items: start; gap: 0.75rem; margin-bottom: 0.5rem; background: var(--bg-body); padding: 0.6rem; border-radius: 0.4rem; border: 1px solid var(--border-color);">
                                                <div style="font-size: 1.4rem; line-height: 1;">${icon}</div>
                                                <div style="flex: 1;">
                                                    <a href="#" onclick="event.preventDefault(); app.handlers.openAttachment('${a.id}')" style="color: var(--primary); text-decoration: none; font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.1rem;">${a.name}</a>
                                                    <div style="font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem;">
                                                        <span style="background: rgba(0,0,0,0.05); padding: 0 0.3rem; border-radius: 3px;">${a.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                                                        <span>${a.size}</span>
                                                        ${a.createdAt ? `<span style="opacity: 0.5;">|</span> <span>${new Date(a.createdAt).toLocaleDateString()} ${new Date(a.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        `}).join('')}
                                    </div>
                                ` : ''}
                                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.5rem;">${new Date(n.createdAt).toLocaleDateString()}</div>
                            </div>
                          `).join('')}
                    </div>
                </section>

                <!-- Timeline -->
                <section>
                    <h3>Story Timeline</h3>
                     <div class="timeline" style="margin-top: 1rem; padding-left: 1rem; border-left: 2px solid var(--border-color);">
                        ${this._renderTimelineItems(goal)}
                    </div>
                </section>

                <!-- Comments / Interaction -->
                <section>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3>Community Interaction</h3>
                        <button class="btn btn-secondary" style="font-size: 0.8rem;" onclick="app.handlers.simulateComment('${goal.id}')">Simulate Interaction</button>
                    </div>
                    <div class="comments-list">
                         ${goal.comments && goal.comments.length > 0 ? 
                           goal.comments.map(c => `
                            <div class="comment-item" style="background: var(--bg-card); padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 0.5rem; border-left: 3px solid var(--accent);">
                                <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.2rem;">${c.userName}</div>
                                <p style="font-size: 0.9rem;">${c.content}</p>
                                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.3rem;">${new Date(c.createdAt).toLocaleTimeString()}</div>
                            </div>
                           `).join('') : '<p style="color: var(--text-muted);">No comments yet.</p>'}
                    </div>
                </section>

                <!-- Log Failure -->
                <section style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
                    <button class="btn" style="background: rgba(239, 68, 68, 0.1); color: var(--danger); width: 100%;" onclick="app.handlers.logFailure('${goal.id}')">Log a Failure / Setback</button>
                </section>
            </div>
            
            <div style="margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-secondary" onclick="app.ui.closeModal()">Close</button>
            </div>
        `;
        
        this.openModal(content);
    }

    renderAddGoalForm() {
        this.showSection('addGoal');
        this.sections.addGoal.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; background: var(--bg-card); padding: 2rem; border-radius: var(--radius-md); box-shadow: var(--shadow-md);">
                <h2 style="margin-bottom: 1.5rem;">Create New Goal</h2>
                <form id="add-goal-form">
                    <div class="form-group">
                        <label class="form-label">Title</label>
                        <input type="text" class="form-input" name="title" required placeholder="e.g., Learn React" minlength="3">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-textarea" name="description" rows="3" placeholder="Why are you doing this?"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Deadline</label>
                        <input type="date" class="form-input" name="deadline" required min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estimated Hours</label>
                        <input type="number" class="form-input" name="estimatedHours" min="1" placeholder="Total hours to complete">
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
                         <button type="button" class="btn btn-secondary" onclick="app.switchView('dashboard')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Goal</button>
                    </div>
                </form>
            </div>
        `;
    }

    renderMyGoals(goals) {
        this.showSection('myGoals');
        // Similar to dashboard but list view
        this.sections.myGoals.innerHTML = `
            <h2 style="margin-bottom: 1.5rem;">My Active Goals</h2>
            ${goals.length === 0 ? 
                '<div class="empty-state">No goals yet.</div>' : 
                `<div class="goals-grid">
                    ${goals.map(g => this._createGoalCard(g)).join('')}
                </div>`
            }
        `;
    }
    renderGlobalMilestones(goals) {
        this.showSection('milestones');
        // Aggregate all milestones
        const allMilestones = [];
        goals.forEach(g => {
            g.milestones.forEach(m => {
                allMilestones.push({ ...m, goalTitle: g.title, goalId: g.id });
            });
        });

        const total = allMilestones.length;
        const completed = allMilestones.filter(m => m.isCompleted).length;
        const learning = allMilestones.filter(m => m.externalLink).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        this.sections.milestones.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="margin: 0;">Milestone Roadmap</h2>
                <button class="btn btn-primary" onclick="app.ui.renderAddGlobalMilestoneModal()">+ New Milestone</button>
            </div>

            <!-- Milestone Stats Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: var(--bg-card); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${total}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Total Steps</div>
                </div>
                <div style="background: var(--bg-card); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">${completed}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Completed</div>
                </div>
                <div style="background: var(--bg-card); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #6366f1;">${learning}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Learning Hub</div>
                </div>
                <div style="background: var(--bg-card); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">${rate}%</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Velocity</div>
                </div>
            </div>
            <div style="background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                <div class="milestones-container">
                    ${allMilestones.length === 0 ? `
                        <div style="text-align: center; padding: 3rem 1rem;">
                            <div style="font-size: 3rem; margin-bottom: 1.5rem;">🚀</div>
                            <h3 style="margin-bottom: 1rem;">Your Journey Starts Here</h3>
                            <p style="color: var(--text-muted); max-width: 400px; margin: 0 auto 2rem auto; line-height: 1.6;">
                                Milestones are the stepping stones toward your goals. Track progress, document learnings, and link to external resources to build your roadmap.
                            </p>
                            <button class="btn btn-primary btn-lg" onclick="app.ui.renderAddGlobalMilestoneModal()">Create your first milestone</button>
                        </div>
                    ` : 
                      allMilestones.map(m => {
                        const badge = this._getResourceBadge(m.externalLink);
                        return `
                        <div class="milestone-card ${m.isCompleted ? 'completed' : ''} ${m.externalLink ? 'type-learning' : 'type-task'}">
                            <div class="custom-checkbox ${m.isCompleted ? 'checked' : ''}" onclick="app.handlers.toggleMilestone('${m.goalId}', '${m.id}')" style="margin-top: 0.2rem;"></div>
                            <div class="milestone-info">
                                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                        <div class="milestone-title">${m.title}</div>
                                        ${badge ? `
                                            <span class="milestone-badge-pill">
                                                <span>${badge.icon}</span> ${badge.text}
                                            </span>
                                        ` : ''}
                                    </div>
                                    <span style="font-size: 0.8rem; background: var(--bg-body); padding: 0.2rem 0.6rem; border-radius: 1rem; color: var(--text-muted); border: 1px solid var(--border-color);">${m.isCompleted ? 'Completed' : 'Pending'}</span>
                                </div>
                                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.1rem; font-weight: 500;">Goal: ${m.goalTitle}</div>
                                ${m.description ? `<p class="milestone-desc">${m.description}</p>` : ''}
                                ${m.externalLink ? `
                                    <a href="${m.externalLink}" target="_blank" rel="noopener noreferrer" title="Open learning resource" class="milestone-resource-btn">
                                        <span>🔗</span> Open Resource
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                      `}).join('')}
                </div>
            </div>
        `;
    }

    renderGlobalNotes(goals) {
        this.showSection('notes');
        const allNotes = [];
        goals.forEach(g => {
            g.notes.forEach(n => {
                allNotes.push({ ...n, goalTitle: g.title });
            });
        });
        
        allNotes.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        this.sections.notes.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
                <h2>All Notes</h2>
                <div style="font-size: 0.9rem; color: var(--text-muted);">Total: ${allNotes.length}</div>
            </div>
            <div class="notes-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                ${allNotes.length === 0 ? '<div class="empty-state">No notes recorded yet.</div>' : 
                  allNotes.map(n => `
                    <div class="note-card" style="background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <div style="font-size: 0.8rem; color: var(--primary); font-weight: 600;">${n.goalTitle}</div>
                            <div style="display: flex; gap: 0.3rem;">
                                <span class="badge" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; background: var(--bg-body); border-radius: 4px; border: 1px solid var(--border-color);">${n.type || 'Reflection'}</span>
                                ${n.impact && n.impact !== 'Neutral' ? `<span title="${n.impact}" style="font-size: 0.8rem;">${n.impact === 'Positive' ? '🟢' : '🔴'}</span>` : ''}
                            </div>
                        </div>
                        <p style="margin-bottom: 1rem; color: var(--text-main);">${n.content}</p>
                        <div style="font-size: 0.75rem; color: var(--text-muted); padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
                            ${new Date(n.createdAt).toLocaleDateString()}
                            ${n.attachments && n.attachments.length ? `
                                <div style="margin-top: 0.5rem;">
                                    ${n.attachments.map(a => `
                                        <span style="display:inline-block; margin-right: 0.5rem; cursor: pointer; color: var(--accent);" onclick="app.handlers.openAttachment('${a.id}')">
                                            ${a.name.toLowerCase().endsWith('.pdf') ? '📄' : '📎'} ${a.name}
                                        </span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                  `).join('')}
            </div>
        `;
    }

    renderGlobalFailureLog(goals) {
       this.showSection('failureLog');
       const logs = [];
        goals.forEach(g => {
            g.logs.filter(l => l.type === 'failure').forEach(l => {
                logs.push({ ...l, goalTitle: g.title });
            });
        });

        this.sections.failureLog.innerHTML = `
            <h2 style="margin-bottom: 1.5rem;">Failure Logs</h2>
            <div style="background: var(--bg-card); padding: 2rem; border-radius: var(--radius-md);">
                ${logs.length === 0 ? 
                    '<div class="empty-state">No major setbacks recorded. Keep it up!</div>' : 
                    logs.map(l => `
                        <div style="padding: 1rem; border-left: 4px solid var(--danger); background: rgba(239, 68, 68, 0.05); margin-bottom: 1rem; border-radius: 0 0.5rem 0.5rem 0;">
                            <div style="font-weight: 600; color: var(--danger); margin-bottom: 0.3rem;">Setback in: ${l.goalTitle}</div>
                            <p>${l.reason}</p>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">${new Date(l.createdAt).toLocaleDateString()}</div>
                        </div>
                    `).join('')}
            </div>
        `;
    }

    renderTimeRealityCheck(goals) {
        this.showSection('timeReality');
        
        // Show and update the header progress bar
        this.updateRealityProgressBar(goals);
        const headerBar = document.getElementById('header-progress-bar');
        if (headerBar) headerBar.classList.remove('hidden');

        this.sections.timeReality.innerHTML = `
            <h2 style="margin-bottom: 1.5rem;">Time Reality Check</h2>
            <div class="stats-grid" style="grid-template-columns: 1fr;">
                ${goals.map(g => {
                    const est = parseFloat(g.estimatedHours) || 1;
                    const act = parseFloat(g.actualHours) || 0;
                    const ratio = act / est;
                    let insight = { text: "You are on track", color: "var(--success)" };
                    
                    if (ratio > 1) {
                        insight = { text: "Time usage exceeds expectations", color: "var(--danger)" };
                    } else if (ratio > 0.8) {
                        insight = { text: "Approaching estimated limit", color: "var(--warning)" };
                    }

                    return `
                    <div class="stat-card" style="text-align: left; display: flex; align-items: center; justify-content: space-between; gap: 2rem;">
                        <div style="flex: 1;">
                            <h3>${g.title}</h3>
                            <p style="font-size: 0.9rem; color: var(--text-muted);">Estimated: ${g.estimatedHours}h | Actual: ${g.actualHours}h</p>
                        </div>
                        <div style="flex: 2; display: flex; flex-direction: column; gap: 0.5rem;">
                             <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.2rem;">
                                 <span style="font-size: 0.8rem; font-weight: 600; color: ${insight.color};">${insight.text}</span>
                                 <span style="font-size: 0.7rem; color: var(--text-muted);">${Math.round(ratio * 100)}% Used</span>
                             </div>
                             <div style="height: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden; position: relative;">
                                <div style="position: absolute; top:0; left:0; bottom:0; width: ${Math.min(100, (g.estimatedHours / (Math.max(g.estimatedHours, g.actualHours)||1))*100)}%; background: var(--primary); opacity: 0.5;" title="Estimated"></div>
                                <div style="position: absolute; top:0; left:0; bottom:0; width: ${Math.min(100, (g.actualHours / (Math.max(g.estimatedHours, g.actualHours)||1))*100)}%; background: ${g.actualHours > g.estimatedHours ? 'var(--danger)' : 'var(--success)'}; opacity: 0.8;" title="Actual"></div>
                             </div>
                        </div>
                    </div>
                `}).join('')}
            </div>
        `;
    }

    updateRealityProgressBar(goals) {
        const headerBar = document.getElementById('header-progress-bar');
        const fill = document.getElementById('header-progress-fill');
        
        if (!headerBar || !fill) return;

        let totalEst = 0;
        let totalAct = 0;
        
        goals.forEach(g => {
            if (g.status === 'active') { // Only count active goals
                totalEst += parseFloat(g.estimatedHours) || 0;
                totalAct += parseFloat(g.actualHours) || 0;
            }
        });

        if (totalEst === 0) {
            fill.style.width = '0%';
            return;
        }

        const percentage = Math.min(100, (totalAct / totalEst) * 100);
        fill.style.width = `${percentage}%`;

        // Color Logic
        if (totalAct > totalEst) {
            fill.style.backgroundColor = 'var(--danger)'; // Red: Exceeded
        } else if (percentage > 80) {
            fill.style.backgroundColor = 'var(--warning)'; // Yellow: Warning
        } else {
            fill.style.backgroundColor = 'var(--success)'; // Green: On Track
        }
    }
    
    // Fallback for Goal Story (Timeline)
    renderGlobalTimeline(goals) {
        this.showSection('goalStory');
        // Collect all events
        const events = [];
         goals.forEach(g => {
            events.push({ type: 'created', date: g.createdAt, title: `Started Goal: ${g.title}`, goalId: g.id });
            g.milestones.forEach(m => {
                 if(m.isCompleted) events.push({ type: 'milestone', date: m.completedAt, title: `Completed Milestone: ${m.title}`, goalId: g.id });
            });
            g.logs.forEach(l => {
                events.push({ type: 'log', date: l.createdAt, title: l.type === 'failure' ? 'Setback' : 'Log', content: l.reason, goalId: g.id });
            });
        });
        
        events.sort((a,b) => new Date(b.date) - new Date(a.date));

        this.sections.goalStory.innerHTML = `
            <h2>Journey Timeline</h2>
            <div class="timeline" style="margin-top: 2rem; padding-left: 2rem; border-left: 2px solid var(--border-color);">
                ${events.map(e => `
                    <div class="timeline-item" style="position: relative; padding-left: 1.5rem; margin-bottom: 2rem;">
                        <div style="position: absolute; left: -9px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: var(--bg-body); border: 3px solid var(--primary);"></div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.2rem;">${new Date(e.date).toLocaleDateString()}</div>
                        <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.5rem;">${e.title}</div>
                        ${e.content ? `<p style="color: var(--text-muted);">${e.content}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // --- Components ---

    renderAddMilestoneModal(goalId) {
        const uniqueId = Date.now();
        const content = `
            <div style="background: var(--bg-card); padding: 2rem; border-radius: var(--radius-md); max-width: 500px; margin: 0 auto;">
                <h3 style="margin-bottom: 1rem;">Add New Milestone</h3>
                <form onsubmit="event.preventDefault(); app.handlers.saveMilestone('${goalId}', this);">
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <div style="display: flex; gap: 1.5rem; margin-top: 0.5rem; margin-bottom: 1rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="radio" name="type" value="normal" checked onchange="document.getElementById('url-group-${uniqueId}').style.display = 'none'">
                                <span>Normal Task</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="radio" name="type" value="learning" onchange="document.getElementById('url-group-${uniqueId}').style.display = 'block'">
                                <span>Learning Link 🔗</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Title</label>
                        <input type="text" class="form-input" name="title" required placeholder="e.g., Complete Chapter 1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description (Optional)</label>
                        <textarea class="form-textarea" name="description" rows="2" placeholder="Details about this step..."></textarea>
                    </div>
                    <div class="form-group" id="url-group-${uniqueId}" style="display: none;">
                        <label class="form-label">External Resource URL</label>
                        <input type="url" class="form-input" name="externalLink" placeholder="https://youtube.com/...">
                        <small style="color: var(--text-muted); display: block; margin-top: 0.5rem;">Link to a tutorial, doc, or video.</small>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                        <button type="button" class="btn btn-secondary" onclick="app.ui.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Milestone</button>
                    </div>
                </form>
            </div>
        `;
        this.openModal(content);
    }

    renderAddGlobalMilestoneModal() {
        const activeGoals = window.app.goals.filter(g => g.status === 'active');
        
        if (activeGoals.length === 0) {
            alert("You need to create an active goal before adding a milestone.");
            return;
        }

        const uniqueId = Date.now();
        const content = `
            <div style="background: var(--bg-card); padding: 2rem; border-radius: var(--radius-md); max-width: 500px; margin: 0 auto;">
                <h3 style="margin-bottom: 1rem;">Add New Milestone</h3>
                <form onsubmit="event.preventDefault(); app.handlers.saveGlobalMilestone(this);">
                    <div class="form-group">
                        <label class="form-label">Select Goal</label>
                        <select class="form-input" name="goalId" required>
                            ${activeGoals.map(g => `<option value="${g.id}">${g.title}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <div style="display: flex; gap: 1.5rem; margin-top: 0.5rem; margin-bottom: 1rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="radio" name="type" value="normal" checked onchange="document.getElementById('url-group-global-${uniqueId}').style.display = 'none'">
                                <span>Normal Task</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="radio" name="type" value="learning" onchange="document.getElementById('url-group-global-${uniqueId}').style.display = 'block'">
                                <span>Learning Link 🔗</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Title</label>
                        <input type="text" class="form-input" name="title" required placeholder="e.g., Complete Chapter 1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description (Optional)</label>
                        <textarea class="form-textarea" name="description" rows="2" placeholder="Details about this step..."></textarea>
                    </div>
                    <div class="form-group" id="url-group-global-${uniqueId}" style="display: none;">
                        <label class="form-label">External Resource URL</label>
                        <input type="url" class="form-input" name="externalLink" placeholder="https://youtube.com/...">
                        <small style="color: var(--text-muted); display: block; margin-top: 0.5rem;">Link to a tutorial, doc, or video.</small>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                        <button type="button" class="btn btn-secondary" onclick="app.ui.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Milestone</button>
                    </div>
                </form>
            </div>
        `;
        this.openModal(content);
    }

    _renderSuggestions(goals) {
        if (goals.length === 0) return '';

        const suggestions = [];

        // Logic: Check for goals needing attention
        goals.forEach(g => {
            // 1. Missing Milestones
            if (g.milestones.length === 0) {
                suggestions.push({
                    icon: '🎯',
                    title: 'Plan Your Path',
                    text: `Break down <strong>${g.title}</strong> into clear milestones.`,
                    action: `app.handlers.viewGoal('${g.id}')`
                });
            }
            // 2. Health Risk
            else if (g.health && g.health.status !== 'Healthy') {
                suggestions.push({
                    icon: '⏱️',
                    title: 'Time Check',
                    text: `<strong>${g.title}</strong> is ${g.health.status}. Review your time usage.`,
                    action: `app.switchView('time-reality-check')`
                });
            }
            // 3. No Notes (Reflection)
            else if (g.notes.length === 0) {
                suggestions.push({
                    icon: '💭',
                    title: 'Reflect',
                    text: `Capture your initial thoughts for <strong>${g.title}</strong>.`,
                    action: `app.handlers.viewGoal('${g.id}')`
                });
            }
            // 4. Pending Milestone (Active Progress)
            else {
                const nextMilestone = g.milestones.find(m => !m.isCompleted);
                if (nextMilestone) {
                    const isLearning = !!nextMilestone.externalLink;
                    suggestions.push({
                        icon: isLearning ? '🎓' : '🏃',
                        title: isLearning ? 'Continue Learning' : 'Next Step',
                        text: `Advance <strong>${g.title}</strong> by completing "${nextMilestone.title}".`,
                        action: `app.handlers.viewGoal('${g.id}')`
                    });
                }
            }
        });

        // Fallback
        if (suggestions.length === 0) {
            suggestions.push({
                icon: '🚀',
                title: 'Keep Momentum',
                text: 'You are doing great! Update your progress on a current goal.',
                action: null
            });
        }

        // Show top 2 suggestions
        const topSuggestions = suggestions.slice(0, 2);

        return `
            <div style="margin-bottom: 3rem;">
                <h3 style="margin-bottom: 1rem;">Suggested Next Actions</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    ${topSuggestions.map(s => `
                        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-md); border-left: 4px solid var(--primary); display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: transform 0.2s;" onclick="${s.action || ''}">
                            <div style="font-size: 1.5rem; background: var(--bg-body); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">${s.icon}</div>
                            <div>
                                <div style="font-weight: 600; margin-bottom: 0.2rem;">${s.title}</div>
                                <div style="font-size: 0.9rem; color: var(--text-muted);">${s.text}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // --- Helpers ---

    _getResourceBadge(url) {
        if (!url) return null;
        const lowerUrl = url.toLowerCase();
        
        if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('vimeo')) {
            return { text: 'Video', icon: '📺', class: 'badge-video' }; // We'll style these inline or add classes
        }
        if (lowerUrl.includes('udemy') || lowerUrl.includes('coursera') || lowerUrl.includes('pluralsight')) {
            return { text: 'Course', icon: '🎓', class: 'badge-course' };
        }
        if (lowerUrl.includes('medium') || lowerUrl.includes('dev.to') || lowerUrl.includes('blog')) {
            return { text: 'Article', icon: '📄', class: 'badge-article' };
        }
        if (lowerUrl.includes('docs') || lowerUrl.includes('documentation') || lowerUrl.includes('guide')) {
             return { text: 'Docs', icon: '📖', class: 'badge-docs' };
        }
        if (lowerUrl.includes('.pdf')) {
             return { text: 'Document', icon: '📑', class: 'badge-doc' };
        }
        
        return { text: 'Resource', icon: '🔗', class: 'badge-generic' };
    }

    _renderTimelineItems(goal) {
        // Collect all events with dates
        const events = [
            { type: 'created', date: goal.createdAt, title: 'Goal Created' },
            ...goal.milestones.map(m => ({ type: 'milestone', date: m.isCompleted ? m.completedAt : null, title: `Milestone: ${m.title}`, status: m.isCompleted })),
            ...goal.notes.map(n => ({ type: 'note', date: n.createdAt, title: 'Note Added', content: n.content })),
            ...goal.logs.map(l => ({ type: 'log', date: l.createdAt, title: l.type === 'failure' ? 'Setback' : 'Log', content: l.reason }))
        ].filter(e => e.date); // Only show items with dates (completed milestones etc)

        events.sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first

        return events.map(e => `
            <div class="timeline-item" style="position: relative; padding-left: 1.5rem; margin-bottom: 1.5rem;">
                <div style="position: absolute; left: -5px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--primary);"></div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${new Date(e.date).toLocaleDateString()} ${new Date(e.date).toLocaleTimeString()}</div>
                <div style="font-weight: 600;">${e.title}</div>
                ${e.content ? `<div style="font-size: 0.9rem; margin-top: 0.2rem;">${e.content}</div>` : ''}
            </div>
        `).join('') || '<p style="color:var(--text-muted)">Journey just started.</p>';
    }

    _createGoalCard(goal) {
        // Simple progress calculation
        const progress = goal.progress;
        
        return `
            <div class="goal-card" onclick="app.handlers.viewGoal('${goal.id}')">
                <div class="goal-card-marker"></div>
                
                <div style="margin-bottom: 1rem;">
                    <h3 class="goal-card-title">${goal.title}</h3>
                </div>
                
                <p class="goal-card-desc">${goal.description || 'No description'}</p>
                
                <div class="progress-container">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.5rem; color: var(--text-muted);">
                        <span>Progress</span>
                        <span>${progress}%</span>
                    </div>
                    </div>
                </div>
            `;
    }

    renderAddNoteModal(goalId) {
        const content = `
            <div style="background: var(--bg-card); padding: 2rem; border-radius: var(--radius-md);">
                <h3 style="margin-bottom: 1rem;">Add Note with Attachment</h3>
                <form id="add-note-form" onsubmit="event.preventDefault(); app.handlers.saveNote('${goalId}', this)">
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select class="form-input" name="type">
                            <option value="Reflection">Reflection 💭</option>
                            <option value="Idea">Idea 💡</option>
                            <option value="Problem">Problem ⚠️</option>
                            <option value="Lesson Learned">Lesson Learned 🎓</option>
                        </select>
                    </div>
                     <div class="form-group">
                        <label class="form-label">Impact on Goal</label>
                        <select class="form-input" name="impact">
                            <option value="Neutral">Neutral ➖</option>
                            <option value="Positive">Positive 🟢</option>
                            <option value="Negative">Negative 🔴</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Note Content</label>
                        <textarea class="form-textarea" name="content" rows="4" required placeholder="Write your thoughts..."></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Attachments (PDF, Word, PPT, TXT)</label>
                        <input type="file" class="form-input" name="file" multiple accept=".pdf,application/pdf,.doc,application/msword,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.ppt,application/vnd.ms-powerpoint,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation,.txt,text/plain" onchange="app.handlers.onFileSelect(this)">
                        <small style="color: var(--text-muted); display: block; margin-top: 0.5rem;">Supported formats: PDF, Word, PowerPoint, Text</small>
                        <div id="file-feedback" style="margin-top: 1rem; font-size: 0.9rem;"></div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                        <button type="button" class="btn btn-secondary" onclick="app.ui.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="btn-save-note">Save Note</button>
                    </div>
                </form>
            </div>
        `;
        this.openModal(content);
    }

    renderCompletionReflectionModal(goalId) {
        const content = `
            <div style="background: var(--bg-card); padding: 2rem; border-radius: var(--radius-md); max-width: 600px; margin: 0 auto;">
                <h3 style="margin-bottom: 1rem;">🎉 Goal Completed!</h3>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Take a moment to reflect on your journey.</p>
                
                <form onsubmit="event.preventDefault(); app.handlers.saveCompletionReflection('${goalId}', this);">
                    <div class="form-group">
                        <label class="form-label">What worked well?</label>
                        <textarea class="form-textarea" name="worked" rows="3" required placeholder="Strategies, habits, or tools that helped..."></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">What did not work?</label>
                        <textarea class="form-textarea" name="didntWork" rows="3" required placeholder="Obstacles, distractions, or mistakes..."></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">What would you do differently next time?</label>
                        <textarea class="form-textarea" name="differently" rows="3" required placeholder="Improvements for future goals..."></textarea>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                        <button type="button" class="btn btn-secondary" onclick="app.ui.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Complete Goal</button>
                    </div>
                </form>
            </div>
        `;
        this.openModal(content);
    }

    // --- Modal Logic ---

    openModal(contentHTML) {
        this.modalContainer.innerHTML = `
            <div class="modal-content" onclick="event.stopPropagation()">
                ${contentHTML}
            </div>
        `;
        this.modalContainer.classList.remove('hidden');
        this.modalContainer.onclick = () => this.closeModal();
    }

    closeModal() {
        this.modalContainer.classList.add('hidden');
        this.modalContainer.innerHTML = '';
    }
}

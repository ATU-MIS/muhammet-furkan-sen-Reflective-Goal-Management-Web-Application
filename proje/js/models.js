/**
 * Data Models for My Goal Journey
 */

class User {
    constructor(name, bio = '', avatar = '') {
        this.id = 'user_' + Date.now();
        this.name = name;
        this.bio = bio;
        this.avatar = avatar; // URL or base64 placeholder
        this.joinedAt = new Date().toISOString();
    }
}

class Goal {
    constructor(userId, title, description, deadline, estimatedHours) {
        this.id = 'goal_' + Date.now() + Math.random().toString(36).substr(2, 9);
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.deadline = deadline; // ISO string
        this.createdAt = new Date().toISOString();
        this.estimatedHours = parseFloat(estimatedHours) || 0;
        this.actualHours = 0;
        this.status = 'active'; // active, completed, failed
        this.completionReflection = null; // { worked, didntWork, differently }
        this.milestones = [];
        this.notes = [];
        this.logs = [];
        this.comments = [];
        this.tags = [];
    }

    addComment(userName, content) {
        const comment = new Comment(this.id, userName, content);
        this.comments.push(comment);
        return comment;
    }

    addMilestone(title, description, externalLink) {
        const milestone = new Milestone(this.id, title, description, externalLink);
        this.milestones.push(milestone);
        return milestone;
    }

    toggleMilestone(milestoneId) {
        const ms = this.milestones.find(m => m.id === milestoneId);
        if (ms) {
            ms.isCompleted = !ms.isCompleted;
            ms.completedAt = ms.isCompleted ? new Date().toISOString() : null;
        }
    }

    addNote(content, attachments = [], type = 'Reflection', impact = 'Neutral') {
        const note = new Note(this.id, content, attachments, type, impact);
        this.notes.push(note);
        return note;
    }

    // New method for completion
    markAsCompleted(reflection) {
        this.status = 'completed';
        this.completedAt = new Date().toISOString();
        this.completionReflection = reflection; // { worked, didntWork, differently }
    }

    logFailure(reason) {
        const log = new Log(this.id, 'failure', reason);
        this.logs.push(log);
        return log;
    }
    
    get progress() {
        if (this.milestones.length === 0) return 0;
        const completed = this.milestones.filter(m => m.isCompleted).length;
        return Math.round((completed / this.milestones.length) * 100);
    }

    get health() {
        const est = this.estimatedHours || 1;
        const act = this.actualHours || 0;
        const ratio = act / est;

        // Check for recent failures (last log is a failure)
        const lastLog = this.logs.length > 0 ? this.logs[this.logs.length - 1] : null;
        if (lastLog && lastLog.type === 'failure') return { status: 'Off Track', color: 'var(--danger)', icon: '🚑' };

        if (ratio > 1) return { status: 'Off Track', color: 'var(--danger)', icon: '🚑' };
        if (ratio > 0.8) return { status: 'At Risk', color: 'var(--warning)', icon: '⚠️' };
        return { status: 'Healthy', color: 'var(--success)', icon: '💚' };
    }
}

class Milestone {
    constructor(goalId, title, description = '', externalLink = '') {
        this.id = 'ms_' + Date.now() + Math.random().toString(36).substr(2, 9);
        this.goalId = goalId;
        this.title = title;
        this.description = description;
        this.externalLink = externalLink;
        this.isCompleted = false;
        this.completedAt = null;
    }
}

class Note {
    constructor(goalId, content, attachments = [], type = 'Reflection', impact = 'Neutral') {
        this.id = 'note_' + Date.now() + Math.random().toString(36).substr(2, 9);
        this.goalId = goalId;
        this.content = content;
        this.attachments = attachments; // Array of file metadata
        this.type = type;
        this.impact = impact; // Positive, Neutral, Negative
        this.createdAt = new Date().toISOString();
    }
}

class Log {
    constructor(goalId, type, reason) {
        this.id = 'log_' + Date.now() + Math.random().toString(36).substr(2, 9);
        this.goalId = goalId;
        this.type = type; // 'failure', 'success', 'info'
        this.reason = reason;
        this.createdAt = new Date().toISOString();
    }
}

class Comment {
    constructor(goalId, userName, content) {
        this.id = 'com_' + Date.now() + Math.random().toString(36).substr(2, 9);
        this.goalId = goalId;
        this.userName = userName; // Simulating other users
        this.content = content;
        this.createdAt = new Date().toISOString();
    }
}

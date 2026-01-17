/**
 * Storage Service Wrapper for localStorage
 */

class GoalJourneyStorage {
    constructor() {
        this.USER_KEY = 'gj_user';
        this.GOALS_KEY = 'gj_goals';
    }

    // User Operations (Session-based)
    saveUser(user) {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    getUser() {
        const data = sessionStorage.getItem(this.USER_KEY);
        return data ? JSON.parse(data) : null;
    }

    clearUser() {
        sessionStorage.removeItem(this.USER_KEY);
    }

    // Goal Operations
    saveGoals(goals) {
        localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
    }

    getGoals() {
        const data = localStorage.getItem(this.GOALS_KEY);
        if (!data) return [];
        
        // Re-hydrate objects to attach methods if needed,
        // (For simplicity in this project, we might just work with POJOs and helper functions 
        // or re-instantiate classes. Let's re-instantiate for clean OOP usage.)
        const parsed = JSON.parse(data);
        return parsed.map(g => {
            const goal = Object.assign(new Goal(), g);
            // Re-assign nested arrays if needed
            return goal;
        });
    }

    addGoal(goal) {
        const goals = this.getGoals();
        goals.push(goal);
        this.saveGoals(goals);
    }

    updateGoal(updatedGoal) {
        const goals = this.getGoals();
        const index = goals.findIndex(g => g.id === updatedGoal.id);
        if (index !== -1) {
            goals[index] = updatedGoal;
            this.saveGoals(goals);
        }
    }

    deleteGoal(goalId) {
        const goals = this.getGoals();
        const filtered = goals.filter(g => g.id !== goalId);
        this.saveGoals(filtered);
    }
    
    // Debug/Reset
    clearAll() {
        localStorage.clear();
        sessionStorage.clear();
    }
}

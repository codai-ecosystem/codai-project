// Behavioral Monitoring System
import EventEmitter from 'events';

class BehavioralMonitor extends EventEmitter {
  constructor() {
    super();
    this.userProfiles = new Map();
    this.anomalyThresholds = {
      loginFrequency: 10,
      locationChange: 3,
      deviceChange: 2,
      failedAttempts: 5
    };
  }
  
  trackBehavior(userId, activity) {
    const profile = this.getUserProfile(userId);
    profile.activities.push({
      ...activity,
      timestamp: new Date()
    });
    
    this.analyzeAnomaly(userId, activity, profile);
  }
  
  getUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        baseline: {},
        activities: [],
        riskScore: 0,
        lastAnalysis: new Date()
      });
    }
    return this.userProfiles.get(userId);
  }
  
  analyzeAnomaly(userId, activity, profile) {
    let riskIncrease = 0;
    
    // Analyze behavior patterns
    const recentLogins = this.getRecentActivities(profile, 'login', 3600000);
    if (recentLogins.length > this.anomalyThresholds.loginFrequency) {
      riskIncrease += 20;
      this.emit('anomaly', { type: 'high-login-frequency', userId, count: recentLogins.length });
    }
    
    profile.riskScore = Math.min(100, profile.riskScore + riskIncrease);
    
    if (profile.riskScore > 70) {
      this.emit('high-risk', { userId, riskScore: profile.riskScore });
    }
  }
  
  getRecentActivities(profile, type, timeWindow) {
    const cutoff = new Date(Date.now() - timeWindow);
    return profile.activities.filter(activity => 
      activity.type === type && activity.timestamp > cutoff
    );
  }
}

export default BehavioralMonitor;

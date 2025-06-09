import React, { useState, useEffect } from 'react';
import './NotificationSettings.css';
import { useAuth } from './AuthContext';

interface NotificationSettingsProps {
  onBack: () => void;
  onSave: (settings: NotificationPreferences) => void;
}

export interface NotificationPreferences {
  practiceReminders: boolean;
  reminderTime: string;
  reminderDays: string[];
  streakAlerts: boolean;
  progressSummaries: boolean;
  progressFrequency: string;
  appUpdates: boolean;
  emailNotifications: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onBack, onSave }) => {
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    practiceReminders: true,
    reminderTime: '08:00',
    reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    streakAlerts: true,
    progressSummaries: true,
    progressFrequency: 'weekly',
    appUpdates: true,
    emailNotifications: false
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // Load user notification preferences on component mount
  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For now, we'll use mock data
    
    // Simulate API delay
    const timer = setTimeout(() => {
      // Mock notification preferences
      const mockPreferences: NotificationPreferences = {
        practiceReminders: true,
        reminderTime: '08:00',
        reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        streakAlerts: true,
        progressSummaries: true,
        progressFrequency: 'weekly',
        appUpdates: true,
        emailNotifications: false
      };
      
      setPreferences(mockPreferences);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    // In a real app, this would be an API call
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Call the save function passed from parent
    onSave(preferences);
    
    setIsSaving(false);
    setSaveSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  // Handle toggle changes
  const handleToggleChange = (field: keyof NotificationPreferences) => {
    setPreferences({
      ...preferences,
      [field]: !preferences[field]
    });
  };
  
  // Handle text input changes
  const handleInputChange = (field: keyof NotificationPreferences, value: string) => {
    setPreferences({
      ...preferences,
      [field]: value
    });
  };
  
  // Handle day selection
  const handleDayToggle = (day: string) => {
    if (preferences.reminderDays.includes(day)) {
      setPreferences({
        ...preferences,
        reminderDays: preferences.reminderDays.filter(d => d !== day)
      });
    } else {
      setPreferences({
        ...preferences,
        reminderDays: [...preferences.reminderDays, day]
      });
    }
  };
  
  // Get day label
  const getDayLabel = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1, 3);
  };
  
  return (
    <div className="notification-settings">
      <header className="settings-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>Notification Settings</h1>
      </header>
      
      <main className="settings-content">
        {saveSuccess && (
          <div className="save-success-message">
            Notification settings saved successfully!
          </div>
        )}
        
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="settings-section">
            <h2>Practice Reminders</h2>
            
            <div className="setting-item">
              <div className="setting-toggle">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={preferences.practiceReminders} 
                    onChange={() => handleToggleChange('practiceReminders')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="setting-label">Daily Practice Reminders</div>
              </div>
              <div className="setting-description">
                Receive reminders to practice at your scheduled time
              </div>
              
              {preferences.practiceReminders && (
                <div className="setting-details">
                  <div className="time-selector">
                    <label htmlFor="reminderTime">Reminder Time</label>
                    <input 
                      type="time" 
                      id="reminderTime" 
                      value={preferences.reminderTime} 
                      onChange={(e) => handleInputChange('reminderTime', e.target.value)}
                    />
                  </div>
                  
                  <div className="days-selector">
                    <label>Reminder Days</label>
                    <div className="days-buttons">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <button
                          key={day}
                          type="button"
                          className={`day-button ${preferences.reminderDays.includes(day) ? 'selected' : ''}`}
                          onClick={() => handleDayToggle(day)}
                        >
                          {getDayLabel(day)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="setting-item">
              <div className="setting-toggle">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={preferences.streakAlerts} 
                    onChange={() => handleToggleChange('streakAlerts')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="setting-label">Streak Alerts</div>
              </div>
              <div className="setting-description">
                Get notified about your practice streak milestones and when you're at risk of breaking a streak
              </div>
            </div>
          </div>
          
          <div className="settings-section">
            <h2>Progress Updates</h2>
            
            <div className="setting-item">
              <div className="setting-toggle">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={preferences.progressSummaries} 
                    onChange={() => handleToggleChange('progressSummaries')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="setting-label">Progress Summaries</div>
              </div>
              <div className="setting-description">
                Receive regular summaries of your practice progress and insights
              </div>
              
              {preferences.progressSummaries && (
                <div className="setting-details">
                  <div className="frequency-selector">
                    <label htmlFor="progressFrequency">Summary Frequency</label>
                    <select 
                      id="progressFrequency" 
                      value={preferences.progressFrequency}
                      onChange={(e) => handleInputChange('progressFrequency', e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="settings-section">
            <h2>Other Notifications</h2>
            
            <div className="setting-item">
              <div className="setting-toggle">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={preferences.appUpdates} 
                    onChange={() => handleToggleChange('appUpdates')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="setting-label">App Updates</div>
              </div>
              <div className="setting-description">
                Get notified about new features, content, and app updates
              </div>
            </div>
            
            <div className="setting-item">
              <div className="setting-toggle">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={preferences.emailNotifications} 
                    onChange={() => handleToggleChange('emailNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="setting-label">Email Notifications</div>
              </div>
              <div className="setting-description">
                Receive notifications via email in addition to in-app notifications
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NotificationSettings;

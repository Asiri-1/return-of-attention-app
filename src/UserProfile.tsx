import React, { useState, useEffect } from 'react';
import './UserProfile.css';
import { useAuth } from './AuthContext';

interface UserProfileProps {
  onBack: () => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onBack, onLogout }) => {
  const { currentUser, updateUser } = useAuth();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('beginner');
  const [practiceGoals, setPracticeGoals] = useState<string[]>([]);
  const [practiceTime, setPracticeTime] = useState<number>(10);
  const [frequency, setFrequency] = useState<string>('daily');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // Load user data on component mount
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setExperienceLevel(currentUser.experienceLevel || 'beginner');
      setPracticeGoals(currentUser.goals || []);
      setPracticeTime(currentUser.practiceTime || 10);
      setFrequency(currentUser.frequency || 'daily');
      // In a real app, we would load the profile image from a server
      setProfileImage(null);
    }
  }, [currentUser]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    // Prepare updated user data
    const updatedUserData = {
      name,
      experienceLevel,
      goals: practiceGoals,
      practiceTime,
      frequency
    };
    
    // Call the updateUser function from AuthContext
    updateUser(updatedUserData);
    
    setIsSaving(false);
    setSaveSuccess(true);
    setIsEditing(false);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  // Handle practice goals selection
  const handleGoalToggle = (goal: string) => {
    if (practiceGoals.includes(goal)) {
      setPracticeGoals(practiceGoals.filter(g => g !== goal));
    } else {
      setPracticeGoals([...practiceGoals, goal]);
    }
  };
  
  // Get stage name based on experience level
  const getStageName = (level: string): string => {
    switch (level) {
      case 'beginner':
        return 'Stage 1: Physical Readiness (Seeker)';
      case 'intermediate':
        return 'Stage 2: Basic Thought Analysis (Beginner)';
      case 'advanced':
        return 'Stage 3: Advanced Practice (Practitioner)';
      case 'master':
        return 'Stage 4: Device-Free Practice (Master)';
      case 'guide':
        return 'Stage 5: Transcendence (Guide)';
      default:
        return 'Unknown Stage';
    }
  };
  
  // Render view mode (non-editing)
  const renderViewMode = () => (
    <div className="profile-view-mode">
      <div className="profile-header">
        <div className="profile-image-container">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-image-placeholder">
              {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
        </div>
        
        <div className="profile-name-container">
          <h2 className="profile-name">{name || 'Anonymous Practitioner'}</h2>
          <div className="profile-stage">{getStageName(experienceLevel)}</div>
        </div>
        
        <button 
          className="edit-profile-button"
          onClick={() => setIsEditing(true)}
        >
          Edit Profile
        </button>
      </div>
      
      <div className="profile-details">
        <div className="detail-section">
          <h3>Contact Information</h3>
          <div className="detail-item">
            <div className="detail-label">Email</div>
            <div className="detail-value">{email}</div>
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Practice Preferences</h3>
          <div className="detail-item">
            <div className="detail-label">Experience Level</div>
            <div className="detail-value">{experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}</div>
          </div>
          
          <div className="detail-item">
            <div className="detail-label">Practice Duration</div>
            <div className="detail-value">{practiceTime} minutes</div>
          </div>
          
          <div className="detail-item">
            <div className="detail-label">Practice Frequency</div>
            <div className="detail-value">{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</div>
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Practice Goals</h3>
          <div className="goals-container">
            {practiceGoals.length > 0 ? (
              practiceGoals.map(goal => (
                <div key={goal} className="goal-tag">
                  {goal}
                </div>
              ))
            ) : (
              <div className="no-goals">No goals selected</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="logout-section">
        <button className="logout-button" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
  
  // Render edit mode
  const renderEditMode = () => (
    <form className="profile-edit-mode" onSubmit={handleSubmit}>
      <div className="profile-header">
        <div className="profile-image-container">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-image-placeholder">
              {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          
          <button type="button" className="change-image-button">
            Change
          </button>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Personal Information</h3>
        
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Your name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Your email"
            disabled
          />
          <div className="input-hint">Email cannot be changed</div>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Practice Preferences</h3>
        
        <div className="form-group">
          <label htmlFor="experienceLevel">Experience Level</label>
          <select 
            id="experienceLevel" 
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="master">Master</option>
            <option value="guide">Guide</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="practiceTime">Default Practice Duration (minutes)</label>
          <input 
            type="number" 
            id="practiceTime" 
            value={practiceTime} 
            onChange={(e) => setPracticeTime(parseInt(e.target.value))} 
            min="5"
            max="120"
            step="5"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="frequency">Practice Frequency</label>
          <select 
            id="frequency" 
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="several-times-week">Several times a week</option>
            <option value="weekly">Weekly</option>
            <option value="occasional">Occasional</option>
          </select>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Practice Goals</h3>
        <div className="goals-selection">
          <div 
            className={`goal-option ${practiceGoals.includes('stress') ? 'selected' : ''}`}
            onClick={() => handleGoalToggle('stress')}
          >
            Reduce Stress
          </div>
          <div 
            className={`goal-option ${practiceGoals.includes('focus') ? 'selected' : ''}`}
            onClick={() => handleGoalToggle('focus')}
          >
            Improve Focus
          </div>
          <div 
            className={`goal-option ${practiceGoals.includes('sleep') ? 'selected' : ''}`}
            onClick={() => handleGoalToggle('sleep')}
          >
            Better Sleep
          </div>
          <div 
            className={`goal-option ${practiceGoals.includes('anxiety') ? 'selected' : ''}`}
            onClick={() => handleGoalToggle('anxiety')}
          >
            Manage Anxiety
          </div>
          <div 
            className={`goal-option ${practiceGoals.includes('presence') ? 'selected' : ''}`}
            onClick={() => handleGoalToggle('presence')}
          >
            Increase Presence
          </div>
          <div 
            className={`goal-option ${practiceGoals.includes('spiritual') ? 'selected' : ''}`}
            onClick={() => handleGoalToggle('spiritual')}
          >
            Spiritual Growth
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          type="button" 
          className="cancel-button"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="save-button"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
  
  return (
    <div className="user-profile">
      <header className="profile-header-bar">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>Your Profile</h1>
      </header>
      
      <main className="profile-content">
        {saveSuccess && (
          <div className="save-success-message">
            Profile updated successfully!
          </div>
        )}
        
        {isEditing ? renderEditMode() : renderViewMode()}
      </main>
    </div>
  );
};

export default UserProfile;

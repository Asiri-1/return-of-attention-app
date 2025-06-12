import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './UserProfile.css';

interface UserProfileProps {
  onBack: () => void; // Added this prop
  onLogout: () => void; // Added this prop
}

const UserProfile: React.FC<UserProfileProps> = ({ onBack, onLogout }) => { // Added props to destructuring
  const { currentUser } = useAuth();
  const [expandedSections, setExpandedSections] = useState<{
    questionnaire: boolean;
    selfAssessment: boolean;
  }>({
    questionnaire: false,
    selfAssessment: false
  });

  const toggleSection = (section: 'questionnaire' | 'selfAssessment') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!currentUser) {
    return (
      <div className="user-profile-container">
        <div className="user-profile-card">
          <h2>User Profile</h2>
          <p>No user data available. Please sign in.</p>
        </div>
      </div>
    );
  }

  const formatGoals = (goals: string[]) => {
    return goals.map(goal => goal.replace('-', ' ')).join(', ');
  };

  // Improved questionnaire formatting with user-friendly labels
  const formatQuestionnaireAnswers = (answers: any) => {
    if (!answers || Object.keys(answers).length === 0) {
      return <div className="no-data">No questionnaire data available</div>;
    }

    // Map of field names to user-friendly labels
    const fieldLabels: { [key: string]: string } = {
      'Q0_age': 'Age',
      'Q0_gender': 'Gender',
      'Q0_nationality': 'Nationality',
      'Q0_country_residence': 'Country of Residence',
      'Q0_marital_status': 'Marital Status',
      'Q0_children': 'Children',
      'Q0_occupation': 'Occupation',
      'Q0_work_stress': 'Work Stress Level',
      'Q0_income_comfort': 'Income Comfort',
      'Q0_living_situation': 'Living Situation',
      'Q0_health_status': 'Health Status',
      'Q0_sleep_quality': 'Sleep Quality',
      'Q0_daily_challenges': 'Daily Challenges',
      'Q1_motivation': 'Motivation',
      'Q2_experience_level': 'Experience Level',
      'Q3_time_commitment': 'Time Commitment',
      'Q4_learning_style': 'Learning Style',
      'Q5_motivation_patterns': 'Motivation Patterns',
      'Q6_coping_mechanisms': 'Coping Mechanisms',
      'Q7_lasting_happiness_definition': 'Definition of Lasting Happiness'
    };
    
    return Object.entries(answers).map(([key, value]) => {
      const label = fieldLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      let displayValue = String(value);
      
      // Clean up common values
      if (displayValue.includes('[object Object]')) {
        displayValue = 'Complex response data';
      }
      
      return (
        <div key={key} className="detail-item">
          <strong>{label}:</strong>
          <span>{displayValue}</span>
        </div>
      );
    });
  };

  // Improved self-assessment formatting
  const formatSelfAssessmentData = (data: any) => {
    if (!data || Object.keys(data).length === 0) {
      return <div className="no-data">No self-assessment data available</div>;
    }
    
    return Object.entries(data).map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      let displayValue = String(value);
      
      // Clean up common values
      if (displayValue.includes('[object Object]')) {
        displayValue = 'Assessment response recorded';
      }
      
      return (
        <div key={key} className="detail-item">
          <strong>{label}:</strong>
          <span>{displayValue}</span>
        </div>
      );
    });
  };

  return (
    <div className="user-profile-container">
      <div className="user-profile-card">
        <div className="profile-header">
          <h1>User Profile</h1>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>

        <div className="profile-content">
          {/* Basic Information Section */}
          <div className="profile-section">
            <h2>Basic Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{currentUser.name}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{currentUser.email}</span>
              </div>
              <div className="info-item">
                <label>Experience Level:</label>
                <span>{currentUser.experienceLevel}</span>
              </div>
            </div>
          </div>

          {/* Practice Preferences Section */}
          <div className="profile-section">
            <h2>Practice Preferences</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Goals:</label>
                <span>{formatGoals(currentUser.goals)}</span>
              </div>
              <div className="info-item">
                <label>Practice Time:</label>
                <span>{currentUser.practiceTime} minutes</span>
              </div>
              <div className="info-item">
                <label>Frequency:</label>
                <span>{currentUser.frequency}</span>
              </div>
            </div>
          </div>

          {/* Questionnaire Section - Collapsible */}
          <div className="profile-section">
            <div className="section-header-collapsible">
              <h2>Questionnaire</h2>
              <div className="completion-status">
                <span className={currentUser.questionnaireCompleted ? 'completed' : 'pending'}>
                  {currentUser.questionnaireCompleted ? 'Completed' : 'Not Completed'}
                </span>
              </div>
              {currentUser.questionnaireCompleted && (
                <button 
                  className="toggle-button"
                  onClick={() => toggleSection('questionnaire')}
                  aria-expanded={expandedSections.questionnaire}
                >
                  {expandedSections.questionnaire ? '▼' : '▶'} View Details
                </button>
              )}
            </div>
            
            {currentUser.questionnaireCompleted && expandedSections.questionnaire && (
              <div className="collapsible-content">
                <div className="details-container">
                  {formatQuestionnaireAnswers(currentUser.questionnaireAnswers)}
                </div>
              </div>
            )}
          </div>

          {/* Self Assessment Section - Collapsible */}
          <div className="profile-section">
            <div className="section-header-collapsible">
              <h2>Self Assessment</h2>
              <div className="completion-status">
                <span className={currentUser.assessmentCompleted ? 'completed' : 'pending'}>
                  {currentUser.assessmentCompleted ? 'Completed' : 'Not Completed'}
                </span>
              </div>
              {currentUser.assessmentCompleted && (
                <button 
                  className="toggle-button"
                  onClick={() => toggleSection('selfAssessment')}
                  aria-expanded={expandedSections.selfAssessment}
                >
                  {expandedSections.selfAssessment ? '▼' : '▶'} View Details
                </button>
              )}
            </div>
            
            {currentUser.assessmentCompleted && expandedSections.selfAssessment && (
              <div className="collapsible-content">
                <div className="details-container">
                  {formatSelfAssessmentData(currentUser.selfAssessmentData)}
                </div>
              </div>
            )}
          </div>

          {/* Account Status Section */}
          <div className="profile-section">
            <h2>Account Status</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Account Type:</label>
                <span>Standard User</span>
              </div>
              <div className="info-item">
                <label>Member Since:</label>
                <span>{new Date(parseInt(currentUser.id.split('-')[1])).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Back button */}
          <button onClick={onBack} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

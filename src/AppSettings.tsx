// AppSettings.tsx
import React, { useState } from 'react';
import './AppSettings.css';

interface AppSettingsProps {
  onBack: () => void;
  onSave: (settings: any) => void;
}

const AppSettings: React.FC<AppSettingsProps> = ({ onBack, onSave }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoStartTimer, setAutoStartTimer] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('en');
  
  // Handle save
  const handleSave = () => {
    const settings = {
      darkMode,
      soundEnabled,
      autoStartTimer,
      language
    };
    
    onSave(settings);
  };
  
  return (
    <div className="app-settings">
      <header className="settings-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>App Settings</h1>
      </header>
      
      <div className="settings-content">
        <div className="settings-section">
          <h2>Display</h2>
          
          <div className="setting-item">
            <div className="setting-label">Dark Mode</div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>Sound</h2>
          
          <div className="setting-item">
            <div className="setting-label">Sound Effects</div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={() => setSoundEnabled(!soundEnabled)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>Practice</h2>
          
          <div className="setting-item">
            <div className="setting-label">Auto-start Timer</div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={autoStartTimer}
                  onChange={() => setAutoStartTimer(!autoStartTimer)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>Language</h2>
          
          <div className="setting-item">
            <div className="setting-label">App Language</div>
            <div className="setting-control">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>
        
        <button 
          className="save-button"
          onClick={handleSave}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AppSettings;

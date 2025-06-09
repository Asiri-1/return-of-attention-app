import React, { useState } from 'react';
import DevPanel from './DevPanel';
import './DevPanel.css';

interface DevPanelToggleProps {}

const DevPanelToggle: React.FC<DevPanelToggleProps> = () => {
  const [showPanel, setShowPanel] = useState<boolean>(false);
  
  const togglePanel = () => {
    setShowPanel(!showPanel);
  };
  
  return (
    <>
      {showPanel && (
        <DevPanel onClose={() => setShowPanel(false)} />
      )}
      
      <button 
        className="dev-panel-toggle"
        onClick={togglePanel}
        title="Developer Tools"
      >
        {showPanel ? '×' : '⚙️'}
      </button>
    </>
  );
};

export default DevPanelToggle;

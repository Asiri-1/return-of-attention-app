import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfileProps {
  onBack: () => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onBack, onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('UserProfile component rendered!');
  }, []);

  return (
    <div style={{
      backgroundColor: '#FFEBEE', // Light Red background
      padding: '20px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#D32F2F' }}>User Profile Screen</h1>
      <p style={{ color: '#555' }}>This is the dedicated user profile page. If you see this, navigation worked!</p>
      <button onClick={onBack} style={{ margin: '10px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Back to Home
      </button>
      <button onClick={onLogout} style={{ margin: '10px', padding: '10px 20px', backgroundColor: '#F44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Logout (Test)
      </button>
    </div>
  );
};

export default UserProfile;



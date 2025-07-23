import React from 'react';
import { useAuth } from '../auth/AuthContext';

const LogoutWarning: React.FC = () => {
  const { showLogoutWarning, sessionTimeRemaining, extendSession, logout } = useAuth();

  if (!showLogoutWarning) return null;

  const minutes = Math.floor(sessionTimeRemaining / 60000);
  const seconds = Math.floor((sessionTimeRemaining % 60000) / 1000);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '40px',
        maxWidth: '450px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: '2px solid #ff6b6b'
      }}>
        {/* Warning Icon */}
        <div style={{
          fontSize: '60px',
          marginBottom: '20px',
          color: '#ff6b6b'
        }}>
          ⚠️
        </div>

        <h2 style={{
          color: '#333',
          marginBottom: '15px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Session Expiring Soon
        </h2>

        <p style={{
          color: '#666',
          marginBottom: '25px',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          For your security, you will be automatically logged out in:
        </p>

        {/* Countdown Timer */}
        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '10px',
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          letterSpacing: '2px'
        }}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '25px',
          fontSize: '14px',
          color: '#6c757d'
        }}>
          💡 <strong>Why this happens:</strong> Sessions expire after 6 hours of activity for security. 
          This protects your account if you forget to log out on a shared device.
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={extendSession}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(76, 175, 80, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🔄 Stay Logged In
          </button>

          <button
            onClick={logout}
            style={{
              background: 'linear-gradient(135deg, #6c757d, #5a6268)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(108, 117, 125, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🚪 Logout Now
          </button>
        </div>

        {/* Security Info */}
        <div style={{
          marginTop: '25px',
          padding: '15px',
          background: '#e3f2fd',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#1976d2'
        }}>
          🔒 <strong>Security Tips:</strong>
          <ul style={{ textAlign: 'left', margin: '10px 0 0 0', paddingLeft: '20px' }}>
            <li>Always log out on shared devices</li>
            <li>Don't check "Remember Me" on public computers</li>
            <li>Close browser tabs when done on mobile</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LogoutWarning;
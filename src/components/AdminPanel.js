import React, { useState, useEffect } from 'react';
import { auth } from '../utils/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

function AdminPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Direct Firebase auth listener - bypasses AuthContext completely
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 Direct Firebase Auth Check:', {
        user: user,
        email: user?.email,
        uid: user?.uid,
        timestamp: new Date().toISOString()
      });

      if (user && user.email) {
        setUserEmail(user.email);
        console.log('✅ Direct auth detected user:', user.email);
      } else {
        setUserEmail(null);
        console.log('❌ No user detected via direct auth');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const ADMIN_EMAIL = 'asiriamarasinghe35@gmail.com';
  const isAdmin = userEmail === ADMIN_EMAIL;

  console.log('🔧 Direct AdminPanel Check:', {
    userEmail,
    isAdmin,
    isLoading,
    adminEmail: ADMIN_EMAIL,
    timestamp: new Date().toISOString()
  });

  // Don't show anything while loading
  if (isLoading) {
    return null;
  }

  // Don't show anything for non-admin users
  if (!isAdmin) {
    return null;
  }

  // Only show admin panel for admin users
  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
      <div
        style={{
          background: 'rgba(0, 128, 0, 0.9)', color: 'white',
          padding: '12px 16px', borderRadius: '12px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>⚙️</span>
        <span>Admin</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div style={{
          background: 'rgba(0, 128, 0, 0.9)', color: 'white',
          padding: '20px', borderRadius: '12px', marginTop: '5px',
          minWidth: '300px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>📊 Admin Panel</h3>
          <p>✅ Admin access granted!</p>
          <p><strong>Email:</strong> {userEmail}</p>
          <p><strong>Method:</strong> Direct Firebase Auth</p>
          <button
            onClick={() => window.open('/analytics', '_blank')}
            style={{
              background: '#4ade80', color: 'black',
              border: 'none', padding: '10px 15px',
              borderRadius: '6px', cursor: 'pointer', marginTop: '10px',
              width: '100%'
            }}
          >
            📈 View Analytics
          </button>
          <button
            onClick={() => {
              console.log('Direct Firebase User:', auth.currentUser);
              console.log('Admin Status:', { userEmail, isAdmin });
              alert('Direct auth data logged to console');
            }}
            style={{
              background: '#60a5fa', color: 'white',
              border: 'none', padding: '10px 15px',
              borderRadius: '6px', cursor: 'pointer', marginTop: '10px',
              width: '100%'
            }}
          >
            🔍 Debug User Data
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;


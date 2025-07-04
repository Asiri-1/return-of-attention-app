import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { useAuth } from '../AuthContext';
import { useLocalData } from '../contexts/LocalDataContext';

function AdminPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    averageHappiness: 0,
    completedAssessments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { currentUser } = useAuth();
  const { getAllUsers, isLocalMode } = useLocalData();

  // Admin email for fallback checking
  const ADMIN_EMAIL = 'asiriamarasinghe35@gmail.com';

  // Enhanced admin detection with multiple fallbacks
  const isUserAdmin = React.useMemo(() => {
    console.log('🔍 AdminPanel: Checking admin status', {
      isAdmin,
      adminLoading,
      currentUserEmail: currentUser?.email,
      directEmailCheck: currentUser?.email === ADMIN_EMAIL,
      timestamp: new Date().toISOString()
    });

    // Primary check: AdminContext
    if (!adminLoading && isAdmin) {
      console.log('✅ AdminPanel: Admin confirmed via AdminContext');
      return true;
    }

    // Fallback check: Direct email comparison
    if (currentUser?.email === ADMIN_EMAIL) {
      console.log('✅ AdminPanel: Admin confirmed via direct email check');
      return true;
    }

    console.log('❌ AdminPanel: Admin status not confirmed');
    return false;
  }, [isAdmin, adminLoading, currentUser?.email]);

  // Load admin data
  useEffect(() => {
    if (!isUserAdmin) {
      setIsLoading(false);
      return;
    }

    const loadAdminData = async () => {
      try {
        console.log('📊 AdminPanel: Loading admin data...');
        setIsLoading(true);

        if (isLocalMode && getAllUsers) {
          const allUsers = getAllUsers();
          const userData = Object.values(allUsers).map((user) => {
            // Safe type conversion without TypeScript
            return {
              uid: String(user.uid || ''),
              email: String(user.email || ''),
              displayName: String(user.displayName || 'Unknown'),
              happiness_points: Number(user.happiness_points) || 0,
              user_level: String(user.user_level || 'Seeker'),
              questionnaireCompleted: Boolean(user.questionnaireCompleted),
              assessmentCompleted: Boolean(user.assessmentCompleted),
              lastLogin: String(user.lastLogin || new Date().toISOString()),
              joinDate: String(user.joinDate || new Date().toISOString()),
              questionnaireAnswers: user.questionnaireAnswers || {},
              selfAssessmentData: user.selfAssessmentData || {}
            };
          });

          setUsers(userData);

          // Calculate stats
          const totalUsers = userData.length;
          const activeUsers = userData.filter(user => {
            const lastLogin = new Date(user.lastLogin);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return lastLogin > weekAgo;
          }).length;

          const averageHappiness = totalUsers > 0 
            ? userData.reduce((sum, user) => sum + user.happiness_points, 0) / totalUsers 
            : 0;

          const completedAssessments = userData.filter(user => 
            user.questionnaireCompleted && user.assessmentCompleted
          ).length;

          setStats({
            totalUsers,
            activeUsers,
            averageHappiness: Math.round(averageHappiness),
            completedAssessments
          });

          console.log('✅ AdminPanel: Data loaded successfully', {
            totalUsers,
            activeUsers,
            averageHappiness,
            completedAssessments
          });
        }
      } catch (error) {
        console.error('❌ AdminPanel: Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [isUserAdmin, isLocalMode, getAllUsers]);

  // Don't render if not admin and not loading
  if (!adminLoading && !isUserAdmin) {
    // Show debug info if needed
    if (debugMode) {
      return (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#FFA500',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 1000,
          border: '2px solid #FF8C00'
        }}>
          ⚠️ Admin Debug
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            Current: {currentUser?.email || 'No user'}<br/>
            Admin Context: {String(isAdmin)}<br/>
            Loading: {String(adminLoading)}
          </div>
        </div>
      );
    }
    return null;
  }

  // Show loading state
  if (adminLoading || isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 1000
      }}>
        ⏳ Loading Admin...
      </div>
    );
  }

  // Render admin panel
  return (
    <>
      {/* Admin Toggle Button */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>⚙️</span>
          <span>Admin</span>
          <span style={{ 
            fontSize: '12px',
            opacity: 0.8,
            marginLeft: '4px'
          }}>
            ({stats.totalUsers} users)
          </span>
        </button>
      </div>

      {/* Admin Panel */}
      {isExpanded && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          width: '600px',
          maxHeight: '80vh',
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          zIndex: 999,
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>
              🛠️ Admin Dashboard
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setDebugMode(!debugMode)}
                style={{
                  background: debugMode ? '#FFA500' : 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {debugMode ? 'Debug ON' : 'Debug'}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '24px',
                  height: '24px'
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0'
          }}>
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'users', label: '👥 Users', icon: '👥' },
              { id: 'analytics', label: '📈 Analytics', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: 'none',
                  background: activeTab === tab.id ? '#f8fafc' : 'white',
                  color: activeTab === tab.id ? '#667eea' : '#4a5568',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid #667eea' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{
            padding: '20px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {activeTab === 'overview' && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    background: '#f8fafc',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                      {stats.totalUsers}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a5568' }}>Total Users</div>
                  </div>
                  <div style={{
                    background: '#f8fafc',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>
                      {stats.activeUsers}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a5568' }}>Active Users</div>
                  </div>
                  <div style={{
                    background: '#f8fafc',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B' }}>
                      {stats.averageHappiness}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a5568' }}>Avg Happiness</div>
                  </div>
                  <div style={{
                    background: '#f8fafc',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B5CF6' }}>
                      {stats.completedAssessments}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a5568' }}>Completed</div>
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <strong>System Status:</strong>
                  <div style={{ marginTop: '8px', lineHeight: '1.5' }}>
                    🟢 Database: {isLocalMode ? 'Local Storage' : 'Firebase'}<br/>
                    🟢 Authentication: Active<br/>
                    🟢 Admin Panel: Operational
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div style={{ marginBottom: '15px', fontSize: '14px', color: '#4a5568' }}>
                  <strong>{users.length} Registered Users</strong>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {users.map((user, index) => (
                    <div key={user.uid || index} style={{
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      fontSize: '14px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {user.displayName || 'Unknown User'}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        📧 {user.email}<br/>
                        🎯 {user.happiness_points} points ({user.user_level})<br/>
                        ✅ Q: {user.questionnaireCompleted ? 'Yes' : 'No'} | 
                        A: {user.assessmentCompleted ? 'Yes' : 'No'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <div style={{
                  background: '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                    📊 Happiness Distribution
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    {users.length > 0 ? (
                      <>
                        🟢 High (400+): {users.filter(u => u.happiness_points >= 400).length} users<br/>
                        🟡 Medium (100-399): {users.filter(u => u.happiness_points >= 100 && u.happiness_points < 400).length} users<br/>
                        🔴 Low (0-99): {users.filter(u => u.happiness_points < 100).length} users
                      </>
                    ) : (
                      'No user data available'
                    )}
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                    📈 Completion Rates
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    Questionnaire: {users.length > 0 ? Math.round((users.filter(u => u.questionnaireCompleted).length / users.length) * 100) : 0}%<br/>
                    Self-Assessment: {users.length > 0 ? Math.round((users.filter(u => u.assessmentCompleted).length / users.length) * 100) : 0}%<br/>
                    Both Complete: {users.length > 0 ? Math.round((stats.completedAssessments / users.length) * 100) : 0}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminPanel;
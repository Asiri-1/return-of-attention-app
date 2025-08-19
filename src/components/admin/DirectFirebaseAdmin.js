// ✅ COMPLETE DirectFirebaseAdmin - Real Firebase Data Dashboard
// File: src/components/admin/DirectFirebaseAdmin.js
// 🔥 FIREBASE-DIRECT: Reads actual Firestore data, not context state

import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, deleteDoc, writeBatch, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path to your firebase config
import { useAuth } from '../../contexts/auth/AuthContext';

const DirectFirebaseAdmin = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState({
    practiceSessions: 0,
    mindRecoverySessions: 0,
    userProgress: 0,
    users: 0,
    analytics: 0,
    loading: false,
    lastUpdated: null
  });
  const [clearing, setClearing] = useState(false);
  const [sessionDetails, setSessionDetails] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  // ✅ STEP 1: Direct Firestore Query Function
  const fetchRealFirebaseData = async () => {
    setData(prev => ({ ...prev, loading: true }));
    
    try {
      console.log('🔥 DIRECT: Querying real Firestore data...');
      
      // Query all your main collections
      const collections = [
        'practiceSessions',
        'mindRecoverySessions', 
        'userProgress',
        'users',
        'analytics',
        'questionnaires',
        'selfAssessments'
      ];
      
      const counts = {};
      const sampleData = {};
      
      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          counts[collectionName] = snapshot.size;
          
          // Get sample documents
          if (snapshot.size > 0) {
            sampleData[collectionName] = snapshot.docs.slice(0, 3).map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          }
          
          console.log(`📊 ${collectionName}: ${snapshot.size} documents`);
        } catch (error) {
          console.warn(`⚠️ Could not read ${collectionName}:`, error.message);
          counts[collectionName] = 0;
        }
      }
      
      // Get recent practice sessions for details
      try {
        const recentSessionsQuery = query(
          collection(db, 'practiceSessions'), 
          orderBy('createdAt', 'desc'), 
          limit(10)
        );
        const recentSnapshot = await getDocs(recentSessionsQuery);
        setSessionDetails(recentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.warn('Could not fetch recent sessions:', error);
        setSessionDetails([]);
      }
      
      setData({
        practiceSessions: counts.practiceSessions || 0,
        mindRecoverySessions: counts.mindRecoverySessions || 0,
        userProgress: counts.userProgress || 0,
        users: counts.users || 0,
        analytics: counts.analytics || 0,
        questionnaires: counts.questionnaires || 0,
        selfAssessments: counts.selfAssessments || 0,
        loading: false,
        lastUpdated: new Date().toISOString(),
        sampleData
      });
      
      const totalDocs = Object.values(counts).reduce((sum, count) => sum + count, 0);
      console.log(`✅ REAL FIREBASE DATA: ${totalDocs} total documents found`);
      
    } catch (error) {
      console.error('❌ Error fetching real Firebase data:', error);
      setData(prev => ({ ...prev, loading: false }));
      alert('Error connecting to Firebase: ' + error.message);
    }
  };

  // ✅ STEP 2: Proper Batch Deletion Function
  const clearAllFirebaseData = async () => {
    if (!window.confirm('⚠️ DANGER: This will permanently delete ALL Firebase data!\n\nThis includes:\n• All practice sessions\n• All mind recovery sessions\n• All user progress\n• All analytics data\n\nThis CANNOT be undone!\n\nType "DELETE" in the next prompt to confirm.')) {
      return;
    }
    
    const confirmText = prompt('Type "DELETE" to confirm permanent deletion of all Firebase data:');
    if (confirmText !== 'DELETE') {
      alert('Deletion cancelled - incorrect confirmation text');
      return;
    }
    
    setClearing(true);
    
    try {
      console.log('🗑️ DANGER: Starting complete Firebase data deletion...');
      
      const collections = [
        'practiceSessions',
        'mindRecoverySessions', 
        'userProgress',
        'analytics',
        'questionnaires',
        'selfAssessments'
      ];
      
      let totalDeleted = 0;
      
      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          
          if (snapshot.size > 0) {
            // Delete in batches (Firestore batch limit is 500)
            const batches = [];
            let currentBatch = writeBatch(db);
            let batchCount = 0;
            
            snapshot.forEach((doc) => {
              currentBatch.delete(doc.ref);
              batchCount++;
              totalDeleted++;
              
              if (batchCount === 500) {
                batches.push(currentBatch);
                currentBatch = writeBatch(db);
                batchCount = 0;
              }
            });
            
            // Add the last batch if it has documents
            if (batchCount > 0) {
              batches.push(currentBatch);
            }
            
            // Commit all batches
            for (const batch of batches) {
              await batch.commit();
            }
            
            console.log(`✅ Deleted ${snapshot.size} documents from ${collectionName}`);
          }
        } catch (error) {
          console.error(`❌ Error deleting from ${collectionName}:`, error);
        }
      }
      
      console.log(`🗑️ COMPLETE: Deleted ${totalDeleted} documents from Firebase`);
      alert(`✅ Firebase clearing complete!\n\n${totalDeleted} documents deleted from Firebase.\n\nRefreshing data to verify...`);
      
      // Refresh data to verify clearing worked
      await fetchRealFirebaseData();
      
    } catch (error) {
      console.error('❌ Error during Firebase clearing:', error);
      alert('❌ Error clearing Firebase data: ' + error.message);
    }
    
    setClearing(false);
  };

  // ✅ STEP 3: Clear specific collection
  const clearSpecificCollection = async (collectionName) => {
    if (!window.confirm(`Clear all documents from "${collectionName}" collection?`)) {
      return;
    }
    
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      
      if (snapshot.size === 0) {
        alert(`Collection "${collectionName}" is already empty`);
        return;
      }
      
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log(`✅ Cleared ${snapshot.size} documents from ${collectionName}`);
      alert(`✅ Cleared ${snapshot.size} documents from "${collectionName}"`);
      
      // Refresh data
      await fetchRealFirebaseData();
      
    } catch (error) {
      console.error(`❌ Error clearing ${collectionName}:`, error);
      alert(`❌ Error clearing ${collectionName}: ${error.message}`);
    }
  };

  // ✅ STEP 4: Load real data on component mount
  useEffect(() => {
    fetchRealFirebaseData();
  }, []);

  // ✅ STEP 5: Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchRealFirebaseData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>🔐 Authentication Required</h3>
        <p>Please sign in to access Firebase admin dashboard</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        border: '2px solid #f87171',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#dc2626',
          margin: '0 0 0.5rem 0'
        }}>
          🔥 Real Firebase Data Dashboard
        </h2>
        <p style={{
          color: '#991b1b',
          margin: '0 0 1rem 0'
        }}>
          Direct Firestore queries - shows actual database contents, not context state
        </p>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={fetchRealFirebaseData} 
            disabled={data.loading}
            style={{ 
              padding: '0.75rem 1rem', 
              backgroundColor: data.loading ? '#9ca3af' : '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.5rem',
              cursor: data.loading ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {data.loading ? '🔄 Loading...' : '🔄 Refresh Real Data'}
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {showDetails ? '📊 Hide Details' : '📊 Show Details'}
          </button>
          
          <button
            onClick={() => window.open('https://console.firebase.google.com/project/return-of-attention-app/firestore', '_blank')}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔥 Open Firebase Console
          </button>
        </div>

        {data.lastUpdated && (
          <p style={{
            fontSize: '0.75rem',
            color: '#dc2626',
            margin: '0.5rem 0 0 0'
          }}>
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      {/* Real Firebase Data Summary */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: '0 0 1rem 0'
        }}>
          📊 Current Firestore Data (Real-Time)
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {[
            { key: 'practiceSessions', label: '🧘 Practice Sessions', color: '#059669' },
            { key: 'mindRecoverySessions', label: '🌱 Mind Recovery Sessions', color: '#7c3aed' },
            { key: 'userProgress', label: '📈 User Progress', color: '#2563eb' },
            { key: 'users', label: '👥 Users', color: '#dc2626' },
            { key: 'analytics', label: '📊 Analytics', color: '#f59e0b' },
            { key: 'questionnaires', label: '📋 Questionnaires', color: '#ec4899' },
            { key: 'selfAssessments', label: '🔍 Self Assessments', color: '#06b6d4' }
          ].map(({ key, label, color }) => (
            <div key={key} style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: color,
                marginBottom: '0.25rem'
              }}>
                {data[key]}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#64748b'
              }}>
                {label}
              </div>
              <button
                onClick={() => clearSpecificCollection(key)}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                🗑️ Clear
              </button>
            </div>
          ))}
        </div>

        <div style={{
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '0.5rem',
          padding: '0.75rem'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#92400e',
            fontWeight: '600'
          }}>
            📊 Total Documents in Firebase: {
              data.practiceSessions + data.mindRecoverySessions + data.userProgress + 
              data.users + data.analytics + data.questionnaires + data.selfAssessments
            }
          </div>
        </div>
      </div>

      {/* Session Details */}
      {showDetails && sessionDetails.length > 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 1rem 0'
          }}>
            📋 Recent Practice Sessions
          </h3>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {sessionDetails.map((session, index) => (
              <div key={session.id} style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.25rem',
                padding: '0.75rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  Session {index + 1}: {session.id}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Created: {session.createdAt ? new Date(session.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}
                </div>
                {session.userId && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    User: {session.userId}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample Data Display */}
      {showDetails && data.sampleData && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 1rem 0'
          }}>
            🔍 Sample Data from Collections
          </h3>
          
          {Object.entries(data.sampleData).map(([collection, samples]) => (
            <div key={collection} style={{ marginBottom: '1rem' }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 0.5rem 0'
              }}>
                {collection} (showing {samples.length} of {data[collection]})
              </h4>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.25rem',
                padding: '0.5rem',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                <pre>{JSON.stringify(samples, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Danger Zone */}
      <div style={{
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        border: '2px solid #fecaca',
        borderRadius: '0.5rem',
        padding: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#991b1b',
          margin: '0 0 1rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⚠️ Danger Zone - Complete Firebase Deletion
        </h3>
        
        <div style={{
          background: 'white',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}>
          <h4 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#b91c1c',
            margin: '0 0 0.75rem 0'
          }}>
            🗑️ Clear ALL Firebase Data (Permanent Deletion)
          </h4>
          <p style={{
            color: '#374151',
            margin: '0 0 1rem 0'
          }}>
            This will permanently delete ALL documents from ALL Firebase collections:
          </p>
          
          <ul style={{
            color: '#374151',
            margin: '0 0 1rem 0',
            paddingLeft: '1.5rem'
          }}>
            <li><strong>🧘 Practice Sessions:</strong> All meditation and practice data</li>
            <li><strong>🌱 Mind Recovery:</strong> All recovery session data</li>
            <li><strong>📈 User Progress:</strong> All user advancement data</li>
            <li><strong>📊 Analytics:</strong> All usage and performance data</li>
            <li><strong>📋 Questionnaires & Assessments:</strong> All user responses</li>
          </ul>

          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#dc2626',
              fontWeight: '600'
            }}>
              ⚠️ WARNING: This action cannot be undone! All user data will be permanently lost!
            </div>
          </div>

          <button
            onClick={clearAllFirebaseData}
            disabled={clearing}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: '600',
              color: 'white',
              cursor: clearing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: clearing ? '#9ca3af' : '#dc2626',
              opacity: clearing ? 0.5 : 1
            }}
          >
            {clearing ? (
              <>
                <div style={{
                  height: '1rem',
                  width: '1rem',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Deleting Firebase Data...
              </>
            ) : (
              '🗑️ DELETE ALL FIREBASE DATA'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectFirebaseAdmin;
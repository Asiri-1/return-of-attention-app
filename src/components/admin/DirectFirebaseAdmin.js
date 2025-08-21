// ✅ CLEAN Admin Panel - Analytics Completely Removed
// File: src/components/admin/DirectFirebaseAdmin.js

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useWellness } from '../../contexts/wellness/WellnessContext';

const DirectFirebaseAdmin = () => {
  const { emotionalNotes, clearWellnessData } = useWellness();
  
  // ✅ REMOVED: analytics from stats
  const [stats, setStats] = useState({
    practiceSessions: 0,
    mindRecoverySessions: 0,
    dailyNotes: 0,
    userProgress: 0,
    users: 0,
    questionnaires: 0,
    selfAssessments: 0,
    total: 0
  });
  
  // ✅ REMOVED: analytics from recentData
  const [recentData, setRecentData] = useState({
    practiceSessions: [],
    mindRecoverySessions: [],
    dailyNotes: [],
    userProgress: [],
    users: [],
    questionnaires: [],
    selfAssessments: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    console.log('🔄 Loading Firebase data...');
    
    try {
      // ✅ CLEAN: Only real collections that exist
      const collections = [
        'practiceSessions',
        'mindRecoverySessions', 
        'userProgress',
        'users'
        // ✅ REMOVED: questionnaires, selfAssessments (don't exist)
      ];
      
      const results = {};
      let totalDocs = 0;
      
      for (const collectionName of collections) {
        try {
          const querySnapshot = await getDocs(collection(db, collectionName));
          const docs = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            docs.push({
              id: doc.id,
              ...data,
              timestamp: data.timestamp || data.createdAt || data.lastPractice || 'Unknown'
            });
          });
          
          results[collectionName] = docs;
          totalDocs += docs.length;
          console.log(`📊 ${collectionName}: ${docs.length} documents`);
        } catch (error) {
          console.error(`❌ Error loading ${collectionName}:`, error);
          results[collectionName] = [];
        }
      }
      
      // Use emotional notes from WellnessContext
      console.log('📝 Getting emotional notes from WellnessContext...');
      results.dailyNotes = emotionalNotes;
      totalDocs += emotionalNotes.length;
      
      // ✅ CLEAN: Only real collections in stats
      const newStats = {
        practiceSessions: results.practiceSessions?.length || 0,
        mindRecoverySessions: results.mindRecoverySessions?.length || 0,
        dailyNotes: results.dailyNotes?.length || 0,
        userProgress: results.userProgress?.length || 0,
        users: results.users?.length || 0,
        questionnaires: 0, // Placeholder - doesn't exist
        selfAssessments: 0, // Placeholder - doesn't exist
        total: totalDocs
      };
      
      // ✅ CLEAN: Only real collections in recent data
      const newRecentData = {
        practiceSessions: results.practiceSessions?.slice(-5) || [],
        mindRecoverySessions: results.mindRecoverySessions?.slice(-5) || [],
        dailyNotes: results.dailyNotes?.slice(-5) || [],
        userProgress: results.userProgress?.slice(-5) || [],
        users: results.users?.slice(-5) || [],
        questionnaires: [], // Placeholder - doesn't exist
        selfAssessments: [] // Placeholder - doesn't exist
      };
      
      setStats(newStats);
      setRecentData(newRecentData);
      
      console.log('✅ Firebase data loaded successfully:', newStats);
      
    } catch (error) {
      console.error('❌ Error loading Firebase data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearEmotionalNotes = async () => {
    try {
      setIsDeleting(true);
      
      if (!window.confirm('Are you sure you want to delete ALL emotional notes? This cannot be undone.')) {
        setIsDeleting(false);
        return;
      }
      
      if (clearWellnessData) {
        console.log('🗑️ Using WellnessContext clearWellnessData...');
        await clearWellnessData();
        console.log('✅ WellnessContext cleared successfully');
      } else {
        console.warn('⚠️ clearWellnessData function not available in WellnessContext');
        alert('Clear function not available. Check WellnessContext implementation.');
      }
      
      await loadData();
      alert('✅ Emotional notes cleared successfully!');
      
    } catch (error) {
      console.error('❌ Error clearing emotional notes:', error);
      alert(`❌ Error clearing emotional notes:\n\n${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearCollection = async (collectionName) => {
    if (collectionName === 'dailyNotes') {
      return await clearEmotionalNotes();
    }
    
    // ✅ BLOCK: Don't allow clearing non-existent collections
    if (collectionName === 'questionnaires' || collectionName === 'selfAssessments') {
      alert(`${collectionName} collection doesn't exist in Firebase - nothing to clear.`);
      return;
    }
    
    try {
      setIsDeleting(true);
      
      if (!window.confirm(`Are you sure you want to delete ALL ${collectionName}? This cannot be undone.`)) {
        setIsDeleting(false);
        return;
      }
      
      const querySnapshot = await getDocs(collection(db, collectionName));
      const deletePromises = [];
      
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      console.log(`✅ Deleted ${deletePromises.length} documents from ${collectionName}`);
      
      alert(`✅ Successfully deleted ${deletePromises.length} documents from ${collectionName}`);
      await loadData();
      
    } catch (error) {
      console.error(`❌ Error clearing ${collectionName}:`, error);
      alert(`❌ Failed to clear ${collectionName}:\n\n${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteAllData = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type "DELETE" to confirm deletion of all data.');
      return;
    }
    
    try {
      setIsDeleting(true);
      
      if (!window.confirm('🚨 FINAL WARNING!\n\nThis will delete ALL data from Firebase. This action CANNOT be undone!')) {
        setIsDeleting(false);
        return;
      }
      
      // ✅ CLEAN: Only delete collections that actually exist
      const collections = [
        'practiceSessions',
        'mindRecoverySessions',
        'userProgress', 
        'users'
      ];
      
      let totalDeleted = 0;
      
      for (const collectionName of collections) {
        try {
          const querySnapshot = await getDocs(collection(db, collectionName));
          const deletePromises = [];
          
          querySnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
          });
          
          await Promise.all(deletePromises);
          totalDeleted += deletePromises.length;
          console.log(`✅ Deleted ${deletePromises.length} documents from ${collectionName}`);
          
        } catch (error) {
          console.error(`❌ Error deleting ${collectionName}:`, error);
        }
      }
      
      // Delete emotional notes
      await clearEmotionalNotes();
      
      alert(`✅ Complete deletion summary:\n\nTotal Documents Deleted: ${totalDeleted}\n\nPage will refresh...`);
      setDeleteConfirmation('');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error deleting all data:', error);
      alert(`❌ Error occurred during deletion:\n\n${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [emotionalNotes]);

  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '18px',
        color: '#666'
      }}>
        🔄 Loading Firebase data...
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>
          🔥 Firebase Admin Dashboard
        </h1>
        <p style={{ margin: '0', fontSize: '1.2em', opacity: 0.9 }}>
          Real-time database monitoring and management
        </p>
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: '8px',
          fontSize: '1.1em'
        }}>
          🔗 Connected to Firebase • {stats.total} total documents
        </div>
      </div>

      {/* ✅ CLEAN: Stats Grid - Only Real Collections */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Practice Sessions */}
        <div style={{ 
          background: '#e3f2fd', 
          border: '2px solid #2196f3', 
          borderRadius: '12px', 
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>🧘</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#1976d2' }}>
            {stats.practiceSessions}
          </div>
          <div style={{ fontSize: '1.1em', color: '#424242', marginBottom: '15px' }}>
            Practice Sessions
          </div>
          <button 
            onClick={() => clearCollection('practiceSessions')}
            disabled={isDeleting}
            style={{
              background: isDeleting ? '#ccc' : '#ff5722',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {isDeleting ? '⏳' : 'Clear'}
          </button>
        </div>

        {/* Mind Recovery Sessions */}
        <div style={{ 
          background: '#f3e5f5', 
          border: '2px solid #9c27b0', 
          borderRadius: '12px', 
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>🌱</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#7b1fa2' }}>
            {stats.mindRecoverySessions}
          </div>
          <div style={{ fontSize: '1.1em', color: '#424242', marginBottom: '15px' }}>
            Mind Recovery Sessions
          </div>
          <button 
            onClick={() => clearCollection('mindRecoverySessions')}
            disabled={isDeleting}
            style={{
              background: isDeleting ? '#ccc' : '#ff5722',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {isDeleting ? '⏳' : 'Clear'}
          </button>
        </div>

        {/* Daily Emotional Notes */}
        <div style={{ 
          background: '#fff3e0', 
          border: '2px solid #f59e0b', 
          borderRadius: '12px', 
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>📝</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#f57c00' }}>
            {stats.dailyNotes}
          </div>
          <div style={{ fontSize: '1.1em', color: '#424242', marginBottom: '10px' }}>
            Daily Emotional Notes
          </div>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '10px' }}>
            ✅ From WellnessContext (same as Daily Notes page)
          </div>
          <button 
            onClick={() => clearCollection('dailyNotes')}
            disabled={isDeleting}
            style={{
              background: isDeleting ? '#ccc' : '#ff5722',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {isDeleting ? '⏳ Clearing...' : 'Clear'}
          </button>
        </div>

        {/* User Progress */}
        <div style={{ 
          background: '#e8f5e8', 
          border: '2px solid #4caf50', 
          borderRadius: '12px', 
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>📈</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#388e3c' }}>
            {stats.userProgress}
          </div>
          <div style={{ fontSize: '1.1em', color: '#424242', marginBottom: '15px' }}>
            User Progress
          </div>
          <button 
            onClick={() => clearCollection('userProgress')}
            disabled={isDeleting}
            style={{
              background: isDeleting ? '#ccc' : '#ff5722',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {isDeleting ? '⏳' : 'Clear'}
          </button>
        </div>

        {/* Users */}
        <div style={{ 
          background: '#fce4ec', 
          border: '2px solid #e91e63', 
          borderRadius: '12px', 
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>👥</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#c2185b' }}>
            {stats.users}
          </div>
          <div style={{ fontSize: '1.1em', color: '#424242', marginBottom: '15px' }}>
            Users
          </div>
          <button 
            onClick={() => clearCollection('users')}
            disabled={isDeleting}
            style={{
              background: isDeleting ? '#ccc' : '#ff5722',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {isDeleting ? '⏳' : 'Clear'}
          </button>
        </div>

        {/* ✅ OPTIONAL: Keep placeholders for future features (show as disabled) */}
        <div style={{ 
          background: '#f1f8e9', 
          border: '2px solid #8bc34a', 
          borderRadius: '12px', 
          padding: '20px',
          textAlign: 'center',
          opacity: 0.6
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>📋</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#689f38' }}>
            {stats.questionnaires}
          </div>
          <div style={{ fontSize: '1.1em', color: '#424242', marginBottom: '10px' }}>
            Questionnaires
          </div>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '10px' }}>
            🚧 Feature coming soon
          </div>
          <button 
            disabled
            style={{
              background: '#ccc',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'not-allowed',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            N/A
          </button>
        </div>

        <div style={{ 
          background: '#fff8e1', 
          border: '2px solid #ffc107', 
          borderRadius: '12px', 
          padding: '20px',
          textAlign: 'center',
          opacity: 0.6
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>🔍</div>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#f57c00' }}>
            {stats.selfAssessments}
          </div>
          <div style={{ fontSize: '1.1em', color: '#424242', marginBottom: '10px' }}>
            Self Assessments
          </div>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '10px' }}>
            🚧 Feature coming soon
          </div>
          <button 
            disabled
            style={{
              background: '#ccc',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'not-allowed',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            N/A
          </button>
        </div>
      </div>

      {/* Show Details Toggle */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: showDetails ? '#f44336' : '#2196f3',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {showDetails ? '🙈 Hide Details' : '👁️ Show Details'}
        </button>
      </div>

      {/* Recent Data Details */}
      {showDetails && (
        <div style={{ 
          background: '#f5f5f5', 
          borderRadius: '12px', 
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>
            📋 Recent Data Sample (Last 5 items per collection)
          </h2>
          
          {/* Only show details for collections that have data */}
          {recentData.dailyNotes.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                color: '#f57c00', 
                borderBottom: '2px solid #f57c00', 
                paddingBottom: '5px',
                marginBottom: '15px'
              }}>
                📝 Recent Daily Emotional Notes ({recentData.dailyNotes.length}) - From WellnessContext
              </h3>
              {recentData.dailyNotes.map((note, index) => (
                <div key={index} style={{ 
                  background: 'white', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '10px',
                  border: '1px solid #ddd'
                }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    🆔 ID: {note.noteId || note.id || 'No ID'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    🕒 Time: {note.timestamp || 'No timestamp'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    😊 Emotion: {note.emotion || 'No emotion'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    📝 Content: {note.content?.substring(0, 100) || 'No content'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {recentData.dailyNotes.length === 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                color: '#f57c00', 
                borderBottom: '2px solid #f57c00', 
                paddingBottom: '5px',
                marginBottom: '15px'
              }}>
                📝 Daily Emotional Notes - From WellnessContext
              </h3>
              <div style={{ 
                background: 'white', 
                padding: '15px', 
                borderRadius: '8px', 
                border: '1px solid #ddd',
                color: '#666',
                fontStyle: 'italic'
              }}>
                No emotional notes found. Try adding some notes on the Daily Notes page!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Danger Zone */}
      <div style={{ 
        background: '#ffebee', 
        border: '2px solid #f44336', 
        borderRadius: '12px', 
        padding: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '20px' }}>
          ⚠️ Danger Zone
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          This will permanently delete ALL data from Firebase. This action cannot be undone.
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder='Type "DELETE" to confirm'
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '2px solid #f44336',
              fontSize: '16px',
              width: '200px',
              textAlign: 'center'
            }}
          />
        </div>
        
        <button
          onClick={deleteAllData}
          disabled={isDeleting || deleteConfirmation !== 'DELETE'}
          style={{
            background: deleteConfirmation === 'DELETE' && !isDeleting ? '#d32f2f' : '#ccc',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            cursor: deleteConfirmation === 'DELETE' && !isDeleting ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isDeleting ? '🔄 Deleting All Data...' : '🗑️ DELETE ALL DATA'}
        </button>
      </div>
    </div>
  );
};

export default DirectFirebaseAdmin;
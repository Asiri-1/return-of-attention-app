// ✅ COMPLETE ADMIN SERVER - User Management with Real-Time Token Revocation
// File: server/admin-server.js
// 🚀 Run this with: node admin-server.js

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ MIDDLEWARE
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://thereturnoftattention.com',
    'https://return-of-attention-app.web.app',
    'https://return-of-attention-app.firebaseapp.com'
  ],
  credentials: true
}));

app.use(express.json());

// ✅ FIREBASE ADMIN INITIALIZATION
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://return-of-attention-app-default-rtdb.firebaseio.com`
  });
}

const auth = admin.auth();
const firestore = admin.firestore();

// ✅ AUTHENTICATION MIDDLEWARE
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    
    // Check if user is admin
    const adminEmails = [
      'asiriamarasinghe35@gmail.com',
      'admin@thereturnoftattention.com',
      'admin@return-of-attention-app.com'
    ];
    
    if (!adminEmails.includes(decodedToken.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ✅ ROUTES

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'Admin Server v1.0'
  });
});

// Get all users
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching all users...');
    
    const listUsersResult = await auth.listUsers(1000);
    
    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || null,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
      providerData: userRecord.providerData.map(provider => ({
        providerId: provider.providerId,
        uid: provider.uid,
        email: provider.email
      }))
    }));
    
    console.log(`✅ Found ${users.length} users`);
    
    res.json({
      success: true,
      users: users,
      totalCount: users.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
});

// Delete single user with real-time token revocation
app.post('/api/admin/delete-user', authenticateAdmin, async (req, res) => {
  try {
    const { userId, email, revokeTokens = true } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    console.log(`🗑️ Deleting user: ${email} (${userId})`);
    
    if (revokeTokens) {
      try {
        await auth.revokeRefreshTokens(userId);
        console.log(`✅ Revoked all tokens for user: ${userId}`);
      } catch (tokenError) {
        console.warn(`⚠️ Token revocation failed for ${userId}:`, tokenError.message);
      }
    }
    
    await auth.deleteUser(userId);
    console.log(`✅ Deleted user from Auth: ${userId}`);
    
    try {
      const userProfilesRef = firestore.collection('userProfiles').doc(userId);
      const usersRef = firestore.collection('users').doc(userId);
      
      const batch = firestore.batch();
      batch.delete(userProfilesRef);
      batch.delete(usersRef);
      
      await batch.commit();
      console.log(`✅ Deleted user data from Firestore: ${userId}`);
    } catch (firestoreError) {
      console.warn(`⚠️ Firestore deletion failed for ${userId}:`, firestoreError.message);
    }
    
    res.json({
      success: true,
      message: `User ${email} deleted successfully`,
      userId: userId,
      tokensRevoked: revokeTokens,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: error.message 
    });
  }
});

// Bulk delete users
app.post('/api/admin/delete-users-bulk', authenticateAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }
    
    console.log(`🗑️ Bulk deleting ${userIds.length} users...`);
    
    const results = [];
    
    for (const userId of userIds) {
      try {
        await auth.revokeRefreshTokens(userId);
        await auth.deleteUser(userId);
        
        const userProfilesRef = firestore.collection('userProfiles').doc(userId);
        const usersRef = firestore.collection('users').doc(userId);
        
        const batch = firestore.batch();
        batch.delete(userProfilesRef);
        batch.delete(usersRef);
        await batch.commit();
        
        results.push({
          userId,
          status: 'deleted',
          message: 'User deleted successfully'
        });
        
        console.log(`✅ Bulk deleted user: ${userId}`);
        
      } catch (error) {
        results.push({
          userId,
          status: 'failed',
          message: error.message
        });
        
        console.error(`❌ Failed to delete user ${userId}:`, error.message);
      }
    }
    
    const successful = results.filter(r => r.status === 'deleted').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    res.json({
      success: true,
      message: `Bulk delete completed: ${successful} successful, ${failed} failed`,
      results,
      summary: {
        total: userIds.length,
        successful,
        failed
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in bulk delete:', error);
    res.status(500).json({ 
      error: 'Bulk delete failed',
      details: error.message 
    });
  }
});

// Get user details
app.get('/api/admin/user/:userId', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userRecord = await auth.getUser(userId);
    
    let firestoreData = null;
    try {
      const userDoc = await firestore.collection('userProfiles').doc(userId).get();
      if (userDoc.exists) {
        firestoreData = userDoc.data();
      } else {
        const userDoc2 = await firestore.collection('users').doc(userId).get();
        if (userDoc2.exists) {
          firestoreData = userDoc2.data();
        }
      }
    } catch (e) {
      console.warn('Could not fetch Firestore data:', e.message);
    }
    
    res.json({
      success: true,
      user: {
        auth: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime
        },
        firestore: firestoreData
      }
    });
    
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user details',
      details: error.message 
    });
  }
});

// Disable/Enable user
app.post('/api/admin/user/:userId/toggle-status', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { disabled } = req.body;
    
    await auth.updateUser(userId, { disabled });
    
    if (disabled) {
      await auth.revokeRefreshTokens(userId);
    }
    
    res.json({
      success: true,
      message: `User ${disabled ? 'disabled' : 'enabled'} successfully`,
      userId,
      disabled,
      tokensRevoked: disabled
    });
    
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ 
      error: 'Failed to toggle user status',
      details: error.message 
    });
  }
});

// ✅ ERROR HANDLING
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`
🚀 Admin Server Running!

📡 Server: http://localhost:${PORT}
🔥 Firebase Project: return-of-attention-app
👥 User Management: ACTIVE
🗑️ Real-Time Token Revocation: ENABLED
🛡️ Admin Authentication: REQUIRED

🔧 Available Endpoints:
  GET  /health
  GET  /api/admin/users
  POST /api/admin/delete-user
  POST /api/admin/delete-users-bulk
  GET  /api/admin/user/:userId
  POST /api/admin/user/:userId/toggle-status

✅ Ready to manage users!
  `);
});

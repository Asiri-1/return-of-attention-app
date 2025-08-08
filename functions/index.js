const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// Initialize Firebase Admin
admin.initializeApp();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

const auth = admin.auth();
const firestore = admin.firestore();

// Authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    
    const adminEmails = [
      'asiriamarasinghe35@gmail.com',
      'admin@thereturnoftattention.com'
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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'Firebase Functions Admin API'
  });
});

// Get all users
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
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
    
    res.json({
      success: true,
      users: users,
      totalCount: users.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
});

// Delete user
app.post('/api/admin/delete-user', authenticateAdmin, async (req, res) => {
  try {
    const { userId, email, revokeTokens = true } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (revokeTokens) {
      await auth.revokeRefreshTokens(userId);
    }
    
    await auth.deleteUser(userId);
    
    // Delete from Firestore
    try {
      const batch = firestore.batch();
      batch.delete(firestore.collection('userProfiles').doc(userId));
      batch.delete(firestore.collection('users').doc(userId));
      await batch.commit();
    } catch (firestoreError) {
      console.warn('Firestore deletion failed:', firestoreError.message);
    }
    
    res.json({
      success: true,
      message: `User ${email} deleted successfully`,
      userId: userId,
      tokensRevoked: revokeTokens,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
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
    
    const results = [];
    
    for (const userId of userIds) {
      try {
        await auth.revokeRefreshTokens(userId);
        await auth.deleteUser(userId);
        
        const batch = firestore.batch();
        batch.delete(firestore.collection('userProfiles').doc(userId));
        batch.delete(firestore.collection('users').doc(userId));
        await batch.commit();
        
        results.push({
          userId,
          status: 'deleted',
          message: 'User deleted successfully'
        });
        
      } catch (error) {
        results.push({
          userId,
          status: 'failed',
          message: error.message
        });
      }
    }
    
    const successful = results.filter(r => r.status === 'deleted').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    res.json({
      success: true,
      message: `Bulk delete completed: ${successful} successful, ${failed} failed`,
      results,
      summary: { total: userIds.length, successful, failed },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ 
      error: 'Bulk delete failed',
      details: error.message 
    });
  }
});

exports.adminApi = functions.https.onRequest(app);

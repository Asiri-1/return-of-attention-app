// server.js - Firebase Admin SDK Server with Real-Time Token Revocation
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialize Firebase Admin with your service account
// Download serviceAccountKey.json from Firebase Console > Project Settings > Service accounts
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://return-of-attention-app-default-rtdb.firebaseio.com"
});

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to verify admin tokens
async function verifyAdminToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if user is admin (your email)
    if (decodedToken.email !== 'asiriamarasinghe35@gmail.com') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token', shouldSignOut: true });
  }
}

// Middleware to verify any valid token (for checking if user exists)
async function verifyUserToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ 
      error: 'Invalid or revoked token', 
      shouldSignOut: true,
      reason: 'TOKEN_REVOKED'
    });
  }
}

// ✅ CRITICAL: User deletion with token revocation
app.post('/api/admin/delete-user', verifyAdminToken, async (req, res) => {
  try {
    const { userId, email, revokeTokens = true } = req.body;
    
    if (!userId && !email) {
      return res.status(400).json({ error: 'userId or email required' });
    }

    let userRecord;
    
    // Get user record
    try {
      if (userId) {
        userRecord = await admin.auth().getUser(userId);
      } else {
        userRecord = await admin.auth().getUserByEmail(email);
      }
    } catch (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`🗑️ Deleting user: ${userRecord.email} (${userRecord.uid})`);

    // 1. CRITICAL: Revoke all refresh tokens for the user
    if (revokeTokens) {
      await admin.auth().revokeRefreshTokens(userRecord.uid);
      console.log(`✅ Revoked all tokens for user: ${userRecord.uid}`);
    }

    // 2. Mark user as deleted in Firestore (for real-time detection)
    try {
      await admin.firestore().doc(`deletedUsers/${userRecord.uid}`).set({
        email: userRecord.email,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: req.user.email,
        originalUid: userRecord.uid
      });
      console.log(`✅ Marked user as deleted in Firestore: ${userRecord.uid}`);
    } catch (firestoreError) {
      console.warn('Failed to mark user as deleted in Firestore:', firestoreError);
    }

    // 3. Delete user from Firebase Auth
    await admin.auth().deleteUser(userRecord.uid);
    console.log(`✅ Deleted user from Firebase Auth: ${userRecord.uid}`);

    // 4. Clean up user data in Firestore
    try {
      const userDoc = admin.firestore().doc(`users/${userRecord.uid}`);
      await userDoc.delete();
      console.log(`✅ Deleted user document from Firestore: ${userRecord.uid}`);
    } catch (cleanupError) {
      console.warn('Failed to delete user document:', cleanupError);
    }

    res.json({
      success: true,
      message: `User ${userRecord.email} deleted successfully`,
      deletedUser: {
        uid: userRecord.uid,
        email: userRecord.email
      },
      tokensRevoked: revokeTokens
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      error: 'Failed to delete user', 
      details: error.message 
    });
  }
});

// ✅ Check if current user's token is still valid
app.get('/api/auth/verify-token', verifyUserToken, async (req, res) => {
  try {
    // Check if user is marked as deleted
    const deletedUserDoc = await admin.firestore().doc(`deletedUsers/${req.user.uid}`).get();
    
    if (deletedUserDoc.exists) {
      return res.status(401).json({ 
        error: 'User account has been deleted', 
        shouldSignOut: true,
        reason: 'USER_DELETED'
      });
    }

    // Check if user still exists in Firebase Auth
    try {
      await admin.auth().getUser(req.user.uid);
    } catch (error) {
      return res.status(401).json({ 
        error: 'User account no longer exists', 
        shouldSignOut: true,
        reason: 'USER_NOT_FOUND'
      });
    }

    res.json({
      valid: true,
      user: {
        uid: req.user.uid,
        email: req.user.email
      }
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// ✅ List all users (for admin panel)
app.get('/api/admin/users', verifyAdminToken, async (req, res) => {
  try {
    const listUsers = await admin.auth().listUsers(1000);
    
    const users = listUsers.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime
    }));

    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// ✅ Bulk delete users
app.post('/api/admin/delete-users-bulk', verifyAdminToken, async (req, res) => {
  try {
    const { userIds, emails } = req.body;
    const results = [];

    if (userIds) {
      for (const uid of userIds) {
        try {
          await admin.auth().revokeRefreshTokens(uid);
          await admin.auth().deleteUser(uid);
          results.push({ uid, status: 'deleted' });
        } catch (error) {
          results.push({ uid, status: 'failed', error: error.message });
        }
      }
    }

    if (emails) {
      for (const email of emails) {
        try {
          const user = await admin.auth().getUserByEmail(email);
          await admin.auth().revokeRefreshTokens(user.uid);
          await admin.auth().deleteUser(user.uid);
          results.push({ email, uid: user.uid, status: 'deleted' });
        } catch (error) {
          results.push({ email, status: 'failed', error: error.message });
        }
      }
    }

    res.json({ results, total: results.length });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ error: 'Bulk delete failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    firebaseAdmin: 'connected'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Firebase Admin Server running on port ${PORT}`);
  console.log(`📡 Admin endpoints available at http://localhost:${PORT}/api/admin/`);
});

module.exports = app;
// ✅ MERGED FIREBASE FUNCTIONS - EXISTING + NEW ADMIN API
// File: functions/src/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin (avoid double initialization)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

// ✅ EXISTING FUNCTION: Hello World (preserved)
exports.helloWorld = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
  });
});

// ✅ EXISTING FUNCTION: PAHM Guru Chat (preserved - this is important!)
exports.pahmGuruChat = functions.https.onRequest(async (request, response) => {
  return cors(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { message, userContext, sessionId } = request.body;

      if (!message || !userContext || !sessionId) {
        response.status(400).json({ 
          error: 'Missing required fields: message, userContext, sessionId' 
        });
        return;
      }

      const enhancedResponse = await generateEnhancedResponse(message, userContext);
      await saveInteractionToFirestore(sessionId, message, enhancedResponse, userContext);
      
      response.json(enhancedResponse);

    } catch (error) {
      functions.logger.error('Error in pahmGuruChat:', error);
      response.status(500).json({
        error: 'Internal server error',
        message: 'Sorry, I encountered an error processing your request.'
      });
    }
  });
});

// ✅ EXISTING FUNCTION: Health Check (preserved)
exports.healthCheck = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    response.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });
});

// ✅ EXISTING HELPER FUNCTIONS (preserved)
async function generateEnhancedResponse(message, userContext) {
  const messageLC = message.toLowerCase();
  const stage = userContext?.currentStage || 1;
  
  let response = '';
  let confidence = 0.8;
  let practicalActions = [];
  let ancientWisdom = '';

  if (messageLC.includes('pahm') || messageLC.includes('matrix')) {
    response = `The PAHM Matrix helps categorize thoughts as Past/Present/Future combined with Attachment/Neutral/Aversion. Present + Neutral positions involve direct reality contact.`;
    practicalActions = [
      'Practice identifying Present + Neutral mental positions',
      'Notice when thoughts involve past memories or future planning',
      'Observe attachment and aversion patterns without judgment'
    ];
    confidence = 0.92;
    ancientWisdom = 'Only Present + Neutral mental positions involve direct reality contact';
  } else if (messageLC.includes('stress') || messageLC.includes('anxiety')) {
    response = `Stress and anxiety often involve Future + Aversion mental positions. Use Present + Neutral awareness as refuge when these patterns arise.`;
    practicalActions = [
      'Return to present-moment breath awareness',
      'Notice anxiety as Future + Aversion mental position',
      'Practice Present + Neutral observation'
    ];
    confidence = 0.88;
    ancientWisdom = 'You are not your thoughts - you are the awareness in which thoughts arise';
  } else {
    response = `Thank you for your question about "${message}". Remember that awareness itself is the path.`;
    practicalActions = [
      'Return to present-moment awareness',
      'Notice the awareness that recognizes thoughts'
    ];
    ancientWisdom = 'Every moment of recognition is a moment of awakening';
  }
  
  return {
    response,
    confidence,
    practicalActions,
    ancientWisdom,
    timestamp: new Date().toISOString(),
    source: 'firebase_enhanced'
  };
}

async function saveInteractionToFirestore(sessionId, userMessage, response, userContext) {
  try {
    await db.collection('chatInteractions').add({
      sessionId,
      userId: userContext?.uid || 'anonymous',
      userMessage,
      aiResponse: response.response,
      confidence: response.confidence,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    functions.logger.error('Error saving to Firestore:', error);
  }
}

// ✅ NEW: ADMIN API FUNCTION
exports.adminApi = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Set CORS headers
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Handle preflight OPTIONS request
      if (req.method === 'OPTIONS') {
        return res.status(200).send();
      }

      // Extract route from URL
      const path = req.path || req.url.split('/adminApi')[1] || '/';
      const method = req.method;
      
      console.log(`Admin API Request: ${method} ${path}`);

      // Route handling
      if (path === '/health' && method === 'GET') {
        return handleHealthCheck(req, res);
      }
      
      // Verify admin token for protected routes
      const authResult = await verifyAdminToken(req);
      if (!authResult.success) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: authResult.message 
        });
      }

      // Protected routes
      if (path === '/users' && method === 'GET') {
        return await handleGetUsers(req, res);
      }
      
      if (path.startsWith('/users/') && method === 'GET') {
        const userId = path.split('/users/')[1];
        return await handleGetUser(req, res, userId);
      }
      
      if (path.startsWith('/users/') && method === 'DELETE') {
        const userId = path.split('/users/')[1];
        return await handleDeleteUser(req, res, userId);
      }
      
      if (path === '/analytics' && method === 'GET') {
        return await handleGetAnalytics(req, res);
      }

      // Default 404
      return res.status(404).json({ 
        error: 'Not Found', 
        message: `Route ${method} ${path} not found` 
      });

    } catch (error) {
      console.error('Admin API Error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: error.message 
      });
    }
  });
});

// ✅ ADMIN API HELPER FUNCTIONS

async function handleHealthCheck(req, res) {
  try {
    // Test Firestore connection
    await db.collection('test').limit(1).get();
    
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        firestore: 'connected',
        auth: 'connected'
      }
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
}

async function verifyAdminToken(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, message: 'No authorization token provided' };
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user profile to check if admin
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.membershipType !== 'admin') {
      return { success: false, message: 'User is not an admin' };
    }

    return { success: true, user: decodedToken };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { success: false, message: 'Invalid token' };
  }
}

async function handleGetUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    let query = db.collection('users');
    
    // Add search filter if provided
    if (search) {
      query = query.where('email', '>=', search)
                   .where('email', '<=', search + '\uf8ff');
    }

    // Execute query
    const snapshot = await query.limit(limit).get();
    const users = [];

    snapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        membershipType: userData.membershipType,
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
        lastLoginAt: userData.lastLoginAt?.toDate?.()?.toISOString() || userData.lastLoginAt,
        memberSince: userData.memberSince?.toDate?.()?.toISOString() || userData.memberSince
      });
    });

    // Get total count for pagination
    const totalSnapshot = await db.collection('users').get();
    const total = totalSnapshot.size;

    return res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function handleGetUser(req, res, userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const user = {
      uid: userDoc.id,
      ...userData,
      createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
      lastLoginAt: userData.lastLoginAt?.toDate?.()?.toISOString() || userData.lastLoginAt,
      memberSince: userData.memberSince?.toDate?.()?.toISOString() || userData.memberSince
    };

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

async function handleDeleteUser(req, res, userId) {
  try {
    const batch = db.batch();
    
    // 1. Delete from Firebase Auth
    await auth.deleteUser(userId);
    
    // 2. Delete user document
    const userRef = db.collection('users').doc(userId);
    batch.delete(userRef);
    
    // 3. Add to deletedUsers collection for real-time detection
    const deletedUserRef = db.collection('deletedUsers').doc(userId);
    batch.set(deletedUserRef, {
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedBy: 'admin',
      reason: req.body.reason || 'Deleted by administrator'
    });
    
    // 4. Commit batch
    await batch.commit();

    console.log(`User ${userId} deleted successfully`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully',
      userId 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ 
      error: 'Failed to delete user', 
      message: error.message 
    });
  }
}

async function handleGetAnalytics(req, res) {
  try {
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    
    let adminUsers = 0;
    let premiumUsers = 0;
    let freeUsers = 0;
    let recentSignups = 0;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      
      // Count by membership type
      switch (userData.membershipType) {
        case 'admin':
          adminUsers++;
          break;
        case 'premium':
          premiumUsers++;
          break;
        default:
          freeUsers++;
      }
      
      // Count recent signups
      const createdAt = userData.createdAt?.toDate?.() || new Date(userData.createdAt);
      if (createdAt > oneWeekAgo) {
        recentSignups++;
      }
    });

    return res.status(200).json({
      totalUsers,
      usersByType: {
        admin: adminUsers,
        premium: premiumUsers,
        free: freeUsers
      },
      recentSignups,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

// ✅ NEW: SCHEDULED FUNCTION - Clean up old deleted users
exports.cleanupDeletedUsers = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const oldDeletedUsers = await db.collection('deletedUsers')
        .where('deletedAt', '<', oneWeekAgo)
        .get();
      
      const batch = db.batch();
      oldDeletedUsers.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`Cleaned up ${oldDeletedUsers.size} old deleted user records`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });
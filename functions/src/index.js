const {onRequest} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Initialize Firebase Admin (only initialize once)
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Helper function to set CORS headers (keep your existing pattern)
const setCorsHeaders = (res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "3600");
};

// Helper function to handle OPTIONS requests (keep your existing pattern)
const handleOptions = (req, res) => {
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    res.status(204).send("");
    return true;
  }
  return false;
};

// Keep your existing Hello world function (updated for v2)
exports.helloWorld = onRequest((req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;
  
  logger.info("Hello logs!", {structuredData: true});
  res.send("Hello from Firebase!");
});

// ===================== NEW: COMPLETE API =====================

// Create Express app for the main API
const app = express();

// Use CORS middleware (this is better than manual headers)
app.use(cors({ origin: true }));

// Parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// ===================== USER ROUTES =====================

// Get user profile
app.get('/users/profile', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      // Create default profile if doesn't exist
      const defaultProfile = {
        uid: uid,
        email: req.user.email,
        displayName: req.user.name || req.user.email?.split('@')[0] || '',
        experienceLevel: '',
        goals: [],
        practiceTime: 0,
        frequency: '',
        assessmentCompleted: false,
        currentStage: 'questionnaire',
        questionnaireCompleted: false,
        questionnaireAnswers: null,
        selfAssessmentData: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('users').doc(uid).set(defaultProfile);
      logger.info(`Created new user profile for ${uid}`);
      res.json(defaultProfile);
    } else {
      res.json({ uid, ...userDoc.data() });
    }
  } catch (error) {
    logger.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
app.put('/users/profile', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(uid).update(updateData);
    
    const updatedDoc = await db.collection('users').doc(uid).get();
    logger.info(`Updated user profile for ${uid}`);
    res.json({ uid, ...updatedDoc.data() });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Save questionnaire answers
app.post('/users/questionnaire', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { answers } = req.body;
    
    const updateData = {
      questionnaireAnswers: answers,
      questionnaireCompleted: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(uid).update(updateData);
    
    const updatedDoc = await db.collection('users').doc(uid).get();
    logger.info(`Saved questionnaire for ${uid}`);
    res.json({ uid, ...updatedDoc.data() });
  } catch (error) {
    logger.error('Error saving questionnaire:', error);
    res.status(500).json({ error: 'Failed to save questionnaire' });
  }
});

// Save self-assessment data
app.post('/users/self-assessment', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { assessmentData } = req.body;
    
    const updateData = {
      selfAssessmentData: assessmentData,
      assessmentCompleted: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(uid).update(updateData);
    
    const updatedDoc = await db.collection('users').doc(uid).get();
    logger.info(`Saved self-assessment for ${uid}`);
    res.json({ uid, ...updatedDoc.data() });
  } catch (error) {
    logger.error('Error saving self-assessment:', error);
    res.status(500).json({ error: 'Failed to save self-assessment' });
  }
});

// ===================== PRACTICE SESSION ROUTES =====================

// Get practice sessions
app.get('/practice/sessions', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const sessionsSnapshot = await db.collection('users').doc(uid)
      .collection('practiceSessions')
      .orderBy('date', 'desc')
      .limit(50) // Limit to recent sessions
      .get();
    
    const sessions = sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(sessions);
  } catch (error) {
    logger.error('Error getting practice sessions:', error);
    res.status(500).json({ error: 'Failed to get practice sessions' });
  }
});

// Create practice session
app.post('/practice/sessions', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const sessionData = {
      ...req.body,
      userId: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('users').doc(uid)
      .collection('practiceSessions')
      .add(sessionData);
    
    const newSession = await docRef.get();
    logger.info(`Created practice session for ${uid}`);
    res.json({ id: newSession.id, ...newSession.data() });
  } catch (error) {
    logger.error('Error creating practice session:', error);
    res.status(500).json({ error: 'Failed to create practice session' });
  }
});

// ===================== EMOTIONAL NOTES ROUTES =====================

// Get emotional notes
app.get('/emotional-notes', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const notesSnapshot = await db.collection('users').doc(uid)
      .collection('emotionalNotes')
      .orderBy('date', 'desc')
      .limit(100) // Limit to recent notes
      .get();
    
    const notes = notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(notes);
  } catch (error) {
    logger.error('Error getting emotional notes:', error);
    res.status(500).json({ error: 'Failed to get emotional notes' });
  }
});

// Create emotional note
app.post('/emotional-notes', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const noteData = {
      ...req.body,
      userId: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('users').doc(uid)
      .collection('emotionalNotes')
      .add(noteData);
    
    const newNote = await docRef.get();
    logger.info(`Created emotional note for ${uid}`);
    res.json({ id: newNote.id, ...newNote.data() });
  } catch (error) {
    logger.error('Error creating emotional note:', error);
    res.status(500).json({ error: 'Failed to create emotional note' });
  }
});

// Update emotional note
app.put('/emotional-notes/:id', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const noteId = req.params.id;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(uid)
      .collection('emotionalNotes')
      .doc(noteId)
      .update(updateData);
    
    const updatedNote = await db.collection('users').doc(uid)
      .collection('emotionalNotes')
      .doc(noteId)
      .get();
    
    logger.info(`Updated emotional note ${noteId} for ${uid}`);
    res.json({ id: updatedNote.id, ...updatedNote.data() });
  } catch (error) {
    logger.error('Error updating emotional note:', error);
    res.status(500).json({ error: 'Failed to update emotional note' });
  }
});

// Delete emotional note
app.delete('/emotional-notes/:id', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const noteId = req.params.id;
    
    await db.collection('users').doc(uid)
      .collection('emotionalNotes')
      .doc(noteId)
      .delete();
    
    logger.info(`Deleted emotional note ${noteId} for ${uid}`);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    logger.error('Error deleting emotional note:', error);
    res.status(500).json({ error: 'Failed to delete emotional note' });
  }
});

// ===================== ANALYTICS ROUTES =====================

// Get analytics data
app.get('/analytics', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    
    // Get practice sessions for analytics
    const sessionsSnapshot = await db.collection('users').doc(uid)
      .collection('practiceSessions')
      .get();
    
    const sessions = sessionsSnapshot.docs.map(doc => doc.data());
    
    // Calculate analytics
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const averageSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;
    
    // Get streak data (simplified - you can implement more complex logic)
    const currentStreak = 0;
    
    res.json({
      totalSessions,
      totalMinutes,
      averageSessionLength,
      currentStreak,
      recentSessions: sessions.slice(0, 10)
    });
  } catch (error) {
    logger.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Return of Attention API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Export the main API as a Firebase Function (using v2)
exports.api = onRequest({
  cors: true,
  memory: "1GiB",
  timeoutSeconds: 60,
  maxInstances: 10
}, app);
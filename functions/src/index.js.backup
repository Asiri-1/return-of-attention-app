const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Helper function to set CORS headers
const setCorsHeaders = (res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "3600");
};

// Helper function to handle OPTIONS requests
const handleOptions = (req, res) => {
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    res.status(204).send("");
    return true;
  }
  return false;
};

// Helper function to verify authentication
const verifyAuth = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: No valid authentication token provided");
  }
  return authHeader.split("Bearer ")[1];
};

// Helper function to check if user is an admin
const isAdmin = async (uid) => {
  try {
    const user = await admin.auth().getUser(uid);
    const customClaims = user.customClaims || {};
    return customClaims.admin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

// EXISTING FUNCTIONS

// CORS-enabled analytics event logging function
exports.logAnalyticsEvent = functions.https.onRequest((req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method === "POST") {
    try {
      const eventPayload = req.body;
      console.log("Received analytics event:", eventPayload);
      res.status(200).send("Event received successfully!");
    } catch (error) {
      console.error("Error processing analytics event:", error);
      res.status(500).send("Error processing event.");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
});

// Hello world function with CORS support
exports.helloWorld = functions.https.onRequest((req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;
  
  res.send("Hello from Firebase!");
});

// USER MANAGEMENT FUNCTIONS

// Create or update user profile
exports.createUserProfile = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { email, displayName, profile } = req.body;

    const userData = {
      uid,
      email,
      displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      profile: profile || {},
      settings: {
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: true,
        preferredLanguage: "en",
        timezone: "America/New_York"
      },
      progress: {
        currentStage: "Seeker",
        seeker: {
          currentT: "T1"
        },
        pahm: {
          trainee: { completedSessions: 0, matrixCounts: {} },
          beginner: { completedSessions: 0, matrixCounts: {} },
          practitioner: { completedSessions: 0, matrixCounts: {} },
          master: { completedSessions: 0, matrixCounts: {} },
          illuminator: { completedSessions: 0, matrixCounts: {} }
        },
        streaks: {
          currentDailyStreak: 0,
          longestDailyStreak: 0,
          lastPracticeDate: null
        },
        achievements: []
      }
    };

    await db.collection("users").doc(uid).set(userData, { merge: true });
    
    res.status(200).json({ message: "User profile created successfully", uid });
  } catch (error) {
    console.error("Error creating user profile:", error);
    res.status(500).json({ error: "Failed to create user profile" });
  }
});

// Get user profile
exports.getUserProfile = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.status(200).json(userDoc.data());
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
});

// Update user settings
exports.updateUserSettings = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method !== "PUT") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { settings } = req.body;

    await db.collection("users").doc(uid).update({
      settings: settings,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ message: "User settings updated successfully" });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Failed to update user settings" });
  }
});

// PRACTICE SESSION FUNCTIONS

// Start practice session
exports.startPracticeSession = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { sessionId, practiceType, stage, durationMinutes, deviceInfo } = req.body;

    const sessionData = {
      userId: uid,
      sessionId,
      practiceType,
      stage,
      durationMinutes,
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      completed: false,
      deviceInfo: deviceInfo || {}
    };

    await db.collection("practices").doc(sessionId).set(sessionData);

    res.status(200).json({ message: "Practice session started", sessionId });
  } catch (error) {
    console.error("Error starting practice session:", error);
    res.status(500).json({ error: "Failed to start practice session" });
  }
});

// End practice session
exports.endPracticeSession = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method !== "PUT") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { sessionId, completed, pahmMatrixData, reflectionNotesId } = req.body;

    // Update practice session
    const updateData = {
      endTime: admin.firestore.FieldValue.serverTimestamp(),
      completed,
      pahmMatrixData: pahmMatrixData || null,
      reflectionNotesId: reflectionNotesId || null
    };

    await db.collection("practices").doc(sessionId).update(updateData);

    // If completed, update user progress and streaks
    if (completed) {
      const sessionDoc = await db.collection("practices").doc(sessionId).get();
      const sessionData = sessionDoc.data();
      
      if (sessionData && sessionData.userId === uid) {
        // Update user progress based on practice type and stage
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        // Update stage-specific progress
        if (sessionData.practiceType === "Seeker") {
          const updatePath = `progress.seeker.${sessionData.stage.toLowerCase()}CompletedAt`;
          await userRef.update({
            [updatePath]: admin.firestore.FieldValue.serverTimestamp()
          });
        } else if (sessionData.practiceType === "PAHM") {
          const stageName = sessionData.stage.toLowerCase().replace("pahm ", "");
          const updatePath = `progress.pahm.${stageName}.completedSessions`;
          await userRef.update({
            [updatePath]: admin.firestore.FieldValue.increment(1),
            [`progress.pahm.${stageName}.lastSessionAt`]: admin.firestore.FieldValue.serverTimestamp()
          });

          // Update PAHM matrix counts if provided
          if (pahmMatrixData) {
            for (const [key, value] of Object.entries(pahmMatrixData)) {
              const matrixPath = `progress.pahm.${stageName}.matrixCounts.${key}`;
              await userRef.update({
                [matrixPath]: admin.firestore.FieldValue.increment(value)
              });
            }
          }
        }

        // Update streaks
        const today = new Date().toISOString().split("T")[0];
        const lastPracticeDate = userData.progress?.streaks?.lastPracticeDate;
        
        if (lastPracticeDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          
          let newStreak = 1;
          if (lastPracticeDate === yesterdayStr) {
            newStreak = (userData.progress?.streaks?.currentDailyStreak || 0) + 1;
          }
          
          await userRef.update({
            "progress.streaks.currentDailyStreak": newStreak,
            "progress.streaks.longestDailyStreak": Math.max(
              newStreak, 
              userData.progress?.streaks?.longestDailyStreak || 0
            ),
            "progress.streaks.lastPracticeDate": today
          });
        }
      }
    }

    res.status(200).json({ message: "Practice session ended successfully" });
  } catch (error) {
    console.error("Error ending practice session:", error);
    res.status(500).json({ error: "Failed to end practice session" });
  }
});

// Get practice history
exports.getPracticeHistory = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const limit = parseInt(req.query.limit) || 50;
    
    let query = db.collection("practices")
      .where("userId", "==", uid)
      .orderBy("startTime", "desc")
      .limit(limit);

    const snapshot = await query.get();
    const practices = [];
    
    snapshot.forEach(doc => {
      practices.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(practices);
  } catch (error) {
    console.error("Error getting practice history:", error);
    res.status(500).json({ error: "Failed to get practice history" });
  }
});

// SELF-ASSESSMENT FUNCTIONS

// Submit assessment
exports.submitAssessment = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { assessmentId, assessmentType, questions, overallScore } = req.body;

    const assessmentData = {
      userId: uid,
      assessmentId,
      assessmentType,
      questions,
      overallScore: overallScore || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("assessments").doc(assessmentId).set(assessmentData);

    res.status(200).json({ message: "Assessment submitted successfully", assessmentId });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    res.status(500).json({ error: "Failed to submit assessment" });
  }
});

// Get latest assessment
exports.getLatestAssessment = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const snapshot = await db.collection("assessments")
      .where("userId", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No assessments found" });
    }

    const assessment = snapshot.docs[0];
    res.status(200).json({ id: assessment.id, ...assessment.data() });
  } catch (error) {
    console.error("Error getting latest assessment:", error);
    res.status(500).json({ error: "Failed to get latest assessment" });
  }
});

// EMOTIONAL NOTES FUNCTIONS

// Create emotional note
exports.createEmotionalNote = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { noteId, mood, notes, associatedPracticeId, tags } = req.body;

    const noteData = {
      userId: uid,
      noteId,
      mood,
      notes,
      associatedPracticeId: associatedPracticeId || null,
      tags: tags || [],
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("emotions").doc(noteId).set(noteData);

    res.status(200).json({ message: "Emotional note created successfully", noteId });
  } catch (error) {
    console.error("Error creating emotional note:", error);
    res.status(500).json({ error: "Failed to create emotional note" });
  }
});

// Get emotional notes
exports.getEmotionalNotes = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const limit = parseInt(req.query.limit) || 50;
    
    let query = db.collection("emotions")
      .where("userId", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(limit);

    const snapshot = await query.get();
    const notes = [];
    
    snapshot.forEach(doc => {
      notes.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error getting emotional notes:", error);
    res.status(500).json({ error: "Failed to get emotional notes" });
  }
});

// PROGRESS AND ANALYTICS FUNCTIONS

// Get progress summary
exports.getProgressSummary = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get user progress
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    // Get recent practices
    const practicesSnapshot = await db.collection("practices")
      .where("userId", "==", uid)
      .where("completed", "==", true)
      .orderBy("startTime", "desc")
      .limit(10)
      .get();
    const recentPractices = [];
    practicesSnapshot.forEach(doc => {
      recentPractices.push(doc.data());
    });

    res.status(200).json({ ...userData, recentPractices });
  } catch (error) {
    console.error("Error getting progress summary:", error);
    res.status(500).json({ error: "Failed to get progress summary" });
  }
});

// CONTENT MANAGEMENT FUNCTIONS

exports.getContentList = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    await admin.auth().verifyIdToken(token);

    const { type, category, tags, limit = 20 } = req.query;
    let query = db.collection("content");

    if (type) query = query.where("type", "==", type);
    if (category) query = query.where("category", "==", category);
    if (tags) query = query.where("tags", "array-contains-any", tags.split(","));

    const snapshot = await query.limit(parseInt(limit)).get();
    const contentList = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Return summarized content without full body text
      contentList.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        tags: data.tags,
        thumbnailUrl: data.thumbnailUrl,
        durationMinutes: data.durationMinutes,
        createdAt: data.createdAt
      });
    });

    res.status(200).json(contentList);
  } catch (error) {
    console.error("Error getting content list:", error);
    res.status(500).json({ error: "Failed to get content list" });
  }
});

exports.getContentDetails = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    await admin.auth().verifyIdToken(token);

    const contentId = req.query.id;
    if (!contentId) {
      return res.status(400).json({ error: "Content ID is required" });
    }

    const contentDoc = await db.collection("content").doc(contentId).get();

    if (!contentDoc.exists) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.status(200).json({ id: contentDoc.id, ...contentDoc.data() });
  } catch (error) {
    console.error("Error getting content details:", error);
    res.status(500).json({ error: "Failed to get content details" });
  }
});

exports.createContent = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    if (!(await isAdmin(uid))) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const { title, description, type, category, body, mediaUrls, tags, durationMinutes } = req.body;

    if (!title || !type || !category || !body) {
      return res.status(400).json({ error: "Missing required content fields" });
    }

    const newContentRef = db.collection("content").doc();
    await newContentRef.set({
      title,
      description: description || "",
      type,
      category,
      body,
      mediaUrls: mediaUrls || [],
      tags: tags || [],
      durationMinutes: durationMinutes || 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: uid,
      viewCount: 0,
      completionCount: 0
    });

    res.status(201).json({ message: "Content created successfully", contentId: newContentRef.id });
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({ error: "Failed to create content" });
  }
});

exports.updateContent = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== "PUT") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    if (!(await isAdmin(uid))) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const { contentId, title, description, type, category, body, mediaUrls, tags, durationMinutes } = req.body;

    if (!contentId) {
      return res.status(400).json({ error: "Content ID is required" });
    }

    const contentRef = db.collection("content").doc(contentId);
    const contentDoc = await contentRef.get();

    if (!contentDoc.exists) {
      return res.status(404).json({ error: "Content not found" });
    }

    const updateData = {
      title: title || contentDoc.data().title,
      description: description || contentDoc.data().description,
      type: type || contentDoc.data().type,
      category: category || contentDoc.data().category,
      body: body || contentDoc.data().body,
      mediaUrls: mediaUrls || contentDoc.data().mediaUrls,
      tags: tags || contentDoc.data().tags,
      durationMinutes: durationMinutes || contentDoc.data().durationMinutes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await contentRef.update(updateData);

    res.status(200).json({ message: "Content updated successfully" });
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).json({ error: "Failed to update content" });
  }
});

exports.trackContentView = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    await admin.auth().verifyIdToken(token);

    const { contentId } = req.body;
    if (!contentId) {
      return res.status(400).json({ error: "Content ID is required" });
    }

    const contentRef = db.collection("content").doc(contentId);

    await db.runTransaction(async (transaction) => {
      const contentDoc = await transaction.get(contentRef);
      if (!contentDoc.exists) {
        throw new Error("Content not found");
      }
      const newViewCount = (contentDoc.data().viewCount || 0) + 1;
      transaction.update(contentRef, { viewCount: newViewCount });
    });

    res.status(200).json({ message: "Content view tracked successfully" });
  } catch (error) {
    console.error("Error tracking content view:", error);
    res.status(500).json({ error: "Failed to track content view" });
  }
});

exports.trackContentCompletion = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { contentId } = req.body;
    if (!contentId) {
      return res.status(400).json({ error: "Content ID is required" });
    }

    const contentRef = db.collection("content").doc(contentId);
    const userContentCompletionRef = db.collection("users").doc(uid).collection("completedContent").doc(contentId);

    await db.runTransaction(async (transaction) => {
      const contentDoc = await transaction.get(contentRef);
      if (!contentDoc.exists) {
        throw new Error("Content not found");
      }
      const newCompletionCount = (contentDoc.data().completionCount || 0) + 1;
      transaction.update(contentRef, { completionCount: newCompletionCount });

      // Record individual user completion
      transaction.set(userContentCompletionRef, {
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        contentId: contentId,
        userId: uid
      }, { merge: true });
    });

    res.status(200).json({ message: "Content completion tracked successfully" });
  } catch (error) {
    console.error("Error tracking content completion:", error);
    res.status(500).json({ error: "Failed to track content completion" });
  }
});

// AI DATA AGGREGATION FUNCTIONS

exports.generateInsights = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User profile not found" });
    }
    const userData = userDoc.data();

    const practicesSnapshot = await db.collection("practices")
      .where("userId", "==", uid)
      .where("completed", "==", true)
      .orderBy("startTime", "desc")
      .limit(20) // Analyze recent 20 practices
      .get();
    const recentPractices = practicesSnapshot.docs.map(doc => doc.data());

    const emotionsSnapshot = await db.collection("emotions")
      .where("userId", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(20) // Analyze recent 20 emotional notes
      .get();
    const recentEmotions = emotionsSnapshot.docs.map(doc => doc.data());

    // --- AI Logic for Insights (Simplified Example) ---
    let insights = [];
    let recommendations = [];

    // Practice pattern analysis
    if (recentPractices.length > 0) {
      const totalDuration = recentPractices.reduce((sum, p) => sum + (p.durationMinutes || 0), 0);
      insights.push(`You've completed ${recentPractices.length} practices recently, totaling ${totalDuration} minutes.`);
      
      const pahmPractices = recentPractices.filter(p => p.practiceType === "PAHM");
      if (pahmPractices.length > 0) {
        insights.push(`You've focused on PAHM practices in ${pahmPractices.length} sessions.`);
      }
    }

    // Emotional trend analysis
    if (recentEmotions.length > 0) {
      const moods = recentEmotions.map(e => e.mood);
      const moodCounts = moods.reduce((acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {});
      const mostFrequentMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
      insights.push(`Your most frequent mood recently has been '${mostFrequentMood}'.`);
    }

    // Personalized recommendations (example based on current stage)
    if (userData.progress?.currentStage === "Seeker") {
      recommendations.push("Consider exploring different T-stages to find what resonates best with you.");
    } else if (userData.progress?.currentStage.startsWith("PAHM")) {
      recommendations.push("Continue to engage with the PAHM matrix to deepen your practice.");
    }

    res.status(200).json({ insights, recommendations, userData, recentPractices, recentEmotions });
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

exports.getEnhancedProgressSummary = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User profile not found" });
    }
    const userData = userDoc.data();

    const practicesSnapshot = await db.collection("practices")
      .where("userId", "==", uid)
      .where("completed", "==", true)
      .orderBy("startTime", "desc")
      .limit(5) // Get recent practices for quick summary
      .get();
    const recentPractices = practicesSnapshot.docs.map(doc => doc.data());

    // --- AI-driven enhancements (Simplified Example) ---
    let enhancedSummary = {};

    // Streak message
    const currentDailyStreak = userData.progress?.streaks?.currentDailyStreak || 0;
    if (currentDailyStreak > 0) {
      enhancedSummary.streakMessage = `You're on a ${currentDailyStreak}-day streak! Keep up the great work.`;
    } else {
      enhancedSummary.streakMessage = "Start a new streak today!";
    }

    // Progress status
    enhancedSummary.progressStatus = `You are currently in the ${userData.progress?.currentStage} stage.`;

    // Recent mood trend
    const emotionsSnapshot = await db.collection("emotions")
      .where("userId", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(3)
      .get();
    const latestMoods = emotionsSnapshot.docs.map(doc => doc.data().mood);
    if (latestMoods.length > 0) {
      enhancedSummary.moodTrend = `Your recent mood trend: ${latestMoods.join(", ")}.`;
    }

    // Personalized tip
    if (userData.progress?.currentStage === "Seeker") {
      enhancedSummary.tip = "Try to increase your practice duration gradually to build focus.";
    } else if (userData.progress?.currentStage.startsWith("PAHM")) {
      enhancedSummary.tip = "Reflect on your PAHM matrix interactions to understand your attention patterns.";
    }

    res.status(200).json({ ...userData, recentPractices, enhancedSummary });
  } catch (error) {
    console.error("Error getting enhanced progress summary:", error);
    res.status(500).json({ error: "Failed to get enhanced progress summary" });
  }
});

// PAHM GURU CHAT FUNCTIONS

exports.pahmGuruChat = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = verifyAuth(req);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { sessionId, message, currentStage, recentPractices, matrixData } = req.body;

    // Fetch user data for context
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    // Simulate AI response based on message and context
    let guruResponse = "I'm here to help you on your journey. What would you like to know?";
    if (message.toLowerCase().includes("practice")) {
      guruResponse = `To improve your practice, focus on consistency. You are currently in the ${currentStage} stage.`;
    } else if (message.toLowerCase().includes("pahm matrix")) {
      guruResponse = `The PAHM matrix helps you track your attention. Your current matrix data suggests... (This would be more detailed with actual AI/logic).`;
    } else if (message.toLowerCase().includes("next level")) {
      guruResponse = `To advance to the next level, focus on mastering the current stage's practices.`;
    }

    // Store conversation history
    const chatSessionRef = db.collection("chatSessions").doc(sessionId || db.collection("chatSessions").doc().id);
    await chatSessionRef.set({
      userId: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
      sessionContext: {
        currentStage: currentStage || userData?.progress?.currentStage,
        recentPractices: recentPractices || [],
        matrixData: matrixData || userData?.progress?.pahm?.matrixCounts,
      },
      messages: admin.firestore.FieldValue.arrayUnion({
        role: "user",
        content: message,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }, {
        role: "assistant",
        content: guruResponse,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      })
    }, { merge: true });

    res.status(200).json({ response: guruResponse, sessionId: chatSessionRef.id });
  } catch (error) {
    console.error("Error in PAHM Guru Chat:", error);
    res.status(500).json({ error: "Failed to get guru response" });
  }
});



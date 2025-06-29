// functions/src/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.helloWorld = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
  });
});

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

exports.healthCheck = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    response.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });
});
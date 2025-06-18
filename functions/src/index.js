const functions = require("firebase-functions");

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

// Hello world function with CORS support
exports.helloWorld = functions.https.onRequest((req, res ) => {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;
  
  res.send("Hello from Firebase!");
});

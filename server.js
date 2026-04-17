// Import required libraries
const express = require('express'); // Framework for creating the API
const cors = require('cors');       // Allows your API to be called from different domains (like a React or HTML website)
const db = require('./db');         // Import our database configuration from db.js
require('dotenv').config();          // Load environment variables (PORT, DB credentials)

const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from .env, or default to 5000

// --- Middleware ---
app.use(cors());           // Use CORS so your frontend can talk to this backend
app.use(express.json());   // Tells Express to automatically parse JSON data sent in request bodies

/**
 * 1. Health Check Route
 * URL: GET http://localhost:5000/
 * Purpose: To check if the API is alive.
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

/**
 * 2. Save Chat History
 * URL: POST http://localhost:5000/api/chat
 * Purpose: Receives chat data from Postman/Frontend and saves it to MySQL.
 */
app.post('/api/chat', async (req, res) => {
  // Extract data. We will check both the top level and inside a "body" object for flexibility.
  let { agent_type, sessionid, user, ai } = req.body;

  // If the data is wrapped in a "body" object (like your new format)
  if (req.body.body) {
    agent_type = agent_type || req.body.body.agent || req.body.body.agent_type;
    sessionid = sessionid || req.body.body.sessionId || req.body.body.sessionid;
    user = user || req.body.body.message || req.body.body.user;
    // Check for "ai", "output", "response", "text", or "answer"
    ai = ai || req.body.body.ai || req.body.body.output || req.body.body.response || req.body.body.text || req.body.body.answer;
  }

  // STEP 1: Validation - check if required fields are missing
  if (!agent_type || !sessionid) {
    return res.status(400).json({
      success: false,
      message: 'agent_type (or agent) and sessionid are required',
    });
  }

  try {
    // STEP 2: Write the SQL Query with placeholders (?)
    const query = 'INSERT INTO ai_chat_history (agent_type, sessionid, user, ai) VALUES (?, ?, ?, ?)';
    const values = [agent_type, sessionid, user || null, ai || null];

    // STEP 3: Execute the query using the database pool
    const [result] = await db.execute(query, values);

    // STEP 4: Send a success response back to the user
    res.status(201).json({
      success: true,
      message: 'Chat history saved successfully',
      insertId: result.insertId, // The ID of the newly created row in MySQL
    });
  } catch (error) {
    // If something goes wrong (e.g., database is down), log it and tell the user
    console.error('Error saving chat:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * 3. Fetch All Chat History
 * URL: GET http://localhost:5000/api/chat
 * Purpose: Returns every single row from the chat history table.
 */
app.get('/api/chat', async (req, res) => {
  try {
    // Get all records, sorted by ID descending (newest first)
    const query = 'SELECT * FROM ai_chat_history ORDER BY id DESC';
    const [rows] = await db.execute(query);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching all chats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * 4. Fetch Chat by Agent Type Only
 * URL: GET http://localhost:5000/api/chat/:agent_type
 * Example: http://localhost:5000/api/chat/realstate
 */
app.get('/api/chat/:agent_type', async (req, res) => {
  const { agent_type } = req.params; // Get the agent name from the URL

  try {
    // Search for all rows where agent_type matches the one in the URL
    const query = 'SELECT * FROM ai_chat_history WHERE agent_type = ? ORDER BY id DESC';
    const [rows] = await db.execute(query, [agent_type]);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching chat by agent:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * 5. Fetch Chat by Agent Type and Session ID
 * URL: GET http://localhost:5000/api/chat/:agent_type/:sessionid
 * Example: http://localhost:5000/api/chat/realstate/0101
 */
app.get('/api/chat/:agent_type/:sessionid', async (req, res) => {
  const { agent_type, sessionid } = req.params; // Get both values from the URL

  try {
    // Search for rows matching BOTH the agent type AND the specific session id
    const query = 'SELECT * FROM ai_chat_history WHERE agent_type = ? AND sessionid = ? ORDER BY id DESC';
    const [rows] = await db.execute(query, [agent_type, sessionid]);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching specific chat:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// --- Start the Server (Only for local development) ---
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel to use as a serverless function
module.exports = app;

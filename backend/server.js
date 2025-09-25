require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------
// Middleware
// ------------------------

// CORS: Allow frontend origin from .env
app.use(cors({
  origin: ['http://localhost:3000', 'https://chatbot-gules-psi.vercel.app/'],
  credentials: true
}));


// JSON & URL-encoded parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

// ------------------------
// MongoDB Connection
// ------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB Connected to Atlas!'))
  .catch(err => console.error('❌ MongoDB Connection Failed:', err.message));

// ------------------------
// Test DB Route
// ------------------------
app.get('/test-db', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    res.json({
      dbName: mongoose.connection.name,
      status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      collections: collections.length
    });
  } catch (err) {
    res.status(500).json({ error: 'DB test failed: ' + err.message });
  }
});

// ------------------------
// Import Routes & Middleware
// ------------------------
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const chatRoutes = require('./routes/chat');
const { authMiddleware } = require('./middleware/auth');

// ------------------------
// API Routes
// ------------------------
app.use('/api/auth', authRoutes); // Public routes
app.use('/api/projects', authMiddleware, projectRoutes); // Protected routes
app.use('/api/chat', authMiddleware, chatRoutes); // Protected routes

// ------------------------
// Mock AI Test Route
// ------------------------
app.get('/api/test', async (req, res) => {
  try {
    const mockResponses = [
      'Hello from the chatbot backend! How can I help today?',
      'This is a free mock response. Your backend is working great!',
      'AI simulation: The weather is sunny. Ask me anything!',
      'Free mode activated: MongoDB connected, ready for chats.',
      'Mock GPT: Say hello in 5 words - Hi, welcome aboard!'
    ];
    const aiResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const dbInfo = `Connected to DB with ${collections.length} collections.`;

    res.json({
      message: 'Backend Server Working! (Free Mock Mode)',
      aiResponse,
      database: dbInfo,
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth/register (POST)',
        projects: '/api/projects (GET/POST - needs token)',
        chat: '/api/chat/:projectId (POST {message} - needs token + AI!)'
      }
    });
  } catch (err) {
    console.error('Test Route Error:', err.message);
    res.status(500).json({ error: 'Test failed: ' + err.message });
  }
});

// ------------------------
// Root Route
// ------------------------
app.get('/', (req, res) => {
  res.json({
    message: 'Chatbot Platform Backend is Running!',
    docs: 'Test auth: POST /api/auth/register with JSON body'
  });
});

// ------------------------
// Global Error Handling
// ------------------------
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ------------------------
// Start Server
// ------------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Test: http://localhost:${PORT}/api/test`);
});

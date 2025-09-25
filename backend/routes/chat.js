const express = require('express');
const router = express.Router();
// const auth = require('../middleware/auth');  // REMOVED: Not needed (server.js mounting handles auth)
const Chat = require('../models/Chat');
const Project = require('../models/Project');
const { chatSchema } = require('../validation/schemas');  // Your original Joi schema (kept)

// OpenAI integration (real AI - your code kept)
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST: Send message to /:projectId (user + AI response in one doc)
router.post('/:projectId', async (req, res) => {  // FIXED: No explicit 'auth' param (mounting handles)
  try {
    const { projectId } = req.params;  // From URL
    const { message } = req.body;  // Expect { message } (not projectId)

    if (!message || message.trim().length < 1) {
      return res.status(400).json({ success: false, error: 'Message content required' });
    }

    // FIXED: Simple validation on message only (bypasses full schema for now - avoids projectId mismatch)
    // If you want full Joi: const { error } = chatSchema.validate({ message });  // Ignores projectId
    // if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    // Verify project ownership (your code, uses req.user from mounting)
    const project = await Project.findOne({ _id: projectId, user: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found or access denied' });
    }

    // Generate real AI response (your code unchanged - GPT call)
    let response;
    let tokensUsed = 0;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",  // Cheap/fast model
        messages: [
          { role: "system", content: "You are a helpful assistant in a chatbot platform. Keep responses concise, friendly, and relevant to the user's message." },
          { role: "user", content: message }  // User's input
        ],
        temperature: 0.7,  // Balance creativity (0-1)
        max_tokens: 50    // Short responses to save free credits (increase to 150 later)
      });

      response = completion.choices[0].message.content.trim();  // Clean AI output
      tokensUsed = completion.usage ? completion.usage.total_tokens : 0;  // Track usage

    } catch (aiError) {
      console.error('OpenAI Error:', aiError.message);  // Logs to CMD
      if (aiError.code === 'invalid_api_key') {
        return res.status(401).json({ success: false, error: 'Invalid OpenAI API key—check .env' });
      } else if (aiError.code === 'insufficient_quota') {
        return res.status(402).json({ success: false, error: 'OpenAI credits low—using fallback' });
      } else {
        // Fallback to simple mock if AI fails (your code kept)
        response = `Sorry, AI is temporarily unavailable. Echo: "${message}"`;
      }
    }

    // Save to DB (your code + FIXED: metadata.tokens, role='user')
    const chat = new Chat({
      project: projectId,
      user: req.user._id,
      message,  // User input
      response,  // AI output
      role: 'user',  // For the interaction
      metadata: {  // Nested as per schema
        tokens: tokensUsed,
        model: 'gpt-3.5-turbo'
      }
    });
    await chat.save();

    // FIXED: Return full chat obj (for frontend mapping) + success format
    res.status(201).json({
      success: true,
      message: "Chat processed with AI!",
      data: chat  // Full doc: { _id, message, response, role, metadata.tokens, createdAt, ... }
    });

  } catch (error) {
    console.error('Chat Route Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET route: Fetch chats for a project (your code + no explicit auth + success format)
router.get('/:projectId', async (req, res) => {  // FIXED: No explicit 'auth' param
  try {
    const { projectId } = req.params;
    const chats = await Chat.find({
      project: projectId,
      user: req.user._id  // Filters to current user (from mounting)
    })
    .sort({ createdAt: 1 })  // Oldest to newest
    .limit(50);  // Last 50 chats

    // FIXED: Add success format (matches frontend)
    res.json({ 
      success: true, 
      data: chats  // Array of full chats (populated via pre-hook)
    });
  } catch (error) {
    console.error('GET Chats Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
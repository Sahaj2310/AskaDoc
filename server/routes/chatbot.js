const express = require('express');
const router = express.Router();
const ChatbotService = require('../services/chatbotService');
const auth = require('../middleware/auth');

// Send message to chatbot
router.post('/message', auth, async (req, res) => {
  try {
    if (!req.body.message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = await ChatbotService.processMessage(req.user.userId, req.body.message);
    res.json(response);
  } catch (error) {
    console.error('Error in chatbot message route:', error);
    res.status(500).json({ 
      message: 'Error processing message', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const messages = await ChatbotService.getChatHistory(req.user.userId);
    res.json(messages || []);
  } catch (error) {
    console.error('Error in chatbot history route:', error);
    res.status(500).json({ 
      message: 'Error fetching chat history', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router; 
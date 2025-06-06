const express = require('express');
const router = express.Router();
const ChatbotService = require('../services/chatbotService');
const auth = require('../middleware/auth');

// Send message to chatbot
router.post('/message', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const response = await ChatbotService.processMessage(req.user.userId, message);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error processing message', error: error.message });
  }
});

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const messages = await ChatbotService.getChatHistory(req.user.userId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history', error: error.message });
  }
});

module.exports = router; 
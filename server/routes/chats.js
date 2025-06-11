const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

// Get all chats for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log(`[Chats Backend] Fetching chats for user: ${req.user.userId}, role: ${req.user.role}`);

    const chats = await Chat.find({
      $or: [
        { doctor: req.user.userId },
        { patient: req.user.userId }
      ]
    })
    .populate('doctor', 'username profile.name profile.specialization role')
    .populate('patient', 'username profile.name profile.email role')
    .sort({ lastMessage: -1 });

    console.log(`[Chats Backend] Found ${chats.length} chats.`);
    if (chats.length > 0) {
        console.log(`[Chats Backend] First chat details (truncated):`, JSON.stringify(chats[0], (key, value) => {
            if (key === 'messages' && Array.isArray(value)) {
                return `[${value.length} messages]`;
            }
            return value;
        }, 2).substring(0, 500));
    }

    const transformedChats = chats.map(chat => {
      const otherParticipant = chat.doctor._id.toString() === req.user.userId
        ? chat.patient
        : chat.doctor;

      const otherParticipantProfile = otherParticipant.profile || {};

      return {
        _id: chat._id,
        messages: chat.messages,
        lastMessage: chat.lastMessage,
        status: chat.status,
        createdAt: chat.createdAt,
        otherParticipant: {
          _id: otherParticipant._id,
          username: otherParticipant.username,
          role: otherParticipant.role,
          profile: {
            name: otherParticipantProfile.name || 'Unknown',
            specialization: otherParticipantProfile.specialization || 'N/A',
            email: otherParticipantProfile.email || 'N/A'
          }
        },
        doctor: chat.doctor,
        patient: chat.patient,
      };
    });

    console.log(`[Chats Backend] Sending ${transformedChats.length} transformed chats.`);
    res.json(transformedChats);
  } catch (error) {
    console.error('[Chats Backend] Error fetching chats:', error);
    res.status(500).json({ message: 'Error fetching chats', error: error.message });
  }
});

// Get specific chat
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('doctor', 'username profile.name profile.specialization role')
      .populate('patient', 'username profile.name profile.email role');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is part of the chat
    if (chat.doctor._id.toString() !== req.user.userId && 
        chat.patient._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat', error: error.message });
  }
});

// Create new chat
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId } = req.body;

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      doctor: doctorId,
      patient: req.user.userId
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat
    const chat = new Chat({
      doctor: doctorId,
      patient: req.user.userId,
      messages: []
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat', error: error.message });
  }
});

// Add message to chat
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is part of the chat
    if (chat.doctor.toString() !== req.user.userId && 
        chat.patient.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add message
    chat.messages.push({
      sender: req.user.userId,
      content
    });

    chat.lastMessage = Date.now();
    await chat.save();

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error adding message', error: error.message });
  }
});

module.exports = router; 
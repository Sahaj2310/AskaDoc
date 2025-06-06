const Chatbot = require('../models/Chatbot');
const User = require('../models/User');

// Keywords and their corresponding responses
const keywordResponses = {
  'hello': 'Hello! I am AskaDoc assistant. How can I help you today?',
  'hi': 'Hi there! I am AskaDoc assistant. How can I help you today?',
  'help': 'I can help you with:\n1. Basic medical information\n2. Symptom assessment\n3. Finding a suitable doctor\n4. Emergency guidance\nWhat would you like to know?',
  'emergency': 'If this is a medical emergency, please call emergency services immediately. Would you like me to help you find the nearest emergency room?',
  'symptom': 'I can help assess your symptoms. Please describe what you are experiencing.',
  'doctor': 'I can help you find a suitable doctor. What is your main concern?',
  'thank': 'You\'re welcome! Is there anything else I can help you with?',
  'bye': 'Goodbye! Take care of yourself. Feel free to return if you have more questions.'
};

// Medical conditions and their corresponding specializations
const conditionSpecializations = {
  'heart': 'Cardiology',
  'chest': 'Cardiology',
  'headache': 'Neurology',
  'brain': 'Neurology',
  'skin': 'Dermatology',
  'rash': 'Dermatology',
  'child': 'Pediatrics',
  'baby': 'Pediatrics',
  'mental': 'Psychiatry',
  'anxiety': 'Psychiatry',
  'bone': 'Orthopedics',
  'joint': 'Orthopedics',
  'women': 'Gynecology',
  'pregnancy': 'Gynecology',
  'eye': 'Ophthalmology',
  'vision': 'Ophthalmology',
  'ear': 'ENT',
  'nose': 'ENT',
  'throat': 'ENT'
};

class ChatbotService {
  static async processMessage(userId, message) {
    try {
      // Find or create chatbot session
      let chatbot = await Chatbot.findOne({ userId, status: 'active' });
      if (!chatbot) {
        chatbot = new Chatbot({ userId, messages: [] });
      }

      // Add user message
      chatbot.messages.push({
        sender: 'user',
        content: message
      });

      // Generate bot response
      const response = await this.generateResponse(message, userId);
      
      // Add bot response
      chatbot.messages.push({
        sender: 'bot',
        content: response.message
      });

      // Update chatbot status if needed
      if (response.referToDoctor) {
        chatbot.status = 'referred';
        chatbot.referredTo = response.doctorId;
      }

      chatbot.lastMessage = Date.now();
      await chatbot.save();

      return {
        message: response.message,
        referToDoctor: response.referToDoctor,
        doctorId: response.doctorId
      };
    } catch (error) {
      console.error('Error processing chatbot message:', error);
      throw error;
    }
  }

  static async generateResponse(message, userId) {
    const lowerMessage = message.toLowerCase();

    // Check for keywords
    for (const [keyword, response] of Object.entries(keywordResponses)) {
      if (lowerMessage.includes(keyword)) {
        return { message: response };
      }
    }

    // Check for medical conditions
    for (const [condition, specialization] of Object.entries(conditionSpecializations)) {
      if (lowerMessage.includes(condition)) {
        // Find a doctor with matching specialization
        const doctor = await User.findOne({
          role: 'doctor',
          'profile.specialization': specialization
        }).select('_id profile.name profile.specialization');

        if (doctor) {
          return {
            message: `Based on your symptoms, I recommend consulting a ${specialization} specialist. Would you like to chat with Dr. ${doctor.profile.name}?`,
            referToDoctor: true,
            doctorId: doctor._id
          };
        }
      }
    }

    // Default response
    return {
      message: 'I understand you have a medical concern. Could you please provide more details about your symptoms? This will help me guide you better.'
    };
  }

  static async getChatHistory(userId) {
    try {
      const chatbot = await Chatbot.findOne({ userId, status: 'active' });
      return chatbot ? chatbot.messages : [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }
}

module.exports = ChatbotService; 
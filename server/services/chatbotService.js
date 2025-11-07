const Chatbot = require('../models/Chatbot');
const User = require('../models/User');
const fetch = require('node-fetch');

// Hugging Face API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/bert-base-uncased';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// System message to set the context for the AI
const SYSTEM_MESSAGE = `You are a medical assistant chatbot for AskaDoc platform. Your role is to:
1. Provide basic medical information and guidance
2. Help assess symptoms and provide initial advice
3. Recommend appropriate medical specialists when needed
4. Handle emergency situations appropriately
5. Maintain a professional and empathetic tone
6. Always remind users that you're an AI assistant and not a replacement for professional medical advice

Important guidelines:
- For emergency situations, immediately advise users to call emergency services
- Be clear about the limitations of your advice
- Always recommend consulting a healthcare professional for proper diagnosis
- Maintain patient confidentiality
- Be empathetic and understanding`;

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
        content: message,
        timestamp: new Date()
      });

      // Check for emergency keywords
      const emergencyCheck = this.isEmergency(message.toLowerCase());
      if (emergencyCheck.isEmergency) {
        let emergencyResponse;
        
        if (emergencyCheck.severity === 'critical') {
          emergencyResponse = {
            message: `⚠️ EMERGENCY ALERT: This appears to be a critical medical emergency. Please call emergency services (911) immediately or go to the nearest emergency room. Your condition requires immediate medical attention.\n\n` +
                    `Emergency Details:\n` +
                    `- Type: ${emergencyCheck.type}\n` +
                    `- Severity: Critical\n` +
                    `- Action Required: Immediate medical attention\n\n` +
                    `Would you like me to:\n` +
                    `1. Help you find the nearest emergency facility\n` +
                    `2. Provide first aid instructions while waiting for emergency services\n` +
                    `3. Contact emergency services on your behalf`,
            isEmergency: true,
            emergencyType: emergencyCheck.type,
            emergencySeverity: emergencyCheck.severity,
            emergencyDetails: emergencyCheck.details
          };
        } else {
          // Enhanced urgent response with specific guidance
          let specificGuidance = '';
          switch (emergencyCheck.type) {
            case 'dizziness':
              specificGuidance = `For dizziness:\n` +
                               `1. Sit or lie down immediately\n` +
                               `2. Stay hydrated\n` +
                               `3. Avoid sudden movements\n` +
                               `4. Monitor for other symptoms\n\n` +
                               `Seek medical attention if:\n` +
                               `- Dizziness persists or worsens\n` +
                               `- You experience other symptoms\n` +
                               `- You have a history of heart problems`;
              break;
            case 'pain':
              specificGuidance = `For pain management:\n` +
                               `1. Rest the affected area\n` +
                               `2. Apply ice or heat as appropriate\n` +
                               `3. Take over-the-counter pain relievers if safe\n` +
                               `4. Monitor for worsening symptoms\n\n` +
                               `Seek medical attention if:\n` +
                               `- Pain intensifies\n` +
                               `- You develop new symptoms\n` +
                               `- Pain interferes with daily activities`;
              break;
            // Add more cases for other symptom types
            default:
              specificGuidance = `Monitor your symptoms closely and seek medical attention if they worsen or if you develop new symptoms.`;
          }

          emergencyResponse = {
            message: `⚠️ URGENT MEDICAL ATTENTION NEEDED: This appears to be an urgent medical situation. While not immediately life-threatening, you should seek medical attention soon.\n\n` +
                    `Urgent Details:\n` +
                    `- Type: ${emergencyCheck.type}\n` +
                    `- Severity: Urgent\n` +
                    `- Action Required: Medical attention within 24 hours\n\n` +
                    `${specificGuidance}\n\n` +
                    `Would you like me to:\n` +
                    `1. Help you find the nearest urgent care facility\n` +
                    `2. Provide more detailed self-care instructions\n` +
                    `3. Help you schedule an appointment with a doctor`,
            isEmergency: true,
            emergencyType: emergencyCheck.type,
            emergencySeverity: emergencyCheck.severity,
            emergencyDetails: emergencyCheck.details
          };
        }

        chatbot.messages.push({
          sender: 'bot',
          content: emergencyResponse.message,
          timestamp: new Date()
        });
        await chatbot.save();
        return emergencyResponse;
      }

      // Generate response using Hugging Face API
      const response = await this.generateAIResponse(chatbot.messages, message);
      
      // Add bot response
      chatbot.messages.push({
        sender: 'bot',
        content: response.message,
        timestamp: new Date()
      });

      // Update chatbot status if needed
      if (response.referToDoctor) {
        chatbot.status = 'referred';
        chatbot.referredTo = response.doctorId;
      }

      chatbot.lastMessage = Date.now();
      await chatbot.save();

      return response;
    } catch (error) {
      console.error('Error processing chatbot message:', error);
      throw error;
    }
  }

  static async generateAIResponse(messages, currentMessage) {
    try {
      if (!HF_API_KEY) {
        throw new Error('Hugging Face API key is not configured');
      }

      // Prepare the prompt with context
      const prompt = `Medical Assistant: I am a medical assistant chatbot. I provide basic medical information and guidance.
User: ${currentMessage}
Medical Assistant:`;

      // Call Hugging Face API
      const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Hugging Face API error details:', errorData);
        
        // If we get a 404 or other error, fall back to rule-based response
        return this.generateRuleBasedResponse(currentMessage);
      }

      const data = await response.json();
      let aiResponse = Array.isArray(data) ? data[0].generated_text : data.generated_text;

      // If no response or empty response, provide a fallback
      if (!aiResponse || aiResponse.trim() === '') {
        return this.generateRuleBasedResponse(currentMessage);
      }

      // Check if the response suggests consulting a specialist
      const specialization = this.detectSpecialization(aiResponse);
      if (specialization) {
        const doctor = await User.findOne({
          role: 'doctor',
          'profile.specialization': specialization,
          'profile.availability': true
        }).select('_id profile.name profile.specialization');

        if (doctor) {
          return {
            message: `${aiResponse}\n\nBased on your symptoms, I recommend consulting a ${specialization} specialist. Would you like to chat with Dr. ${doctor.profile.name}?`,
            referToDoctor: true,
            doctorId: doctor._id
          };
        }
      }

      return { message: aiResponse };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.generateRuleBasedResponse(currentMessage);
    }
  }

  static generateRuleBasedResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Common symptoms and their responses
    const symptomResponses = {
      'headache': {
        message: 'Headaches can have various causes. Common remedies include:\n\n' +
                '1. Rest in a quiet, dark room\n' +
                '2. Stay hydrated\n' +
                '3. Take over-the-counter pain relievers\n' +
                '4. Apply a cold or warm compress\n\n' +
                'If your headache is severe, persistent, or accompanied by other symptoms like fever or vision changes, please consult a doctor.',
        specialization: 'neurology'
      },
      'fever': {
        message: 'For fever management:\n\n' +
                '1. Rest and stay hydrated\n' +
                '2. Take fever reducers like acetaminophen\n' +
                '3. Keep the room temperature comfortable\n' +
                '4. Monitor your temperature regularly\n\n' +
                'If your fever is above 103°F (39.4°C) or lasts more than 3 days, please seek medical attention.',
        specialization: 'general'
      },
      'cough': {
        message: 'For cough relief:\n\n' +
                '1. Stay hydrated\n' +
                '2. Use a humidifier\n' +
                '3. Try over-the-counter cough medicines\n' +
                '4. Avoid irritants like smoke\n\n' +
                'If your cough persists for more than 2 weeks or is accompanied by other symptoms, please consult a doctor.',
        specialization: 'pulmonology'
      },
      'stomach pain': {
        message: 'For stomach pain:\n\n' +
                '1. Rest and avoid solid foods initially\n' +
                '2. Stay hydrated with clear fluids\n' +
                '3. Try over-the-counter antacids\n' +
                '4. Avoid spicy or fatty foods\n\n' +
                'If the pain is severe, persistent, or accompanied by other symptoms, please seek medical attention.',
        specialization: 'gastroenterology'
      },
      'sore throat': {
        message: 'For sore throat relief:\n\n' +
                '1. Gargle with warm salt water\n' +
                '2. Stay hydrated with warm liquids\n' +
                '3. Use throat lozenges\n' +
                '4. Rest your voice\n\n' +
                'If your sore throat is severe, lasts more than a week, or is accompanied by difficulty breathing, please consult a doctor.',
        specialization: 'ent'
      },
      'runny nose': {
        message: 'For runny nose management:\n\n' +
                '1. Use saline nasal sprays\n' +
                '2. Stay hydrated\n' +
                '3. Use over-the-counter decongestants\n' +
                '4. Keep the air humidified\n\n' +
                'If symptoms persist for more than 10 days or are accompanied by severe symptoms, please consult a doctor.',
        specialization: 'ent'
      },
      'fatigue': {
        message: 'For managing fatigue:\n\n' +
                '1. Ensure adequate sleep (7-9 hours)\n' +
                '2. Stay hydrated\n' +
                '3. Eat balanced meals\n' +
                '4. Take short breaks during the day\n\n' +
                'If fatigue is severe, persistent, or affecting your daily activities, please consult a doctor.',
        specialization: 'general'
      },
      'muscle pain': {
        message: 'For muscle pain relief:\n\n' +
                '1. Rest the affected area\n' +
                '2. Apply ice or heat\n' +
                '3. Take over-the-counter pain relievers\n' +
                '4. Gentle stretching\n\n' +
                'If pain is severe, persistent, or accompanied by swelling, please consult a doctor.',
        specialization: 'orthopedics'
      },
      'dizziness': {
        message: 'For dizziness management:\n\n' +
                '1. Sit or lie down when feeling dizzy\n' +
                '2. Stay hydrated\n' +
                '3. Move slowly when changing positions\n' +
                '4. Avoid driving or operating machinery\n\n' +
                'If dizziness is severe, persistent, or accompanied by other symptoms, please seek medical attention immediately.',
        specialization: 'neurology'
      },
      'rash': {
        message: 'For rash management:\n\n' +
                '1. Keep the area clean and dry\n' +
                '2. Avoid scratching\n' +
                '3. Use gentle, fragrance-free products\n' +
                '4. Apply over-the-counter anti-itch creams\n\n' +
                'If the rash is severe, spreading, or accompanied by other symptoms, please consult a doctor.',
        specialization: 'dermatology'
      },
      'nausea': {
        message: 'For nausea relief:\n\n' +
                '1. Stay hydrated with small sips of water\n' +
                '2. Eat small, bland meals\n' +
                '3. Avoid strong smells\n' +
                '4. Rest in a comfortable position\n\n' +
                'If nausea is severe, persistent, or accompanied by other symptoms, please consult a doctor.',
        specialization: 'gastroenterology'
      },
      'back pain': {
        message: 'For back pain management:\n\n' +
                '1. Rest in a comfortable position\n' +
                '2. Apply ice or heat\n' +
                '3. Take over-the-counter pain relievers\n' +
                '4. Practice gentle stretching\n\n' +
                'If pain is severe, persistent, or accompanied by other symptoms, please consult a doctor.',
        specialization: 'orthopedics'
      }
    };

    // Check for multiple symptoms in the message
    const detectedSymptoms = [];
    for (const [symptom, response] of Object.entries(symptomResponses)) {
      if (lowerMessage.includes(symptom)) {
        detectedSymptoms.push({ symptom, response });
      }
    }

    if (detectedSymptoms.length > 0) {
      // If multiple symptoms are detected, provide a comprehensive response
      if (detectedSymptoms.length > 1) {
        const combinedMessage = `I notice you're experiencing multiple symptoms. Here's what you should know:\n\n` +
          detectedSymptoms.map(({ symptom, response }) => 
            `For your ${symptom}:\n${response.message}\n`
          ).join('\n') +
          `\nSince you're experiencing multiple symptoms, I recommend:\n` +
          `1. Monitor all symptoms closely\n` +
          `2. Keep track of when symptoms started and how they progress\n` +
          `3. Consider consulting a doctor, especially if symptoms worsen or persist\n` +
          `4. Get plenty of rest and stay hydrated\n\n` +
          `Would you like me to help you find a doctor who can address these symptoms?`;

        return { 
          message: combinedMessage,
          referToDoctor: true
        };
      }

      // If only one symptom is detected, return its specific response
      return { message: detectedSymptoms[0].response.message };
    }

    // Default response for unrecognized symptoms
    return {
      message: 'I understand you\'re not feeling well. To help you better, could you please:\n\n' +
              '1. Describe your symptoms in more detail\n' +
              '2. Mention how long you\'ve been experiencing them\n' +
              '3. Note any other symptoms you\'re having\n\n' +
              'This will help me provide more specific guidance. Remember, I\'m here to help, but I\'m not a replacement for professional medical advice.'
    };
  }

  static isEmergency(message) {
    const lowerMessage = message.toLowerCase();
    
    // Temperature detection
    const tempMatch = lowerMessage.match(/(\d+)\s*(?:degree|°|f|fahrenheit)/i);
    if (tempMatch) {
      const temp = parseInt(tempMatch[1]);
      if (temp >= 103) {
        return {
          isEmergency: true,
          type: 'high_fever',
          severity: 'critical',
          details: { temperature: temp }
        };
      }
    }

    // Intensity modifiers
    const intensityModifiers = {
      critical: ['very', 'extremely', 'severely', 'intensely', 'terribly', 'awfully', 'horribly', 'worst', 'extreme', 'severe', 'intense', 'terrible', 'awful', 'horrible'],
      urgent: ['moderately', 'somewhat', 'quite', 'fairly', 'rather', 'pretty', 'considerably', 'noticeably']
    };

    // Core symptoms that can be modified by intensity
    const coreSymptoms = {
      dizziness: {
        critical: ['dizzy', 'dizziness', 'vertigo', 'lightheaded', 'light-headed', 'unsteady', 'off balance'],
        urgent: ['slightly dizzy', 'mild dizziness', 'a bit dizzy']
      },
      pain: {
        critical: ['pain', 'ache', 'hurting', 'sore'],
        urgent: ['discomfort', 'tenderness', 'sensitivity']
      },
      breathing: {
        critical: ['breathing', 'breath', 'respiratory', 'lungs'],
        urgent: ['shortness of breath', 'breathing difficulty']
      },
      chest: {
        critical: ['chest', 'heart', 'cardiac'],
        urgent: ['chest discomfort', 'chest tightness']
      },
      head: {
        critical: ['head', 'headache', 'migraine'],
        urgent: ['head pressure', 'head discomfort']
      }
    };

    // Check for intensity-modified symptoms
    for (const [symptomType, symptoms] of Object.entries(coreSymptoms)) {
      // Check critical symptoms with intensity modifiers
      for (const symptom of symptoms.critical) {
        for (const modifier of intensityModifiers.critical) {
          if (lowerMessage.includes(`${modifier} ${symptom}`) || 
              lowerMessage.includes(`${symptom} ${modifier}`) ||
              lowerMessage.includes(`very ${symptom}`)) {
            return {
              isEmergency: true,
              type: symptomType,
              severity: 'critical',
              details: { symptom, modifier }
            };
          }
        }
      }

      // Check urgent symptoms with intensity modifiers
      for (const symptom of symptoms.urgent) {
        for (const modifier of intensityModifiers.urgent) {
          if (lowerMessage.includes(`${modifier} ${symptom}`) || 
              lowerMessage.includes(`${symptom} ${modifier}`)) {
            return {
              isEmergency: true,
              type: symptomType,
              severity: 'urgent',
              details: { symptom, modifier }
            };
          }
        }
      }
    }

    const emergencyKeywords = {
      critical: [
        'chest pain',
        'difficulty breathing',
        'severe bleeding',
        'unconscious',
        'seizure',
        'stroke',
        'heart attack',
        'severe head injury',
        'choking',
        'severe allergic reaction',
        'sudden severe pain',
        'sudden dizziness',
        'sudden confusion',
        'sudden severe headache',
        'sudden vision problems',
        'very high fever',
        'extremely high fever',
        'dangerous fever',
        'fever over 103',
        'fever above 103',
        'cannot breathe',
        'stopped breathing',
        'severe burn',
        'severe trauma',
        'severe bleeding',
        'severe injury',
        'severe pain',
        'severe allergic reaction',
        'severe swelling',
        'severe rash',
        'severe vomiting',
        'severe diarrhea',
        'severe dehydration',
        'severe weakness',
        'severe fatigue',
        'severe confusion',
        'severe dizziness',
        'severe headache',
        'severe neck pain',
        'severe back pain',
        'severe abdominal pain',
        'severe chest pain',
        'severe jaw pain',
        'severe arm pain',
        'severe leg pain',
        'severe joint pain',
        'severe muscle pain',
        'severe bone pain',
        'severe eye pain',
        'severe ear pain',
        'severe throat pain',
        'severe tooth pain'
      ],
      urgent: [
        'moderate bleeding',
        'moderate pain',
        'moderate fever',
        'moderate injury',
        'moderate burn',
        'moderate allergic reaction',
        'moderate swelling',
        'moderate rash',
        'moderate vomiting',
        'moderate diarrhea',
        'moderate dehydration',
        'moderate weakness',
        'moderate fatigue',
        'moderate confusion',
        'moderate dizziness',
        'moderate headache',
        'moderate neck pain',
        'moderate back pain',
        'moderate abdominal pain',
        'moderate chest pain',
        'moderate jaw pain',
        'moderate arm pain',
        'moderate leg pain',
        'moderate joint pain',
        'moderate muscle pain',
        'moderate bone pain',
        'moderate eye pain',
        'moderate ear pain',
        'moderate throat pain',
        'moderate tooth pain'
      ]
    };

    for (const keyword of emergencyKeywords.critical) {
      if (lowerMessage.includes(keyword)) {
        return {
          isEmergency: true,
          type: 'critical',
          severity: 'critical',
          details: { keyword }
        };
      }
    }

    for (const keyword of emergencyKeywords.urgent) {
      if (lowerMessage.includes(keyword)) {
        return {
          isEmergency: true,
          type: 'urgent',
          severity: 'urgent',
          details: { keyword }
        };
      }
    }

    const emergencyPhrases = {
      critical: [
        'emergency',
        'urgent',
        'immediate',
        'severe',
        'critical',
        'dangerous',
        'life threatening',
        'cannot',
        'unable to',
        'extreme',
        'worst',
        'terrible',
        'horrible',
        'awful',
        'intense'
      ],
      urgent: [
        'moderate',
        'concerning',
        'worried',
        'anxious',
        'uncomfortable',
        'bothersome',
        'troublesome',
        'distressing',
        'disturbing',
        'alarming'
      ]
    };

    const medicalTerms = [
      'fever', 'pain', 'bleeding', 'breathing', 'chest', 'head',
      'neck', 'back', 'abdomen', 'arm', 'leg', 'joint', 'muscle',
      'bone', 'eye', 'ear', 'throat', 'tooth', 'skin', 'rash',
      'swelling', 'vomiting', 'diarrhea', 'dehydration', 'weakness',
      'fatigue', 'confusion', 'dizziness', 'headache', 'nausea',
      'cough', 'sore throat', 'runny nose', 'congestion', 'sneezing',
      'allergy', 'allergic', 'reaction', 'burn', 'injury', 'trauma',
      'wound', 'cut', 'bruise', 'sprain', 'strain', 'fracture',
      'break', 'dislocation', 'infection', 'inflamed', 'inflammation'
    ];

    for (const phrase of emergencyPhrases.critical) {
      if (lowerMessage.includes(phrase)) {
        for (const term of medicalTerms) {
          if (lowerMessage.includes(term)) {
            return {
              isEmergency: true,
              type: 'critical',
              severity: 'critical',
              details: { phrase, term }
            };
          }
        }
      }
    }

    for (const phrase of emergencyPhrases.urgent) {
      if (lowerMessage.includes(phrase)) {
        for (const term of medicalTerms) {
          if (lowerMessage.includes(term)) {
            return {
              isEmergency: true,
              type: 'urgent',
              severity: 'urgent',
              details: { phrase, term }
            };
          }
        }
      }
    }

    return { isEmergency: false };
  }

  static detectSpecialization(message) {
    const specializations = {
      'cardiology': ['heart', 'chest pain', 'cardiovascular'],
      'neurology': ['brain', 'headache', 'seizure', 'stroke'],
      'dermatology': ['skin', 'rash', 'acne'],
      'pediatrics': ['child', 'baby', 'infant'],
      'psychiatry': ['mental', 'anxiety', 'depression'],
      'orthopedics': ['bone', 'joint', 'muscle'],
      'gynecology': ['women', 'pregnancy', 'menstrual'],
      'ophthalmology': ['eye', 'vision'],
      'ent': ['ear', 'nose', 'throat'],
      'gastroenterology': ['stomach', 'digestive', 'intestine'],
      'pulmonology': ['lung', 'breathing', 'respiratory'],
      'endocrinology': ['diabetes', 'thyroid', 'hormone'],
      'oncology': ['cancer', 'tumor']
    };

    for (const [specialization, keywords] of Object.entries(specializations)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        return specialization;
      }
    }

    return null;
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
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Button,
  CircularProgress
} from '@mui/material';
import { Send as SendIcon, SmartToy as BotIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useFeedback } from '../contexts/FeedbackContext';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loadingChatbotResponse, setLoadingChatbotResponse] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/chatbot/history`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      showFeedback('Could not load chatbot history.', 'error');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setLoadingChatbotResponse(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chatbot/message`, {
        message: userMessage.content
      });

       if (response.data) {
         setMessages(prev => [...prev, 
           { sender: 'bot', content: response.data.message, timestamp: new Date() }
         ]);

         if (response.data.referToDoctor) {
           setMessages(prev => [...prev, {
             sender: 'bot',
             content: 'Would you like to start a chat with the recommended doctor?',
             action: 'refer',
             doctorId: response.data.doctorId,
             timestamp: new Date()
           }]);
         }
       }

    } catch (error) {
      console.error('Error sending message to chatbot:', error);
       showFeedback(error.response?.data?.message || 'Failed to get response from chatbot.', 'error');
    }

    setLoadingChatbotResponse(false);
  };

  const handleDoctorReferral = async (doctorId) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chats`, { doctorId });
      navigate(`/chat/${response.data._id}`);
      showFeedback('Chat created successfully!', 'success');
    } catch (error) {
      console.error('Error creating chat:', error);
      showFeedback(error.response?.data?.message || 'Failed to create chat with doctor.', 'error');
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000
      }}
    >
      {!isOpen ? (
        <IconButton
          color="primary"
          onClick={() => setIsOpen(true)}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            borderRadius: '50%',
             width: 60,
             height: 60
          }}
        >
          <BotIcon fontSize="large" />
        </IconButton>
      ) : (
        <Paper
          elevation={6}
          sx={{
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
             borderRadius: 3
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BotIcon sx={{ mr: 1 }} />
              <Typography variant="h6">AskaDoc Assistant</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              ×
            </IconButton>
          </Box>

          {/* Messages */}
          <List
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: 'background.default',
               scrollBehavior: 'smooth'
            }}
          >
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1,
                   px: 0
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%' }}>
                    {msg.sender === 'bot' && (
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 30, height: 30 }}>
                            <BotIcon sx={{ fontSize: 18 }}/>
                        </Avatar>
                    )}
                    <Paper
                      sx={{
                        p: 1.5,
                         borderRadius: 3,
                        maxWidth: '100%',
                         wordBreak: 'break-word',
                         bgcolor: msg.sender === 'user' ? '#dcf8c6' : theme => theme.palette.grey[200],
                         color: theme => theme.palette.text.primary,
                         boxShadow: 1
                      }}
                    >
                      <ListItemText
                        primary={<Typography variant="body2" color="inherit">{msg.content}</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>{new Date(msg.timestamp).toLocaleTimeString()}</Typography>}
                      />
                      {msg.action === 'refer' && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleDoctorReferral(msg.doctorId)}
                          sx={{ mt: 1, borderRadius: 3, fontWeight: 600 }}
                        >
                          Start Chat with Doctor
                        </Button>
                      )}
                    </Paper>
                    {msg.sender === 'user' && (
                        <Avatar sx={{ bgcolor: 'primary.main', ml: 1, width: 30, height: 30 }}>
                            U
                        </Avatar>
                    )}
                </Box>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
             {loadingChatbotResponse && (
                 <ListItem sx={{justifyContent: 'flex-start', mb: 1, px: 0}}>
                      <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '80%' }}>
                         <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 30, height: 30 }}>
                             <BotIcon sx={{ fontSize: 18 }}/>
                         </Avatar>
                         <CircularProgress size={20} />
                      </Box>
                 </ListItem>
             )}
          </List>

          {/* Message Input */}
          <Box
            component="form"
            onSubmit={handleSend}
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
               borderBottomLeftRadius: 12,
               borderBottomRightRadius: 12
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                variant="outlined"
                disabled={loadingChatbotResponse}
                sx={{ '& fieldset': { borderRadius: 3 } }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                endIcon={loadingChatbotResponse ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                disabled={!input.trim() || loadingChatbotResponse}
                sx={{ borderRadius: 3, px: 3, fontWeight: 600 }}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default Chatbot; 
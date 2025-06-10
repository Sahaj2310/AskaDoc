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
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Send as SendIcon, 
  SmartToy as BotIcon, 
  Close as CloseIcon, 
  Info as InfoIcon, 
  Chat as ChatIcon,
  Emergency as EmergencyIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useFeedback } from '../contexts/FeedbackContext';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <Typography variant="body1">Error rendering message</Typography>;
    }
    return this.props.children;
  }
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();
  const { user, token } = useAuth();

  // Configure axios with auth token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    if (isOpen && user) {
      fetchChatHistory();
    }
  }, [isOpen, user]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/chatbot/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      if (error.response?.status === 401) {
        showFeedback('Please log in to use the chatbot.', 'error');
        setIsOpen(false);
      } else {
        showFeedback('Could not load chatbot history.', 'error');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { sender: 'user', content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/chatbot/message`,
        { message: userMessage.content },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        const botMessage = {
          sender: 'bot',
          content: response.data.message,
          timestamp: new Date(),
          isEmergency: response.data.isEmergency
        };
        setMessages(prev => [...prev, botMessage]);

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
      if (error.response?.status === 401) {
        showFeedback('Please log in to use the chatbot.', 'error');
        setIsOpen(false);
      } else {
        setError(error.response?.data?.message || 'Failed to get response from chatbot.');
        showFeedback(error.response?.data?.message || 'Failed to get response from chatbot.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorReferral = async (doctorId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/chats`,
        { doctorId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      navigate(`/chat/${response.data._id}`);
      showFeedback('Chat created successfully!', 'success');
    } catch (error) {
      console.error('Error creating chat:', error);
      showFeedback(error.response?.data?.message || 'Failed to create chat with doctor.', 'error');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleErrorClose = () => {
    setError(null);
  };

  const renderMessage = (content, isEmergency = false) => {
    if (typeof content !== 'string') {
      return <Typography variant="body1">{String(content)}</Typography>;
    }
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        {isEmergency && (
          <EmergencyIcon color="error" sx={{ mt: 0.5 }} />
        )}
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {content}
        </Typography>
      </Box>
    );
  };

  if (!isOpen) {
    return (
      <Zoom in={true}>
        <Tooltip title="Chat with AI Assistant">
          <IconButton
            color="primary"
            onClick={() => {
              if (!user) {
                showFeedback('Please log in to use the chatbot.', 'error');
                navigate('/login');
                return;
              }
              setIsOpen(true);
            }}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              width: 60,
              height: 60,
              backgroundColor: 'primary.main',
              color: 'white',
              boxShadow: 3,
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'scale(1.1)',
                transition: 'transform 0.2s ease-in-out'
              },
            }}
          >
            <ChatIcon />
          </IconButton>
        </Tooltip>
      </Zoom>
    );
  }

  return (
    <Fade in={true}>
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 380,
          height: 600,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BotIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>AI Assistant</Typography>
            <Tooltip title="This AI assistant provides general medical information and guidance. For medical emergencies, please call emergency services immediately.">
              <InfoIcon fontSize="small" sx={{ opacity: 0.8 }} />
            </Tooltip>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: '#f5f5f5'
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: 1,
              }}
            >
              {msg.sender === 'bot' && (
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32,
                    boxShadow: 1
                  }}
                >
                  <BotIcon fontSize="small" />
                </Avatar>
              )}
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  maxWidth: '80%',
                  backgroundColor: msg.sender === 'user' ? 'primary.main' : 'white',
                  color: msg.sender === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  boxShadow: msg.isEmergency ? '0 0 0 2px #ff1744' : 1
                }}
              >
                {renderMessage(msg.content, msg.isEmergency)}
                {msg.action === 'refer' && (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<HospitalIcon />}
                    onClick={() => handleDoctorReferral(msg.doctorId)}
                    sx={{ mt: 1 }}
                  >
                    Start Chat with Doctor
                  </Button>
                )}
              </Paper>
              {msg.sender === 'user' && (
                <Avatar
                  sx={{
                    bgcolor: 'secondary.main',
                    width: 32,
                    height: 32,
                    boxShadow: 1
                  }}
                >
                  {user?.profile?.name?.[0] || 'U'}
                </Avatar>
              )}
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 32,
                  height: 32,
                  boxShadow: 1
                }}
              >
                <BotIcon fontSize="small" />
              </Avatar>
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  borderRadius: 2
                }}
              >
                <CircularProgress size={20} />
                <Typography>Thinking...</Typography>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 2,
            borderTop: '1px solid rgba(0,0,0,0.1)',
            backgroundColor: 'white',
            display: 'flex',
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f5f5f5'
              }
            }}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={loading || !message.trim()}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark'
              },
              '&.Mui-disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleErrorClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Fade>
  );
};

export default Chatbot; 
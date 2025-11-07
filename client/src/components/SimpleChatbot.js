import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  IconButton, 
  Typography, 
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip
} from '@mui/material';
import { 
  Send as SendIcon, 
  Close as CloseIcon,
  Info as InfoIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ChatMessage from './ChatMessage';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Typography color="error">Something went wrong. Please try again.</Typography>;
    }
    return this.props.children;
  }
}

// Message Content Component
const MessageContent = ({ content }) => {
  if (typeof content !== 'string') {
    return <Typography>Invalid message content</Typography>;
  }

  return (
    <ErrorBoundary>
      <Typography component="div" sx={{ '& p': { margin: 0 } }}>
        {content}
      </Typography>
    </ErrorBoundary>
  );
};

const SimpleChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chatbot/message`, {
        message: userMessage
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Tooltip title="Chat with AI Assistant">
        <IconButton
          onClick={() => {
            if (!user) {
              setError('Please log in to use the chatbot.');
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
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          <ChatIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 350,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">AI Assistant</Typography>
          <Tooltip title="This AI assistant provides general medical information and guidance. For medical emergencies, please call emergency services immediately.">
            <InfoIcon fontSize="small" />
          </Tooltip>
        </Box>
        <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={loading || !message.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default SimpleChatbot; 
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';

function Chat() {
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { chatId } = useParams();
  const { user } = useAuth();
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    setLoading(true);
    setError(null);

    socketRef.current = io(process.env.REACT_APP_API_URL);

    if (chatId) {
      socketRef.current.emit('join', chatId);
    }

    socketRef.current.on('receiveMessage', (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data]);
      }
    });

    fetchChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatId]);

  const fetchChat = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/chats/${chatId}`
      );
      setChat(response.data);
      setMessages(response.data.messages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chat:', error);
      setError('Could not load chat. Please try again later.');
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !chat) return;

    const messageData = {
      chatId: chat._id,
      content: message,
      sender: user.id,
      receiverId: user.role === 'doctor' ? chat.patient._id : chat.doctor._id,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, messageData]);
    setMessage('');

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/chats/${chatId}/messages`,
        { content: messageData.content }
      );

      socketRef.current.emit('sendMessage', messageData);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading chat...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!chat) return null;

  const otherUser = user.role === 'doctor' ? chat.patient : chat.doctor;

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 6, md: 8 }, mb: { xs: 6, md: 8 } }}>
      <Paper elevation={6} sx={{ height: '80vh', display: 'flex', flexDirection: 'column', borderRadius: 3, bgcolor: 'background.paper' }}>
        <Box sx={{ p: 2, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2, width: 40, height: 40 }}>{otherUser.username[0].toUpperCase()}</Avatar>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.primary.contrastText }}>
              {otherUser.profile?.name || otherUser.username}
            </Typography>
            {user.role === 'doctor' && (
              <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                Patient: {otherUser.username}
              </Typography>
            )}
            {otherUser.profile?.specialization && user.role === 'patient' && (
              <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                {otherUser.profile.specialization}
              </Typography>
            )}
          </Box>
        </Box>

        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default', scrollBehavior: 'smooth' }}>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent: msg.sender === user.id ? 'flex-end' : 'flex-start',
                mb: 1,
                px: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%' }}>
                {msg.sender !== user.id && otherUser.username && (
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 1, width: 30, height: 30 }}>
                    {otherUser.username[0].toUpperCase()}
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                    bgcolor: msg.sender === user.id ? theme.palette.primary.light : theme.palette.grey[300],
                    color: theme.palette.text.primary,
                    boxShadow: 1,
                  }}
                >
                  <ListItemText
                    primary={<Typography variant="body2" color="inherit">{msg.content}</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>{new Date(msg.timestamp).toLocaleTimeString()}</Typography>}
                  />
                </Paper>
                {msg.sender === user.id && user.username && (
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, ml: 1, width: 30, height: 30 }}>
                    {user.username[0].toUpperCase()}
                  </Avatar>
                )}
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>

        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              variant="outlined"
              sx={{ '& fieldset': { borderRadius: 3 } }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              disabled={!message.trim()}
              sx={{ borderRadius: 3, px: 3, fontWeight: 600 }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Chat; 
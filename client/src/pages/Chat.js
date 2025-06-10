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
        <Box sx={{ 
          p: 2, 
          bgcolor: theme.palette.primary.main, 
          color: theme.palette.primary.contrastText, 
          borderTopLeftRadius: 12, 
          borderTopRightRadius: 12, 
          display: 'flex', 
          alignItems: 'center',
          boxShadow: theme.shadows[3]
        }}>
          <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2, width: 48, height: 48 }}>{otherUser.username[0].toUpperCase()}</Avatar>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.primary.contrastText, fontWeight: 600 }}>
              {otherUser.profile?.name || otherUser.username}
            </Typography>
            {user.role === 'doctor' && (
              <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText, opacity: 0.9 }}>
                Patient: {otherUser.username}
              </Typography>
            )}
            {otherUser.profile?.specialization && user.role === 'patient' && (
              <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText, opacity: 0.9 }}>
                {otherUser.profile.specialization}
              </Typography>
            )}
          </Box>
        </Box>

        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default', scrollBehavior: 'smooth' }}>
          {messages.map((msg, index) => {
            const isCurrentUser = msg.sender === user.id;
            const senderName = isCurrentUser ? 'You' : (otherUser.profile?.name || otherUser.username);
            const senderAvatar = isCurrentUser ? user.username[0].toUpperCase() : otherUser.username[0].toUpperCase();

            return (
              <ListItem
                key={index}
                sx={{
                  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                  mb: 1.5,
                  px: 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-end', maxWidth: '80%' }}>
                  {!isCurrentUser && (
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 1, width: 32, height: 32, fontSize: '0.8rem' }}>
                      {senderAvatar}
                    </Avatar>
                  )}
                  <Paper
                    sx={{
                      p: 1.5,
                      borderRadius: isCurrentUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                      maxWidth: '100%',
                      wordBreak: 'break-word',
                      bgcolor: isCurrentUser ? theme.palette.primary.light : theme.palette.grey[200],
                      color: theme.palette.text.primary,
                      boxShadow: theme.shadows[1],
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                      {senderName}
                    </Typography>
                    <Typography variant="body2" color="inherit">
                      {msg.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, textAlign: isCurrentUser ? 'right' : 'left' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Paper>
                  {isCurrentUser && (
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, ml: 1, width: 32, height: 32, fontSize: '0.8rem' }}>
                      {senderAvatar}
                    </Avatar>
                  )}
                </Box>
              </ListItem>
            );
          })}
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
              size="medium"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              variant="outlined"
              sx={{ '& fieldset': { borderRadius: 30 } }}
              InputProps={{
                endAdornment: (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    disabled={!message.trim()}
                    sx={{ borderRadius: 30, px: 3, fontWeight: 600, minWidth: 'auto' }}
                  >
                    Send
                  </Button>
                ),
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Chat; 
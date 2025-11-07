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
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Collapse
} from '@mui/material';
import { Send as SendIcon, MedicalInformation as MedicalInformationIcon, Close as CloseIcon } from '@mui/icons-material';
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

  // State for patient medical history
  const [patientMedicalHistory, setPatientMedicalHistory] = useState(null);
  const [showMedicalHistoryDialog, setShowMedicalHistoryDialog] = useState(false);
  const [medicalHistoryLoading, setMedicalHistoryLoading] = useState(false);
  const [medicalHistoryError, setMedicalHistoryError] = useState(null);

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

  const fetchPatientMedicalHistory = async (patientId) => {
    setMedicalHistoryLoading(true);
    setMedicalHistoryError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/patient/${patientId}/medical-history`);
      setPatientMedicalHistory(response.data.medicalHistory);
      setShowMedicalHistoryDialog(true);
    } catch (error) {
      console.error('Error fetching patient medical history:', error);
      setMedicalHistoryError(error.response?.data?.message || 'Failed to load patient medical history.');
    } finally {
      setMedicalHistoryLoading(false);
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
          <Box sx={{ flexGrow: 1 }}>
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
          {user.role === 'doctor' && chat.patient && (
            <Tooltip title="View Patient Medical History">
              <IconButton 
                color="inherit" 
                onClick={() => {
                  console.log('Medical History button clicked!');
                  console.log('medicalHistoryLoading state:', medicalHistoryLoading);
                  console.log('Chat patient object:', chat.patient);
                  if (chat.patient && chat.patient._id) {
                    console.log('Attempting to fetch medical history for patient ID:', chat.patient._id);
                    fetchPatientMedicalHistory(chat.patient._id);
                  } else {
                    console.error('Chat patient ID is undefined or null.', chat.patient);
                  }
                }}
                disabled={medicalHistoryLoading}
              >
                <MedicalInformationIcon />
              </IconButton>
            </Tooltip>
          )}
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
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
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
      {/* Medical History Dialog */}
      <Dialog
        open={showMedicalHistoryDialog}
        onClose={() => setShowMedicalHistoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Patient Medical History
          <IconButton
            aria-label="close"
            onClick={() => setShowMedicalHistoryDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {medicalHistoryLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading medical history...</Typography>
            </Box>
          ) : medicalHistoryError ? (
            <Alert severity="error">{medicalHistoryError}</Alert>
          ) : patientMedicalHistory ? (
            <Box>
              <Typography variant="h6" gutterBottom>Conditions</Typography>
              <List dense>
                {patientMedicalHistory.conditions && patientMedicalHistory.conditions.length > 0 ? (
                  patientMedicalHistory.conditions.map((condition, index) => (
                    <ListItem key={index}><ListItemText primary={condition} /></ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No conditions recorded.</Typography>
                )}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Allergies</Typography>
              <List dense>
                {patientMedicalHistory.allergies && patientMedicalHistory.allergies.length > 0 ? (
                  patientMedicalHistory.allergies.map((allergy, index) => (
                    <ListItem key={index}><ListItemText primary={allergy} /></ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No allergies recorded.</Typography>
                )}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Prescriptions</Typography>
              <List dense>
                {patientMedicalHistory.prescriptions && patientMedicalHistory.prescriptions.length > 0 ? (
                  patientMedicalHistory.prescriptions.map((prescription, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={prescription.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Dosage: {prescription.dosage}, Frequency: {prescription.frequency}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              Start: {prescription.startDate ? new Date(prescription.startDate).toLocaleDateString() : 'N/A'} | End: {prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No prescriptions recorded.</Typography>
                )}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Documents</Typography>
              <List dense>
                {patientMedicalHistory.documents && patientMedicalHistory.documents.length > 0 ? (
                  patientMedicalHistory.documents.map((doc, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={doc.fileName}
                        secondary={
                          <Typography component="span" variant="body2" color="text.secondary">
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View Document</a> | Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No documents recorded.</Typography>
                )}
              </List>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">No medical history available for this patient.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMedicalHistoryDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Chat; 
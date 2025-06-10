import React from 'react';
import { Box, Paper, Typography, Avatar } from '@mui/material';

const ChatMessage = ({ message }) => {
  const { role, content } = message;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
        gap: 1,
        mb: 2
      }}
    >
      {role === 'assistant' && (
        <Avatar sx={{ bgcolor: 'primary.main' }}>AI</Avatar>
      )}
      <Paper
        sx={{
          p: 1.5,
          maxWidth: '80%',
          bgcolor: role === 'user' ? 'primary.light' : 'grey.100'
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {content}
        </Typography>
      </Paper>
      {role === 'user' && (
        <Avatar sx={{ bgcolor: 'secondary.main' }}>U</Avatar>
      )}
    </Box>
  );
};

export default ChatMessage; 
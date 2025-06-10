import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FeedbackProvider } from './contexts/FeedbackContext';

// Components
import Navbar from './components/Navbar';
import SimpleChatbot from './components/SimpleChatbot';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorList from './pages/DoctorList';
import BookAppointment from './pages/BookAppointment';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';
import PatientRoute from './components/PatientRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <FeedbackProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/doctors"
                element={
                  <ProtectedRoute>
                    <DoctorList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctors/:doctorId/book"
                element={
                  <PatientRoute>
                    <BookAppointment />
                  </PatientRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:chatId"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <SimpleChatbot />
          </Router>
        </FeedbackProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 
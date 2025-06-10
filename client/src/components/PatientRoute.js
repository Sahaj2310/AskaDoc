import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PatientRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === 'patient' ? children : <Navigate to="/profile" />;
};

export default PatientRoute; 
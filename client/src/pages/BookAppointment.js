import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';

function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showFeedback } = useFeedback();

  const [doctor, setDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bookingReason, setBookingReason] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'patient') {
      navigate('/login');
      return;
    }

    const fetchDoctorAndSlots = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch doctor details (this endpoint should still be correct)
        const doctorResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/profile/${doctorId}`
        );
        setDoctor(doctorResponse.data);
        console.log('Fetched doctor details:', doctorResponse.data);

        // Fetch available slots (UPDATED ENDPOINT)
        const slotsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/doctors/${doctorId}/availability` // <--- Ensure this line uses '/api/users'
        );
        setAvailableSlots(slotsResponse.data);
        console.log('Fetched available slots:', slotsResponse.data);

      } catch (err) {
        console.error('Error in fetchDoctorAndSlots:', err.response?.data || err.message || err);
        setError(err.response?.data?.message || 'Failed to fetch doctor details or available slots');
        showFeedback(err.response?.data?.message || 'Failed to fetch doctor details or available slots', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorAndSlots();
    }
  }, [doctorId, user, navigate, showFeedback]);

  const handleBookAppointment = async () => {
    if (!selectedSlot || !bookingReason.trim()) return;

    setBookingLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/appointments/book`,
        {
          doctorId: doctor._id,
          time: selectedSlot.time,
          reason: bookingReason
        }
      );

      showFeedback(response.data.message, 'success');
      setConfirmDialogOpen(false);
      navigate('/profile'); // Redirect to profile page after successful booking
    } catch (error) {
      console.error('Error booking appointment:', error);
      showFeedback(error.response?.data?.message || 'Failed to book appointment', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading doctor details and available slots...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography>Doctor not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Book Appointment with Dr. {doctor.profile?.name}
        </Typography>

        <Grid container spacing={4}>
          {/* Doctor Information */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                component="img"
                src="/illustrations/doctor1.svg"
                alt={`Dr. ${doctor.profile?.name}`}
                sx={{ width: '100%', maxWidth: 200, mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Dr. {doctor.profile?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {doctor.profile?.specialization}
              </Typography>
              <Typography variant="body1" color="primary.main" sx={{ fontWeight: 600 }}>
                Consultation Fee: ₹{doctor.profile?.fees}
              </Typography>
            </Box>
          </Grid>

          {/* Available Slots */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Available Time Slots
            </Typography>
            
            {availableSlots.length > 0 ? (
              <Grid container spacing={2}>
                {availableSlots.map((slot) => (
                  <Grid item xs={12} sm={6} key={slot._id}>
                    <Button
                      variant={selectedSlot?._id === slot._id ? 'contained' : 'outlined'}
                      color="primary"
                      fullWidth
                      onClick={() => setSelectedSlot(slot)}
                      sx={{
                        py: 2,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: 'none'
                      }}
                    >
                      {new Date(slot.time).toLocaleString()}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No available slots for this doctor.
              </Typography>
            )}

            {selectedSlot && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Appointment Details
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Reason for Visit"
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={!bookingReason.trim()}
                  sx={{ py: 1.5, fontWeight: 600, borderRadius: 3 }}
                >
                  Confirm Booking
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Appointment</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Please confirm your appointment with Dr. {doctor.profile?.name}:
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Date & Time: {selectedSlot && new Date(selectedSlot.time).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Consultation Fee: ₹{doctor.profile?.fees}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Reason for Visit: {bookingReason}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            disabled={bookingLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBookAppointment}
            variant="contained"
            color="primary"
            disabled={bookingLoading}
          >
            {bookingLoading ? <CircularProgress size={24} /> : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default BookAppointment; 
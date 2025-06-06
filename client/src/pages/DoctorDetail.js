import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  Grid,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material';
import { useFeedback } from '../contexts/FeedbackContext';
import { useAuth } from '../contexts/AuthContext';

function DoctorDetail() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();
  const { user } = useAuth(); // To potentially show/hide chat button

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for appointment booking (Patient view)
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/doctors/${doctorId}`);
        setDoctor(response.data);
        setLoading(false); // Set loading to false after doctor data is fetched

        // Fetch availability if user is a patient and viewing a doctor's profile
        if (user?.role === 'patient' && response.data?.role === 'doctor') {
            setSlotsLoading(true);
            try {
                const availabilityResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments/doctors/${doctorId}/availability`);
                setAvailableSlots(availabilityResponse.data);
            } catch (availabilityError) {
                console.error('Error fetching doctor availability:', availabilityError);
                showFeedback('Failed to fetch doctor availability.', 'error');
            } finally {
                setSlotsLoading(false);
            }
        }

      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError(err.response?.data?.message || 'Failed to fetch doctor details');
        showFeedback(err.response?.data?.message || 'Failed to fetch doctor details', 'error');
        setLoading(false); // Set loading to false on error
      }
    };

    if (doctorId) {
      fetchDoctor();
    } else {
      setError('Doctor ID not provided.');
      setLoading(false);
    }

  }, [doctorId, showFeedback, user?.role]); // Depend on doctorId, showFeedback, and user.role

  const handleBookSlot = async () => {
    if (!selectedSlot || !doctor) return;

    setBookingLoading(true);
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/appointments/book`, {
            doctorId: doctor._id,
            time: selectedSlot.time,
        });
        showFeedback(response.data.message, 'success');
        // Optionally, navigate to a confirmation page or update the UI
        // For now, clear selected slot and re-fetch availability to reflect the booking
        setSelectedSlot(null);
        // Re-fetch availability to update the list
         const availabilityResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments/doctors/${doctorId}/availability`);
         setAvailableSlots(availabilityResponse.data);

    } catch (error) {
        console.error('Error booking appointment:', error);
        showFeedback(error.response?.data?.message || 'Failed to book appointment.', 'error');
    } finally {
        setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading doctor details...</Typography>
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

  // Placeholder image logic (you can improve this)
  const doctorImage = '/illustrations/doctor1.svg'; // Use a default or fetch from backend if available

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              alt={`Dr. ${doctor.profile?.name}`}
              src={doctorImage} // Use actual doctor image if available
              sx={{
                width: 150,
                height: 150,
                border: '3px solid #4ecb8c'
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Dr. {doctor.profile?.name || 'Unknown'}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {doctor.profile?.specialization || 'General Medicine'}
              </Typography>
              <Typography variant="body1" paragraph>
                Experience: {doctor.profile?.experience || 0} years
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                Consultation Fee: ${doctor.profile?.fees || 0}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Appointment Booking Section (Visible for Patients) */}
        {user?.role === 'patient' && (
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Book an Appointment
                </Typography>
                {slotsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                         <CircularProgress size={24} />
                         <Typography sx={{ml: 2}}>Loading available slots...</Typography>
                    </Box>
                ) : availableSlots.length > 0 ? (
                    <Box>
                         <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>Select an available slot:</Typography>
                         <Grid container spacing={2}>
                            {availableSlots.map(slot => (
                                <Grid item key={slot._id}>
                                    <Button
                                        variant={selectedSlot?._id === slot._id ? 'contained' : 'outlined'}
                                        color="primary"
                                        onClick={() => setSelectedSlot(slot)}
                                        sx={{
                                            borderRadius: 2,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {new Date(slot.time).toLocaleString()}
                                    </Button>
                                </Grid>
                            ))}
                         </Grid>
                        <Button
                            variant="contained"
                            color="secondary"
                            disabled={!selectedSlot || bookingLoading}
                            onClick={handleBookSlot}
                            sx={{ mt: 3, py: 1.5, fontWeight: 600, borderRadius: 3 }}
                        >
                            {bookingLoading ? <CircularProgress size={24} color="inherit" /> : 'Book Selected Slot'}
                        </Button>
                    </Box>
                ) : (
                    <Typography variant="body1" color="text.secondary">No available slots for this doctor.</Typography>
                )}
            </Box>
        )}

        {/* Reviews Section */}
        {doctor.profile?.reviews && doctor.profile.reviews.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Reviews ({doctor.profile.reviews.length})
            </Typography>
            <List>
              {doctor.profile.reviews.map((review, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={review.patient?.username || 'Anonymous Patient'}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary">
                            {review.comment}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < doctor.profile.reviews.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
         {/* Add Review form section here if the logged-in user is a patient and hasn't reviewed this doctor */}

      </Paper>
    </Container>
  );
}

export default DoctorDetail; 
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
  Button,
  Chip,
  Card,
  CardContent,
  Stack,
  alpha
} from '@mui/material';
import {
  School as SchoolIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useFeedback } from '../contexts/FeedbackContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';

function DoctorDetail() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();
  const { user } = useAuth();
  const theme = useTheme();

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

  // Placeholder image logic
  const doctorImage = '/illustrations/doctor1.svg';
  const doctorImages = [
    '/illustrations/doctor1.svg',
    '/illustrations/doctor2.svg',
    '/illustrations/doctor3.svg',
    '/illustrations/doctor4.svg',
    '/illustrations/doctor5.svg',
  ];
  const imageIndex = doctorId ? parseInt(doctorId.slice(-1)) % doctorImages.length : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Main Doctor Info Card */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              alt={`Dr. ${doctor.profile?.name}`}
              src={doctorImages[imageIndex]}
              sx={{
                width: 200,
                height: 200,
                border: `4px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                boxShadow: 4,
                mb: 2
              }}
            />
            {doctor.profile?.rating > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <StarIcon sx={{ color: '#FFB800', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {doctor.profile.rating.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({doctor.profile.reviews?.length || 0} reviews)
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={8}>
            <Box>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                Dr. {doctor.profile?.name || doctor.username || 'Unknown'}
              </Typography>
              <Chip
                label={doctor.profile?.specialization || 'General Medicine'}
                color="primary"
                sx={{ mb: 3, fontSize: '1rem', py: 2.5, px: 1 }}
              />
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <WorkIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Experience</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {doctor.profile?.experience || 0} years
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <MoneyIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Consultation Fee</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        ₹{doctor.profile?.fees || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                {doctor.profile?.email && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <EmailIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {doctor.profile.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {doctor.profile?.phone && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PhoneIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {doctor.profile.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {doctor.profile?.address && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                      <LocationIcon color="primary" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Address</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {doctor.profile.address}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Additional Information Cards */}
      <Grid container spacing={3}>
        {/* Education Section */}
        {doctor.profile?.education && (
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SchoolIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Education
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {doctor.profile.education}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Languages Section */}
        {doctor.profile?.languages && doctor.profile.languages.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LanguageIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Languages Spoken
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {doctor.profile.languages.map((language, index) => (
                    <Chip
                      key={index}
                      label={language}
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* About Section */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                About Dr. {doctor.profile?.name || doctor.username}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {doctor.profile?.specialization && (
                  <>
                    Dr. {doctor.profile.name || doctor.username} is a highly qualified{' '}
                    <strong>{doctor.profile.specialization}</strong> specialist with{' '}
                    <strong>{doctor.profile.experience || 0} years</strong> of experience in the field.
                    {doctor.profile.education && ` They completed their education at ${doctor.profile.education}.`}
                    {doctor.profile.languages && doctor.profile.languages.length > 0 && (
                      <> They are fluent in {doctor.profile.languages.join(', ')}.</>
                    )}
                    {' '}Dr. {doctor.profile.name || doctor.username} is committed to providing the highest quality
                    healthcare services and ensuring patient satisfaction.
                  </>
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

        {/* Appointment Booking Section (Visible for Patients) */}
        {user?.role === 'patient' && (
            <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <TimeIcon color="primary" />
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Book an Appointment
                        </Typography>
                    </Box>
                    {slotsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                            <CircularProgress size={24} />
                            <Typography sx={{ ml: 2 }}>Loading available slots...</Typography>
                        </Box>
                    ) : availableSlots.length > 0 ? (
                        <Box>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                Select an available time slot:
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                {availableSlots.map(slot => (
                                    <Grid item key={slot._id}>
                                        <Button
                                            variant={selectedSlot?._id === slot._id ? 'contained' : 'outlined'}
                                            color="primary"
                                            onClick={() => setSelectedSlot(slot)}
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 3,
                                                py: 1.5,
                                                borderWidth: selectedSlot?._id === slot._id ? 0 : 2,
                                            }}
                                        >
                                            {new Date(slot.time).toLocaleString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={!selectedSlot || bookingLoading}
                                onClick={handleBookSlot}
                                sx={{ 
                                    mt: 2, 
                                    py: 1.5, 
                                    px: 4,
                                    fontWeight: 600, 
                                    borderRadius: 3,
                                    boxShadow: 3,
                                    '&:hover': {
                                        boxShadow: 6,
                                    }
                                }}
                            >
                                {bookingLoading ? <CircularProgress size={24} color="inherit" /> : 'Book Selected Slot'}
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                No available slots for this doctor at the moment.
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Please check back later or contact the doctor directly.
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        )}

        {/* Reviews Section */}
        {doctor.profile?.reviews && doctor.profile.reviews.length > 0 && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Patient Reviews ({doctor.profile.reviews.length})
              </Typography>
              <List>
                {doctor.profile.reviews.map((review, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                            {(review.patient?.username || 'A').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {review.patient?.username || 'Anonymous Patient'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Rating value={review.rating || 0} readOnly size="small" />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(review.date || review.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        {review.comment && (
                          <Typography variant="body2" color="text.primary" sx={{ mt: 1, lineHeight: 1.7 }}>
                            {review.comment}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                    {index < doctor.profile.reviews.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
         {/* Add Review form section here if the logged-in user is a patient and hasn't reviewed this doctor */}
    </Container>
  );
}

export default DoctorDetail; 
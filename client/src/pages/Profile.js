import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { useFeedback } from '../contexts/FeedbackContext';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { showFeedback } = useFeedback();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    fees: '',
    reviews: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // State for review submission
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewFormErrors, setReviewFormErrors] = useState({});

  // State for doctor availability management
  const [availability, setAvailability] = useState([]);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [addSlotLoading, setAddSlotLoading] = useState(false);
  const [deleteSlotLoading, setDeleteSlotLoading] = useState({}); // Use object to track loading per slot ID

  // State for appointment management
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentActionLoading, setAppointmentActionLoading] = useState(false);

  // State for tab management
  const [tabValue, setTabValue] = useState(0);

  // State for chats (for doctors)
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchAppointments();
    if (user && user.role === 'doctor') {
      fetchChats();
    }

    // Add console logs here to inspect user and profile IDs after fetch
    if (user && profile._id) {
      console.log('User ID:', user.id);
      console.log('Profile ID:', profile._id);
      console.log('User ID === Profile ID:', user.id === profile._id);
    }

  }, [user, profile._id]); // Add profile._id to dependency array to log after it's set

  const fetchProfile = async () => {
    if (!user || !user.id) return;
    try {
      // When viewing own profile (/profile), always use user.id
      const profileResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/profile/${user.id}`
      );
      // Update state with fetched profile data, ensuring _id is set
      setProfile(prev => ({
        ...prev,
        ...profileResponse.data,
        profile: profileResponse.data.profile || {},
        reviews: profileResponse.data.profile?.reviews || [],
        _id: profileResponse.data._id // Explicitly set _id from the response
      }));

      // Check for incomplete profile and set a message
      const fetchedUserData = profileResponse.data;
      const fetchedProfile = fetchedUserData.profile;
      let completionMessage = '';
      if (!fetchedProfile?.name || !fetchedProfile?.email || !fetchedProfile?.phone) {
        completionMessage = 'Please complete your basic profile information.';
      }
      if (user.role === 'doctor') {
        if (!fetchedProfile?.specialization || fetchedProfile?.experience === undefined || fetchedProfile?.fees === undefined) {
          completionMessage = completionMessage
            ? `${completionMessage} Also, please provide your specialization, experience, and fees.`
            : 'As a doctor, please complete your specialization, experience, and fees details.';
        }

        // Fetch doctor's availability if the logged-in user is a doctor viewing their own profile
        // Use fetchedUserData._id to be sure we have the ID from the response
        if (user.role === 'doctor' && fetchedUserData._id === user.id) {
            try {
                const availabilityResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments/doctors/me/availability`);
                setAvailability(availabilityResponse.data);
            } catch (availabilityError) {
                console.error('Error fetching doctor availability:', availabilityError);
                showFeedback('Failed to fetch availability.', 'error');
            }
         }
       }
       if (completionMessage) {
           showFeedback(completionMessage, 'info');
       }

    } catch (error) {
      console.error('Error fetching profile:', error);
      // Check for 404 specifically and navigate if the user profile is not found
      if (error.response && error.response.status === 404) {
        setError('Your profile was not found.');
        // Optionally navigate to a setup page or show a different message
        // navigate('/create-profile'); // Example: navigate to a profile creation page
      } else {
        setError('Could not fetch profile data.');
      }
      showFeedback(error.response?.data?.message || 'Failed to fetch profile data', 'error');
    }
  };

  const fetchAppointments = async () => {
    if (!user || !user.id) return;
    setAppointmentsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/appointments/me`
      );
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showFeedback('Failed to fetch appointments', 'error');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchChats = async () => {
    if (!user || user.role !== 'doctor') return;
    setChatsLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/chats`);
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      showFeedback('Failed to fetch chats', 'error');
    } finally {
      setChatsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormErrors({});

    const errors = {};
    if (!profile.name) errors.name = 'Name is required';
    if (!profile.email) errors.email = 'Email is required';
    if (!profile.phone) errors.phone = 'Phone number is required';

    if (user.role === 'doctor') {
      if (!profile.specialization) errors.specialization = 'Specialization is required';
      if (profile.experience === undefined || profile.experience === null || parseFloat(profile.experience) < 0) errors.experience = 'Valid years of experience is required';
      if (profile.fees === undefined || profile.fees === null || parseFloat(profile.fees) < 0) errors.fees = 'Consultation fee is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        profile
      );
      setProfile(prev => ({ ...prev, ...response.data.profile })); // Update profile state with saved data
      setSuccess('Profile updated successfully');
      showFeedback('Profile updated successfully', 'success');
      // No need to call fetchProfile again here as we update state directly and don't re-fetch availability on profile update
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating profile');
      showFeedback(error.response?.data?.message || 'Error updating profile', 'error');
    }

    setLoading(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewFormErrors({});

    const errors = {};
    if (!reviewComment.trim()) errors.reviewComment = 'Review comment cannot be empty';

    if (Object.keys(errors).length > 0) {
      setReviewFormErrors(errors);
      return;
    }

    setReviewLoading(true);

    try {
      if (!profile._id) {
        console.error("Doctor profile ID not available for review submission.");
        showFeedback("Cannot submit review: Doctor profile not loaded.", 'error');
        setReviewLoading(false);
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/${profile._id}/reviews`,
        { comment: reviewComment }
      );

      showFeedback('Review submitted successfully', 'success');
      setReviewComment('');
      fetchProfile();

    } catch (error) {
      console.error("Error submitting review:", error);
      showFeedback(error.response?.data?.message || 'Failed to submit review', 'error');
    }

    setReviewLoading(false);
  };

  // Handle adding a new availability slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlotTime) {
      showFeedback('Please select a time for the availability slot.', 'warning');
      return;
    }

    setAddSlotLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/appointments/doctors/me/availability`, { time: newSlotTime });
      showFeedback(response.data.message, 'success');
      setAvailability(prev => [...prev, response.data.slot]); // Add the new slot to state
      setNewSlotTime(''); // Clear the input
    } catch (error) {
      console.error('Error adding availability slot:', error);
      showFeedback(error.response?.data?.message || 'Failed to add availability slot.', 'error');
    } finally {
      setAddSlotLoading(false);
    }
  };

   // Handle deleting an availability slot
   const handleDeleteSlot = async (slotId) => {
    setDeleteSlotLoading(prev => ({ ...prev, [slotId]: true }));
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/appointments/doctors/me/availability/${slotId}`);
      showFeedback(response.data.message, 'success');
      setAvailability(prev => prev.filter(slot => slot._id !== slotId)); // Remove the slot from state
    } catch (error) {
      console.error('Error deleting availability slot:', error);
      showFeedback(error.response?.data?.message || 'Failed to delete availability slot.', 'error');
    } finally {
      setDeleteSlotLoading(prev => ({ ...prev, [slotId]: false }));
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    setAppointmentActionLoading(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/appointments/${appointmentId}/${action}`
      );
      showFeedback(response.data.message, 'success');
      fetchAppointments(); // Refresh appointments list
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
      showFeedback(error.response?.data?.message || `Failed to ${action} appointment`, 'error');
    } finally {
      setAppointmentActionLoading(false);
    }
  };

  const getAppointmentStatusChip = (status) => {
    const statusConfig = {
      scheduled: { color: 'primary', icon: <AccessTimeIcon />, label: 'Scheduled' },
      completed: { color: 'success', icon: <CheckCircleIcon />, label: 'Completed' },
      cancelled: { color: 'error', icon: <CancelIcon />, label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        sx={{ ml: 1 }}
      />
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography>Please log in to view your profile.</Typography>
      </Container>
    );
  }

  // Determine if the logged-in user is viewing a doctor's profile and is a patient
  const isPatientViewingDoctor = user.role === 'patient' && profile.role === 'doctor';
  const isViewingOwnProfile = user && profile._id && user.id === profile._id;


  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="md" sx={{ mt: { xs: 6, md: 8 }, mb: { xs: 6, md: 8 } }}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 3, md: 4 }
          }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile sections tabs">
              <Tab label="Profile Details" />
              {(user.role === 'doctor' && isViewingOwnProfile) && (
                [ // Use an array for multiple tabs
                  <Tab key="availability" label="Manage Availability" />,
                  <Tab key="myAppointments" label="My Appointments" />,
                  <Tab key="myChats" label="My Chats" />
                ]
              )}
              {(user.role === 'patient' && isPatientViewingDoctor) && (
                  <Tab label="Reviews" />
              )}
               {(user.role === 'patient' && !isPatientViewingDoctor && isViewingOwnProfile) && (
                   <Tab label="My Booked Appointments" />
               )}
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ mt: 3 }}>
            {/* Profile Details Tab (Tab 0) */}
            {tabValue === 0 && (
              <Box>
                 {/* Existing Profile Details Section content goes here */}
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 3, md: 4 }, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box sx={{ width: { xs: '100%', md: '40%' }, display: 'flex', justifyContent: 'center' }}>
                        <Box component="img" src="/illustrations/profile.svg" alt="Profile Illustration" sx={{ width: '100%', height: 'auto', maxWidth: 300, filter: theme.palette.mode === 'light' ? 'invert(0)' : 'invert(1)' }} />
                    </Box>
                    <Box sx={{ width: { xs: '100%', md: '60%' } }}>
                      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
                        {user.role === 'doctor' ? 'Your Profile' : `${profile.name || profile.username}'s Profile`}
                      </Typography>

                      {/* Only show profile update form if viewing own profile */}
                      {isViewingOwnProfile && (
                        <form onSubmit={handleSubmit}>
                           <Grid container spacing={3}>
                              <Grid item xs={12}>
                                <TextField fullWidth label="Name" name="name" value={profile.name || ''} onChange={handleChange} required variant="outlined" size="large" error={!!formErrors.name} helperText={formErrors.name} />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Email" name="email" type="email" value={profile.email || ''} onChange={handleChange} required variant="outlined" size="large" error={!!formErrors.email} helperText={formErrors.email} />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Phone" name="phone" value={profile.phone || ''} onChange={handleChange} required variant="outlined" size="large" />
                              </Grid>

                              {user.role === 'doctor' && (
                                <>
                                  <Grid item xs={12} md={6}>
                                    <FormControl fullWidth required variant="outlined" size="large" error={!!formErrors.specialization}>
                                      <InputLabel>Specialization</InputLabel>
                                      <Select name="specialization" value={profile.specialization || ''} label="Specialization" onChange={handleChange}>
                                        <MenuItem value="">Select Specialization</MenuItem>
                                        {[ 'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Psychiatry', 'Orthopedics', 'Gynecology', 'Ophthalmology', 'ENT', 'General Medicine', 'Nephrologist', 'Oncologist', 'Radiologist', 'Urologist' ].map(spec => (<MenuItem key={spec} value={spec}>{spec}</MenuItem>))}
                                      </Select>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Years of Experience" name="experience" type="number" value={profile.experience || ''} onChange={handleChange} required variant="outlined" size="large" error={!!formErrors.experience} helperText={formErrors.experience} />
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Consultation Fee ($)" name="fees" type="number" value={profile.fees || ''} onChange={handleChange} required variant="outlined" size="large" error={!!formErrors.fees} helperText={formErrors.fees} />
                                  </Grid>
                                </>
                              )}
                              <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2, borderRadius: 3, py: 1.5, fontWeight: 600 }} disabled={loading}>{loading ? <CircularProgress size={24} color="inherit" /> : 'Update Profile'}</Button>
                              </Grid>
                           </Grid>
                        </form>
                      )}

                      {/* Display doctor details if viewing doctor profile (and not own) */}
                      {user.role === 'patient' && profile.role === 'doctor' && (
                          <Box>
                              <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>Doctor Information</Typography>
                              <Typography>Name: {profile.name || 'Not specified'}</Typography>
                              <Typography>Email: {profile.email || 'Not specified'}</Typography>
                              <Typography>Phone: {profile.phone || 'Not specified'}</Typography>
                              <Typography>Specialization: {profile.specialization || 'Not specified'}</Typography>
                              <Typography>Experience: {profile.experience || '0'} years</Typography>
                              <Typography>Consultation Fee: ${profile.fees || '0'}</Typography>
                          </Box>
                      )}
                    </Box>
                 </Box>
              </Box>
            )}

            {/* Manage Availability Tab (Tab 1 for Doctors) */}
            {tabValue === 1 && (user.role === 'doctor' && isViewingOwnProfile) && (
               <Box sx={{ mb: 4 }}>
                   <Typography variant="h5" gutterBottom sx={{fontWeight: 600, mb: 2}}>Manage Availability</Typography>
                   <form onSubmit={handleAddSlot} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                       <TextField label="New Available Time" type="datetime-local" value={newSlotTime} onChange={(e) => setNewSlotTime(e.target.value)} InputLabelProps={{ shrink: true, }} size="small" required sx={{ flexGrow: 1 }} inputProps={{ min: new Date().toISOString().slice(0, 16) }} />
                       <Button type="submit" variant="contained" color="primary" disabled={addSlotLoading || !newSlotTime} sx={{ fontWeight: 600 }}>{addSlotLoading ? <CircularProgress size={24} color="inherit" /> : 'Add Slot'}</Button>
                   </form>
                   <Typography variant="h6" sx={{fontWeight: 600, mb: 1}}>Available Slots:</Typography>
                   {availability.length > 0 ? (
                       <List>
                           {availability.map(slot => (<ListItem key={slot._id} secondaryAction={(<Button variant="outlined" color="error" size="small" onClick={() => handleDeleteSlot(slot._id)} disabled={deleteSlotLoading[slot._id] || slot.isBooked}>{deleteSlotLoading[slot._id] ? <CircularProgress size={16} color="inherit" /> : (slot.isBooked ? 'Booked' : 'Delete')}</Button>)}><ListItemText primary={new Date(slot.time).toLocaleString()} secondary={slot.isBooked ? 'Booked' : 'Available'} /></ListItem>))}
                       </List>
                   ) : (<Typography variant="body2" color="text.secondary">No availability slots added yet.</Typography>)}
               </Box>
            )}

            {/* My Appointments Tab (Tab 2 for Doctors, Tab 1 for Patients viewing own profile) */}
{((tabValue === 2 && user.role === 'doctor' && isViewingOwnProfile) ||
  (tabValue === 1 && user.role === 'patient' && !isPatientViewingDoctor && isViewingOwnProfile)) && (
  <Box sx={{ mb: 4 }}>
    <Typography
      variant="h5"
      gutterBottom
      sx={{ fontWeight: 600, color: 'text.primary' }}
    >
      {user.role === 'doctor' ? 'My Appointments' : 'My Booked Appointments'}
    </Typography>

    {appointmentsLoading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={24} />
        <Typography sx={{ ml: 2 }}>Loading appointments...</Typography>
      </Box>
    ) : appointments.length > 0 ? (
      <List>
        {appointments.map((appointment) => (
          <ListItem
            key={appointment._id}
            sx={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              mb: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="h6">
                {user.role === 'doctor'
                  ? `Patient: ${appointment.patient?.profile?.name || 'Unknown'}`
                  : `Dr. ${appointment.doctor?.profile?.name || 'Unknown'}`}
              </Typography>
              {getAppointmentStatusChip(appointment.status)}
            </Box>

            <Typography variant="body1" color="text.secondary">
              Date & Time: {new Date(appointment.time).toLocaleString()}
            </Typography>

            {user.role === 'doctor' && appointment.reason && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, fontStyle: 'italic' }}
              >
                Reason: {appointment.reason}
              </Typography>
            )}

            {appointment.status === 'scheduled' &&
              (user.role === 'doctor' || user.role === 'patient') && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  {user.role === 'doctor' && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() =>
                        handleAppointmentAction(appointment._id, 'complete')
                      }
                      disabled={appointmentActionLoading}
                    >
                      Mark as Completed
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setCancelDialogOpen(true);
                    }}
                    disabled={appointmentActionLoading}
                  >
                    Cancel Appointment
                  </Button>
                </Box>
              )}
          </ListItem>
        ))}
      </List>
    ) : (
      <Typography variant="body1" color="text.secondary">
        No appointments found.
      </Typography>
    )}
  </Box>
)}


            {/* Reviews Tab (Tab 1 for Patients viewing a doctor's profile) */}
            {tabValue === 1 && (user.role === 'patient' && isPatientViewingDoctor) && (
                <Box>
                   {profile.role === 'doctor' && profile.reviews && profile.reviews.length > 0 && (
                       <Box>
                           <Typography variant="h5" gutterBottom sx={{fontWeight: 600, mb: 2}}>Reviews ({profile.reviews.length})</Typography>
                            {profile.reviews.map((review, index) => (
                              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2, bgcolor: 'background.default' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>
                                    {review.patient?.username || 'Anonymous Patient'}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.primary" sx={{mb: 1}}>{review.comment}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            ))}
                       </Box>
                   )}
                    {isPatientViewingDoctor && (
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{fontWeight: 600, mb: 2}}>Leave a Review</Typography>
                            <form onSubmit={handleReviewSubmit}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12}>
                                        <TextField 
                                          fullWidth 
                                          label="Your Review" 
                                          name="reviewComment" 
                                          value={reviewComment} 
                                          onChange={(e) => setReviewComment(e.target.value)} 
                                          multiline 
                                          rows={4} 
                                          variant="outlined" 
                                          required 
                                          error={!!reviewFormErrors.reviewComment} 
                                          helperText={reviewFormErrors.reviewComment} 
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                         <Button 
                                           type="submit" 
                                           variant="contained" 
                                           color="primary" 
                                           size="large" 
                                           sx={{ mt: 1, borderRadius: 3, py: 1, fontWeight: 600 }} 
                                           disabled={reviewLoading}
                                         >
                                           {reviewLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit Review'}
                                         </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Box>
                    )}
                </Box>
            )}

            {/* My Booked Appointments Tab (Tab 1 for Patients viewing own profile) - Already Handled Above */}
            {/* We handle the patient's own appointments in the same block as doctor's appointments based on conditional rendering */}

            {/* My Chats Tab (Tab 3 for Doctors) */}
            {tabValue === 3 && (user.role === 'doctor' && isViewingOwnProfile) && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{fontWeight: 600, mb: 2}}>My Chats</Typography>
                {chatsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                    <Typography sx={{ ml: 2 }}>Loading chats...</Typography>
                  </Box>
                ) : chats.length > 0 ? (
                  <List>
                    {chats.map((chat) => (
                      <ListItem
                        key={chat._id}
                        button
                        onClick={() => navigate(`/chat/${chat._id}`)}
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          mb: 1,
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Patient: {chat.patient?.profile?.name || chat.patient?.username}
                          </Typography>
                          {chat.lastMessage && (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(chat.lastMessage).toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Last Message: {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : 'No messages yet.'}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center">
                    You have no chats yet.
                  </Typography>
                )}
              </Box>
            )}

          </Box>

        </Paper>
      </Container>

      {/* Cancel Appointment Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false);
          setSelectedAppointment(null);
        }}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this appointment scheduled for
            {selectedAppointment && new Date(selectedAppointment.time).toLocaleString()}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCancelDialogOpen(false);
              setSelectedAppointment(null);
            }}
            disabled={appointmentActionLoading}
          >
            No, Keep It
          </Button>
          <Button
            onClick={() => selectedAppointment && handleAppointmentAction(selectedAppointment._id, 'cancel')}
            color="error"
            disabled={appointmentActionLoading}
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile; 
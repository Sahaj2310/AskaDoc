import React, { useState, useEffect, useCallback } from 'react';
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
  Tab,
  Fade,
  Zoom,
  Avatar,
  OutlinedInput,
  Checkbox,
  ListItemAvatar,
  ListItemSecondaryAction,
  DialogContentText,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { useFeedback } from '../contexts/FeedbackContext';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import TranslateIcon from '@mui/icons-material/Translate';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ChatIcon from '@mui/icons-material/Chat';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';

const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Family Medicine',
  'Internal Medicine',
  'Neurology',
  'Pediatrics',
  'Psychiatry',
  'Orthopedics',
  'Oncology',
  'Gynecology',
  'Urology',
  'Ophthalmology',
  'ENT',
  'Dentistry',
  'General Practitioner',
];

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { showFeedback } = useFeedback();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    reviews: [],
    profile: { // Nested profile object
    phone: '',
      address: '',
    specialization: '',
    experience: '',
      education: '',
      languages: [],
      consultationFee: '',
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // State for form data for editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    experience: '',
    education: '',
    languages: [],
    consultationFee: '',
  });

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

  // State for confirmation dialog
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false); // Tracks if there are unsaved changes

  // Calculate the appointments tab index based on user role
  const getAppointmentsTabIndex = () => {
    return user?.role === 'doctor' ? 2 : 1;
  };

  // Debug logging for component state
  useEffect(() => {
    console.log('Profile Component State:', {
      tabValue,
      appointmentsCount: appointments.length,
      appointmentsLoading,
      user: user ? {
        id: user.id,
        role: user.role
      } : null,
      appointmentsTabIndex: getAppointmentsTabIndex(),
      shouldShowAppointments: tabValue === getAppointmentsTabIndex()
    });
  }, [tabValue, appointments, appointmentsLoading, user]);

  // Fetch appointments when tab changes to appointments tab
  useEffect(() => {
    const appointmentsTabIndex = getAppointmentsTabIndex();
    if (tabValue === appointmentsTabIndex && user) {
      console.log('Tab changed to appointments, fetching appointments...');
      fetchAppointments();
    }
  }, [tabValue, user]);

  useEffect(() => {
    fetchProfile();
    fetchAppointments();
    if (user && user.role === 'doctor') {
      fetchChats();
    }

    // Initialize formData when user data is available
    if (user) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.profile?.phone || '',
        address: user?.profile?.address || '',
        specialization: user?.profile?.specialization || '',
        experience: user?.profile?.experience || '',
        education: user?.profile?.education || '',
        languages: user?.profile?.languages || [],
        consultationFee: user?.profile?.consultationFee || '',
      });
    }

    // Add console logs here to inspect user and profile IDs after fetch
    if (user && profile._id) {
      console.log('User ID:', user.id);
      console.log('Profile ID:', profile._id);
      console.log('User ID === Profile ID:', user.id === profile._id);
    }

  }, [user, profile._id]);

  useEffect(() => {
    // Compare formData with initial profile data to determine if changes exist
    const initialProfileData = {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.profile?.phone || '',
      address: user?.profile?.address || '',
      specialization: user?.profile?.specialization || '',
      experience: user?.profile?.experience || '',
      education: user?.profile?.education || '',
      languages: user?.profile?.languages || [],
      consultationFee: user?.profile?.consultationFee || '',
    };
    const currentFormData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      specialization: formData.specialization,
      experience: formData.experience,
      education: formData.education,
      languages: formData.languages,
      consultationFee: formData.consultationFee,
    };
    setHasChanges(JSON.stringify(initialProfileData) !== JSON.stringify(currentFormData));
  }, [formData, user]);

  const fetchProfile = useCallback(async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Changed endpoint to fetch authenticated user's profile directly
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('Raw profile fetch response:', response.data);
      setProfile(response.data);
      setFormData(response.data.profile || {});
      console.log('Profile state after fetch:', response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showFeedback(error.response?.data?.message || 'Failed to fetch profile', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showFeedback]);

  const fetchAppointments = async () => {
    if (!user || !user.id) {
      console.log('Cannot fetch appointments: No user or user ID');
      return;
    }
    setAppointmentsLoading(true);
    try {
      console.log('Fetching appointments for user:', user.id, 'role:', user.role);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/appointments/me`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('Raw appointments response:', JSON.stringify(response.data, null, 2));
      
      if (Array.isArray(response.data)) {
        const validAppointments = response.data.filter(appointment => {
          const isValid = appointment && 
                         appointment._id && 
                         appointment.time && 
                         appointment.status &&
                         (appointment.doctor || appointment.patient);
          
          if (!isValid) {
            console.warn('Invalid appointment data:', JSON.stringify(appointment, null, 2));
          }
          return isValid;
        });

        console.log('Setting appointments state with:', validAppointments.length, 'valid appointments');
        setAppointments(validAppointments);
      } else {
        console.error('Invalid appointments data:', response.data);
        showFeedback('Invalid appointments data received', 'error');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showFeedback(error.response?.data?.message || 'Failed to fetch appointments', 'error');
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
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Name, email, and phone are required');
        return;
      }

      // Additional validation for doctors
    if (user.role === 'doctor') {
      if (!formData.specialization) {
          setError('Specialization is required for doctors');
          return;
        }
        if (!formData.experience || formData.experience < 0) {
          setError('Valid years of experience is required for doctors');
          return;
        }
        if (!formData.fees || formData.fees < 0) {
          setError('Consultation fee is required for doctors');
      return;
        }
    }

      // Prepare the payload
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        profile: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        }
      };

      // Add doctor-specific fields if user is a doctor
      if (user.role === 'doctor') {
        payload.specialization = formData.specialization;
        payload.experience = parseFloat(formData.experience);
        payload.fees = parseFloat(formData.fees);
        payload.profile.specialization = formData.specialization;
        payload.profile.experience = parseFloat(formData.experience);
        payload.profile.fees = parseFloat(formData.fees);
        payload.profile.education = formData.education;
        payload.profile.languages = formData.languages;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setProfile(response.data);
      setFormData(response.data.profile);
      setIsEditMode(false);
      setSuccess('Profile updated successfully');
      setError(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Error updating profile');
      setSuccess(null);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewFormErrors({});

    if (!reviewComment.trim()) {
      setReviewFormErrors({ comment: 'Review comment cannot be empty.' });
      setReviewLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/profile/${profile._id}/reviews`, {
        comment: reviewComment,
        rating: 5, // Default rating for simplicity, can be extended
      });
      setProfile(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          reviews: response.data.reviews || []
        }
      }));
      setReviewComment('');
      showFeedback('Review submitted successfully!', 'success');
    } catch (err) {
      console.error('Error submitting review:', err);
      showFeedback(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
    setReviewLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlotTime) return;

    try {
      setAddSlotLoading(true);
      const slotTime = new Date(newSlotTime);
      
      // Validate the date
      if (isNaN(slotTime.getTime())) {
        showFeedback('Invalid date selected', 'error');
        return;
      }

      // Ensure the date is in the future
      if (slotTime <= new Date()) {
        showFeedback('Please select a future date and time', 'error');
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/appointments/doctors/me/availability`, 
        { time: slotTime.toISOString() }
      );
      
      // Update the availability state with the new slot
      setAvailability(prev => [...prev, response.data.slot]);
      setNewSlotTime('');
      showFeedback('Availability slot added!', 'success');
    } catch (err) {
      console.error('Error adding slot:', err);
      showFeedback(err.response?.data?.message || 'Failed to add slot', 'error');
    } finally {
      setAddSlotLoading(false);
    }
  };

   const handleDeleteSlot = async (slotId) => {
    try {
      setDeleteSlotLoading(prev => ({ ...prev, [slotId]: true }));
      console.log('Attempting to delete slot with ID:', slotId);
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/appointments/doctors/me/availability/${slotId}`);
      setAvailability(prev => prev.filter(slot => slot._id !== slotId));
      showFeedback('Availability slot deleted!', 'success');
    } catch (err) {
      console.error('Error deleting slot:', err);
      showFeedback(err.response?.data?.message || 'Failed to delete slot', 'error');
    } finally {
      setDeleteSlotLoading(prev => ({ ...prev, [slotId]: false }));
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    setAppointmentActionLoading(true);
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/appointments/${appointmentId}/${action}`);
      
      // Update the appointments list with the new status
      setAppointments(prev => prev.map(appt => 
        appt._id === appointmentId 
          ? { ...appt, status: action === 'cancel' ? 'cancelled' : action }
          : appt
      ));
      
      showFeedback(`Appointment ${action}ed successfully!`, 'success');
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
    let color;
    switch (status) {
      case 'pending':
        color = 'warning';
        break;
      case 'approved':
        color = 'primary';
        break;
      case 'completed':
        color = 'success';
        break;
      case 'cancelled':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    const IconComponent = status === 'pending' ? AccessTimeIcon : status === 'approved' ? CheckCircleIcon : CancelIcon; // Placeholder icons
    return <Chip label={status} color={color} size="small" icon={<IconComponent />} />;
  };

  const handleChange = (e) => {
    console.log(`handleChange: ${e.target.name} = ${e.target.value}`);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLanguageChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      languages: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleTabChange = (event, newValue) => {
    console.log('Tab changing from', tabValue, 'to', newValue);
    setTabValue(newValue);
  };

  const handleCancelEdit = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      setIsEditMode(false);
    }
  };

  const handleConfirmCancel = () => {
    setIsEditMode(false);
    setShowCancelConfirm(false);
    // Reset form data to original values from user prop
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.profile?.phone || '',
      address: user?.profile?.address || '',
      specialization: user?.profile?.specialization || '',
      experience: user?.profile?.experience || '',
      education: user?.profile?.education || '',
      languages: user?.profile?.languages || [],
      consultationFee: user?.profile?.consultationFee || '',
    });
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setAppointmentActionLoading(true);
      console.log('Cancelling appointment:', selectedAppointment._id);
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/appointments/${selectedAppointment._id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update the appointments list regardless of response format
      setAppointments(appointments.map(apt => 
        apt._id === selectedAppointment._id 
          ? { ...apt, status: 'cancelled' }
          : apt
      ));
      
      showFeedback('Appointment cancelled successfully', 'success');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      showFeedback(
        error.response?.data?.message || 'Failed to cancel appointment',
        'error'
      );
    } finally {
      setAppointmentActionLoading(false);
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
    }
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Profile
          </Typography>
          
          <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Profile Details" />
            {user?.role === 'doctor' && <Tab label="Availability" />}
                   <Tab label="My Booked Appointments" />
            {user?.role === 'doctor' && <Tab label="My Patients" />}
            </Tabs>

          {/* Debug info - only show in development */}
          {/* Removed debug info as it's no longer needed for troubleshooting */}
          {/*
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                Current Tab: {tabValue}
                <br />
                Appointments Tab Index: {getAppointmentsTabIndex()}
                <br />
                Should Show Appointments: {tabValue === getAppointmentsTabIndex() ? 'Yes' : 'No'}
                <br />
                Appointments Count: {appointments.length}
              </Typography>
          </Box>
          )}
          */}

          {/* Profile Details Tab Content */}
            {tabValue === 0 && (
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Profile Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  Your Profile
                </Typography>
                {!isEditMode ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditMode(true)}
                  >
                    Update Details
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
              </Box>

                  {isEditMode ? (
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                           <Grid container spacing={3}>
                    {/* Personal Information */}
                    <Grid item xs={12} md={6}>
                      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 2, borderBottom: '1px solid rgba(0,0,0,0.1)', pb: 1 }}>
                          Personal Information
                        </Typography>
                          <TextField
                          label="Full Name"
                            name="name"
                          value={formData.name || ''}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                          required
                          />
                          <TextField
                            label="Email"
                            name="email"
                          type="email"
                          value={formData.email || ''}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                          required
                          />
                          <TextField
                          label="Phone Number"
                            name="phone"
                          value={formData.phone || ''}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                          required
                          />
                          <TextField
                            label="Address"
                            name="address"
                          value={formData.address || ''}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                          multiline // Make it multiline
                          rows={3} // Set initial rows
                          />
                      </Paper>
                        </Grid>

                    {/* Doctor Specific Information */}
                        {user?.role === 'doctor' && (
                      <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                          <Typography variant="h6" gutterBottom sx={{ mb: 2, borderBottom: '1px solid rgba(0,0,0,0.1)', pb: 1 }}>
                            Professional Details
                          </Typography>
                          <FormControl fullWidth margin="normal">
                            <InputLabel id="specialization-label">Specialization</InputLabel>
                                <Select
                              labelId="specialization-label"
                              id="specialization"
                                  name="specialization"
                              value={formData.specialization || ''}
                              label="Specialization"
                                  onChange={handleChange}
                              required
                                >
                                  {SPECIALIZATIONS.map((spec) => (
                                    <MenuItem key={spec} value={spec}>
                                      {spec}
                                    </MenuItem>
                                  ))}
                                      </Select>
                              </FormControl>
                              <TextField
                            label="Experience (Years)"
                                name="experience"
                                type="number"
                            value={formData.experience || ''}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                          />
                          <TextField
                            label="Consultation Fee ($)"
                            name="fees"
                            type="number"
                            value={formData.fees || ''}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                          />
                              <TextField
                                label="Education"
                                name="education"
                              value={formData.education || ''}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                              multiline
                              rows={3}
                            />
                          <FormControl fullWidth margin="normal">
                              <InputLabel id="languages-label">Languages</InputLabel>
                                <Select
                                  labelId="languages-label"
                                  id="languages"
                                  name="languages"
                                  multiple
                                  value={formData.languages || []}
                                  onChange={handleLanguageChange}
                                  input={<OutlinedInput id="select-multiple-chip" label="Languages" />}
                                  renderValue={(selected) => (
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                          {selected.map((value) => (
                                              <Chip key={value} label={value} />
                                          ))}
                                      </Box>
                                  )}
                              >
                                  {['English', 'Spanish', 'French', 'German', 'Chinese', 'Hindi', 'Arabic', 'Russian', 'Japanese', 'Korean'].map((lang) => (
                                    <MenuItem key={lang} value={lang}>
                                      <Checkbox checked={formData.languages.indexOf(lang) > -1} />
                                      <ListItemText primary={lang} />
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                        </Paper>
                            </Grid>
                              )}
                      </Grid>

                              <Button
                    type="submit"
                                variant="contained"
                    color="primary"
                    sx={{ mt: 3, py: 1.5, fontSize: '1.1rem' }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                              </Button>
                          </Box>
              ) : (
                <Grid container spacing={4}>
                  {/* Personal & Contact Info Display */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
                      <Typography variant="h6" gutterBottom sx={{ mb: 2, borderBottom: '1px solid rgba(0,0,0,0.1)', pb: 1 }}>
                        Personal & Contact Information
                          </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon color="action" />
                                <Typography variant="body1">
                            <Typography component="span" sx={{ fontWeight: 'bold' }}>Name:</Typography> {profile.profile?.name || 'Not set'}
                                </Typography>
                              </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon color="action" />
                                <Typography variant="body1">
                            <Typography component="span" sx={{ fontWeight: 'bold' }}>Email:</Typography> {profile.profile?.email || 'Not set'}
                                </Typography>
                              </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon color="action" />
                          <Typography variant="body1">
                            <Typography component="span" sx={{ fontWeight: 'bold' }}>Phone:</Typography> {profile.profile?.phone || 'Not set'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <LocationOnIcon color="action" sx={{ mt: 0.5 }} />
                          <Typography variant="body1">
                            <Typography component="span" sx={{ fontWeight: 'bold' }}>Address:</Typography> {profile.profile?.address || 'Not set'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                           </Grid>

                  {/* Doctor Specific Info Display */}
                  {profile.role === 'doctor' && (
                    <Grid item xs={12} md={6}>
                      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 2, borderBottom: '1px solid rgba(0,0,0,0.1)', pb: 1 }}>
                          Professional Details
                              </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MedicalServicesIcon color="action" />
                                    <Typography variant="body1">
                              <Typography component="span" sx={{ fontWeight: 'bold' }}>Specialization:</Typography> {profile.profile?.specialization || 'Not set'}
                                    </Typography>
                                  </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkIcon color="action" />
                                    <Typography variant="body1">
                              <Typography component="span" sx={{ fontWeight: 'bold' }}>Experience:</Typography> {profile.profile?.experience ? `${profile.profile.experience} years` : 'Not set'}
                                    </Typography>
                                  </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoneyIcon color="action" />
                                    <Typography variant="body1">
                              <Typography component="span" sx={{ fontWeight: 'bold' }}>Consultation Fee:</Typography> {profile.profile?.fees ? `$${profile.profile.fees}` : 'Not set'}
                                    </Typography>
                                  </Box>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <SchoolIcon color="action" sx={{ mt: 0.5 }} />
                              <Typography variant="body1">
                                  <Typography component="span" sx={{ fontWeight: 'bold' }}>Education:</Typography> {profile.profile?.education || 'Not set'}
                                      </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <LanguageIcon color="action" sx={{ mt: 0.5 }} />
                                    <Typography variant="body1">
                                  <Typography component="span" sx={{ fontWeight: 'bold' }}>Languages:</Typography> {profile.profile?.languages && profile.profile.languages.length > 0 ? profile.profile.languages.join(', ') : 'Not set'}
                                    </Typography>
              </Box>
                        </Box>
                      </Paper>
                                </Grid>
                          )}
                    </Grid>
                  )}
                </Box>
          )}

          {/* Appointments Tab Content */}
          {tabValue === getAppointmentsTabIndex() && user && (
            <Box sx={{ mt: 2 }}>
    {appointmentsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
      </Box>
    ) : appointments.length > 0 ? (
                <Grid container spacing={2}>
                  {appointments.map((appointment) => {
                    const appointmentTime = new Date(appointment.time);
                    const isPast = appointmentTime < new Date();
                    
                    return (
                      <Grid item xs={12} key={appointment._id}>
                        <Paper 
                          elevation={2} 
            sx={{
                            p: 2,
                display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            opacity: isPast ? 0.7 : 1,
                            '&:hover': {
                              boxShadow: 3
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                              {user.role === 'patient' ? (
                                `Dr. ${appointment.doctor?.profile?.name || 'Unknown Doctor'}`
                              ) : (
                                `Patient: ${appointment.patient?.profile?.name || 'Unknown Patient'}`
                              )}
              </Typography>
                            <Chip 
                              label={appointment.status} 
                              color={
                                appointment.status === 'scheduled' ? 'primary' :
                                appointment.status === 'completed' ? 'success' :
                                appointment.status === 'cancelled' ? 'error' : 'default'
                              }
                              size="small"
                            />
            </Box>

                          <Typography variant="body1">
                            {appointmentTime.toLocaleString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
            </Typography>

                          {user.role === 'patient' && appointment.doctor?.profile?.specialization && (
                            <Typography variant="body2" color="text.secondary">
                              Specialization: {appointment.doctor.profile.specialization}
              </Typography>
            )}

                          {appointment.status === 'scheduled' && !isPast && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
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
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No appointments found
      </Typography>
                  {user.role === 'patient' && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate('/doctors')}
                      sx={{ mt: 2 }}
                    >
                      Book an Appointment
                    </Button>
    )}
  </Box>
)}
                       </Box>
                   )}

          {/* Availability Tab Content */}
          {user?.role === 'doctor' && tabValue === 1 && (
                        <Box>
                   <Typography variant="h5" gutterBottom sx={{fontWeight: 600, mb: 2}}>Manage Availability</Typography>
                   <form onSubmit={handleAddSlot} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                        <TextField 
                  label="New Available Time" 
                  type="datetime-local" 
                  value={newSlotTime} 
                  onChange={(e) => setNewSlotTime(e.target.value)} 
                  InputLabelProps={{ shrink: true }} 
                  size="small" 
                                          required 
                  sx={{ flexGrow: 1 }} 
                  inputProps={{ min: new Date().toISOString().slice(0, 16) }} 
                                        />
                                         <Button 
                                           type="submit" 
                                           variant="contained" 
                                           color="primary" 
                  disabled={addSlotLoading || !newSlotTime} 
                  sx={{ fontWeight: 600 }}
                                         >
                  {addSlotLoading ? <CircularProgress size={24} color="inherit" /> : 'Add Slot'}
                                         </Button>
                            </form>
                   <Typography variant="h6" sx={{fontWeight: 600, mb: 1}}>Available Slots:</Typography>
              {availability && availability.length > 0 ? (
                       <List>
                  {availability.map(slot => (
          <ListItem
                      key={slot._id} 
                      secondaryAction={
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                          onClick={() => handleDeleteSlot(slot._id)} 
                          disabled={deleteSlotLoading[slot._id] || slot.isBooked}
                        >
                          {deleteSlotLoading[slot._id] ? <CircularProgress size={16} color="inherit" /> : (slot.isBooked ? 'Booked' : 'Delete')}
                  </Button>
                      }
                    >
                      <ListItemText 
                        primary={new Date(slot.time).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} 
                        secondary={slot.isBooked ? 'Booked' : 'Available'} 
                      />
          </ListItem>
        ))}
      </List>
    ) : (
                <Typography variant="body2" color="text.secondary">No availability slots added yet.</Typography>
                    )}
                </Box>
            )}

          {/* My Patients Tab Content */}
          {user?.role === 'doctor' && tabValue === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                My Patients
                  </Typography>
                  <List>
                {chats && chats.length > 0 ? (
                      chats.map((chat) => (
                    <ListItem
                      key={chat._id}
                      sx={{
                        mb: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 1,
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                    >
                          <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {chat.patient?.profile?.name?.[0]?.toUpperCase() || chat.patient?.username?.[0]?.toUpperCase() || 'P'}
                        </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                        primary={chat.patient?.profile?.name || chat.patient?.username || 'Unknown Patient'}
                        secondary={`Last message: ${chat.lastMessage ? new Date(chat.lastMessage).toLocaleString() : 'No messages yet'}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="chat" onClick={() => navigate(`/chat/${chat._id}`)}>
                              <ChatIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No chats found.</Typography>
                    )}
                  </List>
                </Box>
            )}

      {/* Cancel Appointment Dialog */}
      <Dialog
        open={cancelDialogOpen}
            onClose={() => setCancelDialogOpen(false)}
            aria-labelledby="cancel-dialog-title"
            aria-describedby="cancel-dialog-description"
          >
            <DialogTitle id="cancel-dialog-title">Cancel Appointment</DialogTitle>
        <DialogContent>
              <DialogContentText id="cancel-dialog-description">
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
                onClick={() => setCancelDialogOpen(false)}
            disabled={appointmentActionLoading}
          >
            No, Keep It
          </Button>
          <Button
                onClick={handleCancelAppointment} 
            color="error"
            disabled={appointmentActionLoading}
          >
                {appointmentActionLoading ? 'Cancelling...' : 'Yes, Cancel It'}
          </Button>
        </DialogActions>
      </Dialog>
        </Paper>
      </Container>

      {/* Add Confirmation Dialog */}
      <Dialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        TransitionComponent={Zoom}
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to discard them?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelConfirm(false)} color="primary">
            Keep Editing
          </Button>
          <Button onClick={handleConfirmCancel} color="error" variant="contained">
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Form */}
        {isEditMode && (
        <Dialog open={isEditMode} onClose={() => setIsEditMode(false)} maxWidth="md" fullWidth>
          <DialogTitle>Update Profile</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
                
                {user.role === 'doctor' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Specialization</InputLabel>
                        <Select
                          name="specialization"
                          value={formData.specialization || ''}
                          onChange={handleChange}
                          label="Specialization"
                        >
                          {SPECIALIZATIONS.map((spec) => (
                            <MenuItem key={spec} value={spec}>
                              {spec}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Years of Experience"
                        name="experience"
                        type="number"
                        value={formData.experience || ''}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Consultation Fee ($)"
                        name="fees"
                        type="number"
                        value={formData.fees || ''}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Education"
                        name="education"
                        value={formData.education || ''}
                        onChange={handleChange}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Languages</InputLabel>
                        <Select
                          multiple
                          name="languages"
                          value={formData.languages || []}
                          onChange={handleLanguageChange}
                          input={<OutlinedInput label="Languages" />}
                          renderValue={(selected) => selected.join(', ')}
                        >
                          {['English', 'Spanish', 'French', 'German', 'Chinese', 'Hindi', 'Arabic', 'Russian', 'Japanese', 'Korean'].map((lang) => (
                            <MenuItem key={lang} value={lang}>
                              <Checkbox checked={formData.languages?.indexOf(lang) > -1} />
                              <ListItemText primary={lang} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
          </>
        )}
              </Grid>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setIsEditMode(false)}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary">
                  Save Changes
                </Button>
      </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}

export default Profile; 
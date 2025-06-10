import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Chip,
  Avatar,
  Divider,
  InputAdornment,
  Paper,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';

const specializations = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Psychiatry',
  'Orthopedics',
  'Gynecology',
  'Ophthalmology',
  'ENT',
  'General Medicine',
  'Nephrologist',
  'Oncologist',
  'Radiologist',
  'Urologist'
];

// Placeholder images for specialization cards
const specializationImages = {
  'Cardiology': '/illustrations/cardiology.jpg',
  'Dermatology': '/illustrations/dermatology.jpg',
  'Neurology': '/illustrations/neurology.jpg',
  'Pediatrics': '/illustrations/pediatrics.jpg',
  'Psychiatry': '/illustrations/psychiatry.jpg',
  'Orthopedics': '/illustrations/orthopedics.jpg',
  'Gynecology': '/illustrations/gynecology.jpg',
  'Ophthalmology': '/illustrations/ophthalmology.jpg',
  'ENT': '/illustrations/ent.jpg',
  'General Medicine': '/illustrations/general_medicine.jpg',
  'Nephrologist': '/illustrations/nephrologist.jpg',
  'Oncologist': '/illustrations/oncologist.jpg',
  'Radiologist': '/illustrations/radiologist.jpg',
  'Urologist': '/illustrations/urologist.jpg'
};

// Placeholder data for doctor list images
const doctorImages = [
  '/illustrations/doctor1.svg',
  '/illustrations/doctor2.svg',
  '/illustrations/doctor3.svg',
  '/illustrations/doctor4.svg',
  '/illustrations/doctor5.svg',
  '/illustrations/doctor6.svg',
  '/illustrations/doctor7.svg',
  '/illustrations/doctor8.svg',
];

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [sortBy, setSortBy] = useState('fees');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();
  const [filters, setFilters] = useState({
    minFees: '',
    maxFees: '',
    minExperience: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialization, sortBy]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/doctors`,
        {
          params: {
            specialization: selectedSpecialization,
            sortBy
          }
        }
      );
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      showFeedback('Failed to fetch doctors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (specialization) => {
    setSelectedSpecialization(specialization);
  };

  const handleChat = async (doctorId) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chats`, { doctorId });
      navigate(`/chat/${response.data._id}`);
      showFeedback('Chat created successfully!', 'success');
    } catch (error) {
      console.error('Error creating chat:', error);
      showFeedback(error.response?.data?.message || 'Failed to create chat with doctor.', 'error');
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show specialization cards if no specialization is selected
  if (!selectedSpecialization && !searchTerm) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 6, md: 8 }, mb: { xs: 6, md: 8 } }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center" 
          sx={{ 
            mb: 6, 
            fontWeight: 600, 
            color: 'text.primary',
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          Choose your Consultant
        </Typography>
        <Grid container spacing={3}>
          {specializations.map((spec) => (
            <Grid item xs={12} sm={6} md={3} key={spec}>
              <Card
                onClick={() => handleCategoryClick(spec)}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: 3,
                  minHeight: { xs: 160, md: 200 },
                  backgroundImage: `url(${specializationImages[spec]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  color: '#fff',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                  '&:hover': { 
                    transform: 'scale(1.03)', 
                    transition: 'transform 0.3s ease-in-out' 
                  },
                  overflow: 'hidden',
                  position: 'relative',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  bgcolor: 'rgba(0,0,0,0.4)', 
                  borderRadius: 'inherit' 
                }} />
                <Typography 
                  variant="h6" 
                  align="center" 
                  sx={{ 
                    fontWeight: 600, 
                    position: 'relative', 
                    zIndex: 1,
                    fontSize: { xs: '1.1rem', md: '1.2rem' }
                  }}
                >
                  {spec}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 6, md: 8 }, mb: { xs: 6, md: 8 } }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 600, 
          color: 'text.primary',
          fontSize: { xs: '1.8rem', md: '2.2rem' }
        }}
      >
        Doctors ({selectedSpecialization || 'All'})
      </Typography>

      {/* Filters */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={selectedSpecialization ? 6 : 8}>
            <TextField
              fullWidth
              label="Search by Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              size="large"
            />
          </Grid>
          <Grid item xs={12} md={selectedSpecialization ? 3 : 4}>
            <FormControl fullWidth size="large">
              <InputLabel>Specialization</InputLabel>
              <Select
                value={selectedSpecialization}
                label="Specialization"
                onChange={(e) => setSelectedSpecialization(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {specializations.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                size="small"
              >
                <MenuItem value="fees">Fees</MenuItem>
                <MenuItem value="experience">Experience</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* New Filter Inputs */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Fees"
              type="number"
              value={filters.minFees}
              onChange={(e) => setFilters({ ...filters, minFees: e.target.value })}
              size="large"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Fees"
              type="number"
              value={filters.maxFees}
              onChange={(e) => setFilters({ ...filters, maxFees: e.target.value })}
              size="large"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Experience (Years)"
              type="number"
              value={filters.minExperience}
              onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })}
              size="large"
            />
          </Grid>

        </Grid>
      </Paper>

      {/* Doctor List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor, index) => (
              <Grid item xs={12} sm={6} md={4} key={doctor._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                    },
                    borderRadius: 3, // Rounded corners
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={doctorImages[index % doctorImages.length]}
                        alt={`Dr. ${doctor.profile?.name}`}
                        sx={{ width: 80, height: 80, mr: 2, border: '3px solid #1976d2' }} // Larger avatar with a border
                      />
                      <Box>
                        <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Dr. {doctor.profile?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 500 }}>
                          {doctor.profile?.specialization || 'General Medicine'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Experience: {doctor.profile?.experience || 0} years
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Fees: ${doctor.profile?.fees || 0}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        component={Link}
                        to={`/doctors/${doctor._id}/book`}
                        sx={{ py: 1.5, fontWeight: 600, borderRadius: 3 }}
                      >
                        Book Appointment
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        onClick={() => handleChat(doctor._id)}
                        sx={{ py: 1.5, fontWeight: 600, borderRadius: 3 }}
                      >
                        Chat with Doctor
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                align="center"
                sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}
              >
                No doctors found for this specialization or search term.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
}

export default DoctorList; 
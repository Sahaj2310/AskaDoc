import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Box,
  Avatar,
  Stack,
  Chip,
  alpha
} from '@mui/material';
import {
  Chat as ChatIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  AccessTime as AccessTimeIcon,
  LocalHospital as LocalHospitalIcon,
  PersonAdd as PersonAddIcon,
  FindInPage as FindInPageIcon,
  Message as MessageIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Static data for featured doctors
const featuredDoctors = [
  { id: 1, name: 'Dr. Rajesh Kumar', specialization: 'Endocrinology', image: '/illustrations/doctor1.svg', rating: 4.8 },
  { id: 2, name: 'Dr. Priya Sharma', specialization: 'Oncology', image: '/illustrations/doctor2.svg', rating: 4.9 },
  { id: 3, name: 'Dr. Amit Patel', specialization: 'Pediatrics', image: '/illustrations/doctor3.svg', rating: 4.7 },
  { id: 4, name: 'Dr. Anjali Singh', specialization: 'Psychiatry', image: '/illustrations/doctor4.svg', rating: 4.6 },
  { id: 5, name: 'Dr. Vikram Reddy', specialization: 'Radiology', image: '/illustrations/doctor5.svg', rating: 4.8 },
];

// Static stats data
const staticStats = {
  expertDoctors: 500,
  happyPatients: 10000,
  consultations: 50000,
  successRate: 98
};

function Home() {
  const { user } = useAuth();
  const theme = useTheme();

  const MotionBox = motion(Box);
  const MotionCard = motion(Card);

  const formatStatValue = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K+`;
    }
    return `${value}+`;
  };

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Hero Section with Gradient Background */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          pb: { xs: 6, md: 8 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(25, 118, 210, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            sx={{ textAlign: 'center' }}
          >
            <Chip
              icon={<VerifiedUserIcon />}
              label="Trusted Healthcare Platform"
              color="primary"
              sx={{ mb: 3, fontWeight: 600, py: 2.5, px: 1 }}
            />
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                fontSize: { xs: '2.5rem', md: '4rem' },
                mb: 3,
                lineHeight: 1.2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Quality Healthcare at Your Fingertips
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary" 
              paragraph
              sx={{ 
                fontSize: { xs: '1.1rem', md: '1.5rem' },
                maxWidth: '700px',
                mx: 'auto',
                mb: 4,
                lineHeight: 1.6
              }}
            >
              Connect with expert doctors for online medical consultations. Get professional healthcare advice from the comfort of your home.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
              {!user ? (
                <>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ 
                      borderRadius: 3, 
                      px: 5, 
                      py: 1.5,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      boxShadow: 3,
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/doctors"
                    variant="outlined"
                    color="primary"
                    size="large"
                    sx={{ 
                      borderRadius: 3, 
                      px: 5, 
                      py: 1.5,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Browse Doctors
                  </Button>
                </>
              ) : (
                <Button
                  component={RouterLink}
                  to="/doctors"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ 
                    borderRadius: 3, 
                    px: 5, 
                    py: 1.5,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Find Doctors
                </Button>
              )}
            </Stack>
          </MotionBox>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={3}>
          {[
            { label: 'Expert Doctors', value: staticStats.expertDoctors, icon: <LocalHospitalIcon />, format: formatStatValue },
            { label: 'Happy Patients', value: staticStats.happyPatients, icon: <VerifiedUserIcon />, format: formatStatValue },
            { label: 'Consultations', value: staticStats.consultations, icon: <ChatIcon />, format: formatStatValue },
            { label: 'Success Rate', value: staticStats.successRate, icon: <StarIcon />, format: (v) => `${v}%` },
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    mb: 2,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  {stat.format(stat.value)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {stat.label}
                </Typography>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Doctors Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 2
            }}
          >
            Meet Our Expert Doctors
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ maxWidth: '600px', mx: 'auto', fontSize: '1.1rem' }}
          >
            Our team of licensed and verified medical professionals is here to provide you with the best care
          </Typography>
        </Box>
        <Grid container spacing={3} justifyContent="center">
          {featuredDoctors.map((doctor, index) => (
            <Grid item key={doctor.id} xs={6} sm={4} md={2.4}>
              <MotionCard
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: 8,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Avatar
                  alt={doctor.name}
                  src={doctor.image}
                  sx={{ 
                    width: { xs: 90, md: 130 }, 
                    height: { xs: 90, md: 130 }, 
                    mx: 'auto', 
                    mb: 2,
                    border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    boxShadow: 3,
                  }}
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    fontSize: { xs: '0.95rem', md: '1.1rem' },
                    mb: 0.5
                  }}
                >
                  {doctor.name}
                </Typography>
                <Chip
                  label={doctor.specialization}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                />
                {doctor.rating && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 16, color: '#FFB800' }} />
                    <Typography variant="caption" color="text.secondary">
                      {doctor.rating}
                    </Typography>
                  </Box>
                )}
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                sx={{ 
                  width: '100%', 
                  mb: { xs: 4, md: 0 },
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Box 
                  component="img" 
                  src="/illustrations/medical_session.svg" 
                  alt="Medical Session" 
                  sx={{ 
                    width: '100%', 
                    maxWidth: 500,
                    height: 'auto', 
                    filter: theme.palette.mode === 'light' ? 'invert(0)' : 'invert(1)' 
                  }} 
                />
              </MotionBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Typography 
                  variant="h4" 
                  component="h2" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                    mb: 3
                  }}
                >
                  Professional Medical Consultations
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  paragraph
                  sx={{ 
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    mb: 4,
                    lineHeight: 1.8
                  }}
                >
                  Connect with licensed and verified medical experts. Our carefully vetted team of healthcare professionals delivers quality care through secure online consultations.
                </Typography>
                <Stack spacing={3}>
                  {[
                    { icon: <ChatIcon />, title: 'Multi-language Support', desc: 'Chat in English and all regional languages' },
                    { icon: <SecurityIcon />, title: '100% Private & Secure', desc: 'Your data is encrypted and completely confidential' },
                    { icon: <AccessTimeIcon />, title: '24/7 Available Support', desc: 'Get help whenever you need it, day or night' },
                  ].map((feature, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateX(8px)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: '1rem' }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How it works Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 2
            }}
          >
            How It Works
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ maxWidth: '600px', mx: 'auto', fontSize: '1.1rem' }}
          >
            Get started with AskaDoc in three simple steps
          </Typography>
        </Box>
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {[
            { 
              number: '01', 
              icon: <PersonAddIcon />, 
              title: 'Create Your Account', 
              desc: 'Sign up in seconds with just your basic information',
              image: '/illustrations/signup.svg'
            },
            { 
              number: '02', 
              icon: <FindInPageIcon />, 
              title: 'Find Your Doctor', 
              desc: 'Browse by specialty or search for the perfect healthcare provider',
              image: '/illustrations/choose_doctor.svg'
            },
            { 
              number: '03', 
              icon: <MessageIcon />, 
              title: 'Start Consultation', 
              desc: 'Book an appointment or chat directly with your chosen doctor',
              image: '/illustrations/chat.svg'
            },
          ].map((step, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 4,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: 8,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontSize: '4rem',
                    fontWeight: 700,
                    color: alpha(theme.palette.primary.main, 0.1),
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </Box>
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 2.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    mb: 3,
                    width: 80,
                    height: 80,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {step.icon}
                </Box>
                <Box 
                  component="img" 
                  src={step.image} 
                  alt={step.title} 
                  sx={{ 
                    width: 120, 
                    height: 'auto', 
                    mb: 3,
                    mx: 'auto',
                    filter: theme.palette.mode === 'light' ? 'invert(0)' : 'invert(1)' 
                  }} 
                />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    mb: 2,
                    fontSize: '1.3rem'
                  }}
                >
                  {step.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ lineHeight: 1.7 }}
                >
                  {step.desc}
                </Typography>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <MotionBox
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            p: { xs: 5, md: 8 },
            borderRadius: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 8,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.8rem' },
                mb: 2
              }}
            >
              Ready to Get Started?
            </Typography>
            <Typography 
              variant="h6" 
              paragraph
              sx={{ 
                fontSize: { xs: '1rem', md: '1.2rem' },
                mb: 4,
                opacity: 0.95,
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Join thousands of patients who have found the right doctor through AskaDoc. Start your healthcare journey today.
            </Typography>
            <Button
              component={RouterLink}
              to={user ? '/doctors' : '/register'}
              variant="contained"
              size="large"
              sx={{ 
                mt: 2, 
                borderRadius: 3, 
                px: 6, 
                py: 1.8,
                fontSize: { xs: '1rem', md: '1.1rem' },
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 600,
                boxShadow: 4,
                '&:hover': {
                  bgcolor: alpha('#fff', 0.9),
                  boxShadow: 8,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              {user ? 'Find Doctors' : 'Sign Up Now - It\'s Free'}
            </Button>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default Home; 
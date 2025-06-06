import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Chat as ChatIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';

// Placeholder data for featured doctors
const featuredDoctors = [
  { id: 1, name: 'Norrie Tullus', specialization: 'endocrinologist', image: '/illustrations/doctor1.svg' },
  { id: 2, name: 'Tommie Ethelind', specialization: 'oncologist', image: '/illustrations/doctor2.svg' },
  { id: 3, name: 'Nariko Dupin', specialization: 'pediatric', image: '/illustrations/doctor3.svg' },
  { id: 4, name: 'Mandy Duester', specialization: 'psychiatrist', image: '/illustrations/doctor4.svg' },
  { id: 5, name: 'Amil Kerry', specialization: 'radiologist', image: '/illustrations/doctor5.svg' },
];

function Home() {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}
        >
          Quality healthcare at your fingertips
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          paragraph
          sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}
        >
          Connect with expert doctors for online medical consultations
        </Typography>
        {!user && (
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            color="primary"
            size="large"
            sx={{ 
              mt: 4,
              borderRadius: 3, 
              px: 4, 
              py: 1.5,
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}
          >
            Get Started
          </Button>
        )}
      </Container>

      {/* Featured Doctors Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom 
          align="center" 
          sx={{ 
            mb: 6, 
            fontWeight: 600, 
            color: 'text.primary',
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          Meet Our Experts
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {featuredDoctors.map((doctor) => (
            <Grid item key={doctor.id} xs={6} sm={4} md={2.4}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Avatar
                  alt={doctor.name}
                  src={doctor.image}
                  sx={{ 
                    width: { xs: 80, md: 120 }, 
                    height: { xs: 80, md: 120 }, 
                    mx: 'auto', 
                    mb: 2, 
                    border: '3px solid #4ecb8c' 
                  }}
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    fontSize: { xs: '0.9rem', md: '1.1rem' }
                  }}
                >
                  {doctor.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}
                >
                  {doctor.specialization}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Medical Sessions Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              width: '100%', 
              mb: { xs: 4, md: 0 },
              display: 'flex',
              justifyContent: 'center'
            }}>
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
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              Counselling Medical Sessions With Licensed & Verified Experts
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              paragraph
              sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
            >
              Highly qualified team of some of the best names in Medical Science who deliver improved well-being to you. Carefully vetted through a rigorous selection process. Trained and experienced in all Medical techniques.
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem' } }}
                >
                  Chat Sessions
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}
                >
                  English And All Regional Indian Languages
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem' } }}
              >
                100% Private & Secure Platform
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem' } }}
              >
                24/7 Support
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* How it works Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom 
          align="center"
          sx={{ 
            mb: 6, 
            fontWeight: 600, 
            color: 'text.primary',
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          How it works
        </Typography>
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Box 
                component="img" 
                src="/illustrations/signup.svg" 
                alt="Signup and create an account" 
                sx={{ 
                  width: { xs: 100, md: 150 }, 
                  height: 'auto', 
                  mb: 2, 
                  filter: theme.palette.mode === 'light' ? 'invert(0)' : 'invert(1)' 
                }} 
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}
              >
                Signup and create an account
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={1} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Box 
              component="img" 
              src="/illustrations/arrow.svg" 
              alt="Arrow" 
              sx={{ 
                width: 50, 
                height: 'auto', 
                filter: theme.palette.mode === 'light' ? 'invert(0)' : 'invert(1)' 
              }} 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Box 
                component="img" 
                src="/illustrations/choose_doctor.svg" 
                alt="Choose a Counselor" 
                sx={{ 
                  width: { xs: 100, md: 150 }, 
                  height: 'auto', 
                  mb: 2, 
                  filter: theme.palette.mode === 'light' ? 'invert(0)' : 'invert(1)' 
                }} 
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}
              >
                Choose a Counselor by category or search for it
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={1} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Box 
              component="img" 
              src="/illustrations/arrow.svg" 
              alt="Arrow" 
              sx={{ 
                width: 50, 
                height: 'auto', 
                filter: theme.palette.mode === 'light' ? 'invert(0)' : 'invert(1)' 
              }} 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Box 
                component="img" 
                src="/illustrations/chat.svg" 
                alt="Familiarise with the profile and start chatting" 
                sx={{ 
                  width: { xs: 100, md: 150 }, 
                  height: 'auto', 
                  mb: 2, 
                  filter: theme.palette.mode === 'light' ? 'invert(0)' : 'invert(1)' 
                }} 
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}
              >
                Familiarise with the profile and start chatting
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            p: { xs: 4, md: 6 },
            borderRadius: 2,
            textAlign: 'center',
            mb: 4
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Ready to Get Started?
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
          >
            Join thousands of patients who have found the right doctor through AskaDoc
          </Typography>
          <Button
            component={RouterLink}
            to={user ? '/doctors' : '/register'}
            variant="contained"
            color="secondary"
            size="large"
            sx={{ 
              mt: 2, 
              borderRadius: 3, 
              px: 4, 
              py: 1.5,
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}
          >
            {user ? 'Find Doctors' : 'Sign Up Now'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Home; 
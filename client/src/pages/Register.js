import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!username) {
      errors.username = 'Username is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    if (!role) {
        errors.role = 'Role is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    const result = await register(username, password, role);

    setLoading(false);

    if (result.success) {
      showFeedback('Registration successful', 'success');
      navigate('/');
    } else {
      showFeedback(result.error || 'Registration failed', 'error');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="md" sx={{ mt: { xs: 6, md: 8 }, mb: { xs: 6, md: 8 } }}>
        <Paper 
          elevation={6} 
          sx={{ 
            p: { xs: 3, md: 4 },
            borderRadius: 4, 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 2, md: 4 }
          }}
        >
          {/* Illustration */}
          <Box sx={{ width: { xs: '100%', md: '50%' }, display: { xs: 'none', md: 'block' } }}>
             {/* Replace with actual illustration */}
             <Box component="img" src="/illustrations/register.svg" alt="Register Illustration" sx={{ width: '100%', height: 'auto' }} />
          </Box>
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              align="center" 
              sx={{ 
                fontWeight: 600, 
                mb: 3,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              Register
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                variant="outlined"
                size="large"
                sx={{ mb: 2 }}
                error={!!formErrors.username}
                helperText={formErrors.username}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                variant="outlined"
                size="large"
                sx={{ mb: 3 }}
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
              <FormControl
                fullWidth
                margin="normal"
                required
                sx={{ mb: 3 }}
                error={!!formErrors.role}
              >
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value)}
                  variant="outlined"
                  size="large"
                >
                  <MenuItem value="">Select Role</MenuItem>
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                </Select>
                 {!!formErrors.role && (
                     <Typography variant="caption" color="error" sx={{ml: 2}}>{formErrors.role}</Typography>
                 )}
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ 
                  mt: 2, 
                  mb: 2, 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
                disabled={loading}
              >
                 {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
              </Button>
            </form>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 600,
                    textDecoration: 'none', 
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Login here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register; 
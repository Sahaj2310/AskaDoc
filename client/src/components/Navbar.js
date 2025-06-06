import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#1a2327', boxShadow: 0 }}>
      <Toolbar sx={{ minHeight: 80 }}>
        <Typography
          variant="h4"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: '#fff',
            fontWeight: 700,
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: 1.5
          }}
        >
          AskaDoc
        </Typography>
        <Button
          color="inherit"
          component={RouterLink}
          to="/doctors"
          sx={{ mx: 2, fontWeight: 500, fontSize: 18 }}
        >
          Categories
        </Button>
        {user ? (
          <>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{ color: '#fff', ml: 2 }}
            >
              <AccountCircle fontSize="large" />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                component={RouterLink}
                to="/profile"
                onClick={handleClose}
              >
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
            <Button
              color="primary"
              variant="contained"
              sx={{ ml: 2, borderRadius: 3, fontWeight: 600, px: 3 }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/login"
              sx={{ mx: 1, borderRadius: 3, fontWeight: 600, px: 3 }}
            >
              Login
            </Button>
            <Button
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/register"
              sx={{ borderRadius: 3, fontWeight: 600, px: 3 }}
            >
              Signup
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 
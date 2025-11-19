import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  NotificationsNone as NotificationsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ sidebarOpen, onSidebarToggle }) => {
  const { logout, user } = useAuth();
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
    navigate('/login');
    handleClose();
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#ffffff',
        color: '#333',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e0e0e0',
        ml: { 
          xs: 0,
          sm: sidebarOpen ? '260px' : '70px' 
        },
        width: { 
          xs: '100%',
          sm: sidebarOpen ? `calc(100% - 260px)` : 'calc(100% - 70px)' 
        },
        transition: 'width 0.3s ease, margin-left 0.3s ease',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: 3 }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="toggle sidebar"
          onClick={onSidebarToggle}
          sx={{
            mr: 2,
            color: '#333',
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.08)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            color: '#333',
            fontSize: '1.125rem',
          }}
        >
          News Management Portal
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            size="medium"
            sx={{
              color: '#666',
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
                color: '#2e7d32',
              },
            }}
          >
            <Badge badgeContent={0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
              },
            }}
            onClick={handleMenu}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#2e7d32',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                {user?.name || 'User'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#666',
                  fontSize: '0.75rem',
                }}
              >
                {user?.role || 'Admin'}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: 2,
              },
            }}
          >
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                },
              }}
            >
              <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;


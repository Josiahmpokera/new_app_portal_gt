import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Fade,
  Checkbox,
  FormControlLabel,
  Link,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Article as ArticleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import { api } from '../../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsLoading(true);

    if (!validate()) {
      setSubmitError('Please fix the errors below');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.login(formData.email, formData.password);

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store token and user data
        login(user, token);

        // Handle remember me if needed
        if (rememberMe) {
          // Additional logic for remember me can be added here
          // For example, storing in a more persistent way
        }

        // Navigate to dashboard
        navigate(ROUTES.DASHBOARD);
      } else {
        setSubmitError(response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError(
        error.message || 'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={true} timeout={800}>
          <Card
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 380,
              mx: 'auto',
              borderRadius: 3,
              overflow: 'hidden',
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                background: '#2e7d32',
                py: 2.5,
                px: 2.5,
                textAlign: 'center',
                color: 'white',
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  mb: 1.5,
                }}
              >
                <ArticleIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  letterSpacing: '-0.5px',
                  color: 'white',
                  fontSize: '1.5rem',
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.95,
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                Sign in to access your News Portal
              </Typography>
            </Box>

            <CardContent sx={{ p: 3, pt: 3 }}>
              {submitError && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    '& .MuiAlert-icon': {
                      alignItems: 'center',
                    },
                  }}
                >
                  {submitError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 0.5 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  variant="outlined"
                  size="small"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#fafafa',
                      transition: 'all 0.3s ease',
                      fontSize: '0.875rem',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                        borderWidth: '1.5px',
                      },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        '& fieldset': {
                          borderColor: '#4caf50',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& fieldset': {
                          borderColor: '#2e7d32',
                          borderWidth: '2px',
                        },
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                      fontSize: '0.875rem',
                      '&.Mui-focused': {
                        color: '#2e7d32',
                        fontWeight: 500,
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      marginLeft: 0,
                      marginTop: 0.5,
                      fontSize: '0.75rem',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#666', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                  variant="outlined"
                  size="small"
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#fafafa',
                      transition: 'all 0.3s ease',
                      fontSize: '0.875rem',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                        borderWidth: '1.5px',
                      },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        '& fieldset': {
                          borderColor: '#4caf50',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& fieldset': {
                          borderColor: '#2e7d32',
                          borderWidth: '2px',
                        },
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                      fontSize: '0.875rem',
                      '&.Mui-focused': {
                        color: '#2e7d32',
                        fontWeight: 500,
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      marginLeft: 0,
                      marginTop: 0.5,
                      fontSize: '0.75rem',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#666', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ 
                            color: '#666',
                            '&:hover': {
                              color: '#2e7d32',
                              backgroundColor: 'rgba(46, 125, 50, 0.08)',
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          color: '#666',
                          padding: '4px',
                          '&.Mui-checked': {
                            color: '#2e7d32',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(46, 125, 50, 0.08)',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          color: '#666',
                          userSelect: 'none',
                        }}
                      >
                        Remember me
                      </Typography>
                    }
                  />
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle forgot password logic here
                    }}
                    sx={{
                      fontSize: '0.875rem',
                      color: '#2e7d32',
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#1b5e20',
                      },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="medium"
                  disabled={isLoading}
                  sx={{
                    py: 1.25,
                    borderRadius: 2,
                    background: '#000000',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: '#4FBD50',
                    boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: '#1b5e20',
                      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 6px rgba(46, 125, 50, 0.3)',
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666',
                      cursor: 'not-allowed',
                    },
                  }}
                >
                  {isLoading ? 'Logging in...' : 'Continue'}
                </Button>
              </Box>

              {/* Footer */}
              <Box sx={{ mt: 2.5, textAlign: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#999',
                    fontSize: '0.75rem',
                  }}
                >
                  Secure login powered by News Portal
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;



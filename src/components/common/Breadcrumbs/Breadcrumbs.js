import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Box sx={{ display: 'inline-flex' }}>
      <MuiBreadcrumbs aria-label="breadcrumb">
        <Link
          component={RouterLink}
          to="/dashboard"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          color="inherit"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          return isLast ? (
            <Typography key={name} color="text.primary">
              {displayName}
            </Typography>
          ) : (
            <Link
              key={name}
              component={RouterLink}
              to={routeTo}
              sx={{ textDecoration: 'none' }}
              color="inherit"
            >
              {displayName}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;


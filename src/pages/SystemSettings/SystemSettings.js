import React from 'react';
import { Box, Typography } from '@mui/material';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const SystemSettings = () => {
  return (
    <Box>
      {/* Page Header with Title and Breadcrumb */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        width: '100%',
      }}>
        <Typography 
          variant="h5" 
          component="h1" 
          sx={{ 
            fontWeight: 700, 
            color: '#1a1a1a',
            fontSize: '1.5rem',
            flex: '0 0 auto',
          }}
        >
          System Settings
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flex: '0 0 auto',
          ml: 'auto',
        }}>
          <Breadcrumbs />
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        backgroundColor: '#fafafa',
        borderRadius: 2,
        border: '1px dashed #e0e0e0',
      }}>
        <Typography variant="h6" color="text.secondary">
          System Settings - Coming Soon
        </Typography>
      </Box>
    </Box>
  );
};

export default SystemSettings;


import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const hideBreadcrumbs = location.pathname === '/dashboard' || location.pathname === '/categories' || location.pathname === '/subcategories';

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Topbar sidebarOpen={sidebarOpen} onSidebarToggle={handleSidebarToggle} />
      <Sidebar open={sidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { 
            xs: 0,
            sm: sidebarOpen ? '260px' : '70px' 
          },
          width: { 
            xs: '100%',
            sm: sidebarOpen ? `calc(100% - 260px)` : 'calc(100% - 70px)' 
          },
          transition: 'width 0.3s ease, margin-left 0.3s ease',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Toolbar />
        {!hideBreadcrumbs && <Breadcrumbs />}
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;


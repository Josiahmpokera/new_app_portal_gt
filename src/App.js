import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import SubCategories from './pages/SubCategories';
import News from './pages/News';
import FlashNews from './pages/FlashNews';
import UserManagement from './pages/UserManagement';
import SystemSettings from './pages/SystemSettings';
import { ROUTES } from './constants/routes';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Component to redirect authenticated users away from login
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  
  return children;
};

// Component to handle root route
const RootRoute = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  
  return <Navigate to={ROUTES.LOGIN} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CATEGORIES}
        element={
          <ProtectedRoute>
            <MainLayout>
              <Categories />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SUBCATEGORIES}
        element={
          <ProtectedRoute>
            <MainLayout>
              <SubCategories />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.NEWS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <News />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.FLASH_NEWS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <FlashNews />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.USER_MANAGEMENT}
        element={
          <ProtectedRoute>
            <MainLayout>
              <UserManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SYSTEM_SETTINGS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <SystemSettings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<RootRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

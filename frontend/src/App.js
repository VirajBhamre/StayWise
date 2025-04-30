import React from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import stayWiseTheme from './styles/theme';

// Admin Pages
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import AdminDashboard from './pages/AdminDashboard';

// Warden Pages
import WardenLoginPage from './pages/WardenLoginPage';
import WardenDashboard from './pages/WardenDashboard';

// Hosteller Pages
import HostellerLoginPage from './pages/HostellerLoginPage';
import HostellerDashboard from './pages/HostellerDashboard';

// Public Pages
import LandingPage from './pages/LandingPage';
import AccessRequestPage from './pages/AccessRequestPage'; 

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={stayWiseTheme.config.initialColorMode} />
      <ChakraProvider theme={stayWiseTheme}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Access Request Page */}
              <Route path="/access-request" element={<AccessRequestPage />} />
              
              {/* Public Auth Routes - Admin login doesn't appear on LandingPage but is directly accessible by URL */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/register" element={<AdminRegisterPage />} />
              <Route path="/warden/login" element={<WardenLoginPage />} />
              <Route path="/hosteller/login" element={<HostellerLoginPage />} />
              
              {/* Protected Admin Routes */}
              <Route path="/admin/*" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              
              {/* Protected Warden Routes */}
              <Route path="/warden/*" element={<ProtectedRoute role="warden"><WardenDashboard /></ProtectedRoute>} />
              
              {/* Protected Hosteller Routes */}
              <Route path="/hosteller/*" element={<ProtectedRoute role="hosteller"><HostellerDashboard /></ProtectedRoute>} />
              
              {/* Redirect any other routes to the landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </>
  );
}

export default App;
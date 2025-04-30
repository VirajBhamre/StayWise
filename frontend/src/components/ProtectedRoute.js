import { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, userRole, loading } = useContext(AuthContext);
  const location = useLocation();

  // Handle loading state with spinner
  if (loading) {
    return (
      <Center height="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Checking authentication...</Text>
        </VStack>
      </Center>
    );
  }

  // Check if user is authenticated and has the right role
  if (!user || (role !== "*" && userRole !== role)) {
    // Redirect to the appropriate login page based on role
    const loginPaths = {
      admin: '/admin/login',
      warden: '/warden/login',
      hosteller: '/hosteller/login',
      "*": '/'
    };
    
    // Save the attempted URL to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    
    return <Navigate to={loginPaths[role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
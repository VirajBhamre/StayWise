import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, FormControl, FormLabel, 
  Input, VStack, Heading, Alert, 
  AlertIcon, useColorModeValue 
} from '@chakra-ui/react';
import { loginAdmin } from '../../services/api';
import AuthContext from '../../context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await loginAdmin(email, password);
      login(data, 'admin', navigate);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      p={8} 
      maxWidth="500px" 
      borderWidth={1} 
      borderRadius={8} 
      boxShadow="lg"
      bg={bgColor}
      borderColor={borderColor}
    >
      <VStack spacing={4}>
        <Heading size="lg">Admin Login</Heading>
        
        {error && (
          <Alert status="error" borderRadius={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={loading}
            >
              Login
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default LoginForm;
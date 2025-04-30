import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, FormControl, FormLabel,
  Input, VStack, Heading, Alert, AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { registerAdmin } from '../../services/api';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      await registerAdmin(name, email, password);
      navigate('/admin/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
        <Heading size="lg">Admin Registration</Heading>
        
        {error && (
          <Alert status="error" borderRadius={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl id="name" isRequired>
              <FormLabel>Name</FormLabel>
              <Input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            
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
            
            <FormControl id="confirmPassword" isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <Input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={loading}
            >
              Register
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default RegisterForm;
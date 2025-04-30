import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, FormControl, FormLabel, 
  Input, VStack, Heading, Alert, 
  AlertIcon, Text, useToken, Icon,
  InputGroup, InputLeftElement, InputRightElement,
  HStack
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaBuilding, FaEye, FaEyeSlash } from 'react-icons/fa';
import { loginHosteller } from '../services/api';
import AuthContext from '../context/AuthContext';

const MotionBox = motion(Box);

const HostellerLoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hostelId, setHostelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [gold400, gold500, gold600] = useToken('colors', ['gold.400', 'gold.500', 'gold.600']);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Clear all tokens from localStorage first to prevent token conflicts
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('wardenInfo');
      localStorage.removeItem('hostellerInfo');
      
      console.log('Attempting hosteller login with username:', username);
      const response = await loginHosteller(username, password, hostelId);
      console.log('Login response received:', { hasToken: !!response.token });
      
      if (!response.token) {
        throw new Error('No token received from server');
      }
      
      login(response, 'hosteller');
      
      // Use a small timeout to ensure localStorage updates completely before navigation
      setTimeout(() => {
        console.log('Navigating to hosteller dashboard');
        navigate('/hosteller/dashboard');
      }, 300);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      width="100%"
    >
      <VStack spacing={6} align="stretch">
        {error && (
          <Alert 
            status="error" 
            borderRadius="md"
            bg="rgba(229, 62, 62, 0.1)" 
            borderLeft="4px solid" 
            borderColor="red.500" 
            color="white"
          >
            <AlertIcon color="red.400" />
            <Text>{error}</Text>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={5}>
            <FormControl id="username" isRequired>
              <FormLabel 
                color="text.secondary" 
                fontWeight="medium"
                fontSize="sm"
              >
                Username
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaUser} color="whiteAlpha.500" />
                </InputLeftElement>
                <Input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  bg="background.accent"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "gold.500" }}
                  _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                />
              </InputGroup>
            </FormControl>
            
            <FormControl id="password" isRequired>
              <FormLabel 
                color="text.secondary" 
                fontWeight="medium"
                fontSize="sm"
              >
                Password
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaLock} color="whiteAlpha.500" />
                </InputLeftElement>
                <Input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  bg="background.accent"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "gold.500" }}
                  _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                />
                <InputRightElement width="3rem">
                  <Icon
                    as={showPassword ? FaEyeSlash : FaEye}
                    cursor="pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    color="whiteAlpha.600"
                    _hover={{ color: "gold.400" }}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            
            <FormControl id="hostelId" isRequired>
              <FormLabel 
                color="text.secondary" 
                fontWeight="medium"
                fontSize="sm"
              >
                Hostel ID
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaBuilding} color="whiteAlpha.500" />
                </InputLeftElement>
                <Input 
                  type="text"
                  value={hostelId}
                  onChange={(e) => setHostelId(e.target.value)} 
                  placeholder="e.g. HST-7971669D"
                  bg="background.accent"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "gold.500" }}
                  _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                />
              </InputGroup>
              <Text mt={1} fontSize="xs" color="whiteAlpha.700">
                The Hostel ID was provided by your warden during registration
              </Text>
            </FormControl>
            
            <Button
              type="submit"
              bg="gold.500"
              color="black"
              width="full"
              fontSize="md"
              fontWeight="semibold"
              mt={2}
              height="48px"
              isLoading={loading}
              _hover={{
                bg: "gold.600",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(255, 202, 40, 0.3)"
              }}
              _active={{
                bg: "gold.700",
                transform: "translateY(0)",
                boxShadow: "none"
              }}
              transition="all 0.3s ease"
            >
              Sign In
            </Button>
          </VStack>
        </form>
      </VStack>
    </MotionBox>
  );
};

export default HostellerLoginForm;
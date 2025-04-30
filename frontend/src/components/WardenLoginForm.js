import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, FormControl, FormLabel, 
  Input, VStack, Heading, Alert, 
  AlertIcon, Text, Flex, InputGroup,
  InputLeftElement, Icon, Divider,
  useToken, InputRightElement
} from '@chakra-ui/react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { loginWarden } from '../services/api';
import AuthContext from '../context/AuthContext';

const MotionBox = motion(Box);

const WardenLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      // Clear any existing authentication data first
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('wardenInfo');
      localStorage.removeItem('hostellerInfo');
      
      console.log('Attempting warden login with:', { email });
      const data = await loginWarden(email, password);
      console.log('Login successful. Response data:', data);
      
      // Make sure the token is included in the response
      if (!data.token) {
        throw new Error('No authentication token received from server');
      }
      
      // Store user data and token in AuthContext and localStorage
      login(data, 'warden');
      
      // Wait a moment to ensure localStorage is updated before navigating
      setTimeout(() => {
        console.log('User data stored, navigating to dashboard');
        navigate('/warden/dashboard');
      }, 300);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      p={8} 
      maxWidth="450px" 
      width="100%"
      borderWidth="1px"
      borderRadius="xl"
      boxShadow="0 10px 30px rgba(0, 0, 0, 0.4)"
      bg="background.secondary"
      borderColor="whiteAlpha.200"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '5px',
        bgGradient: `linear(to-r, ${gold400}, ${gold600}, ${gold400})`,
      }}
    >
      <VStack spacing={6}>
        <Flex direction="column" align="center" mb={2}>
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Heading 
              size="xl" 
              bgGradient={`linear(to-r, ${gold400}, ${gold600})`} 
              bgClip="text" 
              letterSpacing="tight" 
              mb={1}
              fontFamily="heading"
              fontWeight="bold"
            >
              StayWise
            </Heading>
          </MotionBox>
          <Text 
            color="text.secondary" 
            fontSize="md"
            fontWeight="medium"
            letterSpacing="wide"
          >
            Warden Executive Portal
          </Text>
        </Flex>
        
        <Divider borderColor="whiteAlpha.200" />
        
        <MotionBox 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          width="100%"
        >
          {error && (
            <Alert 
              status="error" 
              borderRadius="md" 
              bg="rgba(229, 62, 62, 0.1)" 
              color="white"
              mb={6}
              borderLeft="4px solid"
              borderColor="red.500"
            >
              <AlertIcon color="red.400" />
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={5}>
              <FormControl id="email" isRequired>
                <FormLabel 
                  color="text.secondary"
                  fontSize="sm"
                  fontWeight="medium"
                  letterSpacing="wide"
                >
                  Email Address
                </FormLabel>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<Icon as={FaEnvelope} color="whiteAlpha.500" />}
                  />
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "gold.500" }}
                    _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                    bg="background.accent"
                    placeholder="your@email.com"
                    size="lg"
                    borderRadius="md"
                    fontSize="md"
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl id="password" isRequired>
                <FormLabel 
                  color="text.secondary"
                  fontSize="sm"
                  fontWeight="medium"
                  letterSpacing="wide"
                >
                  Password
                </FormLabel>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<Icon as={FaLock} color="whiteAlpha.500" />}
                  />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "gold.500" }}
                    _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                    bg="background.accent"
                    placeholder="Enter your password"
                    size="lg"
                    borderRadius="md"
                    fontSize="md"
                  />
                  <InputRightElement>
                    <Button 
                      variant="ghost"
                      size="sm"
                      color="whiteAlpha.600"
                      onClick={toggleShowPassword}
                      _hover={{ color: "gold.500", bg: "transparent" }}
                    >
                      <Icon as={showPassword ? FaEyeSlash : FaEye} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <Button
                type="submit"
                bg="gold.500"
                color="black"
                width="full"
                size="lg"
                fontSize="md"
                fontWeight="semibold"
                isLoading={loading}
                _hover={{ bg: "gold.600" }}
                _active={{ bg: "gold.700" }}
                borderRadius="md"
                boxShadow="0 4px 10px rgba(255, 202, 40, 0.3)"
                mt={4}
                letterSpacing="wide"
                height="54px"
              >
                Sign In
              </Button>
            </VStack>
          </form>
        </MotionBox>
      </VStack>
    </MotionBox>
  );
};

export default WardenLoginForm;
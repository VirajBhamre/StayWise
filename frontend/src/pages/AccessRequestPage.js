import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button, 
  Container,
  FormControl, 
  FormLabel,
  Heading, 
  Input, 
  VStack, 
  Text,
  Textarea,
  Alert,
  AlertIcon,
  NumberInput,
  NumberInputField,
  Link,
  Grid,
  GridItem,
  Flex,
  HStack,
  useToken,
  Icon,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Divider
} from '@chakra-ui/react';
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, 
  FaHotel, FaMapMarkerAlt, FaDoorOpen, FaMoneyBillWave 
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { submitAccessRequest } from '../services/api';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const AccessRequestPage = () => {
  const [formData, setFormData] = useState({
    name: 'Rahul Sharma',               
    email: 'rahul.sharma@example.com',
    phone: '9988776655',
    password: 'SecurePass123',           
    confirmPassword: 'SecurePass123',    
    hostelName: 'Golden Heights Hostel',
    address: '45 University Road, Knowledge Park, Bangalore - 560032',
    totalRooms: '75',
    rentPerMonth: '6500'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gold400, gold500, gold600] = useToken('colors', ['gold.400', 'gold.500', 'gold.600']);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate numeric fields
    if (isNaN(formData.totalRooms) || parseInt(formData.totalRooms) <= 0) {
      setError('Total rooms must be a positive number');
      return;
    }

    if (isNaN(formData.rentPerMonth) || parseFloat(formData.rentPerMonth) <= 0) {
      setError('Rent per month must be a positive number');
      return;
    }

    setLoading(true);
    
    try {
      await submitAccessRequest({
        name: formData.name,           // Changed from wardenName to name
        email: formData.email,
        phone: formData.phone,
        password: formData.password,   // Added password
        hostelName: formData.hostelName,
        address: formData.address,
        totalRooms: parseInt(formData.totalRooms),
        rentPerMonth: parseFloat(formData.rentPerMonth)
      });
      
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Flex
        minHeight="100vh"
        width="full"
        align="center"
        justify="center"
        bgGradient="linear(to-br, background.primary, #111927, #000913)"
        backgroundSize="cover"
        backgroundAttachment="fixed"
        p={4}
      >
        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          maxW="600px"
          width="full"
          p={8}
          bg="rgba(20, 20, 20, 0.8)"
          backdropFilter="blur(10px)"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          boxShadow="0 20px 50px rgba(0, 0, 0, 0.5)"
          textAlign="center"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            bgGradient: `linear(to-r, ${gold400}, ${gold600})`,
          }}
        >
          <VStack spacing={6}>
            <Flex justify="center" mb={2}>
              <Icon as={FaHotel} color="gold.500" boxSize={16} />
            </Flex>
            
            <Heading 
              size="xl"
              bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
              bgClip="text"
              fontFamily="heading"
              letterSpacing="tight"
              mb={2}
            >
              Request Submitted!
            </Heading>
            
            <Text fontSize="lg" mb={2}>
              Your hostel registration request has been submitted successfully. Our admin team will review 
              your request and contact you at the provided phone number for verification.
            </Text>
            
            <Text fontSize="md" color="text.secondary" mb={4}>
              Upon approval, you will receive an email with your login credentials and hostel ID.
            </Text>
            
            <Button 
              as={RouterLink} 
              to="/" 
              bg="gold.500"
              color="black"
              _hover={{ 
                bg: "gold.600",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(255, 202, 40, 0.3)"
              }}
              size="lg"
              px={8}
              fontWeight="semibold"
              transition="all 0.3s ease"
            >
              Return to Home
            </Button>
          </VStack>
        </MotionBox>
      </Flex>
    );
  }

  return (
    <Flex
      minHeight="100vh"
      width="full"
      align="center"
      justify="center"
      bgGradient="linear(to-br, background.primary, #111927, #000913)"
      backgroundSize="cover"
      backgroundAttachment="fixed"
      p={6}
      position="relative"
      overflow="hidden"
    >
      {/* Background decorative elements */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        overflow="hidden"
        pointerEvents="none"
        opacity={0.05}
        zIndex={0}
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <MotionBox
            key={i}
            position="absolute"
            top={`${Math.random() * 100}%`}
            left={`${Math.random() * 100}%`}
            width={`${Math.random() * 40 + 20}px`}
            height={`${Math.random() * 40 + 20}px`}
            borderRadius="full"
            border={`1px solid ${gold400}`}
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              y: [0, Math.random() * 50, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 20, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        ))}
      </Box>
      
      <MotionFlex
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        maxWidth="1200px"
        width="full"
        bg="rgba(20, 20, 20, 0.8)"
        backdropFilter="blur(10px)"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        boxShadow="0 20px 50px rgba(0, 0, 0, 0.5)"
        p={{ base: 6, md: 8 }}
        direction="column"
        position="relative"
        overflow="hidden"
        zIndex={1}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          bgGradient: `linear(to-r, ${gold400}, ${gold600})`,
        }}
      >
        <VStack spacing={6} align="stretch" mb={6}>
          <Flex direction="column" align="center">
            <Heading 
              textStyle="logo"
              fontSize="4xl"
              mb={2}
              bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
              bgClip="text"
              letterSpacing="tight"
              fontFamily="heading"
            >
              StayWise
            </Heading>
            <Text 
              color="text.secondary" 
              fontSize="lg" 
              fontWeight="medium"
              letterSpacing="wide"
            >
              Hostel Registration Application
            </Text>
          </Flex>
          
          {error && (
            <Alert 
              status="error" 
              borderRadius="md"
              bg="rgba(229, 62, 62, 0.1)"
              color="white"
              borderLeft="4px solid"
              borderColor="red.500"
            >
              <AlertIcon color="red.400" />
              {error}
            </Alert>
          )}
        </VStack>
          
        <form onSubmit={handleSubmit}>
          <Grid 
            templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
            gap={{ base: 6, lg: 10 }}
          >
            <GridItem>
              <VStack spacing={6} align="stretch">
                <Heading 
                  size="md"
                  color="gold.500"
                  fontFamily="heading"
                  letterSpacing="tight"
                  display="flex"
                  alignItems="center"
                  mb={1}
                >
                  <Icon as={FaUser} mr={2} /> Warden Information
                </Heading>
                <Divider borderColor="whiteAlpha.200" />
                
                <FormControl isRequired>
                  <FormLabel color="text.secondary" fontWeight="medium" fontSize="sm">Warden Name</FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaUser} color="whiteAlpha.500" />
                    </InputLeftElement>
                    <Input 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      bg="background.accent"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: "gold.500" }}
                      _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                      placeholder="Enter your full name"
                    />
                  </InputGroup>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color="text.secondary" fontWeight="medium" fontSize="sm">Email Address</FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaEnvelope} color="whiteAlpha.500" />
                    </InputLeftElement>
                    <Input 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      bg="background.accent"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: "gold.500" }}
                      _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                      placeholder="your@email.com"
                    />
                  </InputGroup>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color="text.secondary" fontWeight="medium" fontSize="sm">Phone Number</FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaPhone} color="whiteAlpha.500" />
                    </InputLeftElement>
                    <Input 
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      bg="background.accent"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: "gold.500" }}
                      _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                      placeholder="Your contact number"
                    />
                  </InputGroup>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color="text.secondary" fontWeight="medium" fontSize="sm">Password</FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaLock} color="whiteAlpha.500" />
                    </InputLeftElement>
                    <Input 
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      bg="background.accent"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: "gold.500" }}
                      _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                      placeholder="Create a secure password"
                    />
                    <InputRightElement>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowPassword(!showPassword)}
                        color="whiteAlpha.600"
                        _hover={{ color: "gold.500", bg: "transparent" }}
                      >
                        <Icon as={showPassword ? FaEyeSlash : FaEye} />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color="text.secondary" fontWeight="medium" fontSize="sm">Confirm Password</FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaLock} color="whiteAlpha.500" />
                    </InputLeftElement>
                    <Input 
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      bg="background.accent"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: "gold.500" }}
                      _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                      placeholder="Confirm your password"
                    />
                    <InputRightElement>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        color="whiteAlpha.600"
                        _hover={{ color: "gold.500", bg: "transparent" }}
                      >
                        <Icon as={showConfirmPassword ? FaEyeSlash : FaEye} />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              </VStack>
            </GridItem>
            
            <GridItem>
              <VStack spacing={6} align="stretch">
                <Heading 
                  size="md"
                  color="gold.500"
                  fontFamily="heading"
                  letterSpacing="tight"
                  display="flex"
                  alignItems="center"
                  mb={1}
                >
                  <Icon as={FaHotel} mr={2} /> Hostel Information
                </Heading>
                <Divider borderColor="whiteAlpha.200" />
                
                <FormControl isRequired>
                  <FormLabel color="text.secondary" fontWeight="medium" fontSize="sm">Hostel Name</FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaHotel} color="whiteAlpha.500" />
                    </InputLeftElement>
                    <Input 
                      name="hostelName"
                      value={formData.hostelName}
                      onChange={handleChange}
                      bg="background.accent"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: "gold.500" }}
                      _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                      placeholder="Enter your hostel name"
                    />
                  </InputGroup>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color="text.secondary" fontWeight="medium" fontSize="sm">Address</FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaMapMarkerAlt} color="whiteAlpha.500" />
                    </InputLeftElement>
                    <Textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      bg="background.accent"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: "gold.500" }}
                      _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                      placeholder="Enter complete address"
                      pl={10}
                      rows={3}
                    />
                  </InputGroup>
                </FormControl>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel color="text.secondary" fontWeight="medium" fontSize="sm">Total Rooms</FormLabel>
                      <InputGroup size="md">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaDoorOpen} color="whiteAlpha.500" />
                        </InputLeftElement>
                        <NumberInput min={1} value={formData.totalRooms}>
                          <NumberInputField 
                            name="totalRooms"
                            value={formData.totalRooms}
                            onChange={handleChange}
                            bg="background.accent"
                            borderColor="whiteAlpha.300"
                            _hover={{ borderColor: "gold.500" }}
                            _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                            placeholder="Room count"
                            pl={10}
                          />
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel color="text.secondary" fontWeight="medium" fontSize="sm">Rent per Month</FormLabel>
                      <InputGroup size="md">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaMoneyBillWave} color="whiteAlpha.500" />
                        </InputLeftElement>
                        <NumberInput min={1} precision={2} value={formData.rentPerMonth}>
                          <NumberInputField 
                            name="rentPerMonth"
                            value={formData.rentPerMonth}
                            onChange={handleChange}
                            bg="background.accent"
                            borderColor="whiteAlpha.300"
                            _hover={{ borderColor: "gold.500" }}
                            _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                            placeholder="Monthly rent"
                            pl={10}
                          />
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  </GridItem>
                </Grid>
                
                <VStack spacing={4} align="center" mt={4}>
                  <Button
                    type="submit"
                    bg="gold.500"
                    color="black"
                    size="lg"
                    width={{ base: "full", md: "70%" }}
                    fontSize="md"
                    fontWeight="semibold"
                    isLoading={loading}
                    loadingText="Submitting..."
                    _hover={{ 
                      bg: "gold.600",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(255, 202, 40, 0.3)"
                    }}
                    _active={{
                      bg: "gold.700",
                      transform: "translateY(0)"
                    }}
                    height="54px"
                    transition="all 0.3s ease"
                  >
                    Submit Registration Request
                  </Button>
                  
                  <Text color="text.secondary" fontSize="sm">
                    Already have an account? <Link as={RouterLink} to="/warden/login" color="gold.500" fontWeight="medium" _hover={{ color: "gold.300", textDecoration: "underline" }}>Sign in here</Link>
                  </Text>
                </VStack>
              </VStack>
            </GridItem>
          </Grid>
        </form>
      </MotionFlex>
    </Flex>
  );
};

export default AccessRequestPage;
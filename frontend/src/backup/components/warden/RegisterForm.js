import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, FormControl, FormLabel,
  Input, VStack, Heading, Alert, AlertIcon,
  useColorModeValue, NumberInput, NumberInputField,
  Divider, Text
} from '@chakra-ui/react';
import { registerWardenRequest } from '../../services/api';

const RegisterForm = () => {
  const [wardenData, setWardenData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    hostelName: '',
    address: '',
    totalRooms: '',
    rentPerMonth: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWardenData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name, value) => {
    setWardenData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (wardenData.password !== wardenData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate numeric fields
    if (isNaN(wardenData.totalRooms) || parseInt(wardenData.totalRooms) <= 0) {
      setError('Total rooms must be a positive number');
      return;
    }

    if (isNaN(wardenData.rentPerMonth) || parseFloat(wardenData.rentPerMonth) <= 0) {
      setError('Rent per month must be a positive number');
      return;
    }

    setLoading(true);
    
    try {
      await registerWardenRequest({
        name: wardenData.name,
        email: wardenData.email,
        password: wardenData.password,
        phone: wardenData.phone,
        hostelName: wardenData.hostelName,
        address: wardenData.address,
        totalRooms: parseInt(wardenData.totalRooms),
        rentPerMonth: parseFloat(wardenData.rentPerMonth)
      });
      
      setSuccess('Registration request submitted successfully. Awaiting admin approval.');
      setTimeout(() => {
        navigate('/warden/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      p={8} 
      maxWidth="600px" 
      borderWidth={1} 
      borderRadius={8} 
      boxShadow="lg"
      bg={bgColor}
      borderColor={borderColor}
    >
      <VStack spacing={4}>
        <Heading size="lg">Hostel Registration</Heading>
        
        {error && (
          <Alert status="error" borderRadius={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {success && (
          <Alert status="success" borderRadius={4}>
            <AlertIcon />
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <Text fontWeight="bold" alignSelf="flex-start">Warden Information</Text>
            
            <FormControl id="name" isRequired>
              <FormLabel>Warden Name</FormLabel>
              <Input 
                name="name"
                type="text"
                value={wardenData.name}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                name="email"
                type="email"
                value={wardenData.email}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl id="phone" isRequired>
              <FormLabel>Phone</FormLabel>
              <Input 
                name="phone"
                type="tel"
                value={wardenData.phone}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input 
                name="password"
                type="password"
                value={wardenData.password}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl id="confirmPassword" isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <Input 
                name="confirmPassword"
                type="password"
                value={wardenData.confirmPassword}
                onChange={handleChange}
              />
            </FormControl>
            
            <Divider my={2} />
            
            <Text fontWeight="bold" alignSelf="flex-start">Hostel Information</Text>
            
            <FormControl id="hostelName" isRequired>
              <FormLabel>Hostel Name</FormLabel>
              <Input 
                name="hostelName"
                type="text"
                value={wardenData.hostelName}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl id="address" isRequired>
              <FormLabel>Hostel Address</FormLabel>
              <Input 
                name="address"
                type="text"
                value={wardenData.address}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl id="totalRooms" isRequired>
              <FormLabel>Total Rooms</FormLabel>
              <NumberInput min={1}>
                <NumberInputField 
                  name="totalRooms"
                  value={wardenData.totalRooms}
                  onChange={handleChange}
                />
              </NumberInput>
            </FormControl>
            
            <FormControl id="rentPerMonth" isRequired>
              <FormLabel>Rent per Month</FormLabel>
              <NumberInput min={1} precision={2}>
                <NumberInputField 
                  name="rentPerMonth"
                  value={wardenData.rentPerMonth}
                  onChange={handleChange}
                />
              </NumberInput>
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={loading}
              mt={4}
            >
              Submit Registration
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default RegisterForm;
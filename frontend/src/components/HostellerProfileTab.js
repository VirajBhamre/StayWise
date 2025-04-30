import React, { useState } from 'react';
import {
  Box, Button, VStack, FormControl, FormLabel,
  Input, useToast, Heading, Divider,
  Alert, AlertIcon, Text, useToken, Icon,
  InputGroup, InputLeftElement, HStack, Badge
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaPhone, FaUser, FaEnvelope, FaDoorOpen, FaBuilding, FaKey } from 'react-icons/fa';
import { updateHostellerProfile } from '../services/api';

const MotionBox = motion(Box);

const HostellerProfileTab = ({ profile }) => {
  const [formData, setFormData] = useState({
    phone: profile?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const toast = useToast();
  const [gold400, gold500, gold600] = useToken('colors', ['gold.400', 'gold.500', 'gold.600']);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateHostellerProfile(formData);
      setSuccess('Profile updated successfully');
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={8}
        p={6}
        borderRadius="xl"
        layerStyle="glassmorphism"
      >
        <Heading 
          size="md" 
          mb={4}
          display="flex"
          alignItems="center"
          bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
          bgClip="text"
        >
          <Icon as={FaUser} mr={2} />
          Personal Information
        </Heading>
        
        <VStack align="stretch" spacing={4}>
          <HStack spacing={8} wrap="wrap">
            <Box flex="1" minW="200px">
              <HStack spacing={2} mb={2}>
                <Icon as={FaUser} color="gold.400" />
                <Text color="text.secondary" fontWeight="medium">Name:</Text>
              </HStack>
              <Text fontWeight="semibold" fontSize="lg">{profile?.name}</Text>
            </Box>
            
            <Box flex="1" minW="200px">
              <HStack spacing={2} mb={2}>
                <Icon as={FaEnvelope} color="gold.400" />
                <Text color="text.secondary" fontWeight="medium">Email:</Text>
              </HStack>
              <Text fontWeight="semibold" fontSize="lg">{profile?.email}</Text>
            </Box>
          </HStack>
          
          <HStack spacing={8} wrap="wrap">
            <Box flex="1" minW="200px">
              <HStack spacing={2} mb={2}>
                <Icon as={FaDoorOpen} color="gold.400" />
                <Text color="text.secondary" fontWeight="medium">Room:</Text>
              </HStack>
              <Text fontWeight="semibold" fontSize="lg">
                {profile?.room} 
                <Badge colorScheme="green" ml={2} borderRadius="full" px={2}>Active</Badge>
              </Text>
            </Box>
            
            <Box flex="1" minW="200px">
              <HStack spacing={2} mb={2}>
                <Icon as={FaBuilding} color="gold.400" />
                <Text color="text.secondary" fontWeight="medium">Hostel:</Text>
              </HStack>
              <Text fontWeight="semibold" fontSize="lg">{profile?.hostel?.name}</Text>
            </Box>
          </HStack>
        </VStack>
      </MotionBox>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        mb={8}
        p={6}
        borderRadius="xl"
        layerStyle="glassmorphism"
      >
        <Heading 
          size="md" 
          mb={4}
          display="flex"
          alignItems="center"
          bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
          bgClip="text"
        >
          <Icon as={FaPhone} mr={2} />
          Update Contact Information
        </Heading>

        {error && (
          <Alert status="error" mb={4} bg="rgba(229, 62, 62, 0.1)" borderLeft="4px solid" borderColor="red.500" borderRadius="md">
            <AlertIcon color="red.400" />
            {error}
          </Alert>
        )}

        {success && (
          <Alert status="success" mb={4} bg="rgba(72, 187, 120, 0.1)" borderLeft="4px solid" borderColor="green.500" borderRadius="md">
            <AlertIcon color="green.400" />
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl mb={4} isRequired>
            <FormLabel color="text.secondary" fontWeight="medium">Phone Number</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaPhone} color="whiteAlpha.500" />
              </InputLeftElement>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                bg="background.accent"
                borderColor="whiteAlpha.300"
                _hover={{ borderColor: "gold.500" }}
                _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
              />
            </InputGroup>
          </FormControl>

          <Button
            type="submit"
            bg="gold.500"
            color="black"
            isLoading={loading}
            _hover={{
              bg: "gold.600",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
            }}
            transition="all 0.3s ease"
          >
            Update Profile
          </Button>
        </form>
      </MotionBox>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        p={6}
        borderRadius="xl"
        layerStyle="glassmorphism"
      >
        <Heading 
          size="md" 
          mb={4}
          display="flex"
          alignItems="center"
          bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
          bgClip="text"
        >
          <Icon as={FaKey} mr={2} />
          Password Management
        </Heading>
        
        <Text color="text.secondary" fontSize="md">
          To change your password, please contact your hostel warden. For security reasons, password changes require warden authorization.
        </Text>
      </MotionBox>
    </Box>
  );
};

export default HostellerProfileTab;
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  useColorModeValue,
  Text,
  PinInput,
  PinInputField,
  HStack,
  FormHelperText
} from '@chakra-ui/react';
import { verifyAdminOTP } from '../services/api';
import AuthContext from '../context/AuthContext';

const AdminOTPVerification = ({ email, onCancel }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Timer for OTP expiration
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await verifyAdminOTP(email, otp);
      login(data, 'admin', navigate);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
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
        <Heading size="lg">OTP Verification</Heading>
        <Text>We've sent a 6-digit code to virajbhamre55@gmail.com</Text>

        {error && (
          <Alert status="error" borderRadius={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        <form onSubmit={handleVerify} style={{ width: '100%' }}>
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Enter OTP</FormLabel>
              <HStack justify="center">
                <PinInput otp onChange={(value) => setOtp(value)}>
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                </PinInput>
              </HStack>
              <FormHelperText textAlign="center">
                This code will expire in {formatTime(countdown)}
              </FormHelperText>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              mt={4}
              isLoading={loading}
            >
              Verify OTP
            </Button>

            <Button
              variant="outline"
              width="full"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default AdminOTPVerification;
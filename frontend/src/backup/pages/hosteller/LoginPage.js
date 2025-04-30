import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Flex, Text, Link, Box } from '@chakra-ui/react';
import LoginForm from '../../components/hosteller/LoginForm';

const LoginPage = () => {
  return (
    <Flex 
      minHeight="100vh"
      width="full"
      align="center"
      justifyContent="center"
      direction="column"
      p={4}
    >
      <LoginForm />
      <Box mt={4}>
        <Text textAlign="center">
          New to the system? Please contact your hostel warden to get registered.
        </Text>
      </Box>
    </Flex>
  );
};

export default LoginPage;
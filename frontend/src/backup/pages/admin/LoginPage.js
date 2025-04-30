import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Flex, Text, Link, Box } from '@chakra-ui/react';
import LoginForm from '../../components/admin/LoginForm';

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
          New admin? {" "}
          <Link as={RouterLink} to="/admin/register" color="blue.500">
            Register here
          </Link>
        </Text>
      </Box>
    </Flex>
  );
};

export default LoginPage;
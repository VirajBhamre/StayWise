import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Flex, Text, Link, Box } from '@chakra-ui/react';
import RegisterForm from '../../components/admin/RegisterForm';

const RegisterPage = () => {
  return (
    <Flex 
      minHeight="100vh"
      width="full"
      align="center"
      justifyContent="center"
      direction="column"
      p={4}
    >
      <RegisterForm />
      <Box mt={4}>
        <Text textAlign="center">
          Already have an account? {" "}
          <Link as={RouterLink} to="/admin/login" color="blue.500">
            Login here
          </Link>
        </Text>
      </Box>
    </Flex>
  );
};

export default RegisterPage;
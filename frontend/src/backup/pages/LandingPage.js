import React from 'react';
import { Box, Heading, Text, Container, Button, VStack, HStack, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const LandingPage = () => {
  return (
    <Container maxW="container.xl" p={4}>
      <Box textAlign="center" py={10}>
        <Heading as="h1" size="2xl" mb={4}>
          Hostel Management System
        </Heading>
        <Text fontSize="xl" mb={8}>
          A complete solution for hostel administration and student accommodation management
        </Text>
        
        <VStack spacing={8} mt={10}>
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              Login as:
            </Heading>
            <HStack spacing={4} justifyContent="center">
              <Button as={RouterLink} to="/admin/login" colorScheme="blue" size="lg">
                Admin
              </Button>
              <Button as={RouterLink} to="/warden/login" colorScheme="green" size="lg">
                Warden
              </Button>
              <Button as={RouterLink} to="/hosteller/login" colorScheme="purple" size="lg">
                Hosteller
              </Button>
            </HStack>
          </Box>
          
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              New user?
            </Heading>
            <HStack spacing={4} justifyContent="center">
              <Button as={RouterLink} to="/admin/register" variant="outline" colorScheme="blue">
                Admin Registration
              </Button>
              <Button as={RouterLink} to="/warden/register" variant="outline" colorScheme="green">
                Warden Registration
              </Button>
            </HStack>
            <Text mt={4} fontSize="sm">
              Hostellers are registered by their warden
            </Text>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

export default LandingPage;
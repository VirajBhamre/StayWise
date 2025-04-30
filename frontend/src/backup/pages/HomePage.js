import React from 'react';
import { Box, Heading, Text, Container } from '@chakra-ui/react';

const HomePage = () => {
  return (
    <Container maxW="container.xl" p={4}>
      <Box textAlign="center" py={10}>
        <Heading as="h1" size="2xl" mb={4}>
          Hostel Management System
        </Heading>
        <Text fontSize="xl">
          Welcome to our hostel management platform
        </Text>
      </Box>
    </Container>
  );
};

export default HomePage;
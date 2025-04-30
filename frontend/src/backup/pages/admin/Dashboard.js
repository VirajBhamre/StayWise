import React, { useContext } from 'react';
import { 
  Box, Heading, Text, SimpleGrid, Stat, StatLabel, 
  StatNumber, StatGroup, Button, Flex, useColorModeValue 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Dashboard = () => {
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Admin Dashboard</Heading>
          <Text mt={2} color="gray.600">Welcome, {admin?.name || 'Admin'}!</Text>
        </Box>
        <Button colorScheme="red" onClick={handleLogout}>Logout</Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderColor={borderColor} borderRadius="md">
          <Stat>
            <StatLabel>Total Students</StatLabel>
            <StatNumber>0</StatNumber>
          </Stat>
        </Box>
        <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderColor={borderColor} borderRadius="md">
          <Stat>
            <StatLabel>Total Rooms</StatLabel>
            <StatNumber>0</StatNumber>
          </Stat>
        </Box>
        <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderColor={borderColor} borderRadius="md">
          <Stat>
            <StatLabel>Available Rooms</StatLabel>
            <StatNumber>0</StatNumber>
          </Stat>
        </Box>
        <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderColor={borderColor} borderRadius="md">
          <Stat>
            <StatLabel>Pending Requests</StatLabel>
            <StatNumber>0</StatNumber>
          </Stat>
        </Box>
      </SimpleGrid>

      <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderColor={borderColor} borderRadius="md">
        <Heading size="md" mb={4}>Recent Activities</Heading>
        <Text color="gray.500">No recent activities to display.</Text>
      </Box>
    </Box>
  );
};

export default Dashboard;
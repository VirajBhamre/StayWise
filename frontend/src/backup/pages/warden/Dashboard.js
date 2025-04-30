import React, { useContext, useEffect, useState } from 'react';
import { 
  Box, Heading, Text, SimpleGrid, Stat, StatLabel, 
  StatNumber, Button, Flex, useColorModeValue, 
  Tabs, TabList, TabPanels, Tab, TabPanel, Spinner
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { getWardenStats } from '../../services/api';
import HostellersList from '../../components/warden/HostellersList';
import ComplaintsList from '../../components/warden/ComplaintsList';
import MaintenanceList from '../../components/warden/MaintenanceList';
import EventsList from '../../components/warden/EventsList';
import PaymentStatus from '../../components/warden/PaymentStatus';
import Layout from '../../components/warden/Layout';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getWardenStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/warden/login');
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={8}>
          <Box>
            <Heading size="lg">Warden Dashboard</Heading>
            <Text mt={2} color="gray.600">
              Welcome, {user?.name || 'Warden'}! - {user?.hostel?.name || 'Hostel'}
            </Text>
          </Box>
        </Flex>
        
        {error && (
          <Box mb={4} p={3} bg="red.100" color="red.700" borderRadius="md">
            {error}
          </Box>
        )}

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderColor={borderColor} borderRadius="md">
            <Stat>
              <StatLabel>Total Students</StatLabel>
              <StatNumber>{stats?.totalHostellers || 0}</StatNumber>
            </Stat>
          </Box>
          <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderColor={borderColor} borderRadius="md">
            <Stat>
              <StatLabel>Occupied Rooms</StatLabel>
              <StatNumber>{stats?.occupiedRooms || 0}</StatNumber>
            </Stat>
          </Box>
          <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderColor={borderColor} borderRadius="md">
            <Stat>
              <StatLabel>Available Rooms</StatLabel>
              <StatNumber>{stats?.availableRooms || 0}</StatNumber>
            </Stat>
          </Box>
          <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderColor={borderColor} borderRadius="md">
            <Stat>
              <StatLabel>Pending Complaints</StatLabel>
              <StatNumber>{stats?.pendingComplaints || 0}</StatNumber>
            </Stat>
          </Box>
        </SimpleGrid>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Hostellers</Tab>
            <Tab>Complaints</Tab>
            <Tab>Maintenance</Tab>
            <Tab>Events</Tab>
            <Tab>Payments</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <HostellersList />
            </TabPanel>
            <TabPanel>
              <ComplaintsList />
            </TabPanel>
            <TabPanel>
              <MaintenanceList />
            </TabPanel>
            <TabPanel>
              <EventsList />
            </TabPanel>
            <TabPanel>
              <PaymentStatus />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Layout>
  );
};

export default Dashboard;
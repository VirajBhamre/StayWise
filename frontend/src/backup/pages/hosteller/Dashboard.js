import React, { useContext, useEffect, useState } from 'react';
import { 
  Box, Heading, Text, SimpleGrid, Stat, StatLabel, 
  StatNumber, Tabs, TabList, TabPanels, Tab, TabPanel,
  Flex, useColorModeValue, Button, Spinner
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { getHostellerProfile } from '../../services/api';
import ComplaintsTab from '../../components/hosteller/ComplaintsTab';
import MaintenanceTab from '../../components/hosteller/MaintenanceTab';
import PaymentsTab from '../../components/hosteller/PaymentsTab';
import EventsTab from '../../components/hosteller/EventsTab';
import ProfileTab from '../../components/hosteller/ProfileTab';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getHostellerProfile();
        setProfile(data);
      } catch (err) {
        setError('Failed to load profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/hosteller/login');
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Hosteller Dashboard</Heading>
          <Text mt={2} color="gray.600">
            Welcome, {user?.name || 'Hosteller'}!
          </Text>
        </Box>
        <Button colorScheme="red" onClick={handleLogout}>Logout</Button>
      </Flex>
      
      {error && (
        <Box mb={4} p={3} bg="red.100" color="red.700" borderRadius="md">
          {error}
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderColor={borderColor} borderRadius="md">
          <Stat>
            <StatLabel>Room Number</StatLabel>
            <StatNumber>{profile?.room || 'N/A'}</StatNumber>
          </Stat>
        </Box>
        <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderColor={borderColor} borderRadius="md">
          <Stat>
            <StatLabel>Hostel</StatLabel>
            <StatNumber>{profile?.hostel?.name || 'N/A'}</StatNumber>
          </Stat>
        </Box>
        <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderColor={borderColor} borderRadius="md">
          <Stat>
            <StatLabel>Rent Payment Status</StatLabel>
            <StatNumber color={profile?.rentPaid ? "green.500" : "red.500"}>
              {profile?.rentPaid ? 'Paid' : 'Due'}
            </StatNumber>
          </Stat>
        </Box>
      </SimpleGrid>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Profile</Tab>
          <Tab>Complaints</Tab>
          <Tab>Maintenance</Tab>
          <Tab>Rent Payments</Tab>
          <Tab>Events</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ProfileTab profile={profile} />
          </TabPanel>
          <TabPanel>
            <ComplaintsTab />
          </TabPanel>
          <TabPanel>
            <MaintenanceTab />
          </TabPanel>
          <TabPanel>
            <PaymentsTab profile={profile} />
          </TabPanel>
          <TabPanel>
            <EventsTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Dashboard;
import React, { useContext, useEffect, useState } from 'react';
import { 
  Box, Heading, Text, SimpleGrid, Stat, StatLabel, 
  StatNumber, Button, Flex, Spinner, Alert, AlertIcon, 
  Tabs, TabList, Tab, TabPanels, TabPanel, Container,
  useToken, Icon, HStack, Divider
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaSignOutAlt, FaUserGraduate, FaDoorOpen, 
  FaDoorClosed, FaClipboardList } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import { getAdminStats } from '../services/api';
import AdminHostelRequestsList from '../components/AdminHostelRequestsList';
import AdminApprovedHostelsList from '../components/AdminApprovedHostelsList';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gold400, gold500, gold600] = useToken('colors', ['gold.400', 'gold.500', 'gold.600']);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
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
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <Flex 
        minH="100vh" 
        align="center" 
        justify="center"
        bgGradient="linear(to-br, background.primary, #111927, #000913)"
        backgroundSize="cover"
        backgroundAttachment="fixed"
      >
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Spinner 
            thickness="4px"
            speed="0.65s"
            color="gold.500"
            size="xl"
          />
        </MotionBox>
      </Flex>
    );
  }

  return (
    <Box
      minHeight="100vh"
      bgGradient="linear(to-br, background.primary, #111927, #000913)"
      backgroundSize="cover"
      backgroundAttachment="fixed"
      py={6}
    >
      <Container maxW="container.xl">
        <MotionFlex
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          justify="space-between" 
          align="center" 
          mb={8}
        >
          <Box>
            <HStack spacing={3} mb={1}>
              <Icon as={FaUserShield} color="gold.500" boxSize={6} />
              <Heading 
                size="lg"
                bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
                bgClip="text"
                letterSpacing="tight"
              >
                Admin Dashboard
              </Heading>
            </HStack>
            <Text mt={2} color="text.secondary" fontWeight="medium">
              Welcome, {user?.name || 'Admin'}!
            </Text>
          </Box>
          <Button 
            leftIcon={<Icon as={FaSignOutAlt} />}
            onClick={handleLogout}
            variant="outline"
            borderColor="gold.500"
            color="gold.500"
            _hover={{
              bg: "rgba(255, 202, 40, 0.1)",
              borderColor: "gold.400"
            }}
            transition="all 0.3s ease"
          >
            Logout
          </Button>
        </MotionFlex>

        {error && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            mb={6} 
            p={4} 
            bg="rgba(229, 62, 62, 0.1)" 
            borderLeft="4px solid" 
            borderColor="red.500" 
            color="white" 
            borderRadius="md"
          >
            <AlertIcon color="red.400" />
            {error}
          </MotionBox>
        )}

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              layerStyle="statCard"
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Icon as={FaUserGraduate} color="gold.500" boxSize={5} />
              </Flex>
              <Stat>
                <StatLabel color="text.secondary" fontWeight="medium" fontSize="sm">Total Students</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" letterSpacing="tight">
                  {stats?.totalHostellers || 0}
                </StatNumber>
              </Stat>
            </MotionBox>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              layerStyle="statCard"
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Icon as={FaDoorOpen} color="gold.500" boxSize={5} />
              </Flex>
              <Stat>
                <StatLabel color="text.secondary" fontWeight="medium" fontSize="sm">Total Rooms</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" letterSpacing="tight">
                  {stats?.totalRooms || 0}
                </StatNumber>
              </Stat>
            </MotionBox>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              layerStyle="statCard"
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Icon as={FaDoorClosed} color="gold.500" boxSize={5} />
              </Flex>
              <Stat>
                <StatLabel color="text.secondary" fontWeight="medium" fontSize="sm">Available Rooms</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" letterSpacing="tight">
                  {stats?.availableRooms || 0}
                </StatNumber>
              </Stat>
            </MotionBox>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              layerStyle="statCard"
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Icon as={FaClipboardList} color="gold.500" boxSize={5} />
              </Flex>
              <Stat>
                <StatLabel color="text.secondary" fontWeight="medium" fontSize="sm">Pending Requests</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" letterSpacing="tight" color={stats?.pendingRequests > 0 ? "gold.400" : "inherit"}>
                  {stats?.pendingRequests || 0}
                </StatNumber>
              </Stat>
            </MotionBox>
          </SimpleGrid>
        </MotionBox>

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          layerStyle="glassmorphism"
          p={0}
          mb={6}
          overflow="hidden"
        >
          <Tabs 
            variant="line" 
            colorScheme="gold" 
            p={6}
            isLazy
          >
            <TabList
              mb={4}
              borderBottomColor="whiteAlpha.300"
              borderBottomWidth="1px"
              gap={8}
              overflowX="auto"
              css={{
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              <Tab 
                color="text.secondary" 
                _selected={{ 
                  color: "gold.500", 
                  borderColor: "gold.500",
                  fontWeight: "semibold"
                }}
                _hover={{
                  color: "gold.300"
                }}
                fontSize="md"
                fontWeight="medium"
                px={4}
                py={3}
              >
                Hostel Requests
              </Tab>
              <Tab 
                color="text.secondary" 
                _selected={{ 
                  color: "gold.500", 
                  borderColor: "gold.500",
                  fontWeight: "semibold"
                }}
                _hover={{
                  color: "gold.300"
                }}
                fontSize="md"
                fontWeight="medium"
                px={4}
                py={3}
              >
                Approved Hostels
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0} pt={4}>
                <AdminHostelRequestsList />
              </TabPanel>
              <TabPanel p={0} pt={4}>
                <AdminApprovedHostelsList />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Dashboard;
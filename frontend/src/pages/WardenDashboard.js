import React, { useContext, useEffect, useState } from 'react';
import { 
  Box, Heading, Text, SimpleGrid, Stat, StatLabel, 
  StatNumber, Tabs, TabList, TabPanels, Tab, TabPanel,
  Flex, Spinner, useDisclosure, Icon, HStack, Button,
  Circle, Divider, Badge, useToken, keyframes
} from '@chakra-ui/react';
import { 
  FaUserGraduate, FaDoorOpen, FaClipboardCheck, FaExclamationCircle,
  FaChartLine, FaBell, FaCog, FaExchangeAlt
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { 
  getWardenStats, 
  getHostelInfo, 
  checkRoomArchitecture 
} from '../services/api';
import WardenLayout from '../components/WardenLayout';
import WardenHostellersList from '../components/WardenHostellersList';
import WardenComplaintsList from '../components/WardenComplaintsList';
import WardenMaintenanceList from '../components/WardenMaintenanceList';
import WardenEventsList from '../components/WardenEventsList';
import WardenPaymentStatus from '../components/WardenPaymentStatus';
import RoomArchitectureSetup from '../components/RoomArchitectureSetup';
import ArchitectureRequiredModal from '../components/ArchitectureRequiredModal';

const MotionBox = motion(Box);

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 202, 40, 0.1); }
  70% { box-shadow: 0 0 0 10px rgba(255, 202, 40, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 202, 40, 0); }
`;

const glimmer = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`;

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  // Using underscore prefix to indicate intentionally unused variable
  const [_hostelInfo, setHostelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRoomSetupRequired, setIsRoomSetupRequired] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [gold400, gold600] = useToken('colors', ['gold.400', 'gold.600']);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if room architecture is defined
        const architectureStatus = await checkRoomArchitecture();
        setIsRoomSetupRequired(!architectureStatus.isRoomArchitectureDefined);
        
        if (!architectureStatus.isRoomArchitectureDefined) {
          onOpen(); // Show modal if room setup is required
        }
        
        // Fetch other data only if room architecture is defined
        if (architectureStatus.isRoomArchitectureDefined) {
          const [statsData, hostelData] = await Promise.all([
            getWardenStats(),
            getHostelInfo()
          ]);
          setStats(statsData);
          setHostelInfo(hostelData);
        }
        
        setError('');
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [onOpen]);

  const handleLogout = () => {
    logout();
    navigate('/warden/login');
  };

  const handleRoomSetupComplete = () => {
    setIsRoomSetupRequired(false);
    // Refresh data
    getWardenStats().then(data => setStats(data));
    getHostelInfo().then(data => setHostelInfo(data));
    onClose();
  };

  const handleSetupRoomsNow = () => {
    setIsRoomSetupRequired(true);
    onClose();
  };

  if (loading) {
    return (
      <WardenLayout onLogout={handleLogout}>
        <Flex 
          minH="100vh" 
          align="center" 
          justify="center" 
          direction="column"
          gap={4}
        >
          <Spinner 
            size="xl" 
            color="gold.500" 
            thickness="4px" 
            speed="0.8s"
            emptyColor="whiteAlpha.200"
          />
          <Text color="gold.400" fontFamily="heading" letterSpacing="wide">
            Loading your premium dashboard...
          </Text>
        </Flex>
      </WardenLayout>
    );
  }

  if (isRoomSetupRequired) {
    return (
      <WardenLayout onLogout={handleLogout}>
        <Box p={4}>
          <RoomArchitectureSetup onComplete={handleRoomSetupComplete} />
        </Box>
      </WardenLayout>
    );
  }

  return (
    <WardenLayout onLogout={handleLogout}>
      <Box
        p={{ base: 4, md: 8 }}
        backgroundImage="linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)"
      >
        {/* Header Section */}
        <Flex 
          justify="space-between" 
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          mb={{ base: 6, md: 10 }}
          gap={{ base: 4, md: 0 }}
        >
          <Box>
            <Heading 
              size="xl" 
              fontFamily="heading"
              bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
              bgClip="text" 
              letterSpacing="tight"
              fontWeight="bold"
              mb={2}
            >
              StayWise Executive Dashboard
            </Heading>
            <Text 
              color="text.secondary" 
              fontSize="md" 
              fontWeight="medium"
              letterSpacing="wide"
            >
              Welcome, {user?.name || 'Warden'} | {user?.hostel?.name || 'Hostel'}
            </Text>
          </Box>
          
          <HStack spacing={4} display={{ base: "none", md: "flex" }}>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Icon as={FaChartLine} />}
              _hover={{ bg: "whiteAlpha.100", color: "gold.400" }}
              color="text.secondary"
              borderRadius="full"
            >
              Analytics
            </Button>
            <Box position="relative">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Icon as={FaBell} />}
                _hover={{ bg: "whiteAlpha.100", color: "gold.400" }}
                color="text.secondary"
                borderRadius="full"
              >
                Notifications
              </Button>
              <Circle 
                size="18px" 
                bg="red.500" 
                color="white" 
                fontSize="xs" 
                position="absolute" 
                top="-5px" 
                right="-5px"
                borderWidth="2px"
                borderColor="background.primary"
              >
                3
              </Circle>
            </Box>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Icon as={FaCog} />}
              _hover={{ bg: "whiteAlpha.100", color: "gold.400" }}
              color="text.secondary"
              borderRadius="full"
            >
              Settings
            </Button>
          </HStack>
        </Flex>
        
        {error && (
          <MotionBox 
            mb={6}
            p={4}
            bg="rgba(229, 62, 62, 0.1)" 
            color="white"
            borderLeft="4px solid" 
            borderColor="red.500"
            borderRadius="md"
            boxShadow="lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Flex align="center" gap={3}>
              <Icon as={FaExclamationCircle} color="red.500" boxSize={5} />
              <Text fontWeight="medium">{error}</Text>
            </Flex>
          </MotionBox>
        )}

        {/* Status Cards Section */}
        <SimpleGrid 
          columns={{ base: 1, sm: 2, lg: 4 }} 
          spacing={{ base: 4, lg: 6 }} 
          mb={{ base: 6, lg: 10 }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            layerStyle="statCard"
            borderRadius="xl"
            overflow="hidden"
            position="relative"
            _hover={{
              transform: "translateY(-8px)",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.6)"
            }}
            sx={{
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(to bottom right, rgba(255, 202, 40, 0.15), transparent 80%)",
                zIndex: 0
              }
            }}
          >
            <Flex justify="space-between" position="relative" zIndex={1}>
              <Stat>
                <StatLabel 
                  color="text.secondary" 
                  fontWeight="semibold" 
                  fontSize="sm"
                  letterSpacing="wide"
                  textTransform="uppercase"
                  mb={3}
                >
                  Total Students
                </StatLabel>
                <StatNumber 
                  color="text.primary" 
                  fontSize="4xl" 
                  fontWeight="bold"
                  letterSpacing="tight"
                  fontFamily="heading"
                >
                  {stats?.totalHostellers || 0}
                </StatNumber>
                <Text 
                  color="gold.400" 
                  fontSize="sm" 
                  fontWeight="medium" 
                  mt={1}
                >
                  <Icon as={FaExchangeAlt} boxSize={3} mr={1} />
                  2 new this month
                </Text>
              </Stat>
              <Box position="absolute" top={3} right={3} zIndex={1}>
                <Circle 
                  size="45px" 
                  bg="rgba(20, 20, 20, 0.7)" 
                  color="gold.400"
                  boxShadow="0 4px 8px rgba(0,0,0,0.2)"
                  sx={{
                    animation: `${pulse} 2s infinite`
                  }}
                >
                  <Icon as={FaUserGraduate} boxSize={5} />
                </Circle>
              </Box>
            </Flex>
          </MotionBox>
          
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            layerStyle="statCard"
            borderRadius="xl"
            overflow="hidden"
            position="relative"
            _hover={{
              transform: "translateY(-8px)",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.6)"
            }}
            sx={{
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(to bottom right, rgba(255, 202, 40, 0.15), transparent 80%)",
                zIndex: 0
              }
            }}
          >
            <Flex justify="space-between" position="relative" zIndex={1}>
              <Stat>
                <StatLabel 
                  color="text.secondary" 
                  fontWeight="semibold" 
                  fontSize="sm"
                  letterSpacing="wide"
                  textTransform="uppercase"
                  mb={3}
                >
                  Total Rooms
                </StatLabel>
                <StatNumber 
                  color="text.primary" 
                  fontSize="4xl" 
                  fontWeight="bold"
                  letterSpacing="tight"
                  fontFamily="heading"
                >
                  {stats?.totalRooms || 0}
                </StatNumber>
                <HStack mt={1} spacing={1}>
                  <Badge 
                    colorScheme="yellow" 
                    variant="subtle" 
                    px={2} 
                    borderRadius="full"
                    fontSize="xs"
                  >
                    {Math.round((stats?.totalRooms - stats?.availableRooms) / stats?.totalRooms * 100) || 0}% OCCUPIED
                  </Badge>
                </HStack>
              </Stat>
              <Box position="absolute" top={3} right={3} zIndex={1}>
                <Circle 
                  size="45px" 
                  bg="rgba(20, 20, 20, 0.7)" 
                  color="gold.400"
                  boxShadow="0 4px 8px rgba(0,0,0,0.2)"
                  sx={{
                    animation: `${pulse} 2s infinite`,
                    animationDelay: "0.5s"
                  }}
                >
                  <Icon as={FaDoorOpen} boxSize={5} />
                </Circle>
              </Box>
            </Flex>
          </MotionBox>
          
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            layerStyle="statCard"
            borderRadius="xl"
            overflow="hidden"
            position="relative"
            _hover={{
              transform: "translateY(-8px)",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.6)"
            }}
            sx={{
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(to bottom right, rgba(255, 202, 40, 0.15), transparent 80%)",
                zIndex: 0
              }
            }}
          >
            <Flex justify="space-between" position="relative" zIndex={1}>
              <Stat>
                <StatLabel 
                  color="text.secondary" 
                  fontWeight="semibold" 
                  fontSize="sm"
                  letterSpacing="wide"
                  textTransform="uppercase"
                  mb={3}
                >
                  Available Rooms
                </StatLabel>
                <StatNumber 
                  color="text.primary" 
                  fontSize="4xl" 
                  fontWeight="bold"
                  letterSpacing="tight"
                  fontFamily="heading"
                >
                  {stats?.availableRooms || 0}
                </StatNumber>
                <HStack mt={1} spacing={1}>
                  <Badge 
                    colorScheme="green" 
                    variant="subtle" 
                    px={2} 
                    borderRadius="full"
                    fontSize="xs"
                  >
                    READY FOR ALLOCATION
                  </Badge>
                </HStack>
              </Stat>
              <Box position="absolute" top={3} right={3} zIndex={1}>
                <Circle 
                  size="45px" 
                  bg="rgba(20, 20, 20, 0.7)" 
                  color="gold.400"
                  boxShadow="0 4px 8px rgba(0,0,0,0.2)"
                  sx={{
                    animation: `${pulse} 2s infinite`,
                    animationDelay: "1s"
                  }}
                >
                  <Icon as={FaClipboardCheck} boxSize={5} />
                </Circle>
              </Box>
            </Flex>
          </MotionBox>
          
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            layerStyle="statCard"
            borderRadius="xl"
            overflow="hidden"
            position="relative"
            _hover={{
              transform: "translateY(-8px)",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.6)"
            }}
            sx={{
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(to bottom right, rgba(255, 202, 40, 0.15), transparent 80%)",
                zIndex: 0
              }
            }}
          >
            <Flex justify="space-between" position="relative" zIndex={1}>
              <Stat>
                <StatLabel 
                  color="text.secondary" 
                  fontWeight="semibold" 
                  fontSize="sm"
                  letterSpacing="wide"
                  textTransform="uppercase"
                  mb={3}
                >
                  Pending Complaints
                </StatLabel>
                <StatNumber 
                  color="text.primary" 
                  fontSize="4xl" 
                  fontWeight="bold"
                  letterSpacing="tight"
                  fontFamily="heading"
                >
                  {stats?.pendingComplaints || 0}
                </StatNumber>
                <HStack mt={1} spacing={1}>
                  {stats?.pendingComplaints > 0 ? (
                    <Badge 
                      colorScheme="red" 
                      variant="subtle" 
                      px={2} 
                      borderRadius="full"
                      fontSize="xs"
                    >
                      REQUIRES ATTENTION
                    </Badge>
                  ) : (
                    <Badge 
                      colorScheme="green" 
                      variant="subtle" 
                      px={2} 
                      borderRadius="full"
                      fontSize="xs"
                    >
                      ALL RESOLVED
                    </Badge>
                  )}
                </HStack>
              </Stat>
              <Box position="absolute" top={3} right={3} zIndex={1}>
                <Circle 
                  size="45px" 
                  bg="rgba(20, 20, 20, 0.7)" 
                  color="gold.400"
                  boxShadow="0 4px 8px rgba(0,0,0,0.2)"
                  sx={{
                    animation: `${pulse} 2s infinite`,
                    animationDelay: "1.5s"
                  }}
                >
                  <Icon as={FaExclamationCircle} boxSize={5} />
                </Circle>
              </Box>
            </Flex>
          </MotionBox>
        </SimpleGrid>

        {/* Main Content Tabs */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          layerStyle="glassmorphism"
          borderRadius="xl"
          p={0}
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
          overflow="hidden"
          position="relative"
        >
          {/* Golden accent line at top */}
          <Box 
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="3px"
            bgGradient={`linear(to-r, ${gold400}, ${gold600}, ${gold400})`}
            sx={{
              animation: `${glimmer} 3s infinite ease-in-out`
            }}
          />

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
                Hostellers
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
                Complaints
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
                Maintenance
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
                Events
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
                Payments
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0} pt={4}>
                <WardenHostellersList />
              </TabPanel>
              <TabPanel p={0} pt={4}>
                <WardenComplaintsList />
              </TabPanel>
              <TabPanel p={0} pt={4}>
                <WardenMaintenanceList />
              </TabPanel>
              <TabPanel p={0} pt={4}>
                <WardenEventsList />
              </TabPanel>
              <TabPanel p={0} pt={4}>
                <WardenPaymentStatus />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </MotionBox>
      </Box>
      
      <ArchitectureRequiredModal 
        isOpen={isOpen} 
        onClose={onClose} 
        onProceed={handleSetupRoomsNow} 
      />
    </WardenLayout>
  );
};

export default Dashboard;
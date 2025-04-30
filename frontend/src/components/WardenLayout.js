import React from 'react';
import { 
  Box, Flex, IconButton, useDisclosure, VStack, 
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, 
  DrawerContent, DrawerCloseButton, Text, Heading, 
  Button, Divider, Icon
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUsers, FaExclamationCircle, 
  FaTools, FaCalendarAlt, FaCreditCard, FaSignOutAlt 
} from 'react-icons/fa';

const Layout = ({ children, onLogout }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/warden/dashboard', icon: FaHome },
    { name: 'Hostellers', path: '/warden/hostellers', icon: FaUsers },
    { name: 'Complaints', path: '/warden/complaints', icon: FaExclamationCircle },
    { name: 'Maintenance', path: '/warden/maintenance', icon: FaTools },
    { name: 'Events', path: '/warden/events', icon: FaCalendarAlt },
    { name: 'Payments', path: '/warden/payments', icon: FaCreditCard },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <VStack align="stretch" spacing={1} h="full">
      <Flex 
        direction="column" 
        align="center" 
        p={4} 
        bgGradient="linear(to-b, brand.secondary, background.secondary)"
      >
        <Heading 
          size="lg" 
          bgGradient="linear(to-r, gold.400, gold.600)" 
          bgClip="text" 
          letterSpacing="tight"
          mb={1}
        >
          StayWise
        </Heading>
        <Text color="text.secondary" fontSize="sm">Warden Portal</Text>
      </Flex>
      
      <Divider borderColor="whiteAlpha.300" />
      
      <VStack align="stretch" p={3} flex="1">
        {menuItems.map((item) => (
          <Button 
            key={item.path}
            variant="ghost" 
            justifyContent="flex-start"
            as={Link} 
            to={item.path}
            onClick={onClose}
            leftIcon={<Icon as={item.icon} />}
            bg={isActive(item.path) ? "whiteAlpha.100" : "transparent"}
            color={isActive(item.path) ? "gold.500" : "text.secondary"}
            _hover={{
              bg: "whiteAlpha.200",
              color: "gold.500"
            }}
            mb={1}
            borderRadius="md"
          >
            {item.name}
          </Button>
        ))}
      </VStack>
      
      <Divider borderColor="whiteAlpha.300" mt="auto" />
      
      <Box p={3}>
        <Button 
          variant="outline" 
          justifyContent="flex-start"
          borderColor="red.500"
          color="red.400"
          leftIcon={<Icon as={FaSignOutAlt} />}
          onClick={onLogout}
          _hover={{
            bg: "red.900",
            color: "white"
          }}
          w="full"
        >
          Logout
        </Button>
      </Box>
    </VStack>
  );

  return (
    <Box minH="100vh" bg="background.primary">
      {/* Mobile nav */}
      <Flex
        display={{ base: 'flex', md: 'none' }}
        alignItems="center"
        px={4}
        py={2}
        borderBottomWidth="1px"
        borderBottomColor="whiteAlpha.200"
        bg="background.secondary"
        justifyContent="space-between"
      >
        <IconButton
          icon={<HamburgerIcon />}
          onClick={onOpen}
          variant="ghost"
          aria-label="Open menu"
          color="text.primary"
          _hover={{ bg: "whiteAlpha.200" }}
        />

        <Heading 
          size="md" 
          bgGradient="linear(to-r, gold.400, gold.600)" 
          bgClip="text"
          letterSpacing="tight"
        >
          StayWise
        </Heading>
      </Flex>

      {/* Sidebar for mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay>
          <DrawerContent bg="background.secondary" color="text.primary">
            <DrawerCloseButton color="text.secondary" />
            <DrawerHeader borderBottomWidth="1px" borderBottomColor="whiteAlpha.200">
              StayWise Menu
            </DrawerHeader>
            <DrawerBody p={0}>
              <SidebarContent />
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>

      {/* Desktop sidebar */}
      <Flex>
        <Box
          w="250px"
          pos="fixed"
          h="100vh"
          display={{ base: 'none', md: 'block' }}
          borderRightWidth="1px"
          borderRightColor="whiteAlpha.200"
          bg="background.secondary"
        >
          <SidebarContent />
        </Box>

        {/* Main content area */}
        <Box
          ml={{ base: 0, md: '250px' }}
          w="full"
          bg="background.primary"
          minH="100vh"
        >
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;
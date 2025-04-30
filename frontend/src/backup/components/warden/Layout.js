import React from 'react';
import { Box, Flex, HStack, IconButton, useDisclosure, VStack, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, Text, Heading, Button } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

const Layout = ({ children, onLogout }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const menuItems = [
    { name: 'Dashboard', path: '/warden/dashboard' },
    { name: 'Hostellers', path: '/warden/hostellers' },
    { name: 'Complaints', path: '/warden/complaints' },
    { name: 'Maintenance', path: '/warden/maintenance' },
    { name: 'Events', path: '/warden/events' },
    { name: 'Payments', path: '/warden/payments' },
  ];

  const SidebarContent = () => (
    <VStack align="stretch" spacing={3}>
      <Heading size="md" px={3} py={4}>Warden Panel</Heading>
      {menuItems.map((item) => (
        <Button 
          key={item.path}
          variant="ghost" 
          justifyContent="flex-start"
          as={Link} 
          to={item.path}
          onClick={onClose}
        >
          {item.name}
        </Button>
      ))}
      <Button 
        variant="ghost" 
        justifyContent="flex-start"
        colorScheme="red" 
        onClick={onLogout}
      >
        Logout
      </Button>
    </VStack>
  );

  return (
    <Box minH="100vh">
      {/* Mobile nav */}
      <Flex
        display={{ base: 'flex', md: 'none' }}
        alignItems="center"
        px={4}
        py={2}
        borderBottomWidth="1px"
      >
        <IconButton
          icon={<HamburgerIcon />}
          onClick={onOpen}
          variant="ghost"
          aria-label="Open menu"
        />

        <Text ml={3} fontSize="xl" fontWeight="bold">Hostel Management</Text>
      </Flex>

      {/* Sidebar for mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Menu</DrawerHeader>
            <DrawerBody>
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
          h="full"
          display={{ base: 'none', md: 'block' }}
          borderRightWidth="1px"
        >
          <SidebarContent />
        </Box>

        {/* Main content area */}
        <Box
          ml={{ base: 0, md: '250px' }}
          p={4}
          w="full"
        >
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, FormControl, FormLabel,
  Input, ModalFooter, useDisclosure, useToast, 
  NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper,
  Badge, Text, Select, Flex, HStack, Divider,
  Menu, MenuButton, MenuList, MenuItem, useToken,
  InputGroup, InputLeftElement, Stack, Icon, Tooltip,
  Tag, TagLabel, Avatar, Grid
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
// Change the import format for Font Awesome icons
import { 
  FaUserPlus, FaExchangeAlt, FaSearch, FaSort, FaSortUp, FaSortDown,
  FaUserEdit, FaTrash, FaEye, FaKey, FaUserAlt, FaBed, FaEnvelope,
  FaPhone, FaIdCard, FaCalendarAlt, FaClock, FaMoneyBillWave, FaBuilding
} from 'react-icons/fa';
import { 
  getAllHostellers, 
  addHosteller, 
  updateHosteller, 
  removeHosteller,
  getHostellerDetails,
  resetHostellerPassword,
  exchangeRooms 
} from '../services/api';

const MotionBox = motion(Box);

const WardenHostellersList = () => {
  const [hostellers, setHostellers] = useState([]);
  const [filteredHostellers, setFilteredHostellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHosteller, setSelectedHosteller] = useState(null);
  const [hostellerDetails, setHostellerDetails] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    parentPhone: '',
    duration: 12
  });

  const [exchangeData, setExchangeData] = useState({
    hosteller1Id: '',
    hosteller2Id: ''
  });

  // Search and sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterOption, setFilterOption] = useState('all');

  const { 
    isOpen: isAddEditOpen, 
    onOpen: onAddEditOpen, 
    onClose: onAddEditClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDetailsOpen, 
    onOpen: onDetailsOpen, 
    onClose: onDetailsClose 
  } = useDisclosure();

  const { 
    isOpen: isExchangeOpen, 
    onOpen: onExchangeOpen, 
    onClose: onExchangeClose 
  } = useDisclosure();

  const toast = useToast();
  const [gold400, gold500, gold600] = useToken('colors', ['gold.400', 'gold.500', 'gold.600']);

  const fetchHostellers = async () => {
    try {
      setLoading(true);
      const data = await getAllHostellers();
      setHostellers(data);
      setFilteredHostellers(data);
      setError('');
    } catch (err) {
      setError('Failed to load hostellers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostellers();
  }, []);

  // Apply search, sorting and filtering whenever criteria changes
  useEffect(() => {
    let result = [...hostellers];
    
    // Apply filtering
    if (filterOption !== 'all') {
      switch (filterOption) {
        case 'dueRent':
          result = result.filter(h => !h.rentPaid);
          break;
        case 'paidRent':
          result = result.filter(h => h.rentPaid);
          break;
        case 'expiringSoon':
          // Filter hostellers whose stay expires within 30 days
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          result = result.filter(h => 
            h.endDate && new Date(h.endDate) <= thirtyDaysFromNow
          );
          break;
        default:
          break;
      }
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(h => 
        h.name.toLowerCase().includes(query) ||
        h.email.toLowerCase().includes(query) ||
        h.phone.includes(query) ||
        h.room.toString().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'room':
          aValue = a.room;
          bValue = b.room;
          break;
        case 'endDate':
          aValue = a.endDate ? new Date(a.endDate) : new Date(0);
          bValue = b.endDate ? new Date(b.endDate) : new Date(0);
          break;
        case 'rentStatus':
          aValue = a.rentPaid ? 1 : 0;
          bValue = b.rentPaid ? 1 : 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    setFilteredHostellers(result);
  }, [hostellers, searchQuery, sortField, sortDirection, filterOption]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDurationChange = (value) => {
    setFormData({ ...formData, duration: value });
  };

  const handleExchangeChange = (e) => {
    setExchangeData({ ...exchangeData, [e.target.name]: e.target.value });
  };

  const handleAddModal = () => {
    setSelectedHosteller(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      parentPhone: '',
      duration: 12
    });
    onAddEditOpen();
  };

  const handleEditModal = (hosteller) => {
    setSelectedHosteller(hosteller);
    setFormData({
      name: hosteller.name,
      email: hosteller.email,
      phone: hosteller.phone,
      parentPhone: hosteller.parentPhone || '',
      duration: hosteller.duration || 12
    });
    onAddEditOpen();
  };

  const handleViewDetails = async (hostellerId) => {
    try {
      const details = await getHostellerDetails(hostellerId);
      setHostellerDetails(details);
      onDetailsOpen();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to get hosteller details',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
    }
  };

  const handleResetPassword = async (hostellerId) => {
    try {
      const result = await resetHostellerPassword(hostellerId);
      toast({
        title: 'Password Reset Successful',
        description: (
          <Box>
            <Text>New password: <strong>{result.newPassword}</strong></Text>
            <Text mt={2} fontSize="sm">Please provide this to the hosteller.</Text>
          </Box>
        ),
        status: 'success',
        duration: 15000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to reset password',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
    }
  };

  const handleExchangeModal = () => {
    setExchangeData({
      hosteller1Id: '',
      hosteller2Id: ''
    });
    onExchangeOpen();
  };

  const handleExchangeSubmit = async (e) => {
    e.preventDefault();
    
    if (exchangeData.hosteller1Id === exchangeData.hosteller2Id) {
      toast({
        title: 'Error',
        description: 'Cannot exchange room with the same hosteller',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
      return;
    }
    
    try {
      await exchangeRooms(exchangeData);
      toast({
        title: 'Rooms exchanged',
        description: 'Rooms have been successfully exchanged',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
      onExchangeClose();
      fetchHostellers();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to exchange rooms',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedHosteller) {
        // Update existing hosteller
        await updateHosteller(selectedHosteller._id, {
          name: formData.name,
          phone: formData.phone,
          parentPhone: formData.parentPhone,
          duration: formData.duration
        });
        toast({
          title: 'Hosteller updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: "top-right",
          variant: "solid",
        });
      } else {
        // Add new hosteller
        const result = await addHosteller({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          parentPhone: formData.parentPhone,
          duration: formData.duration
        });
        
        // Show generated credentials
        toast({
          title: 'Hosteller added',
          description: (
            <Box>
              <Text>Username: <strong>{result.username}</strong></Text>
              <Text>Password: <strong>{result.password}</strong></Text>
              <Text>Room: <strong>{result.room}</strong></Text>
            </Box>
          ),
          status: 'success',
          duration: 10000,
          isClosable: true,
          position: "top-right",
          variant: "solid",
        });
      }
      onAddEditClose();
      fetchHostellers();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Operation failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this hosteller?')) {
      try {
        await removeHosteller(id);
        toast({
          title: 'Hosteller removed',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: "top-right",
          variant: "solid",
        });
        fetchHostellers();
      } catch (err) {
        toast({
          title: 'Error',
          description: err.response?.data?.message || 'Delete failed',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: "top-right",
          variant: "solid",
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 'N/A';
    
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Handle sort column click
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <Icon as={FaSort} opacity={0.5} />;
    return sortDirection === 'asc' ? <Icon as={FaSortUp} color="gold.400" /> : <Icon as={FaSortDown} color="gold.400" />;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100%" py={8}>
        <Spinner 
          thickness="4px"
          speed="0.65s"
          color="gold.500"
          size="xl"
        />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading 
          size="md" 
          bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
          bgClip="text"
          display="flex"
          alignItems="center"
        >
          <Icon as={FaUserAlt} mr={2} />
          Hostellers Management
        </Heading>
        <HStack>
          <Button 
            leftIcon={<Icon as={FaExchangeAlt} />} 
            variant="outline" 
            borderColor="whiteAlpha.300"
            color="text.secondary"
            _hover={{ 
              bg: "whiteAlpha.100", 
              borderColor: "gold.500",
              color: "white"
            }}
            onClick={handleExchangeModal}
          >
            Exchange Rooms
          </Button>
          <Button 
            leftIcon={<Icon as={FaUserPlus} />} 
            bg="gold.500"
            color="black"
            _hover={{
              bg: "gold.600",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
            }}
            onClick={handleAddModal}
          >
            Add Hosteller
          </Button>
        </HStack>
      </Flex>

      {error && (
        <Alert 
          status="error" 
          mb={6} 
          bg="rgba(229, 62, 62, 0.1)" 
          borderLeft="4px solid" 
          borderColor="red.500" 
          color="white" 
          borderRadius="md"
        >
          <AlertIcon color="red.400" />
          <Text>{error}</Text>
        </Alert>
      )}

      {/* Search and filter controls */}
      <Stack 
        direction={{ base: "column", md: "row" }} 
        spacing={4} 
        mb={6}
        bg="background.accent"
        p={4}
        borderRadius="md"
        layerStyle="glassmorphism"
      >
        <InputGroup maxW={{ base: "100%", md: "300px" }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="whiteAlpha.500" />
          </InputLeftElement>
          <Input
            placeholder="Search by name, email, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="background.accent"
            borderColor="whiteAlpha.300"
            _hover={{ borderColor: "gold.500" }}
            _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
          />
        </InputGroup>
        
        <Select 
          maxW={{ base: "100%", md: "250px" }}
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
          bg="background.accent"
          borderColor="whiteAlpha.300"
          _hover={{ borderColor: "gold.500" }}
          _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
          icon={<Icon as={FaSort} color="whiteAlpha.500" />}
        >
          <option value="all">All Hostellers</option>
          <option value="dueRent">Rent Payment Due</option>
          <option value="paidRent">Rent Paid</option>
          <option value="expiringSoon">Stay Expiring Soon</option>
        </Select>
      </Stack>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {filteredHostellers.length > 0 ? (
          <MotionBox
            layerStyle="glassmorphism"
            p={6}
            mb={6}
            overflow="hidden"
          >
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('name')}
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                    >
                      <Flex align="center">
                        Name {getSortIcon('name')}
                      </Flex>
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('room')}
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                    >
                      <Flex align="center">
                        Room {getSortIcon('room')}
                      </Flex>
                    </Th>
                    <Th
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                    >
                      Email
                    </Th>
                    <Th
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                    >
                      Phone
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('endDate')}
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                    >
                      <Flex align="center">
                        End Date {getSortIcon('endDate')}
                      </Flex>
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('rentStatus')}
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                    >
                      <Flex align="center">
                        Rent Status {getSortIcon('rentStatus')}
                      </Flex>
                    </Th>
                    <Th
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                    >
                      Actions
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredHostellers.map((hosteller) => (
                    <Tr key={hosteller._id} _hover={{ bg: "whiteAlpha.50" }}>
                      <Td fontWeight="medium">
                        <Flex align="center">
                          <Avatar 
                            size="sm" 
                            name={hosteller.name} 
                            bg="gold.500" 
                            color="black"
                            mr={2}
                          />
                          {hosteller.name}
                        </Flex>
                      </Td>
                      <Td>
                        <Tag bg="blue.800" color="whiteAlpha.900" size="md" borderRadius="md">
                          <Icon as={FaBed} mr={1} />
                          <TagLabel fontFamily="mono">{hosteller.room}</TagLabel>
                        </Tag>
                      </Td>
                      <Td>{hosteller.email}</Td>
                      <Td>{hosteller.phone}</Td>
                      <Td>
                        <HStack>
                          <Icon as={FaCalendarAlt} color="gold.400" boxSize={3} />
                          <Text>{formatDate(hosteller.endDate)}</Text>
                          {hosteller.endDate && getDaysRemaining(hosteller.endDate) <= 30 && (
                            <Badge colorScheme="red" borderRadius="full">
                              {getDaysRemaining(hosteller.endDate)} days
                            </Badge>
                          )}
                        </HStack>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={hosteller.rentPaid ? "green" : "red"} 
                          px={2}
                          py={1}
                          borderRadius="full"
                          textTransform="capitalize"
                        >
                          {hosteller.rentPaid ? "Paid" : "Due"}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View Details" placement="top">
                            <IconButton
                              aria-label="View details"
                              icon={<Icon as={FaEye} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="teal"
                              _hover={{ bg: "teal.800" }}
                              onClick={() => handleViewDetails(hosteller._id)}
                            />
                          </Tooltip>
                          
                          <Tooltip label="Edit Hosteller" placement="top">
                            <IconButton
                              aria-label="Edit hosteller"
                              icon={<Icon as={FaUserEdit} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              _hover={{ bg: "blue.800" }}
                              onClick={() => handleEditModal(hosteller)}
                            />
                          </Tooltip>
                          
                          <Tooltip label="Delete Hosteller" placement="top">
                            <IconButton
                              aria-label="Delete hosteller"
                              icon={<Icon as={FaTrash} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              _hover={{ bg: "red.800" }}
                              onClick={() => handleDelete(hosteller._id)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </MotionBox>
        ) : (
          <MotionBox
            layerStyle="glassmorphism"
            p={6}
            mb={6}
            textAlign="center"
          >
            <Icon as={FaUserAlt} color="gold.400" boxSize={10} mb={4} />
            <Text fontSize="lg" color="text.secondary">
              {searchQuery || filterOption !== 'all' ? 
                'No hostellers match your search criteria.' : 
                'No hostellers found. Add new hostellers using the button above.'}
            </Text>
          </MotionBox>
        )}
      </MotionBox>

      {/* Add/Edit Hosteller Modal */}
      <Modal isOpen={isAddEditOpen} onClose={onAddEditClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          bg="background.card"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
        >
          <ModalHeader
            bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
            bgClip="text"
            fontFamily="heading"
            display="flex"
            alignItems="center"
          >
            <Icon as={selectedHosteller ? FaUserEdit : FaUserPlus} mr={2} />
            {selectedHosteller ? "Edit Hosteller" : "Add New Hosteller"}
          </ModalHeader>
          <ModalCloseButton color="whiteAlpha.700" _hover={{ color: "white" }} />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl mb={4} isRequired>
                <FormLabel color="text.secondary" fontWeight="medium">Name</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaUserAlt} color="whiteAlpha.500" />
                  </InputLeftElement>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    bg="background.accent"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "gold.500" }}
                    _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                  />
                </InputGroup>
              </FormControl>
              
              {!selectedHosteller && (
                <FormControl mb={4} isRequired>
                  <FormLabel color="text.secondary" fontWeight="medium">Email</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaEnvelope} color="whiteAlpha.500" />
                    </InputLeftElement>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      bg="background.accent"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: "gold.500" }}
                      _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                    />
                  </InputGroup>
                </FormControl>
              )}
              
              <FormControl mb={4} isRequired>
                <FormLabel color="text.secondary" fontWeight="medium">Phone</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaPhone} color="whiteAlpha.500" />
                  </InputLeftElement>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    bg="background.accent"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "gold.500" }}
                    _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl mb={4} isRequired>
                <FormLabel color="text.secondary" fontWeight="medium">Parent's Phone</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaPhone} color="whiteAlpha.500" />
                  </InputLeftElement>
                  <Input
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="Parent's phone number"
                    bg="background.accent"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "gold.500" }}
                    _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl mb={4} isRequired>
                <FormLabel color="text.secondary" fontWeight="medium">Stay Duration (Months)</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaCalendarAlt} color="whiteAlpha.500" />
                  </InputLeftElement>
                  <NumberInput
                    min={1}
                    max={60}
                    value={formData.duration}
                    onChange={handleDurationChange}
                    width="100%"
                  >
                    <NumberInputField 
                      pl={10}
                      bg="background.accent"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: "gold.500" }}
                      _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper color="whiteAlpha.700" _active={{ color: "gold.400" }} />
                      <NumberDecrementStepper color="whiteAlpha.700" _active={{ color: "gold.400" }} />
                    </NumberInputStepper>
                  </NumberInput>
                </InputGroup>
              </FormControl>
              
              <ModalFooter px={0}>
                <Button 
                  type="submit" 
                  bg="gold.500"
                  color="black"
                  mr={3}
                  _hover={{
                    bg: "gold.600",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
                  }}
                >
                  {selectedHosteller ? "Update" : "Add"}
                </Button>
                <Button 
                  onClick={onAddEditClose}
                  variant="outline" 
                  borderColor="whiteAlpha.300"
                  color="text.secondary"
                  _hover={{ bg: "whiteAlpha.100", color: "white" }}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Exchange Rooms Modal */}
      <Modal isOpen={isExchangeOpen} onClose={onExchangeClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          bg="background.card"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
        >
          <ModalHeader
            bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
            bgClip="text"
            fontFamily="heading"
            display="flex"
            alignItems="center"
          >
            <Icon as={FaExchangeAlt} mr={2} />
            Exchange Rooms
          </ModalHeader>
          <ModalCloseButton color="whiteAlpha.700" _hover={{ color: "white" }} />
          <ModalBody>
            <Box mb={4}>
              <Text color="whiteAlpha.800" fontSize="sm">
                Select two hostellers to exchange their room assignments.
              </Text>
            </Box>
            
            <form onSubmit={handleExchangeSubmit}>
              <FormControl mb={4} isRequired>
                <FormLabel color="text.secondary" fontWeight="medium">First Hosteller</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaUserAlt} color="whiteAlpha.500" />
                  </InputLeftElement>
                  <Select
                    name="hosteller1Id"
                    value={exchangeData.hosteller1Id}
                    onChange={handleExchangeChange}
                    placeholder="Select hosteller"
                    bg="background.accent"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "gold.500" }}
                    _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                    pl={10}
                  >
                    {hostellers.map(h => (
                      <option key={`1-${h._id}`} value={h._id}>
                        {h.name} (Room: {h.room})
                      </option>
                    ))}
                  </Select>
                </InputGroup>
              </FormControl>
              
              <FormControl mb={4} isRequired>
                <FormLabel color="text.secondary" fontWeight="medium">Second Hosteller</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaUserAlt} color="whiteAlpha.500" />
                  </InputLeftElement>
                  <Select
                    name="hosteller2Id"
                    value={exchangeData.hosteller2Id}
                    onChange={handleExchangeChange}
                    placeholder="Select hosteller"
                    bg="background.accent"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "gold.500" }}
                    _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                    pl={10}
                  >
                    {hostellers.map(h => (
                      <option key={`2-${h._id}`} value={h._id}>
                        {h.name} (Room: {h.room})
                      </option>
                    ))}
                  </Select>
                </InputGroup>
              </FormControl>
              
              <ModalFooter px={0}>
                <Button 
                  type="submit" 
                  bg="gold.500"
                  color="black"
                  mr={3}
                  leftIcon={<Icon as={FaExchangeAlt} />}
                  _hover={{
                    bg: "gold.600",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
                  }}
                >
                  Exchange Rooms
                </Button>
                <Button 
                  onClick={onExchangeClose}
                  variant="outline" 
                  borderColor="whiteAlpha.300"
                  color="text.secondary"
                  _hover={{ bg: "whiteAlpha.100", color: "white" }}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Hosteller Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          bg="background.card"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
          maxW="650px"
        >
          <ModalHeader
            bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
            bgClip="text"
            fontFamily="heading"
            display="flex"
            alignItems="center"
          >
            <Icon as={FaIdCard} mr={2} />
            Hosteller Details
          </ModalHeader>
          <ModalCloseButton color="whiteAlpha.700" _hover={{ color: "white" }} />
          <ModalBody pb={6}>
            {hostellerDetails && (
              <Box>
                <Flex align="center" mb={6}>
                  <Avatar 
                    size="xl" 
                    name={hostellerDetails.name}
                    bg="gold.500" 
                    color="black"
                    mr={4}
                  />
                  <Heading size="md">{hostellerDetails.name}</Heading>
                </Flex>
                
                <Grid 
                  templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} 
                  gap={6}
                >
                  <Box mb={4}>
                    <HStack mb={2} align="center">
                      <Icon as={FaUserAlt} color="gold.500" />
                      <Text 
                        fontWeight="semibold" 
                        fontSize="md"
                        color="white"
                      >
                        Basic Information
                      </Text>
                    </HStack>
                    <Box 
                      p={4} 
                      bg="background.accent" 
                      borderRadius="md"
                      layerStyle="glassmorphism"
                    >
                      <HStack mb={2}>
                        <Icon as={FaEnvelope} color="gold.400" />
                        <Text fontWeight="medium">Email:</Text>
                        <Text>{hostellerDetails.email}</Text>
                      </HStack>
                      
                      <HStack mb={2}>
                        <Icon as={FaIdCard} color="gold.400" />
                        <Text fontWeight="medium">Username:</Text>
                        <Text>{hostellerDetails.username}</Text>
                      </HStack>
                      
                      <HStack mb={2}>
                        <Icon as={FaPhone} color="gold.400" />
                        <Text fontWeight="medium">Phone:</Text>
                        <Text>{hostellerDetails.phone}</Text>
                      </HStack>
                      
                      <HStack mb={2}>
                        <Icon as={FaPhone} color="gold.400" />
                        <Text fontWeight="medium">Parent's Phone:</Text>
                        <Text>{hostellerDetails.parentPhone}</Text>
                      </HStack>
                      
                      <Button 
                        size="sm" 
                        mt={2}
                        leftIcon={<Icon as={FaKey} />}
                        variant="outline"
                        borderColor="gold.500"
                        color="gold.400"
                        _hover={{ bg: "whiteAlpha.100" }}
                        onClick={() => handleResetPassword(hostellerDetails._id)}
                      >
                        Reset Password
                      </Button>
                    </Box>
                  </Box>
                  
                  <Box mb={4}>
                    <HStack mb={2} align="center">
                      <Icon as={FaBed} color="gold.500" />
                      <Text 
                        fontWeight="semibold" 
                        fontSize="md"
                        color="white"
                      >
                        Room Information
                      </Text>
                    </HStack>
                    <Box 
                      p={4} 
                      bg="background.accent" 
                      borderRadius="md"
                      layerStyle="glassmorphism"
                    >
                      <Tag size="lg" bg="blue.800" mb={3}>
                        <Icon as={FaBed} mr={2} />
                        <TagLabel fontFamily="mono" fontSize="xl">{hostellerDetails.room}</TagLabel>
                      </Tag>
                      
                      <HStack mb={2}>
                        <Icon as={FaBuilding} color="gold.400" />
                        <Text fontWeight="medium">Hostel:</Text>
                        <Text>{hostellerDetails.hostel?.name || 'N/A'}</Text>
                      </HStack>
                      
                      <HStack mb={2}>
                        <Icon as={FaIdCard} color="gold.400" />
                        <Text fontWeight="medium">Hostel ID:</Text>
                        <Text fontFamily="mono">{hostellerDetails.hostel?.hostelId || 'N/A'}</Text>
                      </HStack>
                    </Box>
                  </Box>
                  
                  <Box mb={4} gridColumn={{ md: "span 2" }}>
                    <HStack mb={2} align="center">
                      <Icon as={FaCalendarAlt} color="gold.500" />
                      <Text 
                        fontWeight="semibold" 
                        fontSize="md"
                        color="white"
                      >
                        Stay Information
                      </Text>
                    </HStack>
                    <Box 
                      p={4} 
                      bg="background.accent" 
                      borderRadius="md"
                      layerStyle="glassmorphism"
                    >
                      <Flex 
                        justify="space-between" 
                        flexWrap="wrap"
                        gap={4}
                      >
                        <Box mb={2} minW="140px">
                          <Text fontWeight="medium" color="gold.400">Join Date</Text>
                          <HStack>
                            <Icon as={FaCalendarAlt} color="whiteAlpha.600" />
                            <Text>{formatDate(hostellerDetails.joinDate)}</Text>
                          </HStack>
                        </Box>
                        
                        <Box mb={2} minW="140px">
                          <Text fontWeight="medium" color="gold.400">End Date</Text>
                          <HStack>
                            <Icon as={FaCalendarAlt} color="whiteAlpha.600" />
                            <Text>{formatDate(hostellerDetails.endDate)}</Text>
                          </HStack>
                        </Box>
                        
                        <Box mb={2} minW="140px">
                          <Text fontWeight="medium" color="gold.400">Duration</Text>
                          <HStack>
                            <Icon as={FaClock} color="whiteAlpha.600" />
                            <Text>{hostellerDetails.duration} months</Text>
                          </HStack>
                        </Box>
                        
                        <Box mb={2} minW="140px">
                          <Text fontWeight="medium" color="gold.400">Rent Status</Text>
                          <Badge 
                            colorScheme={hostellerDetails.rentPaid ? "green" : "red"} 
                            px={2}
                            py={1}
                            borderRadius="full"
                            textTransform="capitalize"
                          >
                            <Flex align="center">
                              <Icon as={FaMoneyBillWave} mr={1} />
                              {hostellerDetails.rentPaid ? "Paid" : "Due"}
                            </Flex>
                          </Badge>
                        </Box>
                        
                        {hostellerDetails.lastRentPayment && (
                          <Box mb={2} minW="140px">
                            <Text fontWeight="medium" color="gold.400">Last Payment</Text>
                            <HStack>
                              <Icon as={FaCalendarAlt} color="whiteAlpha.600" />
                              <Text>{formatDate(hostellerDetails.lastRentPayment)}</Text>
                            </HStack>
                          </Box>
                        )}
                      </Flex>
                    </Box>
                  </Box>
                </Grid>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              bg="gold.500"
              color="black"
              _hover={{ bg: "gold.600" }}
              onClick={onDetailsClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default WardenHostellersList;
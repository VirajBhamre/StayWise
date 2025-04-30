import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Heading, Text, Button, Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Alert, AlertIcon, Badge, useToast, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, 
  ModalCloseButton, ModalFooter, FormControl, FormLabel, Input,
  InputGroup, InputLeftElement, IconButton, useToken,
  Stack, Stat, StatLabel, StatNumber, StatGroup, Icon,
  StatHelpText, StatArrow, InputLeftAddon, HStack, Select,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, Tabs, TabList, Tab, TabPanels, TabPanel,
  Tooltip, Menu, MenuButton, MenuList, MenuItem, SimpleGrid
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaMoneyBillWave, FaFileInvoiceDollar, FaCheck, FaTimes, FaUserAlt,
  FaCalendarAlt, FaClock, FaSearch, FaFilter, FaSortAmountDown,
  FaEye, FaHistory, FaChartBar, FaChartPie, FaChartLine,
  FaRegCheckCircle, FaRegTimesCircle, FaInfoCircle, FaDownload,
  FaIdCard, FaCreditCard, FaRegCreditCard, FaUniversity, FaCoins
} from 'react-icons/fa';
import {
  getAllPayments,
  markAsPaid,
  generateReceipt,
  getPaymentAnalytics,
  getPaymentHistory
} from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const WardenPaymentStatus = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isAnalyticsOpen, onOpen: onAnalyticsOpen, onClose: onAnalyticsClose } = useDisclosure();
  
  const toast = useToast();
  const [gold400, gold500, gold600] = useToken('colors', ['gold.400', 'gold.500', 'gold.600']);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getAllPayments();
      setPayments(response);
      setFilteredPayments(response);
      setError(null);
    } catch (err) {
      setError('Failed to load payment data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const analytics = await getPaymentAnalytics({ month: currentMonth, year: currentYear });
      setAnalytics(analytics);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics data.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
      console.error(err);
    }
  };

  const fetchPaymentHistory = async (hostellerId) => {
    try {
      const history = await getPaymentHistory(hostellerId);
      setPaymentHistory(history);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load payment history.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (isAnalyticsOpen) {
      fetchAnalytics();
    }
  }, [isAnalyticsOpen, currentMonth, currentYear]);

  useEffect(() => {
    // Filter payments based on search and filter criteria
    let result = [...payments];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(payment => 
        filterStatus === 'paid' ? payment.isPaid : !payment.isPaid
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(payment => 
        payment.hosteller.name.toLowerCase().includes(query) ||
        payment.hosteller.room.toString().includes(query) ||
        payment.paymentId.toLowerCase().includes(query) ||
        payment.month.toLowerCase().includes(query)
      );
    }
    
    setFilteredPayments(result);
  }, [payments, searchQuery, filterStatus]);

  const handleMarkAsPaid = async (paymentId) => {
    try {
      await markAsPaid(paymentId);
      toast({
        title: 'Success',
        description: 'Payment has been marked as paid.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
      fetchPayments(); // Refresh the payment list
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update payment status.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    fetchPaymentHistory(payment.hosteller._id);
    onDetailsOpen();
  };

  const handleGenerateReceipt = async (paymentId) => {
    try {
      const response = await generateReceipt(paymentId);
      // Create a blob from the PDF response
      const blob = new Blob([response], { type: 'application/pdf' });
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      // Open the PDF in a new tab
      window.open(url, '_blank');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to generate receipt.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentStatusBadge = (isPaid, dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isOverdue = !isPaid && due < now;
    
    if (isPaid) {
      return (
        <Badge 
          colorScheme="green" 
          p={2} 
          borderRadius="full" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
        >
          <Icon as={FaRegCheckCircle} mr={1} />
          Paid
        </Badge>
      );
    } else if (isOverdue) {
      return (
        <Badge 
          colorScheme="red" 
          p={2} 
          borderRadius="full" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
        >
          <Icon as={FaRegTimesCircle} mr={1} />
          Overdue
        </Badge>
      );
    } else {
      return (
        <Badge 
          colorScheme="yellow" 
          p={2} 
          borderRadius="full" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
        >
          <Icon as={FaClock} mr={1} />
          Pending
        </Badge>
      );
    }
  };

  const paymentAnalyticsData = {
    statusPieData: {
      labels: ['Paid', 'Pending', 'Overdue'],
      datasets: [
        {
          data: [
            analytics?.paidCount || 0,
            analytics?.pendingCount || 0,
            analytics?.overdueCount || 0
          ],
          backgroundColor: [
            'rgba(72, 187, 120, 0.8)',
            'rgba(237, 137, 54, 0.8)',
            'rgba(229, 62, 62, 0.8)'
          ],
          borderColor: [
            'rgba(72, 187, 120, 1)',
            'rgba(237, 137, 54, 1)',
            'rgba(229, 62, 62, 1)'
          ],
          borderWidth: 1,
        },
      ],
    },
    amountDoughnutData: {
      labels: ['Collected', 'Pending'],
      datasets: [
        {
          data: [
            analytics?.collectedAmount || 0,
            analytics?.pendingAmount || 0
          ],
          backgroundColor: [
            'rgba(255, 202, 40, 0.8)',
            'rgba(45, 55, 72, 0.8)'
          ],
          borderColor: [
            'rgba(255, 202, 40, 1)',
            'rgba(45, 55, 72, 1)'
          ],
          borderWidth: 1,
        },
      ],
    }
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
          font: {
            size: 12
          }
        }
      }
    },
    maintainAspectRatio: false
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
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'flex-start', md: 'center' }} 
        mb={6}
        wrap="wrap"
        gap={3}
      >
        <Heading 
          size="md" 
          bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
          bgClip="text"
          display="flex"
          alignItems="center"
        >
          <Icon as={FaMoneyBillWave} mr={2} />
          Payment Management
        </Heading>
        
        <Button 
          leftIcon={<Icon as={FaChartPie} />}
          onClick={onAnalyticsOpen}
          bg="gold.500"
          color="black"
          _hover={{
            bg: "gold.600",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
          }}
        >
          Payment Analytics
        </Button>
      </Flex>

      {/* Dashboard Cards */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={6}
      >
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Stat
            layerStyle="glassmorphism"
            p={4}
            borderRadius="md"
            borderLeft="4px solid"
            borderColor="gold.500"
          >
            <StatLabel color="whiteAlpha.800" fontWeight="semibold" display="flex" alignItems="center">
              <Icon as={FaMoneyBillWave} mr={2} color="gold.400" />
              Total Revenue
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color="white" mt={1}>
              {formatCurrency(payments.reduce((sum, payment) => payment.isPaid ? sum + payment.amount : sum, 0))}
            </StatNumber>
            <StatHelpText mb={0} fontSize="sm">
              For Current Month
            </StatHelpText>
          </Stat>
          
          <Stat
            layerStyle="glassmorphism"
            p={4}
            borderRadius="md"
            borderLeft="4px solid"
            borderColor="green.500"
          >
            <StatLabel color="whiteAlpha.800" fontWeight="semibold" display="flex" alignItems="center">
              <Icon as={FaRegCheckCircle} mr={2} color="green.400" />
              Payments Received
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color="white" mt={1}>
              {payments.filter(p => p.isPaid).length}
            </StatNumber>
            <StatHelpText mb={0} fontSize="sm">
              Out of {payments.length} total
            </StatHelpText>
          </Stat>
          
          <Stat
            layerStyle="glassmorphism"
            p={4}
            borderRadius="md"
            borderLeft="4px solid"
            borderColor="red.500"
          >
            <StatLabel color="whiteAlpha.800" fontWeight="semibold" display="flex" alignItems="center">
              <Icon as={FaRegTimesCircle} mr={2} color="red.400" />
              Outstanding Amount
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color="white" mt={1}>
              {formatCurrency(payments.reduce((sum, payment) => !payment.isPaid ? sum + payment.amount : sum, 0))}
            </StatNumber>
            <StatHelpText mb={0} fontSize="sm">
              Pending Collection
            </StatHelpText>
          </Stat>
          
          <Stat
            layerStyle="glassmorphism"
            p={4}
            borderRadius="md"
            borderLeft="4px solid"
            borderColor="orange.500"
          >
            <StatLabel color="whiteAlpha.800" fontWeight="semibold" display="flex" alignItems="center">
              <Icon as={FaClock} mr={2} color="orange.400" />
              Pending Payments
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color="white" mt={1}>
              {payments.filter(p => !p.isPaid).length}
            </StatNumber>
            <StatHelpText mb={0} fontSize="sm">
              Due for collection
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      </MotionBox>

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
            placeholder="Search by name, room, ID..."
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          bg="background.accent"
          borderColor="whiteAlpha.300"
          _hover={{ borderColor: "gold.500" }}
          _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
          icon={<Icon as={FaFilter} color="whiteAlpha.500" />}
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </Select>
      </Stack>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredPayments.length > 0 ? (
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
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                    >
                      <Flex align="center">
                        <Icon as={FaIdCard} mr={2} />
                        Payment ID
                      </Flex>
                    </Th>
                    <Th 
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                    >
                      <Flex align="center">
                        <Icon as={FaUserAlt} mr={2} />
                        Hosteller
                      </Flex>
                    </Th>
                    <Th 
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                    >
                      Month
                    </Th>
                    <Th 
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                      isNumeric
                    >
                      Amount
                    </Th>
                    <Th 
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                    >
                      Due Date
                    </Th>
                    <Th 
                      color="gold.500" 
                      fontWeight="600" 
                      letterSpacing="0.5px" 
                      textTransform="uppercase" 
                      fontSize="xs"
                    >
                      Status
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
                  {filteredPayments.map((payment) => (
                    <Tr key={payment._id} _hover={{ bg: "whiteAlpha.50" }}>
                      <Td fontFamily="mono" fontSize="sm" color="whiteAlpha.900">
                        {payment.paymentId}
                      </Td>
                      <Td>
                        <HStack>
                          <Icon as={FaUserAlt} color="gold.400" boxSize={3} />
                          <Text>
                            {payment.hosteller.name} 
                            <Text as="span" fontSize="sm" color="whiteAlpha.600" ml={1}>
                              (Room {payment.hosteller.room})
                            </Text>
                          </Text>
                        </HStack>
                      </Td>
                      <Td>{payment.month}</Td>
                      <Td isNumeric fontWeight="semibold">{formatCurrency(payment.amount)}</Td>
                      <Td>{formatDate(payment.dueDate)}</Td>
                      <Td>{getPaymentStatusBadge(payment.isPaid, payment.dueDate)}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View Details" placement="top">
                            <IconButton
                              aria-label="View payment details"
                              icon={<Icon as={FaEye} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="teal"
                              _hover={{ bg: "teal.800" }}
                              onClick={() => handleViewDetails(payment)}
                            />
                          </Tooltip>
                          
                          {payment.isPaid ? (
                            <Tooltip label="Download Receipt" placement="top">
                              <IconButton
                                aria-label="Download receipt"
                                icon={<Icon as={FaDownload} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                _hover={{ bg: "blue.800" }}
                                onClick={() => handleGenerateReceipt(payment._id)}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip label="Mark as Paid" placement="top">
                              <IconButton
                                aria-label="Mark as paid"
                                icon={<Icon as={FaCheck} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                _hover={{ bg: "green.800" }}
                                onClick={() => handleMarkAsPaid(payment._id)}
                              />
                            </Tooltip>
                          )}
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
            <Icon as={FaMoneyBillWave} color="gold.400" boxSize={10} mb={4} />
            <Text fontSize="lg" color="text.secondary">
              {searchQuery || filterStatus !== 'all' ? 
                'No payments match your search criteria.' : 
                'No payments found for the current period.'}
            </Text>
          </MotionBox>
        )}
      </MotionBox>

      {/* Payment Details Modal */}
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
            <Icon as={FaFileInvoiceDollar} mr={2} />
            Payment Details
          </ModalHeader>
          <ModalCloseButton color="whiteAlpha.700" _hover={{ color: "white" }} />
          <ModalBody pb={6}>
            {selectedPayment && (
              <Tabs variant="soft-rounded" colorScheme="gold">
                <TabList mb={4}>
                  <Tab 
                    _selected={{ 
                      color: "black", 
                      bg: "gold.500",
                      fontWeight: "semibold" 
                    }} 
                    px={4}
                  >
                    <Icon as={FaFileInvoiceDollar} mr={2} />
                    Current Payment
                  </Tab>
                  <Tab 
                    _selected={{ 
                      color: "black", 
                      bg: "gold.500",
                      fontWeight: "semibold" 
                    }} 
                    px={4}
                  >
                    <Icon as={FaHistory} mr={2} />
                    Payment History
                  </Tab>
                </TabList>
                
                <TabPanels>
                  <TabPanel p={0}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={4}>
                      <Box
                        bg="background.accent"
                        borderRadius="md"
                        p={4}
                        layerStyle="glassmorphism"
                      >
                        <Text 
                          fontWeight="semibold" 
                          color="white" 
                          fontSize="lg" 
                          mb={3}
                          display="flex"
                          alignItems="center"
                        >
                          <Icon as={FaUserAlt} mr={2} color="gold.400" />
                          Hosteller Information
                        </Text>
                        
                        <Stack spacing={3}>
                          <HStack>
                            <Text fontWeight="medium" color="whiteAlpha.800">Name:</Text>
                            <Text>{selectedPayment.hosteller.name}</Text>
                          </HStack>
                          
                          <HStack>
                            <Text fontWeight="medium" color="whiteAlpha.800">Room:</Text>
                            <Badge bg="blue.800" color="whiteAlpha.900">
                              {selectedPayment.hosteller.room}
                            </Badge>
                          </HStack>
                          
                          <HStack>
                            <Text fontWeight="medium" color="whiteAlpha.800">Email:</Text>
                            <Text>{selectedPayment.hosteller.email}</Text>
                          </HStack>
                          
                          <HStack>
                            <Text fontWeight="medium" color="whiteAlpha.800">Phone:</Text>
                            <Text>{selectedPayment.hosteller.phone}</Text>
                          </HStack>
                        </Stack>
                      </Box>
                      
                      <Box
                        bg="background.accent"
                        borderRadius="md"
                        p={4}
                        layerStyle="glassmorphism"
                      >
                        <Text 
                          fontWeight="semibold" 
                          color="white" 
                          fontSize="lg" 
                          mb={3}
                          display="flex"
                          alignItems="center"
                        >
                          <Icon as={FaFileInvoiceDollar} mr={2} color="gold.400" />
                          Payment Information
                        </Text>
                        
                        <Stack spacing={3}>
                          <HStack>
                            <Text fontWeight="medium" color="whiteAlpha.800">Payment ID:</Text>
                            <Text fontFamily="mono">{selectedPayment.paymentId}</Text>
                          </HStack>
                          
                          <HStack>
                            <Text fontWeight="medium" color="whiteAlpha.800">Month:</Text>
                            <Text>{selectedPayment.month}</Text>
                          </HStack>
                          
                          <HStack>
                            <Text fontWeight="medium" color="whiteAlpha.800">Amount:</Text>
                            <Text fontWeight="bold" color={selectedPayment.isPaid ? "green.400" : "red.400"}>
                              {formatCurrency(selectedPayment.amount)}
                            </Text>
                          </HStack>
                          
                          <HStack>
                            <Text fontWeight="medium" color="whiteAlpha.800">Due Date:</Text>
                            <Text>{formatDate(selectedPayment.dueDate)}</Text>
                          </HStack>
                          
                          <HStack>
                            <Text fontWeight="medium" color="whiteAlpha.800">Status:</Text>
                            {getPaymentStatusBadge(selectedPayment.isPaid, selectedPayment.dueDate)}
                          </HStack>
                          
                          {selectedPayment.isPaid && selectedPayment.paidAt && (
                            <HStack>
                              <Text fontWeight="medium" color="whiteAlpha.800">Paid On:</Text>
                              <Text>{formatDate(selectedPayment.paidAt)}</Text>
                            </HStack>
                          )}
                          
                          {selectedPayment.isPaid && selectedPayment.paymentMethod && (
                            <HStack>
                              <Text fontWeight="medium" color="whiteAlpha.800">Payment Method:</Text>
                              <HStack>
                                {selectedPayment.paymentMethod === 'cash' && <Icon as={FaCoins} color="gold.400" />}
                                {selectedPayment.paymentMethod === 'card' && <Icon as={FaCreditCard} color="blue.400" />}
                                {selectedPayment.paymentMethod === 'bank' && <Icon as={FaUniversity} color="purple.400" />}
                                <Text textTransform="capitalize">{selectedPayment.paymentMethod}</Text>
                              </HStack>
                            </HStack>
                          )}
                        </Stack>
                        
                        {!selectedPayment.isPaid && (
                          <Button
                            mt={4}
                            leftIcon={<Icon as={FaCheck} />}
                            bg="gold.500"
                            color="black"
                            _hover={{
                              bg: "gold.600",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
                            }}
                            onClick={() => {
                              handleMarkAsPaid(selectedPayment._id);
                              onDetailsClose();
                            }}
                          >
                            Mark as Paid
                          </Button>
                        )}
                        
                        {selectedPayment.isPaid && (
                          <Button
                            mt={4}
                            leftIcon={<Icon as={FaDownload} />}
                            colorScheme="blue"
                            variant="outline"
                            _hover={{
                              bg: "blue.800",
                              borderColor: "blue.600"
                            }}
                            onClick={() => handleGenerateReceipt(selectedPayment._id)}
                          >
                            Download Receipt
                          </Button>
                        )}
                      </Box>
                    </SimpleGrid>
                    
                    {/* Notes or additional information */}
                    {selectedPayment.notes && (
                      <Box
                        bg="background.accent"
                        borderRadius="md"
                        p={4}
                        mt={4}
                        layerStyle="glassmorphism"
                      >
                        <Text 
                          fontWeight="semibold" 
                          color="white" 
                          fontSize="lg" 
                          mb={2}
                          display="flex"
                          alignItems="center"
                        >
                          <Icon as={FaInfoCircle} mr={2} color="gold.400" />
                          Notes
                        </Text>
                        <Text>{selectedPayment.notes}</Text>
                      </Box>
                    )}
                  </TabPanel>
                  
                  <TabPanel p={0}>
                    {paymentHistory.length > 0 ? (
                      <Box
                        bg="background.accent"
                        borderRadius="md"
                        p={4}
                        layerStyle="glassmorphism"
                        overflowX="auto"
                      >
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th 
                                color="gold.500" 
                                fontWeight="600" 
                                letterSpacing="0.5px" 
                                fontSize="xs"
                              >
                                Month
                              </Th>
                              <Th 
                                color="gold.500" 
                                fontWeight="600" 
                                letterSpacing="0.5px" 
                                fontSize="xs"
                                isNumeric
                              >
                                Amount
                              </Th>
                              <Th 
                                color="gold.500" 
                                fontWeight="600" 
                                letterSpacing="0.5px" 
                                fontSize="xs"
                              >
                                Due Date
                              </Th>
                              <Th 
                                color="gold.500" 
                                fontWeight="600" 
                                letterSpacing="0.5px" 
                                fontSize="xs"
                              >
                                Status
                              </Th>
                              <Th 
                                color="gold.500" 
                                fontWeight="600" 
                                letterSpacing="0.5px" 
                                fontSize="xs"
                              >
                                Paid On
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {paymentHistory.map((payment) => (
                              <Tr key={payment._id} _hover={{ bg: "whiteAlpha.50" }}>
                                <Td>{payment.month}</Td>
                                <Td isNumeric>{formatCurrency(payment.amount)}</Td>
                                <Td>{formatDate(payment.dueDate)}</Td>
                                <Td>{getPaymentStatusBadge(payment.isPaid, payment.dueDate)}</Td>
                                <Td>{payment.isPaid ? formatDate(payment.paidAt) : '-'}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    ) : (
                      <Box
                        bg="background.accent"
                        borderRadius="md"
                        p={6}
                        textAlign="center"
                        layerStyle="glassmorphism"
                      >
                        <Icon as={FaHistory} color="gold.400" boxSize={8} mb={3} />
                        <Text>No payment history available</Text>
                      </Box>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
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

      {/* Analytics Drawer */}
      <Drawer
        isOpen={isAnalyticsOpen}
        placement="right"
        onClose={onAnalyticsClose}
        size="md"
      >
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent
          bg="background.card"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
        >
          <DrawerHeader
            bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
            bgClip="text"
            fontFamily="heading"
            display="flex"
            alignItems="center"
            borderBottomWidth="1px"
            borderColor="whiteAlpha.100"
          >
            <Icon as={FaChartPie} mr={2} />
            Payment Analytics
          </DrawerHeader>
          <DrawerCloseButton color="whiteAlpha.700" _hover={{ color: "white" }} />
          
          <DrawerBody py={4}>
            {/* Month/Year Selector */}
            <Flex mb={6} justify="space-between" align="center">
              <Text fontWeight="medium" color="whiteAlpha.800">Time Period:</Text>
              <HStack spacing={2}>
                <Select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                  maxW="120px"
                  bg="background.accent"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "gold.500" }}
                  _focus={{ borderColor: "gold.500" }}
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </Select>
                
                <Select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                  maxW="100px"
                  bg="background.accent"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "gold.500" }}
                  _focus={{ borderColor: "gold.500" }}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - 2 + i}>
                      {new Date().getFullYear() - 2 + i}
                    </option>
                  ))}
                </Select>
              </HStack>
            </Flex>
            
            {analytics ? (
              <>
                {/* Summary Cards */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
                  <Stat
                    layerStyle="glassmorphism"
                    p={3}
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderColor="gold.500"
                  >
                    <StatLabel color="whiteAlpha.800" fontWeight="semibold" display="flex" alignItems="center">
                      <Icon as={FaRegCheckCircle} mr={2} color="gold.400" />
                      Collection Rate
                    </StatLabel>
                    <StatNumber fontSize="xl" fontWeight="bold" color="white" mt={1}>
                      {analytics.totalCount > 0 
                        ? Math.round((analytics.paidCount / analytics.totalCount) * 100) 
                        : 0}%
                    </StatNumber>
                    <StatHelpText mb={0} fontSize="sm">
                      {analytics.paidCount} out of {analytics.totalCount} payments
                    </StatHelpText>
                  </Stat>
                  
                  <Stat
                    layerStyle="glassmorphism"
                    p={3}
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderColor="gold.500"
                  >
                    <StatLabel color="whiteAlpha.800" fontWeight="semibold" display="flex" alignItems="center">
                      <Icon as={FaMoneyBillWave} mr={2} color="gold.400" />
                      Total Amount
                    </StatLabel>
                    <StatNumber fontSize="xl" fontWeight="bold" color="white" mt={1}>
                      {formatCurrency(analytics.collectedAmount + analytics.pendingAmount)}
                    </StatNumber>
                    <StatHelpText mb={0} fontSize="sm" display="flex" alignItems="center">
                      <StatArrow type="increase" />
                      {formatCurrency(analytics.collectedAmount)} collected
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
                
                {/* Charts */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                  <Box
                    layerStyle="glassmorphism"
                    p={4}
                    borderRadius="md"
                    height="250px"
                  >
                    <Text 
                      fontWeight="semibold" 
                      color="white" 
                      mb={3}
                      textAlign="center"
                    >
                      Payment Status
                    </Text>
                    <Pie 
                      data={paymentAnalyticsData.statusPieData} 
                      options={chartOptions} 
                      height="200px"
                    />
                  </Box>
                  
                  <Box
                    layerStyle="glassmorphism"
                    p={4}
                    borderRadius="md"
                    height="250px"
                  >
                    <Text 
                      fontWeight="semibold" 
                      color="white" 
                      mb={3}
                      textAlign="center"
                    >
                      Revenue Collection
                    </Text>
                    <Doughnut 
                      data={paymentAnalyticsData.amountDoughnutData} 
                      options={chartOptions}
                      height="200px"
                    />
                  </Box>
                </SimpleGrid>
                
                {/* Detailed Stats */}
                <Box
                  layerStyle="glassmorphism"
                  p={4}
                  borderRadius="md"
                  mb={4}
                >
                  <Text 
                    fontWeight="semibold" 
                    color="white" 
                    fontSize="lg" 
                    mb={4}
                    display="flex"
                    alignItems="center"
                  >
                    <Icon as={FaChartBar} mr={2} color="gold.400" />
                    Detailed Statistics
                  </Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <HStack justify="space-between" p={3} bg="whiteAlpha.50" borderRadius="md">
                      <Text color="whiteAlpha.800">Total Payments</Text>
                      <Text fontWeight="bold">{analytics.totalCount}</Text>
                    </HStack>
                    
                    <HStack justify="space-between" p={3} bg="whiteAlpha.50" borderRadius="md">
                      <Text color="whiteAlpha.800">Paid Payments</Text>
                      <Text fontWeight="bold" color="green.400">{analytics.paidCount}</Text>
                    </HStack>
                    
                    <HStack justify="space-between" p={3} bg="whiteAlpha.50" borderRadius="md">
                      <Text color="whiteAlpha.800">Pending Payments</Text>
                      <Text fontWeight="bold" color="yellow.400">{analytics.pendingCount}</Text>
                    </HStack>
                    
                    <HStack justify="space-between" p={3} bg="whiteAlpha.50" borderRadius="md">
                      <Text color="whiteAlpha.800">Overdue Payments</Text>
                      <Text fontWeight="bold" color="red.400">{analytics.overdueCount}</Text>
                    </HStack>
                    
                    <HStack justify="space-between" p={3} bg="whiteAlpha.50" borderRadius="md">
                      <Text color="whiteAlpha.800">Collected Amount</Text>
                      <Text fontWeight="bold" color="green.400">{formatCurrency(analytics.collectedAmount)}</Text>
                    </HStack>
                    
                    <HStack justify="space-between" p={3} bg="whiteAlpha.50" borderRadius="md">
                      <Text color="whiteAlpha.800">Pending Amount</Text>
                      <Text fontWeight="bold" color="red.400">{formatCurrency(analytics.pendingAmount)}</Text>
                    </HStack>
                  </SimpleGrid>
                </Box>
              </>
            ) : (
              <Flex justify="center" align="center" h="300px">
                <Spinner 
                  thickness="4px"
                  speed="0.65s"
                  color="gold.500"
                  size="xl"
                />
              </Flex>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default WardenPaymentStatus;
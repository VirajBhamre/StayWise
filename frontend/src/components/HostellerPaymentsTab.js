import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, FormControl, FormLabel,
  NumberInput, NumberInputField, Select, ModalFooter,
  useDisclosure, useToast, InputGroup, InputLeftElement,
  Icon, useToken, Text, HStack
} from '@chakra-ui/react';
import { payRent, getRentHistory } from '../services/api';
import { FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';

const HostellerPaymentsTab = ({ profile }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    paymentMethod: 'card',
    amount: profile?.hostel?.rentPerMonth || 0
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [gold400, gold500, gold600] = useToken('colors', ['gold.400', 'gold.500', 'gold.600']);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getRentHistory();
      setPayments(data);
      setError('');
    } catch (err) {
      setError('Failed to load payment history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // Update amount if profile changes
    if (profile?.hostel?.rentPerMonth) {
      setFormData(prev => ({ ...prev, amount: profile.hostel.rentPerMonth }));
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmountChange = (value) => {
    setFormData({ ...formData, amount: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await payRent({
        paymentMethod: formData.paymentMethod,
        amount: parseFloat(formData.amount)
      });
      
      toast({
        title: 'Payment successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      fetchPayments();
    } catch (err) {
      toast({
        title: 'Payment failed',
        description: err.response?.data?.message || 'Could not process payment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && payments.length === 0) {
    return <Spinner size="xl" />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Heading 
          size="md" 
          bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
          bgClip="text"
          display="flex"
          alignItems="center"
        >
          <Icon as={FaMoneyBillWave} mr={2} />
          Rent Payments
        </Heading>
        <Button 
          bg="gold.500"
          color="black"
          _hover={{
            bg: "gold.600",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
          }}
          onClick={onOpen}
          isDisabled={profile?.rentPaid}
        >
          Pay Rent
        </Button>
      </Box>

      {error && (
        <Alert 
          status="error" 
          mb={4}
          bg="rgba(229, 62, 62, 0.1)" 
          borderLeft="4px solid" 
          borderColor="red.500" 
          borderRadius="md"
        >
          <AlertIcon color="red.400" />
          {error}
        </Alert>
      )}

      <Box mb={5}>
        <Alert 
          status={profile?.rentPaid ? "success" : "warning"}
          borderRadius="md"
          bg={profile?.rentPaid ? "rgba(72, 187, 120, 0.1)" : "rgba(237, 137, 54, 0.1)"}
          borderLeft="4px solid"
          borderColor={profile?.rentPaid ? "green.500" : "orange.500"}
        >
          <AlertIcon color={profile?.rentPaid ? "green.400" : "orange.400"} />
          {profile?.rentPaid 
            ? "You have paid your rent for this month." 
            : "Your rent payment is due."
          }
        </Alert>
      </Box>

      <Box 
        overflowX="auto"
        layerStyle="glassmorphism"
        p={4}
        borderRadius="md"
      >
        <Heading 
          size="sm" 
          mb={3} 
          color="white"
          display="flex"
          alignItems="center"
        >
          <Icon as={FaMoneyBillWave} mr={2} color="gold.400" />
          Payment History
        </Heading>
        <Table variant="simple">
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
              >
                Amount
              </Th>
              <Th 
                color="gold.500" 
                fontWeight="600" 
                letterSpacing="0.5px" 
                fontSize="xs"
              >
                Payment Method
              </Th>
              <Th 
                color="gold.500" 
                fontWeight="600" 
                letterSpacing="0.5px" 
                fontSize="xs"
              >
                Transaction ID
              </Th>
              <Th 
                color="gold.500" 
                fontWeight="600" 
                letterSpacing="0.5px" 
                fontSize="xs"
              >
                Date
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <Tr key={payment._id} _hover={{ bg: "whiteAlpha.50" }}>
                  <Td>{new Date(payment.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</Td>
                  <Td>{formatCurrency(payment.amount)}</Td>
                  <Td textTransform="capitalize">{payment.paymentMethod}</Td>
                  <Td fontFamily="mono">{payment.transactionId}</Td>
                  <Td>{new Date(payment.createdAt).toLocaleDateString()}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center">No payment records found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
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
            <Icon as={FaMoneyBillWave} mr={2} />
            Pay Rent
          </ModalHeader>
          <ModalCloseButton color="whiteAlpha.700" _hover={{ color: "white" }} />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl mb={4} isRequired>
                <FormLabel color="text.secondary" fontWeight="medium">Amount (₹)</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaMoneyBillWave} color="whiteAlpha.500" />
                  </InputLeftElement>
                  <NumberInput 
                    min={profile?.hostel?.rentPerMonth || 0}
                    value={formData.amount}
                    onChange={handleAmountChange}
                    width="100%"
                  >
                    <NumberInputField 
                      pl={10}
                      bg="background.accent"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: "gold.500" }}
                      _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                    />
                  </NumberInput>
                </InputGroup>
              </FormControl>
              
              <FormControl mb={4} isRequired>
                <FormLabel color="text.secondary" fontWeight="medium">Payment Method</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaCreditCard} color="whiteAlpha.500" />
                  </InputLeftElement>
                  <Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    bg="background.accent"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "gold.500" }}
                    _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                    pl={10}
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </Select>
                </InputGroup>
              </FormControl>
              
              <Alert 
                status="info" 
                mb={4}
                bg="rgba(49, 130, 206, 0.1)"
                borderLeft="4px solid"
                borderColor="blue.500"
                borderRadius="md"
              >
                <AlertIcon color="blue.400" />
                This is a demo application. No actual payment will be processed.
              </Alert>
              
              <ModalFooter px={0}>
                <Button 
                  type="submit" 
                  bg="gold.500"
                  color="black"
                  mr={3}
                  isLoading={submitting}
                  loadingText="Processing..."
                  _hover={{
                    bg: "gold.600",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
                  }}
                >
                  Make Payment
                </Button>
                <Button 
                  onClick={onClose}
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
    </Box>
  );
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default HostellerPaymentsTab;
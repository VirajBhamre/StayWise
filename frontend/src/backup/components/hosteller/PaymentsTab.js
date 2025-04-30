import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, FormControl, FormLabel,
  Select, NumberInput, NumberInputField,
  ModalFooter, useDisclosure, useToast, Text
} from '@chakra-ui/react';
import { getRentHistory, payRent } from '../../services/api';

const PaymentsTab = ({ profile }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    paymentMethod: '',
    amount: profile?.hostel?.rentPerMonth || 0
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

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
  }, []);

  useEffect(() => {
    if (profile?.hostel?.rentPerMonth) {
      setFormData(prev => ({
        ...prev,
        amount: profile.hostel.rentPerMonth
      }));
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmountChange = (value) => {
    setFormData(prev => ({ ...prev, amount: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.paymentMethod) {
      toast({
        title: 'Error',
        description: 'Please select a payment method',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await payRent(formData);
      toast({
        title: 'Payment successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchPayments();
      // Force reload to update the rent status on the dashboard
      window.location.reload();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Payment failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Rent Payments</Heading>
        <Button
          colorScheme={profile?.rentPaid ? "gray" : "blue"}
          onClick={onOpen}
          isDisabled={profile?.rentPaid}
        >
          {profile?.rentPaid ? 'Rent Paid' : 'Pay Rent'}
        </Button>
      </Box>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Box mb={4}>
        <Text>
          Monthly Rent: ₹{profile?.hostel?.rentPerMonth || 0}
        </Text>
        <Text>
          Payment Status: {profile?.rentPaid ? 'Paid' : 'Due'}
        </Text>
        {profile?.lastRentPayment && (
          <Text>
            Last Paid: {new Date(profile.lastRentPayment).toLocaleDateString()}
          </Text>
        )}
      </Box>

      <Box overflowX="auto">
        <Heading size="sm" mb={2}>Payment History</Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Amount</Th>
              <Th>Payment Method</Th>
              <Th>Transaction ID</Th>
              <Th>For Month</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <Tr key={payment._id}>
                  <Td>{new Date(payment.paymentDate).toLocaleDateString()}</Td>
                  <Td>₹{payment.amount}</Td>
                  <Td>{payment.paymentMethod}</Td>
                  <Td>{payment.transactionId}</Td>
                  <Td>
                    {new Date(payment.forMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Td>
                  <Td>{payment.status}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} textAlign="center">No payment history found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Make Rent Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl mb={3} isRequired>
                <FormLabel>Amount (₹)</FormLabel>
                <NumberInput
                  min={profile?.hostel?.rentPerMonth || 0}
                  value={formData.amount}
                  onChange={handleAmountChange}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              
              <FormControl mb={3} isRequired>
                <FormLabel>Payment Method</FormLabel>
                <Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  placeholder="Select payment method"
                >
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="NetBanking">NetBanking</option>
                  <option value="Cash">Cash</option>
                </Select>
              </FormControl>
              
              <ModalFooter px={0}>
                <Button type="submit" colorScheme="blue" mr={3}>
                  Pay Now
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PaymentsTab;
import React, { useState, useEffect } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner, Badge,
  Button, useToast
} from '@chakra-ui/react';
import { getRentStatus } from '../../services/api';

const PaymentStatus = () => {
  const [hostellers, setHostellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  const fetchRentStatus = async () => {
    try {
      setLoading(true);
      const data = await getRentStatus();
      setHostellers(data);
      setError('');
    } catch (err) {
      setError('Failed to load rent status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentStatus();
  }, []);

  const handleSendReminder = (hosteller) => {
    // This would typically send an email or notification
    // For now, just show a toast
    toast({
      title: 'Reminder sent',
      description: `Reminder has been sent to ${hosteller.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box>
      <Box mb={4}>
        <Heading size="md">Rent Payment Status</Heading>
      </Box>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Room</Th>
              <Th>Rent Status</Th>
              <Th>Last Payment</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {hostellers.length > 0 ? (
              hostellers.map((hosteller) => (
                <Tr key={hosteller._id}>
                  <Td>{hosteller.name}</Td>
                  <Td>{hosteller.email}</Td>
                  <Td>{hosteller.room}</Td>
                  <Td>
                    <Badge
                      colorScheme={hosteller.rentPaid ? 'green' : 'red'}
                    >
                      {hosteller.rentPaid ? 'Paid' : 'Due'}
                    </Badge>
                  </Td>
                  <Td>
                    {hosteller.lastRentPayment
                      ? new Date(hosteller.lastRentPayment).toLocaleDateString()
                      : 'No payment yet'}
                  </Td>
                  <Td>
                    {!hosteller.rentPaid && (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleSendReminder(hosteller)}
                      >
                        Send Reminder
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} textAlign="center">No hostellers found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default PaymentStatus;
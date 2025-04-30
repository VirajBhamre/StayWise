import React, { useState, useEffect } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner, Button,
  useToast
} from '@chakra-ui/react';
import { getHostellerEvents, registerForEvent } from '../services/api';

const HostellerEventsTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(null);
  const toast = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getHostellerEvents();
      setEvents(data);
      setError('');
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      setRegistering(eventId);
      await registerForEvent(eventId);
      toast({
        title: 'Registration successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchEvents(); // Refresh the list to update registration status
    } catch (err) {
      toast({
        title: 'Registration failed',
        description: err.response?.data?.message || 'Could not register for the event',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRegistering(null);
    }
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box>
      <Box mb={4}>
        <Heading size="md">Upcoming Events</Heading>
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
              <Th>Title</Th>
              <Th>Description</Th>
              <Th>Date & Time</Th>
              <Th>Location</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {events.length > 0 ? (
              events.map((event) => (
                <Tr key={event._id}>
                  <Td>{event.title}</Td>
                  <Td>{event.description}</Td>
                  <Td>
                    {new Date(event.date).toLocaleDateString()} at {' '}
                    {new Date(event.date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Td>
                  <Td>{event.location}</Td>
                  <Td>
                    {event.isRegistered ? (
                      <Button colorScheme="green" size="sm" isDisabled>
                        Registered
                      </Button>
                    ) : (
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleRegister(event._id)}
                        isLoading={registering === event._id}
                      >
                        Register
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center">No upcoming events</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default HostellerEventsTab;
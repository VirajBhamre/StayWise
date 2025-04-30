import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner, Badge,
  useToast
} from '@chakra-ui/react';
import { getHostellerEvents, registerForEvent } from '../../services/api';

const EventsTab = () => {
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
        title: 'Registered for event',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Refresh events to update registration status
      fetchEvents();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Registration failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRegistering(null);
    }
  };

  const isParticipant = (event, userId) => {
    return event.participants && event.participants.some(p => p._id === userId);
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box>
      <Box mb={4}>
        <Heading size="md">Hostel Events</Heading>
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
              <Th>Event</Th>
              <Th>Description</Th>
              <Th>Date</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {events.length > 0 ? (
              events.map((event) => (
                <Tr key={event._id}>
                  <Td>{event.title}</Td>
                  <Td>{event.description}</Td>
                  <Td>{new Date(event.date).toLocaleString()}</Td>
                  <Td>
                    {isParticipant(event, event._id) ? (
                      <Badge colorScheme="green">Registered</Badge>
                    ) : (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        isLoading={registering === event._id}
                        onClick={() => handleRegister(event._id)}
                      >
                        Register
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={4} textAlign="center">No upcoming events found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default EventsTab;
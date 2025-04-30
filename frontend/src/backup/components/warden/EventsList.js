import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, FormControl, FormLabel,
  Input, Textarea, ModalFooter, useDisclosure, useToast
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { getWardenEvents, createEvent } from '../../services/api';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: ''
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getWardenEvents();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEvent(formData);
      toast({
        title: 'Event created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setFormData({ title: '', description: '', date: '' });
      fetchEvents();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create event',
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
        <Heading size="md">Hostel Events</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
          Create Event
        </Button>
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
              <Th>Date</Th>
              <Th>Created</Th>
              <Th>Participants</Th>
            </Tr>
          </Thead>
          <Tbody>
            {events.length > 0 ? (
              events.map((event) => (
                <Tr key={event._id}>
                  <Td>{event.title}</Td>
                  <Td>{event.description}</Td>
                  <Td>{new Date(event.date).toLocaleString()}</Td>
                  <Td>{new Date(event.createdAt).toLocaleDateString()}</Td>
                  <Td>{event.participants?.length || 0}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center">No events found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl mb={3} isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </FormControl>
              
              <FormControl mb={3} isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </FormControl>
              
              <FormControl mb={3} isRequired>
                <FormLabel>Event Date & Time</FormLabel>
                <Input
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleChange}
                />
              </FormControl>
              
              <ModalFooter px={0}>
                <Button type="submit" colorScheme="blue" mr={3}>
                  Create
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

export default EventsList;
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, FormControl, FormLabel,
  Input, Textarea, ModalFooter, useDisclosure, useToast
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { getHostellerMaintenanceRequests, createMaintenanceRequest } from '../../services/api';

const MaintenanceTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getHostellerMaintenanceRequests();
      setRequests(data);
      setError('');
    } catch (err) {
      setError('Failed to load maintenance requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaintenanceRequest(formData);
      toast({
        title: 'Maintenance request submitted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setFormData({ title: '', description: '' });
      fetchRequests();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to submit request',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'scheduled': return 'purple';
      case 'in-progress': return 'blue';
      case 'rejected': return 'red';
      default: return 'orange';
    }
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Maintenance Requests</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
          New Request
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
              <Th>Status</Th>
              <Th>Scheduled Date</Th>
              <Th>Response</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <Tr key={request._id}>
                  <Td>{request.title}</Td>
                  <Td>{request.description}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </Td>
                  <Td>
                    {request.scheduledDate 
                      ? new Date(request.scheduledDate).toLocaleDateString() 
                      : '-'
                    }
                  </Td>
                  <Td>{request.wardenResponse || '-'}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center">No maintenance requests found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Submit Maintenance Request</ModalHeader>
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
              
              <ModalFooter px={0}>
                <Button type="submit" colorScheme="blue" mr={3}>
                  Submit
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

export default MaintenanceTab;
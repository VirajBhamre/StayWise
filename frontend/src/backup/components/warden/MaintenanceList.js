import React, { useState, useEffect } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, FormControl, FormLabel,
  Select, Textarea, Button, ModalFooter, Input, Text,
  useDisclosure, useToast
} from '@chakra-ui/react';
import { getWardenMaintenanceRequests, respondToMaintenance } from '../../services/api';

const MaintenanceList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    scheduledDate: '',
    wardenResponse: ''
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getWardenMaintenanceRequests();
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

  const handleResponseModal = (request) => {
    setSelectedRequest(request);
    setFormData({
      status: request.status,
      scheduledDate: request.scheduledDate ? new Date(request.scheduledDate).toISOString().slice(0, 10) : '',
      wardenResponse: request.wardenResponse || ''
    });
    onOpen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await respondToMaintenance(selectedRequest._id, formData);
      toast({
        title: 'Response submitted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchRequests();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to submit response',
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
      <Box mb={4}>
        <Heading size="md">Maintenance Requests</Heading>
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
              <Th>Student</Th>
              <Th>Room</Th>
              <Th>Status</Th>
              <Th>Scheduled Date</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <Tr key={request._id}>
                  <Td>{request.title}</Td>
                  <Td>{request.description}</Td>
                  <Td>{request.hosteller?.name}</Td>
                  <Td>{request.room}</Td>
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
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleResponseModal(request)}
                    >
                      Update
                    </Button>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={7} textAlign="center">No maintenance requests found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Respond to Maintenance Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest && (
              <Box mb={4}>
                <Heading size="sm">{selectedRequest.title}</Heading>
                <Text mt={2}>{selectedRequest.description}</Text>
                <Text mt={2} fontSize="sm">
                  By {selectedRequest.hosteller?.name} (Room: {selectedRequest.room})
                </Text>
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <FormControl mb={3} isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </FormControl>
              
              {(formData.status === 'scheduled' || formData.status === 'in-progress') && (
                <FormControl mb={3}>
                  <FormLabel>Scheduled Date</FormLabel>
                  <Input
                    name="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                  />
                </FormControl>
              )}
              
              <FormControl mb={3} isRequired>
                <FormLabel>Response</FormLabel>
                <Textarea
                  name="wardenResponse"
                  value={formData.wardenResponse}
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

export default MaintenanceList;
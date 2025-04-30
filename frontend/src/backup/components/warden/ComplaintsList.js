import React, { useState, useEffect } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, FormControl, FormLabel,
  Select, Textarea, Button, ModalFooter, Text,
  useDisclosure, useToast
} from '@chakra-ui/react';
import { getWardenComplaints, respondToComplaint } from '../../services/api';

const ComplaintsList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    wardenResponse: ''
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getWardenComplaints();
      setComplaints(data);
      setError('');
    } catch (err) {
      setError('Failed to load complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResponseModal = (complaint) => {
    setSelectedComplaint(complaint);
    setFormData({
      status: complaint.status,
      wardenResponse: complaint.wardenResponse || ''
    });
    onOpen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await respondToComplaint(selectedComplaint._id, formData);
      toast({
        title: 'Response submitted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchComplaints();
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
      case 'resolved': return 'green';
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
        <Heading size="md">Complaints</Heading>
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
              <Th>Date</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {complaints.length > 0 ? (
              complaints.map((complaint) => (
                <Tr key={complaint._id}>
                  <Td>{complaint.title}</Td>
                  <Td>{complaint.description}</Td>
                  <Td>{complaint.hosteller?.name}</Td>
                  <Td>{complaint.hosteller?.room}</Td>
                  <Td>{new Date(complaint.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(complaint.status)}>
                      {complaint.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleResponseModal(complaint)}
                    >
                      Respond
                    </Button>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={7} textAlign="center">No complaints found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Respond to Complaint</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedComplaint && (
              <Box mb={4}>
                <Heading size="sm">{selectedComplaint.title}</Heading>
                <Text mt={2}>{selectedComplaint.description}</Text>
                <Text mt={2} fontSize="sm">
                  By {selectedComplaint.hosteller?.name} (Room: {selectedComplaint.hosteller?.room})
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
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </FormControl>
              
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

export default ComplaintsList;
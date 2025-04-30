import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, FormControl, FormLabel,
  Input, Textarea, ModalFooter, useDisclosure, useToast
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { getHostellerComplaints, createComplaint } from '../../services/api';

const ComplaintsTab = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getHostellerComplaints();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createComplaint(formData);
      toast({
        title: 'Complaint submitted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setFormData({ title: '', description: '' });
      fetchComplaints();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to submit complaint',
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">My Complaints</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
          New Complaint
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
              <Th>Date</Th>
              <Th>Response</Th>
            </Tr>
          </Thead>
          <Tbody>
            {complaints.length > 0 ? (
              complaints.map((complaint) => (
                <Tr key={complaint._id}>
                  <Td>{complaint.title}</Td>
                  <Td>{complaint.description}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(complaint.status)}>
                      {complaint.status}
                    </Badge>
                  </Td>
                  <Td>{new Date(complaint.createdAt).toLocaleDateString()}</Td>
                  <Td>{complaint.wardenResponse || '-'}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center">No complaints found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Submit a Complaint</ModalHeader>
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

export default ComplaintsTab;
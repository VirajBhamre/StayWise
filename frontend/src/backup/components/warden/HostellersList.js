import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, FormControl, FormLabel,
  Input, ModalFooter, useDisclosure, useToast
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { getAllHostellers, addHosteller, updateHosteller, removeHosteller } from '../../services/api';

const HostellersList = () => {
  const [hostellers, setHostellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHosteller, setSelectedHosteller] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    room: '',
    password: '',
    confirmPassword: ''
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchHostellers = async () => {
    try {
      setLoading(true);
      const data = await getAllHostellers();
      setHostellers(data);
      setError('');
    } catch (err) {
      setError('Failed to load hostellers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostellers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddModal = () => {
    setSelectedHosteller(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      room: '',
      password: '',
      confirmPassword: ''
    });
    onOpen();
  };

  const handleEditModal = (hosteller) => {
    setSelectedHosteller(hosteller);
    setFormData({
      name: hosteller.name,
      email: hosteller.email,
      phone: hosteller.phone,
      room: hosteller.room,
      password: '',
      confirmPassword: ''
    });
    onOpen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedHosteller && formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (selectedHosteller) {
        // Update existing hosteller
        await updateHosteller(selectedHosteller._id, {
          name: formData.name,
          phone: formData.phone,
          room: formData.room
        });
        toast({
          title: 'Hosteller updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new hosteller
        await addHosteller({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          room: formData.room,
          password: formData.password
        });
        toast({
          title: 'Hosteller added',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      fetchHostellers();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Operation failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this hosteller?')) {
      try {
        await removeHosteller(id);
        toast({
          title: 'Hosteller removed',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchHostellers();
      } catch (err) {
        toast({
          title: 'Error',
          description: err.response?.data?.message || 'Delete failed',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Hostellers</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddModal}>
          Add Hosteller
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
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Room</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {hostellers.length > 0 ? (
              hostellers.map((hosteller) => (
                <Tr key={hosteller._id}>
                  <Td>{hosteller.name}</Td>
                  <Td>{hosteller.email}</Td>
                  <Td>{hosteller.phone}</Td>
                  <Td>{hosteller.room}</Td>
                  <Td>
                    <IconButton
                      aria-label="Edit hosteller"
                      icon={<EditIcon />}
                      size="sm"
                      mr={2}
                      onClick={() => handleEditModal(hosteller)}
                    />
                    <IconButton
                      aria-label="Delete hosteller" 
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(hosteller._id)}
                    />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center">No hostellers found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedHosteller ? 'Edit Hosteller' : 'Add New Hosteller'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl mb={3} isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </FormControl>
              
              <FormControl mb={3} isRequired isDisabled={!!selectedHosteller}>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </FormControl>
              
              <FormControl mb={3} isRequired>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </FormControl>
              
              <FormControl mb={3} isRequired>
                <FormLabel>Room</FormLabel>
                <Input
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                />
              </FormControl>
              
              {!selectedHosteller && (
                <>
                  <FormControl mb={3} isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </FormControl>
                  
                  <FormControl mb={3} isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </FormControl>
                </>
              )}
              
              <ModalFooter px={0}>
                <Button type="submit" colorScheme="blue" mr={3}>
                  {selectedHosteller ? 'Update' : 'Add'}
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

export default HostellersList;
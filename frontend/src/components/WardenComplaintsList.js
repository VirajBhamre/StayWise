import React, { useState, useEffect } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, FormControl, FormLabel,
  Select, Textarea, Button, ModalFooter, Text,
  useDisclosure, useToast, Icon, Flex, HStack, useToken,
  InputGroup
} from '@chakra-ui/react';
import { FaExclamationCircle, FaUserAlt, FaCalendarAlt, FaComment } from 'react-icons/fa';
import { getWardenComplaints, respondToComplaint } from '../services/api';

const WardenComplaintsList = () => {
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
  const [gold400, gold500, gold600] = useToken('colors', ['gold.400', 'gold.500', 'gold.600']);

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
        position: "top-right",
        variant: "solid",
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
        position: "top-right",
        variant: "solid",
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
    return (
      <Flex justify="center" align="center" h="100%" py={8}>
        <Spinner 
          thickness="4px"
          speed="0.65s"
          color="gold.500"
          size="xl"
        />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading 
          size="md" 
          bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
          bgClip="text"
          display="flex"
          alignItems="center"
        >
          <Icon as={FaExclamationCircle} mr={2} />
          Complaints Management
        </Heading>
      </Flex>

      {error && (
        <Alert 
          status="error" 
          mb={6} 
          bg="rgba(229, 62, 62, 0.1)" 
          borderLeft="4px solid" 
          borderColor="red.500" 
          color="white" 
          borderRadius="md"
        >
          <AlertIcon color="red.400" />
          <Text>{error}</Text>
        </Alert>
      )}

      <Box 
        overflowX="auto"
        layerStyle="glassmorphism"
        p={4} 
        borderRadius="md"
        mb={6}
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Title</Th>
              <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Description</Th>
              <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Student</Th>
              <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Room</Th>
              <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Date</Th>
              <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Status</Th>
              <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {complaints.length > 0 ? (
              complaints.map((complaint) => (
                <Tr key={complaint._id} _hover={{ bg: "whiteAlpha.50" }}>
                  <Td fontWeight="medium">{complaint.title}</Td>
                  <Td>{complaint.description}</Td>
                  <Td>{complaint.hosteller?.name}</Td>
                  <Td>
                    <Badge 
                      bg="blue.800" 
                      color="whiteAlpha.900"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {complaint.hosteller?.room}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={1} opacity={0.8}>
                      <Icon as={FaCalendarAlt} color="gold.400" boxSize={3} />
                      <Text>{new Date(complaint.createdAt).toLocaleDateString()}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={getStatusColor(complaint.status)}
                      px={2}
                      py={1}
                      borderRadius="full"
                      textTransform="capitalize"
                    >
                      {complaint.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      bg="gold.500"
                      color="black"
                      _hover={{
                        bg: "gold.600",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
                      }}
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
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          bg="background.card"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
        >
          <ModalHeader
            bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
            bgClip="text"
            fontFamily="heading"
            display="flex"
            alignItems="center"
          >
            <Icon as={FaComment} mr={2} />
            Respond to Complaint
          </ModalHeader>
          <ModalCloseButton color="whiteAlpha.700" _hover={{ color: "white" }} />
          <ModalBody pb={6}>
            {selectedComplaint && (
              <Box 
                mb={4}
                p={4}
                bg="background.accent"
                borderRadius="md"
                layerStyle="glassmorphism"
              >
                <Heading 
                  size="sm" 
                  mb={2}
                  display="flex"
                  alignItems="center"
                >
                  {selectedComplaint.title}
                </Heading>
                <Text mb={3}>{selectedComplaint.description}</Text>
                <Flex 
                  justify="space-between" 
                  align="center"
                  bg="whiteAlpha.100"
                  p={2}
                  borderRadius="md"
                >
                  <HStack>
                    <Icon as={FaUserAlt} color="gold.400" />
                    <Text fontWeight="medium">
                      By {selectedComplaint.hosteller?.name} (Room: {selectedComplaint.hosteller?.room})
                    </Text>
                  </HStack>
                  <Badge colorScheme={getStatusColor(selectedComplaint.status)}>
                    {selectedComplaint.status}
                  </Badge>
                </Flex>
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <FormControl mb={4} isRequired>
                <FormLabel color="text.secondary" fontWeight="medium">Status</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  bg="background.accent"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "gold.500" }}
                  _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </FormControl>
              
              <FormControl mb={4} isRequired>
                <FormLabel color="text.secondary" fontWeight="medium">Response</FormLabel>
                <Textarea
                  name="wardenResponse"
                  value={formData.wardenResponse}
                  onChange={handleChange}
                  rows={4}
                  bg="background.accent"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "gold.500" }}
                  _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                  placeholder="Enter your response to the complaint"
                />
              </FormControl>
              
              <ModalFooter px={0}>
                <Button 
                  type="submit" 
                  bg="gold.500"
                  color="black"
                  mr={3}
                  _hover={{
                    bg: "gold.600",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
                  }}
                >
                  Submit
                </Button>
                <Button 
                  onClick={onClose}
                  variant="outline" 
                  borderColor="whiteAlpha.300"
                  color="text.secondary"
                  _hover={{ bg: "whiteAlpha.100", color: "white" }}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default WardenComplaintsList;
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Spinner, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, FormControl, FormLabel,
  Textarea, ModalFooter, useDisclosure, useToast,
  Icon, Flex, HStack, Text, Input, useToken,
  InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { FaExclamationCircle, FaPlus, FaComment, FaCalendarAlt, FaExclamation } from 'react-icons/fa';
import { getHostellerComplaints, createComplaint } from '../services/api';

const MotionBox = motion(Box);

const HostellerComplaintsTab = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [gold400, gold500, gold600] = useToken('colors', ['gold.400', 'gold.500', 'gold.600']);

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
        position: "top-right",
        variant: "solid",
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
          My Complaints
        </Heading>
        <Button 
          leftIcon={<Icon as={FaPlus} />} 
          bg="gold.500"
          color="black"
          _hover={{
            bg: "gold.600",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
          }}
          onClick={onOpen}
        >
          New Complaint
        </Button>
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

      {complaints.length === 0 ? (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          layerStyle="glassmorphism"
          p={6}
          mb={6}
          textAlign="center"
        >
          <Icon as={FaComment} color="gold.400" boxSize={10} mb={4} />
          <Text fontSize="lg" color="text.secondary">
            You haven't submitted any complaints yet.
          </Text>
          <Button 
            leftIcon={<Icon as={FaPlus} />} 
            onClick={onOpen}
            bg="gold.500"
            color="black"
            mt={4}
            _hover={{
              bg: "gold.600",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
            }}
          >
            Submit Your First Complaint
          </Button>
        </MotionBox>
      ) : (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          layerStyle="glassmorphism"
          p={6}
          mb={6}
          overflow="hidden"
        >
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Title</Th>
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Description</Th>
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Date</Th>
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Status</Th>
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Warden Response</Th>
                </Tr>
              </Thead>
              <Tbody>
                {complaints.map((complaint) => (
                  <Tr key={complaint._id} _hover={{ bg: "whiteAlpha.50" }}>
                    <Td fontWeight="medium">{complaint.title}</Td>
                    <Td>{complaint.description}</Td>
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
                    <Td>{complaint.wardenResponse || '-'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </MotionBox>
      )}

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
            <Icon as={FaExclamation} mr={2} />
            Submit New Complaint
          </ModalHeader>
          <ModalCloseButton color="whiteAlpha.700" _hover={{ color: "white" }} />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl mb={4} isRequired>
                <FormLabel color="text.secondary" fontWeight="medium">Title</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief title of your complaint"
                  bg="background.accent"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "gold.500" }}
                  _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                />
              </FormControl>
              
              <FormControl mb={4} isRequired>
                <FormLabel color="text.secondary" fontWeight="medium">Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your issue in detail"
                  rows={4}
                  bg="background.accent"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "gold.500" }}
                  _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
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

export default HostellerComplaintsTab;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text, 
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Alert,
  AlertIcon,
  Spinner,
  useDisclosure,
  useToken,
  Flex,
  Icon,
  HStack,
  VStack
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaClipboardList, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { getWardenRequests, approveWardenRequest, rejectWardenRequest } from '../../services/api';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const WardenRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [gold400, gold500, gold600] = useToken('colors', ['gold.400', 'gold.500', 'gold.600']);
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getWardenRequests();
      setRequests(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch warden requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request) => {
    try {
      setProcessingId(request._id);
      await approveWardenRequest(request._id);
      toast({
        title: "Request Approved",
        description: `Access credentials have been sent to ${request.email}`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
      fetchRequests();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to approve request",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    try {
      setProcessingId(selectedRequest._id);
      await rejectWardenRequest(selectedRequest._id, rejectionReason);
      toast({
        title: "Request Rejected",
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
      onClose();
      setRejectionReason('');
      fetchRequests();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to reject request",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
        variant: "solid",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    onOpen();
  };

  if (loading) {
    return (
      <Flex 
        minH="100vh" 
        align="center" 
        justify="center"
        bgGradient="linear(to-br, background.primary, #111927, #000913)"
        backgroundSize="cover"
        backgroundAttachment="fixed"
      >
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Spinner 
            thickness="4px"
            speed="0.65s"
            color="gold.500"
            size="xl"
          />
        </MotionBox>
      </Flex>
    );
  }

  return (
    <Box
      minHeight="100vh"
      bgGradient="linear(to-br, background.primary, #111927, #000913)"
      backgroundSize="cover"
      backgroundAttachment="fixed"
      py={6}
    >
      <Container maxW="container.xl">
        <MotionFlex
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          mb={8}
          alignItems="center"
        >
          <Icon as={FaClipboardList} color="gold.500" boxSize={6} mr={3} />
          <Heading 
            size="lg"
            bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
            bgClip="text"
            letterSpacing="tight"
          >
            Warden Access Requests
          </Heading>
        </MotionFlex>
        
        {error && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            mb={6} 
            p={4} 
            bg="rgba(229, 62, 62, 0.1)" 
            borderLeft="4px solid" 
            borderColor="red.500" 
            color="white" 
            borderRadius="md"
          >
            <Flex align="center">
              <Icon as={FaExclamationTriangle} color="red.400" mr={2} />
              <Text>{error}</Text>
            </Flex>
          </MotionBox>
        )}
        
        {requests.length === 0 ? (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            layerStyle="glassmorphism"
            p={6}
            mb={6}
            textAlign="center"
          >
            <Icon as={FaClipboardList} color="gold.400" boxSize={10} mb={4} />
            <Text fontSize="lg" color="text.secondary">
              There are no pending warden access requests.
            </Text>
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
                    <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Date</Th>
                    <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Warden Name</Th>
                    <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Email</Th>
                    <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Phone</Th>
                    <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Hostel Name</Th>
                    <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Address</Th>
                    <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Rooms</Th>
                    <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Status</Th>
                    <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {requests.map(request => (
                    <Tr key={request._id} _hover={{ bg: "whiteAlpha.50" }}>
                      <Td>{new Date(request.createdAt).toLocaleDateString()}</Td>
                      <Td fontWeight="medium">{request.wardenName}</Td>
                      <Td>{request.email}</Td>
                      <Td>{request.phone}</Td>
                      <Td fontWeight="medium">{request.hostelName}</Td>
                      <Td>{request.address}</Td>
                      <Td>{request.totalRooms}</Td>
                      <Td>
                        <Badge 
                          colorScheme={
                            request.status === 'pending' ? 'yellow' : 
                            request.status === 'approved' ? 'green' : 
                            'red'
                          }
                          px={2}
                          py={1}
                          borderRadius="full"
                          textTransform="capitalize"
                        >
                          {request.status}
                        </Badge>
                      </Td>
                      <Td>
                        {request.status === 'pending' && (
                          <HStack spacing={2}>
                            <Button 
                              leftIcon={<Icon as={FaCheck} />}
                              bg="gold.500"
                              color="black"
                              size="sm" 
                              mr={2}
                              onClick={() => handleApprove(request)}
                              isLoading={processingId === request._id}
                              loadingText="Approving"
                              _hover={{
                                bg: "gold.600",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
                              }}
                            >
                              Approve
                            </Button>
                            <Button 
                              leftIcon={<Icon as={FaTimes} />}
                              variant="outline"
                              borderColor="red.500"
                              color="red.500"
                              size="sm"
                              onClick={() => openRejectModal(request)}
                              isLoading={processingId === request._id && isOpen}
                              loadingText="Rejecting"
                              _hover={{
                                bg: "rgba(229, 62, 62, 0.1)",
                                borderColor: "red.400"
                              }}
                            >
                              Reject
                            </Button>
                          </HStack>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </MotionBox>
        )}
        
        {/* Rejection Reason Modal */}
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
            >
              Reject Access Request
            </ModalHeader>
            <ModalCloseButton color="whiteAlpha.700" _hover={{ color: "white" }} />
            <ModalBody pb={6}>
              <VStack align="stretch" spacing={4}>
                <Text fontWeight="medium">
                  Please provide a reason for rejecting the request from <Text as="span" color="gold.400">{selectedRequest?.wardenName}</Text> for <Text as="span" color="gold.400">{selectedRequest?.hostelName}</Text>.
                </Text>
                <FormControl>
                  <FormLabel color="text.secondary" fontWeight="medium">Reason for Rejection</FormLabel>
                  <Textarea 
                    value={rejectionReason} 
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter your reason for rejecting this request"
                    bg="background.accent"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "gold.500" }}
                    _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button 
                colorScheme="red" 
                mr={3} 
                onClick={handleReject}
                isLoading={processingId === selectedRequest?._id}
                leftIcon={<Icon as={FaTimes} />}
              >
                Reject Request
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                borderColor="whiteAlpha.300"
                color="text.secondary"
                _hover={{ bg: "whiteAlpha.100", color: "white" }}
              >
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default WardenRequestsPage;
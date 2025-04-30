import React, { useState, useEffect } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Button, Alert, AlertIcon, Spinner,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, ModalFooter,
  FormControl, FormLabel, Textarea,
  useDisclosure, useToast
} from '@chakra-ui/react';
import { getWardenRequests, approveWardenRequest, rejectWardenRequest } from '../services/api';

const AdminHostelRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getWardenRequests();
      setRequests(data);
      setError('');
    } catch (err) {
      setError('Failed to load hostel requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request) => {
    if (window.confirm(`Are you sure you want to approve ${request.name}?`)) {
      try {
        setProcessingId(request._id);
        await approveWardenRequest(request._id);
        toast({
          title: 'Hostel approved',
          description: `${request.name} has been approved successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchRequests();
      } catch (err) {
        toast({
          title: 'Error',
          description: err.response?.data?.message || 'Failed to approve hostel',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectReason('');
    onOpen();
  };

  const handleReject = async () => {
    try {
      setProcessingId(selectedRequest._id);
      await rejectWardenRequest(selectedRequest._id, rejectReason);
      toast({
        title: 'Hostel rejected',
        description: `${selectedRequest.name} has been rejected.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchRequests();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to reject hostel',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {requests.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          There are no pending hostel registration requests.
        </Alert>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Hostel Name</Th>
                <Th>Warden Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Address</Th>
                <Th>Rooms</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {requests.map(request => (
                <Tr key={request._id}>
                  <Td>{new Date(request.registrationDate).toLocaleDateString()}</Td>
                  <Td>{request.name}</Td>
                  <Td>{request.warden?.name}</Td>
                  <Td>{request.warden?.email}</Td>
                  <Td>{request.warden?.phone}</Td>
                  <Td>{request.address}</Td>
                  <Td>{request.totalRooms}</Td>
                  <Td>
                    <Badge colorScheme={
                      request.isApproved ? 'green' : 'yellow'
                    }>
                      {request.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </Td>
                  <Td>
                    <Button 
                      bg="gold.500"
                      color="black"
                      size="sm" 
                      mr={4}
                      onClick={() => handleApprove(request)}
                      isLoading={processingId === request._id}
                      isDisabled={processingId !== null}
                      _hover={{
                        bg: "gold.600",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
                      }}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="outline"
                      borderColor="red.500"
                      color="red.500"
                      size="sm"
                      onClick={() => handleRejectModal(request)}
                      isDisabled={processingId !== null}
                      _hover={{
                        bg: "rgba(229, 62, 62, 0.1)",
                        borderColor: "red.400",
                        transform: "translateY(-2px)"
                      }}
                    >
                      Reject
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Hostel Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Reason for rejection</FormLabel>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejecting this request"
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="outline"
              borderColor="red.500"
              color="red.500"
              mr={3} 
              onClick={handleReject}
              isLoading={processingId !== null}
              _hover={{
                bg: "rgba(229, 62, 62, 0.1)",
                borderColor: "red.400",
                transform: "translateY(-2px)"
              }}
            >
              Reject
            </Button>
            <Button 
              variant="ghost"
              color="text.secondary"
              onClick={onClose}
              _hover={{
                bg: "whiteAlpha.100",
                color: "white"
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminHostelRequestsList;
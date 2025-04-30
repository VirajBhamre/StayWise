import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Text, Alert, AlertIcon, Box
} from '@chakra-ui/react';

const ArchitectureRequiredModal = ({ isOpen, onClose, onProceed }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Room Setup Required</ModalHeader>
        <ModalBody>
          <Alert status="info" borderRadius="md" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Room Setup Required</Text>
              <Text fontSize="sm">
                Before you can manage hostellers, you need to define the room structure of your hostel.
              </Text>
            </Box>
          </Alert>
          
          <Text mb={4}>
            You need to define the floors and rooms in your hostel before proceeding. This is a one-time setup that will help you:
          </Text>
          
          <Box pl={4}>
            <Text>• Manage room assignments for hostellers</Text>
            <Text>• Track room occupancy</Text>
            <Text>• Organize hostellers by floor and room</Text>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onProceed}>
            Set Up Rooms Now
          </Button>
          <Button variant="ghost" onClick={onClose}>Later</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ArchitectureRequiredModal;
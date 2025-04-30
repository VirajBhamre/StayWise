import React, { useState, useEffect } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, 
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Divider, Text, useToast, SimpleGrid, 
  Table, Thead, Tbody, Tr, Th, Td, IconButton, HStack, Icon, Flex,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, Alert, AlertIcon, Select, useToken,
  Circle, Badge, InputGroup, InputLeftElement, InputRightElement
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, CheckIcon } from '@chakra-ui/icons';
import { 
  FaBuilding, FaDoorOpen, FaBed, FaPlus, FaTrash, 
  FaRegLightbulb, FaCheck, FaMagic, FaLayerGroup
} from 'react-icons/fa';
import { defineRoomArchitecture } from '../services/api';
import detectRoomPattern from '../utils/roomPatternDetection';
import FloorRoomsInput from './FloorRoomsInput';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const RoomArchitectureSetup = ({ onComplete }) => {
  const [floors, setFloors] = useState([{ floorName: 'Ground Floor', rooms: [] }]);
  const [defaultCapacity, setDefaultCapacity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patternSuggestion, setPatternSuggestion] = useState(null);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [gold400, gold500, gold600] = useToken('colors', ['gold.400', 'gold.500', 'gold.600']);

  const handleAddFloor = () => {
    setFloors([...floors, { floorName: `Floor ${floors.length}`, rooms: [] }]);
  };

  const handleDeleteFloor = (index) => {
    const newFloors = [...floors];
    newFloors.splice(index, 1);
    setFloors(newFloors);
  };

  const handleFloorNameChange = (index, name) => {
    const newFloors = [...floors];
    newFloors[index].floorName = name;
    setFloors(newFloors);
  };

  const handleAddRoom = (floorIndex, roomNumber, capacity = defaultCapacity) => {
    // Check if room already exists
    if (floors[floorIndex].rooms.some(r => r.roomNumber === roomNumber)) {
      toast({
        title: 'Room already exists',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
        variant: 'solid',
      });
      return;
    }

    const newFloors = [...floors];
    newFloors[floorIndex].rooms.push({
      roomNumber,
      capacity: parseInt(capacity),
      occupants: 0,
      occupied: false
    });
    setFloors(newFloors);

    // Check for patterns if we have at least 3 rooms
    if (newFloors[floorIndex].rooms.length >= 3) {
      const roomNumbers = newFloors[floorIndex].rooms.map(r => r.roomNumber);
      const pattern = detectRoomPattern(roomNumbers);
      
      if (pattern) {
        setPatternSuggestion({ floorIndex, pattern });
        onOpen();
      }
    }
  };

  const handleDeleteRoom = (floorIndex, roomIndex) => {
    const newFloors = [...floors];
    newFloors[floorIndex].rooms.splice(roomIndex, 1);
    setFloors(newFloors);
  };

  const handleAcceptSuggestion = () => {
    if (!patternSuggestion) return;

    const { floorIndex, pattern } = patternSuggestion;
    const newFloors = [...floors];
    
    // Add suggested room numbers
    pattern.nextNumbers.forEach(roomNumber => {
      // Don't add if room already exists
      if (!newFloors[floorIndex].rooms.some(r => r.roomNumber === roomNumber)) {
        newFloors[floorIndex].rooms.push({
          roomNumber,
          capacity: defaultCapacity,
          occupants: 0,
          occupied: false
        });
      }
    });
    
    setFloors(newFloors);
    onClose();
    setPatternSuggestion(null);
    
    toast({
      title: 'Rooms added successfully',
      description: `Added ${pattern.nextNumbers.length} suggested rooms`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
      variant: 'solid',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that there are rooms
    let totalRooms = 0;
    for (const floor of floors) {
      totalRooms += floor.rooms.length;
    }
    
    if (totalRooms === 0) {
      setError('Please add at least one room');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await defineRoomArchitecture({ floors, defaultCapacity });
      
      toast({
        title: 'Architecture defined successfully',
        description: `Your hostel now has ${totalRooms} rooms across ${floors.length} floors`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
        variant: 'solid',
      });
      
      if (onComplete) {
        onComplete(response);
      }
    } catch (err) {
      console.error('Error defining room architecture:', err);
      
      // Display more detailed error message to help diagnose connection issues
      setError(
        err.message || 
        err.response?.data?.message || 
        'Failed to connect to the server. Please check your network connection.'
      );
      
      toast({
        title: 'Error',
        description: 'Failed to define room architecture. See details in the form.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
        variant: 'solid',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalRooms = () => {
    return floors.reduce((total, floor) => total + floor.rooms.length, 0);
  };

  const getTotalCapacity = () => {
    return floors.reduce((total, floor) => {
      return total + floor.rooms.reduce((floorTotal, room) => floorTotal + room.capacity, 0);
    }, 0);
  };

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Flex align="center" mb={3}>
            <Icon as={FaBuilding} color="gold.500" boxSize={6} mr={2} />
            <Heading 
              size="lg" 
              bgGradient={`linear(to-r, ${gold400}, ${gold600})`}
              bgClip="text"
              letterSpacing="tight"
            >
              Room Architecture Designer
            </Heading>
          </Flex>
          
          <Text color="whiteAlpha.800" mb={4}>
            Design your hostel by defining floors and rooms. This architectural blueprint will be used for all future operations.
          </Text>
          
          {error && (
            <Alert 
              status="error" 
              borderRadius="md" 
              mb={6}
              bg="rgba(229, 62, 62, 0.1)" 
              color="white"
              borderLeft="4px solid"
              borderColor="red.500"
            >
              <AlertIcon color="red.400" />
              {error}
            </Alert>
          )}
        </MotionBox>
        
        {/* Stats Cards */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
            <Box 
              layerStyle="glassmorphism"
              p={5} 
              borderRadius="xl"
              borderColor="whiteAlpha.200"
              pos="relative"
              overflow="hidden"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)"
              }}
              transition="all 0.3s ease"
            >
              <Circle 
                size="40px" 
                bg="rgba(20, 20, 20, 0.7)" 
                color="gold.400"
                pos="absolute"
                top={3}
                right={3}
              >
                <Icon as={FaLayerGroup} />
              </Circle>
              <Text color="whiteAlpha.600" fontSize="sm" fontWeight="medium">FLOORS</Text>
              <Text fontSize="3xl" fontWeight="bold" mt={1}>{floors.length}</Text>
            </Box>
            
            <Box 
              layerStyle="glassmorphism"
              p={5} 
              borderRadius="xl"
              borderColor="whiteAlpha.200"
              pos="relative"
              overflow="hidden"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)"
              }}
              transition="all 0.3s ease"
            >
              <Circle 
                size="40px" 
                bg="rgba(20, 20, 20, 0.7)" 
                color="gold.400"
                pos="absolute"
                top={3}
                right={3}
              >
                <Icon as={FaDoorOpen} />
              </Circle>
              <Text color="whiteAlpha.600" fontSize="sm" fontWeight="medium">TOTAL ROOMS</Text>
              <Text fontSize="3xl" fontWeight="bold" mt={1}>{getTotalRooms()}</Text>
            </Box>
            
            <Box 
              layerStyle="glassmorphism"
              p={5} 
              borderRadius="xl"
              borderColor="whiteAlpha.200"
              pos="relative"
              overflow="hidden"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)"
              }}
              transition="all 0.3s ease"
            >
              <Circle 
                size="40px" 
                bg="rgba(20, 20, 20, 0.7)" 
                color="gold.400"
                pos="absolute"
                top={3}
                right={3}
              >
                <Icon as={FaBed} />
              </Circle>
              <Text color="whiteAlpha.600" fontSize="sm" fontWeight="medium">TOTAL CAPACITY</Text>
              <Text fontSize="3xl" fontWeight="bold" mt={1}>{getTotalCapacity()}</Text>
            </Box>
          </SimpleGrid>
        </MotionBox>
        
        {/* Default Capacity Section */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          layerStyle="glassmorphism"
          p={6}
          borderRadius="xl"
        >
          <Flex align="center" mb={4}>
            <Circle 
              size="35px" 
              bg="gold.500" 
              color="black"
              mr={3}
            >
              <Icon as={FaBed} boxSize={4} />
            </Circle>
            <Text fontSize="lg" fontWeight="semibold">Default Capacity Settings</Text>
          </Flex>
          
          <FormControl id="defaultCapacity">
            <FormLabel color="whiteAlpha.800">Default Students Per Room</FormLabel>
            <NumberInput 
              min={1} 
              max={10} 
              defaultValue={1}
              onChange={(_, val) => setDefaultCapacity(val)}
              bg="whiteAlpha.50"
              borderRadius="md"
              borderColor="whiteAlpha.300"
              _hover={{ borderColor: "gold.500" }}
              _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
              maxW="200px"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper color="gold.500" />
                <NumberDecrementStepper color="gold.500" />
              </NumberInputStepper>
            </NumberInput>
            <Text fontSize="sm" color="whiteAlpha.600" mt={2}>
              This will be the default capacity for all new rooms. You can customize capacities for individual rooms as needed.
            </Text>
          </FormControl>
        </MotionBox>
        
        {/* Floor Management Section */}
        {floors.map((floor, floorIndex) => (
          <MotionBox 
            key={floorIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + (floorIndex * 0.1) }}
            layerStyle="glassmorphism"
            p={6} 
            borderRadius="xl"
            borderLeft="4px solid"
            borderColor="gold.500"
            mb={4}
            position="relative"
          >
            <HStack justifyContent="space-between" mb={6}>
              <Flex align="center">
                <Icon as={FaBuilding} color="gold.400" mr={3} />
                <FormControl width={{ base: "full", md: "300px" }}>
                  <FormLabel color="whiteAlpha.800" fontWeight="medium">Floor Name</FormLabel>
                  <Input 
                    value={floor.floorName}
                    onChange={(e) => handleFloorNameChange(floorIndex, e.target.value)}
                    bg="whiteAlpha.50"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: "gold.500" }}
                    _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                  />
                </FormControl>
              </Flex>
              
              {floors.length > 1 && (
                <IconButton
                  aria-label="Delete floor"
                  icon={<Icon as={FaTrash} />}
                  colorScheme="red"
                  onClick={() => handleDeleteFloor(floorIndex)}
                  variant="ghost"
                  borderRadius="full"
                  _hover={{ bg: "rgba(229, 62, 62, 0.2)" }}
                />
              )}
            </HStack>
            
            <Divider borderColor="whiteAlpha.200" mb={6} />
            
            <Box>
              <Badge 
                bg="blue.800"
                color="whiteAlpha.900"
                px={2}
                py={1}
                borderRadius="md"
                mb={4}
                fontWeight="medium"
                display="inline-flex"
                alignItems="center"
              >
                <Icon as={FaDoorOpen} mr={1} />
                {floor.rooms.length} Rooms
              </Badge>
              
              <FloorRoomsInput
                floor={floor}
                defaultCapacity={defaultCapacity}
                onAddRoom={(roomNumber, capacity) => 
                  handleAddRoom(floorIndex, roomNumber, capacity)
                }
                onDeleteRoom={(roomIndex) => handleDeleteRoom(floorIndex, roomIndex)}
              />
            </Box>
          </MotionBox>
        ))}
        
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 + (floors.length * 0.1) }}
        >
          <Button 
            leftIcon={<Icon as={FaPlus} />} 
            colorScheme="whiteAlpha" 
            variant="outline"
            onClick={handleAddFloor}
            borderRadius="full"
            borderColor="whiteAlpha.300"
            _hover={{ 
              bg: "whiteAlpha.100", 
              borderColor: "gold.500",
              color: "white"
            }}
            mb={6}
            w="full"
          >
            Add Another Floor
          </Button>
        </MotionBox>
        
        {/* Submit Button */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 + (floors.length * 0.1) }}
        >
          <Button
            bg="gold.500"
            color="black"
            size="lg"
            onClick={handleSubmit}
            isLoading={loading}
            _hover={{
              bg: "gold.600",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 8px rgba(255, 202, 40, 0.3)"
            }}
            _active={{ bg: "gold.700" }}
            leftIcon={<Icon as={FaCheck} />}
            fontWeight="semibold"
            borderRadius="md"
            px={8}
            height="54px"
            w={{ base: "full", md: "auto" }}
          >
            Complete Room Architecture Setup
          </Button>
        </MotionBox>
      </VStack>
      
      {/* Pattern suggestion modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          bg="background.card"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
        >
          <ModalHeader
            bg="gold.500"
            color="black"
            borderTopRadius="md"
            display="flex"
            alignItems="center"
          >
            <Icon as={FaRegLightbulb} mr={2} />
            Smart Room Pattern Detected
          </ModalHeader>
          <ModalCloseButton color="black" />
          <ModalBody pb={6} pt={6}>
            <HStack spacing={3} mb={4}>
              <Circle 
                size="40px" 
                bg="gold.500" 
                color="black"
              >
                <Icon as={FaMagic} />
              </Circle>
              <Box>
                <Text fontWeight="semibold" fontSize="lg">Intelligent Room Suggestion</Text>
                <Text color="whiteAlpha.800" fontSize="sm">
                  We've detected a pattern in your room numbers
                </Text>
              </Box>
            </HStack>
            
            <Text mb={4}>
              Would you like to automatically add the following rooms to complete the pattern?
            </Text>
            
            <Box 
              p={4} 
              bg="background.accent" 
              borderRadius="md" 
              borderLeft="3px solid"
              borderColor="gold.500"
              layerStyle="glassmorphism"
            >
              <Text fontWeight="medium" color="gold.400" mb={1}>
                Suggested Rooms:
              </Text>
              <Text fontWeight="bold" fontSize="lg" fontFamily="mono">
                {patternSuggestion?.pattern?.nextNumbers.join(', ')}
              </Text>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button 
              bg="gold.500"
              color="black"
              mr={3} 
              onClick={handleAcceptSuggestion}
              leftIcon={<Icon as={FaCheck} />}
              _hover={{ bg: "gold.600" }}
            >
              Accept Suggestion
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              borderColor="whiteAlpha.300"
              color="text.secondary"
              _hover={{ bg: "whiteAlpha.100", color: "white" }}
            >
              Skip
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
};

export default RoomArchitectureSetup;
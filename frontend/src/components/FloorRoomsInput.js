import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, 
  NumberInput, NumberInputField, NumberInputStepper, 
  NumberIncrementStepper, NumberDecrementStepper,
  Table, Thead, Tbody, Tr, Th, Td, IconButton, 
  HStack, Text, Alert, AlertIcon, Icon, Flex,
  Badge, InputGroup, InputLeftElement, useToken, Tooltip
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { FaDoorOpen, FaBed, FaUsers, FaPlus, FaTrash } from 'react-icons/fa';

const FloorRoomsInput = ({ floor, defaultCapacity, onAddRoom, onDeleteRoom }) => {
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(defaultCapacity);
  const [error, setError] = useState('');
  const [gold400, gold500, gold600] = useToken('colors', ['gold.400', 'gold.500', 'gold.600']);

  const handleAddRoom = () => {
    if (!newRoomNumber.trim()) {
      setError('Room number cannot be empty');
      return;
    }
    
    // Call the parent component's add function
    onAddRoom(newRoomNumber.trim(), roomCapacity);
    
    // Reset fields
    setNewRoomNumber('');
    setError('');
  };

  return (
    <Box>
      <Box 
        bg="whiteAlpha.50" 
        p={4} 
        borderRadius="md" 
        mb={4}
        borderColor="whiteAlpha.200"
        borderWidth="1px"
      >
        <Text fontSize="sm" fontWeight="medium" mb={4} color="whiteAlpha.800">
          Add a new room to this floor
        </Text>
        
        <HStack mb={4} alignItems="flex-end" spacing={4} flexWrap={{ base: "wrap", md: "nowrap" }}>
          <FormControl width={{ base: "100%", md: "60%" }} isRequired>
            <FormLabel fontSize="sm" color="whiteAlpha.700">Room Number/Identifier</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaDoorOpen} color="gold.400" />
              </InputLeftElement>
              <Input 
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                placeholder="e.g. 101, G1, A101"
                bg="whiteAlpha.50"
                borderColor="whiteAlpha.300"
                _hover={{ borderColor: "gold.500" }}
                _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
                pl={10}
              />
            </InputGroup>
          </FormControl>
          
          <FormControl width={{ base: "60%", md: "30%" }}>
            <FormLabel fontSize="sm" color="whiteAlpha.700">Capacity</FormLabel>
            {/* Use a custom InputGroup with the NumberInput inside */}
            <Box position="relative">
              <NumberInput 
                min={1} 
                max={10} 
                value={roomCapacity}
                onChange={(_, val) => setRoomCapacity(val)}
                bg="whiteAlpha.50"
                borderRadius="md"
                borderColor="whiteAlpha.300"
                _hover={{ borderColor: "gold.500" }}
                _focus={{ borderColor: "gold.500", boxShadow: `0 0 0 1px ${gold500}` }}
              >
                <NumberInputField pl={10} />
                <NumberInputStepper>
                  <NumberIncrementStepper color="gold.500" />
                  <NumberDecrementStepper color="gold.500" />
                </NumberInputStepper>
              </NumberInput>
              {/* Place the icon as an absolute element instead of using InputLeftElement */}
              <Box 
                position="absolute" 
                left={3} 
                top="50%" 
                transform="translateY(-50%)" 
                zIndex={2} 
                pointerEvents="none"
              >
                <Icon as={FaUsers} color="gold.400" />
              </Box>
            </Box>
          </FormControl>
          
          <Button 
            leftIcon={<Icon as={FaPlus} />} 
            bg="gold.500"
            color="black"
            onClick={handleAddRoom}
            _hover={{ bg: "gold.600" }}
            width={{ base: "100%", md: "auto" }}
            mt={{ base: 2, md: 0 }}
          >
            Add Room
          </Button>
        </HStack>
        
        {error && (
          <Alert 
            status="error" 
            borderRadius="md" 
            mb={4}
            bg="rgba(229, 62, 62, 0.1)" 
            color="white"
            borderLeft="4px solid"
            borderColor="red.500"
          >
            <AlertIcon color="red.400" />
            {error}
          </Alert>
        )}
      </Box>
      
      {floor.rooms.length > 0 ? (
        <Box overflowX="auto" bg="whiteAlpha.50" borderRadius="md">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th 
                  color="gold.400" 
                  borderColor="whiteAlpha.200"
                  fontWeight="600" 
                  letterSpacing="0.5px" 
                  textTransform="uppercase" 
                  fontSize="xs"
                >
                  Room Number
                </Th>
                <Th 
                  color="gold.400" 
                  borderColor="whiteAlpha.200"
                  fontWeight="600" 
                  letterSpacing="0.5px" 
                  textTransform="uppercase" 
                  fontSize="xs"
                >
                  Capacity
                </Th>
                <Th 
                  color="gold.400" 
                  borderColor="whiteAlpha.200"
                  fontWeight="600" 
                  letterSpacing="0.5px" 
                  textTransform="uppercase" 
                  fontSize="xs"
                  width="100px"
                >
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {floor.rooms.map((room, roomIndex) => (
                <Tr key={roomIndex} _hover={{ bg: "whiteAlpha.100" }}>
                  <Td borderColor="whiteAlpha.200">
                    <Flex align="center">
                      <Icon as={FaDoorOpen} color="gold.400" mr={2} />
                      <Text fontFamily="mono" fontWeight="medium">{room.roomNumber}</Text>
                    </Flex>
                  </Td>
                  <Td borderColor="whiteAlpha.200">
                    <Badge 
                      bg="blue.800"
                      color="whiteAlpha.900"
                      px={2}
                      py={1}
                      borderRadius="md"
                      display="inline-flex"
                      alignItems="center"
                    >
                      <Icon as={FaUsers} mr={1} />
                      {room.capacity} {room.capacity > 1 ? 'students' : 'student'}
                    </Badge>
                  </Td>
                  <Td borderColor="whiteAlpha.200">
                    <Tooltip label="Delete this room" placement="top">
                      <IconButton
                        aria-label="Delete room"
                        icon={<Icon as={FaTrash} />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => onDeleteRoom(roomIndex)}
                        borderRadius="full"
                        _hover={{ bg: "rgba(229, 62, 62, 0.2)" }}
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          bg="whiteAlpha.50" 
          p={6} 
          borderRadius="md"
          borderStyle="dashed"
          borderWidth="1px"
          borderColor="whiteAlpha.300"
        >
          <Icon as={FaDoorOpen} color="whiteAlpha.500" boxSize={8} mb={2} />
          <Text color="whiteAlpha.600" fontSize="sm" textAlign="center">
            No rooms added to this floor yet
          </Text>
          <Text color="whiteAlpha.500" fontSize="xs" textAlign="center" mt={1}>
            Add your first room using the form above
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default FloorRoomsInput;
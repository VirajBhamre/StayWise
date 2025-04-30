import React, { useState, useEffect } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td,
  Alert, AlertIcon, Spinner, Text, Icon,
  Flex, Badge, HStack, useToken
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaBuilding, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { getAllHostels } from '../services/api';

const MotionBox = motion(Box);

const AdminApprovedHostelsList = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gold400] = useToken('colors', ['gold.400']);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const data = await getAllHostels();
      setHostels(data);
      setError('');
    } catch (err) {
      setError('Failed to load approved hostels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

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
          <Flex align="center">
            <Icon as={FaExclamationTriangle} color="red.400" mr={2} />
            <Text>{error}</Text>
          </Flex>
        </Alert>
      )}

      {hostels.length === 0 ? (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          layerStyle="glassmorphism"
          p={6}
          mb={6}
          textAlign="center"
        >
          <Icon as={FaBuilding} color="gold.400" boxSize={10} mb={4} />
          <Text fontSize="lg" color="text.secondary">
            There are no approved hostels yet.
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
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Hostel ID</Th>
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Name</Th>
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Warden</Th>
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Email</Th>
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Phone</Th>
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Address</Th>
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Total Rooms</Th>
                  <Th color="gold.500" fontWeight="600" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">Occupancy</Th>
                </Tr>
              </Thead>
              <Tbody>
                {hostels.map(hostel => (
                  <Tr key={hostel._id} _hover={{ bg: "whiteAlpha.50" }}>
                    <Td>
                      <Badge 
                        px={2} 
                        py={1} 
                        bgGradient="linear(to-r, purple.500, blue.500)" 
                        color="white" 
                        borderRadius="md" 
                        fontFamily="mono"
                        fontSize="xs"
                        letterSpacing="tight"
                      >
                        {hostel.hostelId}
                      </Badge>
                    </Td>
                    <Td fontWeight="medium">{hostel.name}</Td>
                    <Td>{hostel.warden?.name}</Td>
                    <Td>{hostel.warden?.email}</Td>
                    <Td>{hostel.warden?.phone}</Td>
                    <Td maxW="250px" isTruncated title={hostel.address}>{hostel.address}</Td>
                    <Td isNumeric>{hostel.totalRooms}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Text fontWeight="medium">{hostel.occupiedRooms}/{hostel.totalRooms}</Text>
                        <Badge 
                          colorScheme={
                            hostel.occupiedRooms / hostel.totalRooms >= 0.9 ? "red" :
                            hostel.occupiedRooms / hostel.totalRooms >= 0.7 ? "orange" :
                            hostel.occupiedRooms / hostel.totalRooms >= 0.5 ? "yellow" : 
                            "green"
                          }
                          borderRadius="full"
                          px={2}
                          fontSize="xs"
                        >
                          {Math.round((hostel.occupiedRooms / hostel.totalRooms) * 100)}%
                        </Badge>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </MotionBox>
      )}
    </Box>
  );
};

export default AdminApprovedHostelsList;
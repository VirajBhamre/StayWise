import React from 'react';
import { 
  Box, Heading, Text, Container, Button, VStack, HStack, 
  useToken, Icon, Flex, Divider
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaUserGraduate, FaRegBuilding } from 'react-icons/fa';

const MotionBox = motion(Box);

const LandingPage = () => {
  const [gold400, gold600] = useToken('colors', ['gold.400', 'gold.600']);

  return (
    <Box
      minHeight="100vh"
      width="full"
      bgGradient="linear(to-br, background.primary, #111927, #000913)"
      backgroundSize="cover"
      backgroundAttachment="fixed"
      py={10}
    >
      <Container maxW="container.lg">
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          textAlign="center"
          mb={10}
        >
          <Heading 
            as="h1" 
            size="2xl" 
            mb={4}
            bgGradient={`linear(to-r, ${gold400}, ${gold600})`} 
            bgClip="text"
            fontFamily="heading"
            letterSpacing="tight"
            fontWeight="bold"
          >
            StayWise
          </Heading>
          <Text 
            fontSize="xl" 
            color="text.secondary"
            fontWeight="medium"
          >
            A complete solution for hostel administration and student accommodation management
          </Text>
        </MotionBox>
        
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          layerStyle="glassmorphism"
          p={8}
          borderRadius="xl"
          mt={8}
          maxWidth="900px"
          mx="auto"
        >
          <VStack spacing={10} align="stretch">
            <Box>
              <Heading 
                as="h2" 
                size="lg" 
                mb={6}
                color="gold.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FaUser} mr={2} /> Login Portal
              </Heading>
              <Divider mb={6} borderColor="whiteAlpha.200" />
              <HStack spacing={6} justifyContent="center">
                <Button 
                  as={RouterLink} 
                  to="/warden/login" 
                  size="lg"
                  leftIcon={<Icon as={FaRegBuilding} />}
                  bg="gold.500"
                  color="black"
                  px={8}
                  _hover={{
                    bg: "gold.600",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(255, 202, 40, 0.3)"
                  }}
                  transition="all 0.3s ease"
                >
                  Warden
                </Button>
                <Button 
                  as={RouterLink} 
                  to="/hosteller/login" 
                  size="lg"
                  leftIcon={<Icon as={FaUserGraduate} />}
                  variant="outline"
                  borderColor="gold.500"
                  color="gold.500"
                  px={8}
                  _hover={{
                    bg: "rgba(255, 202, 40, 0.1)",
                    borderColor: "gold.400"
                  }}
                  transition="all 0.3s ease"
                >
                  Hosteller
                </Button>
              </HStack>
            </Box>
            
            <Box>
              <Heading 
                as="h2" 
                size="lg" 
                mb={6}
                color="gold.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FaRegBuilding} mr={2} /> New Hostel Registration
              </Heading>
              <Divider mb={6} borderColor="whiteAlpha.200" />
              <Flex direction="column" align="center">
                <Button 
                  as={RouterLink} 
                  to="/access-request" 
                  size="lg"
                  variant="outline"
                  borderColor="gold.500"
                  color="gold.500"
                  px={8}
                  height="60px"
                  _hover={{
                    bg: "rgba(255, 202, 40, 0.1)",
                    borderColor: "gold.400",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(255, 202, 40, 0.2)"
                  }}
                  transition="all 0.3s ease"
                  mb={4}
                >
                  Request Access for Your Hostel
                </Button>
                <Text color="text.secondary" fontSize="sm" textAlign="center" maxW="md">
                  Hostel wardens can request access to the system. All requests are verified by admin.
                </Text>
                <Text color="text.secondary" fontSize="sm" textAlign="center">
                  Hostellers are registered by their warden after approval.
                </Text>
              </Flex>
            </Box>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default LandingPage;
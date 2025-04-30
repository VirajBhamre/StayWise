import React from 'react';
import { Box, Heading, Text, Container, VStack, useToken, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const MotionBox = motion(Box);

const HomePage = () => {
  const [gold400, gold600] = useToken('colors', ['gold.400', 'gold.600']);

  return (
    <Box
      minHeight="100vh"
      width="full"
      bgGradient="linear(to-br, background.primary, #111927, #000913)"
      backgroundSize="cover"
      backgroundAttachment="fixed"
    >
      <Container maxW="container.lg" py={20}>
        <VStack spacing={10} align="center">
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
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
              mb={6}
            >
              Modern Hostel Management System
            </Text>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              mt={8}
            >
              <Button
                as={RouterLink}
                to="/access-request"
                size="lg"
                colorScheme="gold"
                bg="gold.500"
                color="black"
                px={8}
                _hover={{
                  bg: "gold.600",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(255, 202, 40, 0.3)"
                }}
                mr={4}
              >
                Register Hostel
              </Button>
              <Button
                as={RouterLink}
                to="/warden/login"
                size="lg"
                variant="outline"
                borderColor="gold.500"
                color="gold.500"
                px={8}
                _hover={{
                  bg: "rgba(255, 202, 40, 0.1)",
                  borderColor: "gold.400"
                }}
              >
                Login
              </Button>
            </MotionBox>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default HomePage;
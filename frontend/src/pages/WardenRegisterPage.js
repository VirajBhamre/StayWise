import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Flex, Text, Link, Box, Heading, Container,
  useToken, Icon, HStack
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaRegBuilding, FaSignInAlt } from 'react-icons/fa';
import WardenRegisterForm from '../components/WardenRegisterForm';

const MotionBox = motion(Box);

const RegisterPage = () => {
  const [gold400, gold600] = useToken('colors', ['gold.400', 'gold.600']);

  return (
    <Box
      minHeight="100vh"
      width="full"
      bgGradient="linear(to-br, background.primary, #111927, #000913)"
      backgroundSize="cover"
      backgroundAttachment="fixed"
    >
      <Container maxW="container.md" py={10}>
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          textAlign="center"
          mb={6}
        >
          <HStack spacing={2} justify="center" mb={3}>
            <Icon as={FaRegBuilding} color="gold.500" boxSize={6} />
            <Heading 
              as="h1" 
              size="xl" 
              bgGradient={`linear(to-r, ${gold400}, ${gold600})`} 
              bgClip="text"
              letterSpacing="tight"
            >
              Warden Registration
            </Heading>
          </HStack>
          <Text color="text.secondary">Create your warden account</Text>
        </MotionBox>
        
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          layerStyle="glassmorphism"
          p={8}
          borderRadius="xl"
        >
          <WardenRegisterForm />
        </MotionBox>
        
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          mt={6}
          textAlign="center"
        >
          <Text color="text.secondary">
            Already have an account? {" "}
            <Link 
              as={RouterLink} 
              to="/warden/login" 
              color="gold.500"
              fontWeight="medium"
              display="inline-flex"
              alignItems="center"
              _hover={{ color: "gold.300", textDecoration: "none" }}
            >
              <Icon as={FaSignInAlt} mr={1} />
              Login here
            </Link>
          </Text>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default RegisterPage;
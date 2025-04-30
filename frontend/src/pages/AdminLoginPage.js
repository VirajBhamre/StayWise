import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Flex, Text, Link, Box, Heading, Container,
  useToken, Icon, HStack 
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaUserShield, FaUserPlus } from 'react-icons/fa';
import AdminLoginForm from '../components/AdminLoginForm';

const MotionBox = motion(Box);

const AdminLoginPage = () => {
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
            <Icon as={FaUserShield} color="gold.500" boxSize={6} />
            <Heading 
              as="h1" 
              size="xl" 
              bgGradient={`linear(to-r, ${gold400}, ${gold600})`} 
              bgClip="text"
              letterSpacing="tight"
            >
              Admin Login
            </Heading>
          </HStack>
          <Text color="text.secondary">System administration access</Text>
        </MotionBox>
        
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          layerStyle="glassmorphism"
          p={8}
          borderRadius="xl"
        >
          <AdminLoginForm />
        </MotionBox>
        
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          mt={6}
          textAlign="center"
        >
          <Text color="text.secondary">
            Don't have an account? {" "}
            <Link 
              as={RouterLink} 
              to="/admin/register" 
              color="gold.500"
              fontWeight="medium"
              display="inline-flex"
              alignItems="center"
              _hover={{ color: "gold.300", textDecoration: "none" }}
            >
              <Icon as={FaUserPlus} mr={1} />
              Register here
            </Link>
          </Text>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default AdminLoginPage;
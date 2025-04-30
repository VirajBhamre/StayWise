import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Flex, Text, Link, Box, useToken, 
  Icon, HStack, VStack
} from '@chakra-ui/react';
import { FaRegBuilding } from 'react-icons/fa';
import { motion } from 'framer-motion';
import WardenLoginForm from '../components/WardenLoginForm';

const MotionBox = motion(Box);

const WardenLoginPage = () => {
  const [gold400, gold500] = useToken('colors', ['gold.400', 'gold.500']);

  return (
    <Flex 
      minHeight="100vh"
      width="full"
      align="center"
      justifyContent="center"
      direction="column"
      p={4}
      position="relative"
      overflow="hidden"
      bgGradient="linear(to-br, background.primary, #111927, #000913)"
      backgroundSize="cover"
      backgroundAttachment="fixed"
    >
      {/* Decorative elements */}
      <Box 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        height="100vh" 
        overflow="hidden" 
        pointerEvents="none"
        opacity={0.07}
        zIndex={0}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <MotionBox
            key={i}
            position="absolute"
            top={`${Math.random() * 100}%`}
            left={`${Math.random() * 100}%`}
            width={`${Math.random() * 30 + 20}px`}
            height={`${Math.random() * 30 + 20}px`}
            borderRadius="md"
            border={`1px solid ${gold400}`}
            initial={{ opacity: 0.3, rotate: 0 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              rotate: 360,
              y: [0, 10, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        ))}
      </Box>

      <VStack
        spacing={8}
        zIndex={1}
      >
        <WardenLoginForm />
        
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <HStack spacing={2} justifyContent="center" align="center">
            <Icon as={FaRegBuilding} color={gold500} />
            <Text 
              textAlign="center" 
              color="text.secondary" 
              fontSize="sm" 
              fontWeight="medium"
            >
              New to StayWise?{" "}
              <Link 
                as={RouterLink} 
                to="/access-request" 
                color="gold.500" 
                fontWeight="bold"
                _hover={{ 
                  color: "gold.300", 
                  textDecoration: "underline" 
                }}
                transition="all 0.2s ease"
              >
                Register your hostel
              </Link>
            </Text>
          </HStack>
        </MotionBox>
      </VStack>
    </Flex>
  );
};

export default WardenLoginPage;
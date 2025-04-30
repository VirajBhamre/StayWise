import React, { useState } from 'react';
import {
  Box, Heading, Text, VStack, HStack,
  FormControl, FormLabel, Input, Button,
  useToast, Divider
} from '@chakra-ui/react';
import { updateHostellerProfile } from '../../services/api';

const ProfileTab = ({ profile }) => {
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateHostellerProfile({ phone });
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>My Profile</Heading>
      
      <VStack spacing={4} align="start">
        <Box width="full">
          <Text fontWeight="bold">Name</Text>
          <Text>{profile?.name || 'Not available'}</Text>
        </Box>
        
        <Box width="full">
          <Text fontWeight="bold">Email</Text>
          <Text>{profile?.email || 'Not available'}</Text>
        </Box>
        
        <Box width="full">
          <Text fontWeight="bold">Room</Text>
          <Text>{profile?.room || 'Not available'}</Text>
        </Box>
        
        <Box width="full">
          <Text fontWeight="bold">Join Date</Text>
          <Text>
            {profile?.joinDate 
              ? new Date(profile.joinDate).toLocaleDateString() 
              : 'Not available'}
          </Text>
        </Box>

        <Divider my={2} />

        <Box width="full">
          {isEditing ? (
            <FormControl>
              <FormLabel>Phone Number</FormLabel>
              <HStack>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button
                  colorScheme="blue"
                  onClick={handleUpdate}
                  isLoading={loading}
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setPhone(profile?.phone || '');
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </HStack>
            </FormControl>
          ) : (
            <HStack justify="space-between" width="full">
              <Box>
                <Text fontWeight="bold">Phone</Text>
                <Text>{profile?.phone || 'Not available'}</Text>
              </Box>
              <Button size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </HStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default ProfileTab;
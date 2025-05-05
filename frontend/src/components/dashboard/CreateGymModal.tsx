import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";

interface CreateGymModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGymCreated: (newGym: any) => void;
}

const CreateGymModal = ({
  isOpen,
  onClose,
  onGymCreated,
}: CreateGymModalProps) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate
      if (!formData.name || !formData.address) {
        toast({
          title: "Required fields missing",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Simulate API call
      setTimeout(() => {
        onGymCreated({ id: Date.now().toString(), ...formData });
        onClose();
        setFormData({
          name: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error creating gym",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Gym</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Gym Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Address</FormLabel>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>City</FormLabel>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>State</FormLabel>
              <Input
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Zip Code</FormLabel>
              <Input
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
              />
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            isLoading={loading}
          >
            Create Gym
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateGymModal;

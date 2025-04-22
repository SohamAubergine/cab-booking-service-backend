import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Text,
  HStack,
  Icon,
  VStack,
  Divider,
  useToast,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaMapMarkerAlt, FaMapMarked } from "react-icons/fa";
import MapboxMap, { MapLocation } from "./MapboxMap";
import { userService } from "../../services/api";
import * as toastUtils from "../../utils/toast";

interface RegisterGymModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface GymFormData {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

const RegisterGymModal = ({
  isOpen,
  onClose,
  onSuccess,
}: RegisterGymModalProps) => {
  const [formData, setFormData] = useState<GymFormData>({
    name: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null
  );

  const toast = useToast();

  // Theme colors
  const modalBg = useColorModeValue(
    "rgba(255, 255, 255, 0.9)",
    "rgba(26, 32, 44, 0.8)"
  );
  const cardBorder = useColorModeValue(
    "rgba(255, 255, 255, 0.18)",
    "rgba(255, 255, 255, 0.05)"
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const errors = { ...prev };
        delete errors[name];
        return errors;
      });
    }
  };

  // Handle location selection from map
  const handleLocationChange = (location: MapLocation) => {
    setSelectedLocation(location);
    setFormData((prev) => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      address: location.address || prev.address,
    }));

    // Clear any address errors as we now have coordinates
    if (formErrors.address) {
      setFormErrors((prev) => {
        const errors = { ...prev };
        delete errors.address;
        return errors;
      });
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Gym name is required";
    }

    if (!formData.address.trim() && !selectedLocation) {
      errors.address = "Address or map location is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form reset
  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
    });
    setSelectedLocation(null);
    setFormErrors({});
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // We're using the userService to create a gym
      // The API will automatically assign the current user as owner
      const response = await userService.createGym(formData);

      if (response.success) {
        toast(
          toastUtils.successToast(
            "Success",
            "Your gym has been registered successfully"
          )
        );
        resetForm();
        onClose();
        // Call the success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.message || "Failed to register gym");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to register gym";
      toast(toastUtils.errorToast("Error", errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent
        borderRadius="xl"
        boxShadow="xl"
        bg={modalBg}
        backdropFilter="blur(20px)"
        borderWidth="1px"
        borderColor={cardBorder}
      >
        <ModalHeader>Register Your Gym</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!formErrors.name}>
              <FormLabel fontWeight="medium">Gym Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your gym name"
                focusBorderColor="purple.400"
              />
              {formErrors.name && (
                <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!formErrors.address}>
              <FormLabel fontWeight="medium">Address</FormLabel>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter gym address or select on map"
                focusBorderColor="purple.400"
              />
              {formErrors.address && (
                <FormErrorMessage>{formErrors.address}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl>
              <FormLabel display="flex" alignItems="center">
                <Icon as={FaMapMarked} mr={2} />
                Location
              </FormLabel>
              <Text fontSize="sm" color="gray.500" mb={2}>
                Click on the map or search to select your gym location
              </Text>
              <Box borderRadius="md" overflow="hidden">
                <MapboxMap
                  initialLocation={selectedLocation || undefined}
                  onLocationChange={handleLocationChange}
                  height="300px"
                />
              </Box>
              {selectedLocation && (
                <HStack mt={2} fontSize="sm" color="gray.600">
                  <Icon as={FaMapMarkerAlt} color="purple.500" />
                  <Text>
                    Lat: {selectedLocation.lat.toFixed(6)}, Lng:{" "}
                    {selectedLocation.lng.toFixed(6)}
                  </Text>
                </HStack>
              )}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="purple"
            mr={3}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Registering..."
          >
            Register Gym
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RegisterGymModal;

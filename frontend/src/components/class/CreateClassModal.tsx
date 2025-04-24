import { useState, useEffect } from "react";
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
  Select,
  HStack,
  VStack,
  useToast,
  useColorModeValue,
  Text,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, User, CreateFitnessClassRequest } from "../../types";
import { userService, adminService, categoryService } from "../../services/api";

// Form validation schema
const fitnessClassSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    categoryId: z.string().min(1, "Category is required"),
    instructorId: z.string().min(1, "Instructor is required"),
    startsAt: z.string().min(1, "Start time is required"),
    endsAt: z.string().min(1, "End time is required"),
    capacity: z
      .string()
      .refine(
        (val) => !val || (parseInt(val) > 0 && !isNaN(parseInt(val))),
        "Capacity must be a positive number"
      )
      .optional(),
  })
  .refine(
    (data) => {
      try {
        const startDate = new Date(data.startsAt);
        const endDate = new Date(data.endsAt);
        return startDate < endDate;
      } catch (error) {
        return false;
      }
    },
    {
      message: "End time must be after start time",
      path: ["endsAt"],
    }
  );

type FitnessClassFormData = z.infer<typeof fitnessClassSchema>;

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  onSuccess?: () => void;
}

const CreateClassModal = ({
  isOpen,
  onClose,
  gymId,
  onSuccess,
}: CreateClassModalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isInstructorsLoading, setIsInstructorsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const accentColor = "teal";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FitnessClassFormData>({
    resolver: zodResolver(fitnessClassSchema),
    defaultValues: {
      capacity: "20", // Default capacity
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchInstructors();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const response = await categoryService.getCategories();
      if (response.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch categories";
      console.error(errorMessage);
      toast({
        title: "Error",
        description: "Failed to load categories",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      setIsInstructorsLoading(true);
      const response = await userService.getInstructors();
      if (response.success) {
        setInstructors(response.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch instructors";
      console.error(errorMessage);
      toast({
        title: "Error",
        description: "Failed to load instructors",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsInstructorsLoading(false);
    }
  };

  const onSubmit = async (data: FitnessClassFormData) => {
    try {
      setIsSubmitting(true);

      // Parse dates
      const startsAtDate = new Date(data.startsAt);
      const endsAtDate = new Date(data.endsAt);

      // Ensure dates are valid
      if (isNaN(startsAtDate.getTime()) || isNaN(endsAtDate.getTime())) {
        toast({
          title: "Error",
          description: "Invalid date format",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Format request data
      const formattedData: CreateFitnessClassRequest = {
        name: data.name,
        categoryId: data.categoryId,
        instructorId: data.instructorId,
        gymId: gymId, // Use the gymId passed as prop
        startsAt: startsAtDate.toISOString(),
        endsAt: endsAtDate.toISOString(),
        capacity: data.capacity ? parseInt(data.capacity, 10) : 20,
      };

      // Call API to create class
      const response = await adminService.createClass(formattedData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Fitness class created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        reset(); // Reset form
        onClose(); // Close modal

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.message || "Failed to create fitness class");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create fitness class";

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset(); // Reset form when closing
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent
        borderRadius="xl"
        boxShadow="xl"
        bg={modalBg}
        backdropFilter="blur(20px)"
        borderWidth="1px"
        borderColor={cardBorder}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader borderBottomWidth="1px" borderColor={cardBorder}>
            Create New Fitness Class
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!errors.name}>
                <FormLabel fontWeight="medium">Class Name</FormLabel>
                <Input
                  {...register("name")}
                  placeholder="Enter class name"
                  focusBorderColor={`${accentColor}.400`}
                />
                {errors.name && (
                  <FormErrorMessage>{errors.name.message}</FormErrorMessage>
                )}
              </FormControl>

              <HStack spacing={4} alignItems="flex-start">
                <FormControl isInvalid={!!errors.categoryId}>
                  <FormLabel fontWeight="medium">Category</FormLabel>
                  <Select
                    {...register("categoryId")}
                    placeholder="Select category"
                    focusBorderColor={`${accentColor}.400`}
                    isDisabled={isCategoriesLoading}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                  {errors.categoryId && (
                    <FormErrorMessage>
                      {errors.categoryId.message}
                    </FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.instructorId}>
                  <FormLabel fontWeight="medium">Instructor</FormLabel>
                  <Select
                    {...register("instructorId")}
                    placeholder="Select instructor"
                    focusBorderColor={`${accentColor}.400`}
                    isDisabled={isInstructorsLoading}
                  >
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </option>
                    ))}
                  </Select>
                  {errors.instructorId && (
                    <FormErrorMessage>
                      {errors.instructorId.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              </HStack>

              <HStack spacing={4} alignItems="flex-start">
                <FormControl isInvalid={!!errors.startsAt}>
                  <FormLabel fontWeight="medium">Start Time</FormLabel>
                  <Input
                    {...register("startsAt")}
                    type="datetime-local"
                    focusBorderColor={`${accentColor}.400`}
                  />
                  {errors.startsAt && (
                    <FormErrorMessage>
                      {errors.startsAt.message}
                    </FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.endsAt}>
                  <FormLabel fontWeight="medium">End Time</FormLabel>
                  <Input
                    {...register("endsAt")}
                    type="datetime-local"
                    focusBorderColor={`${accentColor}.400`}
                  />
                  {errors.endsAt && (
                    <FormErrorMessage>{errors.endsAt.message}</FormErrorMessage>
                  )}
                </FormControl>
              </HStack>

              <FormControl isInvalid={!!errors.capacity}>
                <FormLabel fontWeight="medium">Capacity</FormLabel>
                <InputGroup>
                  <Input
                    {...register("capacity")}
                    type="number"
                    placeholder="20"
                    focusBorderColor={`${accentColor}.400`}
                  />
                  <InputRightElement pointerEvents="none">
                    <Text fontSize="sm" color="gray.500" mr={2}>
                      people
                    </Text>
                  </InputRightElement>
                </InputGroup>
                {errors.capacity && (
                  <FormErrorMessage>{errors.capacity.message}</FormErrorMessage>
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter borderTopWidth="1px" borderColor={cardBorder}>
            <Button
              colorScheme={accentColor}
              type="submit"
              mr={3}
              isLoading={isSubmitting}
              loadingText="Creating..."
            >
              Create Class
            </Button>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateClassModal;

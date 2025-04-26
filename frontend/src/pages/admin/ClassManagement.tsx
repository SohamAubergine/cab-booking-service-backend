import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  Badge,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Tag,
  TagLabel,
  Tooltip,
  InputGroup,
  InputLeftElement,
  TableContainer,
  Skeleton,
  useColorModeValue,
  VStack,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  FormHelperText,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  TimeIcon,
  CalendarIcon,
} from "@chakra-ui/icons";
import {
  FaChalkboardTeacher,
  FaLayerGroup,
  FaRegCalendarAlt,
  FaUsers,
} from "react-icons/fa";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminService, categoryService, userService } from "../../services/api";
import {
  Category,
  CreateFitnessClassRequest,
  FitnessClass,
  FitnessClassFilters,
  UpdateFitnessClassRequest,
  User,
  UserRole,
  Gym,
} from "../../types";
import Loading from "../../components/Loading";
import { motion } from "framer-motion";

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionCard = motion(Card);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Form validation schema
const fitnessClassSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    categoryId: z.string().min(1, "Category is required"),
    instructorId: z.string().min(1, "Instructor is required"),
    gymId: z.string().min(1, "Gym is required"),
    startsAt: z.string().min(1, "Start time is required"),
    endsAt: z.string().min(1, "End time is required"),
    capacity: z.string().optional(),
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
  )
  .refine(
    (data) => {
      try {
        // Check if dates are valid by attempting to parse them
        const startDate = new Date(data.startsAt);
        const endDate = new Date(data.endsAt);
        return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());
      } catch (error) {
        return false;
      }
    },
    {
      message: "Invalid date format",
      path: ["startsAt"],
    }
  )
  .refine(
    (data) => {
      if (data.capacity && data.capacity.trim() !== "") {
        const capacityNum = parseInt(data.capacity, 10);
        return !isNaN(capacityNum) && capacityNum > 0;
      }
      return true;
    },
    {
      message: "Capacity must be a positive number",
      path: ["capacity"],
    }
  );

type FitnessClassFormData = z.infer<typeof fitnessClassSchema>;

interface FormattedFitnessClassData {
  name: string;
  categoryId: string;
  instructorId: string;
  gymId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
}

const ClassManagement = () => {
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isInstructorsLoading, setIsInstructorsLoading] = useState(true);
  const [isGymsLoading, setIsGymsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FitnessClassFilters>({
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentClass, setCurrentClass] = useState<FitnessClass | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const tableBg = useColorModeValue("white", "gray.800");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const tableRowHoverBg = useColorModeValue("purple.50", "purple.900");
  const accentColor = "purple";

  const {
    isOpen: isFormOpen,
    onOpen: openForm,
    onClose: closeForm,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: openDelete,
    onClose: closeDelete,
  } = useDisclosure();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FitnessClassFormData>({
    resolver: zodResolver(fitnessClassSchema),
  });

  const fetchCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const response = await categoryService.getCategories(1, 100);
      console.log("Categories response:", response);

      if (response.success) {
        console.log("Categories data structure:", response.data);
        // Handle the paginated response structure
        if (response.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else {
          console.error("Unexpected categories data structure:", response.data);
          setCategories([]);
        }
      } else {
        console.error(
          "Failed to fetch categories - unsuccessful response:",
          response
        );
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch categories - exception:", err);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      setIsInstructorsLoading(true);
      const response = await adminService.getAllInstructors(1, 100);
      console.log("Instructors response:", response);

      if (response.success) {
        const instructorData = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data || [];

        console.log("Instructor data processed:", instructorData);
        setInstructors(instructorData);
      } else {
        console.error(
          "Failed to fetch instructors - unsuccessful response:",
          response
        );
        toast({
          title: "Error",
          description: "Failed to fetch instructors",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch instructors - exception:", err);
      toast({
        title: "Error",
        description: "Failed to fetch instructors",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsInstructorsLoading(false);
    }
  };

  const fetchGyms = async () => {
    try {
      setIsGymsLoading(true);
      const response = await adminService.getAllGyms(1, 100);
      console.log("Gyms response:", response);

      if (response.success) {
        const gymData = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data || [];

        console.log("Gym data processed:", gymData);
        setGyms(gymData);
      } else {
        console.error(
          "Failed to fetch gyms - unsuccessful response:",
          response
        );
        toast({
          title: "Error",
          description: "Failed to fetch gyms",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch gyms - exception:", err);
      toast({
        title: "Error",
        description: "Failed to fetch gyms",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGymsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.getAllClasses(filters);

      if (response.success) {
        setClasses(response.data.data);
        setTotalPages(response.data.meta.totalPages);
      } else {
        setError(response.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch classes";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Categories loaded:", categories);
    console.log("Instructors loaded:", instructors);
    console.log("Gyms loaded:", gyms);
  }, [categories, instructors, gyms]);

  useEffect(() => {
    fetchCategories();
    fetchInstructors();
    fetchGyms();
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [filters]);

  const handleAddClass = () => {
    setCurrentClass(null);
    reset({
      name: "",
      categoryId: "",
      instructorId: "",
      gymId: "",
      startsAt: "",
      endsAt: "",
      capacity: "20", // Default capacity as string
    });
    openForm();
  };

  const handleEditClass = (fitnessClass: FitnessClass) => {
    setCurrentClass(fitnessClass);
    setValue("name", fitnessClass.name);
    setValue("categoryId", fitnessClass.categoryId);
    setValue("instructorId", fitnessClass.instructorId);
    setValue("gymId", fitnessClass.gymId);
    setValue(
      "startsAt",
      new Date(fitnessClass.startsAt).toISOString().slice(0, 16)
    );
    setValue(
      "endsAt",
      new Date(fitnessClass.endsAt).toISOString().slice(0, 16)
    );
    setValue("capacity", fitnessClass.capacity.toString());
    openForm();
  };

  const handleDeleteClass = (fitnessClass: FitnessClass) => {
    setCurrentClass(fitnessClass);
    openDelete();
  };

  const confirmDelete = async () => {
    if (!currentClass) return;

    try {
      setIsSubmitting(true);
      const response = await adminService.deleteClass(currentClass.id);

      if (response.success) {
        toast({
          title: "Class deleted",
          description: "The fitness class has been deleted successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchClasses();
        closeDelete();
      } else {
        toast({
          title: "Error",
          description: response.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete class";
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

  const onSubmit = async (data: FitnessClassFormData) => {
    try {
      setIsSubmitting(true);

      // Ensure proper date parsing and formatting
      const startsAtDate = new Date(data.startsAt);
      const endsAtDate = new Date(data.endsAt);

      // Validate that the end time is after start time
      if (endsAtDate <= startsAtDate) {
        toast({
          title: "Error",
          description: "End time must be after start time",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsSubmitting(false);
        return;
      }

      // Convert form data to the expected API request format
      const formattedData: CreateFitnessClassRequest = {
        name: data.name,
        categoryId: data.categoryId,
        instructorId: data.instructorId,
        gymId: data.gymId,
        startsAt: startsAtDate.toISOString(),
        endsAt: endsAtDate.toISOString(),
        capacity: data.capacity ? parseInt(data.capacity, 10) : 20,
      };

      console.log("Submitting class data:", formattedData);

      if (currentClass) {
        // Update existing class
        const response = await adminService.updateClass(
          currentClass.id,
          formattedData as UpdateFitnessClassRequest
        );

        if (response.success) {
          toast({
            title: "Success",
            description: "Fitness class updated successfully",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          fetchClasses();
          closeForm();
        }
      } else {
        // Create new class
        const response = await adminService.createClass(formattedData);

        if (response.success) {
          toast({
            title: "Success",
            description: "Fitness class created successfully",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          fetchClasses();
          closeForm();
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error submitting form:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };

  const getCategoryColor = (categoryName: string = "") => {
    // Map categories to colors for visual distinction
    const categoryColors: Record<string, string> = {
      Yoga: "green",
      Cardio: "red",
      "Strength Training": "orange",
      Pilates: "blue",
      HIIT: "pink",
      Zumba: "purple",
    };

    return categoryColors[categoryName] || "gray";
  };

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      p={4}
    >
      {/* Header Section */}
      <MotionFlex
        variants={itemVariants}
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        mb={8}
      >
        <Box mb={{ base: 4, md: 0 }}>
          <Heading as="h1" size="xl" mb={2} color={headingColor}>
            Manage Fitness Classes
          </Heading>
          <Text color={textColor}>
            Create, edit, and manage your fitness class offerings
          </Text>
        </Box>
        <Button
          leftIcon={<AddIcon />}
          colorScheme={accentColor}
          size="md"
          onClick={handleAddClass}
          boxShadow="md"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "lg",
          }}
          transition="all 0.2s"
        >
          Add New Class
        </Button>
      </MotionFlex>

      {/* Main Content */}
      <MotionCard
        variants={itemVariants}
        bg={cardBg}
        borderWidth="1px"
        borderColor={cardBorder}
        borderRadius="lg"
        boxShadow="sm"
        overflow="hidden"
        mb={8}
      >
        {isLoading ? (
          <CardBody py={10}>
            <VStack spacing={6}>
              <Loading text="Loading fitness classes..." showText={true} />
            </VStack>
          </CardBody>
        ) : error ? (
          <CardBody>
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              borderRadius="md"
              py={5}
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Error Loading Classes
              </AlertTitle>
              <AlertDescription maxWidth="sm">{error}</AlertDescription>
              <Button mt={4} colorScheme={accentColor} onClick={fetchClasses}>
                Try Again
              </Button>
            </Alert>
          </CardBody>
        ) : classes.length === 0 ? (
          <CardBody py={10}>
            <VStack spacing={6}>
              <Icon
                as={FaRegCalendarAlt}
                boxSize="50px"
                color={`${accentColor}.400`}
              />
              <Text fontSize="lg" fontWeight="medium">
                No classes found
              </Text>
              <Text color={textColor}>
                Get started by creating your first fitness class
              </Text>
              <Button
                colorScheme={accentColor}
                mt={4}
                onClick={handleAddClass}
                leftIcon={<AddIcon />}
              >
                Create First Class
              </Button>
            </VStack>
          </CardBody>
        ) : (
          <TableContainer>
            <Table variant="simple">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th>Name</Th>
                  <Th>Category</Th>
                  <Th>Instructor</Th>
                  <Th>Schedule</Th>
                  <Th>Capacity</Th>
                  <Th width="100px">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {classes.map((fitnessClass) => (
                  <Tr
                    key={fitnessClass.id}
                    _hover={{ bg: tableRowHoverBg }}
                    transition="background-color 0.2s"
                  >
                    <Td fontWeight="medium">{fitnessClass.name}</Td>
                    <Td>
                      <Tag
                        size="md"
                        colorScheme={getCategoryColor(
                          fitnessClass.category?.name
                        )}
                        borderRadius="full"
                      >
                        <TagLabel>{fitnessClass.category?.name}</TagLabel>
                      </Tag>
                    </Td>
                    <Td>
                      <HStack>
                        <Icon
                          as={FaChalkboardTeacher}
                          color={`${accentColor}.500`}
                        />
                        <Text>{fitnessClass.instructor?.name}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="flex-start" spacing={1}>
                        <HStack fontSize="sm">
                          <Icon
                            as={CalendarIcon}
                            color={`${accentColor}.500`}
                          />
                          <Text>{formatDateTime(fitnessClass.startsAt)}</Text>
                        </HStack>
                        <HStack fontSize="sm" color="gray.500">
                          <Icon as={TimeIcon} />
                          <Text>to {formatDateTime(fitnessClass.endsAt)}</Text>
                        </HStack>
                      </VStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Icon as={FaUsers} color={`${accentColor}.500`} />
                        <Text>{fitnessClass.capacity} spots</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="Edit class" placement="top">
                          <IconButton
                            icon={<EditIcon />}
                            aria-label="Edit class"
                            colorScheme={accentColor}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClass(fitnessClass)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete class" placement="top">
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label="Delete class"
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClass(fitnessClass)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </MotionCard>

      {/* Pagination */}
      {!isLoading && !error && classes.length > 0 && (
        <MotionFlex variants={itemVariants} justify="center" mt={4}>
          <HStack spacing={2}>
            <Button
              leftIcon={<ChevronLeftIcon />}
              onClick={() => handleChangePage(filters.page! - 1)}
              isDisabled={filters.page === 1}
              variant="outline"
              colorScheme={accentColor}
              size="sm"
            >
              Previous
            </Button>
            <Text fontWeight="medium" mx={2}>
              Page {filters.page} of {totalPages}
            </Text>
            <Button
              rightIcon={<ChevronRightIcon />}
              onClick={() => handleChangePage(filters.page! + 1)}
              isDisabled={filters.page === totalPages}
              variant="outline"
              colorScheme={accentColor}
              size="sm"
            >
              Next
            </Button>
          </HStack>
        </MotionFlex>
      )}

      {/* Add/Edit Class Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        size="xl"
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="lg" boxShadow="xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader borderBottomWidth="1px" borderColor={cardBorder}>
              {currentClass ? "Edit Fitness Class" : "Add New Fitness Class"}
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

                <HStack align="flex-start" spacing={6}>
                  <FormControl isInvalid={!!errors.categoryId}>
                    <FormLabel fontWeight="medium">Category</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaLayerGroup} color="gray.400" />
                      </InputLeftElement>
                      <Select
                        placeholder="Select category"
                        {...register("categoryId")}
                        isDisabled={isCategoriesLoading}
                        pl={10}
                        focusBorderColor={`${accentColor}.400`}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    </InputGroup>
                    {errors.categoryId && (
                      <FormErrorMessage>
                        {errors.categoryId.message}
                      </FormErrorMessage>
                    )}
                    {isCategoriesLoading && (
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Loading categories...
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.instructorId}>
                    <FormLabel fontWeight="medium">Instructor</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaChalkboardTeacher} color="gray.400" />
                      </InputLeftElement>
                      <Select
                        placeholder="Select instructor"
                        {...register("instructorId")}
                        isDisabled={isInstructorsLoading}
                        pl={10}
                        focusBorderColor={`${accentColor}.400`}
                      >
                        {instructors.map((instructor) => (
                          <option key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </option>
                        ))}
                      </Select>
                    </InputGroup>
                    {errors.instructorId && (
                      <FormErrorMessage>
                        {errors.instructorId.message}
                      </FormErrorMessage>
                    )}
                    {isInstructorsLoading && (
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Loading instructors...
                      </Text>
                    )}
                  </FormControl>
                </HStack>

                <FormControl isInvalid={!!errors.gymId}>
                  <FormLabel fontWeight="medium">Gym</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaLayerGroup} color="gray.400" />
                    </InputLeftElement>
                    <Select
                      placeholder="Select gym"
                      {...register("gymId")}
                      isDisabled={isGymsLoading}
                      pl={10}
                      focusBorderColor={`${accentColor}.400`}
                    >
                      {gyms.map((gym) => (
                        <option key={gym.id} value={gym.id}>
                          {gym.name}
                        </option>
                      ))}
                    </Select>
                  </InputGroup>
                  {errors.gymId && (
                    <FormErrorMessage>{errors.gymId.message}</FormErrorMessage>
                  )}
                  {isGymsLoading && (
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Loading gyms...
                    </Text>
                  )}
                </FormControl>

                <Divider />

                <Text fontWeight="medium" color={headingColor}>
                  Schedule Information
                </Text>

                <HStack align="flex-start" spacing={6}>
                  <FormControl isInvalid={!!errors.startsAt}>
                    <FormLabel fontWeight="medium">Start Time</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <CalendarIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="datetime-local"
                        {...register("startsAt")}
                        pl={10}
                        focusBorderColor={`${accentColor}.400`}
                      />
                    </InputGroup>
                    {errors.startsAt && (
                      <FormErrorMessage>
                        {errors.startsAt.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.endsAt}>
                    <FormLabel fontWeight="medium">End Time</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <CalendarIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="datetime-local"
                        {...register("endsAt")}
                        pl={10}
                        focusBorderColor={`${accentColor}.400`}
                      />
                    </InputGroup>
                    {errors.endsAt && (
                      <FormErrorMessage>
                        {errors.endsAt.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                </HStack>

                <Divider />

                <Text fontWeight="medium" color={headingColor}>
                  Class Information
                </Text>

                <FormControl isInvalid={!!errors.capacity}>
                  <FormLabel fontWeight="medium">Capacity</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaUsers} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="number"
                      {...register("capacity")}
                      placeholder="Enter maximum participants (default: 20)"
                      pl={10}
                      focusBorderColor={`${accentColor}.400`}
                    />
                  </InputGroup>
                  {errors.capacity && (
                    <FormErrorMessage>
                      {errors.capacity.message}
                    </FormErrorMessage>
                  )}
                  <FormHelperText>
                    Maximum number of participants that can book this class
                  </FormHelperText>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter borderTopWidth="1px" borderColor={cardBorder}>
              <Button variant="outline" mr={3} onClick={closeForm}>
                Cancel
              </Button>
              <Button
                colorScheme={accentColor}
                type="submit"
                isLoading={isSubmitting}
                loadingText={currentClass ? "Updating..." : "Creating..."}
                boxShadow="md"
              >
                {currentClass ? "Update Class" : "Create Class"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="lg">
          <ModalHeader borderBottomWidth="1px" borderColor={cardBorder}>
            Confirm Delete
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle mb={2}>Delete Fitness Class</AlertTitle>
                <AlertDescription>
                  Are you sure you want to delete{" "}
                  <strong>{currentClass?.name}</strong>? This action cannot be
                  undone.
                </AlertDescription>
              </Box>
            </Alert>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={cardBorder}>
            <Button variant="outline" mr={3} onClick={closeDelete}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmDelete}
              isLoading={isSubmitting}
              loadingText="Deleting..."
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
};

export default ClassManagement;

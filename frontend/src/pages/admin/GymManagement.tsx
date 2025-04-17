import { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  TableContainer,
  Skeleton,
  useColorModeValue,
  Icon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
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
  FormErrorMessage,
  Select,
  Avatar,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaBuilding,
  FaEllipsisV,
  FaSync,
  FaTrash,
  FaEdit,
  FaPlus,
  FaMapMarkerAlt,
  FaUserTie,
} from "react-icons/fa";
import { adminService } from "../../services/api";
import { User, Gym, CreateGymRequest, UserRole } from "../../types";
import ErrorDisplay from "../../components/ErrorDisplay";
import * as toastUtils from "../../utils/toast";
import { motion } from "framer-motion";
import Pagination from "../../components/Pagination";

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

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

const GymManagement = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGyms, setTotalGyms] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [gymToDelete, setGymToDelete] = useState<Gym | null>(null);
  const deleteAlertDisclosure = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  // Create/Edit Gym Modal State
  const [isCreateGymModalOpen, setIsCreateGymModalOpen] = useState(false);
  const [gymFormData, setGymFormData] = useState<CreateGymRequest>({
    name: "",
    address: "",
    ownerId: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userOptions, setUserOptions] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editGymId, setEditGymId] = useState<string | null>(null);

  // Pagination
  const limit = 10;

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const tableBg = useColorModeValue("white", "gray.800");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const tableRowHoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    fetchGyms();
  }, [currentPage]);

  const fetchGyms = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const nameParam = searchQuery ? searchQuery : undefined;
      const response = await adminService.getGyms(
        currentPage,
        limit,
        nameParam
      );

      if (response.success) {
        setGyms(response.data.data);
        setTotalPages(response.data.meta.totalPages);
        setTotalGyms(response.data.meta.total);
      } else {
        throw new Error(response.message || "Failed to fetch gyms");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch gyms";
      setError(errorMessage);
      toast(toastUtils.errorToast("Error", errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchGyms();
  };

  const handleRefresh = () => {
    fetchGyms();
    toast(toastUtils.infoToast("Refreshing", "Gym list is being updated"));
  };

  const handleChangePage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to fetch users for the ownerId dropdown
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await adminService.getUsers(1, 100);
      if (response.success) {
        setUserOptions(response.data.data);
      } else {
        throw new Error(response.message || "Failed to fetch users");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch users";
      toast(toastUtils.errorToast("Error", errorMessage));
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Open the modal and fetch user options
  const handleOpenCreateGymModal = () => {
    setIsCreateGymModalOpen(true);
    fetchUsers();
    // Reset the form data
    setGymFormData({
      name: "",
      address: "",
      ownerId: "",
    });
    setFormErrors({});
    setIsEditMode(false);
    setEditGymId(null);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setGymFormData((prev) => ({
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

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!gymFormData.name.trim()) {
      errors.name = "Gym name is required";
    }

    if (!gymFormData.address.trim()) {
      errors.address = "Address is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmitGym = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // For now, we only support creating gyms (not editing)
      const response = await adminService.createGym(gymFormData);
      if (response.success) {
        toast(toastUtils.successToast("Success", "Gym created successfully"));
        setIsCreateGymModalOpen(false);
        fetchGyms(); // Refresh the gym list
      } else {
        throw new Error(response.message || "Failed to create gym");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create gym";
      toast(toastUtils.errorToast("Error", errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete functionality
  const confirmDelete = (gym: Gym) => {
    setGymToDelete(gym);
    deleteAlertDisclosure.onOpen();
  };

  const handleDeleteGym = async () => {
    if (!gymToDelete) return;

    try {
      // Call the API to delete the gym
      const response = await adminService.deleteGym(gymToDelete.id);

      if (response.success) {
        toast(
          toastUtils.successToast(
            "Success",
            `Gym "${gymToDelete.name}" has been deleted`
          )
        );

        // Update local state to remove the deleted gym
        setGyms(gyms.filter((gym) => gym.id !== gymToDelete.id));
        setTotalGyms((prevTotal) => prevTotal - 1);
      } else {
        throw new Error(response.message || "Failed to delete gym");
      }

      // Close the dialog
      deleteAlertDisclosure.onClose();
      setGymToDelete(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete gym";
      toast(toastUtils.errorToast("Error", errorMessage));
    }
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
        mb={8}
        direction={{ base: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
      >
        <Box>
          <Heading as="h1" size="xl" mb={2} color={headingColor}>
            Gym Management
          </Heading>
          <Text color={textColor}>
            View and manage gyms in your fitness platform
          </Text>
        </Box>
        <HStack mt={{ base: 4, md: 0 }}>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="purple"
            onClick={handleOpenCreateGymModal}
          >
            Create Gym
          </Button>
          <Button
            leftIcon={<FaSync />}
            variant="outline"
            colorScheme="purple"
            onClick={handleRefresh}
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </HStack>
      </MotionFlex>

      {error && <ErrorDisplay error={error} mb={4} />}

      {/* Filters and Search */}
      <MotionBox variants={itemVariants} mb={6}>
        <Card
          bg={cardBg}
          borderColor={cardBorder}
          borderWidth="1px"
          shadow="sm"
        >
          <CardBody>
            <Flex
              direction={{ base: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ base: "stretch", md: "center" }}
              wrap="wrap"
              gap={4}
            >
              <InputGroup maxW={{ base: "100%", md: "320px" }}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by gym name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </InputGroup>
              <HStack>
                <Button colorScheme="purple" size="md" onClick={handleSearch}>
                  Search
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Gyms Table */}
      <MotionBox variants={itemVariants} mb={6}>
        <Card
          bg={cardBg}
          borderColor={cardBorder}
          borderWidth="1px"
          shadow="sm"
          overflow="hidden"
        >
          <CardBody p={0}>
            <TableContainer>
              <Table variant="simple">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>Gym Name</Th>
                    <Th>Address</Th>
                    <Th>Owner</Th>
                    <Th>Created</Th>
                    <Th width="100px">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isLoading
                    ? Array(5)
                        .fill(null)
                        .map((_, index) => (
                          <Tr key={`skeleton-${index}`}>
                            <Td>
                              <Skeleton height="20px" width="120px" />
                            </Td>
                            <Td>
                              <Skeleton height="20px" width="200px" />
                            </Td>
                            <Td>
                              <Skeleton height="20px" width="150px" />
                            </Td>
                            <Td>
                              <Skeleton height="20px" width="100px" />
                            </Td>
                            <Td>
                              <Skeleton height="20px" width="60px" />
                            </Td>
                          </Tr>
                        ))
                    : gyms.map((gym) => (
                        <Tr key={gym.id} _hover={{ bg: tableRowHoverBg }}>
                          <Td>
                            <HStack>
                              <Icon as={FaBuilding} color="purple.500" />
                              <Text fontWeight="medium">{gym.name}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <HStack>
                              <Icon as={FaMapMarkerAlt} color="gray.500" />
                              <Text>{gym.address}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            {gym.owner ? (
                              <HStack>
                                <Avatar size="sm" name={gym.owner.name} />
                                <VStack spacing={0} alignItems="flex-start">
                                  <Text fontWeight="medium">
                                    {gym.owner.name}
                                  </Text>
                                  <Text fontSize="xs" color={textColor}>
                                    {gym.owner.email}
                                  </Text>
                                </VStack>
                              </HStack>
                            ) : (
                              <HStack>
                                <Icon as={FaUserTie} color="gray.500" />
                                <Text color="gray.500">No owner assigned</Text>
                              </HStack>
                            )}
                          </Td>
                          <Td>
                            {gym.createdAt ? formatDate(gym.createdAt) : "N/A"}
                          </Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FaEllipsisV />}
                                variant="ghost"
                                size="sm"
                                aria-label="Actions"
                              />
                              <MenuList>
                                <MenuItem icon={<FaEdit />} isDisabled>
                                  Edit
                                </MenuItem>
                                <MenuItem
                                  icon={<FaTrash />}
                                  color="red.500"
                                  onClick={() => confirmDelete(gym)}
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Pagination */}
      <MotionBox variants={itemVariants} mb={6}>
        <Flex justifyContent="space-between" alignItems="center">
          <Text color={textColor}>
            Showing {gyms.length} of {totalGyms} gyms
          </Text>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handleChangePage}
          />
        </Flex>
      </MotionBox>

      {/* Create Gym Modal */}
      <Modal
        isOpen={isCreateGymModalOpen}
        onClose={() => setIsCreateGymModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditMode ? "Edit Gym" : "Create New Gym"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!formErrors.name} mb={4}>
              <FormLabel>Gym Name</FormLabel>
              <Input
                name="name"
                value={gymFormData.name}
                onChange={handleInputChange}
                placeholder="Enter gym name"
              />
              {formErrors.name && (
                <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!formErrors.address} mb={4}>
              <FormLabel>Address</FormLabel>
              <Input
                name="address"
                value={gymFormData.address}
                onChange={handleInputChange}
                placeholder="Enter gym address"
              />
              {formErrors.address && (
                <FormErrorMessage>{formErrors.address}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Owner</FormLabel>
              <Select
                name="ownerId"
                value={gymFormData.ownerId}
                onChange={handleInputChange}
                placeholder="Select owner"
                isDisabled={isLoadingUsers}
              >
                {userOptions.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </Select>
              <Text fontSize="sm" color="gray.500" mt={1}>
                If not selected, current user will be set as owner
              </Text>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="purple"
              mr={3}
              onClick={handleSubmitGym}
              isLoading={isSubmitting}
            >
              {isEditMode ? "Save Changes" : "Create"}
            </Button>
            <Button onClick={() => setIsCreateGymModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteAlertDisclosure.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteAlertDisclosure.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Gym
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {gymToDelete?.name}? This action
              cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteAlertDisclosure.onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteGym} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </MotionBox>
  );
};

export default GymManagement;

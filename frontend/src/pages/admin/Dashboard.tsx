import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Icon,
  useColorModeValue,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Avatar,
  Select,
  Skeleton,
  useToast,
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
  FormErrorMessage,
} from "@chakra-ui/react";
import {
  FaUsers,
  FaDumbbell,
  FaChartLine,
  FaMoneyBillWave,
  FaSync,
  FaBuilding,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Link as RouterLink } from "react-router-dom";
import { adminService } from "../../services/api";
import { User, FitnessClass, CreateGymRequest } from "../../types";
import ErrorDisplay from "../../components/ErrorDisplay";
import * as toastUtils from "../../utils/toast";

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionSimpleGrid = motion(SimpleGrid);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

// Extended FitnessClass type with _count property for admin dashboard
interface ExtendedFitnessClass extends FitnessClass {
  _count?: {
    bookings: number;
  };
}

interface DashboardStats {
  totalUsers: number;
  activeClasses: number;
  revenue: number;
  growthRate: number;
  recentUsers: User[];
  popularClasses: ExtendedFitnessClass[];
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Create Gym Modal State
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

  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    totalUsers: 0,
    activeClasses: 0,
    revenue: 0,
    growthRate: 0,
    recentUsers: [],
    popularClasses: [],
  });

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const statBg = useColorModeValue("purple.50", "purple.900");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const tableRowHoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If the API endpoint isn't implemented yet, use mock data
      try {
        const response = await adminService.getDashboardStats();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch dashboard data");
        }
      } catch (err) {
        console.warn("Using mock data - API endpoint not implemented", err);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch dashboard statistics";
      setError(errorMessage);
      toast(toastUtils.errorToast("Error", errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardStats();
    toast(
      toastUtils.infoToast("Refreshing", "Dashboard data is being updated")
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "red";
      case "INSTRUCTOR":
        return "purple";
      case "USER":
        return "green";
      default:
        return "gray";
    }
  };

  // Function to fetch users for the ownerId dropdown
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await adminService.getUsers(1, 10);
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
      const response = await adminService.createGym(gymFormData);
      if (response.success) {
        toast(toastUtils.successToast("Success", "Gym created successfully"));
        setIsCreateGymModalOpen(false);
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

  return (
    <MotionBox initial="hidden" animate="visible" variants={containerVariants}>
      {/* Welcome Section */}
      <MotionFlex
        variants={itemVariants}
        direction={{ base: "column", md: "row" }}
        mb={8}
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
      >
        <Box>
          <Heading as="h1" size="xl" mb={2} color={headingColor}>
            Admin Dashboard
          </Heading>
          <Text color={textColor}>
            Welcome back, {user?.name}. Monitor and manage your fitness
            platform.
          </Text>
        </Box>
        <Button
          leftIcon={<FaSync />}
          colorScheme="purple"
          variant="outline"
          onClick={handleRefresh}
          isLoading={isLoading}
          mt={{ base: 4, md: 0 }}
        >
          Refresh
        </Button>
      </MotionFlex>

      {error && <ErrorDisplay error={error} />}

      {/* Stats Grid */}
      <MotionSimpleGrid
        columns={{ base: 1, md: 2, lg: 4 }}
        spacing={6}
        mb={10}
        variants={itemVariants}
      >
        <Stat
          bg={statBg}
          p={5}
          borderRadius="lg"
          boxShadow="sm"
          transition="all 0.3s"
          _hover={{ transform: "translateY(-5px)", boxShadow: "md" }}
        >
          <StatLabel display="flex" alignItems="center">
            <Icon as={FaUsers} mr={2} color="purple.500" />
            Total Users
          </StatLabel>
          {isLoading ? (
            <Skeleton height="36px" width="80%" mt={2} mb={2} />
          ) : (
            <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
              {dashboardData.totalUsers}
            </StatNumber>
          )}
          <StatHelpText>Across all user types</StatHelpText>
        </Stat>

        <Stat
          bg={statBg}
          p={5}
          borderRadius="lg"
          boxShadow="sm"
          transition="all 0.3s"
          _hover={{ transform: "translateY(-5px)", boxShadow: "md" }}
        >
          <StatLabel display="flex" alignItems="center">
            <Icon as={FaDumbbell} mr={2} color="purple.500" />
            Active Classes
          </StatLabel>
          {isLoading ? (
            <Skeleton height="36px" width="80%" mt={2} mb={2} />
          ) : (
            <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
              {dashboardData.activeClasses}
            </StatNumber>
          )}
          <StatHelpText>Currently scheduled</StatHelpText>
        </Stat>

        <Stat
          bg={statBg}
          p={5}
          borderRadius="lg"
          boxShadow="sm"
          transition="all 0.3s"
          _hover={{ transform: "translateY(-5px)", boxShadow: "md" }}
        >
          <StatLabel display="flex" alignItems="center">
            <Icon as={FaMoneyBillWave} mr={2} color="purple.500" />
            Monthly Revenue
          </StatLabel>
          {isLoading ? (
            <Skeleton height="36px" width="80%" mt={2} mb={2} />
          ) : (
            <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
              coming soon
              {/* ${dashboardData.revenue} */}
            </StatNumber>
          )}
          <StatHelpText>For current month</StatHelpText>
        </Stat>

        <Stat
          bg={statBg}
          p={5}
          borderRadius="lg"
          boxShadow="sm"
          transition="all 0.3s"
          _hover={{ transform: "translateY(-5px)", boxShadow: "md" }}
        >
          <StatLabel display="flex" alignItems="center">
            <Icon as={FaChartLine} mr={2} color="purple.500" />
            Growth Rate
          </StatLabel>
          {isLoading ? (
            <Skeleton height="36px" width="80%" mt={2} mb={2} />
          ) : (
            <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
              coming soon
              {/* {dashboardData.growthRate}% */}
            </StatNumber>
          )}
          <StatHelpText>Compared to last month</StatHelpText>
        </Stat>
      </MotionSimpleGrid>

      {/* Admin Actions */}
      <MotionBox variants={itemVariants} mb={10}>
        <HStack spacing={4} justifyContent="center" wrap="wrap">
          <Button
            as={RouterLink}
            to="/admin/users"
            colorScheme="purple"
            variant="outline"
            leftIcon={<FaUsers />}
            size="lg"
            m={2}
          >
            Manage Users
          </Button>
          <Button
            as={RouterLink}
            to="/admin/classes"
            colorScheme="purple"
            variant="outline"
            leftIcon={<FaDumbbell />}
            size="lg"
            m={2}
          >
            Manage Classes
          </Button>
          <Button
            as={RouterLink}
            // to="/admin/reports"
            colorScheme="purple"
            variant="outline"
            leftIcon={<FaChartLine />}
            size="lg"
            m={2}
            disabled
          >
            View Reports
          </Button>
          <Button
            as={RouterLink}
            to="/admin/gyms"
            colorScheme="purple"
            variant="outline"
            leftIcon={<FaBuilding />}
            size="lg"
            m={2}
          >
            Manage Gyms
          </Button>
        </HStack>
      </MotionBox>

      {/* Main Content */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Recent Users Section */}
        <MotionBox variants={itemVariants}>
          <Card
            bg={cardBg}
            borderWidth="1px"
            borderColor={cardBorder}
            borderRadius="lg"
            overflow="hidden"
            transition="all 0.3s"
            _hover={{ boxShadow: "md" }}
            mb={8}
          >
            <CardHeader
              pb={0}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Heading size="md" mb={2} color={headingColor}>
                  Recent Users
                </Heading>
                <Text fontSize="sm" color={textColor}>
                  New registrations and activity
                </Text>
              </Box>
              <Button
                as={RouterLink}
                to="/admin/users"
                variant="outline"
                colorScheme="purple"
                size="sm"
              >
                View All Users
              </Button>
            </CardHeader>
            <CardBody>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>User</Th>
                      <Th>Role</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isLoading
                      ? Array(4)
                          .fill(0)
                          .map((_, index) => (
                            <Tr key={`skeleton-user-${index}`}>
                              <Td>
                                <Skeleton height="40px" />
                              </Td>
                              <Td>
                                <Skeleton height="24px" width="80px" />
                              </Td>
                              <Td>
                                <Skeleton height="24px" width="80px" />
                              </Td>
                            </Tr>
                          ))
                      : dashboardData.recentUsers.map((user) => (
                          <Tr
                            key={user.id}
                            _hover={{ bg: tableRowHoverBg }}
                            transition="background-color 0.2s"
                          >
                            <Td>
                              <HStack>
                                <Avatar
                                  size="sm"
                                  name={user.name}
                                  bg="purple.500"
                                />
                                <Box>
                                  <Text fontWeight="medium">{user.name}</Text>
                                  <Text fontSize="xs" color={textColor}>
                                    {user.email}
                                  </Text>
                                </Box>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={getRoleBadgeColor(user.role)}
                                borderRadius="full"
                                px={2}
                              >
                                {user.role}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme="green"
                                borderRadius="full"
                                px={2}
                              >
                                Active
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Popular Classes Section */}
        <MotionBox variants={itemVariants}>
          <Card
            bg={cardBg}
            borderWidth="1px"
            borderColor={cardBorder}
            borderRadius="lg"
            overflow="hidden"
            transition="all 0.3s"
            _hover={{ boxShadow: "md" }}
          >
            <CardHeader
              pb={0}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Heading size="md" mb={2} color={headingColor}>
                  Popular Classes
                </Heading>
                <Text fontSize="sm" color={textColor}>
                  Most attended and highest revenue classes
                </Text>
              </Box>
              <HStack>
                <Select
                  size="sm"
                  width="auto"
                  placeholder="Filter by"
                  borderRadius="md"
                >
                  <option value="all">All Classes</option>
                  <option value="active">Active Only</option>
                  <option value="revenue">By Revenue</option>
                  <option value="attendees">By Attendance</option>
                </Select>
                <Button
                  as={RouterLink}
                  to="/admin/classes"
                  variant="outline"
                  colorScheme="purple"
                  size="sm"
                >
                  Manage All
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Class</Th>
                      <Th isNumeric>Attendees</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isLoading
                      ? Array(3)
                          .fill(0)
                          .map((_, index) => (
                            <Tr key={`skeleton-class-${index}`}>
                              <Td>
                                <Skeleton height="40px" />
                              </Td>
                              <Td isNumeric>
                                <Skeleton height="24px" width="60px" />
                              </Td>
                            </Tr>
                          ))
                      : dashboardData.popularClasses.map(
                          (classItem: ExtendedFitnessClass) => (
                            <Tr
                              key={classItem.id}
                              _hover={{ bg: tableRowHoverBg }}
                              transition="background-color 0.2s"
                            >
                              <Td>
                                <Box>
                                  <Text fontWeight="medium">
                                    {classItem.name}
                                  </Text>
                                  <Text fontSize="xs" color={textColor}>
                                    by{" "}
                                    {classItem.instructor?.name ||
                                      "Unknown Instructor"}
                                  </Text>
                                </Box>
                              </Td>
                              <Td isNumeric fontWeight="medium">
                                {classItem._count?.bookings || 0}
                              </Td>
                            </Tr>
                          )
                        )}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        </MotionBox>
      </SimpleGrid>

      {/* Create Gym Modal */}
      <Modal
        isOpen={isCreateGymModalOpen}
        onClose={() => setIsCreateGymModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Gym</ModalHeader>
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
              Create
            </Button>
            <Button onClick={() => setIsCreateGymModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
};

export default AdminDashboard;

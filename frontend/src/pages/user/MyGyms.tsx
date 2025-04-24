import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Badge,
  Flex,
  useToast,
  Skeleton,
  SkeletonText,
  VStack,
  Icon,
  useColorModeValue,
  Container,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Image,
  Tooltip,
  IconButton,
  Stack,
} from "@chakra-ui/react";
import {
  FaMapMarkerAlt,
  FaUser,
  FaBuilding,
  FaPlus,
  FaDumbbell as FaGym,
  FaChalkboardTeacher as FaGraduationCap,
  FaCalendarAlt,
  FaInfoCircle,
  FaDirections,
  FaArrowRight,
} from "react-icons/fa";
import { MdFitnessCenter, MdLocationOn } from "react-icons/md";
import { Gym, PaginatedResponse, UserRole } from "../../types";
import {
  userService,
  instructorService,
  adminService,
} from "../../services/api";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import RegisterGymModal from "../../components/map/RegisterGymModal";
import CreateClassModal from "../../components/class/CreateClassModal";

const MyGyms = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [selectedGym, setSelectedGym] = useState<string | null>(null);

  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cardBgColor = useColorModeValue("white", "gray.700");
  const cardBorderColor = useColorModeValue("gray.200", "gray.600");
  const badgeBgColor = useColorModeValue("teal.100", "teal.800");
  const badgeColor = useColorModeValue("teal.800", "teal.100");
  const headingColor = useColorModeValue("gray.700", "white");
  const statBgColor = useColorModeValue("teal.50", "teal.900");
  const gradientStart = useColorModeValue(
    "rgba(255,255,255,0.8)",
    "rgba(23,25,35,0.8)"
  );
  const gradientEnd = useColorModeValue(
    "rgba(237,242,247,0.8)",
    "rgba(45,55,72,0.8)"
  );

  // Register gym modal
  const {
    isOpen: isRegisterGymModalOpen,
    onOpen: openRegisterGymModal,
    onClose: closeRegisterGymModal,
  } = useDisclosure();

  // Create class modal
  const {
    isOpen: isCreateClassModalOpen,
    onOpen: openCreateClassModal,
    onClose: closeCreateClassModal,
  } = useDisclosure();

  useEffect(() => {
    if (user) {
      fetchGyms(1);
    }
  }, [user]);

  const fetchGyms = async (page: number) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      console.log("Fetching gyms for role:", user.role);

      // Use different service based on user role
      if (user.role === UserRole.INSTRUCTOR) {
        console.log("Using instructor service to fetch gyms");
        response = await instructorService.getInstructorGyms(page, 9);
      } else if (user.role === UserRole.ADMIN) {
        console.log("Using admin service to fetch gyms");
        response = await adminService.getGyms(page, 9);
      } else {
        console.log("Using user service to fetch gyms");
        response = await userService.getUserGyms(page, 9);
      }

      console.log("API response:", response);

      // Check for authentication issues
      if (!response.success && response.message.includes("Authentication")) {
        console.error("Authentication error:", response.message);
        setError("Authentication error. Please log in again.");
        toast({
          title: "Authentication Error",
          description: "Please log in again to view your gyms.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (!response.success) {
        throw new Error(response.message || "Failed to load gyms");
      }

      // Log the structure of the response data to debug
      console.log("Response data structure:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        hasMeta: !!response.data?.meta,
        hasDataArray: Array.isArray(response.data?.data),
        dataLength: response.data?.data?.length || 0,
      });

      // Handle potential response structure issues
      const paginatedData = response.data as PaginatedResponse<Gym>;

      // Ensure we have a valid data array
      const gymData = Array.isArray(paginatedData.data)
        ? paginatedData.data
        : [];

      // Ensure we have valid meta data
      const metaData = paginatedData.meta || {
        total: gymData.length,
        page: page,
        limit: 9,
        totalPages: Math.ceil(gymData.length / 9),
      };

      setGyms(gymData);
      setPagination({
        currentPage: metaData.page,
        totalPages: metaData.totalPages,
        totalItems: metaData.total,
      });

      // If we reached here but have no gyms, log a warning
      if (gymData.length === 0) {
        console.warn("No gyms found in response");
      }
    } catch (err) {
      console.error("Error fetching gyms:", err);

      const errorMessage =
        err instanceof Error ? err.message : "Failed to load gyms";
      setError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchGyms(newPage);
  };

  const handleCreateClass = (gymId: string) => {
    setSelectedGym(gymId);
    openCreateClassModal();
  };

  const handleClassCreationSuccess = () => {
    toast({
      title: "Success",
      description: "Fitness class created successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if (!user) {
    return (
      <EmptyState
        title="Authentication Required"
        message="Please login to view your gyms."
        icon={FaUser}
      />
    );
  }

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center" wrap="wrap">
            <Heading as="h1" size="xl" color={headingColor} mb={2}>
              My Gyms
            </Heading>

            <Button
              variant="solid"
              colorScheme="teal"
              leftIcon={<FaPlus />}
              isLoading={true}
              mb={2}
              size="md"
            >
              Register Gym
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} boxShadow="md" height="100%">
                <CardHeader>
                  <SkeletonText mt="4" noOfLines={2} spacing="4" />
                </CardHeader>
                <CardBody>
                  <SkeletonText mt="4" noOfLines={4} spacing="4" />
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Gyms"
        message={error}
        icon={FaBuilding}
        actionText="Try Again"
        onActionClick={() => fetchGyms(1)}
      />
    );
  }

  const pageTitle =
    user.role === UserRole.INSTRUCTOR ? "My Teaching Locations" : "My Gyms";
  const emptyStateTitle =
    user.role === UserRole.INSTRUCTOR
      ? "No Teaching Locations"
      : "No Gyms Found";
  const emptyStateMessage =
    user.role === UserRole.INSTRUCTOR
      ? "You don't have any gyms where you teach classes yet."
      : "You don't have any registered gyms yet.";

  if (gyms.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center" wrap="wrap">
            <Heading as="h1" size="xl" color={headingColor} mb={2}>
              {pageTitle}
            </Heading>

            <Button
              variant="solid"
              colorScheme="teal"
              leftIcon={<FaPlus />}
              onClick={openRegisterGymModal}
              mb={2}
              size="md"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
            >
              Register Gym
            </Button>
          </Flex>

          <EmptyState
            title={emptyStateTitle}
            message={emptyStateMessage}
            icon={FaBuilding}
          />
        </VStack>

        <RegisterGymModal
          isOpen={isRegisterGymModalOpen}
          onClose={closeRegisterGymModal}
          onSuccess={() => {
            fetchGyms(1);
            toast({
              title: "Gym registered successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }}
        />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box
        position="relative"
        height="240px"
        mb={10}
        borderRadius="xl"
        overflow="hidden"
        backgroundImage="url('https://images.unsplash.com/photo-1598136490937-cac234183aba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2369&q=80')"
        backgroundSize="cover"
        backgroundPosition="center"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          background={`linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`}
          zIndex={1}
        />
        <Box
          position="absolute"
          bottom={6}
          left={6}
          right={6}
          zIndex={2}
          display="flex"
          flexDirection="column"
        >
          <Heading color={headingColor} size="xl" mb={2}>
            {pageTitle}
          </Heading>
          <Text fontSize="lg" color="gray.600">
            {user.role === UserRole.INSTRUCTOR ? (
              <Flex align="center">
                <Icon as={FaGraduationCap} mr={2} color="teal.400" />
                Manage your teaching locations and schedule classes for your
                students
              </Flex>
            ) : (
              <Flex align="center">
                <Icon as={FaGym} mr={2} color="teal.400" />
                Manage your gyms, create fitness classes, and track activity
              </Flex>
            )}
          </Text>
          <Flex mt={4} justify="space-between" align="center">
            <Box>
              <Stat
                backgroundColor={statBgColor}
                p={2}
                borderRadius="md"
                minW="140px"
              >
                <StatLabel fontSize="xs">
                  Total{" "}
                  {user.role === UserRole.INSTRUCTOR ? "Locations" : "Gyms"}
                </StatLabel>
                <StatNumber>{pagination.totalItems}</StatNumber>
                <StatHelpText>
                  <Flex align="center">
                    <Icon as={FaCalendarAlt} mr={1} />
                    {new Date().toLocaleDateString()}
                  </Flex>
                </StatHelpText>
              </Stat>
            </Box>
            <Button
              variant="solid"
              colorScheme="teal"
              leftIcon={<FaPlus />}
              onClick={openRegisterGymModal}
              size="md"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
              zIndex={2}
            >
              Register New Gym
            </Button>
          </Flex>
        </Box>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} mb={8}>
        {gyms.map((gym) => (
          <Card
            key={gym.id}
            bg={cardBgColor}
            borderWidth="1px"
            borderColor={cardBorderColor}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
            position="relative"
          >
            <Box
              h="140px"
              bg="gray.200"
              position="relative"
              backgroundImage={`url('https://source.unsplash.com/random/400x200/?gym,fitness&${gym.id}')`}
              backgroundSize="cover"
              backgroundPosition="center"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="blackAlpha.300"
              />
              <Badge
                position="absolute"
                top={3}
                right={3}
                bg={badgeBgColor}
                color={badgeColor}
                fontSize="0.8em"
                borderRadius="full"
                px={3}
                py={1}
                fontWeight="medium"
              >
                {user?.role === UserRole.INSTRUCTOR
                  ? "Teaching Location"
                  : "Owner"}
              </Badge>
            </Box>

            <CardHeader pb={0}>
              <Heading as="h3" size="md" mb={1}>
                {gym.name}
              </Heading>
              <Flex alignItems="center" mb={2}>
                <Icon as={MdLocationOn} color="teal.500" mr={1} />
                <Text fontSize="sm" color="gray.500" noOfLines={1}>
                  {gym.address}
                </Text>
              </Flex>
            </CardHeader>

            <CardBody pt={2}>
              <VStack align="start" spacing={3}>
                {gym.owner && (
                  <Flex alignItems="center" width="100%">
                    <Icon as={FaUser} mr={2} color="teal.500" />
                    <Text fontSize="sm">
                      <Text as="span" fontWeight="medium">
                        Owner:
                      </Text>{" "}
                      {gym.owner.name}
                    </Text>
                  </Flex>
                )}

                <Divider />

                <Flex width="100%" justify="space-between">
                  <Tooltip label="View gym details">
                    <Button
                      as={Link}
                      to={`/gyms/${gym.id}`}
                      colorScheme="teal"
                      variant="outline"
                      size="sm"
                      leftIcon={<FaInfoCircle />}
                      flex="1"
                      mr={2}
                    >
                      Details
                    </Button>
                  </Tooltip>

                  <Tooltip label={`Create a fitness class at ${gym.name}`}>
                    <Button
                      colorScheme="teal"
                      size="sm"
                      leftIcon={<FaPlus />}
                      onClick={() => handleCreateClass(gym.id)}
                      flex="1"
                    >
                      Add Class
                    </Button>
                  </Tooltip>
                </Flex>
              </VStack>
            </CardBody>

            <CardFooter pt={0} pb={4} px={4}>
              <Button
                variant="ghost"
                colorScheme="teal"
                size="sm"
                width="full"
                rightIcon={<FaArrowRight />}
                onClick={() => navigate(`/gyms/${gym.id}/classes`)}
              >
                View Classes
              </Button>
            </CardFooter>
          </Card>
        ))}
      </SimpleGrid>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Register Gym Modal */}
      <RegisterGymModal
        isOpen={isRegisterGymModalOpen}
        onClose={closeRegisterGymModal}
        onSuccess={() => {
          fetchGyms(1);
          toast({
            title: "Gym registered successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }}
      />

      {/* Create Class Modal */}
      {selectedGym && (
        <CreateClassModal
          isOpen={isCreateClassModalOpen}
          onClose={closeCreateClassModal}
          gymId={selectedGym}
          onSuccess={handleClassCreationSuccess}
        />
      )}
    </Container>
  );
};

export default MyGyms;

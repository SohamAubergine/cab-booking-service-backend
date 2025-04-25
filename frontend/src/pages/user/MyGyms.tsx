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
  HStack,
  Grid,
  GridItem,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Avatar,
  AvatarBadge,
  AspectRatio,
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
  FaList,
  FaMapMarked,
  FaEllipsisH,
  FaRegClock,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import { MdFitnessCenter, MdLocationOn, MdGridView } from "react-icons/md";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Color scheme - updated to purple for new theme
  const cardBgColor = useColorModeValue("white", "gray.800");
  const cardBorderColor = useColorModeValue("purple.100", "purple.700");
  const badgeBgColor = useColorModeValue("purple.100", "purple.800");
  const badgeColor = useColorModeValue("purple.800", "purple.100");
  const headingColor = useColorModeValue("purple.800", "purple.100");
  const statBgColor = useColorModeValue("purple.50", "purple.900");
  const accentColor = "purple";
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

            <Skeleton height="40px" width="150px" />
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                boxShadow="lg"
                height="100%"
                borderWidth="1px"
                borderColor={cardBorderColor}
                borderRadius="xl"
              >
                <Skeleton height="200px" />
                <CardHeader>
                  <SkeletonText
                    mt="2"
                    noOfLines={1}
                    spacing="4"
                    skeletonHeight="6"
                  />
                </CardHeader>
                <CardBody pt={0}>
                  <SkeletonText mt="2" noOfLines={3} spacing="4" />
                </CardBody>
                <CardFooter>
                  <Skeleton height="40px" width="100%" />
                </CardFooter>
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
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <MotionFlex
            justify="space-between"
            align="center"
            wrap="wrap"
            variants={itemVariants}
            mb={8}
          >
            <Heading as="h1" size="xl" color={headingColor} mb={2}>
              {pageTitle}
            </Heading>

            <Button
              variant="solid"
              colorScheme={accentColor}
              leftIcon={<FaPlus />}
              onClick={openRegisterGymModal}
              mb={2}
              size="md"
              boxShadow="md"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "xl",
              }}
            >
              Register Gym
            </Button>
          </MotionFlex>

          <MotionBox variants={itemVariants}>
            <EmptyState
              title={emptyStateTitle}
              message={emptyStateMessage}
              icon={FaBuilding}
            />
          </MotionBox>
        </MotionBox>

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
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <MotionBox
          position="relative"
          height={{ base: "200px", md: "280px" }}
          mb={10}
          borderRadius="2xl"
          overflow="hidden"
          boxShadow="xl"
          variants={itemVariants}
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            backgroundImage="url('https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1974&auto=format&fit=crop')"
            backgroundSize="cover"
            backgroundPosition="center"
            filter="brightness(0.8)"
          />
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            bgGradient={`linear(to-r, ${useColorModeValue(
              "purple.700",
              "purple.900"
            )}CC, ${useColorModeValue("purple.500", "purple.700")}99)`}
          />
          <Flex
            position="relative"
            zIndex={1}
            height="100%"
            direction="column"
            justify="flex-end"
            p={{ base: 4, md: 8 }}
          >
            <MotionBox
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.1, duration: 0.6 },
                },
              }}
            >
              <Badge
                mb={3}
                colorScheme={accentColor}
                variant="solid"
                fontSize="sm"
                borderRadius="full"
                px={3}
                py={1}
              >
                {user.role === UserRole.INSTRUCTOR ? "Instructor" : "Gym Owner"}
              </Badge>
              <Heading color="white" size="2xl" fontWeight="bold" mb={2}>
                {pageTitle}
              </Heading>
              <Text fontSize="lg" color="whiteAlpha.900" maxW="700px">
                {user.role === UserRole.INSTRUCTOR ? (
                  <Flex align="center">
                    <Icon as={FaGraduationCap} mr={2} color="white" />
                    Manage your teaching locations and schedule classes for your
                    students
                  </Flex>
                ) : (
                  <Flex align="center">
                    <Icon as={FaGym} mr={2} color="white" />
                    Manage your gyms, create fitness classes, and track activity
                  </Flex>
                )}
              </Text>
            </MotionBox>

            <MotionFlex
              mt={{ base: 4, md: 6 }}
              width="100%"
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.2, duration: 0.6 },
                },
              }}
            >
              <HStack mb={{ base: 4, md: 0 }}>
                <Stat
                  backgroundColor="whiteAlpha.300"
                  p={3}
                  borderRadius="lg"
                  minW={{ base: "auto", md: "180px" }}
                  backdropFilter="blur(10px)"
                >
                  <StatLabel color="whiteAlpha.800" fontSize="xs">
                    Total{" "}
                    {user.role === UserRole.INSTRUCTOR ? "Locations" : "Gyms"}
                  </StatLabel>
                  <StatNumber
                    color="white"
                    fontSize={{ base: "2xl", md: "3xl" }}
                  >
                    {pagination.totalItems}
                  </StatNumber>
                  <StatHelpText color="whiteAlpha.800" mb={0}>
                    <Flex align="center">
                      <Icon as={FaCalendarAlt} mr={1} />
                      {new Date().toLocaleDateString()}
                    </Flex>
                  </StatHelpText>
                </Stat>
              </HStack>
              <Box>
                <Button
                  variant="solid"
                  bg="white"
                  color={`${accentColor}.600`}
                  leftIcon={<FaPlus />}
                  onClick={openRegisterGymModal}
                  size="md"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                    bg: "whiteAlpha.900",
                  }}
                  boxShadow="md"
                >
                  Register New Gym
                </Button>
              </Box>
            </MotionFlex>
          </Flex>
        </MotionBox>

        {/* View Controls */}
        <MotionFlex
          justify="space-between"
          align="center"
          mb={6}
          variants={itemVariants}
        >
          <Tabs
            variant="soft-rounded"
            colorScheme={accentColor}
            size="sm"
            onChange={(index) => setViewMode(index === 0 ? "grid" : "list")}
          >
            <TabList>
              <Tab>
                <Icon as={MdGridView} mr={2} /> Grid
              </Tab>
              <Tab>
                <Icon as={FaList} mr={2} /> List
              </Tab>
            </TabList>
          </Tabs>

          <Text color="gray.500" fontSize="sm">
            Showing {gyms.length} of {pagination.totalItems} gyms
          </Text>
        </MotionFlex>

        {/* Gyms Grid View */}
        {viewMode === "grid" && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
            {gyms.map((gym, index) => (
              <MotionCard
                key={gym.id}
                variants={itemVariants}
                bg={cardBgColor}
                borderWidth="1px"
                borderColor={cardBorderColor}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="lg"
                transition="all 0.3s"
                _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
                position="relative"
                height="100%"
              >
                <Badge
                  position="absolute"
                  top={4}
                  right={4}
                  bg={`${accentColor}.500`}
                  color="white"
                  fontSize="0.8em"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontWeight="medium"
                  boxShadow="sm"
                  zIndex={1}
                >
                  {user?.role === UserRole.INSTRUCTOR
                    ? "Teaching Location"
                    : "Owner"}
                </Badge>

                <CardHeader pb={0}>
                  <Heading as="h3" size="md" mb={1}>
                    {gym.name}
                  </Heading>
                  <Flex alignItems="center" mb={2}>
                    <Icon
                      as={MdLocationOn}
                      color={`${accentColor}.500`}
                      mr={1}
                    />
                    <Text fontSize="sm" color="gray.500" noOfLines={1}>
                      {gym.address}
                    </Text>
                  </Flex>
                </CardHeader>

                <CardBody pt={2}>
                  <VStack align="start" spacing={3}>
                    {gym.owner && (
                      <Flex alignItems="center" width="100%">
                        <Avatar size="xs" mr={2} name={gym.owner.name}>
                          <AvatarBadge
                            boxSize="1em"
                            bg={`${accentColor}.500`}
                          />
                        </Avatar>
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="medium">
                            Owner:
                          </Text>{" "}
                          {gym.owner.name}
                        </Text>
                      </Flex>
                    )}

                    <Divider />

                    <Flex width="100%" justify="space-between" gap={2}>
                      <Tooltip label={`Create a fitness class at ${gym.name}`}>
                        <Button
                          colorScheme={accentColor}
                          size="sm"
                          leftIcon={<FaPlus />}
                          onClick={() => handleCreateClass(gym.id)}
                          flex="1"
                        >
                          Add Class
                        </Button>
                      </Tooltip>
                      <Tooltip label="View class details">
                        <Button
                          variant="ghost"
                          colorScheme={accentColor}
                          size="sm"
                          // width="full"
                          rightIcon={<FaArrowRight />}
                          onClick={() => navigate(`/gyms/${gym.id}/classes`)}
                        >
                          View Classes
                        </Button>
                      </Tooltip>
                    </Flex>
                  </VStack>
                </CardBody>
              </MotionCard>
            ))}
          </SimpleGrid>
        )}

        {/* Gyms List View */}
        {viewMode === "list" && (
          <VStack spacing={4} align="stretch" mb={8}>
            {gyms.map((gym, index) => (
              <MotionCard
                key={gym.id}
                variants={itemVariants}
                bg={cardBgColor}
                borderWidth="1px"
                borderColor={cardBorderColor}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="md"
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                  borderColor: `${accentColor}.300`,
                }}
                position="relative"
              >
                <Badge
                  position="absolute"
                  top={4}
                  right={4}
                  bg={`${accentColor}.500`}
                  color="white"
                  fontSize="0.8em"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontWeight="medium"
                  boxShadow="sm"
                  zIndex={1}
                >
                  {user?.role === UserRole.INSTRUCTOR
                    ? "Teaching Location"
                    : "Owner"}
                </Badge>

                <Box p={5}>
                  <Flex direction="column" h="100%">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Heading as="h3" size="md">
                        {gym.name}
                      </Heading>
                      <IconButton
                        aria-label="More options"
                        icon={<FaEllipsisH />}
                        variant="ghost"
                        colorScheme={accentColor}
                        size="sm"
                      />
                    </Flex>
                    <Flex alignItems="center" mb={3}>
                      <Icon
                        as={MdLocationOn}
                        color={`${accentColor}.500`}
                        mr={1}
                      />
                      <Text fontSize="sm" color="gray.500">
                        {gym.address}
                      </Text>
                    </Flex>

                    {gym.owner && (
                      <Flex alignItems="center" mb={3}>
                        <Avatar size="xs" mr={2} name={gym.owner.name}>
                          <AvatarBadge
                            boxSize="1em"
                            bg={`${accentColor}.500`}
                          />
                        </Avatar>
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="medium">
                            Owner:
                          </Text>{" "}
                          {gym.owner.name}
                        </Text>
                      </Flex>
                    )}

                    <Flex flex="1" />

                    <Flex mt={4} flexWrap="wrap" gap={2}>
                      <Button
                        as={Link}
                        to={`/gyms/${gym.id}`}
                        colorScheme={accentColor}
                        variant="outline"
                        size="sm"
                        leftIcon={<FaInfoCircle />}
                      >
                        Details
                      </Button>
                      <Button
                        colorScheme={accentColor}
                        size="sm"
                        leftIcon={<FaPlus />}
                        onClick={() => handleCreateClass(gym.id)}
                        mr={2}
                      >
                        Add Class
                      </Button>
                      <Button
                        variant="ghost"
                        colorScheme={accentColor}
                        size="sm"
                        rightIcon={<FaArrowRight />}
                        onClick={() => navigate(`/gyms/${gym.id}/classes`)}
                      >
                        View Classes
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              </MotionCard>
            ))}
          </VStack>
        )}

        {pagination.totalPages > 1 && (
          <MotionBox variants={itemVariants} mb={6}>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </MotionBox>
        )}
      </MotionBox>

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

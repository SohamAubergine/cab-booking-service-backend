import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
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
} from "@chakra-ui/react";
import {
  FaMapMarkerAlt,
  FaUser,
  FaBuilding,
  FaPlus,
  FaDumbbell as FaGym,
  FaChalkboardTeacher as FaGraduationCap,
} from "react-icons/fa";
import { Gym, PaginatedResponse, UserRole } from "../../types";
import { userService, instructorService } from "../../services/api";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import RegisterGymModal from "../../components/map/RegisterGymModal";

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

  const toast = useToast();
  const { user } = useAuth();
  const cardBgColor = useColorModeValue("white", "gray.700");
  const cardBorderColor = useColorModeValue("gray.200", "gray.600");
  const badgeBgColor = useColorModeValue("purple.100", "purple.800");
  const badgeColor = useColorModeValue("purple.800", "purple.100");
  const headingColor = useColorModeValue("gray.700", "white");
  const [isRegisterGymModalOpen, setIsRegisterGymModalOpen] = useState(false);

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
      } else {
        console.log("Using user service to fetch gyms");
        response = await userService.getUserGyms(page, 9);
      }

      console.log("API response:", response);

      if (!response.success) {
        throw new Error(response.message || "Failed to load gyms");
      }

      const paginatedData = response.data as PaginatedResponse<Gym>;

      setGyms(paginatedData.data);
      setPagination({
        currentPage: paginatedData.meta.page,
        totalPages: paginatedData.meta.totalPages,
        totalItems: paginatedData.meta.total,
      });
    } catch (err) {
      console.error("Error fetching gyms:", err);
      setError("Failed to load gyms. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load gyms. Please try again.",
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

  const handleOpenRegisterGym = () => {
    setIsRegisterGymModalOpen(true);
  };

  const handleCloseRegisterGym = () => {
    setIsRegisterGymModalOpen(false);
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
              onClick={handleOpenRegisterGym}
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
          onClose={handleCloseRegisterGym}
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
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center" wrap="wrap">
          <Heading as="h1" size="xl" color={headingColor} mb={2}>
            {pageTitle}
          </Heading>

          <Button
            variant="solid"
            colorScheme="teal"
            leftIcon={<FaPlus />}
            onClick={handleOpenRegisterGym}
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

        {user.role === UserRole.USER && (
          <Text color="gray.600" fontSize="lg">
            <Icon as={FaGym} mr={2} />
            These are the gyms you've registered. You can manage their details
            and see associated activities.
          </Text>
        )}

        {user.role === UserRole.INSTRUCTOR && (
          <Text color="gray.600" fontSize="lg">
            <Icon as={FaGraduationCap} mr={2} />
            These are the gyms where you teach classes. You can see details and
            manage your schedule.
          </Text>
        )}

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
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
            >
              <CardHeader>
                <Heading as="h3" size="md">
                  {gym.name}
                </Heading>
                <Badge
                  bg={badgeBgColor}
                  color={badgeColor}
                  fontSize="0.8em"
                  mt={2}
                  borderRadius="full"
                  px={2}
                >
                  {user?.role === UserRole.INSTRUCTOR
                    ? "Teaching Location"
                    : "Owner"}
                </Badge>
              </CardHeader>

              <CardBody>
                <VStack align="start" spacing={3}>
                  <Flex alignItems="center">
                    <Icon as={FaMapMarkerAlt} mr={2} color="purple.500" />
                    <Text>{gym.address}</Text>
                  </Flex>

                  {gym.owner && (
                    <Flex alignItems="center">
                      <Icon as={FaUser} mr={2} color="purple.500" />
                      <Text>Owner: {gym.owner.name}</Text>
                    </Flex>
                  )}

                  <Button
                    as={Link}
                    to={`/gyms/${gym.id}`}
                    colorScheme="purple"
                    variant="outline"
                    size="sm"
                    width="full"
                    mt={2}
                  >
                    View Details
                  </Button>
                </VStack>
              </CardBody>
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
      </VStack>

      <RegisterGymModal
        isOpen={isRegisterGymModalOpen}
        onClose={handleCloseRegisterGym}
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
};

export default MyGyms;

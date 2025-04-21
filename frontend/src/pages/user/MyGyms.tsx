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
} from "@chakra-ui/react";
import { FaMapMarkerAlt, FaUser, FaBuilding } from "react-icons/fa";
import { Gym, PaginatedResponse, UserRole } from "../../types";
import { userService } from "../../services/api";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

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

  useEffect(() => {
    fetchGyms(1);
  }, []);

  const fetchGyms = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getUserGyms(page, 9);
      const paginatedData = response.data as PaginatedResponse<Gym>;

      setGyms(paginatedData.data);
      setPagination({
        currentPage: paginatedData.meta.page,
        totalPages: paginatedData.meta.totalPages,
        totalItems: paginatedData.meta.total,
      });
    } catch (err) {
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

  if (loading) {
    return (
      <Box>
        <Heading mb={6}>My Gyms</Heading>
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
      </Box>
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

  if (gyms.length === 0) {
    return (
      <EmptyState
        title="No Gyms Found"
        message="You don't have any gyms yet."
        icon={FaBuilding}
      />
    );
  }

  return (
    <Box>
      <Heading mb={6}>My Gyms</Heading>
      <Text mb={6}>
        {user?.role === UserRole.INSTRUCTOR
          ? "Below are the gyms where you're teaching classes."
          : "Below are the gyms you own."}
      </Text>

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
    </Box>
  );
};

export default MyGyms;

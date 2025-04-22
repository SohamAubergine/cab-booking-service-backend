import { useState, useEffect } from "react";
import {
  Container,
  Heading,
  Text,
  SimpleGrid,
  Box,
  VStack,
  HStack,
  Image,
  Badge,
  Flex,
  Icon,
  Button,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Spinner,
  Center,
  IconButton,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaHeart,
  FaArrowLeft,
} from "react-icons/fa";
import { CalendarIcon, TimeIcon } from "@chakra-ui/icons";
import { format } from "date-fns";
import { favoriteService, fitnessClassService } from "../../services/api";
import { FitnessClass } from "../../types";
import FavoriteButton from "../../components/FavoriteButton";
import EmptyState from "../../components/EmptyState";
import axios from "axios";

// Create motion components
const MotionBox = motion(Box);
const MotionContainer = motion(Container);
const MotionSimpleGrid = motion(SimpleGrid);
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
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const Favorites = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [favorites, setFavorites] = useState<FitnessClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [apiNotAvailable, setApiNotAvailable] = useState(false);

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const headerBg = useColorModeValue("purple.50", "purple.900");

  useEffect(() => {
    fetchFavorites();
  }, [currentPage]);

  // Notify user when mock implementation is being used (only once)
  useEffect(() => {
    if (apiNotAvailable) {
      toast({
        title: "Using Local Favorites",
        description:
          "Your favorites are stored in your browser and will not persist across devices.",
        status: "info",
        duration: 6000,
        isClosable: true,
      });
    }
  }, [apiNotAvailable, toast]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setApiNotAvailable(false);
      const response = await favoriteService.getFavorites(currentPage, 12);

      if (response.success) {
        // Extract fitness classes from the favorites
        // The API might return either FavoriteClass objects with fitnessClass property
        // or directly FitnessClass objects depending on implementation
        const fitnessClasses = response.data.data.map((item: any) => {
          if (item.fitnessClass) return item.fitnessClass;
          return item;
        });

        setFavorites(fitnessClasses);
        setTotalPages(response.data.meta.totalPages || 1);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);

      // Check if it's a 404 error (API not implemented)
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setApiNotAvailable(true);
        toast({
          title: "API Not Available",
          description: "The favorites API is not available at this moment.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch favorites";
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteRemoved = (removedClassId: string) => {
    // Update the UI by removing the class from the list
    setFavorites((prevFavorites) =>
      prevFavorites.filter((item) => item.id !== removedClassId)
    );
  };

  const formatClassTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy h:mm a");
  };

  return (
    <MotionContainer
      maxW="container.xl"
      py={8}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <MotionBox variants={itemVariants} mb={8}>
        <Button
          leftIcon={<FaArrowLeft />}
          onClick={() => navigate(-1)}
          mb={4}
          size="sm"
          variant="outline"
        >
          Back
        </Button>

        <Heading as="h1" size="xl" mb={2}>
          Your Favorites
        </Heading>
        <Text color={textColor}>
          Classes you've added to your favorites list
        </Text>
      </MotionBox>

      {isLoading ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {[...Array(8)].map((_, index) => (
            <Card key={index} height="350px" boxShadow="md">
              <Skeleton height="140px" />
              <CardBody>
                <SkeletonText mt="4" noOfLines={4} spacing="4" />
              </CardBody>
              <CardFooter>
                <Skeleton height="30px" width="100%" />
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      ) : error && !apiNotAvailable ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : favorites.length === 0 || apiNotAvailable ? (
        <EmptyState
          icon={FaHeart}
          title={apiNotAvailable ? "Feature Coming Soon" : "No Favorites Yet"}
          message={
            apiNotAvailable
              ? "We're still working on the favorites feature. Please check back later!"
              : "You haven't added any classes to your favorites yet."
          }
          actionText="Explore Classes"
          actionLink="/classes"
        />
      ) : (
        <>
          <MotionSimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            spacing={6}
            variants={containerVariants}
          >
            {favorites.map((fitnessClass) => (
              <MotionCard
                key={fitnessClass.id}
                borderRadius="lg"
                overflow="hidden"
                bg={cardBg}
                borderWidth="1px"
                borderColor={cardBorder}
                boxShadow="md"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <CardHeader bg={headerBg} py={3} px={4}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Heading as="h3" size="md" noOfLines={1}>
                      {fitnessClass.name}
                    </Heading>
                    <FavoriteButton
                      fitnessClassId={fitnessClass.id}
                      className={fitnessClass.name}
                      initialIsFavorite={true}
                      size="sm"
                      onFavoriteChanged={(isFavorite) => {
                        if (!isFavorite) handleFavoriteRemoved(fitnessClass.id);
                      }}
                    />
                  </Flex>
                </CardHeader>

                <CardBody py={4}>
                  <VStack align="stretch" spacing={3}>
                    {fitnessClass.category && (
                      <Badge colorScheme="purple" alignSelf="flex-start">
                        {fitnessClass.category.name}
                      </Badge>
                    )}

                    <HStack>
                      <Icon as={FaChalkboardTeacher} color="purple.500" />
                      <Text fontSize="sm">
                        {fitnessClass.instructor
                          ? fitnessClass.instructor.name
                          : "Instructor TBA"}
                      </Text>
                    </HStack>

                    <HStack>
                      <Icon as={CalendarIcon} color="purple.500" />
                      <Text fontSize="sm">
                        {formatClassTime(fitnessClass.startsAt)}
                      </Text>
                    </HStack>

                    <HStack>
                      <Icon as={TimeIcon} color="purple.500" />
                      <Text fontSize="sm">
                        {format(new Date(fitnessClass.startsAt), "h:mm a")} -
                        {format(new Date(fitnessClass.endsAt), " h:mm a")}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>

                <CardFooter pt={0} pb={4} px={4}>
                  <Button
                    as={RouterLink}
                    to={`/classes/${fitnessClass.id}`}
                    colorScheme="purple"
                    size="sm"
                    width="100%"
                  >
                    View Details
                  </Button>
                </CardFooter>
              </MotionCard>
            ))}
          </MotionSimpleGrid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justifyContent="center" mt={8}>
              <HStack>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  isDisabled={currentPage === 1}
                  colorScheme="purple"
                  variant="outline"
                >
                  Previous
                </Button>
                <Text fontWeight="medium">
                  Page {currentPage} of {totalPages}
                </Text>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  isDisabled={currentPage === totalPages}
                  colorScheme="purple"
                  variant="outline"
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          )}
        </>
      )}
    </MotionContainer>
  );
};

export default Favorites;

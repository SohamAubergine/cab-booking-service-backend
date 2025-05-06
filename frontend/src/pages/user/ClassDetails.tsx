import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Badge,
  Divider,
  Card,
  CardBody,
  Spinner,
  useToast,
  Grid,
  GridItem,
  Icon,
  HStack,
  VStack,
  useColorModeValue,
  CardHeader,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { CalendarIcon, TimeIcon } from "@chakra-ui/icons";
import {
  FaChalkboardTeacher,
  FaRegCalendarAlt,
  FaArrowLeft,
  FaCheckCircle,
  FaUsers,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { format } from "date-fns";
import {
  fitnessClassService,
  bookingService,
  reviewService,
} from "../../services/api";
import { FitnessClass, Review, ClassRatingSummary } from "../../types";
import Loading from "../../components/Loading";
import ErrorDisplay from "../../components/ErrorDisplay";
import ReviewForm from "../../components/ReviewForm";
import ReviewDisplay from "../../components/ReviewDisplay";
import * as toastUtils from "../../utils/toast";
import { motion } from "framer-motion";
import FavoriteButton from "../../components/FavoriteButton";

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

const ClassDetails = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [fitnessClass, setFitnessClass] = useState<FitnessClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false);
  const [checkingBookingStatus, setCheckingBookingStatus] = useState(true);

  // Review-related state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState<ClassRatingSummary | null>(
    null
  );
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isClassPast, setIsClassPast] = useState(false);

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const cardHeaderBg = useColorModeValue("purple.50", "purple.900");
  const accentColor = "purple";

  // New function to check if a class has ended
  const checkIfClassHasEnded = (endsAt: string): boolean => {
    const endDate = new Date(endsAt);
    const now = new Date();
    return endDate < now;
  };

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!classId) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await fitnessClassService.getClassById(classId);

        if (response.success) {
          setFitnessClass(response.data);
          // Check if the class has already ended
          if (response.data.endsAt) {
            setIsClassPast(checkIfClassHasEnded(response.data.endsAt));
          }
        } else {
          setError(response.message);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch class details";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  // Check if user has already booked this class
  useEffect(() => {
    const checkBookingStatus = async () => {
      if (!classId) return;

      try {
        setCheckingBookingStatus(true);
        // Get user's bookings
        const response = await bookingService.getBookings(1, 100);

        if (response.success) {
          // Check if any booking matches this class ID
          const isBooked = response.data.data.some(
            (booking) => booking.fitnessClassId === classId
          );
          setIsAlreadyBooked(isBooked);
        }
      } catch (err) {
        console.error("Error checking booking status:", err);
        // Don't set error state, just assume not booked
        setIsAlreadyBooked(false);
      } finally {
        setCheckingBookingStatus(false);
      }
    };

    checkBookingStatus();
  }, [classId]);

  // New useEffect to fetch reviews and rating summary
  useEffect(() => {
    const fetchReviewData = async () => {
      if (!classId) return;

      try {
        setIsLoadingReviews(true);

        // Fetch class reviews
        const reviewsResponse = await reviewService.getClassReviews(classId);
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data.data);
        }

        // Fetch rating summary
        const summaryResponse = await reviewService.getClassRatingSummary(
          classId
        );
        if (summaryResponse.success) {
          setRatingSummary(summaryResponse.data);
        }

        // Fetch user's review if they've already submitted one
        const userReviewResponse = await reviewService.getUserReviewForClass(
          classId
        );
        if (userReviewResponse.success && userReviewResponse.data) {
          setUserReview(userReviewResponse.data);
        }
      } catch (err) {
        console.error("Error fetching review data:", err);
        // Don't set main error state, just log error
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviewData();
  }, [classId]);

  const handleBookClass = async () => {
    if (!classId || !fitnessClass) return;

    try {
      setIsBooking(true);
      const response = await fitnessClassService.bookClass(classId);

      if (response.success) {
        setIsAlreadyBooked(true);
        toast(toastUtils.bookingSuccessToast(fitnessClass.name));
      } else {
        toast(toastUtils.bookingErrorToast(response.message));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to book class";
      toast(toastUtils.errorToast("Booking Failed", errorMessage));
    } finally {
      setIsBooking(false);
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh reviews and summary after submitting a new review
    if (classId) {
      reviewService.getUserReviewForClass(classId).then((response) => {
        if (response.success && response.data) {
          setUserReview(response.data);
        }
      });

      reviewService.getClassReviews(classId).then((response) => {
        if (response.success) {
          setReviews(response.data.data);
        }
      });

      reviewService.getClassRatingSummary(classId).then((response) => {
        if (response.success) {
          setRatingSummary(response.data);
        }
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, MMMM dd, yyyy");
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
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

  if (isLoading) {
    return <Loading text="Loading class details..." />;
  }

  if (error || !fitnessClass) {
    return (
      <Container maxW="container.md" py={10}>
        <ErrorDisplay
          error={error || "Class not found"}
          title="Error Loading Class"
          mb={6}
        />
        <Button
          leftIcon={<FaArrowLeft />}
          colorScheme={accentColor}
          onClick={() => navigate("/classes")}
        >
          Back to Classes
        </Button>
      </Container>
    );
  }

  // Check if the class has already started or ended
  const now = new Date();
  const classStartsAt = new Date(fitnessClass.startsAt);
  const classEndsAt = new Date(fitnessClass.endsAt);
  const isClassStarted = classStartsAt <= now;
  const isClassEnded = classEndsAt <= now;

  return (
    <Container maxW="container.lg" py={8}>
      <Button
        leftIcon={<FaArrowLeft />}
        onClick={() => navigate(-1)}
        mb={4}
        size="sm"
        variant="outline"
      >
        Back
      </Button>

      {/* Tabs for Details and Reviews */}
      <Tabs mt={8} colorScheme="purple" variant="enclosed">
        <TabList>
          <Tab>Class Details</Tab>
          <Tab>
            Reviews &amp; Ratings{" "}
            {ratingSummary && (
              <Badge ml={2} colorScheme="purple">
                {ratingSummary.totalReviews}
              </Badge>
            )}
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <MotionBox
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
                {/* Left side: Class details */}
                <GridItem>
                  <MotionCard
                    variants={itemVariants}
                    bg={cardBg}
                    border="1px solid"
                    borderColor={cardBorder}
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="sm"
                  >
                    <CardHeader bg={cardHeaderBg} py={4}>
                      <Flex justifyContent="space-between" alignItems="center">
                        <Box>
                          <Heading as="h1" size="lg" color={headingColor}>
                            {fitnessClass.name}
                          </Heading>
                          {fitnessClass.category && (
                            <Badge
                              colorScheme={getCategoryColor(
                                fitnessClass.category.name
                              )}
                              mt={1}
                            >
                              {fitnessClass.category.name}
                            </Badge>
                          )}
                        </Box>
                        <FavoriteButton
                          fitnessClassId={classId || ""}
                          className={fitnessClass.name}
                          size="md"
                        />
                      </Flex>
                    </CardHeader>

                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        {/* Instructor */}
                        <MotionBox variants={itemVariants}>
                          <HStack spacing={3}>
                            <Icon
                              as={FaChalkboardTeacher}
                              boxSize={5}
                              color={`${accentColor}.500`}
                            />
                            <Box>
                              <Text fontWeight="bold" fontSize="sm">
                                Instructor
                              </Text>
                              <Text>
                                {fitnessClass.instructor
                                  ? fitnessClass.instructor.name
                                  : "No instructor assigned"}
                              </Text>
                            </Box>
                          </HStack>
                        </MotionBox>

                        {/* Date */}
                        <MotionBox variants={itemVariants}>
                          <HStack spacing={3}>
                            <Icon
                              as={FaRegCalendarAlt}
                              boxSize={5}
                              color={`${accentColor}.500`}
                            />
                            <Box>
                              <Text fontWeight="bold" fontSize="sm">
                                Date
                              </Text>
                              <Text>{formatDate(fitnessClass.startsAt)}</Text>
                            </Box>
                          </HStack>
                        </MotionBox>

                        {/* Time */}
                        <MotionBox variants={itemVariants}>
                          <HStack spacing={3}>
                            <Icon
                              as={TimeIcon}
                              boxSize={5}
                              color={`${accentColor}.500`}
                            />
                            <Box>
                              <Text fontWeight="bold" fontSize="sm">
                                Time
                              </Text>
                              <Text>
                                {formatTime(fitnessClass.startsAt)} -{" "}
                                {formatTime(fitnessClass.endsAt)}
                              </Text>
                            </Box>
                          </HStack>
                        </MotionBox>

                        {/* Capacity */}
                        <MotionBox variants={itemVariants}>
                          <HStack spacing={3}>
                            <Icon
                              as={FaUsers}
                              boxSize={5}
                              color={`${accentColor}.500`}
                            />
                            <Box>
                              <Text fontWeight="bold" fontSize="sm">
                                Capacity
                              </Text>
                              <Text>{fitnessClass.capacity} spots</Text>
                            </Box>
                          </HStack>
                        </MotionBox>

                        {/* Gym Information */}
                        {fitnessClass.gym && (
                          <MotionBox variants={itemVariants}>
                            <Divider my={3} />
                            <Box
                              p={4}
                              bg={useColorModeValue("teal.50", "teal.900")}
                              borderRadius="md"
                              boxShadow="sm"
                              borderLeft="4px solid"
                              borderColor="teal.400"
                            >
                              <Heading
                                as="h3"
                                size="sm"
                                mb={2}
                                color={useColorModeValue(
                                  "teal.700",
                                  "teal.200"
                                )}
                              >
                                Gym Location
                              </Heading>
                              <VStack align="stretch" spacing={2}>
                                <HStack spacing={3}>
                                  <Icon
                                    as={FaMapMarkerAlt}
                                    boxSize={5}
                                    color="teal.500"
                                  />
                                  <Box>
                                    <Text fontWeight="bold" fontSize="md">
                                      {fitnessClass.gym.name}
                                    </Text>
                                    <Text fontSize="sm">
                                      {fitnessClass.gym.address}
                                    </Text>
                                  </Box>
                                </HStack>
                                {fitnessClass.gym.latitude &&
                                  fitnessClass.gym.longitude && (
                                    <Button
                                      size="sm"
                                      leftIcon={<Icon as={FaMapMarkerAlt} />}
                                      variant="outline"
                                      colorScheme="teal"
                                      as="a"
                                      href={`https://maps.google.com/?q=${fitnessClass.gym.latitude},${fitnessClass.gym.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      mt={2}
                                    >
                                      Get Directions
                                    </Button>
                                  )}
                              </VStack>
                            </Box>
                          </MotionBox>
                        )}
                      </VStack>
                    </CardBody>
                  </MotionCard>
                </GridItem>

                {/* Right side: Booking status card */}
                <GridItem>
                  <MotionCard
                    variants={itemVariants}
                    bg={cardBg}
                    border="1px solid"
                    borderColor={cardBorder}
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="sm"
                  >
                    <CardHeader
                      bg={useColorModeValue("blue.50", "blue.900")}
                      py={4}
                    >
                      <Heading as="h3" size="md" color={headingColor}>
                        Booking Status
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      {checkingBookingStatus ? (
                        <Flex justifyContent="center" py={4}>
                          <Spinner />
                        </Flex>
                      ) : isAlreadyBooked ? (
                        <MotionBox
                          variants={itemVariants}
                          bg={useColorModeValue("green.50", "green.900")}
                          p={4}
                          borderRadius="md"
                        >
                          <HStack>
                            <Icon
                              as={FaCheckCircle}
                              color="green.500"
                              boxSize={5}
                            />
                            <Box>
                              <Text fontWeight="bold">You're all set!</Text>
                              <Text fontSize="sm">
                                You've already booked this class.
                              </Text>
                            </Box>
                          </HStack>
                        </MotionBox>
                      ) : isClassPast ? (
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Class has ended</AlertTitle>
                            <AlertDescription>
                              This class is no longer available for booking.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      ) : (
                        <VStack spacing={4} align="stretch">
                          <Text fontSize="sm" color={textColor}>
                            Reserve your spot in this class by clicking the
                            button below.
                          </Text>
                          <Button
                            colorScheme="blue"
                            size="lg"
                            width="full"
                            onClick={handleBookClass}
                            isLoading={isBooking}
                            loadingText="Booking..."
                          >
                            Book Class
                          </Button>
                        </VStack>
                      )}
                    </CardBody>
                  </MotionCard>
                </GridItem>
              </Grid>
            </MotionBox>
          </TabPanel>

          <TabPanel px={0}>
            <Stack spacing={6}>
              {/* Review form - only show if user has booked and class has ended */}
              {isAlreadyBooked && isClassPast && (
                <Box mb={6}>
                  <ReviewForm
                    fitnessClassId={classId || ""}
                    fitnessClassName={fitnessClass.name}
                    onReviewSubmitted={handleReviewSubmitted}
                    existingReview={userReview}
                  />
                </Box>
              )}

              {/* Show review data if available */}
              {isLoadingReviews ? (
                <Flex justify="center" py={8}>
                  <Spinner size="lg" />
                </Flex>
              ) : ratingSummary ? (
                <ReviewDisplay summary={ratingSummary} reviews={reviews} />
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <AlertTitle>No reviews yet</AlertTitle>
                  <AlertDescription>
                    Be the first to review this class after attending.
                  </AlertDescription>
                </Alert>
              )}
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default ClassDetails;

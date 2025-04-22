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
  chakra,
  useColorModeValue,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Divider,
  Avatar,
  Spinner,
  Tooltip,
  Alert,
  AlertIcon,
  Stack,
} from "@chakra-ui/react";
import {
  FaUsers,
  FaDumbbell,
  FaStar,
  FaCalendarAlt,
  FaChartLine,
  FaClock,
  FaExclamationCircle,
  FaCheckCircle,
  FaQuoteLeft,
  FaQuoteRight,
} from "react-icons/fa";
import { StarIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Link as RouterLink } from "react-router-dom";
import { instructorService } from "../../services/api";
import { FitnessClass, Review } from "../../types";
import { format, isBefore, isToday, isTomorrow, addDays } from "date-fns";
import { formatDate, getRelativeTimeString } from "../../utils/dateUtils";

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

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [upcomingClasses, setUpcomingClasses] = useState<FitnessClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const statBg = useColorModeValue("purple.50", "purple.900");
  const tableBg = useColorModeValue("white", "gray.800");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const tableRowHoverBg = useColorModeValue("gray.50", "gray.700");
  const buttonBgGradient = "linear(to-r, purple.600, pink.500)";
  const buttonHoverBgGradient = "linear(to-r, purple.700, pink.600)";

  // Fetch instructor's classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Verify the user is an instructor
        if (!user || user.role !== "INSTRUCTOR") {
          setError("Only instructors can view this dashboard");
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);
        const response = await instructorService.getInstructorClasses(1, 5);

        if (response.success) {
          // Sort by start date (closest first)
          const sortedClasses = response.data.data.sort(
            (a, b) =>
              new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
          );

          // Only include future classes
          const futureClasses = sortedClasses.filter(
            (c) => new Date(c.startsAt) > new Date()
          );

          setUpcomingClasses(futureClasses.slice(0, 3)); // Take first 3 upcoming classes
        } else {
          setError(response.message || "Failed to load classes");
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        if (err instanceof Error) {
          setError(`Error: ${err.message}`);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  // New useEffect to fetch instructor's reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Verify the user is an instructor
        if (!user || user.role !== "INSTRUCTOR") {
          return;
        }

        setIsLoadingReviews(true);
        const response = await instructorService.getInstructorReviews(1, 5);

        if (response.success) {
          setReviews(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching instructor reviews:", err);
        // We don't set error state here to avoid disrupting the entire dashboard
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [user]);

  // Format date for display
  const formatClassTime = (dateString: string) => {
    const date = new Date(dateString);
    let dayText = "";

    if (isToday(date)) {
      dayText = "Today";
    } else if (isTomorrow(date)) {
      dayText = "Tomorrow";
    } else {
      dayText = format(date, "MMM dd");
    }

    return `${dayText}, ${format(date, "h:mm a")}`;
  };

  // Calculate class duration in minutes
  const getClassDuration = (startsAt: string, endsAt: string) => {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    return `${durationMinutes} min`;
  };

  // Calculate the number of bookings for a class (bookings array length)
  const getEnrolledCount = (fitnessClass: FitnessClass) => {
    return fitnessClass.bookings?.length || 0; // Use optional chaining
  };

  // Get capacity status and color
  const getCapacityStatus = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;

    if (percentage >= 100) {
      return {
        color: "red",
        icon: FaExclamationCircle,
        text: "Full",
        colorScheme: "red",
      };
    } else if (percentage >= 80) {
      return {
        color: "orange",
        icon: FaExclamationCircle,
        text: "Nearly Full",
        colorScheme: "orange",
      };
    } else if (percentage >= 50) {
      return {
        color: "yellow",
        icon: null,
        text: "Filling Up",
        colorScheme: "yellow",
      };
    } else {
      return {
        color: "green",
        icon: FaCheckCircle,
        text: "Available",
        colorScheme: "green",
      };
    }
  };

  // Calculate average rating from reviews
  const calculateAverageRating = (): number => {
    if (!reviews.length) return 0;

    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  };

  // Mock data
  const totalStudents = 3;
  const activeClasses = 5;
  const bookingRate = 94;

  // Student data
  const topStudents = [
    { id: 1, name: "Sarah Johnson", classes: 24, lastClass: "2 days ago" },
    { id: 2, name: "Michael Brown", classes: 18, lastClass: "1 week ago" },
    { id: 3, name: "Emily Davis", classes: 15, lastClass: "4 days ago" },
  ];

  // New helper to render star rating
  const renderStarRating = (rating: number) => {
    return (
      <Flex>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            color={rating >= star ? "yellow.400" : "gray.200"}
            boxSize={3}
            mr={0.5}
          />
        ))}
      </Flex>
    );
  };

  // Helper to get a short excerpt from longer feedback text
  const getFeedbackExcerpt = (
    feedback: string | null,
    maxLength = 100
  ): string => {
    if (!feedback) return "";
    return feedback.length > maxLength
      ? `${feedback.substring(0, maxLength)}...`
      : feedback;
  };

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      pt={5}
      px={{ base: 4, md: 8 }}
      maxW="container.xl"
      mx="auto"
    >
      {/* Instructor Welcome */}
      <MotionBox variants={itemVariants} mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          Instructor Dashboard
        </Heading>
        <Text color={textColor}>
          Welcome back, {user?.name}. Here's an overview of your classes and
          performance.
        </Text>
      </MotionBox>

      {/* Stats Grid */}
      <MotionSimpleGrid
        columns={{ base: 1, md: 2, lg: 2 }}
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
            Total Students
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
            {totalStudents}
          </StatNumber>
          <StatHelpText>Across all classes</StatHelpText>
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
            <Icon as={FaStar} mr={2} color="purple.500" />
            Average Rating
          </StatLabel>
          {isLoadingReviews ? (
            <Flex alignItems="center" justifyContent="center" py={2}>
              <Spinner size="sm" color="purple.500" mr={2} />
              <Text fontSize="sm">Loading ratings...</Text>
            </Flex>
          ) : (
            <>
              <Flex alignItems="center">
                <StatNumber
                  fontSize="3xl"
                  fontWeight="bold"
                  color="purple.500"
                  mr={2}
                >
                  {reviews.length ? `${calculateAverageRating()}/5` : "N/A"}
                </StatNumber>
                {reviews.length > 0 && (
                  <Box>{renderStarRating(calculateAverageRating())}</Box>
                )}
              </Flex>
              <StatHelpText>
                {reviews.length > 0 ? (
                  <>
                    From {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </>
                ) : (
                  <>No reviews yet</>
                )}
              </StatHelpText>
            </>
          )}
        </Stat>
      </MotionSimpleGrid>

      {/* Main Content */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
        {/* Upcoming Classes */}
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
                  Upcoming Classes
                </Heading>
                <Text fontSize="sm" color={textColor}>
                  Your schedule for the next few days
                </Text>
              </Box>
              {/* <Button
                as={RouterLink}
                to="/instructor/classes"
                variant="outline"
                colorScheme="purple"
                leftIcon={<FaCalendarAlt />}
                size="sm"
              >
                All Classes
              </Button> */}
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Flex justify="center" align="center" py={10}>
                  <Spinner color="purple.500" size="xl" thickness="4px" />
                </Flex>
              ) : error ? (
                <Alert status="error" borderRadius="md" my={4}>
                  <AlertIcon />
                  <Text>{error}</Text>
                </Alert>
              ) : upcomingClasses.length === 0 ? (
                <Box
                  p={6}
                  textAlign="center"
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={cardBorder}
                  borderStyle="dashed"
                >
                  <Icon
                    as={FaCalendarAlt}
                    boxSize={8}
                    color="purple.500"
                    mb={3}
                  />
                  <Text fontWeight="medium" mb={2}>
                    No upcoming classes
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    You don't have any classes scheduled for the near future.
                  </Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {upcomingClasses.map((classItem) => {
                    const enrolled = getEnrolledCount(classItem);
                    const capacityStatus = getCapacityStatus(
                      enrolled,
                      classItem.capacity
                    );

                    return (
                      <Box
                        key={classItem.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={cardBorder}
                        _hover={{
                          bg: useColorModeValue("gray.50", "gray.700"),
                          transform: "translateY(-2px)",
                          transition: "all 0.2s",
                        }}
                      >
                        <HStack justify="space-between" mb={3}>
                          <Heading size="sm">{classItem.name}</Heading>
                          <HStack>
                            <Icon as={FaClock} color="purple.500" />
                            <Text fontSize="sm" fontWeight="medium">
                              {getClassDuration(
                                classItem.startsAt,
                                classItem.endsAt
                              )}
                            </Text>
                          </HStack>
                        </HStack>

                        <Text fontSize="sm" color={textColor} mb={3}>
                          {formatClassTime(classItem.startsAt)}
                        </Text>

                        <Box>
                          {/* Show warning if bookings data isn't available */}
                          {classItem.bookings === undefined ? (
                            <Tooltip label="Booking data is not available. Showing capacity only.">
                              <HStack color="yellow.500" mb={2} fontSize="xs">
                                <Icon as={FaExclamationCircle} />
                                <Text>Capacity: {classItem.capacity}</Text>
                              </HStack>
                            </Tooltip>
                          ) : (
                            <>
                              <HStack justify="space-between" mb={1}>
                                <HStack>
                                  <Text fontSize="xs" fontWeight="medium">
                                    {enrolled}/{classItem.capacity} students
                                  </Text>
                                  <Tooltip
                                    label={`${capacityStatus.text}: ${enrolled} out of ${classItem.capacity} spots filled`}
                                    placement="top"
                                  >
                                    <Badge
                                      colorScheme={capacityStatus.colorScheme}
                                      borderRadius="full"
                                      display="flex"
                                      alignItems="center"
                                      px={2}
                                      py={0.5}
                                    >
                                      {capacityStatus.icon && (
                                        <Icon
                                          as={capacityStatus.icon}
                                          boxSize={2.5}
                                          mr={1}
                                        />
                                      )}
                                      {capacityStatus.text}
                                    </Badge>
                                  </Tooltip>
                                </HStack>
                                <Text fontSize="xs" fontWeight="medium">
                                  {Math.round(
                                    (enrolled / classItem.capacity) * 100
                                  )}
                                  %
                                </Text>
                              </HStack>
                              <Progress
                                value={(enrolled / classItem.capacity) * 100}
                                size="sm"
                                colorScheme={capacityStatus.colorScheme}
                                borderRadius="full"
                              />
                              <Text fontSize="xs" mt={1} color={textColor}>
                                {classItem.capacity - enrolled} spots remaining
                              </Text>
                            </>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </VStack>
              )}
            </CardBody>
          </Card>

          {/* Top Students Section */}
          <Card
            bg={cardBg}
            borderWidth="1px"
            borderColor={cardBorder}
            borderRadius="lg"
            overflow="hidden"
            transition="all 0.3s"
            _hover={{ boxShadow: "md" }}
          >
            <CardHeader pb={0}>
              <Heading size="md" mb={2} color={headingColor}>
                Top Students
              </Heading>
              <Text fontSize="sm" color={textColor}>
                Your most engaged class attendees
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {topStudents.map((student) => (
                  <HStack
                    key={student.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={cardBorder}
                    _hover={{
                      bg: useColorModeValue("gray.50", "gray.700"),
                      transform: "translateY(-2px)",
                      transition: "all 0.2s",
                    }}
                  >
                    <Avatar size="sm" name={student.name} bg="purple.500" />
                    <Box flex="1">
                      <Text fontWeight="medium">{student.name}</Text>
                      <Text fontSize="sm" color={textColor}>
                        Last class: {student.lastClass}
                      </Text>
                    </Box>
                    <Badge
                      colorScheme="purple"
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      {student.classes} classes
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Recent Feedback */}
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
            <CardHeader pb={0}>
              <HStack spacing={2} mb={2}>
                <Icon as={FaStar} color="yellow.400" boxSize={5} />
                <Heading size="md" color={headingColor}>
                  Student Reviews
                </Heading>
              </HStack>
              <Text fontSize="sm" color={textColor}>
                What your students are saying about your classes
              </Text>
            </CardHeader>
            <CardBody>
              {isLoadingReviews ? (
                <Flex justify="center" align="center" py={10}>
                  <Spinner size="lg" color="purple.500" />
                </Flex>
              ) : reviews.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  {/* Show up to 5 reviews in this card */}
                  {reviews.slice(0, 5).map((review) => (
                    <Box
                      key={review.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={cardBorder}
                      _hover={{
                        bg: useColorModeValue("gray.50", "gray.700"),
                        transition: "all 0.2s",
                      }}
                    >
                      <HStack spacing={3} align="flex-start" mb={2}>
                        <Avatar
                          size="sm"
                          name={review.user?.name || "Student"}
                          bg="purple.500"
                        />
                        <Box flex="1">
                          <Flex justify="space-between" align="center">
                            <Text fontWeight="medium">
                              {review.user?.name || "Student"}
                            </Text>
                            <Badge colorScheme="purple" borderRadius="full">
                              {review.fitnessClass?.name || "Class"}
                            </Badge>
                          </Flex>
                          <HStack spacing={2} mt={1}>
                            {renderStarRating(review.rating)}
                            <Text fontSize="xs" color="gray.500">
                              {getRelativeTimeString(review.createdAt)}
                            </Text>
                          </HStack>
                        </Box>
                      </HStack>

                      {review.feedback && (
                        <Box mt={2} position="relative" pl={4} pr={4}>
                          <Icon
                            as={FaQuoteLeft}
                            position="absolute"
                            left={0}
                            top={0}
                            color="purple.200"
                            boxSize={3}
                            opacity={0.8}
                          />
                          <Text
                            fontSize="sm"
                            color={textColor}
                            fontStyle="italic"
                          >
                            {getFeedbackExcerpt(review.feedback)}
                          </Text>
                          <Icon
                            as={FaQuoteRight}
                            position="absolute"
                            right={0}
                            bottom={0}
                            color="purple.200"
                            boxSize={3}
                            opacity={0.8}
                          />
                        </Box>
                      )}
                    </Box>
                  ))}

                  <Button
                    as={RouterLink}
                    to="/instructor/reviews"
                    colorScheme="purple"
                    variant="outline"
                    alignSelf="flex-start"
                    mt={2}
                  >
                    View All Feedback
                  </Button>
                </VStack>
              ) : (
                <Box p={6} textAlign="center">
                  <Text color={textColor}>
                    No reviews yet for your classes.
                  </Text>
                  <Text fontSize="sm" mt={2}>
                    Reviews will appear here when students leave feedback for
                    your classes.
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>
        </MotionBox>
      </SimpleGrid>
    </MotionBox>
  );
};

export default InstructorDashboard;

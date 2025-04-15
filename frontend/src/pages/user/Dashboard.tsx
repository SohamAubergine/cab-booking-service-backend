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
  chakra,
  useColorModeValue,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaCalendarCheck,
  FaDumbbell,
  FaTrophy,
  FaHeart,
  FaSync,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { userService, bookingService } from "../../services/api";
import { Link as RouterLink } from "react-router-dom";
import { ActivityType, UserActivity } from "../../types";
import { format } from "date-fns";

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

const UserDashboard = () => {
  const { user } = useAuth();
  const [upcomingClasses, setUpcomingClasses] = useState<number>(0);
  const [completedClasses, setCompletedClasses] = useState<number>(0);
  const [fitnessScore, setFitnessScore] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState<boolean>(true);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const statBg = useColorModeValue("purple.50", "purple.900");
  const buttonBgGradient = "linear(to-r, purple.600, pink.500)";
  const buttonHoverBgGradient = "linear(to-r, purple.700, pink.600)";

  // Fetch user activity
  const fetchActivity = async () => {
    try {
      setIsActivityLoading(true);
      const response = await userService.getUserActivity(5);
      if (response.success) {
        setRecentActivity(response.data);
      }
    } catch (error) {
      console.error("Error fetching user activity:", error);
      // If there's an error, set empty array
      setRecentActivity([]);
    } finally {
      setIsActivityLoading(false);
    }
  };

  // Fetch basic stats
  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);

      // Get bookings for stats
      const bookingsResponse = await bookingService.getBookings(1, 100);

      if (bookingsResponse.success) {
        const bookings = bookingsResponse.data.data;
        const now = new Date();

        // Calculate upcoming classes (where class end time is in the future)
        const upcoming = bookings.filter(
          (booking) =>
            booking.fitnessClass && new Date(booking.fitnessClass.endsAt) > now
        ).length;

        // Calculate completed classes (where class end time is in the past)
        const completed = bookings.filter(
          (booking) =>
            booking.fitnessClass && new Date(booking.fitnessClass.endsAt) <= now
        ).length;

        // Set state values
        setUpcomingClasses(upcoming);
        setCompletedClasses(completed);

        // Calculate simple fitness score based on activity (just a demo calculation)
        // const score = Math.min(100, 50 + completed * 5);
        setFitnessScore(0);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      // Set default values
      setUpcomingClasses(0);
      setCompletedClasses(0);
      setFitnessScore(0);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchActivity();
    fetchStats();
  }, []);

  // Format date nicely
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  // Recommended classes (static for now - could be fetched from API in the future)
  const recommendedClasses = [
    {
      id: 1,
      title: "Advanced Yoga",
      instructor: "Jane Smith",
      duration: "60 min",
    },
    {
      id: 2,
      title: "CrossFit Basics",
      instructor: "Mike Johnson",
      duration: "45 min",
    },
  ];

  // Handle refresh of activity
  const handleRefreshActivity = () => {
    fetchActivity();
  };

  return (
    <MotionBox initial="hidden" animate="visible" variants={containerVariants}>
      {/* Welcome Section */}
      <MotionFlex variants={itemVariants} direction="column" mb={8}>
        <Heading as="h1" size="xl" mb={2} color={headingColor}>
          Welcome back, {user?.name}
        </Heading>
        <Text color={textColor}>
          Track your fitness journey and manage your workout schedule.
        </Text>
      </MotionFlex>

      {/* Stats Grid */}
      <MotionSimpleGrid
        columns={{ base: 1, md: 3 }}
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
            <Icon as={FaCalendarCheck} mr={2} color="purple.500" />
            Upcoming Classes
          </StatLabel>
          {isStatsLoading ? (
            <Spinner size="sm" color="purple.500" mt={2} />
          ) : (
            <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
              {upcomingClasses}
            </StatNumber>
          )}
          <StatHelpText>Classes this week</StatHelpText>
          <Button
            as={RouterLink}
            to="/my-bookings"
            size="sm"
            mt={2}
            variant="outline"
            colorScheme="purple"
          >
            View Bookings
          </Button>
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
            Completed Classes
          </StatLabel>
          {isStatsLoading ? (
            <Spinner size="sm" color="purple.500" mt={2} />
          ) : (
            <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
              {completedClasses}
            </StatNumber>
          )}
          <StatHelpText>Total classes completed</StatHelpText>
          <Button
            as={RouterLink}
            to="/my-bookings"
            size="sm"
            mt={2}
            variant="outline"
            colorScheme="purple"
          >
            View History
          </Button>
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
            <Icon as={FaTrophy} mr={2} color="purple.500" />
            Fitness Score (coming soon)
          </StatLabel>
          {isStatsLoading ? (
            <Spinner size="sm" color="purple.500" mt={2} />
          ) : (
            <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
              {fitnessScore}/100
            </StatNumber>
          )}
          <StatHelpText>Based on your activity</StatHelpText>
          <Button
            as={RouterLink}
            to="/classes"
            size="sm"
            mt={2}
            variant="outline"
            colorScheme="purple"
          >
            Improve Score
          </Button>
        </Stat>
      </MotionSimpleGrid>

      {/* Main Content */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Recommended Classes */}
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
              <Heading size="md" mb={2} color={headingColor}>
                Recommended Classes (coming soon)
              </Heading>
              <Text fontSize="sm" color={textColor}>
                Based on your previous activities
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {recommendedClasses.map((classItem) => (
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
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Heading size="sm">{classItem.title}</Heading>
                        <Text fontSize="sm" color={textColor}>
                          {classItem.instructor} • {classItem.duration}
                        </Text>
                      </VStack>
                      <Icon
                        as={FaHeart}
                        color="pink.400"
                        boxSize={5}
                        opacity={0.8}
                      />
                    </HStack>
                  </Box>
                ))}

                <Button
                  as={RouterLink}
                  to="/classes"
                  alignSelf="flex-start"
                  bgGradient={buttonBgGradient}
                  color="white"
                  _hover={{
                    bgGradient: buttonHoverBgGradient,
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  size="md"
                  mt={2}
                >
                  Browse All Classes
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Recent Activity */}
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
              <Flex justify="space-between" align="center">
                <Box>
                  <Heading size="md" mb={2} color={headingColor}>
                    Recent Activity
                  </Heading>
                  <Text fontSize="sm" color={textColor}>
                    Your latest actions and bookings
                  </Text>
                </Box>
                <Tooltip label="Refresh activity">
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="purple"
                    isLoading={isActivityLoading}
                    onClick={handleRefreshActivity}
                    aria-label="Refresh activity"
                  >
                    <Icon as={FaSync} />
                  </Button>
                </Tooltip>
              </Flex>
            </CardHeader>
            <CardBody>
              {isActivityLoading ? (
                <Flex justify="center" py={10}>
                  <Spinner size="lg" color="purple.500" />
                </Flex>
              ) : recentActivity.length === 0 ? (
                <Box textAlign="center" py={5}>
                  <Text color={textColor}>
                    No recent activity found. Book some classes to see your
                    activity here!
                  </Text>
                  <Button
                    as={RouterLink}
                    to="/classes"
                    colorScheme="purple"
                    variant="outline"
                    mt={4}
                  >
                    Browse Classes
                  </Button>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {recentActivity.map((activity) => (
                    <HStack
                      key={activity.id}
                      justify="space-between"
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={cardBorder}
                    >
                      <VStack align="start" spacing={0}>
                        <HStack>
                          <Icon
                            as={
                              activity.type === ActivityType.BOOKING
                                ? FaCalendarCheck
                                : FaDumbbell
                            }
                            color={
                              activity.type === ActivityType.BOOKING
                                ? "green.500"
                                : "blue.500"
                            }
                          />
                          <Text fontWeight="medium">{activity.title}</Text>
                        </HStack>
                        <Text fontSize="sm" color={textColor}>
                          {activity.type} on {formatDate(activity.date)}
                        </Text>
                      </VStack>
                      <chakra.span
                        px={2}
                        py={1}
                        bg={
                          activity.type === ActivityType.BOOKING
                            ? "green.100"
                            : "blue.100"
                        }
                        color={
                          activity.type === ActivityType.BOOKING
                            ? "green.700"
                            : "blue.700"
                        }
                        fontSize="xs"
                        fontWeight="bold"
                        rounded="md"
                        textTransform="uppercase"
                      >
                        {activity.type}
                      </chakra.span>
                    </HStack>
                  ))}

                  <Divider borderColor={cardBorder} />

                  <Button
                    as={RouterLink}
                    to="/my-bookings"
                    variant="outline"
                    colorScheme="purple"
                    alignSelf="flex-start"
                  >
                    View All Activity
                  </Button>
                </VStack>
              )}
            </CardBody>
          </Card>
        </MotionBox>
      </SimpleGrid>
    </MotionBox>
  );
};

export default UserDashboard;

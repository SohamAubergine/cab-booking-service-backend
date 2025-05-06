import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Spinner,
  Divider,
  useToast,
  Avatar,
  SimpleGrid,
  Icon,
  Badge,
  HStack,
  VStack,
  Tooltip,
  useColorModeValue,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/api";
import { User, UserRole } from "../../types";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaUserClock,
  FaCrown,
  FaDumbbell,
  FaUser,
} from "react-icons/fa";

// Create motion components
const MotionBox = motion(Box);
const MotionStack = motion(Stack);
const MotionCard = motion(Card);
const MotionFlex = motion(Flex);

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

const UserProfile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const highlightColor = useColorModeValue("purple.500", "purple.300");
  const avatarBg = useColorModeValue("purple.50", "purple.900");
  const badgeBg = useColorModeValue("purple.100", "purple.800");
  const badgeColor = useColorModeValue("purple.800", "purple.100");
  const inputBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser?.id) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await userService.getUserProfile(authUser.id);

        if (response.success) {
          setUser(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch user profile";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser?.id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided";

    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getRoleBadgeProps = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return {
          colorScheme: "red",
          icon: FaCrown,
          label: "Admin",
        };
      case UserRole.INSTRUCTOR:
        return {
          colorScheme: "green",
          icon: FaDumbbell,
          label: "Instructor",
        };
      case UserRole.USER:
      default:
        return {
          colorScheme: "purple",
          icon: FaUser,
          label: "Member",
        };
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={10}>
        <Flex justifyContent="center" alignItems="center" height="300px">
          <Spinner size="xl" color="purple.500" thickness="4px" />
        </Flex>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxW="container.md" py={10}>
        <MotionBox
          textAlign="center"
          p={10}
          borderRadius="lg"
          bg={useColorModeValue("red.50", "rgba(254, 178, 178, 0.1)")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Heading size="md" color="red.500" mb={4}>
            {error || "User profile not found"}
          </Heading>
          <Button
            onClick={() => window.location.reload()}
            colorScheme="purple"
            mt={4}
          >
            Try Again
          </Button>
        </MotionBox>
      </Container>
    );
  }

  // Get role badge properties based on user role
  const roleBadge = getRoleBadgeProps(user.role as UserRole);

  return (
    <Container maxW="container.md" py={10}>
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <MotionFlex variants={itemVariants} direction="column" mb={8}>
          <Heading as="h1" size="xl" mb={2} color={headingColor}>
            My Profile
          </Heading>
          <Text color={textColor}>
            View and manage your personal account information
          </Text>
        </MotionFlex>

        {/* Profile Card */}
        <MotionCard
          variants={itemVariants}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="xl"
          borderWidth="1px"
          borderColor={cardBorder}
          bg={cardBg}
          transition="all 0.3s"
          _hover={{ boxShadow: "lg" }}
          mb={8}
        >
          <Box bgGradient="linear(to-r, purple.600, pink.500)" py={8} px={6}>
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "center", md: "flex-start" }}
              justify="space-between"
            >
              <Flex align="center">
                <Avatar
                  size="2xl"
                  name={user.name}
                  bg={avatarBg}
                  color={highlightColor}
                  mr={{ base: 0, md: 6 }}
                  mb={{ base: 4, md: 0 }}
                  border="4px solid"
                  borderColor="white"
                />
                <VStack
                  align={{ base: "center", md: "flex-start" }}
                  spacing={2}
                  ml={{ base: 0, md: 4 }}
                >
                  <Heading size="xl" color="white">
                    {user.name}
                  </Heading>
                  <HStack spacing={3}>
                    <Badge
                      colorScheme={roleBadge.colorScheme}
                      px={3}
                      py={1}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      bg={badgeBg}
                      color={badgeColor}
                    >
                      <Icon as={roleBadge.icon} mr={1} />
                      {roleBadge.label}
                    </Badge>
                    <Badge
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg="green.100"
                      color="green.800"
                    >
                      Active Member
                    </Badge>
                  </HStack>
                </VStack>
              </Flex>
            </Flex>
          </Box>

          <CardBody p={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={0}>
              {/* Left Panel - Contact Info */}
              <Box
                p={6}
                borderRight={{ base: "none", md: "1px" }}
                borderColor={cardBorder}
              >
                <VStack align="stretch" spacing={6}>
                  <Heading size="md" color={headingColor} mb={2}>
                    Contact Information
                  </Heading>

                  <Grid templateColumns="auto 1fr" gap={4} alignItems="center">
                    <GridItem>
                      <Flex
                        alignItems="center"
                        justifyContent="center"
                        bg={avatarBg}
                        boxSize="40px"
                        borderRadius="lg"
                      >
                        <Icon
                          as={FaEnvelope}
                          color={highlightColor}
                          boxSize={5}
                        />
                      </Flex>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        Email Address
                      </Text>
                      <Text fontWeight="semibold" color={headingColor}>
                        {user.email}
                      </Text>
                    </GridItem>

                    <GridItem>
                      <Flex
                        alignItems="center"
                        justifyContent="center"
                        bg={avatarBg}
                        boxSize="40px"
                        borderRadius="lg"
                      >
                        <Icon as={FaPhone} color={highlightColor} boxSize={5} />
                      </Flex>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        Mobile Number
                      </Text>
                      <Text fontWeight="semibold" color={headingColor}>
                        {user.mobile || "Not provided"}
                      </Text>
                    </GridItem>
                  </Grid>
                </VStack>
              </Box>

              {/* Right Panel - Personal Info */}
              <Box p={6}>
                <VStack align="stretch" spacing={6}>
                  <Heading size="md" color={headingColor} mb={2}>
                    Personal Details
                  </Heading>

                  <Grid templateColumns="auto 1fr" gap={4} alignItems="center">
                    <GridItem>
                      <Flex
                        alignItems="center"
                        justifyContent="center"
                        bg={avatarBg}
                        boxSize="40px"
                        borderRadius="lg"
                      >
                        <Icon
                          as={FaMapMarkerAlt}
                          color={highlightColor}
                          boxSize={5}
                        />
                      </Flex>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        Address
                      </Text>
                      <Text fontWeight="semibold" color={headingColor}>
                        {user.address || "Not provided"}
                      </Text>
                    </GridItem>

                    <GridItem>
                      <Flex
                        alignItems="center"
                        justifyContent="center"
                        bg={avatarBg}
                        boxSize="40px"
                        borderRadius="lg"
                      >
                        <Icon
                          as={FaBirthdayCake}
                          color={highlightColor}
                          boxSize={5}
                        />
                      </Flex>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        Date of Birth
                      </Text>
                      <Text fontWeight="semibold" color={headingColor}>
                        {formatDate(user.dob)}
                      </Text>
                    </GridItem>

                    <GridItem>
                      <Flex
                        alignItems="center"
                        justifyContent="center"
                        bg={avatarBg}
                        boxSize="40px"
                        borderRadius="lg"
                      >
                        <Icon
                          as={FaUserClock}
                          color={highlightColor}
                          boxSize={5}
                        />
                      </Flex>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        Member Since
                      </Text>
                      <Text fontWeight="semibold" color={headingColor}>
                        {formatDate(user.createdAt)}
                      </Text>
                    </GridItem>
                  </Grid>
                </VStack>
              </Box>
            </SimpleGrid>

            <Divider borderColor={cardBorder} />

            {/* Actions */}
            <Flex p={6} justifyContent="center">
              <Button
                bgGradient="linear(to-r, purple.600, pink.500)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, purple.700, pink.600)",
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                _active={{
                  bgGradient: "linear(to-r, purple.800, pink.700)",
                }}
                size="lg"
                isDisabled
                px={8}
                leftIcon={<Icon as={FaUserClock} />}
              >
                Edit Profile (Coming Soon)
              </Button>
            </Flex>
          </CardBody>
        </MotionCard>

        {/* Membership Card */}
        <MotionCard
          variants={itemVariants}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
          bg="purple.700"
          bgGradient="linear(to-br, purple.600, purple.800, purple.900)"
          color="white"
          maxW="100%"
          p={6}
        >
          <HStack justify="space-between" align="center">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="sm" opacity={0.8}>
                Membership Status
              </Text>
              <Heading size="md">Premium Member (coming soon)</Heading>
            </VStack>
            <Flex bg="rgba(255, 255, 255, 0.2)" borderRadius="full" p={2}>
              <Icon as={FaCrown} boxSize={6} />
            </Flex>
          </HStack>
          <Text mt={6} fontSize="sm" opacity={0.8}>
            Enjoy unlimited access to all fitness classes and exclusive content.
          </Text>
        </MotionCard>
      </MotionBox>
    </Container>
  );
};

export default UserProfile;

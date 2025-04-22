import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  VStack,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import {
  FaDumbbell,
  FaHeartbeat,
  FaMedal,
  FaUserFriends,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useRef } from "react";

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionImage = motion(Image);
const MotionText = motion(Text);

const Home = () => {
  const { user } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax effect values
  const heroTextY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const featuresY = useTransform(scrollYProgress, [0.2, 0.8], [100, 0]);
  const testimonialsScale = useTransform(scrollYProgress, [0.6, 0.8], [0.9, 1]);

  // Colors
  const bgGradient = useColorModeValue(
    "linear(to-r, purple.500, pink.500)",
    "linear(to-r, purple.700, pink.700)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const buttonBg = useColorModeValue("purple.500", "purple.300");
  const buttonHoverBg = useColorModeValue("purple.600", "purple.400");
  const textColor = useColorModeValue("gray.700", "gray.100");
  const subheadingColor = useColorModeValue("gray.600", "gray.400");
  const floatingBg = useColorModeValue("white", "gray.800");

  const getActions = () => {
    if (!user) return [];

    const actions = [];

    switch (user.role) {
      case UserRole.ADMIN:
        actions.push({
          title: "Manage Classes",
          description: "Create, edit, and delete fitness classes.",
          link: "/admin/classes",
          linkText: "Manage Classes",
        });
        break;
      case UserRole.INSTRUCTOR:
        actions.push({
          title: "My Classes",
          description: "View and manage your assigned classes.",
          link: "/instructor/classes",
          linkText: "View My Classes",
        });
        break;
      case UserRole.USER:
        actions.push({
          title: "Browse Classes",
          description: "Explore and book available fitness classes.",
          link: "/classes",
          linkText: "Browse Classes",
        });
        actions.push({
          title: "My Bookings",
          description: "View your booked classes and schedule.",
          link: "/bookings",
          linkText: "View Bookings",
        });
        break;
    }

    return actions;
  };

  const actions = getActions();

  return (
    <MotionBox
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Floating Color Mode Toggle */}
      <MotionBox
        position="fixed"
        bottom={{ base: 4, md: 8 }}
        right={{ base: 4, md: 8 }}
        zIndex={100}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <IconButton
          aria-label={`Switch to ${
            colorMode === "light" ? "dark" : "light"
          } mode`}
          icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
          onClick={toggleColorMode}
          size={{ base: "md", md: "lg" }}
          isRound
          colorScheme={colorMode === "light" ? "purple" : "yellow"}
          boxShadow="lg"
          _hover={{
            transform: "scale(1.1)",
          }}
        />
      </MotionBox>

      {/* Hero Section */}
      <Box
        position="relative"
        height={{ base: "90vh", md: "100vh" }}
        overflow="hidden"
      >
        {/* Background Image with Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgImage="url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f')"
          bgSize="cover"
          bgPosition="center"
          _after={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: "blackAlpha.600",
            zIndex: 1,
          }}
        />

        {/* Header with Login/Signup CTAs */}
        <Flex
          position="absolute"
          top={0}
          left={0}
          right={0}
          zIndex={3}
          p={5}
          justifyContent="space-between"
          alignItems="center"
        >
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Heading as="h1" size="lg" color="white">
              FitBook
            </Heading>
          </MotionBox>

          <HStack spacing={4}>
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <IconButton
                aria-label={`Switch to ${
                  colorMode === "light" ? "dark" : "light"
                } mode`}
                icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
                onClick={toggleColorMode}
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                size="md"
              />
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                as={RouterLink}
                to="/login"
                size="md"
                variant="outline"
                colorScheme="whiteAlpha"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                _active={{ bg: "whiteAlpha.300" }}
                fontWeight="semibold"
                borderWidth="2px"
                borderColor="white"
              >
                Login
              </Button>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button
                as={RouterLink}
                to="/register"
                size="md"
                colorScheme="purple"
                _hover={{ bg: buttonHoverBg }}
              >
                Sign Up
              </Button>
            </MotionBox>
          </HStack>
        </Flex>

        {/* Hero Content */}
        <Flex
          position="relative"
          height="100%"
          zIndex={2}
          direction="column"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
          px={{ base: 6, md: 10 }}
        >
          <MotionBox style={{ y: heroTextY }}>
            <MotionText
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="medium"
              color="purple.100"
              mb={3}
            >
              TRANSFORM YOUR BODY • TRANSFORM YOUR LIFE
            </MotionText>

            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Heading
                as="h2"
                fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                fontWeight="bold"
                letterSpacing="tight"
                color="white"
                lineHeight="shorter"
                mb={6}
              >
                Elevate Your Fitness <br />
                <Text as="span" color="purple.300">
                  Journey
                </Text>
              </Heading>
            </MotionBox>

            <MotionText
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              fontSize={{ base: "md", md: "xl" }}
              color="gray.100"
              maxW="3xl"
              mb={10}
            >
              Book classes, track progress, and connect with fitness
              professionals all in one place. Your fitness journey begins with a
              single click.
            </MotionText>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <HStack spacing={5} justifyContent="center">
                <Button
                  as={RouterLink}
                  to="/register"
                  colorScheme="purple"
                  size="lg"
                  height="60px"
                  px={8}
                  fontSize="md"
                  fontWeight="bold"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                >
                  Get Started
                </Button>
                <Button
                  as={RouterLink}
                  to="/classes"
                  variant="outline"
                  colorScheme="whiteAlpha"
                  size="lg"
                  height="60px"
                  px={8}
                  fontSize="md"
                  fontWeight="bold"
                  color="white"
                  borderColor="white"
                  borderWidth="2px"
                  _hover={{
                    bg: "whiteAlpha.200",
                    transform: "translateY(-2px)",
                  }}
                >
                  Explore Classes
                </Button>
              </HStack>
            </MotionBox>
          </MotionBox>
        </Flex>

        {/* Animated scroll indicator */}
        <MotionBox
          position="absolute"
          bottom={10}
          left="50%"
          transform="translateX(-50%)"
          zIndex={2}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, 10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
        >
          <Box
            w="30px"
            h="50px"
            borderRadius="full"
            border="2px solid"
            borderColor="whiteAlpha.600"
            position="relative"
          >
            <Box
              position="absolute"
              w="6px"
              h="6px"
              bg="white"
              borderRadius="full"
              top="8px"
              left="50%"
              transform="translateX(-50%)"
            />
          </Box>
        </MotionBox>
      </Box>

      {/* Features Section */}
      <Box bg={useColorModeValue("gray.50", "gray.900")} py={20}>
        <Container maxW="container.xl">
          <MotionBox
            style={{ y: featuresY }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <VStack spacing={6} mb={20} textAlign="center">
              <Heading
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="bold"
                color={useColorModeValue("purple.700", "purple.200")}
                mb={2}
              >
                Why Choose FitBook
              </Heading>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                color={useColorModeValue("gray.700", "gray.300")}
                maxW="3xl"
              >
                Our platform is designed to make your fitness journey seamless,
                enjoyable, and motivating. Here's what sets us apart.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
              <FeatureCard
                icon={FaDumbbell}
                title="Premium Classes"
                description="Access to exclusive fitness classes led by certified instructors."
                delay={0.1}
              />
              <FeatureCard
                icon={FaHeartbeat}
                title="Health Tracking"
                description="Monitor your progress and health metrics in real-time."
                delay={0.3}
              />
              <FeatureCard
                icon={FaUserFriends}
                title="Community Support"
                description="Join a community of fitness enthusiasts to stay motivated."
                delay={0.5}
              />
              <FeatureCard
                icon={FaMedal}
                title="Achievement System"
                description="Earn badges and rewards as you reach fitness milestones."
                delay={0.7}
              />
            </SimpleGrid>
          </MotionBox>
        </Container>
      </Box>

      {/* Classes Showcase */}
      <Box py={20} bg={useColorModeValue("white", "gray.900")}>
        <Container maxW="container.xl">
          <VStack spacing={6} mb={16} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Heading
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="bold"
                color={useColorModeValue("purple.700", "purple.200")}
                mb={2}
              >
                Popular Classes
              </Heading>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Text
                fontSize={{ base: "md", md: "lg" }}
                color={useColorModeValue("gray.700", "gray.300")}
                maxW="3xl"
              >
                Explore our most sought-after fitness classes and start your
                journey today.
              </Text>
            </MotionBox>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            <ClassCard
              title="Yoga Flow"
              instructor="Sarah Johnson"
              image="https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b"
              category="Yoga"
              duration="60 min"
              level="All Levels"
              delay={0.1}
            />
            <ClassCard
              title="HIIT Challenge"
              instructor="Michael Brown"
              image="https://images.unsplash.com/photo-1549060279-7e168fcee0c2"
              category="Cardio"
              duration="45 min"
              level="Intermediate"
              delay={0.3}
            />
            <ClassCard
              title="Strength Training"
              instructor="Alex Rodriguez"
              image="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e"
              category="Strength"
              duration="50 min"
              level="Advanced"
              delay={0.5}
            />
          </SimpleGrid>

          <Flex justifyContent="center" mt={12}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Button
                as={RouterLink}
                to="/classes"
                size="lg"
                colorScheme="purple"
                bg={useColorModeValue("purple.500", "purple.400")}
                color="white"
                px={8}
                fontWeight="bold"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                  bg: useColorModeValue("purple.600", "purple.500"),
                }}
              >
                View All Classes
              </Button>
            </MotionBox>
          </Flex>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box bg={useColorModeValue("gray.50", "gray.900")} py={20}>
        <Container maxW="container.xl">
          <MotionBox style={{ scale: testimonialsScale }}>
            <VStack spacing={6} mb={16} textAlign="center">
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Heading
                  fontSize={{ base: "3xl", md: "4xl" }}
                  fontWeight="bold"
                  color={useColorModeValue("purple.700", "purple.200")}
                >
                  What Our Members Say
                </Heading>
              </MotionBox>
              <MotionBox
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  color={useColorModeValue("gray.700", "gray.300")}
                  maxW="3xl"
                >
                  Don't just take our word for it. Here's what our community has
                  to say.
                </Text>
              </MotionBox>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              <TestimonialCard
                quote="FitBook has transformed my fitness journey. The variety of classes and ease of booking keeps me motivated and consistent."
                name="Emma Richardson"
                position="Member since 2022"
                avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                delay={0.1}
              />
              <TestimonialCard
                quote="As an instructor, FitBook makes it easy to connect with students and manage my class schedule. The platform is intuitive and user-friendly."
                name="David Chen"
                position="Yoga Instructor"
                avatar="https://images.unsplash.com/photo-1599566150163-29194dcaad36"
                delay={0.3}
              />
              <TestimonialCard
                quote="I've tried many fitness platforms, but FitBook stands out with its community feel and high-quality classes. My fitness journey has never been better!"
                name="Sophia Martinez"
                position="Member since 2021"
                avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956"
                delay={0.5}
              />
            </SimpleGrid>
          </MotionBox>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} bg={useColorModeValue("gray.50", "gray.900")}>
        <Container maxW="container.lg">
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              justify="space-between"
              bg={useColorModeValue(
                "linear(to-r, purple.700, pink.600)",
                "linear(to-r, purple.900, purple.700)"
              )}
              borderRadius="xl"
              overflow="hidden"
              p={{ base: 10, md: 16 }}
              shadow="xl"
              borderWidth="1px"
              borderColor={useColorModeValue("transparent", "gray.700")}
            >
              <Box maxW={{ md: "60%" }}>
                <Heading
                  fontSize={{ base: "3xl", md: "4xl" }}
                  // fontWeight="extrabold"
                  mb={4}
                  textShadow="0 2px 4px rgba(0,0,0,0.2)"
                  letterSpacing="tight"
                  color="gray.500"
                  _dark={{
                    bgGradient: "linear(to-r, yellow.200, purple.200)",
                    bgClip: "text",
                    color: "transparent",
                  }}
                >
                  Ready to Start Your Fitness Journey?
                </Heading>
                <Text
                  fontSize={{ base: "md", md: "xl" }}
                  mb={6}
                  fontWeight="semibold"
                  letterSpacing="wide"
                  color="gray.600"
                  _dark={{ color: "white" }}
                >
                  Join FitBook today and get access to premium classes, expert
                  instructors, and a supportive community.
                </Text>
                <Button
                  as={RouterLink}
                  to="/register"
                  size="lg"
                  bg={useColorModeValue("white", "gray.100")}
                  color={useColorModeValue("purple.700", "purple.800")}
                  px={8}
                  fontWeight="bold"
                  _hover={{
                    bg: useColorModeValue("gray.100", "white"),
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  boxShadow="md"
                >
                  Sign Up Now
                </Button>
              </Box>
              <MotionBox
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
                display={{ base: "none", md: "block" }}
              >
                <Box position="relative" width="300px" height="300px">
                  <MotionBox
                    position="absolute"
                    width="full"
                    height="full"
                    borderRadius="full"
                    bg="whiteAlpha.300"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                    }}
                  />
                  <MotionImage
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"
                    alt="Fitness"
                    borderRadius="full"
                    objectFit="cover"
                    boxSize="300px"
                    animate={{
                      rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 8,
                      ease: "easeInOut",
                    }}
                  />
                </Box>
              </MotionBox>
            </Flex>
          </MotionBox>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        bg={useColorModeValue("gray.100", "gray.900")}
        color={useColorModeValue("gray.700", "gray.200")}
        py={12}
        borderTopWidth="1px"
        borderColor={useColorModeValue("gray.200", "gray.700")}
      >
        <Container maxW="container.xl">
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={{ base: 8, md: 4 }}
            justify="space-between"
            align={{ base: "start", md: "center" }}
          >
            <Box>
              <Heading
                as="h3"
                size="lg"
                mb={2}
                color={useColorModeValue("purple.600", "purple.300")}
              >
                FitBook
              </Heading>
              <Text color={useColorModeValue("gray.600", "gray.400")}>
                Your ultimate fitness companion
              </Text>
            </Box>
            <HStack spacing={6} align="start">
              <VStack align="start">
                <Text
                  fontWeight="bold"
                  mb={2}
                  color={useColorModeValue("gray.700", "gray.200")}
                >
                  Quick Links
                </Text>
                <Link
                  as={RouterLink}
                  to="/classes"
                  color={useColorModeValue("gray.600", "gray.400")}
                  _hover={{
                    color: useColorModeValue("purple.600", "purple.300"),
                  }}
                >
                  Classes
                </Link>
                <Link
                  as={RouterLink}
                  to="/instructors"
                  color={useColorModeValue("gray.600", "gray.400")}
                  _hover={{
                    color: useColorModeValue("purple.600", "purple.300"),
                  }}
                >
                  Instructors
                </Link>
                <Link
                  as={RouterLink}
                  to="/about"
                  color={useColorModeValue("gray.600", "gray.400")}
                  _hover={{
                    color: useColorModeValue("purple.600", "purple.300"),
                  }}
                >
                  About Us
                </Link>
              </VStack>
              <VStack align="start">
                <Text
                  fontWeight="bold"
                  mb={2}
                  color={useColorModeValue("gray.700", "gray.200")}
                >
                  Support
                </Text>
                <Link
                  as={RouterLink}
                  to="/faq"
                  color={useColorModeValue("gray.600", "gray.400")}
                  _hover={{
                    color: useColorModeValue("purple.600", "purple.300"),
                  }}
                >
                  FAQ
                </Link>
                <Link
                  as={RouterLink}
                  to="/contact"
                  color={useColorModeValue("gray.600", "gray.400")}
                  _hover={{
                    color: useColorModeValue("purple.600", "purple.300"),
                  }}
                >
                  Contact Us
                </Link>
                <Link
                  as={RouterLink}
                  to="/privacy"
                  color={useColorModeValue("gray.600", "gray.400")}
                  _hover={{
                    color: useColorModeValue("purple.600", "purple.300"),
                  }}
                >
                  Privacy Policy
                </Link>
              </VStack>
            </HStack>
          </Stack>
          <Text
            mt={10}
            fontSize="sm"
            color={useColorModeValue("gray.600", "gray.400")}
            textAlign="center"
          >
            © {new Date().getFullYear()} FitBook. All rights reserved.
          </Text>
        </Container>
      </Box>
    </MotionBox>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.7 }}
    >
      <VStack
        bg={useColorModeValue("white", "gray.800")}
        p={8}
        borderRadius="lg"
        shadow="md"
        textAlign="center"
        spacing={4}
        height="100%"
        borderWidth="1px"
        borderColor={useColorModeValue("gray.100", "gray.700")}
        _hover={{
          transform: "translateY(-5px)",
          shadow: useColorModeValue("lg", "dark-lg"),
          transition: "all 0.3s ease",
          borderColor: useColorModeValue("gray.200", "gray.600"),
        }}
      >
        <Box
          bg={useColorModeValue("purple.100", "purple.800")}
          p={4}
          borderRadius="full"
          color={useColorModeValue("purple.700", "purple.200")}
          boxShadow="0 4px 6px rgba(160, 174, 192, 0.1)"
        >
          <Icon as={icon} boxSize={8} />
        </Box>
        <Heading
          as="h3"
          size="md"
          fontWeight="bold"
          color={useColorModeValue("purple.700", "purple.200")}
        >
          {title}
        </Heading>
        <Text
          color={useColorModeValue("gray.700", "gray.300")}
          fontSize="md"
          lineHeight="tall"
        >
          {description}
        </Text>
      </VStack>
    </MotionBox>
  );
};

// Class Card Component
interface ClassCardProps {
  title: string;
  instructor: string;
  image: string;
  category: string;
  duration: string;
  level: string;
  delay: number;
}

const ClassCard = ({
  title,
  instructor,
  image,
  category,
  duration,
  level,
  delay,
}: ClassCardProps) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.7 }}
      whileHover={{ y: -10 }}
    >
      <Box
        bg={useColorModeValue("white", "gray.800")}
        shadow="md"
        borderRadius="lg"
        overflow="hidden"
        height="100%"
        borderWidth="1px"
        borderColor={useColorModeValue("gray.100", "gray.700")}
        _hover={{
          shadow: useColorModeValue("lg", "dark-lg"),
          borderColor: useColorModeValue("gray.200", "gray.600"),
        }}
      >
        <Box position="relative" h="200px" overflow="hidden">
          <Image
            src={image}
            alt={title}
            objectFit="cover"
            w="100%"
            h="100%"
            transition="transform 0.3s ease"
            _groupHover={{ transform: "scale(1.05)" }}
            opacity={useColorModeValue(1, 0.9)}
          />
          <Box
            position="absolute"
            top={3}
            right={3}
            bg={useColorModeValue("purple.500", "purple.300")}
            color={useColorModeValue("white", "gray.900")}
            py={1}
            px={3}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
            boxShadow="0 2px 4px rgba(0,0,0,0.1)"
          >
            {category}
          </Box>
        </Box>
        <Box p={5}>
          <Heading
            as="h3"
            size="md"
            mb={2}
            color={useColorModeValue("purple.700", "purple.200")}
          >
            {title}
          </Heading>
          <Text
            color={useColorModeValue("gray.600", "gray.300")}
            fontSize="sm"
            mb={3}
            fontWeight="medium"
          >
            Instructor: {instructor}
          </Text>
          <Flex justify="space-between" align="center">
            <Text
              fontSize="sm"
              color={useColorModeValue("gray.600", "gray.300")}
            >
              {duration}
            </Text>
            <Text
              fontSize="sm"
              color={useColorModeValue("gray.600", "gray.300")}
              fontWeight="medium"
            >
              {level}
            </Text>
          </Flex>
          <Button
            mt={4}
            colorScheme={useColorModeValue("purple", "purple")}
            bg={useColorModeValue("purple.500", "purple.400")}
            color="white"
            size="sm"
            width="full"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "md",
              bg: useColorModeValue("purple.600", "purple.500"),
            }}
          >
            Book Now
          </Button>
        </Box>
      </Box>
    </MotionBox>
  );
};

// Testimonial Card Component
interface TestimonialCardProps {
  quote: string;
  name: string;
  position: string;
  avatar: string;
  delay: number;
}

const TestimonialCard = ({
  quote,
  name,
  position,
  avatar,
  delay,
}: TestimonialCardProps) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.7 }}
    >
      <Box
        bg={useColorModeValue("white", "gray.800")}
        p={8}
        borderRadius="lg"
        shadow="md"
        position="relative"
        zIndex={1}
        borderWidth="1px"
        borderColor={useColorModeValue("gray.100", "gray.700")}
        _hover={{
          shadow: useColorModeValue("lg", "dark-lg"),
          transform: "translateY(-5px)",
          transition: "all 0.3s ease",
          borderColor: useColorModeValue("gray.200", "gray.600"),
        }}
        _before={{
          content: '""',
          position: "absolute",
          top: 4,
          left: 4,
          right: 4,
          bottom: 4,
          borderRadius: "lg",
          border: "1px solid",
          borderColor: useColorModeValue("purple.100", "purple.600"),
          zIndex: -1,
          opacity: useColorModeValue(1, 0.6),
        }}
      >
        <Box
          mb={6}
          fontSize="4xl"
          color={useColorModeValue("purple.500", "purple.300")}
          fontFamily="Georgia, serif"
        >
          "
        </Box>
        <Text
          mb={6}
          fontSize="md"
          fontStyle="italic"
          color={useColorModeValue("gray.700", "gray.200")}
          lineHeight="taller"
        >
          {quote}
        </Text>
        <Flex align="center">
          <Image
            src={avatar}
            alt={name}
            boxSize="50px"
            borderRadius="full"
            mr={4}
            objectFit="cover"
            border="2px solid"
            borderColor={useColorModeValue("purple.100", "purple.500")}
            opacity={useColorModeValue(1, 0.9)}
          />
          <Box>
            <Text
              fontWeight="bold"
              color={useColorModeValue("gray.800", "white")}
            >
              {name}
            </Text>
            <Text
              fontSize="sm"
              color={useColorModeValue("purple.600", "purple.300")}
              fontWeight="medium"
            >
              {position}
            </Text>
          </Box>
        </Flex>
      </Box>
    </MotionBox>
  );
};

export default Home;

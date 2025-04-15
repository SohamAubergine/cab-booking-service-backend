import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Link,
  Text,
  FormErrorMessage,
  Alert,
  AlertIcon,
  Radio,
  RadioGroup,
  InputGroup,
  InputRightElement,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Heading,
  useColorModeValue,
  VStack,
  Divider,
  Icon,
  Flex,
  Container,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";
import { RegisterRequest } from "../../types";
import { motion } from "framer-motion";
import {
  FaUser,
  FaDumbbell,
  FaMobileAlt,
  FaHome,
  FaBirthdayCake,
} from "react-icons/fa";

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
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

// Create motion components
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionFlex = motion(Flex);

// Register form validation schema
const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
  role: z.enum(["USER", "INSTRUCTOR"]),
  mobile: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const linkColor = useColorModeValue("purple.600", "purple.300");
  const tabBorderColor = useColorModeValue("gray.200", "gray.600");
  const dividerColor = useColorModeValue("gray.200", "gray.700");
  const iconBg = useColorModeValue("purple.50", "purple.900");
  const iconColor = useColorModeValue("purple.500", "purple.300");
  const buttonBgGradient = "linear(to-r, purple.600, pink.500)";
  const buttonHoverBgGradient = "linear(to-r, purple.700, pink.600)";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "USER",
    },
  });

  const selectedRole = watch("role");

  // Handle tab change to update role
  const handleTabChange = (index: number) => {
    const role = index === 0 ? "USER" : "INSTRUCTOR";
    setValue("role", role);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await registerUser(data as RegisterRequest);

      // Redirect based on user role
      switch (data.role) {
        case "INSTRUCTOR":
          navigate("/instructor/dashboard");
          break;
        case "USER":
        default:
          navigate("/user/dashboard");
          break;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to register";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        w="100%"
        mx="auto"
        maxW="600px"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <MotionBox
            variants={itemVariants}
            p={8}
            borderWidth="1px"
            borderRadius="xl"
            borderColor={borderColor}
            boxShadow="xl"
            bg={cardBg}
            transition="all 0.3s ease"
            _hover={{ boxShadow: "2xl", transform: "translateY(-5px)" }}
          >
            <MotionVStack spacing={8} variants={containerVariants}>
              <MotionBox
                variants={itemVariants}
                textAlign="center"
                width="100%"
              >
                <Heading
                  as="h1"
                  size="xl"
                  color={headingColor}
                  letterSpacing="tight"
                  mb={2}
                  bgGradient="linear(to-r, purple.600, pink.500)"
                  bgClip="text"
                >
                  Join FitBook Today
                </Heading>
                <Text fontSize="md" color={textColor}>
                  Create your account and start your fitness journey
                </Text>
              </MotionBox>

              <MotionBox variants={itemVariants} width="100%">
                <Tabs
                  isFitted
                  colorScheme="purple"
                  onChange={handleTabChange}
                  variant="soft-rounded"
                  borderColor={tabBorderColor}
                >
                  <TabList mb={6} gap={4}>
                    <Tab
                      _selected={{
                        color: "white",
                        bg: "purple.500",
                        fontWeight: "semibold",
                      }}
                      borderRadius="full"
                      px={8}
                      py={3}
                      transition="all 0.2s"
                      fontSize="md"
                      fontWeight="medium"
                    >
                      <Icon as={FaUser} mr={2} />
                      User
                    </Tab>
                    <Tab
                      _selected={{
                        color: "white",
                        bg: "purple.500",
                        fontWeight: "semibold",
                      }}
                      borderRadius="full"
                      px={8}
                      py={3}
                      transition="all 0.2s"
                      fontSize="md"
                      fontWeight="medium"
                    >
                      <Icon as={FaDumbbell} mr={2} />
                      Instructor
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel p={0}>
                      <Flex
                        p={4}
                        borderRadius="lg"
                        bg={iconBg}
                        mb={6}
                        alignItems="center"
                      >
                        <Icon
                          as={FaUser}
                          boxSize={5}
                          color={iconColor}
                          mr={3}
                        />
                        <Text fontSize="md" color={textColor}>
                          Sign up as a user to book fitness classes and track
                          your progress.
                        </Text>
                      </Flex>
                    </TabPanel>
                    <TabPanel p={0}>
                      <Flex
                        p={4}
                        borderRadius="lg"
                        bg={iconBg}
                        mb={6}
                        alignItems="center"
                      >
                        <Icon
                          as={FaDumbbell}
                          boxSize={5}
                          color={iconColor}
                          mr={3}
                        />
                        <Text fontSize="md" color={textColor}>
                          Sign up as an instructor to create and manage fitness
                          classes.
                        </Text>
                      </Flex>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </MotionBox>

              {error && (
                <MotionBox variants={itemVariants} width="100%">
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                </MotionBox>
              )}

              <MotionFlex
                variants={itemVariants}
                width="100%"
                direction={{ base: "column", md: "row" }}
                gap={6}
              >
                <FormControl isInvalid={!!errors.name} flex="1">
                  <FormLabel fontWeight="medium">Full Name</FormLabel>
                  <Input
                    placeholder="John Doe"
                    size="lg"
                    borderRadius="md"
                    focusBorderColor="purple.400"
                    {...register("name")}
                  />
                  {errors.name && (
                    <FormErrorMessage>{errors.name.message}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.email} flex="1">
                  <FormLabel fontWeight="medium">Email Address</FormLabel>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    size="lg"
                    borderRadius="md"
                    focusBorderColor="purple.400"
                    {...register("email")}
                  />
                  {errors.email && (
                    <FormErrorMessage>{errors.email.message}</FormErrorMessage>
                  )}
                </FormControl>
              </MotionFlex>

              <MotionBox variants={itemVariants} width="100%">
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel fontWeight="medium">Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      focusBorderColor="purple.400"
                      borderRadius="md"
                      {...register("password")}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="sm"
                        color="gray.500"
                        _hover={{ color: "purple.500" }}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {errors.password && (
                    <FormErrorMessage>
                      {errors.password.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              </MotionBox>

              <Box display="none">
                <RadioGroup value={selectedRole}>
                  <Radio value="USER" {...register("role")}>
                    User
                  </Radio>
                  <Radio value="INSTRUCTOR" {...register("role")}>
                    Instructor
                  </Radio>
                </RadioGroup>
              </Box>

              <MotionBox variants={itemVariants} width="100%">
                <Divider my={2} borderColor={dividerColor} />
                <Text fontWeight="semibold" mb={3} mt={3} color={headingColor}>
                  Optional Information
                </Text>
              </MotionBox>

              <MotionFlex
                variants={itemVariants}
                width="100%"
                direction={{ base: "column", md: "row" }}
                gap={6}
              >
                <FormControl isInvalid={!!errors.mobile} flex="1">
                  <FormLabel fontWeight="medium">
                    <Flex align="center">
                      <Icon as={FaMobileAlt} mr={2} color={iconColor} />
                      Mobile Number
                    </Flex>
                  </FormLabel>
                  <Input
                    placeholder="Your mobile number"
                    size="lg"
                    borderRadius="md"
                    focusBorderColor="purple.400"
                    {...register("mobile")}
                  />
                  {errors.mobile && (
                    <FormErrorMessage>{errors.mobile.message}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.dob} flex="1">
                  <FormLabel fontWeight="medium">
                    <Flex align="center">
                      <Icon as={FaBirthdayCake} mr={2} color={iconColor} />
                      Date of Birth
                    </Flex>
                  </FormLabel>
                  <Input
                    type="date"
                    size="lg"
                    borderRadius="md"
                    focusBorderColor="purple.400"
                    {...register("dob")}
                  />
                  {errors.dob && (
                    <FormErrorMessage>{errors.dob.message}</FormErrorMessage>
                  )}
                </FormControl>
              </MotionFlex>

              <MotionBox variants={itemVariants} width="100%">
                <FormControl isInvalid={!!errors.address}>
                  <FormLabel fontWeight="medium">
                    <Flex align="center">
                      <Icon as={FaHome} mr={2} color={iconColor} />
                      Address
                    </Flex>
                  </FormLabel>
                  <Input
                    placeholder="Your address"
                    size="lg"
                    borderRadius="md"
                    focusBorderColor="purple.400"
                    {...register("address")}
                  />
                  {errors.address && (
                    <FormErrorMessage>
                      {errors.address.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              </MotionBox>

              <MotionBox variants={itemVariants} width="100%" mt={2}>
                <Button
                  type="submit"
                  w="100%"
                  size="lg"
                  isLoading={isLoading}
                  bgGradient={buttonBgGradient}
                  color="white"
                  _hover={{
                    bgGradient: buttonHoverBgGradient,
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  _active={{
                    bgGradient: buttonHoverBgGradient,
                    transform: "translateY(0)",
                  }}
                  boxShadow="md"
                  transition="all 0.3s ease"
                  height="60px"
                  fontSize="lg"
                  borderRadius="xl"
                >
                  Create Account
                </Button>
              </MotionBox>

              <MotionBox
                variants={itemVariants}
                width="100%"
                textAlign="center"
              >
                <Text color={textColor}>
                  Already have an account?{" "}
                  <Link
                    as={RouterLink}
                    to="/login"
                    color={linkColor}
                    fontWeight="semibold"
                    _hover={{
                      textDecoration: "none",
                      color: useColorModeValue("purple.700", "purple.200"),
                    }}
                  >
                    Login Here
                  </Link>
                </Text>
              </MotionBox>
            </MotionVStack>
          </MotionBox>
        </form>
      </MotionBox>
    </Container>
  );
};

export default Register;

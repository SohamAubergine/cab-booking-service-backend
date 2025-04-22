import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Link,
  Text,
  FormErrorMessage,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  Box,
  Heading,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";
import { LoginRequest, UserRole } from "../../types";
import { motion } from "framer-motion";

// Framer motion variants
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

// Create motion components
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const linkColor = useColorModeValue("purple.600", "purple.300");
  const buttonBgGradient = "linear(to-r, purple.600, pink.500)";
  const buttonHoverBgGradient = "linear(to-r, purple.700, pink.600)";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const authResponse = await login(data as LoginRequest);

      // Redirect based on user role
      if (authResponse?.user?.role) {
        switch (authResponse.user.role) {
          case UserRole.ADMIN:
            navigate("/admin/dashboard");
            break;
          case UserRole.INSTRUCTOR:
            navigate("/instructor/dashboard");
            break;
          case UserRole.USER:
            navigate("/user/dashboard");
            break;
          default:
            navigate("/dashboard");
        }
      } else {
        navigate("/dashboard"); // Fallback to role-based redirect
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to login";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      w="100%"
      mx="auto"
      maxW="450px"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <MotionBox
          variants={itemVariants}
          p={8}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          boxShadow="xl"
          bg={cardBg}
          transition="all 0.3s ease"
          _hover={{ boxShadow: "2xl", transform: "translateY(-5px)" }}
        >
          <MotionVStack spacing={6} variants={containerVariants}>
            <MotionBox variants={itemVariants}>
              <Heading
                as="h1"
                size="xl"
                textAlign="center"
                color={headingColor}
                letterSpacing="tight"
                mb={2}
              >
                Welcome Back
              </Heading>
              <Text fontSize="md" textAlign="center" color={textColor}>
                Sign in to access your account
              </Text>
            </MotionBox>

            {error && (
              <MotionBox variants={itemVariants} w="100%">
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              </MotionBox>
            )}

            <MotionBox variants={itemVariants} w="100%">
              <FormControl isInvalid={!!errors.email}>
                <FormLabel fontWeight="medium">Email address</FormLabel>
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
            </MotionBox>

            <MotionBox variants={itemVariants} w="100%">
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
                  <FormErrorMessage>{errors.password.message}</FormErrorMessage>
                )}
              </FormControl>
            </MotionBox>

            <MotionBox variants={itemVariants} w="100%">
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
              >
                Sign In
              </Button>
            </MotionBox>

            <MotionBox variants={itemVariants} w="100%" textAlign="center">
              <Text color={textColor}>
                Don't have an account?{" "}
                <Link
                  as={RouterLink}
                  to="/register"
                  color={linkColor}
                  fontWeight="semibold"
                  _hover={{
                    textDecoration: "none",
                    color: useColorModeValue("purple.700", "purple.200"),
                  }}
                >
                  Register Here
                </Link>
              </Text>
            </MotionBox>
          </MotionVStack>
        </MotionBox>
      </form>
    </MotionBox>
  );
};

export default Login;

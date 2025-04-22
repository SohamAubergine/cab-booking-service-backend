import { Outlet, Link } from "react-router-dom";
import {
  Box,
  Flex,
  Container,
  Heading,
  IconButton,
  useColorMode,
  useColorModeValue,
  Text,
  chakra,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon, StarIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionIconButton = motion(IconButton);

// Logo component
const Logo = () => {
  return (
    <chakra.span
      fontWeight="bold"
      fontSize="xl"
      bgGradient="linear(to-r, purple.500, pink.500)"
      bgClip="text"
      letterSpacing="tight"
      display="flex"
      alignItems="center"
    >
      <Box mr={1}>
        <StarIcon color="purple.500" />
      </Box>
      FitBook
    </chakra.span>
  );
};

const AuthLayout = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const bgPattern = useColorModeValue(
    "radial-gradient(circle at 25px 25px, rgba(128, 90, 213, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(128, 90, 213, 0.05) 2%, transparent 0%)",
    "radial-gradient(circle at 25px 25px, rgba(128, 90, 213, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(128, 90, 213, 0.1) 2%, transparent 0%)"
  );
  const bgSize = "50px 50px";
  const textColor = useColorModeValue("gray.600", "gray.400");
  const boxBg = useColorModeValue("white", "gray.800");
  const boxBorderColor = useColorModeValue("gray.200", "gray.700");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <MotionBox
      minHeight="100vh"
      height="100%"
      bg={bgColor}
      backgroundImage={bgPattern}
      backgroundSize={bgSize}
      backgroundAttachment="fixed"
      overflowY="auto"
      display="flex"
      flexDirection="column"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Container
        maxW="container.xl"
        py={5}
        flex="1"
        display="flex"
        flexDirection="column"
      >
        <MotionFlex
          justify="space-between"
          align="center"
          mb={10}
          variants={itemVariants}
        >
          <Box py={2}>
            <Logo />
          </Box>
          <MotionIconButton
            aria-label={`Toggle ${
              colorMode === "light" ? "Dark" : "Light"
            } Mode`}
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            colorScheme="purple"
            whileHover={{ rotate: 45, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          />
        </MotionFlex>

        <MotionBox
          px={{ base: 4, md: 10 }}
          py={{ base: 8, md: 12 }}
          mx="auto"
          variants={itemVariants}
          flex="1"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          width="100%"
        >
          {/* Outlet for auth pages content */}
          <Outlet />
        </MotionBox>

        <MotionBox
          as="footer"
          mt="auto"
          textAlign="center"
          py={6}
          variants={itemVariants}
        >
          <VStack spacing={3}>
            <Logo />
            <Text fontSize="sm" color={textColor}>
              &copy; {new Date().getFullYear()} FitBook. All rights reserved.
            </Text>
            <HStack spacing={6} fontSize="sm">
              <Link to="/terms">
                <Text
                  color={textColor}
                  _hover={{ color: "purple.500" }}
                  transition="color 0.2s"
                >
                  Terms
                </Text>
              </Link>
              <Link to="/privacy">
                <Text
                  color={textColor}
                  _hover={{ color: "purple.500" }}
                  transition="color 0.2s"
                >
                  Privacy
                </Text>
              </Link>
              <Link to="/contact">
                <Text
                  color={textColor}
                  _hover={{ color: "purple.500" }}
                  transition="color 0.2s"
                >
                  Contact
                </Text>
              </Link>
            </HStack>
          </VStack>
        </MotionBox>
      </Container>
    </MotionBox>
  );
};

export default AuthLayout;

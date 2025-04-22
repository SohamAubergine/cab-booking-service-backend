import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";

// Create motion components
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionImage = motion(Image);

const NotFound = () => {
  // Theme colors
  const textColor = useColorModeValue("gray.600", "gray.300");
  const buttonBgGradient = "linear(to-r, purple.600, pink.500)";
  const buttonHoverBgGradient = "linear(to-r, purple.700, pink.600)";

  return (
    <Container 
      centerContent 
      py={20} 
      maxW="container.md"
      minH="calc(100vh - 200px)" 
      display="flex" 
      flexDirection="column" 
      justifyContent="center"
    >
      <MotionVStack
        spacing={8}
        textAlign="center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        width="100%"
      >
        <MotionImage
          src="https://img.icons8.com/fluency/240/null/error-cloud.png"
          alt="404 Not Found"
          boxSize={{ base: "150px", md: "200px" }}
          opacity={0.8}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.3 },
          }}
        />

        <MotionHeading
          as="h1"
          size="2xl"
          bgGradient="linear(to-r, purple.500, pink.500)"
          bgClip="text"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          404 - Page Not Found
        </MotionHeading>

        <MotionText
          fontSize="xl"
          color={textColor}
          maxW="lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </MotionText>

        <MotionBox
          pt={6}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button
            as={RouterLink}
            to="/"
            size="lg"
            px={8}
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
            Return Home
          </Button>
        </MotionBox>
      </MotionVStack>
    </Container>
  );
};

export default NotFound;

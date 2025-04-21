import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Flex,
  Icon,
  Button,
  Badge,
  useColorModeValue,
  Container,
  VStack,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  useToast,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaUser,
  FaCalendar,
  FaDumbbell,
} from "react-icons/fa";
import { adminService } from "../services/api";
import { Gym, UserRole } from "../types";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";

const GymDetails = () => {
  const { gymId } = useParams<{ gymId: string }>();
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const badgeBgColor = useColorModeValue("purple.100", "purple.800");
  const badgeColor = useColorModeValue("purple.800", "purple.100");

  useEffect(() => {
    if (!gymId) return;

    const fetchGymDetails = async () => {
      setLoading(true);
      try {
        // Use the admin service to get gym details (this works for mock data too)
        const response = await adminService.getGyms(1, 100);
        const foundGym = response.data.data.find((g) => g.id === gymId);

        if (foundGym) {
          setGym(foundGym);
        } else {
          setError("Gym not found");
          toast({
            title: "Error",
            description: "Gym details not found",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        setError("Failed to load gym details");
        toast({
          title: "Error",
          description: "Failed to load gym details",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGymDetails();
  }, [gymId, toast]);

  const handleGoBack = () => {
    if (user?.role === UserRole.INSTRUCTOR) {
      navigate("/instructor/gyms");
    } else if (user?.role === UserRole.ADMIN) {
      navigate("/admin/gyms");
    } else {
      navigate("/my-gyms");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !gym) {
    return (
      <EmptyState
        title="Gym Not Found"
        message="The gym you're looking for doesn't exist or you don't have permission to view it."
        icon={FaMapMarkerAlt}
        actionText="Go Back"
        onActionClick={handleGoBack}
      />
    );
  }

  return (
    <Container maxW="container.lg">
      <Button
        leftIcon={<FaArrowLeft />}
        variant="ghost"
        colorScheme="purple"
        mb={6}
        onClick={handleGoBack}
      >
        Back to Gyms
      </Button>

      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
        boxShadow="lg"
        p={6}
      >
        <Flex
          justify="space-between"
          align="flex-start"
          direction={{ base: "column", md: "row" }}
        >
          <Box mb={{ base: 4, md: 0 }}>
            <Heading size="xl" mb={2}>
              {gym.name}
            </Heading>
            <HStack mb={4}>
              <Icon as={FaMapMarkerAlt} color="purple.500" />
              <Text fontSize="lg">{gym.address}</Text>
            </HStack>

            <Badge
              bg={badgeBgColor}
              color={badgeColor}
              fontSize="md"
              borderRadius="full"
              px={3}
              py={1}
            >
              {user?.role === UserRole.INSTRUCTOR ? "Teaching Location" : "Gym"}
            </Badge>
          </Box>

          {gym.owner && (
            <Box
              bg={useColorModeValue("gray.50", "gray.700")}
              p={4}
              borderRadius="md"
              borderWidth="1px"
              borderColor={borderColor}
              minW={{ md: "200px" }}
            >
              <Text fontWeight="bold" mb={2}>
                Owner Information
              </Text>
              <Flex align="center">
                <Icon as={FaUser} mr={2} color="purple.500" />
                <Text>{gym.owner.name}</Text>
              </Flex>
              <Text fontSize="sm" color="gray.500" ml={6}>
                {gym.owner.email}
              </Text>
            </Box>
          )}
        </Flex>

        <Divider my={6} />

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={6}>
          <Stat
            bg={useColorModeValue("purple.50", "purple.900")}
            p={4}
            borderRadius="md"
            boxShadow="sm"
          >
            <StatLabel>
              <Flex align="center">
                <Icon as={FaCalendar} mr={2} />
                Established
              </Flex>
            </StatLabel>
            <StatNumber>
              {new Date(gym.createdAt).toLocaleDateString()}
            </StatNumber>
          </Stat>

          {/* These could be populated with real data in a full implementation */}
          <Stat
            bg={useColorModeValue("blue.50", "blue.900")}
            p={4}
            borderRadius="md"
            boxShadow="sm"
          >
            <StatLabel>
              <Flex align="center">
                <Icon as={FaDumbbell} mr={2} />
                Classes Offered
              </Flex>
            </StatLabel>
            <StatNumber>10+</StatNumber>
          </Stat>

          <Stat
            bg={useColorModeValue("green.50", "green.900")}
            p={4}
            borderRadius="md"
            boxShadow="sm"
          >
            <StatLabel>
              <Flex align="center">
                <Icon as={FaUser} mr={2} />
                Members
              </Flex>
            </StatLabel>
            <StatNumber>50+</StatNumber>
          </Stat>
        </SimpleGrid>

        {/* Additional information sections could be added here */}
        <Box mt={10}>
          <Heading size="md" mb={4}>
            About This Gym
          </Heading>
          <Text>
            This is a full-service fitness facility offering a variety of
            classes and equipment to help members achieve their fitness goals.
            The gym features state-of-the-art equipment, professional
            instructors, and a welcoming atmosphere for fitness enthusiasts of
            all levels.
          </Text>
        </Box>
      </Box>
    </Container>
  );
};

export default GymDetails;

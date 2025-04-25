import {
  Box,
  Badge,
  Heading,
  Text,
  Flex,
  Icon,
  Button,
  Card,
  CardBody,
  CardFooter,
  useColorModeValue,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaDumbbell,
} from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { format } from "date-fns";
import { FitnessClass } from "../../types";

interface ClassCardProps {
  fitnessClass: FitnessClass;
}

const ClassCard: React.FC<ClassCardProps> = ({ fitnessClass }) => {
  // Colors
  const cardBgColor = useColorModeValue("white", "gray.800");
  const cardBorderColor = useColorModeValue("purple.100", "purple.700");
  const badgeBgColor = useColorModeValue("purple.50", "purple.900");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const subtleTextColor = useColorModeValue("gray.500", "gray.400");

  // Format the start and end times
  const formattedStartTime = format(
    new Date(fitnessClass.startsAt),
    "MMM d, yyyy • h:mm a"
  );
  const formattedEndTime = format(new Date(fitnessClass.endsAt), "h:mm a");

  // Calculate remaining spots
  const remainingSpots =
    fitnessClass.capacity - (fitnessClass.bookedCount || 0);
  const isFullyBooked = remainingSpots <= 0;

  // Get category color
  const getCategoryColor = () => {
    switch (fitnessClass.category?.name?.toLowerCase()) {
      case "strength":
        return "red";
      case "cardio":
        return "orange";
      case "yoga":
        return "green";
      case "pilates":
        return "blue";
      default:
        return "purple";
    }
  };

  return (
    <LinkBox
      as={Card}
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      height="100%"
      borderWidth="1px"
      borderColor={cardBorderColor}
      bg={cardBgColor}
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "xl",
        borderColor: "purple.300",
      }}
      position="relative"
    >
      {/* Category Badge */}
      <Badge
        position="absolute"
        top={4}
        right={4}
        colorScheme={getCategoryColor()}
        borderRadius="full"
        px={3}
        py={1}
        fontWeight="bold"
        fontSize="xs"
        textTransform="uppercase"
        zIndex={1}
      >
        {fitnessClass.category?.name || "Uncategorized"}
      </Badge>

      {/* Availability Badge */}
      <Badge
        position="absolute"
        top={4}
        left={4}
        colorScheme={isFullyBooked ? "red" : "green"}
        variant={isFullyBooked ? "solid" : "subtle"}
        borderRadius="full"
        px={3}
        py={1}
        fontWeight="bold"
        fontSize="xs"
      >
        {isFullyBooked ? "Fully Booked" : `${remainingSpots} spots left`}
      </Badge>

      <CardBody pt={14} pb={2}>
        <LinkOverlay as={RouterLink} to={`/classes/${fitnessClass.id}`}>
          <Heading size="md" mb={3} color="purple.700" noOfLines={2}>
            {fitnessClass.name}
          </Heading>
        </LinkOverlay>

        <Flex align="center" mb={2}>
          <Icon as={FaCalendarAlt} color="purple.500" mr={2} />
          <Text fontSize="sm" color={textColor}>
            {formattedStartTime} - {formattedEndTime}
          </Text>
        </Flex>

        <Flex align="center" mb={2}>
          <Icon as={FaUser} color="purple.500" mr={2} />
          <Text fontSize="sm" color={textColor} noOfLines={1}>
            {fitnessClass.instructor
              ? `${fitnessClass.instructor.name}`
              : "TBD"}
          </Text>
        </Flex>

        {fitnessClass.gym && (
          <Flex align="center" mb={2}>
            <Icon as={FaMapMarkerAlt} color="purple.500" mr={2} />
            <Text fontSize="sm" color={textColor} noOfLines={1}>
              {fitnessClass.gym.name}
            </Text>
          </Flex>
        )}

        <Flex align="center">
          <Icon as={FaDumbbell} color="purple.500" mr={2} />
          <Text fontSize="sm" color={subtleTextColor}>
            Capacity: {fitnessClass.capacity}
          </Text>
        </Flex>
      </CardBody>

      <CardFooter pt={0} pb={4}>
        <Button
          colorScheme="purple"
          width="100%"
          isDisabled={isFullyBooked}
          borderRadius="lg"
          size="md"
          as={RouterLink}
          to={`/classes/${fitnessClass.id}/book`}
        >
          {isFullyBooked ? "Fully Booked" : "Book Class"}
        </Button>
      </CardFooter>
    </LinkBox>
  );
};

export default ClassCard;

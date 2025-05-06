import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Skeleton,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaDumbbell,
  FaChartLine,
  FaMoneyBillWave,
} from "react-icons/fa";

// Create motion component
const MotionSimpleGrid = motion(SimpleGrid);

// Animation variants
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

interface StatsGridProps {
  totalUsers: number;
  activeClasses: number;
  isLoading: boolean;
}

const StatsGrid = ({
  totalUsers,
  activeClasses,
  isLoading,
}: StatsGridProps) => {
  const statBg = useColorModeValue("purple.50", "purple.900");

  return (
    <MotionSimpleGrid
      columns={{ base: 1, md: 2, lg: 4 }}
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
          Total Users
        </StatLabel>
        {isLoading ? (
          <Skeleton height="36px" width="80%" mt={2} mb={2} />
        ) : (
          <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
            {totalUsers}
          </StatNumber>
        )}
        <StatHelpText>Across all user types</StatHelpText>
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
          Active Classes
        </StatLabel>
        {isLoading ? (
          <Skeleton height="36px" width="80%" mt={2} mb={2} />
        ) : (
          <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
            {activeClasses}
          </StatNumber>
        )}
        <StatHelpText>Currently scheduled</StatHelpText>
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
          <Icon as={FaMoneyBillWave} mr={2} color="purple.500" />
          Monthly Revenue
        </StatLabel>
        {isLoading ? (
          <Skeleton height="36px" width="80%" mt={2} mb={2} />
        ) : (
          <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
            coming soon
            {/* ${revenue} */}
          </StatNumber>
        )}
        <StatHelpText>For current month</StatHelpText>
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
          <Icon as={FaChartLine} mr={2} color="purple.500" />
          Growth Rate
        </StatLabel>
        {isLoading ? (
          <Skeleton height="36px" width="80%" mt={2} mb={2} />
        ) : (
          <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
            coming soon
            {/* {growthRate}% */}
          </StatNumber>
        )}
        <StatHelpText>Compared to last month</StatHelpText>
      </Stat>
    </MotionSimpleGrid>
  );
};

export default StatsGrid;

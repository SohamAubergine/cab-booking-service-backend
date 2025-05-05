import { Box, Heading, Text, Button, Flex } from "@chakra-ui/react";
import { FaSync } from "react-icons/fa";
import { motion } from "framer-motion";
import { User } from "../../types";
import { itemVariants } from "./animations";

const MotionFlex = motion(Flex);

interface DashboardWelcomeProps {
  user: User | null;
  isLoading: boolean;
  onRefresh: () => void;
  headingColor: string;
  textColor: string;
}

const DashboardWelcome = ({
  user,
  isLoading,
  onRefresh,
  headingColor,
  textColor,
}: DashboardWelcomeProps) => {
  return (
    <MotionFlex
      variants={itemVariants}
      direction={{ base: "column", md: "row" }}
      mb={8}
      justifyContent="space-between"
      alignItems={{ base: "flex-start", md: "center" }}
    >
      <Box>
        <Heading as="h1" size="xl" mb={2} color={headingColor}>
          Admin Dashboard
        </Heading>
        <Text color={textColor}>
          Welcome back, {user?.name}. Monitor and manage your fitness platform.
        </Text>
      </Box>
      <Button
        leftIcon={<FaSync />}
        colorScheme="purple"
        variant="outline"
        onClick={onRefresh}
        isLoading={isLoading}
        mt={{ base: 4, md: 0 }}
      >
        Refresh
      </Button>
    </MotionFlex>
  );
};

export default DashboardWelcome;

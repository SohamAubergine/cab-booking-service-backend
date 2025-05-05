import { Button, HStack, Box } from "@chakra-ui/react";
import { FaUsers, FaDumbbell, FaChartLine, FaBuilding } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { itemVariants } from "./animations";

const MotionBox = motion(Box);

const AdminActionButtons = () => {
  return (
    <MotionBox variants={itemVariants} mb={10}>
      <HStack spacing={4} justifyContent="center" wrap="wrap">
        <Button
          as={RouterLink}
          to="/admin/users"
          colorScheme="purple"
          variant="outline"
          leftIcon={<FaUsers />}
          size="lg"
          m={2}
        >
          Manage Users
        </Button>
        <Button
          as={RouterLink}
          to="/admin/classes"
          colorScheme="purple"
          variant="outline"
          leftIcon={<FaDumbbell />}
          size="lg"
          m={2}
        >
          Manage Classes
        </Button>
        <Button
          as={RouterLink}
          colorScheme="purple"
          variant="outline"
          leftIcon={<FaChartLine />}
          size="lg"
          m={2}
          disabled
        >
          View Reports
        </Button>
        <Button
          as={RouterLink}
          to="/admin/gyms"
          colorScheme="purple"
          variant="outline"
          leftIcon={<FaBuilding />}
          size="lg"
          m={2}
        >
          Manage Gyms
        </Button>
      </HStack>
    </MotionBox>
  );
};

export default AdminActionButtons;

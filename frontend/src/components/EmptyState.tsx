import {
  Box,
  VStack,
  Icon,
  Text,
  Button,
  useColorModeValue,
  BoxProps,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { Link as RouterLink } from "react-router-dom";

interface EmptyStateProps extends BoxProps {
  icon: IconType;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
}

const EmptyState = ({
  icon,
  title,
  message,
  actionText,
  actionLink,
  onActionClick,
  ...boxProps
}: EmptyStateProps) => {
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const iconColor = useColorModeValue("purple.500", "purple.300");

  const renderActionButton = () => {
    if (!actionText) return null;

    if (actionLink) {
      return (
        <Button
          as={RouterLink}
          to={actionLink}
          colorScheme="purple"
          mt={4}
          size="md"
        >
          {actionText}
        </Button>
      );
    }

    if (onActionClick) {
      return (
        <Button colorScheme="purple" mt={4} size="md" onClick={onActionClick}>
          {actionText}
        </Button>
      );
    }

    return null;
  };

  return (
    <Box
      p={10}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      textAlign="center"
      {...boxProps}
    >
      <VStack spacing={4}>
        <Icon as={icon} boxSize={12} color={iconColor} />
        <Text fontSize="xl" fontWeight="bold">
          {title}
        </Text>
        <Text color="gray.500">{message}</Text>
        {renderActionButton()}
      </VStack>
    </Box>
  );
};

export default EmptyState;

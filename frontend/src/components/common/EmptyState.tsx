import { Button, Flex, Heading, Text } from "@chakra-ui/react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      py={10}
      px={6}
    >
      <Heading as="h2" size="lg" mt={6} mb={2}>
        {title}
      </Heading>
      <Text color="gray.500" mb={6}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button colorScheme="blue" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Flex>
  );
};

export default EmptyState;

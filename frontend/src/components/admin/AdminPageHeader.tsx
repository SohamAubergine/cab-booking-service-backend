import { Box, Heading, Text } from "@chakra-ui/react";

interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
}

const AdminPageHeader = ({ title, subtitle }: AdminPageHeaderProps) => {
  return (
    <Box mb={8}>
      <Heading as="h1" size="xl" mb={2}>
        {title}
      </Heading>
      <Text color="gray.500">{subtitle}</Text>
    </Box>
  );
};

export default AdminPageHeader;

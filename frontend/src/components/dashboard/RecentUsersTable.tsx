import {
  Card,
  CardHeader,
  CardBody,
  Box,
  Heading,
  Text,
  Button,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  HStack,
  Avatar,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { User } from "../../types";

interface RecentUsersTableProps {
  recentUsers: User[];
  isLoading: boolean;
  textColor: string;
  headingColor: string;
  tableHeaderBg: string;
  tableRowHoverBg: string;
  cardBg: string;
  cardBorder: string;
}

const RecentUsersTable = ({
  recentUsers,
  isLoading,
  textColor,
  headingColor,
  tableHeaderBg,
  tableRowHoverBg,
  cardBg,
  cardBorder,
}: RecentUsersTableProps) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "red";
      case "INSTRUCTOR":
        return "purple";
      case "USER":
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <Card
      bg={cardBg}
      borderWidth="1px"
      borderColor={cardBorder}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{ boxShadow: "md" }}
      mb={8}
    >
      <CardHeader
        pb={0}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Heading size="md" mb={2} color={headingColor}>
            Recent Users
          </Heading>
          <Text fontSize="sm" color={textColor}>
            New registrations and activity
          </Text>
        </Box>
        <Button
          as={RouterLink}
          to="/admin/users"
          variant="outline"
          colorScheme="purple"
          size="sm"
        >
          View All Users
        </Button>
      </CardHeader>
      <CardBody>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading
                ? Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <Tr key={`skeleton-user-${index}`}>
                        <Td>
                          <Skeleton height="40px" />
                        </Td>
                        <Td>
                          <Skeleton height="24px" width="80px" />
                        </Td>
                        <Td>
                          <Skeleton height="24px" width="80px" />
                        </Td>
                      </Tr>
                    ))
                : recentUsers.map((user) => (
                    <Tr
                      key={user.id}
                      _hover={{ bg: tableRowHoverBg }}
                      transition="background-color 0.2s"
                    >
                      <Td>
                        <HStack>
                          <Avatar size="sm" name={user.name} bg="purple.500" />
                          <Box>
                            <Text fontWeight="medium">{user.name}</Text>
                            <Text fontSize="xs" color={textColor}>
                              {user.email}
                            </Text>
                          </Box>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getRoleBadgeColor(user.role)}
                          borderRadius="full"
                          px={2}
                        >
                          {user.role}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme="green" borderRadius="full" px={2}>
                          Active
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
            </Tbody>
          </Table>
        </TableContainer>
        {recentUsers.length === 0 && !isLoading && (
          <Text textAlign="center" py={4} color="gray.500">
            No users found
          </Text>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentUsersTable;

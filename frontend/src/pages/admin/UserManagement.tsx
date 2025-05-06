import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  useToast,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Card,
  CardBody,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Tooltip,
  TableContainer,
  Skeleton,
  useColorModeValue,
  Icon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaPlus,
  FaUserEdit,
  FaLock,
  FaUnlock,
  FaEllipsisV,
  FaFilter,
  FaSync,
  FaTrash,
  FaUser,
  FaUserCog,
  FaUserShield,
} from "react-icons/fa";
import { adminService } from "../../services/api";
import { User, UserRole } from "../../types";
import ErrorDisplay from "../../components/ErrorDisplay";
import * as toastUtils from "../../utils/toast";
import { motion } from "framer-motion";
import Pagination from "../../components/Pagination";
import { useRef } from "react";

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  // Pagination
  const limit = 10;

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const tableBg = useColorModeValue("white", "gray.800");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const tableRowHoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In production, we would implement proper role filtering on the backend
      // Here, we're just adding the name parameter if searchQuery is provided
      const searchParams = searchQuery ? { name: searchQuery } : undefined;

      const response = await adminService.getAllUsers(
        currentPage,
        limit,
        searchParams?.name
      );

      if (response.success) {
        let filteredUsers = response.data.data;

        // Client-side filtering based on role if needed
        // Note: In a real app, this should be done on the server
        if (roleFilter !== "all") {
          filteredUsers = filteredUsers.filter(
            (user) => user.role === roleFilter
          );
        }

        setUsers(filteredUsers);
        setTotalPages(response.data.meta.totalPages);
        setTotalUsers(response.data.meta.total);
      } else {
        throw new Error(response.message || "Failed to fetch users");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);
      toast(toastUtils.errorToast("Error", errorMessage));

      // For demo purposes, use mock data if API call fails
      console.warn("Using mock data - API endpoint error", err);
      const mockUsers = generateMockUsers();
      setUsers(mockUsers);
      setTotalPages(Math.ceil(mockUsers.length / limit));
      setTotalUsers(mockUsers.length);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchUsers();
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const handleRefresh = () => {
    fetchUsers();
    toast(toastUtils.infoToast("Refreshing", "User list is being updated"));
  };

  const handleChangePage = (newPage: number) => {
    setCurrentPage(newPage);
  };

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return FaUserShield;
      case "INSTRUCTOR":
        return FaUserCog;
      case "USER":
        return FaUser;
      default:
        return FaUser;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Mock user generator function for demo/development
  const generateMockUsers = (): User[] => {
    const roles = [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.USER];
    const mockUsers: User[] = [];

    for (let i = 1; i <= 25; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const createdDate = new Date();
      createdDate.setDate(
        createdDate.getDate() - Math.floor(Math.random() * 90)
      );

      mockUsers.push({
        id: `user-${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        role: role,
        createdAt: createdDate.toISOString(),
        updatedAt: createdDate.toISOString(),
        ...(Math.random() > 0.5 && { mobile: `+1 555-${100 + i}` }),
        ...(Math.random() > 0.5 && { address: `${i} Main St, City` }),
      });
    }

    return mockUsers;
  };

  // Add delete user handler
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsLoading(true);
      const response = await adminService.deleteUser(userToDelete.id);

      if (response.success) {
        toast(
          toastUtils.successToast(
            "Success",
            `User ${userToDelete.name} deleted successfully`
          )
        );
        // Remove the user from the local state
        setUsers(users.filter((user) => user.id !== userToDelete.id));
        setTotalUsers((prev) => prev - 1);
      } else {
        throw new Error(response.message || "Failed to delete user");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete user";
      setError(errorMessage);
      toast(toastUtils.errorToast("Error", errorMessage));
    } finally {
      setIsLoading(false);
      onClose();
      setUserToDelete(null);
    }
  };

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    onOpen();
  };

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      p={4}
    >
      {/* Header Section */}
      <MotionFlex
        variants={itemVariants}
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        mb={8}
      >
        <Box mb={{ base: 4, md: 0 }}>
          <Heading as="h1" size="xl" mb={2} color={headingColor}>
            User Management
          </Heading>
          <Text color={textColor}>
            Manage and oversee all user accounts on the platform
          </Text>
        </Box>
        <HStack>
          {/* <Button
            leftIcon={<FaPlus />}
            colorScheme="purple"
            variant="solid"
            size="md"
          >
            Add New User
          </Button> */}
          <IconButton
            aria-label="Refresh user list"
            icon={<FaSync />}
            colorScheme="purple"
            variant="outline"
            onClick={handleRefresh}
            isLoading={isLoading}
          />
        </HStack>
      </MotionFlex>

      {/* Search and Filter Section */}
      <MotionBox variants={itemVariants} mb={6}>
        <Card
          bg={cardBg}
          borderWidth="1px"
          borderColor={cardBorder}
          borderRadius="lg"
          boxShadow="sm"
        >
          <CardBody>
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              gap={4}
            >
              <InputGroup maxW={{ base: "100%", md: "400px" }}>
                <InputLeftElement pointerEvents="none">
                  <FaSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </InputGroup>

              <HStack spacing={4} w={{ base: "100%", md: "auto" }}>
                <Flex align="center">
                  <Box mr={2}>
                    <FaFilter />
                  </Box>
                  <Select
                    placeholder="Filter by role"
                    value={roleFilter}
                    onChange={handleRoleFilterChange}
                    w={{ base: "100%", md: "200px" }}
                  >
                    <option value="all">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="USER">User</option>
                  </Select>
                </Flex>

                <Button
                  colorScheme="purple"
                  variant="outline"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      </MotionBox>

      {error && <ErrorDisplay error={error} mb={6} />}

      {/* Users Table */}
      <MotionBox variants={itemVariants} mb={6}>
        <Card
          bg={cardBg}
          borderWidth="1px"
          borderColor={cardBorder}
          borderRadius="lg"
          boxShadow="sm"
          overflow="hidden"
        >
          <CardBody p={0}>
            <TableContainer>
              <Table variant="simple">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>User</Th>
                    <Th>Role</Th>
                    <Th>Contact</Th>
                    <Th>Joined</Th>
                    <Th width="100px">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isLoading
                    ? Array(limit)
                        .fill(0)
                        .map((_, index) => (
                          <Tr key={`skeleton-${index}`}>
                            <Td>
                              <Skeleton height="50px" />
                            </Td>
                            <Td>
                              <Skeleton height="20px" width="80px" />
                            </Td>
                            <Td>
                              <Skeleton height="20px" />
                            </Td>
                            <Td>
                              <Skeleton height="20px" width="100px" />
                            </Td>
                            <Td>
                              <Skeleton height="30px" width="80px" />
                            </Td>
                          </Tr>
                        ))
                    : users.map((user) => (
                        <Tr
                          key={user.id}
                          _hover={{ bg: tableRowHoverBg }}
                          transition="background-color 0.2s"
                        >
                          <Td>
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                name={user.name}
                                bg={getRoleBadgeColor(user.role) + ".500"}
                                icon={<Icon as={getRoleIcon(user.role)} />}
                              />
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
                              py={1}
                            >
                              {user.role}
                            </Badge>
                          </Td>
                          <Td>
                            {user.mobile ? (
                              <Text fontSize="sm">{user.mobile}</Text>
                            ) : (
                              <Text fontSize="sm" color="gray.500">
                                No phone number
                              </Text>
                            )}
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {formatDate(user.createdAt)}
                            </Text>
                          </Td>
                          <Td>
                            {user.role !== UserRole.ADMIN ? (
                              <IconButton
                                aria-label="Delete user"
                                icon={<FaTrash />}
                                variant="ghost"
                                colorScheme="red"
                                size="sm"
                                onClick={() => confirmDelete(user)}
                              />
                            ) : (
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                fontStyle="italic"
                              >
                                Protected
                              </Text>
                            )}
                          </Td>
                        </Tr>
                      ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Pagination */}
      <MotionFlex
        variants={itemVariants}
        justify="space-between"
        align="center"
        mb={4}
      >
        <Text color={textColor}>
          Showing {users.length} of {totalUsers} users
        </Text>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handleChangePage}
          />
        )}
      </MotionFlex>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete User
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {userToDelete?.name}? This action
              cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteUser}
                ml={3}
                isLoading={isLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </MotionBox>
  );
};

export default UserManagement;

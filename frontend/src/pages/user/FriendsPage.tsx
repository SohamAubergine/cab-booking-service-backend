import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  Avatar,
  Flex,
  Badge,
  Divider,
  HStack,
  VStack,
  IconButton,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaUserPlus,
  FaUserFriends,
  FaEnvelope,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { friendshipService } from "../../services/api";
import { Friendship, FriendshipStatus, User, UserRole } from "../../types";
import FriendRequestList from "../../components/FriendRequestList";
import FriendRequestButton from "../../components/FriendRequestButton";
import * as toastUtils from "../../utils/toast";
import ErrorDisplay from "../../components/ErrorDisplay";

const FriendsPage = () => {
  const { user } = useAuth();
  const [acceptedFriendships, setAcceptedFriendships] = useState<Friendship[]>(
    []
  );
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingFriendships, setIsLoadingFriendships] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [friendshipsError, setFriendshipsError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchAcceptedFriendships();
  }, []);

  const fetchAcceptedFriendships = async () => {
    try {
      setIsLoadingFriendships(true);
      setFriendshipsError(null);

      const response = await friendshipService.getFriendships({
        status: FriendshipStatus.ACCEPTED,
      });

      if (response.success) {
        // Ensure we have a defined array even if the API returns null/undefined
        setAcceptedFriendships(response.data?.data || []);
      } else {
        setFriendshipsError(response.message || "Failed to fetch friends");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch friends";
      setFriendshipsError(errorMessage);
    } finally {
      setIsLoadingFriendships(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchEmail.trim()) {
      setSearchError("Please enter an email address to search");
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      setFoundUser(null);

      // This is a mock implementation since we don't have a direct endpoint to search users by email
      // In a real application, you would have a proper API endpoint

      // Simulate calling an API to search for users by email
      setTimeout(() => {
        // Mock successful response
        if (searchEmail.includes("@")) {
          setFoundUser({
            id: "user-" + Math.random().toString(36).substring(2, 9),
            name: searchEmail.split("@")[0], // Use part of email as mock name
            email: searchEmail,
            role: UserRole.USER,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          setSearchError("No user found with that email address");
        }
        setIsSearching(false);
      }, 1000);

      // Actual API call would look like this:
      // const response = await userService.searchUsersByEmail(searchEmail);
      // if (response.success) {
      //   setFoundUser(response.data);
      // } else {
      //   setSearchError("No user found with that email address");
      // }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error searching for user";
      setSearchError(errorMessage);
      setIsSearching(false);
    }
  };

  const handleFriendshipUpdated = (friendship: Friendship | null) => {
    // If a friendship is accepted, add it to the accepted friendships list
    if (friendship && friendship.status === FriendshipStatus.ACCEPTED) {
      setAcceptedFriendships((prev) => [...prev, friendship]);
    }

    // If a friendship is removed, remove it from the list
    if (!friendship) {
      fetchAcceptedFriendships();
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" mb={2}>
        Friends
      </Heading>
      <Text color="gray.600" mb={6}>
        Connect with other users and manage your friendships
      </Text>

      <Tabs colorScheme="teal" isLazy>
        <TabList>
          <Tab>My Friends</Tab>
          <Tab>Friend Requests</Tab>
          <Tab>Find Friends</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box mb={6}>
              <Heading size="md" mb={4}>
                Your Friends
              </Heading>

              {friendshipsError && (
                <Box mb={4}>
                  <ErrorDisplay error={friendshipsError} />
                </Box>
              )}

              {isLoadingFriendships ? (
                <Text>Loading your friends...</Text>
              ) : acceptedFriendships && acceptedFriendships.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {acceptedFriendships.map((friendship) => {
                    if (!friendship) return null;

                    // Determine which user to show
                    const isCurrentUserSender =
                      user && friendship?.sender?.id === user?.id;
                    const friend = isCurrentUserSender
                      ? friendship?.receiver
                      : friendship?.sender;

                    if (!friend) return null;

                    return (
                      <Card
                        key={friendship.id}
                        borderWidth="1px"
                        borderRadius="lg"
                      >
                        <CardBody>
                          <Flex direction="column" align="center">
                            <Avatar size="xl" name={friend.name} mb={3} />
                            <VStack spacing={1} mb={4}>
                              <Heading size="md">{friend.name}</Heading>
                              <Text color="gray.600" fontSize="sm">
                                {friend.email}
                              </Text>
                              <Badge colorScheme="green" mt={2}>
                                Friend
                              </Badge>
                            </VStack>
                            <HStack spacing={2} width="100%">
                              <Button
                                leftIcon={<FaEnvelope />}
                                colorScheme="teal"
                                variant="outline"
                                size="sm"
                                width="full"
                              >
                                Message
                              </Button>
                              <FriendRequestButton
                                userId={friend.id}
                                existingFriendship={friendship}
                                onFriendshipUpdated={handleFriendshipUpdated}
                                colorScheme="red"
                                size="sm"
                                width="full"
                              />
                            </HStack>
                          </Flex>
                        </CardBody>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Box
                  p={8}
                  borderWidth="1px"
                  borderRadius="lg"
                  textAlign="center"
                >
                  <FaUserFriends size={50} style={{ margin: "0 auto 20px" }} />
                  <Heading size="md" mb={2}>
                    No Friends Yet
                  </Heading>
                  <Text mb={4}>
                    You haven't added any friends yet. Search for friends by
                    email or respond to friend requests.
                  </Text>
                  <Button
                    colorScheme="teal"
                    leftIcon={<FaUserPlus />}
                    onClick={() => {
                      // Switch to the "Find Friends" tab
                      const findFriendsTab = document.querySelectorAll(
                        '[role="tab"]'
                      )[2] as HTMLElement;
                      if (findFriendsTab) {
                        findFriendsTab.click();
                      }
                    }}
                  >
                    Find Friends
                  </Button>
                </Box>
              )}
            </Box>
          </TabPanel>

          <TabPanel>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <GridItem>
                <FriendRequestList
                  variant="pendingOnly"
                  heading="Pending Requests"
                  showRefresh={true}
                />
              </GridItem>
              <GridItem>
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>
                      Sent Requests
                    </Heading>
                    <Text color="gray.600">
                      View the status of friend requests you've sent to other
                      users.
                    </Text>
                    {/* Placeholder for sent requests component */}
                    <Box
                      mt={4}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      textAlign="center"
                    >
                      <FaUserPlus size={24} style={{ margin: "0 auto 10px" }} />
                      <Text>No pending sent requests</Text>
                    </Box>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>

          <TabPanel>
            <Box mb={6}>
              <Heading size="md" mb={4}>
                Find Friends by Email
              </Heading>

              <form onSubmit={handleSearch}>
                <FormControl mb={4}>
                  <FormLabel>Email Address</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaSearch color="gray.300" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                    />
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={isSearching}
                  leftIcon={<FaSearch />}
                  mb={4}
                >
                  Search
                </Button>
              </form>

              {searchError && (
                <Box mb={4}>
                  <ErrorDisplay error={searchError} />
                </Box>
              )}

              {foundUser && (
                <Card borderWidth="1px" borderRadius="lg" mt={4}>
                  <CardBody>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Avatar size="md" name={foundUser.name} />
                        <Box>
                          <Heading size="sm">{foundUser.name}</Heading>
                          <Text fontSize="sm" color="gray.600">
                            {foundUser.email}
                          </Text>
                        </Box>
                      </HStack>

                      <FriendRequestButton
                        userId={foundUser.id}
                        size="md"
                        onFriendshipUpdated={handleFriendshipUpdated}
                      />
                    </Flex>
                  </CardBody>
                </Card>
              )}

              <Divider my={8} />

              <Heading size="md" mb={4}>
                Suggested Friends
              </Heading>

              <Text color="gray.600" mb={4}>
                Here are some people you might know:
              </Text>

              <Box p={8} borderWidth="1px" borderRadius="lg" textAlign="center">
                <Text>Suggested friends feature coming soon!</Text>
              </Box>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default FriendsPage;

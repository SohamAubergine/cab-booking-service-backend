import { useState, useEffect } from "react";
import {
  Box,
  Text,
  Heading,
  Flex,
  Button,
  Avatar,
  VStack,
  HStack,
  Badge,
  Divider,
  useToast,
  Card,
  CardBody,
  SkeletonCircle,
  SkeletonText,
  IconButton,
  Tooltip,
  Center,
} from "@chakra-ui/react";
import { FaCheck, FaTimes, FaUserPlus, FaSync } from "react-icons/fa";
import { friendshipService } from "../services/api";
import { Friendship, FriendshipStatus } from "../types";
import * as toastUtils from "../utils/toast";
import ErrorDisplay from "./ErrorDisplay";
import { useAuth } from "../context/AuthContext";

interface FriendRequestListProps {
  variant?: "pendingOnly" | "all";
  limit?: number;
  heading?: string;
  showRefresh?: boolean;
}

const FriendRequestList = ({
  variant = "pendingOnly",
  limit = 10,
  heading = "Friend Requests",
  showRefresh = true,
}: FriendRequestListProps) => {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const toast = useToast();

  const fetchFriendRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (variant === "pendingOnly") {
        const response = await friendshipService.getPendingFriendRequests(
          1,
          limit
        );
        if (response.success) {
          setFriendships(response.data.data);
        }
      } else {
        const response = await friendshipService.getFriendships({
          page: 1,
          limit,
          status:
            variant === "pendingOnly" ? FriendshipStatus.PENDING : undefined,
        });
        if (response.success) {
          setFriendships(response.data.data);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch friend requests";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, [variant, limit]);

  const handleAcceptFriendRequest = async (friendshipId: string) => {
    try {
      const response = await friendshipService.acceptFriendRequest(
        friendshipId
      );
      if (response.success) {
        // Update the local state to reflect the change
        setFriendships((prevFriendships) =>
          prevFriendships.map((f) =>
            f.id === friendshipId ? response.data : f
          )
        );

        toast(
          toastUtils.successToast(
            "Friend Request Accepted",
            "You are now friends!"
          )
        );

        // If showing only pending, remove this one from the list
        if (variant === "pendingOnly") {
          setFriendships((prevFriendships) =>
            prevFriendships.filter((f) => f.id !== friendshipId)
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to accept friend request";
      toast(toastUtils.errorToast("Error", errorMessage));
    }
  };

  const handleRejectFriendRequest = async (friendshipId: string) => {
    try {
      const response = await friendshipService.rejectFriendRequest(
        friendshipId
      );
      if (response.success) {
        // Update the local state to reflect the change
        setFriendships((prevFriendships) =>
          prevFriendships.map((f) =>
            f.id === friendshipId ? response.data : f
          )
        );

        toast(
          toastUtils.infoToast(
            "Friend Request Rejected",
            "The friend request has been rejected."
          )
        );

        // If showing only pending, remove this one from the list
        if (variant === "pendingOnly") {
          setFriendships((prevFriendships) =>
            prevFriendships.filter((f) => f.id !== friendshipId)
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reject friend request";
      toast(toastUtils.errorToast("Error", errorMessage));
    }
  };

  const handleRefresh = () => {
    fetchFriendRequests();
  };

  const renderFriendshipItem = (friendship: Friendship) => {
    if (!friendship || !user) return null;

    // Determine which user to show (the other person in the friendship)
    const isCurrentUserSender = friendship.sender?.id === user?.id;
    const otherUser = isCurrentUserSender
      ? friendship.receiver
      : friendship.sender;

    if (!otherUser) return null;

    return (
      <Box key={friendship.id} w="100%">
        <Flex justify="space-between" align="center" py={2}>
          <HStack spacing={3}>
            <Avatar size="md" name={otherUser.name} />
            <Box>
              <Text fontWeight="bold">{otherUser.name}</Text>
              <Text fontSize="sm" color="gray.600">
                {otherUser.email}
              </Text>
            </Box>
          </HStack>

          {friendship.status === FriendshipStatus.PENDING &&
            !isCurrentUserSender && (
              <HStack>
                <Tooltip label="Accept">
                  <IconButton
                    aria-label="Accept friend request"
                    icon={<FaCheck />}
                    colorScheme="green"
                    size="sm"
                    onClick={() => handleAcceptFriendRequest(friendship.id)}
                  />
                </Tooltip>
                <Tooltip label="Reject">
                  <IconButton
                    aria-label="Reject friend request"
                    icon={<FaTimes />}
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleRejectFriendRequest(friendship.id)}
                  />
                </Tooltip>
              </HStack>
            )}

          {friendship.status === FriendshipStatus.PENDING &&
            isCurrentUserSender && <Badge colorScheme="blue">Pending</Badge>}

          {friendship.status === FriendshipStatus.ACCEPTED && (
            <Badge colorScheme="green">Friends</Badge>
          )}

          {friendship.status === FriendshipStatus.REJECTED && (
            <Badge colorScheme="red">Rejected</Badge>
          )}
        </Flex>
        <Divider />
      </Box>
    );
  };

  const renderSkeletonItems = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <Box key={`skeleton-${index}`} w="100%">
          <Flex justify="space-between" align="center" py={2}>
            <HStack spacing={3}>
              <SkeletonCircle size="12" />
              <Box flex="1">
                <SkeletonText noOfLines={2} spacing="2" w="150px" />
              </Box>
            </HStack>
            <SkeletonText noOfLines={1} w="60px" />
          </Flex>
          <Divider />
        </Box>
      ));
  };

  return (
    <Card>
      <CardBody>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">{heading}</Heading>
          {showRefresh && (
            <IconButton
              aria-label="Refresh"
              icon={<FaSync />}
              size="sm"
              onClick={handleRefresh}
              isLoading={isLoading}
            />
          )}
        </Flex>

        {error && <ErrorDisplay error={error} mb={4} />}

        <VStack spacing={2} align="start">
          {isLoading ? (
            renderSkeletonItems()
          ) : friendships.length > 0 ? (
            friendships.map(renderFriendshipItem)
          ) : (
            <Center w="100%" py={4}>
              <VStack>
                <FaUserPlus size={24} color="gray" />
                <Text color="gray.500">No friend requests found</Text>
              </VStack>
            </Center>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default FriendRequestList;

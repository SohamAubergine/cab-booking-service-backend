import { useState } from "react";
import {
  Button,
  useToast,
  Tooltip,
  IconButton,
  ButtonProps,
} from "@chakra-ui/react";
import { FaUserPlus, FaCheck, FaTimes } from "react-icons/fa";
import { friendshipService } from "../services/api";
import { Friendship, FriendshipStatus } from "../types";
import * as toastUtils from "../utils/toast";

interface FriendRequestButtonProps extends Omit<ButtonProps, "onClick"> {
  userId: string;
  variant?: "icon" | "button";
  size?: "sm" | "md" | "lg";
  existingFriendship?: Friendship | null;
  onFriendshipUpdated?: (friendship: Friendship | null) => void;
}

const FriendRequestButton = ({
  userId,
  variant = "button",
  size = "md",
  existingFriendship = null,
  onFriendshipUpdated,
  ...props
}: FriendRequestButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [friendship, setFriendship] = useState<Friendship | null>(
    existingFriendship
  );
  const toast = useToast();

  const handleSendFriendRequest = async () => {
    try {
      setIsLoading(true);
      const response = await friendshipService.sendFriendRequest({
        receiverId: userId,
      });

      if (response.success) {
        const newFriendship = response.data;
        setFriendship(newFriendship);

        if (onFriendshipUpdated) {
          onFriendshipUpdated(newFriendship);
        }

        toast(
          toastUtils.successToast(
            "Friend Request Sent",
            "Your friend request has been sent successfully."
          )
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send friend request";
      toast(toastUtils.errorToast("Error", errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!friendship) return;

    try {
      setIsLoading(true);
      const response = await friendshipService.acceptFriendRequest(
        friendship.id
      );

      if (response.success) {
        const updatedFriendship = response.data;
        setFriendship(updatedFriendship);

        if (onFriendshipUpdated) {
          onFriendshipUpdated(updatedFriendship);
        }

        toast(
          toastUtils.successToast(
            "Friend Request Accepted",
            "You are now friends!"
          )
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to accept friend request";
      toast(toastUtils.errorToast("Error", errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectFriendRequest = async () => {
    if (!friendship) return;

    try {
      setIsLoading(true);
      const response = await friendshipService.rejectFriendRequest(
        friendship.id
      );

      if (response.success) {
        const updatedFriendship = response.data;
        setFriendship(updatedFriendship);

        if (onFriendshipUpdated) {
          onFriendshipUpdated(updatedFriendship);
        }

        toast(
          toastUtils.infoToast(
            "Friend Request Rejected",
            "The friend request has been rejected."
          )
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reject friend request";
      toast(toastUtils.errorToast("Error", errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendship) return;

    try {
      setIsLoading(true);
      const response = await friendshipService.deleteFriendship(friendship.id);

      if (response.success) {
        setFriendship(null);

        if (onFriendshipUpdated) {
          onFriendshipUpdated(null);
        }

        toast(
          toastUtils.infoToast(
            "Friend Removed",
            "The user has been removed from your friends."
          )
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove friend";
      toast(toastUtils.errorToast("Error", errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  // No friendship exists yet - show Add Friend button
  if (!friendship) {
    if (variant === "icon") {
      return (
        <Tooltip label="Send Friend Request">
          <IconButton
            aria-label="Send Friend Request"
            icon={<FaUserPlus />}
            colorScheme="teal"
            size={size}
            isLoading={isLoading}
            onClick={handleSendFriendRequest}
            {...props}
          />
        </Tooltip>
      );
    }

    return (
      <Button
        leftIcon={<FaUserPlus />}
        colorScheme="teal"
        size={size}
        isLoading={isLoading}
        onClick={handleSendFriendRequest}
        {...props}
      >
        Add Friend
      </Button>
    );
  }

  // Friend request is pending
  if (friendship.status === FriendshipStatus.PENDING) {
    // Current user is the sender - show "Pending" button
    if (friendship.senderId === userId) {
      if (variant === "icon") {
        return (
          <Tooltip label="Friend Request Pending">
            <IconButton
              aria-label="Friend Request Pending"
              icon={<FaUserPlus />}
              colorScheme="blue"
              variant="outline"
              size={size}
              isDisabled
              {...props}
            />
          </Tooltip>
        );
      }

      return (
        <Button
          leftIcon={<FaUserPlus />}
          colorScheme="blue"
          variant="outline"
          size={size}
          isDisabled
          {...props}
        >
          Request Pending
        </Button>
      );
    }

    // Current user is the receiver - show Accept/Reject buttons
    if (variant === "icon") {
      return (
        <>
          <Tooltip label="Accept Friend Request">
            <IconButton
              aria-label="Accept Friend Request"
              icon={<FaCheck />}
              colorScheme="green"
              size={size}
              mr={2}
              isLoading={isLoading}
              onClick={handleAcceptFriendRequest}
              {...props}
            />
          </Tooltip>
          <Tooltip label="Reject Friend Request">
            <IconButton
              aria-label="Reject Friend Request"
              icon={<FaTimes />}
              colorScheme="red"
              size={size}
              isLoading={isLoading}
              onClick={handleRejectFriendRequest}
              {...props}
            />
          </Tooltip>
        </>
      );
    }

    return (
      <>
        <Button
          leftIcon={<FaCheck />}
          colorScheme="green"
          size={size}
          mr={2}
          isLoading={isLoading}
          onClick={handleAcceptFriendRequest}
          {...props}
        >
          Accept
        </Button>
        <Button
          leftIcon={<FaTimes />}
          colorScheme="red"
          size={size}
          isLoading={isLoading}
          onClick={handleRejectFriendRequest}
          {...props}
        >
          Reject
        </Button>
      </>
    );
  }

  // Friendship is accepted - show "Friends" button with option to remove
  if (friendship.status === FriendshipStatus.ACCEPTED) {
    if (variant === "icon") {
      return (
        <Tooltip label="Remove Friend">
          <IconButton
            aria-label="Remove Friend"
            icon={<FaCheck />}
            colorScheme="green"
            size={size}
            isLoading={isLoading}
            onClick={handleRemoveFriend}
            {...props}
          />
        </Tooltip>
      );
    }

    return (
      <Button
        leftIcon={<FaCheck />}
        colorScheme="green"
        variant="outline"
        size={size}
        isLoading={isLoading}
        onClick={handleRemoveFriend}
        {...props}
      >
        Friends
      </Button>
    );
  }

  // Friendship is rejected - show "Add Friend" button again
  return (
    <Button
      leftIcon={<FaUserPlus />}
      colorScheme="teal"
      size={size}
      isLoading={isLoading}
      onClick={handleSendFriendRequest}
      {...props}
    >
      Add Friend
    </Button>
  );
};

export default FriendRequestButton;

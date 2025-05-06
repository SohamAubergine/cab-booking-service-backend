import { useState, useEffect } from "react";
import {
  IconButton,
  Button,
  useToast,
  Tooltip,
  ButtonProps,
  Icon,
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { favoriteService } from "../services/api";
import axios from "axios";

interface FavoriteButtonProps extends Omit<ButtonProps, "onClick"> {
  fitnessClassId: string;
  className?: string;
  variant?: "icon" | "button";
  size?: "sm" | "md" | "lg";
  initialIsFavorite?: boolean;
  onFavoriteChanged?: (isFavorite: boolean) => void;
}

const FavoriteButton = ({
  fitnessClassId,
  className,
  variant = "icon",
  size = "md",
  initialIsFavorite,
  onFavoriteChanged,
  ...props
}: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(
    initialIsFavorite || false
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    initialIsFavorite !== undefined ? false : true
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [apiNotAvailable, setApiNotAvailable] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    // If initialIsFavorite is not provided, check status from API
    if (initialIsFavorite === undefined) {
      checkFavoriteStatus();
    }
  }, [fitnessClassId]);

  const checkFavoriteStatus = async () => {
    if (apiNotAvailable) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await favoriteService.checkFavoriteStatus(
        fitnessClassId
      );
      if (response.success) {
        setIsFavorite(response.data);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);

      // Handle 404 errors (API not implemented)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn("Favorites API not available");
        setApiNotAvailable(true);
      }

      // Default to not favorited on error
      setIsFavorite(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (isProcessing || apiNotAvailable) {
      // If API is not available, show a message to the user
      if (apiNotAvailable) {
        toast({
          title: "Feature Not Available",
          description: "The favorites feature is coming soon!",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
      return;
    }

    try {
      setIsProcessing(true);

      if (isFavorite) {
        // Remove from favorites
        const response = await favoriteService.removeFromFavorites(
          fitnessClassId
        );
        if (response.success) {
          setIsFavorite(false);
          if (onFavoriteChanged) onFavoriteChanged(false);
          toast({
            title: "Removed from favorites",
            description: className
              ? `${className} removed from favorites`
              : "Removed from favorites",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // Add to favorites
        const response = await favoriteService.addToFavorites(fitnessClassId);
        if (response.success) {
          setIsFavorite(true);
          if (onFavoriteChanged) onFavoriteChanged(true);
          toast({
            title: "Added to favorites",
            description: className
              ? `${className} added to favorites`
              : "Added to favorites",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error("Error updating favorites:", error);

      // Handle 404 errors (API not implemented)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setApiNotAvailable(true);
        toast({
          title: "Feature Coming Soon",
          description: "The favorites feature is not available yet.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update favorites";

        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render the button if API is not available and initialIsFavorite was not provided
  // But do render if initialIsFavorite was provided - useful for the Favorites page
  if (apiNotAvailable && initialIsFavorite === undefined) {
    return null;
  }

  // Icon variant
  if (variant === "icon") {
    return (
      <Tooltip
        label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <IconButton
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          icon={
            isFavorite ? (
              <Icon as={FaHeart} color="red.500" />
            ) : (
              <Icon as={FaRegHeart} />
            )
          }
          onClick={toggleFavorite}
          isLoading={isLoading || isProcessing}
          size={size}
          variant="ghost"
          {...props}
        />
      </Tooltip>
    );
  }

  // Button variant
  return (
    <Button
      leftIcon={
        isFavorite ? (
          <Icon as={FaHeart} color="red.500" />
        ) : (
          <Icon as={FaRegHeart} />
        )
      }
      onClick={toggleFavorite}
      isLoading={isLoading || isProcessing}
      size={size}
      {...props}
    >
      {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
    </Button>
  );
};

export default FavoriteButton;

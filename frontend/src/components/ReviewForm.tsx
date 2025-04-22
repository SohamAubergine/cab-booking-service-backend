import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Stack,
  Textarea,
  useToast,
  Text,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { reviewService } from "../services/api";
import { CreateReviewRequest } from "../types";
import ErrorDisplay from "./ErrorDisplay";

interface ReviewFormProps {
  fitnessClassId: string;
  fitnessClassName: string;
  onReviewSubmitted?: () => void;
  existingReview?: {
    rating: number;
    feedback: string | null;
  } | null;
}

const ReviewForm = ({
  fitnessClassId,
  fitnessClassName,
  onReviewSubmitted,
  existingReview,
}: ReviewFormProps) => {
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(
    existingReview?.feedback || ""
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleMouseEnter = (hoveredStar: number) => {
    setHoveredRating(hoveredStar);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async () => {
    // Validate input
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const reviewData: CreateReviewRequest = {
        fitnessClassId,
        rating,
        feedback: feedback.trim() || undefined,
      };

      const response = await reviewService.submitReview(reviewData);

      toast({
        title: "Review submitted",
        description:
          response.message || "Your review has been submitted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Call the callback function if provided
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExistingReview = !!existingReview;

  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="sm"
      p={6}
      border="1px solid"
      borderColor="gray.200"
    >
      <Heading size="md" mb={4}>
        {isExistingReview
          ? `Your Review for ${fitnessClassName}`
          : `Rate your experience for ${fitnessClassName}`}
      </Heading>

      {isExistingReview && (
        <Text fontSize="sm" color="gray.500" mb={4}>
          You've already submitted a review for this class.
        </Text>
      )}

      <Stack spacing={4}>
        <FormControl id="rating" isRequired>
          <FormLabel>Rating</FormLabel>
          <Flex>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                boxSize={8}
                color={
                  (hoveredRating || rating) >= star ? "yellow.400" : "gray.200"
                }
                cursor={isExistingReview ? "default" : "pointer"}
                onClick={() => {
                  if (!isExistingReview) handleStarClick(star);
                }}
                onMouseEnter={() => {
                  if (!isExistingReview) handleMouseEnter(star);
                }}
                onMouseLeave={handleMouseLeave}
                mr={2}
              />
            ))}
            <Text ml={2} alignSelf="center">
              {rating > 0
                ? `${rating} star${rating !== 1 ? "s" : ""}`
                : "Select rating"}
            </Text>
          </Flex>
        </FormControl>

        <FormControl id="feedback">
          <FormLabel>Feedback (optional)</FormLabel>
          <Textarea
            placeholder="Share your experience with this class..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            isDisabled={isExistingReview || isSubmitting}
            maxLength={500}
            resize="vertical"
            rows={4}
          />
          <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
            {feedback.length}/500
          </Text>
        </FormControl>

        {error && <ErrorDisplay message={error} />}

        {!isExistingReview && (
          <Button
            colorScheme="blue"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            mt={2}
          >
            Submit Review
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default ReviewForm;

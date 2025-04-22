import {
  Box,
  Flex,
  Progress,
  SimpleGrid,
  Stack,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  Avatar,
  Divider,
  Heading,
  HStack,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { ClassRatingSummary, Review } from "../types";
import { formatDate } from "../utils/dateUtils";

interface ReviewDisplayProps {
  summary: ClassRatingSummary;
  reviews: Review[];
  isLoading?: boolean;
}

const ReviewDisplay = ({
  summary,
  reviews,
  isLoading = false,
}: ReviewDisplayProps) => {
  const { averageRating, totalReviews, ratingDistribution } = summary;

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <Flex>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            color={rating >= star ? "yellow.400" : "gray.200"}
            boxSize={4}
            mr={1}
          />
        ))}
      </Flex>
    );
  };

  // Calculate percentages for the distribution bars
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="md"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.200"
    >
      <Heading size="md" mb={6}>
        Reviews and Ratings
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={8}>
        {/* Left side: Average rating and stats */}
        <Box>
          <StatGroup mb={6}>
            <Stat textAlign="center">
              <StatLabel fontSize="md">Average Rating</StatLabel>
              <StatNumber fontSize="3xl" fontWeight="bold">
                {averageRating ? averageRating.toFixed(1) : "0.0"}
              </StatNumber>
              <StatHelpText>
                <Flex justifyContent="center" mt={1}>
                  {renderStars(Math.round(averageRating))}
                </Flex>
              </StatHelpText>
            </Stat>

            <Stat textAlign="center">
              <StatLabel fontSize="md">Total Reviews</StatLabel>
              <StatNumber fontSize="3xl" fontWeight="bold">
                {totalReviews}
              </StatNumber>
              <StatHelpText>From verified users</StatHelpText>
            </Stat>
          </StatGroup>
        </Box>

        {/* Right side: Rating distribution */}
        <Box>
          <Stack spacing={2}>
            <Text fontSize="md" fontWeight="medium" mb={1}>
              Rating Distribution
            </Text>

            <Flex align="center">
              <Text w="60px" fontSize="sm">
                5 Stars
              </Text>
              <Progress
                value={getPercentage(ratingDistribution.fiveStars)}
                size="sm"
                colorScheme="yellow"
                flex="1"
                mr={2}
              />
              <Text fontSize="sm" w="40px">
                {ratingDistribution.fiveStars}
              </Text>
            </Flex>

            <Flex align="center">
              <Text w="60px" fontSize="sm">
                4 Stars
              </Text>
              <Progress
                value={getPercentage(ratingDistribution.fourStars)}
                size="sm"
                colorScheme="yellow"
                flex="1"
                mr={2}
              />
              <Text fontSize="sm" w="40px">
                {ratingDistribution.fourStars}
              </Text>
            </Flex>

            <Flex align="center">
              <Text w="60px" fontSize="sm">
                3 Stars
              </Text>
              <Progress
                value={getPercentage(ratingDistribution.threeStars)}
                size="sm"
                colorScheme="yellow"
                flex="1"
                mr={2}
              />
              <Text fontSize="sm" w="40px">
                {ratingDistribution.threeStars}
              </Text>
            </Flex>

            <Flex align="center">
              <Text w="60px" fontSize="sm">
                2 Stars
              </Text>
              <Progress
                value={getPercentage(ratingDistribution.twoStars)}
                size="sm"
                colorScheme="yellow"
                flex="1"
                mr={2}
              />
              <Text fontSize="sm" w="40px">
                {ratingDistribution.twoStars}
              </Text>
            </Flex>

            <Flex align="center">
              <Text w="60px" fontSize="sm">
                1 Star
              </Text>
              <Progress
                value={getPercentage(ratingDistribution.oneStar)}
                size="sm"
                colorScheme="yellow"
                flex="1"
                mr={2}
              />
              <Text fontSize="sm" w="40px">
                {ratingDistribution.oneStar}
              </Text>
            </Flex>
          </Stack>
        </Box>
      </SimpleGrid>

      <Divider mb={6} />

      {/* Review list */}
      <Box>
        <Heading size="sm" mb={4}>
          Recent Reviews
        </Heading>

        {isLoading ? (
          <Text>Loading reviews...</Text>
        ) : reviews.length > 0 ? (
          <Stack spacing={4} divider={<Divider />}>
            {reviews.map((review) => (
              <Box key={review.id} py={2}>
                <HStack spacing={4} mb={2}>
                  <Avatar size="sm" name={review.user?.name || "User"} />
                  <Box>
                    <Text fontWeight="medium">
                      {review.user?.name || "Anonymous"}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatDate(review.createdAt)}
                    </Text>
                  </Box>
                </HStack>

                <Flex mb={2}>{renderStars(review.rating)}</Flex>

                {review.feedback && (
                  <Text fontSize="sm" color="gray.700">
                    {review.feedback}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Text color="gray.500">
            No reviews yet. Be the first to leave a review!
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default ReviewDisplay;

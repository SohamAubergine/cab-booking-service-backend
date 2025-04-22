import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Input,
  Select,
  Stack,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Badge,
  Divider,
  useToast,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Skeleton,
  SkeletonText,
  HStack,
  IconButton,
  SimpleGrid,
  useColorModeValue,
  Tag,
  TagLabel,
  Icon,
  Tooltip,
  Alert,
  AlertIcon,
  VStack,
} from "@chakra-ui/react";
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  TimeIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import {
  FaChalkboardTeacher,
  FaFilter,
  FaLayerGroup,
  FaCalendarCheck,
  FaRegCalendarAlt,
  FaUsers,
} from "react-icons/fa";
import { format } from "date-fns";
import {
  fitnessClassService,
  categoryService,
  userService,
} from "../../services/api";
import { FitnessClass, FitnessClassFilters, Category, User } from "../../types";
import { useNavigate } from "react-router-dom";
import Loading, { InlineLoading } from "../../components/Loading";
import ErrorDisplay from "../../components/ErrorDisplay";
import * as toastUtils from "../../utils/toast";
import { motion } from "framer-motion";

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionCard = motion(Card);

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
  hover: {
    y: -5,
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: { duration: 0.2 },
  },
};

const ClassList = () => {
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isInstructorsLoading, setIsInstructorsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FitnessClassFilters>({
    page: 1,
    limit: 12,
    name: "",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(
    null
  );
  const toast = useToast();
  const navigate = useNavigate();

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const cardHeaderBg = useColorModeValue("purple.50", "purple.900");
  const accentColor = "purple";

  const fetchCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const response = await categoryService.getCategories();
      if (response.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch categories";
      console.error(errorMessage);
      // Don't set global error for categories - just show empty state
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      setIsInstructorsLoading(true);
      const response = await userService.getInstructors();
      if (response.success) {
        setInstructors(response.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch instructors";
      console.error(errorMessage);
      // Don't set global error for instructors - just show empty state
    } finally {
      setIsInstructorsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fitnessClassService.getClasses(filters);

      if (response.success) {
        setClasses(response.data.data);
        setTotalPages(response.data.meta.totalPages);
      } else {
        setError(response.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch classes";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchInstructors();
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleBookClass = async (classId: string, className: string) => {
    try {
      setBookingInProgress(classId);
      const response = await fitnessClassService.bookClass(classId);

      if (response.success) {
        toast(toastUtils.bookingSuccessToast(className));
        // Refresh the class list
        fetchClasses();
      } else {
        toast(toastUtils.bookingErrorToast(response.message));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to book class";
      toast(toastUtils.errorToast("Booking Failed", errorMessage));
    } finally {
      setBookingInProgress(null);
    }
  };

  const handleViewDetails = (classId: string) => {
    navigate(`/classes/${classId}`);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };

  const handleChangePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  };

  const handleClearError = () => {
    setError(null);
  };

  const getCategoryColor = (categoryName: string = "") => {
    // Map categories to colors for visual distinction
    const categoryColors: Record<string, string> = {
      Yoga: "green",
      Cardio: "red",
      "Strength Training": "orange",
      Pilates: "blue",
      HIIT: "pink",
      Zumba: "purple",
    };

    return categoryColors[categoryName] || "gray";
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      name: "",
      categoryId: undefined,
      instructorId: undefined,
    });
  };

  const renderClassCards = () => {
    if (isLoading) {
      // Show skeleton loaders while loading
      return Array(6)
        .fill(0)
        .map((_, index) => (
          <MotionCard
            key={`skeleton-${index}`}
            variants={cardVariants}
            boxShadow="md"
            borderRadius="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor={cardBorder}
          >
            <CardHeader bg={cardHeaderBg} pb={3}>
              <Skeleton height="24px" width="80%" mb={2} />
              <Skeleton height="20px" width="40%" />
            </CardHeader>
            <CardBody pt={4}>
              <Stack spacing={3}>
                <SkeletonText noOfLines={4} spacing={3} />
              </Stack>
            </CardBody>
            <CardFooter>
              <Stack spacing={3} width="100%">
                <Skeleton height="40px" />
                <Skeleton height="40px" />
              </Stack>
            </CardFooter>
          </MotionCard>
        ));
    }

    if (!isLoading && classes.length === 0) {
      return (
        <Box
          textAlign="center"
          p={10}
          borderRadius="lg"
          border="1px dashed"
          borderColor={cardBorder}
          gridColumn="1 / -1"
          bg={cardBg}
        >
          <Icon
            as={FaRegCalendarAlt}
            boxSize="50px"
            color={`${accentColor}.400`}
            mb={4}
          />
          <Heading as="h3" size="md" mb={2}>
            No classes found
          </Heading>
          <Text color={textColor} mb={6}>
            No fitness classes match your current filters
          </Text>
          <Button
            colorScheme={accentColor}
            leftIcon={<FaFilter />}
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </Box>
      );
    }

    return classes.map((fitnessClass) => (
      <MotionCard
        key={fitnessClass.id}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        boxShadow="md"
        borderRadius="lg"
        overflow="hidden"
        borderWidth="1px"
        borderColor={cardBorder}
      >
        <CardHeader bg={cardHeaderBg} pb={3}>
          <Flex justifyContent="space-between" alignItems="flex-start">
            <VStack align="flex-start" spacing={1}>
              <Heading size="md" color={headingColor}>
                {fitnessClass.name}
              </Heading>
              {fitnessClass.category && (
                <Tag
                  size="md"
                  colorScheme={getCategoryColor(fitnessClass.category.name)}
                  borderRadius="full"
                >
                  <TagLabel>{fitnessClass.category.name}</TagLabel>
                </Tag>
              )}
            </VStack>
          </Flex>
        </CardHeader>

        <CardBody pt={4}>
          <VStack spacing={3} align="stretch">
            <HStack>
              <Icon
                as={FaChalkboardTeacher}
                color={`${accentColor}.500`}
                boxSize={4}
              />
              <Text fontWeight="medium">
                {fitnessClass.instructor?.name || "Not specified"}
              </Text>
            </HStack>

            <HStack>
              <Icon
                as={CalendarIcon}
                color={`${accentColor}.500`}
                boxSize={4}
              />
              <Text fontSize="sm">{formatDateTime(fitnessClass.startsAt)}</Text>
            </HStack>

            <HStack>
              <Icon as={TimeIcon} color={`${accentColor}.500`} boxSize={4} />
              <Text fontSize="sm">
                to {formatDateTime(fitnessClass.endsAt)}
              </Text>
            </HStack>

            <HStack>
              <Icon as={FaUsers} color={`${accentColor}.500`} boxSize={4} />
              <Text fontSize="sm">
                Capacity: {fitnessClass.capacity} participants
              </Text>
            </HStack>
          </VStack>
        </CardBody>

        <Divider />

        <CardFooter>
          <VStack spacing={2} width="100%">
            <Button
              colorScheme={accentColor}
              leftIcon={<FaCalendarCheck />}
              w="100%"
              onClick={() =>
                handleBookClass(fitnessClass.id, fitnessClass.name)
              }
              isLoading={bookingInProgress === fitnessClass.id}
              loadingText="Booking..."
              boxShadow="sm"
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              transition="all 0.2s"
            >
              Book Now
            </Button>
            <Button
              variant="outline"
              colorScheme={accentColor}
              leftIcon={<ViewIcon />}
              w="100%"
              onClick={() => handleViewDetails(fitnessClass.id)}
              _hover={{ bg: `${accentColor}.50` }}
            >
              View Details
            </Button>
          </VStack>
        </CardFooter>
      </MotionCard>
    ));
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
            Available Fitness Classes
          </Heading>
          <Text color={textColor}>
            Browse and book fitness classes for your next workout
          </Text>
        </Box>
      </MotionFlex>

      {error && (
        <ErrorDisplay error={error} onClear={handleClearError} mb={6} />
      )}

      {/* Filter Form */}
      <MotionCard
        variants={itemVariants}
        as="form"
        onSubmit={handleSearch}
        bg={cardBg}
        borderWidth="1px"
        borderColor={cardBorder}
        borderRadius="lg"
        boxShadow="sm"
        overflow="hidden"
        mb={8}
      >
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <FormControl>
              <FormLabel fontWeight="medium">Class Name</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by name"
                  value={filters.name || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, name: e.target.value }))
                  }
                  focusBorderColor={`${accentColor}.400`}
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium">Category</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaLayerGroup} color="gray.400" />
                </InputLeftElement>
                <Select
                  placeholder="All Categories"
                  value={filters.categoryId || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      categoryId: e.target.value || undefined,
                      page: 1, // Reset to first page when filtering
                    }))
                  }
                  isDisabled={isCategoriesLoading}
                  pl={10}
                  focusBorderColor={`${accentColor}.400`}
                >
                  {isCategoriesLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </Select>
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium">Instructor</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaChalkboardTeacher} color="gray.400" />
                </InputLeftElement>
                <Select
                  placeholder="All Instructors"
                  value={filters.instructorId || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      instructorId: e.target.value || undefined,
                      page: 1, // Reset to first page when filtering
                    }))
                  }
                  isDisabled={isInstructorsLoading}
                  pl={10}
                  focusBorderColor={`${accentColor}.400`}
                >
                  {isInstructorsLoading ? (
                    <option disabled>Loading instructors...</option>
                  ) : (
                    instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </option>
                    ))
                  )}
                </Select>
              </InputGroup>
            </FormControl>

            <HStack alignSelf="flex-end" spacing={3} w="100%">
              <Button
                colorScheme={accentColor}
                type="submit"
                isLoading={isLoading}
                loadingText="Filtering..."
                width="100%"
                leftIcon={<FaFilter />}
                boxShadow="md"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                Apply Filters
              </Button>
              <Tooltip label="Clear all filters">
                <IconButton
                  aria-label="Clear filters"
                  icon={<Icon as={FaFilter} />}
                  onClick={handleClearFilters}
                  variant="outline"
                  colorScheme={accentColor}
                />
              </Tooltip>
            </HStack>
          </SimpleGrid>
        </CardBody>
      </MotionCard>

      {/* Main Content - Class Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6} mb={8}>
        {renderClassCards()}
      </SimpleGrid>

      {/* Pagination */}
      {totalPages > 1 && (
        <MotionFlex variants={itemVariants} justify="center" mt={4}>
          <HStack spacing={2}>
            <Button
              leftIcon={<ChevronLeftIcon />}
              onClick={() => handleChangePage(filters.page! - 1)}
              isDisabled={filters.page === 1}
              variant="outline"
              colorScheme={accentColor}
              size="sm"
            >
              Previous
            </Button>
            <Text fontWeight="medium" mx={2}>
              Page {filters.page} of {totalPages}
            </Text>
            <Button
              rightIcon={<ChevronRightIcon />}
              onClick={() => handleChangePage(filters.page! + 1)}
              isDisabled={filters.page === totalPages}
              variant="outline"
              colorScheme={accentColor}
              size="sm"
            >
              Next
            </Button>
          </HStack>
        </MotionFlex>
      )}
    </MotionBox>
  );
};

export default ClassList;

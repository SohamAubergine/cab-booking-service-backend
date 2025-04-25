import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Badge,
  Flex,
  useToast,
  Skeleton,
  SkeletonText,
  VStack,
  Icon,
  useColorModeValue,
  Container,
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaClock,
  FaChevronLeft,
} from "react-icons/fa";
import { MdFitnessCenter } from "react-icons/md";
import { format } from "date-fns";
import { FitnessClass, Gym, PaginatedResponse } from "../../types";
import { fitnessClassService } from "../../services/api";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import { Link, useParams, useNavigate } from "react-router-dom";
import ClassCard from "../../components/class/ClassCard";
import { motion } from "framer-motion";

// Motion components
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

const GymClasses = () => {
  const { gymId } = useParams<{ gymId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Colors
  const accentColor = "purple";
  const headingColor = useColorModeValue("purple.800", "purple.100");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const cardBorderColor = useColorModeValue("purple.100", "purple.700");

  useEffect(() => {
    if (gymId) {
      fetchClasses(1);
    }
  }, [gymId, searchQuery, categoryFilter]);

  const fetchClasses = async (page: number) => {
    if (!gymId) return;

    setLoading(true);
    setError(null);

    try {
      // Build filters object
      const filters: any = {
        page,
        limit: 9,
      };

      if (searchQuery.trim()) {
        filters.name = searchQuery.trim();
      }

      if (categoryFilter) {
        filters.categoryId = categoryFilter;
      }

      const response = await fitnessClassService.getGymClasses(gymId, filters);

      if (!response.success) {
        throw new Error(response.message || "Failed to load fitness classes");
      }

      const paginatedData = response.data as PaginatedResponse<FitnessClass>;

      // Get gym info from the first class if available
      if (paginatedData.data.length > 0 && paginatedData.data[0].gym) {
        setGym(paginatedData.data[0].gym);
      }

      setClasses(paginatedData.data);
      setPagination({
        currentPage: paginatedData.meta.page,
        totalPages: paginatedData.meta.totalPages,
        totalItems: paginatedData.meta.total,
      });
    } catch (err) {
      console.error("Error fetching gym classes:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load fitness classes";
      setError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchClasses(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
  };

  // Loading state
  if (loading && !classes.length) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center" wrap="wrap">
            <Heading as="h1" size="xl" color={headingColor} mb={2}>
              Gym Classes
            </Heading>
            <Skeleton height="40px" width="150px" />
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                boxShadow="lg"
                height="100%"
                borderWidth="1px"
                borderColor={cardBorderColor}
                borderRadius="xl"
              >
                <Skeleton height="200px" />
                <CardHeader>
                  <SkeletonText
                    mt="2"
                    noOfLines={1}
                    spacing="4"
                    skeletonHeight="6"
                  />
                </CardHeader>
                <CardBody pt={0}>
                  <SkeletonText mt="2" noOfLines={3} spacing="4" />
                </CardBody>
                <CardFooter>
                  <Skeleton height="40px" width="100%" />
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        title="Error Loading Classes"
        message={error}
        icon={MdFitnessCenter}
        actionText="Try Again"
        onActionClick={() => fetchClasses(1)}
      />
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <MotionFlex
          variants={itemVariants}
          justify="space-between"
          align="center"
          mb={6}
          wrap="wrap"
        >
          <HStack spacing={3} mb={{ base: 4, md: 0 }}>
            <Button
              variant="outline"
              colorScheme={accentColor}
              size="sm"
              leftIcon={<FaChevronLeft />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Box>
              <Heading as="h1" size="xl" color={headingColor}>
                {gym ? gym.name : "Gym"} Classes
              </Heading>
              {gym && (
                <Flex align="center" mt={1}>
                  <Icon
                    as={FaMapMarkerAlt}
                    color={`${accentColor}.500`}
                    mr={1}
                  />
                  <Text color="gray.500" fontSize="sm">
                    {gym.address}
                  </Text>
                </Flex>
              )}
            </Box>
          </HStack>
        </MotionFlex>

        {/* Filters */}
        <MotionBox variants={itemVariants} mb={6}>
          <Card bgColor={cardBgColor} borderRadius="lg" boxShadow="md" p={4}>
            <Flex direction={{ base: "column", md: "row" }} gap={4}>
              <InputGroup flex="1">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search classes"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </InputGroup>

              <Select
                placeholder="Filter by category"
                value={categoryFilter}
                onChange={handleCategoryChange}
                width={{ base: "100%", md: "200px" }}
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="yoga">Yoga</option>
                <option value="pilates">Pilates</option>
              </Select>

              <Button
                leftIcon={<FaFilter />}
                colorScheme={accentColor}
                variant="outline"
                onClick={handleResetFilters}
                width={{ base: "100%", md: "auto" }}
              >
                Reset Filters
              </Button>
            </Flex>
          </Card>
        </MotionBox>

        {/* Classes List */}
        {classes.length === 0 ? (
          <MotionBox variants={itemVariants}>
            <EmptyState
              title="No Classes Found"
              message="There are no fitness classes available for this gym matching your filters."
              icon={MdFitnessCenter}
              actionText="Reset Filters"
              onActionClick={handleResetFilters}
            />
          </MotionBox>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
              {classes.map((fitnessClass) => (
                <MotionBox key={fitnessClass.id} variants={itemVariants}>
                  <ClassCard fitnessClass={fitnessClass} />
                </MotionBox>
              ))}
            </SimpleGrid>

            {pagination.totalPages > 1 && (
              <MotionBox variants={itemVariants} mb={6}>
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </MotionBox>
            )}
          </>
        )}
      </MotionBox>
    </Container>
  );
};

export default GymClasses;

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  useColorModeValue,
  useDisclosure,
  VStack,
  Text,
  Icon,
  useToast,
  TableContainer,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { MdFitnessCenter } from "react-icons/md";
import { motion } from "framer-motion";
import {
  createFitnessClass,
  deleteFitnessClass,
  getFitnessClasses,
  getCategories,
  getInstructors,
  getGyms,
  updateFitnessClass,
} from "../../services/api";
import { FitnessClass, ClassCategory, Instructor, Gym } from "../../types";
import { AxiosError } from "axios";
import { AnimatePresence } from "framer-motion";
import ClassForm from "../../components/class/ClassForm";
import ClassListItem from "../../components/class/ClassListItem";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";

const MotionBox = motion(Box);

const ClassManagement: React.FC = () => {
  const toast = useToast();
  const [fitnessClasses, setFitnessClasses] = useState<FitnessClass[]>([]);
  const [categories, setCategories] = useState<ClassCategory[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedClass, setSelectedClass] = useState<FitnessClass | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Category, Instructor and Gym loading states
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
  const [isInstructorsLoading, setIsInstructorsLoading] =
    useState<boolean>(true);
  const [isGymsLoading, setIsGymsLoading] = useState<boolean>(true);

  // Modal controls
  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  // Colors
  const cardBgColor = useColorModeValue("white", "gray.800");
  const accentColor = "purple";

  // Fetch all necessary data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const classesData = await getFitnessClasses();
      setFitnessClasses(classesData);
    } catch (error) {
      console.error("Error fetching fitness classes:", error);
      toast({
        title: "Error fetching classes",
        description: "Unable to load fitness classes",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error fetching categories",
        description: "Unable to load class categories",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [toast]);

  const fetchInstructors = useCallback(async () => {
    setIsInstructorsLoading(true);
    try {
      const instructorsData = await getInstructors();
      setInstructors(instructorsData);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      toast({
        title: "Error fetching instructors",
        description: "Unable to load instructors",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsInstructorsLoading(false);
    }
  }, [toast]);

  const fetchGyms = useCallback(async () => {
    setIsGymsLoading(true);
    try {
      const gymsData = await getGyms();
      setGyms(gymsData);
    } catch (error) {
      console.error("Error fetching gyms:", error);
      toast({
        title: "Error fetching gyms",
        description: "Unable to load gyms",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGymsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchInstructors();
    fetchGyms();
  }, [fetchData, fetchCategories, fetchInstructors, fetchGyms]);

  // Handle class operations
  const handleCreateClass = async (classData: Partial<FitnessClass>) => {
    try {
      await createFitnessClass(classData);
      toast({
        title: "Class created",
        description: "Fitness class has been created successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchData(); // Refresh the list
      onFormClose();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Error creating class:", axiosError);
      toast({
        title: "Error creating class",
        description:
          axiosError.response?.data?.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateClass = async (classData: Partial<FitnessClass>) => {
    if (!selectedClass?.id) return;

    try {
      await updateFitnessClass(selectedClass.id, classData);
      toast({
        title: "Class updated",
        description: "Fitness class has been updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchData(); // Refresh the list
      onFormClose();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Error updating class:", axiosError);
      toast({
        title: "Error updating class",
        description:
          axiosError.response?.data?.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass?.id) return;

    setIsDeleting(true);
    try {
      await deleteFitnessClass(selectedClass.id);
      toast({
        title: "Class deleted",
        description: "Fitness class has been deleted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFitnessClasses((classes) =>
        classes.filter((c) => c.id !== selectedClass.id)
      );
      onDeleteModalClose();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Error deleting class:", axiosError);
      toast({
        title: "Error deleting class",
        description:
          axiosError.response?.data?.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (fitnessClass: FitnessClass) => {
    setSelectedClass(fitnessClass);
    onFormOpen();
  };

  const handleDelete = (fitnessClass: FitnessClass) => {
    setSelectedClass(fitnessClass);
    onDeleteModalOpen();
  };

  const handleAddNew = () => {
    setSelectedClass(null);
    onFormOpen();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container maxW="container.xl" py={8}>
      <MotionBox
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <VStack spacing={8} align="stretch">
          <motion.div variants={headerVariants}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              mb={6}
              flexDir={{ base: "column", md: "row" }}
              gap={4}
            >
              <Flex alignItems="center">
                <Icon
                  as={MdFitnessCenter}
                  w={8}
                  h={8}
                  color={`${accentColor}.500`}
                  mr={3}
                />
                <Heading size="lg">Fitness Class Management</Heading>
              </Flex>
              <Button
                leftIcon={<FiPlus />}
                colorScheme={accentColor}
                onClick={handleAddNew}
                size="md"
                fontWeight="bold"
                boxShadow="sm"
              >
                Add New Class
              </Button>
            </Flex>
          </motion.div>

          {isLoading ? (
            <Box textAlign="center" py={10}>
              <Text>Loading classes...</Text>
            </Box>
          ) : fitnessClasses.length === 0 ? (
            <Box
              bg={cardBgColor}
              p={8}
              borderRadius="xl"
              textAlign="center"
              boxShadow="md"
            >
              <Text fontSize="lg" mb={4}>
                No fitness classes found
              </Text>
              <Button
                colorScheme={accentColor}
                onClick={handleAddNew}
                size="md"
              >
                Create Your First Class
              </Button>
            </Box>
          ) : (
            <Box
              bg={cardBgColor}
              p={6}
              borderRadius="xl"
              boxShadow="md"
              overflowX="auto"
            >
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Class Details</Th>
                      <Th>Category</Th>
                      <Th>Instructor</Th>
                      <Th>Gym</Th>
                      <Th>Time</Th>
                      <Th>Capacity</Th>
                      <Th width="100px">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <AnimatePresence>
                      {fitnessClasses.map((fitnessClass) => (
                        <ClassListItem
                          key={fitnessClass.id}
                          fitnessClass={fitnessClass}
                          onEdit={() => handleEdit(fitnessClass)}
                          onDelete={() => handleDelete(fitnessClass)}
                          accentColor={accentColor}
                        />
                      ))}
                    </AnimatePresence>
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </VStack>
      </MotionBox>

      {/* Class Form Modal */}
      {isFormOpen && (
        <ClassForm
          isOpen={isFormOpen}
          onClose={onFormClose}
          onSubmit={selectedClass ? handleUpdateClass : handleCreateClass}
          initialValues={selectedClass || undefined}
          isCategoriesLoading={isCategoriesLoading}
          isInstructorsLoading={isInstructorsLoading}
          isGymsLoading={isGymsLoading}
          categories={categories}
          instructors={instructors}
          gyms={gyms}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        onConfirm={handleDeleteClass}
        title="Delete Fitness Class"
        itemName={selectedClass?.name || ""}
        itemType="fitness class"
        isDeleting={isDeleting}
      />
    </Container>
  );
};

export default ClassManagement;

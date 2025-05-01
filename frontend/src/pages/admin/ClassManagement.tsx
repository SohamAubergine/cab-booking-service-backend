import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  useDisclosure,
  Flex,
  useToast,
  Spinner,
  Text,
  TableContainer,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Container,
  Heading,
} from "@chakra-ui/react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminService, categoryService } from "../../services/api";
import { Category, FitnessClass, Gym, User } from "../../types";
import ClassForm, {
  fitnessClassSchema,
  FitnessClassFormData,
} from "../../components/class/ClassForm";
import ClassListItem from "../../components/class/ClassListItem";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";

// Page Header Component
const AdminPageHeader: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => {
  return (
    <Box mb={8}>
      <Heading as="h1" size="xl" mb={2}>
        {title}
      </Heading>
      <Text color="gray.500">{subtitle}</Text>
    </Box>
  );
};

// Empty State Component
const EmptyState: React.FC<{
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      py={10}
      px={6}
    >
      <Heading as="h2" size="lg" mt={6} mb={2}>
        {title}
      </Heading>
      <Text color="gray.500" mb={6}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button colorScheme="brand" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Flex>
  );
};

// Page Container Component
const PageContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Container maxW="container.xl" py={8}>
      {children}
    </Container>
  );
};

const ClassManagement: React.FC = () => {
  // State variables
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<FitnessClass | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<FitnessClassFormData>({
    resolver: zodResolver(fitnessClassSchema),
  });

  // Toast notification
  const toast = useToast();

  // Modal controls
  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // Background colors
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const tableBorderColor = useColorModeValue("gray.200", "gray.600");

  // Fetch data on component mount
  useEffect(() => {
    fetchClassesAndData();
  }, []);

  // Function to fetch all classes, categories, instructors, and gyms
  const fetchClassesAndData = async () => {
    setIsLoading(true);
    try {
      const [
        classesResponse,
        categoriesResponse,
        instructorsResponse,
        gymsResponse,
      ] = await Promise.all([
        adminService.getAllClasses(),
        categoryService.getCategories(),
        adminService.getAllInstructors(),
        adminService.getGyms(),
      ]);

      if (classesResponse.success) setClasses(classesResponse.data.data);
      if (categoriesResponse.success)
        setCategories(categoriesResponse.data.data);
      if (instructorsResponse.success)
        setInstructors(instructorsResponse.data.data);
      if (gymsResponse.success) setGyms(gymsResponse.data.data);
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: "Unable to load fitness classes and related data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter classes based on search query
  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gym?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Setup form with existing class data
  useEffect(() => {
    if (selectedClass && isFormOpen) {
      setValue("name", selectedClass.name);
      setValue("categoryId", selectedClass.categoryId);
      setValue("instructorId", selectedClass.instructorId);
      setValue("gymId", selectedClass.gymId);
    setValue(
      "startsAt",
        new Date(selectedClass.startsAt).toISOString().slice(0, 16)
    );
    setValue(
      "endsAt",
        new Date(selectedClass.endsAt).toISOString().slice(0, 16)
      );
      setValue("capacity", selectedClass.capacity);
      } else {
      reset();
    }
  }, [selectedClass, isFormOpen, setValue, reset]);

  // Handle class form submission (create or update)
  const onSubmit = async (data: FitnessClassFormData) => {
    setIsSubmitting(true);
    try {
      // Format dates with proper ISO format for the backend
      const formattedData = {
        ...data,
        startsAt: new Date(data.startsAt).toISOString(),
        endsAt: new Date(data.endsAt).toISOString(),
      };

      if (selectedClass) {
        // Update existing class
        const response = await adminService.updateClass(
          selectedClass.id,
          formattedData
        );
        if (response.success) {
          setClasses(
            classes.map((c) => (c.id === selectedClass.id ? response.data : c))
          );
          toast({
            title: "Class updated",
            description: `${data.name} has been updated successfully`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else if (response.extra?.details) {
          // Show validation errors from the backend
          toast({
            title: "Validation Error",
            description: response.extra.details,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        // Create new class
        const response = await adminService.createClass(formattedData);
        if (response.success) {
          setClasses([...classes, response.data]);
          toast({
            title: "Class created",
            description: `${data.name} has been created successfully`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else if (response.extra?.details) {
          // Show validation errors from the backend
          toast({
            title: "Validation Error",
            description: response.extra.details,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }

      onFormClose();
    } catch (error) {
      toast({
        title: "Error",
        description: selectedClass
          ? "Failed to update class. Please try again."
          : "Failed to create class. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit button click
  const handleEdit = (id: string) => {
    const classToEdit = classes.find((c) => c.id === id);
    if (classToEdit) {
      setSelectedClass(classToEdit);
      onFormOpen();
    }
  };

  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    const classToDelete = classes.find((c) => c.id === id);
    if (classToDelete) {
      setSelectedClass(classToDelete);
      onDeleteOpen();
    }
  };

  // Handle class deletion confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedClass) return;

    setIsDeleting(true);
    try {
      const response = await adminService.deleteClass(selectedClass.id);
      if (response.success) {
        setClasses(classes.filter((c) => c.id !== selectedClass.id));
        toast({
          title: "Class deleted",
          description: `${selectedClass.name} has been deleted successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      onDeleteClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setSelectedClass(null);
    }
  };

  // Handle "Add Class" button click
  const handleAddClass = () => {
    setSelectedClass(null);
    onFormOpen();
  };

  return (
    <PageContainer>
      <AdminPageHeader
        title="Class Management"
        subtitle="Create, edit, and delete fitness classes"
      />

      {/* Search and Add button */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={6}
        direction={{ base: "column", md: "row" }}
        gap={{ base: 4, md: 0 }}
      >
        <InputGroup maxW={{ base: "full", md: "320px" }}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius="md"
          />
        </InputGroup>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={handleAddClass}
          w={{ base: "full", md: "auto" }}
        >
          Add Class
        </Button>
      </Flex>

      {/* Classes table */}
      {isLoading ? (
        <Flex justify="center" align="center" h="200px" direction="column">
          <Spinner size="xl" mb={4} />
          <Text>Loading classes...</Text>
        </Flex>
      ) : filteredClasses.length > 0 ? (
        <Box overflowX="auto">
          <TableContainer>
            <Table
              variant="simple"
              size="md"
        borderWidth="1px"
              borderColor={tableBorderColor}
              borderRadius="md"
            >
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th>Class</Th>
                  <Th>Category</Th>
                  <Th>Instructor</Th>
                  <Th>Gym</Th>
                  <Th>Schedule</Th>
                  <Th>Capacity</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredClasses.map((fitnessClass) => (
                  <ClassListItem
                    key={fitnessClass.id}
                    fitnessClass={fitnessClass}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    accentColor="blue"
                  />
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <EmptyState
          title="No classes found"
          description={
            searchQuery
              ? "We couldn't find any classes matching your search"
              : "You haven't created any fitness classes yet"
          }
          icon="class"
          actionLabel={searchQuery ? "Clear search" : "Create your first class"}
          onAction={searchQuery ? () => setSearchQuery("") : handleAddClass}
        />
      )}

      {/* Class Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedClass ? "Edit Class" : "Add New Class"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ClassForm
              register={register}
              errors={errors}
              categories={categories}
              instructors={instructors}
              gyms={gyms}
              isCategoriesLoading={false}
              isInstructorsLoading={false}
              isGymsLoading={false}
              accentColor="blue"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onFormClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              isLoading={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              {selectedClass ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      {selectedClass && (
        <DeleteConfirmationModal
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          onConfirm={handleDeleteConfirm}
          title="Delete Class"
          itemName={selectedClass.name}
          itemType="class"
          isDeleting={isDeleting}
        />
      )}
    </PageContainer>
  );
};

export default ClassManagement;

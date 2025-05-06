import { useState, useEffect } from "react";
import { FitnessClass, Category, User, Gym } from "../types";
import { adminService, categoryService } from "../services/api";
import { useToast } from "@chakra-ui/react";
import { FitnessClassFormData } from "../components/class/ClassForm";

export const useClassManagement = () => {
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

  // Toast notification
  const toast = useToast();

  // Fetch all classes, categories, instructors, and gyms
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

  // Initial data load
  useEffect(() => {
    fetchClassesAndData();
  }, []);

  // Filter classes based on search query
  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gym?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submission (create or update)
  const handleFormSubmit = async (data: FitnessClassFormData) => {
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
          return true;
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
          return true;
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
      return false;
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
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle class deletion
  const handleDeleteClass = async () => {
    if (!selectedClass) return false;

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
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    classes: filteredClasses,
    categories,
    instructors,
    gyms,
    isLoading,
    isDeleting,
    isSubmitting,
    searchQuery,
    selectedClass,
    setSearchQuery,
    setSelectedClass,
    handleFormSubmit,
    handleDeleteClass,
    fetchClassesAndData,
  };
};

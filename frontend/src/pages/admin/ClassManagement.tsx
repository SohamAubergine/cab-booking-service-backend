import React, { useState } from "react";
import { Flex, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import { useClassManagement } from "../../hooks/useClassManagement";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import PageContainer from "../../components/common/PageContainer";
import EmptyState from "../../components/common/EmptyState";
import ClassesTable from "../../components/class/ClassesTable";
import ClassSearchBar from "../../components/admin/ClassSearchBar";
import ClassFormModal from "../../components/class/ClassFormModal";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import { FitnessClassFormData } from "../../components/class/ClassForm";

const ClassManagement: React.FC = () => {
  // Use custom hook for class management
  const {
    classes,
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
  } = useClassManagement();

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

  // Handle form submission
  const onSubmit = async (data: FitnessClassFormData) => {
    const success = await handleFormSubmit(data);
    if (success) {
      onFormClose();
    }
  };

  // Handle delete confirmation
  const onDeleteConfirm = async () => {
    const success = await handleDeleteClass();
    if (success) {
      onDeleteClose();
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
      {/* Page Header */}
      <AdminPageHeader
        title="Class Management"
        subtitle="Create, edit, and delete fitness classes"
      />

      {/* Search and Add button */}
      <ClassSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleAddClass}
      />

      {/* Classes content */}
      {isLoading ? (
        <Flex justify="center" align="center" h="200px" direction="column">
          <Spinner size="xl" mb={4} />
          <Text>Loading classes...</Text>
        </Flex>
      ) : classes.length > 0 ? (
        <ClassesTable
          classes={classes}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      ) : (
        <EmptyState
          title="No classes found"
          description={
            searchQuery
              ? "We couldn't find any classes matching your search"
              : "You haven't created any fitness classes yet"
          }
          actionLabel={searchQuery ? "Clear search" : "Create your first class"}
          onAction={searchQuery ? () => setSearchQuery("") : handleAddClass}
        />
      )}

      {/* Class Form Modal */}
      <ClassFormModal
        isOpen={isFormOpen}
        onClose={onFormClose}
        onSubmit={onSubmit}
        selectedClass={selectedClass}
        categories={categories}
        instructors={instructors}
        gyms={gyms}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {selectedClass && (
        <DeleteConfirmationModal
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          onConfirm={onDeleteConfirm}
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

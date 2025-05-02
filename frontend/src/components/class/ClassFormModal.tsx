import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { FitnessClass, Category, User, Gym } from "../../types";
import ClassForm from "./ClassForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fitnessClassSchema, FitnessClassFormData } from "./ClassForm";
import { useEffect } from "react";

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FitnessClassFormData) => void;
  selectedClass: FitnessClass | null;
  categories: Category[];
  instructors: User[];
  gyms: Gym[];
  isSubmitting: boolean;
}

const ClassFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedClass,
  categories,
  instructors,
  gyms,
  isSubmitting,
}: ClassFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<FitnessClassFormData>({
    resolver: zodResolver(fitnessClassSchema),
  });

  // Setup form with existing class data
  useEffect(() => {
    if (selectedClass && isOpen) {
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
  }, [selectedClass, isOpen, setValue, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
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
          <Button variant="outline" mr={3} onClick={onClose}>
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
  );
};

export default ClassFormModal;

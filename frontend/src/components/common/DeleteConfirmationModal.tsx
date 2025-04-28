import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
} from "@chakra-ui/react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemType: string;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  isDeleting,
}) => {
  const alertBg = useColorModeValue("red.50", "rgba(254, 178, 178, 0.16)");
  const alertColor = useColorModeValue("red.800", "red.200");

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text mb={4}>
            Are you sure you want to delete {itemType}{" "}
            <strong>{itemName}</strong>?
          </Text>
          <Alert
            status="warning"
            borderRadius="md"
            bg={alertBg}
            color={alertColor}
          >
            <AlertIcon />
            <AlertDescription>This action cannot be undone.</AlertDescription>
          </Alert>
        </ModalBody>

        <ModalFooter>
          <Button
            onClick={onClose}
            mr={3}
            variant="outline"
            isDisabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={onConfirm}
            isLoading={isDeleting}
            loadingText="Deleting..."
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteConfirmationModal;

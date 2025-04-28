import React from "react";
import {
  Tr,
  Td,
  Badge,
  HStack,
  VStack,
  Text,
  IconButton,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { format } from "date-fns";
import { FitnessClass } from "../../types";

interface ClassListItemProps {
  fitnessClass: FitnessClass;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  accentColor?: string;
}

const ClassListItem: React.FC<ClassListItemProps> = ({
  fitnessClass,
  onEdit,
  onDelete,
  accentColor = "blue",
}) => {
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const startTime = new Date(fitnessClass.startsAt);
  const endTime = new Date(fitnessClass.endsAt);

  // Format date and time
  const formatDate = (date: Date) => format(date, "MMM d, yyyy");
  const formatTime = (date: Date) => format(date, "h:mm a");

  // Get category color
  const getCategoryColor = (categoryName: string) => {
    const categoryColors: Record<string, string> = {
      Yoga: "purple",
      Cardio: "red",
      Strength: "orange",
      HIIT: "pink",
      Pilates: "teal",
      Cycling: "blue",
      Dance: "green",
    };

    return categoryColors[categoryName] || "gray";
  };

  return (
    <Tr _hover={{ bg: hoverBg }} transition="background-color 0.2s">
      <Td>
        <Text fontWeight="medium">{fitnessClass.name}</Text>
      </Td>
      <Td>
        <Badge
          colorScheme={getCategoryColor(fitnessClass.category?.name || "")}
          px={2}
          py={1}
          borderRadius="full"
        >
          {fitnessClass.category?.name || "Unknown"}
        </Badge>
      </Td>
      <Td>
        <Text>{fitnessClass.instructor?.name || "Unassigned"}</Text>
      </Td>
      <Td>
        <Text>{fitnessClass.gym?.name || "Unassigned"}</Text>
      </Td>
      <Td>
        <VStack align="start" spacing={0}>
          <Text>{formatDate(startTime)}</Text>
          <Text fontSize="sm" color="gray.500">
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
        </VStack>
      </Td>
      <Td isNumeric>{fitnessClass.capacity}</Td>
      <Td>
        <HStack spacing={2} justifyContent="flex-end">
          <Tooltip label="Edit class">
            <IconButton
              icon={<FiEdit />}
              aria-label="Edit class"
              size="sm"
              colorScheme={accentColor}
              variant="ghost"
              onClick={() => onEdit(fitnessClass.id)}
            />
          </Tooltip>
          <Tooltip label="Delete class">
            <IconButton
              icon={<FiTrash2 />}
              aria-label="Delete class"
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => onDelete(fitnessClass.id)}
            />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  );
};

export default ClassListItem;

import { FitnessClass } from "../../types";
import {
  Box,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  useColorModeValue,
} from "@chakra-ui/react";
import ClassListItem from "./ClassListItem";

interface ClassesTableProps {
  classes: FitnessClass[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ClassesTable = ({ classes, onEdit, onDelete }: ClassesTableProps) => {
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const tableBorderColor = useColorModeValue("gray.200", "gray.600");

  return (
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
            {classes.map((fitnessClass) => (
              <ClassListItem
                key={fitnessClass.id}
                fitnessClass={fitnessClass}
                onEdit={onEdit}
                onDelete={onDelete}
                accentColor="blue"
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClassesTable;

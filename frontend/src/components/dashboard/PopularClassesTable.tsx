import {
  Card,
  CardHeader,
  CardBody,
  Box,
  Heading,
  Text,
  Button,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  HStack,
  Select,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ExtendedFitnessClass } from "../../types/dashboard";

interface PopularClassesTableProps {
  popularClasses: ExtendedFitnessClass[];
  isLoading: boolean;
  textColor: string;
  headingColor: string;
  tableHeaderBg: string;
  tableRowHoverBg: string;
  cardBg: string;
  cardBorder: string;
}

const PopularClassesTable = ({
  popularClasses,
  isLoading,
  textColor,
  headingColor,
  tableHeaderBg,
  tableRowHoverBg,
  cardBg,
  cardBorder,
}: PopularClassesTableProps) => {
  return (
    <Card
      bg={cardBg}
      borderWidth="1px"
      borderColor={cardBorder}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{ boxShadow: "md" }}
    >
      <CardHeader
        pb={0}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Heading size="md" mb={2} color={headingColor}>
            Popular Classes
          </Heading>
          <Text fontSize="sm" color={textColor}>
            Most attended and highest revenue classes
          </Text>
        </Box>
        <HStack>
          <Select
            size="sm"
            width="auto"
            placeholder="Filter by"
            borderRadius="md"
          >
            <option value="all">All Classes</option>
            <option value="active">Active Only</option>
            <option value="revenue">By Revenue</option>
            <option value="attendees">By Attendance</option>
          </Select>
          <Button
            as={RouterLink}
            to="/admin/classes"
            variant="outline"
            colorScheme="purple"
            size="sm"
          >
            Manage All
          </Button>
        </HStack>
      </CardHeader>
      <CardBody>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th>Class</Th>
                <Th isNumeric>Attendees</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading
                ? Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <Tr key={`skeleton-class-${index}`}>
                        <Td>
                          <Skeleton height="40px" />
                        </Td>
                        <Td isNumeric>
                          <Skeleton height="24px" width="60px" />
                        </Td>
                      </Tr>
                    ))
                : popularClasses.map((classItem) => (
                    <Tr
                      key={classItem.id}
                      _hover={{ bg: tableRowHoverBg }}
                      transition="background-color 0.2s"
                    >
                      <Td>
                        <Box>
                          <Text fontWeight="medium">{classItem.name}</Text>
                          <Text fontSize="xs" color={textColor}>
                            by{" "}
                            {classItem.instructor?.name || "Unknown Instructor"}
                          </Text>
                        </Box>
                      </Td>
                      <Td isNumeric fontWeight="medium">
                        {classItem._count?.bookings || 0}
                      </Td>
                    </Tr>
                  ))}
            </Tbody>
          </Table>
        </TableContainer>
        {popularClasses.length === 0 && !isLoading && (
          <Text textAlign="center" py={4} color="gray.500">
            No classes found
          </Text>
        )}
      </CardBody>
    </Card>
  );
};

export default PopularClassesTable;

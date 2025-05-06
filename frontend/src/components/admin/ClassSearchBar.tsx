import {
  Flex,
  Button,
  InputGroup,
  InputLeftElement,
  Input,
} from "@chakra-ui/react";
import { FiPlus, FiSearch } from "react-icons/fi";

interface ClassSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
}

const ClassSearchBar = ({
  searchQuery,
  onSearchChange,
  onAddClick,
}: ClassSearchBarProps) => {
  return (
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
          onChange={(e) => onSearchChange(e.target.value)}
          borderRadius="md"
        />
      </InputGroup>
      <Button
        leftIcon={<FiPlus />}
        colorScheme="blue"
        onClick={onAddClick}
        w={{ base: "full", md: "auto" }}
      >
        Add Class
      </Button>
    </Flex>
  );
};

export default ClassSearchBar;

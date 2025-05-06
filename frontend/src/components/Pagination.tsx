import React from "react";
import {
  Flex,
  Button,
  IconButton,
  Text,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) => {
  const buttonColorScheme = "purple";
  const buttonBgActive = useColorModeValue("purple.500", "purple.300");
  const buttonTextActive = useColorModeValue("white", "gray.800");

  // Create page buttons array
  const getPageButtons = () => {
    // Base case - small number of pages
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate range of buttons to show
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    // Should we show ellipsis
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Defaults
    const firstPage = 1;
    const lastPage = totalPages;

    // Case 1: No left dots but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftRange = Array.from({ length: 3 }, (_, i) => i + 1);
      return [...leftRange, "...", lastPage];
    }

    // Case 2: No right dots but left dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightRange = Array.from({ length: 3 }, (_, i) => lastPage - 2 + i);
      return [firstPage, "...", ...rightRange];
    }

    // Case 3: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPage, "...", ...middleRange, "...", lastPage];
    }

    // Default case (shouldn't reach here)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  const pageButtons = getPageButtons();

  return (
    <Flex justifyContent="center" alignItems="center" my={4}>
      <HStack spacing={1}>
        {/* Previous button */}
        <IconButton
          aria-label="Previous page"
          icon={<FaChevronLeft />}
          size="sm"
          colorScheme={buttonColorScheme}
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
        />

        {/* Page buttons */}
        {pageButtons.map((page, i) => {
          // If page is ellipsis
          if (page === "...") {
            return (
              <Text key={`ellipsis-${i}`} px={2} color="gray.500">
                ...
              </Text>
            );
          }

          // Number button
          return (
            <Button
              key={`page-${page}`}
              size="sm"
              colorScheme={buttonColorScheme}
              variant={currentPage === page ? "solid" : "outline"}
              bg={currentPage === page ? buttonBgActive : undefined}
              color={currentPage === page ? buttonTextActive : undefined}
              onClick={() => onPageChange(page as number)}
              fontWeight={currentPage === page ? "bold" : "normal"}
              minW="32px"
            >
              {page}
            </Button>
          );
        })}

        {/* Next button */}
        <IconButton
          aria-label="Next page"
          icon={<FaChevronRight />}
          size="sm"
          colorScheme={buttonColorScheme}
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
        />
      </HStack>
    </Flex>
  );
};

export default Pagination;

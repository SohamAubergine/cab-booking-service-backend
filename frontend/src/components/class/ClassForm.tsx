import React from "react";
import { z } from "zod";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  HStack,
  Select,
  InputGroup,
  InputLeftElement,
  Icon,
  Text,
  Divider,
  FormHelperText,
  useColorModeValue,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import { FaLayerGroup, FaChalkboardTeacher, FaUsers } from "react-icons/fa";
import { Category, User, Gym } from "../../types";

// Form validation schema
export const fitnessClassSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  instructorId: z.string().min(1, "Please select an instructor"),
  gymId: z.string().min(1, "Please select a gym"),
  startsAt: z.string().min(1, "Start time is required"),
  endsAt: z.string().min(1, "End time is required"),
  capacity: z.preprocess(
    (val) => parseInt(val as string, 10) || 20,
    z.number().min(1, "Capacity must be at least 1")
  ),
});

export type FitnessClassFormData = z.infer<typeof fitnessClassSchema>;

interface ClassFormProps {
  register: any;
  errors: any;
  categories: Category[];
  instructors: User[];
  gyms: Gym[];
  isCategoriesLoading: boolean;
  isInstructorsLoading: boolean;
  isGymsLoading: boolean;
  accentColor?: string;
}

const ClassForm: React.FC<ClassFormProps> = ({
  register,
  errors,
  categories,
  instructors,
  gyms,
  isCategoriesLoading,
  isInstructorsLoading,
  isGymsLoading,
  accentColor = "blue",
}) => {
  const headingColor = useColorModeValue("gray.700", "white");

  return (
    <VStack spacing={6} align="stretch">
      <FormControl isInvalid={!!errors.name}>
        <FormLabel fontWeight="medium">Class Name</FormLabel>
        <Input
          {...register("name")}
          placeholder="Enter class name"
          focusBorderColor={`${accentColor}.400`}
        />
        {errors.name && (
          <FormErrorMessage>{errors.name.message}</FormErrorMessage>
        )}
      </FormControl>

      <HStack align="flex-start" spacing={6}>
        <FormControl isInvalid={!!errors.categoryId}>
          <FormLabel fontWeight="medium">Category</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaLayerGroup} color="gray.400" />
            </InputLeftElement>
            <Select
              placeholder="Select category"
              {...register("categoryId")}
              isDisabled={isCategoriesLoading}
              pl={10}
              focusBorderColor={`${accentColor}.400`}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </InputGroup>
          {errors.categoryId && (
            <FormErrorMessage>{errors.categoryId.message}</FormErrorMessage>
          )}
          {isCategoriesLoading && (
            <Text fontSize="sm" color="gray.500" mt={1}>
              Loading categories...
            </Text>
          )}
        </FormControl>

        <FormControl isInvalid={!!errors.instructorId}>
          <FormLabel fontWeight="medium">Instructor</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaChalkboardTeacher} color="gray.400" />
            </InputLeftElement>
            <Select
              placeholder="Select instructor"
              {...register("instructorId")}
              isDisabled={isInstructorsLoading}
              pl={10}
              focusBorderColor={`${accentColor}.400`}
            >
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </option>
              ))}
            </Select>
          </InputGroup>
          {errors.instructorId && (
            <FormErrorMessage>{errors.instructorId.message}</FormErrorMessage>
          )}
          {isInstructorsLoading && (
            <Text fontSize="sm" color="gray.500" mt={1}>
              Loading instructors...
            </Text>
          )}
        </FormControl>
      </HStack>

      <FormControl isInvalid={!!errors.gymId}>
        <FormLabel fontWeight="medium">Gym</FormLabel>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaLayerGroup} color="gray.400" />
          </InputLeftElement>
          <Select
            placeholder="Select gym"
            {...register("gymId")}
            isDisabled={isGymsLoading}
            pl={10}
            focusBorderColor={`${accentColor}.400`}
          >
            {gyms.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name}
              </option>
            ))}
          </Select>
        </InputGroup>
        {errors.gymId && (
          <FormErrorMessage>{errors.gymId.message}</FormErrorMessage>
        )}
        {isGymsLoading && (
          <Text fontSize="sm" color="gray.500" mt={1}>
            Loading gyms...
          </Text>
        )}
      </FormControl>

      <Divider />

      <Text fontWeight="medium" color={headingColor}>
        Schedule Information
      </Text>

      <HStack align="flex-start" spacing={6}>
        <FormControl isInvalid={!!errors.startsAt}>
          <FormLabel fontWeight="medium">Start Time</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <CalendarIcon color="gray.400" />
            </InputLeftElement>
            <Input
              type="datetime-local"
              {...register("startsAt")}
              pl={10}
              focusBorderColor={`${accentColor}.400`}
            />
          </InputGroup>
          {errors.startsAt && (
            <FormErrorMessage>{errors.startsAt.message}</FormErrorMessage>
          )}
        </FormControl>

        <FormControl isInvalid={!!errors.endsAt}>
          <FormLabel fontWeight="medium">End Time</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <CalendarIcon color="gray.400" />
            </InputLeftElement>
            <Input
              type="datetime-local"
              {...register("endsAt")}
              pl={10}
              focusBorderColor={`${accentColor}.400`}
            />
          </InputGroup>
          {errors.endsAt && (
            <FormErrorMessage>{errors.endsAt.message}</FormErrorMessage>
          )}
        </FormControl>
      </HStack>

      <Divider />

      <Text fontWeight="medium" color={headingColor}>
        Class Information
      </Text>

      <FormControl isInvalid={!!errors.capacity}>
        <FormLabel fontWeight="medium">Capacity</FormLabel>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaUsers} color="gray.400" />
          </InputLeftElement>
          <Input
            type="number"
            {...register("capacity")}
            placeholder="Enter maximum participants (default: 20)"
            pl={10}
            focusBorderColor={`${accentColor}.400`}
          />
        </InputGroup>
        {errors.capacity && (
          <FormErrorMessage>{errors.capacity.message}</FormErrorMessage>
        )}
        <FormHelperText>
          Maximum number of participants that can book this class
        </FormHelperText>
      </FormControl>
    </VStack>
  );
};

export default ClassForm;

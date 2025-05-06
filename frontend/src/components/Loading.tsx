import {
  Flex,
  Spinner,
  Text,
  Stack,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";

interface LoadingProps {
  /** Text to display below the spinner */
  text?: string;
  /** Size of the loading spinner (xl, lg, md, sm, xs) */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Full screen loading vs inline */
  fullScreen?: boolean;
  /** Height for non-fullscreen loading */
  height?: string;
  /** Whether to show text with the spinner */
  showText?: boolean;
  /** Optional color for the spinner */
  color?: string;
  /** Optional thickness for the spinner */
  thickness?: string;
}

const Loading = ({
  text = "Loading...",
  size = "xl",
  fullScreen = true,
  height = "300px",
  showText = true,
  color,
  thickness = "4px",
}: LoadingProps) => {
  const spinnerColor = color || useColorModeValue("teal.500", "teal.300");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Flex
      justify="center"
      align="center"
      height={fullScreen ? "100vh" : height}
      width="100%"
    >
      <Stack direction="column" align="center" spacing={4}>
        <Spinner
          size={size}
          color={spinnerColor}
          emptyColor={useColorModeValue("gray.200", "gray.700")}
          thickness={thickness}
          speed="0.65s"
        />
        {showText && <Text color={textColor}>{text}</Text>}
      </Stack>
    </Flex>
  );
};

// Inline loading component for use inside cards, buttons, etc.
export const InlineLoading = ({
  color,
  size = "sm",
}: {
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) => {
  const spinnerColor = color || useColorModeValue("teal.500", "teal.300");

  return (
    <Box
      display="inline-block"
      verticalAlign="middle"
      lineHeight="normal"
      marginLeft="2"
    >
      <Spinner size={size} color={spinnerColor} />
    </Box>
  );
};

export default Loading;

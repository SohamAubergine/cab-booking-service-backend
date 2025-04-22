import { extendTheme, ThemeConfig } from "@chakra-ui/react";

// Color mode config
const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
  disableTransitionOnChange: false,
};

// Custom colors to match the landing page
const colors = {
  brand: {
    50: "#f7f0ff",
    100: "#e9d8ff",
    200: "#d6b7ff",
    300: "#c396ff",
    400: "#b175ff",
    500: "#9e54ff", // primary color
    600: "#8843cc",
    700: "#723299",
    800: "#5c2166",
    900: "#461033",
  },
  purple: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
  },
  pink: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
  },
};

// Extend the theme
const theme = extendTheme({
  config,
  colors,
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  shadows: {
    outline: "0 0 0 3px rgba(155, 92, 242, 0.3)",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "semibold",
        borderRadius: "md",
        _focus: {
          boxShadow: "outline",
        },
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === "brand" ? "brand.500" : undefined,
          _hover: {
            bg: props.colorScheme === "brand" ? "brand.600" : undefined,
            transform: "translateY(-2px)",
            boxShadow: "md",
          },
          transition: "all 0.2s ease",
        }),
        outline: (props) => ({
          borderWidth: "2px",
          _hover: {
            transform: "translateY(-2px)",
            boxShadow: "sm",
          },
          transition: "all 0.2s ease",
        }),
        ghost: (props) => ({
          _hover: {
            bg:
              props.colorMode === "dark"
                ? "whiteAlpha.200"
                : `${props.colorScheme}.50`,
          },
        }),
      },
      defaultProps: {
        colorScheme: "purple",
        size: "md",
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: "bold",
        letterSpacing: "tight",
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "lg",
          overflow: "hidden",
          transition: "all 0.3s ease",
          _hover: {
            transform: "translateY(-5px)",
            boxShadow: "lg",
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "md",
        },
      },
      defaultProps: {
        focusBorderColor: "purple.400",
      },
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: "md",
        },
      },
      defaultProps: {
        focusBorderColor: "purple.400",
      },
    },
    Textarea: {
      baseStyle: {
        borderRadius: "md",
      },
      defaultProps: {
        focusBorderColor: "purple.400",
      },
    },
    FormLabel: {
      baseStyle: {
        fontWeight: "medium",
      },
    },
  },
  styles: {
    global: (props) => ({
      html: {
        height: "100%",
        width: "100%",
      },
      body: {
        height: "100%",
        width: "100%",
        bg: props.colorMode === "dark" ? "gray.900" : "white",
        color: props.colorMode === "dark" ? "gray.100" : "gray.800",
        transition: "background-color 0.2s, color 0.2s",
        lineHeight: "base",
      },
      "#root": {
        height: "100%", 
        width: "100%",
      },
      "::selection": {
        bg: "purple.300",
        color: "white",
      },
    }),
  },
  layerStyles: {
    card: {
      bg: (props) => (props.colorMode === "dark" ? "gray.800" : "white"),
      borderRadius: "lg",
      boxShadow: "base",
      borderWidth: "1px",
      borderColor: (props) =>
        props.colorMode === "dark" ? "gray.700" : "gray.100",
      p: 6,
      transition: "all 0.3s ease",
      _hover: {
        boxShadow: "md",
      },
    },
    gradient: {
      bgGradient: "linear(to-r, purple.600, pink.500)",
      color: "white",
    },
  },
  textStyles: {
    h1: {
      fontSize: ["3xl", "4xl", "5xl"],
      fontWeight: "bold",
      lineHeight: "110%",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: ["2xl", "3xl", "4xl"],
      fontWeight: "bold",
      lineHeight: "110%",
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: ["xl", "2xl", "3xl"],
      fontWeight: "bold",
      lineHeight: "110%",
    },
    subtitle: {
      fontSize: ["md", "lg", "xl"],
      fontWeight: "medium",
      lineHeight: "150%",
      letterSpacing: "wider",
    },
  },
});

export default theme;

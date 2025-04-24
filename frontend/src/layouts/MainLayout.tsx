import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Stack,
  Text,
  Container,
  useColorModeValue,
  useColorMode,
  Avatar,
  Divider,
  Tooltip,
  VStack,
  chakra,
  Image,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CloseIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  StarIcon,
} from "@chakra-ui/icons";
import {
  FaUserCircle,
  FaDumbbell,
  FaCalendarCheck,
  FaSignOutAlt,
  FaUserFriends,
  FaHeart,
  FaBuilding,
  FaPlus,
  FaUser,
  FaQuestionCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useGyms } from "../context/GymContext";
import { UserRole } from "../types";
import { motion } from "framer-motion";
import { ReactElement, useEffect, useState, useCallback } from "react";
import RegisterGymModal from "../components/map/RegisterGymModal";
import AppTour from "../components/common/AppTour";
import * as api from "../services/api";

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionIconButton = motion(IconButton);

// Interface for navigation items
interface NavItem {
  label: string;
  to: string;
  icon: ReactElement;
}

// Logo component
const Logo = () => {
  const textColor = useColorModeValue("gray.800", "white");
  return (
    <chakra.span
      fontWeight="bold"
      fontSize="xl"
      bgGradient="linear(to-r, purple.500, pink.500)"
      bgClip="text"
      letterSpacing="tight"
      display="flex"
      alignItems="center"
      justifyContent="center"
      className="logo-element"
    >
      <Box mr={2} display="flex" alignItems="center">
        <StarIcon color="purple.500" />
      </Box>
      FitBook
    </chakra.span>
  );
};

// Navigation items based on user role
const getNavItems = (
  role: UserRole | undefined,
  hasGyms: boolean
): NavItem[] => {
  // Define home route based on user role
  let homeRoute = "/";

  if (role) {
    switch (role) {
      case UserRole.ADMIN:
        homeRoute = "/admin/dashboard";
        break;
      case UserRole.INSTRUCTOR:
        homeRoute = "/instructor/dashboard";
        break;
      case UserRole.USER:
        homeRoute = "/user/dashboard";
        break;
    }
  }

  const commonItems: NavItem[] = [
    { label: "Home", to: homeRoute, icon: <FaDumbbell /> },
  ];

  if (!role) return commonItems;

  switch (role) {
    case UserRole.ADMIN:
      return [
        ...commonItems,
        // { label: "Dashboard", to: "/admin/dashboard", icon: <FaUserCircle /> },
        { label: "Manage Classes", to: "/admin/classes", icon: <FaDumbbell /> },
        { label: "Manage Gyms", to: "/admin/gyms", icon: <FaBuilding /> },
      ];
    case UserRole.INSTRUCTOR:
      // For instructors, always show the My Gyms button regardless of hasGyms
      return [
        ...commonItems,
        {
          label: "Dashboard",
          to: "/instructor/dashboard",
          icon: <FaUserCircle />,
        },
        {
          label: "My Classes",
          to: "/instructor/classes",
          icon: <FaDumbbell />,
        },
        {
          label: "My Gyms",
          to: "/my-gyms",
          icon: <FaBuilding />,
        },
      ];
    case UserRole.USER:
      const userItems = [
        ...commonItems,
        // { label: "Dashboard", to: "/user/dashboard", icon: <FaUserCircle /> },
        { label: "Browse Classes", to: "/classes", icon: <FaDumbbell /> },
        { label: "My Bookings", to: "/my-bookings", icon: <FaCalendarCheck /> },
        { label: "Favorites", to: "/favorites", icon: <FaHeart /> },
        { label: "My Gyms", to: "/my-gyms", icon: <FaBuilding /> },
      ];

      // Only add gyms button if user has gyms
      // if (hasGyms) {
      //   userItems.push({
      //     label: "My Gyms",
      //     to: "/my-gyms",
      //     icon: <FaBuilding />,
      //   });
      // }

      return userItems;
    default:
      return commonItems;
  }
};

const MainLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const { userHasGyms, checkUserHasGyms } = useGyms();
  const navigate = useNavigate();
  const location = useLocation();

  // Add state and disclosure for RegisterGymModal
  const [isRegisterGymModalOpen, setIsRegisterGymModalOpen] = useState(false);
  const [gymRegistrationSuccess, setGymRegistrationSuccess] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (user) {
      checkUserHasGyms();
    }
  }, [user]);

  // Animation variants
  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: 0.3 },
    },
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Handle opening the register gym modal
  const handleOpenRegisterGym = () => {
    setIsRegisterGymModalOpen(true);
  };

  // Handle successful gym registration
  const handleGymRegistrationSuccess = () => {
    // Refresh the user's gyms to update the navigation
    checkUserHasGyms();
    setGymRegistrationSuccess(true);
  };

  const handleOpenTour = useCallback(() => {
    setShowTour(true);
    onClose(); // Close the menu after selecting Help
  }, [onClose]);

  const navItems = getNavItems(user?.role, userHasGyms);

  // Theme colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const navHoverBg = useColorModeValue("gray.50", "gray.700");
  const menuBg = useColorModeValue("white", "gray.700");
  const menuItemHoverBg = useColorModeValue("purple.50", "purple.900");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const footerText = useColorModeValue("gray.600", "gray.400");
  const buttonColorScheme = "purple";
  const buttonHoverBg = useColorModeValue("purple.50", "purple.800");

  // Responsive design
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const logoSize = useBreakpointValue({ base: "md", md: "lg" });

  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      bg={useColorModeValue("white", "gray.900")}
      position="relative"
    >
      <MotionFlex
        as="header"
        position="fixed"
        w="100%"
        bg={bgColor}
        borderBottom="1px"
        borderStyle="solid"
        borderColor={borderColor}
        boxShadow="sm"
        zIndex={100}
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <Container maxW="container.xl" px={4}>
          <Flex h={16} alignItems="center" justifyContent="space-between">
            <HStack spacing={8} alignItems="center">
              <Box>
                <Logo />
              </Box>
              <HStack
                as="nav"
                spacing={2}
                display={{ base: "none", md: "flex" }}
              >
                {navItems.map((item) => (
                  <Link key={item.to} to={item.to}>
                    <Button
                      variant="ghost"
                      colorScheme={buttonColorScheme}
                      leftIcon={item.icon}
                      size="md"
                      _hover={{
                        bg: buttonHoverBg,
                        transform: "translateY(-2px)",
                      }}
                      transition="all 0.2s"
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </HStack>
            </HStack>

            <Flex alignItems="center">
              <MotionIconButton
                mr={3}
                aria-label={`Toggle ${
                  colorMode === "light" ? "Dark" : "Light"
                } Mode`}
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                colorScheme={buttonColorScheme}
                whileHover={{ rotate: 45, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              />

              {isDesktop ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    colorScheme={buttonColorScheme}
                    rightIcon={<ChevronDownIcon />}
                    _hover={{ bg: buttonHoverBg }}
                  >
                    <HStack>
                      <Avatar
                        size="sm"
                        name={user?.name || "User"}
                        bg="purple.500"
                        color="white"
                        fontWeight="bold"
                      />
                      <Text display={{ base: "none", md: "block" }}>
                        {user?.name || "User"}
                      </Text>
                    </HStack>
                  </MenuButton>
                  <MenuList
                    bg={menuBg}
                    borderColor={borderColor}
                    boxShadow="lg"
                  >
                    <MenuItem
                      as={Link}
                      to="/profile"
                      icon={<FaUserCircle />}
                      _hover={{ bg: menuItemHoverBg }}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                      icon={<FaQuestionCircle />}
                      onClick={handleOpenTour}
                      _hover={{ bg: menuItemHoverBg }}
                    >
                      Help
                    </MenuItem>
                    <MenuItem
                      onClick={handleLogout}
                      icon={<FaSignOutAlt />}
                      _hover={{ bg: menuItemHoverBg }}
                    >
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <IconButton
                  aria-label="Open Menu"
                  icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                  variant="ghost"
                  colorScheme={buttonColorScheme}
                  onClick={isOpen ? onClose : onOpen}
                />
              )}
            </Flex>
          </Flex>
        </Container>
      </MotionFlex>

      {/* Mobile menu */}
      {isOpen && (
        <Box
          bg={bgColor}
          position="fixed"
          w="100%"
          zIndex={99}
          mt="64px"
          pb={4}
          display={{ md: "none" }}
          borderBottomWidth="1px"
          borderColor={borderColor}
          boxShadow="md"
        >
          <Container maxW="container.xl" px={4}>
            <VStack as="nav" spacing={2} align="stretch">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={onClose}>
                  <Button
                    w="full"
                    variant="ghost"
                    colorScheme={buttonColorScheme}
                    justifyContent="flex-start"
                    leftIcon={item.icon}
                    _hover={{ bg: navHoverBg }}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}

              <Divider my={2} borderColor={borderColor} />
              <Link to="/profile" onClick={onClose}>
                <Button
                  w="full"
                  variant="ghost"
                  colorScheme={buttonColorScheme}
                  justifyContent="flex-start"
                  leftIcon={<FaUserCircle />}
                  _hover={{ bg: navHoverBg }}
                >
                  Profile
                </Button>
              </Link>
              <Button
                w="full"
                variant="ghost"
                colorScheme={buttonColorScheme}
                justifyContent="flex-start"
                leftIcon={<FaQuestionCircle />}
                onClick={handleOpenTour}
                _hover={{ bg: navHoverBg }}
              >
                Help
              </Button>
              <Button
                w="full"
                variant="ghost"
                colorScheme={buttonColorScheme}
                justifyContent="flex-start"
                leftIcon={<FaSignOutAlt />}
                onClick={handleLogout}
                _hover={{ bg: navHoverBg }}
              >
                Logout
              </Button>
            </VStack>
          </Container>
        </Box>
      )}

      <Container
        as="main"
        maxW="container.xl"
        pt={{ base: 24, md: 28 }}
        pb={10}
        px={4}
        flex="1"
      >
        <Outlet />
      </Container>

      <MotionBox
        as="footer"
        py={6}
        borderTop="1px"
        borderStyle="solid"
        borderColor={borderColor}
        bg={bgColor}
        initial="hidden"
        animate="visible"
        variants={footerVariants}
      >
        <Container maxW="container.xl" px={4}>
          <Flex
            direction={{ base: "column", md: "row" }}
            justifyContent="space-between"
            alignItems="center"
          >
            <HStack>
              <Logo />
              <Text color={footerText} fontSize="sm">
                &copy; {new Date().getFullYear()} All rights reserved
              </Text>
            </HStack>
            <HStack spacing={6} mt={{ base: 4, md: 0 }}>
              <Link to="/terms">
                <Text
                  color={footerText}
                  _hover={{ color: "purple.500" }}
                  transition="color 0.2s"
                  fontSize="sm"
                >
                  Terms
                </Text>
              </Link>
              <Link to="/privacy">
                <Text
                  color={footerText}
                  _hover={{ color: "purple.500" }}
                  transition="color 0.2s"
                  fontSize="sm"
                >
                  Privacy
                </Text>
              </Link>
              <Link to="/contact">
                <Text
                  color={footerText}
                  _hover={{ color: "purple.500" }}
                  transition="color 0.2s"
                  fontSize="sm"
                >
                  Contact
                </Text>
              </Link>
            </HStack>
          </Flex>
        </Container>
      </MotionBox>

      {/* Add the RegisterGymModal component at the bottom of the layout */}
      <RegisterGymModal
        isOpen={isRegisterGymModalOpen}
        onClose={() => setIsRegisterGymModalOpen(false)}
        onSuccess={handleGymRegistrationSuccess}
      />

      {/* Add the AppTour component */}
      <AppTour showTour={showTour} onClose={() => setShowTour(false)} />
    </Box>
  );
};

export default MainLayout;

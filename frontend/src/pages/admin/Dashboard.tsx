import { useState, useEffect } from "react";
import { Box, useColorModeValue, SimpleGrid, useToast } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/api";
import ErrorDisplay from "../../components/ErrorDisplay";
import * as toastUtils from "../../utils/toast";
import {
  StatsGrid,
  AdminActionButtons,
  CreateGymModal,
  DashboardWelcome,
  PopularClassesTable,
  RecentUsersTable,
  containerVariants,
} from "../../components/dashboard";
import { DEFAULT_STATS, DashboardStatsType } from "../../types/dashboard";

// Create motion components
const MotionBox = motion(Box);
const MotionSimpleGrid = motion(SimpleGrid);

const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateGymModalOpen, setIsCreateGymModalOpen] = useState(false);
  const [dashboardData, setDashboardData] =
    useState<DashboardStatsType>(DEFAULT_STATS);

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const tableRowHoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If the API endpoint isn't implemented yet, use mock data
      try {
        const response = await adminService.getDashboardStats();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch dashboard data");
        }
      } catch (err) {
        console.warn("Using mock data - API endpoint not implemented", err);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch dashboard statistics";
      setError(errorMessage);
      toast(toastUtils.errorToast("Error", errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardStats();
    toast(
      toastUtils.infoToast("Refreshing", "Dashboard data is being updated")
    );
  };

  const handleGymCreated = (newGym: any) => {
    console.log("New gym created:", newGym);
    toast(toastUtils.successToast("Success", "Gym created successfully"));
    fetchDashboardStats();
  };

  return (
    <MotionBox initial="hidden" animate="visible" variants={containerVariants}>
      {/* Welcome Section */}
      <DashboardWelcome
        user={user}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        headingColor={headingColor}
        textColor={textColor}
      />

      {error && <ErrorDisplay error={error} />}

      {/* Dashboard Stats Grid */}
      <StatsGrid
        totalUsers={dashboardData.totalUsers}
        activeClasses={dashboardData.activeClasses}
        isLoading={isLoading}
      />

      {/* Admin Actions */}
      <AdminActionButtons />

      {/* Main Content */}
      <MotionSimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={8}
        variants={containerVariants}
      >
        {/* Recent Users Section */}
        <RecentUsersTable
          recentUsers={dashboardData.recentUsers}
          isLoading={isLoading}
          textColor={textColor}
          headingColor={headingColor}
          tableHeaderBg={tableHeaderBg}
          tableRowHoverBg={tableRowHoverBg}
          cardBg={cardBg}
          cardBorder={cardBorder}
        />

        {/* Popular Classes Section */}
        <PopularClassesTable
          popularClasses={dashboardData.popularClasses}
          isLoading={isLoading}
          textColor={textColor}
          headingColor={headingColor}
          tableHeaderBg={tableHeaderBg}
          tableRowHoverBg={tableRowHoverBg}
          cardBg={cardBg}
          cardBorder={cardBorder}
        />
      </MotionSimpleGrid>

      {/* Create Gym Modal */}
      <CreateGymModal
        isOpen={isCreateGymModalOpen}
        onClose={() => setIsCreateGymModalOpen(false)}
        onGymCreated={handleGymCreated}
      />
    </MotionBox>
  );
};

export default AdminDashboard;

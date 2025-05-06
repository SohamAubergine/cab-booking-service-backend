import { FitnessClass, User } from ".";
import { IconType } from "react-icons";

// Extended FitnessClass type with _count property for admin dashboard
export interface ExtendedFitnessClass extends FitnessClass {
  _count?: {
    bookings: number;
  };
}

export interface DashboardStatsType {
  totalUsers: number;
  activeClasses: number;
  totalRevenue: number;
  overallGrowthRate: number;
  userGrowthRate: number;
  revenueGrowthRate: number;
  recentUsers: User[];
  popularClasses: ExtendedFitnessClass[];
}

export const DEFAULT_STATS: DashboardStatsType = {
  totalUsers: 0,
  activeClasses: 0,
  totalRevenue: 0,
  overallGrowthRate: 0,
  userGrowthRate: 0,
  revenueGrowthRate: 0,
  recentUsers: [],
  popularClasses: [],
};

export interface StatCardProps {
  icon: IconType;
  label: string;
  value: string;
  helpText: string;
  isLoading?: boolean;
}

export interface UserRowProps {
  user: User;
  getBadgeColor: (role: string) => string;
  textColor: string;
}

export interface ClassRowProps {
  classItem: ExtendedFitnessClass;
  textColor: string;
}

export interface CreateGymModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGymCreated: (newGym: any) => void;
}

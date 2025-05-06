import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Gym, UserRole } from "../types";
import { userService, instructorService } from "../services/api";
import { useAuth } from "./AuthContext";

interface GymContextType {
  userHasGyms: boolean;
  isLoadingGyms: boolean;
  error: string | null;
  checkUserHasGyms: () => Promise<void>;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const useGyms = (): GymContextType => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error("useGyms must be used within a GymProvider");
  }
  return context;
};

interface GymProviderProps {
  children: ReactNode;
}

export const GymProvider = ({ children }: GymProviderProps) => {
  const [userHasGyms, setUserHasGyms] = useState<boolean>(false);
  const [isLoadingGyms, setIsLoadingGyms] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if user has gyms when authenticated
    if (isAuthenticated && user) {
      checkUserHasGyms();
    } else {
      setUserHasGyms(false);
    }
  }, [isAuthenticated, user]);

  const checkUserHasGyms = async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      setUserHasGyms(false);
      return;
    }

    setIsLoadingGyms(true);
    setError(null);

    try {
      let hasGyms = false;
      // console.log("Checking gym access for user:", user);

      if (user.role === UserRole.INSTRUCTOR) {
        // For instructors, check if they teach at any gyms
        // console.log("Checking instructor gyms...");
        const response = await instructorService.getInstructorGyms(1, 1);
        // console.log("Instructor gyms response:", response);
        hasGyms = response.data.meta.total > 0;
      } else if (user.role === UserRole.USER || user.role === UserRole.ADMIN) {
        // For users, check if they own any gyms
        // console.log("Checking user gyms...");
        const response = await userService.getUserGyms(1, 1);
        // console.log("User gyms response:", response);
        hasGyms = response.data.meta.total > 0;
      }

      // console.log("User has gyms: " + hasGyms);
      setUserHasGyms(hasGyms);
    } catch (err) {
      // console.error("Error checking gym access:", err);
      setError("Failed to check gym access");
      setUserHasGyms(false);

      // For development, always set to true in case of error to show the button
      // Remove or comment this in production
      if (user.role === UserRole.INSTRUCTOR) {
        // console.log("Setting userHasGyms to true for instructor despite error");
        setUserHasGyms(true);
      }
    } finally {
      setIsLoadingGyms(false);
    }
  };

  const value = {
    userHasGyms,
    isLoadingGyms,
    error,
    checkUserHasGyms,
  };

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
};

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";

interface AppTourProps {
  showTour: boolean;
  onClose: () => void;
}

// Create a proper type for our step items
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: Side;
    align?: Align;
  };
}

// Function to create a tour step with typed properties
const createTourStep = (
  element: string,
  title: string,
  description: string,
  side?: Side,
  align?: Align
): TourStep => {
  return {
    element,
    popover: {
      title,
      description,
      ...(side && { side }),
      ...(align && { align }),
    },
  };
};

const AppTour = ({ showTour, onClose }: AppTourProps) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!showTour) return;

    // Define common steps for all users
    const commonSteps: TourStep[] = [
      createTourStep(
        ".logo-element",
        "Welcome to FitBook!",
        "This tour will guide you through the main features of our platform.",
        "bottom",
        "start"
      ),
      createTourStep(
        "nav",
        "Navigation Menu",
        "Access different areas of the application from here.",
        "bottom",
        "center"
      ),
      createTourStep(
        ".chakra-menu__menu-button",
        "User Menu",
        "Access your profile, get help, or log out from here.",
        "bottom",
        "end"
      ),
      createTourStep(
        "main",
        "Main Content",
        "This area displays the content of the current page.",
        "top",
        "center"
      ),
    ];

    // Define role-specific steps
    let roleSpecificSteps: TourStep[] = [];

    if (user) {
      switch (user.role) {
        case UserRole.ADMIN:
          roleSpecificSteps = [
            createTourStep(
              "a[href='/admin/classes']",
              "Manage Classes",
              "Create, edit, and delete fitness classes from here.",
              "bottom"
            ),
            createTourStep(
              "a[href='/admin/gyms']",
              "Manage Gyms",
              "Add, edit, and remove gyms from the platform.",
              "bottom"
            ),
          ];
          break;
        case UserRole.INSTRUCTOR:
          roleSpecificSteps = [
            createTourStep(
              "a[href='/instructor/dashboard']",
              "Instructor Dashboard",
              "View your teaching schedule and class statistics.",
              "bottom"
            ),
            createTourStep(
              "a[href='/instructor/classes']",
              "My Classes",
              "Manage the classes you teach.",
              "bottom"
            ),
            createTourStep(
              "a[href='/my-gyms']",
              "My Gyms",
              "View the gyms where you teach classes.",
              "bottom"
            ),
          ];
          break;
        case UserRole.USER:
          roleSpecificSteps = [
            createTourStep(
              "a[href='/classes']",
              "Browse Classes",
              "Find and book fitness classes that interest you.",
              "bottom"
            ),
            createTourStep(
              "a[href='/my-bookings']",
              "My Bookings",
              "View and manage your booked classes.",
              "bottom"
            ),
            createTourStep(
              "a[href='/favorites']",
              "Favorites",
              "Access your favorite classes quickly.",
              "bottom"
            ),
            createTourStep(
              "a[href='/my-gyms']",
              "My Gyms",
              "View gyms you've registered with.",
              "bottom"
            ),
          ];
          break;
        default:
          roleSpecificSteps = [];
      }
    }

    // Dynamically check for page-specific elements
    const dynamicSteps: TourStep[] = [];
    
    if (document.querySelector(".fitness-classes")) {
      dynamicSteps.push(
        createTourStep(
          ".fitness-classes",
          "Fitness Classes",
          "Browse and book fitness classes here.",
          "top",
          "start"
        )
      );
    }
    
    if (document.querySelector(".bookings-list")) {
      dynamicSteps.push(
        createTourStep(
          ".bookings-list",
          "Your Bookings",
          "View and manage your class bookings here.",
          "top",
          "start"
        )
      );
    }
    
    if (document.querySelector(".gym-list")) {
      dynamicSteps.push(
        createTourStep(
          ".gym-list",
          "Gym Locations",
          "Browse gym locations where classes are offered.",
          "top",
          "start"
        )
      );
    }

    // Combine all steps
    const allSteps: TourStep[] = [...commonSteps, ...roleSpecificSteps, ...dynamicSteps];

    // Filter out steps with non-existent elements
    const validSteps = allSteps.filter((step) => {
      try {
        return document.querySelector(step.element);
      } catch {
        return false;
      }
    });

    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: validSteps,
      onDestroyStarted: () => {
        onClose();
      },
      onDestroyed: () => {
        onClose();
      },
    });

    driverObj.drive();

    return () => {
      driverObj.destroy();
    };
  }, [showTour, onClose, user]);

  return null;
};

export default AppTour;

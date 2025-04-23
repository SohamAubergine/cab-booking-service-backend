import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";

interface AppTourProps {
  showTour: boolean;
  onClose: () => void;
}

const AppTour = ({ showTour, onClose }: AppTourProps) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!showTour) return;

    // Define common steps for all users
    const commonSteps = [
      {
        element: ".logo-element",
        popover: {
          title: "Welcome to FitBook!",
          description:
            "This tour will guide you through the main features of our platform.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "nav",
        popover: {
          title: "Navigation Menu",
          description: "Access different areas of the application from here.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: ".chakra-menu__menu-button",
        popover: {
          title: "User Menu",
          description: "Access your profile, get help, or log out from here.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "main",
        popover: {
          title: "Main Content",
          description: "This area displays the content of the current page.",
          side: "top",
          align: "center",
        },
      },
    ];

    // Define role-specific steps
    let roleSpecificSteps: { element: string; popover: { title: string; description: string; side: string; }; }[] = [];

    if (user) {
      switch (user.role) {
        case UserRole.ADMIN:
          roleSpecificSteps = [
            {
              element: "a[href='/admin/classes']",
              popover: {
                title: "Manage Classes",
                description:
                  "Create, edit, and delete fitness classes from here.",
                side: "bottom",
              },
            },
            {
              element: "a[href='/admin/gyms']",
              popover: {
                title: "Manage Gyms",
                description: "Add, edit, and remove gyms from the platform.",
                side: "bottom",
              },
            },
          ];
          break;
        case UserRole.INSTRUCTOR:
          roleSpecificSteps = [
            {
              element: "a[href='/instructor/dashboard']",
              popover: {
                title: "Instructor Dashboard",
                description:
                  "View your teaching schedule and class statistics.",
                side: "bottom",
              },
            },
            {
              element: "a[href='/instructor/classes']",
              popover: {
                title: "My Classes",
                description: "Manage the classes you teach.",
                side: "bottom",
              },
            },
            {
              element: "a[href='/my-gyms']",
              popover: {
                title: "My Gyms",
                description: "View the gyms where you teach classes.",
                side: "bottom",
              },
            },
          ];
          break;
        case UserRole.USER:
          roleSpecificSteps = [
            {
              element: "a[href='/classes']",
              popover: {
                title: "Browse Classes",
                description: "Find and book fitness classes that interest you.",
                side: "bottom",
              },
            },
            {
              element: "a[href='/my-bookings']",
              popover: {
                title: "My Bookings",
                description: "View and manage your booked classes.",
                side: "bottom",
              },
            },
            {
              element: "a[href='/favorites']",
              popover: {
                title: "Favorites",
                description: "Access your favorite classes quickly.",
                side: "bottom",
              },
            },
            {
              element: "a[href='/my-gyms']",
              popover: {
                title: "My Gyms",
                description: "View gyms you've registered with.",
                side: "bottom",
              },
            },
          ];
          break;
        default:
          roleSpecificSteps = [];
      }
    }

    // Dynamically check for page-specific elements
    const dynamicSteps = [
      ...(document.querySelector(".fitness-classes")
        ? [
            {
              element: ".fitness-classes",
              popover: {
                title: "Fitness Classes",
                description: "Browse and book fitness classes here.",
                side: "top",
                align: "start",
              },
            },
          ]
        : []),
      ...(document.querySelector(".bookings-list")
        ? [
            {
              element: ".bookings-list",
              popover: {
                title: "Your Bookings",
                description: "View and manage your class bookings here.",
                side: "top",
                align: "start",
              },
            },
          ]
        : []),
      ...(document.querySelector(".gym-list")
        ? [
            {
              element: ".gym-list",
              popover: {
                title: "Gym Locations",
                description: "Browse gym locations where classes are offered.",
                side: "top",
                align: "start",
              },
            },
          ]
        : []),
    ];

    // Combine all steps
    const allSteps = [...commonSteps, ...roleSpecificSteps, ...dynamicSteps];

    // Filter out steps with non-existent elements
    const validSteps = allSteps.filter((step) => {
      try {
        return document.querySelector(step.element as string);
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

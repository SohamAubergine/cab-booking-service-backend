import { UseToastOptions } from "@chakra-ui/react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

// Default toast configuration
const defaultToastConfig: UseToastOptions = {
  position: "top-right",
  duration: 5000, // default 5 seconds
  isClosable: true,
  variant: "solid",
};

/**
 * Standard toast messages for consistent notifications across the app
 */
const createToastConfig = ({
  title,
  description,
  type = "info",
  duration,
}: ToastProps): UseToastOptions => {
  return {
    ...defaultToastConfig,
    title,
    description,
    status: type,
    duration: duration || defaultToastConfig.duration,
  };
};

// Pre-configured toast types
export const successToast = (
  title: string,
  description?: string,
  duration?: number
): UseToastOptions =>
  createToastConfig({ title, description, type: "success", duration });

export const errorToast = (
  title: string,
  description?: string,
  duration?: number
): UseToastOptions =>
  createToastConfig({ title, description, type: "error", duration });

export const infoToast = (
  title: string,
  description?: string,
  duration?: number
): UseToastOptions =>
  createToastConfig({ title, description, type: "info", duration });

export const warningToast = (
  title: string,
  description?: string,
  duration?: number
): UseToastOptions =>
  createToastConfig({ title, description, type: "warning", duration });

// Common application toast messages
export const bookingSuccessToast = (className: string): UseToastOptions =>
  successToast(
    "Booking Successful",
    `You've successfully booked ${className}.`
  );

export const bookingErrorToast = (message: string): UseToastOptions =>
  errorToast("Booking Failed", message);

export const loginSuccessToast = (): UseToastOptions =>
  successToast("Welcome Back!", "You have successfully logged in.");

export const logoutSuccessToast = (): UseToastOptions =>
  infoToast("Logged Out", "You have been successfully logged out.");

export const sessionExpiredToast = (): UseToastOptions =>
  warningToast(
    "Session Expired",
    "Your session has expired. Please login again.",
    7000
  );

export const networkErrorToast = (): UseToastOptions =>
  errorToast(
    "Network Error",
    "Unable to connect to the server. Please check your internet connection."
  );

export default {
  successToast,
  errorToast,
  infoToast,
  warningToast,
  bookingSuccessToast,
  bookingErrorToast,
  loginSuccessToast,
  logoutSuccessToast,
  sessionExpiredToast,
  networkErrorToast,
};

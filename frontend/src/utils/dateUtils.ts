/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string to format
 * @param includeTime - Whether to include the time in the formatted date
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, includeTime = false): string => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
    };

    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Get a relative time string (e.g., "2 hours ago", "yesterday")
 * @param dateString - ISO date string to format
 * @returns Relative time string
 */
export const getRelativeTimeString = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than a minute
    if (diffInSeconds < 60) {
      return "just now";
    }

    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }

    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return days === 1 ? "yesterday" : `${days} days ago`;
    }

    // Default to regular date formatting
    return formatDate(dateString);
  } catch (error) {
    console.error("Error calculating relative time:", error);
    return "Invalid date";
  }
};

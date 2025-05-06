export const CONSTANTS = {
  // * Add your constants here
  HEALTH: {
    STATUS: {
      OK: "OK",
      ERROR: "ERROR",
    },
  },
  AUTH: {
    JWT: {
      SECRET: process.env.JWT_SECRET || "your-secret-key",
      EXPIRES_IN: "24h",
    },
    SALT_ROUNDS: 10,
    ROLES: {
      USER: "USER",
      INSTRUCTOR: "INSTRUCTOR",
      ADMIN: "ADMIN",
    },
    ADMIN_CODE: process.env.ADMIN_AUTH_CODE || "admin-secret-2024",
  },
  CORS: {
    ALLOWED_ORIGINS: process.env.CORS_ORIGIN?.split(",") || ["*"],
    METHODS: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    ALLOWED_HEADERS: ["Content-Type", "Authorization"],
    MAX_AGE: 86400, // 24 hours in seconds
  },
};

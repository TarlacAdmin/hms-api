import wildCardOrigin from "../helper/checkOrigin";
import { CallbackFunction } from "../helper/types";
// Purpose: Configuration file for the project.
// Note: This is a sample configuration file. Modify this file to fit your project's needs.

// Configuration object
export const config = {
  PORT: 5000,

  MSG: {
    WELCOME: "You're successfully connected to Tarlac Hospital Management System (API)",
  },

  SUCCESS: {
    SERVER: "Server is running on port:",
    DATABASE: "Database connected:",

    USER: {
      REGISTER: "User registered successfully",
      LOGIN: "Login successful",
      UPDATE: "Update successful",
      DELETE: "Delete successful",
      LOGOUT: "Logout successful, token cleared.",
    },
  },

  STATUS: {
    VALIDATION_ERROR: {
      CODE: 400,
      TITLE: "Validation error",
    },
    UNAUTHORIZED: {
      CODE: 401,
      TITLE: "Unauthorized",
    },
    FORBIDDEN: {
      CODE: 403,
      TITLE: "Forbidden",
    },
    NOT_FOUND: {
      CODE: 404,
      TITLE: "Not found",
    },
    SERVER_ERROR: {
      CODE: 500,
      TITLE: "Server error",
    },
    DEFAULT_ERROR: {
      TITLE: "Unexpected error",
      CODE: 500,
      UNEXPECTED: "An unexpected error occurred. Please try again later.",
    },
  },

  CORS: {
    METHODS: ["GET", "POST", "PUT", "DELETE"],
    LOCAL: "http://localhost:5173",
    DEV_BRANCH: "https://example-app-dev",
    TEST_BRANCH: "https://example-app-test",
    DEV_SITE: function (origin: string, callback: CallbackFunction) {
      wildCardOrigin(origin, callback, "https://example-app-dev");
    },
    TEST_SITE: function (origin: string, callback: CallbackFunction) {
      wildCardOrigin(origin, callback, "https://example-test-dev");
    },
  },

  DB: {
    URI: "mongodb+srv://tarlacsolutionsinc:RJc83AVcrahVG4RC@tarlac-prod-clusterm2.ofhfszm.mongodb.net/hms-prod?retryWrites=true&w=majority&appName=Tarlac-Prod-ClusterM2",
    COLLECTION: "sessions",
  },

  JWTCONFIG: {
    SECRET: "t@rl@cHMS2024",
    BEARER_REGEX: /^Bearer\s+(\S+)$/,
    ADMIN_EXPIRESIN: "1d",
    EXPIRESIN: "1h",
    CLEAR_COOKIE: "jwt",
  },

  ERROR: {
    MONGODB_NOT_DEFINE: "MONGODB_URI is not defined in the environment variables.",
    CONNECTION_FAILED: "Database connection failed:",
    UNEXPECTED: "An unexpected error occurred. Please try again later.",
    RATELIMIT: "Too many requests from this IP, please try again after 15 minutes",
    NO_DEACTIVE_USERS: "No users to deactivate",
    NO_ARCHIVE_USERS: "No users to archive",

    USER: {
      NOT_AUTHORIZED: "User is not authorized",
      NOT_FOUND: "User not found",
      INVALID_CREDENTIALS: "Invalid credentials",
      EMAIL_ALREADY_EXISTS: "Email already exists",
      NO_ACCOUNT: "No account found with this email. Please register.",
      INVALID_EMAIL: "Invalid email format",
      REQUIRED_FIELDS: "Both email and password are required.",
      ALREADY_EXIST: "User already exists",
      UPDATE_FAILED: "An error occurred during the update.",
      INVALID_ID: "Invalid user ID",
      DEACTIVATED: "User is deactivated, because of inactivity",
    },
  },

  METHOD: {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
  },

  VALIDATION: {
    USER: {
      EMAIL: "email",
      PASSWORD: "password",
      ID: "id",
    },
  },

  RESPONSE: {
    ERROR: {
      SAMPLE: {
        ID: "sampleId is missing!",
        NOT_FOUND: "Sample not found",
        REMOVE: "Error removing field",
        UPDATE: "Error updating field",
        ALREADY_EXISTS: "Sample already exists",
        NOT_FOUND_ID: "Sample not found! with the provided _id",
        INVALID_PARAMETER: {
          GET: "sampleService.get params is missing!",
          GET_ALL: "sampleService.getAllField params is missing!",
          CREATE: "sampleService.create params is missing!",
          UPDATE: "sampleService.update params is missing!",
          ID: "sampleService.update params._id is missing!",
          REMOVE: "sampleService.remove params is missing!",
          SEARCH: "sampleService.search params is missing!",
        },
      },
    },
  },

  CRON: {
    CLEAN_UP: {
      INACTIVE_USERS: {
        TIME: "0 0 1 * *",
        MESSAGE: "Running clean up job for inactive users",
      },
      INACTIVE_USERS_DEACTIVATE_THRESHOLD: 6, // 6 months
      INACTIVE_USERS_ARCHIVE_THRESHOLD: 1, // 1 year
    },
  },
};

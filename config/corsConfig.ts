import { config } from "../config/config";
import cors, { CorsOptions } from "cors";

// Description: This file contains the CORS configuration for the application. It specifies the allowed origins, methods, and whether credentials are allowed.
// This configuration helps prevent cross-origin resource sharing (CORS) issues by defining which origins are allowed to access the server and what methods are allowed to be used.

const allowedOrigins = [
  config.CORS.LOCAL,
  config.CORS.DEV_BRANCH,
  config.CORS.DEV_SITE,
  config.CORS.TEST_BRANCH,
  config.CORS.TEST_SITE,
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: config.CORS.METHODS,
  credentials: true,
};

export default cors(corsOptions);

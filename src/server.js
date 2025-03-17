import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import appConfig from "./config/app.config.js";
import corsConfig from "./config/cors.config.js";
import apiRoutes from "./api/v2/routes/index.routes.js";
import compression from "compression";
import { errorHandlerMiddleware } from "./api/v2/middleware/errorHandler.middleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors(corsConfig));
app.use(express.static(path.join(__dirname, appConfig.publicDir)));
app.use(morgan("combined"));
app.use(compression());

// API Routes
app.use("/api/v1", apiRoutes);

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  errorHandlerMiddleware;
});

// Start server
const PORT = appConfig.port;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${appConfig.environment} mode`
  );
});

//TODO : api response model tunning

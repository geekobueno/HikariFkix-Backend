import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 6969,
  environment: process.env.NODE_ENV || "development",
  publicDir: "public",
  corsOptions: {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
};

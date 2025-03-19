import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 6969,
  environment: process.env.NODE_ENV || "development",
  publicDir: "public",
};

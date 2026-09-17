import dotenv from "dotenv";
dotenv.config();

const rawUploadMode = (process.env.UPLOAD_MODE || "mongo").toLowerCase();
const uploadMode = rawUploadMode === "aws" ? "aws" : "mongo";

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "3000",
  MONGO_URL: process.env.MONGO_URL || "",

  UPLOAD_MODE: uploadMode as "aws" | "mongo",

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "",

  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "",
  JWT_ACCESS_LIFETIME: process.env.JWT_ACCESS_LIFETIME || "30d",
  EMAIL_VERIFICATION_SECRET: process.env.EMAIL_VERIFICATION_SECRET || "",
  RESET_PASSWORD_SECRET: process.env.RESET_PASSWORD_SECRET || "",

  FRONTEND_URL: process.env.FRONTEND_URL || "",
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || "",
  EMAIL_PORT: process.env.EMAIL_PORT || "",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
} as const;

export default config;

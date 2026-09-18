import dotenv from "dotenv";
import path from "path";

// Load the environment-specific .env file (e.g. .env.production, .env.development)
const envFile = process.env.NODE_ENV
  ? `.env.${process.env.NODE_ENV}`
  : ".env";

dotenv.config({
  path: path.resolve(process.cwd(), envFile),
  override: true,
});
// Also load the base .env as a fallback for values not in the env-specific file
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

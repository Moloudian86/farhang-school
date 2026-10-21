import "dotenv/config";
import path from "path";

/**
 * Reads settings from the .env file in one place,
 * so the rest of the code never touches process.env directly.
 */
const nodeEnv = process.env.NODE_ENV ?? "development";

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv,
  isProd: nodeEnv === "production",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  // Uploaded images live in backend/uploads (we always start the server from the backend folder).
  uploadsDir: path.resolve(process.cwd(), "uploads"),
};

// Safety net: never run a real (production) server with the example secret.
if (env.isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith("change-this"))) {
  throw new Error("JWT_SECRET must be set to a long random text in production.");
}

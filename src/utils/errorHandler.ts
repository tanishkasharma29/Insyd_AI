import { Response } from "express";

/**
 * Handle Prisma/database errors and return appropriate HTTP status codes
 */
export function handleDatabaseError(error: any, res: Response): boolean {
  // Prisma error codes for connection issues
  const prismaConnectionErrorCodes = [
    "P1000", // Authentication failed
    "P1001", // Can't reach database server
    "P1002", // Database server timed out
    "P1003", // Database does not exist
    "P1008", // Operations timed out
    "P1009", // Database already exists
    "P1010", // User was denied access
    "P1011", // TLS connection error
    "P1017", // Server has closed the connection
  ];

  // Check for Prisma error codes
  if (error?.code && prismaConnectionErrorCodes.includes(error.code)) {
    res.status(503).json({
      success: false,
      error: "Database connection error",
      details: "Cannot connect to database. Please check DATABASE_URL in .env file and ensure the database is running.",
      code: error.code,
    });
    return true; // Error was handled
  }

  // Check for connection-related error messages
  const errorMessage = error?.message?.toLowerCase() || "";
  if (
    errorMessage.includes("can't reach database") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("enotfound") ||
    errorMessage.includes("econnrefused") ||
    errorMessage.includes("p1001") ||
    errorMessage.includes("p1000") ||
    errorMessage.includes("environment variable") ||
    errorMessage.includes("datasource")
  ) {
    res.status(503).json({
      success: false,
      error: "Database connection error",
      details: "Cannot connect to database. Please check DATABASE_URL in .env file and ensure the database is running.",
    });
    return true; // Error was handled
  }

  return false; // Error was not handled, let caller handle it
}


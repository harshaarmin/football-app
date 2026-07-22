const errorHandler = (err, req, res, next) => {
  console.error("\n========== ERROR ==========");
  console.error(`${req.method} ${req.originalUrl}`);
  console.error(err.stack || err);
  console.error("===========================\n");

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Prisma unique constraint
  if (err.code === "P2002") {
    statusCode = 409;
    message = "Resource already exists.";
  }

  // Prisma record not found
  if (err.code === "P2025") {
    statusCode = 404;
    message = "Resource not found.";
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired.";
  }

  // Validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
    }),
  });
};

module.exports = errorHandler;
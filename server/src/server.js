require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const connectDB = require("./config/db");
const logger = require("./utils/logger");
const { errorHandler, notFound } = require("./middleware/errorHandler");
//port
const PORT = process.env.PORT || 5000;

// Route imports
const authRoutes = require("./routes/auth");
const trainerRoutes = require("./routes/trainer");
const workoutRoutes = require("./routes/workout");
const dietRoutes = require("./routes/diet");
const progressRoutes = require("./routes/progress");
const memberRoutes = require("./routes/member");

const app = express();

// ─── Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: process.env.NODE_ENV === "production",
  }),
);

// CORS
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:3000"
).split(",");
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for auth
  message: {
    success: false,
    message: "Too many login attempts, please try again in 15 minutes.",
  },
  skipSuccessfulRequests: true,
});

app.use("/api/", limiter);
app.use("/api/auth", authLimiter);

// ─── Parsing & Sanitization 
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(mongoSanitize()); // prevent NoSQL injection
app.use(hpp()); // HTTP Parameter Pollution
app.use(compression());

// ─── Logging 
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (msg) => logger.info(msg.trim()) },
      skip: (req) => req.url === "/health",
    }),
  );
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use(`/api/auth`, authRoutes);
app.use(`/api/trainer`, trainerRoutes);
app.use(`/api/workout`, workoutRoutes);
app.use(`/api/diet`, dietRoutes);
app.use(`/api/progress`, progressRoutes);
app.use(`/api/member`, memberRoutes);

// Legacy routes (without version prefix) for backward compatibility
app.use("/api/auth", authRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/member", memberRoutes);

// ─── 404 & Error Handler ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

const StartServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(
        ` Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
      );
      logger.info(` API available at http://localhost:${PORT}/api`);
      logger.info(`  Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    logger.error(`Error starting server: ${err.message}`);
    process.exit(1);
  }
};
StartServer();


// Graceful shutdown logic
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down.",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;

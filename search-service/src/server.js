require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const { configureCors } = require('./config/corsConfig');
const { globalErrorHandler } = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { searchPosts } = require("./controllers/searchController");
const { handlePostCreated } = require("./eventHandlers/searchEventHandlers");


const app = express();
const PORT = process.env.PORT || 3004;

// Redis setup
const redisClient = new Redis(process.env.REDIS_URI);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

app.use(configureCors());
app.use(helmet());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${JSON.stringify(req.body)}`);
  next();
});

// Implement IP-based rate limiting for sensitive endpoints
const sensitiveEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// Apply rate limiting to sensitive routes

app.use("/api/search", sensitiveEndpointLimiter);

// Routes
app.get("/api/search", searchPosts);


// Global error handler
app.use(globalErrorHandler);

// Start the server
async function startServer() {
  try {

    await connectToRabbitMQ();

    // consume all Events
    await consumeEvent("postCreated", handlePostCreated);

    app.listen(PORT, () => {
      logger.info(`Search service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to server", error);
    process.exit(1);
  }
}

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});

const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 3000;

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();

    app.listen(PORT, () => {
      console.log("");
      console.log("=====================================");
      console.log("⚽ Football Hub Backend Started");
      console.log(`🚀 http://localhost:${PORT}`);
      console.log("✅ Redis connected");
      console.log("=====================================");
      console.log("");
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);
    process.exit(1);
  }
};

startServer();
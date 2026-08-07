const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const { connectRedis, redisClient } = require("./config/redis");

if (redisClient && !redisClient.isOpen) {
  connectRedis().catch((error) => {
    console.warn("Redis is unavailable, continuing without cache.");
    console.warn(error.message);
  });
}

module.exports = app;
module.exports.default = app;

const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || null;

const redisClient = redisUrl
  ? createClient({
      url: redisUrl,
    })
  : null;

if (redisClient) {
  redisClient.on("connect", () => {
    console.log("✅ Redis connected");
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis Error:");
    console.error(err);
  });
}

const connectRedis = async () => {
  if (!redisClient || redisClient.isOpen) {
    return;
  }

  await redisClient.connect();
};

module.exports = {
  redisClient,
  connectRedis,
};

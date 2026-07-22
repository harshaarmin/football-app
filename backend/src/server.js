const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

/**
 * Health Check Endpoint
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log("");
  console.log("=====================================");
  console.log("⚽ Football Hub Backend Started");
  console.log(`🚀 http://localhost:${PORT}`);
  console.log("=====================================");
  console.log("");
});
const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("");
  console.log("=====================================");
  console.log("⚽ Football Hub Backend Started");
  console.log(`🚀 http://localhost:${PORT}`);
  console.log("=====================================");
  console.log("");
});
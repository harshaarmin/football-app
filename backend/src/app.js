const express = require("express");
const cors = require("cors");

const app = express();

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");

app.use(cors());
app.use(express.json());

// ================= ROUTES =================

const homeRouter = require("./routes/home");
const competitionsRouter = require("./routes/competitions");
const worldcupRouter = require("./routes/worldcup");
const newsRouter = require("./routes/news");
const searchRouter = require("./routes/search");
const matchRouter = require("./routes/match");
const plRouter = require("./routes/pl");
const teamsRouter = require("./routes/teams");
const favoriteRouter = require("./routes/favorites");

app.use("/api/home", homeRouter);
app.use("/api/competitions", competitionsRouter);
app.use("/api/worldcup", worldcupRouter);
app.use("/api/news", newsRouter);
app.use("/api/search", searchRouter);
app.use("/api/match", matchRouter);
app.use("/api/pl", plRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/favorites", favoriteRouter);

// ================= HEALTH CHECK =================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

// ================= ROOT =================

app.get("/", (req, res) => {
  res.json({
    app: "Football Hub API",
    version: "2.0.0",
    status: "Running",
  });
});

module.exports = app;
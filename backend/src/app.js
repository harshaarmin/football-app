const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const errorHandler = require("./middleware/errorHandler");

const {
  authLimiter,
  apiLimiter,
} = require("./middleware/rateLimiter");

const app = express();

// ================= SECURITY =================

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

app.use(apiLimiter);

// ================= ROUTES =================

const homeRouter = require("./routes/home");
const competitionsRouter = require("./routes/competitions");
const worldcupRouter = require("./routes/worldcup");
const newsRouter = require("./routes/news");
const searchRouter = require("./routes/search");
const matchRouter = require("./routes/match");
const plRouter = require("./routes/pl");
const teamsRouter = require("./routes/teams");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const favoriteRouter = require("./routes/favorites");

app.use("/api/home", homeRouter);
app.use("/api/competitions", competitionsRouter);
app.use("/api/worldcup", worldcupRouter);
app.use("/api/news", newsRouter);
app.use("/api/search", searchRouter);
app.use("/api/match", matchRouter);
app.use("/api/pl", plRouter);
app.use("/api/teams", teamsRouter);

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/favorites", favoriteRouter);

// ================= HEALTH =================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

// ================= ROOT =================

app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "Football Hub API",
    version: "2.0.0",
    status: "Running",
  });
});

// ================= 404 =================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ================= GLOBAL ERROR HANDLER =================

app.use(errorHandler);

module.exports = app;
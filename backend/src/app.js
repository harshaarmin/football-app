const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const client = require("./config/prometheus");

const {
  httpRequestsTotal,
  httpRequestDuration,
} = require("./config/metrics");

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

// ================= PROMETHEUS METRICS =================

app.use((req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    // Skip internal endpoints
    if (
      req.originalUrl === "/metrics" ||
      req.originalUrl === "/api/health"
    ) {
      return;
    }

    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;

    httpRequestsTotal.inc({
      method: req.method,
      route: req.originalUrl,
      status: String(res.statusCode),
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.originalUrl,
        status: String(res.statusCode),
      },
      duration
    );
  });

  next();
});



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

// ================= SWAGGER =================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

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


// ================= PROMETHEUS =================

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
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
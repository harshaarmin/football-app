const client = require("prom-client");

// ================= HTTP REQUEST COUNTER =================

const httpRequestsTotal = new client.Counter({
  name: "football_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

// ================= RESPONSE TIME =================

const httpRequestDuration = new client.Histogram({
  name: "football_http_request_duration_seconds",
  help: "Duration of HTTP requests",
  labelNames: ["method", "route", "status"],

  buckets: [
    0.05,
    0.1,
    0.2,
    0.3,
    0.5,
    1,
    2,
    5,
  ],
});

// ================= REDIS =================

const redisHitsTotal = new client.Counter({
  name: "football_redis_hits_total",
  help: "Total Redis cache hits",
});

const redisMissesTotal = new client.Counter({
  name: "football_redis_misses_total",
  help: "Total Redis cache misses",
});

const redisSetsTotal = new client.Counter({
  name: "football_redis_sets_total",
  help: "Total Redis cache writes",
});

// ================= EXTERNAL API =================

const externalApiRequestsTotal = new client.Counter({
  name: "football_external_api_requests_total",
  help: "Total external Football API requests",
  labelNames: ["method", "endpoint", "status"],
});

const externalApiLatency = new client.Histogram({
  name: "football_external_api_latency_seconds",
  help: "External Football API latency",
  labelNames: ["method", "endpoint"],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

const externalApiErrorsTotal = new client.Counter({
  name: "football_external_api_errors_total",
  help: "Total external Football API errors",
  labelNames: ["method", "endpoint", "status"],
});

module.exports = {
  httpRequestsTotal,
  httpRequestDuration,

  redisHitsTotal,
  redisMissesTotal,
  redisSetsTotal,

  externalApiRequestsTotal,
  externalApiLatency,
  externalApiErrorsTotal,
};
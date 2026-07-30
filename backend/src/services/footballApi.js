const axios = require("axios");

const {
  externalApiRequestsTotal,
  externalApiLatency,
  externalApiErrorsTotal,
} = require("../config/metrics");

const footballAPI = axios.create({
  baseURL: process.env.FOOTBALL_API_BASE_URL,
  headers: {
    "X-Auth-Token": process.env.FOOTBALL_API_KEY,
  },
});

// --------------------
// Request Interceptor
// --------------------
footballAPI.interceptors.request.use((config) => {
  config.metadata = {
    startTime: process.hrtime(),
  };

  return config;
});

// --------------------
// Response Interceptor
// --------------------
footballAPI.interceptors.response.use(
  (response) => {
    const diff = process.hrtime(response.config.metadata.startTime);
    const duration = diff[0] + diff[1] / 1e9;

    const method = response.config.method.toUpperCase();
    const endpoint = response.config.url;

    externalApiRequestsTotal.inc({
      method,
      endpoint,
      status: String(response.status),
    });

    externalApiLatency.observe(
      {
        method,
        endpoint,
      },
      duration
    );

    return response;
  },

  (error) => {
    const config = error.config || {};

    const method = (config.method || "UNKNOWN").toUpperCase();
    const endpoint = config.url || "UNKNOWN";
    const status = String(error.response?.status || "ERROR");

    if (config.metadata?.startTime) {
      const diff = process.hrtime(config.metadata.startTime);
      const duration = diff[0] + diff[1] / 1e9;

      externalApiLatency.observe(
        {
          method,
          endpoint,
        },
        duration
      );
    }

    externalApiErrorsTotal.inc({
      method,
      endpoint,
      status,
    });

    throw error;
  }
);

module.exports = footballAPI;
const client = require("prom-client");

// Collect default Node.js metrics
client.collectDefaultMetrics();

module.exports = client;
const dotenv = require("dotenv");
dotenv.config();

const app = require("../backend/src/app");

module.exports = app;
module.exports.default = app;

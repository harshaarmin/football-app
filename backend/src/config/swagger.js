const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Football Hub API",
      version: "1.0.0",
      description:
        "API documentation for the Football Hub backend.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
  "./src/routes/*.js",
],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
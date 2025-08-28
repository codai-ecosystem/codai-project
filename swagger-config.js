// Swagger/OpenAPI Configuration for CodAI Services
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'CodAI Essential Services API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for CodAI Essential Services'
    },
    servers: [
      { url: 'http://localhost:8100', description: 'Identity API Development' },
      { url: 'http://localhost:8010', description: 'API Gateway Development' },
      { url: 'http://localhost:8110', description: 'Hub API Development' }
    ]
  },
  apis: ['./src/routes/*.js', './src/routes/*.ts', './src/controllers/*.js', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(options);
module.exports = { specs };

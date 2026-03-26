// Конфигурация Swagger для генерации документации API
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Магазин техники API",
      version: "1.0.0",
      description:
        "REST API для управления клиентами, заказами и пунктами выдачи (ПВЗ).",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Локальный сервер (разработка)",
      },
    ],
    components: {
      securitySchemes: {
        basicAuth: {
          type: "http",
          scheme: "basic",
          description:
            "Basic Authentication для доступа к административным эндпоинтам. Используйте учетные данные из конфигурации.",
        },
      },
    },
  },
  // Путь к YAML-файлам с описанием эндпоинтов
  apis: ["./docs/*.yaml"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;

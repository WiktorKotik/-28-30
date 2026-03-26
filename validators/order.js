// Правила валидации для сущности "Заказ"
const { body, param, query } = require("express-validator");
const config = require("../config");

// Правила для создания нового заказа
const createOrder = [
  body("customerId")
    .isInt({ min: 1 })
    .withMessage("customerId должен быть положительным целым числом"),

  body("pvzId")
    .isInt({ min: 1 })
    .withMessage("pvzId должен быть положительным целым числом"),

  body("status")
    .optional()
    .isIn(config.ORDER_STATUSES)
    .withMessage(
      `Статус должен быть одним из: ${config.ORDER_STATUSES.join(", ")}`
    ),

  body("items")
    .isArray({ min: 1 })
    .withMessage("items должен быть непустым массивом"),

  body("items.*.productName")
    .trim()
    .notEmpty()
    .withMessage("Название товара обязательно"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Количество должно быть ≥ 1"),

  body("items.*.price")
    .isFloat({ min: 0 })
    .withMessage("Цена должна быть ≥ 0"),
];

// Правила для обновления заказа
const updateOrder = [
  body("status")
    .optional()
    .isIn(config.ORDER_STATUSES)
    .withMessage(
      `Статус должен быть одним из: ${config.ORDER_STATUSES.join(", ")}`
    ),

  body("pvzId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("pvzId должен быть положительным целым числом"),

  // Параметр :id в URL должен быть положительным целым числом
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID заказа должен быть положительным целым числом"),
];

// Правила для параметров запроса при получении списка заказов
const getAllOrdersQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page должен быть ≥ 1"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("limit должен быть от 1 до 20"),

  query("status").optional().isIn(config.ORDER_STATUSES),

  query("pvzId").optional().isInt({ min: 1 }),
];

module.exports = {
  createOrder,
  updateOrder,
  getAllOrdersQuery,
};

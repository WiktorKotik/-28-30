// Правила валидации для сущности "Клиент"
const { body, param } = require("express-validator");
const config = require("../config");

// Правила для создания нового клиента — все поля обязательны
const createCustomer = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Имя обязательно")
    .isLength({ min: config.MIN_NAME_LENGTH, max: config.MAX_NAME_LENGTH })
    .withMessage(
      `Имя должно быть от ${config.MIN_NAME_LENGTH} до ${config.MAX_NAME_LENGTH} символов`
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email обязателен")
    .isEmail()
    .withMessage("Некорректный формат email")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Телефон обязателен")
    .matches(config.DEFAULT_PHONE_REGEX)
    .withMessage("Телефон должен быть в формате +7(XXX)XXX-XX-XX"),
];

// Правила для обновления клиента — все поля опциональны
const updateCustomer = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: config.MIN_NAME_LENGTH, max: config.MAX_NAME_LENGTH })
    .withMessage(
      `Имя должно быть от ${config.MIN_NAME_LENGTH} до ${config.MAX_NAME_LENGTH} символов`
    ),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Некорректный формат email")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .matches(config.DEFAULT_PHONE_REGEX)
    .withMessage("Телефон должен быть в формате +7(XXX)XXX-XX-XX"),

  // Параметр :id в URL должен быть положительным целым числом
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID должен быть положительным целым числом"),
];

module.exports = {
  createCustomer,
  updateCustomer,
};

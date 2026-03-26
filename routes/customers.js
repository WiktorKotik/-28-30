// Маршруты для ресурса "Клиенты"
const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");
const auth = require("../middleware/auth");
const { createCustomer, updateCustomer } = require("../validators/customer");

// Публичные маршруты (без аутентификации)
router.get("/", customerController.getAllCustomers);
router.get("/:id", customerController.getCustomerById);

// Защищённые маршруты — требуют Basic Auth + прохождения валидации
router.post("/", auth, ...createCustomer, customerController.createCustomer);
router.put("/:id", auth, ...updateCustomer, customerController.updateCustomer);
router.delete("/:id", auth, customerController.deleteCustomer);

module.exports = router;

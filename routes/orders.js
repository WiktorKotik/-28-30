// Маршруты для ресурса "Заказы"
const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const auth = require("../middleware/auth");

const {
  createOrder,
  updateOrder,
  getAllOrdersQuery,
} = require("../validators/order");

// Публичные маршруты (без аутентификации)
router.get("/", ...getAllOrdersQuery, orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);

// Защищённые маршруты — требуют Basic Auth + прохождения валидации
router.post("/", auth, ...createOrder, orderController.createOrder);
router.put("/:id", auth, ...updateOrder, orderController.updateOrder);
router.delete("/:id", auth, orderController.deleteOrder);

module.exports = router;

// Маршруты для статистики заказов
const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const auth = require("../middleware/auth");

// Защищённый маршрут — статистика доступна только администратору
router.get("/", auth, orderController.getStats);

module.exports = router;

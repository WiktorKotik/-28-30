// Маршруты для ресурса "Пункты выдачи заказов"
const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Публичный маршрут — возвращает статический список всех ПВЗ из базы данных
router.get("/", (req, res, next) => {
  try {
    const pvz = db.prepare("SELECT * FROM pvz ORDER BY city, address").all();
    res.json(pvz);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

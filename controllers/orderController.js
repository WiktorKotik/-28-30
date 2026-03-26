// Контроллер для обработки HTTP-запросов к ресурсу "Заказы"
const orderService = require("../services/orderService");
const AppError = require("../utils/appError");

/**
 * GET /api/orders — получить список заказов с фильтрами и пагинацией
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    // Ограничиваем limit максимальным значением 20
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    const status = req.query.status || null;
    const pvzId = req.query.pvzId ? parseInt(req.query.pvzId) : null;

    const orders = await orderService.getAll({ page, limit, status, pvzId });

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id — получить заказ по ID вместе с позициями товаров
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getById(id);

    if (!order) throw new AppError("Заказ не найден", 404);

    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/orders — создать новый заказ
 */
exports.createOrder = async (req, res, next) => {
  try {
    const order = await orderService.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/orders/:id — обновить статус или ПВЗ заказа
 */
exports.updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await orderService.update(id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/orders/:id — удалить заказ
 */
exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    await orderService.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/stats — получить статистику по заказам
 */
exports.getStats = async (req, res, next) => {
  try {
    const stats = await orderService.getStats();
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};

module.exports = exports;

// Контроллер для обработки HTTP-запросов к ресурсу "Клиенты"
const customerService = require("../services/customerService");
const AppError = require("../utils/appError");

/**
 * GET /api/customers — получить список клиентов с пагинацией и фильтром
 */
exports.getAllCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    const email = req.query.email ? req.query.email.trim() : null;

    const customers = await customerService.getAll({ page, limit, email });

    res.status(200).json(customers);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/customers/:id — получить клиента по ID
 */
exports.getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await customerService.getById(id);

    if (!customer) {
      throw new AppError("Клиент не найден", 404);
    }

    res.status(200).json(customer);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/customers — создать нового клиента
 */
exports.createCustomer = async (req, res, next) => {
  try {
    const newCustomer = await customerService.create(req.body);
    res.status(201).json(newCustomer);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/customers/:id — обновить данные клиента
 */
exports.updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await customerService.update(id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/customers/:id — удалить клиента
 */
exports.deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    await customerService.delete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = exports;

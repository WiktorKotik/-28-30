// Бизнес-логика для работы с клиентами
const db = require("../db/db");
const AppError = require("../utils/appError");

/**
 * Получить список клиентов с пагинацией и фильтром по email
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @param {string|null} options.email
 * @returns {Array}
 */
exports.getAll = ({ page = 1, limit = 10, email = null }) => {
  // Вычисляем смещение для пагинации
  const offset = (page - 1) * limit;

  let query = `
    SELECT id, name, email, phone, registeredAt
    FROM customers
  `;
  const params = [];

  // Добавляем фильтр по email, если он передан
  if (email) {
    query += " WHERE email = ?";
    params.push(email.trim());
  }

  query += " ORDER BY registeredAt DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const stmt = db.prepare(query);
  return stmt.all(...params);
};

/**
 * Получить клиента по ID
 * @param {number|string} id
 * @returns {Object|null}
 */
exports.getById = (id) => {
  const stmt = db.prepare(`
    SELECT id, name, email, phone, registeredAt
    FROM customers
    WHERE id = ?
  `);
  return stmt.get(id);
};

/**
 * Создать нового клиента
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.phone
 * @returns {Object}
 * @throws AppError если email уже существует
 */
exports.create = (data) => {
  const { name, email, phone } = data;

  // Проверяем уникальность email
  const existing = db
    .prepare("SELECT id FROM customers WHERE email = ?")
    .get(email);
  if (existing) {
    throw new AppError("Клиент с таким email уже существует", 400);
  }

  // Вставляем нового клиента в базу
  const insertStmt = db.prepare(
    "INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)"
  );
  const info = insertStmt.run(name, email, phone);

  // Возвращаем созданного клиента с его ID и датой регистрации
  const newCustomer = db
    .prepare(
      `
    SELECT id, name, email, phone, registeredAt
    FROM customers
    WHERE id = ?
  `
    )
    .get(info.lastInsertRowid);

  return newCustomer;
};

/**
 * Обновить данные существующего клиента
 * @param {number} id
 * @param {Object} data
 * @returns {Object}
 */
exports.update = (id, data) => {
  const { name, email, phone } = data;

  const updates = [];
  const params = [];

  if (name) {
    updates.push("name = ?");
    params.push(name);
  }
  if (email) {
    // Проверяем, что новый email не используется другим клиентом
    const existing = db
      .prepare("SELECT id FROM customers WHERE email = ? AND id != ?")
      .get(email, id);
    if (existing) {
      throw new AppError("Клиент с таким email уже существует", 400);
    }
    updates.push("email = ?");
    params.push(email);
  }
  if (phone) {
    updates.push("phone = ?");
    params.push(phone);
  }

  // Если не передано ни одного поля — ошибка
  if (!updates.length) {
    throw new AppError("Не указаны поля для обновления", 400);
  }

  params.push(id);

  const stmt = db.prepare(`
    UPDATE customers
    SET ${updates.join(", ")}
    WHERE id = ?
  `);

  const info = stmt.run(...params);

  if (info.changes === 0) {
    throw new AppError("Клиент не найден", 404);
  }

  return exports.getById(id);
};

/**
 * Удалить клиента по ID
 * @param {number} id
 */
exports.delete = (id) => {
  const customer = db
    .prepare("SELECT id FROM customers WHERE id = ?")
    .get(id);
  if (!customer) {
    throw new AppError("Клиент не найден", 404);
  }

  // Проверяем наличие активных заказов у клиента
  const hasOrders = db
    .prepare("SELECT 1 FROM orders WHERE customerId = ?")
    .get(id);
  if (hasOrders) {
    throw new AppError(
      "Невозможно удалить клиента с активными заказами",
      409
    );
  }

  db.prepare("DELETE FROM customers WHERE id = ?").run(id);
};

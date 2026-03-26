// Бизнес-логика для работы с заказами
const db = require("../db/db");
const AppError = require("../utils/appError");

/**
 * Получить список заказов с пагинацией и фильтрами
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @param {string|null} options.status
 * @param {number|null} options.pvzId
 * @returns {Array}
 */
exports.getAll = ({ page = 1, limit = 10, status = null, pvzId = null }) => {
  const offset = (page - 1) * limit;

  // Базовый запрос с JOIN для получения имени клиента и адреса ПВЗ
  let query = `
    SELECT o.id, o.customerId, o.totalPrice, o.status, o.pvzId, o.createdAt,
           c.name AS customerName, p.address AS pvzAddress, p.city AS pvzCity
    FROM orders o
    JOIN customers c ON o.customerId = c.id
    JOIN pvz p ON o.pvzId = p.id
  `;
  const params = [];
  const conditions = [];

  if (status) {
    conditions.push("o.status = ?");
    params.push(status);
  }
  if (pvzId) {
    conditions.push("o.pvzId = ?");
    params.push(pvzId);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY o.createdAt DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  return db.prepare(query).all(...params);
};

/**
 * Получить заказ по ID вместе с позициями товаров
 * @param {number} id
 * @returns {Object|null}
 */
exports.getById = (id) => {
  // Получаем основные данные заказа с информацией о клиенте и ПВЗ
  const order = db
    .prepare(
      `
    SELECT o.*, c.name AS customerName, p.address AS pvzAddress, p.city AS pvzCity
    FROM orders o
    JOIN customers c ON o.customerId = c.id
    JOIN pvz p ON o.pvzId = p.id
    WHERE o.id = ?
  `
    )
    .get(id);

  if (!order) return null;

  // Отдельным запросом получаем список товаров заказа
  const items = db
    .prepare(
      `
    SELECT productName, quantity, price
    FROM order_items
    WHERE orderId = ?
  `
    )
    .all(id);

  return { ...order, items };
};

/**
 * Создать новый заказ вместе с позициями товаров (транзакция)
 * @param {Object} data
 * @param {number} data.customerId
 * @param {number} data.pvzId
 * @param {string} data.status
 * @param {Array}  data.items
 * @returns {Object}
 */
exports.create = (data) => {
  const { customerId, pvzId, status = "new", items = [] } = data;

  // Проверяем, что список товаров не пуст
  if (!items.length) {
    throw new AppError("Заказ должен содержать хотя бы один товар", 400);
  }

  // Проверяем существование клиента и ПВЗ
  const customerExists = db
    .prepare("SELECT 1 FROM customers WHERE id = ?")
    .get(customerId);
  if (!customerExists) throw new AppError("Клиент не найден", 404);

  const pvzExists = db
    .prepare("SELECT 1 FROM pvz WHERE id = ?")
    .get(pvzId);
  if (!pvzExists) throw new AppError("ПВЗ не найден", 404);

  // Рассчитываем итоговую стоимость заказа
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // Используем транзакцию: вставляем заказ и его позиции атомарно
  return db.transaction(() => {
    // 1. Создаём заказ
    const orderStmt = db.prepare(`
      INSERT INTO orders (customerId, totalPrice, status, pvzId)
      VALUES (?, ?, ?, ?)
    `);
    const orderInfo = orderStmt.run(customerId, totalPrice, status, pvzId);
    const orderId = orderInfo.lastInsertRowid;

    // 2. Добавляем позиции заказа
    const itemStmt = db.prepare(`
      INSERT INTO order_items (orderId, productName, quantity, price)
      VALUES (?, ?, ?, ?)
    `);

    items.forEach((item) => {
      itemStmt.run(orderId, item.productName, item.quantity, item.price);
    });

    return exports.getById(orderId);
  })();
};

/**
 * Обновить статус или ПВЗ существующего заказа
 * @param {number} id
 * @param {Object} data
 * @returns {Object}
 */
exports.update = (id, data) => {
  const { status, pvzId } = data;

  const updates = [];
  const params = [];

  if (status) {
    updates.push("status = ?");
    params.push(status);
  }
  if (pvzId) {
    updates.push("pvzId = ?");
    params.push(pvzId);
  }

  if (!updates.length) {
    throw new AppError("Не указаны поля для обновления", 400);
  }

  params.push(id);

  const stmt = db.prepare(`
    UPDATE orders
    SET ${updates.join(", ")}
    WHERE id = ?
  `);

  const info = stmt.run(...params);

  if (info.changes === 0) {
    throw new AppError("Заказ не найден", 404);
  }

  return exports.getById(id);
};

/**
 * Удалить заказ по ID (только со статусом new или canceled)
 * @param {number} id
 */
exports.delete = (id) => {
  const order = db
    .prepare("SELECT status FROM orders WHERE id = ?")
    .get(id);
  if (!order) throw new AppError("Заказ не найден", 404);

  // Бизнес-правило: удалять можно только заказы со статусом new или canceled
  if (!["new", "canceled"].includes(order.status)) {
    throw new AppError(
      'Можно удалять только заказы со статусом "new" или "canceled"',
      409
    );
  }

  db.prepare("DELETE FROM orders WHERE id = ?").run(id);
};

/**
 * Получить агрегированную статистику по заказам
 * @returns {Object}
 */
exports.getStats = () => {
  // Количество заказов по каждому статусу
  const ordersByStatus = db
    .prepare(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `)
    .all()
    .reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {});

  // Общее количество заказов и выручка
  const totalOrders = db
    .prepare("SELECT COUNT(*) as count FROM orders")
    .get().count;
  const totalRevenue =
    db.prepare("SELECT SUM(totalPrice) as sum FROM orders").get().sum || 0;

  // Статистика по пунктам выдачи
  const ordersByPvz = db
    .prepare(
      `
      SELECT p.id as pvzId, p.city, p.address, COUNT(o.id) as orderCount, SUM(o.totalPrice) as revenue
      FROM pvz p
      LEFT JOIN orders o ON p.id = o.pvzId
      GROUP BY p.id
    `
    )
    .all();

  // Количество клиентов, сделавших хотя бы один заказ
  const clientsWithOrders = db
    .prepare(
      "SELECT COUNT(DISTINCT customerId) as count FROM orders"
    )
    .get().count;

  return { ordersByStatus, totalOrders, totalRevenue, ordersByPvz, clientsWithOrders };
};

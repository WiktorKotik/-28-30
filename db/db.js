// Инициализация и настройка базы данных SQLite
const Database = require("better-sqlite3");
const path = require("path");

// Формируем путь к файлу базы данных в той же папке, что и этот скрипт
const dbPath = path.join(__dirname, "store.db");

// Создаём подключение к БД; если файла нет — библиотека создаст его автоматически
const db = new Database(dbPath, { verbose: console.log });

// Включаем проверку ограничений внешних ключей (по умолчанию в SQLite отключено)
db.pragma("foreign_keys = ON");

// Создаём таблицы, если они ещё не существуют
db.exec(`
  CREATE TABLE IF NOT EXISTS pvz (
    id      INTEGER PRIMARY KEY,
    address TEXT NOT NULL,
    city    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS customers (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL CHECK(length(name) >= 3 AND length(name) <= 50),
    email        TEXT NOT NULL UNIQUE,
    phone        TEXT NOT NULL UNIQUE,
    registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    customerId INTEGER NOT NULL,
    totalPrice REAL    NOT NULL DEFAULT 0,
    status     TEXT    NOT NULL CHECK(status IN ('new', 'processing', 'ready_for_pickup', 'completed', 'canceled')),
    pvzId      INTEGER NOT NULL,
    createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (pvzId)      REFERENCES pvz(id)       ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS order_items (
    orderId     INTEGER NOT NULL,
    productName TEXT    NOT NULL,
    quantity    INTEGER NOT NULL CHECK(quantity > 0),
    price       REAL    NOT NULL CHECK(price >= 0),

    PRIMARY KEY (orderId, productName),
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
  );
`);

// Заполняем таблицу ПВЗ начальными данными, если она пуста
const pvzCount = db.prepare("SELECT COUNT(*) as cnt FROM pvz").get().cnt;

if (pvzCount === 0) {
  const insertPvz = db.prepare(
    "INSERT INTO pvz (id, address, city) VALUES (?, ?, ?)"
  );

  const pvzList = [
    [1, "ул. Ленина, 10, ТЦ \"Галерея\"", "Москва"],
    [2, "пр. Мира, 25, к. 1", "Санкт-Петербург"],
    [3, "ул. Победы, 5", "Екатеринбург"],
    [4, "ул. Советская, 12", "Новосибирск"],
    [5, "пр. Космонавтов, 8", "Казань"],
  ];

  const transaction = db.transaction(() => {
    pvzList.forEach((pvz) => insertPvz.run(...pvz));
  });

  transaction();
  console.log("ПВЗ успешно добавлены");
}

module.exports = db;

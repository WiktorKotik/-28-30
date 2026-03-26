// Точка входа в приложение — настройка и запуск Express-сервера
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const specs = require("./swagger");
const config = require("./config");

// Импорт роутеров для всех ресурсов API
const customerRouter = require("./routes/customers");
const orderRouter = require("./routes/orders");
const pvzRouter = require("./routes/pvz");
const statsRouter = require("./routes/stats");

const app = express();

// Middleware: разрешаем кросс-доменные запросы (CORS)
app.use(cors());

// Middleware: автоматически парсим JSON из тела запроса (доступен через req.body)
app.use(express.json());

// Middleware: логируем каждый входящий запрос в консоль
app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Swagger UI — интерактивная документация API по адресу /api-docs
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true, // сохраняем токен авторизации при обновлении страницы
    },
    customSiteTitle: "Магазин техники API Docs",
  })
);

// Корневой маршрут — приветственное сообщение и ссылка на документацию
app.get("/", (req, res) => {
  res.json({
    message: "Добро пожаловать в API магазина техники!",
    docs: "/api-docs — интерактивная документация",
  });
});

// Подключаем роутеры к соответствующим путям API
app.use("/api/customers", customerRouter);
app.use("/api/orders", orderRouter);
app.use("/api/pvz", pvzRouter);
app.use("/api/stats", statsRouter);

// Middleware для проверки результатов валидации express-validator
const { validationResult } = require("express-validator");
app.use((req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Ошибка валидации",
      errors: errors.array(),
    });
  }
  next();
});

// Глобальный обработчик ошибок — перехватывает все ошибки, выброшенные через next(err)
app.use((err, req, res, next) => {
  console.error("Ошибка:", err.message);
  console.error(err.stack);

  const status = typeof err.status === "number" ? err.status : 500;

  res.status(status).json({
    error: err.message || "Внутренняя ошибка сервера",
  });
});

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Документация доступна: http://localhost:${PORT}/api-docs`);
});

// Отладочная информация: проверяем, что контроллер клиентов успешно загружен
const customerController = require("./controllers/customerController");
console.log(
  "CustomerController загружен:",
  !!customerController.getAllCustomers
);

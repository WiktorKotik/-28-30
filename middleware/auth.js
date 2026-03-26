// Middleware базовой аутентификации (Basic Auth)
const config = require("../config");
const AppError = require("../utils/appError");

const authMiddleware = (req, res, next) => {
  // Проверяем наличие заголовка Authorization и его формат
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return next(new AppError("Требуется авторизация (Basic Auth)", 401));
  }

  // Декодируем учётные данные из Base64 в строку "username:password"
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  // Сравниваем с данными из конфигурации
  if (
    username === config.ADMIN_CREDENTIALS.username &&
    password === config.ADMIN_CREDENTIALS.password
  ) {
    next(); // Аутентификация прошла успешно
  } else {
    return next(new AppError("Неверные учётные данные", 401));
  }
};

module.exports = authMiddleware;

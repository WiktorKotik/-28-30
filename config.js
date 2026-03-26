// Общая конфигурация проекта
module.exports = {
  // Порт сервера из переменной окружения или 3000 по умолчанию
  PORT: process.env.PORT || 3000,

  // Количество элементов на странице (пагинация)
  ITEMS_PER_PAGE: 10,
  MAX_ITEMS_PER_PAGE: 20,

  // Допустимые статусы заказов
  ORDER_STATUSES: [
    "new",
    "processing",
    "ready_for_pickup",
    "completed",
    "canceled",
  ],

  // Префикс для всех API-маршрутов
  API_PREFIX: "/api",

  // Данные администратора для базовой аутентификации
  ADMIN_CREDENTIALS: {
    username: "admin",
    password: "password",
  },

  // Регулярное выражение для проверки формата телефона +7(XXX)XXX-XX-XX
  DEFAULT_PHONE_REGEX: /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/,

  // Минимальная и максимальная длина имени клиента
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 50,

  // Время жизни кэша статистики в миллисекундах (60 секунд)
  STATS_CACHE_TTL: 60 * 1000,
};

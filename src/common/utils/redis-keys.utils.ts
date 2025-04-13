/**
 * Преобразует id пользователя в ключ для кеширования аккаунта
 * @param id - ID пользователя
 */
export const getAccountCacheKey = (id: string): string => `cache:a:${id}`;

/**
 * Генерирует ключ для кеширования профиля
 * @param username - имя пользователя
 */
export const getProfileCacheKey = (username: string): string =>
  `cache:p:${username}`;

/**
 * Генерирует ключ для кеширования страницы изображения
 * @param id - ID изображения
 */
export const getContentCacheKey = (id: string): string => `cache:c:${id}`;

/**
 * Генерирует ключ для регистрации временного аккаунта
 * @param email - Email пользователя
 */
export const getRegisterPendingKey = (email: string): string =>
  `pending:register:${email}`;

/**
 * Генерирует ключ для ограничения количества запросов на определенное действие
 * @param ip - IP пользователя
 */
export const getActionRateLimitKey = (ip: string, action: string): string =>
  `rate-limit:${action}:${ip}`;

/**
 * Генерирует ключ для хранения кода подтверждения аккаунта
 * @param email - Email пользователя
 */
export const getRegistrationCodeKey = (email: string): string =>
  `code:confirm:${email}`;

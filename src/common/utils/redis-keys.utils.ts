/**
 * Преобразует id пользователя в ключ для кеширования аккаунта
 * @param id - ID пользователя
 */
export const accountCacheKey = (id: string): string => `cache:a:${id}`;

/**
 * Генерирует ключ для кеширования профиля
 * @param username - имя пользователя
 */
export const profileCacheKey = (username: string): string =>
  `cache:p:${username}`;

/**
 * Генерирует ключ для кеширования страницы изображения
 * @param id - ID изображения
 */
export const contentCacheKey = (id: string): string => `cache:c:${id}`;

/**
 * Генерирует ключ для регистрации временного аккаунта
 * @param email - Email пользователя
 */
export const registerPendingKey = (email: string): string =>
  `pending:register:${email}`;

/**
 * Генерирует ключ для ограничения количества запросов на отправку писем
 * @param ip - IP пользователя
 */
export const mailerRatelimitKey = (ip: string): string =>
  `ratelimit:send-code:ip:${ip}`;

/**
 * Генерирует ключ для ограничения количества запросов с одного IP адреса
 * @param ip
 */
export const requestRatelimitKey = (ip: string): string =>
  `ratelimit:request:ip:${ip}`;

/**
 * Генерирует ключ для хранения кода подтверждения аккаунта
 * @param email - Email пользователя
 */
export const registrationCodeKey = (email: string): string =>
  `code:confirm:${email}`;

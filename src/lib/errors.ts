const MESSAGES: Record<string, string> = {
  // database errors
  invite_invalid: 'Неправильний код із запрошення',
  nickname_invalid: "Ім'я: 2–24 символи — літери, цифри, пробіл, _ . -",
  nickname_taken: "Це ім'я вже зайняте, оберіть інше",
  invite_too_short: 'Інвайт-код має бути не коротшим за 6 символів',
  not_authenticated: 'Потрібно увійти',
  forbidden: 'Недостатньо прав',
  gift_not_found: 'Подарунок не знайдено — можливо, його вже видалили',
  already_reserved: 'Цей подарунок щойно хтось забронював',
  limit_reached: 'Досягнуто ліміту бронювань — спершу скасуйте одне з попередніх',
  not_your_reservation: 'Це бронювання вже скасоване або належить комусь іншому',
  cannot_delete_self: 'Не можна видалити власний акаунт',
  // Supabase Auth errors
  invalid_credentials: "Неправильне ім'я або пароль",
  user_already_exists: "Це ім'я вже зайняте, оберіть інше",
  email_exists: "Це ім'я вже зайняте, оберіть інше",
  weak_password: 'Пароль занадто простий (мінімум 6 символів)',
  validation_failed: "Перевірте правильність імені та пароля",
  over_request_rate_limit: 'Забагато спроб, спробуйте за кілька хвилин',
  over_email_send_rate_limit: 'Забагато спроб, спробуйте за кілька хвилин',
};

export class AppError extends Error {}

export const toAppError = (error: { message?: string; code?: string }): AppError => {
  const known = (error.code && MESSAGES[error.code]) || (error.message && MESSAGES[error.message]);

  if (known) return new AppError(known);
  if (error.code === '23514') return new AppError('Некоректні дані — перевірте поля форми');

  return new AppError(`Щось пішло не так: ${error.message ?? 'невідома помилка'}`);
};

export const errorText = (error: unknown): string =>
  error instanceof AppError ? error.message : 'Щось пішло не так. Спробуйте оновити сторінку.';

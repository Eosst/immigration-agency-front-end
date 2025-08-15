import { format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Get user's timezone
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Convert UTC date to user's local timezone
export const utcToLocal = (utcDate) => {
  const userTimezone = getUserTimezone();
  return toZonedTime(utcDate, userTimezone);
};

// Convert local date to UTC
export const localToUtc = (localDate) => {
  const userTimezone = getUserTimezone();
  return fromZonedTime(localDate, userTimezone);
};

// Format date in user's timezone
export const formatInTimezone = (date, formatStr = 'yyyy-MM-dd HH:mm zzz') => {
  const userTimezone = getUserTimezone();
  return format(toZonedTime(date, userTimezone), formatStr, { timeZone: userTimezone });
};

// Create ISO string with timezone
export const createISOWithTimezone = (date, time) => {
  const userTimezone = getUserTimezone();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // The 'time' variable from the backend is already formatted as HH:mm:ss.
  // We don't need to append anything.
  const dateTimeStr = `${year}-${month}-${day}T${time}`;
  const zonedDate = new Date(dateTimeStr);

  const offset = -zonedDate.getTimezoneOffset();
  const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
  const offsetSign = offset >= 0 ? '+' : '-';
  const timezoneOffset = `${offsetSign}${offsetHours}:${offsetMinutes}`;

  // Return ISO string with the correct time format and timezone
  return `${year}-${month}-${day}T${time}${timezoneOffset}`;
};
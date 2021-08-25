import { MONTHS } from './constants';

export function formatDateToString(date, separator = ' '): string {
  const newDate = new Date(date);
  const day = newDate.getUTCDate();
  const month = newDate.getUTCMonth();
  const monthString = separator === ' ' ? MONTHS[month] : month + 1;
  const year = newDate.getUTCFullYear();
  if (separator === '/') {
    return `${monthString}${separator}${day}${separator}${year}`;
  }

  return `${day}${separator}${monthString}${separator}${year}`;
}

export function cleanEmptyValues(obj) {
  return Object.keys(obj)
    .filter((k) => obj[k] !== '' && obj[k] !== null)
    .reduce((a, k) => ({ ...a, [k]: obj[k] }), {});
}

export function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

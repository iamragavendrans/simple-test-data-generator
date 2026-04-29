/**
 * generators/extras.js
 * Hash, Coordinates, Date — new types added in v3.
 */

import { randInt, pad } from '../utils.js';

/** Random hex string of a given byte-length (e.g. 16 bytes = MD5) */
function randomHex(bytes) {
  return Array.from({ length: bytes }, () => pad(randInt(0, 255).toString(16), 2)).join('');
}

/**
 * Generate a random hash string.
 * @param {{ algorithm?: 'md5'|'sha1'|'sha256' }} opts
 */
export function generateHash({ algorithm = 'sha256' } = {}) {
  const lengths = { md5: 16, sha1: 20, sha256: 32 };
  const bytes = lengths[algorithm] ?? 32;
  return randomHex(bytes);
}

/**
 * Generate a lat/lng pair.
 * @param {{ precision?: number }} opts
 */
export function generateCoordinates({ precision = 6 } = {}) {
  const p  = Math.max(1, Math.min(8, parseInt(precision, 10) || 6));
  const lat = (Math.random() * 180 - 90).toFixed(p);
  const lng = (Math.random() * 360 - 180).toFixed(p);
  return `${lat}, ${lng}`;
}

/**
 * Generate a date-only string (no time component).
 * @param {{ from_year?: number, to_year?: number, format?: 'iso'|'us'|'eu' }} opts
 */
export function generateDate({ from_year = 2000, to_year = 2030, format = 'iso' } = {}) {
  const y = randInt(parseInt(from_year, 10) || 2000, parseInt(to_year, 10) || 2030);
  const m = randInt(1, 12);
  // Day 0 of (month+1) is the last day of `month` — handles leap years and 30/31-day months.
  const lastDay = new Date(y, m, 0).getDate();
  const d = randInt(1, lastDay);
  if (format === 'us') return `${pad(m)}/${pad(d)}/${y}`;
  if (format === 'eu') return `${pad(d)}/${pad(m)}/${y}`;
  return `${y}-${pad(m)}-${pad(d)}`;
}

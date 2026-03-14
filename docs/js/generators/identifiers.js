/**
 * generators/identifiers.js
 * UUID, Password, Username, IMEI, MAC Address
 */

import { randInt, choice, pad, luhnCheckDigit } from '../utils.js';
import { IMEI_BRANDS, USERNAME_NAMES, USERNAME_ADJ, USERNAME_NOUN } from '../data/datasets.js';

/**
 * Generate a UUID v4 with optional embedded prefix/suffix (mirrors Python logic).
 * @param {{ prefix?:string, suffix?:string }} opts
 */
export function generateUuid({ prefix = '', suffix = '' } = {}) {
  const raw = crypto.randomUUID();
  if (!prefix && !suffix) return raw;

  // Clamp lengths exactly as Python does
  const p = (prefix || '').slice(0, 8);
  const s = (suffix || '').slice(0, 12);

  let hex = raw.replace(/-/g, '');          // 32-char hex
  if (p) hex = p + hex.slice(p.length);    // embed prefix at start
  if (s) hex = hex.slice(0, hex.length - s.length) + s; // embed suffix at end

  // Pad/trim to 32 chars so the UUID blocks always reconstruct cleanly
  hex = hex.padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

/**
 * Generate a random password.
 * @param {{ uppercase?:boolean, lowercase?:boolean, numbers?:boolean, special?:boolean, length?:number }} opts
 */
export function generatePassword({
  uppercase = true, lowercase = true, numbers = true, special = false, length = 16,
} = {}) {
  let chars = '';
  if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers)   chars += '0123456789';
  if (special)   chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!chars)    chars  = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => choice([...chars])).join('');
}

/**
 * Generate a username with the chosen style.
 * @param {{ prefix?:string, style?:string }} opts
 */
export function generateUsername({ prefix = '', style = 'name_year' } = {}) {
  const name = choice(USERNAME_NAMES);
  const adj  = choice(USERNAME_ADJ);
  const noun = choice(USERNAME_NOUN);

  let result;
  switch (style) {
    case 'adj_noun':     result = `${adj}_${noun}`; break;
    case 'name_random':  result = `${name}.${randInt(100, 999)}`; break;
    case 'mrx':          result = `mrx_${name}`; break;
    default:             result = `${name}${randInt(1, 99)}`; break;  // name_year
  }
  return (prefix || '') + result;
}

/**
 * Generate a valid IMEI number using the Luhn algorithm.
 * @param {{ brand?:string, valid_checksum?:boolean }} opts
 */
export function generateImei({ brand = 'Generic', valid_checksum = true } = {}) {
  const tac  = brand === 'Generic' ? String(randInt(35, 86)) : (IMEI_BRANDS[brand] ?? '35');
  const base = tac + Array.from({ length: 12 }, () => randInt(0, 9)).join('');

  if (!valid_checksum) {
    return base + String((parseInt(base.slice(-1), 10) + 1) % 10);
  }

  // Luhn over first 14 digits → append check digit for 15-digit IMEI
  const digits14 = base.slice(0, 14);
  return digits14 + luhnCheckDigit(digits14);
}

/**
 * Generate a MAC address.
 * @param {{ uppercase?:boolean, separator?:string }} opts
 */
export function generateMacAddress({ uppercase = true, separator = ':' } = {}) {
  const parts = Array.from({ length: 6 }, () => pad(randInt(0, 255).toString(16), 2));
  const joined = parts.join(separator);
  return uppercase ? joined.toUpperCase() : joined;
}

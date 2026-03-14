/**
 * generators/financial.js
 * Credit Card (Luhn), SSN, Barcode, ISBN
 */

import { randInt, choice, luhnCheckDigit } from '../utils.js';
import { CREDIT_CARD_TYPES } from '../data/datasets.js';

export function generateCreditCard({ card_type = 'Random', valid = 'valid' } = {}) {
  const isValid = valid === 'valid' || valid === true;

  if (card_type === 'Random') {
    card_type = choice(['Visa', 'Mastercard', 'American Express']);
  }

  const cfg    = CREDIT_CARD_TYPES[card_type] ?? CREDIT_CARD_TYPES.Visa;
  const { prefix, length } = cfg;

  let partial = prefix;
  while (partial.length < length - 1) partial += String(randInt(0, 9));

  const check = luhnCheckDigit(partial);
  let cc = partial + check;

  if (!isValid) {
    cc = cc.slice(0, -1) + String((parseInt(cc.slice(-1), 10) + 1) % 10);
  }

  if (card_type === 'American Express') {
    return `${cc.slice(0, 4)}-${cc.slice(4, 10)}-${cc.slice(10)}`;
  }
  return cc.match(/.{1,4}/g).join('-');
}

export function generateSsn({ country = 'US' } = {}) {
  const c = country === 'Random' ? choice(['US', 'UK']) : country;
  if (c === 'UK') {
    return `${randInt(10, 99)} ${randInt(100000, 999999)} ${randInt(100000, 999999)}`;
  }
  return `${randInt(100, 999)}-${randInt(10, 99)}-${randInt(1000, 9999)}`;
}

export function generateBarcode({ numeric_only = true, length = 13 } = {}) {
  const len = Math.max(8, Math.min(20, parseInt(length, 10) || 13));
  if (numeric_only) {
    return Array.from({ length: len }, () => randInt(0, 9)).join('');
  }
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: len }, () => choice([...chars])).join('');
}

export function generateIsbn({ format = 'isbn13' } = {}) {
  if (format === 'isbn10') {
    const digits = Array.from({ length: 9 }, () => randInt(0, 9)).join('');
    let total = 0;
    for (let i = 0; i < 9; i++) total += (10 - i) * parseInt(digits[i], 10);
    const check = (11 - (total % 11)) % 11;
    const checkChar = check === 10 ? 'X' : String(check);
    return `${digits[0]}-${digits.slice(1, 6)}-${digits.slice(6)}-${checkChar}`;
  }

  // ISBN-13: 978 + 9 random digits = 12 partial + 1 check = 13 total
  const nine    = Array.from({ length: 9 }, () => randInt(0, 9)).join('');
  const partial = '978' + nine;   // 12 digits
  let total = 0;
  for (let i = 0; i < 12; i++) {
    total += (i % 2 === 0 ? 1 : 3) * parseInt(partial[i], 10);
  }
  const check = (10 - (total % 10)) % 10;
  // Groups: 978-XX-XXXXX-XX-C  →  3+2+5+2+1 = 13 digits ✓
  return `${partial.slice(0,3)}-${partial.slice(3,5)}-${partial.slice(5,10)}-${partial.slice(10,12)}-${check}`;
}

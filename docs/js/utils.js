/**
 * utils.js — shared random / formatting helpers
 */

/** Random integer in [min, max] inclusive */
export const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** Pick one element at random from an array */
export const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Zero-pad a number to given length */
export const pad = (n, len = 2) => String(n).padStart(len, "0");

/**
 * Luhn check digit for a partial digit-string (the digits WITHOUT the check digit).
 * The check digit will sit at position 1 (rightmost, not doubled), so the
 * rightmost digit of the partial string is at position 2 → must be doubled.
 * @param {string} numStr — partial digits, no check digit yet
 * @returns {number} 0-9
 */
export function luhnCheckDigit(numStr) {
  let total = 0;
  let doubled = true;          // rightmost partial digit is at position 2 → doubled
  for (let i = numStr.length - 1; i >= 0; i--) {
    let d = parseInt(numStr[i], 10) * (doubled ? 2 : 1);
    if (d > 9) d -= 9;
    total += d;
    doubled = !doubled;
  }
  return (10 - (total % 10)) % 10;
}

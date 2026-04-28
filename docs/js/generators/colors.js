/**
 * generators/colors.js
 * Hex Color, RGB Color
 */

import { randInt, pad } from '../utils.js';

export function generateHexColor({ uppercase = true } = {}) {
  const hex = '#' + Array.from({ length: 3 }, () => pad(randInt(0, 255).toString(16), 2)).join('');
  return uppercase ? hex.toUpperCase() : hex.toLowerCase();
}

export function generateRgbColor({ min_value = 0, max_value = 255 } = {}) {
  const lo = Math.max(0, Math.min(255, parseInt(min_value, 10) || 0));
  const hi = Math.max(lo, Math.min(255, parseInt(max_value, 10) || 255));
  const r = randInt(lo, hi), g = randInt(lo, hi), b = randInt(lo, hi);
  return `rgb(${r}, ${g}, ${b})`;
}

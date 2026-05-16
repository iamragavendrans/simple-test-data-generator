/**
 * generators/time_text.js
 * DateTime, Sentence, Paragraph
 */

import { randInt, choice, pad } from '../utils.js';
import { SENTENCE_SUBJECTS, SENTENCE_VERBS, SENTENCE_OBJECTS, TEXT_WORDS } from '../data/datasets.js';

export function generateDatetime({
  include_date = true, include_time = true, include_timezone = false,
} = {}) {
  const year  = randInt(2020, 2025);
  const month = randInt(1, 12);
  const day   = randInt(1, new Date(year, month, 0).getDate());
  const hour  = randInt(0, 23);
  const min   = randInt(0, 59);
  const sec   = randInt(0, 59);
  const ms    = randInt(0, 999);

  const dateStr = `${pad(year,4)}-${pad(month)}-${pad(day)}`;
  const timeStr = `${pad(hour)}:${pad(min)}:${pad(sec)}.${pad(ms,3)}`;

  let result;
  if (include_date && include_time) result = `${dateStr}T${timeStr}`;
  else if (include_date)            result = dateStr;
  else if (include_time)            result = timeStr;
  else                              result = dateStr;

  if (include_timezone) result += 'Z';
  return result;
}

export function generateSentence({ grammatically_valid = true } = {}) {
  if (grammatically_valid) {
    return `${choice(SENTENCE_SUBJECTS)} ${choice(SENTENCE_VERBS)} ${choice(SENTENCE_OBJECTS)}.`;
  }
  const words    = Array.from({ length: randInt(5, 12) }, () => choice(TEXT_WORDS)).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1) + '.';
}

export function generateParagraph({ min_sentences = 3, max_sentences = 6 } = {}) {
  const lo = Math.max(1, parseInt(min_sentences, 10) || 3);
  const hi = Math.max(lo, parseInt(max_sentences, 10) || 6);
  const n  = randInt(lo, hi);
  return Array.from({ length: n }, () => generateSentence({ grammatically_valid: true })).join(' ');
}

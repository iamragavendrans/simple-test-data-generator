/**
 * generators/schema.js
 * JSON Schema (draft-07) or plain JSON example → payload.
 *
 * Auto-detects mode: if the parsed root looks like a schema (has type / $ref /
 * properties / items / enum / const / oneOf / anyOf / allOf / definitions /
 * $defs / $schema), runs the schema walker; otherwise walks the value tree as
 * an example and regenerates leaves using key-name heuristics.
 *
 * Reuses existing generators — no duplicated faker data.
 */

import { randInt, choice } from '../utils.js';
import { generateUuid } from './identifiers.js';
import {
  generateName, generateEmail, generatePhone, generateAddress,
  generateCity, generateCountry, generateZipcode,
} from './contact.js';
import { generateIp, generateUrl } from './network.js';
import { generateDatetime, generateSentence, generateParagraph } from './time_text.js';
import { generateHexColor } from './colors.js';
import { generateCompany, generateJob } from './work.js';
import { generateDate } from './extras.js';

const MAX_DEPTH = 12;

// Key-name → generator, applied in EXAMPLE mode and as a string fallback in SCHEMA mode
const KEY_RULES = [
  { re: /e?mail/i,                                                              fn: () => generateEmail() },
  { re: /uuid|guid/i,                                                            fn: () => generateUuid() },
  { re: /(^|_)id$/i,                                                             fn: () => generateUuid() },
  { re: /phone|mobile|cell|tel(?!l)/i,                                           fn: () => generatePhone() },
  { re: /firstname|first_name|lastname|last_name|fullname|full_name|^name$|username/i, fn: () => generateName() },
  { re: /url|website|homepage|link/i,                                            fn: () => generateUrl() },
  { re: /datetime|timestamp/i,                                                   fn: () => generateDatetime() },
  { re: /date|dob|birth/i,                                                       fn: () => generateDate() },
  { re: /colou?r|hex/i,                                                          fn: () => generateHexColor() },
  { re: /country/i,                                                              fn: () => generateCountry() },
  { re: /city|town/i,                                                            fn: () => generateCity() },
  { re: /address|street/i,                                                       fn: () => generateAddress() },
  { re: /zip|postal/i,                                                           fn: () => generateZipcode() },
  { re: /company|organi[sz]ation|employer/i,                                     fn: () => generateCompany() },
  { re: /job|title|position|role/i,                                              fn: () => generateJob() },
  { re: /ip(v4|v6)?$|ipaddress/i,                                                fn: () => generateIp() },
  { re: /description|bio|summary/i,                                              fn: () => generateParagraph() },
];

function keyHeuristic(key) {
  for (const r of KEY_RULES) if (r.re.test(key)) return r.fn;
  return null;
}

const FORMAT_MAP = {
  uuid:            () => generateUuid(),
  email:           () => generateEmail(),
  'idn-email':     () => generateEmail(),
  uri:             () => generateUrl(),
  url:             () => generateUrl(),
  'uri-reference': () => generateUrl(),
  date:            () => generateDate(),
  'date-time':     () => generateDatetime({ include_date: true, include_time: true, include_timezone: true }),
  time:            () => generateDatetime({ include_date: false, include_time: true }),
  ipv4:            () => generateIp({ version: 'ipv4' }),
  ipv6:            () => generateIp({ version: 'ipv6' }),
  hostname:        () => `host-${randInt(1, 9999)}.example.com`,
  'idn-hostname':  () => `host-${randInt(1, 9999)}.example.com`,
};

// ── Lenient JSON parse ────────────────────────────────────────────────────
// Accepts strict JSON. Falls back to a few conservative repairs:
//   1. Strip // line and /* block */ comments outside strings
//   2. Convert single-quoted strings → double-quoted (outside double strings)
//   3. Quote unquoted identifier-style object keys
//   4. Remove trailing commas before } or ]
function tryParseLenient(input) {
  try { return { value: JSON.parse(input), fixed: false }; }
  catch (origErr) {
    try {
      const fixed = repairJson(input);
      return { value: JSON.parse(fixed), fixed: true };
    } catch {
      return { error: origErr };
    }
  }
}

function repairJson(src) {
  // Walk char-by-char; transformations only apply outside string literals.
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    // Comments
    if (c === '/' && src[i + 1] === '/') {
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    // Double-quoted string: copy verbatim
    if (c === '"') {
      out += c; i++;
      while (i < n) {
        const k = src[i];
        out += k;
        i++;
        if (k === '\\' && i < n) { out += src[i]; i++; continue; }
        if (k === '"') break;
      }
      continue;
    }
    // Single-quoted string: convert to double
    if (c === "'") {
      let buf = '';
      i++;
      while (i < n) {
        const k = src[i];
        if (k === '\\' && i + 1 < n) { buf += k + src[i + 1]; i += 2; continue; }
        if (k === "'") { i++; break; }
        if (k === '"') buf += '\\"';
        else buf += k;
        i++;
      }
      out += `"${buf}"`;
      continue;
    }
    out += c;
    i++;
  }
  // Quote unquoted keys: { foo: → { "foo": (and after a comma)
  out = out.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)/g, '$1"$2"$3');
  // Strip trailing commas before } or ]
  out = out.replace(/,(\s*[}\]])/g, '$1');
  return out;
}

// ── Public entry ──────────────────────────────────────────────────────────
export function generateJsonSchema({ schema = '', pretty = true } = {}) {
  if (typeof schema !== 'string' || !schema.trim()) {
    return JSON.stringify({ error: 'Schema input is empty.' });
  }
  const parsed = tryParseLenient(schema);
  if (parsed.error) {
    return JSON.stringify({
      error: 'Invalid JSON: ' + parsed.error.message,
      hint:  'Auto-fix attempted but could not recover. Check for unbalanced braces or quotes.',
    });
  }
  const ctx = { root: parsed.value, depth: 0 };
  const isSchema = looksLikeSchema(parsed.value);
  const value = isSchema
    ? buildFromSchema(parsed.value, ctx, '')
    : buildFromExample(parsed.value, ctx, '');
  return pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value);
}

function looksLikeSchema(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
  // Strong signals: distinctive JSON-Schema keys
  const strong = ['$schema', '$ref', 'properties', 'oneOf', 'anyOf', 'allOf',
                  'definitions', '$defs', 'enum', 'const'];
  if (strong.some(k => k in o)) return true;
  // `type` only counts when its value is a valid JSON-Schema type name
  const validTypes = new Set(['string','number','integer','boolean','null','array','object']);
  const t = o.type;
  if (typeof t === 'string' && validTypes.has(t)) return true;
  if (Array.isArray(t) && t.every(x => typeof x === 'string' && validTypes.has(x))) return true;
  return false;
}

// ── SCHEMA walker ─────────────────────────────────────────────────────────
function buildFromSchema(node, ctx, key) {
  if (!node || typeof node !== 'object') return null;
  if (++ctx.depth > MAX_DEPTH) { ctx.depth--; return null; }

  let out;
  try {
    if (node.$ref) {
      const target = resolveRef(node.$ref, ctx.root);
      out = target ? buildFromSchema(target, ctx, key) : null;
    } else if ('const' in node) {
      out = node.const;
    } else if (Array.isArray(node.enum) && node.enum.length) {
      out = choice(node.enum);
    } else if (Array.isArray(node.oneOf) && node.oneOf.length) {
      out = buildFromSchema(node.oneOf[0], ctx, key);
    } else if (Array.isArray(node.anyOf) && node.anyOf.length) {
      out = buildFromSchema(node.anyOf[0], ctx, key);
    } else if (Array.isArray(node.allOf) && node.allOf.length) {
      const merged = Object.assign({}, ...node.allOf, node);
      delete merged.allOf;
      out = buildFromSchema(merged, ctx, key);
    } else {
      let type = node.type;
      if (Array.isArray(type)) type = type.find(t => t !== 'null') ?? type[0];
      if (!type) {
        if (node.properties || node.additionalProperties) type = 'object';
        else if (node.items) type = 'array';
        else type = 'string';
      }
      switch (type) {
        case 'null':    out = null; break;
        case 'boolean': out = Math.random() < 0.5; break;
        case 'integer': out = buildNumber(node, true); break;
        case 'number':  out = buildNumber(node, false); break;
        case 'string':  out = buildString(node, key); break;
        case 'array':   out = buildArray(node, ctx, key); break;
        case 'object':  out = buildObject(node, ctx); break;
        default:        out = null;
      }
    }
  } finally {
    ctx.depth--;
  }
  return out;
}

function buildNumber(node, asInt) {
  let min = typeof node.minimum === 'number' ? node.minimum : 0;
  let max = typeof node.maximum === 'number' ? node.maximum : 1000;
  if (typeof node.exclusiveMinimum === 'number') min = node.exclusiveMinimum + (asInt ? 1 : 0.0001);
  if (typeof node.exclusiveMaximum === 'number') max = node.exclusiveMaximum - (asInt ? 1 : 0.0001);
  if (max < min) max = min;
  if (asInt) return randInt(Math.ceil(min), Math.floor(max));
  return +(Math.random() * (max - min) + min).toFixed(4);
}

function buildString(node, key) {
  if (node.format && FORMAT_MAP[node.format]) return String(FORMAT_MAP[node.format]());
  if (node.pattern) return patternToString(node.minLength, node.maxLength);
  const h = keyHeuristic(key);
  if (h) return String(h());
  const lo = typeof node.minLength === 'number' ? node.minLength : 4;
  const hi = typeof node.maxLength === 'number' ? node.maxLength : Math.max(lo + 8, 24);
  let s = generateSentence({ grammatically_valid: false }).replace(/[.?!]/g, '');
  while (s.length < lo) s += ' ' + generateSentence({ grammatically_valid: false }).replace(/[.?!]/g, '');
  return s.slice(0, Math.max(lo, Math.min(hi, s.length)));
}

function buildArray(node, ctx, key) {
  const lo = Math.max(0, node.minItems ?? 1);
  const hi = Math.min(20, node.maxItems ?? Math.max(lo + 2, 3));
  const itemSchema = node.items ?? { type: 'string' };
  if (Array.isArray(itemSchema)) {
    return itemSchema.map(s => buildFromSchema(s, ctx, key));
  }
  const n = randInt(lo, hi);
  return Array.from({ length: n }, () => buildFromSchema(itemSchema, ctx, key));
}

function buildObject(node, ctx) {
  const out = {};
  const props = node.properties ?? {};
  for (const [pname, pschema] of Object.entries(props)) {
    out[pname] = buildFromSchema(pschema, ctx, pname);
  }
  for (const r of node.required ?? []) {
    if (!(r in out)) out[r] = null;
  }
  return out;
}

function resolveRef(ref, root) {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return null;
  const parts = ref.slice(2).split('/').map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'));
  let cur = root;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return null;
  }
  return cur;
}

function patternToString(minLen = 4, maxLen = 16) {
  const lo = typeof minLen === 'number' ? minLen : 4;
  const hi = typeof maxLen === 'number' ? Math.max(lo, maxLen) : Math.max(lo, 16);
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const len = randInt(lo, hi);
  let s = '';
  for (let i = 0; i < len; i++) s += alphabet[randInt(0, alphabet.length - 1)];
  return s;
}

// ── EXAMPLE walker ────────────────────────────────────────────────────────
function buildFromExample(node, ctx, key) {
  if (++ctx.depth > MAX_DEPTH) { ctx.depth--; return null; }
  let out;
  try {
    if (node === null) {
      out = null;
    } else if (Array.isArray(node)) {
      const seed = node.length ? node[0] : 'lorem';
      const len = Math.max(1, node.length);
      out = Array.from({ length: len }, () => buildFromExample(seed, ctx, key));
    } else if (typeof node === 'object') {
      out = {};
      for (const [k, v] of Object.entries(node)) out[k] = buildFromExample(v, ctx, k);
    } else if (typeof node === 'string') {
      const h = keyHeuristic(key);
      out = h ? String(h()) : generateSentence({ grammatically_valid: false });
    } else if (typeof node === 'number') {
      out = Number.isInteger(node) ? randInt(0, 10000) : +(Math.random() * 1000).toFixed(2);
    } else if (typeof node === 'boolean') {
      out = Math.random() < 0.5;
    } else {
      out = node;
    }
  } finally {
    ctx.depth--;
  }
  return out;
}

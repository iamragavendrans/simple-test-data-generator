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
import { generateUuid, generatePassword, generateUsername } from './identifiers.js';
import {
  generateName, generateEmail, generatePhone, generateAddress,
  generateCity, generateCountry, generateZipcode,
} from './contact.js';
import { generateIp, generateUrl } from './network.js';
import { generateDatetime, generateSentence, generateParagraph } from './time_text.js';
import { generateHexColor } from './colors.js';
import { generateCompany, generateJob } from './work.js';
import { generateDate, generateHash } from './extras.js';
import { FIRST_NAMES, LAST_NAMES, TEXT_WORDS } from '../data/datasets.js';

const MAX_DEPTH = 12;

// Split a key into lowercase tokens: accessToken → ['access','token'],
// user_first_name → ['user','first','name'], URLParam → ['url','param'].
function tokenizeKey(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-\s]+/g, ' ')
    .toLowerCase()
    .split(' ')
    .filter(Boolean);
}

// Short title-case label (1–3 words from lorem) — for productName, brandName, etc.
function shortLabel(maxWords = 3) {
  const n = randInt(1, maxWords);
  return Array.from({ length: n }, () => {
    const w = choice(TEXT_WORDS);
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

// Lorem string filler that never breaks mid-word
function fillLorem(minLen, maxLen) {
  const lo = typeof minLen === 'number' ? minLen : 0;
  const hi = typeof maxLen === 'number' ? maxLen : Infinity;
  const words = [];
  let len = 0;
  while (true) {
    if (words.length && len >= lo) break;
    const w = choice(TEXT_WORDS);
    const next = len === 0 ? w.length : len + 1 + w.length;
    if (next > hi && words.length) break;
    words.push(w);
    len = next;
  }
  return words.join(' ');
}

// slug-style: lowercase-words-with-dashes
function slugify(n = 3) {
  return Array.from({ length: n }, () => choice(TEXT_WORDS)).join('-').toLowerCase();
}

// Key-name → generator, applied in EXAMPLE mode and as a string fallback in SCHEMA mode.
// Order matters: more specific rules first. Patterns are tested against both the
// full key and the tokenized last word so productName / brand_name / accessToken
// all match cleanly.
const KEY_RULES = [
  // Auth & secrets
  { re: /token|jwt|bearer|secret|^auth$|api[_-]?key|access[_-]?key|client[_-]?(id|secret)|session[_-]?id|csrf|nonce/i,
                                                                                fn: () => generateHash({ algorithm: 'sha256' }) },
  { re: /password|passwd|pwd|passphrase/i,                                       fn: () => generatePassword() },
  { re: /^(api|app|public|private)_?key$|signing[_-]?key/i,                      fn: () => generateHash({ algorithm: 'sha256' }) },

  // Identifiers
  { re: /uuid|guid/i,                                                            fn: () => generateUuid() },
  { re: /(^|_|-)id$|^id$/i,                                                      fn: () => generateUuid() },

  // Communication
  { re: /e?mail/i,                                                               fn: () => generateEmail() },
  { re: /phone|mobile|cell|tel(?!l)/i,                                           fn: () => generatePhone() },
  { re: /url|website|homepage|link|href/i,                                       fn: () => generateUrl() },

  // People names — specific before generic
  { re: /^(first|given)[_-]?name$/i,                                             fn: () => choice(FIRST_NAMES) },
  { re: /^(last|family|sur)[_-]?name$/i,                                         fn: () => choice(LAST_NAMES) },
  { re: /^(full[_-]?name|name)$|username|user[_-]?name|nickname|displayname|display[_-]?name/i, fn: () => generateName() },

  // Places
  { re: /country/i,                                                              fn: () => generateCountry() },
  { re: /city|town/i,                                                            fn: () => generateCity() },
  { re: /address|street/i,                                                       fn: () => generateAddress() },
  { re: /zip|postal/i,                                                           fn: () => generateZipcode() },

  // Time — verbs, plus any *_at / *At suffix (created_at, lastLoginAt, paidAt)
  { re: /datetime|timestamp|(_at$|[a-z]At$)|(created|updated|deleted|modified|expires|expiry|expiration|issued|published|scheduled|started|finished|completed|last_?login)/i,
                                                                                fn: () => generateDatetime() },
  { re: /date|dob|birth/i,                                                       fn: () => generateDate() },

  // Visuals
  { re: /colou?r|hex/i,                                                          fn: () => generateHexColor() },

  // Work
  { re: /company|organi[sz]ation|employer/i,                                     fn: () => generateCompany() },
  { re: /job|title|position|role|occupation/i,                                   fn: () => generateJob() },

  // Networking
  { re: /^ip(v4|v6)?$|ip[_-]?address/i,                                          fn: () => generateIp() },

  // API metadata fields
  { re: /^(status|state)$|order_?status|payment_?status|workflow_?state/i,       fn: () => choice(['PENDING','ACTIVE','SUCCESS','FAILED','CANCELLED']) },
  { re: /^(http_?)?status_?code$|response_?code/i,                               fn: () => choice([200, 201, 204, 400, 401, 403, 404, 422, 500]) },
  { re: /environment|^env$|deploy_?env/i,                                        fn: () => choice(['production','staging','development','test']) },
  { re: /^(query|search|q|search_?term|search_?query)$/i,                        fn: () => fillLorem(3, 20) },
  { re: /file_?name|^filename$/i,                                                fn: () => `${choice(TEXT_WORDS)}-${randInt(100, 999)}.${choice(['pdf','png','jpg','txt','csv','json','docx','zip'])}` },
  { re: /mime_?type|content_?type|^media_?type$/i,                               fn: () => choice(['application/json','application/xml','text/plain','text/html','image/png','image/jpeg','application/pdf','application/octet-stream']) },
  { re: /currency(_code)?|^iso_?currency$/i,                                     fn: () => choice(['USD','EUR','GBP','JPY','INR','CAD','AUD','CHF','CNY','BRL']) },
  { re: /locale|language(_code)?|^lang$/i,                                       fn: () => choice(['en-US','en-GB','fr-FR','de-DE','es-ES','pt-BR','ja-JP','zh-CN','hi-IN','ar-SA']) },
  { re: /timezone|tz(_name)?$/i,                                                 fn: () => choice(['UTC','America/New_York','America/Los_Angeles','Europe/London','Europe/Berlin','Asia/Tokyo','Asia/Kolkata','Australia/Sydney']) },
  { re: /gender|^sex$/i,                                                         fn: () => choice(['male','female','other','prefer_not_to_say']) },
  { re: /(^|_)state$/i,                                                          fn: () => choice(['CA','NY','TX','FL','IL','PA','OH','GA','NC','MI']) },
  { re: /version$|^semver$/i,                                                    fn: () => `${randInt(0, 5)}.${randInt(0, 20)}.${randInt(0, 50)}` },
  { re: /tags?$|labels?$|categor(y|ies)/i,                                       fn: () => choice(['featured','sale','new','popular','limited','exclusive','trending']) },

  // Long text — narrow, sentence-sized → single sentence; full bio → paragraph
  { re: /^(bio|biography|about)$|description_long/i,                             fn: () => generateParagraph({ min_sentences: 2, max_sentences: 4 }) },
  { re: /description|summary|comment|note|message|body|content|caption|tagline|headline|excerpt/i,
                                                                                fn: () => generateSentence() },

  // Slugs & handles
  { re: /^slug$|^handle$|^path$|permalink/i,                                     fn: () => slugify(randInt(2, 4)) },

  // Catch-all for product/brand/category/team/etc. → short Title-Case label
  { re: /name$/i,                                                                fn: () => shortLabel(3) },
];

// Test rules against the whole key first, then against the last camelCase / snake_case
// token (catches productName → "name", access_token → "token", etc.)
function keyHeuristic(key) {
  if (!key) return null;
  for (const r of KEY_RULES) if (r.re.test(key)) return r.fn;
  const tokens = tokenizeKey(key);
  if (!tokens.length) return null;
  const last = tokens[tokens.length - 1];
  const tail = tokens.slice(-2).join('');           // accesstoken, productname
  for (const r of KEY_RULES) if (r.re.test(last) || r.re.test(tail)) return r.fn;
  return null;
}

// Categorical numeric keys — return one literal from a fixed set (HTTP codes, etc.)
function numberCategorical(key) {
  if (!key) return null;
  const k = key.toLowerCase();
  if (/^(http_?)?status_?code$|response_?code/.test(k)) return choice([200, 201, 204, 400, 401, 403, 404, 422, 500]);
  return null;
}

// Numeric-key heuristic — only applied when the schema says number/integer.
// Returns {min,max,asInt,decimals} hint or null.
function numberHeuristic(key) {
  if (!key) return null;
  const k = key.toLowerCase();
  if (/^(lat|latitude)$/.test(k))                              return { min: -90,  max: 90,  asInt: false, decimals: 6 };
  if (/^(lng|lon|long|longitude)$/.test(k))                    return { min: -180, max: 180, asInt: false, decimals: 6 };
  if (/(price|cost|fee|salary|revenue|balance|amount|total)/.test(k))
                                                                return { min: 0,    max: 10000, asInt: false, decimals: 2 };
  if (/(count|qty|quantity|^num[_-]?|_num$|^number_of)/.test(k))
                                                                return { min: 0,    max: 100,   asInt: true };
  if (/(age|years|months|days)/.test(k))                       return { min: 0,    max: 120,   asInt: true };
  if (/(percent|percentage|^pct$|ratio)/.test(k))              return { min: 0,    max: 100,   asInt: false, decimals: 2 };
  if (/^expires_?in$|^ttl$|max_?age/.test(k))                  return { min: 60,   max: 86400, asInt: true };
  if (/(rating|stars?)$/.test(k))                              return { min: 1,    max: 5,     asInt: false, decimals: 1 };
  if (/(score|confidence|probability)/.test(k))                return { min: 0,    max: 1,     asInt: false, decimals: 4 };
  if (/^gpa$/.test(k))                                         return { min: 0,    max: 4,     asInt: false, decimals: 2 };
  if (/^page(_?(num(ber)?|no|index))?$|^pageno$/.test(k))      return { min: 1,    max: 100,   asInt: true };
  if (/^otp$|^pin$|verification_?code|one_?time/.test(k))      return { min: 100000, max: 999999, asInt: true };
  if (/^stock$|^inventory$|in_?stock/.test(k))                 return { min: 0,    max: 1000,  asInt: true };
  if (/^retry|attempts?$/.test(k))                             return { min: 0,    max: 10,    asInt: true };
  if (/duration|^elapsed/.test(k))                             return { min: 1,    max: 3600,  asInt: true };
  if (/(voltage|volts?)$/.test(k))                             return { min: 0,    max: 240,   asInt: false, decimals: 1 };
  if (/(temperature|temp_c|celsius)/.test(k))                  return { min: -20,  max: 50,    asInt: false, decimals: 1 };
  if (/(humidity|^moisture$)/.test(k))                         return { min: 0,    max: 100,   asInt: false, decimals: 1 };
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
  password:        () => generatePassword(),
  // OpenAPI 3 "binary" = file contents; emit short base64 placeholder
  binary:          () => btoa(`bin-${randInt(1000,9999)}-${choice(TEXT_WORDS)}`),
  byte:            () => btoa(`bin-${randInt(1000,9999)}-${choice(TEXT_WORDS)}`),
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
    // User-supplied ground truth wins over generated data
    if ('example' in node)  { out = node.example;  return out; }
    if (Array.isArray(node.examples) && node.examples.length) { out = choice(node.examples); return out; }
    if ('default' in node && Math.random() < 0.5) { out = node.default; return out; }

    if (node.$ref) {
      const target = resolveRef(node.$ref, ctx.root);
      out = target ? buildFromSchema(target, ctx, key) : null;
    } else if ('const' in node) {
      out = node.const;
    } else if (Array.isArray(node.enum) && node.enum.length) {
      out = choice(node.enum);
    } else if (Array.isArray(node.oneOf) && node.oneOf.length) {
      out = buildFromSchema(choice(node.oneOf), ctx, key);
    } else if (Array.isArray(node.anyOf) && node.anyOf.length) {
      out = buildFromSchema(choice(node.anyOf), ctx, key);
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
        case 'integer': out = buildNumber(node, true,  key); break;
        case 'number':  out = buildNumber(node, false, key); break;
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

function buildNumber(node, asInt, key) {
  // Categorical first (HTTP status etc.) — only when caller didn't set explicit bounds
  if (node.minimum === undefined && node.maximum === undefined) {
    const cat = numberCategorical(key);
    if (cat !== null) return cat;
  }
  const hint = numberHeuristic(key);
  let min = typeof node.minimum === 'number' ? node.minimum : (hint ? hint.min : 0);
  let max = typeof node.maximum === 'number' ? node.maximum : (hint ? hint.max : 1000);
  if (typeof node.exclusiveMinimum === 'number') min = node.exclusiveMinimum + (asInt ? 1 : 0.0001);
  if (typeof node.exclusiveMaximum === 'number') max = node.exclusiveMaximum - (asInt ? 1 : 0.0001);
  if (max < min) max = min;
  let v;
  if (asInt) v = randInt(Math.ceil(min), Math.floor(max));
  else {
    const dp = hint && typeof hint.decimals === 'number' ? hint.decimals : 4;
    v = +(Math.random() * (max - min) + min).toFixed(dp);
  }
  // multipleOf — snap to the nearest valid multiple inside [min,max]
  if (typeof node.multipleOf === 'number' && node.multipleOf > 0) {
    v = Math.round(v / node.multipleOf) * node.multipleOf;
    if (v < min) v += node.multipleOf;
    if (v > max) v -= node.multipleOf;
    if (!asInt) v = +v.toFixed(6);
  }
  return v;
}

function buildString(node, key) {
  if (node.format && FORMAT_MAP[node.format]) return String(FORMAT_MAP[node.format]());
  if (node.pattern) return patternToString(node.minLength, node.maxLength);
  const h = keyHeuristic(key);
  if (h) {
    const out = String(h());
    // Respect explicit maxLength if heuristic output is too long
    if (typeof node.maxLength === 'number' && out.length > node.maxLength) {
      return out.slice(0, node.maxLength);
    }
    return out;
  }
  const lo = typeof node.minLength === 'number' ? node.minLength : 8;
  const hi = typeof node.maxLength === 'number' ? node.maxLength : Math.max(lo + 16, 40);
  return fillLorem(lo, hi);
}

function buildArray(node, ctx, key) {
  const lo = Math.max(0, node.minItems ?? 1);
  const hi = Math.min(20, node.maxItems ?? Math.max(lo + 2, 3));
  const itemSchema = node.items ?? { type: 'string' };
  if (Array.isArray(itemSchema)) {
    return itemSchema.map(s => buildFromSchema(s, ctx, key));
  }
  const n = randInt(lo, hi);
  const arr = Array.from({ length: n }, () => buildFromSchema(itemSchema, ctx, key));
  if (node.uniqueItems) return dedupeArray(arr, () => buildFromSchema(itemSchema, ctx, key), lo);
  return arr;
}

function dedupeArray(arr, gen, lo) {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    const k = JSON.stringify(v);
    if (!seen.has(k)) { seen.add(k); out.push(v); }
  }
  // Top up if we lost items below the minimum
  let guard = 0;
  while (out.length < lo && guard++ < 20) {
    const v = gen();
    const k = JSON.stringify(v);
    if (!seen.has(k)) { seen.add(k); out.push(v); }
  }
  return out;
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
  // additionalProperties: {schema}  → synthesize 1-2 extra keys
  // additionalProperties: true      → emit a couple of free-form metadata keys
  const ap = node.additionalProperties;
  if (ap && (typeof ap === 'object' || ap === true)) {
    const extraSchema = typeof ap === 'object' ? ap : { type: 'string' };
    const extras = randInt(1, 2);
    const pool = ['meta', 'extra', 'custom', 'tag', 'info', 'attr'];
    for (let i = 0; i < extras; i++) {
      const name = `${choice(pool)}_${randInt(1, 99)}`;
      if (!(name in out)) out[name] = buildFromSchema(extraSchema, ctx, name);
    }
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
      out = h ? String(h()) : fillLorem(node.length, Math.max(node.length, node.length + 4));
    } else if (typeof node === 'number') {
      const cat = numberCategorical(key);
      if (cat !== null) {
        out = cat;
      } else {
        const hint = numberHeuristic(key);
        if (hint) {
          // Hint dictates int-vs-float (so totalAmount:10.0 still produces a 2-decimal price)
          out = hint.asInt
            ? randInt(Math.ceil(hint.min), Math.floor(hint.max))
            : +(Math.random() * (hint.max - hint.min) + hint.min).toFixed(hint.decimals ?? 2);
        } else {
          const asInt = Number.isInteger(node);
          out = asInt ? randInt(0, 10000) : +(Math.random() * 1000).toFixed(2);
        }
      }
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

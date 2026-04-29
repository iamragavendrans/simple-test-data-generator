/**
 * generators/contact.js
 * Name, Email, Phone, Address, Country, City, ZIP Code
 */

import { randInt, choice } from '../utils.js';
import {
  COUNTRIES, FIRST_NAMES, LAST_NAMES, EMAIL_NAMES,
  COUNTRIES_LIST, CITIES_BY_COUNTRY, CITIES_ALL,
  STREETS_BY_COUNTRY,
} from '../data/datasets.js';

export function generateName({ starts_with = '', ends_with = '' } = {}) {
  const candidates = [];

  if (starts_with) {
    const sw = starts_with.trim().toUpperCase();
    FIRST_NAMES.filter(f => f.toUpperCase().startsWith(sw))
      .forEach(f => candidates.push(`${f} ${choice(LAST_NAMES)}`));
    LAST_NAMES.filter(l => l.toUpperCase().startsWith(sw))
      .forEach(l => candidates.push(`${choice(FIRST_NAMES)} ${l}`));
  }
  if (ends_with) {
    const ew = ends_with.trim().toUpperCase();
    FIRST_NAMES.filter(f => f.toUpperCase().endsWith(ew))
      .forEach(f => candidates.push(`${f} ${choice(LAST_NAMES)}`));
    LAST_NAMES.filter(l => l.toUpperCase().endsWith(ew))
      .forEach(l => candidates.push(`${choice(FIRST_NAMES)} ${l}`));
  }

  return candidates.length
    ? choice(candidates)
    : `${choice(FIRST_NAMES)} ${choice(LAST_NAMES)}`;
}

export function generateEmail({ domain = '', extension = 'com' } = {}) {
  // Ensure extension has a dot prefix
  const ext = extension
    ? (extension.startsWith('.') ? extension : '.' + extension)
    : '.com';

  const localPart = choice(EMAIL_NAMES) + randInt(1, 999);

  if (domain && ext) return `${localPart}@${domain}${ext}`;
  if (domain)        return `${localPart}@${domain}`;
  if (ext)           return `${localPart}@example${ext}`;
  return `${localPart}@${choice(['gmail.com','yahoo.com','outlook.com'])}`;
}

export function generatePhone({ country = 'US', include_code = true } = {}) {
  const c    = COUNTRIES[country] ?? COUNTRIES.US;
  const code = c.code;

  let num;
  if (country === 'US' || country === 'CA') {
    num = `(${randInt(200,999)}) ${randInt(200,999)}-${String(randInt(1000,9999))}`;
  } else if (country === 'IN') {
    num = String(randInt(7000000000, 9999999999));
  } else if (country === 'GB') {
    num = `${randInt(20,99)} ${randInt(1000,9999)} ${randInt(100,999)}`;
  } else {
    num = String(randInt(100000000, 999999999));
  }
  return include_code ? `${code} ${num}` : num;
}

// COUNTRIES uses 'GB' for the UK while the address/city/street tables use 'UK'.
// Normalize so any selector reaches the right dataset.
function normalizeCountry(c) {
  if (!c) return '';
  return c === 'GB' ? 'UK' : c;
}

export function generateAddress({ country = 'US' } = {}) {
  const c         = normalizeCountry(country);
  const streetNum = randInt(1, 9999);
  const streets   = STREETS_BY_COUNTRY[c] ?? STREETS_BY_COUNTRY.US;
  const cities    = CITIES_BY_COUNTRY[c]  ?? CITIES_BY_COUNTRY.US;

  const street = choice(streets);
  const city   = choice(cities.filter(Boolean));

  switch (c) {
    case 'US': {
      const states   = ['CA','NY','TX','FL','IL','PA','OH','GA','NC','MI'];
      return `${streetNum} ${street}, ${city}, ${choice(states)} ${randInt(10000,99999)}`;
    }
    case 'UK': {
      const pc = choice(['SW1A','EC1A','W1A','M1','B1','EH1','G1','L1','BS1','LS1']);
      return `${randInt(1,200)} ${street}, ${city}, ${pc}`;
    }
    case 'DE': return `${randInt(1,200)} ${street}, ${city}, ${randInt(10000,99999)}`;
    case 'FR': return `${randInt(1,200)} ${street}, ${city}, ${randInt(10000,99999)}`;
    case 'IN': return `${streetNum} ${street}, ${city} - ${randInt(100000,999999)}`;
    case 'AU': return `${randInt(1,999)} ${street}, ${city} ${randInt(1000,9999)}`;
    case 'CA': {
      const lets = 'ABCDEFGHJKLMNPRSTUVWXY';
      const postal = `${choice([...'MVHKLN'])}${randInt(1,9)}${choice([...lets])}${randInt(1,9)}${choice([...lets])}${randInt(1,9)}`;
      return `${randInt(1,999)} ${street}, ${city}, ${postal}`;
    }
    case 'JP': return `${randInt(1,999)}-${randInt(1,99)} ${street}, ${city}, ${randInt(100,999)}`;
    case 'BR': return `${streetNum} ${street}, ${city} - ${randInt(10000,99999)}-${randInt(100,999)}`;
    case 'IT': return `${randInt(1,200)} ${street}, ${city}, ${randInt(10000,99999)}`;
    case 'ES': return `${randInt(1,200)} ${street}, ${city}, ${randInt(10000,52999)}`;
    case 'MX': return `${streetNum} ${street}, ${city}, CP ${randInt(10000,99999)}`;
    case 'CN': return `${randInt(1,999)} ${street}, ${city}, ${randInt(100000,999999)}`;
    case 'RU': return `${randInt(1,200)} ${street}, ${city}, ${randInt(100000,999999)}`;
    case 'NL': return `${randInt(1,200)} ${street}, ${city}, ${randInt(1000,9999)}`;
    case 'SE': return `${randInt(1,200)} ${street}, ${city}, ${randInt(11111,99999)}`;
    case 'SG': return `${randInt(1,999)} ${street}, Singapore ${randInt(100000,999999)}`;
    case 'AE': return `${randInt(1,999)} ${street}, ${city}`;
    case 'ZA': return `${randInt(1,999)} ${street}, ${city}, ${randInt(1000,9999)}`;
    default:   return `${streetNum} ${choice(STREETS_BY_COUNTRY.US)}, ${city ?? 'New York'}, ${randInt(10000,99999)}`;
  }
}

export function generateCountry({ starts_with = '' } = {}) {
  if (starts_with) {
    const sw   = starts_with.trim().toUpperCase();
    const hits = COUNTRIES_LIST.filter(c => c.toUpperCase().startsWith(sw));
    if (hits.length) return choice(hits);
  }
  return choice(COUNTRIES_LIST);
}

export function generateCity({ country = '' } = {}) {
  const c    = normalizeCountry(country);
  const list = (c && CITIES_BY_COUNTRY[c])
    ? CITIES_BY_COUNTRY[c].filter(Boolean)
    : CITIES_ALL.filter(Boolean);
  return choice(list);
}

export function generateZipcode({ country = 'US', from = 10000, to = 99999 } = {}) {
  const c = normalizeCountry(country);
  if (c === 'UK') {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return `${choice([...A])}${choice([...A])}${randInt(1,9)} ${randInt(1,9)}${choice([...A])}${choice([...A])}`;
  }
  if (c === 'CA') {
    const A = 'ABCDEFGHJKLMNPRSTVWXYZ';
    return `${choice([...A])}${randInt(0,9)}${choice([...A])} ${randInt(0,9)}${choice([...A])}${randInt(0,9)}`;
  }
  let lo = parseInt(from, 10) || 10000;
  let hi = parseInt(to,   10) || 99999;
  if (lo > hi) [lo, hi] = [hi, lo];
  return String(randInt(lo, hi)).padStart(5, '0');
}

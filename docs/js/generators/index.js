/**
 * generators/index.js — central dispatcher.
 * @param {string} typeId
 * @param {Object} options — flat options from config panel (includes count)
 * @returns {{ data: string[], message: string }}
 */

import { choice } from '../utils.js';
import { FUN_MESSAGES } from '../data/datasets.js';

import { generateUuid, generatePassword, generateUsername } from './identifiers.js';
import { generateImei, generateMacAddress }                 from './identifiers.js';
import { generateName, generateEmail, generatePhone, generateAddress,
         generateCountry, generateCity, generateZipcode }  from './contact.js';
import { generateCreditCard, generateSsn, generateBarcode, generateIsbn } from './financial.js';
import { generateIp, generateUrl }                         from './network.js';
import { generateDatetime, generateSentence, generateParagraph } from './time_text.js';
import { generateHexColor, generateRgbColor }              from './colors.js';
import { generateCompany, generateJob }                    from './work.js';
import { generateHash, generateCoordinates, generateDate } from './extras.js';

const GENERATORS = {
  // Identifiers & Security
  uuid:        opts => generateUuid(opts),
  password:    opts => generatePassword(opts),
  username:    opts => generateUsername(opts),
  hash:        opts => generateHash(opts),
  // Contact & Identity
  name:        opts => generateName(opts),
  email:       opts => generateEmail(opts),
  phone:       opts => generatePhone(opts),
  address:     opts => generateAddress(opts),
  country:     opts => generateCountry(opts),
  city:        opts => generateCity(opts),
  zipcode:     opts => generateZipcode(opts),
  coordinates: opts => generateCoordinates(opts),
  // Financial & Sensitive
  credit_card: opts => generateCreditCard(opts),
  ssn:         opts => generateSsn(opts),
  barcode:     opts => generateBarcode(opts),
  isbn:        opts => generateIsbn(opts),
  // Network & Web
  ip:          opts => generateIp(opts),
  url:         opts => generateUrl(opts),
  mac_address: opts => generateMacAddress(opts),
  imei:        opts => generateImei(opts),
  // Time & Text
  date:        opts => generateDate(opts),
  datetime:    opts => generateDatetime(opts),
  sentence:    opts => generateSentence(opts),
  paragraph:   opts => generateParagraph(opts),
  // Colors
  hex_color:   opts => generateHexColor(opts),
  rgb_color:   opts => generateRgbColor(opts),
  // Work & Organization
  company:     opts => generateCompany(opts),
  job:         opts => generateJob(opts),
};

export function generate(typeId, options = {}) {
  const fn = GENERATORS[typeId];
  if (!fn) return { data: [], message: '❌ Unknown type: ' + typeId };

  const { count = 10, prefix = '', suffix = '', ...rest } = options;
  const n = Math.max(1, Math.min(1000, parseInt(count, 10) || 10));

  const opts = Object.fromEntries(
    Object.entries({ prefix, suffix, ...rest }).filter(([, v]) => v !== null && v !== undefined && v !== '')
  );

  const data = Array.from({ length: n }, () => fn(opts));
  return { data, message: choice(FUN_MESSAGES) };
}

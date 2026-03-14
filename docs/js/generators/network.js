/**
 * generators/network.js
 * IP Address (IPv4 / IPv6) and URL
 */

import { randInt, choice } from '../utils.js';
import { URL_DOMAINS } from '../data/datasets.js';

export function generateIp({ version = 'ipv4' } = {}) {
  if (version === 'ipv6') {
    return Array.from({ length: 8 }, () => randInt(0, 65535).toString(16)).join(':');
  }
  return `${randInt(1,255)}.${randInt(0,255)}.${randInt(0,255)}.${randInt(0,255)}`;
}

export function generateUrl({ domain = '', extension = 'com', protocol = 'https' } = {}) {
  const dom  = domain || choice(URL_DOMAINS);
  const path = choice(['about', 'products', 'services', 'blog', 'contact', 'docs', 'login']);
  const ext  = extension || 'com';
  const prot = protocol || 'https';
  return `${prot}://${dom}.${ext}/${path}`;
}

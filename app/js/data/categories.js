/**
 * categories.js — v3 taxonomy
 *
 * 7 categories, each with named subgroups shown in the left panel:
 *
 *  🔑 Identifiers & Security  → Tokens (UUID, Hash) · Auth (Password, Username)
 *  👤 Contact & Identity      → Person (Name, Email, Phone) · Location (Address, Country, City, ZIP, Coordinates)
 *  💳 Financial & Sensitive   → Payment (Credit Card) · Identity (SSN) · Publishing (Barcode, ISBN)
 *  🌐 Network & Web           → Internet (IP, URL) · Hardware ID (MAC, IMEI)
 *  🕐 Time & Text             → Date & Time (Date, DateTime) · Content (Sentence, Paragraph)
 *  🎨 Colors                  → Palette (Hex, RGB)
 *  🏢 Work & Organization     → Organization (Company) · Role (Job Title)
 */

import { COUNTRIES } from './datasets.js';

const COUNTRY_SELECT_VALUES = Object.entries(COUNTRIES).map(([k, v]) => [k, `${v.code} - ${v.name}`]);
const COUNTRY_NAME_VALUES   = Object.entries(COUNTRIES).map(([k, v]) => [k, v.name]);

export const CATEGORIES = [
  { id: 'identifiers', name: 'Identifiers & Security', icon: '🔑', order: 1 },
  { id: 'contact',     name: 'Contact & Identity',     icon: '👤', order: 2 },
  { id: 'financial',   name: 'Financial & Sensitive',  icon: '💳', order: 3 },
  { id: 'network',     name: 'Network & Web',          icon: '🌐', order: 4 },
  { id: 'time_text',   name: 'Time & Text',            icon: '🕐', order: 5 },
  { id: 'colors',      name: 'Colors',                 icon: '🎨', order: 6 },
  { id: 'work',        name: 'Work & Organization',    icon: '🏢', order: 7 },
];

export const DATA_TYPES = [

  // ── 🔑 Identifiers & Security ────────────────────────────────────────────
  {
    type: 'uuid', name: 'UUID', icon: '🎲',
    category: 'identifiers', group: 'Tokens',
    supports_prefix_suffix: true, options: [],
  },
  {
    type: 'hash', name: 'Hash', icon: '#️⃣',
    category: 'identifiers', group: 'Tokens',
    supports_prefix_suffix: false,
    options: [
      { key: 'algorithm', label: 'Algorithm', type: 'radio',
        values: [['md5','MD5'],['sha1','SHA-1'],['sha256','SHA-256']], default: 'sha256' },
    ],
  },
  {
    type: 'password', name: 'Password', icon: '🔐',
    category: 'identifiers', group: 'Auth',
    supports_prefix_suffix: false,
    options: [
      { key: 'uppercase', label: 'Uppercase (A–Z)', type: 'checkbox', default: true  },
      { key: 'lowercase', label: 'Lowercase (a–z)', type: 'checkbox', default: true  },
      { key: 'numbers',   label: 'Numbers (0–9)',   type: 'checkbox', default: true  },
      { key: 'special',   label: 'Special (!@#$)',  type: 'checkbox', default: false },
      { key: 'length',    label: 'Length',          type: 'number',   default: 16, min: 4, max: 128 },
    ],
  },
  {
    type: 'username', name: 'Username', icon: '🎮',
    category: 'identifiers', group: 'Auth',
    supports_prefix_suffix: false,
    options: [
      { key: 'prefix', label: 'Prefix', type: 'text', placeholder: 'e.g., user_' },
      { key: 'style',  label: 'Style',  type: 'select',
        values: [['name_year','name + year'],['adj_noun','adjective + noun'],['name_random','name + random'],['mrx','mrx + name']],
        default: 'name_year' },
    ],
  },

  // ── 👤 Contact & Identity ────────────────────────────────────────────────
  {
    type: 'name', name: 'Name', icon: '👤',
    category: 'contact', group: 'Person',
    supports_prefix_suffix: false,
    options: [
      { key: 'starts_with', label: 'Starts with', type: 'text', placeholder: 'Letter or word' },
      { key: 'ends_with',   label: 'Ends with',   type: 'text', placeholder: 'Letter or word' },
    ],
  },
  {
    type: 'email', name: 'Email', icon: '📧',
    category: 'contact', group: 'Person',
    supports_prefix_suffix: false,
    options: [
      { key: 'domain',    label: 'Domain',    type: 'text',   placeholder: 'e.g., example' },
      { key: 'extension', label: 'Extension', type: 'select',
        values: [['com','.com'],['org','.org'],['net','.net'],['io','.io'],['test','.test'],['co','.co']], default: 'com' },
    ],
  },
  {
    type: 'phone', name: 'Phone', icon: '📞',
    category: 'contact', group: 'Person',
    supports_prefix_suffix: false,
    options: [
      { key: 'country',      label: 'Country',             type: 'select',   values: COUNTRY_SELECT_VALUES, default: 'US' },
      { key: 'include_code', label: 'Include country code', type: 'checkbox', default: true },
    ],
  },
  {
    type: 'address', name: 'Address', icon: '🏠',
    category: 'contact', group: 'Location',
    supports_prefix_suffix: false,
    options: [
      { key: 'country', label: 'Country', type: 'select', values: COUNTRY_NAME_VALUES, default: 'US' },
    ],
  },
  {
    type: 'country', name: 'Country', icon: '🌍',
    category: 'contact', group: 'Location',
    supports_prefix_suffix: false,
    options: [
      { key: 'starts_with', label: 'Starts with', type: 'text', placeholder: 'e.g., U' },
    ],
  },
  {
    type: 'city', name: 'City', icon: '🏙️',
    category: 'contact', group: 'Location',
    supports_prefix_suffix: false,
    options: [
      { key: 'country', label: 'Country', type: 'select', values: COUNTRY_NAME_VALUES, default: null },
    ],
  },
  {
    type: 'zipcode', name: 'ZIP Code', icon: '📮',
    category: 'contact', group: 'Location',
    supports_prefix_suffix: false,
    options: [
      { key: 'country', label: 'Country', type: 'select', values: COUNTRY_NAME_VALUES, default: 'US' },
      { key: 'from',    label: 'From',    type: 'number', default: 10000 },
      { key: 'to',      label: 'To',      type: 'number', default: 99999 },
    ],
  },
  {
    type: 'coordinates', name: 'Coordinates', icon: '📍',
    category: 'contact', group: 'Location',
    supports_prefix_suffix: false,
    options: [
      { key: 'precision', label: 'Decimal places', type: 'number', default: 6, min: 1, max: 8 },
    ],
  },

  // ── 💳 Financial & Sensitive ─────────────────────────────────────────────
  {
    type: 'credit_card', name: 'Credit Card', icon: '💳',
    category: 'financial', group: 'Payment',
    supports_prefix_suffix: false,
    options: [
      { key: 'card_type', label: 'Card type', type: 'select',
        values: [['Visa','Visa'],['Mastercard','Mastercard'],['American Express','AmEx'],['Random','Random']], default: 'Random' },
      { key: 'valid', label: 'Validity', type: 'radio',
        values: [['valid','Valid'],['invalid','Invalid']], default: 'valid' },
    ],
  },
  {
    type: 'ssn', name: 'SSN', icon: '🔢',
    category: 'financial', group: 'Identity',
    supports_prefix_suffix: false,
    options: [
      { key: 'country', label: 'Country', type: 'select',
        values: [['US','United States'],['UK','United Kingdom'],['Random','Random']], default: 'US' },
    ],
  },
  {
    type: 'barcode', name: 'Barcode', icon: '📊',
    category: 'financial', group: 'Publishing',
    supports_prefix_suffix: false,
    options: [
      { key: 'numeric_only', label: 'Numeric only', type: 'checkbox', default: true  },
      { key: 'length',       label: 'Length',        type: 'number',   default: 13, min: 8, max: 20 },
    ],
  },
  {
    type: 'isbn', name: 'ISBN', icon: '📚',
    category: 'financial', group: 'Publishing',
    supports_prefix_suffix: false,
    options: [
      { key: 'format', label: 'Format', type: 'radio',
        values: [['isbn10','ISBN-10'],['isbn13','ISBN-13']], default: 'isbn13' },
    ],
  },

  // ── 🌐 Network & Web ─────────────────────────────────────────────────────
  {
    type: 'ip', name: 'IP Address', icon: '🌐',
    category: 'network', group: 'Internet',
    supports_prefix_suffix: false,
    options: [
      { key: 'version', label: 'Version', type: 'radio',
        values: [['ipv4','IPv4'],['ipv6','IPv6']], default: 'ipv4' },
    ],
  },
  {
    type: 'url', name: 'URL', icon: '🔗',
    category: 'network', group: 'Internet',
    supports_prefix_suffix: false,
    options: [
      { key: 'domain',    label: 'Domain',    type: 'text',   placeholder: 'e.g., google' },
      { key: 'extension', label: 'Extension', type: 'select',
        values: [['com','.com'],['net','.net'],['org','.org'],['io','.io'],['test','.test'],['co','.co']], default: 'com' },
      { key: 'protocol',  label: 'Protocol',  type: 'radio',
        values: [['https','https'],['http','http']], default: 'https' },
    ],
  },
  {
    type: 'mac_address', name: 'MAC Address', icon: '🔌',
    category: 'network', group: 'Hardware ID',
    supports_prefix_suffix: false,
    options: [
      { key: 'uppercase', label: 'Uppercase', type: 'checkbox', default: true },
      { key: 'separator', label: 'Separator', type: 'radio',
        values: [[':', ':'], ['-', '–']], default: ':' },
    ],
  },
  {
    type: 'imei', name: 'IMEI', icon: '📱',
    category: 'network', group: 'Hardware ID',
    supports_prefix_suffix: false,
    options: [
      { key: 'brand',          label: 'Manufacturer',       type: 'select',
        values: [
          ['Generic','Generic'],['Apple','Apple'],['Samsung','Samsung'],['Google','Google'],
          ['Huawei','Huawei'],['Xiaomi','Xiaomi'],['OnePlus','OnePlus'],['Sony','Sony'],
          ['LG','LG'],['Motorola','Motorola'],['Nokia','Nokia'],
        ], default: 'Generic' },
      { key: 'valid_checksum', label: 'Valid Luhn checksum', type: 'checkbox', default: true },
    ],
  },

  // ── 🕐 Time & Text ───────────────────────────────────────────────────────
  {
    type: 'date', name: 'Date', icon: '📅',
    category: 'time_text', group: 'Date & Time',
    supports_prefix_suffix: false,
    options: [
      { key: 'from_year', label: 'From year', type: 'number', default: 2000, min: 1900, max: 2100 },
      { key: 'to_year',   label: 'To year',   type: 'number', default: 2030, min: 1900, max: 2100 },
      { key: 'format',    label: 'Format',    type: 'radio',
        values: [['iso','ISO (YYYY-MM-DD)'],['us','US (MM/DD/YYYY)'],['eu','EU (DD/MM/YYYY)']], default: 'iso' },
    ],
  },
  {
    type: 'datetime', name: 'DateTime', icon: '🕐',
    category: 'time_text', group: 'Date & Time',
    supports_prefix_suffix: false,
    options: [
      { key: 'include_date',     label: 'Include date',     type: 'checkbox', default: true  },
      { key: 'include_time',     label: 'Include time',     type: 'checkbox', default: true  },
      { key: 'include_timezone', label: 'Include timezone', type: 'checkbox', default: false },
    ],
  },
  {
    type: 'sentence', name: 'Sentence', icon: '📝',
    category: 'time_text', group: 'Content',
    supports_prefix_suffix: false,
    options: [
      { key: 'grammatically_valid', label: 'Grammatically valid', type: 'checkbox', default: true },
    ],
  },
  {
    type: 'paragraph', name: 'Paragraph', icon: '📖',
    category: 'time_text', group: 'Content',
    supports_prefix_suffix: false,
    options: [
      { key: 'min_sentences', label: 'Min sentences', type: 'number', default: 3, min: 1, max: 10 },
      { key: 'max_sentences', label: 'Max sentences', type: 'number', default: 6, min: 1, max: 20 },
    ],
  },

  // ── 🎨 Colors ────────────────────────────────────────────────────────────
  {
    type: 'hex_color', name: 'Hex Color', icon: '🎨',
    category: 'colors', group: 'Palette',
    supports_prefix_suffix: false,
    options: [
      { key: 'uppercase', label: 'Uppercase hex', type: 'checkbox', default: true },
    ],
  },
  {
    type: 'rgb_color', name: 'RGB Color', icon: '🌈',
    category: 'colors', group: 'Palette',
    supports_prefix_suffix: false,
    options: [
      { key: 'min_value', label: 'Min channel', type: 'number', default: 0,   min: 0, max: 255 },
      { key: 'max_value', label: 'Max channel', type: 'number', default: 255, min: 0, max: 255 },
    ],
  },

  // ── 🏢 Work & Organization ────────────────────────────────────────────────
  {
    type: 'company', name: 'Company', icon: '🏢',
    category: 'work', group: 'Organization',
    supports_prefix_suffix: false,
    options: [
      { key: 'starts_with', label: 'Starts with', type: 'text', placeholder: 'e.g., Tech' },
    ],
  },
  {
    type: 'job', name: 'Job Title', icon: '💼',
    category: 'work', group: 'Role',
    supports_prefix_suffix: false,
    options: [
      { key: 'seniority', label: 'Seniority', type: 'select',
        values: [['any','Any level'],['junior','Junior'],['senior','Senior'],['lead','Lead']], default: 'any' },
    ],
  },
];

export function buildCategoryList() {
  return [...CATEGORIES]
    .sort((a, b) => a.order - b.order)
    .map(cat => ({
      ...cat,
      types: DATA_TYPES
        .filter(t => t.category === cat.id)
        .map(t => ({ type: t.type, name: t.name, icon: t.icon, group: t.group })),
    }));
}

export function getTypeConfig(typeId) {
  return DATA_TYPES.find(t => t.type === typeId) ?? null;
}

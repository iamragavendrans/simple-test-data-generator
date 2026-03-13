/**
 * generators/work.js
 * Company, Job Title
 */

import { choice } from '../utils.js';
import { USERNAME_ADJ, COMPANY_SUFFIXES, JOB_TITLES } from '../data/datasets.js';

export function generateCompany({ starts_with = '' } = {}) {
  const name = choice(USERNAME_ADJ).charAt(0).toUpperCase() + choice(USERNAME_ADJ).slice(1)
    + ' ' + choice(COMPANY_SUFFIXES);

  if (starts_with) {
    const sw = starts_with.trim().toUpperCase();
    if (name.toUpperCase().includes(sw)) return name;
    return starts_with + name;
  }
  return name;
}

export function generateJob({ seniority = 'any' } = {}) {
  if (seniority && seniority !== 'any') {
    const filtered = JOB_TITLES.filter(j => j.toLowerCase().includes(seniority.toLowerCase()));
    if (filtered.length) return choice(filtered);
  }
  return choice(JOB_TITLES);
}

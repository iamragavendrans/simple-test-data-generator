/**
 * ui/tabs.js — render and handle category tabs.
 */

import { getState, setState } from '../store.js';
import { emit } from '../store.js';

/**
 * Render the top-level category tab bar.
 * @param {Function} onSelect — called with catId when user clicks a tab
 */
export function renderTabs(onSelect) {
  const { categories } = getState();
  const container = document.getElementById('topTabs');
  if (!container) return;

  container.innerHTML = categories.map((cat, i) =>
    `<button class="tab-btn${i === 0 ? ' active' : ''}"
       data-cat="${cat.id}"
       type="button"
       aria-selected="${i === 0}"
       role="tab">
       ${cat.icon} ${cat.name}
     </button>`
  ).join('');

  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => onSelect(btn.dataset.cat));
  });
}

/** Mark one tab as active (by catId) */
export function setActiveTab(catId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const active = btn.dataset.cat === catId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active);
  });
}

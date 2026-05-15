/**
 * ui/tabs.js — render and handle category tabs.
 * Renders both the desktop top tab bar and the mobile drawer list,
 * which share the same selection state.
 */

import { getState, setState } from '../store.js';
import { emit } from '../store.js';

/**
 * Render the top-level category tab bar AND the mobile drawer list.
 * @param {Function} onSelect — called with catId when user picks a category
 */
export function renderTabs(onSelect) {
  const { categories } = getState();
  const topTabs = document.getElementById('topTabs');
  const drawerList = document.getElementById('drawerList');

  if (topTabs) {
    topTabs.innerHTML = categories.map((cat, i) =>
      `<button class="tab-btn${i === 0 ? ' active' : ''}"
         data-cat="${cat.id}"
         type="button"
         aria-selected="${i === 0}"
         role="tab">
         ${cat.icon} ${cat.name}
       </button>`
    ).join('');
    topTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => onSelect(btn.dataset.cat));
    });
  }

  if (drawerList) {
    drawerList.innerHTML = categories.map((cat, i) =>
      `<button class="drawer-item${i === 0 ? ' active' : ''}"
         data-cat="${cat.id}"
         type="button"
         aria-selected="${i === 0}"
         role="tab">
         <span class="drawer-icon">${cat.icon}</span>
         <span class="drawer-label">${cat.name}</span>
       </button>`
    ).join('');
    drawerList.querySelectorAll('.drawer-item').forEach(btn => {
      btn.addEventListener('click', () => onSelect(btn.dataset.cat));
    });
  }
}

/** Mark one tab as active (by catId) — keeps top tabs and drawer in sync */
export function setActiveTab(catId) {
  document.querySelectorAll('.tab-btn, .drawer-item').forEach(btn => {
    const active = btn.dataset.cat === catId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active);
  });
}

/**
 * ui/tabs.js — render and handle category tabs.
 * Renders both the desktop top tab bar and the mobile drawer.
 *
 * The drawer is a flat, grouped list of every type under every category —
 * tapping any leaf jumps straight to it (one tap instead of two).
 */

import { getState, setState } from '../store.js';
import { emit } from '../store.js';

/**
 * Render the top-level category tab bar AND the mobile drawer list.
 * @param {Function} onSelectCategory — called with catId when a top tab is clicked
 * @param {Function} onSelectType     — called with typeId when a drawer leaf is tapped
 */
export function renderTabs(onSelectCategory, onSelectType) {
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
      btn.addEventListener('click', () => onSelectCategory(btn.dataset.cat));
    });
  }

  if (drawerList) {
    let html = '';
    for (const cat of categories) {
      html += `<div class="drawer-group" data-cat="${cat.id}">
        <div class="drawer-group-header"><span>${cat.icon}</span><span>${cat.name}</span></div>`;
      for (const type of (cat.types ?? [])) {
        html += `<button class="drawer-item"
          data-type="${type.type}"
          data-cat="${cat.id}"
          type="button"
          role="tab">
          <span class="drawer-icon">${type.icon ?? '•'}</span>
          <span class="drawer-label">${type.name}</span>
        </button>`;
      }
      html += `</div>`;
    }
    drawerList.innerHTML = html;
    drawerList.querySelectorAll('.drawer-item').forEach(btn => {
      btn.addEventListener('click', () => onSelectType(btn.dataset.type));
    });
  }
}

/** Mark the active category in the top tabs and the active type in the drawer. */
export function setActiveTab(catId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const active = btn.dataset.cat === catId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active);
  });
}

/** Highlight the currently selected leaf in the drawer. */
export function setActiveDrawerType(typeId) {
  document.querySelectorAll('.drawer-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === typeId);
  });
}

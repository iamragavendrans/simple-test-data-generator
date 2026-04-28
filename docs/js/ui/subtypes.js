/**
 * ui/subtypes.js — left panel: search box + grouped type list.
 *
 * When no filter is active, types are rendered under their group headers
 * (e.g. "Security", "Profile" inside Identifiers).
 * When filtering, headers are hidden and all matches shown flat.
 */

import { getState } from '../store.js';

export function renderSubtypes(category, onSelect) {
  const container = document.getElementById('subtypes');
  if (!container) return;

  container.innerHTML = `
    <div class="subtype-search-wrap">
      <input type="search" class="subtype-search" id="subtypeSearch"
        placeholder="Search types…" autocomplete="off" aria-label="Filter data types">
    </div>
    <div id="subtypeList"></div>`;

  _renderList(category.types, onSelect, false);

  document.getElementById('subtypeSearch')?.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = q ? category.types.filter(t => t.name.toLowerCase().includes(q)) : category.types;
    _renderList(filtered, onSelect, q.length > 0);
    const { selectedType } = getState();
    if (selectedType) setActiveSubtype(selectedType);
  });
}

/** Render the type buttons, optionally with group section headers */
function _renderList(types, onSelect, flat) {
  const list = document.getElementById('subtypeList');
  if (!list) return;

  if (!types.length) {
    list.innerHTML = `<div class="subtype-empty">No match</div>`;
    return;
  }

  if (flat) {
    // Filtering — plain flat list, no headers
    list.innerHTML = types.map(t => _btnHTML(t)).join('');
  } else {
    // Normal view — group by .group, show section labels
    const grouped = _groupBy(types, t => t.group);
    let html = '';
    let first = true;
    for (const [groupName, items] of grouped) {
      if (!first) html += `<div class="subtype-divider"></div>`;
      html += `<div class="subtype-group-label">${groupName}</div>`;
      html += items.map(t => _btnHTML(t)).join('');
      first = false;
    }
    list.innerHTML = html;
  }

  list.querySelectorAll('.subtype-btn').forEach(btn => {
    btn.addEventListener('click', () => onSelect(btn.dataset.type));
  });
}

function _btnHTML(t) {
  return `<button class="subtype-btn" data-type="${t.type}" type="button">
    <span class="icon">${t.icon}</span>
    <span>${t.name}</span>
  </button>`;
}

/** Group an array into a Map preserving insertion order */
function _groupBy(arr, keyFn) {
  const map = new Map();
  for (const item of arr) {
    const key = keyFn(item) ?? 'Other';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

/** Highlight the active type button */
export function setActiveSubtype(typeId) {
  document.querySelectorAll('.subtype-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === typeId);
  });
}

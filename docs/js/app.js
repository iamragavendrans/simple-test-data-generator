/**
 * app.js — application entry point.
 * No fetch() calls — all data generated locally in-browser.
 * Persists last-visited type via localStorage.
 */

import { getState, setState } from './store.js';
import { buildCategoryList, getTypeConfig } from './data/categories.js';
import { generate } from './generators/index.js';
import { renderTabs, setActiveTab, setActiveDrawerType } from './ui/tabs.js';
import { renderSubtypes, setActiveSubtype } from './ui/subtypes.js';
import { renderConfig }                     from './ui/config.js';
import { renderResults, copyRaw, copyJSON, copyCSV } from './ui/results.js';
import { initTheme } from './ui/theme.js';

const LS_KEY = 'tdg_last_type';

function init() {
  initTheme();
  const categories = buildCategoryList();
  setState({ categories });
  renderTabs(selectCategory, selectTypeFromDrawer);

  document.getElementById('btnCopyRaw')?.addEventListener('click', copyRaw);
  document.getElementById('btnCopyJSON')?.addEventListener('click', copyJSON);
  document.getElementById('btnCopyCSV')?.addEventListener('click', copyCSV);

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runGenerate(); }
    if (e.key === 'Escape') closeDrawer();
  });

  // Mobile drawer
  document.getElementById('hamburgerBtn')?.addEventListener('click', openDrawer);
  document.getElementById('drawerClose')?.addEventListener('click', closeDrawer);
  document.getElementById('drawerBackdrop')?.addEventListener('click', closeDrawer);

  // Floating Generate button (mobile)
  document.getElementById('fabGenerate')?.addEventListener('click', runGenerate);

  const lastType = _loadLastType();
  if (lastType) _restoreType(lastType, categories);
  else if (categories.length) selectCategory(categories[0].id);
}

function openDrawer() {
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (!drawer) return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop?.classList.add('show');
  backdrop?.removeAttribute('hidden');
}

function closeDrawer() {
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop?.classList.remove('show');
}

function selectCategory(catId) {
  const { categories } = getState();
  setState({ selectedCategory: catId });
  setActiveTab(catId);
  const cat = categories.find(c => c.id === catId);
  if (!cat) return;
  renderSubtypes(cat, selectType);
  if (cat.types.length) selectType(cat.types[0].type);
  closeDrawer();
}

function selectType(typeId) {
  const config = getTypeConfig(typeId);
  if (!config) return;
  setState({ selectedType: typeId });
  setActiveSubtype(typeId);
  setActiveDrawerType(typeId);
  // Schema-only minimal layout (hide subtypes, title, count, pretty-print)
  document.querySelector('.app-window')?.classList.toggle('schema-mode', typeId === 'json_schema');
  const { typeConfigs, configs } = getState();
  setState({ typeConfigs: { ...typeConfigs, [typeId]: config } });
  if (!configs[typeId]) {
    const defaults = { count: config.defaultCount ?? 10 };
    (config.options ?? []).forEach(opt => {
      if (opt.default !== undefined && opt.default !== null) defaults[opt.key] = opt.default;
    });
    setState({ configs: { ...configs, [typeId]: defaults } });
  }
  renderConfig(config, runGenerate);
  runGenerate();
  _saveLastType(typeId);
}

// Drawer leaf click — jump to that type, switching category first if needed.
function selectTypeFromDrawer(typeId) {
  const { categories } = getState();
  const cat = categories.find(c => c.types.some(t => t.type === typeId));
  if (!cat) return;
  setState({ selectedCategory: cat.id });
  setActiveTab(cat.id);
  renderSubtypes(cat, selectType);
  selectType(typeId);
  closeDrawer();
}

function runGenerate() {
  const { selectedType, configs } = getState();
  if (!selectedType) return;
  const btn = document.getElementById('genBtn');
  const fab = document.getElementById('fabGenerate');
  const fabIcon = document.getElementById('fabIcon');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-icon">⏳</span> Generating…'; }
  if (fab) fab.disabled = true;
  if (fabIcon) fabIcon.textContent = '⏳';
  requestAnimationFrame(() => {
    const opts = { ...(configs[selectedType] ?? {}), count: configs[selectedType]?.count ?? 10 };
    const { data, message } = generate(selectedType, opts);
    setState({ results: data });
    renderResults(message);
    if (btn) { btn.disabled = false; btn.innerHTML = '<span class="btn-icon">⚡</span> Generate'; }
    if (fab) fab.disabled = false;
    if (fabIcon) fabIcon.textContent = '⚡';
  });
}

function _saveLastType(typeId) { try { localStorage.setItem(LS_KEY, typeId); } catch (_) {} }
function _loadLastType()       { try { return localStorage.getItem(LS_KEY); } catch (_) { return null; } }
function _restoreType(typeId, categories) {
  const cat = categories.find(c => c.types.some(t => t.type === typeId));
  if (!cat) { selectCategory(categories[0]?.id); return; }
  setState({ selectedCategory: cat.id });
  setActiveTab(cat.id);
  renderSubtypes(cat, selectType);
  selectType(typeId);
}

document.addEventListener('DOMContentLoaded', init);

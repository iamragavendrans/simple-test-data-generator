/**
 * app.js — application entry point.
 * No fetch() calls — all data generated locally in-browser.
 * Persists last-visited type via localStorage.
 */

import { getState, setState } from './store.js';
import { buildCategoryList, getTypeConfig } from './data/categories.js';
import { generate } from './generators/index.js';
import { renderTabs, setActiveTab }         from './ui/tabs.js';
import { renderSubtypes, setActiveSubtype } from './ui/subtypes.js';
import { renderConfig }                     from './ui/config.js';
import { renderResults, copyRaw, copyJSON, copyCSV } from './ui/results.js';
import { initTheme } from './ui/theme.js';

const LS_KEY = 'tdg_last_type';

function init() {
  initTheme();
  const categories = buildCategoryList();
  setState({ categories });
  renderTabs(selectCategory);

  document.getElementById('btnCopyRaw')?.addEventListener('click', copyRaw);
  document.getElementById('btnCopyJSON')?.addEventListener('click', copyJSON);
  document.getElementById('btnCopyCSV')?.addEventListener('click', copyCSV);

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runGenerate(); }
  });

  const lastType = _loadLastType();
  if (lastType) _restoreType(lastType, categories);
  else if (categories.length) selectCategory(categories[0].id);
}

function selectCategory(catId) {
  const { categories } = getState();
  setState({ selectedCategory: catId });
  setActiveTab(catId);
  const cat = categories.find(c => c.id === catId);
  if (!cat) return;
  renderSubtypes(cat, selectType);
  if (cat.types.length) selectType(cat.types[0].type);
}

function selectType(typeId) {
  const config = getTypeConfig(typeId);
  if (!config) return;
  setState({ selectedType: typeId });
  setActiveSubtype(typeId);
  const { typeConfigs, configs } = getState();
  setState({ typeConfigs: { ...typeConfigs, [typeId]: config } });
  if (!configs[typeId]) {
    const defaults = { count: 10 };
    (config.options ?? []).forEach(opt => {
      if (opt.default !== undefined && opt.default !== null) defaults[opt.key] = opt.default;
    });
    setState({ configs: { ...configs, [typeId]: defaults } });
  }
  renderConfig(config, runGenerate);
  runGenerate();
  _saveLastType(typeId);
}

function runGenerate() {
  const { selectedType, configs } = getState();
  if (!selectedType) return;
  const btn = document.getElementById('genBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-icon">⏳</span> Generating…'; }
  requestAnimationFrame(() => {
    const opts = { ...(configs[selectedType] ?? {}), count: configs[selectedType]?.count ?? 10 };
    const { data, message } = generate(selectedType, opts);
    setState({ results: data });
    renderResults(message);
    if (btn) { btn.disabled = false; btn.innerHTML = '<span class="btn-icon">⚡</span> Generate'; }
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

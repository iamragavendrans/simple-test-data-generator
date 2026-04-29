/**
 * ui/config.js — right-hand configuration panel.
 *
 * Structure written into #configPanel:
 *   .config-scroll   ← scrollable options area
 *   .config-footer   ← sticky Generate button, always visible
 */

import { getState, setState } from '../store.js';

export function renderConfig(config, onGenerate) {
  const container = document.getElementById('configPanel');
  const titleEl   = document.getElementById('resultsTitle');
  if (!container) return;

  titleEl.innerHTML = `<span>${config.icon}</span><span>${config.name}</span>`;

  const { configs }  = getState();
  const cfg          = configs[config.type] ?? {};
  const checkboxOpts = (config.options ?? []).filter(o => o.type === 'checkbox');
  const otherOpts    = (config.options ?? []).filter(o => o.type !== 'checkbox');

  // ── Scrollable options ────────────────────────────────────────────────────
  let scroll = `<div class="config-scroll">`;
  scroll += `<div class="config-title">${config.icon} ${config.name}</div>`;

  // Count with stepper
  const currentCount = cfg.count ?? 10;
  scroll += `
    <div class="config-section">
      <label class="config-label" for="cfgCount">Count</label>
      <div class="count-row">
        <button class="count-btn" id="countMinus" type="button" aria-label="Decrease">−</button>
        <input type="number" class="config-input count-input" id="cfgCount"
          value="${currentCount}" min="1" max="1000">
        <button class="count-btn" id="countPlus"  type="button" aria-label="Increase">+</button>
      </div>
    </div>`;

  // Prefix / Suffix (UUID only)
  if (config.supports_prefix_suffix) {
    scroll += `
      <div class="config-row">
        <div>
          <label class="config-label" for="cfgPrefix">Prefix</label>
          <input type="text" class="config-input" id="cfgPrefix"
            placeholder="e.g., ID_" maxlength="8" value="${cfg.prefix ?? ''}">
        </div>
        <div>
          <label class="config-label" for="cfgSuffix">Suffix</label>
          <input type="text" class="config-input" id="cfgSuffix"
            placeholder="e.g., _test" maxlength="12" value="${cfg.suffix ?? ''}">
        </div>
      </div>`;
  }

  // Checkboxes
  if (checkboxOpts.length) {
    scroll += '<div class="config-section">';
    checkboxOpts.forEach(opt => {
      const checked = cfg[opt.key] !== undefined ? cfg[opt.key] : opt.default;
      scroll += `
        <label class="checkbox-single">
          <input type="checkbox" id="opt_${opt.key}" ${checked ? 'checked' : ''}>
          <span class="checkbox-mark"></span>
          <span class="checkbox-text">${opt.label}</span>
        </label>`;
    });
    scroll += '</div>';
  }

  // Other options (select / radio / number / text)
  otherOpts.forEach((opt, idx) => {
    if (idx > 0 && opt.type !== 'radio') scroll += '<div style="margin-top:14px"></div>';
    scroll += '<div class="config-section">';

    if (opt.type === 'radio') {
      scroll += `<label class="config-label">${opt.label}</label>
        <div class="radio-group radio-spaced">`;
      opt.values.forEach(([val, label]) => {
        const active = val === (cfg[opt.key] ?? opt.default);
        scroll += `
          <label class="radio-item ${active ? 'active' : ''}" data-opt="${opt.key}" data-val="${val}">
            <input type="radio" name="opt_${opt.key}" value="${val}" ${active ? 'checked' : ''}>
            <span>${label}</span>
          </label>`;
      });
      scroll += '</div>';

    } else if (opt.type === 'select') {
      const current = cfg[opt.key] ?? opt.default ?? '';
      scroll += `<label class="config-label" for="opt_${opt.key}">${opt.label}</label>
        <select class="config-select" id="opt_${opt.key}">`;
      (opt.values ?? []).forEach(([val, label]) => {
        scroll += `<option value="${val}" ${val == current ? 'selected' : ''}>${label}</option>`;
      });
      scroll += '</select>';

    } else if (opt.type === 'number') {
      const val = cfg[opt.key] !== undefined ? cfg[opt.key] : (opt.default ?? 0);
      scroll += `<label class="config-label" for="opt_${opt.key}">${opt.label}</label>
        <input type="number" class="config-input" id="opt_${opt.key}"
          value="${val}" min="${opt.min ?? 0}" max="${opt.max ?? 1000}">`;

    } else {
      const val = cfg[opt.key] ?? '';
      scroll += `<label class="config-label" for="opt_${opt.key}">${opt.label}</label>
        <input type="text" class="config-input" id="opt_${opt.key}"
          placeholder="${opt.placeholder ?? ''}" value="${val}">`;
    }

    scroll += '</div>';
  });

  scroll += '</div>'; // end .config-scroll

  // ── Sticky footer: single Generate button ─────────────────────────────────
  const footer = `
    <div class="config-footer">
      <button class="generate-btn" id="genBtn" type="button">
        <span class="btn-icon">⚡</span> Generate
      </button>
    </div>`;

  container.innerHTML = scroll + footer;

  // ── Wire events ───────────────────────────────────────────────────────────
  const typeId  = config.type;
  const countEl = document.getElementById('cfgCount');

  // Count
  countEl?.addEventListener('input', e => updateConfig(typeId, 'count', parseInt(e.target.value, 10) || 10));
  countEl?.addEventListener('change', () => onGenerate());

  document.getElementById('countMinus')?.addEventListener('click', () => {
    const v = Math.max(1, (parseInt(countEl.value, 10) || 10) - 5);
    countEl.value = v;
    updateConfig(typeId, 'count', v);
    onGenerate();
  });
  document.getElementById('countPlus')?.addEventListener('click', () => {
    const v = Math.min(1000, (parseInt(countEl.value, 10) || 10) + 5);
    countEl.value = v;
    updateConfig(typeId, 'count', v);
    onGenerate();
  });

  // Prefix / Suffix
  document.getElementById('cfgPrefix')?.addEventListener('input', e => {
    updateConfig(typeId, 'prefix', e.target.value); onGenerate();
  });
  document.getElementById('cfgSuffix')?.addEventListener('input', e => {
    updateConfig(typeId, 'suffix', e.target.value); onGenerate();
  });

  // Generate button — on mobile, also scroll the results into view so the
  // user sees the output without manually scrolling past the config panel.
  document.getElementById('genBtn')?.addEventListener('click', () => {
    onGenerate();
    if (window.matchMedia?.('(max-width: 720px)').matches) {
      requestAnimationFrame(() => {
        document.querySelector('.results-panel')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });

  // Checkboxes
  checkboxOpts.forEach(opt => {
    document.getElementById(`opt_${opt.key}`)?.addEventListener('change', e => {
      updateConfig(typeId, opt.key, e.target.checked); onGenerate();
    });
  });

  // Other options
  otherOpts.forEach(opt => {
    if (opt.type === 'radio') {
      container.querySelectorAll(`[data-opt="${opt.key}"]`).forEach(label => {
        label.addEventListener('click', () => {
          const val = label.dataset.val;
          container.querySelectorAll(`[data-opt="${opt.key}"]`).forEach(l => {
            l.classList.toggle('active', l.dataset.val === val);
            l.querySelector('input').checked = l.dataset.val === val;
          });
          updateConfig(typeId, opt.key, val); onGenerate();
        });
      });
    } else {
      const el = document.getElementById(`opt_${opt.key}`);
      if (!el) return;
      el.addEventListener('change', () => {
        const val = opt.type === 'number' ? (parseFloat(el.value) || 0) : el.value;
        updateConfig(typeId, opt.key, val); onGenerate();
      });
    }
  });

  // Enter anywhere in the scroll area → generate
  container.querySelector('.config-scroll')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
      e.preventDefault(); onGenerate();
    }
  });
}

// ── helper ────────────────────────────────────────────────────────────────────
function updateConfig(typeId, key, value) {
  const { configs } = getState();
  setState({ configs: { ...configs, [typeId]: { ...(configs[typeId] ?? {}), [key]: value } } });
}

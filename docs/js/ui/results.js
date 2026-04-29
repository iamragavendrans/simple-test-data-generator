/**
 * ui/results.js — render results list and wire copy/export/download.
 */

import { getState } from '../store.js';
import { showToast } from './toast.js';

/** Render the results list based on current store state */
export function renderResults(message) {
  const { results, selectedType } = getState();
  const container   = document.getElementById('resultsList');
  const exportBtns  = document.getElementById('exportBtns');
  const countBadge  = document.getElementById('resultCount');

  if (!container) return;

  exportBtns.style.display = results.length ? 'flex' : 'none';
  if (countBadge) countBadge.textContent = results.length ? `${results.length} items` : '';

  if (!results.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎲</div>
        <div class="empty-title">No data yet</div>
        <div class="empty-desc">Click <strong>Generate</strong> to create data</div>
      </div>`;
    return;
  }

  container.innerHTML = results.map((v, i) => {
    const s = String(v);
    const isHex = s.startsWith('#');
    const isRgb = s.startsWith('rgb(');
    const isColor = isHex || isRgb;
    const swatch = isColor ? escapeAttr(s) : '';
    return `<div class="result-item" data-value="${encodeURIComponent(s)}" role="button" tabindex="0" aria-label="Copy value ${i + 1}">
      <span class="result-num">#${i + 1}</span>
      ${isColor ? `<div class="color-swatch" style="background:${swatch}" aria-hidden="true"></div>` : ''}
      <span class="result-value">${escapeHtml(s)}</span>
      <span class="copy-hint">⎘ Copy</span>
    </div>`;
  }).join('');

  // Event delegation — one listener on the container
  container.querySelectorAll('.result-item').forEach(item => {
    const handler = () => {
      const val = decodeURIComponent(item.dataset.value);
      copyToClipboard(val, '⎘ Copied!');
    };
    item.addEventListener('click', handler);
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
  });
}

/** Copy raw values (one per line) */
export function copyRaw() {
  const { results } = getState();
  copyToClipboard(results.join('\n'), '📋 Copied raw!');
}

/** Copy as JSON array */
export function copyJSON() {
  const { results, selectedType } = getState();
  const payload = results.map((v, i) => ({ id: i + 1, type: selectedType, value: v }));
  copyToClipboard(JSON.stringify(payload, null, 2), '📋 Copied JSON!');
}

/** Copy as CSV string */
export function copyCSV() {
  const { results, selectedType } = getState();
  const header = 'id,type,value\n';
  const rows   = results.map((v, i) => `${i + 1},${selectedType},"${v.replace(/"/g, '""')}"`).join('\n');
  copyToClipboard(header + rows, '📋 Copied CSV!');
}

/** Download JSON file */
export function downloadJSON() {
  const { results, selectedType } = getState();
  const payload = results.map((v, i) => ({ id: i + 1, type: selectedType, value: v }));
  downloadFile(JSON.stringify(payload, null, 2), `${selectedType}-data.json`, 'application/json');
  showToast('⬇️ Downloading JSON…');
}

/** Download CSV file */
export function downloadCSV() {
  const { results, selectedType } = getState();
  const header = 'id,type,value\n';
  const rows   = results.map((v, i) => `${i + 1},${selectedType},"${v.replace(/"/g, '""')}"`).join('\n');
  downloadFile(header + rows, `${selectedType}-data.csv`, 'text/csv');
  showToast('⬇️ Downloading CSV…');
}

// ── internal helpers ──────────────────────────────────────────────────────────

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function escapeAttr(s) {
  // For inline style values — strip anything that could break out of the attribute
  return s.replace(/["'<>;]/g, '');
}

function copyToClipboard(text, successMsg = '⎘ Copied!') {
  navigator.clipboard.writeText(text)
    .then(() => showToast(successMsg))
    .catch(() => showToast('Copy failed — try manually'));
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

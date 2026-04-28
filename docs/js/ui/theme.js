/**
 * ui/theme.js — theme toggle (Dark, Light, Purple, Midnight).
 * Theme is stored in localStorage and applied via data-theme on <html>.
 * All colour variables are defined in :root per theme in index.html.
 */

const THEMES = [
  { id: 'dark',     label: 'Dark',     icon: '🌙' },
  { id: 'light',    label: 'Light',    icon: '☀️'  },
  { id: 'purple',   label: 'Purple',   icon: '🔮' },
  { id: 'midnight', label: 'Midnight', icon: '🌌' },
];

const LS_KEY = 'tdg_theme';

export function initTheme() {
  const saved = _load();
  _apply(saved);
  _renderButton(saved);
}

function _renderButton(current) {
  const wrap = document.getElementById('themeToggle');
  if (!wrap) return;

  const cur = THEMES.find(t => t.id === current) ?? THEMES[0];

  wrap.innerHTML = `
    <button class="theme-btn" id="themeBtnTrigger" type="button"
      title="Change theme" aria-label="Change theme (current: ${cur.label})">
      <span class="theme-btn-icon">${cur.icon}</span>
      <span class="theme-btn-label">${cur.label}</span>
      <span class="theme-chevron">▾</span>
    </button>
    <div class="theme-menu" id="themeMenu" role="listbox" aria-label="Choose theme">
      ${THEMES.map(t => `
        <button class="theme-option ${t.id === current ? 'active' : ''}"
          data-theme="${t.id}" type="button" role="option"
          aria-selected="${t.id === current}">
          <span>${t.icon}</span>
          <span>${t.label}</span>
          ${t.id === current ? '<span class="theme-tick">✓</span>' : ''}
        </button>`).join('')}
    </div>`;

  const btn  = document.getElementById('themeBtnTrigger');
  const menu = document.getElementById('themeMenu');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('open');
  });

  document.addEventListener('click', () => menu.classList.remove('open'));
  menu.addEventListener('click', e => e.stopPropagation());

  menu.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const chosen = opt.dataset.theme;
      _apply(chosen);
      _save(chosen);
      _renderButton(chosen);
      menu.classList.remove('open');
    });
  });
}

function _apply(themeId) {
  document.documentElement.setAttribute('data-theme', themeId ?? 'dark');
}

function _save(id) { try { localStorage.setItem(LS_KEY, id); } catch (_) {} }
function _load()    { try { return localStorage.getItem(LS_KEY) ?? 'dark'; } catch (_) { return 'dark'; } }

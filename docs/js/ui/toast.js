/**
 * ui/toast.js — show a temporary notification banner.
 */

let _timer = null;
const el = () => document.getElementById('toast');

/**
 * Show a toast message.
 * @param {string} msg
 * @param {number} [duration=2000]
 */
export function showToast(msg, duration = 2000) {
  const t = el();
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_timer);
  _timer = setTimeout(() => t.classList.remove('show'), duration);
}

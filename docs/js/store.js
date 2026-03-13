/**
 * store.js — single source of truth for UI state.
 * Lightweight pub/sub; no external dependencies.
 */

/** @type {{ categories: Array, selectedCategory: string|null, selectedType: string|null, results: string[], configs: Object, typeConfigs: Object }} */
const state = {
  categories:       [],
  selectedCategory: null,
  selectedType:     null,
  results:          [],
  configs:          {},    // { [typeId]: { count, prefix, suffix, ...opts } }
  typeConfigs:      {},    // { [typeId]: full DATA_TYPES entry }
};

/** @type {{ [event: string]: Function[] }} */
const listeners = {};

/** Return a shallow copy of current state */
export const getState = () => ({ ...state });

/**
 * Merge partial updates into state and emit 'change'.
 * @param {Partial<typeof state>} partial
 */
export function setState(partial) {
  Object.assign(state, partial);
  emit('change', state);
}

/**
 * Subscribe to an event.
 * @param {string} event
 * @param {Function} fn
 */
export function on(event, fn) {
  (listeners[event] ??= []).push(fn);
}

/**
 * Emit an event to all subscribers.
 * @param {string} event
 * @param {*} data
 */
export function emit(event, data) {
  (listeners[event] ?? []).forEach(fn => fn(data));
}

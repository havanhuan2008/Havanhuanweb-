// LocalStorage store (frontend-only)
const KEY = "shopacc_state_v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function createDefaultState() {
  return {
    session: {
      userId: null
    },
    users: {
      // userId -> user
      // Demo user auto-create on first login/register
    },
    deposits: [], // {id, userId, type, amount, fee, bonus, time, status, note}
    orders: [] // {id, userId, productId, productTitle, price, time, status}
  };
}

export function ensureState() {
  let state = loadState();
  if (!state) {
    state = createDefaultState();
    saveState(state);
  }
  return state;
}

export function setState(updater) {
  const state = ensureState();
  const next = updater(structuredClone(state));
  saveState(next);
  return next;
}

export function getSessionUser(state) {
  const uid = state.session?.userId;
  if (!uid) return null;
  return state.users?.[uid] || null;
}
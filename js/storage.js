// Capa de persistencia sobre localStorage.
const KEYS = {
  expenses: 'gastos.expenses',
  categories: 'gastos.categories',
  settings: 'gastos.settings',
};

const DEFAULT_CATEGORIES = ['comida', 'transporte', 'servicio', 'arriendo'];
const DEFAULT_SETTINGS = { lang: 'es', theme: 'light', currency: 'COP' };

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('No se pudo leer', key, e);
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('No se pudo guardar', key, e);
    return false;
  }
}

// ---- Settings ----
export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) };
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  write(KEYS.settings, next);
  return next;
}

// ---- Categories ----
export function getCategories() {
  const cats = read(KEYS.categories, null);
  if (!Array.isArray(cats) || cats.length === 0) {
    write(KEYS.categories, DEFAULT_CATEGORIES);
    return [...DEFAULT_CATEGORIES];
  }
  return cats;
}

export function saveCategories(categories) {
  const unique = [...new Set(categories)].sort();
  write(KEYS.categories, unique);
  return unique;
}

// ---- Expenses ----
export function getExpenses() {
  const list = read(KEYS.expenses, []);
  return Array.isArray(list) ? list : [];
}

export function saveExpenses(expenses) {
  write(KEYS.expenses, expenses);
  return expenses;
}

// ---- Backup ----
export function exportData() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    categories: getCategories(),
    expenses: getExpenses(),
  };
}

export function importData(data) {
  if (!data || typeof data !== 'object') throw new Error('invalid');
  if (Array.isArray(data.expenses)) write(KEYS.expenses, data.expenses);
  if (Array.isArray(data.categories) && data.categories.length) {
    saveCategories(data.categories);
  }
  if (data.settings && typeof data.settings === 'object') {
    saveSettings(data.settings);
  }
}

export function clearAll() {
  localStorage.removeItem(KEYS.expenses);
  localStorage.removeItem(KEYS.categories);
  localStorage.removeItem(KEYS.settings);
}

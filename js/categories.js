// Utilidades para categorías anidadas (rutas separadas por punto, p. ej. "casa.aseo").
import { getCategories, saveCategories, getExpenses } from './storage.js';

export const SEP = '.';

// Etiqueta legible: último segmento de la ruta.
export function leafLabel(path) {
  const parts = path.split(SEP);
  return parts[parts.length - 1];
}

// Profundidad (0 = raíz).
export function depth(path) {
  return path.split(SEP).length - 1;
}

// Normaliza un segmento de nombre (sin puntos, sin espacios extremos, minúsculas).
export function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

// Devuelve todas las categorías asegurando que existan los ancestros de cada ruta.
export function getAllCategories() {
  const cats = getCategories();
  const set = new Set(cats);
  for (const path of cats) {
    const parts = path.split(SEP);
    let acc = '';
    for (const part of parts) {
      acc = acc ? acc + SEP + part : part;
      set.add(acc);
    }
  }
  return [...set].sort();
}

// Agrega una categoría hija. Devuelve { ok, path, error }.
export function addCategory(rawName, parent) {
  const name = normalizeName(rawName);
  if (!name) return { ok: false, error: 'cat.errEmpty' };
  if (name.includes(SEP)) return { ok: false, error: 'cat.errDot' };
  const path = parent ? `${parent}${SEP}${name}` : name;
  const existing = getAllCategories();
  if (existing.includes(path)) return { ok: false, error: 'cat.errExists' };
  const next = saveCategories([...getCategories(), path]);
  return { ok: true, path, categories: next };
}

// True si la ruta tiene subcategorías.
export function hasChildren(path, categories = getAllCategories()) {
  return categories.some((c) => c.startsWith(path + SEP));
}

// True si hay gastos asignados exactamente a esa categoría.
export function hasExpenses(path, expenses = getExpenses()) {
  return expenses.some((e) => e.category === path);
}

// Elimina una categoría solo si no tiene hijos ni gastos. Devuelve { ok, error }.
export function deleteCategory(path) {
  if (hasChildren(path)) return { ok: false, error: 'cat.errInUse' };
  if (hasExpenses(path)) return { ok: false, error: 'cat.errInUse' };
  const next = saveCategories(getCategories().filter((c) => c !== path));
  return { ok: true, categories: next };
}

// Construye un árbol anidado a partir de las rutas.
export function buildTree(categories = getAllCategories()) {
  const root = {};
  for (const path of categories) {
    const parts = path.split(SEP);
    let node = root;
    let acc = '';
    for (const part of parts) {
      acc = acc ? acc + SEP + part : part;
      if (!node[part]) node[part] = { __path: acc, children: {} };
      node = node[part].children;
    }
  }
  return root;
}

// Suma de gastos por categoría, propagada a los ancestros (para totales agregados).
export function totalsByCategory(expenses, { rollup = false } = {}) {
  const totals = {};
  for (const e of expenses) {
    const amount = Number(e.amount) || 0;
    if (rollup) {
      const parts = e.category.split(SEP);
      let acc = '';
      for (const part of parts) {
        acc = acc ? acc + SEP + part : part;
        totals[acc] = (totals[acc] || 0) + amount;
      }
    } else {
      totals[e.category] = (totals[e.category] || 0) + amount;
    }
  }
  return totals;
}

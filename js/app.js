import { t, setLang, getLang, applyTranslations } from './i18n.js';
import * as store from './storage.js';
import {
  getAllCategories, addCategory, deleteCategory, buildTree,
  leafLabel, depth, totalsByCategory, SEP,
} from './categories.js';
import { renderCategoryChart, renderTrendChart, refreshChartThemes } from './charts.js';

// ---------- Estado ----------
let settings = store.getSettings();

// ---------- Referencias DOM ----------
const $ = (id) => document.getElementById(id);
const els = {
  form: $('expense-form'),
  id: $('expense-id'),
  amount: $('amount'),
  category: $('category'),
  date: $('date'),
  note: $('note'),
  formTitle: $('form-title'),
  cancelEdit: $('cancel-edit'),
  list: $('expense-list'),
  emptyState: $('empty-state'),
  listTotal: $('list-total'),
  filterMonth: $('filter-month'),
  filterCategory: $('filter-category'),
  filterSearch: $('filter-search'),
  filterClear: $('filter-clear'),
  statMonth: $('stat-month'),
  statCount: $('stat-count'),
  statAvg: $('stat-avg'),
  statTop: $('stat-top'),
  categoryChart: $('category-chart'),
  trendChart: $('trend-chart'),
  langToggle: $('lang-toggle'),
  themeToggle: $('theme-toggle'),
  currencySelect: $('currency-select'),
  exportBtn: $('export-btn'),
  importInput: $('import-input'),
  clearBtn: $('clear-btn'),
  manageCategories: $('manage-categories'),
  categoryModal: $('category-modal'),
  closeCategoryModal: $('close-category-modal'),
  categoryForm: $('category-form'),
  newCatName: $('new-cat-name'),
  newCatParent: $('new-cat-parent'),
  categoryTree: $('category-tree'),
  toast: $('toast'),
};

// ---------- Utilidades ----------
const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2));

const localeFor = () => (getLang() === 'es' ? 'es-CO' : 'en-US');

function formatMoney(value) {
  try {
    return new Intl.NumberFormat(localeFor(), {
      style: 'currency',
      currency: settings.currency || 'COP',
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  } catch (e) {
    return (Number(value) || 0).toFixed(2);
  }
}

const todayISO = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
const monthKey = (isoDate) => (isoDate || '').slice(0, 7); // YYYY-MM
const currentMonth = () => todayISO().slice(0, 7);

function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(localeFor(), { month: 'short', year: '2-digit' });
}

function showToast(key) {
  els.toast.textContent = t(key);
  els.toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => els.toast.classList.remove('show'), 2200);
}

// ---------- Poblado de selects de categorías ----------
function categoryOptionsHtml(includeAll) {
  const cats = getAllCategories();
  let html = includeAll ? `<option value="">${t('filter.all')}</option>` : '';
  for (const path of cats) {
    const indent = '\u00A0\u00A0'.repeat(depth(path));
    html += `<option value="${path}">${indent}${leafLabel(path)}</option>`;
  }
  return html;
}

function populateCategorySelects() {
  const prevForm = els.category.value;
  const prevFilter = els.filterCategory.value;
  els.category.innerHTML = categoryOptionsHtml(false);
  els.filterCategory.innerHTML = categoryOptionsHtml(true);
  if ([...els.category.options].some((o) => o.value === prevForm)) els.category.value = prevForm;
  if ([...els.filterCategory.options].some((o) => o.value === prevFilter)) els.filterCategory.value = prevFilter;

  // Select de padre en el modal.
  const cats = getAllCategories();
  let parentHtml = `<option value="">${t('cat.parentNone')}</option>`;
  for (const path of cats) {
    const indent = '\u00A0\u00A0'.repeat(depth(path));
    parentHtml += `<option value="${path}">${indent}${leafLabel(path)}</option>`;
  }
  els.newCatParent.innerHTML = parentHtml;
}

// ---------- Filtrado ----------
function getFilteredExpenses() {
  const month = els.filterMonth.value;
  const cat = els.filterCategory.value;
  const search = els.filterSearch.value.trim().toLowerCase();
  return store.getExpenses()
    .filter((e) => (month ? monthKey(e.date) === month : true))
    .filter((e) => (cat ? e.category === cat || e.category.startsWith(cat + SEP) : true))
    .filter((e) => (search ? (e.note || '').toLowerCase().includes(search) || e.category.toLowerCase().includes(search) : true))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// ---------- Render de la lista ----------
function renderList() {
  const rows = getFilteredExpenses();
  els.list.innerHTML = '';
  let total = 0;
  for (const e of rows) {
    total += Number(e.amount) || 0;
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-100 dark:border-slate-700/60';
    tr.innerHTML = `
      <td class="py-2 pr-3 whitespace-nowrap">${e.date}</td>
      <td class="py-2 pr-3"><span class="inline-block rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs">${e.category}</span></td>
      <td class="py-2 pr-3 text-slate-500 dark:text-slate-400">${escapeHtml(e.note || '')}</td>
      <td class="py-2 pr-3 text-right whitespace-nowrap">${formatMoney(e.amount)}</td>
      <td class="py-2 text-right whitespace-nowrap">
        <button data-edit="${e.id}" class="text-indigo-600 dark:text-indigo-400 hover:underline mr-2">${t('table.edit')}</button>
        <button data-delete="${e.id}" class="text-red-600 dark:text-red-400 hover:underline">${t('table.delete')}</button>
      </td>`;
    els.list.appendChild(tr);
  }
  els.listTotal.textContent = formatMoney(total);
  els.emptyState.classList.toggle('hidden', rows.length > 0);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- Resumen ----------
function renderSummary() {
  const all = store.getExpenses();
  const month = currentMonth();
  const monthExp = all.filter((e) => monthKey(e.date) === month);
  const monthTotal = monthExp.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  els.statMonth.textContent = formatMoney(monthTotal);
  els.statCount.textContent = String(monthExp.length);

  const daysElapsed = new Date().getDate();
  els.statAvg.textContent = formatMoney(monthExp.length ? monthTotal / daysElapsed : 0);

  const totals = totalsByCategory(monthExp, { rollup: false });
  let topCat = '—';
  let topVal = -1;
  for (const [cat, val] of Object.entries(totals)) {
    if (val > topVal) { topVal = val; topCat = leafLabel(cat); }
  }
  els.statTop.textContent = topVal >= 0 ? topCat : '—';
}

// ---------- Gráficas ----------
function renderCharts() {
  const all = store.getExpenses();
  const month = currentMonth();
  const monthExp = all.filter((e) => monthKey(e.date) === month);

  // Por categoría raíz (primer segmento) para una vista agregada clara.
  const byRoot = {};
  for (const e of monthExp) {
    const root = e.category.split(SEP)[0];
    byRoot[root] = (byRoot[root] || 0) + (Number(e.amount) || 0);
  }
  const catLabels = Object.keys(byRoot);
  const catValues = Object.values(byRoot);
  renderCategoryChart(els.categoryChart, catLabels, catValues, formatMoney);

  // Tendencia últimos 6 meses.
  const keys = [];
  const base = new Date();
  base.setDate(1);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  const trendVals = keys.map((k) => all.filter((e) => monthKey(e.date) === k).reduce((s, e) => s + (Number(e.amount) || 0), 0));
  renderTrendChart(els.trendChart, keys.map(monthLabel), trendVals, formatMoney);
}

// ---------- Árbol de categorías (modal) ----------
function renderCategoryTree() {
  const tree = buildTree();
  els.categoryTree.innerHTML = '';
  const render = (node, container, level) => {
    Object.keys(node).sort().forEach((key) => {
      const item = node[key];
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between rounded-md px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700/60';
      li.style.marginLeft = `${level * 14}px`;
      li.innerHTML = `
        <span>${level > 0 ? '↳ ' : ''}${leafLabel(item.__path)}</span>
        <button data-delcat="${item.__path}" class="text-xs text-red-600 dark:text-red-400 hover:underline">${t('cat.delete')}</button>`;
      els.categoryTree.appendChild(li);
      render(item.children, container, level + 1);
    });
  };
  render(tree, els.categoryTree, 0);
}

// ---------- Validación del formulario ----------
function setError(field, show) {
  const el = document.querySelector(`[data-error="${field}"]`);
  if (el) el.classList.toggle('hidden', !show);
}

function validateForm() {
  const amount = parseFloat(els.amount.value);
  const validAmount = !isNaN(amount) && amount > 0;
  const validCategory = !!els.category.value;
  const validDate = !!els.date.value;
  setError('amount', !validAmount);
  setError('category', !validCategory);
  setError('date', !validDate);
  return validAmount && validCategory && validDate;
}

// ---------- CRUD ----------
function resetForm() {
  els.form.reset();
  els.id.value = '';
  els.date.value = todayISO();
  els.formTitle.textContent = t('form.title');
  els.cancelEdit.classList.add('hidden');
  setError('amount', false);
  setError('category', false);
  setError('date', false);
}

function handleSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;
  const expenses = store.getExpenses();
  const editing = els.id.value;
  const payload = {
    amount: parseFloat(els.amount.value),
    category: els.category.value,
    date: els.date.value,
    note: els.note.value.trim(),
  };
  if (editing) {
    const idx = expenses.findIndex((x) => x.id === editing);
    if (idx >= 0) expenses[idx] = { ...expenses[idx], ...payload };
    store.saveExpenses(expenses);
    showToast('toast.updated');
  } else {
    expenses.push({ id: uid(), ...payload });
    store.saveExpenses(expenses);
    showToast('toast.saved');
  }
  resetForm();
  refreshAll();
}

function startEdit(id) {
  const exp = store.getExpenses().find((x) => x.id === id);
  if (!exp) return;
  els.id.value = exp.id;
  els.amount.value = exp.amount;
  els.category.value = exp.category;
  els.date.value = exp.date;
  els.note.value = exp.note || '';
  els.formTitle.textContent = t('form.titleEdit');
  els.cancelEdit.classList.remove('hidden');
  els.amount.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteExpense(id) {
  if (!confirm(t('confirm.delete'))) return;
  store.saveExpenses(store.getExpenses().filter((x) => x.id !== id));
  showToast('toast.deleted');
  if (els.id.value === id) resetForm();
  refreshAll();
}

// ---------- Categorías ----------
function handleCategorySubmit(e) {
  e.preventDefault();
  const res = addCategory(els.newCatName.value, els.newCatParent.value);
  const errEl = document.querySelector('[data-error="category-name"]');
  if (!res.ok) {
    errEl.textContent = t(res.error);
    errEl.classList.remove('hidden');
    return;
  }
  errEl.classList.add('hidden');
  els.newCatName.value = '';
  populateCategorySelects();
  renderCategoryTree();
  showToast('toast.catAdded');
}

function handleDeleteCategory(path) {
  const res = deleteCategory(path);
  if (!res.ok) { alert(t(res.error)); return; }
  populateCategorySelects();
  renderCategoryTree();
  refreshAll();
  showToast('toast.catDeleted');
}

// ---------- Backup ----------
function handleExport() {
  const data = store.exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gastos-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('toast.exported');
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      store.importData(JSON.parse(reader.result));
      settings = store.getSettings();
      applySettings();
      populateCategorySelects();
      refreshAll();
      showToast('toast.imported');
    } catch (err) {
      showToast('toast.importError');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function handleClear() {
  if (!confirm(t('confirm.clear'))) return;
  store.clearAll();
  settings = store.getSettings();
  applySettings();
  populateCategorySelects();
  resetForm();
  refreshAll();
  showToast('toast.cleared');
}

// ---------- Ajustes (idioma, tema, moneda) ----------
function applySettings() {
  setLang(settings.lang);
  applyTranslations();
  document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  els.themeToggle.textContent = settings.theme === 'dark' ? '☀️' : '🌙';
  els.currencySelect.value = settings.currency;
}

function toggleLang() {
  settings = store.saveSettings({ lang: settings.lang === 'es' ? 'en' : 'es' });
  setLang(settings.lang);
  applyTranslations();
  populateCategorySelects();
  refreshAll();
}

function toggleTheme() {
  settings = store.saveSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  els.themeToggle.textContent = settings.theme === 'dark' ? '☀️' : '🌙';
  refreshChartThemes();
}

function changeCurrency() {
  settings = store.saveSettings({ currency: els.currencySelect.value });
  refreshAll();
}

// ---------- Refresco global ----------
function refreshAll() {
  renderList();
  renderSummary();
  renderCharts();
}

// ---------- Eventos ----------
function bindEvents() {
  els.form.addEventListener('submit', handleSubmit);
  els.cancelEdit.addEventListener('click', resetForm);
  els.list.addEventListener('click', (e) => {
    const editId = e.target.getAttribute('data-edit');
    const delId = e.target.getAttribute('data-delete');
    if (editId) startEdit(editId);
    if (delId) deleteExpense(delId);
  });
  [els.filterMonth, els.filterCategory].forEach((el) => el.addEventListener('change', renderList));
  els.filterSearch.addEventListener('input', renderList);
  els.filterClear.addEventListener('click', () => {
    els.filterMonth.value = '';
    els.filterCategory.value = '';
    els.filterSearch.value = '';
    renderList();
  });

  els.langToggle.addEventListener('click', toggleLang);
  els.themeToggle.addEventListener('click', toggleTheme);
  els.currencySelect.addEventListener('change', changeCurrency);

  els.exportBtn.addEventListener('click', handleExport);
  els.importInput.addEventListener('change', handleImport);
  els.clearBtn.addEventListener('click', handleClear);

  els.manageCategories.addEventListener('click', openCategoryModal);
  els.closeCategoryModal.addEventListener('click', closeCategoryModal);
  els.categoryModal.addEventListener('click', (e) => { if (e.target === els.categoryModal) closeCategoryModal(); });
  els.categoryForm.addEventListener('submit', handleCategorySubmit);
  els.categoryTree.addEventListener('click', (e) => {
    const path = e.target.getAttribute('data-delcat');
    if (path) handleDeleteCategory(path);
  });
}

function openCategoryModal() {
  populateCategorySelects();
  renderCategoryTree();
  els.categoryModal.classList.remove('hidden');
}

function closeCategoryModal() {
  els.categoryModal.classList.add('hidden');
  document.querySelector('[data-error="category-name"]').classList.add('hidden');
}

// ---------- Init ----------
function init() {
  applySettings();
  populateCategorySelects();
  els.date.value = todayISO();
  bindEvents();
  refreshAll();
}

init();

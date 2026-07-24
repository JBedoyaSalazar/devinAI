// Internacionalización nativa: español (por defecto) e inglés.
const dictionaries = {
  es: {
    'app.title': 'Gastos personales',
    'app.footer': 'Los datos se guardan solo en este navegador (localStorage).',
    'summary.month': 'Total del mes',
    'summary.count': 'Movimientos',
    'summary.avg': 'Promedio diario',
    'summary.top': 'Categoría top',
    'form.title': 'Nuevo gasto',
    'form.titleEdit': 'Editar gasto',
    'form.amount': 'Monto',
    'form.category': 'Categoría',
    'form.manageCategories': 'Gestionar',
    'form.date': 'Fecha',
    'form.note': 'Nota (opcional)',
    'form.save': 'Guardar',
    'form.cancel': 'Cancelar',
    'error.amount': 'Ingresa un monto válido.',
    'error.category': 'Selecciona una categoría.',
    'error.date': 'Selecciona una fecha.',
    'data.export': 'Exportar',
    'data.import': 'Importar',
    'data.clear': 'Borrar todo',
    'charts.title': 'Análisis',
    'charts.byCategory': 'Por categoría (mes actual)',
    'charts.trend': 'Tendencia (últimos 6 meses)',
    'charts.noData': 'Sin datos para mostrar',
    'list.title': 'Movimientos',
    'list.empty': 'No hay movimientos que coincidan.',
    'filter.month': 'Mes',
    'filter.category': 'Categoría',
    'filter.search': 'Buscar',
    'filter.clear': 'Limpiar',
    'filter.all': 'Todas',
    'table.date': 'Fecha',
    'table.category': 'Categoría',
    'table.note': 'Nota',
    'table.amount': 'Monto',
    'table.actions': 'Acciones',
    'table.total': 'Total',
    'table.edit': 'Editar',
    'table.delete': 'Eliminar',
    'cat.title': 'Categorías',
    'cat.name': 'Nombre',
    'cat.parent': 'Categoría padre (opcional)',
    'cat.parentNone': '(ninguna)',
    'cat.hint': 'Crea categorías anidadas, p. ej. casa.aseo',
    'cat.add': 'Agregar categoría',
    'cat.delete': 'Eliminar',
    'cat.errEmpty': 'Escribe un nombre.',
    'cat.errDot': 'El nombre no puede contener puntos.',
    'cat.errExists': 'Esa categoría ya existe.',
    'cat.errInUse': 'No se puede eliminar: tiene gastos o subcategorías.',
    'toast.saved': 'Gasto guardado.',
    'toast.updated': 'Gasto actualizado.',
    'toast.deleted': 'Gasto eliminado.',
    'toast.catAdded': 'Categoría agregada.',
    'toast.catDeleted': 'Categoría eliminada.',
    'toast.exported': 'Datos exportados.',
    'toast.imported': 'Datos importados.',
    'toast.importError': 'Archivo inválido.',
    'toast.cleared': 'Todos los datos fueron borrados.',
    'confirm.delete': '¿Eliminar este gasto?',
    'confirm.clear': '¿Borrar TODOS los datos? Esta acción no se puede deshacer.',
  },
  en: {
    'app.title': 'Personal expenses',
    'app.footer': 'Data is stored only in this browser (localStorage).',
    'summary.month': 'This month',
    'summary.count': 'Entries',
    'summary.avg': 'Daily average',
    'summary.top': 'Top category',
    'form.title': 'New expense',
    'form.titleEdit': 'Edit expense',
    'form.amount': 'Amount',
    'form.category': 'Category',
    'form.manageCategories': 'Manage',
    'form.date': 'Date',
    'form.note': 'Note (optional)',
    'form.save': 'Save',
    'form.cancel': 'Cancel',
    'error.amount': 'Enter a valid amount.',
    'error.category': 'Select a category.',
    'error.date': 'Select a date.',
    'data.export': 'Export',
    'data.import': 'Import',
    'data.clear': 'Clear all',
    'charts.title': 'Analysis',
    'charts.byCategory': 'By category (current month)',
    'charts.trend': 'Trend (last 6 months)',
    'charts.noData': 'No data to display',
    'list.title': 'Entries',
    'list.empty': 'No matching entries.',
    'filter.month': 'Month',
    'filter.category': 'Category',
    'filter.search': 'Search',
    'filter.clear': 'Clear',
    'filter.all': 'All',
    'table.date': 'Date',
    'table.category': 'Category',
    'table.note': 'Note',
    'table.amount': 'Amount',
    'table.actions': 'Actions',
    'table.total': 'Total',
    'table.edit': 'Edit',
    'table.delete': 'Delete',
    'cat.title': 'Categories',
    'cat.name': 'Name',
    'cat.parent': 'Parent category (optional)',
    'cat.parentNone': '(none)',
    'cat.hint': 'Create nested categories, e.g. home.cleaning',
    'cat.add': 'Add category',
    'cat.delete': 'Delete',
    'cat.errEmpty': 'Enter a name.',
    'cat.errDot': 'Name cannot contain dots.',
    'cat.errExists': 'That category already exists.',
    'cat.errInUse': 'Cannot delete: it has expenses or subcategories.',
    'toast.saved': 'Expense saved.',
    'toast.updated': 'Expense updated.',
    'toast.deleted': 'Expense deleted.',
    'toast.catAdded': 'Category added.',
    'toast.catDeleted': 'Category deleted.',
    'toast.exported': 'Data exported.',
    'toast.imported': 'Data imported.',
    'toast.importError': 'Invalid file.',
    'toast.cleared': 'All data was cleared.',
    'confirm.delete': 'Delete this expense?',
    'confirm.clear': 'Clear ALL data? This cannot be undone.',
  },
};

let currentLang = 'es';

export function setLang(lang) {
  currentLang = dictionaries[lang] ? lang : 'es';
  document.documentElement.lang = currentLang;
}

export function getLang() {
  return currentLang;
}

export function t(key) {
  const dict = dictionaries[currentLang] || dictionaries.es;
  return dict[key] || dictionaries.es[key] || key;
}

// Aplica traducciones a todos los elementos con [data-i18n].
export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.setAttribute('placeholder', value);
    } else {
      el.textContent = value;
    }
  });
  document.title = t('app.title');
}

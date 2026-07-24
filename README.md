# Gastos personales

Aplicación web minimalista para registrar y analizar gastos personales. Sin backend: los datos se guardan en el `localStorage` del navegador.

## Características

- Registro de gastos: monto, categoría, fecha y nota.
- Editar y eliminar movimientos.
- **Categorías anidadas** (p. ej. `casa.aseo`) y creación de nuevas categorías.
- Categorías por defecto: comida, transporte, servicio, arriendo.
- Filtros por mes, categoría y búsqueda de texto.
- Resumen: total del mes, número de movimientos, promedio diario y categoría top.
- **Análisis con gráficas** (Chart.js): distribución por categoría del mes y tendencia de los últimos 6 meses.
- **Idioma**: español por defecto con cambio nativo a inglés.
- Tema claro/oscuro y selección de moneda (COP, USD, EUR, MXN).
- Exportar / importar datos en JSON (respaldo local).

## Tecnología

- HTML + CSS
- [Tailwind CSS](https://tailwindcss.com/) vía CDN
- JavaScript vanilla (módulos ES)
- [Chart.js](https://www.chartjs.org/) vía CDN
- Persistencia con `localStorage`

## Uso

Al usar módulos ES, sírvelo desde un servidor HTTP (no `file://`):

```bash
cd gastos-personales
python3 -m http.server 8000
# abre http://localhost:8000
```

## Estructura

```
index.html          # Estructura y layout
css/styles.css      # Estilos complementarios a Tailwind
js/app.js           # Orquestación y eventos
js/storage.js       # Capa de persistencia (localStorage)
js/categories.js    # Modelo de categorías anidadas
js/charts.js        # Gráficas (Chart.js)
js/i18n.js          # Traducciones ES/EN
```

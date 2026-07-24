// Gráficas con Chart.js (cargado por CDN como global `Chart`).
import { t } from './i18n.js';

const PALETTE = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4',
  '#a855f7', '#ec4899', '#84cc16', '#f97316', '#14b8a6',
];

let categoryChart = null;
let trendChart = null;

function gridColor() {
  return document.documentElement.classList.contains('dark')
    ? 'rgba(148,163,184,0.15)'
    : 'rgba(100,116,139,0.15)';
}

function textColor() {
  return document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569';
}

// Doughnut por categoría del mes actual.
export function renderCategoryChart(canvas, labels, values, formatMoney) {
  if (categoryChart) categoryChart.destroy();
  const ctx = canvas.getContext('2d');
  if (!labels.length) {
    categoryChart = null;
    drawEmpty(ctx, canvas);
    return;
  }
  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: PALETTE, borderWidth: 0 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: textColor(), boxWidth: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (c) => `${c.label}: ${formatMoney(c.parsed)}`,
          },
        },
      },
    },
  });
}

// Barras de tendencia mensual.
export function renderTrendChart(canvas, labels, values, formatMoney) {
  if (trendChart) trendChart.destroy();
  const ctx = canvas.getContext('2d');
  if (!values.some((v) => v > 0)) {
    trendChart = null;
    drawEmpty(ctx, canvas);
    return;
  }
  trendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: '#6366f1', borderRadius: 6 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => formatMoney(c.parsed.y) } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor(), font: { size: 11 } } },
        y: {
          grid: { color: gridColor() },
          ticks: { color: textColor(), font: { size: 11 }, maxTicksLimit: 5 },
          beginAtZero: true,
        },
      },
    },
  });
}

function drawEmpty(ctx, canvas) {
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = textColor();
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(t('charts.noData'), width / 2, height / 2);
}

export function refreshChartThemes() {
  [categoryChart, trendChart].forEach((c) => {
    if (!c) return;
    if (c.options.plugins.legend.labels) c.options.plugins.legend.labels.color = textColor();
    if (c.options.scales) {
      c.options.scales.x.ticks.color = textColor();
      c.options.scales.y.ticks.color = textColor();
      c.options.scales.y.grid.color = gridColor();
    }
    c.update();
  });
}

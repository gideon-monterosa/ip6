/**
 * Shared theme constants for chart colors.
 *
 * These hex values mirror the Preline default theme's CSS custom properties
 * (--chart-primary, --chart-1 … --chart-10).
 *
 * ApexCharts does **not** support oklch, so we must pass plain hex strings.
 * If you switch to a different Preline theme, update these values to match
 * the hex fallbacks defined in that theme's CSS file.
 */

/** Primary chart color (maps to --chart-primary / --color-primary-600) */
export const CHART_PRIMARY = '#2563eb';

/** Chart palette – use these for multi-series charts */
export const CHART_COLORS = {
  /** --chart-1  (primary-50)  */  chart1:  '#eff6ff',
  /** --chart-2  (primary-200) */  chart2:  '#bfdbfe',
  /** --chart-3  (primary-400) */  chart3:  '#60a5fa',
  /** --chart-4  (primary-800) */  chart4:  '#1e40af',
  /** --chart-5  (purple-600)  */  chart5:  '#9333ea',
  /** --chart-6  (cyan-400)    */  chart6:  '#22d3ee',
  /** --chart-7  (orange-500)  */  chart7:  '#f97316',
  /** --chart-8  (gray-100)    */  chart8:  '#f3f4f6',
  /** --chart-9  (gray-200)    */  chart9:  '#e5e7eb',
  /** --chart-10 (gray-300)    */  chart10: '#d1d5db',
} as const;

/**
 * Ready-made ordered palette for ApexCharts `colors` option.
 * Covers the most common multi-series needs (primary, accent, warning).
 */
export const CHART_SERIES_PALETTE = [
  CHART_PRIMARY,       // blue-600  – primary series
  CHART_COLORS.chart6, // cyan-400  – secondary series
  CHART_COLORS.chart7, // orange-500 – tertiary / warning
  CHART_COLORS.chart5, // purple-600
  CHART_COLORS.chart3, // blue-400
  CHART_COLORS.chart4, // blue-800
] as const;

/** Grid / axis border color (maps to --chart-colors-grid-border / gray-200) */
export const CHART_GRID_BORDER = '#e5e7eb';

/** Semantic colors for stat indicators */
export const SEMANTIC_COLORS = {
  success: '#16a34a', // green-600
  danger:  '#dc2626', // red-600
} as const;

/** Standardized semantic colors for charts */
export const CHART_SEMANTIC = {
  positive: SEMANTIC_COLORS.success,
  neutral:  '#d1d5db', // gray-300
  negative: '#f97316', // orange-500
  disruption: '#dc2626', // red-600
  muted:    '#60a5fa', // blue-400 (muted blue)
} as const;
